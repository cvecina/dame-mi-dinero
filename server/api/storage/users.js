export default defineEventHandler(async (event) => {
    const method = getMethod(event)
    
    try {
        if (method === 'GET') {
            // Leer usuarios del storage
            const users = await useStorage('db').getItem('users') || []
            return users
        }
        
        if (method === 'PUT') {
            // Guardar usuarios en el storage
            const body = await readBody(event)
            await useStorage('db').setItem('users', body)
            return { success: true }
        }
        
        throw createError({
            statusCode: 405,
            statusMessage: 'Método no permitido'
        })
        
    } catch (error) {
        console.error('Error en storage usuarios:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Error en el almacenamiento'
        })
    }
})
