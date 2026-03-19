<template>
  <div class="page">
    <section class="page-head card">
      <div class="page-head-copy">
        <p class="eyebrow">Bombonera</p>
        <h1>Viajes</h1>
        <p class="page-subtitle">
          Organización de viajes a la Bombonera con búsqueda, paginación y acceso al detalle.
        </p>
      </div>

      <div class="head-actions">
        <button class="btn-secondary" @click="loadViajes" :disabled="loading">
          {{ loading ? "Actualizando..." : "Actualizar" }}
        </button>
        <button class="btn-primary" @click="nuevoViaje">+ Nuevo viaje</button>
      </div>
    </section>

    <section class="filters card">
      <div class="filters-top">
        <div class="field field-grow">
          <label>Buscar viaje</label>
          <input v-model="search" type="text" placeholder="Destino..." @keyup.enter="applyFilters" />
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
        <span class="meta-chip">Total <strong>{{ total }}</strong> viaje(s)</span>
        <span class="meta-chip" v-if="search.trim()">Búsqueda: <strong>{{ search.trim() }}</strong></span>
      </div>
    </section>

    <section class="table-wrap card">
      <div class="table-top">
        <h2>Listado</h2>
        <div class="table-top-meta">
          <span class="count-badge">{{ rows.length }}</span>
          <p class="table-status">{{ tableStatusText }}</p>
        </div>
      </div>

      <div v-if="loading" class="skeleton-wrap">
        <div v-for="n in 5" :key="n" class="skeleton-row"></div>
      </div>

      <div v-else-if="errorMsg" class="empty-state error-state">
        <div class="empty-box"><p>{{ errorMsg }}</p></div>
      </div>

      <div v-else-if="!rows.length" class="empty-state">
        <div class="empty-box"><p>No hay viajes registrados.</p></div>
      </div>

      <template v-else>
        <div class="table-scroll desktop-only">
          <table class="data-table">
            <thead>
              <tr>
                <th>DESTINO</th>
                <th>FECHA DEL VIAJE</th>
                <th class="th-actions">ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="v in rows" :key="v.viajeBomboneraId">
                <td>
                  <div class="viaje-info">
                    <strong>{{ v.destino || "Sin destino" }}</strong>
                    <span>Viaje #{{ v.viajeBomboneraId }}</span>
                  </div>
                </td>
                <td><strong class="date-text">{{ formatearFecha(v.fechaViaje) }}</strong></td>
                <td>
                  <div class="row-actions">
                    <button class="btn-detail" @click="verDetalle(v)">Ver detalle</button>
                    <button class="table-btn" @click="editarViaje(v)">Editar</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mobile-cards mobile-only">
          <article v-for="v in rows" :key="`m-${v.viajeBomboneraId}`" class="viaje-card">
            <div class="viaje-card-head">
              <div class="viaje-info">
                <strong>{{ v.destino || "Sin destino" }}</strong>
                <span>Viaje #{{ v.viajeBomboneraId }}</span>
              </div>
            </div>
            <div class="info-row">
              <span class="info-label">Fecha del viaje</span>
              <span class="info-value">{{ formatearFecha(v.fechaViaje) }}</span>
            </div>
            <div class="viaje-card-actions">
              <button class="btn-detail" @click="verDetalle(v)">Ver detalle</button>
              <button class="table-btn" @click="editarViaje(v)">Editar</button>
            </div>
          </article>
        </div>
      </template>

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
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue"
import { useRouter } from "vue-router"
import { viajesBomboneraService } from "../../services/viajesBomboneraService"
import { useToast } from "../../composables/useToast"

const router = useRouter()
const toast = useToast()

const loading = ref(false)
const errorMsg = ref("")
const rows = ref([])
const search = ref("")
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const totalPages = ref(1)

const hasActiveFilters = computed(() => !!search.value.trim() || pageSize.value !== 10)
const tableStatusText = computed(() => {
  if (!total.value) return "Sin resultados para mostrar."
  return `Mostrando ${rows.value.length} de ${total.value} viaje(s).`
})

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

async function loadViajes() {
  loading.value = true
  errorMsg.value = ""
  try {
    const { data } = await viajesBomboneraService.listar({
      page: page.value, pageSize: pageSize.value,
      search: search.value.trim() || undefined,
    })
    const parsed = normalizePage(data)
    rows.value = parsed.data
    total.value = parsed.total
    totalPages.value = Math.max(parsed.totalPages || 1, 1)
    page.value = Math.max(parsed.page || 1, 1)
  } catch (err) {
    console.error("Error cargando viajes:", err)
    errorMsg.value = "No se pudieron cargar los viajes."
    toast.error("Error al cargar los viajes.")
  } finally {
    loading.value = false
  }
}

