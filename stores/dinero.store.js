import { defineStore } from "pinia";

export const useDineroStore = defineStore({
    id: "dinero",
    state: () => ({
        dineros: [],
        loading: false
    }),
    
    getters: {
        getAllDineros: (state) => Array.isArray(state.dineros) ? state.dineros : [],
        
        getDineroById: (state) => (id) => {
            return state.dineros.find(dinero => dinero.id === id);
        },
        
        getDefaultDinero: (state) => {
            return state.dineros.find(dinero => dinero.isDefault) || null;
        },
        
        getDineroExpenseCount: (state) => (dineroId) => {
            // Esta función será usada por el expense store
            return 0; // Placeholder por ahora
        },
        
        isLoading: (state) => state.loading
    },
    
    actions: {
        async fetchDineros() {
            this.loading = true
            try {
                const response = await $fetch('/api/dineros')
                this.dineros = response.data || []
                
                // Asegurar que existe un dinero por defecto
                await this.ensureDefaultDinero()
                
                console.log('fetchDineros')
                return this.dineros
            } catch (error) {
                console.error('Error al obtener dineros:', error)
                throw error
            } finally {
                this.loading = false
            }
        },
        
        async addDinero(dineroData) {
            this.loading = true
            try {
                const response = await $fetch('/api/dineros', {
                    method: 'POST',
                    body: dineroData
                })
                
                const newDinero = response.data
                this.dineros.push(newDinero)
                
                console.log('addDinero')
                return newDinero
            } catch (error) {
                console.error('Error al añadir dinero:', error)
                throw error
            } finally {
                this.loading = false
            }
        },
        
        async updateDinero(id, dineroData) {
            this.loading = true
            try {
                const response = await $fetch('/api/dineros', {
                    method: 'PUT',
                    body: { id, ...dineroData }
                })
                
                const updatedDinero = response.data
                const dineroIndex = this.dineros.findIndex(dinero => dinero.id === id)
                if (dineroIndex !== -1) {
                    this.dineros[dineroIndex] = updatedDinero
                }
                
                console.log('updateDinero')
                return updatedDinero
            } catch (error) {
                console.error('Error al actualizar dinero:', error)
                throw error
            } finally {
                this.loading = false
            }
        },
        
        async deleteDinero(id) {
            this.loading = true
            try {
                // No permitir eliminar el dinero por defecto
                const dinero = this.getDineroById(id)
                if (dinero && dinero.isDefault) {
                    throw new Error('No se puede eliminar el dinero por defecto')
                }
                
                await $fetch('/api/dineros', {
                    method: 'DELETE',
                    query: { id }
                })
                
                this.dineros = this.dineros.filter(dinero => dinero.id !== id)
                
                console.log('deleteDinero')
            } catch (error) {
                console.error('Error al eliminar dinero:', error)
                throw error
            } finally {
                this.loading = false
            }
        },
        
        async ensureDefaultDinero() {
            // Verificar si existe un dinero por defecto
            const defaultDinero = this.getDefaultDinero
            
            if (!defaultDinero) {
                // Crear el dinero por defecto
                const defaultDineroData = {
                    name: "Dineros sin nombre",
                    description: "Contenedor por defecto para gastos sin dinero asignado",
                    isDefault: true,
                    color: "#3A7CA5", // Azul Tiquet
                    createdAt: new Date().toISOString()
                }
                
                await this.addDinero(defaultDineroData)
            }
        },
        
        async moveExpenseToDinero(expenseId, newDineroId) {
            try {
                // Importar el expense store
                const { useExpenseStore } = await import('~/stores/expense.store')
                const expenseStore = useExpenseStore()
                
                // Obtener el gasto
                const expense = expenseStore.getAllExpenses.find(exp => exp.id === expenseId)
                if (!expense) {
                    throw new Error('Gasto no encontrado')
                }
                
                // Actualizar el dineroId del gasto
                await expenseStore.updateExpense(expenseId, {
                    ...expense,
                    dineroId: newDineroId
                })
                
                console.log('moveExpenseToDinero')
                return true
            } catch (error) {
                console.error('Error al mover gasto a dinero:', error)
                throw error
            }
        },
        
        async initializeDineros() {
            try {
                await this.fetchDineros()
                console.log('initializeDineros')
            } catch (error) {
                console.error('Error al inicializar dineros:', error)
            }
        }
    }
});
