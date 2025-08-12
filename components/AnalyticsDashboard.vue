<template>
  <div class="analytics-dashboard">
    <!-- Header con estilo consistente -->
    <div class="flex items-center justify-between mb-6 bg-gradient-to-r from-azul-tiquet to-azul-claro-viaje text-blanco-dividido p-6 rounded-2xl shadow-lg">
      <div>
        <h2 class="text-2xl font-bold flex items-center gap-3">
          🧠 Smart Analytics
        </h2>
        <p class="text-azul-claro-viaje/80 mt-1 text-sm">Insights inteligentes y análisis predictivo</p>
      </div>
      <div class="flex space-x-3">
        <button
          @click="refreshData"
          class="px-4 py-2 bg-blanco-dividido/20 backdrop-blur-sm text-blanco-dividido rounded-xl hover:bg-blanco-dividido/30 transition-colors border border-blanco-dividido/20 text-sm font-semibold"
          :disabled="isLoading"
        >
          {{ isLoading ? '🔄' : '🔄' }} Actualizar
        </button>
        <button
          @click="exportData"
          class="px-4 py-2 bg-lima-compartida/20 backdrop-blur-sm text-blanco-dividido rounded-xl hover:bg-lima-compartida/30 transition-colors border border-lima-compartida/30 text-sm font-semibold"
        >
          📊 Exportar
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="text-center py-12">
      <div class="w-16 h-16 border-4 border-azul-tiquet border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p class="text-gris-billetera font-medium">Analizando patrones inteligentes...</p>
    </div>

    <div v-else class="space-y-8">
      <!-- Métricas inteligentes -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div class="bg-gradient-to-br from-azul-tiquet to-azul-claro-viaje text-blanco-dividido p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-azul-tiquet/20">
          <div class="flex items-center justify-between mb-4">
            <div class="text-sm opacity-90 font-medium">Proyección mensual</div>
            <div class="text-2xl">🔮</div>
          </div>
          <div class="text-2xl font-bold mb-2">€{{ (prediction?.predictedTotal || 0).toFixed(2) }}</div>
          <div class="text-sm flex items-center">
            <span class="inline-block w-3 h-3 rounded-full mr-2"
                  :class="{
                    'bg-lima-compartida': (prediction?.confidence || 'low') === 'high',
                    'bg-yellow-500': (prediction?.confidence || 'low') === 'medium',
                    'bg-red-500': (prediction?.confidence || 'low') === 'low'
                  }"></span>
            <span class="font-medium">Confianza {{ (prediction?.confidence || 'low') === 'high' ? 'alta' : (prediction?.confidence || 'low') === 'medium' ? 'media' : 'baja' }}</span>
          </div>
        </div>

        <div class="bg-gradient-to-br from-lima-compartida to-green-500 text-gris-billetera p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-lima-compartida/30">
          <div class="flex items-center justify-between mb-4">
            <div class="text-sm opacity-80 font-medium">Ritmo de gasto</div>
            <div class="text-2xl">⚡</div>
          </div>
          <div class="text-2xl font-bold mb-2">€{{ (analytics?.averageDaily || 0).toFixed(2) }}</div>
          <div class="text-sm font-medium opacity-80">
            {{ analytics?.averageDaily > 30 ? '📈 Elevado' : '✅ Controlado' }}
          </div>
        </div>

        <div class="bg-gradient-to-br from-marfil-mapamundi to-azul-claro-viaje/30 text-gris-billetera p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-azul-claro-viaje/30">
          <div class="flex items-center justify-between mb-4">
            <div class="text-sm opacity-80 font-medium">Cambio vs mes anterior</div>
            <div class="text-2xl">📊</div>
          </div>
          <div class="text-2xl font-bold mb-2" :class="{
            'text-red-600': (analytics?.comparison?.percentageChange || 0) > 0,
            'text-lima-compartida': (analytics?.comparison?.percentageChange || 0) < 0,
            'text-azul-tiquet': (analytics?.comparison?.percentageChange || 0) === 0
          }">
            {{ (analytics?.comparison?.percentageChange || 0) > 0 ? '+' : '' }}{{ (analytics?.comparison?.percentageChange || 0).toFixed(1) }}%
          </div>
          <div class="text-sm font-medium opacity-80">
            {{ (analytics?.comparison?.percentageChange || 0) > 0 ? 'Aumento' : (analytics?.comparison?.percentageChange || 0) < 0 ? 'Reducción' : 'Sin cambios' }}
          </div>
        </div>

        <div class="bg-gradient-to-br from-red-100 to-orange-100 text-gris-billetera p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-red-200">
          <div class="flex items-center justify-between mb-4">
            <div class="text-sm opacity-80 font-medium">Anomalías detectadas</div>
            <div class="text-2xl">🚨</div>
          </div>
          <div class="text-2xl font-bold mb-2 text-red-600">{{ (unusualExpenses || []).length }}</div>
          <div class="text-sm font-medium opacity-80">Gastos inusuales</div>
        </div>
      </div>

      <!-- Insights inteligentes -->
      <div v-if="(insights || []).length > 0" class="bg-gradient-to-br from-marfil-mapamundi to-azul-claro-viaje/20 border-2 border-azul-claro-viaje/30 rounded-2xl p-6 shadow-lg">
        <div class="flex items-center mb-6">
          <div class="w-10 h-10 bg-azul-tiquet/10 rounded-xl flex items-center justify-center mr-3">
            <span class="text-xl">🧠</span>
          </div>
          <div>
            <h3 class="text-xl font-bold text-gris-billetera">Insights Inteligentes</h3>
            <p class="text-sm text-gray-600">Análisis automático de tus patrones</p>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="(insight, index) in (insights || [])" :key="index"
               class="flex items-start space-x-4 p-4 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md bg-blanco-dividido border"
               :class="{
                 'border-red-200 text-red-800': insight.type === 'warning',
                 'border-lima-compartida/30 text-gris-billetera': insight.type === 'positive',
                 'border-azul-claro-viaje/30 text-azul-tiquet': insight.type === 'info',
                 'border-yellow-300 text-yellow-800': insight.type === 'tip'
               }">
            <div class="text-lg">
              {{ insight.type === 'warning' ? '⚠️' : 
                 insight.type === 'positive' ? '✅' : 
                 insight.type === 'info' ? 'ℹ️' : '💡' }}
            </div>
            <div class="flex-1">
              <div class="font-semibold text-base mb-1">{{ insight.title }}</div>
              <div class="text-sm leading-relaxed opacity-80">{{ insight.message }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Panel de Tendencias -->
      <div class="grid grid-cols-1 gap-6">
        <!-- Panel de Tendencias -->
        <div class="bg-blanco-dividido border border-azul-claro-viaje/20 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200">
          <div class="flex items-center mb-6">
            <div class="w-10 h-10 bg-azul-tiquet/10 rounded-xl flex items-center justify-center mr-3">
              <span class="text-xl">📈</span>
            </div>
            <div>
              <h3 class="text-xl font-bold text-gris-billetera">Análisis de Tendencias</h3>
              <p class="text-sm text-gray-600">Proyecciones basadas en tu comportamiento</p>
            </div>
          </div>
          <div class="space-y-4">
            <div class="p-4 bg-gradient-to-r from-azul-tiquet/5 to-azul-claro-viaje/5 rounded-xl border border-azul-claro-viaje/20">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-gris-billetera">Proyección fin de mes</span>
                <span class="text-lg font-bold text-azul-tiquet">€{{ (prediction?.predictedTotal || 0).toFixed(2) }}</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-gradient-to-r from-azul-tiquet to-azul-claro-viaje h-2 rounded-full transition-all duration-500"
                     :style="{ width: `${Math.min((analytics?.totalSpent || 0) / (prediction?.predictedTotal || 1) * 100, 100)}%` }"></div>
              </div>
              <div class="text-xs text-gray-600 mt-1">
                Vas por el {{ Math.round((analytics?.totalSpent || 0) / (prediction?.predictedTotal || 1) * 100) }}% de la proyección
              </div>
            </div>
            
            <div class="p-4 bg-gradient-to-r from-lima-compartida/10 to-lima-compartida/5 rounded-xl border border-lima-compartida/30">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-gris-billetera">Ritmo de gasto diario</span>
                <span class="text-lg font-bold" :class="analytics?.averageDaily > 30 ? 'text-red-600' : 'text-lima-compartida'">
                  €{{ (analytics?.averageDaily || 0).toFixed(2) }}
                </span>
              </div>
              <div class="text-xs text-gray-600">
                {{ analytics?.averageDaily > 30 ? '⚠️ Ritmo elevado - considera reducir gastos' : '✅ Ritmo controlado - buen trabajo' }}
              </div>
            </div>

            <div class="p-4 bg-gradient-to-r from-purple-100 to-purple-50 rounded-xl border border-purple-200">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-gris-billetera">Predicción próximos 7 días</span>
                <span class="text-lg font-bold text-purple-600">
                  €{{ ((analytics?.averageDaily || 0) * 7).toFixed(2) }}
                </span>
              </div>
              <div class="text-xs text-gray-600">
                Basado en tu ritmo actual de gasto
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recomendaciones inteligentes -->
      <div v-if="(recommendations || []).length > 0" class="bg-gradient-to-br from-lima-compartida/10 to-lima-compartida/5 border border-lima-compartida/30 rounded-2xl p-6 shadow-lg">
        <div class="flex items-center mb-6">
          <div class="w-10 h-10 bg-lima-compartida/20 rounded-xl flex items-center justify-center mr-3">
            <span class="text-xl">🎯</span>
          </div>
          <div>
            <h3 class="text-xl font-bold text-gris-billetera">Recomendaciones Inteligentes</h3>
            <p class="text-sm text-gray-600">Sugerencias personalizadas para optimizar tus gastos</p>
          </div>
        </div>
        <div class="space-y-4">
          <div v-for="(recommendation, index) in (recommendations || [])" :key="index"
               class="flex items-center justify-between p-4 rounded-xl bg-blanco-dividido shadow-sm border-l-4 transition-all duration-200 hover:shadow-md"
               :class="{
                 'border-red-500': recommendation.priority === 'high',
                 'border-yellow-500': recommendation.priority === 'medium',
                 'border-lima-compartida': recommendation.priority === 'low'
               }">
            <div class="flex-1">
              <div class="flex items-center mb-2">
                <div class="font-semibold text-gris-billetera">{{ recommendation.title }}</div>
                <span class="ml-3 px-2 py-1 text-xs font-semibold rounded-full"
                      :class="{
                        'bg-red-100 text-red-700': recommendation.priority === 'high',
                        'bg-yellow-100 text-yellow-700': recommendation.priority === 'medium',
                        'bg-lima-compartida/20 text-gris-billetera': recommendation.priority === 'low'
                      }">
                  {{ recommendation.priority === 'high' ? 'Alta' : recommendation.priority === 'medium' ? 'Media' : 'Baja' }}
                </span>
              </div>
              <div class="text-gray-600 text-sm leading-relaxed">{{ recommendation.description }}</div>
            </div>
            <div v-if="recommendation.potentialSaving" class="text-right ml-4 flex-shrink-0">
              <div class="text-lg font-bold text-lima-compartida">
                €{{ recommendation.potentialSaving.toFixed(2) }}
              </div>
              <div class="text-xs text-gray-500 font-medium">ahorro potencial</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Detección de Anomalías -->
      <div v-if="(unusualExpenses || []).length > 0" class="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-2xl p-6 shadow-lg">
        <div class="flex items-center mb-6">
          <div class="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mr-3">
            <span class="text-xl">🚨</span>
          </div>
          <div>
            <h3 class="text-xl font-bold text-gris-billetera">Anomalías Detectadas</h3>
            <p class="text-sm text-gray-600">Gastos que se salen de tu patrón habitual</p>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="expense in (unusualExpenses || []).slice(0, 6)" :key="expense.id"
               class="flex items-center justify-between p-4 rounded-xl bg-blanco-dividido border-l-4 shadow-sm transition-all duration-200 hover:shadow-md"
               :class="{
                 'border-red-500': expense.severity === 'high',
                 'border-yellow-500': expense.severity === 'medium'
               }">
            <div class="flex-1">
              <div class="flex items-center mb-2">
                <div class="font-semibold text-gris-billetera text-sm">{{ expense.title || expense.description }}</div>
                <span class="ml-2 px-2 py-1 text-xs font-semibold rounded-full"
                      :class="{
                        'bg-red-100 text-red-700': expense.severity === 'high',
                        'bg-yellow-100 text-yellow-700': expense.severity === 'medium'
                      }">
                  {{ expense.severity === 'high' ? 'Alto' : 'Medio' }}
                </span>
              </div>
              <div class="text-xs text-gray-600">{{ expense.category }}</div>
              <div class="text-xs text-gray-500 mt-1">{{ formatDate(expense.date) }}</div>
            </div>
            <div class="text-right ml-4 flex-shrink-0">
              <div class="text-lg font-bold text-red-600">€{{ expense.amount.toFixed(2) }}</div>
              <div class="text-xs text-gray-500">
                {{ expense.deviation }}% sobre promedio
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

