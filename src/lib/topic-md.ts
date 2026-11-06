import fs from 'node:fs';
import path from 'node:path';
import { chapterById } from '@/data/chapters';
import { videos } from '@/data/videos';
import { topicNum, type Topic } from './catalog';

const SITE = 'https://dsa.fetehadin.com';

/** A plain-Markdown rendering of a topic page, for /learn/<slug>.md and llms-full.txt. */
export function topicMarkdown(t: Topic): string {
  const d = t.data;
  const ch = chapterById(d.chapter);
  const L: string[] = [];
  L.push(`# ${topicNum(t)} ${d.title}`, '');
  L.push(`> ${d.summary}`, '');
  L.push(`Phase: ${ch.title} · ${d.difficulty}${d.chapter === 'levelup' ? ' · optional' : ''}`);
  L.push(`URL: ${SITE}/learn/${t.id}`, '');
  L.push('## Mental model', '', (t.body ?? '').trim(), '');
  for (const c of d.code) {
    const src = fs.readFileSync(path.resolve('code', `${c.file}.cpp`), 'utf8').trimEnd();
    const outFile = path.resolve('code', `${c.file}.out`);
    L.push(`## C++ code: ${c.title}`, '', '```cpp', src, '```', '');
    if (fs.existsSync(outFile))
      L.push(
        'Expected output:',
        '',
        '```text',
        fs.readFileSync(outFile, 'utf8').trimEnd(),
        '```',
        '',
      );
  }
  L.push(
    '## Complexity',
    '',
    '| Case | Cost |',
    '| --- | --- |',
    ...d.complexity.rows.map(([k, v]) => `| ${k} | ${v} |`),
    '',
  );
  if (d.complexity.space) L.push(`Space: ${d.complexity.space}`);
  if (d.complexity.stable != null) L.push(`Stable: ${d.complexity.stable ? 'yes' : 'no'}`);
  if (d.complexity.inPlace != null) L.push(`In-place: ${d.complexity.inPlace ? 'yes' : 'no'}`);
  if (d.complexity.note) L.push('', d.complexity.note);
  L.push(
    '',
    '## Videos',
    '',
    ...d.videos.map(
      (v) =>
        `- [${videos[v.id]?.title ?? v.id}](https://youtu.be/${v.id}) (${videos[v.id]?.channel ?? 'YouTube'}): ${v.why}`,
    ),
    '',
  );
  L.push(
    '## Exam lens',
    '',
    'Likely questions:',
    '',
    ...d.exam.questions.map((q) => `- ${q}`),
    '',
    'Common mistakes:',
    '',
    ...d.exam.mistakes.map((m) => `- ${m}`),
    '',
  );
  L.push('## Quick check', '');
  d.quiz.forEach((q, i) => {
    L.push(`${i + 1}. ${q.q}`);
    if (q.code) L.push('', '```cpp', q.code, '```');
    q.options.forEach((o, k) => L.push(`   ${String.fromCharCode(65 + k)}. ${o}`));
    L.push(`   Answer: ${String.fromCharCode(65 + q.answer)}. ${q.explain}`, '');
  });
  const P = d.practice;
  L.push(
    '## Practice',
    '',
    `**Trace by hand.** ${P.trace.task}`,
    '',
    `Solution:\n\n${P.trace.solution}`,
    '',
  );
  L.push(`**Implement it.** ${P.implement.task}`, '', `Hint: ${P.implement.hint}`, '');
  if (P.implement.solution) L.push(P.implement.solution, '');
  L.push(
    '**Problems:**',
    '',
    ...P.problems.map((p) => `- [${p.name}](${p.url}) (${p.level}). Hint: ${p.hint}`),
    '',
  );
  L.push('## Mastery checklist', '', ...d.checklist.map((c) => `- [ ] ${c}`), '');
  return L.join('\n');
}
