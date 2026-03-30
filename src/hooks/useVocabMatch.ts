import { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { Captions, VocabularyItem } from '../types';
import { buildSubtitleBlocks } from '../utils/subtitleBlocks';

export interface VocabMatch {
  item: VocabularyItem;
  start: number;
  end: number;
  uiStart: number; // Nueva: Cuándo debe mostrarse la CARD
  uiEnd: number;   // Nueva: Cuándo debe ocultarse la CARD
}

export const useVocabMatch = (
  captions: Captions,
  vocabulary: VocabularyItem[],
  minDurationFrames: number = 90
) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 1. Encontrar todos los matches de frases
  const processedMatches = useMemo(() => {
    const blocks = buildSubtitleBlocks(captions.words);
    const matches: (VocabMatch & { blockIndex: number })[] = [];

    // Encontrar todos los matches crudos
    vocabulary.forEach((item) => {
      const termWords = item.term.toLowerCase().split(/\s+/);
      for (let i = 0; i <= captions.words.length - termWords.length; i++) {
        let isMatch = true;
        for (let j = 0; j < termWords.length; j++) {
          const captionWord = captions.words[i + j].word.toLowerCase().replace(/[.,!?;:]/g, '');
          if (captionWord !== termWords[j]) {
            isMatch = false;
            break;
          }
        }

        if (isMatch) {
          const originalStart = captions.words[i].start;
          const originalEnd = captions.words[i + termWords.length - 1].end;
          const blockIndex = blocks.findIndex(b => originalStart >= b.start && originalStart <= b.end);
          
          if (blockIndex !== -1) {
            matches.push({
              item,
              start: Math.floor(blocks[blockIndex].start * fps),
              end: Math.ceil(blocks[blockIndex].end * fps),
              uiStart: 0, // Se calcula abajo
              uiEnd: 0,   // Se calcula abajo
              blockIndex
            });
          }
        }
      }
    });

    // 2. Lógica de Reparto de Tiempo si hay colisiones en el mismo bloque
    const matchesByBlock: Record<number, typeof matches> = {};
    matches.forEach(m => {
      if (!matchesByBlock[m.blockIndex]) matchesByBlock[m.blockIndex] = [];
      matchesByBlock[m.blockIndex].push(m);
    });

    const finalMatches: VocabMatch[] = [];

    Object.keys(matchesByBlock).forEach(key => {
      const blockIdx = parseInt(key);
      const blockMatches = matchesByBlock[blockIdx].sort((a, b) => a.start - b.start);
      const block = blocks[blockIdx];
      const blockStartFrame = Math.floor(block.start * fps);
      const blockEndFrame = Math.ceil(block.end * fps);
      const blockDuration = blockEndFrame - blockStartFrame;

      // Dividimos el tiempo del bloque equitativamente entre los N matches
      const slotDuration = Math.floor(blockDuration / blockMatches.length);

      blockMatches.forEach((m, i) => {
        finalMatches.push({
          ...m,
          uiStart: blockStartFrame + (i * slotDuration),
          uiEnd: i === blockMatches.length - 1 ? blockEndFrame : blockStartFrame + ((i + 1) * slotDuration)
        });
      });
    });

    return finalMatches.sort((a, b) => a.start - b.start);
  }, [captions.words, vocabulary, fps]);

  // 3. activeMatch basa su visibilidad de CARD en uiStart/uiEnd
  const activeMatch = useMemo(() => {
    return processedMatches.find((m) => {
      return frame >= m.uiStart && frame <= m.uiEnd;
    });
  }, [processedMatches, frame]);

  // 4. visibleMatches contiene todos los que están en el bloque actual (para el Karaoke)
  const visibleMatches = useMemo(() => {
    return processedMatches.filter((m) => {
      return frame >= m.start && frame <= m.end;
    });
  }, [processedMatches, frame]);

  return { activeMatch, visibleMatches, allMatches: processedMatches };
};
