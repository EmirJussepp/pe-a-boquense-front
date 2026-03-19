<template>
  <div class="cobranzas-page">

    <ConfirmModal ref="confirmModal" />

    <header class="page-header">
      <div class="header-left">
        <p class="eyebrow">COBRANZAS</p>
        <h1>{{ pageTitle }}</h1>
        <p class="hero-description">{{ pageDescription }}</p>
      </div>
    </header>

    <div v-if="error" class="error-banner">
      <span class="error-icon">⚠️</span>
      <span class="error-msg">{{ error }}</span>
      <button class="error-close" type="button" @click="error = null">✕</button>
    </div>

    <div class="dashboard-layout">
      <main class="main-column">
        <section class="card filter-card">
          <h3 class="card-subtitle">FILTROS DE BÚSQUEDA</h3>
          <form class="search-form" @submit.prevent="buscarCuotas">

            <!-- Select de cobrador: solo visible para admin -->
            <div v-if="auth.isAdmin" class="field-container">
              <label class="field-label">Cobrador</label>
              <div v-if="loadingCobradores" class="helper-text">Cargando cobradores...</div>
              <select v-else v-model="cobradorSeleccionadoId" class="dark-input">
                <option :value="null">— Todos los cobradores —</option>
                <option v-for="c in cobradores" :key="c.cobradoresId" :value="c.cobradoresId">
                  {{ c.nombre }} ({{ c.zona }})
                </option>
              </select>
            </div>

            <div class="field-container">
              <label class="field-label">DNI o nombre del socio</label>
              <div class="input-action-group">
                <input v-model.trim="filtroBusqueda" type="text" placeholder="Ej. 32123456" class="dark-input" />
                <button type="submit" class="btn-buscar" :disabled="loading">
                  {{ loading ? "..." : "Buscar" }}
                </button>
                <button type="button" class="btn-limpiar" @click="limpiarBusqueda">
                  Limpiar
                </button>
              </div>
            </div>
          </form>
        </section>

        <section class="card table-card">
          <div class="table-card-header">
            <h2>Cuotas encontradas</h2>
            <label v-if="elegibles.length" class="select-all">
              <input type="checkbox" :checked="allSelected" @change="toggleSelectAll($event.target.checked)" />
              <span>Seleccionar todas</span>
            </label>
          </div>

          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>SEL.</th>
                  <th @click="establecerOrden('socioApellido')" class="sortable">
                    SOCIO / DNI
                    <span class="sort-icon">{{ getIconoOrden("socioApellido") }}</span>
                  </th>
                  <th @click="establecerOrden('periodo')" class="sortable">
                    PERÍODO
                    <span class="sort-icon">{{ getIconoOrden("periodo") }}</span>
                  </th>
                  <th @click="establecerOrden('fechaVencimiento')" class="sortable">
                    VENCIMIENTO
                    <span class="sort-icon">{{ getIconoOrden("fechaVencimiento") }}</span>
                  </th>
                  <th @click="establecerOrden('montoAPagar')" class="sortable">
                    MONTO
                    <span class="sort-icon">{{ getIconoOrden("montoAPagar") }}</span>
                  </th>
                  <th>ESTADO</th>
                </tr>
              </thead>

              <tbody>
                <tr v-if="loading" v-for="n in 3" :key="`sk-${n}`" class="skeleton-row">
                  <td colspan="6"></td>
                </tr>

                <tr v-else-if="!buscado">
                  <td colspan="6" class="empty-state">Cargando cuotas...</td>
                </tr>

                <tr v-else-if="cuotasFiltradas.length === 0">
                  <td colspan="6" class="empty-state">No se encontraron cuotas.</td>
                </tr>

                <tr v-else v-for="cuota in cuotasFiltradas" :key="cuota.id"
                  :class="{ 'selected-row': selectedIds.includes(cuota.id) }">
                  <td class="col-check">
                    <input v-model="selectedIds" type="checkbox" :value="cuota.id" :disabled="isPaid(cuota)" />
                  </td>
                  <td>
                    <div class="socio-cell">
                      <span class="socio-name">{{ cuota.socioApellido }}, {{ cuota.socioNombre }}</span>
                      <span class="socio-dni">DNI: {{ cuota.socioDni }}</span>
                    </div>
                  </td>
                  <td>{{ formatPeriodo(cuota.periodo) }}</td>
                  <td>{{ formatFecha(cuota.fechaVencimiento) }}</td>
                  <td class="monto-cell">$ {{ formatMoney(cuota.montoAPagar) }}</td>
                  <td>
                    <span class="badge-estado" :class="estadoClass(cuota.estado)">
                      {{ cuota.estado }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-if="paginacion.totalPages > 1" class="paginador">
              <button class="btn-pag" :disabled="paginacion.page === 1" @click="cambiarPagina(paginacion.page - 1)">‹
                Anterior</button>

              <span class="pag-info">
                Página {{ paginacion.page }} de {{ paginacion.totalPages }}
                <span class="pag-total">({{ paginacion.total }} cuotas)</span>
              </span>

              <button class="btn-pag" :disabled="paginacion.page === paginacion.totalPages"
                @click="cambiarPagina(paginacion.page + 1)">Siguiente ›</button>
            </div>
          </div>
        </section>
      </main>

      <aside class="sidebar-column">
        <section class="card summary-card">
          <h2 class="summary-title">Resumen de Pago</h2>

          <div class="total-adeudado-box">
            <span class="adeudado-label">Total adeudado:</span>
            <span class="adeudado-amount">$ {{ totalAdeudado }}</span>
          </div>

          <div class="payment-method-container">
            <p class="method-label">MÉTODO DE PAGO</p>

            <div v-if="loadingMetodos" class="helper-text">
              Cargando métodos de pago...
            </div>
            <div v-else-if="!metodosPago.length" class="helper-text">
              No hay métodos de pago disponibles.
            </div>
            <div v-else class="method-buttons">
              <button v-for="metodo in metodosPago" :key="metodo.id" type="button" class="btn-method"
                :class="{ active: metodoPagoId === metodo.id }" @click="metodoPagoId = metodo.id">
                <span v-if="metodo.icono" class="method-icon">{{ metodo.icono }}</span>
                {{ metodo.nombre }}
              </button>
            </div>
          </div>

          <div class="checkout-details">
            <div class="detail-row">
              <span>Cuotas seleccionadas:</span>
              <span>{{ selectedIds.length }}</span>
            </div>
            <div class="total-to-pay">
              <span>A pagar:</span>
              <span class="total-val">$ {{ totalSeleccionado }}</span>
            </div>

            <button class="btn-confirmar" :disabled="selectedIds.length === 0 || paying || !metodoPagoId"
              @click="pagarSeleccionadas">
              {{ paying ? "PROCESANDO..." : "CONFIRMAR PAGO" }}
            </button>

            <p class="footer-note">
              Al confirmar, se actualizará el estado de cuenta del socio.
            </p>
          </div>
        </section>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue"
import { useAuthStore } from "../../stores/auth"
import { cuotasService } from "../../services/cuotasService"
import { pagosService } from "../../services/pagosService"
import { metodosPagoService } from "../../services/metodosPagoService"
import { cobradoresService } from "../../services/cobradoresService"
import { useToast } from "../../composables/useToast"
import ConfirmModal from "../../components/ui/ConfirmModal.vue"

const auth = useAuthStore()
const toast = useToast()
const confirmModal = ref(null)

const filtroBusqueda = ref("")
const loading = ref(false)
const loadingMetodos = ref(false)
const loadingCobradores = ref(false)
const paying = ref(false)
const buscado = ref(false)
const cuotas = ref([])
const metodosPago = ref([])
const metodoPagoId = ref(null)
const selectedIds = ref([])
const ordenColumna = ref("fechaVencimiento")
const ordenSentido = ref("asc")
const error = ref(null)

// Cobradores (solo para admin)
const cobradores = ref([])
const cobradorSeleccionadoId = ref(null)

const paginacion = ref({ total: 0, page: 1, pageSize: 20, totalPages: 1 })


const pageTitle = computed(() =>
  auth.isCobrador && !auth.isAdmin ? "Tus cobranzas" : "Gestión de Cuotas"
)

const pageDescription = computed(() =>
  "Consulta y gestiona cuotas desde tu sesión de cobrador."
)

function normalizeCuota(item) {
  return {
    id: Number(item?.cuotaId ?? item?.id ?? 0),
    socioNombre: String(item?.socioNombre ?? ""),
    socioApellido: String(item?.socioApellido ?? ""),
    socioDni: String(item?.socioDni ?? ""),
    periodo: item?.periodo ?? "",
    fechaVencimiento: item?.fechaVencimiento ?? null,
    montoAPagar: Number(item?.montoAPagar ?? 0),
    estado: String(item?.estado ?? ""),
  }
}

function resolveMetodoIcono(nombre) {
  const value = String(nombre || "").toLowerCase()
  if (value.includes("efectivo")) return "💵"
  if (value.includes("transfer")) return "🏦"
  if (value.includes("tarjeta")) return "💳"
  if (value.includes("debito")) return "💳"
  if (value.includes("crédito") || value.includes("credito")) return "💳"
  if (value.includes("mercado pago")) return "💙"
  if (value.includes("qr")) return "📱"
  return "💰"
}

function normalizeMetodoPago(item) {
  const id = Number(item?.metodoPagoId ?? item?.id ?? 0)
  const nombre = String(item?.nombre ?? "")
  return { id, nombre, icono: resolveMetodoIcono(nombre) }
}

const cuotasFiltradas = computed(() => {
  const result = [...cuotas.value]
  result.sort((a, b) => {
    let valorA = a[ordenColumna.value]
    let valorB = b[ordenColumna.value]
    if (typeof valorA === "string") valorA = valorA.toLowerCase()
    if (typeof valorB === "string") valorB = valorB.toLowerCase()
    if (valorA === valorB) return 0
    return ordenSentido.value === "asc"
      ? valorA < valorB ? -1 : 1
      : valorA > valorB ? -1 : 1
  })
  return result
})

const elegibles = computed(() => cuotasFiltradas.value.filter((item) => !isPaid(item)))

const allSelected = computed(() =>
  elegibles.value.length > 0 &&
  elegibles.value.every((item) => selectedIds.value.includes(item.id))
)

const totalSeleccionado = computed(() => {
  const total = cuotas.value
    .filter((item) => selectedIds.value.includes(item.id))
    .reduce((acc, item) => acc + Number(item.montoAPagar || 0), 0)
  return formatMoney(total)
})

const totalAdeudado = computed(() => {
  const total = elegibles.value.reduce((acc, item) => acc + Number(item.montoAPagar || 0), 0)
  return formatMoney(total)
})

// ✅ Resumen legible para el modal de confirmación
const resumenPagoTexto = computed(() => {
  const cantidad = selectedIds.value.length
  const metodo = metodosPago.value.find(m => m.id === metodoPagoId.value)
  const nombreMetodo = metodo?.nombre ?? "método seleccionado"
  return `${cantidad} cuota(s) por $ ${totalSeleccionado.value} via ${nombreMetodo}.`
})

function establecerOrden(columna) {
  if (ordenColumna.value === columna) {
    ordenSentido.value = ordenSentido.value === "asc" ? "desc" : "asc"
    return
  }
  ordenColumna.value = columna
  ordenSentido.value = "asc"
}

function getIconoOrden(columna) {
  if (ordenColumna.value !== columna) return "↕"
  return ordenSentido.value === "asc" ? "↑" : "↓"
}

function isPaid(cuota) {
  return cuota?.estado === "PAGADA" || cuota?.estado === "EXENTA"
}

function formatMoney(value) {
  return new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0))
}

