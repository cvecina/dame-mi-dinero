<template>
    <div class="min-h-screen bg-marfil-mapamundi p-3 sm:p-4 lg:p-6">
        <!-- Loading state -->
        <div v-if="isLoading" class="flex items-center justify-center py-20">
            <div class="text-center">
                <div class="w-16 h-16 border-4 border-azul-tiquet border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p class="text-gris-billetera font-medium">Cargando balances...</p>
            </div>
        </div>

        <!-- Mensaje cuando no hay usuario seleccionado -->
        <div v-else-if="!currentUser" class="flex items-center justify-center py-20">
            <div class="text-center">
                <div class="text-6xl mb-4">👋</div>
                <h2 class="text-xl font-semibold text-gris-billetera mb-2">¡Hola!</h2>
                <p class="text-gray-600">Selecciona tu usuario para ver los balances</p>
            </div>
        </div>

        <!-- Main content -->
        <div v-else class="max-w-7xl mx-auto">
            <!-- Header -->
            <div class="mb-8">
                <div class="bg-gradient-to-r from-azul-tiquet to-azul-claro-viaje rounded-2xl p-6 text-blanco-dividido shadow-xl">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 class="text-2xl sm:text-3xl font-bold mb-2">
                                Balances{{ selectedDinero ? ` - ${selectedDinero.name}` : '' }}
                            </h1>
                            <p class="text-azul-claro-viaje/90 text-sm sm:text-base">
                                {{ selectedDinero ? 
                                    `Gestión de balances para: ${selectedDinero.name}` : 
                                    'Gestión completa de deudas y pagos entre usuarios' 
                                }}
                            </p>
                        </div>
                        <div class="flex items-center gap-3">
                            <div class="bg-blanco-dividido/20 backdrop-blur-sm rounded-lg px-4 py-2">
                                <p class="text-xs opacity-80">Tu balance</p>
                                <p class="text-xl font-bold" :class="balances[currentUser.id]?.balance >= 0 ? 'text-white' : 'text-red-200'">
                                    {{ balances[currentUser.id] ? formatMoney(balances[currentUser.id].balance) : '€0.00' }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Sin balances -->
            <div v-if="Object.keys(balances).length === 0" class="flex items-center justify-center py-20">
                <div class="text-center">
                    <div class="text-6xl mb-4">💰</div>
                    <h2 class="text-xl font-semibold text-gris-billetera mb-2">No hay balances</h2>
                    <p class="text-gray-600 mb-6">Aún no hay gastos registrados para calcular balances</p>
                    <NuxtLink 
                        to="/"
                        class="px-4 py-3 bg-gradient-to-r from-lima-compartida to-lima-compartida/80 text-gris-billetera text-sm font-semibold rounded-xl hover:from-lima-compartida/90 hover:to-lima-compartida/70 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                        <span class="text-sm">+</span>
                        Añadir primer gasto
                    </NuxtLink>
                </div>
            </div>

            <!-- Contenido principal -->
            <div v-else class="space-y-8">
                <!-- Resumen personal destacado -->
                <div 
                    v-if="balances[currentUser.id]"
                    class="relative overflow-hidden bg-gradient-to-br from-azul-tiquet/10 to-lima-compartida/10 rounded-2xl border-2 border-azul-tiquet/20 p-6 sm:p-8 shadow-xl"
                >
                    <div class="absolute top-4 right-4 bg-azul-tiquet text-blanco-dividido px-3 py-1 rounded-full text-xs font-bold">
                        TU RESUMEN
                    </div>
                    
                    <div class="flex flex-col sm:flex-row sm:items-center gap-6 mb-6">
                        <div class="flex items-center gap-4">
                            <div class="w-16 h-16 bg-azul-tiquet rounded-full flex items-center justify-center text-blanco-dividido font-bold text-xl">
                                {{ getUserName(currentUser.id).charAt(0).toUpperCase() }}
                            </div>
                            <div>
                                <h2 class="text-xl font-bold text-gris-billetera">{{ getUserName(currentUser.id) }}</h2>
                                <p class="text-lg font-semibold" :class="balances[currentUser.id].balance >= 0 ? 'text-azul-tiquet' : 'text-red-600'">
                                    Balance: {{ formatMoney(balances[currentUser.id].balance) }}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div class="bg-blanco-dividido/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-md">
                            <p class="text-sm text-gray-600 mb-2">Total pagado</p>
                            <p class="text-xl font-bold text-azul-tiquet">{{ formatMoney(balances[currentUser.id].totalSpent) }}</p>
                        </div>
                        <div class="bg-blanco-dividido/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-md">
                            <p class="text-sm text-gray-600 mb-2">Te deben</p>
                            <p class="text-xl font-bold text-lima-compartida">{{ formatMoney(balances[currentUser.id].owedToThem) }}</p>
                        </div>
                        <div class="bg-blanco-dividido/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-md">
                            <p class="text-sm text-gray-600 mb-2">Debes</p>
                            <p class="text-xl font-bold text-red-500">{{ formatMoney(balances[currentUser.id].owes) }}</p>
                        </div>
                    </div>
                </div>

                <!-- Dinero que te deben -->
                <div v-if="peopleWhoOweMe.length > 0" class="bg-blanco-dividido rounded-2xl shadow-lg p-6 border border-lima-compartida/20">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="w-12 h-12 bg-lima-compartida/10 rounded-xl flex items-center justify-center">
                            <span class="text-2xl">💰</span>
                        </div>
                        <div>
                            <h2 class="text-xl font-bold text-gris-billetera">Dinero que te deben</h2>
                            <p class="text-sm text-gray-600">{{ peopleWhoOweMe.length }} persona{{ peopleWhoOweMe.length !== 1 ? 's' : '' }} te debe{{ peopleWhoOweMe.length === 1 ? '' : 'n' }} dinero</p>
                        </div>
                    </div>

                    <div class="space-y-4">
                        <div 
                            v-for="debt in peopleWhoOweMe" 
                            :key="`owed-${debt.userId}`"
                            class="border-2 border-lima-compartida/20 bg-gradient-to-r from-lima-compartida/5 to-lima-compartida/10 rounded-xl p-4 hover:border-lima-compartida/40 transition-all duration-200 hover:shadow-md"
                        >
                            <div class="flex items-center justify-between mb-4">
                                <div class="flex items-center gap-3">
                                    <div class="w-12 h-12 bg-lima-compartida rounded-full flex items-center justify-center text-gris-billetera font-bold text-lg shadow-md">
                                        {{ getUserName(debt.userId).charAt(0).toUpperCase() }}
                                    </div>
                                    <div>
                                        <h3 class="font-semibold text-gris-billetera">{{ getUserName(debt.userId) }}</h3>
                                        <p class="text-sm text-gray-600">{{ debt.expenseCount }} gasto{{ debt.expenseCount !== 1 ? 's' : '' }}</p>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <p class="text-xl font-bold text-lima-compartida">{{ formatMoney(debt.amount) }}</p>
                                    <button 
                                        @click="sendReminder(debt.userId, debt.amount)"
                                        class="mt-2 px-3 py-1 bg-gradient-to-r from-azul-tiquet to-azul-claro-viaje text-blanco-dividido text-xs rounded-full hover:from-azul-tiquet/90 hover:to-azul-claro-viaje/90 transition-all duration-200 font-medium shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                                    >
                                        💌 Recordar
                                    </button>
                                </div>
                            </div>

                            <!-- Detalles de gastos -->
                            <div v-if="debt.expenses && debt.expenses.length > 0" class="border-t border-lima-compartida/20 pt-3">
                                <h4 class="text-sm font-medium text-gray-700 mb-2">Gastos pendientes:</h4>
                                <div class="space-y-2">
                                    <div 
                                        v-for="expense in debt.expenses.slice(0, 3)" 
                                        :key="`debt-expense-${expense.id}`"
                                        class="flex justify-between items-center text-sm"
                                    >
                                        <span class="text-gray-600">{{ expense.title }}</span>
                                        <span class="font-medium text-gris-billetera">{{ formatMoney(expense.amount / expense.participants.length) }}</span>
                                    </div>
                                    <div v-if="debt.expenses.length > 3" class="text-xs text-gray-500 text-center pt-1">
                                        Y {{ debt.expenses.length - 3 }} gastos más...
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Dinero que debes -->
                <div v-if="peopleIOwe.length > 0" class="bg-blanco-dividido rounded-2xl shadow-lg p-6 border border-red-200">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                            <span class="text-2xl">💸</span>
                        </div>
                        <div>
                            <h2 class="text-xl font-bold text-gris-billetera">Dinero que debes</h2>
                            <p class="text-sm text-gray-600">Debes dinero a {{ peopleIOwe.length }} persona{{ peopleIOwe.length !== 1 ? 's' : '' }}</p>
                        </div>
                    </div>

                    <div class="space-y-4">
                        <div 
                            v-for="debt in peopleIOwe" 
                            :key="`owe-${debt.userId}`"
                            class="border-2 border-red-200 bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-4 hover:border-red-300 transition-all duration-200 hover:shadow-md"
                        >
                            <div class="flex items-center justify-between mb-4">
                                <div class="flex items-center gap-3">
                                    <div class="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-blanco-dividido font-bold text-lg shadow-md">
                                        {{ getUserName(debt.userId).charAt(0).toUpperCase() }}
                                    </div>
                                    <div>
                                        <h3 class="font-semibold text-gris-billetera">{{ getUserName(debt.userId) }}</h3>
                                        <p class="text-sm text-gray-600">{{ debt.expenseCount }} gasto{{ debt.expenseCount !== 1 ? 's' : '' }}</p>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <p class="text-xl font-bold text-red-600">{{ formatMoney(debt.amount) }}</p>
                                    <button 
                                        @click="payDebt(debt.userId, debt.amount)"
                                        class="mt-2 px-4 py-1 bg-gradient-to-r from-lima-compartida to-lima-compartida/80 text-gris-billetera text-xs rounded-full hover:from-lima-compartida/90 hover:to-lima-compartida/70 transition-all duration-200 font-medium shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                                    >
                                        💳 Pagar
                                    </button>
                                </div>
                            </div>

                            <!-- Detalles de gastos -->
                            <div v-if="debt.expenses && debt.expenses.length > 0" class="border-t border-red-200 pt-3">
                                <h4 class="text-sm font-medium text-gray-700 mb-2">Gastos pendientes:</h4>
                                <div class="space-y-2">
                                    <div 
                                        v-for="expense in debt.expenses.slice(0, 3)" 
                                        :key="`owe-expense-${expense.id}`"
                                        class="flex justify-between items-center text-sm"
                                    >
                                        <span class="text-gray-600">{{ expense.title }}</span>
                                        <span class="font-medium text-gris-billetera">{{ formatMoney(expense.amount / expense.participants.length) }}</span>
                                    </div>
                                    <div v-if="debt.expenses.length > 3" class="text-xs text-gray-500 text-center pt-1">
                                        Y {{ debt.expenses.length - 3 }} gastos más...
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Otros usuarios -->
                <div v-if="otherUsers.length > 0" class="bg-blanco-dividido rounded-lg shadow-md p-4 sm:p-6">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="w-12 h-12 bg-azul-claro-viaje rounded-full flex items-center justify-center">
                            <span class="text-xl">👥</span>
                        </div>
                        <div>
                            <h2 class="text-xl font-bold text-gris-billetera">Otros participantes</h2>
                            <p class="text-sm text-gray-600">Usuarios sin deudas pendientes contigo</p>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div 
                            v-for="user in otherUsers" 
                            :key="`other-${user.userId}`"
                            class="border border-gray-200 bg-gray-50 rounded-lg p-4"
                        >
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-blanco-dividido font-bold">
                                    {{ getUserName(user.userId).charAt(0).toUpperCase() }}
                                </div>
                                <div class="flex-1">
                                    <h3 class="font-semibold text-gris-billetera">{{ getUserName(user.userId) }}</h3>
                                    <p class="text-sm" :class="user.balance >= 0 ? 'text-azul-tiquet' : 'text-red-600'">
                                        {{ formatMoney(user.balance) }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Estado equilibrado -->
                <div v-if="peopleWhoOweMe.length === 0 && peopleIOwe.length === 0 && balances[currentUser.id]" class="bg-blanco-dividido rounded-lg shadow-md p-6 sm:p-8 text-center">
                    <div class="text-6xl mb-4">✅</div>
                    <h2 class="text-2xl font-bold text-gris-billetera mb-2">¡Todo equilibrado!</h2>
                    <p class="text-gray-600 mb-4">No tienes deudas pendientes con nadie</p>
                    <div class="bg-lima-compartida/20 rounded-lg p-4 inline-block">
                        <p class="text-lg font-semibold text-gris-billetera">
                            Tu balance: {{ formatMoney(balances[currentUser.id].balance) }}
                        </p>
                    </div>
                </div>

                <!-- Optimización de pagos -->
                <div v-if="optimizedPayments.length > 0" class="bg-blanco-dividido rounded-lg shadow-md p-4 sm:p-6">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="w-12 h-12 bg-azul-claro-viaje rounded-full flex items-center justify-center">
                            <span class="text-xl">🎯</span>
                        </div>
                        <div>
                            <h2 class="text-xl font-bold text-gris-billetera">Optimización de pagos</h2>
                            <p class="text-sm text-gray-600">Forma más eficiente de saldar todas las deudas</p>
                        </div>
                    </div>

                    <div class="space-y-3">
                        <div 
                            v-for="payment in optimizedPayments" 
                            :key="`opt-${payment.from}-${payment.to}`"
                            class="flex items-center justify-between p-3 bg-azul-claro-viaje/10 rounded-lg border border-azul-claro-viaje/20"
                        >
                            <div class="flex items-center gap-3">
                                <span class="text-sm font-medium text-gris-billetera">
                                    {{ getUserName(payment.from) }}
                                </span>
                                <span class="text-azul-claro-viaje">→</span>
                                <span class="text-sm font-medium text-gris-billetera">
                                    {{ getUserName(payment.to) }}
                                </span>
                            </div>
                            <span class="font-bold text-azul-tiquet">{{ formatMoney(payment.amount) }}</span>
                        </div>
                    </div>

                    <div class="mt-4 p-3 bg-lima-compartida/10 rounded-lg border border-lima-compartida/20">
                        <p class="text-sm text-gris-billetera">
                            <span class="font-semibold">Resumen:</span> Con {{ optimizedPayments.length }} pago{{ optimizedPayments.length !== 1 ? 's' : '' }}, 
                            todas las deudas quedarán saldadas.
                        </p>
                    </div>
                </div>
            </div>
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

// Computed properties
const currentUser = computed(() => userStore.getCurrentUser)
const selectedDinero = computed(() => {
    const selectedDineroId = contextStore.getSelectedDineroId
    return selectedDineroId ? dineroStore.getDineroById(selectedDineroId) : null
})
const isLoading = computed(() => expenseStore.isLoading || userStore.isLoading || contextStore.isLoading || dineroStore.isLoading)

const balances = computed(() => {
    const selectedDineroId = contextStore.getSelectedDineroId
    if (!selectedDineroId) return {}
    
    return expenseStore.getBalancesByDinero(selectedDineroId)
})

// Computed para deudas específicas
const peopleWhoOweMe = computed(() => {
    if (!currentUser.value) return []
    
    const selectedDineroId = contextStore.getSelectedDineroId
    if (!selectedDineroId) return []
    
    const debts = []
    const expensesByDinero = expenseStore.getExpensesByDinero(selectedDineroId)
    
    // Agrupar por usuario las deudas hacia mí
    const debtsByUser = {}
    
    expensesByDinero.forEach(expense => {
        // Solo considerar gastos que yo pagué
        if (expense.paidBy !== currentUser.value.id) return
        
        expense.splits?.forEach(split => {
            const userId = parseInt(split.userId)
            const amount = parseFloat(split.amount)
            
            // Solo considerar otros usuarios que no han pagado
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
    
    const debts = []
    const expensesByDinero = expenseStore.getExpensesByDinero(selectedDineroId)
    
    // Agrupar por usuario las deudas que tengo
    const debtsByUser = {}
    
    expensesByDinero.forEach(expense => {
        // Solo considerar gastos que otros pagaron y yo participé
        if (expense.paidBy === currentUser.value.id) return
        
        expense.splits?.forEach(split => {
            const userId = parseInt(split.userId)
            const amount = parseFloat(split.amount)
            
            // Solo mi parte de la deuda
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

const otherUsers = computed(() => {
    if (!currentUser.value) return []
    
    const debtUserIds = new Set([
        ...peopleWhoOweMe.value.map(debt => debt.userId),
        ...peopleIOwe.value.map(debt => debt.userId)
    ])
    
    return Object.entries(balances.value)
        .filter(([userId, balance]) => {
            return userId != currentUser.value.id && !debtUserIds.has(parseInt(userId))
        })
        .map(([userId, balance]) => ({
            userId: parseInt(userId),
            balance: balance.balance
        }))
        .sort((a, b) => getUserName(a.userId).localeCompare(getUserName(b.userId)))
})

const optimizedPayments = computed(() => {
    const payments = []
    const balancesCopy = { ...balances.value }
    
    // Convertir a arrays y ordenar
    const debtors = Object.entries(balancesCopy)
        .filter(([userId, balance]) => balance.balance < 0)
        .map(([userId, balance]) => ({ userId: parseInt(userId), amount: -balance.balance }))
        .sort((a, b) => b.amount - a.amount)
    
    const creditors = Object.entries(balancesCopy)
        .filter(([userId, balance]) => balance.balance > 0)
        .map(([userId, balance]) => ({ userId: parseInt(userId), amount: balance.balance }))
        .sort((a, b) => b.amount - a.amount)
    
    // Algoritmo de optimización
    let i = 0, j = 0
    while (i < debtors.length && j < creditors.length) {
        const debt = debtors[i]
        const credit = creditors[j]
        
        const paymentAmount = Math.min(debt.amount, credit.amount)
        
        if (paymentAmount > 0.01) { // Evitar pagos de centavos
            payments.push({
                from: debt.userId,
                to: credit.userId,
                amount: paymentAmount
            })
        }
        
        debt.amount -= paymentAmount
        credit.amount -= paymentAmount
        
        if (debt.amount <= 0.01) i++
        if (credit.amount <= 0.01) j++
    }
    
    return payments
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

const sendReminder = async (userId, amount) => {
    const userName = getUserName(userId)
    alertStore.info(`📌 Recordatorio para ${userName} por ${formatMoney(amount)} - Puedes contactarlos directamente`)
    console.log('sendReminder', { userId, amount, userName })
}

const payDebt = async (creditorId, amount) => {
    const creditorName = getUserName(creditorId)
    
    // Buscar todos los gastos donde debo dinero a esta persona
    const selectedDineroId = contextStore.getSelectedDineroId
    if (!selectedDineroId) return
    
    const expensesByDinero = expenseStore.getExpensesByDinero(selectedDineroId)
    const expensesToPay = []
    
    expensesByDinero.forEach(expense => {
        if (expense.paidBy === creditorId && expense.participants?.includes(currentUser.value.id)) {
            const hasPaid = expense.payments && expense.payments[currentUser.value.id]
            if (!hasPaid) {
                expensesToPay.push(expense.id)
            }
        }
    })
    
    try {
        // Marcar todos los gastos relevantes como pagados
        for (const expenseId of expensesToPay) {
            await expenseStore.markUserPayment(expenseId, currentUser.value.id, true)
        }
        
        alertStore.success(`Has pagado ${formatMoney(amount)} a ${creditorName}`)
        console.log('payDebt', { creditorId, amount, creditorName, expensesCount: expensesToPay.length })
    } catch (error) {
        alertStore.error('Error al procesar el pago')
        console.error('Error paying debt:', error)
    }
}

// Cargar datos al montar el componente
onMounted(async () => {
    console.log('Balances: Loading data...')
    
    try {
        // 1. Cargar dineros primero
        console.log('1. Loading dineros...')
        await dineroStore.initializeDineros()
        
        // 2. Inicializar contexto con dinero seleccionado
        console.log('2. Initializing context...')
        await contextStore.initializeSelectedDinero()
        
        // 3. Cargar usuarios
        console.log('3. Loading users...')
        if (userStore.users.length === 0) {
            await userStore.initializeUsers()
        }
        
        // 4. Cargar gastos
        console.log('4. Loading expenses...')
        if (expenseStore.expenses.length === 0) {
            await expenseStore.initializeExpenses()
        }
        
        console.log('Balances: Data loaded. Selected dinero:', contextStore.getSelectedDineroId)
    } catch (error) {
        console.error('Error al cargar datos:', error)
        alertStore.error('Error al cargar los datos')
    }
})

// Watcher para refrescar cuando cambie el dinero seleccionado
watch(() => contextStore.getSelectedDineroId, async (newDineroId, oldDineroId) => {
    if (newDineroId !== oldDineroId) {
        console.log('Dinero changed in balances:', { oldDineroId, newDineroId })
        // Los datos se actualizarán automáticamente a través de los computed
    }
}, { immediate: true })

console.log('balances')
</script>