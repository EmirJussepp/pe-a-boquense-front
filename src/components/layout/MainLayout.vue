<template>
  <div class="layout">
    <!-- Sidebar desktop -->
    <aside class="sidebar desktop-sidebar">
      <div class="brand">
        <img :src="logoChico" alt="Logo" class="brand-logo" />
        <div>
          <strong>GestionaTuPeña</strong>
          <span>Sistema administrativo</span>
        </div>
      </div>

      <nav class="nav">
        <RouterLink to="/inicio" class="nav-link">Inicio</RouterLink>

        <div class="nav-group">
          <button class="nav-collapse" @click="toggleMenu('socios')">
            <span>Socios</span>
            <span class="arrow" :class="{ open: openMenus.socios }">▾</span>
          </button>

          <div v-show="openMenus.socios" class="nav-submenu">
            <RouterLink to="/socios/activos" class="nav-link">Activos</RouterLink>
            <RouterLink to="/socios/baja" class="nav-link">Dados de baja</RouterLink>
          </div>
        </div>

        <div class="nav-group">
          <button class="nav-collapse" @click="toggleMenu('cuotas')">
            <span>Cuotas</span>
            <span class="arrow" :class="{ open: openMenus.cuotas }">▾</span>
          </button>

          <div v-show="openMenus.cuotas" class="nav-submenu">
            <RouterLink to="/cuotas/pendientes" class="nav-link">Pendientes</RouterLink>
            <RouterLink to="/cuotas/reportes" class="nav-link">Reportes</RouterLink>
          </div>
        </div>

        <RouterLink to="/movimientos" class="nav-link">Movimientos</RouterLink>
        <RouterLink to="/beneficios" class="nav-link">Beneficios</RouterLink>

        <div class="nav-group">
          <button class="nav-collapse" @click="toggleMenu('viajes')">
            <span>Viajes</span>
            <span class="arrow" :class="{ open: openMenus.viajes }">▾</span>
          </button>

          <div v-show="openMenus.viajes" class="nav-submenu">
            <RouterLink to="/viajes" class="nav-link">Ver viajes</RouterLink>
            <RouterLink to="/viajes/nuevo" class="nav-link">Crear viaje</RouterLink>
          </div>
        </div>

        <div class="nav-group">
          <button class="nav-collapse" @click="toggleMenu('alquileres')">
            <span>Alquileres</span>
            <span class="arrow" :class="{ open: openMenus.alquileres }">▾</span>
          </button>

          <div v-show="openMenus.alquileres" class="nav-submenu">
            <RouterLink to="/alquileres/calendario" class="nav-link">Calendario</RouterLink>
          </div>
        </div>
      </nav>
    </aside>

    <!-- Overlay mobile -->
    <transition name="fade">
      <div
        v-if="mobileMenuOpen"
        class="mobile-overlay"
        @click="closeMobileMenu"
      ></div>
    </transition>

    <!-- Sidebar mobile -->
    <transition name="slide">
      <aside v-if="mobileMenuOpen" class="sidebar mobile-sidebar">
        <div class="mobile-sidebar-top">
          <div class="brand">
            <img :src="logoChico" alt="Logo" class="brand-logo" />
            <div>
              <strong>GestionaTuPeña</strong>
              <span>Sistema administrativo</span>
            </div>
          </div>

          <button class="icon-btn" @click="closeMobileMenu">✕</button>
        </div>

        <nav class="nav">
          <RouterLink to="/inicio" class="nav-link" @click="closeMobileMenu">
            Inicio
          </RouterLink>

          <div class="nav-group">
            <button class="nav-collapse" @click="toggleMenu('socios')">
              <span>Socios</span>
              <span class="arrow" :class="{ open: openMenus.socios }">▾</span>
            </button>

            <div v-show="openMenus.socios" class="nav-submenu">
              <RouterLink to="/socios/activos" class="nav-link" @click="closeMobileMenu">
                Activos
              </RouterLink>
              <RouterLink to="/socios/baja" class="nav-link" @click="closeMobileMenu">
                Dados de baja
              </RouterLink>
            </div>
          </div>

          <div class="nav-group">
            <button class="nav-collapse" @click="toggleMenu('cuotas')">
              <span>Cuotas</span>
              <span class="arrow" :class="{ open: openMenus.cuotas }">▾</span>
            </button>

            <div v-show="openMenus.cuotas" class="nav-submenu">
              <RouterLink to="/cuotas/pendientes" class="nav-link" @click="closeMobileMenu">
                Pendientes
              </RouterLink>
              <RouterLink to="/cuotas/reportes" class="nav-link" @click="closeMobileMenu">
                Reportes
              </RouterLink>
            </div>
          </div>

          <RouterLink to="/movimientos" class="nav-link" @click="closeMobileMenu">
            Movimientos
          </RouterLink>

          <RouterLink to="/beneficios" class="nav-link" @click="closeMobileMenu">
            Beneficios
          </RouterLink>

          <div class="nav-group">
            <button class="nav-collapse" @click="toggleMenu('viajes')">
              <span>Viajes</span>
              <span class="arrow" :class="{ open: openMenus.viajes }">▾</span>
            </button>

            <div v-show="openMenus.viajes" class="nav-submenu">
              <RouterLink to="/viajes" class="nav-link" @click="closeMobileMenu">
                Ver viajes
              </RouterLink>
              <RouterLink to="/viajes/nuevo" class="nav-link" @click="closeMobileMenu">
                Crear viaje
              </RouterLink>
            </div>
          </div>

          <div class="nav-group">
            <button class="nav-collapse" @click="toggleMenu('alquileres')">
              <span>Alquileres</span>
              <span class="arrow" :class="{ open: openMenus.alquileres }">▾</span>
            </button>

            <div v-show="openMenus.alquileres" class="nav-submenu">
              <RouterLink to="/alquileres/calendario" class="nav-link" @click="closeMobileMenu">
                Calendario
              </RouterLink>
            </div>
          </div>
        </nav>
      </aside>
    </transition>

    <!-- Main -->
    <div class="main">
      <header class="topbar">
        <div class="topbar-left">
          <button class="icon-btn mobile-only" @click="toggleMobileMenu">
            ☰
          </button>

          <div class="topbar-user">
            <strong>{{ auth.user?.nombre || auth.user?.email }}</strong>
            <span>{{ auth.user?.admin ? "Administrador" : "Usuario" }}</span>
          </div>
        </div>

        <button class="btn-danger" @click="logout">
          Salir
        </button>
      </header>

      <main class="content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { useAuthStore } from "../../stores/auth"
