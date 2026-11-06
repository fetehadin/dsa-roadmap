import type { Algo, Frame, Role } from '../types';
import { parseNums, clone } from '../types';
import type { ListState, MemoryState } from '../views';

type LS = ListState & { seq: number; tail?: string | null };
type LF = Frame<LS>;

const build = (vals: number[], doubly = false): LS => {
  const nodes: LS['nodes'] = {};
  const ids = vals.map((_, i) => `n${i}`);
  vals.forEach(
    (v, i) =>
      (nodes[ids[i]] = {
        v,
        next: ids[i + 1] ?? null,
        ...(doubly ? { prev: ids[i - 1] ?? null } : {}),
      }),
  );
  return {
    nodes,
    order: ids,
    head: ids[0] ?? null,
    tail: ids[ids.length - 1] ?? null,
    seq: vals.length,
    doubly,
  };
};
const walk = (s: LS) => {
  const out: string[] = [];
  const seen = new Set<string>();
  for (let c = s.head ?? null; c && !seen.has(c); c = s.nodes[c]?.next ?? null) {
    out.push(c);
    seen.add(c);
  }
  return out;
};
const norm = (s: LS): LS => {
  const n = clone(s);
  n.order = walk(n);
  n.float = undefined;
  for (const id of Object.keys(n.nodes)) if (!n.order.includes(id)) delete n.nodes[id];
  n.tail = n.order[n.order.length - 1] ?? null;
  return n;
};

function recorder(s0: LS) {
  const s = clone(s0);
  const frames: LF[] = [];
  const push = (line: number, note: string, ptr: LF['ptr'] = {}, hl: LF['hl'] = {}) =>
    frames.push({
      s: clone(s),
      line,
      note,
      ptr: { head: s.head, ...(s.doubly ? { tail: s.tail } : {}), ...ptr },
      hl,
      vars: { length: walk(s).length },
    });
  const fresh = (v: number) => {
    const id = `n${s.seq++}`;
    s.nodes[id] = { v, next: null, ...(s.doubly ? { prev: null } : {}) };
    return id;
  };
  return { s, frames, push, fresh };
}

const CODE = {
  front: [
    'void insertFront(Node*& head, int x) {',
    '  Node* n = new Node{x, nullptr};',
    '  n->next = head;',
    '  head = n;',
    '}',
  ],
  end: [
    'void insertEnd(Node*& head, int x) {',
    '  Node* n = new Node{x, nullptr};',
    '  if (head == nullptr) { head = n; return; }',
    '  Node* temp = head;',
    '  while (temp->next != nullptr)',
    '    temp = temp->next;',
    '  temp->next = n;',
    '}',
  ],
  at: [
    'void insertAt(Node*& head, int pos, int x) {',
    '  if (pos == 0) { insertFront(head, x); return; }',
    '  Node* temp = head;',
    '  for (int i = 0; i < pos - 1 && temp != nullptr; i++)',
    '    temp = temp->next;',
    '  if (temp == nullptr) return;  // position too big',
    '  Node* n = new Node{x, temp->next};',
    '  temp->next = n;',
    '}',
  ],
  del: [
    'void deleteValue(Node*& head, int x) {',
    '  if (head == nullptr) return;',
    '  if (head->data == x) {',
    '    Node* temp = head;',
    '    head = head->next;',
    '    delete temp;',
    '    return;',
    '  }',
    '  Node* prev = head;',
    '  while (prev->next != nullptr && prev->next->data != x)',
    '    prev = prev->next;',
    '  if (prev->next == nullptr) return;  // not found',
    '  Node* temp = prev->next;',
    '  prev->next = temp->next;',
    '  delete temp;',
    '}',
  ],
  dummy: [
    'void deleteDummy(Node*& head, int x) {',
    '  Node dummy{0, head};         // dummy -> head',
    '  Node* prev = &dummy;',
    '  while (prev->next != nullptr && prev->next->data != x)',
    '    prev = prev->next;',
    '  if (prev->next != nullptr) {',
    '    Node* temp = prev->next;',
    '    prev->next = temp->next;',
    '    delete temp;',
    '  }',
    '  head = dummy.next;           // head may have changed',
    '}',
  ],
  search: [
    'bool search(Node* head, int x) {',
    '  Node* temp = head;',
    '  while (temp != nullptr) {',
    '    if (temp->data == x) return true;',
    '    temp = temp->next;',
    '  }',
    '  return false;',
    '}',
  ],
};

