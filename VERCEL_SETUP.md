# Dame mi dinero - Configuración para Vercel

## 🚀 Despliegue en Vercel con KV

### Paso 1: Configurar Vercel KV

1. Ve a tu dashboard de Vercel
2. Selecciona tu proyecto "dame-mi-dinero"
3. Ve a la pestaña **Storage**
4. Haz clic en **Create Database**
5. Selecciona **KV**
6. Dale un nombre (ej: "dame-mi-dinero-kv")
7. Haz clic en **Create**

### Paso 2: Conectar KV al proyecto

1. Después de crear la base de datos KV
2. Ve a **Connect Project**
3. Selecciona tu proyecto "dame-mi-dinero"
4. Haz clic en **Connect**

### Paso 3: Verificar variables de entorno

Ve a **Settings** → **Environment Variables** y verifica que tienes:
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`

### Paso 4: Redesplegar

1. Ve a **Deployments**
2. Haz clic en los **3 puntos** del último deployment
3. Selecciona **Redeploy**

¡Y listo! Tu aplicación funcionará perfectamente en Vercel.

## 🔧 Desarrollo Local

Para desarrollo local, la aplicación seguirá usando archivos JSON como antes.
Solo cuando esté en Vercel usará KV automáticamente.

## ⚡ Características

- ✅ Funciona tanto en desarrollo como en producción
- ✅ Datos persistentes en Vercel KV
- ✅ Sin configuración extra necesaria localmente
- ✅ Automáticamente detecta el entorno
