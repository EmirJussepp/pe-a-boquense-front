<template>
  <div class="login-page">
    <div class="login-grid">

      <section class="login-brand">
        <div class="login-eyebrow">Peña Boquense · Sistema</div>
        <h1>
          Gestión moderna para
          <span class="gradient-text">socios, cuotas y organización</span>
        </h1>
        <p>
          Una plataforma administrativa unificada para cobranzas, viajes,
          alquileres y control operativo.
        </p>
        <div class="login-features">
          <div class="feature-item">✓ Gestión de socios</div>
          <div class="feature-item">✓ Cobranzas y cuotas</div>
          <div class="feature-item">✓ Alquileres de salones</div>
          <div class="feature-item">✓ Control de movimientos</div>
        </div>
      </section>

      <section class="login-card glass-card">
        <div class="login-card-top">
          <img :src="logo3byte" alt="3Byte" class="login-logo" />
          <div>
            <h2>Iniciar sesión</h2>
            <p>Accedé con tu usuario para entrar al panel.</p>
          </div>
        </div>

        <form @submit.prevent="onSubmit">
          <div class="field" style="margin-bottom: 16px;">
            <label>Email</label>
            <input
              v-model="form.email"
              type="email"
              placeholder="nombre@correo.com"
              required
            />
          </div>

          <div class="field" style="margin-bottom: 20px;">
            <label>Contraseña</label>
            <input
              v-model="form.password"
              type="password"
              placeholder="••••••••"
              required
            />
          </div>

          <p v-if="errorMsg" class="error-text">{{ errorMsg }}</p>

          <button class="btn-primary" type="submit" :disabled="auth.loading" style="width:100%;">
            {{ auth.loading ? "Ingresando..." : "Ingresar" }}
          </button>
        </form>
      </section>

    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue"
import { useRouter } from "vue-router"
import { useAuthStore } from "../stores/auth"
import logo3byte from "../assets/logo3byte.png"

const router = useRouter()
const auth = useAuthStore()
const errorMsg = ref("")
const form = reactive({ email: "", password: "" })

async function onSubmit() {
  errorMsg.value = ""
  try {
    await auth.login(form)
    router.push("/inicio")
  } catch (error) {
    errorMsg.value =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "No se pudo iniciar sesión."
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 32px;
  background: var(--bg);
}

.login-grid {
  width: 100%;
  max-width: 1100px;
  display: grid;
  grid-template-columns: 1.1fr 420px;
  gap: 48px;
  align-items: center;
}

/* BRAND SIDE */
.login-brand { padding: 20px 0; }

.login-eyebrow {
  display: inline-flex;
  align-items: center;
  padding: 6px 16px;
  border-radius: 999px;
  background: var(--primary-soft);
  border: 1px solid var(--border-strong);
  color: var(--primary);
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  margin-bottom: 24px;
}

.login-brand h1 {
  margin: 0 0 16px;
  font-size: clamp(2rem, 3.5vw, 3.5rem);
  line-height: 1.05;
  letter-spacing: -0.03em;
  color: var(--text);
  font-weight: 900;
}

/* gradient-text ya está en globals.css */

.login-brand > p {
  margin: 0 0 32px;
  max-width: 520px;
  color: var(--text-soft);
  font-size: 1.05rem;
  line-height: 1.65;
}

.login-features {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.feature-item {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-soft);
  display: flex;
  align-items: center;
  gap: 8px;
}
.feature-item::before {
  content: "";
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
  flex-shrink: 0;
}

/* CARD SIDE */
.login-card {
  padding: 32px;
}

.login-card-top {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 28px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border);
}

.login-logo {
  width: 52px;
  height: 52px;
  object-fit: contain;
  border-radius: 12px;
}

.login-card-top h2 {
  margin: 0 0 4px;
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--primary);
}

.login-card-top p {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.875rem;
}

/* fields heredados del globals.css */
.field label { color: var(--primary); }

.error-text {
  color: var(--danger);
  font-size: 0.85rem;
  margin: 0 0 16px;
  padding: 10px 14px;
  background: rgba(239, 68, 68, 0.08);
  border-radius: 8px;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

@media (max-width: 900px) {
  .login-grid {
    grid-template-columns: 1fr;
    max-width: 460px;
  }
  .login-brand { display: none; }
}
</style>