<template>
    <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
        <div class="bg-blanco-dividido rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto border border-azul-claro-viaje/20">
            <!-- Header -->
            <div class="flex items-center justify-between p-6 border-b border-azul-claro-viaje/20 bg-gradient-to-r from-azul-tiquet/5 to-azul-claro-viaje/5">
                <div>
                    <h2 class="text-xl font-bold text-gris-billetera flex items-center gap-2">
                        <span class="text-azul-tiquet">💰</span>
                        Añadir nuevo gasto
                    </h2>
                    <div v-if="selectedDinero" class="flex items-center gap-2 mt-2">
                        <div 
                            class="w-3 h-3 rounded-full shadow-sm" 
                            :style="{ backgroundColor: selectedDinero.color }"
                        ></div>
                        <span class="text-xs text-gray-600 font-medium">Se añadirá a: {{ selectedDinero.name }}</span>
                    </div>
                </div>
                <button 
                    @click="$emit('close')"
                    class="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 p-2"
                >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>

            <!-- Form -->
            <form @submit.prevent="submitExpense" class="p-6 space-y-6">
                <!-- Título -->
                <div>
                    <label class="block text-sm font-semibold text-gris-billetera mb-3">
                        <span class="flex items-center gap-2">
                            <span class="text-azul-tiquet">📝</span>
                            Título del gasto
                        </span>
                    </label>
                    <input
                        v-model="formData.title"
                        type="text"
                        required
                        placeholder="Ej: Cena en el restaurante"
                        class="w-full px-4 py-3 text-sm border-2 border-azul-claro-viaje/30 rounded-xl focus:ring-2 focus:ring-azul-tiquet focus:border-azul-tiquet bg-blanco-dividido transition-all duration-200 hover:border-azul-claro-viaje placeholder-gray-400"
                    >
                </div>

                <!-- Cantidad -->
                <div>
                    <label class="block text-sm font-semibold text-gris-billetera mb-3">
                        <span class="flex items-center gap-2">
                            <span class="text-lima-compartida">💳</span>
                            Cantidad (€)
                        </span>
                    </label>
                    <input
                        v-model.number="formData.amount"
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        placeholder="0.00"
                        class="w-full px-4 py-3 text-sm border-2 border-azul-claro-viaje/30 rounded-xl focus:ring-2 focus:ring-azul-tiquet focus:border-azul-tiquet bg-blanco-dividido transition-all duration-200 hover:border-azul-claro-viaje placeholder-gray-400"
                    >
                </div>

                <!-- Categoría -->
                <div>
                    <label class="block text-sm font-semibold text-gris-billetera mb-3">
                        <span class="flex items-center gap-2">
                            <span class="text-azul-claro-viaje">📂</span>
                            Categoría
                        </span>
                    </label>
                    <select
                        v-model="formData.category"
                        required
                        class="w-full px-4 py-3 text-sm border-2 border-azul-claro-viaje/30 rounded-xl focus:ring-2 focus:ring-azul-tiquet focus:border-azul-tiquet bg-blanco-dividido transition-all duration-200 hover:border-azul-claro-viaje"
                    >
                        <option value="">Selecciona una categoría</option>
                        <option value="Comida">🍕 Comida</option>
                        <option value="Transporte">🚗 Transporte</option>
                        <option value="Alojamiento">🏠 Alojamiento</option>
                        <option value="Entretenimiento">🎉 Entretenimiento</option>
                        <option value="Compras">🛍️ Compras</option>
                        <option value="Otros">📦 Otros</option>
                    </select>
                </div>

                <!-- Descripción -->
                <div>
                    <label class="block text-sm font-semibold text-gris-billetera mb-3">
                        <span class="flex items-center gap-2">
                            <span class="text-gray-500">📄</span>
                            Descripción (opcional)
                        </span>
                    </label>
                    <textarea
                        v-model="formData.description"
                        rows="3"
                        placeholder="Descripción del gasto..."
                        class="w-full px-4 py-3 text-sm border-2 border-azul-claro-viaje/30 rounded-xl focus:ring-2 focus:ring-azul-tiquet focus:border-azul-tiquet bg-blanco-dividido transition-all duration-200 hover:border-azul-claro-viaje resize-none placeholder-gray-400"
                    ></textarea>
                </div>

                <!-- Quién pagó -->
                <div>
                    <label class="block text-sm font-medium text-gris-billetera mb-2">
                        Quién pagó
                    </label>
                    <select
                        v-model="formData.paidBy"
                        required
                        class="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-azul-tiquet focus:border-transparent"
                    >
                        <option value="">Selecciona quién pagó</option>
                        <option v-for="user in users" :key="user.id" :value="user.id">
                            {{ user.name }}
                        </option>
                    </select>
                </div>

                <!-- Participantes -->
                <div>
                    <label class="block text-sm font-medium text-gris-billetera mb-2">
                        Participantes
                    </label>
                    <div class="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2">
                        <label 
                            v-for="user in users" 
                            :key="user.id"
                            class="flex items-center gap-3 p-2 rounded-lg hover:bg-marfil-mapamundi cursor-pointer"
                        >
                            <input
                                type="checkbox"
                                :value="user.id"
                                v-model="formData.participants"
                                class="w-4 h-4 text-azul-tiquet border-gray-300 rounded focus:ring-azul-tiquet"
                            >
                            <span class="text-sm text-gris-billetera">{{ user.name }}</span>
                        </label>
                    </div>
                    <p v-if="formData.participants.length === 0" class="text-xs sm:text-sm text-red-500 mt-1">
                        Debes seleccionar al menos un participante
                    </p>
                </div>

                <!-- División del gasto -->
                <div v-if="formData.participants.length > 0 && formData.amount > 0" class="border-t pt-4">
                    <h3 class="text-sm font-medium text-gris-billetera mb-2">División del gasto</h3>
                    <div class="space-y-2 max-h-24 overflow-y-auto">
                        <div 
                            v-for="participantId in formData.participants" 
                            :key="participantId"
                            class="flex items-center justify-between p-2 bg-marfil-mapamundi border rounded-lg"
                        >
                            <span class="text-xs sm:text-sm text-gris-billetera">{{ getUserName(participantId) }}</span>
                            <span class="text-xs sm:text-sm font-medium text-azul-tiquet">
                                {{ formatMoney(formData.amount / formData.participants.length) }}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Botones -->
                <div class="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                        type="button"
                        @click="$emit('close')"
                        class="flex-1 px-4 py-2 text-sm sm:text-base text-gris-billetera border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        :disabled="!isFormValid"
                        class="flex-1 px-4 py-2 text-sm sm:text-base bg-lima-compartida text-gris-billetera rounded-lg hover:bg-azul-claro-viaje disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        Añadir gasto
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useExpenseStore } from '~/stores/expense.store'
import { useUserStore } from '~/stores/user.store'
import { useContextStore } from '~/stores/context.store'

