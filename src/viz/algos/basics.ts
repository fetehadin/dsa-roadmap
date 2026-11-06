import type { Algo, Frame, Role } from '../types';
import { parseNums, randomNums } from '../types';
import type { ArrayState, CallStackState, ProofState, TallyState, TreeState } from '../views';

type AF = Frame<ArrayState>;
const one = (a: (number | string | null)[], extra: Partial<ArrayState['rows'][0]> = {}): ArrayState => ({ rows: [{ a: [...a], ...extra }] });

/* ---------------- Ch1: array memory ---------------- */
export const arrayMemory: Algo<ArrayState> = {
  view: 'array',
  legend: ['current', 'bad'],
  code: [
    'int a[6] = {12, 7, 31, 4, 19, 8};',
    '// base address &a[0] = 1000, sizeof(int) = 4',
    'int x = a[i];',
    '// address of a[i] = base + i * sizeof(int)',
  ],
  input: { label: 'Values', def: '12, 7, 31, 4, 19, 8', random: () => randomNums(6, 1, 99) },
  init: (s) => {
    const a = parseNums(s, 8);
    const v = a.length ? a : [12, 7, 31, 4];
    return one(v, { sub: v.map((_, i) => 1000 + i * 4), name: 'address' });
  },
  actions: [{ id: 'get', label: 'Read a[i]', value: true, def: 3 }],
  run: (st, _a, i = 0) => {
    const a = st.rows[0].a;
    const f: AF[] = [{ s: st, line: 3, note: `Read a[${i}]. The CPU does not search: it computes the address directly.`, ptr: { i } }];
    if (i < 0 || i >= a.length) {
      f.push({ s: st, line: 4, note: `1000 + ${i} × 4 = ${1000 + i * 4}. That is outside the array! C++ does not check bounds: this is undefined behaviour.`, vars: { address: 1000 + i * 4 } });
      return f;
    }
    f.push({ s: st, line: 4, note: `address = 1000 + ${i} × 4 = ${1000 + i * 4}. One multiplication and one addition: O(1) for any i.`, hl: { [i]: 'current' }, ptr: { i }, vars: { address: 1000 + i * 4 } });
    f.push({ s: st, line: 3, note: `x = ${a[i]}. This "random access" in constant time is the superpower of arrays.`, hl: { [i]: 'done' }, ptr: { i }, vars: { x: String(a[i]) } });
    return f;
  },
};

export const matrixMemory: Algo<ArrayState> = {
  view: 'array',
  legend: ['current'],
  code: [
    'int m[3][4];          // 3 rows, 4 columns',
    'for (int i = 0; i < 3; i++)',
    '  for (int j = 0; j < 4; j++)',
    '    cout << m[i][j] << " ";',
    '// row-major: &m[i][j] = base + (i*COLS + j) * 4',
  ],
  init: () => {
    const m = [
      [1, 2, 3, 4],
      [5, 6, 7, 8],
      [9, 10, 11, 12],
    ];
    return {
      rows: [
        ...m.map((r, i) => ({ name: `row ${i}`, a: r, noIndex: i < 2 })),
        { name: 'memory', a: m.flat(), sub: m.flat().map((_, k) => 2000 + k * 4) },
      ],
    };
  },
  actions: [{ id: 'run', label: 'Walk' }],
  auto: 'run',
  run: (st) => {
    const f: AF[] = [{ s: st, line: 1, note: 'A 2-D array is drawn as a grid, but memory is one long line. C++ stores it row by row (row-major).' }];
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 4; j++) {
        const k = i * 4 + j;
        const rows = st.rows.map((r, ri) => ({ ...r, hl: ri === i ? { [j]: 'current' as Role } : ri === 3 ? { [k]: 'current' as Role } : {} }));
        f.push({ s: { rows }, line: 4, note: `m[${i}][${j}] → offset ${i}×4 + ${j} = ${k} → address 2000 + ${k}×4 = ${2000 + k * 4}.`, vars: { i, j, offset: k } });
      }
    f.push({ s: st, line: 5, note: 'Visiting row by row walks memory in order, which is the fastest way to loop over a 2-D array.' });
    return f;
  },
};

