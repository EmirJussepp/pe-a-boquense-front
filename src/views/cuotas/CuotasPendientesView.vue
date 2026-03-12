<template>
  <div class="cuotas-page">
    <section class="card page-hero">
      <div class="hero-copy">
        <p class="eyebrow">Cuotas</p>
        <h1>Consulta y cobro de cuotas pendientes</h1>
        <p class="hero-text">
          Buscá por DNI, consultá las cuotas pendientes del socio y registrá
          pagos de forma rápida y ordenada.
        </p>
      </div>

      <div class="hero-side">
        <div class="mini-stat">
          <span class="mini-stat-label">Pendientes</span>
          <strong>{{ cuotasPendientesCount }}</strong>
          <p>Cuotas pendientes en la búsqueda actual.</p>
        </div>
      </div>
    </section>

    <section class="card search-card">
      <div class="section-head">
        <div>
          <p class="eyebrow">Consulta</p>
          <h2>Buscar por DNI</h2>
          <p class="section-subtext">
            Ingresá entre 7 y 10 dígitos para consultar el estado de cuotas.
          </p>
        </div>
      </div>

      <form class="search-form" @submit.prevent="buscarCuotas">
        <div class="search-row">
          <div class="dni-input-wrap">
            <span class="input-prefix">DNI</span>

            <input
              ref="dniInput"
              v-model="dni"
              type="text"
              inputmode="numeric"
              maxlength="10"
              placeholder="Ej. 32123456"
              @input="handleDniInput"
            />
          </div>

          <div class="search-actions">
            <button
              v-if="dni"
              type="button"
              class="btn-secondary"
              @click="limpiarBusqueda"
            >
              Limpiar
            </button>

            <button
              type="submit"
              class="btn-primary"
              :disabled="loading || !dniValido"
            >
              {{ loading ? "Buscando..." : "Buscar" }}
            </button>
          </div>
        </div>

        <p class="helper-text" :class="{ invalid: dni && !dniValido }">
          {{ dniHelperText }}
        </p>

        <div v-if="messageError" class="state-box error-state">
          <strong>No se pudo completar la búsqueda.</strong>
          <p>{{ messageError }}</p>
        </div>

        <div v-if="successMessage" class="state-box success-state">
          <strong>Operación exitosa.</strong>
          <p>{{ successMessage }}</p>
        </div>
      </form>
    </section>

    <section v-if="socio" class="card socio-card">
      <div class="section-head">
        <div>
          <p class="eyebrow">Socio</p>
          <h2>Datos del socio</h2>
        </div>
      </div>

      <div class="info-grid">
        <article class="info-item">
          <span>Nombre</span>
          <strong>{{ socio.nombre }} {{ socio.apellido }}</strong>
        </article>

        <article class="info-item">
          <span>DNI</span>
          <strong>{{ socio.dni || "No disponible" }}</strong>
        </article>

        <article class="info-item">
          <span>Email</span>
          <strong>{{ socio.email || "No registrado" }}</strong>
        </article>

        <article class="info-item">
          <span>Teléfono</span>
          <strong>{{ socio.telefono || "No registrado" }}</strong>
        </article>

        <article class="info-item">
          <span>Dirección</span>
          <strong>{{ socio.direccion || "No registrada" }}</strong>
        </article>

        <article class="info-item">
          <span>Fecha de ingreso</span>
          <strong>{{ formatFecha(socio.fechaInicio) }}</strong>
        </article>
      </div>
    </section>

    <section v-if="searchDone" class="card cuotas-card">
      <div class="section-head section-head-wrap">
        <div>
          <p class="eyebrow">Resultado</p>
          <h2>Cuotas encontradas</h2>
          <p class="section-subtext">
            {{
              cuotas.length
                ? "Seleccioná una o varias cuotas para registrar el pago."
                : "No se encontraron cuotas para este DNI."
            }}
          </p>
        </div>

        <div v-if="cuotas.length" class="totals-box">
          <span>Total adeudado</span>
          <strong>$ {{ formatMoney(totalAdeudado) }}</strong>
        </div>
      </div>

      <div v-if="loading" class="table-loading">
        <div v-for="n in 5" :key="n" class="skeleton-row"></div>
      </div>

      <template v-else-if="cuotas.length">
        <div class="table-toolbar">
          <label class="check-inline">
            <input
              type="checkbox"
              :checked="allSelected"
              @change="toggleSelectAll($event.target.checked)"
            />
            <span>Seleccionar todas las pendientes</span>
          </label>
        </div>

        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Seleccionar</th>
                <th>Periodo</th>
                <th>Vencimiento</th>
                <th>Monto emitido</th>
                <th>Monto a pagar</th>
                <th>Estado</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="cuota in cuotas"
                :key="cuota.cuotaId"
                :class="{ paid: isPaid(cuota) }"
              >
                <td data-label="Seleccionar">
                  <input
                    type="checkbox"
                    v-model="selectedIds"
                    :value="cuota.cuotaId"
                    :disabled="isPaid(cuota)"
                  />
                </td>

                <td data-label="Periodo">
                  {{ formatPeriodo(cuota.periodo) }}
                </td>

                <td data-label="Vencimiento">
                  {{ formatFecha(cuota.fechaVencimiento) }}
                </td>

                <td data-label="Monto emitido">
                  $ {{ formatMoney(cuota.montoEmitido) }}
                </td>

                <td data-label="Monto a pagar">
                  $ {{ formatMoney(cuota.montoAPagar) }}
                </td>

                <td data-label="Estado">
                  <span
                    class="status-badge"
                    :class="isPaid(cuota) ? 'paid' : 'pending'"
                  >
                    {{ isPaid(cuota) ? "Pagada" : "Pendiente" }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="payment-methods">
          <div class="payment-methods-head">
            <h3>Forma de pago</h3>
            <p>Seleccioná un método antes de registrar el cobro.</p>
          </div>

          <div class="methods-grid">
            <label
              v-for="metodo in metodosPago"
              :key="metodo.metodoPagoId"
              class="method-card"
              :class="{ active: Number(metodoPagoId) === Number(metodo.metodoPagoId) }"
            >
              <input
                v-model="metodoPagoId"
                type="radio"
                name="metodoPago"
                :value="metodo.metodoPagoId"
              />
              <span>{{ metodo.nombre }}</span>
            </label>
          </div>
        </div>
      </template>

      <div v-else class="state-box empty-state">
        <strong>No hay cuotas pendientes para mostrar.</strong>
        <p>Probá con otro DNI o verificá si el socio está al día.</p>
      </div>
    </section>

    <section
      v-if="searchDone && cuotas.length"
      class="card payment-bar"
      :class="{ visible: selectedCuotas.length > 0 }"
    >
      <div class="payment-summary">
        <span><strong>Seleccionadas:</strong> {{ selectedCuotas.length }}</span>
        <span><strong>Total a pagar:</strong> $ {{ totalSeleccionado }}</span>
      </div>

      <div class="payment-actions">
        <button
          class="btn-secondary"
          @click="selectAllPendientes"
          :disabled="elegibles.length === 0 || paying"
        >
          Seleccionar todo
        </button>

        <button
          class="btn-secondary success"
          @click="pagarTodo"
          :disabled="elegibles.length === 0 || paying"
        >
          {{ paying ? "Procesando..." : "Pagar todo" }}
        </button>

        <button
          class="btn-primary"
          @click="pagarSeleccionadas"
          :disabled="selectedCuotas.length === 0 || paying"
        >
          {{ paying ? "Procesando..." : "Pagar seleccionadas" }}
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useAuthStore } from "../../stores/auth"
import { computed, nextTick, onMounted, ref } from "vue"
import { cuotasService } from "../../services/cuotasService"
import { metodosPagoService } from "../../services/metodosPagoService"
import { pagosService } from "../../services/pagosService"

