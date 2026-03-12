import { http } from "./http"

export const pagosService = {
  pagarMasivo(payload) {
    return http.post("/pagos/masivo", payload)
  },

  pagarUno(payload) {
    return http.post("/pagos", payload)
  },
}