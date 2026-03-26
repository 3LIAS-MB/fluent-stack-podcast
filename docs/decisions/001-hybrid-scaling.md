# ADR 001: Estrategia de Escalado Híbrido

## Estatus
Aceptado

## Contexto
El proyecto requiere una automatización robusta entre n8n y Airtable para manejar múltiples generaciones de scripts y renders por cada ejecución, evitando duplicados y optimizando recursos.

## Decisión
Implementamos un **Modelo de Ejecución Híbrido**:
1. **n8n** actúa como el orquestador principal, detectando cambios de estado en Airtable.
2. La lógica de generación se divide en "Lotes" (Batches) para permitir escalabilidad.
3. Se utiliza una base de datos histórica (vía Airtable o JSON local) para prevenir la generación de temas repetidos.
4. El renderizado es secuencial para evitar saturar el hardware local (o nube).

## Consecuencias
- **Positivas**: Mayor estabilidad, automatización completa sin intervención manual, logs más limpios.
- **Negativas**: Mayor complejidad en la configuración inicial de n8n.
