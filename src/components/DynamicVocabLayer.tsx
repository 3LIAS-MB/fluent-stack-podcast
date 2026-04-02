import React, { useRef } from 'react';
import { EpisodeLevel, Captions, VocabularyItem } from '../types';
import { VocabCard } from './VocabCard';
import { useVocabMatch } from '../hooks/useVocabMatch';
import type { VocabMatch } from '../hooks/useVocabMatch';

interface DynamicVocabLayerProps {
  captions: Captions;
  vocabulary: VocabularyItem[];
  level: EpisodeLevel;
  minDurationFrames?: number;
}

export const DynamicVocabLayer: React.FC<DynamicVocabLayerProps> = ({
  captions,
  vocabulary,
  level,
  minDurationFrames = 90,
}) => {
  const { activeMatch } = useVocabMatch(captions, vocabulary, minDurationFrames);

  // Mantenemos el último match conocido para que la animación de salida
  // de VocabCard pueda ejecutarse antes de que el componente se desmonte.
  const lastMatch = useRef<VocabMatch | null>(null);
  if (activeMatch) lastMatch.current = activeMatch;

  // Sin ningún match previo ni activo: nada que renderizar
  if (!lastMatch.current) return null;

  return (
    <VocabCard
      term={lastMatch.current.item.term}
      definition={lastMatch.current.item.definition}
      category={lastMatch.current.item.category}
      level={level}
      isVisible={!!activeMatch}
      occurrence={lastMatch.current.occurrence}
      totalOccurrences={lastMatch.current.totalOccurrences}
    />
  );
};
