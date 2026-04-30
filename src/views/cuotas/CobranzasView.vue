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
      <AlertTriangle class="error-icon" :size="16" />
      <span class="error-msg">{{ error }}</span>
      <button class="error-close" type="button" @click="error = null"><X :size="14" /></button>
    </div>

    <div class="dashboard-layout">
      <main class="main-column">

        <!-- Filtros -->
        <section class="card filter-card">
          <h3 class="card-subtitle">FILTROS DE BÚSQUEDA</h3>
          <form class="search-form" @submit.prevent="buscarCuotas">
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
                <input v-model.trim="filtroBusqueda" type="text" placeholder="Ej. 32123456 o García" class="dark-input" />
                <button type="submit" class="btn-buscar" :disabled="loading">
                  {{ loading ? "..." : "Buscar" }}
                </button>
                <button type="button" class="btn-limpiar" @click="limpiarBusqueda">Limpiar</button>
              </div>
            </div>
          </form>
        </section>

        <!-- Lista de socios -->
        <section class="card table-card">
          <div class="table-card-header">
            <h2>Socios con cuotas</h2>
            <span v-if="sociosConCuotas.length" class="count-badge">{{ sociosConCuotas.length }} socios</span>
          </div>

          <!-- Loading -->
          <div v-if="loading" class="socios-list">
            <div v-for="n in 5" :key="`sk-${n}`" class="skeleton-item">
              <div class="skeleton" style="height:56px;border-radius:8px"></div>
            </div>
          </div>

          <!-- Estado vacío pre-búsqueda -->
          <div v-else-if="!buscado" class="empty-state">
            Realizá una búsqueda para ver socios con cuotas pendientes.
          </div>

          <!-- Sin resultados -->
          <div v-else-if="sociosConCuotas.length === 0" class="empty-state">
            No se encontraron socios con cuotas para esa búsqueda.
          </div>

          <!-- Lista de socios expandibles -->
          <div v-else class="socios-list">
            <div
              v-for="socio in sociosConCuotas"
              :key="socio.socioId"
              class="socio-item"
              :class="{ 'is-open': socioExpandido === socio.socioId }"
            >
              <!-- Fila del socio (clickable) -->
              <button type="button" class="socio-header" @click="toggleSocio(socio.socioId)">
                <div class="socio-info">
                  <span class="socio-name">{{ socio.apellido }}, {{ socio.nombre }}</span>
                  <span class="socio-dni">DNI {{ socio.dni }}</span>
                </div>
                <div class="socio-meta">
                  <span class="cuotas-pill" :class="socio.pendientes.length ? 'pill-warning' : 'pill-ok'">
                    {{ socio.pendientes.length }} pendiente{{ socio.pendientes.length !== 1 ? 's' : '' }}
                  </span>
                  <span class="socio-deuda" :class="{ 'deuda-cero': socio.totalAdeudado === 0 }">
                    $ {{ formatMoney(socio.totalAdeudado) }}
                  </span>
                </div>
                <ChevronDown
                  class="chevron-icon"
                  :class="{ rotated: socioExpandido === socio.socioId }"
                  :size="16"
                />
              </button>

              <!-- Acordeón de cuotas -->
              <div v-if="socioExpandido === socio.socioId" class="cuotas-accordion">
                <table class="cuotas-table">
                  <thead>
                    <tr>
                      <th class="col-check-th"></th>
                      <th>PERÍODO</th>
                      <th>VENCIMIENTO</th>
                      <th>MONTO</th>
                      <th>ESTADO</th>
                      <th class="col-cupon-th"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="cuota in cuotasOrdenadas(socio)"
                      :key="cuota.id"
                      :class="{
                        'selected-row': selectedIds.includes(cuota.id),
                        'paid-row': isPaid(cuota)
                      }"
                    >
                      <td class="col-check">
                        <input
                          v-model="selectedIds"
                          type="checkbox"
                          :value="cuota.id"
                          :disabled="isPaid(cuota)"
                        />
                      </td>
                      <td class="periodo-cell">{{ formatPeriodo(cuota.periodo) }}</td>
                      <td>{{ formatFecha(cuota.fechaVencimiento) }}</td>
                      <td class="monto-cell">$ {{ formatMoney(cuota.montoAPagar) }}</td>
                      <td>
                        <span class="badge-estado" :class="estadoClass(cuota.estado)">
                          {{ cuota.estado }}
                        </span>
                      </td>
                      <td class="col-cupon">
                        <button
                          class="btn-cupon-row"
                          :disabled="descargandoSocio === cuota.socioId"
                          @click.stop="imprimirCuponSocio(cuota)"
                          title="Imprimir cupón"
                        >
                          <Loader v-if="descargandoSocio === cuota.socioId" :size="14" class="cupon-spinner" />
                          <svg v-else class="cupon-row-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17 17H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2z"/>
                            <path d="M7 17v2a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2"/>
                            <line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="13" y2="13"/>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div v-if="socio.pendientes.length" class="accordion-footer">
                  <label class="select-all-label">
                    <input
                      type="checkbox"
                      :checked="allSocioSelected(socio)"
                      @change="toggleSelectSocio(socio, $event.target.checked)"
                    />
                    <span>Seleccionar todas las pendientes de {{ socio.nombre }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <PaginadorComponent :paginacion="paginacion" label="cuotas" @cambiar="cambiarPagina" />
        </section>
      </main>

      <!-- Sidebar de pago -->
      <aside class="sidebar-column">
        <section class="card summary-card">
          <h2 class="summary-title">Resumen de Pago</h2>

          <div class="total-adeudado-box">
            <span class="adeudado-label">Total adeudado (página):</span>
            <span class="adeudado-amount">$ {{ totalAdeudado }}</span>
          </div>

          <div class="payment-method-container">
            <p class="method-label">MÉTODO DE PAGO</p>
            <div v-if="loadingMetodos" class="helper-text">Cargando métodos de pago...</div>
            <div v-else-if="!metodosPago.length" class="helper-text">No hay métodos de pago disponibles.</div>
            <div v-else class="method-buttons">
              <button
                v-for="metodo in metodosPago"
                :key="metodo.id"
                type="button"
                class="btn-method"
                :class="{ active: metodoPagoId === metodo.id }"
                @click="metodoPagoId = metodo.id"
              >
                <component :is="metodo.icono" :size="15" class="method-icon" />
                {{ metodo.nombre }}
              </button>
            </div>
          </div>

          <div class="checkout-details">
            <div class="detail-row">
              <span>Cuotas seleccionadas:</span>
              <strong>{{ selectedIds.length }}</strong>
            </div>
            <div class="total-to-pay">
              <span>A pagar:</span>
              <span class="total-val">$ {{ totalSeleccionado }}</span>
            </div>

            <button
              class="btn-confirmar"
              :disabled="selectedIds.length === 0 || paying || !metodoPagoId"
              @click="pagarSeleccionadas"
            >
              {{ paying ? "PROCESANDO..." : "CONFIRMAR PAGO" }}
            </button>

            <p class="footer-note">Al confirmar, se actualizará el estado de cuenta del socio.</p>
          </div>
        </section>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue"
import { useAuthStore } from "../../stores/auth"
import { cuotasService } from "../../services/cuotasService"
import { pagosService } from "../../services/pagosService"
import { metodosPagoService } from "../../services/metodosPagoService"
import { cobradoresService } from "../../services/cobradoresService"
import { useToast } from "../../composables/useToast"
import ConfirmModal from "../../components/ui/ConfirmModal.vue"
import PaginadorComponent from "../../components/ui/PaginadorComponent.vue"
import { useCuponPrinting } from "../../composables/useCuponPrinting"
import {
  AlertTriangle, X,
  Banknote, Building2, CreditCard, Smartphone, QrCode, Wallet,
  Loader, ChevronDown
} from "lucide-vue-next"

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
const error = ref(null)
const socioExpandido = ref(null)

const cobradores = ref([])
const cobradorSeleccionadoId = ref(null)

const paginacion = ref({ total: 0, page: 1, pageSize: 50, totalPages: 1 })

const descargandoSocio = ref(null)

const { ensureLogoDataUrl, buildCuponHTML, printHTML, wrapCuponesHTML } = useCuponPrinting()

const pageTitle = computed(() =>
  auth.isCobrador && !auth.isAdmin ? "Tus cobranzas" : "Gestión de Cuotas"
)
const pageDescription = computed(() =>
  "Seleccioná un socio para ver y gestionar sus cuotas individualmente."
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
    socioId: Number(item?.socioId ?? 0),
  }
}