function insertFront(st: LS, v: number): LF[] {
  const { s, frames, push, fresh } = recorder(st);
  const n = fresh(v);
  s.float = { id: n, at: 0 };
  push(
    2,
    `new Node{${v}} is created on the heap. Nothing points to it yet.`,
    { n },
    { [n]: 'swap' },
  );
  s.nodes[n].next = s.head ?? null;
  push(
    3,
    s.head
      ? `n->next = head: the new node now points at ${s.nodes[s.head].v}. Do this FIRST, or you lose the list!`
      : 'n->next = head (which is nullptr: the list was empty).',
    { n },
    { [n]: 'swap', [`${n}>`]: 'current' },
  );
  s.head = n;
  push(
    4,
    'head = n. The new node is the front. O(1): no traversal needed.',
    { n },
    { [n]: 'done' },
  );
  const fin = norm(s);
  frames.push({
    s: fin,
    line: 5,
    note: `List: ${
      walk(fin)
        .map((i) => fin.nodes[i].v)
        .join(' → ') || 'empty'
    }.`,
    ptr: { head: fin.head },
  });
  return frames;
}

function insertEnd(st: LS, v: number): LF[] {
  const { s, frames, push, fresh } = recorder(st);
  const len = walk(s).length;
  const n = fresh(v);
  s.float = { id: n, at: Math.max(0, len) };
  push(2, `Create node ${v}.`, { n }, { [n]: 'swap' });
  if (!s.head) {
    s.head = n;
    push(3, 'The list was empty, so head = n.', { n }, { [n]: 'done' });
  } else {
    let t = s.head;
    push(
      4,
      'temp = head. Walk to the last node (the one whose next is nullptr).',
      { temp: t, n },
      { [t]: 'current' },
    );
    while (s.nodes[t].next) {
      t = s.nodes[t].next!;
      push(6, `temp = temp->next → ${s.nodes[t].v}.`, { temp: t, n }, { [t]: 'current' });
    }
    s.nodes[t].next = n;
    push(
      7,
      `temp->next = n. Linked! Walking there cost O(n). (Keeping a tail pointer makes this O(1).)`,
      { temp: t, n },
      { [`${t}>`]: 'current', [n]: 'done' },
    );
  }
  const fin = norm(s);
  frames.push({
    s: fin,
    line: 8,
    note: `List: ${walk(fin)
      .map((i) => fin.nodes[i].v)
      .join(' → ')}.`,
    ptr: { head: fin.head },
  });
  return frames;
}

function insertAt(st: LS, v: number, pos: number): LF[] {
  if (pos === 0) return insertFront(st, v);
  const { s, frames, push, fresh } = recorder(st);
  let t: string | null = s.head ?? null;
  push(
    3,
    `Insert ${v} at position ${pos}: stop at the node BEFORE it (position ${pos - 1}).`,
    { temp: t },
    t ? { [t]: 'current' } : {},
  );
  for (let i = 0; i < pos - 1 && t; i++) {
    t = s.nodes[t].next;
    push(
      5,
      t ? `temp moves to ${s.nodes[t].v} (position ${i + 1}).` : 'temp became nullptr.',
      { temp: t },
      t ? { [t]: 'current' } : {},
    );
  }
  if (!t) {
    push(6, `Position ${pos} is past the end of the list, so nothing is inserted.`, {}, {});
    return frames;
  }
  const n = fresh(v);
  s.float = { id: n, at: walk(s).indexOf(t) + 0.5 };
  s.nodes[n].next = s.nodes[t].next;
  push(
    7,
    `new Node{${v}, temp->next}: the new node points at ${s.nodes[n].next ? s.nodes[s.nodes[n].next!].v : 'nullptr'} first.`,
    { temp: t, n },
    { [n]: 'swap', [`${n}>`]: 'current' },
  );
  s.nodes[t].next = n;
  push(
    8,
    `temp->next = n. The chain now goes ${s.nodes[t].v} → ${v} → … Order of these two lines matters!`,
    { temp: t, n },
    { [`${t}>`]: 'current', [n]: 'done' },
  );
  const fin = norm(s);
  frames.push({
    s: fin,
    line: 9,
    note: `List: ${walk(fin)
      .map((i) => fin.nodes[i].v)
      .join(' → ')}.`,
    ptr: { head: fin.head },
  });
  return frames;
}

