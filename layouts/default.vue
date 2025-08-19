<template>
  <div class="wrapper flex flex-col min-h-screen bg-marfil-mapamundi">
    <!-- Navegación -->
    <nav class="bg-blanco-dividido shadow-md border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-1 sm:px-2 lg:px-4">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <div class="flex items-center">
            <NuxtLink to="/" class="flex items-center gap-2 sm:gap-2">
              <div
                class="w-6 h-6 bg-azul-tiquet rounded-lg flex items-center justify-center"
              >
                <span class="text-blanco-dividido font-bold text-lg">€</span>
              </div>
              <span
                class="text-lg sm:text-xl font-bold text-gris-billetera hidden sm:block"
                >Mi Dinero</span
              >
              <span class="text-lg font-bold text-gris-billetera sm:hidden"
                >€MD</span
              >
            </NuxtLink>
          </div>

          <!-- Menú de navegación - Desktop -->
          <div ref="menuScrollRef" class="relative hidden md:flex items-center space-x-6 overflow-x-auto max-w-[60vw] scrollbar-thin scrollbar-thumb-azul-tiquet/30 scrollbar-track-transparent" @scroll="checkScrollEnd">
            <!-- Indicador visual de scroll -->
            <div v-if="!isMenuScrolledToEnd" class="absolute right-0 top-0 h-full w-8 pointer-events-none flex items-center justify-end z-10">
              <div class="bg-gradient-to-l from-blanco-dividido via-blanco-dividido/80 to-transparent h-10 w-8 flex items-center justify-center">
                <svg class="w-5 h-5 text-azul-tiquet animate-bounce-right" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            <NuxtLink
              to="/home"
              class="text-gris-billetera hover:text-azul-tiquet px-3 py-2 rounded-lg font-medium transition-colors"
              :class="{
                'text-azul-tiquet bg-azul-tiquet/10':
                  $route.path === '/home' || $route.path === '/',
              }"
            >
              Inicio
            </NuxtLink>
            <NuxtLink
              to="/dashboard"
              class="text-gris-billetera hover:text-azul-tiquet px-3 py-2 rounded-lg font-medium transition-colors"
              :class="{
                'text-azul-tiquet bg-azul-tiquet/10':
                  $route.path === '/dashboard',
              }"
            >
              Dashboard
            </NuxtLink>
            <NuxtLink
              to="/dineros"
              class="text-gris-billetera hover:text-azul-tiquet px-3 py-2 rounded-lg font-medium transition-colors"
              :class="{
                'text-azul-tiquet bg-azul-tiquet/10':
                  $route.path === '/dineros',
              }"
            >
              Dineros
            </NuxtLink>
            <NuxtLink
              to="/expenses"
              class="text-gris-billetera hover:text-azul-tiquet px-3 py-2 rounded-lg font-medium transition-colors"
              :class="{
                'text-azul-tiquet bg-azul-tiquet/10':
                  $route.path === '/expenses',
              }"
            >
              Gastos
            </NuxtLink>
            <NuxtLink
              to="/balances"
              class="text-gris-billetera hover:text-azul-tiquet px-3 py-2 rounded-lg font-medium transition-colors"
              :class="{
                'text-azul-tiquet bg-azul-tiquet/10':
                  $route.path === '/balances',
              }"
            >
              Balances
            </NuxtLink>
            <NuxtLink
              to="/users"
              class="text-gris-billetera hover:text-azul-tiquet px-3 py-2 rounded-lg font-medium transition-colors"
              :class="{
                'text-azul-tiquet bg-azul-tiquet/10': $route.path === '/users',
              }"
            >
              Usuarios
            </NuxtLink>
            <NuxtLink
              to="/recurring-expenses"
              class="text-gris-billetera hover:text-lima-compartida px-3 py-2 rounded-lg font-medium transition-colors"
              :class="{
                'text-lima-compartida bg-lima-compartida/10':
                  $route.path === '/recurring-expenses',
              }"
            >
              Recurrentes
            </NuxtLink>
            <NuxtLink
              to="/personal"
              class="text-gris-billetera hover:text-lima-compartida px-3 py-2 rounded-lg font-medium transition-colors"
              :class="{
                'text-lima-compartida bg-lima-compartida/10':
                  $route.path === '/personal',
              }"
            >
              Personal
            </NuxtLink>
          </div>

          <!-- Selectors y menú móvil -->
          <div class="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <!-- Selector de dinero -->
            <DineroSelector />

            <!-- Selector de usuario -->
            <UserSelector />

            <!-- Botón menú móvil -->
              <div class="flex-1 flex justify-end items-center">
                <button
                  @click="showMobileMenu = !showMobileMenu"
                  class="md:hidden p-2 text-gris-billetera hover:text-azul-tiquet transition-colors"
                  style="position:relative;z-index:60;"
                >
                  <svg
                    class="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      :d="showMobileMenu ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'"
                    ></path>
                  </svg>
                </button>
              </div>
          </div>
        </div>

        <!-- Menú móvil -->
        <div
          v-if="showMobileMenu"
          class="md:hidden fixed left-0 top-16 w-full border-t border-gray-200 py-4 max-h-[70vh] overflow-y-auto bg-blanco-dividido z-50 shadow-lg"
        >
          <div class="space-y-2">
            <NuxtLink
              to="/home"
              @click="showMobileMenu = false"
              class="block px-3 py-2 text-gris-billetera hover:text-azul-tiquet hover:bg-azul-claro-viaje/10 rounded-lg font-medium transition-colors"
              :class="{
                'text-azul-tiquet bg-azul-claro-viaje/10':
                  $route.path === '/home' || $route.path === '/',
              }"
            >
              Inicio
            </NuxtLink>
            <NuxtLink
              to="/recurring-expenses"
              @click="showMobileMenu = false"
              class="block px-3 py-2 text-gris-billetera hover:text-lima-compartida hover:bg-lima-compartida/10 rounded-lg font-medium transition-colors"
              :class="{
                'text-lima-compartida bg-lima-compartida/10':
                  $route.path === '/recurring-expenses',
              }"
            >
              Recurrentes
            </NuxtLink>
            <NuxtLink
              to="/dashboard"
              @click="showMobileMenu = false"
              class="block px-3 py-2 text-gris-billetera hover:text-azul-tiquet hover:bg-azul-claro-viaje/10 rounded-lg font-medium transition-colors"
              :class="{
                'text-azul-tiquet bg-azul-claro-viaje/10':
                  $route.path === '/dashboard',
              }"
            >
              Dashboard
            </NuxtLink>
            <NuxtLink
              to="/dineros"
              @click="showMobileMenu = false"
              class="block px-3 py-2 text-gris-billetera hover:text-azul-tiquet hover:bg-azul-claro-viaje/10 rounded-lg font-medium transition-colors"
              :class="{
                'text-azul-tiquet bg-azul-claro-viaje/10':
                  $route.path === '/dineros',
              }"
            >
              Dineros
            </NuxtLink>
            <NuxtLink
              to="/expenses"
              @click="showMobileMenu = false"
              class="block px-3 py-2 text-gris-billetera hover:text-azul-tiquet hover:bg-azul-claro-viaje/10 rounded-lg font-medium transition-colors"
              :class="{
                'text-azul-tiquet bg-azul-claro-viaje/10':
                  $route.path === '/expenses',
              }"
            >
              Gastos
            </NuxtLink>
            <NuxtLink
              to="/balances"
              @click="showMobileMenu = false"
              class="block px-3 py-2 text-gris-billetera hover:text-azul-tiquet hover:bg-azul-claro-viaje/10 rounded-lg font-medium transition-colors"
              :class="{
                'text-azul-tiquet bg-azul-claro-viaje/10':
                  $route.path === '/balances',
              }"
            >
              Balances
            </NuxtLink>
            <NuxtLink
              to="/users"
              @click="showMobileMenu = false"
              class="block px-3 py-2 text-gris-billetera hover:text-azul-tiquet hover:bg-azul-claro-viaje/10 rounded-lg font-medium transition-colors"
              :class="{
                'text-azul-tiquet bg-azul-claro-viaje/10':
                  $route.path === '/users',
              }"
            >
              Usuarios
            </NuxtLink>
          </div>

          <!-- Usuario actual en móvil -->
          <div class="sm:hidden mt-4 pt-4 border-t border-gray-200">
            <div class="flex items-center gap-3 px-3">
              <div
                class="w-10 h-10 bg-azul-tiquet rounded-full flex items-center justify-center text-blanco-dividido font-semibold"
              >
                {{ currentUser?.name?.charAt(0)?.toUpperCase() || "U" }}
              </div>
              <div>
                <p class="font-medium text-gris-billetera">
                  {{ currentUser?.name || "Usuario" }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Contenido principal -->
    <div class="content flex-grow">
      <slot name="header" />
      <slot name="main"> </slot>
    </div>
    <div class="footer mt-auto">
      <slot name="footer" />
    </div>

    <!-- PWA Manager -->
    <PWAManager />

    <!-- Toast/Alert -->
    <Toast />

    <!-- Modal de bienvenida para seleccionar usuario -->
    <UserWelcomeModal />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useUserStore } from "~/stores/user.store";
import { useExpenseStore } from "~/stores/expense.store";

// Stores
const userStore = useUserStore();
const expenseStore = useExpenseStore();

// Reactive data
const showMobileMenu = ref(false);
const isMenuScrolledToEnd = ref(false);
const menuScrollRef = ref(null);

// Computed
const currentUser = computed(() => userStore.getCurrentUser);

// Función para comprobar si el menú está scrolleado al final
function checkScrollEnd() {
  const el = menuScrollRef.value;
  if (!el) return;
  isMenuScrolledToEnd.value = el.scrollLeft + el.offsetWidth >= el.scrollWidth - 2;
  console.log('checkScrollEnd', isMenuScrolledToEnd.value);
}

// Inicializar datos cuando se monta el layout
onMounted(async () => {
  try {
    await userStore.initializeUsers();
    await expenseStore.initializeExpenses();
    // Comprobar scroll al montar
    checkScrollEnd();
    // Escuchar resize para actualizar el estado de la flecha
    window.addEventListener('resize', checkScrollEnd);
  } catch (error) {
    console.error("Error al inicializar datos:", error);
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', checkScrollEnd);
});

console.log("default-layout");
</script>