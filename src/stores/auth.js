import { defineStore } from "pinia"
import { authService } from "../services/authService"
import { saveToken, saveUser, clearSession, getUser } from "../auth/session"
import { hasPermission, hasAnyPermission } from "../auth/permissions"
import { ROLES, PERMS } from "../auth/roles"

export const useAuthStore = defineStore("auth", {
  state: () => ({
    loading: false,
    user: getUser(),
  }),

  getters: {
    // ── Roles ────────────────────────────────────────────
    isAdmin:        (state) => !!state.user?.[ROLES.ADMIN],
    isCobrador:     (state) => !!state.user?.[ROLES.COBRADOR],
    isViajes:       (state) => !!state.user?.[ROLES.VIAJES],
    isAlquileres:   (state) => !!state.user?.[ROLES.ALQUILERES],
    isLoggedIn:     (state) => !!state.user,

    cobradorId:     (state) => state.user?.cobradorId ?? null,
    nombre:         (state) => state.user?.nombre ?? "",

    // ── Permisos ─────────────────────────────────────────
    // Uso: auth.can("socios:ver")
    can: (state) => (perm) => hasPermission(state.user, perm),

    // Uso: auth.canAny(["viajes:ver", "alquileres:ver"])
    canAny: (state) => (perms) => hasAnyPermission(state.user, perms),

    // ── Accesos por sección (para v-if en sidebar/rutas) ─
    puedeVerSocios:      (state) => hasAnyPermission(state.user, [PERMS.SOCIOS_VER, PERMS.ALL]),
    puedeVerCuotas:      (state) => hasAnyPermission(state.user, [PERMS.CUOTAS_VER, PERMS.ALL]),
    puedeVerViajes:      (state) => hasAnyPermission(state.user, [PERMS.VIAJES_VER, PERMS.ALL]),
    puedeVerAlquileres:  (state) => hasAnyPermission(state.user, [PERMS.ALQUILERES_VER, PERMS.ALL]),
    puedeVerBeneficios:  (state) => hasAnyPermission(state.user, [PERMS.BENEFICIOS_VER, PERMS.ALL]),
    puedeVerMovimientos: (state) => hasAnyPermission(state.user, [PERMS.MOVIMIENTOS_VER, PERMS.ALL]),
    puedeVerConfig:      (state) => hasPermission(state.user, PERMS.ALL),
  },

  actions: {
    async login(credentials) {
      this.loading = true
      try {
        const { data } = await authService.login(credentials)
        saveToken(data.token)
        const me = await authService.me()
        this.user = me.data
        saveUser(me.data)
        return me.data
      } finally {
        this.loading = false
      }
    },

    async fetchMe() {
      try {
        const { data } = await authService.me()
        this.user = data
        saveUser(data)
        return data
      } catch (e) {
        this.user = null
        clearSession()
        throw e
      }
    },

    logout() {
      this.user = null
      clearSession()
    },
  },
})