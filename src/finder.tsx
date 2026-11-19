// Header tools of the quiz page: a search box over the topics of the grade that is open, and a roadmap panel (chapters > sections; hovering a section
// shows the exercises and a sample question of each). Both only know the open grade. Imported by: quiz.tsx.
import { useEffect, useMemo, useState } from 'react'

export interface FNode { no: number; name: string; show: number; parts: number }
export interface FSec { title: string; nodes: FNode[] }
export interface FCh { title: string; sections: FSec[] }
interface Props {
  chapters: FCh[]
  texts: (no: number) => string[] // the questions of an exercise (first of each part), raw text
  render: (s: string) => string // raw question text -> html
  onGo: (no: number) => void
}

// a sample question cut to a short one (never inside a formula)
const clip = (s: string, n = 170) => {
  if (s.length <= n) return s
  let t = s.slice(0, n).replace(/\s+\S*$/, '')
  if ((t.match(/\\\(/g) ?? []).length !== (t.match(/\\\)/g) ?? []).length) t = t.slice(0, t.lastIndexOf('\\('))
  return t.trim() + ' …'
}
const plain = (s: string) => s.toLowerCase().replace(/\\[a-z]+/g, ' ').replace(/[\\(){}$^_]/g, ' ').replace(/\s+/g, ' ')

interface Entry { no: number; sec: string; secIdx: number; name: string; show: number; parts: number; hay: string; nameHay: string; secHay: string }
function useEntries({ chapters, texts }: Props) {
  return useMemo(() => {
    const out: Entry[] = []
    for (const ch of chapters) for (const s of ch.sections) for (const n of s.nodes) {
      out.push({ no: n.no, sec: s.title, secIdx: out.length, name: n.name, show: n.show, parts: n.parts, nameHay: plain(n.name), secHay: plain(`${s.title} ${ch.title}`), hay: plain(texts(n.no).join(' ')) })
    }
    return out
  }, [chapters, texts])
}

export function SearchBox(props: Props) {
  const entries = useEntries(props)
  const [q, setQ] = useState('')
  const [focus, setFocus] = useState(false)
  const hits = useMemo(() => {
    const toks = plain(q).split(' ').filter(Boolean)
    if (!toks.length) return []
    const scored: { e: Entry; score: number }[] = []
    for (const e of entries) {
      const all = `${e.secHay} ${e.nameHay} ${e.hay}`
      if (!toks.every((t) => all.includes(t))) continue
      const score = toks.reduce((a, t) => a + (e.nameHay.includes(t) ? 3 : 0) + (e.secHay.includes(t) ? 2 : 0) + 1, 0)
      scored.push({ e, score })
    }
    return scored.sort((a, b) => b.score - a.score || a.e.secIdx - b.e.secIdx).slice(0, 12).map((x) => x.e)
  }, [q, entries])
  const go = (no: number) => { props.onGo(no); setQ(''); setFocus(false) }
  return (
    <div className="relative min-w-0 flex-1 sm:max-w-sm">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        onKeyDown={(e) => { if (e.key === 'Enter' && hits[0]) go(hits[0].no); if (e.key === 'Escape') { setQ(''); (e.target as HTMLInputElement).blur() } }}
        placeholder="Search topics…"
        aria-label="Search topics"
        className="w-full rounded-lg border bg-white px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-sky-200"
      />
      {focus && q.trim() && (
        <div onMouseDown={(e) => e.preventDefault()} className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[70vh] overflow-y-auto rounded-xl border bg-white p-1 shadow-lg sm:w-[28rem]">
          {hits.length === 0 && <p className="px-3 py-2 text-sm text-slate-500">No topic found in this grade.</p>}
          {hits.map((e) => (
            <button key={e.no} onClick={() => go(e.no)} className="block w-full rounded-lg px-3 py-1.5 text-left hover:bg-sky-50">
              <span className="block truncate text-sm font-semibold text-slate-800">{e.name}</span>
              <span className="block truncate text-xs text-slate-500">{e.sec} · Exercise {e.show} · {e.parts} parts</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function RoadmapPanel(props: Props & { currentNo: number; onClose: () => void }) {
  const { chapters, texts, render, onGo, currentNo, onClose } = props
  const home = chapters.flatMap((c) => c.sections).find((s) => s.nodes.some((n) => n.no === currentNo)) ?? chapters[0]?.sections[0]
  const [hover, setHover] = useState<FSec | undefined>(home)
  useEffect(() => {
    const f = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', f)
    return () => window.removeEventListener('keydown', f)
  }, [onClose])
  const open = (s: FSec) => { if (s.nodes[0]) onGo(s.nodes[0].no) }
  return (
    <div className="fixed inset-x-0 bottom-0 top-12 z-30 flex border-t bg-white">
      <div className="w-full shrink-0 overflow-y-auto p-4 md:w-1/2 lg:w-2/5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-slate-800">Roadmap</h2>
          <button onClick={onClose} aria-label="Close roadmap" className="rounded-lg border px-2 py-0.5 text-sm text-slate-600 hover:bg-slate-50">✕</button>
        </div>
        {chapters.length === 0 && <p className="text-sm text-slate-500">Loading…</p>}
        {chapters.map((ch) => (
          <div key={ch.title} className="mb-3">
            <h3 className="mb-1 text-sm font-bold text-slate-700">{ch.title}</h3>
            <div className="grid gap-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
              {ch.sections.filter((s) => s.nodes.length).map((s) => {
                const here = s.nodes.some((n) => n.no === currentNo)
                return (
                  <button
                    key={s.title}
                    onMouseEnter={() => setHover(s)}
                    onFocus={() => setHover(s)}
                    onClick={() => open(s)}
                    className={'truncate rounded-lg border px-2 py-1.5 text-left text-sm ' + (hover === s ? 'border-sky-400 bg-sky-50 ' : 'hover:bg-slate-50 ') + (here ? 'font-bold text-sky-800' : 'text-slate-700')}
                  >
                    {s.title}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="hidden min-w-0 flex-1 overflow-y-auto border-l bg-slate-50 p-4 md:block">
        {hover && (
          <>
            <h3 className="mb-2 text-base font-bold text-slate-800">{hover.title}</h3>
            <ul className="space-y-2">
              {hover.nodes.map((n) => {
                const first = texts(n.no)[0]
                return (
                  <li key={n.no}>
                    <button onClick={() => onGo(n.no)} className="block w-full rounded-xl border bg-white p-3 text-left hover:border-sky-400">
                      <span className="text-sm font-semibold text-slate-800">{n.show}. {n.name}</span>
                      <span className="ml-2 text-xs text-slate-500">{n.parts} parts</span>
                      {first && <span className="mt-1 block text-sm text-slate-600 [&_.katex]:text-[0.95em]" dangerouslySetInnerHTML={{ __html: render(clip(first)) }} />}
                    </button>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}
