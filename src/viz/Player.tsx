import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Pause, Play, RotateCcw, SkipBack, SkipForward, Shuffle } from 'lucide-react';
import type { Algo, Frame } from './types';
import { roleLabel, roleVar } from './types';
import { loadAlgo } from './registry';
import { View } from './views';

const KW =
  /\b(int|void|bool|char|double|float|auto|return|if|else|for|while|do|new|delete|nullptr|struct|class|const|true|false|break|continue|using|namespace|std|vector|string|swap|public|private|template|typename|long|size_t|this|switch|case|default)\b/g;

function hl(line: string): ReactNode[] {
  const out: ReactNode[] = [];
  const cm = line.indexOf('//');
  const code = cm >= 0 ? line.slice(0, cm) : line;
  const re = new RegExp(`${KW.source}|(\\b\\d+\\b)`, 'g');
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(code))) {
    if (m.index > last) out.push(code.slice(last, m.index));
    out.push(
      <span key={k++} className={m[2] ? 'text-[var(--r-compare)]' : 'text-[var(--r-current)]'}>
        {m[0]}
      </span>,
    );
    last = m.index + m[0].length;
  }
  out.push(code.slice(last));
  if (cm >= 0)
    out.push(
      <span key="c" className="text-faint italic">
        {line.slice(cm)}
      </span>,
    );
  return out;
}

/* ---- global keyboard routing: the most recently used (or first visible) player gets the keys ---- */
type Ctl = { el: HTMLElement; toggle: () => void; step: (d: number) => void; reset: () => void };
const players = new Set<Ctl>();
let active: Ctl | null = null;
let bound = false;
function visible(el: HTMLElement) {
  const r = el.getBoundingClientRect();
  return r.bottom > 80 && r.top < window.innerHeight - 80;
}
function bindKeys() {
  if (bound) return;
  bound = true;
  window.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target as HTMLElement;
    if (t.closest('input,textarea,select,[contenteditable="true"],[role="dialog"]')) return;
    if (t.closest('button,a,summary') && e.key === ' ') return;
    const target =
      active && document.body.contains(active.el) && visible(active.el)
        ? active
        : [...players].find((p) => visible(p.el));
    if (!target) return;
    if (e.key === ' ') {
      e.preventDefault();
      target.toggle();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      target.step(1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      target.step(-1);
    } else if (e.key === 'r' || e.key === 'R') target.reset();
  });
}

const SPEEDS = [0.5, 1, 2, 4];

