<template>
  <div class="import-page">
    <section class="page-head card">
      <div>
        <p class="eyebrow">Socios</p>
        <h1>Importar Excel</h1>
        <p class="page-subtitle">
          Subí un archivo Excel. Si no hay errores, se importa automáticamente.
        </p>
      </div>
      <div class="head-actions">
        <button class="btn-secondary" @click="volver">Volver</button>
      </div>
    </section>

    <section class="card upload-card">
      <div class="upload-block">
        <div class="field">
          <label>Archivo Excel (.xlsx)</label>
          <input type="file" accept=".xlsx,.xls" @change="onFileChange" />
        </div>

        <p v-if="fileError" class="error-text">⚠️ {{ fileError }}</p>

        <div class="help-box">
          <div class="help-header">
            <strong>Orden esperado de columnas</strong>
            <span class="help-hint">Las columnas deben ir en este orden exacto. Las marcadas con * son obligatorias.</span>
          </div>
          <ol>
            <li><strong>nombre</strong> *</li>
            <li><strong>apellido</strong> *</li>
            <li><strong>dni</strong> *</li>
            <li><strong>tipoSocioPena</strong> * — ej: ACTIVO, VITALICIO</li>
            <li>localidad — nombre de localidad existente</li>
            <li><strong>cobrador</strong> * — nombre exacto del cobrador</li>
            <li>tipoSocioBoca — ej: ADHERENTE, ACTIVO, No Socio</li>
            <li>alias</li>
            <li>email</li>
            <li>telefono</li>
            <li>direccion</li>
            <li>numSocioBoca — número entero</li>
            <li>fechaAntiguedad — formato YYYY-MM-DD</li>
            <li>fechaInicio — formato YYYY-MM-DD</li>
          </ol>
        </div>

        <div class="actions-row">
          <button
            class="btn-primary"
            :disabled="!selectedFile || loading || !!fileError"
            @click="subirArchivo"
          >
            {{ loading ? "Procesando..." : "Subir e importar" }}
          </button>
        </div>

        <p v-if="selectedFile && !fileError" class="file-name">
          📄 <strong>{{ selectedFile.name }}</strong>
          <span class="file-size">({{ fileSizeLabel }})</span>
        </p>

        <p v-if="errorMsg" class="error-text">{{ errorMsg }}</p>
      </div>
    </section>

    <section v-if="resultado" class="card result-card">
      <div v-if="importadoOk" class="import-banner success">
        ✅ Se importaron <strong>{{ resultado.cantidadValidos }}</strong> socios correctamente.
      </div>
      <div v-else-if="resultado.errores?.length" class="import-banner warning">
        ⚠️ No se importó ningún socio. Corregí los errores y volvé a intentar.
      </div>

      <div class="result-head">
        <div class="result-stat" :class="{ 'stat-success': resultado.cantidadValidos > 0 }">
          <span>Socios válidos</span>
          <strong>{{ resultado.cantidadValidos || 0 }}</strong>
        </div>
        <div class="result-stat" :class="{ 'stat-error': resultado.errores?.length > 0 }">
          <span>Errores</span>
          <strong>{{ resultado.errores?.length || 0 }}</strong>
        </div>
      </div>

      <div v-if="resultado.sociosValidos?.length" class="preview-block">
        <h2>Socios importados</h2>
        <div class="table-scroll">
          <table class="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>DNI</th>
                <th>Tipo peña</th>
                <th>Cobrador</th>
                <th>Localidad</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(socio, index) in resultado.sociosValidos" :key="`${socio.dni}-${index}`">
                <td>{{ socio.nombre || "-" }}</td>
                <td>{{ socio.apellido || "-" }}</td>
                <td>{{ socio.dni || "-" }}</td>
                <td>{{ socio.tipoSocioPena || "-" }}</td>
                <td>{{ socio.cobrador || "-" }}</td>
                <td>{{ socio.localidad || "-" }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="resultado.errores?.length" class="errors-block">
        <h2>Errores detectados</h2>
        <ul class="error-list">
          <li v-for="(err, index) in resultado.errores" :key="index">{{ err }}</li>
        </ul>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from "vue"
import { useRouter } from "vue-router"
import { sociosService } from "../../services/sociosService"
import { useToast } from "../../composables/useToast"

const router = useRouter()
const toast = useToast()

const MAX_SIZE_MB = 10
const selectedFile = ref(null)
const loading = ref(false)
const errorMsg = ref("")
const fileError = ref("")
const resultado = ref(null)
const importadoOk = ref(false)

const fileSizeLabel = computed(() => {
  if (!selectedFile.value) return ""
  const mb = selectedFile.value.size / (1024 * 1024)
  return mb < 1 ? `${(mb * 1024).toFixed(0)} KB` : `${mb.toFixed(1)} MB`
})

const VALID_MIME_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
]