function resolveMetodoIcono(nombre) {
  const value = String(nombre || "").toLowerCase()
  if (value.includes("efectivo")) return Banknote
  if (value.includes("transfer")) return Building2
  if (value.includes("tarjeta") || value.includes("debito") || value.includes("crédito") || value.includes("credito")) return CreditCard
  if (value.includes("mercado pago")) return Smartphone
  if (value.includes("qr")) return QrCode
  return Wallet
}

function normalizeMetodoPago(item) {
  const id = Number(item?.metodoPagoId ?? item?.id ?? 0)
  const nombre = String(item?.nombre ?? "")
  return { id, nombre, icono: resolveMetodoIcono(nombre) }
}

// Agrupa cuotas por socio y calcula totales
const sociosConCuotas = computed(() => {
  const map = new Map()
  for (const cuota of cuotas.value) {
    if (!map.has(cuota.socioId)) {
      map.set(cuota.socioId, {
        socioId: cuota.socioId,
        nombre: cuota.socioNombre,
        apellido: cuota.socioApellido,
        dni: cuota.socioDni,
        cuotas: []
      })
    }
    map.get(cuota.socioId).cuotas.push(cuota)
  }
  return [...map.values()]
    .map(s => ({
      ...s,
      pendientes: s.cuotas.filter(c => !isPaid(c)),
      totalAdeudado: s.cuotas
        .filter(c => !isPaid(c))
        .reduce((sum, c) => sum + c.montoAPagar, 0)
    }))
    .sort((a, b) => a.apellido.localeCompare(b.apellido))
})

