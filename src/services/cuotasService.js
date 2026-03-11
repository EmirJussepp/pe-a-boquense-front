import api from "./api"

export async function getCuotasPendientesByDni(dni) {
  const { data } = await api.get("/cuotas/pendientes", {
    params: { dni },
  })
  return data
}