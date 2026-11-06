import type { Algo, Frame, Role } from '../types';
import { parseNums, clone } from '../types';
import type { TreeState } from '../views';

type TS = TreeState & { seq: number };
type TF = Frame<TS>;
const L = 0,
  R = 1;

const bstFrom = (vals: number[]): TS => {
  const s: TS = { nodes: {}, root: null, binary: true, seq: 0 };
  for (const v of vals) insertQuiet(s, v);
  return s;
};
function insertQuiet(s: TS, v: number) {
  const id = `t${s.seq++}`;
  if (!s.root) {
    s.nodes[id] = { v, c: [null, null] };
    s.root = id;
    return;
  }
  let c = s.root;
  for (;;) {
    const n = s.nodes[c];
    if (v === n.v) return;
    const side = v < (n.v as number) ? L : R;
    if (!n.c[side]) {
      s.nodes[id] = { v, c: [null, null] };
      n.c[side] = id;
      return;
    }
    c = n.c[side]!;
  }
}
const prune = (s: TS) => {
  const keep = new Set<string>();
  const go = (id: string | null) => {
    if (!id) return;
    keep.add(id);
    s.nodes[id].c.forEach((k) => go(k));
  };
  go(s.root);
  for (const k of Object.keys(s.nodes)) if (!keep.has(k)) delete s.nodes[k];
};

const C = {
  insert: [
    'Node* insert(Node* root, int x) {',
    '  if (root == nullptr) return new Node{x, nullptr, nullptr};',
    '  if (x < root->data) root->left = insert(root->left, x);',
    '  else if (x > root->data) root->right = insert(root->right, x);',
    '  return root;   // duplicates are ignored',
    '}',
  ],
  search: [
    'bool search(Node* root, int x) {',
    '  if (root == nullptr) return false;',
    '  if (x == root->data) return true;',
    '  if (x < root->data) return search(root->left, x);',
    '  return search(root->right, x);',
    '}',
  ],
  minmax: [
    'Node* findMin(Node* root) {',
    '  while (root->left != nullptr) root = root->left;',
    '  return root;',
    '}',
    'Node* findMax(Node* root) {',
    '  while (root->right != nullptr) root = root->right;',
    '  return root;',
    '}',
  ],
  remove: [
    'Node* remove(Node* root, int x) {',
    '  if (root == nullptr) return nullptr;',
    '  if (x < root->data) root->left = remove(root->left, x);',
    '  else if (x > root->data) root->right = remove(root->right, x);',
    '  else {',
    '    if (root->left == nullptr) {         // 0 or 1 child',
    '      Node* r = root->right; delete root; return r;',
    '    }',
    '    if (root->right == nullptr) {',
    '      Node* l = root->left; delete root; return l;',
    '    }',
    '    Node* s = findMin(root->right);      // 2 children',
    '    root->data = s->data;                // copy successor',
    '    root->right = remove(root->right, s->data);',
    '  }',
    '  return root;',
    '}',
  ],
};

