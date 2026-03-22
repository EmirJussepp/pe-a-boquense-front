<template>
  <div class="layout">
    <aside
      class="sidebar"
      :class="{ 'is-collapsed': sidebarCollapsed }"
      @mouseenter="sidebarCollapsed = false"
      @mouseleave="sidebarCollapsed = true"
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

          <!-- Socios: admin y cobrador -->
          <div class="nav-group" v-if="auth.puedeVerSocios">
            <button class="nav-item" @click.stop="handleGroupClick('socios')">
              <div class="nav-item-left">
                <div class="nav-icon-box"><Users :size="20" /></div>
                <span class="nav-text" v-if="!sidebarCollapsed">Socios</span>
              </div>
              <ChevronDown
                v-if="!sidebarCollapsed"
                :size="14"
                :class="{ rotate: openSubmenus.socios }"
              />
            </button>
            <div v-if="openSubmenus.socios && !sidebarCollapsed" class="submenu">
              <RouterLink to="/socios/activos" class="submenu-item">Activos</RouterLink>
              <RouterLink to="/socios/baja" class="submenu-item">Bajas</RouterLink>
              <!-- Importar y nuevo solo para admin -->
              <template v-if="auth.isAdmin">
                <RouterLink to="/socios/nuevo" class="submenu-item">Nuevo socio</RouterLink>
                <RouterLink to="/socios/importar-excel" class="submenu-item">Importar Excel</RouterLink>
              </template>
            </div>
          </div>

          <!-- Cuotas: admin y cobrador -->
          <div class="nav-group" v-if="auth.puedeVerCuotas">
            <button class="nav-item" @click.stop="handleGroupClick('cuotas')">
              <div class="nav-item-left">
                <div class="nav-icon-box"><CreditCard :size="20" /></div>
                <span class="nav-text" v-if="!sidebarCollapsed">Cuotas</span>
              </div>
              <ChevronDown
                v-if="!sidebarCollapsed"
                :size="14"
                :class="{ rotate: openSubmenus.cuotas }"
              />
            </button>
            <div v-if="openSubmenus.cuotas && !sidebarCollapsed" class="submenu">
              <RouterLink to="/cuotas/cobranzas" class="submenu-item">Cobranzas</RouterLink>
              <RouterLink v-if="auth.isAdmin" to="/cuotas/reportes" class="submenu-item">Reportes</RouterLink>
            </div>
          </div>

          <!-- Movimientos: solo admin -->
          <div class="nav-group" v-if="auth.puedeVerMovimientos">
            <button class="nav-item" @click.stop="handleGroupClick('movimientos')">
              <div class="nav-item-left">
                <div class="nav-icon-box"><ArrowLeftRight :size="20" /></div>
                <span class="nav-text" v-if="!sidebarCollapsed">Movimientos</span>
              </div>
              <ChevronDown
                v-if="!sidebarCollapsed"
                :size="14"
                :class="{ rotate: openSubmenus.movimientos }"
              />
            </button>
            <div v-if="openSubmenus.movimientos && !sidebarCollapsed" class="submenu">
              <RouterLink to="/movimientos" class="submenu-item">Listado</RouterLink>
              <RouterLink to="/movimientos/reportes" class="submenu-item">Reporte</RouterLink>
            </div>
          </div>

          <!-- Viajes: admin y rol viajes -->
          <RouterLink v-if="auth.puedeVerViajes" to="/viajes" class="nav-item">
            <div class="nav-item-left">
              <div class="nav-icon-box"><Plane :size="20" /></div>
              <span class="nav-text" v-if="!sidebarCollapsed">Viajes</span>
            </div>
          </RouterLink>

          <!-- Beneficios: admin, viajes y alquileres -->
          <RouterLink v-if="auth.puedeVerBeneficios" to="/beneficios" class="nav-item">
            <div class="nav-item-left">
              <div class="nav-icon-box"><Gift :size="20" /></div>
              <span class="nav-text" v-if="!sidebarCollapsed">Beneficios</span>
            </div>
          </RouterLink>

          <!-- Alquileres: admin y rol alquileres -->
          <div class="nav-group" v-if="auth.puedeVerAlquileres">
            <button class="nav-item" @click.stop="handleGroupClick('alquileres')">
              <div class="nav-item-left">
                <div class="nav-icon-box"><Key :size="20" /></div>
                <span class="nav-text" v-if="!sidebarCollapsed">Alquileres</span>
              </div>
              <ChevronDown
                v-if="!sidebarCollapsed"
                :size="14"
                :class="{ rotate: openSubmenus.alquileres }"
              />
            </button>
            <div v-if="openSubmenus.alquileres && !sidebarCollapsed" class="submenu">
              <RouterLink to="/alquileres" class="submenu-item">Listado</RouterLink>
              <RouterLink to="/alquileres/calendario" class="submenu-item">Calendario</RouterLink>
            </div>
          </div>
        </nav>

        <div class="sidebar-footer">
          <!-- Configuración: solo admin -->
          <RouterLink v-if="auth.isAdmin" to="/configuracion" class="nav-item">
            <div class="nav-item-left">
              <div class="nav-icon-box"><Settings :size="20" /></div>
              <span class="nav-text" v-if="!sidebarCollapsed">Configuración</span>
            </div>
          </RouterLink>

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
import { ref, watch } from "vue"
import { useAuthStore } from "../../stores/auth"
import { useRouter, useRoute } from "vue-router"
import logoChico from "../../assets/logochico.png"
import {
  LayoutDashboard,
  Users,
  CreditCard,
  ArrowLeftRight,
  Key,
  Gift,
  Plane,
  ChevronDown,
  LogOut,
  Settings,
} from "lucide-vue-next"

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const sidebarCollapsed = ref(true)

