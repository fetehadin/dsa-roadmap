// node scripts/vizshot.mjs <path> [width] [theme] [clicks...]  → screenshots #visualize section
import { chromium } from 'playwright-core';
const [path, w = '1280', theme = 'dark', ...clicks] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: '/usr/bin/chromium' });
const ctx = await b.newContext({ viewport: { width: +w, height: 900 } });
await ctx.addInitScript((t) => localStorage.setItem('dsa-theme', t), theme);
const p = await ctx.newPage();
p.on('pageerror', (e) => console.log('pageerror', e.message));
await p.goto('http://localhost:4321' + path, { waitUntil: 'networkidle' });
await p.locator('#visualize').scrollIntoViewIfNeeded();
await p.waitForTimeout(1200);
for (const c of clicks) {
  if (c.startsWith('key:')) await p.keyboard.press(c.slice(4));
  else await p.getByRole('button', { name: c, exact: true }).first().click();
  await p.waitForTimeout(250);
}
const name = `.shots/viz${path.replace(/\//g, '_')}-${w}-${theme}.png`;
await p.locator('#visualize').screenshot({ path: name });
console.log(name);
await b.close();
