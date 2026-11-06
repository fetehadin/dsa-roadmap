<img src="assets/icon.svg" width="64" height="64" alt="">

# DSA Roadmap · [dsa.fetehadin.com](https://dsa.fetehadin.com)

A free, self-paced roadmap to **data structures and algorithms in C++**, for students, self-taught developers and interview prep. Seven phases, from foundations to algorithm design: every topic opens a side panel with an explanation, a C++ snippet, complexity and practice ideas, and links to a full lesson with step-through visuals, quizzes and problems. Progress is saved in `localStorage`. No backend, no login.

> Don't just watch: implement it yourself, then solve 2–3 problems.

## Develop

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # static site in dist/
npm run preview      # serve dist/
```

Quality gates (run them all before you push):

| Command | What it checks |
| --- | --- |
| `npm run check:cpp` | compiles every `code/**/*.cpp` with `g++ -std=c++17 -Wall -Wextra`, runs it (stdin from `.in`), diffs stdout with `.out`. Starter files are compile-only. `--update` rewrites `.out`. Filter: `npm run check:cpp -- bst` |
| `npm run check:links` | every video ID (YouTube oEmbed), every internal link in `dist/`, every external URL. Build first. `-- --offline` skips the network |
| `npm run check` | `astro check` (TypeScript, strict) |
| `npm run lint` / `npm run format` | ESLint / Prettier |
| `npm run og` | regenerates `public/og/*.png` (commit the result) |
| `node scripts/shots.mjs /path …` | screenshots at 360 px and 1280 px, dark and light, into `.shots/` (needs a running dev/preview server and Chromium) |

## How it is built

```
code/                 C++ for every topic (*.cpp + expected *.out, optional *.in); labs/ has starters and solutions
src/content/topics/   one MDX per topic: frontmatter = all structured content, body = the mental model
src/content/labs/     one MDX per lab
src/data/             chapters.ts (the 7 phases), roadmap.ts (coming-soon nodes), videos, glossary
src/components/Roadmap.astro   the roadmap, side panel / bottom sheet, progress (vanilla script, no extra libraries)
src/viz/              the step engine: algos/*.ts yield frames, Player.tsx plays them, views.tsx draws them
src/components/       TopicPage (the 11-section template), CodeBlock, islands/ (React: quiz, checklist, exam, dashboard…)
src/pages/            routes, plus llms.txt, llms-full.txt, /learn/<slug>.md, search.json, exam-pool.json
```

**One step engine.** Each visualizer is an `Algo` (`src/viz/types.ts`): `init(input)` builds a state, `run(state, action, value)` returns `Frame[]` (`{ s, note, line, hl, ptr, vars, aux }`). The single `Player` handles play/pause, step, back, speed, reset, keyboard shortcuts, and the highlighted code line. Colours: compare = amber, swap = rose, done = green, visited = blue, current = violet.

**Progress** lives under one `localStorage` key (`dsa-roadmap:v1`). Every access is wrapped in `try/catch`; when storage is blocked, the site keeps state in memory and the Progress page warns the user.

## Add a topic

1. **Code.** Write `code/my-topic.cpp` with a tiny `main()`. Run `npm run check:cpp -- my-topic --update` to create `my-topic.out`, read it, and fix anything that looks wrong.
2. **Page.** Copy an existing file in `src/content/topics/` (for example `bubble-sort.mdx`) to `my-topic.mdx`. Set `chapter` (phase 1–7, or `levelup`), `order`, `difficulty`, `summary`, and `code: [{ file: my-topic, title: my-topic.cpp }]`. The file name becomes the URL (`/learn/my-topic`).
3. **Content.** Fill in `complexity`, `exam`, 3–5 `quiz` items (`answer` is a 0-based index), `practice` (trace, implement, 2–4 problems) and 3–5 `checklist` lines. The body is the plain-English mental model. The schema in `src/content.config.ts` rejects missing pieces at build time.
4. **Video.** Add the ID to `src/data/videos.ts` (title, channel, seconds), reference it under `videos:`, then run `npm run check:links`.
5. **Roadmap.** The topic appears on the roadmap automatically in phase `chapter`, at position `order`. If a `coming soon` node in `src/data/roadmap.ts` has the same slug, delete it there.
6. **Visual (optional).** Reuse an existing `viz` id (see `src/viz/registry.ts`), or add an `Algo` to a module in `src/viz/algos/` and register its id in `index`.

Run `npm run build`. Navigation, search, prev/next, cheat sheets, the Big-O table, exam mode, `llms.txt` and the raw `.md` all pick the new topic up automatically.

## Deploy on Cloudflare Pages

1. Push the repo to GitHub, then go to **Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git**.
2. Framework preset **Astro**; build command `npm run build`; output directory `dist`. Set the environment variable `NODE_VERSION` = `22` (or newer).
3. After the first deploy, open **Custom domains → Set up a custom domain** and enter `dsa.fetehadin.com`. If the zone is on Cloudflare this adds the record for you. Otherwise, at your DNS provider, add `CNAME dsa → <project>.pages.dev`.
4. `public/_headers` sets long cache lifetimes for hashed assets. `robots.txt` and `sitemap-index.xml` are generated.

**Current setup: direct upload.** The live project is `dsa-roadmap` (`dsa-roadmap-bl4.pages.dev`), deployed without Git:

```bash
npm run build
cp -r dist /tmp/dsa-dist && cd /tmp
npx wrangler pages deploy /tmp/dsa-dist --project-name dsa-roadmap --branch main
```

Run wrangler **outside** the repo. Inside it, wrangler detects Astro and rewrites `astro.config.mjs`, `package.json`, `tsconfig.json` and adds `wrangler.jsonc` to turn the site into a Worker. This site is purely static, so revert those changes if it happens.

The C++ and link checks need `g++` and the network, so run them locally (or in CI) instead of in the Pages build.

## Credits

Videos are embedded from their creators' channels (mycodeschool, Abdul Bari, Michael Sambol, NeetCode and others, credited on each page). Textbook: Goodrich, Tamassia & Mount, *Data Structures and Algorithms in C++*.
