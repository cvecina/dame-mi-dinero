<template>
    <div class="min-h-screen bg-marfil-mapamundi p-3 sm:p-4 lg:p-6">
        <!-- Loading state -->
        <div v-if="isLoading" class="flex items-center justify-center py-20">
            <div class="text-center">
                <div class="w-16 h-16 border-4 border-azul-tiquet border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p class="text-gris-billetera font-medium">Cargando usuarios...</p>
            </div>
        </div>

        <!-- Main content - La página de usuarios siempre se muestra -->
        <div v-else class="max-w-7xl mx-auto">
            <!-- Header -->
            <div class="mb-8">
                <div class="bg-gradient-to-r from-azul-tiquet to-azul-claro-viaje rounded-2xl p-6 text-blanco-dividido shadow-xl">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 class="text-2xl sm:text-3xl font-bold mb-2">Gestión de usuarios</h1>
                            <p class="text-azul-claro-viaje/90 text-sm sm:text-base">
                                Administra los usuarios del grupo y sus permisos
                            </p>
                        </div>
                        <div class="flex items-center gap-3">
                            <div class="bg-blanco-dividido/20 backdrop-blur-sm rounded-lg px-4 py-2">
                                <p class="text-xs opacity-80">Total usuarios</p>
                                <p class="text-xl font-bold">{{ users.length }}</p>
                            </div>
                            <button 
                                @click="showAddUserModal = true"
                                :disabled="userStore.isLoading"
                                class="px-4 py-3 bg-gradient-to-r from-lima-compartida to-lima-compartida/80 text-gris-billetera text-sm font-semibold rounded-xl hover:from-lima-compartida/90 hover:to-lima-compartida/70 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
                            >
                                <span class="text-sm">+</span>
                                Añadir usuario
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Lista de usuarios -->
            <div class="bg-blanco-dividido rounded-2xl shadow-lg p-6 border border-azul-claro-viaje/20">
                <div class="flex items-center gap-3 mb-6">
                    <div class="w-8 h-8 bg-azul-tiquet/10 rounded-lg flex items-center justify-center">
                        <span class="text-azul-tiquet">👥</span>
                    </div>
                    <h2 class="text-xl font-semibold text-gris-billetera">
                        {{ users.length }} usuario{{ users.length !== 1 ? 's' : '' }} en el grupo
                    </h2>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div 
                        v-for="user in users" 
                        :key="user.id"
                        class="border-2 border-azul-claro-viaje/20 rounded-2xl p-6 hover:shadow-lg hover:border-azul-claro-viaje/40 transition-all duration-300 transform hover:-translate-y-1"
                        :class="{ 'ring-2 ring-lima-compartida/50 border-lima-compartida/40': user.id === currentUser.id }"
                    >
                        <!-- Avatar y nombre -->
                        <div class="flex items-center gap-4 mb-6">
                            <div class="w-16 h-16 bg-gradient-to-br from-azul-tiquet to-azul-claro-viaje rounded-full flex items-center justify-center text-blanco-dividido text-xl font-bold shadow-lg">
                                {{ user.name.charAt(0).toUpperCase() }}
                            </div>
                            <div class="flex-1">
                                <h3 class="text-lg font-semibold text-gris-billetera">{{ user.name }}</h3>
                                <span 
                                    v-if="user.id === currentUser.id" 
                                    class="inline-block mt-1 px-3 py-1 text-xs font-bold bg-lima-compartida text-gris-billetera rounded-full shadow-sm"
                                >
                                    🌟 Usuario actual
                                </span>
                                <span v-else class="text-sm text-gray-600">Miembro del grupo</span>
                            </div>
                        </div>

                        <!-- Estadísticas del usuario -->
                        <div class="space-y-4 mb-6">
                            <div class="bg-marfil-mapamundi rounded-xl p-4">
                                <div class="flex justify-between items-center mb-2">
                                    <span class="text-sm text-gray-600 font-medium">Balance actual</span>
                                    <span 
                                        class="text-lg font-bold"
                                        :class="getUserBalance(user.id) >= 0 ? 'text-lima-compartida' : 'text-red-500'"
                                    >
                                        {{ formatMoney(getUserBalance(user.id)) }}
                                    </span>
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-2 gap-3">
                                <div class="bg-azul-claro-viaje/10 rounded-lg p-3 text-center">
                                    <p class="text-xs text-gray-600 mb-1">Total pagado</p>
                                    <p class="text-sm font-bold text-azul-tiquet">
                                        {{ formatMoney(getUserTotalPaid(user.id)) }}
                                    </p>
                                </div>
                                
                                <div class="bg-lima-compartida/10 rounded-lg p-3 text-center">
                                    <p class="text-xs text-gray-600 mb-1">Gastos</p>
                                    <p class="text-sm font-bold text-lima-compartida">
                                        {{ getUserExpenseCount(user.id) }}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Acciones -->
                        <div class="flex gap-2">
                            <button 
                                @click="setAsCurrentUser(user)"
                                :disabled="user.id === currentUser.id"
                                class="flex-1 px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200"
                                :class="user.id === currentUser.id 
                                    ? 'bg-lima-compartida/20 text-lima-compartida cursor-not-allowed' 
                                    : 'bg-azul-claro-viaje/10 text-azul-tiquet hover:bg-azul-claro-viaje/20 hover:shadow-sm transform hover:-translate-y-0.5'"
                            >
                                {{ user.id === currentUser.id ? '✓ Usuario actual' : '🔄 Cambiar usuario' }}
                            </button>
                            <button 
                                v-if="user.id !== currentUser.id"
                                @click="deleteUser(user.id)"
                                class="px-3 py-2 text-sm text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200 hover:shadow-sm transform hover:-translate-y-0.5"
                            >
                                🗑️
                            </button>
                        </div>
                </div>
            </div>
        </div>

        <!-- Modal para añadir usuario -->
        <div v-if="showAddUserModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
                <!-- Header -->
                <div class="flex items-center justify-between p-6 border-b">
                    <h2 class="text-xl font-semibold text-[#2E2E2E]">Añadir nuevo usuario</h2>
                    <button 
                        @click="showAddUserModal = false"
                        class="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                <!-- Form -->
                <form @submit.prevent="addUser" class="p-6 space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-[#2E2E2E] mb-2">
                            Nombre completo
                        </label>
                        <input
                            v-model="newUser.name"
                            type="text"
                            required
                            placeholder="Ej: Juan Pérez"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2BAE66] focus:border-transparent"
                        >
                    </div>

                    <div class="flex gap-3 pt-4">
                        <button
                            type="button"
                            @click="showAddUserModal = false"
                            class="flex-1 px-4 py-2 text-[#2E2E2E] border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            class="flex-1 px-4 py-2 bg-[#2BAE66] text-white rounded-lg hover:bg-[#4DA1FF] transition-colors"
                        >
                            Añadir usuario
                        </button>
                    </div>
                </form>
            </div>
        </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '~/stores/user.store'
import { useExpenseStore } from '~/stores/expense.store'
import { useAlertStore } from '~/stores/alert.store'

// Stores
const userStore = useUserStore()
const expenseStore = useExpenseStore()
const alertStore = useAlertStore()

// Reactive data
const showAddUserModal = ref(false)
const newUser = ref({
    name: ''
})

// Computed properties
const users = computed(() => userStore.getAllUsers)
const currentUser = computed(() => userStore.getCurrentUser)
const balances = computed(() => expenseStore.getBalances)
const isLoading = computed(() => userStore.isLoading || expenseStore.isLoading)

// Methods
const getUserBalance = (userId) => {
    const userBalances = balances.value[userId]
    return userBalances ? userBalances.balance : 0
}

const getUserTotalPaid = (userId) => {
    const userBalances = balances.value[userId]
    return userBalances ? userBalances.paid : 0
}

const getUserExpenseCount = (userId) => {
    return expenseStore.getExpensesByUser(userId).length
}

const formatMoney = (amount) => {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
    }).format(amount)
}

