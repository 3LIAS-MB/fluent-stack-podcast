import path from 'path';
import fs from 'fs';
import { bundle } from '@remotion/bundler';
import { getCompositions, renderMedia } from '@remotion/renderer';
import { Captions, RenderOptions, RenderRequest } from '../types';
import { appendVocabToVideo } from './vocabImage';

const ffmpegPath: string = require('ffmpeg-static');
const ffprobePath: string = require('ffprobe-static').path;

const OUTPUT_DIR = path.join(process.cwd(), 'output');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

export function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
}

export async function renderVideo(
  data: RenderRequest,
  captions: Captions,
  localAudioFile: string,
  localImageFile: string,
  port: number
): Promise<string> {
  const compositionId = data.outputFormat === '16:9' ? 'PodcastVideo' : 'PodcastVideoShort';
  const sanitizedTitle = sanitizeFilename(data.title);
  const outputFile = `episode-${sanitizedTitle}-${data.outputFormat.replace(':', 'x')}.mp4`;
  const outputPath = path.join(OUTPUT_DIR, outputFile);

  const localAudioUrl = `http://localhost:${port}/temp/${path.basename(localAudioFile)}`;
  const localImageUrl = `http://localhost:${port}/temp/${path.basename(localImageFile)}`;
  console.log(`Audio local:  ${localAudioUrl}`);
  console.log(`Imagen local: ${localImageUrl}`);

  const inputProps = {
    audioUrl: localAudioUrl,
    imageUrl: localImageUrl,
    vocabulary: data.vocabulary,
    title: data.title,
    level: data.level,
    format: data.format,
    captions: captions,
  };

  console.log(`Ejecutando render programático: ${compositionId}`);

  console.log('Bundling Remotion project...');
  const bundleLocation = await bundle(
    path.join(process.cwd(), 'src', 'Root.tsx'),
    (progress) => {
      process.stdout.write(`\rBundling: ${Math.round(progress * 100)}%`);
    }
  );
  console.log('\nBundle completo:', bundleLocation);

  console.log('Obteniendo composiciones...');
  const compositions = await getCompositions(bundleLocation, {
    inputProps,
    ffmpegExecutable: ffmpegPath,
    ffprobeExecutable: ffprobePath,
  });
  const composition = compositions.find((c) => c.id === compositionId);

  if (!composition) {
    throw new Error(
      `Composición '${compositionId}' no encontrada. Disponibles: ${compositions.map(c => c.id).join(', ')}`
    );
  }

  // ── Calcular duración real (solo audio, el vocab se añade post-proceso) ───
  const FPS = 30;
  const AUDIO_BUFFER_FRAMES = 15; // 0.5s buffer para que la última palabra no se corte
  const lastWord = captions.words[captions.words.length - 1];
  const audioDurationFrames = lastWord
    ? Math.ceil(lastWord.end * FPS) + AUDIO_BUFFER_FRAMES
    : 300;

  console.log(`\nDuración calculada:`);
  console.log(`  Audio: ${(audioDurationFrames / FPS).toFixed(1)}s (${audioDurationFrames} frames)`);
  console.log(`  Vocab: imagen estática 30s (post-proceso ffmpeg)`);

  const compositionWithRealDuration = {
    ...composition,
    durationInFrames: audioDurationFrames,
  };

  // Pasar vocabulary vacío al renderer — el vocab se hace via imagen estática
  const inputPropsWithoutVocab = {
    ...inputProps,
    vocabulary: [],
  };

  console.log('Rendering media (solo audio)...');
  await renderMedia({
    composition: compositionWithRealDuration,
    serveUrl: bundleLocation,
    codec: 'h264',
    outputLocation: outputPath,
    inputProps: inputPropsWithoutVocab,
    ffmpegExecutable: ffmpegPath,
    ffprobeExecutable: ffprobePath,
    onProgress: ({ renderedFrames }) => {
      const pct = Math.round((renderedFrames / audioDurationFrames) * 100);
      process.stdout.write(`\rRender: ${renderedFrames}/${audioDurationFrames} frames (${pct}%)`);
    },
  });

  // ── Post-proceso: agregar vocab slide como imagen estática 30s ────────────
  const isShort = data.outputFormat === '9:16';
  const vocabWidth = isShort ? 1080 : 1920;
  const vocabHeight = isShort ? 1920 : 1080;
  await appendVocabToVideo(
    Array.isArray(data.vocabulary) ? data.vocabulary : [],
    outputPath,
    data.title,
    data.level,
    30,          // 30 segundos de vocab slide
    vocabWidth,
    vocabHeight
  );

  console.log('\nRender completado:', outputPath);
  return outputPath;
}

export function getOutputDir(): string {
  return OUTPUT_DIR;
}
