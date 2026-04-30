import { http } from "./http"

export const usuariosService = {
  listar() {
    return http.get("/usuarios")
  },

  obtener(id) {
    return http.get(`/usuarios/${id}`)
  },

  crear(payload) {
    return http.post("/usuarios", payload)
  },

  actualizar(id, payload) {
    return http.put(`/usuarios/${id}`, payload)
  },

  cambiarPassword(id, newPassword) {
    return http.patch(`/usuarios/${id}/password`, { newPassword })
  },
}