const addUser = async () => {
    if (!newUser.value.name.trim()) {
        alertStore.error('Por favor, introduce un nombre')
        return
    }

    try {
        await userStore.addUser({
            name: newUser.value.name.trim()
        })

        // Resetear formulario
        newUser.value = { name: '' }
        showAddUserModal.value = false
        alertStore.success('Usuario añadido correctamente')
        console.log('addUser')
    } catch (error) {
        console.error('Error al añadir usuario:', error)
        alertStore.error('Error al añadir usuario: ' + (error.data?.message || error.message))
    }
}

const deleteUser = async (userId) => {
    // Verificar si el usuario tiene gastos asociados
    const userExpenses = expenseStore.getExpensesByUser(userId)
    if (userExpenses.length > 0) {
        alertStore.error('No se puede eliminar el usuario porque tiene gastos asociados')
        return
    }

    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
        try {
            await userStore.deleteUser(userId)
            alertStore.success('Usuario eliminado correctamente')
        } catch (error) {
            console.error('Error al eliminar usuario:', error)
            alertStore.error('Error al eliminar usuario: ' + (error.data?.message || error.message))
        }
    }
    console.log('deleteUser')
}

const setAsCurrentUser = (user) => {
    userStore.setCurrentUser(user)
    alertStore.success(`Cambiado a ${user.name}`)
    console.log('setAsCurrentUser')
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

console.log('users-page')
</script>