import { useRouter } from "vue-router"
import logoChico from "../../assets/logochico.png"

const auth = useAuthStore()
const router = useRouter()

const mobileMenuOpen = ref(false)

const openMenus = ref({
  socios: true,
  cuotas: false,
  viajes: false,
  alquileres: false,
})

function logout() {
  auth.logout()
  router.push("/login")
}

function toggleMobileMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

function closeMobileMenu() {
  mobileMenuOpen.value = false
}

function toggleMenu(menu) {
  openMenus.value[menu] = !openMenus.value[menu]
}
</script>

<style scoped>
.layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  min-height: 100vh;
}

.sidebar {
  background: rgba(9, 14, 28, 0.94);
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  padding: 18px 14px;
  z-index: 30;
}

.desktop-sidebar {
  display: block;
}

.mobile-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: min(84vw, 320px);
  height: 100vh;
  overflow-y: auto;
  box-shadow: 20px 0 50px rgba(0, 0, 0, 0.4);
}

.mobile-sidebar-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.mobile-overlay {
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.6);
  z-index: 20;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 10px 18px;
  margin-bottom: 8px;
}

.brand-logo {
  width: 28px;
  height: 28px;
  object-fit: contain;
  border-radius: 8px;
}

.brand strong {
  display: block;
  font-size: 0.98rem;
}

.brand span {
  font-size: 0.78rem;
  color: var(--text-muted);
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.nav-group {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.nav-link {
  display: flex;
  align-items: center;
  min-height: 42px;
  padding: 0 12px;
  border-radius: 12px;
  color: var(--text-soft);
  transition: 0.18s ease;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.04);
  color: white;
}

.nav-collapse {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: var(--text-soft);
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: 0.18s ease;
}

.nav-collapse:hover {
  background: rgba(255, 255, 255, 0.04);
  color: white;
}

.nav-submenu {
  display: flex;
  flex-direction: column;
  padding-left: 10px;
}

.arrow {
  transition: transform 0.2s ease;
}

.arrow.open {
  transform: rotate(180deg);
}

.router-link-active {
  background: var(--primary-soft);
  color: #ddd6fe;
  border: 1px solid rgba(139, 92, 246, 0.18);
}

.main {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.topbar {
  height: 64px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(11, 16, 32, 0.72);
  backdrop-filter: blur(10px);
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.topbar-user {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.topbar-user strong {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.topbar-user span {
  color: var(--text-muted);
  font-size: 0.9rem;
  white-space: nowrap;
}

.content {
  padding: 24px;
  min-width: 0;
}

.icon-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.03);
  color: var(--text);
  cursor: pointer;
  display: grid;
  place-items: center;
}

.mobile-only {
  display: none;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.22s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}

@media (max-width: 980px) {
  .layout {
    grid-template-columns: 1fr;
  }

  .desktop-sidebar {
    display: none;
  }

  .mobile-only {
    display: grid;
  }

  .topbar {
    padding: 0 14px;
  }

  .content {
    padding: 18px;
  }
}

@media (max-width: 640px) {
  .topbar-user {
    gap: 6px;
  }

  .topbar-user span {
    display: none;
  }

  .content {
    padding: 14px;
  }

  .btn-danger {
    padding-inline: 12px;
    height: 40px;
  }
}
</style>