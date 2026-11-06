import { useEffect, useState } from 'react';
import { ArrowRight, Play } from 'lucide-react';
import { load, subscribe } from '@/lib/progress';
import { getCatalog, stats } from '@/lib/client-catalog';
import Ring from './Ring';

/** Home-page card: overall ring plus a "continue where you left off" link. */
export default function Continue() {
  const [s, setS] = useState<{ pct: number; done: number; total: number; href: string; label: string; fresh: boolean } | null>(null);
  useEffect(() => {
    const f = () => {
      const p = load();
      const st = stats(p);
      const cat = getCatalog();
      const last = p.last ? cat.find((c) => c.slug === p.last) : undefined;
      const target = last && !p.topics[last.slug]?.done ? last : st.nextUp ?? last;
      setS({
        pct: st.pct,
        done: st.done,
        total: st.total,
        href: target ? `/learn/${target.slug}` : '/learn',
        label: target ? `${target.num} ${target.title}` : 'Review any chapter',
        fresh: !p.last && st.done === 0,
      });
    };
    f();
    return subscribe(f);
  }, []);
  if (!s) return <div className="card h-[92px] animate-pulse" aria-hidden="true" />;
  return (
    <a href={s.href} className="card group flex min-w-0 items-center gap-4 p-4 transition-colors hover:border-line-strong">
      <Ring pct={s.pct} size={60} label={`${s.done} of ${s.total} topics done`} />
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-medium tracking-wider text-faint uppercase">{s.fresh ? 'Start here' : 'Continue where you left off'}</span>
        <span className="mt-0.5 block truncate font-semibold group-hover:text-accent">{s.label}</span>
        <span className="block text-sm text-muted">
          {s.done}/{s.total} topics complete
        </span>
      </span>
      <span className="grid size-10 place-items-center rounded-full bg-accent text-accent-fg transition-transform group-hover:translate-x-0.5">{s.fresh ? <Play size={17} /> : <ArrowRight size={18} />}</span>
    </a>
  );
}
