<template>
  <div class="page">
    <section class="page-head card">
      <div class="page-head-copy">
        <p class="eyebrow">Salones</p>
        <h1>{{ esEdicion ? "Editar Alquiler" : "Nuevo Alquiler" }}</h1>
        <p class="page-subtitle">
          {{ esEdicion ? "Modificá los datos del alquiler." : "Completá los datos para registrar un nuevo alquiler." }}
        </p>
      </div>
      <div class="head-actions">
        <button class="btn-secondary" type="button" @click="volver">Volver</button>
      </div>
    </section>

    <section class="card form-card">
      <div v-if="loadingData" class="loading-state">
        <div class="skeleton-wrap">
          <div v-for="n in 4" :key="n" class="skeleton-row"></div>
        </div>
      </div>

      <form v-else class="form-shell" @submit.prevent="guardar">
        <div class="form-section">
          <h3 class="form-section-title">Salón</h3>
          <div class="field-grid cols-2">
            <div class="field">
              <label>Salón <span class="required">*</span></label>
              <select v-model="form.salonId" required>
                <option :value="null" disabled>Seleccioná un salón...</option>
                <option v-for="salon in salones" :key="salon.id" :value="salon.id">
                  {{ salon.nombre }} — ${{ formatMoney(salon.precio) }}
                </option>
              </select>
            </div>
            <div class="field">
              <label>Fecha y hora <span class="required">*</span></label>
              <input v-model="form.fecha" type="datetime-local" required />
            </div>
          </div>
        </div>

        <div class="form-divider"></div>

        <div class="form-section">
          <h3 class="form-section-title">Datos del cliente</h3>
          <div class="field-grid cols-3">
            <div class="field">
              <label>Nombre <span class="required">*</span></label>
              <input v-model.trim="form.nombre" type="text" placeholder="Ej. Juan Pérez" required />
            </div>
            <div class="field">
              <label>DNI <span class="required">*</span></label>
              <input v-model.trim="form.dni" type="text" inputmode="numeric" placeholder="Ej. 32123456" required />
            </div>
            <div class="field">
              <label>Teléfono <span class="required">*</span></label>
              <input v-model.trim="form.telefono" type="text" placeholder="Ej. 1134567890" required />
            </div>
          </div>
        </div>

        <div class="form-divider"></div>

        <div class="form-section">
          <h3 class="form-section-title">Económico</h3>
          <div class="field-grid cols-3">
            <div class="field">
              <label>Monto <span class="required">*</span></label>
              <div class="input-prefix-wrap">
                <span class="input-prefix">$</span>
                <input v-model="form.monto" type="number" min="0" step="0.01" placeholder="0.00" required />
              </div>
              <small v-if="montoAutocompletado" class="field-hint">Precio del salón aplicado automáticamente</small>
            </div>
            <div class="field">
              <label>Método de pago <span class="required">*</span></label>
              <select v-model="form.metodoPagoId" required>
                <option :value="null" disabled>Seleccioná un método...</option>
                <option v-for="metodo in metodosPago" :key="metodo.id" :value="metodo.id">
                  {{ metodo.nombre }}
                </option>
              </select>
            </div>
            <div class="field">
              <label>Condición de pago</label>
              <div class="toggle-group">
                <button type="button" class="btn-toggle" :class="{ 'active-success': form.condicion === true }" @click="form.condicion = true">
                  Con seña
                </button>
                <button type="button" class="btn-toggle" :class="{ 'active-neutral': form.condicion === false }" @click="form.condicion = false">
                  Sin seña
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="form-divider"></div>

        <div class="form-section">
          <h3 class="form-section-title">Observaciones</h3>
          <div class="field">
            <textarea v-model.trim="form.observaciones" rows="4" placeholder="Notas adicionales sobre el alquiler..."></textarea>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-secondary" @click="volver">Cancelar</button>
          <button type="submit" class="btn-primary" :disabled="saving">
            {{ saving ? "Guardando..." : esEdicion ? "Guardar cambios" : "Registrar alquiler" }}
          </button>
        </div>
      </form>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import { alquileresService } from "../../services/alquileresService"