function deleteValue(st: LS, v: number, dummy = false): LF[] {
  const { s, frames, push } = recorder(st);
  const L = dummy
    ? { start: 2, walk: 5, unlink: 8, del: 9, head: 11, nf: 6 }
    : { start: 9, walk: 11, unlink: 14, del: 15, head: 5, nf: 12 };
  if (!s.head) {
    push(2, 'Empty list: nothing to delete. Always check for nullptr first!');
    return frames;
  }
  if (!dummy && s.nodes[s.head].v === v) {
    const t = s.head;
    push(4, `The head holds ${v}. Special case: temp = head.`, { temp: t }, { [t]: 'swap' });
    s.head = s.nodes[t].next;
    push(
      5,
      'head = head->next. Move head BEFORE deleting, or the list is lost.',
      { temp: t },
      { [t]: 'swap' },
    );
    s.order = s.order.filter((x) => x !== t);
    s.float = { id: t, at: 0 };
    push(6, `delete temp frees node ${v}.`, { temp: t }, { [t]: 'dim' });
  } else {
    let prev: string;
    if (dummy) {
      prev = 'dummy';
      s.nodes.dummy = { v: 'D', next: s.head };
      s.order = ['dummy', ...s.order];
      push(
        2,
        'Make a dummy node that points at head. Now even the first real node has a "previous" node: no special case.',
        { prev },
        { dummy: 'visited' },
      );
    } else {
      prev = s.head;
      push(
        L.start,
        'prev = head. We need the node BEFORE the target, because that is the arrow we must change.',
        { prev },
        { [prev]: 'current' },
      );
    }
    while (s.nodes[prev].next && s.nodes[s.nodes[prev].next!].v !== v) {
      prev = s.nodes[prev].next!;
      push(L.walk, `prev → ${s.nodes[prev].v}.`, { prev }, { [prev]: 'current' });
    }
    const t = s.nodes[prev].next;
    if (!t) {
      push(L.nf, `${v} not found. List unchanged.`, { prev }, {});
      if (dummy)
        return [...frames, { s: norm(st), line: 11, note: 'Unchanged.', ptr: { head: st.head } }];
      return frames;
    }
    push(
      L.unlink - 1,
      `temp = prev->next (the node with ${v}).`,
      { prev, temp: t },
      { [prev]: 'current', [t]: 'swap' },
    );
    s.nodes[prev].next = s.nodes[t].next;
    s.order = s.order.filter((x) => x !== t);
    s.float = { id: t, at: s.order.indexOf(prev) + 0.5 };
    push(
      L.unlink,
      `prev->next = temp->next: the arrow skips over ${v}.`,
      { prev, temp: t },
      { [`${prev}>`]: 'current', [t]: 'swap' },
    );
    push(
      L.del,
      `delete temp. Without this line the node leaks.`,
      { prev, temp: t },
      { [t]: 'dim' },
    );
    if (dummy) {
      s.head = s.nodes.dummy.next;
      delete s.nodes.dummy;
      s.order = s.order.filter((x) => x !== 'dummy');
      push(
        L.head,
        'head = dummy.next. If we deleted the first node, head is updated automatically.',
        {},
        {},
      );
    }
  }
  const fin = norm(s);
  frames.push({
    s: fin,
    line: dummy ? 12 : 16,
    note: `List: ${
      walk(fin)
        .map((i) => fin.nodes[i].v)
        .join(' → ') || 'empty'
    }.`,
    ptr: { head: fin.head },
  });
  return frames;
}

