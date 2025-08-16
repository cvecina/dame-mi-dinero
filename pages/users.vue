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
                            <h1 class="text-2xl sm:text-3xl font-bold mb-2">
                                {{ selectedDinero ? `Usuarios de "${selectedDinero.name}"` : 'Selecciona un Dinero' }}
                            </h1>
                            <p class="text-azul-claro-viaje/90 text-sm sm:text-base">
                                {{ selectedDinero ? 'Miembros que participan en este dinero' : 'Elige un dinero para ver sus miembros' }}
                            </p>
                        </div>
                        <div class="flex items-center gap-3">
                            <div v-if="selectedDinero" class="bg-blanco-dividido/20 backdrop-blur-sm rounded-lg px-4 py-2">
                                <p class="text-xs opacity-80">Total miembros</p>
                                <p class="text-xl font-bold">{{ dineroUsers.length }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Dinero Selector -->
            <div class="mb-8">
                <div class="bg-blanco-dividido rounded-xl shadow-lg p-6">
                    <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div class="flex-1">
                            <label for="dinero-select" class="block text-sm font-medium text-gris-billetera mb-2">
                                Seleccionar Dinero
                            </label>
                            <select
                                id="dinero-select"
                                v-model="selectedDineroId"
                                @change="handleDineroChange"
                                class="w-full px-4 py-3 border border-azul-claro-viaje/30 rounded-lg focus:ring-2 focus:ring-azul-tiquet focus:border-azul-tiquet transition-all duration-200"
                            >
                                <option value="">Selecciona un dinero...</option>
                                <option v-for="dinero in availableDineros" :key="dinero.id" :value="dinero.id">
                                    {{ dinero.name }}
                                </option>
                            </select>
                        </div>
                        <div v-if="selectedDinero">
                            <button
                                @click="openInviteModal"
                                class="px-6 py-3 bg-lima-compartida text-gris-billetera font-medium rounded-lg hover:bg-lima-compartida/90 transition-colors inline-flex items-center gap-2"
                            >
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                                </svg>
                                Invitar Usuario
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Error message -->
            <div v-if="error" class="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div class="flex items-center gap-3">
                    <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <p class="text-red-700">{{ error }}</p>
                </div>
            </div>

            <!-- Users List -->
            <div v-if="selectedDinero && dineroUsers.length > 0">
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div 
                        v-for="user in dineroUsers" 
                        :key="user.id"
                        class="bg-blanco-dividido rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-200"
                    >
                        <div class="p-6">
                            <!-- User Info -->
                            <div class="flex items-center gap-4 mb-4">
                                <div class="w-12 h-12 bg-gradient-to-br from-azul-tiquet to-azul-claro-viaje rounded-full flex items-center justify-center text-blanco-dividido text-lg font-bold shadow-md">
                                    {{ user.nickname?.charAt(0)?.toUpperCase() || user.username?.charAt(0)?.toUpperCase() || "?" }}
                                </div>
                                <div class="flex-1">
                                    <h3 class="font-semibold text-gris-billetera flex items-center gap-2">
                                        {{ user.nickname || user.username }}
                                        <span v-if="user.id === currentUser?.id" class="text-xs bg-lima-compartida text-gris-billetera px-2 py-1 rounded-full">
                                            Tú
                                        </span>
                                    </h3>
                                    <div class="flex items-center gap-2 mt-1">
                                        <span 
                                            class="text-xs px-2 py-1 rounded-full font-medium"
                                            :class="{
                                                'bg-yellow-100 text-yellow-800': user.role === 'owner',
                                                'bg-blue-100 text-blue-800': user.role === 'admin',
                                                'bg-gray-100 text-gray-800': user.role === 'member'
                                            }"
                                        >
                                            {{ getRoleLabel(user.role) }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="space-y-2">
                                <p class="text-sm text-gray-600">{{ user.email }}</p>
                                <p v-if="user.joinedAt" class="text-xs text-gray-500">
                                    Miembro desde {{ formatDate(user.joinedAt) }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Empty State -->
            <div v-else-if="selectedDinero && dineroUsers.length === 0" class="text-center py-20">
                <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 919.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                </div>
                <h3 class="text-xl font-semibold text-gris-billetera mb-2">No hay miembros en este dinero</h3>
                <p class="text-gray-600 mb-6">Invita a otros usuarios para que puedan participar en los gastos compartidos</p>
                <button
                    @click="openInviteModal"
                    class="px-6 py-3 bg-lima-compartida text-gris-billetera font-medium rounded-lg hover:bg-lima-compartida/90 transition-colors inline-flex items-center gap-2"
                >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                    Invitar Primer Usuario
                </button>
            </div>

            <!-- No Dinero Selected -->
            <div v-else-if="!selectedDinero" class="text-center py-20">
                <div class="w-24 h-24 bg-azul-claro-viaje/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg class="w-12 h-12 text-azul-tiquet" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                </div>
                <h3 class="text-xl font-semibold text-gris-billetera mb-2">Selecciona un dinero</h3>
                <p class="text-gray-600">Elige uno de tus dineros para ver y gestionar sus miembros</p>
            </div>
        </div>

        <!-- Invite User Modal -->
        <InviteUserModal
            :is-open="showInviteModal"
            :dinero-id="selectedDineroId"
            @close="showInviteModal = false"
        />
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '~/stores/auth.store'
import { useDineroStore } from '~/stores/dinero.store'

// Requerir autenticación para esta página
definePageMeta({
  middleware: 'auth'
})

// Stores
const authStore = useAuthStore()
const dineroStore = useDineroStore()

// State
const loading = ref(false)
const error = ref('')
const selectedDineroId = ref('')
const showInviteModal = ref(false)
const dineroUsers = ref([])
const recentInvitations = ref([])

// Computed
const currentUser = computed(() => authStore.user)

const availableDineros = computed(() => {
  return dineroStore.getMyDineros || []
})

const selectedDinero = computed(() => {
  if (!selectedDineroId.value) return null
  return availableDineros.value.find(d => d.id === parseInt(selectedDineroId.value))
})

// Methods
const formatDate = (dateString) => {
  if (!dateString) return 'Fecha no disponible'
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const getRoleLabel = (role) => {
  const labels = {
    owner: 'Propietario',
    admin: 'Administrador',
    member: 'Miembro'
  }
  return labels[role] || role
}

const openInviteModal = () => {
  console.log('Opening invite modal')
  console.log('selectedDineroId:', selectedDineroId.value)
  console.log('selectedDinero:', selectedDinero.value)
  
  if (!selectedDineroId.value) {
    alert('Por favor selecciona un dinero primero')
    return
  }
  
  showInviteModal.value = true
  console.log('showInviteModal set to:', showInviteModal.value)
}

const handleDineroChange = async () => {
  if (!selectedDineroId.value) {
    dineroUsers.value = []
    return
  }

  try {
    loading.value = true
    
    const response = await $fetch(`/api/users?dineroId=${selectedDineroId.value}`)
    
    if (response.success) {
      dineroUsers.value = response.data || []
      // Load recent invitations for this dinero
      await loadRecentInvitations()
    } else {
      throw new Error(response.message || 'Error al cargar usuarios del dinero')
    }
  } catch (err) {
    console.error('Error loading dinero users:', err)
    error.value = err.message || 'Error al cargar usuarios del dinero'
    dineroUsers.value = []
  } finally {
    loading.value = false
  }
}

const loadRecentInvitations = async () => {
  if (!selectedDinero.value) return
  
  try {
    // Get invitations from the dinero data
    recentInvitations.value = selectedDinero.value.invitations || []
  } catch (err) {
    console.error('Error loading invitations:', err)
  }
}

const handleUserInvited = async (invitation) => {
  // Add the new invitation to recent invitations
  recentInvitations.value.unshift(invitation)
  
  // Refresh dinero data
  await dineroStore.fetchDineros()
  await loadRecentInvitations()
}

const loadDineros = async () => {
  try {
    loading.value = true
    await dineroStore.fetchDineros()
    
    // Auto-select first dinero if available
    if (availableDineros.value.length > 0 && !selectedDineroId.value) {
      selectedDineroId.value = availableDineros.value[0].id.toString()
      await handleDineroChange()
    }
  } catch (err) {
    console.error('Error loading dineros:', err)
    error.value = 'Error al cargar dineros'
  } finally {
    loading.value = false
  }
}

// Watch for dinero selection changes
watch(selectedDineroId, (newValue) => {
  if (newValue) {
    handleDineroChange()
  }
})

// Initialize
onMounted(async () => {
  await loadDineros()
})

console.log('users-page-updated')
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>