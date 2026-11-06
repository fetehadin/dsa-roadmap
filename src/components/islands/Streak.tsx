import { useEffect, useState } from 'react';
import { load, streak, subscribe } from '@/lib/progress';

export default function Streak() {
  const [n, setN] = useState<number | null>(null);
  useEffect(() => {
    const f = () => setN(streak(load().days));
    f();
    return subscribe(f);
  }, []);
  if (!n) return null;
  return (
    <a href="/progress" className="btn btn-sm gap-1 !px-2 font-mono" title={`${n}-day study streak`} aria-label={`${n} day streak`}>
      <span className={n >= 2 ? 'anim-flicker inline-block' : 'inline-block'} aria-hidden="true">🔥</span>
      <span className="text-xs">{n}</span>
    </a>
  );
}
