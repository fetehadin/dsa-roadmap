import fs from 'node:fs';
import path from 'node:path';
import { phases, type Chapter } from '@/data/chapters';
import { comingSoon, type SoonNode } from '@/data/roadmap';
import { allTopics, type Topic } from './catalog';

export interface RoadNode {
  slug: string;
  title: string;
  soon: boolean;
  topic?: Topic;
  placeholder?: SoonNode;
}
export interface RoadPhase {
  phase: Chapter;
  nodes: RoadNode[];
}

/** Every phase with its ordered nodes: real topics by `order`, placeholders slotted in after `after`. */
export async function roadmap(): Promise<RoadPhase[]> {
  const topics = await allTopics();
  return phases.map((phase) => {
    const nodes: RoadNode[] = topics
      .filter((t) => t.data.chapter === phase.id)
      .map((t) => ({ slug: t.id, title: t.data.title, soon: false, topic: t }));
    for (const s of comingSoon.filter((c) => c.phase === phase.id)) {
      const i = s.after ? nodes.findIndex((n) => n.slug === s.after) + 1 : 0;
      nodes.splice(i, 0, { slug: s.slug, title: s.title, soon: true, placeholder: s });
    }
    return { phase, nodes };
  });
}

/** The core function(s) of a lesson's C++ file: no includes, no `main()`. Falls back to the whole file. */
export function coreSnippet(file: string): string {
  const src = fs.readFileSync(path.resolve('code', `${file}.cpp`), 'utf8');
  const body = src
    .split(/^int main\(/m)[0]
    .split('\n')
    .filter((l) => !/^#include|^using namespace/.test(l))
    .join('\n')
    .trim();
  return body || src.trim();
}
