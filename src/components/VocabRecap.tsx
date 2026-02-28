import { Sequence } from 'remotion';
import { VocabularyItem } from '../types';
import { VocabCard } from './VocabCard';

interface VocabRecapProps {
  vocabulary: VocabularyItem[];
  startFrame: number;
  cardsPerRow?: number;
}

const CARD_DISPLAY_DURATION = 90;
const CARD_TRANSITION_DURATION = 30;

export const VocabRecap: React.FC<VocabRecapProps> = ({
  vocabulary,
  startFrame,
}) => {
  // Guard defensivo: parseamos si es string (serialización de Remotion) o usamos [] si no es array
  let parsedVocab: VocabularyItem[] = vocabulary;
  if (typeof parsedVocab === 'string') {
    try { parsedVocab = JSON.parse(parsedVocab as unknown as string); } catch { parsedVocab = []; }
  }
  const safeVocabulary = Array.isArray(parsedVocab) ? parsedVocab : [];
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '8%',
          left: '50%',
          transform: 'translateX(-50%)',
          color: '#FFFFFF',
          fontSize: '48px',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '4px',
          textShadow: '0 0 20px rgba(255, 215, 0, 0.5)',
        }}
      >
        Vocabulary Recap
      </div>

      {safeVocabulary.map((vocab, index) => {
        const delay = CARD_DISPLAY_DURATION + CARD_TRANSITION_DURATION;
        const cardStartFrame = startFrame + index * delay;

        return (
          <Sequence
            key={vocab.term}
            from={cardStartFrame}
            durationInFrames={CARD_DISPLAY_DURATION}
          >
            <VocabCard
              vocab={vocab}
              delayFrames={0}
              displayDurationFrames={CARD_DISPLAY_DURATION}
            />
          </Sequence>
        );
      })}
    </div>
  );
};
