<template>
  <div class="page">
    <section class="page-head card">
      <div class="page-head-copy">
        <p class="eyebrow">Bombonera</p>
        <h1>Registrar Pasajero</h1>
        <p class="page-subtitle" v-if="viaje">
          Viaje: <strong>{{ viaje.destino }}</strong> — {{ formatearFecha(viaje.fechaViaje) }}
        </p>
      </div>
      <div class="head-actions">
        <button class="btn-secondary" @click="volver">Volver</button>
      </div>
    </section>

    <div v-if="loadingData" class="card empty-state">Cargando datos...</div>

    <template v-else>
      <!-- ── PASO 1: ¿Quién viaja? ───────────────────────────── -->
      <section class="card form-card">
        <h3 class="section-title">1. ¿Quién viaja?</h3>

        <div class="tipo-selector">
          <label class="tipo-option" :class="{ active: tipoPasajero === 'socio' }">
            <input type="radio" v-model="tipoPasajero" value="socio" @change="resetPasajero" />
            <span class="tipo-icon"><UserCheck :size="20" /></span>
            <span class="tipo-label">Socio de la peña</span>
          </label>
          <label class="tipo-option" :class="{ active: tipoPasajero === 'familiar' }">
            <input type="radio" v-model="tipoPasajero" value="familiar" @change="resetPasajero" />
            <span class="tipo-icon"><Users :size="20" /></span>
            <span class="tipo-label">Familiar de un socio</span>
          </label>
          <label class="tipo-option" :class="{ active: tipoPasajero === 'externo' }">
            <input type="radio" v-model="tipoPasajero" value="externo" @change="resetPasajero" />
            <span class="tipo-icon"><UserPlus :size="20" /></span>
            <span class="tipo-label">Persona externa</span>
          </label>
        </div>

        <!-- ── SOCIO ──────────────────────────────────────────── -->
        <div v-if="tipoPasajero === 'socio'" class="search-block">
          <div class="search-wrap">
            <input
              v-model="busquedaSocio"
              type="text"
              placeholder="Buscar por apellido o nombre..."
              @input="buscarSocios"
              autocomplete="off"
            />
            <div v-if="sociosSugeridos.length" class="dropdown-lista">
              <button
                v-for="s in sociosSugeridos"
                :key="s.socioId"
                class="dropdown-item"
                @click="seleccionarSocio(s)"
              >
                <strong>{{ s.apellido }}, {{ s.nombre }}</strong>
                <span class="chip">DNI {{ s.dni }}</span>
              </button>
            </div>
          </div>

          <div v-if="socioSeleccionado" class="seleccionado-card">
            <div class="seleccionado-info">
              <span class="seleccionado-nombre">{{ socioSeleccionado.apellido }}, {{ socioSeleccionado.nombre }}</span>
              <span class="chip">DNI {{ socioSeleccionado.dni }}</span>
              <span class="chip chip-green">Socio #{{ socioSeleccionado.socioId }}</span>
            </div>
            <button class="btn-ghost-sm" @click="resetPasajero">Cambiar</button>
          </div>
        </div>

        <!-- ── FAMILIAR DE SOCIO ──────────────────────────────── -->
        <div v-if="tipoPasajero === 'familiar'" class="search-block">
          <div v-if="!socioSeleccionado">
            <p class="hint-label">Primero buscá el socio al que pertenece el familiar:</p>
            <div class="search-wrap">
              <input
                v-model="busquedaSocio"
                type="text"
                placeholder="Buscar socio por apellido o nombre..."
                @input="buscarSocios"
                autocomplete="off"
              />
              <div v-if="sociosSugeridos.length" class="dropdown-lista">
                <button
                  v-for="s in sociosSugeridos"
                  :key="s.socioId"
                  class="dropdown-item"
                  @click="seleccionarSocioParaFamiliar(s)"
                >
                  <strong>{{ s.apellido }}, {{ s.nombre }}</strong>
                  <span class="chip">DNI {{ s.dni }}</span>
                </button>
              </div>
            </div>
          </div>

          <div v-if="socioSeleccionado" class="socio-titular-card">
            <span class="titular-label">Socio titular:</span>
            <span class="titular-nombre">{{ socioSeleccionado.apellido }}, {{ socioSeleccionado.nombre }}</span>
            <button class="btn-ghost-sm" @click="resetPasajero">Cambiar socio</button>
          </div>

          <div v-if="socioSeleccionado && !nuevoFamiliarForm" class="familiares-block">
            <div v-if="loadingFamiliares" class="hint-label">Cargando familiares...</div>
            <template v-else>
              <div v-if="familiaresSocio.length" class="familiares-lista">
                <p class="hint-label">Seleccioná un familiar ya registrado:</p>
                <button
                  v-for="f in familiaresSocio"
                  :key="f.pasajeroId"
                  class="familiar-chip"
                  :class="{ selected: familiarSeleccionado?.pasajeroId === f.pasajeroId }"
                  @click="seleccionarFamiliar(f)"
                >
                  <span>{{ f.apellido }}, {{ f.nombre }}</span>
                  <span v-if="f.parentesco" class="familiar-parentesco">({{ f.parentesco }})</span>
                </button>
              </div>
              <p v-else class="hint-label">No hay familiares registrados para este socio.</p>
              <button class="btn-agregar-familiar" @click="nuevoFamiliarForm = true">
                + Agregar nuevo familiar
              </button>
            </template>
          </div>

          <div v-if="socioSeleccionado && nuevoFamiliarForm" class="nuevo-familiar-form">
            <p class="hint-label">Datos del nuevo familiar:</p>
            <div class="field-grid cols-2">
              <div class="field">
                <label>Nombre <span class="required">*</span></label>
                <input v-model="nuevoFamiliar.nombre" type="text" placeholder="Ej. María" />
              </div>
              <div class="field">
                <label>Apellido <span class="required">*</span></label>
                <input v-model="nuevoFamiliar.apellido" type="text" placeholder="Ej. Pérez" />
              </div>
              <div class="field">
                <label>Parentesco <span class="required">*</span></label>
                <input v-model="nuevoFamiliar.parentesco" type="text" placeholder="Ej. Hijo, Esposa, Padre..." />
              </div>
              <div class="field">
                <label>Teléfono <span class="hint">(para WhatsApp)</span></label>
                <input v-model="nuevoFamiliar.telefono" type="text" placeholder="Ej. 5491123456789" />
              </div>
              <div class="field">
                <label>DNI</label>
                <input v-model="nuevoFamiliar.dni" type="text" placeholder="Ej. 40123456" />
              </div>
            </div>
            <div class="nuevo-familiar-actions">
              <button class="btn-secondary" @click="cancelarNuevoFamiliar">Cancelar</button>
            </div>
            <p class="hint-text">El familiar quedará guardado y lo podrás seleccionar en futuros viajes.</p>
          </div>

          <div v-if="familiarSeleccionado && !nuevoFamiliarForm" class="seleccionado-card">
            <div class="seleccionado-info">
              <span class="seleccionado-nombre">{{ familiarSeleccionado.apellido }}, {{ familiarSeleccionado.nombre }}</span>
              <span v-if="familiarSeleccionado.parentesco" class="chip chip-familiar">{{ familiarSeleccionado.parentesco }}</span>
            </div>
            <button class="btn-ghost-sm" @click="familiarSeleccionado = null">Cambiar</button>
          </div>
        </div>

        <!-- ── PERSONA EXTERNA (buscar o crear) ─────────────── -->
        <div v-if="tipoPasajero === 'externo'" class="search-block">
          <template v-if="!externoSeleccionado && !mostrarFormNuevo">
            <div class="search-wrap">
              <input
                v-model="busquedaExterno"
                type="text"
                placeholder="Buscar por apellido, nombre o DNI..."
                @input="buscarExternos"
                autocomplete="off"
              />
              <div v-if="externosSugeridos.length" class="dropdown-lista">
                <button
                  v-for="p in externosSugeridos"
                  :key="p.pasajeroId"
                  class="dropdown-item"
                  @click="seleccionarExterno(p)"
                >
                  <strong>{{ p.apellido }}, {{ p.nombre }}</strong>
                  <span v-if="p.dni" class="chip">DNI {{ p.dni }}</span>
                  <span v-if="p.telefono" class="chip"><Phone :size="11" style="margin-right:3px;vertical-align:-1px" />{{ p.telefono }}</span>
                </button>
              </div>
            </div>

            <p v-if="busquedaExterno.trim().length >= 2 && !externosSugeridos.length && !buscandoExternos" class="hint-sin-resultados">
              No hay resultados para "<strong>{{ busquedaExterno.trim() }}</strong>".
            </p>

            <button class="btn-registrar-nuevo" @click="mostrarFormNuevo = true">
              <UserPlus :size="14" style="margin-right:6px;vertical-align:-2px" />Registrar nueva persona
            </button>
          </template>

          <div v-if="externoSeleccionado && !mostrarFormNuevo" class="seleccionado-card">
            <div class="seleccionado-info">
              <span class="seleccionado-nombre">{{ externoSeleccionado.apellido }}, {{ externoSeleccionado.nombre }}</span>
              <span v-if="externoSeleccionado.dni" class="chip">DNI {{ externoSeleccionado.dni }}</span>
            </div>
            <button class="btn-ghost-sm" @click="resetPasajero">Cambiar</button>
          </div>

          <div v-if="mostrarFormNuevo" class="nuevo-familiar-form">
            <p class="hint-label">Datos de la nueva persona:</p>
            <div class="field-grid cols-2">
              <div class="field">
                <label>Nombre <span class="required">*</span></label>
                <input v-model="nuevoPasajero.nombre" type="text" placeholder="Ej. Juan" />
              </div>
              <div class="field">
                <label>Apellido <span class="required">*</span></label>
                <input v-model="nuevoPasajero.apellido" type="text" placeholder="Ej. Pérez" />
              </div>
              <div class="field">
                <label>DNI</label>
                <input v-model="nuevoPasajero.dni" type="text" placeholder="Ej. 32123456" />
              </div>
              <div class="field">
                <label>Teléfono <span class="hint">(para WhatsApp)</span></label>
                <input v-model="nuevoPasajero.telefono" type="text" placeholder="Ej. 5491123456789" />
              </div>
            </div>
            <div class="nuevo-familiar-actions">
              <button class="btn-secondary" @click="cancelarNuevoPasajero">Cancelar</button>
            </div>
            <p class="hint-text">Esta persona quedará guardada y podrás seleccionarla en futuros viajes.</p>
          </div>
        </div>
      </section>

      <!-- ── PASO 2: Pago ────────────────────────────────────── -->
      <section class="card form-card">
        <h3 class="section-title">2. Pago</h3>
        <div class="field-grid cols-3">
          <div class="field">
            <label>Monto <span class="required">*</span></label>
            <div class="input-prefix-wrap">
              <span class="input-prefix">$</span>
              <input v-model="form.monto" type="number" min="0" step="0.01" placeholder="0.00" />
            </div>
          </div>
          <div class="field">
            <label>Método de Pago <span class="required">*</span></label>
            <select v-model="form.metodoPagoId">
              <option :value="null" disabled>Seleccionar...</option>
              <option v-for="m in metodosPago" :key="m.metodoPagoId" :value="m.metodoPagoId">{{ m.nombre }}</option>
            </select>
          </div>
          <div class="field">
            <label>Cobrador <span class="required">*</span></label>
            <select v-model="form.cobradorId">
              <option :value="null" disabled>Seleccionar...</option>
              <option v-for="c in cobradores" :key="c.cobradorId ?? c.cobradoresId" :value="c.cobradorId ?? c.cobradoresId">{{ c.nombre }}</option>
            </select>
          </div>
        </div>
      </section>

      <!-- ── Acciones ─────────────────────────────────────────── -->
      <section class="card form-actions-card">
        <button class="btn-secondary" @click="volver">Cancelar</button>
        <button class="btn-primary" :disabled="saving || !canSubmit" @click="guardar">
          {{ saving ? "Guardando..." : "Registrar pasajero" }}
        </button>
      </section>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import { viajesBomboneraService } from "../../services/viajesBomboneraService"