function applyFilters() { page.value = 1; loadViajes() }
function clearFilters() { search.value = ""; pageSize.value = 10; page.value = 1; loadViajes() }
function prevPage()  { if (page.value > 1) { page.value--; loadViajes() } }
function nextPage()  { if (page.value < totalPages.value) { page.value++; loadViajes() } }
function goToFirst() { if (page.value !== 1) { page.value = 1; loadViajes() } }
function goToLast()  { if (page.value !== totalPages.value) { page.value = totalPages.value; loadViajes() } }
function nuevoViaje()   { router.push("/viajes/nuevo") }
function editarViaje(v) { router.push(`/viajes/${v.viajeBomboneraId}/editar`) }
function verDetalle(v)  { router.push(`/viajes/${v.viajeBomboneraId}`) }

function formatearFecha(value) {
  if (!value) return "—"
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2}))?)?$/)
  if (match) {
    const [, year, month, day, hour = "00", minute = "00"] = match
    return new Intl.DateTimeFormat("es-AR", { dateStyle: "medium", timeStyle: "short" })
      .format(new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute)))
  }
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value))
}

watch(pageSize, () => { page.value = 1; loadViajes() })
let debounceTimer = null
watch(search, () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => { page.value = 1; loadViajes() }, 400)
})
onBeforeUnmount(() => clearTimeout(debounceTimer))
onMounted(loadViajes)
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 16px; }
.page-head { padding: 22px; display: flex; justify-content: space-between; align-items: center; gap: 16px; }
.page-head-copy { min-width: 0; }
.eyebrow { margin: 0 0 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--accent); font-weight: 800; }
.page-head h1 { margin: 0 0 4px; font-size: clamp(1.6rem, 3vw, 2rem); font-weight: 900; color: var(--primary); }
.page-subtitle { margin: 0; color: var(--text-muted); font-size: 14px; line-height: 1.5; }
.head-actions { display: flex; gap: 10px; flex-wrap: wrap; justify-content: flex-end; }
.filters { padding: 20px; display: flex; flex-direction: column; gap: 12px; }
.filters-top { display: grid; grid-template-columns: minmax(0, 1fr) 140px auto; gap: 12px; align-items: end; }
.field { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.field label { font-size: 12px; font-weight: 700; color: var(--text-muted); }
.field input, .field select { width: 100%; }
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
.data-table { width: 100%; min-width: 500px; border-collapse: collapse; }
.data-table th { text-align: left; padding: 10px 14px; font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.6px; font-weight: 800; background: #f8fafc; border-bottom: 2px solid var(--border); }
.data-table td { padding: 14px; border-bottom: 1px solid var(--bg); vertical-align: middle; font-size: 13px; }
.data-table tbody tr:hover { background: rgba(0,59,122,0.02); }
.viaje-info { display: flex; flex-direction: column; gap: 2px; }
.viaje-info strong { font-weight: 700; color: var(--primary); font-size: 14px; }
.viaje-info span { font-size: 11px; color: var(--text-muted); }
.date-text { color: var(--text-soft); font-size: 13px; }
.th-actions { text-align: center; }
.row-actions { display: flex; gap: 6px; justify-content: center; flex-wrap: wrap; }
.table-btn, .btn-detail { min-height: 34px; padding: 7px 14px; border-radius: 8px; border: 1px solid var(--border); font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.15s; }
.table-btn { background: white; color: var(--primary); }
.table-btn:hover { background: var(--bg); }
.btn-detail { background: rgba(0,59,122,0.07); color: var(--primary); border-color: rgba(0,59,122,0.15); }
.btn-detail:hover { background: var(--primary); color: white; }
.skeleton-wrap { display: flex; flex-direction: column; gap: 10px; }
.skeleton-row { height: 64px; background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%); background-size: 200% 100%; animation: shimmer 1.2s infinite; border-radius: 10px; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
.empty-state { min-height: 200px; display: grid; place-items: center; }
.empty-box { text-align: center; color: var(--text-muted); font-size: 14px; }
.empty-box p { margin: 0; }
.error-state .empty-box { color: #b91c1c; }
.mobile-cards { display: flex; flex-direction: column; gap: 12px; }
.viaje-card { border: 1px solid var(--border); border-radius: 14px; padding: 14px; background: white; }
.viaje-card-head { margin-bottom: 10px; }
.viaje-card-actions { display: flex; gap: 8px; margin-top: 12px; padding-top: 10px; border-top: 1px solid var(--bg); }
.info-row { display: flex; flex-direction: column; gap: 3px; padding-top: 8px; border-top: 1px solid var(--bg); }
.info-label { font-size: 11px; font-weight: 800; letter-spacing: 0.4px; text-transform: uppercase; color: var(--text-muted); }
.info-value { font-size: 13px; color: var(--text-soft); }
.pager { margin-top: 18px; display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
.pager-text { font-size: 13px; color: var(--text-muted); }
.pager-text strong { color: var(--primary); }
.pager-btns { display: flex; gap: 8px; flex-wrap: wrap; }
.desktop-only { display: block; }
.mobile-only { display: none; }
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
  .viaje-card-actions { flex-direction: column; }
  .viaje-card-actions button { width: 100%; }
  .pager-btns { display: grid; grid-template-columns: 1fr 1fr; width: 100%; }
  .pager-btns button { width: 100%; }
}
@media (max-width: 640px) {
  .head-actions { flex-direction: column; }
  .head-actions button, .filters-actions button { width: 100%; }
}
</style>