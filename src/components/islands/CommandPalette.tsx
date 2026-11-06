import { useEffect, useMemo, useRef, useState } from 'react';
import type Fuse from 'fuse.js';
import { BookOpen, FileText, FlaskConical, Hash, Search, Sparkles } from 'lucide-react';

interface Item {
  title: string;
  url: string;
  type: 'Topic' | 'Glossary' | 'Cheat sheet' | 'Page' | 'Lab' | 'Level Up';
  sub?: string;
  text?: string;
}

const icons = {
  Topic: BookOpen,
  Glossary: Hash,
  'Cheat sheet': FileText,
  Page: Sparkles,
  Lab: FlaskConical,
  'Level Up': Sparkles,
};

export default function CommandPalette({ startOpen = false }: { startOpen?: boolean }) {
  const [open, setOpen] = useState(startOpen);
  const [q, setQ] = useState('');
  const [items, setItems] = useState<Item[] | null>(null);
  const [fuse, setFuse] = useState<Fuse<Item> | null>(null);
  const [sel, setSel] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const show = () => {
      lastFocus.current = document.activeElement as HTMLElement;
      setOpen(true);
    };
    const btn = document.getElementById('open-search');
    btn?.addEventListener('click', show);
    const key = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      const typing = t.closest('input,textarea,select,[contenteditable="true"]');
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        show();
      } else if (e.key === '/' && !typing) {
        e.preventDefault();
        show();
      }
    };
    window.addEventListener('keydown', key);
    return () => {
      btn?.removeEventListener('click', show);
      window.removeEventListener('keydown', key);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    input.current?.focus();
    document.body.style.overflow = 'hidden';
    if (!items)
      Promise.all([
        fetch('/search.json').then((r) => r.json() as Promise<Item[]>),
        import('fuse.js'),
      ]).then(([data, F]) => {
        setItems(data);
        setFuse(
          new F.default(data, {
            keys: [
              { name: 'title', weight: 3 },
              { name: 'sub', weight: 1 },
              { name: 'text', weight: 0.6 },
            ],
            threshold: 0.36,
            ignoreLocation: true,
          }),
        );
      });
    return () => {
      document.body.style.overflow = '';
    };
  }, [open, items]);

  const results = useMemo(() => {
    if (!items) return [];
    if (!q.trim()) return items.filter((i) => i.type === 'Topic' || i.type === 'Page').slice(0, 12);
    return (fuse?.search(q, { limit: 14 }) ?? []).map((r) => r.item);
  }, [q, items, fuse]);

  useEffect(() => setSel(0), [q]);

  const close = () => {
    setOpen(false);
    setQ('');
    lastFocus.current?.focus();
  };
  const go = (i?: Item) => {
    if (!i) return;
    window.location.href = i.url;
  };

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[60] grid items-start bg-black/50 px-3 pt-[10vh] backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && close()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        className="card anim-pop mx-auto w-full max-w-xl overflow-hidden"
      >
        <div className="flex items-center gap-2 border-b border-line px-4">
          <Search size={17} className="text-faint" aria-hidden="true" />
          <input
            ref={input}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') close();
              else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSel((s) => Math.min(results.length - 1, s + 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSel((s) => Math.max(0, s - 1));
              } else if (e.key === 'Enter') go(results[sel]);
            }}
            placeholder="Search topics, terms, cheat sheets…"
            className="h-13 flex-1 bg-transparent text-base outline-none placeholder:text-faint"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-activedescendant={results[sel] ? `pi-${sel}` : undefined}
            aria-label="Search"
          />
          <button className="kbd" onClick={close} aria-label="Close search">
            esc
          </button>
        </div>
        <ul id="palette-list" role="listbox" className="max-h-[55vh] overflow-y-auto p-1.5">
          {!items && <li className="px-3 py-6 text-center text-sm text-muted">Loading…</li>}
          {items && results.length === 0 && (
            <li className="px-3 py-6 text-center text-sm text-muted">
              No matches. Try "stack", "Big-O" or "leaf".
            </li>
          )}
          {results.map((r, i) => {
            const Icon = icons[r.type];
            return (
              <li key={r.url + r.title} id={`pi-${i}`} role="option" aria-selected={i === sel}>
                <a
                  href={r.url}
                  onMouseEnter={() => setSel(i)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 ${i === sel ? 'bg-accent-soft' : ''}`}
                >
                  <Icon size={16} className="shrink-0 text-accent" aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{r.title}</span>
                    {r.sub && <span className="block truncate text-xs text-muted">{r.sub}</span>}
                  </span>
                  <span className="chip shrink-0 !text-[0.65rem]">{r.type}</span>
                </a>
              </li>
            );
          })}
        </ul>
        <div className="flex gap-3 border-t border-line px-4 py-2 text-xs text-faint">
          <span>
            <span className="kbd">↑↓</span> move
          </span>
          <span>
            <span className="kbd">↵</span> open
          </span>
          <span>
            <span className="kbd">esc</span> close
          </span>
        </div>
      </div>
    </div>
  );
}
