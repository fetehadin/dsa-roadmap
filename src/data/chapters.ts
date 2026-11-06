/** The roadmap's phases. Topics point at a phase through their `chapter` frontmatter field. */
export type ChapterId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 'levelup';

export interface Chapter {
  id: ChapterId;
  slug: string;
  num: string;
  title: string;
  short: string;
  blurb: string;
  /** lab project that caps this phase */
  lab?: string;
}

export const chapters: Chapter[] = [
  {
    id: 1,
    slug: 'phase-1',
    num: '01',
    title: 'Foundations',
    short: 'Foundations',
    blurb:
      'What a data structure is, the C++ you need (pointers, references, recursion), and how to measure an algorithm with Big-O.',
  },
  {
    id: 2,
    slug: 'phase-2',
    num: '02',
    title: 'Linear Structures',
    short: 'Linear',
    blurb: 'Arrays, singly and doubly linked lists, stacks and queues: storing items in a line.',
    lab: 'library-manager',
  },
  {
    id: 3,
    slug: 'phase-3',
    num: '03',
    title: 'Searching & Sorting',
    short: 'Search & Sort',
    blurb: 'Linear and binary search, then every classic sort from bubble to quick sort.',
    lab: 'grade-analyzer',
  },
  {
    id: 4,
    slug: 'phase-4',
    num: '04',
    title: 'Trees',
    short: 'Trees',
    blurb: 'Binary trees, binary search trees, traversals, balanced trees and heaps.',
  },
  {
    id: 5,
    slug: 'phase-5',
    num: '05',
    title: 'Hashing',
    short: 'Hashing',
    blurb: 'Hash functions and collision handling for near-instant lookup.',
  },
  {
    id: 6,
    slug: 'phase-6',
    num: '06',
    title: 'Graphs',
    short: 'Graphs',
    blurb: 'Vertices and edges, adjacency matrix and list, BFS, DFS and shortest paths.',
    lab: 'map-navigator',
  },
  {
    id: 7,
    slug: 'phase-7',
    num: '07',
    title: 'Algorithm Design',
    short: 'Design',
    blurb: 'The big strategies: divide and conquer, greedy choices and dynamic programming.',
  },
  {
    id: 'levelup',
    slug: 'level-up',
    num: 'LU',
    title: 'Level Up: Problem Patterns',
    short: 'Level Up',
    blurb:
      'Optional interview patterns built on the roadmap: two pointers, sliding window, prefix sums and more.',
  },
];

/** Core phases only (no Level Up). */
export const phases = chapters.filter((c) => c.id !== 'levelup');

export const chapterById = (id: ChapterId | string | number) =>
  chapters.find((c) => String(c.id) === String(id))!;

export const CORE_RULE = "Don't just watch: implement it yourself, then solve 2–3 problems.";
