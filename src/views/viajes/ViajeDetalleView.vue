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
        <button v-if="viaje" class="btn-secondary" @click="editarViaje">
          <Pencil :size="14" style="margin-right:5px;vertical-align:-2px" /> Editar
        </button>
        <button v-if="viaje" class="btn-secondary" @click="abrirWhatsApp">
          <Smartphone :size="14" style="margin-right:5px;vertical-align:-2px" />WhatsApp
        </button>
        <button v-if="viaje" class="btn-primary" @click="nuevoPago">+ Registrar pasajero</button>
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
            <input v-model="search" type="text" placeholder="Nombre, apellido o DNI..." @keyup.enter="applyFilters" />
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

      <!-- RESUMEN POR MÉTODO DE PAGO -->
      <section v-if="resumenPorMetodo.length" class="card metodos-card">
        <h3 class="metodos-title">
          <CreditCard :size="16" style="vertical-align:-2px;margin-right:6px" />Recaudación por método de pago
        </h3>
        <div class="metodos-grid">
          <div v-for="item in resumenPorMetodo" :key="item.metodoPagoId" class="metodo-item">
            <span class="metodo-nombre">{{ item.nombre }}</span>
            <div class="metodo-right">
              <span class="metodo-cantidad">{{ item.cantidad }} pago{{ item.cantidad !== 1 ? 's' : '' }}</span>
              <span class="metodo-monto">$ {{ formatoMoneda(item.total) }}</span>
            </div>
          </div>
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
            <AlertTriangle class="empty-icon" :size="28" />
            <p>{{ errorMsg }}</p>
          </div>
        </div>

        <div v-else-if="!rows.length" class="empty-state">
          <div class="empty-box">
            <CreditCard class="empty-icon" :size="28" />
            <p>No hay pagos registrados para este viaje.</p>
          </div>
        </div>

        <template v-else>
          <!-- Desktop -->
          <div class="table-scroll desktop-only">
            <table class="data-table">
              <thead>
                <tr>
                  <th>PASAJERO</th>
                  <th>DNI</th>
                  <th>MÉTODO</th>
                  <th>COBRADOR</th>
                  <th>MONTO</th>
                  <th class="th-actions">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in rows" :key="p.viajePagoId">
                  <td>
                    <div class="pasajero-cell">
                      {{ nombreCompletoPago(p) }}
                      <span v-if="p.pasajeroParentesco" class="familiar-hint">
                        Familiar de {{ p.socioApellido }}, {{ p.socioNombre }}
                      </span>
                    </div>
                  </td>
                  <td class="mono">{{ p.pasajeroDni || "—" }}</td>
                  <td>{{ metodoNombre(p.metodoPagoId) }}</td>
                  <td>{{ cobradorNombre(p.cobradorId) }}</td>
                  <td class="money-cell">$ {{ formatoMoneda(p.monto) }}</td>
                  <td>
                    <div class="row-actions">
                      <button class="btn-action" @click="abrirEdicion(p)" title="Editar pago">
                        <Pencil :size="14" />
                      </button>
                      <button class="btn-action btn-action-danger" title="Eliminar pago"
                        :disabled="eliminandoId === p.viajePagoId" @click="eliminarPago(p)">
                        <Trash2 :size="14" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile -->
          <div class="mobile-cards mobile-only">
            <article v-for="p in rows" :key="`mobile-${p.viajePagoId}`" class="pago-card">
              <div class="pago-card-head">
                <div class="pasajero-info">
                  <strong>{{ nombreCompletoPago(p) }}</strong>
                  <span class="mono">{{ p.pasajeroDni || "—" }}</span>
                  <span v-if="p.pasajeroParentesco" class="familiar-hint">
                    Familiar de {{ p.socioApellido }}, {{ p.socioNombre }}
                  </span>
                </div>
                <div class="pago-card-actions-head">
                  <button class="btn-action" @click="abrirEdicion(p)" title="Editar">
                    <Pencil :size="14" />
                  </button>
                  <button class="btn-action btn-action-danger" title="Próximamente" disabled>
                    <Trash2 :size="14" />
                  </button>
                </div>
              </div>
              <div class="info-row"><span class="info-label">Método</span><span class="info-value">{{
                metodoNombre(p.metodoPagoId) }}</span></div>
              <div class="info-row"><span class="info-label">Cobrador</span><span class="info-value">{{
                cobradorNombre(p.cobradorId) }}</span></div>
              <div class="info-row"><span class="info-label">Monto</span><span class="info-value money-cell">$ {{
                  formatoMoneda(p.monto) }}</span></div>
            </article>
          </div>
        </template>

        <div class="pager">
          <span class="pager-text">Página <strong>{{ page }}</strong> de <strong>{{ totalPages }}</strong></span>
          <div class="pager-btns">
            <button class="btn-secondary" :disabled="loadingPagos || page <= 1" @click="goToFirst">«</button>
            <button class="btn-secondary" :disabled="loadingPagos || page <= 1" @click="prevPage">‹ Anterior</button>
            <button class="btn-secondary" :disabled="loadingPagos || page >= totalPages" @click="nextPage">Siguiente
              ›</button>
            <button class="btn-secondary" :disabled="loadingPagos || page >= totalPages" @click="goToLast">»</button>
          </div>
        </div>
      </section>
    </template>

    <section v-else class="card empty-card">
      <div class="empty-box">
        <Bus class="empty-icon" :size="28" />
        <p>No se pudo cargar el viaje.</p>
      </div>
    </section>

    <!-- Modal WhatsApp -->
    <teleport to="body">
      <transition name="fade">
        <div v-if="modalWa" class="modal-backdrop" @click.self="modalWa = false">
          <div class="modal-box card">
            <div class="modal-head">
              <h2><Users :size="18" style="margin-right:8px;vertical-align:-3px" />Lista de pasajeros</h2>
              <button class="btn-icon close-btn" @click="modalWa = false"><X :size="16" /></button>
            </div>
            <div class="modal-body">
              <div v-if="loadingWa" class="wa-empty">Cargando...</div>
              <div v-else-if="!listadoWa.length" class="wa-empty">
                No hay pasajeros con datos para este viaje.
              </div>
              <div v-else class="wa-lista">
                <div v-for="(p, i) in listadoWa" :key="i" class="wa-item">
                  <div class="wa-info">
                    <strong>{{ p.apellido ? `${p.apellido}, ${p.nombre}` : p.nombre }}</strong>
                    <span v-if="p.telefono" class="wa-tel">{{ p.telefono }}</span>
                    <span v-else class="wa-sin-tel">Sin teléfono</span>
                  </div>
                  <a v-if="p.whatsappLink" :href="p.whatsappLink" target="_blank" rel="noopener" class="btn-wa">
                    <MessageCircle :size="13" style="margin-right:4px;vertical-align:-2px" />WhatsApp
                  </a>
                  <span v-else class="btn-wa btn-wa-disabled">Sin número</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <!-- Modal edición de pago -->
    <teleport to="body">
      <transition name="fade">
        <div v-if="editando" class="modal-backdrop" @click.self="cerrarEdicion">
          <div class="modal-box card">
            <div class="modal-head">
              <h2>Editar pago</h2>
              <button class="btn-icon close-btn" @click="cerrarEdicion">
                <X :size="16" />
              </button>
            </div>

            <div class="modal-body">
              <p v-if="pagoEnEdicion" class="edit-pasajero-label">
                Pasajero: <strong>{{ nombreCompletoPago(pagoEnEdicion) }}</strong>
              </p>
              <div class="modal-grid">
                <div class="field">
                  <label>Monto</label>
                  <input v-model="editForm.monto" type="text" placeholder="Ej: 15000.00" />
                </div>
                <div class="field">
                  <label>Método de pago</label>
                  <select v-model.number="editForm.metodoPagoId">
                    <option v-for="m in metodosPago" :key="m.metodoPagoId" :value="m.metodoPagoId">{{ m.nombre }}
                    </option>
                  </select>
                </div>
                <div class="field">
                  <label>Cobrador</label>
                  <select v-model.number="editForm.cobradorId">
                    <option v-for="c in cobradores" :key="c.cobradorId ?? c.cobradoresId"
                      :value="Number(c.cobradorId ?? c.cobradoresId)">{{ c.nombre }}</option>
                  </select>
                </div>
              </div>

              <p v-if="editError" class="error-msg">{{ editError }}</p>
            </div>

            <div class="modal-foot">
              <button class="btn-secondary" @click="cerrarEdicion" :disabled="savingEdit">Cancelar</button>
              <button class="btn-primary" @click="guardarEdicion" :disabled="savingEdit">
                {{ savingEdit ? "Guardando..." : "Guardar cambios" }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch, reactive } from "vue"
