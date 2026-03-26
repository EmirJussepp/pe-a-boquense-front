<template>
  <div class="inicio-page">

    <!-- WELCOME -->
    <header class="welcome-section">
      <h1 class="welcome-title">
        ¡Bienvenido, <span class="gradient-text">{{ primerNombre }}</span>!
      </h1>
      <p class="welcome-subtitle">
        Panel de control de la <strong>Peña Boquense</strong>
      </p>
    </header>

    <!-- MÉTRICAS -->
    <div class="metrics-grid">
      <div class="metric-card card" @click="$router.push('/socios/activos')">
        <div class="metric-icon" style="background:#e8f0fb; color:#003b7a">
          <Users :size="22" />
        </div>
        <div class="metric-info">
          <p class="metric-label">Socios Activos</p>
          <p class="metric-value" style="color:#003b7a">
            <span v-if="loadingMetrics" class="skeleton-val" />
            <span v-else>{{ stats.sociosActivos }}</span>
          </p>
        </div>
        <ChevronRight class="metric-arrow" :size="16" />
      </div>

      <div class="metric-card card" @click="$router.push('/socios/baja')">
        <div class="metric-icon" style="background:#f1f5f9; color:#64748b">
          <UserX :size="22" />
        </div>
        <div class="metric-info">
          <p class="metric-label">Socios de Baja</p>
          <p class="metric-value" style="color:#64748b">
            <span v-if="loadingMetrics" class="skeleton-val" />
            <span v-else>{{ stats.sociosBaja }}</span>
          </p>
        </div>
        <ChevronRight class="metric-arrow" :size="16" />
      </div>

      <div class="metric-card card" @click="$router.push('/beneficios')">
        <div class="metric-icon" style="background:#fef9ec; color:#9c6e1e">
          <Star :size="22" />
        </div>
        <div class="metric-info">
          <p class="metric-label">Con Beneficio</p>
          <p class="metric-value" style="color:#9c6e1e">
            <span v-if="loadingMetrics" class="skeleton-val" />
            <span v-else>{{ stats.beneficios }}</span>
          </p>
        </div>
        <ChevronRight class="metric-arrow" :size="16" />
      </div>

      <div class="metric-card card" @click="$router.push('/viajes')">
        <div class="metric-icon" style="background:#eff6ff; color:#1d4ed8">
          <Plane :size="22" />
        </div>
        <div class="metric-info">
          <p class="metric-label">Viajes</p>
          <p class="metric-value" style="color:#1d4ed8">
            <span v-if="loadingMetrics" class="skeleton-val" />
            <span v-else>{{ stats.viajes }}</span>
          </p>
        </div>
        <ChevronRight class="metric-arrow" :size="16" />
      </div>

      <div class="metric-card card" @click="$router.push('/alquileres')">
        <div class="metric-icon" style="background:#f0fdf4; color:#15803d">
          <Building2 :size="22" />
        </div>
        <div class="metric-info">
          <p class="metric-label">Alquileres</p>
          <p class="metric-value" style="color:#15803d">
            <span v-if="loadingMetrics" class="skeleton-val" />
            <span v-else>{{ stats.alquileres }}</span>
          </p>
        </div>
        <ChevronRight class="metric-arrow" :size="16" />
      </div>

      <div class="metric-card card" @click="$router.push('/movimientos')">
        <div class="metric-icon" style="background:#f5f3ff; color:#7c3aed">
          <ArrowLeftRight :size="22" />
        </div>
        <div class="metric-info">
          <p class="metric-label">Movimientos</p>
          <p class="metric-value" style="color:#7c3aed">
            <span v-if="loadingMetrics" class="skeleton-val" />
            <span v-else>{{ stats.movimientos }}</span>
          </p>
        </div>
        <ChevronRight class="metric-arrow" :size="16" />
      </div>
    </div>

    <!-- ACCESOS DIRECTOS -->
    <section class="modules-section">
      <h2 class="section-label">Accesos Directos</h2>
      <div class="modules-grid">
        <div
          v-for="mod in modulos"
          :key="mod.title"
          class="module-card glass-card"
          @click="$router.push(mod.path)"
        >
          <div class="card-image-bg" :style="{ backgroundImage: `url(${mod.img})` }"></div>
          <div class="card-overlay"></div>
          <div class="module-content">
            <div class="text-info">
              <h3>{{ mod.title }}</h3>
              <p>{{ mod.desc }}</p>
            </div>
          </div>
          <div class="hover-indicator"></div>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue"
