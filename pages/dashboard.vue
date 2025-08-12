<template>
    <div class="min-h-screen bg-marfil-mapamundi p-3 sm:p-4 lg:p-6">
        <!-- Loading state -->
        <div v-if="isLoading" class="flex items-center justify-center py-20">
            <div class="text-center">
                <div class="w-12 h-12 border-4 border-azul-tiquet border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p class="text-gris-billetera">Cargando datos...</p>
            </div>
        </div>

        <!-- Mensaje cuando no hay usuario seleccionado -->
        <div v-else-if="!currentUser" class="flex items-center justify-center py-20">
            <div class="text-center bg-blanco-dividido rounded-2xl p-8 shadow-lg">
                <h2 class="text-xl font-semibold text-gris-billetera mb-2">¡Hola!</h2>
                <p class="text-gray-600">Selecciona tu usuario para ver tu dashboard</p>
            </div>
        </div>

        <!-- Dashboard completo -->
        <div v-else class="max-w-7xl mx-auto">
            <!-- Header del dashboard -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div>
                    <h1 class="text-2xl sm:text-3xl font-bold text-gris-billetera mb-2">
                        Dashboard Completo
                        <span class="text-azul-tiquet">{{ currentUser.name }}</span>
                    </h1>
                    <p class="text-gray-600">
                        Vista completa con todas las funcionalidades y análisis detallados
                    </p>
                </div>
                
                <div class="flex items-center gap-3">
                    <!-- Selector de período -->
                    <div class="flex bg-blanco-dividido rounded-xl border border-azul-claro-viaje/20 overflow-hidden shadow-sm">
                        <button 
                            v-for="period in [
                                { value: 'week', label: '7d' },
                                { value: 'month', label: '30d' },
                                { value: 'year', label: '1a' },
                                { value: 'all', label: 'Todo' }
                            ]" 
                            :key="period.value"
                            @click="selectedPeriod = period.value"
                            :class="[
                                'px-3 py-2 text-sm font-medium transition-colors',
                                selectedPeriod === period.value 
                                    ? 'bg-azul-tiquet text-blanco-dividido' 
                                    : 'text-gris-billetera hover:bg-azul-claro-viaje/10'
                            ]"
                        >
                            {{ period.label }}
                        </button>
                    </div>
                    
                    <!-- Botón volver a inicio -->
                    <NuxtLink 
                        to="/"
                        class="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gris-billetera rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
                    >
                        <span class="text-lg">🏠</span>
                        <span class="hidden sm:inline">Vista Simple</span>
                    </NuxtLink>
                    
                    <!-- Configuración de paneles -->
                    <button 
                        @click="showPanelConfig = true"
                        class="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                        title="Configurar paneles"
                    >
                        <span class="text-lg">⚙️</span>
                    </button>
                </div>
            </div>

            <!-- Panel de control para exportación -->
            <div class="bg-blanco-dividido rounded-2xl shadow-lg p-6 mb-8 border border-azul-claro-viaje/20">
                <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div class="flex items-center gap-4">
                        <div class="bg-azul-claro-viaje/10 px-4 py-3 rounded-xl border border-azul-claro-viaje/30">
                            <p class="text-xs text-gris-billetera font-medium">Mostrando datos de</p>
                            <p class="text-sm font-bold text-azul-tiquet">{{ getPeriodLabel() }}</p>
                        </div>
                    </div>
                    
                    <div class="flex flex-wrap gap-3">
                        <button 
                            @click="showBudgetModal = true"
                            class="px-4 py-3 bg-gradient-to-r from-lima-compartida to-lima-compartida/80 text-gris-billetera text-sm font-semibold rounded-xl hover:from-lima-compartida/90 hover:to-lima-compartida/70 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        >
                            <span class="text-sm">📊</span>
                            Presupuestos
                        </button>
                        <button 
                            @click="exportToCSV"
                            :disabled="expenses.length === 0"
                            class="px-4 py-3 bg-gradient-to-r from-azul-tiquet to-azul-claro-viaje text-blanco-dividido text-sm font-semibold rounded-xl hover:from-azul-tiquet/90 hover:to-azul-claro-viaje/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none"
                        >
                            <span class="text-sm">📊</span>
                            Exportar CSV
                        </button>
                        <button 
                            @click="generateReport"
                            :disabled="expenses.length === 0"
                            class="px-4 py-3 bg-gradient-to-r from-azul-tiquet to-azul-claro-viaje text-blanco-dividido text-sm font-semibold rounded-xl hover:from-azul-tiquet/90 hover:to-azul-claro-viaje/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none"
                        >
                            <span class="text-sm">📄</span>
                            Reporte
                        </button>
                    </div>
                </div>
            </div>

            <!-- Contenedor dinámico para paneles reordenables -->
            <div class="flex flex-col gap-8" style="display: contents;">
                
                <!-- Panel de Smart Analytics -->
                <div v-if="isPanelVisible('analytics')" class="mb-8" :style="{ order: getPanelOrder('analytics') }">
                    <AnalyticsDashboard 
                        :expenses="expenses" 
                        :budgets="activeBudgets"
                    />
                </div>

                <!-- Panel de alertas -->
                <div v-if="hasAlerts && isPanelVisible('alerts')" class="mb-8" :style="{ order: getPanelOrder('alerts') }">
                    <div class="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border-l-4 border-yellow-400 shadow-lg">
                        <h3 class="text-lg font-bold text-gris-billetera mb-4 flex items-center gap-2">
                            <span class="text-xl">⚠️</span>
                            Alertas importantes
                            <span class="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full font-medium">{{ alertsData.length }}</span>
                        </h3>
                        <div class="space-y-3">
                            <div 
                                v-for="alert in alertsData" 
                                :key="alert.title"
                                :class="[
                                    'flex items-start justify-between p-4 rounded-xl border transition-all duration-200 hover:shadow-md',
                                    alert.type === 'error' ? 'bg-red-50 border-red-200' :
                                    alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                                    'bg-blue-50 border-blue-200'
                                ]"
                            >
                                <div class="flex items-start gap-3">
                                    <span class="text-lg">{{ alert.icon }}</span>
                                    <div>
                                        <h4 :class="[
                                            'font-semibold text-sm mb-1',
                                            alert.type === 'error' ? 'text-red-800' :
                                            alert.type === 'warning' ? 'text-yellow-800' :
                                            'text-blue-800'
                                        ]">{{ alert.title }}</h4>
                                        <p :class="[
                                            'text-sm',
                                            alert.type === 'error' ? 'text-red-700' :
                                            alert.type === 'warning' ? 'text-yellow-700' :
                                            'text-blue-700'
                                        ]">{{ alert.message }}</p>
                                    </div>
                                </div>
                                <button 
                                    v-if="alert.action"
                                    @click="handleAlertAction(alert)"
                                    :class="[
                                        'px-3 py-1 text-xs font-medium rounded-lg transition-colors',
                                        alert.type === 'error' ? 'bg-red-100 text-red-800 hover:bg-red-200' :
                                        alert.type === 'warning' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' :
                                        'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                    ]"
                                >
                                    {{ alert.action }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Resumen de balances -->
                <div v-if="isPanelVisible('summary')" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8" :style="{ order: getPanelOrder('summary') }">
                    <!-- Aquí incluirías el resumen de balances como en el dashboard original -->
                </div>

                <!-- Presupuestos detallados -->
                <div v-if="isPanelVisible('budgets')" class="bg-blanco-dividido rounded-2xl shadow-lg p-6 mb-8 border border-azul-claro-viaje/20" :style="{ order: getPanelOrder('budgets') }">
                    <!-- Aquí incluirías los presupuestos como en el dashboard original -->
                </div>

                <!-- Estadísticas por categoría -->
                <div v-if="isPanelVisible('categories')" class="bg-blanco-dividido rounded-2xl shadow-lg p-6 mb-8 border border-azul-claro-viaje/20" data-category-section :style="{ order: getPanelOrder('categories') }">
                    <!-- Aquí incluirías las estadísticas como en el dashboard original -->
                </div>

                <!-- Lista de gastos recientes -->
                <div v-if="isPanelVisible('recent')" class="bg-blanco-dividido rounded-2xl shadow-lg p-6 mb-8 border border-azul-claro-viaje/20" :style="{ order: getPanelOrder('recent') }">
                    <!-- Aquí incluirías los gastos recientes como en el dashboard original -->
                </div>

                <!-- Pagos pendientes -->
                <div v-if="isPanelVisible('pending')" class="bg-blanco-dividido rounded-2xl shadow-lg p-6 mb-8 border border-red-200/50" :style="{ order: getPanelOrder('pending') }">
                    <!-- Aquí incluirías los pagos pendientes como en el dashboard original -->
                </div>

                <!-- Resumen de balances personales -->
                <div v-if="isPanelVisible('balance')" class="bg-blanco-dividido rounded-lg shadow-md p-4 sm:p-6" data-balance-section :style="{ order: getPanelOrder('balance') }">
                    <!-- Aquí incluirías el balance personal como en el dashboard original -->
                </div>
            </div>

            <!-- Modal de configuración de paneles -->
            <div v-if="showPanelConfig" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div class="bg-blanco-dividido rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
                    <div class="p-6">
                        <div class="flex items-center justify-between mb-6">
                            <div class="flex items-center gap-3">
                                <span class="text-2xl">⚙️</span>
                                <h2 class="text-xl font-bold text-gris-billetera">Configurar Dashboard</h2>
                            </div>
                            <button 
                                @click="showPanelConfig = false"
                                class="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <div class="mb-4">
                            <p class="text-sm text-gray-600 mb-3">Selecciona qué paneles mostrar:</p>
                            <div class="space-y-2">
                                <div 
                                    v-for="panel in dashboardPanels" 
                                    :key="panel.id"
                                    class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div class="flex items-center gap-3">
                                        <span class="text-lg">{{ panel.icon }}</span>
                                        <div>
                                            <p class="font-medium text-gris-billetera">{{ panel.name }}</p>
                                            <p class="text-xs text-gray-600">{{ panel.description }}</p>
                                        </div>
                                    </div>
                                    <label class="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            :checked="panel.visible"
                                            @change="togglePanelVisibility(panel.id)"
                                            class="sr-only peer"
                                        >
                                        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-azul-tiquet/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-azul-tiquet"></div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div class="flex gap-3 mt-6">
                            <button 
                                @click="resetPanelSettings"
                                class="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                            >
                                Restaurar
                            </button>
                            <button 
                                @click="savePanelSettings"
                                class="flex-1 px-4 py-3 bg-azul-tiquet text-blanco-dividido rounded-xl font-semibold hover:bg-azul-claro-viaje transition-colors"
                            >
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal para gasto -->
            <SplitExpenseModal 
                v-if="showSplitExpenseModal"
                :selected-dinero="selectedDinero"
                :users="users"
                @close="showSplitExpenseModal = false"
                @expense-created="onExpenseAdded"
            />

            <!-- Modal de presupuestos -->
            <BudgetModal 
                v-if="showBudgetModal"
                @close="showBudgetModal = false"
            />
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useExpenseStore } from '~/stores/expense.store'
import { useUserStore } from '~/stores/user.store'
import { useAlertStore } from '~/stores/alert.store'
import { useContextStore } from '~/stores/context.store'
import { useDineroStore } from '~/stores/dinero.store'
import { useBudgetStore } from '~/stores/budget.store'
import formatearTotal from '~/utils/formatMoney'
import { useLogger } from '~/composables/useLogger'
import AnalyticsDashboard from '~/components/AnalyticsDashboard.vue'

