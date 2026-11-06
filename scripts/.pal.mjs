import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/usr/bin/chromium' });
const pg = await b.newPage();
const reqs = [];
pg.on('request', (r) => r.url().includes('/_astro/') && reqs.push(r.url().split('/').pop()));
const errs = [];
pg.on('pageerror', (e) => errs.push(e.message));
await pg.goto('http://localhost:4321/', { waitUntil: 'load' });
await pg.waitForTimeout(1500);
console.log(
  'react loaded before search:',
  reqs.some((r) => r.startsWith('client.')),
  reqs.join(' '),
);
await pg.click('#open-search');
await pg.waitForSelector('input[role="combobox"], [role="dialog"] input', { timeout: 10000 });
await pg.keyboard.type('heap');
await pg.waitForTimeout(800);
console.log('palette results:', await pg.locator('[role="option"]').count());
await pg.keyboard.press('Escape');
await pg.waitForTimeout(300);
await pg.keyboard.press('Control+k');
await pg.waitForTimeout(500);
console.log(
  'reopen with ctrl+k:',
  (await pg.locator('[role="dialog"] input, input[role="combobox"]').count()) > 0,
);
const p2 = await b.newPage();
p2.on('pageerror', (e) => errs.push(e.message));
await p2.goto('http://localhost:4321/progress', { waitUntil: 'load' });
await p2.waitForTimeout(800);
await p2.keyboard.press('/');
await p2.waitForTimeout(1500);
console.log(
  'slash opens on another page:',
  (await p2.locator('[role="dialog"] input, input[role="combobox"]').count()) > 0,
  '| streak visible:',
  await p2.locator('#streak').isVisible(),
);
console.log('errors', errs);
await b.close();
