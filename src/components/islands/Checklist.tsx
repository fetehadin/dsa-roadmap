import { useEffect, useState } from 'react';
import { load, patchTopic, subscribe, topic } from '@/lib/progress';
import { toast } from '@/lib/celebrate';

export default function Checklist({
  slug,
  items,
  noun = 'Topic',
}: {
  slug: string;
  items: string[];
  noun?: string;
}) {
  const [checks, setChecks] = useState<number[]>([]);
  const [done, setDone] = useState(false);
  useEffect(() => {
    const f = () => {
      const t = topic(slug);
      setChecks(t.checks ?? []);
      setDone(!!t.done);
    };
    f();
    return subscribe(f);
  }, [slug]);

  const toggle = (i: number) => {
    const next = checks.includes(i) ? checks.filter((x) => x !== i) : [...checks, i];
    const all = next.length === items.length;
    const wasDone = !!load().topics[slug]?.done;
    patchTopic(slug, {
      checks: next,
      ...(all && !wasDone
        ? { done: true, status: 'done' as const, doneAt: new Date().toISOString() }
        : {}),
    });
    if (all && !wasDone)
      toast(
        `${noun} mastered!`,
        `Every box is ticked, so this ${noun.toLowerCase()} is marked complete.`,
        '✅',
      );
  };

  return (
    <div className="card p-2">
      <ul className="grid">
        {items.map((it, i) => {
          const on = checks.includes(i);
          return (
            <li key={i}>
              <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg px-3 py-2.5 hover:bg-soft">
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => toggle(i)}
                  className="mt-0.5 size-5 shrink-0 accent-[var(--r-done)]"
                />
                <span
                  className={`text-[0.95rem] transition-colors ${on ? 'text-muted line-through decoration-[var(--r-done)]' : ''}`}
                >
                  {it}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
      <div className="flex items-center justify-between border-t border-line px-3 pt-2.5 pb-1 text-sm">
        <span className="text-muted">
          {checks.length}/{items.length} ticked
        </span>
        {done && <span className="font-medium text-[var(--r-done)]">✓ {noun} complete</span>}
      </div>
    </div>
  );
}
