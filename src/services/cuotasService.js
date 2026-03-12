import { http } from "./http"

export const cuotasService = {
  pendientesPorDni(dni) {
    return http.get("/cuotas/pendientes", {
      params: { dni },
    })
  },
}