import { loadFont } from '@remotion/google-fonts/Montserrat';
// import { load } from '@remotion/google-fonts/Outfit'

const { fontFamily } = loadFont();

/**
 * Single source of truth for the project's main font.
 */
export const MAIN_FONT = fontFamily;

/**
 * Helper to ensure the font is loaded in any environment (Vite Player or Remotion Studio).
 */
export const initFonts = () => {
  // The loadFont() function from @remotion/google-fonts automatically
  // inserts the necessary @font-face into the document.
  return MAIN_FONT;
};
