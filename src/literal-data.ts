// Grade 9 6.1 exercise 8 (bank/G9-ch6/s1/items.json): solve a formula for b, e.g. a = bc, a = c - b, a = (b + c) / 2.
// Lesson: like solving an equation (eq-data.ts): a term moves to the other side (an arrow to a blank: what goes there?), the answer is a multiple-choice question for the blank.
// The 10 similar questions of a question are the same formula with other letters (and another divisor in h); the steps are written here by hand for each of the 8 forms.
// Imported by: quiz.tsx. Shape: exercise.ts.
import type { Exercise, Practice, Question } from './exercise'
import type { Lesson, Step, Tok } from './lessons'
import { pick } from './simplify-data'

// the letters of a form: A (the left side), U (the unknown), C, D (the other letters), k (a number)
interface Ls {
  A: string
  U: string
  C: string
  D: string
  k: number
}
interface Form {
  eq: (l: Ls) => string // the question
  start: (l: Ls) => Tok[]
  steps: (l: Ls, idx: number) => Step[]
  answer: (l: Ls) => string // U = ...
  wrongAnswers: (l: Ls) => string[]
}
const fr = (a: string, b: string) => `\\frac{${a}}{${b}}`
const T = (id: string, tex: string): Tok => ({ id, tex })
const EQ = T('q', '=')

// one term moves: the arrow goes to a blank, the question is what goes there
function mv(idx: number, o: { focus: string[]; replace?: Tok; after: string | Record<string, string>; id: string; tex: string; wrongs: string[]; prompt: string; hint: string; arrows?: Step['arrows'] }): Step {
  const [options, correct] = pick(o.tex, o.wrongs, idx)
  return { focus: o.focus, ...(o.replace ? { replace: o.replace } : {}), after: o.after, result: T(o.id, o.tex), ...(o.arrows ? { arrows: o.arrows } : {}), say: '', calcPrompt: o.prompt, calc: { q: o.prompt, options, correct, hints: options.map((_, j) => (j === correct ? '' : o.hint)), spell: o.hint } }
}

