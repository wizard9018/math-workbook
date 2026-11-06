// Grade 9 5.3 exercises 1, 2 and 3 (bank/G9-ch5/s3/items.json): the product of two monomials, and a monomial times a polynomial (the distributive property).
// Exercise 1 lesson: multiply the numbers, then the letters (the exponents add up). Exercises 2 and 3 lesson: multiply the monomial by EVERY term of the bracket, work out each product, put the terms in order.
// The 10 similar questions of every question are written by Gemini (gen-variants-53.py, variants53.json); the answers are computed here.
// Imported by: quiz.tsx. Shape: exercise.ts.
import type { Exercise, Practice, Question } from './exercise'
import type { Lesson, Step, Tok } from './lessons'
import V53 from './variants53.json'
import { add, collectPart, finalChoices, mk, neg, parseSafe, pick, polyTex, q, simplified, simpTex, termTex, topTen, varTex } from './simplify-data'
import type { Mono, Q } from './simplify-data'

type P = Mono[]
type Vars = Mono['vs']
const qmul = (a: Q, b: Q): Q => q(a[0] * b[0], a[1] * b[1], !!(a[2] || b[2]))
const normOne = (c: Q, raw: string): Mono => {
  const t = simplified([mk(c, raw)])[0]
  return t ? mk(t.c, varTex(t.vs)) : mk(q(0), '')
}
const line = (v: P) => polyTex(v.map((m) => ({ c: m.c, v: m.raw })))
const par = (m: Mono) => (m.c[0] < 0 ? `(${line([m])})` : line([m]))
const numTex = (c: Q) => termTex(c, '', false)
const parNum = (c: Q) => (c[0] < 0 ? `(${numTex(c)})` : numTex(c))
const vsStr = (e: [string, number][]) => varTex(e.filter(([, n]) => n > 0).sort((a, b) => a[0].localeCompare(b[0])))

// the letters of a product: `how` decides each exponent from the exponents in the two factors (the right way: they add up)
function lettersOf(v1: Vars, v2: Vars, how: (a: number, b: number) => number): string {
  const all = [...new Set([...v1, ...v2].map(([l]) => l))]
  return vsStr(all.map((l): [string, number] => [l, how(v1.find(([x]) => x === l)?.[1] ?? 0, v2.find(([x]) => x === l)?.[1] ?? 0)]))
}
// the sign rule that fits the two numbers being multiplied
const signRule = (a: Q, b: Q) => (a[0] < 0 && b[0] < 0 ? 'A double negative becomes positive: $-\\times - = +$.' : a[0] < 0 || b[0] < 0 ? 'A negative times a positive is negative: $-\\times + = -$.' : 'Multiply the numbers in front of the letters.')
// the exponent rule as a formula for each letter the two factors share: m^2 × m = m^{2+1}
const expRule = (v1: Vars, v2: Vars) => {
  const sh = v1.filter(([l]) => v2.some(([x]) => x === l)).map(([l, a]) => `${varTex([[l, a]])} \\times ${varTex([[l, v2.find(([x]) => x === l)![1]]])} = ${l}^{${a}+${v2.find(([x]) => x === l)![1]}}`)
  return sh.length ? `$${sh.join(',\\; ')}$` : 'Different letters stay as they are.'
}
const addExp =(a: number, b: number) => a + b
const mulExp = (a: number, b: number) => (a && b ? a * b : a + b)

// ---- exercise 1: monomial times monomial ----
const parseTwo = (s: unknown): [Mono, Mono] | null => {
  if (typeof s !== 'string') return null
  const parts = s.replace(/\s/g, '').split('*')
  if (parts.length !== 2) return null
  const ms = parts.map((p) => parseSafe(p))
  return ms.every((m) => m && m.length === 1) ? [ms[0]![0], ms[1]![0]] : null
}
const tex1 = ([x, y]: [Mono, Mono]) => `${line([x])} \\times ${par(y)}`

