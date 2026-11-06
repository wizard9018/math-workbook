// Challenge exercises for 6.2 (optional extra practice for fast students, own progress): fractions, fractions and brackets, decimals, decimals and brackets - more terms, bigger numbers.
// The equations are made here from a whole-number solution (so the answer is always exact) and given to the existing builder; every step is computed there.
// Imported by: quiz.tsx, check62h.ts. Shape: exercise.ts.
import type { Exercise } from './exercise'
import { buildEq62, parseEq62 } from './eq62-data'

const rng = (seed: number) => {
  let s = seed
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32)
}
const between = (r: () => number, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1))
const nz = (r: () => number, lo: number, hi: number) => between(r, lo, hi) * (r() < 0.5 ? -1 : 1)
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a))

// ---- exact fractions [n, d] ----
type F = [number, number]
const fr = (n: number, d = 1): F => {
  const g = gcd(n, d) || 1
  return d < 0 ? [-n / g, -d / g] : [n / g, d / g]
}
const add = (a: F, b: F): F => fr(a[0] * b[1] + b[0] * a[1], a[1] * b[1])
const mul = (a: F, b: F): F => fr(a[0] * b[0], a[1] * b[1])
const num = (a: F) => (a[1] === 1 ? `${Math.abs(a[0])}` : `${Math.abs(a[0])}/${a[1]}`)
// |c| times the letter: 1/4 -> x/4, 3/4 -> 3/4x, 1 -> x
const vt = (c: F, v: string) => {
  const [n, d] = [Math.abs(c[0]), c[1]]
  if (d === 1) return n === 1 ? v : `${n}${v}`
  return n === 1 ? `${v}/${d}` : `${n}/${d}${v}`
}
type T = { neg: boolean; s: string }
const join = (ts: T[]) => ts.map((t, i) => `${t.neg ? '-' : i ? '+' : ''}${t.s}`).join('')
const vterm = (c: F, v: string): T => ({ neg: c[0] < 0, s: vt(c, v) })
const cterm = (c: F): T => ({ neg: c[0] < 0, s: num(c) })
const randFrac = (r: () => number, dens: number[]): F => fr(nz(r, 1, 5), dens[between(r, 0, dens.length - 1)])

// ---- hundredths as text ----
const dt = (h: number) => (Math.abs(h) / 100).toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
const dv = (h: number, v: string) => (Math.abs(h) === 100 ? v : `${dt(h)}${v}`)
const dterm = (h: number): T => ({ neg: h < 0, s: dt(h) })
const dvterm = (h: number, v: string): T => ({ neg: h < 0, s: dv(h, v) })
const dside = (h: number) => `${h < 0 ? '-' : ''}${dt(h)}`
const hund = (r: () => number) => nz(r, 5, 95) // 0.05 ... 0.95
const tenth = (r: () => number) => 10 * nz(r, 1, 9)

