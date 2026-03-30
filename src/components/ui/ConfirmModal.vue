<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="modal-overlay" @click.self="cancel">
        <div class="modal-box">
          <div class="modal-icon">
            <component :is="iconComponent" :size="42" :stroke-width="1.5" />
          </div>
          <h3 class="modal-title">{{ config.title }}</h3>
          <p class="modal-msg">{{ config.message }}</p>
          <div class="modal-actions">
            <button class="btn-secondary" @click="cancel">Cancelar</button>
            <button
              class="btn-confirm"
              :class="`btn-${config.variant}`"
              @click="confirm"
            >
              {{ config.confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, reactive, computed } from "vue"
import { AlertTriangle, CheckCircle, CreditCard, Info } from "lucide-vue-next"

const variantIcons = {
  danger: AlertTriangle,
  success: CheckCircle,
  warning: AlertTriangle,
  info: Info,
}

const visible = ref(false)
const config = reactive({
  title: "",
  message: "",
  confirmLabel: "Confirmar",
  variant: "danger",
})

const iconComponent = computed(() => variantIcons[config.variant] ?? AlertTriangle)

let resolveFn = null

function open(options = {}) {
  Object.assign(config, {
    title: options.title ?? "",
    message: options.message ?? "",
    confirmLabel: options.confirmLabel ?? "Confirmar",
    variant: options.variant ?? "danger",
  })
  visible.value = true
  return new Promise((resolve) => {
    resolveFn = resolve
  })
}

function confirm() {
  visible.value = false
  resolveFn?.(true)
}

function cancel() {
  visible.value = false
  resolveFn?.(false)
}

defineExpose({ open })
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9998;
  padding: 16px;
}
.modal-box {
  background: white;
  border-radius: 16px;
  padding: 32px 28px;
  max-width: 420px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}
.modal-icon { display: flex; justify-content: center; margin-bottom: 14px; }
.modal-title { margin: 0 0 10px; font-size: 18px; font-weight: 800; color: #0f172a; }
.modal-msg { margin: 0 0 26px; color: #64748b; font-size: 14px; line-height: 1.6; }
.modal-actions { display: flex; gap: 12px; justify-content: center; }
.modal-actions .btn-secondary { min-width: 100px; }
.btn-confirm {
  min-width: 120px; padding: 10px 20px;
  border-radius: 10px; border: none;
  font-weight: 700; font-size: 14px;
  cursor: pointer; transition: all 0.15s;
}
.btn-danger  { background: #dc2626; color: white; }
.btn-danger:hover  { background: #b91c1c; }
.btn-success { background: #16a34a; color: white; }
.btn-success:hover { background: #15803d; }
.btn-warning { background: #d97706; color: white; }
.btn-warning:hover { background: #b45309; }

.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-active .modal-box, .modal-leave-active .modal-box { transition: transform 0.2s ease; }
.modal-enter-from .modal-box, .modal-leave-to .modal-box { transform: scale(0.95); }
</style>