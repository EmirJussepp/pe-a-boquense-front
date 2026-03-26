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
        <span class="tab-label">{{ tab.label }}</span>
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
        <div v-else class="table-scroll">
          <table class="data-table">
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
                  <div class="row-actions"><button class="table-btn" @click="abrirEditar('tipos-socio-pena', item)">Editar</button></div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
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
        <div v-else class="table-scroll">
          <table class="data-table">
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
                  <div class="row-actions"><button class="table-btn" @click="abrirEditar('tipos-socio-boca', item)">Editar</button></div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
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
        <div v-else class="table-scroll">
          <table class="data-table">
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
                  <div class="row-actions"><button class="table-btn" @click="abrirEditar('salones', item)">Editar</button></div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
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
        <div v-else class="table-scroll">
          <table class="data-table">
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
        </div>
      </template>

      <!-- USUARIOS -->
      <template v-else-if="tabActivo === 'usuarios'">
        <div class="section-header">
          <div>
            <h2>Usuarios del sistema</h2>
            <p class="section-sub">Gestioná los accesos y roles de cada usuario.</p>
          </div>
          <button class="btn-primary" @click="abrirUsuarioModal()">+ Nuevo usuario</button>
        </div>
        <div v-if="loading" class="empty-state">Cargando...</div>
        <div v-else-if="!listas.usuarios.length" class="empty-state">No hay usuarios registrados.</div>
        <div v-else class="table-scroll">
          <table class="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Estado</th>
                <th>Roles</th>
                <th class="th-actions">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in listas.usuarios" :key="u.usuarioId">
                <td><strong>{{ u.nombre }}</strong></td>
                <td class="text-mono">{{ u.email }}</td>
                <td>
                  <span class="badge" :class="u.activo ? 'badge-success' : 'badge-inactive'">
                    {{ u.activo ? "Activo" : "Inactivo" }}
                  </span>
                </td>
                <td>
                  <div class="roles-list">
                    <span v-if="u.admin" class="badge badge-admin">Admin</span>
                    <span v-if="u.cobrador" class="badge badge-cobrador">Cobrador</span>
                    <span v-if="u.rolViajes" class="badge badge-viajes">Viajes</span>
                    <span v-if="u.rolAlquileres" class="badge badge-alquileres">Alquileres</span>
                    <span v-if="!u.admin && !u.cobrador && !u.rolViajes && !u.rolAlquileres" class="text-muted">Sin roles</span>
                  </div>
                </td>
                <td>
                  <div class="row-actions">
                    <button class="table-btn" @click="abrirUsuarioModal(u)">Editar</button>
                    <button class="table-btn table-btn-outline" @click="abrirCambiarPassword(u)">Contraseña</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
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
        <div v-else class="table-scroll">
          <table class="data-table">
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
        </div>
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
              <button type="button" class="btn-toggle" :class="{ 'active-success': modal.form.esVitalicio === true }" @click="modal.form.esVitalicio = true">Sí</button>
              <button type="button" class="btn-toggle" :class="{ 'active-neutral': modal.form.esVitalicio === false }" @click="modal.form.esVitalicio = false">No</button>
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="cerrarModal">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="modal.saving">{{ modal.saving ? "Guardando..." : "Guardar" }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL USUARIO -->
    <div v-if="usuarioModal.abierto" class="modal-overlay" @click.self="cerrarUsuarioModal">
      <div class="modal-card modal-card-lg">
        <div class="modal-header">
          <h3>{{ usuarioModal.editando ? "Editar usuario" : "Nuevo usuario" }}</h3>
          <button class="modal-close" @click="cerrarUsuarioModal">✕</button>
        </div>
        <form @submit.prevent="guardarUsuario" class="modal-form">
          <div class="form-grid-2">
            <div class="field">
              <label>Nombre <span class="required">*</span></label>
              <input v-model="usuarioModal.form.nombre" type="text" placeholder="Nombre completo..." required />
            </div>
            <div class="field">
              <label>Email <span class="required">*</span></label>
              <input v-model="usuarioModal.form.email" type="email" placeholder="correo@ejemplo.com" required />
            </div>
          </div>
          <div v-if="!usuarioModal.editando" class="field">
            <label>Contraseña <span class="required">*</span></label>
            <input v-model="usuarioModal.form.password" type="password" placeholder="Mínimo 6 caracteres..." required minlength="6" />
          </div>
          <div v-if="usuarioModal.editando" class="field">
            <label>Estado</label>
            <div class="toggle-group">
              <button type="button" class="btn-toggle" :class="{ 'active-success': usuarioModal.form.activo === true }" @click="usuarioModal.form.activo = true">Activo</button>
              <button type="button" class="btn-toggle" :class="{ 'active-neutral': usuarioModal.form.activo === false }" @click="usuarioModal.form.activo = false">Inactivo</button>
            </div>
          </div>
          <div class="field">
            <label>Roles</label>
            <p class="field-hint">Seleccioná los permisos que tendrá este usuario.</p>
            <div class="roles-checks">
              <label class="role-check">
                <input type="checkbox" v-model="usuarioModal.form.admin" />
                <span class="role-check-badge badge-admin">Admin</span>
                <span class="role-check-desc">Acceso total al sistema</span>
              </label>
              <label class="role-check">
                <input type="checkbox" v-model="usuarioModal.form.cobrador" />
                <span class="role-check-badge badge-cobrador">Cobrador</span>
                <span class="role-check-desc">Gestión de cuotas y cobranzas</span>
              </label>
              <label class="role-check">
                <input type="checkbox" v-model="usuarioModal.form.rolViajes" />
                <span class="role-check-badge badge-viajes">Viajes</span>
                <span class="role-check-desc">Gestión de viajes a la Bombonera</span>
              </label>
              <label class="role-check">
                <input type="checkbox" v-model="usuarioModal.form.rolAlquileres" />
                <span class="role-check-badge badge-alquileres">Alquileres</span>
                <span class="role-check-desc">Gestión de alquileres del salón</span>
              </label>
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="cerrarUsuarioModal">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="usuarioModal.saving">
              {{ usuarioModal.saving ? "Guardando..." : "Guardar" }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL CAMBIAR CONTRASEÑA -->
    <div v-if="pwModal.abierto" class="modal-overlay" @click.self="cerrarPwModal">
      <div class="modal-card">
        <div class="modal-header">
          <h3>Cambiar contraseña — {{ pwModal.nombre }}</h3>
          <button class="modal-close" @click="cerrarPwModal">✕</button>
        </div>
        <form @submit.prevent="guardarPassword" class="modal-form">
          <div class="field">
            <label>Nueva contraseña <span class="required">*</span></label>
            <input v-model="pwModal.newPassword" type="password" placeholder="Mínimo 6 caracteres..." required minlength="6" />
          </div>
          <div class="field">
            <label>Confirmar contraseña <span class="required">*</span></label>
            <input v-model="pwModal.confirm" type="password" placeholder="Repetí la contraseña..." required />
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="cerrarPwModal">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="pwModal.saving">
              {{ pwModal.saving ? "Guardando..." : "Cambiar contraseña" }}
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
          <div class="field">
            <label>Usuario del sistema</label>
            <p class="field-hint">Vinculá este cobrador con un usuario para que pueda iniciar sesión.</p>
            <div v-if="loadingUsuarios" class="empty-state-sm">Cargando usuarios...</div>
            <select v-else v-model="modal.form.usuarioId" class="select-usuario">
              <option :value="null">— Sin vincular —</option>
              <option v-for="u in usuariosCobrador" :key="u.usuarioId" :value="u.usuarioId"
                :disabled="usuarioYaVinculado(u.usuarioId)">
                {{ u.nombre }} ({{ u.email }}){{ usuarioYaVinculado(u.usuarioId) ? " — ya vinculado" : "" }}
              </option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="cerrarModal">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="modal.saving">{{ modal.saving ? "Guardando..." : "Guardar" }}</button>
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
  { key: "usuarios", label: "Usuarios", icon: "🔐" },
]

const config = {
  "tipos-socio-pena": { endpoint: "/tipos-socio-pena", idField: "tipoSocioPenaId", defaultForm: () => ({ nombre: "", precio: "", esVitalicio: false }) },
  "tipos-socio-boca": { endpoint: "/tipos-socio-boca", idField: "tipoSocioBocaId", defaultForm: () => ({ nombre: "" }) },
  salones: { endpoint: "/salones", idField: "salonId", defaultForm: () => ({ nombre: "", precio: "" }) },
  "metodos-pago": { endpoint: "/metodos-pago", idField: "metodoPagoId", defaultForm: () => ({ nombre: "" }) },
  cobradores: { endpoint: "/cobradores", idField: "cobradoresId", defaultForm: () => ({ nombre: "", dni: "", telefono: "", zona: "", usuarioId: null }) },
  usuarios: { endpoint: "/usuarios", idField: "usuarioId", defaultForm: () => ({}) },
}

const tabActivo = ref("tipos-socio-pena")
const loading = ref(false)
const loadingUsuarios = ref(false)
const error = ref(null)
const toast = ref(null)
const usuariosCobrador = ref([])

const listas = reactive({
  "tipos-socio-pena": [], "tipos-socio-boca": [], salones: [], "metodos-pago": [], cobradores: [], usuarios: [],
})

const usuarioModal = reactive({ abierto: false, editando: false, itemId: null, saving: false, form: {} })
function defaultUsuarioForm() { return { nombre: "", email: "", password: "", activo: true, admin: false, cobrador: false, rolViajes: false, rolAlquileres: false } }
function abrirUsuarioModal(usuario = null) {
  usuarioModal.abierto = true; usuarioModal.editando = !!usuario; usuarioModal.itemId = usuario?.usuarioId ?? null
  usuarioModal.form = usuario ? { nombre: usuario.nombre, email: usuario.email, activo: usuario.activo, admin: usuario.admin, cobrador: usuario.cobrador, rolViajes: usuario.rolViajes, rolAlquileres: usuario.rolAlquileres } : defaultUsuarioForm()
}
function cerrarUsuarioModal() { usuarioModal.abierto = false; usuarioModal.editando = false; usuarioModal.itemId = null; usuarioModal.form = {} }
async function guardarUsuario() {
  error.value = null; const f = usuarioModal.form
  if (!String(f.nombre ?? "").trim()) { error.value = "El nombre es obligatorio."; return }
  if (!String(f.email ?? "").trim() || !f.email.includes("@")) { error.value = "Ingresá un email válido."; return }
  if (!usuarioModal.editando && (!f.password || f.password.length < 6)) { error.value = "La contraseña debe tener al menos 6 caracteres."; return }
  usuarioModal.saving = true
  try {
    if (usuarioModal.editando) {
      await http.put(`/usuarios/${usuarioModal.itemId}`, { nombre: f.nombre.trim(), email: f.email.trim(), activo: f.activo, admin: f.admin, cobrador: f.cobrador, rolViajes: f.rolViajes, rolAlquileres: f.rolAlquileres })
    } else {
      await http.post("/usuarios", { nombre: f.nombre.trim(), email: f.email.trim(), password: f.password, admin: f.admin, cobrador: f.cobrador, rolViajes: f.rolViajes, rolAlquileres: f.rolAlquileres })
    }
    const wasEditing = usuarioModal.editando; cerrarUsuarioModal(); await cargarTab("usuarios")
    mostrarToast(wasEditing ? "✅ Usuario actualizado." : "✅ Usuario creado correctamente.")
  } catch (e) {
    error.value = e?.response?.data?.error ?? "No se pudo guardar el usuario."
  } finally { usuarioModal.saving = false }
}

const pwModal = reactive({ abierto: false, itemId: null, nombre: "", newPassword: "", confirm: "", saving: false })
function abrirCambiarPassword(usuario) { pwModal.abierto = true; pwModal.itemId = usuario.usuarioId; pwModal.nombre = usuario.nombre; pwModal.newPassword = ""; pwModal.confirm = "" }
function cerrarPwModal() { pwModal.abierto = false; pwModal.itemId = null; pwModal.nombre = ""; pwModal.newPassword = ""; pwModal.confirm = "" }
async function guardarPassword() {
  error.value = null
  if (pwModal.newPassword.length < 6) { error.value = "La contraseña debe tener al menos 6 caracteres."; return }
  if (pwModal.newPassword !== pwModal.confirm) { error.value = "Las contraseñas no coinciden."; return }
  pwModal.saving = true
  try { await http.patch(`/usuarios/${pwModal.itemId}/password`, { newPassword: pwModal.newPassword }); cerrarPwModal(); mostrarToast("✅ Contraseña actualizada correctamente.") }
  catch { error.value = "No se pudo cambiar la contraseña." }
  finally { pwModal.saving = false }
}

const modal = reactive({ abierto: false, editando: false, itemId: null, saving: false, form: {} })
const tabLabel = computed(() => tabs.find(t => t.key === tabActivo.value)?.label || "")
function mostrarToast(msg) { toast.value = msg; setTimeout(() => { toast.value = null }, 3000) }
function nombreUsuario(usuarioId) { const u = usuariosCobrador.value.find(u => u.usuarioId === usuarioId); return u ? u.nombre : `Usuario #${usuarioId}` }
function usuarioYaVinculado(usuarioId) { return listas.cobradores.some(c => { if (modal.editando && c.cobradoresId === modal.itemId) return false; return c.usuarioId === usuarioId }) }

async function cargarTab(tab) {
  loading.value = true; error.value = null
  try { const { data } = await http.get(config[tab].endpoint); listas[tab] = Array.isArray(data) ? data : [] }
  catch { error.value = `No se pudo cargar ${tabs.find(t => t.key === tab)?.label ?? tab}.` }
  finally { loading.value = false }
}
async function cargarUsuariosCobrador() {
  loadingUsuarios.value = true
  try { const { data } = await http.get("/usuarios"); const lista = Array.isArray(data) ? data : []; usuariosCobrador.value = lista.filter(u => u.cobrador === true) }
  catch { usuariosCobrador.value = [] }
  finally { loadingUsuarios.value = false }
}
function cambiarTab(tab) { if (tabActivo.value === tab) return; tabActivo.value = tab; cargarTab(tab); if (tab === "cobradores") cargarUsuariosCobrador() }
function abrirModal(tab) { modal.abierto = true; modal.editando = false; modal.itemId = null; modal.form = config[tab].defaultForm(); if (tab === "cobradores") cargarUsuariosCobrador() }
function abrirEditar(tab, item) { modal.abierto = true; modal.editando = true; modal.itemId = item[config[tab].idField]; modal.form = { ...config[tab].defaultForm(), ...item }; if (tab === "cobradores") cargarUsuariosCobrador() }
function cerrarModal() { modal.abierto = false; modal.editando = false; modal.itemId = null; modal.form = {} }
function yaExisteOtroVitalicio() { if (tabActivo.value !== "tipos-socio-pena") return false; if (!modal.form.esVitalicio) return false; return listas["tipos-socio-pena"].some(item => { if (modal.editando && Number(item.tipoSocioPenaId) === Number(modal.itemId)) return false; return Boolean(item.esVitalicio) }) }
function validarModal() {
  const tab = tabActivo.value; const f = modal.form
  if (!String(f.nombre ?? "").trim()) return "El nombre es obligatorio."
  if ((tab === "tipos-socio-pena" || tab === "salones") && f.precio !== "" && Number(f.precio) < 0) return "El precio no puede ser negativo."
  if (tab === "cobradores") { if (!String(f.dni ?? "").trim()) return "El DNI es obligatorio."; if (!String(f.telefono ?? "").trim()) return "El teléfono es obligatorio."; if (!String(f.zona ?? "").trim()) return "La zona es obligatoria." }
  if (yaExisteOtroVitalicio()) return "Ya existe un tipo de socio vitalicio."
  return null
}
function buildPayload() {
  const tab = tabActivo.value; const f = modal.form
  if (tab === "tipos-socio-pena") return { nombre: String(f.nombre ?? "").trim(), precio: f.precio !== "" && f.precio != null ? String(f.precio) : null, esVitalicio: Boolean(f.esVitalicio) }
  if (tab === "salones") return { nombre: String(f.nombre ?? "").trim(), precio: f.precio !== "" && f.precio != null ? String(f.precio) : "0" }
  if (tab === "cobradores") return { nombre: String(f.nombre ?? "").trim(), dni: String(f.dni ?? "").trim(), telefono: String(f.telefono ?? "").trim(), zona: String(f.zona ?? "").trim(), usuarioId: f.usuarioId ?? null }
  return { nombre: String(f.nombre ?? "").trim() }
}
async function guardarModal() {
  const validacion = validarModal(); if (validacion) { error.value = validacion; return }
  modal.saving = true; error.value = null; const { endpoint } = config[tabActivo.value]
  try { const payload = buildPayload(); if (modal.editando) { await http.put(`${endpoint}/${modal.itemId}`, payload) } else { await http.post(endpoint, payload) }; cerrarModal(); await cargarTab(tabActivo.value); mostrarToast(`✅ ${modal.editando ? "Cambios guardados." : "Creado correctamente."}`) }
  catch { error.value = "No se pudo guardar. Revisá los datos e intentá de nuevo." }
  finally { modal.saving = false }
}
onMounted(() => { cargarTab(tabActivo.value) })
</script>

<style scoped>
/* ── BASE ─────────────────────────────────────────────────── */
.page { display: flex; flex-direction: column; gap: 16px; padding: 28px 32px; }
.page-head { padding: 22px; display: flex; justify-content: space-between; align-items: center; gap: 16px; }
.page-head-copy { min-width: 0; }
.eyebrow { margin: 0 0 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--accent); font-weight: 800; }
.page-head h1 { margin: 0 0 4px; font-size: clamp(1.6rem, 3vw, 2rem); font-weight: 900; color: var(--primary); }
.page-subtitle { margin: 0; color: var(--text-muted); font-size: 14px; }

