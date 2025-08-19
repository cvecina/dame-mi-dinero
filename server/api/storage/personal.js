// Para desarrollo local, usar almacenamiento de archivos
// Para producción (Vercel), usar Upstash Redis
let redis = null;

async function getRedisClient() {
    if (redis) return redis;
    try {
        if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
            const { Redis } = await import('@upstash/redis');
            redis = new Redis({
                url: process.env.KV_REST_API_URL,
                token: process.env.KV_REST_API_TOKEN,
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
    const { type, userId } = getQuery(event)
    // type: 'expenses', 'subscriptions', 'budgets'
    try {
        const redisClient = await getRedisClient();
        const key = `personal:${type}:${userId}`
        if (method === 'GET') {
            let items = []
            if (redisClient) {
                items = await redisClient.get(key) || []
            } else {
                items = await useStorage('db').getItem(key) || []
            }
            return items
        }
        if (method === 'PUT') {
            const body = await readBody(event)
            if (redisClient) {
                await redisClient.set(key, body)
            } else {
                await useStorage('db').setItem(key, body)
            }
            return { success: true }
        }
    } catch (error) {
        return { success: false, message: error.message }
    }
})
