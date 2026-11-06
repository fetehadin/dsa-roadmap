export type ChapterId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 'levelup';

export interface Chapter {
  id: ChapterId;
  slug: string;
  num: string;
  title: string;
  short: string;
  blurb: string;
  phase: 1 | 2 | 3 | 0;
  weeks: string;
  accent: { dark: string; light: string };
  slides?: { title: string; id: string }[];
}

export const chapters: Chapter[] = [
  {
    id: 1,
    slug: 'ch1',
    num: '01',
    title: 'Introduction to Data Structures',
    short: 'Intro to DS',
    blurb: 'What a data structure is, how we classify them, ADTs and abstraction, plus an array refresher.',
    phase: 1,
    weeks: 'Week 1',
    accent: { dark: '#22d3ee', light: '#0e7490' },
    slides: [{ title: 'Basic Data Structures', id: '1LTAaL6u2_Ba3RFnQh3FcSJdxNDQawz2b-yvHEaO9zsc' }],
  },
  {
    id: 2,
    slug: 'ch2',
    num: '02',
    title: 'Algorithm & Algorithm Analysis',
    short: 'Analysis',
    blurb: 'Properties of algorithms, counting time units, best/average/worst case and asymptotic notation.',
    phase: 1,
    weeks: 'Weeks 2–3',
    accent: { dark: '#818cf8', light: '#4f46e5' },
  },
  {
    id: 3,
    slug: 'ch3',
    num: '03',
    title: 'Simple Sorting & Searching',
    short: 'Simple Sorts',
    blurb: 'Selection, bubble, insertion and pointer sort; linear and binary search; a recursion primer.',
    phase: 1,
    weeks: 'Weeks 3–4',
    accent: { dark: '#fb923c', light: '#c2410c' },
    slides: [{ title: 'Sorting Basics', id: '1anH6KfsTG4Y6j0oMo4lCd2os1ce-HlGhJ4tzOl9jHn0' }],
  },
  {
    id: 4,
    slug: 'ch4',
    num: '04',
    title: 'Linked Lists',
    short: 'Linked Lists',
    blurb: 'Pointers and the heap, then singly and doubly linked lists: insert, delete, search, traverse.',
    phase: 2,
    weeks: 'Weeks 5–6',
    accent: { dark: '#2dd4bf', light: '#0f766e' },
    slides: [{ title: 'Linked List', id: '1UbdePhTxVSLqzw-OPSKJiLvqI8pvdHGJMEnOGhzKN38' }],
  },
  {
    id: 5,
    slug: 'ch5',
    num: '05',
    title: 'Stacks & Queues',
    short: 'Stacks & Queues',
    blurb: 'LIFO and FIFO with arrays and linked lists, the circular queue, and the STL containers.',
    phase: 2,
    weeks: 'Weeks 7–8',
    accent: { dark: '#e879f9', light: '#a21caf' },
    slides: [
      { title: 'Stacks, Queues and Monotonicity', id: '1RrPRDycXJ0Fh3djRVLo2bzNNHx4ljGC4IDvWyIVOvIM' },
    ],
  },
  {
    id: 6,
    slug: 'ch6',
    num: '06',
    title: 'Trees',
    short: 'Trees',
    blurb: 'Binary trees and BSTs: insert, search, delete, traversals, and general trees.',
    phase: 2,
    weeks: 'Weeks 9–10',
    accent: { dark: '#a3e635', light: '#4d7c0f' },
  },
  {
    id: 7,
    slug: 'ch7',
    num: '07',
    title: 'Graphs',
    short: 'Graphs',
    blurb: 'Vocabulary, adjacency matrix and list, directed graphs, BFS and DFS.',
    phase: 3,
    weeks: 'Weeks 11–12',
    accent: { dark: '#38bdf8', light: '#0369a1' },
  },
  {
    id: 8,
    slug: 'ch8',
    num: '08',
    title: 'Advanced Sorting & Searching',
    short: 'Advanced Sorts',
    blurb: 'Heap, quick, merge and shell sort, then hashing for near-instant search.',
    phase: 3,
    weeks: 'Weeks 13–15',
    accent: { dark: '#facc15', light: '#a16207' },
  },
  {
    id: 'levelup',
    slug: 'level-up',
    num: 'LU',
    title: 'Level Up: Problem Patterns',
    short: 'Level Up',
    blurb: 'Optional interview patterns built on this course. Not on the exam.',
    phase: 0,
    weeks: 'Anytime',
    accent: { dark: '#34d399', light: '#047857' },
    slides: [
      { title: 'Two Pointers', id: '1pobcKAS8OXWsGtVvfPhJAXOm8zU_FD-0oBI8vhQ90Gc' },
      { title: 'Sliding Window', id: '100Y79piELHmtZmLks9c4LYAw5htoh3OWTBmwSaQauzw' },
      { title: 'Prefix Sum', id: '1ATUDfM_6uqhwTPe0O8vlifjT-yeVNOd3h_u4qxugfKA' },
      { title: 'Linked List (fast & slow)', id: '1UbdePhTxVSLqzw-OPSKJiLvqI8pvdHGJMEnOGhzKN38' },
      {
        title: 'Stacks, Queues and Monotonicity',
        id: '1RrPRDycXJ0Fh3djRVLo2bzNNHx4ljGC4IDvWyIVOvIM',
      },
    ],
  },
];

export const phases = [
  {
    n: 1 as const,
    title: 'Foundations',
    weeks: 'Weeks 1–4',
    chapters: [1, 2, 3] as ChapterId[],
    lab: 'grade-analyzer',
  },
  {
    n: 2 as const,
    title: 'Linear & Hierarchical',
    weeks: 'Weeks 5–10',
    chapters: [4, 5, 6] as ChapterId[],
    lab: 'library-manager',
  },
  {
    n: 3 as const,
    title: 'Graphs, Fast Sorts & Exam Prep',
    weeks: 'Weeks 11–16',
    chapters: [7, 8] as ChapterId[],
    lab: 'campus-navigator',
  },
];

export const chapterById = (id: ChapterId | string | number) =>
  chapters.find((c) => String(c.id) === String(id))!;

export const slideUrl = (id: string) => `https://docs.google.com/presentation/d/${id}/edit`;

export const CORE_RULE = "Don't just watch: implement it yourself, then solve 2–3 problems.";
