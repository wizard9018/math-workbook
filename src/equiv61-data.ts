// Grade 9 6.1 exercise 7 (bank/G9-ch6/s1/items.json): which of four equations is equivalent to the given one (a-d).
// Lesson: solve the given equation (the steps of 6.1 exercises 2-5, eq-data.ts), then pick the equation that has the same solution.
// The 10 similar questions of every part are made here from numbers (not by Gemini): the equation is a x + b = c x + d with a whole-number solution,
// the right option is one legal step on it (subtract / add the same on both sides, or x = the solution), the wrong ones are the usual slips; every solution is computed.
// Imported by: quiz.tsx. Shape: exercise.ts.
import type { Exercise, Practice, Question } from './exercise'
import type { Lesson, Step } from './lessons'
import { lessonEq, lineIds, numTex, parseEq, solution, texEq } from './eq-data'
import type { Eq } from './eq-data'
import { pick } from './simplify-data'
import { cross, range, shuffled } from './word61-data'

// a x + b as plain text: 1x -> x, -1x -> -x, a zero term left out
const lin = (a: number, b: number) => {
  const t = a === 0 ? '' : a === 1 ? 'x' : a === -1 ? '-x' : `${a}x`
  return t === '' ? `${b}` : b === 0 ? t : `${t}${b > 0 ? '+' : ''}${b}`
}
const sg = (n: number) => (n === 0 ? '' : n > 0 ? `+${n}` : `${n}`)

export interface Equiv {
  key: string
  eq: string // the given equation
  options: string[] // four equations (plain text)
  right: number // index of the equivalent one
}

// ---- the four parts of the textbook ----
const BOOK: { eq: string; options: string[] }[] = [
  { eq: '7x+5=8x-4', options: ['15x=-9', 'x=-9', '7x+9=8x', '9=15x'] },
  { eq: '6x-7=5x-12', options: ['11x=19', '11x-7=-12', 'x=-19', 'x-7=-12'] },
  { eq: '12x-7=8x+13', options: ['4x-7=13', 'x=20', '20x=20', '4x=6'] },
  { eq: '7x+6=12x-9', options: ['5x=-15', '7x-3=12x', '-3=5x', '7x+15=12x'] },
]

// one question from a x + b = c x + d (whole-number solution s): the right option is one of the legal steps, the wrong ones are slips
function make(a: number, b: number, c: number, d: number, pickRight: number, key: string): Equiv | null {
  const s = (d - b) / (a - c)
  const legal = [
    `${lin(a, 0)}=${lin(c, d - b)}`, // subtract b
    `${lin(a - c, b)}=${d}`, // subtract c x
    `${lin(a - c, 0)}=${d - b}`, // both
    `${lin(a, b - d)}=${lin(c, 0)}`, // subtract d
    `${b - d}=${lin(c - a, 0)}`, // both, the variable on the right
    `x=${s}`,
  ]
  const slips = [
    `${lin(a + c, 0)}=${d - b}`, // c x added instead of subtracted
    `${lin(a - c, 0)}=${d + b}`, // sign of b
    `${lin(a, b + d)}=${lin(c, 0)}`, // sign of d
    `x=${-s}`,
    `x=${d - b}`, // the coefficient forgotten
    `${lin(a - c, b)}=${-d}`,
    `${lin(a + c, b)}=${d}`,
  ]
  const eq = `${lin(a, b)}=${lin(c, d)}`
  const ok = (t: string) => { const e = parseEq(t); return !!e }
  const right = legal[pickRight % legal.length]
  const wrongs = slips.filter((t) => {
    if (!ok(t) || t === right) return false
    const q = solution(parseEq(t)!)
    return q[0] !== s * q[1] // a slip that happens to have the same solution is not wrong
  })
  if (!ok(right) || wrongs.length < 3 || !ok(eq)) return null
  const [options, at] = pick(right, shuffled(wrongs, a * 31 + b * 7 + c * 3 + d), pickRight)
  return { key, eq, options, right: at }
}

const CAND: number[][][] = [0, 1, 2, 3].map((p) => cross(range(2, 9), range(1, 9), range(2, 9), [-8, -6, -5, -4, 4, 5, 6, 8]).filter(([a, , c]) => a !== c).map(([a, , c, e], i) => [a, c, e, p + i]))

// the lesson: solve the given equation, then the question "which equation has this solution?"
function lessonEquiv(w: Equiv, key: string, idx: number): Lesson {
  const e = parseEq(w.eq)!
  const solve = lessonEq(e, key, 7, idx + 2)
  const x = solution(e)
  const sol = `${e.v} = ${numTex(x)}`
  const tex = w.options.map((t) => texEq(parseEq(t)!))
  const hints = w.options.map((t, j) => (j === w.right ? '' : `$${tex[j]}$ has the solution $${e.v} = ${numTex(solution(parseEq(t) as Eq))}$, not $${sol}$.`))
  const q1 = `Which equation also has the solution $${sol}$?`
  const lastIds = lineIds(solve.start, solve.steps)
  const steps: Step[] = [
    ...solve.steps,
    { focus: lastIds, result: { id: 'fin', tex: tex[w.right] }, arrows: [], say: '', calcPrompt: q1, calc: { q: q1, options: tex, correct: w.right, hints, spell: `${sol}` } },
  ]
  return { key: `equiv7-${key}`, label: key, source: `Grade 9, 6.1 exercise 7${key}`, title: 'Equivalent equations', prompt: 'Solve:', answer: tex[w.right], start: solve.start, steps, review: { heading: 'Equivalent equations', rows: [] } }
}

function build(): Exercise {
  const questions: Question[] = BOOK.map((b, i): Question => {
    const part = 'abcd'[i]
    const e = parseEq(b.eq)!
    const x = solution(e)
    const right = b.options.findIndex((t) => { const q = solution(parseEq(t)!); return q[0] === x[0] && q[1] === x[1] })
    const book: Equiv = { key: b.eq, eq: b.eq, options: b.options, right }
    const mk = (w: Equiv, key: string, k: number): Practice => ({ tex: texEq(parseEq(w.eq)!), choices: w.options.map((t) => texEq(parseEq(t)!)), correct: w.right, why: '', lesson: () => lessonEquiv(w, key, i + k) })
    const seen = new Set([book.eq])
    const bank = shuffled(CAND[i], 6170 + i)
      .map(([a, c, s, p], n) => {
        const bb = [-9, -7, -6, -5, -4, -3, -2, 2, 3, 4, 5, 6, 7, 9][(a * 5 + c * 3 + n) % 14]
        return make(a, bb, c, bb + (a - c) * s, p, `${a},${bb},${c},${s}`)
      })
      .filter((w): w is Equiv => !!w && !seen.has(w.eq) && !!seen.add(w.eq))
      .slice(0, 10)
    return { part, ...mk(book, part, 0), practice: bank.map((w, k) => mk(w, `${part}${k + 1}`, k + 1)) }
  })
  return { no: 7, sec: '6.1', prompt: 'Determine the equation that is equivalent to the given equation.', mathChoices: true, questions }
}

export const EX_EQUIV61 = [build()]
