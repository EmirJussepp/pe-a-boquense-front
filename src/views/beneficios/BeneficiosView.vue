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
          {{ recalculando ? "Recalculando..." : "Recalcular todos" }}
        </button>
      </div>
    </section>

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
        <div class="field field-sm">
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
        <div class="table-top-meta">
          <span class="count-badge">{{ sociosFiltrados.length }}</span>
          <p class="table-status">{{ sociosFiltrados.length }} socio(s)</p>
        </div>
      </div>

      <div v-if="loading" class="skeleton-wrap">
        <div v-for="n in 5" :key="n" class="skeleton-row"></div>
      </div>

      <div v-else-if="!sociosFiltrados.length" class="empty-state">
        <div class="empty-box"><p>No se encontraron socios.</p></div>
      </div>

      <template v-else>
        <div class="table-scroll desktop-only">
          <table class="data-table">
            <thead>
              <tr>
                <th>SOCIO</th>
                <th>DNI</th>
                <th>TELÉFONO</th>
                <th>BENEFICIO</th>
                <th class="th-actions">ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in sociosPagina" :key="s.socioId">
                <td><strong>{{ s.apellido }}, {{ s.nombre }}</strong></td>
                <td>{{ s.dni }}</td>
                <td>{{ s.telefono || "—" }}</td>
                <td>
                  <span class="badge" :class="s.tieneBeneficio ? 'badge-success' : 'badge-neutral'">
                    {{ s.tieneBeneficio ? "Con beneficio" : "Sin beneficio" }}
                  </span>
                </td>
                <td>
                  <div class="row-actions">
                    <button class="table-btn" @click="recalcularSocio(s)" :disabled="s.recalculando">
                      {{ s.recalculando ? "Calculando..." : "Recalcular" }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mobile-cards mobile-only">
          <article v-for="s in sociosPagina" :key="`m-${s.socioId}`" class="socio-card">
            <div class="socio-card-head">
              <strong>{{ s.apellido }}, {{ s.nombre }}</strong>
              <span class="badge" :class="s.tieneBeneficio ? 'badge-success' : 'badge-neutral'">
                {{ s.tieneBeneficio ? "Con beneficio" : "Sin beneficio" }}
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">DNI</span>
              <span class="info-value">{{ s.dni }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Teléfono</span>
              <span class="info-value">{{ s.telefono || "—" }}</span>
            </div>
            <div class="socio-card-actions">
              <button class="table-btn" @click="recalcularSocio(s)" :disabled="s.recalculando">
                {{ s.recalculando ? "Calculando..." : "Recalcular" }}
              </button>
            </div>
          </article>
        </div>
      </template>

      <div v-if="totalPaginas > 1" class="pager">
        <span class="pager-text">Página <strong>{{ pagina }}</strong> de <strong>{{ totalPaginas }}</strong></span>
        <div class="pager-btns">
          <button class="btn-secondary" :disabled="pagina === 1" @click="pagina = 1">«</button>
          <button class="btn-secondary" :disabled="pagina === 1" @click="pagina--">‹ Anterior</button>
          <button class="btn-secondary" :disabled="pagina === totalPaginas" @click="pagina++">Siguiente ›</button>
          <button class="btn-secondary" :disabled="pagina === totalPaginas" @click="pagina = totalPaginas">»</button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue"
import { http } from "../../services/http"
import { beneficiosService } from "../../services/beneficiosService"
import { useToast } from "../../composables/useToast"

const toast = useToast()

const socios = ref([])
const loading = ref(false)
const recalculando = ref(false)
const search = ref("")
const filtroBeneficio = ref("")
const pagina = ref(1)
const POR_PAGINA = 15

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
      beneficiosService.getAll({ page: 1, pageSize: 1000, search: "" }).catch(() => ({ data: { data: [] } })),
    ])
    const beneficioIds = new Set((beneficiosRes.data.data || []).map(b => b.socioId))
    socios.value = (sociosRes.data || []).map(s => ({
      ...s,
      tieneBeneficio: beneficioIds.has(s.socioId),
      recalculando: false,
    }))
  } catch (err) {
    console.error("Error cargando datos", err)
    toast.error("Error al cargar los datos.")
  } finally {
    loading.value = false
  }
}

async function recalcularTodos() {
  recalculando.value = true
  try {
    await http.post("/beneficios/recalcular-todos")
    toast.success("Beneficios recalculados correctamente.")
    await cargarDatos()
  } catch (err) {
    console.error("Error recalculando", err)
    toast.error("No se pudo recalcular.")
  } finally {
    recalculando.value = false
  }
}

async function recalcularSocio(socio) {
  socio.recalculando = true
  try {
    await http.post(`/beneficios/recalcular/${socio.socioId}`)
    toast.success(`Beneficio de ${socio.nombre} actualizado.`)
    await cargarDatos()
  } catch (err) {
    console.error("Error recalculando socio", err)
    toast.error("No se pudo recalcular este socio.")
  } finally {
    socio.recalculando = false
  }
}

