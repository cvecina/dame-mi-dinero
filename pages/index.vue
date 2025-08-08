<template>
    <div class="min-h-screen bg-marfil-mapamundi p-3 sm:p-4 lg:p-6">
        <!-- Loading state -->
        <div v-if="isLoading" class="flex items-center justify-center py-20">
            <div class="text-center">
                <div class="w-16 h-16 border-4 border-azul-tiquet border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p class="text-gris-billetera font-medium">Cargando datos...</p>
            </div>
        </div>

        <!-- Mensaje cuando no hay usuario seleccionado -->
        <div v-else-if="!currentUser" class="flex items-center justify-center py-20">
            <div class="text-center">
                <div class="text-6xl mb-4">👋</div>
                <h2 class="text-xl font-semibold text-gris-billetera mb-2">¡Hola!</h2>
                <p class="text-gray-600">Selecciona tu usuario para ver tu dashboard</p>
            </div>
        </div>

        <!-- Main content -->
        <div v-else>
            <!-- Header -->
            <div class="mb-6 sm:mb-8">
                <h1 class="text-2xl sm:text-3xl font-bold text-gris-billetera mb-2">
                    Dame mi dinero{{ selectedDinero ? ` - ${selectedDinero.name}` : '' }}
                </h1>
                <p class="text-sm sm:text-base text-gray-600">
                    {{ selectedDinero ? 
                        `Dashboard del dinero: ${selectedDinero.name}` : 
                        'Controla tus gastos compartidos con amigos' 
                    }}
                </p>
            </div>

            <!-- Resumen de balances -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div class="bg-blanco-dividido rounded-lg shadow-md p-4 sm:p-6 border-l-4 border-azul-tiquet">
                    <h3 class="text-base sm:text-lg font-semibold text-gris-billetera mb-2">Total gastado</h3>
                    <p class="text-xl sm:text-2xl font-bold text-azul-tiquet">{{ formatMoney(totalExpenses) }}</p>
                </div>
                
                <div class="bg-blanco-dividido rounded-lg shadow-md p-4 sm:p-6 border-l-4 border-lima-compartida">
                    <h3 class="text-base sm:text-lg font-semibold text-gris-billetera mb-2">Tu balance</h3>
                    <p class="text-xl sm:text-2xl font-bold" :class="userBalance >= 0 ? 'text-azul-tiquet' : 'text-red-500'">
                        {{ formatMoney(userBalance) }}
                    </p>
                </div>
                
                <div class="bg-blanco-dividido rounded-lg shadow-md p-4 sm:p-6 border-l-4 border-azul-claro-viaje sm:col-span-2 lg:col-span-1">
                    <h3 class="text-base sm:text-lg font-semibold text-gris-billetera mb-2">Gastos este mes</h3>
                    <p class="text-xl sm:text-2xl font-bold text-azul-claro-viaje">{{ expenses.length }}</p>
                </div>
            </div>

            <!-- Botón para añadir gasto -->
            <div class="mb-4 sm:mb-6">
                <button 
                    @click="showAddExpenseModal = true"
                    :disabled="expenseStore.isLoading || !currentUser"
                    class="w-full sm:w-auto bg-lima-compartida hover:bg-azul-claro-viaje text-gris-billetera px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center sm:justify-start gap-2 disabled:opacity-50"
                >
                    <span class="text-xl">+</span>
                    Añadir gasto
                </button>
            </div>

            <!-- Lista de gastos recientes -->
            <div class="bg-blanco-dividido rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
                <h2 class="text-lg sm:text-xl font-semibold text-gris-billetera mb-4">Gastos recientes</h2>
                
                <div v-if="expenses.length === 0" class="text-center py-8 text-gray-500">
                    <div class="text-4xl mb-2">💸</div>
                    <p class="text-sm sm:text-base mb-2">
                        {{ selectedDinero ? 
                            `No hay gastos en "${selectedDinero.name}"` : 
                            'No hay gastos registrados' 
                        }}
                    </p>
                    <button 
                        @click="showAddExpenseModal = true"
                        class="mt-3 text-azul-tiquet hover:text-azul-claro-viaje font-medium text-sm sm:text-base"
                    >
                        {{ selectedDinero ? 'Añadir el primer gasto' : 'Crear tu primer gasto' }}
                    </button>
                </div>
                
                <div v-else class="space-y-3 sm:space-y-4">
                    <div 
                        v-for="expense in expenses.slice(0, 5)" 
                        :key="expense.id"
                        class="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-marfil-mapamundi rounded-lg hover:bg-azul-claro-viaje/20 transition-colors duration-200 gap-3 sm:gap-0"
                    >
                        <div class="flex-1">
                            <h3 class="font-medium text-gris-billetera text-sm sm:text-base">{{ expense.title }}</h3>
                            <p class="text-xs sm:text-sm text-gray-600">
                                Pagado por {{ getUserName(expense.paidBy) }} • {{ formatDate(expense.date) }}
                            </p>
                            <p class="text-xs text-gray-500">{{ expense.category }}</p>
                        </div>
                        <div class="text-left sm:text-right">
                            <p class="text-base sm:text-lg font-semibold text-azul-tiquet">{{ formatMoney(expense.amount) }}</p>
                            <p class="text-xs sm:text-sm text-gray-600">{{ expense.participants?.length || 0 }} participantes</p>
                        </div>
                    </div>
                    
                    <!-- Ver todos los gastos -->
                    <div v-if="expenses.length > 5" class="text-center pt-4">
                        <NuxtLink 
                            to="/expenses"
                            class="text-azul-tiquet hover:text-azul-claro-viaje font-medium transition-colors text-sm sm:text-base"
                        >
                            Ver todos los gastos ({{ expenses.length }})
                        </NuxtLink>
                    </div>
                </div>
            </div>

            <!-- Pagos pendientes -->
            <div class="bg-blanco-dividido rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2 sm:gap-0">
                    <h2 class="text-lg sm:text-xl font-semibold text-gris-billetera">Pagos pendientes</h2>
                    <NuxtLink 
                        to="/expenses"
                        class="text-azul-tiquet hover:text-azul-claro-viaje text-sm font-medium transition-colors"
                    >
                        Ver todos los gastos
                    </NuxtLink>
                </div>
                
                <div v-if="pendingPayments.length === 0" class="text-center py-8 text-gray-500">
                    <div class="text-4xl mb-2">✅</div>
                    <p class="text-sm sm:text-base">¡Todos los pagos están al día!</p>
                </div>

                <div v-else class="space-y-3">
                    <div 
                        v-for="payment in pendingPayments.slice(0, 5)" 
                        :key="payment.id"
                        class="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg"
                    >
                        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                            <div class="flex-1">
                                <p class="font-medium text-gris-billetera text-sm sm:text-base">{{ payment.title }}</p>
                                <p class="text-xs sm:text-sm text-gray-600">Pagado por: {{ payment.paidBy }}</p>
                                <p class="text-xs text-gray-400">{{ formatDate(payment.date) }}</p>
                            </div>
                            <div class="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 sm:gap-2">
                                <p class="font-semibold text-red-600 text-sm sm:text-base">{{ formatMoney(payment.amount) }}</p>
                                <button 
                                    @click="markPaymentAsPaid(payment.id)"
                                    class="px-3 py-1 bg-lima-compartida text-gris-billetera text-xs rounded-full hover:bg-azul-claro-viaje transition-colors whitespace-nowrap"
                                >
                                    Marcar como pagado
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div v-if="pendingPayments.length > 5" class="text-center pt-2">
                        <p class="text-xs sm:text-sm text-gray-600">
                            Y {{ pendingPayments.length - 5 }} pagos pendientes más...
                        </p>
                    </div>
                </div>
            </div>

            <!-- Balances por usuario -->
            <div class="bg-blanco-dividido rounded-lg shadow-md p-4 sm:p-6">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2 sm:gap-0">
                    <h2 class="text-lg sm:text-xl font-semibold text-gris-billetera">Balances detallados</h2>
                    <NuxtLink 
                        to="/balances"
                        class="text-azul-tiquet hover:text-azul-claro-viaje text-sm font-medium transition-colors"
                    >
                        Ver detalles
                    </NuxtLink>
                </div>
                
                <div v-if="Object.keys(balances).length === 0" class="text-center py-8 text-gray-500">
                    <div class="text-4xl mb-2">👥</div>
                    <p class="text-sm sm:text-base">No hay balances calculados</p>
                </div>

                <div v-else class="space-y-3 sm:space-y-4">
                    <!-- Tu usuario destacado primero -->
                    <div 
                        v-if="currentUser && balances[currentUser.id]"
                        class="relative overflow-hidden flex flex-col p-4 sm:p-5 bg-gradient-to-r from-lima-compartida/20 to-azul-claro-viaje/20 rounded-lg border-2 border-lima-compartida/50 shadow-lg"
                    >
                        <!-- Indicador visual de "tu usuario" -->
                        <div class="absolute top-2 right-2 bg-lima-compartida px-2 py-1 rounded-full">
                            <span class="text-xs font-semibold text-gris-billetera">TÚ</span>
                        </div>
                        
                        <div class="flex items-center gap-3 mb-4">
                            <div class="w-10 h-10 sm:w-12 sm:h-12 bg-azul-tiquet rounded-full flex items-center justify-center text-blanco-dividido font-bold text-lg">
                                {{ getUserName(currentUser.id).charAt(0).toUpperCase() }}
                            </div>
                            <div>
                                <h3 class="font-bold text-gris-billetera text-lg">{{ getUserName(currentUser.id) }}</h3>
                                <p class="text-sm text-gray-600">Tu resumen financiero</p>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div class="text-center">
                                <p class="text-xs sm:text-sm text-gray-600 mb-1">Has gastado</p>
                                <p class="font-bold text-azul-tiquet text-sm sm:text-base">{{ formatMoney(balances[currentUser.id].totalSpent) }}</p>
                            </div>
                            <div class="text-center">
                                <p class="text-xs sm:text-sm text-gray-600 mb-1">Debes</p>
                                <p class="font-bold text-red-500 text-sm sm:text-base">{{ formatMoney(balances[currentUser.id].owes) }}</p>
                            </div>
                            <div class="text-center">
                                <p class="text-xs sm:text-sm text-gray-600 mb-1">Te deben</p>
                                <p class="font-bold text-lima-compartida text-sm sm:text-base">{{ formatMoney(balances[currentUser.id].owedToThem) }}</p>
                            </div>
                            <div class="text-center">
                                <p class="text-xs sm:text-sm text-gray-600 mb-1">Balance</p>
                                <p class="font-bold text-lg" :class="balances[currentUser.id].balance >= 0 ? 'text-azul-tiquet' : 'text-red-500'">
                                    {{ formatMoney(balances[currentUser.id].balance) }}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Otros usuarios -->
                    <div 
                        v-for="(balance, userId) in balances" 
                        :key="userId"
                        v-show="!currentUser || parseInt(userId) !== currentUser.id"
                        class="flex flex-col p-4 bg-marfil-mapamundi rounded-lg hover:bg-azul-claro-viaje/10 transition-colors duration-200"
                    >
                        <div class="flex items-center gap-3 mb-3">
                            <div class="w-8 h-8 sm:w-10 sm:h-10 bg-azul-tiquet rounded-full flex items-center justify-center text-blanco-dividido font-semibold text-sm sm:text-base">
                                {{ getUserName(parseInt(userId)).charAt(0).toUpperCase() }}
                            </div>
                            <div>
                                <h4 class="font-semibold text-gris-billetera text-sm sm:text-base">{{ getUserName(parseInt(userId)) }}</h4>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                            <div>
                                <p class="text-xs text-gray-600">Ha gastado</p>
                                <p class="font-semibold text-azul-tiquet">{{ formatMoney(balance.totalSpent) }}</p>
                            </div>
                            <div>
                                <p class="text-xs text-gray-600">Debe</p>
                                <p class="font-semibold text-red-500">{{ formatMoney(balance.owes) }}</p>
                            </div>
                            <div>
                                <p class="text-xs text-gray-600">Le deben</p>
                                <p class="font-semibold text-lima-compartida">{{ formatMoney(balance.owedToThem) }}</p>
                            </div>
                            <div>
                                <p class="text-xs text-gray-600">Balance</p>
                                <p class="font-bold" :class="balance.balance >= 0 ? 'text-azul-tiquet' : 'text-red-500'">
                                    {{ formatMoney(balance.balance) }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal para añadir gasto -->
            <AddExpenseModal 
                v-if="showAddExpenseModal"
                @close="showAddExpenseModal = false"
                @expense-added="onExpenseAdded"
            />
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useExpenseStore } from '~/stores/expense.store'
import { useUserStore } from '~/stores/user.store'
import { useAlertStore } from '~/stores/alert.store'
import { useContextStore } from '~/stores/context.store'
import { useDineroStore } from '~/stores/dinero.store'