import { viajesPagosService } from "../../services/viajesPagosService"
import { metodosPagoService } from "../../services/metodosPagoService"
import { cobradoresService } from "../../services/cobradoresService"
import { sociosService } from "../../services/sociosService"
import { pasajerosService } from "../../services/pasajerosService"
import { useToast } from "../../composables/useToast"
import { UserCheck, Users, UserPlus, Phone } from "lucide-vue-next"

const route  = useRoute()
const router = useRouter()
const toast  = useToast()

const viajeId     = Number(route.params.id)
const loadingData = ref(false)
const saving      = ref(false)
const viaje       = ref(null)
const metodosPago = ref([])
const cobradores  = ref([])

// ── Tipo de pasajero ──────────────────────────────────────
const tipoPasajero = ref("socio")

// ── Socio ─────────────────────────────────────────────────
const busquedaSocio     = ref("")
const sociosSugeridos   = ref([])
const socioSeleccionado = ref(null)

// ── Familiar de socio ─────────────────────────────────────
const loadingFamiliares    = ref(false)
const familiaresSocio      = ref([])
const familiarSeleccionado = ref(null)
const nuevoFamiliarForm    = ref(false)
const nuevoFamiliar        = reactive({ nombre: "", apellido: "", parentesco: "", telefono: "", dni: "" })

