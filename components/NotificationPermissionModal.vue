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
                        <li>• En Safari móvil: Ve a Configuración > Safari > Notificaciones</li>
                        <li>• En Chrome: Ícono de candado → Notificaciones → Permitir</li>
                    </ul>
                </div>
                
                <div class="flex gap-3">
                    <button 
                        @click="$emit('request-permission')"
                        class="flex-1 bg-blue-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                    >
                        🔔 Permitir Notificaciones
                    </button>
                    <button 
                        @click="$emit('close')"
                        class="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
                    >
                        ❌ Cancelar
                    </button>
                </div>
                
                <p class="text-xs text-gray-500 mt-4">
                    Puedes cambiar esto más tarde en la configuración de tu navegador
                </p>
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    show: {
        type: Boolean,
        default: false
    }
})

defineEmits(['close', 'request-permission'])
</script>
