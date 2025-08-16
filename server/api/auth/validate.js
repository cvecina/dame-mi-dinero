import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
    if (getMethod(event) !== 'POST') {
        throw createError({
            statusCode: 405,
            statusMessage: 'Method not allowed'
        })
    }

    try {
        const authHeader = getHeader(event, 'authorization')
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw createError({
                statusCode: 401,
                statusMessage: 'Token de autorización requerido'
            })
        }

        const token = authHeader.substring(7)
        
        // Validar que el token no esté vacío y tenga el formato básico de JWT
        if (!token || token.trim() === '' || token.split('.').length !== 3) {
            console.log('Invalid token format:', token)
            throw createError({
                statusCode: 401,
                statusMessage: 'Token inválido'
            })
        }
        
        const jwtSecret = process.env.JWT_SECRET || 'dame-mi-dinero-secret-key-2024'

        // Verificar token
        const decoded = jwt.verify(token, jwtSecret)
        
        // Obtener usuarios para verificar que el usuario existe y está activo
        const users = await $fetch('/api/storage/auth-users') || []
        const user = users.find(u => u.id === decoded.userId)
        
        if (!user) {
            throw createError({
                statusCode: 401,
                statusMessage: 'Usuario no encontrado'
            })
        }

        if (user.status !== 'active') {
            throw createError({
                statusCode: 401,
                statusMessage: 'Cuenta desactivada'
            })
        }

        return {
            success: true,
            data: {
                userId: user.id,
                email: user.email,
                name: user.name
            },
            message: 'Token válido'
        }

    } catch (error) {
        console.error('Token validation error:', error)
        
        if (error.name === 'JsonWebTokenError') {
            throw createError({
                statusCode: 401,
                statusMessage: 'Token inválido'
            })
        }
        
        if (error.name === 'TokenExpiredError') {
            throw createError({
                statusCode: 401,
                statusMessage: 'Token expirado'
            })
        }
        
        if (error.statusCode) {
            throw error
        }
        
        throw createError({
            statusCode: 500,
            statusMessage: 'Error interno del servidor'
        })
    }
})
