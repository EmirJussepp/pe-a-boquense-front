<template>
  <div class="cupones-page">
    <header class="page-header">
      <div class="header-left">
        <p class="eyebrow">CUOTAS</p>
        <h1>Cupones por Período</h1>
        <p class="hero-description">
          Generá e imprimí los cupones pendientes de un período, con filtro opcional por cobrador.
        </p>
      </div>
    </header>

    <section class="card form-card">
      <div class="section-head">
        <div>
          <h3 class="section-title">Configuración</h3>
          <p class="section-subtitle">
            Elegí el período a trabajar y, si querés, limitá la impresión a un cobrador específico.
          </p>
        </div>
      </div>

      <div class="form-grid">
        <div class="field-container">
          <label class="field-label">
            Período <span class="required">*</span>
          </label>
          <input
            type="month"
            :value="periodoDisplay"
            :max="maxMonth"
            class="dark-input"
            @change="onPeriodoChange"
          />
          <p class="field-help">
            Se tomarán las cuotas pendientes del período seleccionado.
          </p>
        </div>

        <div class="field-container">
          <label class="field-label">
            Cobrador <span class="field-optional">(opcional)</span>
          </label>

          <div v-if="loadingCobradores" class="helper-text">
            Cargando cobradores...
          </div>

          <select v-else v-model="cobradorId" class="dark-input">
            <option :value="null">— Todos los cobradores —</option>
            <option
              v-for="c in cobradores"
              :key="c.cobradoresId"
              :value="c.cobradoresId"
            >
              {{ c.nombre }}<span v-if="c.zona"> ({{ c.zona }})</span>
            </option>
          </select>

          <p class="field-help">
            Podés dejarlo vacío para incluir todo el período.
          </p>
        </div>
      </div>

      <div class="summary-strip">
        <div class="summary-chip">
          <span class="summary-chip-label">Período</span>
          <strong>{{ periodoLabel }}</strong>
        </div>

        <div class="summary-chip">
          <span class="summary-chip-label">Cobrador</span>
          <strong>{{ cobradorLabel }}</strong>
        </div>
      </div>

      <div class="actions-row">
        <button
          type="button"
          class="btn-secondary"
          :disabled="loadingPreview || loading"
          @click="cargarPreview"
        >
          {{ loadingPreview ? "Consultando..." : "Ver resumen" }}
        </button>

        <button
          type="button"
          class="btn-cupon"
          :disabled="!periodo || loading"
          @click="generarCupones"
        >
          <span class="btn-cupon-inner">
            <Loader v-if="loading" :size="16" class="cupon-spinner" />
            <svg
              v-else
              class="cupon-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
            >
              <path d="M17 17H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2z"/>
              <path d="M7 17v2a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2"/>
              <line x1="9" y1="9" x2="15" y2="9"/>
              <line x1="9" y1="13" x2="13" y2="13"/>
            </svg>
            {{ loading ? "Generando..." : "Imprimir cupones" }}
          </span>
        </button>
      </div>
    </section>

    <section v-if="previewLoaded" class="card preview-card">
      <div class="section-head section-head-preview">
        <div>
          <h3 class="section-title">Resumen del período</h3>
          <p class="section-subtitle">
            Vista previa de las cuotas pendientes que entran en la impresión.
          </p>
        </div>

        <button
          type="button"
          class="btn-primary"
          @click="irACobranzasPeriodo"
        >
          Ir a cobranzas
        </button>
      </div>

      <div class="kpi-grid">
        <div class="kpi-card">
          <span class="kpi-label">Cuotas</span>
          <strong class="kpi-value">{{ previewStats.cantidadCuotas }}</strong>
        </div>

        <div class="kpi-card">
          <span class="kpi-label">Socios</span>
          <strong class="kpi-value">{{ previewStats.cantidadSocios }}</strong>
        </div>

        <div class="kpi-card">
          <span class="kpi-label">Total emitido</span>
          <strong class="kpi-value">{{ formatMoney(previewStats.totalMonto) }}</strong>
        </div>
      </div>

      <div v-if="!previewItems.length" class="empty-state compact">
        No hay cuotas pendientes para {{ periodoLabel }}.
      </div>

      <template v-else>
        <div class="preview-table-wrap">
          <table class="preview-table">
            <thead>
              <tr>
                <th>Socio</th>
                <th>Período</th>
                <th>Vencimiento</th>
                <th>Cobrador</th>
                <th class="th-right">Monto</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in previewTop" :key="item.cuotaId || item.id">
                <td>
                  <div class="main-cell">
                    <strong>{{ getSocioNombre(item) }}</strong>
                    <span class="sub-text" v-if="item.dni">DNI {{ item.dni }}</span>
                  </div>
                </td>
                <td>{{ formatPeriodo(item.periodo) }}</td>
                <td>{{ formatFecha(item.fechaVencimiento || item.vencimiento) }}</td>
                <td>{{ item.cobradorNombre || item.cobrador || "—" }}</td>
                <td class="th-right">{{ formatMoney(getMontoCuota(item)) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="preview-footer">
          <p class="muted">
            Mostrando {{ previewTop.length }}
            de {{ previewItems.length }} cuota<span v-if="previewItems.length !== 1">s</span>.
          </p>

          <div class="preview-footer-actions">
            <button
              type="button"
              class="btn-secondary"
              @click="irACobranzasPeriodo"
            >
              Cobrar período
            </button>

            <button
              type="button"
              class="btn-cupon"
              :disabled="loading"
              @click="generarCupones"
            >
              <span class="btn-cupon-inner">
                <Loader v-if="loading" :size="16" class="cupon-spinner" />
                <svg
                  v-else
                  class="cupon-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.2"
                >
                  <path d="M17 17H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2z"/>
                  <path d="M7 17v2a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2"/>
                  <line x1="9" y1="9" x2="15" y2="9"/>
                  <line x1="9" y1="13" x2="13" y2="13"/>
                </svg>
                {{ loading ? "Generando..." : "Imprimir ahora" }}
              </span>
            </button>
          </div>
        </div>
      </template>
    </section>
  </div>
</template>

<script setup>
import { computed, ref } from "vue"
import { useRouter } from "vue-router"
import { cuotasService } from "../../services/cuotasService"
import { useCobradores } from "../../composables/useCobradores"
import { useCuponPrinting, normalizeCuotaParaImprimir } from "../../composables/useCuponPrinting"
import { useToast } from "../../composables/useToast"
import { Loader } from "lucide-vue-next"

const router = useRouter()
const toast = useToast()

const { cobradores, loadingCobradores } = useCobradores()
const { ensureLogoDataUrl, buildCuponHTML, printHTML, wrapCuponesHTML } = useCuponPrinting()

const now = new Date()
const periodo = ref(`${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`)
const cobradorId = ref(null)

const loading = ref(false)
const loadingPreview = ref(false)

const previewItems = ref([])
const previewLoaded = ref(false)

const periodoDisplay = computed(() => {
  const v = periodo.value
  return v.length === 6 ? `${v.slice(0, 4)}-${v.slice(4, 6)}` : v
})

const maxMonth = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
})

