import type { APIRoute, GetStaticPaths } from 'astro';
import { allTopics, type Topic } from '@/lib/catalog';
import { topicMarkdown } from '@/lib/topic-md';

export const getStaticPaths: GetStaticPaths = async () =>
  (await allTopics()).map((t) => ({ params: { slug: t.id }, props: { topic: t } }));

export const GET: APIRoute = ({ props }) =>
  new Response(topicMarkdown((props as { topic: Topic }).topic), { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
