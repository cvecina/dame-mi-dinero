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
            // Leer gastos del storage
            let expenses = [];
            
            if (redis) {
                // Usar Redis/KV en producción
                expenses = await redis.get('expenses') || []
            } else {
                // Usar storage local en desarrollo
                expenses = await useStorage('db').getItem('expenses') || []
            }
            
            return expenses
        }
        
        if (method === 'PUT') {
            // Guardar gastos en el storage
            const body = await readBody(event)
            
            if (redis) {
                // Usar Redis/KV en producción
                await redis.set('expenses', body)
            } else {
                // Usar storage local en desarrollo
                await useStorage('db').setItem('expenses', body)
            }
            
            return { success: true }
        }
        
        throw createError({
            statusCode: 405,
            statusMessage: 'Método no permitido'
        })
        
    } catch (error) {
        console.error('Error en storage gastos:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Error en el almacenamiento'
        })
    }
})
