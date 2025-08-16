<template>
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-blanco-dividido rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <!-- Header -->
            <div class="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 class="text-xl font-semibold text-gris-billetera">Gestionar Dineros</h2>
                <button 
                    @click="$emit('close')"
                    class="text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <span class="text-2xl">&times;</span>
                </button>
            </div>

            <!-- Content -->
            <div class="p-6">
                <!-- Loading state -->
                <div v-if="dineroStore.isLoading" class="text-center py-8">
                    <div class="w-8 h-8 border-2 border-azul-tiquet border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p class="text-gray-600">Cargando dineros...</p>
                </div>

                <!-- Lista de dineros -->
                <div v-else>
                    <div class="mb-6">
                        <h3 class="text-lg font-medium text-gris-billetera mb-4">Dineros existentes</h3>
                        <div class="space-y-3">
                            <div 
                                v-for="dinero in dineros" 
                                :key="dinero.id"
                                class="flex items-center justify-between p-4 bg-marfil-mapamundi rounded-lg"
                            >
                                <div class="flex items-center gap-3">
                                    <div 
                                        class="w-4 h-4 rounded-full" 
                                        :style="{ backgroundColor: dinero.color }"
                                    ></div>
                                    <div>
                                        <h4 class="font-medium text-gris-billetera">{{ dinero.name }}</h4>
                                        <p class="text-sm text-gray-600">{{ getExpenseCount(dinero.id) }} gastos</p>
                                        <span v-if="dinero.isDefault" class="text-xs px-2 py-1 bg-azul-tiquet/10 text-azul-tiquet rounded-full">
                                            Por defecto
                                        </span>
                                    </div>
                                </div>
                                
                                <div class="flex items-center gap-2">
                                    <button 
                                        @click="editDinero(dinero)"
                                        class="text-azul-tiquet hover:text-azul-claro-viaje transition-colors p-1"
                                        title="Editar"
                                    >
                                        ✏️
                                    </button>
                                    <button 
                                        v-if="!dinero.isDefault"
                                        @click="deleteDinero(dinero.id)"
                                        class="text-red-500 hover:text-red-600 transition-colors p-1"
                                        title="Eliminar"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Formulario para nuevo dinero -->
                    <div class="border-t border-gray-200 pt-6">
                        <h3 class="text-lg font-medium text-gris-billetera mb-4">
                            {{ editingDinero ? 'Editar dinero' : 'Crear nuevo dinero' }}
                        </h3>
                        
                        <form @submit.prevent="saveDinero" class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Nombre del dinero
                                </label>
                                <input
                                    v-model="form.name"
                                    type="text"
                                    required
                                    class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azul-tiquet focus:border-transparent"
                                    placeholder="Ej: Viaje a Madrid, Cena de empresa..."
                                />
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Descripción (opcional)
                                </label>
                                <textarea
                                    v-model="form.description"
                                    rows="2"
                                    class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azul-tiquet focus:border-transparent"
                                    placeholder="Descripción del dinero..."
                                ></textarea>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Color
                                </label>
                                <div class="flex gap-2 flex-wrap">
                                    <button
                                        v-for="color in availableColors"
                                        :key="color.value"
                                        type="button"
                                        @click="form.color = color.value"
                                        class="w-8 h-8 rounded-full border-2 transition-all"
                                        :class="form.color === color.value ? 'border-gray-800 scale-110' : 'border-gray-300'"
                                        :style="{ backgroundColor: color.value }"
                                        :title="color.name"
                                    ></button>
                                </div>
                            </div>

                            <div class="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    :disabled="!form.name || loading"
                                    class="flex-1 bg-lima-compartida hover:bg-azul-claro-viaje text-gris-billetera py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
                                >
                                    {{ loading ? 'Guardando...' : (editingDinero ? 'Actualizar' : 'Crear dinero') }}
                                </button>
                                
                                <button
                                    v-if="editingDinero"
                                    type="button"
                                    @click="cancelEdit"
                                    class="px-4 py-3 text-gray-600 hover:text-gray-800 transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDineroStore } from '~/stores/dinero.store'
import { useExpenseStore } from '~/stores/expense.store'
import { useAlertStore } from '~/stores/alert.store'

// Emits
const emit = defineEmits(['close'])

// Stores
const dineroStore = useDineroStore()
const expenseStore = useExpenseStore()
const alertStore = useAlertStore()

// Reactive data
const loading = ref(false)
const editingDinero = ref(null)
const form = ref({
    name: '',
    description: '',
    color: '#3DA9FC'
})

// Available colors
const availableColors = [
    { name: 'Azul Tiquet', value: '#3A7CA5' },
    { name: 'Lima Compartida', value: '#A8E000' },
    { name: 'Azul Claro Viaje', value: '#A9D6E5' },
    { name: 'Gris Billetera', value: '#3C3C3C' },
    { name: 'Marfil Mapamundi', value: '#F6F5F2' },
    { name: 'Verde', value: '#10B981' },
    { name: 'Morado', value: '#8B5CF6' },
    { name: 'Naranja', value: '#F59E0B' },
    { name: 'Rojo', value: '#EF4444' },
    { name: 'Índigo', value: '#6366F1' }
]

// Computed
const dineros = computed(() => dineroStore.getAllDineros)

// Methods
const getExpenseCount = (dineroId) => {
    return expenseStore.getExpensesByDinero(dineroId).length
}

const editDinero = (dinero) => {
    editingDinero.value = dinero
    form.value = {
        name: dinero.name,
        description: dinero.description || '',
        color: dinero.color
    }
}

const cancelEdit = () => {
    editingDinero.value = null
    form.value = {
        name: '',
        description: '',
        color: '#3A7CA5'
    }
}

const saveDinero = async () => {
    loading.value = true
    try {
        if (editingDinero.value) {
            await dineroStore.updateDinero(editingDinero.value.id, form.value)
            alertStore.success('Dinero actualizado correctamente')
        } else {
            await dineroStore.addDinero(form.value)
            alertStore.success('Dinero creado correctamente')
        }
        
        cancelEdit()
    } catch (error) {
        alertStore.error('Error al guardar el dinero')
    } finally {
        loading.value = false
    }
}

const deleteDinero = async (dineroId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este dinero? Los gastos asociados se moverán al dinero por defecto.')) {
        return
    }
    
    try {
        // Mover gastos al dinero por defecto antes de eliminar
        const expenses = expenseStore.getExpensesByDinero(dineroId)
        const defaultDinero = dineroStore.getDefaultDinero
        
        if (defaultDinero && expenses.length > 0) {
            for (const expense of expenses) {
                await expenseStore.updateExpense(expense.id, {
                    ...expense,
                    dineroId: defaultDinero.id
                })
            }
        }
        
        await dineroStore.deleteDinero(dineroId)
        alertStore.success('Dinero eliminado correctamente')
    } catch (error) {
        alertStore.error('Error al eliminar el dinero')
    }
}

// Initialize
onMounted(async () => {
    if (dineroStore.dineros.length === 0) {
        await dineroStore.initializeDineros()
    }
})

console.log('DineroModal')
</script>
