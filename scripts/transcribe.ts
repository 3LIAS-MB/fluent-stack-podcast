import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { Captions, Word } from '../src/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function transcribeAudio(
  audioUrl: string,
  format: 'solo' | 'duo' = 'solo'
): Promise<Captions> {
  console.log('Iniciando transcripción con Whisper...');
  
  try {
    const response = await openai.audio.transcriptions.create({
      file: await fs.createReadStream(await downloadAudio(audioUrl)),
      model: 'whisper-1',
      response_format: 'verbose_json',
      timestamp_granularities: ['word'],
    });

    if (!response.words || response.words.length === 0) {
      console.warn('Whisper no devolvió timestamps de palabras, generando timestamps estimados...');
      return generateEstimatedTimestamps(response.text, format);
    }

    const words: Word[] = response.words.map((w: any) => ({
      word: w.word,
      start: w.start,
      end: w.end,
      speaker: format === 'solo' ? 'Host' : inferSpeaker(w.word, format),
    }));

    return { words };
  } catch (error) {
    console.error('Error en transcripción:', error);
    throw new Error(`Transcription failed: ${error}`);
  }
}

async function downloadAudio(url: string): Promise<string> {
  const https = require('https');
  const http = require('http');
  const os = require('os');
  const tempFile = path.join(os.tmpdir(), `audio-${Date.now()}.mp3`);

  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (response: any) => {
      const file = fs.createWriteStream(tempFile);
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(tempFile);
      });
    }).on('error', (err: Error) => {
      fs.unlink(tempFile, () => {});
      reject(err);
    });
  });
}

function generateEstimatedTimestamps(text: string, format: 'solo' | 'duo'): Captions {
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const avgWordDuration = 0.4;
  let currentTime = 0;

  const result: Word[] = words.map((word) => {
    const start = currentTime;
    const end = start + word.length * 0.1;
    currentTime = end + 0.1;

    return {
      word: word.replace(/[.,!?]/g, ''),
      start,
      end,
      speaker: format === 'solo' ? 'Host' : 'Alex',
    };
  });

  return { words: result };
}

function inferSpeaker(word: string, format: 'solo' | 'duo'): 'Alex' | 'Sam' {
  return 'Alex';
}

export async function transcribeFromFile(
  filePath: string,
  format: 'solo' | 'duo' = 'solo'
): Promise<Captions> {
  console.log(`Transcribiendo archivo: ${filePath}`);
  
  try {
    const response = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: 'whisper-1',
      response_format: 'verbose_json',
      timestamp_granularities: ['word'],
    });

    if (!response.words || response.words.length === 0) {
      return generateEstimatedTimestamps(response.text, format);
    }

    const words: Word[] = response.words.map((w: any) => ({
      word: w.word,
      start: w.start,
      end: w.end,
      speaker: format === 'solo' ? 'Host' : inferSpeaker(w.word, format),
    }));

    return { words };
  } catch (error) {
    console.error('Error en transcripción:', error);
    throw new Error(`Transcription failed: ${error}`);
  }
}

if (require.main === module) {
  const audioFile = process.argv[2];
  const format = (process.argv[3] || 'solo') as 'solo' | 'duo';
  
  if (!audioFile) {
    console.error('Usage: ts-node scripts/transcribe.ts <audio-file> [solo|duo]');
    process.exit(1);
  }

  transcribeFromFile(audioFile, format)
    .then(captions => {
      console.log(JSON.stringify(captions, null, 2));
    })
    .catch(console.error);
}
