<template>
  <div class="socio-form-page">
    <section class="page-head card">
      <div>
        <p class="eyebrow">Socios</p>
        <h1>{{ isEdit ? "Editar socio" : "Nuevo socio" }}</h1>
        <p class="page-subtitle">
          {{ isEdit ? "Modificar información del socio." : "Registrar un nuevo socio en la peña." }}
        </p>
      </div>

      <div class="head-actions">
        <button class="btn-secondary" @click="volver">
          Volver
        </button>
      </div>
    </section>

    <form class="card form-card" @submit.prevent="guardar">
      <div class="form-section">
        <h2>Datos personales</h2>

        <div class="form-grid">
          <div class="field">
            <label>Nombre</label>
            <input v-model="form.nombre" required />
          </div>

          <div class="field">
            <label>Apellido</label>
            <input v-model="form.apellido" required />
          </div>

          <div class="field">
            <label>DNI</label>
            <input v-model="form.dni" />
          </div>
        </div>
      </div>

      <div class="form-section">
        <h2>Contacto</h2>

        <div class="form-grid">
          <div class="field">
            <label>Email</label>
            <input v-model="form.email" type="email" />
          </div>

          <div class="field">
            <label>Teléfono</label>
            <input v-model="form.telefono" />
          </div>

          <div class="field">
            <label>Dirección</label>
            <input v-model="form.direccion" />
          </div>
        </div>
      </div>

      <div class="form-section">
        <h2>Información del socio</h2>

        <div class="form-grid">
          <div class="field">
            <label>Localidad</label>
            <input v-model="form.localidadNombre" />
          </div>

          <div class="field">
            <label>Cobrador</label>
            <input v-model="form.cobradorNombre" />
          </div>

          <div class="field">
            <label>Tipo socio peña</label>
            <input v-model="form.tipoSocioPenaNombre" />
          </div>

          <div class="field">
            <label>Tipo socio Boca</label>
            <input v-model="form.tipoSocioBocaNombre" />
          </div>
        </div>
      </div>

      <div class="form-section">
        <h2>Observaciones</h2>

        <div class="field">
          <textarea
            v-model="form.observaciones"
            rows="4"
            placeholder="Notas internas sobre el socio..."
          />
        </div>
      </div>

      <div class="form-actions">
        <button
          type="submit"
          class="btn-primary"
          :disabled="loading"
        >
          {{ loading ? "Guardando..." : "Guardar socio" }}
        </button>

        <button
          type="button"
          class="btn-secondary"
          @click="volver"
        >
          Cancelar
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, computed } from "vue"
import { useRouter, useRoute } from "vue-router"
import { sociosService } from "../../services/sociosService"

const router = useRouter()
const route = useRoute()

const loading = ref(false)

const form = reactive({
  nombre: "",
  apellido: "",
  dni: "",
  email: "",
  telefono: "",
  direccion: "",
  localidadNombre: "",
  cobradorNombre: "",
  tipoSocioPenaNombre: "",
  tipoSocioBocaNombre: "",
  observaciones: "",
})

const isEdit = computed(() => !!route.params.id)

async function cargarSocio() {
  if (!isEdit.value) return

  try {
    const { data } = await sociosService.porId(route.params.id)
    Object.assign(form, data)
  } catch (error) {
    console.error("ERROR CARGANDO SOCIO >>>", error)
  }
}

async function guardar() {
  loading.value = true

  try {
    if (isEdit.value) {
      await sociosService.editar(route.params.id, form)
    } else {
      await sociosService.crear(form)
    }

    router.push("/socios/activos")
  } catch (error) {
    console.error("ERROR GUARDAR SOCIO >>>", error)
  } finally {
    loading.value = false
  }
}

function volver() {
  router.push("/socios/activos")
}

onMounted(cargarSocio)
</script>

<style scoped>
.socio-form-page {
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

.form-card {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.form-section h2 {
  margin: 0 0 14px;
  font-size: 1.1rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field input,
.field textarea {
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.03);
  color: var(--text);
}

.field textarea {
  resize: vertical;
  min-height: 110px;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 10px;
  flex-wrap: wrap;
}

@media (max-width: 900px) {
  .page-head {
    flex-direction: column;
    align-items: stretch;
  }

  .form-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions :deep(button) {
    width: 100%;
  }
}
</style>