const { debug, log, error } = useLogger()

// Stores
const expenseStore = useExpenseStore()
const userStore = useUserStore()
const alertStore = useAlertStore()
const contextStore = useContextStore()
const dineroStore = useDineroStore()
const budgetStore = useBudgetStore()

// Reactive data
const showSplitExpenseModal = ref(false)
const showBudgetModal = ref(false)
const selectedPeriod = ref('month')
const showPanelConfig = ref(false)

// Panel configuration
const dashboardPanels = ref([
    { 
        id: 'analytics', 
        name: 'Smart Analytics', 
        icon: '🧠', 
        visible: true, 
        order: 1,
        description: 'Insights inteligentes y análisis predictivo'
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
        description: 'Total gastado y estadísticas del período'
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
        description: 'Análisis detallado por categorías'
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
        description: 'Gastos por saldar'
    },
    { 
        id: 'balance', 
        name: 'Mi situación financiera', 
        icon: '👥', 
        visible: true, 
        order: 8,
        description: 'Detalles de deudas'
    }
])

// Computed properties
const currentUser = computed(() => userStore.getCurrentUser)
const users = computed(() => userStore.getAllUsers)
const selectedDinero = computed(() => {
    const selectedDineroId = contextStore.getSelectedDineroId
    return selectedDineroId ? dineroStore.getDineroById(selectedDineroId) : null
})
const isLoading = computed(() => expenseStore.isLoading || userStore.isLoading || contextStore.isLoading || dineroStore.isLoading)