/* ---------------- Ch1: classification ---------------- */
export const classify: Algo<TreeState> = {
  view: 'tree',
  legend: ['current', 'compare', 'done', 'visited'],
  code: [
    'int age = 20;            // primitive: one value, built in',
    'char grade = \'A\';       // primitive',
    'int marks[5];            // non-primitive, linear, STATIC size',
    'vector<int> scores;      // linear, DYNAMIC (grows)',
    'struct Node { int data; Node* next; };   // linked list',
    'stack<int> s; queue<int> q;              // linear ADTs',
    '// trees and graphs: non-linear (one item -> many)',
  ],
  init: () => {
    const n = (v: string, c: string[] = []) => ({ v, c });
    return {
      root: 'DS',
      nodes: {
        DS: n('Data structure', ['P', 'NP']),
        P: n('Primitive', ['int', 'float', 'char', 'bool']),
        NP: n('Non-primitive', ['L', 'NL']),
        int: n('int'), float: n('float'), char: n('char'), bool: n('bool'),
        L: n('Linear', ['arr', 'll', 'st', 'q']),
        NL: n('Non-linear', ['tree', 'graph']),
        arr: n('Array'), ll: n('List'), st: n('Stack'), q: n('Queue'),
        tree: n('Tree'), graph: n('Graph'),
      },
    };
  },
  actions: [{ id: 'run', label: 'Tour' }],
  auto: 'run',
  run: (s) => {
    const steps: [string, Frame['hl'], number][] = [
      ['Every data structure falls into this family tree. Step through it.', {}, 1],
      ['PRIMITIVE types are built into the language and hold a single value: int, float, char, bool.', { P: 'current', int: 'compare', float: 'compare', char: 'compare', bool: 'compare' }, 1],
      ['NON-PRIMITIVE structures are built from primitives and hold many values with a shape.', { NP: 'current' }, 3],
      ['LINEAR: items sit in a sequence, each with one "next" (array, linked list, stack, queue).', { L: 'current', arr: 'done', ll: 'done', st: 'done', q: 'done' }, 3],
      ['NON-LINEAR: one item can lead to many (a tree node has children; a graph vertex has neighbours).', { NL: 'current', tree: 'done', graph: 'done' }, 7],
      ['STATIC vs DYNAMIC cuts across the tree: an array has a fixed size set at compile time (static)…', { arr: 'visited' }, 3],
      ['…while a linked list grows and shrinks at run time with new/delete (dynamic). vector is a dynamic array.', { ll: 'visited' }, 5],
      ['Stack and queue are ADTs: they can be built on an array (static) OR a linked list (dynamic). Chapter 5 does both.', { st: 'current', q: 'current', arr: 'compare', ll: 'compare' }, 6],
    ];
    return steps.map(([note, hl, line]) => ({ s, note, hl, line }));
  },
};