import { useRoute, useRouter } from "vue-router"
import { viajesBomboneraService } from "../../services/viajesBomboneraService"
import { viajesPagosService } from "../../services/viajesPagosService"
import { metodosPagoService } from "../../services/metodosPagoService"
import { cobradoresService } from "../../services/cobradoresService"
import { useToast } from "../../composables/useToast"
import { AlertTriangle, CreditCard, Bus, X, Pencil, Trash2, Smartphone, Users, MessageCircle } from "lucide-vue-next"

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

// Todos los pagos del viaje (sin paginar) para calcular el resumen por método
const todosPagos = ref([])


// --- Soft delete ---
const eliminandoId = ref(null)

async function eliminarPago(pago) {
  const confirmado = confirm(`¿Eliminar el pago de ${nombreCompletoPago(pago)}?`)
  if (!confirmado) return

  eliminandoId.value = pago.viajePagoId
  try {
    await viajesPagosService.eliminar(pago.viajePagoId)
    toast.success("Pago eliminado correctamente.")
    await loadPagos()
      await loadTodosPagos()   
  } catch (e) {
    toast.error(e?.response?.data?.message ?? "No se pudo eliminar el pago.")
  } finally {
    eliminandoId.value = null
  }
}

const hasActiveFilters = computed(() => !!search.value.trim() || pageSize.value !== 10)
const tableStatusText = computed(() => {
  if (!total.value) return "Sin resultados para mostrar."
  return `Mostrando ${rows.value.length} de ${total.value} pago(s).`
})
const totalPagos = computed(() => total.value)
const totalRecaudado = computed(() =>
  rows.value.reduce((acc, item) => acc + Number(item.monto || 0), 0)
)

