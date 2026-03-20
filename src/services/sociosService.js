import { http } from "./http"

export const sociosService = {
  activos(params = {}) {
    return http.get("/socios/activos", { params })
  },

  baja(params = {}) {
    return http.get("/socios/baja", { params })
  },

  listar() {
    return http.get("/socios")
  },

  porId(id) {
    return http.get(`/socios/${id}`)
  },

  crear(payload) {
    return http.post("/socios", payload)
  },

  editar(id, payload) {
    return http.patch(`/socios/${id}`, payload)
  },

  darDeBaja(id, payload = {}) {
    return http.post(`/socios/${id}/baja`, payload)
  },

  reactivar(id) {
    return http.post(`/socios/${id}/reactivar`)
  },

  importarExcel(file) {
    const formData = new FormData()
    formData.append("file", file)

    return http.post("/socios/importar-excel", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
  }
}
