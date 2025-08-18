<template>
    <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
        <div class="bg-blanco-dividido rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-azul-claro-viaje/20">
            <!-- Header -->
            <div class="flex items-center justify-between p-6 border-b border-azul-claro-viaje/20 bg-gradient-to-r from-lima-compartida/5 to-azul-claro-viaje/5">
                <div>
                    <h2 class="text-xl font-bold text-gris-billetera flex items-center gap-2">
                        <span class="text-lima-compartida">🤝</span>
                        Gasto compartido
                    </h2>
                    <p class="text-sm text-gray-600 mt-1">Divide el gasto entre varios participantes</p>
                    <div v-if="selectedDinero" class="flex items-center gap-2 mt-2">
                        <div 
                            class="w-3 h-3 rounded-full shadow-sm" 
                            :style="{ backgroundColor: selectedDinero.color }"
                        ></div>
                        <span class="text-xs text-gray-600 font-medium">Se añadirá a: {{ selectedDinero.name }}</span>
                    </div>
                </div>
                <button 
                    @click="$emit('close')"
                    class="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 p-2"
                >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>

            <!-- Form -->
            <form @submit.prevent="submitSplitExpense" class="p-6 space-y-6">
                <!-- Información básica del gasto -->
                <div class="bg-marfil-mapamundi/30 p-4 rounded-xl border border-azul-claro-viaje/20">
                    <h3 class="font-semibold text-gris-billetera mb-4 flex items-center gap-2">
                        <span class="text-azul-tiquet">📋</span>
                        Información del gasto
                        <button
                            type="button"
                            @click="showCalculator = !showCalculator"
                            class="ml-auto px-3 py-1 text-xs bg-lima-compartida text-gris-billetera rounded-lg hover:bg-lima-compartida/90 transition-all duration-200 flex items-center gap-1"
                        >
                            <span>🧮</span>
                            {{ showCalculator ? 'Ocultar' : 'Mostrar' }} calculadora
                        </button>
                    </h3>
                    
                    <!-- Título -->
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gris-billetera mb-2">
                            Título del gasto
                        </label>
                        <input
                            v-model="formData.title"
                            type="text"
                            required
                            placeholder="Ej: Cena en el restaurante"
                            class="w-full px-3 py-2 text-sm border border-azul-claro-viaje/30 rounded-lg focus:ring-2 focus:ring-azul-tiquet focus:border-azul-tiquet bg-blanco-dividido transition-all duration-200"
                        >
                    </div>

                    <!-- Gasto recurrente -->
                    <div class="mb-4 flex items-center gap-2">
                        <input
                            id="recurrent-checkbox"
                            type="checkbox"
                            v-model="formData.isRecurring"
                            class="w-4 h-4 text-lima-compartida bg-gray-100 border-gray-300 rounded focus:ring-lima-compartida focus:ring-2"
                        >
                        <label for="recurrent-checkbox" class="text-sm font-medium text-gris-billetera select-none">
                            Gasto recurrente (se repetirá cada mes)
                        </label>
                    </div>

                    <!-- Cantidad total -->
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gris-billetera mb-2">
                            Cantidad total
                        </label>
                        <div class="relative">
                            <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                            <input
                                v-model="formData.amount"
                                type="number"
                                step="0.01"
                                min="0"
                                required
                                placeholder="0.00"
                                class="w-full pl-8 pr-3 py-2 text-sm border border-azul-claro-viaje/30 rounded-lg focus:ring-2 focus:ring-azul-tiquet focus:border-azul-tiquet bg-blanco-dividido transition-all duration-200"
                                @input="calculateSplits"
                            >
                        </div>
                    </div>

                    <!-- Calculadora -->
                    <div v-if="showCalculator" class="mb-4 p-4 bg-blanco-dividido border border-azul-claro-viaje/30 rounded-lg">
                        <h4 class="text-sm font-medium text-gris-billetera mb-3 flex items-center gap-2">
                            <span>🧮</span>
                            Calculadora
                        </h4>
                        
                        <!-- Display de la calculadora -->
                        <div class="mb-3">
                            <div class="w-full p-3 bg-gris-billetera text-blanco-dividido text-right text-lg font-mono rounded-lg border">
                                {{ calculatorDisplay }}
                            </div>
                        </div>
                        
                        <!-- Botones de la calculadora -->
                        <div class="grid grid-cols-4 gap-2">
                            <!-- Primera fila -->
                            <button type="button" @click="clearCalculator" class="p-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors">C</button>
                            <button type="button" @click="appendToCalculator('/')" class="p-3 bg-azul-tiquet hover:bg-azul-tiquet/90 text-white rounded-lg font-semibold transition-colors">÷</button>
                            <button type="button" @click="appendToCalculator('*')" class="p-3 bg-azul-tiquet hover:bg-azul-tiquet/90 text-white rounded-lg font-semibold transition-colors">×</button>
                            <button type="button" @click="deleteLast" class="p-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold transition-colors">⌫</button>
                            
                            <!-- Segunda fila -->
                            <button type="button" @click="appendToCalculator('7')" class="p-3 bg-marfil-mapamundi hover:bg-azul-claro-viaje/20 text-gris-billetera rounded-lg font-semibold transition-colors border border-azul-claro-viaje/30">7</button>
                            <button type="button" @click="appendToCalculator('8')" class="p-3 bg-marfil-mapamundi hover:bg-azul-claro-viaje/20 text-gris-billetera rounded-lg font-semibold transition-colors border border-azul-claro-viaje/30">8</button>
                            <button type="button" @click="appendToCalculator('9')" class="p-3 bg-marfil-mapamundi hover:bg-azul-claro-viaje/20 text-gris-billetera rounded-lg font-semibold transition-colors border border-azul-claro-viaje/30">9</button>
                            <button type="button" @click="appendToCalculator('-')" class="p-3 bg-azul-tiquet hover:bg-azul-tiquet/90 text-white rounded-lg font-semibold transition-colors">−</button>
                            
                            <!-- Tercera fila -->
                            <button type="button" @click="appendToCalculator('4')" class="p-3 bg-marfil-mapamundi hover:bg-azul-claro-viaje/20 text-gris-billetera rounded-lg font-semibold transition-colors border border-azul-claro-viaje/30">4</button>
                            <button type="button" @click="appendToCalculator('5')" class="p-3 bg-marfil-mapamundi hover:bg-azul-claro-viaje/20 text-gris-billetera rounded-lg font-semibold transition-colors border border-azul-claro-viaje/30">5</button>
                            <button type="button" @click="appendToCalculator('6')" class="p-3 bg-marfil-mapamundi hover:bg-azul-claro-viaje/20 text-gris-billetera rounded-lg font-semibold transition-colors border border-azul-claro-viaje/30">6</button>
                            <button type="button" @click="appendToCalculator('+')" class="p-3 bg-azul-tiquet hover:bg-azul-tiquet/90 text-white rounded-lg font-semibold transition-colors">+</button>
                            
                            <!-- Cuarta fila -->
                            <button type="button" @click="appendToCalculator('1')" class="p-3 bg-marfil-mapamundi hover:bg-azul-claro-viaje/20 text-gris-billetera rounded-lg font-semibold transition-colors border border-azul-claro-viaje/30">1</button>
                            <button type="button" @click="appendToCalculator('2')" class="p-3 bg-marfil-mapamundi hover:bg-azul-claro-viaje/20 text-gris-billetera rounded-lg font-semibold transition-colors border border-azul-claro-viaje/30">2</button>
                            <button type="button" @click="appendToCalculator('3')" class="p-3 bg-marfil-mapamundi hover:bg-azul-claro-viaje/20 text-gris-billetera rounded-lg font-semibold transition-colors border border-azul-claro-viaje/30">3</button>
                            <button type="button" @click="calculate" class="row-span-2 p-3 bg-lima-compartida hover:bg-lima-compartida/90 text-gris-billetera rounded-lg font-semibold transition-colors">=</button>
                            
                            <!-- Quinta fila -->
                            <button type="button" @click="appendToCalculator('0')" class="col-span-2 p-3 bg-marfil-mapamundi hover:bg-azul-claro-viaje/20 text-gris-billetera rounded-lg font-semibold transition-colors border border-azul-claro-viaje/30">0</button>
                            <button type="button" @click="appendToCalculator('.')" class="p-3 bg-marfil-mapamundi hover:bg-azul-claro-viaje/20 text-gris-billetera rounded-lg font-semibold transition-colors border border-azul-claro-viaje/30">.</button>
                        </div>
                        
                        <!-- Botón para usar resultado -->
                        <button
                            v-if="calculatorDisplay !== '0' && !isNaN(parseFloat(calculatorDisplay))"
                            type="button"
                            @click="useCalculatorResult"
                            class="w-full mt-3 p-2 bg-azul-claro-viaje hover:bg-azul-tiquet text-white rounded-lg text-sm font-semibold transition-colors"
                        >
                            Usar resultado ({{ calculatorDisplay }}€)
                        </button>
                    </div>

                    <!-- Categoría -->
                    <div>
                        <label class="block text-sm font-medium text-gris-billetera mb-2">
                            Categoría
                        </label>
                        <select
                            v-model="formData.category"
                            required
                            class="w-full px-3 py-2 text-sm border border-azul-claro-viaje/30 rounded-lg focus:ring-2 focus:ring-azul-tiquet focus:border-azul-tiquet bg-blanco-dividido transition-all duration-200"
                        >
                            <option value="">Selecciona una categoría</option>
                            <option value="comida">🍽️ Comida</option>
                            <option value="transporte">🚗 Transporte</option>
                            <option value="entretenimiento">🎉 Entretenimiento</option>
                            <option value="compras">🛍️ Compras</option>
                            <option value="viajes">✈️ Viajes</option>
                            <option value="casa">🏠 Casa</option>
                            <option value="otros">📦 Otros</option>
                        </select>
                    </div>
                </div>

                <!-- Quién pagó -->
                <div class="bg-azul-claro-viaje/10 p-4 rounded-xl border border-azul-claro-viaje/20">
                    <h3 class="font-semibold text-gris-billetera mb-3 flex items-center gap-2">
                        <span class="text-azul-tiquet">💳</span>
                        ¿Quién pagó?
                    </h3>
                    <select
                        v-model="formData.paidBy"
                        required
                        class="w-full px-3 py-2 text-sm border border-azul-claro-viaje/30 rounded-lg focus:ring-2 focus:ring-azul-tiquet focus:border-azul-tiquet bg-blanco-dividido transition-all duration-200"
                    >
                        <option value="">Selecciona quién pagó</option>
                        <option v-for="user in users" :key="user.id" :value="user.id">
                            {{ user.name }}
                        </option>
                    </select>
                </div>

                <!-- Participantes -->
                <div class="bg-lima-compartida/10 p-4 rounded-xl border border-lima-compartida/20">
                    <div class="flex items-center justify-between mb-3">
                        <h3 class="font-semibold text-gris-billetera flex items-center gap-2">
                            <span class="text-lima-compartida">👥</span>
                            Participantes ({{ formData.participants.length }})
                        </h3>
                        <button
                            type="button"
                            @click="selectAllParticipants"
                            class="text-xs text-azul-tiquet hover:text-azul-tiquet/80 font-medium transition-colors duration-200"
                        >
                            {{ formData.participants.length === users.length ? 'Desmarcar todos' : 'Seleccionar todos' }}
                        </button>
                    </div>
                    
                    <!-- Botones de modo de división -->
                    <div v-if="formData.participants.length > 0" class="flex items-center gap-2 mb-3">
                        <span class="text-xs text-gray-600 mr-2">Modo:</span>
                        <button
                            type="button"
                            @click="splitMode = 'equal'"
                            :class="[
                                'px-3 py-1 text-xs font-medium rounded-lg transition-all duration-200',
                                splitMode === 'equal' 
                                    ? 'bg-lima-compartida text-gris-billetera' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            ]"
                        >
                            División equitativa
                        </button>
                        <button
                            type="button"
                            @click="splitMode = 'custom'"
                            :class="[
                                'px-3 py-1 text-xs font-medium rounded-lg transition-all duration-200',
                                splitMode === 'custom' 
                                    ? 'bg-lima-compartida text-gris-billetera' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            ]"
                        >
                            Cantidades personalizadas
                        </button>
                    </div>
                    
                    <div class="space-y-3">
                        <div
                            v-for="user in users"
                            :key="user.id"
                            class="p-3 bg-blanco-dividido rounded-lg border border-azul-claro-viaje/20 hover:border-lima-compartida/40 transition-all duration-200"
                            :class="{ 'border-lima-compartida ring-2 ring-lima-compartida/20': formData.participants.includes(user.id) }"
                        >
                            <div class="flex items-center gap-3 mb-2">
                                <input
                                    type="checkbox"
                                    :value="user.id"
                                    :checked="formData.participants.includes(user.id)"
                                    @change="toggleParticipant(user.id)"
                                    class="w-4 h-4 text-lima-compartida bg-gray-100 border-gray-300 rounded focus:ring-lima-compartida focus:ring-2"
                                >
                                <span class="font-medium text-gris-billetera flex-1">{{ user.name }}</span>
                                
                                <!-- Mostrar cantidad automática o personalizada -->
                                <div v-if="formData.participants.includes(user.id)" class="text-right">
                                    <div v-if="splitMode === 'equal'" class="text-lima-compartida font-bold">
                                        {{ formatMoney(splits[user.id] || 0) }}
                                    </div>
                                    <div v-else class="flex items-center gap-2">
                                        <div class="relative">
                                            <span class="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">€</span>
                                            <input
                                                v-model="customAmounts[user.id]"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                placeholder="0.00"
                                                class="w-20 pl-6 pr-2 py-1 text-xs border border-azul-claro-viaje/30 rounded-lg focus:ring-2 focus:ring-lima-compartida focus:border-lima-compartida bg-blanco-dividido transition-all duration-200"
                                            >
                                        </div>
                                        <button
                                            type="button"
                                            @click="togglePersonalCalculator(user.id)"
                                            class="p-1 text-xs bg-lima-compartida hover:bg-lima-compartida/90 text-gris-billetera rounded transition-colors"
                                            :title="`${showPersonalCalculator[user.id] ? 'Ocultar' : 'Mostrar'} calculadora para ${user.name}`"
                                        >
                                            🧮
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Calculadora personal -->
                            <div v-if="showPersonalCalculator[user.id] && formData.participants.includes(user.id) && splitMode === 'custom'" class="ml-7 mt-2 p-3 bg-blanco-dividido border border-azul-claro-viaje/30 rounded-lg">
                                <h5 class="text-xs font-medium text-gris-billetera mb-2 flex items-center gap-1">
                                    <span>🧮</span>
                                    Calculadora para {{ user.name }}
                                </h5>
                                
                                <!-- Display de la calculadora personal -->
                                <div class="mb-2">
                                    <div class="w-full p-2 bg-gris-billetera text-blanco-dividido text-right text-sm font-mono rounded border">
                                        {{ getPersonalCalculatorDisplay(user.id) }}
                                    </div>
                                </div>
                                
                                <!-- Botones de la calculadora personal (versión compacta) -->
                                <div class="grid grid-cols-4 gap-1">
                                    <!-- Primera fila -->
                                    <button type="button" @click="clearPersonalCalculator(user.id)" class="p-2 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-semibold transition-colors">C</button>
                                    <button type="button" @click="appendToPersonalCalculator(user.id, '/')" class="p-2 bg-azul-tiquet hover:bg-azul-tiquet/90 text-white rounded text-xs font-semibold transition-colors">÷</button>
                                    <button type="button" @click="appendToPersonalCalculator(user.id, '*')" class="p-2 bg-azul-tiquet hover:bg-azul-tiquet/90 text-white rounded text-xs font-semibold transition-colors">×</button>
                                    <button type="button" @click="deleteLastPersonal(user.id)" class="p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-xs font-semibold transition-colors">⌫</button>
                                    
                                    <!-- Segunda fila -->
                                    <button type="button" @click="appendToPersonalCalculator(user.id, '7')" class="p-2 bg-marfil-mapamundi hover:bg-azul-claro-viaje/20 text-gris-billetera rounded text-xs font-semibold transition-colors border border-azul-claro-viaje/30">7</button>
                                    <button type="button" @click="appendToPersonalCalculator(user.id, '8')" class="p-2 bg-marfil-mapamundi hover:bg-azul-claro-viaje/20 text-gris-billetera rounded text-xs font-semibold transition-colors border border-azul-claro-viaje/30">8</button>
                                    <button type="button" @click="appendToPersonalCalculator(user.id, '9')" class="p-2 bg-marfil-mapamundi hover:bg-azul-claro-viaje/20 text-gris-billetera rounded text-xs font-semibold transition-colors border border-azul-claro-viaje/30">9</button>
                                    <button type="button" @click="appendToPersonalCalculator(user.id, '-')" class="p-2 bg-azul-tiquet hover:bg-azul-tiquet/90 text-white rounded text-xs font-semibold transition-colors">−</button>
                                    
                                    <!-- Tercera fila -->
                                    <button type="button" @click="appendToPersonalCalculator(user.id, '4')" class="p-2 bg-marfil-mapamundi hover:bg-azul-claro-viaje/20 text-gris-billetera rounded text-xs font-semibold transition-colors border border-azul-claro-viaje/30">4</button>
                                    <button type="button" @click="appendToPersonalCalculator(user.id, '5')" class="p-2 bg-marfil-mapamundi hover:bg-azul-claro-viaje/20 text-gris-billetera rounded text-xs font-semibold transition-colors border border-azul-claro-viaje/30">5</button>
                                    <button type="button" @click="appendToPersonalCalculator(user.id, '6')" class="p-2 bg-marfil-mapamundi hover:bg-azul-claro-viaje/20 text-gris-billetera rounded text-xs font-semibold transition-colors border border-azul-claro-viaje/30">6</button>
                                    <button type="button" @click="appendToPersonalCalculator(user.id, '+')" class="p-2 bg-azul-tiquet hover:bg-azul-tiquet/90 text-white rounded text-xs font-semibold transition-colors">+</button>
                                    
                                    <!-- Cuarta fila -->
                                    <button type="button" @click="appendToPersonalCalculator(user.id, '1')" class="p-2 bg-marfil-mapamundi hover:bg-azul-claro-viaje/20 text-gris-billetera rounded text-xs font-semibold transition-colors border border-azul-claro-viaje/30">1</button>
                                    <button type="button" @click="appendToPersonalCalculator(user.id, '2')" class="p-2 bg-marfil-mapamundi hover:bg-azul-claro-viaje/20 text-gris-billetera rounded text-xs font-semibold transition-colors border border-azul-claro-viaje/30">2</button>
                                    <button type="button" @click="appendToPersonalCalculator(user.id, '3')" class="p-2 bg-marfil-mapamundi hover:bg-azul-claro-viaje/20 text-gris-billetera rounded text-xs font-semibold transition-colors border border-azul-claro-viaje/30">3</button>
                                    <button type="button" @click="calculatePersonal(user.id)" class="row-span-2 p-2 bg-lima-compartida hover:bg-lima-compartida/90 text-gris-billetera rounded text-xs font-semibold transition-colors">=</button>
                                    
                                    <!-- Quinta fila -->
                                    <button type="button" @click="appendToPersonalCalculator(user.id, '0')" class="col-span-2 p-2 bg-marfil-mapamundi hover:bg-azul-claro-viaje/20 text-gris-billetera rounded text-xs font-semibold transition-colors border border-azul-claro-viaje/30">0</button>
                                    <button type="button" @click="appendToPersonalCalculator(user.id, '.')" class="p-2 bg-marfil-mapamundi hover:bg-azul-claro-viaje/20 text-gris-billetera rounded text-xs font-semibold transition-colors border border-azul-claro-viaje/30">.</button>
                                </div>
                                
                                <!-- Botón para usar resultado personal -->
                                <button
                                    v-if="getPersonalCalculatorDisplay(user.id) !== '0' && !isNaN(parseFloat(getPersonalCalculatorDisplay(user.id)))"
                                    type="button"
                                    @click="usePersonalCalculatorResult(user.id)"
                                    class="w-full mt-2 p-2 bg-azul-claro-viaje hover:bg-azul-tiquet text-white rounded text-xs font-semibold transition-colors"
                                >
                                    Usar resultado ({{ getPersonalCalculatorDisplay(user.id) }}€)
                                </button>
                            </div>
                            
                            <!-- Descripción del modo -->
                            <div v-if="formData.participants.includes(user.id)" class="text-xs text-gray-500 ml-7">
                                <span v-if="splitMode === 'equal'">Parte equitativa</span>
                                <span v-else>Cantidad personalizada</span>
                            </div>
                        </div>
                    </div>

                    <div v-if="formData.participants.length === 0" class="text-center py-4 text-gray-500 text-sm">
                        Selecciona al menos un participante
                    </div>
                </div>

                <!-- Resumen del reparto -->
                <div v-if="formData.participants.length > 0 && formData.amount" class="bg-gradient-to-r from-azul-tiquet/5 to-lima-compartida/5 p-4 rounded-xl border border-azul-tiquet/20">
                    <h3 class="font-semibold text-gris-billetera mb-3 flex items-center gap-2">
                        <span class="text-azul-tiquet">📊</span>
                        Resumen del reparto
                    </h3>
                    
                    <div class="grid grid-cols-2 gap-4 text-center mb-3">
                        <div class="bg-blanco-dividido p-3 rounded-lg">
                            <p class="text-xs text-gray-600 mb-1">Total a dividir</p>
                            <p class="text-lg font-bold text-azul-tiquet">{{ formatMoney(formData.amount) }}</p>
                        </div>
                        <div class="bg-blanco-dividido p-3 rounded-lg">
                            <p class="text-xs text-gray-600 mb-1">{{ splitMode === 'equal' ? 'Promedio por persona' : 'Total asignado' }}</p>
                            <p class="text-lg font-bold text-lima-compartida">{{ formatMoney(splitMode === 'equal' ? averageAmount : totalCustomSplits) }}</p>
                        </div>
                    </div>

                    <!-- Verificación de cantidades personalizadas -->
                    <div v-if="splitMode === 'custom'" class="mb-3">
                        <div v-if="customSplitsDifference !== 0" class="p-3 rounded-lg border" :class="customSplitsDifference > 0 ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'">
                            <div class="flex items-center justify-between text-sm">
                                <span class="font-medium">
                                    {{ customSplitsDifference > 0 ? '⚠️ Falta asignar:' : '⚠️ Sobra:' }}
                                </span>
                                <span class="font-bold" :class="customSplitsDifference > 0 ? 'text-red-600' : 'text-yellow-600'">
                                    {{ formatMoney(Math.abs(customSplitsDifference)) }}
                                </span>
                            </div>
                        </div>
                        <div v-else class="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div class="flex items-center justify-center text-sm text-green-700">
                                <span class="font-medium">✅ Las cantidades coinciden perfectamente</span>
                            </div>
                        </div>
                    </div>

                    <!-- Mostrar diferencias si las hay (solo para modo equitativo) -->
                    <div v-if="splitMode === 'equal' && hasRemainder" class="p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p class="text-xs text-yellow-700 text-center">
                            <span class="font-medium">Nota:</span> Se han ajustado los céntimos para que sume exactamente {{ formatMoney(formData.amount) }}
                        </p>
                    </div>
                </div>

                <!-- Descripción (opcional) -->
                <div>
                    <label class="block text-sm font-medium text-gris-billetera mb-2">
                        Descripción (opcional)
                    </label>
                    <textarea
                        v-model="formData.description"
                        rows="3"
                        placeholder="Detalles adicionales del gasto..."
                        class="w-full px-3 py-2 text-sm border border-azul-claro-viaje/30 rounded-lg focus:ring-2 focus:ring-azul-tiquet focus:border-azul-tiquet bg-blanco-dividido transition-all duration-200 resize-none"
                    ></textarea>
                </div>

                <!-- Botones -->
                <div class="flex gap-3 pt-4 border-t border-azul-claro-viaje/20">
                    <button
                        type="button"
                        @click="$emit('close')"
                        class="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        :disabled="!isFormValid || loading"
                        class="flex-1 px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-azul-tiquet to-lima-compartida rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <div v-if="loading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span v-else class="text-lima-compartida">🤝</span>
                        {{ loading ? 'Guardando...' : 'Crear gasto compartido' }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import formatearTotal from '~/utils/formatMoney'

// Alias para mantener consistencia con el componente
const formatMoney = formatearTotal

// Props
const props = defineProps({
    selectedDinero: {
        type: Object,
        default: null
    },
    users: {
        type: Array,
        default: () => []
    }
})

// Emits
const emit = defineEmits(['close', 'expense-created'])

// Stores
const expenseStore = useExpenseStore()
const alertStore = useAlertStore()

// State
const loading = ref(false)
const showCalculator = ref(false)
const calculatorDisplay = ref('0')
const showPersonalCalculator = ref({}) // { userId: boolean }
const personalCalculatorDisplays = ref({}) // { userId: string }
const splitMode = ref('equal') // 'equal' o 'custom'
const customAmounts = ref({}) // { userId: amount }
const formData = ref({
    title: '',
    amount: '',
    category: '',
    description: '',
    paidBy: '',
    participants: [],
    isRecurring: false
})

const splits = ref({})

// Computed
const selectedParticipants = computed(() => {
    return props.users.filter(user => formData.value.participants.includes(user.id))
})

const averageAmount = computed(() => {
    if (!formData.value.amount || selectedParticipants.value.length === 0) return 0
    return parseFloat(formData.value.amount) / selectedParticipants.value.length
})

const totalCustomSplits = computed(() => {
    return Object.values(customAmounts.value).reduce((sum, amount) => sum + (parseFloat(amount) || 0), 0)
})

const customSplitsDifference = computed(() => {
    return parseFloat(formData.value.amount) - totalCustomSplits.value
})

const hasRemainder = computed(() => {
    if (!formData.value.amount || selectedParticipants.value.length === 0) return false
    const total = parseFloat(formData.value.amount)
    const participants = selectedParticipants.value.length
    return (total * 100) % (participants * 100) !== 0
})

const isFormValid = computed(() => {
    const baseValid = formData.value.title &&
           formData.value.amount &&
           formData.value.category &&
           formData.value.paidBy &&
           formData.value.participants.length > 0 &&
           props.selectedDinero

    if (splitMode.value === 'custom') {
        return baseValid && Math.abs(customSplitsDifference.value) <= 0.01
    }
    
    return baseValid
})

// Methods
const toggleParticipant = (userId) => {
    const index = formData.value.participants.indexOf(userId)
    if (index === -1) {
        formData.value.participants.push(userId)
        // Inicializar cantidad personalizada
        if (splitMode.value === 'equal' && formData.value.amount) {
            customAmounts.value[userId] = averageAmount.value
        } else {
            customAmounts.value[userId] = 0
        }
    } else {
        formData.value.participants.splice(index, 1)
        delete customAmounts.value[userId]
    }
    
    // Recalcular splits después de cambiar participantes
    calculateSplits()
}

const selectAllParticipants = () => {
    if (formData.value.participants.length === props.users.length) {
        formData.value.participants = []
        customAmounts.value = {}
    } else {
        formData.value.participants = [...props.users.map(u => u.id)]
        props.users.forEach(user => {
            if (splitMode.value === 'equal' && formData.value.amount) {
                customAmounts.value[user.id] = averageAmount.value
            } else {
                customAmounts.value[user.id] = 0
            }
        })
    }
    
    // Recalcular splits después de cambiar participantes
    calculateSplits()
}

const calculateSplits = () => {
    console.log('calculateSplits')
    
    if (!formData.value.amount || formData.value.participants.length === 0) {
        splits.value = {}
        // Limpiar customAmounts para usuarios no seleccionados
        const newCustomAmounts = {}
        formData.value.participants.forEach(userId => {
            newCustomAmounts[userId] = customAmounts.value[userId] || 0
        })
        customAmounts.value = newCustomAmounts
        return
    }

    if (splitMode.value === 'equal') {
        const total = parseFloat(formData.value.amount)
        const participants = formData.value.participants
        const participantCount = participants.length
        
        // Calcular división base
        const baseAmount = Math.floor((total * 100) / participantCount) / 100
        const remainder = Math.round((total * 100) % participantCount)
        
        // Asignar cantidades solo a participantes seleccionados
        const newSplits = {}
        const newCustomAmounts = {}
        
        participants.forEach((userId, index) => {
            // Los primeros 'remainder' participantes obtienen 1 céntimo extra
            const extraCent = index < remainder ? 0.01 : 0
            const amount = Math.round((baseAmount + extraCent) * 100) / 100
            newSplits[userId] = amount
            newCustomAmounts[userId] = amount
        })
        
        splits.value = newSplits
        customAmounts.value = newCustomAmounts
    } else {
        // Modo personalizado - solo mantener customAmounts para participantes seleccionados
        const newCustomAmounts = {}
        formData.value.participants.forEach(userId => {
            newCustomAmounts[userId] = customAmounts.value[userId] || 0
        })
        customAmounts.value = newCustomAmounts
        splits.value = { ...newCustomAmounts }
    }
}

const submitSplitExpense = async () => {
    console.log('submitSplitExpense')
    console.log('Split mode:', splitMode.value)
    console.log('Participants selected:', formData.value.participants)
    console.log('Splits:', splits.value)
    console.log('Custom amounts:', customAmounts.value)
    
    if (!isFormValid.value) {
        if (splitMode.value === 'custom' && Math.abs(customSplitsDifference.value) > 0.01) {
            alertStore.error('Las cantidades personalizadas deben sumar el total del gasto')
        }
        return
    }

    loading.value = true
    try {
        // Usar las cantidades calculadas o personalizadas
        const finalSplits = splitMode.value === 'equal' ? splits.value : customAmounts.value
        console.log('Final splits to use:', finalSplits)
        
        // Crear array de participantes solo con aquellos que tienen una cantidad > 0
        const participantsWithAmounts = []
        
        // Filtrar solo los participantes seleccionados que tienen un monto asignado
        for (const userId of formData.value.participants) {
            const amount = finalSplits[userId]
            if (amount && amount > 0) {
                participantsWithAmounts.push({
                    userId: parseInt(userId),
                    amount: parseFloat(amount)
                })
            }
        }
        
        console.log('Participants with amounts:', participantsWithAmounts)
        
        // Verificar que tenemos participantes válidos
        if (participantsWithAmounts.length === 0) {
            alertStore.error('Debe haber al menos un participante con una cantidad válida')
            return
        }
        
        // Preparar datos del gasto
        const expenseData = {
            title: formData.value.title,
            amount: parseFloat(formData.value.amount),
            category: formData.value.category,
            description: formData.value.description,
            dineroId: props.selectedDinero.id,
            paidBy: parseInt(formData.value.paidBy),
            participants: participantsWithAmounts,
            isRecurring: formData.value.isRecurring
        }
        
        console.log('Expense data to send:', expenseData)

        // Crear el gasto
        await expenseStore.addExpense(expenseData)
        
        alertStore.success('Gasto compartido creado correctamente')
        emit('expense-created')
        emit('close')
        
        // Resetear formulario completamente
        formData.value = {
            title: '',
            amount: '',
            category: '',
            description: '',
            paidBy: '',
            participants: [],
            isRecurring: false
        }
        splits.value = {}
        customAmounts.value = {}
        splitMode.value = 'equal'
        calculatorDisplay.value = '0'
        showCalculator.value = false
        showPersonalCalculator.value = {}
        
    } catch (error) {
        console.error('Error creating split expense:', error)
        alertStore.error('Error al crear el gasto compartido')
    } finally {
        loading.value = false
    }
}

// Calculator functions
const appendToCalculator = (value) => {
    if (calculatorDisplay.value === '0') {
        calculatorDisplay.value = value
    } else {
        calculatorDisplay.value += value
    }
    console.log('appendToCalculator')
}

const clearCalculator = () => {
    calculatorDisplay.value = '0'
    console.log('clearCalculator')
}

const deleteLast = () => {
    if (calculatorDisplay.value.length > 1) {
        calculatorDisplay.value = calculatorDisplay.value.slice(0, -1)
    } else {
        calculatorDisplay.value = '0'
    }
    console.log('deleteLast')
}

const calculate = () => {
    try {
        // Evaluate safely using Function constructor instead of eval
        const result = Function('"use strict"; return (' + calculatorDisplay.value + ')')()
        calculatorDisplay.value = result.toString()
    } catch (error) {
        calculatorDisplay.value = 'Error'
        setTimeout(() => {
            calculatorDisplay.value = '0'
        }, 1000)
    }
    console.log('calculate')
}

const useCalculatorResult = () => {
    const result = parseFloat(calculatorDisplay.value)
    if (!isNaN(result)) {
        formData.value.amount = result.toFixed(2)
        calculateSplits()
        showCalculator.value = false
        calculatorDisplay.value = '0'
    }
    console.log('useCalculatorResult')
}

// Personal calculator functions
const togglePersonalCalculator = (userId) => {
    showPersonalCalculator.value[userId] = !showPersonalCalculator.value[userId]
    if (!personalCalculatorDisplays.value[userId]) {
        personalCalculatorDisplays.value[userId] = '0'
    }
    console.log('togglePersonalCalculator')
}

const getPersonalCalculatorDisplay = (userId) => {
    return personalCalculatorDisplays.value[userId] || '0'
}

const appendToPersonalCalculator = (userId, value) => {
    if (!personalCalculatorDisplays.value[userId]) {
        personalCalculatorDisplays.value[userId] = '0'
    }
    if (personalCalculatorDisplays.value[userId] === '0') {
        personalCalculatorDisplays.value[userId] = value
    } else {
        personalCalculatorDisplays.value[userId] += value
    }
    console.log('appendToPersonalCalculator')
}

const clearPersonalCalculator = (userId) => {
    personalCalculatorDisplays.value[userId] = '0'
    console.log('clearPersonalCalculator')
}

const deleteLastPersonal = (userId) => {
    if (!personalCalculatorDisplays.value[userId]) {
        personalCalculatorDisplays.value[userId] = '0'
        return
    }
    if (personalCalculatorDisplays.value[userId].length > 1) {
        personalCalculatorDisplays.value[userId] = personalCalculatorDisplays.value[userId].slice(0, -1)
    } else {
        personalCalculatorDisplays.value[userId] = '0'
    }
    console.log('deleteLastPersonal')
}

const calculatePersonal = (userId) => {
    if (!personalCalculatorDisplays.value[userId]) {
        personalCalculatorDisplays.value[userId] = '0'
        return
    }
    try {
        // Evaluate safely using Function constructor instead of eval
        const result = Function('"use strict"; return (' + personalCalculatorDisplays.value[userId] + ')')()
        personalCalculatorDisplays.value[userId] = result.toString()
    } catch (error) {
        personalCalculatorDisplays.value[userId] = 'Error'
        setTimeout(() => {
            personalCalculatorDisplays.value[userId] = '0'
        }, 1000)
    }
    console.log('calculatePersonal')
}

const usePersonalCalculatorResult = (userId) => {
    const result = parseFloat(personalCalculatorDisplays.value[userId])
    if (!isNaN(result)) {
        customAmounts.value[userId] = result.toFixed(2)
        showPersonalCalculator.value[userId] = false
        personalCalculatorDisplays.value[userId] = '0'
    }
    console.log('usePersonalCalculatorResult')
}

// Watchers
watch(() => formData.value.participants, () => {
    // Inicializar cantidades personalizadas cuando cambian los participantes
    formData.value.participants.forEach(userId => {
        if (!(userId in customAmounts.value)) {
            if (splitMode.value === 'equal' && formData.value.amount) {
                customAmounts.value[userId] = averageAmount.value
            } else {
                customAmounts.value[userId] = 0
            }
        }
    })
    
    // Remover cantidades de participantes deseleccionados
    Object.keys(customAmounts.value).forEach(userId => {
        if (!formData.value.participants.includes(userId)) {
            delete customAmounts.value[userId]
        }
    })
    
    calculateSplits()
}, { deep: true })

watch(() => formData.value.amount, () => {
    if (splitMode.value === 'equal' && formData.value.participants.length > 0) {
        // Actualizar cantidades con división equitativa
        formData.value.participants.forEach(userId => {
            customAmounts.value[userId] = averageAmount.value
        })
    }
    calculateSplits()
})

watch(splitMode, (newMode) => {
    if (newMode === 'equal' && formData.value.participants.length > 0 && formData.value.amount) {
        // Resetear a división equitativa
        formData.value.participants.forEach(userId => {
            customAmounts.value[userId] = averageAmount.value
        })
        calculateSplits()
    }
})
</script>
