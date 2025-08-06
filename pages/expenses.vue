<template>
    <div class="min-h-screen bg-[#FAFAFA] p-4">
        <!-- Loading state -->
        <div v-if="isLoading" class="flex items-center justify-center py-20">
            <div class="text-center">
                <div class="w-16 h-16 border-4 border-[#2BAE66] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p class="text-[#2E2E2E] font-medium">Cargando gastos...</p>
            </div>
        </div>

        <!-- Main content -->
        <div v-else>
            <!-- Header -->
            <div class="flex items-center justify-between mb-8">
                <div>
                    <h1 class="text-3xl font-bold text-[#2E2E2E] mb-2">Todos los gastos</h1>
                    <p class="text-gray-600">Historial completo de gastos compartidos</p>
                </div>
                <button 
                    @click="showAddExpenseModal = true"
                    :disabled="expenseStore.isLoading"
                    class="bg-[#2BAE66] hover:bg-[#4DA1FF] text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 disabled:opacity-50"
                >
                    <span class="text-xl">+</span>
                    Nuevo gasto
                </button>
            </div>

        <!-- Filtros -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 class="text-lg font-semibold text-[#2E2E2E] mb-4">Filtros</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <!-- Filtro por categoría -->
                <div>
                    <label class="block text-sm font-medium text-[#2E2E2E] mb-2">Categoría</label>
                    <select
                        v-model="filters.category"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2BAE66] focus:border-transparent"
                    >
                        <option value="">Todas las categorías</option>
                        <option value="Comida">Comida</option>
                        <option value="Transporte">Transporte</option>
                        <option value="Alojamiento">Alojamiento</option>
                        <option value="Entretenimiento">Entretenimiento</option>
                        <option value="Compras">Compras</option>
                        <option value="Otros">Otros</option>
                    </select>
                </div>

                <!-- Filtro por usuario -->
                <div>
                    <label class="block text-sm font-medium text-[#2E2E2E] mb-2">Usuario</label>
                    <select
                        v-model="filters.user"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2BAE66] focus:border-transparent"
                    >
                        <option value="">Todos los usuarios</option>
                        <option v-for="user in users" :key="user.id" :value="user.id">
                            {{ user.name }}
                        </option>
                    </select>
                </div>

                <!-- Ordenar por -->
                <div>
                    <label class="block text-sm font-medium text-[#2E2E2E] mb-2">Ordenar por</label>
                    <select
                        v-model="filters.sortBy"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2BAE66] focus:border-transparent"
                    >
                        <option value="date-desc">Fecha (más reciente)</option>
                        <option value="date-asc">Fecha (más antiguo)</option>
                        <option value="amount-desc">Cantidad (mayor)</option>
                        <option value="amount-asc">Cantidad (menor)</option>
                    </select>
                </div>
            </div>
        </div>

        <!-- Lista de gastos -->
        <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-xl font-semibold text-[#2E2E2E]">
                    {{ filteredExpenses.length }} gasto{{ filteredExpenses.length !== 1 ? 's' : '' }}
                </h2>
                <div class="text-sm text-gray-600">
                    Total: {{ formatMoney(totalFilteredAmount) }}
                </div>
            </div>

            <div v-if="filteredExpenses.length === 0" class="text-center py-12 text-gray-500">
                <div class="text-6xl mb-4">💸</div>
                <p class="text-lg">No hay gastos que coincidan con los filtros</p>
            </div>

            <div v-else class="space-y-4">
                <div 
                    v-for="expense in filteredExpenses" 
                    :key="expense.id"
                    class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                >
                    <div class="flex items-start justify-between">
                        <!-- Información principal -->
                        <div class="flex-1">
                            <div class="flex items-center gap-3 mb-2">
                                <h3 class="text-lg font-semibold text-[#2E2E2E]">{{ expense.title }}</h3>
                                <span class="px-2 py-1 text-xs font-medium bg-[#4DA1FF]/10 text-[#4DA1FF] rounded-full">
                                    {{ expense.category }}
                                </span>
                            </div>
                            
                            <div class="space-y-1 text-sm text-gray-600 mb-3">
                                <p>
                                    <span class="font-medium">Pagado por:</span> 
                                    {{ getUserName(expense.paidBy) }}
                                </p>
                                <p>
                                    <span class="font-medium">Fecha:</span> 
                                    {{ formatDate(expense.date) }}
                                </p>
                                <p v-if="expense.description">
                                    <span class="font-medium">Descripción:</span> 
                                    {{ expense.description }}
                                </p>
                            </div>

                            <!-- Participantes y división -->
                            <div class="mt-3">
                                <p class="text-sm font-medium text-[#2E2E2E] mb-2">
                                    División entre {{ expense.participants.length }} participantes:
                                </p>
                                <div class="flex flex-wrap gap-2 mb-3">
                                    <div 
                                        v-for="split in expense.splits" 
                                        :key="split.userId"
                                        class="bg-[#F4E9D8] px-3 py-1 rounded-full text-sm"
                                    >
                                        {{ getUserName(split.userId) }}: {{ formatMoney(split.amount) }}
                                    </div>
                                </div>

                                <!-- Estado de pagos individuales -->
                                <div class="border-t pt-3">
                                    <p class="text-sm font-medium text-[#2E2E2E] mb-2">
                                        Estado de pagos:
                                    </p>
                                    <div class="space-y-2">
                                        <div 
                                            v-for="participant in expense.participants" 
                                            :key="participant"
                                            class="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
                                        >
                                            <div class="flex items-center gap-2">
                                                <div class="w-6 h-6 bg-[#2BAE66] rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                                    {{ getUserName(participant).charAt(0).toUpperCase() }}
                                                </div>
                                                <span class="text-sm font-medium">{{ getUserName(participant) }}</span>
                                                <span class="text-xs text-gray-600">
                                                    ({{ formatMoney(getUserAmountInExpense(expense, participant)) }})
                                                </span>
                                            </div>
                                            
                                            <button
                                                @click="togglePaymentStatus(expense.id, participant)"
                                                :class="[
                                                    'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                                                    getUserPaymentStatus(expense.id, participant) 
                                                        ? 'bg-[#2BAE66] text-white hover:bg-green-600' 
                                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                ]"
                                            >
                                                {{ getUserPaymentStatus(expense.id, participant) ? '✓ Pagado' : 'Marcar como pagado' }}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Cantidad total -->
                        <div class="text-right ml-4">
                            <p class="text-2xl font-bold text-[#2BAE66]">{{ formatMoney(expense.amount) }}</p>
                            <button 
                                @click="deleteExpense(expense.id)"
                                class="mt-2 text-[#FF6B6B] hover:text-red-700 text-sm font-medium transition-colors"
                            >
                                Eliminar
                            </button>
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
import { ref, computed, onMounted } from 'vue'
import { useExpenseStore } from '~/stores/expense.store'
import { useUserStore } from '~/stores/user.store'
import { useAlertStore } from '~/stores/alert.store'

