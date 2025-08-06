<template>
    <div class="relative">
        <!-- Selector de usuario -->
        <button 
            @click="showUserSelector = !showUserSelector"
            class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-azul-claro-viaje/10 transition-colors"
        >
            <div class="w-8 h-8 bg-azul-tiquet rounded-full flex items-center justify-center text-blanco-dividido text-sm font-semibold">
                {{ currentUser?.name?.charAt(0)?.toUpperCase() || "?" }}
            </div>
            <span class="hidden sm:block text-gris-billetera font-medium">
                {{ currentUser?.name || "Seleccionar usuario" }}
            </span>
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
        </button>

        <!-- Dropdown del selector de usuario -->
        <div 
            v-if="showUserSelector"
            class="absolute top-full right-0 mt-2 w-64 bg-blanco-dividido border border-gray-200 rounded-lg shadow-lg z-50"
        >
            <!-- Lista de usuarios existentes -->
            <div class="p-2">
                <p class="text-xs font-medium text-gray-500 uppercase px-2 py-1">Usuarios existentes</p>
                <div v-if="users.length === 0" class="px-2 py-3 text-sm text-gray-500 text-center">
                    No hay usuarios creados
                </div>
                <button
                    v-for="user in users"
                    :key="user.id"
                    @click="selectUser(user)"
                    class="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-azul-claro-viaje/10 transition-colors"
                    :class="{ 'bg-azul-claro-viaje/20': user.id === currentUser?.id }"
                >
                    <div class="w-8 h-8 bg-azul-tiquet rounded-full flex items-center justify-center text-blanco-dividido text-sm font-semibold">
                        {{ user.name.charAt(0).toUpperCase() }}
                    </div>
                    <div class="flex-1 text-left">
                        <p class="text-sm font-medium text-gris-billetera">{{ user.name }}</p>
                        <p v-if="user.id === currentUser?.id" class="text-xs text-azul-tiquet">Usuario actual</p>
                    </div>
                    <svg v-if="user.id === currentUser?.id" class="w-4 h-4 text-azul-tiquet" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                </button>
            </div>

            <!-- Separador -->
            <div class="border-t border-gray-200"></div>

            <!-- Crear nuevo usuario -->
            <div class="p-2">
                <button
                    v-if="!showCreateUser"
                    @click="showCreateUser = true"
                    class="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-lima-compartida/10 text-lima-compartida transition-colors"
                >
                    <div class="w-8 h-8 bg-lima-compartida rounded-full flex items-center justify-center text-gris-billetera text-lg font-bold">
                        +
                    </div>
                    <span class="text-sm font-medium">Crear nuevo usuario</span>
                </button>

                <!-- Formulario para crear usuario -->
                <div v-if="showCreateUser" class="space-y-3">
                    <div>
                        <input
                            v-model="newUserName"
                            ref="newUserInput"
                            type="text"
                            placeholder="Nombre del usuario"
                            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-azul-tiquet focus:border-transparent"
                            @keyup.enter="createUser"
                            @keyup.escape="cancelCreateUser"
                        >
                    </div>
                    <div class="flex gap-2">
                        <button
                            @click="createUser"
                            :disabled="!newUserName.trim() || isCreating"
                            class="flex-1 px-3 py-2 bg-lima-compartida text-gris-billetera text-sm font-medium rounded-lg hover:bg-azul-claro-viaje disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {{ isCreating ? 'Creando...' : 'Crear' }}
                        </button>
                        <button
                            @click="cancelCreateUser"
                            class="px-3 py-2 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>

            <!-- Separador -->
            <div v-if="currentUser" class="border-t border-gray-200"></div>

            <!-- Cerrar sesión -->
            <div v-if="currentUser" class="p-2">
                <button
                    @click="logout"
                    class="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                    </svg>
                    <span class="text-sm font-medium">Cambiar usuario</span>
                </button>
            </div>
        </div>
    </div>

    <!-- Overlay para cerrar el dropdown -->
    <div 
        v-if="showUserSelector"
        class="fixed inset-0 z-40"
        @click="showUserSelector = false"
    ></div>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue'
import { useUserStore } from '~/stores/user.store'
import { useAlertStore } from '~/stores/alert.store'

// Stores
const userStore = useUserStore()
const alertStore = useAlertStore()

// Reactive data
const showUserSelector = ref(false)
const showCreateUser = ref(false)
const newUserName = ref('')
const isCreating = ref(false)
const newUserInput = ref(null)

// Computed
const users = computed(() => userStore.getAllUsers)
const currentUser = computed(() => userStore.getCurrentUser)

// Methods
const selectUser = (user) => {
    userStore.setCurrentUser(user)
    showUserSelector.value = false
    alertStore.showAlert('success', `Cambiado a usuario: ${user.name}`)
}

const createUser = async () => {
    if (!newUserName.value.trim()) return
    
    isCreating.value = true
    try {
        const userData = {
            name: newUserName.value.trim()
        }
        
        const newUser = await userStore.addUser(userData)
        userStore.setCurrentUser(newUser)
        
        alertStore.showAlert('success', `Usuario ${newUser.name} creado y seleccionado`)
        
        // Reset form
        newUserName.value = ''
        showCreateUser.value = false
        showUserSelector.value = false
        
    } catch (error) {
        console.error('Error al crear usuario:', error)
        alertStore.showAlert('error', 'Error al crear el usuario')
    } finally {
        isCreating.value = false
    }
}

const cancelCreateUser = () => {
    newUserName.value = ''
    showCreateUser.value = false
}

const logout = () => {
    userStore.setCurrentUser(null)
    if (typeof window !== 'undefined') {
        localStorage.removeItem('currentUserId')
    }
    showUserSelector.value = false
    alertStore.showAlert('success', 'Has cambiado de usuario')
}

// Watch para auto-focus en el input cuando se muestra
watch(showCreateUser, async (newValue) => {
    if (newValue) {
        await nextTick()
        newUserInput.value?.focus()
    }
})

console.log('UserSelector')
</script>
