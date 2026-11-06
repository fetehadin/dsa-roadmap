import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Bookmark, Download, Flame, RotateCcw, Upload } from 'lucide-react';
import { exportJson, importJson, load, reset, storageAvailable, streak, subscribe, type ProgressData } from '@/lib/progress';
import { getCatalog, stats } from '@/lib/client-catalog';
import Ring from './Ring';
import type { ChapterId } from '@/data/chapters';

interface Ch {
  id: ChapterId;
  num: string;
  short: string;
  slug: string;
  accent: string;
}
interface Phase {
  n: number;
  title: string;
  chapters: ChapterId[];
  lab: string;
}

export default function Dashboard({ chapters, phases }: { chapters: Ch[]; phases: Phase[] }) {
  const [p, setP] = useState<ProgressData | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [ok, setOk] = useState(true);
  const file = useRef<HTMLInputElement>(null);
  const confirmDlg = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const f = () => setP(load());
    f();
    setOk(storageAvailable());
    return subscribe(f);
  }, []);
  if (!p) return <div className="card h-64 animate-pulse" aria-hidden="true" />;

  const s = stats(p);
  const cat = getCatalog();
  const st = streak(p.days);
  const bookmarks = cat.filter((c) => p.topics[c.slug]?.bookmark);
  const exams = p.exams ?? [];
  const best = exams.length ? Math.max(...exams.map((e) => Math.round((e.score / e.total) * 100))) : null;
  const phasePct = (ph: Phase) => {
    const list = cat.filter((c) => ph.chapters.includes(c.chapter));
    return list.length ? Math.round((list.filter((c) => p.topics[c.slug]?.done).length / list.length) * 100) : 0;
  };

  const doExport = () => {
    const blob = new Blob([exportJson()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `dsa-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    setMsg('Exported. Keep the file somewhere safe.');
  };
  const doImport = async (f?: File) => {
    if (!f) return;
    const okay = importJson(await f.text());
    setMsg(okay ? 'Progress imported.' : 'That file is not a DSA Roadmap export.');
    if (file.current) file.current.value = '';
  };

  return (
    <div className="grid gap-5">
      {!ok && (
        <p className="card flex items-start gap-3 border-[var(--r-compare)] p-4 text-sm" role="alert">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-[var(--r-compare)]" />
          <span>Your browser is blocking storage (private mode or strict settings). Everything works, but progress is lost when you close this tab. Use <b>Export</b> before leaving.</span>
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-4">
        <div className="card flex items-center gap-4 p-4 sm:col-span-2">
          <Ring pct={s.pct} size={84} stroke={8} label={`${s.pct}% of the course complete`} />
          <div>
            <div className="text-2xl font-bold">{s.done}/{s.total}</div>
            <div className="text-sm text-muted">core topics mastered</div>
            {s.nextUp && <a href={`/learn/${s.nextUp.slug}`} className="btn btn-sm btn-primary mt-2">Next: {s.nextUp.num} {s.nextUp.title}</a>}
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-1.5 text-2xl font-bold"><Flame size={22} className={st ? 'anim-flicker text-[var(--r-compare)]' : 'text-faint'} /> {st}</div>
          <div className="text-sm text-muted">day streak · {p.days.length} study day{p.days.length === 1 ? "" : "s"}</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-bold">{s.quizAvg === null ? '–' : `${s.quizAvg}%`}</div>
          <div className="text-sm text-muted">quiz average ({s.quizCount} taken){best !== null && ` · best exam ${best}%`}</div>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-semibold">Phases</h2>
        <div className="mt-3 grid gap-3">
          {phases.map((ph) => {
            const pct = phasePct(ph);
            const lab = p.topics[`lab:${ph.lab}`]?.done;
            return (
              <div key={ph.n}>
                <div className="flex justify-between text-sm"><span>Phase {ph.n}: {ph.title}{lab && ' · lab ✓'}</span><span className="font-mono text-muted">{pct}%</span></div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-soft"><div className="h-full rounded-full bg-accent transition-all duration-700" style={{ width: `${pct}%` }} /></div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {chapters.map((c) => {
          const b = s.byChapter(c.id);
          return (
            <a key={String(c.id)} href={c.id === 'levelup' ? '/level-up' : `/learn/${c.slug}`} className="card flex items-center gap-3 p-3 hover:border-line-strong">
              <Ring pct={b.pct} size={44} stroke={4} color={c.accent} label={`${c.short}: ${b.done} of ${b.total}`} />
              <span className="min-w-0"><span className="block font-mono text-xs text-faint">{c.num}</span><span className="block truncate text-sm font-medium">{c.short}</span><span className="block text-xs text-muted">{b.done}/{b.total}</span></span>
            </a>
          );
        })}
      </div>

      {bookmarks.length > 0 && (
        <div className="card p-5">
          <h2 className="flex items-center gap-2 font-semibold"><Bookmark size={16} className="text-accent" /> Bookmarks</h2>
          <div className="mt-3 flex flex-wrap gap-1.5">{bookmarks.map((b) => <a key={b.slug} href={`/learn/${b.slug}`} className="chip hover:text-fg">{b.num} {b.title}</a>)}</div>
        </div>
      )}

      <div className="card p-5">
        <h2 className="font-semibold">Your data</h2>
        <p className="mt-1 text-sm text-muted">Stored only in this browser. Export a backup to move to another device.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button className="btn" onClick={doExport}><Download size={15} /> Export JSON</button>
          <button className="btn" onClick={() => file.current?.click()}><Upload size={15} /> Import JSON</button>
          <input ref={file} type="file" accept="application/json,.json" hidden onChange={(e) => doImport(e.target.files?.[0])} />
          <button className="btn ml-auto text-[var(--r-swap)]" onClick={() => confirmDlg.current?.showModal()}><RotateCcw size={15} /> Reset</button>
        </div>
        {msg && <p className="mt-3 text-sm" role="status">{msg}</p>}
      </div>

      <dialog ref={confirmDlg} className="card m-auto w-[min(92vw,24rem)] p-5 text-fg backdrop:bg-black/50" aria-labelledby="reset-title">
        <h2 id="reset-title" className="font-semibold">Reset all progress?</h2>
        <p className="mt-2 text-sm text-muted">This deletes completed topics, quiz scores, notes, bookmarks and your streak. Export first if you might want them back.</p>
        <form method="dialog" className="mt-4 flex justify-end gap-2">
          <button className="btn">Cancel</button>
          <button className="btn btn-primary !bg-[var(--r-swap)]" onClick={() => { reset(); setMsg('Progress reset.'); }}>Yes, reset</button>
        </form>
      </dialog>
    </div>
  );
}
