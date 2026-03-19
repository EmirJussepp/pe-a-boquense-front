<template>
  <div class="page">
    <section class="page-head card">
      <div class="page-head-copy">
        <p class="eyebrow">Bombonera</p>
        <h1>Viajes</h1>
        <p class="page-subtitle">Organización de viajes a la Bombonera.</p>
      </div>
      <div class="head-actions">
        <button class="btn-secondary" @click="loadViajes" :disabled="loading">
          {{ loading ? "Actualizando..." : "Actualizar" }}
        </button>
        <button class="btn-primary" @click="nuevoViaje">+ Nuevo viaje</button>
      </div>
    </section>

    <!-- Filtros viajes -->
    <section class="filters card">
      <div class="filters-top">
        <div class="field field-grow">
          <label>Buscar viaje</label>
          <input
            v-model="search"
            type="text"
            placeholder="Destino..."
          />
        </div>
        <div class="field field-xs">
          <label>Por página</label>
          <select v-model.number="pageSize">
            <option :value="5">5</option>
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
          </select>
        </div>
        <div class="filters-actions">
          <button class="btn-primary" @click="applyFilters">Buscar</button>
          <button class="btn-secondary" @click="clearFilters" :disabled="!hasActiveFilters">Limpiar</button>
        </div>
      </div>
      <div class="filters-meta">
        <span class="meta-chip">Página <strong>{{ page }}</strong> de <strong>{{ totalPages }}</strong></span>
        <span class="meta-chip">Total: <strong>{{ total }}</strong> viaje(s)</span>
      </div>
    </section>

    <section class="table-wrap card">
      <div class="table-top">
        <h2>Listado <span class="count-badge">{{ rows.length }}</span></h2>
      </div>

      <div v-if="loading" class="skeleton-wrap">
        <div v-for="n in 5" :key="n" class="skeleton-row"></div>
      </div>
      <div v-else-if="!rows.length" class="empty-state">No hay viajes registrados.</div>

      <div v-else class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Destino</th>
              <th>Fecha del Viaje</th>
              <th>Pagos</th>
              <th class="th-actions">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="v in rows" :key="v.viajeBomboneraId">
              <td class="mono">{{ v.viajeBomboneraId }}</td>
              <td><strong>{{ v.destino }}</strong></td>
              <td>{{ formatearFecha(v.fechaViaje) }}</td>
              <td>
                <button class="btn-pagos" @click="verPagos(v)">
                  Ver pagos
                </button>
              </td>
              <td>
                <div class="row-actions">
                  <button class="table-btn" @click="editarViaje(v)">Editar</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginador viajes -->
      <div class="pager">
        <span class="pager-text">Página <strong>{{ page }}</strong> de <strong>{{ totalPages }}</strong></span>
        <div class="pager-btns">
          <button class="btn-secondary" :disabled="loading || page <= 1" @click="goToFirst">«</button>
          <button class="btn-secondary" :disabled="loading || page <= 1" @click="prevPage">‹ Anterior</button>
          <button class="btn-secondary" :disabled="loading || page >= totalPages" @click="nextPage">Siguiente ›</button>
          <button class="btn-secondary" :disabled="loading || page >= totalPages" @click="goToLast">»</button>
        </div>
      </div>
    </section>

    <!-- Modal pagos -->
    <div v-if="modalPagos.abierto" class="modal-overlay" @click.self="cerrarModalPagos">
      <div class="modal-card" style="width: 860px;">
        <div class="modal-header">
          <h3>Pagos — {{ modalPagos.viaje?.destino }}</h3>
          <button class="modal-close" @click="cerrarModalPagos">✕</button>
        </div>

        <!-- Filtros pagos -->
        <div class="modal-filters">
          <div class="field field-grow">
            <input
              v-model="modalPagos.search"
              type="text"
              placeholder="Buscar por nombre, apellido o DNI..."
              @keyup.enter="applyModalFilters"
            />
          </div>
          <div class="field field-xs">
            <select v-model.number="modalPagos.pageSize" @change="applyModalFilters">
              <option :value="5">5</option>
              <option :value="10">10</option>
              <option :value="20">20</option>
              <option :value="50">50</option>
            </select>
          </div>
          <button class="btn-primary" @click="applyModalFilters">Buscar</button>
        </div>
        <div class="modal-meta">
          <span class="meta-chip">Página <strong>{{ modalPagos.page }}</strong> de <strong>{{ modalPagos.totalPages }}</strong></span>
          <span class="meta-chip">Total: <strong>{{ modalPagos.total }}</strong> pago(s)</span>
        </div>

        <div v-if="modalPagos.loading" class="skeleton-wrap" style="padding: 12px 20px;">
          <div v-for="n in 4" :key="n" class="skeleton-row"></div>
        </div>
        <div v-else-if="!modalPagos.pagos.length" class="empty-state" style="padding: 20px;">Sin pagos registrados.</div>

        <div v-else class="table-scroll">
          <table class="data-table">
            <thead>
              <tr>
                <th>Pasajero</th>
                <th>DNI</th>
                <th>Método</th>
                <th>Cobrador</th>
                <th>Monto</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in modalPagos.pagos" :key="p.viajePagoId">
                <td>{{ nombreCompletoPago(p) }}</td>
                <td>{{ p.dni || "—" }}</td>
                <td>{{ metodoNombre(p.metodoPagoId) }}</td>
                <td>{{ cobradorNombre(p.cobradorId) }}</td>
                <td>$ {{ formatoMoneda(p.monto) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Paginador pagos -->
        <div class="modal-pager">
          <div class="pager-btns">
            <button class="btn-secondary btn-sm" :disabled="modalPagos.loading || modalPagos.page <= 1" @click="modalPrevPage">‹</button>
            <button class="btn-secondary btn-sm" :disabled="modalPagos.loading || modalPagos.page >= modalPagos.totalPages" @click="modalNextPage">›</button>
          </div>
        </div>

        <div class="modal-footer" style="display:flex; justify-content:space-between; align-items:center;">
          <span class="muted">Total página: <strong>$ {{ totalPagosPagina }}</strong></span>
          <button class="btn-primary" @click="nuevoPago(modalPagos.viaje)">+ Registrar pago</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue"
import { useRouter } from "vue-router"
import { viajesBomboneraService } from "../../services/viajesBomboneraService"
import { viajesPagosService } from "../../services/viajesPagosService"
import { metodosPagoService } from "../../services/metodosPagoService"
import { cobradoresService } from "../../services/cobradoresService"
import { useToast } from "../../composables/useToast"

const router = useRouter()
const toast = useToast()

// ── Viajes ──────────────────────────────────────────────────────────────────
const loading = ref(false)
const rows = ref([])
const search = ref("")
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const totalPages = ref(1)

const hasActiveFilters = computed(() => !!search.value.trim() || pageSize.value !== 10)

// ── Catálogos ────────────────────────────────────────────────────────────────
const metodosPago = ref([])
const cobradores = ref([])

// ── Modal pagos ──────────────────────────────────────────────────────────────
const modalPagos = reactive({
  abierto: false,
  loading: false,
  viaje: null,
  pagos: [],
  search: "",
  page: 1,
  pageSize: 10,
  total: 0,
  totalPages: 1,
})

const totalPagosPagina = computed(() =>
  formatoMoneda(modalPagos.pagos.reduce((acc, p) => acc + Number(p.monto || 0), 0))
)

// ── Catálogos ────────────────────────────────────────────────────────────────
async function loadCatalogos() {
  try {
    const [metodosRes, cobradoresRes] = await Promise.all([
      metodosPagoService.listar(),
      cobradoresService.listar(),
    ])
    metodosPago.value = Array.isArray(metodosRes.data) ? metodosRes.data : []
    cobradores.value = Array.isArray(cobradoresRes.data) ? cobradoresRes.data : []
  } catch {
    toast.error("No se pudieron cargar métodos de pago o cobradores.")
  }
}

// ── Viajes ────────────────────────────────────────────────────────────────────
function normalizePage(data) {
  return {
    data: Array.isArray(data?.data) ? data.data : [],
    total: Number(data?.total ?? 0),
    page: Number(data?.page ?? 1),
    pageSize: Number(data?.pageSize ?? 10),
    totalPages: Number(data?.totalPages ?? 1),
  }
}

async function loadViajes() {
  loading.value = true
  try {
    const { data } = await viajesBomboneraService.listar({
      page: page.value,
      pageSize: pageSize.value,
      search: search.value.trim() || undefined,
    })
    const parsed = normalizePage(data)
    rows.value = parsed.data
    total.value = parsed.total
    totalPages.value = Math.max(parsed.totalPages, 1)
    page.value = Math.max(parsed.page, 1)
  } catch {
    toast.error("Error al cargar los viajes.")
  } finally {
    loading.value = false
  }
}

function applyFilters() { page.value = 1; loadViajes() }
function clearFilters() { search.value = ""; pageSize.value = 10; page.value = 1; loadViajes() }
function prevPage() { if (page.value > 1) { page.value--; loadViajes() } }
function nextPage() { if (page.value < totalPages.value) { page.value++; loadViajes() } }
function goToFirst() { if (page.value !== 1) { page.value = 1; loadViajes() } }
function goToLast() { if (page.value !== totalPages.value) { page.value = totalPages.value; loadViajes() } }

// ── Modal pagos ───────────────────────────────────────────────────────────────
async function loadPagos() {
  if (!modalPagos.viaje) return
  modalPagos.loading = true
  try {
    const { data } = await viajesPagosService.listarPorViaje(
      modalPagos.viaje.viajeBomboneraId,
      {
        page: modalPagos.page,
        pageSize: modalPagos.pageSize,
        search: modalPagos.search.trim() || undefined,
      }
    )
    const parsed = normalizePage(data)
    modalPagos.pagos = parsed.data
    modalPagos.total = parsed.total
    modalPagos.totalPages = Math.max(parsed.totalPages, 1)
    modalPagos.page = Math.max(parsed.page, 1)
  } catch {
    toast.error("No se pudieron cargar los pagos.")
  } finally {
    modalPagos.loading = false
  }
}

async function verPagos(viaje) {
  modalPagos.viaje = viaje
  modalPagos.abierto = true
  modalPagos.page = 1
  modalPagos.search = ""
  await loadPagos()
}

function cerrarModalPagos() {
  modalPagos.abierto = false
  modalPagos.viaje = null
  modalPagos.pagos = []
  modalPagos.search = ""
  modalPagos.page = 1
  modalPagos.total = 0
  modalPagos.totalPages = 1
}

function applyModalFilters() { modalPagos.page = 1; loadPagos() }
function modalPrevPage() { if (modalPagos.page > 1) { modalPagos.page--; loadPagos() } }
function modalNextPage() { if (modalPagos.page < modalPagos.totalPages) { modalPagos.page++; loadPagos() } }

// ── Helpers ───────────────────────────────────────────────────────────────────
function metodoNombre(id) {
  const item = metodosPago.value.find(m => Number(m.metodoPagoId) === Number(id))
  return item?.nombre || `#${id}`
}

function cobradorNombre(id) {
  const item = cobradores.value.find(c =>
    Number(c.cobradorId ?? c.cobradoresId ?? c.id) === Number(id)
  )
  return item?.nombre || `#${id}`
}

function nombreCompletoPago(p) {
  const apellido = String(p?.apellido ?? "").trim()
  const nombre = String(p?.nombre ?? "").trim()
  if (apellido && nombre) return `${apellido}, ${nombre}`
  if (nombre) return nombre
  if (apellido) return apellido
  return "—"
}

function nuevoViaje() { router.push("/viajes/nuevo") }
function editarViaje(v) { router.push(`/viajes/${v.viajeBomboneraId}/editar`) }
function nuevoPago(v) { router.push(`/viajes/${v.viajeBomboneraId}/pago`) }

function formatearFecha(f) {
  if (!f) return "—"
  // Si no tiene timezone, lo tomamos como local directo sin conversión UTC
  const normalized = /Z$|[+-]\d{2}:\d{2}$/.test(f) ? f : f.replace("T", "T")
  const d = /Z$|[+-]\d{2}:\d{2}$/.test(f) ? new Date(f) : new Date(f + "Z") // forzar UTC off si no tiene TZ
  // Tratamos la fecha del backend como local (viene sin offset)
  const parts = f.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/)
  if (parts) {
    const [, y, mo, d2, h, mi] = parts
    const local = new Date(+y, +mo - 1, +d2, +h, +mi)
    return new Intl.DateTimeFormat("es-AR", { dateStyle: "medium", timeStyle: "short" }).format(local)
  }
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(f))
}

