export default defineEventHandler(async (event) => {
    if (getMethod(event) !== 'POST') {
        throw createError({
            statusCode: 405,
            statusMessage: 'Method not allowed'
        })
    }

    try {
        const { dineroId, email, role = 'member' } = await readBody(event)

        // Validaciones básicas
        if (!dineroId || !email) {
            throw createError({
                statusCode: 400,
                statusMessage: 'ID del dinero y email son obligatorios'
            })
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Formato de email inválido'
            })
        }

        // Obtener dineros y usuarios
        const dineros = await $fetch('/api/storage/dineros') || []
        const users = await $fetch('/api/storage/auth-users') || []

        // Buscar el dinero
        const dinero = dineros.find(d => d.id === parseInt(dineroId))
        if (!dinero) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Dinero no encontrado'
            })
        }

        // Buscar el usuario a invitar
        const userToInvite = users.find(u => u.email.toLowerCase() === email.toLowerCase())
        if (!userToInvite) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Usuario no encontrado. Debe estar registrado en la aplicación'
            })
        }

        // Verificar si ya es miembro
        const isAlreadyMember = dinero.members && dinero.members.find(m => m.userId === userToInvite.id)
        if (isAlreadyMember) {
            throw createError({
                statusCode: 409,
                statusMessage: 'El usuario ya es miembro de este dinero'
            })
        }

        // Verificar si ya tiene una invitación pendiente
        const existingInvitation = dinero.invitations && dinero.invitations.find(i => 
            i.email.toLowerCase() === email.toLowerCase() && i.status === 'pending'
        )
        if (existingInvitation) {
            throw createError({
                statusCode: 409,
                statusMessage: 'Ya existe una invitación pendiente para este usuario'
            })
        }

        // Crear la invitación
        const invitation = {
            id: Date.now(),
            email: email.toLowerCase(),
            userId: userToInvite.id,
            role: role,
            status: 'pending',
            invitedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 días
        }

        // Inicializar invitations si no existe
        if (!dinero.invitations) {
            dinero.invitations = []
        }

        // Agregar la invitación
        dinero.invitations.push(invitation)
        dinero.updatedAt = new Date().toISOString()

        // Guardar cambios
        await $fetch('/api/storage/dineros', {
            method: 'PUT',
            body: dineros
        })

        return {
            success: true,
            data: {
                invitation: {
                    ...invitation,
                    dineroName: dinero.name,
                    userName: userToInvite.name
                }
            },
            message: `Invitación enviada a ${userToInvite.name} (${email})`
        }

    } catch (error) {
        console.error('Invitation error:', error)
        
        if (error.statusCode) {
            throw error
        }
        
        throw createError({
            statusCode: 500,
            statusMessage: 'Error interno del servidor'
        })
    }
})
