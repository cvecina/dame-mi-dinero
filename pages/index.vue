<template>
    <div class="min-h-screen bg-marfil-mapamundi p-3 sm:p-4 lg:p-6">
        <!-- Loading state -->
        <div v-if="isLoading" class="flex items-center justify-center py-20">
            <div class="text-center">
                <div class="w-16 h-16 border-4 border-azul-tiquet border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p class="text-gris-billetera font-medium">Cargando datos...</p>
            </div>
        </div>

        <!-- Mensaje cuando no hay usuario seleccionado -->
        <div v-else-if="!currentUser" class="flex items-center justify-center py-20">
            <div class="text-center">
                <div class="text-6xl mb-4">👋</div>
                <h2 class="text-xl font-semibold text-gris-billetera mb-2">¡Hola!</h2>
                <p class="text-gray-600">Selecciona tu usuario para ver tu dashboard</p>
            </div>
        </div>

        <!-- Main content -->
        <div v-else class="max-w-7xl mx-auto">
            <!-- Header -->
            <div class="mb-8">
                <div class="bg-gradient-to-r from-azul-tiquet to-azul-claro-viaje rounded-2xl p-6 text-blanco-dividido shadow-xl">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 class="text-2xl sm:text-3xl font-bold mb-2">
                                {{ selectedDinero ? selectedDinero.name : 'Dame mi dinero' }}
                            </h1>
                            <p class="text-azul-claro-viaje/90 text-sm sm:text-base">
                                {{ selectedDinero ? 
                                    `Dashboard del dinero: ${selectedDinero.name}` : 
                                    'Controla tus gastos compartidos con amigos' 
                                }}
                            </p>
                        </div>
                        <div class="flex items-center gap-3">
                            <div class="bg-blanco-dividido/20 backdrop-blur-sm rounded-lg px-4 py-2">
                                <p class="text-xs opacity-80">Total del grupo</p>
                                <p class="text-xl font-bold">{{ formatMoney(totalExpenses) }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Panel de control -->
            <div class="bg-blanco-dividido rounded-2xl shadow-lg p-6 mb-8 border border-azul-claro-viaje/20">
                <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <!-- Filtros -->
                    <div class="flex flex-col sm:flex-row gap-4">
                        <div class="relative">
                            <label class="text-sm font-semibold text-gris-billetera mb-2 flex items-center gap-2">
                                <span class="text-azul-tiquet">🗓️</span>
                                Período de tiempo
                            </label>
                            <select 
                                v-model="selectedPeriod"
                                class="px-4 py-3 text-sm border-2 border-azul-claro-viaje/30 rounded-xl focus:ring-2 focus:ring-azul-tiquet focus:border-azul-tiquet bg-blanco-dividido transition-all duration-200 hover:border-azul-claro-viaje min-w-[160px]"
                            >
                                <option value="week">Esta semana</option>
                                <option value="month">Este mes</option>
                                <option value="year">Este año</option>
                                <option value="all">Todo el tiempo</option>
                            </select>
                        </div>
                        
                        <div class="flex items-end">
                            <div class="bg-azul-claro-viaje/10 px-4 py-3 rounded-xl border border-azul-claro-viaje/30">
                                <p class="text-xs text-gris-billetera font-medium">Mostrando datos de</p>
                                <p class="text-sm font-bold text-azul-tiquet">{{ getPeriodLabel() }}</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Botones de acción -->
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

            <!-- Panel de alertas -->
            <div v-if="hasAlerts" class="mb-8">
                <div class="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border-l-4 border-yellow-400 shadow-lg">
                    <h3 class="text-lg font-bold text-gris-billetera mb-4 flex items-center gap-2">
                        <span class="text-yellow-500">⚠️</span>
                        Alertas importantes
                    </h3>
                    <div class="space-y-4">
                        <div 
                            v-for="alert in alertsData" 
                            :key="alert.title"
                            class="p-4 rounded-xl border-l-4 transition-all duration-200 hover:shadow-md"
                            :class="{
                                'bg-yellow-50/80 border-yellow-400 hover:bg-yellow-50': alert.type === 'warning',
                                'bg-red-50/80 border-red-400 hover:bg-red-50': alert.type === 'error',
                                'bg-blue-50/80 border-blue-400 hover:bg-blue-50': alert.type === 'info'
                            }"
                        >
                            <div class="flex items-start gap-4">
                                <div class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                                    :class="{
                                        'bg-yellow-100': alert.type === 'warning',
                                        'bg-red-100': alert.type === 'error',
                                        'bg-blue-100': alert.type === 'info'
                                    }"
                                >
                                    <span class="text-lg">{{ alert.icon }}</span>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <h4 class="font-semibold text-gris-billetera text-sm mb-1">{{ alert.title }}</h4>
                                    <p class="text-sm leading-relaxed" 
                                        :class="{
                                            'text-yellow-800': alert.type === 'warning',
                                            'text-red-800': alert.type === 'error',
                                            'text-blue-800': alert.type === 'info'
                                        }"
                                    >
                                        {{ alert.message }}
                                    </p>
                                </div>
                                <button 
                                    @click="handleAlertAction(alert)"
                                    class="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5"
                                    :class="{
                                        'bg-yellow-200 text-yellow-900 hover:bg-yellow-300': alert.type === 'warning',
                                        'bg-red-200 text-red-900 hover:bg-red-300': alert.type === 'error',
                                        'bg-blue-200 text-blue-900 hover:bg-blue-300': alert.type === 'info'
                                    }"
                                >
                                    {{ alert.action }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Resumen de balances -->
            <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                <!-- Total gastado -->
                <div class="bg-gradient-to-br from-blanco-dividido to-azul-claro-viaje/10 rounded-2xl shadow-lg p-6 border border-azul-tiquet/10 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-12 h-12 bg-azul-tiquet/10 rounded-xl flex items-center justify-center">
                            <span class="text-2xl">💰</span>
                        </div>
                        <div class="text-right">
                            <p class="text-xs font-medium text-gray-600 uppercase tracking-wide">Total grupo</p>
                            <p class="text-2xl font-bold text-azul-tiquet">{{ formatMoney(totalExpenses) }}</p>
                        </div>
                    </div>
                    <div class="h-1 bg-gradient-to-r from-azul-tiquet to-azul-claro-viaje rounded-full"></div>
                </div>
                
                <!-- Tu balance -->
                <div class="bg-gradient-to-br from-blanco-dividido to-lima-compartida/10 rounded-2xl shadow-lg p-6 border border-lima-compartida/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-12 h-12 bg-lima-compartida/10 rounded-xl flex items-center justify-center">
                            <span class="text-2xl">{{ userBalance >= 0 ? '📈' : '📉' }}</span>
                        </div>
                        <div class="text-right">
                            <p class="text-xs font-medium text-gray-600 uppercase tracking-wide">Tu balance</p>
                            <p class="text-2xl font-bold" :class="userBalance >= 0 ? 'text-lima-compartida' : 'text-red-500'">
                                {{ formatMoney(userBalance) }}
                            </p>
                        </div>
                    </div>
                    <div class="h-1 bg-gradient-to-r rounded-full" :class="userBalance >= 0 ? 'from-lima-compartida to-green-400' : 'from-red-400 to-red-500'"></div>
                </div>
                
                <!-- Gastos del período -->
                <div class="bg-gradient-to-br from-blanco-dividido to-azul-claro-viaje/10 rounded-2xl shadow-lg p-6 border border-azul-claro-viaje/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 sm:col-span-2 xl:col-span-1">
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-12 h-12 bg-azul-claro-viaje/10 rounded-xl flex items-center justify-center">
                            <span class="text-2xl">📊</span>
                        </div>
                        <div class="text-right">
                            <p class="text-xs font-medium text-gray-600 uppercase tracking-wide">{{ getPeriodLabel() }}</p>
                            <p class="text-2xl font-bold text-azul-claro-viaje">{{ getExpensesByPeriod().length }}</p>
                        </div>
                    </div>
                    <div class="h-1 bg-gradient-to-r from-azul-claro-viaje to-azul-tiquet rounded-full"></div>
                </div>
                
                <!-- Botón de añadir gasto como tarjeta -->
                <div class="bg-gradient-to-br from-lima-compartida/20 to-lima-compartida/10 rounded-2xl shadow-lg border-2 border-dashed border-lima-compartida/40 hover:border-lima-compartida hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 sm:col-span-2 xl:col-span-1">
                    <button 
                        @click="showAddExpenseModal = true"
                        :disabled="expenseStore.isLoading || !currentUser"
                        class="w-full h-full p-6 text-center disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        <div class="w-12 h-12 bg-lima-compartida/20 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-lima-compartida/30 transition-colors">
                            <span class="text-2xl group-hover:scale-110 transition-transform">➕</span>
                        </div>
                        <p class="text-sm font-semibold text-gris-billetera">Añadir gasto</p>
                        <p class="text-xs text-gray-600 mt-1">Registrar nuevo gasto</p>
                    </button>
                </div>
            </div>

            <!-- Presupuestos detallados -->
            <div class="bg-blanco-dividido rounded-2xl shadow-lg p-6 mb-8 border border-azul-claro-viaje/20">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2 sm:gap-0">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-lima-compartida/10 rounded-xl flex items-center justify-center">
                            <span class="text-xl">💼</span>
                        </div>
                        <div>
                            <h2 class="text-xl font-bold text-gris-billetera">Presupuestos activos</h2>
                            <p class="text-sm text-gray-600">Control de gastos por categoría</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <div class="bg-lima-compartida/10 px-4 py-2 rounded-xl">
                            <span class="text-sm font-semibold text-lima-compartida">{{ activeBudgets.length }} presupuestos</span>
                        </div>
                        <button 
                            @click="showBudgetModal = true"
                            class="px-4 py-2 bg-lima-compartida text-gris-billetera text-sm font-semibold rounded-xl hover:bg-lima-compartida/80 transition-all duration-200 transform hover:-translate-y-0.5 flex items-center gap-2"
                        >
                            <span class="text-sm">➕</span>
                            Gestionar
                        </button>
                    </div>
                </div>
                
                <div v-if="activeBudgets.length === 0" class="text-center py-12">
                    <div class="w-20 h-20 bg-lima-compartida/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span class="text-3xl">💼</span>
                    </div>
                    <h3 class="text-lg font-semibold text-gris-billetera mb-2">Sin presupuestos activos</h3>
                    <p class="text-gray-600 mb-4">Crea presupuestos para controlar mejor tus gastos por categoría</p>
                    <button 
                        @click="showBudgetModal = true"
                        class="px-6 py-3 bg-lima-compartida text-gris-billetera rounded-xl font-semibold hover:bg-lima-compartida/80 transition-all duration-200 transform hover:-translate-y-0.5"
                    >
                        Crear primer presupuesto
                    </button>
                </div>

                <div v-else class="space-y-4">
                    <div 
                        v-for="(progress, index) in budgetProgressData" 
                        :key="progress.budget.id"
                        class="group p-4 rounded-xl border transition-all duration-200 hover:shadow-md"
                        :class="{
                            'border-red-200 bg-gradient-to-r from-red-50 to-orange-50': progress.isOverBudget,
                            'border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50': progress.isNearLimit && !progress.isOverBudget,
                            'border-green-200 bg-gradient-to-r from-green-50 to-lime-50': !progress.isNearLimit && !progress.isOverBudget,
                            'border-azul-claro-viaje/20 bg-gradient-to-r from-blanco-dividido to-azul-claro-viaje/5': !progress.isNearLimit && !progress.isOverBudget && progress.percentage === 0
                        }"
                    >
                        <div class="flex items-center gap-4">
                            <!-- Estado y posición -->
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
                                    :class="{
                                        'bg-red-200 text-red-700': progress.isOverBudget,
                                        'bg-yellow-200 text-yellow-700': progress.isNearLimit && !progress.isOverBudget,
                                        'bg-green-200 text-green-700': !progress.isNearLimit && !progress.isOverBudget,
                                        'bg-azul-tiquet/10 text-azul-tiquet': progress.percentage === 0
                                    }"
                                >
                                    {{ index + 1 }}
                                </div>
                                <div class="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
                                    :class="{
                                        'bg-red-100': progress.isOverBudget,
                                        'bg-yellow-100': progress.isNearLimit && !progress.isOverBudget,
                                        'bg-green-100': !progress.isNearLimit && !progress.isOverBudget,
                                        'bg-azul-claro-viaje/20': progress.percentage === 0
                                    }"
                                >
                                    <span class="text-xl">{{ getCategoryIcon(progress.budget.category) }}</span>
                                </div>
                            </div>
                            
                            <!-- Info del presupuesto -->
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center justify-between mb-2">
                                    <div class="flex items-center gap-3">
                                        <h3 class="font-semibold text-gris-billetera truncate group-hover:text-azul-tiquet transition-colors">
                                            {{ progress.budget.category }}
                                        </h3>
                                        <span class="px-2 py-1 rounded-full text-xs font-medium"
                                            :class="{
                                                'bg-red-200 text-red-800': progress.isOverBudget,
                                                'bg-yellow-200 text-yellow-800': progress.isNearLimit && !progress.isOverBudget,
                                                'bg-green-200 text-green-800': !progress.isNearLimit && !progress.isOverBudget,
                                                'bg-gray-200 text-gray-800': progress.percentage === 0
                                            }"
                                        >
                                            {{ progress.isOverBudget ? 'EXCEDIDO' : progress.isNearLimit ? 'CERCA DEL LÍMITE' : progress.percentage === 0 ? 'SIN GASTOS' : 'EN RANGO' }}
                                        </span>
                                    </div>
                                    <div class="text-right ml-4">
                                        <p class="text-lg font-bold"
                                            :class="{
                                                'text-red-600': progress.isOverBudget,
                                                'text-yellow-600': progress.isNearLimit && !progress.isOverBudget,
                                                'text-green-600': !progress.isNearLimit && !progress.isOverBudget,
                                                'text-azul-tiquet': progress.percentage === 0
                                            }"
                                        >
                                            {{ formatMoney(progress.spent) }} / {{ formatMoney(progress.budget.amount) }}
                                        </p>
                                        <p class="text-xs text-gray-600">
                                            {{ Math.round(progress.percentage) }}% utilizado
                                            <span v-if="progress.remaining > 0" class="text-green-600">
                                                • {{ formatMoney(progress.remaining) }} disponible
                                            </span>
                                            <span v-else-if="progress.remaining < 0" class="text-red-600">
                                                • {{ formatMoney(Math.abs(progress.remaining)) }} excedido
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                
                                <!-- Barra de progreso del presupuesto -->
                                <div class="w-full bg-gray-200 rounded-full h-4 mb-2 overflow-hidden">
                                    <div 
                                        class="h-4 rounded-full transition-all duration-500 ease-out relative"
                                        :class="{
                                            'bg-gradient-to-r from-red-500 to-red-600': progress.isOverBudget,
                                            'bg-gradient-to-r from-yellow-500 to-orange-500': progress.isNearLimit && !progress.isOverBudget,
                                            'bg-gradient-to-r from-green-500 to-lime-500': !progress.isNearLimit && !progress.isOverBudget,
                                            'bg-gradient-to-r from-azul-tiquet to-azul-claro-viaje': progress.percentage === 0
                                        }"
                                        :style="{ width: `${Math.min(progress.percentage, 100)}%` }"
                                    >
                                        <!-- Indicador de exceso si supera el 100% -->
                                        <div v-if="progress.isOverBudget" 
                                            class="absolute right-0 top-0 h-full bg-red-700 rounded-r-full animate-pulse"
                                            style="width: 4px;"
                                        ></div>
                                    </div>
                                </div>
                                
                                <div class="flex items-center justify-between text-xs text-gray-600">
                                    <span class="flex items-center gap-1">
                                        <span class="w-2 h-2 rounded-full"
                                            :class="{
                                                'bg-red-500': progress.isOverBudget,
                                                'bg-yellow-500': progress.isNearLimit && !progress.isOverBudget,
                                                'bg-green-500': !progress.isNearLimit && !progress.isOverBudget,
                                                'bg-azul-tiquet': progress.percentage === 0
                                            }"
                                        ></span>
                                        Período: {{ progress.budget.period }}
                                    </span>
                                    <span class="font-medium">
                                        Creado: {{ formatDate(progress.budget.createdAt) }}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Detalles adicionales si está excedido o cerca del límite -->
                        <div v-if="progress.isOverBudget || progress.isNearLimit" class="mt-4 pt-4 border-t border-current/20">
                            <div class="flex items-center justify-between text-sm">
                                <div class="flex items-center gap-2">
                                    <span v-if="progress.isOverBudget" class="text-red-600">🚨</span>
                                    <span v-else class="text-yellow-600">⚠️</span>
                                    <span class="font-medium"
                                        :class="{
                                            'text-red-700': progress.isOverBudget,
                                            'text-yellow-700': progress.isNearLimit
                                        }"
                                    >
                                        {{ progress.isOverBudget ? 'Presupuesto excedido' : 'Cerca del límite del presupuesto' }}
                                    </span>
                                </div>
                                <div class="flex gap-2">
                                    <button 
                                        @click="showCategoryExpenses(progress.budget.category)"
                                        class="px-3 py-1 rounded-lg text-xs font-medium transition-colors"
                                        :class="{
                                            'bg-red-200 text-red-800 hover:bg-red-300': progress.isOverBudget,
                                            'bg-yellow-200 text-yellow-800 hover:bg-yellow-300': progress.isNearLimit
                                        }"
                                    >
                                        Ver gastos
                                    </button>
                                    <button 
                                        @click="editBudget(progress.budget)"
                                        class="px-3 py-1 bg-azul-tiquet/20 text-azul-tiquet rounded-lg text-xs font-medium hover:bg-azul-tiquet/30 transition-colors"
                                    >
                                        Ajustar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Resumen de presupuestos -->
                    <div class="bg-azul-claro-viaje/10 rounded-xl p-4 border border-azul-claro-viaje/20 mt-6">
                        <h4 class="font-semibold text-gris-billetera mb-3 flex items-center gap-2">
                            <span class="text-azul-tiquet">📈</span>
                            Resumen de presupuestos
                        </h4>
                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div class="text-center">
                                <p class="text-xs text-gray-600 mb-1">Total presupuestado</p>
                                <p class="text-lg font-bold text-azul-tiquet">{{ formatMoney(totalBudgeted) }}</p>
                            </div>
                            <div class="text-center">
                                <p class="text-xs text-gray-600 mb-1">Total gastado</p>
                                <p class="text-lg font-bold" :class="totalSpentInBudgets > totalBudgeted ? 'text-red-600' : 'text-green-600'">
                                    {{ formatMoney(totalSpentInBudgets) }}
                                </p>
                            </div>
                            <div class="text-center">
                                <p class="text-xs text-gray-600 mb-1">Disponible</p>
                                <p class="text-lg font-bold" :class="(totalBudgeted - totalSpentInBudgets) >= 0 ? 'text-green-600' : 'text-red-600'">
                                    {{ formatMoney(totalBudgeted - totalSpentInBudgets) }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Estadísticas por categoría -->
            <div class="bg-blanco-dividido rounded-2xl shadow-lg p-6 mb-8 border border-azul-claro-viaje/20" data-category-section>
                <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2 sm:gap-0">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-azul-tiquet/10 rounded-xl flex items-center justify-center">
                            <span class="text-xl">📊</span>
                        </div>
                        <div>
                            <h2 class="text-xl font-bold text-gris-billetera">Gastos por categoría</h2>
                            <p class="text-sm text-gray-600">Análisis de {{ getPeriodLabel() }}</p>
                        </div>
                    </div>
                    <div class="bg-azul-claro-viaje/10 px-4 py-2 rounded-xl">
                        <span class="text-sm font-semibold text-azul-tiquet">{{ expensesByCategory.length }} categorías</span>
                    </div>
                </div>
                
                <div v-if="expensesByCategory.length === 0" class="text-center py-12">
                    <div class="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span class="text-3xl">📊</span>
                    </div>
                    <h3 class="text-lg font-semibold text-gris-billetera mb-2">Sin datos de categorías</h3>
                    <p class="text-gray-600 mb-4">No hay gastos registrados en {{ getPeriodLabel() }}</p>
                    <button 
                        @click="showAddExpenseModal = true"
                        class="px-6 py-3 bg-lima-compartida text-gris-billetera rounded-xl font-semibold hover:bg-lima-compartida/80 transition-colors"
                    >
                        Añadir primer gasto
                    </button>
                </div>

                <div v-else class="space-y-4">
                    <div 
                        v-for="(category, index) in expensesByCategory.slice(0, 6)" 
                        :key="category.name"
                        class="group p-4 rounded-xl border border-azul-claro-viaje/20 hover:border-azul-claro-viaje/40 hover:shadow-md transition-all duration-200 bg-gradient-to-r from-blanco-dividido to-azul-claro-viaje/5"
                    >
                        <div class="flex items-center gap-4">
                            <!-- Posición y icono -->
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 bg-azul-tiquet/10 rounded-lg flex items-center justify-center font-bold text-azul-tiquet text-sm">
                                    {{ index + 1 }}
                                </div>
                                <div class="w-12 h-12 bg-gradient-to-br from-azul-claro-viaje/20 to-azul-tiquet/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <span class="text-xl">{{ getCategoryIcon(category.name) }}</span>
                                </div>
                            </div>
                            
                            <!-- Info de categoría -->
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center justify-between mb-2">
                                    <h3 class="font-semibold text-gris-billetera truncate group-hover:text-azul-tiquet transition-colors">{{ category.name }}</h3>
                                    <div class="text-right ml-4">
                                        <span class="text-lg font-bold text-azul-tiquet">{{ formatMoney(category.total) }}</span>
                                        <p class="text-xs text-gray-600">{{ Math.round((category.total / expensesByCategory.reduce((sum, cat) => sum + cat.total, 0)) * 100) }}% del total</p>
                                    </div>
                                </div>
                                
                                <!-- Barra de progreso mejorada -->
                                <div class="w-full bg-gray-200 rounded-full h-3 mb-2 overflow-hidden">
                                    <div 
                                        class="bg-gradient-to-r from-azul-tiquet via-azul-claro-viaje to-lima-compartida h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
                                        :style="{ width: `${(category.total / expensesByCategory[0].total) * 100}%` }"
                                    ></div>
                                </div>
                                
                                <div class="flex items-center justify-between text-xs text-gray-600">
                                    <span class="flex items-center gap-1">
                                        <span class="w-2 h-2 bg-azul-tiquet rounded-full"></span>
                                        {{ category.count }} gasto{{ category.count !== 1 ? 's' : '' }}
                                    </span>
                                    <span class="font-medium">Promedio: {{ formatMoney(category.total / category.count) }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Mostrar más categorías si hay -->
                    <div v-if="expensesByCategory.length > 6" class="text-center pt-4">
                        <div class="bg-azul-claro-viaje/10 rounded-xl p-4 border border-azul-claro-viaje/20">
                            <p class="text-sm font-medium text-azul-tiquet">
                                +{{ expensesByCategory.length - 6 }} categorías más con un total de 
                                <span class="font-bold">{{ formatMoney(expensesByCategory.slice(6).reduce((sum, cat) => sum + cat.total, 0)) }}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Lista de gastos recientes -->
            <div class="bg-blanco-dividido rounded-2xl shadow-lg p-6 mb-8 border border-azul-claro-viaje/20">
                <div class="flex items-center justify-between mb-6">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-lima-compartida/10 rounded-xl flex items-center justify-center">
                            <span class="text-xl">💸</span>
                        </div>
                        <div>
                            <h2 class="text-xl font-bold text-gris-billetera">Gastos recientes</h2>
                            <p class="text-sm text-gray-600">Últimos movimientos registrados</p>
                        </div>
                    </div>
                    <div class="bg-lima-compartida/10 px-4 py-2 rounded-xl">
                        <span class="text-sm font-semibold text-lima-compartida">{{ expenses.length }} gastos</span>
                    </div>
                </div>
                
                <div v-if="expenses.length === 0" class="text-center py-12">
                    <div class="w-20 h-20 bg-lima-compartida/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span class="text-3xl">💸</span>
                    </div>
                    <h3 class="text-lg font-semibold text-gris-billetera mb-2">
                        {{ selectedDinero ? 
                            `Sin gastos en "${selectedDinero.name}"` : 
                            'Sin gastos registrados' 
                        }}
                    </h3>
                    <p class="text-gray-600 mb-4">Comienza registrando tu primer gasto compartido</p>
                    <button 
                        @click="showAddExpenseModal = true"
                        class="px-6 py-3 bg-lima-compartida text-gris-billetera rounded-xl font-semibold hover:bg-lima-compartida/80 transition-all duration-200 transform hover:-translate-y-0.5"
                    >
                        {{ selectedDinero ? 'Añadir el primer gasto' : 'Crear tu primer gasto' }}
                    </button>
                </div>
                
                <div v-else class="space-y-3">
                    <div 
                        v-for="(expense, index) in expenses.slice(0, 5)" 
                        :key="expense.id"
                        class="group p-4 bg-gradient-to-r from-marfil-mapamundi to-blanco-dividido rounded-xl border border-azul-claro-viaje/20 hover:border-azul-claro-viaje/40 hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
                    >
                        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                            <div class="flex items-center gap-4 flex-1">
                                <!-- Posición -->
                                <div class="w-8 h-8 bg-azul-tiquet/10 rounded-lg flex items-center justify-center font-bold text-azul-tiquet text-sm">
                                    {{ index + 1 }}
                                </div>
                                
                                <!-- Icono de categoría -->
                                <div class="w-12 h-12 bg-gradient-to-br from-azul-claro-viaje/20 to-azul-tiquet/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <span class="text-lg">{{ getCategoryIcon(expense.category) }}</span>
                                </div>
                                
                                <!-- Info del gasto -->
                                <div class="flex-1 min-w-0">
                                    <h3 class="font-semibold text-gris-billetera group-hover:text-azul-tiquet transition-colors truncate">{{ expense.title }}</h3>
                                    <div class="flex items-center gap-2 text-xs text-gray-600 mt-1">
                                        <span class="bg-azul-claro-viaje/20 px-2 py-1 rounded-full">{{ getUserName(expense.paidBy) }}</span>
                                        <span>•</span>
                                        <span>{{ formatDate(expense.date) }}</span>
                                        <span>•</span>
                                        <span class="bg-lima-compartida/20 px-2 py-1 rounded-full">{{ expense.category }}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Monto y participantes -->
                            <div class="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-1">
                                <div class="text-right">
                                    <p class="text-lg font-bold text-azul-tiquet">{{ formatMoney(expense.amount) }}</p>
                                    <p class="text-xs text-gray-600 flex items-center gap-1">
                                        <span class="w-2 h-2 bg-lima-compartida rounded-full"></span>
                                        {{ expense.participants?.length || 0 }} participantes
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Ver todos los gastos -->
                    <div v-if="expenses.length > 5" class="text-center pt-4">
                        <NuxtLink 
                            to="/expenses"
                            class="inline-flex items-center gap-2 px-6 py-3 bg-azul-tiquet/10 text-azul-tiquet rounded-xl font-semibold hover:bg-azul-tiquet/20 transition-all duration-200 transform hover:-translate-y-0.5"
                        >
                            <span>Ver todos los gastos</span>
                            <span class="bg-azul-tiquet text-blanco-dividido px-2 py-1 rounded-full text-xs">{{ expenses.length }}</span>
                        </NuxtLink>
                    </div>
                </div>
            </div>

            <!-- Pagos pendientes -->
            <div class="bg-blanco-dividido rounded-2xl shadow-lg p-6 mb-8 border border-red-200/50">
                <div class="flex items-center justify-between mb-6">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                            <span class="text-xl">⏰</span>
                        </div>
                        <div>
                            <h2 class="text-xl font-bold text-gris-billetera">Pagos pendientes</h2>
                            <p class="text-sm text-gray-600">Gastos por saldar</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="bg-red-100 px-3 py-2 rounded-xl">
                            <span class="text-sm font-semibold text-red-600">{{ pendingPayments.length }} pendientes</span>
                        </div>
                        <NuxtLink 
                            to="/expenses"
                            class="text-azul-tiquet hover:text-azul-claro-viaje text-sm font-medium transition-colors"
                        >
                            Ver todos →
                        </NuxtLink>
                    </div>
                </div>
                
                <div v-if="pendingPayments.length === 0" class="text-center py-12">
                    <div class="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span class="text-3xl">✅</span>
                    </div>
                    <h3 class="text-lg font-semibold text-gris-billetera mb-2">¡Todo al día!</h3>
                    <p class="text-gray-600">No tienes pagos pendientes</p>
                </div>

                <div v-else class="space-y-3">
                    <div 
                        v-for="(payment, index) in pendingPayments.slice(0, 5)" 
                        :key="payment.id"
                        class="group p-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
                    >
                        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                            <div class="flex items-center gap-4 flex-1">
                                <!-- Urgencia -->
                                <div class="w-8 h-8 bg-red-200 rounded-lg flex items-center justify-center font-bold text-red-700 text-sm">
                                    {{ index + 1 }}
                                </div>
                                
                                <!-- Icono de alerta -->
                                <div class="w-12 h-12 bg-red-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <span class="text-lg">💳</span>
                                </div>
                                
                                <!-- Info del pago -->
                                <div class="flex-1 min-w-0">
                                    <h3 class="font-semibold text-gris-billetera group-hover:text-red-600 transition-colors truncate">{{ payment.title }}</h3>
                                    <div class="flex items-center gap-2 text-xs text-gray-600 mt-1">
                                        <span class="bg-red-200 px-2 py-1 rounded-full">Pagado por: {{ payment.paidBy }}</span>
                                        <span>•</span>
                                        <span>{{ formatDate(payment.date) }}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Monto y acción -->
                            <div class="flex items-center justify-between sm:flex-col sm:items-end gap-3 sm:gap-2">
                                <p class="font-bold text-red-600 text-lg">{{ formatMoney(payment.amount) }}</p>
                                <button 
                                    @click="markPaymentAsPaid(payment.id)"
                                    class="px-4 py-2 bg-lima-compartida text-gris-billetera text-xs font-semibold rounded-xl hover:bg-lima-compartida/80 transition-all duration-200 transform hover:-translate-y-0.5 whitespace-nowrap"
                                >
                                    Marcar como pagado
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div v-if="pendingPayments.length > 5" class="text-center pt-4">
                        <div class="bg-red-100 rounded-xl p-4 border border-red-200">
                            <p class="text-sm font-medium text-red-700">
                                +{{ pendingPayments.length - 5 }} pagos pendientes más por un total de 
                                <span class="font-bold">{{ formatMoney(pendingPayments.slice(5).reduce((sum, payment) => sum + payment.amount, 0)) }}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Resumen de balances personales -->
            <div class="bg-blanco-dividido rounded-lg shadow-md p-4 sm:p-6" data-balance-section>
                <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2 sm:gap-0">
                    <h2 class="text-lg sm:text-xl font-semibold text-gris-billetera">Mi situación financiera</h2>
                    <NuxtLink 
                        to="/balances"
                        class="text-azul-tiquet hover:text-azul-claro-viaje text-sm font-medium transition-colors"
                    >
                        Ver todos los balances
                    </NuxtLink>
                </div>
                
                <div v-if="!currentUser || Object.keys(balances).length === 0" class="text-center py-8 text-gray-500">
                    <div class="text-4xl mb-2">👥</div>
                    <p class="text-sm sm:text-base">No hay balances calculados</p>
                </div>

                <div v-else class="space-y-6">
                    <!-- Tu resumen personal -->
                    <div 
                        v-if="balances[currentUser.id]"
                        class="relative overflow-hidden p-4 sm:p-6 bg-gradient-to-br from-lima-compartida/15 via-azul-claro-viaje/10 to-azul-tiquet/5 rounded-xl border-2 border-lima-compartida/30 shadow-lg"
                    >
                        <div class="absolute top-3 right-3 bg-lima-compartida text-gris-billetera px-3 py-1 rounded-full shadow-md">
                            <span class="text-xs font-bold tracking-wide">TU BALANCE</span>
                        </div>
                        
                        <div class="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 pr-20 sm:pr-0">
                            <div class="flex items-center gap-3">
                                <div class="w-14 h-14 bg-gradient-to-br from-azul-tiquet to-azul-claro-viaje rounded-full flex items-center justify-center text-blanco-dividido font-bold text-xl shadow-md">
                                    {{ getUserName(currentUser.id).charAt(0).toUpperCase() }}
                                </div>
                                <div class="min-w-0 flex-1">
                                    <h3 class="font-bold text-gris-billetera text-lg sm:text-xl truncate">{{ getUserName(currentUser.id) }}</h3>
                                    <p class="text-base sm:text-lg font-semibold break-words" :class="balances[currentUser.id].balance >= 0 ? 'text-azul-tiquet' : 'text-red-600'">
                                        {{ formatMoney(balances[currentUser.id].balance) }}
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                            <div class="bg-blanco-dividido/70 backdrop-blur-sm rounded-lg p-3 sm:p-4 text-center border border-azul-tiquet/10 hover:bg-blanco-dividido/90 transition-colors">
                                <p class="text-xs sm:text-sm text-gray-600 mb-1 font-medium">Has pagado</p>
                                <p class="font-bold text-azul-tiquet text-sm sm:text-base break-words">{{ formatMoney(balances[currentUser.id].totalSpent) }}</p>
                            </div>
                            <div class="bg-blanco-dividido/70 backdrop-blur-sm rounded-lg p-3 sm:p-4 text-center border border-lima-compartida/20 hover:bg-blanco-dividido/90 transition-colors">
                                <p class="text-xs sm:text-sm text-gray-600 mb-1 font-medium">Te deben</p>
                                <p class="font-bold text-lima-compartida text-sm sm:text-base break-words">{{ formatMoney(balances[currentUser.id].owedToThem) }}</p>
                            </div>
                            <div class="bg-blanco-dividido/70 backdrop-blur-sm rounded-lg p-3 sm:p-4 text-center border border-red-200 hover:bg-blanco-dividido/90 transition-colors">
                                <p class="text-xs sm:text-sm text-gray-600 mb-1 font-medium">Debes</p>
                                <p class="font-bold text-red-500 text-sm sm:text-base break-words">{{ formatMoney(balances[currentUser.id].owes) }}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Detalles de quién te debe dinero -->
                    <div v-if="peopleWhoOweMe.length > 0">
                        <h3 class="text-lg font-semibold text-gris-billetera mb-3 flex items-center gap-2">
                            💰 Te deben dinero <span class="text-sm font-normal text-gray-600">({{ peopleWhoOweMe.length }})</span>
                        </h3>
                        <div class="space-y-2">
                            <div 
                                v-for="debt in peopleWhoOweMe" 
                                :key="debt.userId"
                                class="flex items-center justify-between p-3 bg-lima-compartida/10 rounded-lg border border-lima-compartida/20"
                            >
                                <div class="flex items-center gap-3">
                                    <div class="w-8 h-8 bg-lima-compartida rounded-full flex items-center justify-center text-gris-billetera font-semibold text-sm">
                                        {{ getUserName(debt.userId).charAt(0).toUpperCase() }}
                                    </div>
                                    <div>
                                        <p class="font-medium text-gris-billetera">{{ getUserName(debt.userId) }}</p>
                                        <p class="text-xs text-gray-600">{{ debt.expenseCount }} gasto{{ debt.expenseCount !== 1 ? 's' : '' }}</p>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <p class="font-bold text-lima-compartida">{{ formatMoney(debt.amount) }}</p>
                                    <button 
                                        @click="sendReminder(debt.userId, debt.amount)"
                                        class="text-xs text-azul-tiquet hover:text-azul-claro-viaje transition-colors"
                                    >
                                        Recordar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Detalles de a quién le debes dinero -->
                    <div v-if="peopleIOwe.length > 0">
                        <h3 class="text-lg font-semibold text-gris-billetera mb-3 flex items-center gap-2">
                            💸 Debes dinero <span class="text-sm font-normal text-gray-600">({{ peopleIOwe.length }})</span>
                        </h3>
                        <div class="space-y-2">
                            <div 
                                v-for="debt in peopleIOwe" 
                                :key="debt.userId"
                                class="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200"
                            >
                                <div class="flex items-center gap-3">
                                    <div class="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-blanco-dividido font-semibold text-sm">
                                        {{ getUserName(debt.userId).charAt(0).toUpperCase() }}
                                    </div>
                                    <div>
                                        <p class="font-medium text-gris-billetera">{{ getUserName(debt.userId) }}</p>
                                        <p class="text-xs text-gray-600">{{ debt.expenseCount }} gasto{{ debt.expenseCount !== 1 ? 's' : '' }}</p>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <p class="font-bold text-red-600">{{ formatMoney(debt.amount) }}</p>
                                    <button 
                                        @click="payDebt(debt.userId, debt.amount)"
                                        class="text-xs bg-lima-compartida text-gris-billetera px-2 py-1 rounded hover:bg-azul-claro-viaje transition-colors"
                                    >
                                        Pagar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Mensaje cuando estás al día -->
                    <div v-if="peopleWhoOweMe.length === 0 && peopleIOwe.length === 0 && balances[currentUser.id]" class="text-center py-6">
                        <div class="text-4xl mb-2">✅</div>
                        <p class="text-gris-billetera font-medium">¡Estás al día con todos!</p>
                        <p class="text-sm text-gray-600">No tienes deudas pendientes</p>
                    </div>
                </div>
            </div>

            <!-- Modal para añadir gasto -->
            <AddExpenseModal 
                v-if="showAddExpenseModal"
                @close="showAddExpenseModal = false"
                @expense-added="onExpenseAdded"
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
import { ref, computed, onMounted, watch } from 'vue'
import { useExpenseStore } from '~/stores/expense.store'
import { useUserStore } from '~/stores/user.store'
import { useAlertStore } from '~/stores/alert.store'
import { useContextStore } from '~/stores/context.store'
import { useDineroStore } from '~/stores/dinero.store'
import { useBudgetStore } from '~/stores/budget.store'

// Stores
const expenseStore = useExpenseStore()
const userStore = useUserStore()
const alertStore = useAlertStore()
const contextStore = useContextStore()
const dineroStore = useDineroStore()
const budgetStore = useBudgetStore()

// Reactive data
const showAddExpenseModal = ref(false)
const showBudgetModal = ref(false)
const selectedPeriod = ref('month') // week, month, year, all

// Computed properties
const currentUser = computed(() => userStore.getCurrentUser)
const selectedDinero = computed(() => {
    const selectedDineroId = contextStore.getSelectedDineroId
    return selectedDineroId ? dineroStore.getDineroById(selectedDineroId) : null
})
const selectedDineroId = computed(() => contextStore.getSelectedDineroId)
const isLoading = computed(() => expenseStore.isLoading || userStore.isLoading || contextStore.isLoading || dineroStore.isLoading)

// Computed properties
const expenses = computed(() => {
    const periodExpenses = getExpensesByPeriod()
    console.log('Computing expenses for period:', selectedPeriod.value, 'Found:', periodExpenses.length)
    
    // Ordenar por fecha más reciente primero
    return [...periodExpenses].sort((a, b) => new Date(b.date) - new Date(a.date))
})

const pendingPayments = computed(() => {
    if (!currentUser.value) return []
    
    const selectedDineroId = contextStore.getSelectedDineroId
    if (!selectedDineroId) return []
    
    // Filtrar gastos del dinero seleccionado
    const expensesByDinero = expenseStore.getExpensesByDinero(selectedDineroId)
    if (!expensesByDinero || !Array.isArray(expensesByDinero)) return []
    
    const pending = []
    
    expensesByDinero.forEach(expense => {
        // Validar que el expense tenga las propiedades necesarias
        if (!expense || !expense.participants || !Array.isArray(expense.participants) || !expense.amount || !expense.id) {
            return
        }
        
        // Verificar si el usuario actual participa en este gasto
        if (!expense.participants.includes(currentUser.value.id)) {
            return
        }
        
        // Si el usuario actual es quien pagó originalmente, ya pagó su parte
        if (expense.paidBy === currentUser.value.id) {
            return
        }
        
        // Calcular el monto que debe pagar este usuario
        const userAmount = expense.amount / expense.participants.length
        
        // Verificar si ya está marcado como pagado
        const isUserPaid = expenseStore.getUserPaymentStatus(expense.id, currentUser.value.id)
        
        // Si no ha pagado, agregarlo a pendientes
        if (!isUserPaid) {
            pending.push({
                id: expense.id,
                title: expense.title || 'Sin título',
                amount: userAmount,
                paidBy: getUserName(expense.paidBy),
                date: expense.date || new Date().toISOString()
            })
        }
    })
    
    return pending.sort((a, b) => new Date(b.date) - new Date(a.date))
})

const totalExpenses = computed(() => {
    const selectedDineroId = contextStore.getSelectedDineroId
    if (!selectedDineroId) return 0
    
    return expenseStore.getTotalExpensesByDinero(selectedDineroId)
})

const balances = computed(() => {
    const selectedDineroId = contextStore.getSelectedDineroId
    if (!selectedDineroId) return {}
    
    return expenseStore.getBalancesByDinero(selectedDineroId)
})

const userBalance = computed(() => {
    if (!currentUser.value) return 0
    const userBalances = balances.value[currentUser.value.id]
    return userBalances ? userBalances.balance : 0
})

// Computed para estadísticas por categoría
const expensesByCategory = computed(() => {
    const categories = {}
    const filteredExpenses = getExpensesByPeriod()
    
    filteredExpenses.forEach(expense => {
        const category = expense.category || 'Sin categoría'
        if (!categories[category]) {
            categories[category] = {
                name: category,
                total: 0,
                count: 0,
                expenses: []
            }
        }
        categories[category].total += expense.amount
        categories[category].count += 1
        categories[category].expenses.push(expense)
    })
    
    // Ordenar por total gastado
    return Object.values(categories).sort((a, b) => b.total - a.total)
})

// Computed para alertas y notificaciones
const alertsData = computed(() => {
    const alerts = []
    
    // Alertas de pagos pendientes
    if (pendingPayments.value.length > 0) {
        const totalOwed = pendingPayments.value.reduce((sum, payment) => sum + payment.amount, 0)
        alerts.push({
            type: 'warning',
            icon: '⚠️',
            title: 'Pagos pendientes',
            message: `Tienes ${pendingPayments.value.length} pagos pendientes por un total de ${formatMoney(totalOwed)}`,
            action: 'Ver pagos'
        })
    }
    
    // Alerta si no hay gastos en el período
    const periodExpenses = getExpensesByPeriod()
    if (periodExpenses.length === 0 && selectedPeriod.value !== 'all') {
        alerts.push({
            type: 'info',
            icon: '📊',
            title: 'Sin actividad',
            message: `No hay gastos registrados en ${getPeriodLabel()}`,
            action: 'Añadir gasto'
        })
    }
    
    // Alerta si el balance está muy negativo
    if (userBalance.value < -100) {
        alerts.push({
            type: 'error',
            icon: '💸',
            title: 'Balance negativo alto',
            message: `Tu balance es ${formatMoney(userBalance.value)}. Considera saldar cuentas.`,
            action: 'Ver balances'
        })
    }
    
    // Nuevas alertas inteligentes
    
    // Alerta de gasto alto reciente
    const recentExpenses = periodExpenses.filter(expense => {
        const expenseDate = new Date(expense.date)
        const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        return expenseDate >= threeDaysAgo && expense.amount > 100
    })
    
    if (recentExpenses.length > 0) {
        const totalRecent = recentExpenses.reduce((sum, expense) => sum + expense.amount, 0)
        alerts.push({
            type: 'warning',
            icon: '🔥',
            title: 'Gastos altos recientes',
            message: `Has registrado ${recentExpenses.length} gastos altos en los últimos 3 días (${formatMoney(totalRecent)})`,
            action: 'Revisar gastos'
        })
    }
    
    // Alerta de categoría dominante
    if (expensesByCategory.value.length > 0) {
        const topCategory = expensesByCategory.value[0]
        const totalPeriod = expensesByCategory.value.reduce((sum, cat) => sum + cat.total, 0)
        const percentage = (topCategory.total / totalPeriod) * 100
        
        if (percentage > 60 && expensesByCategory.value.length > 1) {
            alerts.push({
                type: 'info',
                icon: '📈',
                title: 'Categoría dominante',
                message: `El ${Math.round(percentage)}% de tus gastos son de "${topCategory.name}". Considera diversificar.`,
                action: 'Ver categorías'
            })
        }
    }
    
    // Alerta de deudas antiguas
    const oldDebts = peopleWhoOweMe.value.filter(debt => {
        return debt.expenses.some(expense => {
            const expenseDate = new Date(expense.date)
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            return expenseDate < thirtyDaysAgo
        })
    })
    
    if (oldDebts.length > 0) {
        const totalOldDebt = oldDebts.reduce((sum, debt) => sum + debt.amount, 0)
        alerts.push({
            type: 'warning',
            icon: '⏰',
            title: 'Deudas antiguas',
            message: `Tienes ${formatMoney(totalOldDebt)} en deudas de más de 30 días. Considera enviar recordatorios.`,
            action: 'Enviar recordatorios'
        })
    }
    
    // Alerta de usuario más activo
    const userActivity = {}
    periodExpenses.forEach(expense => {
        const userId = expense.paidBy
        userActivity[userId] = (userActivity[userId] || 0) + 1
    })
    
    const mostActiveUser = Object.entries(userActivity)
        .sort(([,a], [,b]) => b - a)[0]
    
    if (mostActiveUser && mostActiveUser[1] > periodExpenses.length * 0.5 && periodExpenses.length > 3) {
        alerts.push({
            type: 'info',
            icon: '👑',
            title: 'Usuario más activo',
            message: `${getUserName(parseInt(mostActiveUser[0]))} ha pagado ${mostActiveUser[1]} de ${periodExpenses.length} gastos`,
            action: 'Ver estadísticas'
        })
    }
    
    // Alerta de ahorro potencial
    if (periodExpenses.length > 5) {
        const averageExpense = periodExpenses.reduce((sum, exp) => sum + exp.amount, 0) / periodExpenses.length
        const smallExpenses = periodExpenses.filter(exp => exp.amount < averageExpense * 0.3)
        
        if (smallExpenses.length > periodExpenses.length * 0.4) {
            const totalSmall = smallExpenses.reduce((sum, exp) => sum + exp.amount, 0)
            alerts.push({
                type: 'info',
                icon: '💡',
                title: 'Oportunidad de ahorro',
                message: `Tienes ${smallExpenses.length} gastos pequeños (${formatMoney(totalSmall)}). Considera agruparlos.`,
                action: 'Optimizar gastos'
            })
        }
    }
    
    // Alertas de presupuesto
    if (selectedDineroId.value) {
        const budgetProgress = budgetStore.getAllBudgetProgress(selectedDineroId.value, periodExpenses)
        
        budgetProgress.forEach(progress => {
            if (progress.isOverBudget) {
                alerts.push({
                    type: 'error',
                    icon: '🚨',
                    title: 'Presupuesto excedido',
                    message: `Has excedido el presupuesto de "${progress.budget.category}" por ${formatMoney(progress.spent - progress.budget.amount)}`,
                    action: 'Ver presupuestos'
                })
            } else if (progress.isNearLimit) {
                alerts.push({
                    type: 'warning',
                    icon: '⚠️',
                    title: 'Cerca del límite',
                    message: `Has usado el ${Math.round(progress.percentage)}% del presupuesto de "${progress.budget.category}"`,
                    action: 'Ver presupuestos'
                })
            }
        })
    }
    
    return alerts.slice(0, 5) // Limitar a 5 alertas máximo
})

const hasAlerts = computed(() => alertsData.value.length > 0)

// Computed para presupuestos detallados
const activeBudgets = computed(() => {
    if (!selectedDineroId.value) return []
    return budgetStore.getBudgetsByDinero(selectedDineroId.value)
})

const budgetProgressData = computed(() => {
    if (!selectedDineroId.value || activeBudgets.value.length === 0) return []
    
    const periodExpenses = getExpensesByPeriod()
    return budgetStore.getAllBudgetProgress(selectedDineroId.value, periodExpenses)
        .sort((a, b) => {
            // Ordenar por: excedidos primero, luego cerca del límite, luego por porcentaje descendente
            if (a.isOverBudget && !b.isOverBudget) return -1
            if (!a.isOverBudget && b.isOverBudget) return 1
            if (a.isNearLimit && !b.isNearLimit) return -1
            if (!a.isNearLimit && b.isNearLimit) return 1
            return b.percentage - a.percentage
        })
})

const totalBudgeted = computed(() => {
    return activeBudgets.value.reduce((sum, budget) => sum + budget.amount, 0)
})

const totalSpentInBudgets = computed(() => {
    return budgetProgressData.value.reduce((sum, progress) => sum + progress.spent, 0)
})

// Computed para deudas específicas
const peopleWhoOweMe = computed(() => {
    if (!currentUser.value) return []
    
    const selectedDineroId = contextStore.getSelectedDineroId
    if (!selectedDineroId) return []
    
    const debts = []
    const expensesByDinero = expenseStore.getExpensesByDinero(selectedDineroId)
    
    // Agrupar por usuario las deudas hacia mí
    const debtsByUser = {}
    
    expensesByDinero.forEach(expense => {
        // Solo considerar gastos que yo pagué
        if (expense.paidBy !== currentUser.value.id) return
        
        expense.splits?.forEach(split => {
            const userId = parseInt(split.userId)
            const amount = parseFloat(split.amount)
            
            // Solo considerar otros usuarios que no han pagado
            if (userId !== currentUser.value.id) {
                const hasPaid = expense.payments && expense.payments[userId]
                if (!hasPaid) {
                    if (!debtsByUser[userId]) {
                        debtsByUser[userId] = {
                            userId,
                            amount: 0,
                            expenseCount: 0,
                            expenses: []
                        }
                    }
                    debtsByUser[userId].amount += amount
                    debtsByUser[userId].expenseCount += 1
                    debtsByUser[userId].expenses.push(expense)
                }
            }
        })
    })
    
    return Object.values(debtsByUser)
        .filter(debt => debt.amount > 0)
        .sort((a, b) => b.amount - a.amount)
})

const peopleIOwe = computed(() => {
    if (!currentUser.value) return []
    
    const selectedDineroId = contextStore.getSelectedDineroId
    if (!selectedDineroId) return []
    
    const debts = []
    const expensesByDinero = expenseStore.getExpensesByDinero(selectedDineroId)
    
    // Agrupar por usuario las deudas que tengo
    const debtsByUser = {}
    
    expensesByDinero.forEach(expense => {
        // Solo considerar gastos que otros pagaron y yo participé
        if (expense.paidBy === currentUser.value.id) return
        
        expense.splits?.forEach(split => {
            const userId = parseInt(split.userId)
            const amount = parseFloat(split.amount)
            
            // Solo mi parte de la deuda
            if (userId === currentUser.value.id) {
                const hasPaid = expense.payments && expense.payments[currentUser.value.id]
                if (!hasPaid) {
                    const payerId = expense.paidBy
                    if (!debtsByUser[payerId]) {
                        debtsByUser[payerId] = {
                            userId: payerId,
                            amount: 0,
                            expenseCount: 0,
                            expenses: []
                        }
                    }
                    debtsByUser[payerId].amount += amount
                    debtsByUser[payerId].expenseCount += 1
                    debtsByUser[payerId].expenses.push(expense)
                }
            }
        })
    })
    
    return Object.values(debtsByUser)
        .filter(debt => debt.amount > 0)
        .sort((a, b) => b.amount - a.amount)
})

// Methods
const getUserName = (userId) => {
    const user = userStore.getUserById(userId)
    return user ? user.name : 'Usuario desconocido'
}

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

const getExpensesByPeriod = () => {
    const now = new Date()
    const selectedDineroId = contextStore.getSelectedDineroId
    
    if (!selectedDineroId) return []
    
    const allExpenses = expenseStore.getExpensesByDinero(selectedDineroId) || []
    
    if (selectedPeriod.value === 'all') {
        return allExpenses
    }
    
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
    })
}

