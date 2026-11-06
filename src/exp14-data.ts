// Grade 9 1.4 Exponents (bank/G9-ch1/final/s4, mineru G9 Chapter 1): exercises 3, 4, 8, 9, 10, 11 (1, 2, 7 and 12-14 are left out).
//   3 the sign of a power (x > 0), 4 order powers from least to greatest (x > 1), 8 evaluate powers, 9 the zero exponent, 10 write a power as a repeated factor, 11 compare two powers (<, > or =)
// plus one challenge exercise for each (bigger exponents, more terms; optional extra practice with its own progress, shown as no 23, 24, 28, 29, 30, 31).
// Every question is multiple choice; the lessons are blanks (lessonWp). The similar questions are other numbers of the same kind; every answer and step is computed here.
// Imported by: quiz.tsx, check14.ts. Shape: exercise.ts.
import { build } from './graph42-data'
import { text } from './seq41-data'
import { N, hardList, idOf, mk, numW, rows } from './sqrt12-data'
import type { Item } from './sqrt12-data'

type St = Item['steps'][number]
const T = (s: string) => `\\text{${s}}`
const bt = (r: () => number, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1))
const pick = <X,>(r: () => number, xs: X[]): X => xs[Math.floor(r() * xs.length)]
const step = (label: string, lhs: string, ans: string, wrongs: string[], hint: string): St => [label, lhs, ans, `$${lhs} \\square$`, wrongs.filter((w) => w !== ans), hint]
// a generator that tries again until the item passes `ok`
const until = (make: () => Item | null): Item => {
  for (let k = 0; k < 300; k++) {
    const it = make()
    if (it) return it
  }
  throw new Error('no item')
}

// ================= exercise 8: evaluate powers =================
interface Tm {
  out: boolean // a minus sign in front of the power
  base: number // may be negative: then it is written in brackets
  n: number
}
const baseTex = (t: Tm) => (t.base < 0 ? `(${t.base})` : `${t.base}`)
const powTex = (t: Tm) => `${baseTex(t)}^{${t.n}}`
const tmTex = (t: Tm) => `${t.out ? '-' : ''}${powTex(t)}`
const tv = (t: Tm) => (t.out ? -1 : 1) * t.base ** t.n
type Ex8 = { op: 1 | -1; t: Tm }[]
const par = (v: number) => (v < 0 ? `(${N(v)})` : N(v))
function tmSteps(t: Tm): St[] {
  const p = t.base ** t.n
  const negBase = t.base < 0
  const hint = negBase
    ? `The base is $${t.base}$: write it ${t.n} times. ${t.n % 2 ? 'An odd' : 'An even'} number of negative factors gives a ${p < 0 ? 'negative' : 'positive'} answer.`
    : `Write $${t.base}$ ${t.n} times and multiply.`
  const out: St[] = [step(negBase ? 'The power of a negative base.' : 'Multiply the base by itself.', `${powTex(t)} =`, N(p), numW(p, [t.base * t.n]), hint)]
  if (t.out) out.push(step('The minus sign in front stays.', `${tmTex(t)} =`, N(-p), numW(-p, [p]), 'The minus sign is in front of the power: change the sign of the power.'))
  return out
}
function item8(e: Ex8): Item {
  const tex = e.map(({ op, t }, i) => (i ? ` ${op > 0 ? '+' : '-'} ` : '') + tmTex(t)).join('')
  const total = e.reduce((s, { op, t }) => s + op * tv(t), 0)
  const steps = e.flatMap(({ t }) => tmSteps(t))
  if (e.length > 1) {
    const lhs = e.map(({ op, t }, i) => (i ? ` ${op > 0 ? '+' : '-'} ${par(tv(t))}` : N(tv(t)))).join('') + ' ='
    steps.push(step('Put the values together.', lhs, N(total), numW(total, [e.reduce((s, { t }) => s + Math.abs(tv(t)), 0)]), 'Add and subtract the values from left to right.'))
  }
  return { q: `${text('Evaluate: ')}${tex}`, short: tex, ans: N(total), wrong: numW(total), steps }
}
const t8 = (out: boolean, base: number, n: number): { op: 1 | -1; t: Tm } => ({ op: 1, t: { out, base, n } })
// a random expression of k terms; the later terms are joined by + or -, only the first may have its own minus sign
const rand8 = (r: () => number, k: number, o: { bLo: number; bHi: number; nLo: number; nHi: number; negP: number; outP: number; cap: number }): Item =>
  until(() => {
    const e: Ex8 = Array.from({ length: k }, (_, i) => ({
      op: i && r() < 0.5 ? -1 : 1,
      t: { out: i === 0 && r() < o.outP, base: bt(r, o.bLo, o.bHi) * (r() < o.negP ? -1 : 1), n: bt(r, o.nLo, o.nHi) },
    }))
    return e.every(({ t }) => Math.abs(t.base) ** t.n <= o.cap) ? item8(e) : null
  })