function lessonProduct([x, y]: [Mono, Mono], key: string, idx: number): Lesson {
  const prodC = qmul(x.c, y.c)
  const result = normOne(prodC, x.raw + y.raw)
  const both = x.vs.length > 0 && y.vs.length > 0
  const steps: Step[] = []
  const toks: Tok[] = [{ id: 'a', tex: numTex(x.c) }, ...(x.vs.length ? [{ id: 'b', tex: varTex(x.vs) }] : []), { id: 'd', tex: `\\cdot\\,${parNum(y.c)}` }, ...(y.vs.length ? [{ id: 'e', tex: varTex(y.vs) }] : [])]
  const n1 = numTex(prodC)
  const [numOptions, numCorrect] = pick(n1, [numTex(neg(prodC)), numTex(add(x.c, y.c)), numTex(add(x.c, neg(y.c))), numTex(x.c), numTex(y.c)], idx)
  const numHint = `What is $${parNum(x.c)} \\times ${parNum(y.c)}$? ${signRule(x.c, y.c)}`
  steps.push({
    focus: both ? ['a', 'd'] : toks.map((t) => t.id), // only the two numbers are highlighted
    result: { id: 'q', tex: both ? n1 : termTex(result.c, result.raw, false) },
    arrows: [{ from: ['a', 'd'], to: ['q'] }],
    say: '',
    calcPrompt: 'What do the numbers multiply to?',
    calc: { q: 'What do the numbers multiply to?', options: numOptions, correct: numCorrect, hints: numOptions.map((_, i) => (i === numCorrect ? '' : numHint)), spell: numHint },
  })
  if (both) {
    const right = lettersOf(x.vs, y.vs, addExp)
    const [options, correct] = pick(right, [lettersOf(x.vs, y.vs, mulExp), lettersOf(x.vs, y.vs, (a, b) => a + b + 1), lettersOf(x.vs, y.vs, (a, b) => Math.max(a + b - 1, 1)), varTex(x.vs), varTex(y.vs)], idx + 1)
    const hint = expRule(x.vs, y.vs)
    steps.push({
      focus: Math.abs(prodC[0]) === Math.abs(prodC[1]) ? ['q', 'b', 'e'] : ['b', 'e'], // only the two letter parts, unless the number in front is 1
      arrows: [{ from: ['b', 'e'], to: ['r'] }],
      result: { id: 'r', tex: Math.abs(prodC[0]) === Math.abs(prodC[1]) ? termTex(result.c, result.raw, false) : right }, // q stays in front, so r is only the letters
      say: '',
      calcPrompt: 'What do the letters multiply to?',
      calc: { q: 'What do the letters multiply to?', options, correct, hints: options.map((_, i) => (i === correct ? '' : hint)), spell: hint },
    })
  }
  return {
    key: `mult1-${key}`,
    label: key,
    source: `Grade 9, 5.3 exercise 1${key}`,
    title: 'Multiply',
    prompt: 'Product =',
    answer: simpTex([result]),
    start: toks,
    steps,
    review: { heading: 'Monomials', rows: [] },
  }
}

function choicesProduct([x, y]: [Mono, Mono], idx: number): [string[], number] {
  const prodC = qmul(x.c, y.c)
  const result = normOne(prodC, x.raw + y.raw)
  const one = (c: Q, raw: string) => simpTex([normOne(c, raw)])
  return pick(simpTex([result]), [one(neg(prodC), result.raw), one(add(x.c, y.c), result.raw), one(prodC, lettersOf(x.vs, y.vs, mulExp)), one(prodC, lettersOf(x.vs, y.vs, (a, b) => a + b + 1)), ...finalChoices([result], 0)[0]], idx)
}

// ---- exercises 2 and 3: monomial times polynomial ----
export interface Dist {
  a: Mono
  b: P
}
export const parseDist = (s: unknown): Dist | null => {
  if (typeof s !== 'string') return null
  const m = s.replace(/\s/g, '').match(/^(-?[^()]*)\((.+)\)$/)
  if (!m) return null
  const a = parseSafe(m[1])
  const b = parseSafe(m[2])
  return a && a.length === 1 && b && b.length >= 2 && b.length <= 4 ? { a: a[0], b } : null
}
export const texDist = ({ a, b }: Dist) => `${line([a])}(${line(b)})`
const prodOf = (a: Mono, bi: Mono) => normOne(qmul(a.c, bi.c), a.raw + bi.raw)