const getPeriodLabel = () => {
    switch (selectedPeriod.value) {
        case 'week': return 'esta semana'
        case 'month': return 'este mes'
        case 'year': return 'este año'
        case 'all': return 'todo el tiempo'
        default: return 'el período seleccionado'
    }
}

const getCategoryIcon = (category) => {
    const icons = {
        'Comida': '🍽️',
        'Transporte': '🚗',
        'Alojamiento': '🏠',
        'Entretenimiento': '🎉',
        'Compras': '🛒',
        'Otros': '📦',
        'Sin categoría': '❓'
    }
    return icons[category] || '📦'
}

const onExpenseAdded = async () => {
    showAddExpenseModal.value = false
    alertStore.success('Gasto añadido correctamente')
    
    // Refrescar los datos
    await expenseStore.fetchExpenses()
}

const markPaymentAsPaid = async (expenseId) => {
    if (!currentUser.value) return
    
    try {
        await expenseStore.markUserPayment(expenseId, currentUser.value.id, true)
        alertStore.success('Pago marcado como pagado')
        console.log('markPaymentAsPaid')
    } catch (error) {
        alertStore.error('Error al marcar el pago')
    }
}

const sendReminder = async (userId, amount) => {
    const userName = getUserName(userId)
    alertStore.info(`Recordatorio enviado a ${userName} por ${formatMoney(amount)}`)
    console.log('sendReminder', { userId, amount, userName })
}

