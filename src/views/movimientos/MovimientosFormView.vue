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
        <button class="btn-secondary" type="button" @click="volver">Volver</button>
      </div>
    </section>

    <section class="card form-card">
      <div v-if="loadingData" class="loading-state">
        <div class="skeleton-wrap">
          <div v-for="n in 3" :key="n" class="skeleton-row"></div>
        </div>
      </div>

      <form v-else class="form-shell" @submit.prevent="guardar">
        <div class="form-section">
          <div class="section-head">
            <h3 class="form-section-title">Datos del movimiento</h3>
          </div>

          <div class="field-grid">
            <div class="field field-span-2">
              <label>Descripción <span class="required">*</span></label>
              <input
                v-model.trim="form.descripcion"
                type="text"
                placeholder="Ej. Pago de servicios, Cobro de cuotas..."
                required
              />
            </div>

            <div class="field">
              <label>Tipo <span class="required">*</span></label>
              <div class="toggle-group">
                <button
                  type="button"
                  class="btn-toggle"
                  :class="{ 'active-success': form.tipo === 'INGRESO' }"
                  @click="form.tipo = 'INGRESO'"
                >
                  Ingreso
                </button>
                <button
                  type="button"
                  class="btn-toggle"
                  :class="{ 'active-danger': form.tipo === 'EGRESO' }"
                  @click="form.tipo = 'EGRESO'"
                >
                  Egreso
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="form-divider"></div>

        <div class="form-section">
          <h3 class="form-section-title">Económico</h3>

          <div class="field-grid">
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
                <option :value="null">Sin especificar</option>
                <option v-for="metodo in metodosPago" :key="metodo.id" :value="metodo.id">
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
          <button type="button" class="btn-secondary" @click="volver">Cancelar</button>
          <button type="submit" class="btn-primary" :disabled="saving || !form.tipo">
            {{ saving ? "Guardando..." : esEdicion ? "Guardar cambios" : "Registrar movimiento" }}
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
import { useToast } from "../../composables/useToast"

const route = useRoute()
const router = useRouter()
const toast = useToast()

const esEdicion = computed(() => Boolean(route.params.id))
const saving = ref(false)
const loadingData = ref(false)
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
      toast.success("Movimiento actualizado correctamente.")
    } else {
      await movimientosService.crear(payload)
      toast.success("Movimiento registrado correctamente.")
    }

    router.push("/movimientos")
  } catch (err) {
    console.error("Error guardando movimiento", err)
    toast.error("No se pudo guardar el movimiento.")
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
  } catch (err) {
    console.error("Error cargando métodos de pago", err)
    metodosPago.value = []
  }
}

async function cargarMovimiento() {
  if (!esEdicion.value || !movimientosService.obtener) return

  loadingData.value = true
  try {
    const { data } = await movimientosService.obtener(route.params.id)
    form.descripcion = String(data?.descripcion ?? "")
    form.tipo = String(data?.tipo ?? "INGRESO")
    form.monto = data?.monto ?? ""
    form.metodoPagoId = Number(
      data?.metodoPagoId ?? data?.metodoPago?.id ?? data?.metodoPago?.metodoPagoId ?? null
    ) || null
    form.fecha = data?.fecha
      ? (() => {
          const d = new Date(data.fecha)
          if (Number.isNaN(d.getTime())) return ahora()
          return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
        })()
      : ahora()
  } catch (err) {
    console.error("Error cargando movimiento", err)
    toast.error("No se pudo cargar el movimiento.")
    router.push("/movimientos")
  } finally {
    loadingData.value = false
  }
}

onMounted(async () => {
  await cargarMetodosPago()
  await cargarMovimiento()
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
.section-head { display: flex; flex-direction: column; gap: 4px; }
.form-section-title { margin: 0; font-size: 16px; font-weight: 800; color: var(--primary); }

.field-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
.field-span-2 { grid-column: span 2; }
.field { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.field label { font-size: 12px; font-weight: 700; color: var(--text-muted); }
.required { color: #dc2626; }

.input-prefix-wrap { display: flex; align-items: stretch; border: 1px solid var(--border); border-radius: 10px; overflow: hidden; background: white; }
.input-prefix { padding: 0 12px; font-weight: 700; color: var(--text-muted); border-right: 1px solid var(--border); display: flex; align-items: center; background: #f8fafc; font-size: 13px; }
.input-prefix-wrap input { border: none !important; border-radius: 0 !important; flex: 1; box-shadow: none !important; }

.toggle-group { display: flex; gap: 8px; flex-wrap: wrap; }
.btn-toggle { border: 1px solid var(--border); background: white; border-radius: 8px; padding: 10px 16px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.15s; color: var(--text-soft); }
.btn-toggle:hover { background: var(--bg); }
.active-success { background: rgba(34,197,94,0.1); border-color: rgba(34,197,94,0.4); color: #15803d; }
.active-danger { background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.4); color: #b91c1c; }

.form-divider { height: 1px; background: var(--border); }

.form-actions { display: flex; justify-content: flex-end; gap: 10px; flex-wrap: wrap; padding-top: 8px; border-top: 1px solid var(--border); }

.loading-state { min-height: 200px; }
.skeleton-wrap { display: flex; flex-direction: column; gap: 12px; }
.skeleton-row { height: 64px; background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%); background-size: 200% 100%; animation: shimmer 1.2s infinite; border-radius: 10px; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

@media (max-width: 980px) {
  .page-head { flex-direction: column; align-items: stretch; }
  .head-actions { justify-content: stretch; }
}

@media (max-width: 768px) {
  .page-head, .form-card { padding: 16px; }
  .field-grid { grid-template-columns: 1fr; }
  .field-span-2 { grid-column: span 1; }
}

@media (max-width: 640px) {
  .head-actions, .form-actions { flex-direction: column; }
  .head-actions button, .form-actions button { width: 100%; }
}
</style>