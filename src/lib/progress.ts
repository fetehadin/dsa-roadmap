export interface TopicProgress {
  done?: boolean;
  doneAt?: string;
  quiz?: { score: number; total: number };
  checks?: number[];
  videos?: string[];
  notes?: string;
  bookmark?: boolean;
  visitedAt?: string;
}

export interface ProgressData {
  v: 1;
  topics: Record<string, TopicProgress>;
  days: string[];
  last?: string;
  milestones?: number[];
  exams?: { at: string; score: number; total: number; chapters: string[] }[];
}

const KEY = 'dsa-roadmap:v1';
const EVT = 'dsa:progress';
let memory: ProgressData | null = null;
let storageOk: boolean | null = null;

const empty = (): ProgressData => ({ v: 1, topics: {}, days: [] });

export function storageAvailable(): boolean {
  if (storageOk !== null) return storageOk;
  try {
    const k = '__dsa_test__';
    localStorage.setItem(k, '1');
    localStorage.removeItem(k);
    storageOk = true;
  } catch {
    storageOk = false;
  }
  return storageOk;
}

function sanitize(raw: unknown): ProgressData {
  if (!raw || typeof raw !== 'object') return empty();
  const r = raw as Partial<ProgressData>;
  return {
    v: 1,
    topics: r.topics && typeof r.topics === 'object' ? r.topics : {},
    days: Array.isArray(r.days) ? r.days.filter((d) => typeof d === 'string') : [],
    last: typeof r.last === 'string' ? r.last : undefined,
    milestones: Array.isArray(r.milestones) ? r.milestones : [],
    exams: Array.isArray(r.exams) ? r.exams : [],
  };
}

export function load(): ProgressData {
  if (memory) return memory;
  try {
    const s = localStorage.getItem(KEY);
    memory = s ? sanitize(JSON.parse(s)) : empty();
  } catch {
    memory = empty();
  }
  return memory;
}

function save(data: ProgressData) {
  memory = data;
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* storage blocked or full: keep in memory for this session */
  }
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(EVT));
}

export function update(fn: (d: ProgressData) => void) {
  const d = structuredClone(load());
  fn(d);
  save(d);
}

export function topic(slug: string): TopicProgress {
  return load().topics[slug] ?? {};
}

export function patchTopic(slug: string, patch: Partial<TopicProgress>) {
  update((d) => {
    d.topics[slug] = { ...(d.topics[slug] ?? {}), ...patch };
  });
}

export const today = () => {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
};

export function touchDay() {
  const d = today();
  if (!load().days.includes(d)) update((p) => void p.days.push(d));
}

export function streak(days = load().days): number {
  const set = new Set(days);
  let n = 0;
  const cur = new Date();
  const key = (x: Date) =>
    `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
  if (!set.has(key(cur))) cur.setDate(cur.getDate() - 1);
  while (set.has(key(cur))) {
    n++;
    cur.setDate(cur.getDate() - 1);
  }
  return n;
}

export function subscribe(cb: () => void): () => void {
  const h = () => cb();
  const s = (e: StorageEvent) => {
    if (e.key === KEY) {
      memory = null;
      cb();
    }
  };
  window.addEventListener(EVT, h);
  window.addEventListener('storage', s);
  return () => {
    window.removeEventListener(EVT, h);
    window.removeEventListener('storage', s);
  };
}

export function exportJson(): string {
  return JSON.stringify({ ...load(), exportedAt: new Date().toISOString() }, null, 2);
}

export function importJson(text: string): boolean {
  try {
    const parsed = JSON.parse(text);
    if (!parsed || parsed.v !== 1 || typeof parsed.topics !== 'object') return false;
    save(sanitize(parsed));
    return true;
  } catch {
    return false;
  }
}

export function reset() {
  memory = empty();
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(EVT));
}
