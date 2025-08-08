<template>
  <div class="wrapper flex flex-col min-h-screen bg-marfil-mapamundi">
    <!-- Navegación -->
    <nav class="bg-blanco-dividido shadow-md border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <div class="flex items-center">
            <NuxtLink to="/" class="flex items-center gap-2 sm:gap-3">
              <div
                class="w-8 h-8 bg-azul-tiquet rounded-lg flex items-center justify-center"
              >
                <span class="text-blanco-dividido font-bold text-lg">€</span>
              </div>
              <span class="text-lg sm:text-xl font-bold text-gris-billetera hidden sm:block"
                >Dame mi dinero</span
              >
              <span class="text-lg font-bold text-gris-billetera sm:hidden"
                >DMD</span
              >
            </NuxtLink>
          </div>

          <!-- Menú de navegación - Desktop -->
          <div class="hidden md:flex items-center space-x-6">
            <NuxtLink
              to="/"
              class="text-gris-billetera hover:text-azul-tiquet px-3 py-2 rounded-lg font-medium transition-colors"
              :class="{ 'text-azul-tiquet bg-azul-tiquet/10': $route.path === '/' }"
            >
              Dashboard
            </NuxtLink>
            <NuxtLink
              to="/dineros"
              class="text-gris-billetera hover:text-azul-tiquet px-3 py-2 rounded-lg font-medium transition-colors"
              :class="{
                'text-azul-tiquet bg-azul-tiquet/10': $route.path === '/dineros',
              }"
            >
              Dineros
            </NuxtLink>
            <NuxtLink
              to="/expenses"
              class="text-gris-billetera hover:text-azul-tiquet px-3 py-2 rounded-lg font-medium transition-colors"
              :class="{
                'text-azul-tiquet bg-azul-tiquet/10': $route.path === '/expenses',
              }"
            >
              Gastos
            </NuxtLink>
            <NuxtLink
              to="/balances"
              class="text-gris-billetera hover:text-azul-tiquet px-3 py-2 rounded-lg font-medium transition-colors"
              :class="{
                'text-azul-tiquet bg-azul-tiquet/10': $route.path === '/balances',
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
          </div>

          <!-- Selectors y menú móvil -->
          <div class="flex items-center gap-2 sm:gap-4">
            <!-- Selector de dinero -->
            <DineroSelector />
            
            <!-- Selector de usuario -->
            <UserSelector />

            <!-- Botón menú móvil -->
            <button
              @click="showMobileMenu = !showMobileMenu"
              class="md:hidden p-2 text-gris-billetera hover:text-azul-tiquet transition-colors"
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

        <!-- Menú móvil -->
        <div
          v-if="showMobileMenu"
          class="md:hidden border-t border-gray-200 py-4"
        >
          <div class="space-y-2">
            <NuxtLink
              to="/"
              @click="showMobileMenu = false"
              class="block px-3 py-2 text-gris-billetera hover:text-azul-tiquet hover:bg-azul-claro-viaje/10 rounded-lg font-medium transition-colors"
              :class="{ 'text-azul-tiquet bg-azul-claro-viaje/10': $route.path === '/' }"
            >
              Dashboard
            </NuxtLink>
            <NuxtLink
              to="/dineros"
              @click="showMobileMenu = false"
              class="block px-3 py-2 text-gris-billetera hover:text-azul-tiquet hover:bg-azul-claro-viaje/10 rounded-lg font-medium transition-colors"
              :class="{
                'text-azul-tiquet bg-azul-claro-viaje/10': $route.path === '/dineros',
              }"
            >
              Dineros
            </NuxtLink>
            <NuxtLink
              to="/expenses"
              @click="showMobileMenu = false"
              class="block px-3 py-2 text-gris-billetera hover:text-azul-tiquet hover:bg-azul-claro-viaje/10 rounded-lg font-medium transition-colors"
              :class="{
                'text-azul-tiquet bg-azul-claro-viaje/10': $route.path === '/expenses',
              }"
            >
              Gastos
            </NuxtLink>
            <NuxtLink
              to="/balances"
              @click="showMobileMenu = false"
              class="block px-3 py-2 text-gris-billetera hover:text-azul-tiquet hover:bg-azul-claro-viaje/10 rounded-lg font-medium transition-colors"
              :class="{
                'text-azul-tiquet bg-azul-claro-viaje/10': $route.path === '/balances',
              }"
            >
              Balances
            </NuxtLink>
            <NuxtLink
              to="/users"
              @click="showMobileMenu = false"
              class="block px-3 py-2 text-gris-billetera hover:text-azul-tiquet hover:bg-azul-claro-viaje/10 rounded-lg font-medium transition-colors"
              :class="{
                'text-azul-tiquet bg-azul-claro-viaje/10': $route.path === '/users',
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

// Computed
const currentUser = computed(() => userStore.getCurrentUser);

// Inicializar datos cuando se monta el layout
onMounted(async () => {
  try {
    await userStore.initializeUsers();
    await expenseStore.initializeExpenses();
  } catch (error) {
    console.error('Error al inicializar datos:', error);
  }
});

console.log("default-layout");
</script>