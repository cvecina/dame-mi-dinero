import { defineEventHandler, readBody, getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  const method = event.req.method
  const url = event.req.url
  const body = method === 'POST' ? await readBody(event) : null
  const { userId } = getQuery(event)

  // GET: /api/personal/expenses?userId=xxx
  if (method === 'GET' && url.startsWith('/api/personal/expenses')) {
    const items = await $fetch(`/api/storage/personal?type=expenses&userId=${userId}`)
    return { success: true, docs: items, message: 'Gastos personales obtenidos' }
  }

  // POST: /api/personal/expenses
  if (method === 'POST' && url.startsWith('/api/personal/expenses')) {
    const items = await $fetch(`/api/storage/personal?type=expenses&userId=${userId}`) || []
    items.push(body)
    await $fetch(`/api/storage/personal?type=expenses&userId=${userId}`, { method: 'PUT', body: items })
    return { success: true, message: 'Gasto personal añadido' }
  }

  // GET: /api/personal/subscriptions?userId=xxx
  if (method === 'GET' && url.startsWith('/api/personal/subscriptions')) {
    const items = await $fetch(`/api/storage/personal?type=subscriptions&userId=${userId}`)
    return { success: true, docs: items, message: 'Suscripciones personales obtenidas' }
  }

  // POST: /api/personal/subscriptions
  if (method === 'POST' && url.startsWith('/api/personal/subscriptions')) {
    const items = await $fetch(`/api/storage/personal?type=subscriptions&userId=${userId}`) || []
    items.push(body)
    await $fetch(`/api/storage/personal?type=subscriptions&userId=${userId}`, { method: 'PUT', body: items })
    return { success: true, message: 'Suscripción personal añadida' }
  }

  // GET: /api/personal/budgets?userId=xxx
  if (method === 'GET' && url.startsWith('/api/personal/budgets')) {
    const items = await $fetch(`/api/storage/personal?type=budgets&userId=${userId}`)
    return { success: true, docs: items, message: 'Presupuestos personales obtenidos' }
  }

  // POST: /api/personal/budgets
  if (method === 'POST' && url.startsWith('/api/personal/budgets')) {
    const items = await $fetch(`/api/storage/personal?type=budgets&userId=${userId}`) || []
    items.push(body)
    await $fetch(`/api/storage/personal?type=budgets&userId=${userId}`, { method: 'PUT', body: items })
    return { success: true, message: 'Presupuesto personal añadido' }
  }

  return { success: false, message: 'Ruta o método no soportado' }
})