const elegibles = computed(() => cuotas.value.filter(item => !isPaid(item)))
const totalSeleccionado = computed(() => {
  const total = cuotas.value
    .filter(item => selectedIds.value.includes(item.id))
    .reduce((acc, item) => acc + Number(item.montoAPagar || 0), 0)
  return formatMoney(total)
})
const totalAdeudado = computed(() => {
  const total = elegibles.value.reduce((acc, item) => acc + Number(item.montoAPagar || 0), 0)
  return formatMoney(total)
})
const resumenPagoTexto = computed(() => {
  const cantidad = selectedIds.value.length
  const metodo = metodosPago.value.find(m => m.id === metodoPagoId.value)
  const nombreMetodo = metodo?.nombre ?? "método seleccionado"
  return `${cantidad} cuota(s) por $ ${totalSeleccionado.value} via ${nombreMetodo}.`
})

function toggleSocio(socioId) {
  socioExpandido.value = socioExpandido.value === socioId ? null : socioId
}

function cuotasOrdenadas(socio) {
  return [...socio.cuotas].sort((a, b) => String(a.periodo).localeCompare(String(b.periodo)))
}

function allSocioSelected(socio) {
  return socio.pendientes.length > 0 &&
    socio.pendientes.every(c => selectedIds.value.includes(c.id))
}

function toggleSelectSocio(socio, checked) {
  const ids = socio.pendientes.map(c => c.id)
  if (checked) {
    selectedIds.value = [...new Set([...selectedIds.value, ...ids])]
  } else {
    selectedIds.value = selectedIds.value.filter(id => !ids.includes(id))
  }
}

function isPaid(cuota) { return cuota?.estado === "PAGADA" || cuota?.estado === "EXENTA" }

function formatMoney(value) {
  return new Intl.NumberFormat("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value || 0))
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
    metodosPago.value = Array.isArray(data) ? data.map(normalizeMetodoPago).filter(item => item.id > 0) : []
    if (!metodoPagoId.value && metodosPago.value.length) metodoPagoId.value = metodosPago.value[0].id
  } catch { metodosPago.value = [] } finally { loadingMetodos.value = false }
}

async function buscarCuotas() {
  loading.value = true; error.value = null; selectedIds.value = []; buscado.value = true; socioExpandido.value = null
  try {
    const termino = filtroBusqueda.value.trim()
    const params = { page: paginacion.value.page, pageSize: paginacion.value.pageSize }
    if (auth.isCobrador && !auth.isAdmin && auth.cobradorId) params.cobradorId = auth.cobradorId
    if (auth.isAdmin && cobradorSeleccionadoId.value) params.cobradorId = cobradorSeleccionadoId.value
    if (/^\d+$/.test(termino)) params.dni = termino
    else if (termino) params.search = termino
    const { data } = await cuotasService.listarCobranzas(params)
    cuotas.value = Array.isArray(data.data) ? data.data.map(normalizeCuota).filter(item => item.id > 0) : []
    paginacion.value = { total: data.total, page: data.page, pageSize: data.pageSize, totalPages: data.totalPages }
  } catch {
    error.value = "No se pudieron cargar las cuotas. Intentá de nuevo."
    cuotas.value = []
  } finally { loading.value = false }
}

