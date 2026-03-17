import { http } from "./http"

export const alquileresService = {
  listar() {
    return http.get("/alquileres-salones")
  },

  obtener(id) {
    return http.get(`/alquileres-salones/${id}`)
  },

  crear(payload) {
    return http.post("/alquileres-salones", payload)
  },

  actualizar(id, payload) {
    return http.put(`/alquileres-salones/${id}`, payload)
  },

  eliminar(id) {
    return http.delete(`/alquileres-salones/${id}`)
  },
}