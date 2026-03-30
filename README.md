# 🎙️ Fluent Stack Podcast — Video Generator (Technical Edition)

[![Remotion Framework](https://img.shields.io/badge/Powered%20by-Remotion-blue.svg)](https://www.remotion.dev/)
[![TypeScript Ecosystem](https://img.shields.io/badge/Logic-TypeScript-blue.svg)](https://www.typescriptlang.org/)
[![n8n Integration](https://img.shields.io/badge/Automation-n8n-orange.svg)](https://n8n.io/)

**Fluent Stack Podcast** es una infraestructura automatizada de generación de video educativo que opera en la intersección de la **Ingeniería de Software** y el **Aprendizaje de Inglés Técnico**. Diseñado para ser consumido como contexto por IAs y operado dinámicamente mediante flujos de automatización.

---

## 🎯 Concepto y Modelo de Negocio

### Misión y Visión
Canal educativo de alto nivel especializado en desarrolladores hispanohablantes. El objetivo es facilitar el dominio simultáneo de conceptos de ingeniería de software y el vocabulario técnico en inglés, cubriendo desde niveles **A1 hasta C2**.

### Estrategia Comercial (Monetización)
Arquitectura optimizada para la creación de contenido masivo con mínima intervención humana (Low-Op Content Machine) y alta utilidad para el público:
- **AdSense & Monetización**: Producción automatizada de contenido apto para YouTube (Long-form & Shorts).
- **Sponsorships & Placement**: Inserción dinámica de patrocinadores técnicos en la visualización de audio y overlays.
- **Social Growth**: Generación de clips de alto impacto para LinkedIn, TikTok y X para alimentar el embudo de tráfico orgánico.

---

## 🛠 Ecosistema Tecnológico (Full Stack)

Este proyecto utiliza un conjunto de herramientas de vanguardia para garantizar un rendimiento óptimo en renderizado y precisión en subtitulado:

| Categoría | Tecnología / Librería | Función Crítica |
| :--- | :--- | :--- |
| **Video Engine** | [Remotion](https://www.remotion.dev/) 4.0 | Motor de renderizado programático basado en React y Canvas. |
| **Media Utility** | **FFmpeg** & **FFprobe** | Codificación de video, extracción de audio y análisis de metadatos (static binaries). |
| **Audio Engine** | **ElevenLabs API** | Síntesis de voz premium (Text-to-Speech) de alta fidelidad. |
| **Transcription** | **Faster-Whisper (Python)** | SOTA (State-of-the-art) de transcripción con optimización CPU (int8) para timestamps a nivel de palabra. |
| **Cloud AI** | **OpenAI GPT-4 / Whisper** | Generación de metadatos, resúmenes técnicos y transcripción de respaldo. |
| **Orchestration** | **n8n.io** | Backend de automatización que conecta Airtable, Audio y el Trigger de Renderizado. |
| **Backend Layer** | Node.js + Express | API de procesamiento y comunicación entre el motor de video y los scripts de automación. |
| **Typing & Logic** | TypeScript + **Zod** | Tipado estricto y validación de esquemas de datos en tiempo de ejecución. |
| **Development** | Vite 5 + React 17 | Bundler de alta velocidad y framework de composición visual. |
| **Typography** | Google Fonts (Outfit) | Branding tipográfico canónico para legibilidad técnica. |

---

## 📺 Estrategia de Contenido

### Formatos de Producción
- **Duo (Podcast)**: Diálogo entre 2-3 voces IA con debates profundos.
- **Solo (Masterclass)**: Una voz experta explicando conceptos únicos con visuales focalizados.

### Taxonomía de Categorías (Ingeniería)
| Área | Tópicos |
| :--- | :--- |
| **Fundamentals** | Algorithms, Big O, Data Structures. |
| **Engineering** | Architecture, System Design, Frameworks (React/Node), Cloud (AWS). |
| **Data & AI** | RAG, LLMs, ML Pipelines, Data Engineering. |
| **Quality & Ops** | Testing (Cypress/Jest), DevOps (K8s/Docker), Security (OAuth). |
| **Interviews** | Technical English, Salary Negotiation, Soft Skills for Engineers. |

### Framework de Niveles (Source of Truth)
Definido en `src/utils/levelColors.ts` para orquestar la UI:
- **Beginner (A1-A2)**: Color: 🟢 Emerald (`#059669`). Vocabulario base, frases cortas.
- **Intermediate (B1-B2)**: Color: 🔵 Blue (`#2563EB`). Jerga de industria, complejidad media.
- **Advanced (C1-C2)**: Color: 🔴 Pink (`#D46AA6`). Conceptos abstractos, jerga nativa, deep dives.

---

## 📡 Integración de Datos (n8n Payload)

El sistema espera un `POST` al endpoint `/render` con la siguiente estructura de datos:

```json
{
  "title": "Scaling Distributed Systems",
  "level": "advanced",
  "audioUrl": "https://cdn.fluentstack.com/audio/ep-42.mp3",
  "imageUrl": "https://cdn.fluentstack.com/assets/bg-42.jpg",
  "vocabulary": [
    { "term": "Eventual Consistency", "definition": "State replication strategy in distributed DBs" }
  ],
  "captions": {
    "words": [{ "word": "Microservices", "start": 0.45, "end": 1.20 }]
  }
}
```

---

## 📂 Arquitectura de Código

```bash
src/
├── compositions/   # Lógica principal del layout de video.
├── components/     # Piezas visuales: AudioWave, Subtitles (Word-by-word), VocabCards.
├── hooks/          # useVocabMatch.ts (Sincronización términos-audio).
├── utils/          # levelColors.ts, subtitleBlocks.ts.
├── types/          # Definiciones de interfaces globales.
└── Root.tsx        # Punto de entrada de registro de Remotion.
```

---

## 🚀 Operación Técnica

### Instalación
Requiere Node.js 18+ y FFmpeg disponible en el PATH global (mandatorio para render).
```bash
npm install                     # Instalación de dependencias Core
npm run studio                  # Entorno visual interactivo de depuración
npm run server                  # Inicia la API de orquestación local
npm run render                  # Renderizado de video en producción
```

---
© 2024 Fluent Stack Podcast. Optimizando la educación tecnológica mediante automatización de video.
