<template>
  <div class="page">
    <section class="page-head card">
      <div class="page-head-copy">
        <p class="eyebrow">Sistema</p>
        <h1>Configuración</h1>
        <p class="page-subtitle">Administrá los parámetros generales del sistema.</p>
      </div>
    </section>

    <div v-if="error" class="error-banner">
      <span>⚠️</span>
      <span class="error-msg">{{ error }}</span>
      <button class="error-close" @click="error = null">✕</button>
    </div>

    <transition name="toast">
      <div v-if="toast" class="toast">{{ toast }}</div>
    </transition>

    <div class="tabs-bar">
      <button v-for="tab in tabs" :key="tab.key" class="tab-btn" :class="{ active: tabActivo === tab.key }"
        @click="cambiarTab(tab.key)">
        <span>{{ tab.icon }}</span>
        {{ tab.label }}
      </button>
    </div>

    <section class="card tab-content">
      <!-- TIPOS SOCIO PEÑA -->
      <template v-if="tabActivo === 'tipos-socio-pena'">
        <div class="section-header">
          <div>
            <h2>Tipos de Socio Peña</h2>
            <p class="section-sub">Categorías de socios con su precio de cuota mensual.</p>
          </div>
          <button class="btn-primary" @click="abrirModal('tipos-socio-pena')">+ Nuevo tipo</button>
        </div>
        <div v-if="loading" class="empty-state">Cargando...</div>
        <div v-else-if="!listas['tipos-socio-pena'].length" class="empty-state">No hay tipos de socio registrados.</div>
        <table v-else class="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Vitalicio</th>
              <th class="th-actions">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in listas['tipos-socio-pena']" :key="item.tipoSocioPenaId">
              <td><strong>{{ item.nombre }}</strong></td>
              <td>{{ item.precio ? "$ " + item.precio : "—" }}</td>
              <td>
                <span class="badge" :class="item.esVitalicio ? 'badge-success' : 'badge-neutral'">
                  {{ item.esVitalicio ? "Sí" : "No" }}
                </span>
              </td>
              <td>
                <div class="row-actions"><button class="table-btn"
                    @click="abrirEditar('tipos-socio-pena', item)">Editar</button></div>
              </td>
            </tr>
          </tbody>
        </table>
      </template>

      <!-- TIPOS SOCIO BOCA -->
      <template v-else-if="tabActivo === 'tipos-socio-boca'">
        <div class="section-header">
          <div>
            <h2>Tipos de Socio Boca</h2>
            <p class="section-sub">Categorías de socios de Boca Juniors.</p>
          </div>
          <button class="btn-primary" @click="abrirModal('tipos-socio-boca')">+ Nuevo tipo</button>
        </div>
        <div v-if="loading" class="empty-state">Cargando...</div>
        <div v-else-if="!listas['tipos-socio-boca'].length" class="empty-state">No hay tipos registrados.</div>
        <table v-else class="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th class="th-actions">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in listas['tipos-socio-boca']" :key="item.tipoSocioBocaId">
              <td><strong>{{ item.nombre }}</strong></td>
              <td>
                <div class="row-actions"><button class="table-btn"
                    @click="abrirEditar('tipos-socio-boca', item)">Editar</button></div>
              </td>
            </tr>
          </tbody>
        </table>
      </template>

      <!-- SALONES -->
      <template v-else-if="tabActivo === 'salones'">
        <div class="section-header">
          <div>
            <h2>Salones</h2>
            <p class="section-sub">Espacios disponibles para alquilar.</p>
          </div>
          <button class="btn-primary" @click="abrirModal('salones')">+ Nuevo salón</button>
        </div>
        <div v-if="loading" class="empty-state">Cargando...</div>
        <div v-else-if="!listas.salones.length" class="empty-state">No hay salones registrados.</div>
        <table v-else class="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Precio</th>
              <th class="th-actions">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in listas.salones" :key="item.salonId">
              <td><strong>{{ item.nombre }}</strong></td>
              <td>$ {{ item.precio }}</td>
              <td>
                <div class="row-actions"><button class="table-btn" @click="abrirEditar('salones', item)">Editar</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </template>

      <!-- MÉTODOS DE PAGO -->
      <template v-else-if="tabActivo === 'metodos-pago'">
        <div class="section-header">
          <div>
            <h2>Métodos de Pago</h2>
            <p class="section-sub">Formas de pago disponibles en el sistema.</p>
          </div>
          <button class="btn-primary" @click="abrirModal('metodos-pago')">+ Nuevo método</button>
        </div>
        <div v-if="loading" class="empty-state">Cargando...</div>
        <div v-else-if="!listas['metodos-pago'].length" class="empty-state">No hay métodos de pago registrados.</div>
        <table v-else class="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th class="th-actions">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in listas['metodos-pago']" :key="item.metodoPagoId">
              <td><strong>{{ item.nombre }}</strong></td>
              <td>
                <div class="row-actions">
                  <button class="table-btn" @click="abrirEditar('metodos-pago', item)">Editar</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </template>

      <!-- COBRADORES -->
      <template v-else-if="tabActivo === 'cobradores'">
        <div class="section-header">
          <div>
            <h2>Cobradores</h2>
            <p class="section-sub">Personas responsables de la cobranza mensual por zona.</p>
          </div>
          <button class="btn-primary" @click="abrirModal('cobradores')">+ Nuevo cobrador</button>
        </div>
        <div v-if="loading" class="empty-state">Cargando...</div>
        <div v-else-if="!listas.cobradores.length" class="empty-state">No hay cobradores registrados.</div>
        <table v-else class="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>DNI</th>
              <th>Teléfono</th>
              <th>Zona</th>
              <th>Usuario vinculado</th>
              <th class="th-actions">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in listas.cobradores" :key="item.cobradoresId">
              <td><strong>{{ item.nombre }}</strong></td>
              <td class="mono">{{ item.dni }}</td>
              <td>{{ item.telefono }}</td>
              <td><span class="badge badge-neutral">{{ item.zona }}</span></td>
              <td>
                <span v-if="item.usuarioId" class="badge badge-success">
                  {{ nombreUsuario(item.usuarioId) }}
                </span>
                <span v-else class="text-muted">Sin vincular</span>
              </td>
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
        <form @submit.prevent="guardarModal" class="modal-form">
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
              <button type="button" class="btn-toggle" :class="{ 'active-success': modal.form.esVitalicio === true }"
                @click="modal.form.esVitalicio = true">Sí</button>
              <button type="button" class="btn-toggle" :class="{ 'active-neutral': modal.form.esVitalicio === false }"
                @click="modal.form.esVitalicio = false">No</button>
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="cerrarModal">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="modal.saving">{{ modal.saving ? "Guardando..." :
              "Guardar"
              }}</button>
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
        <form @submit.prevent="guardarModal" class="modal-form">
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

          <!-- Selector de usuario con rol cobrador -->
          <div class="field">
            <label>Usuario del sistema</label>
            <p class="field-hint">Vinculá este cobrador con un usuario para que pueda iniciar sesión y ver sus
              cobranzas.
            </p>
            <div v-if="loadingUsuarios" class="empty-state-sm">Cargando usuarios...</div>
            <select v-else v-model="modal.form.usuarioId" class="select-usuario">
              <option :value="null">— Sin vincular —</option>
              <option v-for="u in usuariosCobrador" :key="u.usuarioId" :value="u.usuarioId"
                :disabled="usuarioYaVinculado(u.usuarioId)">
                {{ u.nombre }} ({{ u.email }})
                {{ usuarioYaVinculado(u.usuarioId) ? " — ya vinculado" : "" }}
              </option>
            </select>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="cerrarModal">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="modal.saving">{{ modal.saving ? "Guardando..." :
              "Guardar"
              }}</button>
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
  { key: "salones", label: "Salones", icon: "🏠" },
  { key: "metodos-pago", label: "Métodos de Pago", icon: "💳" },
  { key: "cobradores", label: "Cobradores", icon: "🧾" },
]

