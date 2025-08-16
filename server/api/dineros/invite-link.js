import crypto from 'crypto'
import { join } from 'path'
import { promises as fs } from 'fs'

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
        console.log('[Invite Link API] Received body:', body)
        
        const { dineroId, email, role = 'member', invitedBy } = body

        console.log('[Invite Link API] Extracted values:', { dineroId, email, role, invitedBy })

        // Validaciones básicas - solo dineroId es requerido para enlaces genéricos
        if (!dineroId) {
            throw createError({
                statusCode: 400,
                statusMessage: 'dineroId es requerido'
            })
        }

        // Si se proporciona email, entonces role e invitedBy son requeridos (invitación específica)
        if (email && (!role || !invitedBy)) {
            console.log('[Invite Link API] Missing fields for specific invitation')
            throw createError({
                statusCode: 400,
                statusMessage: 'Para invitaciones específicas se requiere email, role e invitedBy'
            })
        }

        if (role && !['member', 'admin'].includes(role)) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Rol inválido'
            })
        }

        // Obtener dineros usando el endpoint de storage
        const dineros = await $fetch('/api/storage/dineros')
        
        console.log('[Invite Link API] Available dineros:', dineros.map(d => ({ id: d.id, name: d.name })))
        console.log('[Invite Link API] Looking for dineroId:', dineroId, 'as number:', parseInt(dineroId))

        // Buscar el dinero
        const dineroIndex = dineros.findIndex(d => d.id === parseInt(dineroId))
        console.log('[Invite Link API] Found dinero at index:', dineroIndex)
        
        if (dineroIndex === -1) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Dinero no encontrado'
            })
        }

        const dinero = dineros[dineroIndex]

        // Verificar permisos solo si hay un invitedBy específico
        if (invitedBy) {
            // Verificar si es el propietario del dinero
            const isOwner = dinero.ownerId === invitedBy || dinero.userId === invitedBy
            
            // Verificar si es miembro con permisos de admin
            const inviterMember = dinero.members?.find(m => m.userId === invitedBy)
            const hasAdminPermissions = inviterMember && ['owner', 'admin'].includes(inviterMember.role)
            
            console.log('[Invite Link API] Permission check:', {
                invitedBy,
                isOwner,
                dineroOwnerId: dinero.ownerId,
                dineroUserId: dinero.userId,
                hasAdminPermissions,
                members: dinero.members
            })
            
            if (!isOwner && !hasAdminPermissions) {
                throw createError({
                    statusCode: 403,
                    statusMessage: 'No tienes permisos para invitar usuarios'
                })
            }
        }

        // Verificar si el email ya está invitado o es miembro (solo para invitaciones específicas)
        if (email) {
            const existingMember = dinero.members?.find(m => {
                // Buscar usuario por ID en auth-users
                try {
                    const authUsersData = JSON.parse(require('fs').readFileSync(AUTH_USERS_FILE, 'utf-8'))
                    const user = authUsersData.find(u => u.id === m.userId)
                    return user && user.email === email
                } catch {
                    return false
                }
            })

            if (existingMember) {
                throw createError({
                    statusCode: 400,
                    statusMessage: 'Este usuario ya es miembro del dinero'
                })
            }

            const existingInvitation = dinero.invitations?.find(inv => 
                inv.email === email && inv.status === 'pending'
            )

            if (existingInvitation) {
                throw createError({
                    statusCode: 400,
                    statusMessage: 'Ya existe una invitación pendiente para este email'
                })
            }
        }

        // Generar token único para la invitación
        const invitationToken = crypto.randomBytes(32).toString('hex')
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 7) // Expira en 7 días

        // Crear la invitación
        const invitation = {
            id: Date.now(),
            email,
            role,
            invitedBy,
            dineroId: parseInt(dineroId),
            dineroName: dinero.name,
            token: invitationToken,
            status: 'pending',
            createdAt: new Date().toISOString(),
            expiresAt: expiresAt.toISOString()
        }

        // Agregar la invitación al dinero
        if (!dinero.invitations) {
            dinero.invitations = []
        }
        dinero.invitations.push(invitation)

        // Guardar cambios usando el endpoint de storage
        dineros[dineroIndex] = dinero
        await $fetch('/api/storage/dineros', {
            method: 'PUT',
            body: dineros
        })

        // Crear el enlace de invitación
        const baseUrl = process.env.NODE_ENV === 'development' 
            ? 'http://localhost:3003' 
            : 'https://tu-dominio.com'
        
        const invitationLink = `${baseUrl}/invitation/${invitationToken}`

        // Crear log de la invitación
        const logEntry = {
            id: Date.now(),
            action: 'invitation_created',
            dineroId: parseInt(dineroId),
            dineroName: dinero.name,
            invitedEmail: email,
            invitedBy,
            role,
            token: invitationToken,
            link: invitationLink,
            timestamp: new Date().toISOString(),
            ip: getClientIP(event) || 'unknown'
        }

        // Guardar log
        await saveInvitationLog(logEntry)

        console.log('invite-link-created')

        return {
            success: true,
            token: invitationToken,
            link: invitationLink,
            data: {
                invitation,
                link: invitationLink
            },
            message: 'Enlace de invitación creado exitosamente'
        }

    } catch (error) {
        console.error('Error creating invitation link:', error)
        
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
