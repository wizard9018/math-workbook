// Grade 9 1.6 Product and quotient rules (exercises 3 to 9) and 1.7 Power rules (exercises 3 to 11) (bank/G9-ch1/final/s6, s7; 1.6 exercises 1, 2 and 1.7 exercises 1, 2 are left out).
//   1.6: 3 which expression equals 1, 4 zero exponents, 5 multiply powers, 6 divide powers, 7 multiply and divide, 8 simplify then evaluate, 9 variable exponents
//   1.7: 3 power of a power, 4 power of a product or quotient, 5 positive or negative, 6 evaluate, 7 write as a power of 2, 8 simplify then evaluate, 9 estimate with 2^10 = 1000, 10 variable exponent, 11 solve for x
// plus one challenge exercise for each (more factors, bigger exponents; optional extra practice with its own progress, shown as no 23 to 29 and 23 to 31).
// "Simplify then evaluate" and the evaluations reuse the order-of-operations steps of order15-data.ts. The exponent rules are applied to a list of factors base^exponent (the exponent may be a x + b);
// every lesson step is one rewrite and every answer is computed here.
// Imported by: quiz.tsx, check67.ts. Shape: exercise.ts.
import { build } from './graph42-data'
import { text } from './seq41-data'
import { hardList, idOf, mk, numW, rows } from './sqrt12-data'
import type { Item } from './sqrt12-data'
import { R, make, parse, tex, walk } from './order15-data'
import type { Tpl } from './order15-data'

