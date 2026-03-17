<template>
  <div class="cobranzas-page">
    <header class="page-header">
      <div class="header-left">
        <p class="eyebrow">COBRANZAS</p>
        <h1>{{ pageTitle }}</h1>
        <p class="hero-description">{{ pageDescription }}</p>
      </div>
    </header>

    <!-- ERROR BANNER -->
    <div v-if="error" class="error-banner">
      <span class="error-icon">⚠️</span>
      <span class="error-msg">{{ error }}</span>
      <button class="error-close" @click="error = null">✕</button>
    </div>

    <!-- TOAST -->
    <transition name="toast">
      <div v-if="toast" class="toast">{{ toast }}</div>
    </transition>

    <div class="dashboard-layout">
      <main class="main-column">
        <section class="card filter-card">
          <h3 class="card-subtitle">FILTROS DE BÚSQUEDA</h3>
          <form class="search-form" @submit.prevent="buscarCuotas">
            <div class="field-container">
              <label class="field-label">DNI o Nombre del Socio</label>
              <div class="input-action-group">
                <input
                  v-model="filtroBusqueda"
                  type="text"
                  placeholder="Ej. 32123456"
                  class="dark-input"
                />
                <button type="submit" class="btn-buscar" :disabled="loading">
                  {{ loading ? '...' : 'Buscar' }}
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
              <input type="checkbox" :checked="allSelected" @change="toggleSelectAll($event.target.checked)"/>
              <span>Seleccionar todas</span>
            </label>
          </div>

          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>SEL.</th>
                  <th @click="establecerOrden('socioApellido')" class="sortable">
                    SOCIO / DNI <span class="sort-icon">{{ getIconoOrden('socioApellido') }}</span>
                  </th>
                  <th @click="establecerOrden('periodo')" class="sortable">
                    PERIODO <span class="sort-icon">{{ getIconoOrden('periodo') }}</span>
                  </th>
                  <th @click="establecerOrden('fechaVencimiento')" class="sortable">
                    VENCIMIENTO <span class="sort-icon">{{ getIconoOrden('fechaVencimiento') }}</span>
                  </th>
                  <th @click="establecerOrden('montoAPagar')" class="sortable">
                    MONTO <span class="sort-icon">{{ getIconoOrden('montoAPagar') }}</span>
                  </th>
                  <th>ESTADO</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="loading" v-for="n in 3" :key="'sk'+n" class="skeleton-row">
                  <td colspan="6"></td>
                </tr>
                <tr v-else-if="!loading && cuotasFiltradas.length === 0">
                  <td colspan="6" class="empty-state">No se encontraron cuotas.</td>
                </tr>
                <tr
                  v-else
                  v-for="cuota in cuotasFiltradas"
                  :key="cuota.cuotaId"
                  :class="{ 'selected-row': selectedIds.includes(cuota.cuotaId) }"
                >
                  <td class="col-check">
                    <input type="checkbox" v-model="selectedIds" :value="cuota.cuotaId" :disabled="isPaid(cuota)"/>
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
                    <span class="badge-estado" :class="estadoClass(cuota.estado)">{{ cuota.estado }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <aside class="sidebar-column">
        <section class="card summary-card">
          <h2 class="summary-title">Resumen de Pago</h2>

          <div class="total-adeudado-box">
            <span class="adeudado-label">Total Adeudado:</span>
            <span class="adeudado-amount">$ {{ totalAdeudado }}</span>
          </div>

          <div class="payment-method-container">
            <p class="method-label">MÉTODO DE PAGO</p>
            <div class="method-buttons">
              <button
                class="btn-method"
                :class="{ 'active': metodoPagoId === 1 }"
                @click="metodoPagoId = 1"
              >
                <span class="method-icon">💵</span>
                Efectivo
              </button>
              <button
                class="btn-method"
                :class="{ 'active': metodoPagoId === 2 }"
                @click="metodoPagoId = 2"
              >
                <span class="method-icon">💳</span>
                Transferencia
              </button>
            </div>
          </div>

          <div class="checkout-details">
            <div class="detail-row">
              <span>Cuotas Seleccionadas:</span>
              <span>{{ selectedIds.length }}</span>
            </div>
            <div class="total-to-pay">
              <span>A Pagar:</span>
              <span class="total-val">$ {{ totalSeleccionado }}</span>
            </div>

            <button
              class="btn-confirmar"
              :disabled="selectedIds.length === 0 || paying"
              @click="pagarSeleccionadas"
            >
              {{ paying ? 'PROCESANDO...' : 'CONFIRMAR PAGO' }}
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
import { computed, onMounted, ref } from "vue"
import { useAuthStore } from "../../stores/auth"
import { cuotasService } from "../../services/cuotasService"
import { pagosService } from "../../services/pagosService"

const auth = useAuthStore()

// Estado
const filtroBusqueda = ref("")
const loading = ref(false)
const paying = ref(false)
const cuotas = ref([])
const metodoPagoId = ref(1)
const selectedIds = ref([])
const ordenColumna = ref("fechaVencimiento")
const ordenSentido = ref("asc")
const error = ref(null)
const toast = ref(null)

// Computadas
const pageTitle = computed(() => (auth.isCobrador && !auth.isAdmin) ? "Tus cobranzas" : "Gestión de Cuotas")
const pageDescription = computed(() => "Consulta y gestiona cuotas desde tu sesión de cobrador.")

const cuotasFiltradas = computed(() => {
  let result = [...cuotas.value]
  if (filtroBusqueda.value.trim()) {
    const term = filtroBusqueda.value.toLowerCase()
    result = result.filter(c =>
      c.socioDni.includes(term) ||
      c.socioNombre.toLowerCase().includes(term) ||
      c.socioApellido.toLowerCase().includes(term)
    )
  }
  result.sort((a, b) => {
    let vA = a[ordenColumna.value], vB = b[ordenColumna.value]
    if (typeof vA === "string") { vA = vA.toLowerCase(); vB = vB.toLowerCase() }
    return ordenSentido.value === "asc" ? (vA < vB ? -1 : 1) : (vA > vB ? -1 : 1)
  })
  return result
})

const elegibles = computed(() => cuotasFiltradas.value.filter(c => !isPaid(c)))
const allSelected = computed(() =>
  elegibles.value.length > 0 && elegibles.value.every(c => selectedIds.value.includes(c.cuotaId))
)
const totalSeleccionado = computed(() =>
  formatMoney(cuotas.value.filter(c => selectedIds.value.includes(c.cuotaId)).reduce((acc, c) => acc + Number(c.montoAPagar || 0), 0))
)
const totalAdeudado = computed(() =>
  formatMoney(cuotas.value.reduce((acc, c) => acc + Number(c.montoAPagar || 0), 0))
)

// Helpers
function establecerOrden(col) {
  if (ordenColumna.value === col) ordenSentido.value = ordenSentido.value === "asc" ? "desc" : "asc"
  else { ordenColumna.value = col; ordenSentido.value = "asc" }
}
function getIconoOrden(col) {
  if (ordenColumna.value !== col) return "↕"
  return ordenSentido.value === "asc" ? "↑" : "↓"
}
function isPaid(c) { return c?.estado === "PAGADA" || c?.estado === "EXENTA" }
function formatMoney(v) { return new Intl.NumberFormat("es-AR", { minimumFractionDigits: 2 }).format(Number(v || 0)) }
function formatFecha(v) { return v ? new Intl.DateTimeFormat("es-AR").format(new Date(v)) : "—" }
function formatPeriodo(p) { const s = String(p); return s.length === 6 ? `${s.slice(4, 6)}/${s.slice(0, 4)}` : s }
function toggleSelectAll(checked) { selectedIds.value = checked ? elegibles.value.map(c => c.cuotaId) : [] }
function estadoClass(estado) {
  if (estado === "PAGADA") return "badge-pagada"
  if (estado === "VENCIDA") return "badge-vencida"
  if (estado === "EXENTA") return "badge-exenta"
  return "badge-pendiente"
}
function mostrarToast(msg) {
  toast.value = msg
  setTimeout(() => { toast.value = null }, 3000)
}

// Acciones
async function buscarCuotas() {
  loading.value = true
  error.value = null
  try {
    const params = {}
    if (/^\d+$/.test(filtroBusqueda.value.trim())) params.dni = filtroBusqueda.value.trim()
    const { data } = await cuotasService.listarCobranzas(params)
    cuotas.value = (data || []).map(c => ({ ...c, montoAPagar: Number(c.montoAPagar || 0) }))
  } catch (e) {
    error.value = "No se pudieron cargar las cuotas. Intentá de nuevo."
    cuotas.value = []
  } finally {
    loading.value = false
  }
}

async function pagarSeleccionadas() {
  if (!selectedIds.value.length) return
  paying.value = true
  error.value = null
  try {
    await pagosService.pagarMasivo({ cuotaIds: selectedIds.value, metodoPagoId: Number(metodoPagoId.value) })
    mostrarToast(`✅ ${selectedIds.value.length} cuota(s) pagada(s) correctamente.`)
    selectedIds.value = []
    await buscarCuotas()
  } catch (e) {
    error.value = "No se pudo procesar el pago. Verificá la conexión e intentá de nuevo."
  } finally {
    paying.value = false
  }
}

function limpiarBusqueda() { filtroBusqueda.value = ""; buscarCuotas() }

onMounted(() => buscarCuotas())
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
}
.eyebrow { color: var(--accent); font-weight: 800; font-size: 11px; letter-spacing: 1px; margin: 0; }
.page-header h1 { font-size: 32px; font-weight: 900; color: var(--primary); margin: 5px 0; }
.hero-description { color: var(--text-muted); font-size: 14px; }

