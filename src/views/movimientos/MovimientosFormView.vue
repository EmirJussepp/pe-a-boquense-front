<template>
  <div class="page">

    <section class="page-head card">
      <div class="page-head-copy">
        <p class="eyebrow">Tesorería</p>
        <h1>{{ esEdicion ? "Editar Movimiento" : "Nuevo Movimiento" }}</h1>
        <p class="page-subtitle">
          {{ esEdicion ? "Modificá los datos del movimiento." : "Registrá un ingreso o egreso de fondos." }}
        </p>
      </div>
      <div class="head-actions">
        <button class="btn-secondary" @click="volver">Volver</button>
      </div>
    </section>

    <section class="card" style="padding: 28px;">
      <form @submit.prevent="guardar">

        <div class="form-section">
          <h3 class="form-section-title">Datos del Movimiento</h3>
          <div class="field-row">
            <div class="field field-grow">
              <label>Descripción <span class="required">*</span></label>
              <input v-model="form.descripcion" type="text" placeholder="Ej. Pago de servicios, Cobro de cuotas..." required />
            </div>
            <div class="field field-sm">
              <label>Tipo <span class="required">*</span></label>
              <div class="toggle-group">
                <button type="button" class="btn-toggle" :class="{ 'active-success': form.tipo === 'INGRESO' }" @click="form.tipo = 'INGRESO'">↑ Ingreso</button>
                <button type="button" class="btn-toggle" :class="{ 'active-danger': form.tipo === 'EGRESO' }" @click="form.tipo = 'EGRESO'">↓ Egreso</button>
              </div>
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
              <label>Método de Pago</label>
              <select v-model="form.metodoPagoId">
                <option v-for="m in metodosPago" :key="m.metodoPagoId" :value="m.metodoPagoId">{{ m.nombre }}</option>
              </select>
            </div>
            <div class="field">
              <label>Fecha</label>
              <input v-model="form.fecha" type="datetime-local" />
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-secondary" @click="volver">Cancelar</button>
          <button type="submit" class="btn-primary" :disabled="saving || !form.tipo">
            {{ saving ? "Guardando..." : "Registrar movimiento" }}
          </button>
        </div>

      </form>
    </section>

  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import { movimientosService } from "../../services/movimientosService"
import { metodosPagoService } from "../../services/metodosPagoService"

const route = useRoute()
const router = useRouter()
const esEdicion = computed(() => !!route.params.id)
const saving = ref(false)
const metodosPago = ref([])

const ahora = () => {
  const d = new Date()
  const pad = n => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const form = ref({ descripcion: "", tipo: "INGRESO", monto: "", metodoPagoId: null, fecha: ahora() })

function volver() { router.push("/movimientos") }

async function guardar() {
  if (!form.value.tipo) return
  saving.value = true
  try {
    await movimientosService.crear({
      tipo: form.value.tipo,
      monto: String(form.value.monto),
      descripcion: form.value.descripcion || null,
      metodoPagoId: Number(form.value.metodoPagoId),
      fecha: form.value.fecha || null,
    })
    router.push("/movimientos")
  } catch (error) {
    console.error("Error guardando movimiento", error)
    alert("No se pudo guardar el movimiento.")
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    const { data } = await metodosPagoService.listar()
    metodosPago.value = data || []
    if (metodosPago.value.length) form.value.metodoPagoId = metodosPago.value[0].metodoPagoId
  } catch (e) { console.error("Error cargando métodos de pago", e) }
})
</script>