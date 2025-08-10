<template>
    <div class="min-h-screen bg-marfil-mapamundi p-3 sm:p-4 lg:p-6">
        <!-- Loading state -->
        <div v-if="isLoading" class="flex items-center justify-center py-20">
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
                                Gestiona los contenedores de gastos compartidos
                            </p>
                        </div>
                        <div class="flex items-center gap-3">
                            <div class="bg-blanco-dividido/20 backdrop-blur-sm rounded-lg px-4 py-2">
                                <p class="text-xs opacity-80">Total contenedores</p>
                                <p class="text-xl font-bold">{{ dineros.length }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Panel de control -->
            <div class="bg-blanco-dividido rounded-2xl shadow-lg p-6 mb-8 border border-azul-claro-viaje/20">
                <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <!-- Filtros -->
                    <div class="flex flex-col sm:flex-row gap-4">
                        <div class="relative">
                            <label class="text-sm font-semibold text-gris-billetera mb-2 flex items-center gap-2">
                                <span class="text-azul-tiquet">💰</span>
                                Filtrar dineros
                            </label>
                            <select 
                                v-model="selectedDineroId"
                                class="px-4 py-3 text-sm border-2 border-azul-claro-viaje/30 rounded-xl focus:ring-2 focus:ring-azul-tiquet focus:border-azul-tiquet bg-blanco-dividido transition-all duration-200 hover:border-azul-claro-viaje min-w-[200px]"
                            >
                                <option value="">Todos los dineros</option>
                                <option v-for="dinero in dineros" :key="dinero.id" :value="dinero.id">
                                    {{ dinero.name }}
                                </option>
                            </select>
                        </div>
                        
                        <div class="flex items-end">
                            <div class="bg-azul-claro-viaje/10 px-4 py-3 rounded-xl border border-azul-claro-viaje/30">
                                <p class="text-xs text-gris-billetera font-medium">Dinero activo</p>
                                <p class="text-sm font-bold text-azul-tiquet">{{ selectedDinero?.name || 'Todos' }}</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Botones de acción -->
                    <div class="flex flex-wrap gap-3">
                        <button 
                            @click="showDineroModal = true"
                            class="px-4 py-3 bg-gradient-to-r from-lima-compartida to-lima-compartida/80 text-gris-billetera text-sm font-semibold rounded-xl hover:from-lima-compartida/90 hover:to-lima-compartida/70 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        >
                            <span class="text-sm">+</span>
                            Crear nuevo dinero
                        </button>
                    </div>
                </div>
            </div>

            <!-- Resumen de estadísticas -->
            <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                <!-- Total Dineros -->
                <div class="bg-gradient-to-br from-blanco-dividido to-azul-claro-viaje/10 rounded-2xl shadow-lg p-6 border border-azul-tiquet/10 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-12 h-12 bg-azul-tiquet/10 rounded-xl flex items-center justify-center">
                            <span class="text-2xl">💰</span>
                        </div>
                        <div class="text-right">
                            <p class="text-xs font-medium text-gray-600 uppercase tracking-wide">Total dineros</p>
                            <p class="text-2xl font-bold text-azul-tiquet">{{ dineros.length }}</p>
                        </div>
                    </div>
                    <div class="h-1 bg-gradient-to-r from-azul-tiquet to-azul-claro-viaje rounded-full"></div>
                </div>
                
                <!-- Total Gastos -->
                <div class="bg-gradient-to-br from-blanco-dividido to-lima-compartida/10 rounded-2xl shadow-lg p-6 border border-lima-compartida/10 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-12 h-12 bg-lima-compartida/10 rounded-xl flex items-center justify-center">
                            <span class="text-2xl">📊</span>
                        </div>
                        <div class="text-right">
                            <p class="text-xs font-medium text-gray-600 uppercase tracking-wide">Total gastos</p>
                            <p class="text-2xl font-bold text-lima-compartida">{{ totalExpenses }}</p>
                        </div>
                    </div>
                    <div class="h-1 bg-gradient-to-r from-lima-compartida to-green-400 rounded-full"></div>
                </div>
                
                <!-- Gasto promedio -->
                <div class="bg-gradient-to-br from-blanco-dividido to-azul-claro-viaje/10 rounded-2xl shadow-lg p-6 border border-azul-claro-viaje/10 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-12 h-12 bg-azul-claro-viaje/10 rounded-xl flex items-center justify-center">
                            <span class="text-2xl">📈</span>
                        </div>
                        <div class="text-right">
                            <p class="text-xs font-medium text-gray-600 uppercase tracking-wide">Gasto promedio</p>
                            <p class="text-2xl font-bold text-azul-claro-viaje">{{ formatMoney(totalExpenses > 0 ? getTotalAmount() / totalExpenses : 0) }}</p>
                        </div>
                    </div>
                    <div class="h-1 bg-gradient-to-r from-azul-claro-viaje to-blue-400 rounded-full"></div>
                </div>
                
                <!-- Dinero con más gastos -->
                <div class="bg-gradient-to-br from-blanco-dividido to-marfil-mapamundi rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                            <span class="text-2xl">🏆</span>
                        </div>
                        <div class="text-right">
                            <p class="text-xs font-medium text-gray-600 uppercase tracking-wide">Más usado</p>
                            <p class="text-lg font-bold text-gris-billetera truncate">{{ getMostUsedDinero() }}</p>
                        </div>
                    </div>
                    <div class="h-1 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full"></div>
                </div>
            </div>

            <!-- Lista de dineros con gastos -->
            <div class="space-y-6">
                <div 
                    v-for="dinero in filteredDineros" 
                    :key="dinero.id"
                    class="bg-blanco-dividido rounded-lg shadow-md overflow-hidden"
                >
                    <!-- Header del dinero -->
                    <div class="p-6 border-b border-gray-200" :style="{ borderTopColor: dinero.color, borderTopWidth: '4px' }">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-4">
                                <div 
                                    class="w-12 h-12 rounded-full flex items-center justify-center text-blanco-dividido font-bold text-lg"
                                    :style="{ backgroundColor: dinero.color }"
                                >
                                    {{ dinero.name.charAt(0).toUpperCase() }}
                                </div>
                                <div>
                                    <h3 class="text-xl font-semibold text-gris-billetera">{{ dinero.name }}</h3>
                                    <p v-if="dinero.description" class="text-sm text-gray-600">{{ dinero.description }}</p>
                                    <div class="flex items-center gap-4 mt-1">
                                        <span class="text-sm text-gray-500">{{ getDineroExpenseCount(dinero.id) }} gastos</span>
                                        <span class="text-sm font-medium text-azul-tiquet">{{ formatMoney(getDineroTotal(dinero.id)) }}</span>
                                        <span v-if="dinero.isDefault" class="text-xs px-2 py-1 bg-azul-tiquet/10 text-azul-tiquet rounded-full">
                                            Por defecto
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="flex items-center gap-2">
                                <button 
                                    @click="editDinero(dinero)"
                                    class="text-azul-tiquet hover:text-azul-claro-viaje transition-colors p-2"
                                    title="Editar dinero"
                                >
                                    ✏️
                                </button>
                                <button 
                                    v-if="!dinero.isDefault"
                                    @click="deleteDinero(dinero.id)"
                                    class="text-red-500 hover:text-red-600 transition-colors p-2"
                                    title="Eliminar dinero"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Gastos del dinero -->
                    <div class="p-6">
                        <div v-if="getDineroExpenses(dinero.id).length === 0" class="text-center py-8 text-gray-500">
                            <div class="text-4xl mb-2">📝</div>
                            <p class="text-sm">No hay gastos en este dinero</p>
                        </div>
                        
                        <div v-else class="space-y-3">
                            <div 
                                v-for="expense in getDineroExpenses(dinero.id).slice(0, 5)" 
                                :key="expense.id"
                                class="flex items-center justify-between p-3 bg-marfil-mapamundi rounded-lg hover:bg-azul-claro-viaje/20 transition-colors duration-200"
                            >
                                <div class="flex-1">
                                    <h4 class="font-medium text-gris-billetera text-sm">{{ expense.title }}</h4>
                                    <p class="text-xs text-gray-600">
                                        Pagado por {{ getUserName(expense.paidBy) }} • {{ formatDate(expense.date) }}
                                    </p>
                                </div>
                                <div class="text-right">
                                    <p class="text-base font-semibold text-azul-tiquet">{{ formatMoney(expense.amount) }}</p>
                                    <p class="text-xs text-gray-600">{{ expense.participants?.length || 0 }} participantes</p>
                                </div>
                            </div>
                            
                            <!-- Ver más gastos -->
                            <div v-if="getDineroExpenses(dinero.id).length > 5" class="text-center pt-2">
                                <NuxtLink 
                                    :to="`/expenses?dinero=${dinero.id}`"
                                    class="text-azul-tiquet hover:text-azul-claro-viaje font-medium transition-colors text-sm"
                                >
                                    Ver todos los gastos ({{ getDineroExpenses(dinero.id).length }})
                                </NuxtLink>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal para gestionar dineros -->
            <DineroModal 
                v-if="showDineroModal"
                @close="showDineroModal = false"
            />
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useDineroStore } from '~/stores/dinero.store'
import { useExpenseStore } from '~/stores/expense.store'
import { useUserStore } from '~/stores/user.store'
import { useAlertStore } from '~/stores/alert.store'

