/**
 * Composable para análisis inteligente de gastos y predicciones
 */
export const useExpenseAnalytics = () => {
    // Analizar patrones de gasto
    const analyzeSpendingPatterns = (expenses) => {
        console.log('analyzeSpendingPatterns')
        
        if (!expenses || expenses.length === 0) {
            return {
                totalSpent: 0,
                averageDaily: 0,
                topCategories: [],
                spendingTrend: 'stable',
                insights: []
            }
        }

        const now = new Date()
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        
        // Gastos del mes actual
        const thisMonthExpenses = expenses.filter(expense => 
            new Date(expense.fecha) >= thisMonth
        )
        
        // Gastos del mes pasado
        const lastMonthExpenses = expenses.filter(expense => {
            const expenseDate = new Date(expense.fecha)
            return expenseDate >= lastMonth && expenseDate < thisMonth
        })
        
        const totalThisMonth = thisMonthExpenses.reduce((sum, exp) => sum + exp.cantidad, 0)
        const totalLastMonth = lastMonthExpenses.reduce((sum, exp) => sum + exp.cantidad, 0)
        
        // Calcular tendencia
        let spendingTrend = 'stable'
        if (totalThisMonth > totalLastMonth * 1.1) {
            spendingTrend = 'increasing'
        } else if (totalThisMonth < totalLastMonth * 0.9) {
            spendingTrend = 'decreasing'
        }
        
        // Categorías principales
        const categoryTotals = {}
        thisMonthExpenses.forEach(expense => {
            const category = expense.categoria || 'Sin categoría'
            categoryTotals[category] = (categoryTotals[category] || 0) + expense.cantidad
        })
        
        const topCategories = Object.entries(categoryTotals)
            .map(([category, amount]) => ({ category, amount }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5)
        
        // Promedio diario
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
        const averageDaily = totalThisMonth / Math.min(now.getDate(), daysInMonth)
        
        // Generar insights
        const insights = generateInsights({
            totalThisMonth,
            totalLastMonth,
            spendingTrend,
            topCategories,
            averageDaily,
            expenses: thisMonthExpenses
        })
        
        return {
            totalSpent: totalThisMonth,
            averageDaily,
            topCategories,
            spendingTrend,
            insights,
            comparison: {
                thisMonth: totalThisMonth,
                lastMonth: totalLastMonth,
                difference: totalThisMonth - totalLastMonth,
                percentageChange: totalLastMonth ? ((totalThisMonth - totalLastMonth) / totalLastMonth) * 100 : 0
            }
        }
    }

    // Predecir gastos del resto del mes
    const predictMonthlySpending = (expenses) => {
        console.log('predictMonthlySpending')
        
        const now = new Date()
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
        const daysElapsed = now.getDate()
        const daysRemaining = daysInMonth - daysElapsed
        
        const thisMonthExpenses = expenses.filter(expense => 
            new Date(expense.fecha) >= thisMonth
        )
        
        const totalSpent = thisMonthExpenses.reduce((sum, exp) => sum + exp.cantidad, 0)
        const dailyAverage = totalSpent / daysElapsed
        
        const predictedTotal = totalSpent + (dailyAverage * daysRemaining)
        const predictedRemaining = dailyAverage * daysRemaining
        
        return {
            currentSpent: totalSpent,
            predictedTotal,
            predictedRemaining,
            dailyAverage,
            daysRemaining,
            confidence: calculatePredictionConfidence(thisMonthExpenses, daysElapsed)
        }
    }

    // Analizar patrones por día de la semana
    const analyzeWeeklyPatterns = (expenses) => {
        console.log('analyzeWeeklyPatterns')
        
        const weekDays = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
        const weeklyData = weekDays.map(day => ({ day, total: 0, count: 0 }))
        
        expenses.forEach(expense => {
            const dayOfWeek = new Date(expense.fecha).getDay()
            weeklyData[dayOfWeek].total += expense.cantidad
            weeklyData[dayOfWeek].count += 1
        })
        
        weeklyData.forEach(day => {
            day.average = day.count > 0 ? day.total / day.count : 0
        })
        
        const mostExpensiveDay = weeklyData.reduce((max, day) => 
            day.total > max.total ? day : max
        )
        
        const mostFrequentDay = weeklyData.reduce((max, day) => 
            day.count > max.count ? day : max
        )
        
        return {
            weeklyData,
            mostExpensiveDay: mostExpensiveDay.day,
            mostFrequentDay: mostFrequentDay.day,
            insights: generateWeeklyInsights(weeklyData)
        }
    }

    // Detectar gastos inusuales
    const detectUnusualExpenses = (expenses) => {
        console.log('detectUnusualExpenses')
        
        if (expenses.length < 10) return []
        
        const amounts = expenses.map(exp => exp.cantidad).sort((a, b) => a - b)
        const q1 = amounts[Math.floor(amounts.length * 0.25)]
        const q3 = amounts[Math.floor(amounts.length * 0.75)]
        const iqr = q3 - q1
        const upperBound = q3 + (1.5 * iqr)
        
        return expenses
            .filter(expense => expense.cantidad > upperBound)
            .map(expense => ({
                ...expense,
                severity: expense.cantidad > (upperBound * 2) ? 'high' : 'medium',
                percentageAboveNormal: ((expense.cantidad - upperBound) / upperBound) * 100
            }))
            .sort((a, b) => b.cantidad - a.cantidad)
    }

    // Generar recomendaciones de ahorro
    const generateSavingRecommendations = (expenses, budgets = []) => {
        console.log('generateSavingRecommendations')
        
        const analysis = analyzeSpendingPatterns(expenses)
        const recommendations = []
        
        // Recomendación basada en categorías principales
        analysis.topCategories.forEach((category, index) => {
            if (index < 3) { // Top 3 categorías
                const percentage = (category.amount / analysis.totalSpent) * 100
                if (percentage > 30) {
                    recommendations.push({
                        type: 'category',
                        priority: 'high',
                        title: `Reducir gastos en ${category.category}`,
                        description: `Representa el ${percentage.toFixed(1)}% de tus gastos. Considera reducir un 10%.`,
                        potentialSaving: category.amount * 0.1,
                        category: category.category
                    })
                }
            }
        })
        
        // Recomendación basada en tendencia
        if (analysis.spendingTrend === 'increasing') {
            recommendations.push({
                type: 'trend',
                priority: 'medium',
                title: 'Controlar el aumento de gastos',
                description: `Tus gastos han aumentado respecto al mes pasado. Intenta mantener el mismo nivel.`,
                potentialSaving: analysis.comparison.difference,
                action: 'control'
            })
        }
        
        // Recomendación de presupuesto
        if (budgets.length === 0) {
            recommendations.push({
                type: 'budget',
                priority: 'high',
                title: 'Crear presupuestos por categoría',
                description: 'Establecer límites te ayudará a controlar mejor tus gastos.',
                action: 'create-budget'
            })
        }
        
        return recommendations.sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 }
            return priorityOrder[b.priority] - priorityOrder[a.priority]
        })
    }

    // Funciones auxiliares
    const generateInsights = (data) => {
        const insights = []
        
        if (data.spendingTrend === 'increasing') {
            insights.push({
                type: 'warning',
                title: 'Gastos en aumento',
                message: `Has gastado €${data.comparison.difference.toFixed(2)} más que el mes pasado`
            })
        } else if (data.spendingTrend === 'decreasing') {
            insights.push({
                type: 'positive',
                title: '¡Gastos reducidos!',
                message: `Has ahorrado €${Math.abs(data.comparison.difference).toFixed(2)} respecto al mes pasado`
            })
        }
        
        if (data.topCategories.length > 0) {
            const topCategory = data.topCategories[0]
            const percentage = (topCategory.amount / data.totalSpent) * 100
            insights.push({
                type: 'info',
                title: 'Categoría principal',
                message: `${topCategory.category} representa el ${percentage.toFixed(1)}% de tus gastos`
            })
        }
        
        if (data.averageDaily > 50) {
            insights.push({
                type: 'tip',
                title: 'Gasto diario elevado',
                message: `Tu promedio diario es €${data.averageDaily.toFixed(2)}. Considera establecer un límite diario.`
            })
        }
        
        return insights
    }
    
    const generateWeeklyInsights = (weeklyData) => {
        const insights = []
        
        const maxSpendingDay = weeklyData.reduce((max, day) => 
            day.average > max.average ? day : max
        )
        
        insights.push({
            type: 'info',
            message: `Tiendes a gastar más los ${maxSpendingDay.day}s (promedio: €${maxSpendingDay.average.toFixed(2)})`
        })
        
        const weekendSpending = weeklyData[0].total + weeklyData[6].total // Domingo + Sábado
        const weekdaySpending = weeklyData.slice(1, 6).reduce((sum, day) => sum + day.total, 0)
        
        if (weekendSpending > weekdaySpending) {
            insights.push({
                type: 'tip',
                message: 'Gastas más los fines de semana. Planifica actividades económicas.'
            })
        }
        
        return insights
    }
    
    const calculatePredictionConfidence = (expenses, daysElapsed) => {
        if (daysElapsed < 7) return 'low'
        if (daysElapsed < 15) return 'medium'
        return 'high'
    }

    return {
        analyzeSpendingPatterns,
        predictMonthlySpending,
        analyzeWeeklyPatterns,
        detectUnusualExpenses,
        generateSavingRecommendations
    }
}
