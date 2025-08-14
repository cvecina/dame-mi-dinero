import { nextTick } from 'vue'

export const useScrollPosition = () => {
    // Función para guardar la posición actual de scroll
    const saveScrollPosition = () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
        console.log('saveScrollPosition', { scrollTop })
        return scrollTop
    }
    
    // Función para restaurar la posición de scroll
    const restoreScrollPosition = (position) => {
        if (typeof position === 'number') {
            // Usar nextTick para asegurar que el DOM se haya actualizado
            nextTick(() => {
                window.scrollTo({
                    top: position,
                    behavior: 'instant' // Sin animación para mantener la posición exacta
                })
                console.log('restoreScrollPosition', { position })
            })
        }
    }
    
    // Función para ejecutar una acción preservando la posición de scroll
    const preserveScrollPosition = async (action) => {
        const scrollPosition = saveScrollPosition()
        
        try {
            await action()
        } finally {
            restoreScrollPosition(scrollPosition)
        }
    }
    
    console.log('useScrollPosition')
    return {
        saveScrollPosition,
        restoreScrollPosition,
        preserveScrollPosition
    }
}
