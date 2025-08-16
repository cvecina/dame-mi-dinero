export default defineEventHandler(async (event) => {
    const method = getMethod(event)
    const query = getQuery(event)
    
    try {
        if (method === 'GET') {
            const { dineroId } = query
            
            if (dineroId) {
                // Obtener usuarios filtrados por dinero
                const dineros = await $fetch('/api/storage/dineros') || []
                const authUsers = await $fetch('/api/storage/auth-users') || []
                
                // Buscar el dinero específico
                const dinero = dineros.find(d => d.id === parseInt(dineroId))
                if (!dinero) {
                    throw createError({
                        statusCode: 404,
                        statusMessage: 'Dinero no encontrado'
                    })
                }
                
                // Obtener IDs de usuarios que pertenecen al dinero
                const memberIds = dinero.members ? dinero.members.map(m => m.userId) : []
                
                // Filtrar usuarios autenticados que son miembros del dinero
                const filteredUsers = authUsers
                    .filter(user => memberIds.includes(user.id))
                    .map(user => ({
                        id: user.id,
                        name: user.name,
                        nickname: user.nickname || user.name.split(' ')[0],
                        email: user.email,
                        avatar: user.profile?.avatar || null,
                        role: dinero.members.find(m => m.userId === user.id)?.role || 'member',
                        joinedAt: dinero.members.find(m => m.userId === user.id)?.joinedAt
                    }))
                
                return {
                    success: true,
                    data: filteredUsers,
                    dinero: {
                        id: dinero.id,
                        name: dinero.name,
                        memberCount: filteredUsers.length
                    }
                }
            } else {
                // Mantener funcionalidad anterior si no se especifica dineroId
                const users = await $fetch('/api/storage/users') || []
                return {
                    success: true,
                    data: users
                }
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
