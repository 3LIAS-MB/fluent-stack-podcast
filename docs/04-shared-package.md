# 🧩 Tipos y Propiedades Compartidas (packages/shared)

Este paquete es el pegamento estructural de todo el monorepo. Asegura que los datos viajen de forma segura entre el **Servidor** y el **Video**, validando cada campo en tiempo real.

## Tipos Principales

### `RenderRequest`

Define la forma de la petición entrante desde **n8n**:

- `audioUrl`: Link público al audio.
- `imageUrl`: Imagen de fondo.
- `vocabulary`: Términos a resaltar.
- `title`: Título del episodio.
- `level`: Nivel del episodio.
- `format`: `solo` o `duo`.

### `VocabularyItem`

Contenido de cada término a resaltar:

- `term`: El nombre del término.
- `definition`: La descripción en español de lo que significa.
- `phonetic`: Cómo se pronuncia.
- `example`: Una frase de ejemplo.

### `Captions` & `Word`

Sincronización de audio y video:

- `words`: Array de objetos con `word`, `start`, `end` y `speaker`.

## Cómo Propagar Cambios de Tipos

Si necesitas agregar un nuevo campo al sistema (ej. una nueva variable de configuración de video):

1.  Actualiza la interfaz en `packages/shared/src/index.ts`.
2.  Ejecuta `npm run build` en el workspace de `shared`.
3.  Usa el nuevo campo en `apps/api` (backend) y `apps/video` (frontend).

> [!IMPORTANT]
> El uso de este paquete compartido elimina errores de "campo no definido" o discrepancias de nombres entre el servidor y el motor de video.
