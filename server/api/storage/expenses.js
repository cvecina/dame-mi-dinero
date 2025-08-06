// Para desarrollo local, usar almacenamiento de archivos
// Para producción (Vercel), usar Upstash Redis
let redis = null;

async function getRedisClient() {
    if (redis) return redis;
    
    try {
        // Priorizar las variables de Vercel KV que ya tienes configuradas
        if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
            // Usar las variables de KV que ya tienes
            const { Redis } = await import('@upstash/redis');
            redis = new Redis({
                url: process.env.KV_REST_API_URL,
                token: process.env.KV_REST_API_TOKEN,
            });
            return redis;
        } else if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
            // Fallback a variables específicas de Upstash
            const { Redis } = await import('@upstash/redis');
            redis = new Redis({
                url: process.env.UPSTASH_REDIS_REST_URL,
                token: process.env.UPSTASH_REDIS_REST_TOKEN,
            });
            return redis;
        }
    } catch (error) {
        console.error('Error connecting to Redis:', error);
    }
    
    return null;
}

export default defineEventHandler(async (event) => {
    const method = getMethod(event)
    
    try {
        console.log(`[Expenses API] ${method} request received`);
        
        // Obtener cliente Redis
        const redisClient = await getRedisClient();
        console.log(`[Expenses API] Redis available:`, !!redisClient);
        
        if (method === 'GET') {
            // Leer gastos del storage
            let expenses = [];
            
            if (redisClient) {
                console.log('[Expenses API] Using Redis/KV storage');
                expenses = await redisClient.get('expenses') || []
            } else {
                console.log('[Expenses API] Using local file storage');
                expenses = await useStorage('db').getItem('expenses') || []
            }
            
            return expenses
        }
        
        if (method === 'PUT') {
            // Guardar gastos en el storage
            const body = await readBody(event)
            
            if (redisClient) {
                console.log('[Expenses API] Saving to Redis/KV');
                await redisClient.set('expenses', body)
            } else {
                console.log('[Expenses API] Saving to local file');
                await useStorage('db').setItem('expenses', body)
            }
            
            return { success: true }
        }
        
        throw createError({
            statusCode: 405,
            statusMessage: 'Método no permitido'
        })
        
    } catch (error) {
        console.error('[Expenses API] Error:', error);
        throw createError({
            statusCode: 500,
            statusMessage: `Error en el almacenamiento: ${error.message}`
        })
    }
})
