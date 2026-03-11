import api from "./api"

export async function pagarCuotasMasivo(payload) {
  const { data } = await api.post("/pagos/masivo", payload)
  return data
}