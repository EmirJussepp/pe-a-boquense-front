import { createRouter, createWebHistory } from "vue-router"
import { isLoggedIn } from "../auth/session"

import LoginView from "../views/LoginView.vue"
import MainLayout from "../components/layout/MainLayout.vue"
import InicioView from "../views/InicioView.vue"
import SociosActivosView from "../views/socios/SociosActivosView.vue"
import SociosBajaView from "../views/socios/SociosBajaView.vue"
import SocioFormView from "../views/socios/SocioFormView.vue"
import CuotasPendientesView from "../views/cuotas/CuotasPendientesView.vue"

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
      {
        path: "cuotas/pendientes",
        component: CuotasPendientesView,
      },
      {
      path: "cuotas/cobrador",
      component: () => import("../views/cuotas/CuotasPorCobradorView.vue"),
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