import { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { Captions, EpisodeLevel } from '../types';
import { buildSubtitleBlocks } from '../utils/subtitleBlocks';
import { getLevelColor } from '../utils/levelColors';

interface KaraokeSubtitlesProps {
  captions: Captions;
  format: 'solo' | 'duo';
  level: EpisodeLevel;
  maxWordsPerBlock?: number;
}

const COLORS = {
  Host: '#FFFFFF',
  Alex: '#FFFFFF',
  Sam: '#87CEEB',
  inactiveWord: 'rgba(255, 255, 255, 0.75)',
};

export const KaraokeSubtitles: React.FC<KaraokeSubtitlesProps> = ({
  captions,
  format,
  level,
}) => {
  const activeWordColor = getLevelColor(level);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Construir bloques una sola vez (son estáticos)
  const blocks = useMemo(() => buildSubtitleBlocks(captions.words), [captions.words]);

  if (blocks.length === 0) return null;

  // Encontrar el bloque activo: el que contiene currentTime,
  // o el último bloque que ya pasó (para mantenerlo visible entre frases)
  let activeBlockIndex = blocks.findIndex(
    (b) => currentTime >= b.start && currentTime <= b.end
  );

  if (activeBlockIndex === -1) {
    // Entre bloques: mostrar el último bloque que terminó
    const lastPassed = blocks.reduceRight((found, b, i) => {
      if (found !== -1) return found;
      return currentTime > b.end ? i : -1;
    }, -1);
    activeBlockIndex = lastPassed;
  }

  // Antes del primer bloque: no mostrar nada
  if (activeBlockIndex === -1) return null;

  const block = blocks[activeBlockIndex];

  // Encontrar la palabra activa dentro del bloque
  const activeWordAbsoluteIndex = captions.words.findIndex(
    (w) => currentTime >= w.start && currentTime < w.end
  );

  // Opacidad del bloque: fade-in rápido al entrar
  const FADE_DURATION = 0.12; // segundos
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
        backgroundColor: 'rgba(0, 0, 0, 0.58)',
        borderRadius: '12px',
        fontFamily: 'Outfit',
        opacity,
      }}
    >
      {block.words.map((word, idx) => {
        // Encontrar si esta palabra del bloque es la activa
        const isActive = activeWordAbsoluteIndex !== -1
          && word.start === captions.words[activeWordAbsoluteIndex]?.start
          && word.word === captions.words[activeWordAbsoluteIndex]?.word;

        const color = isActive ? activeWordColor : COLORS.inactiveWord;

        return (
          <span
            key={`${word.word}-${word.start}-${idx}`}
            style={{
              // margin-right explícito para que no interaccione con letterSpacing
              marginRight: idx < block.words.length - 1 ? '14px' : '0',
              fontSize: '44px',
              fontWeight: 900,
              color,
              textShadow: isActive
                ? `0 0 24px ${activeWordColor}AA, 2px 2px 6px rgba(0,0,0,0.9)`
                : '2px 2px 6px rgba(0,0,0,0.9)',
              transition: 'color 0.08s ease, text-shadow 0.08s ease',
              // transform: isActive ? 'scale(1.1)' : 'scale(1)',
              display: 'inline-block',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              lineHeight: 1.2,
            }}
          >
            {word.word}
          </span>
        );
      })}
    </div>
  );
};
