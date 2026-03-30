<template>
  <div class="page">
    <section class="page-head card">
      <div class="page-head-copy">
        <p class="eyebrow">Salones</p>
        <h1>Calendario de Alquileres</h1>
        <p class="page-subtitle">Visualizá las reservas del mes en curso.</p>
      </div>
      <div class="head-actions">
        <button class="btn-secondary" type="button" @click="irListado">Ver listado</button>
        <button class="btn-primary" type="button" @click="nuevoAlquiler">Nuevo alquiler</button>
      </div>
    </section>

    <section class="card calendario-card">
      <div class="mes-nav">
        <div class="mes-nav-main">
          <button class="nav-btn" type="button" @click="mesPrev">‹</button>
          <h2 class="mes-titulo">{{ mesNombre }} {{ anio }}</h2>
          <button class="nav-btn" type="button" @click="mesSig">›</button>
        </div>
        <button class="btn-hoy" type="button" @click="irHoy">Hoy</button>
      </div>

      <div class="cal-grid">
        <div v-for="dia in diasSemana" :key="dia" class="cal-dow">{{ dia }}</div>

        <div
          v-for="celda in celdas"
          :key="celda.key"
          class="cal-cell"
          :class="{ 'otro-mes': !celda.esEsteMes, hoy: celda.esHoy }"
          @click="celda.esEsteMes && abrirDia(celda)"
        >
          <span class="cal-day-num">{{ celda.dia }}</span>
          <div class="cal-events">
            <div
              v-for="alquiler in celda.alquileres"
              :key="alquiler.id"
              class="cal-event"
              :class="alquiler.condicion ? 'event-success' : 'event-warning'"
              :title="`${alquiler.nombre || 'Reserva'} — ${formatoHora(alquiler.fecha)}`"
              @click.stop="editarAlquiler(alquiler)"
            >
              {{ alquiler.nombre || "Reserva" }}
            </div>
            <div v-if="celda.masCount > 0" class="cal-mas">+{{ celda.masCount }} más</div>
          </div>
        </div>
      </div>
    </section>

    <div v-if="diaSeleccionado" class="modal-overlay" @click.self="diaSeleccionado = null">
      <div class="modal-card">
        <div class="modal-header">
          <h3>{{ formatearFechaLarga(diaSeleccionado.fecha) }}</h3>
          <button class="modal-close" type="button" @click="diaSeleccionado = null"><X :size="16" /></button>
        </div>

        <div v-if="!diaSeleccionado.alquileres.length" class="empty-state-sm">
          No hay alquileres este día.
        </div>

        <div v-else class="modal-list">
          <div v-for="alquiler in diaSeleccionado.alquileres" :key="alquiler.id" class="modal-item">
            <div class="modal-item-top">
              <strong>{{ alquiler.nombre || "Sin nombre" }}</strong>
              <span class="badge" :class="alquiler.condicion ? 'badge-success' : 'badge-warning'">
                {{ alquiler.condicion ? "Con seña" : "Sin seña" }}
              </span>
            </div>
            <div class="modal-item-details">
              <p><span class="detail-label">Hora</span> {{ formatoHora(alquiler.fecha) }}</p>
              <p><span class="detail-label">DNI</span> {{ alquiler.dni || "—" }}</p>
              <p><span class="detail-label">Teléfono</span> {{ alquiler.telefono || "—" }}</p>
              <p><span class="detail-label">Monto</span> $ {{ formatoMoneda(alquiler.monto) }}</p>
              <p v-if="alquiler.observaciones"><span class="detail-label">Obs.</span> {{ alquiler.observaciones }}</p>
            </div>
            <div class="modal-item-actions">
              <button class="table-btn" type="button" @click="editarAlquiler(alquiler)">Editar</button>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-primary modal-footer-btn" type="button" @click="nuevoAlquilerDia(diaSeleccionado.fecha)">
            + Agregar alquiler este día
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue"
import { useRouter } from "vue-router"
import { alquileresService } from "../../services/alquileresService"
import { X } from "lucide-vue-next"

const router = useRouter()

const hoy = new Date()
const mesActual = ref(hoy.getMonth())
const anio = ref(hoy.getFullYear())
const alquileres = ref([])
const diaSeleccionado = ref(null)

const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
const mesesNombres = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]
const MAX_VISIBLE = 2

const mesNombre = computed(() => mesesNombres[mesActual.value])

