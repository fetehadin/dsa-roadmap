import type { Algo, Frame, Role } from '../types';
import { parseNums, randomNums, clone } from '../types';
import type { ArrayState, GraphState, HashState } from '../views';

/* ---------------- graphs ---------------- */
const NODES = [
  { id: '0', x: 60, y: 55 },
  { id: '1', x: 180, y: 40 },
  { id: '2', x: 300, y: 60 },
  { id: '3', x: 70, y: 180 },
  { id: '4', x: 190, y: 165 },
  { id: '5', x: 300, y: 185 },
];
const EDGES: [string, string][] = [
  ['0', '1'],
  ['0', '3'],
  ['1', '2'],
  ['1', '4'],
  ['3', '4'],
  ['2', '5'],
  ['4', '5'],
];
const graph = (directed = false, edges = EDGES): GraphState => ({ nodes: NODES, edges, directed });
const adj = (g: GraphState) => {
  const m: Record<string, string[]> = Object.fromEntries(g.nodes.map((n) => [n.id, []]));
  for (const [a, b] of g.edges) {
    m[a].push(b);
    if (!g.directed) m[b].push(a);
  }
  for (const k in m) m[k].sort();
  return m;
};

export const graphTerms: Algo<GraphState> = {
  view: 'graph',
  legend: ['current', 'compare', 'visited', 'done'],
  code: [
    '// G = (V, E)',
    'int V = 6;                      // vertices 0..5',
    'vector<pair<int,int>> E = {',
    '  {0,1}, {0,3}, {1,2}, {1,4},',
    '  {3,4}, {2,5}, {4,5}',
    '};',
  ],
  init: () => graph(),
  actions: [{ id: 'run', label: 'Tour' }],
  auto: 'run',
  run: (g) => {
    const dg: GraphState = {
      ...graph(true, [
        ['0', '1'],
        ['1', '2'],
        ['2', '5'],
        ['3', '0'],
        ['4', '3'],
        ['1', '4'],
        ['5', '4'],
      ]),
      rep: true,
    };
    const s: [GraphState, string, Frame['hl'], number][] = [
      [
        g,
        'A graph G = (V, E): a set of VERTICES (nodes) and EDGES (connections). Unlike a tree, any vertex can connect to any other and cycles are allowed.',
        {},
        1,
      ],
      [
        g,
        'ADJACENT vertices share an edge: 1 is adjacent to 0, 2 and 4.',
        {
          '1': 'current',
          '0': 'compare',
          '2': 'compare',
          '4': 'compare',
          '0-1': 'compare',
          '1-2': 'compare',
          '1-4': 'compare',
        },
        4,
      ],
      [
        g,
        'DEGREE = number of edges at a vertex. deg(1) = 3, deg(5) = 2. Sum of all degrees = 2 × |E| = 14.',
        { '1': 'current', '5': 'compare' },
        4,
      ],
      [
        g,
        'PATH: a sequence of vertices joined by edges, e.g. 0 → 1 → 2 → 5. Its LENGTH is the number of edges (3).',
        {
          '0': 'visited',
          '1': 'visited',
          '2': 'visited',
          '5': 'visited',
          '0-1': 'done',
          '1-2': 'done',
          '2-5': 'done',
        },
        4,
      ],
      [
        g,
        'CYCLE: a path that starts and ends at the same vertex without repeating edges: 0 → 1 → 4 → 3 → 0.',
        {
          '0': 'current',
          '1': 'visited',
          '4': 'visited',
          '3': 'visited',
          '0-1': 'swap',
          '1-4': 'swap',
          '3-4': 'swap',
          '0-3': 'swap',
        },
        5,
      ],
      [
        g,
        'CONNECTED: there is a path between every pair of vertices. This graph is connected.',
        Object.fromEntries(NODES.map((n) => [n.id, 'done'])),
        1,
      ],
      [
        g,
        'A tree is a connected graph with no cycles: V vertices and exactly V − 1 edges. We have 6 vertices and 7 edges, so at least one cycle exists.',
        {},
        2,
      ],
      [
        dg,
        'DIRECTED graph (digraph): edges are one-way arrows. 0 → 1 does not mean 1 → 0. Think Instagram "follows" vs Facebook "friends".',
        {},
        1,
      ],
      [
        dg,
        'In a digraph each vertex has an IN-degree and an OUT-degree. Vertex 1: in = 1 (from 0), out = 2 (to 2 and 4).',
        { '1': 'current', '0-1': 'compare', '1-2': 'done', '1-4': 'done' },
        1,
      ],
      [
        dg,
        'A directed cycle follows the arrows: 1 → 4 → 3 → 0 → 1. The adjacency matrix of a digraph is NOT symmetric. Check the panel.',
        { '1-4': 'swap', '4-3': 'swap', '3-0': 'swap', '0-1': 'swap' },
        1,
      ],
      [
        g,
        'WEIGHTED graphs put a number (distance, cost) on each edge. You store it in the matrix cell instead of 1.',
        {},
        1,
      ],
    ];
    return s.map(([st, note, hl, line]) => ({
      s: { ...st, rep: st.directed ? true : false },
      note,
      hl,
      line,
    }));
  },
};