const E8: Item[][] = [
  [item8([t8(false, 4, 3)]), ...hardList(81, 14, (r) => rand8(r, 1, { bLo: 2, bHi: 9, nLo: 2, nHi: 5, negP: 0, outP: 0, cap: 2000 }))],
  [item8([t8(true, 5, 2)]), ...hardList(82, 14, (r) => rand8(r, 1, { bLo: 2, bHi: 9, nLo: 2, nHi: 4, negP: 0, outP: 1, cap: 800 }))],
  [item8([t8(false, -2, 4)]), ...hardList(83, 14, (r) => rand8(r, 1, { bLo: 2, bHi: 9, nLo: 2, nHi: 5, negP: 1, outP: 0, cap: 2000 }))],
  [item8([t8(true, 4, 3), { op: -1, t: { out: false, base: -5, n: 2 } }]), ...hardList(84, 14, (r) => rand8(r, 2, { bLo: 2, bHi: 6, nLo: 2, nHi: 4, negP: 0.5, outP: 0.6, cap: 700 }))],
  [item8([t8(true, -2, 5), { op: 1, t: { out: false, base: -4, n: 2 } }, { op: -1, t: { out: false, base: -1, n: 6 } }]), ...hardList(85, 14, (r) => rand8(r, 3, { bLo: 1, bHi: 5, nLo: 2, nHi: 6, negP: 0.5, outP: 0.6, cap: 400 }))],
]
const H8: Item[][] = [
  hardList(181, 15, (r) => rand8(r, 1, { bLo: 2, bHi: 12, nLo: 2, nHi: 6, negP: 0.5, outP: 0.5, cap: 100000 })),
  hardList(182, 15, (r) => rand8(r, 2, { bLo: 2, bHi: 9, nLo: 3, nHi: 5, negP: 0.5, outP: 0.5, cap: 6000 })),
  hardList(183, 15, (r) => rand8(r, 3, { bLo: 1, bHi: 9, nLo: 2, nHi: 5, negP: 0.5, outP: 0.5, cap: 6000 })),
  hardList(184, 15, (r) => rand8(r, 4, { bLo: 1, bHi: 7, nLo: 2, nHi: 6, negP: 0.5, outP: 0.5, cap: 4000 })),
]