const dni = ref("")
const dniInput = ref(null)



const auth = useAuthStore()
const isAdmin = computed(() => auth.isAdmin)
const isCobrador = computed(() => auth.isCobrador)
const cobradorId = computed(() => auth.cobradorId)

const loading = ref(false)
const paying = ref(false)
const searchDone = ref(false)

const messageError = ref("")
const successMessage = ref("")

const socio = ref(null)
const cuotas = ref([])
const totalAdeudado = ref(0)

const metodosPago = ref([])
const metodoPagoId = ref(null)
const selectedIds = ref([])

const dniValido = computed(() => {
  const len = dni.value.trim().length
  return len >= 7 && len <= 10
})

const dniHelperText = computed(() => {
  if (!dni.value) return "Ingresá solo números."
  return dniValido.value
    ? "DNI válido para búsqueda."
    : "El DNI debe tener entre 7 y 10 dígitos."
})

const elegibles = computed(() => cuotas.value.filter((c) => !isPaid(c)))

const cuotasPendientesCount = computed(() => elegibles.value.length)

const selectedCuotas = computed(() =>
  cuotas.value.filter((cuota) => selectedIds.value.includes(cuota.cuotaId))
)

const allSelected = computed(() => {
  if (!elegibles.value.length) return false
  return elegibles.value.every((cuota) =>
    selectedIds.value.includes(cuota.cuotaId)
  )
})