function search(st: LS, v: number): LF[] {
  const { s, push } = recorder(st);
  const frames: LF[] = [];
  const p = (line: number, note: string, ptr: LF['ptr'], hl: LF['hl']) =>
    frames.push({ s: clone(s), line, note, ptr: { head: s.head, ...ptr }, hl });
  let t = s.head ?? null;
  const seen: Record<string, Role> = {};
  p(2, 'temp = head.', { temp: t }, {});
  let k = 0;
  while (t) {
    k++;
    const hit = s.nodes[t].v === v;
    p(
      4,
      `temp->data = ${s.nodes[t].v} ${hit ? '== ' + v + ': found!' : '≠ ' + v}`,
      { temp: t },
      { ...seen, [t]: hit ? 'found' : 'compare' },
    );
    if (hit) return frames;
    seen[t] = 'visited';
    t = s.nodes[t].next;
    p(5, 'temp = temp->next.', { temp: t }, { ...seen, ...(t ? { [t]: 'current' } : {}) });
  }
  void push;
  p(
    7,
    `temp is nullptr: ${v} is not in the list (${k} nodes checked). No random access: search is O(n).`,
    {},
    seen,
  );
  return frames;
}

export const sll: Algo<LS> = {
  view: 'list',
  legend: ['current', 'swap', 'done', 'compare', 'visited'],
  code: CODE.front,
  input: { label: 'Start list', def: '12, 7, 31, 4' },
  init: (s) => build(parseNums(s, 7)),
  actions: [
    { id: 'front', label: 'Insert front', value: true, def: 9, code: CODE.front },
    { id: 'end', label: 'Insert end', value: true, code: CODE.end },
    { id: 'at', label: 'Insert at pos', value: true, pos: true, code: CODE.at },
    { id: 'del', label: 'Delete', value: true, code: CODE.del },
    { id: 'dummy', label: 'Delete (dummy)', value: true, code: CODE.dummy },
    { id: 'search', label: 'Search', value: true, code: CODE.search },
  ],
  run: (s, a, v = 0, pos = 1) => {
    if ((a === 'front' || a === 'end' || a === 'at') && walk(s).length >= 8)
      return [{ s, note: 'The demo holds 8 nodes max. Delete one first.', ptr: { head: s.head } }];
    switch (a) {
      case 'front':
        return insertFront(s, v);
      case 'end':
        return insertEnd(s, v);
      case 'at':
        return insertAt(s, v, pos);
      case 'del':
        return deleteValue(s, v);
      case 'dummy':
        return deleteValue(s, v, true);
      default:
        return search(s, v);
    }
  },
};

