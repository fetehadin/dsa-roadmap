import { getCollection, type CollectionEntry } from 'astro:content';
import { chapters, type ChapterId } from '@/data/chapters';

export type Topic = CollectionEntry<'topics'>;

export interface CatalogItem {
  slug: string;
  title: string;
  chapter: ChapterId;
  num: string;
  checks: number;
}

const chapterIndex = (c: ChapterId | number) => chapters.findIndex((x) => x.id === c);

export async function allTopics(): Promise<Topic[]> {
  const list = await getCollection('topics');
  return list.sort(
    (a, b) =>
      chapterIndex(a.data.chapter) - chapterIndex(b.data.chapter) || a.data.order - b.data.order,
  );
}

export const topicNum = (t: Topic) =>
  t.data.chapter === 'levelup' ? `LU.${t.data.order}` : `${t.data.chapter}.${t.data.order}`;

export const topicUrl = (slug: string) => `/learn/${slug}`;

export async function catalog(): Promise<CatalogItem[]> {
  return (await allTopics()).map((t) => ({
    slug: t.id,
    title: t.data.title,
    chapter: t.data.chapter as ChapterId,
    num: topicNum(t),
    checks: t.data.checklist.length,
  }));
}
