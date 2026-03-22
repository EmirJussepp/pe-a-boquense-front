<template>
  <div class="socio-form-page">
    <section class="page-head card">
      <div>
        <p class="eyebrow">Socios</p>
        <h1>{{ isEdit ? "Editar socio" : "Nuevo socio" }}</h1>
        <p class="page-subtitle">
          {{ isEdit ? "Modificar información del socio." : "Registrar un nuevo socio en la peña." }}
        </p>
      </div>
      <div class="head-actions">
        <button class="btn-secondary" @click="volver">Volver</button>
      </div>
    </section>

    <div v-if="error" class="error-banner">
      <span>⚠️</span>
      <span class="error-msg">{{ error }}</span>
      <button class="error-close" @click="error = null">✕</button>
    </div>

    <form class="card form-card" @submit.prevent="guardar">

      <div class="form-section">
        <h2>Datos personales</h2>
        <div class="form-grid">
          <div class="field">
            <label>Nombre <span class="required">*</span></label>
            <input v-model="form.nombre" required />
          </div>
          <div class="field">
            <label>Apellido <span class="required">*</span></label>
            <input v-model="form.apellido" required />
          </div>
          <div class="field">
            <label>DNI <span class="required">*</span></label>
            <input v-model="form.dni" required />
          </div>
          <div class="field">
            <label>Alias</label>
            <input v-model="form.alias" placeholder="Opcional" />
          </div>
          <div class="field">
            <label>N° Socio Boca</label>
            <input v-model.number="form.numSocioBoca" type="number" placeholder="Opcional" />
          </div>
          <div class="field">
            <label>Fecha de Antigüedad</label>
            <input v-model="form.fechaAntiguedad" type="date" />
          </div>
        </div>
      </div>

      <div class="form-section">
        <h2>Contacto</h2>
        <div class="form-grid">
          <div class="field">
            <label>Email</label>
            <input v-model="form.email" type="email" />
          </div>
          <div class="field">
            <label>Teléfono <span class="required">*</span></label>
            <input v-model="form.telefono" required />
          </div>
          <div class="field">
            <label>Dirección</label>
            <input v-model="form.direccion" />
          </div>
          <div class="field">
            <label>Localidad</label>
            <LocalidadBuscador
              v-model="form.localidadId"
              :localidad-inicial="localidadInicial"
            />
          </div>
        </div>
      </div>

      <div class="form-section">
        <h2>Información del socio</h2>
        <div class="form-grid">
          <div class="field">
            <label>Cobrador <span class="required">*</span></label>
            <select v-model.number="form.cobradorId" required>
              <option :value="null" disabled>— Seleccioná un cobrador —</option>
              <option v-for="c in cobradores" :key="c.cobradoresId" :value="c.cobradoresId">
                {{ c.nombre }} — {{ c.zona }}
              </option>
            </select>
          </div>
          <div class="field">
            <label>Tipo Socio Peña <span class="required">*</span></label>
            <select v-model.number="form.tipoSocioPenaId" required>
              <option :value="null" disabled>— Seleccioná un tipo —</option>
              <option v-for="t in tiposSocioPena" :key="t.tipoSocioPenaId" :value="t.tipoSocioPenaId">
                {{ t.nombre }}{{ t.precio ? " — $" + t.precio : "" }}{{ t.esVitalicio ? " (Vitalicio)" : "" }}
              </option>
            </select>
          </div>
          <div class="field">
            <label>Tipo Socio Boca</label>
            <select v-model.number="form.tipoSocioBocaId">
              <option :value="null">— Sin tipo —</option>
              <option v-for="t in tiposSocioBoca" :key="t.tipoSocioBocaId" :value="t.tipoSocioBocaId">
                {{ t.nombre }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? "Guardando..." : "Guardar socio" }}
        </button>
        <button type="button" class="btn-secondary" @click="volver">Cancelar</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, computed } from "vue"
import { useRouter, useRoute } from "vue-router"
import { sociosService } from "../../services/sociosService"
import { http } from "../../services/http"
import { useToast } from "../../composables/useToast"
import LocalidadBuscador from "../../components/LocalidadBuscador.vue"

const router = useRouter()
const route = useRoute()
const toast = useToast()

const loading = ref(false)
const error = ref(null)

const cobradores = ref([])
const tiposSocioPena = ref([])
const tiposSocioBoca = ref([])
const localidadInicial = ref(null)

