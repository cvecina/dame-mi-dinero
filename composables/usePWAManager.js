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
        if (!process.client || !('Notification' in window)) {
            console.warn('Notifications not supported in this browser')
            return
        }
        
        if (Notification.permission !== 'granted') {
            console.warn('Notification permission not granted')
            return
        }

        const defaultOptions = {
            icon: '/icons/icon-192x192.svg',
            badge: '/icons/icon-96x96.svg',
            tag: 'dame-mi-dinero',
            renotify: true,
            silent: false,
            vibrate: [200, 100, 200], // Vibración en móviles
            ...options
        }

        try {
            const notification = new Notification(title, defaultOptions)
            
            // Auto-cerrar después de 10 segundos si no se especifica requireInteraction
            if (!options.requireInteraction) {
                setTimeout(() => {
                    notification.close()
                }, 10000)
            }
            
            return notification
        } catch (error) {
            console.error('Error creating notification:', error)
        }
    }

    // Registrar service worker para notificaciones
    const registerSW = async () => {
        // No registrar SW personalizado - dejar que Vite PWA maneje todo
        if (!process.client || process.env.NODE_ENV === 'development') {
            return
        }
        
        // Solo escuchar eventos del SW ya registrado por Vite PWA
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                updateAvailable.value = true
            })
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
