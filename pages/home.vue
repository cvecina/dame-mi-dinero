<template>
    <div class="min-h-screen bg-marfil-mapamundi p-3 sm:p-4 lg:p-6">
        <!-- Loading state -->
        <div v-if="isLoading" class="flex items-center justify-center py-20">
            <div class="text-center">
                <div class="w-12 h-12 border-4 border-azul-tiquet border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p class="text-gris-billetera">Cargando datos...</p>
            </div>
        </div>

        <!-- Mensaje cuando no hay usuario seleccionado -->
        <div v-else-if="!currentUser" class="flex items-center justify-center py-20">
            <div class="text-center bg-blanco-dividido rounded-2xl p-8 shadow-lg">
                <h2 class="text-xl font-semibold text-gris-billetera mb-2">¡Hola!</h2>
                <p class="text-gray-600">Selecciona tu usuario para ver tu dashboard</p>
            </div>
        </div>

        <!-- Pantalla de inicio simple -->
        <div v-else class="max-w-4xl mx-auto">
            <!-- Header de bienvenida -->
            <div class="text-center mb-8">
                <h1 class="text-3xl sm:text-4xl font-bold text-gris-billetera mb-2">
                    ¡Hola, <span class="text-azul-tiquet">{{ currentUser.name }}</span>!
                </h1>
                <p class="text-gray-600 text-lg">
                    Aquí tienes un resumen rápido de tus gastos compartidos
                </p>
            </div>

            <!-- Acciones rápidas -->
            <div class="bg-gradient-to-br from-azul-tiquet/5 via-lima-compartida/5 to-azul-claro-viaje/5 rounded-2xl p-6 mb-8 border border-azul-claro-viaje/20">
                <h2 class="text-lg font-semibold text-gris-billetera mb-4 flex items-center gap-2">
                    <span class="text-xl">⚡</span>
                    Acciones rápidas
                </h2>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button 
                        @click="showSplitExpenseModal = true"
                        class="group p-4 bg-lima-compartida hover:bg-lima-compartida/80 rounded-xl text-gris-billetera font-semibold transition-all duration-200 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
                    >
                        <div class="text-2xl mb-2">💸</div>
                        <div>Añadir Gasto</div>
                        <div class="text-xs opacity-80 mt-1">Registra un nuevo gasto</div>
                    </button>
                    <button 
                        @click="showBudgetModal = true"
                        class="group p-4 bg-azul-claro-viaje hover:bg-azul-claro-viaje/80 rounded-xl text-gris-billetera font-semibold transition-all duration-200 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
                    >
                        <div class="text-2xl mb-2">💼</div>
                        <div>Presupuestos</div>
                        <div class="text-xs opacity-80 mt-1">Gestiona tus límites</div>
                    </button>
                    <NuxtLink 
                        to="/balances"
                        class="group p-4 bg-azul-tiquet hover:bg-azul-tiquet/80 rounded-xl text-blanco-dividido font-semibold transition-all duration-200 transform hover:-translate-y-1 shadow-lg hover:shadow-xl block text-center"
                    >
                        <div class="text-2xl mb-2">👥</div>
                        <div>Ver Balances</div>
                        <div class="text-xs opacity-80 mt-1">Deudas y pagos</div>
                    </NuxtLink>
                </div>
            </div>

            <!-- Resumen rápido -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <div class="bg-blanco-dividido rounded-xl p-6 shadow-lg border border-azul-claro-viaje/20">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="font-semibold text-gris-billetera">Total Gastado</h3>
                        <span class="text-2xl">💰</span>
                    </div>
                    <div class="text-2xl font-bold text-azul-tiquet mb-2">
                        {{ formatMoney(totalExpenses) }}
                    </div>
                    <div class="text-sm text-gray-600">Este mes</div>
                </div>
                
                <div class="bg-blanco-dividido rounded-xl p-6 shadow-lg border border-azul-claro-viaje/20">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="font-semibold text-gris-billetera">Tu Balance</h3>
                        <span class="text-2xl">{{ userBalance >= 0 ? '✅' : '⚠️' }}</span>
                    </div>
                    <div :class="[
                        'text-2xl font-bold mb-2',
                        userBalance >= 0 ? 'text-green-600' : 'text-red-500'
                    ]">
                        {{ formatMoney(userBalance) }}
                    </div>
                    <div class="text-sm text-gray-600">
                        {{ userBalance >= 0 ? 'Te deben dinero' : 'Debes dinero' }}
                    </div>
                </div>
                
                <div class="bg-blanco-dividido rounded-xl p-6 shadow-lg border border-azul-claro-viaje/20">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="font-semibold text-gris-billetera">Gastos</h3>
                        <span class="text-2xl">📊</span>
                    </div>
                    <div class="text-2xl font-bold text-azul-tiquet mb-2">
                        {{ expenses.length }}
                    </div>
                    <div class="text-sm text-gray-600">Este mes</div>
                </div>
            </div>

            <!-- Gastos recientes simplificados -->
            <div class="bg-blanco-dividido rounded-xl p-6 shadow-lg border border-azul-claro-viaje/20 mb-8">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gris-billetera flex items-center gap-2">
                        <span class="text-xl">💸</span>
                        Últimos gastos
                    </h3>
                    <NuxtLink 
                        to="/expenses"
                        class="text-azul-tiquet hover:text-azul-claro-viaje text-sm font-medium transition-colors"
                    >
                        Ver todos
                    </NuxtLink>
                </div>
                
                <div v-if="expenses.length === 0" class="text-center py-8">
                    <div class="text-4xl mb-2">📝</div>
                    <p class="text-gray-600">No hay gastos registrados</p>
                </div>
                
                <div v-else class="space-y-3">
                    <div 
                        v-for="expense in expenses.slice(0, 3)" 
                        :key="expense.id"
                        class="flex items-center justify-between p-3 bg-gradient-to-r from-marfil-mapamundi to-blanco-dividido rounded-lg border border-azul-claro-viaje/20"
                    >
                        <div class="flex items-center gap-3">
                            <span class="text-lg">{{ getCategoryIcon(expense.category) }}</span>
                            <div>
                                <p class="font-medium text-gris-billetera">{{ expense.title }}</p>
                                <p class="text-sm text-gray-600">{{ formatDate(expense.date) }}</p>
                            </div>
                        </div>
                        <div class="text-right">
                            <p class="font-bold text-azul-tiquet">{{ formatMoney(expense.amount) }}</p>
                            <p class="text-xs text-gray-600">{{ getUserName(expense.paidBy) }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Balance personal simplificado -->
            <div v-if="balances[currentUser?.id]" class="bg-blanco-dividido rounded-xl p-6 shadow-lg border border-azul-claro-viaje/20 mb-8">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gris-billetera flex items-center gap-2">
                        <span class="text-xl">👥</span>
                        Tu situación
                    </h3>
                    <NuxtLink 
                        to="/balances"
                        class="text-azul-tiquet hover:text-azul-claro-viaje text-sm font-medium transition-colors"
                    >
                        Ver detalles
                    </NuxtLink>
                </div>
                
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div v-if="peopleWhoOweMe.length > 0" class="p-4 bg-green-50 rounded-lg border border-green-200">
                        <p class="text-sm font-medium text-green-800 mb-2">Te deben</p>
                        <p class="text-xl font-bold text-green-600">
                            {{ formatMoney(peopleWhoOweMe.reduce((sum, debt) => sum + debt.amount, 0)) }}
                        </p>
                        <p class="text-xs text-green-700">{{ peopleWhoOweMe.length }} persona{{ peopleWhoOweMe.length > 1 ? 's' : '' }}</p>
                    </div>
                    
                    <div v-if="peopleIOwe.length > 0" class="p-4 bg-red-50 rounded-lg border border-red-200">
                        <p class="text-sm font-medium text-red-800 mb-2">Debes</p>
                        <p class="text-xl font-bold text-red-600">
                            {{ formatMoney(peopleIOwe.reduce((sum, debt) => sum + debt.amount, 0)) }}
                        </p>
                        <p class="text-xs text-red-700">{{ peopleIOwe.length }} persona{{ peopleIOwe.length > 1 ? 's' : '' }}</p>
                    </div>
                    
                    <div v-if="peopleWhoOweMe.length === 0 && peopleIOwe.length === 0" class="col-span-2 text-center py-6">
                        <div class="text-4xl mb-2">✅</div>
                        <p class="text-gris-billetera font-medium">¡Estás al día!</p>
                        <p class="text-sm text-gray-600">No tienes deudas pendientes</p>
                    </div>
                </div>
            </div>

            <!-- Botón para ver dashboard completo -->
            <div class="text-center">
                <NuxtLink 
                    to="/dashboard"
                    class="inline-flex items-center gap-2 px-6 py-3 bg-azul-tiquet text-blanco-dividido rounded-xl font-semibold hover:bg-azul-claro-viaje transition-all duration-200 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
                >
                    <span class="text-lg">🚀</span>
                    <span>Ver Dashboard Completo</span>
                </NuxtLink>
            </div>

            <!-- Modal para gasto -->
            <SplitExpenseModal 
                v-if="showSplitExpenseModal"
                :selected-dinero="selectedDinero"
                :users="selectedDinero?.users ? users.filter((u) => selectedDinero.users.includes(u.id)) : users"
                @close="showSplitExpenseModal = false"
                @expense-created="onExpenseAdded"
            />

            <!-- Modal de presupuestos -->
            <BudgetModal 
                v-if="showBudgetModal"
                @close="showBudgetModal = false"
            />
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useExpenseStore } from '~/stores/expense.store'
import { useUserStore } from '~/stores/user.store'
import { useAlertStore } from '~/stores/alert.store'
import { useContextStore } from '~/stores/context.store'
import { useDineroStore } from '~/stores/dinero.store'
import { useBudgetStore } from '~/stores/budget.store'
import formatearTotal from '~/utils/formatMoney'
import { useLogger } from '~/composables/useLogger'

