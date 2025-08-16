export const useDineroStore = defineStore('dinero', () => {
    // State
    const dineros = ref([])
    const loading = ref(false)
    const error = ref(null)

    // Getters
    const getMyDineros = computed(() => {
        const authStore = useAuthStore()
        if (!authStore.isAuthenticated) return []
        
        return dineros.value.filter(dinero => dinero.ownerId === authStore.user?.id)
    })

    const getSharedDineros = computed(() => {
        const authStore = useAuthStore()
        if (!authStore.isAuthenticated) return []
        
        return dineros.value.filter(dinero => 
            dinero.ownerId !== authStore.user?.id && 
            dinero.sharedWith?.includes(authStore.user?.id)
        )
    })

    const getAccessibleDineros = computed(() => {
        return [...getMyDineros.value, ...getSharedDineros.value]
    })

    const getDefaultDinero = computed(() => {
        return getMyDineros.value.find(dinero => dinero.isDefault) || getMyDineros.value[0] || null
    })

    const getDineroById = computed(() => {
        return (id) => getAccessibleDineros.value.find(dinero => dinero.id === id)
    })

    // Helper para obtener headers con autenticación
    const getAuthHeaders = () => {
        const authStore = useAuthStore()
        if (!authStore.token) {
            throw new Error('Usuario no autenticado')
        }
        
        return {
            'Authorization': `Bearer ${authStore.token}`,
            'Content-Type': 'application/json'
        }
    }

    // Actions
    const fetchDineros = async () => {
        const authStore = useAuthStore()
        if (!authStore.isAuthenticated) {
            console.warn('fetchDineros: Usuario no autenticado')
            dineros.value = []
            return
        }

        loading.value = true
        error.value = null

        try {
            const response = await $fetch('/api/dineros', {
                method: 'GET',
                headers: getAuthHeaders()
            })

            if (response.success) {
                dineros.value = response.data || []
                console.log('fetchDineros: Dineros cargados exitosamente', dineros.value.length)
            } else {
                throw new Error(response.message || 'Error al cargar dineros')
            }
        } catch (err) {
            error.value = err.message || 'Error al cargar dineros'
            console.error('fetchDineros error:', err)
            dineros.value = []
            
            // Si es error de autenticación, limpiar sesión
            if (err.statusCode === 401) {
                authStore.logout()
            }
        } finally {
            loading.value = false
        }
    }

    const createDinero = async (dineroData) => {
        const authStore = useAuthStore()
        if (!authStore.isAuthenticated) {
            throw new Error('Usuario no autenticado')
        }

        loading.value = true
        error.value = null

        try {
            const response = await $fetch('/api/dineros', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: dineroData
            })

            if (response.success) {
                dineros.value.push(response.data)
                console.log('createDinero: Dinero creado exitosamente', response.data)
                return response.data
            } else {
                throw new Error(response.message || 'Error al crear dinero')
            }
        } catch (err) {
            error.value = err.message || 'Error al crear dinero'
            console.error('createDinero error:', err)
            
            if (err.statusCode === 401) {
                authStore.logout()
            }
            throw err
        } finally {
            loading.value = false
        }
    }

    const updateDinero = async (id, updateData) => {
        const authStore = useAuthStore()
        if (!authStore.isAuthenticated) {
            throw new Error('Usuario no autenticado')
        }

        loading.value = true
        error.value = null

        try {
            const response = await $fetch('/api/dineros', {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: { id, ...updateData }
            })

            if (response.success) {
                const index = dineros.value.findIndex(d => d.id === id)
                if (index !== -1) {
                    dineros.value[index] = response.data
                }
                console.log('updateDinero: Dinero actualizado exitosamente', response.data)
                return response.data
            } else {
                throw new Error(response.message || 'Error al actualizar dinero')
            }
        } catch (err) {
            error.value = err.message || 'Error al actualizar dinero'
            console.error('updateDinero error:', err)
            
            if (err.statusCode === 401) {
                authStore.logout()
            }
            throw err
        } finally {
            loading.value = false
        }
    }

    const deleteDinero = async (id) => {
        const authStore = useAuthStore()
        if (!authStore.isAuthenticated) {
            throw new Error('Usuario no autenticado')
        }

        loading.value = true
        error.value = null

        try {
            const response = await $fetch('/api/dineros', {
                method: 'DELETE',
                headers: getAuthHeaders(),
                body: { id }
            })

            if (response.success) {
                dineros.value = dineros.value.filter(d => d.id !== id)
                console.log('deleteDinero: Dinero eliminado exitosamente')
                return true
            } else {
                throw new Error(response.message || 'Error al eliminar dinero')
            }
        } catch (err) {
            error.value = err.message || 'Error al eliminar dinero'
            console.error('deleteDinero error:', err)
            
            if (err.statusCode === 401) {
                authStore.logout()
            }
            throw err
        } finally {
            loading.value = false
        }
    }

    const shareDinero = async (dineroId, targetUserId) => {
        const authStore = useAuthStore()
        if (!authStore.isAuthenticated) {
            throw new Error('Usuario no autenticado')
        }

        loading.value = true
        error.value = null

        try {
            const response = await $fetch('/api/dineros/share', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: { dineroId, targetUserId }
            })

            if (response.success) {
                // Actualizar el dinero en el store local
                const index = dineros.value.findIndex(d => d.id === dineroId)
                if (index !== -1) {
                    dineros.value[index] = response.data.dinero
                }
                console.log('shareDinero: Dinero compartido exitosamente')
                return response.data
            } else {
                throw new Error(response.message || 'Error al compartir dinero')
            }
        } catch (err) {
            error.value = err.message || 'Error al compartir dinero'
            console.error('shareDinero error:', err)
            
            if (err.statusCode === 401) {
                authStore.logout()
            }
            throw err
        } finally {
            loading.value = false
        }
    }

    const unshareDinero = async (dineroId, targetUserId) => {
        const authStore = useAuthStore()
        if (!authStore.isAuthenticated) {
            throw new Error('Usuario no autenticado')
        }

        loading.value = true
        error.value = null

        try {
            const response = await $fetch('/api/dineros/share', {
                method: 'DELETE',
                headers: getAuthHeaders(),
                body: { dineroId, targetUserId }
            })

            if (response.success) {
                // Actualizar el dinero en el store local
                const index = dineros.value.findIndex(d => d.id === dineroId)
                if (index !== -1) {
                    dineros.value[index] = response.data
                }
                console.log('unshareDinero: Dinero ya no compartido')
                return response.data
            } else {
                throw new Error(response.message || 'Error al dejar de compartir dinero')
            }
        } catch (err) {
            error.value = err.message || 'Error al dejar de compartir dinero'
            console.error('unshareDinero error:', err)
            
            if (err.statusCode === 401) {
                authStore.logout()
            }
            throw err
        } finally {
            loading.value = false
        }
    }

    // Función para limpiar el estado (útil para logout)
    const clearDineros = () => {
        dineros.value = []
        error.value = null
        loading.value = false
        console.log('clearDineros: Estado del store limpiado')
    }

    // Alias para compatibilidad con componentes existentes
    const initializeDineros = fetchDineros

    // Getters adicionales para compatibilidad
    const getAllDineros = computed(() => getAccessibleDineros.value)
    const isLoading = computed(() => loading.value)

    return {
        // State
        dineros: readonly(dineros),
        loading: readonly(loading),
        error: readonly(error),
        
        // Getters
        getMyDineros,
        getSharedDineros,
        getAccessibleDineros,
        getDefaultDinero,
        getDineroById,
        getAllDineros,
        isLoading,
        
        // Actions
        fetchDineros,
        createDinero,
        updateDinero,
        deleteDinero,
        shareDinero,
        unshareDinero,
        clearDineros,
        initializeDineros
    }
})
