<template>
  <div class="min-h-screen bg-marfil-mapamundi p-3 sm:p-4 lg:p-6">
    <div class="max-w-3xl mx-auto">
      <!-- Header destacado -->
      <div class="mb-8">
        <div class="bg-gradient-to-r from-azul-tiquet to-azul-claro-viaje rounded-2xl p-6 text-blanco-dividido shadow-xl flex items-center gap-4">
          <span class="text-lima-compartida text-3xl">🔁</span>
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold mb-1">Gastos recurrentes</h1>
            <p class="text-azul-claro-viaje/90 text-sm sm:text-base">Gestión de tus gastos automáticos mensuales</p>
          </div>
        </div>
      </div>
      <div class="bg-blanco-dividido rounded-2xl shadow-xl border border-marfil-mapamundi p-6">
        <div v-if="loading" class="flex flex-col items-center justify-center py-12">
          <svg class="animate-spin h-8 w-8 text-azul-tiquet mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
          <span class="text-azul-tiquet text-lg font-medium">Cargando...</span>
        </div>
        <div v-else>
          <div v-if="recurringExpenses.length === 0" class="flex flex-col items-center justify-center py-12">
            <img src="/assets/img/comunes/add.svg" alt="Sin gastos" class="h-16 w-16 mb-4 opacity-60" />
            <span class="text-gris-billetera text-lg font-medium">No hay gastos recurrentes activos.</span>
          </div>
          <div v-else class="space-y-6">
            <div v-for="expense in recurringExpenses" :key="expense.id" @click="openModal(expense)" class="bg-marfil-mapamundi rounded-xl shadow border border-azul-claro-viaje/20 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-lg transition-shadow cursor-pointer group">
              <div class="flex-1">
                <h2 class="font-semibold text-azul-tiquet text-xl mb-1 group-hover:underline">{{ expense.title }}</h2>
                <p class="text-base text-gris-billetera mb-1">{{ formatMoney(expense.amount) }} <span class="mx-2 text-lima-compartida">•</span> <span class="text-azul-claro-viaje">{{ expense.category }}</span></p>
                <p v-if="expense.description" class="text-sm text-gray-500">{{ expense.description }}</p>
              </div>
              <div class="flex flex-row gap-2 items-center">
                <button v-if="expense.isRecurring" @click.stop="cancelRecurring(expense)" class="px-5 py-2 bg-red-100 text-red-600 rounded-xl font-semibold shadow hover:bg-red-200 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-red-200">Cancelar</button>
                <button v-else @click.stop="reactivateRecurring(expense)" class="px-5 py-2 bg-lima-compartida text-gris-billetera rounded-xl font-semibold shadow hover:bg-lima-compartida/80 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-lima-compartida">Reactivar</button>
              </div>
            </div>
            <RecurringExpenseModal v-if="showModal" :expense="selectedExpense" @close="showModal = false" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import RecurringExpenseModal from '~/components/RecurringExpenseModal.vue'
import { useExpenseStore } from '~/stores/expense.store'
import formatMoney from '~/utils/formatMoney'

const expenseStore = useExpenseStore()
const loading = ref(true)
const recurringExpenses = ref([])
const showModal = ref(false)
const selectedExpense = ref(null)

const fetchRecurring = async () => {
  loading.value = true
  await expenseStore.fetchExpenses()
  recurringExpenses.value = expenseStore.getAllExpenses.filter(e => e.isRecurring !== undefined)
  loading.value = false
}

const cancelRecurring = async (expense) => {
  await expenseStore.updateExpense(expense.id, { ...expense, isRecurring: false })
  await fetchRecurring()
}

const reactivateRecurring = async (expense) => {
  await expenseStore.updateExpense(expense.id, { ...expense, isRecurring: true })
  await fetchRecurring()
}

onMounted(fetchRecurring)

function openModal(expense) {
  selectedExpense.value = expense
  showModal.value = true
}
</script>

<style scoped>
</style>
/* Colores personalizados para Tailwind (usando @apply si necesitas clases compuestas) */
/* Ejemplo de uso de soft style y responsive */