/* ---------------- doubly linked list ---------------- */
const DCODE = {
  front: [
    'void insertFront(DNode*& head, DNode*& tail, int x) {',
    '  DNode* n = new DNode{x, nullptr, head}; // data, prev, next',
    '  if (head != nullptr) head->prev = n;',
    '  else tail = n;',
    '  head = n;',
    '}',
  ],
  end: [
    'void insertEnd(DNode*& head, DNode*& tail, int x) {',
    '  DNode* n = new DNode{x, tail, nullptr};',
    '  if (tail != nullptr) tail->next = n;',
    '  else head = n;',
    '  tail = n;',
    '}',
  ],
  del: [
    'void deleteValue(DNode*& head, DNode*& tail, int x) {',
    '  DNode* cur = head;',
    '  while (cur != nullptr && cur->data != x) cur = cur->next;',
    '  if (cur == nullptr) return;',
    '  if (cur->prev) cur->prev->next = cur->next;',
    '  else head = cur->next;',
    '  if (cur->next) cur->next->prev = cur->prev;',
    '  else tail = cur->prev;',
    '  delete cur;',
    '}',
  ],
  back: [
    'void printBackward(DNode* tail) {',
    '  for (DNode* cur = tail; cur != nullptr; cur = cur->prev)',
    '    cout << cur->data << " ";',
    '}',
  ],
};
export const dll: Algo<LS> = {
  view: 'list',
  legend: ['current', 'swap', 'done', 'visited'],
  code: DCODE.front,
  input: { label: 'Start list', def: '10, 20, 30' },
  init: (s) => build(parseNums(s, 6), true),
  actions: [
    { id: 'front', label: 'Insert front', value: true, def: 5, code: DCODE.front },
    { id: 'end', label: 'Insert end', value: true, code: DCODE.end },
    { id: 'del', label: 'Delete', value: true, code: DCODE.del },
    { id: 'back', label: 'Print backward', code: DCODE.back },
  ],
  run: (st, a, v = 0) => {
    const { s, frames, push, fresh } = recorder(st);
    const fin = () => {
      const f = norm(s);
      frames.push({
        s: f,
        line: 1,
        note: `head → ${
          walk(f)
            .map((i) => f.nodes[i].v)
            .join(' ⇄ ') || 'empty'
        } ← tail`,
        ptr: { head: f.head, tail: f.tail },
      });
      return frames;
    };
    if (a !== 'del' && a !== 'back' && walk(s).length >= 7)
      return [{ s, note: 'Demo limit: 7 nodes.', ptr: { head: s.head, tail: s.tail } }];
    if (a === 'front') {
      const n = fresh(v);
      s.float = { id: n, at: 0 };
      s.nodes[n].next = s.head ?? null;
      push(
        2,
        `New node: prev = nullptr, next = head.`,
        { n },
        { [n]: 'swap', [`${n}>`]: 'current' },
      );
      if (s.head) {
        s.nodes[s.head].prev = n;
        push(
          3,
          'head->prev = n: the old head points back at the new node. Two arrows to fix, not one.',
          { n },
          { [`${s.head}<`]: 'current' },
        );
      } else {
        s.tail = n;
        push(4, 'Empty list: the new node is also the tail.', { n }, { [n]: 'swap' });
      }
      s.head = n;
      push(5, 'head = n.', { n }, { [n]: 'done' });
      return fin();
    }
    if (a === 'end') {
      const n = fresh(v);
      s.float = { id: n, at: walk(s).length };
      s.nodes[n].prev = s.tail ?? null;
      push(
        2,
        'New node: prev = tail, next = nullptr. With a tail pointer this is O(1).',
        { n },
        { [n]: 'swap', [`${n}<`]: 'current' },
      );
      if (s.tail) {
        s.nodes[s.tail].next = n;
        push(3, 'tail->next = n.', { n }, { [`${s.tail}>`]: 'current' });
      } else {
        s.head = n;
        push(4, 'Empty list: head = n too.', { n }, {});
      }
      s.tail = n;
      push(5, 'tail = n.', { n }, { [n]: 'done' });
      return fin();
    }
    if (a === 'back') {
      let c = s.tail ?? null;
      const out: (string | number)[] = [];
      const seen: Record<string, Role> = {};
      while (c) {
        out.push(s.nodes[c].v);
        frames.push({
          s: clone(s),
          line: 3,
          note: `Print ${s.nodes[c].v}, then follow prev.`,
          ptr: { head: s.head, tail: s.tail, cur: c },
          hl: { ...seen, [c]: 'current' },
          aux: [{ label: 'output', items: [...out] }],
        });
        seen[c] = 'visited';
        c = s.nodes[c].prev ?? null;
      }
      frames.push({
        s: clone(s),
        line: 2,
        note: 'cur is nullptr: done. A singly linked list cannot do this without extra memory.',
        ptr: { head: s.head, tail: s.tail },
        hl: seen,
        aux: [{ label: 'output', items: out }],
      });
      return frames;
    }
    let c = s.head ?? null;
    push(2, 'cur = head.', { cur: c }, c ? { [c]: 'current' } : {});
    while (c && s.nodes[c].v !== v) {
      c = s.nodes[c].next;
      push(
        3,
        c ? `cur → ${s.nodes[c].v}.` : 'Reached nullptr.',
        { cur: c },
        c ? { [c]: 'current' } : {},
      );
    }
    if (!c) {
      push(4, `${v} not found.`);
      return frames;
    }
    const { prev, next } = s.nodes[c];
    if (prev) {
      s.nodes[prev].next = next;
      push(5, `cur->prev->next = cur->next.`, { cur: c }, { [c]: 'swap', [`${prev}>`]: 'current' });
    } else {
      s.head = next;
      push(6, 'cur was the head: head = cur->next.', { cur: c }, { [c]: 'swap' });
    }
    if (next) {
      s.nodes[next].prev = prev ?? null;
      push(7, 'cur->next->prev = cur->prev.', { cur: c }, { [c]: 'swap', [`${next}<`]: 'current' });
    } else {
      s.tail = prev ?? null;
      push(8, 'cur was the tail: tail = cur->prev.', { cur: c }, { [c]: 'swap' });
    }
    s.order = s.order.filter((x) => x !== c);
    s.float = { id: c, at: Math.max(0, s.order.indexOf(prev ?? '') + 0.5) };
    push(
      9,
      `delete cur. No "prev" pointer to track: the node knows its own neighbours.`,
      {},
      { [c]: 'dim' },
    );
    return fin();
  },
};

