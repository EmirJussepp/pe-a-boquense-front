import { http } from "./http"

export const movimientosService = {
  listar() {
    return http.get("/movimientos")
  },

  crear(payload) {
    return http.post("/movimientos", payload)
  },

  eliminar(id, userId) {
    return http.delete(`/movimientos/${id}`, {
      headers: {
        "X-User-Id": String(userId),
      },
    })
  },
}