import type { Algo, Frame, Role } from '../types';
import { parseNums, randomNums } from '../types';
import type { ArrayState, BarsState, HeapState, MergeState } from '../views';

const input = (def = '29, 10, 14, 37, 13, 5, 42, 21') => ({
  label: 'Array',
  def,
  random: () => randomNums(8, 2, 60),
  presets: [
    { label: 'Sorted', value: '3, 8, 12, 17, 25, 31, 40' },
    { label: 'Reversed', value: '40, 31, 25, 17, 12, 8, 3' },
  ],
});

type Rec = (a: number[], extra: Omit<Frame<BarsState>, 's'>) => void;
function bars(code: string[], sorter: (a: number[], rec: Rec) => void): Algo<BarsState> {
  return {
    view: 'bars',
    code,
    input: input(),
    legend: ['compare', 'swap', 'done', 'current'],
    init: (s) => ({ a: parseNums(s, 12).length ? parseNums(s, 12) : [5, 3, 8, 1] }),
    actions: [{ id: 'run', label: 'Sort' }],
    auto: 'run',
    run: (st) => {
      const frames: Frame<BarsState>[] = [];
      const a = [...st.a];
      sorter(a, (arr, extra) => frames.push({ s: { a: [...arr] }, ...extra, hl: { ...(extra.hl ?? {}) } }));
      return frames;
    },
  };
}

const doneSet = (from: number, to: number): Record<number, Role> => {
  const o: Record<number, Role> = {};
  for (let k = from; k <= to; k++) o[k] = 'done';
  return o;
};

export const selection = bars(
  [
    'void selectionSort(int a[], int n) {',
    '  for (int i = 0; i < n - 1; i++) {',
    '    int minIdx = i;',
    '    for (int j = i + 1; j < n; j++)',
    '      if (a[j] < a[minIdx])',
    '        minIdx = j;',
    '    swap(a[i], a[minIdx]);',
    '  }',
    '}',
  ],
  (a, rec) => {
    const n = a.length;
    let cmp = 0, sw = 0;
    rec(a, { line: 1, note: `Start: ${n} items. Each pass finds the smallest remaining item and puts it at the front.`, vars: { comparisons: 0, swaps: 0 } });
    for (let i = 0; i < n - 1; i++) {
      let m = i;
      rec(a, { line: 3, note: `Pass ${i + 1}: assume a[${i}] = ${a[i]} is the minimum.`, hl: { ...doneSet(0, i - 1), [i]: 'current' }, ptr: { i, min: m }, vars: { comparisons: cmp, swaps: sw } });
      for (let j = i + 1; j < n; j++) {
        cmp++;
        const less = a[j] < a[m];
        rec(a, { line: 5, note: `Compare a[${j}] = ${a[j]} with current min ${a[m]}${less ? ' → smaller!' : '.'}`, hl: { ...doneSet(0, i - 1), [m]: 'current', [j]: 'compare' }, ptr: { i, j, min: m }, vars: { comparisons: cmp, swaps: sw } });
        if (less) {
          m = j;
          rec(a, { line: 6, note: `New minimum is ${a[m]} at index ${m}.`, hl: { ...doneSet(0, i - 1), [m]: 'current' }, ptr: { i, j, min: m }, vars: { comparisons: cmp, swaps: sw } });
        }
      }
      [a[i], a[m]] = [a[m], a[i]];
      sw++;
      rec(a, { line: 7, note: m === i ? `Minimum already at index ${i}; the swap is a no-op.` : `Swap a[${i}] and a[${m}]. ${a[i]} is now in its final place.`, hl: { ...doneSet(0, i - 1), [i]: 'swap', [m]: 'swap' }, ptr: { i, min: m }, vars: { comparisons: cmp, swaps: sw } });
    }
    rec(a, { line: 9, note: `Sorted with ${cmp} comparisons and ${sw} swaps. Selection sort always does n(n-1)/2 comparisons.`, hl: doneSet(0, n - 1), vars: { comparisons: cmp, swaps: sw } });
  },
);

