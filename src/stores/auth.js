import { defineStore } from "pinia"
import { authService } from "../services/authService"
import {
  saveToken,
  saveUser,
  clearSession,
  getUser,
} from "../auth/session"

export const useAuthStore = defineStore("auth", {
  state: () => ({
    loading: false,
    user: getUser(),
  }),

  getters: {
    isAdmin: (state) => !!state.user?.admin,
    isCobrador: (state) => !!state.user?.cobrador,
    cobradorId: (state) => state.user?.cobradorId ?? null,
    nombre: (state) => state.user?.nombre ?? "",
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