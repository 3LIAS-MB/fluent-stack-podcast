import path from 'path';
import fs from 'fs';
import { bundle } from '@remotion/bundler';
import { getCompositions, renderMedia } from '@remotion/renderer';
import { Captions, RenderOptions, RenderRequest } from '../types';
// appendVocabToVideo eliminado: el vocab ahora lo renderiza Remotion via VocabRecap.tsx

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

  // ── Calcular duración total: audio + vocab paginado ─────────────────────
  const FPS = 30;
  const AUDIO_BUFFER_FRAMES = 15;
  const ITEMS_PER_PAGE = 8; // Importante: sincronizado con PodcastVideo.tsx
  const FRAMES_PER_PAGE = 150; // 5s × 30fps — igual que VocabRecap.tsx

  const lastWord = captions.words[captions.words.length - 1];
  const audioDurationFrames = lastWord
    ? Math.ceil(lastWord.end * FPS) + AUDIO_BUFFER_FRAMES
    : 300;

  let validVocabCount = 0;
  let rawVocab = data.vocabulary;

  if (typeof rawVocab === 'string') {
    try { rawVocab = JSON.parse(rawVocab); } catch (e) { rawVocab = []; }
  }

  if (Array.isArray(rawVocab)) {
    const rawArr = rawVocab as any[];
    const isCategory = rawArr.length > 0 && rawArr[0].category !== undefined && Array.isArray(rawArr[0].items);
    if (isCategory) {
      validVocabCount = rawArr.reduce((acc: number, cat: any) => acc + (cat.items?.length || 0), 0);
    } else {
      validVocabCount = rawArr.length;
    }
  }

  const pageCount = validVocabCount > 0 ? Math.ceil(validVocabCount / ITEMS_PER_PAGE) : 0;
  const vocabDurationFrames = pageCount * FRAMES_PER_PAGE;
  const totalDurationFrames = audioDurationFrames + vocabDurationFrames;

  console.log(`  🎬 Total: ${(totalDurationFrames / FPS).toFixed(1)}s (${totalDurationFrames} frames)`);

  const compositionWithRealDuration = {
    ...composition,
    durationInFrames: totalDurationFrames,
  };

  console.log('Rendering media (audio + vocab via Remotion)...');
  await renderMedia({
    composition: compositionWithRealDuration,
    serveUrl: bundleLocation,
    codec: 'h264',
    outputLocation: outputPath,
    inputProps,
    ffmpegExecutable: ffmpegPath,
    ffprobeExecutable: ffprobePath,
    onProgress: ({ renderedFrames }) => {
      const pct = Math.round((renderedFrames / totalDurationFrames) * 100);
      process.stdout.write(`\rRender: ${renderedFrames}/${totalDurationFrames} frames (${pct}%)`);
    },
  });

  console.log(`\n  ✓ Video listo: ${path.basename(outputPath)}`);
  return outputPath;
}

export function getOutputDir(): string {
  return OUTPUT_DIR;
}