// Stores
const dineroStore = useDineroStore()
const expenseStore = useExpenseStore()
const userStore = useUserStore()
const alertStore = useAlertStore()

// Reactive data
const showDineroModal = ref(false)
const selectedDineroId = ref('')

// Computed properties
const dineros = computed(() => dineroStore.getAllDineros)
const isLoading = computed(() => dineroStore.isLoading || expenseStore.isLoading)
const totalExpenses = computed(() => expenseStore.getAllExpenses.length)
const selectedDinero = computed(() => 
    selectedDineroId.value ? dineroStore.getDineroById(parseInt(selectedDineroId.value)) : null
)

const filteredDineros = computed(() => {
    if (selectedDineroId.value) {
        const dinero = dineroStore.getDineroById(parseInt(selectedDineroId.value))
        return dinero ? [dinero] : []
    }
    return dineros.value
})

// Methods
const getUserName = (userId) => {
    const user = userStore.getUserById(userId)
    return user ? user.name : 'Usuario desconocido'
}

const formatMoney = (amount) => {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
    }).format(amount)
}

const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    })
}

const getDineroExpenses = (dineroId) => {
    return expenseStore.getExpensesByDinero(dineroId)
}

const getDineroExpenseCount = (dineroId) => {
    return expenseStore.getExpensesByDinero(dineroId).length
}

