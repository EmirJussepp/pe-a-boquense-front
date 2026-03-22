<template>
  <div class="socios-page">
    <ConfirmModal ref="confirmModal" />

    <section class="page-head card">
      <div class="page-head-copy">
        <p class="eyebrow">Socios</p>
        <h1>Socios activos</h1>
        <p class="page-subtitle">
          Gestión de socios vigentes de la peña con búsqueda, paginación y acciones rápidas.
        </p>
      </div>

      <div class="head-actions">
        <button class="btn-secondary" @click="refreshCurrentPage" :disabled="loading">
          {{ loading ? "Actualizando..." : "Actualizar" }}
        </button>

        <button
          v-if="auth.isAdmin"
          class="btn-secondary"
          @click="irImportarExcel"
        >
          Importar Excel
        </button>

        <button
          v-if="auth.isAdmin"
          class="btn-primary"
          @click="nuevoSocio"
        >
          + Nuevo socio
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
            placeholder="Nombre, apellido, DNI, teléfono..."
          />
        </div>

        <div class="field field-sm">
          <label>Por página</label>
          <select v-model.number="pageSize">
            <option :value="5">5</option>
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
          </select>
        </div>

        <div class="filters-actions">
          <button class="btn-primary" @click="applyFilters">Buscar</button>
          <button
            class="btn-secondary"
            @click="clearFilters"
            :disabled="!hasActiveFilters"
          >
            Limpiar
          </button>
        </div>
      </div>

      <div class="filters-meta">
        <span class="meta-chip">
          Página <strong>{{ page }}</strong> de <strong>{{ totalPages }}</strong>
        </span>
        <span class="meta-chip">
          Total <strong>{{ total }}</strong> socios
        </span>
        <span class="meta-chip" v-if="search.trim()">
          Búsqueda: <strong>{{ search.trim() }}</strong>
        </span>
      </div>
    </section>

    <section class="table-wrap card">
      <div class="table-top">
        <h2>Listado</h2>
        <span class="count-badge">{{ rows.length }}</span>
      </div>

      <div v-if="loading" class="skeleton-wrap">
        <div v-for="n in 5" :key="n" class="skeleton-row"></div>
      </div>

      <div v-else-if="errorMsg" class="empty-state error-state">
        <div class="empty-box">
          <span class="empty-icon">⚠️</span>
          <p>{{ errorMsg }}</p>
        </div>
      </div>

      <div v-else-if="!rows.length" class="empty-state">
        <div class="empty-box">
          <span class="empty-icon">🗂️</span>
          <p>No se encontraron socios activos.</p>
        </div>
      </div>

      <template v-else>
        <div class="table-scroll desktop-only">
          <table class="data-table">
            <thead>
              <tr>
                <th>SOCIO</th>
                <th>DNI</th>
                <th>CONTACTO</th>
                <th>MEMBRESÍA</th>
                <th>BOCA</th>
                <th>COBRADOR</th>
                <th class="th-actions">ACCIONES</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="socio in rows" :key="socio.socioId">
                <td>
                  <div class="socio-cell">
                    <div class="avatar">{{ initials(socio) }}</div>
                    <div class="socio-info">
                      <strong>{{ fullName(socio) }}</strong>
                      <span v-if="socio.alias" class="socio-alias">
                        {{ socio.alias }}
                      </span>
                    </div>
                  </div>
                </td>

                <td class="mono">{{ socio.dni || "—" }}</td>

                <td>
                  <div class="contact-cell">
                    <span>{{ socio.email || "—" }}</span>
                    <span class="text-muted">{{ socio.telefono || "—" }}</span>
                  </div>
                </td>

                <td>
                  <span
                    v-if="socio.tipoSocioPenaNombre"
                    class="badge badge-tipo"
                  >
                    {{ socio.tipoSocioPenaNombre }}
                  </span>
                  <span v-else class="text-muted">—</span>
                </td>

                <td>
                  <div
                    v-if="socio.tipoSocioBocaNombre || socio.numSocioBoca"
                    class="boca-cell"
                  >
                    <span
                      v-if="socio.tipoSocioBocaNombre"
                      class="badge badge-boca"
                    >
                      {{ socio.tipoSocioBocaNombre }}
                    </span>
                    <span v-if="socio.numSocioBoca" class="boca-num">
                      {{ socio.numSocioBoca }}
                    </span>
                  </div>
                  <span v-else class="text-muted">—</span>
                </td>

                <td>
                  <span v-if="socio.cobradorNombre" class="cobrador-tag">
                    {{ socio.cobradorNombre }}
                  </span>
                  <span v-else class="text-muted">—</span>
                </td>

                <td>
                  <div class="row-actions">
                    <button
                      class="btn-action"
                      @click="verSocio(socio)"
                      title="Ver detalle"
                    >
                      👁️
                    </button>

                    <button
                      v-if="auth.isAdmin"
                      class="btn-action"
                      @click="editarSocio(socio)"
                      title="Editar"
                    >
                      ✏️
                    </button>

                    <button
                      v-if="auth.isAdmin"
                      class="btn-action danger"
                      @click="darDeBaja(socio)"
                      title="Dar de baja"
                    >
                      ⛔
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mobile-cards mobile-only">
          <article
            v-for="socio in rows"
            :key="`mobile-${socio.socioId}`"
            class="socio-card"
          >
            <div class="socio-card-head">
              <div class="socio-cell">
                <div class="avatar">{{ initials(socio) }}</div>
                <div class="socio-info">
                  <strong>{{ fullName(socio) }}</strong>
                  <span v-if="socio.alias" class="socio-alias">
                    {{ socio.alias }}
                  </span>
                </div>
              </div>

              <div class="row-actions">
                <button
                  class="btn-action"
                  @click="verSocio(socio)"
                  title="Ver detalle"
                >
                  👁️
                </button>

                <button
                  v-if="auth.isAdmin"
                  class="btn-action"
                  @click="editarSocio(socio)"
                  title="Editar"
                >
                  ✏️
                </button>

                <button
                  v-if="auth.isAdmin"
                  class="btn-action danger"
                  @click="darDeBaja(socio)"
                  title="Dar de baja"
                >
                  ⛔
                </button>
              </div>
            </div>

            <div class="socio-card-body">
              <div class="info-row">
                <span class="info-label">DNI</span>
                <span class="info-value mono">{{ socio.dni || "—" }}</span>
              </div>

              <div class="info-row">
                <span class="info-label">Email</span>
                <span class="info-value">{{ socio.email || "—" }}</span>
              </div>

              <div class="info-row">
                <span class="info-label">Teléfono</span>
                <span class="info-value">{{ socio.telefono || "—" }}</span>
              </div>

              <div class="info-row">
                <span class="info-label">Membresía</span>
                <span class="info-value">
                  <span
                    v-if="socio.tipoSocioPenaNombre"
                    class="badge badge-tipo"
                  >
                    {{ socio.tipoSocioPenaNombre }}
                  </span>
                  <span v-else class="text-muted">—</span>
                </span>
              </div>

              <div class="info-row">
                <span class="info-label">Boca</span>
                <span class="info-value">
                  <div
                    v-if="socio.tipoSocioBocaNombre || socio.numSocioBoca"
                    class="boca-cell"
                  >
                    <span
                      v-if="socio.tipoSocioBocaNombre"
                      class="badge badge-boca"
                    >
                      {{ socio.tipoSocioBocaNombre }}
                    </span>
                    <span v-if="socio.numSocioBoca" class="boca-num">
                      {{ socio.numSocioBoca }}
                    </span>
                  </div>
                  <span v-else class="text-muted">—</span>
                </span>
              </div>

              <div class="info-row">
                <span class="info-label">Cobrador</span>
                <span class="info-value">
                  <span v-if="socio.cobradorNombre" class="cobrador-tag">
                    {{ socio.cobradorNombre }}
                  </span>
                  <span v-else class="text-muted">—</span>
                </span>
              </div>
            </div>
          </article>
        </div>
      </template>

      <div class="pager">
        <span class="pager-text">
          Página <strong>{{ page }}</strong> de <strong>{{ totalPages }}</strong>
        </span>

        <div class="pager-btns">
          <button
            class="btn-secondary"
            :disabled="loading || page <= 1"
            @click="goToFirst"
          >
            «
          </button>

          <button
            class="btn-secondary"
            :disabled="loading || page <= 1"
            @click="prevPage"
          >
            ‹ Anterior
          </button>

          <button
            class="btn-secondary"
            :disabled="loading || page >= totalPages"
            @click="nextPage"
          >
            Siguiente ›
          </button>

          <button
            class="btn-secondary"
            :disabled="loading || page >= totalPages"
            @click="goToLast"
          >
            »
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch, onBeforeUnmount } from "vue"
import { useRouter } from "vue-router"
import { sociosService } from "../../services/sociosService"
import { useToast } from "../../composables/useToast"
import { useAuthStore } from "../../stores/auth"
import ConfirmModal from "../../components/ui/ConfirmModal.vue"

