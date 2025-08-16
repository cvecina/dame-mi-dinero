export default defineEventHandler(async (event) => {
    const method = getMethod(event)
    const storageFile = 'data/auth-users.json'
    
    try {
        if (method === 'GET') {
            // Obtener usuarios de autenticación
            const data = await $fetch('/api/storage/read', {
                method: 'POST',
                body: { file: storageFile }
            }) || { users: [] }
            
            // Si el data es un array (formato legacy), devolverlo directamente
            if (Array.isArray(data)) {
                return data
            }
            
            // Si es un objeto con propiedad users, devolver solo los usuarios
            return data.users || []
        }
        
        if (method === 'PUT') {
            // Guardar usuarios de autenticación
            const users = await readBody(event)
            
            // Determinar el formato a guardar
            let dataToSave
            if (Array.isArray(users)) {
                // Si recibimos un array, guardarlo en el nuevo formato
                dataToSave = { users: users }
            } else if (users.users) {
                // Si ya está en el formato correcto, guardarlo tal como está
                dataToSave = users
            } else {
                // Fallback
                dataToSave = { users: [] }
            }
            
            await $fetch('/api/storage/write', {
                method: 'POST',
                body: { 
                    file: storageFile,
                    data: dataToSave
                }
            })
            
            return {
                success: true,
                message: 'Usuarios guardados correctamente'
            }
        }
        
        throw createError({
            statusCode: 405,
            statusMessage: 'Method not allowed'
        })
        
    } catch (error) {
        console.error('Auth users storage error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Error en el almacenamiento de usuarios'
        })
    }
})