function cambiarPagina(nuevaPagina) { paginacion.value.page = nuevaPagina; buscarCuotas() }

async function pagarSeleccionadas() {
  if (!selectedIds.value.length || !metodoPagoId.value) return
  const ok = await confirmModal.value.open({
    title: "Confirmar pago",
    message: `¿Confirmás el pago de ${resumenPagoTexto.value}`,
    confirmLabel: "Confirmar pago", variant: "success",
  })
  if (!ok) return
  paying.value = true; error.value = null
  try {
    await pagosService.pagarMasivo({ cuotaIds: selectedIds.value, metodoPagoId: Number(metodoPagoId.value) })
    toast.success(`${selectedIds.value.length} cuota(s) pagada(s) correctamente.`)
    selectedIds.value = []; await buscarCuotas()
  } catch {
    toast.error("No se pudo procesar el pago. Verificá la conexión e intentá de nuevo.")
    error.value = "No se pudo procesar el pago. Verificá la conexión e intentá de nuevo."
  } finally { paying.value = false }
}

async function imprimirCuponSocio(cuota) {
  descargandoSocio.value = cuota.socioId
  try {
    await ensureLogoDataUrl()
    printHTML(wrapCuponesHTML(buildCuponHTML(cuota), `Cupón ${String(cuota.id).padStart(8, '0')}`))
  } catch { toast.error("No se pudo generar el cupón.") }
  finally { descargandoSocio.value = null }
}

function limpiarBusqueda() { filtroBusqueda.value = ""; buscarCuotas() }

let debounceTimer = null
watch(filtroBusqueda, () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => { paginacion.value.page = 1; buscarCuotas() }, 400)
})
watch(cobradorSeleccionadoId, () => { paginacion.value.page = 1; buscarCuotas() })
onBeforeUnmount(() => clearTimeout(debounceTimer))

async function cargarCobradores() {
  if (!auth.isAdmin) return
  loadingCobradores.value = true
  try {
    const { data } = await cobradoresService.listar()
    cobradores.value = Array.isArray(data) ? data : []
  } catch { cobradores.value = [] } finally { loadingCobradores.value = false }
}

onMounted(async () => {
  await Promise.all([cargarMetodosPago(), cargarCobradores()])
  await buscarCuotas()
  ensureLogoDataUrl().catch(() => {})
})
</script>

<style scoped>
.cobranzas-page {
  background-color: var(--bg);
  min-height: 100vh;
  padding: 20px 40px;
  overflow-x: hidden;
  box-sizing: border-box;
  width: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 25px;
  gap: 16px;
  flex-wrap: wrap;
}
.eyebrow { color: var(--accent); font-weight: 800; font-size: 11px; letter-spacing: 1px; margin: 0; }
.page-header h1 { font-size: clamp(1.6rem, 4vw, 2rem); font-weight: 900; color: var(--primary); margin: 5px 0; }
.hero-description { color: var(--text-muted); font-size: 14px; margin: 0; }

.error-banner {
  display: flex; align-items: center; gap: 12px;
  background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px;
  padding: 14px 18px; margin-bottom: 20px; color: #991b1b; font-size: 13px; font-weight: 600;
}
.error-icon { flex-shrink: 0; }
.error-msg { flex: 1; }
.error-close { background: none; border: none; color: #991b1b; cursor: pointer; font-size: 16px; padding: 0 4px; flex-shrink: 0; }

.dashboard-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 20px;
  align-items: start;
  min-width: 0;
  width: 100%;
}
.main-column, .sidebar-column { min-width: 0; width: 100%; box-sizing: border-box; }

.card {
  background: white;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  box-shadow: var(--shadow-sm);
  box-sizing: border-box;
  min-width: 0;
}
.card-subtitle { font-size: 12px; color: var(--text-muted); margin-bottom: 15px; font-weight: 800; }
.field-label { font-size: 13px; font-weight: 600; color: var(--text-soft); margin-bottom: 8px; display: block; }
.field-container { margin-bottom: 14px; }

