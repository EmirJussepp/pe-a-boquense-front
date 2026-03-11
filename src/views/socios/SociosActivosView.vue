<template>
  <div class="socios-page">
    <section class="page-head card">
      <div class="page-head-copy">
        <p class="eyebrow">Socios</p>
        <h1>Socios activos</h1>
        <p class="page-subtitle">
          Gestión de socios vigentes de la peña.
        </p>
      </div>

      <div class="head-actions">
        <button class="btn-secondary" @click="refreshCurrentPage" :disabled="loading">
          {{ loading ? "Actualizando..." : "Actualizar" }}
        </button>

        <button class="btn-secondary" @click="irImportarExcel">
          Importar Excel
        </button>

        <button class="btn-primary" @click="nuevoSocio">
          Nuevo socio
        </button>
      </div>
    </section>

    <section class="filters card">
      <div class="filters-top">
        <div class="field field-grow">
          <label>Buscar socio</label>
          <input
            v-model="search"
            type="text"
            placeholder="Nombre, apellido, DNI, email..."
            @keyup.enter="applyFilters"
          />
        </div>

        <div class="field field-xs">
          <label>Tamaño</label>
          <select v-model.number="pageSize">
            <option :value="5">5</option>
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="30">30</option>
            <option :value="50">50</option>
          </select>
        </div>

        <div class="filters-actions">
          <button class="btn-primary" @click="applyFilters">
            Buscar
          </button>

          <button class="btn-secondary" @click="clearFilters" :disabled="!hasActiveFilters">
            Limpiar
          </button>
        </div>
      </div>

      <div class="filters-meta">
        <span class="muted">
          Página actual: <strong>{{ page }}</strong>
        </span>

        <span class="muted">
          Registros cargados: <strong>{{ rows.length }}</strong>
        </span>

        <span class="muted">
          Total: <strong>{{ total }}</strong>
        </span>
      </div>
    </section>

    <section class="table-wrap card">
      <div class="table-top">
        <div>
          <h2>Listado</h2>
          <p class="muted">
            {{ tableStatusText }}
          </p>
        </div>
      </div>

      <div v-if="loading" class="empty-state">
        Cargando socios...
      </div>

      <div v-else-if="errorMsg" class="empty-state error-state">
        {{ errorMsg }}
      </div>

      <div v-else-if="!rows.length" class="empty-state">
        No se encontraron socios activos.
      </div>

      <div v-else class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Socio</th>
              <th>DNI</th>
              <th>Contacto</th>
              <th>Cobrador</th>
              <th class="th-actions">Acciones</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="socio in rows" :key="rowId(socio)">
              <td>{{ rowId(socio) }}</td>

              <td>
                <div class="cell-main">
                  <strong>{{ fullName(socio) }}</strong>
                  <span>{{ socio.tipoSocioPenaNombre || socio.tipoSocioPena || "Sin tipo" }}</span>
                </div>
              </td>

              <td>{{ socio.dni || "-" }}</td>

              <td>
                <div class="cell-main">
                  <strong>{{ socio.email || "-" }}</strong>
                  <span>{{ socio.telefono || socio.celular || "Sin teléfono" }}</span>
                </div>
              </td>

              <td>{{ socio.cobradorNombre || socio.cobrador || "-" }}</td>

              <td>
                <div class="row-actions">
                  <button class="table-btn" @click="verSocio(socio)">
                    Ver
                  </button>

                  <button class="table-btn" @click="editarSocio(socio)">
                    Editar
                  </button>

                  <button class="table-btn danger" @click="darDeBaja(socio)">
                    Baja
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pager">
        <div class="pager-left">
          <span class="pager-text">
            Página <strong>{{ page }}</strong> de <strong>{{ totalPages }}</strong>
          </span>
        </div>

        <div class="pager-right">
          <button
            class="btn-secondary"
            :disabled="loading || page <= 1"
            @click="goToFirst"
          >
            Primero
          </button>

          <button
            class="btn-secondary"
            :disabled="loading || page <= 1"
            @click="prevPage"
          >
            Anterior
          </button>

          <button
            class="btn-secondary"
            :disabled="loading || page >= totalPages"
            @click="nextPage"
          >
            Siguiente
          </button>

          <button
            class="btn-secondary"
            :disabled="loading || page >= totalPages"
            @click="goToLast"
          >
            Último
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue"
import { useRouter } from "vue-router"
import { sociosService } from "../../services/sociosService"

const router = useRouter()

const loading = ref(false)
const errorMsg = ref("")
const rows = ref([])

const search = ref("")
const page = ref(1)
const pageSize = ref(10)

const total = ref(0)
const totalPages = ref(1)

const hasActiveFilters = computed(() => {
  return !!search.value.trim() || pageSize.value !== 10
})

const tableStatusText = computed(() => {
  if (!total.value) return "Sin resultados para mostrar."
  return `Mostrando ${rows.value.length} registro(s) de ${total.value}.`
})

function normalizePage(data) {
  const content =
    data?.data ??
    data?.content ??
    data?.items ??
    []

  return {
    data: Array.isArray(content) ? content : [],
    total: Number(data?.total ?? data?.totalElements ?? content?.length ?? 0),
    page: Number(data?.page ?? data?.number ?? 1),
    pageSize: Number(data?.pageSize ?? data?.size ?? 10),
    totalPages: Number(data?.totalPages ?? data?.pages ?? 1),
  }
}

