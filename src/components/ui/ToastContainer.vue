<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="t in toasts"
          :key="t.id"
          class="toast-item"
          :class="t.tipo"
        >
          <span class="toast-icon">{{ icons[t.tipo] }}</span>
          <span class="toast-text">{{ t.texto }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useToast } from "../../composables/useToast"

const { toasts } = useToast()

const icons = {
  success: "✓",
  error: "✕",
  info: "ℹ",
  warning: "⚠",
}
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 28px;
  right: 28px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
}

.toast-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px 20px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  min-width: 260px;
  max-width: 380px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.15);
  pointer-events: all;
}

.toast-item.success { background: #15803d; color: white; }
.toast-item.error   { background: #b91c1c; color: white; }
.toast-item.info    { background: var(--primary); color: white; }
.toast-item.warning { background: #9c6e1e; color: white; }

.toast-icon {
  font-size: 15px;
  font-weight: 900;
  flex-shrink: 0;
}

/* Animación */
.toast-enter-active { animation: slideIn 0.3s ease; }
.toast-leave-active { animation: slideOut 0.25s ease forwards; }

@keyframes slideIn {
  from { opacity: 0; transform: translateX(30px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes slideOut {
  from { opacity: 1; transform: translateX(0); }
  to   { opacity: 0; transform: translateX(30px); }
}
</style>