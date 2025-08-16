import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dame-mi-dinero-secret-key-2024'

// Función helper para verificar el token
function verifyToken(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Token de autorización requerido'
        })
    }

    const token = authHeader.substring(7)
    
    if (!token || token.trim() === '' || token.split('.').length !== 3) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Token inválido'
        })
    }
    
    try {
        return jwt.verify(token, JWT_SECRET)
    } catch (error) {
        console.error('JWT verification error:', error)
        throw createError({
            statusCode: 401,
            statusMessage: 'Token inválido'
        })
    }
}

// Función helper para leer dineros
async function readDineros() {
    try {
        const dineros = await $fetch('/api/storage/dineros') || []
        return dineros
    } catch (error) {
        console.error('Error reading dineros:', error)
        return []
    }
}

// Función helper para escribir dineros
async function writeDineros(dineros) {
    try {
        await $fetch('/api/storage/dineros', {
            method: 'PUT',
            body: dineros
        })
        return true
    } catch (error) {
        console.error('Error writing dineros:', error)
        return false
    }
}

export default defineEventHandler(async (event) => {
    const method = getMethod(event)
    
    console.log(`[Dineros API] ${method} request received`)

    try {
        // Verificar autenticación
        const authHeader = getHeader(event, 'authorization')
        const decoded = verifyToken(authHeader)
        const userId = decoded.userId
        
        console.log(`[Dineros API] User ID: ${userId}`)

        if (method === 'GET') {
            // Obtener dineros del usuario
            const allDineros = await readDineros()
            
            // Filtrar dineros accesibles por el usuario (propios + compartidos)
            const userDineros = allDineros.filter(dinero => 
                dinero.ownerId === userId || 
                dinero.sharedWith?.includes(userId)
            )
            
            console.log(`[Dineros API] Found ${userDineros.length} accessible dineros for user ${userId}`)
            
            return {
                success: true,
                data: userDineros
            }
        }

        if (method === 'POST') {
            // Crear nuevo dinero
            const dineroData = await readBody(event)
            const { name, description, color, isDefault, sharedWith } = dineroData
            
            // Validaciones
            if (!name || name.trim() === '') {
                throw createError({
                    statusCode: 400,
                    statusMessage: 'El nombre del dinero es requerido'
                })
            }

            const allDineros = await readDineros()
            
            // Si es dinero por defecto, quitar el default de otros dineros del mismo usuario
            if (isDefault) {
                allDineros.forEach(dinero => {
                    if (dinero.ownerId === userId && dinero.isDefault) {
                        dinero.isDefault = false
                    }
                })
            }

            // Crear nuevo dinero
            const newDinero = {
                id: Date.now() + Math.floor(Math.random() * 1000),
                name: name.trim(),
                description: description?.trim() || '',
                color: color || '#3A7CA5',
                isDefault: isDefault || false,
                ownerId: userId,
                sharedWith: Array.isArray(sharedWith) ? sharedWith : [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }

            allDineros.push(newDinero)
            
            const saved = await writeDineros(allDineros)
            if (!saved) {
                throw createError({
                    statusCode: 500,
                    statusMessage: 'Error al guardar el dinero'
                })
            }

            console.log(`[Dineros API] Created dinero: ${newDinero.id}`)
            
            return {
                success: true,
                data: newDinero,
                message: 'Dinero creado correctamente'
            }
        }

        if (method === 'PUT') {
            // Actualizar dinero existente
            const updateData = await readBody(event)
            const { id, name, description, color, isDefault } = updateData
            
            if (!id) {
                throw createError({
                    statusCode: 400,
                    statusMessage: 'ID del dinero es requerido'
                })
            }

            const allDineros = await readDineros()
            const dineroIndex = allDineros.findIndex(d => d.id === id)
            
            if (dineroIndex === -1) {
                throw createError({
                    statusCode: 404,
                    statusMessage: 'Dinero no encontrado'
                })
            }

            const dinero = allDineros[dineroIndex]
            
            // Verificar que el usuario es el propietario
            if (dinero.ownerId !== userId) {
                throw createError({
                    statusCode: 403,
                    statusMessage: 'No tienes permisos para editar este dinero'
                })
            }

            // Si se está marcando como default, quitar default de otros
            if (isDefault && !dinero.isDefault) {
                allDineros.forEach(d => {
                    if (d.ownerId === userId && d.isDefault && d.id !== id) {
                        d.isDefault = false
                    }
                })
            }

            // Actualizar dinero
            allDineros[dineroIndex] = {
                ...dinero,
                name: name?.trim() || dinero.name,
                description: description?.trim() || dinero.description,
                color: color || dinero.color,
                isDefault: isDefault !== undefined ? isDefault : dinero.isDefault,
                updatedAt: new Date().toISOString()
            }

            const saved = await writeDineros(allDineros)
            if (!saved) {
                throw createError({
                    statusCode: 500,
                    statusMessage: 'Error al actualizar el dinero'
                })
            }

            console.log(`[Dineros API] Updated dinero: ${id}`)
            
            return {
                success: true,
                data: allDineros[dineroIndex],
                message: 'Dinero actualizado correctamente'
            }
        }

        if (method === 'DELETE') {
            // Eliminar dinero
            const { id } = await readBody(event)
            
            if (!id) {
                throw createError({
                    statusCode: 400,
                    statusMessage: 'ID del dinero es requerido'
                })
            }

            const allDineros = await readDineros()
            const dineroIndex = allDineros.findIndex(d => d.id === id)
            
            if (dineroIndex === -1) {
                throw createError({
                    statusCode: 404,
                    statusMessage: 'Dinero no encontrado'
                })
            }

            const dinero = allDineros[dineroIndex]
            
            // Verificar que el usuario es el propietario
            if (dinero.ownerId !== userId) {
                throw createError({
                    statusCode: 403,
                    statusMessage: 'No tienes permisos para eliminar este dinero'
                })
            }

            // No permitir eliminar dinero por defecto si es el único
            const userDineros = allDineros.filter(d => d.ownerId === userId)
            if (dinero.isDefault && userDineros.length === 1) {
                throw createError({
                    statusCode: 400,
                    statusMessage: 'No puedes eliminar tu único dinero por defecto'
                })
            }

            // Eliminar dinero
            allDineros.splice(dineroIndex, 1)
            
            const saved = await writeDineros(allDineros)
            if (!saved) {
                throw createError({
                    statusCode: 500,
                    statusMessage: 'Error al eliminar el dinero'
                })
            }

            console.log(`[Dineros API] Deleted dinero: ${id}`)
            
            return {
                success: true,
                message: 'Dinero eliminado correctamente'
            }
        }

        throw createError({
            statusCode: 405,
            statusMessage: 'Método no permitido'
        })

    } catch (error) {
        console.error(`[Dineros API] Error:`, error)
        
        if (error.statusCode) {
            throw error
        }

        throw createError({
            statusCode: 500,
            statusMessage: error.message || 'Error interno del servidor'
        })
    }
})
