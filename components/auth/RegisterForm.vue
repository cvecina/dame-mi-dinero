<template>
    <div class="min-h-screen bg-gradient-to-br from-azul-tiquet via-azul-claro-viaje to-lima-compartida flex items-center justify-center p-4">
        <div class="bg-blanco-dividido rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <!-- Header -->
            <div class="bg-gradient-to-r from-azul-tiquet to-azul-claro-viaje p-6 text-center">
                <h1 class="text-2xl font-bold text-blanco-dividido mb-2">Dame mi dinero</h1>
                <p class="text-azul-claro-viaje/90 text-sm">Crea tu cuenta</p>
            </div>

            <!-- Form -->
            <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
                <div class="space-y-4">
                    <!-- Name -->
                    <div>
                        <label for="name" class="block text-sm font-medium text-gris-billetera mb-2">
                            Nombre completo
                        </label>
                        <input
                            id="name"
                            v-model="form.name"
                            type="text"
                            required
                            autocomplete="name"
                            :disabled="isLoading"
                            class="w-full px-4 py-3 border border-azul-claro-viaje/30 rounded-lg focus:ring-2 focus:ring-azul-tiquet focus:border-azul-tiquet transition-all duration-200 disabled:opacity-50"
                            placeholder="Tu nombre completo"
                        />
                    </div>

                    <!-- Nickname -->
                    <div>
                        <label for="nickname" class="block text-sm font-medium text-gris-billetera mb-2">
                            Apodo <span class="text-xs text-gray-500">(así te verán otros usuarios)</span>
                        </label>
                        <input
                            id="nickname"
                            v-model="form.nickname"
                            type="text"
                            required
                            :disabled="isLoading"
                            class="w-full px-4 py-3 border border-azul-claro-viaje/30 rounded-lg focus:ring-2 focus:ring-azul-tiquet focus:border-azul-tiquet transition-all duration-200 disabled:opacity-50"
                            placeholder="Tu apodo"
                        />
                    </div>

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
                                autocomplete="new-password"
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
                        <div class="mt-2">
                            <div class="text-xs text-gray-600 space-y-1">
                                <div :class="passwordChecks.length ? 'text-green-600' : 'text-gray-400'">
                                    ✓ Al menos 8 caracteres
                                </div>
                                <div :class="passwordChecks.uppercase ? 'text-green-600' : 'text-gray-400'">
                                    ✓ Una letra mayúscula
                                </div>
                                <div :class="passwordChecks.lowercase ? 'text-green-600' : 'text-gray-400'">
                                    ✓ Una letra minúscula
                                </div>
                                <div :class="passwordChecks.number ? 'text-green-600' : 'text-gray-400'">
                                    ✓ Un número
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Confirm Password -->
                    <div>
                        <label for="confirmPassword" class="block text-sm font-medium text-gris-billetera mb-2">
                            Confirmar contraseña
                        </label>
                        <div class="relative">
                            <input
                                id="confirmPassword"
                                v-model="form.confirmPassword"
                                :type="showConfirmPassword ? 'text' : 'password'"
                                required
                                autocomplete="new-password"
                                :disabled="isLoading"
                                class="w-full px-4 py-3 pr-12 border border-azul-claro-viaje/30 rounded-lg focus:ring-2 focus:ring-azul-tiquet focus:border-azul-tiquet transition-all duration-200 disabled:opacity-50"
                                placeholder="••••••••"
                                :class="passwordsMatch === false ? 'border-red-300' : ''"
                            />
                            <button
                                type="button"
                                @click="showConfirmPassword = !showConfirmPassword"
                                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                :disabled="isLoading"
                            >
                                <span v-if="showConfirmPassword">👁️</span>
                                <span v-else>🙈</span>
                            </button>
                        </div>
                        <div v-if="passwordsMatch === false" class="mt-1 text-xs text-red-600">
                            Las contraseñas no coinciden
                        </div>
                    </div>

                    <!-- Terms and conditions -->
                    <div>
                        <label class="flex items-start">
                            <input
                                v-model="form.acceptTerms"
                                type="checkbox"
                                required
                                class="mt-1 rounded border-azul-claro-viaje/30 text-azul-tiquet focus:ring-azul-tiquet"
                                :disabled="isLoading"
                            />
                            <span class="ml-2 text-sm text-gris-billetera">
                                Acepto los 
                                <a href="#" class="text-azul-tiquet hover:text-azul-tiquet/80">términos y condiciones</a>
                                y la 
                                <a href="#" class="text-azul-tiquet hover:text-azul-tiquet/80">política de privacidad</a>
                            </span>
                        </label>
                    </div>
                </div>

                <!-- Submit Button -->
                <button
                    type="submit"
                    :disabled="isLoading || !canSubmit"
                    class="w-full py-3 px-4 bg-gradient-to-r from-azul-tiquet to-azul-claro-viaje text-blanco-dividido font-semibold rounded-lg hover:from-azul-tiquet/90 hover:to-azul-claro-viaje/90 focus:ring-4 focus:ring-azul-tiquet/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    <div v-if="isLoading" class="w-5 h-5 border-2 border-blanco-dividido border-t-transparent rounded-full animate-spin mr-2"></div>
                    {{ isLoading ? 'Creando cuenta...' : 'Crear Cuenta' }}
                </button>

                <!-- Debug info (only in development) -->
                <div v-if="isDevelopment" class="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                    <div>Debug info:</div>
                    <div>Name: {{ !!form.name.trim() }}</div>
                    <div>Nickname: {{ !!form.nickname.trim() }}</div>
                    <div>Email: {{ !!form.email }}</div>
                    <div>Password: {{ !!form.password }}</div>
                    <div>Confirm Password: {{ !!form.confirmPassword }}</div>
                    <div>Accept Terms: {{ form.acceptTerms }}</div>
                    <div>Password Strong: {{ passwordChecks.length && passwordChecks.uppercase && passwordChecks.lowercase && passwordChecks.number }}</div>
                    <div>Passwords Match: {{ passwordsMatch }}</div>
                    <div>Can Submit: {{ canSubmit }}</div>
                </div>

                <!-- Login link -->
                <div class="text-center pt-4 border-t border-azul-claro-viaje/20">
                    <p class="text-sm text-gris-billetera">
                        ¿Ya tienes cuenta?
                        <NuxtLink 
                            to="/auth/login"
                            class="text-azul-tiquet hover:text-azul-tiquet/80 font-medium transition-colors"
                        >
                            Inicia sesión aquí
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

