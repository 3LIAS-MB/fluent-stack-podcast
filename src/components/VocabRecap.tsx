import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { VocabularyItem, EpisodeLevel } from '../types';
import { getLevelColor, LEVEL_ACCENT_COLOR } from '../utils/levelColors';
import { MAIN_FONT } from '../utils/fonts';

interface VocabRecapProps {
  vocabulary: VocabularyItem[];
  startFrame: number;
  title?: string;
  level: EpisodeLevel;
}

// ─── Constantes idénticas a vocabImage.ts ──────────────────────────────────────
const ITEMS_PER_PAGE = 8;
const SECONDS_PER_PAGE = 5;
const FRAMES_PER_PAGE = SECONDS_PER_PAGE * 30; // 150 frames

// Colores base
const BG = '#0A0A1A';
const WHITE = '#FFFFFF';
const ROW_ODD = '#111122';
const CAT_BG = '#0D1B2A';

// Fuentes (mismos tamaños que vocabImage.ts para resolución 1920px)
const FONT_LARGE = 44;  // "VOCABULARY RECAP"
const FONT_MEDIUM = 24;  // término / definición
const FONT_SMALL = 20;  // branding, subtítulo, categorías, página

// Layout — espejando exactamente vocabImage.ts
const MARGIN_X = 80;
const HEADER_Y = 60;   // título centrado
const SUBTITLE_Y = 120; // nombre del episodio
const BRAND_Y = 28;   // branding top-left
const PAGE_Y = 155;  // indicador de página
const TABLE_Y = 195;  // primera fila de la tabla
const ROW_H = 100;   // altura de cada fila
const COL2_X = 560;  // x    de la columna de definiciones

/**
 * VocabRecap — clon visual de vocabImage.ts en React/Remotion.
 * Mismos colores, layout y paginación (15 items, 5s/página).
 */
