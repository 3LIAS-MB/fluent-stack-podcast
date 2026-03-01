import { EpisodeLevel } from '../types';

/**
 * Paleta canónica de colores por nivel de inglés.
 * Esta es la fuente única de verdad — todos los componentes
 * deben importar desde aquí, no definir sus propios colores.
 *
 *   Beginner   (A1-A2) → Verde Esmeralda  — calma, "vía libre"
 *   Intermediate (B1-B2) → Azul Eléctrico — confianza profesional
 *   Advanced   (C1-C2) → Púrpura          — dominio, exclusividad
 */
export const LEVEL_ACCENT_COLOR: Record<EpisodeLevel, string> = {
  beginner: '#10B981', // Emerald-500
  intermediate: '#3B82F6', // Blue-500
  advanced: '#A855F7', // Purple-500
};

// const LEVEL_COLORS: Record<EpisodeLevel, string> = {
//   beginner: '#22C55E',
//   intermediate: '#3B82F6',
//   advanced: '#EF4444',
// };

/** Devuelve el color de acento para el nivel dado. */
export const getLevelColor = (level: EpisodeLevel): string =>
  LEVEL_ACCENT_COLOR[level] ?? LEVEL_ACCENT_COLOR.intermediate;
