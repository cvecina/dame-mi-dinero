<template>
    <div class="min-h-screen bg-[#FAFAFA] p-4">
        <!-- Loading state -->
        <div v-if="isLoading" class="flex items-center justify-center py-20">
            <div class="text-center">
                <div class="w-16 h-16 border-4 border-[#2BAE66] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p class="text-[#2E2E2E] font-medium">Cargando usuarios...</p>
            </div>
        </div>

        <!-- Main content -->
        <div v-else>
            <!-- Header -->
            <div class="flex items-center justify-between mb-8">
                <div>
                    <h1 class="text-3xl font-bold text-[#2E2E2E] mb-2">Gestión de usuarios</h1>
                    <p class="text-gray-600">Administra los usuarios del grupo</p>
                </div>
                <button 
                    @click="showAddUserModal = true"
                    :disabled="userStore.isLoading"
                    class="bg-[#2BAE66] hover:bg-[#4DA1FF] text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 disabled:opacity-50"
                >
                    <span class="text-xl">+</span>
                    Añadir usuario
                </button>
            </div>

        <!-- Lista de usuarios -->
        <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-semibold text-[#2E2E2E] mb-6">
                {{ users.length }} usuario{{ users.length !== 1 ? 's' : '' }} en el grupo
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div 
                    v-for="user in users" 
                    :key="user.id"
                    class="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
                >
                    <!-- Avatar y nombre -->
                    <div class="flex items-center gap-4 mb-4">
                        <div class="w-16 h-16 bg-[#2BAE66] rounded-full flex items-center justify-center text-white text-xl font-bold">
                            {{ user.name.charAt(0).toUpperCase() }}
                        </div>
                        <div>
                            <h3 class="text-lg font-semibold text-[#2E2E2E]">{{ user.name }}</h3>
                            <span 
                                v-if="user.id === currentUser.id" 
                                class="inline-block mt-1 px-2 py-1 text-xs font-medium bg-[#2BAE66]/10 text-[#2BAE66] rounded-full"
                            >
                                Tú
                            </span>
                        </div>
                    </div>

                    <!-- Estadísticas del usuario -->
                    <div class="space-y-3 mb-4">
                        <div class="flex justify-between items-center">
                            <span class="text-sm text-gray-600">Balance actual</span>
                            <span 
                                class="font-semibold"
                                :class="getUserBalance(user.id) >= 0 ? 'text-[#2BAE66]' : 'text-[#FF6B6B]'"
                            >
                                {{ formatMoney(getUserBalance(user.id)) }}
                            </span>
                        </div>
                        
                        <div class="flex justify-between items-center">
                            <span class="text-sm text-gray-600">Total pagado</span>
                            <span class="font-semibold text-[#2E2E2E]">
                                {{ formatMoney(getUserTotalPaid(user.id)) }}
                            </span>
                        </div>
                        
                        <div class="flex justify-between items-center">
                            <span class="text-sm text-gray-600">Gastos participados</span>
                            <span class="font-semibold text-[#4DA1FF]">
                                {{ getUserExpenseCount(user.id) }}
                            </span>
                        </div>
                    </div>

                    <!-- Acciones -->
                    <div class="flex gap-2">
                        <button 
                            @click="setAsCurrentUser(user)"
                            :disabled="user.id === currentUser.id"
                            class="flex-1 px-3 py-2 text-sm bg-[#4DA1FF]/10 text-[#4DA1FF] rounded-lg hover:bg-[#4DA1FF]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {{ user.id === currentUser.id ? 'Usuario actual' : 'Cambiar a este usuario' }}
                        </button>
                        <button 
                            v-if="user.id !== currentUser.id"
                            @click="deleteUser(user.id)"
                            class="px-3 py-2 text-sm text-[#FF6B6B] hover:bg-[#FF6B6B]/10 rounded-lg transition-colors"
                        >
                            Eliminar
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