// Emits
const emit = defineEmits(['close', 'expense-added'])

// Stores
const expenseStore = useExpenseStore()
const userStore = useUserStore()
const contextStore = useContextStore()

// Form data
const formData = ref({
    title: '',
    amount: 0,
    category: '',
    description: '',
    paidBy: userStore.getCurrentUser?.id || '',
    participants: userStore.getCurrentUser ? [userStore.getCurrentUser.id] : []
})

// Computed
const users = computed(() => userStore.getAllUsers)
const selectedDinero = computed(() => contextStore.getSelectedDinero)

const isFormValid = computed(() => {
    return formData.value.title.trim() !== '' &&
           formData.value.amount > 0 &&
           formData.value.category !== '' &&
           formData.value.paidBy !== '' &&
           formData.value.participants.length > 0 &&
           contextStore.getSelectedDineroId
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

const submitExpense = async () => {
    if (!isFormValid.value) return

    try {
        const expenseData = {
            title: formData.value.title,
            amount: formData.value.amount,
            category: formData.value.category,
            description: formData.value.description,
            dineroId: contextStore.getSelectedDineroId, // Usar el dinero seleccionado globalmente
            paidBy: formData.value.paidBy,
            participants: formData.value.participants
        }

        await expenseStore.addExpense(expenseData)
        emit('expense-added')
        console.log('submitExpense')
    } catch (error) {
        console.error('Error al añadir gasto:', error)
        // Aquí podrías mostrar un error al usuario
    }
}

// Watcher para asegurar que el pagador esté incluido en los participantes
watch(() => formData.value.paidBy, (newPaidBy) => {
    if (newPaidBy && !formData.value.participants.includes(newPaidBy)) {
        formData.value.participants.push(newPaidBy)
    }
})

console.log('AddExpenseModal')
</script>
