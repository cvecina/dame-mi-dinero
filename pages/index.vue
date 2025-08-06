<template>
    <div class="min-h-screen bg-[#FAFAFA] p-4">
        <!-- Loading state -->
        <div v-if="isLoading" class="flex items-center justify-center py-20">
            <div class="text-center">
                <div class="w-16 h-16 border-4 border-[#2BAE66] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p class="text-[#2E2E2E] font-medium">Cargando datos...</p>
            </div>
        </div>

        <!-- Main content -->
        <div v-else>
            <!-- Header -->
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-[#2E2E2E] mb-2">Dame mi dinero</h1>
                <p class="text-gray-600">Controla tus gastos compartidos con amigos</p>
            </div>

            <!-- Resumen de balances -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#2BAE66]">
                    <h3 class="text-lg font-semibold text-[#2E2E2E] mb-2">Total gastado</h3>
                    <p class="text-2xl font-bold text-[#2BAE66]">{{ formatMoney(totalExpenses) }}</p>
                </div>
                
                <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#FF6B6B]">
                    <h3 class="text-lg font-semibold text-[#2E2E2E] mb-2">Tu balance</h3>
                    <p class="text-2xl font-bold" :class="userBalance >= 0 ? 'text-[#2BAE66]' : 'text-[#FF6B6B]'">
                        {{ formatMoney(userBalance) }}
                    </p>
                </div>
                
                <div class="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#4DA1FF]">
                    <h3 class="text-lg font-semibold text-[#2E2E2E] mb-2">Gastos este mes</h3>
                    <p class="text-2xl font-bold text-[#4DA1FF]">{{ expenses.length }}</p>
                </div>
            </div>

            <!-- Botón para añadir gasto -->
            <div class="mb-6">
                <button 
                    @click="showAddExpenseModal = true"
                    :disabled="expenseStore.isLoading"
                    class="bg-[#2BAE66] hover:bg-[#4DA1FF] text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 disabled:opacity-50"
                >
                    <span class="text-xl">+</span>
                    Añadir gasto
                </button>
            </div>

            <!-- Lista de gastos recientes -->
            <div class="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 class="text-xl font-semibold text-[#2E2E2E] mb-4">Gastos recientes</h2>
                
                <div v-if="expenses.length === 0" class="text-center py-8 text-gray-500">
                    <div class="text-4xl mb-2">💸</div>
                    <p>No hay gastos registrados</p>
                    <button 
                        @click="showAddExpenseModal = true"
                        class="mt-3 text-[#2BAE66] hover:text-[#4DA1FF] font-medium"
                    >
                        Crear tu primer gasto
                    </button>
                </div>
                
                <div v-else class="space-y-4">
                    <div 
                        v-for="expense in expenses.slice(0, 5)" 
                        :key="expense.id"
                        class="flex items-center justify-between p-4 bg-[#F4E9D8] rounded-lg hover:bg-[#4DA1FF]/10 transition-colors duration-200"
                    >
                        <div class="flex-1">
                            <h3 class="font-medium text-[#2E2E2E]">{{ expense.title }}</h3>
                            <p class="text-sm text-gray-600">
                                Pagado por {{ getUserName(expense.paidBy) }} • {{ formatDate(expense.date) }}
                            </p>
                            <p class="text-xs text-gray-500">{{ expense.category }}</p>
                        </div>
                        <div class="text-right">
                            <p class="text-lg font-semibold text-[#2E2E2E]">{{ formatMoney(expense.amount) }}</p>
                            <p class="text-sm text-gray-600">{{ expense.participants.length }} participantes</p>
                        </div>
                    </div>
                    
                    <!-- Ver todos los gastos -->
                    <div v-if="expenses.length > 5" class="text-center pt-4">
                        <NuxtLink 
                            to="/expenses"
                            class="text-[#2BAE66] hover:text-[#4DA1FF] font-medium transition-colors"
                        >
                            Ver todos los gastos ({{ expenses.length }})
                        </NuxtLink>
                    </div>
                </div>
            </div>

            <!-- Balances por usuario -->
            <div class="bg-white rounded-lg shadow-md p-6">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-xl font-semibold text-[#2E2E2E]">Balance por usuario</h2>
                    <NuxtLink 
                        to="/balances"
                        class="text-[#2BAE66] hover:text-[#4DA1FF] text-sm font-medium transition-colors"
                    >
                        Ver liquidaciones
                    </NuxtLink>
                </div>
                
                <div v-if="Object.keys(balances).length === 0" class="text-center py-8 text-gray-500">
                    <div class="text-4xl mb-2">👥</div>
                    <p>No hay usuarios registrados</p>
                    <NuxtLink 
                        to="/users"
                        class="mt-3 inline-block text-[#2BAE66] hover:text-[#4DA1FF] font-medium"
                    >
                        Gestionar usuarios
                    </NuxtLink>
                </div>

                <div v-else class="space-y-3">
                    <div 
                        v-for="(balance, userId) in balances" 
                        :key="userId"
                        class="flex items-center justify-between p-3 bg-[#F4E9D8] rounded-lg"
                    >
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-[#2BAE66] rounded-full flex items-center justify-center text-white font-semibold">
                                {{ getUserName(parseInt(userId)).charAt(0).toUpperCase() }}
                            </div>
                            <div>
                                <span class="font-medium text-[#2E2E2E]">{{ getUserName(parseInt(userId)) }}</span>
                                <span v-if="parseInt(userId) === currentUser?.id" class="ml-2 text-xs px-2 py-1 bg-[#2BAE66]/10 text-[#2BAE66] rounded-full">
                                    Tú
                                </span>
                            </div>
                        </div>
                        <div class="text-right">
                            <p class="font-semibold" :class="balance.balance >= 0 ? 'text-[#2BAE66]' : 'text-[#FF6B6B]'">
                                {{ formatMoney(balance.balance) }}
                            </p>
                            <p class="text-xs text-gray-500">
                                Pagó {{ formatMoney(balance.paid) }} • Debe {{ formatMoney(balance.owes) }}
                            </p>
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

// Stores
const expenseStore = useExpenseStore()
const userStore = useUserStore()
const alertStore = useAlertStore()

// Reactive data
const showAddExpenseModal = ref(false)

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

// Cargar datos al montar el componente
onMounted(async () => {
    try {
        // Si no hay usuarios, esperar a que se inicialicen
        if (userStore.users.length === 0) {
            await userStore.initializeUsers()
        }
        if (expenseStore.expenses.length === 0) {
            await expenseStore.initializeExpenses()
        }
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

console.log('dashboard')
</script>