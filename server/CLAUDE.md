# Backend Server - AI Context

## 🚀 Propósito
El servidor es el centro de control. Maneja la lógica de negocio, la integración con IA (OpenAI/ElevenLabs) y la orquestación de renderizado.

## 📋 Reglas de Desarrollo
- **Error Handling**: Siempre usar bloques `try/catch` y devolver códigos de estado HTTP apropiados.
- **Logging**: Registrar pasos críticos del proceso de renderizado para facilitar el debug.
- **Seguridad**: No exponer secretos. Usar el archivo `.env` en la raíz.

## 🏗 Estructura Modular
- Los endpoints de la API deben estar organizados por funcionalidad.
- Usar `ts-node` para ejecución directa en desarrollo.

## 🔗 Integraciones
- Al modificar flujos con Airtable o n8n, consultar `docs/decisions/001-hybrid-scaling.md`.
