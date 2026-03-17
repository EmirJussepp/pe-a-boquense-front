<template>
  <div class="localidad-buscador">
    <!-- Input de búsqueda -->
    <div class="input-wrap">
      <input
        ref="inputRef"
        v-model="query"
        type="text"
        :placeholder="placeholder"
        class="buscador-input"
        autocomplete="off"
        @input="onInput"
        @keydown.down.prevent="moverAbajo"
        @keydown.up.prevent="moverArriba"
        @keydown.enter.prevent="seleccionarActivo"
        @keydown.escape="cerrar"
        @focus="onFocus"
        @blur="onBlur"
      />
      <span v-if="buscando" class="input-spinner">⏳</span>
      <button v-if="valorSeleccionado" class="btn-clear" type="button" @click="limpiar">✕</button>
    </div>

    <!-- Valor seleccionado -->
    <div v-if="valorSeleccionado" class="selected-tag">
      📍 {{ valorSeleccionado.nombre }}, {{ valorSeleccionado.provincia }}
    </div>

    <!-- Dropdown resultados -->
    <div v-if="abierto && resultados.length" class="dropdown">
      <button
        v-for="(r, i) in resultados"
        :key="r.id"
        type="button"
        class="dropdown-item"
        :class="{ active: i === indicActivo }"
        @mousedown.prevent="seleccionar(r)"
      >
        <span class="item-nombre">{{ r.nombre }}</span>
        <span class="item-provincia">{{ r.provincia }}</span>
      </button>
    </div>

    <!-- Sin resultados -->
    <div v-if="abierto && !buscando && query.length >= 3 && !resultados.length" class="dropdown">
      <div class="dropdown-empty">No se encontraron localidades para "{{ query }}"</div>
    </div>

    <!-- Error -->
    <p v-if="errorApi" class="input-error">{{ errorApi }}</p>
  </div>
</template>

<script setup>
import { ref, watch } from "vue"
import { http } from "../services/http"

const props = defineProps({
  modelValue: { type: Number, default: null },
  placeholder: { type: String, default: "Buscar localidad..." },
  // Si se pasa localidadInicial, muestra el nombre al cargar (modo edición)
  localidadInicial: { type: Object, default: null }, // { nombre, provincia }
})

const emit = defineEmits(["update:modelValue"])

const query = ref("")
const resultados = ref([])
const abierto = ref(false)
const buscando = ref(false)
const indicActivo = ref(0)
const errorApi = ref(null)
const valorSeleccionado = ref(null)

let debounceTimer = null

// Si viene con valor inicial (modo edición), mostrarlo
watch(() => props.localidadInicial, (val) => {
  if (val?.nombre) {
    valorSeleccionado.value = val
    query.value = ""
  }
}, { immediate: true })

function onInput() {
  errorApi.value = null
  valorSeleccionado.value = null
  emit("update:modelValue", null)

  if (query.value.length < 3) {
    resultados.value = []
    abierto.value = false
    return
  }

  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(buscar, 350)
}

async function buscar() {
  buscando.value = true
  abierto.value = true
  try {
    const res = await fetch(
      `https://apis.datos.gob.ar/georef/api/localidades?nombre=${encodeURIComponent(query.value)}&campos=id,nombre,provincia.nombre&max=8`
    )
    const data = await res.json()
    resultados.value = (data.localidades ?? []).map(l => ({
      id: l.id,
      nombre: l.nombre,
      provincia: l.provincia.nombre,
    }))
    indicActivo.value = 0
  } catch {
    errorApi.value = "No se pudo conectar al buscador de localidades."
    resultados.value = []
  } finally {
    buscando.value = false
  }
}

async function seleccionar(item) {
  buscando.value = true
  errorApi.value = null
  try {
    const { data } = await http.post("/localidades/find-or-create", {
      nombre: item.nombre,
      provincia: item.provincia,
    })
    valorSeleccionado.value = { nombre: data.nombre, provincia: data.provincia }
    emit("update:modelValue", data.localidadId)
    query.value = ""
    abierto.value = false
    resultados.value = []
  } catch {
    errorApi.value = "No se pudo guardar la localidad. Intentá de nuevo."
  } finally {
    buscando.value = false
  }
}
function onFocus() {
  if (resultados.value.length) abierto.value = true
}

function limpiar() {
  valorSeleccionado.value = null
  query.value = ""
  resultados.value = []
  abierto.value = false
  emit("update:modelValue", null)
}

function cerrar() {
  abierto.value = false
}

function onBlur() {
  setTimeout(() => { abierto.value = false }, 150)
}

function seleccionarActivo() {
  if (resultados.value[indicActivo.value]) {
    seleccionar(resultados.value[indicActivo.value])
  }
}

function moverAbajo() {
  if (indicActivo.value < resultados.value.length - 1) indicActivo.value++
}

function moverArriba() {
  if (indicActivo.value > 0) indicActivo.value--
}
</script>

<style scoped>
.localidad-buscador { position: relative; display: flex; flex-direction: column; gap: 6px; }

.input-wrap { position: relative; display: flex; align-items: center; }

.buscador-input {
  width: 100%;
  padding: 10px 36px 10px 12px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: #f8fafc;
  color: var(--text-main);
  font-size: 13px;
}
.buscador-input:focus { outline: none; border-color: var(--primary); background: white; }

.input-spinner { position: absolute; right: 10px; font-size: 12px; }
.btn-clear {
  position: absolute; right: 8px;
  background: none; border: none; cursor: pointer;
  color: var(--text-muted); font-size: 13px; font-weight: 700;
  line-height: 1; padding: 2px 4px;
}
.btn-clear:hover { color: #dc2626; }

.selected-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(0,59,122,0.06);
  border: 1px solid rgba(0,59,122,0.15);
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 600;
  color: var(--primary);
}

.dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0; right: 0;
  background: white;
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  z-index: 100;
  overflow: hidden;
}

.dropdown-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 10px 14px;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  gap: 12px;
  border-bottom: 1px solid var(--bg);
  transition: background 0.1s;
}
.dropdown-item:last-child { border-bottom: none; }
.dropdown-item:hover, .dropdown-item.active { background: #f0f6ff; }

.item-nombre { font-size: 13px; font-weight: 600; color: var(--primary); }
.item-provincia { font-size: 11px; color: var(--text-muted); font-weight: 500; white-space: nowrap; }

.dropdown-empty { padding: 14px; text-align: center; font-size: 13px; color: var(--text-muted); }

.input-error { font-size: 12px; color: #dc2626; margin: 0; }
</style>