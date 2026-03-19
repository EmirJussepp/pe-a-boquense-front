<template>
  <div class="page">
    <section class="page-head card">
      <div class="page-head-copy">
        <p class="eyebrow">Bombonera</p>
        <h1>Detalle del viaje</h1>
        <p class="page-subtitle" v-if="viaje">
          {{ viaje.destino }} — {{ formatearFecha(viaje.fechaViaje) }}
        </p>
        <p class="page-subtitle" v-else>
          Información general, pagos y resumen del viaje.
        </p>
      </div>

      <div class="head-actions">
        <button class="btn-secondary" @click="volver">Volver</button>
        <button v-if="viaje" class="btn-secondary" @click="editarViaje">✏️ Editar</button>
        <button v-if="viaje" class="btn-primary" @click="nuevoPago">+ Registrar pago</button>
      </div>
    </section>

    <div v-if="loadingData" class="card loading-card">
      <div class="skeleton-wrap">
        <div v-for="n in 4" :key="n" class="skeleton-row"></div>
      </div>
    </div>

    <template v-else-if="viaje">
      <section class="stats-grid">
        <article class="stat-card card">
          <p class="stat-label">Destino</p>
          <p class="stat-value stat-text">{{ viaje.destino || "—" }}</p>
        </article>
        <article class="stat-card card">
          <p class="stat-label">Fecha del viaje</p>
          <p class="stat-value stat-text">{{ formatearFecha(viaje.fechaViaje) }}</p>
        </article>
        <article class="stat-card card">
          <p class="stat-label">Pagos registrados</p>
          <p class="stat-value">{{ totalPagos }}</p>
        </article>
        <article class="stat-card card">
          <p class="stat-label">Recaudado total</p>
          <p class="stat-value">$ {{ formatoMoneda(totalRecaudado) }}</p>
        </article>
      </section>

      <section class="filters card">
        <div class="filters-top">
          <div class="field field-grow">
            <label>Buscar pago</label>
            <input
              v-model="search"
              type="text"
              placeholder="Nombre, apellido o DNI..."
              @keyup.enter="applyFilters"
            />
          </div>
          <div class="field field-sm">
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
          <span class="meta-chip">Total <strong>{{ total }}</strong> pago(s)</span>
          <span class="meta-chip" v-if="search.trim()">Búsqueda: <strong>{{ search.trim() }}</strong></span>
        </div>
      </section>

      <section class="table-wrap card">
        <div class="table-top">
          <h2>Pagos del viaje</h2>
          <div class="table-top-meta">
            <span class="count-badge">{{ rows.length }}</span>
            <p class="table-status">{{ tableStatusText }}</p>
          </div>
        </div>

        <div v-if="loadingPagos" class="skeleton-wrap">
          <div v-for="n in 5" :key="n" class="skeleton-row"></div>
        </div>

        <div v-else-if="errorMsg" class="empty-state error-state">
          <div class="empty-box">
            <span class="empty-icon">⚠️</span>
            <p>{{ errorMsg }}</p>
          </div>
        </div>

        <div v-else-if="!rows.length" class="empty-state">
          <div class="empty-box">
            <span class="empty-icon">💳</span>
            <p>No hay pagos registrados para este viaje.</p>
          </div>
        </div>

        <template v-else>
          <div class="table-scroll desktop-only">
            <table class="data-table">
              <thead>
                <tr>
                  <th>PASAJERO</th>
                  <th>DNI</th>
                  <th>MÉTODO</th>
                  <th>COBRADOR</th>
                  <th>MONTO</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in rows" :key="p.viajePagoId">
                  <td>{{ nombreCompletoPago(p) }}</td>
                  <td class="mono">{{ p.dni || "—" }}</td>
                  <td>{{ metodoNombre(p.metodoPagoId) }}</td>
                  <td>{{ cobradorNombre(p.cobradorId) }}</td>
                  <td class="money-cell">$ {{ formatoMoneda(p.monto) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mobile-cards mobile-only">
            <article v-for="p in rows" :key="`mobile-${p.viajePagoId}`" class="pago-card">
              <div class="info-row"><span class="info-label">Pasajero</span><span class="info-value">{{ nombreCompletoPago(p) }}</span></div>
              <div class="info-row"><span class="info-label">DNI</span><span class="info-value mono">{{ p.dni || "—" }}</span></div>
              <div class="info-row"><span class="info-label">Método</span><span class="info-value">{{ metodoNombre(p.metodoPagoId) }}</span></div>
              <div class="info-row"><span class="info-label">Cobrador</span><span class="info-value">{{ cobradorNombre(p.cobradorId) }}</span></div>
              <div class="info-row"><span class="info-label">Monto</span><span class="info-value money-cell">$ {{ formatoMoneda(p.monto) }}</span></div>
            </article>
          </div>
        </template>

        <div class="pager">
          <span class="pager-text">Página <strong>{{ page }}</strong> de <strong>{{ totalPages }}</strong></span>
          <div class="pager-btns">
            <button class="btn-secondary" :disabled="loadingPagos || page <= 1" @click="goToFirst">«</button>
            <button class="btn-secondary" :disabled="loadingPagos || page <= 1" @click="prevPage">‹ Anterior</button>
            <button class="btn-secondary" :disabled="loadingPagos || page >= totalPages" @click="nextPage">Siguiente ›</button>
            <button class="btn-secondary" :disabled="loadingPagos || page >= totalPages" @click="goToLast">»</button>
          </div>
        </div>
      </section>
    </template>

    <section v-else class="card empty-card">
      <div class="empty-box">
        <span class="empty-icon">🚌</span>
        <p>No se pudo cargar el viaje.</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import { viajesBomboneraService } from "../../services/viajesBomboneraService"
import { viajesPagosService } from "../../services/viajesPagosService"
import { metodosPagoService } from "../../services/metodosPagoService"
import { cobradoresService } from "../../services/cobradoresService"
import { useToast } from "../../composables/useToast"

const route = useRoute()
const router = useRouter()
const toast = useToast()

const viajeId = computed(() => Number(route.params.id))

const loadingData = ref(false)
const loadingPagos = ref(false)
const errorMsg = ref("")

const viaje = ref(null)
const rows = ref([])
const search = ref("")
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const totalPages = ref(1)

const metodosPago = ref([])
const cobradores = ref([])

const hasActiveFilters = computed(() => !!search.value.trim() || pageSize.value !== 10)
const tableStatusText = computed(() => {
  if (!total.value) return "Sin resultados para mostrar."
  return `Mostrando ${rows.value.length} de ${total.value} pago(s).`
})
const totalPagos = computed(() => total.value)
const totalRecaudado = computed(() =>
  rows.value.reduce((acc, item) => acc + Number(item.monto || 0), 0)
)

function normalizePage(data) {
  const content = data?.data ?? data?.content ?? data?.items ?? []
  return {
    data: Array.isArray(content) ? content : [],
    total: Number(data?.total ?? data?.totalElements ?? content?.length ?? 0),
    page: Number(data?.page ?? data?.number ?? 1),
    pageSize: Number(data?.pageSize ?? data?.size ?? 10),
    totalPages: Number(data?.totalPages ?? data?.pages ?? 1),
  }
}

async function loadCatalogos() {
  try {
    const [metodosRes, cobradoresRes] = await Promise.all([
      metodosPagoService.listar(),
      cobradoresService.listar(),
    ])
    metodosPago.value = Array.isArray(metodosRes.data) ? metodosRes.data : []
    cobradores.value = Array.isArray(cobradoresRes.data) ? cobradoresRes.data : []
  } catch (err) {
    console.error("Error cargando catálogos:", err)
    toast.error("No se pudieron cargar métodos de pago o cobradores.")
  }
}

async function loadViaje() {
  if (!(viajeId.value > 0)) { viaje.value = null; return }
  loadingData.value = true
  try {
    const { data } = await viajesBomboneraService.obtener(viajeId.value)
    viaje.value = data || null
  } catch (err) {
    console.error("Error cargando viaje:", err)
    viaje.value = null
    toast.error("No se pudo cargar el viaje.")
  } finally {
    loadingData.value = false
  }
}

async function loadPagos() {
  if (!(viajeId.value > 0)) return
  loadingPagos.value = true
  errorMsg.value = ""
  try {
    const { data } = await viajesPagosService.listarPorViaje(viajeId.value, {
      page: page.value,
      pageSize: pageSize.value,
      search: search.value.trim() || undefined,
    })
    const parsed = normalizePage(data)
    rows.value = parsed.data
    total.value = parsed.total
    totalPages.value = Math.max(parsed.totalPages || 1, 1)
    page.value = Math.max(parsed.page || 1, 1)
  } catch (err) {
    console.error("Error cargando pagos:", err)
    errorMsg.value = "No se pudieron cargar los pagos del viaje."
    toast.error("No se pudieron cargar los pagos del viaje.")
  } finally {
    loadingPagos.value = false
  }
}

function applyFilters() { page.value = 1; loadPagos() }
function clearFilters() { search.value = ""; pageSize.value = 10; page.value = 1; loadPagos() }
function prevPage()  { if (page.value > 1) { page.value--; loadPagos() } }
function nextPage()  { if (page.value < totalPages.value) { page.value++; loadPagos() } }
function goToFirst() { if (page.value !== 1) { page.value = 1; loadPagos() } }
function goToLast()  { if (page.value !== totalPages.value) { page.value = totalPages.value; loadPagos() } }

function volver()      { router.push("/viajes") }
function editarViaje() { if (!viaje.value?.viajeBomboneraId) return; router.push(`/viajes/${viaje.value.viajeBomboneraId}/editar`) }
function nuevoPago()   { if (!viaje.value?.viajeBomboneraId) return; router.push(`/viajes/${viaje.value.viajeBomboneraId}/pago`) }

function metodoNombre(id) {
  const item = metodosPago.value.find((m) => Number(m.metodoPagoId) === Number(id))
  return item?.nombre || `#${id}`
}

function cobradorNombre(id) {
  const item = cobradores.value.find(
    (c) => Number(c.cobradorId ?? c.cobradoresId ?? c.id) === Number(id)
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

function formatearFecha(value) {
  if (!value) return "—"
  const match = String(value).match(
    /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2}))?)?$/
  )
  if (match) {
    const [, year, month, day, hour = "00", minute = "00"] = match
    const localDate = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute))
    return new Intl.DateTimeFormat("es-AR", { dateStyle: "medium", timeStyle: "short" }).format(localDate)
  }
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value))
}

