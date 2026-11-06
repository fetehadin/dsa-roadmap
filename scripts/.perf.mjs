import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/usr/bin/chromium' });
const variants = [
  ['full', null, null],
  ['no webfonts', /fonts\.(googleapis|gstatic)\.com/, null],
  ['no react islands', /_astro\/client\./, null],
  ['no roadmap nodes', null, () => document.querySelector('.rm')?.remove()],
];
for (const [label, block, mutate] of variants) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 823 } });
  const pg = await ctx.newPage();
  if (block) await pg.route(block, (r) => r.abort());
  if (mutate)
    await pg.addInitScript(`document.addEventListener('DOMContentLoaded', ${mutate.toString()})`);
  const cdp = await ctx.newCDPSession(pg);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await cdp.send('Performance.enable');
  try {
    await pg.goto('http://localhost:4321/', { waitUntil: 'load', timeout: 60000 });
    await pg.waitForTimeout(3000);
    const m = Object.fromEntries(
      (await cdp.send('Performance.getMetrics')).metrics.map((x) => [x.name, x.value]),
    );
    console.log(
      label.padEnd(18),
      'layouts',
      m.LayoutCount,
      'layoutMs',
      Math.round(m.LayoutDuration * 1000),
      'styleMs',
      Math.round(m.RecalcStyleDuration * 1000),
      'scriptMs',
      Math.round(m.ScriptDuration * 1000),
    );
  } catch (e) {
    console.log(label, 'ERR', e.message.split('\n')[0]);
  }
  await ctx.close();
}
await b.close();
