<template>
  <div v-if="paginacion.totalPages > 1" class="paginador">
    <button
      class="btn-pag"
      :disabled="paginacion.page === 1"
      @click="$emit('cambiar', paginacion.page - 1)"
    >
      <ChevronLeft :size="14" /> Anterior
    </button>
    <span class="pag-info">
      Página {{ paginacion.page }} de {{ paginacion.totalPages }}
      <span class="pag-total">({{ paginacion.total }} {{ label }})</span>
    </span>
    <button
      class="btn-pag"
      :disabled="paginacion.page === paginacion.totalPages"
      @click="$emit('cambiar', paginacion.page + 1)"
    >
      Siguiente <ChevronRight :size="14" />
    </button>
  </div>
</template>

<script setup>
import { ChevronLeft, ChevronRight } from "lucide-vue-next"

defineProps({
  paginacion: {
    type: Object,
    required: true,
  },
  label: {
    type: String,
    default: "registros",
  },
})

defineEmits(["cambiar"])
</script>
