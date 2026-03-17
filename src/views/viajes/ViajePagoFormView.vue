<template>
  <div class="page">

    <section class="page-head card">
      <div class="page-head-copy">
        <p class="eyebrow">Bombonera</p>
        <h1>Registrar Pago de Viaje</h1>
        <p class="page-subtitle" v-if="viaje">Viaje: <strong>{{ viaje.destino }}</strong> — {{ formatearFecha(viaje.fechaViaje) }}</p>
      </div>
      <div class="head-actions">
        <button class="btn-secondary" @click="volver">Volver</button>
      </div>
    </section>

    <section class="card" style="padding: 28px;">
      <form @submit.prevent="guardar">

        <div class="form-section">
          <h3 class="form-section-title">Datos del Pasajero</h3>
          <div class="field-row">
            <div class="field">
              <label>Nombre</label>
              <input v-model="form.nombre" type="text" placeholder="Ej. Juan" />
            </div>
            <div class="field">
              <label>Apellido</label>
              <input v-model="form.apellido" type="text" placeholder="Ej. Pérez" />
            </div>
            <div class="field">
              <label>DNI</label>
              <input v-model="form.dni" type="text" placeholder="Ej. 32123456" />
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
            </div>
            <div class="field">
              <label>Método de Pago <span class="required">*</span></label>
              <select v-model="form.metodoPagoId" required>
                <option v-for="m in metodosPago" :key="m.metodoPagoId" :value="m.metodoPagoId">{{ m.nombre }}</option>
              </select>
            </div>
            <div class="field">
              <label>Cobrador <span class="required">*</span></label>
              <select v-model="form.cobradorId" required>
                <option v-for="c in cobradores" :key="c.cobradorId" :value="c.cobradorId">{{ c.nombre }}</option>
              </select>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-secondary" @click="volver">Cancelar</button>
          <button type="submit" class="btn-primary" :disabled="saving">
            {{ saving ? "Guardando..." : "Registrar pago" }}
          </button>
        </div>

      </form>
    </section>

  </div>
</template>

<script setup>
import { onMounted, ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import { http } from "../../services/http"
import { metodosPagoService } from "../../services/metodosPagoService"
import { cobradoresService } from "../../services/cobradoresService"
import { useToast } from "../../composables/useToast"

const route = useRoute()
const router = useRouter()
const toast = useToast()

const viajeId = Number(route.params.id)
const saving = ref(false)
const viaje = ref(null)
const metodosPago = ref([])
const cobradores = ref([])

const form = ref({ nombre: "", apellido: "", dni: "", monto: "", metodoPagoId: null, cobradorId: null })

function volver() { router.push("/viajes") }

function formatearFecha(f) {
  if (!f) return ""
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" }).format(new Date(f))
}

async function guardar() {
  saving.value = true
  try {
    await http.post("/viajes-pagos", {
      viajeId,
      nombre: form.value.nombre || null,
      apellido: form.value.apellido || null,
      dni: form.value.dni || null,
      monto: String(form.value.monto),
      metodoPagoId: Number(form.value.metodoPagoId),
      cobradorId: Number(form.value.cobradorId),
    })
    toast.success("Pago registrado correctamente.")
    router.push("/viajes")
  } catch {
    toast.error("No se pudo registrar el pago.")
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    const [viajeRes, metodosRes, cobradoresRes] = await Promise.all([
      http.get(`/viajes-bombonera/${viajeId}`),
      metodosPagoService.listar(),
      cobradoresService.listar(),
    ])
    viaje.value = viajeRes.data
    metodosPago.value = metodosRes.data || []
    cobradores.value = cobradoresRes.data || []
    if (metodosPago.value.length) form.value.metodoPagoId = metodosPago.value[0].metodoPagoId
    if (cobradores.value.length) form.value.cobradorId = cobradores.value[0].cobradorId
  } catch {
    toast.error("No se pudieron cargar los datos.")
  }
})
</script>