const router = useRouter()
const toast = useToast()
const auth = useAuthStore()
const confirmModal = ref(null)

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

function normalizePage(data) {
  const content = data?.data ?? data?.content ?? data?.items ?? []

  return {
    data: Array.isArray(content) ? content : [],
    total: Number(data?.total ?? data?.totalElements ?? content?.length ?? 0),
    page: Number(data?.page ?? data?.number ?? 1),
    pageSize: Number(data?.pageSize ?? data?.size ?? 10),
    totalPages: Number(data?.totalPages ?? data?.pages ?? 1),
  }
}

function capitalize(str) {
  if (!str) return ""
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

function fullName(socio) {
  const apellido = capitalize(socio?.apellido ?? "")
  const nombre = capitalize(socio?.nombre ?? "")
  const full = `${apellido}, ${nombre}`.trim()
  return full || "Sin nombre"
}

function initials(socio) {
  const nombre = socio?.nombre?.[0] ?? ""
  const apellido = socio?.apellido?.[0] ?? ""
  return (apellido + nombre).toUpperCase() || "?"
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
    console.error("Error cargando socios activos:", error)
    errorMsg.value = "No se pudieron cargar los socios activos."
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

function irImportarExcel() {
  router.push("/socios/importar-excel")
}

function nuevoSocio() {
  router.push("/socios/nuevo")
}

function verSocio(socio) {
  router.push(`/socios/${socio.socioId}`)
}

function editarSocio(socio) {
  if (!auth.isAdmin) {
    toast.warning("No tenés permiso para editar socios.")
    return
  }

  router.push(`/socios/${socio.socioId}/editar`)
}

async function darDeBaja(socio) {
  if (!auth.isAdmin) {
    toast.warning("No tenés permiso para dar de baja socios.")
    return
  }

  const ok = await confirmModal.value.open({
    icon: "⚠️",
    title: "Dar de baja",
    message: `¿Confirmás dar de baja a ${fullName(socio)}? Pasará a la lista de socios inactivos.`,
    confirmLabel: "Dar de baja",
    variant: "danger",
  })

  if (!ok) return

  try {
    await sociosService.darDeBaja(socio.socioId)
    toast.success(`${fullName(socio)} fue dado de baja correctamente.`)

    if (rows.value.length === 1 && page.value > 1) {
      page.value--
    }

    await loadSocios()
  } catch (error) {
    console.error("Error dando de baja socio:", error)
    toast.error("No se pudo dar de baja al socio. Intentá de nuevo.")
  }
}

watch(pageSize, () => {
  page.value = 1
  loadSocios()
})

let debounceTimer = null

watch(search, () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    page.value = 1
    loadSocios()
  }, 400)
})

