<template>
  <div class="min-h-screen bg-marfil-mapamundi p-4">
    <div class="max-w-3xl mx-auto">
  <h1 class="text-2xl font-bold text-gris-billetera mb-4">Mi panel personal</h1>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Gastos personales -->
        <div class="bg-blanco-dividido rounded-xl p-6 shadow-lg border border-azul-claro-viaje/20">
          <h2 class="text-lg font-semibold text-azul-tiquet mb-2">Mis gastos</h2>
          <ul>
            <li v-for="gasto in personalExpenses" :key="gasto.id" class="mb-2 flex justify-between items-center">
              <span>{{ gasto.title }}</span>
              <span class="font-bold text-azul-tiquet">{{ formatMoney(gasto.amount) }}</span>
            </li>
          </ul>
          <button class="mt-4 px-4 py-2 bg-lima-compartida text-gris-billetera rounded-xl font-semibold" @click="showAddExpense = true">Añadir gasto</button>
        </div>
        <!-- Suscripciones -->
        <div class="bg-blanco-dividido rounded-xl p-6 shadow-lg border border-azul-claro-viaje/20">
          <h2 class="text-lg font-semibold text-azul-tiquet mb-2">Mis suscripciones</h2>
          <ul>
            <li v-for="sub in personalSubscriptions" :key="sub.id" class="mb-2 flex justify-between items-center">
              <span>{{ sub.name }}</span>
              <span class="font-bold text-azul-tiquet">{{ formatMoney(sub.amount) }}</span>
            </li>
          </ul>
          <button class="mt-4 px-4 py-2 bg-lima-compartida text-gris-billetera rounded-xl font-semibold" @click="showAddSubscription = true">Añadir suscripción</button>
        </div>
        <!-- Presupuestos -->
        <div class="bg-blanco-dividido rounded-xl p-6 shadow-lg border border-azul-claro-viaje/20 col-span-2">
          <h2 class="text-lg font-semibold text-azul-tiquet mb-2">Mis presupuestos</h2>
          <ul>
            <li v-for="presupuesto in personalBudgets" :key="presupuesto.id" class="mb-2 flex justify-between items-center">
              <span>{{ presupuesto.name }}</span>
              <span class="font-bold text-lima-compartida">{{ formatMoney(presupuesto.amount) }}</span>
            </li>
          </ul>
          <button class="mt-4 px-4 py-2 bg-lima-compartida text-gris-billetera rounded-xl font-semibold" @click="showAddBudget = true">Añadir presupuesto</button>
        </div>
      </div>
      <!-- Modales para añadir -->
      <!-- ...existing code for modals... -->
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '~/stores/user.store'
import { useAlertStore } from '~/stores/alert.store'
import { usePersonalStore } from '~/stores/personal.store'
import formatMoney from '~/utils/formatMoney'

const userStore = useUserStore()
const alertStore = useAlertStore()
const personalStore = usePersonalStore()

const currentUser = computed(() => userStore.getCurrentUser)
const personalExpenses = computed(() => personalStore.getExpensesByUser(currentUser.value?.id))
const personalSubscriptions = computed(() => personalStore.getSubscriptionsByUser(currentUser.value?.id))
const personalBudgets = computed(() => personalStore.getBudgetsByUser(currentUser.value?.id))

const showAddExpense = ref(false)
const showAddSubscription = ref(false)
const showAddBudget = ref(false)

console.log('personal.vue')
</script>

<style scoped>
/* ...estilos soft y responsive con tailwind... */
</style>
