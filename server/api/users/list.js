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
    
    console.log(`[Users List API] ${method} request received`)

    try {
        // Verificar autenticación
        const authHeader = getHeader(event, 'authorization')
        const decoded = verifyToken(authHeader)
        const userId = decoded.userId
        
        console.log(`[Users List API] User ID: ${userId}`)

        if (method === 'GET') {
            // Obtener lista de usuarios (sin información sensible)
            const allUsers = await readUsers()
            
            // Filtrar información sensible y excluir al usuario actual
            const filteredUsers = allUsers
                .filter(user => user.id !== userId)
                .map(user => ({
                    id: user.id,
                    username: user.username,
                    nickname: user.nickname || user.username,
                    createdAt: user.createdAt
                }))
            
            console.log(`[Users List API] Found ${filteredUsers.length} users`)
            
            return {
                success: true,
                data: filteredUsers
            }
        }

        throw createError({
            statusCode: 405,
            statusMessage: 'Método no permitido'
        })

    } catch (error) {
        console.error(`[Users List API] Error:`, error)
        
        if (error.statusCode) {
            throw error
        }

        throw createError({
            statusCode: 500,
            statusMessage: error.message || 'Error interno del servidor'
        })
    }
})