// Resumen agrupado por método de pago (usa todos los pagos del viaje, no solo la página)
const resumenPorMetodo = computed(() => {
  const fuente = todosPagos.value.length ? todosPagos.value : rows.value
  const mapa = new Map()
  for (const p of fuente) {
    const id = p.metodoPagoId
    const nombre = metodosPago.value.find(m => Number(m.metodoPagoId) === Number(id))?.nombre ?? `Método #${id}`
    if (!mapa.has(id)) mapa.set(id, { metodoPagoId: id, nombre, cantidad: 0, total: 0 })
    const entry = mapa.get(id)
    entry.cantidad++
    entry.total += Number(p.monto || 0)
  }
  return [...mapa.values()].sort((a, b) => b.total - a.total)
})

const editando = ref(false)
const pagoEnEdicion = ref(null)
const savingEdit = ref(false)
const editError = ref("")
const editForm = reactive({ viajeId: null, monto: "", pasajeroId: null, metodoPagoId: null, cobradorId: null })

// ── WhatsApp ──────────────────────────────────────────────
const modalWa = ref(false)
const loadingWa = ref(false)
const listadoWa = ref([])

async function abrirWhatsApp() {
  modalWa.value = true
  loadingWa.value = true
  try {
    const res = await viajesPagosService.whatsappList(viajeId.value)
    listadoWa.value = Array.isArray(res.data) ? res.data : []
  } catch { listadoWa.value = [] }
  finally { loadingWa.value = false }
}

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
    const [metodosRes, cobradoresRes] = await Promise.all([metodosPagoService.listar(), cobradoresService.listar()])
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
  try { const { data } = await viajesBomboneraService.obtener(viajeId.value); viaje.value = data || null }
  catch (err) { console.error("Error cargando viaje:", err); viaje.value = null; toast.error("No se pudo cargar el viaje.") }
  finally { loadingData.value = false }
}

