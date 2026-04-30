import { http } from "./http"

export const metodosPagoService = {
  listar() {
    return http.get("/metodos-pago")
  },

  obtener(id) {
    return http.get(`/metodos-pago/${id}`)
  },

  crear(payload) {
    return http.post("/metodos-pago", payload)
  },

  actualizar(id, payload) {
    return http.put(`/metodos-pago/${id}`, payload)
  },

  eliminar(id) {
    return http.delete(`/metodos-pago/${id}`)
  },
}