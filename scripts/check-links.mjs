// 1. Every video ID used by a topic exists in src/data/videos.ts and passes YouTube oEmbed.
// 2. Every internal href/src in dist/**/*.html points at a built file (run `npm run build` first).
// 3. Every external URL answers (bot-walled hosts accept 403/429). Use --offline to skip 1 and 3.
import fs from 'node:fs';
import path from 'node:path';

const offline = process.argv.includes('--offline');
let fail = 0;
const bad = (m) => (fail++, console.log(`✗ ${m}`));

/* ---------- videos ---------- */
const videoSrc = fs.readFileSync('src/data/videos.ts', 'utf8');
const known = new Set([...videoSrc.matchAll(/^\s*'?([\w-]{11})'?: \{/gm)].map((m) => m[1]));
const topicsDir = 'src/content/topics';
const used = new Map();
for (const f of fs.readdirSync(topicsDir)) {
  const fm = fs.readFileSync(path.join(topicsDir, f), 'utf8').split('\n---')[0];
  const block = fm.match(/^videos:\n((?:\s+.*\n)+)/m)?.[1] ?? '';
  for (const m of block.matchAll(/- id: '?([\w-]{11})'?\s*$/gm)) used.set(m[1], [...(used.get(m[1]) ?? []), f]);
}
for (const [id, files] of used) if (!known.has(id)) bad(`video ${id} (${files.join(', ')}) missing from videos.ts`);
if (!offline) {
  const ids = [...new Set([...known, ...used.keys()])];
  await Promise.all(
    ids.map(async (id) => {
      const r = await fetch(`https://www.youtube.com/oembed?url=https://youtu.be/${id}&format=json`).catch(() => null);
      if (!r || !r.ok) bad(`video ${id}: oEmbed ${r ? r.status : 'network error'}`);
    }),
  );
  console.log(`✓ checked ${ids.length} video IDs`);
}

/* ---------- internal links ---------- */
const dist = path.resolve('dist');
if (!fs.existsSync(dist)) bad('dist/ missing: run npm run build first');
const html = [];
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : e.name.endsWith('.html') && html.push(path.join(d, e.name))));
if (fs.existsSync(dist)) walk(dist);
const external = new Map();
const exists = (p) => {
  const clean = decodeURIComponent(p.split(/[?#]/)[0]);
  const f = path.join(dist, clean);
  return fs.existsSync(f) && fs.statSync(f).isFile() ? true : fs.existsSync(path.join(f, 'index.html'));
};
let internal = 0;
for (const file of html) {
  const s = fs.readFileSync(file, 'utf8');
  for (const m of s.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    const u = m[1].replace(/&amp;/g, '&');
    if (u.startsWith('/') && !u.startsWith('//')) {
      internal++;
      if (!exists(u)) bad(`${path.relative(dist, file)} → ${u}`);
    } else if (/^https?:\/\//.test(u) && !u.startsWith('https://dsa.fetehadin.com')) external.set(u, path.relative(dist, file));
  }
}
console.log(`✓ checked ${internal} internal links in ${html.length} pages`);

/* ---------- external links ---------- */
if (!offline) {
  const walled = /leetcode\.com|hackerrank\.com|geeksforgeeks\.org|youtube\.com|godbolt\.org|onlinegdb\.com|docs\.google\.com/;
  const urls = [...external.keys()].filter((u) => !u.startsWith('https://godbolt.org/clientstate/') && !u.startsWith('https://www.youtube-nocookie.com'));
  const queue = [...urls];
  const worker = async () => {
    while (queue.length) {
      const u = queue.shift();
      let r = null;
      try {
        r = await fetch(u, { method: 'GET', redirect: 'follow', headers: { 'User-Agent': 'Mozilla/5.0 (link checker)' }, signal: AbortSignal.timeout(15000) });
      } catch {
        /* network error */
      }
      const ok = r && (r.ok || (walled.test(u) && [403, 429].includes(r.status)));
      if (!ok) bad(`${external.get(u)} → ${u} (${r ? r.status : 'network error'})`);
    }
  };
  await Promise.all(Array.from({ length: 8 }, worker));
  console.log(`✓ checked ${urls.length} external URLs`);
}

console.log(fail ? `\n${fail} problem(s).` : '\nAll links and video IDs OK.');
process.exit(fail ? 1 : 0);