const totalSeleccionado = computed(() => {
  const total = selectedCuotas.value.reduce((acc, cuota) => {
    return acc + Number(cuota.montoAPagar || 0)
  }, 0)

  return formatMoney(total)
})

function handleDniInput() {
  dni.value = dni.value.replace(/\D+/g, "").slice(0, 10)
}

function limpiarBusqueda() {
  dni.value = ""
  searchDone.value = false
  messageError.value = ""
  successMessage.value = ""
  socio.value = null
  cuotas.value = []
  totalAdeudado.value = 0
  metodoPagoId.value = null
  selectedIds.value = []
  nextTick(() => dniInput.value?.focus())
}

function isPaid(cuota) {
  return cuota?.estado === "PAGADA"
}

function formatMoney(value) {
  return new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0))
}

function formatFecha(value) {
  if (!value) return "No disponible"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "No disponible"

  return new Intl.DateTimeFormat("es-AR").format(date)
}

function formatPeriodo(periodo) {
  if (!periodo) return "No disponible"

  const text = String(periodo)
  if (text.length !== 6) return text

  const year = text.slice(0, 4)
  const month = text.slice(4, 6)

  return `${month}/${year}`
}

function toggleSelectAll(checked) {
  selectedIds.value = checked ? elegibles.value.map((c) => c.cuotaId) : []
}

function selectAllPendientes() {
  selectedIds.value = elegibles.value.map((c) => c.cuotaId)
}

async function cargarMetodosPago() {
  try {
    const { data } = await metodosPagoService.listar()
    metodosPago.value = data || []
  } catch (error) {
    console.error("Error al cargar métodos de pago:", error)
    metodosPago.value = []
  }
}

async function buscarCuotas() {
  if (!dniValido.value) {
    messageError.value = "Ingresá un DNI válido entre 7 y 10 dígitos."
    successMessage.value = ""
    return
  }

  loading.value = true
  searchDone.value = false
  messageError.value = ""
  successMessage.value = ""
  socio.value = null
  cuotas.value = []
  totalAdeudado.value = 0
  metodoPagoId.value = null
  selectedIds.value = []

  try {
    const { data } = await cuotasService.pendientesPorDni(dni.value.trim())

    socio.value = data?.socio || null
    cuotas.value = (data?.cuotas || []).map((cuota) => ({
      ...cuota,
      montoEmitido: Number(cuota.montoEmitido || 0),
      montoAPagar: Number(cuota.montoAPagar || 0),
    }))
    totalAdeudado.value = Number(data?.totalAdeudado || 0)
  } catch (error) {
    console.error("Error al buscar cuotas:", error)
    messageError.value =
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      error?.message ||
      "No se pudo obtener la información."
  } finally {
    searchDone.value = true
    loading.value = false
  }
}

