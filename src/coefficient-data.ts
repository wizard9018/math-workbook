// Grade 9, 5.1 exercise 4 a-h ("Determine the coefficient of each monomial", bank/G9-ch5/s1/items.json) with its lesson and practice questions.
// Wrong answer -> the textbook table (term -> coefficient) and the same question once more. No sentences except the short pop-up hint.
// Imported by: quiz.tsx. Shape: exercise.ts.
import type { Exercise, Practice, Question } from './exercise'
import type { Lesson, Tok } from './lessons'
import { generated, parseSafe, termTex, topTen } from './simplify-data'

interface Mono {
  tex: string // the monomial
  coef: string // its coefficient (TeX)
  expo?: string // the exponent of its variable (TeX), if there is a variable
  v?: string // its variable
}

const REFERENCE = [
  { label: 'Term', cells: ['5x', '\\frac{x^2}{3}', '-1.3xy', '-y', '-3'] },
  { label: 'Coefficient', cells: ['5', '\\frac{1}{3}', '-1.3', '-1', '-3'] },
]
const GREEN = (t: string) => `\\textcolor{#16a34a}{${t}}`
const SENTENCE = 'coefficient is the number in front of the letter'

const neg = (c: string) => (c === '0' ? '' : c.startsWith('-') ? c.slice(1) : `-${c}`)

// the answer plus three tempting wrong ones (the exponent, the opposite sign, 1, 0, the letter), the answer in a slot that depends on idx
function choicesFor(m: Mono, idx: number): [string[], number] {
  const cand = [m.expo, neg(m.coef), '1', '0', m.v, '2', '-1']
  const wrong: string[] = []
  for (const c of cand) if (c && c !== m.coef && !wrong.includes(c) && wrong.length < 3) wrong.push(c)
  const at = idx % 4
  const all = [...wrong]
  all.splice(at, 0, m.coef)
  return [all, at]
}

function lessonFor(m: Mono, key: string, idx: number): Lesson {
  const [options, correct] = choicesFor(m, idx + 1)
  const start: Tok[] = [{ id: 't', tex: m.tex }]
  return {
    key: `coef-${key}`,
    label: key,
    source: `Grade 9, 5.1 exercise 4${key}`,
    title: 'What is the coefficient?',
    prompt: 'Find the coefficient:',
    answer: m.coef,
    reference: REFERENCE,
    start,
    steps: [
      {
        focus: ['t'],
        result: { id: 'r', tex: GREEN(`\\text{coefficient: } ${m.coef}`) },
        say: '',
        calcPrompt: 'What is the coefficient?',
        calc: { q: 'What is the coefficient?', options, correct, hints: options.map((o) => (o === m.coef ? '' : SENTENCE)), spell: SENTENCE },
      },
    ],
    review: { heading: 'Coefficient', rows: [] },
  }
}

const m = (tex: string, coef: string, expo?: string, v?: string): Mono => ({ tex, coef, expo, v })

const BANK: { part: string; it: Mono; practice: Mono[] }[] = [
  { part: 'a', it: m('2x', '2', '1', 'x'), practice: [m('5y', '5', '1', 'y'), m('-x', '-1', '1', 'x'), m('7m', '7', '1', 'm')] },
  { part: 'b', it: m('-8x^3', '-8', '3', 'x'), practice: [m('-6x^2', '-6', '2', 'x'), m('4x^5', '4', '5', 'x'), m('-x^3', '-1', '3', 'x')] },
  { part: 'c', it: m('1.9y^5', '1.9', '5', 'y'), practice: [m('2.5y^2', '2.5', '2', 'y'), m('-0.4x', '-0.4', '1', 'x'), m('3.1z^4', '3.1', '4', 'z')] },
  { part: 'd', it: m('\\frac{2}{3}x^{11}', '\\frac{2}{3}', '11', 'x'), practice: [m('\\frac{3}{4}x^2', '\\frac{3}{4}', '2', 'x'), m('\\frac{1}{5}y^7', '\\frac{1}{5}', '7', 'y'), m('\\frac{5}{2}x', '\\frac{5}{2}', '1', 'x')] },
  { part: 'e', it: m('-\\frac{7}{2}x^6', '-\\frac{7}{2}', '6', 'x'), practice: [m('-\\frac{3}{4}y^5', '-\\frac{3}{4}', '5', 'y'), m('-\\frac{1}{2}x', '-\\frac{1}{2}', '1', 'x'), m('-\\frac{5}{3}m^2', '-\\frac{5}{3}', '2', 'm')] },
  { part: 'f', it: m('3.7x^0', '3.7', '0', 'x'), practice: [m('2.4y^0', '2.4', '0', 'y'), m('-6x^0', '-6', '0', 'x'), m('\\frac{1}{2}z^0', '\\frac{1}{2}', '0', 'z')] },
  { part: 'g', it: m('-8', '-8'), practice: [m('-3', '-3'), m('12', '12'), m('-0.7', '-0.7')] },
  { part: 'h', it: m('0', '0'), practice: [m('0x^2', '0', '2', 'x'), m('0y^3', '0', '3', 'y'), m('0m', '0', '1', 'm')] },
]

// Gemini's monomials (gen-variants.py) as items; the coefficient is computed here, never taken from Gemini
const fromGemini = (expr: string): Mono[] => {
  const ms = parseSafe(expr)
  if (!ms || ms.length !== 1) return []
  const [x] = ms
  return [{ tex: termTex(x.c, x.raw, false), coef: termTex(x.c, '', false), expo: x.vs[0] ? String(x.vs[0][1]) : undefined, v: x.vs[0]?.[0] }]
}

const questions: Question[] = BANK.map(({ part, it, practice: own }, idx) => {
  const practice = topTen(generated(4, part).flatMap(fromGemini), own, (x) => x.tex, it)
  const [choices, correct] = choicesFor(it, idx)
  return {
    part,
    tex: it.tex,
    choices,
    correct,
    why: '',
    lesson: () => lessonFor(it, part, idx),
    practice: practice.map((p, k): Practice => {
      const [pc, pa] = choicesFor(p, idx + k + 1)
      return { tex: p.tex, choices: pc, correct: pa, why: '', lesson: () => lessonFor(p, `${part}${k + 1}`, idx + k + 1) }
    }),
  }
})

export const EX4: Exercise = { no: 4, prompt: 'What is the coefficient?', mathChoices: true, questions }
