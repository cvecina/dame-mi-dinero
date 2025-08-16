import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dame-mi-dinero-secret-key-2024'

// Función helper para verificar el token
function verifyToken(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Token de autorización requerido'
        })
    }

    const token = authHeader.substring(7)
    
    if (!token || token.trim() === '' || token.split('.').length !== 3) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Token inválido'
        })
    }
    
    try {
        return jwt.verify(token, JWT_SECRET)
    } catch (error) {
        console.error('JWT verification error:', error)
        throw createError({
            statusCode: 401,
            statusMessage: 'Token inválido'
        })
    }
}

// Función helper para leer dineros
async function readDineros() {
    try {
        const dineros = await $fetch('/api/storage/dineros') || []
        return dineros
    } catch (error) {
        console.error('Error reading dineros:', error)
        return []
    }
}

// Función helper para escribir dineros
async function writeDineros(dineros) {
    try {
        await $fetch('/api/storage/dineros', {
            method: 'PUT',
            body: dineros
        })
        return true
    } catch (error) {
        console.error('Error writing dineros:', error)
        return false
    }
}

// Función helper para leer usuarios
async function readUsers() {
    try {
        const users = await $fetch('/api/storage/users') || []
        return users
    } catch (error) {
        console.error('Error reading users:', error)
        return []
    }
}

export default defineEventHandler(async (event) => {
    const method = getMethod(event)
    
    console.log(`[Dineros Share API] ${method} request received`)

    try {
        // Verificar autenticación
        const authHeader = getHeader(event, 'authorization')
        const decoded = verifyToken(authHeader)
        const userId = decoded.userId
        
        console.log(`[Dineros Share API] User ID: ${userId}`)

        if (method === 'POST') {
            // Compartir dinero con usuario
            const { dineroId, targetUserId } = await readBody(event)
            
            if (!dineroId) {
                throw createError({
                    statusCode: 400,
                    statusMessage: 'ID del dinero es requerido'
                })
            }

            if (!targetUserId) {
                throw createError({
                    statusCode: 400,
                    statusMessage: 'ID del usuario objetivo es requerido'
                })
            }

            // No se puede compartir consigo mismo
            if (targetUserId === userId) {
                throw createError({
                    statusCode: 400,
                    statusMessage: 'No puedes compartir un dinero contigo mismo'
                })
            }

            // Verificar que el usuario objetivo existe
            const users = await readUsers()
            const targetUser = users.find(u => u.id === targetUserId)
            if (!targetUser) {
                throw createError({
                    statusCode: 404,
                    statusMessage: 'Usuario objetivo no encontrado'
                })
            }

            const allDineros = await readDineros()
            const dineroIndex = allDineros.findIndex(d => d.id === dineroId)
            
            if (dineroIndex === -1) {
                throw createError({
                    statusCode: 404,
                    statusMessage: 'Dinero no encontrado'
                })
            }

            const dinero = allDineros[dineroIndex]
            
            // Verificar que el usuario es el propietario
            if (dinero.ownerId !== userId) {
                throw createError({
                    statusCode: 403,
                    statusMessage: 'Solo el propietario puede compartir este dinero'
                })
            }

            // Verificar si ya está compartido
            if (dinero.sharedWith && dinero.sharedWith.includes(targetUserId)) {
                throw createError({
                    statusCode: 400,
                    statusMessage: 'El dinero ya está compartido con este usuario'
                })
            }

            // Compartir dinero
            if (!dinero.sharedWith) {
                dinero.sharedWith = []
            }
            dinero.sharedWith.push(targetUserId)
            dinero.updatedAt = new Date().toISOString()

            allDineros[dineroIndex] = dinero

            const saved = await writeDineros(allDineros)
            if (!saved) {
                throw createError({
                    statusCode: 500,
                    statusMessage: 'Error al compartir el dinero'
                })
            }

            console.log(`[Dineros Share API] Shared dinero ${dineroId} with user ${targetUserId}`)
            
            return {
                success: true,
                data: {
                    dinero: dinero,
                    sharedWithUser: {
                        id: targetUser.id,
                        username: targetUser.username,
                        nickname: targetUser.nickname
                    }
                },
                message: `Dinero compartido con ${targetUser.nickname || targetUser.username}`
            }
        }

        if (method === 'DELETE') {
            // Dejar de compartir dinero
            const { dineroId, targetUserId } = await readBody(event)
            
            if (!dineroId) {
                throw createError({
                    statusCode: 400,
                    statusMessage: 'ID del dinero es requerido'
                })
            }

            if (!targetUserId) {
                throw createError({
                    statusCode: 400,
                    statusMessage: 'ID del usuario objetivo es requerido'
                })
            }

            const allDineros = await readDineros()
            const dineroIndex = allDineros.findIndex(d => d.id === dineroId)
            
            if (dineroIndex === -1) {
                throw createError({
                    statusCode: 404,
                    statusMessage: 'Dinero no encontrado'
                })
            }

            const dinero = allDineros[dineroIndex]
            
            // Verificar que el usuario es el propietario
            if (dinero.ownerId !== userId) {
                throw createError({
                    statusCode: 403,
                    statusMessage: 'Solo el propietario puede dejar de compartir este dinero'
                })
            }

            // Verificar si realmente está compartido
            if (!dinero.sharedWith || !dinero.sharedWith.includes(targetUserId)) {
                throw createError({
                    statusCode: 400,
                    statusMessage: 'El dinero no está compartido con este usuario'
                })
            }

            // Dejar de compartir
            dinero.sharedWith = dinero.sharedWith.filter(id => id !== targetUserId)
            dinero.updatedAt = new Date().toISOString()

            allDineros[dineroIndex] = dinero

            const saved = await writeDineros(allDineros)
            if (!saved) {
                throw createError({
                    statusCode: 500,
                    statusMessage: 'Error al dejar de compartir el dinero'
                })
            }

            console.log(`[Dineros Share API] Unshared dinero ${dineroId} from user ${targetUserId}`)
            
            return {
                success: true,
                data: dinero,
                message: 'Dinero ya no compartido'
            }
        }

        throw createError({
            statusCode: 405,
            statusMessage: 'Método no permitido'
        })

    } catch (error) {
        console.error(`[Dineros Share API] Error:`, error)
        
        if (error.statusCode) {
            throw error
        }

        throw createError({
            statusCode: 500,
            statusMessage: error.message || 'Error interno del servidor'
        })
    }
})
