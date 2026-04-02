import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { EpisodeLevel } from '../types';
import { getLevelColor, getVibrantColor } from '../utils/levelColors';
import { MAIN_FONT } from '../utils/fonts';

interface VocabCardProps {
  term: string;
  definition: string;
  category?: string;
  isVisible: boolean;
  level: EpisodeLevel;
  occurrence?: number;
  totalOccurrences?: number;
}

const BACKGROUND_COLOR = '#0A0A1A';

export const VocabCard: React.FC<VocabCardProps> = ({
  term,
  definition,
  category = 'Technical Terms',
  isVisible,
  level,
  occurrence,
  totalOccurrences,
}) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  // Factor de escala basado en render de 1920p
  const s = width / 1920;

  const standardColor = getLevelColor(level);
  const vibrantColor = getVibrantColor(level);

  // Animación de entrada/salida
  const spr = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  // Opacidad y desplazamiento
  const opacity = isVisible ? interpolate(spr, [0, 1], [0, 1]) : interpolate(spr, [0, 1], [1, 0]);
  const translateY = isVisible ? interpolate(spr, [0, 1], [35 * s, 0]) : interpolate(spr, [0, 1], [0, 15 * s]);

  if (!isVisible && opacity < 0.01) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: '64%', // Centrado equilibrado y seguro para TikTok
        left: '50%',
        transform: `translateX(-50%) translateY(${translateY}px)`,
        width: `${900 * s}px`,       // Reducido de 1100 a un término medio (antes 700)
        backgroundColor: BACKGROUND_COLOR,
        opacity,
        borderRadius: `${14 * s}px`,
        padding: `${26 * s}px ${36 * s}px`,
        display: 'flex',
        flexDirection: 'column',
        gap: `${10 * s}px`,
        border: `1px solid rgba(255, 255, 255, 0.08)`,
        borderLeft: `${6 * s}px solid ${vibrantColor}`,
        boxShadow: `0 ${30 * s}px ${60 * s}px rgba(0, 0, 0, 0.6), 0 0 ${20 * s}px ${vibrantColor}22`,
        fontFamily: MAIN_FONT,
        zIndex: 100,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <span
            style={{
              color: vibrantColor,
              fontSize: `${35 * s}px`,  // Reducido a tamaño elegante (antes 34, luego 52)
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: `${1.5 * s}px`,
              textShadow: `0 0 ${15 * s}px ${vibrantColor}44`,
            }}
          >
            {term}
          </span>
          {totalOccurrences && totalOccurrences >= 1 && occurrence && (
            <span
              style={{
                color: 'rgba(255, 255, 255, 0.45)',
                fontSize: `${20 * s}px`,
                fontWeight: 600,
                marginLeft: `${14 * s}px`,
                letterSpacing: `${1 * s}px`,
              }}
            >
              x{occurrence}
            </span>
          )}
        </div>
        <span
          style={{
            fontSize: `${20 * s}px`,  // Balanceado y sutil (antes 13, luego 22)
            color: 'rgba(255, 255, 255, 0.5)',
            textTransform: 'uppercase',
            fontWeight: 700,
            letterSpacing: `${1.5 * s}px`,
          }}
        >
          {category}
        </span>
      </div>

      <div
        style={{
          color: '#FFFFFF',
          fontSize: `${30 * s}px`,   // Excelente para leer pero sin saturar (antes 22, luego 36)
          fontWeight: 400,
          lineHeight: '1.45',
          marginTop: `${6 * s}px`,
          opacity: 0.95,
        }}
      >
        {definition}
      </div>
    </div>
  );
};
