<template>
  <div class="reportes-page">
    <section class="page-head card">
      <div class="page-head-copy">
        <p class="eyebrow">Tesorería</p>
        <h1>Reporte de Movimientos</h1>
        <p class="page-subtitle">
          Análisis de ingresos y egresos del período seleccionado.
        </p>
      </div>

      <div class="head-actions">
        <button class="btn-secondary" type="button" @click="volverListado">
          Ver movimientos
        </button>
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
            <option
              v-for="metodo in metodosDisponibles"
              :key="metodo"
              :value="metodo"
            >
              {{ metodo }}
            </option>
          </select>
        </div>

        <div class="field field-grow">
          <label>Buscar</label>
          <input
            v-model.trim="filtro.search"
            type="text"
            placeholder="Descripción..."
          />
        </div>

        <div class="filters-actions">
          <button class="btn-primary" type="button" @click="applyFilters">
            Aplicar
          </button>
          <button class="btn-secondary" type="button" @click="clearFilters">
            Limpiar
          </button>
        </div>
      </div>
    </section>

    <section class="kpi-grid">
      <article class="kpi-card card">
        <span class="kpi-label">Total ingresos</span>
        <strong class="kpi-value success">$ {{ formatMoney(totalIngresos) }}</strong>
      </article>

      <article class="kpi-card card">
        <span class="kpi-label">Total egresos</span>
        <strong class="kpi-value danger">$ {{ formatMoney(totalEgresos) }}</strong>
      </article>

      <article class="kpi-card card">
        <span class="kpi-label">Balance neto</span>
        <strong
          class="kpi-value"
          :class="balanceNeto >= 0 ? 'accent' : 'danger'"
        >
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
            <p class="muted">{{ movimientosFiltrados.length }} resultado(s)</p>
          </div>

          <div v-if="loading" class="empty-state">Cargando movimientos...</div>
          <div v-else-if="!movimientosFiltrados.length" class="empty-state">
            No hay movimientos para los filtros seleccionados.
          </div>

          <div v-else class="table-scroll">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Descripción</th>
                  <th>Tipo</th>
                  <th>Método</th>
                  <th>Monto</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="movimiento in movimientosFiltrados" :key="movimiento.id">
                  <td>{{ formatDate(movimiento.fecha) }}</td>

                  <td>
                    <strong>{{ movimiento.descripcion || "—" }}</strong>
                  </td>

                  <td>
                    <span
                      class="badge"
                      :class="movimiento.tipo === 'INGRESO' ? 'badge-success' : 'badge-danger'"
                    >
                      {{ movimiento.tipo }}
                    </span>
                  </td>

                  <td>{{ movimiento.metodoPagoNombre || "—" }}</td>

                  <td
                    class="amount-cell"
                    :class="movimiento.tipo === 'INGRESO' ? 'text-success' : 'text-danger'"
                  >
                    $ {{ formatMoney(movimiento.monto) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <aside class="side-column">
        <section class="card">
          <h2 class="section-title">Resumen por método</h2>

          <div v-if="!resumenPorMetodo.length" class="empty-state small">
            Sin datos.
          </div>

          <div v-else class="resume-list">
            <div
              v-for="item in resumenPorMetodo"
              :key="item.nombre"
              class="resume-item"
            >
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

          <div v-if="!ultimosMovimientos.length" class="empty-state small">
            Sin datos.
          </div>

          <div v-else class="last-list">
            <div
              v-for="movimiento in ultimosMovimientos"
              :key="movimiento.id"
              class="last-item"
            >
              <div class="last-top">
                <strong class="last-title">{{ movimiento.descripcion || "Sin descripción" }}</strong>
                <span
                  class="badge"
                  :class="movimiento.tipo === 'INGRESO' ? 'badge-success' : 'badge-danger'"
                >
                  {{ movimiento.tipo }}
                </span>
              </div>

              <div class="last-sub">
                {{ formatDate(movimiento.fecha) }} · {{ movimiento.metodoPagoNombre || "Sin método" }}
              </div>

              <div
                class="last-amount"
                :class="movimiento.tipo === 'INGRESO' ? 'text-success' : 'text-danger'"
              >
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

const router = useRouter()

const loading = ref(false)
const rows = ref([])

const filtro = ref({
  desde: "",
  hasta: "",
  tipo: "",
  metodo: "",
  search: "",
})

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
  const values = rows.value
    .map((item) => item.metodoPagoNombre)
    .filter((item) => item && item.trim())

  return [...new Set(values)].sort((a, b) => a.localeCompare(b))
})

