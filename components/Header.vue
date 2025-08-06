<script setup>
import { comunes } from "@/limits/comunes";
import { useRouter } from "vue-router";

const router = useRouter();

const roles = ref([""]);
const goToMovil = (ruta) => {
  router.push(ruta);
  isOpen.value = false;
};

const rutasActivas = computed(() => {
  const listaRutasInicial = comunes().rutasConRoles;
  return listaRutasInicial.filter((item) => {
    return item.roles.some((role) => roles.value.includes(role));
  });
});

const isOpen = ref(false);

</script>

<template>
  <div class="header">
    <span class="header__logo cursor-pointer" @click="router.push('/')">
      <img src="" alt="logo" />
    </span>

    <!-- Standard Navigation for lg and xl -->
    <div class="header__nav">
      <span v-for="item in rutasActivas" :key="item.ruta" class="header__links">
        <NuxtLink :to="item.ruta">
          {{ item.nombre }}
        </NuxtLink>
      </span>
    </div>

    <!-- Burger Menu for md and sm -->
    <div class="lg:hidden ml-auto">
      <button @click="isOpen = !isOpen" class="menu-button">
        <!-- Icon for the burger menu -->
        <img src="@/assets/img/comunes/menu.svg" />
      </button>
      <transition name="fade">
        <div v-if="isOpen" class="menu-content">
          <div class="flex flex-col items-start">
            <span
              v-for="item in rutasActivas"
              :key="item.ruta"
              @click="goToMovil(item.ruta)"
              class="mobile__links"
            >
              <span @click="isOpen = !isOpen">
                {{ item.nombre }}
              </span>
            </span>
            <hr />
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