export const graphRep: Algo<GraphState> = {
  view: 'graph',
  legend: ['current'],
  code: [
    'int V = 6;',
    'int adjMatrix[6][6] = {0};               // O(V²) space',
    'vector<vector<int>> adjList(V);           // O(V + E) space',
    'void addEdge(int u, int v, bool directed) {',
    '  adjMatrix[u][v] = 1;',
    '  adjList[u].push_back(v);',
    '  if (!directed) {',
    '    adjMatrix[v][u] = 1;',
    '    adjList[v].push_back(u);',
    '  }',
    '}',
  ],
  init: () => ({ ...graph(false, []), rep: true }),
  actions: [
    { id: 'u', label: 'Build undirected' },
    { id: 'd', label: 'Build directed' },
  ],
  run: (_g, act) => {
    const directed = act === 'd';
    const es: [string, string][] = [];
    const f: Frame<GraphState>[] = [
      {
        s: { ...graph(directed, []), rep: true },
        line: 1,
        note: `Start with no edges. Toggle "Adjacency matrix / list" on the right while stepping.`,
      },
    ];
    for (const [a, b] of EDGES) {
      es.push([a, b]);
      f.push({
        s: { ...graph(directed, [...es]), rep: true },
        line: directed ? 6 : 9,
        note: directed
          ? `addEdge(${a}, ${b}): set matrix[${a}][${b}] = 1 and append ${b} to list[${a}]. Only one direction.`
          : `addEdge(${a}, ${b}): set matrix[${a}][${b}] AND matrix[${b}][${a}]. Undirected = symmetric.`,
        hl: { [a]: 'current', [b]: 'current', [`${a}-${b}`]: 'current' },
      });
    }
    f.push({
      s: { ...graph(directed, es), rep: true },
      line: 3,
      note: `Matrix: 36 cells for ${es.length} edges, but "is there an edge u→v?" is O(1). List: stores only real edges (V + ${directed ? 'E' : '2E'}), best for sparse graphs and for looping over neighbours.`,
    });
    return f;
  },
};

const BFS = [
  'void bfs(int s, vector<vector<int>>& adj) {',
  '  vector<bool> visited(adj.size(), false);',
  '  queue<int> q;',
  '  visited[s] = true; q.push(s);',
  '  while (!q.empty()) {',
  '    int u = q.front(); q.pop();',
  '    cout << u << " ";',
  '    for (int v : adj[u])',
  '      if (!visited[v]) {',
  '        visited[v] = true;',
  '        q.push(v);',
  '      }',
  '  }',
  '}',
];
const DFS = [
  'void dfs(int u, vector<vector<int>>& adj, vector<bool>& visited) {',
  '  visited[u] = true;',
  '  cout << u << " ";',
  '  for (int v : adj[u])',
  '    if (!visited[v])',
  '      dfs(v, adj, visited);',
  '}',
];