// ── Externo ───────────────────────────────────────────────
const busquedaExterno     = ref("")
const externosSugeridos   = ref([])
const externoSeleccionado = ref(null)
const buscandoExternos    = ref(false)
const mostrarFormNuevo    = ref(false)
const nuevoPasajero       = reactive({ nombre: "", apellido: "", dni: "", telefono: "" })

// ── Formulario económico ──────────────────────────────────
const form = reactive({ monto: "", metodoPagoId: null, cobradorId: null })

// ── Computed ──────────────────────────────────────────────
const pasajeroListo = computed(() => {
  if (tipoPasajero.value === "socio")
    return !!socioSeleccionado.value

  if (tipoPasajero.value === "familiar") {
    if (nuevoFamiliarForm.value)
      return nuevoFamiliar.nombre.trim().length > 0
          && nuevoFamiliar.apellido.trim().length > 0
          && nuevoFamiliar.parentesco.trim().length > 0
    return !!familiarSeleccionado.value
  }

  if (tipoPasajero.value === "externo") {
    if (mostrarFormNuevo.value)
      return nuevoPasajero.nombre.trim().length > 0 && nuevoPasajero.apellido.trim().length > 0
    return !!externoSeleccionado.value
  }

  return false
})

const canSubmit = computed(() =>
  pasajeroListo.value &&
  Number(form.monto) > 0 &&
  Number(form.metodoPagoId) > 0 &&
  Number(form.cobradorId) > 0
)

