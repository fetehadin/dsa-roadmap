const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export function confetti(colors = ['#a78bfa', '#4ade80', '#fbbf24', '#60a5fa', '#fb7185']) {
  if (reduced()) return;
  const c = document.createElement('canvas');
  c.setAttribute('aria-hidden', 'true');
  c.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:100';
  document.body.appendChild(c);
  const ctx = c.getContext('2d')!;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  c.width = innerWidth * dpr;
  c.height = innerHeight * dpr;
  ctx.scale(dpr, dpr);
  const parts = Array.from({ length: 140 }, () => ({
    x: innerWidth / 2 + (Math.random() - 0.5) * 120,
    y: innerHeight * 0.35,
    vx: (Math.random() - 0.5) * 14,
    vy: -Math.random() * 13 - 4,
    r: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.3,
    w: 6 + Math.random() * 6,
    h: 3 + Math.random() * 4,
    col: colors[Math.floor(Math.random() * colors.length)],
  }));
  const t0 = performance.now();
  const tick = (t: number) => {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (const p of parts) {
      p.vy += 0.35;
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.r += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.r);
      ctx.fillStyle = p.col;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (t - t0 < 2600) requestAnimationFrame(tick);
    else c.remove();
  };
  requestAnimationFrame(tick);
}

export function toast(title: string, body = '', emoji = '🎉') {
  let host = document.getElementById('toast-host');
  if (!host) {
    host = document.createElement('div');
    host.id = 'toast-host';
    host.setAttribute('role', 'status');
    host.setAttribute('aria-live', 'polite');
    host.style.cssText =
      'position:fixed;left:50%;bottom:1.25rem;transform:translateX(-50%);z-index:101;display:grid;gap:.5rem;width:min(92vw,380px)';
    document.body.appendChild(host);
  }
  const el = document.createElement('div');
  el.className = 'card anim-pop';
  el.style.cssText = 'padding:.85rem 1rem;display:flex;gap:.75rem;align-items:flex-start';
  el.innerHTML = `<span style="font-size:1.4rem;line-height:1">${emoji}</span><div><div style="font-weight:650"></div><div style="color:var(--fg-muted);font-size:.875rem"></div></div>`;
  const [t, b] = el.querySelectorAll('div > div');
  t.textContent = title;
  b.textContent = body;
  host.appendChild(el);
  setTimeout(() => {
    el.style.transition = 'opacity .3s';
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 300);
  }, 4200);
}
