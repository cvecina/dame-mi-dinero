<script setup>
import checkCircleAlert from "@/assets/img/comunes/check_circle_alert.svg";
import errorCircleAlert from "@/assets/img/comunes/error_circle_alert.svg";
import warnCircleAlert from "@/assets/img/comunes/warn_circle_alert.svg";
import { useAlertStore } from "@/stores";
const store = useAlertStore();

const color = computed(() => {
  switch (store.alert.type) {
    case "success":
      return "bg-lima-compartida";
    case "error":
      return "bg-red-500";
    case "warn":
      return "bg-yellow-500";
    default:
      return "bg-lima-compartida";
  }
});

const getImage = () => {
  switch (store.alert.type) {
    case "success":
      return checkCircleAlert;
    case "error":
      return errorCircleAlert;
    case "warn":
      return warnCircleAlert;
    default:
      return checkCircleAlert;
  }
};

// Suponiendo que el mensaje se obtiene de `store.alert.message`
// Función para dividir el texto en líneas de 5 palabras
const formatMessage = (text) => {
  const words = text.split(" ");
  let result = "";

  for (let i = 0; i < words.length; i += 5) {
    result += words.slice(i, i + 5).join(" ") + "<br>";
  }

  return result.trim();
};

// Computed property para el mensaje formateado
const formattedMessage = computed(() => formatMessage(store.alert.message));
</script>

<template>
  <div class="toast toast-top toast-end" style="z-index: 99">
    <div
      v-if="store.alert.message"
      class="flex text-blanco-dividido p-3 sm:p-4 rounded-lg shadow-lg items-start justify-center max-w-xs sm:max-w-sm"
      :class="color"
      role="alert"
    >
      <img class="pr-2 w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" :src="getImage()" alt="alert icon" />
      <p class="text-sm sm:text-base" v-html="formattedMessage"></p>
    </div>
  </div>
</template>
