<template>
  <div class="calendario-page">

    <section class="page-head card">
      <div class="page-head-copy">
        <p class="eyebrow">Salones</p>
        <h1>Calendario de Alquileres</h1>
        <p class="page-subtitle">Visualizá las reservas del mes en curso.</p>
      </div>
      <div class="head-actions">
        <button class="btn-secondary" @click="irListado">Ver listado</button>
        <button class="btn-primary" @click="nuevoAlquiler">Nuevo alquiler</button>
      </div>
    </section>

    <section class="card calendario-card">

      <!-- Nav del mes -->
      <div class="mes-nav">
        <button class="nav-btn" @click="mesPrev">‹</button>
        <h2 class="mes-titulo">{{ mesNombre }} {{ anio }}</h2>
        <button class="nav-btn" @click="mesSig">›</button>
        <button class="btn-hoy" @click="irHoy">Hoy</button>
      </div>

      <!-- Cabecera días -->
      <div class="cal-grid">
        <div class="cal-dow" v-for="d in diasSemana" :key="d">{{ d }}</div>

        <!-- Celdas del mes -->
        <div
          v-for="celda in celdas"
          :key="celda.key"
          class="cal-cell"
          :class="{ 'otro-mes': !celda.esEsteMes, 'hoy': celda.esHoy }"
          @click="celda.esEsteMes && abrirDia(celda)"
        >
          <span class="cal-day-num">{{ celda.dia }}</span>

          <div class="cal-events">
            <div
              v-for="a in celda.alquileres"
              :key="a.alquilerId"
              class="cal-event"
              :class="a.condicion ? 'badge-success' : 'badge-warning'"
              :title="`${a.nombre || 'Sin nombre'} — ${formatoHora(a.fecha)}`"
              @click.stop="editarAlquiler(a)"
            >
              {{ a.nombre || "Reserva" }}
            </div>
            <div v-if="celda.masCount > 0" class="cal-mas">+{{ celda.masCount }} más</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Modal detalle del día -->
    <div v-if="diaSeleccionado" class="modal-overlay" @click.self="diaSeleccionado = null">
      <div class="modal-card">
        <div class="modal-header">
          <h3>{{ formatearFechaLarga(diaSeleccionado.fecha) }}</h3>
          <button class="modal-close" @click="diaSeleccionado = null">✕</button>
        </div>

        <div v-if="!diaSeleccionado.alquileres.length" class="empty-state-sm">
          No hay alquileres este día.
        </div>

        <div v-else class="modal-list">
          <div v-for="a in diaSeleccionado.alquileres" :key="a.alquilerId" class="modal-item">
            <div class="modal-item-top">
              <strong>{{ a.nombre || "Sin nombre" }}</strong>
              <span class="badge" :class="a.condicion ? 'badge-success' : 'badge-warning'">
                {{ a.condicion ? "Con seña" : "Sin seña" }}
              </span>
            </div>
            <p class="modal-item-sub">🕐 {{ formatoHora(a.fecha) }}</p>
            <p class="modal-item-sub">📋 DNI: {{ a.dni || "—" }}</p>
            <p class="modal-item-sub">📞 {{ a.telefono || "—" }}</p>
            <p class="modal-item-sub">💰 $ {{ formatoMoneda(a.monto) }}</p>
            <p v-if="a.observaciones" class="modal-item-sub">📝 {{ a.observaciones }}</p>
            <div class="modal-item-actions">
              <button class="table-btn" @click="editarAlquiler(a)">Editar</button>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-primary" @click="nuevoAlquilerDia(diaSeleccionado.fecha)">
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

const router = useRouter()
const hoy = new Date()
const mesActual = ref(hoy.getMonth())
const anio = ref(hoy.getFullYear())
const alquileres = ref([])
const diaSeleccionado = ref(null)

const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
const mesesNombres = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]
const mesNombre = computed(() => mesesNombres[mesActual.value])

const MAX_VISIBLE = 2

const celdas = computed(() => {
  const primerDia = new Date(anio.value, mesActual.value, 1)
  const inicio = new Date(primerDia)
  inicio.setDate(inicio.getDate() - inicio.getDay())

  const result = []
  const cursor = new Date(inicio)

  for (let i = 0; i < 42; i++) {
    const fecha = new Date(cursor)
    const esEsteMes = fecha.getMonth() === mesActual.value
    const esHoy = fecha.toDateString() === hoy.toDateString()
    const fechaStr = fecha.toISOString().slice(0, 10)

    const alqsDia = alquileres.value.filter(a => {
      if (!a.fecha) return false
      // El backend devuelve fecha como string ISO, normalizamos
      const f = new Date(a.fecha)
      return f.toISOString().slice(0, 10) === fechaStr
    })

    result.push({
      key: fechaStr,
      dia: fecha.getDate(),
      fecha,
      esEsteMes,
      esHoy,
      alquileres: alqsDia.slice(0, MAX_VISIBLE),
      masCount: Math.max(0, alqsDia.length - MAX_VISIBLE),
    })
    cursor.setDate(cursor.getDate() + 1)
  }
  return result
})

function mesPrev() {
  if (mesActual.value === 0) { mesActual.value = 11; anio.value-- }
  else mesActual.value--
}
function mesSig() {
  if (mesActual.value === 11) { mesActual.value = 0; anio.value++ }
  else mesActual.value++
}
function irHoy() { mesActual.value = hoy.getMonth(); anio.value = hoy.getFullYear() }
function abrirDia(celda) { diaSeleccionado.value = celda }
function nuevoAlquiler() { router.push("/alquileres/nuevo") }
function irListado() { router.push("/alquileres") }
function editarAlquiler(a) {
  router.push(`/alquileres/${a.alquilerId}/editar`)
  diaSeleccionado.value = null
}
function nuevoAlquilerDia(fecha) {
  const pad = n => String(n).padStart(2, "0")
  const iso = `${fecha.getFullYear()}-${pad(fecha.getMonth()+1)}-${pad(fecha.getDate())}T09:00`
  router.push({ path: "/alquileres/nuevo", query: { fecha: iso } })
  diaSeleccionado.value = null
}

