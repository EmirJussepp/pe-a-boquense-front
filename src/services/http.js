import axios from "axios"
import { getToken, clearSession } from "../auth/session"
import { useToast } from "../composables/useToast"

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8083"

export const http = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
})

http.interceptors.request.use((config) => {
  const token = getToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearSession()
      const { info } = useToast()
      info("Tu sesión expiró. Iniciá sesión nuevamente.")
      // Importamos el router de forma lazy para evitar dependencias circulares
      import("../router").then(({ default: router }) => {
        router.push("/login")
      })
    }

    return Promise.reject(error)
  }
)