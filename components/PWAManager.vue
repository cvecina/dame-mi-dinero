<template>
    <div v-if="!isDev">
        <!-- Banner de instalación -->
        <div 
            v-if="canInstall && !dismissed"
            class="fixed bottom-4 left-4 right-4 z-50 bg-gradient-to-r from-azul-tiquet to-azul-claro-viaje text-blanco-dividido rounded-2xl shadow-2xl p-4 mx-auto max-w-md transform transition-all duration-300 ease-out"
        >
            <div class="flex items-center gap-3">
                <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span class="text-2xl">📱</span>
                </div>
                <div class="flex-1 min-w-0">
                    <h3 class="font-bold text-sm mb-1">¡Instala Dame Mi Dinero!</h3>
                    <p class="text-xs text-white/90 leading-relaxed">
                        Accede rápidamente desde tu pantalla de inicio
                    </p>
                </div>
                <div class="flex gap-2 flex-shrink-0">
                    <button 
                        @click="dismiss"
                        class="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
                    >
                        <span class="text-sm">✕</span>
                    </button>
                    <button 
                        @click="install"
                        class="px-4 py-2 bg-white text-azul-tiquet rounded-lg font-semibold text-xs hover:bg-white/90 transition-colors"
                    >
                        Instalar
                    </button>
                </div>
            </div>
        </div>

        <!-- Indicador de estado offline -->
        <div 
            v-if="!isOnline"
            class="fixed top-4 left-4 right-4 z-50 bg-yellow-500 text-white rounded-xl shadow-lg p-3 mx-auto max-w-md"
        >
            <div class="flex items-center gap-2">
                <span class="text-lg">📶</span>
                <div class="flex-1">
                    <p class="font-semibold text-sm">Sin conexión</p>
                    <p class="text-xs opacity-90">Los cambios se sincronizarán automáticamente</p>
                </div>
                <div v-if="pendingActions.length > 0" class="bg-white/20 rounded-full px-2 py-1">
                    <span class="text-xs font-medium">{{ pendingActions.length }}</span>
                </div>
            </div>
        </div>

        <!-- Botón de actualización -->
        <div 
            v-if="needRefresh"
            class="fixed top-4 left-4 right-4 z-50 bg-green-500 text-white rounded-xl shadow-lg p-3 mx-auto max-w-md"
        >
            <div class="flex items-center gap-3">
                <span class="text-lg">🔄</span>
                <div class="flex-1">
                    <p class="font-semibold text-sm">Actualización disponible</p>
                    <p class="text-xs opacity-90">Nueva versión lista para instalar</p>
                </div>
                <button 
                    @click="updateServiceWorker()"
                    class="px-4 py-2 bg-white text-green-600 rounded-lg font-semibold text-xs hover:bg-white/90 transition-colors"
                >
                    Actualizar
                </button>
            </div>
        </div>

        <!-- Indicador de sincronización -->
        <div 
            v-if="syncInProgress"
            class="fixed bottom-4 right-4 z-50 bg-blue-500 text-white rounded-full p-3 shadow-lg"
        >
            <div class="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useOffline } from '~/composables/useOffline'

// Usar el composable PWA oficial de Vite
const { needRefresh, updateServiceWorker } = process.client ? usePWA() : { needRefresh: ref(false), updateServiceWorker: () => {} }

// Offline functionality
const { 
    isOnline, 
    pendingActions, 
    syncInProgress, 
    init: initOffline 
} = useOffline()

// Local state
const dismissed = ref(false)
const isDev = ref(process.env.NODE_ENV === 'development')
const canInstall = ref(false)
const isInstalled = ref(false)

// Methods
const install = async () => {
    await installPWA()
    dismissed.value = true
}

const dismiss = () => {
    dismissed.value = true
    // Recordar que fue rechazado por 24 horas
    if (process.client) {
        localStorage.setItem('pwa-install-dismissed', Date.now().toString())
    }
}

const update = () => {
    updateSW()
}

// Check if install prompt was dismissed recently
const checkDismissed = () => {
    if (process.client) {
        const dismissedTime = localStorage.getItem('pwa-install-dismissed')
        if (dismissedTime) {
            const now = Date.now()
            const dismissedAt = parseInt(dismissedTime)
            
            // Si fue rechazado hace menos de 24 horas, no mostrar
            if (now - dismissedAt < 24 * 60 * 60 * 1000) {
                dismissed.value = true
            } else {
                localStorage.removeItem('pwa-install-dismissed')
            }
        }
    }
}

onMounted(async () => {
    if (!isDev.value) {
        try {
            await initOffline()
            checkDismissed()
        } catch (error) {
            console.error('Error initializing PWA:', error)
        }
    }
})
</script>

<style scoped>
/* Animaciones adicionales */
@keyframes slideUp {
    from {
        transform: translateY(100%);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

.fixed {
    animation: slideUp 0.3s ease-out;
}
</style>
