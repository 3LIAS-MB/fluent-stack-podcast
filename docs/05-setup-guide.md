# ⚙️ Guía de Configuración e Instalación

Esta sección te ayudará a poner en marcha el sistema monorepo completo en tu entorno local.

## Prerrequisitos

Para ejecutar este proyecto necesitas:
- **Node.js v16+**: Entorno de ejecución para JavaScript.
- **FFmpeg**: Necesario para el renderizado de video MP4 por Remotion.
- **NPM v8+**: Gestor de paquetes con soporte para Workspaces.

## Instalación Paso a Paso

1.  **Clonar el repositorio y entrar**:
    ```bash
    git clone https://github.com/tu-repo/fluent-stack-podcast.git
    cd fluent-stack-podcast
    ```

2.  **Instalar dependencias globales**:
    ```bash
    npm install
    ```
    *Esto instalará automáticamente las dependencias de `/apps/api`, `/apps/video` y `/packages/shared` en un solo paso.*

3.  **Configurar Variables de Entorno**:
    Crea un archivo `.env` en la carpeta `apps/api/` con tu `OPENAI_API_KEY`:
    ```env
    OPENAI_API_KEY=tu_secreto_aqui
    PORT=3000
    ```

4.  **Compilar el paquete compartido**:
    ```bash
    npm run build -w @fluent-stack/shared
    ```

## Ejecución Local

### Backend (API)
Inicia el servidor en el puerto 3000:
```bash
npm run dev:api
```

### Frontend (Studio de Remotion)
Previsualiza el video en tu navegador:
```bash
npm run studio
```

## Solución de Problemas Comunes

- **Error con FFmpeg**: Asegúrate de que `ffmpeg` esté en tu variable de entorno PATH.
- **Módulos no encontrados**: Intenta borrar `node_modules` y ejecutar `npm install` nuevamente desde la raíz.
- **Error en tipos compartidos**: Si cambiaste un tipo en `packages/shared`, recuerda correr el build de dicho paquete.
