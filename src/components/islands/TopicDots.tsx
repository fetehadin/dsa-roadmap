import { useEffect, useState } from 'react';
import { CheckCircle2, Circle, Bookmark } from 'lucide-react';
import { subscribe, topic } from '@/lib/progress';

export default function TopicDots({ slug }: { slug: string }) {
  const [s, setS] = useState({ done: false, mark: false, started: false });
  useEffect(() => {
    const f = () => {
      const t = topic(slug);
      setS({ done: !!t.done, mark: !!t.bookmark, started: !!t.visitedAt });
    };
    f();
    return subscribe(f);
  }, [slug]);
  return (
    <span className="flex shrink-0 items-center gap-1.5" aria-label={s.done ? 'Completed' : s.started ? 'Started' : 'Not started'}>
      {s.mark && <Bookmark size={15} className="text-accent" aria-hidden="true" />}
      {s.done ? <CheckCircle2 size={20} className="text-[var(--r-done)]" aria-hidden="true" /> : <Circle size={20} className={s.started ? 'text-[var(--r-compare)]' : 'text-faint'} aria-hidden="true" />}
    </span>
  );
}
