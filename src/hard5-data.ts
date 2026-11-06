// Challenge exercises for chapter 5 (optional extra practice for fast students, own progress): 5.1 collect like terms, 5.3 monomial times polynomial, 5.4 polynomial divided by a monomial.
// The questions are made here (more terms, more letters, bigger numbers) and given to the existing builders; every answer and step is computed there.
// Imported by: quiz.tsx, check5h.ts. Shape: exercise.ts.
import type { Exercise } from './exercise'
import { buildCollect } from './simplify-data'
import { buildMult } from './mult-data'
import { buildDiv } from './div-data'

const rng = (seed: number) => {
  let s = seed
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32)
}
const between = (r: () => number, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1))
const coef = (r: () => number, lo = 1, hi = 9) => between(r, lo, hi) * (r() < 0.5 ? -1 : 1)

// a monomial as letter -> exponent
type M = Record<string, number>
const parseM = (s: string): M => {
  const m: M = {}
  for (const [, l, e] of s.matchAll(/([a-z])(?:\^(\d+))?/g)) m[l] = (m[l] ?? 0) + (e ? +e : 1)
  return m
}
const mulM = (a: M, b: M): M => {
  const m: M = { ...a }
  for (const l of Object.keys(b)) m[l] = (m[l] ?? 0) + b[l]
  return m
}
const strM = (m: M) => Object.keys(m).sort().map((l) => (m[l] === 1 ? l : `${l}^${m[l]}`)).join('')
// c times a monomial as text: 1 and -1 are written without the 1
const term = (c: number, mono: string) => `${c < 0 ? '-' : ''}${Math.abs(c) === 1 && mono ? '' : Math.abs(c)}${mono}`
const poly = (cs: number[], monos: string[]) => cs.map((c, i) => (i === 0 || c < 0 ? term(c, monos[i]) : `+${term(c, monos[i])}`)).join('')
const pickSome = <T,>(r: () => number, xs: T[], k: number): T[] => {
  const p = [...xs]
  const out: T[] = []
  const target = Math.min(k, xs.length)
  while (out.length < target) out.push(p.splice(between(r, 0, p.length - 1), 1)[0])
  return out
}
const uniqueList = (n: number, gen: () => string): string[] => {
  const out: string[] = []
  for (let k = 0; k < 400 && out.length < n; k++) {
    const s = gen()
    if (!out.includes(s)) out.push(s)
  }
  return out
}
const parts = (sets: (() => string)[], n = 14): { book: [string, string][]; gen: Record<string, string[]> } => {
  const book: [string, string][] = []
  const gen: Record<string, string[]> = {}
  sets.forEach((g, i) => {
    const part = String.fromCharCode(97 + i)
    const l = uniqueList(n, g)
    book.push([part, l[0]])
    gen[part] = l.slice(1)
  })
  return { book, gen }
}

// ---- 5.1: collect like terms: 8 to 10 terms ----
const LIKE: string[][] = [['x^3', 'x^2', 'x', ''], ['x^2', 'y^2', 'x', 'y', ''], ['x^2', 'xy', 'y^2', 'x', 'y', ''], ['x^2', 'xy', 'y^2', 'z', 'x', 'y']]
const likeSet = (seed: number, monos: string[]) => {
  const r = rng(seed)
  return () => {
    const k = between(r, 8, 10)
    const ms = Array.from({ length: k }, (_, i) => (i < monos.length ? monos[i] : monos[between(r, 0, monos.length - 1)]))
    const sh = pickSome(r, ms, k)
    // xy is sometimes written yx
    return poly(sh.map(() => coef(r)), sh.map((m) => (m === 'xy' && r() < 0.4 ? 'yx' : m)))
  }
}
const H51 = parts(LIKE.map((m, i) => likeSet(5100 + i, m)))

// ---- 5.3: a monomial times a polynomial of 3 or 4 terms ----
const DIST_A: string[][] = [['x'], ['x', 'x^2'], ['x', 'y', 'xy'], ['x^2', 'xy', 'x^2y']]
const DIST_B: string[][] = [['x^3', 'x^2', 'x', ''], ['x^3', 'x^2', 'x', ''], ['x^2', 'xy', 'y^2', 'x', 'y'], ['x^2', 'xy', 'y^2', 'x', 'y']]
const distSet = (seed: number, a: string[], b: string[]) => {
  const r = rng(seed)
  return () => {
    const am = a[between(r, 0, a.length - 1)]
    const monos = pickSome(r, b, between(r, 3, 4))
    return `${term(coef(r, 2, 9), am)}(${poly(monos.map(() => coef(r)), monos)})`
  }
}
const H53 = parts(DIST_B.map((b, i) => distSet(5300 + i, DIST_A[i], b)))

// ---- 5.4: a polynomial of 3 or 4 terms divided by a monomial (every term divides exactly) ----
const DEN: string[][] = [['x'], ['x', 'x^2'], ['xy', 'x^2'], ['x^2y', 'xy', 'x^2']]
const QUO: string[][] = [['x^3', 'x^2', 'x', ''], ['x^3', 'x^2', 'x', ''], ['x^2', 'xy', 'y^2', 'x', 'y'], ['x^2', 'xy', 'y^2', 'x', 'y', 'xy^2']]
const divSet = (seed: number, den: string[], quo: string[]) => {
  const r = rng(seed)
  return () => {
    const d = den[between(r, 0, den.length - 1)]
    const dc = coef(r, 2, 9)
    const qm = pickSome(r, quo, between(r, 3, 4))
    const nm = qm.map((m) => strM(mulM(parseM(m), parseM(d))))
    const num = poly(qm.map(() => coef(r) * dc), nm)
    return `(${num})/${term(dc, d)}`
  }
}
const H54 = parts(QUO.map((q, i) => divSet(5400 + i, DEN[i], q)))

export const EX51H: Exercise[] = [buildCollect(18, H51.book, 8, '5.1', H51.gen)]
export const EX53H: Exercise[] = [buildMult('2', { shown: 12, book: H53.book, gen: H53.gen })]
export const EX54H: Exercise[] = [buildDiv('3', { shown: 13, book: H54.book, gen: H54.gen })]