async function pagarSeleccionadas() {
  if (!selectedCuotas.value.length) {
    messageError.value = "Seleccioná al menos una cuota."
    successMessage.value = ""
    return
  }

  if (!metodoPagoId.value) {
    messageError.value = "Seleccioná un método de pago."
    successMessage.value = ""
    return
  }

  paying.value = true
  messageError.value = ""
  successMessage.value = ""

  try {
    await pagosService.pagarMasivo({
      cuotaIds: selectedCuotas.value.map((c) => c.cuotaId),
      metodoPagoId: Number(metodoPagoId.value),
    })

    successMessage.value = "Pago registrado correctamente."
    selectedIds.value = []
    await buscarCuotas()
  } catch (error) {
    console.error("Error al pagar cuotas:", error)
    messageError.value =
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      error?.message ||
      "No se pudo registrar el pago."
  } finally {
    paying.value = false
  }
}

async function pagarTodo() {
  if (!elegibles.value.length) {
    messageError.value = "No hay cuotas pendientes para pagar."
    successMessage.value = ""
    return
  }

  selectedIds.value = elegibles.value.map((c) => c.cuotaId)
  await pagarSeleccionadas()
}

onMounted(async () => {
  await cargarMetodosPago()
  nextTick(() => dniInput.value?.focus())
})
</script>

<style scoped>
.cuotas-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-hero {
  padding: 24px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 240px;
  gap: 18px;
  align-items: stretch;
}

.hero-copy {
  min-width: 0;
}

.eyebrow {
  margin: 0 0 8px;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  font-weight: 700;
}

.page-hero h1 {
  margin: 0 0 10px;
  font-size: clamp(1.9rem, 4vw, 2.7rem);
  line-height: 1.08;
}

.hero-text {
  margin: 0;
  max-width: 760px;
  color: var(--text-muted);
  line-height: 1.65;
  font-size: 1rem;
}

.hero-side {
  display: flex;
  align-items: stretch;
}

.mini-stat {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.025);
  padding: 18px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.mini-stat-label {
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  margin-bottom: 10px;
}

.mini-stat strong {
  font-size: 2rem;
  line-height: 1;
  margin-bottom: 10px;
}

.mini-stat p {
  margin: 0;
  color: var(--text-muted);
  line-height: 1.5;
}

.search-card,
.socio-card,
.cuotas-card,
.payment-bar {
  padding: 20px;
}

.section-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: start;
}

.section-head-wrap {
  flex-wrap: wrap;
}

.section-head h2 {
  margin: 0 0 6px;
  font-size: 1.2rem;
}

.section-subtext {
  margin: 0;
  color: var(--text-muted);
  line-height: 1.55;
}

.search-form {
  margin-top: 16px;
}

