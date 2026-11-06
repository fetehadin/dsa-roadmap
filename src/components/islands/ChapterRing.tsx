import { useEffect, useState } from 'react';
import { subscribe } from '@/lib/progress';
import { stats } from '@/lib/client-catalog';
import type { ChapterId } from '@/data/chapters';
import Ring from './Ring';

export default function ChapterRing({ id, size = 40 }: { id: ChapterId; size?: number }) {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const f = () => setPct(stats().byChapter(id).pct);
    f();
    return subscribe(f);
  }, [id]);
  return <Ring pct={pct} size={size} stroke={4} />;
}
