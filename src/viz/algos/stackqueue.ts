import type { Algo, Frame, Role } from '../types';
import { parseNums, clone } from '../types';
import type { ArrayState, ListState, RingState, StackState } from '../views';

/* ---------------- array stack ---------------- */
const MAX = 5;
export const stackArray: Algo<StackState> = {
  view: 'stack',
  legend: ['swap', 'current', 'bad'],
  code: [
    'const int MAX = 5;',
    'int st[MAX]; int top = -1;',
    'void push(int x) {',
    '  if (top == MAX - 1) { cout << "Overflow"; return; }',
    '  st[++top] = x;',
    '}',
    'int pop() {',
    '  if (top == -1) { cout << "Underflow"; return -1; }',
    '  return st[top--];',
    '}',
    'int peek() { return st[top]; }',
    'bool isEmpty() { return top == -1; }',
    'bool isFull()  { return top == MAX - 1; }',
  ],
  init: () => ({ items: [3, 8], cap: MAX }),
  actions: [
    { id: 'push', label: 'push(x)', value: true, def: 5 },
    { id: 'pop', label: 'pop()' },
    { id: 'peek', label: 'peek()' },
    { id: 'empty', label: 'isEmpty()' },
    { id: 'full', label: 'isFull()' },
  ],
  run: (s0, a, v) => {
    const s = clone(s0);
    const top = s.items.length - 1;
    const F = (line: number, note: string, hl: Frame['hl'] = {}): Frame<StackState> => ({
      s: clone(s),
      line,
      note,
      hl,
      vars: { top: s.items.length - 1 },
    });
    switch (a) {
      case 'push':
        if (top === MAX - 1)
          return [
            F(
              4,
              `Overflow! top = ${top} = MAX - 1, the array is full. Check before writing, or you write past the array.`,
              { [top]: 'bad' },
            ),
          ];
        s.items.push(v!);
        return [
          F(5, `st[++top] = ${v}: top becomes ${top + 1}, then write. O(1).`, {
            [top + 1]: 'swap',
          }),
        ];
      case 'pop': {
        if (top < 0)
          return [
            F(8, 'Underflow! top == -1 means the stack is empty. Popping now is the #1 stack bug.'),
          ];
        const x = s.items[top];
        const f1 = F(9, `Return st[top] = ${x}...`, { [top]: 'swap' });
        s.items.pop();
        return [
          f1,
          F(
            9,
            `...then top-- (now ${top - 1}). The old value is still in memory but no longer part of the stack.`,
          ),
        ];
      }
      case 'peek':
        if (top < 0)
          return [
            F(
              11,
              'peek() on an empty stack would read st[-1]: undefined behaviour. Check isEmpty() first!',
            ),
          ];
        return [
          F(11, `peek() = ${s.items[top]}. Looks at the top without removing it.`, {
            [top]: 'current',
          }),
        ];
      case 'empty':
        return [F(12, `isEmpty() → ${top === -1} (top = ${top}).`)];
      default:
        return [F(13, `isFull() → ${top === MAX - 1} (top = ${top}, MAX - 1 = ${MAX - 1}).`)];
    }
  },
};

/* ---------------- linked stack / queue ---------------- */
type LS = ListState & { seq: number };
const lsFrom = (vals: number[]): LS => {
  const nodes: LS['nodes'] = {};
  vals.forEach((v, i) => (nodes[`n${i}`] = { v, next: i < vals.length - 1 ? `n${i + 1}` : null }));
  return {
    nodes,
    order: vals.map((_, i) => `n${i}`),
    head: vals.length ? 'n0' : null,
    seq: vals.length,
  };
};
const lsNorm = (s: LS): LS => {
  const n = clone(s);
  const o: string[] = [];
  for (let c = n.head ?? null; c; c = n.nodes[c].next) o.push(c);
  n.order = o;
  n.float = undefined;
  for (const k of Object.keys(n.nodes)) if (!o.includes(k)) delete n.nodes[k];
  return n;
};