async function loadPagos() {
  if (!(viajeId.value > 0)) return
  loadingPagos.value = true; errorMsg.value = ""
  try {
    const { data } = await viajesPagosService.listarPorViaje(viajeId.value, { page: page.value, pageSize: pageSize.value, search: search.value.trim() || undefined })
    const parsed = normalizePage(data)
    rows.value = parsed.data; total.value = parsed.total
    totalPages.value = Math.max(parsed.totalPages || 1, 1); page.value = Math.max(parsed.page || 1, 1)
  } catch (err) { console.error("Error cargando pagos:", err); errorMsg.value = "No se pudieron cargar los pagos del viaje."; toast.error("No se pudieron cargar los pagos del viaje.") }
  finally { loadingPagos.value = false }
}

// Carga todos los pagos sin paginación para el resumen por método
async function loadTodosPagos() {
  if (!(viajeId.value > 0)) return
  try {
    const { data } = await viajesPagosService.listarPorViaje(viajeId.value, { page: 1, pageSize: 9999 })
    const parsed = normalizePage(data)
    todosPagos.value = parsed.data
  } catch { /* silencioso, el resumen queda vacío */ }
}

function applyFilters() { page.value = 1; loadPagos() }
function clearFilters() { search.value = ""; pageSize.value = 10; page.value = 1; loadPagos() }
function prevPage() { if (page.value > 1) { page.value--; loadPagos() } }
function nextPage() { if (page.value < totalPages.value) { page.value++; loadPagos() } }
function goToFirst() { if (page.value !== 1) { page.value = 1; loadPagos() } }
function goToLast() { if (page.value !== totalPages.value) { page.value = totalPages.value; loadPagos() } }

function volver() { router.push("/viajes") }
function editarViaje() { if (!viaje.value?.viajeBomboneraId) return; router.push(`/viajes/${viaje.value.viajeBomboneraId}/editar`) }
function nuevoPago() { if (!viaje.value?.viajeBomboneraId) return; router.push(`/viajes/${viaje.value.viajeBomboneraId}/pago`) }

function metodoNombre(id) { const item = metodosPago.value.find(m => Number(m.metodoPagoId) === Number(id)); return item?.nombre || `#${id}` }
function cobradorNombre(id) { const item = cobradores.value.find(c => Number(c.cobradorId ?? c.cobradoresId ?? c.id) === Number(id)); return item?.nombre || `#${id}` }
function nombreCompletoPago(p) {
  const apellido = String(p?.pasajeroApellido ?? p?.apellido ?? "").trim()
  const nombre   = String(p?.pasajeroNombre   ?? p?.nombre   ?? "").trim()
  if (apellido && nombre) return `${apellido}, ${nombre}`
  if (nombre) return nombre; if (apellido) return apellido; return "—"
}
function formatearFecha(value) {
  if (!value) return "—"
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2}))?)?$/)
  if (match) {
    const [, year, month, day, hour = "00", minute = "00"] = match
    return new Intl.DateTimeFormat("es-AR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute)))
  }
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value))
}
function formatoMoneda(n) { return Number(n || 0).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }

function abrirEdicion(pago) {
  editError.value = ""
  pagoEnEdicion.value = pago
  editForm.viajeId      = pago.viajeId
  editForm.monto        = pago.monto
  editForm.pasajeroId   = pago.pasajeroId
  editForm.metodoPagoId = pago.metodoPagoId
  editForm.cobradorId   = pago.cobradorId
  editando.value = true
}
function cerrarEdicion() { editando.value = false; pagoEnEdicion.value = null; editError.value = "" }
async function guardarEdicion() {
  if (!pagoEnEdicion.value) return
  savingEdit.value = true; editError.value = ""
  try {
    await viajesPagosService.actualizar(pagoEnEdicion.value.viajePagoId, { ...editForm })
    cerrarEdicion()
    await loadPagos()
    await loadTodosPagos()
  } catch (e) {
    editError.value = e?.response?.data?.message ?? "Error al guardar. Intentá de nuevo."
  } finally {
    savingEdit.value = false
  }
}
watch(pageSize, () => { page.value = 1; loadPagos() })
let debounceTimer = null
watch(search, () => { clearTimeout(debounceTimer); debounceTimer = setTimeout(() => { page.value = 1; loadPagos() }, 400) })
onBeforeUnmount(() => clearTimeout(debounceTimer))
onMounted(async () => { await Promise.all([loadViaje(), loadCatalogos()]); await loadPagos(); await loadTodosPagos() })
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-head {
  padding: 22px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.page-head-copy {
  min-width: 0;
}

.eyebrow {
  margin: 0 0 4px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--accent);
  font-weight: 800;
}

