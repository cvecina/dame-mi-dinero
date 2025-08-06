<template>
  <div class="flex items-center justify-center h-screen">
    <div class="relative flex items-center justify-center w-24 h-24">
      <div
        class="absolute top-0 left-0 w-full h-full border-t-4 border-blue-500 rounded-full animate-spin"
      ></div>
      <span class="text-xl font-bold">Nombre de la empresa</span>
    </div>
  </div>
</template>
  
  <script setup>
</script>
  
  <style scoped>
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
  