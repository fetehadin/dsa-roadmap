import { useState, type CSSProperties } from 'react';
import type { Frame, Role, ViewKind } from './types';
import { roleVar } from './types';

type HL = Frame['hl'];
type Ptr = Frame['ptr'];

const tint = (r?: Role): CSSProperties =>
  r
    ? r === 'dim'
      ? { opacity: 0.4 }
      : {
          background: `color-mix(in oklab, ${roleVar[r]} 22%, var(--bg-elev))`,
          borderColor: roleVar[r],
          color: 'var(--fg)',
        }
    : {};

const fillOf = (r?: Role) =>
  r && r !== 'dim' ? `color-mix(in oklab, ${roleVar[r]} 30%, var(--bg-elev))` : 'var(--bg-elev)';
const strokeOf = (r?: Role) => (r && r !== 'dim' ? roleVar[r] : 'var(--border-strong)');

const ptrsAt = (ptr: Ptr, key: number | string) =>
  ptr
    ? Object.entries(ptr)
        .filter(([, v]) => v !== null && v !== undefined && String(v) === String(key))
        .map(([k]) => k)
    : [];

/* ---------------- bars ---------------- */
export interface BarsState {
  a: number[];
}
function Bars({ f }: { f: Frame<BarsState> }) {
  const { a } = f.s;
  const max = Math.max(1, ...a.map((x) => Math.abs(x)));
  return (
    <div
      className="flex h-56 items-end justify-center gap-1 px-1 pt-6 sm:gap-1.5"
      role="img"
      aria-label={`Array: ${a.join(', ')}`}
    >
      {a.map((v, i) => {
        const r = f.hl?.[i];
        const p = ptrsAt(f.ptr, i);
        return (
          <div
            key={i}
            className="flex h-full max-w-12 min-w-6 flex-1 flex-col items-center justify-end"
          >
            <span className="mb-1 font-mono text-[0.7rem] text-muted tabular-nums">{v}</span>
            <div
              className="w-full rounded-t-md border transition-[height,background-color,border-color] duration-300"
              style={{
                height: `${Math.max(6, (Math.abs(v) / max) * 100)}%`,
                background: r && r !== 'dim' ? roleVar[r] : 'var(--border-strong)',
                borderColor: r && r !== 'dim' ? roleVar[r] : 'var(--border-strong)',
                opacity: r === 'dim' ? 0.35 : 1,
              }}
            />
            <span className="mt-1 font-mono text-[0.65rem] text-faint">{i}</span>
            <span className="h-4 font-mono text-[0.65rem] font-semibold text-[var(--r-current)]">
              {p.join(',')}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- array rows ---------------- */
export interface Row {
  name?: string;
  a: (number | string | null)[];
  sub?: (string | number)[];
  hl?: Record<number, Role>;
  ptr?: Record<string, number | null | undefined>;
  linked?: boolean;
  range?: [number, number];
  noIndex?: boolean;
}
export interface ArrayState {
  rows: Row[];
}
function Cells({ row, hl, ptr }: { row: Row; hl?: HL; ptr?: Ptr }) {
  const H = { ...(hl ?? {}), ...(row.hl ?? {}) } as Record<number, Role>;
  const P = { ...(ptr ?? {}), ...(row.ptr ?? {}) };
  return (
    <div className="flex items-start gap-2">
      {row.name && (
        <div className="w-20 shrink-0 pt-2.5 text-right font-mono text-xs text-muted">
          {row.name}
        </div>
      )}
      <div className="flex items-start">
        {row.a.map((v, i) => {
          const inRange = row.range && i >= row.range[0] && i <= row.range[1];
          const p = ptrsAt(P, i);
          return (
            <div key={i} className="flex items-start">
              <div className="flex w-11 flex-col items-center">
                <div
                  className={`grid h-10 w-10 place-items-center rounded-lg border font-mono text-sm transition-colors duration-300 ${v === null ? 'border-dashed text-faint' : ''}`}
                  style={{
                    borderColor: 'var(--border-strong)',
                    background: 'var(--bg-elev)',
                    boxShadow: inRange ? '0 0 0 2px var(--r-visited)' : undefined,
                    ...tint(H[i]),
                  }}
                >
                  {v === null ? '·' : v}
                </div>
                {!row.noIndex && (
                  <span className="mt-0.5 font-mono text-[0.62rem] text-faint">
                    {row.sub ? row.sub[i] : i}
                  </span>
                )}
                {p.length > 0 && (
                  <span className="font-mono text-[0.65rem] leading-tight font-semibold text-[var(--r-current)]">
                    ↑{p.join(',')}
                  </span>
                )}
              </div>
              {row.linked && i < row.a.length - 1 && (
                <span className="mt-2.5 px-0.5 text-faint">→</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
function ArrayView({ f }: { f: Frame<ArrayState> }) {
  return (
    <div className="grid min-w-max gap-3 py-2">
      {f.s.rows.map((r, i) => (
        <Cells key={i} row={r} hl={i === 0 ? f.hl : undefined} ptr={i === 0 ? f.ptr : undefined} />
      ))}
    </div>
  );
}

/* ---------------- stack (vertical) ---------------- */
export interface StackState {
  items: (number | string)[];
  cap?: number;
}
function StackView({ f }: { f: Frame<StackState> }) {
  const { items, cap } = f.s;
  const slots = cap ?? Math.max(items.length, 4);
  return (
    <div className="flex justify-center py-2">
      <div
        className="flex flex-col-reverse gap-1 rounded-b-xl border-x-2 border-b-2 border-line-strong p-1.5"
        aria-label={`Stack bottom to top: ${items.join(', ') || 'empty'}`}
      >
        {Array.from({ length: slots }, (_, i) => {
          const v = items[i];
          const isTop = i === items.length - 1;
          return (
            <div key={i} className="flex items-center gap-2">
              <div
                className={`grid h-9 w-24 place-items-center rounded-md border font-mono text-sm transition-colors ${v === undefined ? 'border-dashed text-faint' : 'anim-pop'}`}
                style={{ borderColor: 'var(--border-strong)', ...tint(f.hl?.[i]) }}
              >
                {v ?? ''}
              </div>
              <span className="w-12 font-mono text-[0.65rem] text-[var(--r-current)]">
                {isTop ? '← top' : ''}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- circular queue ---------------- */
export interface RingState {
  a: (number | null)[];
  front: number;
  rear: number;
  count: number;
}
function RingView({ f }: { f: Frame<RingState> }) {
  const { a, front, rear, count } = f.s;
  const n = a.length;
  const R = 78;
  return (
    <svg
      viewBox="-130 -115 260 230"
      className="mx-auto h-60 w-full max-w-sm"
      role="img"
      aria-label={`Circular queue, ${count} items`}
    >
      <circle r={R} fill="none" stroke="var(--border)" strokeDasharray="4 6" />
      {a.map((v, i) => {
        const ang = (i / n) * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(ang) * R;
        const y = Math.sin(ang) * R;
        const r = f.hl?.[i];
        const labels = [
          count > 0 && i === front ? 'front' : '',
          count > 0 && i === rear ? 'rear' : '',
        ].filter(Boolean);
        return (
          <g key={i} transform={`translate(${x},${y})`}>
            <rect
              x={-19}
              y={-17}
              width={38}
              height={34}
              rx={8}
              fill={fillOf(r)}
              stroke={strokeOf(r)}
              strokeDasharray={v === null ? '3 3' : undefined}
              className="transition-all duration-300"
            />
            <text textAnchor="middle" dy="5" className="fill-[var(--fg)] font-mono text-[13px]">
              {v ?? '·'}
            </text>
            <text
              textAnchor="middle"
              y={x < -1 ? 0 : 0}
              dx={Math.cos(ang) * 40}
              dy={Math.sin(ang) * 32 + 4}
              className="fill-[var(--fg-faint)] font-mono text-[9px]"
            >
              [{i}]
            </text>
            {labels.length > 0 && (
              <text
                textAnchor="middle"
                dx={-Math.cos(ang) * 44}
                dy={-Math.sin(ang) * 40 + 4}
                className="fill-[var(--r-current)] font-mono text-[10px] font-semibold"
              >
                {labels.join('/')}
              </text>
            )}
          </g>
        );
      })}
      <text textAnchor="middle" dy="4" className="fill-[var(--fg-muted)] font-mono text-[11px]">
        count = {count}
      </text>
    </svg>
  );
}

/* ---------------- linked list ---------------- */
export interface ListState {
  nodes: Record<string, { v: number | string; next: string | null; prev?: string | null }>;
  order: string[];
  float?: { id: string; at: number };
  doubly?: boolean;
  head?: string | null;
}
function ListView({ f }: { f: Frame<ListState> }) {
  const { nodes, order, float, doubly } = f.s;
  const W = 62,
    H = 34,
    G = 38,
    X0 = 14,
    Y0 = 46;
  const pos: Record<string, { x: number; y: number }> = {};
  order.forEach((id, i) => (pos[id] = { x: X0 + i * (W + G), y: Y0 }));
  if (float) pos[float.id] = { x: X0 + float.at * (W + G), y: Y0 + 74 };
  const ids = Object.keys(pos);
  const width = X0 * 2 + Math.max(order.length, (float?.at ?? 0) + 1) * (W + G) + 30;
  const height = float ? 168 : 104;
  const arrow = (
    a: { x: number; y: number },
    b: { x: number; y: number },
    dy: number,
    back: boolean,
    key: string,
    role?: Role,
  ) => {
    const x1 = back ? a.x : a.x + W;
    const y1 = a.y + dy;
    const x2 = back ? b.x + W : b.x;
    const y2 = b.y + dy;
    const adjacent = Math.abs(a.y - b.y) < 1 && Math.abs(Math.abs(x2 - x1) - G) < 2;
    const color = role ? roleVar[role] : 'var(--fg-faint)';
    const d = adjacent
      ? `M${x1},${y1} L${x2 + (back ? 6 : -6)},${y2}`
      : `M${x1},${y1} C${x1 + (back ? -40 : 40)},${y1 + (a.y === b.y ? -50 : 0)} ${x2 + (back ? 40 : -40)},${y2 + (a.y === b.y ? -50 : 0)} ${x2 + (back ? 6 : -6)},${y2}`;
    return (
      <path
        key={key}
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={role ? 2.2 : 1.6}
        markerEnd={`url(#ah-${role ?? 'n'})`}
        className="transition-all duration-300"
      />
    );
  };
  const markers: (Role | 'n')[] = ['n', 'current', 'swap', 'done', 'visited', 'compare'];
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      style={{ width, minWidth: width }}
      className="block h-auto max-w-none"
      role="img"
      aria-label={`Linked list: ${order.map((id) => nodes[id]?.v).join(' → ')}`}
    >
      <defs>
        {markers.map((m) => (
          <marker
            key={m}
            id={`ah-${m}`}
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M0,0 L10,5 L0,10 z" fill={m === 'n' ? 'var(--fg-faint)' : roleVar[m]} />
          </marker>
        ))}
      </defs>
      {ids.map((id) => {
        const n = nodes[id];
        if (!n) return null;
        const out = [];
        if (n.next && pos[n.next])
          out.push(
            arrow(pos[id], pos[n.next], doubly ? 11 : H / 2, false, `n${id}`, f.hl?.[`${id}>`]),
          );
        if (doubly && n.prev && pos[n.prev])
          out.push(arrow(pos[id], pos[n.prev], H - 9, true, `p${id}`, f.hl?.[`${id}<`]));
        if (!n.next && pos[id].y === Y0)
          out.push(
            <text
              key={`null${id}`}
              x={pos[id].x + W + 6}
              y={pos[id].y + H / 2 + 4}
              className="fill-[var(--fg-faint)] font-mono text-[10px]"
            >
              null
            </text>,
          );
        return out;
      })}
      {ids.map((id) => {
        const n = nodes[id];
        if (!n) return null;
        const { x, y } = pos[id];
        const r = f.hl?.[id];
        const labels = ptrsAt(f.ptr, id);
        return (
          <g
            key={id}
            className="transition-transform duration-300"
            style={{ transform: `translate(${x}px, ${y}px)` }}
          >
            <rect
              width={W}
              height={H}
              rx={7}
              fill={fillOf(r)}
              stroke={strokeOf(r)}
              strokeWidth={r ? 2 : 1.2}
            />
            <line x1={W - 18} x2={W - 18} y1={0} y2={H} stroke={strokeOf(r)} strokeWidth={1} />
            {doubly && <line x1={18} x2={18} y1={0} y2={H} stroke={strokeOf(r)} strokeWidth={1} />}
            <text
              x={doubly ? W / 2 : (W - 18) / 2}
              y={H / 2 + 5}
              textAnchor="middle"
              className="fill-[var(--fg)] font-mono text-[13px] font-medium"
            >
              {n.v}
            </text>
            {labels.length > 0 && (
              <text
                x={W / 2}
                y={y > Y0 ? H + 16 : -10}
                textAnchor="middle"
                className="fill-[var(--r-current)] font-mono text-[10.5px] font-semibold"
              >
                {y > Y0 ? `↑ ${labels.join(', ')}` : `${labels.join(', ')} ↓`}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ---------------- trees ---------------- */
export interface TreeState {
  nodes: Record<string, { v: number | string; c: (string | null)[] }>;
  root: string | null;
  binary?: boolean;
  edges?: { a: string; b: string; dashed?: boolean }[];
}
function layoutTree(s: TreeState) {
  const pos: Record<string, { x: number; d: number }> = {};
  let counter = 0;
  let maxD = 0;
  const walkBin = (id: string | null, d: number) => {
    if (!id || !s.nodes[id]) return;
    const [l, r] = s.nodes[id].c;
    walkBin(l ?? null, d + 1);
    pos[id] = { x: counter++, d };
    maxD = Math.max(maxD, d);
    walkBin(r ?? null, d + 1);
  };
  const walkGen = (id: string, d: number): number => {
    const kids = s.nodes[id].c.filter((k): k is string => !!k && !!s.nodes[k]);
    maxD = Math.max(maxD, d);
    if (!kids.length) {
      pos[id] = { x: counter++, d };
      return pos[id].x;
    }
    const xs = kids.map((k) => walkGen(k, d + 1));
    pos[id] = { x: (xs[0] + xs[xs.length - 1]) / 2, d };
    return pos[id].x;
  };
  if (s.root) {
    if (s.binary) walkBin(s.root, 0);
    else walkGen(s.root, 0);
  }
  return { pos, count: Math.max(counter, 1), maxD };
}
function TreeView({ f }: { f: Frame<TreeState> }) {
  const s = f.s;
  if (!s.root)
    return (
      <div className="grid h-40 place-items-center text-sm text-faint">
        (empty tree: root = nullptr)
      </div>
    );
  const { pos, count, maxD } = layoutTree(s);
  const maxLen = Math.max(...Object.values(s.nodes).map((n) => String(n.v).length));
  const wide = maxLen > 3;
  const BW = Math.max(34, maxLen * 7.4 + 16);
  const DX = wide ? BW + 10 : 46,
    DY = 62,
    R = 17,
    PAD = 28;
  const width = Math.max(220, count * DX + PAD * 2);
  const height = (maxD + 1) * DY + 30;
  const P = (id: string) => ({ x: PAD + pos[id].x * DX + DX / 2, y: 30 + pos[id].d * DY });
  const edges =
    s.edges ??
    Object.entries(s.nodes).flatMap(([id, n]) =>
      pos[id]
        ? n.c
            .filter((k): k is string => !!k && !!pos[k])
            .map((k) => ({ a: id, b: k, dashed: false }))
        : [],
    );
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      style={{ width, minWidth: width }}
      className="mx-auto block h-auto max-w-none"
      role="img"
      aria-label="Tree diagram"
    >
      {edges.map((e) => {
        if (!pos[e.a] || !pos[e.b]) return null;
        const a = P(e.a),
          b = P(e.b);
        const r = f.hl?.[`${e.a}-${e.b}`];
        return (
          <line
            key={`${e.a}-${e.b}`}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke={r ? roleVar[r] : 'var(--border-strong)'}
            strokeWidth={r ? 2.5 : 1.5}
            strokeDasharray={e.dashed ? '5 4' : undefined}
          />
        );
      })}
      {Object.keys(pos).map((id) => {
        const { x, y } = P(id);
        const r = f.hl?.[id];
        const labels = ptrsAt(f.ptr, id);
        return (
          <g
            key={id}
            style={{ transform: `translate(${x}px, ${y}px)` }}
            className="transition-transform duration-300"
          >
            {wide ? (
              <rect
                x={-Math.max(17, String(s.nodes[id].v).length * 3.7 + 8)}
                y={-15}
                width={Math.max(34, String(s.nodes[id].v).length * 7.4 + 16)}
                height={30}
                rx={8}
                fill={fillOf(r)}
                stroke={strokeOf(r)}
                strokeWidth={r ? 2.2 : 1.3}
                className="transition-colors duration-300"
              />
            ) : (
              <circle
                r={R}
                fill={fillOf(r)}
                stroke={strokeOf(r)}
                strokeWidth={r ? 2.2 : 1.3}
                className="transition-colors duration-300"
              />
            )}
            <text
              textAnchor="middle"
              dy="4.5"
              className="fill-[var(--fg)] font-mono text-[12.5px] font-medium"
            >
              {s.nodes[id].v}
            </text>
            {labels.length > 0 && (
              <text
                textAnchor="start"
                x={R + 3}
                y={-R + 4}
                className="fill-[var(--r-current)] font-mono text-[10px] font-semibold"
              >
                {labels.join(',')}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ---------------- heap (tree + array) ---------------- */
export interface HeapState {
  a: number[];
  n: number;
}
function HeapView({ f }: { f: Frame<HeapState> }) {
  const { a, n } = f.s;
  const levels = Math.max(1, Math.floor(Math.log2(Math.max(1, a.length))) + 1);
  const W = Math.max(300, 2 ** (levels - 1) * 44);
  const DY = 56;
  const P = (i: number) => {
    const lv = Math.floor(Math.log2(i + 1));
    const k = i - (2 ** lv - 1);
    return { x: ((k + 0.5) * W) / 2 ** lv, y: 24 + lv * DY };
  };
  return (
    <div className="grid gap-3">
      <svg
        viewBox={`0 0 ${W} ${levels * DY + 10}`}
        style={{ width: '100%', maxWidth: W }}
        className="mx-auto block"
        role="img"
        aria-label={`Heap as a tree, size ${n}`}
      >
        {a.map((_, i) => {
          if (i === 0 || i >= n) return null;
          const p = P(Math.floor((i - 1) / 2)),
            c = P(i);
          return (
            <line
              key={`e${i}`}
              x1={p.x}
              y1={p.y}
              x2={c.x}
              y2={c.y}
              stroke="var(--border-strong)"
              strokeWidth={1.4}
            />
          );
        })}
        {a.map((v, i) => {
          if (i >= n) return null;
          const { x, y } = P(i);
          const r = f.hl?.[i];
          return (
            <g key={i} style={{ transform: `translate(${x}px, ${y}px)` }}>
              <circle
                r={16}
                fill={fillOf(r)}
                stroke={strokeOf(r)}
                strokeWidth={r ? 2.2 : 1.3}
                className="transition-colors duration-300"
              />
              <text textAnchor="middle" dy="4.5" className="fill-[var(--fg)] font-mono text-[12px]">
                {v}
              </text>
              <text
                textAnchor="middle"
                y={-20}
                className="fill-[var(--fg-faint)] font-mono text-[8.5px]"
              >
                {i}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="overflow-x-auto">
        <Cells
          row={{
            name: 'array',
            a,
            hl: Object.fromEntries(
              a.map((_, i) => [i, i >= n ? 'done' : undefined]).filter(([, r]) => r),
            ) as Record<number, Role>,
          }}
          hl={f.hl}
          ptr={f.ptr}
        />
      </div>
    </div>
  );
}

/* ---------------- graph ---------------- */
export interface GraphState {
  nodes: { id: string; x: number; y: number }[];
  edges: [string, string][];
  directed?: boolean;
  rep?: boolean;
}
function GraphView({ f }: { f: Frame<GraphState> }) {
  const { nodes, edges, directed } = f.s;
  const [tab, setTab] = useState<'matrix' | 'list'>('matrix');
  const at = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const R = 16;
  const ids = nodes.map((n) => n.id);
  const has = (a: string, b: string) =>
    edges.some(([x, y]) => (x === a && y === b) || (!directed && x === b && y === a));
  return (
    <div className="grid items-start gap-4 md:grid-cols-[minmax(0,1fr)_auto]">
      <svg
        viewBox="0 0 360 230"
        className="mx-auto w-full max-w-md"
        role="img"
        aria-label={`${directed ? 'Directed' : 'Undirected'} graph with ${nodes.length} vertices`}
      >
        <defs>
          {(['n', 'visited', 'current', 'done', 'compare'] as const).map((m) => (
            <marker
              key={m}
              id={`g-${m}`}
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M0,0 L10,5 L0,10 z" fill={m === 'n' ? 'var(--fg-faint)' : roleVar[m]} />
            </marker>
          ))}
        </defs>
        {edges.map(([a, b]) => {
          const A = at[a],
            B = at[b];
          const r = f.hl?.[`${a}-${b}`] ?? (directed ? undefined : f.hl?.[`${b}-${a}`]);
          const dx = B.x - A.x,
            dy = B.y - A.y;
          const L = Math.hypot(dx, dy) || 1;
          const ux = dx / L,
            uy = dy / L;
          return (
            <line
              key={`${a}-${b}`}
              x1={A.x + ux * R}
              y1={A.y + uy * R}
              x2={B.x - ux * (R + (directed ? 3 : 0))}
              y2={B.y - uy * (R + (directed ? 3 : 0))}
              stroke={r ? roleVar[r] : 'var(--border-strong)'}
              strokeWidth={r ? 2.6 : 1.5}
              markerEnd={
                directed
                  ? `url(#g-${r && r !== 'dim' && r !== 'swap' && r !== 'found' && r !== 'bad' ? r : 'n'})`
                  : undefined
              }
              className="transition-colors duration-300"
            />
          );
        })}
        {nodes.map((n) => {
          const r = f.hl?.[n.id];
          const labels = ptrsAt(f.ptr, n.id);
          return (
            <g key={n.id} transform={`translate(${n.x},${n.y})`}>
              <circle
                r={R}
                fill={fillOf(r)}
                stroke={strokeOf(r)}
                strokeWidth={r ? 2.4 : 1.3}
                className="transition-colors duration-300"
              />
              <text
                textAnchor="middle"
                dy="4.5"
                className="fill-[var(--fg)] font-mono text-[13px] font-semibold"
              >
                {n.id}
              </text>
              {labels.length > 0 && (
                <text
                  x={R + 2}
                  y={-R + 2}
                  className="fill-[var(--r-current)] font-mono text-[10px] font-semibold"
                >
                  {labels.join(',')}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {f.s.rep !== false && (
        <div className="min-w-0 text-xs">
          <div
            className="mb-2 inline-flex rounded-lg border border-line p-0.5"
            role="tablist"
            aria-label="Representation"
          >
            {(['matrix', 'list'] as const).map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={`rounded-md px-2.5 py-1 font-medium ${tab === t ? 'bg-accent text-accent-fg' : 'text-muted'}`}
              >
                {t === 'matrix' ? 'Adjacency matrix' : 'Adjacency list'}
              </button>
            ))}
          </div>
          {tab === 'matrix' ? (
            <table className="font-mono" aria-label="Adjacency matrix">
              <thead>
                <tr>
                  <th className="p-1" />
                  {ids.map((c) => (
                    <th key={c} className="w-7 p-1 text-faint">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ids.map((r) => (
                  <tr key={r}>
                    <th className="p-1 pr-2 text-faint">{r}</th>
                    {ids.map((c) => {
                      const on = has(r, c);
                      return (
                        <td key={c} className="p-0.5 text-center">
                          <span
                            className={`grid size-6 place-items-center rounded ${on ? 'bg-accent-soft font-bold text-accent' : 'text-faint'}`}
                          >
                            {on ? 1 : 0}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <ul className="grid gap-1 font-mono" aria-label="Adjacency list">
              {ids.map((r) => (
                <li key={r} className="flex items-center gap-1">
                  <span
                    className="w-5 font-bold"
                    style={f.hl?.[r] ? { color: roleVar[f.hl[r]] } : undefined}
                  >
                    {r}
                  </span>
                  <span className="text-faint">→</span>
                  {ids
                    .filter((c) => has(r, c))
                    .map((c) => (
                      <span key={c} className="chip !px-1.5">
                        {c}
                      </span>
                    ))}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------------- call stack ---------------- */
export interface CallStackState {
  frames: { label: string; ret?: string }[];
  out?: string;
}
function CallStackView({ f }: { f: Frame<CallStackState> }) {
  const { frames, out } = f.s;
  return (
    <div className="mx-auto grid max-w-sm gap-1.5 py-1">
      <div className="text-center font-mono text-[0.68rem] tracking-wider text-faint uppercase">
        call stack (top)
      </div>
      {frames.length === 0 && (
        <div className="rounded-lg border border-dashed border-line p-3 text-center text-sm text-faint">
          empty
        </div>
      )}
      {[...frames].reverse().map((fr, ri) => {
        const i = frames.length - 1 - ri;
        const r = f.hl?.[i] ?? (i === frames.length - 1 ? 'current' : undefined);
        return (
          <div
            key={i}
            className="anim-fadeup flex items-center justify-between rounded-lg border px-3 py-2 font-mono text-sm transition-colors"
            style={{ borderColor: 'var(--border-strong)', ...tint(r) }}
          >
            <span>{fr.label}</span>
            {fr.ret !== undefined && (
              <span className="text-xs font-semibold text-[var(--r-done)]">returns {fr.ret}</span>
            )}
          </div>
        );
      })}
      <div className="h-1 rounded bg-line" />
      {out !== undefined && (
        <div className="mt-2 text-center font-mono text-sm">
          output: <b>{out}</b>
        </div>
      )}
    </div>
  );
}

/* ---------------- time-unit tally ---------------- */
export interface TallyState {
  rows: { label: string; expr: string; units: string | number }[];
  total: string;
}
function TallyView({ f }: { f: Frame<TallyState> }) {
  return (
    <table className="w-full min-w-[19rem] text-sm">
      <thead>
        <tr className="text-left text-xs text-muted">
          <th className="py-1.5 font-medium">operation</th>
          <th className="py-1.5 font-medium">rule</th>
          <th className="py-1.5 text-right font-medium">units</th>
        </tr>
      </thead>
      <tbody>
        {f.s.rows.map((r, i) => (
          <tr key={i} className="border-t border-line transition-colors" style={tint(f.hl?.[i])}>
            <td className="py-1.5 pr-2 font-mono text-xs">{r.label}</td>
            <td className="py-1.5 pr-2 text-xs text-muted">{r.expr}</td>
            <td className="py-1.5 text-right font-mono tabular-nums">{r.units}</td>
          </tr>
        ))}
        <tr className="border-t-2 border-line-strong font-semibold">
          <td className="py-2" colSpan={2}>
            T(n)
          </td>
          <td className="py-2 text-right font-mono text-[var(--r-done)]">{f.s.total}</td>
        </tr>
      </tbody>
    </table>
  );
}

/* ---------------- proof steps ---------------- */
export interface ProofState {
  lines: string[];
}
function ProofView({ f }: { f: Frame<ProofState> }) {
  return (
    <ol className="grid gap-1.5 py-1">
      {f.s.lines.map((l, i) => {
        const last = i === f.s.lines.length - 1;
        return (
          <li
            key={i}
            className="anim-fadeup flex gap-3 rounded-lg border px-3 py-2 font-mono text-[0.85rem]"
            style={{
              borderColor: last ? 'var(--r-current)' : 'var(--border)',
              background: last
                ? 'color-mix(in oklab, var(--r-current) 12%, transparent)'
                : undefined,
            }}
          >
            <span className="text-faint">{i + 1}.</span>
            <span className="whitespace-pre-wrap">{l}</span>
          </li>
        );
      })}
    </ol>
  );
}

/* ---------------- merge sort split/merge tree ---------------- */
export interface MergeState {
  segs: { lo: number; vals: number[]; depth: number; role?: Role }[];
  n: number;
}
function MergeView({ f }: { f: Frame<MergeState> }) {
  const CW = 26,
    GAP = 10,
    DY = 50;
  const byDepth: Record<number, MergeState['segs']> = {};
  f.s.segs.forEach((s) => (byDepth[s.depth] ??= []).push(s));
  const maxD = Math.max(0, ...f.s.segs.map((s) => s.depth));
  const width = f.s.n * CW + f.s.n * GAP + 20;
  return (
    <div
      className="relative mx-auto"
      style={{ width, height: (maxD + 1) * DY }}
      role="img"
      aria-label="Merge sort split and merge tree"
    >
      {Object.entries(byDepth).map(([d, segs]) =>
        [...segs]
          .sort((a, b) => a.lo - b.lo)
          .map((s) => (
            <div
              key={`${d}-${s.lo}`}
              className="anim-fadeup absolute flex rounded-md border transition-colors"
              style={{
                left: s.lo * (CW + GAP) + 10,
                top: +d * DY,
                borderColor: s.role ? roleVar[s.role] : 'var(--border-strong)',
                background: s.role
                  ? `color-mix(in oklab, ${roleVar[s.role]} 18%, var(--bg-elev))`
                  : 'var(--bg-elev)',
              }}
            >
              {s.vals.map((v, i) => (
                <span
                  key={i}
                  className="grid h-8 place-items-center border-line font-mono text-xs not-last:border-r"
                  style={{ width: CW + (i < s.vals.length - 1 ? GAP : 0) }}
                >
                  {v}
                </span>
              ))}
            </div>
          )),
      )}
    </div>
  );
}

/* ---------------- hash table ---------------- */
export interface HashState {
  table: (number | null | number[])[];
  mode: 'chain' | 'probe';
}
function HashView({ f }: { f: Frame<HashState> }) {
  return (
    <div className="grid gap-1 py-1">
      {f.s.table.map((slot, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-8 text-right font-mono text-xs text-faint">[{i}]</span>
          {f.s.mode === 'chain' ? (
            <div
              className="flex min-h-9 flex-1 items-center gap-1 rounded-lg border px-1.5 transition-colors"
              style={{ borderColor: 'var(--border)', ...tint(f.hl?.[i]) }}
            >
              {(slot as number[]).length === 0 && (
                <span className="px-1 text-xs text-faint">null</span>
              )}
              {(slot as number[]).map((k, j) => (
                <span key={j} className="flex items-center gap-1">
                  {j > 0 && <span className="text-faint">→</span>}
                  <span
                    className="chip anim-pop !text-sm !text-fg"
                    style={tint(f.hl?.[`${i}:${j}`])}
                  >
                    {k}
                  </span>
                </span>
              ))}
            </div>
          ) : (
            <div
              className="grid h-9 w-16 place-items-center rounded-lg border font-mono text-sm transition-colors"
              style={{ borderColor: 'var(--border-strong)', ...tint(f.hl?.[i]) }}
            >
              {slot === null ? <span className="text-faint">·</span> : String(slot)}
            </div>
          )}
          {ptrsAt(f.ptr, i).length > 0 && (
            <span className="font-mono text-xs font-semibold text-[var(--r-current)]">
              ← {ptrsAt(f.ptr, i).join(',')}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

/* ---------------- stack vs heap memory ---------------- */
export interface MemoryState {
  stack: { name: string; val: string }[];
  heap: { addr: string; val: string; state?: 'live' | 'freed' | 'leaked' }[];
}
function MemoryView({ f }: { f: Frame<MemoryState> }) {
  const box = 'rounded-lg border px-3 py-2 font-mono text-sm transition-colors';
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <div className="mb-1.5 text-center font-mono text-xs tracking-wider text-muted uppercase">
          Stack
        </div>
        <div className="grid gap-1.5">
          {f.s.stack.length === 0 && <div className="text-center text-xs text-faint">empty</div>}
          {f.s.stack.map((v) => (
            <div
              key={v.name}
              className={`${box} anim-fadeup flex justify-between gap-2`}
              style={{ borderColor: 'var(--border-strong)', ...tint(f.hl?.[v.name]) }}
            >
              <span className="text-muted">{v.name}</span>
              <b className="font-medium">{v.val}</b>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="mb-1.5 text-center font-mono text-xs tracking-wider text-muted uppercase">
          Heap
        </div>
        <div className="grid gap-1.5">
          {f.s.heap.length === 0 && <div className="text-center text-xs text-faint">empty</div>}
          {f.s.heap.map((h) => (
            <div
              key={h.addr}
              className={`${box} anim-fadeup flex justify-between gap-2 ${h.state === 'freed' ? 'line-through opacity-50' : ''}`}
              style={{
                borderColor: h.state === 'leaked' ? 'var(--r-swap)' : 'var(--border-strong)',
                borderStyle: h.state === 'leaked' ? 'dashed' : undefined,
                ...tint(f.hl?.[h.addr]),
              }}
            >
              <span className="text-muted">{h.addr}</span>
              <b className="font-medium">{h.val}</b>
              {h.state === 'leaked' && <span className="text-xs text-[var(--r-swap)]">leak!</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const map: Record<ViewKind, (p: { f: any }) => React.ReactElement> = {
  bars: Bars,
  array: ArrayView,
  stack: StackView,
  ring: RingView,
  list: ListView,
  tree: TreeView,
  heap: HeapView,
  graph: GraphView,
  callstack: CallStackView,
  tally: TallyView,
  proof: ProofView,
  merge: MergeView,
  hash: HashView,
  memory: MemoryView,
};

export function View({ kind, frame }: { kind: ViewKind; frame: Frame }) {
  const C = map[kind];
  return <C f={frame} />;
}
