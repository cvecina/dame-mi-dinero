import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
    console.log('[REGISTER API] Request received')
    
    if (getMethod(event) !== 'POST') {
        console.log('[REGISTER API] Method not allowed:', getMethod(event))
        throw createError({
            statusCode: 405,
            statusMessage: 'Method not allowed'
        })
    }

    try {
        console.log('[REGISTER API] Processing registration...')
        const { name, email, password, confirmPassword, nickname } = await readBody(event)
        console.log('[REGISTER API] Data received:', { name, email, hasPassword: !!password, nickname })

        // Validaciones básicas
        if (!name || !email || !password) {
            console.log('[REGISTER API] Missing required fields')
            throw createError({
                statusCode: 400,
                statusMessage: 'Nombre, email y contraseña son obligatorios'
            })
        }

        if (confirmPassword && password !== confirmPassword) {
            console.log('[REGISTER API] Passwords do not match')
            throw createError({
                statusCode: 400,
                statusMessage: 'Las contraseñas no coinciden'
            })
        }

        if (password.length < 6) {
            console.log('[REGISTER API] Password too short')
            throw createError({
                statusCode: 400,
                statusMessage: 'La contraseña debe tener al menos 6 caracteres'
            })
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            console.log('[REGISTER API] Invalid email format')
            throw createError({
                statusCode: 400,
                statusMessage: 'Formato de email inválido'
            })
        }

        // Obtener usuarios existentes
        console.log('[REGISTER API] Fetching existing users...')
        const users = await $fetch('/api/storage/auth-users') || []
        console.log('[REGISTER API] Current users count:', users.length)
        
        // Verificar si el email ya existe
        const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase())
        if (existingUser) {
            console.log('[REGISTER API] Email already exists')
            throw createError({
                statusCode: 409,
                statusMessage: 'Este email ya está registrado'
            })
        }

        // Generar username único del email
        let username = email.split('@')[0]
        const existingUsername = users.find(u => u.username === username)
        if (existingUsername) {
            const baseUsername = username
            let counter = 1
            let newUsername = `${baseUsername}${counter}`
            while (users.find(u => u.username === newUsername)) {
                counter++
                newUsername = `${baseUsername}${counter}`
            }
            username = newUsername
        }

        // Encriptar contraseña
        console.log('[REGISTER API] Hashing password...')
        const saltRounds = 12
        const hashedPassword = await bcrypt.hash(password, saltRounds)

        // Crear nuevo usuario
        console.log('[REGISTER API] Creating new user...')
        const newUser = {
            id: Date.now(),
            name: name.trim(),
            username: username,
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            status: 'active',
            role: 'user',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastLogin: null,
            emailVerified: false,
            profile: {
                avatar: null,
                preferences: {
                    notifications: true,
                    language: 'es',
                    currency: 'EUR'
                }
            },
            nickname: nickname || name.split(' ')[0],
            passwordChangedAt: new Date().toISOString()
        }

        // Agregar usuario a la lista
        users.push(newUser)

        // Guardar usuarios actualizados
        console.log('[REGISTER API] Saving user to storage...')
        await $fetch('/api/storage/auth-users', {
            method: 'PUT',
            body: users
        })

        // Generar JWT automáticamente
        console.log('[REGISTER API] Generating JWT...')
        const jwtSecret = process.env.JWT_SECRET || 'dame-mi-dinero-secret-key-2024'
        const token = jwt.sign(
            { 
                userId: newUser.id, 
                email: newUser.email,
                name: newUser.name,
                nickname: newUser.nickname
            },
            jwtSecret,
            { expiresIn: '7d' }
        )

        // Crear dinero principal automáticamente para el nuevo usuario
        try {
            console.log('[REGISTER API] Creating default dinero...')
            const dineros = await $fetch('/api/storage/dineros') || []
            const newDinero = {
                id: Date.now() + Math.floor(Math.random() * 1000),
                name: 'Mi Dinero Principal',
                color: 'blue',
                userId: newUser.id,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
            dineros.push(newDinero)
            
            await $fetch('/api/storage/dineros', {
                method: 'PUT',
                body: dineros
            })
            console.log('[REGISTER API] Default dinero created')
        } catch (dineroError) {
            console.warn('[REGISTER API] Could not create default dinero:', dineroError)
        }

        // Remover contraseña de la respuesta
        const { password: _, ...userWithoutPassword } = newUser

        console.log('[REGISTER API] Registration successful for user:', newUser.email)
        return {
            success: true,
            data: {
                user: userWithoutPassword,
                token
            },
            message: 'Usuario registrado exitosamente'
        }

    } catch (error) {
        console.error('[REGISTER API] Registration error:', error)
        
        if (error.statusCode) {
            throw error
        }
        
        throw createError({
            statusCode: 500,
            statusMessage: 'Error interno del servidor'
        })
    }
})
