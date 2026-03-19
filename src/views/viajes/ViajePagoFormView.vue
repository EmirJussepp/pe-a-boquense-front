<template>
  <div class="page">
    <section class="page-head card">
      <div class="page-head-copy">
        <p class="eyebrow">Bombonera</p>
        <h1>Registrar Pago de Viaje</h1>
        <p class="page-subtitle" v-if="viaje">
          Viaje: <strong>{{ viaje.destino }}</strong> — {{ formatearFecha(viaje.fechaViaje) }}
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
                <input
                  v-model="form.monto"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div class="field">
              <label>Método de Pago <span class="required">*</span></label>
              <select v-model="form.metodoPagoId" required>
                <option :value="null" disabled>Seleccionar...</option>
                <option
                  v-for="m in metodosPago"
                  :key="m.metodoPagoId"
                  :value="m.metodoPagoId"
                >
                  {{ m.nombre }}
                </option>
              </select>
            </div>

            <div class="field">
              <label>Cobrador <span class="required">*</span></label>
              <select v-model="form.cobradorId" required>
                <option :value="null" disabled>Seleccionar...</option>
                <option
                  v-for="c in cobradores"
                  :key="c.cobradorId ?? c.cobradoresId"
                  :value="c.cobradorId ?? c.cobradoresId"
                >
                  {{ c.nombre }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <div v-if="!metodosPago.length || !cobradores.length" class="empty-state" style="margin-top: 20px;">
          {{
            !metodosPago.length && !cobradores.length
              ? "No hay métodos de pago ni cobradores disponibles."
              : !metodosPago.length
                ? "No hay métodos de pago disponibles."
                : "No hay cobradores disponibles."
          }}
        </div>

        <div class="form-actions">
          <button type="button" class="btn-secondary" @click="volver">Cancelar</button>
          <button type="submit" class="btn-primary" :disabled="saving || !canSubmit">
            {{ saving ? "Guardando..." : "Registrar pago" }}
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
import { viajesPagosService } from "../../services/viajesPagosService"
import { metodosPagoService } from "../../services/metodosPagoService"
import { cobradoresService } from "../../services/cobradoresService"
import { useToast } from "../../composables/useToast"

const route = useRoute()
const router = useRouter()
const toast = useToast()

const viajeId = Number(route.params.id)

const loadingData = ref(false)
const saving = ref(false)
const viaje = ref(null)
const metodosPago = ref([])
const cobradores = ref([])

const form = reactive({
  nombre: "",
  apellido: "",
  dni: "",
  monto: "",
  metodoPagoId: null,
  cobradorId: null,
})

const canSubmit = computed(() => {
  return (
    Number(viajeId) > 0 &&
    Number(form.monto) > 0 &&
    Number(form.metodoPagoId) > 0 &&
    Number(form.cobradorId) > 0 &&
    metodosPago.value.length > 0 &&
    cobradores.value.length > 0
  )
})

// Redirige al detalle del viaje (ruta /viajes/:id)
function volver() {
  router.push(`/viajes/${viajeId}`)
}

function formatearFecha(value) {
  if (!value) return "—"

  const match = String(value).match(
    /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2}))?)?$/
  )

  if (match) {
    const [, year, month, day, hour = "00", minute = "00"] = match
    const localDate = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute)
    )
    return new Intl.DateTimeFormat("es-AR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(localDate)
  }

  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

function validarFormulario() {
  if (!(Number(viajeId) > 0)) return "Viaje inválido."
  if (!(Number(form.monto) > 0)) return "El monto debe ser mayor a 0."
  if (!(Number(form.metodoPagoId) > 0)) return "Seleccioná un método de pago."
  if (!(Number(form.cobradorId) > 0)) return "Seleccioná un cobrador."

  const nombre = String(form.nombre ?? "").trim()
  const apellido = String(form.apellido ?? "").trim()
  const dni = String(form.dni ?? "").trim()

  if (nombre === "" && apellido !== "") return "Si cargás apellido, completá también el nombre."
  if (nombre !== "" && apellido === "") return "Si cargás nombre, completá también el apellido."

  if (dni && (dni.length < 7 || dni.length > 20)) {
    return "El DNI debe tener entre 7 y 20 caracteres."
  }

  return ""
}

// ✅ función guardar que faltaba completamente
async function guardar() {
  const error = validarFormulario()
  if (error) {
    toast.error(error)
    return
  }

  saving.value = true
  try {
    const payload = {
      viajeId: viajeId,
      nombre: String(form.nombre ?? "").trim() || null,
      apellido: String(form.apellido ?? "").trim() || null,
      dni: String(form.dni ?? "").trim() || null,
      monto: String(form.monto),
      metodoPagoId: Number(form.metodoPagoId),
      cobradorId: Number(form.cobradorId),
    }

    await viajesPagosService.crear(payload)
    toast.success("Pago registrado correctamente.")
    router.push(`/viajes/${viajeId}`)
  } catch (err) {
    console.error("Error guardando pago:", err)
    toast.error("No se pudo registrar el pago.")
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  loadingData.value = true
  try {
    const [viajeRes, metodosRes, cobradoresRes] = await Promise.all([
      viajesBomboneraService.obtener(viajeId),
      metodosPagoService.listar(),
      cobradoresService.listar(),
    ])

    viaje.value = viajeRes.data || null
    metodosPago.value = Array.isArray(metodosRes.data) ? metodosRes.data : []
    cobradores.value = Array.isArray(cobradoresRes.data) ? cobradoresRes.data : []

    if (metodosPago.value.length) {
      form.metodoPagoId = metodosPago.value[0].metodoPagoId
    }

    if (cobradores.value.length) {
      form.cobradorId =
        cobradores.value[0].cobradorId ??
        cobradores.value[0].cobradoresId ??
        null
    }
  } catch {
    toast.error("No se pudieron cargar los datos.")
    router.push("/viajes")
  } finally {
    loadingData.value = false
  }
})
</script>