const movimientosFiltrados = computed(() => {
  let result = [...rows.value]

  if (filtro.value.desde) {
    const desde = new Date(`${filtro.value.desde}T00:00:00`).getTime()
    result = result.filter((item) => {
      const time = new Date(item.fecha).getTime()
      return !Number.isNaN(time) && time >= desde
    })
  }

  if (filtro.value.hasta) {
    const hasta = new Date(`${filtro.value.hasta}T23:59:59`).getTime()
    result = result.filter((item) => {
      const time = new Date(item.fecha).getTime()
      return !Number.isNaN(time) && time <= hasta
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
      String(item.descripcion || "").toLowerCase().includes(term),
    )
  }

  result.sort((a, b) => {
    const fechaA = new Date(a.fecha).getTime() || 0
    const fechaB = new Date(b.fecha).getTime() || 0
    return fechaB - fechaA
  })

  return result
})

const totalIngresos = computed(() =>
  movimientosFiltrados.value
    .filter((item) => item.tipo === "INGRESO")
    .reduce((acc, item) => acc + Number(item.monto || 0), 0),
)

const totalEgresos = computed(() =>
  movimientosFiltrados.value
    .filter((item) => item.tipo === "EGRESO")
    .reduce((acc, item) => acc + Number(item.monto || 0), 0),
)

const balanceNeto = computed(() => totalIngresos.value - totalEgresos.value)

const resumenPorMetodo = computed(() => {
  const map = new Map()

  for (const item of movimientosFiltrados.value) {
    const key = item.metodoPagoNombre || "Sin método"

    if (!map.has(key)) {
      map.set(key, {
        nombre: key,
        cantidad: 0,
        ingresos: 0,
        egresos: 0,
        balance: 0,
      })
    }

    const current = map.get(key)
    current.cantidad += 1

    if (item.tipo === "INGRESO") {
      current.ingresos += Number(item.monto || 0)
    } else if (item.tipo === "EGRESO") {
      current.egresos += Number(item.monto || 0)
    }

    current.balance = current.ingresos - current.egresos
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
  } catch (error) {
    console.error("Error cargando movimientos", error)
    rows.value = []
  } finally {
    loading.value = false
  }
}

function applyFilters() {
  // client-side
}

function clearFilters() {
  filtro.value = {
    desde: "",
    hasta: "",
    tipo: "",
    metodo: "",
    search: "",
  }
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
.reportes-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.page-head-copy {
  min-width: 0;
}

.head-actions {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(160px, 1fr));
  gap: 14px;
  align-items: end;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.field-grow {
  grid-column: span 2;
}

.filters-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.kpi-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.kpi-label {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 700;
}

.kpi-value {
  font-size: 26px;
  font-weight: 900;
  color: var(--primary);
}

.kpi-value.accent {
  color: var(--primary);
}

.kpi-value.success,
.text-success {
  color: #15803d;
}

.kpi-value.danger,
.text-danger {
  color: #b91c1c;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 20px;
  align-items: start;
}

.table-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.table-scroll {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  min-width: 720px;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 14px 12px;
  text-align: left;
  vertical-align: middle;
  border-bottom: 1px solid var(--border);
}

.amount-cell {
  font-weight: 800;
}

.section-title {
  margin: 0 0 16px;
}

.resume-list,
.last-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.resume-item,
.last-item {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 12px 14px;
}

.resume-top,
.last-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.resume-name,
.last-title {
  color: var(--primary);
}

.resume-count,
.last-sub {
  color: var(--text-muted);
  font-size: 12px;
}

.resume-sub {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 8px;
  font-size: 12px;
  flex-wrap: wrap;
}

.resume-balance {
  margin-top: 8px;
  font-size: 13px;
}

.last-amount {
  margin-top: 8px;
  font-weight: 800;
}

.side-gap {
  margin-top: 20px;
}

.empty-state.small {
  padding: 18px;
}

@media (max-width: 1200px) {
  .filters-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .field-grow {
    grid-column: span 3;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .filters-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .field-grow {
    grid-column: span 2;
  }

  .filters-actions {
    grid-column: 1 / -1;
  }
}

@media (max-width: 768px) {
  .page-head {
    flex-direction: column;
    align-items: stretch;
  }

  .head-actions {
    width: 100%;
  }

  .head-actions > * {
    flex: 1 1 180px;
  }

  .filters-grid {
    grid-template-columns: 1fr;
  }

  .field-grow {
    grid-column: span 1;
  }

  .filters-actions > * {
    flex: 1 1 100%;
  }

  .kpi-grid {
    grid-template-columns: 1fr;
  }

  .table-top {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>