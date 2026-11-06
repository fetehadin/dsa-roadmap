export type Role = 'compare' | 'swap' | 'done' | 'visited' | 'current' | 'found' | 'dim' | 'bad';

export type ViewKind =
  | 'bars'
  | 'array'
  | 'list'
  | 'tree'
  | 'heap'
  | 'graph'
  | 'stack'
  | 'ring'
  | 'callstack'
  | 'tally'
  | 'proof'
  | 'merge'
  | 'hash'
  | 'memory';

export interface Aux {
  label: string;
  items: (string | number)[];
  kind?: 'stack' | 'queue' | 'list';
}

/** One step of an algorithm: a full snapshot plus what to highlight. */
export interface Frame<S = unknown> {
  s: S;
  note: string;
  line?: number;
  hl?: Record<string | number, Role>;
  ptr?: Record<string, number | string | null | undefined>;
  vars?: Record<string, string | number>;
  aux?: Aux[];
}

export interface Action {
  id: string;
  label: string;
  /** whether the action needs a number from the user */
  value?: boolean;
  def?: number;
  /** whether the action also needs a position */
  pos?: boolean;
  code?: string[];
}

export interface Algo<S = unknown> {
  view: ViewKind;
  code: string[];
  input?: {
    label: string;
    def: string;
    presets?: { label: string; value: string }[];
    random?: () => string;
    hint?: string;
  };
  init: (input: string) => S;
  actions: Action[];
  run: (s: S, action: string, value?: number, pos?: number) => Frame<S>[];
  legend?: Role[];
  /** start by running this action automatically */
  auto?: string;
}

export const roleVar: Record<Role, string> = {
  compare: 'var(--r-compare)',
  swap: 'var(--r-swap)',
  done: 'var(--r-done)',
  visited: 'var(--r-visited)',
  current: 'var(--r-current)',
  found: 'var(--r-found)',
  dim: 'var(--border-strong)',
  bad: 'var(--r-swap)',
};

export const roleLabel: Record<Role, string> = {
  compare: 'compare',
  swap: 'swap / write',
  done: 'done',
  visited: 'visited',
  current: 'current / pointer',
  found: 'found',
  dim: 'ignored',
  bad: 'error',
};

export const parseNums = (s: string, max = 16): number[] =>
  s
    .split(/[\s,]+/)
    .map((x) => parseInt(x, 10))
    .filter((x) => Number.isFinite(x))
    .slice(0, max)
    .map((x) => Math.max(-999, Math.min(999, x)));

export const randomNums = (n = 8, lo = 1, hi = 50) =>
  Array.from({ length: n }, () => lo + Math.floor(Math.random() * (hi - lo + 1))).join(', ');

export const clone = <T,>(x: T): T => structuredClone(x);