function rowId(socio) {
  return socio?.socioId || socio?.id || "-"
}

function fullName(socio) {
  const nombre = socio?.nombre ?? ""
  const apellido = socio?.apellido ?? ""
  return `${apellido} ${nombre}`.trim() || "Sin nombre"
}

async function loadSocios() {
  loading.value = true
  errorMsg.value = ""

  try {
    const { data } = await sociosService.activos({
      page: page.value,
      pageSize: pageSize.value,
      search: search.value.trim() || undefined,
    })

    const parsed = normalizePage(data)

    rows.value = parsed.data
    total.value = parsed.total
    totalPages.value = Math.max(parsed.totalPages || 1, 1)
    page.value = Math.max(parsed.page || 1, 1)
  } catch (error) {
    console.error("ERROR SOCIOS ACTIVOS >>>", error)
    errorMsg.value =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      "No se pudieron cargar los socios activos."
  } finally {
    loading.value = false
  }
}

function applyFilters() {
  page.value = 1
  loadSocios()
}

function clearFilters() {
  search.value = ""
  pageSize.value = 10
  page.value = 1
  loadSocios()
}

function irImportarExcel() {
  router.push("/socios/importar-excel")
}

function refreshCurrentPage() {
  loadSocios()
}

function prevPage() {
  if (page.value > 1) {
    page.value--
    loadSocios()
  }
}

function nextPage() {
  if (page.value < totalPages.value) {
    page.value++
    loadSocios()
  }
}

function goToFirst() {
  if (page.value !== 1) {
    page.value = 1
    loadSocios()
  }
}

function goToLast() {
  if (page.value !== totalPages.value) {
    page.value = totalPages.value
    loadSocios()
  }
}

function nuevoSocio() {
  router.push("/socios/nuevo")
}

function verSocio(socio) {
  const id = socio?.socioId || socio?.id
  if (!id) return
  router.push(`/socios/${id}`)
}

function editarSocio(socio) {
  const id = socio?.socioId || socio?.id
  if (!id) return
  router.push(`/socios/${id}/editar`)
}

async function darDeBaja(socio) {
  const id = socio?.socioId || socio?.id
  if (!id) return

  const ok = window.confirm(`¿Dar de baja al socio ${fullName(socio)}?`)
  if (!ok) return

  try {
    await sociosService.darDeBaja(id)
    await loadSocios()
  } catch (error) {
    console.error("ERROR BAJA SOCIO >>>", error)
    window.alert(
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      "No se pudo dar de baja al socio."
    )
  }
}

watch(pageSize, () => {
  page.value = 1
  loadSocios()
})

onMounted(loadSocios)
</script>

<style scoped>
.socios-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-head,
.filters,
.table-wrap {
  padding: 22px;
}

.page-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.page-head-copy {
  min-width: 0;
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

.head-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.filters {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.filters-top {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 120px auto;
  gap: 12px;
  align-items: end;
}

.field-grow,
.field-xs {
  margin: 0;
}

.filters-actions {
  display: flex;
  gap: 10px;
  align-items: end;
  flex-wrap: wrap;
}

.filters-meta {
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
  align-items: center;
  padding-top: 2px;
}

.table-top {
  margin-bottom: 14px;
}

.table-top h2 {
  margin: 0 0 4px;
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

.cell-main {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cell-main strong {
  font-weight: 600;
}

.cell-main span {
  color: var(--text-muted);
  font-size: 0.84rem;
}

.th-actions {
  text-align: left;
}

.row-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.table-btn {
  height: 34px;
  padding: 0 10px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.03);
  color: var(--text);
  cursor: pointer;
  transition: 0.18s ease;
}

.table-btn:hover {
  background: rgba(255, 255, 255, 0.05);
}

.table-btn.danger {
  color: #fca5a5;
  border-color: rgba(239, 68, 68, 0.18);
  background: rgba(239, 68, 68, 0.08);
}

.empty-state {
  min-height: 180px;
  display: grid;
  place-items: center;
  color: var(--text-muted);
  text-align: center;
}

.error-state {
  color: #fca5a5;
}

.pager {
  margin-top: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.pager-left {
  display: flex;
  align-items: center;
}

.pager-right {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.pager-text {
  color: var(--text-soft);
}

@media (max-width: 920px) {
  .page-head {
    flex-direction: column;
    align-items: stretch;
  }

  .filters-top {
    grid-template-columns: 1fr;
  }

  .filters-actions {
    align-items: stretch;
  }

  .pager {
    flex-direction: column;
    align-items: stretch;
  }

  .pager-right {
    width: 100%;
  }
}

@media (max-width: 640px) {
  .head-actions,
  .filters-actions,
  .pager-right {
    flex-direction: column;
  }

  .head-actions :deep(button),
  .filters-actions :deep(button),
  .pager-right :deep(button) {
    width: 100%;
  }

  .row-actions {
    flex-direction: column;
  }

  .row-actions .table-btn {
    width: 100%;
  }
}
</style>