/* ── TABS ─────────────────────────────────────────────────── */
.tabs-bar { display: flex; gap: 8px; flex-wrap: wrap; }
.tab-btn {
  display: flex; align-items: center; gap: 7px;
  padding: 10px 16px; border-radius: 10px; border: 1px solid var(--border);
  background: white; font-size: 13px; font-weight: 600; color: var(--text-muted);
  cursor: pointer; transition: all 0.2s; box-shadow: var(--shadow);
  white-space: nowrap;
}
.tab-btn:hover { border-color: var(--primary); color: var(--primary); }
.tab-btn.active { background: var(--primary); color: white; border-color: var(--primary); }
.tab-label { display: inline; }

/* ── CONTENT ──────────────────────────────────────────────── */
.tab-content { padding: 24px; }

.section-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  gap: 16px; margin-bottom: 20px; flex-wrap: wrap;
}
.section-header h2 { margin: 0 0 4px; font-size: 18px; font-weight: 800; color: var(--primary); }
.section-sub { margin: 0; font-size: 13px; color: var(--text-muted); }

/* ── TABLE ────────────────────────────────────────────────── */
.table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
.data-table { width: 100%; border-collapse: collapse; min-width: 400px; }
.data-table th { text-align: left; padding: 10px 14px; font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.6px; font-weight: 800; background: #f8fafc; border-bottom: 2px solid var(--border); }
.data-table td { padding: 13px 14px; border-bottom: 1px solid var(--bg); font-size: 13px; vertical-align: middle; }
.data-table tbody tr:hover { background: rgba(0,59,122,0.02); }
.th-actions { text-align: center; }
.row-actions { display: flex; gap: 6px; justify-content: center; flex-wrap: wrap; }
.table-btn { padding: 7px 14px; border-radius: 8px; border: 1px solid var(--border); font-size: 12px; font-weight: 700; cursor: pointer; background: white; color: var(--primary); transition: all 0.15s; white-space: nowrap; }
.table-btn:hover { background: var(--bg); }
.table-btn-outline { background: transparent; border: 1px solid var(--border); color: var(--text-muted); }
.table-btn-outline:hover { border-color: var(--primary); color: var(--primary); background: transparent; }

/* ── BADGES ───────────────────────────────────────────────── */
.badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }
.badge-neutral  { background: #f1f5f9; color: #475569; }
.badge-success  { background: rgba(16,185,129,0.1); color: #065f46; }
.badge-inactive { background: #fef2f2; color: #991b1b; }
.badge-admin      { background: #ede9fe; color: #5b21b6; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }
.badge-cobrador   { background: #fef9ec; color: #9c6e1e; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }
.badge-viajes     { background: #eff6ff; color: #1d4ed8; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }
.badge-alquileres { background: #f0fdf4; color: #15803d; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }

/* ── MISC ─────────────────────────────────────────────────── */
.roles-list { display: flex; flex-wrap: wrap; gap: 5px; }
.mono { font-family: monospace; font-size: 12px; }
.text-mono { font-family: monospace; font-size: 12px; }
.text-muted { color: var(--text-muted); font-size: 12px; }
.empty-state { text-align: center; color: var(--text-muted); padding: 30px; font-size: 13px; }
.empty-state-sm { font-size: 13px; color: var(--text-muted); padding: 8px 0; }

/* ── ERROR / TOAST ────────────────────────────────────────── */
.error-banner { display: flex; align-items: center; gap: 12px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; padding: 14px 18px; color: #991b1b; font-size: 13px; font-weight: 600; }
.error-msg { flex: 1; }
.error-close { background: none; border: none; color: #991b1b; cursor: pointer; font-size: 16px; }
.toast { position: fixed; bottom: 30px; right: 30px; background: var(--primary); color: white; padding: 12px 22px; border-radius: 10px; font-size: 13px; font-weight: 700; box-shadow: 0 4px 20px rgba(0,0,0,0.15); z-index: 9999; max-width: calc(100vw - 40px); }
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(10px); }

/* ── MODAL ────────────────────────────────────────────────── */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; z-index: 999; padding: 16px; }
.modal-card { background: white; border-radius: 14px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto; }
.modal-card-lg { max-width: 560px; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px 16px; border-bottom: 1px solid var(--border); gap: 12px; }
.modal-header h3 { margin: 0; font-size: 16px; font-weight: 800; color: var(--primary); min-width: 0; }
.modal-close { background: none; border: none; font-size: 18px; cursor: pointer; color: var(--text-muted); padding: 4px 8px; border-radius: 6px; flex-shrink: 0; }
.modal-close:hover { background: var(--bg); }
.modal-form { display: flex; flex-direction: column; gap: 16px; padding: 20px 24px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; flex-wrap: wrap; padding-top: 4px; }

/* ── FORM FIELDS ──────────────────────────────────────────── */
.form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.field { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.field label { font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.4px; }
.field-hint { font-size: 12px; color: var(--text-muted); margin: 0 0 4px; }
.required { color: #dc2626; }
.input-prefix-wrap { display: flex; align-items: stretch; border: 1px solid var(--border); border-radius: 10px; overflow: hidden; background: white; }
.input-prefix { padding: 0 12px; font-weight: 700; color: var(--text-muted); border-right: 1px solid var(--border); display: flex; align-items: center; background: #f8fafc; font-size: 13px; }
.input-prefix-wrap input { border: none !important; border-radius: 0 !important; flex: 1; box-shadow: none !important; }
.toggle-group { display: flex; gap: 8px; flex-wrap: wrap; }
.btn-toggle { border: 1px solid var(--border); background: white; border-radius: 8px; padding: 10px 14px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.15s; color: var(--text-soft); }
.btn-toggle:hover { background: var(--bg); }
.active-success { background: rgba(34,197,94,0.1); border-color: rgba(34,197,94,0.4); color: #15803d; }
.active-neutral  { background: rgba(148,163,184,0.15); border-color: rgba(148,163,184,0.35); color: #475569; }
.select-usuario { width: 100%; padding: 9px 12px; border: 1px solid var(--border); border-radius: 8px; font-size: 13px; background: white; color: var(--text); cursor: pointer; box-sizing: border-box; }
.roles-checks { display: flex; flex-direction: column; gap: 10px; margin-top: 4px; }
.role-check { display: flex; align-items: center; gap: 10px; cursor: pointer; padding: 8px 12px; border-radius: 8px; border: 1px solid var(--border); transition: background 0.15s; }
.role-check:hover { background: var(--bg-soft, #f8fafc); }
.role-check input[type="checkbox"] { width: 16px; height: 16px; accent-color: var(--primary); cursor: pointer; flex-shrink: 0; }
.role-check-badge { flex-shrink: 0; }
.role-check-desc { font-size: 12px; color: var(--text-muted); }

/* ── RESPONSIVO ───────────────────────────────────────────── */

@media (max-width: 900px) {
  .page { padding: 20px 24px; }
}

@media (max-width: 768px) {
  .page { padding: 16px; }
  .page-head { padding: 16px; flex-direction: column; align-items: stretch; }
  .tab-content { padding: 16px; }

  /* Tabs: scroll horizontal si no caben */
  .tabs-bar { flex-wrap: nowrap; overflow-x: auto; -webkit-overflow-scrolling: touch; padding-bottom: 4px; }
  .tab-btn { flex-shrink: 0; padding: 9px 12px; font-size: 12px; }

  /* Section header se apila */
  .section-header { flex-direction: column; align-items: stretch; }
  .section-header button { width: 100%; }

  /* Modal: ocupa más pantalla */
  .modal-card, .modal-card-lg { max-width: 100%; margin: 0; border-radius: 16px 16px 0 0; }
  .modal-overlay { align-items: flex-end; padding: 0; }
  .modal-form { padding: 16px; }
  .modal-header { padding: 16px 16px 12px; }
  .modal-actions { flex-direction: column; }
  .modal-actions button { width: 100%; }

  /* Form grid en modal: 1 col */
  .form-grid-2 { grid-template-columns: 1fr; }
}

@media (max-width: 480px) {
  /* Tabs: solo icono para ahorrar espacio */
  .tab-label { display: none; }
  .tab-btn { padding: 10px 12px; gap: 0; font-size: 16px; }

  /* Toast no desborda */
  .toast { bottom: 16px; right: 16px; left: 16px; text-align: center; }
}
</style>