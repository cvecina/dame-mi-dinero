<template>
  <span class="buscador__top w-full md:w-auto">
    <span class="w-full">
      <label class="buscador__label w-full md:w-96">
        <input
          type="text"
          placeholder="Buscar..."
          v-model="datoBuscar"
          class="w-full"
        />
        <img
          class="cursor-pointer ml-2"
          src="@/assets/img/comunes/search.svg"
          @click="buscarDatos(datoBuscar)"
        />
      </label>
    </span>
  </span>
</template>

<script setup>
const emit = defineEmits(["buscarDatos"]);
const datoBuscar = ref("");
const buscarDatos = (datoBuscar) => {
  emit("buscarDatos", datoBuscar);
};

watch(datoBuscar, (value) => {
  if (value === "") {
    emit("buscarDatos", "");
  }
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    emit("buscarDatos", datoBuscar.value);
  }
});
</script>