import { useAuthStore } from "../stores/auth"
import { http } from "../services/http"
import { Users, UserX, Star, Plane, Building2, ArrowLeftRight, ChevronRight } from "lucide-vue-next"

import sociosImg   from "../assets/sociospeña.jpg"
import cuotasImg   from "../assets/cuotaspeña.jpg"
import viajesImg   from "../assets/viajespeña.jpg"
import alquilerImg from "../assets/peñaalquiler.jpg"

const auth = useAuthStore()
const primerNombre = computed(() => auth.nombre?.split(" ")[0] || "Usuario")

const loadingMetrics = ref(true)
const stats = ref({
  sociosActivos: "—",
  sociosBaja: "—",
  beneficios: "—",
  viajes: "—",
  alquileres: "—",
  movimientos: "—",
})

const modulos = [
  { title: "Socios",     path: "/socios/activos",        desc: "Gestión de miembros",  img: sociosImg   },
  { title: "Cuotas",     path: "/cuotas/cobranzas",      desc: "Control de pagos",     img: cuotasImg   },
  { title: "Viajes",     path: "/viajes",                desc: "Organizar traslados",  img: viajesImg   },
  { title: "Alquileres", path: "/alquileres/calendario", desc: "Reservas de salones",  img: alquilerImg },
]

async function cargarMetricas() {
  loadingMetrics.value = true
  try {
    const [sociosActRes, sociosBajaRes, beneficiosRes, viajesRes, alquileresRes, movimientosRes] = await Promise.allSettled([
      http.get("/socios/activos?page=1&pageSize=1"),
      http.get("/socios/baja?page=1&pageSize=1"),
      http.get("/beneficios"),
      http.get("/viajes-bombonera"),
      http.get("/alquileres-salones"),
      http.get("/movimientos"),
    ])

    if (sociosActRes.status === "fulfilled")
      stats.value.sociosActivos = sociosActRes.value.data?.total ?? sociosActRes.value.data?.length ?? "—"
    if (sociosBajaRes.status === "fulfilled")
      stats.value.sociosBaja = sociosBajaRes.value.data?.total ?? sociosBajaRes.value.data?.length ?? "—"
    if (beneficiosRes.status === "fulfilled")
      stats.value.beneficios = Array.isArray(beneficiosRes.value.data) ? beneficiosRes.value.data.length : "—"
    if (viajesRes.status === "fulfilled")
      stats.value.viajes = Array.isArray(viajesRes.value.data) ? viajesRes.value.data.length : "—"
    if (alquileresRes.status === "fulfilled")
      stats.value.alquileres = Array.isArray(alquileresRes.value.data) ? alquileresRes.value.data.length : "—"
    if (movimientosRes.status === "fulfilled")
      stats.value.movimientos = Array.isArray(movimientosRes.value.data) ? movimientosRes.value.data.length : "—"
  } finally {
    loadingMetrics.value = false
  }
}

onMounted(cargarMetricas)
</script>

<style scoped>
.inicio-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 28px 20px 40px;
}

/* WELCOME */
.welcome-section { text-align: center; padding: 16px 0 28px; }
.welcome-title {
  font-size: clamp(2rem, 4vw, 3.2rem);
  font-weight: 900;
  color: var(--primary);
  margin: 0 0 6px;
  letter-spacing: -0.03em;
}
.welcome-subtitle { color: var(--text-soft); font-size: 1rem; margin: 0; }

