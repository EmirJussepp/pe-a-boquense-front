import { http } from "./http"

export const salonesService = {
  listar() {
    return http.get("/salones")
  },

  obtener(id) {
    return http.get(`/salones/${id}`)
  },

  eliminar(id) {
    return http.delete(`/salones/${id}`)
  },
}