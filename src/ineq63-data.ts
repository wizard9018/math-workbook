// Grade 9 6.3 exercise 1 (bank/G9-ch6/s3/items.json): label an inequality between two numbers as True or False (integers, fractions, decimals, pi).
// Lesson: write both numbers in the same form (a common denominator, or decimals for pi): one blank per number; then True or False.
// The 10 similar questions of every question are made here (not by Gemini) from small tables: the same kind of inequality, other numbers; the truth is computed.
// Imported by: quiz.tsx, check63.ts. Shape: exercise.ts.
import type { Exercise, Practice, Question } from './exercise'
import type { Calc, Lesson, Step, Tok } from './lessons'
import { lcm, pick } from './simplify-data'

type V = { k: 'int'; n: number } | { k: 'frac'; n: number; d: number } | { k: 'dec'; x: number } | { k: 'pi'; neg: boolean }
type Sym = '<' | '>' | '<=' | '>='
interface Item {
  l: V
  s: Sym
  r: V
}
const SYM_TEX: Record<Sym, string> = { '<': '<', '>': '>', '<=': '\\le', '>=': '\\ge' }
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a))

const val = (v: V): number => (v.k === 'int' ? v.n : v.k === 'frac' ? v.n / v.d : v.k === 'dec' ? v.x : v.neg ? -Math.PI : Math.PI)
const fracTex = (n: number, d: number) => (n < 0 ? '-' : '') + `\\frac{${Math.abs(n)}}{${d}}`
const frac2 = (n: number, d: number) => (d === 1 ? String(n) : fracTex(n, d))
const tex = (v: V): string => (v.k === 'int' ? String(v.n) : v.k === 'frac' ? fracTex(v.n, v.d) : v.k === 'dec' ? String(v.x) : v.neg ? '-\\pi' : '\\pi')
const texItem = (it: Item) => `${tex(it.l)} ${SYM_TEX[it.s]} ${tex(it.r)}`
const holds = (it: Item) => {
  const a = val(it.l)
  const b = val(it.r)
  const eq = Math.abs(a - b) < 1e-9
  return it.s === '<' ? a < b && !eq : it.s === '>' ? a > b && !eq : it.s === '<=' ? a < b || eq : a > b || eq
}
// a number as a fraction (decimals with one or two places), or null
const asFrac = (v: V): [number, number] | null => {
  if (v.k === 'frac') return [v.n, v.d]
  if (v.k === 'int') return [v.n, 1]
  if (v.k === 'dec') {
    const d = 10 ** (String(v.x).split('.')[1] ?? '').length
    const n = Math.round(v.x * d)
    const g = gcd(n, d)
    return [n / g, d / g]
  }
  return null
}

function lessonIneq(it: Item, key: string, idx: number): Lesson {
  const sym = SYM_TEX[it.s]
  const start: Tok[] = [{ id: 'a', tex: tex(it.l) }, { id: 's', tex: sym }, { id: 'b', tex: tex(it.r) }]
  const steps: Step[] = []
  const blanks: { id: string; from: string; calc: Calc }[] = []
  let A = tex(it.l)
  let B = tex(it.r)
  let va = val(it.l)
  let vb = val(it.r)
  const fa = asFrac(it.l)
  const fb = asFrac(it.r)
  const blank = (id: string, from: string, prompt: string, right: string, wr: string[], hint: string, salt: number) => {
    const [options, correct] = pick(right, wr.filter((w) => w !== right), idx + salt)
    blanks.push({ id, from, calc: { q: prompt, options, correct, hints: options.map((_, j) => (j === correct ? '' : hint)), spell: hint } })
  }
  if (fa && fb && (it.l.k !== 'int' || it.r.k !== 'int') && (fa[1] !== fb[1] || it.l.k === 'dec' || it.r.k === 'dec')) {
    // a common denominator
    const L = lcm(fa[1], fb[1])
    ;([['a', it.l, fa], ['b', it.r, fb]] as const).forEach(([id, v, f], i) => {
      const m = L / f[1]
      const right = frac2(f[0] * m, L)
      blank(`${id}1`, id, `$${tex(v)} = \\frac{?}{${L}}$`, right, [frac2(f[0] * m + 1, L), frac2(f[0], L), frac2(-f[0] * m, L), frac2(f[0] * m - 1, L)], `$${frac2(f[0], f[1])} = \\frac{${f[0]} \\cdot ${m}}{${f[1]} \\cdot ${m}}$`, i)
      if (id === 'a') A = right
      else B = right
    })
  } else if ((it.l.k === 'pi') !== (it.r.k === 'pi')) {
    // pi is about 3.14; a fraction is written as a decimal
    ;([['a', it.l], ['b', it.r]] as const).forEach(([id, v], i) => {
      if (v.k === 'int' || v.k === 'dec') return
      const x = val(v)
      const right = String(+x.toFixed(2))
      const wr = v.k === 'pi' ? [x < 0 ? '-3.41' : '3.41', x < 0 ? '-3' : '3', String(+(-x).toFixed(2)), x < 0 ? '-3.24' : '3.24'] : [String(+(x * 10).toFixed(2)), String(+(x / 10).toFixed(2)), String(+(-x).toFixed(2)), String(+(x + 0.1).toFixed(2))]
      const hint = v.k === 'pi' ? '$\\pi \\approx 3.14$' : `$${tex(v)} \\approx ${right}$`
      blank(`${id}1`, id, `$${tex(v)} \\approx ?$`, right, wr, hint, i)
      if (id === 'a') {
        A = right
        va = +x.toFixed(2)
      } else {
        B = right
        vb = +x.toFixed(2)
      }
    })
  }
  let line = ['a', 's', 'b']
  if (blanks.length) {
    const ia = blanks.some((b) => b.id === 'a1') ? 'a1' : 'a'
    const ib = blanks.some((b) => b.id === 'b1') ? 'b1' : 'b'
    const res: Tok[] = [{ id: ia, tex: A }, { id: 's1', tex: sym }, { id: ib, tex: B }]
    steps.push({ focus: line, result: res[0], results: res, blanks, arrows: blanks.map((b) => ({ from: [b.from], to: [b.id] })), say: '', calcPrompt: 'Write both numbers in the same form.', calc: blanks[0].calc })
    line = [ia, 's1', ib]
  }
  // True or False? the hint is the real comparison
  const truth = holds(it)
  const rel = Math.abs(va - vb) < 1e-9 ? '=' : va < vb ? '<' : '>'
  const prompt = `$${A} ${sym} ${B}$`
  const hint = `$${A} ${rel} ${B}$`
  const o = ['\\text{True}', '\\text{False}']
  const right = truth ? 0 : 1
  steps.push({ focus: line, result: { id: 'fin', tex: `${A} ${sym} ${B} \\;\\to\\; ${o[right]}` }, arrows: [], say: '', calcPrompt: prompt, calc: { q: prompt, options: o, correct: right, hints: o.map((_, j) => (j === right ? '' : hint)), spell: hint } })
  return { key: `ineq63-${key}`, label: key, source: `Grade 9, 6.3 exercise 1${key}`, title: 'True or false', prompt: 'Is it true?', answer: o[right], start, steps, review: { heading: 'Inequalities', rows: [] } }
}