// ── Helpers ───────────────────────────────────────────────
function volver() { router.push(`/viajes/${viajeId}`) }

function resetPasajero() {
  socioSeleccionado.value    = null
  sociosSugeridos.value      = []
  busquedaSocio.value        = ""
  familiaresSocio.value      = []
  familiarSeleccionado.value = null
  nuevoFamiliarForm.value    = false
  Object.assign(nuevoFamiliar, { nombre: "", apellido: "", parentesco: "", telefono: "", dni: "" })
  externoSeleccionado.value  = null
  externosSugeridos.value    = []
  busquedaExterno.value      = ""
  mostrarFormNuevo.value     = false
  Object.assign(nuevoPasajero, { nombre: "", apellido: "", dni: "", telefono: "" })
}

function cancelarNuevoFamiliar() {
  nuevoFamiliarForm.value = false
  Object.assign(nuevoFamiliar, { nombre: "", apellido: "", parentesco: "", telefono: "", dni: "" })
}

function cancelarNuevoPasajero() {
  mostrarFormNuevo.value = false
  Object.assign(nuevoPasajero, { nombre: "", apellido: "", dni: "", telefono: "" })
}

function formatearFecha(value) {
  if (!value) return "—"
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/)
  if (match) {
    const [, y, mo, d, h = "00", mi = "00"] = match
    return new Intl.DateTimeFormat("es-AR", { dateStyle: "medium", timeStyle: "short" })
      .format(new Date(+y, +mo - 1, +d, +h, +mi))
  }
  return value
}

// ── Búsquedas con debounce ────────────────────────────────
let debounceTimer = null