function bstRun(s0: TS, act: string, v = 0): TF[] {
  const s = clone(s0);
  const f: TF[] = [];
  const P = (line: number, note: string, hl: TF['hl'] = {}, ptr: TF['ptr'] = {}) =>
    f.push({ s: clone(s), line, note, hl, ptr });
  const path: Record<string, Role> = {};
  if (act === 'insert') {
    if (Object.keys(s.nodes).length >= 15)
      return [{ s, note: 'Demo limit: 15 nodes. Delete some first.' }];
    if (!s.root) {
      insertQuiet(s, v);
      P(2, `Empty tree: ${v} becomes the root.`, { [s.root!]: 'done' });
      return f;
    }
    let c = s.root;
    for (;;) {
      const n = s.nodes[c];
      if (v === n.v) {
        P(5, `${v} is already in the tree. A BST keeps unique keys, so we ignore it.`, {
          ...path,
          [c]: 'found',
        });
        return f;
      }
      const left = v < (n.v as number);
      P(
        left ? 3 : 4,
        `${v} ${left ? '<' : '>'} ${n.v} → go ${left ? 'left' : 'right'}.`,
        { ...path, [c]: 'compare' },
        { cur: c },
      );
      path[c] = 'visited';
      const nx = n.c[left ? L : R];
      if (!nx) {
        const id = `t${s.seq++}`;
        s.nodes[id] = { v, c: [null, null] };
        n.c[left ? L : R] = id;
        P(
          2,
          `Reached nullptr: create ${v} here as the ${left ? 'left' : 'right'} child of ${n.v}.`,
          { ...path, [id]: 'done', [`${c}-${id}`]: 'done' },
        );
        return f;
      }
      c = nx;
    }
  }
  if (act === 'search') {
    let c = s.root;
    let k = 0;
    while (c) {
      const n = s.nodes[c];
      k++;
      if (n.v === v) {
        P(
          3,
          `Found ${v} after ${k} comparison(s). Each step went one level down: O(h).`,
          { ...path, [c]: 'found' },
          { cur: c },
        );
        return f;
      }
      const left = v < (n.v as number);
      P(
        left ? 4 : 5,
        `${v} ${left ? '<' : '>'} ${n.v} → search the ${left ? 'left' : 'right'} subtree only. The other half is skipped.`,
        { ...path, [c]: 'compare' },
        { cur: c },
      );
      path[c] = 'visited';
      c = n.c[left ? L : R];
    }
    P(2, `Hit nullptr: ${v} is not in the tree.`, path);
    return f;
  }
  if (act === 'min' || act === 'max') {
    if (!s.root) return [{ s, note: 'Empty tree.' }];
    const side = act === 'min' ? L : R;
    let c = s.root;
    P(
      act === 'min' ? 2 : 6,
      `Start at the root. Keep going ${act === 'min' ? 'left' : 'right'}.`,
      { [c]: 'current' },
      { cur: c },
    );
    while (s.nodes[c].c[side]) {
      path[c] = 'visited';
      c = s.nodes[c].c[side]!;
      P(act === 'min' ? 2 : 6, `→ ${s.nodes[c].v}.`, { ...path, [c]: 'current' }, { cur: c });
    }
    P(
      act === 'min' ? 3 : 7,
      `No ${act === 'min' ? 'left' : 'right'} child: ${s.nodes[c].v} is the ${act === 'min' ? 'minimum' : 'maximum'}.`,
      { ...path, [c]: 'found' },
      { [act]: c },
    );
    return f;
  }
  // delete
  let parent: string | null = null;
  let c = s.root;
  while (c && s.nodes[c].v !== v) {
    const left = v < (s.nodes[c].v as number);
    P(
      left ? 3 : 4,
      `${v} ${left ? '<' : '>'} ${s.nodes[c].v} → go ${left ? 'left' : 'right'}.`,
      { ...path, [c]: 'compare' },
      { cur: c },
    );
    path[c] = 'visited';
    parent = c;
    c = s.nodes[c].c[left ? L : R];
  }
  if (!c) {
    P(2, `${v} not found; nothing to delete.`, path);
    return f;
  }
  const n = s.nodes[c];
  const relink = (to: string | null) => {
    if (!parent) s.root = to;
    else {
      const pc = s.nodes[parent].c;
      pc[pc[L] === c ? L : R] = to;
    }
  };
  if (!n.c[L] && !n.c[R]) {
    P(
      6,
      `Case 1: ${v} is a LEAF. Just remove it and set the parent's pointer to nullptr.`,
      { ...path, [c]: 'swap' },
      { del: c },
    );
    relink(null);
  } else if (!n.c[L] || !n.c[R]) {
    const child = (n.c[L] ?? n.c[R])!;
    P(
      n.c[L] ? 10 : 7,
      `Case 2: ${v} has ONE child (${s.nodes[child].v}). The child takes its place.`,
      { ...path, [c]: 'swap', [child]: 'current' },
      { del: c },
    );
    relink(child);
  } else {
    P(
      12,
      `Case 3: ${v} has TWO children. Find its inorder successor: the smallest value in the right subtree.`,
      { ...path, [c]: 'swap' },
      { del: c },
    );
    let sp = c;
    let sc = n.c[R]!;
    const sPath: Record<string, Role> = {};
    P(
      12,
      `Go right once to ${s.nodes[sc].v}…`,
      { [c]: 'swap', [sc]: 'current' },
      { del: c, succ: sc },
    );
    while (s.nodes[sc].c[L]) {
      sPath[sc] = 'visited';
      sp = sc;
      sc = s.nodes[sc].c[L]!;
      P(
        12,
        `…then left as far as possible → ${s.nodes[sc].v}.`,
        { ...sPath, [c]: 'swap', [sc]: 'current' },
        { del: c, succ: sc },
      );
    }
    const sv = s.nodes[sc].v;
    n.v = sv;
    P(
      13,
      `Copy ${sv} into the node. Now ${sv} appears twice, so delete the old successor node (it has at most one child, so it is case 1 or 2).`,
      { [c]: 'done', [sc]: 'swap' },
      { succ: sc },
    );
    const scR = s.nodes[sc].c[R];
    const spc = s.nodes[sp].c;
    spc[spc[L] === sc ? L : R] = scR;
  }
  prune(s);
  P(16, `Deleted ${v}. Inorder traversal is still sorted, so the BST property holds.`, {});
  return f;
}