// ================= exercise 9: the zero exponent =================
interface Z {
  out: boolean
  b: string // the base as written (a number, a letter or an expression)
  paren: boolean // written in brackets
}
const zTex = (z: Z) => `${z.out ? '-' : ''}${z.paren ? `(${z.b})` : z.b}^{0}`
type Ez = { op: 1 | -1; z: Z }[]
interface Nest {
  terms: Ez
  outer: 'none' | 'zero' | 'minus' // just the sum, or (sum)^0, or -(sum)
  neg: boolean // a minus sign in front of the power (sum)^0
  cond: string // what is said about the letters
}
const sumTex = (e: Ez) => e.map(({ op, z }, i) => (i ? ` ${op > 0 ? '+' : '-'} ` : '') + zTex(z)).join('')
function itemZ(n: Nest): Item {
  const vals = n.terms.map(({ op, z }) => op * (z.out ? -1 : 1))
  const total = vals.reduce((s, v) => s + v, 0)
  const sums = sumTex(n.terms)
  const tex = n.outer === 'zero' ? `${n.neg ? '-' : ''}\\left(${sums}\\right)^{0}` : n.outer === 'minus' ? `-\\left(${sums}\\right)` : sums
  const steps: St[] = []
  n.terms.forEach(({ z }) => {
    steps.push(step('Anything except 0 to the power 0 is 1.', `${z.paren ? `(${z.b})` : z.b}^{0} =`, '1', ['0', '-1', '2'], 'A power with exponent 0 is 1 (the base is not 0).'))
    if (z.out) steps.push(step('The minus sign in front stays.', `${zTex(z)} =`, '-1', ['1', '0', '-2'], 'The minus sign is in front of the power: $-1$.'))
  })
  if (n.terms.length > 1) {
    const lhs = n.terms.map(({ op, z }, i) => (i ? ` ${op > 0 ? '+' : '-'} ` : '') + (i ? (z.out ? '(-1)' : '1') : z.out ? '-1' : '1')).join('') + ' ='
    steps.push(step('Put the values together.', lhs, N(total), numW(total, [n.terms.length]), 'Add and subtract the values from left to right.'))
  }
  let ans = total
  if (n.outer === 'zero') {
    ans = n.neg ? -1 : 1
    steps.push(step('The sum is not 0, so its power 0 is 1.', `(${N(total)})^{0} =`, '1', ['0', N(total), '-1'], 'The base is not 0 here, so the power is 1.'))
    if (n.neg) steps.push(step('The minus sign in front stays.', `-(${N(total)})^{0} =`, '-1', ['1', '0', N(total)], 'The minus sign is in front of the power.'))
  }
  if (n.outer === 'minus') {
    ans = -total
    steps.push(step('The minus sign changes the sign of the sum.', `-(${N(total)}) =`, N(-total), numW(-total, [total]), 'Change the sign of the value in brackets.'))
  }
  const q = `${text('Evaluate' + (n.cond ? `, where $${n.cond}$` : '') + ': ')}${tex}`
  return { q, short: tex, ans: N(ans), wrong: numW(ans, ['0', '1', '-1']), steps }
}
const NUMB = ['2', '3', '4', '5', '6', '7', '8', '9', '11', '12', '19', '25']
const LET = ['x', 'y', 'a', 'b', 'm', 'n', 'p', 'q']
const zNum = (r: () => number, out: boolean): Z => (r() < 0.2 ? { out, b: `-${pick(r, NUMB)}`, paren: true } : { out, b: pick(r, NUMB), paren: false })
const lets = (r: () => number, k: number): string[] => {
  const pool = [...LET]
  return Array.from({ length: k }, () => pool.splice(bt(r, 0, pool.length - 1), 1)[0])
}
const ne = (v: string[]) => v.map((x) => `${x} \\ne 0`).join(', ')
const zNumList = (r: () => number, k: number, outP: number): Ez => Array.from({ length: k }, (_, i) => ({ op: i && r() < 0.5 ? -1 : 1, z: zNum(r, i === 0 ? r() < outP : false) }))
const zLetList = (r: () => number, vs: string[], outP: number): Ez => vs.map((v, i) => ({ op: i && r() < 0.5 ? -1 : 1, z: { out: i === 0 && r() < outP, b: v, paren: false } }))
const zOne = (b: string, out = false, paren = false): Ez => [{ op: 1, z: { out, b, paren } }]
const E9: Item[][] = [
  [itemZ({ terms: zOne('19'), outer: 'none', neg: false, cond: '' }), ...hardList(91, 14, (r) => itemZ({ terms: zNumList(r, 1, 0), outer: 'none', neg: false, cond: '' }))],
  [itemZ({ terms: zOne('9', true), outer: 'none', neg: false, cond: '' }), ...hardList(92, 14, (r) => itemZ({ terms: zNumList(r, 1, 1), outer: 'none', neg: false, cond: '' }))],
  [itemZ({ terms: [...zOne('4'), { op: 1, z: { out: false, b: '7', paren: false } }], outer: 'none', neg: false, cond: '' }), ...hardList(93, 14, (r) => itemZ({ terms: zNumList(r, 2, 0.4), outer: 'none', neg: false, cond: '' }))],
  [
    itemZ({ terms: [{ op: 1, z: { out: true, b: 'x', paren: false } }, { op: -1, z: { out: false, b: 'y', paren: false } }], outer: 'none', neg: false, cond: ne(['x', 'y']) }),
    ...hardList(94, 14, (r) => { const v = lets(r, 2); return itemZ({ terms: zLetList(r, v, 0.7), outer: 'none', neg: false, cond: ne(v) }) }),
  ],
  [
    itemZ({ terms: [...zOne('5'), { op: 1, z: { out: false, b: '8', paren: false } }], outer: 'zero', neg: false, cond: '' }),
    ...hardList(95, 14, (r) => itemZ({ terms: zNumList(r, 2, 0), outer: 'zero', neg: r() < 0.4, cond: '' })),
  ],
  [
    itemZ({ terms: [...zOne('-5', false, true), { op: 1, z: { out: false, b: '7', paren: false } }], outer: 'minus', neg: false, cond: '' }),
    ...hardList(96, 14, (r) => itemZ({ terms: zNumList(r, 2, 0), outer: 'minus', neg: false, cond: '' })),
  ],
]
const H9: Item[][] = [
  hardList(191, 15, (r) => itemZ({ terms: zNumList(r, bt(r, 3, 4), 0.6), outer: 'none', neg: false, cond: '' })),
  hardList(192, 15, (r) => { const v = lets(r, bt(r, 3, 4)); return itemZ({ terms: zLetList(r, v, 0.6), outer: 'none', neg: false, cond: ne(v) }) }),
  hardList(193, 15, (r) => {
    const [x, y] = lets(r, 2)
    const form = bt(r, 0, 3)
    const b = form === 0 ? `${x}-${y}` : form === 1 ? `${x}+${y}` : form === 2 ? `-${x}-${y}` : `${x}${y}`
    const c = form === 0 ? `${x} \\ne ${y}` : form === 3 ? `${x} \\ne 0, ${y} \\ne 0` : `${x} + ${y} \\ne 0`
    return itemZ({ terms: zOne(b, r() < 0.5, true), outer: 'none', neg: false, cond: c })
  }),
  hardList(194, 15, (r) => itemZ({ terms: zNumList(r, 3, 0), outer: pick(r, ['zero', 'minus'] as const), neg: r() < 0.5, cond: '' })),
]

