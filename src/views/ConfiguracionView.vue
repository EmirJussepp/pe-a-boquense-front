<template>
  <div class="page">

    <section class="page-head card">
      <div class="page-head-copy">
        <p class="eyebrow">Sistema</p>
        <h1>Configuración</h1>
        <p class="page-subtitle">Administrá los parámetros generales del sistema.</p>
      </div>
    </section>

    <!-- ERROR BANNER -->
    <div v-if="error" class="error-banner">
      <span>⚠️</span>
      <span class="error-msg">{{ error }}</span>
      <button class="error-close" @click="error = null">✕</button>
    </div>

    <!-- TOAST -->
    <transition name="toast">
      <div v-if="toast" class="toast">{{ toast }}</div>
    </transition>

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

      <!-- TIPOS SOCIO PEÑA -->
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

      <!-- TIPOS SOCIO BOCA -->
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

      <!-- SALONES -->
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

      <!-- MÉTODOS DE PAGO -->
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

    

      <!-- COBRADORES -->
      <template v-if="tabActivo === 'cobradores'">
        <div class="section-header">
          <div><h2>Cobradores</h2><p class="section-sub">Personas responsables de la cobranza mensual por zona.</p></div>
          <button class="btn-primary" @click="abrirModal('cobradores')">+ Nuevo cobrador</button>
        </div>
        <div v-if="loading" class="empty-state">Cargando...</div>
        <div v-else-if="!listas['cobradores'].length" class="empty-state">No hay cobradores registrados.</div>
        <table v-else class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>DNI</th>
              <th>Teléfono</th>
              <th>Zona</th>
              <th class="th-actions">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in listas['cobradores']" :key="item.cobradoresId">
              <td>{{ item.cobradoresId }}</td>
              <td><strong>{{ item.nombre }}</strong></td>
              <td class="mono">{{ item.dni }}</td>
              <td>{{ item.telefono }}</td>
              <td><span class="badge badge-neutral">{{ item.zona }}</span></td>
              <td>
                <div class="row-actions">
                  <button class="table-btn" @click="abrirEditar('cobradores', item)">Editar</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </template>

    </section>

    <!-- MODAL GENÉRICO -->
    <div v-if="modal.abierto && tabActivo !== 'cobradores'" class="modal-overlay" @click.self="cerrarModal">
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

    <!-- MODAL COBRADORES -->
    <div v-if="modal.abierto && tabActivo === 'cobradores'" class="modal-overlay" @click.self="cerrarModal">
      <div class="modal-card">
        <div class="modal-header">
          <h3>{{ modal.editando ? "Editar cobrador" : "Nuevo cobrador" }}</h3>
          <button class="modal-close" @click="cerrarModal">✕</button>
        </div>
        <form @submit.prevent="guardarModal" style="display:flex; flex-direction:column; gap:16px;">
          <div class="form-grid-2">
            <div class="field">
              <label>Nombre <span class="required">*</span></label>
              <input v-model="modal.form.nombre" type="text" placeholder="Nombre completo..." required />
            </div>
            <div class="field">
              <label>DNI <span class="required">*</span></label>
              <input v-model="modal.form.dni" type="text" placeholder="Ej. 32123456" required />
            </div>
            <div class="field">
              <label>Teléfono <span class="required">*</span></label>
              <input v-model="modal.form.telefono" type="text" placeholder="Ej. 1123456789" required />
            </div>
            <div class="field">
              <label>Zona <span class="required">*</span></label>
              <input v-model="modal.form.zona" type="text" placeholder="Ej. Villa Urquiza" required />
            </div>
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
  
  { key: "cobradores",       label: "Cobradores",        icon: "🧾" },
]

const tabActivo = ref("tipos-socio-pena")
const loading = ref(false)
const error = ref(null)
const toast = ref(null)

const listas = reactive({
  "tipos-socio-pena": [],
  "tipos-socio-boca": [],
  "salones": [],
  "metodos-pago": [],
  
  "cobradores": [],
})

const modal = reactive({
  abierto: false,
  editando: false,
  itemId: null,
  saving: false,
  form: {}
})

const tabLabel = computed(() => tabs.find(t => t.key === tabActivo.value)?.label || "")

const config = {
  "tipos-socio-pena": { endpoint: "/tipos-socio-pena", idField: "tipoSocioPenaId", defaultForm: () => ({ nombre: "", precio: "", esVitalicio: false }) },
  "tipos-socio-boca": { endpoint: "/tipos-socio-boca", idField: "tipoSocioBocaId", defaultForm: () => ({ nombre: "" }) },
  "salones":          { endpoint: "/salones",          idField: "salonId",          defaultForm: () => ({ nombre: "", precio: "" }) },
  "metodos-pago":     { endpoint: "/metodos-pago",     idField: "metodoPagoId",     defaultForm: () => ({ nombre: "" }) },
 
  "cobradores":       { endpoint: "/cobradores",       idField: "cobradoresId",     defaultForm: () => ({ nombre: "", dni: "", telefono: "", zona: "" }) },
}

function mostrarToast(msg) {
  toast.value = msg
  setTimeout(() => { toast.value = null }, 3000)
}

async function cargarTab(tab) {
  loading.value = true
  error.value = null
  try {
    const { data } = await http.get(config[tab].endpoint)
    listas[tab] = data || []
  } catch (e) {
    error.value = `No se pudo cargar ${tabs.find(t => t.key === tab)?.label ?? tab}. Intentá de nuevo.`
  } finally {
    loading.value = false
  }
}

function cambiarTab(tab) {
  tabActivo.value = tab
  cargarTab(tab)
}

function abrirModal(tab) {
  modal.abierto = true
  modal.editando = false
  modal.itemId = null
  modal.form = config[tab].defaultForm()
}

function abrirEditar(tab, item) {
  modal.abierto = true
  modal.editando = true
  modal.itemId = item[config[tab].idField]
  modal.form = { ...config[tab].defaultForm(), ...item }
}

function cerrarModal() {
  modal.abierto = false
  modal.form = {}
}

async function guardarModal() {
  modal.saving = true
  error.value = null
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
    mostrarToast(`✅ ${modal.editando ? "Cambios guardados" : "Creado correctamente"}.`)
  } catch (e) {
    error.value = "No se pudo guardar. Revisá los datos e intentá de nuevo."
  } finally {
    modal.saving = false
  }
}

function buildPayload() {
  const tab = tabActivo.value
  const f = modal.form
  if (tab === "tipos-socio-pena") return { nombre: f.nombre, precio: f.precio ? String(f.precio) : null, esVitalicio: Boolean(f.esVitalicio) }
  if (tab === "salones")          return { nombre: f.nombre, precio: String(f.precio) }
  
  if (tab === "cobradores")       return { nombre: f.nombre, dni: f.dni, telefono: f.telefono, zona: f.zona }
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

/* ERROR BANNER */
.error-banner {
  display: flex; align-items: center; gap: 12px;
  background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px;
  padding: 14px 18px; margin-bottom: 16px;
  color: #991b1b; font-size: 13px; font-weight: 600;
}
.error-msg { flex: 1; }
.error-close { background: none; border: none; color: #991b1b; cursor: pointer; font-size: 16px; }

/* TOAST */
.toast {
  position: fixed; bottom: 30px; right: 30px;
  background: var(--primary); color: white;
  padding: 12px 22px; border-radius: 10px;
  font-size: 13px; font-weight: 700;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15); z-index: 9999;
}
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(10px); }

/* MODAL */
.form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.mono { font-family: monospace; font-size: 12px; }
.badge-neutral { background: #f1f5f9; color: #475569; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }
</style>