export const bst: Algo<TS> = {
  view: 'tree',
  legend: ['compare', 'visited', 'found', 'done', 'swap'],
  code: C.insert,
  input: {
    label: 'Build from',
    def: '50, 30, 70, 20, 40, 60, 80',
    presets: [{ label: 'Skewed', value: '10, 20, 30, 40, 50' }],
  },
  init: (s) => bstFrom(parseNums(s, 15)),
  actions: [
    { id: 'insert', label: 'Insert', value: true, def: 45, code: C.insert },
    { id: 'search', label: 'Search', value: true, code: C.search },
    { id: 'min', label: 'Min', code: C.minmax },
    { id: 'max', label: 'Max', code: C.minmax },
    { id: 'delete', label: 'Delete', value: true, code: C.remove },
  ],
  run: bstRun,
};

export const bstDelete: Algo<TS> = {
  ...bst,
  code: C.remove,
  input: { label: 'Build from', def: '50, 30, 70, 20, 40, 60, 80, 65, 35' },
  actions: [
    { id: 'delete', label: 'Delete', value: true, def: 30, code: C.remove },
    { id: 'insert', label: 'Insert', value: true, code: C.insert },
  ],
};

/* ---------------- traversals ---------------- */
const TC = {
  pre: [
    'void preorder(Node* r) {',
    '  if (r == nullptr) return;',
    '  cout << r->data << " ";   // visit',
    '  preorder(r->left);',
    '  preorder(r->right);',
    '}',
  ],
  in: [
    'void inorder(Node* r) {',
    '  if (r == nullptr) return;',
    '  inorder(r->left);',
    '  cout << r->data << " ";   // visit',
    '  inorder(r->right);',
    '}',
  ],
  post: [
    'void postorder(Node* r) {',
    '  if (r == nullptr) return;',
    '  postorder(r->left);',
    '  postorder(r->right);',
    '  cout << r->data << " ";   // visit',
    '}',
  ],
  level: [
    'void levelOrder(Node* root) {',
    '  if (root == nullptr) return;',
    '  queue<Node*> q;',
    '  q.push(root);',
    '  while (!q.empty()) {',
    '    Node* cur = q.front(); q.pop();',
    '    cout << cur->data << " ";',
    '    if (cur->left)  q.push(cur->left);',
    '    if (cur->right) q.push(cur->right);',
    '  }',
    '}',
  ],
};
export const traversals: Algo<TS> = {
  view: 'tree',
  legend: ['current', 'visited', 'done'],
  code: TC.pre,
  input: { label: 'Build BST from', def: '50, 30, 70, 20, 40, 60, 80' },
  init: (s) => bstFrom(parseNums(s, 15)),
  actions: [
    { id: 'pre', label: 'Preorder', code: TC.pre },
    { id: 'in', label: 'Inorder', code: TC.in },
    { id: 'post', label: 'Postorder', code: TC.post },
    { id: 'level', label: 'Level order', code: TC.level },
  ],
  run: (s, act) => {
    const f: TF[] = [];
    const out: (string | number)[] = [];
    const done: Record<string, Role> = {};
    const stack: string[] = [];
    const P = (
      line: number,
      note: string,
      cur?: string,
      extra: { label: string; items: (string | number)[]; kind?: 'stack' | 'queue' }[] = [],
    ) =>
      f.push({
        s,
        line,
        note,
        hl: { ...done, ...(cur ? { [cur]: 'current' as Role } : {}) },
        ptr: cur ? { r: cur } : {},
        aux: [{ label: 'output', items: [...out] }, ...extra],
      });
    if (act === 'level') {
      if (!s.root) return [{ s, note: 'Empty tree.' }];
      const q: string[] = [s.root];
      const qa = () => [
        { label: 'queue', items: q.map((id) => s.nodes[id].v), kind: 'queue' as const },
      ];
      P(4, 'Level order uses a QUEUE (not recursion). Push the root.', undefined, qa());
      while (q.length) {
        const c = q.shift()!;
        out.push(s.nodes[c].v);
        done[c] = 'visited';
        P(7, `Dequeue ${s.nodes[c].v} and print it.`, c, qa());
        for (const k of s.nodes[c].c) if (k) q.push(k);
        P(9, 'Enqueue its children (left, then right).', c, qa());
      }
      P(5, `Queue empty. Level order: ${out.join(' ')}. This is BFS on a tree.`, undefined, qa());
      return f;
    }
    const lines =
      act === 'pre'
        ? { visit: 3, l: 4, r: 5 }
        : act === 'in'
          ? { visit: 4, l: 3, r: 5 }
          : { visit: 5, l: 3, r: 4 };
    const sa = () => [
      { label: 'call stack', items: stack.map((id) => s.nodes[id].v), kind: 'stack' as const },
    ];
    const go = (id: string | null) => {
      if (!id) return;
      stack.push(id);
      const visit = () => {
        out.push(s.nodes[id].v);
        done[id] = 'visited';
        P(lines.visit, `Visit ${s.nodes[id].v}: print it.`, id, sa());
      };
      P(2, `Enter ${s.nodes[id].v}.`, id, sa());
      if (act === 'pre') visit();
      P(
        lines.l,
        `Go to the left subtree of ${s.nodes[id].v}${s.nodes[id].c[L] ? '' : ' (nullptr, returns at once)'}.`,
        id,
        sa(),
      );
      go(s.nodes[id].c[L]);
      if (act === 'in') visit();
      P(
        lines.r,
        `Go to the right subtree of ${s.nodes[id].v}${s.nodes[id].c[R] ? '' : ' (nullptr)'}.`,
        id,
        sa(),
      );
      go(s.nodes[id].c[R]);
      if (act === 'post') visit();
      stack.pop();
    };
    go(s.root);
    const name =
      act === 'pre'
        ? 'Preorder (root, left, right)'
        : act === 'in'
          ? 'Inorder (left, root, right): sorted for a BST!'
          : 'Postorder (left, right, root): children before parent, useful for deleting a tree';
    P(6, `${name}: ${out.join(' ')}`, undefined, sa());
    return f;
  },
};

