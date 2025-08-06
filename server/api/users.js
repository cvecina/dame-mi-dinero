export default defineEventHandler(async (event) => {
    const method = getMethod(event)
    
    try {
        if (method === 'GET') {
            // Obtener todos los usuarios
            const users = await $fetch('/api/storage/users') || []
            return {
                success: true,
                data: users
            }
        }
        
        if (method === 'POST') {
            // Crear nuevo usuario
            const body = await readBody(event)
            const { name } = body
            
            if (!name) {
                throw createError({
                    statusCode: 400,
                    statusMessage: 'El nombre es requerido'
                })
            }
            
            // Obtener usuarios existentes
            const existingUsers = await $fetch('/api/storage/users') || []
            
            // Crear nuevo usuario
            const newUser = {
                id: Date.now(),
                name: name.trim(),
                createdAt: new Date().toISOString()
            }
            
            const updatedUsers = [...existingUsers, newUser]
            
            // Guardar en storage
            await $fetch('/api/storage/users', {
                method: 'PUT',
                body: updatedUsers
            })
            
            return {
                success: true,
                data: newUser
            }
        }
        
        if (method === 'PUT') {
            // Actualizar usuario
            const body = await readBody(event)
            const { id, ...updateData } = body
            
            const existingUsers = await $fetch('/api/storage/users') || []
            const userIndex = existingUsers.findIndex(user => user.id === id)
            
            if (userIndex === -1) {
                throw createError({
                    statusCode: 404,
                    statusMessage: 'Usuario no encontrado'
                })
            }
            
            existingUsers[userIndex] = { 
                ...existingUsers[userIndex], 
                ...updateData,
                updatedAt: new Date().toISOString()
            }
            
            await $fetch('/api/storage/users', {
                method: 'PUT',
                body: existingUsers
            })
            
            return {
                success: true,
                data: existingUsers[userIndex]
            }
        }
        
        if (method === 'DELETE') {
            // Eliminar usuario
            const query = getQuery(event)
            const userId = parseInt(query.id)
            
            if (!userId) {
                throw createError({
                    statusCode: 400,
                    statusMessage: 'ID de usuario requerido'
                })
            }
            
            const existingUsers = await $fetch('/api/storage/users') || []
            const updatedUsers = existingUsers.filter(user => user.id !== userId)
            
            await $fetch('/api/storage/users', {
                method: 'PUT',
                body: updatedUsers
            })
            
            return {
                success: true,
                message: 'Usuario eliminado correctamente'
            }
        }
        
        throw createError({
            statusCode: 405,
            statusMessage: 'Método no permitido'
        })
        
    } catch (error) {
        console.error('Error en API usuarios:', error)
        
        if (error.statusCode) {
            throw error
        }
        
        throw createError({
            statusCode: 500,
            statusMessage: 'Error interno del servidor'
        })
    }
})
