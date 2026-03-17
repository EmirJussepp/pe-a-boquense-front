import { http } from "./http"

export const movimientosService = {
  listar() {
    return http.get("/movimientos")
  },

  obtener(id) {
    return http.get(`/movimientos/${id}`)
  },

  crear(payload) {
    return http.post("/movimientos", payload)
  },

  actualizar(id, payload) {
    return http.put(`/movimientos/${id}`, payload)
  },

  eliminar(id, userId) {
    const config =
      userId != null
        ? {
            headers: {
              "X-User-Id": String(userId),
            },
          }
        : {}

    return http.delete(`/movimientos/${id}`, config)
  },
}