// Para desarrollo local, usar almacenamiento de archivos
// Para producción (Vercel), usar Vercel KV
let kv;
try {
    // Intentar importar Vercel KV (solo funciona en producción o con variables configuradas)
    const { kv: vercelKv } = await import('@vercel/kv');
    kv = vercelKv;
} catch (error) {
    // Si falla, usar null y caer back a storage local
    kv = null;
}

export default defineEventHandler(async (event) => {
    const method = getMethod(event)
    
    try {
        if (method === 'GET') {
            // Leer usuarios del storage
            let users = [];
            
            if (kv && process.env.KV_REST_API_URL) {
                // Usar Vercel KV en producción
                users = await kv.get('users') || []
            } else {
                // Usar storage local en desarrollo
                users = await useStorage('db').getItem('users') || []
            }
            
            return users
        }
        
        if (method === 'PUT') {
            // Guardar usuarios en el storage
            const body = await readBody(event)
            
            if (kv && process.env.KV_REST_API_URL) {
                // Usar Vercel KV en producción
                await kv.set('users', body)
            } else {
                // Usar storage local en desarrollo
                await useStorage('db').setItem('users', body)
            }
            
            return { success: true }
        }
        
        throw createError({
            statusCode: 405,
            statusMessage: 'Método no permitido'
        })
        
    } catch (error) {
        console.error('Error en storage usuarios:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Error en el almacenamiento'
        })
    }
})