const payDebt = async (creditorId, amount) => {
    const creditorName = getUserName(creditorId)
    
    // Buscar todos los gastos donde debo dinero a esta persona
    const selectedDineroId = contextStore.getSelectedDineroId
    if (!selectedDineroId) return
    
    const expensesByDinero = expenseStore.getExpensesByDinero(selectedDineroId)
    const expensesToPay = []
    
    expensesByDinero.forEach(expense => {
        if (expense.paidBy === creditorId && expense.participants?.includes(currentUser.value.id)) {
            const hasPaid = expense.payments && expense.payments[currentUser.value.id]
            if (!hasPaid) {
                expensesToPay.push(expense.id)
            }
        }
    })
    
    try {
        // Marcar todos los gastos relevantes como pagados
        for (const expenseId of expensesToPay) {
            await expenseStore.markUserPayment(expenseId, currentUser.value.id, true)
        }
        
        alertStore.success(`Has pagado ${formatMoney(amount)} a ${creditorName}`)
        console.log('payDebt', { creditorId, amount, creditorName, expensesCount: expensesToPay.length })
    } catch (error) {
        alertStore.error('Error al procesar el pago')
        console.error('Error paying debt:', error)
    }
}

// Métodos para presupuestos
const showCategoryExpenses = (category) => {
    // Navegar a la página de gastos filtrada por categoría
    navigateTo(`/expenses?category=${encodeURIComponent(category)}`)
    console.log('showCategoryExpenses', { category })
}