onBeforeUnmount(() => {
  clearTimeout(debounceTimer)
})

onMounted(loadSocios)
</script>

<style scoped>
.socios-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 28px 32px;
}

.page-head {
  padding: 22px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.page-head-copy {
  min-width: 0;
}

.eyebrow {
  margin: 0 0 4px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--accent);
  font-weight: 800;
}

.page-head h1 {
  margin: 0 0 4px;
  font-size: clamp(1.6rem, 3vw, 2rem);
  font-weight: 900;
  color: var(--primary);
}

.page-subtitle {
  margin: 0;
  color: var(--text-muted);
  font-size: 14px;
  line-height: 1.5;
}

.head-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.filters {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.filters-top {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 140px auto;
  gap: 12px;
  align-items: end;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.field label {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-muted);
}

.field input,
.field select {
  width: 100%;
}

.field-grow {
  min-width: 0;
}

.field-sm {
  width: 100%;
}

.filters-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filters-meta {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.meta-chip {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 12px;
  color: var(--text-muted);
}

.meta-chip strong {
  color: var(--primary);
}

.table-wrap {
  padding: 22px;
}

.table-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
  justify-content: space-between;
  flex-wrap: wrap;
}

.table-top h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  color: var(--primary);
}

.count-badge {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-muted);
}

.table-scroll {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  min-width: 980px;
  border-collapse: collapse;
  table-layout: fixed;
}

