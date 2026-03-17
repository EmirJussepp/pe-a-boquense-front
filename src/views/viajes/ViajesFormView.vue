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
              <input v-model="form.destino" type="text" placeholder="Ej. Boca vs River — Fecha TBD" required />
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
            {{ saving ? "Guardando..." : (esEdicion ? "Guardar cambios" : "Registrar viaje") }}
          </button>
        </div>

      </form>
    </section>

  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import { http } from "../../services/http"
import { useToast } from "../../composables/useToast"

const route = useRoute()
const router = useRouter()
const toast = useToast()

const esEdicion = computed(() => !!route.params.id)
const loadingData = ref(false)
const saving = ref(false)

const ahora = () => {
  const d = new Date()
  const pad = n => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const form = ref({ destino: "", fechaViaje: ahora() })

function volver() { router.push("/viajes") }

function toDatetimeLocal(iso) {
  if (!iso) return ahora()
  const d = new Date(iso)
  const pad = n => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

async function guardar() {
  saving.value = true
  try {
    const payload = { destino: form.value.destino, fechaViaje: form.value.fechaViaje }
    if (esEdicion.value) {
      await http.put(`/viajes-bombonera/${route.params.id}`, payload)
      toast.success("Viaje actualizado correctamente.")
    } else {
      await http.post("/viajes-bombonera", payload)
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
    const { data } = await http.get(`/viajes-bombonera/${route.params.id}`)
    form.value = { destino: data.destino || "", fechaViaje: toDatetimeLocal(data.fechaViaje) }
  } catch {
    toast.error("No se pudo cargar el viaje.")
    router.push("/viajes")
  } finally {
    loadingData.value = false
  }
})
</script>