import { http } from "./http"

export const viajesBomboneraService = {
  listar(params = {}) {
    return http.get("/viajes-bombonera", { params })
  },

  obtener(id) {
    return http.get(`/viajes-bombonera/${id}`)
  },

  crear(payload) {
    return http.post("/viajes-bombonera", payload)
  },

  actualizar(id, payload) {
    return http.put(`/viajes-bombonera/${id}`, payload)
  },
}