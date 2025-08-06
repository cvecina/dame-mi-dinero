<script setup>
import checkCircleAlert from "@/assets/img/comunes/check_circle_alert.svg";
import errorCircleAlert from "@/assets/img/comunes/error_circle_alert.svg";
import warnCircleAlert from "@/assets/img/comunes/warn_circle_alert.svg";
import { useAlertStore } from "@/stores";
const store = useAlertStore();

const color = computed(() => {
  switch (store.alert.type) {
    case "success":
      return "bg-[#2EAC80]";
    case "error":
      return "bg-[#E2462F]";
    case "warn":
      return "bg-[#FD9804]";
    default:
      return "bg-[#2EAC80]";
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
      class="flex text-white p-4 rounded-lg shadow-lg items-start justify-center"
      :class="color"
      role="alert"
    >
      <img class="pr-2" :src="getImage()" alt="no funciona" />
      <p v-html="formattedMessage"></p>
    </div>
  </div>
</template>
