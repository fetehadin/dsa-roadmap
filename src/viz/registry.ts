import type { Algo } from './types';

type Mod = { algos: Record<string, Algo<never>> };
const groups: Record<string, () => Promise<Mod>> = {
  sorting: () => import('./algos/sorting') as unknown as Promise<Mod>,
  basics: () => import('./algos/basics') as unknown as Promise<Mod>,
  lists: () => import('./algos/lists') as unknown as Promise<Mod>,
  stackqueue: () => import('./algos/stackqueue') as unknown as Promise<Mod>,
  trees: () => import('./algos/trees') as unknown as Promise<Mod>,
  more: () => import('./algos/more') as unknown as Promise<Mod>,
};

/** id → group. Keep in sync with each module's `algos` export (checked at build by vizIds()). */
export const index: Record<string, keyof typeof groups> = {
  'selection-sort': 'sorting',
  'bubble-sort': 'sorting',
  'insertion-sort': 'sorting',
  'shell-sort': 'sorting',
  'quick-sort': 'sorting',
  'heap-sort': 'sorting',
  'merge-sort': 'sorting',
  'pointer-sort': 'sorting',
  classify: 'basics',
  'array-memory': 'basics',
  'matrix-memory': 'basics',
  'adt-stack': 'basics',
  'find-max': 'basics',
  'late-termination': 'basics',
  'time-units': 'basics',
  'time-units-nested': 'basics',
  'big-o-proof': 'basics',
  'linear-search': 'basics',
  'search-cases': 'basics',
  'binary-search': 'basics',
  factorial: 'basics',
  'rec-binary-search': 'basics',
  sll: 'lists',
  dll: 'lists',
  'fast-slow': 'lists',
  'stack-heap': 'lists',
  'stack-array': 'stackqueue',
  'stack-list': 'stackqueue',
  'queue-list': 'stackqueue',
  'queue-naive': 'stackqueue',
  'queue-front': 'stackqueue',
  'circular-queue': 'stackqueue',
  deque: 'stackqueue',
  'monotonic-stack': 'stackqueue',
  bst: 'trees',
  'bst-delete': 'trees',
  traversals: 'trees',
  'tree-terms': 'trees',
  'general-tree': 'trees',
  'graph-terms': 'more',
  'graph-rep': 'more',
  'graph-traverse': 'more',
  'hash-chain': 'more',
  'hash-probe': 'more',
  'two-pointers': 'more',
  'sliding-window': 'more',
  'prefix-sum': 'more',
};

export async function loadAlgo(id: string): Promise<Algo | null> {
  const g = index[id];
  if (!g) return null;
  const m = await groups[g]();
  return (m.algos[id] as unknown as Algo) ?? null;
}