export const stackList: Algo<LS> = {
  view: 'list',
  legend: ['swap', 'current', 'done'],
  code: [
    'struct Node { int data; Node* next; };',
    'Node* top = nullptr;',
    'void push(int x) {',
    '  Node* n = new Node{x, top};',
    '  top = n;',
    '}',
    'int pop() {',
    '  if (top == nullptr) { cout << "Underflow"; return -1; }',
    '  Node* temp = top;',
    '  int x = temp->data;',
    '  top = top->next;',
    '  delete temp;',
    '  return x;',
    '}',
  ],
  init: () => lsFrom([8, 3]),
  actions: [
    { id: 'push', label: 'push(x)', value: true, def: 5 },
    { id: 'pop', label: 'pop()' },
  ],
  run: (s0, a, v) => {
    const s = clone(s0);
    const f: Frame<LS>[] = [];
    const P = (line: number, note: string, ptr: Frame['ptr'] = {}, hl: Frame['hl'] = {}) =>
      f.push({ s: clone(s), line, note, ptr: { top: s.head, ...ptr }, hl });
    if (a === 'push') {
      if (s.order.length >= 7)
        return [
          {
            s,
            note: 'Demo limit reached. A linked stack never overflows in theory: it grows until the heap runs out.',
          },
        ];
      const id = `n${s.seq++}`;
      s.nodes[id] = { v: v!, next: s.head ?? null };
      s.float = { id, at: 0 };
      P(
        4,
        `new Node{${v}, top}: the new node points at the current top. No size limit, no isFull().`,
        { n: id },
        { [id]: 'swap', [`${id}>`]: 'current' },
      );
      s.head = id;
      P(5, 'top = n. Push = insert at the front of a linked list. O(1).', {}, { [id]: 'done' });
      const fin = lsNorm(s);
      f.push({ s: fin, line: 6, note: 'Done.', ptr: { top: fin.head } });
      return f;
    }
    if (!s.head) return [{ s, line: 8, note: 'Underflow: top is nullptr.', ptr: { top: null } }];
    const t = s.head;
    P(9, 'temp = top.', { temp: t }, { [t]: 'swap' });
    s.head = s.nodes[t].next;
    s.order = s.order.filter((x) => x !== t);
    s.float = { id: t, at: 0 };
    P(11, `top = top->next. Value ${s.nodes[t].v} saved in x.`, { temp: t }, { [t]: 'swap' });
    P(12, 'delete temp, return x. Pop = delete at the front. O(1).', {}, { [t]: 'dim' });
    const fin = lsNorm(s);
    f.push({ s: fin, line: 13, note: `Returned ${s0.nodes[t].v}.`, ptr: { top: fin.head } });
    return f;
  },
};

export const queueList: Algo<LS> = {
  view: 'list',
  legend: ['swap', 'current', 'done'],
  code: [
    'Node* front = nullptr; Node* rear = nullptr;',
    'void enqueue(int x) {',
    '  Node* n = new Node{x, nullptr};',
    '  if (rear == nullptr) { front = rear = n; return; }',
    '  rear->next = n;',
    '  rear = n;',
    '}',
    'int dequeue() {',
    '  if (front == nullptr) { cout << "Empty"; return -1; }',
    '  Node* temp = front;',
    '  int x = temp->data;',
    '  front = front->next;',
    '  if (front == nullptr) rear = nullptr;',
    '  delete temp;',
    '  return x;',
    '}',
  ],
  init: () => lsFrom([4, 9]),
  actions: [
    { id: 'enq', label: 'enqueue(x)', value: true, def: 6 },
    { id: 'deq', label: 'dequeue()' },
  ],
  run: (s0, a, v) => {
    const s = clone(s0);
    const f: Frame<LS>[] = [];
    const rear = () => s.order[s.order.length - 1] ?? null;
    const P = (line: number, note: string, ptr: Frame['ptr'] = {}, hl: Frame['hl'] = {}) =>
      f.push({ s: clone(s), line, note, ptr: { front: s.head, rear: rear(), ...ptr }, hl });
    if (a === 'enq') {
      if (s.order.length >= 7) return [{ s, note: 'Demo limit: 7 nodes.' }];
      const id = `n${s.seq++}`;
      s.nodes[id] = { v: v!, next: null };
      s.float = { id, at: s.order.length };
      P(3, `Create node ${v}.`, { n: id }, { [id]: 'swap' });
      const r = rear();
      if (!r) {
        s.head = id;
        s.order = [id];
        s.float = undefined;
        P(4, 'Queue was empty: front = rear = n.', {}, { [id]: 'done' });
      } else {
        s.nodes[r].next = id;
        P(5, 'rear->next = n.', { n: id }, { [`${r}>`]: 'current' });
        s.order.push(id);
        s.float = undefined;
        P(
          6,
          'rear = n. Enqueue at the back: O(1) thanks to the rear pointer.',
          {},
          { [id]: 'done' },
        );
      }
      return f;
    }
    if (!s.head)
      return [
        { s, line: 9, note: 'Empty queue: nothing to dequeue.', ptr: { front: null, rear: null } },
      ];
    const t = s.head;
    P(10, 'temp = front.', { temp: t }, { [t]: 'swap' });
    s.head = s.nodes[t].next;
    s.order = s.order.filter((x) => x !== t);
    s.float = { id: t, at: 0 };
    P(
      12,
      s.head
        ? 'front = front->next.'
        : 'front = nullptr, so rear must be reset too (line 13). Forgetting this is a classic bug.',
      { temp: t },
      { [t]: 'swap' },
    );
    const fin = lsNorm(s);
    f.push({
      s: fin,
      line: 14,
      note: `delete temp, return ${s0.nodes[t].v}. Dequeue from the front: O(1).`,
      ptr: { front: fin.head, rear: fin.order[fin.order.length - 1] ?? null },
    });
    return f;
  },
};

