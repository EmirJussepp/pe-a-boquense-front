<template>
  <div class="page">
    <section class="page-head card">
      <div class="page-head-copy">
        <p class="eyebrow">Bombonera</p>
        <h1>{{ esEdicion ? "Editar Viaje" : "Nuevo Viaje" }}</h1>
        <p class="page-subtitle">
          {{ esEdicion ? "Modificá los datos del viaje." : "Registrá un nuevo viaje a la Bombonera." }}
        </p>
      </div>

      <div class="head-actions">
        <button class="btn-secondary" @click="volver">Volver</button>
      </div>
    </section>

    <section class="card" style="padding: 28px;">
      <div v-if="loadingData" class="empty-state">Cargando...</div>

      <form v-else @submit.prevent="guardar">
        <div class="form-section">
          <h3 class="form-section-title">Datos del Viaje</h3>

          <div class="field-row">
            <div class="field field-grow">
              <label>Destino <span class="required">*</span></label>
              <input
                v-model="form.destino"
                type="text"
                placeholder="Ej. Boca vs River — Fecha 10"
                required
              />
            </div>

            <div class="field">
              <label>Fecha y Hora <span class="required">*</span></label>
              <input v-model="form.fechaViaje" type="datetime-local" required />
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-secondary" @click="volver">Cancelar</button>
          <button type="submit" class="btn-primary" :disabled="saving">
            {{ saving ? "Guardando..." : esEdicion ? "Guardar cambios" : "Registrar viaje" }}
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

const esEdicion = computed(() => !!route.params.id)
const loadingData = ref(false)
const saving = ref(false)

const form = reactive({
  destino: "",
  fechaViaje: nowDatetimeLocal(),
})

function nowDatetimeLocal() {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  const hours = String(d.getHours()).padStart(2, "0")
  const minutes = String(d.getMinutes()).padStart(2, "0")
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function toDatetimeLocal(value) {
  if (!value) return nowDatetimeLocal()

  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return nowDatetimeLocal()

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  const hours = String(d.getHours()).padStart(2, "0")
  const minutes = String(d.getMinutes()).padStart(2, "0")

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function volver() {
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
      fechaViaje: form.fechaViaje,
    }

    if (esEdicion.value) {
      await viajesBomboneraService.actualizar(route.params.id, payload)
      toast.success("Viaje actualizado correctamente.")
    } else {
      await viajesBomboneraService.crear(payload)
      toast.success("Viaje registrado correctamente.")
    }

    router.push("/viajes")
  } catch {
    toast.error("No se pudo guardar el viaje.")
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  if (!esEdicion.value) return

  loadingData.value = true
  try {
    const { data } = await viajesBomboneraService.obtener(route.params.id)
    form.destino = data?.destino || ""
    form.fechaViaje = toDatetimeLocal(data?.fechaViaje)
  } catch {
    toast.error("No se pudo cargar el viaje.")
    router.push("/viajes")
  } finally {
    loadingData.value = false
  }
})
</script>