const { debug, log, error } = useLogger()

// Stores
const expenseStore = useExpenseStore()
const userStore = useUserStore()
const alertStore = useAlertStore()
const contextStore = useContextStore()
const dineroStore = useDineroStore()
const budgetStore = useBudgetStore()

// Reactive data
const showSplitExpenseModal = ref(false)
const showBudgetModal = ref(false)

// Computed properties
const currentUser = computed(() => userStore.getCurrentUser)
const users = computed(() => userStore.getAllUsers)
const selectedDinero = computed(() => {
    const selectedDineroId = contextStore.getSelectedDineroId
    return selectedDineroId ? dineroStore.getDineroById(selectedDineroId) : null
})
const isLoading = computed(() => expenseStore.isLoading || userStore.isLoading || contextStore.isLoading || dineroStore.isLoading)

// Computed para gastos del mes actual
const expenses = computed(() => {
    const selectedDineroId = contextStore.getSelectedDineroId
    if (!selectedDineroId) return []
    
    const allExpenses = expenseStore.getExpensesByDinero(selectedDineroId) || []
    const now = new Date()
    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    
    return allExpenses
        .filter(expense => new Date(expense.date) >= monthAgo)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
})

const totalExpenses = computed(() => {
    const selectedDineroId = contextStore.getSelectedDineroId
    if (!selectedDineroId) return 0
    
    return expenseStore.getTotalExpensesByDinero(selectedDineroId)
})

