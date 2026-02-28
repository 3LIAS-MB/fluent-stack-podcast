import React from 'react';
import {
  Composition,
  registerRoot
} from 'remotion';
import { PodcastVideo } from './compositions/PodcastVideo';
import { PodcastVideoShort } from './compositions/PodcastVideoShort';
import {
  EpisodeLevel,
  EpisodeFormat,
  Captions,
  VocabularyItem,
} from './types';

const defaultCaptions: Captions = {
  words: [
    { word: 'Welcome', start: 0, end: 0.5, speaker: 'Host' as const },
    { word: 'to', start: 0.5, end: 0.7, speaker: 'Host' as const },
    { word: 'Fluent', start: 0.7, end: 1.0, speaker: 'Host' as const },
    { word: 'Stack', start: 1.0, end: 1.3, speaker: 'Host' as const },
    { word: 'Podcast', start: 1.3, end: 1.8, speaker: 'Host' as const },
  ],
};

const defaultVocabulary: VocabularyItem[] = [
  { term: 'Debug', definition: 'To find and fix errors in code' },
  { term: 'API', definition: 'Application Programming Interface' },
];

// RemotionRoot es el componente raíz: debe devolver JSX con <Composition />
const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="PodcastVideo"
        component={PodcastVideo as any}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          audioUrl: 'https://example.com/audio.mp3',
          imageUrl: 'https://example.com/image.jpg',
          vocabulary: defaultVocabulary,
          title: 'Sample Episode',
          level: 'intermediate' as EpisodeLevel,
          format: 'solo' as EpisodeFormat,
          captions: defaultCaptions,
        }}
      />
      <Composition
        id="PodcastVideoShort"
        component={PodcastVideoShort as any}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          audioUrl: 'https://example.com/audio.mp3',
          imageUrl: 'https://example.com/image.jpg',
          vocabulary: defaultVocabulary,
          title: 'Sample Episode',
          level: 'intermediate' as EpisodeLevel,
          format: 'solo' as EpisodeFormat,
          captions: defaultCaptions,
        }}
      />
    </>
  );
};

// registerRoot recibe el componente raíz (RemotionRoot), no el video directamente
registerRoot(RemotionRoot);
