import { Request, Response } from 'express';
import { RenderRequest, RenderResponse } from '../types';
import { transcribeAudio, downloadFile } from '../services';
import { renderVideo } from '../services/renderer';

const DEFAULT_PORT = 3001;

export function createRenderRouter(port: number = DEFAULT_PORT) {
  return async (req: Request, res: Response): Promise<void> => {
    console.log('Received render request');

    const data: RenderRequest = req.body;

    // ── Normalizar vocabulary ────────────────────────────────────────────────
    // n8n puede enviar vocabulary como string JSON en vez de array.
    // Lo normalizamos aquí para evitar el crash "vocabulary.map is not a function".
    if (typeof data.vocabulary === 'string') {
      const raw = data.vocabulary as unknown as string;
      console.log(`Vocabulary raw (primeros 300 chars): "${raw.substring(0, 300)}"`);
      try {
        // Intentar JSON primero
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          data.vocabulary = parsed.map((item: any) => ({
            term: item.term ?? item.word ?? item.name ?? String(item),
            definition: item.definition ?? item.meaning ?? item.desc ?? item.description ?? '',
            example: item.example ?? item.usage ?? undefined,
          }));
          console.log(`Vocabulary parseado desde JSON: ${data.vocabulary.length} items`);
        } else {
          data.vocabulary = [];
        }
      } catch {
        // Parsear como tabla Markdown: |**term**|definition|
        // Ignorar: separadores |---|, títulos sin |, líneas vacías
        console.log('Vocabulary no es JSON — parseando como Markdown...');
        const lines = raw.split('\n').map((l: string) => l.trim());
        const items: { term: string; definition: string; example?: string }[] = [];

        for (const line of lines) {
          if (!line.startsWith('|') || /^\|[-\s|]+\|$/.test(line)) continue;
          const cells = line.split('|')
            .map((c: string) => c.trim().replace(/\*\*/g, '').replace(/`/g, ''))
            .filter((c: string) => c.length > 0);
          if (cells.length < 2) continue;
          const term = cells[0].trim();
          const definition = cells[1].trim();
          // Ignorar filas de cabecera (Term, Phrasal Verb, etc.)
          if (/^(term|word|phrasal|technical|vocabulary|english|spanish|definition|meaning)/i.test(term)) continue;
          if (term.length === 0 || definition.length === 0) continue;
          items.push({ term, definition, example: cells[2] ?? undefined });
        }

        data.vocabulary = items;
        console.log(`Vocabulary parseado desde Markdown: ${data.vocabulary.length} items reales`);
      }
    } else if (Array.isArray(data.vocabulary)) {
      data.vocabulary = data.vocabulary.map((item: any) => ({
        term: item.term ?? item.word ?? item.name ?? String(item),
        definition: item.definition ?? item.meaning ?? item.desc ?? item.description ?? '',
        example: item.example ?? item.usage ?? undefined,
      }));
      console.log(`Vocabulary ya era array, normalizado: ${data.vocabulary.length} items`);
    } else {
      console.warn(`Vocabulary tipo desconocido (${typeof data.vocabulary}), usando []`);
      data.vocabulary = [];
    }

    // ── Normalizar level ─────────────────────────────────────────────────────
    // n8n puede enviar "intermediate b1-b2" o "Intermediate" → extraemos la keyword válida
    const VALID_LEVELS = ['beginner', 'intermediate', 'advanced'];
    if (typeof data.level === 'string') {
      const lower = data.level.toLowerCase();
      const found = VALID_LEVELS.find((l) => lower.includes(l));
      data.level = (found ?? 'beginner') as any;
      console.log(`  level normalizado: "${data.level}" (raw: "${lower}")`);
    }

    if (!data.audioUrl || !data.imageUrl || !data.title) {
      res.status(400).json({
        status: 'error',
        error: 'Missing required fields: audioUrl, imageUrl, title',
      } as RenderResponse);
      return;
    }

    const transcriptionMethod = data.transcriptionMethod || 'local';
    console.log(`Método de transcripción: ${transcriptionMethod}`);

    try {
      console.log('Descargando recursos...');
      const [{ captions, audioFile }, imageFile] = await Promise.all([
        transcribeAudio(data.audioUrl, data.format || 'solo', transcriptionMethod),
        downloadFile(data.imageUrl, 'image'),
      ]);

      // ── DEBUG: imprimir datos llegados al renderer ─────────────────────────
      console.log('===== DEBUG inputProps =====');
      console.log(`  level:      "${data.level}" (tipo: ${typeof data.level})`);
      console.log(`  vocabulary: tipo=${typeof data.vocabulary}, isArray=${Array.isArray(data.vocabulary)}, length=${Array.isArray(data.vocabulary) ? data.vocabulary.length : 'N/A'}`);
      if (Array.isArray(data.vocabulary) && data.vocabulary.length > 0) {
        console.log(`  vocab[0]:   ${JSON.stringify(data.vocabulary[0])}`);
      }
      console.log('===========================');

      console.log('Rendering video...');
      const outputPath = await renderVideo(data, captions, audioFile, imageFile, port);

      res.json({
        status: 'success',
        outputPath,
      } as RenderResponse);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({
        status: 'error',
        error: String(error),
      } as RenderResponse);
    }
  };
}