/* ---------------- Ch1: ADT vs implementation ---------------- */
export const adtStack: Algo<ArrayState> = {
  view: 'array',
  legend: ['swap', 'current'],
  code: [
    'class Stack {            // the ADT: WHAT it does',
    'public:',
    '  void push(int x);',
    '  int  pop();',
    '  int  top() const;',
    '  bool isEmpty() const;',
    '};',
    '// HOW it works is hidden. An array or a',
    '// linked list can sit behind the same interface.',
  ],
  init: () => ({ rows: [{ name: 'array impl', a: [null, null, null, null, null] }, { name: 'linked impl', a: [], linked: true, noIndex: true }] }),
  actions: [
    { id: 'push', label: 'push(x)', value: true, def: 7 },
    { id: 'pop', label: 'pop()' },
    { id: 'top', label: 'top()' },
  ],
  run: (st, act, v) => {
    const arr = [...st.rows[0].a];
    const list = [...st.rows[1].a];
    const size = arr.filter((x) => x !== null).length;
    const mk = (note: string, line: number, hl0: Record<number, Role> = {}, hl1: Record<number, Role> = {}): AF => ({
      s: { rows: [{ name: 'array impl', a: [...arr], hl: hl0, ptr: size > 0 || act === 'push' ? { top: arr.filter((x) => x !== null).length - 1 } : {} }, { name: 'linked impl', a: [...list], linked: true, noIndex: true, hl: hl1 }] },
      note,
      line,
    });
    if (act === 'push') {
      if (size === arr.length) return [mk('The array version is full (capacity 5) but the linked version could keep growing. Same interface, different limits!', 3)];
      arr[size] = v!;
      list.unshift(v!);
      return [mk(`push(${v}): array writes a[${size}]; linked list makes a new head node. The caller sees no difference.`, 3, { [size]: 'swap' }, { 0: 'swap' })];
    }
    if (size === 0) return [mk(`${act}() on an empty stack: both implementations must report "underflow". That rule is part of the ADT.`, act === 'pop' ? 4 : 5)];
    const top = arr[size - 1];
    if (act === 'top') return [mk(`top() = ${top} in both. Implementation details differ; the answer must not.`, 5, { [size - 1]: 'current' }, { 0: 'current' })];
    const before = mk(`pop(): both remove ${top}.`, 4, { [size - 1]: 'swap' }, { 0: 'swap' });
    arr[size - 1] = null;
    list.shift();
    return [before, mk(`Returned ${top}. Array decremented top; the list deleted its head node.`, 4)];
  },
};

/* ---------------- Ch2: properties walk ---------------- */
export const findMax: Algo<ArrayState> = {
  view: 'array',
  legend: ['compare', 'current', 'done'],
  code: [
    'int findMax(int a[], int n) {     // input: a, n',
    '  int max = a[0];',
    '  for (int i = 1; i < n; i++)     // finite: n-1 steps',
    '    if (a[i] > max)               // definite',
    '      max = a[i];',
    '  return max;                     // output',
    '}',
  ],
  input: { label: 'Array', def: '14, 3, 27, 9, 31, 8', random: () => randomNums(6, 1, 60) },
  init: (s) => one(parseNums(s, 10).length ? parseNums(s, 10) : [4, 9, 2]),
  actions: [{ id: 'run', label: 'Run' }],
  auto: 'run',
  run: (st) => {
    const a = st.rows[0].a as number[];
    const f: AF[] = [{ s: st, line: 1, note: 'Input: an array and its size. (Property: Input/Output: zero or more inputs, at least one output.)' }];
    let m = 0;
    f.push({ s: st, line: 2, note: `max = ${a[0]}. Every step is basic and doable by hand (Feasibility, Effectiveness).`, hl: { 0: 'current' }, ptr: { max: 0 } });
    for (let i = 1; i < a.length; i++) {
      f.push({ s: st, line: 4, note: `Is ${a[i]} > ${a[m]}? One clear meaning, no guessing (Definiteness). Steps happen in a fixed order (Sequence).`, hl: { [i]: 'compare', [m]: 'current' }, ptr: { i, max: m } });
      if (a[i] > a[m]) {
        m = i;
        f.push({ s: st, line: 5, note: `Yes, so max = ${a[i]}.`, hl: { [m]: 'current' }, ptr: { i, max: m } });
      }
    }
    f.push({ s: st, line: 6, note: `Returns ${a[m]} after exactly ${a.length - 1} comparisons (Finiteness, Efficiency). It works for any array size (Generality) and is always right (Correctness). Written in C++, but the idea is language-independent.`, hl: { [m]: 'done' }, ptr: { max: m } });
    return f;
  },
};

