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
            // Leer gastos del storage
            let expenses = [];
            
            if (kv && process.env.KV_REST_API_URL) {
                // Usar Vercel KV en producción
                expenses = await kv.get('expenses') || []
            } else {
                // Usar storage local en desarrollo
                expenses = await useStorage('db').getItem('expenses') || []
            }
            
            return expenses
        }
        
        if (method === 'PUT') {
            // Guardar gastos en el storage
            const body = await readBody(event)
            
            if (kv && process.env.KV_REST_API_URL) {
                // Usar Vercel KV en producción
                await kv.set('expenses', body)
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
