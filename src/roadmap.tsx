// Local demo: roadmap of Grade 9 section 5.1, exercises 2-10 (data from bank/G9-ch5/s1/items.json; part counts are the bank's).
// Imported by: roadmap.html only. Exercise 2 links to quiz.html (its own a-j roadmap is the strip at the top of that page).
import { createRoot } from 'react-dom/client'
import './demo.css'

import { NODES, type Node } from './section-data'

const LOOK: Record<Node['state'], { dot: string; tag: string; text: string }> = {
  ready: { dot: 'bg-emerald-500 text-white', tag: 'bg-emerald-100 text-emerald-800', text: 'Ready: try it' },
  next: { dot: 'bg-sky-500 text-white', tag: 'bg-sky-100 text-sky-800', text: 'Next to build' },
  later: { dot: 'bg-slate-400 text-white', tag: 'bg-slate-100 text-slate-600', text: 'After 8' },
  figure: { dot: 'bg-amber-400 text-white', tag: 'bg-amber-100 text-amber-800', text: 'Needs a tile picture' },
}

function Roadmap() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 p-6">
      <div>
        <h1 className="text-xl font-bold">Grade 9 · 5.1 Polynomials · exercises 2–10</h1>
        <p className="text-sm text-muted-foreground">Every exercise: ask → wrong answer → step lesson → three similar questions.</p>
      </div>
      <ol className="space-y-4">
        {NODES.map((n, k) => {
          const l = LOOK[n.state]
          return (
            <li key={n.no} className="relative flex gap-4">
              {k < NODES.length - 1 && <span className="absolute left-5 top-10 h-[calc(100%-1rem)] w-0.5 bg-slate-300" />}
              <span className={'z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-bold ' + l.dot}>{n.no}</span>
              <div className="flex-1 rounded-xl border bg-white p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <b>{n.name}</b>
                  <span className="text-xs text-muted-foreground">{n.parts} parts</span>
                  <span className={'rounded-full px-2 py-0.5 text-xs font-semibold ' + l.tag}>{l.text}</span>
                </div>
                <p className="mt-1 text-sm text-slate-600">{n.how}</p>
                {n.state === 'ready' && (
                  <a className="mt-2 inline-block rounded-lg bg-emerald-500 px-3 py-1 text-sm font-semibold text-white" href="/.scratch/step-demo/quiz.html">
                    Open 2a–2j and 3a–3j
                  </a>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(<Roadmap />)
