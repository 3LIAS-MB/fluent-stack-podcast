import React, { useMemo } from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { VocabularyItem, EpisodeLevel } from '../types';
import { getLevelColor, LEVEL_ACCENT_COLOR } from '../utils/levelColors';
import { MAIN_FONT } from '../utils/fonts';
import { paginateVocabulary } from '../utils/vocabPagination';

interface VocabRecapProps {
  vocabulary: VocabularyItem[];
  startFrame: number;
  title?: string;
  level: EpisodeLevel;
}

// ─── Configuración de Paginación Inteligente ──────────────────────────────────
const MAX_ROWS_PER_PAGE = 8
const SECONDS_PER_PAGE = 5;
const FRAMES_PER_PAGE = SECONDS_PER_PAGE * 30; // 150 frames

// Colores base
const BG = '#0A0A1A';
const WHITE = '#FFFFFF';
const ROW_ODD = '#111122';
const CAT_BG = '#0D1B2A';

// Fuentes
const FONT_LARGE = 44;  // "VOCABULARY RECAP"
const FONT_MEDIUM = 24;  // término / definición
const FONT_SMALL = 20;  // branding, subtítulo, categorías, página

// Layout
const MARGIN_X = 80;
const HEADER_Y = 60;
const SUBTITLE_Y = 120;
const BRAND_Y = 28;
const PAGE_Y = 155;
const TABLE_Y = 195;
const ROW_H = 100;

/**
 * VocabRecap — Versión con Paginación Inteligente basada en Filas Visuales.
 * Garantiza que nunca se superen las 7 filas (items + categorías) por pantalla.
 */
export const VocabRecap: React.FC<VocabRecapProps> = ({
  vocabulary,
  startFrame,
  title = '',
  level,
}) => {
  const frame = useCurrentFrame();
  const accentColor = getLevelColor(level);

  // 1. Paginación Inteligente (Memoized)
  const pages = useMemo(() => {
    // Nota: vocabulary ya viene filtrado desde normalizeVocabulary en Root.tsx
    // pero nos aseguramos por si acaso.
    const items = Array.isArray(vocabulary) ? vocabulary : [];
    return paginateVocabulary(items, MAX_ROWS_PER_PAGE);
  }, [vocabulary]);

  if (pages.length === 0) return null;

  // 2. Cálculo de página actual
  const rel = frame - startFrame;
  const currentPageIdx = Math.min(Math.floor(rel / FRAMES_PER_PAGE), pages.length - 1);
  const rows = pages[currentPageIdx];

  // 3. Animación de Fade
  const localFrame = rel - currentPageIdx * FRAMES_PER_PAGE;
  const opacity = interpolate(
    localFrame,
    [0, 8, FRAMES_PER_PAGE - 8, FRAMES_PER_PAGE],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const pageLabel = pages.length > 1 ? `Page ${currentPageIdx + 1} of ${pages.length}` : '';

  // Helper para posicionamiento absoluto
  const abs = (top: number, extraStyle?: React.CSSProperties): React.CSSProperties => ({
    position: 'absolute',
    left: 0,
    right: 0,
    top,
    ...extraStyle,
  });

  return (
    <AbsoluteFill style={{ backgroundColor: BG, opacity, fontFamily: MAIN_FONT }}>

      {/* Branding top-left */}
      <div style={abs(BRAND_Y, { left: MARGIN_X, right: undefined, color: `${WHITE}99`, fontSize: FONT_SMALL, letterSpacing: 2, fontWeight: 500 })}>
        FLUENT STACK PODCAST  |  <span style={{ color: accentColor, fontWeight: 700 }}>{level.toUpperCase()}</span>
      </div>

      {/* Título "VOCABULARY RECAP" */}
      <div style={abs(HEADER_Y, { textAlign: 'center', color: accentColor, fontSize: FONT_LARGE, fontWeight: 800, letterSpacing: 4, textTransform: 'uppercase', filter: `drop-shadow(0 0 15px ${accentColor}44)` })}>
        Vocabulary Recap
      </div>

      {/* Subtítulo: nombre del episodio */}
      {title && (
        <div style={abs(SUBTITLE_Y, { textAlign: 'center', color: `${WHITE}80`, fontSize: FONT_SMALL })}>
          {title}
        </div>
      )}

      {/* Indicador de página */}
      {pageLabel && (
        <div style={abs(PAGE_Y, { textAlign: 'center', color: `${WHITE}80`, fontSize: FONT_SMALL })}>
          {pageLabel}
        </div>
      )}

      {/* Tabla — Grid Layout Autoadaptable (Max 7 Filas Totales) */}
      <div style={{
        position: 'absolute',
        top: TABLE_Y,
        left: MARGIN_X,
        right: MARGIN_X,
        display: 'grid',
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
                <div style={{ height: ROW_H, backgroundColor: CAT_BG, display: 'flex', alignItems: 'center', paddingLeft: 10, paddingRight: 30 }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '18px', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>
                    DEFINITION
                  </span>
                </div>
                {/* Categoría: Cabecera Ejemplo */}
                <div style={{ height: ROW_H, backgroundColor: CAT_BG, display: 'flex', alignItems: 'center', paddingLeft: 10, paddingRight: 10 }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '18px', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>
                    EXAMPLE
                  </span>
                </div>
              </React.Fragment>
            );
          }

          // Fila normal
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
                paddingLeft: 10,
                paddingRight: 30,
              }}>
                <span style={{ color: accentColor, fontSize: FONT_MEDIUM, fontWeight: 600, lineHeight: '1.1' }}>
                  {item.term}
                </span>
                {item.phonetic && (
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '20px', fontFamily: 'monospace', marginTop: '4px' }}>
                    {item.phonetic}
                  </span>
                )}
              </div>

              {/* Definición — columna medio */}
              <div style={{ height: ROW_H, backgroundColor: bgCell, display: 'flex', alignItems: 'center', paddingLeft: 10, paddingRight: 30 }}>
                <div style={{ color: WHITE, fontSize: FONT_MEDIUM, lineHeight: '1.2' }}>
                  {item.english || item.definition}
                </div>
              </div>

              {/* Example — columna derecha */}
              <div style={{ height: ROW_H, backgroundColor: bgCell, display: 'flex', alignItems: 'center', paddingLeft: 10, paddingRight: 10 }}>
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
