// Local demo: Grade 9 5.1 exercises 2 to 5. Choose an answer; right -> next question. Wrong -> the lesson (LessonPlayer), then 3 similar practice questions
// (a wrong practice answer opens that question's own lesson).
// Exercises 2 to 5. Left: roadmap of the section's exercises (click a built one to open it). Top: a ... j of the open exercise, click to jump.
// Imported by: quiz.html only. Data: exercise.ts (shape), quiz-data.ts (EX2), degree-data.ts (EX3), coefficient-data.ts (EX4), order-data.ts (EX5), section-data.ts.
import { createRoot } from 'react-dom/client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'motion/react'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import './demo.css'
import { supabase } from './supabase'
import { AuthGate } from './auth'

import { LessonPlayer } from './main'
import { VerticalLesson } from './vertical'
import type { Lesson } from './lessons'
import type { Exercise } from './exercise'
import { EX2 } from './quiz-data'
import { EX3 } from './degree-data'
import { EX4 } from './coefficient-data'
import { EX5 } from './order-data'
import { EX8, EX10 } from './simplify-data'
import { EX52, EX52H } from './bracket-data'
import { EX_GEO, EX_GEO53 } from './geo-data'
import { EX_GEO53B } from './geo53-data'
import { EX53 } from './mult-data'
import { EX54 } from './div-data'
import { EX_WORD54 } from './wordprob-data'
import { EX_COMBO54 } from './combo-data'
import { EX55 } from './review55-data'
import { EX51H, EX53H, EX54H } from './hard5-data'
import { EX61 } from './eq-data'
import { EX61H } from './hard6-data'
import { EX_LIT61 } from './literal-data'
import { EX_TRANS61 } from './translate-data'
import { EX_WORD61 } from './word61-data'
import { EX62 } from './eq62-data'
import { EX62H } from './hard62-data'
import { EX_WORD62 } from './word62-data'
import { EX_INEQ63 } from './ineq63-data'
import { EX_TRANS63 } from './translate63-data'
import { EX_LINE63 } from './numline-data'
import { EX_SENT63 } from './sentence63-data'
import { EX_INEQ64 } from './ineq64-data'
import { EX_INEQ65 } from './ineq65-data'
import { EX65H } from './hard65-data'
import { EX_EXP14, EX_EXP14H } from './exp14-data'
import { EX_ORDER15, EX_ORDER15H } from './order15-data'
import { EX_EXP16, EX_EXP16H } from './exp67-data'
import { EX_EXP17, EX_EXP17H } from './exp67-data'
import { EX_REVIEW18 } from './review18-data'
import { EX_LINEAR66 } from './linear66-data'
import { EX_SEQ41, EX_SEQ41H } from './seq41-data'
import { EX_GRAPH42, EX_GRAPH42H } from './graph42-data'
import { EX_GRAPH43, EX_GRAPH43H } from './graph43-data'
import { EX_GRAPH44 } from './graph44-data'
import { EX_REVIEW45 } from './review45-data'
import { EX_RATIONAL31, EX_RATIONAL31H } from './rational31-data'
import { EX_DEC32, EX_DEC32H } from './decimal32-data'
import { EX_INT32, EX_INT32H } from './int32-data'
import { EX_FRAC33, EX_FRAC33WH } from './frac33-data'
import { EX_FRAC34, EX_FRAC34H, EX_FRAC34H2 } from './frac34-data'
import { EX_FRAC33A, EX_FRAC33H } from './frac33b-data'
import { GraphDraw } from './graph-draw'
import { FillTable } from './fill-table'
import { SortLine } from './sort-line'
import { NODES, NODES52, NODES53, NODES54, NODES55, NODES61, NODES62, NODES63, NODES64, NODES65, NODES66, NODES41, NODES42, NODES43, NODES44, NODES45, NODES31, NODES32, NODES33, NODES34, NODES35, NODES11, NODES12, NODES13, NODES14, NODES15, NODES16, NODES17, NODES18, CHALLENGE_OF, REGULAR_OF } from './section-data'
import { EX_SQRT13, EX_SQRT13H } from './sqrt13-data'
import { EX_SQRT12, EX_SQRT12H } from './sqrt12-data'
import { EX_REAL11, EX_REAL11H } from './real11-data'
import { MultiPick } from './multi-pick'
import { EX_REVIEW35, EX_REVIEW35H } from './review35-data'