const isLoading = ref(false)
const analytics = ref({
  totalSpent: 0,
  averageDaily: 0,
  comparison: { percentageChange: 0 },
  topCategories: []
})
const prediction = ref({
  predictedTotal: 0,
  confidence: 'low'
})
const unusualExpenses = ref([])
const recommendations = ref([])
const insights = ref([])

// Funciones de análisis mejoradas para insights únicos
const analyzeSpendingPatterns = (expenses) => {
  if (!expenses || expenses.length === 0) {
    return {
      totalSpent: 0,
      averageDaily: 0,
      comparison: { percentageChange: 0 },
      topCategories: []
    }
  }

  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  
  // Filtrar gastos del mes actual
  const currentMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date)
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear
  })

  const totalSpent = currentMonthExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0)
  const currentDay = now.getDate()
  const averageDaily = totalSpent / currentDay

  // Análisis por categorías
  const categoryTotals = {}
  currentMonthExpenses.forEach(expense => {
    const category = expense.category || 'Sin categoría'
    categoryTotals[category] = (categoryTotals[category] || 0) + expense.amount
  })

  const topCategories = Object.entries(categoryTotals)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)

  // Comparación con mes anterior
  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1
  const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear
  
  const previousMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date)
    return expenseDate.getMonth() === previousMonth && expenseDate.getFullYear() === previousYear
  })

  const previousMonthTotal = previousMonthExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0)
  const percentageChange = previousMonthTotal > 0 ? ((totalSpent - previousMonthTotal) / previousMonthTotal) * 100 : 0

  return {
    totalSpent,
    averageDaily,
    comparison: { percentageChange },
    topCategories
  }
}