function formatoMoneda(n) {
  return Number(n || 0).toLocaleString("es-AR", { minimumFractionDigits: 2 })
}
function formatoHora(f) {
  if (!f) return "—"
  return new Intl.DateTimeFormat("es-AR", { hour: "2-digit", minute: "2-digit" }).format(new Date(f))
}
function formatearFechaLarga(fecha) {
  return new Intl.DateTimeFormat("es-AR", { weekday: "long", day: "numeric", month: "long" }).format(fecha)
}

onMounted(async () => {
  try {
    const { data } = await alquileresService.listar()
    alquileres.value = data || []
  } catch (e) {
    console.error("Error cargando alquileres", e)
  }
})
</script>

<style scoped>
.calendario-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 28px 32px;
  background: var(--bg);
  min-height: 100vh;
}

.card {
  background: white;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  box-shadow: var(--shadow-sm);
}

.page-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; }
.eyebrow { color: var(--accent); font-weight: 800; font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; margin: 0 0 4px; }
.page-head h1 { font-size: 30px; font-weight: 900; color: var(--primary); margin: 0 0 4px; }
.page-subtitle { color: var(--text-muted); font-size: 13px; margin: 0; }
.head-actions { display: flex; gap: 10px; align-items: center; flex-shrink: 0; }

.btn-primary { background: var(--primary); color: white; border: none; border-radius: 8px; padding: 10px 20px; font-weight: 700; font-size: 13px; cursor: pointer; }
.btn-primary:hover { opacity: 0.85; }
.btn-secondary { background: white; color: var(--text-main); border: 1px solid var(--border); border-radius: 8px; padding: 10px 20px; font-weight: 600; font-size: 13px; cursor: pointer; }
.btn-hoy { background: rgba(241,180,76,0.12); color: #9c6e1e; border: 1px solid rgba(241,180,76,0.4); border-radius: 8px; padding: 7px 14px; font-size: 12px; font-weight: 700; cursor: pointer; margin-left: 8px; }

.mes-nav { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
.mes-titulo { font-size: 20px; font-weight: 900; color: var(--primary); margin: 0; min-width: 200px; text-align: center; }
.nav-btn { background: #f1f5f9; border: 1px solid var(--border); border-radius: 8px; width: 32px; height: 32px; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--primary); font-weight: 900; }
.nav-btn:hover { background: var(--primary); color: white; }

.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: var(--border);
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
}
.cal-dow {
  background: #f8fafc;
  text-align: center;
  padding: 10px 4px;
  font-size: 11px;
  font-weight: 800;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.cal-cell {
  background: white;
  min-height: 110px;
  padding: 8px;
  cursor: pointer;
  transition: background 0.15s;
  overflow: hidden;
}
.cal-cell:hover { background: #f8fafc; }
.cal-cell.otro-mes { background: #fafafa; cursor: default; }
.cal-cell.otro-mes .cal-day-num { color: #d1d5db; }
.cal-cell.hoy { background: rgba(241,180,76,0.07); }
.cal-cell.hoy .cal-day-num {
  background: var(--accent);
  color: var(--primary);
  border-radius: 50%;
  width: 26px; height: 26px;
  display: flex; align-items: center; justify-content: center;
  font-weight: 900;
}
.cal-day-num { font-size: 13px; font-weight: 700; color: var(--primary); margin-bottom: 5px; display: inline-block; }

.cal-events { display: flex; flex-direction: column; gap: 2px; }
.cal-event {
  font-size: 10px; font-weight: 700;
  padding: 2px 6px; border-radius: 4px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  cursor: pointer;
}
.cal-event:hover { opacity: 0.8; }
.cal-mas { font-size: 10px; color: var(--text-muted); padding: 1px 4px; font-style: italic; }

.badge-success { background: rgba(34,197,94,0.15); color: #15803d; }
.badge-warning  { background: rgba(241,180,76,0.2); color: #9c6e1e; }

.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 100;
  display: flex; align-items: center; justify-content: center;
}
.modal-card {
  background: white; border-radius: 14px; padding: 24px;
  width: 420px; max-width: 95vw;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  max-height: 80vh; overflow-y: auto;
}
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.modal-header h3 { font-size: 16px; font-weight: 800; color: var(--primary); margin: 0; text-transform: capitalize; }
.modal-close { background: none; border: none; font-size: 16px; color: var(--text-muted); cursor: pointer; padding: 4px 8px; border-radius: 6px; }
.modal-close:hover { background: #f1f5f9; }

.modal-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; }
.modal-item { background: #f8fafc; border-radius: 8px; padding: 12px; border: 1px solid var(--border); }
.modal-item-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.modal-item-sub { font-size: 12px; color: var(--text-muted); margin: 3px 0; }
.modal-item-actions { margin-top: 10px; }

.modal-footer { border-top: 1px solid var(--border); padding-top: 14px; }

.badge { display: inline-block; padding: 3px 10px; border-radius: 6px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }

.table-btn { background: #f1f5f9; border: 1px solid var(--border); border-radius: 6px; padding: 5px 12px; font-size: 12px; font-weight: 600; cursor: pointer; color: var(--text-main); }

.empty-state-sm { text-align: center; color: var(--text-muted); font-size: 13px; padding: 20px 0; }
</style>