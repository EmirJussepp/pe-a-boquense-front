import { http } from "./http"

export const metodosPagoService = {
  listar() {
    return http.get("/metodos-pago")
  },
}