const predictMonthlySpending = (expenses) => {
  if (!expenses || expenses.length === 0) {
    return { predictedTotal: 0, confidence: 'low' }
  }

  const analytics = analyzeSpendingPatterns(expenses)
  const now = new Date()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const predictedTotal = analytics.averageDaily * daysInMonth
  
  // Determinar confianza basada en cantidad de datos y variabilidad
  const currentMonthDays = now.getDate()
  let confidence = 'low'
  if (currentMonthDays >= 20) confidence = 'high'
  else if (currentMonthDays >= 10) confidence = 'medium'

  return { predictedTotal, confidence }
}

const detectUnusualExpenses = (expenses) => {
  if (!expenses || expenses.length === 0) return []

  // Calcular promedio y desviación estándar
  const amounts = expenses.map(e => e.amount || 0)
  const average = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length
  const variance = amounts.reduce((sum, amount) => sum + Math.pow(amount - average, 2), 0) / amounts.length
  const stdDev = Math.sqrt(variance)

  // Considerar inusuales los gastos que están 2 desviaciones estándar por encima del promedio
  const threshold = average + (2 * stdDev)

  return expenses
    .filter(expense => expense.amount > threshold)
    .map(expense => ({
      ...expense,
      severity: expense.amount > average + (3 * stdDev) ? 'high' : 'medium',
      deviation: Math.round(((expense.amount - average) / average) * 100)
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10)
}

const generateSavingRecommendations = (expenses, budgets) => {
  const recommendations = []
  
  if (!expenses || expenses.length === 0) return recommendations

  const analytics = analyzeSpendingPatterns(expenses)
  
  // Recomendación basada en tendencia
  if (analytics.comparison.percentageChange > 20) {
    recommendations.push({
      title: 'Controlar el aumento de gastos',
      description: `Tus gastos han aumentado un ${analytics.comparison.percentageChange.toFixed(1)}% respecto al mes anterior. Considera revisar tus hábitos.`,
      priority: 'high',
      potentialSaving: analytics.totalSpent * 0.15
    })
  }

  // Recomendación sobre ritmo de gasto
  if (analytics.averageDaily > 50) {
    recommendations.push({
      title: 'Reducir ritmo de gasto diario',
      description: `Tu gasto diario promedio es €${analytics.averageDaily.toFixed(2)}. Establece un límite diario más bajo.`,
      priority: 'medium',
      potentialSaving: (analytics.averageDaily - 40) * 30
    })
  }

  // Recomendación sobre gastos pequeños frecuentes
  const smallExpenses = expenses.filter(e => e.amount < 20)
  if (smallExpenses.length > 15) {
    const totalSmall = smallExpenses.reduce((sum, e) => sum + e.amount, 0)
    recommendations.push({
      title: 'Optimizar gastos pequeños',
      description: `Tienes ${smallExpenses.length} gastos menores de €20. Agrupar compras puede generar ahorros.`,
      priority: 'low',
      potentialSaving: totalSmall * 0.2
    })
  }

  return recommendations
}

const generateInsights = (expenses) => {
  const insights = []
  
  if (!expenses || expenses.length === 0) {
    insights.push({
      type: 'info',
      title: 'Comienza tu análisis',
      message: 'Registra algunos gastos para obtener insights inteligentes sobre tus patrones de consumo.'
    })
    return insights
  }

  const analytics = analyzeSpendingPatterns(expenses)
  
  // Insight sobre proyección
  if (analytics.averageDaily > 0) {
    const daysRemaining = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate()
    const projectedRemaining = analytics.averageDaily * daysRemaining
    
    if (projectedRemaining > analytics.totalSpent * 0.5) {
      insights.push({
        type: 'warning',
        title: 'Proyección elevada',
        message: `Al ritmo actual, podrías gastar €${projectedRemaining.toFixed(2)} más este mes.`
      })
    }
  }

  // Insight sobre comparación mensual
  if (Math.abs(analytics.comparison.percentageChange) > 30) {
    insights.push({
      type: analytics.comparison.percentageChange > 0 ? 'warning' : 'positive',
      title: `${analytics.comparison.percentageChange > 0 ? 'Incremento' : 'Reducción'} significativa`,
      message: `Tus gastos han ${analytics.comparison.percentageChange > 0 ? 'aumentado' : 'disminuido'} un ${Math.abs(analytics.comparison.percentageChange).toFixed(1)}% respecto al mes anterior.`
    })
  }

  return insights
}

// Métodos

// Funciones auxiliares para el template
const getBiggestSpendingDay = () => {
  if (!weeklyPatterns.value?.weeklyData || weeklyPatterns.value.weeklyData.length === 0) return 'N/A'
  const maxDay = weeklyPatterns.value.weeklyData.reduce((max, day) => day.average > max.average ? day : max)
  return maxDay.day
}

const getBiggestSpendingDayAmount = () => {
  if (!weeklyPatterns.value?.weeklyData || weeklyPatterns.value.weeklyData.length === 0) return 0
  const maxDay = weeklyPatterns.value.weeklyData.reduce((max, day) => day.average > max.average ? day : max)
  return maxDay.average
}

// Función para crear/actualizar el gráfico semanal
const createWeeklyChart = async () => {
  await nextTick()
  
  if (!weeklyChart.value || !weeklyPatterns.value?.weeklyData?.length) return
  
  // Destruir gráfico existente
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
  
  const ctx = weeklyChart.value.getContext('2d')
  
  chartInstance = new ChartJS(ctx, {
    type: 'bar',
    data: {
      labels: weeklyPatterns.value.weeklyData.map(day => day.day.slice(0, 3)),
      datasets: [{
        label: 'Gasto promedio (€)',
        data: weeklyPatterns.value.weeklyData.map(day => day.average),
        backgroundColor: 'rgba(58, 124, 165, 0.3)',
        borderColor: '#3A7CA5',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          top: 10,
          bottom: 10,
          left: 10,
          right: 10
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(169, 214, 229, 0.3)',
            lineWidth: 1
          },
          ticks: {
            color: '#3C3C3C',
            font: {
              size: 11,
              weight: '500'
            },
            callback: function(value) {
              return '€' + value.toFixed(0)
            }
          }
        },
        x: {
          grid: {
            color: 'rgba(246, 245, 242, 0.5)'
          },
          ticks: {
            color: '#3C3C3C',
            font: {
              size: 11,
              weight: '500'
            }
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: '#3C3C3C',
          titleColor: '#FFFFFF',
          bodyColor: '#FFFFFF',
          cornerRadius: 8,
          padding: 12,
          callbacks: {
            label: function(context) {
              return `€${context.parsed.y.toFixed(2)}`
            }
          }
        }
      },
      animation: {
        duration: 800,
        easing: 'easeInOutQuart'
      }
    }
  })
  
  console.log('createWeeklyChart')
}

// Datos para gráficos
const weeklyChartData = computed(() => {
  if (!weeklyPatterns.value?.weeklyData || weeklyPatterns.value.weeklyData.length === 0) return null
  
  return {
    labels: weeklyPatterns.value.weeklyData.map(day => day.day.slice(0, 3)),
    datasets: [{
      label: 'Gasto promedio',
      data: weeklyPatterns.value.weeklyData.map(day => day.average),
      backgroundColor: 'rgba(58, 124, 165, 0.3)',
      borderColor: '#3A7CA5',
      borderWidth: 2
    }]
  }
})

const chartOptions = {
  bar: {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#A9D6E5',
          lineWidth: 1
        },
        ticks: {
          color: '#3C3C3C',
          font: {
            size: 11
          },
          callback: function(value) {
            return '€' + value.toFixed(0)
          }
        }
      },
      x: {
        grid: {
          color: '#F6F5F2'
        },
        ticks: {
          color: '#3C3C3C',
          font: {
            size: 11
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
  if (isLoading.value) return
  
  isLoading.value = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    analytics.value = analyzeSpendingPatterns(props.expenses)
    prediction.value = predictMonthlySpending(props.expenses)
    unusualExpenses.value = detectUnusualExpenses(props.expenses)
    recommendations.value = generateSavingRecommendations(props.expenses, props.budgets)
    insights.value = generateInsights(props.expenses)
    
    console.log('refreshData')
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
    unusualExpenses: unusualExpenses.value,
    recommendations: recommendations.value,
    insights: insights.value,
    exportDate: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `smart-analytics-${new Date().toISOString().split('T')[0]}.json`
  link.click()
  URL.revokeObjectURL(url)
  
  console.log('exportData')
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short'
  })
}

// Watchers
watch(() => props.expenses, (newExpenses, oldExpenses) => {
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

.chart-container {
  overflow: hidden;
  border-radius: 8px;
}

.chart-container canvas {
  max-width: 100% !important;
  max-height: 100% !important;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>