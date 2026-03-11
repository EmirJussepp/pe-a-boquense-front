import { http } from "./http"

export const catalogosService = {
  cobradores() {
    return http.get("/cobradores")
  },

  localidades() {
    return http.get("/localidades")
  },

  tiposSocioPena() {
    return http.get("/tipos-socio-pena")
  },

  tiposSocioBoca() {
    return http.get("/tipos-socio-boca")
  },
}