// ---- the 10 textbook questions and the pools of the similar ones ----
const I = (n: number): V => ({ k: 'int', n })
const F = (n: number, d: number): V => ({ k: 'frac', n, d })
const D = (x: number): V => ({ k: 'dec', x })
const P = (neg = false): V => ({ k: 'pi', neg })
const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i)
const SYMS: Sym[] = ['<', '>', '<=', '>=']
const dec1 = (d: number) => D(+(d / 10).toFixed(1))
const fr = (a: (p: number) => V, b: (q: number) => V, syms: Sym[]): Item[] => range(2, 9).flatMap((p) => range(2, 9).filter((q) => q !== p).flatMap((q) => syms.map((s) => ({ l: a(p), s, r: b(q) }))))
const BOOK: [string, Item, Item[]][] = [
  ['a', { l: I(5), s: '<=', r: I(5) }, range(1, 12).flatMap((n) => (['<=', '>='] as Sym[]).map((s) => ({ l: I(n), s, r: I(n) })))],
  ['b', { l: I(5), s: '<=', r: I(-5) }, range(1, 12).flatMap((n) => SYMS.map((s) => ({ l: I(n), s, r: I(-n) })))],
  ['c', { l: I(-5), s: '<=', r: I(5) }, range(1, 12).flatMap((n) => SYMS.map((s) => ({ l: I(-n), s, r: I(n) })))],
  ['d', { l: I(5), s: '<', r: I(5) }, range(1, 12).flatMap((n) => (['<', '>'] as Sym[]).map((s) => ({ l: I(n), s, r: I(n) })))],
  ['e', { l: F(1, 3), s: '>', r: F(1, 4) }, fr((p) => F(1, p), (q) => F(1, q), ['<', '>'])],
  ['f', { l: F(-1, 3), s: '>', r: F(-1, 4) }, fr((p) => F(-1, p), (q) => F(-1, q), ['<', '>'])],
  ['g', { l: D(0.3), s: '<=', r: F(1, 3) }, range(1, 9).flatMap((d) => range(2, 9).flatMap((k) => (['<=', '>=', '<', '>'] as Sym[]).map((s) => ({ l: dec1(d), s, r: F(1, k) }))))],
  ['h', { l: D(-0.3), s: '<=', r: F(-1, 3) }, range(1, 9).flatMap((d) => range(2, 9).flatMap((k) => (['<=', '>=', '<', '>'] as Sym[]).map((s) => ({ l: dec1(-d), s, r: F(-1, k) }))))],
  ['i', { l: P(), s: '>', r: I(3) }, range(2, 5).flatMap((n) => SYMS.map((s) => ({ l: P(), s, r: I(n) })))],
  ['j', { l: P(true), s: '>', r: F(-1, 3) }, [...range(2, 9).flatMap((k) => SYMS.map((s) => ({ l: P(true), s, r: F(-1, k) }))), ...range(2, 5).flatMap((n) => SYMS.map((s) => ({ l: P(true), s, r: I(-n) })))]],
]
const shuffled = <T,>(a: T[], seed: number): T[] => {
  let s = seed
  const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32)
  return [...a].sort(() => r() - 0.5)
}

function build(): Exercise {
  const questions: Question[] = BOOK.map(([part, book, pool], idx): Question => {
    const seen = new Set([texItem(book)])
    const bank = shuffled(pool, 6300 + idx).filter((x) => !seen.has(texItem(x)) && !!seen.add(texItem(x))).slice(0, 10)
    const make = (x: Item, key: string, k: number): Practice => ({ tex: texItem(x), choices: ['\\text{True}', '\\text{False}'], correct: holds(x) ? 0 : 1, why: '', lesson: () => lessonIneq(x, key, idx + k) })
    return { part, ...make(book, part, 0), practice: bank.map((x, k) => make(x, `${part}${k + 1}`, k + 1)) }
  })
  return { no: 1, sec: '6.3', prompt: 'Label the inequality as True or False.', mathChoices: true, questions }
}

export const EX_INEQ63 = [build()]
