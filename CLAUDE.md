# Fluent Stack Podcast v2 - AI Project Guide

Este archivo sirve como el "cerebro" y guía principal para cualquier asistente de IA (como Antigravity o Claude) que trabaje en este repositorio.

## 🚀 Visión General

Generador automatizado de podcasts en formato de video de alta calidad, utilizando **Remotion** para la composición visual y un backend en **Node.js** para el procesamiento de datos y orquestación.

## 🛠 Tech Stack

- **Video Engine**: [Remotion](https://www.remotion.dev/) (React-based)
- **Frontend/Bundler**: [Vite](https://vitejs.dev/)
- **Backend API**: Node.js + Express + TypeScript
- **Lenguaje**: TypeScript (Estricto)
- **Styling**: Vanilla CSS (Global y por componente)

## 📋 Comandos Principales

- `npm run dev`: Inicia el entorno de desarrollo de Vite (Frontend/Preview).
- `npm run server`: Inicia el servidor backend de procesamiento.
- `npm run studio`: Abre el Remotion Studio para previsualización interactiva.
- `npm run render`: Renderiza la composición principal.
- `npm run render:short`: Renderiza un "short" (clip corto) del podcast.

## 🧠 Habilidades y Reglas (Skills)

Este proyecto utiliza un sistema de **Skills** ubicado en `.agents/skills/`.

- **Remotion Best Practices**: Reglas detalladas para animaciones, audio, subtítulos y visualización en `.agents/skills/remotion-best-practices/`.
- Siempre consulta estas reglas al modificar archivos `.tsx` en `src/`.
- **vercel-react-best-practices**: Reglas detalladas para optimización de rendimiento en aplicaciones React.

## 🏗 Arquitectura y Guías

Consulta la carpeta `docs/` para más detalles:

- [Architecture Overview](file:///c:/Users/campo/Desktop/Escritorio/Fluent-Stack-Podcast%20v2/docs/architecture.md)
- [Design Decisions](file:///c:/Users/campo/Desktop/Escritorio/Fluent-Stack-Podcast%20v2/docs/decisions/)

## 🎨 Estándares de Código

- **Excelencia Visual**: Las interfaces deben ser "premium" (gradientes suaves, micro-animaciones, tipografía moderna).
- **Tipado**: Uso obligatorio de interfaces y tipos de TypeScript. Evitar `any`.
- **Modularidad**: Dividir lógica en `utils/`, tipos en `types/` y componentes visuales en `components/`.
