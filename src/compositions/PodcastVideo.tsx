import { Audio, Sequence } from 'remotion';
import { CompositionProps } from '../types';
import { Background } from '../components/Background';
import { AudioWave } from '../components/AudioWave';
import { KaraokeSubtitles } from '../components/KaraokeSubtitles';
import { VocabRecap } from '../components/VocabRecap';
import { Branding } from '../components/Branding';

const AUDIO_BUFFER_FRAMES = 15;
const CARD_DURATION = 90;
const CARD_TRANSITION = 30;

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

  // Remotion serializa inputProps como JSON al pasar al browser sandbox del renderer.
  // Por seguridad, parseamos vocabulary si llega como string.
  let parsedVocab: typeof vocabulary = vocabulary;
  if (typeof parsedVocab === 'string') {
    try { parsedVocab = JSON.parse(parsedVocab as unknown as string); } catch { parsedVocab = [] as any; }
  }
  const safeVocab = Array.isArray(parsedVocab) ? parsedVocab : [];
  const vocabRecapDuration = safeVocab.length > 0
    ? safeVocab.length * (CARD_DURATION + CARD_TRANSITION) + 30
    : 0;

  const totalDuration = audioDurationFrames + vocabRecapDuration;

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

        <AudioWave audioSrc={audioUrl} heightPercent={8} color="white" />

        <KaraokeSubtitles captions={captions} format={format} wordsPerGroup={4} />

        <Branding level={level} />
      </Sequence>

      {safeVocab.length > 0 && (
        <Sequence from={audioDurationFrames}>
          <VocabRecap
            vocabulary={safeVocab}
            startFrame={0}
          />
        </Sequence>
      )}
    </div>
  );
};
