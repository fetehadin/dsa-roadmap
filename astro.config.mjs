import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { unified } from '@astrojs/markdown-remark';

export default defineConfig({
  site: 'https://dsa.fetehadin.com',
  trailingSlash: 'ignore',
  redirects: { '/learn': '/' },
  integrations: [mdx(), react(), sitemap()],
  markdown: {
    processor: unified({ remarkPlugins: [remarkMath], rehypePlugins: [rehypeKatex] }),
    shikiConfig: { themes: { light: 'github-light', dark: 'github-dark-dimmed' } },
  },
  vite: { plugins: [tailwindcss()] },
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
});
