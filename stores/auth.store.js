import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
        loginAttempts: 0,
        lastLoginAttempt: null
    }),

    getters: {
        getCurrentUser: (state) => state.user,
        isLoggedIn: (state) => state.isAuthenticated && !!state.user,
        getToken: (state) => state.token,
        canAttemptLogin: (state) => {
            if (state.loginAttempts < 3) return true
            if (!state.lastLoginAttempt) return true
            
            const now = new Date()
            const lastAttempt = new Date(state.lastLoginAttempt)
            const diffMinutes = (now - lastAttempt) / (1000 * 60)
            
            return diffMinutes >= 15 // Permitir después de 15 minutos
        }
    },

    actions: {
        async login(email, password) {
            this.isLoading = true
            
            try {
                if (!this.canAttemptLogin) {
                    throw new Error('Demasiados intentos de login. Espera 15 minutos antes de intentar de nuevo.')
                }

                const response = await $fetch('/api/auth/login', {
                    method: 'POST',
                    body: {
                        email: email.toLowerCase().trim(),
                        password
                    }
                })

                if (response.success) {
                    this.user = response.data.user
                    this.token = response.data.token
                    this.isAuthenticated = true
                    this.loginAttempts = 0
                    this.lastLoginAttempt = null

                    // Guardar token en localStorage para persistencia
                    if (process.client) {
                        localStorage.setItem('auth_token', this.token)
                        localStorage.setItem('auth_user', JSON.stringify(this.user))
                    }

                    console.log('login success')
                    return { success: true, user: this.user }
                } else {
                    this.recordFailedAttempt()
                    throw new Error(response.message || 'Error de autenticación')
                }
            } catch (error) {
                this.recordFailedAttempt()
                console.error('Login error:', error)
                
                // Extraer mensaje de error más amigable
                let errorMessage = 'Error de autenticación'
                
                if (error.data && error.data.statusMessage) {
                    errorMessage = error.data.statusMessage
                } else if (error.statusMessage) {
                    errorMessage = error.statusMessage
                } else if (error.message && !error.message.includes('/api/')) {
                    errorMessage = error.message
                } else if (error.response && error.response._data && error.response._data.statusMessage) {
                    errorMessage = error.response._data.statusMessage
                }
                
                throw new Error(errorMessage)
            } finally {
                this.isLoading = false
            }
        },

        async register(userData) {
            this.isLoading = true
            
            try {
                const response = await $fetch('/api/auth/register', {
                    method: 'POST',
                    body: {
                        ...userData,
                        email: userData.email.toLowerCase().trim()
                    }
                })

                if (response.success) {
                    console.log('register success')
                    return { success: true, message: 'Usuario registrado correctamente' }
                } else {
                    throw new Error(response.message || 'Error en el registro')
                }
            } catch (error) {
                console.error('Register error:', error)
                
                // Extraer mensaje de error más amigable
                let errorMessage = 'Error en el registro'
                
                if (error.data && error.data.statusMessage) {
                    errorMessage = error.data.statusMessage
                } else if (error.statusMessage) {
                    errorMessage = error.statusMessage
                } else if (error.message && !error.message.includes('/api/')) {
                    errorMessage = error.message
                } else if (error.response && error.response._data && error.response._data.statusMessage) {
                    errorMessage = error.response._data.statusMessage
                }
                
                throw new Error(errorMessage)
            } finally {
                this.isLoading = false
            }
        },

        async validateToken() {
            if (!this.token) return false

            try {
                // Validar formato básico del token antes de enviarlo
                if (!this.token || this.token.trim() === '' || this.token.split('.').length !== 3) {
                    console.log('Invalid token format, clearing auth data')
                    await this.logout()
                    return false
                }

                const response = await $fetch('/api/auth/validate', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.token}`
                    }
                })

                if (response.success) {
                    this.isAuthenticated = true
                    return true
                } else {
                    await this.logout()
                    return false
                }
            } catch (error) {
                console.error('Token validation error:', error)
                await this.logout()
                return false
            }
        },

        async initializeAuth() {
            if (process.client) {
                const token = localStorage.getItem('auth_token')
                const userData = localStorage.getItem('auth_user')

                if (token && userData) {
                    try {
                        // Validar formato básico del token antes de usarlo
                        if (!token || token.trim() === '' || token.split('.').length !== 3) {
                            console.log('Invalid token format found in localStorage, clearing data')
                            this.logout()
                            return
                        }

                        // Validar que userData sea JSON válido
                        const parsedUserData = JSON.parse(userData)
                        if (!parsedUserData || !parsedUserData.id || !parsedUserData.email) {
                            console.log('Invalid user data found in localStorage, clearing data')
                            this.logout()
                            return
                        }

                        this.token = token
                        this.user = parsedUserData
                        
                        // Validar el token con el servidor
                        const isValid = await this.validateToken()
                        if (!isValid) {
                            // Token inválido, limpiar datos
                            console.log('Token validation failed, clearing auth data')
                            this.logout()
                        }
                    } catch (error) {
                        console.error('Error initializing auth:', error)
                        this.logout()
                    }
                }
            }
            console.log('initializeAuth')
        },

        async updateProfile(profileData) {
            this.isLoading = true
            
            try {
                const response = await $fetch('/api/auth/profile', {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${this.token}`
                    },
                    body: profileData
                })

                if (response.success) {
                    this.user = { ...this.user, ...response.data }
                    
                    // Actualizar localStorage
                    if (process.client) {
                        localStorage.setItem('auth_user', JSON.stringify(this.user))
                    }

                    console.log('updateProfile')
                    return { success: true, user: this.user }
                } else {
                    throw new Error(response.message || 'Error actualizando perfil')
                }
            } catch (error) {
                console.error('Update profile error:', error)
                throw error
            } finally {
                this.isLoading = false
            }
        },

        async changePassword(passwordData) {
            this.isLoading = true
            
            try {
                const response = await $fetch('/api/auth/change-password', {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${this.token}`
                    },
                    body: passwordData
                })

                if (response.success) {
                    console.log('changePassword')
                    return { success: true }
                } else {
                    throw new Error(response.message || 'Error cambiando contraseña')
                }
            } catch (error) {
                console.error('Change password error:', error)
                
                // Extraer mensaje de error más amigable
                let errorMessage = 'Error cambiando contraseña'
                
                if (error.data?.statusMessage) {
                    errorMessage = error.data.statusMessage
                } else if (error.statusMessage) {
                    errorMessage = error.statusMessage
                } else if (error.message && !error.message.includes('/api/')) {
                    errorMessage = error.message
                }
                
                return { success: false, error: errorMessage }
            } finally {
                this.isLoading = false
            }
        },

        logout() {
            this.user = null
            this.token = null
            this.isAuthenticated = false
            
            if (process.client) {
                localStorage.removeItem('auth_token')
                localStorage.removeItem('auth_user')
            }
            
            // Limpiar otros stores relacionados
            try {
                const dineroStore = useDineroStore()
                dineroStore.clearDineros()
            } catch (error) {
                console.log('dineroStore not available during logout:', error.message)
            }
            
            navigateTo('/auth/login')
            console.log('logout')
        },

        recordFailedAttempt() {
            this.loginAttempts++
            this.lastLoginAttempt = new Date().toISOString()
        },

        async requestPasswordReset(email) {
            this.isLoading = true
            
            try {
                const response = await $fetch('/api/auth/forgot-password', {
                    method: 'POST',
                    body: { email: email.toLowerCase().trim() }
                })

                console.log('requestPasswordReset')
                return response
            } catch (error) {
                console.error('Password reset error:', error)
                throw error
            } finally {
                this.isLoading = false
            }
        },

        async resetPassword(token, newPassword) {
            this.isLoading = true
            
            try {
                const response = await $fetch('/api/auth/reset-password', {
                    method: 'POST',
                    body: { token, password: newPassword }
                })

                console.log('resetPassword')
                return response
            } catch (error) {
                console.error('Password reset error:', error)
                throw error
            } finally {
                this.isLoading = false
            }
        }
    }
})
