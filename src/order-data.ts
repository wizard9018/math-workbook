// Grade 9, 5.1 exercise 5 a-f ("Arrange in descending order of powers", bank/G9-ch5/s1/items.json) with its lesson and practice questions.
// Wrong answer -> the textbook examples, then the degree of each term, then the arrangement (higher degree first; the same degree goes alphabetically: x^2, xy, y^2).
// Imported by: quiz.tsx. Shape: exercise.ts.
import type { Exercise, Practice, Question } from './exercise'
import type { Lesson, Step, Tok } from './lessons'
import { abs, byOrder, generated, parseSafe, termTex, topTen } from './simplify-data'
import type { Mono } from './simplify-data'

interface Term {
  s: '+' | '-'
  tex: string
}
interface Order {
  given: Term[] // the expression as printed
  right: Term[] // in descending order of powers
}

const REFERENCE = [
  { label: 'As written', cells: ['2x + 4 - 3x^2', 'xy + y^2 - x^2'] },
  { label: 'Descending order', cells: ['-3x^2 + 2x + 4', '-x^2 + xy + y^2'] },
]
const GREEN = (t: string) => `\\textcolor{#16a34a}{${t}}`
const SENTENCE = 'highest power comes first'

const fmt = (ts: Term[]) => ts.map((t, i) => (i === 0 ? (t.s === '-' ? '-' : '') : t.s === '-' ? ' - ' : ' + ') + t.tex).join('')
const same = (a: Term[], b: Term[]) => fmt(a) === fmt(b)

// the right arrangement plus three wrong ones (as printed, then other orders), the right one in a slot that depends on idx
function choicesFor(o: Order, idx: number): [string[], number] {
  const [a, b, c] = o.right
  const perms = [o.given, [b, a, c], [a, c, b], [c, b, a], [b, c, a], [c, a, b]]
  const wrong: string[] = []
  for (const p of perms) if (!same(p, o.right) && !wrong.includes(fmt(p)) && wrong.length < 3) wrong.push(fmt(p))
  const at = idx % 4
  const all = [...wrong]
  all.splice(at, 0, fmt(o.right))
  return [all, at]
}

// degree of a term = sum of the exponents of its letters; a number alone (also 2^2, 5^0) is 0
const degreeOf = (tex: string) => {
  const rest = tex.replace(/\d+\^\{?\d+\}?/g, '').replace(/^\d+/, '')
  let d = 0
  for (const m of rest.matchAll(/[a-z](?:\^\{?(\d+)\}?)?/g)) d += m[1] ? Number(m[1]) : 1
  return d
}
const DEGREE_SENTENCE = 'degree is the power on top of x'

// four degrees to choose from: the right one plus three others
const degreeChoices = (right: number, idx: number): [string[], number] => {
  const pool = [0, 1, 2, 3].filter((n) => n !== right)
  const wrong = [...pool.slice(idx % 3), ...pool.slice(0, idx % 3)].slice(0, 3).sort((a, b) => a - b)
  const at = idx % 4
  const all = wrong.map(String)
  all.splice(at, 0, String(right))
  return [all, at]
}

// one question per term (its degree), then the arrangement: the higher the degree, the earlier the term
function lessonFor(o: Order, key: string, idx: number): Lesson {
  const start: Tok[] = []
  o.given.forEach((t, i) => {
    if (i > 0) start.push({ id: `o${i}`, tex: t.s })
    start.push({ id: `t${i}`, tex: i === 0 && t.s === '-' ? `-${t.tex}` : t.tex })
  })
  const steps: Step[] = o.given.map((t, k) => {
    const deg = degreeOf(t.tex)
    const [options, correct] = degreeChoices(deg, idx + k)
    return {
      focus: [`t${k}`],
      result: { id: `d${k}`, tex: `\\underbrace{${k === 0 && t.s === '-' ? '-' : ''}${t.tex}}_{${GREEN(String(deg))}}` },
      say: '',
      calcPrompt: 'What is the degree of this term?',
      calc: { q: 'What is the degree of this term?', options, correct, hints: options.map((_, i) => (i === correct ? '' : DEGREE_SENTENCE)), spell: DEGREE_SENTENCE },
    }
  })
  const [options, correct] = choicesFor(o, idx + 1)
  const degs = o.given.map((t) => degreeOf(t.tex))
  const tie = new Set(degs).size < degs.length // two terms of the same degree: the letters decide
  const lastQ = tie ? 'Higher degree first. Same degree? x comes before y.' : 'Higher degree first. Which one is in order?'
  const lineIds = start.map((tk) => (tk.id.startsWith('t') ? `d${tk.id.slice(1)}` : tk.id))
  steps.push({
    focus: lineIds,
    result: { id: 'r', tex: GREEN(fmt(o.right)) },
    say: '',
    calcPrompt: lastQ,
    calc: { q: lastQ, options, correct, hints: options.map((_, i) => (i === correct ? '' : SENTENCE)), spell: SENTENCE, example: tie ? 'x^2,\\ xy,\\ y^2' : '2 + 3x + x^2 = x^2 + 3x + 2' },
  })
  return {
    key: `order-${key}`,
    label: key,
    source: `Grade 9, 5.1 exercise 5${key}`,
    title: 'Arrange in descending order of powers',
    prompt: 'Arrange:',
    answer: fmt(o.right),
    reference: REFERENCE,
    start,
    steps,
    review: { heading: 'Order', rows: [] },
  }
}

const p = (s: '+' | '-', tex: string): Term => ({ s, tex })
const order = (given: Term[], right: Term[]): Order => ({ given, right })

