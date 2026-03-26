# UI Components - AI Context

## 🎨 Guía de Estilo
- **Premium Aesthetics**: Todos los componentes deben usar bordes redondeados suaves, sombras sutiles y gradientes coherentes.
- **Micro-interacciones**: Añadir efectos de hover y transiciones suaves (ej. `transform: scale(1.05)`).
- **Responsive**: Aunque son videos (dimensiones fijas), los componentes deben ser flexibles para adaptarse a diferentes resoluciones (Podcast vs Shorts).

## 🛠 Bibliotecas y Utilidades
- **Remotion**: Usar `interpolate`, `spring` y `Sequence` para cualquier animación. Evitar CSS keyframes manuales si es posible.
- **SVG**: Preferir SVGs para iconos y visualizaciones dinámicas (ej. Waveforms).

## 📋 Reglas de Desarrollo
- Separar la lógica pesada en `utils/` o hooks personalizados dentro de `src/utils/`.
- Cada componente debe estar tipado con una interfaz de Props clara.
- Seguir las reglas de `.agents/skills/remotion-best-practices/rules/text-animations.md` para textos.