// the page opens at the newest section (change these two when a new section is added)
const LAST_NO = 2902
const LAST_OPEN = ['Chapter 1', '1.8 Chapter review']
const html = (s: string) => ({ __html: katex.renderToString(s, { throwOnError: false }) })

// a long sentence (\text{...}, with $math$ or other math between) is plain text that wraps; KaTeX would keep it on one line
const isSentence = (s: string) => s.includes('\\text{') && s.length > 70
const esc = (t: string) => t.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]!).replace(/\\([%&#_$])/g, '$1')
const sentenceHtml = (s: string) => {
  const k = (m: string) => katex.renderToString(m, { throwOnError: false })
  let out = ''
  let last = 0
  for (const m of s.matchAll(/\\text\{([^}]*)\}/g)) {
    if (s.slice(last, m.index).trim()) out += k(s.slice(last, m.index))
    out += m[1].split('$').map((p, i) => (i % 2 ? k(p) : esc(p))).join('')
    last = m.index! + m[0].length
  }
  if (s.slice(last).trim()) out += k(s.slice(last))
  return { __html: out }
}

// font size (px) of the question card so that its TeX fits on one line: 30 px, smaller the longer it is (backslash commands count as one character each)
// a lesson is shown by LessonPlayer, or by VerticalLesson when it is a vertical calculation
const LessonView = ({ lesson, onDone }: { lesson: Lesson; onDone: () => void }) => (lesson.vertical ? <VerticalLesson lesson={lesson} onDone={onDone} /> : <LessonPlayer lesson={lesson} onDone={onDone} />)

const sizeFor = (t: string) => {
  if (t.includes('\\begin{array}')) return 26 // a vertical calculation: its width is the number of columns, not the length of the TeX
  const n = t.replace(/\\[a-zA-Z]+/g, 'x').replace(/[{}]/g, '').length
  return Math.max(14, Math.min(30, Math.floor(540 / (0.72 * n))))
}

// Every page load, each slot (3b ...) asks ONE question drawn at random from its bank of made-up variants (the textbook question itself is never asked).
// PRACTICE = how many more variants follow after a wrong answer and its lesson (0: the slot is done after the lesson).
const PRACTICE = 0
const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5)
type Slot = Exercise['questions'][number] & { bank?: Exercise['questions'][number]['practice'] }
const varied = (ex: Exercise): Exercise => ({
  ...ex,
  questions: ex.questions.map((q) => {
    if (q.ladder) {
      // ordered easy -> hard: the first question comes from the easy third, a redo (jump) takes the next harder one
      const m = Math.floor(Math.random() * Math.max(1, Math.ceil(q.practice.length / 3)))
      return { ...q, ...q.practice[m], practice: [], bank: q.practice }
    }
    const [main, ...rest] = shuffle(q.practice)
    return { ...q, ...main, practice: rest.slice(0, main.draw ? 1 : PRACTICE), bank: rest } // `bank`: the other variants, for redoing the slot; a graph the student drew wrong is drawn once more after its lesson
  }),
})
// key = the exercise number in 5.1; 5.2 exercise n has the key 100 + n
const EXERCISES: Record<number, Exercise> = Object.fromEntries(
  Object.entries({ ...Object.fromEntries(EX_REVIEW18.map((e) => [2900 + e.no, e])), ...Object.fromEntries([...EX_EXP17, ...EX_EXP17H].map((e) => [2800 + e.no, e])), ...Object.fromEntries([...EX_EXP16, ...EX_EXP16H].map((e) => [2700 + e.no, e])), ...Object.fromEntries([...EX_ORDER15, ...EX_ORDER15H].map((e) => [2600 + e.no, e])), ...Object.fromEntries([...EX_EXP14, ...EX_EXP14H].map((e) => [2500 + e.no, e])), 2: EX2, 3: EX3, 4: EX4, 5: EX5, 8: EX8, 10: EX10, 18: EX51H[0], ...Object.fromEntries([...EX52, ...EX_GEO, ...EX52H].map((e) => [100 + e.no, e])), ...Object.fromEntries([...EX53, ...EX_GEO53B, ...EX_GEO53, ...EX53H].map((e) => [200 + e.no, e])), ...Object.fromEntries([...EX54, ...EX_WORD54, ...EX_COMBO54, ...EX54H].map((e) => [300 + e.no, e])), ...Object.fromEntries(EX55.map((e) => [400 + e.no, e])), ...Object.fromEntries([...EX61, ...EX61H, ...EX_LIT61, ...EX_TRANS61, ...EX_WORD61].map((e) => [500 + e.no, e])), ...Object.fromEntries([...EX62, ...EX62H, ...EX_WORD62].map((e) => [600 + e.no, e])), ...Object.fromEntries([...EX_INEQ63, ...EX_TRANS63, ...EX_LINE63, ...EX_SENT63].map((e) => [700 + e.no, e])), ...Object.fromEntries(EX_INEQ64.map((e) => [800 + e.no, e])), ...Object.fromEntries([...EX_INEQ65, ...EX65H].map((e) => [900 + e.no, e])), ...Object.fromEntries(EX_LINEAR66.map((e) => [1000 + e.no, e])), ...Object.fromEntries([...EX_SEQ41, ...EX_SEQ41H].map((e) => [1100 + e.no, e])), ...Object.fromEntries([...EX_GRAPH42, ...EX_GRAPH42H].map((e) => [1200 + e.no, e])), ...Object.fromEntries([...EX_GRAPH43, ...EX_GRAPH43H].map((e) => [1300 + e.no, e])), ...Object.fromEntries(EX_GRAPH44.map((e) => [1400 + e.no, e])), ...Object.fromEntries(EX_REVIEW45.map((e) => [1500 + e.no, e])), ...Object.fromEntries([...EX_INT32, ...EX_DEC32, ...EX_INT32H, ...EX_DEC32H].map((e) => [1700 + e.no, e])), ...Object.fromEntries([...EX_FRAC33A, ...EX_FRAC33, ...EX_FRAC33H, ...EX_FRAC33WH].map((e) => [1800 + e.no, e])), ...Object.fromEntries([...EX_FRAC34, ...EX_FRAC34H, ...EX_FRAC34H2].map((e) => [1900 + e.no, e])),...Object.fromEntries([...EX_REVIEW35, ...EX_REVIEW35H].map((e) => [2100 + e.no, e])),...Object.fromEntries([...EX_REAL11, ...EX_REAL11H].map((e) => [2200 + e.no, e])),...Object.fromEntries([...EX_SQRT12, ...EX_SQRT12H].map((e) => [2300 + e.no, e])),...Object.fromEntries([...EX_SQRT13, ...EX_SQRT13H].map((e) => [2400 + e.no, e])),...Object.fromEntries([...EX_RATIONAL31, ...EX_RATIONAL31H].map((e) => [1600 + e.no, e])) }).map(([no, ex]) => [no, varied(ex)]),
)

type Stage = 'ask' | 'right' | 'lesson' | 'plesson' | 'practice' | 'done'
type Result = 'first' | 'learned'

// a teacher's red tick: a brush-stroke shape (thin start, thick turn, pointed end) that is revealed along its spine when an answer is right, then fades
function Tick() {
  return (
    <motion.svg
      viewBox="0 0 260 200"
      className="pointer-events-none absolute right-5 top-1/2 z-30 h-10 w-12 -translate-y-1/2 overflow-visible"
      initial={{ opacity: 1 }}
      animate={{ opacity: [1, 1, 0] }}
      transition={{ duration: 1, times: [0, 0.8, 1] }}
    >
      <defs>
        <linearGradient id="tick-fill" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#dc2626" />
          <stop offset="1" stopColor="#f43f5e" />
        </linearGradient>
        <mask id="tick-reveal" maskUnits="userSpaceOnUse" x="0" y="0" width="260" height="200">
          <motion.path
            d="M26 104 L86 162 C130 104 190 52 248 10"
            fill="none"
            stroke="white"
            strokeWidth={46}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </mask>
      </defs>
      <g mask="url(#tick-reveal)">
        <path
          d="M20 98 C32 91 46 94 54 104 L86 140 C122 92 182 42 248 10 C194 74 136 132 102 184 C96 193 82 190 76 182 L24 114 C17 107 16 101 20 98 Z"
          fill="url(#tick-fill)"
        />
      </g>
    </motion.svg>
  )
}

// right = the index of the right option once the student has chosen it: it turns green and gets the small tick
function Choices({ choices, math, onPick, right }: { choices: string[]; math?: boolean; onPick: (i: number) => void; right?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {choices.map((c, i) => (
        <button
          key={c}
          disabled={right !== undefined}
          onClick={() => onPick(i)}
          className={'relative flex items-center gap-4 rounded-xl border-2 px-5 py-3 text-left text-lg font-semibold transition ' + (i === right ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 bg-white hover:border-sky-400')}
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-700">{'abcd'[i]}</span>
          {c.startsWith('<svg') ? <span className="block w-full" dangerouslySetInnerHTML={{ __html: c }} /> : math ? <span dangerouslySetInnerHTML={html(c)} /> : c}
          {i === right && <Tick key={c} />}
        </button>
      ))}
    </div>
  )
}

// left: the exercises of sections 5.1 and 5.2 (the built ones open on click)
function Side({ current, onOpen, results, grade, loaded, resumeRef }: { current: number; onOpen: (no: number) => void; results: Record<number, (Result | undefined)[]>; grade: number; loaded: boolean; resumeRef: { current: () => void } }) {
  const chapters = [
    { title: 'Chapter 1', sections: [{ title: '1.1 The real number system', nodes: NODES11 }, { title: '1.2 Square roots', nodes: NODES12 }, { title: '1.3 Non-perfect squares', nodes: NODES13 }, { title: '1.4 Exponents', nodes: NODES14 }, { title: '1.5 Order of operations', nodes: NODES15 }, { title: '1.6 Product and quotient rules', nodes: NODES16 }, { title: '1.7 Power rules', nodes: NODES17 }, { title: '1.8 Chapter review', nodes: NODES18 }] },
    { title: 'Chapter 3', sections: [{ title: '3.1 Rational numbers', nodes: NODES31 }, { title: '3.2 Adding and subtracting decimals', nodes: NODES32 }, { title: '3.3 Adding and subtracting fractions', nodes: NODES33 }, { title: '3.4 Multiplying and dividing fractions', nodes: NODES34 }, { title: '3.5 Chapter review', nodes: NODES35 }] },
    { title: 'Chapter 4', sections: [{ title: '4.1 Linear patterns', nodes: NODES41 }, { title: '4.2 Graphing linear equations', nodes: NODES42 }, { title: '4.3 Graphing in standard form', nodes: NODES43 }, { title: '4.4 Equations and graphs', nodes: NODES44 }, { title: '4.5 Chapter review', nodes: NODES45 }] },
    { title: 'Chapter 5', sections: [
    { title: '5.1 Polynomials', nodes: NODES.map((n) => ({ ...n, show: n.no })) },
    { title: '5.2 Add and subtract', nodes: NODES52 },
    { title: '5.3 Multiplying', nodes: NODES53 },
    { title: '5.4 Dividing', nodes: NODES54 },
    { title: '5.5 Chapter review', nodes: NODES55 },
    ] },
    { title: 'Chapter 6', sections: [{ title: '6.1 Linear equations', nodes: NODES61 }, { title: '6.2 Fractions and decimals', nodes: NODES62 }, { title: '6.3 Inequalities', nodes: NODES63 }, { title: '6.4 Solving inequalities', nodes: NODES64 }, { title: '6.5 Solving inequalities (more)', nodes: NODES65 }, { title: '6.6 Linear relations', nodes: NODES66 }] },
  ]
  const sections = chapters.flatMap((c) => c.sections)
  const [closed, setClosed] = useState<Record<string, boolean>>(() => Object.fromEntries([...chapters, ...sections].map((s) => [s.title, !LAST_OPEN.includes(s.title)]))) // every section starts folded; click a section title to unfold its exercises
  // an exercise with every question done is 'first' (all right first time) or 'learned' (some needed the lesson)
  const statusOf = (no: number): Result | undefined => {
    const r = results[no] ?? []
    return EXERCISES[no] && r.filter(Boolean).length === EXERCISES[no].questions.length ? (r.every((x) => x === 'first') ? 'first' : 'learned') : undefined
  }
  // open the lesson after the last finished one (sidebar order) and unfold its section; runs once the saved progress is read, and for the header button
  const resume = () => {
    const flat = chapters.flatMap((c) => c.sections.flatMap((s) => s.nodes.filter((n) => !REGULAR_OF[n.no] && EXERCISES[n.no]).map((n) => ({ no: n.no, c: c.title, s: s.title }))))
    const last = flat.map((x) => !!statusOf(x.no)).lastIndexOf(true)
    const t = flat[Math.min(last + 1, flat.length - 1)]
    if (!t) return
    onOpen(t.no)
    setClosed((c) => ({ ...c, [t.c]: false, [t.s]: false }))
  }
  resumeRef.current = resume
  useEffect(() => { if (loaded) resume() }, [loaded]) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <nav className="hidden w-60 shrink-0 space-y-1 border-r p-4 md:block">
      {grade !== 9 && <p className="pt-2 text-sm text-slate-500">No exercises for Grade {grade} yet.</p>}
      {grade === 9 && chapters.map((ch) => (
        <div key={ch.title} className="space-y-1">
          <button onClick={() => setClosed((c) => ({ ...c, [ch.title]: !c[ch.title] }))} className="flex w-full items-center gap-1 pt-2 text-left text-sm font-bold text-slate-700 hover:text-slate-900">
            <span className={'inline-block transition-transform ' + (closed[ch.title] ? '' : 'rotate-90')}>▸</span>
            {ch.title}
          </button>
          {!closed[ch.title] && ch.sections.map((s, si) => (
        <div key={s.title} className="space-y-1 pl-3">
          <button
            onClick={() => setClosed((c) => ({ ...c, [s.title]: !c[s.title] }))}
            className={'mb-2 flex w-full items-center gap-1 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-800 ' + (si ? 'pt-4' : 'pt-3')}
          >
            <span className={'inline-block transition-transform ' + (closed[s.title] ? '' : 'rotate-90')}>▸</span>
            {s.title}
            {/* every exercise of the section done: a tick (all right first time) or a pencil */}
            {s.nodes.filter((n) => !REGULAR_OF[n.no]).every((n) => statusOf(n.no)) && <span className="ml-1 text-sm text-emerald-600">✓</span>}
          </button>
          {!closed[s.title] && s.nodes.filter((n) => !REGULAR_OF[n.no]).map((n) => {
            const built = !!EXERCISES[n.no]
            const on = n.no === current || CHALLENGE_OF[n.no] === current
            // every question done: a tick when all were right first time, a pencil when some needed the lesson
            const status = statusOf(n.no)
            const finished = built && !!status
            const challengeDone = !!CHALLENGE_OF[n.no] && !!statusOf(CHALLENGE_OF[n.no])
            const mark = challengeDone ? '👍' : status ? '✓' : n.show
            return (
              <button
                key={n.no}
                disabled={!built}
                title={built ? '' : 'Not built yet'}
                onClick={() => onOpen(n.no)}
                className={'flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm ' + (on ? 'bg-sky-100 font-semibold text-sky-900' : built ? 'hover:bg-sky-50' : 'text-slate-400')}
              >
                <span className={'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ' + (on ? 'bg-sky-500 text-white' : finished ? (mark === '✓' ? 'bg-emerald-600 text-white' : 'bg-amber-400 text-white') : built ? 'bg-emerald-400 text-white' : 'bg-slate-200 text-slate-500')}>{mark}</span>
                <span className="truncate">{n.name}</span>
              </button>
            )
          })}
        </div>
          ))}
        </div>
      ))}
    </nav>
  )
}

// top: a ... j of the open exercise; click a circle to jump to that question
function Road({ ex, i, result, onJump, compact }: { ex: Exercise; i: number; result: (Result | undefined)[]; onJump: (k: number) => void; compact?: boolean }) {
  return (
    <div className={'mx-auto flex max-w-2xl items-center ' + (compact ? '' : 'px-6 pt-6')}>
      {ex.questions.map((q, k) => {
        const r = result[k]
        const cls = k === i ? 'bg-sky-500 text-white ring-4 ring-sky-200' : r === 'first' ? 'bg-emerald-500 text-white' : r === 'learned' ? 'bg-amber-400 text-white' : 'bg-slate-200 text-slate-500'
        return (
          <div key={q.part} className="flex flex-1 items-center last:flex-none">
            <button title={`${ex.no}${q.part}`} onClick={() => onJump(k)} className={'relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition hover:scale-110 ' + cls}>
              {k !== i && r ? '✓' : q.part}
              {r === 'first' && <span className="absolute -right-1 -top-2 text-xs">👍</span>}
            </button>
            {k < ex.questions.length - 1 && <div className={'h-1 flex-1 ' + (r ? 'bg-emerald-300' : 'bg-slate-200')} />}
          </div>
        )
      })}
      <span className="ml-3 shrink-0 text-sm font-semibold text-slate-600">{result.filter((x) => x === 'first').length}/{ex.questions.length}</span>
    </div>
  )
}

// top bar: the grade, how far along, back to the last exercise, and the account
function Header({ grade, onGrade, done, total, email, onContinue }: { grade: number; onGrade: (g: number) => void; done: number; total: number; email: string; onContinue: () => void }) {
  return (
    <header className="sticky top-0 z-40 flex h-12 items-center gap-3 border-b bg-white/90 px-4 backdrop-blur">
      <span className="font-serif text-lg font-bold text-slate-800">Math Workbook</span>
      <select value={grade} onChange={(e) => onGrade(Number(e.target.value))} aria-label="Grade" className="rounded-lg border bg-white px-2 py-1 text-sm font-semibold text-slate-700">
        {[8, 9, 10, 11, 12].map((g) => <option key={g} value={g}>Grade {g}</option>)}
      </select>
      <button onClick={onContinue} className="hidden rounded-lg border px-2 py-1 text-sm text-slate-600 hover:bg-slate-50 sm:block">Latest exercise</button>
      <span className="ml-auto hidden text-sm text-slate-500 sm:block">{done} / {total} exercises done</span>
      <span className="hidden max-w-48 truncate text-sm text-slate-500 md:block" title={email}>{email}</span>
      <button onClick={() => supabase.auth.signOut()} className="rounded-lg border px-2 py-1 text-sm text-slate-600 hover:bg-slate-50">Sign out</button>
    </header>
  )
}

function Quiz({ userId, email }: { userId: string; email: string }) {
  const [grade, setGrade] = useState(9) // only Grade 9 has exercises so far
  const [no, setNo] = useState(LAST_NO)
  const [i, setI] = useState(0)
  const [stage, setStage] = useState<Stage>('ask')
  const [px, setPx] = useState(0) // practice question 0..2
  const [results, setResults] = useState<Record<number, (Result | undefined)[]>>({})
  const resumeRef = useRef<() => void>(() => {})
  const [loaded, setLoaded] = useState(false) // the saved progress has been read: only then is it written back
  useEffect(() => {
    supabase.from('quiz_progress').select('results').eq('user_id', userId).maybeSingle().then(({ data }) => {
      if (data?.results) setResults(data.results)
      setLoaded(true)
    })
  }, [userId])
  useEffect(() => {
    if (!loaded) return
    const t = setTimeout(() => { supabase.from('quiz_progress').upsert({ user_id: userId, results, updated_at: new Date().toISOString() }).then(({ error }) => { if (error) console.error('save progress', error) }) }, 800) // the request is only sent once .then is attached
    return () => clearTimeout(t)
  }, [results, loaded, userId])
  const regularNos = Object.keys(EXERCISES).map(Number).filter((n) => !REGULAR_OF[n]) // challenges do not count
  const doneCount = regularNos.filter((n) => (results[n] ?? []).filter(Boolean).length === EXERCISES[n].questions.length).length
  const ex = EXERCISES[no]
  const [drawn, setDrawn] = useState<Record<string, Slot>>({}) // a slot redone after the lesson asks a new random variant
  const q = drawn[`${no}:${i}`] ?? ex.questions[i]
  const result = results[no] ?? []
  const lesson = useMemo(() => q.lesson(), [q])
  const pr = q.practice[px]
  const practiceLesson = useMemo(() => pr?.lesson(), [pr])
  const learned = result[i] === 'learned'
  const inPractice = stage === 'practice' || stage === 'plesson' || (stage === 'right' && learned)

  const jump = (k: number) => {
    const base = ex.questions[k] as Slot
    const shown = drawn[`${no}:${k}`] ?? base
    if (result[k] && base.bank?.length) {
      const others = base.bank.filter((v) => v.tex !== shown.tex)
      const pool = others.length ? others : base.bank
      // a ladder: `bank` is the whole ordered list, so a redo takes the next harder variant (after the hardest, the easiest again)
      const at = base.bank.findIndex((b) => b.tex === shown.tex)
      const v = base.ladder ? base.bank[(at + 1) % base.bank.length] : pool[Math.floor(Math.random() * pool.length)]
      setDrawn((d) => ({ ...d, [`${no}:${k}`]: { ...base, ...v, practice: [] } }))
    }
    setI(k)
    setStage('ask')
    setPx(0)
  }
  const open = (n: number) => {
    setNo(n)
    setI(0)
    setStage('ask')
    setPx(0)
  }
  const next = () => (i + 1 < ex.questions.length ? jump(i + 1) : setStage('done'))
  const record = (r: Result) => setResults((cur) => ({ ...cur, [no]: Object.assign([...(cur[no] ?? [])], { [i]: r }) }))

  const pick = (c: number) => {
    if (stage === 'ask') {
      record(c === q.correct ? 'first' : 'learned')
      setStage(c === q.correct ? 'right' : 'lesson')
    } else {
      setStage(c === pr.correct ? 'right' : 'plesson') // a wrong practice answer gets that question's own lesson
    }
  }

  // the next practice question, or the next textbook question after the last one
  const advance = () => {
    if (!inPractice || px + 1 >= q.practice.length) return next()
    setPx(px + 1)
    setStage('practice')
  }

  // a right answer shows a tick (1 s), then the next question comes by itself (a question finished through its lesson gets no tick)
  useEffect(() => {
    if (stage !== 'right') return
    const t = setTimeout(advance, 1000)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, i, px, no])

  let body
  if (stage === 'done') {
    const challenge = CHALLENGE_OF[no]
    const regular = REGULAR_OF[no]
    body = (
      <div className="mx-auto max-w-md space-y-4 p-10 text-center">
        {challenge ? (
          <>
            <h1 className="text-xl font-bold">Well done! Start the challenge?</h1>
            <p className="text-slate-600">Harder questions on the same topic. Optional.</p>
            <button onClick={() => open(challenge)} className="rounded-xl bg-emerald-500 px-5 py-2 font-semibold text-white hover:bg-emerald-600">Start challenge</button>
          </>
        ) : regular ? (
          <>
            <h1 className="text-xl font-bold">👍 Challenge complete!</h1>
            <button onClick={() => open(regular)} className="rounded-xl border px-5 py-2 font-semibold text-slate-700 hover:bg-slate-50">Back to the regular exercise</button>
          </>
        ) : (
          <h1 className="text-xl font-bold">Done!</h1>
        )}
      </div>
    )
  } else if (stage === 'lesson') {
    body = (
      <>
        <QuestionStrip tex={q.tex} />
        <LessonView
          key={`${no}${q.part}`}
          lesson={lesson}
          onDone={() => {
            if (!q.practice.length) return next()
            setPx(0)
            setStage('practice')
          }}
        />
      </>
    )
  } else if (stage === 'plesson') {
    body = (
      <>
        <QuestionStrip tex={pr.tex} />
        <LessonView
          key={`${no}${q.part}-${px}`}
          lesson={practiceLesson!}
          onDone={advance}
        />
      </>
    )
  } else {
    body = (
      <div className="mx-auto max-w-2xl space-y-5 p-6">
        <div className="flex items-baseline gap-3">
          <h1 className="text-xl font-bold">{ex.prompt}</h1>
          {/* an exercise with a challenge: switch between the regular questions and the harder ones (own progress each) */}
          {(CHALLENGE_OF[no] || REGULAR_OF[no]) && (
            <span className="inline-flex overflow-hidden rounded-full border text-xs font-semibold">
              {([['Regular', REGULAR_OF[no] ?? no], ['Challenge', CHALLENGE_OF[no] ?? no]] as const).map(([label, to]) => (
                <button key={label} onClick={() => to !== no && open(to)} className={'px-3 py-1 ' + (to === no ? (label === 'Challenge' ? 'bg-amber-400 text-white' : 'bg-sky-500 text-white') : 'bg-white text-slate-500 hover:bg-slate-50')}>
                  {label}
                </button>
              ))}
            </span>
          )}
          <span className="text-sm text-muted-foreground">
            {ex.sec ? `${ex.sec} · ` : ''}Exercise {ex.no}
            {q.part} · {i + 1} / {ex.questions.length}
            {inPractice && ` · practice ${px + 1} / ${q.practice.length}`}
          </span>
        </div>

        {/* a figure question shows the picture; otherwise one line: no wrapping, and a smaller font the longer the expression is */}
        {(inPractice ? pr.figure : q.figure) ? (
          <>
            {(inPractice ? pr.onFigure || pr.showTex : q.onFigure || q.showTex) && <div className="rounded-xl border bg-white p-4 text-center text-2xl" dangerouslySetInnerHTML={html(inPractice ? pr.tex : q.tex)} />}
            <div
              className="rounded-xl border bg-white p-4"
              onClick={(inPractice ? pr.onFigure : q.onFigure) && (stage === 'ask' || stage === 'practice') ? (e) => {
                const hit = (e.target as Element).closest('[data-choice]')
                if (hit) pick(Number(hit.getAttribute('data-choice')))
              } : undefined}
              dangerouslySetInnerHTML={{ __html: (inPractice ? pr.figure : q.figure)! }}
            />
          </>
        ) : (
        isSentence(inPractice ? pr.tex : q.tex) ? (
          <div className="rounded-xl border bg-white p-8 text-center font-serif text-xl leading-relaxed" dangerouslySetInnerHTML={sentenceHtml(inPractice ? pr.tex : q.tex)} />
        ) : (
        <div
          className="rounded-xl border bg-white p-8 text-center whitespace-nowrap overflow-x-auto [&_.katex-html]:whitespace-nowrap"
          style={{ fontSize: sizeFor(inPractice ? pr.tex : q.tex) }}
          dangerouslySetInnerHTML={html(inPractice ? pr.tex : q.tex)}
        />
        )
        )}

        {(inPractice ? pr.draw : q.draw) && (
          <GraphDraw key={`${no}${q.part}-${px}-${inPractice}`} spec={(inPractice ? pr.draw : q.draw)!} disabled={!(stage === 'ask' || stage === 'practice')} onSubmit={(ok) => pick(ok ? 0 : 1)} />
        )}

        {(inPractice ? pr.fill : q.fill) && (
          <FillTable key={`${no}${q.part}-${px}-${inPractice}`} spec={(inPractice ? pr.fill : q.fill)!} disabled={!(stage === 'ask' || stage === 'practice')} onSubmit={(ok) => pick(ok ? 0 : 1)} />
        )}

        {(inPractice ? pr.sort : q.sort) && (
          <SortLine key={`${no}${q.part}-${px}-${inPractice}`} spec={(inPractice ? pr.sort : q.sort)!} disabled={!(stage === 'ask' || stage === 'practice')} onSubmit={(ok) => pick(ok ? 0 : 1)} />
        )}

        {(inPractice ? pr.multi : q.multi) && (
          <MultiPick key={`${no}${q.part}-${px}-${inPractice}`} spec={(inPractice ? pr.multi : q.multi)!} disabled={!(stage === 'ask' || stage === 'practice')} onSubmit={(ok) => pick(ok ? 0 : 1)} />
        )}

        {(stage === 'ask' || stage === 'practice' || stage === 'right') && !(inPractice ? pr.onFigure || pr.draw || pr.fill || pr.sort || pr.multi : q.onFigure || q.draw || q.fill || q.sort || q.multi) && (
          <Choices key={`${no}${q.part}-${px}-${inPractice}`} choices={inPractice ? pr.choices : q.choices} math={ex.mathChoices} onPick={pick} right={stage === 'right' ? (inPractice ? pr.correct : q.correct) : undefined} />
        )}

        {stage === 'right' && (
          <>
            {(inPractice ? pr.why : q.why) && <p className="font-semibold text-emerald-700">{inPractice ? pr.why : q.why}</p>}
          </>
        )}
      </div>
    )
  }

  return (
    <>
    <Header grade={grade} onGrade={setGrade} done={doneCount} total={regularNos.length} email={email} onContinue={() => resumeRef.current()} />
    <div className="flex min-h-[calc(100vh-3rem)]">
      <Side current={no} onOpen={open} results={results} grade={grade} loaded={loaded} resumeRef={resumeRef} />
      <div className="min-w-0 flex-1">
        {stage === 'lesson' || stage === 'plesson' ? (
          <div className="flex items-center gap-3 px-4 pt-3">
            <div id="lesson-controls" className="flex shrink-0 items-center gap-2" />
            <div className="min-w-0 flex-1"><Road ex={ex} i={i} result={result} onJump={jump} compact /></div>
          </div>
        ) : (
          <Road ex={ex} i={stage === 'done' ? -1 : i} result={result} onJump={jump} />
        )}
        {body}
      </div>
    </div>
    </>
  )
}

// the original question, kept on screen above a lesson
// the original question, kept on screen above a lesson: ONE line
const QuestionStrip = ({ tex }: { tex: string }) => {
  const one = tex.replace(/\}\\\\ /g, '} ') // a line break between the sentence and the expression becomes a space
  return (
    <div className="px-4 pt-2">
      {isSentence(one) ? (
        <div className="overflow-x-auto whitespace-nowrap rounded-xl border bg-white px-3 py-1.5 [scrollbar-width:none] text-center font-serif text-base" dangerouslySetInnerHTML={sentenceHtml(one)} />
      ) : (
        <div className="overflow-x-auto whitespace-nowrap rounded-xl border bg-white px-3 py-1.5 [scrollbar-width:none] text-center text-lg [&_.katex-html]:whitespace-nowrap" dangerouslySetInnerHTML={html(one)} />
      )}
    </div>
  )
}

createRoot(document.getElementById('root')!).render(<AuthGate>{(userId, email) => <Quiz key={userId} userId={userId} email={email} />}</AuthGate>)
