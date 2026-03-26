<template>
  <div class="notif-wrapper" ref="wrapperRef">

    <!-- Botón campanita -->
    <button
      class="bell-btn"
      :class="{ 'has-notifs': morosos.length > 0 }"
      @click="toggleDropdown"
      title="Notificaciones"
    >
      <BellRing v-if="morosos.length > 0" :size="20" />
      <Bell v-else :size="20" />
      <span v-if="morosos.length > 0" class="notif-badge">
        {{ morosos.length > 9 ? "9+" : morosos.length }}
      </span>
    </button>

    <!-- Dropdown -->
    <Transition name="notif-fade">
      <div v-if="open" class="notif-dropdown">

        <div class="notif-header">
          <span class="notif-titulo">Alertas</span>
          <button class="notif-refresh" @click.stop="cargar" :disabled="loading" title="Actualizar">
            <RefreshCw :size="13" :class="{ rotating: loading }" />
          </button>
        </div>

        <!-- Cargando -->
        <div v-if="loading" class="notif-loading">
          <span class="spinner"></span>
          <span>Cargando...</span>
        </div>

        <!-- Sin morosos -->
        <div v-else-if="!morosos.length" class="notif-empty">
          <CheckCircle :size="28" class="empty-icon" />
          <p>Sin socios morosos</p>
        </div>

        <!-- Lista de morosos -->
        <template v-else>
          <div class="notif-summary">
            <AlertCircle :size="15" class="summary-icon" />
            <span>
              <strong>{{ morosos.length }} socio{{ morosos.length !== 1 ? "s" : "" }}</strong>
              con 3 o más meses adeudados
            </span>
          </div>

          <ul class="notif-list">
            <li
              v-for="m in morososVisibles"
              :key="m.socioId"
              class="notif-item"
              @click="irASocio(m.socioId)"
              :title="`Ver ${m.nombre} ${m.apellido}`"
            >
              <div class="item-avatar">{{ iniciales(m) }}</div>
              <div class="item-body">
                <p class="item-nombre">{{ m.apellido }}, {{ m.nombre }}</p>
                <p class="item-deuda">{{ m.mesesDeuda }} mes{{ m.mesesDeuda !== 1 ? "es" : "" }} adeudados</p>
              </div>
              <span class="item-badge" :class="nivelDeuda(m.mesesDeuda)">
                {{ m.mesesDeuda }}
              </span>
            </li>
          </ul>

          <button v-if="morosos.length > MAX_VISIBLE" class="notif-ver-todos" @click="irACobranzas">
            Ver los {{ morosos.length }} morosos →
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
import { Bell, BellRing, AlertCircle, CheckCircle, RefreshCw } from "lucide-vue-next"
import { useAuthStore } from "../../stores/auth"
import { cuotasService } from "../../services/cuotasService"

const MAX_VISIBLE = 5

const router = useRouter()
const auth = useAuthStore()
const wrapperRef = ref(null)

const open = ref(false)
const loading = ref(false)
const morosos = ref([])
const ultimaActualizacion = ref("—")

const morososVisibles = computed(() => morosos.value.slice(0, MAX_VISIBLE))

function iniciales(m) {
  const a = (m.apellido || "").charAt(0).toUpperCase()
  const n = (m.nombre || "").charAt(0).toUpperCase()
  return `${a}${n}`
}

function nivelDeuda(meses) {
  if (meses >= 6) return "badge-danger"
  if (meses >= 4) return "badge-warning"
  return "badge-info"
}

function toggleDropdown() {
  open.value = !open.value
}

function irASocio(socioId) {
  open.value = false
  router.push(`/socios/${socioId}`)
}

function irACobranzas() {
  open.value = false
  router.push("/cuotas/cobranzas")
}

async function cargar() {
  if (!auth.puedeVerCuotas) return
  loading.value = true
  try {
    const { data } = await cuotasService.morosos(3)
    morosos.value = Array.isArray(data) ? data : []
    ultimaActualizacion.value = new Intl.DateTimeFormat("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date())
  } catch {
    morosos.value = []
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

/* ── Bell button ─────────────────────────────── */
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
  background: #dc2626;
  color: #fff;
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

/* ── Dropdown ────────────────────────────────── */
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

/* ── Loading ─────────────────────────────────── */
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

/* ── Empty ───────────────────────────────────── */
.notif-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 26px 16px;
  color: var(--text-muted);
}
.empty-icon { color: #22c55e; }
.notif-empty p { margin: 0; font-size: 13px; font-weight: 600; }

/* ── Summary banner ──────────────────────────── */
.notif-summary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(220, 38, 38, 0.05);
  border-bottom: 1px solid rgba(220, 38, 38, 0.1);
  font-size: 12px;
  color: #b91c1c;
}
.summary-icon { flex-shrink: 0; color: #dc2626; }

/* ── List ────────────────────────────────────── */
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

.item-deuda {
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
.badge-info    { background: rgba(59,130,246,0.12); color: #1d4ed8; }
.badge-warning { background: rgba(245,158,11,0.12); color: #b45309; }
.badge-danger  { background: rgba(220,38,38,0.12);  color: #b91c1c; }

/* ── Ver todos ───────────────────────────────── */
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

/* ── Footer ──────────────────────────────────── */
.notif-footer {
  padding: 7px 16px;
  border-top: 1px solid var(--border);
  font-size: 11px;
  color: var(--text-muted);
  background: #fafbfc;
}

/* ── Transition ──────────────────────────────── */
.notif-fade-enter-active,
.notif-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.notif-fade-enter-from,
.notif-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
}

/* ── Animations ──────────────────────────────── */
@keyframes spin { to { transform: rotate(360deg); } }
.rotating { animation: spin 0.7s linear infinite; }
</style>
