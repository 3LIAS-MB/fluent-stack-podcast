import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { VocabularyItem } from '../types';

interface VocabCardProps {
  vocab: VocabularyItem;
  delayFrames?: number;
  displayDurationFrames?: number;
}

export const VocabCard: React.FC<VocabCardProps> = ({
  vocab,
  delayFrames = 0,
  displayDurationFrames = 120,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const adjustedFrame = frame - delayFrames;

  if (adjustedFrame < 0) {
    return null;
  }

  const progress = spring({
    frame: adjustedFrame,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  const opacity = interpolate(progress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const translateY = interpolate(progress, [0, 1], [50, 0]);

  if (adjustedFrame > displayDurationFrames) {
    return null;
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: `translate(-50%, -50%) translateY(${translateY}px)`,
        opacity,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: '16px',
        padding: '32px 48px',
        border: '1px solid rgba(255, 215, 0, 0.3)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        textAlign: 'center',
        maxWidth: '600px',
      }}
    >
      <div
        style={{
          color: '#FFD700',
          fontSize: '32px',
          fontWeight: 800,
          marginBottom: '16px',
          textShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
        }}
      >
        {vocab.term}
      </div>
      <div
        style={{
          color: '#FFFFFF',
          fontSize: '24px',
          lineHeight: 1.5,
        }}
      >
        {vocab.definition}
      </div>
      {vocab.example && (
        <div
          style={{
            color: '#AAAAAA',
            fontSize: '18px',
            fontStyle: 'italic',
            marginTop: '16px',
          }}
        >
          "{vocab.example}"
        </div>
      )}
    </div>
  );
};
