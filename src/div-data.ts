// Grade 9 5.4 exercises 1, 2 and 3 (bank/G9-ch5/s4/items.json): a polynomial divided by a monomial.
// Lesson: (a + b + c) / d = a/d + b/d + c/d first; then every term is divided (a wrong answer turns that question into two: the numbers, then the letters).
// The 10 similar questions of every question are written by Gemini (gen-variants-54.py, variants54.json); the answers are computed here.
// Imported by: quiz.tsx, wordprob-data.ts. Shape: exercise.ts.
import type { Exercise, Practice, Question } from './exercise'
import type { Lesson, Step, Tok } from './lessons'
import V54 from './variants54.json'
import BOOK54 from './book54.json'
import type { Pre } from './mult-data'
import { abs, finalChoices, mk, neg, parseSafe, pick, polyTex, q, simpTex, termTex, topTen, varTex } from './simplify-data'
import type { Mono, Q } from './simplify-data'

export type P = Mono[]
type Vars = Mono['vs']
export const qdiv = (a: Q, b: Q): Q => {
  const n = a[0] * b[1]
  const d = a[1] * b[0]
  return d < 0 ? q(-n, -d) : q(n, d)
}
const qmul = (a: Q, b: Q): Q => q(a[0] * b[0], a[1] * b[1])
// the quotient of two monomials, or null when the letters of the divisor are not all in the dividend
export function mdiv(n: Mono, d: Mono): Mono | null {
  const e = new Map<string, number>(n.vs)
  for (const [l, x] of d.vs) {
    const have = e.get(l) ?? 0
    if (have < x) return null
    e.set(l, have - x)
  }
  const raw = [...e].filter(([, x]) => x > 0).sort((a, b) => a[0].localeCompare(b[0])).map(([l, x]) => (x === 1 ? l : `${l}^${x}`)).join('')
  return mk(qdiv(n.c, d.c), raw)
}
export const line = (v: P) => polyTex(v.map((m) => ({ c: m.c, v: m.raw })))
export const numTex = (c: Q) => termTex(c, '', false)
const parNum = (c: Q) => (c[0] < 0 ? `(${numTex(c)})` : numTex(c))
export const frac = (top: string, bottom: string) => `\\frac{${top}}{${bottom}}`
export const signedTerm = (m: Mono, first: boolean) => `${m.c[0] < 0 ? '-' : first ? '' : '+'}${termTex(abs(m.c), m.raw, false)}`
const divRule = (a: Q, b: Q) => (a[0] < 0 && b[0] < 0 ? 'A negative divided by a negative is positive: $- \\div - = +$.' : a[0] < 0 || b[0] < 0 ? 'A negative divided by a positive is negative: $- \\div + = -$.' : 'Divide the numbers in front of the letters.')
// the letters: for each letter on top and bottom, the exponents are subtracted: x^2 / x = x^{2-1}
const expRule = (n: Vars, d: Vars) => {
  const sh = n.filter(([l]) => d.some(([x]) => x === l)).map(([l, a]) => `${frac(varTex([[l, a]]), varTex([[l, d.find(([x]) => x === l)![1]]]))} = ${l}^{${a}-${d.find(([x]) => x === l)![1]}}`)
  return sh.length ? `$${sh.join(',\\; ')}$` : 'Letters that are only on top stay as they are.'
}
const lettersWith = (n: Vars, d: Vars, how: (a: number, b: number) => number) => {
  const all = [...new Set([...n, ...d].map(([l]) => l))].sort()
  const vs = all.map((l): [string, number] => [l, how(n.find(([x]) => x === l)?.[1] ?? 0, d.find(([x]) => x === l)?.[1] ?? 0)]).filter(([, x]) => x > 0)
  return varTex(vs) || '1'
}

