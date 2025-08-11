<template>
    <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div class="text-center">
                <div class="text-6xl mb-4">🔔</div>
                <h2 class="text-xl font-bold text-gray-800 mb-3">
                    Habilitar Notificaciones
                </h2>
                <p class="text-gray-600 mb-6">
                    Para recibir recordatorios de pago y notificaciones importantes, necesitas permitir las notificaciones en tu navegador.
                </p>
                
                <!-- Instrucciones por navegador -->
                <div class="text-left bg-gray-50 rounded-lg p-4 mb-6">
                    <h3 class="font-semibold text-gray-800 mb-2">📱 Cómo habilitarlas:</h3>
                    <ul class="text-sm text-gray-600 space-y-1">
                        <li>• Haz clic en "Permitir Notificaciones"</li>
                        <li>• Si aparece un popup, selecciona "Permitir"</li>
                        <template v-if="isIOS">
                            <li>• <strong>iOS:</strong> Solo funciona en Safari, no en Chrome/otros navegadores</li>
                            <li>• <strong>iOS:</strong> Para mejor experiencia, añade a pantalla de inicio</li>
                        </template>
                        <template v-else>
                            <li>• En Safari móvil: Ve a Configuración > Safari > Notificaciones</li>
                            <li>• En Chrome: Ícono de candado → Notificaciones → Permitir</li>
                        </template>
                    </ul>
                </div>
                
                <!-- Alerta específica para iOS Chrome -->
                <div v-if="isIOS && !isIOSSafari" class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
                    <div class="flex items-center gap-2 text-yellow-800">
                        <span class="text-lg">⚠️</span>
                        <span class="text-sm font-medium">Aviso para iOS</span>
                    </div>
                    <p class="text-xs text-yellow-700 mt-1">
                        Las notificaciones no funcionan en Chrome iOS. Abre esta página en Safari para usar esta función.
                    </p>
                </div>
                
                <div class="flex gap-3">
                    <button 
                        v-if="!isIOS || isIOSSafari"
                        @click="$emit('request-permission')"
                        class="flex-1 bg-blue-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                    >
                        🔔 Permitir Notificaciones
                    </button>
                    <button 
                        v-else
                        @click="openInSafari"
                        class="flex-1 bg-blue-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                    >
                        🌐 Abrir en Safari
                    </button>
                    <button 
                        @click="$emit('close')"
                        class="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
                    >
                        ❌ Cancelar
                    </button>
                </div>
                
                <p class="text-xs text-gray-500 mt-4">
                    {{ isIOS ? 
                        'En iOS, las notificaciones solo funcionan en Safari y tienen funciones limitadas' :
                        'Puedes cambiar esto más tarde en la configuración de tu navegador'
                    }}
                </p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { usePWAManager } from '~/composables/usePWAManager'

const { isIOS, isIOSSafari } = usePWAManager()

defineProps({
    show: {
        type: Boolean,
        default: false
    }
})

defineEmits(['close', 'request-permission'])

const openInSafari = () => {
    // Crear URL para abrir en Safari
    const currentUrl = window.location.href
    window.open(currentUrl, '_blank')
}
</script>
