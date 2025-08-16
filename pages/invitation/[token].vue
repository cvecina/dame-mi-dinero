<template>
    <div class="min-h-screen bg-marfil-mapamundi flex items-center justify-center p-4">
        <!-- Loading State -->
        <div v-if="loading" class="text-center">
            <div class="w-16 h-16 border-4 border-azul-tiquet border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p class="text-gris-billetera font-medium">Cargando invitación...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="max-w-md w-full">
            <div class="bg-blanco-dividido rounded-2xl shadow-xl p-8 text-center">
                <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg class="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
                <h1 class="text-2xl font-bold text-gris-billetera mb-4">Invitación no válida</h1>
                <p class="text-gray-600 mb-6">{{ error }}</p>
                <NuxtLink 
                    to="/"
                    class="inline-flex items-center gap-2 px-6 py-3 bg-azul-tiquet text-blanco-dividido rounded-lg hover:bg-azul-tiquet/90 transition-colors"
                >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                    </svg>
                    Ir al inicio
                </NuxtLink>
            </div>
        </div>

        <!-- Not Authenticated State -->
        <div v-else-if="!isAuthenticated && invitationData" class="max-w-md w-full">
            <div class="bg-blanco-dividido rounded-2xl shadow-xl p-8">
                <!-- Invitation Preview -->
                <div class="text-center mb-8">
                    <div class="w-20 h-20 bg-gradient-to-br from-azul-tiquet to-azul-claro-viaje rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg class="w-10 h-10 text-blanco-dividido" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                    </div>
                    <h1 class="text-2xl font-bold text-gris-billetera mb-2">¡Te han invitado!</h1>
                    <p class="text-gray-600 mb-4">
                        <span v-if="invitationData.inviter" class="font-medium">{{ invitationData.inviter.name }}</span>
                        <span v-else>Alguien</span>
                        te ha invitado a unirte al dinero
                    </p>
                    <div class="bg-lima-compartida/10 rounded-lg p-4 mb-6">
                        <h3 class="font-bold text-gris-billetera text-lg">{{ invitationData.dinero.name }}</h3>
                        <p class="text-sm text-gray-600 mt-1">
                            Como <span class="font-medium">{{ getRoleLabel(invitationData.invitation.role) }}</span>
                        </p>
                        <p class="text-xs text-gray-500 mt-2">
                            {{ invitationData.dinero.membersCount }} miembro(s) actual(es)
                        </p>
                    </div>
                </div>

                <!-- Auth Required Message -->
                <div class="bg-azul-claro-viaje/10 rounded-lg p-4 mb-6">
                    <p class="text-sm text-azul-tiquet font-medium mb-2">
                        Inicia sesión para continuar
                    </p>
                    <p class="text-xs text-gray-600">
                        Necesitas estar autenticado para aceptar o rechazar la invitación
                    </p>
                </div>

                <!-- Auth Buttons -->
                <div class="space-y-3">
                    <button
                        @click="redirectToAuth('login')"
                        class="w-full px-6 py-3 bg-azul-tiquet text-blanco-dividido rounded-lg hover:bg-azul-tiquet/90 transition-colors font-medium"
                    >
                        Iniciar Sesión
                    </button>
                    <button
                        @click="redirectToAuth('register')"
                        class="w-full px-6 py-3 border-2 border-azul-tiquet text-azul-tiquet rounded-lg hover:bg-azul-tiquet hover:text-blanco-dividido transition-colors font-medium"
                    >
                        Registrarse
                    </button>
                </div>

                <!-- Email hint -->
                <p class="text-xs text-gray-500 text-center mt-4">
                    La invitación es para: {{ invitationData.invitation.email }}
                </p>
            </div>
        </div>

        <!-- Authenticated - Show Invitation Details -->
        <div v-else-if="isAuthenticated && invitationData" class="max-w-md w-full">
            <div class="bg-blanco-dividido rounded-2xl shadow-xl p-8">
                <!-- Success state after responding -->
                <div v-if="responseSubmitted" class="text-center">
                    <div class="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                         :class="lastResponse === 'accept' ? 'bg-green-100' : 'bg-gray-100'">
                        <svg v-if="lastResponse === 'accept'" class="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <svg v-else class="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </div>
                    <h1 class="text-2xl font-bold text-gris-billetera mb-4">
                        {{ lastResponse === 'accept' ? '¡Invitación aceptada!' : 'Invitación rechazada' }}
                    </h1>
                    <p class="text-gray-600 mb-6">{{ responseMessage }}</p>
                    <NuxtLink 
                        :to="lastResponse === 'accept' ? '/dineros' : '/'"
                        class="inline-flex items-center gap-2 px-6 py-3 bg-azul-tiquet text-blanco-dividido rounded-lg hover:bg-azul-tiquet/90 transition-colors"
                    >
                        {{ lastResponse === 'accept' ? 'Ver mis dineros' : 'Ir al inicio' }}
                    </NuxtLink>
                </div>

                <!-- Invitation details and response buttons -->
                <div v-else>
                    <div class="text-center mb-8">
                        <div class="w-20 h-20 bg-gradient-to-br from-azul-tiquet to-azul-claro-viaje rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg class="w-10 h-10 text-blanco-dividido" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                            </svg>
                        </div>
                        <h1 class="text-2xl font-bold text-gris-billetera mb-2">¡Te han invitado!</h1>
                        <p class="text-gray-600">
                            <span v-if="invitationData.inviter" class="font-medium">{{ invitationData.inviter.name }}</span>
                            <span v-else>Alguien</span>
                            te ha invitado a unirte al dinero
                        </p>
                    </div>

                    <!-- Dinero Information -->
                    <div class="bg-lima-compartida/10 rounded-lg p-6 mb-6">
                        <h3 class="font-bold text-gris-billetera text-xl mb-2">{{ invitationData.dinero.name }}</h3>
                        <div class="space-y-2 text-sm text-gray-600">
                            <div class="flex justify-between">
                                <span>Tu rol será:</span>
                                <span class="font-medium text-azul-tiquet">{{ getRoleLabel(invitationData.invitation.role) }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span>Miembros actuales:</span>
                                    <span class="font-medium">{{ invitationData.dinero.membersCount }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span>Invitado el:</span>
                                <span class="font-medium">{{ formatDate(invitationData.invitation.createdAt) }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Inviter Information -->
                    <div v-if="invitationData.inviter" class="bg-gray-50 rounded-lg p-4 mb-6">
                        <p class="text-xs text-gray-500 mb-2">Invitado por:</p>
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-gradient-to-br from-azul-tiquet to-azul-claro-viaje rounded-full flex items-center justify-center">
                                <span class="text-blanco-dividido font-bold text-sm">
                                    {{ invitationData.inviter.name.charAt(0).toUpperCase() }}
                                </span>
                            </div>
                            <div>
                                <p class="font-medium text-gris-billetera text-sm">{{ invitationData.inviter.name }}</p>
                                <p class="text-xs text-gray-500">{{ invitationData.inviter.email }}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="space-y-3">
                        <button
                            @click="respondToInvitation('accept')"
                            :disabled="responding || !emailMatches"
                            class="w-full px-6 py-3 bg-lima-compartida text-gris-billetera rounded-lg hover:bg-lima-compartida/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <svg v-if="responding && pendingAction === 'accept'" class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                            </svg>
                            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            {{ responding && pendingAction === 'accept' ? 'Aceptando...' : 'Aceptar invitación' }}
                        </button>
                        <button
                            @click="respondToInvitation('decline')"
                            :disabled="responding || !emailMatches"
                            class="w-full px-6 py-3 border-2 border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <svg v-if="responding && pendingAction === 'decline'" class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                            </svg>
                            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                            {{ responding && pendingAction === 'decline' ? 'Rechazando...' : 'Rechazar invitación' }}
                        </button>
                    </div>

                    <!-- Email verification notice -->
                    <div v-if="!emailMatches" class="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div class="flex items-start gap-3">
                            <svg class="w-5 h-5 text-yellow-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <div>
                                <p class="text-yellow-800 font-medium text-sm">Verificación de email</p>
                                <p class="text-yellow-700 text-xs mt-1">
                                    Esta invitación es para {{ invitationData.invitation.email }}, pero has iniciado sesión como {{ currentUser?.email }}. Solo el usuario correcto puede responder a la invitación.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </div>

        <!-- Fallback visual si no hay loading, error ni datos -->
        <div v-if="!loading && !error && !invitationData" class="flex flex-col items-center justify-center min-h-[40vh]">
            <div class="w-16 h-16 border-4 border-azul-tiquet border-t-transparent rounded-full animate-spin mb-4"></div>
            <p class="text-gris-billetera text-lg font-semibold">No se encontró información de la invitación.<br>Verifica el enlace o vuelve a intentarlo.</p>
            <NuxtLink to="/" class="mt-6 px-6 py-3 bg-azul-tiquet text-blanco-dividido rounded-lg hover:bg-azul-tiquet/90 transition-colors font-medium">Ir al inicio</NuxtLink>
        </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth.store'

// Composables
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// State
const loading = ref(true)
const error = ref('')
const invitationData = ref(null)
const responding = ref(false)
const pendingAction = ref('')
const responseSubmitted = ref(false)
const lastResponse = ref('')
const responseMessage = ref('')

// Computed
const isAuthenticated = computed(() => authStore.isAuthenticated)
const currentUser = computed(() => authStore.user)

const emailMatches = computed(() => {
  if (!isAuthenticated.value || !invitationData.value) return false
  return currentUser.value?.email === invitationData.value.invitation.email
})

// Methods
const getRoleLabel = (role) => {
  const labels = {
    owner: 'Propietario',
    admin: 'Administrador',
    member: 'Miembro'
  }
  return labels[role] || role
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const loadInvitationData = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const token = route.params.token
    if (!token) {
      error.value = 'Token de invitación no proporcionado'
      return
    }

        const response = await $fetch(`/api/invitation/${token}`)
        if (response.success) {
            invitationData.value = response.data
        } else {
            error.value = response.message || 'Error al cargar la invitación'
        }
    } catch (err) {
        console.error('Error loading invitation:', err)
        if (err.status === 404 || err.statusCode === 404) {
            error.value = 'La invitación no fue encontrada o ya fue utilizada.'
        } else {
            error.value = err.data?.message || err.message || 'Invitación no válida o expirada'
        }
    } finally {
        loading.value = false
    }
}

const redirectToAuth = (type) => {
  // Guardar el token en localStorage para redirigir después del login/registro
  const token = route.params.token
  localStorage.setItem('pendingInvitationToken', token)
  
  // Redirigir a login o registro
  if (type === 'login') {
    router.push('/auth/login')
  } else {
    router.push('/auth/register')
  }
}

const respondToInvitation = async (action) => {
    if (!emailMatches.value) {
        error.value = 'No puedes responder a esta invitación con tu cuenta actual'
        alertStore.show({
            type: 'error',
            message: error.value
        })
        return
    }

    try {
        responding.value = true
        pendingAction.value = action

        const token = route.params.token
        const response = await $fetch('/api/invitation/respond', {
            method: 'POST',
            body: {
                token,
                action,
                userId: currentUser.value.id
            }
        })

        if (response.success) {
            responseSubmitted.value = true
            lastResponse.value = action
            responseMessage.value = response.message
            alertStore.show({
                type: 'success',
                message: response.message
            })
        } else {
            error.value = response.message || 'Error al procesar la respuesta'
            alertStore.show({
                type: 'error',
                message: error.value
            })
        }
    } catch (err) {
        console.error('Error responding to invitation:', err)
        error.value = err.data?.message || err.message || 'Error al procesar la respuesta'
        alertStore.show({
            type: 'error',
            message: error.value
        })
    } finally {
        responding.value = false
        pendingAction.value = ''
    }
    console.log('respondToInvitation')
}

// Initialize
onMounted(async () => {
  await loadInvitationData()
  
  // Si hay un token pendiente en localStorage y ahora está autenticado, limpiar
  if (isAuthenticated.value && localStorage.getItem('pendingInvitationToken')) {
    localStorage.removeItem('pendingInvitationToken')
  }
})

console.log('invitation-page-loaded')
</script>

<style scoped>
/* Estilos específicos si son necesarios */
</style>