/* ---------------- array queues ---------------- */
type QA = ArrayState & { front: number; rear: number };
const QN = 6;
const qrow = (
  a: (string | number | null)[],
  hl: Record<number, Role> = {},
  front?: number,
  rear?: number,
) => ({
  rows: [
    {
      a: [...a],
      hl,
      ptr: {
        ...(front !== undefined && front <= (rear ?? -1) ? { front } : {}),
        ...(rear !== undefined && rear >= 0 ? { rear } : {}),
      },
    },
  ],
});

export const queueNaive: Algo<QA> = {
  view: 'array',
  legend: ['swap', 'compare'],
  code: [
    'int q[MAX]; int rear = -1;',
    'void enqueue(int x) {',
    '  if (rear == MAX - 1) { cout << "Full"; return; }',
    '  q[++rear] = x;',
    '}',
    'int dequeue() {          // naive: O(n)',
    '  int x = q[0];',
    '  for (int i = 0; i < rear; i++)',
    '    q[i] = q[i + 1];     // shift everyone left',
    '  rear--;',
    '  return x;',
    '}',
  ],
  init: () => ({ ...qrow([5, 8, 2, 9, null, null], {}, 0, 3), front: 0, rear: 3 }),
  actions: [
    { id: 'enq', label: 'enqueue(x)', value: true, def: 7 },
    { id: 'deq', label: 'dequeue()' },
  ],
  run: (s0, act, v) => {
    const a = [...s0.rows[0].a];
    let rear = s0.rear;
    const f: Frame<QA>[] = [];
    const P = (line: number, note: string, hl: Record<number, Role> = {}, moves?: number) =>
      f.push({
        s: { ...qrow(a, hl, 0, rear), front: 0, rear },
        line,
        note,
        vars: moves !== undefined ? { moves } : undefined,
      });
    if (act === 'enq') {
      if (rear === QN - 1) return [{ s: s0, line: 3, note: 'Full: rear == MAX - 1.' }];
      a[++rear] = v!;
      P(4, `q[++rear] = ${v}. O(1).`, { [rear]: 'swap' });
      return f;
    }
    if (rear < 0) return [{ s: s0, line: 7, note: 'Empty queue.' }];
    const x = a[0];
    P(7, `x = q[0] = ${x}. Now every other item must move one step left…`, { 0: 'compare' }, 0);
    for (let i = 0; i < rear; i++) {
      a[i] = a[i + 1];
      P(9, `q[${i}] = q[${i + 1}].`, { [i]: 'swap' }, i + 1);
    }
    a[rear] = null;
    rear--;
    P(
      10,
      `rear--. Dequeue needed ${Math.max(0, rear + 1)} moves: O(n). Imagine 1,000,000 people shuffling forward in a queue!`,
      {},
      rear + 1,
    );
    return f;
  },
};

export const queueFront: Algo<QA> = {
  view: 'array',
  legend: ['swap', 'compare', 'dim'],
  code: [
    'int q[MAX]; int front = 0, rear = -1;',
    'void enqueue(int x) {',
    '  if (rear == MAX - 1) { cout << "Full"; return; }',
    '  q[++rear] = x;',
    '}',
    'int dequeue() {          // O(1): just move front',
    '  if (front > rear) { cout << "Empty"; return -1; }',
    '  return q[front++];',
    '}',
  ],
  init: () => ({ ...qrow([5, 8, 2, 9, null, null], {}, 0, 3), front: 0, rear: 3 }),
  actions: [
    { id: 'enq', label: 'enqueue(x)', value: true, def: 7 },
    { id: 'deq', label: 'dequeue()' },
  ],
  run: (s0, act, v) => {
    const a = [...s0.rows[0].a];
    let { front, rear } = s0;
    const dead = () =>
      Object.fromEntries(Array.from({ length: front }, (_, k) => [k, 'dim'])) as Record<
        number,
        Role
      >;
    const P = (line: number, note: string, hl: Record<number, Role> = {}): Frame<QA> => ({
      s: { ...qrow(a, { ...dead(), ...hl }, front, rear), front, rear },
      line,
      note,
      vars: { front, rear },
    });
    if (act === 'enq') {
      if (rear === QN - 1)
        return [
          P(
            3,
            front > 0
              ? `"Full" even though ${front} slot(s) at the front are free! This waste is why we need a CIRCULAR queue.`
              : 'Full.',
            { [rear]: 'bad' },
          ),
        ];
      a[++rear] = v!;
      return [P(4, `q[++rear] = ${v}.`, { [rear]: 'swap' })];
    }
    if (front > rear) return [P(7, 'Empty: front > rear.')];
    const x = a[front];
    const f1 = P(8, `Return q[front] = ${x}…`, { [front]: 'compare' });
    a[front] = null;
    front++;
    return [f1, P(8, `…and front++. No shifting: O(1). But the slot behind front is now wasted.`)];
  },
};