const balances = computed(() => {
    const selectedDineroId = contextStore.getSelectedDineroId
    if (!selectedDineroId) return {}
    
    return expenseStore.getBalancesByDinero(selectedDineroId)
})

const userBalance = computed(() => {
    if (!currentUser.value) return 0
    const userBalances = balances.value[currentUser.value.id]
    return userBalances ? userBalances.balance : 0
})

// Computed para deudas específicas
const peopleWhoOweMe = computed(() => {
    if (!currentUser.value) return []
    
    const selectedDineroId = contextStore.getSelectedDineroId
    if (!selectedDineroId) return []
    
    const expensesByDinero = expenseStore.getExpensesByDinero(selectedDineroId)
    const debtsByUser = {}
    
    expensesByDinero.forEach(expense => {
        if (expense.paidBy !== currentUser.value.id) return
        
        expense.splits?.forEach(split => {
            const userId = parseInt(split.userId)
            const amount = parseFloat(split.amount)
            
            if (userId !== currentUser.value.id) {
                const hasPaid = expense.payments && expense.payments[userId]
                if (!hasPaid) {
                    if (!debtsByUser[userId]) {
                        debtsByUser[userId] = {
                            userId,
                            amount: 0,
                            expenseCount: 0,
                            expenses: []
                        }
                    }
                    debtsByUser[userId].amount += amount
                    debtsByUser[userId].expenseCount += 1
                    debtsByUser[userId].expenses.push(expense)
                }
            }
        })
    })
    
    return Object.values(debtsByUser)
        .filter(debt => debt.amount > 0)
        .sort((a, b) => b.amount - a.amount)
})

