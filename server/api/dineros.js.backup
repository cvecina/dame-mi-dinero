import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

const DINEROS_FILE = join(process.cwd(), 'data', 'dineros.json')

// Asegurar que el directorio y archivo existen
function ensureDinerosFile() {
    const dataDir = join(process.cwd(), 'data')
    if (!existsSync(dataDir)) {
        import('fs').then(fs => fs.mkdirSync(dataDir, { recursive: true }))
    }
    
    if (!existsSync(DINEROS_FILE)) {
        const defaultDinero = {
            id: 1,
            name: "Dineros sin nombre",
            description: "Contenedor por defecto para gastos sin dinero asignado",
            isDefault: true,
            color: "#3A7CA5",
            createdAt: new Date().toISOString()
        }
        writeFileSync(DINEROS_FILE, JSON.stringify([defaultDinero], null, 2))
    }
}

function getDineros() {
    try {
        ensureDinerosFile()
        const data = readFileSync(DINEROS_FILE, 'utf8')
        return JSON.parse(data)
    } catch (error) {
        console.error('[Dineros API] Error reading dineros:', error)
        return []
    }
}

function saveDineros(dineros) {
    try {
        ensureDinerosFile()
        writeFileSync(DINEROS_FILE, JSON.stringify(dineros, null, 2))
        return true
    } catch (error) {
        console.error('[Dineros API] Error saving dineros:', error)
        return false
    }
}

export default defineEventHandler(async (event) => {
    const method = getMethod(event)
    
    console.log(`[Dineros API] ${method} request received`)
    console.log(`[Dineros API] Environment: ${process.env.NODE_ENV}`)
    
    // Verificar disponibilidad de Redis
    const isRedisAvailable = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
    console.log(`[Dineros API] KV_REST_API_URL exists: ${!!process.env.KV_REST_API_URL}`)
    console.log(`[Dineros API] Redis available: ${isRedisAvailable}`)
    
    try {
        if (isRedisAvailable) {
            // Usar Redis en producción
            const { createClient } = await import('@vercel/kv')
            const kv = createClient({
                url: process.env.KV_REST_API_URL,
                token: process.env.KV_REST_API_TOKEN,
            })
            
            if (method === 'GET') {
                const dineros = await kv.get('dineros') || []
                console.log(`[Dineros API] Retrieved ${dineros.length} dineros from Redis`)
                return { success: true, data: dineros }
            }
            
            if (method === 'POST') {
                const body = await readBody(event)
                const dineros = await kv.get('dineros') || []
                
                const newDinero = {
                    id: Date.now(),
                    ...body,
                    createdAt: new Date().toISOString()
                }
                
                dineros.push(newDinero)
                await kv.set('dineros', dineros)
                
                console.log('[Dineros API] Dinero added to Redis')
                return { success: true, data: newDinero }
            }
            
            if (method === 'PUT') {
                const body = await readBody(event)
                const dineros = await kv.get('dineros') || []
                
                const dineroIndex = dineros.findIndex(d => d.id === body.id)
                if (dineroIndex === -1) {
                    throw createError({
                        statusCode: 404,
                        statusMessage: 'Dinero no encontrado'
                    })
                }
                
                dineros[dineroIndex] = { ...dineros[dineroIndex], ...body, updatedAt: new Date().toISOString() }
                await kv.set('dineros', dineros)
                
                console.log('[Dineros API] Dinero updated in Redis')
                return { success: true, data: dineros[dineroIndex] }
            }
            
            if (method === 'DELETE') {
                const query = getQuery(event)
                const dineros = await kv.get('dineros') || []
                
                const dineroToDelete = dineros.find(d => d.id === parseInt(query.id))
                if (dineroToDelete && dineroToDelete.isDefault) {
                    throw createError({
                        statusCode: 400,
                        statusMessage: 'No se puede eliminar el dinero por defecto'
                    })
                }
                
                const filteredDineros = dineros.filter(d => d.id !== parseInt(query.id))
                await kv.set('dineros', filteredDineros)
                
                console.log('[Dineros API] Dinero deleted from Redis')
                return { success: true, data: null }
            }
        } else {
            // Usar almacenamiento local en desarrollo
            console.log('[Dineros API] Using local file storage')
            
            if (method === 'GET') {
                const dineros = getDineros()
                console.log(`[Dineros API] Retrieved ${dineros.length} dineros from file`)
                return { success: true, data: dineros }
            }
            
            if (method === 'POST') {
                const body = await readBody(event)
                const dineros = getDineros()
                
                const newDinero = {
                    id: Date.now(),
                    ...body,
                    createdAt: new Date().toISOString()
                }
                
                dineros.push(newDinero)
                saveDineros(dineros)
                
                console.log('[Dineros API] Dinero added to file')
                return { success: true, data: newDinero }
            }
            
            if (method === 'PUT') {
                const body = await readBody(event)
                const dineros = getDineros()
                
                const dineroIndex = dineros.findIndex(d => d.id === body.id)
                if (dineroIndex === -1) {
                    throw createError({
                        statusCode: 404,
                        statusMessage: 'Dinero no encontrado'
                    })
                }
                
                dineros[dineroIndex] = { ...dineros[dineroIndex], ...body, updatedAt: new Date().toISOString() }
                saveDineros(dineros)
                
                console.log('[Dineros API] Dinero updated in file')
                return { success: true, data: dineros[dineroIndex] }
            }
            
            if (method === 'DELETE') {
                const query = getQuery(event)
                const dineros = getDineros()
                
                const dineroToDelete = dineros.find(d => d.id === parseInt(query.id))
                if (dineroToDelete && dineroToDelete.isDefault) {
                    throw createError({
                        statusCode: 400,
                        statusMessage: 'No se puede eliminar el dinero por defecto'
                    })
                }
                
                const filteredDineros = dineros.filter(d => d.id !== parseInt(query.id))
                saveDineros(filteredDineros)
                
                console.log('[Dineros API] Dinero deleted from file')
                return { success: true, data: null }
            }
        }
        
        throw createError({
            statusCode: 405,
            statusMessage: 'Método no permitido'
        })
        
    } catch (error) {
        console.error('[Dineros API] Error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: error.message || 'Error interno del servidor'
        })
    }
});
