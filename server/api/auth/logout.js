export default defineEventHandler(async (event) => {
    if (getMethod(event) !== 'POST') {
        throw createError({
            statusCode: 405,
            statusMessage: 'Method not allowed'
        })
    }

    try {
        // Por ahora solo limpiar cualquier estado del servidor si es necesario
        // En una implementación más avanzada podrías invalidar tokens en una blacklist
        
        return {
            success: true,
            message: 'Logout exitoso'
        }

    } catch (error) {
        console.error('Logout error:', error)
        
        throw createError({
            statusCode: 500,
            statusMessage: 'Error interno del servidor'
        })
    }
})