function onPeriodoChange(e) {
  periodo.value = e.target.value.replace("-", "")
  previewLoaded.value = false
  previewItems.value = []
}

const periodoLabel = computed(() => {
  const v = periodo.value
  if (v.length !== 6) return v

  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ]

  return `${meses[parseInt(v.slice(4, 6), 10) - 1]} ${v.slice(0, 4)}`
})

const cobradorLabel = computed(() => {
  if (!cobradorId.value) return "Todos los cobradores"

  const cobrador = cobradores.value.find(
    (c) => Number(c.cobradoresId) === Number(cobradorId.value)
  )

  if (!cobrador) return "Cobrador seleccionado"
  return cobrador.zona ? `${cobrador.nombre} (${cobrador.zona})` : cobrador.nombre
})

const previewTop = computed(() => previewItems.value.slice(0, 8))

function getMontoCuota(item) {
  return Number(
    item?.monto ??
    item?.montoCuota ??
    item?.importe ??
    item?.total ??
    item?.saldo ??
    item?.montoPendiente ??
    0
  )
}

const previewStats = computed(() => {
  const totalMonto = previewItems.value.reduce((acc, item) => acc + getMontoCuota(item), 0)

  const sociosUnicos = new Set(
    previewItems.value.map((item) =>
      item.socioId ?? item.idSocio ?? item.sociosId ?? getSocioNombre(item)
    )
  )

  return {
    cantidadCuotas: previewItems.value.length,
    cantidadSocios: sociosUnicos.size,
    totalMonto,
  }
})