function pad(value) { return String(value).padStart(2, "0") }

function localDateKey(value) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function normalizeAlquiler(item) {
  return {
    id: Number(item?.alquilerId ?? item?.id ?? 0),
    nombre: String(item?.nombre ?? ""),
    dni: String(item?.dni ?? ""),
    telefono: String(item?.telefono ?? ""),
    fecha: item?.fecha ?? null,
    monto: Number(item?.monto ?? 0),
    condicion: Boolean(item?.condicion),
    observaciones: String(item?.observaciones ?? ""),
  }
}

const celdas = computed(() => {
  const primerDia = new Date(anio.value, mesActual.value, 1)
  const inicio = new Date(primerDia)
  inicio.setDate(inicio.getDate() - inicio.getDay())

  const resultado = []
  const cursor = new Date(inicio)

  for (let i = 0; i < 42; i++) {
    const fecha = new Date(cursor)
    const key = localDateKey(fecha)
    const alquileresDelDia = alquileres.value.filter(item => item.fecha && localDateKey(item.fecha) === key)
    resultado.push({
      key, dia: fecha.getDate(), fecha,
      esEsteMes: fecha.getMonth() === mesActual.value,
      esHoy: key === localDateKey(hoy),
      alquileres: alquileresDelDia.slice(0, MAX_VISIBLE),
      masCount: Math.max(0, alquileresDelDia.length - MAX_VISIBLE),
    })
    cursor.setDate(cursor.getDate() + 1)
  }
  return resultado
})

function mesPrev() {
  if (mesActual.value === 0) { mesActual.value = 11; anio.value -= 1 }
  else mesActual.value -= 1
}
function mesSig() {
  if (mesActual.value === 11) { mesActual.value = 0; anio.value += 1 }
  else mesActual.value += 1
}
function irHoy() { mesActual.value = hoy.getMonth(); anio.value = hoy.getFullYear() }
function abrirDia(celda) { diaSeleccionado.value = celda }
function nuevoAlquiler() { router.push("/alquileres/nuevo") }
function irListado() { router.push("/alquileres") }
function editarAlquiler(alquiler) { router.push(`/alquileres/${alquiler.id}/editar`); diaSeleccionado.value = null }
function nuevoAlquilerDia(fecha) {
  const iso = `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}T09:00`
  router.push({ path: "/alquileres/nuevo", query: { fecha: iso } })
  diaSeleccionado.value = null
}

function formatoMoneda(value) {
  return Number(value || 0).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function formatoHora(value) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return new Intl.DateTimeFormat("es-AR", { hour: "2-digit", minute: "2-digit" }).format(date)
}
function formatearFechaLarga(fecha) {
  return new Intl.DateTimeFormat("es-AR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(fecha)
}

async function cargarAlquileres() {
  try {
    const { data } = await alquileresService.listar()
    alquileres.value = Array.isArray(data)
      ? data.map(normalizeAlquiler).filter(item => item.id > 0)
      : []
  } catch (err) {
    console.error("Error cargando alquileres", err)
    alquileres.value = []
  }
}

onMounted(cargarAlquileres)
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 16px; }
.page-head { padding: 22px; display: flex; justify-content: space-between; align-items: center; gap: 16px; }
.page-head-copy { min-width: 0; }
.eyebrow { margin: 0 0 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--accent); font-weight: 800; }
.page-head h1 { margin: 0 0 4px; font-size: clamp(1.6rem, 3vw, 2rem); font-weight: 900; color: var(--primary); }
.page-subtitle { margin: 0; color: var(--text-muted); font-size: 14px; }
.head-actions { display: flex; gap: 10px; flex-wrap: wrap; justify-content: flex-end; }

