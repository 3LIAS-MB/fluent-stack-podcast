# 🎙️ Fluent Stack Podcast — Resumen Ejecutivo

## ¿Qué es?

**Fluent Stack Podcast** es una infraestructura automatizada de generación de video educativo que combina **ingeniería de software** con **aprendizaje de inglés técnico**. Esencialmente, es una "máquina de contenido" que produce videos de alta calidad para desarrolladores hispanohablantes que quieren mejorar su inglés técnico (niveles A1-C2) mientras aprenden conceptos de programación avanzados.

---

## 🎯 Propósito y Audiencia

| Aspecto               | Detalle                                                                                                        |
| --------------------- | -------------------------------------------------------------------------------------------------------------- |
| **Misión**            | Ofrecer contenido técnico de alto nivel que combine lógica de programación + vocabulario técnico en inglés     |
| **Público**           | Desarrolladores hispanohablantes de todos los niveles de inglés (A1-C2)                                        |
| **Modelo de negocio** | Monetización vía AdSense, sponsorships técnicos y crecimiento orgánico en redes (YouTube, LinkedIn, TikTok, X) |

---

## 🛠 Stack Tecnológico

| Capa                | Tecnología                     | Función                                |
| ------------------- | ------------------------------ | -------------------------------------- |
| **Motor de Video**  | Remotion 4.0 (React-based)     | Renderizado programático de videos     |
| **Bundler**         | Vite 5                         | Desarrollo y preview rápido            |
| **Backend**         | Node.js + Express + TypeScript | API de procesamiento                   |
| **Automatización**  | n8n                            | Orquestación de workflows              |
| **Síntesis de Voz** | ElevenLabs API                 | Voces IA de alta fidelidad             |
| **Transcripción**   | Faster-Whisper (Python)        | Timestamps a nivel de palabra          |
| **AI Cloud**        | OpenAI GPT-4 / Whisper         | Metadatos y respaldo                   |
| **Media**           | FFmpeg + FFprobe               | Codificación y análisis de audio/video |
| **Validación**      | Zod                            | Esquemas de datos estrictos            |

---

## ✨ Características Clave del Video

1. **Subtítulos Karaoke**: Sincronización palabra por palabra usando timestamps de Whisper
2. **Cards de Vocabulario**: Aparecen automáticamente al mencionar términos técnicos
3. **Visualización Reactiva**: Espectro de audio animado en tiempo real
4. **Personalización por Nivel**: Colores distintivos según dificultad del inglés
5. **Recapitulaciones**: Resumen automático de términos al final
6. **Branding Integrado**: Sistema consistente de logos y overlays

---

## 🎨 Sistema de Niveles (UI/UX)

| Nivel                    | Color                | Descripción                           |
| ------------------------ | -------------------- | ------------------------------------- |
| **Beginner** (A1-A2)     | 🟢 Emerald (#059669) | Vocabulario simple, frases cortas     |
| **Intermediate** (B1-B2) | 🔵 Blue (#2563EB)    | Jerga de industria, complejidad media |
| **Advanced** (C1-C2)     | 🔴 Pink (#D46AA6)    | Conceptos abstractos, deep dives      |

---

## 📺 Formatos de Contenido

| Formato              | Descripción                                  | Duración |
| -------------------- | -------------------------------------------- | -------- |
| **Duo/Podcast**      | 2-3 voces IA debatiendo temas profundos      | 5-20 min |
| **Solo/Masterclass** | Un experto explicando un concepto específico | Variable |

### Categorías Temáticas:

- **Core Engineering**: Algoritmos, Arquitectura, Bases de Datos
- **Web & Cloud**: React, Node.js, AWS/GCP/Azure
- **AI & Data Science**: LLMs, RAG, Machine Learning
- **Infrastructure**: DevOps, Kubernetes, CI/CD, Seguridad
- **Career & Growth**: Soft skills, entrevistas técnicas, negociación salarial

---

## ⚙️ Flujo de Automatización (n8n)

El sistema opera de forma "headless":

1. **n8n** envía un `POST` al endpoint `/render` con el payload del episodio
2. El **backend Node.js** procesa la solicitud
3. **Remotion** renderiza el video con los datos proporcionados
4. El video final se exporta a `/output/`

### Payload de Ejemplo:

```json
{
  "title": "Retrieval Augmented Generation",
  "level": "intermediate",
  "format": "solo",
  "audioUrl": "https://api.fluentstack.com/audio/ep1.mp3",
  "imageUrl": "https://api.fluentstack.com/images/bg1.jpg",
  "vocabulary": [
    {
      "term": "RAG",
      "definition": "Enriching LLMs with external data sources",
      "category": "AI"
    }
  ],
  "captions": {
    "words": [{ "word": "Hello", "start": 0.0, "end": 0.4, "speaker": "Host" }]
  }
}
```

---

## 📁 Estructura del Proyecto

```
src/
├── compositions/   # Escenas principales (PodcastVideo.tsx)
├── components/     # Visuales: AudioWave, KaraokeSubtitles, VocabCard
├── hooks/          # Lógica reactiva: useVocabMatch.ts
├── utils/          # Constantes: levelColors.ts, subtitleBlocks.ts
├── types/          # Definiciones de interfaces globales
└── Root.tsx        # Punto de entrada de Remotion
```

---

## 🚀 Comandos Principales

| Comando                | Función                                       |
| ---------------------- | --------------------------------------------- |
| `npm run studio`       | Abre Remotion Studio para preview interactivo |
| `npm run dev`          | Inicia entorno de desarrollo Vite             |
| `npm run render`       | Renderiza video principal (16:9)              |
| `npm run render:short` | Genera clip vertical/short                    |
| `npm run server`       | Inicia API de orquestación                    |

---

## 💡 Valor Diferencial

Este proyecto representa una **"Low-Op Content Machine"** (máquina de contenido de baja operación) que permite:

- Producción masiva de contenido educativo técnico con mínima intervención humana
- Integración perfecta de aprendizaje de inglés técnico con conceptos de ingeniería
- Escalabilidad mediante automatización completa del pipeline (generación de audio → transcripción → renderizado → publicación)

---

_© 2024 Fluent Stack Podcast — Optimizando la educación tecnológica mediante automatización de video._