/* MÉTRICAS */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(185px, 1fr));
  gap: 14px;
  margin-bottom: 32px;
}
.metric-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
}
.metric-card:hover { transform: translateY(-3px); box-shadow: var(--shadow); }
.metric-icon {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.metric-info { flex: 1; min-width: 0; }
.metric-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 5px;
}
.metric-value {
  font-size: 26px;
  font-weight: 900;
  margin: 0;
  line-height: 1;
}
.metric-arrow { color: var(--border); flex-shrink: 0; transition: color 0.15s; }
.metric-card:hover .metric-arrow { color: var(--text-muted); }

.skeleton-val {
  display: inline-block;
  width: 40px;
  height: 26px;
  border-radius: 6px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 400px 100%;
  animation: shimmer 1.4s infinite;
  vertical-align: middle;
}
@keyframes shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position:  400px 0; }
}

/* MÓDULOS */
.section-label {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  margin-bottom: 20px;
  color: var(--text-muted);
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 15px;
}
.section-label::after { content: ""; height: 1px; flex-grow: 1; background: var(--border); }

.modules-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
.module-card {
  position: relative;
  height: 240px;
  border-radius: var(--radius);
  overflow: hidden;
  border: 1px solid var(--border);
  transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
  cursor: pointer;
}
.card-image-bg { position: absolute; inset: 0; background-size: cover; background-position: center; transition: transform 0.8s ease; }
.card-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,59,122,0.05) 0%, rgba(0,59,122,0.8) 100%); }
.module-card:hover { transform: translateY(-6px); border-color: var(--accent); box-shadow: 0 15px 35px rgba(0,59,122,0.2); }
.module-card:hover .card-image-bg { transform: scale(1.08); }
.module-content { position: relative; z-index: 2; padding: 20px; height: 100%; display: flex; align-items: flex-end; }
.text-info h3 { font-size: 1.3rem; font-weight: 800; color: #fff; margin: 0 0 4px; }
.text-info p { font-size: 0.85rem; color: var(--accent); font-weight: 600; margin: 0; }
.hover-indicator { position: absolute; bottom: 0; left: 0; width: 0; height: 4px; background: var(--accent); transition: width 0.4s ease; }
.module-card:hover .hover-indicator { width: 100%; }

/* ── RESPONSIVO ─────────────────────────────────────────────── */

/* Tablet grande */
@media (max-width: 1100px) {
  .modules-grid { grid-template-columns: repeat(2, 1fr); }
}

/* Tablet */
@media (max-width: 900px) {
  .metrics-grid { grid-template-columns: repeat(3, 1fr); }
  .modules-grid  { grid-template-columns: repeat(2, 1fr); gap: 16px; }
  .module-card   { height: 200px; }
}

/* Mobile landscape / tablet chico */
@media (max-width: 768px) {
  .inicio-page { padding: 16px 16px 32px; }

  .welcome-section { padding: 10px 0 20px; }

  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin-bottom: 24px;
  }

  .metric-card  { padding: 14px 14px; gap: 10px; }
  .metric-icon  { width: 40px; height: 40px; border-radius: 10px; }
  .metric-value { font-size: 22px; }

  .modules-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .module-card  { height: 180px; }
  .text-info h3 { font-size: 1.1rem; }
}

/* Mobile portrait */
@media (max-width: 480px) {
  .inicio-page { padding: 12px 12px 28px; }

  .welcome-title    { letter-spacing: -0.02em; }
  .welcome-subtitle { font-size: 0.9rem; }

  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .metric-card  { padding: 12px 12px; gap: 8px; }
  .metric-icon  { width: 36px; height: 36px; border-radius: 8px; }
  .metric-label { font-size: 10px; }
  .metric-value { font-size: 20px; }
  .metric-arrow { display: none; }

  .modules-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
  .module-card  { height: 160px; }
  .module-content { padding: 14px; }
  .text-info h3 { font-size: 1rem; }
  .text-info p  { font-size: 0.78rem; }
}

/* Mobile muy chico */
@media (max-width: 360px) {
  .metrics-grid { grid-template-columns: 1fr 1fr; gap: 6px; }
  .modules-grid { grid-template-columns: 1fr; }
  .module-card  { height: 150px; }
}
</style>