<template>
  <div class="page">

    <section class="page-head card">
      <div class="page-head-copy">
        <p class="eyebrow">Bombonera</p>
        <h1>Viajes</h1>
        <p class="page-subtitle">Organización de viajes a la Bombonera.</p>
      </div>
      <div class="head-actions">
        <button class="btn-secondary" @click="loadViajes" :disabled="loading">
          {{ loading ? "Actualizando..." : "Actualizar" }}
        </button>
        <button class="btn-primary" @click="nuevoViaje">+ Nuevo viaje</button>
      </div>
    </section>

    <section class="table-wrap card">
      <div class="table-top">
        <h2>Listado</h2>
        <p class="muted">{{ rows.length }} viaje(s)</p>
      </div>

      <div v-if="loading" class="empty-state">Cargando viajes...</div>
      <div v-else-if="!rows.length" class="empty-state">No hay viajes registrados.</div>

      <div v-else class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Destino</th>
              <th>Fecha del Viaje</th>
              <th>Pagos</th>
              <th class="th-actions">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="v in rows" :key="v.viajeBomboneraId">
              <td>{{ v.viajeBomboneraId }}</td>
              <td><strong>{{ v.destino }}</strong></td>
              <td>{{ formatearFecha(v.fechaViaje) }}</td>
              <td>
                <button class="btn-pagos" @click="verPagos(v)">
                  Ver pagos
                </button>
              </td>
              <td>
                <div class="row-actions">
                  <button class="table-btn" @click="editarViaje(v)">Editar</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- MODAL PAGOS DEL VIAJE -->
    <div v-if="modalPagos.abierto" class="modal-overlay" @click.self="modalPagos.abierto = false">
      <div class="modal-card" style="width: 560px;">
        <div class="modal-header">
          <h3>Pagos — {{ modalPagos.viaje?.destino }}</h3>
          <button class="modal-close" @click="modalPagos.abierto = false">✕</button>
        </div>

        <div v-if="modalPagos.loading" class="empty-state" style="padding: 20px;">Cargando...</div>
        <div v-else-if="!modalPagos.pagos.length" class="empty-state" style="padding: 20px;">Sin pagos registrados.</div>
        <div v-else class="table-scroll">
          <table class="data-table">
            <thead>
              <tr><th>Nombre</th><th>DNI</th><th>Monto</th></tr>
            </thead>
            <tbody>
              <tr v-for="p in modalPagos.pagos" :key="p.viajePagoId">
                <td>{{ p.apellido ? `${p.apellido}, ${p.nombre}` : p.nombre || "—" }}</td>
                <td>{{ p.dni || "—" }}</td>
                <td>$ {{ formatoMoneda(p.monto) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="modal-footer" style="display:flex; justify-content:space-between; align-items:center;">
          <span class="muted">Total: <strong>$ {{ totalPagos }}</strong></span>
          <button class="btn-primary" @click="nuevoPago(modalPagos.viaje)">+ Registrar pago</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { onMounted, reactive, ref, computed } from "vue"
import { useRouter } from "vue-router"
import { http } from "../../services/http"
import { useToast } from "../../composables/useToast"

const router = useRouter()
const toast = useToast()
const loading = ref(false)
const rows = ref([])

const modalPagos = reactive({ abierto: false, loading: false, viaje: null, pagos: [] })

const totalPagos = computed(() =>
  formatoMoneda(modalPagos.pagos.reduce((acc, p) => acc + Number(p.monto || 0), 0))
)

async function loadViajes() {
  loading.value = true
  try {
    const { data } = await http.get("/viajes-bombonera")
    rows.value = data || []
  } catch { toast.error("Error al cargar los viajes.") }
  finally { loading.value = false }
}

async function verPagos(viaje) {
  modalPagos.viaje = viaje
  modalPagos.abierto = true
  modalPagos.loading = true
  modalPagos.pagos = []
  try {
    const { data } = await http.get(`/viajes-pagos/viaje/${viaje.viajeBomboneraId}`)
    modalPagos.pagos = data || []
  } catch { toast.error("No se pudieron cargar los pagos.") }
  finally { modalPagos.loading = false }
}

function nuevoViaje() { router.push("/viajes/nuevo") }
function editarViaje(v) { router.push(`/viajes/${v.viajeBomboneraId}/editar`) }
function nuevoPago(v) { router.push(`/viajes/${v.viajeBomboneraId}/pago`) }

function formatearFecha(f) {
  if (!f) return "—"
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(f))
}
function formatoMoneda(n) {
  return Number(n || 0).toLocaleString("es-AR", { minimumFractionDigits: 2 })
}

onMounted(loadViajes)
</script>

<style scoped>
.btn-pagos {
  background: var(--primary-soft);
  color: var(--primary);
  border: 1px solid var(--border-strong);
  border-radius: 6px;
  padding: 5px 12px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}
.btn-pagos:hover { background: var(--primary); color: white; }
</style>