// ================= exercise 10: write a power as a repeated factor =================
interface Rp {
  out: boolean
  b: string // the base: a number, a letter, or a minus sign and one of them
  n: number
}
function item10(p: Rp): Item {
  const neg = p.b.startsWith('-')
  const f = neg ? `(${p.b})` : p.b
  const pow = `${f}^{${p.n}}`
  const tex = `${p.out ? '-' : ''}${pow}`
  const rep = Array(p.n).fill(f).join(' \\times ')
  const ans = p.out ? `-(${rep})` : rep
  const bare = neg ? p.b.slice(1) : p.b
  const wrongRep = [
    `${f} \\times ${p.n}`,
    Array(p.n - 1).fill(f).join(' \\times '),
    Array(p.n + 1).fill(f).join(' \\times '),
    Array(p.n).fill(String(p.n)).join(' \\times '),
    neg ? Array(p.n).fill(bare).join(' \\times ') : Array(p.n).fill(`(-${p.b})`).join(' \\times '),
  ]
  const steps: St[] = [step('The base is used as a factor as many times as the exponent says.', `${pow} =`, rep, wrongRep, `The base is $${f}$ and the exponent is ${p.n}: write $${f}$ ${p.n} times.`)]
  if (p.out) steps.push(step('The minus sign in front stays.', `${tex} =`, ans, [`(${rep})`, `-${rep}`, `-(${wrongRep[4]})`], 'The minus sign is in front of the whole power: the factors go in brackets.'))
  const wrong = p.out ? [`(${rep})`, `-${rep}`, ...wrongRep.map((w) => `-(${w})`)] : wrongRep
  return { q: `${text('Write as a repeated factor: ')}${tex}`, short: tex, ans, wrong: wrong.filter((w) => w !== ans), steps }
}
const NB = ['2', '3', '4', '5', '6', '7', '8', '9']
const rp = (out: boolean, kind: 'num' | 'neg' | 'let' | 'negLet', lo: number, hi: number) => (r: () => number) =>
  item10({ out, n: bt(r, lo, hi), b: kind === 'num' ? pick(r, NB) : kind === 'neg' ? `-${pick(r, NB)}` : kind === 'let' ? pick(r, LET) : `-${pick(r, LET)}` })
const E10: Item[][] = [
  [item10({ out: false, b: '3', n: 4 }), ...hardList(101, 14, rp(false, 'num', 3, 6))],
  [item10({ out: false, b: '-2', n: 5 }), ...hardList(102, 14, rp(false, 'neg', 3, 6))],
  [item10({ out: true, b: '5', n: 2 }), ...hardList(103, 14, rp(true, 'num', 2, 5))],
  [item10({ out: false, b: 'y', n: 4 }), ...hardList(104, 14, rp(false, 'let', 3, 6))],
  [item10({ out: false, b: '-b', n: 3 }), ...hardList(105, 14, rp(false, 'negLet', 3, 6))],
  [item10({ out: true, b: '2', n: 4 }), ...hardList(106, 14, rp(true, 'num', 3, 6))],
]
const H10: Item[][] = [
  hardList(201, 15, rp(false, 'num', 7, 10)),
  hardList(202, 15, rp(false, 'neg', 6, 9)),
  hardList(203, 15, rp(true, 'neg', 3, 7)),
  hardList(204, 15, (r) => rp(r() < 0.5, r() < 0.5 ? 'negLet' : 'let', 5, 9)(r)),
]

