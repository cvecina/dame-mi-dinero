import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

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
        await $fetch('/api/storage/auth-users', {
            method: 'PUT',
            body: users
        })
        return true
    } catch (error) {
        console.error('Error writing users:', error)
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

    console.log('[Change Password] Request received')

    try {
        // Verificar token de autorización
        const authHeader = getHeader(event, 'authorization')
        const decoded = verifyToken(authHeader)
        const userId = decoded.userId
        console.log('[Change Password] User ID from token:', userId)

        // Leer datos del cuerpo de la petición
        const body = await readBody(event)
        const { currentPassword, newPassword } = body
        console.log('[Change Password] Request data received')

        // Validaciones básicas
        if (!currentPassword || !newPassword) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Contraseña actual y nueva contraseña son requeridas'
            })
        }

        if (newPassword.length < 6) {
            throw createError({
                statusCode: 400,
                statusMessage: 'La nueva contraseña debe tener al menos 6 caracteres'
            })
        }

        if (currentPassword === newPassword) {
            throw createError({
                statusCode: 400,
                statusMessage: 'La nueva contraseña debe ser diferente a la actual'
            })
        }

        // Leer usuarios existentes
        console.log('[Change Password] Reading users...')
        const users = await readUsers()
        const userIndex = users.findIndex(u => u.id === userId)

        if (userIndex === -1) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Usuario no encontrado'
            })
        }

        const user = users[userIndex]

        // Verificar contraseña actual
        console.log('[Change Password] Verifying current password...')
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)

        if (!isCurrentPasswordValid) {
            throw createError({
                statusCode: 400,
                statusMessage: 'La contraseña actual no es correcta'
            })
        }

        // Generar hash de la nueva contraseña
        console.log('[Change Password] Hashing new password...')
        const saltRounds = 12
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds)

        // Actualizar contraseña del usuario
        const updatedUser = {
            ...user,
            password: hashedNewPassword,
            updatedAt: new Date().toISOString(),
            passwordChangedAt: new Date().toISOString()
        }

        users[userIndex] = updatedUser
        console.log('[Change Password] User password updated')

        // Guardar cambios
        console.log('[Change Password] Saving changes...')
        const saved = await writeUsers(users)
        
        if (!saved) {
            throw createError({
                statusCode: 500,
                statusMessage: 'Error al guardar los cambios'
            })
        }

        console.log('[Change Password] Success!')

        return {
            success: true,
            message: 'Contraseña cambiada correctamente'
        }

    } catch (error) {
        console.error('[Change Password] Error:', error)
        
        if (error.statusCode) {
            throw error
        }

        throw createError({
            statusCode: 500,
            statusMessage: error.message || 'Error interno del servidor'
        })
    }
})
