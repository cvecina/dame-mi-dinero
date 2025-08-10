/**
 * Composable para logging inteligente
 * Muestra logs solo en desarrollo y permite diferentes niveles
 */
export const useLogger = () => {
    const isDev = process.env.NODE_ENV === 'development'
    
    const log = (...args) => {
        if (isDev) {
            console.log('[DEBUG]', ...args)
        }
    }
    
    const warn = (...args) => {
        if (isDev) {
            console.warn('[WARN]', ...args)
        }
    }
    
    const error = (...args) => {
        // Los errores siempre se muestran
        console.error('[ERROR]', ...args)
    }
    
    const info = (...args) => {
        if (isDev) {
            console.info('[INFO]', ...args)
        }
    }
    
    const debug = (functionName, data = null) => {
        if (isDev) {
            if (data) {
                console.log(`[DEBUG] ${functionName}:`, data)
            } else {
                console.log(`[DEBUG] ${functionName}`)
            }
        }
    }
    
    return {
        log,
        warn,
        error,
        info,
        debug,
        isDev
    }
}
