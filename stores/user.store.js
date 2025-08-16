import { defineStore } from "pinia";

export const useUserStore = defineStore({
    id: "user",
    state: () => ({
        users: [],
        loading: false
    }),
    
    getters: {
        getAllUsers: (state) => state.users,
        getUserById: (state) => (id) => state.users.find(user => user.id === id),
        // El usuario actual ahora viene del store de autenticación
        getCurrentUser: () => {
            const authStore = useAuthStore();
            return authStore.user;
        },
        isLoading: (state) => state.loading
    },
    
    actions: {
        // Método para obtener usuarios desde el sistema legacy (sin autenticación)
        async fetchUsers() {
            this.loading = true
            try {
                const response = await $fetch('/api/users')
                this.users = response.data || []
                
                console.log('fetchUsers (legacy)')
                return this.users
            } catch (error) {
                console.error('Error al obtener usuarios:', error)
                throw error
            } finally {
                this.loading = false
            }
        },

        // Método para obtener usuarios autenticados (para compartir)
        async fetchAuthenticatedUsers() {
            const authStore = useAuthStore();
            if (!authStore.isAuthenticated) {
                console.warn('fetchAuthenticatedUsers: Usuario no autenticado');
                return [];
            }

            this.loading = true
            try {
                const response = await $fetch('/api/users/list', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${authStore.token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                this.users = response.data || []
                console.log('fetchAuthenticatedUsers: Loaded', this.users.length, 'users')
                return this.users
            } catch (error) {
                console.error('Error al obtener usuarios autenticados:', error)
                if (error.statusCode === 401) {
                    authStore.logout()
                }
                throw error
            } finally {
                this.loading = false
            }
        },
        
        async addUser(userData) {
            this.loading = true
            try {
                const response = await $fetch('/api/users', {
                    method: 'POST',
                    body: userData
                })
                
                const newUser = response.data
                this.users.push(newUser)
                
                console.log('addUser')
                return newUser
            } catch (error) {
                console.error('Error al añadir usuario:', error)
                throw error
            } finally {
                this.loading = false
            }
        },

        async updateUser(id, userData) {
            this.loading = true
            try {
                const response = await $fetch('/api/users', {
                    method: 'PUT',
                    body: { id, ...userData }
                })
                
                const updatedUser = response.data
                const userIndex = this.users.findIndex(user => user.id === id)
                if (userIndex !== -1) {
                    this.users[userIndex] = updatedUser
                }
                
                console.log('updateUser')
                return updatedUser
            } catch (error) {
                console.error('Error al actualizar usuario:', error)
                throw error
            } finally {
                this.loading = false
            }
        },

        async deleteUser(id) {
            this.loading = true
            try {
                await $fetch('/api/users', {
                    method: 'DELETE',
                    query: { id }
                })
                
                this.users = this.users.filter(user => user.id !== id)
                
                console.log('deleteUser')
            } catch (error) {
                console.error('Error al eliminar usuario:', error)
                throw error
            } finally {
                this.loading = false
            }
        },

        async initializeUsers() {
            try {
                const authStore = useAuthStore();
                
                // Si el usuario está autenticado, usar el endpoint autenticado
                // De lo contrario, usar el endpoint legacy
                if (authStore.isAuthenticated) {
                    await this.fetchAuthenticatedUsers()
                } else {
                    await this.fetchUsers()
                }
                
                console.log('initializeUsers')
            } catch (error) {
                console.error('Error al inicializar usuarios:', error)
            }
        }
    }
});