// `pre`: steps that come before the multiplication (e.g. the area formula); they must leave the line with the tokens `a` (the monomial) and `b` (the bracket)
export interface Pre {
  start: Tok[]
  steps: Step[]
  extra: Partial<Lesson>
}
// A wrong answer to "x × y" (both with letters) turns the question into two: the numbers in front first, then the letters.
// `focus`: the tokens that hold the product on the line; `res`: the token the product becomes; `uid` keeps the new token ids apart
export function splitSteps(focus: string[], x: Mono, y: Mono, res: Tok, uid: string, plus: boolean, idx: number): Step[] {
  const prodC = qmul(x.c, y.c)
  const t = (c: Q) => termTex(c, '', plus)
  const [nOpts, nCorrect] = pick(t(prodC), [t(neg(prodC)), t(add(x.c, y.c)), t(add(x.c, neg(y.c))), t(x.c)], idx)
  const nQ = `What is $${parNum(x.c)} \times ${parNum(y.c)}$?`
  const nHint = signRule(x.c, y.c)
  const nTok: Tok = { id: `n${uid}`, tex: t(prodC) }
  const lTok: Tok = { id: `l${uid}`, tex: `${varTex(x.vs)}\,${varTex(y.vs)}` }
  const [lOpts, lCorrect] = pick(lettersOf(x.vs, y.vs, addExp), [lettersOf(x.vs, y.vs, mulExp), lettersOf(x.vs, y.vs, (a, b) => a + b + 1), varTex(x.vs), varTex(y.vs)], idx + 1)
  const lQ = `What is $${varTex(x.vs)} \times ${varTex(y.vs)}$?`
  const lHint = expRule(x.vs, y.vs)
  return [
    { focus, result: nTok, results: [nTok, lTok], arrows: focus.map((f) => ({ from: [f], to: [nTok.id] })), say: '', calcPrompt: nQ, calc: { q: nQ, options: nOpts, correct: nCorrect, hints: nOpts.map((_, j) => (j === nCorrect ? '' : nHint)), spell: nHint } },
    { focus: [nTok.id, lTok.id], result: res, arrows: [{ from: [lTok.id], to: [res.id] }], say: '', calcPrompt: lQ, calc: { q: lQ, options: lOpts, correct: lCorrect, hints: lOpts.map((_, j) => (j === lCorrect ? '' : lHint)), spell: lHint } },
  ]
}
export function lessonDist({ a, b }: Dist, key: string, no: number, idx: number, pre?: Pre): Lesson {
  const prods = b.map((bi) => prodOf(a, bi))
  const flat: P = prods.map((p) => ({ ...p }))
  const { start: flatStart, steps: collect } = collectPart(flat, idx)
  const aTex = line([a])
  const pTex = (i: number, bi: Mono) => `${i > 0 ? '+' : ''}(${aTex})(${line([bi])})`
  const pTok = (i: number): Tok => ({ id: `p${i}`, tex: pTex(i, b[i]) })
  const last = b.length - 1

  // step 1: multiply the monomial by every term of the bracket
  // the question is the general rule: a(b + c) = ?
  const L = ['b', 'c', 'd', 'e'].slice(0, b.length)
  const gen = `a(${L.join(' + ')})`
  const options1 = pick(
    L.map((t) => `a${t}`).join(' + '),
    [
      [...L.slice(0, last).map((t) => `a${t}`), L[last]].join(' + '),
      `${L.slice(0, last).map((t) => `a${t}`).join(' + ')} - a${L[last]}`,
      `a + ${L.join(' + ')}`,
      `a${L[0]}`,
    ],
    idx,
  )
  const hint1 = `Multiply $${aTex}$ by EVERY term inside the bracket: ${b.map((bi) => `$${aTex} \\times ${par(bi)}$`).join(', ')}.`
  const steps: Step[] = [
    {
      focus: ['a', 'b'],
      result: pTok(0),
      results: b.map((_, i) => pTok(i)),
      arrows: [{ from: ['a', 'b'], to: b.map((_, i) => `p${i}`) }],
      say: '',
      calcPrompt: `What is $${gen}$?`,
      calc: { q: `What is $${gen}$?`, options: options1[0], correct: options1[1], hints: options1[0].map((_, i) => (i === options1[1] ? '' : hint1)), spell: hint1 },
    },
  ]
  // then each product is worked out
  prods.forEach((p, i) => {
    const right = termTex(p.c, p.raw, i > 0)
    const wrong = (c: Q, raw: string) => termTex(normOne(c, raw).c, normOne(c, raw).raw, i > 0)
    const [options, correct] = pick(right, [wrong(neg(p.c), p.raw), wrong(add(a.c, b[i].c), p.raw), wrong(p.c, lettersOf(a.vs, b[i].vs, mulExp)), wrong(p.c, lettersOf(a.vs, b[i].vs, (x, y) => x + y + 1)), wrong(p.c, a.raw)], idx + i + 1)
    const split = a.vs.length && b[i].vs.length ? splitSteps([`p${i}`], a, b[i], flatStart[i], String(i), i > 0, idx + i + 1) : undefined // both have letters: a wrong answer turns the question into two
    const hint = signRule(a.c, b[i].c)
    steps.push({
      ...(split ? { split } : {}),
      focus: [`p${i}`],
      result: flatStart[i],
      say: '',
      calcPrompt: `What is $${par(a)} \\times ${par(b[i])}$?`,
      calc: { q: `What is $${par(a)} \\times ${par(b[i])}$?`, options, correct, hints: options.map((_, j) => (j === correct ? '' : hint)), spell: hint },
    })
  })
  if (simpTex(flat) !== line(flat)) steps.push(...collect) // the products are already the answer when nothing is left to collect or order
  return {
    key: `mult${no}-${key}`,
    label: key,
    source: `Grade 9, 5.3 exercise ${no}${key}`,
    title: 'Multiply',
    prompt: 'Product =',
    answer: simpTex(flat),
    start: pre ? pre.start : [{ id: 'a', tex: aTex }, { id: 'b', tex: `(${line(b)})` }],
    steps: [...(pre?.steps ?? []), ...steps],
    ...pre?.extra,
    review: { heading: 'Distributive property', rows: [] },
  }
}

