<template>
  <div class="page">

    <section class="page-head card">
      <div class="page-head-copy">
        <p class="eyebrow">Socios</p>
        <h1>Beneficios</h1>
        <p class="page-subtitle">Socios activos con beneficio otorgado por cumplir condiciones de pago.</p>
      </div>
      <div class="head-actions">
        <button class="btn-secondary" @click="cargarDatos" :disabled="loading">
          {{ loading ? "Cargando..." : "Actualizar" }}
        </button>
        <button class="btn-primary" @click="recalcularTodos" :disabled="recalculando">
          {{ recalculando ? "Recalculando..." : "⟳ Recalcular todos" }}
        </button>
      </div>
    </section>

    <!-- STATS -->
    <div class="stats-row">
      <div class="stat-card card">
        <p class="stat-label">Total socios activos</p>
        <p class="stat-value">{{ socios.length }}</p>
      </div>
      <div class="stat-card card">
        <p class="stat-label">Con beneficio</p>
        <p class="stat-value success">{{ conBeneficio }}</p>
      </div>
      <div class="stat-card card">
        <p class="stat-label">Sin beneficio</p>
        <p class="stat-value muted-val">{{ sinBeneficio }}</p>
      </div>
      <div class="stat-card card">
        <p class="stat-label">Cobertura</p>
        <p class="stat-value accent">{{ cobertura }}%</p>
      </div>
    </div>

    <section class="filters card">
      <div class="filters-top">
        <div class="field field-grow">
          <label>Buscar</label>
          <input v-model="search" placeholder="Nombre, apellido o DNI..." @input="pagina = 1" />
        </div>
        <div class="field field-xs">
          <label>Estado</label>
          <select v-model="filtroBeneficio" @change="pagina = 1">
            <option value="">Todos</option>
            <option value="con">Con beneficio</option>
            <option value="sin">Sin beneficio</option>
          </select>
        </div>
      </div>
    </section>

    <section class="table-wrap card">
      <div class="table-top">
        <h2>Listado</h2>
        <p class="muted">{{ sociosFiltrados.length }} socio(s)</p>
      </div>

      <div v-if="loading" class="empty-state">Cargando socios...</div>
      <div v-else-if="!sociosFiltrados.length" class="empty-state">No se encontraron socios.</div>

      <div v-else class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>Socio</th>
              <th>DNI</th>
              <th>Teléfono</th>
              <th>Beneficio</th>
              <th class="th-actions">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in sociosPagina" :key="s.socioId">
              <td>
                <strong>{{ s.apellido }}, {{ s.nombre }}</strong>
              </td>
              <td>{{ s.dni }}</td>
              <td>{{ s.telefono || "—" }}</td>
              <td>
                <span class="badge" :class="s.tieneBeneficio ? 'badge-success' : 'badge-neutral'">
                  {{ s.tieneBeneficio ? "✓ Con beneficio" : "Sin beneficio" }}
                </span>
              </td>
              <td>
                <div class="row-actions">
                  <button
                    class="table-btn"
                    @click="recalcularSocio(s)"
                    :disabled="s.recalculando"
                  >
                    {{ s.recalculando ? "..." : "Recalcular" }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- PAGINACIÓN -->
      <div v-if="totalPaginas > 1" class="paginacion">
        <button class="pag-btn" :disabled="pagina === 1" @click="pagina--">‹</button>
        <button
          v-for="n in totalPaginas"
          :key="n"
          class="pag-btn"
          :class="{ active: n === pagina }"
          @click="pagina = n"
        >{{ n }}</button>
        <button class="pag-btn" :disabled="pagina === totalPaginas" @click="pagina++">›</button>
        <span class="pag-info">Página {{ pagina }} / {{ totalPaginas }}</span>
      </div>

    </section>

    <!-- TOAST -->
    <div v-if="toast.visible" class="toast-msg" :class="toast.tipo">
      {{ toast.texto }}
    </div>

  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue"
import { http } from "../../services/http"
import { beneficiosService } from "../../services/beneficiosService"

const socios = ref([])
const loading = ref(false)
const recalculando = ref(false)
const search = ref("")
const filtroBeneficio = ref("")
const pagina = ref(1)
const POR_PAGINA = 15

const toast = ref({ visible: false, texto: "", tipo: "success" })

// Stats
const conBeneficio = computed(() => socios.value.filter(s => s.tieneBeneficio).length)
const sinBeneficio = computed(() => socios.value.filter(s => !s.tieneBeneficio).length)
const cobertura = computed(() => {
  if (!socios.value.length) return 0
  return Math.round((conBeneficio.value / socios.value.length) * 100)
})

const sociosFiltrados = computed(() => {
  let result = [...socios.value]
  if (search.value.trim()) {
    const term = search.value.toLowerCase()
    result = result.filter(s =>
      s.nombre.toLowerCase().includes(term) ||
      s.apellido.toLowerCase().includes(term) ||
      s.dni.includes(term)
    )
  }
  if (filtroBeneficio.value === "con") result = result.filter(s => s.tieneBeneficio)
  if (filtroBeneficio.value === "sin") result = result.filter(s => !s.tieneBeneficio)
  return result
})
const cargarBeneficios = async () => {
  const res = await beneficiosService.getAll({
    page: 1,
    pageSize: 10,
    search: ""
  })

  console.log(res.data)
}
const totalPaginas = computed(() => Math.max(1, Math.ceil(sociosFiltrados.value.length / POR_PAGINA)))
const sociosPagina = computed(() => {
  const start = (pagina.value - 1) * POR_PAGINA
  return sociosFiltrados.value.slice(start, start + POR_PAGINA)
})

async function cargarDatos() {
  loading.value = true
  try {
    const [sociosRes, beneficiosRes] = await Promise.all([
      http.get("/socios"),
      beneficiosService.getAll({
        page: 1,
        pageSize: 1000,
        search: ""
      }).catch(() => ({ data: { data: [] } })),
    ])

    const beneficioIds = new Set(
      (beneficiosRes.data.data || []).map(b => b.socioId)
    )

    socios.value = (sociosRes.data || []).map(s => ({
      ...s,
      tieneBeneficio: beneficioIds.has(s.socioId),
      recalculando: false,
    }))

  } catch (e) {
    console.error("Error cargando datos", e)
    mostrarToast("Error al cargar los datos.", "error")
  } finally {
    loading.value = false
  }
}


async function recalcularTodos() {
  recalculando.value = true
  try {
    await http.post("/beneficios/recalcular-todos")
    mostrarToast("Beneficios recalculados correctamente.", "success")
    await cargarDatos()
  } catch (e) {
    console.error("Error recalculando", e)
    mostrarToast("No se pudo recalcular.", "error")
  } finally {
    recalculando.value = false
  }
}

async function recalcularSocio(socio) {
  socio.recalculando = true
  try {
    await http.post(`/beneficios/recalcular/${socio.socioId}`)
    mostrarToast(`Beneficio de ${socio.nombre} actualizado.`, "success")
    await cargarDatos()
  } catch (e) {
    mostrarToast("No se pudo recalcular este socio.", "error")
  } finally {
    socio.recalculando = false
  }
}

function mostrarToast(texto, tipo = "success") {
  toast.value = { visible: true, texto, tipo }
  setTimeout(() => { toast.value.visible = false }, 3500)
}

onMounted(cargarDatos)
</script>

<style scoped>
/* STATS */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.stat-card {
  text-align: center;
  padding: 20px;
}
.stat-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 8px;
}
.stat-value {
  font-size: 32px;
  font-weight: 900;
  color: var(--primary);
  margin: 0;
}
.stat-value.success { color: #15803d; }
.stat-value.muted-val { color: var(--text-muted); }
.stat-value.accent { color: #9c6e1e; }

/* PAGINACIÓN */
.paginacion {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 16px;
  border-top: 1px solid var(--border);
}
.pag-btn {
  min-width: 34px;
  height: 34px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: white;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  color: var(--text-soft);
  transition: all 0.15s;
}
.pag-btn:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); }
.pag-btn.active { background: var(--primary); color: white; border-color: var(--primary); }
.pag-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.pag-info { font-size: 12px; color: var(--text-muted); margin-left: 8px; }

/* TOAST */
.toast-msg {
  position: fixed;
  bottom: 28px;
  right: 28px;
  padding: 14px 22px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  z-index: 200;
  box-shadow: 0 8px 30px rgba(0,0,0,0.15);
  animation: slideUp 0.3s ease;
}
.toast-msg.success { background: #15803d; color: white; }
.toast-msg.error   { background: #b91c1c; color: white; }

@keyframes slideUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .stats-row { grid-template-columns: repeat(2, 1fr); }
}
</style>