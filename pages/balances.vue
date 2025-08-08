<template>
  <div class="min-h-screen bg-marfil-mapamundi p-3 sm:p-4 lg:p-6">
    <!-- Loading state -->
    <div v-if="isLoading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <div
          class="w-16 h-16 border-4 border-azul-tiquet border-t-transparent rounded-full animate-spin mx-auto mb-4"
        ></div>
        <p class="text-gris-billetera font-medium">Cargando balances...</p>
      </div>
    </div>

    <!-- Mensaje cuando no hay usuario seleccionado -->
    <div
      v-else-if="!currentUser"
      class="flex items-center justify-center py-20"
    >
      <div class="text-center">
        <div class="text-6xl mb-4">⚖️</div>
        <h2 class="text-xl font-semibold text-gris-billetera mb-2">
          Selecciona tu usuario
        </h2>
        <p class="text-gray-600">
          Necesitas seleccionar un usuario para ver los balances
        </p>
      </div>
    </div>

    <!-- Main content -->
    <div v-else>
      <!-- Header -->
      <div class="mb-6 sm:mb-8">
        <h1 class="text-2xl sm:text-3xl font-bold text-gris-billetera mb-2">
          Balances y liquidaciones
        </h1>
        <p class="text-sm sm:text-base text-gray-600">
          Resumen de quién debe a quién y cuánto
        </p>
      </div>

      <!-- Resumen general mejorado -->
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8"
      >
        <!-- Tu balance destacado -->
        <div
          class="sm:col-span-2 lg:col-span-2 bg-gradient-to-r from-azul-tiquet to-azul-claro-viaje rounded-xl shadow-lg p-6 text-blanco-dividido"
        >
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold">Tu Balance</h3>
            <div
              class="w-10 h-10 bg-blanco-dividido/20 rounded-full flex items-center justify-center"
            >
              <span class="text-lg font-bold">{{
                currentUser?.name?.charAt(0)?.toUpperCase() || "U"
              }}</span>
            </div>
          </div>
          <div class="text-center">
            <div class="text-3xl sm:text-4xl font-bold mb-2">
              {{ formatMoney(userBalance) }}
            </div>
            <div class="flex items-center justify-center gap-2">
              <div
                class="w-3 h-3 rounded-full"
                :class="userBalance >= 0 ? 'bg-lima-compartida' : 'bg-red-400'"
              ></div>
              <p class="text-sm opacity-90">
                {{ userBalance >= 0 ? "Te deben" : "Debes" }}
                {{ formatMoney(Math.abs(userBalance)) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Total gastado -->
        <div
          class="bg-blanco-dividido rounded-lg shadow-md p-6 border-l-4 border-azul-tiquet"
        >
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-medium text-gray-600">Total Gastado</h3>
            <div
              class="w-8 h-8 bg-azul-tiquet/10 rounded-full flex items-center justify-center"
            >
              <span class="text-azul-tiquet text-lg">💸</span>
            </div>
          </div>
          <p class="text-2xl font-bold text-gris-billetera">
            {{ formatMoney(totalExpenses) }}
          </p>
          <p class="text-xs text-gray-500 mt-1">
            {{ expenses.length }} gastos registrados
          </p>
        </div>

        <!-- Usuarios participantes -->
        <div
          class="bg-blanco-dividido rounded-lg shadow-md p-6 border-l-4 border-lima-compartida"
        >
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-medium text-gray-600">Usuarios</h3>
            <div
              class="w-8 h-8 bg-lima-compartida/10 rounded-full flex items-center justify-center"
            >
              <span class="text-lima-compartida text-lg">👥</span>
            </div>
          </div>
          <p class="text-2xl font-bold text-gris-billetera">
            {{ Object.keys(balances).length }}
          </p>
          <p class="text-xs text-gray-500 mt-1">personas en el grupo</p>
        </div>
      </div>

      <!-- Balances de todos los usuarios con nuevo diseño -->
      <div class="bg-blanco-dividido rounded-lg shadow-md p-6 mb-8">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-gris-billetera">
            Resumen de Balances
          </h2>
          <div class="flex items-center gap-2 text-sm text-gray-600">
            <div class="flex items-center gap-1">
              <div class="w-3 h-3 bg-lima-compartida rounded-full"></div>
              <span>A favor</span>
            </div>
            <div class="flex items-center gap-1">
              <div class="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>En deuda</span>
            </div>
          </div>
        </div>

        <div class="space-y-4">
          <div
            v-for="(balance, userId) in balances"
            :key="userId"
            class="flex items-center justify-between p-4 rounded-xl transition-all duration-200 hover:shadow-md"
            :class="[
              parseInt(userId) === currentUser?.id
                ? 'bg-azul-tiquet/5 border-2 border-azul-tiquet/20'
                : 'bg-gray-50 hover:bg-gray-100',
              balance.balance >= 0
                ? 'border-l-4 border-l-lima-compartida'
                : 'border-l-4 border-l-red-500',
            ]"
          >
            <!-- Usuario info -->
            <div class="flex items-center gap-4">
              <div class="relative">
                <div
                  class="w-12 h-12 bg-azul-tiquet rounded-full flex items-center justify-center text-blanco-dividido font-bold text-lg"
                >
                  {{ getUserName(parseInt(userId)).charAt(0).toUpperCase() }}
                </div>
                <div
                  v-if="parseInt(userId) === currentUser?.id"
                  class="absolute -top-1 -right-1 w-5 h-5 bg-lima-compartida rounded-full flex items-center justify-center"
                >
                  <span class="text-gris-billetera text-xs font-bold">✓</span>
                </div>
              </div>
              <div>
                <h3 class="font-semibold text-gris-billetera text-lg">
                  {{ getUserName(parseInt(userId)) }}
                  <span
                    v-if="parseInt(userId) === currentUser?.id"
                    class="text-sm text-azul-tiquet font-normal"
                    >(Tú)</span
                  >
                </h3>
                <div class="flex items-center gap-4 text-sm text-gray-600">
                  <span>Gastó: {{ formatMoney(balance.totalSpent) }}</span>
                  <span>Debe: {{ formatMoney(balance.owes) }}</span>
                  <span>Le deben: {{ formatMoney(balance.owedToThem) }}</span>
                  <span
                    >Gastos: {{ getUserExpenseCount(parseInt(userId)) }}</span
                  >
                </div>
              </div>
            </div>

            <!-- Balance -->
            <div class="text-right">
              <div
                class="text-2xl font-bold mb-1"
                :class="
                  balance.balance >= 0 ? 'text-lima-compartida' : 'text-red-500'
                "
              >
                {{ balance.balance >= 0 ? "+" : ""
                }}{{ formatMoney(balance.balance) }}
              </div>
              <div
                class="text-xs font-medium px-3 py-1 rounded-full"
                :class="
                  balance.balance >= 0
                    ? 'bg-lima-compartida/10 text-lima-compartida'
                    : 'bg-red-100 text-red-600'
                "
              >
                {{ balance.balance >= 0 ? "Le deben" : "Debe" }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sugerencias de pago rediseñadas -->
      <div
        class="bg-gradient-to-br from-marfil-mapamundi to-blanco-dividido rounded-lg shadow-md p-6"
      >
        <div class="flex items-center gap-3 mb-6">
          <div
            class="w-10 h-10 bg-lima-compartida rounded-full flex items-center justify-center"
          >
            <span class="text-gris-billetera text-lg">💡</span>
          </div>
          <div>
            <h2 class="text-xl font-semibold text-gris-billetera">
              Sugerencias de Pago
            </h2>
            <p class="text-sm text-gray-600">
              Para saldar todas las deudas de forma óptima
            </p>
          </div>
        </div>

        <div
          v-if="suggestedSettlements.length === 0"
          class="bg-lima-compartida/5 rounded-lg p-8 text-center border border-lima-compartida/20"
        >
          <div
            class="w-16 h-16 bg-lima-compartida/20 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <span class="text-lima-compartida text-2xl">✅</span>
          </div>
          <h3 class="text-lg font-semibold text-gris-billetera mb-2">
            ¡Todo está saldado!
          </h3>
          <p class="text-gray-600">
            No hay deudas pendientes entre los miembros del grupo.
          </p>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="(settlement, index) in suggestedSettlements"
            :key="`${settlement.from}-${settlement.to}`"
            class="bg-blanco-dividido rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div class="flex items-center justify-between">
              <!-- Lado izquierdo: Quien paga -->
              <div class="flex items-center gap-4">
                <div class="flex flex-col items-center">
                  <div
                    class="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center border-2 border-red-200"
                  >
                    <span class="text-red-700 font-bold text-lg">
                      {{ getUserName(settlement.from).charAt(0).toUpperCase() }}
                    </span>
                  </div>
                  <span class="text-xs text-gray-500 mt-1">Paga</span>
                </div>
                <div>
                  <p class="font-semibold text-gris-billetera">
                    {{ getUserName(settlement.from) }}
                  </p>
                  <p class="text-sm text-gray-600">debe pagar</p>
                </div>
              </div>

              <!-- Centro: Flecha y cantidad -->
              <div class="flex flex-col items-center px-6">
                <div class="text-2xl font-bold text-azul-tiquet mb-1">
                  {{ formatMoney(settlement.amount) }}
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-8 h-0.5 bg-azul-claro-viaje"></div>
                  <span class="text-azul-tiquet">→</span>
                  <div class="w-8 h-0.5 bg-azul-claro-viaje"></div>
                </div>
              </div>

              <!-- Lado derecho: Quien recibe -->
              <div class="flex items-center gap-4">
                <div class="text-right">
                  <p class="font-semibold text-gris-billetera">
                    {{ getUserName(settlement.to) }}
                  </p>
                  <p class="text-sm text-gray-600">recibe el pago</p>
                </div>
                <div class="flex flex-col items-center">
                  <div
                    class="w-14 h-14 bg-lima-compartida/20 rounded-full flex items-center justify-center border-2 border-lima-compartida/30"
                  >
                    <span class="text-lima-compartida font-bold text-lg">
                      {{ getUserName(settlement.to).charAt(0).toUpperCase() }}
                    </span>
                  </div>
                  <span class="text-xs text-gray-500 mt-1">Recibe</span>
                </div>
              </div>
            </div>

            <!-- Botón de acción -->
            <div class="mt-4 pt-4 border-t border-gray-100">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600"
                  >💳 Pago sugerido #{{ index + 1 }}</span
                >
                <button
                  @click="markAsSettled(settlement)"
                  class="bg-lima-compartida hover:bg-lima-compartida/80 text-gris-billetera font-medium px-4 py-2 rounded-lg transition-all duration-200 text-sm hover:shadow-md"
                >
                  ✓ Marcar como pagado
                </button>
              </div>
            </div>
          </div>

          <!-- Nota informativa -->
          <div
            class="mt-6 p-4 bg-azul-claro-viaje/10 rounded-lg border border-azul-claro-viaje/20"
          >
            <div class="flex items-start gap-3">
              <span class="text-azul-tiquet text-lg mt-0.5">ℹ️</span>
              <div>
                <p class="text-sm text-azul-tiquet font-medium mb-1">
                  ¿Cómo funciona?
                </p>
                <p class="text-xs text-gray-600">
                  Estas son las transferencias mínimas necesarias para que todos
                  queden en paz. Una vez realizados estos pagos, todos los
                  balances quedarán en 0.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useExpenseStore } from "~/stores/expense.store";
import { useUserStore } from "~/stores/user.store";
import { useAlertStore } from "~/stores/alert.store";
import { useFormatters } from "~/composables/useFormatters";

// Stores
const expenseStore = useExpenseStore();
const userStore = useUserStore();
const alertStore = useAlertStore();

// Composables
const { formatMoney } = useFormatters();

// Computed properties
const expenses = computed(() => expenseStore.getAllExpenses);
const totalExpenses = computed(() => expenseStore.getTotalExpenses);
const balances = computed(() => expenseStore.getBalances);
const currentUser = computed(() => userStore.getCurrentUser);
const isLoading = computed(() => userStore.isLoading || expenseStore.isLoading);

const userBalance = computed(() => {
  if (!currentUser.value) return 0;
  const userBalances = balances.value[currentUser.value.id];
  return userBalances ? userBalances.balance : 0;
});

const suggestedSettlements = computed(() => {
  const settlements = [];
  const currentBalances = balances.value;

  // Filtrar balances válidos y separarlos en deudores y acreedores
  const debtors = [];
  const creditors = [];

  Object.entries(currentBalances).forEach(([userId, balanceData]) => {
    const balance = balanceData.balance;
    const userIdInt = parseInt(userId);
    
    if (balance < -0.01) { // Considera diferencias menores a 1 centavo como 0
      debtors.push({
        userId: userIdInt,
        amount: Math.abs(balance),
        name: getUserName(userIdInt)
      });
    } else if (balance > 0.01) {
      creditors.push({
        userId: userIdInt,
        amount: balance,
        name: getUserName(userIdInt)
      });
    }
  });

  // Si no hay deudores o acreedores, no hay liquidaciones
  if (debtors.length === 0 || creditors.length === 0) {
    return [];
  }

  // Crear copias para manipular
  const debtorsCopy = [...debtors];
  const creditorsCopy = [...creditors];

  // Ordenar por cantidad (mayor primero para optimizar)
  debtorsCopy.sort((a, b) => b.amount - a.amount);
  creditorsCopy.sort((a, b) => b.amount - a.amount);

  // Algoritmo de liquidación greedy optimizado
  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtorsCopy.length && creditorIndex < creditorsCopy.length) {
    const debtor = debtorsCopy[debtorIndex];
    const creditor = creditorsCopy[creditorIndex];
    
    // Calcular el monto a transferir (mínimo entre deuda y crédito)
    const transferAmount = Math.min(debtor.amount, creditor.amount);
    
    // Solo crear liquidación si el monto es significativo (más de 1 centavo)
    if (transferAmount >= 0.01) {
      settlements.push({
        from: debtor.userId,
        to: creditor.userId,
        amount: Math.round(transferAmount * 100) / 100 // Redondear a centavos
      });
      
      // Actualizar montos restantes
      debtor.amount -= transferAmount;
      creditor.amount -= transferAmount;
    }

    // Avanzar al siguiente deudor o acreedor si ya está saldado
    if (debtor.amount < 0.01) {
      debtorIndex++;
    }
    if (creditor.amount < 0.01) {
      creditorIndex++;
    }
  }
  
  console.log('suggestedSettlements');
  return settlements;
});

