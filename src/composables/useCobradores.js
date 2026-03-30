import { ref, onMounted } from "vue"
import { cobradoresService } from "../services/cobradoresService"

export function useCobradores() {
  const cobradores = ref([])
  const loadingCobradores = ref(false)

  async function cargarCobradores() {
    loadingCobradores.value = true
    try {
      const { data } = await cobradoresService.listar()
      cobradores.value = Array.isArray(data) ? data : (data?.data ?? [])
    } catch {
      cobradores.value = []
    } finally {
      loadingCobradores.value = false
    }
  }

  onMounted(cargarCobradores)

  return { cobradores, loadingCobradores }
}
