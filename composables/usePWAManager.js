/**
 * Composable para funcionalidades PWA personalizadas y notificaciones
 */
export const usePWAManager = () => {
    const isInstalled = ref(false)
    const canInstall = ref(false)
    const isOnline = ref(true)
    const updateAvailable = ref(false)
    const deferredPrompt = ref(null)

    // Detectar si la PWA está instalada
    const checkInstallation = () => {
        if (process.client) {
            // Método 1: Display mode
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches
            
            // Método 2: Navigator standalone (iOS)
            const isIOSStandalone = 'standalone' in window.navigator && window.navigator.standalone
            
            // Método 3: Detectar si viene del home screen
            const isFromHomeScreen = document.referrer === "" || document.referrer.includes('android-app://')
            
            isInstalled.value = isStandalone || isIOSStandalone || isFromHomeScreen
        }
    }

    // Manejar el evento beforeinstallprompt
    const handleInstallPrompt = () => {
        if (process.client) {
            window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault()
                deferredPrompt.value = e
                canInstall.value = true
            })

            window.addEventListener('appinstalled', () => {
                isInstalled.value = true
                canInstall.value = false
                deferredPrompt.value = null
            })
        }
    }

    // Instalar la PWA
    const installPWA = async () => {
        if (deferredPrompt.value) {
            deferredPrompt.value.prompt()
            const { outcome } = await deferredPrompt.value.userChoice
            
            if (outcome === 'accepted') {
                deferredPrompt.value = null
                canInstall.value = false
            }
        }
    }

    // Verificar conexión
    const checkConnection = () => {
        if (process.client) {
            isOnline.value = navigator.onLine
            
            window.addEventListener('online', () => {
                isOnline.value = true
            })
            
            window.addEventListener('offline', () => {
                isOnline.value = false
            })
        }
    }

    // Solicitar permisos de notificación
    const requestNotificationPermission = async () => {
        if (!process.client || !('Notification' in window)) {
            return false
        }

        if (Notification.permission === 'granted') {
            return true
        }

        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission()
            return permission === 'granted'
        }

        return false
    }

    // Enviar notificación local
    const sendNotification = (title, options = {}) => {
        if (!process.client || Notification.permission !== 'granted') {
            return
        }

        const defaultOptions = {
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-96x96.png',
            tag: 'dame-mi-dinero',
            renotify: true,
            ...options
        }

        new Notification(title, defaultOptions)
    }

    // Registrar service worker para notificaciones
    const registerSW = async () => {
        // No registrar SW en desarrollo para evitar actualizaciones constantes
        if (!process.client || !('serviceWorker' in navigator) || process.env.NODE_ENV === 'development') {
            return
        }

        try {
            const registration = await navigator.serviceWorker.register('/sw.js', {
                updateViaCache: 'none'
            })
            
            // Verificar actualizaciones solo una vez
            let updateCheckDone = false
            registration.addEventListener('updatefound', () => {
                if (updateCheckDone) return
                updateCheckDone = true
                
                const newWorker = registration.installing
                
                if (newWorker) {
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            updateAvailable.value = true
                        }
                    })
                }
            })

            return registration
        } catch (error) {
            console.error('Error registering service worker:', error)
        }
    }

    // Actualizar service worker
    const updateSW = () => {
        if (process.client && 'serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(registration => {
                registration.update()
                window.location.reload()
            })
        }
    }

    // Inicializar todo
    const init = () => {
        if (process.client) {
            checkInstallation()
            handleInstallPrompt()
            checkConnection()
            registerSW()
        }
    }

    // Shortcuts de acciones rápidas
    const handleShortcuts = () => {
        if (process.client) {
            const url = new URL(window.location.href)
            const action = url.searchParams.get('action')
            
            return action
        }
        return null
    }

    return {
        // Estado
        isInstalled,
        canInstall,
        isOnlinePWA: isOnline,
        updateAvailable,
        
        // Métodos
        installPWA,
        requestNotificationPermission,
        sendNotification,
        updateSW,
        init,
        handleShortcuts
    }
}
