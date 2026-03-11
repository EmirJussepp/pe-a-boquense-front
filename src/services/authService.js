import { http } from "./http"

export const authService = {
  login(payload) {
    return http.post("/login", payload)
  },
}