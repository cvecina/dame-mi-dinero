import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dame-mi-dinero-secret-key-2024'

// Función helper para leer usuarios
async function readUsers() {
    try {
        const users = await $fetch('/api/storage/auth-users') || []
        return users
    } catch (error) {
        console.error('Error reading users:', error)
        return []
    }
}

// Función helper para escribir usuarios
async function writeUsers(users) {
    try {
        console.log('[writeUsers] Starting write operation with', users.length, 'users')
        
        const response = await $fetch('/api/storage/auth-users', {
            method: 'PUT',
            body: users
        })
        
        console.log('[writeUsers] Response:', response)
        return true
    } catch (error) {
        console.error('[writeUsers] Error writing users:', error)
        return false
    }
}

// Función helper para verificar el token
function verifyToken(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Token de autorización requerido'
        })
    }

    const token = authHeader.substring(7)
    
    // Validar formato del token
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

export default defineEventHandler(async (event) => {
    if (getMethod(event) !== 'PUT') {
        throw createError({
            statusCode: 405,
            statusMessage: 'Método no permitido'
        })
    }

    console.log('[Profile Update] Request received')

    try {
        // Verificar token de autorización
        const authHeader = getHeader(event, 'authorization')
        console.log('[Profile Update] Auth header present:', !!authHeader)
        
        const decoded = verifyToken(authHeader)
        const userId = decoded.userId
        console.log('[Profile Update] User ID from token:', userId)

        // Leer datos del cuerpo de la petición
        const body = await readBody(event)
        const { name, nickname, email } = body
        console.log('[Profile Update] Request data:', { name, nickname, email })

        // Validaciones básicas
        if (!name || !nickname || !email) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Todos los campos son requeridos'
            })
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw createError({
                statusCode: 400,
                statusMessage: 'El email no tiene un formato válido'
            })
        }

        if (nickname.length < 2) {
            throw createError({
                statusCode: 400,
                statusMessage: 'El apodo debe tener al menos 2 caracteres'
            })
        }

        // Leer usuarios existentes
        console.log('[Profile Update] Reading users...')
        const users = await readUsers()
        console.log('[Profile Update] Users found:', users.length)
        
        const userIndex = users.findIndex(u => u.id === userId)
        console.log('[Profile Update] User index:', userIndex)

        if (userIndex === -1) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Usuario no encontrado'
            })
        }

        // Verificar si el email ya existe en otro usuario
        const existingEmailUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.id !== userId)
        if (existingEmailUser) {
            throw createError({
                statusCode: 409,
                statusMessage: 'El email ya está en uso por otro usuario'
            })
        }

        // Actualizar datos del usuario
        console.log('[Profile Update] Updating user data...')
        const updatedUser = {
            ...users[userIndex],
            name: name.trim(),
            nickname: nickname.trim(),
            email: email.toLowerCase().trim(),
            updatedAt: new Date().toISOString()
        }

        users[userIndex] = updatedUser
        console.log('[Profile Update] User updated:', updatedUser.id)

        // Guardar cambios
        console.log('[Profile Update] Saving changes...')
        const saved = await writeUsers(users)
        console.log('[Profile Update] Save result:', saved)
        
        if (!saved) {
            throw createError({
                statusCode: 500,
                statusMessage: 'Error al guardar los cambios'
            })
        }

        // Retornar usuario actualizado (sin la contraseña)
        const { password, ...userResponse } = updatedUser
        console.log('[Profile Update] Success!')

        return {
            success: true,
            message: 'Perfil actualizado correctamente',
            data: userResponse
        }

    } catch (error) {
        console.error('[Profile Update] Error:', error)
        
        if (error.statusCode) {
            throw error
        }

        throw createError({
            statusCode: 500,
            statusMessage: error.message || 'Error interno del servidor'
        })
    }
})
