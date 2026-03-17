<template>
  <div class="reportes-page">
    <header class="page-header">
      <div class="header-left">
        <p class="eyebrow">REPORTES</p>
        <h1>Análisis de Cuotas</h1>
        <p class="hero-description">Métricas y estado de cuenta de la peña.</p>
      </div>
      <button class="btn-export" @click="exportarExcel" :disabled="loadingAny">
        <span class="export-icon">📥</span>
        Exportar Excel
      </button>
    </header>

    <!-- ERROR BANNER -->
    <div v-if="errores.length" class="error-banner">
      <span class="error-icon">⚠️</span>
      <div class="error-list">
        <span v-for="e in errores" :key="e">{{ e }}</span>
      </div>
      <button class="error-close" @click="errores = []">✕</button>
    </div>

    <!-- TOAST -->
    <transition name="toast">
      <div v-if="toast" class="toast">{{ toast }}</div>
    </transition>

    <!-- FILTROS -->
    <section class="card filter-card">
      <h3 class="card-subtitle">FILTROS</h3>
      <div class="filter-row">
        <div class="field-container">
          <label class="field-label">Desde</label>
          <input type="date" v-model="filtro.desde" class="dark-input" />
        </div>
        <div class="field-container">
          <label class="field-label">Hasta</label>
          <input type="date" v-model="filtro.hasta" class="dark-input" />
        </div>
        <div class="field-container" v-if="auth.isAdmin">
          <label class="field-label">Cobrador</label>
          <select v-model="filtro.cobradorId" class="dark-input">
            <option :value="null">Todos</option>
            <option v-for="c in cobradores" :key="c.cobradoresId" :value="c.cobradoresId">
              {{ c.nombre }}
            </option>
          </select>
        </div>
        <div class="filter-actions">
          <button class="btn-buscar" @click="cargarTodo" :disabled="loadingAny">
            {{ loadingAny ? '...' : 'Aplicar' }}
          </button>
          <button class="btn-limpiar" @click="limpiarFiltros">Limpiar</button>
        </div>
      </div>
    </section>

    <!-- KPI CARDS -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <span class="kpi-label">Total Recaudado</span>
        <span class="kpi-value accent">${{ formatMoney(resumen?.totalCobrado) }}</span>
        <span class="kpi-sub">{{ resumen?.cantidadPagos ?? '—' }} pagos</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">Promedio por Pago</span>
        <span class="kpi-value">${{ formatMoney(resumen?.promedioPorPago) }}</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">Cuotas Pendientes</span>
        <span class="kpi-value warn">{{ estadoCuotas?.pendientes ?? '—' }}</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">Cuotas Vencidas</span>
        <span class="kpi-value danger">{{ estadoCuotas?.vencidas ?? '—' }}</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">Cuotas Pagadas</span>
        <span class="kpi-value ok">{{ estadoCuotas?.pagadas ?? '—' }}</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">Cuotas Exentas</span>
        <span class="kpi-value muted">{{ estadoCuotas?.exentas ?? '—' }}</span>
      </div>
    </div>

    <div class="dashboard-layout">
      <main class="main-column">

        <!-- RANKING DEUDORES -->
        <section class="card table-card">
          <div class="table-card-header">
            <h2>Ranking de Socios Deudores</h2>
            <span class="badge-count">{{ deudores.length }} socios</span>
          </div>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th @click="ordenarDeudores('apellido')" class="sortable">
                    SOCIO <span class="sort-icon">{{ getIcono('apellido') }}</span>
                  </th>
                  <th>DNI</th>
                  <th>COBRADOR</th>
                  <th @click="ordenarDeudores('cuotasPendientes')" class="sortable">
                    PEND. <span class="sort-icon">{{ getIcono('cuotasPendientes') }}</span>
                  </th>
                  <th @click="ordenarDeudores('cuotasVencidas')" class="sortable">
                    VENC. <span class="sort-icon">{{ getIcono('cuotasVencidas') }}</span>
                  </th>
                  <th @click="ordenarDeudores('deudaEmitidaTotal')" class="sortable">
                    DEUDA TOTAL <span class="sort-icon">{{ getIcono('deudaEmitidaTotal') }}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="loadingDeudores" v-for="n in 5" :key="'sk'+n" class="skeleton-row">
                  <td colspan="7"></td>
                </tr>
                <tr v-else-if="deudoresOrdenados.length === 0">
                  <td colspan="7" class="empty-state">No hay deudores en el período seleccionado.</td>
                </tr>
                <tr v-else v-for="(d, i) in deudoresOrdenados" :key="d.socioId">
                  <td class="rank-cell">
                    <span class="rank-badge" :class="rankClass(i)">{{ i + 1 }}</span>
                  </td>
                  <td>
                    <div class="socio-cell">
                      <span class="socio-name">{{ d.apellido }}, {{ d.nombre }}</span>
                    </div>
                  </td>
                  <td class="mono">{{ d.dni }}</td>
                  <td class="text-muted">{{ d.cobradorNombre ?? '—' }}</td>
                  <td>
                    <span v-if="d.cuotasPendientes > 0" class="pill warn">{{ d.cuotasPendientes }}</span>
                    <span v-else class="text-muted">—</span>
                  </td>
                  <td>
                    <span v-if="d.cuotasVencidas > 0" class="pill danger">{{ d.cuotasVencidas }}</span>
                    <span v-else class="text-muted">—</span>
                  </td>
                  <td class="monto-cell">${{ formatMoney(d.deudaEmitidaTotal) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

      </main>

      <aside class="sidebar-column">

        <!-- ESTADO GENERAL -->
        <section class="card">
          <h2 class="section-title">Estado de Cuotas</h2>
          <div class="estado-bars">
            <div v-for="item in estadoBars" :key="item.label" class="bar-row">
              <div class="bar-label-row">
                <span class="bar-label">{{ item.label }}</span>
                <span class="bar-value" :class="item.cls">{{ item.value }}</span>
              </div>
              <div class="bar-track">
                <div class="bar-fill" :class="item.cls" :style="{ width: item.pct + '%' }"></div>
              </div>
            </div>
          </div>
        </section>

        <!-- POR COBRADOR -->
        <section class="card" style="margin-top: 20px">
          <h2 class="section-title">Recaudación por Cobrador</h2>
          <div v-if="loadingCobrador" class="skeleton-block"></div>
          <div v-else-if="porCobrador.length === 0" class="empty-state">Sin datos.</div>
          <div v-else class="cobrador-list">
            <div v-for="c in porCobrador" :key="c.cobradorId ?? 'sin'" class="cobrador-item">
              <div class="cobrador-top">
                <span class="cobrador-name">{{ c.cobradorNombre }}</span>
                <span class="cobrador-total">${{ formatMoney(c.totalCobrado) }}</span>
              </div>
              <div class="cobrador-sub">
                {{ c.cantidadPagos }} pagos · {{ c.cantidadSocios }} socios
              </div>
            </div>
          </div>
        </section>

      </aside>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue"
import { useAuthStore } from "../../stores/auth"
import { reportesService } from "../../services/reportesService"
import { cobradoresService } from "../../services/cobradoresService"
import * as XLSX from "xlsx"

const auth = useAuthStore()

// Estado
const filtro = ref({ desde: null, hasta: null, cobradorId: null })
const resumen = ref(null)
const estadoCuotas = ref(null)
const deudores = ref([])
const porCobrador = ref([])
const cobradores = ref([])
const errores = ref([])
const toast = ref(null)

const loadingResumen = ref(false)
const loadingEstado = ref(false)
const loadingDeudores = ref(false)
const loadingCobrador = ref(false)

const ordenCol = ref("deudaEmitidaTotal")
const ordenDir = ref("desc")

const loadingAny = computed(() =>
  loadingResumen.value || loadingEstado.value || loadingDeudores.value || loadingCobrador.value
)

// Ordenamiento deudores
const deudoresOrdenados = computed(() => {
  const arr = [...deudores.value]
  arr.sort((a, b) => {
    let vA = a[ordenCol.value], vB = b[ordenCol.value]
    if (typeof vA === "string") { vA = vA.toLowerCase(); vB = vB.toLowerCase() }
    return ordenDir.value === "asc" ? (vA < vB ? -1 : 1) : (vA > vB ? -1 : 1)
  })
  return arr
})

function ordenarDeudores(col) {
  if (ordenCol.value === col) ordenDir.value = ordenDir.value === "asc" ? "desc" : "asc"
  else { ordenCol.value = col; ordenDir.value = "desc" }
}
function getIcono(col) {
  if (ordenCol.value !== col) return "↕"
  return ordenDir.value === "asc" ? "↑" : "↓"
}

// Barras de estado
const totalCuotas = computed(() => {
  if (!estadoCuotas.value) return 1
  return (estadoCuotas.value.pendientes + estadoCuotas.value.vencidas +
    estadoCuotas.value.pagadas + estadoCuotas.value.exentas) || 1
})
const estadoBars = computed(() => {
  if (!estadoCuotas.value) return []
  const t = totalCuotas.value
  return [
    { label: "Pagadas",   value: estadoCuotas.value.pagadas,   cls: "ok",     pct: (estadoCuotas.value.pagadas   / t * 100).toFixed(1) },
    { label: "Pendientes",value: estadoCuotas.value.pendientes, cls: "warn",   pct: (estadoCuotas.value.pendientes/ t * 100).toFixed(1) },
    { label: "Vencidas",  value: estadoCuotas.value.vencidas,  cls: "danger",  pct: (estadoCuotas.value.vencidas  / t * 100).toFixed(1) },
    { label: "Exentas",   value: estadoCuotas.value.exentas,   cls: "muted",   pct: (estadoCuotas.value.exentas   / t * 100).toFixed(1) },
  ]
})

// Helpers
function buildParams() {
  const p = {}
  if (filtro.value.desde) p.desde = filtro.value.desde
  if (filtro.value.hasta) p.hasta = filtro.value.hasta
  if (filtro.value.cobradorId) p.cobradorId = filtro.value.cobradorId
  return p
}
function formatMoney(v) {
  return new Intl.NumberFormat("es-AR", { minimumFractionDigits: 2 }).format(Number(v || 0))
}
function rankClass(i) {
  if (i === 0) return "gold"
  if (i === 1) return "silver"
  if (i === 2) return "bronze"
  return ""
}
function limpiarFiltros() {
  filtro.value = { desde: null, hasta: null, cobradorId: null }
  cargarTodo()
}

// Carga de datos
async function cargarTodo() {
  const params = buildParams()
  errores.value = []
  loadingResumen.value = true
  loadingEstado.value = true
  loadingDeudores.value = true
  loadingCobrador.value = true

  try {
    const [r1, r2, r3, r4] = await Promise.allSettled([
      reportesService.obtenerResumen(params),
      reportesService.obtenerEstadoCuotas(params),
      reportesService.obtenerDeudaPorSocio(params),
      reportesService.obtenerPorCobrador(params),
    ])

    if (r1.status === "fulfilled") resumen.value = r1.value.data
    else errores.value.push("No se pudo cargar el resumen de recaudación.")

    if (r2.status === "fulfilled") estadoCuotas.value = r2.value.data
    else errores.value.push("No se pudo cargar el estado de cuotas.")

    if (r3.status === "fulfilled") deudores.value = r3.value.data ?? []
    else errores.value.push("No se pudo cargar el ranking de deudores.")

    if (r4.status === "fulfilled") porCobrador.value = r4.value.data ?? []
    else errores.value.push("No se pudo cargar la recaudación por cobrador.")

  } finally {
    loadingResumen.value = false
    loadingEstado.value = false
    loadingDeudores.value = false
    loadingCobrador.value = false
  }
}

// Toast helper
function mostrarToast(msg) {
  toast.value = msg
  setTimeout(() => { toast.value = null }, 3000)
}

// Export Excel
function exportarExcel() {
  if (!resumen.value && !deudores.value.length && !porCobrador.value.length) {
    mostrarToast("No hay datos para exportar.")
    return
  }

  const wb = XLSX.utils.book_new()

  // Hoja 1: Resumen general
  if (resumen.value) {
    const resumenData = [
      ["Métrica", "Valor"],
      ["Total Recaudado", Number(resumen.value.totalCobrado)],
      ["Cantidad de Pagos", resumen.value.cantidadPagos],
      ["Promedio por Pago", Number(resumen.value.promedioPorPago)],
      [],
      ["Estado de Cuotas", ""],
      ["Pagadas", estadoCuotas.value?.pagadas ?? 0],
      ["Pendientes", estadoCuotas.value?.pendientes ?? 0],
      ["Vencidas", estadoCuotas.value?.vencidas ?? 0],
      ["Exentas", estadoCuotas.value?.exentas ?? 0],
    ]
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(resumenData), "Resumen")
  }

  // Hoja 2: Ranking deudores
  if (deudoresOrdenados.value.length) {
    const headers = ["#", "Apellido", "Nombre", "DNI", "Cobrador", "Cuotas Pendientes", "Cuotas Vencidas", "Deuda Total"]
    const rows = deudoresOrdenados.value.map((d, i) => [
      i + 1,
      d.apellido,
      d.nombre,
      d.dni,
      d.cobradorNombre ?? "",
      d.cuotasPendientes,
      d.cuotasVencidas,
      Number(d.deudaEmitidaTotal),
    ])
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([headers, ...rows]), "Ranking Deudores")
  }

  // Hoja 3: Por cobrador
  if (porCobrador.value.length) {
    const headers = ["Cobrador", "Total Cobrado", "Cantidad Pagos", "Socios"]
    const rows = porCobrador.value.map(c => [
      c.cobradorNombre,
      Number(c.totalCobrado),
      c.cantidadPagos,
      c.cantidadSocios,
    ])
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([headers, ...rows]), "Por Cobrador")
  }

  const fecha = new Date().toISOString().slice(0, 10)
  XLSX.writeFile(wb, `reporte_cuotas_${fecha}.xlsx`)
  mostrarToast("✅ Excel exportado correctamente.")
}

