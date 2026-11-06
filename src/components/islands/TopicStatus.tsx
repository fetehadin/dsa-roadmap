import { useEffect, useState } from 'react';
import { Bookmark, BookmarkCheck, CheckCircle2, Circle } from 'lucide-react';
import { patchTopic, subscribe, topic, update } from '@/lib/progress';

export default function TopicStatus({ slug }: { slug: string }) {
  const [done, setDone] = useState(false);
  const [mark, setMark] = useState(false);
  useEffect(() => {
    update((d) => {
      d.last = slug;
      d.topics[slug] = { ...(d.topics[slug] ?? {}), visitedAt: new Date().toISOString() };
    });
    const f = () => {
      const t = topic(slug);
      setDone(!!t.done);
      setMark(!!t.bookmark);
    };
    f();
    return subscribe(f);
  }, [slug]);
  return (
    <div className="flex flex-wrap gap-2">
      <button
        className={`btn ${done ? '' : 'btn-primary'}`}
        aria-pressed={done}
        onClick={() =>
          patchTopic(slug, { done: !done, doneAt: !done ? new Date().toISOString() : undefined })
        }
      >
        {done ? <CheckCircle2 size={17} className="text-[var(--r-done)]" /> : <Circle size={17} />}
        {done ? 'Completed' : 'Mark complete'}
      </button>
      <button
        className="btn"
        aria-pressed={mark}
        aria-label={mark ? 'Remove bookmark' : 'Bookmark this topic'}
        onClick={() => patchTopic(slug, { bookmark: !mark })}
      >
        {mark ? <BookmarkCheck size={17} className="text-accent" /> : <Bookmark size={17} />}
        <span className="hidden sm:inline">{mark ? 'Saved' : 'Bookmark'}</span>
      </button>
    </div>
  );
}
