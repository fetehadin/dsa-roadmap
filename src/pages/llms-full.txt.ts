import type { APIRoute } from 'astro';
import { allTopics } from '@/lib/catalog';
import { topicMarkdown } from '@/lib/topic-md';
import { CORE_RULE } from '@/data/chapters';

export const GET: APIRoute = async () => {
  const topics = await allTopics();
  const body = [
    `# DSA Roadmap: full content\n\nData structures and algorithms in C++. ${CORE_RULE}\n`,
    ...topics.map(topicMarkdown),
  ].join('\n\n---\n\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
