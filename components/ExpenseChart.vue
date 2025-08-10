<template>
    <div class="chart-container">
        <!-- Selector de tipo de gráfico -->
        <div class="flex flex-wrap gap-2 mb-4">
            <button
                v-for="type in chartTypes"
                :key="type.value"
                @click="selectedChartType = type.value"
                :class="[
                    'px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                    selectedChartType === type.value 
                        ? 'bg-lima-compartida text-gris-billetera' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                ]"
            >
                {{ type.icon }} {{ type.label }}
            </button>
        </div>

        <!-- Gráfico -->
        <div class="bg-blanco-dividido rounded-xl p-4 shadow-md">
            <component 
                :is="currentChartComponent" 
                :data="chartData" 
                :options="chartOptions"
                :height="300"
            />
        </div>
    </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale,
    ArcElement,
    LineElement,
    PointElement
} from 'chart.js'
import { Bar, Pie, Line, Doughnut } from 'vue-chartjs'

// Registrar componentes de Chart.js
ChartJS.register(
    Title,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale,
    ArcElement,
    LineElement,
    PointElement
)

// Props
const props = defineProps({
    expenses: {
        type: Array,
        default: () => []
    },
    type: {
        type: String,
        default: 'category' // 'category', 'user', 'trend'
    }
})

// State
const selectedChartType = ref('bar')

// Chart types disponibles
const chartTypes = [
    { value: 'bar', label: 'Barras', icon: '📊' },
    { value: 'pie', label: 'Circular', icon: '🥧' },
    { value: 'doughnut', label: 'Donut', icon: '🍩' },
    { value: 'line', label: 'Línea', icon: '📈' }
]

// Componente actual del gráfico
const currentChartComponent = computed(() => {
    switch (selectedChartType.value) {
        case 'bar': return Bar
        case 'pie': return Pie
        case 'doughnut': return Doughnut
        case 'line': return Line
        default: return Bar
    }
})

// Colores predefinidos
const colors = [
    '#3A7CA5', // Azul Tiquet
    '#A8E000', // Lima Compartida
    '#A9D6E5', // Azul Claro Viaje
    '#3C3C3C', // Gris Billetera
    '#F6F5F2', // Marfil Mapamundi
    '#10B981', // Verde
    '#8B5CF6', // Morado
    '#F59E0B', // Amarillo
    '#EF4444', // Rojo
    '#6366F1'  // Índigo
]

// Preparar datos según el tipo
const preparedData = computed(() => {
    if (!props.expenses || props.expenses.length === 0) {
        return { labels: [], values: [] }
    }

    switch (props.type) {
        case 'category':
            return prepareCategoryData()
        case 'user':
            return prepareUserData()
        case 'trend':
            return prepareTrendData()
        default:
            return prepareCategoryData()
    }
})

const prepareCategoryData = () => {
    const categoryData = {}
    
    props.expenses.forEach(expense => {
        const category = expense.category || 'Sin categoría'
        categoryData[category] = (categoryData[category] || 0) + expense.amount
    })
    
    return {
        labels: Object.keys(categoryData),
        values: Object.values(categoryData)
    }
}

const prepareUserData = () => {
    const userData = {}
    
    props.expenses.forEach(expense => {
        const userId = expense.paidBy
        userData[userId] = (userData[userId] || 0) + expense.amount
    })
    
    return {
        labels: Object.keys(userData).map(userId => `Usuario ${userId}`),
        values: Object.values(userData)
    }
}

const prepareTrendData = () => {
    const monthData = {}
    
    props.expenses.forEach(expense => {
        const date = new Date(expense.createdAt)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        monthData[monthKey] = (monthData[monthKey] || 0) + expense.amount
    })
    
    // Ordenar por fecha
    const sortedEntries = Object.entries(monthData).sort(([a], [b]) => a.localeCompare(b))
    
    return {
        labels: sortedEntries.map(([key]) => {
            const [year, month] = key.split('-')
            return new Date(year, month - 1).toLocaleDateString('es-ES', { 
                year: 'numeric', 
                month: 'short' 
            })
        }),
        values: sortedEntries.map(([, value]) => value)
    }
}

// Configuración del gráfico
const chartData = computed(() => {
    const data = preparedData.value
    
    if (selectedChartType.value === 'line') {
        return {
            labels: data.labels,
            datasets: [{
                label: 'Gastos por mes',
                data: data.values,
                borderColor: colors[0],
                backgroundColor: colors[0] + '20',
                tension: 0.3,
                fill: true
            }]
        }
    }
    
    return {
        labels: data.labels,
        datasets: [{
            label: props.type === 'category' ? 'Gastos por categoría' : 
                   props.type === 'user' ? 'Gastos por usuario' : 'Tendencia de gastos',
            data: data.values,
            backgroundColor: colors.slice(0, data.labels.length),
            borderColor: colors.slice(0, data.labels.length),
            borderWidth: 1
        }]
    }
})

const chartOptions = computed(() => {
    const baseOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom'
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const value = context.parsed.y || context.parsed
                        return `${context.label}: €${value.toFixed(2)}`
                    }
                }
            }
        }
    }

    if (selectedChartType.value === 'pie' || selectedChartType.value === 'doughnut') {
        return {
            ...baseOptions,
            plugins: {
                ...baseOptions.plugins,
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed
                            const total = context.dataset.data.reduce((a, b) => a + b, 0)
                            const percentage = ((value / total) * 100).toFixed(1)
                            return `${context.label}: €${value.toFixed(2)} (${percentage}%)`
                        }
                    }
                }
            }
        }
    }

    if (selectedChartType.value === 'bar' || selectedChartType.value === 'line') {
        return {
            ...baseOptions,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '€' + value.toFixed(0)
                        }
                    }
                }
            }
        }
    }

    return baseOptions
})
</script>

<style scoped>
.chart-container {
    width: 100%;
}
</style>
