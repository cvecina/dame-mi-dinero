<template>
  <div class="min-h-screen bg-marfil-mapamundi py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center gap-4 mb-4">
          <button 
            @click="$router.back()"
            class="p-2 text-gris-billetera hover:text-azul-tiquet hover:bg-azul-claro-viaje/10 rounded-lg transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
          <h1 class="text-3xl font-bold text-gris-billetera">Mi Perfil</h1>
        </div>
        <p class="text-gray-600">Gestiona tu información personal y preferencias</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Información del usuario -->
        <div class="lg:col-span-2">
          <div class="bg-blanco-dividido rounded-xl shadow-sm border border-gray-100 p-6">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold text-gris-billetera">Información Personal</h2>
              <button 
                v-if="!isEditing"
                @click="startEditing"
                class="flex items-center gap-2 px-4 py-2 text-azul-tiquet hover:bg-azul-claro-viaje/10 rounded-lg transition-colors"
              >
                <span>✏️</span>
                <span>Editar</span>
              </button>
            </div>

            <form @submit.prevent="saveProfile" class="space-y-6">
              <!-- Avatar -->
              <div class="flex items-center gap-6">
                <div class="w-20 h-20 bg-azul-tiquet rounded-full flex items-center justify-center text-blanco-dividido text-2xl font-bold">
                  {{ currentUser?.nickname?.charAt(0)?.toUpperCase() || currentUser?.name?.charAt(0)?.toUpperCase() || "?" }}
                </div>
                <div>
                  <h3 class="font-medium text-gris-billetera">Foto de perfil</h3>
                  <p class="text-sm text-gray-500 mb-2">JPG, GIF o PNG. Máximo 1MB.</p>
                  <button 
                    type="button"
                    :disabled="!isEditing"
                    class="text-sm text-azul-tiquet hover:text-azul-tiquet/80 disabled:opacity-50"
                  >
                    Cambiar foto
                  </button>
                </div>
              </div>

              <!-- Campos del formulario -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Nombre completo -->
                <div>
                  <label for="name" class="block text-sm font-medium text-gris-billetera mb-2">
                    Nombre completo
                  </label>
                  <input
                    id="name"
                    :value="isEditing ? profileForm.name : (currentUser?.name || '')"
                    @input="isEditing && (profileForm.name = $event.target.value)"
                    type="text"
                    :disabled="!isEditing"
                    class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-azul-tiquet focus:border-azul-tiquet transition-all duration-200 disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="Tu nombre completo"
                  />
                </div>

                <!-- Apodo -->
                <div>
                  <label for="nickname" class="block text-sm font-medium text-gris-billetera mb-2">
                    Apodo <span class="text-xs text-gray-500">(así te ven otros usuarios)</span>
                  </label>
                  <input
                    id="nickname"
                    :value="isEditing ? profileForm.nickname : (currentUser?.nickname || '')"
                    @input="isEditing && (profileForm.nickname = $event.target.value)"
                    type="text"
                    :disabled="!isEditing"
                    class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-azul-tiquet focus:border-azul-tiquet transition-all duration-200 disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="Tu apodo"
                  />
                </div>

                <!-- Email -->
                <div>
                  <label for="email" class="block text-sm font-medium text-gris-billetera mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    :value="isEditing ? profileForm.email : (currentUser?.email || '')"
                    @input="isEditing && (profileForm.email = $event.target.value)"
                    type="email"
                    :disabled="!isEditing"
                    class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-azul-tiquet focus:border-azul-tiquet transition-all duration-200 disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="tu@email.com"
                  />
                </div>

                <!-- Miembro desde -->
                <div>
                  <label class="block text-sm font-medium text-gris-billetera mb-2">
                    Miembro desde
                  </label>
                  <input
                    :value="formatDate(currentUser?.createdAt)"
                    disabled
                    class="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>
              </div>

              <!-- Botones de acción -->
              <div v-if="isEditing" class="flex items-center gap-4 pt-4 border-t">
                <button
                  type="submit"
                  :disabled="isLoading"
                  class="flex items-center gap-2 px-6 py-3 bg-azul-tiquet text-blanco-dividido font-medium rounded-lg hover:bg-azul-tiquet/90 focus:ring-4 focus:ring-azul-tiquet/20 transition-all duration-200 disabled:opacity-50"
                >
                  <div v-if="isLoading" class="w-4 h-4 border-2 border-blanco-dividido border-t-transparent rounded-full animate-spin"></div>
                  {{ isLoading ? 'Guardando...' : 'Guardar cambios' }}
                </button>
                <button
                  type="button"
                  @click="cancelEditing"
                  :disabled="isLoading"
                  class="px-6 py-3 text-gris-billetera border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Información adicional -->
        <div class="space-y-6">
          <!-- Estadísticas -->
          <div class="bg-blanco-dividido rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 class="text-lg font-semibold text-gris-billetera mb-4">Estadísticas</h3>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-gray-600">Último acceso</span>
                <span class="font-medium text-gris-billetera">
                  {{ formatDate(currentUser?.lastLogin) || 'Ahora' }}
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-600">Estado</span>
                <span class="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  <span class="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  Activo
                </span>
              </div>
            </div>
          </div>

          <!-- Acciones rápidas -->
          <div class="bg-blanco-dividido rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 class="text-lg font-semibold text-gris-billetera mb-4">Acciones</h3>
            <div class="space-y-3">
              <button 
                @click="showChangePasswordModal = true"
                class="w-full flex items-center gap-3 px-4 py-3 text-gris-billetera hover:bg-azul-claro-viaje/10 rounded-lg transition-colors"
              >
                <span>🔒</span>
                <span>Cambiar contraseña</span>
              </button>
              <button 
                @click="showDeleteAccountConfirm"
                class="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <span>🗑️</span>
                <span>Eliminar cuenta</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Change Password Modal -->
    <ChangePasswordModal 
      :is-visible="showChangePasswordModal" 
      @close="showChangePasswordModal = false" 
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth.store'
import { useAlertStore } from '~/stores/alert.store'