/* ---------------- fast & slow ---------------- */
export const fastSlow: Algo<LS> = {
  view: 'list',
  legend: ['current', 'visited', 'found'],
  code: [
    'Node* middle(Node* head) {',
    '  Node* slow = head;',
    '  Node* fast = head;',
    '  while (fast != nullptr && fast->next != nullptr) {',
    '    slow = slow->next;          // 1 step',
    '    fast = fast->next->next;    // 2 steps',
    '  }',
    '  return slow;',
    '}',
  ],
  input: { label: 'List', def: '1, 2, 3, 4, 5, 6, 7' },
  init: (s) => build(parseNums(s, 8)),
  actions: [
    { id: 'mid', label: 'Find middle' },
    {
      id: 'cycle',
      label: 'Detect cycle',
      code: [
        'bool hasCycle(Node* head) {',
        '  Node* slow = head;',
        '  Node* fast = head;',
        '  while (fast != nullptr && fast->next != nullptr) {',
        '    slow = slow->next;',
        '    fast = fast->next->next;',
        '    if (slow == fast) return true;  // they met',
        '  }',
        '  return false;',
        '}',
      ],
    },
    {
      id: 'nth',
      label: 'Nth from end',
      value: true,
      def: 2,
      code: [
        'Node* nthFromEnd(Node* head, int n) {',
        '  Node* fast = head;',
        '  Node* slow = head;',
        '  for (int i = 0; i < n; i++) {',
        '    if (fast == nullptr) return nullptr;',
        '    fast = fast->next;           // n steps ahead',
        '  }',
        '  while (fast != nullptr) {',
        '    slow = slow->next;',
        '    fast = fast->next;',
        '  }',
        '  return slow;',
        '}',
      ],
    },
  ],
  run: (st0, a, v = 2) => {
    const st = norm({
      ...st0,
      nodes: Object.fromEntries(Object.entries(st0.nodes).map(([k, n]) => [k, { ...n }])),
    });
    const ids = walk(st);
    if (ids.length === 0) return [{ s: st, note: 'Empty list.' }];
    const frames: LF[] = [];
    const push = (s: LS, line: number, note: string, ptr: LF['ptr'], hl: LF['hl'] = {}) =>
      frames.push({ s: clone(s), line, note, ptr: { head: s.head, ...ptr }, hl });
    if (a === 'mid') {
      let slow = st.head!,
        fast: string | null = st.head!;
      push(
        st,
        3,
        'Both start at head. fast moves twice as fast as slow.',
        { slow, fast },
        { [slow]: 'current' },
      );
      while (fast && st.nodes[fast].next) {
        slow = st.nodes[slow].next!;
        fast = st.nodes[st.nodes[fast].next!].next;
        push(
          st,
          6,
          fast ? 'slow +1, fast +2.' : 'slow +1, fast +2 → fast fell off the end.',
          { slow, fast },
          { [slow]: 'current' },
        );
      }
      push(
        st,
        8,
        `When fast reaches the end, slow is in the middle: ${st.nodes[slow].v}. One pass, O(1) extra space.`,
        { slow },
        { [slow]: 'found' },
      );
      return frames;
    }
    if (a === 'nth') {
      let fast: string | null = st.head!;
      let slow = st.head!;
      push(st, 3, `Give fast a head start of n = ${v} nodes.`, { slow, fast });
      for (let i = 0; i < v; i++) {
        if (!fast) {
          push(st, 5, `The list is shorter than ${v}.`, {});
          return frames;
        }
        fast = st.nodes[fast].next;
        push(st, 6, `fast moves ahead (${i + 1}/${v}).`, { slow, fast });
      }
      while (fast) {
        slow = st.nodes[slow].next!;
        fast = st.nodes[fast].next;
        push(st, 10, 'Move both by one. The gap between them stays n.', { slow, fast });
      }
      push(
        st,
        12,
        `fast is past the end, so slow is ${v} from the end: ${st.nodes[slow].v}.`,
        { slow },
        { [slow]: 'found' },
      );
      return frames;
    }
    const cyc = clone(st);
    const target = ids[Math.min(2, ids.length - 1)];
    cyc.nodes[ids[ids.length - 1]].next = target;
    push(
      cyc,
      1,
      `Make a cycle: the last node now points back to ${cyc.nodes[target].v}. A normal traversal would loop forever.`,
      {},
      { [`${ids[ids.length - 1]}>`]: 'swap' },
    );
    let slow = cyc.head!,
      fast = cyc.head!;
    for (let k = 0; k < 40; k++) {
      slow = cyc.nodes[slow].next!;
      fast = cyc.nodes[cyc.nodes[fast].next!].next!;
      if (slow === fast) {
        push(
          cyc,
          7,
          `slow and fast meet at ${cyc.nodes[slow].v}: there IS a cycle (Floyd's tortoise and hare).`,
          { 'slow=fast': slow },
          { [slow]: 'found' },
        );
        return frames;
      }
      push(
        cyc,
        6,
        'slow +1, fast +2. Inside a loop, fast gains 1 step per round, so it must catch slow.',
        { slow, fast },
        { [slow]: 'current', [fast]: 'visited' },
      );
    }
    return frames;
  },
};

