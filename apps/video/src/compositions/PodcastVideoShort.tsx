import { Audio, Sequence } from 'remotion';
import { CompositionProps, normalizeVocabulary, paginateVocabulary } from '@fluent-stack/shared';
import { Background } from '../components/ui/Background';
import { AudioWave } from '../components/ui/AudioWave';
import { KaraokeSubtitles } from '../components/features/KaraokeSubtitles';
import { VocabRecap } from '../components/features/VocabRecap';
import { Branding } from '../components/ui/Branding';


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

  const pages = paginateVocabulary(safeVocab, ITEMS_PER_PAGE);
  const pageCount = pages.length;
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
