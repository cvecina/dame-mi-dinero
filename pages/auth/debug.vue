<template>
    <div class="min-h-screen bg-gray-100 p-6">
        <div class="max-w-4xl mx-auto">
            <div class="bg-white rounded-lg shadow-lg p-6">
                <h1 class="text-2xl font-bold text-gray-800 mb-6">🔧 Auth Debug & Recovery</h1>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Debug Info -->
                    <div class="bg-blue-50 rounded-lg p-4">
                        <h2 class="text-lg font-semibold text-blue-800 mb-4">📊 Current State</h2>
                        
                        <div class="space-y-3">
                            <div>
                                <span class="font-medium">Authenticated:</span>
                                <span :class="authStore.isAuthenticated ? 'text-green-600' : 'text-red-600'">
                                    {{ authStore.isAuthenticated ? 'Yes' : 'No' }}
                                </span>
                            </div>
                            
                            <div>
                                <span class="font-medium">Token Present:</span>
                                <span :class="authStore.token ? 'text-green-600' : 'text-red-600'">
                                    {{ authStore.token ? 'Yes' : 'No' }}
                                </span>
                            </div>
                            
                            <div>
                                <span class="font-medium">User Data:</span>
                                <span :class="authStore.user ? 'text-green-600' : 'text-red-600'">
                                    {{ authStore.user ? authStore.user.email : 'None' }}
                                </span>
                            </div>
                            
                            <div v-if="localStorageData">
                                <span class="font-medium">LocalStorage Items:</span>
                                <ul class="text-sm text-gray-600 mt-1">
                                    <li v-for="(value, key) in localStorageData" :key="key">
                                        {{ key }}: {{ value ? '✓' : '✗' }}
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Actions -->
                    <div class="bg-yellow-50 rounded-lg p-4">
                        <h2 class="text-lg font-semibold text-yellow-800 mb-4">🛠️ Debug Actions</h2>
                        
                        <div class="space-y-3">
                            <button 
                                @click="debugAuthState"
                                class="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                            >
                                🔍 Debug Auth State
                            </button>
                            
                            <button 
                                @click="validateCurrentToken"
                                class="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                                :disabled="!authStore.token"
                            >
                                ✅ Validate Current Token
                            </button>
                            
                            <button 
                                @click="clearCorruptData"
                                class="w-full bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors"
                            >
                                🧹 Clear Corrupt Data
                            </button>
                            
                            <button 
                                @click="fullReset"
                                class="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                            >
                                🔄 Full Auth Reset
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Logs -->
                <div class="mt-6 bg-gray-900 rounded-lg p-4">
                    <h2 class="text-lg font-semibold text-white mb-4">📝 Debug Logs</h2>
                    <div class="bg-black rounded p-3 h-64 overflow-y-auto">
                        <pre class="text-green-400 text-sm font-mono whitespace-pre-wrap">{{ logs }}</pre>
                    </div>
                    <button 
                        @click="clearLogs"
                        class="mt-2 bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors"
                    >
                        Clear Logs
                    </button>
                </div>
                
                <!-- Navigation -->
                <div class="mt-6 pt-6 border-t border-gray-200">
                    <NuxtLink 
                        to="/auth/login"
                        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors mr-3"
                    >
                        ← Back to Login
                    </NuxtLink>
                    <NuxtLink 
                        to="/"
                        class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                    >
                        ← Back to App
                    </NuxtLink>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '~/stores/auth.store'
import { useAuthDebug } from '~/composables/useAuthDebug'

const authStore = useAuthStore()
const { clearAllAuthData, debugAuthState } = useAuthDebug()

const logs = ref('')
const localStorageData = ref(null)

const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString()
    logs.value += `[${timestamp}] ${message}\n`
}

const clearLogs = () => {
    logs.value = ''
}

const loadLocalStorageData = () => {
    if (process.client) {
        localStorageData.value = {
            'auth_token': localStorage.getItem('auth_token'),
            'auth_user': localStorage.getItem('auth_user')
        }
    }
}

const validateCurrentToken = async () => {
    try {
        addLog('🔍 Validating current token...')
        const isValid = await authStore.validateToken()
        addLog(`✅ Token validation result: ${isValid}`)
        loadLocalStorageData()
    } catch (error) {
        addLog(`❌ Token validation error: ${error.message}`)
    }
}

const clearCorruptData = () => {
    addLog('🧹 Clearing potentially corrupt auth data...')
    clearAllAuthData()
}

const fullReset = async () => {
    addLog('🔄 Performing full authentication reset...')
    await authStore.logout()
    clearAllAuthData()
}

onMounted(() => {
    addLog('🚀 Auth Debug page loaded')
    loadLocalStorageData()
    
    // Solo mostrar en desarrollo
    if (!process.dev) {
        addLog('⚠️ Debug page should not be accessible in production')
    }
})

console.log('auth-debug')
</script>
