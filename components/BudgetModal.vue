<template>
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-blanco-dividido rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <!-- Header -->
            <div class="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 class="text-xl font-bold text-gris-billetera">📊 Gestión de Presupuestos</h2>
                <button 
                    @click="$emit('close')"
                    class="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                    ×
                </button>
            </div>

            <!-- Content -->
            <div class="p-6 space-y-6">
                <!-- Crear nuevo presupuesto -->
                <div class="bg-marfil-mapamundi rounded-lg p-4">
                    <h3 class="text-lg font-semibold text-gris-billetera mb-4">➕ Nuevo Presupuesto</h3>
                    
                    <form @submit.prevent="createBudget" class="space-y-4">
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gris-billetera mb-1">Categoría</label>
                                <select 
                                    v-model="newBudget.category"
                                    required
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azul-tiquet focus:border-transparent"
                                >
                                    <option value="">Seleccionar categoría</option>
                                    <option value="Comida">🍽️ Comida</option>
                                    <option value="Transporte">🚗 Transporte</option>
                                    <option value="Alojamiento">🏠 Alojamiento</option>
                                    <option value="Entretenimiento">🎉 Entretenimiento</option>
                                    <option value="Compras">🛒 Compras</option>
                                    <option value="Otros">📦 Otros</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gris-billetera mb-1">Monto (€)</label>
                                <input 
                                    v-model.number="newBudget.amount"
                                    type="number"
                                    step="0.01"
                                    min="1"
                                    required
                                    placeholder="100.00"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azul-tiquet focus:border-transparent"
                                />
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gris-billetera mb-1">Período</label>
                                <select 
                                    v-model="newBudget.period"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azul-tiquet focus:border-transparent"
                                >
                                    <option value="weekly">Semanal</option>
                                    <option value="monthly">Mensual</option>
                                    <option value="yearly">Anual</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gris-billetera mb-1">Alerta (%)</label>
                                <input 
                                    v-model.number="newBudget.alertThreshold"
                                    type="number"
                                    min="50"
                                    max="100"
                                    placeholder="80"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azul-tiquet focus:border-transparent"
                                />
                                <p class="text-xs text-gray-500 mt-1">Porcentaje para activar alertas</p>
                            </div>
                        </div>
                        
                        <button 
                            type="submit"
                            :disabled="!newBudget.category || !newBudget.amount"
                            class="w-full bg-lima-compartida hover:bg-azul-claro-viaje text-gris-billetera px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            ➕ Crear Presupuesto
                        </button>
                    </form>
                </div>

                <!-- Lista de presupuestos existentes -->
                <div v-if="budgetProgress.length > 0">
                    <h3 class="text-lg font-semibold text-gris-billetera mb-4">📋 Presupuestos Actuales</h3>
                    
                    <div class="space-y-3">
                        <div 
                            v-for="progress in budgetProgress" 
                            :key="progress.budget.id"
                            class="border rounded-lg p-4"
                            :class="{
                                'border-red-300 bg-red-50': progress.isOverBudget,
                                'border-yellow-300 bg-yellow-50': progress.isNearLimit && !progress.isOverBudget,
                                'border-green-300 bg-green-50': !progress.isNearLimit && !progress.isOverBudget
                            }"
                        >
                            <div class="flex items-center justify-between mb-3">
                                <div class="flex items-center gap-2">
                                    <span class="text-lg">{{ getCategoryIcon(progress.budget.category) }}</span>
                                    <div>
                                        <h4 class="font-semibold text-gris-billetera">{{ progress.budget.category }}</h4>
                                        <p class="text-sm text-gray-600">{{ getPeriodLabel(progress.budget.period) }}</p>
                                    </div>
                                </div>
                                
                                <div class="text-right">
                                    <p class="text-lg font-bold" 
                                        :class="{
                                            'text-red-600': progress.isOverBudget,
                                            'text-yellow-600': progress.isNearLimit && !progress.isOverBudget,
                                            'text-green-600': !progress.isNearLimit && !progress.isOverBudget
                                        }"
                                    >
                                        {{ formatMoney(progress.spent) }} / {{ formatMoney(progress.budget.amount) }}
                                    </p>
                                    <p class="text-sm text-gray-600">
                                        {{ Math.round(progress.percentage) }}% usado
                                    </p>
                                </div>
                            </div>
                            
                            <!-- Barra de progreso -->
                            <div class="w-full bg-gray-200 rounded-full h-3 mb-3">
                                <div 
                                    class="h-3 rounded-full transition-all duration-300"
                                    :class="{
                                        'bg-red-500': progress.isOverBudget,
                                        'bg-yellow-500': progress.isNearLimit && !progress.isOverBudget,
                                        'bg-green-500': !progress.isNearLimit && !progress.isOverBudget
                                    }"
                                    :style="{ width: `${Math.min(100, progress.percentage)}%` }"
                                ></div>
                            </div>
                            
                            <div class="flex items-center justify-between text-sm">
                                <span v-if="progress.isOverBudget" class="text-red-600 font-medium">
                                    🚨 Excedido por {{ formatMoney(progress.spent - progress.budget.amount) }}
                                </span>
                                <span v-else-if="progress.isNearLimit" class="text-yellow-600 font-medium">
                                    ⚠️ Cerca del límite - {{ formatMoney(progress.remaining) }} restantes
                                </span>
                                <span v-else class="text-green-600 font-medium">
                                    ✅ {{ formatMoney(progress.remaining) }} disponibles
                                </span>
                                
                                <button 
                                    @click="deleteBudget(progress.budget.id)"
                                    class="text-red-500 hover:text-red-700 font-medium"
                                >
                                    🗑️ Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Estado vacío -->
                <div v-else class="text-center py-8 text-gray-500">
                    <div class="text-4xl mb-2">📊</div>
                    <p class="text-base mb-2">No hay presupuestos configurados</p>
                    <p class="text-sm">Crea tu primer presupuesto para controlar tus gastos</p>
                </div>
            </div>

            <!-- Footer -->
            <div class="flex justify-end gap-3 p-6 border-t border-gray-200">
                <button 
                    @click="$emit('close')"
                    class="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                    Cerrar
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useBudgetStore } from '~/stores/budget.store'
import { useExpenseStore } from '~/stores/expense.store'
import { useContextStore } from '~/stores/context.store'
import { useAlertStore } from '~/stores/alert.store'

