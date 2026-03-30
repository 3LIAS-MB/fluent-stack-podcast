import { VocabularyInput, VocabularyItem, VocabularyCategory } from '../types';

/**
 * Normalizes vocabulary input from n8n (which could be an array of categories,
 * an array of items, or stringified versions of them) into a flat array of
 * VocabularyItem objects that Remotion components can easily consume.
 */
export const normalizeVocabulary = (input: VocabularyInput): VocabularyItem[] => {
  if (!input) return [];

  let parsed: any = input;
  
  // 1. Parse stringified JSON if it comes as a string (often happens from n8n webhooks)
  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed);
    } catch (e) {
      console.error('Failed to parse vocabulary string:', e);
      return [];
    }
  }

  // Ensure it's an array
  if (!Array.isArray(parsed)) {
    console.warn('Vocabulary is not an array after parsing:', parsed);
    return [];
  }

  const flatItems: VocabularyItem[] = [];

  // 2. Detect if it's an array of categories (e.g., [{ category: "...", items: [...] }])
  const isCategoryStructure = parsed.length > 0 && parsed[0].category !== undefined && Array.isArray(parsed[0].items);

  if (isCategoryStructure) {
    const categories = parsed as VocabularyCategory[];
    categories.forEach((catObj) => {
      catObj.items.forEach((item) => {
        flatItems.push(processItem(item, catObj.category));
      });
    });
  } else {
    // 3. Assume it's a flat array of items
    parsed.forEach((item: any) => {
      flatItems.push(processItem(item));
    });
  }

  // 4. Filter out invalid items
  return flatItems.filter((item) => item.term && item.definition);
};

/**
 * Processes a single item to ensure it maps to the correct VocabularyItem structure.
 * It intelligently picks up translations, phonetics, and fallback definitions.
 */
const processItem = (item: any, inheritedCategory?: string): VocabularyItem => {
  // Determine definition (English preferred, or direct 'definition' field)
  let definition = item.definition || item.english || '';
  
  // If we only have español but no english/definition, fallback to it
  if (!definition && item.español) {
    definition = item.español;
  }

  return {
    term: item.term || '',
    definition: definition.trim(),
    english: item.english?.trim() || '',
    español: item.español?.trim() || '',
    phonetic: item.phonetic?.trim() || '',
    example: item.example?.trim() || '',
    category: (item.category || inheritedCategory || 'General').trim(),
  };
};
