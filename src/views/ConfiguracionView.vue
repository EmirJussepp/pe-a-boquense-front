<template>
  <div class="page">

    <section class="page-head card">
      <div class="page-head-copy">
        <p class="eyebrow">Sistema</p>
        <h1>Configuración</h1>
        <p class="page-subtitle">Administrá los parámetros generales del sistema.</p>
      </div>
    </section>

    <div class="tabs-bar">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-btn"
        :class="{ active: tabActivo === tab.key }"
        @click="cambiarTab(tab.key)"
      >
        <span>{{ tab.icon }}</span>
        {{ tab.label }}
      </button>
    </div>

    <section class="card tab-content">

      <template v-if="tabActivo === 'tipos-socio-pena'">
        <div class="section-header">
          <div><h2>Tipos de Socio Peña</h2><p class="section-sub">Categorías de socios con su precio de cuota mensual.</p></div>
          <button class="btn-primary" @click="abrirModal('tipos-socio-pena')">+ Nuevo tipo</button>
        </div>
        <div v-if="loading" class="empty-state">Cargando...</div>
        <div v-else-if="!listas['tipos-socio-pena'].length" class="empty-state">No hay tipos de socio registrados.</div>
        <table v-else class="data-table">
          <thead><tr><th>ID</th><th>Nombre</th><th>Precio</th><th>Vitalicio</th><th class="th-actions">Acciones</th></tr></thead>
          <tbody>
            <tr v-for="item in listas['tipos-socio-pena']" :key="item.tipoSocioPenaId">
              <td>{{ item.tipoSocioPenaId }}</td>
              <td><strong>{{ item.nombre }}</strong></td>
              <td>{{ item.precio ? "$ " + item.precio : "—" }}</td>
              <td><span class="badge" :class="item.esVitalicio ? 'badge-success' : 'badge-neutral'">{{ item.esVitalicio ? "Sí" : "No" }}</span></td>
              <td><div class="row-actions"><button class="table-btn" @click="abrirEditar('tipos-socio-pena', item)">Editar</button></div></td>
            </tr>
          </tbody>
        </table>
      </template>

      <template v-if="tabActivo === 'tipos-socio-boca'">
        <div class="section-header">
          <div><h2>Tipos de Socio Boca</h2><p class="section-sub">Categorías de socios de Boca Juniors.</p></div>
          <button class="btn-primary" @click="abrirModal('tipos-socio-boca')">+ Nuevo tipo</button>
        </div>
        <div v-if="loading" class="empty-state">Cargando...</div>
        <div v-else-if="!listas['tipos-socio-boca'].length" class="empty-state">No hay tipos registrados.</div>
        <table v-else class="data-table">
          <thead><tr><th>ID</th><th>Nombre</th><th class="th-actions">Acciones</th></tr></thead>
          <tbody>
            <tr v-for="item in listas['tipos-socio-boca']" :key="item.tipoSocioBocaId">
              <td>{{ item.tipoSocioBocaId }}</td>
              <td><strong>{{ item.nombre }}</strong></td>
              <td><div class="row-actions"><button class="table-btn" @click="abrirEditar('tipos-socio-boca', item)">Editar</button></div></td>
            </tr>
          </tbody>
        </table>
      </template>

      <template v-if="tabActivo === 'salones'">
        <div class="section-header">
          <div><h2>Salones</h2><p class="section-sub">Espacios disponibles para alquilar.</p></div>
          <button class="btn-primary" @click="abrirModal('salones')">+ Nuevo salón</button>
        </div>
        <div v-if="loading" class="empty-state">Cargando...</div>
        <div v-else-if="!listas['salones'].length" class="empty-state">No hay salones registrados.</div>
        <table v-else class="data-table">
          <thead><tr><th>ID</th><th>Nombre</th><th>Precio</th><th class="th-actions">Acciones</th></tr></thead>
          <tbody>
            <tr v-for="item in listas['salones']" :key="item.salonId">
              <td>{{ item.salonId }}</td>
              <td><strong>{{ item.nombre }}</strong></td>
              <td>$ {{ item.precio }}</td>
              <td><div class="row-actions"><button class="table-btn" @click="abrirEditar('salones', item)">Editar</button></div></td>
            </tr>
          </tbody>
        </table>
      </template>

      <template v-if="tabActivo === 'metodos-pago'">
        <div class="section-header">
          <div><h2>Métodos de Pago</h2><p class="section-sub">Formas de pago disponibles en el sistema.</p></div>
          <button class="btn-primary" @click="abrirModal('metodos-pago')">+ Nuevo método</button>
        </div>
        <div v-if="loading" class="empty-state">Cargando...</div>
        <div v-else-if="!listas['metodos-pago'].length" class="empty-state">No hay métodos de pago registrados.</div>
        <table v-else class="data-table">
          <thead><tr><th>ID</th><th>Nombre</th></tr></thead>
          <tbody>
            <tr v-for="item in listas['metodos-pago']" :key="item.metodoPagoId">
              <td>{{ item.metodoPagoId }}</td>
              <td><strong>{{ item.nombre }}</strong></td>
            </tr>
          </tbody>
        </table>
      </template>

      <template v-if="tabActivo === 'localidades'">
        <div class="section-header">
          <div><h2>Localidades</h2><p class="section-sub">Ciudades y provincias del sistema.</p></div>
          <button class="btn-primary" @click="abrirModal('localidades')">+ Nueva localidad</button>
        </div>
        <div v-if="loading" class="empty-state">Cargando...</div>
        <div v-else-if="!listas['localidades'].length" class="empty-state">No hay localidades registradas.</div>
        <table v-else class="data-table">
          <thead><tr><th>ID</th><th>Nombre</th><th>Provincia</th></tr></thead>
          <tbody>
            <tr v-for="item in listas['localidades']" :key="item.localidadId">
              <td>{{ item.localidadId }}</td>
              <td><strong>{{ item.nombre }}</strong></td>
              <td>{{ item.provincia }}</td>
            </tr>
          </tbody>
        </table>
      </template>

    </section>

    <!-- MODAL -->
    <div v-if="modal.abierto" class="modal-overlay" @click.self="cerrarModal">
      <div class="modal-card">
        <div class="modal-header">
          <h3>{{ modal.editando ? "Editar" : "Nuevo" }} — {{ tabLabel }}</h3>
          <button class="modal-close" @click="cerrarModal">✕</button>
        </div>
        <form @submit.prevent="guardarModal" style="display:flex; flex-direction:column; gap:16px;">
          <div class="field">
            <label>Nombre <span class="required">*</span></label>
            <input v-model="modal.form.nombre" type="text" placeholder="Nombre..." required />
          </div>
          <div v-if="tabActivo === 'tipos-socio-pena' || tabActivo === 'salones'" class="field">
            <label>Precio</label>
            <div class="input-prefix-wrap">
              <span class="input-prefix">$</span>
              <input v-model="modal.form.precio" type="number" min="0" step="0.01" placeholder="0.00" />
            </div>
          </div>
          <div v-if="tabActivo === 'tipos-socio-pena'" class="field">
            <label>¿Es vitalicio?</label>
            <div class="toggle-group">
              <button type="button" class="btn-toggle" :class="{ 'active-success': modal.form.esVitalicio === true }" @click="modal.form.esVitalicio = true">Sí</button>
              <button type="button" class="btn-toggle" :class="{ 'active-neutral': modal.form.esVitalicio === false }" @click="modal.form.esVitalicio = false">No</button>
            </div>
          </div>
          <div v-if="tabActivo === 'localidades'" class="field">
            <label>Provincia <span class="required">*</span></label>
            <input v-model="modal.form.provincia" type="text" placeholder="Provincia..." required />
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="cerrarModal">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="modal.saving">
              {{ modal.saving ? "Guardando..." : "Guardar" }}
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue"
import { http } from "../services/http"