.data-table th {
  text-align: left;
  padding: 10px 14px;
  font-size: 11px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.6px;
  font-weight: 800;
  background: #f8fafc;
  border-bottom: 2px solid var(--border);
}

.data-table td {
  padding: 14px;
  border-bottom: 1px solid var(--bg);
  vertical-align: middle;
  font-size: 13px;
}

.data-table tbody tr:hover {
  background: rgba(0, 59, 122, 0.02);
}

.socio-cell {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.avatar {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  background: var(--primary);
  color: var(--accent, #f1b44c);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 900;
}

.socio-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.socio-info strong {
  font-weight: 700;
  color: var(--primary);
  font-size: 14px;
  line-height: 1.3;
}

.socio-alias {
  font-size: 11px;
  color: var(--text-muted);
}

.contact-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.contact-cell span {
  font-size: 13px;
  word-break: break-word;
}

.badge {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 800;
}

.badge-tipo {
  background: rgba(0, 59, 122, 0.08);
  color: var(--primary);
}

.badge-boca {
  background: rgba(241, 180, 76, 0.15);
  color: #9c6e1e;
}

.cobrador-tag {
  display: inline-flex;
  align-items: center;
  background: rgba(241, 180, 76, 0.15);
  color: #9c6e1e;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
}

.mono {
  font-family: monospace;
  font-size: 12px;
  color: var(--text-soft);
}

.text-muted {
  color: var(--text-muted);
  font-size: 12px;
}

.th-actions {
  text-align: center;
}

.row-actions {
  display: flex;
  gap: 6px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-action {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: white;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.btn-action:hover {
  background: var(--bg);
  border-color: var(--primary);
  transform: translateY(-1px);
}

.btn-action.danger {
  border-color: #fecaca;
  background: #fff5f5;
  color: #dc2626;
}

.btn-action.danger:hover {
  background: #fee2e2;
}

.boca-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.boca-num {
  font-size: 11px;
  color: var(--text-muted);
  font-family: monospace;
}

.skeleton-wrap {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.skeleton-row {
  height: 68px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite;
  border-radius: 12px;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.empty-state {
  min-height: 220px;
  display: grid;
  place-items: center;
}

.empty-box {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  color: var(--text-muted);
}

.empty-icon {
  font-size: 28px;
}

.error-state .empty-box {
  color: #dc2626;
}

.mobile-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.socio-card {
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 14px;
  background: white;
}

.socio-card-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 12px;
}

.socio-card-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 8px;
  border-top: 1px solid var(--bg);
}

.info-label {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: var(--text-muted);
}

.info-value {
  font-size: 13px;
  color: var(--text-soft);
  word-break: break-word;
}

.pager {
  margin-top: 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.pager-text {
  font-size: 13px;
  color: var(--text-muted);
}

.pager-text strong {
  color: var(--primary);
}

.pager-btns {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.desktop-only {
  display: block;
}

.mobile-only {
  display: none;
}

.data-table th:nth-child(1) {
  width: 260px;
}
.data-table th:nth-child(2) {
  width: 110px;
}
.data-table th:nth-child(3) {
  width: 190px;
}
.data-table th:nth-child(4) {
  width: 130px;
}
.data-table th:nth-child(5) {
  width: 130px;
}
.data-table th:nth-child(6) {
  width: 130px;
}
.data-table th:nth-child(7) {
  width: 110px;
}

@media (max-width: 980px) {
  .page-head {
    flex-direction: column;
    align-items: stretch;
  }

  .head-actions {
    justify-content: stretch;
  }

  .filters-top {
    grid-template-columns: 1fr;
  }

  .filters-actions {
    width: 100%;
  }

  .filters-actions button {
    flex: 1;
  }

  .pager {
    flex-direction: column;
    align-items: stretch;
  }
}

@media (max-width: 768px) {
  .socios-page {
    padding: 16px;
  }

  .desktop-only {
    display: none;
  }

  .mobile-only {
    display: flex;
  }

  .table-wrap,
  .filters,
  .page-head {
    padding: 16px;
  }

  .pager-btns {
    display: grid;
    grid-template-columns: 1fr 1fr;
    width: 100%;
  }

  .pager-btns button {
    width: 100%;
  }
}

@media (max-width: 640px) {
  .head-actions {
    flex-direction: column;
  }

  .head-actions button,
  .filters-actions button {
    width: 100%;
  }

  .socio-card-head {
    flex-direction: column;
  }

  .row-actions {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>