import { http } from "./http"

export const viajesPagosService = {
  listarPorViaje(viajeId, params = {}) {
    return http.get(`/viajes-pagos/viaje/${viajeId}`, { params })
  },

  obtener(id) {
    return http.get(`/viajes-pagos/${id}`)
  },

  crear(payload) {
    return http.post("/viajes-pagos", payload)
  },
   actualizar(id, payload) {                              // 👈 nuevo
    return http.put(`/viajes-pagos/${id}`, payload)
  },
   eliminar(id) {                              // 👈 nuevo
    return http.delete(`/viajes-pagos/${id}`)
  },

}