const tabs = [
  { key: "tipos-socio-pena", label: "Tipos Socio Peña", icon: "👥" },
  { key: "tipos-socio-boca", label: "Tipos Socio Boca", icon: "🏟️" },
  { key: "salones",          label: "Salones",           icon: "🏠" },
  { key: "metodos-pago",     label: "Métodos de Pago",   icon: "💳" },
  { key: "localidades",      label: "Localidades",       icon: "📍" },
]

const tabActivo = ref("tipos-socio-pena")
const loading = ref(false)
const listas = reactive({ "tipos-socio-pena": [], "tipos-socio-boca": [], "salones": [], "metodos-pago": [], "localidades": [] })
const modal = reactive({ abierto: false, editando: false, itemId: null, saving: false, form: {} })
const tabLabel = computed(() => tabs.find(t => t.key === tabActivo.value)?.label || "")

const config = {
  "tipos-socio-pena": { endpoint: "/tipos-socio-pena", idField: "tipoSocioPenaId", defaultForm: () => ({ nombre: "", precio: "", esVitalicio: false }) },
  "tipos-socio-boca": { endpoint: "/tipos-socio-boca", idField: "tipoSocioBocaId", defaultForm: () => ({ nombre: "" }) },
  "salones":          { endpoint: "/salones",          idField: "salonId",          defaultForm: () => ({ nombre: "", precio: "" }) },
  "metodos-pago":     { endpoint: "/metodos-pago",     idField: "metodoPagoId",     defaultForm: () => ({ nombre: "" }) },
  "localidades":      { endpoint: "/localidades",      idField: "localidadId",      defaultForm: () => ({ nombre: "", provincia: "" }) },
}

