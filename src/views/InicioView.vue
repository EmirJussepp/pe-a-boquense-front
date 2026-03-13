<template>
  <div class="dashboard-page">
    
    <header class="welcome-section">
    
      <h1 class="welcome-title">
        ¡Bienvenido, <span>{{ auth.nombre.split(' ')[0] || 'Usuario' }}</span>!
      </h1>
      <p class="welcome-subtitle">
        Gestiona socios, cuotas, viajes y alquileres de la <span class="brand-text">Peña Boquense</span> desde este panel centralizado.
      </p>
    </header>

    <section class="modules-section">
      <h2 class="section-label">Accesos Directos</h2>
      
      <div class="modules-grid">
        <div 
          v-for="mod in modulos" 
          :key="mod.title" 
          class="module-card glass-card"
          @click="goTo(mod.path)"
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
import { useRouter } from "vue-router"
import { useAuthStore } from "../stores/auth"

const router = useRouter()
const auth = useAuthStore()

const modulos = [
  { title: 'Socios', path: '/socios/activos', desc: 'Gestión miembros', img: 'src/assets/sociospeña.jpg' },
  { title: 'Cuotas', path: '/cuotas/cobranzas', desc: 'Control pagos', img: 'src/assets/cuotaspeña.jpg' },
  { title: 'Viajes', path: '/viajes', desc: 'Organizar traslados', img: 'src/assets/viajespeña.jpg' },
  { title: 'Alquileres', path: '/alquileres/calendario', desc: 'Reservas predio', img: 'src/assets/peñaalquiler.jpg' },
]

function goTo(path) {
  router.push(path)
}
</script>

<style scoped>
.dashboard-page {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  /* CAMBIO: Reducimos el padding superior al mínimo */
  padding: 0px 20px 20px 20px; 
}

/* --- SOLO CENTRALIZAMOS ESTA PARTE --- */
.welcome-section {
  /* CAMBIO: Reducimos margen inferior y nos aseguramos que no tenga margen superior */
  margin-top: 0;
  margin-bottom: 30px;
  padding-top: 10px; /* Ajusta este valor si quieres que suba aún más */
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.welcome-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 900;
  /* CAMBIO: Quitamos margen superior para que pegue arriba */
  margin-top: 0; 
  margin-bottom: 5px;
  letter-spacing: -0.03em;
  color: var(--primary);
}

.welcome-subtitle {
  color: var(--text-soft);
  font-size: 1.25rem;
  max-width: 800px;
  line-height: 1.4; /* Un poco más compacto */
  margin-top: 0;
}

/* --- EL RESTO SE MANTIENE IGUAL PARA NO ROMPER NADA --- */
.section-label {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  margin-bottom: 30px;
  color: var(--text-muted);
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 15px;
}

.section-label::after {
  content: "";
  height: 1px;
  flex-grow: 1;
  background: var(--border-strong);
}

.modules-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr); 
  gap: 20px;
}

.module-card {
  position: relative;
  height: 280px; 
  border-radius: var(--radius);
  overflow: hidden;
  border: 1px solid var(--border);
  transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
  cursor: pointer;
}

.card-image-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  transition: transform 0.8s ease;
}

.card-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom, 
    rgba(0, 59, 122, 0.1) 0%, 
    rgba(0, 59, 122, 0.85) 200%
  );
}

.module-card:hover {
  transform: translateY(-8px);
  border-color: var(--accent);
  box-shadow: 0 15px 35px rgba(0, 59, 122, 0.2);
}

.module-card:hover .card-image-bg {
  transform: scale(1.1);
}

.module-content {
  position: relative;
  z-index: 2;
  padding: 20px;
  height: 100%;
  display: flex;
  align-items: flex-end;
}

.text-info h3 {
  font-size: 1.5rem;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 4px;
}

.text-info p {
  font-size: 0.9rem;
  color: var(--accent);
  font-weight: 600;
}

.hover-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 6px;
  background: var(--accent);
  transition: width 0.4s ease;
}

.module-card:hover .hover-indicator {
  width: 100%;
}

@media (max-width: 1024px) {
  .modules-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .modules-grid {
    grid-template-columns: 1fr;
  }
  .welcome-title { font-size: 2rem; }
}
</style>