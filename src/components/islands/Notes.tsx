import { useEffect, useRef, useState } from 'react';
import { patchTopic, storageAvailable, topic } from '@/lib/progress';

export default function Notes({ slug }: { slug: string }) {
  const [text, setText] = useState('');
  const [status, setStatus] = useState('');
  const t = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => setText(topic(slug).notes ?? ''), [slug]);
  return (
    <div>
      <label
        htmlFor={`notes-${slug}`}
        className="mb-1.5 flex items-center justify-between text-sm font-medium"
      >
        My notes
        <span className="text-xs font-normal text-faint" aria-live="polite">
          {status}
        </span>
      </label>
      <textarea
        id={`notes-${slug}`}
        value={text}
        rows={4}
        placeholder="Your own words, mnemonics, questions to look up later…"
        onChange={(e) => {
          setText(e.target.value);
          setStatus('…');
          clearTimeout(t.current);
          t.current = setTimeout(() => {
            patchTopic(slug, { notes: e.target.value });
            setStatus(storageAvailable() ? 'Saved' : 'Not saved: storage is blocked');
          }, 500);
        }}
        className="w-full rounded-xl border border-line bg-elev p-3 text-sm"
      />
    </div>
  );
}