// Methods
const getUserName = (userId) => {
  const user = userStore.getUserById(userId);
  return user ? user.name : "Usuario desconocido";
};

const getUserExpenseCount = (userId) => {
  return expenseStore.getExpensesByUser(userId).length;
};

const markAsSettled = async (settlement) => {
  try {
    // Crear un registro de pago directo entre usuarios
    const paymentData = {
      title: `Pago de ${getUserName(settlement.from)} a ${getUserName(settlement.to)}`,
      amount: settlement.amount,
      category: 'pago',
      description: `Liquidación directa de deuda`,
      paidBy: settlement.to, // Quien recibe se considera que "pagó" el gasto
      participants: [settlement.from], // Solo el que debe participa
      isSettlement: true // Marcar como liquidación
    };

    await expenseStore.addExpense(paymentData);
    alertStore.success(
      `Pago de ${formatMoney(settlement.amount)} registrado correctamente`
    );
    console.log('markAsSettled');
  } catch (error) {
    console.error('Error al registrar el pago:', error);
    alertStore.error('Error al registrar el pago');
  }
};

// Cargar datos al montar el componente
onMounted(async () => {
  try {
    // Cargar usuarios y gastos actualizados
    await userStore.fetchUsers();
    await expenseStore.fetchExpenses();
  } catch (error) {
    console.error("Error al cargar datos:", error);
    alertStore.error("Error al cargar los datos");
  }
});

console.log("balances-page");
</script>
