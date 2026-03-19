import { jwtDecode } from "jwt-decode"

const TOKEN_KEY = "token"
const USER_KEY = "auth_user"

export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function saveUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function getUser() {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function isTokenExpired() {
  const token = getToken()
  if (!token) return true
  try {
    const { exp } = jwtDecode(token)
    if (!exp) return false
    // 10 segundos de margen para evitar race conditions
    return Date.now() >= (exp * 1000) - 10_000
  } catch {
    return true
  }
}

export function isLoggedIn() {
  if (!getToken()) return false
  if (isTokenExpired()) {
    clearSession()
    return false
  }
  return true
}