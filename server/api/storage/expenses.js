export default defineEventHandler(async (event) => {
    const method = getMethod(event)
    
    try {
        if (method === 'GET') {
            // Leer gastos del storage
            const expenses = await useStorage('db').getItem('expenses') || []
            return expenses
        }
        
        if (method === 'PUT') {
            // Guardar gastos en el storage
            const body = await readBody(event)
            await useStorage('db').setItem('expenses', body)
            return { success: true }
        }
        
        throw createError({
            statusCode: 405,
            statusMessage: 'Método no permitido'
        })
        
    } catch (error) {
        console.error('Error en storage gastos:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Error en el almacenamiento'
        })
    }
})
