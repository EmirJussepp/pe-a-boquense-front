<template>
  <div class="login-page">
    <div class="login-grid">
      <section class="login-brand">
        <div class="brand-badge">Peña Boquense · Sistema</div>

        <h1>
          Gestión moderna para
          <span>socios, cuotas y organización</span>
        </h1>

        <p>
          Una plataforma administrativa unificada para cobranzas, viajes,
          alquileres y control operativo.
        </p>
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
          <div class="field">
            <label>Email</label>
            <input
              v-model="form.email"
              type="email"
              placeholder="nombre@correo.com"
              required
            />
          </div>

          <div class="field">
            <label>Contraseña</label>
            <input
              v-model="form.password"
              type="password"
              placeholder="••••••••"
              required
            />
          </div>

          <p v-if="errorMsg" class="error-text">{{ errorMsg }}</p>

          <button class="btn-primary" type="submit" :disabled="auth.loading">
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

const form = reactive({
  email: "",
  password: "",
})

async function onSubmit() {
  errorMsg.value = ""

  try {
    await auth.login(form)
    router.push("/inicio")
  } catch (error) {
    console.log("LOGIN ERROR >>>", error)
    console.log("LOGIN ERROR RESPONSE >>>", error?.response)
    console.log("LOGIN ERROR DATA >>>", error?.response?.data)

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
}

.login-grid {
  width: 100%;
  max-width: 1180px;
  display: grid;
  grid-template-columns: 1.1fr 440px;
  gap: 28px;
  align-items: center;
}

.login-brand {
  padding: 20px 10px 20px 0;
}

.brand-badge {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  background: rgba(99, 102, 241, 0.12);
  border: 1px solid rgba(99, 102, 241, 0.2);
  color: #c7d2fe;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 18px;
}

.login-brand h1 {
  margin: 0 0 14px;
  font-size: clamp(2.3rem, 4vw, 4.2rem);
  line-height: 1.02;
  letter-spacing: -0.03em;
  max-width: 760px;
}

.login-brand h1 span {
  background: linear-gradient(135deg, #a78bfa, #60a5fa, #22d3ee);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.login-brand p {
  margin: 0;
  max-width: 640px;
  color: var(--text-2);
  font-size: 1.05rem;
  line-height: 1.65;
}

.login-card {
  padding: 26px;
}

.login-card-top {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 22px;
}

.login-logo {
  width: 54px;
  height: 54px;
  object-fit: contain;
  border-radius: 14px;
}

.login-card-top h2 {
  margin: 0 0 4px;
  font-size: 1.45rem;
}

.login-card-top p {
  margin: 0;
  color: var(--text-3);
}

@media (max-width: 980px) {
  .login-grid {
    grid-template-columns: 1fr;
  }

  .login-brand {
    padding-right: 0;
  }
}
</style>