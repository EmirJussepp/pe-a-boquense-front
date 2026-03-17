<template>
  <div class="page alquileres-page">
    <section class="page-head card">
      <div class="page-head-copy">
        <p class="eyebrow">Salones</p>
        <h1>Alquileres</h1>
        <p class="page-subtitle">
          Gestión de reservas y alquileres de salones.
        </p>
      </div>

      <div class="head-actions">
        <button class="btn-secondary" type="button" @click="loadAlquileres" :disabled="loading">
          {{ loading ? "Actualizando..." : "Actualizar" }}
        </button>
        <button class="btn-primary" type="button" @click="nuevoAlquiler">
          Nuevo alquiler
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
            placeholder="Cliente o DNI..."
            @keyup.enter="applyFilters"
          />
        </div>

        <div class="field field-xs">
          <label>Condición</label>
          <select v-model="filtroCondicion">
            <option value="">Todos</option>
            <option value="true">Con seña</option>
            <option value="false">Sin seña</option>
          </select>
        </div>

        <div class="filters-actions">
          <button class="btn-primary" type="button" @click="applyFilters">
            Buscar
          </button>
          <button class="btn-secondary" type="button" @click="clearFilters">
            Limpiar
          </button>
        </div>
      </div>
    </section>

    <section class="table-wrap card">
      <div class="table-top">
        <h2>Listado</h2>

        <div class="table-top-right">
          <p class="muted">{{ rowsFiltrados.length }} alquiler(es)</p>
          <button class="btn-calendario" type="button" @click="irCalendario">
            📅 Ver calendario
          </button>
        </div>
      </div>

      <div v-if="loading" class="empty-state">Cargando alquileres...</div>

      <div v-else-if="!rowsFiltrados.length" class="empty-state">
        No hay alquileres registrados.
      </div>

      <div v-else class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Fecha</th>
              <th>Monto</th>
              <th>Condición</th>
              <th class="th-actions">Acciones</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="alquiler in rowsFiltrados" :key="alquiler.id">
              <td>
                <div class="cliente-cell">
                  <strong>{{ alquiler.nombre || "—" }}</strong>
                  <span v-if="alquiler.dni" class="sub-text">
                    DNI: {{ alquiler.dni }}
                  </span>
                </div>
              </td>

              <td>{{ formatearFecha(alquiler.fecha) }}</td>

              <td>$ {{ formatoMoneda(alquiler.monto) }}</td>

              <td>
                <span
                  class="badge"
                  :class="alquiler.condicion ? 'badge-success' : 'badge-neutral'"
                >
                  {{ alquiler.condicion ? "Con seña" : "Sin seña" }}
                </span>
              </td>

              <td>
                <div class="row-actions">
                  <button class="table-btn" type="button" @click="editarAlquiler(alquiler)">
                    Editar
                  </button>
                  <button
                    class="table-btn danger"
                    type="button"
                    @click="eliminarAlquiler(alquiler)"
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
import { alquileresService } from "../../services/alquileresService"

const router = useRouter()

const loading = ref(false)
const rows = ref([])
const search = ref("")
const filtroCondicion = ref("")

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
    result = result.filter((item) => {
      return (
        String(item.nombre || "").toLowerCase().includes(term) ||
        String(item.dni || "").includes(term)
      )
    })
  }

  if (filtroCondicion.value !== "") {
    const condicion = filtroCondicion.value === "true"
    result = result.filter((item) => item.condicion === condicion)
  }

  result.sort((a, b) => {
    const fechaA = new Date(a.fecha).getTime() || 0
    const fechaB = new Date(b.fecha).getTime() || 0
    return fechaB - fechaA
  })

  return result
})

async function loadAlquileres() {
  loading.value = true
  try {
    const { data } = await alquileresService.listar()
    rows.value = Array.isArray(data)
      ? data.map(normalizeAlquiler).filter((item) => item.id > 0)
      : []
  } catch (error) {
    console.error("Error cargando alquileres", error)
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
  filtroCondicion.value = ""
}

function nuevoAlquiler() {
  router.push("/alquileres/nuevo")
}

function editarAlquiler(alquiler) {
  router.push(`/alquileres/${alquiler.id}/editar`)
}

function irCalendario() {
  router.push("/alquileres/calendario")
}

async function eliminarAlquiler(alquiler) {
  const ok = window.confirm(
    `¿Eliminar el alquiler de ${alquiler.nombre || "este cliente"}?`,
  )
  if (!ok) return

  try {
    await alquileresService.eliminar(alquiler.id)
    await loadAlquileres()
  } catch (error) {
    console.error("No se pudo eliminar el alquiler.", error)
    alert("No se pudo eliminar el alquiler.")
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

onMounted(loadAlquileres)
</script>

<style scoped>
.alquileres-page {
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

.field-grow {
  min-width: 0;
}

.field-xs {
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

.table-top-right {
  display: flex;
  align-items: center;
  gap: 12px;
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

.cliente-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sub-text {
  display: block;
  font-size: 12px;
  color: var(--text-muted);
}

.row-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn-calendario {
  background: rgba(241, 180, 76, 0.12);
  color: #9c6e1e;
  border: 1px solid rgba(241, 180, 76, 0.4);
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
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
    justify-content: stretch;
  }

  .head-actions > * {
    flex: 1 1 180px;
  }

  .filters-top {
    grid-template-columns: 1fr;
  }

  .filters-actions {
    width: 100%;
  }

  .filters-actions > * {
    flex: 1 1 100%;
  }

  .table-top {
    flex-direction: column;
    align-items: stretch;
  }

  .table-top-right {
    justify-content: space-between;
  }
}
</style>