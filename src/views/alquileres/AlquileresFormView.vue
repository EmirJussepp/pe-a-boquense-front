<template>
  <div class="page alquiler-form-page">
    <section class="page-head card">
      <div class="page-head-copy">
        <p class="eyebrow">Salones</p>
        <h1>{{ esEdicion ? "Editar Alquiler" : "Nuevo Alquiler" }}</h1>
        <p class="page-subtitle">
          {{
            esEdicion
              ? "Modificá los datos del alquiler."
              : "Completá los datos para registrar un nuevo alquiler."
          }}
        </p>
      </div>

      <div class="head-actions">
        <button class="btn-secondary" type="button" @click="volver">
          Volver
        </button>
      </div>
    </section>

    <section class="card form-card">
      <div v-if="loadingData" class="empty-state">Cargando datos...</div>

      <form v-else @submit.prevent="guardar">
        <div class="form-section">
          <h3 class="form-section-title">Salón</h3>

          <div class="field-row field-row-2">
            <div class="field">
              <label>Salón <span class="required">*</span></label>
              <select v-model="form.salonId" required>
                <option :value="null" disabled>Seleccioná un salón...</option>
                <option
                  v-for="salon in salones"
                  :key="salon.id"
                  :value="salon.id"
                >
                  {{ salon.nombre }} — ${{ formatMoney(salon.precio) }}
                </option>
              </select>
            </div>

            <div class="field">
              <label>Fecha y hora <span class="required">*</span></label>
              <input v-model="form.fecha" type="datetime-local" required />
            </div>
          </div>
        </div>

        <div class="form-divider"></div>

        <div class="form-section">
          <h3 class="form-section-title">Datos del cliente</h3>

          <div class="field-row field-row-3">
            <div class="field">
              <label>Nombre <span class="required">*</span></label>
              <input
                v-model.trim="form.nombre"
                type="text"
                placeholder="Ej. Juan Pérez"
                required
              />
            </div>

            <div class="field">
              <label>DNI <span class="required">*</span></label>
              <input
                v-model.trim="form.dni"
                type="text"
                inputmode="numeric"
                placeholder="Ej. 32123456"
                required
              />
            </div>

            <div class="field">
              <label>Teléfono <span class="required">*</span></label>
              <input
                v-model.trim="form.telefono"
                type="text"
                placeholder="Ej. 1134567890"
                required
              />
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

              <span v-if="montoAutocompletado" class="field-hint">
                💡 Precio del salón aplicado automáticamente
              </span>
            </div>

            <div class="field">
              <label>Método de pago <span class="required">*</span></label>
              <select v-model="form.metodoPagoId" required>
                <option :value="null" disabled>Seleccioná un método...</option>
                <option
                  v-for="metodo in metodosPago"
                  :key="metodo.id"
                  :value="metodo.id"
                >
                  {{ metodo.nombre }}
                </option>
              </select>
            </div>

            <div class="field field-sm">
              <label>Condición de pago</label>
              <div class="toggle-group">
                <button
                  type="button"
                  class="btn-toggle"
                  :class="{ 'active-success': form.condicion === true }"
                  @click="form.condicion = true"
                >
                  ✓ Con seña
                </button>

                <button
                  type="button"
                  class="btn-toggle"
                  :class="{ 'active-neutral': form.condicion === false }"
                  @click="form.condicion = false"
                >
                  ✗ Sin seña
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="form-divider"></div>

        <div class="form-section">
          <h3 class="form-section-title">Observaciones</h3>

          <div class="field">
            <textarea
              v-model.trim="form.observaciones"
              rows="4"
              placeholder="Notas adicionales sobre el alquiler..."
            ></textarea>
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
                  : "Registrar alquiler"
            }}
          </button>
        </div>
      </form>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import { alquileresService } from "../../services/alquileresService"
import { salonesService } from "../../services/salonesService"
import { metodosPagoService } from "../../services/metodosPagoService"

const route = useRoute()
const router = useRouter()

const esEdicion = computed(() => Boolean(route.params.id))
const loadingData = ref(false)
const saving = ref(false)
const salones = ref([])
const metodosPago = ref([])
const montoAutocompletado = ref(false)

function pad(value) {
  return String(value).padStart(2, "0")
}

