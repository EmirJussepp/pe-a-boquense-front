import { createRouter, createWebHistory } from "vue-router"
import { isLoggedIn } from "../auth/session"

import LoginView from "../views/LoginView.vue"
import MainLayout from "../components/layout/MainLayout.vue"
import InicioView from "../views/InicioView.vue"
import SociosActivosView from "../views/socios/SociosActivosView.vue"
import SociosBajaView from "../views/socios/SociosBajaView.vue"
import SocioFormView from "../views/socios/SocioFormView.vue"
import CobranzasView from "../views/cuotas/CobranzasView.vue"

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
      {
        path: "",
        redirect: "/inicio",
      },
      {
        path: "inicio",
        component: InicioView,
      },

      // ── Socios ──────────────────────────────────────────
      {
        path: "socios/activos",
        component: SociosActivosView,
      },
      {
        path: "socios/baja",
        component: SociosBajaView,
      },
      {
        path: "socios/nuevo",
        component: SocioFormView,
      },
      {
        path: "socios/:id/editar",
        component: SocioFormView,
      },
      {
        path: "socios/importar-excel",
        component: () => import("../views/socios/ImportarSociosExcelView.vue"),
      },

      // ── Cuotas ──────────────────────────────────────────
      {
        path: "cuotas/cobranzas",
        component: CobranzasView,
      },
      {
        path: "cuotas/reportes",
        name: "cuotas-reportes",
        component: () => import("../views/cuotas/CuotasReportesView.vue"),
      },

      // ── Movimientos ─────────────────────────────────────
      {
        path: "movimientos",
        name: "movimientos",
        component: () => import("../views/movimientos/MovimientosView.vue"),
      },
      {
        path: "movimientos/nuevo",
        name: "movimientos-nuevo",
        component: () => import("../views/movimientos/MovimientosFormView.vue"),
      },

      // ── Configuración ───────────────────────────────────
      {
        path: "configuracion",
        name: "configuracion",
        component: () => import("../views/ConfiguracionView.vue"),
      },

      // ── Alquileres ──────────────────────────────────────
      {
        path: "alquileres",
        name: "alquileres",
        component: () => import("../views/alquileres/AlquileresView.vue"),
      },
      {
        path: "alquileres/calendario",
        name: "alquileres-calendario",
        component: () => import("../views/alquileres/AlquileresCalendarioView.vue"),
      },
      {
        path: "alquileres/nuevo",
        name: "alquileres-nuevo",
        component: () => import("../views/alquileres/AlquileresFormView.vue"),
      },
      {
        path: "alquileres/:id/editar",
        name: "alquileres-editar",
        component: () => import("../views/alquileres/AlquileresFormView.vue"),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const logged = isLoggedIn()

  if (!to.meta?.public && !logged) {
    return "/login"
  }

  if (to.path === "/login" && logged) {
    return "/inicio"
  }
})

export default router