onMounted(cargarDatos)
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 16px; }
.page-head { padding: 22px; display: flex; justify-content: space-between; align-items: center; gap: 16px; }
.page-head-copy { min-width: 0; }
.eyebrow { margin: 0 0 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--accent); font-weight: 800; }
.page-head h1 { margin: 0 0 4px; font-size: clamp(1.6rem, 3vw, 2rem); font-weight: 900; color: var(--primary); }
.page-subtitle { margin: 0; color: var(--text-muted); font-size: 14px; }
.head-actions { display: flex; gap: 10px; flex-wrap: wrap; justify-content: flex-end; }

.stats-row { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
.stat-card { padding: 20px; text-align: center; }
.stat-label { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px; }
.stat-value { font-size: 2rem; font-weight: 900; color: var(--primary); margin: 0; }
.stat-value.success { color: #15803d; }
.stat-value.muted-val { color: var(--text-muted); }
.stat-value.accent { color: #9c6e1e; }

.filters { padding: 20px; }
.filters-top { display: grid; grid-template-columns: minmax(0, 1fr) 180px; gap: 12px; align-items: end; }
.field { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.field label { font-size: 12px; font-weight: 700; color: var(--text-muted); }
.field-grow { min-width: 0; }
.field-sm { width: 100%; }

.table-wrap { padding: 22px; }
.table-top { display: flex; align-items: center; gap: 12px; margin-bottom: 18px; justify-content: space-between; flex-wrap: wrap; }
.table-top h2 { margin: 0; font-size: 18px; font-weight: 800; color: var(--primary); }
.table-top-meta { display: flex; align-items: center; gap: 10px; }
.count-badge { background: var(--bg); border: 1px solid var(--border); border-radius: 999px; padding: 4px 10px; font-size: 12px; font-weight: 700; color: var(--text-muted); }
.table-status { margin: 0; font-size: 12px; color: var(--text-muted); }

.table-scroll { overflow-x: auto; }
.data-table { width: 100%; min-width: 560px; border-collapse: collapse; }
.data-table th { text-align: left; padding: 10px 14px; font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.6px; font-weight: 800; background: #f8fafc; border-bottom: 2px solid var(--border); }
.data-table td { padding: 14px; border-bottom: 1px solid var(--bg); vertical-align: middle; font-size: 13px; }
.data-table tbody tr:hover { background: rgba(0,59,122,0.02); }
.th-actions { text-align: center; }
.row-actions { display: flex; justify-content: center; }

.badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 800; letter-spacing: 0.3px; }
.badge-success { background: rgba(34,197,94,0.12); color: #15803d; }
.badge-neutral { background: rgba(148,163,184,0.15); color: #64748b; }

.table-btn { padding: 7px 14px; border-radius: 8px; border: 1px solid var(--border); font-size: 12px; font-weight: 700; cursor: pointer; background: white; color: var(--primary); transition: all 0.15s; }
.table-btn:hover:not(:disabled) { background: var(--bg); }
.table-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.skeleton-wrap { display: flex; flex-direction: column; gap: 10px; }
.skeleton-row { height: 56px; background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%); background-size: 200% 100%; animation: shimmer 1.2s infinite; border-radius: 8px; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
.empty-state { min-height: 180px; display: grid; place-items: center; }
.empty-box { text-align: center; color: var(--text-muted); font-size: 14px; }
.empty-box p { margin: 0; }

.mobile-cards { display: flex; flex-direction: column; gap: 12px; }
.socio-card { border: 1px solid var(--border); border-radius: 12px; padding: 14px; background: white; display: flex; flex-direction: column; gap: 8px; }
.socio-card-head { display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap; }
.socio-card-head strong { color: var(--primary); font-size: 14px; }
.socio-card-actions { padding-top: 8px; border-top: 1px solid var(--bg); }
.socio-card-actions button { width: 100%; }
.info-row { display: flex; flex-direction: column; gap: 3px; padding-top: 6px; border-top: 1px solid var(--bg); }
.info-label { font-size: 11px; font-weight: 800; letter-spacing: 0.4px; text-transform: uppercase; color: var(--text-muted); }
.info-value { font-size: 13px; color: var(--text-soft); }

.pager { margin-top: 18px; display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
.pager-text { font-size: 13px; color: var(--text-muted); }
.pager-text strong { color: var(--primary); }
.pager-btns { display: flex; gap: 8px; flex-wrap: wrap; }

.desktop-only { display: block; }
.mobile-only { display: none; }

@media (max-width: 980px) {
  .page-head { flex-direction: column; align-items: stretch; }
  .head-actions { justify-content: stretch; }
  .stats-row { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .pager { flex-direction: column; align-items: stretch; }
}
@media (max-width: 768px) {
  .desktop-only { display: none; }
  .mobile-only { display: flex; }
  .page-head, .filters, .table-wrap { padding: 16px; }
  .filters-top { grid-template-columns: 1fr; }
  .pager-btns { display: grid; grid-template-columns: 1fr 1fr; width: 100%; }
  .pager-btns button { width: 100%; }
}
@media (max-width: 640px) {
  .stats-row { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .head-actions { flex-direction: column; }
  .head-actions button { width: 100%; }
}
</style>