export const lateTermination: Algo<ArrayState> = {
  view: 'array',
  legend: ['compare', 'found', 'dim'],
  code: [
    '// late termination: keeps going after the answer is known',
    'for (int i = 0; i < n; i++)',
    '  if (a[i] == key) found = true;',
    '',
    '// fixed: stop as soon as you know',
    'for (int i = 0; i < n; i++)',
    '  if (a[i] == key) { found = true; break; }',
  ],
  input: { label: 'Array', def: '5, 12, 8, 3, 19, 7, 25, 11', random: () => randomNums(8, 1, 30) },
  init: (s) => ({ rows: [{ name: 'no break', a: parseNums(s, 12) }, { name: 'with break', a: parseNums(s, 12) }] }),
  actions: [{ id: 'run', label: 'Search key', value: true, def: 8 }],
  run: (st, _x, key) => {
    const a = st.rows[0].a as number[];
    const f: AF[] = [];
    let c1 = 0, c2 = 0, stopped = -1;
    for (let i = 0; i < a.length; i++) {
      c1++;
      if (stopped < 0) c2++;
      const hit = a[i] === key;
      const h0: Record<number, Role> = { [i]: hit ? 'found' : 'compare' };
      const h1: Record<number, Role> = stopped >= 0 ? Object.fromEntries(a.map((_, k) => [k, k === stopped ? 'found' : k > stopped ? 'dim' : 'visited'])) : { [i]: hit ? 'found' : 'compare' };
      f.push({ s: { rows: [{ ...st.rows[0], hl: h0, ptr: { i } }, { ...st.rows[1], hl: h1, ptr: stopped < 0 ? { i } : {} }] }, line: stopped >= 0 ? 3 : hit ? 7 : 3, note: stopped >= 0 ? `The top loop still checks a[${i}] although the answer is known: wasted work.` : hit ? `Found ${key} at index ${i}. The bottom loop breaks here.` : `Check a[${i}] = ${a[i]}.`, vars: { 'no break': c1, 'with break': c2 } });
      if (hit && stopped < 0) stopped = i;
    }
    f.push({ s: st, line: 6, note: stopped < 0 ? `${key} is not in the array, so both loops do ${a.length} checks. Breaking early only helps when the key is found.` : `No break: ${c1} checks. With break: ${c2}. Same answer, less work.`, vars: { 'no break': c1, 'with break': c2 } });
    return f;
  },
};

/* ---------------- Ch2: time-unit counter ---------------- */
const tallyAlgo = (nested: boolean): Algo<TallyState> => ({
  view: 'tally',
  legend: ['current'],
  code: nested
    ? ['int k = 0;', 'for (int i = 0; i < n; i++)', '  for (int j = 0; j < n; j++)', '    k++;']
    : ['for (i = 0; i < n; i++)', '  k = k + 1;', 'cout << k;'],
  input: { label: 'n (1–6)', def: '3', presets: [{ label: 'n=1', value: '1' }, { label: 'n=5', value: '5' }] },
  init: (s) => {
    const n = Math.max(1, Math.min(6, parseNums(s, 1)[0] ?? 3));
    return { rows: [], total: `n = ${n}` };
  },
  actions: [{ id: 'run', label: 'Count' }],
  auto: 'run',
  run: (st) => {
    const n = parseInt(st.total.replace(/\D/g, ''), 10) || 3;
    const f: Frame<TallyState>[] = [];
    const rows: TallyState['rows'] = nested
      ? [
          { label: 'k = 0', expr: '1 assignment', units: 0 },
          { label: 'i = 0', expr: '1 init', units: 0 },
          { label: 'i < n', expr: 'n+1 tests', units: 0 },
          { label: 'i++', expr: 'n increments', units: 0 },
          { label: 'inner loop', expr: '(1 + (n+1) + n) per outer pass', units: 0 },
          { label: 'k++', expr: '1 × n × n', units: 0 },
        ]
      : [
          { label: 'i = 0', expr: '1 init', units: 0 },
          { label: 'i < n', expr: 'n+1 tests', units: 0 },
          { label: 'i++', expr: 'n increments', units: 0 },
          { label: 'k = k + 1', expr: '2 (add + assign) × n', units: 0 },
          { label: 'cout << k', expr: '1 output', units: 0 },
        ];
    const sum = () => rows.reduce((s, r) => s + Number(r.units), 0);
    const add = (row: number, u: number, note: string, line: number) => {
      rows[row].units = Number(rows[row].units) + u;
      f.push({ s: { rows: rows.map((r) => ({ ...r })), total: String(sum()) }, hl: { [row]: 'current' }, note, line, vars: { n, 'units so far': sum() } });
    };
    if (nested) {
      add(0, 1, 'k = 0 is one assignment: 1 unit.', 1);
      add(1, 1, 'Outer loop: i = 0 runs once.', 2);
      for (let i = 0; i < n; i++) {
        add(2, 1, `Test i < n with i = ${i}: true.`, 2);
        add(4, 2 * n + 2, `Inner loop for i = ${i}: 1 init + ${n + 1} tests + ${n} increments = ${2 * n + 2}.`, 3);
        add(5, n, `Body k++ runs ${n} times for this i: ${n} units.`, 4);
        add(3, 1, 'i++: 1 unit.', 2);
      }
      add(2, 1, `Final test i < n with i = ${n}: false, loop ends.`, 2);
      f.push({ s: { rows: rows.map((r) => ({ ...r })), total: `${sum()} = 3n² + 4n + 3` }, note: `Formula: 1 + 1 + (n+1) + n + n(2n+2) + n² = 3n² + 4n + 3. With n = ${n}: ${3 * n * n + 4 * n + 3}. ✓`, line: 4, vars: { n } });
    } else {
      add(0, 1, 'Loop starts: i = 0 is one assignment, done once.', 1);
      for (let i = 0; i < n; i++) {
        add(1, 1, `Test i < n with i = ${i}: true (1 unit).`, 1);
        add(3, 2, 'k = k + 1: one addition + one assignment = 2 units.', 2);
        add(2, 1, 'i++: 1 unit.', 1);
      }
      add(1, 1, `Last test with i = ${n}: false. Tests ran n + 1 = ${n + 1} times.`, 1);
      add(4, 1, 'cout << k: one output = 1 unit.', 3);
      f.push({ s: { rows: rows.map((r) => ({ ...r })), total: `${sum()} = 4n + 3` }, note: `T(n) = 1 + (n+1) + n + 2n + 1 = 4n + 3. With n = ${n}: ${4 * n + 3}. ✓`, line: 3, vars: { n } });
    }
    return f;
  },
});
export const timeUnits = tallyAlgo(false);
export const timeUnitsNested = tallyAlgo(true);