/* ERROR BANNER */
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
.error-icon { font-size: 16px; flex-shrink: 0; }
.error-msg { flex: 1; }
.error-close {
  background: none;
  border: none;
  color: #991b1b;
  cursor: pointer;
  font-size: 16px;
  padding: 0 4px;
  flex-shrink: 0;
}

/* TOAST */
.toast {
  position: fixed;
  bottom: 30px;
  right: 30px;
  background: var(--primary);
  color: white;
  padding: 12px 22px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  z-index: 9999;
}
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(10px); }

/* LAYOUT */
.dashboard-layout {
  display: grid;
  grid-template-columns: 1fr 350px;
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

.card-subtitle { font-size: 12px; color: var(--text-muted); margin-bottom: 15px; font-weight: 800; }
.field-label { font-size: 13px; font-weight: 600; color: var(--text-soft); margin-bottom: 8px; display: block; }
.input-action-group { display: flex; gap: 12px; }

.dark-input {
  background: #f8fafc;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px;
  color: var(--text-main);
  flex: 1;
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
.btn-buscar:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-limpiar {
  background: #f1f5f9;
  border: 1px solid var(--border);
  color: var(--text-soft);
  border-radius: 8px;
  padding: 0 20px;
  font-weight: 600;
  cursor: pointer;
}

/* TABLA */
.table-card { margin-top: 20px; }
.table-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.table-card-header h2 { font-size: 18px; color: var(--primary); font-weight: 800; }

.select-all { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: var(--text-soft); cursor: pointer; }

.data-table { width: 100%; border-collapse: collapse; }
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
.data-table td { padding: 14px 12px; border-bottom: 1px solid var(--bg); font-size: 13px; }
.sortable { cursor: pointer; user-select: none; }
.sortable:hover { color: var(--primary); }
.selected-row { background-color: rgba(241, 180, 76, 0.05); }

.socio-name { display: block; font-weight: 700; color: var(--primary); }
.socio-dni { font-size: 11px; color: var(--text-muted); }
.monto-cell { font-weight: 800; color: var(--text-main); }
.empty-state { text-align: center; color: var(--text-muted); padding: 40px; font-size: 13px; }

/* SKELETON */
.skeleton-row td {
  height: 52px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite;
}
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* BADGES */
.badge-estado {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 800;
}
.badge-pendiente { background: rgba(241, 180, 76, 0.15); color: #9c6e1e; }
.badge-vencida   { background: #fee2e2; color: #991b1b; }
.badge-pagada    { background: #dcfce7; color: #166534; }
.badge-exenta    { background: #f1f5f9; color: #64748b; }

/* SIDEBAR */
.summary-title { font-size: 18px; font-weight: 900; margin-bottom: 20px; color: var(--primary); }
.total-adeudado-box {
  background: var(--bg);
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 20px;
  border-left: 4px solid var(--accent);
}
.adeudado-label { font-size: 12px; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px; }
.adeudado-amount { font-size: 24px; font-weight: 900; color: var(--text-main); display: block; }

.method-label { font-size: 11px; font-weight: 800; color: var(--text-muted); margin-bottom: 10px; }
.method-buttons { display: flex; gap: 12px; margin-bottom: 20px; }
.btn-method {
  flex: 1;
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

.detail-row { display: flex; justify-content: space-between; font-size: 13px; color: var(--text-soft); margin-bottom: 8px; }
.total-to-pay {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 2px dashed var(--border);
}
.total-val { font-size: 26px; font-weight: 900; color: var(--primary); }

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

.footer-note { font-size: 11px; color: var(--text-muted); text-align: center; margin-top: 12px; }
</style>