import { readFileSync } from 'fs'
import { join } from 'path'

export default defineEventHandler(async (event) => {
    try {
        const { file } = await readBody(event)
        
        if (!file) {
            throw createError({
                statusCode: 400,
                statusMessage: 'El parámetro file es obligatorio'
            })
        }

        const filePath = join(process.cwd(), file)
        
        try {
            const data = readFileSync(filePath, 'utf8')
            return JSON.parse(data)
        } catch (error) {
            // Si el archivo no existe, retornar array vacío
            if (error.code === 'ENOENT') {
                return []
            }
            throw error
        }
        
    } catch (error) {
        console.error('Storage read error:', error)
        
        if (error.statusCode) {
            throw error
        }
        
        throw createError({
            statusCode: 500,
            statusMessage: 'Error al leer el archivo'
        })
    }
})
