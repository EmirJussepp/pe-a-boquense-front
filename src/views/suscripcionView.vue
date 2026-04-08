<template>
  <div class="page">

    <!-- Header -->
    <section class="page-head card">
      <div class="page-head-copy">
        <p class="eyebrow">Sistema</p>
        <h1>Suscripción</h1>
        <p class="page-subtitle">Gestioná el acceso y los pagos de la peña.</p>
      </div>
      <div class="head-actions">
        <button class="btn-secondary" type="button" @click="cargar" :disabled="loading">
          {{ loading ? "Actualizando..." : "Actualizar" }}
        </button>
      </div>
    </section>

    <!-- Estado actual -->
    <section class="card seccion">
      <h2>Estado de la suscripción</h2>

      <div v-if="loading" class="empty-state">Cargando...</div>

      <div v-else-if="estadoData" class="estado-grid">
        <div class="estado-item">
          <span class="estado-label">Estado</span>
          <span class="badge" :class="badgeClass">{{ estadoTexto }}</span>
        </div>
        <div class="estado-item">
          <span class="estado-label">Acceso al sistema</span>
          <span class="badge" :class="tieneAcceso ? 'badge-success' : 'badge-danger'">
            {{ tieneAcceso ? "Habilitado" : "Bloqueado" }}
          </span>
        </div>
        <div class="estado-item" v-if="estadoData === 'BLOQUEADA' || estadoData === 'POR_VENCER'">
          <span class="estado-label">⚠️</span>
          <span class="aviso-texto">
            {{ estadoData === 'BLOQUEADA'
              ? 'El acceso está bloqueado. Realizá el pago para reactivarlo.'
              : 'La suscripción vence pronto. Renová antes de perder el acceso.' }}
          </span>
        </div>
      </div>

      <div v-else class="empty-state">
        <div class="empty-box"><p>No se encontró suscripción para esta cuenta.</p></div>
      </div>
    </section>

    <!-- Pagar con MercadoPago -->
    <section class="card seccion">
      <h2>Renovar suscripción</h2>
      <p class="page-subtitle" style="margin-bottom:1.25rem">
        Seleccioná los meses a contratar y serás redirigido a MercadoPago para completar el pago.
      </p>

      <div v-if="precioMensual" class="precio-info">
        💰 Precio por mes: <strong>$ {{ precioMensual.toLocaleString('es-AR') }}</strong>
      </div>

      <form class="form-grid" @submit.prevent="pagar">
        <div class="field">
          <label>Email de la peña</label>
          <input
            v-model.trim="formPago.email"
            type="email"
            placeholder="contacto@lapena.com"
            required
          />
        </div>

        <div class="field">
          <label>Nombre de la peña</label>
          <input
            v-model.trim="formPago.nombre"
            type="text"
            placeholder="Peña Los Xeneizes"
            required
          />
        </div>

        <div class="field field-sm">
          <label>Meses</label>
          <select v-model.number="formPago.meses">
            <option :value="1">1 mes  — $ {{ precio(1) }}</option>
            <option :value="3">3 meses — $ {{ precio(3) }}</option>
            <option :value="6">6 meses — $ {{ precio(6) }}</option>
            <option :value="12">12 meses — $ {{ precio(12) }}</option>
          </select>
        </div>

        <div class="field" style="align-self:flex-end">
          <button class="btn-primary" type="submit" :disabled="loadingPago">
            {{ loadingPago ? "Generando link..." : "Pagar con MercadoPago" }}
          </button>
        </div>
      </form>

      <inline-message :msg="msgPago" />
    </section>

    <!-- Config precio (solo admin) -->
    <section class="card seccion" v-if="auth.isAdmin">
      <h2>Configuración de precio</h2>
      <p class="page-subtitle" style="margin-bottom:1.25rem">
        Actualizá el precio mensual que verán las peñas al renovar.
      </p>

      <form class="form-grid" @submit.prevent="guardarPrecio">
        <div class="field field-sm">
          <label>Precio mensual (ARS)</label>
          <input
            v-model.number="formConfig.precio"
            type="number"
            min="0"
            step="100"
            placeholder="5000"
            required
          />
        </div>
        <div class="field" style="align-self:flex-end">
          <button class="btn-primary" type="submit" :disabled="loadingConfig">
            {{ loadingConfig ? "Guardando..." : "Guardar precio" }}
          </button>
        </div>
      </form>

      <inline-message :msg="msgConfig" />
    </section>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import { useRoute } from "vue-router"
import { suscripcionService } from "../../services/suscripcionService"
import { useAuthStore } from "../../stores/auth"

// ── Inline message component simple ──────────────────────────────────────────
const InlineMessage = {
  props: ["msg"],
  template: `
    <div v-if="msg" class="toast-inline" :class="msg.tipo">{{ msg.texto }}</div>
  `
}

