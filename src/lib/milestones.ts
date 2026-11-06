import { load, subscribe, update } from './progress';
import { getCatalog, stats } from './client-catalog';
import { chapters } from '@/data/chapters';
import { confetti, toast } from './celebrate';

const PCTS = [25, 50, 75, 100];
const COPY: Record<number, [string, string]> = {
  25: ['25% done!', 'A quarter of the roadmap. Momentum is everything; keep going.'],
  50: ['Halfway there!', 'You have covered half the roadmap. Future-you says thanks.'],
  75: ['75%! The finish line is in sight', 'Time to start mixing in Exam mode.'],
  100: ['100%: every topic mastered!', 'Run a full Exam mode and go ace it. 🏆'],
};

/** Celebrate only on changes made in this tab, never on page load. */
export function watchMilestones() {
  let prev = stats();
  subscribe(() => {
    const p = load();
    const now = stats(p);
    const have = new Set(p.milestones ?? []);
    const fresh: number[] = [];
    for (const m of PCTS) if (now.pct >= m && prev.pct < m && !have.has(m)) fresh.push(m);
    for (const c of chapters) {
      if (c.id === 'levelup') continue;
      const code = 100 + Number(c.id);
      const b = prev.byChapter(c.id),
        a = now.byChapter(c.id);
      if (a.total && a.done === a.total && b.done < b.total && !have.has(code)) fresh.push(code);
    }
    prev = now;
    if (!fresh.length) return;
    update((d) => {
      d.milestones = [...new Set([...(d.milestones ?? []), ...fresh])];
    });
    const pct = fresh.filter((m) => m <= 100).pop();
    const ch = fresh.find((m) => m > 100);
    confetti();
    if (ch) {
      const c = chapters.find((x) => Number(x.id) === ch - 100)!;
      toast(
        `Phase ${Number(c.num)} complete!`,
        `${c.title}: done. ${CHEERS[ch % CHEERS.length]}`,
        '🏁',
      );
    }
    if (pct) toast(COPY[pct][0], COPY[pct][1], pct === 100 ? '🏆' : '🎉');
  });
  void getCatalog;
}

const CHEERS = [
  'Take a 5-minute break; you earned it.',
  'Solve one problem from the list before moving on.',
  'Try the chapter cheat sheet to lock it in.',
];