/* ---------------- Ch2: Big-O proof stepper ---------------- */
export const bigOProof: Algo<ProofState> = {
  view: 'proof',
  legend: [],
  code: [
    'Claim:  f(n) = O(g(n))',
    'Need:   c > 0 and k >= 1 such that',
    '        f(n) <= c * g(n)  for all n >= k',
    'Step 1: for n >= 1, bound every term by g(n)',
    'Step 2: add the coefficients -> that sum is c',
    'Step 3: the bound held from n = 1 -> k = 1',
    'Step 4: spot-check, then conclude',
  ],
  input: {
    label: 'f(n) = a·n² + b·n + c, enter a, b, c',
    def: '3, 4, 1',
    presets: [
      { label: '10n+5', value: '0, 10, 5' },
      { label: '3n²+4n+1', value: '3, 4, 1' },
    ],
  },
  init: (s) => {
    const [a = 3, b = 4, c = 1] = parseNums(s, 3).map((x) => Math.abs(x));
    return { lines: [`a=${a} b=${b} c=${c}`] };
  },
  actions: [{ id: 'run', label: 'Prove' }],
  auto: 'run',
  run: (st) => {
    const [a, b, c] = st.lines[0].match(/\d+/g)!.map(Number);
    const terms: string[] = [];
    if (a) terms.push(`${a === 1 ? '' : a}n²`);
    if (b) terms.push(`${b === 1 ? '' : b}n`);
    if (c || !terms.length) terms.push(String(c));
    const fn = terms.join(' + ');
    const g = a ? 'n²' : b ? 'n' : '1';
    const C = a + b + c;
    const L: string[] = [];
    const f: Frame<ProofState>[] = [];
    const push = (line: number, text: string, note: string) => {
      L.push(text);
      f.push({ s: { lines: [...L] }, line, note });
    };
    push(1, `Claim: f(n) = ${fn} is O(${g})`, 'State exactly what you are proving.');
    push(3, `Find c, k with ${fn} ≤ c·${g} for all n ≥ k`, 'This is the definition you must satisfy. Write it in the exam!');
    const bounds: string[] = [];
    if (a) bounds.push(`${a}n² ≤ ${a}n²`);
    if (b && g !== 'n') bounds.push(`${b}n ≤ ${b}${g}`);
    if (b && g === 'n') bounds.push(`${b}n ≤ ${b}n`);
    if (c && g !== '1') bounds.push(`${c} ≤ ${c}${g}`);
    push(4, `For n ≥ 1: ${bounds.join(',  ')}`, g === '1' ? 'A constant is already bounded by itself.' : `Because n ≥ 1, any lower power of n is ≤ ${g}.`);
    push(5, `So ${fn} ≤ ${[a && `${a}n²`, b && `${b}${g}`, c && g !== '1' ? `${c}${g}` : c ? String(c) : ''].filter(Boolean).join(' + ')} = ${C}${g === '1' ? '' : g}`, `Add the coefficients: ${[a, b, c].filter(Boolean).join(' + ')} = ${C}. That is our c.`);
    push(6, `Choose c = ${C}, k = 1`, 'Any bigger c or k also works; you only need one valid pair.');
    const val = (n: number) => a * n * n + b * n + c;
    const gv = (n: number) => (g === 'n²' ? n * n : g === 'n' ? n : 1);
    push(7, `Check: n=1 → ${val(1)} ≤ ${C * gv(1)} ✓   n=2 → ${val(2)} ≤ ${C * gv(2)} ✓`, 'A quick numeric check catches arithmetic slips.');
    push(7, `∴ f(n) ≤ ${C}·${g} for all n ≥ 1, so f(n) = O(${g}). ∎`, 'Conclude with the definition. Done!');
    return f;
  },
};

