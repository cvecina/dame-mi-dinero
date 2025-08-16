<template>
    <div class="min-h-screen bg-marfil-mapamundi p-3 sm:p-4 lg:p-6">
        <!-- Loading state -->
        <div v-if="loading" class="flex items-center justify-center py-20">
            <div class="text-center">
                <div class="w-16 h-16 border-4 border-azul-tiquet border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p class="text-gris-billetera font-medium">Cargando dineros...</p>
            </div>
        </div>

        <!-- Main content -->
        <div v-else class="max-w-7xl mx-auto">
            <!-- Header -->
            <div class="mb-8">
                <div class="bg-gradient-to-r from-azul-tiquet to-azul-claro-viaje rounded-2xl p-6 text-blanco-dividido shadow-xl">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 class="text-2xl sm:text-3xl font-bold mb-2">Dineros</h1>
                            <p class="text-azul-claro-viaje/90 text-sm sm:text-base">
                                Gestiona tus contenedores de gastos compartidos
                            </p>
                        </div>
                        <div class="flex items-center gap-3">
                            <div class="bg-blanco-dividido/20 backdrop-blur-sm rounded-lg px-4 py-2">
                                <p class="text-xs opacity-80">Propios</p>
                                <p class="text-xl font-bold">{{ myDineros.length }}</p>
                            </div>
                            <div class="bg-blanco-dividido/20 backdrop-blur-sm rounded-lg px-4 py-2">
                                <p class="text-xs opacity-80">Compartidos</p>
                                <p class="text-xl font-bold">{{ sharedDineros.length }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Action Bar -->
            <div class="bg-blanco-dividido rounded-2xl shadow-lg p-6 mb-8 border border-azul-claro-viaje/20">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div class="flex flex-col sm:flex-row gap-4">
                        <!-- Filter -->
                        <div class="relative">
                            <label class="text-sm font-semibold text-gris-billetera mb-2 flex items-center gap-2">
                                <span class="text-azul-tiquet">💰</span>
                                Filtrar dineros
                            </label>
                            <select 
                                v-model="filterType"
                                class="px-4 py-3 text-sm border-2 border-azul-claro-viaje/30 rounded-xl focus:ring-2 focus:ring-azul-tiquet focus:border-azul-tiquet bg-blanco-dividido transition-all duration-200 hover:border-azul-claro-viaje min-w-[200px]"
                            >
                                <option value="all">Todos los dineros</option>
                                <option value="owned">Mis dineros</option>
                                <option value="shared">Compartidos conmigo</option>
                            </select>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex gap-3">
                        <button
                            @click="showDineroModal = true"
                            class="bg-azul-tiquet hover:bg-azul-claro-viaje text-blanco-dividido px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                        >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                            </svg>
                            Nuevo Dinero
                        </button>
                    </div>
                </div>
            </div>

            <!-- Dineros Grid -->
            <div v-if="filteredDineros.length > 0" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div 
                    v-for="dinero in filteredDineros" 
                    :key="dinero.id"
                    class="bg-blanco-dividido rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-200"
                >
                    <!-- Dinero Header -->
                    <div class="p-6 border-b border-gray-100" :style="{ borderTopColor: dinero.color, borderTopWidth: '4px' }">
                        <div class="flex items-start justify-between mb-4">
                            <div class="flex items-center gap-3">
                                <div 
                                    class="w-12 h-12 rounded-full flex items-center justify-center text-blanco-dividido font-bold text-lg shadow-md"
                                    :style="{ backgroundColor: dinero.color }"
                                >
                                    {{ dinero.name.charAt(0).toUpperCase() }}
                                </div>
                                <div>
                                    <h3 class="font-bold text-lg text-gris-billetera">{{ dinero.name }}</h3>
                                    <p v-if="dinero.description" class="text-sm text-gray-600">{{ dinero.description }}</p>
                                </div>
                            </div>
                            
                            <!-- Ownership Indicator -->
                            <div class="flex items-center gap-2">
                                <span v-if="dinero.isDefault" class="bg-lima-compartida text-blanco-dividido text-xs px-2 py-1 rounded-full font-medium">
                                    Por defecto
                                </span>
                                <span v-if="isSharedDinero(dinero)" class="bg-azul-claro-viaje text-blanco-dividido text-xs px-2 py-1 rounded-full font-medium">
                                    Compartido
                                </span>
                            </div>
                        </div>

                        <!-- Shared With Info -->
                        <div v-if="dinero.sharedWith && dinero.sharedWith.length > 0 && isMyDinero(dinero)" class="mb-4">
                            <p class="text-xs text-gray-600 mb-2">Compartido con:</p>
                            <div class="flex flex-wrap gap-1">
                                <span 
                                    v-for="userId in dinero.sharedWith.slice(0, 3)" 
                                    :key="userId"
                                    class="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                                >
                                    Usuario {{ userId }}
                                </span>
                                <span v-if="dinero.sharedWith.length > 3" class="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                                    +{{ dinero.sharedWith.length - 3 }} más
                                </span>
                            </div>
                        </div>

                        <!-- Actions -->
                        <div class="flex gap-2">
                            <button
                                v-if="isMyDinero(dinero)"
                                @click="editDinero(dinero)"
                                class="flex-1 bg-azul-claro-viaje/10 hover:bg-azul-claro-viaje/20 text-azul-claro-viaje px-4 py-2 rounded-lg font-medium transition-colors text-sm flex items-center justify-center gap-2"
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                </svg>
                                Editar
                            </button>
                            
                            <button
                                v-if="isMyDinero(dinero)"
                                @click="openShareModal(dinero)"
                                class="flex-1 bg-lima-compartida/10 hover:bg-lima-compartida/20 text-lima-compartida px-4 py-2 rounded-lg font-medium transition-colors text-sm flex items-center justify-center gap-2"
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path>
                                </svg>
                                Compartir
                            </button>
                            
                            <button
                                v-if="isMyDinero(dinero) && !dinero.isDefault"
                                @click="deleteDinero(dinero.id)"
                                class="bg-red-500/10 hover:bg-red-500/20 text-red-600 px-3 py-2 rounded-lg font-medium transition-colors text-sm"
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <!-- Quick Stats -->
                    <div class="p-4 bg-gray-50">
                        <div class="text-center">
                            <p class="text-sm text-gray-600">
                                <span v-if="isMyDinero(dinero)">Creado</span>
                                <span v-else>Compartido</span>
                                {{ formatDate(dinero.createdAt) }}
                            </p>
                            <p v-if="dinero.updatedAt !== dinero.createdAt" class="text-xs text-gray-500 mt-1">
                                Actualizado {{ formatDate(dinero.updatedAt) }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Empty State -->
            <div v-else class="text-center py-20">
                <div class="w-32 h-32 mx-auto mb-6 opacity-50">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-full h-full text-gray-400">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                    </svg>
                </div>
                <h3 class="text-xl font-semibold text-gris-billetera mb-2">
                    <span v-if="filterType === 'owned'">No tienes dineros</span>
                    <span v-else-if="filterType === 'shared'">No hay dineros compartidos contigo</span>
                    <span v-else>No hay dineros disponibles</span>
                </h3>
                <p class="text-gray-600 mb-6">
                    <span v-if="filterType === 'owned'">Crea tu primer dinero para empezar a gestionar gastos</span>
                    <span v-else-if="filterType === 'shared'">Cuando alguien comparta un dinero contigo aparecerá aquí</span>
                    <span v-else>Crea un dinero para empezar a gestionar gastos compartidos</span>
                </p>
                <button
                    v-if="filterType !== 'shared'"
                    @click="showDineroModal = true"
                    class="bg-azul-tiquet hover:bg-azul-claro-viaje text-blanco-dividido px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                    Crear primer dinero
                </button>
            </div>

            <!-- Error message -->
            <div v-if="error" class="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p class="text-red-700">{{ error }}</p>
            </div>

            <!-- Modals -->
            <DineroModal 
                v-if="showDineroModal"
                :dinero="selectedDinero"
                @close="closeDineroModal"
                @saved="onDineroSaved"
            />

            <ShareDineroModal
                v-if="showShareModal"
                :is-open="showShareModal"
                :dinero="selectedDinero"
                @close="closeShareModal"
                @shared="onDineroShared"
                @unshared="onDineroUnshared"
            />
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
const dineroStore = useDineroStore()
const authStore = useAuthStore()
const { showToast } = useToast()

// Reactive data
const loading = ref(false)
const error = ref('')
const filterType = ref('all')
const showDineroModal = ref(false)
const showShareModal = ref(false)
const selectedDinero = ref(null)

// Computed properties
const myDineros = computed(() => dineroStore.getMyDineros)
const sharedDineros = computed(() => dineroStore.getSharedDineros)
const accessibleDineros = computed(() => dineroStore.getAccessibleDineros)

const filteredDineros = computed(() => {
  switch (filterType.value) {
    case 'owned':
      return myDineros.value
    case 'shared':
      return sharedDineros.value
    default:
      return accessibleDineros.value
  }
})

// Methods
const isMyDinero = (dinero) => {
  return dinero.ownerId === authStore.user?.id
}

const isSharedDinero = (dinero) => {
  return dinero.ownerId !== authStore.user?.id
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const editDinero = (dinero) => {
  selectedDinero.value = dinero
  showDineroModal.value = true
}

const openShareModal = (dinero) => {
  selectedDinero.value = dinero
  showShareModal.value = true
}

const closeDineroModal = () => {
  showDineroModal.value = false
  selectedDinero.value = null
}

const closeShareModal = () => {
  showShareModal.value = false
  selectedDinero.value = null
}

const onDineroSaved = () => {
  showToast('Dinero guardado correctamente', 'success')
  closeDineroModal()
}

const onDineroShared = (data) => {
  showToast(`Dinero compartido con ${data.user.nickname}`, 'success')
}

const onDineroUnshared = (data) => {
  showToast(`Dinero ya no compartido con ${data.user.nickname}`, 'success')
}

const deleteDinero = async (dineroId) => {
  const dinero = dineroStore.getDineroById(dineroId)
  if (!dinero) return

  if (!confirm(`¿Estás seguro de que quieres eliminar el dinero "${dinero.name}"?`)) {
    return
  }

  try {
    loading.value = true
    await dineroStore.deleteDinero(dineroId)
    showToast('Dinero eliminado correctamente', 'success')
  } catch (err) {
    console.error('Error deleting dinero:', err)
    error.value = err.message || 'Error al eliminar el dinero'
    showToast('Error al eliminar el dinero', 'error')
  } finally {
    loading.value = false
  }
}

const loadDineros = async () => {
  try {
    loading.value = true
    error.value = ''
    await dineroStore.fetchDineros()
  } catch (err) {
    console.error('Error loading dineros:', err)
    error.value = err.message || 'Error al cargar los dineros'
  } finally {
    loading.value = false
  }
}

// Initialize
onMounted(async () => {
  await loadDineros()
})

console.log('dineros-page')
</script>
