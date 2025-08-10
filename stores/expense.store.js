import { defineStore } from "pinia";

export const useExpenseStore = defineStore({
    id: "expense",
    state: () => ({
        expenses: [],
        loading: false
    }),
    
    getters: {
        getAllExpenses: (state) => Array.isArray(state.expenses) ? state.expenses : [],
        
        getExpensesByUser: (state) => (userId) => {
            return state.expenses.filter(expense => 
                expense.paidBy === userId || expense.participants.includes(userId)
            );
        },
        
        getExpensesByDinero: (state) => (dineroId) => {
            return state.expenses.filter(expense => expense.dineroId === dineroId);
        },
        
        getExpensesWithoutDinero: (state) => {
            return state.expenses.filter(expense => !expense.dineroId);
        },
        
        getTotalExpenses: (state) => {
            return state.expenses.reduce((total, expense) => total + expense.amount, 0);
        },
        
        getTotalExpensesByDinero: (state) => (dineroId) => {
            return state.expenses
                .filter(expense => expense.dineroId === dineroId)
                .reduce((total, expense) => total + expense.amount, 0);
        },
        
        getBalancesByDinero: (state) => (dineroId) => {
            const balances = {};
            
            // Filtrar gastos por dinero
            const expensesByDinero = state.expenses.filter(expense => expense.dineroId === dineroId);
            
            console.log(`[getBalancesByDinero] Processing ${expensesByDinero.length} expenses for dinero ${dineroId}`);
            
            // Inicializar balances para todos los usuarios que participan en este dinero
            expensesByDinero.forEach(expense => {
                // Inicializar balance para el pagador
                if (!balances[expense.paidBy]) {
                    balances[expense.paidBy] = { 
                        totalSpent: 0, 
                        owes: 0, 
                        owedToThem: 0, 
                        balance: 0 
                    };
                }
                
                // Inicializar balances para participantes
                if (expense.participants && Array.isArray(expense.participants)) {
                    expense.participants.forEach(userId => {
                        if (!balances[userId]) {
                            balances[userId] = { 
                                totalSpent: 0,    // Total que ha gastado (pagado de su bolsillo)
                                owes: 0,          // Lo que debe a otros
                                owedToThem: 0,    // Lo que le deben a él
                                balance: 0        // Balance final
                            };
                        }
                    });
                }
                
                // Inicializar balances para usuarios en splits (por si hay inconsistencias)
                if (expense.splits && Array.isArray(expense.splits)) {
                    expense.splits.forEach(split => {
                        const userId = parseInt(split.userId);
                        if (!balances[userId]) {
                            balances[userId] = { 
                                totalSpent: 0, 
                                owes: 0, 
                                owedToThem: 0, 
                                balance: 0 
                            };
                        }
                    });
                }
            });
            
            // Procesar cada gasto del dinero
            expensesByDinero.forEach(expense => {
                const amount = parseFloat(expense.amount);
                const payerId = expense.paidBy;
                
                // Verificar que el pagador tenga un balance inicializado
                if (!balances[payerId]) {
                    balances[payerId] = { totalSpent: 0, owes: 0, owedToThem: 0, balance: 0 };
                }
                
                // 1. El pagador original gastó este dinero
                balances[payerId].totalSpent += amount;
                
                // 2. Calcular deudas y créditos por participante
                if (expense.splits && Array.isArray(expense.splits)) {
                    expense.splits.forEach(split => {
                        const userId = parseInt(split.userId);
                        const amountOwed = parseFloat(split.amount);
                        
                        // Verificar que el usuario tenga un balance inicializado
                        if (!balances[userId]) {
                            balances[userId] = { totalSpent: 0, owes: 0, owedToThem: 0, balance: 0 };
                        }
                        
                        // Verificar si ha pagado individualmente
                        const hasPaidIndividually = expense.payments && expense.payments[userId];
                        
                        if (userId === payerId) {
                            // El pagador original: si otros no han pagado, le deben dinero
                            if (expense.splits && Array.isArray(expense.splits)) {
                                expense.splits.forEach(otherSplit => {
                                    const otherUserId = parseInt(otherSplit.userId);
                                    const otherAmount = parseFloat(otherSplit.amount);
                                    
                                    if (otherUserId !== payerId) {
                                        // Verificar que el otro usuario tenga un balance inicializado
                                        if (!balances[otherUserId]) {
                                            balances[otherUserId] = { totalSpent: 0, owes: 0, owedToThem: 0, balance: 0 };
                                        }
                                        
                                        const otherHasPaid = expense.payments && expense.payments[otherUserId];
                                        if (!otherHasPaid) {
                                            balances[payerId].owedToThem += otherAmount;
                                        }
                                    }
                                });
                            }
                        } else {
                            // Otros participantes
                            if (!hasPaidIndividually) {
                                // No ha pagado: le debe al pagador original
                                balances[userId].owes += amountOwed;
                            } else {
                                // Ha pagado individualmente: suma a su gasto total
                                balances[userId].totalSpent += amountOwed;
                            }
                        }
                    });
                }
            });
            
            // Calcular balance final: (lo que le deben + lo que ha gastado) - lo que debe
            Object.keys(balances).forEach(userId => {
                const userBalance = balances[userId];
                if (userBalance) {
                    userBalance.balance = Math.round((userBalance.owedToThem - userBalance.owes) * 100) / 100;
                } else {
                    console.warn(`Balance not found for user ${userId}`, balances);
                    balances[userId] = { totalSpent: 0, owes: 0, owedToThem: 0, balance: 0 };
                }
            });
            
            console.log('getBalancesByDinero');
            return balances;
        },
        
        getBalances: (state) => {
            const balances = {};
            
            // Inicializar balances para todos los usuarios que participan
            state.expenses.forEach(expense => {
                expense.participants.forEach(userId => {
                    if (!balances[userId]) {
                        balances[userId] = { 
                            totalSpent: 0,    // Total que ha gastado (pagado de su bolsillo)
                            owes: 0,          // Lo que debe a otros
                            owedToThem: 0,    // Lo que le deben a él
                            balance: 0        // Balance final
                        };
                    }
                });
                if (!balances[expense.paidBy]) {
                    balances[expense.paidBy] = { 
                        totalSpent: 0, 
                        owes: 0, 
                        owedToThem: 0, 
                        balance: 0 
                    };
                }
            });
            
            // Procesar cada gasto
            state.expenses.forEach(expense => {
                const amount = parseFloat(expense.amount);
                const payerId = expense.paidBy;
                
                // 1. El pagador original gastó este dinero
                balances[payerId].totalSpent += amount;
                
                // 2. Calcular deudas y créditos por participante
                expense.splits.forEach(split => {
                    const userId = parseInt(split.userId);
                    const amountOwed = parseFloat(split.amount);
                    
                    // Verificar si ha pagado individualmente
                    const hasPaidIndividually = expense.payments && expense.payments[userId];
                    
                    if (userId === payerId) {
                        // El pagador original: si otros no han pagado, le deben dinero
                        expense.splits.forEach(otherSplit => {
                            const otherUserId = parseInt(otherSplit.userId);
                            const otherAmount = parseFloat(otherSplit.amount);
                            
                            if (otherUserId !== payerId) {
                                const otherHasPaid = expense.payments && expense.payments[otherUserId];
                                if (!otherHasPaid) {
                                    balances[payerId].owedToThem += otherAmount;
                                }
                            }
                        });
                    } else {
                        // Otros participantes
                        if (!hasPaidIndividually) {
                            // No ha pagado: le debe al pagador original
                            balances[userId].owes += amountOwed;
                        } else {
                            // Ha pagado individualmente: suma a su gasto total
                            balances[userId].totalSpent += amountOwed;
                        }
                    }
                });
            });
            
            // Calcular balance final: (lo que le deben + lo que ha gastado) - lo que debe
            Object.keys(balances).forEach(userId => {
                const userBalance = balances[userId];
                userBalance.balance = Math.round((userBalance.owedToThem - userBalance.owes) * 100) / 100;
            });
            
            console.log('getBalances');
            return balances;
        },
        
        isLoading: (state) => state.loading
    },
    
    actions: {
        async fetchExpenses() {
            this.loading = true
            try {
                const response = await $fetch('/api/expenses')
                this.expenses = response.data || []
                
                console.log('fetchExpenses')
                return this.expenses
            } catch (error) {
                console.error('Error al obtener gastos:', error)
                throw error
            } finally {
                this.loading = false
            }
        },
        
        async addExpense(expenseData) {
            this.loading = true
            try {
                // Si no tiene dineroId asignado, usar el dinero por defecto
                if (!expenseData.dineroId) {
                    const { useDineroStore } = await import('~/stores/dinero.store')
                    const dineroStore = useDineroStore()
                    
                    // Asegurar que los dineros estén cargados
                    if (dineroStore.dineros.length === 0) {
                        await dineroStore.fetchDineros()
                    }
                    
                    const defaultDinero = dineroStore.getDefaultDinero
                    if (defaultDinero) {
                        expenseData.dineroId = defaultDinero.id
                    }
                }
                
                const response = await $fetch('/api/expenses', {
                    method: 'POST',
                    body: expenseData
                })
                
                const newExpense = response.data
                this.expenses.push(newExpense)
                
                console.log('addExpense')
                return newExpense
            } catch (error) {
                console.error('Error al añadir gasto:', error)
                throw error
            } finally {
                this.loading = false
            }
        },
        
        async updateExpense(id, expenseData) {
            this.loading = true
            try {
                const response = await $fetch('/api/expenses', {
                    method: 'PUT',
                    body: { id, ...expenseData }
                })
                
                const updatedExpense = response.data
                const expenseIndex = this.expenses.findIndex(expense => expense.id === id)
                if (expenseIndex !== -1) {
                    this.expenses[expenseIndex] = updatedExpense
                }
                
                console.log('updateExpense')
                return updatedExpense
            } catch (error) {
                console.error('Error al actualizar gasto:', error)
                throw error
            } finally {
                this.loading = false
            }
        },

        async markUserPayment(expenseId, userId, isPaid = true) {
            try {
                const expense = this.expenses.find(exp => exp.id === expenseId)
                if (!expense) {
                    throw new Error('Gasto no encontrado')
                }

                // Inicializar payments si no existe
                if (!expense.payments) {
                    expense.payments = {}
                }

                // Marcar como pagado/no pagado
                expense.payments[userId] = isPaid

                // Actualizar el gasto en la base de datos
                await this.updateExpense(expenseId, expense)
                
                console.log('markUserPayment')
                return expense
            } catch (error) {
                console.error('Error al marcar pago:', error)
                throw error
            }
        },

        getUserPaymentStatus(expenseId, userId) {
            const expense = this.expenses.find(exp => exp.id === expenseId)
            if (!expense || !expense.payments) {
                return false
            }
            return expense.payments[userId] || false
        },

        getExpensePaymentSummary(expenseId) {
            const expense = this.expenses.find(exp => exp.id === expenseId)
            if (!expense) return { paid: 0, total: 0, users: [] }

            const totalUsers = expense.participants.length
            const payments = expense.payments || {}
            const paidUsers = Object.values(payments).filter(paid => paid).length

            return {
                paid: paidUsers,
                total: totalUsers,
                users: expense.participants.map(userId => ({
                    userId,
                    paid: payments[userId] || false
                }))
            }
        },
        
        async deleteExpense(id) {
            this.loading = true
            try {
                await $fetch('/api/expenses', {
                    method: 'DELETE',
                    query: { id }
                })
                
                this.expenses = this.expenses.filter(expense => expense.id !== id)
                
                console.log('deleteExpense')
            } catch (error) {
                console.error('Error al eliminar gasto:', error)
                throw error
            } finally {
                this.loading = false
            }
        },
        
        splitExpenseEqually(amount, participants) {
            const splitAmount = amount / participants.length
            const remainder = (amount * 100) % (participants.length * 100)
            
            const splits = participants.map((userId, index) => ({
                userId,
                amount: Math.round((splitAmount + (index < remainder / 100 ? 0.01 : 0)) * 100) / 100
            }))
            
            console.log('splitExpenseEqually')
            return splits
        },
        
        async initializeExpenses() {
            try {
                await this.fetchExpenses()
                await this.migrateExpensesToDefaultDinero()
                console.log('initializeExpenses')
            } catch (error) {
                console.error('Error al inicializar gastos:', error)
            }
        },
        
        async migrateExpensesToDefaultDinero() {
            try {
                const expensesWithoutDinero = this.getExpensesWithoutDinero
                
                if (expensesWithoutDinero.length > 0) {
                    const { useDineroStore } = await import('~/stores/dinero.store')
                    const dineroStore = useDineroStore()
                    
                    // Asegurar que los dineros estén cargados
                    if (dineroStore.dineros.length === 0) {
                        await dineroStore.fetchDineros()
                    }
                    
                    const defaultDinero = dineroStore.getDefaultDinero
                    if (defaultDinero) {
                        // Migrar todos los gastos sin dineroId al dinero por defecto
                        for (const expense of expensesWithoutDinero) {
                            await this.updateExpense(expense.id, {
                                ...expense,
                                dineroId: defaultDinero.id
                            })
                        }
                        console.log(`Migrated ${expensesWithoutDinero.length} expenses to default dinero`)
                    }
                }
            } catch (error) {
                console.error('Error migrating expenses to default dinero:', error)
            }
        }
    }
});
