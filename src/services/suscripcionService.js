import { http } from "./http"

export const suscripcionService = {
  // ── Estado ────────────────────────────────────────────────
  obtenerEstado(email) {
    return http.get("/suscripciones/estado", { params: { email } })
  },

  verificarAcceso(email) {
    return http.get("/suscripciones/acceso", { params: { email } })
  },

  // ── Pago con MercadoPago ──────────────────────────────────
  // Devuelve { checkoutUrl, sandboxCheckoutUrl, preferenciaId }
  crearPreferencia(payload) {
    return http.post("/suscripciones/pagar", payload)
    // payload: { emailPena, nombrePena, meses }
  },

  // ── Config (precio) ───────────────────────────────────────
  obtenerConfig() {
    return http.get("/suscripciones/config")
  },

  actualizarPrecio(precioMensual) {
    return http.patch("/suscripciones/config", { precioMensual })
  },

  // ── Admin: reactivar manual ───────────────────────────────
  reactivar(payload) {
    return http.post("/suscripciones/reactivar", payload)
  },
}