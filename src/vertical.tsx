// A vertical calculation lesson. The question is written the way the textbook prints it (one polynomial under the other, NOT lined up);
// step 1: choose the layout with the like terms in the same column; (subtraction) step 2: change the signs of the lower row; then the answer is built column by column.
// Wrong answers get a pop-up with a hint and an example, like LessonPlayer.
// Imported by: quiz.tsx. Data: lessons.ts (VSpec), built in bracket-data.ts.
import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Swap, tex } from './main'
import type { Lesson } from './lessons'

const AMBER = '#fde68a'
const GREEN = '#bbf7d0'
const LETTERS = ['A', 'B', 'C', 'D']

type StepK = { kind: 'align' } | { kind: 'flip' } | { kind: 'col'; k: number }

export function VerticalLesson({ lesson, onDone }: { lesson: Lesson; onDone: () => void }) {
  const spec = lesson.vertical!
  // a column with a single term that does not change comes down right after the layout is chosen; the others follow the change of signs
  const lastRow = spec.rows - 1
  const early = (k: number) => !!spec.flip && !spec.cols[k].question && !spec.cols[k].cells[lastRow]
  const colSteps = (pick: (k: number) => boolean) => spec.cols.map((_, k) => k).filter(pick).map((k) => ({ kind: 'col', k }) as StepK)
  const steps: StepK[] = [
    ...(spec.align ? [{ kind: 'align' } as StepK] : []),
    ...colSteps(early),
    ...(spec.flip ? [{ kind: 'flip' } as StepK] : []),
    ...colSteps((k) => !early(k)),
  ]
  const [at, setAt] = useState(0) // the step being asked
  const [tried, setTried] = useState<number[]>([])
  const [wrong, setWrong] = useState<number | null>(null) // the wrong option being explained
  const [aligned, setAligned] = useState(!spec.align)
  const [flipped, setFlipped] = useState(!spec.flip)
  const [filled, setFilled] = useState<number[]>([]) // columns whose answer is shown
  const [busy, setBusy] = useState(false)

  const done = at >= steps.length
  const cur = done ? undefined : steps[at]
  const col = cur?.kind === 'col' ? cur.k : -1
  const question = cur?.kind === 'align' ? spec.align : cur?.kind === 'flip' ? spec.flip : cur?.kind === 'col' ? spec.cols[cur.k].question : undefined

  const next = () => {
    setBusy(true)
    setTimeout(() => {
      setTried([])
      setAt((a) => a + 1)
      setBusy(false)
    }, 800)
  }

  // a column with a single term has nothing to ask: its term just comes down
  useEffect(() => {
    if (done || col < 0 || question) return
    const id = setTimeout(() => {
      setFilled((f) => [...f, col])
      setAt((a) => a + 1)
    }, 600)
    return () => clearTimeout(id)
  }, [at, done, col, question])

  const pick = (i: number) => {
    if (!question || busy || !cur) return
    if (i === question.correct) {
      if (cur.kind === 'align') setAligned(true)
      else if (cur.kind === 'flip') setFlipped(true)
      else setFilled((f) => [...f, cur.k])
      next()
    } else {
      setTried((t) => [...t, i])
      setWrong(i)
    }
  }

  const n = spec.cols.length
  const cell = 'rounded-md px-2 py-1 text-center text-2xl'
  return (
    <div className="mx-auto max-w-2xl space-y-3 p-6">
      {lesson.reference && (
        <div className="rounded-xl border bg-white px-5 py-3 text-lg">
          <div className="space-y-1">
            {lesson.reference.map((r) => (
              <div key={r.label} className="flex flex-wrap items-center gap-x-3">
                <span className="w-64 shrink-0">{r.label}</span>
                {r.tex && <span dangerouslySetInnerHTML={tex(r.tex)} />}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-5 rounded-xl border p-5">
        {!aligned ? (
          <div className="text-center text-3xl" dangerouslySetInnerHTML={tex(spec.raw)} />
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="mx-auto grid w-fit items-center gap-x-1 gap-y-1" style={{ gridTemplateColumns: `2rem repeat(${n}, minmax(4.5rem, auto))` }}>
            {Array.from({ length: spec.rows }, (_, r) => (
              <div key={r} className="contents">
                <span className="text-center text-2xl text-slate-500" dangerouslySetInnerHTML={tex(r === 0 ? '\\,' : spec.flip && flipped ? '+' : spec.op)} />
                {spec.cols.map((c, ci) => {
                  const asking = col === ci && !!c.cells[r]
                  const flipHere = r === lastRow && spec.flip && flipped && c.cells[r] !== c.after[r]
                  return (
                    <span key={ci} className={cell} style={{ background: asking ? AMBER : 'transparent' }}>
                      {flipHere ? <Swap from={c.cells[r]} to={c.after[r]} delay={350} /> : <span dangerouslySetInnerHTML={tex(r === lastRow && flipped ? c.after[r] : c.cells[r])} />}
                    </span>
                  )
                })}
              </div>
            ))}
            <div className="col-span-full my-1 border-t-2 border-slate-500" />
            <span />
            {spec.cols.map((c, ci) => (
              <motion.span key={ci} className={cell + ' font-bold text-emerald-700'} style={{ background: filled.includes(ci) ? GREEN : 'transparent' }} initial={false} animate={{ opacity: filled.includes(ci) ? 1 : 0 }}>
                <span dangerouslySetInnerHTML={tex(c.total || '\\,')} />
              </motion.span>
            ))}
          </motion.div>
        )}

        {question && (
          <div className="mx-auto w-fit max-w-full rounded-lg border-2 border-dashed border-sky-400 bg-sky-50 p-2">
            <p className="mb-3 px-1 text-base font-semibold text-sky-900">
              {/* $...$ inside the prompt is maths */}
              {question.prompt.split('$').map((part, pi) => (pi % 2 ? <span key={pi} className="text-xl" dangerouslySetInnerHTML={tex(part)} /> : <span key={pi}>{part}</span>))}
            </p>
            <div className="flex flex-col items-start gap-2">
              {question.options.map((o, oi) => (
                <button
                  key={oi}
                  disabled={busy || tried.includes(oi)}
                  onClick={() => pick(oi)}
                  className={'flex items-center gap-1 rounded-md border-2 bg-white px-2 py-0 text-xl transition ' + (tried.includes(oi) ? 'border-orange-300 opacity-30' : 'border-slate-300 hover:scale-105 hover:border-sky-500')}
                >
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-700 text-[10px] font-bold text-white">{LETTERS[oi]}</span>
                  <span dangerouslySetInnerHTML={tex(o)} />
                </button>
              ))}
            </div>
          </div>
        )}

        {done && (
          <div className="flex items-center justify-center gap-4">
            <span className="text-2xl text-emerald-600">✓</span>
            <button className="rounded-lg bg-emerald-500 px-4 py-1.5 font-semibold text-white" onClick={onDone}>
              Continue
            </button>
          </div>
        )}
      </div>

      {wrong !== null && question && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setWrong(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.18 }} className="w-full max-w-3xl space-y-3 rounded-2xl border-2 border-orange-300 bg-orange-50 p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <p className="text-base font-semibold text-orange-800">
              Not quite.{' '}
              {question.hint.split('$').map((part, pi) => (pi % 2 ? <span key={pi} className="text-xl" dangerouslySetInnerHTML={tex(part)} /> : <span key={pi}>{part}</span>))}
            </p>
            {question.example && <div className="rounded-lg bg-white/70 py-3 text-center text-2xl" dangerouslySetInnerHTML={tex(question.example)} />}
            <button autoFocus className="rounded-lg bg-orange-500 px-4 py-1.5 font-semibold text-white" onClick={() => setWrong(null)}>
              Try again
            </button>
          </motion.div>
        </div>
      )}
    </div>
  )
}