export const bubble = bars(
  [
    'void bubbleSort(int a[], int n) {',
    '  for (int i = 0; i < n - 1; i++) {',
    '    bool swapped = false;',
    '    for (int j = 0; j < n - 1 - i; j++) {',
    '      if (a[j] > a[j + 1]) {',
    '        swap(a[j], a[j + 1]);',
    '        swapped = true;',
    '      }',
    '    }',
    '    if (!swapped) break;',
    '  }',
    '}',
  ],
  (a, rec) => {
    const n = a.length;
    let cmp = 0, sw = 0;
    rec(a, { line: 1, note: 'Each pass bubbles the largest unsorted item to the right end.', vars: { comparisons: 0, swaps: 0 } });
    for (let i = 0; i < n - 1; i++) {
      let swapped = false;
      rec(a, { line: 3, note: `Pass ${i + 1}. The last ${i} item(s) are already in place.`, hl: doneSet(n - i, n - 1), ptr: {}, vars: { pass: i + 1, comparisons: cmp, swaps: sw } });
      for (let j = 0; j < n - 1 - i; j++) {
        cmp++;
        const big = a[j] > a[j + 1];
        rec(a, { line: 5, note: `Compare ${a[j]} and ${a[j + 1]}${big ? ': out of order.' : ': fine.'}`, hl: { ...doneSet(n - i, n - 1), [j]: 'compare', [j + 1]: 'compare' }, ptr: { j }, vars: { pass: i + 1, comparisons: cmp, swaps: sw } });
        if (big) {
          [a[j], a[j + 1]] = [a[j + 1], a[j]];
          sw++;
          swapped = true;
          rec(a, { line: 6, note: `Swap → ${a[j]}, ${a[j + 1]}.`, hl: { ...doneSet(n - i, n - 1), [j]: 'swap', [j + 1]: 'swap' }, ptr: { j }, vars: { pass: i + 1, comparisons: cmp, swaps: sw } });
        }
      }
      if (!swapped) {
        rec(a, { line: 10, note: 'No swaps in this pass, so the array is sorted. Stop early (this is why best case is O(n)).', hl: doneSet(0, n - 1), vars: { pass: i + 1, comparisons: cmp, swaps: sw } });
        return;
      }
    }
    rec(a, { line: 12, note: `Sorted: ${cmp} comparisons, ${sw} swaps.`, hl: doneSet(0, n - 1), vars: { comparisons: cmp, swaps: sw } });
  },
);

export const insertion = bars(
  [
    'void insertionSort(int a[], int n) {',
    '  for (int i = 1; i < n; i++) {',
    '    int key = a[i];',
    '    int j = i - 1;',
    '    while (j >= 0 && a[j] > key) {',
    '      a[j + 1] = a[j];',
    '      j--;',
    '    }',
    '    a[j + 1] = key;',
    '  }',
    '}',
  ],
  (a, rec) => {
    const n = a.length;
    let cmp = 0, sh = 0;
    rec(a, { line: 1, note: 'Like sorting cards in your hand: the left part is always sorted; insert the next card into it.', hl: { 0: 'done' }, vars: { comparisons: 0, shifts: 0 } });
    for (let i = 1; i < n; i++) {
      const key = a[i];
      let j = i - 1;
      const sorted = (to: number) => doneSet(0, to);
      rec(a, { line: 3, note: `Take key = ${key} (a[${i}]).`, hl: { ...sorted(i - 1), [i]: 'current' }, ptr: { i, j }, vars: { key, comparisons: cmp, shifts: sh } });
      while (j >= 0) {
        cmp++;
        const gt = a[j] > key;
        rec(a, { line: 5, note: `Is a[${j}] = ${a[j]} > ${key}? ${gt ? 'Yes → shift it right.' : 'No → stop.'}`, hl: { ...sorted(i), [j]: 'compare', [j + 1]: 'current' }, ptr: { i, j }, vars: { key, comparisons: cmp, shifts: sh } });
        if (!gt) break;
        a[j + 1] = a[j];
        sh++;
        rec(a, { line: 6, note: `a[${j + 1}] = a[${j}] (${a[j]}).`, hl: { ...sorted(i), [j + 1]: 'swap' }, ptr: { i, j }, vars: { key, comparisons: cmp, shifts: sh } });
        j--;
      }
      a[j + 1] = key;
      rec(a, { line: 9, note: `Drop key ${key} into a[${j + 1}].`, hl: { ...sorted(i), [j + 1]: 'swap' }, ptr: { i }, vars: { key, comparisons: cmp, shifts: sh } });
    }
    rec(a, { line: 11, note: `Sorted with ${cmp} comparisons and ${sh} shifts.`, hl: doneSet(0, n - 1), vars: { comparisons: cmp, shifts: sh } });
  },
);

