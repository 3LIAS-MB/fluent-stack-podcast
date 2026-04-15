# 🎬 Motor de Video (apps/video)

Este micro-proyecto basado en **Remotion** gestiona todas las capas visuales, animaciones y composiciones de video para el podcast.

## Estructura de Componentes

### 1. Elementos UI (`src/components/ui`)

Contiene componentes visuales puros y reutilizables:

- **`AudioWave.tsx`**: Visualizador de ondas sonoras dinámico con múltiples variantes (`stoic`, `bars`, `wave`).
- **`Background.tsx`**: Capa base de imagen con overlay oscurecido paramétrico.
- **`Branding.tsx`**: Identidad visual ajustable por nivel (`Beginner`, `Intermediate`, `Advanced`).

### 2. Capas de Funcionalidad (`src/components/features`)

Componentes inteligentes sincronizados con el audio:

- **`KaraokeSubtitles.tsx`**: Subtítulos dinámicos con resaltado gradual y detección de términos técnicos.
- **`DynamicVocabLayer.tsx`**: Controlador de cartas de vocabulario que aparecen sincronizadas con el diálogo.
- **`VocabCard.tsx`**: Tarjetas de términos con animaciones premium de entrada/salida.
- **`VocabRecap.tsx`**: Mesa de resumen final con paginación inteligente de términos.

## Composiciones Disponibles

### `PodcastVideo` (ID: PodcastVideo)

- **Formato**: 16:9 (1920x1080).
- **Contenido**: Podcast completo, audio reactivo, subtítulos y recap final.
- **Uso**: YouTube / Formatos horizontales.

### `PodcastVideoShort` (ID: PodcastVideoShort)

- **Formato**: 9:16 (1080x1920).
- **Uso**: TikTok / Instagram Reels / YouTube Shorts.

## Tipografía y Estilo

El proyecto utiliza la fuente **Inter** (vía `@remotion/google-fonts`) para asegurar legibilidad suprema y una estética minimalista-moderna. Todos los colores se definen centralmente en `src/utils/levelColors.ts`.

## Comandos del Espacio de Trabajo

- `npm run studio`: Abre el Visualizador de Remotion en `http://localhost:3000`.
- `npm run render`: Genera el video MP4 localmente.
- `npm run check-types`: Validación de tipos específica para el video.
