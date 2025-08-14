import { ref, watch } from 'vue'

export const useDashboardConfig = () => {
    // Configuración por defecto de los paneles
    const defaultPanels = [
        { 
            id: 'analytics', 
            name: 'Smart Analytics', 
            icon: '🧠', 
            visible: true, 
            order: 1,
            description: 'Insights inteligentes y análisis predictivo de tus gastos'
        },
        { 
            id: 'alerts', 
            name: 'Alertas importantes', 
            icon: '⚠️', 
            visible: true, 
            order: 2,
            description: 'Notificaciones y avisos importantes'
        },
        { 
            id: 'summary', 
            name: 'Resumen de balances', 
            icon: '💰', 
            visible: true, 
            order: 3,
            description: 'Total gastado, tu balance y estadísticas del período'
        },
        { 
            id: 'budgets', 
            name: 'Presupuestos activos', 
            icon: '💼', 
            visible: true, 
            order: 4,
            description: 'Control de gastos por categoría'
        },
        { 
            id: 'categories', 
            name: 'Gastos por categoría', 
            icon: '📊', 
            visible: true, 
            order: 5,
            description: 'Análisis detallado de gastos organizados por categorías con gráficos'
        },
        { 
            id: 'recent', 
            name: 'Gastos recientes', 
            icon: '💸', 
            visible: true, 
            order: 6,
            description: 'Últimos movimientos registrados'
        },
        { 
            id: 'pending', 
            name: 'Pagos pendientes', 
            icon: '⏰', 
            visible: true, 
            order: 7,
            description: 'Gastos que aún no has pagado'
        },
        { 
            id: 'debts', 
            name: 'Tus deudas', 
            icon: '💳', 
            visible: true, 
            order: 8,
            description: 'Dinero que debes a otros'
        },
        { 
            id: 'credits', 
            name: 'Te deben', 
            icon: '💰', 
            visible: true, 
            order: 9,
            description: 'Dinero que otros te deben'
        }
    ]

    const dashboardPanels = ref([...defaultPanels])
    
    // Clave para localStorage
    const STORAGE_KEY = 'dashboardPanelConfig'
    
    // Función para cargar la configuración desde localStorage
    const loadPanelSettings = () => {
        if (process.client) {
            try {
                const saved = localStorage.getItem(STORAGE_KEY)
                if (saved) {
                    const savedConfig = JSON.parse(saved)
                    
                    // Actualizar paneles existentes con la configuración guardada
                    savedConfig.forEach(savedPanel => {
                        const panel = dashboardPanels.value.find(p => p.id === savedPanel.id)
                        if (panel) {
                            panel.visible = savedPanel.visible
                            panel.order = savedPanel.order
                        }
                    })
                    
                    // Ordenar paneles según el orden guardado
                    dashboardPanels.value.sort((a, b) => a.order - b.order)
                    
                    console.log('loadPanelSettings: Configuración cargada correctamente')
                }
            } catch (error) {
                console.error('Error al cargar configuración de paneles:', error)
                // En caso de error, resetear a configuración por defecto
                dashboardPanels.value = [...defaultPanels]
            }
        }
    }
    
    // Función para guardar la configuración en localStorage
    const savePanelSettings = () => {
        if (process.client) {
            try {
                const config = dashboardPanels.value.map(panel => ({
                    id: panel.id,
                    visible: panel.visible,
                    order: panel.order
                }))
                
                localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
                console.log('savePanelSettings: Configuración guardada correctamente')
            } catch (error) {
                console.error('Error al guardar configuración de paneles:', error)
            }
        }
    }
    
    // Función para mover un panel hacia arriba
    const movePanelUp = (panelId) => {
        const panelIndex = dashboardPanels.value.findIndex(p => p.id === panelId)
        if (panelIndex > 0) {
            // Intercambiar órdenes
            const currentOrder = dashboardPanels.value[panelIndex].order
            const previousOrder = dashboardPanels.value[panelIndex - 1].order
            
            dashboardPanels.value[panelIndex].order = previousOrder
            dashboardPanels.value[panelIndex - 1].order = currentOrder
            
            // Reordenar array
            dashboardPanels.value.sort((a, b) => a.order - b.order)
            
            // Guardar cambios
            savePanelSettings()
        }
    }
    
    // Función para mover un panel hacia abajo
    const movePanelDown = (panelId) => {
        const panelIndex = dashboardPanels.value.findIndex(p => p.id === panelId)
        if (panelIndex < dashboardPanels.value.length - 1) {
            // Intercambiar órdenes
            const currentOrder = dashboardPanels.value[panelIndex].order
            const nextOrder = dashboardPanels.value[panelIndex + 1].order
            
            dashboardPanels.value[panelIndex].order = nextOrder
            dashboardPanels.value[panelIndex + 1].order = currentOrder
            
            // Reordenar array
            dashboardPanels.value.sort((a, b) => a.order - b.order)
            
            // Guardar cambios
            savePanelSettings()
        }
    }
    
    // Función para alternar la visibilidad de un panel
    const togglePanelVisibility = (panelId) => {
        const panel = dashboardPanels.value.find(p => p.id === panelId)
        if (panel) {
            panel.visible = !panel.visible
            savePanelSettings()
        }
    }
    
    // Función para resetear a configuración por defecto
    const resetToDefault = () => {
        dashboardPanels.value = [...defaultPanels]
        savePanelSettings()
    }
    
    console.log('useDashboardConfig')
    return {
        dashboardPanels,
        loadPanelSettings,
        savePanelSettings,
        movePanelUp,
        movePanelDown,
        togglePanelVisibility,
        resetToDefault
    }
}