async function cargarTab(tab) {
  loading.value = true
  try {
    const { data } = await http.get(config[tab].endpoint)
    listas[tab] = data || []
  } catch (e) { console.error(`Error cargando ${tab}`, e) }
  finally { loading.value = false }
}

function cambiarTab(tab) { tabActivo.value = tab; cargarTab(tab) }
function abrirModal(tab) { modal.abierto = true; modal.editando = false; modal.itemId = null; modal.form = config[tab].defaultForm() }
function abrirEditar(tab, item) { modal.abierto = true; modal.editando = true; modal.itemId = item[config[tab].idField]; modal.form = { ...config[tab].defaultForm(), ...item } }
function cerrarModal() { modal.abierto = false; modal.form = {} }

async function guardarModal() {
  modal.saving = true
  const { endpoint } = config[tabActivo.value]
  try {
    const payload = buildPayload()
    if (modal.editando) {
      await http.put(`${endpoint}/${modal.itemId}`, payload)
    } else {
      await http.post(endpoint, payload)
    }
    cerrarModal()
    await cargarTab(tabActivo.value)
  } catch (e) { console.error("Error guardando", e); alert("No se pudo guardar. Revisá los datos.") }
  finally { modal.saving = false }
}

function buildPayload() {
  const tab = tabActivo.value
  const f = modal.form
  if (tab === "tipos-socio-pena") return { nombre: f.nombre, precio: f.precio ? String(f.precio) : null, esVitalicio: Boolean(f.esVitalicio) }
  if (tab === "salones")          return { nombre: f.nombre, precio: String(f.precio) }
  if (tab === "localidades")      return { nombre: f.nombre, provincia: f.provincia }
  return { nombre: f.nombre }
}

onMounted(() => cargarTab(tabActivo.value))
</script>

<style scoped>
.tabs-bar { display: flex; gap: 8px; flex-wrap: wrap; }
.tab-btn {
  display: flex; align-items: center; gap: 7px;
  padding: 10px 18px; border-radius: 10px; border: 1px solid var(--border);
  background: white; font-size: 13px; font-weight: 600; color: var(--text-muted);
  cursor: pointer; transition: all 0.2s; box-shadow: var(--shadow);
}
.tab-btn:hover { border-color: var(--primary); color: var(--primary); }
.tab-btn.active { background: var(--primary); color: white; border-color: var(--primary); }
.tab-content { padding: 24px; }
</style>