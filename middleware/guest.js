export default defineNuxtRouteMiddleware((to) => {
    const { isAuthenticated } = useAuth()
    
    // Si ya está autenticado, redirigir al dashboard
    if (isAuthenticated.value) {
        return navigateTo('/dashboard')
    }
})
