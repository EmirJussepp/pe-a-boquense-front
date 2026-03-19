<template>
  <div class="page">
    <section class="page-head card">
      <div class="page-head-copy">
        <p class="eyebrow">Bombonera</p>
        <h1>{{ esEdicion ? "Editar viaje" : "Nuevo viaje" }}</h1>
        <p class="page-subtitle">
          {{
            esEdicion
              ? "Modificá los datos principales del viaje."
              : "Registrá un nuevo viaje a la Bombonera."
          }}
        </p>
      </div>

      <div class="head-actions">
        <button class="btn-secondary" @click="volver">Volver</button>
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
          <div class="section-head">
            <h3 class="form-section-title">Datos del viaje</h3>
            <p class="section-help">Completá la información principal del traslado.</p>
          </div>

          <div class="field-grid">
            <div class="field field-span-2">
              <label>Destino <span class="required">*</span></label>
              <input
                v-model="form.destino"
                type="text"
                maxlength="100"
                placeholder="Ej. Boca vs River — Fecha 10"
                required
              />
              <small class="field-help">Entre 3 y 100 caracteres.</small>
            </div>

            <div class="field">
              <label>Fecha y hora <span class="required">*</span></label>
              <input v-model="form.fechaViaje" type="datetime-local" required />
              <small class="field-help">Se guarda con fecha y hora local.</small>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-secondary" @click="volver">
            Cancelar
          </button>

          <button type="submit" class="btn-primary" :disabled="saving">
            {{
              saving
                ? "Guardando..."
                : esEdicion
                  ? "Guardar cambios"
                  : "Registrar viaje"
            }}
          </button>
        </div>
      </form>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import { viajesBomboneraService } from "../../services/viajesBomboneraService"
import { useToast } from "../../composables/useToast"

const route = useRoute()
const router = useRouter()
const toast = useToast()

const viajeId = computed(() => Number(route.params.id))
const esEdicion = computed(
  () => !!route.params.id && !Number.isNaN(viajeId.value) && viajeId.value > 0
)

const loadingData = ref(false)
const saving = ref(false)

const form = reactive({
  destino: "",
  fechaViaje: nowDatetimeLocal(),
})

function nowDatetimeLocal() {
  return formatToDatetimeLocal(new Date())
}

function formatToDatetimeLocal(d) {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  const hours = String(d.getHours()).padStart(2, "0")
  const minutes = String(d.getMinutes()).padStart(2, "0")
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function toDatetimeLocal(value) {
  if (!value) return nowDatetimeLocal()

  const parts = String(value).match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/)
  if (parts) return `${parts[1]}T${parts[2]}`

  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return nowDatetimeLocal()

  return formatToDatetimeLocal(d)
}

function volver() {
  // Al editar, vuelve al detalle del viaje; al crear, vuelve al listado
  if (esEdicion.value && viajeId.value > 0) {
    router.push(`/viajes/${viajeId.value}`)
    return
  }
  router.push("/viajes")
}

function validarFormulario() {
  const destino = String(form.destino ?? "").trim()

  if (!destino) return "El destino es obligatorio."
  if (destino.length < 3 || destino.length > 100) {
    return "El destino debe tener entre 3 y 100 caracteres."
  }
  if (!form.fechaViaje) return "La fecha del viaje es obligatoria."

  return ""
}

async function guardar() {
  const error = validarFormulario()
  if (error) {
    toast.error(error)
    return
  }

  saving.value = true

  try {
    const payload = {
      destino: String(form.destino).trim(),
      fechaViaje: form.fechaViaje.length === 16 ? `${form.fechaViaje}:00` : form.fechaViaje,
    }

    if (esEdicion.value) {
      await viajesBomboneraService.actualizar(viajeId.value, payload)
      toast.success("Viaje actualizado correctamente.")
      router.push(`/viajes/${viajeId.value}`)
    } else {
      await viajesBomboneraService.crear(payload)
      toast.success("Viaje registrado correctamente.")
      router.push("/viajes")
    }
  } catch (err) {
    console.error("Error guardando viaje:", err)
    toast.error("No se pudo guardar el viaje.")
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  if (!esEdicion.value) return

  loadingData.value = true
  try {
    const { data } = await viajesBomboneraService.obtener(viajeId.value)
    form.destino = data?.destino || ""
    form.fechaViaje = toDatetimeLocal(data?.fechaViaje)
  } catch (err) {
    console.error("Error cargando viaje:", err)
    toast.error("No se pudo cargar el viaje.")
    router.push("/viajes")
  } finally {
    loadingData.value = false
  }
})
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 16px;
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

.form-card {
  padding: 24px;
}

.form-shell {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.section-head {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-section-title {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  color: var(--primary);
}

.section-help {
  margin: 0;
  color: var(--text-muted);
  font-size: 13px;
}

.field-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.field-span-2 {
  grid-column: span 2;
}

.field label {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-muted);
}

.field-help {
  font-size: 12px;
  color: var(--text-muted);
}

.required {
  color: #dc2626;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
  padding-top: 8px;
  border-top: 1px solid var(--border);
}

.loading-state {
  min-height: 220px;
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
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@media (max-width: 980px) {
  .page-head {
    flex-direction: column;
    align-items: stretch;
  }

  .head-actions {
    justify-content: stretch;
  }
}

@media (max-width: 768px) {
  .page-head,
  .form-card {
    padding: 16px;
  }

  .field-grid {
    grid-template-columns: 1fr;
  }

  .field-span-2 {
    grid-column: span 1;
  }
}

@media (max-width: 640px) {
  .head-actions,
  .form-actions {
    flex-direction: column;
  }

  .head-actions button,
  .form-actions button {
    width: 100%;
  }
}
</style>