export const circularQueue: Algo<RingState> = {
  view: 'ring',
  legend: ['swap', 'compare', 'bad'],
  code: [
    'const int N = 6;',
    'int q[N]; int front = 0, rear = -1, count = 0;',
    'bool isFull()  { return count == N; }',
    'bool isEmpty() { return count == 0; }',
    'void enqueue(int x) {',
    '  if (isFull()) { cout << "Full"; return; }',
    '  rear = (rear + 1) % N;',
    '  q[rear] = x; count++;',
    '}',
    'int dequeue() {',
    '  if (isEmpty()) { cout << "Empty"; return -1; }',
    '  int x = q[front];',
    '  front = (front + 1) % N; count--;',
    '  return x;',
    '}',
  ],
  init: () => ({ a: [null, null, 12, 7, 4, null], front: 2, rear: 4, count: 3 }),
  actions: [
    { id: 'enq', label: 'enqueue(x)', value: true, def: 9 },
    { id: 'deq', label: 'dequeue()' },
  ],
  run: (s0, act, v) => {
    const s = clone(s0);
    const F = (line: number, note: string, hl: Frame['hl'] = {}): Frame<RingState> => ({
      s: clone(s),
      line,
      note,
      hl,
      vars: { front: s.front, rear: s.rear, count: s.count },
    });
    const N = s.a.length;
    if (act === 'enq') {
      if (s.count === N)
        return [F(6, 'Full: count == N. Every slot is used.', { [s.rear]: 'bad' })];
      const nr = (s.rear + 1) % N;
      const f1 = F(
        7,
        `rear = (${s.rear} + 1) % ${N} = ${nr}.${nr < s.rear ? ' It WRAPPED around to the start!' : ''}`,
        { [nr]: 'compare' },
      );
      s.rear = nr;
      s.a[nr] = v!;
      s.count++;
      return [f1, F(8, `q[${nr}] = ${v}, count = ${s.count}.`, { [nr]: 'swap' })];
    }
    if (s.count === 0) return [F(11, 'Empty: count == 0.')];
    const x = s.a[s.front];
    const f1 = F(12, `x = q[front] = ${x}.`, { [s.front]: 'compare' });
    const old = s.front;
    s.a[old] = null;
    s.front = (s.front + 1) % N;
    s.count--;
    return [
      f1,
      F(
        13,
        `front = (${old} + 1) % ${N} = ${s.front}. The freed slot will be reused: no waste, still O(1).`,
      ),
    ];
  },
};

/* ---------------- std::deque ---------------- */
export const dequeViz: Algo<ArrayState> = {
  view: 'array',
  legend: ['swap', 'current'],
  code: [
    '#include <deque>',
    'deque<int> d;',
    'd.push_back(x);    // add at back',
    'd.push_front(x);   // add at front',
    'd.pop_back();      // remove back',
    'd.pop_front();     // remove front',
    'd.front(); d.back();',
  ],
  init: () => ({ rows: [{ a: [3, 6, 9], noIndex: true }] }),
  actions: [
    { id: 'pb', label: 'push_back', value: true, def: 4 },
    { id: 'pf', label: 'push_front', value: true },
    { id: 'ob', label: 'pop_back' },
    { id: 'of', label: 'pop_front' },
  ],
  run: (s0, act, v) => {
    const a = [...s0.rows[0].a];
    const F = (line: number, note: string, hl: Record<number, Role> = {}): Frame<ArrayState> => ({
      s: {
        rows: [
          { a: [...a], noIndex: true, hl, ptr: a.length ? { front: 0, back: a.length - 1 } : {} },
        ],
      },
      line,
      note,
    });
    if ((act === 'ob' || act === 'of') && !a.length)
      return [
        F(
          act === 'ob' ? 5 : 6,
          'Empty deque: popping is undefined behaviour. Check d.empty() first.',
        ),
      ];
    if ((act === 'pb' || act === 'pf') && a.length >= 9) return [F(3, 'Demo limit: 9 items.')];
    if (act === 'pb') {
      a.push(v!);
      return [F(3, `push_back(${v}). As a queue: enqueue.`, { [a.length - 1]: 'swap' })];
    }
    if (act === 'pf') {
      a.unshift(v!);
      return [
        F(4, `push_front(${v}). O(1) in a deque (an array would need to shift).`, { 0: 'swap' }),
      ];
    }
    if (act === 'ob') {
      const x = a.pop();
      return [F(5, `pop_back() removed ${x}. As a stack: pop.`)];
    }
    const x = a.shift();
    return [F(6, `pop_front() removed ${x}. As a queue: dequeue.`)];
  },
};