const config = {
  "tipos-socio-pena": {
    endpoint: "/tipos-socio-pena",
    idField: "tipoSocioPenaId",
    defaultForm: () => ({ nombre: "", precio: "", esVitalicio: false }),
  },
  "tipos-socio-boca": {
    endpoint: "/tipos-socio-boca",
    idField: "tipoSocioBocaId",
    defaultForm: () => ({ nombre: "" }),
  },
  salones: {
    endpoint: "/salones",
    idField: "salonId",
    defaultForm: () => ({ nombre: "", precio: "" }),
  },
  "metodos-pago": {
    endpoint: "/metodos-pago",
    idField: "metodoPagoId",
    defaultForm: () => ({ nombre: "" }),
  },
  cobradores: {
    endpoint: "/cobradores",
    idField: "cobradoresId",
    defaultForm: () => ({ nombre: "", dni: "", telefono: "", zona: "", usuarioId: null }),
  },
}

const tabActivo = ref("tipos-socio-pena")
const loading = ref(false)
const loadingUsuarios = ref(false)
const error = ref(null)
const toast = ref(null)

// Lista de usuarios con rol cobrador para el selector
const usuariosCobrador = ref([])

const listas = reactive({
  "tipos-socio-pena": [],
  "tipos-socio-boca": [],
  salones: [],
  "metodos-pago": [],
  cobradores: [],
})

