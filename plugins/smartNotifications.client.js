/**
 * Plugin para notificaciones inteligentes y recordatorios
 */
export default defineNuxtPlugin(() => {
    // Solo ejecutar en cliente
    if (!process.client) return

    const { sendNotification, requestNotificationPermission } = usePWAManager()
    const { $router } = useNuxtApp()

    // Configurar notificaciones automáticas
    const setupSmartNotifications = async () => {
        const hasPermission = await requestNotificationPermission()
        if (!hasPermission) return

        // Recordatorio diario para revisar gastos (9 AM)
        const scheduleDaily = () => {
            const now = new Date()
            const target = new Date()
            target.setHours(9, 0, 0, 0)
            
            // Si ya pasó la hora hoy, programar para mañana
            if (now > target) {
                target.setDate(target.getDate() + 1)
            }
            
            const timeout = target.getTime() - now.getTime()
            
            setTimeout(() => {
                sendNotification('🌅 ¡Buenos días!', {
                    body: 'No olvides revisar tus gastos de ayer',
                    tag: 'daily-reminder',
                    actions: [
                        {
                            action: 'view-expenses',
                            title: 'Ver gastos'
                        },
                        {
                            action: 'dismiss',
                            title: 'Recordar más tarde'
                        }
                    ]
                })
                
                // Programar para el siguiente día
                scheduleDaily()
            }, timeout)
        }

        // Recordatorio semanal de presupuestos (Domingos 8 PM)
        const scheduleWeekly = () => {
            const now = new Date()
            const target = new Date()
            const day = target.getDay()
            const daysUntilSunday = (7 - day) % 7
            
            target.setDate(target.getDate() + daysUntilSunday)
            target.setHours(20, 0, 0, 0)
            
            // Si ya pasó esta semana, programar para la siguiente
            if (now > target) {
                target.setDate(target.getDate() + 7)
            }
            
            const timeout = target.getTime() - now.getTime()
            
            setTimeout(() => {
                sendNotification('📊 Revisión semanal', {
                    body: 'Es momento de revisar cómo van tus presupuestos',
                    tag: 'weekly-budget',
                    actions: [
                        {
                            action: 'view-budgets',
                            title: 'Ver presupuestos'
                        }
                    ]
                })
                
                // Programar para la siguiente semana
                scheduleWeekly()
            }, timeout)
        }

        // Notificación cuando se excede un presupuesto
        const checkBudgetAlerts = () => {
            // Esta función será llamada desde los stores cuando se agregue un gasto
            const budgetStore = useBudgetStore()
            const expenseStore = useExpenseStore()
            const contextStore = useContextStore()
            
            if (!contextStore.getSelectedDineroId) return
            
            const budgetProgress = budgetStore.getAllBudgetProgress(
                contextStore.getSelectedDineroId,
                expenseStore.getExpensesByDinero(contextStore.getSelectedDineroId)
            )
            
            budgetProgress.forEach(progress => {
                if (progress.percentage >= 90 && progress.percentage < 100) {
                    sendNotification('⚠️ Presupuesto casi agotado', {
                        body: `Has gastado ${progress.percentage.toFixed(0)}% de tu presupuesto en ${progress.category}`,
                        tag: `budget-warning-${progress.category}`,
                        actions: [
                            {
                                action: 'view-category',
                                title: 'Ver categoría'
                            }
                        ]
                    })
                } else if (progress.percentage >= 100) {
                    sendNotification('🚨 ¡Presupuesto excedido!', {
                        body: `Has superado tu presupuesto en ${progress.category} por €${(progress.spent - progress.budget).toFixed(2)}`,
                        tag: `budget-exceeded-${progress.category}`,
                        actions: [
                            {
                                action: 'adjust-budget',
                                title: 'Ajustar presupuesto'
                            }
                        ]
                    })
                }
            })
        }

        // Notificación de deudas pendientes
        const checkPendingDebts = () => {
            const userStore = useUserStore()
            const currentUser = userStore.getCurrentUser
            
            if (!currentUser) return
            
            // Aquí implementarías la lógica para calcular deudas pendientes
            // y enviar notificaciones apropiadas
        }

        // Manejar clics en notificaciones
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', event => {
                if (event.data.type === 'NOTIFICATION_CLICK') {
                    const action = event.data.action
                    
                    switch (action) {
                        case 'view-expenses':
                            $router.push('/')
                            break
                        case 'view-budgets':
                            $router.push('/?action=budgets')
                            break
                        case 'view-balances':
                            $router.push('/balances')
                            break
                        default:
                            $router.push('/')
                    }
                }
            })
        }

        // Inicializar programación
        scheduleDaily()
        scheduleWeekly()
        
        // Exponer funciones para usar desde stores
        window.checkBudgetAlerts = checkBudgetAlerts
        window.checkPendingDebts = checkPendingDebts
    }

    // Inicializar cuando la página esté cargada
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupSmartNotifications)
    } else {
        setupSmartNotifications()
    }
})