export const shell = bars(
  [
    'void shellSort(int a[], int n) {',
    '  for (int gap = n / 2; gap > 0; gap /= 2) {',
    '    for (int i = gap; i < n; i++) {',
    '      int temp = a[i];',
    '      int j = i;',
    '      while (j >= gap && a[j - gap] > temp) {',
    '        a[j] = a[j - gap];',
    '        j -= gap;',
    '      }',
    '      a[j] = temp;',
    '    }',
    '  }',
    '}',
  ],
  (a, rec) => {
    const n = a.length;
    let cmp = 0;
    rec(a, { line: 1, note: 'Shell sort = insertion sort on items that are "gap" apart, with the gap shrinking to 1.', vars: { comparisons: 0 } });
    for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
      rec(a, { line: 2, note: `gap = ${gap}: sort each group of items ${gap} apart.`, vars: { gap, comparisons: cmp } });
      for (let i = gap; i < n; i++) {
        const temp = a[i];
        let j = i;
        rec(a, { line: 4, note: `temp = a[${i}] = ${temp}.`, hl: { [i]: 'current' }, ptr: { i }, vars: { gap, temp, comparisons: cmp } });
        while (j >= gap) {
          cmp++;
          const gt = a[j - gap] > temp;
          rec(a, { line: 6, note: `a[${j - gap}] = ${a[j - gap]} > ${temp}? ${gt ? 'yes, move it ' + gap + ' right' : 'no'}`, hl: { [j - gap]: 'compare', [j]: 'current' }, ptr: { i, j }, vars: { gap, temp, comparisons: cmp } });
          if (!gt) break;
          a[j] = a[j - gap];
          j -= gap;
        }
        a[j] = temp;
        if (j !== i) rec(a, { line: 10, note: `Place ${temp} at index ${j}.`, hl: { [j]: 'swap' }, ptr: { i, j }, vars: { gap, comparisons: cmp } });
      }
    }
    rec(a, { line: 13, note: `Done after gap = 1 (a plain insertion sort on an almost-sorted array). ${cmp} comparisons.`, hl: doneSet(0, n - 1), vars: { comparisons: cmp } });
  },
);

export const quick = bars(
  [
    'int partition(int a[], int lo, int hi) {',
    '  int pivot = a[hi];',
    '  int i = lo - 1;',
    '  for (int j = lo; j < hi; j++) {',
    '    if (a[j] < pivot) {',
    '      i++;',
    '      swap(a[i], a[j]);',
    '    }',
    '  }',
    '  swap(a[i + 1], a[hi]);',
    '  return i + 1;',
    '}',
    'void quickSort(int a[], int lo, int hi) {',
    '  if (lo < hi) {',
    '    int p = partition(a, lo, hi);',
    '    quickSort(a, lo, p - 1);',
    '    quickSort(a, p + 1, hi);',
    '  }',
    '}',
  ],
  (a, rec) => {
    const n = a.length;
    const fixed = new Set<number>();
    let cmp = 0, sw = 0;
    const base = (lo: number, hi: number): Record<number, Role> => {
      const o: Record<number, Role> = {};
      for (let k = 0; k < n; k++) if (fixed.has(k)) o[k] = 'done';
      else if (k < lo || k > hi) o[k] = 'dim';
      return o;
    };
    const qs = (lo: number, hi: number) => {
      if (lo > hi) return;
      if (lo === hi) {
        fixed.add(lo);
        rec(a, { line: 14, note: `Range [${lo}..${hi}] has one item: already sorted.`, hl: base(lo, hi), vars: { comparisons: cmp, swaps: sw } });
        return;
      }
      const pivot = a[hi];
      let i = lo - 1;
      rec(a, { line: 2, note: `Partition [${lo}..${hi}] around pivot ${pivot} (last item).`, hl: { ...base(lo, hi), [hi]: 'current' }, ptr: { lo, hi }, vars: { pivot, comparisons: cmp, swaps: sw } });
      for (let j = lo; j < hi; j++) {
        cmp++;
        const less = a[j] < pivot;
        rec(a, { line: 5, note: `${a[j]} < ${pivot}? ${less ? 'yes → grow the "small" zone' : 'no → leave it'}`, hl: { ...base(lo, hi), [hi]: 'current', [j]: 'compare' }, ptr: { i: i < lo ? null : i, j }, vars: { pivot, comparisons: cmp, swaps: sw } });
        if (less) {
          i++;
          [a[i], a[j]] = [a[j], a[i]];
          sw++;
          rec(a, { line: 7, note: `Swap a[${i}] and a[${j}].`, hl: { ...base(lo, hi), [hi]: 'current', [i]: 'swap', [j]: 'swap' }, ptr: { i, j }, vars: { pivot, comparisons: cmp, swaps: sw } });
        }
      }
      [a[i + 1], a[hi]] = [a[hi], a[i + 1]];
      sw++;
      fixed.add(i + 1);
      rec(a, { line: 10, note: `Put pivot ${pivot} at index ${i + 1}: everything left is smaller, everything right is bigger.`, hl: { ...base(lo, hi), [i + 1]: 'done' }, ptr: { p: i + 1 }, vars: { pivot, comparisons: cmp, swaps: sw } });
      qs(lo, i);
      qs(i + 2, hi);
    };
    rec(a, { line: 13, note: 'Quick sort: pick a pivot, partition, then sort each side recursively.', vars: { comparisons: 0, swaps: 0 } });
    qs(0, n - 1);
    rec(a, { line: 19, note: `Sorted with ${cmp} comparisons and ${sw} swaps.`, hl: doneSet(0, n - 1), vars: { comparisons: cmp, swaps: sw } });
  },
);