// A wrong answer to "term / divisor" (both with letters): first the numbers in front, then the letters
export function splitDiv(focus: string[], t: Mono, d: Mono, res: Tok, uid: string, first: boolean, idx: number): Step[] {
  const c = qdiv(t.c, d.c)
  const tex = (x: Q) => (x[0] < 0 ? '-' : first ? '' : '+') + numTex(abs(x))
  const [nOpts, nCorrect] = pick(tex(c), [tex(neg(c)), tex(qmul(t.c, d.c)), tex(q(t.c[0] - d.c[0])), tex(t.c), tex(d.c)], idx)
  const nQ = `What is $${parNum(t.c)} \\div ${parNum(d.c)}$?`
  const nHint = divRule(t.c, d.c)
  const nTok: Tok = { id: `n${uid}`, tex: tex(c) }
  const lTok: Tok = { id: `l${uid}`, tex: frac(varTex(t.vs), varTex(d.vs)) }
  const lRight = lettersWith(t.vs, d.vs, (a, b) => a - b)
  const [lOpts, lCorrect] = pick(lRight, [lettersWith(t.vs, d.vs, (a, b) => a + b), lettersWith(t.vs, d.vs, (a) => a), varTex(d.vs), lettersWith(t.vs, d.vs, (a, b) => Math.max(a / (b || 1), 1))], idx + 1)
  const lQ = `What is $${frac(varTex(t.vs), varTex(d.vs))}$?`
  const lHint = expRule(t.vs, d.vs)
  return [
    { focus, result: nTok, results: [nTok, lTok], arrows: focus.map((f) => ({ from: [f], to: [nTok.id] })), say: '', calcPrompt: nQ, calc: { q: nQ, options: nOpts, correct: nCorrect, hints: nOpts.map((_, j) => (j === nCorrect ? '' : nHint)), spell: nHint } },
    { focus: [nTok.id, lTok.id], result: res, arrows: [{ from: [lTok.id], to: [res.id] }], say: '', calcPrompt: lQ, calc: { q: lQ, options: lOpts, correct: lCorrect, hints: lOpts.map((_, j) => (j === lCorrect ? '' : lHint)), spell: lHint } },
  ]
}

export interface Div {
  num: P
  den: Mono
}
export const parseDiv = (s: unknown): Div | null => {
  if (typeof s !== 'string') return null
  const m = s.replace(/\s/g, '').match(/^\((.+)\)\/(.+)$/)
  if (!m) return null
  const num = parseSafe(m[1])
  const den = parseSafe(m[2])
  if (!num || num.length < 2 || num.length > 4 || !den || den.length !== 1) return null
  const quo = num.map((t) => mdiv(t, den[0]))
  return quo.every((x) => x && x.c[1] === 1) ? { num, den: den[0] } : null // every term divides exactly, with a whole number in front
}
export const quotientOf = ({ num, den }: Div): P => num.map((t) => mdiv(t, den)!)
export const texDiv = ({ num, den }: Div) => frac(line(num), line([den]))