function formatFecha(value) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return new Intl.DateTimeFormat("es-AR").format(date)
}

function formatPeriodo(periodo) {
  const value = String(periodo ?? "")
  return value.length === 6 ? `${value.slice(4, 6)}/${value.slice(0, 4)}` : value
}

function toggleSelectAll(checked) {
  selectedIds.value = checked ? elegibles.value.map((item) => item.id) : []
}

function estadoClass(estado) {
  if (estado === "PAGADA") return "badge-pagada"
  if (estado === "VENCIDA") return "badge-vencida"
  if (estado === "EXENTA") return "badge-exenta"
  return "badge-pendiente"
}

async function cargarMetodosPago() {
  loadingMetodos.value = true
  try {
    const { data } = await metodosPagoService.listar()
    metodosPago.value = Array.isArray(data)
      ? data.map(normalizeMetodoPago).filter((item) => item.id > 0)
      : []
    if (!metodoPagoId.value && metodosPago.value.length) {
      metodoPagoId.value = metodosPago.value[0].id
    }
  } catch {
    metodosPago.value = []
  } finally {
    loadingMetodos.value = false
  }
}

// buscarCuotas — agregás params de paginación y leés data.data
async function buscarCuotas() {
  loading.value = true
  error.value = null
  selectedIds.value = []
  buscado.value = true
  try {
    const termino = filtroBusqueda.value.trim()
    const params = {
      page: paginacion.value.page,
      pageSize: paginacion.value.pageSize,
    }

    if (auth.isCobrador && !auth.isAdmin && auth.cobradorId)
      params.cobradorId = auth.cobradorId
    if (auth.isAdmin && cobradorSeleccionadoId.value)
      params.cobradorId = cobradorSeleccionadoId.value
    if (/^\d+$/.test(termino)) params.dni = termino
    else if (termino) params.search = termino

    const { data } = await cuotasService.listarCobranzas(params)

    cuotas.value = Array.isArray(data.data)
      ? data.data.map(normalizeCuota).filter(item => item.id > 0)
      : []

    paginacion.value = {
      total: data.total,
      page: data.page,
      pageSize: data.pageSize,
      totalPages: data.totalPages,
    }
  } catch {
    error.value = "No se pudieron cargar las cuotas. Intentá de nuevo."
    cuotas.value = []
  } finally {
    loading.value = false
  }
}