// Stores
const expenseStore = useExpenseStore()
const userStore = useUserStore()
const alertStore = useAlertStore()
const contextStore = useContextStore()
const dineroStore = useDineroStore()

// Reactive data
const showAddExpenseModal = ref(false)

// Computed properties
const currentUser = computed(() => userStore.getCurrentUser)
const selectedDinero = computed(() => {
    const selectedDineroId = contextStore.getSelectedDineroId
    return selectedDineroId ? dineroStore.getDineroById(selectedDineroId) : null
})
const isLoading = computed(() => expenseStore.isLoading || userStore.isLoading || contextStore.isLoading || dineroStore.isLoading)

// Computed properties
const expenses = computed(() => {
    const selectedDineroId = contextStore.getSelectedDineroId
    if (!selectedDineroId) return []
    
    return expenseStore.getExpensesByDinero(selectedDineroId)
})

const pendingPayments = computed(() => {
    if (!currentUser.value) return []
    
    const selectedDineroId = contextStore.getSelectedDineroId
    if (!selectedDineroId) return []
    
    // Filtrar gastos del dinero seleccionado
    const expensesByDinero = expenseStore.getExpensesByDinero(selectedDineroId)
    if (!expensesByDinero || !Array.isArray(expensesByDinero)) return []
    
    const pending = []
    
    expensesByDinero.forEach(expense => {
        // Validar que el expense tenga las propiedades necesarias
        if (!expense || !expense.participants || !Array.isArray(expense.participants) || !expense.amount || !expense.id) {
            return
        }
        
        // Verificar si el usuario actual participa en este gasto
        if (!expense.participants.includes(currentUser.value.id)) {
            return
        }
        
        // Si el usuario actual es quien pagó originalmente, ya pagó su parte
        if (expense.paidBy === currentUser.value.id) {
            return
        }
        
        // Calcular el monto que debe pagar este usuario
        const userAmount = expense.amount / expense.participants.length
        
        // Verificar si ya está marcado como pagado
        const isUserPaid = expenseStore.getUserPaymentStatus(expense.id, currentUser.value.id)
        
        // Si no ha pagado, agregarlo a pendientes
        if (!isUserPaid) {
            pending.push({
                id: expense.id,
                title: expense.title || 'Sin título',
                amount: userAmount,
                paidBy: getUserName(expense.paidBy),
                date: expense.date || new Date().toISOString()
            })
        }
    })
    
    return pending.sort((a, b) => new Date(b.date) - new Date(a.date))
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

const onExpenseAdded = async () => {
    showAddExpenseModal.value = false
    alertStore.success('Gasto añadido correctamente')
    
    // Refrescar los datos
    await expenseStore.fetchExpenses()
}

const markPaymentAsPaid = async (expenseId) => {
    if (!currentUser.value) return
    
    try {
        await expenseStore.markUserPayment(expenseId, currentUser.value.id, true)
        alertStore.success('Pago marcado como pagado')
        console.log('markPaymentAsPaid')
    } catch (error) {
        alertStore.error('Error al marcar el pago')
    }
}

// Cargar datos al montar el componente
onMounted(async () => {
    console.log('Dashboard: Loading data...')
    
    try {
        // Cargar dineros primero para inicializar el contexto
        await dineroStore.initializeDineros()
        await contextStore.initializeSelectedDinero()
        
        // Si no hay usuarios, esperar a que se inicialicen
        if (userStore.users.length === 0) {
            await userStore.initializeUsers()
        }
        
        if (expenseStore.expenses.length === 0) {
            await expenseStore.initializeExpenses()
        }
        
        console.log('Dashboard: Data loaded. Selected dinero:', contextStore.getSelectedDineroId)
    } catch (error) {
        console.error('Error al cargar datos:', error)
        alertStore.error('Error al cargar los datos')
    }
})

// Watcher para refrescar gastos cuando cambien los usuarios
watch(() => userStore.users.length, async (newLength) => {
    if (newLength > 0 && expenseStore.expenses.length === 0) {
        await expenseStore.initializeExpenses()
    }
})

// Watcher para refrescar cuando cambie el dinero seleccionado
watch(() => contextStore.getSelectedDineroId, async (newDineroId, oldDineroId) => {
    if (newDineroId !== oldDineroId) {
        console.log('Dinero changed in dashboard:', { oldDineroId, newDineroId })
        // Los datos se actualizarán automáticamente a través de los computed
    }
}, { immediate: true })

console.log('dashboard')
</script>