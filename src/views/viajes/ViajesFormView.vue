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

const viajeId = computed(() => Number(route.params.id))
const esEdicion = computed(() => !!route.params.id && !Number.isNaN(viajeId.value) && viajeId.value > 0)
const loadingData = ref(false)
const saving = ref(false)

const form = reactive({
  destino: "",
  fechaViaje: nowDatetimeLocal(),
})

function nowDatetimeLocal() {
  // Usar fecha/hora local del navegador formateada manualmente
  // para evitar que toISOString() convierta a UTC y desface la hora
  const d = new Date()
  return formatToDatetimeLocal(d)
}

function formatToDatetimeLocal(d) {
  const year    = d.getFullYear()
  const month   = String(d.getMonth() + 1).padStart(2, "0")
  const day     = String(d.getDate()).padStart(2, "0")
  const hours   = String(d.getHours()).padStart(2, "0")
  const minutes = String(d.getMinutes()).padStart(2, "0")
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function toDatetimeLocal(value) {
  if (!value) return nowDatetimeLocal()

  // Si el backend devuelve sin timezone (ej: "2026-03-10T10:30:00"),
  // new Date() lo interpreta como UTC en algunos entornos.
  // Forzamos interpretación local agregando la hora de offset si no viene con Z ni +
  let normalized = value
  if (!/Z$|[+-]\d{2}:\d{2}$/.test(value)) {
    // No tiene info de timezone → lo tratamos como local (sin conversión)
    const parts = value.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/)
    if (parts) return `${parts[1]}T${parts[2]}`
  }

  const d = new Date(normalized)
  if (Number.isNaN(d.getTime())) return nowDatetimeLocal()

  return formatToDatetimeLocal(d)
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
      fechaViaje: form.fechaViaje.length === 16 ? form.fechaViaje + ":00" : form.fechaViaje,
    }

    if (esEdicion.value) {
      await viajesBomboneraService.actualizar(viajeId.value, payload)
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
    const { data } = await viajesBomboneraService.obtener(viajeId.value)
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