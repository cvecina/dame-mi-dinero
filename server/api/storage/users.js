// Para desarrollo local, usar almacenamiento de archivos
// Para producción (Vercel), usar Upstash Redis
let redis;
try {
    // Priorizar las variables de Vercel KV que ya tienes configuradas
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        // Usar las variables de KV que ya tienes
        const { Redis } = await import('@upstash/redis');
        redis = new Redis({
            url: process.env.KV_REST_API_URL,
            token: process.env.KV_REST_API_TOKEN,
        });
    } else if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        // Fallback a variables específicas de Upstash
        const { Redis } = await import('@upstash/redis');
        redis = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL,
            token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });
    }
} catch (error) {
    console.error('Error connecting to Redis:', error);
    redis = null;
}

export default defineEventHandler(async (event) => {
    const method = getMethod(event)
    
    try {
        console.log(`[Users API] ${method} request received`);
        console.log(`[Users API] Redis available:`, !!redis);
        console.log(`[Users API] Environment:`, process.env.NODE_ENV);
        console.log(`[Users API] KV_REST_API_URL exists:`, !!process.env.KV_REST_API_URL);
        
        if (method === 'GET') {
            // Leer usuarios del storage
            let users = [];
            
            if (redis) {
                console.log('[Users API] Using Redis/KV storage');
                users = await redis.get('users') || []
            } else {
                console.log('[Users API] Using local file storage');
                users = await useStorage('db').getItem('users') || []
            }
            
            console.log(`[Users API] Retrieved ${users.length} users`);
            return users
        }
        
        if (method === 'PUT') {
            // Guardar usuarios en el storage
            const body = await readBody(event)
            console.log(`[Users API] Saving ${body.length} users`);
            
            if (redis) {
                console.log('[Users API] Saving to Redis/KV');
                await redis.set('users', body)
            } else {
                console.log('[Users API] Saving to local file');
                await useStorage('db').setItem('users', body)
            }
            
            return { success: true }
        }
        
        throw createError({
            statusCode: 405,
            statusMessage: 'Método no permitido'
        })
        
    } catch (error) {
        console.error('[Users API] Error:', error);
        throw createError({
            statusCode: 500,
            statusMessage: `Error en el almacenamiento: ${error.message}`
        })
    }
})
