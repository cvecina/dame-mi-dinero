# 🔍 Guía de Implementación OCR

El sistema de escáner de tickets está preparado para integrar OCR real. Actualmente funciona con entrada manual de datos, pero puede configurarse con servicios OCR profesionales.

## 📱 Estado Actual

- ✅ **Captura de imagen**: Cámara y subida de archivos funcionando
- ✅ **Interfaz completa**: UI/UX lista para OCR
- ✅ **Entrada manual**: Sistema temporal hasta implementar OCR real
- 🔧 **OCR real**: Listo para integrar (ver opciones abajo)

## 🚀 Opciones de OCR

### 1. Tesseract.js (Gratis, Local)

**Ventajas**: Gratis, funciona offline, privacidad
**Desventajas**: Menor precisión que servicios cloud

```bash
# Instalar
pnpm add tesseract.js

# Usar en TicketScannerModal.vue
const { createWorker } = await import('tesseract.js')
const worker = await createWorker('spa') // Español
const { data: { text } } = await worker.recognize(imageData)
await worker.terminate()
```

### 2. Google Cloud Vision API (Pago)

**Ventajas**: Muy preciso, rápido, soporte múltiples idiomas
**Costo**: ~$1.50 por 1000 imágenes

```javascript
// Crear API endpoint: /server/api/ocr/google-vision.js
export default defineEventHandler(async (event) => {
  const { image } = await readBody(event)
  
  const response = await fetch('https://vision.googleapis.com/v1/images:annotate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GOOGLE_CLOUD_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      requests: [{
        image: { content: image.split(',')[1] },
        features: [{ type: 'TEXT_DETECTION' }]
      }]
    })
  })
  
  const data = await response.json()
  return { text: data.responses[0].textAnnotations[0].description }
})
```

### 3. Azure Computer Vision (Pago)

**Ventajas**: Buena precisión, integración Microsoft
**Costo**: Similar a Google

```javascript
// Crear API endpoint: /server/api/ocr/azure-vision.js
export default defineEventHandler(async (event) => {
  const { image } = await readBody(event)
  
  const response = await fetch(`${process.env.AZURE_ENDPOINT}/vision/v3.2/ocr`, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': process.env.AZURE_SUBSCRIPTION_KEY,
      'Content-Type': 'application/octet-stream'
    },
    body: Buffer.from(image.split(',')[1], 'base64')
  })
  
  const data = await response.json()
  return { text: extractTextFromAzureResponse(data) }
})
```

## 🔧 Activar OCR Real

### Paso 1: Elegir servicio
Descomentar el bloque correspondiente en `TicketScannerModal.vue` líneas 89-110

### Paso 2: Configurar variables de entorno
```bash
# Para Google Cloud Vision
GOOGLE_CLOUD_API_KEY=tu_api_key_aqui

# Para Azure Computer Vision
AZURE_ENDPOINT=https://tu-recurso.cognitiveservices.azure.com
AZURE_SUBSCRIPTION_KEY=tu_subscription_key_aqui
```

### Paso 3: Implementar parser
```javascript
const parseReceiptText = (text) => {
  // Expresiones regulares para extraer datos
  const totalRegex = /total[:\s]*(\d+[.,]\d{2})/i
  const merchantRegex = /^([A-ZÁÉÍÓÚÑ\s]+)/m
  const dateRegex = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/
  
  return {
    total: parseFloat(totalRegex.exec(text)?.[1]?.replace(',', '.') || 0),
    merchant: merchantRegex.exec(text)?.[1]?.trim() || '',
    date: formatDate(dateRegex.exec(text)?.[1] || ''),
    items: extractItems(text)
  }
}
```

## 📊 Precisión Esperada

| Servicio | Texto Simple | Tickets | Facturas |
|----------|-------------|---------|----------|
| Tesseract.js | 85% | 70% | 65% |
| Google Vision | 95% | 90% | 88% |
| Azure Vision | 94% | 89% | 87% |

## 💡 Recomendación

1. **Para desarrollo/pruebas**: Usar entrada manual (actual)
2. **Para producción económica**: Tesseract.js
3. **Para producción profesional**: Google Cloud Vision

## 🛠️ Mejoras Futuras

- [ ] Detección automática de campos (total, fecha, etc.)
- [ ] Corrección de errores comunes de OCR
- [ ] Soporte para múltiples formatos de tickets
- [ ] Cache de resultados para evitar re-procesar
- [ ] Validación cruzada entre múltiples servicios OCR

## 🔒 Consideraciones de Privacidad

- **Tesseract.js**: Datos no salen del dispositivo ✅
- **Google/Azure**: Datos se envían a la nube ⚠️
- Siempre informar al usuario dónde se procesan sus datos
