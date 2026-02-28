/**
 * vocabImage.ts
 *
 * Genera slides de vocabulario paginados como segmentos MP4 usando SOLO ffmpeg:
 * 1. Divide el vocabulario en páginas de ITEMS_PER_PAGE ítems
 * 2. Genera un MP4 por página (SECONDS_PER_PAGE seg c/u) con drawtext
 * 3. Concatena todas las páginas + el video principal preservando audio
 *
 * Sin dependencias externas — usa ffmpeg que ya es parte del proyecto.
 */

import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { VocabularyItem } from '../types';

const ffmpegPath: string = require('ffmpeg-static');

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Limpiar caracteres problemáticos para el filtro drawtext de ffmpeg */
function sanitizeForDrawtext(s: string): string {
  return s
    .replace(/\*/g, '')        // quitar ** markdown bold
    .replace(/`/g, '')
    .replace(/:/g, '\\:')     // escapar : para filtros ffmpeg
    .replace(/'/g, "\u2019") // comilla inglesa por apóstrofe (evita problemas en filtro)
    .replace(/\[/g, '(')
    .replace(/\]/g, ')')
    .replace(/[^\x20-\x7E\u00C0-\u024F\u2010-\u2027]/g, '') // quitar emojis y chars raros
    .substring(0, 55);         // truncar si es muy largo
}

// ─────────────────────────────────────────────────────────────────────────────
// Paginación
// ─────────────────────────────────────────────────────────────────────────────

/** Ítems de vocabulario mostrados por página */
const ITEMS_PER_PAGE = 15;

/** Segundos que se muestra cada página */
const SECONDS_PER_PAGE = 5;

// ─────────────────────────────────────────────────────────────────────────────
// Generación de páginas de vocabulario con ffmpeg drawtext
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Genera UN segmento MP4 que muestra una página del vocabulario.
 * @param allItems  Todos los ítems válidos del vocabulario
 * @param pageIndex Página a renderizar (0-based)
 * @param pageCount Total de páginas (para mostrar "Página X / N")
 */
function generateVocabPage(
  allItems: VocabularyItem[],
  pageIndex: number,
  pageCount: number,
  title: string,
  level: string,
  outputMp4: string,
  durationSeconds: number,
  width: number,
  height: number
): void {
  const s = width / 1920; // factor de escala

  // Slice de ítems para esta página
  const startIdx = pageIndex * ITEMS_PER_PAGE;
  const pageItems = allItems.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  // ── Colores y fuentes ──────────────────────────────────────────────────────
  const GOLD = '0xFFD700';
  const WHITE = '0xFFFFFF';
  const ROW_ODD = '0x111122';
  const ALPHA_DIM = '0xFFFFFF@0.5';

  const FONT_LARGE = Math.round(44 * s);
  const FONT_MEDIUM = Math.round(22 * s);
  const FONT_SMALL = Math.round(18 * s);

  // ── Layout ─────────────────────────────────────────────────────────────────
  const MARGIN_X = Math.round(80 * s);
  const HEADER_Y = Math.round(60 * s);
  const SUBTITLE_Y = Math.round(120 * s);
  const PAGE_Y = Math.round(155 * s); // indicador de página
  const TABLE_Y = Math.round(195 * s); // donde empieza la cabecera de tabla
  const ROW_H = Math.round(44 * s);
  const COL2_X = Math.round(560 * s);

  const filters: string[] = [];

  // ── Cabecera ───────────────────────────────────────────────────────────────
  const safeTitle = sanitizeForDrawtext(title);
  const safeLevel = level.toUpperCase().substring(0, 20);
  const pageLabel = pageCount > 1
    ? sanitizeForDrawtext(`Página ${pageIndex + 1} / ${pageCount}`)
    : '';

  filters.push(`drawtext=text='VOCABULARY RECAP':fontsize=${FONT_LARGE}:fontcolor=${GOLD}:x=(w-text_w)/2:y=${HEADER_Y}`);
  filters.push(`drawtext=text='${safeTitle}':fontsize=${FONT_SMALL}:fontcolor=${ALPHA_DIM}:x=(w-text_w)/2:y=${SUBTITLE_Y}`);
  filters.push(`drawtext=text='FLUENT STACK PODCAST  |  ${safeLevel}':fontsize=${FONT_SMALL}:fontcolor=${WHITE}@0.6:x=${MARGIN_X}:y=${Math.round(28 * s)}`);

  if (pageLabel) {
    filters.push(`drawtext=text='${pageLabel}':fontsize=${FONT_SMALL}:fontcolor=${WHITE}@0.5:x=(w-text_w)/2:y=${PAGE_Y}`);
  }

  // ── Cabecera de tabla ──────────────────────────────────────────────────────
  const TH_Y = TABLE_Y;
  filters.push(`drawbox=x=${MARGIN_X}:y=${TH_Y - Math.round(8 * s)}:w=${width - MARGIN_X * 2}:h=${ROW_H}:color=0x1A1A3A:t=fill`);
  filters.push(`drawtext=text='TERM':fontsize=${FONT_SMALL}:fontcolor=${GOLD}:x=${MARGIN_X + Math.round(10 * s)}:y=${TH_Y + Math.round(10 * s)}`);
  filters.push(`drawtext=text='DEFINITION':fontsize=${FONT_SMALL}:fontcolor=${GOLD}:x=${COL2_X}:y=${TH_Y + Math.round(10 * s)}`);

  // ── Filas de esta página ───────────────────────────────────────────────────
  for (let i = 0; i < pageItems.length; i++) {
    const rowY = TABLE_Y + ROW_H + i * ROW_H;
    const term = sanitizeForDrawtext(pageItems[i].term);
    const def = sanitizeForDrawtext(pageItems[i].definition);

    if (i % 2 === 0) {
      filters.push(`drawbox=x=${MARGIN_X}:y=${rowY - Math.round(4 * s)}:w=${width - MARGIN_X * 2}:h=${ROW_H}:color=${ROW_ODD}:t=fill`);
    }
    filters.push(`drawtext=text='${term}':fontsize=${FONT_MEDIUM}:fontcolor=${GOLD}:x=${MARGIN_X + Math.round(10 * s)}:y=${rowY + Math.round(8 * s)}`);
    filters.push(`drawtext=text='${def}':fontsize=${FONT_MEDIUM}:fontcolor=${WHITE}:x=${COL2_X}:y=${rowY + Math.round(8 * s)}`);
  }

  const vfChain = filters.join(',');

  // ── Comando ffmpeg ──────────────────────────────────────────────────────────
  // Fondo de color sólido + pista de audio silenciosa (para concat posterior).
  const cmd = [
    `"${ffmpegPath}"`,
    `-y`,
    `-f lavfi`,
    `-i color=c=0x0A0A1A:size=${width}x${height}:rate=1`,
    `-f lavfi`,
    `-i anullsrc=r=44100:cl=stereo`,
    `-t ${durationSeconds}`,
    `-vf "${vfChain}"`,
    `-c:v libx264`,
    `-c:a aac`,
    `-pix_fmt yuv420p`,
    `-r 30`,
    `-shortest`,
    `"${outputMp4}"`,
  ].join(' ');

  console.log(`  [Página ${pageIndex + 1}/${pageCount}] Generando ${pageItems.length} items...`);
  try {
    execSync(cmd, { stdio: 'pipe' });
    console.log(`  ✓ Página ${pageIndex + 1} generada: ${path.basename(outputMp4)}`);
  } catch (err: any) {
    console.error(`  drawtext falló (pág ${pageIndex + 1}), usando slide básico:`, err.stderr?.toString()?.substring(0, 200));
    const fallbackCmd = [
      `"${ffmpegPath}"`,
      `-y`,
      `-f lavfi`,
      `-i color=c=0x0A0A1A:size=${width}x${height}:rate=1`,
      `-f lavfi`,
      `-i anullsrc=r=44100:cl=stereo`,
      `-t ${durationSeconds}`,
      `-c:v libx264`,
      `-c:a aac`,
      `-pix_fmt yuv420p`,
      `-r 30`,
      `-shortest`,
      `"${outputMp4}"`,
    ].join(' ');
    execSync(fallbackCmd, { stdio: 'pipe' });
    console.log(`  ✓ Página ${pageIndex + 1} (básica) generada: ${path.basename(outputMp4)}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Concatenación dinámica (N segmentos)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Concatena el video principal con N segmentos de vocabulario paginados.
 * Preserva el audio del video principal; los demás segmentos tienen audio silencioso.
 * @param allSegments [mainVideo, page0, page1, ...]
 */
function concatenateAllVideos(allSegments: string[], outputVideo: string): void {
  const n = allSegments.length;

  // Construir inputs: -i seg0 -i seg1 ...
  const inputs = allSegments.map((s) => `-i "${s}"`).join(' ');

  // Construir filter_complex: [0:v][0:a][1:v][1:a]...concat=n=N:v=1:a=1[outv][outa]
  const streams = allSegments.map((_, i) => `[${i}:v][${i}:a]`).join('');
  const filterComplex = `${streams}concat=n=${n}:v=1:a=1[outv][outa]`;

  const cmd = [
    `"${ffmpegPath}"`,
    `-y`,
    inputs,
    `-filter_complex "${filterComplex}"`,
    `-map "[outv]"`,
    `-map "[outa]"`,
    `-c:v libx264`,
    `-c:a aac`,
    `-pix_fmt yuv420p`,
    `-r 30`,
    `"${outputVideo}"`,
  ].join(' ');

  console.log(`  Concatenando ${n} segmento(s) (preservando audio)...`);
  execSync(cmd, { stdio: 'pipe' });
  console.log(`  ✓ Video final: ${path.basename(outputVideo)}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// API pública
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Genera slides de vocabulario paginados y los concatena al video principal.
 * La duración total del vocab = ceil(items / ITEMS_PER_PAGE) × SECONDS_PER_PAGE.
 * El parámetro `vocabDurationSeconds` se ignora (queda por compatibilidad).
 */
export async function appendVocabToVideo(
  vocabulary: VocabularyItem[],
  mainVideoPath: string,
  title: string,
  level: string,
  _vocabDurationSeconds = 30,  // ignorado — la duración se calcula por páginas
  width = 1920,
  height = 1080
): Promise<string> {
  // Filtrar items válidos antes de decidir si agregar slide
  const validItems = vocabulary.filter(
    (v) => v.term && v.definition && v.definition.trim().length > 0
  );

  if (validItems.length === 0) {
    console.log('  Sin vocabulario válido, omitiendo vocab slide.');
    return mainVideoPath;
  }

  const pageCount = Math.ceil(validItems.length / ITEMS_PER_PAGE);
  const totalVocabSeconds = pageCount * SECONDS_PER_PAGE;

  console.log(`\nGenerando vocabulary recap paginado:`);
  console.log(`  Items: ${validItems.length} | Páginas: ${pageCount} | Duración: ${totalVocabSeconds}s (${SECONDS_PER_PAGE}s/pág)`);

  const base = mainVideoPath.replace(/\.mp4$/i, '');
  const pageVideos: string[] = [];
  const finalPath = `${base}_final.mp4`;

  try {
    // 1. Generar un video por página
    for (let p = 0; p < pageCount; p++) {
      const pagePath = `${base}_vocab_p${p}.mp4`;
      pageVideos.push(pagePath);
      generateVocabPage(validItems, p, pageCount, title, level, pagePath, SECONDS_PER_PAGE, width, height);
    }

    // 2. Concatenar: video principal + todas las páginas
    concatenateAllVideos([mainVideoPath, ...pageVideos], finalPath);

    // 3. Reemplazar el video principal con el resultado final
    fs.unlinkSync(mainVideoPath);
    fs.renameSync(finalPath, mainVideoPath);

    console.log(`  ✓ Vocabulary recap añadido. Total: audio + ${totalVocabSeconds}s (${pageCount} páginas).`);
    return mainVideoPath;
  } catch (err) {
    console.error('  ✗ Error en vocabulary recap, devolviendo video sin vocab:', err);
    [finalPath, ...pageVideos].forEach((f) => { try { fs.unlinkSync(f); } catch { } });
    return mainVideoPath;
  } finally {
    // Limpiar todos los temporales de páginas (siempre, aunque haya error)
    pageVideos.forEach((f) => { try { if (fs.existsSync(f)) fs.unlinkSync(f); } catch { } });
  }
}