/* ---------------- Searching ---------------- */
const LS = ['int linearSearch(int a[], int n, int key) {', '  for (int i = 0; i < n; i++)', '    if (a[i] == key)', '      return i;', '  return -1;', '}'];
function linearFrames(a: number[], key: number): AF[] {
  const st = one(a);
  const f: AF[] = [];
  for (let i = 0; i < a.length; i++) {
    const vis = Object.fromEntries(Array.from({ length: i }, (_, k) => [k, 'visited'])) as Record<number, Role>;
    f.push({ s: st, line: 3, note: `a[${i}] = ${a[i]} == ${key}?`, hl: { ...vis, [i]: 'compare' }, ptr: { i }, vars: { comparisons: i + 1 } });
    if (a[i] === key) {
      f.push({ s: st, line: 4, note: `Found ${key} at index ${i} after ${i + 1} comparison(s).`, hl: { ...vis, [i]: 'found' }, ptr: { i }, vars: { comparisons: i + 1, result: i } });
      return f;
    }
  }
  f.push({ s: st, line: 5, note: `${key} is not in the array. We checked all ${a.length} items: that is the worst case.`, hl: Object.fromEntries(a.map((_, k) => [k, 'visited'])), vars: { comparisons: a.length, result: -1 } });
  return f;
}
export const linearSearch: Algo<ArrayState> = {
  view: 'array',
  legend: ['compare', 'visited', 'found'],
  code: LS,
  input: { label: 'Array', def: '23, 7, 41, 15, 9, 32, 18', random: () => randomNums(8, 1, 50) },
  init: (s) => one(parseNums(s).length ? parseNums(s) : [4, 1, 3]),
  actions: [{ id: 'run', label: 'Search', value: true, def: 9 }],
  run: (st, _a, key) => linearFrames(st.rows[0].a as number[], key!),
};
export const searchCases: Algo<ArrayState> = {
  view: 'array',
  legend: ['compare', 'visited', 'found'],
  code: LS,
  init: () => one([8, 3, 14, 6, 21, 9, 17, 2]),
  actions: [
    { id: 'best', label: 'Best case (key = 8)' },
    { id: 'avg', label: 'Average (key = 21)' },
    { id: 'worst', label: 'Worst case (key = 99)' },
  ],
  run: (st, act) => {
    const a = st.rows[0].a as number[];
    const key = act === 'best' ? 8 : act === 'avg' ? 21 : 99;
    const f = linearFrames(a, key);
    const last = f[f.length - 1];
    last.note +=
      act === 'best' ? ' Best case: 1 comparison → O(1).' : act === 'avg' ? ' On average the key is near the middle: about n/2 comparisons → still O(n).' : ' Worst case: n comparisons → O(n).';
    return f;
  },
};