// `pre`: steps before the division (e.g. the area formula); they must leave the line with the token `f` (the fraction)
export function lessonDiv(d: Div, key: string, no: number, idx: number, pre?: Pre, sec = '5.4'): Lesson {
  const { num, den } = d
  const quo = quotientOf(d)
  const k = num.length
  const dTex = line([den])
  const parts: Tok[] = num.map((t, i) => ({ id: `p${i}`, tex: `${t.c[0] < 0 ? '-' : i ? '+' : ''}${frac(termTex(abs(t.c), t.raw, false), dTex)}` }))
  const L = ['a', 'b', 'c', 'd'].slice(0, k)
  const gen = frac(L.join(' + '), 'e')
  const right = L.map((t) => frac(t, 'e')).join(' + ')
  const options1 = pick(right, [[frac(L[0], 'e'), ...L.slice(1)].join(' + '), L.map((t) => frac('e', t)).join(' + '), `${L.join(' + ')} - e`, frac(L[0], 'e')], idx)
  const hint1 = `Divide EVERY term on top by the bottom: ${num.map((t) => `$${frac(termTex(t.c, t.raw, false), dTex)}$`).join(', ')}.`
  const steps: Step[] = [
    {
      from: 'each',
      focus: ['f'],
      result: parts[0],
      results: parts,
      arrows: parts.map((p) => ({ from: ['f'], to: [p.id] })),
      say: '',
      calcPrompt: `What is $${gen}$?`,
      calc: { q: `What is $${gen}$?`, options: options1[0], correct: options1[1], hints: options1[0].map((_, i) => (i === options1[1] ? '' : hint1)), spell: hint1 },
    },
  ]
  num.forEach((t, i) => {
    const res: Tok = { id: `q${i}`, tex: signedTerm(quo[i], i === 0) }
    const wrongT = (m: Mono) => signedTerm(m, i === 0)
    const [options, correct] = pick(
      wrongT(quo[i]),
      [wrongT(mk(neg(quo[i].c), quo[i].raw)), wrongT(mk(qmul(t.c, den.c), quo[i].raw)), wrongT(mk(quo[i].c, lettersWith(t.vs, den.vs, (a, b) => a + b))), wrongT(mk(quo[i].c, t.raw)), wrongT(mk(den.c, quo[i].raw))],
      idx + i + 1,
    )
    const hint = `${divRule(t.c, den.c)}${t.vs.length && den.vs.length ? ` ${expRule(t.vs, den.vs)}` : ''}`
    const split = t.vs.length && den.vs.length ? splitDiv([`p${i}`], t, den, res, String(i), i === 0, idx + i + 1) : undefined
    steps.push({
      ...(split ? { split } : {}),
      from: 'each',
      focus: [`p${i}`],
      result: res,
      say: '',
      calcPrompt: `What is $${frac(termTex(t.c, t.raw, false), dTex)}$?`,
      calc: { q: `What is $${frac(termTex(t.c, t.raw, false), dTex)}$?`, options, correct, hints: options.map((_, j) => (j === correct ? '' : hint)), spell: hint },
    })
  })
  return {
    key: `div${no}-${key}`,
    label: key,
    source: `Grade 9, ${sec} exercise ${no}${key}`,
    title: 'Divide',
    prompt: 'Quotient =',
    answer: simpTex(quo),
    start: pre ? pre.start : [{ id: 'f', tex: texDiv(d) }],
    steps: [...(pre?.steps ?? []), ...steps],
    ...pre?.extra,
    review: { heading: 'Dividing a polynomial', rows: [] },
  }
}

export function choicesDiv(d: Div, idx: number): [string[], number] {
  const { num, den } = d
  const quo = quotientOf(d)
  const last = quo.length - 1
  return pick(simpTex(quo), [simpTex([...quo.slice(0, last), num[last]]), simpTex([quo[0], ...num.slice(1)]), simpTex([...quo.slice(0, last), mk(neg(quo[last].c), quo[last].raw)]), ...finalChoices(quo, 0)[0], simpTex(num.map((t) => mk(qmul(t.c, den.c), t.raw)))], idx)
}

const BOOK = BOOK54 as Record<string, Record<string, string>>
type Custom = { shown: number; book: [string, string][]; gen: Record<string, string[]> } // the questions of a challenge exercise (hard5-data.ts)
function build(no: string, custom?: Custom): Exercise {
  const generated = (part: string): unknown[] => custom?.gen[part] ?? (V54 as Record<string, Record<string, unknown[]>>)[no]?.[part] ?? []
  const questions: Question[] = (custom?.book ?? Object.entries(BOOK[no])).map(([part, src], idx): Question => {
    const book = parseDiv(src)!
    const bank = topTen(generated(part).map(parseDiv).filter((x): x is Div => !!x), [], texDiv, book)
    const make = (d: Div, key: string, k: number): Practice => {
      const [choices, correct] = choicesDiv(d, idx + k)
      return { tex: texDiv(d), choices, correct, why: '', lesson: () => lessonDiv(d, key, Number(no), idx + k) }
    }
    return { part, ...make(book, part, 0), practice: bank.map((d, k) => make(d, `${part}${k + 1}`, k + 1)) }
  })
  return { no: custom?.shown ?? Number(no), sec: '5.4', prompt: 'Divide', mathChoices: true, questions }
}

export const EX54 = ['1', '2', '3'].map((n) => build(n))
export const buildDiv = build
