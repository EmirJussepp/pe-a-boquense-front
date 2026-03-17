<template>
  <div class="page">

    <section class="page-head card">
      <div class="page-head-copy">
        <p class="eyebrow">Tesorería</p>
        <h1>Movimientos</h1>
        <p class="page-subtitle">Registro y control de ingresos y egresos.</p>
      </div>
      <div class="head-actions">
        <button class="btn-secondary" @click="loadMovimientos" :disabled="loading">
          {{ loading ? "Actualizando..." : "Actualizar" }}
        </button>
        <button class="btn-primary" @click="nuevoMovimiento">Nuevo movimiento</button>
      </div>
    </section>

    <section class="filters card">
      <div class="filters-top">
        <div class="field field-grow">
          <label>Buscar</label>
          <input v-model="search" placeholder="Descripción..." @keyup.enter="applyFilters" />
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
          <button class="btn-primary" @click="applyFilters">Buscar</button>
          <button class="btn-secondary" @click="clearFilters">Limpiar</button>
        </div>
      </div>
    </section>

    <section class="table-wrap card">
      <div class="table-top">
        <h2>Listado</h2>
        <p class="muted">{{ rowsFiltrados.length }} movimiento(s)</p>
      </div>

      <div v-if="loading" class="empty-state">Cargando movimientos...</div>
      <div v-else-if="!rowsFiltrados.length" class="empty-state">No hay movimientos registrados.</div>

      <div v-else class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Descripción</th>
              <th>Tipo</th>
              <th>Monto</th>
              <th>Fecha</th>
              <th>Método</th>
              <th class="th-actions">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in rowsFiltrados" :key="m.movimientoId">
              <td>{{ m.movimientoId }}</td>
              <td><strong>{{ m.descripcion }}</strong></td>
              <td>
                <span class="badge" :class="m.tipo === 'INGRESO' ? 'badge-success' : 'badge-danger'">
                  {{ m.tipo }}
                </span>
              </td>
              <td>$ {{ formatoMoneda(m.monto) }}</td>
              <td>{{ formatearFecha(m.fecha) }}</td>
              <td>{{ m.metodoPagoId || "—" }}</td>
              <td>
                <div class="row-actions">
                  <button class="table-btn danger" @click="eliminarMovimiento(m.movimientoId)">Eliminar</button>
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

const rowsFiltrados = computed(() => {
  let result = [...rows.value]
  if (search.value.trim()) {
    const term = search.value.toLowerCase()
    result = result.filter(m => (m.descripcion || "").toLowerCase().includes(term))
  }
  if (tipo.value) result = result.filter(m => m.tipo === tipo.value)
  return result
})

async function loadMovimientos() {
  loading.value = true
  try {
    const { data } = await movimientosService.listar()
    rows.value = data || []
  } catch (error) {
    console.error("Error cargando movimientos", error)
  } finally {
    loading.value = false
  }
}

function applyFilters() { loadMovimientos() }
function clearFilters() { search.value = ""; tipo.value = ""; loadMovimientos() }
function nuevoMovimiento() { router.push("/movimientos/nuevo") }

async function eliminarMovimiento(id) {
  if (!confirm("¿Eliminar este movimiento?")) return
  try {
    await movimientosService.eliminar(id, auth.userId)
    await loadMovimientos()
  } catch { alert("No se pudo eliminar el movimiento.") }
}

function formatoMoneda(n) {
  return Number(n || 0).toLocaleString("es-AR", { minimumFractionDigits: 2 })
}
function formatearFecha(f) {
  if (!f) return "—"
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "short", timeStyle: "short" }).format(new Date(f))
}

onMounted(loadMovimientos)
</script>