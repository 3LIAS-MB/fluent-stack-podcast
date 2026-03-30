import { EpisodeLevel } from '../types';

/**
 * Paleta canónica de colores por nivel de inglés.
 * Esta es la fuente única de verdad — todos los componentes
 * deben importar desde aquí, no definir sus propios colores.
 */
export const LEVEL_ACCENT_COLOR: Record<EpisodeLevel, string> = {
  beginner: '#059669',     // Emerald
  intermediate: '#2563EB', // Blue
  advanced: '#D46AA6',     // Pink/Rose (Fluent Stack Brand)
};

/**
 * Versiones "Vibrantes/Neón" para resaltar palabras clave o tarjetas activas.
 */
export const LEVEL_VIBRANT_COLOR: Record<EpisodeLevel, string> = {
  beginner: '#10B981',    // Brighter Emerald
  intermediate: '#60A5FA', // Electric Blue
  advanced: '#FF2E97',    // Vibrant Neon Pink
};

/** Devuelve el color de acento estándar para el nivel dado. */
export const getLevelColor = (level: EpisodeLevel): string =>
  LEVEL_ACCENT_COLOR[level] ?? LEVEL_ACCENT_COLOR.intermediate;

/** Devuelve el color vibrante (resaltado) para el nivel dado. */
export const getVibrantColor = (level: EpisodeLevel): string =>
  LEVEL_VIBRANT_COLOR[level] ?? LEVEL_VIBRANT_COLOR.intermediate;
