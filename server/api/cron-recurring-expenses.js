import { $fetch } from 'ohmyfetch';

export default defineEventHandler(async (event) => {
  // Solo permitir ejecución por POST (o GET para pruebas)
  const method = event.node.req.method;
  if (method !== 'POST' && method !== 'GET') {
    return { success: false, message: 'Método no permitido' };
  }

  // Obtener todos los gastos
  const expenses = await $fetch('/api/storage/expenses') || [];
  const now = new Date();
  const month = now.toLocaleString('default', { month: 'long' });
  const year = now.getFullYear();

  // Filtrar gastos recurrentes
  const recurringExpenses = expenses.filter(e => e.isRecurring);
  let added = 0;

  for (const expense of recurringExpenses) {
    // Verificar si ya existe un gasto recurrente para este mes y año
    const alreadyExists = expenses.some(e =>
      e.isRecurring &&
      e.title.includes(`${month} ${year}`) &&
      e.title.startsWith(expense.title.split(' ')[0])
    );
    if (alreadyExists) continue;

    // Crear nuevo gasto recurrente
    const newExpense = {
      ...expense,
      title: `${expense.title} ${month} ${year}`,
      date: now.toISOString(),
      createdAt: now.toISOString(),
      id: Date.now() + Math.floor(Math.random() * 10000),
      isRecurring: true
    };
    // Eliminar id original si existe
    if (expense.id) delete newExpense.id;
    expenses.push(newExpense);
    added++;
  }

  // Guardar en storage si se añadió alguno
  if (added > 0) {
    await $fetch('/api/storage/expenses', {
      method: 'PUT',
      body: expenses
    });
  }

  return {
    success: true,
    added,
    message: added > 0 ? `Se añadieron ${added} gastos recurrentes para ${month} ${year}` : 'No había gastos recurrentes nuevos para este mes.'
  };
});