const initialSubmenus = () => ({
  socios: false,
  cuotas: false,
  movimientos: false,
  alquileres: false,
})

const openSubmenus = ref(initialSubmenus())

const logout = () => {
  auth.logout()
  router.push("/login")
}

watch(
  () => route.path,
  () => {
    sidebarCollapsed.value = true
    openSubmenus.value = initialSubmenus()
  },
)

function handleGroupClick(menu) {
  if (sidebarCollapsed.value) {
    sidebarCollapsed.value = false
    openSubmenus.value[menu] = true
    return
  }
  openSubmenus.value[menu] = !openSubmenus.value[menu]
}
</script>

<style scoped>
.layout {
  display: flex;
  width: 100vw;
  height: 100vh;
  background-color: var(--bg);
  overflow: hidden;
}

.sidebar {
  width: 260px;
  height: 100vh;
  background: var(--primary);
  border-right: 1px solid rgba(0, 0, 0, 0.05);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 50;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}

.sidebar.is-collapsed {
  width: 80px;
  cursor: pointer;
}

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
  background: #f1b44c;
  min-width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-logo {
  width: 20px;
  height: 20px;
}

.brand-name {
  color: #fff;
  font-size: 1rem;
  font-weight: 700;
  white-space: nowrap;
}

.nav-container {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-item,
.logout-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  border-radius: 12px;
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
  min-width: 0;
}

.nav-icon-box {
  min-width: 36px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--accent);
}

.nav-text {
  white-space: nowrap;
  font-size: 0.95rem;
}

.nav-item:hover,
.router-link-active {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.submenu {
  margin-left: 48px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-top: 5px;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  padding-left: 12px;
}

.submenu-item {
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  font-size: 0.85rem;
  padding: 5px 0;
  transition: 0.2s;
}

.submenu-item:hover,
.submenu-item.router-link-active {
  color: #f1b44c;
}

.sidebar-footer {
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.logout-item:hover {
  background: rgba(255, 75, 75, 0.2);
  color: #ff8a8a;
}

.main-wrapper {
  flex-grow: 1;
  min-width: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg);
}

.content-viewport {
  flex-grow: 1;
  overflow-y: auto;
  transition: all 0.3s ease;
}

.rotate {
  transform: rotate(180deg);
}
</style>