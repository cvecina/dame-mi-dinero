/**
 * Composable para debug y limpieza de autenticación
 */
export const useAuthDebug = () => {
    
    const clearAllAuthData = () => {
        if (process.client) {
            console.log('🧹 Clearing all authentication data...')
            
            // Listar todos los items de localStorage
            const authItems = []
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i)
                if (key && (key.startsWith('auth_') || key.includes('token') || key === 'user')) {
                    authItems.push(key)
                }
            }
            
            console.log('Found auth items in localStorage:', authItems)
            
            // Eliminar todos los items relacionados con auth
            authItems.forEach(key => {
                localStorage.removeItem(key)
                console.log(`Removed: ${key}`)
            })
            
            console.log('✅ All authentication data cleared')
            
            // Reload page para reinicializar completamente
            window.location.reload()
        }
    }
    
    const debugAuthState = () => {
        if (process.client) {
            console.log('🔍 Auth Debug Information:')
            console.log('Current localStorage auth items:')
            
            const authData = {
                auth_token: localStorage.getItem('auth_token'),
                auth_user: localStorage.getItem('auth_user')
            }
            
            Object.entries(authData).forEach(([key, value]) => {
                if (value) {
                    console.log(`${key}:`, value.substring(0, 50) + '...')
                    
                    // Validar formato del token
                    if (key === 'auth_token') {
                        const isValidFormat = value.split('.').length === 3
                        console.log(`Token format valid: ${isValidFormat}`)
                    }
                    
                    // Validar JSON del usuario
                    if (key === 'auth_user') {
                        try {
                            const parsed = JSON.parse(value)
                            console.log(`User data valid: ${!!parsed.id && !!parsed.email}`)
                        } catch (e) {
                            console.log('User data invalid JSON')
                        }
                    }
                } else {
                    console.log(`${key}: null`)
                }
            })
        }
    }
    
    return {
        clearAllAuthData,
        debugAuthState
    }
}

console.log('useAuthDebug')
