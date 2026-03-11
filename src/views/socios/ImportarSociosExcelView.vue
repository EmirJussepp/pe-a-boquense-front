<template>
  <div class="import-page">
    <section class="page-head card">
      <div>
        <p class="eyebrow">Socios</p>
        <h1>Importar Excel</h1>
        <p class="page-subtitle">
          Validá un archivo Excel de socios antes de importarlo al sistema.
        </p>
      </div>

      <div class="head-actions">
        <button class="btn-secondary" @click="volver">
          Volver
        </button>
      </div>
    </section>

    <section class="card upload-card">
      <div class="upload-block">
        <div class="field">
          <label>Archivo Excel (.xlsx)</label>
          <input
            type="file"
            accept=".xlsx,.xls"
            @change="onFileChange"
          />
        </div>

        <div class="help-box">
          <strong>Orden esperado de columnas</strong>
          <ol>
            <li>Nombre</li>
            <li>Apellido</li>
            <li>DNI</li>
            <li>Tipo Socio Peña</li>
            <li>Localidad</li>
            <li>Cobrador</li>
            <li>Tipo Socio Boca</li>
            <li>Alias</li>
            <li>Email</li>
            <li>Teléfono</li>
            <li>Dirección</li>
            <li>Número Socio Boca</li>
          </ol>
        </div>

        <div class="actions-row">
          <button
            class="btn-primary"
            :disabled="!selectedFile || loading"
            @click="subirArchivo"
          >
            {{ loading ? "Validando..." : "Validar archivo" }}
          </button>
        </div>

        <p v-if="selectedFile" class="muted">
          Archivo seleccionado: <strong>{{ selectedFile.name }}</strong>
        </p>

        <p v-if="errorMsg" class="error-text">
          {{ errorMsg }}
        </p>
      </div>
    </section>

    <section v-if="resultado" class="card result-card">
      <div class="result-head">
        <div class="result-stat">
          <span>Socios válidos</span>
          <strong>{{ resultado.cantidadValidos || 0 }}</strong>
        </div>

        <div class="result-stat">
          <span>Errores</span>
          <strong>{{ resultado.errores?.length || 0 }}</strong>
        </div>
      </div>

      <div v-if="resultado.sociosValidos?.length" class="preview-block">
        <h2>Preview de socios válidos</h2>

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
          <li v-for="(err, index) in resultado.errores" :key="index">
            {{ err }}
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"
import { sociosService } from "../../services/sociosService"

const router = useRouter()

const selectedFile = ref(null)
const loading = ref(false)
const errorMsg = ref("")
const resultado = ref(null)

function onFileChange(event) {
  const file = event.target.files?.[0] || null
  selectedFile.value = file
  errorMsg.value = ""
  resultado.value = null
}

async function subirArchivo() {
  if (!selectedFile.value) return

  loading.value = true
  errorMsg.value = ""

  try {
    const { data } = await sociosService.importarExcel(selectedFile.value)
    resultado.value = data
  } catch (error) {
    console.error("ERROR IMPORTAR EXCEL >>>", error)
    errorMsg.value =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      "No se pudo validar el archivo Excel."
  } finally {
    loading.value = false
  }
}

function volver() {
  router.push("/socios/activos")
}
</script>

<style scoped>
.import-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-head,
.upload-card,
.result-card {
  padding: 22px;
}

.page-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.head-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.eyebrow {
  margin: 0 0 8px;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  font-weight: 700;
}

.page-head h1 {
  margin: 0 0 6px;
  font-size: 2rem;
  line-height: 1.1;
}

.page-subtitle {
  margin: 0;
  color: var(--text-muted);
}

.upload-block {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.help-box {
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
}

.help-box strong {
  display: block;
  margin-bottom: 10px;
}

.help-box ol {
  margin: 0;
  padding-left: 18px;
  color: var(--text-muted);
}

.actions-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.result-head {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 220px));
  gap: 16px;
  margin-bottom: 20px;
}

.result-stat {
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
}

.result-stat span {
  display: block;
  color: var(--text-muted);
  margin-bottom: 8px;
}

.result-stat strong {
  font-size: 1.8rem;
}

.preview-block,
.errors-block {
  margin-top: 18px;
}

.preview-block h2,
.errors-block h2 {
  margin: 0 0 12px;
  font-size: 1.1rem;
}

.table-scroll {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  text-align: left;
  padding: 12px 10px;
  font-size: 0.78rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 700;
  border-bottom: 1px solid var(--border);
}

.data-table td {
  padding: 14px 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  vertical-align: middle;
}

.error-list {
  margin: 0;
  padding-left: 18px;
  color: #fca5a5;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.error-text {
  color: #fca5a5;
  margin: 0;
}

@media (max-width: 920px) {
  .page-head {
    flex-direction: column;
    align-items: stretch;
  }

  .result-head {
    grid-template-columns: 1fr;
  }
}
</style>