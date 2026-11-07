// Grade 9 5.4 exercise 10 (bank/G9-ch5/s4/items.json): combined operations, e.g. 2x(x + 3) + (6x^2 - 4x + 8) / 2.
// Lesson: every part (a monomial times a bracket, or a polynomial divided by a monomial) is worked out into its terms, then the like terms are collected (the same last steps as 5.1).
// The 10 similar questions of every question are written by Gemini (gen-variants-54.py, variants54.json); the answers are computed here.
// Imported by: quiz.tsx. Shape: exercise.ts.
import type { Exercise, Practice, Question } from './exercise'
import type { Lesson, Step, Tok } from './lessons'
import V54 from './variants54.json'
import BOOK54 from './book54.json'
import { frac, line, mdiv } from './div-data'
import type { P } from './div-data'
import { collectPart, finalChoices, mk, parseSafe, pick, polyTex, q, simplified, simpTex, termTex, topTen, varTex } from './simplify-data'
import type { Mono } from './simplify-data'

// a part: op (+1 / -1) in front, a monomial m (a number, letters, or -1 for "-(...)"), the bracket / polynomial, and the divisor (none: m(poly))
interface Term {
  op: 1 | -1
  m: Mono
  poly: P
  den: Mono | null
  kind: 'dist' | 'frac' | 'fracm' // m(poly) | (poly)/den | (m(poly))/den
}
export type Combo = Term[]

const one = mk(q(1), '')
const mStr = (m: Mono) => (m.raw === '' ? termTex(m.c, '', false) : m.c[0] === 1 && m.c[1] === 1 ? m.raw : m.c[0] === -1 && m.c[1] === 1 ? `-${m.raw}` : termTex(m.c, m.raw, false))
const numStr = (t: Term) => (t.kind === 'frac' ? line(t.poly) : `${mStr(t.m)}(${line(t.poly)})`)
const bodyTex = (t: Term) => (t.den ? frac(numStr(t), line([t.den])) : numStr(t))
const tokTex = (t: Term, first: boolean) => `${t.op < 0 ? '-' : first ? '' : '+'}${bodyTex(t)}`
const norm = (ms: P): P => simplified(ms).map((x) => mk(x.c, varTex(x.vs)))
const times = (m: Mono, ps: P): P => ps.map((x) => mk(q(m.c[0] * x.c[0], m.c[1] * x.c[1]), m.raw + x.raw))
const polyOf = (ms: P) => polyTex(ms.map((x) => ({ c: x.c, v: x.raw })))
// the terms of one part without its operator: m(poly) multiplied out
const expanded = (t: Term): P => (t.kind === 'frac' ? t.poly : times(t.m, t.poly))
// the part worked out, with its operator applied (null when a division is not exact)
const valueOf = (t: Term): P | null => {
  const e = expanded(t)
  const v = t.den ? e.map((x) => mdiv(x, t.den!)) : e
  return v.every((x) => x && x.c[1] === 1) ? norm(v as P).map((x) => mk(q(x.c[0] * t.op, x.c[1]), x.raw)) : null
}
const flatOf = (c: Combo): P => c.flatMap((t) => valueOf(t)!)
export const texCombo = (c: Combo) => c.map((t, i) => tokTex(t, i === 0)).join('')

// "2x(x+3)+(6x^2-4x+8)/2" -> parts; null when it is not of this shape
export function parseCombo(s: unknown): Combo | null {
  if (typeof s !== 'string' || !/^[-+0-9a-z^/() ]+$/.test(s)) return null
  const src = s.replace(/\s/g, '')
  const cuts: number[] = [0]
  let depth = 0
  for (let i = 0; i < src.length; i++) {
    const ch = src[i]
    if (ch === '(') depth++
    else if (ch === ')') depth--
    else if (i > 0 && depth === 0 && (ch === '+' || ch === '-') && src[i - 1] !== '/' && src[i - 1] !== '^') cuts.push(i)
  }
  const texts = cuts.map((c, k) => src.slice(c, cuts[k + 1] ?? src.length))
  if (texts.length !== 2) return null
  const split = (e: string) => {
    const d = e.match(/^(-?[^()]*)\(([^()]+)\)$/)
    if (!d) return null
    const m = d[1] === '' ? one : d[1] === '-' ? mk(q(-1), '') : parseSafe(d[1])?.[0]
    const poly = parseSafe(d[2])
    return m && poly && poly.length >= 2 ? { m, poly } : null
  }
  const parts = texts.map((x): Term | null => {
    const op: 1 | -1 = x[0] === '-' ? -1 : 1
    const body = x.replace(/^[-+]/, '')
    const f = body.match(/^\((.+)\)\/(-?[^()]+)$/)
    if (f) {
      const den = parseSafe(f[2])
      if (!den || den.length !== 1) return null
      const plain = parseSafe(f[1])
      if (plain && plain.length >= 2) return { op, m: one, poly: plain, den: den[0], kind: 'frac' }
      const sp = split(f[1])
      return sp ? { op, m: sp.m, poly: sp.poly, den: den[0], kind: 'fracm' } : null
    }
    const sp = split(body)
    return sp ? { op, m: sp.m, poly: sp.poly, den: null, kind: 'dist' } : null
  })
  return parts.every((p) => p && valueOf(p)) ? (parts as Combo) : null
}