/* ---------------- tree terminology ---------------- */
const termTree = (): TS => ({
  binary: true,
  seq: 9,
  root: 'A',
  nodes: {
    A: { v: 'A', c: ['B', 'C'] },
    B: { v: 'B', c: ['D', 'E'] },
    C: { v: 'C', c: [null, 'F'] },
    D: { v: 'D', c: [null, null] },
    E: { v: 'E', c: ['G', 'H'] },
    F: { v: 'F', c: [null, null] },
    G: { v: 'G', c: [null, null] },
    H: { v: 'H', c: [null, null] },
  },
});
export const treeTerms: Algo<TS> = {
  view: 'tree',
  legend: ['current', 'compare', 'done', 'visited'],
  code: [
    'struct Node {',
    '  int data;',
    '  Node* left;   // nullptr if no left child',
    '  Node* right;  // nullptr if no right child',
    '};',
    'Node* root = nullptr;',
  ],
  init: termTree,
  actions: [{ id: 'run', label: 'Tour' }],
  auto: 'run',
  run: (s) => {
    const steps: [string, Frame['hl'], number?][] = [
      [
        'A tree is a hierarchy: nodes joined by edges, no cycles. Each node has at most one parent.',
        {},
      ],
      [
        'ROOT: the only node with no parent (A). Programs hold a pointer to it.',
        { A: 'current' },
        6,
      ],
      [
        "PARENT & CHILD: B is the parent of D and E. D and E are B's children.",
        { B: 'current', D: 'compare', E: 'compare' },
        3,
      ],
      ['SIBLINGS: nodes with the same parent (G and H).', { G: 'compare', H: 'compare' }],
      [
        'LEAF (external node): no children. Here: D, F, G, H.',
        { D: 'done', F: 'done', G: 'done', H: 'done' },
      ],
      [
        'INTERNAL node: at least one child. A, B, C, E.',
        { A: 'visited', B: 'visited', C: 'visited', E: 'visited' },
      ],
      [
        'DEGREE of a node = number of children. deg(B) = 2, deg(C) = 1. In a binary tree, every degree is ≤ 2.',
        { B: 'current', C: 'compare' },
      ],
      [
        'ANCESTORS of G: E, B, A (everything on the path up to the root). DESCENDANTS of B: D, E, G, H.',
        { G: 'current', E: 'visited', B: 'visited', A: 'visited' },
      ],
      [
        'DEPTH (level) of a node = edges from the root. depth(A) = 0, depth(E) = 2, depth(G) = 3.',
        { A: 'current', E: 'compare', G: 'done' },
      ],
      [
        'HEIGHT of the tree = depth of the deepest leaf = 3 (path A-B-E-G). Some books count nodes instead (4): say which one you use!',
        {
          A: 'visited',
          B: 'visited',
          E: 'visited',
          G: 'done',
          'A-B': 'done',
          'B-E': 'done',
          'E-G': 'done',
        },
      ],
      [
        'SUBTREE: any node plus all its descendants. The subtree rooted at E is {E, G, H}.',
        { E: 'current', G: 'compare', H: 'compare' },
      ],
      [
        'FULL binary tree: every node has 0 or 2 children. Not this one (C has 1). COMPLETE: every level full except maybe the last, filled left to right.',
        { C: 'bad' },
      ],
    ];
    return steps.map(([note, hl, line]) => ({ s, note, hl, line: line ?? 1 }));
  },
};

