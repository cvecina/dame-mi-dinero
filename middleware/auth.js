export default defineNuxtRouteMiddleware((to) => {
    const { isAuthenticated, requireAuth } = useAuth()
    
    // Si no está autenticado, redirigir al login
    if (!isAuthenticated.value) {
        return navigateTo('/auth/login')
    }
})
