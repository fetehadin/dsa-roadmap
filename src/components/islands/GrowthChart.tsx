import { useEffect, useMemo, useRef, useState } from 'react';

const SERIES = [
  { id: '1', label: 'O(1)', f: () => 1, light: '#2a78d6', dark: '#3987e5' },
  { id: 'log', label: 'O(log n)', f: (n: number) => Math.log2(Math.max(1, n)), light: '#eb6834', dark: '#d95926' },
  { id: 'n', label: 'O(n)', f: (n: number) => n, light: '#1baf7a', dark: '#199e70' },
  { id: 'nlog', label: 'O(n log n)', f: (n: number) => n * Math.log2(Math.max(1, n)), light: '#eda100', dark: '#c98500' },
  { id: 'n2', label: 'O(n²)', f: (n: number) => n * n, light: '#e87ba4', dark: '#d55181' },
  { id: '2n', label: 'O(2ⁿ)', f: (n: number) => 2 ** n, light: '#4a3aa7', dark: '#9085e9' },
];

const PL = 46, PR = 84, PT = 14, PB = 30;
const fmt = (v: number) => (v >= 1e6 ? v.toExponential(1).replace('e+', 'e') : v >= 100 ? Math.round(v).toLocaleString() : +v.toFixed(1) + '');

export default function GrowthChart() {
  const [n, setN] = useState(16);
  const [log, setLog] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(640);
  useEffect(() => {
    if (!box.current) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, Math.round(e.contentRect.width))));
    ro.observe(box.current);
    return () => ro.disconnect();
  }, []);
  const H = W < 480 ? 240 : 300;
  const xs = useMemo(() => Array.from({ length: n }, (_, i) => i + 1), [n]);
  const ymax = log ? Math.log10(Math.max(2, 2 ** n)) : Math.max(n * n, 10);
  const X = (x: number) => PL + ((x - 1) / Math.max(1, n - 1)) * (W - PL - PR);
  const Y = (v: number) => {
    const t = log ? Math.log10(Math.max(1, v)) / ymax : Math.min(v, ymax * 1.05) / ymax;
    return H - PB - t * (H - PT - PB);
  };
  const ticks = log ? Array.from({ length: Math.floor(ymax) + 1 }, (_, i) => 10 ** i).filter((_, i, a) => a.length < 7 || i % Math.ceil(a.length / 6) === 0) : [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(t * ymax));
  const hx = hover ?? n;
  return (
    <div className="card grid gap-3 p-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <label className="flex flex-1 items-center gap-3 text-sm" htmlFor="growth-n">
          <span className="font-mono whitespace-nowrap">n = {n}</span>
          <input id="growth-n" type="range" min={2} max={40} value={n} onChange={(e) => setN(+e.target.value)} className="flex-1 accent-[var(--accent)]" />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={log} onChange={(e) => setLog(e.target.checked)} className="size-4 accent-[var(--accent)]" /> log scale
        </label>
      </div>
      <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted" aria-label="Legend">
        {SERIES.map((s) => (
          <li key={s.id} className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded bg-[var(--c)]" style={{ ['--c' as string]: `light-dark(${s.light}, ${s.dark})` }} />
            {s.label}
          </li>
        ))}
      </ul>
      <div ref={box}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="block w-full" role="img" aria-label={`Growth of common complexity classes up to n = ${n}`}
        onPointerMove={(e) => {
          const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
          const px = ((e.clientX - r.left) / r.width) * W;
          const x = Math.round(1 + ((px - PL) / (W - PL - PR)) * (n - 1));
          setHover(x >= 1 && x <= n ? x : null);
        }}
        onPointerLeave={() => setHover(null)}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PL} x2={W - PR} y1={Y(t)} y2={Y(t)} stroke="var(--border)" strokeWidth={1} />
            <text x={PL - 6} y={Y(t) + 4} textAnchor="end" className="fill-[var(--fg-faint)] font-mono text-[10px]">{fmt(t)}</text>
          </g>
        ))}
        <text x={(W - PR + PL) / 2} y={H - 6} textAnchor="middle" className="fill-[var(--fg-faint)] text-[10px]">input size n →</text>
        {SERIES.map((s) => {
          const d = xs.map((x, i) => `${i ? 'L' : 'M'}${X(x).toFixed(1)},${Y(s.f(x)).toFixed(1)}`).join(' ');
          const endY = Math.max(PT + 6, Math.min(H - PB, Y(s.f(n))));
          return (
            <g key={s.id} style={{ ['--c' as string]: `light-dark(${s.light}, ${s.dark})` }}>
              <path d={d} fill="none" stroke="var(--c)" strokeWidth={2} strokeLinejoin="round" />
              <text x={W - PR + 6} y={endY + 4} className="fill-[var(--fg-muted)] font-mono text-[10px]">{s.label}</text>
            </g>
          );
        })}
        <line x1={X(hx)} x2={X(hx)} y1={PT} y2={H - PB} stroke="var(--fg-faint)" strokeDasharray="3 3" />
        <rect x={PL} y={PT} width={W - PL - PR} height={H - PT - PB} fill="transparent" />
      </svg>
      </div>
      <table className="w-full text-sm" aria-label={`Values at n = ${hx}`}>
        <caption className="pb-1 text-left text-xs text-muted">Steps needed when n = {hx}{hover ? ' (hovered)' : ''}</caption>
        <tbody className="grid grid-cols-2 gap-x-6 sm:grid-cols-3">
          {SERIES.map((s) => (
            <tr key={s.id} className="flex justify-between border-b border-line py-1">
              <th scope="row" className="flex items-center gap-1.5 font-normal text-muted">
                <span className="size-2 rounded-full bg-[var(--c)]" style={{ ['--c' as string]: `light-dark(${s.light}, ${s.dark})` }} />
                {s.label}
              </th>
              <td className="font-mono">{fmt(s.f(hx))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
