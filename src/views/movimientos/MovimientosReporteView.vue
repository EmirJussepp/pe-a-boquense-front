<template>
  <div class="page">
    <section class="page-head card">
      <div class="page-head-copy">
        <p class="eyebrow">Tesorería</p>
        <h1>Reporte de Movimientos</h1>
        <p class="page-subtitle">Análisis de ingresos y egresos del período seleccionado.</p>
      </div>

      <div class="head-actions">
        <button class="btn-secondary" type="button" @click="volverListado">Ver movimientos</button>
        <button class="btn-primary" type="button" @click="loadMovimientos" :disabled="loading">
          {{ loading ? "Actualizando..." : "Actualizar" }}
        </button>
      </div>
    </section>

    <section class="filters card">
      <div class="filters-grid">
        <div class="field">
          <label>Desde</label>
          <input v-model="filtro.desde" type="date" />
        </div>
        <div class="field">
          <label>Hasta</label>
          <input v-model="filtro.hasta" type="date" />
        </div>
        <div class="field">
          <label>Tipo</label>
          <select v-model="filtro.tipo">
            <option value="">Todos</option>
            <option value="INGRESO">Ingresos</option>
            <option value="EGRESO">Egresos</option>
          </select>
        </div>
        <div class="field">
          <label>Método</label>
          <select v-model="filtro.metodo">
            <option value="">Todos</option>
            <option v-for="metodo in metodosDisponibles" :key="metodo" :value="metodo">
              {{ metodo }}
            </option>
          </select>
        </div>
        <div class="field field-span-2">
          <label>Buscar</label>
          <input v-model.trim="filtro.search" type="text" placeholder="Descripción..." />
        </div>
        <div class="filters-actions">
          <button class="btn-secondary" type="button" @click="clearFilters" :disabled="!hasActiveFilters">Limpiar</button>
        </div>
      </div>
    </section>

    <section class="kpi-grid">
      <article class="kpi-card card">
        <span class="kpi-label">Total ingresos</span>
        <strong class="kpi-value text-success">$ {{ formatMoney(totalIngresos) }}</strong>
      </article>
      <article class="kpi-card card">
        <span class="kpi-label">Total egresos</span>
        <strong class="kpi-value text-danger">$ {{ formatMoney(totalEgresos) }}</strong>
      </article>
      <article class="kpi-card card">
        <span class="kpi-label">Balance neto</span>
        <strong class="kpi-value" :class="balanceNeto >= 0 ? 'text-success' : 'text-danger'">
          $ {{ formatMoney(balanceNeto) }}
        </strong>
      </article>
      <article class="kpi-card card">
        <span class="kpi-label">Movimientos</span>
        <strong class="kpi-value">{{ movimientosFiltrados.length }}</strong>
      </article>
    </section>

    <section class="content-grid">
      <div class="main-column">
        <section class="card">
          <div class="table-top">
            <h2>Detalle</h2>
            <span class="count-badge">{{ movimientosFiltrados.length }}</span>
          </div>

          <div v-if="loading" class="skeleton-wrap">
            <div v-for="n in 5" :key="n" class="skeleton-row"></div>
          </div>

          <div v-else-if="!movimientosFiltrados.length" class="empty-state">
            <p>No hay movimientos para los filtros seleccionados.</p>
          </div>

          <template v-else>
            <div class="table-scroll desktop-only">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>FECHA</th>
                    <th>DESCRIPCIÓN</th>
                    <th>TIPO</th>
                    <th>MÉTODO</th>
                    <th>MONTO</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="movimiento in movimientosFiltrados" :key="movimiento.id">
                    <td>{{ formatDate(movimiento.fecha) }}</td>
                    <td><strong>{{ movimiento.descripcion || "—" }}</strong></td>
                    <td>
                      <span class="badge" :class="movimiento.tipo === 'INGRESO' ? 'badge-success' : 'badge-danger'">
                        {{ movimiento.tipo }}
                      </span>
                    </td>
                    <td>{{ movimiento.metodoPagoNombre || "—" }}</td>
                    <td class="money-cell" :class="movimiento.tipo === 'INGRESO' ? 'text-success' : 'text-danger'">
                      $ {{ formatMoney(movimiento.monto) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="mobile-cards mobile-only">
              <article v-for="movimiento in movimientosFiltrados" :key="`r-${movimiento.id}`" class="mov-card">
                <div class="mov-card-head">
                  <strong class="mov-desc">{{ movimiento.descripcion || "Sin descripción" }}</strong>
                  <span class="badge" :class="movimiento.tipo === 'INGRESO' ? 'badge-success' : 'badge-danger'">
                    {{ movimiento.tipo }}
                  </span>
                </div>
                <div class="info-row">
                  <span class="info-label">Monto</span>
                  <span class="info-value money-cell" :class="movimiento.tipo === 'INGRESO' ? 'text-success' : 'text-danger'">
                    $ {{ formatMoney(movimiento.monto) }}
                  </span>
                </div>
                <div class="info-row">
                  <span class="info-label">Fecha</span>
                  <span class="info-value">{{ formatDate(movimiento.fecha) }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Método</span>
                  <span class="info-value">{{ movimiento.metodoPagoNombre || "—" }}</span>
                </div>
              </article>
            </div>
          </template>
        </section>
      </div>

      <aside class="side-column">
        <section class="card">
          <h2 class="section-title">Por método</h2>
          <div v-if="!resumenPorMetodo.length" class="empty-state small"><p>Sin datos.</p></div>
          <div v-else class="resume-list">
            <div v-for="item in resumenPorMetodo" :key="item.nombre" class="resume-item">
              <div class="resume-top">
                <span class="resume-name">{{ item.nombre }}</span>
                <span class="resume-count">{{ item.cantidad }} mov.</span>
              </div>
              <div class="resume-sub">
                <span class="text-success">+ $ {{ formatMoney(item.ingresos) }}</span>
                <span class="text-danger">- $ {{ formatMoney(item.egresos) }}</span>
              </div>
              <div class="resume-balance">
                Balance:
                <strong :class="item.balance >= 0 ? 'text-success' : 'text-danger'">
                  $ {{ formatMoney(item.balance) }}
                </strong>
              </div>
            </div>
          </div>
        </section>

        <section class="card side-gap">
          <h2 class="section-title">Últimos movimientos</h2>
          <div v-if="!ultimosMovimientos.length" class="empty-state small"><p>Sin datos.</p></div>
          <div v-else class="last-list">
            <div v-for="movimiento in ultimosMovimientos" :key="`u-${movimiento.id}`" class="last-item">
              <div class="last-top">
                <strong class="last-title">{{ movimiento.descripcion || "Sin descripción" }}</strong>
                <span class="badge" :class="movimiento.tipo === 'INGRESO' ? 'badge-success' : 'badge-danger'">
                  {{ movimiento.tipo }}
                </span>
              </div>
              <div class="last-sub">{{ formatDate(movimiento.fecha) }} · {{ movimiento.metodoPagoNombre || "Sin método" }}</div>
              <div class="last-amount" :class="movimiento.tipo === 'INGRESO' ? 'text-success' : 'text-danger'">
                $ {{ formatMoney(movimiento.monto) }}
              </div>
            </div>
          </div>
        </section>
      </aside>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue"
import { useRouter } from "vue-router"
import { movimientosService } from "../../services/movimientosService"
import { useToast } from "../../composables/useToast"

const router = useRouter()
const toast = useToast()

const loading = ref(false)
const rows = ref([])

const filtro = ref({
  desde: "",
  hasta: "",
  tipo: "",
  metodo: "",
  search: "",
})

const hasActiveFilters = computed(() =>
  !!filtro.value.desde || !!filtro.value.hasta ||
  !!filtro.value.tipo || !!filtro.value.metodo ||
  !!filtro.value.search.trim()
)

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

const metodosDisponibles = computed(() => {
  const values = rows.value.map((item) => item.metodoPagoNombre).filter((v) => v?.trim())
  return [...new Set(values)].sort((a, b) => a.localeCompare(b))
})

const movimientosFiltrados = computed(() => {
  let result = [...rows.value]

  if (filtro.value.desde) {
    const desde = new Date(`${filtro.value.desde}T00:00:00`).getTime()
    result = result.filter((item) => {
      const t = new Date(item.fecha).getTime()
      return !Number.isNaN(t) && t >= desde
    })
  }

  if (filtro.value.hasta) {
    const hasta = new Date(`${filtro.value.hasta}T23:59:59`).getTime()
    result = result.filter((item) => {
      const t = new Date(item.fecha).getTime()
      return !Number.isNaN(t) && t <= hasta
    })
  }

  if (filtro.value.tipo) {
    result = result.filter((item) => item.tipo === filtro.value.tipo)
  }

  if (filtro.value.metodo) {
    result = result.filter((item) => item.metodoPagoNombre === filtro.value.metodo)
  }

  if (filtro.value.search.trim()) {
    const term = filtro.value.search.trim().toLowerCase()
    result = result.filter((item) =>
      String(item.descripcion || "").toLowerCase().includes(term)
    )
  }

  result.sort((a, b) => {
    const fa = new Date(a.fecha).getTime() || 0
    const fb = new Date(b.fecha).getTime() || 0
    return fb - fa
  })

  return result
})

const totalIngresos = computed(() =>
  movimientosFiltrados.value
    .filter((item) => item.tipo === "INGRESO")
    .reduce((acc, item) => acc + Number(item.monto || 0), 0)
)

const totalEgresos = computed(() =>
  movimientosFiltrados.value
    .filter((item) => item.tipo === "EGRESO")
    .reduce((acc, item) => acc + Number(item.monto || 0), 0)
)

const balanceNeto = computed(() => totalIngresos.value - totalEgresos.value)

const resumenPorMetodo = computed(() => {
  const map = new Map()
  for (const item of movimientosFiltrados.value) {
    const key = item.metodoPagoNombre || "Sin método"
    if (!map.has(key)) map.set(key, { nombre: key, cantidad: 0, ingresos: 0, egresos: 0, balance: 0 })
    const cur = map.get(key)
    cur.cantidad++
    if (item.tipo === "INGRESO") cur.ingresos += Number(item.monto || 0)
    else if (item.tipo === "EGRESO") cur.egresos += Number(item.monto || 0)
    cur.balance = cur.ingresos - cur.egresos
  }
  return [...map.values()].sort((a, b) => b.cantidad - a.cantidad)
})

const ultimosMovimientos = computed(() => movimientosFiltrados.value.slice(0, 5))

async function loadMovimientos() {
  loading.value = true
  try {
    const { data } = await movimientosService.listar()
    rows.value = Array.isArray(data)
      ? data.map(normalizeMovimiento).filter((item) => item.id > 0)
      : []
  } catch (err) {
    console.error("Error cargando movimientos", err)
    toast.error("Error al cargar los movimientos.")
  } finally {
    loading.value = false
  }
}

function clearFilters() {
  filtro.value = { desde: "", hasta: "", tipo: "", metodo: "", search: "" }
}

function volverListado() {
  router.push("/movimientos")
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatDate(value) {
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
.filters-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; align-items: end; }
.field { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.field label { font-size: 12px; font-weight: 700; color: var(--text-muted); }
.field-span-2 { grid-column: span 2; }
.filters-actions { display: flex; gap: 8px; align-items: flex-end; }

.kpi-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
.kpi-card { padding: 18px; display: flex; flex-direction: column; gap: 6px; }
.kpi-label { font-size: 12px; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; }
.kpi-value { font-size: 1.6rem; font-weight: 900; color: var(--primary); }

.content-grid { display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: 16px; align-items: start; }

.table-top { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; padding: 22px 22px 0; }
.table-top h2 { margin: 0; font-size: 18px; font-weight: 800; color: var(--primary); flex: 1; }
.count-badge { background: var(--bg); border: 1px solid var(--border); border-radius: 999px; padding: 4px 10px; font-size: 12px; font-weight: 700; color: var(--text-muted); }

.table-scroll { overflow-x: auto; padding: 0 22px 22px; }
.data-table { width: 100%; min-width: 600px; border-collapse: collapse; }
.data-table th { text-align: left; padding: 10px 14px; font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.6px; font-weight: 800; background: #f8fafc; border-bottom: 2px solid var(--border); }
.data-table td { padding: 14px; border-bottom: 1px solid var(--bg); vertical-align: middle; font-size: 13px; }
.data-table tbody tr:hover { background: rgba(0,59,122,0.02); }

.money-cell { font-weight: 800; }
.text-success { color: #15803d; }
.text-danger { color: #b91c1c; }

.badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 800; letter-spacing: 0.4px; }
.badge-success { background: rgba(34,197,94,0.12); color: #15803d; }
.badge-danger { background: rgba(239,68,68,0.12); color: #b91c1c; }

.skeleton-wrap { display: flex; flex-direction: column; gap: 10px; padding: 0 22px 22px; }
.skeleton-row { height: 52px; background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%); background-size: 200% 100%; animation: shimmer 1.2s infinite; border-radius: 8px; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

.empty-state { min-height: 120px; display: grid; place-items: center; padding: 0 22px 22px; }
.empty-state p { margin: 0; color: var(--text-muted); font-size: 14px; }
.empty-state.small { min-height: 60px; }

.section-title { margin: 0 0 16px; font-size: 16px; font-weight: 800; color: var(--primary); }
.side-column { display: flex; flex-direction: column; gap: 16px; }
.card { padding: 20px; }

.resume-list, .last-list { display: flex; flex-direction: column; gap: 10px; }
.resume-item, .last-item { background: var(--bg); border: 1px solid var(--border); border-radius: 10px; padding: 12px 14px; }
.resume-top, .last-top { display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap; }
.resume-name, .last-title { color: var(--primary); font-weight: 700; font-size: 13px; min-width: 0; word-break: break-word; }
.resume-count, .last-sub { color: var(--text-muted); font-size: 12px; }
.resume-sub { display: flex; justify-content: space-between; gap: 10px; margin-top: 8px; font-size: 12px; flex-wrap: wrap; }
.resume-balance { margin-top: 8px; font-size: 13px; color: var(--text-soft); }
.last-amount { margin-top: 6px; font-weight: 800; font-size: 13px; }
.side-gap { margin-top: 0; }

/* Mobile cards */
.mobile-cards { display: flex; flex-direction: column; gap: 12px; padding: 0 22px 22px; }
.mov-card { border: 1px solid var(--border); border-radius: 12px; padding: 14px; background: white; display: flex; flex-direction: column; gap: 8px; }
.mov-card-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; }
.mov-desc { font-size: 14px; color: var(--primary); font-weight: 700; min-width: 0; word-break: break-word; }
.info-row { display: flex; flex-direction: column; gap: 3px; padding-top: 6px; border-top: 1px solid var(--bg); }
.info-label { font-size: 11px; font-weight: 800; letter-spacing: 0.4px; text-transform: uppercase; color: var(--text-muted); }
.info-value { font-size: 13px; color: var(--text-soft); }

.desktop-only { display: block; }
.mobile-only { display: none; }

@media (max-width: 1200px) {
  .filters-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .field-span-2 { grid-column: span 3; }
  .content-grid { grid-template-columns: 1fr; }
  .side-column { flex-direction: row; flex-wrap: wrap; }
  .side-column > * { flex: 1 1 280px; }
}

@media (max-width: 900px) {
  .kpi-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .filters-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .field-span-2 { grid-column: span 2; }
  .filters-actions { grid-column: 1 / -1; }
}

@media (max-width: 768px) {
  .desktop-only { display: none; }
  .mobile-only { display: flex; }
  .page-head { flex-direction: column; align-items: stretch; }
  .head-actions { justify-content: stretch; flex-direction: column; }
  .head-actions button { width: 100%; }
  .page-head, .filters { padding: 16px; }
  .table-top { padding: 16px 16px 0; }
  .skeleton-wrap, .mobile-cards, .empty-state { padding: 0 16px 16px; }
  .side-column { flex-direction: column; }
  .side-column > * { flex: none; }
}

@media (max-width: 640px) {
  .kpi-grid { grid-template-columns: 1fr; }
  .filters-grid { grid-template-columns: 1fr; }
  .field-span-2 { grid-column: span 1; }
}
</style>