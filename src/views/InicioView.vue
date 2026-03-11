<template>
  <div class="inicio-page">
    <section class="welcome card">
      <div class="welcome-copy">
        <p class="eyebrow">Panel administrativo</p>
        <h1>Bienvenido al sistema Peña Boquense</h1>
        <p class="welcome-text">
          Gestioná socios, cuotas, cobranzas, viajes y alquileres desde una
          única plataforma moderna, clara y ordenada.
        </p>

        <div class="welcome-actions">
          <button class="btn-primary" @click="goTo('/socios/activos')">
            Ver socios
          </button>
          <button class="btn-secondary" @click="goTo('/cuotas/pendientes')">
            Ir a cuotas
          </button>
        </div>
      </div>

      <div class="welcome-side">
        <div class="mini-stat">
          <span class="mini-stat-label">Módulos</span>
          <strong>6</strong>
          <p>Socios, cuotas, viajes, alquileres y más.</p>
        </div>
      </div>
    </section>

    <section class="quick-grid">
      <article class="card quick-card" @click="goTo('/socios/activos')">
        <div class="quick-card-top">
          <span class="quick-badge">Socios</span>
        </div>
        <strong>Activos</strong>
        <p>Listado, edición, baja y reactivación de socios.</p>
      </article>

      <article class="card quick-card" @click="goTo('/cuotas/pendientes')">
        <div class="quick-card-top">
          <span class="quick-badge">Cuotas</span>
        </div>
        <strong>Pendientes</strong>
        <p>Control de cobranzas, pendientes y reportes.</p>
      </article>

      <article class="card quick-card" @click="goTo('/viajes')">
        <div class="quick-card-top">
          <span class="quick-badge">Viajes</span>
        </div>
        <strong>Organización</strong>
        <p>Creación, visualización y gestión de viajes.</p>
      </article>

      <article class="card quick-card" @click="goTo('/alquileres/calendario')">
        <div class="quick-card-top">
          <span class="quick-badge">Alquileres</span>
        </div>
        <strong>Calendario</strong>
        <p>Reservas, fechas y administración del salón.</p>
      </article>
    </section>

    <section class="summary-grid">
      <article class="card info-card">
        <p class="info-title">Socios</p>
        <strong>Gestión centralizada</strong>
        <span>
          Consultá activos, dados de baja y administrá sus datos desde un solo lugar.
        </span>
      </article>

      <article class="card info-card">
        <p class="info-title">Cuotas</p>
        <strong>Seguimiento de cobranzas</strong>
        <span>
          Visualizá pendientes, controlá cobradores y prepará futuros reportes.
        </span>
      </article>

      <article class="card info-card">
        <p class="info-title">Operación</p>
        <strong>Viajes y alquileres</strong>
        <span>
          Mantené organizadas las actividades y reservas con una interfaz clara.
        </span>
      </article>
    </section>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router"

const router = useRouter()

function goTo(path) {
  router.push(path)
}
</script>

<style scoped>
.inicio-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.welcome {
  padding: 24px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 240px;
  gap: 18px;
  align-items: stretch;
}

.welcome-copy {
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

.welcome h1 {
  margin: 0 0 10px;
  font-size: clamp(1.9rem, 4vw, 2.7rem);
  line-height: 1.08;
}

.welcome-text {
  margin: 0;
  max-width: 760px;
  color: var(--text-muted);
  line-height: 1.65;
  font-size: 1rem;
}

.welcome-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 18px;
}

.welcome-side {
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

.quick-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.quick-card {
  padding: 20px;
  cursor: pointer;
  transition: 0.18s ease;
}

.quick-card:hover {
  transform: translateY(-2px);
  border-color: rgba(139, 92, 246, 0.16);
}

.quick-card-top {
  margin-bottom: 14px;
}

.quick-badge {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(139, 92, 246, 0.1);
  color: #ddd6fe;
  font-size: 0.78rem;
  font-weight: 700;
}

.quick-card strong {
  display: block;
  font-size: 1.15rem;
  margin-bottom: 8px;
}

.quick-card p {
  margin: 0;
  color: var(--text-muted);
  line-height: 1.55;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.info-card {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-title {
  margin: 0;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  font-weight: 700;
}

.info-card strong {
  font-size: 1.05rem;
}

.info-card span {
  color: var(--text-muted);
  line-height: 1.55;
}

@media (max-width: 1200px) {
  .quick-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .welcome {
    grid-template-columns: 1fr;
  }

  .welcome-side {
    min-width: 0;
  }
}

@media (max-width: 640px) {
  .quick-grid {
    grid-template-columns: 1fr;
  }

  .welcome {
    padding: 20px;
  }

  .quick-card,
  .info-card {
    padding: 18px;
  }

  .welcome-actions {
    flex-direction: column;
  }

  .welcome-actions .btn-primary,
  .welcome-actions .btn-secondary {
    width: 100%;
  }
}
</style>