.page-head h1 {
  margin: 0 0 4px;
  font-size: clamp(1.6rem, 3vw, 2rem);
  font-weight: 900;
  color: var(--primary);
}

.page-subtitle {
  margin: 0;
  color: var(--text-muted);
  font-size: 14px;
  line-height: 1.5;
}

.head-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.loading-card,
.empty-card {
  padding: 22px;
}

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.stat-card {
  padding: 18px;
}

.stat-label {
  margin: 0 0 8px;
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.stat-value {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 900;
  color: var(--primary);
  line-height: 1.2;
}

.stat-text {
  font-size: 1rem;
  font-weight: 800;
}

/* Filters */
.filters {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.filters-top {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 140px auto;
  gap: 12px;
  align-items: end;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.field label {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-muted);
}

.field-grow {
  min-width: 0;
}

.field-sm {
  width: 100%;
}

.filters-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filters-meta {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.meta-chip {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 12px;
  color: var(--text-muted);
}

.meta-chip strong {
  color: var(--primary);
}

/* Table */
.table-wrap {
  padding: 22px;
}

.table-top {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
  justify-content: space-between;
  flex-wrap: wrap;
}

.table-top h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  color: var(--primary);
}

.table-top-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.count-badge {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-muted);
}

.table-status {
  margin: 0;
  font-size: 12px;
  color: var(--text-muted);
}

.table-scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.data-table {
  width: 100%;
  min-width: 680px;
  border-collapse: collapse;
  table-layout: fixed;
}

.data-table th {
  text-align: left;
  padding: 10px 14px;
  font-size: 11px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.6px;
  font-weight: 800;
  background: #f8fafc;
  border-bottom: 2px solid var(--border);
}

.data-table td {
  padding: 14px;
  border-bottom: 1px solid var(--bg);
  vertical-align: middle;
  font-size: 13px;
}

.data-table tbody tr:hover {
  background: rgba(0, 59, 122, 0.02);
}

.th-actions {
  text-align: center;
}

.row-actions {
  display: flex;
  gap: 6px;
  justify-content: center;
}

/* Botones de acción en tabla */
.btn-action {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: white;
  cursor: pointer;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.btn-action:hover:not(:disabled) {
  background: var(--bg);
  border-color: var(--primary);
  transform: translateY(-1px);
}

.btn-action-danger {
  border-color: #fecaca;
  background: #fff5f5;
}

.btn-action-danger:hover:not(:disabled) {
  background: #fee2e2;
}

.btn-action:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.money-cell {
  font-weight: 800;
  color: var(--primary);
}

.mono {
  font-family: monospace;
  font-size: 12px;
  color: var(--text-soft);
}

/* Resumen por método de pago */
.metodos-card {
  padding: 20px;
}

.metodos-title {
  margin: 0 0 16px;
  font-size: 15px;
  font-weight: 800;
  color: var(--primary);
}

.metodos-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.metodo-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--bg);
  border-radius: 10px;
  border-left: 4px solid var(--accent);
}

.metodo-nombre {
  font-size: 14px;
  font-weight: 700;
  color: var(--primary);
}

