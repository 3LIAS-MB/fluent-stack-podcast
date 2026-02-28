import { Audio, Sequence } from 'remotion';
import { CompositionProps } from '../types';
import { Background } from '../components/Background';
import { AudioWave } from '../components/AudioWave';
import { KaraokeSubtitles } from '../components/KaraokeSubtitles';
import { VocabRecap } from '../components/VocabRecap';
import { Branding } from '../components/Branding';

const VOCAB_RECAP_DURATION = 180;

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
    ? Math.ceil(captions.words[captions.words.length - 1].end * 30)
    : 0;

  const totalDuration = audioDurationFrames + VOCAB_RECAP_DURATION;

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

        <KaraokeSubtitles captions={captions} format={format} wordsPerGroup={3} />

        <Branding level={level} />
      </Sequence>

      {vocabulary.length > 0 && (
        <Sequence from={audioDurationFrames}>
          <VocabRecap
            vocabulary={vocabulary}
            startFrame={0}
          />
        </Sequence>
      )}
    </div>
  );
};