/* ---------------- stack vs heap memory ---------------- */
export const stackHeap: Algo<MemoryState> = {
  view: 'memory',
  legend: ['current', 'swap'],
  code: [
    'int main() {',
    '  int x = 5;',
    '  int* p = &x;',
    '  *p = 10;',
    '  int* q = new int(42);',
    '  delete q;',
    '  q = nullptr;',
    '  int* r = new int(7);',
    '  r = new int(8);   // 7 is now unreachable',
    '  delete r;',
    '}',
  ],
  init: () => ({ stack: [], heap: [] }),
  actions: [{ id: 'run', label: 'Run' }],
  auto: 'run',
  run: () => {
    const s: MemoryState = { stack: [], heap: [] };
    const f: Frame<MemoryState>[] = [];
    const push = (line: number, note: string, hl: Frame['hl'] = {}) =>
      f.push({ s: clone(s), line, note, hl });
    push(
      1,
      'main() starts. Its local variables live on the STACK and disappear automatically when it returns.',
    );
    s.stack.push({ name: 'x', val: '5' });
    push(2, 'x is a normal local variable: stack.', { x: 'swap' });
    s.stack.push({ name: 'p', val: '&x' });
    push(3, 'p stores the ADDRESS of x. A pointer is just a variable that holds an address.', {
      p: 'current',
      x: 'current',
    });
    s.stack[0].val = '10';
    push(4, '*p = 10 dereferences p: "go to the address in p and write 10". x is now 10.', {
      x: 'swap',
    });
    s.heap.push({ addr: '0xA0', val: '42' });
    s.stack.push({ name: 'q', val: '0xA0' });
    push(
      5,
      'new int(42) asks the HEAP for memory and returns its address. Heap memory lives until YOU delete it.',
      { q: 'current', '0xA0': 'swap' },
    );
    s.heap[0].state = 'freed';
    push(6, 'delete q gives the memory back. q still holds 0xA0: a dangling pointer!', {
      q: 'bad',
    });
    s.stack[2].val = 'nullptr';
    push(7, 'q = nullptr. Now any accidental use is easy to detect (if (q != nullptr)).', {
      q: 'current',
    });
    s.heap.push({ addr: '0xB0', val: '7' });
    s.stack.push({ name: 'r', val: '0xB0' });
    push(8, 'r points to a new int on the heap.', { r: 'current', '0xB0': 'swap' });
    s.heap.push({ addr: '0xC0', val: '8' });
    s.stack[3].val = '0xC0';
    s.heap[1].state = 'leaked';
    push(
      9,
      'r now points to a NEW int. Nobody holds 0xB0 any more, and it can never be deleted: a memory leak.',
      { r: 'current', '0xC0': 'swap', '0xB0': 'bad' },
    );
    s.heap[2].state = 'freed';
    push(10, 'delete r frees 0xC0, but 0xB0 stays lost until the program ends.', {});
    s.stack = [];
    push(
      11,
      'main returns: the stack frame vanishes automatically. Rule: every new needs exactly one delete.',
      {},
    );
    return f;
  },
};

export const algos = {
  sll,
  dll,
  'fast-slow': fastSlow,
  'stack-heap': stackHeap,
};