export default function Player({ id, title }: { id: string; title?: string }) {
  const [algo, setAlgo] = useState<Algo | null>(null);
  const [input, setInput] = useState('');
  const [base, setBase] = useState<unknown>(null);
  const [frames, setFrames] = useState<Frame[]>([]);
  const [code, setCode] = useState<string[]>([]);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [val, setVal] = useState('');
  const [pos, setPos] = useState('1');
  const [err, setErr] = useState('');
  const root = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLOListElement>(null);
  const inputId = `in-${id}`;

  const start = useCallback((a: Algo, inp: string) => {
    const s = a.init(inp);
    setBase(s);
    setErr('');
    if (a.auto) {
      const fr = a.run(s, a.auto);
      setFrames(fr);
      setCode(a.actions.find((x) => x.id === a.auto)?.code ?? a.code);
    } else {
      setFrames([{ s, note: 'Pick an operation below to see it step by step.' }]);
      setCode(a.code);
    }
    setIdx(0);
    setPlaying(false);
  }, []);

  useEffect(() => {
    let live = true;
    loadAlgo(id).then((a) => {
      if (!live || !a) return;
      setAlgo(a);
      const inp = a.input?.def ?? '';
      setInput(inp);
      const def = a.actions.find((x) => x.value)?.def;
      if (def !== undefined) setVal(String(def));
      start(a, inp);
    });
    return () => {
      live = false;
    };
  }, [id, start]);

  const last = frames.length - 1;
  const frame = frames[Math.min(idx, last)];

  useEffect(() => {
    if (!playing) return;
    if (idx >= last) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setIdx((i) => Math.min(i + 1, last)), 900 / speed);
    return () => clearTimeout(t);
  }, [playing, idx, last, speed]);

  useEffect(() => {
    const el = codeRef.current?.querySelector<HTMLElement>('[data-active="true"]');
    const box = codeRef.current?.parentElement;
    if (el && box) {
      const top = el.offsetTop - box.clientHeight / 2;
      box.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    }
  }, [frame?.line]);

  const toggle = useCallback(() => {
    if (idx >= last) setIdx(0);
    setPlaying((p) => !p);
  }, [idx, last]);
  const step = useCallback(
    (d: number) => {
      setPlaying(false);
      setIdx((i) => Math.max(0, Math.min(last, i + d)));
    },
    [last],
  );
  const reset = useCallback(() => {
    if (algo) start(algo, input);
  }, [algo, input, start]);

  const ctl = useRef<Ctl | null>(null);
  useEffect(() => {
    if (!root.current) return;
    bindKeys();
    const c: Ctl = { el: root.current, toggle, step, reset };
    ctl.current = c;
    players.add(c);
    return () => {
      players.delete(c);
      if (active === c) active = null;
    };
  }, [toggle, step, reset]);

  const runAction = (aid: string) => {
    if (!algo) return;
    const a = algo.actions.find((x) => x.id === aid)!;
    let v: number | undefined;
    if (a.value) {
      v = parseInt(val, 10);
      if (!Number.isFinite(v)) {
        setErr('Type a number first.');
        return;
      }
      if (Math.abs(v) > 999) {
        setErr('Keep numbers between -999 and 999.');
        return;
      }
    }
    let p: number | undefined;
    if (a.pos) {
      p = parseInt(pos, 10);
      if (!Number.isFinite(p) || p < 0) {
        setErr('Position must be 0 or more.');
        return;
      }
    }
    setErr('');
    const from = frames.length ? frames[Math.min(idx, last)].s : base;
    const fr = algo.run(from, aid, v, p);
    setFrames(fr);
    setCode(a.code ?? algo.code);
    setIdx(0);
    setPlaying(fr.length > 1);
  };

  const legend = useMemo(() => algo?.legend ?? [], [algo]);

  if (!algo || !frame)
    return (
      <div className="card grid h-72 place-items-center text-sm text-muted" aria-busy="true">
        Loading visualizer…
      </div>
    );

  const playground = !algo.auto || algo.actions.length > 1;

  return (
    <div
      ref={root}
      className="card overflow-hidden"
      role="region"
      aria-label={`${title ?? 'Algorithm'} visualizer`}
      onPointerDown={() => (active = ctl.current)}
      onFocus={() => (active = ctl.current)}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2.5">
        <div className="text-sm font-semibold">{title ?? 'Visualizer'}</div>
        <ul
          className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted"
          aria-label="Colour legend"
        >
          {legend.map((r) => (
            <li key={r} className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm" style={{ background: roleVar[r] }} />
              {roleLabel[r]}
            </li>
          ))}
        </ul>
      </div>

      {algo.input && (
        <form
          className="flex flex-wrap items-end gap-2 border-b border-line px-4 py-2.5"
          onSubmit={(e) => {
            e.preventDefault();
            start(algo, input);
          }}
        >
          <label htmlFor={inputId} className="w-full text-xs text-muted sm:w-auto sm:self-center">
            {algo.input.label}
          </label>
          <input
            id={inputId}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-w-0 flex-1 rounded-lg border border-line bg-soft px-2.5 py-1.5 font-mono text-sm"
            inputMode={algo.input.hint === 'text' ? 'text' : 'numeric'}
            autoComplete="off"
          />
          <button className="btn btn-sm" type="submit">
            Load
          </button>
          {algo.input.random && (
            <button
              type="button"
              className="btn btn-sm"
              aria-label="Random input"
              onClick={() => {
                const r = algo.input!.random!();
                setInput(r);
                start(algo, r);
              }}
            >
              <Shuffle size={15} />
            </button>
          )}
          {algo.input.presets?.map((p) => (
            <button
              key={p.label}
              type="button"
              className="btn btn-sm"
              onClick={() => {
                setInput(p.value);
                start(algo, p.value);
              }}
            >
              {p.label}
            </button>
          ))}
        </form>
      )}

      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
        <div className="min-w-0 p-4">
          <div className="min-h-44 overflow-x-auto">
            <View kind={algo.view} frame={frame} />
          </div>
          {frame.aux && frame.aux.length > 0 && (
            <div className="mt-3 grid gap-2">
              {frame.aux.map((a) => (
                <div key={a.label} className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="w-20 shrink-0 font-mono text-muted">{a.label}</span>
                  {a.items.length === 0 && <span className="text-faint">empty</span>}
                  {a.items.map((x, i) => (
                    <span key={i} className="chip anim-pop !text-fg">
                      {x}
                    </span>
                  ))}
                  {a.kind && a.items.length > 0 && (
                    <span className="text-faint">
                      {a.kind === 'stack' ? '← top' : a.kind === 'queue' ? '← back' : ''}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
          <p
            className="mt-3 min-h-12 rounded-lg border border-line bg-soft px-3 py-2 text-sm"
            aria-live="polite"
          >
            {frame.note}
          </p>
          {frame.vars && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {Object.entries(frame.vars).map(([k, v]) => (
                <span key={k} className="chip">
                  <span className="text-faint">{k}</span>
                  <b className="font-semibold text-fg">{v}</b>
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="max-h-80 min-w-0 overflow-auto border-t border-line bg-codebg lg:max-h-[26rem] lg:border-t-0 lg:border-l">
          <ol ref={codeRef} className="py-2 font-mono text-[0.78rem] leading-6" aria-label="Code">
            {code.map((ln, i) => {
              const on = frame.line === i + 1;
              return (
                <li
                  key={i}
                  data-active={on}
                  aria-current={on ? 'step' : undefined}
                  className={`flex border-l-2 pr-3 whitespace-pre transition-colors ${on ? 'border-[var(--r-current)] bg-[color-mix(in_oklab,var(--r-current)_16%,transparent)]' : 'border-transparent'}`}
                >
                  <span className="w-8 shrink-0 pr-3 text-right text-faint opacity-60 select-none">
                    {i + 1}
                  </span>
                  <span>{hl(ln)}</span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      {playground && (
        <div className="flex flex-wrap items-center gap-2 border-t border-line px-4 py-2.5">
          {algo.actions.some((a) => a.value) && (
            <>
              <label htmlFor={`v-${id}`} className="sr-only">
                Value
              </label>
              <input
                id={`v-${id}`}
                value={val}
                onChange={(e) => setVal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const first = algo.actions.find((a) => a.value);
                    if (first) runAction(first.id);
                  }
                }}
                className="w-20 rounded-lg border border-line bg-soft px-2.5 py-1.5 font-mono text-sm"
                inputMode="numeric"
                placeholder="value"
              />
            </>
          )}
          {algo.actions.some((a) => a.pos) && (
            <>
              <label htmlFor={`p-${id}`} className="font-mono text-xs text-muted">
                pos
              </label>
              <input
                id={`p-${id}`}
                value={pos}
                onChange={(e) => setPos(e.target.value)}
                className="w-14 rounded-lg border border-line bg-soft px-2.5 py-1.5 font-mono text-sm"
                inputMode="numeric"
              />
            </>
          )}
          {algo.actions.map((a) => (
            <button key={a.id} className="btn btn-sm" onClick={() => runAction(a.id)}>
              {a.label}
            </button>
          ))}
          {err && (
            <span className="text-xs text-[var(--r-swap)]" role="alert">
              {err}
            </span>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 border-t border-line bg-soft/50 px-3 py-2">
        <div className="flex items-center gap-1" role="group" aria-label="Playback">
          <button className="btn btn-sm" onClick={reset} aria-label="Reset (r)" title="Reset (r)">
            <RotateCcw size={15} />
          </button>
          <button
            className="btn btn-sm"
            onClick={() => step(-1)}
            disabled={idx === 0}
            aria-label="Step back (←)"
            title="Step back (←)"
          >
            <SkipBack size={15} />
          </button>
          <button
            className="btn btn-sm btn-primary w-12"
            onClick={toggle}
            aria-label={playing ? 'Pause (space)' : 'Play (space)'}
            title="Play / pause (space)"
            disabled={last === 0}
          >
            {playing ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button
            className="btn btn-sm"
            onClick={() => step(1)}
            disabled={idx >= last}
            aria-label="Step forward (→)"
            title="Step forward (→)"
          >
            <SkipForward size={15} />
          </button>
        </div>
        <input
          type="range"
          min={0}
          max={Math.max(0, last)}
          value={Math.min(idx, last)}
          onChange={(e) => {
            setPlaying(false);
            setIdx(+e.target.value);
          }}
          className="min-w-24 flex-1 accent-[var(--accent)]"
          aria-label="Step"
          aria-valuetext={`Step ${idx + 1} of ${last + 1}`}
        />
        <span className="font-mono text-xs text-muted tabular-nums" aria-hidden="true">
          {Math.min(idx, last) + 1}/{last + 1}
        </span>
        <label className="sr-only" htmlFor={`sp-${id}`}>
          Speed
        </label>
        <select
          id={`sp-${id}`}
          value={speed}
          onChange={(e) => setSpeed(+e.target.value)}
          className="rounded-lg border border-line bg-elev px-1.5 py-1 font-mono text-xs"
        >
          {SPEEDS.map((s) => (
            <option key={s} value={s}>
              {s}×
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
