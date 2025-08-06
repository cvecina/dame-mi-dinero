# Dame mi dinero - Configuración para Vercel

## 🚀 Despliegue en Vercel con Upstash Redis

### Paso 1: Configurar Upstash Redis desde el Marketplace

1. Ve a tu dashboard de Vercel
2. Selecciona tu proyecto "dame-mi-dinero"
3. Ve a la pestaña **Marketplace**
4. Busca **Upstash**
5. Haz clic en **Add Integration**
6. Selecciona tu proyecto "dame-mi-dinero"
7. **Create Redis Database**:
   - Dale un nombre (ej: "dame-mi-dinero-db")
   - Selecciona la región más cercana
   - Haz clic en **Create**
8. **Connect to Project** → Selecciona "dame-mi-dinero"

### Paso 2: Verificar variables de entorno

Ve a **Settings** → **Environment Variables** y verifica que tienes:
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

### Paso 3: Redesplegar

1. Ve a **Deployments**
2. Haz clic en los **3 puntos** del último deployment
3. Selecciona **Redeploy**

¡Y listo! Tu aplicación funcionará perfectamente en Vercel.

## 🔧 Desarrollo Local

Para desarrollo local, la aplicación seguirá usando archivos JSON como antes.
Solo cuando esté en Vercel usará Upstash Redis automáticamente.

## ⚡ Características

- ✅ Funciona tanto en desarrollo como en producción
- ✅ Datos persistentes en Upstash Redis
- ✅ Sin configuración extra necesaria localmente
- ✅ Automáticamente detecta el entorno
- ✅ Fallback a Vercel KV si está disponible
- ✅ Ultra rápido con Upstash

## 💰 Límites gratuitos de Upstash

- ✅ 10,000 requests por día
- ✅ 256 MB de almacenamiento
- ✅ Perfecto para uso personal/grupos pequeños
