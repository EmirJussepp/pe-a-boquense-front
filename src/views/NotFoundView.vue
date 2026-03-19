<template>
  <div class="not-found">
    <h1 class="code">404</h1>
    <p class="message">La página que buscás no existe.</p>
    <button class="btn-primary" @click="$router.push('/inicio')">Ir al inicio</button>
  </div>
</template>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 16px;
  text-align: center;
}
.code {
  font-size: 6rem;
  font-weight: 900;
  color: var(--primary);
  margin: 0;
  line-height: 1;
}
.message {
  font-size: 1.1rem;
  color: var(--text-muted);
  margin: 0;
}
</style>