type St = Item['steps'][number]
const bt = (r: () => number, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1))
const pick = <X,>(r: () => number, xs: X[]): X => xs[Math.floor(r() * xs.length)]
const T = (s: string) => `\\text{${s}}`
const step = (label: string, lhs: string, ans: string, wrongs: string[], hint: string): St => [label, lhs, ans, `$${lhs} \\square$`, [...new Set(wrongs)].filter((w) => w !== ans), hint]
const shuffle = <X,>(r: () => number, xs: X[]): X[] => {
  const a = [...xs]
  for (let i = a.length - 1; i > 0; i--) {
    const j = bt(r, 0, i)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
const tryUntil = (f: () => Item | null): Item => {
  for (let k = 0; k < 3000; k++) {
    const it = f()
    if (it) return it
  }
  throw new Error('no item')
}

// ================= factors base^(a x + b) =================
interface Lin {
  a: number
  b: number
}
const L = (a: number, b: number): Lin => ({ a, b })
const lTex = (l: Lin) => {
  const x = l.a === 0 ? '' : l.a === 1 ? 'x' : l.a === -1 ? '-x' : `${l.a}x`
  return !x ? `${l.b}` : l.b === 0 ? x : `${x}${l.b > 0 ? '+' : '-'}${Math.abs(l.b)}`
}
const lPar = (l: Lin) => (l.a !== 0 && l.b !== 0 ? `(${lTex(l)})` : lTex(l))
const bTex = (b: number) => (b < 0 ? `(${b})` : String(b))
interface Fac {
  b: number
  e: Lin
}
const fTex = (f: Fac) => (f.e.a === 0 && f.e.b === 1 ? bTex(f.b) : `${bTex(f.b)}^{${lTex(f.e)}}`)
const prod = (fs: Fac[]) => fs.map(fTex).join(' \\times ')
const exprTex = (n: Fac[], d: Fac[]) => (d.length ? `\\frac{${prod(n)}}{${prod(d)}}` : prod(n))
const sameLin = (p: Lin, q: Lin) => p.a === q.a && p.b === q.b

// multiply and divide powers of the same bases: the exponents of every base are added (numerator) and subtracted (denominator)
function itemE(num: Fac[], den: Fac[], verb: string): Item {
  const bases = [...new Set([...num, ...den].map((f) => f.b))]
  const pieces = (b: number) => [...num.filter((f) => f.b === b).map((f) => ({ neg: false, e: f.e })), ...den.filter((f) => f.b === b).map((f) => ({ neg: true, e: f.e }))]
  const total = (b: number): Lin => pieces(b).reduce((s, p) => L(s.a + (p.neg ? -p.e.a : p.e.a), s.b + (p.neg ? -p.e.b : p.e.b)), L(0, 0))
  const sum = (b: number, flip: boolean) => pieces(b).map((p, i) => `${i ? (p.neg !== flip ? ' - ' : ' + ') : p.neg !== flip ? '-' : ''}${lPar(p.e)}`).join('')
  const asPowers = (f: (b: number) => string) => bases.map((b) => `${bTex(b)}^{${f(b)}}`).join(' \\times ')
  const step1 = asPowers((b) => sum(b, false))
  const answer = bases.map((b) => fTex({ b, e: total(b) })).join(' \\times ')
  const first = bases[0]
  const bump = (d: number) => bases.map((b, i) => fTex({ b, e: i ? total(b) : L(total(b).a, total(b).b + d) })).join(' \\times ')
  const flipped = bases.map((b) => fTex({ b, e: pieces(b).reduce((s, p) => L(s.a + p.e.a, s.b + p.e.b), L(0, 0)) })).join(' \\times ')
  const times = bases.map((b) => `${bTex(b)}^{${pieces(b).map((p) => lPar(p.e)).join(' \\times ')}}`).join(' \\times ')
  const mulBase = `${bTex(first * first)}^{${lTex(total(first))}}`
  const wrong = [...new Set([bump(1), bump(-1), flipped, times, mulBase])].filter((w) => w !== answer)
  const src = exprTex(num, den)
  const steps: St[] = [
    step('The same base: add the exponents when multiplying, subtract them when dividing.', `${src} =`, step1, [asPowers((b) => sum(b, true)), times, `(${bTex(first)} \\times ${bTex(first)})^{${sum(first, false)}}`], 'Keep each base. Multiplying powers adds the exponents; dividing subtracts them. A base alone has the exponent 1.'),
    step('Work out the exponents.', `${step1} =`, answer, [bump(1), bump(-1), flipped], 'Add and subtract the numbers in each exponent.'),
  ]
  return { q: `${text(verb)}${src}`, short: src, ans: answer, wrong, steps }
}
interface GO {
  nb: number // bases
  kn: [number, number] // factors of every base in the numerator
  kd: [number, number] // factors of every base in the denominator
  ex: [number, number]
  neg: number // chance that a base is negative
  bare: number // chance of exponent 1 (the base alone)
  zero: number // chance of exponent 0
  v: boolean // exponents are a x + b
}
const BASES = [2, 3, 4, 5, 6, 7, 8, 9]
const genE = (r: () => number, o: GO, verb: string): Item =>
  tryUntil(() => {
    const bs = shuffle(r, BASES).slice(0, o.nb).map((b) => (r() < o.neg ? -b : b))
    const num: Fac[] = []
    const den: Fac[] = []
    const e = (): Lin => (o.v ? L(pick(r, [0, 1, 1, 2, 3]), bt(r, -4, 8)) : L(0, r() < o.bare ? 1 : r() < o.zero ? 0 : bt(r, o.ex[0], o.ex[1])))
    for (const b of bs) {
      for (let k = bt(r, o.kn[0], o.kn[1]); k > 0; k--) num.push({ b, e: e() })
      for (let k = bt(r, o.kd[0], o.kd[1]); k > 0; k--) den.push({ b, e: e() })
    }
    const all = [...num, ...den]
    if (!num.length || all.length <= bs.length) return null
    const tot = (b: number): Lin => [...num.filter((f) => f.b === b).map((f) => f.e), ...den.filter((f) => f.b === b).map((f) => L(-f.e.a, -f.e.b))].reduce((s, x) => L(s.a + x.a, s.b + x.b), L(0, 0))
    const ok = bs.every((b) => (o.v ? !sameLin(tot(b), L(0, 0)) : tot(b).b >= 1 && tot(b).b <= 20))
    return ok ? itemE(shuffle(r, num), shuffle(r, den), verb) : null
  })
const MUL = 'Multiply and simplify. Leave the answer in exponential form: '
const DIV = 'Divide and simplify. Leave the answer in exponential form: '
const SMP = 'Simplify. Leave the answer in exponential form: '
const g = (o: Partial<GO>): GO => ({ nb: 1, kn: [2, 2], kd: [0, 0], ex: [2, 7], neg: 0, bare: 0, zero: 0, v: false, ...o })
const fromOpts = (os: GO[], seed: number, verb: string): Item[][] => os.map((o, i) => hardList(seed + i, 15, (r) => genE(r, o, verb)))

// ================= 1.6 =================
// exercise 3: which expression equals 1
function itemOne(r: () => number, wide: boolean): Item {
  return tryUntil(() => {
    const [a, b, c] = [bt(r, 2, 12), bt(r, 2, 12), bt(r, 2, 9)]
    const good = wide
      ? pick(r, [`(${a}*${b}+${c})^0`, `(${a}-${b}*${c})^0`, `(${a}^0+${b}^0)^0`, `(-${a}*${b}*${c})^0`, `(${a}+${b})^0*${c}^0`])
      : pick(r, [`(${a}*${b})^0`, `(${a}+${b})^0`, `(-${a})^0`, `${a}^0`, `(${a}*${b}*${c})^0`])
    const bad = shuffle(r, wide ? [`${a}*${b}^0+${c}`, `-(${a}+${b})^0`, `${a}^0+${b}^0`, `${a}+${b}^0*${c}`, `-${a}^0*${c}^0`, `(${a}+${b})^1`] : [`${a}*${b}^0`, `-${a}^0`, `${a}^0+${b}^0`, `-(${a}*${b})^0`, `${a}+${b}^0`, `(${a}*${b})^1`])
    const val = (s: string) => walk(parse(s)).value
    const picks = bad.filter((s) => val(s) !== 1).slice(0, 3)
    if (picks.length < 3 || val(good) !== 1) return null
    return { q: T('Which of the following expressions is equal to 1?') + '\\vphantom{' + good.replace(/[^0-9]/g, '') + '}', short: tex(parse(good)), ans: tex(parse(good)), wrong: picks.map((s) => tex(parse(s))), steps: walk(parse(good)).steps }
  })
}
const E16_3: Item[][] = [hardList(603, 15, (r) => itemOne(r, false))]
const H16_3: Item[][] = [hardList(623, 15, (r) => itemOne(r, true))]

const tpl = (ts: Tpl[], seed: number, verb: string): Item[][] => ts.map((t, i) => hardList(seed + i, 15, (r) => make(verb, () => t(r))))
// exercise 4: zero exponents
const Z0: Tpl[] = [
  (r) => `${bt(r, 2, 25)}^0`,
  (r) => `-${bt(r, 2, 25)}^0`,
  (r) => `(-${bt(r, 2, 25)})^0`,
  (r) => `${bt(r, 2, 9)}*${bt(r, 2, 9)}^0`,
  (r) => `(${bt(r, 2, 9)}*${bt(r, 2, 9)})^0`,
  (r) => `-(${bt(r, 2, 9)}*${bt(r, 2, 9)})^0`,
  (r) => `(-${bt(r, 2, 9)}*${bt(r, 2, 9)})^0`,
  (r) => `(${bt(r, 2, 9)}+${bt(r, 2, 9)})^0`,
  (r) => `${bt(r, 2, 9)}^0+${bt(r, 2, 9)}^0`,
]
const Z0H: Tpl[] = [
  (r) => `(${bt(r, 2, 9)}*${bt(r, 2, 9)}+${bt(r, 2, 9)})^0-${bt(r, 2, 9)}^0`,
  (r) => `-(${bt(r, 2, 9)}-${bt(r, 2, 9)}*${bt(r, 2, 9)})^0*${bt(r, 2, 9)}`,
  (r) => `${bt(r, 2, 9)}^0+${bt(r, 2, 9)}^0-${bt(r, 2, 9)}^0+${bt(r, 2, 9)}*${bt(r, 2, 9)}^0`,
  (r) => `(${bt(r, 2, 9)}^0+${bt(r, 2, 9)}^0+${bt(r, 2, 9)}^0)^0*${bt(r, 2, 9)}^0`,
]
const E16_4 = tpl(Z0, 640, 'Simplify: ')
const H16_4 = tpl(Z0H, 660, 'Simplify: ')
// exercises 5, 6, 7, 9: multiply, divide, both, variable exponents
const E16_5 = fromOpts([g({}), g({ neg: 1 }), g({ kn: [3, 3], zero: 0.25, bare: 0.2 }), g({ kn: [3, 3], ex: [1, 1], bare: 1, neg: 1 }), g({ nb: 2, kn: [2, 2], bare: 0.2 })], 650, MUL)
const H16_5 = fromOpts([g({ kn: [3, 4], ex: [3, 12] }), g({ kn: [3, 4], ex: [2, 9], neg: 1, bare: 0.2 }), g({ nb: 2, kn: [2, 3], ex: [2, 9] }), g({ nb: 3, kn: [2, 2], ex: [2, 8], bare: 0.2 })], 670, MUL)
const d1 = { kn: [1, 1] as [number, number], kd: [1, 1] as [number, number] }
const E16_6 = fromOpts([g({ ...d1, ex: [2, 10] }), g({ ...d1, ex: [2, 9], neg: 1 }), g({ ...d1, nb: 2, ex: [2, 9] }), g({ ...d1, nb: 2, ex: [2, 9], neg: 0.5 })], 680, DIV)
const H16_6 = fromOpts([g({ ...d1, nb: 2, ex: [4, 20] }), g({ ...d1, nb: 3, ex: [3, 14] }), g({ ...d1, nb: 2, ex: [3, 15], neg: 1 })], 690, DIV)
const E16_7 = fromOpts([g({ kd: [1, 1], ex: [2, 8] }), g({ kd: [1, 1], ex: [2, 7], neg: 1 }), g({ kn: [1, 1], kd: [2, 2], ex: [2, 7], bare: 0.2 }), g({ kn: [2, 3], kd: [2, 2], ex: [1, 7], bare: 0.3, zero: 0.1 }), g({ nb: 2, kd: [1, 2], ex: [2, 9], bare: 0.2 })], 700, SMP)
const H16_7 = fromOpts([g({ kn: [3, 4], kd: [2, 3], ex: [2, 9], bare: 0.2 }), g({ nb: 2, kn: [2, 3], kd: [2, 2], ex: [2, 10], neg: 0.5 }), g({ nb: 3, kd: [1, 2], ex: [2, 9], bare: 0.2 }), g({ nb: 2, kn: [3, 3], kd: [3, 3], ex: [2, 9], bare: 0.3, zero: 0.1 })], 720, SMP)
const E16_9 = fromOpts([g({ v: true }), g({ v: true, ...d1 }), g({ v: true, kd: [1, 1] }), g({ v: true, nb: 2, kn: [1, 2], kd: [1, 1] })], 730, SMP)
const H16_9 = fromOpts([g({ v: true, kn: [3, 3] }), g({ v: true, kn: [2, 3], kd: [1, 2] }), g({ v: true, nb: 2, kd: [1, 2] })], 750, SMP)
// exercise 8: simplify, then evaluate (the order of operations)
const S8: Tpl[] = [
  (r) => { const a = R(r)(2, 4); const b = R(r); return `${a}*${a}^${b(2, 3)}-${a}^${b(2, 3)}*${a}` },
  (r) => { const a = R(r)(2, 4); const b = R(r); return `${a}^${b(3, 5)}/${a}+${a}^${b(2, 3)}*${a}` },
  (r) => { const a = R(r)(2, 4); const b = R(r); return `(-${a})+(-${a})/(-${a})-(-${a})^${b(2, 3)}` },
  (r) => { const a = R(r)(2, 3); const b = R(r); return `${a}^${b(7, 9)}/(${a}^${b(4, 6)}/${a}^${b(1, 2)})/${a}^${b(1, 2)}` },
  (r) => { const a = R(r)(2, 4); return `(-${a})^2*${a}+(-${a})^3*${a}` },
  (r) => { const a = R(r)(2, 3); const b = R(r); return `(-${a})^${b(5, 7)}/${a}^${b(2, 3)}+(-${a})^${b(3, 4)}/${a}^${b(1, 2)}` },
]
const S8H: Tpl[] = [
  (r) => { const a = R(r)(2, 4); const b = R(r); return `${a}^${b(5, 7)}/${a}^${b(2, 3)}*${a}^${b(1, 2)}-${a}^${b(2, 3)}*${a}^${b(1, 2)}+${a}^${b(2, 3)}` },
  (r) => { const a = R(r)(2, 3); const b = R(r); return `(-${a})^${b(4, 5)}*(-${a})^${b(2, 3)}/(-${a})^${b(3, 4)}-${a}^${b(4, 5)}` },
  (r) => { const a = R(r)(2, 3); const b = R(r); return `${a}^${b(8, 10)}/(${a}^${b(2, 3)}*${a}^${b(2, 3)})-(${a}^${b(4, 6)}/${a}^${b(1, 3)})` },
  (r) => { const a = R(r)(2, 4); const b = R(r); return `(-${a})^${b(2, 4)}*(-${a})-${a}^${b(2, 3)}*${a}^0+(-${a})^3` },
]
const E16_8 = tpl(S8, 760, 'Simplify, then evaluate: ')
const H16_8 = tpl(S8H, 780, 'Simplify, then evaluate: ')

// ================= 1.7 =================
// exercise 3: a power of a power
interface PP {
  b: number
  p: number
  q: number
  neg: boolean // the base is negative, in brackets
  out: boolean // a minus sign in front
}
function itemPP(o: PP, verb: string): Item {
  const base = o.neg ? `(-${o.b})` : String(o.b)
  const src = `${o.out ? '-' : ''}${o.neg ? '[' : '('}${base}^{${o.p}}${o.neg ? ']' : ')'}^{${o.q}}`
  const res = (e: string) => `${o.out ? '-' : ''}${base}^{${e}}`
  const ans = res(String(o.p * o.q))
  const wrong = [res(String(o.p + o.q)), res(`${o.p}^{${o.q}}`), o.out ? `${base}^{${o.p * o.q}}` : res(String(o.p * o.q + o.q)), res(String(o.p * o.q - 1))]
  return {
    q: `${text(verb)}${src}`,
    short: src,
    ans,
    wrong: wrong.filter((w) => w !== ans),
    steps: [
      step('A power of a power: multiply the exponents.', `${src} =`, res(`${o.p} \\times ${o.q}`), [res(`${o.p} + ${o.q}`), res(`${o.p}^{${o.q}}`), res(`${o.p} - ${o.q}`)], 'Keep the base and multiply the two exponents.'),
      step('Work out the exponent.', `${res(`${o.p} \\times ${o.q}`)} =`, ans, [res(String(o.p + o.q)), res(String(o.p * o.q + 1)), res(String(o.p * o.q - 1))], 'Multiply the numbers in the exponent.'),
    ],
  }
}
const pp = (neg: boolean, out: boolean, pLo: number, pHi: number, qLo: number, qHi: number) => (r: () => number) => itemPP({ b: bt(r, 2, 9), p: bt(r, pLo, pHi), q: bt(r, qLo, qHi), neg, out }, 'Write in exponential form: ')
const E17_3: Item[][] = [pp(false, false, 2, 6, 2, 5), pp(true, false, 2, 5, 2, 5), pp(false, true, 2, 6, 2, 4), pp(false, false, 0, 0, 2, 5)].map((f, i) => hardList(800 + i, 15, f))
const H17_3: Item[][] = [pp(false, false, 5, 12, 3, 9), pp(true, false, 3, 9, 3, 9), pp(true, true, 3, 9, 2, 6)].map((f, i) => hardList(820 + i, 15, f))

// exercise 4: a power of a product, a sum or a quotient
function itemPQ(kind: number, r: () => number, hard: boolean): Item {
  const n = bt(r, 2, hard ? 9 : 5)
  const [a, b] = [bt(r, 2, 9), bt(r, 2, 9)]
  const verb = 'Write in exponential form without parentheses: '
  if (kind === 0) {
    const src = `(${a} \\times ${b})^{${n}}`
    const ans = `${a}^{${n}} \\times ${b}^{${n}}`
    const ws = [`${a} \\times ${b}^{${n}}`, `${a}^{${n}} + ${b}^{${n}}`, `${a * n} \\times ${b * n}`]
    return { q: `${text(verb)}${src}`, short: src, ans, wrong: [...ws, `${a * b}^{${n * 2}}`], steps: [step('Every factor gets the exponent.', `${src} =`, ans, ws, 'A power of a product is the product of the powers.')] }
  }
  if (kind === 1) {
    const src = `(${a} + ${b})^{${n}}`
    const ws = [`${a}^{${n}} + ${b}^{${n}}`, `${a * b}^{${n}}`, `${a + b}^{${n * 2}}`]
    return { q: `${text(verb)}${src}`, short: src, ans: `${a + b}^{${n}}`, wrong: [...ws, `${a + b + n}^{${n}}`], steps: [step('Add inside the brackets first.', `${src} =`, `${a + b}^{${n}}`, ws, 'A sum cannot be split: work out the brackets first.')] }
  }
  if (kind === 2) {
    const [p, q] = [bt(r, 2, hard ? 7 : 4), bt(r, 2, hard ? 7 : 4)]
    const src = `(${a}^{${p}} \\times ${b}^{${q}})^{${n}}`
    const mid = `${a}^{${p} \\times ${n}} \\times ${b}^{${q} \\times ${n}}`
    const ans = `${a}^{${p * n}} \\times ${b}^{${q * n}}`
    return { q: `${text(verb)}${src}`, short: src, ans, wrong: [`${a}^{${p + n}} \\times ${b}^{${q + n}}`, `${a}^{${p * n}} \\times ${b}^{${q}}`, `${a * b}^{${(p + q) * n}}`], steps: [step('Every factor gets the exponent n: multiply the exponents.', `${src} =`, mid, [`${a}^{${p} + ${n}} \\times ${b}^{${q} + ${n}}`, `${a}^{${p} \\times ${n}} \\times ${b}^{${q}}`], 'A power of a product, then a power of a power.'), step('Work out the exponents.', `${mid} =`, ans, [`${a}^{${p * n}} \\times ${b}^{${q}}`, `${a}^{${p * n + 1}} \\times ${b}^{${q * n}}`, `${a}^{${p * n}} \\times ${b}^{${q * n - 1}}`], 'Multiply.')] }
  }
  const src = `\\left(\\frac{${a}}{${b}}\\right)^{${n}}`
  const ans = `\\frac{${a}^{${n}}}{${b}^{${n}}}`
  const ws = [`\\frac{${a}^{${n}}}{${b}}`, `\\frac{${a}}{${b}^{${n}}}`, `\\frac{${a * n}}{${b * n}}`]
  return { q: `${text(verb)}${src}`, short: src, ans, wrong: [...ws, `\\frac{${a}^{${n}}}{${b}^{${n + 1}}}`], steps: [step('Top and bottom both get the exponent.', `${src} =`, ans, ws, 'A power of a quotient is the quotient of the powers.')] }
}
const E17_4: Item[][] = [0, 1, 2, 3].map((k) => hardList(840 + k, 15, (r) => tryUntil(() => itemPQ(k, r, false))))
const H17_4: Item[][] = [0, 2, 3].map((k) => hardList(860 + k, 15, (r) => tryUntil(() => itemPQ(k, r, true))))

// exercise 5: positive or negative
function itemSign(r: () => number, hard: boolean): Item {
  const b = bt(r, 2, 9)
  const m = bt(r, 2, hard ? 9 : 5)
  const n = bt(r, 2, hard ? 9 : 5)
  const form = bt(r, 0, 2) // 0: [(-b)^m]^n, 1: (-b^m)^n, 2: -[(-b)^m]^n
  const src = form === 0 ? `[(-${b})^{${m}}]^{${n}}` : form === 1 ? `(-${b}^{${m}})^{${n}}` : `-[(-${b})^{${m}}]^{${n}}`
  const innerNeg = form === 1 ? true : m % 2 === 1
  const inner = form === 1 ? `-${b}^{${m}}` : `(-${b})^{${m}}`
  const outerNeg = innerNeg && n % 2 === 1
  const neg = form === 2 ? !outerNeg : outerNeg
  const sg = (x: boolean) => T(x ? 'negative' : 'positive')
  const alts = (x: boolean) => [sg(!x), T('zero'), T('not known')]
  const steps: St[] = [step(form === 1 ? 'The inside is the negative number -b^m.' : 'The sign of the inside power.', `${inner}\\text{ is}`, sg(innerNeg), alts(innerNeg), form === 1 ? 'The minus sign is in front of the power: the inside is negative.' : `The base is negative: an ${m % 2 ? 'odd' : 'even'} exponent gives a ${innerNeg ? 'negative' : 'positive'} number.`)]
  steps.push(step('The sign of the outside power.', `${form === 2 ? `[(-${b})^{${m}}]^{${n}}` : src}\\text{ is}`, sg(outerNeg), alts(outerNeg), innerNeg ? `A negative number to an ${n % 2 ? 'odd' : 'even'} power is ${outerNeg ? 'negative' : 'positive'}.` : 'A positive number to any power is positive.'))
  if (form === 2) steps.push(step('The minus sign in front changes the sign.', `${src}\\text{ is}`, sg(neg), alts(neg), 'Positive becomes negative and negative becomes positive.'))
  return { q: `${text('Determine if the value is positive or negative: ')}${src}`, short: src, ans: sg(neg), wrong: alts(neg), steps, plain: [T('positive'), T('negative')] }
}
const E17_5: Item[][] = [hardList(880, 15, (r) => itemSign(r, false))]
const H17_5: Item[][] = [hardList(890, 15, (r) => itemSign(r, true))]

// exercise 6 and 8: evaluate (the order of operations)
const V6: Tpl[] = [
  (r) => `(-${bt(r, 2, 6)}*${bt(r, 2, 6)})^2`,
  (r) => `-(${bt(r, 2, 6)}*${bt(r, 2, 6)})^2`,
  (r) => `(-${bt(r, 2, 6)}*${bt(r, 2, 4)})^3`,
  (r) => `(-${bt(r, 2, 9)}+${bt(r, 6, 12)})^3`,
  (r) => `(${bt(r, 2, 7)}-${bt(r, 8, 12)})^4`,
  (r) => `(-${bt(r, 2, 4)}*${bt(r, 2, 4)}/${bt(r, 2, 4)})^3`,
]
const V6H: Tpl[] = [
  (r) => `(-${bt(r, 2, 5)}*${bt(r, 2, 5)}*${bt(r, 2, 3)})^3`,
  (r) => `-(${bt(r, 3, 9)}-${bt(r, 10, 20)})^3+(-${bt(r, 2, 5)})^4`,
  (r) => `(${bt(r, 2, 9)}-${bt(r, 10, 15)}+${bt(r, 2, 9)})^5`,
  (r) => `(-${bt(r, 2, 4)}+${bt(r, 6, 9)})^3*(${bt(r, 2, 9)}-${bt(r, 2, 9)})^2`,
]
const E17_6 = tpl(V6, 900, 'Evaluate: ')
const H17_6 = tpl(V6H, 920, 'Evaluate: ')
const V8: Tpl[] = [
  (r) => `(2^${bt(r, 5, 8)}/2^${bt(r, 2, 4)})+(2^${bt(r, 4, 6)}/2^${bt(r, 2, 4)})^${bt(r, 2, 4)}`,
  (r) => `(${bt(r, 2, 4)}^2)^2+2^${bt(r, 2, 3)}*2^${bt(r, 2, 3)}-${bt(r, 2, 5)}^4/${bt(r, 2, 5)}^2`,
  (r) => `(${bt(r, 1, 4)}+${bt(r, 2, 5)})^2-(${bt(r, 2, 5)}-${bt(r, 5, 8)})^3-(${bt(r, 2, 3)}*${bt(r, 2, 3)})^2`,
  (r) => `(2^2+${bt(r, 2, 4)})^2+(3^2-${bt(r, 2, 6)})^2`,
  (r) => `((-${bt(r, 2, 3)})^2)^2+((-${bt(r, 2, 3)})^2)^2-(-${bt(r, 2, 3)})^5`,
]
const V8H: Tpl[] = [
  (r) => `((-${bt(r, 2, 3)})^2-${bt(r, 2, 3)}^3)^2+((-2)^3-(-1)^${bt(r, 3, 7)})^2`,
  (r) => `(${bt(r, 2, 3)}^3)^2/(${bt(r, 2, 3)}^2)^2+(${bt(r, 1, 3)}+${bt(r, 2, 4)})^3`,
  (r) => `((-${bt(r, 2, 3)})^4-(-${bt(r, 2, 3)})^2)^2+((-1)^5-(-${bt(r, 2, 3)})^3)^2`,
  (r) => `(${bt(r, 2, 4)}^2+${bt(r, 2, 5)})^2-(${bt(r, 2, 4)}^3-${bt(r, 3, 9)})^2+(2^3)^2`,
]
const E17_8 = tpl(V8, 940, 'Simplify, then evaluate: ')
const H17_8 = tpl(V8H, 960, 'Simplify, then evaluate: ')

// exercise 7: write as a power of 2
const P2 = [2, 4, 8, 16, 32, 64, 128]
const lg = (n: number) => Math.round(Math.log2(n))
const two = (k: string) => `2^{${k}}`
function itemTwo(r: () => number, kind: number, hard: boolean): Item {
  const verb = 'Write the expression as 2 raised to a power, then simplify: '
  const pickP = (lo: number, hi: number) => P2[bt(r, lo, hi)]
  if (kind === 0) {
    const [a, b] = [pickP(0, hard ? 6 : 4), pickP(0, hard ? 6 : 4)]
    const op = hard && r() < 0.5 ? '\\div' : '\\times'
    if (op === '\\div' && lg(a) < lg(b)) return itemTwo(r, kind, hard)
    const src = `${a} ${op} ${b}`
    const e = op === '\\times' ? lg(a) + lg(b) : lg(a) - lg(b)
    const mid = `${two(String(lg(a)))} ${op} ${two(String(lg(b)))}`
    const sum = two(`${lg(a)} ${op === '\\times' ? '+' : '-'} ${lg(b)}`)
    return { q: `${text(verb)}${src}`, short: src, ans: two(String(e)), wrong: [two(String(lg(a) * lg(b))), two(String(e + 1)), two(String(e - 1)), two(String(a * b))], steps: [step('Write every number as a power of 2.', `${src} =`, mid, [`${two(String(a))} ${op} ${two(String(b))}`, `${two(String(lg(a) + 1))} ${op} ${two(String(lg(b)))}`], 'Count how many 2s are multiplied: 4 = 2 x 2 = 2^2.'), step('The same base: add the exponents when multiplying, subtract when dividing.', `${mid} =`, sum, [two(`${lg(a)} \\times ${lg(b)}`)], 'Keep the base 2.'), step('Work out the exponent.', `${sum} =`, two(String(e)), [two(String(e + 1)), two(String(e - 1))], 'Add or subtract the exponents.')] }
  }
  if (kind === 1) {
    const [a, k] = [pickP(1, hard ? 6 : 4), bt(r, 2, hard ? 7 : 5)]
    const src = `${a}^{${k}}`
    const mid = `(${two(String(lg(a)))})^{${k}}`
    return { q: `${text(verb)}${src}`, short: src, ans: two(String(lg(a) * k)), wrong: [two(String(lg(a) + k)), two(String(a * k)), two(String(lg(a) * k + 1)), two(String(lg(a) * k - 1))], steps: [step('Write the base as a power of 2.', `${src} =`, mid, [`(${two(String(a))})^{${k}}`, `(${two(String(lg(a) + 1))})^{${k}}`], 'Count how many 2s are multiplied.'), step('A power of a power: multiply the exponents.', `${mid} =`, two(String(lg(a) * k)), [two(String(lg(a) + k)), two(String(lg(a) * k + 1))], 'Keep the base 2 and multiply the exponents.')] }
  }
  if (kind === 2) {
    const [a, k] = [pickP(1, hard ? 6 : 4), bt(r, 2, hard ? 7 : 5)]
    const src = `${a}^{${k}x}`
    const mid = `(${two(String(lg(a)))})^{${k}x}`
    const e = `${lg(a) * k}x`
    return { q: `${text(verb)}${src}`, short: src, ans: two(e), wrong: [two(`${lg(a) + k}x`), two(`${lg(a) * k + 1}x`), two(`${lg(a)}x + ${k}`), two(`${a * k}x`)], steps: [step('Write the base as a power of 2.', `${src} =`, mid, [`(${two(String(a))})^{${k}x}`], 'Count how many 2s are multiplied.'), step('A power of a power: multiply the exponents.', `${mid} =`, two(e), [two(`${lg(a) + k}x`), two(`${lg(a) * k + 1}x`)], 'Multiply the numbers in the exponents.')] }
  }
  if (kind === 3) {
    const a = pickP(1, hard ? 5 : 4)
    const k = pick(r, [2, 4, 8])
    const src = Array(k).fill(a).join(' + ')
    const s = a * k
    return { q: `${text(verb)}${src}`, short: src, ans: two(String(lg(s))), wrong: [two(String(lg(a) * k)), two(String(lg(s) + 1)), two(String(lg(s) - 1)), two(String(s))], steps: [step('Add the numbers.', `${src} =`, String(s), [String(a * k + a), String(a ** 2), String(a + k)], 'Add the same number again and again.'), step('Write the number as a power of 2.', `${s} =`, two(String(lg(s))), [two(String(s)), two(String(lg(s) + 1))], 'Count how many 2s are multiplied.')] }
  }
  const s = P2[bt(r, 2, 6)] * (hard ? 2 : 1)
  return { q: `${text('Write as 2 raised to a power: ')}${s}`, short: String(s), ans: two(String(lg(s))), wrong: [two(String(s / 2)), two(String(lg(s) + 1)), two(String(lg(s) - 1)), two(String(s))], steps: [step('How many 2s are multiplied?', `${s} =`, two(String(lg(s))), [two(String(lg(s) + 1)), two(String(lg(s) - 1)), two(String(s))], 'Halve again and again until you reach 1: the number of halvings is the exponent.')] }
}
const E17_7: Item[][] = [0, 4, 1, 3, 2].map((k, i) => hardList(980 + i, 15, (r) => tryUntil(() => itemTwo(r, k, false))))
const H17_7: Item[][] = [0, 1, 2, 3].map((k, i) => hardList(1000 + i, 15, (r) => tryUntil(() => itemTwo(r, k, true))))

// exercise 9: estimate with 2^10 = 1000
function itemEst(r: () => number, hard: boolean): Item {
  const a = bt(r, 1, hard ? 9 : 4)
  const b = bt(r, 0, 9)
  const n = a * 10 + b
  const m = 2 ** b
  const src = `2^{${n}}`
  const ans = `${m} \\times 10^{${3 * a}}`
  const mid = `(2^{10})^{${a}} \\times 2^{${b}}`
  const approx = `1000^{${a}} \\times ${m}`
  return {
    q: `${text('Use ')}2^{10} \\approx 1000${text(' to estimate ')}${src}${text(' in the form m x 10^k, with m a whole number.')}`,
    short: src,
    ans,
    wrong: [`${m} \\times 10^{${3 * a + 1}}`, `${m} \\times 10^{${a}}`, `${2 ** (b + 1)} \\times 10^{${3 * a}}`, `${m} \\times 10^{${3 * (a + 1)}}`],
    steps: [
      step(`Split the exponent: ${n} = ${a} x 10 + ${b}.`, `${src} =`, mid, [`(2^{${a}})^{10} \\times 2^{${b}}`, `2^{10 \\times ${a}} \\times 2^{${a}}`], 'Write 2^n as a power of 2^10 times what is left.'),
      step('Replace 2^10 by 1000.', `${mid} \\approx`, approx, [`10^{${a}} \\times ${m}`, `${1000 * a} \\times ${m}`], '2^10 is about 1000.'),
      step('1000 = 10^3: multiply the exponents.', `${approx} =`, ans, [`${m} \\times 10^{${a + 3}}`, `${m} \\times 10^{${3 * a + 1}}`], 'Write 1000 as 10^3, then 10^{3a}.'),
    ],
  }
}
const E17_9: Item[][] = [hardList(1020, 15, (r) => itemEst(r, false))]
const H17_9: Item[][] = [hardList(1030, 15, (r) => itemEst(r, true))]

// exercise 10: a variable exponent in a power of a power
function itemVar(r: () => number, kind: number, hard: boolean): Item {
  const b = bt(r, 2, 7)
  const verb = 'Simplify: '
  const k = bt(r, 2, hard ? 6 : 4)
  if (kind === 0) {
    const e = L(bt(r, 1, hard ? 5 : 3), bt(r, 1, 9) * (r() < 0.3 ? -1 : 1))
    const src = `(${b}^{${lTex(e)}})^{${k}}`
    const out = L(e.a * k, e.b * k)
    return { q: `${text(verb)}${src}`, short: src, ans: `${b}^{${lTex(out)}}`, wrong: [`${b}^{${lTex(L(e.a * k, e.b))}}`, `${b}^{${lTex(L(e.a + k, e.b + k))}}`, `${b}^{${lTex(L(e.a * k, e.b * k + 1))}}`], steps: [step('A power of a power: multiply the exponents.', `${src} =`, `${b}^{(${lTex(e)}) \\times ${k}}`, [`${b}^{(${lTex(e)}) + ${k}}`, `${b}^{${lTex(e)}}`], 'Keep the base and multiply the exponents.'), step('Multiply every term of the exponent.', `${b}^{(${lTex(e)}) \\times ${k}} =`, `${b}^{${lTex(out)}}`, [`${b}^{${lTex(L(e.a * k, e.b))}}`, `${b}^{${lTex(L(e.a, e.b * k))}}`], 'Distribute: both terms are multiplied.')] }
  }
  const e = L(1, bt(r, 1, 9) * (r() < 0.4 ? -1 : 1))
  const c = bt(r, 2, hard ? 7 : 5)
  const src = `(${b}^{${c}})^{${lTex(e)}}`
  const out = L(c, c * e.b)
  return { q: `${text(verb)}${src}`, short: src, ans: `${b}^{${lTex(out)}}`, wrong: [`${b}^{${lTex(L(1, e.b + c))}}`, `${b}^{${lTex(L(c, e.b))}}`, `${b}^{${lTex(L(c, c * e.b + 1))}}`], steps: [step('A power of a power: multiply the exponents.', `${src} =`, `${b}^{${c}(${lTex(e)})}`, [`${b}^{${c} + (${lTex(e)})}`], 'Keep the base and multiply the exponents.'), step('Multiply every term of the exponent.', `${b}^{${c}(${lTex(e)})} =`, `${b}^{${lTex(out)}}`, [`${b}^{${lTex(L(c, e.b))}}`, `${b}^{${lTex(L(1, c * e.b))}}`], 'Distribute: both terms are multiplied.')] }
}
const E17_10: Item[][] = [0, 1].map((k) => hardList(1040 + k, 15, (r) => tryUntil(() => itemVar(r, k, false))))
const H17_10: Item[][] = [0, 1].map((k) => hardList(1050 + k, 15, (r) => tryUntil(() => itemVar(r, k, true))))

// exercise 11: solve for x (the same base on both sides)
function itemSolve(r: () => number, kind: number, hard: boolean): Item {
  const b = bt(r, 2, 7)
  const sol = (x: number, src: string, s1: string, s2: string, w1: string[], w2: string[]): Item => ({
    q: `${text('Solve for x: ')}${src}`,
    short: src,
    ans: String(x),
    wrong: numW(x),
    steps: [
      step('Use the exponent rules so that each side is one power of the same base.', `${src}\\ \\Rightarrow`, s1, w1, 'Multiply: add the exponents; divide: subtract them; a power of a power: multiply them.'),
      step('Same base: the exponents are equal.', `${s1}\\ \\Rightarrow`, s2, w2, 'If the bases are equal, the exponents must be equal.'),
      step('Solve the equation.', `${s2}\\ \\Rightarrow\\ x =`, String(x), numW(x), 'Collect the x terms, then divide.'),
    ],
  })
  if (kind === 0) {
    const x = bt(r, 2, hard ? 12 : 8)
    const p = 2 * x
    return sol(x, `\\frac{${b}^{${p}}}{${b}^{x}} = ${b}^{x}`, `${b}^{${p} - x} = ${b}^{x}`, `${p} - x = x`, [`${b}^{${p} + x} = ${b}^{x}`, `${b}^{${p}x} = ${b}^{x}`], [`${p} + x = x`, `${p}x = x`])
  }
  if (kind === 1) {
    const [p, x] = [bt(r, 2, 9), bt(r, 1, hard ? 12 : 8)]
    return sol(x, `${b}^{${p}} \\times ${b}^{x} = ${b}^{${p + x}}`, `${b}^{${p} + x} = ${b}^{${p + x}}`, `${p} + x = ${p + x}`, [`${b}^{${p}x} = ${b}^{${p + x}}`, `${b}^{${p} - x} = ${b}^{${p + x}}`], [`${p}x = ${p + x}`, `${p} - x = ${p + x}`])
  }
  if (kind === 2) {
    const [k, x] = [bt(r, 2, hard ? 6 : 4), bt(r, 2, hard ? 9 : 6)]
    return sol(x, `(${b}^{x})^{${k}} = ${b}^{${k * x}}`, `${b}^{${k}x} = ${b}^{${k * x}}`, `${k}x = ${k * x}`, [`${b}^{x + ${k}} = ${b}^{${k * x}}`, `${b}^{x^{${k}}} = ${b}^{${k * x}}`], [`x + ${k} = ${k * x}`, `x = ${k * x}`])
  }
  const [a, x] = [bt(r, 2, 5), bt(r, 2, hard ? 9 : 6)]
  return sol(x, `\\frac{${b}^{${a + 1}x}}{${b}^{x}} = ${b}^{${a * x}}`, `${b}^{${a + 1}x - x} = ${b}^{${a * x}}`, `${a}x = ${a * x}`, [`${b}^{${a + 1}x + x} = ${b}^{${a * x}}`, `${b}^{${a + 1}x} = ${b}^{${a * x}}`], [`${a + 2}x = ${a * x}`, `${a + 1}x = ${a * x}`])
}
const E17_11: Item[][] = [0, 1, 2, 3].map((k) => hardList(1060 + k, 15, (r) => tryUntil(() => itemSolve(r, k, false))))
const H17_11: Item[][] = [0, 1, 2, 3].map((k) => hardList(1070 + k, 15, (r) => tryUntil(() => itemSolve(r, k, true))))

// ================= the exercises =================
// the question "which equals 1" is always the same sentence: its similar questions differ by the choices
const idChoices = (it: Item) => it.ans + it.wrong.join('|')
const bd = (no: number, list: Item[][], title: string, seed: number, sec: string) => build(no, 'Choose the answer.', rows(list), mk, title === 'Which equals 1' ? idChoices : idOf, title, seed, sec)
export const EX_EXP16 = [
  bd(3, E16_3, 'Which equals 1', 16300, '1.6'), bd(4, E16_4, 'Zero exponents', 16400, '1.6'), bd(5, E16_5, 'Multiply powers', 16500, '1.6'), bd(6, E16_6, 'Divide powers', 16600, '1.6'),
  bd(7, E16_7, 'Multiply and divide', 16700, '1.6'), bd(8, E16_8, 'Simplify and evaluate', 16800, '1.6'), bd(9, E16_9, 'Variable exponents', 16900, '1.6'),
]
export const EX_EXP16H = [
  bd(23, H16_3, 'Which equals 1', 16323, '1.6'), bd(24, H16_4, 'Zero exponents', 16424, '1.6'), bd(25, H16_5, 'Multiply powers', 16525, '1.6'), bd(26, H16_6, 'Divide powers', 16626, '1.6'),
  bd(27, H16_7, 'Multiply and divide', 16727, '1.6'), bd(28, H16_8, 'Simplify and evaluate', 16828, '1.6'), bd(29, H16_9, 'Variable exponents', 16929, '1.6'),
]
export const EX_EXP17 = [
  bd(3, E17_3, 'Power of a power', 17300, '1.7'), bd(4, E17_4, 'Power of a product', 17400, '1.7'), bd(5, E17_5, 'Positive or negative', 17500, '1.7'), bd(6, E17_6, 'Evaluate', 17600, '1.7'),
  bd(7, E17_7, 'Powers of 2', 17700, '1.7'), bd(8, E17_8, 'Simplify and evaluate', 17800, '1.7'), bd(9, E17_9, 'Estimate with 2^10', 17900, '1.7'), bd(10, E17_10, 'Variable exponent', 17010, '1.7'),
  bd(11, E17_11, 'Solve for x', 17011, '1.7'),
]
export const EX_EXP17H = [
  bd(23, H17_3, 'Power of a power', 17323, '1.7'), bd(24, H17_4, 'Power of a product', 17424, '1.7'), bd(25, H17_5, 'Positive or negative', 17525, '1.7'), bd(26, H17_6, 'Evaluate', 17626, '1.7'),
  bd(27, H17_7, 'Powers of 2', 17727, '1.7'), bd(28, H17_8, 'Simplify and evaluate', 17828, '1.7'), bd(29, H17_9, 'Estimate with 2^10', 17929, '1.7'), bd(30, H17_10, 'Variable exponent', 17030, '1.7'),
  bd(31, H17_11, 'Solve for x', 17031, '1.7'),
]
