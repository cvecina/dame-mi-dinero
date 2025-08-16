<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 flex flex-col items-center justify-center gap-4">
      <h3 class="text-lg font-semibold text-gray-900 mb-2">Invitar usuario</h3>
      <button
        @click="inviteAndCopy"
        :disabled="isGenerating"
        class="w-full bg-[#3A7CA5] text-white py-2 px-4 rounded-lg hover:bg-[#2d5f7f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold"
      >
        <span v-if="isGenerating">Generando...</span>
        <span v-else>Invitar usuario</span>
      </button>
      <button @click="closeModal" class="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300 transition-colors">Cerrar</button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useAlertStore } from '~/stores/alert.store'
import { useAuthStore } from '~/stores/auth.store'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  dineroId: {
    type: String,
    required: true
  }
})

console.log('InviteUserModal props:', props)

const emit = defineEmits(['close'])
const alertStore = useAlertStore()
const authStore = useAuthStore()

const isGenerating = ref(false)

const closeModal = () => {
  emit('close')
}

const inviteAndCopy = async () => {
  isGenerating.value = true
  try {
    const requestBody = {
      dineroId: props.dineroId,
      invitedBy: authStore.user?.id
    }
    const response = await $fetch(`/api/dineros/invite-link`, {
      method: 'POST',
      body: requestBody
    })
    if (response.success) {
      const baseUrl = window.location.origin
      const link = `${baseUrl}/invitation/${response.token}`
      await navigator.clipboard.writeText(link)
      alertStore.success('Enlace copiado al portapapeles')
      closeModal()
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    console.error('Error generando/copiando invitación:', error)
    alertStore.error('Error al generar el enlace de invitación')
  } finally {
    isGenerating.value = false
  }
}

console.log('InviteUserModal')
</script>
