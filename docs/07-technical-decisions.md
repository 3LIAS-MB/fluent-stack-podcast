# 🔧 Registro de Decisiones Técnicas y Gaps

Este documento registra los problemas conocidos, desafíos arquitectónicos y cómo se resolvieron para asegurar la estabilidad del sistema.

## Decisión #1 — Arquitectura Monorepo (NPM Workspaces)

**Problema**: El servidor de backend y el motor de video compartían una arquitectura monolítica difícil de mantener y desplegar por separado.
**Solución**: Se migró a un monorepo con NPM Workspaces. Esto permite desacoplar los ciclos de desarrollo y build de la API y el Video, mientras se comparten los tipos de TypeScript (`packages/shared`).

## Decisión #2 — Normalización de Niveles (Dual Layer)

**Problema**: Airtable envía nombres largos (`Intermediate B1-B2`) pero el motor de video requiere tipos específicos.
**Solución**: Se implementó una normalización en el servidor (`render.ts`) y se ajustaron los tipos en el motor de video para aceptar ambos formatos, eliminando errores de validación.

## Decisión #3 — Cola de Renderizado Serial (Batch Size 1)

**Problema**: Múltiples renders simultáneos saturan la CPU y corrompen los logs de renderizado.
**Solución**: Se implementó una cola de renderizado en el backend y se configuró el workflow de n8n para enviar peticiones una por una (`SplitInBatches(1)`).

## Decisión #4 — Inyección de Props en el Bundle

**Problema**: Remotion necesita inyectar datos de audio y transcripciones dinámicamente en tiempo de renderizado.
**Solución**: Se utiliza la función `bundle` de Remotion para crear un paquete temporal y se pasan los `inputProps` en el comando `renderMedia`, asegurando que cada video sea único sin recompilar todo el proyecto.

## Gaps Conocidos

- **FFmpeg**: El sistema asume que `ffmpeg` está en el PATH global del sistema. En entornos Docker, esto debe asegurarse en la imagen base.
- **Limpieza de Temporales**: Los archivos en la carpeta `temp/` de la API deben ser monitoreados para evitar el llenado del disco en producciones masivas.
