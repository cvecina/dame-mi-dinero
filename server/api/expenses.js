export default defineEventHandler(async (event) => {
    const method = getMethod(event)
    
    try {
        if (method === 'GET') {
            // Obtener todos los gastos
            const expenses = await $fetch('/api/storage/expenses') || []
            return {
                success: true,
                data: expenses
            }
        }
        
        if (method === 'POST') {
            // Crear nuevo gasto
            const body = await readBody(event)
            const { title, amount, category, description, dineroId, paidBy, participants, isRecurring } = body

            if (!title || !amount || !category || !paidBy || !participants?.length || !dineroId) {
                throw createError({
                    statusCode: 400,
                    statusMessage: 'Datos incompletos del gasto (incluyendo dineroId)'
                })
            }

            // Obtener gastos existentes
            const existingExpenses = await $fetch('/api/storage/expenses') || []

            // Determinar si participants es un array simple de IDs o objetos con {userId, amount}
            let splits = []
            let participantIds = []

            if (participants.length > 0 && typeof participants[0] === 'object' && participants[0].userId !== undefined) {
                // Formato nuevo: array de objetos con {userId, amount}
                splits = participants.map(p => ({
                    userId: parseInt(p.userId),
                    amount: parseFloat(p.amount)
                }))
                participantIds = participants.map(p => parseInt(p.userId))
            } else {
                // Formato legacy: array simple de IDs - calcular división equitativa
                participantIds = participants.map(id => parseInt(id))
                const splitAmount = amount / participants.length
                const remainder = (amount * 100) % (participants.length * 100)
                
                splits = participants.map((userId, index) => ({
                    userId: parseInt(userId),
                    amount: Math.round((splitAmount + (index < remainder / 100 ? 0.01 : 0)) * 100) / 100
                }))
            }

            // Crear nuevo gasto
            const newExpense = {
                id: Date.now(),
                title: title.trim(),
                amount: parseFloat(amount),
                category,
                description: description?.trim() || '',
                dineroId: parseInt(dineroId), // Agregar dineroId
                paidBy: parseInt(paidBy),
                participants: participantIds,
                splits,
                date: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                isRecurring: !!isRecurring
            }

            const updatedExpenses = [...existingExpenses, newExpense]

            // Guardar en storage
            await $fetch('/api/storage/expenses', {
                method: 'PUT',
                body: updatedExpenses
            })

            return {
                success: true,
                data: newExpense
            }
        }
        
        if (method === 'PUT') {
            // Actualizar gasto
            const body = await readBody(event)
            const { id, ...updateData } = body
            
            const existingExpenses = await $fetch('/api/storage/expenses') || []
            const expenseIndex = existingExpenses.findIndex(expense => expense.id === id)
            
            if (expenseIndex === -1) {
                throw createError({
                    statusCode: 404,
                    statusMessage: 'Gasto no encontrado'
                })
            }
            
            existingExpenses[expenseIndex] = { 
                ...existingExpenses[expenseIndex], 
                ...updateData,
                updatedAt: new Date().toISOString()
            }
            
            await $fetch('/api/storage/expenses', {
                method: 'PUT',
                body: existingExpenses
            })
            
            return {
                success: true,
                data: existingExpenses[expenseIndex]
            }
        }
        
        if (method === 'DELETE') {
            // Eliminar gasto
            const query = getQuery(event)
            const expenseId = parseInt(query.id)
            
            if (!expenseId) {
                throw createError({
                    statusCode: 400,
                    statusMessage: 'ID de gasto requerido'
                })
            }
            
            const existingExpenses = await $fetch('/api/storage/expenses') || []
            const updatedExpenses = existingExpenses.filter(expense => expense.id !== expenseId)
            
            await $fetch('/api/storage/expenses', {
                method: 'PUT',
                body: updatedExpenses
            })
            
            return {
                success: true,
                message: 'Gasto eliminado correctamente'
            }
        }
        
        throw createError({
            statusCode: 405,
            statusMessage: 'Método no permitido'
        })
        
    } catch (error) {
        console.error('Error en API gastos:', error)
        
        if (error.statusCode) {
            throw error
        }
        
        throw createError({
            statusCode: 500,
            statusMessage: 'Error interno del servidor'
        })
    }
})
