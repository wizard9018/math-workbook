// Local demo (not part of the app): one order-of-operations problem as a worked solution that builds up line by line ("= ... = ...").
// Every step is two multiple-choice questions: which operation comes next, then what is its result.
// Right answers -> the step's sentence appears at the left of the new line, the part that changes lights up and becomes the new value;
// every line of the working stays on screen. Wrong answer -> a hint (BEDMAS review card for the "which operation" question).
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import './demo.css'

import { LESSONS, type Calc, type Lesson, type Tok } from './lessons'

const texCache = new Map<string, { __html: string }>()
export const tex = (s: string) => {
  let v = texCache.get(s)
  if (!v) texCache.set(s, (v = { __html: katex.renderToString(s, { throwOnError: false }) }))
  return v
}

// a bracket that fades away (and takes its width with it) after a short pause
function Paren({ ch }: { ch: string }) {
  return <motion.span initial={{ opacity: 1, width: 'auto' }} animate={{ opacity: 0, width: 0 }} transition={{ delay: 0.5, duration: 0.5 }} className="inline-block overflow-hidden text-slate-500" dangerouslySetInnerHTML={tex(ch)} />
}
// a term that shows its old text first, then changes to the new one with a small pop (a sign that flips)
export function Swap({ from, to, delay = 1100 }: { from: string; to: string; delay?: number }) {
  const [shown, setShown] = useState(from)
  useEffect(() => {
    const id = setTimeout(() => setShown(to), delay)
    return () => clearTimeout(id)
  }, [to, delay])
  return <motion.span key={shown} initial={{ scale: shown === to ? 1.35 : 1 }} animate={{ scale: 1 }} transition={{ duration: 0.35 }} className="inline-block" dangerouslySetInnerHTML={tex(shown)} />
}

type Phase = 'idle' | 'ask' | 'review' | 'calc' | 'calcwrong' | 'cheer' | 'say' | 'light'
interface Arrow {
  x1?: number
  y1?: number
  x2?: number
  y2?: number
  pts?: [number, number][] // a broken line through these points (straight segments, the head at the last one)
}

const AMBER = '#fde68a'
const GREEN = '#bbf7d0'
const LETTERS = ['A', 'B', 'C', 'D']

// shown for a moment after every right answer: an emoji and an encouraging word. 30 different ones, drawn from a shuffled bag
// (each one once per round, and never the same twice in a row), so the student does not get tired of the same face.
const CHEERS = [
  { face: '😊', text: 'Great!' },
  { face: '😄', text: 'Nice one!' },
  { face: '🌟', text: 'You got it!' },
  { face: '👏', text: 'Well done!' },
  { face: '😎', text: 'Awesome!' },
  { face: '🥳', text: 'Perfect!' },
  { face: '🤩', text: 'Wow!' },
  { face: '🎉', text: 'Hooray!' },
  { face: '💪', text: 'Strong work!' },
  { face: '🚀', text: 'Blast off!' },
  { face: '🔥', text: 'On fire!' },
  { face: '🧠', text: 'Big brain!' },
  { face: '🏆', text: 'Champion!' },
  { face: '😁', text: 'Yes!' },
  { face: '🙌', text: 'High five!' },
  { face: '🌈', text: 'Brilliant!' },
  { face: '🎯', text: 'Bullseye!' },
  { face: '🤓', text: 'Smart move!' },
  { face: '🥇', text: 'First class!' },
  { face: '✨', text: 'Sparkling!' },
  { face: '😍', text: 'Love it!' },
  { face: '👍', text: 'Thumbs up!' },
  { face: '👌', text: 'Spot on!' },
  { face: '✌️', text: 'Yay!' },
  { face: '🤟', text: 'Rock on!' },
  { face: '💯', text: 'Hundred percent!' },
  { face: '✅', text: 'Correct!' },
  { face: '🥰', text: 'Wonderful!' },
  { face: '🤗', text: 'So proud of you!' },
  { face: '🎊', text: 'Celebrate!' },
]

let cheerBag: number[] = []
let lastCheer = -1
function nextCheer() {
  if (cheerBag.length === 0) {
    cheerBag = CHEERS.map((_, i) => i).sort(() => Math.random() - 0.5)
    // a new round must not begin with the face that ended the last one
    if (cheerBag[cheerBag.length - 1] === lastCheer) cheerBag.unshift(cheerBag.pop()!)
  }
  lastCheer = cheerBag.pop()!
  return CHEERS[lastCheer]
}


