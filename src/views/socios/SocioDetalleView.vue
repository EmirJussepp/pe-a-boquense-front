<template>
  <div class="detalle-page">
    <section class="page-head card">
      <div>
        <p class="eyebrow">Socios</p>
        <h1>{{ socio?.apellido }} {{ socio?.nombre }}</h1>
        <p class="muted">
          Detalle completo del socio.
        </p>
      </div>

      <div class="head-actions">
        <button class="btn-secondary" @click="goBack">
          Volver
        </button>

        <button class="btn-primary" @click="editarSocio">
          Editar
        </button>
      </div>
    </section>

    <section class="card detalle-grid" v-if="socio">
      <div class="detalle-item">
        <label>DNI</label>
        <strong>{{ socio.dni || "-" }}</strong>
      </div>

      <div class="detalle-item">
        <label>Email</label>
        <strong>{{ socio.email || "-" }}</strong>
      </div>

      <div class="detalle-item">
        <label>Teléfono</label>
        <strong>{{ socio.telefono || socio.celular || "-" }}</strong>
      </div>

      <div class="detalle-item">
        <label>Dirección</label>
        <strong>{{ socio.direccion || "-" }}</strong>
      </div>

      <div class="detalle-item">
        <label>Localidad</label>
        <strong>{{ socio.localidadNombre || socio.localidad || "-" }}</strong>
      </div>

      <div class="detalle-item">
        <label>Cobrador</label>
        <strong>{{ socio.cobradorNombre || "-" }}</strong>
      </div>

      <div class="detalle-item">
        <label>Tipo socio peña</label>
        <strong>{{ socio.tipoSocioPenaNombre || "-" }}</strong>
      </div>

      <div class="detalle-item">
        <label>Tipo socio boca</label>
        <strong>{{ socio.tipoSocioBocaNombre || "-" }}</strong>
      </div>

      <div class="detalle-item full">
        <label>Observaciones</label>
        <p class="muted">{{ socio.observaciones || "Sin observaciones" }}</p>
      </div>
    </section>

    <section v-else class="card empty-state">
      Cargando socio...
    </section>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import { sociosService } from "../../services/sociosService"

const route = useRoute()
const router = useRouter()

const socio = ref(null)

async function loadSocio() {
  try {
    const { data } = await sociosService.porId(route.params.id)
    socio.value = data
  } catch (error) {
    console.error("ERROR SOCIO DETAIL >>>", error)
  }
}

function goBack() {
  router.push("/socios/activos")
}

function editarSocio() {
  router.push(`/socios/${route.params.id}/editar`)
}

onMounted(loadSocio)
</script>

<style scoped>
.detalle-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-head {
  padding: 22px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.head-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.detalle-grid {
  padding: 22px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.detalle-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detalle-item label {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
}

.detalle-item strong {
  font-size: 1rem;
}

.detalle-item.full {
  grid-column: 1 / -1;
}

.empty-state {
  padding: 40px;
  text-align: center;
  color: var(--text-muted);
}

@media (max-width: 1000px) {
  .detalle-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .detalle-grid {
    grid-template-columns: 1fr;
  }

  .page-head {
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
  }
}
</style>