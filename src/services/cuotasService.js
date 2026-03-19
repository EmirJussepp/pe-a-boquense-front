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
  descargarCuponesCobrador(cobradorId, periodo) {
  return http.get(`/cupones/cobrador/${cobradorId}`, {
    params: { periodo },
    responseType: "arraybuffer", // importante para PDFs
  })
},

descargarCuponesSocio(socioId) {
  return http.get(`/cupones/socio/${socioId}`, {
    responseType: "arraybuffer",
  })
},
}