// ================= exercise 11: compare two powers =================
// a power of a fraction p/q (q = 1 for a whole number), with an optional minus sign in front and an exponent n (also 0)
interface Pw {
  out: boolean
  p: number // the numerator, negative for a negative base
  q: number
  n: number
}
type Fr = [bigint, bigint]
const valF = (w: Pw): Fr => [(w.out ? -1n : 1n) * BigInt(w.p) ** BigInt(w.n), BigInt(w.q) ** BigInt(w.n)]
const gcdB = (x: bigint, y: bigint): bigint => (y ? gcdB(y, x % y) : x < 0n ? -x : x)
const fTex = ([a, b]: Fr) => {
  const d = gcdB(a, b) || 1n
  const [n, m] = [a / d, b / d]
  return m === 1n ? String(n) : `${n < 0n ? '-' : ''}\\frac{${n < 0n ? -n : n}}{${m}}`
}
const cmpF = (x: Fr, y: Fr) => (x[0] * y[1] < y[0] * x[1] ? '<' : x[0] * y[1] > y[0] * x[1] ? '>' : '=')
const basePw = (w: Pw) => (w.q === 1 ? (w.p < 0 ? `(${w.p})` : String(w.p)) : `\\left(${w.p < 0 ? '-' : ''}\\frac{${Math.abs(w.p)}}{${w.q}}\\right)`)
const pwTex = (w: Pw) => `${w.out ? '-' : ''}${basePw(w)}^{${w.n}}`
function item11(a: Pw, b: Pw): Item {
  const va = valF(a)
  const vb = valF(b)
  const ans = cmpF(va, vb)
  const q = `${text('Use <, > or = to write a true sentence: ')}${pwTex(a)} \\; \\underline{\\quad} \\; ${pwTex(b)}`
  const valStep = (w: Pw, side: string): St => {
    const v = valF(w)
    const hint = w.n === 0 ? 'A power with exponent 0 is 1; then look at the minus sign in front.' : `Work out the power${w.out ? ' first, then use the minus sign in front' : ''}.`
    return step(`Work out the ${side} side.`, `${pwTex(w)} =`, fTex(v), [fTex([-v[0], v[1]]), fTex([BigInt(w.p) * BigInt(w.n), BigInt(w.q)]), fTex([BigInt(w.p) ** BigInt(w.n), 1n])], hint)
  }
  const S = ['<', '>', '=']
  const steps = [valStep(a, 'left'), valStep(b, 'right'), step('Compare the two values.', `${fTex(va)} \\; \\underline{\\quad} \\; ${fTex(vb)}`, ans, S, 'Which value is greater, or are they equal?')]
  return { q, short: `${pwTex(a)}, ${pwTex(b)}`, ans, wrong: S.filter((s) => s !== ans), steps, plain: ['<', '=', '>'] }
}
const P = (p: number, n: number, out = false, q = 1): Pw => ({ out, p, q, n })
const cp = (gen: () => [Pw, Pw], ok: (a: Pw, b: Pw) => boolean = () => true): Item =>
  until(() => {
    const [a, b] = gen()
    return ok(a, b) && pwTex(a) !== pwTex(b) ? item11(a, b) : null
  })
