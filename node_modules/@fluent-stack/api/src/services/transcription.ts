import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import OpenAI from 'openai';
import { Captions, TranscriptionMethod, TranscriptionResult, EpisodeFormat, Word } from '@fluent-stack/shared';
import { downloadFile, getTempDir } from './download';

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

function cleanTranscriptionText(captions: Captions): Captions {
  const fixes: Array<[RegExp, string]> = [
    [/^a1a2$/i, 'a1-a2'],
    [/^b1b2$/i, 'b1-b2'],
    [/^c1c2$/i, 'c1-c2'],
  ];

  return {
    ...captions,
    words: captions.words.map(w => {
      let newWord = w.word;
      const stripped = newWord.replace(/[.,!?;:]/g, '').toLowerCase(); // Solo para chequear
      
      for (const [regex, replacement] of fixes) {
        if (regex.test(stripped)) {
          // Mantener puntuación si la había, reemplazando el núcleo
          newWord = newWord.toLowerCase().replace(regex, replacement);
          break;
        }
      }
      return { ...w, word: newWord };
    })
  };
}

export async function transcribeAudio(
  audioUrl: string,
  format: EpisodeFormat,
  method: TranscriptionMethod = 'openai',
  title?: string
): Promise<TranscriptionResult> {
  const audioFile = await downloadFile(audioUrl, 'audio', title);

  let captions: Captions;
  if (method === 'local') {
    captions = await transcribeWithFasterWhisper(audioFile);
  } else {
    captions = await transcribeWithOpenAI(audioFile, format);
  }

  // Post-procesar para corregir errores comunes de transcripción (ej. "b1b2")
  captions = cleanTranscriptionText(captions);

  return { captions, audioFile };
}

export async function transcribeWithOpenAI(
  audioFile: string,
  format: EpisodeFormat
): Promise<Captions> {
  if (!openai) {
    throw new Error("OpenAI no está configurado. Usa el método 'local'.");
  }

  try {
    const response = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioFile),
      model: 'whisper-1',
      response_format: 'verbose_json',
      timestamp_granularities: ['word'],
    });

    if (!response.words || response.words.length === 0) {
      return generateEstimatedTimestamps(response.text, format);
    }

    const words = response.words
      .map((w: any) => ({
        word: w.word.trim(),
        start: w.start,
        end: w.end,
        speaker: (format === 'solo' ? 'Ryan' : 'Ethan') as 'Ryan' | 'Ethan' | 'Katherine',
      }))
      .filter((w) => w.word.length > 0);

    return { words };
  } catch (error) {
    console.error('Error en transcripción OpenAI:', error);
    throw new Error(`OpenAI transcription failed: ${error}`);
  }
}

export async function transcribeWithFasterWhisper(audioFile: string): Promise<Captions> {

  return new Promise((resolve, reject) => {
    const python = spawn('python', [
      path.join(process.cwd(), 'scripts', 'transcribe-faster.py'),
      audioFile,
      'base',
    ]);

    let stdout = '';
    let stderr = '';

    python.stdout.on('data', (data) => { stdout += data.toString(); });
    python.stderr.on('data', (data) => { stderr += data.toString(); });

    python.on('close', (code) => {
      if (code !== 0) {
        console.error('Faster Whisper error:', stderr);
        reject(new Error(`Faster Whisper failed: ${stderr}`));
        return;
      }
      try {
        const result = JSON.parse(stdout);
        resolve(result as Captions);
      } catch (e) {
        console.error('Failed to parse output:', stdout);
        reject(new Error(`Failed to parse transcription output: ${e}`));
      }
    });
  });
}

export function generateEstimatedTimestamps(text: string, format: EpisodeFormat): Captions {
  const words = text.split(/\s+/).filter(w => w.length > 0);
  let currentTime = 0;

  const result = words.map((word) => {
    const start = currentTime;
    const end = start + word.length * 0.1;
    currentTime = end + 0.1;
    return {
      word: word.replace(/[.,!?]/g, ''),
      start,
      end,
      speaker: (format === 'solo' ? 'Ryan' : 'Ethan') as 'Ryan' | 'Ethan' | 'Katherine',
    };
  });

  return { words: result };
}

