import { defineStore } from "pinia"
import { jwtDecode } from "jwt-decode"
import { authService } from "../services/authService"
import { saveSession, clearSession, getToken, getUser } from "../auth/session"

function mapTokenToUser(token) {
  const decoded = jwtDecode(token)

  return {
    id: decoded.id ?? null,
    email: decoded.email ?? "",
    nombre: decoded.nombre ?? "",
    admin: decoded.admin ?? false,
    cobrador: decoded.cobrador ?? false,
    perms: decoded.perms ?? [],
    raw: decoded,
  }
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: getToken(),
    user: getUser(),
    loading: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
  },

  actions: {
    async login(form) {
      this.loading = true

      try {
        const { data } = await authService.login(form)
        const token = data.token
        const user = mapTokenToUser(token)

        this.token = token
        this.user = user

        saveSession(token, user)
        return user
      } finally {
        this.loading = false
      }
    },

    logout() {
      this.token = ""
      this.user = null
      clearSession()
    },

    restore() {
      this.token = getToken()
      this.user = getUser()
    },
  },
})