.input-action-group {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  gap: 10px;
}
.dark-input {
  background: #f8fafc; border: 1px solid var(--border); border-radius: 8px;
  padding: 10px 12px; color: var(--text-main); min-width: 0; width: 100%; box-sizing: border-box;
  font-size: 13px; outline: none; transition: border-color 0.15s;
}
.dark-input:focus { border-color: var(--primary); background: white; }
.btn-buscar {
  background: var(--primary); color: white; border: none; border-radius: 8px;
  padding: 0 20px; font-weight: 700; font-size: 13px; cursor: pointer; white-space: nowrap;
  height: 40px;
}
.btn-buscar:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-limpiar {
  background: #f1f5f9; border: 1px solid var(--border); color: var(--text-soft);
  border-radius: 8px; padding: 0 16px; font-weight: 600; font-size: 13px; cursor: pointer;
  white-space: nowrap; height: 40px;
}
.btn-limpiar:hover { border-color: var(--primary); color: var(--primary); }

/* ── TABLA CARD ── */
.table-card { margin-top: 20px; }
.table-card-header {
  display: flex; justify-content: space-between; align-items: center;
  gap: 12px; margin-bottom: 16px; flex-wrap: wrap;
}
.table-card-header h2 { font-size: 17px; color: var(--primary); font-weight: 800; margin: 0; }
.count-badge {
  background: var(--bg); border: 1px solid var(--border); border-radius: 999px;
  padding: 3px 10px; font-size: 12px; font-weight: 700; color: var(--text-muted);
}

/* ── ESTADO VACÍO ── */
.empty-state {
  padding: 48px 20px; text-align: center; color: var(--text-muted);
  font-size: 13px; display: flex; align-items: center; justify-content: center;
}

/* ── SKELETON ── */
.socios-list { display: flex; flex-direction: column; gap: 8px; }
.skeleton-item { padding: 4px 0; }

