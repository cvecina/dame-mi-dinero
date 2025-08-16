import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
    if (getMethod(event) !== 'POST') {
        throw createError({
            statusCode: 405,
            statusMessage: 'Method not allowed'
        })
    }

    try {
        const { email, password } = await readBody(event)

        // Validaciones básicas
        if (!email || !password) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Email y contraseña son obligatorios'
            })
        }

        // Obtener usuarios existentes
        const users = await $fetch('/api/storage/auth-users') || []
        
        // Buscar usuario por email
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase())
        
        if (!user) {
            throw createError({
                statusCode: 401,
                statusMessage: 'Credenciales inválidas'
            })
        }

        // Verificar contraseña
        const isValidPassword = await bcrypt.compare(password, user.password)
        
        if (!isValidPassword) {
            throw createError({
                statusCode: 401,
                statusMessage: 'Credenciales inválidas'
            })
        }

        // Verificar si el usuario está activo
        if (user.status !== 'active') {
            throw createError({
                statusCode: 401,
                statusMessage: 'Cuenta desactivada. Contacta al administrador'
            })
        }

        // Generar JWT
        const jwtSecret = process.env.JWT_SECRET || 'dame-mi-dinero-secret-key-2024'
        const token = jwt.sign(
            { 
                userId: user.id, 
                email: user.email,
                name: user.name,
                nickname: user.nickname
            },
            jwtSecret,
            { expiresIn: '7d' }
        )

        // Actualizar última conexión
        user.lastLogin = new Date().toISOString()
        
        // Guardar usuarios actualizados
        await $fetch('/api/storage/auth-users', {
            method: 'PUT',
            body: users
        })

        // Remover contraseña de la respuesta
        const { password: _, ...userWithoutPassword } = user

        return {
            success: true,
            data: {
                user: userWithoutPassword,
                token
            },
            message: 'Login exitoso'
        }

    } catch (error) {
        console.error('Login error:', error)
        
        if (error.statusCode) {
            throw error
        }
        
        throw createError({
            statusCode: 500,
            statusMessage: 'Error interno del servidor'
        })
    }
})
