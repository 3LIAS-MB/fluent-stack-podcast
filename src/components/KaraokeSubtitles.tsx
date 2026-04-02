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
  Ryan: '#FFFFFF',
  Ethan: '#FFFFFF',
  Katherine: '#87CEEB',
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
  const prevBlock = activeBlockIndex > 0 ? blocks[activeBlockIndex - 1] : null;

  // ── Lógica de Continuidad ──────────────────────────────────────────────
  // Si el speaker es el mismo que el bloque anterior y no hubo un bache de tiempo largo,
  // evitamos el fade-in del tag para que no "parpadee" innecesariamente.
  const isSameSpeaker = prevBlock &&
    prevBlock.words[prevBlock.words.length - 1].speaker === block.words[0].speaker;
  const isContinuous = isSameSpeaker && (block.start - (prevBlock?.end ?? 0) < 0.5);

  // ── Opacidad palabras: fade-in suave al inicio de cada bloque (0→1 en 0.2s) ──
  const wordsOpacity = interpolate(
    currentTime,
    [block.start, block.start + 0.20],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // ── Opacidad speaker tag: sincronizada con palabras ──────────────────────
  // Si es continuo, se mantiene visible (0.9). Si es nuevo o hay bache, hace fade-in (0→0.9).
  const speakerOpacity = isContinuous
    ? 0.9
    : interpolate(
      currentTime,
      [block.start, block.start + 0.20],
      [0, 0.9],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

  const activeWord = block.words.find(w => currentTime >= w.start && currentTime < w.end) || block.words[0];
  const speakerName = `🎙️ ${activeWord.speaker.toUpperCase()}`;

  return (
    // Wrapper externo: maneja posición. Sin opacity propia — nunca parpadea.
    <div
      style={{
        position: 'absolute',
        top: '35%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        maxWidth: '82%',
        fontFamily: MAIN_FONT,
      }}
    >
      {/* Speaker tag: opacidad propia (piso 0.6), completamente desacoplado del fade de palabras */}
      <div style={{
        position: 'absolute',
        top: '-38px',
        left: '12px',
        color: vibrantColor,
        fontSize: '22px',
        fontWeight: 800,
        textTransform: 'uppercase',
        letterSpacing: '2.5px',
        textShadow: `0 0 15px ${vibrantColor}88, 0 2px 4px rgba(0,0,0,0.8)`,
        opacity: speakerOpacity,
      }}>
        {speakerName}
      </div>

      {/* Container de palabras: fade-in propio, no afecta al speaker tag */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        rowGap: '6px',
        padding: '14px 28px',
        backgroundColor: 'rgba(0, 0, 0, 0.48)',
        borderRadius: '16px',
        opacity: wordsOpacity,
      }}>
        {block.words.map((word, idx) => {
          // isVocabHighlight: ahora se basa en el índice exacto dentro del bloque 
          // garantizando que no se resalten palabras repetidas fuera del término
          const currentMatch = visibleMatches.find(m => m.wordIndices.includes(idx));
          const isVocabHighlight = !!currentMatch;

          const activeColor = isVocabHighlight ? vibrantColor : standardColor;

          // Nota: sin 'transition' CSS — no funciona en Remotion (render frame-a-frame)
          let style: React.CSSProperties = {
            marginRight: idx < block.words.length - 1 ? '16px' : '0',
            fontSize: '44px',
            fontWeight: 900,
            display: 'inline-block',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            lineHeight: 1.2,
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
            // Lógica FILL
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
              filter: progress > 0
                ? `drop-shadow(0 0 ${isVocabHighlight ? '6px' : '4px'} ${activeColor}${Math.floor(progress * (isVocabHighlight ? 120 : 100)).toString(16).padStart(2, '0')})`
                : 'none',
            };
          }

          return (
            <span key={`${word.word}-${word.start}-${idx}`} style={style}>
              {word.word}
            </span>
          );
        })}
      </div>
    </div>
  );
};
