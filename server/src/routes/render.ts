import { Request, Response } from 'express';
import path from 'path';
import { RenderRequest, RenderResponse } from '../types';
import { transcribeAudio, downloadFile } from '../services';
import { renderVideo } from '../services/renderer';

const DEFAULT_PORT = 3001;

// Cola de renderizado para evitar que procesos simultáneos saturen el CPU o ensucien los logs
let renderQueue = Promise.resolve();

export function createRenderRouter(port: number = DEFAULT_PORT) {
  return async (req: Request, res: Response): Promise<void> => {
    const title = req.body.title || 'unnamed';
    console.log(`\n[Queue] Petición recibida para "${title}". Esperando turno...`);

    // Encolamos el proceso de renderizado y esperamos a que sea nuestro turno
    await (renderQueue = renderQueue.then(async () => {
      const displayTitle = title.length > 50 ? `${title.substring(0, 47)}...` : title;

      console.log(`\n╔══════════════════════════════════════════════════════════════════╗`);
      console.log(`║ 🎬 PROCESANDO: ${displayTitle.padEnd(50)} ║`);
      console.log(`╚══════════════════════════════════════════════════════════════════╝`);

      const data: RenderRequest = req.body;

      // ── El vocabulario pasa exactamente como llega. La normalización (categorías, strings, fallbacks como 'español') sucederá en vocabNormalization.ts dentro del cliente Remotion ────────────────────────────────────────────────

      // ── Normalizar level ─────────────────────────────────────────────────────
      const VALID_LEVELS = ['beginner', 'intermediate', 'advanced'];
      if (typeof data.level === 'string') {
        const lower = data.level.toLowerCase();
        const found = VALID_LEVELS.find((l) => lower.includes(l));
        data.level = (found ?? 'beginner') as any;
      }

      if (!data.audioUrl || !data.imageUrl || !data.title) {
        res.status(400).json({
          success: false,
          status: 'error',
          error: 'Missing required fields: audioUrl, imageUrl, title',
        } as RenderResponse);
        return;
      }

      const transcriptionMethod = data.transcriptionMethod || 'local';

      try {
        const [{ captions, audioFile }, imageFile] = await Promise.all([
          transcribeAudio(data.audioUrl, data.format || 'solo', transcriptionMethod),
          downloadFile(data.imageUrl, 'image'),
        ]);

        const outputPath = await renderVideo(data, captions, audioFile, imageFile, port);

        const fileName = path.basename(outputPath);
        const host = req.get('host') || `localhost:${port}`;
        const downloadUrl = `http://${host}/videos/${fileName}`;

        res.json({
          success: true,
          status: 'success',
          downloadUrl,
          fileName,
          outputPath,
        } as RenderResponse);
      } catch (error) {
        console.error('Error durante el render:', error);
        res.status(500).json({
          success: false,
          status: 'error',
          error: String(error),
        } as RenderResponse);
      }
      console.log(`\n[Queue] Finalizado: "${title}"`);
      console.log(`──────────────────────────────────────────────────────────────────`);
    }).catch(err => {
      console.error('[Queue Internal Error]', err);
      if (!res.headersSent) {
        res.status(500).json({ success: false, status: 'error', error: 'Queue error' });
      }
    }));
  };
}