const BS = ['int binarySearch(int a[], int n, int key) {', '  int low = 0, high = n - 1;', '  while (low <= high) {', '    int mid = (low + high) / 2;', '    if (a[mid] == key) return mid;', '    else if (a[mid] < key) low = mid + 1;', '    else high = mid - 1;', '  }', '  return -1;', '}'];
export const binarySearch: Algo<ArrayState> = {
  view: 'array',
  legend: ['current', 'compare', 'found', 'dim'],
  code: BS,
  input: { label: 'Array (auto-sorted)', def: '3, 8, 12, 17, 23, 31, 38, 45, 52, 60', random: () => randomNums(10, 1, 70) },
  init: (s) => one((parseNums(s).length ? parseNums(s) : [1, 2, 3]).sort((x, y) => x - y)),
  actions: [{ id: 'run', label: 'Search', value: true, def: 38 }],
  run: (st, _a, key = 0) => {
    const a = st.rows[0].a as number[];
    let lo = 0, hi = a.length - 1, c = 0;
    const dim = () => Object.fromEntries(a.map((_, k) => [k, k < lo || k > hi ? 'dim' : undefined]).filter(([, v]) => v)) as Record<number, Role>;
    const f: AF[] = [{ s: st, line: 2, note: `Search for ${key}. The array must be sorted. low = 0, high = ${hi}.`, ptr: { low: lo, high: hi }, vars: { comparisons: 0 } }];
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      c++;
      f.push({ s: st, line: 4, note: `mid = (${lo} + ${hi}) / 2 = ${mid}. a[mid] = ${a[mid]}.`, hl: { ...dim(), [mid]: 'compare' }, ptr: { low: lo, mid, high: hi }, vars: { comparisons: c } });
      if (a[mid] === key) {
        f.push({ s: st, line: 5, note: `a[${mid}] == ${key}. Found after ${c} comparison(s). Linear search could need up to ${a.length}.`, hl: { ...dim(), [mid]: 'found' }, ptr: { mid }, vars: { comparisons: c, result: mid } });
        return f;
      }
      if (a[mid] < key) {
        lo = mid + 1;
        f.push({ s: st, line: 6, note: `${a[mid]} < ${key}, so the key can only be on the right. low = ${lo}. Half the array is gone.`, hl: dim(), ptr: { low: lo, high: hi }, vars: { comparisons: c } });
      } else {
        hi = mid - 1;
        f.push({ s: st, line: 7, note: `${a[mid]} > ${key}, so the key can only be on the left. high = ${hi}.`, hl: dim(), ptr: { low: lo, high: hi }, vars: { comparisons: c } });
      }
    }
    f.push({ s: st, line: 9, note: `low (${lo}) > high (${hi}): the range is empty, so ${key} is not present. Return -1.`, hl: Object.fromEntries(a.map((_, k) => [k, 'dim'])), vars: { comparisons: c, result: -1 } });
    return f;
  },
};

/* ---------------- Recursion ---------------- */
export const factorial: Algo<CallStackState> = {
  view: 'callstack',
  legend: ['current', 'done'],
  code: ['int factorial(int n) {', '  if (n <= 1) return 1;          // base case', '  return n * factorial(n - 1);   // recursive case', '}'],
  init: () => ({ frames: [] }),
  actions: [{ id: 'run', label: 'factorial(n)', value: true, def: 4 }],
  run: (_s, _a, nRaw = 4) => {
    const n = Math.max(0, Math.min(8, nRaw));
    const fr: CallStackState['frames'] = [];
    const f: Frame<CallStackState>[] = [];
    const snap = (line: number, note: string, out?: string) => f.push({ s: { frames: fr.map((x) => ({ ...x })), out }, line, note, vars: { depth: fr.length } });
    if (n !== nRaw) snap(1, `Capped n at ${n} to keep the stack readable.`);
    for (let k = n; k >= 1; k--) {
      fr.push({ label: `factorial(${k})` });
      if (k > 1) snap(3, `factorial(${k}) is not the base case, so it calls factorial(${k - 1}) and WAITS. A new frame is pushed.`);
    }
    if (n === 0) fr.push({ label: 'factorial(0)' });
    fr[fr.length - 1].ret = '1';
    snap(2, `Base case reached: n ≤ 1 returns 1. No more calls. Now the stack unwinds.`);
    let val = 1;
    for (let k = 2; k <= n; k++) {
      fr.pop();
      val *= k;
      fr[fr.length - 1].ret = String(val);
      snap(3, `factorial(${k}) gets ${val / k} back and returns ${k} × ${val / k} = ${val}.`);
    }
    fr.pop();
    snap(4, `Stack is empty again. factorial(${n}) = ${val}. Max depth was ${Math.max(1, n)} frames → O(n) space.`, String(val));
    return f;
  },
};

