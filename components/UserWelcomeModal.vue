<template>
    <div 
        v-if="showModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
        <div class="bg-blanco-dividido rounded-lg shadow-xl w-full max-w-md">
            <!-- Header -->
            <div class="p-6 border-b text-center">
                <div class="text-4xl mb-3">💰</div>
                <h2 class="text-xl sm:text-2xl font-semibold text-gris-billetera">
                    ¡Bienvenido a Dame Mi Dinero!
                </h2>
                <p class="text-sm sm:text-base text-gray-600 mt-2">
                    Selecciona tu usuario o crea uno nuevo para empezar
                </p>
            </div>

            <!-- Content -->
            <div class="p-6">
                <!-- Usuarios existentes -->
                <div v-if="users.length > 0" class="mb-6">
                    <h3 class="text-sm font-medium text-gris-billetera mb-3">Usuarios existentes</h3>
                    <div class="space-y-2">
                        <button
                            v-for="user in users"
                            :key="user.id"
                            @click="selectUser(user)"
                            class="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-azul-claro-viaje/10 hover:border-azul-tiquet transition-colors"
                        >
                            <div class="w-10 h-10 bg-azul-tiquet rounded-full flex items-center justify-center text-blanco-dividido font-semibold">
                                {{ user.name.charAt(0).toUpperCase() }}
                            </div>
                            <span class="text-gris-billetera font-medium">{{ user.name }}</span>
                        </button>
                    </div>
                </div>

                <!-- Separador -->
                <div v-if="users.length > 0" class="border-t border-gray-200 my-6"></div>

                <!-- Crear nuevo usuario -->
                <div>
                    <h3 class="text-sm font-medium text-gris-billetera mb-3">
                        {{ users.length > 0 ? 'O crea un nuevo usuario' : 'Crea tu usuario' }}
                    </h3>
                    <div class="space-y-3">
                        <input
                            v-model="newUserName"
                            ref="newUserInput"
                            type="text"
                            placeholder="Tu nombre"
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azul-tiquet focus:border-transparent"
                            @keyup.enter="createUser"
                        >
                        <button
                            @click="createUser"
                            :disabled="!newUserName.trim() || isCreating"
                            class="w-full px-4 py-3 bg-lima-compartida text-gris-billetera font-medium rounded-lg hover:bg-azul-claro-viaje disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {{ isCreating ? 'Creando usuario...' : 'Crear y continuar' }}
                        </button>
                    </div>
                </div>

                <!-- Mensaje si no hay usuarios -->
                <div v-if="users.length === 0" class="text-center mt-4">
                    <div class="text-4xl mb-2">👋</div>
                    <p class="text-sm text-gray-600">
                        Parece que es tu primera vez aquí.<br>
                        ¡Crea tu usuario para empezar a usar la app!
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useUserStore } from '~/stores/user.store'
import { useAlertStore } from '~/stores/alert.store'

// Stores
const userStore = useUserStore()
const alertStore = useAlertStore()

// Reactive data
const newUserName = ref('')
const isCreating = ref(false)
const newUserInput = ref(null)

// Computed
const users = computed(() => userStore.getAllUsers)
const currentUser = computed(() => userStore.getCurrentUser)
const showModal = computed(() => !currentUser.value)

// Methods
const selectUser = (user) => {
    userStore.setCurrentUser(user)
    alertStore.showAlert('success', `¡Hola ${user.name}!`)
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
        
        alertStore.showAlert('success', `¡Bienvenido ${newUser.name}!`)
        
        // Reset form
        newUserName.value = ''
        
    } catch (error) {
        console.error('Error al crear usuario:', error)
        alertStore.showAlert('error', 'Error al crear el usuario')
    } finally {
        isCreating.value = false
    }
}

// Auto-focus en el input cuando no hay usuarios
onMounted(async () => {
    if (users.value.length === 0) {
        await nextTick()
        newUserInput.value?.focus()
    }
})

console.log('UserWelcomeModal')
</script>