const modal = reactive({
  abierto: false,
  editando: false,
  itemId: null,
  saving: false,
  form: {},
})

const tabLabel = computed(() => tabs.find(t => t.key === tabActivo.value)?.label || "")

// ── Helpers ──────────────────────────────────────────────────────────────────

function mostrarToast(msg) {
  toast.value = msg
  setTimeout(() => { toast.value = null }, 3000)
}

// Devuelve el nombre del usuario dado su id (para mostrarlo en la tabla)
function nombreUsuario(usuarioId) {
  const u = usuariosCobrador.value.find(u => u.usuarioId === usuarioId)
  return u ? u.nombre : `Usuario #${usuarioId}`
}

// Retorna true si ese usuarioId ya está vinculado a otro cobrador (excepto el que se está editando)
function usuarioYaVinculado(usuarioId) {
  return listas.cobradores.some(c => {
    if (modal.editando && c.cobradoresId === modal.itemId) return false
    return c.usuarioId === usuarioId
  })
}

// ── Carga de datos ────────────────────────────────────────────────────────────

async function cargarTab(tab) {
  loading.value = true
  error.value = null
  try {
    const { data } = await http.get(config[tab].endpoint)
    listas[tab] = Array.isArray(data) ? data : []
  } catch {
    error.value = `No se pudo cargar ${tabs.find(t => t.key === tab)?.label ?? tab}. Intentá de nuevo.`
  } finally {
    loading.value = false
  }
}

// Carga usuarios con rol cobrador para el selector del modal
async function cargarUsuariosCobrador() {
  loadingUsuarios.value = true
  try {
    // GET /usuarios devuelve todos; filtramos los que tienen cobrador = true
    const { data } = await http.get("/usuarios")
    const lista = Array.isArray(data) ? data : []
    usuariosCobrador.value = lista.filter(u => u.cobrador === true)
  } catch {
    // Si falla no bloqueamos el modal, el select queda vacío
    usuariosCobrador.value = []
  } finally {
    loadingUsuarios.value = false
  }
}

// ── Navegación de tabs ────────────────────────────────────────────────────────

function cambiarTab(tab) {
  if (tabActivo.value === tab) return
  tabActivo.value = tab
  cargarTab(tab)
  // Al entrar a cobradores cargamos también los usuarios
  if (tab === "cobradores") cargarUsuariosCobrador()
}

// ── Modal ─────────────────────────────────────────────────────────────────────

function abrirModal(tab) {
  modal.abierto = true
  modal.editando = false
  modal.itemId = null
  modal.form = config[tab].defaultForm()
  if (tab === "cobradores") cargarUsuariosCobrador()
}

function abrirEditar(tab, item) {
  modal.abierto = true
  modal.editando = true
  modal.itemId = item[config[tab].idField]
  modal.form = { ...config[tab].defaultForm(), ...item }
  if (tab === "cobradores") cargarUsuariosCobrador()
}

function cerrarModal() {
  modal.abierto = false
  modal.editando = false
  modal.itemId = null
  modal.form = {}
}

// ── Validación ────────────────────────────────────────────────────────────────

