export default defineEventHandler(async (event) => {
    if (getMethod(event) !== 'POST') {
        throw createError({
            statusCode: 405,
            statusMessage: 'Method not allowed'
        })
    }

    try {
        const { invitationId, action } = await readBody(event) // action: 'accept' | 'reject'

        // Validaciones básicas
        if (!invitationId || !action) {
            throw createError({
                statusCode: 400,
                statusMessage: 'ID de invitación y acción son obligatorios'
            })
        }

        if (!['accept', 'reject'].includes(action)) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Acción debe ser "accept" o "reject"'
            })
        }

        // Obtener dineros
        const dineros = await $fetch('/api/storage/dineros') || []

        // Buscar la invitación en todos los dineros
        let dinero = null
        let invitation = null

        for (const d of dineros) {
            if (d.invitations) {
                const inv = d.invitations.find(i => i.id === parseInt(invitationId))
                if (inv) {
                    dinero = d
                    invitation = inv
                    break
                }
            }
        }

        if (!invitation || !dinero) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Invitación no encontrada'
            })
        }

        // Verificar si la invitación ya fue procesada
        if (invitation.status !== 'pending') {
            throw createError({
                statusCode: 409,
                statusMessage: 'Esta invitación ya fue procesada'
            })
        }

        // Verificar si la invitación ha expirado
        if (new Date() > new Date(invitation.expiresAt)) {
            throw createError({
                statusCode: 410,
                statusMessage: 'Esta invitación ha expirado'
            })
        }

        let message = ''

        if (action === 'accept') {
            // Inicializar members si no existe
            if (!dinero.members) {
                dinero.members = []
            }

            // Agregar como miembro
            const newMember = {
                userId: invitation.userId,
                role: invitation.role,
                joinedAt: new Date().toISOString(),
                invitedBy: invitation.invitedBy || null
            }

            dinero.members.push(newMember)
            invitation.status = 'accepted'
            invitation.acceptedAt = new Date().toISOString()
            message = `Te has unido exitosamente a "${dinero.name}"`

        } else if (action === 'reject') {
            invitation.status = 'rejected'
            invitation.rejectedAt = new Date().toISOString()
            message = `Has rechazado la invitación a "${dinero.name}"`
        }

        dinero.updatedAt = new Date().toISOString()

        // Guardar cambios
        await $fetch('/api/storage/dineros', {
            method: 'PUT',
            body: dineros
        })

        return {
            success: true,
            data: {
                dinero: {
                    id: dinero.id,
                    name: dinero.name,
                    color: dinero.color
                },
                action: action,
                invitation: invitation
            },
            message: message
        }

    } catch (error) {
        console.error('Invitation response error:', error)
        
        if (error.statusCode) {
            throw error
        }
        
        throw createError({
            statusCode: 500,
            statusMessage: 'Error interno del servidor'
        })
    }
})