// Cambiás página
function cambiarPagina(nuevaPagina) {
  paginacion.value.page = nuevaPagina
  buscarCuotas()
}

async function pagarSeleccionadas() {
  if (!selectedIds.value.length || !metodoPagoId.value) return

  // ✅ Modal de confirmación antes de pagar
  const ok = await confirmModal.value.open({
    icon: "💳",
    title: "Confirmar pago",
    message: `¿Confirmás el pago de ${resumenPagoTexto.value}`,
    confirmLabel: "Confirmar pago",
    variant: "success",
  })
  if (!ok) return

  paying.value = true
  error.value = null

  try {
    await pagosService.pagarMasivo({
      cuotaIds: selectedIds.value,
      metodoPagoId: Number(metodoPagoId.value),
    })
    toast.success(`${selectedIds.value.length} cuota(s) pagada(s) correctamente.`)
    selectedIds.value = []
    await buscarCuotas()
  } catch {
    toast.error("No se pudo procesar el pago. Verificá la conexión e intentá de nuevo.")
    error.value = "No se pudo procesar el pago. Verificá la conexión e intentá de nuevo."
  } finally {
    paying.value = false
  }
}

function limpiarBusqueda() {
  filtroBusqueda.value = ""
  buscarCuotas()
}

let debounceTimer = null
watch(filtroBusqueda, () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => buscarCuotas(), 400)
})
watch(filtroBusqueda, () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    paginacion.value.page = 1
    buscarCuotas()
  }, 400)
})