/* ---------------- general tree → left-child right-sibling ---------------- */
export const generalTree: Algo<TS> = {
  view: 'tree',
  legend: ['current', 'done'],
  code: [
    'struct GNode {',
    '  char data;',
    '  GNode* firstChild;   // leftmost child',
    '  GNode* nextSibling;  // next brother to the right',
    '};',
    'void print(GNode* n, int depth) {   // preorder',
    '  if (n == nullptr) return;',
    '  cout << string(depth * 2, \' \') << n->data << "\\n";',
    '  print(n->firstChild, depth + 1);',
    '  print(n->nextSibling, depth);',
    '}',
  ],
  init: () => ({
    seq: 0,
    root: 'A',
    nodes: {
      A: { v: 'A', c: ['B', 'C', 'D'] },
      B: { v: 'B', c: ['E', 'F'] },
      C: { v: 'C', c: [] },
      D: { v: 'D', c: ['G', 'H', 'I'] },
      E: { v: 'E', c: [] },
      F: { v: 'F', c: [] },
      G: { v: 'G', c: [] },
      H: { v: 'H', c: [] },
      I: { v: 'I', c: [] },
    },
  }),
  actions: [{ id: 'run', label: 'Convert' }],
  auto: 'run',
  run: (s) => {
    const fc: Record<string, string | null> = {
      A: 'B',
      B: 'E',
      C: null,
      D: 'G',
      E: null,
      F: null,
      G: null,
      H: null,
      I: null,
    };
    const ns: Record<string, string | null> = {
      A: null,
      B: 'C',
      C: 'D',
      D: null,
      E: 'F',
      F: null,
      G: 'H',
      H: 'I',
      I: null,
    };
    const all = Object.keys(s.nodes);
    const solid = all.flatMap((p) => s.nodes[p].c.map((k) => ({ a: p, b: k! })));
    const firstOnly = all.filter((p) => fc[p]).map((p) => ({ a: p, b: fc[p]! }));
    const sib = all.filter((p) => ns[p]).map((p) => ({ a: p, b: ns[p]!, dashed: true }));
    const f: TF[] = [
      {
        s: { ...s, edges: solid },
        line: 1,
        note: 'A general tree: A has 3 children, D has 3. How do we store "any number of children" with fixed-size nodes?',
      },
      {
        s: { ...s, edges: solid },
        line: 3,
        note: 'Idea: every node keeps only TWO pointers: its first (leftmost) child and its next sibling.',
        hl: { A: 'current', B: 'done', C: 'compare', D: 'compare' },
      },
      {
        s: { ...s, edges: firstOnly },
        line: 3,
        note: 'Step 1: keep only the edge from each parent to its FIRST child. (A→B, B→E, D→G)',
        hl: Object.fromEntries(firstOnly.map((e) => [`${e.a}-${e.b}`, 'done'])),
      },
      {
        s: { ...s, edges: [...firstOnly, ...sib] },
        line: 4,
        note: 'Step 2: link each node to its NEXT SIBLING (dashed). B→C→D, E→F, G→H→I.',
        hl: Object.fromEntries(sib.map((e) => [`${e.a}-${e.b}`, 'current'])),
      },
    ];
    const bin: TS = {
      seq: 0,
      root: 'A',
      binary: true,
      nodes: Object.fromEntries(all.map((k) => [k, { v: k, c: [fc[k], ns[k]] }])),
    };
    f.push({
      s: bin,
      line: 5,
      note: 'Redraw it: first child = LEFT, next sibling = RIGHT. Any general tree becomes a binary tree! (left = "down a level", right = "same level")',
      hl: { A: 'current' },
    });
    f.push({
      s: bin,
      line: 9,
      note: 'Preorder print walks firstChild (deeper) then nextSibling (same depth): A B E F C D G H I.',
    });
    return f;
  },
};

export const algos = {
  bst,
  'bst-delete': bstDelete,
  traversals,
  'tree-terms': treeTerms,
  'general-tree': generalTree,
};
