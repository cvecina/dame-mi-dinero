<template>
  <div class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
    <div class="bg-blanco-dividido rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-marfil-mapamundi">
      <div class="flex items-center justify-between p-5 border-b border-marfil-mapamundi">
        <h2 class="text-xl font-bold text-azul-tiquet flex items-center gap-2">
          <span class="text-lima-compartida text-xl">🔁</span> <span>Detalle gasto recurrente</span>
        </h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-azul-tiquet transition-colors text-2xl font-bold rounded-full w-8 h-8 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-azul-tiquet">&times;</button>
      </div>
      <div class="p-5 space-y-4">
        <div>
          <h3 class="text-lg font-semibold text-gris-billetera mb-1">{{ expense.title }}</h3>
          <p class="text-base text-azul-tiquet mb-1 font-bold">{{ formatMoney(expense.amount) }} <span class="mx-2 text-lima-compartida">•</span> <span class="text-azul-claro-viaje font-medium">{{ expense.category }}</span></p>
          <p v-if="expense.description" class="text-sm text-gray-500 mb-2 italic">{{ expense.description }}</p>
        </div>
        <div class="flex items-center gap-2 text-sm text-gray-500">
          <span class="font-semibold text-gris-billetera">Fecha:</span>
          <span class="font-medium text-azul-tiquet">{{ formatDate(expense.date) }}</span>
        </div>
        <div class="flex flex-col gap-2 text-sm">
          <span class="font-semibold text-gris-billetera">Participantes:</span>
          <div class="flex flex-wrap gap-2 mt-1">
            <template v-if="participantNames.length">
              <span v-for="(name, i) in participantNames" :key="i" class="inline-block bg-marfil-mapamundi text-azul-tiquet rounded-xl px-3 py-1 text-xs font-semibold shadow hover:bg-azul-claro-viaje/60 transition-colors border border-azul-claro-viaje/30">{{ name }}</span>
            </template>
            <template v-else>
              <span class="italic text-gray-400">Ninguno</span>
            </template>
          </div>
        </div>
        <div v-if="expense.isRecurring" class="text-xs text-lima-compartida font-semibold mt-2 flex items-center gap-1">
          <span class="text-lg">🔁</span> <span>Recurrente</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import formatMoney from '~/utils/formatMoney'

const props = defineProps({
  expense: {
    type: Object,
    required: true
  }
})

const users = [
  { id: 1755351906420, name: 'Carli' },
  { id: 1755352537310, name: 'coni' },
  { id: 1755352541181, name: 'jordi' },
  { id: 1755354762915, name: 'carlos' }
]

const participantNames = computed(() => {
  if (!props.expense.participants) return []
  return props.expense.participants.map(pid => {
    const user = users.find(u => u.id === pid)
    return user ? user.name : pid
  })
})

function formatDate(date) {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
}
console.log('RecurringExpenseModal')
</script>

<style scoped>
</style>
