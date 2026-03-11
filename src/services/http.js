import axios from "axios"
import { getToken, clearSession } from "../auth/session"

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8083"

console.log("API BASE URL >>>", import.meta.env.VITE_API_BASE_URL)
console.log("API BASE FALLBACK >>>", baseURL)

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
      window.location.href = "/login"
    }

    return Promise.reject(error)
  }
)