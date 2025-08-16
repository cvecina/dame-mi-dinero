import { promises as fs } from 'fs'
import { join } from 'path'

const DINEROS_FILE = join(process.cwd(), 'data', 'dineros.json')
const AUTH_USERS_FILE = join(process.cwd(), 'data', 'auth-users.json')

export default defineEventHandler(async (event) => {
    const method = getMethod(event)
    
    if (method !== 'POST') {
        throw createError({
            statusCode: 405,
            statusMessage: 'Method Not Allowed'
        })
    }

    try {
        const body = await readBody(event)
        const { token, action, userId } = body

        // Validaciones
        if (!token || !action || !userId) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Token, acción y usuario son requeridos'
            })
        }

        if (!['accept', 'decline'].includes(action)) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Acción inválida'
            })
        }

        // Leer dineros
        const dinerosData = await fs.readFile(DINEROS_FILE, 'utf-8')
        const dineros = JSON.parse(dinerosData)

        // Buscar la invitación por token
        let invitation = null
        let dinero = null
        let dineroIndex = -1
        let invitationIndex = -1

        for (let i = 0; i < dineros.length; i++) {
            if (dineros[i].invitations) {
                const foundIndex = dineros[i].invitations.findIndex(inv => inv.token === token)
                if (foundIndex !== -1) {
                    invitation = dineros[i].invitations[foundIndex]
                    dinero = dineros[i]
                    dineroIndex = i
                    invitationIndex = foundIndex
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

        // Verificar que el usuario corresponde al email de la invitación
        const authUsersData = await fs.readFile(AUTH_USERS_FILE, 'utf-8')
        const authUsers = JSON.parse(authUsersData)
        const user = authUsers.find(u => u.id === userId)

        if (!user || user.email !== invitation.email) {
            throw createError({
                statusCode: 403,
                statusMessage: 'Usuario no autorizado para esta invitación'
            })
        }

        // Actualizar el estado de la invitación
        invitation.status = action === 'accept' ? 'accepted' : 'declined'
        invitation.respondedAt = new Date().toISOString()
        invitation.respondedBy = userId

        // Si acepta la invitación, agregar como miembro
        if (action === 'accept') {
            if (!dinero.members) {
                dinero.members = []
            }

            // Verificar que no sea ya miembro
            const existingMember = dinero.members.find(m => m.userId === userId)
            if (!existingMember) {
                dinero.members.push({
                    userId: userId,
                    role: invitation.role,
                    joinedAt: new Date().toISOString(),
                    invitedBy: invitation.invitedBy
                })
            }
        }

        // Actualizar los datos
        dineros[dineroIndex].invitations[invitationIndex] = invitation
        if (action === 'accept') {
            dineros[dineroIndex] = dinero
        }

        // Guardar cambios
        await fs.writeFile(DINEROS_FILE, JSON.stringify(dineros, null, 2))

        // Crear log de la respuesta
        const logEntry = {
            id: Date.now(),
            action: `invitation_${action}ed`,
            dineroId: dinero.id,
            dineroName: dinero.name,
            userId: userId,
            userEmail: user.email,
            userName: user.name,
            role: invitation.role,
            token: token,
            invitationId: invitation.id,
            timestamp: new Date().toISOString(),
            ip: getClientIP(event) || 'unknown'
        }

        // Guardar log
        await saveInvitationLog(logEntry)

        console.log(`invitation-${action}ed`)

        return {
            success: true,
            data: {
                status: invitation.status,
                dinero: {
                    id: dinero.id,
                    name: dinero.name
                },
                role: invitation.role
            },
            message: action === 'accept' 
                ? `¡Bienvenido al dinero "${dinero.name}"!` 
                : 'Invitación rechazada exitosamente'
        }

    } catch (error) {
        console.error('Error processing invitation response:', error)
        
        if (error.statusCode) {
            throw error
        }
        
        throw createError({
            statusCode: 500,
            statusMessage: 'Error interno del servidor'
        })
    }
})

// Función auxiliar para obtener IP del cliente
function getClientIP(event) {
    const headers = getHeaders(event)
    return headers['x-forwarded-for'] || 
           headers['x-real-ip'] || 
           headers['cf-connecting-ip'] || 
           'unknown'
}

// Función auxiliar para guardar logs
async function saveInvitationLog(logEntry) {
    const LOGS_DIR = join(process.cwd(), 'data', 'logs')
    const LOGS_FILE = join(LOGS_DIR, 'invitations.json')

    try {
        // Crear directorio de logs si no existe
        await fs.mkdir(LOGS_DIR, { recursive: true })

        let logs = []
        try {
            const logsData = await fs.readFile(LOGS_FILE, 'utf-8')
            logs = JSON.parse(logsData)
        } catch {
            // Archivo no existe, empezar con array vacío
        }

        logs.push(logEntry)

        // Mantener solo los últimos 1000 logs
        if (logs.length > 1000) {
            logs = logs.slice(-1000)
        }

        await fs.writeFile(LOGS_FILE, JSON.stringify(logs, null, 2))
    } catch (error) {
        console.error('Error saving invitation log:', error)
    }
}
