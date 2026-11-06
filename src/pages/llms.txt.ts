import type { APIRoute } from 'astro';
import { allTopics, topicNum } from '@/lib/catalog';
import { chapters, CORE_RULE } from '@/data/chapters';

export const GET: APIRoute = async ({ site }) => {
  const topics = await allTopics();
  const base = site!.origin;
  const L = [
    '# DSA Roadmap',
    '',
    '> A free, self-paced roadmap to data structures and algorithms in C++, organised in seven phases from foundations to algorithm design.',
    '',
    `Core rule: ${CORE_RULE}`,
    '',
    'Each topic is also available as raw Markdown by adding `.md` to its URL. The whole site as one file: ' +
      `${base}/llms-full.txt`,
    '',
  ];
  for (const c of chapters) {
    const list = topics.filter((t) => t.data.chapter === c.id);
    if (!list.length) continue;
    L.push(
      `## ${c.id === 'levelup' ? 'Level Up (optional)' : `Phase ${Number(c.num)}: ${c.title}`}`,
      '',
    );
    for (const t of list)
      L.push(`- [${topicNum(t)} ${t.data.title}](${base}/learn/${t.id}.md): ${t.data.summary}`);
    L.push('');
  }
  L.push(
    '## Other pages',
    '',
    `- [Labs](${base}/labs)`,
    `- [Glossary](${base}/glossary)`,
    `- [Big-O table](${base}/big-o)`,
    `- [How to use this guide](${base}/guide)`,
    '',
  );
  return new Response(L.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