export const traverse: Algo<GraphState> = {
  view: 'graph',
  legend: ['current', 'compare', 'visited'],
  code: BFS,
  init: () => ({ ...graph(), rep: false }),
  actions: [
    { id: 'bfs', label: 'BFS from 0', code: BFS },
    { id: 'dfs', label: 'DFS from 0', code: DFS },
  ],
  run: (g, act) => {
    const A = adj(g);
    const f: Frame<GraphState>[] = [];
    const vis: Record<string, Role> = {};
    const out: string[] = [];
    if (act === 'bfs') {
      const q: string[] = ['0'];
      vis['0'] = 'visited';
      const P = (line: number, note: string, hl: Frame['hl'] = {}) =>
        f.push({
          s: g,
          line,
          note,
          hl: { ...vis, ...hl },
          aux: [
            { label: 'queue', items: [...q], kind: 'queue' },
            { label: 'output', items: [...out] },
          ],
        });
      P(
        4,
        'BFS explores in WAVES: all neighbours first, then their neighbours. Mark 0 visited and enqueue it. Visited lists are sorted by number.',
      );
      while (q.length) {
        const u = q.shift()!;
        out.push(u);
        P(7, `Dequeue ${u} and print it.`, { [u]: 'current' });
        for (const v of A[u]) {
          if (!vis[v]) {
            vis[v] = 'visited';
            q.push(v);
            P(11, `${v} is new: mark visited and enqueue.`, {
              [u]: 'current',
              [v]: 'compare',
              [`${u}-${v}`]: 'current',
            });
          } else P(9, `${v} already visited: skip.`, { [u]: 'current', [`${u}-${v}`]: 'dim' });
        }
      }
      P(
        5,
        `Queue empty. BFS order: ${out.join(' ')}. Each vertex and edge handled once: O(V + E). BFS finds the fewest-edges path in an unweighted graph.`,
      );
      return f;
    }
    const stack: string[] = [];
    const P = (line: number, note: string, hl: Frame['hl'] = {}) =>
      f.push({
        s: g,
        line,
        note,
        hl: { ...vis, ...hl },
        aux: [
          { label: 'call stack', items: [...stack], kind: 'stack' },
          { label: 'output', items: [...out] },
        ],
      });
    const dfs = (u: string) => {
      stack.push(u);
      vis[u] = 'visited';
      out.push(u);
      P(3, `dfs(${u}): mark visited, print ${u}. Go as DEEP as possible before backtracking.`, {
        [u]: 'current',
      });
      for (const v of A[u]) {
        if (!vis[v]) {
          P(6, `${v} unvisited → recurse into dfs(${v}). (The call stack is DFS's stack.)`, {
            [u]: 'current',
            [v]: 'compare',
            [`${u}-${v}`]: 'current',
          });
          dfs(v);
          P(4, `Back in dfs(${u}) (backtracked). Check its next neighbour.`, { [u]: 'current' });
        } else P(5, `${v} already visited: skip.`, { [u]: 'current' });
      }
      stack.pop();
    };
    dfs('0');
    P(
      1,
      `DFS order: ${out.join(' ')}. Also O(V + E). An iterative version uses an explicit stack<int> instead of recursion.`,
    );
    return f;
  },
};

/* ---------------- hashing ---------------- */
const M = 7;
export const hashChain: Algo<HashState> = {
  view: 'hash',
  legend: ['current', 'compare', 'found'],
  code: [
    'const int M = 7;',
    'vector<list<int>> table(M);',
    'int h(int key) { return key % M; }',
    'void insert(int key) {',
    '  table[h(key)].push_back(key);    // collisions share a chain',
    '}',
    'bool search(int key) {',
    '  for (int k : table[h(key)])',
    '    if (k == key) return true;',
    '  return false;',
    '}',
  ],
  init: () => ({ table: [[14], [], [23], [], [], [12], []], mode: 'chain' }),
  actions: [
    { id: 'ins', label: 'Insert', value: true, def: 21 },
    { id: 'find', label: 'Search', value: true },
  ],
  run: (s0, act, v = 0) => {
    const s = clone(s0);
    const t = s.table as number[][];
    const k = ((v % M) + M) % M;
    const f: Frame<HashState>[] = [
      {
        s: clone(s),
        line: 3,
        note: `h(${v}) = ${v} % 7 = ${k}. Jump straight to bucket ${k}: no scanning.`,
        hl: { [k]: 'current' },
        ptr: { 'h(k)': k },
        vars: { key: v, 'h(key)': k },
      },
    ];
    if (act === 'ins') {
      if (t.flat().length >= 16) return [{ s, note: 'Demo limit: 16 keys.' }];
      t[k].push(v);
      f.push({
        s: clone(s),
        line: 5,
        note:
          t[k].length > 1
            ? `COLLISION: bucket ${k} already had ${t[k].slice(0, -1).join(', ')}. Chaining just appends to the list.`
            : `Bucket ${k} was empty. Store ${v}.`,
        hl: { [k]: 'current', [`${k}:${t[k].length - 1}`]: 'found' },
        vars: { 'load factor': (t.flat().length / M).toFixed(2) },
      });
      return f;
    }
    for (let j = 0; j < t[k].length; j++) {
      const hit = t[k][j] === v;
      f.push({
        s: clone(s),
        line: 9,
        note: hit ? `Found ${v} in bucket ${k}.` : `${t[k][j]} ≠ ${v}, next in chain.`,
        hl: { [k]: 'current', [`${k}:${j}`]: hit ? 'found' : 'compare' },
      });
      if (hit) return f;
    }
    f.push({
      s: clone(s),
      line: 10,
      note: `${v} is not in bucket ${k}, so it is not in the table. We only searched ONE short chain.`,
      hl: { [k]: 'current' },
    });
    return f;
  },
};