// Emit
const emit = defineEmits(['close'])

// Stores
const budgetStore = useBudgetStore()
const expenseStore = useExpenseStore()
const contextStore = useContextStore()
const alertStore = useAlertStore()

// Reactive data
const newBudget = ref({
    category: '',
    amount: null,
    period: 'monthly',
    alertThreshold: 80
})

// Computed
const selectedDineroId = computed(() => contextStore.getSelectedDineroId)

const expenses = computed(() => {
    return selectedDineroId.value ? 
        expenseStore.getExpensesByDinero(selectedDineroId.value) : []
})

const budgetProgress = computed(() => {
    if (!selectedDineroId.value) return []
    return budgetStore.getAllBudgetProgress(selectedDineroId.value, expenses.value)
})

// Methods
const formatMoney = (amount) => {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
    }).format(amount)
}

const getCategoryIcon = (category) => {
    const icons = {
        'Comida': '🍽️',
        'Transporte': '🚗',
        'Alojamiento': '🏠',
        'Entretenimiento': '🎉',
        'Compras': '🛒',
        'Otros': '📦'
    }
    return icons[category] || '📦'
}

const getPeriodLabel = (period) => {
    const labels = {
        'weekly': 'Esta semana',
        'monthly': 'Este mes',
        'yearly': 'Este año'
    }
    return labels[period] || period
}

const createBudget = async () => {
    try {
        await budgetStore.createBudget({
            ...newBudget.value,
            dineroId: selectedDineroId.value
        })
        
        // Resetear formulario
        newBudget.value = {
            category: '',
            amount: null,
            period: 'monthly',
            alertThreshold: 80
        }
        
        alertStore.success('Presupuesto creado correctamente')
        console.log('createBudget')
    } catch (error) {
        alertStore.error('Error al crear el presupuesto')
        console.error('Error creating budget:', error)
    }
}

const deleteBudget = async (budgetId) => {
    if (confirm('¿Estás seguro de que quieres eliminar este presupuesto?')) {
        try {
            await budgetStore.deleteBudget(budgetId)
            alertStore.success('Presupuesto eliminado')
            console.log('deleteBudget', budgetId)
        } catch (error) {
            alertStore.error('Error al eliminar el presupuesto')
        }
    }
}

// Lifecycle
onMounted(async () => {
    await budgetStore.initializeBudgets()
})

console.log('BudgetModal')
</script>
