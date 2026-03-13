import { http } from "./http"

export const cuotasService = {
  pendientesPorDni(dni) {
    return http.get("/cuotas/pendientes", {
      params: { dni },
    })
  },

    listarCobranzas(params = {}) {
    return http.get("/cuotas/cobranzas", {
      params,
    })
  },
}