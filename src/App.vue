<template>
  <div class="nav-progress-bar" :class="{ active: navigating }" />
  <router-view v-slot="{ Component, route }">
    <Transition mode="out-in">
      <component :is="Component" :key="route.path" />
    </Transition>
  </router-view>
  <ToastContainer />
</template>

<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"
import ToastContainer from "./components/ui/ToastContainer.vue"

const router = useRouter()
const navigating = ref(false)

router.beforeEach(() => { navigating.value = true })
router.afterEach(() => { navigating.value = false })
</script>

<style>
.nav-progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--accent, #f1b44c);
  z-index: 9999;
  transform: scaleX(0);
  transform-origin: left;
  opacity: 0;
  transition: transform 0.4s ease, opacity 0.2s ease;
  pointer-events: none;
}
.nav-progress-bar.active {
  transform: scaleX(0.85);
  opacity: 1;
}

/* ── Transición de páginas ───────────────────────────── */
.fade-page-enter-active,
.fade-page-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.fade-page-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.fade-page-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
