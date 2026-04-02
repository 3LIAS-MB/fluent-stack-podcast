import { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { Captions, VocabularyItem, SubtitleBlock, Word } from '../types';
import { buildSubtitleBlocks } from '../utils/subtitleBlocks';

export interface VocabMatch {
  item: VocabularyItem;
  start: number;      // Frame de inicio del bloque
  end: number;        // Frame de fin del bloque (exclusivo)
  uiStart: number;    // Frame de entrada de la CARD
  uiEnd: number;      // Frame de salida de la CARD
  termStart: number;  // Segundos exactos de inicio del audio
  termEnd: number;    // Segundos exactos de fin del audio
  wordIndices: number[]; // Índices de las palabras DENTRO del bloque
  occurrence: number;
  totalOccurrences: number; 
}

export const useVocabMatch = (
  captions: Captions,
  vocabulary: VocabularyItem[],
  minDurationFrames: number = 90
) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const processedMatches = useMemo(() => {
    const blocks = buildSubtitleBlocks(captions.words);
    const finalMatches: (VocabMatch & { blockIndex: number })[] = [];

    // 1. Preparar vocabulario: los más largos primero para evitar falsos positivos
    // (Ej: "Prompt Engineering" gana a "Prompt")
    const sortedVocab = [...vocabulary].sort((a, b) => 
      b.term.split(/\s+/).length - a.term.split(/\s+/).length
    );

    // 2. Rastrear palabras ya emparejadas para evitar solapamientos
    // Formato: "blockIndex-wordIndexInBlock"
    const matchedWords = new Set<string>();

    blocks.forEach((block, bIdx) => {
      const blockWords = block.words;
      const blockMatches: any[] = [];

      sortedVocab.forEach((item) => {
        const termWords = item.term.toLowerCase().split(/\s+/);
        
        // Buscar el término dentro de las palabras de ESTE bloque solamente
        for (let i = 0; i <= blockWords.length - termWords.length; i++) {
          let isMatch = true;
          const indicesInBlock: number[] = [];

          for (let j = 0; j < termWords.length; j++) {
            const wordIdxInBlock = i + j;
            const wordKey = `${bIdx}-${wordIdxInBlock}`;

            // Si esta palabra ya es parte de un match (uno más largo), saltar
            if (matchedWords.has(wordKey)) {
              isMatch = false;
              break;
            }

            const captionWord = blockWords[wordIdxInBlock].word.toLowerCase().replace(/[.,!?;:]/g, '');
            if (captionWord !== termWords[j]) {
              isMatch = false;
              break;
            }
            indicesInBlock.push(wordIdxInBlock);
          }

          if (isMatch) {
            // Marcar palabras como ocupadas
            indicesInBlock.forEach(idx => matchedWords.add(`${bIdx}-${idx}`));

            const firstWord = blockWords[i];
            const lastWord = blockWords[i + termWords.length - 1];

            blockMatches.push({
              item,
              blockIndex: bIdx,
              start: Math.floor(block.start * fps),
              end: Math.ceil(block.end * fps),
              termStart: firstWord.start,
              termEnd: lastWord.end,
              wordIndices: indicesInBlock,
              uiStart: 0,
              uiEnd: 0,
            });
          }
        }
      });

      // Ordenar matches del bloque por aparición para repartir el tiempo (uiStart/uiEnd)
      blockMatches.sort((a, b) => a.termStart - b.termStart);
      
      const blockStartFrame = Math.floor(block.start * fps);
      const blockEndFrame = Math.ceil(block.end * fps);
      const blockDuration = blockEndFrame - blockStartFrame;
      const slotDuration = Math.floor(blockDuration / blockMatches.length);

      blockMatches.forEach((m, i) => {
        const uiStart = blockStartFrame + (i * slotDuration);
        const uiEnd = i === blockMatches.length - 1 
          ? blockEndFrame 
          : blockStartFrame + ((i + 1) * slotDuration);

        finalMatches.push({
          ...m,
          uiStart,
          uiEnd,
        });
      });
    });

    // 3. Calcular ocurrencias totales (x1, x2...) después de encontrar todos los matches
    const termCounts: Record<string, number> = {};
    const finalWithOccurrences = finalMatches
      .sort((a, b) => a.termStart - b.termStart) // Orden cronológico global
      .map(m => {
        const term = m.item.term.toLowerCase();
        termCounts[term] = (termCounts[term] || 0) + 1;
        return {
          ...m,
          occurrence: termCounts[term]
        };
      });

    // Añadir totalOccurrences a cada uno
    return finalWithOccurrences.map(m => ({
      ...m,
      totalOccurrences: termCounts[m.item.term.toLowerCase()]
    }));

  }, [captions.words, vocabulary, fps]);

  // 4. activeMatch: La CARD actual (usa < uiEnd exclusivo)
  const activeMatch = useMemo(() => {
    return processedMatches.find((m) => {
      return frame >= m.uiStart && frame < m.uiEnd;
    });
  }, [processedMatches, frame]);

  // 5. visibleMatches: Lo que se debe resaltar en el Karaoke del bloque actual
  const visibleMatches = useMemo(() => {
    return processedMatches.filter((m) => {
      return frame >= m.start && frame < m.end;
    });
  }, [processedMatches, frame]);

  return { activeMatch, visibleMatches, allMatches: processedMatches };
};
