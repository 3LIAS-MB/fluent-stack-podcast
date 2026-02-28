// import express from 'express';
// import { spawn } from 'child_process';
// import fs from 'fs';
// import path from 'path';
// import OpenAI from 'openai';
// import { bundle } from '@remotion/bundler';
// import { getCompositions, renderMedia } from '@remotion/renderer';
// import { Captions, RenderRequest, RenderResponse } from './src/types';

// // Binarios de ffmpeg/ffprobe incluidos como paquetes npm (no requieren instalación global)
// const ffmpegPath: string = require('ffmpeg-static');
// const ffprobePath: string = require('ffprobe-static').path;

// const app = express();
// const PORT = process.env.PORT || 3001;

// app.use(express.json());

// // Servir archivos temporales (audio + imagen) con CORS abierto
// // para que Puppeteer pueda fetchearlos desde localhost sin bloqueos
// const TEMP_DIR = __dirname;
// app.use('/temp', express.static(TEMP_DIR, {
//   setHeaders: (res) => {
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Methods', 'GET');
//   }
// }));

// const openai = process.env.OPENAI_API_KEY
//   ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
//   : null;

// const OUTPUT_DIR = path.join(__dirname, 'output');
// if (!fs.existsSync(OUTPUT_DIR)) {
//   fs.mkdirSync(OUTPUT_DIR, { recursive: true });
// }

// // -----------------------------------------------------------------
// // Descarga genérica: sirve para audio, imágenes, etc.
// // -----------------------------------------------------------------
// async function downloadFile(url: string, suffix: string): Promise<string> {
//   const https = require('https');
//   const http = require('http');

//   // Intentar extraer extensión de la URL (sin query params)
//   const cleanUrl = url.split('?')[0];
//   const ext = path.extname(cleanUrl) || (suffix === 'audio' ? '.mp3' : '.jpg');
//   const tempFile = path.join(__dirname, `temp-${suffix}-${Date.now()}${ext}`);

//   return new Promise((resolve, reject) => {
//     const protocol = url.startsWith('https') ? https : http;

//     const options = {
//       headers: {
//         'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
//       },
//     };

//     protocol.get(url, options, (response: any) => {
//       // Seguir redirecciones (Google Drive usa 303)
//       if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
//         console.log(`  → Redirigiendo (${response.statusCode}) a: ${response.headers.location}`);
//         downloadFile(response.headers.location, suffix).then(resolve).catch(reject);
//         return;
//       }

//       if (response.statusCode !== 200) {
//         reject(new Error(`Fallo al descargar ${suffix}: HTTP ${response.statusCode}`));
//         return;
//       }

//       const file = fs.createWriteStream(tempFile);
//       response.pipe(file);
//       file.on('finish', () => {
//         file.close();
//         const stats = fs.statSync(tempFile);
//         if (stats.size < 500) {
//           fs.unlink(tempFile, () => { });
//           reject(new Error(`Archivo ${suffix} demasiado pequeño (${stats.size} bytes). Google Drive pudo haber bloqueado la descarga.`));
//         } else {
//           console.log(`  ✓ ${suffix} descargado: ${path.basename(tempFile)} (${(stats.size / 1024).toFixed(1)} KB)`);
//           resolve(tempFile);
//         }
//       });
//     }).on('error', (err: Error) => {
//       fs.unlink(tempFile, () => { });
//       reject(err);
//     });
//   });
// }

// // -----------------------------------------------------------------
// // Transcripción con OpenAI Whisper
// // -----------------------------------------------------------------
// async function transcribeWithOpenAI(audioFile: string, format: 'solo' | 'duo'): Promise<Captions> {
//   console.log('Transcribiendo con OpenAI Whisper...');

//   if (!openai) {
//     throw new Error("OpenAI no está configurado. Usa el método 'local'.");
//   }

//   try {
//     const response = await openai.audio.transcriptions.create({
//       file: fs.createReadStream(audioFile),
//       model: 'whisper-1',
//       response_format: 'verbose_json',
//       timestamp_granularities: ['word'],
//     });

//     if (!response.words || response.words.length === 0) {
//       return generateEstimatedTimestamps(response.text, format);
//     }

