import path from 'path';
import fs from 'fs';
import { bundle } from '@remotion/bundler';
import { getCompositions, renderMedia } from '@remotion/renderer';
import { Captions, RenderOptions, RenderRequest, normalizeVocabulary, paginateVocabulary } from '@fluent-stack/shared';
import { z } from 'zod';


const ffmpegPath: string = require('ffmpeg-static');
const ffprobePath: string = require('ffprobe-static').path;

const OUTPUT_DIR = path.join(process.cwd(), 'output');

// Output directory ensure
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

export function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
}

/**
 * Convierte segundos a formato MM:SS
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Genera una barra de progreso visual
 */
function getProgressBar(pct: number, length: number = 15): string {
  const filledLength = Math.round((length * pct) / 100);
  const bar = '█'.repeat(filledLength) + '░'.repeat(length - filledLength);
  return `[${bar}]`;
}

/**
 * Formatea bytes a MB/KB
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

  const audioSize = formatBytes(fs.statSync(localAudioFile).size);
  const imageSize = formatBytes(fs.statSync(localImageFile).size);

  const inputProps = {
    audioUrl: localAudioUrl,
    imageUrl: localImageUrl,
    vocabulary: data.vocabulary,
    title: data.title,
    level: data.level,
    format: data.format,
    captions: captions,
  };

  console.log(`🎬 INICIANDO RENDER: (${data.outputFormat})`);
  console.log(`📦 Assets: [Audio ${audioSize}] [Imagen ${imageSize}]`);

  console.log(`Ejecutando render programático: ${compositionId}`);

  console.log('Bundling Remotion project...');
  // Buscamos Root.tsx de forma robusta tras la modularización a monorepo
  let entryPoint = path.join(process.cwd(), 'apps', 'video', 'src', 'Root.tsx');
  if (!fs.existsSync(entryPoint)) {
    // Si no está ahí, es que estamos ejecutando DESDE la carpeta apps/api
    entryPoint = path.join(process.cwd(), '..', 'video', 'src', 'Root.tsx');
  }

  if (!fs.existsSync(entryPoint)) {
    throw new Error(`Video entry point no encontrado. Intentado en:
      - ${path.join(process.cwd(), 'apps', 'video', 'src', 'Root.tsx')}
      - ${path.join(process.cwd(), '..', 'video', 'src', 'Root.tsx')}`);
  }

  const bundleLocation = await bundle({
    entryPoint,
    onProgress: (progress) => {
      const p = progress > 1 ? progress / 100 : progress;
      process.stdout.write(`\rBundling: ${Math.round(p * 100)}%`);
    }
  });
  const PodcastVideoSchema = z.object({
    audioUrl: z.string(),
    imageUrl: z.string(),
    vocabulary: z.any(),
    title: z.string(),
    level: z.enum([
      'beginner', 'intermediate', 'advanced',
      'Beginner A1-A2', 'Intermediate B1-B2', 'Advanced C1-C2'
    ]),
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

  try {
    PodcastVideoSchema.parse(inputProps);
  } catch (zerr: any) {
    console.error("❌ ERROR CRÍTICO: Remotion va a ignorar tus datos porque fallan el validado de Root.tsx:");
    console.error(JSON.stringify(zerr.errors || zerr.message, null, 2));
    throw new Error("Validation Error: " + zerr.message);
  }

  const compositions = await getCompositions(bundleLocation, {
    inputProps,
  });
  const composition = compositions.find((c) => c.id === compositionId);

  if (!composition) {
    throw new Error(
      `Composición '${compositionId}' no encontrada. Disponibles: ${compositions.map(c => c.id).join(', ')}`
    );
  }

  // ── Calcular duración total: audio + vocab paginado ─────────────────────
  // FIX: Usamos normalizeVocabulary + paginateVocabulary para contar páginas REALES
  // (igual que PodcastVideo.tsx y VocabRecap.tsx) — incluye filas de categorías.
  const FPS = 30;
  const AUDIO_BUFFER_FRAMES = 15;
  const ITEMS_PER_PAGE = 8;
  const FRAMES_PER_PAGE = 150; // 5s × 30fps

  const lastWord = captions.words[captions.words.length - 1];
  const audioDurationFrames = lastWord
    ? Math.ceil(lastWord.end * FPS) + AUDIO_BUFFER_FRAMES
    : 300;

  const safeVocab = normalizeVocabulary(data.vocabulary);
  const validVocabCount = safeVocab.length;
  const vocabPages = paginateVocabulary(safeVocab, ITEMS_PER_PAGE);
  const pageCount = vocabPages.length;
  const vocabDurationFrames = pageCount * FRAMES_PER_PAGE;
  const totalDurationFrames = audioDurationFrames + vocabDurationFrames;

  const audioDurSeconds = totalDurationFrames / FPS;
  const displayLevel = data.level; // ej: Intermediate B1-B2
  const transcribeMethod = (data as any).transcriptionMethod || 'local';

  console.log(`\n✅ Config : [${data.format.toUpperCase()}] [${displayLevel}] [Vocab: ${validVocabCount}] [Transcripción: ${transcribeMethod}]`);
  console.log(`🕒 Video:  ${formatTime(audioDurSeconds)} (${totalDurationFrames} frames)`);

  const compositionWithRealDuration = {
    ...composition,
    durationInFrames: totalDurationFrames,
    props: inputProps,
    defaultProps: inputProps,
  };

  console.log('\n🚀 Iniciando renderizado de frames...');
  const startTime = Date.now();
  let lastPct = -1;

  await renderMedia({
    composition: compositionWithRealDuration,
    serveUrl: bundleLocation,
    codec: 'h264',
    outputLocation: outputPath,
    inputProps,
    chromiumOptions: {
      disableWebSecurity: true,
      // Eliminamos gl: 'angle' para mayor compatibilidad en Windows
    },
    onBrowserLog: (log) => {
      const text = log.text;
      if (text.includes('google_apis') || text.includes('404 (Not Found)')) return;
      if (log.type === 'error') {
        process.stdout.write(`\n[Chrome Error] ${text}\n`);
      }
    },
    onProgress: ({ renderedFrames }) => {
      const pct = Math.floor((renderedFrames / totalDurationFrames) * 100);
      if (pct !== lastPct) {
        lastPct = pct;
        const bar = getProgressBar(pct, 20);
        process.stdout.write(`\r🚀 Renderizando: ${pct}% ${bar} (${renderedFrames}/${totalDurationFrames} frames)`);
      }
    },
  });


  const totalTimeMs = Date.now() - startTime;
  const totalTimeSecs = totalTimeMs / 1000;
  const avgFps = totalDurationFrames / totalTimeSecs;
  const finalSize = formatBytes(fs.statSync(outputPath).size);

  console.log('\n\n✨ ¡Video finalizado!');
  console.log(`⏱️ Proceso total: ${formatTime(totalTimeSecs)}`);
  console.log(`🚀 Velocidad: ${avgFps.toFixed(1)} fps`);
  console.log(`⚖️ Tamaño: ${finalSize}`);
  console.log(`📂 Archivo: ${outputFile}`);
  return outputPath;
}

export function getOutputDir(): string {
  return OUTPUT_DIR;
}