const FORMS: Form[] = [
  // a: A = U C
  {
    eq: ({ A, U, C }) => `${A} = ${U}${C}`,
    start: ({ A, U, C }) => [T('l0', A), EQ, T('r0', U), T('r1', C)],
    steps: ({ U, C }, idx) => [mv(idx, { focus: ['r1'], after: 'l0', id: 'm0', tex: `\\div ${C}`, wrongs: [`\\cdot ${C}`, `+ ${C}`, `- ${C}`], prompt: `$${C} \\to \\square$`, hint: `$${fr(`${U}${C}`, C)} = ${U}$` })],
    answer: ({ A, U, C }) => `${U} = ${fr(A, C)}`,
    wrongAnswers: ({ A, U, C }) => [`${U} = ${A}${C}`, `${U} = ${A} - ${C}`, `${U} = ${fr(C, A)}`],
  },
  // b: A = U + C
  {
    eq: ({ A, U, C }) => `${A} = ${U} + ${C}`,
    start: ({ A, U, C }) => [T('l0', A), EQ, T('r0', U), T('r1', `+ ${C}`)],
    steps: ({ C }, idx) => [mv(idx, { focus: ['r1'], after: 'l0', id: 'm0', tex: `- ${C}`, wrongs: [`+ ${C}`, `\\div ${C}`, `\\cdot ${C}`], prompt: `$+ ${C} \\to \\square$`, hint: `$+${C} - ${C} = 0$` })],
    answer: ({ A, U, C }) => `${U} = ${A} - ${C}`,
    wrongAnswers: ({ A, U, C }) => [`${U} = ${A} + ${C}`, `${U} = ${C} - ${A}`, `${U} = ${A}${C}`],
  },
  // c: A = U - C
  {
    eq: ({ A, U, C }) => `${A} = ${U} - ${C}`,
    start: ({ A, U, C }) => [T('l0', A), EQ, T('r0', U), T('r1', `- ${C}`)],
    steps: ({ C }, idx) => [mv(idx, { focus: ['r1'], after: 'l0', id: 'm0', tex: `+ ${C}`, wrongs: [`- ${C}`, `\\div ${C}`, `\\cdot ${C}`], prompt: `$- ${C} \\to \\square$`, hint: `$-${C} + ${C} = 0$` })],
    answer: ({ A, U, C }) => `${U} = ${A} + ${C}`,
    wrongAnswers: ({ A, U, C }) => [`${U} = ${A} - ${C}`, `${U} = ${C} - ${A}`, `${U} = ${A}${C}`],
  },
  // d: A = C - U: -U moves to the left and A to the right (a 0 stays on the left), then 0 + U is U
  {
    eq: ({ A, U, C }) => `${A} = ${C} - ${U}`,
    start: ({ A, U, C }) => [T('l0', A), EQ, T('r0', C), T('r1', `- ${U}`)],
    steps: ({ A, U, C }, idx) => {
      const [o1, c1] = pick(`+ ${U}`, [`- ${U}`, `+ ${A}`, `- ${A}`], idx)
      const [o2, c2] = pick(`- ${A}`, [`+ ${A}`, `- ${C}`, `+ ${U}`], idx + 1)
      const [o3, c3] = pick(U, [`- ${U}`, '0', `2${U}`], idx + 2)
      return [
        {
          focus: ['l0', 'r1'],
          replace: T('z0', '0'),
          after: { m0: 'z0', m1: 'r0' },
          results: [T('m0', `+ ${U}`), T('m1', `- ${A}`)],
          result: T('m0', `+ ${U}`),
          arrows: [{ from: ['r1'], to: ['m0'] }, { from: ['l0'], to: ['m1'] }],
          say: '',
          calcPrompt: `$- ${U} \\to \\square_1$`,
          calc: { q: `$- ${U} \\to \\square_1$`, options: o1, correct: c1, hints: o1.map((_, j) => (j === c1 ? '' : `$-${U} + ${U} = 0$`)), spell: 'move' },
          second: { q: `$${A} \\to \\square_2$`, options: o2, correct: c2, hints: o2.map((_, j) => (j === c2 ? '' : `$${A} - ${A} = 0$`)), spell: 'move' },
        },
        { from: 'each', focus: ['z0', 'm0'], result: T('u1', U), say: '', calcPrompt: `What is $0 + ${U}$?`, calc: { q: `What is $0 + ${U}$?`, options: o3, correct: c3, hints: o3.map(() => ''), spell: 'sum' } },
      ]
    },
    answer: ({ A, U, C }) => `${U} = ${C} - ${A}`,
    wrongAnswers: ({ A, U, C }) => [`${U} = ${A} - ${C}`, `${U} = ${A} + ${C}`, `${U} = ${C} + ${A}`],
  },
  // e: A = U / C
  {
    eq: ({ A, U, C }) => `${A} = ${fr(U, C)}`,
    start: ({ A, U, C }) => [T('l0', A), EQ, T('r0', fr(U, C))],
    steps: ({ U, C }, idx) => [mv(idx, { focus: ['r0'], replace: T('u0', U), after: 'l0', id: 'm0', tex: `\\cdot ${C}`, wrongs: [`\\div ${C}`, `+ ${C}`, `- ${C}`], prompt: `$${C} \\to \\square$`, hint: `$${fr(U, C)} \\cdot ${C} = ${U}$` })],
    answer: ({ A, U, C }) => `${U} = ${A}${C}`,
    wrongAnswers: ({ A, U, C }) => [`${U} = ${fr(A, C)}`, `${U} = ${A} + ${C}`, `${U} = ${fr(C, A)}`],
  },
  // f: A = C / U
  {
    eq: ({ A, U, C }) => `${A} = ${fr(C, U)}`,
    start: ({ A, U, C }) => [T('l0', A), EQ, T('r0', fr(C, U))],
    steps: ({ A, U, C }, idx) => [
      mv(idx, { focus: ['r0'], replace: T('x0', C), after: 'l0', id: 'm0', tex: `\\cdot ${U}`, wrongs: [`\\div ${U}`, `+ ${U}`, `- ${U}`], prompt: `$${U} \\to \\square$`, hint: `$${fr(C, U)} \\cdot ${U} = ${C}$` }),
      mv(idx + 1, { focus: ['l0', 'm0'], replace: T('u1', U), after: 'x0', id: 'm1', tex: `\\div ${A}`, wrongs: [`\\cdot ${A}`, `- ${A}`, `+ ${A}`], prompt: `$${A} \\to \\square$`, hint: `$${fr(`${A}${U}`, A)} = ${U}$`, arrows: [{ from: ['l0'], to: ['m1'] }] }),
    ],
    answer: ({ A, U, C }) => `${U} = ${fr(C, A)}`,
    wrongAnswers: ({ A, U, C }) => [`${U} = ${fr(A, C)}`, `${U} = ${C}${A}`, `${U} = ${C} - ${A}`],
  },
  // g: A = D C + U
  {
    eq: ({ A, U, C, D }) => `${A} = ${D}${C} + ${U}`,
    start: ({ A, U, C, D }) => [T('l0', A), EQ, T('r0', `${D}${C}`), T('r1', `+ ${U}`)],
    steps: ({ U, C, D }, idx) => [mv(idx, { focus: ['r1', 'r0'], replace: T('u0', U), after: 'l0', id: 'm0', tex: `- ${D}${C}`, wrongs: [`+ ${D}${C}`, `\\div ${D}${C}`, `- ${C}`], prompt: `$${D}${C} \\to \\square$`, hint: `$+${D}${C} - ${D}${C} = 0$`, arrows: [{ from: ['r0'], to: ['m0'] }] })],
    answer: ({ A, U, C, D }) => `${U} = ${A} - ${D}${C}`,
    wrongAnswers: ({ A, U, C, D }) => [`${U} = ${A} + ${D}${C}`, `${U} = ${fr(A, `${D}${C}`)}`, `${U} = ${D}${C} - ${A}`],
  },
  // h: A = (U + C) / k
  {
    eq: ({ A, U, C, k }) => `${A} = ${fr(`${U} + ${C}`, String(k))}`,
    start: ({ A, U, C, k }) => [T('l0', A), EQ, T('r0', fr(`${U} + ${C}`, String(k)))],
    steps: ({ U, C, k }, idx) => [
      mv(idx, { focus: ['r0'], replace: T('x0', `${U} + ${C}`), after: 'l0', id: 'm0', tex: `\\cdot ${k}`, wrongs: [`\\div ${k}`, `+ ${k}`, `- ${k}`], prompt: `$${k} \\to \\square$`, hint: `$${fr(`${U} + ${C}`, String(k))} \\cdot ${k} = ${U} + ${C}$` }),
      mv(idx + 1, { focus: ['x0'], replace: T('u1', U), after: 'm0', id: 'm1', tex: `- ${C}`, wrongs: [`+ ${C}`, `\\cdot ${C}`, `\\div ${C}`], prompt: `$+ ${C} \\to \\square$`, hint: `$+${C} - ${C} = 0$` }),
    ],
    answer: ({ A, U, C, k }) => `${U} = ${k}${A} - ${C}`,
    wrongAnswers: ({ A, U, C, k }) => [`${U} = ${k}${A} + ${C}`, `${U} = ${fr(A, String(k))} - ${C}`, `${U} = ${A} - ${C}`],
  },
]

