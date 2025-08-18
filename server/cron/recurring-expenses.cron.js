import { defineCronHandler } from '#nuxt/cron';
import { $fetch } from 'ohmyfetch';

export default defineCronHandler('0 4 1 * *', async () => {
  // Ejecutar el endpoint local para añadir gastos recurrentes
  try {
    const res = await $fetch('/api/cron-recurring-expenses', { method: 'POST' });
    console.log('recurring-expenses.cron.js', res);
  } catch (err) {
    console.error('Error en cron de gastos recurrentes:', err);
  }
});
