import { http } from "./http"

export const viajesPagosService = {
  listarPorViaje(viajeId) {
    return http.get(`/viajes-pagos/viaje/${viajeId}`)
  },

  obtener(id) {
    return http.get(`/viajes-pagos/${id}`)
  },

  crear(payload) {
    return http.post("/viajes-pagos", payload)
  },
}