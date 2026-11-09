// Grades 8, 10, 11, 12 (Crescent Beach textbooks): the question banks written by Gemini / subagents and checked (public/bank/g<grade>.json, made by scripts/export-bank.mjs).
// One exercise = one textbook exercise number; one question (8a, 8b ...) = one textbook part; its variants (5 normal + 5 harder) are the practice list that quiz.tsx draws from.
// A wrong answer shows the written solution (no step-by-step lesson yet: Lesson.solution).
// Imported by: quiz.tsx. Shape: exercise.ts.
import katex from 'katex'
import { renderToStaticMarkup } from 'react-dom/server'
import { createElement } from 'react'
import type { Exercise, Practice, Question } from './exercise'
import type { Lesson } from './lessons'
import { MathFigure } from './MathFigure'
import type { FigureSpec } from './MathFigure'

interface BankQ { q: string; a: string; d: string[]; s: string; l: number; f?: Record<string, unknown> }
interface BankPart { p: string; qs: BankQ[] }
interface BankEx { no: number; name?: string; parts: BankPart[] }
interface BankSec { no: number; title: string; exercises: BankEx[] }
interface BankCh { no: number; sections: BankSec[] }
export interface BankGrade { grade: number; chapters: BankCh[] }

// the key of an exercise on the quiz page: 8 -> 8 000 000 + chapter * 10 000 + section * 100 + exercise number (the Grade 9 exercises use keys below 4000)
export const bankKey = (grade: number, ch: number, sec: number, no: number) => grade * 1_000_000 + ch * 10_000 + sec * 100 + no
// the address of an exercise: #g8/1.1/4 (grade 8, section 1.1, exercise 4); a Grade 9 exercise is #<key>
export const hashOfKey = (k: number) => (k >= 1_000_000 ? `#g${Math.floor(k / 1_000_000)}/${Math.floor((k % 1_000_000) / 10_000)}.${Math.floor((k % 10_000) / 100)}/${k % 100}` : `#${k}`)
export const keyOfHash = (h: string): number | null => {
  const m = /^#g(\d+)\/(\d+)\.(\d+)\/(\d+)$/.exec(h)
  if (m) return bankKey(+m[1], +m[2], +m[3], +m[4])
  return /^#\d+$/.test(h) ? Number(h.slice(1)) : null
}
export const gradeOfKey = (key: number) => (key >= 1_000_000 ? Math.floor(key / 1_000_000) : 9)

const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
// text with \( ... \) formulas -> HTML (KaTeX for the formulas)
export const rich = (s: string) => {
  // an answer written as bare LaTeX (\frac{3}{5}) without \( \): the whole text is a formula
  if (!s.includes('\\(') && /\\[a-zA-Z]+|\^/.test(s)) return katex.renderToString(s, { throwOnError: false })
  let out = ''
  let last = 0
  for (const m of s.matchAll(/\\\(([\s\S]+?)\\\)/g)) {
    out += esc(s.slice(last, m.index)).replace(/\n/g, '<br>')
    out += katex.renderToString(m[1], { throwOnError: false })
    last = m.index! + m[0].length
  }
  return out + esc(s.slice(last)).replace(/\n/g, '<br>')
}
const figureHtml = (f: Record<string, unknown>) => renderToStaticMarkup(createElement(MathFigure, { figure: { type: 'drawing', ...f } as unknown as FigureSpec }))
const card = (b: BankQ) => `<div class="px-2 py-3 text-center text-xl leading-relaxed">${rich(b.q)}</div>${b.f ? `<div class="mx-auto mt-3 max-w-md">${figureHtml(b.f)}</div>` : ''}`
const span = (s: string) => `<span>${rich(s)}</span>`

// deterministic shuffle of the four options (the right one is not always first)
const place = (b: BankQ, seed: number): [string[], number] => {
  let h = seed
  for (const c of b.q) h = (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0
  const at = h % (b.d.length + 1)
  const all = [...b.d]
  all.splice(at, 0, b.a)
  return [all.map(span), at]
}

const solutionLesson = (b: BankQ, key: string): Lesson => ({
  key: `bank-${key}`,
  label: key,
  source: key,
  title: 'Solution',
  prompt: '',
  answer: b.a,
  start: [],
  steps: [],
  review: { heading: '', rows: [] },
  solution: `${card(b)}<div class="mt-4 rounded-xl bg-emerald-50 p-4 text-lg"><p class="mb-1 font-semibold text-emerald-800">Answer: ${rich(b.a)}</p><p>${rich(b.s || '')}</p></div>`,
})

export function buildBankExercises(data: BankGrade): { exercises: Record<number, Exercise>; chapters: { title: string; sections: { title: string; nodes: { no: number; name: string; show: number; parts: number; how: string; state: 'ready' }[] }[] }[] } {
  const exercises: Record<number, Exercise> = {}
  const chapters = data.chapters.map((ch) => ({
    title: `Chapter ${ch.no}`,
    sections: ch.sections.map((sec) => ({
      title: `${ch.no}.${sec.no} ${sec.title}`,
      nodes: sec.exercises.map((e) => {
        const no = bankKey(data.grade, ch.no, sec.no, e.no)
        const questions = e.parts.map((p, pi): Question => {
          const make = (b: BankQ, k: number): Practice => {
            const [choices, correct] = place(b, no + pi + k)
            return { figure: card(b), tex: b.q, choices, correct, why: '', lesson: () => solutionLesson(b, `${ch.no}.${sec.no} exercise ${e.no}${p.p}`) }
          }
          const all = p.qs.map((b, k) => make(b, k))
          return { part: p.p || '1', ...all[0], practice: all }
        })
        exercises[no] = { no: e.no, sec: `${ch.no}.${sec.no}`, prompt: 'Choose the answer.', questions }
        return { no, name: e.name || `Exercise ${e.no}`, show: e.no, parts: e.parts.length, how: '', state: 'ready' as const }
      }),
    })),
  }))
  return { exercises, chapters }
}

export async function loadBank(grade: number): Promise<BankGrade> {
  const r = await fetch(`${import.meta.env.BASE_URL}bank/g${grade}.json`)
  if (!r.ok) throw new Error(`bank g${grade}: ${r.status}`)
  return r.json()
}
