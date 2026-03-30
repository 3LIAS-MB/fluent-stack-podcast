import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { EpisodeLevel } from '../types';
import { getLevelColor, getVibrantColor } from '../utils/levelColors';

interface VocabCardProps {
  term: string;
  definition: string;
  category?: string;
  isVisible: boolean;
  level: EpisodeLevel;
}

const BACKGROUND_COLOR = '#0A0A1A';

export const VocabCard: React.FC<VocabCardProps> = ({
  term,
  definition,
  category = 'Technical Terms',
  isVisible,
  level,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const standardColor = getLevelColor(level);
  const vibrantColor = getVibrantColor(level);

  // Animación de entrada/salida
  const spr = spring({
    frame,
    fps,
    config: {
      damping: 12,
      stiffness: 100,
    },
  });

  // Opacidad y desplazamiento
  const opacity = isVisible ? interpolate(spr, [0, 1], [0, 1]) : interpolate(spr, [0, 1], [1, 0]);
  const translateY = isVisible ? interpolate(spr, [0, 1], [30, 0]) : interpolate(spr, [0, 1], [0, 15]);

  if (!isVisible && opacity < 0.01) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: '70%',
        left: '50%',
        transform: `translateX(-50%) translateY(${translateY}px)`,
        width: '700px',
        backgroundColor: BACKGROUND_COLOR,
        opacity,
        // opacity: opacity * 0.95,
        borderRadius: '12px',
        padding: '24px 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        border: `1px solid rgba(255, 255, 255, 0.08)`,
        borderLeft: `6px solid ${vibrantColor}`,
        boxShadow: `0 30px 60px rgba(0, 0, 0, 0.6), 0 0 20px ${vibrantColor}22`,
        fontFamily: 'Outfit',
        zIndex: 100,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span
          style={{
            color: vibrantColor,
            fontSize: '34px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '2px',
            textShadow: `0 0 15px ${vibrantColor}44`,
          }}
        >
          {term}
        </span>
        <span
          style={{
            fontSize: '13px',
            color: 'rgba(255, 255, 255, 0.4)',
            textTransform: 'uppercase',
            fontWeight: 700,
            letterSpacing: '1.5px',
          }}
        >
          {category}
        </span>
      </div>

      <div
        style={{
          color: '#FFFFFF',
          fontSize: '22px',
          fontWeight: 400,
          lineHeight: '1.45',
          marginTop: '4px',
          opacity: 0.9,
        }}
      >
        {definition}
      </div>
    </div>
  );
};
