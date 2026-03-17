import { http } from "./http"

export const beneficiosService = {
  recalcularTodos() {
    return http.post("/beneficios/recalcular-todos")
  },

  recalcularSocio(socioId) {
    return http.post(`/beneficios/recalcular/${socioId}`)
  },
}