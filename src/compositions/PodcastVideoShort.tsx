import { Audio, Sequence } from 'remotion';
import { CompositionProps } from '../types';
import { Background } from '../components/Background';
import { AudioWave } from '../components/AudioWave';
import { KaraokeSubtitles } from '../components/KaraokeSubtitles';
import { VocabRecap } from '../components/VocabRecap';
import { Branding } from '../components/Branding';
import { normalizeVocabulary } from '../utils/vocabNormalization';

const AUDIO_BUFFER_FRAMES = 15;
const ITEMS_PER_PAGE = 8;
const FRAMES_PER_PAGE = 150; // 5s × 30fps

export const PodcastVideoShort: React.FC<CompositionProps> = ({
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
        <Background imageUrl={imageUrl} overlayOpacity={0.6} />

        <Audio src={audioUrl} />

        <AudioWave audioSrc={audioUrl} heightPercent={8} color="white" />

        <KaraokeSubtitles captions={captions} format={format} level={level} vocabulary={safeVocab} />

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