export const heapSort: Algo<HeapState> = {
  view: 'heap',
  legend: ['compare', 'swap', 'done', 'current'],
  code: [
    'void heapify(int a[], int n, int i) {',
    '  int largest = i;',
    '  int l = 2 * i + 1, r = 2 * i + 2;',
    '  if (l < n && a[l] > a[largest]) largest = l;',
    '  if (r < n && a[r] > a[largest]) largest = r;',
    '  if (largest != i) {',
    '    swap(a[i], a[largest]);',
    '    heapify(a, n, largest);',
    '  }',
    '}',
    'void heapSort(int a[], int n) {',
    '  for (int i = n / 2 - 1; i >= 0; i--)',
    '    heapify(a, n, i);',
    '  for (int end = n - 1; end > 0; end--) {',
    '    swap(a[0], a[end]);',
    '    heapify(a, end, 0);',
    '  }',
    '}',
  ],
  input: { ...input('4, 10, 3, 5, 1, 8, 7'), random: () => randomNums(7, 1, 60) },
  init: (s) => ({ a: parseNums(s, 15).length ? parseNums(s, 15) : [4, 10, 3, 5, 1], n: parseNums(s, 15).length || 5 }),
  actions: [{ id: 'run', label: 'Sort' }],
  auto: 'run',
  run: (st) => {
    const a = [...st.a];
    let n = a.length;
    const frames: Frame<HeapState>[] = [];
    const rec = (f: Omit<Frame<HeapState>, 's'>) => frames.push({ s: { a: [...a], n }, ...f });
    const heapify = (size: number, i: number) => {
      let largest = i;
      const l = 2 * i + 1, r = 2 * i + 2;
      rec({ line: 3, note: `heapify(i=${i}): compare ${a[i]} with its children${l < size ? ' ' + a[l] : ''}${r < size ? ' and ' + a[r] : ''}.`, hl: { [i]: 'current', ...(l < size ? { [l]: 'compare' } : {}), ...(r < size ? { [r]: 'compare' } : {}) } });
      if (l < size && a[l] > a[largest]) largest = l;
      if (r < size && a[r] > a[largest]) largest = r;
      if (largest !== i) {
        [a[i], a[largest]] = [a[largest], a[i]];
        rec({ line: 7, note: `Child ${a[i]} is bigger: swap it up, then keep sifting down from index ${largest}.`, hl: { [i]: 'swap', [largest]: 'swap' } });
        heapify(size, largest);
      } else rec({ line: 6, note: `${a[i]} is ≥ its children: heap property holds here.`, hl: { [i]: 'done' } });
    };
    rec({ line: 11, note: 'The array IS the tree: children of index i live at 2i+1 and 2i+2.' });
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      rec({ line: 12, note: `Build max-heap: heapify the non-leaf node at index ${i}.`, hl: { [i]: 'current' } });
      heapify(n, i);
    }
    rec({ line: 14, note: `Max-heap built. The biggest item (${a[0]}) is at the root.`, hl: { 0: 'current' } });
    for (let end = a.length - 1; end > 0; end--) {
      [a[0], a[end]] = [a[end], a[0]];
      rec({ line: 15, note: `Swap root with a[${end}]: ${a[end]} is now in its final place.`, hl: { 0: 'swap', [end]: 'swap' } });
      n = end;
      rec({ line: 16, note: `Shrink the heap to ${end} and sift the new root down.` });
      heapify(end, 0);
    }
    n = 0;
    rec({ line: 18, note: 'Heap is empty: the array is sorted ascending.' });
    return frames;
  },
};