const FRC: [number, number][] = [[1, 2], [2, 3], [3, 4], [1, 3], [3, 5], [2, 5], [5, 6], [4, 5], [5, 8], [3, 8], [1, 4], [4, 7]]
const E11: Item[][] = [
  [item11(P(3, 3), P(5, 2)), ...hardList(111, 14, (r) => cp(() => [P(bt(r, 2, 6), bt(r, 2, 5)), P(bt(r, 2, 6), bt(r, 2, 5))]))],
  [item11(P(-3, 2), P(3, 2, true)), ...hardList(112, 14, (r) => { const b = bt(r, 2, 7); const n = bt(r, 2, 5); return cp(() => (r() < 0.5 ? [P(-b, n), P(b, n, true)] : [P(b, n, true), P(-b, n)])) })],
  [item11(P(5, 0, true), P(-5, 0)), ...hardList(113, 14, (r) => cp(() => { const b = bt(r, 2, 9); const k = bt(r, 0, 2); return k === 0 ? [P(b, 0, true), P(-b, 0)] : k === 1 ? [P(b, 0), P(b, bt(r, 1, 3), true)] : [P(-b, 0), P(b, 0)] }))],
  [item11(P(-3, 4), P(-2, 5)), ...hardList(114, 14, (r) => cp(() => [P(-bt(r, 2, 5), bt(r, 2, 5)), P(-bt(r, 2, 5), bt(r, 2, 5))]))],
  [item11(P(2, 2, false, 3), P(3, 2, false, 4)), ...hardList(115, 14, (r) => cp(() => { const [p, q] = pick(r, FRC); const [s, t] = pick(r, FRC); return [P(p, bt(r, 2, 3), false, q), P(s, bt(r, 2, 3), false, t)] }))],
  [item11(P(-2, 2, false, 3), P(-3, 2, false, 4)), ...hardList(116, 14, (r) => cp(() => { const [p, q] = pick(r, FRC); const [s, t] = pick(r, FRC); return [P(-p, bt(r, 2, 3), false, q), P(-s, bt(r, 2, 3), false, t)] }))],
]
const H11: Item[][] = [
  hardList(211, 15, (r) => cp(() => [P(bt(r, 2, 9), bt(r, 3, 6)), P(bt(r, 2, 9), bt(r, 3, 6))])),
  hardList(212, 15, (r) => cp(() => { const b = bt(r, 2, 9); const n = bt(r, 2, 6); return [P(r() < 0.5 ? -b : b, n, r() < 0.5), P(r() < 0.5 ? -b : b, n, r() < 0.5)] })),
  hardList(213, 15, (r) => cp(() => { const [p, q] = pick(r, FRC); const [s, t] = pick(r, FRC); return [P(r() < 0.5 ? -p : p, bt(r, 2, 4), r() < 0.3, q), P(r() < 0.5 ? -s : s, bt(r, 2, 4), r() < 0.3, t)] })),
  hardList(214, 15, (r) => cp(() => [P(bt(r, 2, 9), bt(r, 3, 8)), P(bt(r, 2, 9), bt(r, 2, 4), r() < 0.3)])),
]

