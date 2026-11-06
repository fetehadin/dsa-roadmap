import data from '@/data/google-fonts.json';

/**
 * Google Fonts (font-display: swap), inlined. `npm run fonts` fetches the CSS once
 * into src/data/google-fonts.json, so builds never depend on reaching Google.
 * Inlining skips a render-delaying round trip, and preloading the Latin files used
 * on the first screen means they usually land before first layout, avoiding a
 * second full relayout when they swap in. The files still come from fonts.gstatic.com.
 */
export const FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&family=JetBrains+Mono:wght@400..700&display=swap';

export async function googleFonts(): Promise<{ css: string; preload: string[] } | null> {
  return data.url === FONTS_URL && data.css ? { css: data.css, preload: data.preload } : null;
}