const uniqueList = (n: number, gen: () => string | null): string[] => {
  const out: string[] = []
  for (let k = 0; k < 800 && out.length < n; k++) {
    const s = gen()
    if (s && !out.includes(s) && parseEq62(s)) out.push(s)
  }
  return out
}
const parts = (sets: (() => string | null)[], n = 14): { book: [string, string][]; gen: Record<string, string[]> } => {
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
const shuffled = <X,>(r: () => number, xs: X[]): X[] => {
  const a = [...xs]
  for (let i = a.length - 1; i > 0; i--) {
    const j = between(r, 0, i)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ---- exercise 1: fractions, no brackets: coefficients with several denominators, solution a whole number ----
const DENS = [2, 3, 4, 5, 6, 8]
const fracSet = (seed: number, nx: number, nc: number, bothSides: boolean, v: string) => {
  const r = rng(seed)
  return () => {
    const x0 = nz(r, 1, 6) * 12
    const lx: F[] = Array.from({ length: nx }, () => randFrac(r, DENS))
    const lc: F[] = Array.from({ length: nc }, () => randFrac(r, DENS))
    const rx: F[] = bothSides ? [randFrac(r, DENS)] : []
    const val = (xs: F[], cs: F[]) => [...xs.map((c) => mul(c, fr(x0))), ...cs].reduce(add, fr(0))
    // the constant on the right side makes both sides equal
    const rc = add(val(lx, lc), mul(val(rx, []), fr(-1)))
    if (rc[0] === 0 || rc[1] > 24 || Math.abs(rc[0]) > 60) return null
    if (add(lx.reduce(add, fr(0)), mul(rx.reduce(add, fr(0)), fr(-1)))[0] === 0) return null
    const left = shuffled(r, [...lx.map((c) => vterm(c, v)), ...lc.map(cterm)])
    const right = shuffled(r, [...rx.map((c) => vterm(c, v)), cterm(rc)])
    return `${join(left)}=${join(right)}`
  }
}
const H1 = parts([fracSet(6501, 2, 0, false, 'x'), fracSet(6502, 1, 2, true, 'x'), fracSet(6503, 3, 1, false, 'y'), fracSet(6504, 2, 2, true, 'z')])

// ---- exercise 2: fractions and brackets: a/b (p x + q) on one or both sides ----
const bracket = (c: F, p: number, q: number, v: string) =>
  `${c[0] < 0 ? '-' : ''}${num(c) === '1' ? '' : num(c)}(${join([{ neg: p < 0, s: Math.abs(p) === 1 ? v : `${Math.abs(p)}${v}` }, { neg: q < 0, s: `${Math.abs(q)}` }])})`
const bracketSet = (seed: number, nb: number, bothSides: boolean, v: string) => {
  const r = rng(seed)
  return () => {
    const x0 = nz(r, 1, 7)
    const bs = Array.from({ length: nb }, () => ({ c: randFrac(r, [2, 3, 4, 5, 6]), p: between(r, 1, 3) * (r() < 0.3 ? -1 : 1), q: nz(r, 1, 9) }))
    const lhs: string[] = []
    let sum = fr(0)
    bs.forEach((b, i) => {
      const sign = i > 0 && r() < 0.5 ? -1 : 1
      lhs.push(bracket(fr(b.c[0] * sign, b.c[1]), b.p, b.q, v))
      sum = add(sum, mul(mul(b.c, fr(b.p * x0 + b.q)), fr(sign)))
    })
    const expr = lhs.map((t, i) => (i === 0 || t.startsWith('-') ? t : `+${t}`)).join('')
    if (!bothSides) return sum[1] > 12 || Math.abs(sum[0]) > 60 || sum[0] === 0 ? null : `${expr}=${sum[0] < 0 ? '-' : ''}${num(sum)}`
    // a bracket on the right: c(rr x + s), with s making the sides equal
    const c2 = randFrac(r, [2, 3, 4, 5, 6])
    const rr = between(r, 1, 3)
    if (rr === bs.reduce((a, b) => a + b.p, 0)) return null
    const sFrac = add(mul(sum, fr(c2[1], c2[0])), fr(-rr * x0))
    if (sFrac[1] !== 1 || sFrac[0] === 0 || Math.abs(sFrac[0]) > 20) return null
    return `${expr}=${bracket(c2, rr, sFrac[0], v)}`
  }
}
const H2 = parts([bracketSet(6601, 1, false, 'x'), bracketSet(6602, 2, true, 'x'), bracketSet(6603, 2, false, 'y'), bracketSet(6604, 3, true, 'x')])

// ---- exercise 3: decimals, no brackets (integers in hundredths so every digit is exact) ----
const decSet = (seed: number, kind: number, v: string) => {
  const r = rng(seed)
  return () => {
    const x0 = nz(r, 1, 12)
    if (kind === 0) {
      // 0.35x + 0.2x = D
      const a = hund(r)
      const b = hund(r)
      if (a + b === 0) return null
      return `${join([dvterm(a, v), dvterm(b, v)])}=${dside((a + b) * x0)}`
    }
    if (kind === 1) {
      // 1.25x - 3.4 = D
      const a = tenth(r) + 5 * nz(r, 1, 3)
      const b = nz(r, 5, 495)
      return `${join([dvterm(a, v), dterm(b)])}=${dside(a * x0 + b)}`
    }
    // both sides, 2 or 3 variable terms on the left
    const a = hund(r)
    const c = hund(r)
    const b = nz(r, 5, 495)
    const extra = kind === 3 ? hund(r) : 0
    const d = (a + extra) * x0 + b - c * x0
    if (a + extra === c || d === 0) return null
    const left = kind === 3 ? [dvterm(a, v), dterm(b), dvterm(extra, v)] : [dvterm(a, v), dterm(b)]
    return `${join(shuffled(r, left))}=${join(shuffled(r, [dvterm(c, v), dterm(d)]))}`
  }
}
const H3 = parts([decSet(6701, 0, 'x'), decSet(6702, 1, 'y'), decSet(6703, 2, 'x'), decSet(6704, 3, 'z')])

// ---- exercise 4: decimals and brackets: A(px + q) = ..., mixtures A x + B(M - x) = D ----
const decBracket = (h: number, p: number, q: number, v: string) =>
  `${h < 0 ? '-' : ''}${dt(h)}(${join([{ neg: p < 0, s: Math.abs(p) === 1 ? v : `${Math.abs(p)}${v}` }, { neg: q < 0, s: `${Math.abs(q)}` }])})`
const decBracketSet = (seed: number, kind: number, v: string) => {
  const r = rng(seed)
  return () => {
    const x0 = nz(r, 1, 9)
    const a = hund(r)
    const p = between(r, 1, 4)
    const q = nz(r, 1, 9)
    if (kind === 0) return `${decBracket(a, p, q, v)}=${dside(a * (p * x0 + q))}`
    const b = hund(r)
    if (kind === 1) {
      // A(x + q) + B x = D
      const d = a * (x0 + q) + b * x0
      return d === 0 ? null : `${decBracket(a, 1, q, v)}${b < 0 ? '-' : '+'}${dv(b, v)}=${dside(d)}`
    }
    if (kind === 2) {
      // A x + B(M - x) = D: a mixture
      const m = between(r, 4, 12) * 10
      if (a === b) return null
      return `${dv(a, v)}${b < 0 ? '-' : '+'}${dt(b)}(${m}-${v})=${dside(a * x0 + b * (m - x0))}`
    }
    // A(px + q) = B x + D
    const d = a * (p * x0 + q) - b * x0
    if (a * p === b || d === 0) return null
    return `${decBracket(a, p, q, v)}=${join([dvterm(b, v), dterm(d)])}`
  }
}
const H4 = parts([decBracketSet(6801, 0, 'x'), decBracketSet(6802, 1, 'y'), decBracketSet(6803, 2, 'x'), decBracketSet(6804, 3, 'z')])

export const SETS62 = { H1, H2, H3, H4 }
export const EX62H: Exercise[] = [H1, H2, H3, H4].map((h, i) => buildEq62(String(i + 1), { shown: 11 + i, book: h.book, gen: h.gen }))