.calendario-card { padding: 22px; overflow: hidden; }
.mes-nav { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
.mes-nav-main { display: flex; align-items: center; gap: 12px; }
.mes-titulo { font-size: 20px; font-weight: 900; color: var(--primary); margin: 0; min-width: 220px; text-align: center; }
.nav-btn { background: #f1f5f9; border: 1px solid var(--border); border-radius: 8px; width: 36px; height: 36px; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--primary); font-weight: 900; flex-shrink: 0; transition: all 0.15s; }
.nav-btn:hover { background: var(--primary); color: white; }
.btn-hoy { background: rgba(241,180,76,0.12); color: #9c6e1e; border: 1px solid rgba(241,180,76,0.4); border-radius: 8px; padding: 8px 14px; font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.15s; }
.btn-hoy:hover { background: rgba(241,180,76,0.2); }

.cal-grid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 1px; background: var(--border); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
.cal-dow { background: #f8fafc; text-align: center; padding: 12px 6px; font-size: 11px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
.cal-cell { background: white; min-height: 110px; padding: 8px; cursor: pointer; transition: background 0.15s; overflow: hidden; }
.cal-cell:hover { background: #f8fafc; }
.cal-cell.otro-mes { background: #fafafa; cursor: default; }
.cal-cell.otro-mes .cal-day-num { color: #d1d5db; }
.cal-cell.hoy { background: rgba(241,180,76,0.07); }
.cal-cell.hoy .cal-day-num { background: var(--accent); color: var(--primary); border-radius: 999px; width: 26px; height: 26px; display: inline-flex; align-items: center; justify-content: center; font-weight: 900; }
.cal-day-num { font-size: 13px; font-weight: 700; color: var(--primary); margin-bottom: 6px; display: inline-block; }
.cal-events { display: flex; flex-direction: column; gap: 3px; }
.cal-event { font-size: 10px; font-weight: 700; padding: 3px 6px; border-radius: 5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer; transition: opacity 0.15s; }
.cal-event:hover { opacity: 0.8; }
.event-success { background: rgba(34,197,94,0.15); color: #15803d; }
.event-warning { background: rgba(241,180,76,0.2); color: #9c6e1e; }
.cal-mas { font-size: 10px; color: var(--text-muted); padding: 1px 4px; font-style: italic; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 16px; }
.modal-card { background: white; border-radius: 16px; padding: 24px; width: 500px; max-width: 100%; box-shadow: 0 20px 60px rgba(0,0,0,0.2); max-height: 85vh; overflow-y: auto; }
.modal-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 16px; }
.modal-header h3 { font-size: 16px; font-weight: 800; color: var(--primary); margin: 0; text-transform: capitalize; }
.modal-close { background: none; border: none; font-size: 16px; color: var(--text-muted); cursor: pointer; padding: 4px 8px; border-radius: 6px; flex-shrink: 0; }
.modal-close:hover { background: #f1f5f9; }
.modal-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; }
.modal-item { background: #f8fafc; border-radius: 10px; padding: 14px; border: 1px solid var(--border); }
.modal-item-top { display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 10px; flex-wrap: wrap; }
.modal-item-top strong { color: var(--primary); font-size: 14px; }
.modal-item-details { display: flex; flex-direction: column; gap: 4px; }
.modal-item-details p { margin: 0; font-size: 12px; color: var(--text-muted); }
.detail-label { font-weight: 700; color: var(--text-soft); margin-right: 6px; }
.modal-item-actions { margin-top: 12px; }
.modal-footer { border-top: 1px solid var(--border); padding-top: 14px; }
.modal-footer-btn { width: 100%; }
.badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 800; }
.badge-success { background: rgba(34,197,94,0.12); color: #15803d; }
.badge-warning { background: rgba(241,180,76,0.2); color: #9c6e1e; }
.table-btn { background: white; border: 1px solid var(--border); border-radius: 6px; padding: 7px 14px; font-size: 12px; font-weight: 700; cursor: pointer; color: var(--primary); transition: all 0.15s; }
.table-btn:hover { background: var(--bg); }
.empty-state-sm { text-align: center; color: var(--text-muted); font-size: 13px; padding: 20px 0; }

@media (max-width: 980px) {
  .page-head { flex-direction: column; align-items: stretch; }
  .head-actions { justify-content: stretch; }
}
@media (max-width: 768px) {
  .page-head, .calendario-card { padding: 16px; }
  .head-actions { flex-direction: column; }
  .head-actions button { width: 100%; }
  .mes-nav { flex-direction: column; align-items: stretch; }
  .mes-nav-main { justify-content: center; }
  .mes-titulo { min-width: 0; font-size: 17px; }
  .btn-hoy { width: 100%; }
  .cal-cell { min-height: 88px; padding: 6px; }
  .cal-dow { font-size: 10px; padding: 10px 4px; }
}
@media (max-width: 560px) {
  .cal-cell { min-height: 72px; }
  .cal-day-num { font-size: 11px; }
  .cal-event { font-size: 9px; padding: 2px 4px; }
}
</style>