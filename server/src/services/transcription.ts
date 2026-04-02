import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import OpenAI from 'openai';
import { Captions, TranscriptionMethod, TranscriptionResult, EpisodeFormat, Word } from '../types';
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
  method: TranscriptionMethod = 'openai'
): Promise<TranscriptionResult> {
  const audioFile = await downloadFile(audioUrl, 'audio');

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
        word: w.word.trim().replace(/^[.,!?¡¿;:]+|[.,!?¡¿;:]+$/g, ''),
        start: w.start,
        end: w.end,
        speaker: (format === 'solo' ? 'Ryan' : 'Ethan') as 'Ryan' | 'Ethan' | 'Katherine',
      }))
      .filter((w) => w.word.length > 0); // descarta entradas que solo eran puntuación

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
 * Alinea los speakers del guion con los word timestamps de Whisper.
 * Usa matching secuencial normalizado — ambas secuencias están en orden cronológico.
 */
export function alignSpeakers(
  words: Word[],
  scriptSegments: Array<{ speaker: string; text: string }>
): Word[] {
  if (!scriptSegments || scriptSegments.length === 0) return words;

  // Normaliza una palabra para comparación (lowercase, sin puntuación)
  const normalize = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, '');

  // Construye lista plana de {speaker, normalized} desde los segmentos del guion
  const scriptWords: Array<{ speaker: string; normalized: string }> = [];
  for (const seg of scriptSegments) {
    const segWords = seg.text.split(/\s+/).filter(w => w.length > 0);
    for (const w of segWords) {
      const normalized = normalize(w);
      if (normalized) scriptWords.push({ speaker: seg.speaker, normalized });
    }
  }

  if (scriptWords.length === 0) return words;

  let scriptIdx = 0;
  const LOOKAHEAD = 6; // tolerancia para diferencias menores de transcripción

  return words.map(word => {
    const normalizedWhisper = normalize(word.word);

    if (!normalizedWhisper) {
      // Palabra vacía tras normalizar: hereda speaker del contexto actual
      const fallback = scriptWords[Math.min(scriptIdx, scriptWords.length - 1)];
      return { ...word, speaker: (fallback?.speaker || 'Ryan') as any };
    }

    // Busca match en ventana deslizante
    let matchIdx = -1;
    for (let i = scriptIdx; i < Math.min(scriptIdx + LOOKAHEAD, scriptWords.length); i++) {
      if (scriptWords[i].normalized === normalizedWhisper) {
        matchIdx = i;
        break;
      }
    }

    if (matchIdx !== -1) {
      scriptIdx = matchIdx + 1;
      return { ...word, speaker: scriptWords[matchIdx].speaker as any };
    }

    // Sin match: usa el speaker en la posición actual (no retrocede)
    const current = scriptWords[Math.min(scriptIdx, scriptWords.length - 1)];
    return { ...word, speaker: (current?.speaker || 'Ryan') as any };
  });
}
