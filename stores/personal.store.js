import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePersonalStore = defineStore('personalStore', () => {
  const expenses = ref([])
  const subscriptions = ref([])
  const budgets = ref([])

  // Gastos personales
  async function fetchExpenses(userId) {
    const { data } = await $fetch(`/api/personal/expenses?userId=${userId}`)
    if (data?.docs) expenses.value = data.docs
    console.log('fetchExpenses')
  }
  function getExpensesByUser(userId) {
    console.log('getExpensesByUser')
    return expenses.value.filter(e => e.userId === userId)
  }
  async function addExpense(expense) {
    await $fetch('/api/personal/expenses', { method: 'POST', body: expense })
    expenses.value.push(expense)
    console.log('addExpense')
  }

  // Suscripciones personales
  async function fetchSubscriptions(userId) {
    const { data } = await $fetch(`/api/personal/subscriptions?userId=${userId}`)
    if (data?.docs) subscriptions.value = data.docs
    console.log('fetchSubscriptions')
  }
  function getSubscriptionsByUser(userId) {
    console.log('getSubscriptionsByUser')
    return subscriptions.value.filter(s => s.userId === userId)
  }
  async function addSubscription(sub) {
    await $fetch('/api/personal/subscriptions', { method: 'POST', body: sub })
    subscriptions.value.push(sub)
    console.log('addSubscription')
  }

  // Presupuestos personales
  async function fetchBudgets(userId) {
    const { data } = await $fetch(`/api/personal/budgets?userId=${userId}`)
    if (data?.docs) budgets.value = data.docs
    console.log('fetchBudgets')
  }
  function getBudgetsByUser(userId) {
    console.log('getBudgetsByUser')
    return budgets.value.filter(b => b.userId === userId)
  }
  async function addBudget(budget) {
    await $fetch('/api/personal/budgets', { method: 'POST', body: budget })
    budgets.value.push(budget)
    console.log('addBudget')
  }

  return {
    expenses,
    subscriptions,
    budgets,
    fetchExpenses,
    getExpensesByUser,
    addExpense,
    fetchSubscriptions,
    getSubscriptionsByUser,
    addSubscription,
    fetchBudgets,
    getBudgetsByUser,
    addBudget
  }
})