import { salonesService } from "../../services/salonesService"
import { metodosPagoService } from "../../services/metodosPagoService"
import { useToast } from "../../composables/useToast"

const route = useRoute()
const router = useRouter()
const toast = useToast()

const esEdicion = computed(() => Boolean(route.params.id))
const loadingData = ref(false)
const saving = ref(false)
const salones = ref([])
const metodosPago = ref([])
const montoAutocompletado = ref(false)

function pad(value) { return String(value).padStart(2, "0") }

function nowDatetimeLocal() {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function toDatetimeLocal(value) {
  if (!value) return nowDatetimeLocal()
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return nowDatetimeLocal()
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

function normalizeSalon(item) {
  return { id: Number(item?.salonId ?? item?.id ?? 0), nombre: String(item?.nombre ?? ""), precio: Number(item?.precio ?? 0) }
}

function normalizeMetodoPago(item) {
  return { id: Number(item?.metodoPagoId ?? item?.id ?? 0), nombre: String(item?.nombre ?? "") }
}

const form = reactive({
  salonId: null, nombre: "", dni: "", telefono: "",
  fecha: nowDatetimeLocal(), monto: "", condicion: false,
  metodoPagoId: null, observaciones: "",
})

watch(() => form.salonId, (nuevoId) => {
  if (!nuevoId || esEdicion.value) return
  const salon = salones.value.find(item => item.id === Number(nuevoId))
  if (!salon) return
  form.monto = salon.precio
  montoAutocompletado.value = true
})

watch(() => form.monto, () => {
  if (!montoAutocompletado.value) return
  const salon = salones.value.find(item => item.id === Number(form.salonId))
  if (salon && Number(form.monto) !== Number(salon.precio)) montoAutocompletado.value = false
})

function volver() { router.push("/alquileres") }

async function cargarCatalogos() {
  const [salonesRes, metodosRes] = await Promise.all([
    salonesService.listar(),
    metodosPagoService.listar(),
  ])
  salones.value = Array.isArray(salonesRes?.data)
    ? salonesRes.data.map(normalizeSalon).filter(item => item.id > 0)
    : []
  metodosPago.value = Array.isArray(metodosRes?.data)
    ? metodosRes.data.map(normalizeMetodoPago).filter(item => item.id > 0)
    : []
  if (!esEdicion.value && !form.metodoPagoId && metodosPago.value.length) {
    form.metodoPagoId = metodosPago.value[0].id
  }
}

async function cargarAlquiler() {
  loadingData.value = true
  try {
    const { data } = await alquileresService.obtener(route.params.id)
    form.salonId = Number(data?.salonId ?? data?.salon?.salonId ?? data?.salon?.id ?? null)
    form.nombre = String(data?.nombre ?? "")
    form.dni = String(data?.dni ?? "")
    form.telefono = String(data?.telefono ?? "")
    form.fecha = toDatetimeLocal(data?.fecha ?? route.query.fecha)
    form.monto = data?.monto ?? ""
    form.condicion = Boolean(data?.condicion)
    form.metodoPagoId = Number(data?.metodoPagoId ?? data?.metodoPago?.metodoPagoId ?? data?.metodoPago?.id ?? null)
    form.observaciones = String(data?.observaciones ?? "")
  } catch (err) {
    console.error("No se pudo cargar el alquiler.", err)
    toast.error("No se pudo cargar el alquiler.")
    router.push("/alquileres")
  } finally {
    loadingData.value = false
  }
}

async function guardar() {
  saving.value = true
  try {
    const payload = {
      salonId: Number(form.salonId),
      nombre: form.nombre.trim(),
      dni: form.dni.trim(),
      telefono: form.telefono.trim(),
      fecha: form.fecha,
      monto: String(form.monto),
      condicion: Boolean(form.condicion),
      metodoPagoId: Number(form.metodoPagoId),
      observaciones: form.observaciones.trim() || null,
    }
    if (esEdicion.value) {
      await alquileresService.actualizar(route.params.id, payload)
      toast.success("Alquiler actualizado correctamente.")
    } else {
      await alquileresService.crear(payload)
      toast.success("Alquiler registrado correctamente.")
    }
    router.push("/alquileres")
  } catch (err) {
    console.error("Error guardando alquiler", err)
    toast.error("No se pudo guardar el alquiler.")
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    await cargarCatalogos()
    if (!esEdicion.value) {
      if (route.query.fecha) form.fecha = toDatetimeLocal(route.query.fecha)
      return
    }
    await cargarAlquiler()
  } catch (err) {
    console.error("Error cargando datos iniciales.", err)
    toast.error("No se pudieron cargar los datos necesarios.")
  }
})
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 16px; }
.page-head { padding: 22px; display: flex; justify-content: space-between; align-items: center; gap: 16px; }
.page-head-copy { min-width: 0; }
.eyebrow { margin: 0 0 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--accent); font-weight: 800; }
.page-head h1 { margin: 0 0 4px; font-size: clamp(1.6rem, 3vw, 2rem); font-weight: 900; color: var(--primary); }
.page-subtitle { margin: 0; color: var(--text-muted); font-size: 14px; }
.head-actions { display: flex; gap: 10px; flex-wrap: wrap; justify-content: flex-end; }
.form-card { padding: 24px; }
.form-shell { display: flex; flex-direction: column; gap: 22px; }
.form-section { display: flex; flex-direction: column; gap: 16px; }
.form-section-title { margin: 0; font-size: 16px; font-weight: 800; color: var(--primary); }
.field-grid { display: grid; gap: 16px; }
.cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.field { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.field label { font-size: 12px; font-weight: 700; color: var(--text-muted); }
.field textarea { resize: vertical; min-height: 100px; }
.field-hint { font-size: 12px; color: #9c6e1e; }
.required { color: #dc2626; }
.input-prefix-wrap { display: flex; align-items: stretch; border: 1px solid var(--border); border-radius: 10px; overflow: hidden; background: white; }
.input-prefix { padding: 0 12px; font-weight: 700; color: var(--text-muted); border-right: 1px solid var(--border); display: flex; align-items: center; background: #f8fafc; font-size: 13px; }
.input-prefix-wrap input { border: none !important; border-radius: 0 !important; flex: 1; box-shadow: none !important; }
.toggle-group { display: flex; gap: 8px; flex-wrap: wrap; }
.btn-toggle { border: 1px solid var(--border); background: white; border-radius: 8px; padding: 10px 14px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.15s; color: var(--text-soft); }
.btn-toggle:hover { background: var(--bg); }
.active-success { background: rgba(34,197,94,0.1); border-color: rgba(34,197,94,0.4); color: #15803d; }
.active-neutral { background: rgba(148,163,184,0.15); border-color: rgba(148,163,184,0.35); color: #475569; }
.form-divider { height: 1px; background: var(--border); }
.form-actions { display: flex; justify-content: flex-end; gap: 10px; flex-wrap: wrap; padding-top: 8px; border-top: 1px solid var(--border); }
.loading-state { min-height: 220px; }
.skeleton-wrap { display: flex; flex-direction: column; gap: 12px; }
.skeleton-row { height: 64px; background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%); background-size: 200% 100%; animation: shimmer 1.2s infinite; border-radius: 10px; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
@media (max-width: 980px) {
  .page-head { flex-direction: column; align-items: stretch; }
  .head-actions { justify-content: stretch; }
}
@media (max-width: 768px) {
  .page-head, .form-card { padding: 16px; }
  .cols-2, .cols-3 { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .head-actions, .form-actions { flex-direction: column; }
  .head-actions button, .form-actions button { width: 100%; }
}
</style>