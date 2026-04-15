# 🔗 Integración con n8n y Pipeline de Datos

El sistema está diseñado para ser gatillado desde una instancia de **n8n** externa siguiendo un flujo de automatización robusto.

## Pipeline Completo

1.  **n8n Trigger**: Un nodo de Airtable detecta un nuevo registro (episodio) listo para renderizar.
2.  **Preparación de Datos**: n8n extrae el audio y la imagen, y genera un JSON con el vocabulario.
3.  **Llamada a la API**: n8n hace un `POST http://host.docker.internal:3000/render` con el payload de datos.
4.  **Respuesta "Asíncrona"**: La API responde con un status 200 ok y encola el render.
5.  **Procesado Interno**: La API descarga el audio, genera transcripciones y dispara el comando de renderizado de **Remotion**.
6.  **Video Final**: El video resultante se sirve en una URL estática de descarga (ej. `/videos/output_123.mp4`).

## Manejo de Datos Críticos

### 1. Mapeo de Niveles

Airtable envía `"Intermediate B1-B2"` que se convierte automáticamente en el tipo interno `'intermediate'` en el servidor antes de pasarse a Remotion.

### 2. Vocabulario JSON

El sistema es robusto ante el vocabulario serializado como string: `typeof input === 'string'` gatilla un `JSON.parse` automático en el motor de video.

### 3. Render Secuencial (`SplitInBatches(1)`)

En n8n, se usa `SplitInBatches(1)` para enviar peticiones una por una. Esto asegura de no sobrecargar la CPU del servidor de renderizado.

## Configuración de URL en n8n

Si n8n corre en Docker:
`http://host.docker.internal:3000/render`

Si n8n corre nativo en Windows:
`http://localhost:3000/render`
