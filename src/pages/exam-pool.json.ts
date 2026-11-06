import type { APIRoute } from 'astro';
import { allTopics, topicNum } from '@/lib/catalog';
import { mdi } from '@/lib/md';

export const GET: APIRoute = async () => {
  const topics = (await allTopics()).filter((t) => t.data.chapter !== 'levelup');
  const pool = [];
  for (const t of topics)
    for (const q of t.data.quiz)
      pool.push({
        ch: t.data.chapter,
        topic: `${topicNum(t)} ${t.data.title}`,
        slug: t.id,
        q: await mdi(q.q),
        code: q.code,
        options: await Promise.all(q.options.map((o) => mdi(o))),
        answer: q.answer,
        explain: await mdi(q.explain),
      });
  return new Response(JSON.stringify(pool), { headers: { 'Content-Type': 'application/json' } });
};
