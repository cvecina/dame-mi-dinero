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

            <!-- Filtro de período -->
            <div class="mb-6">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gris-billetera mb-2">Período de tiempo</label>
                        <select 
                            v-model="selectedPeriod"
                            class="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-azul-tiquet focus:border-transparent bg-blanco-dividido"
                        >
                            <option value="week">Esta semana</option>
                            <option value="month">Este mes</option>
                            <option value="year">Este año</option>
                            <option value="all">Todo el tiempo</option>
                        </select>
                    </div>
                    <div class="text-sm text-gray-600">
                        Mostrando datos de <span class="font-medium">{{ getPeriodLabel() }}</span>
                    </div>
                </div>
            </div>

            <!-- Panel de alertas -->
            <div v-if="hasAlerts" class="mb-6 space-y-3">
                <div 
                    v-for="alert in alertsData" 
                    :key="alert.title"
                    class="p-4 rounded-lg border-l-4"
                    :class="{
                        'bg-yellow-50 border-yellow-400': alert.type === 'warning',
                        'bg-red-50 border-red-400': alert.type === 'error',
                        'bg-blue-50 border-blue-400': alert.type === 'info'
                    }"
                >
                    <div class="flex items-start gap-3">
                        <span class="text-lg">{{ alert.icon }}</span>
                        <div class="flex-1">
                            <h3 class="font-medium text-gris-billetera text-sm">{{ alert.title }}</h3>
                            <p class="text-sm mt-1" 
                                :class="{
                                    'text-yellow-700': alert.type === 'warning',
                                    'text-red-700': alert.type === 'error',
                                    'text-blue-700': alert.type === 'info'
                                }"
                            >
                                {{ alert.message }}
                            </p>
                        </div>
                        <button 
                            @click="alert.action === 'Añadir gasto' ? showAddExpenseModal = true : null"
                            class="text-xs px-3 py-1 rounded-full font-medium transition-colors"
                            :class="{
                                'bg-yellow-200 text-yellow-800 hover:bg-yellow-300': alert.type === 'warning',
                                'bg-red-200 text-red-800 hover:bg-red-300': alert.type === 'error',
                                'bg-blue-200 text-blue-800 hover:bg-blue-300': alert.type === 'info'
                            }"
                        >
                            {{ alert.action }}
                        </button>
                    </div>
                </div>
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
                    <h3 class="text-base sm:text-lg font-semibold text-gris-billetera mb-2">Gastos {{ getPeriodLabel() }}</h3>
                    <p class="text-xl sm:text-2xl font-bold text-azul-claro-viaje">{{ getExpensesByPeriod().length }}</p>
                </div>
            </div>

            <!-- Estadísticas por categoría -->
            <div class="bg-blanco-dividido rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2 sm:gap-0">
                    <h2 class="text-lg sm:text-xl font-semibold text-gris-billetera">Gastos por categoría</h2>
                    <span class="text-sm text-gray-600">{{ getPeriodLabel() }}</span>
                </div>
                
                <div v-if="expensesByCategory.length === 0" class="text-center py-8 text-gray-500">
                    <div class="text-4xl mb-2">📊</div>
                    <p class="text-sm sm:text-base">No hay gastos en {{ getPeriodLabel() }}</p>
                </div>

                <div v-else class="space-y-4">
                    <div 
                        v-for="category in expensesByCategory.slice(0, 6)" 
                        :key="category.name"
                        class="flex items-center gap-4"
                    >
                        <!-- Icono de categoría -->
                        <div class="w-10 h-10 bg-azul-claro-viaje/20 rounded-lg flex items-center justify-center">
                            <span class="text-lg">{{ getCategoryIcon(category.name) }}</span>
                        </div>
                        
                        <!-- Info de categoría -->
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center justify-between mb-1">
                                <h3 class="font-medium text-gris-billetera text-sm truncate">{{ category.name }}</h3>
                                <span class="text-sm font-semibold text-azul-tiquet">{{ formatMoney(category.total) }}</span>
                            </div>
                            
                            <!-- Barra de progreso -->
                            <div class="w-full bg-gray-200 rounded-full h-2 mb-1">
                                <div 
                                    class="bg-gradient-to-r from-azul-tiquet to-lima-compartida h-2 rounded-full transition-all duration-300"
                                    :style="{ width: `${(category.total / expensesByCategory[0].total) * 100}%` }"
                                ></div>
                            </div>
                            
                            <div class="flex items-center justify-between text-xs text-gray-600">
                                <span>{{ category.count }} gasto{{ category.count !== 1 ? 's' : '' }}</span>
                                <span>{{ Math.round((category.total / expensesByCategory.reduce((sum, cat) => sum + cat.total, 0)) * 100) }}%</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Mostrar más categorías si hay -->
                    <div v-if="expensesByCategory.length > 6" class="text-center pt-2">
                        <p class="text-xs sm:text-sm text-gray-600">
                            Y {{ expensesByCategory.length - 6 }} categorías más...
                        </p>
                    </div>
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

            <!-- Resumen de balances personales -->
            <div class="bg-blanco-dividido rounded-lg shadow-md p-4 sm:p-6">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2 sm:gap-0">
                    <h2 class="text-lg sm:text-xl font-semibold text-gris-billetera">Mi situación financiera</h2>
                    <NuxtLink 
                        to="/balances"
                        class="text-azul-tiquet hover:text-azul-claro-viaje text-sm font-medium transition-colors"
                    >
                        Ver todos los balances
                    </NuxtLink>
                </div>
                
                <div v-if="!currentUser || Object.keys(balances).length === 0" class="text-center py-8 text-gray-500">
                    <div class="text-4xl mb-2">👥</div>
                    <p class="text-sm sm:text-base">No hay balances calculados</p>
                </div>

                <div v-else class="space-y-6">
                    <!-- Tu resumen personal -->
                    <div 
                        v-if="balances[currentUser.id]"
                        class="relative overflow-hidden p-4 sm:p-6 bg-gradient-to-br from-lima-compartida/15 via-azul-claro-viaje/10 to-azul-tiquet/5 rounded-xl border-2 border-lima-compartida/30 shadow-lg"
                    >
                        <div class="absolute top-3 right-3 bg-lima-compartida text-gris-billetera px-3 py-1 rounded-full shadow-md">
                            <span class="text-xs font-bold tracking-wide">TU BALANCE</span>
                        </div>
                        
                        <div class="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 pr-20 sm:pr-0">
                            <div class="flex items-center gap-3">
                                <div class="w-14 h-14 bg-gradient-to-br from-azul-tiquet to-azul-claro-viaje rounded-full flex items-center justify-center text-blanco-dividido font-bold text-xl shadow-md">
                                    {{ getUserName(currentUser.id).charAt(0).toUpperCase() }}
                                </div>
                                <div class="min-w-0 flex-1">
                                    <h3 class="font-bold text-gris-billetera text-lg sm:text-xl truncate">{{ getUserName(currentUser.id) }}</h3>
                                    <p class="text-base sm:text-lg font-semibold break-words" :class="balances[currentUser.id].balance >= 0 ? 'text-azul-tiquet' : 'text-red-600'">
                                        {{ formatMoney(balances[currentUser.id].balance) }}
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                            <div class="bg-blanco-dividido/70 backdrop-blur-sm rounded-lg p-3 sm:p-4 text-center border border-azul-tiquet/10 hover:bg-blanco-dividido/90 transition-colors">
                                <p class="text-xs sm:text-sm text-gray-600 mb-1 font-medium">Has pagado</p>
                                <p class="font-bold text-azul-tiquet text-sm sm:text-base break-words">{{ formatMoney(balances[currentUser.id].totalSpent) }}</p>
                            </div>
                            <div class="bg-blanco-dividido/70 backdrop-blur-sm rounded-lg p-3 sm:p-4 text-center border border-lima-compartida/20 hover:bg-blanco-dividido/90 transition-colors">
                                <p class="text-xs sm:text-sm text-gray-600 mb-1 font-medium">Te deben</p>
                                <p class="font-bold text-lima-compartida text-sm sm:text-base break-words">{{ formatMoney(balances[currentUser.id].owedToThem) }}</p>
                            </div>
                            <div class="bg-blanco-dividido/70 backdrop-blur-sm rounded-lg p-3 sm:p-4 text-center border border-red-200 hover:bg-blanco-dividido/90 transition-colors">
                                <p class="text-xs sm:text-sm text-gray-600 mb-1 font-medium">Debes</p>
                                <p class="font-bold text-red-500 text-sm sm:text-base break-words">{{ formatMoney(balances[currentUser.id].owes) }}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Detalles de quién te debe dinero -->
                    <div v-if="peopleWhoOweMe.length > 0">
                        <h3 class="text-lg font-semibold text-gris-billetera mb-3 flex items-center gap-2">
                            💰 Te deben dinero <span class="text-sm font-normal text-gray-600">({{ peopleWhoOweMe.length }})</span>
                        </h3>
                        <div class="space-y-2">
                            <div 
                                v-for="debt in peopleWhoOweMe" 
                                :key="debt.userId"
                                class="flex items-center justify-between p-3 bg-lima-compartida/10 rounded-lg border border-lima-compartida/20"
                            >
                                <div class="flex items-center gap-3">
                                    <div class="w-8 h-8 bg-lima-compartida rounded-full flex items-center justify-center text-gris-billetera font-semibold text-sm">
                                        {{ getUserName(debt.userId).charAt(0).toUpperCase() }}
                                    </div>
                                    <div>
                                        <p class="font-medium text-gris-billetera">{{ getUserName(debt.userId) }}</p>
                                        <p class="text-xs text-gray-600">{{ debt.expenseCount }} gasto{{ debt.expenseCount !== 1 ? 's' : '' }}</p>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <p class="font-bold text-lima-compartida">{{ formatMoney(debt.amount) }}</p>
                                    <button 
                                        @click="sendReminder(debt.userId, debt.amount)"
                                        class="text-xs text-azul-tiquet hover:text-azul-claro-viaje transition-colors"
                                    >
                                        Recordar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Detalles de a quién le debes dinero -->
                    <div v-if="peopleIOwe.length > 0">
                        <h3 class="text-lg font-semibold text-gris-billetera mb-3 flex items-center gap-2">
                            💸 Debes dinero <span class="text-sm font-normal text-gray-600">({{ peopleIOwe.length }})</span>
                        </h3>
                        <div class="space-y-2">
                            <div 
                                v-for="debt in peopleIOwe" 
                                :key="debt.userId"
                                class="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200"
                            >
                                <div class="flex items-center gap-3">
                                    <div class="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-blanco-dividido font-semibold text-sm">
                                        {{ getUserName(debt.userId).charAt(0).toUpperCase() }}
                                    </div>
                                    <div>
                                        <p class="font-medium text-gris-billetera">{{ getUserName(debt.userId) }}</p>
                                        <p class="text-xs text-gray-600">{{ debt.expenseCount }} gasto{{ debt.expenseCount !== 1 ? 's' : '' }}</p>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <p class="font-bold text-red-600">{{ formatMoney(debt.amount) }}</p>
                                    <button 
                                        @click="payDebt(debt.userId, debt.amount)"
                                        class="text-xs bg-lima-compartida text-gris-billetera px-2 py-1 rounded hover:bg-azul-claro-viaje transition-colors"
                                    >
                                        Pagar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Mensaje cuando estás al día -->
                    <div v-if="peopleWhoOweMe.length === 0 && peopleIOwe.length === 0 && balances[currentUser.id]" class="text-center py-6">
                        <div class="text-4xl mb-2">✅</div>
                        <p class="text-gris-billetera font-medium">¡Estás al día con todos!</p>
                        <p class="text-sm text-gray-600">No tienes deudas pendientes</p>
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
const selectedPeriod = ref('month') // week, month, year, all