function lessonLiteral(form: Form, l: Ls, key: string, idx: number): Lesson {
  return { key: `lit8-${key}`, label: key, source: `Grade 9, 6.1 exercise 8${key}`, title: 'Solve for a letter', prompt: `Solve for ${l.U}:`, answer: form.answer(l), start: form.start(l), steps: form.steps(l, idx), review: { heading: 'Formulas', rows: [] } }
}

// the textbook letters, and other letters for the practice questions (the unknown stays b)
const BOOKL: Ls = { A: 'a', U: 'b', C: 'c', D: 'd', k: 2 }
const OTHERS = ['p', 'q', 'r', 's', 'm', 'n', 't', 'v', 'w', 'h', 'k', 'x', 'y', 'z', 'a', 'c', 'd']
function banks(formIdx: number, seed: number): Ls[] {
  let s = seed
  const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32)
  const out: Ls[] = []
  const seen = new Set([FORMS[formIdx].eq(BOOKL)])
  for (let t = 0; out.length < 10 && t < 300; t++) {
    const pool = [...OTHERS].sort(() => r() - 0.5)
    const l: Ls = { A: pool[0], U: 'b', C: pool[1], D: pool[2], k: formIdx === 7 ? [2, 3, 4, 5][Math.floor(r() * 4)] : 2 }
    const key = FORMS[formIdx].eq(l)
    if (!seen.has(key)) {
      seen.add(key)
      out.push(l)
    }
  }
  return out
}

function build(): Exercise {
  const questions: Question[] = FORMS.map((f, form): Question => {
    const part = 'abcdefgh'[form]
    const make = (l: Ls, key: string, k: number): Practice => {
      const [choices, correct] = pick(f.answer(l), f.wrongAnswers(l), form + k)
      return { tex: f.eq(l), choices, correct, why: '', lesson: () => lessonLiteral(f, l, key, form + k) }
    }
    return { part, ...make(BOOKL, part, 0), practice: banks(form, 800 + form).map((l, k) => make(l, `${part}${k + 1}`, k + 1)) }
  })
  return { no: 8, sec: '6.1', prompt: 'Solve for b.', mathChoices: true, questions }
}

export const EX_LIT61 = [build()]
