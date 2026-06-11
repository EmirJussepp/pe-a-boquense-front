<template>
  <div class="notif-wrapper" ref="wrapperRef">

    <button
      class="bell-btn"
      :class="{ 'has-notifs': cumples.length > 0 }"
      @click="toggleDropdown"
      title="Próximos cumpleaños"
    >
      <PartyPopper v-if="cumples.length > 0" :size="20" />
      <Cake v-else :size="20" />
      <span v-if="cumples.length > 0" class="notif-badge">
        {{ cumples.length > 9 ? "9+" : cumples.length }}
      </span>
    </button>

    <Transition name="notif-fade">
      <div v-if="open" class="notif-dropdown">

        <div class="notif-header">
          <span class="notif-titulo">Cumpleaños · próximos 7 días</span>
          <button class="notif-refresh" @click.stop="cargar" :disabled="loading" title="Actualizar">
            <RefreshCw :size="13" :class="{ rotating: loading }" />
          </button>
        </div>

        <div v-if="loading" class="notif-loading">
          <span class="spinner"></span>
          <span>Cargando...</span>
        </div>

        <div v-else-if="!cumples.length" class="notif-empty">
          <Cake :size="28" class="empty-icon" />
          <p>Sin cumpleaños esta semana</p>
        </div>

        <template v-else>
          <div class="notif-summary">
            <Cake :size="15" class="summary-icon" />
            <span>
              <strong>{{ cumples.length }} cumpleaño{{ cumples.length !== 1 ? "s" : "" }}</strong>
              en los próximos 7 días
            </span>
          </div>

          <ul class="notif-list">
            <li
              v-for="c in cumplesVisibles"
              :key="c.socioId"
              class="notif-item"
              @click="irASocio(c.socioId)"
              :title="`Ver ${c.nombre} ${c.apellido}`"
            >
              <div class="item-avatar">{{ iniciales(c) }}</div>
              <div class="item-body">
                <p class="item-nombre">{{ c.apellido }}, {{ c.nombre }}</p>
                <p class="item-detalle">{{ textoCumple(c) }} · cumple {{ c.edad }}</p>
              </div>
              <span class="item-badge" :class="badgeClass(c.diasParaCumple)">
                {{ c.diasParaCumple === 0 ? "🎂" : c.diasParaCumple }}
              </span>
            </li>
          </ul>

          <button v-if="cumples.length > MAX_VISIBLE" class="notif-ver-todos" @click="irASocios">
            Ver los {{ cumples.length }} cumpleaños →
          </button>
        </template>

        <div class="notif-footer">
          Actualizado {{ ultimaActualizacion }}
        </div>

      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue"
import { useRouter } from "vue-router"
import { Cake, PartyPopper, RefreshCw } from "lucide-vue-next"
import { useAuthStore } from "../../stores/auth"
import { sociosService } from "../../services/sociosService"

const MAX_VISIBLE = 5

const router = useRouter()
const auth = useAuthStore()
const wrapperRef = ref(null)

const open = ref(false)
const loading = ref(false)
const cumples = ref([])
const ultimaActualizacion = ref("—")

const cumplesVisibles = computed(() => cumples.value.slice(0, MAX_VISIBLE))

function iniciales(c) {
  const a = (c.apellido || "").charAt(0).toUpperCase()
  const n = (c.nombre || "").charAt(0).toUpperCase()
  return `${a}${n}`
}

function textoCumple(c) {
  if (c.diasParaCumple === 0) return "Cumple HOY"
  if (c.diasParaCumple === 1) return "Cumple mañana"
  return `Cumple en ${c.diasParaCumple} días`
}

function badgeClass(dias) {
  if (dias === 0) return "badge-today"
  if (dias <= 2) return "badge-soon"
  return "badge-week"
}

function toggleDropdown() {
  open.value = !open.value
}

function irASocio(socioId) {
  open.value = false
  router.push(`/socios/${socioId}`)
}

function irASocios() {
  open.value = false
  router.push("/socios/activos")
}