export function choicesDist({ a, b }: Dist, idx: number): [string[], number] {
  const prods = b.map((bi) => prodOf(a, bi))
  const last = prods.length - 1
  return pick(
    simpTex(prods),
    [
      simpTex([...prods.slice(0, last), b[last]]), // the last term was not multiplied
      simpTex([...prods.slice(0, last), mk(qmul(prods[last].c, q(-1)), prods[last].raw)]), // the sign of the last product is wrong
      simpTex([prods[0]]), // only the first term was multiplied
      ...finalChoices(prods, 0)[0],
    ],
    idx,
  )
}

// ---- the questions of the textbook ----
const BOOK: Record<string, [string, string][]> = {
  '1': Object.entries({ a: '-5*3', b: '-5*3x', c: '-5x*3x', d: '-5x*3x^2', e: '-5x^2*3x^2', f: '-4*-7', g: '-4*-7x', h: '-4x*-7x', i: '-4x*-7x^2', j: '-4x^2*-7x^2' }),
  '2': Object.entries({ a: '2(x+3)', b: '2(x-3)', c: '-2(x+3)', d: '-2(-x-3)', e: '2x(x+3)', f: '2x(x-3)', g: '-2x(x+3)', h: '-2x(x-3)', i: '2x(x^2+3)', j: '2x(x^2-3)', k: '-2x(x^2+3)', l: '-2x(x^2-3)', m: '2x^2(x^2+3)', n: '2x^2(x^2-3)', o: '-2x^2(x^2+3)', p: '-2x^2(x^2-3)', q: '2x^2(x^2+3x)', r: '2x^2(x^2-3x)', s: '-2x^2(x^2+3x)', t: '-2x^2(x^2-3x)' }),
  '3': Object.entries({ a: '3(x-4)', b: '-3(a-4)', c: '4(y+5)', d: '-5(b^2-2)', e: '3x(x-2)', f: '-2y(y-1)', g: '-2c(4c^2-c)', h: 'xy(x+y)', i: 'm^2(m-1)', j: 'p^2(-2p+4)', k: '-ab(a^2+b^2)', l: '-d^2(d^2-e)', m: '3xy(-2x+5y)', n: '-2n^2(3n-4)', o: '2z^2(z^2-3z)', p: '4tp(-2t^2+3p)', q: '2x^2(-x^2+3x)', r: '2x^2(-x^2-3x)', s: '-2x^2(-x^2+3x)', u: '2(x^2-3y+4z)', v: '2x(x+2y-3z)', w: '2x^2(-x^2+4y+3z)', x: '-2x^2(3x^2-2y^2+4z^2)' }),
}

type Custom = { shown: number; book: [string, string][]; gen: Record<string, string[]> } // the questions of a challenge exercise (hard5-data.ts)
function build(no: string, custom?: Custom): Exercise {
  const generated = (part: string): unknown[] => custom?.gen[part] ?? (V53 as Record<string, Record<string, unknown[]>>)[no]?.[part] ?? []
  const questions: Question[] = (custom?.book ?? BOOK[no]).map(([part, src], idx): Question => {
    if (no === '1') {
      const book = parseTwo(src)!
      const bank = topTen(generated(part).map(parseTwo).filter((x): x is [Mono, Mono] => !!x), [], tex1, book)
      const make = (f: [Mono, Mono], key: string, k: number): Practice => {
        const [choices, correct] = choicesProduct(f, idx + k)
        return { tex: tex1(f), choices, correct, why: '', lesson: () => lessonProduct(f, key, idx + k) }
      }
      return { part, ...make(book, part, 0), practice: bank.map((f, k) => make(f, `${part}${k + 1}`, k + 1)) }
    }
    const book = parseDist(src)!
    const bank = topTen(generated(part).map(parseDist).filter((x): x is Dist => !!x), [], texDist, book)
    const make = (d: Dist, key: string, k: number): Practice => {
      const [choices, correct] = choicesDist(d, idx + k)
      return { tex: texDist(d), choices, correct, why: '', lesson: () => lessonDist(d, key, Number(no), idx + k) }
    }
    return { part, ...make(book, part, 0), practice: bank.map((d, k) => make(d, `${part}${k + 1}`, k + 1)) }
  })
  return { no: custom?.shown ?? Number(no), sec: '5.3', prompt: 'Find each product', mathChoices: true, questions }
}

export const EX53 = ['1', '2', '3'].map((n) => build(n))
export const buildMult = build