const editBudget = (budget) => {
    // Abrir el modal de presupuestos con el presupuesto seleccionado para editar
    showBudgetModal.value = true
    // Aquí podrías pasar el budget al modal si el componente lo soporta
    console.log('editBudget', { budget })
}

// Funciones de exportación y reportes
const exportToCSV = () => {
    const periodExpenses = getExpensesByPeriod()
    if (periodExpenses.length === 0) {
        alertStore.warning('No hay gastos para exportar en el período seleccionado')
        return
    }
    
    // Crear headers del CSV
    const headers = ['Fecha', 'Título', 'Categoría', 'Monto', 'Pagado por', 'Participantes', 'Estado']
    
    // Crear filas de datos
    const rows = periodExpenses.map(expense => {
        const participants = expense.participants?.map(id => getUserName(id)).join('; ') || 'Sin participantes'
        const isPaid = expense.payments && Object.keys(expense.payments).length > 0 ? 'Parcialmente pagado' : 'Pendiente'
        
        return [
            formatDate(expense.date),
            expense.title || 'Sin título',
            expense.category || 'Sin categoría',
            expense.amount.toString().replace('.', ','), // Formato español
            getUserName(expense.paidBy),
            participants,
            isPaid
        ]
    })
    
    // Combinar headers y datos
    const csvContent = [headers, ...rows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n')
    
    // Crear y descargar archivo
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `gastos_${selectedDinero.value?.name || 'general'}_${getPeriodLabel().replace(' ', '_')}.csv`)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    alertStore.success(`Exportados ${periodExpenses.length} gastos a CSV`)
    console.log('exportToCSV', { periodExpenses: periodExpenses.length })
}

