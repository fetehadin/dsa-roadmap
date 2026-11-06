import type { CatalogItem } from './catalog';
import { load, type ProgressData } from './progress';

let cache: CatalogItem[] | null = null;
export function getCatalog(): CatalogItem[] {
  if (cache) return cache;
  try {
    cache = JSON.parse(document.getElementById('dsa-catalog')?.textContent ?? '[]');
  } catch {
    cache = [];
  }
  return cache!;
}

export const isCore = (c: CatalogItem) => c.chapter !== 'levelup';

export function stats(p: ProgressData = load(), cat = getCatalog()) {
  const core = cat.filter(isCore);
  const done = core.filter((c) => p.topics[c.slug]?.done).length;
  const quizzes = Object.values(p.topics).filter((t) => t.quiz && t.quiz.total > 0);
  const quizAvg = quizzes.length
    ? Math.round(
        (quizzes.reduce((s, t) => s + t.quiz!.score / t.quiz!.total, 0) / quizzes.length) * 100,
      )
    : null;
  const byChapter = (id: CatalogItem['chapter']) => {
    const list = cat.filter((c) => c.chapter === id);
    const d = list.filter((c) => p.topics[c.slug]?.done).length;
    return {
      done: d,
      total: list.length,
      pct: list.length ? Math.round((d / list.length) * 100) : 0,
    };
  };
  const nextUp = core.find((c) => !p.topics[c.slug]?.done);
  return {
    done,
    total: core.length,
    pct: core.length ? Math.round((done / core.length) * 100) : 0,
    quizAvg,
    quizCount: quizzes.length,
    byChapter,
    nextUp,
  };
}
