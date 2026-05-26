<template>
  <div class="socio-buscador">
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
      <Loader v-if="buscando" :size="14" class="input-spinner" />
      <button v-if="valorSeleccionado" class="btn-clear" type="button" @click="limpiar"><X :size="14" /></button>
    </div>

    <div v-if="valorSeleccionado" class="selected-tag">
      👤 {{ valorSeleccionado.apellido }}, {{ valorSeleccionado.nombre }} — DNI {{ valorSeleccionado.dni }}
    </div>

    <div v-if="abierto && resultados.length" class="dropdown">
      <button
        v-for="(r, i) in resultados"
        :key="r.socioId"
        type="button"
        class="dropdown-item"
        :class="{ active: i === indicActivo }"
        @mousedown.prevent="seleccionar(r)"
      >
        <span class="item-nombre">{{ r.apellido }}, {{ r.nombre }}</span>
        <span class="item-dni">DNI {{ r.dni }}</span>
      </button>
    </div>

    <div v-if="abierto && !buscando && query.length >= 2 && !resultados.length" class="dropdown">
      <div class="dropdown-empty">No se encontraron socios para "{{ query }}"</div>
    </div>

    <p v-if="errorApi" class="input-error">{{ errorApi }}</p>
  </div>
</template>

<script setup>
import { ref, watch } from "vue"
import { sociosService } from "../services/sociosService"
import { X, Loader } from "lucide-vue-next"

const props = defineProps({
  modelValue: { type: Number, default: null },
  placeholder: { type: String, default: "Buscar socio por DNI, nombre o apellido..." },
  socioInicial: { type: Object, default: null },
})

const emit = defineEmits(["update:modelValue", "select", "clear"])

const query = ref("")
const resultados = ref([])
const abierto = ref(false)
const buscando = ref(false)
const indicActivo = ref(0)
const errorApi = ref(null)
const valorSeleccionado = ref(null)

let debounceTimer = null

watch(() => props.socioInicial, (val) => {
  if (val?.socioId) {
    valorSeleccionado.value = {
      socioId: val.socioId,
      nombre: val.nombre,
      apellido: val.apellido,
      dni: val.dni,
    }
    query.value = ""
  }
}, { immediate: true })

function onInput() {
  errorApi.value = null
  valorSeleccionado.value = null
  emit("update:modelValue", null)
  emit("clear")

  if (query.value.trim().length < 2) {
    resultados.value = []
    abierto.value = false
    return
  }

  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(buscar, 300)
}

async function buscar() {
  buscando.value = true
  abierto.value = true
  try {
    const { data } = await sociosService.buscar(query.value.trim(), 10)
    resultados.value = Array.isArray(data) ? data : []
    indicActivo.value = 0
  } catch {
    errorApi.value = "No se pudo buscar socios."
    resultados.value = []
  } finally {
    buscando.value = false
  }
}

function seleccionar(item) {
  valorSeleccionado.value = item
  emit("update:modelValue", item.socioId)
  emit("select", item)
  query.value = ""
  abierto.value = false
  resultados.value = []
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
  emit("clear")
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
.socio-buscador { position: relative; display: flex; flex-direction: column; gap: 6px; }

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

.input-spinner { position: absolute; right: 10px; animation: spin 1s linear infinite; color: var(--text-muted, #94a3b8); }
@keyframes spin { to { transform: rotate(360deg); } }
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
.item-dni { font-size: 11px; color: var(--text-muted); font-weight: 500; white-space: nowrap; }

.dropdown-empty { padding: 14px; text-align: center; font-size: 13px; color: var(--text-muted); }

.input-error { font-size: 12px; color: #dc2626; margin: 0; }
</style>
