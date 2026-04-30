<template>
  <div class="detalle-page">

    <!-- HEADER -->
    <section class="page-head card">
      <div class="head-left">
        <div class="avatar-lg">{{ initials }}</div>
        <div class="head-info">
          <p class="eyebrow">Socios</p>
          <h1>{{ fullName }}</h1>
          <div class="head-badges">
            <span class="badge" :class="socio?.estado ? 'badge-success' : 'badge-danger'">
              {{ socio?.estado ? "Activo" : "Baja" }}
            </span>
            <span v-if="socio?.tipoSocioPenaNombre" class="badge badge-tipo">
              {{ socio.tipoSocioPenaNombre }}
            </span>
            <span v-if="socio?.tipoSocioBocaNombre" class="badge badge-boca">
              Boca: {{ socio.tipoSocioBocaNombre }}
            </span>
          </div>
        </div>
      </div>
      <div class="head-actions">
        <button class="btn-secondary" @click="goBack">← Volver</button>
        <button class="btn-primary" @click="editarSocio">Editar socio</button>
      </div>
    </section>

    <!-- ERROR -->
    <div v-if="error" class="error-banner">
      <AlertTriangle :size="16" style="flex-shrink:0" />
      <span>{{ error }}</span>
    </div>

    <!-- SKELETON -->
    <div v-if="loading" class="card skeleton-card">
      <div class="skeleton-line wide"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line short"></div>
    </div>

    <template v-else-if="socio">

      <!-- DATOS PERSONALES -->
      <section class="card detalle-card">
        <h2 class="section-title"><User :size="18" style="vertical-align:-3px;margin-right:6px" />Datos personales</h2>
        <div class="detalle-grid">
          <div class="detalle-item">
            <label>DNI</label>
            <strong class="mono">{{ socio.dni || "—" }}</strong>
          </div>
          <div class="detalle-item">
            <label>Alias</label>
            <strong>{{ socio.alias || "—" }}</strong>
          </div>
          <div class="detalle-item">
            <label>N° Socio Boca</label>
            <strong>{{ socio.numSocioBoca || "—" }}</strong>
          </div>
          <div class="detalle-item">
            <label>Fecha de Inicio</label>
            <strong>{{ formatFecha(socio.fechaInicio) }}</strong>
          </div>
          <div class="detalle-item">
            <label>Fecha de Antigüedad</label>
            <strong>{{ formatFecha(socio.fechaAntiguedad) }}</strong>
          </div>
          <div v-if="socio.fechaDeBaja" class="detalle-item">
            <label>Fecha de Baja</label>
            <strong class="text-danger">{{ formatFecha(socio.fechaDeBaja) }}</strong>
          </div>
        </div>
      </section>

      <!-- CONTACTO -->
      <section class="card detalle-card">
        <h2 class="section-title">📞 Contacto</h2>
        <div class="detalle-grid">
          <div class="detalle-item">
            <label>Email</label>
            <strong>{{ socio.email || "—" }}</strong>
          </div>
          <div class="detalle-item">
            <label>Teléfono</label>
            <strong>{{ socio.telefono || "—" }}</strong>
          </div>
          <div class="detalle-item">
            <label>Dirección</label>
            <strong>{{ socio.direccion || "—" }}</strong>
          </div>
          <div class="detalle-item">
            <label>Localidad</label>
            <strong>{{ localidadLabel }}</strong>
          </div>
        </div>
      </section>

      <!-- MEMBRESÍA -->
      <section class="card detalle-card">
        <h2 class="section-title"><Trophy :size="18" style="vertical-align:-3px;margin-right:6px" />Membresía</h2>
        <div class="detalle-grid">
          <div class="detalle-item">
            <label>Cobrador</label>
            <strong>{{ socio.cobradorNombre || "—" }}</strong>
          </div>
          <div class="detalle-item">
            <label>Tipo Socio Peña</label>
            <strong>{{ socio.tipoSocioPenaNombre || "—" }}</strong>
          </div>
          <div class="detalle-item">
            <label>Tipo Socio Boca</label>
            <strong>{{ socio.tipoSocioBocaNombre || "—" }}</strong>
          </div>
        </div>
      </section>

      <!-- FAMILIARES -->
      <section class="card detalle-card">
        <div class="section-header">
          <h2 class="section-title">👨‍👩‍👧 Familiares</h2>
          <button class="btn-primary btn-sm" @click="abrirFormFamiliar(null)">+ Agregar familiar</button>
        </div>

        <div v-if="loadingFamiliares" class="empty-state-sm">Cargando...</div>

        <div v-else-if="familiares.length === 0" class="empty-state-sm">
          No hay familiares registrados para este socio.
        </div>

        <div v-else class="familiares-tabla">
          <div class="familiar-row familiar-header">
            <span>Nombre</span><span>DNI</span><span>Teléfono</span><span>Parentesco</span><span></span>
          </div>
          <div v-for="f in familiares" :key="f.familiarId" class="familiar-row">
            <span class="familiar-nombre">{{ f.apellido }}, {{ f.nombre }}</span>
            <span class="mono">{{ f.dni || "—" }}</span>
            <span>{{ f.telefono || "—" }}</span>
            <span>{{ f.parentesco || "—" }}</span>
            <span class="familiar-actions">
              <button class="btn-ghost-sm" @click="abrirFormFamiliar(f)">Editar</button>
              <button class="btn-danger-sm" @click="eliminarFamiliar(f)">Eliminar</button>
            </span>
          </div>
        </div>
      </section>

    </template>

  </div>

  <!-- MODAL FAMILIAR -->
  <teleport to="body">
    <transition name="fade">
      <div v-if="modalFamiliar" class="modal-backdrop" @click.self="cerrarModal">
        <div class="modal-box">
          <h3 class="modal-title">{{ editandoFamiliar ? "Editar familiar" : "Agregar familiar" }}</h3>
          <div class="field-grid cols-2">
            <div class="field">
              <label>Nombre <span class="required">*</span></label>
              <input v-model="formFamiliar.nombre" type="text" placeholder="Ej. María" />
            </div>
            <div class="field">
              <label>Apellido <span class="required">*</span></label>
              <input v-model="formFamiliar.apellido" type="text" placeholder="Ej. Pérez" />
            </div>
            <div class="field">
              <label>DNI</label>
              <input v-model="formFamiliar.dni" type="text" placeholder="Ej. 40123456" />
            </div>
            <div class="field">
              <label>Teléfono</label>
              <input v-model="formFamiliar.telefono" type="text" placeholder="Ej. 5491123456789" />
            </div>
            <div class="field cols-span-2">
              <label>Parentesco</label>
              <input v-model="formFamiliar.parentesco" type="text" placeholder="Ej. Hijo, Esposa, Padre..." />
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn-secondary" @click="cerrarModal">Cancelar</button>
            <button class="btn-primary" :disabled="savingFamiliar || !formFamiliarValido" @click="guardarFamiliar">
              {{ savingFamiliar ? "Guardando..." : "Guardar" }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import { sociosService } from "../../services/sociosService"
import { familiaresService } from "../../services/familiaresService"
import { useToast } from "../../composables/useToast"
import { AlertTriangle, User, Trophy } from "lucide-vue-next"

const route = useRoute()
const router = useRouter()
const toast = useToast()

const socio = ref(null)
const loading = ref(false)
const error = ref(null)

// ── Familiares ────────────────────────────────────────────
const familiares = ref([])
const loadingFamiliares = ref(false)

const modalFamiliar = ref(false)
const editandoFamiliar = ref(null)
const savingFamiliar = ref(false)
const formFamiliar = reactive({ nombre: "", apellido: "", dni: "", telefono: "", parentesco: "" })

const formFamiliarValido = computed(
  () => formFamiliar.nombre.trim().length > 0 && formFamiliar.apellido.trim().length > 0
)

async function cargarFamiliares() {
  loadingFamiliares.value = true
  try {
    const res = await familiaresService.listarPorSocio(route.params.id)
    familiares.value = Array.isArray(res.data) ? res.data : []
  } catch { familiares.value = [] }
  finally { loadingFamiliares.value = false }
}

function abrirFormFamiliar(f) {
  editandoFamiliar.value = f
  Object.assign(formFamiliar, {
    nombre:     f?.nombre     ?? "",
    apellido:   f?.apellido   ?? "",
    dni:        f?.dni        ?? "",
    telefono:   f?.telefono   ?? "",
    parentesco: f?.parentesco ?? ""
  })
  modalFamiliar.value = true
}

function cerrarModal() { modalFamiliar.value = false; editandoFamiliar.value = null }

async function guardarFamiliar() {
  if (!formFamiliarValido.value) return
  savingFamiliar.value = true
  try {
    const payload = {
      nombre:     formFamiliar.nombre.trim(),
      apellido:   formFamiliar.apellido.trim(),
      dni:        formFamiliar.dni.trim()        || null,
      telefono:   formFamiliar.telefono.trim()   || null,
      parentesco: formFamiliar.parentesco.trim() || null
    }
    if (editandoFamiliar.value) {
      await familiaresService.actualizar(editandoFamiliar.value.familiarId, payload)
      toast.success("Familiar actualizado.")
    } else {
      await familiaresService.crear({ ...payload, socioId: Number(route.params.id) })
      toast.success("Familiar agregado.")
    }
    cerrarModal()
    cargarFamiliares()
  } catch (err) {
    toast.error(err?.response?.data?.error ?? "No se pudo guardar el familiar.")
  } finally { savingFamiliar.value = false }
}

async function eliminarFamiliar(f) {
  if (!confirm(`¿Eliminar a ${f.nombre} ${f.apellido} como familiar?`)) return
  try {
    await familiaresService.eliminar(f.familiarId)
    toast.success("Familiar eliminado.")
    cargarFamiliares()
  } catch { toast.error("No se pudo eliminar el familiar.") }
}

function capitalize(str) {
  if (!str) return ""
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

const fullName = computed(() => {
  if (!socio.value) return "..."
  return `${capitalize(socio.value.apellido)}, ${capitalize(socio.value.nombre)}`
})

const initials = computed(() => {
  if (!socio.value) return "?"
  return ((socio.value.apellido?.[0] ?? "") + (socio.value.nombre?.[0] ?? "")).toUpperCase()
})

const localidadLabel = computed(() => {
  if (!socio.value?.localidadNombre) return "—"
  return socio.value.localidadProvincia
    ? `${capitalize(socio.value.localidadNombre)}, ${capitalize(socio.value.localidadProvincia)}`
    : capitalize(socio.value.localidadNombre)
})

function formatFecha(v) {
  if (!v) return "—"
  return new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(v))
}

async function loadSocio() {
  loading.value = true
  error.value = null
  try {
    const { data } = await sociosService.porId(route.params.id)
    socio.value = data
  } catch {
    error.value = "No se pudo cargar el socio."
  } finally {
    loading.value = false
  }
}

function goBack() { router.push("/socios/activos") }
function editarSocio() { router.push(`/socios/${route.params.id}/editar`) }

onMounted(() => { loadSocio(); cargarFamiliares() })
</script>

<style scoped>
.detalle-page { display: flex; flex-direction: column; gap: 16px; padding: 28px 32px; }

.page-head {
  padding: 22px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
.head-left { display: flex; align-items: center; gap: 18px; min-width: 0; flex: 1; }
.head-info  { min-width: 0; }
.avatar-lg {
  width: 64px; height: 64px; flex-shrink: 0;
  background: var(--primary); color: var(--accent, #f1b44c);
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-size: 22px; font-weight: 900;
}
.eyebrow { margin: 0 0 2px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--accent); font-weight: 800; }
.page-head h1 { margin: 0 0 8px; font-size: clamp(1.3rem, 3vw, 1.8rem); font-weight: 900; color: var(--primary); word-break: break-word; }
.head-badges { display: flex; gap: 8px; flex-wrap: wrap; }
.head-actions { display: flex; gap: 10px; flex-shrink: 0; }

.badge { padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; }
.badge-success { background: #dcfce7; color: #166534; }
.badge-danger  { background: #fee2e2; color: #991b1b; }
.badge-tipo    { background: rgba(0,59,122,0.08); color: var(--primary); }
.badge-boca    { background: rgba(241,180,76,0.15); color: #9c6e1e; }

.error-banner {
  display: flex; align-items: center; gap: 12px;
  background: #fef2f2; border: 1px solid #fecaca;
  border-radius: 10px; padding: 14px 18px;
  color: #991b1b; font-size: 13px; font-weight: 600;
}

.skeleton-card { padding: 24px; display: flex; flex-direction: column; gap: 14px; }
.skeleton-line {
  height: 16px; border-radius: 6px; width: 60%;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%; animation: shimmer 1.2s infinite;
}
.skeleton-line.wide { width: 80%; height: 24px; }
.skeleton-line.short { width: 40%; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

.detalle-card { padding: 22px; }
.section-title {
  font-size: 13px; font-weight: 800; color: var(--primary);
  text-transform: uppercase; letter-spacing: 0.6px;
  margin: 0 0 20px; padding-bottom: 10px; border-bottom: 2px solid var(--bg);
}
.detalle-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px 24px; }
.detalle-item { display: flex; flex-direction: column; gap: 4px; }
.detalle-item label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); font-weight: 700; }
.detalle-item strong { font-size: 14px; color: var(--text-main); font-weight: 600; word-break: break-word; }
.mono { font-family: monospace; }
.text-danger { color: #dc2626; }

/* ── RESPONSIVO ───────────────────────── */
@media (max-width: 900px) {
  .detalle-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .detalle-page { padding: 16px; }
  .detalle-card { padding: 16px; }
}

@media (max-width: 600px) {
  .page-head { flex-direction: column; align-items: stretch; padding: 16px; }
  .head-left  { flex-direction: row; }
  .head-actions { width: 100%; flex-direction: row; }
  .head-actions button { flex: 1; }
  .avatar-lg { width: 48px; height: 48px; font-size: 16px; }
  .detalle-grid { grid-template-columns: repeat(2, 1fr); gap: 14px 16px; }
}

@media (max-width: 400px) {
  .detalle-grid { grid-template-columns: 1fr; }
  .head-actions { flex-direction: column; }
  .head-actions button { width: 100%; }
}

/* ── Familiares ──────────────────────────── */
.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 10px; }
.section-header .section-title { margin-bottom: 0; border-bottom: none; padding-bottom: 0; }
.btn-sm { padding: 6px 14px; font-size: 12px; }

.empty-state-sm { color: var(--text-muted); font-size: 13px; padding: 12px 0; }

.familiares-tabla { display: flex; flex-direction: column; gap: 0; border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
.familiar-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr auto;
  gap: 12px; padding: 10px 14px; align-items: center; font-size: 13px;
  border-bottom: 1px solid var(--border);
}
.familiar-row:last-child { border-bottom: none; }
.familiar-header { background: #f8fafc; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; color: var(--text-muted); }
.familiar-nombre { font-weight: 600; color: var(--primary); }
.familiar-actions { display: flex; gap: 6px; }

.btn-ghost-sm { padding: 4px 10px; border: 1px solid var(--border); border-radius: 6px; background: white; cursor: pointer; font-size: 12px; font-weight: 600; color: var(--text-muted); }
.btn-ghost-sm:hover { background: #f1f5f9; }
.btn-danger-sm { padding: 4px 10px; border: 1px solid #fecaca; border-radius: 6px; background: #fee2e2; cursor: pointer; font-size: 12px; font-weight: 600; color: #991b1b; }
.btn-danger-sm:hover { background: #fca5a5; }

/* ── Modal ───────────────────────────────── */
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.45); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 16px; }
.modal-box { background: white; border-radius: 16px; padding: 28px; width: 100%; max-width: 520px; display: flex; flex-direction: column; gap: 20px; box-shadow: 0 20px 60px rgba(0,0,0,.2); }
.modal-title { margin: 0; font-size: 18px; font-weight: 800; color: var(--primary); }
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; }

.field-grid { display: grid; gap: 14px; }
.cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.cols-span-2 { grid-column: span 2; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field label { font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.4px; }
.required { color: #dc2626; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.18s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 600px) {
  .familiar-row { grid-template-columns: 1fr 1fr; }
  .familiar-header { display: none; }
  .familiar-actions { grid-column: span 2; }
  .cols-2 { grid-template-columns: 1fr; }
  .cols-span-2 { grid-column: span 1; }
}
</style>