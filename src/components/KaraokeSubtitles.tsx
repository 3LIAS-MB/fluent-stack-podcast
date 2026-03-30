import { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { Captions, EpisodeLevel, VocabularyItem } from '../types';
import { buildSubtitleBlocks } from '../utils/subtitleBlocks';
import { getLevelColor, getVibrantColor } from '../utils/levelColors';
import { useVocabMatch } from '../hooks/useVocabMatch';
import { MAIN_FONT } from '../utils/fonts';

interface KaraokeSubtitlesProps {
  captions: Captions;
  format: 'solo' | 'duo';
  level: EpisodeLevel;
  vocabulary: VocabularyItem[];
  variant?: 'classic' | 'fill';
}

const COLORS = {
  Host: '#FFFFFF',
  Alex: '#FFFFFF',
  Sam: '#87CEEB',
  inactiveWord: 'rgba(255, 255, 255, 0.45)',
};

export const KaraokeSubtitles: React.FC<KaraokeSubtitlesProps> = ({
  captions,
  format,
  level,
  vocabulary,
  variant = 'classic',
}) => {
  const standardColor = getLevelColor(level);
  const vibrantColor = getVibrantColor(level);

  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  // Obtenemos los matches visibles en el bloque actual
  const { visibleMatches } = useVocabMatch(captions, vocabulary);

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
        top: '35%',
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
        fontFamily: MAIN_FONT,
        opacity,
      }}
    >
      {block.words.map((word, idx) => {
        // Buscamos si esta palabra forma parte de CUALQUIERA de los matches del bloque
        const normalizedWord = word.word.toLowerCase().replace(/[.,!?;:]/g, '');
        const isVocabHighlight = visibleMatches.some(m =>
          m.item.term.toLowerCase().split(/\s+/).includes(normalizedWord)
        );

        const activeColor = isVocabHighlight ? vibrantColor : standardColor;

        let style: React.CSSProperties = {
          marginRight: idx < block.words.length - 1 ? '16px' : '0',
          fontSize: '44px',
          fontWeight: 900,
          display: 'inline-block',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          lineHeight: 1.2,
          transition: 'color 0.15s ease',
        };

        if (variant === 'classic') {
          const isActive = currentTime >= word.start && currentTime < word.end;

          style = {
            ...style,
            color: isActive ? activeColor : (isVocabHighlight ? `${vibrantColor}99` : COLORS.inactiveWord),
            textShadow: isActive
              ? `0 0 15px ${activeColor}88, 2px 2px 4px rgba(0,0,0,0.8)`
              : (isVocabHighlight ? `0 0 8px ${vibrantColor}44, 2px 2px 4px rgba(0,0,0,0.4)` : '2px 2px 6px rgba(0,0,0,0.9)'),
          };
        } else {
          // Lógica de FILL
          const isPassed = currentTime >= word.end;
          const isCurrent = currentTime >= word.start && currentTime < word.end;

          const progress = isPassed ? 1 : isCurrent
            ? interpolate(currentTime, [word.start, word.end], [0.05, 0.95])
            : 0;

          style = {
            ...style,
            backgroundImage: `linear-gradient(to right, ${activeColor} ${progress * 100}%, ${isVocabHighlight ? `${vibrantColor}66` : COLORS.inactiveWord} ${progress * 100}%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            color: 'transparent',
            filter: progress > 0 ? `drop-shadow(0 0 ${isVocabHighlight ? '6px' : '4px'} ${activeColor}${Math.floor(progress * (isVocabHighlight ? 120 : 100)).toString(16).padStart(2, '0')})` : 'none',
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
