<template>
  <div class="layout">

    <!-- Overlay mobile -->
    <div
      v-if="mobileOpen"
      class="mobile-overlay"
      @click="mobileOpen = false"
    />

    <aside
      class="sidebar"
      :class="{ 'is-collapsed': sidebarCollapsed, 'mobile-open': mobileOpen }"
      @mouseenter="!isMobile && (sidebarCollapsed = false)"
      @mouseleave="!isMobile && (sidebarCollapsed = true)"
    >
      <div class="sidebar-inner">
        <div class="brand">
          <div v-if="!sidebarCollapsed || mobileOpen" class="brand-text">
            <span class="brand-peña">PEÑA</span>
            <span class="brand-boquense">BOQUENSE</span>
            <span class="brand-san-francisco">SAN FRANCISCO</span>
          </div>
          <div v-else class="brand-icon">PB</div>
        </div>

        <nav class="nav-container">
          <RouterLink to="/inicio" class="nav-item" @click="mobileOpen = false">
            <div class="nav-item-left">
              <div class="nav-icon-box"><LayoutDashboard :size="20" /></div>
              <span class="nav-text" v-if="!sidebarCollapsed || mobileOpen">Inicio</span>
            </div>
          </RouterLink>

          <!-- Socios -->
          <div class="nav-group" v-if="auth.puedeVerSocios">
            <button class="nav-item" @click.stop="handleGroupClick('socios')">
              <div class="nav-item-left">
                <div class="nav-icon-box"><Users :size="20" /></div>
                <span class="nav-text" v-if="!sidebarCollapsed || mobileOpen">Socios</span>
              </div>
              <ChevronDown
                v-if="!sidebarCollapsed || mobileOpen"
                :size="14"
                :class="{ rotate: openSubmenus.socios }"
              />
            </button>
            <div v-if="openSubmenus.socios && (!sidebarCollapsed || mobileOpen)" class="submenu">
              <RouterLink to="/socios/activos" class="submenu-item" @click="mobileOpen = false">Activos</RouterLink>
              <RouterLink to="/socios/baja" class="submenu-item" @click="mobileOpen = false">Bajas</RouterLink>
              <template v-if="auth.isAdmin">
                <RouterLink to="/socios/nuevo" class="submenu-item" @click="mobileOpen = false">Nuevo socio</RouterLink>
                <RouterLink to="/socios/importar-excel" class="submenu-item" @click="mobileOpen = false">Importar Excel</RouterLink>
              </template>
            </div>
          </div>

          <!-- Cuotas -->
          <div class="nav-group" v-if="auth.puedeVerCuotas">
            <button class="nav-item" @click.stop="handleGroupClick('cuotas')">
              <div class="nav-item-left">
                <div class="nav-icon-box"><CreditCard :size="20" /></div>
                <span class="nav-text" v-if="!sidebarCollapsed || mobileOpen">Cuotas</span>
              </div>
              <ChevronDown
                v-if="!sidebarCollapsed || mobileOpen"
                :size="14"
                :class="{ rotate: openSubmenus.cuotas }"
              />
            </button>
            <div v-if="openSubmenus.cuotas && (!sidebarCollapsed || mobileOpen)" class="submenu">
              <RouterLink to="/cuotas/cobranzas" class="submenu-item" @click="mobileOpen = false">Cobranzas</RouterLink>
              <RouterLink v-if="auth.isAdmin" to="/cuotas/reportes" class="submenu-item" @click="mobileOpen = false">Reportes</RouterLink>
            </div>
          </div>

          <!-- Movimientos -->
          <div class="nav-group" v-if="auth.puedeVerMovimientos">
            <button class="nav-item" @click.stop="handleGroupClick('movimientos')">
              <div class="nav-item-left">
                <div class="nav-icon-box"><ArrowLeftRight :size="20" /></div>
                <span class="nav-text" v-if="!sidebarCollapsed || mobileOpen">Movimientos</span>
              </div>
              <ChevronDown
                v-if="!sidebarCollapsed || mobileOpen"
                :size="14"
                :class="{ rotate: openSubmenus.movimientos }"
              />
            </button>
            <div v-if="openSubmenus.movimientos && (!sidebarCollapsed || mobileOpen)" class="submenu">
              <RouterLink to="/movimientos" class="submenu-item" @click="mobileOpen = false">Listado</RouterLink>
              <RouterLink to="/movimientos/reportes" class="submenu-item" @click="mobileOpen = false">Reporte</RouterLink>
            </div>
          </div>

          <!-- Viajes -->
          <RouterLink v-if="auth.puedeVerViajes" to="/viajes" class="nav-item" @click="mobileOpen = false">
            <div class="nav-item-left">
              <div class="nav-icon-box"><Plane :size="20" /></div>
              <span class="nav-text" v-if="!sidebarCollapsed || mobileOpen">Viajes</span>
            </div>
          </RouterLink>

          <!-- Beneficios -->
          <RouterLink v-if="auth.puedeVerBeneficios" to="/beneficios" class="nav-item" @click="mobileOpen = false">
            <div class="nav-item-left">
              <div class="nav-icon-box"><Gift :size="20" /></div>
              <span class="nav-text" v-if="!sidebarCollapsed || mobileOpen">Beneficios</span>
            </div>
          </RouterLink>

          <!-- Alquileres -->
          <div class="nav-group" v-if="auth.puedeVerAlquileres">
            <button class="nav-item" @click.stop="handleGroupClick('alquileres')">
              <div class="nav-item-left">
                <div class="nav-icon-box"><Key :size="20" /></div>
                <span class="nav-text" v-if="!sidebarCollapsed || mobileOpen">Alquileres</span>
              </div>
              <ChevronDown
                v-if="!sidebarCollapsed || mobileOpen"
                :size="14"
                :class="{ rotate: openSubmenus.alquileres }"
              />
            </button>
            <div v-if="openSubmenus.alquileres && (!sidebarCollapsed || mobileOpen)" class="submenu">
              <RouterLink to="/alquileres" class="submenu-item" @click="mobileOpen = false">Listado</RouterLink>
              <RouterLink to="/alquileres/calendario" class="submenu-item" @click="mobileOpen = false">Calendario</RouterLink>
            </div>
          </div>
        </nav>

        <div class="sidebar-footer">
          <RouterLink v-if="auth.isAdmin" to="/configuracion" class="nav-item" @click="mobileOpen = false">
            <div class="nav-item-left">
              <div class="nav-icon-box"><Settings :size="20" /></div>
              <span class="nav-text" v-if="!sidebarCollapsed || mobileOpen">Configuración</span>
            </div>
          </RouterLink>

          <button class="logout-item" @click.stop="logout">
            <div class="nav-item-left">
              <div class="nav-icon-box"><LogOut :size="20" /></div>
              <span v-if="!sidebarCollapsed || mobileOpen">Cerrar Sesión</span>
            </div>
          </button>
        </div>
      </div>
    </aside>

    <main class="main-wrapper">
      <div class="topbar">
        <!-- Hamburguesa solo en mobile -->
        <button class="hamburger" @click="mobileOpen = !mobileOpen" aria-label="Menú">
          <span /><span /><span />
        </button>
        <div class="topbar-end">
          <NotificationBell v-if="auth.puedeVerCuotas" />
        </div>
      </div>
      <div class="content-viewport">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from "vue"
