# 🔧 Gaps Técnicos y Decisiones de Arquitectura

> Documento de referencia para el sistema Fluent Stack Podcast.  
> Registra issues conocidos, cómo se resolvieron y por qué.

---

## Gap #1 — Discrepancia del campo `level` entre n8n y Remotion

### Problema
Airtable almacena el nivel del episodio como texto largo: `"Intermediate B1-B2"`, `"Beginner A1-A2"`, `"Advanced C1-C2"`.  
El schema original de Remotion (Zod + TypeScript) usaba el formato corto: `'beginner' | 'intermediate' | 'advanced'`.  
Esto hacía que el payload de n8n fallara la validación Zod en el momento del render.

### Solución adoptada (dos capas, ambas activas)

**Capa 1 — Normalización en el server (`server/src/routes/render.ts`, líneas 30–35):**
```ts
const VALID_LEVELS = ['beginner', 'intermediate', 'advanced'];
if (typeof data.level === 'string') {
  const lower = data.level.toLowerCase();
  const found = VALID_LEVELS.find((l) => lower.includes(l));
  data.level = (found ?? 'beginner') as any;
}
```
El server intercepta cualquier formato de nivel (`"Intermediate B1-B2"`, `"INTERMEDIATE"`, etc.) y lo convierte al formato interno del server antes de pasarlo a Remotion.

**Capa 2 — Alineación del type en el frontend (`src/types/index.ts`):**
```ts
// Actualizado para aceptar el formato largo de Airtable directamente
export type EpisodeLevel = 'Beginner A1-A2' | 'Intermediate B1-B2' | 'Advanced C1-C2';
```
Esto hace que el Remotion Studio (preview) use los mismos valores que llegan desde n8n, eliminando cualquier divergencia de tipos en tiempo de desarrollo.

> ⚠️ **Nota importante:** El server (`server/src/types/index.ts`) mantiene su **propio** tipo `EpisodeLevel = 'beginner' | 'intermediate' | 'advanced'` de forma independiente. Los tipos del server y del frontend son **desacoplados por diseño**. La normalización en render.ts actúa como el "traductor" entre ambos mundos.

### Archivos afectados
- `src/types/index.ts` — type del frontend actualizado al formato largo
- `src/data/preview-data.ts` — `SHARED_LEVEL` actualizado a `'Beginner A1-A2'`
- `src/utils/levelColors.ts` — claves del Record actualizadas al formato largo
- `server/src/routes/render.ts` — normalización del nivel en el request entrante (sin cambios, ya existía)

---

## Gap #2 — URL `host.docker.internal` en n8n

### Problema
En el nodo `HTTP Request - Remotion Render` del workflow de n8n, la URL configurada es:
```
http://host.docker.internal:3000/render
```

`host.docker.internal` es una dirección DNS especial que **solo existe dentro de contenedores Docker**. Desde dentro de un contenedor Docker, resuelve a la IP de la máquina anfitriona (tu PC), permitiendo que n8n dentro de Docker llame al server Express que corre en tu Windows.

### ¿Cuándo funciona y cuándo falla?

| Cómo corre n8n | URL correcta | ¿Funciona `host.docker.internal`? |
|---|---|---|
| n8n en Docker (Docker Desktop) | `http://host.docker.internal:3000/render` | ✅ Sí |
| n8n instalado en Windows (npm/exe) | `http://localhost:3000/render` | ❌ No resuelve |

### Estado actual
Si el workflow ha funcionado correctamente, n8n está corriendo en **Docker**. La URL es correcta para ese setup. Si en el futuro migras n8n a instalación nativa en Windows, habrá que cambiar la URL en el nodo de n8n a `http://localhost:3000/render`.

### Cómo verificar
Abre una terminal en Windows y ejecuta:
```powershell
docker ps
```
Si ves un contenedor de n8n corriendo → está en Docker → la URL actual es correcta.

---

## Gap #3 — Vocabulario como string JSON serializado

### Problema
El campo `Vocabulary` en Airtable (Table intermediate) almacena el vocabulario como **un string de texto** que contiene JSON serializado:
```
"[{\"category\":\"Technical Terms\",\"items\":[{\"term\":\"RAG\",\"english\":\"...\"}]}]"
```

Esto ocurre porque en el nodo `Prepare Airtable Data` de n8n se hace `JSON.stringify(vocabularyArray)` antes de guardar en Airtable. El campo Airtable es de tipo `Long Text`, no puede contener objetos — solo strings.

Cuando n8n luego lee ese campo y lo envía al server en el payload del render, el campo `vocabulary` llega como **string**, no como array:
```json
{
  "vocabulary": "[{\"category\":\"Technical Terms\",...}]"
}
```

### Por qué no es un problema en la práctica

`vocabNormalization.ts` (líneas 13–21) maneja este caso **explícitamente**:
```ts
// 1. Parse stringified JSON if it comes as a string (often happens from n8n webhooks)
if (typeof parsed === 'string') {
  try {
    parsed = JSON.parse(parsed);
  } catch (e) {
    console.error('Failed to parse vocabulary string:', e);
    return [];
  }
}
```

El primer paso de `normalizeVocabulary()` detecta si el input es un string y lo parsea automáticamente. Por eso el video se renderizó bien — la función es robusta ante este caso.

El comentario en `server/src/routes/render.ts` también lo documenta explícitamente:
```ts
// El vocabulario pasa exactamente como llega. La normalización sucederá
// en vocabNormalization.ts dentro del cliente Remotion
```

### Estado actual
✅ **Resuelto por diseño.** No requiere intervención. El flujo es:
```
Airtable (string JSON) → n8n → server Express (pasa sin tocar) → Remotion → vocabNormalization.ts (parsea y normaliza)
```

---

## Decisiones de Arquitectura Complementarias

### Render secuencial en n8n (`SplitInBatches(1)`)
El nodo `Sequential Video Batch` usa `batchSize=1` deliberadamente. Remotion usa Puppeteer (Chrome headless) para renderizar — dos renders simultáneos saturarían la CPU y corromperían los logs. El procesamiento secuencial es la solución correcta y está bien documentada en el sticky note de FASE 4 del workflow.

### Server de render independiente (`server/`)
El archivo `server.ts` en la raíz del proyecto está **completamente comentado** a propósito. El server activo vive en `server/` como un paquete Node.js independiente con su propio `package.json` y tipos. Esto permite que el server de render sea deployable de forma autónoma sin depender del build de Remotion.

### Vocabulario desacoplado del script
El vocabulario se extrae en un paso separado (FASE 2, nodo `Gemini - Extract Vocabulary`) usando el guion como input. Esto garantiza que los términos del vocabulario aparezcan **efectivamente en el audio** (no son solo términos relacionados con el tema) y que el sistema de karaoke (`useVocabMatch.ts`) pueda resaltarlos cuando el locutor los pronuncia.