function getSocioNombre(item) {
  if (item.socioNombre) return item.socioNombre

  const apellido = item.apellido ?? ""
  const nombre = item.nombre ?? ""

  if (apellido || nombre) {
    return [apellido, nombre].filter(Boolean).join(", ")
  }

  return "Socio"
}

function formatMoney(value) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  }).format(Number(value || 0))
}

function formatFecha(value) {
  if (!value) return "—"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat("es-AR").format(date)
}

function formatPeriodo(raw) {
  const value = String(raw || "")
  if (value.length !== 6) return value

  const meses = [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
  ]

  const anio = value.slice(0, 4)
  const mes = Number(value.slice(4, 6))

  return `${meses[mes - 1]} ${anio}`
}

async function obtenerCuotasPeriodo() {
  const { data } = await cuotasService.listarCuponesPeriodo(periodo.value, cobradorId.value)
  return Array.isArray(data) ? data : []
}

async function cargarPreview() {
  if (!periodo.value) {
    toast.info("Seleccioná un período primero.")
    return
  }

  loadingPreview.value = true
  try {
    const items = await obtenerCuotasPeriodo()
    previewItems.value = items
    previewLoaded.value = true

    if (!items.length) {
      toast.info(`No hay cuotas pendientes para ${periodoLabel.value}.`)
    }
  } catch {
    toast.error("No se pudo cargar el resumen del período.")
  } finally {
    loadingPreview.value = false
  }
}

async function generarCupones() {
  if (!periodo.value) return

  loading.value = true
  try {
    await ensureLogoDataUrl()

    const items = await obtenerCuotasPeriodo()

    if (!items.length) {
      previewItems.value = []
      previewLoaded.value = true
      toast.info(`No hay cuotas pendientes para ${periodoLabel.value}.`)
      return
    }

    previewItems.value = items
    previewLoaded.value = true

    const normalizados = items.map(normalizeCuotaParaImprimir)
    const html = wrapCuponesHTML(
      normalizados.map(buildCuponHTML).join(""),
      `Cupones – ${periodoLabel.value}`
    )

    printHTML(html)
  } catch {
    toast.error("No se pudieron generar los cupones. Intentá de nuevo.")
  } finally {
    loading.value = false
  }
}

function irACobranzasPeriodo() {
  const query = {}

  if (periodoDisplay.value) query.periodo = periodoDisplay.value
  if (cobradorId.value != null) query.cobradorId = String(cobradorId.value)

  router.push({
    path: "/cuotas/cobranzas",
    query,
  })
}
</script>

<style scoped>
.cupones-page {
  width: 100%;
  min-height: 100%;
  padding: 28px 32px 40px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-header,
.form-card,
.preview-card {
  width: 100%;
  max-width: 920px;
  margin: 0 auto;
}

.eyebrow {
  color: var(--accent);
  font-weight: 800;
  font-size: 11px;
  letter-spacing: 1px;
  margin: 0 0 6px;
  text-transform: uppercase;
}

.page-header h1 {
  font-size: clamp(1.7rem, 4vw, 2.2rem);
  font-weight: 900;
  color: var(--primary);
  margin: 0 0 8px;
}

.hero-description {
  color: var(--text-muted);
  font-size: 14px;
  margin: 0;
  max-width: 680px;
}

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 24px;
  box-shadow: var(--shadow);
}

.section-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 18px;
  flex-wrap: wrap;
}

