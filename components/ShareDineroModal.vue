<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">
            Compartir Dinero
          </h3>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600 transition-colors"
            :aria-label="$t('common.close')"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
        <!-- Dinero Info -->
        <div class="mb-6 p-4 bg-gray-50 rounded-lg">
          <div class="flex items-center gap-3">
            <div 
              class="w-4 h-4 rounded-full" 
              :style="{ backgroundColor: dinero?.color || '#3A7CA5' }"
            ></div>
            <div>
              <h4 class="font-medium text-gray-900">{{ dinero?.name }}</h4>
              <p v-if="dinero?.description" class="text-sm text-gray-600">
                {{ dinero.description }}
              </p>
            </div>
          </div>
        </div>

        <!-- Current Shares -->
        <div v-if="sharedUsers.length > 0" class="mb-6">
          <h5 class="text-sm font-medium text-gray-700 mb-3">
            Compartido con:
          </h5>
          <div class="space-y-2">
            <div 
              v-for="user in sharedUsers" 
              :key="user.id"
              class="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
            >
              <div>
                <p class="font-medium text-gray-900">{{ user.nickname }}</p>
                <p class="text-sm text-gray-600">@{{ user.username }}</p>
              </div>
              <button
                @click="unshareWithUser(user.id)"
                :disabled="loading"
                class="text-red-600 hover:text-red-800 disabled:opacity-50 text-sm font-medium"
              >
                Quitar
              </button>
            </div>
          </div>
        </div>

        <!-- Share with new user -->
        <div>
          <h5 class="text-sm font-medium text-gray-700 mb-3">
            Compartir con nuevo usuario:
          </h5>
          
          <!-- User Selection -->
          <div class="space-y-3">
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Buscar usuario..."
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <!-- Available Users List -->
            <div v-if="filteredAvailableUsers.length > 0" class="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
              <button
                v-for="user in filteredAvailableUsers"
                :key="user.id"
                @click="shareWithUser(user.id)"
                :disabled="loading"
                class="w-full text-left p-3 hover:bg-gray-50 disabled:opacity-50 flex items-center justify-between border-b border-gray-100 last:border-b-0"
              >
                <div>
                  <p class="font-medium text-gray-900">{{ user.nickname }}</p>
                  <p class="text-sm text-gray-600">@{{ user.username }}</p>
                </div>
                <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
              </button>
            </div>

            <!-- No users message -->
            <div v-else-if="!loadingUsers && availableUsers.length === 0" class="text-center py-4 text-gray-500">
              No hay usuarios disponibles para compartir
            </div>

            <!-- No search results -->
            <div v-else-if="searchQuery && filteredAvailableUsers.length === 0" class="text-center py-4 text-gray-500">
              No se encontraron usuarios que coincidan con "{{ searchQuery }}"
            </div>

            <!-- Loading -->
            <div v-if="loadingUsers" class="text-center py-4">
              <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-sm text-red-700">{{ error }}</p>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div class="flex justify-end gap-3">
          <button
            @click="$emit('close')"
            class="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  dinero: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'shared', 'unshared'])

const dineroStore = useDineroStore()
const authStore = useAuthStore()

const loading = ref(false)
const loadingUsers = ref(false)
const error = ref('')
const searchQuery = ref('')
const availableUsers = ref([])
const sharedUsers = ref([])

// Computed
const filteredAvailableUsers = computed(() => {
  if (!searchQuery.value) return availableUsers.value
  
  const query = searchQuery.value.toLowerCase()
  return availableUsers.value.filter(user => 
    user.nickname.toLowerCase().includes(query) ||
    user.username.toLowerCase().includes(query)
  )
})

// Methods
const loadUsers = async () => {
  if (!authStore.isAuthenticated) return

  loadingUsers.value = true
  error.value = ''

  try {
    const response = await $fetch('/api/users/list', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      }
    })

    if (response.success) {
      availableUsers.value = response.data || []
      updateSharedUsers()
    } else {
      throw new Error(response.message || 'Error al cargar usuarios')
    }
  } catch (err) {
    console.error('Error loading users:', err)
    error.value = 'Error al cargar la lista de usuarios'
    availableUsers.value = []
  } finally {
    loadingUsers.value = false
  }
}

const updateSharedUsers = () => {
  if (!props.dinero || !props.dinero.sharedWith) {
    sharedUsers.value = []
    return
  }

  // Obtener información de usuarios con los que ya está compartido
  sharedUsers.value = props.dinero.sharedWith
    .map(userId => availableUsers.value.find(user => user.id === userId))
    .filter(Boolean)

  // Filtrar usuarios disponibles para excluir los que ya tienen acceso
  availableUsers.value = availableUsers.value.filter(user => 
    !props.dinero.sharedWith.includes(user.id)
  )
}

const shareWithUser = async (userId) => {
  if (!props.dinero || loading.value) return

  loading.value = true
  error.value = ''

  try {
    await dineroStore.shareDinero(props.dinero.id, userId)
    
    // Actualizar listas locales
    const user = availableUsers.value.find(u => u.id === userId)
    if (user) {
      sharedUsers.value.push(user)
      availableUsers.value = availableUsers.value.filter(u => u.id !== userId)
    }

    emit('shared', { dinero: props.dinero, user })
    
    // Mostrar toast de éxito
    const { showToast } = useToast()
    showToast(`Dinero compartido con ${user?.nickname || 'usuario'}`, 'success')
    
  } catch (err) {
    console.error('Error sharing dinero:', err)
    error.value = err.message || 'Error al compartir el dinero'
  } finally {
    loading.value = false
  }
}

const unshareWithUser = async (userId) => {
  if (!props.dinero || loading.value) return

  loading.value = true
  error.value = ''

  try {
    await dineroStore.unshareDinero(props.dinero.id, userId)
    
    // Actualizar listas locales
    const user = sharedUsers.value.find(u => u.id === userId)
    if (user) {
      sharedUsers.value = sharedUsers.value.filter(u => u.id !== userId)
      availableUsers.value.push(user)
      // Reordenar alfabéticamente
      availableUsers.value.sort((a, b) => a.nickname.localeCompare(b.nickname))
    }

    emit('unshared', { dinero: props.dinero, user })
    
    // Mostrar toast de éxito
    const { showToast } = useToast()
    showToast(`Dinero ya no compartido con ${user?.nickname || 'usuario'}`, 'success')
    
  } catch (err) {
    console.error('Error unsharing dinero:', err)
    error.value = err.message || 'Error al dejar de compartir el dinero'
  } finally {
    loading.value = false
  }
}

// Watchers
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    loadUsers()
    searchQuery.value = ''
    error.value = ''
  }
})

watch(() => props.dinero, () => {
  if (props.dinero && availableUsers.value.length > 0) {
    updateSharedUsers()
  }
})

// Initialize
onMounted(() => {
  if (props.isOpen) {
    loadUsers()
  }
})
</script>
