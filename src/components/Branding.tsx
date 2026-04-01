import { useVideoConfig } from 'remotion';
import { EpisodeLevel } from '../types';
import { LEVEL_ACCENT_COLOR } from '../utils/levelColors';
import { MAIN_FONT } from '../utils/fonts';

interface BrandingProps {
  level: EpisodeLevel;
}

// Mapeo de nombre largo del tipo EpisodeLevel a etiqueta corta para el UI
const LEVEL_LABELS: Record<EpisodeLevel, string> = {
  'Beginner A1-A2': 'Beginner',
  'Intermediate B1-B2': 'Intermediate',
  'Advanced C1-C2': 'Advanced',
};

export const Branding: React.FC<BrandingProps> = ({ level }) => {
  // Aseguramos que el level sea uno de los válidos, si no usamos Beginner por defecto.
  const normalizedLevel: EpisodeLevel = 
    (Object.keys(LEVEL_LABELS) as EpisodeLevel[]).includes(level) 
      ? level 
      : 'Beginner A1-A2';

  // Escala todos los tamaños en proporción al canvas real (1920px base).
  const { width } = useVideoConfig();
  const s = width / 1920;

  const accentColor = LEVEL_ACCENT_COLOR[normalizedLevel] || LEVEL_ACCENT_COLOR['Beginner A1-A2'];

  return (
    <>
      {/* Título del Podcast (Top-Left) */}
      <div
        style={{
          position: 'absolute',
          top: Math.round(24 * s),
          left: Math.round(24 * s),
          display: 'flex',
          alignItems: 'center',
          gap: Math.round(12 * s),
        }}
      >
        <div
          style={{
            color: '#FFFFFF',
            fontSize: Math.round(28 * s),
            fontWeight: 700,
            letterSpacing: 1,
            fontFamily: MAIN_FONT,
            textShadow: `${2 * s}px ${2 * s}px ${4 * s}px rgba(0,0,0,0.8)`,
          }}
        >
          FLUENT STACK PODCAST
        </div>
      </div>

      {/* Etiqueta de Nivel (Top-Right) */}
      <div
        style={{
          position: 'absolute',
          top: Math.round(24 * s),
          right: Math.round(24 * s),
          backgroundColor: accentColor,
          color: '#FFFFFF',
          fontSize: Math.round(22 * s),
          fontWeight: 700,
          padding: `${Math.round(8 * s)}px ${Math.round(20 * s)}px`,
          borderRadius: Math.round(12 * s),
          fontFamily: MAIN_FONT,
          textTransform: 'uppercase',
          letterSpacing: 1,
          boxShadow: `0 4px 12px ${accentColor}14, 0 2px 4px rgba(0,0,0,0.2)`,
        }}
      >
        {LEVEL_LABELS[normalizedLevel]}
      </div>
    </>
  );
};
