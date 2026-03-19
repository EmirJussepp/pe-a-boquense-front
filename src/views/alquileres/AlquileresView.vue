<template>
  <div class="page">
    <section class="page-head card">
      <div class="page-head-copy">
        <p class="eyebrow">Salones</p>
        <h1>Alquileres</h1>
        <p class="page-subtitle">Gestión de reservas y alquileres de salones.</p>
      </div>
      <div class="head-actions">
        <button class="btn-secondary" type="button" @click="loadAlquileres" :disabled="loading">
          {{ loading ? "Actualizando..." : "Actualizar" }}
        </button>
        <button class="btn-primary" type="button" @click="nuevoAlquiler">Nuevo alquiler</button>
      </div>
    </section>

    <section class="filters card">
      <div class="filters-top">
        <div class="field field-grow">
          <label>Buscar</label>
          <input v-model.trim="search" type="text" placeholder="Cliente o DNI..." @keyup.enter="applyFilters" />
        </div>
        <div class="field field-sm">
          <label>Condición</label>
          <select v-model="filtroCondicion">
            <option value="">Todos</option>
            <option value="true">Con seña</option>
            <option value="false">Sin seña</option>
          </select>
        </div>
        <div class="filters-actions">
          <button class="btn-primary" type="button" @click="applyFilters">Buscar</button>
          <button class="btn-secondary" type="button" @click="clearFilters" :disabled="!hasActiveFilters">Limpiar</button>
        </div>
      </div>
    </section>

    <section class="table-wrap card">
      <div class="table-top">
        <h2>Listado</h2>
        <div class="table-top-right">
          <div class="table-top-meta">
            <span class="count-badge">{{ rowsFiltrados.length }}</span>
            <p class="table-status">{{ rowsFiltrados.length }} alquiler(es)</p>
          </div>
          <button class="btn-calendario" type="button" @click="irCalendario">Ver calendario</button>
        </div>
      </div>

      <div v-if="loading" class="skeleton-wrap">
        <div v-for="n in 5" :key="n" class="skeleton-row"></div>
      </div>

      <div v-else-if="errorMsg" class="empty-state error-state">
        <div class="empty-box"><p>{{ errorMsg }}</p></div>
      </div>

      <div v-else-if="!rowsFiltrados.length" class="empty-state">
        <div class="empty-box"><p>No hay alquileres registrados.</p></div>
      </div>

      <template v-else>
        <div class="table-scroll desktop-only">
          <table class="data-table">
            <thead>
              <tr>
                <th>CLIENTE</th>
                <th>FECHA</th>
                <th>MONTO</th>
                <th>CONDICIÓN</th>
                <th class="th-actions">ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="alquiler in rowsFiltrados" :key="alquiler.id">
                <td>
                  <div class="cliente-cell">
                    <strong>{{ alquiler.nombre || "—" }}</strong>
                    <span v-if="alquiler.dni" class="sub-text">DNI: {{ alquiler.dni }}</span>
                  </div>
                </td>
                <td>{{ formatearFecha(alquiler.fecha) }}</td>
                <td>$ {{ formatoMoneda(alquiler.monto) }}</td>
                <td>
                  <span class="badge" :class="alquiler.condicion ? 'badge-success' : 'badge-neutral'">
                    {{ alquiler.condicion ? "Con seña" : "Sin seña" }}
                  </span>
                </td>
                <td>
                  <div class="row-actions">
                    <button class="table-btn" type="button" @click="editarAlquiler(alquiler)">Editar</button>
                    <button class="table-btn danger" type="button" @click="confirmarEliminar(alquiler)">Eliminar</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mobile-cards mobile-only">
          <article v-for="alquiler in rowsFiltrados" :key="`m-${alquiler.id}`" class="alquiler-card">
            <div class="alquiler-card-head">
              <div class="cliente-cell">
                <strong>{{ alquiler.nombre || "—" }}</strong>
                <span v-if="alquiler.dni" class="sub-text">DNI: {{ alquiler.dni }}</span>
              </div>
              <span class="badge" :class="alquiler.condicion ? 'badge-success' : 'badge-neutral'">
                {{ alquiler.condicion ? "Con seña" : "Sin seña" }}
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">Fecha</span>
              <span class="info-value">{{ formatearFecha(alquiler.fecha) }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Monto</span>
              <span class="info-value">$ {{ formatoMoneda(alquiler.monto) }}</span>
            </div>
            <div class="alquiler-card-actions">
              <button class="table-btn" type="button" @click="editarAlquiler(alquiler)">Editar</button>
              <button class="table-btn danger" type="button" @click="confirmarEliminar(alquiler)">Eliminar</button>
            </div>
          </article>
        </div>
      </template>
    </section>

    <!-- Modal confirmación eliminar -->
    <div v-if="modalEliminar.abierto" class="modal-overlay" @click.self="cerrarModal">
      <div class="modal-card">
        <div class="modal-header">
          <h3>Eliminar alquiler</h3>
          <button class="modal-close" type="button" @click="cerrarModal">✕</button>
        </div>
        <div class="modal-body">
          <p>¿Confirmas que querés eliminar el alquiler de <strong>{{ modalEliminar.alquiler?.nombre || "este cliente" }}</strong>?</p>
          <p class="modal-warning">Esta acción no se puede deshacer.</p>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" type="button" @click="cerrarModal" :disabled="modalEliminar.loading">Cancelar</button>
          <button class="btn-danger" type="button" @click="ejecutarEliminar" :disabled="modalEliminar.loading">
            {{ modalEliminar.loading ? "Eliminando..." : "Sí, eliminar" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue"
import { useRouter } from "vue-router"
import { alquileresService } from "../../services/alquileresService"
import { useToast } from "../../composables/useToast"

const router = useRouter()
const toast = useToast()

const loading = ref(false)
const errorMsg = ref("")
const rows = ref([])
const search = ref("")
const filtroCondicion = ref("")

const modalEliminar = reactive({ abierto: false, loading: false, alquiler: null })

const hasActiveFilters = computed(() => !!search.value.trim() || filtroCondicion.value !== "")

function normalizeAlquiler(item) {
  return {
    id: Number(item?.alquilerId ?? item?.id ?? 0),
    nombre: String(item?.nombre ?? ""),
    dni: String(item?.dni ?? ""),
    fecha: item?.fecha ?? null,
    monto: Number(item?.monto ?? 0),
    condicion: Boolean(item?.condicion),
  }
}

const rowsFiltrados = computed(() => {
  let result = [...rows.value]
  if (search.value.trim()) {
    const term = search.value.trim().toLowerCase()
    result = result.filter(item =>
      String(item.nombre || "").toLowerCase().includes(term) ||
      String(item.dni || "").includes(term)
    )
  }
  if (filtroCondicion.value !== "") {
    const condicion = filtroCondicion.value === "true"
    result = result.filter(item => item.condicion === condicion)
  }
  result.sort((a, b) => (new Date(b.fecha).getTime() || 0) - (new Date(a.fecha).getTime() || 0))
  return result
})

async function loadAlquileres() {
  loading.value = true
  errorMsg.value = ""
  try {
    const { data } = await alquileresService.listar()
    rows.value = Array.isArray(data)
      ? data.map(normalizeAlquiler).filter(item => item.id > 0)
      : []
  } catch (err) {
    console.error("Error cargando alquileres", err)
    errorMsg.value = "No se pudieron cargar los alquileres."
    toast.error("Error al cargar los alquileres.")
  } finally {
    loading.value = false
  }
}

function applyFilters() { /* client-side */ }
function clearFilters() { search.value = ""; filtroCondicion.value = "" }
function nuevoAlquiler()       { router.push("/alquileres/nuevo") }
function editarAlquiler(a)     { router.push(`/alquileres/${a.id}/editar`) }
function irCalendario()        { router.push("/alquileres/calendario") }

function confirmarEliminar(alquiler) {
  modalEliminar.alquiler = alquiler
  modalEliminar.abierto = true
  modalEliminar.loading = false
}

function cerrarModal() {
  modalEliminar.abierto = false
  modalEliminar.alquiler = null
  modalEliminar.loading = false
}

async function ejecutarEliminar() {
  if (!modalEliminar.alquiler) return
  modalEliminar.loading = true
  try {
    await alquileresService.eliminar(modalEliminar.alquiler.id)
    toast.success("Alquiler eliminado correctamente.")
    cerrarModal()
    await loadAlquileres()
  } catch (err) {
    console.error("No se pudo eliminar el alquiler.", err)
    toast.error("No se pudo eliminar el alquiler.")
    modalEliminar.loading = false
  }
}

function formatoMoneda(value) {
  return Number(value || 0).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatearFecha(value) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "short", timeStyle: "short" }).format(date)
}

onMounted(loadAlquileres)
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 16px; }
.page-head { padding: 22px; display: flex; justify-content: space-between; align-items: center; gap: 16px; }
.page-head-copy { min-width: 0; }
.eyebrow { margin: 0 0 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--accent); font-weight: 800; }
.page-head h1 { margin: 0 0 4px; font-size: clamp(1.6rem, 3vw, 2rem); font-weight: 900; color: var(--primary); }
.page-subtitle { margin: 0; color: var(--text-muted); font-size: 14px; }
.head-actions { display: flex; gap: 10px; flex-wrap: wrap; justify-content: flex-end; }
.filters { padding: 20px; }
.filters-top { display: grid; grid-template-columns: minmax(0, 1fr) 180px auto; gap: 12px; align-items: end; }
.field { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.field label { font-size: 12px; font-weight: 700; color: var(--text-muted); }
.field-grow { min-width: 0; }
.field-sm { width: 100%; }
.filters-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.table-wrap { padding: 22px; }
.table-top { display: flex; align-items: center; gap: 12px; margin-bottom: 18px; justify-content: space-between; flex-wrap: wrap; }
.table-top h2 { margin: 0; font-size: 18px; font-weight: 800; color: var(--primary); }
.table-top-right { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.table-top-meta { display: flex; align-items: center; gap: 8px; }
.count-badge { background: var(--bg); border: 1px solid var(--border); border-radius: 999px; padding: 4px 10px; font-size: 12px; font-weight: 700; color: var(--text-muted); }
.table-status { margin: 0; font-size: 12px; color: var(--text-muted); }
.table-scroll { overflow-x: auto; }
.data-table { width: 100%; min-width: 620px; border-collapse: collapse; }
.data-table th { text-align: left; padding: 10px 14px; font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.6px; font-weight: 800; background: #f8fafc; border-bottom: 2px solid var(--border); }
.data-table td { padding: 14px; border-bottom: 1px solid var(--bg); vertical-align: middle; font-size: 13px; }
.data-table tbody tr:hover { background: rgba(0,59,122,0.02); }
.cliente-cell { display: flex; flex-direction: column; gap: 3px; }
.sub-text { font-size: 12px; color: var(--text-muted); }
.th-actions { text-align: center; }
.row-actions { display: flex; gap: 6px; justify-content: center; flex-wrap: wrap; }
.badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 800; }
.badge-success { background: rgba(34,197,94,0.12); color: #15803d; }
.badge-neutral { background: rgba(148,163,184,0.15); color: #64748b; }
.table-btn { padding: 7px 14px; border-radius: 8px; border: 1px solid var(--border); font-size: 12px; font-weight: 700; cursor: pointer; background: white; color: var(--primary); transition: all 0.15s; }
.table-btn:hover { background: var(--bg); }
.table-btn.danger { color: #b91c1c; border-color: rgba(239,68,68,0.3); }
.table-btn.danger:hover { background: rgba(239,68,68,0.08); }
.btn-calendario { background: rgba(241,180,76,0.12); color: #9c6e1e; border: 1px solid rgba(241,180,76,0.4); border-radius: 8px; padding: 8px 14px; font-size: 12px; font-weight: 700; cursor: pointer; white-space: nowrap; transition: all 0.15s; }
.btn-calendario:hover { background: rgba(241,180,76,0.2); }
.skeleton-wrap { display: flex; flex-direction: column; gap: 10px; }
.skeleton-row { height: 60px; background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%); background-size: 200% 100%; animation: shimmer 1.2s infinite; border-radius: 8px; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
.empty-state { min-height: 180px; display: grid; place-items: center; }
.empty-box { text-align: center; color: var(--text-muted); font-size: 14px; }
.empty-box p { margin: 0; }
.error-state .empty-box { color: #b91c1c; }
.mobile-cards { display: flex; flex-direction: column; gap: 12px; }
.alquiler-card { border: 1px solid var(--border); border-radius: 12px; padding: 14px; background: white; display: flex; flex-direction: column; gap: 8px; }
.alquiler-card-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; flex-wrap: wrap; }
.alquiler-card-actions { display: flex; gap: 8px; padding-top: 8px; border-top: 1px solid var(--bg); }
.info-row { display: flex; flex-direction: column; gap: 3px; padding-top: 6px; border-top: 1px solid var(--bg); }
.info-label { font-size: 11px; font-weight: 800; letter-spacing: 0.4px; text-transform: uppercase; color: var(--text-muted); }
.info-value { font-size: 13px; color: var(--text-soft); }
/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; z-index: 999; padding: 20px; }
.modal-card { background: white; border-radius: 14px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); width: 100%; max-width: 440px; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px 16px; border-bottom: 1px solid var(--border); }
.modal-header h3 { margin: 0; font-size: 18px; font-weight: 800; color: var(--primary); }
.modal-close { background: none; border: none; font-size: 18px; cursor: pointer; color: var(--text-muted); padding: 4px 8px; border-radius: 6px; }
.modal-close:hover { background: var(--bg); }
.modal-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 8px; }
.modal-body p { margin: 0; font-size: 14px; color: var(--text-soft); }
.modal-warning { color: #b91c1c !important; font-size: 13px !important; }
.modal-footer { padding: 16px 24px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 10px; }
.btn-danger { background: #b91c1c; color: white; border: none; border-radius: 10px; padding: 10px 20px; font-size: 13px; font-weight: 700; cursor: pointer; transition: background 0.15s; }
.btn-danger:hover:not(:disabled) { background: #991b1b; }
.btn-danger:disabled { opacity: 0.6; cursor: not-allowed; }
.desktop-only { display: block; }
.mobile-only { display: none; }
@media (max-width: 980px) {
  .page-head { flex-direction: column; align-items: stretch; }
  .head-actions { justify-content: stretch; }
  .filters-top { grid-template-columns: 1fr; }
  .filters-actions { width: 100%; }
  .filters-actions button { flex: 1; }
}
@media (max-width: 768px) {
  .desktop-only { display: none; }
  .mobile-only { display: flex; }
  .page-head, .filters, .table-wrap { padding: 16px; }
  .alquiler-card-actions { flex-direction: column; }
  .alquiler-card-actions button { width: 100%; }
  .table-top { flex-direction: column; align-items: stretch; }
  .table-top-right { justify-content: space-between; }
}
@media (max-width: 640px) {
  .head-actions { flex-direction: column; }
  .head-actions button, .filters-actions button { width: 100%; }
}
</style>