import { http } from "./http"

export const pasajerosService = {
  listar(params = {}) {
    return http.get("/pasajeros", { params })
  },
  obtener(id) {
    return http.get(`/pasajeros/${id}`)
  },
  crear(payload) {
    return http.post("/pasajeros", payload)
  },
  actualizar(id, payload) {
    return http.put(`/pasajeros/${id}`, payload)
  },
  eliminar(id) {
    return http.delete(`/pasajeros/${id}`)
  },
}