.search-row {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.dni-input-wrap {
  flex: 1;
  min-width: 260px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.input-prefix {
  min-height: 42px;
  padding: 0 14px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  background: rgba(139, 92, 246, 0.12);
  color: #ddd6fe;
  font-weight: 700;
}

.dni-input-wrap input {
  flex: 1;
  min-height: 44px;
  border-radius: 14px;
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.03);
  color: var(--text);
  padding: 0 14px;
  outline: none;
}

.dni-input-wrap input:focus {
  border-color: rgba(139, 92, 246, 0.45);
}

.search-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.helper-text {
  margin: 10px 0 0;
  color: var(--text-muted);
  font-size: 0.92rem;
}

.helper-text.invalid {
  color: #fca5a5;
}

.state-box {
  margin-top: 16px;
  padding: 16px;
  border-radius: 14px;
  border: 1px solid var(--border);
}

.error-state {
  background: rgba(239, 68, 68, 0.08);
  color: #fecaca;
}

.success-state {
  background: rgba(34, 197, 94, 0.08);
  color: #bbf7d0;
}

.empty-state {
  margin-top: 18px;
}

.info-grid {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.info-item {
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 14px;
  background: rgba(255, 255, 255, 0.02);
}

.info-item span {
  display: block;
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-bottom: 6px;
}

.info-item strong {
  line-height: 1.5;
}

.totals-box {
  min-width: 220px;
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.02);
}

.totals-box span {
  display: block;
  color: var(--text-muted);
  font-size: 0.82rem;
  margin-bottom: 6px;
}

.totals-box strong {
  font-size: 1.2rem;
}

.table-toolbar {
  margin-top: 18px;
  margin-bottom: 12px;
}

.check-inline {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--text-muted);
}

.table-wrap {
  width: 100%;
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead th {
  text-align: left;
  padding: 16px 18px;
  font-size: 0.88rem;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.02);
}

.data-table tbody td {
  padding: 16px 18px;
  border-bottom: 1px solid var(--border);
  line-height: 1.5;
}

.data-table tbody tr:hover {
  background: rgba(255, 255, 255, 0.02);
}

.data-table tbody tr.paid {
  opacity: 0.72;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
}

.status-badge.paid {
  background: rgba(34, 197, 94, 0.12);
  color: #86efac;
}

.status-badge.pending {
  background: rgba(239, 68, 68, 0.12);
  color: #fca5a5;
}

.payment-methods {
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid var(--border);
}

.payment-methods-head h3 {
  margin: 0 0 6px;
}

.payment-methods-head p {
  margin: 0 0 14px;
  color: var(--text-muted);
}

.methods-grid {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.method-card {
  position: relative;
  min-height: 42px;
  padding: 0 14px;
  border-radius: 12px;
  border: 1px solid var(--border);
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.02);
}

.method-card input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.method-card.active {
  border-color: rgba(139, 92, 246, 0.45);
  background: rgba(139, 92, 246, 0.12);
}

.payment-bar {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: center;
  flex-wrap: wrap;
  opacity: 0.72;
  transition: 0.2s ease;
}

.payment-bar.visible {
  opacity: 1;
}

.payment-summary {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  color: var(--text-muted);
}

.payment-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-secondary.success {
  border-color: rgba(34, 197, 94, 0.25);
}

.table-loading {
  margin-top: 18px;
}

.skeleton-row {
  height: 48px;
  border-radius: 12px;
  margin-bottom: 12px;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.04) 0%,
    rgba(255, 255, 255, 0.08) 50%,
    rgba(255, 255, 255, 0.04) 100%
  );
  background-size: 200% 100%;
  animation: loading 1.2s linear infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@media (max-width: 900px) {
  .page-hero {
    grid-template-columns: 1fr;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .search-row {
    flex-direction: column;
    align-items: stretch;
  }

  .dni-input-wrap {
    min-width: 0;
  }

  .search-actions {
    width: 100%;
  }

  .search-actions .btn-primary,
  .search-actions .btn-secondary {
    flex: 1;
  }

  .data-table thead {
    display: none;
  }

  .data-table,
  .data-table tbody,
  .data-table tr,
  .data-table td {
    display: block;
    width: 100%;
  }

  .data-table tbody tr {
    padding: 14px 16px;
    border-bottom: 1px solid var(--border);
  }

  .data-table tbody td {
    border: 0;
    padding: 8px 0;
  }

  .data-table tbody td::before {
    content: attr(data-label);
    display: block;
    font-size: 0.78rem;
    font-weight: 700;
    color: var(--text-muted);
    margin-bottom: 4px;
  }

  .payment-bar {
    position: sticky;
    bottom: 8px;
  }
}
</style>