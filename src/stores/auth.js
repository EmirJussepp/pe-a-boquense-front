import { defineStore } from "pinia"
import { authService } from "../services/authService"
import { saveToken, saveUser, clearSession, getUser } from "../auth/session"
import { hasPermission, hasAnyPermission } from "../auth/permissions"

export const useAuthStore = defineStore("auth", {
  state: () => ({
    loading: false,
    user: getUser(),
  }),

  getters: {
    // ── Roles ────────────────────────────────────────────
    isAdmin:        (state) => !!state.user?.admin,
    isCobrador:     (state) => !!state.user?.cobrador,
    isViajes:       (state) => !!state.user?.rolViajes,
    isAlquileres:   (state) => !!state.user?.rolAlquileres,
    isLoggedIn:     (state) => !!state.user,

    cobradorId:     (state) => state.user?.cobradorId ?? null,
    nombre:         (state) => state.user?.nombre ?? "",

    // ── Permisos ─────────────────────────────────────────
    // Uso: auth.can("socios:ver")
    can: (state) => (perm) => hasPermission(state.user, perm),

    // Uso: auth.canAny(["viajes:ver", "alquileres:ver"])
    canAny: (state) => (perms) => hasAnyPermission(state.user, perms),

    // ── Accesos por sección (para v-if en sidebar/rutas) ─
    puedeVerSocios:      (state) => hasAnyPermission(state.user, ["socios:ver", "*"]),
    puedeVerCuotas:      (state) => hasAnyPermission(state.user, ["cuotas:ver", "*"]),
    puedeVerViajes:      (state) => hasAnyPermission(state.user, ["viajes:ver", "*"]),
    puedeVerAlquileres:  (state) => hasAnyPermission(state.user, ["alquileres:ver", "*"]),
    puedeVerBeneficios:  (state) => hasAnyPermission(state.user, ["beneficios:ver", "*"]),
    puedeVerMovimientos: (state) => hasAnyPermission(state.user, ["movimientos:ver", "*"]),
    puedeVerConfig:      (state) => hasPermission(state.user, "*"),
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
      const { data } = await authService.me()
      this.user = data
      saveUser(data)
      return data
    },

    logout() {
      this.user = null
      clearSession()
    },
  },
})