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

const PAUSE_THRESHOLD = 0.8; // Más relajado para no cortar por pausas naturales cortas
const TARGET_CHARS_MIN = 50;   // Zona "soft": a partir de aquí buscamos signos para cortar natural
const TARGET_CHARS_MAX = 80;   // Zona "hard": límite estricto para no desbordar 2 líneas (forzamos corte)

/** Contracciones que Whisper devuelve como tokens separados */
const CONTRACTION_PATTERN = /^'(s|t|re|ve|ll|d|m)$/i;

/** Puntuación fuerte que justifica corte inmediato (si pasamos el soft limit) */
const STRONG_PUNCT = /[.!?]$/;

/** Puntuación suave (comas, etc) donde es bueno cortar si nos acercamos al hard limit */
const SOFT_PUNCT = /[,;:]$/;

/** Tokens que son pura puntuación (no deberían renderizarse solos) */
const PUNCT_ONLY = /^[.,!?;:'"¡¿\-–—]+$/;

export function buildSubtitleBlocks(words: Word[]): SubtitleBlock[] {
  if (!words || words.length === 0) return [];

  // 1. Pre-procesar: unir contracciones y filtrar tokens de solo-puntuación
  const cleaned: Word[] = [];
  for (const w of words) {
    const text = w.word.trim();

    // Ignorar tokens vacíos o de pura puntuación (excepto si el guion es parte de una palabra)
    if (!text || (PUNCT_ONLY.test(text) && text !== '-')) continue;

    const isContraction = CONTRACTION_PATTERN.test(text);
    const prevEndsWithHyphen = cleaned.length > 0 && cleaned[cleaned.length - 1].word.endsWith('-');
    const currStartsWithHyphen = text.startsWith('-');

    // Unir contracción o guion con la palabra anterior
    if ((isContraction || prevEndsWithHyphen || currStartsWithHyphen) && cleaned.length > 0) {
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

  // 2. Agrupar en bloques inteligentes
  const blocks: SubtitleBlock[] = [];
  let currentBlock: Word[] = [cleaned[0]];
  let currentChars = cleaned[0].word.length;

  for (let i = 1; i < cleaned.length; i++) {
    const prev = cleaned[i - 1];
    const curr = cleaned[i];

    const pause = curr.start - prev.end;
    const isTooShort = currentBlock.length < 3; 

    // Pausas
    const longPause = pause > PAUSE_THRESHOLD;
    const forcedBreak = pause > PAUSE_THRESHOLD * 2; // Pausa crítica de silencio > 1.6s

    // Puntuación de la palabra anterior
    const prevHasStrongPunct = STRONG_PUNCT.test(prev.word);
    const prevHasSoftPunct = SOFT_PUNCT.test(prev.word);

    // Sumamos la próxima palabra + 1 caracter de espacio
    const newChars = currentChars + curr.word.length + 1;

    // Evaluadores de límite
    const reachedSoftLimit = currentChars >= TARGET_CHARS_MIN;
    const reachedHardLimit = newChars >= TARGET_CHARS_MAX;

    // ¿Deberíamos cortar aquí?
    const shouldBreak = 
      forcedBreak || 
      (longPause && !isTooShort) || 
      (reachedSoftLimit && prevHasStrongPunct) || 
      (reachedSoftLimit && prevHasSoftPunct && newChars > TARGET_CHARS_MIN + 15) || 
      reachedHardLimit;

    if (shouldBreak) {
      // Cerrar bloque e iniciar uno nuevo
      blocks.push({
        words: currentBlock,
        start: currentBlock[0].start,
        end: currentBlock[currentBlock.length - 1].end,
      });
      currentBlock = [curr];
      currentChars = curr.word.length;
    } else {
      currentBlock.push(curr);
      currentChars = newChars;
    }
  }

  // Último bloque residual
  if (currentBlock.length > 0) {
    blocks.push({
      words: currentBlock,
      start: currentBlock[0].start,
      end: currentBlock[currentBlock.length - 1].end,
    });
  }

  return blocks;
}