export const VocabRecap: React.FC<VocabRecapProps> = ({
  vocabulary,
  startFrame,
  title = '',
  level,
}) => {
  const frame = useCurrentFrame();
  const accentColor = getLevelColor(level);

  const items = Array.isArray(vocabulary)
    ? vocabulary.filter((v) => v.term && v.definition?.trim())
    : [];

  if (items.length === 0) return null;

  const pageCount = Math.ceil(items.length / ITEMS_PER_PAGE);

  // Página actual
  const rel = frame - startFrame;
  const currentPage = Math.min(Math.floor(rel / FRAMES_PER_PAGE), pageCount - 1);

  // Fade entre páginas (primeros y últimos 8 frames)
  const localFrame = rel - currentPage * FRAMES_PER_PAGE;
  const opacity = interpolate(
    localFrame,
    [0, 8, FRAMES_PER_PAGE - 8, FRAMES_PER_PAGE],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const pageItems = items.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );
  const pageLabel = pageCount > 1 ? `Page ${currentPage + 1} of ${pageCount}` : '';

  // Construir filas (categorías + items), igual que el loop de vocabImage.ts
  type Row =
    | { type: 'category'; label: string }
    | { type: 'item'; item: VocabularyItem; isOdd: boolean };

  const rows: Row[] = [];
  let currentCategory = '';
  let itemIndex = 0;

  for (const item of pageItems) {
    const cat = item.category?.trim() ?? '';
    if (cat && cat !== currentCategory) {
      currentCategory = cat;
      rows.push({ type: 'category', label: cat.toUpperCase() });
    }
    rows.push({ type: 'item', item, isOdd: itemIndex % 2 === 0 });
    itemIndex++;
  }

  // Estilo compartido para los absolute positioned dentro de AbsoluteFill
  const abs = (top: number, extraStyle?: React.CSSProperties): React.CSSProperties => ({
    position: 'absolute',
    left: 0,
    right: 0,
    top,
    ...extraStyle,
  });

  return (
    <AbsoluteFill style={{ backgroundColor: BG, opacity, fontFamily: MAIN_FONT }}>

      {/* ── Branding top-left — vocabImage.ts: x=MARGIN_X, y=28, WHITE@0.6 ── */}
      <div style={abs(BRAND_Y, { left: MARGIN_X, right: undefined, color: `${WHITE}99`, fontSize: FONT_SMALL, letterSpacing: 2, fontWeight: 500 })}>
        FLUENT STACK PODCAST  |  <span style={{ color: accentColor, fontWeight: 700 }}>{level.toUpperCase()}</span>
      </div>

      {/* ── Título "VOCABULARY RECAP" — centrado, y=60, GOLD, 44px ── */}
      <div style={abs(HEADER_Y, { textAlign: 'center', color: accentColor, fontSize: FONT_LARGE, fontWeight: 800, letterSpacing: 4, textTransform: 'uppercase', filter: `drop-shadow(0 0 15px ${accentColor}44)` })}>
        Vocabulary Recap
      </div>

      {/* ── Subtítulo: nombre del episodio — centrado, y=120, WHITE@0.5 ── */}
      {title && (
        <div style={abs(SUBTITLE_Y, { textAlign: 'center', color: `${WHITE}80`, fontSize: FONT_SMALL })}>
          {title}
        </div>
      )}

      {/* ── Indicador de página — centrado, y=155, WHITE@0.5 ── */}
      {pageLabel && (
        <div style={abs(PAGE_Y, { textAlign: 'center', color: `${WHITE}80`, fontSize: FONT_SMALL })}>
          {pageLabel}
        </div>
      )}

      {/* ── Tabla — Grid Layout Autoadaptable ── */}
      <div style={{
        position: 'absolute',
        top: TABLE_Y,
        left: MARGIN_X,
        right: MARGIN_X,
        display: 'grid',
        // Columnas: 1ra columna adaptable a su contenido (mínimo 320px), y luego 2 columnas de igual tamaño (1.5fr y 1fr)
        gridTemplateColumns: 'minmax(320px, max-content) 1.5fr 1fr',
      }}>
        {rows.map((row, idx) => {
          if (row.type === 'category') {
            return (
              <React.Fragment key={`cat-${row.label}-${idx}`}>
                {/* Categoría: Título */}
                <div style={{
                  height: ROW_H,
                  backgroundColor: CAT_BG,
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderLeft: `4px solid ${accentColor}`,
                  paddingLeft: 10,
                  paddingRight: 30,
                }}>
                  <span style={{ color: accentColor, fontSize: FONT_SMALL, fontWeight: 700, letterSpacing: 1 }}>
                    {row.label.toUpperCase()}
                  </span>
                </div>
                {/* Categoría: Cabecera Definición */}
                <div style={{
                  height: ROW_H,
                  backgroundColor: CAT_BG,
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: 10,
                  paddingRight: 30,
                }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '18px', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', lineHeight: '1.4' }}>
                    DEFINITION
                  </span>
                </div>
                {/* Categoría: Cabecera Ejemplo */}
                <div style={{
                  height: ROW_H,
                  backgroundColor: CAT_BG,
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: 10,
                  paddingRight: 10,
                }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '18px', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', lineHeight: '1.2' }}>
                    EXAMPLE
                  </span>
                </div>
              </React.Fragment>
            );
          }

          // Fila normal (Item de Vocabulario)
          const { item, isOdd } = row;
          const bgCell = isOdd ? ROW_ODD : 'transparent';

          return (
            <React.Fragment key={`item-${item.term}-${idx}`}>
              {/* Término — columna izquierda */}
              <div style={{
                height: ROW_H,
                backgroundColor: bgCell,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                borderLeft: '4px solid transparent',
                paddingLeft: 10,
                paddingRight: 30,
              }}>
                <span style={{
                  color: accentColor,
                  fontSize: FONT_MEDIUM,
                  fontWeight: 600,
                  // Dejamos que salte de línea si un 'Concept' es más ancho de lo permisible visualmente
                  lineHeight: '1.1'
                }}>
                  {item.term}
                </span>
                {item.phonetic && (
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '20px', fontFamily: 'monospace', fontWeight: 400, marginTop: '4px' }}>
                    {item.phonetic}
                  </span>
                )}
              </div>

              {/* Definición English — columna medio */}
              <div style={{
                height: ROW_H,
                backgroundColor: bgCell,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'flex-start',
                textAlign: 'left',
                paddingLeft: 10,
                paddingRight: 30,
              }}>
                <div style={{ color: WHITE, fontSize: FONT_MEDIUM, lineHeight: '1.2' }}>
                  {item.english || item.definition}
                </div>
              </div>

              {/* Example — columna derecha */}
              <div style={{
                height: ROW_H,
                backgroundColor: bgCell,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'flex-start',
                textAlign: 'left',
                paddingLeft: 10,
                paddingRight: 10,
              }}>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '22px', fontStyle: 'italic', lineHeight: '1.2' }}>
                  {item.example ? `"${item.example}"` : '-'}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

    </AbsoluteFill>
  );
};
