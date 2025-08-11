<template>
  <div class="analytics-dashboard bg-white rounded-lg shadow-lg p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-gray-800 flex items-center">
        📊 Analytics Dashboard
      </h2>
      <div class="flex space-x-2">
        <button
          @click="refreshData"
          class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          :disabled="isLoading"
        >
          {{ isLoading ? '🔄' : '🔄' }} Actualizar
        </button>
        <button
          @click="exportData"
          class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          📊 Exportar
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="text-center py-8">
      <div class="animate-spin text-4xl">⏳</div>
      <p class="mt-2 text-gray-600">Analizando tus gastos...</p>
    </div>

    <div v-else class="space-y-6">
      <!-- Resumen general -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
          <div class="text-sm opacity-80">Gastado este mes</div>
          <div class="text-2xl font-bold">€{{ analytics.totalSpent.toFixed(2) }}</div>
          <div class="text-xs mt-1">
            <span v-if="analytics.comparison.percentageChange > 0" class="text-red-200">
              ↗️ +{{ analytics.comparison.percentageChange.toFixed(1) }}%
            </span>
            <span v-else-if="analytics.comparison.percentageChange < 0" class="text-green-200">
              ↘️ {{ analytics.comparison.percentageChange.toFixed(1) }}%
            </span>
            <span v-else class="text-gray-200">📊 Sin cambios</span>
          </div>
        </div>

        <div class="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
          <div class="text-sm opacity-80">Promedio diario</div>
          <div class="text-2xl font-bold">€{{ analytics.averageDaily.toFixed(2) }}</div>
          <div class="text-xs mt-1">Últimos {{ new Date().getDate() }} días</div>
        </div>

        <div class="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg">
          <div class="text-sm opacity-80">Predicción mes</div>
          <div class="text-2xl font-bold">€{{ prediction.predictedTotal.toFixed(2) }}</div>
          <div class="text-xs mt-1">
            <span class="inline-block w-2 h-2 rounded-full mr-1"
                  :class="{
                    'bg-green-300': prediction.confidence === 'high',
                    'bg-yellow-300': prediction.confidence === 'medium',
                    'bg-red-300': prediction.confidence === 'low'
                  }"></span>
            Confianza {{ prediction.confidence === 'high' ? 'alta' : prediction.confidence === 'medium' ? 'media' : 'baja' }}
          </div>
        </div>

        <div class="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-lg">
          <div class="text-sm opacity-80">Gastos inusuales</div>
          <div class="text-2xl font-bold">{{ unusualExpenses.length }}</div>
          <div class="text-xs mt-1">Detectados este mes</div>
        </div>
      </div>

      <!-- Insights -->
      <div v-if="analytics.insights.length > 0" class="bg-gray-50 rounded-lg p-4">
        <h3 class="text-lg font-semibold mb-3 flex items-center">
          💡 Insights inteligentes
        </h3>
        <div class="space-y-2">
          <div v-for="insight in analytics.insights" :key="insight.title"
               class="flex items-start space-x-3 p-3 rounded-lg"
               :class="{
                 'bg-red-100 text-red-800': insight.type === 'warning',
                 'bg-green-100 text-green-800': insight.type === 'positive',
                 'bg-blue-100 text-blue-800': insight.type === 'info',
                 'bg-yellow-100 text-yellow-800': insight.type === 'tip'
               }">
            <div class="text-lg">
              {{ insight.type === 'warning' ? '⚠️' : 
                 insight.type === 'positive' ? '✅' : 
                 insight.type === 'info' ? 'ℹ️' : '💡' }}
            </div>
            <div>
              <div class="font-medium">{{ insight.title }}</div>
              <div class="text-sm opacity-80">{{ insight.message }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Gráficos -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Top Categorías -->
        <div class="bg-white border rounded-lg p-4">
          <h3 class="text-lg font-semibold mb-4">📈 Top Categorías</h3>
          <ExpenseChart
            v-if="analytics.topCategories.length > 0"
            :data="categoryChartData"
            :options="chartOptions.pie"
            type="doughnut"
            class="max-h-64"
          />
          <div v-else class="text-center py-8 text-gray-500">
            No hay datos de categorías
          </div>
        </div>

        <!-- Patrones semanales -->
        <div class="bg-white border rounded-lg p-4">
          <h3 class="text-lg font-semibold mb-4">📅 Patrones Semanales</h3>
          <ExpenseChart
            v-if="weeklyPatterns.weeklyData.length > 0"
            :data="weeklyChartData"
            :options="chartOptions.bar"
            type="bar"
            class="max-h-64"
          />
          <div v-else class="text-center py-8 text-gray-500">
            Cargando patrones semanales...
          </div>
        </div>
      </div>

      <!-- Recomendaciones -->
      <div v-if="recommendations.length > 0" class="bg-white border rounded-lg p-4">
        <h3 class="text-lg font-semibold mb-4 flex items-center">
          🎯 Recomendaciones de Ahorro
        </h3>
        <div class="space-y-3">
          <div v-for="recommendation in recommendations" :key="recommendation.title"
               class="border-l-4 pl-4 py-2"
               :class="{
                 'border-red-500 bg-red-50': recommendation.priority === 'high',
                 'border-yellow-500 bg-yellow-50': recommendation.priority === 'medium',
                 'border-green-500 bg-green-50': recommendation.priority === 'low'
               }">
            <div class="flex items-center justify-between">
              <div>
                <div class="font-medium">{{ recommendation.title }}</div>
                <div class="text-sm text-gray-600 mt-1">{{ recommendation.description }}</div>
              </div>
              <div v-if="recommendation.potentialSaving" class="text-right">
                <div class="text-lg font-bold text-green-600">
                  €{{ recommendation.potentialSaving.toFixed(2) }}
                </div>
                <div class="text-xs text-gray-500">ahorro potencial</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Gastos inusuales -->
      <div v-if="unusualExpenses.length > 0" class="bg-white border rounded-lg p-4">
        <h3 class="text-lg font-semibold mb-4 flex items-center">
          🚨 Gastos Inusuales Detectados
        </h3>
        <div class="space-y-2">
          <div v-for="expense in unusualExpenses.slice(0, 5)" :key="expense.id"
               class="flex items-center justify-between p-3 rounded-lg"
               :class="{
                 'bg-red-100': expense.severity === 'high',
                 'bg-yellow-100': expense.severity === 'medium'
               }">
            <div>
              <div class="font-medium">{{ expense.concepto }}</div>
              <div class="text-sm text-gray-600">
                {{ formatDate(expense.fecha) }} • {{ expense.categoria || 'Sin categoría' }}
              </div>
            </div>
            <div class="text-right">
              <div class="text-lg font-bold">€{{ expense.cantidad.toFixed(2) }}</div>
              <div class="text-xs text-gray-500">
                +{{ expense.percentageAboveNormal.toFixed(0) }}% sobre normal
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import ExpenseChart from './ExpenseChart.vue'

