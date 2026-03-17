import { http } from "./http"

export const reportesService = {
  obtenerResumen(params = {}) {
    return http.get("/reportes/resumen", { params })
  },

  obtenerEstadoCuotas(params = {}) {
    return http.get("/reportes/estado-cuotas", { params })
  },

  obtenerDeudaPorSocio(params = {}) {
    return http.get("/reportes/deuda-socios", { params })
  },

  obtenerPorCobrador(params = {}) {
    return http.get("/reportes/por-cobrador", { params })
  },

  obtenerPorMetodo(params = {}) {
    return http.get("/reportes/por-metodo", { params })
  },
}