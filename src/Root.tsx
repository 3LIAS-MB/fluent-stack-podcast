import React from 'react';
import {
  Composition,
  registerRoot,
  staticFile
} from 'remotion';
import { loadFont } from '@remotion/google-fonts/Outfit';
import { z } from 'zod';

const { fontFamily } = loadFont();
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
    { word: 'Today', start: 2.0, end: 2.4, speaker: 'Host' as const },
    { word: "we're", start: 2.4, end: 2.7, speaker: 'Host' as const },
    { word: 'talking', start: 2.7, end: 3.1, speaker: 'Host' as const },
    { word: 'about', start: 3.1, end: 3.5, speaker: 'Host' as const },
    { word: 'APIs', start: 3.5, end: 4.0, speaker: 'Host' as const },
    { word: 'and', start: 4.0, end: 4.3, speaker: 'Host' as const },
    { word: 'how', start: 4.3, end: 4.6, speaker: 'Host' as const },
    { word: 'they', start: 4.6, end: 4.8, speaker: 'Host' as const },
    { word: 'power', start: 4.8, end: 5.2, speaker: 'Host' as const },
    { word: 'modern', start: 5.2, end: 5.7, speaker: 'Host' as const },
    { word: 'software', start: 5.7, end: 6.2, speaker: 'Host' as const },
    { word: 'Let', start: 6.4, end: 6.6, speaker: 'Host' as const },
    { word: 'us', start: 6.6, end: 6.8, speaker: 'Host' as const },
    { word: 'dive', start: 6.8, end: 7.1, speaker: 'Host' as const },
    { word: 'in', start: 7.1, end: 7.3, speaker: 'Host' as const },
    { word: 'and', start: 7.3, end: 7.5, speaker: 'Host' as const },
    { word: 'explore', start: 7.5, end: 8.0, speaker: 'Host' as const },
    { word: 'REST', start: 8.0, end: 8.4, speaker: 'Host' as const },
    { word: 'GraphQL', start: 8.4, end: 9.0, speaker: 'Host' as const },
    { word: 'and', start: 9.0, end: 9.2, speaker: 'Host' as const },
    { word: 'beyond', start: 9.2, end: 9.8, speaker: 'Host' as const },
  ],
};

// Preview vocabulary — 5 items por categoría (20 total = 2 páginas)
const defaultVocabulary: VocabularyItem[] = [
  { term: 'Pull request', definition: 'Propose changes to a codebase for review', category: 'Technical Terms' },
  { term: 'Merge conflict', definition: 'Incompatible changes in two branches of code', category: 'Technical Terms' },
  { term: 'Refactor', definition: 'Restructure code without changing its behavior', category: 'Technical Terms' },
  { term: 'Deploy', definition: 'Release code to a production environment', category: 'Technical Terms' },
  { term: 'Debug', definition: 'Find and fix errors in code', category: 'Technical Terms' },
  { term: 'Run into', definition: 'To encounter a problem unexpectedly', category: 'Phrasal Verbs' },
  { term: 'Figure out', definition: 'To understand or solve something', category: 'Phrasal Verbs' },
  { term: 'Break down', definition: 'To stop working or to analyze in detail', category: 'Phrasal Verbs' },
  { term: 'Set up', definition: 'To configure or prepare something for use', category: 'Phrasal Verbs' },
  { term: 'Roll back', definition: 'To revert to a previous stable version', category: 'Phrasal Verbs' },
  { term: 'At the end of the day', definition: 'Ultimately; when everything is considered', category: 'Collocation' },
  { term: 'On the same page', definition: 'Having the same understanding or goal', category: 'Collocation' },
  { term: 'Under the hood', definition: 'Internal workings behind the interface', category: 'Collocation' },
  { term: 'Ship a feature', definition: 'Release a new capability to users', category: 'Collocation' },
  { term: 'Handle edge cases', definition: 'Deal with unusual or extreme scenarios', category: 'Collocation' },
  { term: 'Walk me through', definition: 'Explain step by step how you did something', category: 'Interview Expressions' },
  { term: 'Talk me through', definition: 'Please explain this to me in detail', category: 'Interview Expressions' },
  { term: 'How would you approach', definition: 'What is your strategy for solving this?', category: 'Interview Expressions' },
  { term: 'In my experience', definition: 'Based on what I have seen or done before', category: 'Interview Expressions' },
  { term: 'The trade-off is', definition: 'The compromise between two options is...', category: 'Interview Expressions' },
];

const PodcastVideoSchema = z.object({
  audioUrl: z.string(),
  imageUrl: z.string(),
  vocabulary: z.array(z.object({
    term: z.string(),
    definition: z.string(),
    example: z.string().optional(),
    category: z.string().optional(),
  })),
  title: z.string(),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  format: z.enum(['solo', 'duo']),
  captions: z.object({
    words: z.array(z.object({
      word: z.string(),
      start: z.number(),
      end: z.number(),
      speaker: z.enum(['Host', 'Alex', 'Sam']),
    })),
  }),
});

// RemotionRoot es el componente raíz: debe devolver JSX con <Composition />
const RemotionRoot: React.FC = () => {
  // Duración: audio preview (~9.8s ≈ 294 frames) + 2 páginas vocab × 150 frames + buffer
  const TOTAL_FRAMES = 294 + 2 * 150 + 15;
  return (
    <>
      <Composition
        id="PodcastVideo"
        component={PodcastVideo as any}
        durationInFrames={TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
        schema={PodcastVideoSchema}
        defaultProps={{
          audioUrl: staticFile('ElevenLabs2.mp3'),
          imageUrl: staticFile('background.jpg'),
          vocabulary: defaultVocabulary,
          title: 'API Design Patterns: REST, GraphQL & Beyond',
          level: 'intermediate' as EpisodeLevel,
          format: 'solo' as EpisodeFormat,
          captions: defaultCaptions,
        }}
      />
      {/* <Composition
        id="PodcastVideoShort"
        component={PodcastVideoShort as any}
        durationInFrames={TOTAL_FRAMES}
        fps={30}
        width={1080}
        height={1920}
        schema={PodcastVideoSchema}
        defaultProps={{
          audioUrl: staticFile('ElevenLabs2.mp3'),
          imageUrl: staticFile('background3.jpg'),
          vocabulary: defaultVocabulary,
          title: 'API Design Patterns: REST, GraphQL & Beyond',
          level: 'intermediate' as EpisodeLevel,
          format: 'solo' as EpisodeFormat,
          captions: defaultCaptions,
        }}
      /> */}
    </>
  );
};

// registerRoot recibe el componente raíz (RemotionRoot), no el video directamente
registerRoot(RemotionRoot);
