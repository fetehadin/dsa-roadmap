import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { allTopics, topicNum } from '@/lib/catalog';
import { chapterById, chapters } from '@/data/chapters';
import { glossary } from '@/data/glossary';
import { slug } from '@/lib/slug';

export const GET: APIRoute = async () => {
  const topics = await allTopics();
  const labs = await getCollection('labs');
  const items = [
    ...topics.map((t) => ({
      title: `${topicNum(t)} ${t.data.title}`,
      url: `/learn/${t.id}`,
      type: t.data.chapter === 'levelup' ? 'Level Up' : 'Topic',
      sub: chapterById(t.data.chapter).title,
      text: [t.data.summary, ...t.data.keywords].join(' '),
    })),
    ...glossary.map((g) => ({
      title: g.term,
      url: `/glossary#${slug(g.term)}`,
      type: 'Glossary',
      sub: g.def,
    })),
    ...chapters
      .filter((c) => c.id !== 'levelup')
      .map((c) => ({
        title: `Cheat sheet: Phase ${Number(c.num)} ${c.title}`,
        url: `/cheatsheets/${c.slug}`,
        type: 'Cheat sheet',
        sub: c.title,
      })),
    ...labs.map((l) => ({
      title: l.data.title,
      url: `/labs/${l.id}`,
      type: 'Lab',
      sub: l.data.summary,
    })),
    {
      title: 'Big-O master table',
      url: '/big-o',
      type: 'Cheat sheet',
      sub: 'Every operation and sort on one page',
    },
    { title: 'Test yourself', url: '/exam', type: 'Page', sub: 'Random timed quiz across phases' },
    { title: 'Progress dashboard', url: '/progress', type: 'Page', sub: 'Export, import, reset' },
    {
      title: 'How to use this guide',
      url: '/guide',
      type: 'Page',
      sub: 'How to study with this roadmap',
    },
    { title: 'Glossary', url: '/glossary', type: 'Page', sub: 'Every term on the roadmap' },
  ];
  return new Response(JSON.stringify(items), { headers: { 'Content-Type': 'application/json' } });
};