// Stores
const expenseStore = useExpenseStore()
const userStore = useUserStore()
const alertStore = useAlertStore()

// Reactive data
const showAddExpenseModal = ref(false)
const filters = ref({
    category: '',
    user: '',
    sortBy: 'date-desc'
})

// Computed properties
const expenses = computed(() => expenseStore.getAllExpenses)
const users = computed(() => userStore.getAllUsers)
const isLoading = computed(() => expenseStore.isLoading || userStore.isLoading)

const filteredExpenses = computed(() => {
    let filtered = [...expenses.value]

    // Filtrar por categoría
    if (filters.value.category) {
        filtered = filtered.filter(expense => expense.category === filters.value.category)
    }

    // Filtrar por usuario
    if (filters.value.user) {
        filtered = filtered.filter(expense => 
            expense.paidBy === filters.value.user || 
            expense.participants.includes(filters.value.user)
        )
    }

    // Ordenar
    filtered.sort((a, b) => {
        switch (filters.value.sortBy) {
            case 'date-desc':
                return new Date(b.date) - new Date(a.date)
            case 'date-asc':
                return new Date(a.date) - new Date(b.date)
            case 'amount-desc':
                return b.amount - a.amount
            case 'amount-asc':
                return a.amount - b.amount
            default:
                return 0
        }
    })

    console.log('filteredExpenses')
    return filtered
})

const totalFilteredAmount = computed(() => {
    return filteredExpenses.value.reduce((total, expense) => total + expense.amount, 0)
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
        month: 'long',
        year: 'numeric'
    })
}

const deleteExpense = async (expenseId) => {
    if (confirm('¿Estás seguro de que quieres eliminar este gasto?')) {
        try {
            await expenseStore.deleteExpense(expenseId)
            alertStore.success('Gasto eliminado correctamente')
        } catch (error) {
            console.error('Error al eliminar gasto:', error)
            alertStore.error('Error al eliminar gasto: ' + (error.data?.message || error.message))
        }
    }
    console.log('deleteExpense')
}

const togglePaymentStatus = async (expenseId, userId) => {
    try {
        const currentStatus = expenseStore.getUserPaymentStatus(expenseId, userId)
        await expenseStore.markUserPayment(expenseId, userId, !currentStatus)
        
        const userName = getUserName(userId)
        if (!currentStatus) {
            alertStore.success(`${userName} marcado como pagado`)
        } else {
            alertStore.info(`Pago de ${userName} desmarcado`)
        }
    } catch (error) {
        console.error('Error al marcar pago:', error)
        alertStore.error('Error al actualizar estado de pago: ' + (error.message || 'Error desconocido'))
    }
}

const getUserPaymentStatus = (expenseId, userId) => {
    return expenseStore.getUserPaymentStatus(expenseId, userId)
}

const getUserAmountInExpense = (expense, userId) => {
    const split = expense.splits?.find(s => s.userId === userId)
    return split ? split.amount : 0
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
        // Asegurar que tenemos usuarios y gastos actualizados
        await userStore.fetchUsers()
        await expenseStore.fetchExpenses()
    } catch (error) {
        console.error('Error al cargar datos:', error)
        alertStore.error('Error al cargar los datos')
    }
})

console.log('expenses-page')
</script>