export function lessonCombo(c: Combo, key: string, idx: number): Lesson {
  const flat = flatOf(c)
  const { start: flatStart, steps: collect } = collectPart(flat, idx)
  const steps: Step[] = []
  let off = 0
  const prompt = (e: string) => `What is $${e}$?`
  c.forEach((t, i) => {
    const val = valueOf(t)!
    const res = flatStart.slice(off, off + val.length)
    off += val.length
    const wrongs = (ms: P) => finalChoices(ms, 0)[0]
    const hint = t.den ? `Divide every term on top by $${line([t.den])}$.${t.kind === 'fracm' ? ' Multiply out the top first.' : ''}` : `Multiply $${mStr(t.m)}$ by every term in the bracket.`
    const sign = t.op < 0 ? '-' : ''
    if (t.kind === 'fracm') {
      // first the top is multiplied out, then divided
      const ex = norm(expanded(t))
      const eTok: Tok = { id: `e${i}`, tex: `${t.op < 0 ? '-' : i ? '+' : ''}${frac(`(${line(ex)})`, line([t.den!]))}` }
      const [o1, c1] = pick(line(ex), wrongs(ex), idx + i)
      const q1 = prompt(numStr(t))
      steps.push({ focus: [`u${i}`], result: eTok, say: '', calcPrompt: q1, calc: { q: q1, options: o1, correct: c1, hints: o1.map((_, j) => (j === c1 ? '' : `Multiply $${mStr(t.m)}$ by every term in the bracket.`)), spell: hint } })
      const [o2, c2] = pick(polyOf(val), wrongs(val), idx + i + 1)
      const q2 = prompt(`${sign}${frac(line(ex), line([t.den!]))}`)
      steps.push({ focus: [eTok.id], results: res, result: res[0], say: '', calcPrompt: q2, calc: { q: q2, options: o2, correct: c2, hints: o2.map((_, j) => (j === c2 ? '' : hint)), spell: hint } })
      return
    }
    // the usual slip: the minus in front of the part is not applied
    const [options, correct] = pick(polyOf(val), [...wrongs(val), polyOf(valueOf({ ...t, op: (-t.op) as 1 | -1 })!)], idx + i)
    const p = prompt(`${sign}${bodyTex(t)}`)
    steps.push({ focus: [`u${i}`], results: res, result: res[0], say: '', calcPrompt: p, calc: { q: p, options, correct, hints: options.map((_, j) => (j === correct ? '' : hint)), spell: hint } })
  })
  if (simpTex(flat) !== line(flat)) steps.push(...collect) // nothing to collect or order: the parts are the answer
  return {
    key: `combo10-${key}`,
    label: key,
    source: `Grade 9, 5.4 exercise 10${key}`,
    title: 'Combined operations',
    prompt: 'Answer =',
    answer: simpTex(flat),
    start: c.map((t, i): Tok => ({ id: `u${i}`, tex: tokTex(t, i === 0) })),
    steps,
    review: { heading: 'Combined operations', rows: [] },
  }
}

export function choicesCombo(c: Combo, idx: number): [string[], number] {
  const flat = flatOf(c)
  const unsigned = c.flatMap((t) => valueOf({ ...t, op: 1 })!) // the minus in front of a part was not applied
  return pick(simpTex(flat), [simpTex(unsigned), ...finalChoices(flat, 0)[0]], idx)
}

const BOOK = (BOOK54 as Record<string, Record<string, string>>)['10']
type Custom = { shown: number; book: [string, string][]; gen: Record<string, string[]> } // the questions of a challenge exercise (hard5-data.ts)
function build(custom?: Custom): Exercise {
  const generated = (part: string): unknown[] => custom?.gen[part] ?? (V54 as Record<string, Record<string, unknown[]>>)['10']?.[part] ?? []
  const questions: Question[] = (custom?.book ?? Object.entries(BOOK)).map(([part, src], idx): Question => {
    const book = parseCombo(src)!
    const bank = topTen(generated(part).map(parseCombo).filter((x): x is Combo => !!x), [], texCombo, book)
    const make = (c: Combo, key: string, k: number): Practice => {
      const [choices, correct] = choicesCombo(c, idx + k)
      return { tex: texCombo(c), choices, correct, why: '', lesson: () => lessonCombo(c, key, idx + k) }
    }
    return { part, ...make(book, part, 0), practice: bank.map((c, k) => make(c, `${part}${k + 1}`, k + 1)) }
  })
  return { no: custom?.shown ?? 10, sec: '5.4', prompt: 'Perform the combined operations.', mathChoices: true, questions }
}

export const EX_COMBO54 = [build()]
export const buildCombo = build
