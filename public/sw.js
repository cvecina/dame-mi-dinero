// Service Worker personalizado para notificaciones
self.addEventListener('install', (event) => {
    console.log('SW instalado')
    self.skipWaiting()
})

self.addEventListener('activate', (event) => {
    console.log('SW activado')
    event.waitUntil(clients.claim())
})

// Manejar clics en notificaciones
self.addEventListener('notificationclick', (event) => {
    event.notification.close()
    
    const action = event.action
    const notificationData = event.notification.data || {}
    
    let url = '/'
    
    // Determinar URL basada en la acción
    switch (action) {
        case 'view-expenses':
            url = '/'
            break
        case 'view-budgets':
            url = '/?action=budgets'
            break
        case 'view-balances':
            url = '/balances'
            break
        case 'view-category':
            url = `/?category=${notificationData.category}`
            break
        case 'adjust-budget':
            url = `/?action=budget&category=${notificationData.category}`
            break
        case 'dismiss':
            return // No hacer nada, solo cerrar
        default:
            url = '/'
    }
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Si ya hay una ventana abierta, enfocarla y navegar
                for (const client of clientList) {
                    if (client.url.includes(self.location.origin)) {
                        client.focus()
                        client.postMessage({
                            type: 'NOTIFICATION_CLICK',
                            action: action,
                            url: url
                        })
                        return
                    }
                }
                
                // Si no hay ventana abierta, abrir una nueva
                return clients.openWindow(url)
            })
    )
})

// Manejar cierre de notificaciones
self.addEventListener('notificationclose', (event) => {
    console.log('Notificación cerrada:', event.notification.tag)
})

// Sincronización en segundo plano
self.addEventListener('sync', (event) => {
    if (event.tag === 'expense-sync') {
        event.waitUntil(syncExpenses())
    }
})

// Función para sincronizar gastos
async function syncExpenses() {
    try {
        // Obtener acciones pendientes del almacenamiento
        const registration = await self.registration
        const db = await openDB()
        const pendingActions = await getAllPendingActions(db)
        
        for (const action of pendingActions) {
            await processPendingAction(action)
        }
        
        console.log('Sincronización completada')
    } catch (error) {
        console.error('Error en sincronización:', error)
    }
}

// Manejo de mensajes desde la aplicación
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting()
    }
})

// Funciones auxiliares para IndexedDB
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('DameMiDineroDB', 1)
        
        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve(request.result)
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result
            if (!db.objectStoreNames.contains('pendingActions')) {
                db.createObjectStore('pendingActions', { keyPath: 'id', autoIncrement: true })
            }
        }
    })
}

function getAllPendingActions(db) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['pendingActions'], 'readonly')
        const store = transaction.objectStore('pendingActions')
        const request = store.getAll()
        
        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve(request.result)
    })
}

async function processPendingAction(action) {
    try {
        const response = await fetch(action.url, {
            method: action.method,
            headers: action.headers,
            body: action.body
        })
        
        if (response.ok) {
            // Eliminar acción procesada
            const db = await openDB()
            const transaction = db.transaction(['pendingActions'], 'readwrite')
            const store = transaction.objectStore('pendingActions')
            await store.delete(action.id)
        }
    } catch (error) {
        console.error('Error procesando acción:', error)
    }
}
