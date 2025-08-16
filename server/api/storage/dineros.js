import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DATA_DIR = path.join(__dirname, '../../../data')
const DINEROS_FILE = path.join(DATA_DIR, 'dineros.json')

// Asegurar que el directorio data existe
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
}

// Función helper para leer dineros
function readDineros() {
    try {
        if (!fs.existsSync(DINEROS_FILE)) {
            // Crear archivo inicial con dineros por defecto si no existe
            const defaultDineros = []
            fs.writeFileSync(DINEROS_FILE, JSON.stringify(defaultDineros, null, 2))
            return defaultDineros
        }
        
        const data = fs.readFileSync(DINEROS_FILE, 'utf8')
        const parsed = JSON.parse(data)
        
        // Asegurar que siempre devolvemos un array
        return Array.isArray(parsed) ? parsed : []
    } catch (error) {
        console.error('Error reading dineros:', error)
        return []
    }
}

// Función helper para escribir dineros
function writeDineros(dineros) {
    try {
        // Asegurar que dineros es un array
        const dataToWrite = Array.isArray(dineros) ? dineros : []
        fs.writeFileSync(DINEROS_FILE, JSON.stringify(dataToWrite, null, 2))
        return true
    } catch (error) {
        console.error('Error writing dineros:', error)
        return false
    }
}

export default defineEventHandler(async (event) => {
    const method = getMethod(event)
    
    console.log(`[Storage Dineros] ${method} request received`)

    try {
        if (method === 'GET') {
            const dineros = readDineros()
            console.log(`[Storage Dineros] Retrieved ${dineros.length} dineros`)
            console.log(`[Storage Dineros] Dineros data:`, JSON.stringify(dineros, null, 2))
            return dineros
        }

        if (method === 'PUT') {
            const body = await readBody(event)
            const success = writeDineros(body)
            
            if (success) {
                console.log(`[Storage Dineros] Saved ${Array.isArray(body) ? body.length : 0} dineros`)
                return { success: true }
            } else {
                throw createError({
                    statusCode: 500,
                    statusMessage: 'Error al guardar dineros'
                })
            }
        }

        throw createError({
            statusCode: 405,
            statusMessage: 'Método no permitido'
        })

    } catch (error) {
        console.error(`[Storage Dineros] Error:`, error)
        
        if (error.statusCode) {
            throw error
        }

        throw createError({
            statusCode: 500,
            statusMessage: error.message || 'Error interno del servidor'
        })
    }
})