const auth  = useAuthStore()
const route = useRoute()

// ── Estado ────────────────────────────────────────────────────────────────────
const loading     = ref(false)
const estadoData  = ref(null)
const tieneAcceso = ref(false)
const precioMensual = ref(null)

const loadingPago = ref(false)
const msgPago     = ref(null)

const loadingConfig = ref(false)
const msgConfig     = ref(null)

const formPago = ref({
  email:  auth.user?.email ?? "",
  nombre: "",
  meses:  1,
})

const formConfig = ref({
  precio: 0,
})

// ── Computed ──────────────────────────────────────────────────────────────────
const estadoTexto = computed(() => ({
  ACTIVA: "Activa", POR_VENCER: "Por vencer",
  BLOQUEADA: "Bloqueada", BAJA: "Baja"
}[estadoData.value] ?? estadoData.value))

const badgeClass = computed(() => ({
  ACTIVA: "badge-success", POR_VENCER: "badge-warning",
  BLOQUEADA: "badge-danger", BAJA: "badge-neutral"
}[estadoData.value] ?? "badge-neutral"))

const precio = (meses) =>
  precioMensual.value
    ? (precioMensual.value * meses).toLocaleString("es-AR")
    : "..."

// ── Métodos ───────────────────────────────────────────────────────────────────
async function cargar() {
  loading.value = true
  try {
    const email = formPago.value.email
    if (email) {
      const [resEstado, resAcceso, resConfig] = await Promise.all([
        suscripcionService.obtenerEstado(email).catch(() => null),
        suscripcionService.verificarAcceso(email).catch(() => ({ data: { acceso: false } })),
        suscripcionService.obtenerConfig(),
      ])
      estadoData.value    = resEstado?.data?.estado ?? null
      tieneAcceso.value   = resAcceso?.data?.acceso ?? false
      precioMensual.value = resConfig.data.precioMensual
      formConfig.value.precio = resConfig.data.precioMensual
    }
  } finally {
    loading.value = false
  }
}

async function pagar() {
  loadingPago.value = true
  msgPago.value     = null
  try {
    const { data } = await suscripcionService.crearPreferencia({
      emailPena:  formPago.value.email,
      nombrePena: formPago.value.nombre,
      meses:      formPago.value.meses,
    })
    // Redirigimos directamente a MercadoPago
    // En producción usá data.checkoutUrl, en testing usá data.sandboxCheckoutUrl
    window.location.href = data.sandboxCheckoutUrl
  } catch {
    msgPago.value = { tipo: "error", texto: "No se pudo generar el link de pago. Intentá nuevamente." }
  } finally {
    loadingPago.value = false
  }
}

async function guardarPrecio() {
  loadingConfig.value = true
  msgConfig.value     = null
  try {
    await suscripcionService.actualizarPrecio(formConfig.value.precio)
    precioMensual.value = formConfig.value.precio
    msgConfig.value = { tipo: "success", texto: "Precio actualizado correctamente." }
  } catch {
    msgConfig.value = { tipo: "error", texto: "Error al guardar el precio." }
  } finally {
    loadingConfig.value = false
  }
}

// ── Detectar retorno desde MercadoPago ────────────────────────────────────────
onMounted(async () => {
  await cargar()

  const pago = route.query.pago
  if (pago === "aprobado") {
    msgPago.value = { tipo: "success", texto: "✅ Pago aprobado. Tu suscripción fue renovada." }
    await cargar() // refrescamos el estado
  } else if (pago === "rechazado") {
    msgPago.value = { tipo: "error", texto: "❌ El pago fue rechazado. Intentá nuevamente." }
  } else if (pago === "pendiente") {
    msgPago.value = { tipo: "warning", texto: "⏳ El pago está pendiente de confirmación." }
  }
})
</script>

<style scoped>
.seccion { margin-top: 1.5rem; }

.estado-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.estado-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.estado-label {
  font-size: 0.875rem;
  color: var(--color-text-soft);
  min-width: 160px;
}

.aviso-texto {
  font-size: 0.875rem;
  color: var(--color-warning, #92400e);
}

.precio-info {
  font-size: 0.95rem;
  margin-bottom: 1rem;
  color: var(--color-text-soft);
}

.form-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-start;
}

.toast-inline {
  margin-top: 1rem;
  padding: 0.6rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
}
.toast-inline.success  { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
.toast-inline.error    { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
.toast-inline.warning  { background: #fffbeb; color: #92400e; border: 1px solid #fde68a; }

.badge-warning { background: #fef9c3; color: #854d0e; }
.badge-danger  { background: #fee2e2; color: #dc2626; }
</style>