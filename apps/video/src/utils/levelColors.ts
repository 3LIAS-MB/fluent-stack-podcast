import { EpisodeLevel } from '@fluent-stack/shared';

/**
 * Paleta canónica de colores por nivel de inglés.
 * Esta es la fuente única de verdad — todos los componentes
 * deben importar desde aquí, no definir sus propios colores.
 */
export const LEVEL_ACCENT_COLOR: Record<EpisodeLevel, string> = {
  'Beginner A1-A2':    '#059669', // Emerald
  'Intermediate B1-B2': '#2563EB', // Blue
  'Advanced C1-C2':    '#D46AA6', // Pink/Rose (Fluent Stack Brand)
  'beginner':          '#059669',
  'intermediate':      '#2563EB',
  'advanced':          '#D46AA6',
};

/**
 * Versiones "Vibrantes/Neón" para resaltar palabras clave o tarjetas activas.
 */
export const LEVEL_VIBRANT_COLOR: Record<EpisodeLevel, string> = {
  'Beginner A1-A2':    '#10B981',  // Brighter Emerald
  'Intermediate B1-B2': '#60A5FA', // Electric Blue
  'Advanced C1-C2':    '#FF2E97',  // Vibrant Neon Pink
  'beginner':          '#10B981',
  'intermediate':      '#60A5FA',
  'advanced':          '#FF2E97',
};

/** Devuelve el color de acento estándar para el nivel dado. */
export const getLevelColor = (level: EpisodeLevel): string =>
  LEVEL_ACCENT_COLOR[level] ?? LEVEL_ACCENT_COLOR['Intermediate B1-B2'];

/** Devuelve el color vibrante (resaltado) para el nivel dado. */
export const getVibrantColor = (level: EpisodeLevel): string =>
  LEVEL_VIBRANT_COLOR[level] ?? LEVEL_VIBRANT_COLOR['Intermediate B1-B2'];