export const mergeSort: Algo<MergeState> = {
  view: 'merge',
  legend: ['compare', 'done'],
  code: [
    'void merge(int a[], int lo, int mid, int hi) {',
    '  vector<int> tmp;',
    '  int i = lo, j = mid + 1;',
    '  while (i <= mid && j <= hi)',
    '    tmp.push_back(a[i] <= a[j] ? a[i++] : a[j++]);',
    '  while (i <= mid) tmp.push_back(a[i++]);',
    '  while (j <= hi) tmp.push_back(a[j++]);',
    '  for (int k = 0; k < tmp.size(); k++) a[lo + k] = tmp[k];',
    '}',
    'void mergeSort(int a[], int lo, int hi) {',
    '  if (lo >= hi) return;',
    '  int mid = (lo + hi) / 2;',
    '  mergeSort(a, lo, mid);',
    '  mergeSort(a, mid + 1, hi);',
    '  merge(a, lo, mid, hi);',
    '}',
  ],
  input: { ...input('38, 27, 43, 3, 9, 82, 10'), random: () => randomNums(8, 1, 99) },
  init: (s) => {
    const a = parseNums(s, 10);
    return { segs: [{ lo: 0, vals: a.length ? a : [5, 2, 4, 1], depth: 0 }], n: a.length || 4 };
  },
  actions: [{ id: 'run', label: 'Sort' }],
  auto: 'run',
  run: (st) => {
    const segs = st.segs.map((s) => ({ ...s, vals: [...s.vals] }));
    const frames: Frame<MergeState>[] = [];
    const rec = (f: Omit<Frame<MergeState>, 's'>) => frames.push({ s: { segs: segs.map((s) => ({ ...s, vals: [...s.vals] })), n: st.n }, ...f });
    const find = (lo: number, depth: number) => segs.find((s) => s.lo === lo && s.depth === depth)!;
    let merges = 0;
    const ms = (lo: number, hi: number, depth: number) => {
      const seg = find(lo, depth);
      if (lo >= hi) {
        seg.role = 'done';
        rec({ line: 11, note: `[${seg.vals}] has one item: sorted by definition (base case).` });
        return;
      }
      const mid = Math.floor((lo + hi) / 2);
      segs.push({ lo, vals: seg.vals.slice(0, mid - lo + 1), depth: depth + 1 });
      segs.push({ lo: mid + 1, vals: seg.vals.slice(mid - lo + 1), depth: depth + 1 });
      rec({ line: 12, note: `Split [${seg.vals}] at mid = ${mid} into two halves.` });
      ms(lo, mid, depth + 1);
      ms(mid + 1, hi, depth + 1);
      const L = find(lo, depth + 1), R = find(mid + 1, depth + 1);
      L.role = 'compare';
      R.role = 'compare';
      rec({ line: 15, note: `Merge [${L.vals}] and [${R.vals}]: repeatedly take the smaller front item.` });
      const out: number[] = [];
      let i = 0, j = 0;
      while (i < L.vals.length && j < R.vals.length) out.push(L.vals[i] <= R.vals[j] ? L.vals[i++] : R.vals[j++]);
      out.push(...L.vals.slice(i), ...R.vals.slice(j));
      seg.vals = out;
      seg.role = 'done';
      L.role = 'dim';
      R.role = 'dim';
      merges++;
      rec({ line: 8, note: `Merged → [${out}].`, vars: { merges } });
    };
    rec({ line: 10, note: 'Divide until pieces have one item, then merge sorted pieces back up.' });
    ms(0, st.n - 1, 0);
    rec({ line: 16, note: `Sorted: [${find(0, 0).vals}]. Depth log₂n levels × O(n) work per level = O(n log n).` });
    return frames;
  },
};

