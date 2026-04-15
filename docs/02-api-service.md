# 🚀 Servicio de API (apps/api)

Este micro-servidor Express maneja la recepción de comandos de renderizado y la orquestación de tareas de procesamiento de audio y video.

## Características Principales

### 1. Endpoint /render (POST)

Es el canal principal de comunicación:

- Recibe y valida los datos de audio, imagen y vocabulario.
- Normaliza los parámetros (`level`, `format`, etc.).
- Gatilla procesos paralelos de descarga y transcripción.
- Ejecuta el renderizado de **Remotion** mediante la CLI programática.

### 2. Cola de Renderizado (Render Queue)

Para evitar saturar la CPU, las peticiones entrantes se encolan secuencialmente. El servidor procesa **un solo render a la vez**, asegurando logs limpios y estabilidad en el sistema.

### 3. Transcripción y Alineación

- El servidor soporta transcripción vía **OpenAI API** o modelos locales.
- **Diarización**: Se integran los `scriptSegments` del usuario con las transcripciones de audio para asignar nombres de hablantes (`Ryan`, `Ethan`, etc.) a cada palabra.

## Estructura de Servicios

- **`renderer.ts`**: Lógica de integración con la CLI de Remotion para bundling y renderizado MP4.
- **`transcription.ts`**: Conexión con servicios de IA para conversión de voz a texto.
- **`download.ts`**: Gestión de archivos temporales en el servidor.
- **`vocabImage.ts`**: Lógica para pre-calcular la duración de las páginas de vocabulario.

## Variables de Entorno (.env)

| Variable         | Descripción                          | Requerido           |
| ---------------- | ------------------------------------ | ------------------- |
| `OPENAI_API_KEY` | Key para transcripciones y GPT.      | Sí (si usas OpenAI) |
| `PORT`           | Puerto del servidor (Default: 3000). | No                  |

## Comandos Útiles

- `npm run dev`: Modo desarrollo con auto-recarga.
- `npm run build`: Compilación de TypeScript a JavaScript (`dist/`).
- `npm start`: Ejecución para producción (requiere build).
