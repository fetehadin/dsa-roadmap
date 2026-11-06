import { useEffect, useState } from 'react';
import { Check, RotateCcw, X } from 'lucide-react';
import { patchTopic, topic } from '@/lib/progress';

export interface QuizQ {
  q: string;
  code?: string;
  options: string[];
  answer: number;
  explain: string;
}

const PRAISE = ['Perfect score! 🎯', 'Nice work!', 'Good effort. Review the misses and try again.'];

export default function Quiz({ slug, items }: { slug: string; items: QuizQ[] }) {
  const [picks, setPicks] = useState<(number | null)[]>(() => items.map(() => null));
  const [saved, setSaved] = useState<{ score: number; total: number } | undefined>();
  useEffect(() => setSaved(topic(slug).quiz), [slug]);

  const answered = picks.filter((p) => p !== null).length;
  const score = picks.filter((p, i) => p === items[i].answer).length;
  const finished = answered === items.length;

  useEffect(() => {
    if (finished) {
      const best = Math.max(score, topic(slug).quiz?.score ?? 0);
      patchTopic(slug, { quiz: { score: best, total: items.length } });
      setSaved({ score: best, total: items.length });
    }
  }, [finished, score, slug, items.length]);

  return (
    <div className="grid gap-4">
      {saved && !finished && (
        <p className="text-sm text-muted">
          Best so far: <b className="text-fg">{saved.score}/{saved.total}</b>. Try again any time.
        </p>
      )}
      <ol className="grid gap-4">
        {items.map((it, qi) => {
          const pick = picks[qi];
          const done = pick !== null;
          return (
            <li key={qi} className="card p-4 sm:p-5">
              <fieldset>
                <legend className="md flex gap-2 text-[0.95rem] font-medium">
                  <span className="font-mono text-faint">{qi + 1}.</span>
                  <span dangerouslySetInnerHTML={{ __html: it.q }} />
                </legend>
                {it.code && <pre className="mt-3 overflow-x-auto rounded-lg border border-line bg-codebg p-3 font-mono text-[0.8rem]">{it.code}</pre>}
                <div className="mt-3 grid gap-2">
                  {it.options.map((o, oi) => {
                    const right = oi === it.answer;
                    const chosen = pick === oi;
                    const state = !done ? '' : right ? 'border-[var(--r-done)] bg-[color-mix(in_oklab,var(--r-done)_12%,transparent)]' : chosen ? 'border-[var(--r-swap)] bg-[color-mix(in_oklab,var(--r-swap)_12%,transparent)]' : 'opacity-60';
                    return (
                      <button
                        key={oi}
                        type="button"
                        disabled={done}
                        aria-pressed={chosen}
                        onClick={() => setPicks((p) => p.map((x, k) => (k === qi ? oi : x)))}
                        className={`md flex min-h-11 items-center gap-3 rounded-lg border border-line px-3 py-2 text-left text-sm transition-colors enabled:hover:border-line-strong enabled:hover:bg-soft ${state}`}
                      >
                        <span className="grid size-6 shrink-0 place-items-center rounded-md border border-line font-mono text-xs">
                          {done && right ? <Check size={14} className="text-[var(--r-done)]" /> : done && chosen ? <X size={14} className="text-[var(--r-swap)]" /> : String.fromCharCode(65 + oi)}
                        </span>
                        <span dangerouslySetInnerHTML={{ __html: o }} />
                      </button>
                    );
                  })}
                </div>
                {done && (
                  <div className="md anim-fadeup mt-3 rounded-lg bg-soft px-3 py-2 text-sm" role="status">
                    <b className={pick === it.answer ? 'text-[var(--r-done)]' : 'text-[var(--r-swap)]'}>{pick === it.answer ? 'Correct. ' : 'Not quite. '}</b>
                    <span dangerouslySetInnerHTML={{ __html: it.explain }} />
                  </div>
                )}
              </fieldset>
            </li>
          );
        })}
      </ol>
      {finished && (
        <div className="card anim-pop flex flex-wrap items-center justify-between gap-3 p-4" role="status">
          <div>
            <div className="text-lg font-semibold">
              {score}/{items.length}: {score === items.length ? PRAISE[0] : score >= items.length * 0.6 ? PRAISE[1] : PRAISE[2]}
            </div>
            <div className="text-sm text-muted">Your best score is saved.</div>
          </div>
          <button className="btn" onClick={() => setPicks(items.map(() => null))}>
            <RotateCcw size={15} /> Retry
          </button>
        </div>
      )}
    </div>
  );
}
