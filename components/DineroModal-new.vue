<template>
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-blanco-dividido rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <!-- Header -->
            <div class="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 class="text-xl font-semibold text-gris-billetera">
                    {{ isEditing ? 'Editar Dinero' : 'Nuevo Dinero' }}
                </h2>
                <button 
                    @click="$emit('close')"
                    class="text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <span class="text-2xl">&times;</span>
                </button>
            </div>

            <!-- Content -->
            <div class="p-6">
                <!-- Form -->
                <form @submit.prevent="saveDinero" class="space-y-4">
                    <!-- Name -->
                    <div>
                        <label for="name" class="block text-sm font-medium text-gris-billetera mb-2">
                            Nombre del dinero *
                        </label>
                        <input
                            id="name"
                            v-model="form.name"
                            type="text"
                            required
                            maxlength="50"
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-tiquet focus:border-transparent"
                            placeholder="Ej: Viaje a Barcelona"
                        />
                    </div>

                    <!-- Description -->
                    <div>
                        <label for="description" class="block text-sm font-medium text-gris-billetera mb-2">
                            Descripción
                        </label>
                        <textarea
                            id="description"
                            v-model="form.description"
                            rows="3"
                            maxlength="200"
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-tiquet focus:border-transparent resize-none"
                            placeholder="Descripción opcional del dinero..."
                        ></textarea>
                    </div>

                    <!-- Color -->
                    <div>
                        <label class="block text-sm font-medium text-gris-billetera mb-2">
                            Color
                        </label>
                        <div class="flex flex-wrap gap-2">
                            <button
                                v-for="color in colorOptions"
                                :key="color"
                                type="button"
                                @click="form.color = color"
                                :class="[
                                    'w-8 h-8 rounded-full border-2 transition-all',
                                    form.color === color ? 'border-gray-800 scale-110' : 'border-gray-300'
                                ]"
                                :style="{ backgroundColor: color }"
                            />
                        </div>
                    </div>

                    <!-- Default checkbox -->
                    <div class="flex items-center">
                        <input
                            id="isDefault"
                            v-model="form.isDefault"
                            type="checkbox"
                            class="w-4 h-4 text-azul-tiquet bg-gray-100 border-gray-300 rounded focus:ring-azul-tiquet focus:ring-2"
                        />
                        <label for="isDefault" class="ml-2 text-sm font-medium text-gris-billetera">
                            Establecer como dinero por defecto
                        </label>
                    </div>

                    <!-- Error message -->
                    <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p class="text-sm text-red-700">{{ error }}</p>
                    </div>

                    <!-- Buttons -->
                    <div class="flex gap-3 pt-4">
                        <button
                            type="button"
                            @click="$emit('close')"
                            class="flex-1 px-4 py-3 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            :disabled="loading || !form.name.trim()"
                            class="flex-1 px-4 py-3 bg-azul-tiquet hover:bg-azul-claro-viaje text-blanco-dividido rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <div v-if="loading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            {{ isEditing ? 'Actualizar' : 'Crear' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

const props = defineProps({
  dinero: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'saved'])

const dineroStore = useDineroStore()

// State
const loading = ref(false)
const error = ref('')
const form = ref({
  name: '',
  description: '',
  color: '#3A7CA5',
  isDefault: false
})

// Computed
const isEditing = computed(() => !!props.dinero)

// Color options
const colorOptions = [
  '#3A7CA5', // azul-tiquet (default)
  '#4A90A4', // azul-claro-viaje
  '#2E7D32', // Green
  '#1976D2', // Blue
  '#7B1FA2', // Purple
  '#E91E63', // Pink
  '#FF5722', // Deep Orange
  '#F57C00', // Orange
  '#FBC02D', // Yellow
  '#8BC34A', // Light Green
  '#00BCD4', // Cyan
  '#607D8B', // Blue Grey
  '#795548', // Brown
  '#9E9E9E'  // Grey
]

// Methods
const resetForm = () => {
  if (props.dinero) {
    // Edit mode
    form.value = {
      name: props.dinero.name || '',
      description: props.dinero.description || '',
      color: props.dinero.color || '#3A7CA5',
      isDefault: props.dinero.isDefault || false
    }
  } else {
    // Create mode
    form.value = {
      name: '',
      description: '',
      color: '#3A7CA5',
      isDefault: false
    }
  }
  error.value = ''
}

const saveDinero = async () => {
  if (!form.value.name.trim()) {
    error.value = 'El nombre del dinero es requerido'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const dineroData = {
      name: form.value.name.trim(),
      description: form.value.description.trim(),
      color: form.value.color,
      isDefault: form.value.isDefault
    }

    if (isEditing.value) {
      // Update existing dinero
      await dineroStore.updateDinero(props.dinero.id, dineroData)
    } else {
      // Create new dinero
      await dineroStore.createDinero(dineroData)
    }

    emit('saved')
  } catch (err) {
    console.error('Error saving dinero:', err)
    error.value = err.message || 'Error al guardar el dinero'
  } finally {
    loading.value = false
  }
}

// Watchers
watch(() => props.dinero, () => {
  resetForm()
}, { immediate: true })

// Initialize
onMounted(() => {
  resetForm()
})
</script>
