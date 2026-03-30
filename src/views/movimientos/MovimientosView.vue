<template>
  <div class="page">
    <section class="page-head card">
      <div class="page-head-copy">
        <p class="eyebrow">Tesorería</p>
        <h1>Movimientos</h1>
        <p class="page-subtitle">Registro y control de ingresos y egresos.</p>
      </div>

      <div class="head-actions">
        <button class="btn-secondary" type="button" @click="loadMovimientos" :disabled="loading">
          {{ loading ? "Actualizando..." : "Actualizar" }}
        </button>
        <button class="btn-secondary" type="button" @click="verReporte">
          Ver reporte
        </button>
        <button class="btn-primary" type="button" @click="nuevoMovimiento">
          Nuevo movimiento
        </button>
      </div>
    </section>

    <section class="filters card">
      <div class="filters-top">
        <div class="field field-grow">
          <label>Buscar</label>
          <input
            v-model.trim="search"
            type="text"
            placeholder="Descripción..."
            @keyup.enter="applyFilters"
          />
        </div>

        <div class="field field-sm">
          <label>Tipo</label>
          <select v-model="tipo">
            <option value="">Todos</option>
            <option value="INGRESO">Ingresos</option>
            <option value="EGRESO">Egresos</option>
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
        <div class="table-top-meta">
          <span class="count-badge">{{ rowsFiltrados.length }}</span>
          <p class="table-status">
            {{ rowsFiltrados.length ? `${rowsFiltrados.length} movimiento(s)` : "Sin resultados." }}
          </p>
        </div>
      </div>

      <div v-if="loading" class="skeleton-wrap">
        <div v-for="n in 5" :key="n" class="skeleton-row"></div>
      </div>

      <div v-else-if="errorMsg" class="empty-state error-state">
        <div class="empty-box">
          <p>{{ errorMsg }}</p>
        </div>
      </div>

      <div v-else-if="!rowsFiltrados.length" class="empty-state">
        <div class="empty-box">
          <p>No hay movimientos registrados.</p>
        </div>
      </div>

      <template v-else>
        <div class="table-scroll desktop-only">
          <table class="data-table">
            <thead>
              <tr>
                <th>DESCRIPCIÓN</th>
                <th>TIPO</th>
                <th>MONTO</th>
                <th>FECHA</th>
                <th>MÉTODO</th>
                <th class="th-actions">ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="movimiento in rowsFiltrados" :key="movimiento.id">
                <td><strong>{{ movimiento.descripcion || "—" }}</strong></td>
                <td>
                  <span class="badge" :class="movimiento.tipo === 'INGRESO' ? 'badge-success' : 'badge-danger'">
                    {{ movimiento.tipo }}
                  </span>
                </td>
                <td class="money-cell" :class="movimiento.tipo === 'INGRESO' ? 'text-success' : 'text-danger'">
                  $ {{ formatoMoneda(movimiento.monto) }}
                </td>
                <td>{{ formatearFecha(movimiento.fecha) }}</td>
                <td>{{ movimiento.metodoPagoNombre || "—" }}</td>
                <td>
                  <div class="row-actions">
                    <button class="table-btn danger" type="button" @click="confirmarEliminar(movimiento)">
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mobile-cards mobile-only">
          <article v-for="movimiento in rowsFiltrados" :key="`m-${movimiento.id}`" class="mov-card">
            <div class="mov-card-head">
              <strong class="mov-desc">{{ movimiento.descripcion || "Sin descripción" }}</strong>
              <span class="badge" :class="movimiento.tipo === 'INGRESO' ? 'badge-success' : 'badge-danger'">
                {{ movimiento.tipo }}
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">Monto</span>
              <span class="info-value money-cell" :class="movimiento.tipo === 'INGRESO' ? 'text-success' : 'text-danger'">
                $ {{ formatoMoneda(movimiento.monto) }}
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">Fecha</span>
              <span class="info-value">{{ formatearFecha(movimiento.fecha) }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Método</span>
              <span class="info-value">{{ movimiento.metodoPagoNombre || "—" }}</span>
            </div>
            <div class="mov-card-actions">
              <button class="table-btn danger" type="button" @click="confirmarEliminar(movimiento)">
                Eliminar
              </button>
            </div>
          </article>
        </div>
      </template>
    </section>

    <!-- Modal confirmación eliminar -->
    <div v-if="modalEliminar.abierto" class="modal-overlay" @click.self="cerrarModal">
      <div class="modal-card">
        <div class="modal-header">
          <h3>Eliminar movimiento</h3>
          <button class="modal-close" type="button" @click="cerrarModal"><X :size="16" /></button>
        </div>
        <div class="modal-body">
          <p>
            ¿Confirmas que querés eliminar
            <strong>"{{ modalEliminar.movimiento?.descripcion || 'este movimiento' }}"</strong>?
          </p>
          <p class="modal-warning">Esta acción no se puede deshacer.</p>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" type="button" @click="cerrarModal" :disabled="modalEliminar.loading">
            Cancelar
          </button>
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
import { movimientosService } from "../../services/movimientosService"
import { useAuthStore } from "../../stores/auth"
import { useToast } from "../../composables/useToast"
import { X } from "lucide-vue-next"

const router = useRouter()
const auth = useAuthStore()
const toast = useToast()

const loading = ref(false)
const errorMsg = ref("")
const rows = ref([])
const search = ref("")
const tipo = ref("")

const modalEliminar = reactive({
  abierto: false,
  loading: false,
  movimiento: null,
})

const hasActiveFilters = computed(() => !!search.value.trim() || !!tipo.value)

function normalizeMovimiento(item) {
  return {
    id: Number(item?.movimientoId ?? item?.id ?? 0),
    descripcion: String(item?.descripcion ?? ""),
    tipo: String(item?.tipo ?? ""),
    monto: Number(item?.monto ?? 0),
    fecha: item?.fecha ?? null,
    metodoPagoNombre: String(
      item?.metodoPagoNombre ??
      item?.metodoPago?.nombre ??
      item?.metodoPago ??
      ""
    ),
  }
}

const rowsFiltrados = computed(() => {
  let result = [...rows.value]

  if (search.value.trim()) {
    const term = search.value.toLowerCase()
    result = result.filter((item) =>
      String(item.descripcion || "").toLowerCase().includes(term)
    )
  }

  if (tipo.value) {
    result = result.filter((item) => item.tipo === tipo.value)
  }

  result.sort((a, b) => {
    const fechaA = new Date(a.fecha).getTime() || 0
    const fechaB = new Date(b.fecha).getTime() || 0
    return fechaB - fechaA
  })

  return result
})

async function loadMovimientos() {
  loading.value = true
  errorMsg.value = ""
  try {
    const { data } = await movimientosService.listar()
    rows.value = Array.isArray(data)
      ? data.map(normalizeMovimiento).filter((item) => item.id > 0)
      : []
  } catch (err) {
    console.error("Error cargando movimientos", err)
    errorMsg.value = "No se pudieron cargar los movimientos."
    toast.error("Error al cargar los movimientos.")
  } finally {
    loading.value = false
  }
}

function applyFilters() { /* filtros client-side reactivos */ }

function clearFilters() {
  search.value = ""
  tipo.value = ""
}

function nuevoMovimiento() {
  router.push("/movimientos/nuevo")
}

function verReporte() {
  router.push("/movimientos/reportes")
}

function confirmarEliminar(movimiento) {
  modalEliminar.movimiento = movimiento
  modalEliminar.abierto = true
  modalEliminar.loading = false
}

function cerrarModal() {
  modalEliminar.abierto = false
  modalEliminar.movimiento = null
  modalEliminar.loading = false
}

async function ejecutarEliminar() {
  if (!modalEliminar.movimiento) return
  modalEliminar.loading = true
  try {
    await movimientosService.eliminar(modalEliminar.movimiento.id, auth.userId)
    toast.success("Movimiento eliminado correctamente.")
    cerrarModal()
    await loadMovimientos()
  } catch (err) {
    console.error("Error eliminando movimiento:", err)
    toast.error("No se pudo eliminar el movimiento.")
    modalEliminar.loading = false
  }
}

function formatoMoneda(value) {
  return Number(value || 0).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatearFecha(value) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date)
}

