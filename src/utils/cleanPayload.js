/**
 * Convierte strings vacíos ("" o solo whitespace) en null antes de enviar al backend.
 *
 * Motivo: Vue v-model deja "" en inputs/dates vacíos, pero el backend Ktor espera
 * null (o el campo ausente) para tipos opcionales como Int?, String?, LocalDate?.
 * Mandar "" provoca JsonConvertException y respuesta 500.
 *
 * Uso: await sociosService.crear(cleanPayload(form))
 */
export function cleanPayload(obj) {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => {
      if (v === "" || (typeof v === "string" && v.trim() === "")) {
        return [k, null]
      }
      return [k, v]
    })
  )
}