const BANK: { part: string; it: Order; practice: Order[] }[] = [
  {
    part: 'a',
    it: order([p('+', 'xy'), p('-', 'x^2'), p('+', 'y^2')], [p('-', 'x^2'), p('+', 'xy'), p('+', 'y^2')]),
    practice: [
      order([p('+', 'ab'), p('-', 'a^2'), p('+', 'b^2')], [p('-', 'a^2'), p('+', 'ab'), p('+', 'b^2')]),
      order([p('+', 'yz'), p('-', 'y^2'), p('+', 'z^2')], [p('-', 'y^2'), p('+', 'yz'), p('+', 'z^2')]),
      order([p('+', 'mn'), p('+', 'n^2'), p('-', 'm^2')], [p('-', 'm^2'), p('+', 'mn'), p('+', 'n^2')]),
    ],
  },
  {
    part: 'b',
    it: order([p('+', '2x'), p('-', 'xy'), p('+', 'x^2')], [p('+', 'x^2'), p('-', 'xy'), p('+', '2x')]),
    practice: [
      order([p('+', '3y'), p('-', 'yz'), p('+', 'y^2')], [p('+', 'y^2'), p('-', 'yz'), p('+', '3y')]),
      order([p('+', '4m'), p('-', 'mn'), p('+', 'm^2')], [p('+', 'm^2'), p('-', 'mn'), p('+', '4m')]),
      order([p('+', '5a'), p('-', 'ab'), p('+', 'a^2')], [p('+', 'a^2'), p('-', 'ab'), p('+', '5a')]),
    ],
  },
  {
    part: 'c',
    it: order([p('+', '2^2'), p('+', 'x'), p('+', 'x^2')], [p('+', 'x^2'), p('+', 'x'), p('+', '2^2')]),
    practice: [
      order([p('+', '3^2'), p('+', 'y'), p('+', 'y^2')], [p('+', 'y^2'), p('+', 'y'), p('+', '3^2')]),
      order([p('+', '2^3'), p('+', 'm'), p('+', 'm^2')], [p('+', 'm^2'), p('+', 'm'), p('+', '2^3')]),
      order([p('+', '4^2'), p('+', 't'), p('+', 't^2')], [p('+', 't^2'), p('+', 't'), p('+', '4^2')]),
    ],
  },
  {
    part: 'd',
    it: order([p('+', '5^0'), p('-', 'x^2'), p('+', 'x')], [p('-', 'x^2'), p('+', 'x'), p('+', '5^0')]),
    practice: [
      order([p('+', '7^0'), p('-', 'y^2'), p('+', 'y')], [p('-', 'y^2'), p('+', 'y'), p('+', '7^0')]),
      order([p('+', '2^0'), p('-', 'm^2'), p('+', 'm')], [p('-', 'm^2'), p('+', 'm'), p('+', '2^0')]),
      order([p('+', '9^0'), p('-', 't^2'), p('+', 't')], [p('-', 't^2'), p('+', 't'), p('+', '9^0')]),
    ],
  },
  {
    part: 'e',
    it: order([p('+', 'y^2'), p('-', '2xy'), p('+', 'x^2')], [p('+', 'x^2'), p('-', '2xy'), p('+', 'y^2')]),
    practice: [
      order([p('+', 'b^2'), p('-', '3ab'), p('+', 'a^2')], [p('+', 'a^2'), p('-', '3ab'), p('+', 'b^2')]),
      order([p('+', 'n^2'), p('-', '4mn'), p('+', 'm^2')], [p('+', 'm^2'), p('-', '4mn'), p('+', 'n^2')]),
      order([p('+', 'y^2'), p('-', '5xy'), p('+', 'x^2')], [p('+', 'x^2'), p('-', '5xy'), p('+', 'y^2')]),
    ],
  },
  {
    part: 'f',
    it: order([p('+', 'xy'), p('-', '8x^2'), p('-', 'y')], [p('-', '8x^2'), p('+', 'xy'), p('-', 'y')]),
    practice: [
      order([p('+', 'ab'), p('-', '6a^2'), p('-', 'b')], [p('-', '6a^2'), p('+', 'ab'), p('-', 'b')]),
      order([p('+', 'mn'), p('-', '2m^2'), p('-', 'n')], [p('-', '2m^2'), p('+', 'mn'), p('-', 'n')]),
      order([p('+', 'yz'), p('-', '3y^2'), p('-', 'z')], [p('-', '3y^2'), p('+', 'yz'), p('-', 'z')]),
    ],
  },
]

// Gemini's three-term polynomials (gen-variants.py) as items; the right order is computed here, never taken from Gemini
const fromGemini = (expr: string): Order[] => {
  const ms = parseSafe(expr)
  if (!ms || ms.length !== 3 || new Set(ms.map((m) => m.key)).size !== 3) return []
  const term = (m: Mono): Term => ({ s: m.c[0] < 0 ? '-' : '+', tex: termTex(abs(m.c), m.raw, false) })
  const right = [...ms].sort((a, b) => byOrder(a.vs, b.vs))
  return right.every((m, i) => m === ms[i]) ? [] : [{ given: ms.map(term), right: right.map(term) }]
}

const questions: Question[] = BANK.map(({ part, it, practice: own }, idx) => {
  const practice = topTen(generated(5, part).flatMap(fromGemini), own, (o) => fmt(o.given), it)
  const [choices, correct] = choicesFor(it, idx)
  return {
    part,
    tex: fmt(it.given),
    choices,
    correct,
    why: '',
    lesson: () => lessonFor(it, part, idx),
    practice: practice.map((q, k): Practice => {
      const [pc, pa] = choicesFor(q, idx + k + 1)
      return { tex: fmt(q.given), choices: pc, correct: pa, why: '', lesson: () => lessonFor(q, `${part}${k + 1}`, idx + k + 1) }
    }),
  }
})

export const EX5: Exercise = { no: 5, prompt: 'Arrange in descending order of powers', mathChoices: true, questions }