export const pointerSort: Algo<ArrayState> = {
  view: 'array',
  legend: ['compare', 'swap', 'current', 'done'],
  code: [
    'struct Student { string name; int score; };',
    'void pointerSort(Student* p[], int n) {',
    '  for (int i = 0; i < n - 1; i++) {',
    '    int min = i;',
    '    for (int j = i + 1; j < n; j++)',
    '      if (p[j]->score < p[min]->score)',
    '        min = j;',
    '    swap(p[i], p[min]); // swap pointers only',
    '  }',
    '}',
  ],
  input: { label: 'Scores', def: '72, 95, 58, 81, 66', random: () => randomNums(5, 40, 99) },
  init: (s) => {
    const sc = parseNums(s, 7);
    const scores = sc.length ? sc : [72, 95, 58];
    const names = ['Abel', 'Bethel', 'Dawit', 'Hana', 'Kidus', 'Liya', 'Meron'];
    return {
      rows: [
        { name: 'records', a: scores, sub: names.slice(0, scores.length) },
        { name: 'p[ ]', a: scores.map((_, i) => `→${i}`) },
        { name: 'p[i]->score', a: [...scores], noIndex: true },
      ],
    };
  },
  actions: [{ id: 'run', label: 'Sort' }],
  auto: 'run',
  run: (st) => {
    const scores = st.rows[0].a as number[];
    const names = st.rows[0].sub!;
    const p = scores.map((_, i) => i);
    const n = p.length;
    const frames: Frame<ArrayState>[] = [];
    const rec = (f: Omit<Frame<ArrayState>, 's'>, hlp: Record<number, Role> = {}) =>
      frames.push({
        s: {
          rows: [
            { name: 'records', a: scores, sub: names, hl: { ...(f.hl as Record<number, Role>) } },
            { name: 'p[ ]', a: p.map((x) => `→${x}`), hl: hlp, ptr: f.ptr as Record<string, number> },
            { name: 'p[i]->score', a: p.map((x) => scores[x]), hl: hlp, noIndex: true },
          ],
        },
        ...f,
        hl: f.hl,
        ptr: {},
      });
    const done = (i: number) => Object.fromEntries(Array.from({ length: i }, (_, k) => [k, 'done'])) as Record<number, Role>;
    rec({ line: 2, note: 'The big records never move. We sort an array of pointers (here: indices) to them instead.' });
    let swaps = 0;
    for (let i = 0; i < n - 1; i++) {
      let m = i;
      for (let j = i + 1; j < n; j++) {
        rec({ line: 6, note: `Compare p[${j}]->score (${scores[p[j]]}) with p[min]->score (${scores[p[m]]}).`, hl: { [p[j]]: 'compare', [p[m]]: 'current' }, ptr: { i, j, min: m } }, { ...done(i), [j]: 'compare', [m]: 'current' });
        if (scores[p[j]] < scores[p[m]]) m = j;
      }
      [p[i], p[m]] = [p[m], p[i]];
      swaps++;
      rec({ line: 8, note: `Swap pointers p[${i}] and p[${m}]. ${names[p[i]]}'s record stayed where it was; only an int/pointer moved.`, ptr: { i } }, { ...done(i), [i]: 'swap', [m]: 'swap' });
    }
    rec({ line: 10, note: `Sorted view: ${p.map((x) => names[x]).join(' < ')}. ${swaps} pointer swaps, zero record copies.` }, done(n));
    return frames;
  },
};

export const algos = {
  'selection-sort': selection,
  'bubble-sort': bubble,
  'insertion-sort': insertion,
  'shell-sort': shell,
  'quick-sort': quick,
  'heap-sort': heapSort,
  'merge-sort': mergeSort,
  'pointer-sort': pointerSort,
};
