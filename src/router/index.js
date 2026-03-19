import { createRouter, createWebHistory } from "vue-router"
import { isLoggedIn, getUser } from "../auth/session"
import { hasAnyPermission } from "../auth/permissions"
import { useToast } from "../composables/useToast"

import LoginView from "../views/LoginView.vue"
import MainLayout from "../components/layout/MainLayout.vue"
import InicioView from "../views/InicioView.vue"
import SociosActivosView from "../views/socios/SociosActivosView.vue"
import SociosBajaView from "../views/socios/SociosBajaView.vue"
import SocioFormView from "../views/socios/SocioFormView.vue"
import CobranzasView from "../views/cuotas/CobranzasView.vue"
import SocioDetalleView from "../views/socios/SocioDetalleView.vue"

const routes = [
  {
    path: "/login",
    component: LoginView,
    meta: { public: true },
  },
  {
    path: "/",
    component: MainLayout,
    children: [
      { path: "", redirect: "/inicio" },
      { path: "inicio", component: InicioView },

      // ── Socios ──────────────────────────────────────────
      { path: "socios/activos",        component: SociosActivosView, meta: { perms: ["socios:ver"] } },
      { path: "socios/baja",           component: SociosBajaView,    meta: { perms: ["socios:ver"] } },
      { path: "socios/nuevo",          component: SocioFormView,     meta: { perms: ["socios:gestionar"] } },
      { path: "socios/:id/editar",     component: SocioFormView,     meta: { perms: ["socios:gestionar"] } },
      { path: "socios/:id",            component: SocioDetalleView,  meta: { perms: ["socios:ver"] } },
      {
        path: "socios/importar-excel",
        component: () => import("../views/socios/ImportarSociosExcelView.vue"),
        meta: { perms: ["socios:gestionar"] },
      },

      // ── Cuotas ──────────────────────────────────────────
      { path: "cuotas/cobranzas", component: CobranzasView, meta: { perms: ["cuotas:ver"] } },
      {
        path: "cuotas/reportes",
        name: "cuotas-reportes",
        component: () => import("../views/cuotas/CuotasReportesView.vue"),
        meta: { perms: ["cuotas:ver"] },
      },

      // ── Viajes ──────────────────────────────────────────
      { path: "viajes",            name: "viajes",        component: () => import("../views/viajes/ViajesView.vue"),        meta: { perms: ["viajes:ver"] } },
      { path: "viajes/nuevo",      name: "viajes-nuevo",  component: () => import("../views/viajes/ViajesFormView.vue"),    meta: { perms: ["viajes:gestionar"] } },
      { path: "viajes/:id/editar", name: "viajes-editar", component: () => import("../views/viajes/ViajesFormView.vue"),    meta: { perms: ["viajes:gestionar"] } },
      { path: "viajes/:id/pago",   name: "viajes-pago",   component: () => import("../views/viajes/ViajePagoFormView.vue"), meta: { perms: ["viajes:gestionar"] } },

      // ── Beneficios ──────────────────────────────────────
      { path: "beneficios", name: "beneficios", component: () => import("../views/beneficios/BeneficiosView.vue"), meta: { perms: ["beneficios:ver"] } },

      // ── Movimientos ─────────────────────────────────────
      { path: "movimientos",           name: "movimientos",          component: () => import("../views/movimientos/MovimientosView.vue"),        meta: { perms: ["movimientos:ver"] } },
      { path: "movimientos/reportes",  name: "movimientos-reportes", component: () => import("../views/movimientos/MovimientosReporteView.vue"), meta: { perms: ["movimientos:ver"] } },
      { path: "movimientos/nuevo",     name: "movimientos-nuevo",    component: () => import("../views/movimientos/MovimientosFormView.vue"),    meta: { perms: ["movimientos:gestionar"] } },

      // ── Configuración ───────────────────────────────────
      { path: "configuracion", name: "configuracion", component: () => import("../views/ConfiguracionView.vue"), meta: { perms: ["*"] } },

      // ── Alquileres ──────────────────────────────────────
      { path: "alquileres",            name: "alquileres",           component: () => import("../views/alquileres/AlquileresView.vue"),           meta: { perms: ["alquileres:ver"] } },
      { path: "alquileres/calendario", name: "alquileres-calendario",component: () => import("../views/alquileres/Alquilerescalendarioview.vue"), meta: { perms: ["alquileres:ver"] } },
      { path: "alquileres/nuevo",      name: "alquileres-nuevo",     component: () => import("../views/alquileres/AlquileresFormView.vue"),       meta: { perms: ["alquileres:gestionar"] } },
      { path: "alquileres/:id/editar", name: "alquileres-editar",    component: () => import("../views/alquileres/AlquileresFormView.vue"),       meta: { perms: ["alquileres:gestionar"] } },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const logged = isLoggedIn()

  if (!to.meta?.public && !logged) return "/login"
  if (to.path === "/login" && logged) return "/inicio"

  if (to.meta?.perms) {
    const user = getUser()
    const allowed = hasAnyPermission(user, to.meta.perms)
    if (!allowed) {
      const { error } = useToast()
      error("No tenés permiso para acceder a esa sección.")
      return false // cancela la navegación, el usuario se queda donde está
    }
  }
})

export default router