onMounted(loadMovimientos)
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
.filters-top { display: grid; grid-template-columns: minmax(0, 1fr) 160px auto; gap: 12px; align-items: end; }
.field { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.field label { font-size: 12px; font-weight: 700; color: var(--text-muted); }
.field input, .field select { width: 100%; }
.field-grow { min-width: 0; }
.field-sm { width: 100%; }
.filters-actions { display: flex; gap: 8px; flex-wrap: wrap; }

.table-wrap { padding: 22px; }
.table-top { display: flex; align-items: center; gap: 12px; margin-bottom: 18px; justify-content: space-between; flex-wrap: wrap; }
.table-top h2 { margin: 0; font-size: 18px; font-weight: 800; color: var(--primary); }
.table-top-meta { display: flex; align-items: center; gap: 10px; }
.count-badge { background: var(--bg); border: 1px solid var(--border); border-radius: 999px; padding: 4px 10px; font-size: 12px; font-weight: 700; color: var(--text-muted); }
.table-status { margin: 0; font-size: 12px; color: var(--text-muted); }

.table-scroll { overflow-x: auto; }
.data-table { width: 100%; min-width: 700px; border-collapse: collapse; }
.data-table th { text-align: left; padding: 10px 14px; font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.6px; font-weight: 800; background: #f8fafc; border-bottom: 2px solid var(--border); }
.data-table td { padding: 14px; border-bottom: 1px solid var(--bg); vertical-align: middle; font-size: 13px; }
.data-table tbody tr:hover { background: rgba(0,59,122,0.02); }
.th-actions { text-align: center; }
.row-actions { display: flex; gap: 6px; justify-content: center; }

.money-cell { font-weight: 800; }
.text-success { color: #15803d; }
.text-danger { color: #b91c1c; }

.badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 800; letter-spacing: 0.4px; }
.badge-success { background: rgba(34,197,94,0.12); color: #15803d; }
.badge-danger { background: rgba(239,68,68,0.12); color: #b91c1c; }

.table-btn { padding: 6px 12px; border-radius: 8px; border: 1px solid var(--border); font-size: 12px; font-weight: 700; cursor: pointer; background: white; color: var(--primary); transition: all 0.15s; }
.table-btn:hover { background: var(--bg); }
.table-btn.danger { color: #b91c1c; border-color: rgba(239,68,68,0.3); }
.table-btn.danger:hover { background: rgba(239,68,68,0.08); }

.skeleton-wrap { display: flex; flex-direction: column; gap: 10px; }
.skeleton-row { height: 56px; background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%); background-size: 200% 100%; animation: shimmer 1.2s infinite; border-radius: 8px; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

.empty-state { min-height: 180px; display: grid; place-items: center; }
.empty-box { text-align: center; color: var(--text-muted); font-size: 14px; }
.error-state .empty-box { color: #b91c1c; }

/* Mobile cards */
.mobile-cards { display: flex; flex-direction: column; gap: 12px; }
.mov-card { border: 1px solid var(--border); border-radius: 14px; padding: 14px; background: white; display: flex; flex-direction: column; gap: 8px; }
.mov-card-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; }
.mov-desc { font-size: 14px; color: var(--primary); min-width: 0; word-break: break-word; }
.info-row { display: flex; flex-direction: column; gap: 3px; padding-top: 6px; border-top: 1px solid var(--bg); }
.info-label { font-size: 11px; font-weight: 800; letter-spacing: 0.4px; text-transform: uppercase; color: var(--text-muted); }
.info-value { font-size: 13px; color: var(--text-soft); }
.mov-card-actions { padding-top: 8px; border-top: 1px solid var(--bg); }
.mov-card-actions button { width: 100%; }

.desktop-only { display: block; }
.mobile-only { display: none; }

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
}

@media (max-width: 640px) {
  .head-actions { flex-direction: column; }
  .head-actions button { width: 100%; }
}
</style>