function yaExisteOtroVitalicio() {
  if (tabActivo.value !== "tipos-socio-pena") return false
  if (!modal.form.esVitalicio) return false
  return listas["tipos-socio-pena"].some(item => {
    if (modal.editando && Number(item.tipoSocioPenaId) === Number(modal.itemId)) return false
    return Boolean(item.esVitalicio)
  })
}

function validarModal() {
  const tab = tabActivo.value
  const f = modal.form

  if (!String(f.nombre ?? "").trim()) return "El nombre es obligatorio."

  if ((tab === "tipos-socio-pena" || tab === "salones") && f.precio !== "" && Number(f.precio) < 0)
    return "El precio no puede ser negativo."

  if (tab === "cobradores") {
    if (!String(f.dni ?? "").trim()) return "El DNI es obligatorio."
    if (!String(f.telefono ?? "").trim()) return "El teléfono es obligatorio."
    if (!String(f.zona ?? "").trim()) return "La zona es obligatoria."
  }

  if (yaExisteOtroVitalicio())
    return "Ya existe un tipo de socio marcado como vitalicio. No se puede crear otro."

  return null
}

// ── Payload ───────────────────────────────────────────────────────────────────

function buildPayload() {
  const tab = tabActivo.value
  const f = modal.form

  if (tab === "tipos-socio-pena") {
    return {
      nombre: String(f.nombre ?? "").trim(),
      precio: f.precio !== "" && f.precio != null ? String(f.precio) : null,
      esVitalicio: Boolean(f.esVitalicio),
    }
  }

  if (tab === "salones") {
    return {
      nombre: String(f.nombre ?? "").trim(),
      precio: f.precio !== "" && f.precio != null ? String(f.precio) : "0",
    }
  }

  if (tab === "cobradores") {
    return {
      nombre: String(f.nombre ?? "").trim(),
      dni: String(f.dni ?? "").trim(),
      telefono: String(f.telefono ?? "").trim(),
      zona: String(f.zona ?? "").trim(),
      usuarioId: f.usuarioId ?? null,   // ← incluye el vínculo
    }
  }

  return { nombre: String(f.nombre ?? "").trim() }
}

// ── Guardar ───────────────────────────────────────────────────────────────────

async function guardarModal() {
  const validacion = validarModal()
  if (validacion) { error.value = validacion; return }

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
    mostrarToast(`✅ ${modal.editando ? "Cambios guardados." : "Creado correctamente."}`)
  } catch {
    error.value = "No se pudo guardar. Revisá los datos e intentá de nuevo."
  } finally {
    modal.saving = false
  }
}

// ── Init ──────────────────────────────────────────────────────────────────────

onMounted(() => {
  cargarTab(tabActivo.value)
})
</script>

<style scoped>
.tabs-bar {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px 18px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: white;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: var(--shadow);
}

.tab-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.tab-btn.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.tab-content {
  padding: 24px;
}

.error-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 10px;
  padding: 14px 18px;
  margin-bottom: 16px;
  color: #991b1b;
  font-size: 13px;
  font-weight: 600;
}

.error-msg {
  flex: 1;
}

.error-close {
  background: none;
  border: none;
  color: #991b1b;
  cursor: pointer;
  font-size: 16px;
}

.toast {
  position: fixed;
  bottom: 30px;
  right: 30px;
  background: var(--primary);
  color: white;
  padding: 12px 22px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 9999;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.mono {
  font-family: monospace;
  font-size: 12px;
}

.badge-neutral {
  background: #f1f5f9;
  color: #475569;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
}

.badge-success {
  background: rgba(16, 185, 129, 0.1);
  color: #065f46;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
}

.text-muted {
  color: var(--text-muted);
  font-size: 12px;
}

.field-hint {
  font-size: 12px;
  color: var(--text-muted);
  margin: 0 0 6px;
}

.select-usuario {
  width: 100%;
  padding: 9px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 13px;
  background: white;
  color: var(--text);
  cursor: pointer;
}

.select-usuario:focus {
  outline: none;
  border-color: var(--primary);
}

.empty-state-sm {
  font-size: 13px;
  color: var(--text-muted);
  padding: 8px 0;
}
</style>