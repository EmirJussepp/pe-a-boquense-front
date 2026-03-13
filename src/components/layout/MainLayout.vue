<template>
  <div class="layout">
    
    <transition name="fade">
      <div 
        v-if="!sidebarCollapsed" 
        class="sidebar-overlay" 
        @click="sidebarCollapsed = true"
      ></div>
    </transition>

    <aside 
      class="sidebar" 
      :class="{ 'is-collapsed': sidebarCollapsed }"
      @click="sidebarCollapsed && (sidebarCollapsed = false)"
    >
      <div class="sidebar-inner">
        <div class="brand">
          <div class="logo-wrapper">
            <img :src="logoChico" alt="Logo" class="brand-logo" />
          </div>
          <div class="brand-text" v-if="!sidebarCollapsed">
            <strong class="brand-name">GestionaTuPeña</strong>
          </div>
        </div>

        <nav class="nav-container">
          
          <RouterLink to="/inicio" class="nav-item">
            <div class="nav-item-left">
              <div class="nav-icon-box"><LayoutDashboard :size="20" /></div>
              <span class="nav-text" v-if="!sidebarCollapsed">Inicio</span>
            </div>
          </RouterLink>

          <div class="nav-group">
            <button class="nav-item" @click.stop="handleGroupClick('socios')">
              <div class="nav-item-left">
                <div class="nav-icon-box"><Users :size="20" /></div>
                <span class="nav-text" v-if="!sidebarCollapsed">Socios</span>
              </div>
              <ChevronDown v-if="!sidebarCollapsed" :size="14" :class="{ rotate: openSubmenus.socios }" />
            </button>
            <div v-if="openSubmenus.socios && !sidebarCollapsed" class="submenu">
              <RouterLink to="/socios/activos" class="submenu-item">Activos</RouterLink>
              <RouterLink to="/socios/baja" class="submenu-item">Bajas</RouterLink>
            </div>
          </div>

          <div class="nav-group">
            <button class="nav-item" @click.stop="handleGroupClick('cuotas')">
              <div class="nav-item-left">
                <div class="nav-icon-box"><CreditCard :size="20" /></div>
                <span class="nav-text" v-if="!sidebarCollapsed">Cuotas</span>
              </div>
              <ChevronDown v-if="!sidebarCollapsed" :size="14" :class="{ rotate: openSubmenus.cuotas }" />
            </button>
            <div v-if="openSubmenus.cuotas && !sidebarCollapsed" class="submenu">
              <RouterLink to="/cuotas/cobranzas" class="submenu-item">Cobranzas</RouterLink>
              <RouterLink to="/cuotas/reportes" class="submenu-item">Reportes</RouterLink>
            </div>
          </div>

          <RouterLink to="/movimientos" class="nav-item">
            <div class="nav-item-left">
              <div class="nav-icon-box"><ArrowLeftRight :size="20" /></div>
              <span class="nav-text" v-if="!sidebarCollapsed">Movimientos</span>
            </div>
          </RouterLink>

          <RouterLink to="/alquileres" class="nav-item">
            <div class="nav-item-left">
              <div class="nav-icon-box"><Key :size="20" /></div>
              <span class="nav-text" v-if="!sidebarCollapsed">Alquileres</span>
            </div>
          </RouterLink>
        </nav>

        <div class="sidebar-footer">
          <button class="logout-item" @click.stop="logout">
            <div class="nav-item-left">
              <div class="nav-icon-box"><LogOut :size="20" /></div>
              <span v-if="!sidebarCollapsed">Cerrar Sesión</span>
            </div>
          </button>
        </div>
      </div>
    </aside>

    <main class="main-wrapper">
      <div class="content-viewport">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { useAuthStore } from "../../stores/auth"
import { useRouter } from "vue-router"
import logoChico from "../../assets/logochico.png"
import { 
  LayoutDashboard, Users, CreditCard, ArrowLeftRight, Key, 
  ChevronDown, LogOut 
} from 'lucide-vue-next'

