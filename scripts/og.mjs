// Renders public/og/<chapter>.png (1200×630) for every chapter plus default.png.
// Run locally with `npm run og` and commit the PNGs; the Cloudflare build does not need resvg.
import fs from 'node:fs';
import { Resvg } from '@resvg/resvg-js';

const src = fs.readFileSync('src/data/chapters.ts', 'utf8');
const chapters = [...src.matchAll(/slug: '([^']+)',\s*num: '([^']+)',\s*title: '([^']+)',[\s\S]*?weeks: '([^']+)',\s*accent: \{ dark: '([^']+)'/g)].map(
  ([, slug, num, title, weeks, accent]) => ({ slug, num, title, weeks, accent }),
);
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

function wrap(text, max) {
  const words = text.split(' ');
  const lines = [''];
  for (const w of words) {
    if ((lines.at(-1) + ' ' + w).trim().length > max) lines.push(w);
    else lines[lines.length - 1] = (lines.at(-1) + ' ' + w).trim();
  }
  return lines;
}

function svg({ num, title, weeks, accent }) {
  const lines = wrap(title, 22);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs><radialGradient id="g" cx="0.25" cy="0.2" r="0.9"><stop offset="0" stop-color="${accent}" stop-opacity="0.35"/><stop offset="1" stop-color="#0b0d12" stop-opacity="0"/></radialGradient></defs>
  <rect width="1200" height="630" fill="#0b0d12"/><rect width="1200" height="630" fill="url(#g)"/>
  <rect x="80" y="80" width="64" height="64" rx="16" fill="${accent}"/>
  <path d="M102 124V100l17 12-17 12Zm22 0h14" stroke="#0b0d12" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="164" y="124" font-family="JetBrains Mono" font-size="30" font-weight="700" fill="#e6e8ee">dsa/roadmap</text>
  <text x="80" y="250" font-family="JetBrains Mono" font-size="34" font-weight="700" fill="${accent}">${esc(num === 'LU' ? 'LEVEL UP' : num ? `CHAPTER ${num}` : 'COSC3111 · AAU · C++')}</text>
  ${lines.map((l, i) => `<text x="80" y="${330 + i * 84}" font-family="Inter, Noto Sans, DejaVu Sans, sans-serif" font-size="76" font-weight="800" fill="#f5f6fa">${esc(l)}</text>`).join('')}
  <text x="80" y="560" font-family="JetBrains Mono" font-size="26" fill="#8b90a0">${esc(weeks)} · visual step-throughs · C++ · quizzes · labs</text>
</svg>`;
}

fs.mkdirSync('public/og', { recursive: true });
const all = [...chapters, { slug: 'default', num: '', title: 'Data Structures & Algorithms in C++', weeks: '16 weeks', accent: '#22d3ee' }];
for (const c of all) {
  const png = new Resvg(svg(c), { font: { loadSystemFonts: true, defaultFontFamily: 'DejaVu Sans' } }).render().asPng();
  fs.writeFileSync(`public/og/${c.slug}.png`, png);
  console.log(`public/og/${c.slug}.png`);
}
