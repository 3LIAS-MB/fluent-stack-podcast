import { Word, SubtitleBlock } from '../types';

/**
 * Agrupa un array de palabras (con timestamps) en bloques de frase.
 *
 * Criterios de corte de bloque:
 *  1. Pausa entre palabras > PAUSE_THRESHOLD segundos
 *  2. El bloque alcanzó MAX_WORDS palabras
 *  3. La palabra anterior terminaba con puntuación fuerte (. ! ?)
 *
 * Las contracciones sueltas ("n't", "'s", "'re", "'ll", etc.) se unen
 * a la palabra anterior en vez de formar su propio bloque.
 */

const PAUSE_THRESHOLD = 0.45; // segundos de silencio para cortar bloque
const MAX_WORDS = 6;           // palabras máximas por bloque

/** Contracciones que Whisper devuelve como tokens separados */
const CONTRACTION_PATTERN = /^'(s|t|re|ve|ll|d|m)$/i;

/** Puntuación fuerte que justifica corte de bloque */
const STRONG_PUNCT = /[.!?]$/;

/** Tokens que son pura puntuación (no deberían renderizarse solos) */
const PUNCT_ONLY = /^[.,!?;:'"¡¿\-–—]+$/;

export function buildSubtitleBlocks(words: Word[]): SubtitleBlock[] {
  if (!words || words.length === 0) return [];

  // 1. Pre-procesar: unir contracciones y filtrar tokens de solo-puntuación
  const cleaned: Word[] = [];
  for (const w of words) {
    const text = w.word.trim();

    // Ignorar tokens vacíos o de pura puntuación
    if (!text || PUNCT_ONLY.test(text)) continue;

    // Unir contracción con la palabra anterior
    if (CONTRACTION_PATTERN.test(text) && cleaned.length > 0) {
      const prev = cleaned[cleaned.length - 1];
      cleaned[cleaned.length - 1] = {
        ...prev,
        word: prev.word + text,
        end: w.end,
      };
    } else {
      cleaned.push({ ...w, word: text });
    }
  }

  if (cleaned.length === 0) return [];

  // 2. Agrupar en bloques
  const blocks: SubtitleBlock[] = [];
  let currentBlock: Word[] = [cleaned[0]];

  for (let i = 1; i < cleaned.length; i++) {
    const prev = cleaned[i - 1];
    const curr = cleaned[i];

    const pause = curr.start - prev.end;
    const blockFull = currentBlock.length >= MAX_WORDS;
    const prevEndsWithPunct = STRONG_PUNCT.test(prev.word);

    if (pause > PAUSE_THRESHOLD || blockFull || prevEndsWithPunct) {
      // Cerrar bloque actual
      blocks.push({
        words: currentBlock,
        start: currentBlock[0].start,
        end: currentBlock[currentBlock.length - 1].end,
      });
      currentBlock = [curr];
    } else {
      currentBlock.push(curr);
    }
  }

  // Último bloque
  if (currentBlock.length > 0) {
    blocks.push({
      words: currentBlock,
      start: currentBlock[0].start,
      end: currentBlock[currentBlock.length - 1].end,
    });
  }

  return blocks;
}
