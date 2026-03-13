import { http } from "./http"

export const cobradoresService = {
  listar() {
    return http.get("/cobradores")
  },
}