export const hashProbe: Algo<HashState> = {
  view: 'hash',
  legend: ['current', 'compare', 'found', 'bad'],
  code: [
    'const int M = 7, EMPTY = -1;',
    'int table[M];          // all EMPTY at start',
    'int h(int key) { return key % M; }',
    'bool insert(int key) {',
    '  for (int i = 0; i < M; i++) {',
    '    int idx = (h(key) + i) % M;    // linear probing',
    '    if (table[idx] == EMPTY) { table[idx] = key; return true; }',
    '  }',
    '  return false;                      // table full',
    '}',
    'bool search(int key) {',
    '  for (int i = 0; i < M; i++) {',
    '    int idx = (h(key) + i) % M;',
    '    if (table[idx] == EMPTY) return false;',
    '    if (table[idx] == key) return true;',
    '  }',
    '  return false;',
    '}',
  ],
  init: () => ({ table: [14, null, 23, null, null, 12, null], mode: 'probe' }),
  actions: [
    { id: 'ins', label: 'Insert', value: true, def: 21 },
    { id: 'find', label: 'Search', value: true },
  ],
  run: (s0, act, v = 0) => {
    const s = clone(s0);
    const t = s.table as (number | null)[];
    const k = ((v % M) + M) % M;
    const f: Frame<HashState>[] = [
      {
        s: clone(s),
        line: 3,
        note: `h(${v}) = ${v} % 7 = ${k}.`,
        hl: { [k]: 'current' },
        vars: { key: v },
      },
    ];
    for (let i = 0; i < M; i++) {
      const idx = (k + i) % M;
      if (act === 'ins') {
        if (t[idx] === null) {
          t[idx] = v;
          f.push({
            s: clone(s),
            line: 7,
            note: `${i === 0 ? 'Slot is free' : `Probe ${i}: slot ${idx} is free`}. Store ${v} at index ${idx}.`,
            hl: { [idx]: 'found' },
            ptr: { idx },
            vars: { key: v, probes: i + 1 },
          });
          return f;
        }
        f.push({
          s: clone(s),
          line: 6,
          note: `Slot ${idx} is taken by ${t[idx]} (collision). Try the next slot: (${k} + ${i + 1}) % 7 = ${(k + i + 1) % M}.`,
          hl: { [idx]: 'bad' },
          ptr: { idx },
          vars: { key: v, probes: i + 1 },
        });
      } else {
        if (t[idx] === null) {
          f.push({
            s: clone(s),
            line: 14,
            note: `Slot ${idx} is EMPTY, so ${v} cannot be further along. Not found.`,
            hl: { [idx]: 'compare' },
            ptr: { idx },
          });
          return f;
        }
        if (t[idx] === v) {
          f.push({
            s: clone(s),
            line: 15,
            note: `Found ${v} at index ${idx} after ${i + 1} probe(s).`,
            hl: { [idx]: 'found' },
            ptr: { idx },
          });
          return f;
        }
        f.push({
          s: clone(s),
          line: 13,
          note: `${t[idx]} ≠ ${v}, probe the next slot.`,
          hl: { [idx]: 'compare' },
          ptr: { idx },
        });
      }
    }
    f.push({
      s: clone(s),
      line: act === 'ins' ? 9 : 17,
      note:
        act === 'ins'
          ? 'Every slot is full! Open addressing needs load factor < 1 (keep it under ~0.7).'
          : 'Checked every slot: not found.',
    });
    return f;
  },
};