const generateReport = () => {
    const periodExpenses = getExpensesByPeriod()
    if (periodExpenses.length === 0) {
        alertStore.warning('No hay gastos para generar reporte en el período seleccionado')
        return
    }
    
    // Calcular estadísticas para el reporte
    const totalAmount = periodExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    const averageExpense = totalAmount / periodExpenses.length
    const categoriesStats = expensesByCategory.value
    const userStats = {}
    
    // Estadísticas por usuario
    periodExpenses.forEach(expense => {
        const paidBy = getUserName(expense.paidBy)
        if (!userStats[paidBy]) {
            userStats[paidBy] = { count: 0, total: 0 }
        }
        userStats[paidBy].count++
        userStats[paidBy].total += expense.amount
    })
    
    // Crear contenido HTML del reporte optimizado para PDF
    const reportHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Reporte de Gastos - ${selectedDinero.value?.name || 'General'}</title>
        <style>
            @page {
                margin: 20mm;
                size: A4;
            }
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                margin: 0; 
                padding: 0;
                color: #3C3C3C; 
                line-height: 1.6;
                font-size: 12px;
            }
            .header { 
                text-align: center; 
                margin-bottom: 30px; 
                border-bottom: 3px solid #3A7CA5; 
                padding-bottom: 20px; 
                page-break-inside: avoid;
            }
            .header h1 {
                color: #3A7CA5;
                margin: 0 0 10px 0;
                font-size: 28px;
                font-weight: bold;
            }
            .header h2 {
                color: #3C3C3C;
                margin: 0 0 15px 0;
                font-size: 20px;
                font-weight: normal;
            }
            .header p {
                margin: 5px 0;
                color: #666;
                font-size: 11px;
            }
            .summary { 
                display: grid; 
                grid-template-columns: repeat(2, 1fr); 
                gap: 15px; 
                margin-bottom: 30px;
                page-break-inside: avoid;
            }
            .stat-card { 
                background: linear-gradient(135deg, #F6F5F2 0%, #FFFFFF 100%); 
                padding: 20px; 
                border-radius: 12px; 
                border-left: 6px solid #A8E000;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                text-align: center;
            }
            .stat-value { 
                font-size: 24px; 
                font-weight: bold; 
                color: #3A7CA5; 
                margin-bottom: 8px;
                display: block;
            }
            .stat-label {
                color: #666;
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                font-weight: 600;
            }
            .section { 
                margin-bottom: 35px; 
                page-break-inside: avoid;
            }
            .section h2 { 
                color: #3A7CA5; 
                border-bottom: 2px solid #A9D6E5; 
                padding-bottom: 8px; 
                margin-bottom: 20px;
                font-size: 18px;
                font-weight: 600;
            }
            table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-top: 10px;
                background: white;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            th, td { 
                padding: 12px 10px; 
                text-align: left; 
                border-bottom: 1px solid #E1E5E9;
                font-size: 11px;
            }
            th { 
                background: linear-gradient(135deg, #3A7CA5 0%, #3C3C3C 100%); 
                color: white; 
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.3px;
                font-size: 10px;
            }
            tr:nth-child(even) {
                background-color: #F6F5F2;
            }
            tr:hover {
                background-color: #FFFFFF;
            }
            .amount {
                font-weight: 600;
                color: #3A7CA5;
            }
            .percentage {
                background: linear-gradient(135deg, #A8E000 0%, #A9D6E5 100%);
                color: white;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 10px;
                font-weight: 600;
            }
            .footer {
                margin-top: 50px; 
                text-align: center; 
                color: #999; 
                font-size: 10px;
                border-top: 1px solid #E1E5E9;
                padding-top: 20px;
                page-break-inside: avoid;
            }
            .category-icon {
                font-size: 14px;
                margin-right: 8px;
            }
            .user-badge {
                background: linear-gradient(135deg, #A9D6E5 0%, #3A7CA5 100%);
                color: white;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 10px;
                font-weight: 600;
                display: inline-block;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>📊 Reporte de Gastos Compartidos</h1>
            <h2>${selectedDinero.value?.name || 'Gastos Generales'}</h2>
            <p><strong>Período de análisis:</strong> ${getPeriodLabel()}</p>
            <p><strong>Fecha de generación:</strong> ${new Date().toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })}</p>
        </div>
        
        <div class="summary">
            <div class="stat-card">
                <span class="stat-value">${periodExpenses.length}</span>
                <div class="stat-label">Total de gastos</div>
            </div>
            <div class="stat-card">
                <span class="stat-value">${formatMoney(totalAmount)}</span>
                <div class="stat-label">Monto total</div>
            </div>
            <div class="stat-card">
                <span class="stat-value">${formatMoney(averageExpense)}</span>
                <div class="stat-label">Promedio por gasto</div>
            </div>
            <div class="stat-card">
                <span class="stat-value">${categoriesStats.length}</span>
                <div class="stat-label">Categorías activas</div>
            </div>
        </div>
        
        <div class="section">
            <h2>💰 Análisis por Categorías</h2>
            <table>
                <thead>
                    <tr>
                        <th>Categoría</th>
                        <th>Cantidad</th>
                        <th>Monto Total</th>
                        <th>Porcentaje</th>
                        <th>Promedio</th>
                    </tr>
                </thead>
                <tbody>
                    ${categoriesStats.map(category => `
                        <tr>
                            <td>
                                <span class="category-icon">${getCategoryIcon(category.name)}</span>
                                ${category.name}
                            </td>
                            <td>${category.count} gastos</td>
                            <td class="amount">${formatMoney(category.total)}</td>
                            <td><span class="percentage">${Math.round((category.total / totalAmount) * 100)}%</span></td>
                            <td class="amount">${formatMoney(category.total / category.count)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <div class="section">
            <h2>👥 Análisis por Usuario</h2>
            <table>
                <thead>
                    <tr>
                        <th>Usuario</th>
                        <th>Gastos Pagados</th>
                        <th>Monto Total</th>
                        <th>Promedio</th>
                        <th>Participación</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.entries(userStats)
                        .sort(([,a], [,b]) => b.total - a.total)
                        .map(([user, stats]) => `
                        <tr>
                            <td><span class="user-badge">${user}</span></td>
                            <td>${stats.count} gastos</td>
                            <td class="amount">${formatMoney(stats.total)}</td>
                            <td class="amount">${formatMoney(stats.total / stats.count)}</td>
                            <td><span class="percentage">${Math.round((stats.total / totalAmount) * 100)}%</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <div class="section">
            <h2>📋 Detalle Completo de Gastos</h2>
            <table>
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Descripción</th>
                        <th>Categoría</th>
                        <th>Monto</th>
                        <th>Pagado por</th>
                        <th>Participantes</th>
                    </tr>
                </thead>
                <tbody>
                    ${periodExpenses
                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                        .map(expense => `
                        <tr>
                            <td>${formatDate(expense.date)}</td>
                            <td><strong>${expense.title || 'Sin título'}</strong></td>
                            <td>
                                <span class="category-icon">${getCategoryIcon(expense.category)}</span>
                                ${expense.category || 'Sin categoría'}
                            </td>
                            <td class="amount">${formatMoney(expense.amount)}</td>
                            <td><span class="user-badge">${getUserName(expense.paidBy)}</span></td>
                            <td style="font-size: 10px;">${expense.participants?.map(id => getUserName(id)).join(', ') || 'Sin participantes'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <div class="footer">
            <p><strong>Dame mi dinero</strong> - Sistema de gestión de gastos compartidos</p>
            <p>Reporte generado automáticamente el ${new Date().toLocaleString('es-ES')}</p>
            <p>Total de registros procesados: ${periodExpenses.length} • Período: ${getPeriodLabel()}</p>
        </div>
    </body>
    </html>
    `
    
    // Crear ventana temporal para imprimir como PDF
    const printWindow = window.open('', '_blank')
    printWindow.document.write(reportHTML)
    printWindow.document.close()
    
    // Esperar a que se cargue y luego abrir el diálogo de impresión
    printWindow.addEventListener('load', () => {
        // Configurar el título del documento
        printWindow.document.title = `Reporte_Gastos_${selectedDinero.value?.name || 'General'}_${getPeriodLabel().replace(' ', '_')}`
        
        // Pequeña pausa para asegurar que todo esté renderizado
        setTimeout(() => {
            printWindow.print()
            
            // Cerrar la ventana después de la impresión
            printWindow.addEventListener('afterprint', () => {
                printWindow.close()
            })
        }, 500)
    })
    
    alertStore.success('Reporte PDF preparado - Se abrirá el diálogo de impresión')
    console.log('generateReport', { periodExpenses: periodExpenses.length, totalAmount, categoriesStats: categoriesStats.length })
}

// Manejar acciones de alertas
const handleAlertAction = (alert) => {
    switch (alert.action) {
        case 'Añadir gasto':
            showAddExpenseModal.value = true
            break
        case 'Ver presupuestos':
            showBudgetModal.value = true
            break
        case 'Ver balances':
            navigateTo('/balances')
            break
        case 'Ver gastos':
        case 'Ver pagos':
        case 'Revisar gastos':
            navigateTo('/expenses')
            break
        case 'Ver categorías':
            // Scroll hasta la sección de estadísticas por categoría
            const categorySection = document.querySelector('[data-category-section]')
            if (categorySection) {
                categorySection.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
            break
        case 'Ver estadísticas':
            // Scroll hasta la sección de gastos por categoría
            const statsSection = document.querySelector('[data-category-section]')
            if (statsSection) {
                statsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
            break
        case 'Optimizar gastos':
            navigateTo('/expenses')
            break
        case 'Enviar recordatorios':
            // Scroll hasta la sección de balances
            const balanceSection = document.querySelector('[data-balance-section]')
            if (balanceSection) {
                balanceSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
            break
        default:
            console.log('Alert action:', alert.action)
    }
}

// Cargar datos al montar el componente
onMounted(async () => {
    console.log('Dashboard: Loading data...')
    
    try {
        // 1. Cargar dineros primero
        console.log('1. Loading dineros...')
        await dineroStore.initializeDineros()
        
        // 2. Inicializar contexto con dinero seleccionado
        console.log('2. Initializing context...')
        await contextStore.initializeSelectedDinero()
        
        // 3. Cargar usuarios
        console.log('3. Loading users...')
        if (userStore.users.length === 0) {
            await userStore.initializeUsers()
        }
        
        // 4. Cargar y migrar gastos
        console.log('4. Loading and migrating expenses...')
        if (expenseStore.expenses.length === 0) {
            await expenseStore.initializeExpenses()
        }
        
        // 5. Inicializar presupuestos
        console.log('5. Loading budgets...')
        await budgetStore.initializeBudgets()
        
        console.log('Dashboard: Data loaded. Selected dinero:', contextStore.getSelectedDineroId)
        console.log('Total expenses in store:', expenseStore.getAllExpenses.length)
    } catch (error) {
        console.error('Error al cargar datos:', error)
        alertStore.error('Error al cargar los datos')
    }
})

// Watcher para refrescar gastos cuando cambien los usuarios
watch(() => userStore.users.length, async (newLength) => {
    if (newLength > 0 && expenseStore.expenses.length === 0) {
        await expenseStore.initializeExpenses()
    }
})

// Watcher para refrescar cuando cambie el dinero seleccionado
watch(() => contextStore.getSelectedDineroId, async (newDineroId, oldDineroId) => {
    if (newDineroId !== oldDineroId) {
        console.log('Dinero changed in dashboard:', { oldDineroId, newDineroId })
        // Los datos se actualizarán automáticamente a través de los computed
    }
}, { immediate: true })

// Watcher para el período seleccionado
watch(selectedPeriod, (newPeriod, oldPeriod) => {
    console.log('Period changed from', oldPeriod, 'to', newPeriod)
    // Los computed se actualizarán automáticamente, incluyendo budgetProgressData
})

// Watcher para cambios en presupuestos
watch(() => budgetStore.budgets, () => {
    console.log('Budgets updated, refreshing progress data')
}, { deep: true })

console.log('dashboard')
</script>