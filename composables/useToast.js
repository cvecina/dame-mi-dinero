export const useToast = () => {
  const showToast = (message, type = 'info', duration = 3000) => {
    // Crear elemento toast
    const toast = document.createElement('div')
    toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-all duration-300 transform translate-x-full opacity-0`
    
    // Aplicar colores según el tipo
    const typeClasses = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      warning: 'bg-yellow-500',
      info: 'bg-blue-500'
    }
    
    toast.classList.add(typeClasses[type] || typeClasses.info)
    toast.textContent = message
    
    // Añadir al DOM
    document.body.appendChild(toast)
    
    // Animar entrada
    setTimeout(() => {
      toast.classList.remove('translate-x-full', 'opacity-0')
    }, 100)
    
    // Animar salida y remover
    setTimeout(() => {
      toast.classList.add('translate-x-full', 'opacity-0')
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast)
        }
      }, 300)
    }, duration)
  }
  
  return {
    showToast
  }
}
