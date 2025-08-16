export default defineNuxtPlugin(async () => {
    const { initializeAuth } = useAuth()
    
    // Inicializar autenticación al cargar la aplicación
    if (process.client) {
        await initializeAuth()
    }
})
