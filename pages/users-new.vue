<template>
    <div class="min-h-screen bg-marfil-mapamundi p-3 sm:p-4 lg:p-6">
        <!-- Loading state -->
        <div v-if="loading" class="flex items-center justify-center py-20">
            <div class="text-center">
                <div class="w-16 h-16 border-4 border-azul-tiquet border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p class="text-gris-billetera font-medium">Cargando usuarios...</p>
            </div>
        </div>

        <!-- Main content -->
        <div v-else class="max-w-7xl mx-auto">
            <!-- Header -->
            <div class="mb-8">
                <div class="bg-gradient-to-r from-azul-tiquet to-azul-claro-viaje rounded-2xl p-6 text-blanco-dividido shadow-xl">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 class="text-2xl sm:text-3xl font-bold mb-2">Usuarios de la Aplicación</h1>
                            <p class="text-azul-claro-viaje/90 text-sm sm:text-base">
                                Usuarios disponibles para compartir dineros y gastos
                            </p>
                        </div>
                        <div class="flex items-center gap-3">
                            <div class="bg-blanco-dividido/20 backdrop-blur-sm rounded-lg px-4 py-2">
                                <p class="text-xs opacity-80">Total usuarios</p>
                                <p class="text-xl font-bold">{{ availableUsers.length + 1 }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Current User Card -->
            <div class="mb-8">
                <h2 class="text-lg font-semibold text-gris-billetera mb-4">Tu perfil</h2>
                <div class="bg-blanco-dividido rounded-xl shadow-lg p-6 border-2 border-lima-compartida/40">
                    <div class="flex items-center gap-4">
                        <div class="w-16 h-16 bg-gradient-to-br from-azul-tiquet to-azul-claro-viaje rounded-full flex items-center justify-center text-blanco-dividido text-xl font-bold shadow-lg">
                            {{ currentUser?.nickname?.charAt(0)?.toUpperCase() || currentUser?.name?.charAt(0)?.toUpperCase() || "?" }}
                        </div>
                        <div class="flex-1">
                            <div class="flex items-center gap-3 mb-2">
                                <h3 class="text-xl font-semibold text-gris-billetera">
                                    {{ currentUser?.nickname || currentUser?.name }}
                                </h3>
                                <span class="px-3 py-1 text-xs font-bold bg-lima-compartida text-gris-billetera rounded-full">
                                    🌟 Tu cuenta
                                </span>
                            </div>
                            <p class="text-gray-600">{{ currentUser?.email }}</p>
                            <p class="text-sm text-gray-500 mt-1">
                                Miembro desde {{ formatDate(currentUser?.createdAt) }}
                            </p>
                        </div>
                        <div>
                            <NuxtLink 
                                to="/profile"
                                class="bg-azul-claro-viaje/10 hover:bg-azul-claro-viaje/20 text-azul-claro-viaje px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                </svg>
                                Editar perfil
                            </NuxtLink>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Other Users -->
            <div v-if="availableUsers.length > 0">
                <h2 class="text-lg font-semibold text-gris-billetera mb-4">Otros usuarios</h2>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div 
                        v-for="user in availableUsers" 
                        :key="user.id"
                        class="bg-blanco-dividido rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-200"
                    >
                        <div class="p-6">
                            <!-- User Info -->
                            <div class="flex items-center gap-4 mb-4">
                                <div class="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-blanco-dividido text-lg font-bold shadow-md">
                                    {{ user.nickname?.charAt(0)?.toUpperCase() || user.username?.charAt(0)?.toUpperCase() || "?" }}
                                </div>
                                <div class="flex-1">
                                    <h3 class="font-semibold text-gris-billetera">
                                        {{ user.nickname || user.username }}
                                    </h3>
                                    <p class="text-sm text-gray-600">@{{ user.username }}</p>
                                </div>
                            </div>

                            <!-- User Stats -->
                            <div class="bg-gray-50 rounded-lg p-3 mb-4">
                                <p class="text-xs text-gray-600 mb-2">Información</p>
                                <div class="flex justify-between items-center">
                                    <span class="text-sm text-gray-700">Miembro desde:</span>
                                    <span class="text-sm font-medium text-gris-billetera">
                                        {{ formatDate(user.createdAt) }}
                                    </span>
                                </div>
                            </div>

                            <!-- Shared Dineros -->
                            <div v-if="getSharedDinerosWithUser(user.id).length > 0" class="mb-4">
                                <p class="text-xs text-gray-600 mb-2">Dineros compartidos:</p>
                                <div class="flex flex-wrap gap-1">
                                    <span 
                                        v-for="dinero in getSharedDinerosWithUser(user.id)" 
                                        :key="dinero.id"
                                        class="text-xs px-2 py-1 rounded-full"
                                        :style="{ backgroundColor: dinero.color + '20', color: dinero.color }"
                                    >
                                        {{ dinero.name }}
                                    </span>
                                </div>
                            </div>

                            <!-- Actions -->
                            <div class="text-center">
                                <p class="text-sm text-gray-500">
                                    Comparte dineros con este usuario desde la página de 
                                    <NuxtLink to="/dineros" class="text-azul-tiquet hover:underline font-medium">
                                        Dineros
                                    </NuxtLink>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Empty State -->
            <div v-else class="text-center py-20">
                <div class="w-32 h-32 mx-auto mb-6 opacity-50">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-full h-full text-gray-400">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                </div>
                <h3 class="text-xl font-semibold text-gris-billetera mb-2">No hay otros usuarios</h3>
                <p class="text-gray-600 mb-6">
                    Eres el único usuario registrado en la aplicación. Cuando otros usuarios se registren aparecerán aquí.
                </p>
            </div>

            <!-- Error message -->
            <div v-if="error" class="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p class="text-red-700">{{ error }}</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Requerir autenticación para esta página
definePageMeta({
  middleware: 'auth'
})

// Stores
const authStore = useAuthStore()
const userStore = useUserStore()
const dineroStore = useDineroStore()

// State
const loading = ref(false)
const error = ref('')
const availableUsers = ref([])

// Computed
const currentUser = computed(() => authStore.user)

// Methods
const formatDate = (dateString) => {
  if (!dateString) return 'Fecha no disponible'
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const getSharedDinerosWithUser = (userId) => {
  return dineroStore.getMyDineros.filter(dinero => 
    dinero.sharedWith && dinero.sharedWith.includes(userId)
  )
}

const loadUsers = async () => {
  try {
    loading.value = true
    error.value = ''
    
    // Cargar usuarios disponibles para compartir
    const response = await $fetch('/api/users/list', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      }
    })

    if (response.success) {
      availableUsers.value = response.data || []
    } else {
      throw new Error(response.message || 'Error al cargar usuarios')
    }
  } catch (err) {
    console.error('Error loading users:', err)
    error.value = err.message || 'Error al cargar la lista de usuarios'
    availableUsers.value = []
  } finally {
    loading.value = false
  }
}

const loadDineros = async () => {
  try {
    await dineroStore.fetchDineros()
  } catch (err) {
    console.error('Error loading dineros:', err)
    // No mostrar error aquí ya que no es crítico para esta página
  }
}

// Initialize
onMounted(async () => {
  await Promise.all([
    loadUsers(),
    loadDineros()
  ])
})

console.log('users-page')
</script>