/* ── SOCIO ITEM ── */
.socio-item {
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.socio-item.is-open {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(0, 59, 122, 0.07);
}

.socio-header {
  width: 100%;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  text-align: left;
  transition: background 0.12s;
}
.socio-header:hover { background: #f8fafc; }
.socio-item.is-open .socio-header { background: rgba(0, 59, 122, 0.03); }

.socio-info { flex: 1; min-width: 0; }
.socio-name {
  display: block;
  font-weight: 700;
  font-size: 14px;
  color: var(--primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.socio-dni { font-size: 11px; color: var(--text-muted); }

.socio-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.cuotas-pill {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
}
.pill-warning { background: rgba(241, 180, 76, 0.15); color: #9c6e1e; }
.pill-ok { background: rgba(34, 197, 94, 0.12); color: #15803d; }

.socio-deuda {
  font-size: 14px;
  font-weight: 800;
  color: var(--text-main);
  white-space: nowrap;
}
.deuda-cero { color: #15803d; }

.chevron-icon {
  flex-shrink: 0;
  color: var(--text-muted);
  transition: transform 0.2s;
}
.chevron-icon.rotated { transform: rotate(180deg); }

/* ── ACORDEÓN ── */
.cuotas-accordion {
  border-top: 1px solid var(--border);
  background: #fafbfc;
}

.cuotas-table { width: 100%; border-collapse: collapse; }
.cuotas-table th {
  text-align: left;
  color: var(--text-muted);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  padding: 9px 14px;
  background: #f1f5f9;
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}
.cuotas-table td {
  padding: 11px 14px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 13px;
  color: var(--text);
  vertical-align: middle;
}
.cuotas-table tr:last-child td { border-bottom: none; }
.cuotas-table tbody tr:hover td { background: rgba(0, 59, 122, 0.025); }

.col-check-th, .col-cupon-th { width: 36px; text-align: center; }
.col-check { text-align: center; }
.col-cupon { text-align: center; }
.periodo-cell { font-weight: 600; font-family: ui-monospace, monospace; font-size: 12px; }
.monto-cell { font-weight: 800; color: var(--text-main); }

.selected-row td { background: rgba(241, 180, 76, 0.06) !important; }
.paid-row { opacity: 0.55; }

.badge-estado { padding: 3px 9px; border-radius: 6px; font-size: 10px; font-weight: 800; white-space: nowrap; }
.badge-pendiente { background: rgba(241, 180, 76, 0.15); color: #9c6e1e; }
.badge-vencida   { background: #fee2e2; color: #991b1b; }
.badge-pagada    { background: #dcfce7; color: #166534; }
.badge-exenta    { background: #f1f5f9; color: #64748b; }

/* ── CUPÓN ROW ── */
.btn-cupon-row {
  display: inline-flex; align-items: center; justify-content: center;
  width: 32px; height: 32px;
  background: linear-gradient(135deg, #003087 0%, #001f5c 100%);
  border: 1.5px solid #f5c518; border-radius: 8px; cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s, filter 0.15s;
  box-shadow: 0 2px 6px rgba(0,48,135,0.2);
}
.btn-cupon-row:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.1); }
.btn-cupon-row:disabled { opacity: 0.4; cursor: not-allowed; }
.cupon-row-icon { width: 14px; height: 14px; color: #f5c518; flex-shrink: 0; }
.cupon-spinner { flex-shrink: 0; animation: spin 1s linear infinite; color: #f5c518; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── FOOTER ACORDEÓN ── */
.accordion-footer {
  padding: 10px 14px;
  border-top: 1px solid var(--border);
  background: white;
}
.select-all-label {
  display: flex; align-items: center; gap: 8px;
  font-size: 12px; font-weight: 600; color: var(--text-soft);
  cursor: pointer; user-select: none;
}
.select-all-label input { cursor: pointer; }

/* ── SIDEBAR ── */
.summary-card { overflow: hidden; box-sizing: border-box; width: 100%; }
.summary-title { font-size: 17px; font-weight: 900; margin-bottom: 20px; color: var(--primary); }

.total-adeudado-box {
  background: var(--bg); padding: 14px; border-radius: 10px;
  margin-bottom: 20px; border-left: 4px solid var(--accent);
}
.adeudado-label { font-size: 11px; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px; }
.adeudado-amount { font-size: 22px; font-weight: 900; color: var(--text-main); display: block; }

.payment-method-container { margin-bottom: 4px; }
.method-label { font-size: 11px; font-weight: 800; color: var(--text-muted); margin-bottom: 10px; }
.method-buttons { display: grid; grid-template-columns: 1fr; gap: 8px; margin-bottom: 20px; }
.btn-method {
  background: white; border: 1px solid var(--border); border-radius: 10px;
  padding: 10px; display: flex; align-items: center; justify-content: center;
  gap: 8px; cursor: pointer; transition: all 0.15s; font-size: 13px;
  font-weight: 600; color: var(--text-main); width: 100%; box-sizing: border-box;
}
.btn-method:hover { border-color: var(--primary); color: var(--primary); }
.btn-method.active { border: 2px solid var(--primary); color: var(--primary); background: var(--primary-soft); }
.helper-text { font-size: 12px; color: var(--text-muted); margin-bottom: 16px; }

.checkout-details { border-top: 1px solid var(--border); padding-top: 16px; }
.detail-row { display: flex; justify-content: space-between; font-size: 13px; color: var(--text-soft); margin-bottom: 8px; }
.total-to-pay {
  display: flex; justify-content: space-between; align-items: center;
  margin-top: 16px; padding-top: 14px; border-top: 2px dashed var(--border);
  gap: 12px; flex-wrap: wrap;
}
.total-val { font-size: 24px; font-weight: 900; color: var(--primary); }
.btn-confirmar {
  width: 100%; padding: 15px; border-radius: 10px; border: none; font-weight: 800;
  margin-top: 18px; background: #cbd5e1; color: #64748b; cursor: not-allowed;
  font-size: 14px; box-sizing: border-box; transition: background 0.15s;
}
.btn-confirmar:not(:disabled) { background: var(--accent); color: var(--primary); cursor: pointer; }
.footer-note { font-size: 11px; color: var(--text-muted); text-align: center; margin-top: 12px; }

/* ── RESPONSIVO ── */
@media (max-width: 1100px) {
  .cobranzas-page { padding: 20px 24px; }
  .dashboard-layout { grid-template-columns: 1fr; }
  .sidebar-column { order: -1; }
  .method-buttons { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 768px) {
  .cobranzas-page { padding: 16px; }
  .page-header h1 { font-size: 1.6rem; }
  .input-action-group { grid-template-columns: 1fr 1fr; }
  .input-action-group input { grid-column: 1 / -1; }
  .btn-buscar, .btn-limpiar { min-height: 42px; }
  .socio-meta { flex-direction: column; align-items: flex-end; gap: 4px; }
  .total-to-pay { flex-direction: column; align-items: flex-start; }
  .total-val { font-size: 20px; }
  .adeudado-amount { font-size: 18px; }
}

@media (max-width: 480px) {
  .input-action-group { grid-template-columns: 1fr; }
  .method-buttons { grid-template-columns: 1fr; }
  .socio-header { flex-wrap: wrap; }
  .socio-meta { flex-direction: row; width: 100%; justify-content: space-between; }
}
</style>