// Computed properties
const currentUser = computed(() => userStore.getCurrentUser)
const selectedDinero = computed(() => {
    const selectedDineroId = contextStore.getSelectedDineroId
    return selectedDineroId ? dineroStore.getDineroById(selectedDineroId) : null
})
const isLoading = computed(() => expenseStore.isLoading || userStore.isLoading || contextStore.isLoading || dineroStore.isLoading)

// Computed properties
const expenses = computed(() => {
    const periodExpenses = getExpensesByPeriod()
    console.log('Computing expenses for period:', selectedPeriod.value, 'Found:', periodExpenses.length)
    
    // Ordenar por fecha más reciente primero
    return [...periodExpenses].sort((a, b) => new Date(b.date) - new Date(a.date))
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

// Computed para estadísticas por categoría
const expensesByCategory = computed(() => {
    const categories = {}
    const filteredExpenses = getExpensesByPeriod()
    
    filteredExpenses.forEach(expense => {
        const category = expense.category || 'Sin categoría'
        if (!categories[category]) {
            categories[category] = {
                name: category,
                total: 0,
                count: 0,
                expenses: []
            }
        }
        categories[category].total += expense.amount
        categories[category].count += 1
        categories[category].expenses.push(expense)
    })
    
    // Ordenar por total gastado
    return Object.values(categories).sort((a, b) => b.total - a.total)
})

// Computed para alertas y notificaciones
const alertsData = computed(() => {
    const alerts = []
    
    // Alertas de pagos pendientes
    if (pendingPayments.value.length > 0) {
        const totalOwed = pendingPayments.value.reduce((sum, payment) => sum + payment.amount, 0)
        alerts.push({
            type: 'warning',
            icon: '⚠️',
            title: 'Pagos pendientes',
            message: `Tienes ${pendingPayments.value.length} pagos pendientes por un total de ${formatMoney(totalOwed)}`,
            action: 'Ver pagos'
        })
    }
    
    // Alerta si no hay gastos en el período
    const periodExpenses = getExpensesByPeriod()
    if (periodExpenses.length === 0 && selectedPeriod.value !== 'all') {
        alerts.push({
            type: 'info',
            icon: '📊',
            title: 'Sin actividad',
            message: `No hay gastos registrados en ${getPeriodLabel()}`,
            action: 'Añadir gasto'
        })
    }
    
    // Alerta si el balance está muy negativo
    if (userBalance.value < -100) {
        alerts.push({
            type: 'error',
            icon: '💸',
            title: 'Balance negativo alto',
            message: `Tu balance es ${formatMoney(userBalance.value)}. Considera saldar cuentas.`,
            action: 'Ver balances'
        })
    }
    
    return alerts
})

const hasAlerts = computed(() => alertsData.value.length > 0)

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

const getExpensesByPeriod = () => {
    const now = new Date()
    const selectedDineroId = contextStore.getSelectedDineroId
    
    if (!selectedDineroId) return []
    
    const allExpenses = expenseStore.getExpensesByDinero(selectedDineroId) || []
    
    if (selectedPeriod.value === 'all') {
        return allExpenses
    }
    
    return allExpenses.filter(expense => {
        const expenseDate = new Date(expense.date)
        
        switch (selectedPeriod.value) {
            case 'week':
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                return expenseDate >= weekAgo
            case 'month':
                const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
                return expenseDate >= monthAgo
            case 'year':
                const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
                return expenseDate >= yearAgo
            default:
                return true
        }
    })
}

const getPeriodLabel = () => {
    switch (selectedPeriod.value) {
        case 'week': return 'esta semana'
        case 'month': return 'este mes'
        case 'year': return 'este año'
        case 'all': return 'todo el tiempo'
        default: return 'el período seleccionado'
    }
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

const sendReminder = async (userId, amount) => {
    const userName = getUserName(userId)
    alertStore.info(`Recordatorio enviado a ${userName} por ${formatMoney(amount)}`)
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
    console.log('Dashboard: Loading data...')
    
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
        
        // 4. Cargar y migrar gastos
        console.log('4. Loading and migrating expenses...')
        if (expenseStore.expenses.length === 0) {
            await expenseStore.initializeExpenses()
        }
        
        console.log('Dashboard: Data loaded. Selected dinero:', contextStore.getSelectedDineroId)
        console.log('Total expenses in store:', expenseStore.getAllExpenses.length)
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

// Watcher para el período seleccionado
watch(selectedPeriod, (newPeriod, oldPeriod) => {
    console.log('Period changed from', oldPeriod, 'to', newPeriod)
    // Los computed se actualizarán automáticamente
})

console.log('dashboard')
</script>