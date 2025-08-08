<template>
    <div class="relative">
        <!-- Selector de dinero con diseño mejorado -->
        <div class="flex items-center gap-3">
            <!-- Etiqueta con icono -->
            <div class="hidden sm:flex items-center gap-2 text-sm text-gray-600 font-medium">
                <div class="w-4 h-4 bg-azul-tiquet rounded-full flex items-center justify-center">
                    <span class="text-blanco-dividido text-xs font-bold">€</span>
                </div>
                <span>Dinero:</span>
            </div>
            
            <!-- Selector personalizado -->
            <div class="relative group">
                <select 
                    v-model="selectedDineroId"
                    @change="onDineroChange"
                    @mouseenter="onHover(true)"
                    @mouseleave="onHover(false)"
                    class="dinero-selector appearance-none bg-blanco-dividido border-2 border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-medium text-gris-billetera focus:outline-none focus:ring-2 focus:ring-azul-tiquet focus:border-azul-tiquet transition-all duration-200 hover:border-azul-claro-viaje min-w-[160px] sm:min-w-[200px] shadow-sm"
                    :class="{ 
                        'opacity-50 cursor-not-allowed': isLoading,
                        'border-lima-compartida/30 bg-lima-compartida/5': selectedDinero && !isLoading
                    }"
                    :disabled="isLoading"
                    :style="selectedDinero ? { borderLeftColor: selectedDinero.color, borderLeftWidth: '4px' } : {}"
                >
                    <option v-for="dinero in dineros" :key="dinero.id" :value="String(dinero.id)">
                        {{ dinero.name }}{{ dinero.isDefault ? ' 🏠' : '' }}
                    </option>
                </select>
                
                <!-- Icono de dropdown personalizado -->
                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </div>
                
                <!-- Indicador de color del dinero seleccionado -->
                <div 
                    v-if="selectedDinero && !isLoading" 
                    class="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-blanco-dividido shadow-sm"
                    :style="{ backgroundColor: selectedDinero.color }"
                ></div>
            </div>
        </div>

        <!-- Información adicional del dinero seleccionado -->
        <div 
            v-if="selectedDinero && selectedDinero.description" 
            class="tooltip absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-gray-800 text-blanco-dividido text-xs rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 whitespace-nowrap z-20 shadow-lg"
        >
            {{ selectedDinero.description }}
            <!-- Flecha del tooltip -->
            <div class="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useContextStore } from '~/stores/context.store'
import { useDineroStore } from '~/stores/dinero.store'
import { useAlertStore } from '~/stores/alert.store'

// Stores
const contextStore = useContextStore()
const dineroStore = useDineroStore()
const alertStore = useAlertStore()

// Reactive data
const selectedDineroId = ref(null)
const isHovered = ref(false)

// Computed properties
const dineros = computed(() => dineroStore.getAllDineros)
const selectedDinero = computed(() => {
    console.log('Computing selectedDinero for ID:', selectedDineroId.value)
    const dinero = selectedDineroId.value ? dineroStore.getDineroById(selectedDineroId.value) : null
    console.log('Computed selectedDinero:', dinero)
    return dinero
})
const isLoading = computed(() => dineroStore.isLoading || contextStore.isLoading)

// Methods
const onDineroChange = () => {
    console.log('onDineroChange triggered')
    console.log('selectedDineroId.value:', selectedDineroId.value)
    console.log('typeof selectedDineroId.value:', typeof selectedDineroId.value)
    
    if (!selectedDineroId.value) {
        console.warn('No dinero ID selected')
        return
    }
    
    // Convertir a número si es string
    const dineroId = typeof selectedDineroId.value === 'string' ? parseInt(selectedDineroId.value) : selectedDineroId.value
    console.log('Converted dinero ID:', dineroId, typeof dineroId)
    
    // Actualizar el store de contexto
    contextStore.setSelectedDinero(dineroId)
    console.log('Context store updated')
    
    // Mostrar notificación mejorada
    const dinero = dineroStore.getDineroById(dineroId)
    console.log('Found dinero:', dinero)
    
    if (dinero) {
        alertStore.showAlert('success', `Cambiado a: ${dinero.name}`)
    } else {
        console.error('Dinero not found for ID:', dineroId)
        console.log('Available dineros:', dineros.value)
    }
}

const onHover = (state) => {
    isHovered.value = state
}

// Watchers
watch(() => contextStore.getSelectedDineroId, (newDineroId, oldDineroId) => {
    console.log('Context store dinero changed:', { oldDineroId, newDineroId })
    // Convertir a string para que coincida con las opciones del select
    selectedDineroId.value = newDineroId ? String(newDineroId) : null
}, { immediate: true })

// También watch del selectedDineroId local
watch(selectedDineroId, (newValue, oldValue) => {
    console.log('Local selectedDineroId changed:', { oldValue, newValue })
}, { immediate: true })

// Initialize
onMounted(async () => {
    console.log('DineroSelector mounted, initializing...')
    
    try {
        // Cargar dineros si no están cargados
        if (dineros.value.length === 0) {
            console.log('Loading dineros...')
            await dineroStore.initializeDineros()
            console.log('Dineros loaded:', dineros.value.length)
        }
        
        // Inicializar dinero seleccionado
        console.log('Initializing selected dinero...')
        await contextStore.initializeSelectedDinero()
        
        // Sincronizar el valor local
        const contextDineroId = contextStore.getSelectedDineroId
        console.log('Context selected dinero ID:', contextDineroId)
        selectedDineroId.value = contextDineroId ? String(contextDineroId) : null
        
        // Verificar que el dinero existe
        if (contextDineroId) {
            const selectedDinero = dineroStore.getDineroById(contextDineroId)
            console.log('Selected dinero found:', selectedDinero)
        }
        
        console.log('DineroSelector initialization complete')
    } catch (error) {
        console.error('Error al inicializar selector de dinero:', error)
    }
})

console.log('DineroSelector')
</script>

<style scoped>
/* Animación suave para el selector */
.dinero-selector {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dinero-selector:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(58, 124, 165, 0.15);
}

/* Efecto de focus mejorado */
.dinero-selector:focus {
    box-shadow: 0 0 0 3px rgba(168, 224, 0, 0.3);
}

/* Tooltip mejorado */
.tooltip {
    animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(-5px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>