// ================= exercise 3: the sign of a power (x > 0) =================
interface Fc {
  v: string // the letter
  neg: boolean // the base is -v
  out: boolean // a minus sign in front of the power
  n: number
}
const POS = T('Positive')
const NEG = T('Negative')
const SIGNS = [POS, NEG, T('Zero'), T('Cannot be determined')]
const fcTex = (f: Fc) => `${f.out ? '-' : ''}${f.neg ? `(-${f.v})` : f.v}^{${f.n}}`
const fcPow = (f: Fc) => `${f.neg ? `(-${f.v})` : f.v}^{${f.n}}`
const fcSign = (f: Fc) => (f.out ? -1 : 1) * (f.neg && f.n % 2 ? -1 : 1)
const sgText = (s: number) => (s < 0 ? NEG : POS)
const otherSigns = (s: string) => SIGNS.filter((x) => x !== s)
function item3(fs: Fc[]): Item {
  // several powers are the terms of a sum: a term with a minus in front is subtracted
  const tex = fs.map((f, i) => (i === 0 ? fcTex(f) : f.out ? `- ${fcTex(f).slice(1)}` : `+ ${fcTex(f)}`)).join(' ')
  const signs = fs.map(fcSign)
  const mixed = signs.some((s) => s !== signs[0]) // a positive and a negative term: the sizes decide
  const total = mixed ? 0 : signs[0]
  const totalText = total === 0 ? T('Cannot be determined') : sgText(total)
  const cond = [...new Set(fs.map((f) => f.v))].map((v) => `${v} > 0`).join(', ')
  const steps: St[] = []
  for (const f of fs) {
    const p = f.neg && f.n % 2 ? -1 : 1
    if (f.neg) steps.push(step('Is the exponent even or odd?', `${f.n}\\text{ is}`, T(f.n % 2 ? 'odd' : 'even'), [T(f.n % 2 ? 'even' : 'odd'), T('zero'), T('negative')], 'An even number can be divided by 2 with nothing left; an odd number cannot.'))
    steps.push(step(f.neg ? 'The sign of the power.' : 'A positive number to any power is positive.', `${fcPow(f)}\\text{ is}`, sgText(p), otherSigns(sgText(p)), f.neg ? `The base $-${f.v}$ is negative: an ${f.n % 2 ? 'odd' : 'even'} exponent gives a ${p < 0 ? 'negative' : 'positive'} power.` : `$${f.v} > 0$, so $${fcPow(f)}$ is positive.`))
    if (f.out) steps.push(step('The minus sign in front changes the sign.', `${fcTex(f)}\\text{ is}`, sgText(-p), otherSigns(sgText(-p)), 'The minus sign is in front of the power: positive becomes negative, negative becomes positive.'))
  }
  if (fs.length > 1) {
    const lhs = fs.map((f) => sgText(fcSign(f))).join(' + ') + ' ='
    steps.push(step('Add the terms.', lhs, totalText, otherSigns(totalText), mixed ? 'A positive and a negative term: the sizes are not known, so the sign cannot be determined.' : `Terms that are all ${total < 0 ? 'negative' : 'positive'} add up to a ${total < 0 ? 'negative' : 'positive'} number.`))
  }
  return { q: `${text(`Determine whether the value is positive, negative, zero, or cannot be determined, where $${cond}$: `)}\\\\ ${tex}`, short: tex, ans: totalText, wrong: otherSigns(totalText), steps, plain: SIGNS }
}
const fc = (r: () => number, o: { neg?: boolean; out?: boolean; nLo: number; nHi: number; even?: boolean; v?: string }): Fc => {
  let n = bt(r, o.nLo, o.nHi)
  if (o.even !== undefined && (n % 2 === 0) !== o.even) n += 1
  return { v: o.v ?? pick(r, LET), neg: o.neg ?? r() < 0.5, out: o.out ?? r() < 0.4, n }
}
const E3: Item[][] = [
  [item3([{ v: 'x', neg: true, out: false, n: 19 }]), ...hardList(31, 14, (r) => item3([fc(r, { neg: true, out: false, nLo: 3, nHi: 49, even: false })]))],
  [item3([{ v: 'x', neg: true, out: false, n: 18 }]), ...hardList(32, 14, (r) => item3([fc(r, { neg: true, out: false, nLo: 2, nHi: 48, even: true })]))],
  [item3([{ v: 'x', neg: true, out: true, n: 19 }]), ...hardList(33, 14, (r) => item3([fc(r, { neg: true, out: true, nLo: 2, nHi: 49 })]))],
  [item3([{ v: 'm', neg: false, out: true, n: 16 }]), ...hardList(34, 14, (r) => item3([fc(r, { neg: false, out: true, nLo: 2, nHi: 50 })]))],
  [item3([{ v: 'a', neg: true, out: false, n: 31 }]), ...hardList(35, 14, (r) => item3([fc(r, { nLo: 2, nHi: 50 })]))],
]
const H3: Item[][] = [
  hardList(131, 15, (r) => { const [x, y] = lets(r, 2); return item3([fc(r, { v: x, nLo: 2, nHi: 50 }), fc(r, { v: y, nLo: 2, nHi: 50 })]) }),
  hardList(132, 15, (r) => item3(lets(r, 3).map((x) => fc(r, { v: x, nLo: 2, nHi: 50 })))),
  hardList(133, 15, (r) => item3(lets(r, 4).map((x) => fc(r, { v: x, nLo: 3, nHi: 60 })))),
]