/* ---------------- Level Up ---------------- */
type AS = ArrayState;
const row = (a: number[], extra: Partial<AS['rows'][0]> = {}): AS => ({ rows: [{ a, ...extra }] });

export const twoPointers: Algo<AS> = {
  view: 'array',
  legend: ['compare', 'found', 'dim'],
  code: [
    'bool pairSum(const vector<int>& a, int target) {',
    '  int l = 0, r = a.size() - 1;',
    '  while (l < r) {',
    '    int sum = a[l] + a[r];',
    '    if (sum == target) return true;',
    '    if (sum < target) l++;     // need a bigger sum',
    '    else r--;                  // need a smaller sum',
    '  }',
    '  return false;',
    '}',
  ],
  input: {
    label: 'Sorted array',
    def: '1, 3, 4, 6, 8, 11, 14',
    random: () => randomNums(8, 1, 30),
  },
  init: (s) => row(parseNums(s).sort((x, y) => x - y)),
  actions: [{ id: 'run', label: 'Find pair with sum', value: true, def: 15 }],
  run: (s, _a, target = 0) => {
    const a = s.rows[0].a as number[];
    let l = 0,
      r = a.length - 1,
      steps = 0;
    const dim = () =>
      Object.fromEntries(
        a.map((_, k) => [k, k < l || k > r ? 'dim' : undefined]).filter(([, x]) => x),
      ) as Record<number, Role>;
    const f: Frame<AS>[] = [
      {
        s,
        line: 2,
        note: `Target ${target}. Start at both ends of the SORTED array. Brute force would try all n² pairs.`,
        ptr: { l, r },
      },
    ];
    while (l < r) {
      const sum = a[l] + a[r];
      steps++;
      f.push({
        s,
        line: 4,
        note: `${a[l]} + ${a[r]} = ${sum}.`,
        hl: { ...dim(), [l]: 'compare', [r]: 'compare' },
        ptr: { l, r },
        vars: { sum, steps },
      });
      if (sum === target) {
        f.push({
          s,
          line: 5,
          note: `Found: ${a[l]} + ${a[r]} = ${target} in ${steps} steps. O(n), O(1) space.`,
          hl: { ...dim(), [l]: 'found', [r]: 'found' },
          ptr: { l, r },
          vars: { sum, steps },
        });
        return f;
      }
      if (sum < target) {
        l++;
        f.push({
          s,
          line: 6,
          note: `${sum} < ${target}: moving r left would only shrink the sum, so move l right.`,
          hl: dim(),
          ptr: { l, r },
          vars: { steps },
        });
      } else {
        r--;
        f.push({
          s,
          line: 7,
          note: `${sum} > ${target}: move r left to shrink the sum.`,
          hl: dim(),
          ptr: { l, r },
          vars: { steps },
        });
      }
    }
    f.push({ s, line: 9, note: `l met r: no pair sums to ${target}.`, hl: dim() });
    return f;
  },
};

export const slidingWindow: Algo<AS> = {
  view: 'array',
  legend: ['current', 'swap', 'compare'],
  code: [
    'int maxSum(const vector<int>& a, int k) {',
    '  int sum = 0;',
    '  for (int i = 0; i < k; i++) sum += a[i];',
    '  int best = sum;',
    '  for (int r = k; r < a.size(); r++) {',
    '    sum += a[r] - a[r - k];    // add new, drop old',
    '    best = max(best, sum);',
    '  }',
    '  return best;',
    '}',
  ],
  input: { label: 'Array', def: '2, 1, 5, 1, 3, 2, 7, 1', random: () => randomNums(9, 1, 9) },
  init: (s) => row(parseNums(s)),
  actions: [{ id: 'run', label: 'Max sum of window k', value: true, def: 3 }],
  run: (s, _a, kRaw = 3) => {
    const a = s.rows[0].a as number[];
    const k = Math.max(1, Math.min(a.length, kRaw));
    let sum = 0;
    for (let i = 0; i < k; i++) sum += a[i];
    let best = sum,
      bl = 0;
    const W = (l: number, r: number, hl: Record<number, Role> = {}): AS => ({
      rows: [{ a, range: [l, r], hl }],
    });
    const f: Frame<AS>[] = [
      {
        s: W(0, k - 1),
        line: 3,
        note: `First window [0..${k - 1}]: sum = ${sum}.`,
        ptr: { l: 0, r: k - 1 },
        vars: { sum, best },
      },
    ];
    for (let r = k; r < a.length; r++) {
      sum += a[r] - a[r - k];
      f.push({
        s: W(r - k + 1, r, { [r]: 'current', [r - k]: 'swap' }),
        line: 6,
        note: `Slide: + a[${r}] (${a[r]}) − a[${r - k}] (${a[r - k]}) → sum = ${sum}. Two operations instead of re-adding ${k} numbers.`,
        ptr: { l: r - k + 1, r },
        vars: { sum, best },
      });
      if (sum > best) {
        best = sum;
        bl = r - k + 1;
        f.push({
          s: W(r - k + 1, r),
          line: 7,
          note: `New best: ${best}.`,
          ptr: { l: r - k + 1, r },
          vars: { sum, best },
        });
      }
    }
    f.push({
      s: W(bl, bl + k - 1),
      line: 9,
      note: `Best window starts at ${bl}: sum ${best}. O(n) instead of O(n·k).`,
      vars: { best },
    });
    return f;
  },
};