const isPanelVisible = (panelId) => {
    const panel = dashboardPanels.value.find(p => p.id === panelId)
    return panel ? panel.visible : false
}

const getPanelOrder = (panelId) => {
    const panel = dashboardPanels.value.find(p => p.id === panelId)
    return panel ? panel.order : 999
}

// Computed para gastos del período seleccionado
const expenses = computed(() => {
    const selectedDineroId = contextStore.getSelectedDineroId
    if (!selectedDineroId) return []
    
    const allExpenses = expenseStore.getExpensesByDinero(selectedDineroId) || []
    
    if (selectedPeriod.value === 'all') {
        return allExpenses.sort((a, b) => new Date(b.date) - new Date(a.date))
    }
    
    const now = new Date()
    return allExpenses.filter(expense => {
        const expenseDate = new Date(expense.date)
        
        switch (selectedPeriod.value) {
            case 'week':
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                return expenseDate >= weekAgo
            case 'month':
                const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
                return expenseDate >= monthAgo
            case 'year':
                const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
                return expenseDate >= yearAgo
            default:
                return true
        }
    }).sort((a, b) => new Date(b.date) - new Date(a.date))
})

// Computed para presupuestos activos
const activeBudgets = computed(() => {
    const selectedDineroId = contextStore.getSelectedDineroId
    if (!selectedDineroId) return []
    return budgetStore.getBudgetsByDinero(selectedDineroId)
})

