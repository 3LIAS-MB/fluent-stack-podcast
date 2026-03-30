import { Audio, Sequence } from 'remotion';
import { CompositionProps } from '../types';
import { Background } from '../components/Background';
import { AudioWave } from '../components/AudioWave';
import { KaraokeSubtitles } from '../components/KaraokeSubtitles';
import { VocabRecap } from '../components/VocabRecap';
import { Branding } from '../components/Branding';
import { DynamicVocabLayer } from '../components/DynamicVocabLayer';
import { getLevelColor } from '../utils/levelColors';
import { normalizeVocabulary } from '../utils/vocabNormalization';

const AUDIO_BUFFER_FRAMES = 15;

// Constantes de paginación — deben coincidir con VocabRecap.tsx y vocabImage.ts
const ITEMS_PER_PAGE = 8;
const FRAMES_PER_PAGE = 150; // 5s × 30fps

export const PodcastVideo: React.FC<CompositionProps> = ({
  audioUrl,
  imageUrl,
  vocabulary,
  title,
  level,
  format,
  captions,
}) => {
  const audioDurationFrames = captions.words.length > 0
    ? Math.ceil(captions.words[captions.words.length - 1].end * 30) + AUDIO_BUFFER_FRAMES
    : 0;

  const safeVocab = normalizeVocabulary(vocabulary);

  // Duración del recap = páginas × 150 frames (igual que vocabImage.ts: páginas × 5s)
  const pageCount = safeVocab.length > 0 ? Math.ceil(safeVocab.length / ITEMS_PER_PAGE) : 0;
  const vocabRecapDuration = pageCount * FRAMES_PER_PAGE;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#000',
      }}
    >
      <Sequence from={0} durationInFrames={audioDurationFrames}>
        <Background imageUrl={imageUrl} overlayOpacity={0.5} />

        <Audio src={audioUrl} />

        <AudioWave
          audioSrc={audioUrl}
          heightPercent={8}
          color={getLevelColor(level)}
          variant="bars-under"
        />

        <KaraokeSubtitles
          captions={captions}
          format={format}
          level={level}
          vocabulary={safeVocab}
          variant="classic"
        />

        {/* Capa de vocabulario dinámico */}
        <DynamicVocabLayer
          captions={captions}
          vocabulary={safeVocab}
          level={level}
          minDurationFrames={90}
        />

        <Branding level={level} />
      </Sequence>

      {safeVocab.length > 0 && (
        <Sequence from={audioDurationFrames} durationInFrames={vocabRecapDuration}>
          <VocabRecap
            vocabulary={safeVocab}
            startFrame={0}
            title={title}
            level={level}
          />
        </Sequence>
      )}
    </div>
  );
};