export const recBinarySearch: Algo<ArrayState> = {
  view: 'array',
  legend: ['compare', 'found', 'dim'],
  code: [
    'int bs(int a[], int low, int high, int key) {',
    '  if (low > high) return -1;             // base case 1',
    '  int mid = (low + high) / 2;',
    '  if (a[mid] == key) return mid;         // base case 2',
    '  if (a[mid] < key)',
    '    return bs(a, mid + 1, high, key);',
    '  return bs(a, low, mid - 1, key);',
    '}',
  ],
  input: { label: 'Array (auto-sorted)', def: '2, 5, 9, 14, 20, 27, 33, 41', random: () => randomNums(8, 1, 60) },
  init: (s) => one((parseNums(s).length ? parseNums(s) : [1, 2, 3]).sort((x, y) => x - y)),
  actions: [{ id: 'run', label: 'bs(key)', value: true, def: 27 }],
  run: (st, _a, key = 0) => {
    const a = st.rows[0].a as number[];
    const stack: string[] = [];
    const f: AF[] = [];
    const dim = (lo: number, hi: number) => Object.fromEntries(a.map((_, k) => [k, k < lo || k > hi ? 'dim' : undefined]).filter(([, v]) => v)) as Record<number, Role>;
    const go = (lo: number, hi: number): number => {
      stack.push(`bs(${lo},${hi})`);
      const aux = () => [{ label: 'call stack', items: [...stack], kind: 'stack' as const }];
      if (lo > hi) {
        f.push({ s: st, line: 2, note: `low > high: empty range, return -1.`, hl: dim(lo, hi), aux: aux() });
        stack.pop();
        return -1;
      }
      const mid = Math.floor((lo + hi) / 2);
      f.push({ s: st, line: 3, note: `New call bs(${lo}, ${hi}): mid = ${mid}, a[mid] = ${a[mid]}.`, hl: { ...dim(lo, hi), [mid]: 'compare' }, ptr: { low: lo, mid, high: hi }, aux: aux() });
      if (a[mid] === key) {
        f.push({ s: st, line: 4, note: `Found! Return ${mid}, and every waiting call passes it up.`, hl: { ...dim(lo, hi), [mid]: 'found' }, ptr: { mid }, aux: aux() });
        stack.pop();
        return mid;
      }
      const r = a[mid] < key ? go(mid + 1, hi) : go(lo, mid - 1);
      stack.pop();
      f.push({ s: st, line: a[mid] < key ? 6 : 7, note: `bs(${lo},${hi}) returns ${r} to its caller (frame popped).`, hl: r >= 0 ? { [r]: 'found' } : {}, aux: [{ label: 'call stack', items: [...stack], kind: 'stack' }] });
      return r;
    };
    go(0, a.length - 1);
    return f;
  },
};

export const algos = {
  classify,
  'array-memory': arrayMemory,
  'matrix-memory': matrixMemory,
  'adt-stack': adtStack,
  'find-max': findMax,
  'late-termination': lateTermination,
  'time-units': timeUnits,
  'time-units-nested': timeUnitsNested,
  'big-o-proof': bigOProof,
  'linear-search': linearSearch,
  'search-cases': searchCases,
  'binary-search': binarySearch,
  factorial,
  'rec-binary-search': recBinarySearch,
};
