import { http } from "./http"

export const familiaresService = {
  listarPorSocio(socioId) {
    return http.get("/familiares", { params: { socioId } })
  },
  obtener(id) {
    return http.get(`/familiares/${id}`)
  },
  crear(payload) {
    return http.post("/familiares", payload)
  },
  actualizar(id, payload) {
    return http.put(`/familiares/${id}`, payload)
  },
  eliminar(id) {
    return http.delete(`/familiares/${id}`)
  },
}