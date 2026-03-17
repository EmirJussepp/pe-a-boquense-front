<template>
  <div class="page movimientos-page">
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

        <div class="field field-xs">
          <label>Tipo</label>
          <select v-model="tipo">
            <option value="">Todos</option>
            <option value="INGRESO">Ingresos</option>
            <option value="EGRESO">Egresos</option>
          </select>
        </div>

        <div class="filters-actions">
          <button class="btn-primary" type="button" @click="applyFilters">Buscar</button>
          <button class="btn-secondary" type="button" @click="clearFilters">Limpiar</button>
        </div>
      </div>
    </section>

    <section class="table-wrap card">
      <div class="table-top">
        <h2>Listado</h2>
        <p class="muted">{{ rowsFiltrados.length }} movimiento(s)</p>
      </div>

      <div v-if="loading" class="empty-state">Cargando movimientos...</div>

      <div v-else-if="!rowsFiltrados.length" class="empty-state">
        No hay movimientos registrados.
      </div>

      <div v-else class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>Descripción</th>
              <th>Tipo</th>
              <th>Monto</th>
              <th>Fecha</th>
              <th>Método</th>
              <th class="th-actions">Acciones</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="movimiento in rowsFiltrados" :key="movimiento.id">
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

              <td>$ {{ formatoMoneda(movimiento.monto) }}</td>
              <td>{{ formatearFecha(movimiento.fecha) }}</td>
              <td>{{ movimiento.metodoPagoNombre || "—" }}</td>

              <td>
                <div class="row-actions">
                  <button
                    class="table-btn danger"
                    type="button"
                    @click="eliminarMovimiento(movimiento)"
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue"
import { useRouter } from "vue-router"
import { movimientosService } from "../../services/movimientosService"
import { useAuthStore } from "../../stores/auth"

const router = useRouter()
const auth = useAuthStore()

const loading = ref(false)
const rows = ref([])
const search = ref("")
const tipo = ref("")

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
      "",
    ),
  }
}

const rowsFiltrados = computed(() => {
  let result = [...rows.value]

  if (search.value.trim()) {
    const term = search.value.toLowerCase()
    result = result.filter((item) =>
      String(item.descripcion || "").toLowerCase().includes(term),
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
  // filtros client-side
}

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

async function eliminarMovimiento(movimiento) {
  if (!confirm(`¿Eliminar el movimiento "${movimiento.descripcion || "sin descripción"}"?`)) {
    return
  }

  try {
    if (auth.userId != null) {
      await movimientosService.eliminar(movimiento.id, auth.userId)
    } else {
      await movimientosService.eliminar(movimiento.id)
    }

    await loadMovimientos()
  } catch (error) {
    console.error("No se pudo eliminar el movimiento.", error)
    alert("No se pudo eliminar el movimiento.")
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
.movimientos-page {
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

.filters-top {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 220px auto;
  gap: 14px;
  align-items: end;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.filters-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
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
  min-width: 760px;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 14px 12px;
  text-align: left;
  vertical-align: middle;
  border-bottom: 1px solid var(--border);
}

.row-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.badge-danger {
  background: rgba(239, 68, 68, 0.12);
  color: #b91c1c;
}

@media (max-width: 1024px) {
  .filters-top {
    grid-template-columns: 1fr 1fr;
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

  .filters-top {
    grid-template-columns: 1fr;
  }

  .filters-actions > * {
    flex: 1 1 100%;
  }

  .table-top {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>