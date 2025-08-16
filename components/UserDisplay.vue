<template>
  <div class="relative">
    <!-- Avatar y nombre del usuario autenticado (clickeable) -->
    <button 
      @click="showDropdown = !showDropdown"
      class="flex items-center gap-2 px-3 py-2 rounded-lg bg-azul-claro-viaje/10 hover:bg-azul-claro-viaje/20 transition-colors"
    >
      <div class="w-8 h-8 bg-azul-tiquet rounded-full flex items-center justify-center text-blanco-dividido text-sm font-semibold">
        {{ currentUser?.nickname?.charAt(0)?.toUpperCase() || currentUser?.name?.charAt(0)?.toUpperCase() || "?" }}
      </div>
      <span class="hidden sm:block text-gris-billetera font-medium">
        {{ currentUser?.nickname || currentUser?.name || "Usuario" }}
      </span>
      <!-- Icono de flecha -->
      <svg 
        class="w-4 h-4 text-gray-400 transition-transform duration-200"
        :class="{ 'rotate-180': showDropdown }"
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
      </svg>
    </button>

    <!-- Dropdown del usuario -->
    <div 
      v-if="showDropdown"
      class="absolute top-full right-0 mt-2 w-48 bg-blanco-dividido border border-gray-200 rounded-lg shadow-lg z-50"
    >
      <!-- Información del usuario -->
      <div class="p-3 border-b border-gray-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-azul-tiquet rounded-full flex items-center justify-center text-blanco-dividido font-semibold">
            {{ currentUser?.nickname?.charAt(0)?.toUpperCase() || currentUser?.name?.charAt(0)?.toUpperCase() || "?" }}
          </div>
          <div>
            <p class="font-medium text-gris-billetera text-sm">
              {{ currentUser?.nickname || currentUser?.name || "Usuario" }}
            </p>
            <p class="text-xs text-gray-500">
              {{ currentUser?.email || "email@ejemplo.com" }}
            </p>
          </div>
        </div>
      </div>

      <!-- Opciones del menú -->
      <div class="p-1">
        <!-- Perfil -->
        <NuxtLink 
          to="/profile"
          @click="showDropdown = false"
          class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gris-billetera hover:bg-azul-claro-viaje/10 rounded-lg transition-colors"
        >
          <span>👤</span>
          <span>Perfil</span>
        </NuxtLink>

        <!-- Separador -->
        <hr class="my-2 border-gray-100">

        <!-- Cerrar sesión -->
        <button 
          @click="handleLogout"
          class="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <span>🚪</span>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>

    <!-- Overlay para cerrar el dropdown -->
    <div 
      v-if="showDropdown"
      @click="showDropdown = false"
      class="fixed inset-0 z-40"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '~/stores/auth.store'
import { useAuth } from '~/composables/useAuth'

// Store y composables
const authStore = useAuthStore()
const { logout } = useAuth()

// Estado reactivo
const showDropdown = ref(false)

// Computed
const currentUser = computed(() => authStore.user)

// Métodos
const handleLogout = async () => {
  showDropdown.value = false
  await logout()
}

console.log('UserDisplay')
</script>
