<template>
  <div class="pager" v-if="mostrarPaginador">
    <div class="pager-info">
      <p class="pager-text">
        Página <strong>{{ paginaActual }}</strong> de <strong>{{ totalPages }}</strong>
        <span v-if="total > 0" class="pager-total">
          · {{ total }} {{ label }}
        </span>
      </p>

      <p v-if="desde <= hasta && total > 0" class="pager-range">
        Mostrando <strong>{{ desde }}</strong> a <strong>{{ hasta }}</strong>
      </p>
    </div>

    <div class="pager-controls">
      <button
        class="pager-btn pager-btn-icon"
        :disabled="loading || paginaActual <= 1"
        @click="$emit('cambiar', 1)"
        title="Primera página"
      >
        «
      </button>

      <button
        class="pager-btn"
        :disabled="loading || paginaActual <= 1"
        @click="$emit('cambiar', paginaActual - 1)"
      >
        ‹ Anterior
      </button>

      <div class="pager-pages" v-if="pagesToShow.length">
        <button
          v-for="item in pagesToShow"
          :key="item.key"
          class="pager-btn pager-page-btn"
          :class="{
            active: item.type === 'page' && item.value === paginaActual,
            dots: item.type === 'dots',
          }"
          :disabled="loading || item.type === 'dots'"
          @click="item.type === 'page' && $emit('cambiar', item.value)"
        >
          {{ item.label }}
        </button>
      </div>

      <button
        class="pager-btn"
        :disabled="loading || paginaActual >= totalPages"
        @click="$emit('cambiar', paginaActual + 1)"
      >
        Siguiente ›
      </button>

      <button
        class="pager-btn pager-btn-icon"
        :disabled="loading || paginaActual >= totalPages"
        @click="$emit('cambiar', totalPages)"
        title="Última página"
      >
        »
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue"

const props = defineProps({
  paginacion: { type: Object, required: true },
  label: { type: String, default: "registros" },
  loading: { type: Boolean, default: false },
})

defineEmits(["cambiar"])

const paginaActual = computed(() => Number(props.paginacion?.page ?? 1))
const totalPages = computed(() => Math.max(Number(props.paginacion?.totalPages ?? 1), 1))
const total = computed(() => Number(props.paginacion?.total ?? 0))
const pageSize = computed(() => Number(props.paginacion?.pageSize ?? 10))

const mostrarPaginador = computed(() => totalPages.value >= 1)

const desde = computed(() => {
  if (total.value === 0) return 0
  return (paginaActual.value - 1) * pageSize.value + 1
})

const hasta = computed(() => {
  if (total.value === 0) return 0
  return Math.min(paginaActual.value * pageSize.value, total.value)
})

const pagesToShow = computed(() => {
  const current = paginaActual.value
  const totalP = totalPages.value

  if (totalP <= 7) {
    return Array.from({ length: totalP }, (_, i) => ({
      key: `page-${i + 1}`,
      type: "page",
      value: i + 1,
      label: String(i + 1),
    }))
  }

  const items = []

  items.push({
    key: "page-1",
    type: "page",
    value: 1,
    label: "1",
  })

  if (current > 3) {
    items.push({
      key: "dots-left",
      type: "dots",
      label: "…",
    })
  }

  const start = Math.max(2, current - 1)
  const end = Math.min(totalP - 1, current + 1)

  for (let page = start; page <= end; page++) {
    items.push({
      key: `page-${page}`,
      type: "page",
      value: page,
      label: String(page),
    })
  }

  if (current < totalP - 2) {
    items.push({
      key: "dots-right",
      type: "dots",
      label: "…",
    })
  }

  items.push({
    key: `page-${totalP}`,
    type: "page",
    value: totalP,
    label: String(totalP),
  })

  return items
})
</script>

<style scoped>
.pager {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.pager-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pager-text {
  margin: 0;
  font-size: 13px;
  color: var(--text-muted);
}

.pager-text strong {
  color: var(--primary);
}

.pager-total {
  color: var(--text-soft);
}

.pager-range {
  margin: 0;
  font-size: 12px;
  color: var(--text-muted);
}

.pager-range strong {
  color: var(--text-soft);
}

.pager-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.pager-pages {
  display: flex;
  align-items: center;
  gap: 6px;
}

.pager-btn {
  min-height: 38px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: #fff;
  color: var(--text-soft);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.pager-btn:hover:not(:disabled) {
  border-color: var(--primary);
  color: var(--primary);
  background: #f8fafc;
}

.pager-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.pager-btn-icon {
  min-width: 38px;
  padding: 0;
}

.pager-page-btn {
  min-width: 38px;
  padding: 0 10px;
}

.pager-page-btn.active {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
  box-shadow: 0 6px 14px rgba(0, 59, 122, 0.18);
}

.pager-page-btn.dots {
  cursor: default;
  background: transparent;
  border-style: dashed;
  color: var(--text-muted);
}

@media (max-width: 980px) {
  .pager {
    flex-direction: column;
    align-items: stretch;
  }

  .pager-controls {
    justify-content: flex-start;
  }
}

@media (max-width: 768px) {
  .pager-controls {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .pager-pages {
    grid-column: 1 / -1;
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
  }

  .pager-btn {
    width: 100%;
    justify-content: center;
  }

  .pager-page-btn,
  .pager-btn-icon {
    width: auto;
    min-width: 38px;
  }
}
</style>