watch(cobradorSeleccionadoId, () => {
  paginacion.value.page = 1
  buscarCuotas()
})

watch(cobradorSeleccionadoId, () => buscarCuotas())

async function cargarCobradores() {
  if (!auth.isAdmin) return
  loadingCobradores.value = true
  try {
    const { data } = await cobradoresService.listar()
    cobradores.value = Array.isArray(data) ? data : []
  } catch {
    cobradores.value = []
  } finally {
    loadingCobradores.value = false
  }
}

onMounted(async () => {
  await Promise.all([cargarMetodosPago(), cargarCobradores()])
  await buscarCuotas()
})
</script>

<style scoped>
.cobranzas-page {
  background-color: var(--bg);
  min-height: 100vh;
  padding: 20px 40px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 25px;
  gap: 16px;
}

.eyebrow {
  color: var(--accent);
  font-weight: 800;
  font-size: 11px;
  letter-spacing: 1px;
  margin: 0;
}

.page-header h1 {
  font-size: 32px;
  font-weight: 900;
  color: var(--primary);
  margin: 5px 0;
}

.hero-description {
  color: var(--text-muted);
  font-size: 14px;
  margin: 0;
}

.error-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 10px;
  padding: 14px 18px;
  margin-bottom: 20px;
  color: #991b1b;
  font-size: 13px;
  font-weight: 600;
}

.error-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.error-msg {
  flex: 1;
}

.error-close {
  background: none;
  border: none;
  color: #991b1b;
  cursor: pointer;
  font-size: 16px;
  padding: 0 4px;
  flex-shrink: 0;
}

.dashboard-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 350px;
  gap: 20px;
  align-items: start;
}

.card {
  background: white;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  box-shadow: var(--shadow-sm);
}

.card-subtitle {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 15px;
  font-weight: 800;
}

.field-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-soft);
  margin-bottom: 8px;
  display: block;
}

.input-action-group {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  gap: 12px;
}

.dark-input {
  background: #f8fafc;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px;
  color: var(--text-main);
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
}

.btn-buscar {
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0 25px;
  font-weight: 700;
  cursor: pointer;
}

.btn-buscar:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-limpiar {
  background: #f1f5f9;
  border: 1px solid var(--border);
  color: var(--text-soft);
  border-radius: 8px;
  padding: 0 20px;
  font-weight: 600;
  cursor: pointer;
}

