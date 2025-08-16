<template>
  <div v-if="isVisible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-blanco-dividido rounded-xl shadow-xl max-w-md w-full p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold text-gris-billetera">Cambiar Contraseña</h2>
        <button 
          @click="closeModal"
          class="p-2 text-gray-400 hover:text-gris-billetera rounded-lg transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="changePassword" class="space-y-4">
        <!-- Contraseña actual -->
        <div>
          <label for="currentPassword" class="block text-sm font-medium text-gris-billetera mb-2">
            Contraseña actual
          </label>
          <input
            id="currentPassword"
            v-model="form.currentPassword"
            type="password"
            required
            class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-azul-tiquet focus:border-azul-tiquet transition-all duration-200"
            placeholder="Tu contraseña actual"
          />
        </div>

        <!-- Nueva contraseña -->
        <div>
          <label for="newPassword" class="block text-sm font-medium text-gris-billetera mb-2">
            Nueva contraseña
          </label>
          <input
            id="newPassword"
            v-model="form.newPassword"
            type="password"
            required
            minlength="6"
            class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-azul-tiquet focus:border-azul-tiquet transition-all duration-200"
            placeholder="Mínimo 6 caracteres"
          />
          <p class="text-xs text-gray-500 mt-1">La contraseña debe tener al menos 6 caracteres</p>
        </div>

        <!-- Confirmar nueva contraseña -->
        <div>
          <label for="confirmPassword" class="block text-sm font-medium text-gris-billetera mb-2">
            Confirmar nueva contraseña
          </label>
          <input
            id="confirmPassword"
            v-model="form.confirmPassword"
            type="password"
            required
            class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-azul-tiquet focus:border-azul-tiquet transition-all duration-200"
            placeholder="Repite la nueva contraseña"
          />
        </div>

        <!-- Error message -->
        <div v-if="errorMessage" class="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {{ errorMessage }}
        </div>

        <!-- Buttons -->
        <div class="flex items-center gap-3 pt-4">
          <button
            type="submit"
            :disabled="isLoading"
            class="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-azul-tiquet text-blanco-dividido font-medium rounded-lg hover:bg-azul-tiquet/90 focus:ring-4 focus:ring-azul-tiquet/20 transition-all duration-200 disabled:opacity-50"
          >
            <div v-if="isLoading" class="w-4 h-4 border-2 border-blanco-dividido border-t-transparent rounded-full animate-spin"></div>
            {{ isLoading ? 'Cambiando...' : 'Cambiar Contraseña' }}
          </button>
          <button
            type="button"
            @click="closeModal"
            :disabled="isLoading"
            class="px-4 py-3 text-gris-billetera border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useAuthStore } from '~/stores/auth.store'
import { useAlertStore } from '~/stores/alert.store'

// Props
const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['close'])

// Stores
const authStore = useAuthStore()
const alertStore = useAlertStore()

// Estado reactivo
const isLoading = ref(false)
const errorMessage = ref('')

const form = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Métodos
const closeModal = () => {
  resetForm()
  emit('close')
}

const resetForm = () => {
  form.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
  errorMessage.value = ''
  isLoading.value = false
}

const validateForm = () => {
  if (form.value.newPassword.length < 6) {
    errorMessage.value = 'La nueva contraseña debe tener al menos 6 caracteres'
    return false
  }

  if (form.value.newPassword !== form.value.confirmPassword) {
    errorMessage.value = 'Las contraseñas no coinciden'
    return false
  }

  if (form.value.currentPassword === form.value.newPassword) {
    errorMessage.value = 'La nueva contraseña debe ser diferente a la actual'
    return false
  }

  return true
}

const changePassword = async () => {
  errorMessage.value = ''
  
  if (!validateForm()) {
    return
  }

  isLoading.value = true

  try {
    const result = await authStore.changePassword({
      currentPassword: form.value.currentPassword,
      newPassword: form.value.newPassword
    })

    if (result.success) {
      alertStore.success('Contraseña cambiada correctamente')
      closeModal()
    } else {
      errorMessage.value = result.error || 'Error al cambiar la contraseña'
    }
  } catch (error) {
    console.error('Error changing password:', error)
    errorMessage.value = error.message || 'Error al cambiar la contraseña'
  } finally {
    isLoading.value = false
  }
}

// Limpiar formulario cuando se cierra el modal
watch(() => props.isVisible, (newValue) => {
  if (!newValue) {
    resetForm()
  }
})

console.log('change-password-modal')
</script>