onMounted(async () => {
  if (auth.isAdmin) {
    const { data } = await cobradoresService.listar()
    cobradores.value = data ?? []
  }
  await cargarTodo()
})
</script>

<style scoped>
/* ERROR BANNER */
.error-banner {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 10px;
  padding: 14px 18px;
  margin-bottom: 20px;
  color: #991b1b;
  font-size: 13px;
}
.error-icon { font-size: 16px; flex-shrink: 0; }
.error-list { display: flex; flex-direction: column; gap: 4px; flex: 1; font-weight: 600; }
.error-close {
  background: none;
  border: none;
  color: #991b1b;
  cursor: pointer;
  font-size: 14px;
  flex-shrink: 0;
  padding: 0 4px;
}

/* TOAST */
.toast {
  position: fixed;
  bottom: 30px;
  right: 30px;
  background: var(--primary);
  color: white;
  padding: 12px 22px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  z-index: 9999;
}
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(10px); }

.reportes-page {
  background-color: var(--bg);
  min-height: 100vh;
  padding: 20px 40px;
}

/* HEADER */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 25px;
}
.eyebrow { color: var(--accent); font-weight: 800; font-size: 11px; letter-spacing: 1px; margin: 0; }
.page-header h1 { font-size: 32px; font-weight: 900; color: var(--primary); margin: 5px 0; }
.hero-description { color: var(--text-muted); font-size: 14px; margin: 0; }