//     const words = response.words.map((w: any) => ({
//       word: w.word,
//       start: w.start,
//       end: w.end,
//       speaker: (format === 'solo' ? 'Host' : 'Alex') as 'Host' | 'Alex' | 'Sam',
//     }));

//     return { words };
//   } catch (error) {
//     console.error('Error en transcripción OpenAI:', error);
//     throw new Error(`OpenAI transcription failed: ${error}`);
//   }
// }

// // -----------------------------------------------------------------
// // Transcripción con Faster Whisper local (Python)
// // -----------------------------------------------------------------
// async function transcribeWithFasterWhisper(audioFile: string): Promise<Captions> {
//   console.log('Transcribiendo con Faster Whisper (local)...');

//   return new Promise((resolve, reject) => {
//     const python = spawn('python', [
//       path.join(__dirname, 'scripts', 'transcribe-faster.py'),
//       audioFile,
//       'base',
//     ]);

//     let stdout = '';
//     let stderr = '';

//     python.stdout.on('data', (data) => { stdout += data.toString(); });
//     python.stderr.on('data', (data) => { stderr += data.toString(); });

//     python.on('close', (code) => {
//       if (code !== 0) {
//         console.error('Faster Whisper error:', stderr);
//         reject(new Error(`Faster Whisper failed: ${stderr}`));
//         return;
//       }
//       try {
//         const result = JSON.parse(stdout);
//         resolve(result as Captions);
//       } catch (e) {
//         console.error('Failed to parse output:', stdout);
//         reject(new Error(`Failed to parse transcription output: ${e}`));
//       }
//     });
//   });
// }

// // -----------------------------------------------------------------
// // Orquestador de transcripción (descarga + transcribe)
// // -----------------------------------------------------------------
// async function transcribeAudio(
//   audioUrl: string,
//   format: 'solo' | 'duo',
//   method: 'openai' | 'local' = 'openai'
// ): Promise<{ captions: Captions; audioFile: string }> {
//   console.log(`Descargando audio: ${audioUrl}`);
//   const audioFile = await downloadFile(audioUrl, 'audio');

//   let captions: Captions;
//   if (method === 'local') {
//     captions = await transcribeWithFasterWhisper(audioFile);
//   } else {
//     captions = await transcribeWithOpenAI(audioFile, format);
//   }

//   // NO borramos el archivo aquí — lo necesita el renderer después
//   return { captions, audioFile };
// }

// // -----------------------------------------------------------------
// // Helpers
// // -----------------------------------------------------------------
// function generateEstimatedTimestamps(text: string, format: 'solo' | 'duo'): Captions {
//   const words = text.split(/\s+/).filter(w => w.length > 0);
//   let currentTime = 0;

//   const result = words.map((word) => {
//     const start = currentTime;
//     const end = start + word.length * 0.1;
//     currentTime = end + 0.1;
//     return {
//       word: word.replace(/[.,!?]/g, ''),
//       start,
//       end,
//       speaker: (format === 'solo' ? 'Host' : 'Alex') as 'Host' | 'Alex' | 'Sam',
//     };
//   });

//   return { words: result };
// }

// function sanitizeFilename(name: string): string {
//   return name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
// }

// // -----------------------------------------------------------------
// // Render de video con Remotion (API programática)
// // -----------------------------------------------------------------
// async function renderVideo(
//   data: RenderRequest,
//   captions: Captions,
//   localAudioFile: string,
//   localImageFile: string
// ): Promise<string> {
//   const compositionId = data.outputFormat === '16:9' ? 'PodcastVideo' : 'PodcastVideoShort';
//   const sanitizedTitle = sanitizeFilename(data.title);
//   const outputFile = `episode-${sanitizedTitle}-${data.outputFormat.replace(':', 'x')}.mp4`;
//   const outputPath = path.join(OUTPUT_DIR, outputFile);

//   // URLs locales → Puppeteer las fetchea sin problemas de CORS
//   const localAudioUrl = `http://localhost:${PORT}/temp/${path.basename(localAudioFile)}`;
//   const localImageUrl = `http://localhost:${PORT}/temp/${path.basename(localImageFile)}`;
//   console.log(`Audio local:  ${localAudioUrl}`);
//   console.log(`Imagen local: ${localImageUrl}`);

