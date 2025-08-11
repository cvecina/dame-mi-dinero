/**
 * Composable para manejar funcionalidad offline
 */
export const useOffline = () => {
    const isOnline = ref(true)
    const pendingActions = ref([])
    const syncInProgress = ref(false)

    // Verificar estado de conexión
    const checkConnection = () => {
        if (process.client) {
            isOnline.value = navigator.onLine
            
            window.addEventListener('online', handleOnline)
            window.addEventListener('offline', handleOffline)
        }
    }

    const handleOnline = () => {
        isOnline.value = true
        syncPendingActions()
    }

    const handleOffline = () => {
        isOnline.value = false
    }

    // Guardar acción para sincronizar después
    const queueAction = (action) => {
        const queuedAction = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            action: action.type,
            data: action.data,
            retries: 0
        }
        
        pendingActions.value.push(queuedAction)
        saveToLocalStorage()
    }

    // Guardar en localStorage
    const saveToLocalStorage = () => {
        if (process.client) {
            localStorage.setItem('dame-mi-dinero-pending-actions', JSON.stringify(pendingActions.value))
        }
    }

    // Cargar desde localStorage
    const loadFromLocalStorage = () => {
        if (process.client) {
            const saved = localStorage.getItem('dame-mi-dinero-pending-actions')
            if (saved) {
                try {
                    pendingActions.value = JSON.parse(saved)
                } catch (error) {
                    console.error('Error loading pending actions:', error)
                    pendingActions.value = []
                }
            }
        }
    }

    // Sincronizar acciones pendientes
    const syncPendingActions = async () => {
        if (!isOnline.value || syncInProgress.value || pendingActions.value.length === 0) {
            return
        }

        syncInProgress.value = true

        const actions = [...pendingActions.value]
        
        for (const action of actions) {
            try {
                await processAction(action)
                // Remover acción exitosa
                pendingActions.value = pendingActions.value.filter(a => a.id !== action.id)
            } catch (error) {
                action.retries += 1
                
                // Si falla más de 3 veces, remover
                if (action.retries > 3) {
                    pendingActions.value = pendingActions.value.filter(a => a.id !== action.id)
                    console.error('Action failed after 3 retries:', action)
                }
            }
        }

        saveToLocalStorage()
        syncInProgress.value = false
    }

    // Procesar una acción específica
    const processAction = async (action) => {
        switch (action.action) {
            case 'ADD_EXPENSE':
                // Aquí llamarías a la API para agregar el gasto
                await $fetch('/api/expenses', {
                    method: 'POST',
                    body: action.data
                })
                break
                
            case 'UPDATE_EXPENSE':
                await $fetch(`/api/expenses/${action.data.id}`, {
                    method: 'PUT',
                    body: action.data
                })
                break
                
            case 'DELETE_EXPENSE':
                await $fetch(`/api/expenses/${action.data.id}`, {
                    method: 'DELETE'
                })
                break
                
            case 'ADD_USER':
                await $fetch('/api/users', {
                    method: 'POST',
                    body: action.data
                })
                break
                
            default:
                console.warn('Unknown action type:', action.action)
        }
    }

    // Manejar operación offline
    const handleOfflineOperation = (type, data) => {
        if (!isOnline.value) {
            queueAction({ type, data })
            return true // Indica que se manejó offline
        }
        return false // Indica que se debe procesar normalmente
    }

    // Obtener datos desde cache
    const getCachedData = (key) => {
        if (process.client) {
            const cached = localStorage.getItem(`dame-mi-dinero-cache-${key}`)
            if (cached) {
                try {
                    const data = JSON.parse(cached)
                    const now = Date.now()
                    
                    // Verificar si no ha expirado (24 horas)
                    if (now - data.timestamp < 24 * 60 * 60 * 1000) {
                        return data.value
                    } else {
                        localStorage.removeItem(`dame-mi-dinero-cache-${key}`)
                    }
                } catch (error) {
                    console.error('Error parsing cached data:', error)
                }
            }
        }
        return null
    }

    // Guardar datos en cache
    const setCachedData = (key, value) => {
        if (process.client) {
            const data = {
                value,
                timestamp: Date.now()
            }
            localStorage.setItem(`dame-mi-dinero-cache-${key}`, JSON.stringify(data))
        }
    }

    // Limpiar cache expirado
    const cleanExpiredCache = () => {
        if (process.client) {
            const keys = Object.keys(localStorage).filter(key => 
                key.startsWith('dame-mi-dinero-cache-')
            )
            
            const now = Date.now()
            
            keys.forEach(key => {
                try {
                    const data = JSON.parse(localStorage.getItem(key))
                    
                    // Si ha expirado (24 horas), remover
                    if (now - data.timestamp > 24 * 60 * 60 * 1000) {
                        localStorage.removeItem(key)
                    }
                } catch (error) {
                    // Si hay error parseando, remover
                    localStorage.removeItem(key)
                }
            })
        }
    }

    // Inicializar
    const init = () => {
        checkConnection()
        loadFromLocalStorage()
        cleanExpiredCache()
        
        // Intentar sincronizar cada 30 segundos si hay acciones pendientes
        if (process.client) {
            setInterval(() => {
                if (isOnline.value && pendingActions.value.length > 0) {
                    syncPendingActions()
                }
            }, 30000)
        }
    }

    return {
        // Estado
        isOnline,
        pendingActions: readonly(pendingActions),
        syncInProgress,
        
        // Métodos
        queueAction,
        syncPendingActions,
        handleOfflineOperation,
        getCachedData,
        setCachedData,
        init
    }
}
