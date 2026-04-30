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

    </template>

  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import { sociosService } from "../../services/sociosService"
import { useToast } from "../../composables/useToast"
import { AlertTriangle, User, Trophy } from "lucide-vue-next"

const route = useRoute()
const router = useRouter()
const toast = useToast()

const socio = ref(null)
const loading = ref(false)
const error = ref(null)

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

onMounted(loadSocio)
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

</style>