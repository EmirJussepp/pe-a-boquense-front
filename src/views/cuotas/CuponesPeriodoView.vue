<template>
  <div class="cupones-page">

    <header class="page-header">
      <div class="header-left">
        <p class="eyebrow">CUOTAS</p>
        <h1>Cupones por Período</h1>
        <p class="hero-description">Generá e imprimí los cupones de un período con filtro opcional por cobrador.</p>
      </div>
    </header>

    <section class="card form-card">
      <h3 class="card-subtitle">CONFIGURACIÓN</h3>

      <div class="form-grid">
        <div class="field-container">
          <label class="field-label">Período <span class="required">*</span></label>
          <input
            type="month"
            :value="periodoDisplay"
            :max="maxMonth"
            class="dark-input"
            @change="onPeriodoChange"
          />
        </div>

        <div class="field-container">
          <label class="field-label">Cobrador <span class="field-optional">(opcional)</span></label>
          <div v-if="loadingCobradores" class="helper-text">Cargando cobradores...</div>
          <select v-else v-model="cobradorId" class="dark-input">
            <option :value="null">— Todos los cobradores —</option>
            <option
              v-for="c in cobradores"
              :key="c.cobradoresId"
              :value="c.cobradoresId"
            >
              {{ c.nombre }} ({{ c.zona }})
            </option>
          </select>
        </div>
      </div>

      <div class="actions-row">
        <button
          class="btn-cupon"
          :disabled="!periodo || loading"
          @click="generarCupones"
        >
          <span class="btn-cupon-inner">
            <Loader v-if="loading" :size="16" class="cupon-spinner" />
            <svg v-else class="cupon-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M17 17H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2z"/>
              <path d="M7 17v2a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2"/>
              <line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="13" y2="13"/>
            </svg>
            {{ loading ? "Generando..." : "Imprimir cupones" }}
          </span>
        </button>
      </div>
    </section>

  </div>
</template>

<script setup>
import { computed, ref } from "vue"
import { cuotasService } from "../../services/cuotasService"
import { useCobradores } from "../../composables/useCobradores"
import { useCuponPrinting, normalizeCuotaParaImprimir } from "../../composables/useCuponPrinting"
import { useToast } from "../../composables/useToast"
import { Loader } from "lucide-vue-next"

const toast = useToast()
const { cobradores, loadingCobradores } = useCobradores()
const { ensureLogoDataUrl, buildCuponHTML, printHTML, wrapCuponesHTML } = useCuponPrinting()

// ── Período ───────────────────────────────────────────────
const now = new Date()
const periodo = ref(`${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`)

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
}

const periodoLabel = computed(() => {
  const v = periodo.value
  if (v.length !== 6) return v
  const meses = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]
  return `${meses[parseInt(v.slice(4, 6), 10) - 1]} ${v.slice(0, 4)}`
})

// ── Cobrador ─────────────────────────────────────────────
const cobradorId = ref(null)

// ── Generar ──────────────────────────────────────────────
const loading = ref(false)

async function generarCupones() {
  if (!periodo.value) return
  loading.value = true
  try {
    await ensureLogoDataUrl()
    const { data } = await cuotasService.listarCuponesPeriodo(periodo.value, cobradorId.value)
    const items = Array.isArray(data) ? data : []
    if (!items.length) {
      toast.info(`No hay cuotas pendientes para ${periodoLabel.value}.`)
      return
    }
    const normalizados = items.map(normalizeCuotaParaImprimir)
    printHTML(wrapCuponesHTML(normalizados.map(buildCuponHTML).join(""), `Cupones – ${periodoLabel.value}`))
  } catch {
    toast.error("No se pudieron generar los cupones. Intentá de nuevo.")
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.cupones-page {
  background-color: var(--bg);
  min-height: 100vh;
  padding: 20px 40px;
  box-sizing: border-box;
  width: 100%;
}

.page-header {
  margin-bottom: 25px;
}

.eyebrow { color: var(--accent); font-weight: 800; font-size: 11px; letter-spacing: 1px; margin: 0; }
.page-header h1 { font-size: clamp(1.6rem, 4vw, 2rem); font-weight: 900; color: var(--primary); margin: 5px 0; }
.hero-description { color: var(--text-muted); font-size: 14px; margin: 0; }

.card {
  background: white;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  box-shadow: var(--shadow-sm);
  max-width: 700px;
}

.card-subtitle { font-size: 12px; color: var(--text-muted); margin: 0 0 16px; font-weight: 800; }

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}

.field-container { display: flex; flex-direction: column; }
.field-label { font-size: 13px; font-weight: 600; color: var(--text-soft); margin-bottom: 8px; }

.field-optional {
  font-weight: 400;
  color: var(--text-muted);
  font-size: 0.85em;
}

.required { color: var(--danger); margin-left: 2px; }

.dark-input {
  background: #f8fafc;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px;
  color: var(--text-main);
  width: 100%;
  box-sizing: border-box;
  font-size: 14px;
}

.helper-text { font-size: 12px; color: var(--text-muted); padding: 12px 0; }

.actions-row { display: flex; }

.btn-cupon {
  background: linear-gradient(135deg, #003087 0%, #001f5c 100%);
  color: #f5c518;
  border: 2px solid #f5c518;
  border-radius: 10px;
  padding: 11px 24px;
  font-weight: 800;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
  letter-spacing: 0.3px;
  box-shadow: 0 3px 10px rgba(0,48,135,0.35);
  transition: transform 0.15s, box-shadow 0.15s, filter 0.15s;
}
.btn-cupon:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0,48,135,0.45); filter: brightness(1.08); }
.btn-cupon:active:not(:disabled) { transform: translateY(0); box-shadow: 0 2px 6px rgba(0,48,135,0.3); }
.btn-cupon:disabled { opacity: 0.55; cursor: not-allowed; }
.btn-cupon-inner { display: flex; align-items: center; gap: 8px; }
.cupon-icon { width: 16px; height: 16px; flex-shrink: 0; color: #f5c518; }
.cupon-spinner { flex-shrink: 0; animation: spin 1s linear infinite; color: #f5c518; }

@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 768px) {
  .cupones-page { padding: 16px; }
  .form-grid { grid-template-columns: 1fr; }
  .btn-cupon { width: 100%; justify-content: center; }
  .btn-cupon-inner { justify-content: center; }
}
</style>