import { useAuthStore } from "../../stores/auth"
import { useRouter, useRoute } from "vue-router"
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
import NotificationBell from "../notifications/NotificationBell.vue"

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const sidebarCollapsed = ref(true)
const mobileOpen = ref(false)
const isMobile = ref(false)

const MOBILE_BP = 768

function checkMobile() {
  isMobile.value = window.innerWidth <= MOBILE_BP
  if (!isMobile.value) mobileOpen.value = false
}

onMounted(() => {
  checkMobile()
  window.addEventListener("resize", checkMobile)
})

onUnmounted(() => {
  window.removeEventListener("resize", checkMobile)
})

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
    mobileOpen.value = false
    openSubmenus.value = initialSubmenus()
  },
)

function handleGroupClick(menu) {
  if (!isMobile.value && sidebarCollapsed.value) {
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

/* ── SIDEBAR ─────────────────────────────────────────── */
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

/* ── BRAND ───────────────────────────────────────────── */
.brand {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40px;
  padding: 0 10px;
  min-height: 44px;
}

.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1;
  gap: 2px;
}

.brand-peña {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.25em;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
}

.brand-boquense {
  font-size: 1.15rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  color: #f1b44c;
  text-transform: uppercase;
}

.brand-san-francisco {
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
}

.brand-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: rgba(241, 180, 76, 0.15);
  border: 1px solid rgba(241, 180, 76, 0.35);
  color: #f1b44c;
  font-size: 0.75rem;
  font-weight: 900;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ── NAV ─────────────────────────────────────────────── */
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

/* ── MAIN ────────────────────────────────────────────── */
.main-wrapper {
  flex-grow: 1;
  min-width: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg);
}

.topbar {
  height: 50px;
  flex-shrink: 0;
  background: var(--primary);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 16px;
}

.topbar-end {
  display: flex;
  align-items: center;
  gap: 8px;
}

.content-viewport {
  flex-grow: 1;
  overflow-y: auto;
  transition: all 0.3s ease;
}

.rotate { transform: rotate(180deg); }

/* ── HAMBURGUESA (oculta en desktop) ─────────────────── */
.hamburger {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 36px;
  height: 36px;
  padding: 6px;
  background: transparent;
  border: none;
  cursor: pointer;
  margin-right: auto;
  border-radius: 8px;
  transition: background 0.2s;
}
.hamburger:hover { background: rgba(255,255,255,0.1); }
.hamburger span {
  display: block;
  height: 2px;
  width: 100%;
  background: #fff;
  border-radius: 2px;
  transition: 0.2s;
}

/* ── MOBILE ──────────────────────────────────────────── */
@media (max-width: 768px) {
  /* Mostrar hamburguesa */
  .hamburger { display: flex; }

  /* Sidebar fuera de flujo, tipo drawer */
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 260px !important; /* siempre expandida cuando aparece */
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 200;
  }

  /* Al abrirse desliza desde la izquierda */
  .sidebar.mobile-open {
    transform: translateX(0);
  }

  /* Overlay oscuro detrás del drawer */
  .mobile-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    z-index: 199;
    backdrop-filter: blur(2px);
  }

  /* El main ocupa todo el ancho */
  .main-wrapper { width: 100vw; }
}
</style>