.btn-export {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 12px 24px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.2s;
}
.btn-export:disabled { opacity: 0.5; cursor: not-allowed; }
.export-icon { font-size: 16px; }

/* FILTROS */
.card {
  background: white;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  box-shadow: var(--shadow-sm);
}
.filter-card { margin-bottom: 20px; }
.card-subtitle { font-size: 12px; color: var(--text-muted); margin: 0 0 15px; font-weight: 800; }
.filter-row { display: flex; gap: 16px; align-items: flex-end; flex-wrap: wrap; }
.field-container { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 12px; font-weight: 700; color: var(--text-soft); }
.dark-input {
  background: #f8fafc;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px 12px;
  color: var(--text-main);
  font-size: 13px;
  min-width: 160px;
}
.filter-actions { display: flex; gap: 10px; align-items: flex-end; }
.btn-buscar {
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 24px;
  font-weight: 700;
  cursor: pointer;
  font-size: 13px;
}
.btn-limpiar {
  background: #f1f5f9;
  border: 1px solid var(--border);
  color: var(--text-soft);
  border-radius: 8px;
  padding: 10px 18px;
  font-weight: 600;
  cursor: pointer;
  font-size: 13px;
}

/* KPI GRID */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 14px;
  margin-bottom: 20px;
}
.kpi-card {
  background: white;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  box-shadow: var(--shadow-sm);
}
.kpi-label { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
.kpi-value { font-size: 22px; font-weight: 900; color: var(--primary); }
.kpi-value.accent { color: var(--accent-dark, #b8860b); }
.kpi-value.warn  { color: #d97706; }
.kpi-value.danger{ color: #dc2626; }
.kpi-value.ok    { color: #16a34a; }
.kpi-value.muted { color: var(--text-muted); }
.kpi-sub { font-size: 11px; color: var(--text-muted); }

/* LAYOUT */
.dashboard-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 20px;
  align-items: start;
}

/* TABLA */
.table-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.table-card-header h2 { font-size: 18px; color: var(--primary); font-weight: 800; margin: 0; }
.badge-count {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 3px 12px;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-muted);
}
.table-container { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th {
  text-align: left;
  color: var(--text-muted);
  font-size: 11px;
  padding: 10px 12px;
  border-bottom: 2px solid var(--bg);
  background: #f1f5f9;
  font-weight: 800;
  letter-spacing: 0.5px;
}
.data-table td { padding: 13px 12px; border-bottom: 1px solid var(--bg); font-size: 13px; }
.sortable { cursor: pointer; user-select: none; }
.sortable:hover { color: var(--primary); }
.sort-icon { opacity: 0.5; }

.rank-cell { width: 40px; text-align: center; }
.rank-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px; height: 26px;
  border-radius: 50%;
  font-size: 11px;
  font-weight: 900;
  background: #e2e8f0;
  color: var(--text-soft);
}
.rank-badge.gold   { background: #fef3c7; color: #92400e; }
.rank-badge.silver { background: #f1f5f9; color: #475569; }
.rank-badge.bronze { background: #fdf4eb; color: #9a3412; }

.socio-name { font-weight: 700; color: var(--primary); }
.monto-cell { font-weight: 800; color: var(--text-main); }
.mono { font-family: monospace; font-size: 12px; }
.text-muted { color: var(--text-muted); }

.pill {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 800;
}
.pill.warn   { background: #fef3c7; color: #92400e; }
.pill.danger { background: #fee2e2; color: #991b1b; }

.empty-state { text-align: center; color: var(--text-muted); padding: 30px; font-size: 13px; }

/* SKELETON */
.skeleton-row td { height: 48px; background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%); background-size: 200% 100%; animation: shimmer 1.2s infinite; }
.skeleton-block { height: 120px; border-radius: 8px; background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%); background-size: 200% 100%; animation: shimmer 1.2s infinite; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* SIDEBAR */
.section-title { font-size: 16px; font-weight: 800; color: var(--primary); margin: 0 0 16px; }

/* BARRAS ESTADO */
.estado-bars { display: flex; flex-direction: column; gap: 14px; }
.bar-row { display: flex; flex-direction: column; gap: 5px; }
.bar-label-row { display: flex; justify-content: space-between; align-items: center; }
.bar-label { font-size: 12px; font-weight: 600; color: var(--text-soft); }
.bar-value { font-size: 13px; font-weight: 800; }
.bar-value.ok    { color: #16a34a; }
.bar-value.warn  { color: #d97706; }
.bar-value.danger{ color: #dc2626; }
.bar-value.muted { color: var(--text-muted); }
.bar-track { background: #f1f5f9; border-radius: 4px; height: 8px; overflow: hidden; }
.bar-fill { height: 100%; border-radius: 4px; transition: width 0.5s ease; }
.bar-fill.ok    { background: #16a34a; }
.bar-fill.warn  { background: #d97706; }
.bar-fill.danger{ background: #dc2626; }
.bar-fill.muted { background: #94a3b8; }

/* COBRADOR LIST */
.cobrador-list { display: flex; flex-direction: column; gap: 12px; }
.cobrador-item {
  background: var(--bg);
  border-radius: 8px;
  padding: 12px 14px;
  border-left: 3px solid var(--accent);
}
.cobrador-top { display: flex; justify-content: space-between; align-items: center; }
.cobrador-name { font-weight: 700; font-size: 13px; color: var(--primary); }
.cobrador-total { font-weight: 900; font-size: 14px; color: var(--text-main); }
.cobrador-sub { font-size: 11px; color: var(--text-muted); margin-top: 3px; }
</style>