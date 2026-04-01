import React from 'react';
import {
  Composition,
  registerRoot,
  staticFile
} from 'remotion';
import { MAIN_FONT } from './utils/fonts';
import { z } from 'zod';

const fontFamily = MAIN_FONT;
import { PodcastVideo } from './compositions/PodcastVideo';
// import { PodcastVideoShort } from './compositions/PodcastVideoShort'; // desactivada por ahora

import { SHARED_AUDIO_URL, SHARED_IMAGE_URL, SHARED_TITLE, SHARED_LEVEL, SHARED_FORMAT, SHARED_CAPTIONS, SHARED_VOCABULARY } from "./data/preview-data";

const PodcastVideoSchema = z.object({
  audioUrl: z.string(),
  imageUrl: z.string(),
  vocabulary: z.any(),
  title: z.string(),
  level: z.enum(['Beginner A1-A2', 'Intermediate B1-B2', 'Advanced C1-C2']),
  format: z.enum(['solo', 'duo']),
  captions: z.object({
    words: z.array(z.object({
      word: z.string(),
      start: z.number(),
      end: z.number(),
      speaker: z.string(),
    })),
  }),
});

import { normalizeVocabulary } from './utils/vocabNormalization';
import { paginateVocabulary } from './utils/vocabPagination';

// RemotionRoot es el componente raíz: debe devolver JSX con <Composition />
const RemotionRoot: React.FC = () => {
  // Calculamos los frames del audio de preview dinámicamente para que si cambia
  // SHARED_CAPTIONS, el Studio no quede cortado ni con frames vacíos.
  const lastWord = SHARED_CAPTIONS.words[SHARED_CAPTIONS.words.length - 1];
  const previewAudioFrames = Math.ceil(lastWord.end * 30) + 15; // +15 buffer
  
  // Calculamos frames del vocabulario de manera dinámica usando la paginación inteligente:
  const safeVocab = normalizeVocabulary(SHARED_VOCABULARY);
  const pages = paginateVocabulary(safeVocab, 8); // Max 8 filas por página
  const pageCount = pages.length;
  const TOTAL_FRAMES = previewAudioFrames + pageCount * 150; // páginas × 150 frames (5s)
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
          audioUrl: staticFile(SHARED_AUDIO_URL),
          imageUrl: staticFile(SHARED_IMAGE_URL),
          vocabulary: SHARED_VOCABULARY,
          title: SHARED_TITLE,
          level: SHARED_LEVEL,
          format: SHARED_FORMAT,
          captions: SHARED_CAPTIONS,
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
          audioUrl: staticFile(SHARED_AUDIO_URL),
          imageUrl: staticFile('background3.jpg'),
          vocabulary: SHARED_VOCABULARY,
          title: SHARED_TITLE,
          level: SHARED_LEVEL,
          format: SHARED_FORMAT,
          captions: SHARED_CAPTIONS,
        }}
      /> */}
    </>
  );
};

// registerRoot recibe el componente raíz (RemotionRoot), no el video directamente
registerRoot(RemotionRoot);