const props = defineProps({
  expenses: {
    type: Array,
    default: () => []
  },
  budgets: {
    type: Array,
    default: () => []
  }
})

const { 
  analyzeSpendingPatterns, 
  predictMonthlySpending, 
  analyzeWeeklyPatterns,
  detectUnusualExpenses,
  generateSavingRecommendations 
} = useExpenseAnalytics()

const isLoading = ref(false)
const analytics = ref({})
const prediction = ref({})
const weeklyPatterns = ref({})
const unusualExpenses = ref([])
const recommendations = ref([])

// Datos para gráficos
const categoryChartData = computed(() => {
  if (!analytics.value.topCategories) return null
  
  return {
    labels: analytics.value.topCategories.map(cat => cat.category),
    datasets: [{
      data: analytics.value.topCategories.map(cat => cat.amount),
      backgroundColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
        '#9966FF'
      ],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  }
})

const weeklyChartData = computed(() => {
  if (!weeklyPatterns.value.weeklyData) return null
  
  return {
    labels: weeklyPatterns.value.weeklyData.map(day => day.day.slice(0, 3)),
    datasets: [{
      label: 'Gasto promedio',
      data: weeklyPatterns.value.weeklyData.map(day => day.average),
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 2
    }]
  }
})

const chartOptions = {
  pie: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  },
  bar: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '€' + value.toFixed(0)
          }
        }
      }
    },
    plugins: {
      legend: {
        display: false
      }
    }
  }
}

// Métodos
const refreshData = async () => {
  if (isLoading.value || !props.expenses?.length) return
  
  isLoading.value = true
  
  try {
    // Eliminar la simulación de carga para evitar delays innecesarios
    analytics.value = analyzeSpendingPatterns(props.expenses)
    prediction.value = predictMonthlySpending(props.expenses)
    weeklyPatterns.value = analyzeWeeklyPatterns(props.expenses)
    unusualExpenses.value = detectUnusualExpenses(props.expenses)
    recommendations.value = generateSavingRecommendations(props.expenses, props.budgets)
  } catch (error) {
    console.error('Error refreshing analytics data:', error)
  } finally {
    isLoading.value = false
  }
}

const exportData = () => {
  const exportData = {
    analytics: analytics.value,
    prediction: prediction.value,
    weeklyPatterns: weeklyPatterns.value,
    unusualExpenses: unusualExpenses.value,
    recommendations: recommendations.value,
    exportDate: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `expense-analytics-${new Date().toISOString().split('T')[0]}.json`
  link.click()
  URL.revokeObjectURL(url)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short'
  })
}

// Watchers
watch(() => props.expenses, (newExpenses, oldExpenses) => {
  // Solo refrescar si realmente cambió el contenido
  if (JSON.stringify(newExpenses) !== JSON.stringify(oldExpenses)) {
    refreshData()
  }
}, { immediate: false, deep: false })

// Lifecycle
onMounted(() => {
  refreshData()
})
</script>

<style scoped>
.analytics-dashboard {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.animate-spin {
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