definePageMeta({
  middleware: 'auth'
})

// Stores
const authStore = useAuthStore()
const alertStore = useAlertStore()

// Estado reactivo
const isEditing = ref(false)
const isLoading = ref(false)
const showChangePasswordModal = ref(false)

const profileForm = ref({
  name: '',
  nickname: '',
  email: ''
})

// Computed
const currentUser = computed(() => authStore.user)

// Métodos
const formatDate = (dateString) => {
  if (!dateString) return null
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const startEditing = () => {
  isEditing.value = true
  // Cargar datos actuales en el formulario
  profileForm.value = {
    name: currentUser.value?.name || '',
    nickname: currentUser.value?.nickname || '',
    email: currentUser.value?.email || ''
  }
}

const cancelEditing = () => {
  isEditing.value = false
  // Resetear formulario
  profileForm.value = {
    name: '',
    nickname: '',
    email: ''
  }
}

const saveProfile = async () => {
  isLoading.value = true
  try {
    const result = await authStore.updateProfile(profileForm.value)
    
    if (result.success) {
      alertStore.success('Perfil actualizado correctamente')
      isEditing.value = false
    } else {
      throw new Error(result.error || 'Error al actualizar el perfil')
    }
  } catch (error) {
    console.error('Error saving profile:', error)
    alertStore.error(error.message || 'Error al actualizar el perfil')
  } finally {
    isLoading.value = false
  }
}

const showDeleteAccountConfirm = () => {
  const confirmed = confirm(
    '⚠️ ADVERTENCIA: Esta acción eliminará permanentemente tu cuenta y todos tus datos.\n\n' +
    '• Se eliminarán todos tus gastos y registros\n' +
    '• Se eliminarán todas tus relaciones con otros usuarios\n' +
    '• Esta acción NO se puede deshacer\n\n' +
    '¿Estás completamente seguro de que quieres eliminar tu cuenta?'
  )
  
  if (confirmed) {
    const finalConfirm = confirm(
      '🚨 ÚLTIMA CONFIRMACIÓN\n\n' +
      'Escribe "ELIMINAR" para confirmar que quieres eliminar tu cuenta permanentemente:'
    )
    
    if (finalConfirm) {
      alertStore.info('Funcionalidad de eliminación de cuenta pendiente de implementación')
      // TODO: Implementar eliminación de cuenta
      // deleteAccount()
    }
  }
}

onMounted(() => {
  console.log('Profile page mounted')
})

console.log('profile-page')
</script>
