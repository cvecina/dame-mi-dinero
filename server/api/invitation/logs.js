import { promises as fs } from 'fs'
import { join } from 'path'

export default defineEventHandler(async (event) => {
    const method = getMethod(event)
    
    if (method !== 'GET') {
        throw createError({
            statusCode: 405,
            statusMessage: 'Method Not Allowed'
        })
    }

    try {
        const LOGS_DIR = join(process.cwd(), 'data', 'logs')
        const LOGS_FILE = join(LOGS_DIR, 'invitations.json')

        try {
            const logsData = await fs.readFile(LOGS_FILE, 'utf-8')
            const allLogs = JSON.parse(logsData)
            
            // Retornar los últimos 50 logs
            const recentLogs = allLogs.slice(-50).reverse()
            
            return {
                success: true,
                data: recentLogs,
                count: allLogs.length
            }
        } catch (error) {
            // Si no existe el archivo de logs, retornar array vacío
            return {
                success: true,
                data: [],
                count: 0,
                message: 'No hay logs de invitaciones aún'
            }
        }

    } catch (error) {
        console.error('Error reading invitation logs:', error)
        
        throw createError({
            statusCode: 500,
            statusMessage: 'Error interno del servidor'
        })
    }
})
