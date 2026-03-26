import { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { Captions, EpisodeLevel } from '../types';
import { buildSubtitleBlocks } from '../utils/subtitleBlocks';
import { getLevelColor } from '../utils/levelColors';

interface KaraokeSubtitlesProps {
  captions: Captions;
  format: 'solo' | 'duo';
  level: EpisodeLevel;
  variant?: 'classic' | 'fill'; // Nueva prop para alternar estilos
}

const COLORS = {
  Host: '#FFFFFF',
  Alex: '#FFFFFF',
  Sam: '#87CEEB',
  inactiveWord: 'rgba(255, 255, 255, 0.45)', // Más tenue para resaltar el llenado
};

export const KaraokeSubtitles: React.FC<KaraokeSubtitlesProps> = ({
  captions,
  format,
  level,
  variant = 'classic',
}) => {
  const activeWordColor = getLevelColor(level);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // ... (bloques y encontrar activo - sin cambios)
  const blocks = useMemo(() => buildSubtitleBlocks(captions.words), [captions.words]);
  if (blocks.length === 0) return null;

  let activeBlockIndex = blocks.findIndex(
    (b) => currentTime >= b.start && currentTime <= b.end
  );

  if (activeBlockIndex === -1) {
    const lastPassed = blocks.reduceRight((found, b, i) => {
      if (found !== -1) return found;
      return currentTime > b.end ? i : -1;
    }, -1);
    activeBlockIndex = lastPassed;
  }

  if (activeBlockIndex === -1) return null;

  const block = blocks[activeBlockIndex];


  const FADE_DURATION = 0.12;
  let opacity = 1;
  if (currentTime >= block.start && currentTime < block.start + FADE_DURATION) {
    opacity = interpolate(currentTime, [block.start, block.start + FADE_DURATION], [0, 1]);
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: '40%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        rowGap: '6px',
        maxWidth: '82%',
        padding: '14px 28px',
        backgroundColor: 'rgba(0, 0, 0, 0.48)',
        borderRadius: '16px',
        fontFamily: 'Outfit',
        opacity,
      }}
    >
      {block.words.map((word, idx) => {
        let style: React.CSSProperties = {
          marginRight: idx < block.words.length - 1 ? '16px' : '0',
          fontSize: '44px',
          fontWeight: 900,
          display: 'inline-block',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          lineHeight: 1.2,
          transition: 'transform 0.1s ease',
        };

        if (variant === 'classic') {
          const isActive = currentTime >= word.start && currentTime < word.end;

          style = {
            ...style,
            color: isActive ? activeWordColor : COLORS.inactiveWord,
            textShadow: isActive
              ? `0 0 24px ${activeWordColor}AA, 2px 2px 6px rgba(0,0,0,0.9)`
              : '2px 2px 6px rgba(0,0,0,0.9)',
          };
        } else {
          // Lógica de FILL (progresivo)
          const isPassed = currentTime >= word.end;
          const isCurrent = currentTime >= word.start && currentTime < word.end;
          
          // Calcular el progreso dentro de la palabra (0 a 1)
          const progress = isPassed ? 1 : isCurrent 
            ? interpolate(currentTime, [word.start, word.end], [0.05, 0.95]) // margen para fluidez
            : 0;

          style = {
            ...style,
            // Truco de background-clip: text para el llenado
            backgroundImage: `linear-gradient(to right, ${activeWordColor} ${progress * 100}%, ${COLORS.inactiveWord} ${progress * 100}%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            color: 'transparent', // fallback
            filter: progress > 0 ? `drop-shadow(0 0 8px ${activeWordColor}${Math.floor(progress * 150).toString(16).padStart(2, '0')})` : 'none',
          };
        }

        return (
          <span key={`${word.word}-${word.start}-${idx}`} style={style}>
            {word.word}
          </span>
        );
      })}
    </div>
  );
};
