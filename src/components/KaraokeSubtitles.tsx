import { useCurrentFrame, useVideoConfig } from 'remotion';
import { Captions } from '../types';

interface KaraokeSubtitlesProps {
  captions: Captions;
  format: 'solo' | 'duo';
  wordsPerGroup?: number;
}

const COLORS = {
  Host: '#FFFFFF',
  Alex: '#FFFFFF',
  Sam: '#87CEEB',
  activeWord: '#FFD700',
};

export const KaraokeSubtitles: React.FC<KaraokeSubtitlesProps> = ({
  captions,
  format,
  wordsPerGroup = 4,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  const activeWordIndex = captions.words.findIndex(
    (w) => currentTime >= w.start && currentTime < w.end
  );

  if (activeWordIndex === -1) {
    return null;
  }

  const groupStart = Math.max(0, activeWordIndex - Math.floor(wordsPerGroup / 2));
  const groupEnd = Math.min(captions.words.length, groupStart + wordsPerGroup);
  const visibleWords = captions.words.slice(groupStart, groupEnd);

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
        gap: '8px',
        maxWidth: '80%',
        padding: '16px 24px',
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        borderRadius: '12px',
      }}
    >
      {visibleWords.map((word, idx) => {
        const globalIdx = groupStart + idx;
        const isActive = globalIdx === activeWordIndex;
        const speakerColor = format === 'duo'
          ? COLORS[word.speaker]
          : COLORS.Host;

        return (
          <span
            key={`${word.word}-${globalIdx}`}
            style={{
              fontSize: '44px',
              fontWeight: 900,
              color: isActive ? COLORS.activeWord : speakerColor,
              textShadow: '2px 2px 6px rgba(0,0,0,0.9)',
              transition: 'color 0.1s ease',
              transform: isActive ? 'scale(1.1)' : 'scale(1)',
              letterSpacing: '2px',
              textTransform: 'uppercase',
            }}
          >
            {word.word}
          </span>
        );
      })}
    </div>
  );
};