function buscarSocios() {
  clearTimeout(debounceTimer)
  if (busquedaSocio.value.trim().length < 2) { sociosSugeridos.value = []; return }
  debounceTimer = setTimeout(async () => {
    try {
      const res = await sociosService.activos({ search: busquedaSocio.value.trim(), pageSize: 8 })
      const arr = res.data?.data ?? res.data?.content ?? res.data ?? []
      sociosSugeridos.value = Array.isArray(arr) ? arr : []
    } catch { sociosSugeridos.value = [] }
  }, 350)
}

function buscarExternos() {
  clearTimeout(debounceTimer)
  externosSugeridos.value = []
  if (busquedaExterno.value.trim().length < 2) return
  buscandoExternos.value = true
  debounceTimer = setTimeout(async () => {
    try {
      const res = await pasajerosService.listar({ search: busquedaExterno.value.trim(), pageSize: 8 })
      const arr = res.data?.data ?? res.data ?? []
      externosSugeridos.value = Array.isArray(arr) ? arr.filter(p => !p.socioId) : []
    } catch { externosSugeridos.value = [] }
    finally { buscandoExternos.value = false }
  }, 350)
}

function seleccionarSocio(socio) {
  socioSeleccionado.value = socio
  sociosSugeridos.value   = []
  busquedaSocio.value     = `${socio.apellido}, ${socio.nombre}`
}

async function seleccionarSocioParaFamiliar(socio) {
  socioSeleccionado.value    = socio
  sociosSugeridos.value      = []
  busquedaSocio.value        = `${socio.apellido}, ${socio.nombre}`
  familiarSeleccionado.value = null
  familiaresSocio.value      = []
  loadingFamiliares.value    = true
  try {
    const res = await pasajerosService.listar({ socioId: socio.socioId, pageSize: 50 })
    const arr = res.data?.data ?? res.data ?? []
    familiaresSocio.value = Array.isArray(arr) ? arr.filter(p => p.parentesco) : []
  } catch { familiaresSocio.value = [] }
  finally { loadingFamiliares.value = false }
}

function seleccionarFamiliar(f) {
  familiarSeleccionado.value = familiarSeleccionado.value?.pasajeroId === f.pasajeroId ? null : f
}

function seleccionarExterno(p) {
  externoSeleccionado.value = p
  externosSugeridos.value   = []
  busquedaExterno.value     = `${p.apellido}, ${p.nombre}`
}

// ── Guardar ───────────────────────────────────────────────
async function guardar() {
  if (!canSubmit.value) return
  saving.value = true
  try {
    let pasajeroId = null

    if (tipoPasajero.value === "socio") {
      const socio    = socioSeleccionado.value
      const busqueda = await pasajerosService.listar({ socioId: socio.socioId, pageSize: 20 })
      const arr      = busqueda.data?.data ?? busqueda.data ?? []
      const propio   = Array.isArray(arr) ? arr.find(p => !p.parentesco) : null
      if (propio) {
        pasajeroId = propio.pasajeroId
      } else {
        const res = await pasajerosService.crear({
          nombre: socio.nombre, apellido: socio.apellido,
          dni: socio.dni || null, telefono: socio.telefono || null,
          socioId: socio.socioId, parentesco: null
        })
        pasajeroId = res.data?.pasajeroId ?? null
      }

    } else if (tipoPasajero.value === "familiar") {
      if (nuevoFamiliarForm.value) {
        const res = await pasajerosService.crear({
          nombre:     nuevoFamiliar.nombre.trim(),
          apellido:   nuevoFamiliar.apellido.trim(),
          dni:        nuevoFamiliar.dni.trim()        || null,
          telefono:   nuevoFamiliar.telefono.trim()   || null,
          socioId:    socioSeleccionado.value.socioId,
          parentesco: nuevoFamiliar.parentesco.trim()
        })
        pasajeroId = res.data?.pasajeroId ?? null
      } else {
        pasajeroId = familiarSeleccionado.value.pasajeroId
      }

    } else {
      if (mostrarFormNuevo.value) {
        const res = await pasajerosService.crear({
          nombre:   nuevoPasajero.nombre.trim(),
          apellido: nuevoPasajero.apellido.trim(),
          dni:      nuevoPasajero.dni.trim()      || null,
          telefono: nuevoPasajero.telefono.trim() || null,
          socioId:  null, parentesco: null
        })
        pasajeroId = res.data?.pasajeroId ?? null
      } else {
        pasajeroId = externoSeleccionado.value.pasajeroId
      }
    }

    await viajesPagosService.crear({
      viajeId,
      pasajeroId,
      monto:        String(form.monto),
      metodoPagoId: Number(form.metodoPagoId),
      cobradorId:   Number(form.cobradorId)
    })

    toast.success("Pasajero registrado correctamente.")
    router.push(`/viajes/${viajeId}`)
  } catch (err) {
    console.error(err)
    toast.error(err?.response?.data?.error ?? "No se pudo registrar el pasajero.")
  } finally {
    saving.value = false
  }
}