const getDineroTotal = (dineroId) => {
    return expenseStore.getTotalExpensesByDinero(dineroId)
}

const getTotalAmount = () => {
    return expenseStore.getAllExpenses.reduce((total, expense) => total + expense.amount, 0)
}

const getMostUsedDinero = () => {
    if (dineros.value.length === 0) return 'Ninguno'
    
    const dineroUsage = dineros.value.map(dinero => ({
        name: dinero.name,
        count: getDineroExpenseCount(dinero.id)
    })).sort((a, b) => b.count - a.count)
    
    return dineroUsage[0]?.count > 0 ? dineroUsage[0].name : 'Ninguno'
}

const editDinero = (dinero) => {
    showDineroModal.value = true
    // El modal manejará la edición internamente
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
    try {
        // Inicializar usuarios si no están cargados
        if (userStore.users.length === 0) {
            await userStore.initializeUsers()
        }
        
        // Inicializar dineros
        if (dineroStore.dineros.length === 0) {
            await dineroStore.initializeDineros()
        }
        
        // Inicializar gastos
        if (expenseStore.expenses.length === 0) {
            await expenseStore.initializeExpenses()
        }
    } catch (error) {
        console.error('Error al cargar datos:', error)
        alertStore.error('Error al cargar los datos')
    }
})

console.log('dineros-page')
</script>
