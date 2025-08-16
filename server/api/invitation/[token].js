import { promises as fs } from 'fs'
import { join } from 'path'

const DINEROS_FILE = join(process.cwd(), 'data', 'dineros.json')
const AUTH_USERS_FILE = join(process.cwd(), 'data', 'auth-users.json')

export default defineEventHandler(async (event) => {
    const method = getMethod(event)
    
    if (method !== 'GET') {
        throw createError({
            statusCode: 405,
            statusMessage: 'Method Not Allowed'
        })
    }

    try {
        const token = getRouterParam(event, 'token')
        
        if (!token) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Token de invitación requerido'
            })
        }

        // Leer dineros
        const dinerosData = await fs.readFile(DINEROS_FILE, 'utf-8')
        const dineros = JSON.parse(dinerosData)

        // Buscar la invitación por token
        let invitation = null
        let dinero = null

        for (const d of dineros) {
            if (d.invitations) {
                const found = d.invitations.find(inv => inv.token === token)
                if (found) {
                    invitation = found
                    dinero = d
                    break
                }
            }
        }

        if (!invitation) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Invitación no encontrada'
            })
        }

        // Verificar si la invitación ha expirado
        const now = new Date()
        const expiresAt = new Date(invitation.expiresAt)
        
        if (now > expiresAt) {
            throw createError({
                statusCode: 410,
                statusMessage: 'La invitación ha expirado'
            })
        }

        // Verificar si la invitación ya fue procesada
        if (invitation.status !== 'pending') {
            throw createError({
                statusCode: 400,
                statusMessage: `La invitación ya fue ${invitation.status === 'accepted' ? 'aceptada' : 'rechazada'}`
            })
        }

        // Obtener información del usuario que invitó
        let inviterInfo = null
        try {
            const authUsersData = await fs.readFile(AUTH_USERS_FILE, 'utf-8')
            const authUsers = JSON.parse(authUsersData)
            const inviter = authUsers.find(u => u.id === invitation.invitedBy)
            if (inviter) {
                inviterInfo = {
                    name: inviter.name,
                    nickname: inviter.nickname,
                    email: inviter.email
                }
            }
        } catch {
            // No se pudo obtener info del invitador
        }

        console.log('invitation-info-retrieved')

        return {
            success: true,
            data: {
                invitation: {
                    id: invitation.id,
                    email: invitation.email,
                    role: invitation.role,
                    dineroId: invitation.dineroId,
                    dineroName: invitation.dineroName,
                    status: invitation.status,
                    createdAt: invitation.createdAt,
                    expiresAt: invitation.expiresAt
                },
                dinero: {
                    id: dinero.id,
                    name: dinero.name,
                    description: dinero.description,
                    membersCount: dinero.members?.length || 0
                },
                inviter: inviterInfo
            }
        }

    } catch (error) {
        console.error('Error retrieving invitation info:', error)
        
        if (error.statusCode) {
            throw error
        }
        
        throw createError({
            statusCode: 500,
            statusMessage: 'Error interno del servidor'
        })
    }
})
