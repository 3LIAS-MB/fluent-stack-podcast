import { VocabularyItem } from '../types';

export type VocabRow =
  | { type: 'category'; label: string }
  | { type: 'item'; item: VocabularyItem; isOdd: boolean };

/**
 * Divide el vocabulario en páginas basadas en el número de FILAS VISUALES totales,
 * no solo en el número de palabras.
 * - Una categoría ocupa 1 fila.
 * - Un item ocupa 1 fila.
 * - Maximo `maxRows` por página (ej: 7).
 */
export const paginateVocabulary = (
  items: VocabularyItem[],
  maxRows: number = 7
): VocabRow[][] => {
  const pages: VocabRow[][] = [];
  let currentPageRows: VocabRow[] = [];
  let currentRowCount = 0;
  let currentCategory = '';
  let globalItemIndex = 0;

  for (const item of items) {
    const itemCategory = item.category?.trim() || 'General';
    const isNewCategory = itemCategory !== currentCategory;
    
    // Si es una categoría nueva, necesitamos espacio para el encabezado (+1 fila)
    // Más el espacio para la palabra (+1 fila).
    const rowsNeeded = isNewCategory ? 2 : 1;

    if (currentRowCount + rowsNeeded > maxRows) {
      // Salto de página
      if (currentPageRows.length > 0) {
        pages.push(currentPageRows);
      }
      currentPageRows = [];
      currentRowCount = 0;
      
      // REPETIR CATEGORÍA al inicio de la nueva página para mantener contexto
      currentPageRows.push({ type: 'category', label: itemCategory });
      currentCategory = itemCategory;
      currentRowCount++;
    }

    if (isNewCategory && currentRowCount === 0) {
      // Caso normal: primera categoría de la primera página
      currentPageRows.push({ type: 'category', label: itemCategory });
      currentCategory = itemCategory;
      currentRowCount++;
    } else if (isNewCategory) {
      // Caso normal: cambio de categoría a mitad de página
      currentPageRows.push({ type: 'category', label: itemCategory });
      currentCategory = itemCategory;
      currentRowCount++;
    }

    // Añadir el item
    currentPageRows.push({
      type: 'item',
      item,
      isOdd: globalItemIndex % 2 === 0
    });
    currentRowCount++;
    globalItemIndex++;
  }

  // Añadir la última página si tiene contenido
  if (currentPageRows.length > 0) {
    pages.push(currentPageRows);
  }

  return pages;
};
