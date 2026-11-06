import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  { ignores: ['dist/', '.astro/', 'node_modules/', 'code/'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  {
    files: ['**/*.tsx'],
    plugins: { 'react-hooks': reactHooks },
    rules: { 'react-hooks/rules-of-hooks': 'error', 'react-hooks/exhaustive-deps': 'warn' },
  },
  {
    files: ['scripts/**'],
    languageOptions: {
      globals: { process: 'readonly', console: 'readonly', fetch: 'readonly', AbortSignal: 'readonly', window: 'readonly', document: 'readonly', localStorage: 'readonly' },
    },
  },
];
