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
                <div class="text-6xl mb-4">⚖️</div>
                <h2 class="text-xl font-semibold text-gris-billetera mb-2">Selecciona tu usuario</h2>
                <p class="text-gray-600">Necesitas seleccionar un usuario para ver los balances</p>
            </div>
        </div>

        <!-- Main content -->
        <div v-else>
            <!-- Header -->
            <div class="mb-6 sm:mb-8">
                <h1 class="text-2xl sm:text-3xl font-bold text-gris-billetera mb-2">Balances y liquidaciones</h1>
                <p class="text-sm sm:text-base text-gray-600">Resumen de quién debe a quién y cuánto</p>
            </div>

        <!-- Resumen general -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div class="bg-blanco-dividido rounded-lg shadow-md p-4 sm:p-6">
                <h2 class="text-lg sm:text-xl font-semibold text-gris-billetera mb-4">Resumen general</h2>
                <div class="space-y-3">
                    <div class="flex justify-between">
                        <span class="text-sm sm:text-base text-gray-600">Total gastado</span>
                        <span class="text-sm sm:text-base font-semibold text-gris-billetera">{{ formatMoney(totalExpenses) }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-sm sm:text-base text-gray-600">Número de gastos</span>
                        <span class="text-sm sm:text-base font-semibold text-gris-billetera">{{ expenses.length }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-sm sm:text-base text-gray-600">Usuarios participantes</span>
                        <span class="text-sm sm:text-base font-semibold text-gris-billetera">{{ Object.keys(balances).length }}</span>
                    </div>
                </div>
            </div>

            <div class="bg-blanco-dividido rounded-lg shadow-md p-4 sm:p-6">
                <h2 class="text-lg sm:text-xl font-semibold text-gris-billetera mb-4">Tu balance</h2>
                <div class="text-center">
                    <div 
                        class="text-2xl sm:text-3xl font-bold mb-2"
                        :class="userBalance >= 0 ? 'text-lima-compartida' : 'text-red-500'"
                    >
                        {{ formatMoney(userBalance) }}
                    </div>
                    <p class="text-xs sm:text-sm text-gray-600">
                        {{ userBalance >= 0 ? 'Te deben dinero' : 'Debes dinero' }}
                    </p>
                </div>
            </div>
        </div>

        <!-- Balances individuales -->
        <div class="bg-blanco-dividido rounded-lg shadow-md p-6 mb-8">
            <h2 class="text-xl font-semibold text-gris-billetera mb-6">Balance por usuario</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div 
                    v-for="(balance, userId) in balances" 
                    :key="userId"
                    class="border border-gray-200 rounded-lg p-4"
                >
                    <!-- Usuario -->
                    <div class="flex items-center gap-3 mb-4">
                        <div class="w-12 h-12 bg-azul-tiquet rounded-full flex items-center justify-center text-blanco-dividido font-bold">
                            {{ getUserName(parseInt(userId)).charAt(0).toUpperCase() }}
                        </div>
                        <div>
                            <h3 class="font-semibold text-gris-billetera">{{ getUserName(parseInt(userId)) }}</h3>
                            <span 
                                v-if="parseInt(userId) === currentUser.id" 
                                class="text-xs px-2 py-1 bg-lima-compartida/10 text-azul-tiquet rounded-full"
                            >
                                Tú
                            </span>
                        </div>
                    </div>

                    <!-- Balance -->
                    <div class="text-center mb-4">
                        <div 
                            class="text-xl font-bold"
                            :class="balance.balance >= 0 ? 'text-lima-compartida' : 'text-red-500'"
                        >
                            {{ formatMoney(balance.balance) }}
                        </div>
                    </div>

                    <!-- Detalles -->
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                            <span class="text-gray-600">Ha pagado:</span>
                            <span class="font-medium text-gris-billetera">{{ formatMoney(balance.paid) }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Debe:</span>
                            <span class="font-medium text-gris-billetera">{{ formatMoney(balance.owes) }}</span>
                        </div>
                        <div class="flex justify-between border-t pt-2">
                            <span class="text-gray-600">Gastos:</span>
                            <span class="font-medium text-azul-claro-viaje">{{ getUserExpenseCount(parseInt(userId)) }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Liquidaciones sugeridas -->
        <div class="bg-blanco-dividido rounded-lg shadow-md p-6">
            <h2 class="text-xl font-semibold text-gris-billetera mb-6">Liquidaciones sugeridas</h2>
            
            <div v-if="suggestedSettlements.length === 0" class="text-center py-8 text-gray-500">
                <div class="text-4xl mb-2">✅</div>
                <p>¡Todos los balances están equilibrados!</p>
            </div>

            <div v-else class="space-y-4">
                <div 
                    v-for="settlement in suggestedSettlements" 
                    :key="`${settlement.from}-${settlement.to}`"
                    class="flex items-center justify-between p-4 bg-marfil-mapamundi border rounded-lg"
                >
                    <div class="flex items-center gap-4">
                        <!-- De -->
                        <div class="flex items-center gap-2">
                            <div class="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-blanco-dividido font-semibold text-sm">
                                {{ getUserName(settlement.from).charAt(0).toUpperCase() }}
                            </div>
                            <span class="font-medium text-gris-billetera">{{ getUserName(settlement.from) }}</span>
                        </div>

                        <!-- Flecha -->
                        <div class="flex items-center gap-2 text-gray-500">
                            <span class="text-sm">debe pagar</span>
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                            </svg>
                        </div>

                        <!-- A -->
                        <div class="flex items-center gap-2">
                            <div class="w-10 h-10 bg-lima-compartida rounded-full flex items-center justify-center text-gris-billetera font-semibold text-sm">
                                {{ getUserName(settlement.to).charAt(0).toUpperCase() }}
                            </div>
                            <span class="font-medium text-gris-billetera">{{ getUserName(settlement.to) }}</span>
                        </div>
                    </div>

                    <!-- Cantidad -->
                    <div class="text-right">
                        <div class="text-lg font-bold text-azul-tiquet">{{ formatMoney(settlement.amount) }}</div>
                        <button 
                            @click="markAsSettled(settlement)"
                            class="text-sm text-lima-compartida hover:text-azul-claro-viaje font-medium transition-colors"
                        >
                            Marcar como pagado
                        </button>
                    </div>
                </div>
                </div>
            </div>
        </div>
    </div>
</template><script setup>
import { computed, onMounted } from 'vue'
import { useExpenseStore } from '~/stores/expense.store'
import { useUserStore } from '~/stores/user.store'
import { useAlertStore } from '~/stores/alert.store'
import { useFormatters } from '~/composables/useFormatters'

// Stores
const expenseStore = useExpenseStore()
const userStore = useUserStore()
const alertStore = useAlertStore()

// Composables
const { formatMoney } = useFormatters()

// Computed properties
const expenses = computed(() => expenseStore.getAllExpenses)
const totalExpenses = computed(() => expenseStore.getTotalExpenses)
const balances = computed(() => expenseStore.getBalances)
const currentUser = computed(() => userStore.getCurrentUser)
const isLoading = computed(() => userStore.isLoading || expenseStore.isLoading)

const userBalance = computed(() => {
    if (!currentUser.value) return 0
    const userBalances = balances.value[currentUser.value.id]
    return userBalances ? userBalances.balance : 0
})

const suggestedSettlements = computed(() => {
    const settlements = []
    const balancesCopy = { ...balances.value }
    
    // Crear arrays de deudores y acreedores
    const debtors = []
    const creditors = []
    
    Object.entries(balancesCopy).forEach(([userId, balance]) => {
        if (balance.balance < 0) {
            debtors.push({ userId: parseInt(userId), amount: Math.abs(balance.balance) })
        } else if (balance.balance > 0) {
            creditors.push({ userId: parseInt(userId), amount: balance.balance })
        }
    })
    
    // Ordenar por cantidad
    debtors.sort((a, b) => b.amount - a.amount)
    creditors.sort((a, b) => b.amount - a.amount)
    
    // Calcular liquidaciones óptimas
    let i = 0, j = 0
    while (i < debtors.length && j < creditors.length) {
        const debt = debtors[i].amount
        const credit = creditors[j].amount
        const settleAmount = Math.min(debt, credit)
        
        settlements.push({
            from: debtors[i].userId,
            to: creditors[j].userId,
            amount: settleAmount
        })
        
        debtors[i].amount -= settleAmount
        creditors[j].amount -= settleAmount
        
        if (debtors[i].amount === 0) i++
        if (creditors[j].amount === 0) j++
    }
    
    console.log('suggestedSettlements')
    return settlements
})

// Methods
const getUserName = (userId) => {
    const user = userStore.getUserById(userId)
    return user ? user.name : 'Usuario desconocido'
}

const getUserExpenseCount = (userId) => {
    return expenseStore.getExpensesByUser(userId).length
}

const markAsSettled = (settlement) => {
    // En una implementación real, aquí se registraría el pago
    // Por ahora solo mostramos una confirmación
    alertStore.success(`Pago de ${formatMoney(settlement.amount)} marcado como completado`)
    console.log('markAsSettled')
}

// Cargar datos al montar el componente
onMounted(async () => {
    try {
        // Cargar usuarios y gastos actualizados
        await userStore.fetchUsers()
        await expenseStore.fetchExpenses()
    } catch (error) {
        console.error('Error al cargar datos:', error)
        alertStore.error('Error al cargar los datos')
    }
})

console.log('balances-page')
</script>