/* ---------------- monotonic stack ---------------- */
export const monotonic: Algo<ArrayState> = {
  view: 'array',
  legend: ['current', 'compare', 'done'],
  code: [
    'vector<int> nextGreater(const vector<int>& a) {',
    '  int n = a.size();',
    '  vector<int> ans(n, -1);',
    '  stack<int> st;              // indices; values decreasing',
    '  for (int i = 0; i < n; i++) {',
    '    while (!st.empty() && a[st.top()] < a[i]) {',
    '      ans[st.top()] = a[i];     // a[i] answers the top',
    '      st.pop();',
    '    }',
    '    st.push(i);',
    '  }',
    '  return ans;                 // leftovers: no greater',
    '}',
  ],
  input: { label: 'Array', def: '2, 1, 3, 5, 6, 1' },
  init: (s) => {
    const a = parseNums(s, 10);
    const v = a.length ? a : [2, 1, 3, 5, 6, 1];
    return {
      rows: [
        { name: 'a', a: v },
        { name: 'next greater', a: v.map(() => null) },
        { name: 'span (j−i)', a: v.map(() => null) },
      ],
    };
  },
  actions: [{ id: 'run', label: 'Run' }],
  auto: 'run',
  run: (s0) => {
    const a = s0.rows[0].a as number[];
    const ans: (number | null)[] = a.map(() => null);
    const span: (number | null)[] = a.map(() => null);
    const st: number[] = [];
    const f: Frame<ArrayState>[] = [];
    const P = (
      line: number,
      note: string,
      hl0: Record<number, Role> = {},
      hl1: Record<number, Role> = {},
      i?: number,
    ) =>
      f.push({
        s: {
          rows: [
            {
              name: 'a',
              a,
              hl: { ...Object.fromEntries(st.map((k) => [k, 'current'])), ...hl0 },
              ptr: i !== undefined ? { i } : {},
            },
            { name: 'next greater', a: [...ans], hl: hl1 },
            { name: 'span (j−i)', a: [...span], hl: hl1 },
          ],
        },
        line,
        note,
        aux: [{ label: 'stack', items: st.map((k) => `${a[k]}@${k}`), kind: 'stack' }],
      });
    P(
      4,
      'Keep a stack of indices whose values are DECREASING from bottom to top. Each one is still waiting for a bigger number.',
    );
    for (let i = 0; i < a.length; i++) {
      P(5, `i = ${i}, a[i] = ${a[i]}.`, { [i]: 'compare' }, {}, i);
      while (st.length && a[st[st.length - 1]] < a[i]) {
        const t = st[st.length - 1];
        ans[t] = a[i];
        span[t] = i - t;
        P(
          7,
          `a[${t}] = ${a[t]} < ${a[i]}: ${a[i]} is the next greater for index ${t}, ${i - t} step(s) away. Pop it.`,
          { [i]: 'compare', [t]: 'done' },
          { [t]: 'done' },
          i,
        );
        st.pop();
      }
      st.push(i);
      P(
        10,
        `Push index ${i}. Stack values stay decreasing: ${st.map((k) => a[k]).join(' > ')}.`,
        {},
        {},
        i,
      );
    }
    P(
      12,
      `Left in the stack (${st.map((k) => a[k]).join(', ')}) never found a greater value → -1. Each index is pushed and popped at most once: O(n) total. Note: we pop on "<", so equal values do NOT answer each other (use "<=" if they should). For a circular array, loop i from 0 to 2n-1 and use a[i % n].`,
    );
    return f;
  },
};

export const algos = {
  'stack-array': stackArray,
  'stack-list': stackList,
  'queue-list': queueList,
  'queue-naive': queueNaive,
  'queue-front': queueFront,
  'circular-queue': circularQueue,
  deque: dequeViz,
  'monotonic-stack': monotonic,
};