.section-title {
  margin: 0 0 6px;
  color: var(--primary);
  font-size: 18px;
  font-weight: 800;
}

.section-subtitle {
  margin: 0;
  color: var(--text-muted);
  font-size: 13px;
  line-height: 1.45;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.field-container {
  display: flex;
  flex-direction: column;
}

.field-label {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-soft);
  margin-bottom: 8px;
}

.field-optional {
  font-weight: 500;
  color: var(--text-muted);
  font-size: 0.88em;
}

.required {
  color: var(--danger);
  margin-left: 2px;
}

.dark-input {
  background: #f8fafc;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 12px 14px;
  color: var(--text);
  width: 100%;
  box-sizing: border-box;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.dark-input:focus {
  border-color: var(--primary);
  background: #fff;
  box-shadow: 0 0 0 4px var(--primary-soft);
}

.field-help {
  margin: 8px 0 0;
  font-size: 12px;
  color: var(--text-muted);
}

.helper-text {
  font-size: 12px;
  color: var(--text-muted);
  padding: 12px 0;
}

.summary-strip {
  margin-top: 20px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.summary-chip {
  background: #f8fafc;
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-soft);
  font-size: 13px;
}

.summary-chip-label {
  color: var(--text-muted);
  font-weight: 700;
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 0.5px;
}

.actions-row {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary,
.btn-cupon {
  height: 44px;
  border-radius: 10px;
  padding: 0 18px;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-primary {
  background: var(--primary);
  color: #fff;
  border: none;
}

.btn-primary:hover {
  filter: brightness(1.05);
}

.btn-secondary {
  background: var(--surface);
  color: var(--text-soft);
  border: 1px solid var(--border);
}

.btn-secondary:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: #fff;
}

.btn-cupon {
  background: linear-gradient(135deg, #003087 0%, #001f5c 100%);
  color: #f5c518;
  border: 2px solid #f5c518;
  padding: 0 22px;
  letter-spacing: 0.3px;
  box-shadow: 0 3px 10px rgba(0, 48, 135, 0.35);
}

.btn-cupon:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(0, 48, 135, 0.45);
  filter: brightness(1.06);
}

.btn-cupon:disabled,
.btn-secondary:disabled,
.btn-primary:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.btn-cupon-inner {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cupon-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: #f5c518;
}

.cupon-spinner {
  flex-shrink: 0;
  animation: spin 1s linear infinite;
  color: #f5c518;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 18px;
}

.kpi-card {
  background: #f8fafc;
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.kpi-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-muted);
  font-weight: 700;
}

.kpi-value {
  color: var(--primary);
  font-size: 22px;
  font-weight: 900;
}

.preview-table-wrap {
  overflow-x: auto;
}

.preview-table {
  width: 100%;
  border-collapse: collapse;
}

.preview-table th,
.preview-table td {
  padding: 13px 14px;
  border-bottom: 1px solid #eef2f7;
  font-size: 13px;
  text-align: left;
}

.preview-table th {
  background: #f8fafc;
  color: var(--text-muted);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 800;
}

.preview-table tbody tr:hover td {
  background: #fcfdff;
}

.main-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sub-text {
  font-size: 11px;
  color: var(--text-muted);
}

.th-right {
  text-align: right !important;
}

.preview-footer {
  margin-top: 16px;
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: center;
  flex-wrap: wrap;
}

.preview-footer-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.muted {
  margin: 0;
  color: var(--text-muted);
  font-size: 13px;
}

.empty-state.compact {
  padding: 30px 10px 6px;
  text-align: center;
  color: var(--text-muted);
  font-size: 14px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .cupones-page {
    padding: 16px;
  }

  .page-header,
  .form-card,
  .preview-card {
    max-width: 100%;
  }

  .form-grid,
  .kpi-grid {
    grid-template-columns: 1fr;
  }

  .summary-strip,
  .actions-row,
  .preview-footer,
  .preview-footer-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-primary,
  .btn-secondary,
  .btn-cupon {
    width: 100%;
  }
}
</style>