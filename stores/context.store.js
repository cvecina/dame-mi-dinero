import { defineStore } from "pinia";

export const useContextStore = defineStore({
    id: "context",
    state: () => ({
        selectedDineroId: null,
        loading: false
    }),
    
    getters: {
        getSelectedDineroId: (state) => state.selectedDineroId,
        
        getSelectedDinero() {
            if (!this.selectedDineroId) return null;
            // Usar dynamic import para evitar problemas de circular dependency
            return null; // Lo manejaremos desde los componentes que lo necesiten
        },
        
        isLoading: (state) => state.loading
    },
    
    actions: {
        setSelectedDinero(dineroId) {
            this.selectedDineroId = dineroId;
            // Guardar en localStorage para persistencia
            if (process.client) {
                if (dineroId) {
                    localStorage.setItem('selectedDineroId', dineroId.toString());
                } else {
                    localStorage.removeItem('selectedDineroId');
                }
            }
            console.log('setSelectedDinero');
        },
        
        async initializeSelectedDinero() {
            try {
                // Cargar desde localStorage si existe
                if (process.client) {
                    const savedDineroId = localStorage.getItem('selectedDineroId');
                    if (savedDineroId) {
                        this.selectedDineroId = parseInt(savedDineroId);
                    }
                }
                
                // Si no hay dinero seleccionado, usar el por defecto
                if (!this.selectedDineroId) {
                    const { useDineroStore } = await import('~/stores/dinero.store');
                    const dineroStore = useDineroStore();
                    
                    // Asegurar que los dineros estén cargados
                    if (dineroStore.dineros.length === 0) {
                        await dineroStore.initializeDineros();
                    }
                    
                    const defaultDinero = dineroStore.getDefaultDinero;
                    if (defaultDinero) {
                        this.setSelectedDinero(defaultDinero.id);
                    }
                }
                
                console.log('initializeSelectedDinero');
            } catch (error) {
                console.error('Error al inicializar dinero seleccionado:', error);
            }
        },
        
        clearSelectedDinero() {
            this.selectedDineroId = null;
            if (process.client) {
                localStorage.removeItem('selectedDineroId');
            }
            console.log('clearSelectedDinero');
        }
    }
});