const auth = useAuthStore()
const router = useRouter()

// Estados de la interfaz
const sidebarCollapsed = ref(true)
const openSubmenus = ref({ socios: false, cuotas: false })

const logout = () => { auth.logout(); router.push("/login") }

// Lógica de apertura de grupos
function handleGroupClick(menu) {
  if (sidebarCollapsed.value) {
    sidebarCollapsed.value = false
    openSubmenus.value[menu] = true
  } else {
    openSubmenus.value[menu] = !openSubmenus.value[menu]
  }
}
</script>

<style scoped>
.layout {
  display: flex;
  width: 100vw;
  height: 100vh;
  /* CAMBIO: De #05070a a blanco/gris claro */
  background-color: var(--bg); 
  overflow: hidden;
}

/* Overlay para cerrar al hacer clic fuera */
.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.2); /* CAMBIO: Más suave para fondo claro */
  backdrop-filter: blur(2px);
  z-index: 40;
}

.sidebar {
  width: 260px;
  height: 100vh;
  /* CAMBIO: De #0b0d14 al Azul de Boca oficial */
  background: var(--primary);
  border-right: 1px solid rgba(0, 0, 0, 0.05);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 50;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}
.sidebar.is-collapsed { width: 80px; cursor: pointer; }

.sidebar-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 24px 14px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 40px;
  padding: 0 10px;
  height: 40px;
}

.logo-wrapper {
  background: #f1b44c; /* Se mantiene Oro */
  min-width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-logo { width: 20px; height: 20px; }
/* CAMBIO: Texto blanco sobre el azul de la sidebar */
.brand-name { color: #fff; font-size: 1rem; font-weight: 700; white-space: nowrap; }

.nav-container { flex-grow: 1; display: flex; flex-direction: column; gap: 8px; }

/* Items de Navegación */
.nav-item, .logout-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  border-radius: 12px;
  /* CAMBIO: Texto blanco semi-transparente sobre azul */
  color: rgba(255, 255, 255, 0.7); 
  text-decoration: none;
  background: transparent;
  border: none;
  width: 100%;
  cursor: pointer;
  transition: 0.2s;
}

.nav-item-left { 
  display: flex; 
  align-items: center; 
  gap: 12px; 
  flex-grow: 1;
}

.nav-icon-box {
  min-width: 36px;
  display: flex;
  justify-content: center;
  align-items: center;
  /* CAMBIO: Iconos en Oro para resaltar sobre azul */
  color: var(--accent); 
}

.nav-text { white-space: nowrap; font-size: 0.95rem; }

.nav-item:hover, .router-link-active {
  /* CAMBIO: Fondo sutil blanco para el hover sobre azul */
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

/* Submenús */
.submenu {
  margin-left: 48px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-top: 5px;
  /* CAMBIO: Línea sutil blanca */
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  padding-left: 12px;
}

.submenu-item {
  /* CAMBIO: Texto suave sobre azul */
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  font-size: 0.85rem;
  padding: 5px 0;
  transition: 0.2s;
}

.submenu-item:hover { color: #f1b44c; }

/* Footer */
.sidebar-footer {
  margin-top: auto;
  padding-top: 20px;
  /* CAMBIO: Línea sutil blanca */
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.logout-item:hover {
  background: rgba(255, 75, 75, 0.2);
  color: #ff8a8a;
}

/* Transiciones y Contenido */
.main-wrapper {
  flex-grow: 1;
  min-width: 0; 
  height: 100vh;
  display: flex;
  flex-direction: column;
  /* CAMBIO: Fondo claro para el área de contenido */
  background-color: var(--bg);
}

.content-viewport {
  flex-grow: 1;
  overflow-y: auto;
  padding: 40px;
  transition: all 0.3s ease; 
}

.rotate { transform: rotate(180deg); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>