const { register, isLoading, validatePassword } = useAuth()

// Check if we're in development mode safely
const isDevelopment = computed(() => {
    if (process.client) {
        return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    }
    return process.dev || false
})

const form = ref({
    name: '',
    nickname: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)

const passwordChecks = computed(() => {
    const password = form.value.password
    return {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password)
    }
})

const passwordsMatch = computed(() => {
    if (!form.value.confirmPassword) return null
    return form.value.password === form.value.confirmPassword
})

const canSubmit = computed(() => {
    const hasAllFields = form.value.name.trim() && 
                        form.value.nickname.trim() &&
                        form.value.email && 
                        form.value.password && 
                        form.value.confirmPassword && 
                        form.value.acceptTerms
                        
    const isPasswordStrong = passwordChecks.value.length && 
                           passwordChecks.value.uppercase && 
                           passwordChecks.value.lowercase && 
                           passwordChecks.value.number
                           
    const doPasswordsMatch = passwordsMatch.value === true
    
    return hasAllFields && isPasswordStrong && doPasswordsMatch
})

const handleSubmit = async () => {
    try {
        await register(form.value)
        // Redirigir al login después del registro exitoso
        await navigateTo('/auth/login')
    } catch (error) {
        // Error handling is done in the composable
        console.error('Registration failed:', error)
    }
}
</script>
