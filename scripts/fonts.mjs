// Refreshes src/data/google-fonts.json: the Google Fonts CSS (woff2, all subsets)
// plus the Latin files to preload. Run after changing FONTS_URL in src/lib/fonts.ts.
import fs from 'node:fs';

const src = fs.readFileSync('src/lib/fonts.ts', 'utf8');
const url = src.match(/'(https:\/\/fonts\.googleapis\.com[^']+)'/)[1];
const UA =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';

let css = null;
for (let i = 0; i < 4 && !css; i++) {
  try {
    const r = await fetch(url, {
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(15000),
    });
    if (r.ok) css = await r.text();
  } catch (e) {
    console.warn(`attempt ${i + 1} failed: ${e.cause?.code ?? e.message}`);
  }
}
if (!css) process.exit(1);
css = css
  .replace(/\/\*[^*]*\*\//g, '')
  .replace(/\s*\n\s*/g, '')
  .replace(/\s*\{\s*/g, '{')
  .replace(/:\s+/g, ':')
  .replace(/;\s*/g, ';');
const faces = css.match(/@font-face\{[^}]+\}/g) ?? [];
const pick = (family, weight) =>
  faces
    .find(
      (f) =>
        f.includes(`'${family}'`) &&
        f.includes('font-style:normal') &&
        f.includes('U+0000-00FF') &&
        (!weight || f.includes(`font-weight:${weight}`)),
    )
    ?.match(/url\((https:[^)]+\.woff2)\)/)?.[1];
// Heading (the LCP text) and body. Preloading more makes them compete on slow links.
const preload = [...new Set([pick('Bricolage Grotesque'), pick('IBM Plex Sans', 400)])].filter(
  Boolean,
);
fs.writeFileSync(
  'src/data/google-fonts.json',
  JSON.stringify({ url, css, preload }, null, 0) + '\n',
);
console.log(
  `wrote src/data/google-fonts.json: ${faces.length} faces, ${css.length} bytes, preload ${preload.length}`,
);
