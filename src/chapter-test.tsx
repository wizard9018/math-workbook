// A chapter review run as a test: one question per review exercise, answered one after another with no feedback;
// at the end the score and every question with its right answer and written solution are shown. Used by quiz.tsx (TEST_SECTIONS).
import { useMemo, useState } from 'react'
import type { Exercise, Practice } from './exercise'
import { GraphDraw } from './graph-draw'
import { FillTable } from './fill-table'
import { SortLine } from './sort-line'
import { PlaceLine } from './place-line'
import { IneqLine } from './ineq-line'
import { MarkLine } from './mark-line'
import { PlotPoints } from './plot-points'
import { SystemDraw } from './system-draw'
import { ParabSystem } from './parab-system'
import { IneqDraw } from './ineq-draw'
import { RegionPick } from './region-pick'
import { AngleSketch } from './angle-sketch'
import { MultiPick } from './multi-pick'

interface TQ { label: string; p: Practice }

// a question answered by drawing, filling in, dragging ... instead of choosing: the component reports right / wrong (right = choices[0] = answer 0)
const isHands = (p: Practice) => !!(p.draw || p.fill || p.sort || p.plot || p.mark || p.ineq || p.place || p.multi)
const Hands = ({ p, onSubmit }: { p: Practice; onSubmit: (ok: boolean) => void }) => {
  const props = { disabled: false, onSubmit }
  if (p.draw) {
    const d = p.draw
    return d.ang !== undefined ? <AngleSketch spec={d} {...props} /> : d.reg ? <RegionPick spec={d} {...props} /> : d.ineq ? <IneqDraw spec={d} {...props} /> : d.par ? <ParabSystem spec={d} {...props} /> : d.sys ? <SystemDraw spec={d} {...props} /> : <GraphDraw spec={d} {...props} />
  }
  if (p.fill) return <FillTable spec={p.fill} {...props} />
  if (p.sort) return <SortLine spec={p.sort} {...props} />
  if (p.plot) return <PlotPoints spec={p.plot} {...props} />
  if (p.mark) return <MarkLine spec={p.mark} {...props} />
  if (p.ineq) return <IneqLine spec={p.ineq} {...props} />
  if (p.place) return <PlaceLine spec={p.place} {...props} />
  if (p.multi) return <MultiPick spec={p.multi} {...props} />
  return null
}

// one random variant of one random part of every exercise
const draw = (exs: Exercise[]): TQ[] =>
  exs.flatMap((ex) => {
    const parts = ex.questions.filter((q) => q.practice.length)
    if (!parts.length) return []
    const part = parts[Math.floor(Math.random() * parts.length)]
    return [{ label: `${ex.no}${part.part === '1' ? '' : part.part}`, p: part.practice[Math.floor(Math.random() * part.practice.length)] }]
  })