const form = reactive({
  nombre: "",
  apellido: "",
  alias: null,
  dni: "",
  email: null,
  telefono: "",
  direccion: null,
  numSocioBoca: null,
  fechaAntiguedad: null,
  localidadId: null,
  cobradorId: null,
  tipoSocioPenaId: null,
  tipoSocioBocaId: null,
})

const isEdit = computed(() => !!route.params.id)

async function cargarSelectores() {
  try {
    const [r1, r2, r3] = await Promise.allSettled([
      http.get("/cobradores"),
      http.get("/tipos-socio-pena"),
      http.get("/tipos-socio-boca"),
    ])
    if (r1.status === "fulfilled") cobradores.value = r1.value.data ?? []
    if (r2.status === "fulfilled") tiposSocioPena.value = r2.value.data ?? []
    if (r3.status === "fulfilled") tiposSocioBoca.value = r3.value.data ?? []
  } catch {
    error.value = "No se pudieron cargar algunos datos del formulario."
  }
}

async function cargarSocio() {
  if (!isEdit.value) return
  try {
    const { data } = await sociosService.porId(route.params.id)
    Object.assign(form, {
      nombre: data.nombre,
      apellido: data.apellido,
      alias: data.alias,
      dni: data.dni,
      email: data.email,
      telefono: data.telefono,
      direccion: data.direccion,
      numSocioBoca: data.numSocioBoca,
      // ✅ slice(0,10) convierte "2020-03-15T00:00:00Z" → "2020-03-15" para input[type=date]
      fechaAntiguedad: data.fechaAntiguedad ? data.fechaAntiguedad.slice(0, 10) : null,
      localidadId: data.localidadId,
      cobradorId: data.cobradorId,
      tipoSocioPenaId: data.tipoSocioPenaId,
      tipoSocioBocaId: data.tipoSocioBocaId,
    })
    if (data.localidadNombre) {
      localidadInicial.value = {
        nombre: data.localidadNombre,
        provincia: data.localidadProvincia ?? "",
      }
    }
  } catch {
    error.value = "No se pudo cargar el socio."
  }
}

async function guardar() {
  loading.value = true
  error.value = null
  try {
    if (isEdit.value) {
      await sociosService.editar(route.params.id, form)
      toast.success("Socio actualizado correctamente.")
    } else {
      await sociosService.crear(form)
      toast.success("Socio creado correctamente.")
    }
    router.push("/socios/activos")
  } catch {
    error.value = "No se pudo guardar el socio. Revisá los datos e intentá de nuevo."
  } finally {
    loading.value = false
  }
}

function volver() { router.push("/socios/activos") }

onMounted(async () => {
  await cargarSelectores()
  await cargarSocio()
})
</script>

<style scoped>
.socio-form-page { display: flex; flex-direction: column; gap: 16px; padding: 28px 32px; }
.page-head { padding: 22px; display: flex; justify-content: space-between; align-items: center; gap: 16px; }
.eyebrow { margin: 0 0 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--accent); font-weight: 800; }
.page-head h1 { margin: 0 0 4px; font-size: 2rem; font-weight: 900; color: var(--primary); }
.page-subtitle { margin: 0; color: var(--text-muted); font-size: 14px; }
.head-actions { display: flex; gap: 10px; flex-wrap: wrap; }
.form-card { padding: 24px; display: flex; flex-direction: column; gap: 30px; }
.form-section h2 { margin: 0 0 14px; font-size: 1.1rem; font-weight: 800; color: var(--primary); }
.form-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field label { font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.4px; }
.required { color: #dc2626; }
.field input, .field select, .field textarea { padding: 10px 12px; border-radius: 10px; border: 1px solid var(--border); background: #f8fafc; color: var(--text-main); font-size: 13px; }
.field select { cursor: pointer; }
.error-banner { display: flex; align-items: center; gap: 12px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; padding: 14px 18px; color: #991b1b; font-size: 13px; font-weight: 600; }
.error-msg { flex: 1; }
.error-close { background: none; border: none; color: #991b1b; cursor: pointer; font-size: 16px; }
.form-actions { display: flex; gap: 12px; margin-top: 10px; flex-wrap: wrap; }
@media (max-width: 900px) {
  .page-head { flex-direction: column; align-items: stretch; }
  .form-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .socio-form-page { padding: 16px; }
}
@media (max-width: 600px) {
  .form-grid { grid-template-columns: 1fr; }
  .form-actions { flex-direction: column; }
}
</style>