import { defineStore } from "pinia";

export const useUserStore = defineStore({
    id: "user",
    state: () => ({
        users: [],
        currentUser: null,
        loading: false
    }),
    
    getters: {
        getAllUsers: (state) => state.users,
        getUserById: (state) => (id) => state.users.find(user => user.id === id),
        getCurrentUser: (state) => state.currentUser,
        isLoading: (state) => state.loading
    },
    
    actions: {
        async fetchUsers() {
            this.loading = true
            try {
                const response = await $fetch('/api/users')
                this.users = response.data || []
                
                // Si no hay usuario actual, establecer el primero como actual
                if (!this.currentUser && this.users.length > 0) {
                    this.currentUser = this.users[0]
                }
                
                console.log('fetchUsers')
                return this.users
            } catch (error) {
                console.error('Error al obtener usuarios:', error)
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
                
                // Si es el primer usuario, establecerlo como actual
                if (!this.currentUser) {
                    this.currentUser = newUser
                }
                
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
                
                // Si era el usuario actual, actualizarlo
                if (this.currentUser?.id === id) {
                    this.currentUser = updatedUser
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
                
                // Si era el usuario actual, cambiar al primero disponible
                if (this.currentUser?.id === id) {
                    this.currentUser = this.users.length > 0 ? this.users[0] : null
                }
                
                console.log('deleteUser')
            } catch (error) {
                console.error('Error al eliminar usuario:', error)
                throw error
            } finally {
                this.loading = false
            }
        },
        
        setCurrentUser(user) {
            this.currentUser = user
            console.log('setCurrentUser')
        },
        
        async initializeUsers() {
            try {
                await this.fetchUsers()
                console.log('initializeUsers')
            } catch (error) {
                console.error('Error al inicializar usuarios:', error)
            }
        }
    }
});
