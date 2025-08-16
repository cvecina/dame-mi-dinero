<template>
    <div class="min-h-screen bg-gradient-to-br from-azul-tiquet via-azul-claro-viaje to-lima-compartida flex items-center justify-center p-4">
        <div class="bg-blanco-dividido rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <!-- Header -->
            <div class="bg-gradient-to-r from-azul-tiquet to-azul-claro-viaje p-6 text-center">
                <h1 class="text-2xl font-bold text-blanco-dividido mb-2">Dame mi dinero</h1>
                <p class="text-azul-claro-viaje/90 text-sm">Inicia sesión para continuar</p>
            </div>

            <!-- Form -->
            <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
                <div class="space-y-4">
                    <!-- Email -->
                    <div>
                        <label for="email" class="block text-sm font-medium text-gris-billetera mb-2">
                            Email
                        </label>
                        <input
                            id="email"
                            v-model="form.email"
                            type="email"
                            required
                            autocomplete="email"
                            :disabled="isLoading"
                            class="w-full px-4 py-3 border border-azul-claro-viaje/30 rounded-lg focus:ring-2 focus:ring-azul-tiquet focus:border-azul-tiquet transition-all duration-200 disabled:opacity-50"
                            placeholder="tu@email.com"
                        />
                    </div>

                    <!-- Password -->
                    <div>
                        <label for="password" class="block text-sm font-medium text-gris-billetera mb-2">
                            Contraseña
                        </label>
                        <div class="relative">
                            <input
                                id="password"
                                v-model="form.password"
                                :type="showPassword ? 'text' : 'password'"
                                required
                                autocomplete="current-password"
                                :disabled="isLoading"
                                class="w-full px-4 py-3 pr-12 border border-azul-claro-viaje/30 rounded-lg focus:ring-2 focus:ring-azul-tiquet focus:border-azul-tiquet transition-all duration-200 disabled:opacity-50"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                @click="showPassword = !showPassword"
                                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                :disabled="isLoading"
                            >
                                <span v-if="showPassword">👁️</span>
                                <span v-else>🙈</span>
                            </button>
                        </div>
                    </div>

                    <!-- Remember me & Forgot password -->
                    <div class="flex items-center justify-between">
                        <label class="flex items-center">
                            <input
                                v-model="form.rememberMe"
                                type="checkbox"
                                class="rounded border-azul-claro-viaje/30 text-azul-tiquet focus:ring-azul-tiquet"
                                :disabled="isLoading"
                            />
                            <span class="ml-2 text-sm text-gris-billetera">Recordarme</span>
                        </label>
                        <NuxtLink 
                            to="/auth/forgot-password"
                            class="text-sm text-azul-tiquet hover:text-azul-tiquet/80 transition-colors"
                        >
                            ¿Olvidaste tu contraseña?
                        </NuxtLink>
                    </div>
                </div>

                <!-- Submit Button -->
                <button
                    type="submit"
                    :disabled="isLoading || !canSubmit"
                    class="w-full py-3 px-4 bg-gradient-to-r from-azul-tiquet to-azul-claro-viaje text-blanco-dividido font-semibold rounded-lg hover:from-azul-tiquet/90 hover:to-azul-claro-viaje/90 focus:ring-4 focus:ring-azul-tiquet/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    <div v-if="isLoading" class="w-5 h-5 border-2 border-blanco-dividido border-t-transparent rounded-full animate-spin mr-2"></div>
                    {{ isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
                </button>

                <!-- Login attempts warning -->
                <div v-if="!canAttemptLogin" class="text-center p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p class="text-sm text-red-600">
                        Demasiados intentos fallidos. Espera 15 minutos antes de intentar de nuevo.
                    </p>
                </div>

                <!-- Register link -->
                <div class="text-center pt-4 border-t border-azul-claro-viaje/20">
                    <p class="text-sm text-gris-billetera">
                        ¿No tienes cuenta?
                        <NuxtLink 
                            to="/auth/register"
                            class="text-azul-tiquet hover:text-azul-tiquet/80 font-medium transition-colors"
                        >
                            Regístrate aquí
                        </NuxtLink>
                    </p>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuth } from '~/composables/useAuth'

definePageMeta({
    middleware: 'guest',
    layout: false
})

const { login, isLoading, canAttemptLogin } = useAuth()

const form = ref({
    email: '',
    password: '',
    rememberMe: false
})

const showPassword = ref(false)

const canSubmit = computed(() => {
    return form.value.email && form.value.password && canAttemptLogin.value
})

const handleSubmit = async () => {
    try {
        await login(form.value)
    } catch (error) {
        // Error handling is done in the composable
        console.error('Login failed:', error)
    }
}
</script>