function formatoMoneda(n) {
  return Number(n || 0).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

watch(pageSize, () => { page.value = 1; loadPagos() })

let debounceTimer = null
watch(search, () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => { page.value = 1; loadPagos() }, 400)
})

onBeforeUnmount(() => clearTimeout(debounceTimer))

onMounted(async () => {
  await Promise.all([loadViaje(), loadCatalogos()])
  await loadPagos()
})
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 16px; }
.page-head { padding: 22px; display: flex; justify-content: space-between; align-items: center; gap: 16px; }
.page-head-copy { min-width: 0; }
.eyebrow { margin: 0 0 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--accent); font-weight: 800; }
.page-head h1 { margin: 0 0 4px; font-size: clamp(1.6rem, 3vw, 2rem); font-weight: 900; color: var(--primary); }
.page-subtitle { margin: 0; color: var(--text-muted); font-size: 14px; line-height: 1.5; }
.head-actions { display: flex; gap: 10px; flex-wrap: wrap; justify-content: flex-end; }
.loading-card, .empty-card { padding: 22px; }
.stats-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
.stat-card { padding: 18px; }
.stat-label { margin: 0 0 8px; font-size: 12px; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; }
.stat-value { margin: 0; font-size: 1.5rem; font-weight: 900; color: var(--primary); line-height: 1.2; }
.stat-text { font-size: 1rem; font-weight: 800; }
.filters { padding: 20px; display: flex; flex-direction: column; gap: 12px; }
.filters-top { display: grid; grid-template-columns: minmax(0, 1fr) 140px auto; gap: 12px; align-items: end; }
.field { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.field label { font-size: 12px; font-weight: 700; color: var(--text-muted); }
.field-grow { min-width: 0; }
.field-sm { width: 100%; }
.filters-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.filters-meta { display: flex; gap: 10px; flex-wrap: wrap; }
.meta-chip { background: var(--bg); border: 1px solid var(--border); border-radius: 999px; padding: 6px 12px; font-size: 12px; color: var(--text-muted); }
.meta-chip strong { color: var(--primary); }
.table-wrap { padding: 22px; }
.table-top { display: flex; align-items: center; gap: 12px; margin-bottom: 18px; justify-content: space-between; flex-wrap: wrap; }
.table-top h2 { margin: 0; font-size: 18px; font-weight: 800; color: var(--primary); }
.table-top-meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.count-badge { background: var(--bg); border: 1px solid var(--border); border-radius: 999px; padding: 4px 10px; font-size: 12px; font-weight: 700; color: var(--text-muted); }
.table-status { margin: 0; font-size: 12px; color: var(--text-muted); }
.table-scroll { overflow-x: auto; }
.data-table { width: 100%; min-width: 760px; border-collapse: collapse; table-layout: fixed; }
.data-table th { text-align: left; padding: 10px 14px; font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.6px; font-weight: 800; background: #f8fafc; border-bottom: 2px solid var(--border); }
.data-table td { padding: 14px; border-bottom: 1px solid var(--bg); vertical-align: middle; font-size: 13px; }
.data-table tbody tr:hover { background: rgba(0, 59, 122, 0.02); }
.money-cell { font-weight: 800; color: var(--primary); }
.mono { font-family: monospace; font-size: 12px; color: var(--text-soft); }
.skeleton-wrap { display: flex; flex-direction: column; gap: 10px; }
.skeleton-row { height: 68px; background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%); background-size: 200% 100%; animation: shimmer 1.2s infinite; border-radius: 12px; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
.empty-state { min-height: 220px; display: grid; place-items: center; }
.empty-box { text-align: center; display: flex; flex-direction: column; gap: 10px; align-items: center; color: var(--text-muted); }
.empty-icon { font-size: 28px; }
.error-state .empty-box { color: #dc2626; }
.mobile-cards { display: flex; flex-direction: column; gap: 12px; }
.pago-card { border: 1px solid var(--border); border-radius: 16px; padding: 14px; background: white; }
.info-row { display: flex; flex-direction: column; gap: 4px; padding-top: 8px; border-top: 1px solid var(--bg); }
.info-label { font-size: 11px; font-weight: 800; letter-spacing: 0.4px; text-transform: uppercase; color: var(--text-muted); }
.info-value { font-size: 13px; color: var(--text-soft); word-break: break-word; }
.pager { margin-top: 18px; display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
.pager-text { font-size: 13px; color: var(--text-muted); }
.pager-text strong { color: var(--primary); }
.pager-btns { display: flex; gap: 8px; flex-wrap: wrap; }
.desktop-only { display: block; }
.mobile-only { display: none; }
@media (max-width: 1100px) { .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 980px) {
  .page-head { flex-direction: column; align-items: stretch; }
  .head-actions { justify-content: stretch; }
  .filters-top { grid-template-columns: 1fr; }
  .filters-actions { width: 100%; }
  .filters-actions button { flex: 1; }
  .pager { flex-direction: column; align-items: stretch; }
}
@media (max-width: 768px) {
  .desktop-only { display: none; }
  .mobile-only { display: flex; }
  .page-head, .filters, .table-wrap { padding: 16px; }
  .stats-grid { grid-template-columns: 1fr; }
  .pager-btns { display: grid; grid-template-columns: 1fr 1fr; width: 100%; }
  .pager-btns button { width: 100%; }
}
@media (max-width: 640px) {
  .head-actions { flex-direction: column; }
  .head-actions button, .filters-actions button { width: 100%; }
}
</style>