.metodo-right {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.metodo-cantidad {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 600;
}

.metodo-monto {
  font-size: 16px;
  font-weight: 900;
  color: var(--primary);
}

/* Skeleton */
.skeleton-wrap {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.skeleton-row {
  height: 68px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite;
  border-radius: 12px;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

.empty-state {
  min-height: 220px;
  display: grid;
  place-items: center;
}

.empty-box {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  color: var(--text-muted);
}

.empty-icon {
  opacity: 0.6;
}

.error-state .empty-box {
  color: #dc2626;
}

/* Mobile cards */
.mobile-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pago-card {
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 14px;
  background: white;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pago-card-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}

.pasajero-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.pasajero-info strong {
  font-size: 14px;
  font-weight: 700;
  color: var(--primary);
}

.familiar-hint {
  font-size: 11px;
  color: var(--text-muted);
  font-style: italic;
}

.pasajero-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.pago-card-actions-head {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.info-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 8px;
  border-top: 1px solid var(--bg);
}

.info-label {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: var(--text-muted);
}

.info-value {
  font-size: 13px;
  color: var(--text-soft);
  word-break: break-word;
}

/* Pager */
.pager {
  margin-top: 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.pager-text {
  font-size: 13px;
  color: var(--text-muted);
}

.pager-text strong {
  color: var(--primary);
}

.pager-btns {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.desktop-only {
  display: block;
}

.mobile-only {
  display: none;
}

/* Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 16px;
}

.modal-box {
  width: min(520px, 100%);
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 0;
}

.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--border);
}

.modal-head h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  color: var(--primary);
}

.modal-body {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.modal-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.modal-foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid var(--border);
  flex-wrap: wrap;
}

.error-msg {
  color: #e53e3e;
  font-size: 13px;
  margin: 12px 0 0;
}

.edit-pasajero-label {
  margin: 0 0 14px;
  font-size: 13px;
  color: var(--text-muted);
  padding: 10px 14px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid var(--border);
}

/* WhatsApp */
.wa-empty { color: var(--text-muted); font-size: 13px; padding: 8px 0; }
.wa-lista { display: flex; flex-direction: column; gap: 10px; }
.wa-item {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; padding: 10px 14px;
  border: 1px solid var(--border); border-radius: 10px; flex-wrap: wrap;
}
.wa-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.wa-info strong { font-size: 14px; font-weight: 700; color: var(--primary); }
.wa-tel { font-size: 12px; color: var(--text-muted); }
.wa-sin-tel { font-size: 12px; color: #94a3b8; font-style: italic; }
.btn-wa {
  padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 700;
  background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0;
  text-decoration: none; white-space: nowrap; flex-shrink: 0;
}
.btn-wa:hover { background: #bbf7d0; }
.btn-wa-disabled { background: #f1f5f9; color: #94a3b8; border-color: var(--border); cursor: default; }

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 4px 8px;
  border-radius: 6px;
}

.btn-icon:hover {
  background: var(--bg);
}

.close-btn {
  font-size: 1.1rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ── RESPONSIVO ─────────────────────────── */
@media (max-width: 1100px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 980px) {
  .page-head {
    flex-direction: column;
    align-items: stretch;
  }

  .head-actions {
    justify-content: stretch;
  }

  .filters-top {
    grid-template-columns: 1fr;
  }

  .filters-actions {
    width: 100%;
  }

  .filters-actions button {
    flex: 1;
  }

  .pager {
    flex-direction: column;
    align-items: stretch;
  }
}

@media (max-width: 768px) {
  .desktop-only {
    display: none;
  }

  .mobile-only {
    display: flex;
  }

  .page-head,
  .filters,
  .table-wrap {
    padding: 16px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .pager-btns {
    display: grid;
    grid-template-columns: 1fr 1fr;
    width: 100%;
  }

  .pager-btns button {
    width: 100%;
  }

  /* Modal como sheet desde abajo en mobile */
  .modal-backdrop {
    align-items: flex-end;
    padding: 0;
  }

  .modal-box {
    width: 100%;
    max-height: 92vh;
    border-radius: 16px 16px 0 0;
  }

  .modal-grid {
    grid-template-columns: 1fr;
  }

  .modal-foot {
    flex-direction: column;
  }

  .modal-foot button {
    width: 100%;
  }
}

@media (max-width: 640px) {
  .head-actions {
    flex-direction: column;
  }

  .head-actions button,
  .filters-actions button {
    width: 100%;
  }

  .stats-grid {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .stat-card {
    padding: 14px;
  }

  .stat-value {
    font-size: 1.2rem;
  }
}
</style>