async function cargar() {
  if (!auth.puedeVerSocios) return
  loading.value = true
  try {
    const { data } = await sociosService.cumpleanios(7)
    cumples.value = Array.isArray(data) ? data : []
    ultimaActualizacion.value = new Intl.DateTimeFormat("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date())
  } catch {
    cumples.value = []
  } finally {
    loading.value = false
  }
}

function handleClickOutside(e) {
  if (wrapperRef.value && !wrapperRef.value.contains(e.target)) {
    open.value = false
  }
}

onMounted(() => {
  cargar()
  document.addEventListener("click", handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside)
})
</script>

<style scoped>
.notif-wrapper {
  position: relative;
}

.bell-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.6);
  transition: all 0.18s;
}

.bell-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.bell-btn.has-notifs {
  color: #f1b44c;
}

.notif-badge {
  position: absolute;
  top: 3px;
  right: 3px;
  background: #f1b44c;
  color: var(--primary);
  font-size: 9px;
  font-weight: 800;
  min-width: 16px;
  height: 16px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 3px;
  line-height: 1;
  border: 2px solid var(--primary);
}

.notif-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 310px;
  background: #fff;
  border-radius: 14px;
  border: 1px solid var(--border);
  box-shadow: 0 10px 40px rgba(0, 59, 122, 0.15);
  z-index: 200;
  overflow: hidden;
}

.notif-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 13px 16px 10px;
  border-bottom: 1px solid var(--border);
}

.notif-titulo {
  font-size: 11px;
  font-weight: 800;
  color: var(--primary);
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.notif-refresh {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  transition: all 0.15s;
}
.notif-refresh:hover:not(:disabled) {
  background: var(--bg);
  color: var(--primary);
}
.notif-refresh:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.notif-loading {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 22px 16px;
  justify-content: center;
  font-size: 13px;
  color: var(--text-muted);
}

.spinner {
  width: 15px;
  height: 15px;
  border: 2px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

.notif-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 26px 16px;
  color: var(--text-muted);
}
.empty-icon { color: #cbd5e1; }
.notif-empty p { margin: 0; font-size: 13px; font-weight: 600; }

.notif-summary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(241, 180, 76, 0.08);
  border-bottom: 1px solid rgba(241, 180, 76, 0.18);
  font-size: 12px;
  color: #92611d;
}
.summary-icon { flex-shrink: 0; color: #f1b44c; }

.notif-list {
  list-style: none;
  margin: 0;
  padding: 6px 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 250px;
  overflow-y: auto;
}

.notif-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
}
.notif-item:hover { background: var(--bg); }

.item-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--primary-soft);
  color: var(--primary);
  font-size: 11px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.item-body {
  flex-grow: 1;
  min-width: 0;
}

.item-nombre {
  margin: 0 0 1px;
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-detalle {
  margin: 0;
  font-size: 11px;
  color: var(--text-muted);
}

.item-badge {
  font-size: 11px;
  font-weight: 800;
  min-width: 24px;
  height: 24px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.badge-today { background: rgba(241,180,76,0.18); color: #92611d; }
.badge-soon  { background: rgba(34,197,94,0.12);  color: #166534; }
.badge-week  { background: rgba(59,130,246,0.12); color: #1d4ed8; }

.notif-ver-todos {
  display: block;
  width: 100%;
  padding: 10px 16px;
  background: none;
  border: none;
  border-top: 1px solid var(--border);
  font-size: 12px;
  font-weight: 700;
  color: var(--primary);
  cursor: pointer;
  text-align: center;
  transition: background 0.15s;
}
.notif-ver-todos:hover { background: var(--bg); }

.notif-footer {
  padding: 7px 16px;
  border-top: 1px solid var(--border);
  font-size: 11px;
  color: var(--text-muted);
  background: #fafbfc;
}

.notif-fade-enter-active,
.notif-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.notif-fade-enter-from,
.notif-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
}

@keyframes spin { to { transform: rotate(360deg); } }
.rotating { animation: spin 0.7s linear infinite; }
</style>
