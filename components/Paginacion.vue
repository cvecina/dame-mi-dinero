<template>
  <div class="flex flex-col justify-center items-center mt-[12px]">
    <div class="join">
      <button
        class="join-item bg-white border-[#CED1DA] text-[#7C808C]"
        @click="goPrev()"
        :disabled="paginaActiva === 1"
      >
        <img src="@/assets/img/comunes/flecha_izq_paginacion.svg" />
      </button>
      <div
        v-for="pags in paginasVisibles"
        :key="pags"
        class="text-[#7c808c] flex m-2"
      >
        <button
          class="join-item bg-white border-1 border-[#CED1DA]"
          @click="goToPage(pags)"
          :class="{ 'text-[#0097b2]': paginaActiva === pags }"
        >
          {{ pags }}
        </button>
      </div>
      <button
        class="join-item bg-white border-[#CED1DA] text-[#7C808C]"
        @click="goNext()"
        :disabled="paginaActiva === totalPaginas"
      >
        <img src="@/assets/img/comunes/flecha_derecha_paginacion.svg" />
      </button>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(["cambiarPagina"]);

const props = defineProps({
  totalData: Number,
  limit: Number,
  offset: Number,
});

const totalPaginas = computed(() => {
  return Math.ceil(props.totalData / props.limit);
});

const paginaActiva = computed(() => {
  return Math.ceil(props.offset / props.limit) + 1;
});

const goNext = () => {
  if (paginaActiva.value < totalPaginas.value) {
    const nuevoOffset = props.offset + props.limit;
    emit("cambiarPagina", nuevoOffset);
  }
};

const goPrev = () => {
  if (paginaActiva.value > 1) {
    const nuevoOffset = props.offset - props.limit;
    emit("cambiarPagina", nuevoOffset);
  }
};

const goFirst = () => {
  emit("cambiarPagina", 0);
};

const goLast = () => {
  const nuevoOffset = (totalPaginas.value - 1) * props.limit;
  emit("cambiarPagina", nuevoOffset);
};

const goToPage = (page) => {
  const nuevoOffset = (page - 1) * props.limit;
  emit("cambiarPagina", nuevoOffset);
};

const paginasVisibles = computed(() => {
  const maxPaginasVisibles = 5;
  let startPage = Math.max(1, paginaActiva.value - 2);
  let endPage = Math.min(
    totalPaginas.value,
    startPage + maxPaginasVisibles - 1
  );

  if (endPage - startPage < maxPaginasVisibles - 1) {
    startPage = Math.max(1, endPage - maxPaginasVisibles + 1);
  }

  const paginas = [];
  for (let i = startPage; i <= endPage; i++) {
    paginas.push(i);
  }
  return paginas;
});
</script>
