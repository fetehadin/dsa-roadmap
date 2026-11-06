import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const quizItem = z.object({
  q: z.string(),
  code: z.string().optional(),
  options: z.array(z.string()).min(2),
  answer: z.number().int().min(0),
  explain: z.string(),
});

const topics = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/topics' }),
  schema: z.object({
    title: z.string(),
    chapter: z.union([z.number().int().min(1).max(7), z.literal('levelup')]),
    order: z.number(),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    summary: z.string(),
    viz: z
      .array(
        z.object({ id: z.string(), title: z.string().optional(), caption: z.string().optional() }),
      )
      .default([]),
    code: z.array(z.object({ file: z.string(), title: z.string() })).min(1),
    complexity: z.object({
      rows: z.array(z.tuple([z.string(), z.string()])),
      space: z.string().optional(),
      stable: z.boolean().nullable().optional(),
      inPlace: z.boolean().nullable().optional(),
      note: z.string().optional(),
    }),
    videos: z
      .array(z.object({ id: z.string(), why: z.string() }))
      .min(1)
      .max(3),
    exam: z.object({ questions: z.array(z.string()), mistakes: z.array(z.string()) }),
    quiz: z.array(quizItem).min(3).max(5),
    practice: z.object({
      trace: z.object({ task: z.string(), solution: z.string() }),
      implement: z.object({ task: z.string(), hint: z.string(), solution: z.string().optional() }),
      problems: z
        .array(
          z.object({
            name: z.string(),
            url: z.string().url(),
            level: z.enum(['easy', 'medium', 'hard']),
            hint: z.string(),
            solution: z.string().optional(),
          }),
        )
        .min(2)
        .max(4),
    }),
    checklist: z.array(z.string()).min(3).max(5),
    keywords: z.array(z.string()).default([]),
  }),
});

const labs = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/labs' }),
  schema: z.object({
    title: z.string(),
    phase: z.number().int(),
    summary: z.string(),
    starter: z.string(),
    solution: z.string(),
    sampleInput: z.string(),
    milestones: z.array(z.string()),
    uses: z.array(z.string()),
  }),
});

export const collections = { topics, labs };
