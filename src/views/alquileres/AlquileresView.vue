<template>
  <div class="page">

    <section class="page-head card">
      <div class="page-head-copy">
        <p class="eyebrow">Salones</p>
        <h1>Alquileres</h1>
        <p class="page-subtitle">Gestión de reservas y alquileres de salones.</p>
      </div>
      <div class="head-actions">
        <button class="btn-secondary" @click="loadAlquileres" :disabled="loading">
          {{ loading ? "Actualizando..." : "Actualizar" }}
        </button>
        <button class="btn-primary" @click="nuevoAlquiler">Nuevo alquiler</button>
      </div>
    </section>

    <section class="filters card">
      <div class="filters-top">
        <div class="field field-grow">
          <label>Buscar</label>
          <input v-model="search" placeholder="Cliente o DNI..." @keyup.enter="applyFilters" />
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
          <button class="btn-primary" @click="applyFilters">Buscar</button>
          <button class="btn-secondary" @click="clearFilters">Limpiar</button>
        </div>
      </div>
    </section>

    <section class="table-wrap card">
      <div class="table-top">
        <h2>Listado</h2>
        <div class="table-top-right">
          <p class="muted">{{ rowsFiltrados.length }} alquiler(es)</p>
          <button class="btn-calendario" @click="irCalendario">📅 Ver calendario</button>
        </div>
      </div>

      <div v-if="loading" class="empty-state">Cargando alquileres...</div>
      <div v-else-if="!rowsFiltrados.length" class="empty-state">No hay alquileres registrados.</div>

      <div v-else class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Fecha</th>
              <th>Monto</th>
              <th>Condición</th>
              <th class="th-actions">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in rowsFiltrados" :key="a.alquilerId">
              <td>{{ a.alquilerId }}</td>
              <td>
                <strong>{{ a.nombre || "—" }}</strong>
                <span v-if="a.dni" class="sub-text">DNI: {{ a.dni }}</span>
              </td>
              <td>{{ formatearFecha(a.fecha) }}</td>
              <td>$ {{ formatoMoneda(a.monto) }}</td>
              <td>
                <span class="badge" :class="a.condicion ? 'badge-success' : 'badge-neutral'">
                  {{ a.condicion ? "Con seña" : "Sin seña" }}
                </span>
              </td>
              <td>
                <div class="row-actions">
                  <button class="table-btn" @click="editarAlquiler(a)">Editar</button>
                  <button class="table-btn danger" @click="eliminarAlquiler(a.alquilerId)">Eliminar</button>
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

const rowsFiltrados = computed(() => {
  let result = [...rows.value]
  if (search.value.trim()) {
    const term = search.value.toLowerCase()
    result = result.filter(a =>
      (a.nombre || "").toLowerCase().includes(term) ||
      (a.dni || "").includes(term)
    )
  }
  if (filtroCondicion.value !== "") {
    const val = filtroCondicion.value === "true"
    result = result.filter(a => a.condicion === val)
  }
  return result
})

async function loadAlquileres() {
  loading.value = true
  try {
    const { data } = await alquileresService.listar()
    rows.value = data || []
  } catch (error) {
    console.error("Error cargando alquileres", error)
  } finally {
    loading.value = false
  }
}

function applyFilters() { loadAlquileres() }
function clearFilters() { search.value = ""; filtroCondicion.value = ""; loadAlquileres() }
function nuevoAlquiler() { router.push("/alquileres/nuevo") }
function editarAlquiler(a) { router.push(`/alquileres/${a.alquilerId}/editar`) }
function irCalendario() { router.push("/alquileres/calendario") }

async function eliminarAlquiler(id) {
  if (!confirm("¿Eliminar este alquiler?")) return
  try {
    await alquileresService.eliminar(id)
    await loadAlquileres()
  } catch { alert("No se pudo eliminar el alquiler.") }
}

function formatoMoneda(n) {
  return Number(n || 0).toLocaleString("es-AR", { minimumFractionDigits: 2 })
}
function formatearFecha(f) {
  if (!f) return "—"
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "short", timeStyle: "short" }).format(new Date(f))
}

onMounted(loadAlquileres)
</script>

<style scoped>
.btn-calendario {
  background: rgba(241, 180, 76, 0.12);
  color: #9c6e1e;
  border: 1px solid rgba(241, 180, 76, 0.4);
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}
</style>