import { http } from "./http"

export const viajesBomboneraService = {
  listar(params = {}) {
    return http.get("/viajes-bombonera", { params })
  },

  crear(payload) {
    return http.post("/viajes-bombonera", payload)
  },

 obtener(id) {
  return http.get(`/viajes-bombonera/${id}`)
},

actualizar(id, payload) {
  return http.put(`/viajes-bombonera/${id}`, payload)
},
}