function nowDatetimeLocal() {
  const date = new Date()
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function toDatetimeLocal(value) {
  if (!value) return nowDatetimeLocal()

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return nowDatetimeLocal()

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}

function normalizeSalon(item) {
  return {
    id: Number(item?.salonId ?? item?.id ?? 0),
    nombre: String(item?.nombre ?? ""),
    precio: Number(item?.precio ?? 0),
  }
}

function normalizeMetodoPago(item) {
  return {
    id: Number(item?.metodoPagoId ?? item?.id ?? 0),
    nombre: String(item?.nombre ?? ""),
  }
}

const form = reactive({
  salonId: null,
  nombre: "",
  dni: "",
  telefono: "",
  fecha: nowDatetimeLocal(),
  monto: "",
  condicion: false,
  metodoPagoId: null,
  observaciones: "",
})

watch(
  () => form.salonId,
  (nuevoId) => {
    if (!nuevoId || esEdicion.value) return

    const salon = salones.value.find((item) => item.id === Number(nuevoId))
    if (!salon) return

    form.monto = salon.precio
    montoAutocompletado.value = true
  },
)

watch(
  () => form.monto,
  () => {
    if (!montoAutocompletado.value) return

    const salon = salones.value.find((item) => item.id === Number(form.salonId))
    if (!salon) return

    if (Number(form.monto) !== Number(salon.precio)) {
      montoAutocompletado.value = false
    }
  },
)

function volver() {
  router.push("/alquileres")
}

async function cargarCatalogos() {
  const [salonesRes, metodosRes] = await Promise.all([
    salonesService.listar(),
    metodosPagoService.listar(),
  ])

  salones.value = Array.isArray(salonesRes?.data)
    ? salonesRes.data.map(normalizeSalon).filter((item) => item.id > 0)
    : []

  metodosPago.value = Array.isArray(metodosRes?.data)
    ? metodosRes.data.map(normalizeMetodoPago).filter((item) => item.id > 0)
    : []

  if (!esEdicion.value && !form.metodoPagoId && metodosPago.value.length) {
    form.metodoPagoId = metodosPago.value[0].id
  }
}

async function cargarAlquiler() {
  loadingData.value = true
  try {
    const { data } = await alquileresService.obtener(route.params.id)

    form.salonId = Number(data?.salonId ?? data?.salon?.salonId ?? data?.salon?.id ?? null)
    form.nombre = String(data?.nombre ?? "")
    form.dni = String(data?.dni ?? "")
    form.telefono = String(data?.telefono ?? "")
    form.fecha = toDatetimeLocal(data?.fecha ?? route.query.fecha)
    form.monto = data?.monto ?? ""
    form.condicion = Boolean(data?.condicion)
    form.metodoPagoId = Number(
      data?.metodoPagoId ??
      data?.metodoPago?.metodoPagoId ??
      data?.metodoPago?.id ??
      null,
    )
    form.observaciones = String(data?.observaciones ?? "")
  } catch (error) {
    console.error("No se pudo cargar el alquiler.", error)
    alert("No se pudo cargar el alquiler.")
    router.push("/alquileres")
  } finally {
    loadingData.value = false
  }
}

async function guardar() {
  saving.value = true

  try {
    const payload = {
      salonId: Number(form.salonId),
      nombre: form.nombre.trim(),
      dni: form.dni.trim(),
      telefono: form.telefono.trim(),
      fecha: form.fecha,
      monto: String(form.monto),
      condicion: Boolean(form.condicion),
      metodoPagoId: Number(form.metodoPagoId),
      observaciones: form.observaciones.trim() || null,
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

onMounted(async () => {
  try {
    await cargarCatalogos()

    if (!esEdicion.value) {
      if (route.query.fecha) {
        form.fecha = toDatetimeLocal(route.query.fecha)
      }
      return
    }

    await cargarAlquiler()
  } catch (error) {
    console.error("No se pudieron cargar los datos iniciales.", error)
    alert("No se pudieron cargar los datos necesarios.")
  }
})
</script>

<style scoped>
.alquiler-form-page {
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

.field textarea {
  resize: vertical;
  min-height: 110px;
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

.field-hint {
  font-size: 11px;
  color: #9c6e1e;
  margin-top: 4px;
  display: block;
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

.active-neutral {
  background: rgba(148, 163, 184, 0.15);
  border-color: rgba(148, 163, 184, 0.35);
  color: #475569;
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