import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'

export default defineEventHandler(async (event) => {
    try {
        const { file, data } = await readBody(event)
        
        if (!file) {
            throw createError({
                statusCode: 400,
                statusMessage: 'El parámetro file es obligatorio'
            })
        }

        const filePath = join(process.cwd(), file)
        
        // Crear directorio si no existe
        const dir = dirname(filePath)
        mkdirSync(dir, { recursive: true })
        
        // Escribir archivo
        writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8')
        
        return {
            success: true,
            message: 'Archivo guardado correctamente'
        }
        
    } catch (error) {
        console.error('Storage write error:', error)
        
        if (error.statusCode) {
            throw error
        }
        
        throw createError({
            statusCode: 500,
            statusMessage: 'Error al escribir el archivo'
        })
    }
})
