import { useVideoConfig } from 'remotion';
import { EpisodeLevel } from '../types';
import { LEVEL_ACCENT_COLOR } from '../utils/levelColors';
import { MAIN_FONT } from '../utils/fonts';

interface BrandingProps {
  level: EpisodeLevel;
}


const LEVEL_LABELS: Record<EpisodeLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export const Branding: React.FC<BrandingProps> = ({ level }) => {
  // n8n puede enviar "intermediate b1-b2", "Intermediate", etc.
  // Extraemos solo la primera palabra y la buscamos entre las keys conocidas.
  const VALID_LEVELS: EpisodeLevel[] = ['beginner', 'intermediate', 'advanced'];
  const rawLevel = typeof level === 'string' ? level.toLowerCase() : '';
  const normalizedLevel: EpisodeLevel =
    VALID_LEVELS.find((l) => rawLevel.includes(l)) ?? 'beginner';

  // Escala todos los tamaños en proporción al canvas real.
  // Diseñado a 1920px → en preview (escalado por Remotion Player) se ve idéntico.
  const { width } = useVideoConfig();
  const s = width / 1920;

  return (
    <>
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

      <div
        style={{
          position: 'absolute',
          top: Math.round(24 * s),
          right: Math.round(24 * s),
          backgroundColor: LEVEL_ACCENT_COLOR[normalizedLevel],
          color: '#FFFFFF',
          fontSize: Math.round(22 * s),
          fontWeight: 700,
          padding: `${Math.round(8 * s)}px ${Math.round(20 * s)}px`,
          borderRadius: Math.round(12 * s),
          fontFamily: MAIN_FONT,
          textTransform: 'uppercase',
          letterSpacing: 1,
          boxShadow: `0 4px 12px ${LEVEL_ACCENT_COLOR[normalizedLevel]}14, 0 2px 4px rgba(0,0,0,0.2)`,
          // boxShadow: `0 4px 12px rgba(0,0,0,0.3)`,
        }}
      >
        {LEVEL_LABELS[normalizedLevel]}
      </div>
    </>
  );
};
