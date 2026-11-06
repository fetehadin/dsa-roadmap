// Usage: node scripts/shots.mjs /path [/path2 ...]  → .shots/<name>-<w>-<theme>.png
// Env: WIDTHS=360,1280  THEMES=dark,light  FULL=1  BASE=http://localhost:4321
import { chromium } from 'playwright-core';
import fs from 'node:fs';

const base = process.env.BASE ?? 'http://localhost:4321';
const widths = (process.env.WIDTHS ?? '360,1280').split(',').map(Number);
const themes = (process.env.THEMES ?? 'dark,light').split(',');
const paths = process.argv.slice(2);
fs.mkdirSync('.shots', { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROME ?? '/usr/bin/chromium',
});
for (const theme of themes)
  for (const w of widths) {
    const ctx = await browser.newContext({
      viewport: { width: w, height: w < 500 ? 780 : 900 },
      deviceScaleFactor: 1,
      reducedMotion: 'reduce',
    });
    await ctx.addInitScript((t) => localStorage.setItem('dsa-theme', t), theme);
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    for (const p of paths) {
      await page.goto(base + p, { waitUntil: 'networkidle' });
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(200);
      const name = p.replace(/\//g, '_') || '_home';
      const file = `.shots/${name}-${w}-${theme}.png`;
      await page.screenshot({ path: file, fullPage: !!process.env.FULL });
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      );
      console.log(
        `${file}${overflow ? '  ⚠ horizontal overflow' : ''}${errors.length ? '  ⚠ ' + errors.join(' | ') : ''}`,
      );
      errors.length = 0;
    }
    await ctx.close();
  }
await browser.close();