// Computed para alertas (simplificado para el dashboard)
const alertsData = computed(() => {
    const alerts = []
    
    // Aquí puedes incluir la lógica de alertas del dashboard original
    // Por ahora incluyo algunas básicas
    
    if (expenses.value.length === 0 && selectedPeriod.value !== 'all') {
        alerts.push({
            type: 'info',
            icon: '📊',
            title: 'Sin actividad',
            message: `No hay gastos registrados en ${getPeriodLabel()}`,
            action: 'Añadir gasto'
        })
    }
    
    return alerts.slice(0, 3)
})

const hasAlerts = computed(() => alertsData.value.length > 0)

// Methods
const getPeriodLabel = () => {
    switch (selectedPeriod.value) {
        case 'week': return 'esta semana'
        case 'month': return 'este mes'
        case 'year': return 'este año'
        case 'all': return 'todo el tiempo'
        default: return 'el período seleccionado'
    }
}

const togglePanelVisibility = (panelId) => {
    const panel = dashboardPanels.value.find(p => p.id === panelId)
    if (panel) {
        panel.visible = !panel.visible
    }
}

const resetPanelSettings = () => {
    dashboardPanels.value.forEach(panel => {
        panel.visible = true
    })
}

const savePanelSettings = () => {
    if (process.client) {
        localStorage.setItem('dashboardPanelConfig', JSON.stringify(
            dashboardPanels.value.map(panel => ({
                id: panel.id,
                visible: panel.visible,
                order: panel.order
            }))
        ))
    }
    
    showPanelConfig.value = false
    alertStore.success('Configuración guardada correctamente')
}

const loadPanelSettings = () => {
    if (process.client) {
        const saved = localStorage.getItem('dashboardPanelConfig')
        if (saved) {
            try {
                const savedConfig = JSON.parse(saved)
                savedConfig.forEach(savedPanel => {
                    const panel = dashboardPanels.value.find(p => p.id === savedPanel.id)
                    if (panel) {
                        panel.visible = savedPanel.visible
                        panel.order = savedPanel.order
                    }
                })
            } catch (error) {
                console.warn('Error loading panel settings:', error)
            }
        }
    }
}

const handleAlertAction = (alert) => {
    switch (alert.action) {
        case 'Añadir gasto':
            showSplitExpenseModal.value = true
            break
        case 'Ver presupuestos':
            showBudgetModal.value = true
            break
        default:
            console.log('Alert action:', alert.action)
    }
}

const onExpenseAdded = async () => {
    showSplitExpenseModal.value = false
    alertStore.success('Gasto añadido correctamente')
    await expenseStore.fetchExpenses()
}

// Métodos de exportación (simplificados)
const exportToCSV = () => {
    alertStore.info('Función de exportación CSV disponible')
}

const generateReport = () => {
    alertStore.info('Función de generación de reportes disponible')
}

// Cargar datos al montar el componente
onMounted(async () => {
    console.log('Dashboard: Loading data...')
    
    loadPanelSettings()
    
    try {
        await dineroStore.initializeDineros()
        await contextStore.initializeSelectedDinero()
        
        if (userStore.users.length === 0) {
            await userStore.initializeUsers()
        }
        
        if (expenseStore.expenses.length === 0) {
            await expenseStore.initializeExpenses()
        }
        
        await budgetStore.initializeBudgets()
        
        console.log('Dashboard: Data loaded successfully')
    } catch (error) {
        console.error('Error al cargar datos:', error)
        alertStore.error('Error al cargar los datos')
    }
})

console.log('dashboard page loaded')
</script>
