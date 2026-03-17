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
        <button class="btn-secondary" @click="volver">Volver</button>
      </div>
    </section>

    <section class="card" style="padding: 28px;">
      <div v-if="loadingData" class="empty-state">Cargando datos...</div>

      <form v-else @submit.prevent="guardar">

        <div class="form-section">
          <h3 class="form-section-title">Salón</h3>
          <div class="field-row">
            <div class="field">
              <label>Salón <span class="required">*</span></label>
              <select v-model="form.salonId" required>
                <option :value="null" disabled>Seleccioná un salón...</option>
                <option v-for="s in salones" :key="s.salonId" :value="s.salonId">
                  {{ s.nombre }} — ${{ s.precio }}
                </option>
              </select>
            </div>
            <div class="field">
              <label>Fecha y Hora <span class="required">*</span></label>
              <input v-model="form.fecha" type="datetime-local" required />
            </div>
          </div>
        </div>

        <div class="form-divider" />

        <div class="form-section">
          <h3 class="form-section-title">Datos del Cliente</h3>
          <div class="field-row">
            <div class="field">
              <label>Nombre <span class="required">*</span></label>
              <input v-model="form.nombre" type="text" placeholder="Ej. Juan Pérez" required />
            </div>
            <div class="field">
              <label>DNI <span class="required">*</span></label>
              <input v-model="form.dni" type="text" placeholder="Ej. 32123456" required />
            </div>
            <div class="field">
              <label>Teléfono <span class="required">*</span></label>
              <input v-model="form.telefono" type="text" placeholder="Ej. 1134567890" required />
            </div>
          </div>
        </div>

        <div class="form-divider" />

        <div class="form-section">
          <h3 class="form-section-title">Económico</h3>
          <div class="field-row">
            <div class="field">
              <label>Monto <span class="required">*</span></label>
              <div class="input-prefix-wrap">
                <span class="input-prefix">$</span>
                <input v-model="form.monto" type="number" min="0" step="0.01" placeholder="0.00" required />
              </div>
              <span v-if="montoAutocompletado" class="field-hint">💡 Precio del salón aplicado automáticamente</span>
            </div>
            <div class="field">
              <label>Método de Pago <span class="required">*</span></label>
              <select v-model="form.metodoPagoId" required>
                <option v-for="m in metodosPago" :key="m.metodoPagoId" :value="m.metodoPagoId">
                  {{ m.nombre }}
                </option>
              </select>
            </div>
            <div class="field field-sm">
              <label>Condición de Pago</label>
              <div class="toggle-group">
                <button type="button" class="btn-toggle" :class="{ 'active-success': form.condicion === true }" @click="form.condicion = true">✓ Con seña</button>
                <button type="button" class="btn-toggle" :class="{ 'active-neutral': form.condicion === false }" @click="form.condicion = false">✗ Sin seña</button>
              </div>
            </div>
          </div>
        </div>

        <div class="form-divider" />

        <div class="form-section">
          <h3 class="form-section-title">Observaciones</h3>
          <div class="field">
            <textarea v-model="form.observaciones" rows="3" placeholder="Notas adicionales sobre el alquiler..." />
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-secondary" @click="volver">Cancelar</button>
          <button type="submit" class="btn-primary" :disabled="saving">
            {{ saving ? "Guardando..." : (esEdicion ? "Guardar cambios" : "Registrar alquiler") }}
          </button>
        </div>

      </form>
    </section>

  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import { alquileresService } from "../../services/alquileresService"
import { salonesService } from "../../services/salonesService"
import { metodosPagoService } from "../../services/metodosPagoService"

const route = useRoute()
const router = useRouter()

const esEdicion = computed(() => !!route.params.id)
const loadingData = ref(false)
const saving = ref(false)
const salones = ref([])
const metodosPago = ref([])
const montoAutocompletado = ref(false)

const ahora = () => {
  const d = new Date()
  const pad = n => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const form = ref({
  salonId: null,
  nombre: "",
  dni: "",
  telefono: "",
  fecha: ahora(),
  monto: "",
  condicion: false,
  metodoPagoId: null,
  observaciones: "",
})

// Auto-completa el monto con el precio del salón al seleccionarlo (solo al crear)
watch(() => form.value.salonId, (nuevoId) => {
  if (!nuevoId || esEdicion.value) return
  const salon = salones.value.find(s => s.salonId === nuevoId)
  if (salon?.precio) {
    form.value.monto = salon.precio
    montoAutocompletado.value = true
  }
})

// Si el usuario edita el monto manualmente, sacar el hint
watch(() => form.value.monto, () => {
  if (montoAutocompletado.value) {
    const salon = salones.value.find(s => s.salonId === form.value.salonId)
    if (String(form.value.monto) !== String(salon?.precio)) {
      montoAutocompletado.value = false
    }
  }
})

function volver() { router.push("/alquileres") }

async function guardar() {
  saving.value = true
  try {
    const payload = {
      salonId: Number(form.value.salonId),
      nombre: form.value.nombre,
      dni: form.value.dni,
      telefono: form.value.telefono,
      fecha: form.value.fecha,
      monto: String(form.value.monto),
      condicion: Boolean(form.value.condicion),
      metodoPagoId: Number(form.value.metodoPagoId),
      observaciones: form.value.observaciones || null,
    }
    if (esEdicion.value) {
      await alquileresService.actualizar(route.params.id, payload)
    } else {
      await alquileresService.crear(payload)
    }
    router.push("/alquileres")
  } catch (error) {
    console.error("Error guardando alquiler", error)
    alert("No se pudo guardar el alquiler.")
  } finally {
    saving.value = false
  }
}

function toDatetimeLocal(iso) {
  if (!iso) return ahora()
  const d = new Date(iso)
  const pad = n => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

onMounted(async () => {
  try {
    const [salonesRes, metodosRes] = await Promise.all([
      salonesService.listar(),
      metodosPagoService.listar()
    ])
    salones.value = salonesRes.data || []
    metodosPago.value = metodosRes.data || []
    if (metodosPago.value.length) form.value.metodoPagoId = metodosPago.value[0].metodoPagoId
  } catch {
    console.error("No se pudieron cargar los datos")
  }

  if (!esEdicion.value) return
  loadingData.value = true
  try {
    const { data } = await alquileresService.obtener(route.params.id)
    form.value = {
      salonId: data.salonId,
      nombre: data.nombre || "",
      dni: data.dni || "",
      telefono: data.telefono || "",
      fecha: toDatetimeLocal(data.fecha),
      monto: data.monto || "",
      condicion: data.condicion ?? false,
      metodoPagoId: data.metodoPagoId || null,
      observaciones: data.observaciones || "",
    }
  } catch {
    alert("No se pudo cargar el alquiler.")
    router.push("/alquileres")
  } finally {
    loadingData.value = false
  }
})
</script>

<style scoped>
.field-hint {
  font-size: 11px;
  color: #9c6e1e;
  margin-top: 4px;
  display: block;
}
</style>