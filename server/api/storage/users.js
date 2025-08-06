// Para desarrollo local, usar almacenamiento de archivos
// Para producción (Vercel), usar Upstash Redis
let redis;
try {
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        // Usar Upstash Redis en producción
        const { Redis } = await import('@upstash/redis');
        redis = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL,
            token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });
    } else if (process.env.KV_REST_API_URL) {
        // Fallback a Vercel KV si está configurado
        const { kv } = await import('@vercel/kv');
        redis = kv;
    }
} catch (error) {
    // Si falla, usar null y caer back a storage local
    redis = null;
}

export default defineEventHandler(async (event) => {
    const method = getMethod(event)
    
    try {
        if (method === 'GET') {
            // Leer usuarios del storage
            let users = [];
            
            if (redis) {
                // Usar Redis/KV en producción
                users = await redis.get('users') || []
            } else {
                // Usar storage local en desarrollo
                users = await useStorage('db').getItem('users') || []
            }
            
            return users
        }
        
        if (method === 'PUT') {
            // Guardar usuarios en el storage
            const body = await readBody(event)
            
            if (redis) {
                // Usar Redis/KV en producción
                await redis.set('users', body)
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
