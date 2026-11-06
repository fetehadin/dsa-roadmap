import { Marked } from 'marked';
import { createHighlighter, type Highlighter } from 'shiki';
import katex from 'katex';

let hl: Promise<Highlighter> | null = null;
export const highlighter = () =>
  (hl ??= createHighlighter({ themes: ['github-light', 'github-dark-dimmed'], langs: ['cpp', 'text'] }));

export async function highlight(code: string, lang = 'cpp') {
  const h = await highlighter();
  return h.codeToHtml(code, {
    lang: h.getLoadedLanguages().includes(lang) ? lang : 'text',
    themes: { light: 'github-light', dark: 'github-dark-dimmed' },
    defaultColor: 'light',
  });
}

let marked: Marked | null = null;
async function getMarked() {
  if (marked) return marked;
  const h = await highlighter();
  marked = new Marked({
    gfm: true,
    renderer: {
      code({ text, lang }) {
        return h.codeToHtml(text, {
          lang: lang && h.getLoadedLanguages().includes(lang) ? lang : 'cpp',
          themes: { light: 'github-light', dark: 'github-dark-dimmed' },
          defaultColor: 'light',
        });
      },
    },
  });
  return marked;
}

const math = (s: string) =>
  s.replace(/\$([^$\n]+?)\$/g, (_, tex) => {
    try {
      return katex.renderToString(tex, { throwOnError: false });
    } catch {
      return tex;
    }
  });

/** Block markdown (paragraphs, lists, code fences). `$…$` becomes KaTeX. */
export async function md(s = '') {
  return (await getMarked()).parse(math(s)) as string;
}
/** Inline markdown only. */
export async function mdi(s = '') {
  return (await getMarked()).parseInline(math(s)) as string;
}
