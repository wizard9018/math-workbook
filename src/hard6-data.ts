// Challenge exercises for chapter 6 (optional extra practice for fast students, own progress): 6.1 solving equations (exercises 2, 3 and 5, harder).
// The equations are made here (bigger numbers, fraction coefficients, several terms on each side, always a whole-number solution) and given to the existing builder; every step is computed there.
// Imported by: quiz.tsx, check6h.ts. Shape: exercise.ts.
import type { Exercise } from './exercise'
import { buildEq } from './eq-data'

const rng = (seed: number) => {
  let s = seed
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32)
}
const between = (r: () => number, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1))
const nz = (r: () => number, lo: number, hi: number) => between(r, lo, hi) * (r() < 0.5 ? -1 : 1)
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a))
const uniqueList = (n: number, gen: () => string): string[] => {
  const out: string[] = []
  for (let k = 0; k < 600 && out.length < n; k++) {
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
// a coefficient as text: 1 and -1 are written without the 1
const cx = (c: number, v: string) => `${c < 0 ? '-' : ''}${Math.abs(c) === 1 ? '' : Math.abs(c)}${v}`
const signed = (n: number) => (n < 0 ? `${n}` : `+${n}`)
// n split into k whole parts (the parts may be negative)
const splitInto = (r: () => number, n: number, k: number): number[] => {
  const out: number[] = []
  let rest = n
  for (let i = 0; i < k - 1; i++) {
    const p = nz(r, 1, 9)
    out.push(p)
    rest -= p
  }
  out.push(rest)
  return out.every((x) => x !== 0) ? out : splitInto(r, n, k)
}

// ---- exercise 2: one or two steps, bigger numbers: a x + b = c, or a x + b = d x + e ----
const twoStep = (seed: number, two: boolean, v: string) => {
  const r = rng(seed)
  return () => {
    const x0 = nz(r, 2, 12)
    const a = nz(r, 3, 12)
    const b = nz(r, 5, 25)
    if (!two) return `${cx(a, v)}${signed(b)}=${a * x0 + b}`
    let d = nz(r, 2, 11)
    if (d === a) d += 1
    const e = a * x0 + b - d * x0
    return `${cx(a, v)}${signed(b)}=${cx(d, v)}${e === 0 ? '' : signed(e)}`
  }
}
const H2 = parts([twoStep(6101, false, 'x'), twoStep(6102, false, 'y'), twoStep(6103, true, 'x'), twoStep(6104, true, 'n')])

// ---- exercise 3: a fraction coefficient: p/q x + b = c with a whole-number solution ----
const fracEq = (seed: number, v: string, withConst: boolean) => {
  const r = rng(seed)
  return () => {
    let p: number
    let q: number
    do {
      p = nz(r, 2, 9)
      q = between(r, 2, 9)
    } while (gcd(p, q) !== 1)
    const x0 = q * nz(r, 1, 6)
    const b = withConst ? nz(r, 2, 20) : 0
    const c = (p * x0) / q + b
    return `${p}/${q}${v}${b ? signed(b) : ''}=${c}`
  }
}
const H3 = parts([fracEq(6201, 'x', false), fracEq(6202, 'x', true), fracEq(6203, 'y', true), fracEq(6204, 'n', true)])

// ---- exercise 5: several terms on each side, like terms to collect first ----
const manyTerms = (seed: number, v: string, kl: number, kr: number) => {
  const r = rng(seed)
  return () => {
    const x0 = nz(r, 1, 9)
    const A1 = nz(r, 2, 9)
    let A2 = nz(r, 1, 9)
    if (A1 === A2) A2 += 1
    const B1 = nz(r, 1, 20)
    const B2 = B1 + (A1 - A2) * x0
    const side = (A: number, B: number, k: number) => {
      const vs = splitInto(r, A, Math.max(2, k - 1))
      const cs = splitInto(r, B, 2)
      const terms = [...vs.map((c) => cx(c, v)), ...cs.map(String)]
      for (let i = terms.length - 1; i > 0; i--) {
        const j = between(r, 0, i)
        ;[terms[i], terms[j]] = [terms[j], terms[i]]
      }
      return terms.map((t, i) => (i === 0 || t.startsWith('-') ? t : `+${t}`)).join('')
    }
    return `${side(A1, B1, kl)}=${side(A2, B2, kr)}`
  }
}
const H5 = parts([manyTerms(6301, 'x', 3, 3), manyTerms(6302, 'y', 3, 4), manyTerms(6303, 'z', 4, 3), manyTerms(6304, 'x', 4, 4)])

export const SETS6 = { H2, H3, H5 }
export const EX61H: Exercise[] = [
  buildEq('2', 'Determine the solution of each equation.', { shown: 12, book: H2.book, gen: H2.gen }),
  buildEq('3', 'Determine the solution of each equation.', { shown: 13, book: H3.book, gen: H3.gen }),
  buildEq('5', 'Determine the solution of each equation.', { shown: 15, book: H5.book, gen: H5.gen }),
]
