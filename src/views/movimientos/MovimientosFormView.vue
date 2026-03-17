<template>
  <div class="page movimientos-form-page">
    <section class="page-head card">
      <div class="page-head-copy">
        <p class="eyebrow">Tesorería</p>
        <h1>{{ esEdicion ? "Editar Movimiento" : "Nuevo Movimiento" }}</h1>
        <p class="page-subtitle">
          {{
            esEdicion
              ? "Modificá los datos del movimiento."
              : "Registrá un ingreso o egreso de fondos."
          }}
        </p>
      </div>

      <div class="head-actions">
        <button class="btn-secondary" type="button" @click="volver">Volver</button>
      </div>
    </section>

    <section class="card form-card">
      <form @submit.prevent="guardar">
        <div class="form-section">
          <h3 class="form-section-title">Datos del movimiento</h3>

          <div class="field-row field-row-2">
            <div class="field field-grow">
              <label>Descripción <span class="required">*</span></label>
              <input
                v-model.trim="form.descripcion"
                type="text"
                placeholder="Ej. Pago de servicios, Cobro de cuotas..."
                required
              />
            </div>

            <div class="field field-sm">
              <label>Tipo <span class="required">*</span></label>
              <div class="toggle-group">
                <button
                  type="button"
                  class="btn-toggle"
                  :class="{ 'active-success': form.tipo === 'INGRESO' }"
                  @click="form.tipo = 'INGRESO'"
                >
                  ↑ Ingreso
                </button>

                <button
                  type="button"
                  class="btn-toggle"
                  :class="{ 'active-danger': form.tipo === 'EGRESO' }"
                  @click="form.tipo = 'EGRESO'"
                >
                  ↓ Egreso
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="form-divider"></div>

        <div class="form-section">
          <h3 class="form-section-title">Económico</h3>

          <div class="field-row field-row-3">
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
              <label>Método de pago</label>
              <select v-model="form.metodoPagoId">
                <option :value="null">Seleccionar...</option>
                <option
                  v-for="metodo in metodosPago"
                  :key="metodo.id"
                  :value="metodo.id"
                >
                  {{ metodo.nombre }}
                </option>
              </select>
            </div>

            <div class="field">
              <label>Fecha</label>
              <input v-model="form.fecha" type="datetime-local" />
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-secondary" @click="volver">
            Cancelar
          </button>

          <button type="submit" class="btn-primary" :disabled="saving || !form.tipo">
            {{
              saving
                ? "Guardando..."
                : esEdicion
                  ? "Guardar cambios"
                  : "Registrar movimiento"
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
import { movimientosService } from "../../services/movimientosService"
import { metodosPagoService } from "../../services/metodosPagoService"

const route = useRoute()
const router = useRouter()

const esEdicion = computed(() => Boolean(route.params.id))
const saving = ref(false)
const metodosPago = ref([])

function pad(value) {
  return String(value).padStart(2, "0")
}

function ahora() {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function normalizeMetodoPago(item) {
  return {
    id: Number(item?.metodoPagoId ?? item?.id ?? 0),
    nombre: String(item?.nombre ?? ""),
  }
}

const form = reactive({
  descripcion: "",
  tipo: "INGRESO",
  monto: "",
  metodoPagoId: null,
  fecha: ahora(),
})

function volver() {
  router.push("/movimientos")
}

async function guardar() {
  if (!form.tipo) return

  saving.value = true
  try {
    const payload = {
      tipo: form.tipo,
      monto: String(form.monto),
      descripcion: form.descripcion.trim() || null,
      metodoPagoId: form.metodoPagoId ? Number(form.metodoPagoId) : null,
      fecha: form.fecha || null,
    }

    if (esEdicion.value && movimientosService.actualizar) {
      await movimientosService.actualizar(route.params.id, payload)
    } else {
      await movimientosService.crear(payload)
    }

    router.push("/movimientos")
  } catch (error) {
    console.error("Error guardando movimiento", error)
    alert("No se pudo guardar el movimiento.")
  } finally {
    saving.value = false
  }
}

async function cargarMetodosPago() {
  try {
    const { data } = await metodosPagoService.listar()
    metodosPago.value = Array.isArray(data)
      ? data.map(normalizeMetodoPago).filter((item) => item.id > 0)
      : []

    if (!form.metodoPagoId && metodosPago.value.length) {
      form.metodoPagoId = metodosPago.value[0].id
    }
  } catch (e) {
    console.error("Error cargando métodos de pago", e)
    metodosPago.value = []
  }
}

async function cargarMovimiento() {
  if (!esEdicion.value || !movimientosService.obtener) return

  try {
    const { data } = await movimientosService.obtener(route.params.id)

    form.descripcion = String(data?.descripcion ?? "")
    form.tipo = String(data?.tipo ?? "INGRESO")
    form.monto = data?.monto ?? ""
    form.metodoPagoId = Number(data?.metodoPagoId ?? data?.metodoPago?.id ?? data?.metodoPago?.metodoPagoId ?? null)
    form.fecha = data?.fecha
      ? (() => {
          const d = new Date(data.fecha)
          if (Number.isNaN(d.getTime())) return ahora()
          return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
        })()
      : ahora()
  } catch (error) {
    console.error("Error cargando movimiento", error)
  }
}

onMounted(async () => {
  await cargarMetodosPago()
  await cargarMovimiento()
})
</script>

<style scoped>
.movimientos-form-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.page-head-copy {
  min-width: 0;
}

.head-actions {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.form-card {
  padding: 28px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-section-title {
  margin: 0;
}

.field-row {
  display: grid;
  gap: 16px;
}

.field-row-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.field-row-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.input-prefix-wrap {
  display: flex;
  align-items: center;
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
  background: white;
}

.input-prefix {
  padding: 0 12px;
  font-weight: 700;
  color: var(--text-muted);
  border-right: 1px solid var(--border);
  height: 100%;
  display: flex;
  align-items: center;
}

.input-prefix-wrap input {
  border: none !important;
  border-radius: 0 !important;
  flex: 1;
}

.toggle-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn-toggle {
  border: 1px solid var(--border);
  background: white;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.active-success {
  background: rgba(34, 197, 94, 0.12);
  border-color: rgba(34, 197, 94, 0.35);
  color: #15803d;
}

.active-danger {
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.35);
  color: #b91c1c;
}

.form-divider {
  height: 1px;
  background: var(--border);
  margin: 20px 0;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 24px;
}

@media (max-width: 900px) {
  .field-row-3 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .page-head {
    flex-direction: column;
    align-items: stretch;
  }

  .head-actions {
    width: 100%;
  }

  .head-actions > * {
    flex: 1 1 180px;
  }

  .form-card {
    padding: 20px;
  }

  .field-row-2,
  .field-row-3 {
    grid-template-columns: 1fr;
  }

  .form-actions {
    justify-content: stretch;
  }

  .form-actions > * {
    flex: 1 1 100%;
  }
}
</style>