.table-card {
  margin-top: 20px;
}

.table-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.table-card-header h2 {
  font-size: 18px;
  color: var(--primary);
  font-weight: 800;
  margin: 0;
}

.select-all {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-soft);
  cursor: pointer;
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  min-width: 760px;
  border-collapse: collapse;
}

.data-table th {
  text-align: left;
  color: var(--text-muted);
  font-size: 11px;
  padding: 12px;
  border-bottom: 2px solid var(--bg);
  background: #f1f5f9;
  font-weight: 800;
  letter-spacing: 0.5px;
}

.data-table td {
  padding: 14px 12px;
  border-bottom: 1px solid var(--bg);
  font-size: 13px;
}

.sortable {
  cursor: pointer;
  user-select: none;
}

.sortable:hover {
  color: var(--primary);
}

.selected-row {
  background-color: rgba(241, 180, 76, 0.05);
}

.socio-name {
  display: block;
  font-weight: 700;
  color: var(--primary);
}

.socio-dni {
  font-size: 11px;
  color: var(--text-muted);
}

.monto-cell {
  font-weight: 800;
  color: var(--text-main);
}

.empty-state {
  text-align: center;
  color: var(--text-muted);
  padding: 40px;
  font-size: 13px;
}

.skeleton-row td {
  height: 52px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

.badge-estado {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 800;
}

.badge-pendiente {
  background: rgba(241, 180, 76, 0.15);
  color: #9c6e1e;
}

.badge-vencida {
  background: #fee2e2;
  color: #991b1b;
}

.badge-pagada {
  background: #dcfce7;
  color: #166534;
}

.badge-exenta {
  background: #f1f5f9;
  color: #64748b;
}

.summary-title {
  font-size: 18px;
  font-weight: 900;
  margin-bottom: 20px;
  color: var(--primary);
}

.total-adeudado-box {
  background: var(--bg);
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 20px;
  border-left: 4px solid var(--accent);
}

.adeudado-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-muted);
  display: block;
  margin-bottom: 4px;
}

.adeudado-amount {
  font-size: 24px;
  font-weight: 900;
  color: var(--text-main);
  display: block;
}

.method-label {
  font-size: 11px;
  font-weight: 800;
  color: var(--text-muted);
  margin-bottom: 10px;
}

.method-buttons {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  margin-bottom: 20px;
}

.btn-method {
  background: white;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-main);
}

.btn-method.active {
  border: 2px solid #003b7a;
  color: #003b7a;
}

.helper-text {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 16px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: var(--text-soft);
  margin-bottom: 8px;
}

.total-to-pay {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 2px dashed var(--border);
  gap: 12px;
}

.total-val {
  font-size: 26px;
  font-weight: 900;
  color: var(--primary);
}

.btn-confirmar {
  width: 100%;
  padding: 16px;
  border-radius: 10px;
  border: none;
  font-weight: 800;
  margin-top: 20px;
  background: #cbd5e1;
  color: #64748b;
  cursor: not-allowed;
  font-size: 14px;
}

.btn-confirmar:not(:disabled) {
  background: var(--accent);
  color: var(--primary);
  cursor: pointer;
}

.footer-note {
  font-size: 11px;
  color: var(--text-muted);
  text-align: center;
  margin-top: 12px;
}

@media (max-width: 1100px) {
  .cobranzas-page {
    padding: 20px 24px;
  }

  .dashboard-layout {
    grid-template-columns: 1fr;
  }

  .sidebar-column {
    order: -1;
  }

  .method-buttons {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .cobranzas-page {
    padding: 16px;
  }

  .page-header h1 {
    font-size: 28px;
  }

  .input-action-group {
    grid-template-columns: 1fr;
  }

  .btn-buscar,
  .btn-limpiar {
    min-height: 44px;
    padding: 0 16px;
  }

  .method-buttons {
    grid-template-columns: 1fr;
  }

  .total-to-pay {
    flex-direction: column;
    align-items: flex-start;
  }




}



.paginador {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 16px 0 4px;
}
.btn-pag {
  background: white;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 8px 16px;
  font-weight: 700;
  cursor: pointer;
  color: var(--primary);
}
.btn-pag:disabled { opacity: 0.4; cursor: not-allowed; }
.pag-info { font-size: 13px; font-weight: 600; color: var(--text-soft); }
.pag-total { color: var(--text-muted); font-weight: 400; }
</style>