export function ChapterTest({ exercises, onFinish }: { exercises: Exercise[]; onFinish: (score: number, total: number) => void }) {
  const [run, setRun] = useState(0) // bumped by "Try again": new random questions
  const qs = useMemo(() => draw(exercises), [exercises, run])
  const [i, setI] = useState(0)
  const [ans, setAns] = useState<(number | undefined)[]>([])
  const done = ans.length >= qs.length && ans.slice(0, qs.length).every((a) => a !== undefined)
  const [shown, setShown] = useState(false) // the result page

  const score = qs.filter((q, k) => ans[k] === q.p.correct).length
  const pick = (c: number) => {
    const next = [...ans]
    next[i] = c
    setAns(next)
    if (i + 1 < qs.length) setI(i + 1)
    else if (qs.every((_, k) => next[k] !== undefined)) { setShown(true); onFinish(qs.filter((q, k) => next[k] === q.p.correct).length, qs.length) }
  }
  const again = () => { setRun((r) => r + 1); setI(0); setAns([]); setShown(false) }

  if (shown) {
    return (
      <div className="mx-auto max-w-2xl space-y-5 p-6">
        <div className="rounded-2xl border bg-white p-6 text-center">
          <h1 className="text-2xl font-bold">Score: {score} / {qs.length}</h1>
          <p className="mt-1 text-slate-600">{Math.round((100 * score) / qs.length)}%</p>
          <button onClick={again} className="mt-4 rounded-xl bg-sky-500 px-5 py-2 font-semibold text-white hover:bg-sky-600">Try again with new questions</button>
        </div>
        {qs.map((q, k) => {
          const ok = ans[k] === q.p.correct
          return (
            <div key={k} className={'space-y-3 rounded-xl border-2 bg-white p-4 ' + (ok ? 'border-emerald-300' : 'border-rose-300')}>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <span className={'flex h-7 w-7 items-center justify-center rounded-full text-white ' + (ok ? 'bg-emerald-500' : 'bg-rose-500')}>{k + 1}</span>
                <span className="text-slate-500">Exercise {q.label}</span>
                <span className={ok ? 'text-emerald-700' : 'text-rose-700'}>{ok ? 'Correct' : 'Wrong'}</span>
              </div>
              <div dangerouslySetInnerHTML={{ __html: q.p.figure ?? '' }} />
              <div className="space-y-1.5">
                {!isHands(q.p) && q.p.choices.map((c, ci) => (
                  <div key={ci} className={'flex items-center gap-3 rounded-lg border px-3 py-1.5 ' + (ci === q.p.correct ? 'border-emerald-500 bg-emerald-50' : ci === ans[k] ? 'border-rose-400 bg-rose-50' : 'border-slate-200')}>
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">{'abcd'[ci]}</span>
                    <span dangerouslySetInnerHTML={{ __html: c }} />
                    {ci === q.p.correct && <span className="ml-auto text-sm font-semibold text-emerald-700">✓ answer</span>}
                    {ci === ans[k] && ci !== q.p.correct && <span className="ml-auto text-sm font-semibold text-rose-700">your answer</span>}
                  </div>
                ))}
              </div>
              <details className="text-sm" open={isHands(q.p) && !ok}>
                <summary className="cursor-pointer font-semibold text-sky-700">Solution</summary>
                <div className="mt-2" dangerouslySetInnerHTML={{ __html: q.p.lesson().solution ?? '' }} />
              </details>
            </div>
          )
        })}
      </div>
    )
  }

  const q = qs[i]
  if (!q) return <p className="p-6 text-slate-500">No questions.</p>
  return (
    <div className="mx-auto max-w-2xl space-y-5 p-6">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold">Chapter test</h1>
        <span className="text-sm text-slate-500">Question {i + 1} / {qs.length} · answers and score at the end</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {qs.map((_, k) => (
          <button key={k} onClick={() => setI(k)} className={'h-7 w-7 rounded-full text-xs font-bold ' + (k === i ? 'bg-sky-500 text-white ring-4 ring-sky-200' : ans[k] !== undefined ? 'bg-emerald-400 text-white' : 'bg-slate-200 text-slate-600')}>{k + 1}</button>
        ))}
      </div>
      <div className="rounded-xl border bg-white p-4" dangerouslySetInnerHTML={{ __html: q.p.figure ?? '' }} />
      {isHands(q.p) ? <Hands key={`${run}-${i}`} p={q.p} onSubmit={(ok) => pick(ok ? q.p.correct : q.p.correct + 1)} /> : <div className="flex flex-col gap-3">
        {q.p.choices.map((c, ci) => (
          <button key={`${run}-${i}-${ci}`} onClick={() => pick(ci)} className={'flex items-center gap-4 rounded-xl border-2 px-5 py-3 text-left text-lg font-semibold transition ' + (ans[i] === ci ? 'border-sky-500 bg-sky-50' : 'border-slate-300 bg-white hover:border-sky-400')}>
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-700">{'abcd'[ci]}</span>
            <span dangerouslySetInnerHTML={{ __html: c }} />
          </button>
        ))}
      </div>}
      {done && <button onClick={() => { setShown(true); onFinish(score, qs.length) }} className="rounded-xl bg-emerald-500 px-5 py-2 font-semibold text-white hover:bg-emerald-600">See score and answers</button>}
    </div>
  )
}
