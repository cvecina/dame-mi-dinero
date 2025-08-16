import { useAuthStore } from '~/stores/auth.store'
import { useAlertStore } from '~/stores/alert.store'

export const useAuth = () => {
    const authStore = useAuthStore()
    const alertStore = useAlertStore()

    // Funciones de validación
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    const validatePassword = (password) => {
        // Mínimo 8 caracteres, al menos 1 mayúscula, 1 minúscula y 1 número
        // Permite letras, números y caracteres especiales comunes
        const hasLength = password.length >= 8
        const hasUppercase = /[A-Z]/.test(password)
        const hasLowercase = /[a-z]/.test(password)
        const hasNumber = /\d/.test(password)
        
        return hasLength && hasUppercase && hasLowercase && hasNumber
    }

    const validateName = (name) => {
        return name && name.trim().length >= 2
    }

    // Función de login con validaciones
    const login = async (credentials) => {
        try {
            // Validaciones básicas
            if (!credentials.email || !credentials.password) {
                throw new Error('Email y contraseña son obligatorios')
            }

            if (!validateEmail(credentials.email)) {
                throw new Error('El formato del email no es válido')
            }

            if (credentials.password.length < 6) {
                throw new Error('La contraseña debe tener al menos 6 caracteres')
            }

            // Intentar login
            const result = await authStore.login(credentials.email, credentials.password)
            
            if (result.success) {
                alertStore.success(`¡Bienvenido/a ${result.user.name}!`)
                
                // Verificar si hay una invitación pendiente
                const pendingInvitationToken = localStorage.getItem('pendingInvitationToken')
                if (pendingInvitationToken) {
                    localStorage.removeItem('pendingInvitationToken')
                    await navigateTo(`/invitation/${pendingInvitationToken}`)
                } else {
                    // Redirigir al dashboard
                    await navigateTo('/dashboard')
                }
            }

            return result
        } catch (error) {
            alertStore.error(error.message)
            throw error
        }
    }

    // Función de registro con validaciones
    const register = async (userData) => {
        try {
            // Validaciones básicas
            if (!userData.name || !userData.nickname || !userData.email || !userData.password || !userData.confirmPassword) {
                throw new Error('Todos los campos son obligatorios')
            }

            if (!validateName(userData.name)) {
                throw new Error('El nombre debe tener al menos 2 caracteres')
            }

            if (!validateName(userData.nickname)) {
                throw new Error('El apodo debe tener al menos 2 caracteres')
            }

            if (!validateEmail(userData.email)) {
                throw new Error('El formato del email no es válido')
            }

            if (!validatePassword(userData.password)) {
                const issues = []
                if (userData.password.length < 8) issues.push('al menos 8 caracteres')
                if (!/[A-Z]/.test(userData.password)) issues.push('una letra mayúscula')
                if (!/[a-z]/.test(userData.password)) issues.push('una letra minúscula')
                if (!/\d/.test(userData.password)) issues.push('un número')
                
                throw new Error(`La contraseña debe contener: ${issues.join(', ')}`)
            }

            if (userData.password !== userData.confirmPassword) {
                throw new Error('Las contraseñas no coinciden')
            }

            // Intentar registro
            const result = await authStore.register({
                name: userData.name.trim(),
                nickname: userData.nickname.trim(),
                email: userData.email,
                password: userData.password
            })

            if (result.success) {
                alertStore.success('¡Registro exitoso! Ya puedes iniciar sesión')
                
                // Verificar si hay una invitación pendiente
                const pendingInvitationToken = localStorage.getItem('pendingInvitationToken')
                if (pendingInvitationToken) {
                    localStorage.removeItem('pendingInvitationToken')
                    await navigateTo(`/invitation/${pendingInvitationToken}`)
                }
            }

            return result
        } catch (error) {
            alertStore.error(error.message)
            throw error
        }
    }

    // Función de logout
    const logout = async () => {
        try {
            await authStore.logout()
            alertStore.info('Sesión cerrada correctamente')
            
            // Redirigir al login
            await navigateTo('/auth/login')
        } catch (error) {
            alertStore.error('Error al cerrar sesión')
            console.error('Logout error:', error)
        }
    }

    // Función para verificar si el usuario está autenticado
    const requireAuth = () => {
        if (!authStore.isLoggedIn) {
            alertStore.warning('Debes iniciar sesión para acceder a esta página')
            navigateTo('/auth/login')
            return false
        }
        return true
    }

    // Función para solicitar recuperación de contraseña
    const forgotPassword = async (email) => {
        try {
            if (!email || !validateEmail(email)) {
                throw new Error('Ingresa un email válido')
            }

            const result = await authStore.requestPasswordReset(email)
            
            if (result.success) {
                alertStore.success('Se ha enviado un email con instrucciones para recuperar tu contraseña')
            }

            return result
        } catch (error) {
            alertStore.error(error.message)
            throw error
        }
    }

    // Función para actualizar perfil
    const updateProfile = async (profileData) => {
        try {
            if (profileData.name && !validateName(profileData.name)) {
                throw new Error('El nombre debe tener al menos 2 caracteres')
            }

            if (profileData.email && !validateEmail(profileData.email)) {
                throw new Error('El formato del email no es válido')
            }

            const result = await authStore.updateProfile(profileData)
            
            if (result.success) {
                alertStore.success('Perfil actualizado correctamente')
            }

            return result
        } catch (error) {
            alertStore.error(error.message)
            throw error
        }
    }

    // Función para cambiar contraseña
    const changePassword = async (currentPassword, newPassword, confirmPassword) => {
        try {
            if (!currentPassword || !newPassword || !confirmPassword) {
                throw new Error('Todos los campos son obligatorios')
            }

            if (!validatePassword(newPassword)) {
                throw new Error('La nueva contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y números')
            }

            if (newPassword !== confirmPassword) {
                throw new Error('Las contraseñas no coinciden')
            }

            // Llamar al endpoint específico para cambio de contraseña
            const response = await $fetch('/api/auth/change-password', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authStore.token}`
                },
                body: {
                    currentPassword,
                    newPassword
                }
            })

            if (response.success) {
                alertStore.success('Contraseña actualizada correctamente')
                return { success: true }
            } else {
                throw new Error(response.message || 'Error cambiando la contraseña')
            }
        } catch (error) {
            alertStore.error(error.message)
            throw error
        }
    }

    console.log('useAuth')
    return {
        // Estado
        user: computed(() => authStore.user),
        isAuthenticated: computed(() => authStore.isAuthenticated),
        isLoading: computed(() => authStore.isLoading),
        canAttemptLogin: computed(() => authStore.canAttemptLogin),
        
        // Funciones
        login,
        register,
        logout,
        requireAuth,
        forgotPassword,
        updateProfile,
        changePassword,
        
        // Validaciones
        validateEmail,
        validatePassword,
        validateName,
        
        // Store actions
        initializeAuth: authStore.initializeAuth,
        validateToken: authStore.validateToken
    }
}
