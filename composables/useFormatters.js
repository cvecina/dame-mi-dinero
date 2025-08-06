export const useFormatters = () => {
    const formatMoney = (amount) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount)
    }

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    }

    const formatDateLong = (date) => {
        return new Date(date).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
    }

    const formatDateTime = (date) => {
        return new Date(date).toLocaleString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    console.log('useFormatters')
    return {
        formatMoney,
        formatDate,
        formatDateLong,
        formatDateTime
    }
}
