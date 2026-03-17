import { http } from "./http"

export const beneficiosService = {
  getAll({ page = 1, pageSize = 10, search = "" } = {}) {
    return http.get("/beneficios", {
      params: {
        pageSize,
        search
      }
    })
  },

  recalcularTodos() {
    return http.post("/beneficios/recalcular-todos")
  },

  recalcularSocio(socioId) {
    return http.post(`/beneficios/recalcular/${socioId}`)
  },
}