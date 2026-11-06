import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Clock, Play, RotateCcw, X } from 'lucide-react';
import { load, update } from '@/lib/progress';
import { confetti } from '@/lib/celebrate';

interface Q {
  ch: number;
  topic: string;
  slug: string;
  q: string;
  code?: string;
  options: string[];
  answer: number;
  explain: string;
}
interface Ch {
  id: number;
  num: string;
  short: string;
}

const SECONDS_PER_Q = 60;

function shuffle<T>(a: T[]): T[] {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

export default function ExamMode({ chapters }: { chapters: Ch[] }) {
  const [pool, setPool] = useState<Q[] | null>(null);
  const [err, setErr] = useState(false);
  const [sel, setSel] = useState<number[]>(chapters.map((c) => c.id));
  const [count, setCount] = useState(15);
  const [qs, setQs] = useState<Q[] | null>(null);
  const [picks, setPicks] = useState<(number | null)[]>([]);
  const [left, setLeft] = useState(0);
  const [finished, setFinished] = useState(false);
  const [history, setHistory] = useState<NonNullable<ReturnType<typeof load>['exams']>>([]);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    setHistory(load().exams ?? []);
    fetch('/exam-pool.json')
      .then((r) => r.json())
      .then(setPool)
      .catch(() => setErr(true));
  }, []);

  const available = useMemo(() => (pool ?? []).filter((q) => sel.includes(q.ch)).length, [pool, sel]);
  const score = qs ? picks.filter((p, i) => p === qs[i].answer).length : 0;

  const finish = () => {
    window.clearInterval(timer.current);
    setFinished(true);
  };

  useEffect(() => {
    if (!finished || !qs) return;
    const entry = { at: new Date().toISOString(), score, total: qs.length, chapters: sel.map(String) };
    update((d) => {
      d.exams = [...(d.exams ?? []), entry].slice(-20);
    });
    setHistory((h) => [...h, entry].slice(-20));
    if (score / qs.length >= 0.8) confetti();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  const start = () => {
    if (!pool) return;
    const chosen = shuffle(pool.filter((q) => sel.includes(q.ch))).slice(0, count);
    setQs(chosen);
    setPicks(chosen.map(() => null));
    setFinished(false);
    setLeft(chosen.length * SECONDS_PER_Q);
    window.clearInterval(timer.current);
    timer.current = window.setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          window.clearInterval(timer.current);
          setFinished(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    window.scrollTo({ top: 0 });
  };
  useEffect(() => () => window.clearInterval(timer.current), []);

  if (err) return <p className="card p-5 text-[var(--r-swap)]">Could not load the question bank. Check your connection and reload.</p>;

  if (!qs)
    return (
      <div className="grid gap-5">
        <fieldset className="card p-5">
          <legend className="sr-only">Chapters</legend>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-semibold">Chapters</span>
            <span className="flex gap-1.5">
              <button type="button" className="btn btn-sm" onClick={() => setSel(chapters.map((c) => c.id))}>All</button>
              <button type="button" className="btn btn-sm" onClick={() => setSel([])}>None</button>
            </span>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {chapters.map((c) => (
              <label key={c.id} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-line px-3 py-2 hover:bg-soft">
                <input type="checkbox" className="size-5 accent-[var(--accent)]" checked={sel.includes(c.id)} onChange={() => setSel((s) => (s.includes(c.id) ? s.filter((x) => x !== c.id) : [...s, c.id]))} />
                <span className="font-mono text-sm text-accent">{c.num}</span> {c.short}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="card flex flex-wrap items-center gap-4 p-5">
          <label className="flex items-center gap-3">
            <span className="font-semibold">Questions</span>
            <select className="btn btn-sm" value={count} onChange={(e) => setCount(Number(e.target.value))}>
              {[10, 15, 25, 40].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>
          <span className="flex items-center gap-1.5 text-sm text-muted"><Clock size={14} /> {Math.min(count, available)} min ({SECONDS_PER_Q}s per question)</span>
          <button className="btn btn-primary ml-auto" disabled={!pool || available === 0} onClick={start}>
            <Play size={16} /> {pool ? `Start (${Math.min(count, available)} of ${available})` : 'Loading…'}
          </button>
        </div>
        {history.length > 0 && (
          <div className="card p-5">
            <div className="font-semibold">Recent attempts</div>
            <ul className="mt-2 grid gap-1 text-sm">
              {[...history].reverse().slice(0, 5).map((h, i) => (
                <li key={i} className="flex justify-between gap-3 border-t border-line pt-1.5 first:border-0">
                  <span className="text-muted">{new Date(h.at).toLocaleString()}</span>
                  <span className="font-mono">{h.score}/{h.total} ({Math.round((h.score / h.total) * 100)}%)</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );

  const answered = picks.filter((p) => p !== null).length;
  const mm = String(Math.floor(left / 60)).padStart(2, '0');
  const ss = String(left % 60).padStart(2, '0');
  const weak = finished ? [...new Map(qs.filter((q, i) => picks[i] !== q.answer).map((q) => [q.slug, q.topic])).entries()] : [];

  return (
    <div className="grid gap-4">
      <div className="card sticky top-16 z-10 flex flex-wrap items-center gap-3 p-3" role="status">
        <span className={`flex items-center gap-1.5 font-mono text-lg font-semibold ${left < 60 && !finished ? 'text-[var(--r-swap)]' : ''}`} aria-label="Time left">
          <Clock size={16} /> {mm}:{ss}
        </span>
        <span className="text-sm text-muted">{answered}/{qs.length} answered</span>
        <div className="h-1.5 min-w-24 flex-1 overflow-hidden rounded-full bg-soft"><div className="h-full bg-accent transition-all" style={{ width: `${(answered / qs.length) * 100}%` }} /></div>
        {!finished ? (
          <button className="btn btn-sm btn-primary" onClick={finish}>Submit</button>
        ) : (
          <button className="btn btn-sm" onClick={() => setQs(null)}><RotateCcw size={14} /> New exam</button>
        )}
      </div>

      {finished && (
        <div className="card anim-pop p-5">
          <div className="text-2xl font-bold">
            {score}/{qs.length} · {Math.round((score / qs.length) * 100)}%
          </div>
          <p className="mt-1 text-muted">{score / qs.length >= 0.8 ? 'Exam-ready on these chapters. 🎯' : score / qs.length >= 0.5 ? 'Solid base. Review the topics below and try again.' : 'Go back to the topics below. Re-read the mental model, then retry.'}</p>
          {weak.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="text-sm text-muted">Review:</span>
              {weak.map(([s, t]) => <a key={s} href={`/learn/${s}`} className="chip hover:text-fg">{t}</a>)}
            </div>
          )}
        </div>
      )}

      <ol className="grid gap-4">
        {qs.map((it, qi) => {
          const pick = picks[qi];
          return (
            <li key={qi} className="card p-4 sm:p-5">
              <fieldset>
                <legend className="md flex gap-2 text-[0.95rem] font-medium">
                  <span className="font-mono text-faint">{qi + 1}.</span>
                  <span dangerouslySetInnerHTML={{ __html: it.q }} />
                </legend>
                <div className="mt-1 text-xs text-faint">{it.topic}</div>
                {it.code && <pre className="mt-3 overflow-x-auto rounded-lg border border-line bg-codebg p-3 font-mono text-[0.8rem]">{it.code}</pre>}
                <div className="mt-3 grid gap-2">
                  {it.options.map((o, oi) => {
                    const right = oi === it.answer;
                    const chosen = pick === oi;
                    const state = finished ? (right ? 'border-[var(--r-done)] bg-[color-mix(in_oklab,var(--r-done)_12%,transparent)]' : chosen ? 'border-[var(--r-swap)] bg-[color-mix(in_oklab,var(--r-swap)_12%,transparent)]' : 'opacity-60') : chosen ? 'border-accent bg-accent-soft' : '';
                    return (
                      <button
                        key={oi}
                        type="button"
                        disabled={finished}
                        aria-pressed={chosen}
                        onClick={() => setPicks((p) => p.map((x, k) => (k === qi ? oi : x)))}
                        className={`md flex min-h-11 items-center gap-3 rounded-lg border border-line px-3 py-2 text-left text-sm transition-colors enabled:hover:border-line-strong enabled:hover:bg-soft ${state}`}
                      >
                        <span className="grid size-6 shrink-0 place-items-center rounded-md border border-line font-mono text-xs">
                          {finished && right ? <Check size={14} className="text-[var(--r-done)]" /> : finished && chosen ? <X size={14} className="text-[var(--r-swap)]" /> : String.fromCharCode(65 + oi)}
                        </span>
                        <span dangerouslySetInnerHTML={{ __html: o }} />
                      </button>
                    );
                  })}
                </div>
                {finished && <div className="md mt-3 rounded-lg bg-soft px-3 py-2 text-sm" dangerouslySetInnerHTML={{ __html: it.explain }} />}
              </fieldset>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