const peopleIOwe = computed(() => {
    if (!currentUser.value) return []
    
    const selectedDineroId = contextStore.getSelectedDineroId
    if (!selectedDineroId) return []
    
    const expensesByDinero = expenseStore.getExpensesByDinero(selectedDineroId)
    const debtsByUser = {}
    
    expensesByDinero.forEach(expense => {
        if (expense.paidBy === currentUser.value.id) return
        
        expense.splits?.forEach(split => {
            const userId = parseInt(split.userId)
            const amount = parseFloat(split.amount)
            
            if (userId === currentUser.value.id) {
                const hasPaid = expense.payments && expense.payments[currentUser.value.id]
                if (!hasPaid) {
                    const payerId = expense.paidBy
                    if (!debtsByUser[payerId]) {
                        debtsByUser[payerId] = {
                            userId: payerId,
                            amount: 0,
                            expenseCount: 0,
                            expenses: []
                        }
                    }
                    debtsByUser[payerId].amount += amount
                    debtsByUser[payerId].expenseCount += 1
                    debtsByUser[payerId].expenses.push(expense)
                }
            }
        })
    })
    
    return Object.values(debtsByUser)
        .filter(debt => debt.amount > 0)
        .sort((a, b) => b.amount - a.amount)
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

const getCategoryIcon = (category) => {
    const icons = {
        'Comida': '🍽️',
        'Transporte': '🚗',
        'Alojamiento': '🏠',
        'Entretenimiento': '🎉',
        'Compras': '🛒',
        'Otros': '📦',
        'Sin categoría': '❓'
    }
    return icons[category] || '📦'
}

const onExpenseAdded = async () => {
    showSplitExpenseModal.value = false
    alertStore.success('Gasto añadido correctamente')
    
    // Refrescar los datos
    await expenseStore.fetchExpenses()
}

// Cargar datos al montar el componente
onMounted(async () => {
    console.log('Home: Loading data...')
    
    try {
        // 1. Cargar dineros primero
        await dineroStore.initializeDineros()
        
        // 2. Inicializar contexto con dinero seleccionado
        await contextStore.initializeSelectedDinero()
        
        // 3. Cargar usuarios
        if (userStore.users.length === 0) {
            await userStore.initializeUsers()
        }
        
        // 4. Cargar y migrar gastos
        if (expenseStore.expenses.length === 0) {
            await expenseStore.initializeExpenses()
        }
        
        // 5. Inicializar presupuestos
        await budgetStore.initializeBudgets()
        
        console.log('Home: Data loaded successfully')
    } catch (error) {
        console.error('Error al cargar datos:', error)
        alertStore.error('Error al cargar los datos')
    }
})

console.log('home page loaded')
</script>
