// Constantes de roles y permisos — usá siempre estas constantes
// en lugar de strings hardcodeados en componentes, stores y router.

export const ROLES = {
  ADMIN:      "admin",
  COBRADOR:   "cobrador",
  VIAJES:     "rolViajes",
  ALQUILERES: "rolAlquileres",
}

export const PERMS = {
  ALL:                    "*",
  SOCIOS_VER:             "socios:ver",
  SOCIOS_GESTIONAR:       "socios:gestionar",
  CUOTAS_VER:             "cuotas:ver",
  CUOTAS_GESTIONAR:       "cuotas:gestionar",
  VIAJES_VER:             "viajes:ver",
  VIAJES_GESTIONAR:       "viajes:gestionar",
  BENEFICIOS_VER:         "beneficios:ver",
  MOVIMIENTOS_VER:        "movimientos:ver",
  MOVIMIENTOS_GESTIONAR:  "movimientos:gestionar",
  ALQUILERES_VER:         "alquileres:ver",
  ALQUILERES_GESTIONAR:   "alquileres:gestionar",
}
