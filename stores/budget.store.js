import { defineStore } from 'pinia'

export const useBudgetStore = defineStore('budget', {
    state: () => ({
        budgets: [],
        isLoading: false,
        error: null
    }),

    getters: {
        getBudgetsByDinero: (state) => (dineroId) => {
            return state.budgets.filter(budget => budget.dineroId === dineroId)
        },

        getBudgetByCategory: (state) => (dineroId, category) => {
            return state.budgets.find(budget => 
                budget.dineroId === dineroId && budget.category === category
            )
        },

        getTotalBudgetByDinero: (state) => (dineroId) => {
            return state.budgets
                .filter(budget => budget.dineroId === dineroId)
                .reduce((sum, budget) => sum + budget.amount, 0)
        }
    },

    actions: {
        async initializeBudgets() {
            console.log('BudgetStore: Initializing budgets...')
            this.isLoading = true
            
            try {
                // Cargar desde localStorage
                const savedBudgets = localStorage.getItem('dame-mi-dinero-budgets')
                if (savedBudgets) {
                    this.budgets = JSON.parse(savedBudgets)
                }
                console.log('BudgetStore: Loaded', this.budgets.length, 'budgets')
            } catch (error) {
                console.error('Error loading budgets:', error)
                this.error = 'Error al cargar presupuestos'
            } finally {
                this.isLoading = false
            }
        },

        async saveBudgets() {
            try {
                localStorage.setItem('dame-mi-dinero-budgets', JSON.stringify(this.budgets))
                console.log('BudgetStore: Budgets saved to localStorage')
            } catch (error) {
                console.error('Error saving budgets:', error)
                throw new Error('Error al guardar presupuestos')
            }
        },

        async createBudget(budgetData) {
            console.log('BudgetStore: Creating budget:', budgetData)
            
            const newBudget = {
                id: Date.now(),
                dineroId: budgetData.dineroId,
                category: budgetData.category,
                amount: parseFloat(budgetData.amount),
                period: budgetData.period || 'monthly', // monthly, weekly, yearly
                alertThreshold: budgetData.alertThreshold || 80, // Porcentaje para alertas
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }

            // Verificar si ya existe un presupuesto para esta categoría
            const existingIndex = this.budgets.findIndex(
                budget => budget.dineroId === newBudget.dineroId && 
                         budget.category === newBudget.category
            )

            if (existingIndex >= 0) {
                this.budgets[existingIndex] = newBudget
            } else {
                this.budgets.push(newBudget)
            }

            await this.saveBudgets()
            return newBudget
        },

        async updateBudget(budgetId, updateData) {
            console.log('BudgetStore: Updating budget:', budgetId, updateData)
            
            const budgetIndex = this.budgets.findIndex(budget => budget.id === budgetId)
            if (budgetIndex >= 0) {
                this.budgets[budgetIndex] = {
                    ...this.budgets[budgetIndex],
                    ...updateData,
                    updatedAt: new Date().toISOString()
                }
                
                await this.saveBudgets()
                return this.budgets[budgetIndex]
            }
            
            throw new Error('Presupuesto no encontrado')
        },

        async deleteBudget(budgetId) {
            console.log('BudgetStore: Deleting budget:', budgetId)
            
            const budgetIndex = this.budgets.findIndex(budget => budget.id === budgetId)
            if (budgetIndex >= 0) {
                this.budgets.splice(budgetIndex, 1)
                await this.saveBudgets()
            }
        },

        getBudgetProgress(dineroId, category, expenses) {
            const budget = this.getBudgetByCategory(dineroId, category)
            if (!budget) return null

            // Filtrar gastos por período
            const now = new Date()
            const filteredExpenses = expenses.filter(expense => {
                const expenseDate = new Date(expense.date)
                const expenseCategory = expense.category || 'Sin categoría'
                
                if (expenseCategory !== category) return false
                
                switch (budget.period) {
                    case 'weekly':
                        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                        return expenseDate >= weekAgo
                    case 'monthly':
                        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
                        return expenseDate >= monthStart
                    case 'yearly':
                        const yearStart = new Date(now.getFullYear(), 0, 1)
                        return expenseDate >= yearStart
                    default:
                        return true
                }
            })

            const spent = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)
            const percentage = (spent / budget.amount) * 100
            const remaining = budget.amount - spent

            return {
                budget,
                spent,
                remaining: Math.max(0, remaining),
                percentage: Math.min(100, percentage),
                isOverBudget: spent > budget.amount,
                isNearLimit: percentage >= budget.alertThreshold
            }
        },

        getAllBudgetProgress(dineroId, expenses) {
            const budgets = this.getBudgetsByDinero(dineroId)
            return budgets.map(budget => 
                this.getBudgetProgress(dineroId, budget.category, expenses)
            ).filter(Boolean)
        }
    }
})