export function LessonPlayer({ lesson: forced, onDone }: { lesson?: Lesson; onDone?: () => void }) {
  const [lessonIdx, setLessonIdx] = useState(0)
  const lesson = forced ?? LESSONS[lessonIdx]
  const START = lesson.start
  const [split, setSplit] = useState<string[]>([]) // steps (lesson key + index) that were answered wrong and are now shown as their smaller `split` steps
  const STEPS = lesson.steps.flatMap((s, i) => (s.split && split.includes(`${lesson.key}:${i}`) ? s.split : [s]))
  // the line before step k: START with steps 0..k-1 applied
  const lineAt = (k: number): Tok[] => {
    let line = START
    for (let st = 0; st < k; st++) {
      const f = new Set(STEPS[st].focus)
      const S = STEPS[st]
      if (S.after || S.replace) {
        // a term moves to another place (after) and/or a token is replaced in place (replace)
        let keep = line.map((t) => (S.replace && t.id === S.focus[0] ? S.replace : t)).filter((t) => !f.has(t.id))
        if (S.after) {
          const where = typeof S.after === 'string' ? Object.fromEntries((S.results ?? [S.result]).map((t) => [t.id, S.after as string])) : S.after
          for (const t of S.results ?? [S.result]) {
            const at = keep.findIndex((x) => x.id === where[t.id]) + 1
            keep = [...keep.slice(0, at), t, ...keep.slice(at)]
          }
        }
        line = keep
        continue
      }
      const at = line.findIndex((t) => f.has(t.id))
      line = [...line.slice(0, at), ...(STEPS[st].results ?? [STEPS[st].result]), ...line.slice(at).filter((t) => !f.has(t.id))]
    }
    return line
  }
  const [n, setN] = useState(0) // steps already applied = index of the last line of the working
  const [phase, setPhase] = useState<Phase>('idle')
  const [started, setStarted] = useState(false)
  const [arrows, setArrows] = useState<Arrow[]>([])
  const [wrongPicks, setWrongPicks] = useState<number[]>([]) // options already tried (wrong) in this step
  const [picked, setPicked] = useState<number | null>(null) // the wrong option being reviewed
  const [ok, setOk] = useState<[boolean, boolean]>([false, false]) // a step with two blanks: which of them is answered right
  const [wrong2, setWrong2] = useState<number[]>([]) // options of the second blank already tried (wrong)
  const [which, setWhich] = useState<1 | 2>(1) // the blank of the wrong option being reviewed
  const [bOk, setBOk] = useState<string[]>([]) // a step with `blanks`: the token ids answered right
  const [bTried, setBTried] = useState<Record<string, number[]>>({}) // ... and the wrong options already tried per blank
  const [bWrong, setBWrong] = useState<string | null>(null) // the blank of the wrong option being reviewed
  const [cheer, setCheer] = useState<{ id: number; face: string; text: string } | null>(null)
  const cheerCount = useRef(0)
  const streak = useRef(0) // right answers in a row (a wrong answer starts the count again)
  const alive = useRef(true)
  const top = useRef<HTMLDivElement>(null)
  useEffect(() => { top.current?.scrollIntoView({ block: 'start' }) }, [lesson.key]) // a lesson starts at the top of the screen: no scrolling down
  const run = useRef(0) // bumped by Restart so timers of an interrupted step do nothing
  const chain = useRef<HTMLDivElement>(null)
  const figRef = useRef<HTMLDivElement>(null) // the figure above the working (arrows can point to its parts)
  const els = useRef<Record<string, HTMLElement | null>>({})
  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
    }
  }, [])

  const step = STEPS[n]
  // embedded in a quiz: the lesson starts by itself
  useEffect(() => {
    if (forced) begin(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // step `stepNo`: first the sentence (read aloud, shown at the left of the new line), then the part lights up, then the new line appears
  function play(stepNo: number) {
    const myRun = run.current
    setPhase('say')
    const at = (ms: number, fn: () => void) =>
      setTimeout(() => {
        if (alive.current && run.current === myRun) fn()
      }, ms)
    at(150, () => setPhase('light')) // the sentence shows first, then the part lights up
    at(150 + 250, () => {
      setN(stepNo + 1)
      setPhase('idle')
    })
    // no "next" button: after a short look at the new line the next question starts by itself
    if (stepNo + 1 < STEPS.length) at(150 + 250 + 500, () => begin(stepNo + 1))
  }

  function showCheer() {
    const c = nextCheer()
    const id = ++cheerCount.current
    setCheer({ id, ...c })
    setTimeout(() => setCheer((cur) => (cur && cur.id === id ? null : cur)), 1100)
  }

  // A right answer: every 3rd one in a row shows the cheer FIRST; only when it is gone does the working animation (or the next question) go on.
  function afterCorrect(then: () => void) {
    streak.current += 1
    if (streak.current < 3) {
      then()
      return
    }
    streak.current = 0
    const myRun = run.current
    setPhase('cheer')
    showCheer()
    setTimeout(() => {
      if (alive.current && run.current === myRun) then()
    }, 1150)
  }

  // starts step `stepNo` with its first question (called by the Start button and, after each new line, automatically)
  function begin(stepNo: number) {
    setStarted(true)
    setWrongPicks([])
    setBOk([])
    setBTried({})
    setOk([false, false])
    setWrong2([])
    setPicked(null)
    const st = STEPS[stepNo]
    if (st.auto) {
      play(stepNo) // a step without a question: the line is only shown
      return
    }
    if (st.ask) {
      setPhase('ask')
    } else startCalc(stepNo)
  }

  function startCalc(stepNo: number) {
    setWrongPicks([])
    setBOk([])
    setBTried({})
    setOk([false, false])
    setWrong2([])
    setPicked(null)
    setPhase('calc')
  }

  // question 1: which operation comes next
  function choose(i: number) {
    if (!step.ask || phase !== 'ask') return
    if (i === step.ask.correct || step.ask.also?.includes(i)) {
      afterCorrect(() => startCalc(n))
    } else {
      streak.current = 0
      setWrongPicks((w) => [...w, i])
      setPicked(i)
      setPhase('review')
    }
  }

  // a step with several blanks: each blank is its own question, the step goes on when all are right
  function chooseBlank(id: string, i: number) {
    if (phase !== 'calc') return
    const b = step.blanks!.find((x) => x.id === id)!
    if (i === b.calc.correct) {
      const next = [...bOk, id]
      setBOk(next)
      if (next.length === step.blanks!.length)
        afterCorrect(() => {
          setPicked(null)
          play(n)
        })
    } else if (step.split) {
      // no pop-up: the same question comes back as its smaller parts
      streak.current = 0
      setSplit((s) => [...s, `${lesson.key}:${lesson.steps.indexOf(step)}`])
      setBTried({})
      setBOk([])
      setBWrong(null)
      setPicked(null)
    } else {
      streak.current = 0
      setBTried((t) => ({ ...t, [id]: [...(t[id] ?? []), i] }))
      setPicked(i)
      setBWrong(id)
      setPhase('calcwrong')
    }
  }

  // question 2: the result of that operation
  function chooseCalc(i: number, w: 1 | 2 = 1) {
    if (phase !== 'calc') return
    const c = w === 2 ? step.second! : step.calc
    if (i === c.correct) {
      if (step.second) {
        // two blanks: the step goes on when both are right
        const next: [boolean, boolean] = w === 1 ? [true, ok[1]] : [ok[0], true]
        setOk(next)
        if (next[0] && next[1])
          afterCorrect(() => {
            setPicked(null)
            play(n)
          })
        return
      }
      afterCorrect(() => {
        setPicked(null)
        play(n)
      })
    } else if (step.split) {
      // no pop-up: the same question comes back as its smaller parts
      streak.current = 0
      setSplit((s) => [...s, `${lesson.key}:${lesson.steps.indexOf(step)}`])
      setWrongPicks([])
      setPicked(null)
    } else {
      streak.current = 0
      if (w === 2) setWrong2((x) => [...x, i])
      else setWrongPicks((x) => [...x, i])
      setPicked(i)
      setWhich(w)
      setPhase('calcwrong')
    }
  }

  // one arrow per finished step: from the part that changed (in its line) to the new value (in the next line), measured from real positions
  function measure() {
    if (!chain.current) return
    const c = chain.current.getBoundingClientRect()
    const rect = (k: string) => els.current[k]?.getBoundingClientRect()
    const earlier = (line: number, id: string) => { // a token of this line or, failing that, of an earlier one (the nearest)
      for (let k = line; k >= 0; k--) { const r = rect(`${k}:${id}`); if (r) return r }
      return undefined
    }
    // where arrows start: one arrow from the whole focus group, or (step.from === 'exponent') one from each exponent written in it,
    // else from each variable (an unwritten exponent is 1: x, sqrt x); a constant has neither, so its whole token is used
    const sources = (k: number): { x: number; y: number }[] => {
      if (STEPS[k].from === 'each') {
        return STEPS[k].focus.flatMap((id) => {
          const r = /^o\d/.test(id) ? undefined : els.current[`${k}:${id}`]?.getBoundingClientRect() // signs between terms get no arrow
          return r ? [{ x: (r.left + r.right) / 2 - c.left, y: r.bottom - c.top + 2 }] : []
        })
      }
      const all: DOMRect[] = []
      const each: DOMRect[] = []
      for (const id of STEPS[k].focus) {
        const el = els.current[`${k}:${id}`]
        if (!el || (STEPS[k].from === 'exponent' && /^o\d/.test(id))) continue // signs between terms have no exponent
        const found = (sel: string) => [...el.querySelectorAll(sel)].map((e) => e.getBoundingClientRect())
        const sup = found('.msupsub')
        const own = sup.length ? sup : found('.mathnormal')
        all.push(el.getBoundingClientRect())
        each.push(...(own.length ? own : [el.getBoundingClientRect()]))
      }
      if (STEPS[k].from === 'exponent') return each.map((r) => ({ x: (r.left + r.right) / 2 - c.left, y: r.bottom - c.top + 2 }))
      if (!all.length) return []
      return [{ x: (Math.min(...all.map((r) => r.left)) + Math.max(...all.map((r) => r.right))) / 2 - c.left, y: Math.max(...all.map((r) => r.bottom)) - c.top + 2 }]
    }
    const out: Arrow[] = []
    // the arrow of the step that is being shown is drawn at once (while the new line is still invisible), not after the line
    const arrowSteps = n + (phase === 'say' || phase === 'light' ? 1 : 0)
    for (let i = 0; i < arrowSteps; i++) {
      for (const fa of STEPS[i].figArrows ?? []) {
        // from a token of the line the step made up to a point of the figure
        const from = rect(`${i + 1}:${STEPS[i].results?.[0]?.id ?? STEPS[i].result.id}`) // the start of the line (the arrow leaves from the left of it, over nothing)
        const to = figRef.current?.querySelector(`[data-pt="${fa.pt}"]`)?.getBoundingClientRect()
        // Straight segments only. 'left': out of the left of the line, up along the left edge of the working (nothing is written there), into the point from the left.
        // 'right': starts at the right end of the line and comes into the point from the right: it never crosses a 'left' one.
        const plane = figRef.current?.querySelector('svg')?.getBoundingClientRect()
        if (from && to && plane) {
          const sx = from.left - c.left - 3
          const sy = (from.top + from.bottom) / 2 - c.top
          const ty = (to.top + to.bottom) / 2 - c.top
          const tx = (to.left + to.right) / 2 - c.left
          if (fa.route === 'right') {
            // from the right end of the line: up into the gap above it, right to the right edge of the working, up, and left into the point from the right
            const last = rect(`${i + 1}:${STEPS[i].results?.[STEPS[i].results!.length - 1]?.id ?? STEPS[i].result.id}`)
            if (last) out.push({ pts: [[last.right - c.left - 8, last.top - c.top - 1], [last.right - c.left - 8, last.top - c.top - 12], [c.width - 14, last.top - c.top - 12], [c.width - 14, ty], [tx + 9, ty]] })
          } else out.push({ pts: [[sx, sy], [14, sy], [14, ty], [tx - 9, ty]] })
        }
      }
      const explicit = STEPS[i].arrows
      if (explicit) {
        // each arrow goes from the middle of its source tokens to the middle of its target tokens
        for (const a of explicit) {
          const from = a.from.map((id) => earlier(i, id)).filter((r): r is DOMRect => !!r)
          const to = a.to.map((id) => rect(`${i + 1}:${id}`)).filter((r): r is DOMRect => !!r)
          if (!from.length || !to.length) continue
          const mid = (rs: DOMRect[]) => (Math.min(...rs.map((r) => r.left)) + Math.max(...rs.map((r) => r.right))) / 2 - c.left
          out.push({ x1: mid(from), y1: Math.max(...from.map((r) => r.bottom)) - c.top + 2, x2: mid(to), y2: Math.min(...to.map((r) => r.top)) - c.top - 3 })
        }
        continue
      }
      const b = rect(`${i + 1}:${STEPS[i].result.id}`)
      if (!b) continue
      for (const p of sources(i)) out.push({ x1: p.x, y1: p.y, x2: b.left + b.width / 2 - c.left, y2: b.top - c.top - 3 })
    }
    if (calcing && STEPS[n].blanks) {
      // several blanks: each term of the current line has an arrow to its own blank
      const land = STEPS[n].landArrows
      if (land) {
        // arrows that end on tokens of the new line (written beside the blank), starting from tokens of earlier lines
        for (const a of land) {
          const from = earlier(n, a.from[0])
          const to = rect(`${n + 1}:${a.to[0]}`)
          if (from && to) out.push({ x1: from.left + from.width / 2 - c.left, y1: from.bottom - c.top + 2, x2: to.left + to.width / 2 - c.left, y2: to.top - c.top - 3 })
        }
      }
      for (const b of land || (STEPS[n].arrows && !STEPS[n].arrows!.length) ? [] : STEPS[n].blanks!) {
        const from = earlier(n, b.from) // a token of an earlier line may be used in a later step (an arrow comes down from it)
        const to = rect(`blank:${b.id}`)
        if (from && to) out.push({ x1: from.left + from.width / 2 - c.left, y1: from.bottom - c.top + 2, x2: to.left + to.width / 2 - c.left, y2: to.top - c.top - 3 })
      }
    } else if (calcing && !(STEPS[n].arrows && !STEPS[n].arrows.length)) {
      const blank = rect('blank')
      const rs = STEPS[n].results ?? []
      const ex = STEPS[n].arrows
      if (rs.length > 1 && ex && ex.length === rs.length) {
        // two moved terms: each term has an arrow to its own blank
        ex.forEach((a, j) => {
          const from = rect(`${n}:${a.from[0]}`)
          const to = rect(j === 0 ? 'blank' : `blank${j}`)
          if (from && to) out.push({ x1: from.left + from.width / 2 - c.left, y1: from.bottom - c.top + 2, x2: to.left + to.width / 2 - c.left, y2: to.top - c.top - 3 })
        })
      } else if (blank) for (const p of sources(n)) out.push({ x1: p.x, y1: p.y, x2: blank.left + blank.width / 2 - c.left, y2: blank.top - c.top - 3 })
    }
    setArrows(out)
  }
  useLayoutEffect(() => {
    const raf = requestAnimationFrame(() => requestAnimationFrame(measure))
    const ro = new ResizeObserver(measure)
    if (chain.current) ro.observe(chain.current)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, phase === 'calc' || phase === 'calcwrong', phase === 'say' || phase === 'light'])

  const asking = phase === 'ask' || phase === 'review'
  const calcing = phase === 'calc' || phase === 'calcwrong'
  const saying = phase === 'say' || phase === 'light' // the sentence for step n is shown at the left of the line that is about to appear
  const tokenClass = 'rounded-md px-1'

  // one line of the working: tokens coloured by what changes (amber = about to change / changed, green = the new value).
  // The multiple-choice questions are answered ON the working: question 1 puts the letters A-D on the operators of the current line,
  // question 2 shows the next line with the changing part replaced by the four possible results A-D.
  function row(i: number) {
    const REL = /[=<>]|\\le|\\ge/
    const lineHasRel = i > 0 && (STEPS[i - 1]?.results ?? [STEPS[i - 1]?.result]).some((t) => t && REL.test(t.tex)) // a line that is already an equation needs no "=" in front
    const lineNo = <span className="w-7 text-2xl text-slate-500">{i > 0 && !lineHasRel && !lesson.start.some((t) => REL.test(t.tex)) ? '=' : ''}</span>
    const badge = (ch: string) => (
      <span className="absolute -top-8 left-1/2 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full bg-slate-700 text-sm font-bold text-white">{ch}</span>
    )

    // a blank with its prompt and four choices (w = 1: the first blank, 2: the second blank of a step with two moved terms)
    const calcBox = (c: Calc, w: 1 | 2) => {
      const tried = w === 2 ? wrong2 : wrongPicks
      const done = !!step.second && ok[w - 1]
      const inline = !!(step.after || step.replace) // a moved term: a small blank in the line, the options one under the other beside it
      return (
        <span
          key={`blank${w}`}
          className={inline ? 'inline-flex items-center gap-2' : 'inline-flex flex-col gap-3 rounded-lg border-2 border-dashed border-sky-400 bg-sky-50 p-2'}
          ref={inline ? undefined : (el) => {
            els.current[w === 1 ? 'blank' : 'blank1'] = el
          }}
        >
          {inline ? (
            <span
              ref={(el) => {
                els.current[w === 1 ? 'blank' : 'blank1'] = el
              }}
              className="inline-block h-9 w-12 shrink-0 rounded-md border-2 border-dashed border-sky-400 bg-sky-50"
            />
          ) : (
            <span className="px-1 text-base font-semibold text-sky-900">
              {/* $...$ inside the prompt is maths */}
              {(w === 1 ? step.calcPrompt ?? 'Which one is the result?' : c.q).split('$').map((part, pi) => (pi % 2 ? <span key={pi} className="text-xl" dangerouslySetInnerHTML={tex(part)} /> : <span key={pi}>{part}</span>))}
            </span>
          )}
          {/* the options go one under the other */}
          <span className={'flex flex-col items-start gap-3' + (inline ? ' rounded-lg border-2 border-dashed border-sky-400 bg-sky-50 p-1.5' : '')}>
            {c.options.map((o, oi) => {
              if (done && oi !== c.correct) return null
              const t = tried.includes(oi)
              return (
                <button
                  key={oi}
                  disabled={phase !== 'calc' || t || done}
                  onClick={() => chooseCalc(oi, w)}
                  className={'flex items-center gap-1 rounded-md border-2 bg-white px-1 py-0 text-xl transition ' + (done ? 'border-emerald-500' : t ? 'border-orange-300 opacity-30' : 'border-slate-300 hover:scale-105 hover:border-sky-500')}
                >
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-700 text-[10px] font-bold text-white">{done ? '✓' : LETTERS[oi]}</span>
                  <span dangerouslySetInnerHTML={tex(o)} />
                </button>
              )
            })}
          </span>
        </span>
      )
    }

    // question 2 with several blanks: the new line, a small blank for each term with its own options beside it
    if (i > n && calcing && step.blanks) {
      const by = new Map(step.blanks.map((b) => [b.id, b]))
      const hidden = new Set(step.blanks.flatMap((b) => b.hide ?? [])) // tokens written in the blank's `after`
      return (
        <div className="flex flex-wrap items-start gap-3 pt-1 text-2xl">
          {lineNo}
          {lineAt(n + 1).map((t) => {
            if (hidden.has(t.id)) return null
            const bl = by.get(t.id)
            const c = bl?.calc
            if (!bl || !c) return <span key={t.id} ref={(el) => { els.current[`${n + 1}:${t.id}`] = el }} className={tokenClass + ' flex h-9 shrink-0 items-center text-xl'} dangerouslySetInnerHTML={tex(t.tex)} />
            const done = bOk.includes(t.id)
            return (
              <span key={t.id} className="inline-flex items-start gap-3">
                <span className="flex items-center gap-1">
                  <span ref={(el) => { els.current[`blank:${t.id}`] = el }} className="inline-block h-9 w-12 shrink-0 rounded-md border-2 border-dashed border-sky-400 bg-sky-50" />
                  {bl.after && <span className="text-xl" dangerouslySetInnerHTML={tex(bl.after)} />}
                </span>
                <span className="flex flex-col items-start gap-3 rounded-lg border-2 border-dashed border-sky-400 bg-sky-50 p-1.5">
                  {c.options.map((o, oi) => {
                    if (done && oi !== c.correct) return null
                    const tried = (bTried[t.id] ?? []).includes(oi)
                    return (
                      <button
                        key={oi}
                        disabled={phase !== 'calc' || tried || done}
                        onClick={() => chooseBlank(t.id, oi)}
                        className={'flex items-center gap-1 rounded-md border-2 bg-white px-1 py-0 text-xl transition ' + (done ? 'border-emerald-500' : tried ? 'border-orange-300 opacity-30' : 'border-slate-300 hover:scale-105 hover:border-sky-500')}
                      >
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-700 text-[10px] font-bold text-white">{done ? '✓' : LETTERS[oi]}</span>
                        <span dangerouslySetInnerHTML={tex(o)} />
                      </button>
                    )
                  })}
                </span>
              </span>
            )
          })}
        </div>
      )
    }

    // question 2: the line after the step, the changing part is a blank with four choices
    if (i > n && calcing) {
      // a term that moves (after / replace): the row is the NEW line, the blank sits where the moved term lands
      const moves = !!(step.after || step.replace)
      const focus = new Set(moves ? (step.results ?? [step.result]).map((t) => t.id) : step.focus)
      let placed = false
      return (
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-2xl">
          {lineNo}
          {(moves ? lineAt(n + 1) : lineAt(n)).map((t) => {
            if (!focus.has(t.id)) return <span key={t.id} className={tokenClass + ' shrink-0 text-xl opacity-50'} dangerouslySetInnerHTML={tex(t.tex)} />
            if (placed) {
              // a second moved term: its own blank, with its own options
              if (step.second) return calcBox(step.second, 2)
              const j = (step.results ?? []).findIndex((r) => r.id === t.id)
              return <span key={t.id} ref={(el) => { els.current[`blank${j}`] = el }} className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border-2 border-dashed border-sky-400 bg-sky-50 text-base text-sky-700" dangerouslySetInnerHTML={tex(`\\square_{${j + 1}}`)} />
            }
            placed = true
            return calcBox(step.calc, 1)
          })}
        </div>
      )
    }

    const line = lineAt(i)
    const changedHere = i < n || (i === n && (saying || calcing)) ? new Set(STEPS[i].lit ?? STEPS[i].focus) : new Set<string>()
    const newIds = new Set(i > 0 && !STEPS[i]?.lit ? (STEPS[i - 1].results ?? [STEPS[i - 1].result]).map((t) => t.id) : [])
    return (
      <div className="flex flex-wrap items-center gap-1 text-2xl">
        {lineNo}
        {line.flatMap((t) => {
          // question 1: the candidate operations of the current line carry the letters
          const oi = i === n && asking && step.ask ? step.ask.options.findIndex((ids) => ids.includes(t.id)) : -1
          if (oi >= 0) {
            const tried = wrongPicks.includes(oi)
            return (
              <button
                key={t.id}
                ref={(el) => {
                  els.current[`${i}:${t.id}`] = el
                }}
                disabled={phase !== 'ask' || tried}
                onClick={() => choose(oi)}
                className={'relative rounded-lg px-1.5 transition ' + (tried ? 'opacity-30' : 'hover:scale-110')}
                style={{ background: AMBER, outline: '2px solid #f59e0b' }}
              >
                {badge(LETTERS[oi])}
                <span dangerouslySetInnerHTML={tex(t.tex)} />
              </button>
            )
          }
          // a step that removes brackets: the new line starts with the brackets still around each group, they fade away, and changed signs flip
          const mo = i > 0 ? STEPS[i - 1].morph : undefined
          const group = mo?.groups.find((ids) => ids.includes(t.id))
          const oldTex = mo?.from[t.id]
          return [
            group && group[0] === t.id ? <Paren key={`(${t.id}`} ch="(" /> : null,
            <span
              key={t.id}
              ref={(el) => {
                els.current[`${i}:${t.id}`] = el
              }}
              className={tokenClass + ' transition-colors duration-300'}
              style={{ background: changedHere.has(t.id) ? AMBER : newIds.has(t.id) ? GREEN : 'transparent', fontWeight: newIds.has(t.id) ? 700 : 400, opacity: i === n && asking ? 0.6 : 1 }}
            >
              {oldTex ? <Swap from={oldTex} to={t.tex} /> : <span dangerouslySetInnerHTML={tex(i === 0 && n === 0 && t.hl ? t.hl : t.tex)} />}
            </span>,
            group && group[group.length - 1] === t.id ? <Paren key={`)${t.id}`} ch=")" /> : null,
          ]
        })}
        {/* an option without tokens = "None of them": its own lettered chip at the end of the line */}
        {i === n && asking && step.ask
          ? step.ask.options.map((ids, oi) => {
              if (ids.length > 0) return null
              const tried = wrongPicks.includes(oi)
              return (
                <button
                  key="none"
                  disabled={phase !== 'ask' || tried}
                  onClick={() => choose(oi)}
                  className={'relative ml-3 rounded-lg px-2 text-lg transition ' + (tried ? 'opacity-30' : 'hover:scale-110')}
                  style={{ background: AMBER, outline: '2px solid #f59e0b' }}
                >
                  <span className="absolute -top-8 left-1/2 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full bg-slate-700 text-sm font-bold text-white">{LETTERS[oi]}</span>
                  None
                </button>
              )
            })
          : null}
        {i === STEPS.length && <span className="ml-3 text-2xl text-emerald-600">✓</span>}
        {i === STEPS.length && onDone && (
          <button className="ml-4 rounded-lg bg-emerald-500 px-4 py-1.5 font-semibold text-white" onClick={onDone}>
            Continue
          </button>
        )}
      </div>
    )
  }

  const lines = Array.from({ length: n + 1 + (saying || calcing ? 1 : 0) }, (_, i) => i)
  return (
    <div ref={top} className="mx-auto max-w-4xl scroll-mt-14 space-y-4 p-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-bold">{lesson.title}</h1>
        {!forced && (
          <>
        <select
          aria-label="Choose a lesson"
          value={lessonIdx}
          onChange={(e) => {
            run.current++
            streak.current = 0
            setN(0)
            setPhase('idle')
            setStarted(false)
            setWrongPicks([])
            setPicked(null)
            setLessonIdx(Number(e.target.value))
          }}
          className="max-w-full rounded-md border bg-white px-2 py-1 text-sm"
        >
          {LESSONS.map((l, i) => (
            <option key={l.key} value={i}>
              {l.label}
            </option>
          ))}
        </select>
        <span className="text-xs text-muted-foreground">{lesson.source}</span>
          </>
        )}
      </div>

      {/* right answer: a smiley and an encouraging word pop up in the middle for a moment (it never blocks a click) */}
      {cheer && (
        <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center">
          <motion.div
            key={cheer.id}
            initial={{ opacity: 0, scale: 0.3, y: 20 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.3, 1.2, 1, 1], y: [20, 0, 0, -30] }}
            transition={{ duration: 1.1, times: [0, 0.25, 0.7, 1] }}
            className="flex flex-col items-center gap-1 rounded-3xl bg-white/90 px-10 py-6 shadow-2xl"
          >
            <span className="text-7xl leading-none">{cheer.face}</span>
            <span className="text-2xl font-bold text-emerald-600">{cheer.text}</span>
          </motion.div>
        </div>
      )}

      {/* controls and the current question on ONE line, above the problem */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {!started && (
          <button className="rounded-lg bg-emerald-500 px-4 py-1.5 font-semibold text-white" onClick={() => begin(0)}>
            Start
          </button>
        )}
        <button
          className="rounded-lg border px-4 py-1.5 disabled:opacity-30"
          disabled={!started || n === 0}
          onClick={() => {
            // back to the question of the previous step (its line of the working goes away)
            run.current++
            streak.current = 0
            setCheer(null)
            setN(n - 1)
            begin(n - 1)
          }}
        >
          Back
        </button>
        <button
          className="rounded-lg border px-4 py-1.5"
          onClick={() => {
            run.current++
            streak.current = 0
            setN(0)
            setPhase('idle')
            setStarted(false)
            setWrongPicks([])
            setPicked(null)
            if (forced) begin(0)
          }}
        >
          Restart
        </button>
        <span className="text-sm text-muted-foreground">
          Step {Math.min(n + (phase !== 'idle' ? 1 : 0), STEPS.length)} / {STEPS.length}
        </span>
        {asking && step && (
          <motion.p key={`${n}-${asking ? 'a' : 'c'}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 rounded-lg border-2 border-sky-300 bg-sky-50 px-3 py-1 text-base font-semibold text-sky-900">
            {step.ask!.q}
          </motion.p>
        )}
      </div>

      {/* wrong answer: a pop-up in the middle of the screen; "Try again" (or a click outside it) asks the same question again */}
      {((phase === 'review' && picked !== null && step.ask) || (phase === 'calcwrong' && picked !== null)) && (() => {
        const close = () => {
          setPhase(phase === 'review' ? 'ask' : 'calc')
          setPicked(null)
        }
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={close}>
            <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.18 }} className="w-full max-w-3xl space-y-3 rounded-2xl border-2 border-orange-300 bg-orange-50 p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              {phase === 'review' && step.ask ? (
                <>
                  <p className="text-base font-semibold text-orange-800">Not yet. {step.ask.wrong[picked!]}</p>
                  <p className="text-xs font-bold uppercase tracking-wide text-orange-700">{lesson.review.heading}</p>
                  <div className="space-y-1">
                    {lesson.review.rows.map((b) => (
                      <div key={b.rule} className={'flex items-baseline gap-2 rounded-md px-2 py-1 text-sm ' + (b.rule === step.ask!.rule ? 'bg-amber-200 font-semibold' : 'opacity-70')}>
                        <span className="w-8 shrink-0 font-bold">{b.letters}</span>
                        <span>
                          {b.name} — <span className="font-normal">{b.note}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <p className="text-base font-semibold text-orange-800">
                    Not quite.{' '}
                    {(step.blanks && bWrong ? step.blanks.find((b) => b.id === bWrong)!.calc : which === 2 && step.second ? step.second : step.calc).hints[picked!].split('$').map((part, pi) => (pi % 2 ? <span key={pi} className="text-xl" dangerouslySetInnerHTML={tex(part)} /> : <span key={pi}>{part}</span>))}
                  </p>
                  {step.calc.example && <div className="rounded-lg bg-white/70 py-3 text-center text-2xl" dangerouslySetInnerHTML={tex(step.calc.example)} />}
                </>
              )}
              <button autoFocus className="rounded-lg bg-orange-500 px-4 py-1.5 font-semibold text-white" onClick={close}>
                Try again
              </button>
            </motion.div>
          </div>
        )
      })()}

      <div className="space-y-3">
      {/* the working: step sentence at the left, the line at the right, every line stays */}
      {lesson.figure && <div ref={figRef} className="rounded-xl border bg-white p-3" dangerouslySetInnerHTML={{ __html: lesson.figureAt ? lesson.figureAt(n) : lesson.figure }} />}
      {lesson.reference && (
        <div className="rounded-xl border bg-white px-5 py-3 text-lg">
          {lesson.reference.some((r) => r.cells) ? (
            // a table: the cells of every row sit in the same columns, so each question lines up with its answer
            <div className="grid items-center gap-x-6 gap-y-1" style={{ gridTemplateColumns: `auto repeat(${Math.max(...lesson.reference.map((r) => r.cells?.length ?? 0))}, minmax(4.5rem, auto))` }}>
              {lesson.reference.map((r) => (
                <div key={r.label} className="contents">
                  <span>{r.label}</span>
                  {(r.cells ?? []).map((c, ci) => (
                    <span key={ci} className="text-center" dangerouslySetInnerHTML={tex(c)} />
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {lesson.reference.map((r) => (
                <div key={r.label} className="flex flex-wrap items-center gap-x-3">
                  <span className={r.tex ? 'w-56 shrink-0' : ''}>{r.label}</span>
                  {r.tex && <span dangerouslySetInnerHTML={tex(r.tex)} />}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <div ref={chain} className="relative space-y-14 rounded-xl border p-5" style={{ minHeight: (STEPS.length + 1) * 86 + 60 }}>
        {lines.map((i) => (
          // the line of the next question fades in only after its arrow has been drawn (the arrow is measured from this line, which is already in place but invisible)
          <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15, delay: i === n + 1 && (calcing || saying) && !(STEPS[n].arrows && !STEPS[n].arrows.length) ? 0.3 : 0 }} className="grid grid-cols-[minmax(0,0.6fr)_minmax(0,2.2fr)] items-center gap-3">
            <div className={'text-right text-base leading-snug text-sky-900 ' + (i === n + 1 && !calcing ? 'rounded-lg bg-sky-100 p-2' : '')}>
              {i === 0 ? <span className="text-slate-500">{lesson.prompt}</span> : i === n + 1 && calcing ? null : STEPS[i - 1].say}
            </div>
            <div style={{ marginLeft: i > 0 ? STEPS[i - 1].indent : undefined, marginTop: i > 0 && STEPS[i - 1].lift ? -STEPS[i - 1].lift! : undefined }}>{row(i)}</div>
          </motion.div>
        ))}
        {n >= STEPS.length && !onDone && <p className="text-lg font-semibold text-emerald-700">Answer: {lesson.answer}</p>}

        <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
          <defs>
            <marker id="ah-chg" markerWidth="6" markerHeight="6" refX="4.5" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 z" fill="#ea580c" />
            </marker>
          </defs>
          {arrows.map((a, i) => (
            <motion.path
              key={i}
              d={a.pts ? `M ${a.pts.map(([x, y]) => `${x} ${y}`).join(' L ')}` : `M ${a.x1} ${a.y1} C ${a.x1} ${(a.y1! + a.y2!) / 2 + 8}, ${a.x2} ${(a.y1! + a.y2!) / 2 - 8}, ${a.x2} ${a.y2}`}
              fill="none"
              stroke="#ea580c"
              strokeWidth={2}
              markerEnd="url(#ah-chg)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.25 }}
            />
          ))}
        </svg>
      </div>

      {n > 0 && (
        <div className="text-xs text-muted-foreground">
          <span className="mr-1 inline-block h-3 w-3 rounded-sm align-middle" style={{ background: AMBER }} /> changed
          <span className="mx-1">→</span>
          <span className="mr-1 inline-block h-3 w-3 rounded-sm align-middle" style={{ background: GREEN }} /> new value
        </div>
      )}

      </div>
    </div>
  )
}