// ── Carga inicial ─────────────────────────────────────────
onMounted(async () => {
  loadingData.value = true
  try {
    const [viajeRes, metodosRes, cobradoresRes] = await Promise.all([
      viajesBomboneraService.obtener(viajeId),
      metodosPagoService.listar(),
      cobradoresService.listar()
    ])
    viaje.value       = viajeRes.data || null
    metodosPago.value = Array.isArray(metodosRes.data) ? metodosRes.data : []
    cobradores.value  = Array.isArray(cobradoresRes.data) ? cobradoresRes.data : []
    if (metodosPago.value.length) form.metodoPagoId = metodosPago.value[0].metodoPagoId
    if (cobradores.value.length)  form.cobradorId   = cobradores.value[0].cobradorId ?? cobradores.value[0].cobradoresId ?? null
  } catch {
    toast.error("No se pudieron cargar los datos.")
    router.push("/viajes")
  } finally {
    loadingData.value = false
  }
})
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 16px; }

.page-head {
  padding: 22px;
  display: flex; justify-content: space-between; align-items: center;
  gap: 16px; flex-wrap: wrap;
}
.page-head-copy { min-width: 0; }
.eyebrow { margin: 0 0 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--accent); font-weight: 800; }
.page-head h1 { margin: 0 0 4px; font-size: clamp(1.6rem, 3vw, 2rem); font-weight: 900; color: var(--primary); }
.page-subtitle { margin: 0; color: var(--text-muted); font-size: 14px; }
.head-actions { display: flex; gap: 10px; flex-wrap: wrap; justify-content: flex-end; }

.form-card { padding: 24px; display: flex; flex-direction: column; gap: 20px; }
.section-title { margin: 0 0 4px; font-size: 16px; font-weight: 800; color: var(--primary); }