export const prefixSum: Algo<AS> = {
  view: 'array',
  legend: ['current', 'swap', 'compare', 'found'],
  code: [
    'vector<int> buildPrefix(const vector<int>& a) {',
    '  vector<int> p(a.size() + 1, 0);',
    '  for (int i = 0; i < a.size(); i++)',
    '    p[i + 1] = p[i] + a[i];',
    '  return p;',
    '}',
    'int rangeSum(const vector<int>& p, int l, int r) {',
    '  return p[r + 1] - p[l];     // sum of a[l..r]',
    '}',
  ],
  input: { label: 'Array', def: '3, 1, 4, 1, 5, 9, 2', random: () => randomNums(7, 1, 9) },
  init: (s) => {
    const a = parseNums(s, 10);
    return {
      rows: [
        { name: 'a', a },
        { name: 'p', a: [0, ...a.map(() => null)] },
      ],
    };
  },
  actions: [
    { id: 'build', label: 'Build prefix' },
    { id: 'query', label: 'Sum a[pos..value]', value: true, pos: true, def: 4 },
  ],
  auto: 'build',
  run: (s, act, r = 4, l = 1) => {
    const a = s.rows[0].a as number[];
    const p: (number | null)[] = [0, ...a.map(() => null)];
    const F = (
      line: number,
      note: string,
      ha: Record<number, Role>,
      hp: Record<number, Role>,
      range?: [number, number],
    ): Frame<AS> => ({
      s: {
        rows: [
          { name: 'a', a, hl: ha, range },
          { name: 'p', a: [...p], hl: hp },
        ],
      },
      line,
      note,
    });
    if (act === 'build') {
      const f = [
        F(2, 'p[0] = 0. p[i] will hold the sum of the first i items.', {}, { 0: 'current' }),
      ];
      for (let i = 0; i < a.length; i++) {
        p[i + 1] = (p[i] as number) + a[i];
        f.push(
          F(
            4,
            `p[${i + 1}] = p[${i}] + a[${i}] = ${p[i]} + ${a[i]} = ${p[i + 1]}.`,
            { [i]: 'compare' },
            { [i]: 'current', [i + 1]: 'swap' },
          ),
        );
      }
      f.push(F(5, 'Built in O(n). Now any range sum is one subtraction.', {}, {}));
      return f;
    }
    const full = [0];
    for (const x of a) full.push(full[full.length - 1] + x);
    full.forEach((x, i) => (p[i] = x));
    if (l > r || r >= a.length)
      return [F(8, `Need 0 ≤ l ≤ r < ${a.length}. Set pos = l and value = r.`, {}, {})];
    return [
      F(
        8,
        `sum(a[${l}..${r}]) = p[${r + 1}] − p[${l}] = ${full[r + 1]} − ${full[l]} = ${full[r + 1] - full[l]}. O(1) per query.`,
        {},
        { [r + 1]: 'found', [l]: 'compare' },
        [l, r],
      ),
    ];
  },
};

export const algos = {
  'graph-terms': graphTerms,
  'graph-rep': graphRep,
  'graph-traverse': traverse,
  'hash-chain': hashChain,
  'hash-probe': hashProbe,
  'two-pointers': twoPointers,
  'sliding-window': slidingWindow,
  'prefix-sum': prefixSum,
};