function formatoMoneda(n) {
  return Number(n || 0).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

// ── Watchers ──────────────────────────────────────────────────────────────────
watch(pageSize, () => { page.value = 1; loadViajes() })

let debounceTimer = null
watch(() => search.value, () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => { page.value = 1; loadViajes() }, 400)
})

let modalDebounce = null
watch(() => modalPagos.search, () => {
  clearTimeout(modalDebounce)
  modalDebounce = setTimeout(() => { modalPagos.page = 1; loadPagos() }, 400)
})

// ── Init ──────────────────────────────────────────────────────────────────────
onMounted(async () => {
  await Promise.all([loadViajes(), loadCatalogos()])

  // Si volvemos desde el form de pago, reabrimos el modal del viaje
  const viajeIdQuery = Number(router.currentRoute.value.query?.viajeId)
  if (viajeIdQuery > 0) {
    const target = rows.value.find(v => v.viajeBomboneraId === viajeIdQuery)
    if (target) verPagos(target)
    router.replace({ path: "/viajes" })
  }
})
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 16px; }
.page-head { padding: 22px; display: flex; justify-content: space-between; align-items: center; gap: 16px; }
.eyebrow { margin: 0 0 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--accent); font-weight: 800; }
.page-head h1 { margin: 0 0 4px; font-size: 2rem; font-weight: 900; color: var(--primary); }
.page-subtitle { margin: 0; color: var(--text-muted); font-size: 14px; }
.head-actions { display: flex; gap: 10px; }
.filters { padding: 20px; display: flex; flex-direction: column; gap: 12px; }
.filters-top { display: grid; grid-template-columns: 1fr 130px auto; gap: 12px; align-items: end; }
.filters-actions { display: flex; gap: 8px; }
.filters-meta { display: flex; gap: 12px; flex-wrap: wrap; }
.meta-chip { background: var(--bg); border: 1px solid var(--border); border-radius: 20px; padding: 4px 12px; font-size: 12px; color: var(--text-muted); }
.meta-chip strong { color: var(--primary); }
.table-wrap { padding: 22px; }
.table-top { display: flex; align-items: center; gap: 10px; margin-bottom: 18px; }
.table-top h2 { margin: 0; font-size: 18px; font-weight: 800; color: var(--primary); display: flex; align-items: center; gap: 8px; }
.count-badge { background: var(--bg); border: 1px solid var(--border); border-radius: 20px; padding: 2px 10px; font-size: 12px; font-weight: 700; color: var(--text-muted); }
.table-scroll { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { text-align: left; padding: 10px 14px; font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.6px; font-weight: 800; background: #f8fafc; border-bottom: 2px solid var(--border); }
.data-table td { padding: 14px; border-bottom: 1px solid var(--bg); vertical-align: middle; font-size: 13px; }
.data-table tbody tr:hover { background: rgba(0,59,122,0.02); }
.mono { font-family: monospace; font-size: 12px; color: var(--text-soft); }
.th-actions { text-align: center; }
.row-actions { display: flex; gap: 6px; justify-content: center; }
.pager { margin-top: 18px; display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
.pager-text { font-size: 13px; color: var(--text-muted); }
.pager-text strong { color: var(--primary); }
.pager-btns { display: flex; gap: 8px; }
.skeleton-wrap { display: flex; flex-direction: column; gap: 1px; }
.skeleton-row { height: 52px; background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%); background-size: 200% 100%; animation: shimmer 1.2s infinite; border-radius: 4px; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
.empty-state { min-height: 120px; display: grid; place-items: center; color: var(--text-muted); font-size: 14px; }
.btn-pagos { background: var(--primary-soft); color: var(--primary); border: 1px solid var(--border-strong); border-radius: 6px; padding: 5px 12px; font-size: 12px; font-weight: 700; cursor: pointer; }
.btn-pagos:hover { background: var(--primary); color: white; }
/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.45); display: flex; align-items: center; justify-content: center; z-index: 999; padding: 20px; }
.modal-card { background: var(--card-bg, white); border-radius: 14px; box-shadow: 0 20px 60px rgba(0,0,0,.25); display: flex; flex-direction: column; max-height: 90vh; overflow: hidden; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px 16px; border-bottom: 1px solid var(--border); }
.modal-header h3 { margin: 0; font-size: 18px; font-weight: 800; color: var(--primary); }
.modal-close { background: none; border: none; font-size: 18px; cursor: pointer; color: var(--text-muted); padding: 4px 8px; border-radius: 6px; }
.modal-close:hover { background: var(--bg); }
.modal-filters { display: flex; gap: 10px; align-items: end; padding: 14px 20px 0; }
.modal-meta { display: flex; gap: 10px; padding: 10px 20px 0; }
.modal-pager { display: flex; justify-content: center; padding: 10px 20px 0; }
.modal-footer { padding: 16px 24px; border-top: 1px solid var(--border); }
.btn-sm { padding: 5px 12px; font-size: 12px; }
@media (max-width: 640px) {
  .filters-top { grid-template-columns: 1fr; }
  .pager { flex-direction: column; }
  .modal-filters { flex-direction: column; }
}
</style>