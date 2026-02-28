import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import OpenAI from 'openai';
import { Captions, TranscriptionMethod, TranscriptionResult, EpisodeFormat } from '../types';
import { downloadFile, getTempDir } from './download';

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function transcribeAudio(
  audioUrl: string,
  format: EpisodeFormat,
  method: TranscriptionMethod = 'openai'
): Promise<TranscriptionResult> {
  console.log(`Descargando audio: ${audioUrl}`);
  const audioFile = await downloadFile(audioUrl, 'audio');

  let captions: Captions;
  if (method === 'local') {
    captions = await transcribeWithFasterWhisper(audioFile);
  } else {
    captions = await transcribeWithOpenAI(audioFile, format);
  }

  return { captions, audioFile };
}

export async function transcribeWithOpenAI(
  audioFile: string,
  format: EpisodeFormat
): Promise<Captions> {
  console.log('Transcribiendo con OpenAI Whisper...');

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

    const words = response.words.map((w: any) => ({
      word: w.word,
      start: w.start,
      end: w.end,
      speaker: (format === 'solo' ? 'Host' : 'Alex') as 'Host' | 'Alex' | 'Sam',
    }));

    return { words };
  } catch (error) {
    console.error('Error en transcripción OpenAI:', error);
    throw new Error(`OpenAI transcription failed: ${error}`);
  }
}

export async function transcribeWithFasterWhisper(audioFile: string): Promise<Captions> {
  console.log('Transcribiendo con Faster Whisper (local)...');

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
      speaker: (format === 'solo' ? 'Host' : 'Alex') as 'Host' | 'Alex' | 'Sam',
    };
  });

  return { words: result };
}