// ================= exercise 4: order powers from least to greatest (x > 1) =================
interface Or {
  v: string
  neg: boolean
  out: boolean
  n: number
}
const orSign = (o: Or) => (o.out ? -1 : 1) * (o.neg && o.n % 2 ? -1 : 1)
const orTex = (o: Or) => `${o.out ? '-' : ''}${o.neg ? `(-${o.v})` : o.v}^{${o.n}}`
const orKey = (o: Or) => orSign(o) * 2 ** o.n // x > 1: the sign and the exponent decide the order
const simp = (o: Or) => `${orSign(o) < 0 ? '-' : ''}${o.v}^{${o.n}}`
function item4(os: Or[], v: string): Item {
  const sorted = [...os].sort((a, b) => orKey(a) - orKey(b))
  const list = (xs: Or[]) => xs.map(orTex).join(',\\ ')
  const ans = list(sorted)
  const swaps = sorted.slice(0, -1).map((_, i) => { const c = [...sorted]; [c[i], c[i + 1]] = [c[i + 1], c[i]]; return list(c) })
  const byExp = list([...os].sort((a, b) => a.n - b.n || orSign(a) - orSign(b)))
  const wrong = [...new Set([list([...sorted].reverse()), byExp, ...swaps])].filter((w) => w !== ans)
  const steps: St[] = os.map((o) => step('Simplify the term.', `${orTex(o)} =`, simp(o), [`${orSign(o) < 0 ? '' : '-'}${o.v}^{${o.n}}`, `${o.v}^{${o.n + 1}}`, `-${o.v}^{${o.n + 1}}`], o.neg ? `The base is negative: an ${o.n % 2 ? 'odd' : 'even'} exponent gives a ${o.n % 2 ? 'negative' : 'positive'} power${o.out ? ', and the minus sign in front changes it' : ''}.` : 'The exponent belongs to the letter only; the minus sign in front stays.'))
  steps.push(step('Order them: negative terms first (the bigger the exponent, the smaller), then the positive terms.', `${os.map(simp).join(',\\ ')}\\ \\to`, ans, wrong, `Since $${v} > 1$, a higher power is farther from 0: more negative for a negative term, greater for a positive one.`))
  return { q: `${text(`Assume that $${v} > 1$. In order from least to greatest arrange the following: `)}${list(os)}`, short: list(os), ans, wrong, steps }
}
const ord = (r: () => number, k: number, nLo: number, nHi: number): Item =>
  until(() => {
    const v = pick(r, ['x', 'a', 'b', 'm', 'y'])
    const os: Or[] = Array.from({ length: k }, () => ({ v, neg: r() < 0.6, out: r() < 0.4, n: bt(r, nLo, nHi) }))
    return new Set(os.map(orKey)).size === k && os.some((o) => orSign(o) < 0) && os.some((o) => orSign(o) > 0) ? item4(os, v) : null
  })
const E4: Item[][] = [
  [item4([{ v: 'x', neg: true, out: false, n: 5 }, { v: 'x', neg: true, out: false, n: 2 }, { v: 'x', neg: false, out: true, n: 2 }, { v: 'x', neg: true, out: true, n: 3 }], 'x'), ...hardList(41, 14, (r) => ord(r, 4, 2, 6))],
  [item4([{ v: 'b', neg: true, out: false, n: 3 }, { v: 'b', neg: true, out: false, n: 6 }, { v: 'b', neg: false, out: true, n: 5 }, { v: 'b', neg: true, out: true, n: 5 }], 'b'), ...hardList(42, 14, (r) => ord(r, 4, 2, 9))],
]
const H4: Item[][] = [hardList(141, 15, (r) => ord(r, 5, 2, 12)), hardList(142, 15, (r) => ord(r, 6, 2, 15))]

// ================= the exercises =================
export const EX_EXP14 = [
  build(3, 'Choose the answer.', rows(E3), mk, idOf, 'Sign of a power', 14300, '1.4'),
  build(4, 'Choose the answer.', rows(E4), mk, idOf, 'Order the powers', 14400, '1.4'),
  build(8, 'Choose the answer.', rows(E8), mk, idOf, 'Evaluate powers', 14800, '1.4'),
  build(9, 'Choose the answer.', rows(E9), mk, idOf, 'The zero exponent', 14900, '1.4'),
  build(10, 'Choose the answer.', rows(E10), mk, idOf, 'Repeated factor', 15000, '1.4'),
  build(11, 'Choose the answer.', rows(E11), mk, idOf, 'Compare powers', 15100, '1.4'),
]
export const EX_EXP14H = [
  build(23, 'Choose the answer.', rows(H3), mk, idOf, 'Sign of a power', 14323, '1.4'),
  build(24, 'Choose the answer.', rows(H4), mk, idOf, 'Order the powers', 14424, '1.4'),
  build(28, 'Choose the answer.', rows(H8), mk, idOf, 'Evaluate powers', 14828, '1.4'),
  build(29, 'Choose the answer.', rows(H9), mk, idOf, 'The zero exponent', 14929, '1.4'),
  build(30, 'Choose the answer.', rows(H10), mk, idOf, 'Repeated factor', 15030, '1.4'),
  build(31, 'Choose the answer.', rows(H11), mk, idOf, 'Compare powers', 15131, '1.4'),
]
