import { reactive } from "vue"

const state = reactive({
  toasts: [],
})

let nextId = 0

export function useToast() {
  function show(texto, tipo = "success", duracion = 3500) {
    const id = ++nextId
    state.toasts.push({ id, texto, tipo })
    setTimeout(() => {
      const idx = state.toasts.findIndex(t => t.id === id)
      if (idx !== -1) state.toasts.splice(idx, 1)
    }, duracion)
  }

  const success = (texto) => show(texto, "success")
  const error   = (texto) => show(texto, "error")
  const info    = (texto) => show(texto, "info")
  const warning = (texto) => show(texto, "warning")

  return { toasts: state.toasts, show, success, error, info, warning }
}