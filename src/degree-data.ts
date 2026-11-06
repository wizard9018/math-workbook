// Grade 9, 5.1 exercise 3 a-j ("Determine the degree of the polynomial", bank/G9-ch5/s1/items.json) with its lessons and practice questions.
// Lesson: the textbook example on top (no sentences); one question per term (its degree), then one for the whole polynomial.
// Imported by: quiz.tsx. Shape: exercise.ts.
import type { Exercise, Practice, Question } from './exercise'
import type { Lesson, Step, Tok } from './lessons'
import { abs, degree, generated, parseSafe, termTex, topTen } from './simplify-data'

interface Term {
  tex: string
  deg: number // sum of the exponents of its variables (a number alone is 0)
}
interface DItem {
  part: string
  terms: Term[]
  ops: ('+' | '-')[] // signs between the terms
}

// the textbook example, no sentences: terms -> their degrees -> leading term -> degree of the polynomial
const REFERENCE = [
  { label: 'Term', cells: ['5x^2', '-3x', '4'] },
  { label: 'Degree', cells: ['2', '1', '0'] },
  { label: 'Degree of polynomial', cells: ['2', '', ''] }, // padded so the grid keeps its three columns
]
const GREEN = (t: string) => `\\textcolor{#16a34a}{${t}}`
const T = (id: string, tex: string): Tok => ({ id, tex })
const joinTex = (it: DItem) => it.terms.map((t, i) => (i === 0 ? t.tex : `${it.ops[i - 1] === '-' ? '-' : '+'} ${t.tex}`)).join(' ')
const max = (it: DItem) => Math.max(...it.terms.map((t) => t.deg))

// four number choices (the answer plus three others), the answer in a slot that depends on idx
const numbers = (answer: number, idx: number): [string[], number] => {
  const pool = [0, 1, 2, 3, 4].filter((n) => n !== answer)
  const wrong = [...pool.slice(idx % 2), ...pool.slice(0, idx % 2)].slice(0, 3).sort((a, b) => a - b)
  const at = idx % 4
  const all = wrong.map(String)
  all.splice(at, 0, String(answer))
  return [all, at]
}

// one question per term (what is its degree?), then one for the whole polynomial; a single term only gets the last one
function lessonFor(it: DItem, idx: number): Lesson {
  const start: Tok[] = []
  it.terms.forEach((t, i) => {
    if (i > 0) start.push(T(`o${i}`, it.ops[i - 1] === '-' ? '-' : '+'))
    start.push(T(`t${i}`, t.tex))
  })
  const ans = max(it)
  const multi = it.terms.length > 1

  // the wrong-answer pop-up: the sentence to read and then type
  const ask = (q: string, right: number, k: number, sentence: string) => {
    const [options, correct] = numbers(right, idx + k)
    return { q, options, correct, hints: options.map((o) => (Number(o) === right ? '' : sentence)), spell: sentence }
  }
  const TERM = 'degree is the power on top of x'

  const steps: Step[] = []
  if (multi) {
    it.terms.forEach((t, k) => {
      steps.push({
        focus: [`t${k}`],
        result: T(`d${k}`, `\\underbrace{${t.tex}}_{${GREEN(String(t.deg))}}`),
        say: '',
        calcPrompt: 'What is the degree of this term?',
        calc: ask('What is the degree of this term?', t.deg, k, TERM),
      })
    })
  }
  const lineIds = multi ? start.map((tk) => (tk.id.startsWith('t') ? `d${tk.id.slice(1)}` : tk.id)) : ['t0']
  steps.push({
    focus: lineIds,
    result: T('r', GREEN(`\\text{degree: } ${ans}`)),
    say: '',
    calcPrompt: 'What is the degree of the polynomial?',
    calc: ask('What is the degree of the polynomial?', ans, it.terms.length, multi ? 'degree of the polynomial is the biggest degree of its terms' : TERM),
  })

  return {
    key: `deg-${it.part}`,
    label: it.part,
    source: `Grade 9, 5.1 exercise 3${it.part}`,
    title: 'What is the degree of the polynomial?',
    prompt: 'Find the degree:',
    answer: String(ans),
    reference: REFERENCE,
    start,
    steps,
    review: { heading: 'Degree', rows: [] },
  }
}

const term = (tex: string, deg: number): Term => ({ tex, deg })
const item = (part: string, terms: Term[], ops: ('+' | '-')[] = []): DItem => ({ part, terms, ops })