function onFileChange(event) {
  const file = event.target.files?.[0] || null
  selectedFile.value = file
  errorMsg.value = ""
  fileError.value = ""
  resultado.value = null
  importadoOk.value = false
  if (!file) return

  if (!VALID_MIME_TYPES.includes(file.type)) {
    fileError.value = "El archivo no es un Excel válido (.xlsx o .xls)."
    return
  }

  const sizeMB = file.size / (1024 * 1024)
  if (sizeMB > MAX_SIZE_MB) {
    fileError.value = `El archivo supera el límite de ${MAX_SIZE_MB} MB (${sizeMB.toFixed(1)} MB).`
  }
}

async function subirArchivo() {
  if (!selectedFile.value || fileError.value) return
  loading.value = true
  errorMsg.value = ""
  importadoOk.value = false
  try {
    const { data } = await sociosService.importarExcel(selectedFile.value)
    resultado.value = data
    if (!data.errores?.length && data.cantidadValidos > 0) {
      importadoOk.value = true
      toast.success(`${data.cantidadValidos} socios importados correctamente.`)
    } else if (data.errores?.length) {
      toast.warning(`Se encontraron ${data.errores.length} error(es). No se importó ningún socio.`)
    }
  } catch (err) {
    errorMsg.value =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      "No se pudo procesar el archivo Excel."
    toast.error(errorMsg.value)
  } finally {
    loading.value = false
  }
}

function volver() { router.push("/socios/activos") }
</script>

<style scoped>
.import-page { display: flex; flex-direction: column; gap: 16px; padding: 28px 32px; }

.page-head {
  padding: 22px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
.upload-card, .result-card { padding: 22px; }
.head-actions { display: flex; gap: 10px; flex-wrap: wrap; }
.eyebrow { margin: 0 0 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--accent); font-weight: 800; }
.page-head h1 { margin: 0 0 4px; font-size: clamp(1.5rem, 3vw, 2rem); font-weight: 900; color: var(--primary); }
.page-subtitle { margin: 0; color: var(--text-muted); font-size: 14px; }

.upload-block { display: flex; flex-direction: column; gap: 16px; }

.field { display: flex; flex-direction: column; gap: 6px; }
.field label { font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.4px; }
.field input[type="file"] { font-size: 13px; }

.help-box { border: 1px solid var(--border); border-radius: 14px; padding: 16px; background: #f8fafc; }
.help-header { display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px; }
.help-box strong { display: block; font-size: 13px; }
.help-hint { font-size: 11px; color: var(--text-muted); font-weight: 400; }
.help-box ol { margin: 0; padding-left: 18px; color: var(--text-muted); font-size: 13px; }
.help-box ol li { margin-bottom: 4px; }
.help-box ol li strong { color: var(--primary); display: inline; }

.actions-row { display: flex; gap: 10px; flex-wrap: wrap; }
.actions-row button { width: 100%; max-width: 240px; }

.file-name { margin: 0; font-size: 13px; color: var(--text-muted); }
.file-size { margin-left: 6px; font-size: 12px; }

.import-banner { padding: 14px 18px; border-radius: 10px; font-size: 14px; font-weight: 600; margin-bottom: 16px; }
.import-banner.success { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
.import-banner.warning { background: #fef9c3; color: #854d0e; border: 1px solid #fde68a; }

.result-head { display: grid; grid-template-columns: repeat(2, minmax(0, 220px)); gap: 16px; margin-bottom: 20px; }
.result-stat { border: 1px solid var(--border); border-radius: 14px; padding: 16px; background: #f8fafc; }
.result-stat span { display: block; color: var(--text-muted); margin-bottom: 8px; font-size: 13px; }
.result-stat strong { font-size: 1.8rem; color: var(--text-main); }
.stat-success { border-color: #bbf7d0; background: #f0fdf4; }
.stat-success strong { color: #15803d; }
.stat-error { border-color: #fecaca; background: #fff5f5; }
.stat-error strong { color: #dc2626; }

.preview-block, .errors-block { margin-top: 18px; }
.preview-block h2, .errors-block h2 { margin: 0 0 12px; font-size: 1.1rem; font-weight: 800; color: var(--primary); }
.table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
.data-table { width: 100%; border-collapse: collapse; min-width: 540px; }
.data-table th { text-align: left; padding: 10px 12px; font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.6px; font-weight: 800; background: #f8fafc; border-bottom: 2px solid var(--border); }
.data-table td { padding: 12px; border-bottom: 1px solid var(--bg); font-size: 13px; }

.error-list { margin: 0; padding-left: 18px; color: #991b1b; display: flex; flex-direction: column; gap: 6px; font-size: 13px; }
.error-text { color: #dc2626; margin: 0; font-size: 13px; font-weight: 600; }

/* ── RESPONSIVO ───────────────────────── */
@media (max-width: 768px) {
  .import-page { padding: 16px; }
  .page-head { flex-direction: column; align-items: stretch; padding: 16px; }
  .upload-card, .result-card { padding: 16px; }
  .head-actions button { width: 100%; }
  .actions-row button { max-width: 100%; }
  .result-head { grid-template-columns: 1fr 1fr; }
}

@media (max-width: 480px) {
  .result-head { grid-template-columns: 1fr; }
  .result-stat strong { font-size: 1.4rem; }
}
</style>