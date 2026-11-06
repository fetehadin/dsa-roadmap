import type { APIRoute, GetStaticPaths } from 'astro';
import { roadmap, coreSnippet, type RoadNode } from '@/lib/roadmap';
import { allTopics, topicNum } from '@/lib/catalog';
import { highlight, md, mdi } from '@/lib/md';

export const getStaticPaths: GetStaticPaths = async () =>
  (await roadmap()).flatMap(({ phase, nodes }) =>
    nodes.map((node) => ({ params: { slug: node.slug }, props: { node, phase: phase.title } })),
  );

/** Panel payload for one roadmap node, fetched when its side panel opens. */
export const GET: APIRoute = async ({ props }) => {
  const { node, phase } = props as { node: RoadNode; phase: string };
  let out;
  if (node.topic) {
    const d = node.topic.data;
    const firstPara =
      (node.topic.body ?? '')
        .split(/\n\s*\n/)
        .find((p) => p.trim() && !p.startsWith('#') && !p.startsWith('```')) ?? '';
    out = {
      title: d.title,
      num: topicNum(node.topic),
      phase,
      soon: false,
      explain: (await md(d.summary)) + (await md(firstPara)),
      code: await highlight(coreSnippet(d.code[0].file)),
      complexity: await Promise.all(
        d.complexity.rows.map(async ([k, v]) => [await mdi(k), await mdi(v)]),
      ),
      space: d.complexity.space ? await mdi(d.complexity.space) : null,
      practice: d.practice.problems
        .slice(0, 3)
        .map(({ name, url, level }) => ({ name, url, level })),
      lesson: `/learn/${node.slug}`,
    };
  } else {
    const p = node.placeholder!;
    out = {
      title: p.title,
      num: null,
      phase,
      soon: true,
      explain: await md(p.summary),
      code: await highlight(p.code),
      complexity: await Promise.all(
        p.complexity.map(async ([k, v]) => [await mdi(k), await mdi(v)]),
      ),
      space: null,
      practice: p.practice,
      related: (await allTopics())
        .filter((t) => (p.related ?? []).includes(t.id))
        .map((t) => ({ title: t.data.title, url: `/learn/${t.id}` })),
      lesson: null,
    };
  }
  return new Response(JSON.stringify(out), { headers: { 'Content-Type': 'application/json' } });
};