const BANK: { it: DItem; practice: DItem[] }[] = [
  { it: item('a', [term('3x', 1), term('x^2', 2), term('2', 0)], ['-', '+']), practice: [item('p1', [term('5', 0), term('2x', 1), term('x^3', 3)], ['-', '+']), item('p2', [term('x^2', 2), term('4x', 1)], ['-']), item('p3', [term('7x', 1), term('1', 0)], ['+'])] },
  { it: item('b', [term('2^3', 0), term('x^2', 2)], ['+']), practice: [item('p1', [term('3^2', 0), term('x', 1)], ['+']), item('p2', [term('2^4', 0), term('x^3', 3)], ['+']), item('p3', [term('5^2', 0), term('y^2', 2)], ['+'])] },
  { it: item('c', [term('-5', 0)]), practice: [item('p1', [term('-8', 0)]), item('p2', [term('10', 0)]), item('p3', [term('\\frac{1}{2}', 0)])] },
  { it: item('d', [term('3^2', 0)]), practice: [item('p1', [term('2^4', 0)]), item('p2', [term('5^3', 0)]), item('p3', [term('4^2', 0)])] },
  { it: item('e', [term('2^3x', 1), term('xy', 2)], ['-']), practice: [item('p1', [term('2^2y', 1), term('xy', 2)], ['+']), item('p2', [term('5x^2y', 3), term('x', 1)], ['-']), item('p3', [term('xy^2', 3), term('2^3y', 1)], ['+'])] },
  { it: item('f', [term('-y', 1), term('3x^2', 2)], ['+']), practice: [item('p1', [term('-x', 1), term('4y^2', 2)], ['+']), item('p2', [term('-3a', 1), term('b', 1)], ['+']), item('p3', [term('-z', 1), term('2z^3', 3)], ['+'])] },
  { it: item('g', [term('7x^2', 2), term('2^5', 0)], ['+']), practice: [item('p1', [term('5y^2', 2), term('3^3', 0)], ['+']), item('p2', [term('2x^3', 3), term('4^2', 0)], ['+']), item('p3', [term('x', 1), term('2^4', 0)], ['+'])] },
  { it: item('h', [term('2', 0), term('x', 1), term('5x^2', 2)], ['-', '+']), practice: [item('p1', [term('3', 0), term('y', 1), term('4y^3', 3)], ['-', '+']), item('p2', [term('1', 0), term('2m', 1), term('m^2', 2)], ['-', '+']), item('p3', [term('4', 0), term('n', 1)], ['+'])] },
  { it: item('i', [term('x^0', 0)]), practice: [item('p1', [term('y^0', 0)]), item('p2', [term('z^0', 0)]), item('p3', [term('m^0', 0), term('2^3', 0)], ['+'])] },
  { it: item('j', [term('\\sqrt{2}x^2', 2), term('3x', 1)], ['+']), practice: [item('p1', [term('\\sqrt{3}x', 1), term('2', 0)], ['+']), item('p2', [term('\\sqrt{5}y^2', 2), term('y', 1)], ['+']), item('p3', [term('\\frac{1}{2}x^3', 3), term('x^2', 2)], ['+'])] },
]

const why = (_: DItem) => '' // no sentences: the lesson shows the example and asks

// Gemini's polynomials (gen-variants.py) as items; the answer is computed here, never taken from Gemini
const fromGemini = (part: string, expr: string): DItem[] => {
  const ms = parseSafe(expr)
  if (!ms || ms.length > 4 || ms.some((m) => degree(m.vs) > 4)) return []
  return [{ part, terms: ms.map((m, i) => ({ tex: termTex(i === 0 ? m.c : abs(m.c), m.raw, false), deg: degree(m.vs) })), ops: ms.slice(1).map((m) => (m.c[0] < 0 ? '-' : '+')) }]
}

const questions: Question[] = BANK.map(({ it, practice: own }, idx) => {
  const [choices, correct] = numbers(max(it), idx)
  const practice = topTen(generated(3, it.part).flatMap((e, k) => fromGemini(`${it.part}g${k}`, e)), own, joinTex, it)
  return {
    part: it.part,
    tex: joinTex(it),
    choices,
    correct,
    why: why(it),
    lesson: () => lessonFor(it, idx),
    practice: practice.map((p, k): Practice => {
      const [pc, pa] = numbers(max(p), idx + k + 1)
      return { tex: joinTex(p), choices: pc, correct: pa, why: why(p), lesson: () => lessonFor(p, idx + k + 1) }
    }),
  }
})

export const EX3: Exercise = { no: 3, prompt: 'What is the degree of the polynomial?', questions }

// the chapter review (5.5 exercise 1): the same lesson for other textbook polynomials, the practice drawn from the 5.1 banks
const POOL = BANK.flatMap((b) => [b.it, ...b.practice])
export const degreeReview = (items: DItem[]): Exercise => ({
  no: 1,
  sec: '5.5',
  prompt: 'Determine the degree of the polynomials.',
  questions: items.map((it, idx): Question => {
    const [choices, correct] = numbers(max(it), idx)
    const practice = topTen(POOL.map((p, k) => ({ ...p, part: `${it.part}${k + 1}` })), [], joinTex, it)
    return {
      part: it.part,
      tex: joinTex(it),
      choices,
      correct,
      why: '',
      lesson: () => lessonFor(it, idx),
      practice: practice.map((p, k): Practice => {
        const [pc, pa] = numbers(max(p), idx + k + 1)
        return { tex: joinTex(p), choices: pc, correct: pa, why: '', lesson: () => lessonFor(p, idx + k + 1) }
      }),
    }
  }),
})
export { item as degreeItem, term as degreeTerm }
