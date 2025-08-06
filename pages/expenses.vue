<template>
    <div class="min-h-screen bg-marfil-mapamundi p-3 sm:p-4 lg:p-6">
        <!-- Loading state -->
        <div v-if="isLoading" class="flex items-center justify-center py-20">
            <div class="text-center">
                <div class="w-16 h-16 border-4 border-azul-tiquet border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p class="text-gris-billetera font-medium">Cargando gastos...</p>
            </div>
        </div>

        <!-- Mensaje cuando no hay usuario seleccionado -->
        <div v-else-if="!currentUser" class="flex items-center justify-center py-20">
            <div class="text-center">
                <div class="text-6xl mb-4">💸</div>
                <h2 class="text-xl font-semibold text-gris-billetera mb-2">Selecciona tu usuario</h2>
                <p class="text-gray-600">Necesitas seleccionar un usuario para ver los gastos</p>
            </div>
        </div>

        <!-- Main content -->
        <div v-else>
            <!-- Header -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4 sm:gap-0">
                <div>
                    <h1 class="text-2xl sm:text-3xl font-bold text-gris-billetera mb-2">Todos los gastos</h1>
                    <p class="text-sm sm:text-base text-gray-600">Historial completo de gastos compartidos</p>
                </div>
                <button 
                    @click="showAddExpenseModal = true"
                    :disabled="expenseStore.isLoading || !currentUser"
                    class="w-full sm:w-auto bg-lima-compartida hover:bg-azul-claro-viaje text-gris-billetera px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center sm:justify-start gap-2 disabled:opacity-50"
                >
                    <span class="text-xl">+</span>
                    Nuevo gasto
                </button>
            </div>

        <!-- Filtros -->
        <div class="bg-blanco-dividido rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
            <h2 class="text-base sm:text-lg font-semibold text-gris-billetera mb-4">Filtros</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <!-- Filtro por categoría -->
                <div>
                    <label class="block text-sm font-medium text-gris-billetera mb-2">Categoría</label>
                    <select
                        v-model="filters.category"
                        class="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-azul-tiquet focus:border-transparent"
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
                    <label class="block text-sm font-medium text-gris-billetera mb-2">Usuario</label>
                    <select
                        v-model="filters.user"
                        class="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-azul-tiquet focus:border-transparent"
                    >
                        <option value="">Todos los usuarios</option>
                        <option v-for="user in users" :key="user.id" :value="user.id">
                            {{ user.name }}
                        </option>
                    </select>
                </div>

                <!-- Ordenar por -->
                <div class="sm:col-span-2 lg:col-span-1">
                    <label class="block text-sm font-medium text-gris-billetera mb-2">Ordenar por</label>
                    <select
                        v-model="filters.sortBy"
                        class="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-azul-tiquet focus:border-transparent"
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
        <div class="bg-blanco-dividido rounded-lg shadow-md p-4 sm:p-6">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2 sm:gap-0">
                <h2 class="text-lg sm:text-xl font-semibold text-gris-billetera">
                    {{ filteredExpenses.length }} gasto{{ filteredExpenses.length !== 1 ? 's' : '' }}
                </h2>
                <div class="text-sm text-gray-600">
                    Total: {{ formatMoney(totalFilteredAmount) }}
                </div>
            </div>

            <div v-if="filteredExpenses.length === 0" class="text-center py-12 text-gray-500">
                <div class="text-4xl sm:text-6xl mb-4">💸</div>
                <p class="text-base sm:text-lg">No hay gastos que coincidan con los filtros</p>
            </div>

            <div v-else class="space-y-3 sm:space-y-4">
                <div 
                    v-for="expense in filteredExpenses" 
                    :key="expense.id"
                    class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                >
                    <div class="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <!-- Información principal -->
                        <div class="flex-1">
                            <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                                <h3 class="text-base sm:text-lg font-semibold text-gris-billetera">{{ expense.title }}</h3>
                                <span class="px-2 py-1 text-xs font-medium bg-azul-claro-viaje/10 text-azul-tiquet rounded-full w-fit">
                                    {{ expense.category }}
                                </span>
                            </div>
                            
                            <div class="space-y-1 text-xs sm:text-sm text-gray-600 mb-3">
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

                            <!-- Estado de pagos individuales -->
                            <div class="mt-3">
                                <p class="text-xs sm:text-sm font-medium text-gris-billetera mb-2">
                                    Estado de pagos:
                                </p>
                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <div 
                                        v-for="participant in expense.participants" 
                                        :key="participant"
                                        class="flex flex-col sm:flex-row sm:items-center justify-between py-2 px-3 bg-gray-50 rounded-lg gap-2 sm:gap-0"
                                    >
                                        <div class="flex items-center gap-2">
                                            <div class="w-6 h-6 bg-azul-tiquet rounded-full flex items-center justify-center text-blanco-dividido text-xs font-semibold">
                                                {{ getUserName(participant).charAt(0).toUpperCase() }}
                                            </div>
                                            <span class="text-xs sm:text-sm font-medium">{{ getUserName(participant) }}</span>
                                            <span class="text-xs text-gray-600">
                                                ({{ formatMoney(getUserAmountInExpense(expense, participant)) }})
                                            </span>
                                        </div>
                                        
                                        <button
                                            v-if="participant !== expense.paidBy"
                                            @click="togglePaymentStatus(expense.id, participant)"
                                            :class="[
                                                'px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap',
                                                getUserPaymentStatus(expense.id, participant) 
                                                    ? 'bg-lima-compartida text-gris-billetera hover:bg-azul-claro-viaje' 
                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            ]"
                                        >
                                            {{ getUserPaymentStatus(expense.id, participant) ? '✓ Pagado' : 'Marcar como pagado' }}
                                        </button>
                                        
                                        <!-- Indicador para quien pagó originalmente -->
                                        <div
                                            v-else
                                            class="px-3 py-1 rounded-full text-xs font-medium bg-azul-tiquet text-blanco-dividido"
                                        >
                                            💳 Pagó originalmente
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Cantidad total -->
                        <div class="text-left lg:text-right lg:ml-4 pt-3 lg:pt-0 border-t lg:border-t-0">
                            <p class="text-xl sm:text-2xl font-bold text-azul-tiquet">{{ formatMoney(expense.amount) }}</p>
                            <button 
                                @click="deleteExpense(expense.id)"
                                class="mt-2 text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
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
const currentUser = computed(() => userStore.getCurrentUser)
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