//   const inputProps = {
//     audioUrl: localAudioUrl,
//     imageUrl: localImageUrl,
//     vocabulary: data.vocabulary,
//     title: data.title,
//     level: data.level,
//     format: data.format,
//     captions: captions,
//   };

//   console.log(`Ejecutando render programático: ${compositionId}`);

//   // 1. Bundle con Webpack
//   console.log('Bundling Remotion project...');
//   const bundleLocation = await bundle(
//     path.join(__dirname, 'src', 'Root.tsx'),
//     (progress) => {
//       process.stdout.write(`\rBundling: ${Math.round(progress * 100)}%`);
//     }
//   );
//   console.log('\nBundle completo:', bundleLocation);

//   // 2. Obtener composiciones
//   console.log('Obteniendo composiciones...');
//   const compositions = await getCompositions(bundleLocation, {
//     inputProps,
//     ffmpegExecutable: ffmpegPath,
//     ffprobeExecutable: ffprobePath,
//   });
//   const composition = compositions.find((c) => c.id === compositionId);

//   if (!composition) {
//     throw new Error(
//       `Composición '${compositionId}' no encontrada. Disponibles: ${compositions.map(c => c.id).join(', ')}`
//     );
//   }

//   // 3. Renderizar
//   console.log('Rendering media...');
//   await renderMedia({
//     composition,
//     serveUrl: bundleLocation,
//     codec: 'h264',
//     outputLocation: outputPath,
//     inputProps,
//     ffmpegExecutable: ffmpegPath,
//     ffprobeExecutable: ffprobePath,
//     onProgress: ({ renderedFrames, encodedFrames }) => {
//       const total = composition.durationInFrames;
//       const pct = Math.round((renderedFrames / total) * 100);
//       process.stdout.write(`\rRender: ${renderedFrames}/${total} frames (${pct}%)`);
//     },
//   });

//   // 4. Limpiar archivos temporales
//   fs.unlink(localAudioFile, () => { });
//   fs.unlink(localImageFile, () => { });

//   console.log('\nRender completado:', outputPath);
//   return outputPath;
// }

// // -----------------------------------------------------------------
// // Endpoints Express
// // -----------------------------------------------------------------
// interface ExtendedRenderRequest extends RenderRequest {
//   transcriptionMethod?: 'openai' | 'local';
// }

// app.post('/render', async (req, res): Promise<void> => {
//   console.log('Received render request');

//   const data: ExtendedRenderRequest = req.body;

//   if (!data.audioUrl || !data.imageUrl || !data.title) {
//     res.status(400).json({
//       status: 'error',
//       error: 'Missing required fields: audioUrl, imageUrl, title',
//     } as RenderResponse);
//     return;
//   }

//   const transcriptionMethod = data.transcriptionMethod || 'local';
//   console.log(`Método de transcripción: ${transcriptionMethod}`);

//   try {
//     // Descargar audio e imagen en paralelo para ahorrar tiempo
//     console.log('Descargando recursos...');
//     const [{ captions, audioFile }, imageFile] = await Promise.all([
//       transcribeAudio(data.audioUrl, data.format || 'solo', transcriptionMethod),
//       downloadFile(data.imageUrl, 'image'),
//     ]);

//     console.log('Rendering video...');
//     const outputPath = await renderVideo(data, captions, audioFile, imageFile);

//     res.json({
//       status: 'success',
//       outputPath,
//     } as RenderResponse);
//   } catch (error) {
//     console.error('Error:', error);
//     res.status(500).json({
//       status: 'error',
//       error: String(error),
//     } as RenderResponse);
//   }
// });

// app.get('/health', (req, res) => {
//   res.json({ status: 'ok' });
// });

// app.listen(PORT, () => {
//   console.log(`\nServidor de render ejecutándose en http://localhost:${PORT}`);
//   console.log(`Endpoint: POST /render`);
//   console.log(`Parámetros adicionales:`);
//   console.log(` - transcriptionMethod: "openai" | "local" (default: local)`);
// }).on('error', (err: any) => {
//   if (err.code === 'EADDRINUSE') {
//     console.error(`\n❌ Puerto ${PORT} ya está en uso.`);
//     console.error(`   Ejecuta: netstat -ano | findstr :${PORT}`);
//     console.error(`   Luego:   taskkill /F /PID <el_PID>`);
//     process.exit(1);
//   } else {
//     throw err;
//   }
// });