/* Selector de tipo */
.tipo-selector { display: flex; gap: 10px; flex-wrap: wrap; }
.tipo-option {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 20px; border: 2px solid var(--border); border-radius: 10px;
  cursor: pointer; font-size: 13px; font-weight: 600; color: var(--text-muted);
  transition: all 0.15s; flex: 1; min-width: 150px;
}
.tipo-option input { display: none; }
.tipo-option.active { border-color: var(--accent); background: var(--accent-soft, #eff6ff); color: var(--primary); }
.tipo-icon { font-size: 18px; display: flex; align-items: center; justify-content: center; }

/* Search */
.search-block { display: flex; flex-direction: column; gap: 12px; }
.search-wrap { position: relative; }
.search-wrap input { width: 100%; }
.dropdown-lista {
  position: absolute; top: calc(100% + 4px); left: 0; right: 0; z-index: 100;
  background: white; border: 1px solid var(--border); border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0,0,0,.12); max-height: 260px; overflow-y: auto;
}
.dropdown-item {
  width: 100%; text-align: left; padding: 10px 14px;
  border: none; background: none; cursor: pointer;
  display: flex; align-items: center; gap: 8px; font-size: 13px;
  transition: background 0.1s;
}
.dropdown-item:hover { background: #f1f5f9; }

.hint-sin-resultados {
  font-size: 13px; color: var(--text-muted); margin: 0;
  padding: 10px 14px; background: #f8fafc; border-radius: 8px; border: 1px solid var(--border);
}

.btn-registrar-nuevo {
  align-self: flex-start; padding: 8px 18px;
  border: 2px dashed var(--border); border-radius: 8px;
  background: transparent; cursor: pointer; font-size: 13px; font-weight: 700;
  color: var(--text-muted); transition: all 0.15s;
  display: inline-flex; align-items: center;
}
.btn-registrar-nuevo:hover { border-color: var(--accent); color: var(--primary); background: var(--accent-soft, #eff6ff); }

/* Seleccionado */
.seleccionado-card {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px; border: 2px solid var(--accent); border-radius: 10px;
  background: var(--accent-soft, #eff6ff); gap: 10px; flex-wrap: wrap;
}
.seleccionado-info { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.seleccionado-nombre { font-weight: 700; font-size: 14px; color: var(--primary); }

/* Socio titular (familiar) */
.socio-titular-card {
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  padding: 8px 14px; background: #f8fafc; border: 1px solid var(--border); border-radius: 8px;
}
.titular-label { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }
.titular-nombre { font-size: 13px; font-weight: 700; color: var(--primary); flex: 1; }

/* Familiares */
.familiares-block { display: flex; flex-direction: column; gap: 12px; }
.hint-label { margin: 0; font-size: 12px; font-weight: 600; color: var(--text-muted); }
.familiares-lista { display: flex; gap: 8px; flex-wrap: wrap; }
.familiar-chip {
  padding: 6px 14px; border-radius: 20px; border: 2px solid var(--border);
  background: white; font-size: 12px; font-weight: 600; cursor: pointer;
  transition: all 0.15s; display: flex; align-items: center; gap: 6px;
}
.familiar-chip.selected { border-color: var(--accent); background: var(--accent-soft, #eff6ff); color: var(--primary); }
.familiar-parentesco { color: var(--text-muted); font-weight: 400; font-style: italic; }

.btn-agregar-familiar {
  align-self: flex-start; padding: 7px 16px;
  border: 2px dashed var(--border); border-radius: 8px;
  background: transparent; cursor: pointer; font-size: 12px; font-weight: 700;
  color: var(--text-muted); transition: all 0.15s;
}
.btn-agregar-familiar:hover { border-color: var(--accent); color: var(--primary); background: var(--accent-soft, #eff6ff); }

/* Formularios inline */
.nuevo-familiar-form { background: #f8fafc; border: 1px solid var(--border); border-radius: 10px; padding: 16px; display: flex; flex-direction: column; gap: 14px; }
.nuevo-familiar-actions { display: flex; justify-content: flex-end; gap: 8px; }

/* Chips */
.chip {
  padding: 2px 8px; border-radius: 20px;
  background: #e2e8f0; font-size: 11px; font-weight: 600; color: #475569;
  white-space: nowrap; display: inline-flex; align-items: center;
}
.chip-green    { background: #dcfce7; color: #166534; }
.chip-familiar { background: #ede9fe; color: #5b21b6; }

/* Grid / Fields */
.field-grid { display: grid; gap: 16px; }
.cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.field { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.field label { font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.4px; }
.required { color: #dc2626; }
.hint { font-size: 10px; font-weight: 400; color: var(--text-muted); }
.hint-text { margin: 0; font-size: 12px; color: var(--text-muted); font-style: italic; }

.input-prefix-wrap { display: flex; align-items: stretch; border: 1px solid var(--border); border-radius: 10px; overflow: hidden; background: white; }
.input-prefix { padding: 0 12px; font-weight: 700; color: var(--text-muted); border-right: 1px solid var(--border); display: flex; align-items: center; background: #f8fafc; font-size: 13px; }
.input-prefix-wrap input { border: none !important; border-radius: 0 !important; flex: 1; box-shadow: none !important; }

/* Acciones */
.form-actions-card { padding: 16px 24px; display: flex; justify-content: flex-end; gap: 10px; flex-wrap: wrap; }

.btn-ghost-sm { padding: 4px 10px; border: 1px solid var(--border); border-radius: 6px; background: white; cursor: pointer; font-size: 12px; font-weight: 600; color: var(--text-muted); }
.btn-ghost-sm:hover { background: #f1f5f9; }

.empty-state { min-height: 120px; display: grid; place-items: center; color: var(--text-muted); font-size: 14px; }

@media (max-width: 980px) {
  .page-head { flex-direction: column; align-items: stretch; }
  .cols-3 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 640px) {
  .form-card, .form-actions-card { padding: 16px; }
  .cols-2, .cols-3 { grid-template-columns: 1fr; }
  .tipo-selector { flex-direction: column; }
  .form-actions-card { flex-direction: column; }
  .form-actions-card button { width: 100%; }
}
</style>