/**
 * Alinea los speakers del guion con los word timestamps de Whisper, 
 * y SOBREESCRIBE las palabras por el texto exacto del guion para mantener 
 * la puntuación, formato enriquecido ('is_error', (boolean)) y estructura.
 * Usa interpolación de tiempos para los gaps.
 */
export function alignSpeakers(
  words: Word[],
  scriptSegments: Array<{ speaker: string; text: string }>
): Word[] {
  if (!scriptSegments || scriptSegments.length === 0) return words;

  const normalize = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, '');

  interface ScriptToken {
    original: string;
    normalized: string;
    speaker: string;
    start?: number;
    end?: number;
  }

  // 1. Convertir el guion a tokens fuente (Ground Truth Text)
  const scriptTokens: ScriptToken[] = [];
  for (const seg of scriptSegments) {
    const segWords = seg.text.split(/\s+/).filter(w => w.length > 0);
    for (const w of segWords) {
      scriptTokens.push({
        original: w,
        normalized: normalize(w),
        speaker: seg.speaker,
      });
    }
  }

  if (scriptTokens.length === 0) return words;

  // 2. Puntos de anclaje (Anchor Matching)
  let whisperIdx = 0;
  const LOOKAHEAD = 8; // Tolerancia para errores o divisiones raras de Whisper

  for (let i = 0; i < scriptTokens.length; i++) {
    const sTok = scriptTokens[i];
    if (!sTok.normalized) continue; // Puntuación sola, ignorar en anclaje

    for (let j = whisperIdx; j < Math.min(whisperIdx + LOOKAHEAD, words.length); j++) {
      const wTok = words[j];
      const wNorm = normalize(wTok.word);

      if (sTok.normalized === wNorm) {
        sTok.start = wTok.start;
        sTok.end = wTok.end;
        whisperIdx = j + 1; // Avanzar Whisper
        break;
      }
    }
  }

  // Si por alguna razón crítica NADA hizo match, regresamos a la fuente de Whisper
  if (!scriptTokens.some(t => t.start !== undefined)) {
     return words;
  }

  // 3. Interpolación Lineal de Tiempos
  // Asegurar límites para evitar variables indefinidas
  if (scriptTokens[0].start === undefined) {
    scriptTokens[0].start = words.length > 0 ? words[0].start : 0;
    scriptTokens[0].end = scriptTokens[0].start + 0.2;
  }
  
  if (scriptTokens[scriptTokens.length - 1].start === undefined) {
    const lastWhisper = words.length > 0 ? words[words.length - 1] : undefined;
    const fallbackEnd = lastWhisper ? lastWhisper.end : scriptTokens[0].end! + 5;
    scriptTokens[scriptTokens.length - 1].start = fallbackEnd - 0.2;
    scriptTokens[scriptTokens.length - 1].end = fallbackEnd;
  }

  // Calcular gaps intermedios
  for (let i = 1; i < scriptTokens.length - 1; i++) {
    if (scriptTokens[i].start === undefined) {
      let nextAnchorIdx = i;
      while (nextAnchorIdx < scriptTokens.length && scriptTokens[nextAnchorIdx].start === undefined) {
        nextAnchorIdx++;
      }
      
      const prevEnd = scriptTokens[i - 1].end!;
      const nextStart = scriptTokens[nextAnchorIdx].start!;
      
      // En caso de solapamiento extraño por errores de anclaje, forzamos progresión positiva
      const gapDuration = Math.max(0.1, nextStart - prevEnd);
      const gapTokensCount = nextAnchorIdx - i;
      const step = gapDuration / gapTokensCount;
      
      let currTime = prevEnd;
      for (let k = i; k < nextAnchorIdx; k++) {
        scriptTokens[k].start = currTime;
        scriptTokens[k].end = currTime + step;
        currTime += step;
      }
      i = nextAnchorIdx - 1; // saltar los que ya processamos
    }
  }

  // 4. Mapear de regreso a la interfaz original de Subtítulos
  return scriptTokens.map((t) => ({
    word: t.original,
    start: t.start!,
    end: t.end!,
    speaker: t.speaker,
  }));
}
