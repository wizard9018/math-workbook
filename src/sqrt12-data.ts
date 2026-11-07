// Grade 9 1.2 Square Roots (mineru G9 Chapter 1): exercises 1 and 4 are left out; 6 to 15 (word problems) are merged into exercise 6 (the scan has no 16 to 18).
//   2 simplify a square root (perfect squares, fractions, decimals, a negative number has no root), 3 simplify sums and roots of sums, 5 the rational square root, if it exists
//   6 word problems: a = 6 land, b = 7 calories (age to calories), c = 7 (calories to age), d = 8, e = 9, f = 10, g = 11, h = 12, i = 13, j = 14, k = 15
// Every question is multiple choice; the lessons are blanks (lessonWp). The similar questions are other numbers of the same kind; every answer and step is computed.
// Imported by: quiz.tsx, check12.ts. Shape: exercise.ts.
import type { Wp } from './ineq64-data'
import { build, rng, uniq } from './graph42-data'
import type { It } from './graph42-data'
import { blk, n4, text } from './seq41-data'

// one question: the sentence, what the lesson starts from, the answer, wrong answers, and the steps [label, left side, answer, blank prompt, wrong answers, hint]
type St = [string, string, string, string, string[], string]
export interface Item {
  plain?: string[] // the choices in this order (Yes / No)
  q: string
  short: string
  ans: string
  wrong: string[]
  steps: St[]
}
export const r6 = (x: number) => Math.round(x * 1e6) / 1e6
export const N = (x: number) => n4(r6(x))
export const numW = (v: number, ex: number[] = []) => uniq([...ex, v + 1, v - 1, v * 2, v / 2, -v, v + 10, v * 10, v / 10].map(N), (s) => s).filter((s) => s !== N(v))
export const pair = (a: number, b: number) => `${N(a)},\\ ${N(b)}`
export const pairW = (a: number, b: number) => uniq([pair(b, a), pair(a + 1, b), pair(a, b + 1), pair(a - 1, b), pair(a, b - 1), pair(2 * a, b), pair(a, 2 * b)], (s) => s).filter((s) => s !== pair(a, b))
export const decStr = (n: number, scale: number) => {
  if (scale <= 0) return String(n)
  const s = String(n).padStart(scale + 1, '0')
  return `${s.slice(0, -scale)}.${s.slice(-scale)}`
}
export function mk(it: Item, key: string): It {
  // a minus in front of the root is not part of the first question: only the root is highlighted
  const split = it.short.startsWith('-\\sqrt') && it.steps[0][1].startsWith('\\sqrt')
  const w: Wp = {
    ...(split ? { startToks: [{ id: 'sm', tex: '-' }, { id: 'sr', tex: it.short.slice(1) }] } : {}),
    tex: it.q,
    short: it.short,
    key,
    answer: it.ans,
    wrong: it.wrong,
    steps: it.steps.map(([label, lhs, ans, prompt, wrongs, hint], i) => ({
      label,
      toks: [{ id: `c${i}a`, tex: lhs }, { id: `c${i}b`, tex: ans }],
      blanks: [blk(`c${i}b`, i === 0 ? (split ? 'sr' : 's0') : `c${i - 1}b`, prompt, wrongs, hint)],
    })),
  }
  return { w, plain: it.plain }
}
export const idOf = (it: Item) => it.q
export type Row = [string, Item, Item[]]
export const rows = (list: Item[][]): Row[] => list.map((l, i) => [String.fromCharCode(97 + i), l[0], l.slice(1)])

// ================= exercise 2: simplify a square root, if possible =================
interface R2 {
  sign: string
  rad: string
  root: string
  val: number
  kind: 'ok' | 'neg' | 'zero'
  red?: string // the fraction under the root after it is reduced
  a?: number // the fraction a/b is the root
  b?: number
  t?: number // the fraction under the root is (t a)^2 / (t b)^2
}
const int2 = (k: number, neg = false): R2 => ({ sign: neg ? '-' : '', rad: String(k * k), root: String(k), val: k, kind: 'ok' })
const frac2 = (a: number, b: number, neg = false, t = 1): R2 => ({ sign: neg ? '-' : '', rad: `\\frac{${t * t * a * a}}{${t * t * b * b}}`, red: t > 1 ? `\\frac{${a * a}}{${b * b}}` : undefined, root: `\\frac{${a}}{${b}}`, val: a / b, kind: 'ok', a, b, t })
const dec2 = (a: number, m: number, neg = false): R2 => ({ sign: neg ? '-' : '', rad: decStr(a * a, 2 * m), root: decStr(a, m), val: a / 10 ** m, kind: 'ok' })
const neg2 = (n: number): R2 => ({ sign: '', rad: `-${n}`, root: '', val: n, kind: 'neg' })
const zero2: R2 = { sign: '', rad: '0', root: '0', val: 0, kind: 'zero' }
function item2(r: R2): Item {
  const tex = `${r.sign}\\sqrt{${r.rad}}`
  const q = `${text('Simplify, if possible: ')}${tex}`
  if (r.kind === 'neg') {
    const sq = Math.sqrt(r.val)
    const ws = uniq([N(sq), `-${N(sq)}`, N(r.val), '0'], (s) => s)
    return { q, short: tex, ans: '\\text{no solution}', wrong: ws, steps: [['Is there a number that multiplies by itself to give a negative number?', `${tex} =`, '\\text{no solution}', `$${tex} = \\square$`, ws, 'A number times itself is never negative, so the root of a negative number has no solution.']] }
  }
  const ans = `${r.sign}${r.root}`
  const unsigned =
    r.kind === 'zero' ? ['1', '2', '-1'] : r.a !== undefined ? [`\\frac{${r.a + 1}}{${r.b}}`, `\\frac{${r.a}}{${r.b! + 1}}`, `\\frac{${r.b}}{${r.a}}`, `\\frac{${r.a * r.a}}{${r.b! * r.b!}}`] : r.root.includes('.') ? [N(r.val * 10), N(r.val / 10), N(r.val * 2), N(r.val + 0.1)] : [String(r.val + 1), String(r.val - 1), String(r.val * 2), String(r.val * r.val)]
  const wrongRoot = uniq(unsigned, (s) => s).filter((s) => s !== r.root)
  const wrong = uniq([r.sign ? r.root : `-${r.root}`, ...wrongRoot.map((s) => `${r.sign}${s}`), '\\text{no solution}'], (s) => s).filter((s) => s !== ans)
  const steps: St[] = []
  if (r.red) {
    const num = r.t! * r.t! * r.a! * r.a!
    const den = r.t! * r.t! * r.b! * r.b!
    steps.push(['Reduce the fraction.', `\\frac{${num}}{${den}} =`, r.red, `$\\frac{${num}}{${den}} = \\square$`, [`\\frac{${r.a! * r.a!}}{${r.b! * r.b! + 1}}`, `\\frac{${r.b! * r.b!}}{${r.a! * r.a!}}`, `\\frac{1}{${r.b! * r.b!}}`], 'Divide the numerator and the denominator by the same number.'])
  }
  // a decimal root: write it as a fraction, take the root of the fraction, write the result as a decimal again
  const dec = r.a === undefined && r.root.includes('.')
  if (dec) {
    const d = r.root.split('.')[1].length
    const a = Number(r.root.replace('.', ''))
    const num = a * a
    const den = 10 ** (2 * d)
    const fr = (n: number, m: number) => `\\frac{${n}}{${m}}`
    steps.push(['Write the decimal as a fraction.', `\\sqrt{${r.rad}} =`, `\\sqrt{${fr(num, den)}}`, `$\\sqrt{${r.rad}} = \\square$`, [`\\sqrt{${fr(num, den / 10)}}`, `\\sqrt{${fr(num, den * 10)}}`, `\\sqrt{${fr(a, den)}}`], 'Count the digits after the decimal point: that many zeros in the denominator.'])
    steps.push(['Take the root of the top and of the bottom.', `\\sqrt{${fr(num, den)}} =`, fr(a, 10 ** d), `$\\sqrt{${fr(num, den)}} = \\square$`, [fr(a, den), fr(num, 10 ** d), fr(a * 2, 10 ** d)], 'Find the root of the numerator and of the denominator separately.'])
    steps.push(['Write the fraction as a decimal.', `${fr(a, 10 ** d)} =`, r.root, `$${fr(a, 10 ** d)} = \\square$`, wrongRoot, 'Divide by 10, 100, ...: move the decimal point to the left.'])
  }
  if (!dec) steps.push([r.red ? 'Which number times itself gives it?' : 'Which number times itself gives the number under the root?', `\\sqrt{${r.red ?? r.rad}} =`, r.root, `$\\square \\times \\square = ${r.red ?? r.rad}$`, wrongRoot, r.kind === 'zero' ? '0 times 0 is 0.' : 'Find the number that multiplied by itself gives the number under the root. For a fraction or a decimal this is a fraction or a decimal.'])
  if (r.sign) steps.push(['The minus sign stays in front of the root.', `${tex} =`, ans, `$${tex} = \\square$`, uniq([r.root, ...wrongRoot.map((s) => `-${s}`)], (s) => s).filter((s) => s !== ans), 'The minus sign is in front of the root, so the answer is negative.'])
  return { q, short: tex, ans, wrong, steps }
}
const KS = [3, 4, 6, 7, 8, 9, 11, 12, 13, 14, 15, 16, 18, 20, 25]
const FR: [number, number][] = [[2, 3], [3, 4], [5, 6], [3, 5], [4, 7], [5, 8], [7, 9], [2, 5], [3, 7], [7, 10], [4, 9], [5, 12]]
const DC: [number, number][] = [[6, 1], [9, 1], [11, 1], [12, 1], [13, 1], [15, 1], [25, 1], [7, 1], [4, 2], [7, 2], [8, 2], [12, 2], [13, 2], [5, 2], [15, 2]]
const NEGS = [1, 2, 3, 5, 7, 9, 10, 12, 16, 20, 25]
const E2: Item[][] = (
  [
    [int2(5), ...KS.map((k) => int2(k))],
    [int2(12), ...KS.map((k) => int2(k))],
    [frac2(4, 3, true), ...FR.map(([a, b]) => frac2(a, b, true))],
    [dec2(6, 1), ...DC.map(([a, m]) => dec2(a, m))],
    [frac2(2, 3, true, 3), ...FR.slice(0, 8).map(([a, b], i) => frac2(a, b, true, 2 + (i % 3)))],
    [neg2(16), ...NEGS.map(neg2)],
    [int2(1), ...[2, 5, 10, 30, 50, 100, 40].map((k) => int2(k))],
    [dec2(8, 2), ...DC.map(([a, m]) => dec2(a, m))],
    [zero2, ...[3, 4, 7, 20, 30, 40, 60, 90].map((a) => dec2(a, 2)), ...[2, 3, 5].map((a) => dec2(a, 3))],
    [dec2(25, 1), ...DC.map(([a, m]) => dec2(a, m))],
  ] as R2[][]
).map((l) => l.map(item2))

// ================= exercise 3: sums of roots and roots of sums =================
type T3 = [number, string, number] // sign, radicand, root
const sgn = (v: number, first: boolean) => (v < 0 ? (first ? '-' : ' - ') : first ? '' : ' + ')
function sumItem(ts: T3[]): Item {
  const tex = ts.map(([s, rad], i) => `${sgn(s, i === 0)}\\sqrt{${rad}}`).join('')
  const vals = ts.map(([s, , v], i) => `${sgn(s, i === 0)}${v}`).join('')
  const total = ts.reduce((a, [s, , v]) => a + s * v, 0)
  const bump = (i: number) => ts.map(([s, , v], j) => `${sgn(s, j === 0)}${j === i ? v + 1 : v}`).join('')
  const flip = ts.map(([s, , v], j) => `${sgn(j === 0 ? -s : s, j === 0)}${v}`).join('')
  const squares = ts.map(([s, , v], j) => `${sgn(s, j === 0)}${v * v}`).join('')
  const w1 = uniq([bump(0), bump(ts.length - 1), flip, squares].filter((x) => x !== vals), (s) => s)
  return { q: `${text('Simplify: ')}${tex}`, short: tex, ans: String(total), wrong: numW(total), steps: [['Find each square root.', `${tex} =`, vals, `$${tex} = \\square$`, w1, 'Take the square root of each number. Keep the signs.'], ['Add or subtract.', `${vals} =`, String(total), `$${vals} = \\square$`, numW(total), 'Add or subtract from the left to the right.']] }
}
function inItem(neg: boolean, inner: string, c: number, wr: number[]): Item {
  const r = Math.sqrt(c)
  const tex = `${neg ? '-' : ''}\\sqrt{${inner}}`
  const root = `${neg ? '-' : ''}\\sqrt{${c}}`
  const total = neg ? -r : r
  const w1 = uniq([...wr.map(String), String(c + 1), String(c - 1)].filter((s) => s !== String(c)), (s) => s).slice(0, 4)
  return { q: `${text('Simplify: ')}${tex}`, short: tex, ans: String(total), wrong: numW(total), steps: [['Work out the number under the root first.', `${inner} =`, String(c), `$${inner} = \\square$`, w1, 'Do the calculation under the root sign before taking the root.'], ['Take the square root.', `${root} =`, String(total), `$${root} = \\square$`, numW(total), 'Find the number that multiplied by itself gives the number under the root.']] }
}
const rt = (a: number) => Math.sqrt(a)
const TRI: [number, number, number][] = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [7, 24, 25], [12, 16, 20], [20, 21, 29], [15, 20, 25], [9, 40, 41]]
const SUMS = (s1: number, s2: number, sq: number[][]) => sq.map(([a, b]) => sumItem([[s1, String(a), rt(a)], [s2, String(b), rt(b)]]))
const PAIRS = [[9, 16], [25, 36], [1, 9], [4, 49], [16, 4], [36, 64], [100, 121], [81, 25], [144, 16], [49, 9], [64, 4]]
const SQSUM = (s1: number, s2: number, ps: number[][]) => ps.map(([p, q]) => sumItem([[s1, `${p}^2`, p], [s2, `${q}^2`, q]]))
const inSum = (tri: [number, number, number][], neg: boolean, sq: boolean) => tri.map(([p, q]) => inItem(neg, sq ? `${p}^2 + ${q}^2` : `${p * p} + ${q * q}`, p * p + q * q, [(p + q) ** 2, p + q, p * p - q * q, p * q]))
const inDiff = (tri: [number, number, number][], neg: boolean) => tri.map(([p, q, r]) => inItem(neg, `${r * r} - ${p * p}`, q * q, [r * r + p * p, (r - p) ** 2, r - p, r * p]))
const MISC = [[5, 9], [6, 30], [7, 15], [8, 17], [9, 27], [10, 26]].map(([a, b]) => inItem(false, `${a * a - b} + ${b}`, a * a, [a * a + 1, a * a - 1, a * b, a]))
const E3: Item[][] = [
  SUMS(1, 1, PAIRS),
  [...inSum([TRI[0]], false, false), ...MISC, ...inSum(TRI.slice(1), false, false)],
  SUMS(1, -1, [[25, 36], ...PAIRS.map((p) => [p[1] + 40, p[0]]), [100, 64], [81, 9], [144, 49], [36, 4]]),
  SUMS(1, 1, [[1, 9], [4, 1], [16, 1], [1, 36], [25, 1], [1, 49], [9, 4], [81, 1]]),
  SUMS(-1, -1, [[16, 4], [9, 4], [25, 16], [36, 9], [49, 4], [64, 81], [100, 25], [121, 4]]),
  inDiff(TRI.slice(0, 1).concat(TRI.slice(1)), true),
  [sumItem([[-1, '8^2', 8], [1, '15^2', 15]]), ...SQSUM(-1, 1, [[3, 9], [5, 12], [4, 13], [7, 14], [6, 11], [2, 10], [9, 15], [12, 20]])],
  [...inSum([TRI[3]], true, true), ...inSum(TRI.filter((_, i) => i !== 3), true, true)],
  [...inSum([TRI[2]], false, true), ...inSum(TRI.filter((_, i) => i !== 2), false, true)],
  [sumItem([[1, '5^2', 5], [1, '12^2', 12]]), ...SQSUM(1, 1, [[3, 4], [6, 8], [8, 15], [9, 12], [7, 24], [2, 9], [10, 11], [4, 13]])],
]

// ================= exercise 5: the rational square root of a number, if it exists =================
// the number is n * 10^e (n a perfect square): its root is rational exactly when e is even
function item5(n: number, e: number): Item {
  const rad = e >= 0 ? String(n * 10 ** e) : decStr(n, -e)
  const D = n * 10 ** e
  const q = `${text('Determine the rational square root, if it exists: ')}${rad}`
  const tex = `\\sqrt{${rad}}`
  if (e % 2 === 0) {
    const s = Math.sqrt(n)
    const k = e / 2
    const root = k >= 0 ? String(s * 10 ** k) : decStr(s, -k)
    const v = s * 10 ** k
    const wr = numW(v).filter((x) => x !== root)
    if (e < 0) {
      // a decimal: write it as a fraction, root of the top and the bottom, back to a decimal
      const k0 = -e
      const fr = (a: number, b: number) => `\\frac{${a}}{${b}}`
      const rf = fr(n, 10 ** k0)
      return { q, short: tex, ans: root, wrong: uniq([...wr, '\\text{no rational root}'], (x) => x), steps: [
        ['Write the decimal as a fraction.', `${tex} =`, `\\sqrt{${rf}}`, `$${tex} = \\square$`, [`\\sqrt{${fr(n, 10 ** (k0 - 1))}}`, `\\sqrt{${fr(n, 10 ** (k0 + 1))}}`, `\\sqrt{${fr(s, 10 ** k0)}}`], 'Count the digits after the decimal point: that many zeros in the denominator.'],
        ['Take the root of the top and of the bottom.', `\\sqrt{${rf}} =`, fr(s, 10 ** (k0 / 2)), `$\\sqrt{${rf}} = \\square$`, [fr(s, 10 ** k0), fr(n, 10 ** (k0 / 2)), fr(s * 2, 10 ** (k0 / 2))], 'Find the root of the numerator and of the denominator separately.'],
        ['Write the fraction as a decimal.', `${fr(s, 10 ** (k0 / 2))} =`, root, `$${fr(s, 10 ** (k0 / 2))} = \\square$`, wr, 'Divide by 10, 100, ...: move the decimal point to the left.'],
      ] }
    }
    return { q, short: tex, ans: root, wrong: uniq([...wr, '\\text{no rational root}'], (x) => x), steps: [['Which number times itself gives it?', `${tex} =`, root, `$\\square \\times \\square = ${rad}$`, wr, 'Think of a number that multiplied by itself gives the number. Every two zeros of the number are one zero of the root.']] }
  }
  const t = Math.ceil(Math.max(0, -e) / 2)
  const lo = Math.floor(Math.sqrt(D) * 10 ** t + 1e-9)
  const show = (x: number) => decStr(x, t)
  const pr = (a: number, b: number) => `${decStr(a, t)}\\text{ and }${decStr(b, t)}`
  const between = pr(lo, lo + 1)
  const wb = uniq([pr(lo + 1, lo + 2), pr(lo - 1, lo), pr(lo * 10, lo * 10 + 1), pr(lo + 2, lo + 3)].filter((x) => x !== between), (x) => x)
  const wrong = uniq([show(lo), show(lo + 1), show(lo * 5), N(D / 2)], (x) => x)
  if (e < 0) {
    // a decimal: as a fraction the bottom is 10, 1000, 100000, ...: not a perfect square, so there is no rational root
    const den = 10 ** -e
    const rf = `\\frac{${n}}{${den}}`
    const fr = (a: number, b: number) => `\\frac{${a}}{${b}}`
    return { q, short: tex, ans: '\\text{no rational root}', wrong, steps: [
      ['Write the decimal as a fraction.', `${tex} =`, `\\sqrt{${rf}}`, `$${tex} = \\square$`, [`\\sqrt{${fr(n, den / 10)}}`, `\\sqrt{${fr(n, den * 10)}}`, `\\sqrt{${fr(Math.sqrt(n), den)}}`], 'Count the digits after the decimal point: that many zeros in the denominator.'],
      ['Is there a rational root?', `\\sqrt{${rf}} =`, '\\text{no rational root}', `$\\sqrt{${rf}} = \\square$`, uniq([show(lo), show(lo + 1), N(D / 2)], (x) => x), `The bottom ${den} is not a perfect square (it has an odd number of zeros), so the root of the bottom is not a rational number.`],
    ] }
  }
  return { q, short: tex, ans: '\\text{no rational root}', wrong, steps: [['Between which two numbers is the root?', `${tex} \\text{ is between}`, between, `$\\square^2 < ${rad} < \\square^2$`, wb, 'Find two neighbouring numbers whose squares are just below and just above the number.'], ['Is there a rational root?', `${tex} =`, '\\text{no rational root}', `$${tex} = \\square$`, uniq([show(lo), show(lo + 1), N(D / 2)], (x) => x), 'No number multiplies by itself to give it, so the root is not rational.']] }
}
const SQN = [1, 4, 9, 16, 25, 36, 49, 64, 81]
const cls = (n0: number, e0: number, es: number[]): Item[] => {
  const base = item5(n0, e0)
  return [base, ...es.flatMap((e) => SQN.map((n) => item5(n, e))).filter((x) => x.q !== base.q)]
}
const E5: Item[][] = [
  cls(1, 1, [1, 3, 5]), cls(1, 2, [2, 4]), cls(1, 3, [1, 3, 5]), cls(36, 0, [0, 2]), cls(36, 1, [1, 3, 5]), cls(36, 2, [2, 4]),
  cls(4, -2, [-2, -4]), cls(4, -3, [-1, -3, -5]), cls(4, -4, [-2, -4]), cls(81, -2, [-2, -4]), cls(81, -3, [-1, -3, -5]), cls(81, -4, [-2, -4]),
]

// ================= exercise 6: word problems (the book's 6 to 15) =================
const unitSq = (x: string, unit: string, p = 2) => `${x}\\text{ ${unit}}^${p}`
// 6 land: the side, the perimeter
const land = (s: number): Item => {
  const A = r6(s * s)
  return {
    q: `${text('A square piece of land has a total area of ')}${unitSq(N(A), 'miles')}${text('. Determine the length of each side and the perimeter.')}`,
    short: unitSq(N(A), 'miles'),
    ans: pair(s, 4 * s),
    wrong: pairW(s, 4 * s),
    steps: [
      ['The area of a square.', '\\text{area} =', 'l^2', '$\\text{area} = \\square$', ['2l', '4l', 'l + 2', '\\frac{l}{2}'], 'The area of a square is a side times a side. Call the side l.'],
      ['Put in the area, then take the square root.', `${N(A)} = l^2,\\ l =`, `\\sqrt{${N(A)}}`, `$${N(A)} = l^2 \\Rightarrow l = \\square$`, [`\\frac{${N(A)}}{2}`, `${N(A)}^2`, `\\frac{${N(A)}}{4}`], 'To undo the square, take the square root of the area.'],
      ['The side of the square.', '\\text{side} =', N(s), `$\\sqrt{${N(A)}} = \\square$`, numW(s), 'The side of a square is the square root of its area.'],
      ['The perimeter of a square.', '\\text{perimeter} =', '4l', '$\\text{perimeter} = \\square$', ['2l', 'l^2', 'l + 4', '\\frac{l}{4}'], 'The perimeter is all four sides added: l + l + l + l.'],
      ['Put in the side.', `l = ${N(s)},\\ \\text{perimeter} =`, N(4 * s), `$4 \\times ${N(s)} = \\square$`, numW(4 * s, [2 * s, s * s]), 'The perimeter is 4 sides.'],
    ],
  }
}
// 7 calories C = k sqrt(A)
const cal = (k: number, a1: number, a2: number): Item => {
  const c = (a: number) => k * Math.sqrt(a)
  return {
    q: `${text(`The calories a child needs each day: C = ${k}`)}\\sqrt{A}${text(`, where A is the age. Determine the calories for a child of ${a1} year${a1 > 1 ? 's' : ''} and a child of ${a2} years.`)}`,
    short: `C = ${k}\\sqrt{A}`,
    ans: pair(c(a1), c(a2)),
    wrong: pairW(c(a1), c(a2)),
    steps: [a1, a2].map((a): St => [`The calories for age ${a}.`, 'C =', N(c(a)), `$${k} \\cdot \\sqrt{${a}} = \\square$`, numW(c(a), [k * a]), 'Take the square root of the age first, then multiply by the number in front.']),
  }
}
const age = (k: number, a1: number, a2: number): Item => {
  const c = (a: number) => k * Math.sqrt(a)
  return {
    q: `${text(`The calories a person needs each day: C = ${k}`)}\\sqrt{A}${text(`, where A is the age. Determine the age of a person who consumes ${c(a1)} calories and of a person who consumes ${c(a2)} calories per day.`)}`,
    short: `C = ${k}\\sqrt{A}`,
    ans: pair(a1, a2),
    wrong: pairW(a1, a2),
    steps: [a1, a2].flatMap((a): St[] => [
      [`The root of the age for ${c(a)} calories.`, '\\sqrt{A} =', N(Math.sqrt(a)), `$${c(a)} \\div ${k} = \\square$`, numW(Math.sqrt(a), [c(a) * k]), 'Divide the calories by the number in front of the root.'],
      ['The age.', 'A =', N(a), `$${N(Math.sqrt(a))}^2 = \\square$`, numW(a, [2 * Math.sqrt(a)]), 'Square both sides to undo the square root.'],
    ]),
  }
}
// 8 length k times the width, 9 length p% longer, with an area
const WORD = (k: number) => (k === 2 ? 'twice' : `${k} times`)
const rect = (k: number, w: number): Item => {
  const A = k * w * w
  return {
    q: `${text(`A rectangle has a length ${WORD(k)} as long as it is wide, and an area of `)}${unitSq(String(A), 'm')}${text('. Determine the length and width of the rectangle.')}`,
    short: unitSq(String(A), 'm'),
    ans: pair(k * w, w),
    wrong: pairW(k * w, w),
    steps: [
      ['The width squared.', 'w^2 =', N(w * w), `$${A} \\div ${k} = \\square$`, numW(w * w, [A * k, A - k]), `The area is length times width: ${k}w times w = ${k}w².`],
      ['The width.', 'w =', N(w), `$\\sqrt{${N(w * w)}} = \\square$`, numW(w), 'Take the square root.'],
      ['The length.', 'l =', N(k * w), `$${k} \\times ${w} = \\square$`, numW(k * w, [w * w]), `The length is ${k} times the width.`],
    ],
  }
}
const rectP = (p: number, w: number): Item => {
  const f = (100 + p) / 100
  const A = r6(f * w * w)
  return {
    q: `${text(`A rectangle has a length ${p}% longer than the width, and an area of `)}${unitSq(N(A), 'cm')}${text('. Determine the length and width of the rectangle.')}`,
    short: unitSq(N(A), 'cm'),
    ans: pair(f * w, w),
    wrong: pairW(f * w, w),
    steps: [
      ['The width squared.', 'w^2 =', N(w * w), `$${N(A)} \\div ${N(f)} = \\square$`, numW(w * w, [A * f, A / 1.1]), `The length is ${N(f)} times the width: the area is ${N(f)}w².`],
      ['The width.', 'w =', N(w), `$\\sqrt{${N(w * w)}} = \\square$`, numW(w), 'Take the square root.'],
      ['The length.', 'l =', N(f * w), `$${N(f)} \\times ${w} = \\square$`, numW(f * w, [w * w]), `The length is ${N(f)} times the width.`],
    ],
  }
}
// 10 square cut by a diagonal
const diag = (s: number): Item => {
  const T = (s * s) / 2
  return {
    q: `${text('A right triangle made by cutting a diagonal on a square has an area of ')}${unitSq(String(T), 'cm')}${text('. What is the perimeter of the original square?')}`,
    short: unitSq(String(T), 'cm'),
    ans: N(4 * s),
    wrong: numW(4 * s, [2 * s, s]),
    steps: [
      ['The area of the square.', '\\text{square} =', N(2 * T), `$2 \\times ${T} = \\square$`, numW(2 * T, [T / 2]), 'The diagonal cuts the square into 2 equal triangles.'],
      ['The side.', '\\text{side} =', N(s), `$\\sqrt{${2 * T}} = \\square$`, numW(s), 'The side is the square root of the area.'],
      ['The perimeter.', '\\text{perimeter} =', N(4 * s), `$4 \\times ${s} = \\square$`, numW(4 * s, [s * s]), 'The perimeter is 4 sides.'],
    ],
  }
}
// 11 triangle cut from a rectangle that is longer than wide by a percent (f = l / w)
const FACT: [string, string, number, number][] = [['33\\frac{1}{3}', '\\frac{4}{3}', 4, 3], ['25', '\\frac{5}{4}', 5, 4], ['50', '\\frac{3}{2}', 3, 2], ['20', '\\frac{6}{5}', 6, 5]]
const tri = (fi: number, w: number): Item => {
  const [pt, ft, num, den] = FACT[fi]
  const f = num / den
  const T = r6((f * w * w) / 2)
  return {
    q: `${text('A triangle is made by cutting a diagonal on a rectangle ')}${pt}${text('% longer than it is wide. If the area of the triangle is ')}${unitSq(N(T), 'cm')}${text(', determine the length and width of the original rectangle.')}`,
    short: unitSq(N(T), 'cm'),
    ans: pair(f * w, w),
    wrong: pairW(f * w, w),
    steps: [
      ['The area of the rectangle.', '\\text{rectangle} =', N(2 * T), `$2 \\times ${N(T)} = \\square$`, numW(2 * T, [T / 2]), 'The diagonal cuts the rectangle into 2 equal triangles.'],
      ['The width squared.', 'w^2 =', N(w * w), `$${N(2 * T)} \\div ${ft} = \\square$`, numW(w * w, [2 * T * f]), `The length is ${ft} times the width: the area is ${ft}w².`],
      ['The width.', 'w =', N(w), `$\\sqrt{${N(w * w)}} = \\square$`, numW(w), 'Take the square root.'],
      ['The length.', 'l =', N(f * w), `$${ft} \\times ${w} = \\square$`, numW(f * w, [w * w]), `The length is ${ft} times the width.`],
    ],
  }
}
// 12 circle of area r^2 pi, 13 half circle of area k pi
const circ = (r: number): Item => ({
  q: `${text('The area of a circle is determined by the equation A = ')}\\pi r^2${text('. What is the radius of a circle that has an area of ')}${unitSq(`${r * r}\\pi`, 'cm')}${text('?')}`,
  short: `${r * r}\\pi`,
  ans: N(r),
  wrong: numW(r, [r * r]),
  steps: [
    ['The radius squared.', 'r^2 =', N(r * r), `$\\pi r^2 = ${r * r}\\pi \\Rightarrow r^2 = \\square$`, numW(r * r, [r * r * r]), 'Divide both sides by π.'],
    ['The radius.', 'r =', N(r), `$\\sqrt{${r * r}} = \\square$`, numW(r), 'Take the square root.'],
  ],
})
const semi = (r: number): Item => {
  const k = (r * r) / 2
  return {
    q: `${text('A semi-circle has an area of ')}${unitSq(`${k}\\pi`, 'cm')}${text('. What is the diameter of the semi-circle?')}`,
    short: `${k}\\pi`,
    ans: N(2 * r),
    wrong: numW(2 * r, [r, r * r]),
    steps: [
      ['The radius squared.', 'r^2 =', N(r * r), `$\\text{circle} = 2 \\times ${k}\\pi \\Rightarrow r^2 = \\square$`, numW(r * r, [k]), 'The whole circle is 2 semi-circles: its area is double. Then divide by π.'],
      ['The radius.', 'r =', N(r), `$\\sqrt{${r * r}} = \\square$`, numW(r), 'Take the square root.'],
      ['The diameter.', 'd =', N(2 * r), `$2 \\times ${r} = \\square$`, numW(2 * r, [r * r]), 'The diameter is twice the radius.'],
    ],
  }
}
// 14 a solid with a square base, 15 a base twice as long as wide
const solid = (s: number, h: number): Item => {
  const V = s * s * h
  return {
    q: `${text('The volume of a rectangular solid with a square base is ')}${unitSq(String(V), 'cm', 3)}${text(`. If the height of the rectangular solid is ${h} cm, what is the length of the square base?`)}`,
    short: unitSq(String(V), 'cm', 3),
    ans: N(s),
    wrong: numW(s, [s * s]),
    steps: [
      ['The area of the base.', '\\text{base} =', N(s * s), `$${V} \\div ${h} = \\square$`, numW(s * s, [V * h, V - h]), 'The volume is the area of the base times the height.'],
      ['The side of the base.', 's =', N(s), `$\\sqrt{${s * s}} = \\square$`, numW(s), 'The base is a square: its side is the square root of its area.'],
    ],
  }
}
const solid2 = (w: number, h: number): Item => {
  const V = 2 * w * w * h
  return {
    q: `${text(`A rectangular solid has a base twice as long as it is wide, and a height of ${h} cm. If the volume is `)}${unitSq(String(V), 'cm', 3)}${text(', what is its length and width?')}`,
    short: unitSq(String(V), 'cm', 3),
    ans: pair(2 * w, w),
    wrong: pairW(2 * w, w),
    steps: [
      ['The area of the base.', '\\text{base} =', N(2 * w * w), `$${V} \\div ${h} = \\square$`, numW(2 * w * w, [V * h]), 'The volume is the area of the base times the height.'],
      ['The width squared.', 'w^2 =', N(w * w), `$${N(2 * w * w)} \\div 2 = \\square$`, numW(w * w, [4 * w * w]), 'The base is 2w times w = 2w².'],
      ['The width.', 'w =', N(w), `$\\sqrt{${w * w}} = \\square$`, numW(w), 'Take the square root.'],
      ['The length.', 'l =', N(2 * w), `$2 \\times ${w} = \\square$`, numW(2 * w, [w * w]), 'The length is twice the width.'],
    ],
  }
}
const E6: Item[][] = [
  [land(1.7), ...[2.3, 1.2, 1.5, 2.5, 3.2, 0.9, 1.3, 2.1, 3.6, 4.1].map(land)],
  [cal(600, 1, 9), ...[[600, 4, 16], [500, 1, 4], [400, 9, 25], [300, 4, 9], [600, 16, 25], [500, 9, 16], [400, 1, 16], [300, 25, 36], [600, 4, 25], [500, 4, 9]].map(([k, a, b]) => cal(k, a, b))],
  [age(600, 4, 16), ...[[500, 4, 9], [400, 1, 9], [300, 9, 16], [600, 1, 9], [500, 16, 25], [400, 4, 25], [300, 4, 16], [600, 9, 25], [500, 1, 4], [400, 16, 36]].map(([k, a, b]) => age(k, a, b))],
  [rect(2, 11), ...[[2, 6], [2, 9], [3, 5], [3, 8], [4, 6], [2, 14], [3, 12], [4, 9], [2, 7], [5, 4]].map(([k, w]) => rect(k, w))],
  [rectP(25, 8), ...[[25, 4], [25, 12], [20, 5], [20, 10], [50, 6], [50, 4], [10, 10], [40, 5], [60, 5], [25, 16]].map(([p, w]) => rectP(p, w))],
  [diag(22), ...[6, 8, 10, 12, 14, 16, 18, 20, 24, 30].map(diag)],
  [tri(0, 9), ...[[0, 6], [0, 12], [1, 8], [1, 4], [2, 6], [2, 10], [3, 5], [3, 10], [0, 15], [1, 12]].map(([f, w]) => tri(f, w))],
  [circ(7), ...[3, 4, 5, 6, 8, 9, 10, 11, 12, 15].map(circ)],
  [semi(8), ...[4, 6, 10, 12, 14, 16, 18, 20, 22, 24].map(semi)],
  [solid(7, 5), ...[[3, 4], [4, 5], [5, 6], [6, 8], [8, 2], [9, 5], [10, 3], [12, 4], [11, 6], [13, 2]].map(([s, h]) => solid(s, h))],
  [solid2(11, 8), ...[[4, 5], [5, 6], [6, 8], [7, 4], [8, 3], [9, 2], [10, 5], [12, 6], [3, 10], [13, 4]].map(([w, h]) => solid2(w, h))],
]

export const EX_SQRT12 = [
  build(2, 'Choose the answer.', rows(E2), mk, idOf, 'Simplify a square root', 12200, '1.2'),
  build(3, 'Choose the answer.', rows(E3), mk, idOf, 'Simplify', 12300, '1.2'),
  build(5, 'Choose the answer.', rows(E5), mk, idOf, 'The rational square root', 12500, '1.2'),
  build(6, 'Choose the answer.', rows(E6), mk, idOf, 'Word problems', 12600, '1.2'),
]

// ================= challenge exercises (1.2 exercises 2, 3 and 5, harder): bigger numbers, more terms; optional extra practice with its own progress (no 12, 13, 15) =================
export const bt = (r: () => number, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1))
const cop12 = (a: number, b: number): boolean => (b ? cop12(b, a % b) : a === 1)
export const hardList = (seed: number, n: number, gen: (r: () => number) => Item): Item[] => {
  const r = rng(seed)
  const out: Item[] = []
  for (let k = 0; k < 400 && out.length < n; k++) {
    const it = gen(r)
    if (!out.some((x) => x.q === it.q)) out.push(it)
  }
  return out
}
const fracPair = (r: () => number, hi: number): [number, number] => {
  for (;;) {
    const a = bt(r, 2, hi)
    const b = bt(r, 2, hi)
    if (a !== b && cop12(a, b)) return [a, b]
  }
}
const H12_2: Item[][] = [
  hardList(1, 15, (r) => item2(int2(bt(r, 21, 60)))),
  hardList(2, 15, (r) => { const [a, b] = fracPair(r, 13); return item2(frac2(a, b, r() < 0.7, bt(r, 2, 5))) }),
  hardList(3, 15, (r) => item2(dec2(bt(r, 11, 99), bt(r, 2, 3), r() < 0.5))),
  hardList(4, 15, (r) => item2(int2(bt(r, 21, 40), true))),
]
const sq3 = (r: () => number, k: number, lo: number, hi: number, form: boolean): Item => {
  const ts: T3[] = Array.from({ length: k }, (_, i) => {
    const v = bt(r, lo, hi)
    return [i === 0 || r() < 0.5 ? 1 : -1, form ? `${v}^2` : String(v * v), v] as T3
  })
  return sumItem(ts)
}
const BIGTRI: [number, number, number][] = [[20, 21, 29], [28, 45, 53], [33, 56, 65], [16, 63, 65], [48, 55, 73], [36, 77, 85], [13, 84, 85], [39, 80, 89], [9, 40, 41], [12, 35, 37]]
const H12_3: Item[][] = [
  hardList(11, 15, (r) => sq3(r, 3, 6, 25, false)),
  hardList(12, 15, (r) => sq3(r, 4, 4, 20, false)),
  hardList(13, 15, (r) => sq3(r, 3, 6, 25, true)),
  hardList(14, 15, (r) => { const [p, q] = BIGTRI[bt(r, 0, BIGTRI.length - 1)]; return inItem(r() < 0.5, r() < 0.5 ? `${p}^2 + ${q}^2` : `${p * p} + ${q * q}`, p * p + q * q, [(p + q) ** 2, p + q, p * q, p * p - q * q]) }),
]
const BIGSQ = [121, 144, 169, 196, 225, 256, 289, 324, 361, 400]
const h5 = (seed: number, es: number[]): Item[] => hardList(seed, 15, (r) => item5(BIGSQ[bt(r, 0, BIGSQ.length - 1)], es[bt(r, 0, es.length - 1)]))
const H12_5: Item[][] = [h5(21, [0, 2, 4]), h5(22, [1, 3, 5]), h5(23, [-2, -4, -6]), h5(24, [-1, -3, -5])]
const H12_6: Item[][] = [
  hardList(41, 15, (r) => rect(bt(r, 2, 6), bt(r, 12, 40))),
  hardList(42, 15, (r) => rectP([10, 20, 25, 50][bt(r, 0, 3)], 10 * bt(r, 2, 8))),
  hardList(43, 15, (r) => solid(bt(r, 12, 30), bt(r, 2, 12))),
  hardList(44, 15, (r) => solid2(bt(r, 12, 30), bt(r, 2, 12))),
]
const rank12 = (it: Item) => it.steps.length
export const EX_SQRT12H = [
  build(12, 'Choose the answer.', rows(H12_2), mk, idOf, 'Simplify a square root (challenge)', 12212, '1.2', rank12),
  build(13, 'Choose the answer.', rows(H12_3), mk, idOf, 'Simplify (challenge)', 12213, '1.2', rank12),
  build(15, 'Choose the answer.', rows(H12_5), mk, idOf, 'The rational square root (challenge)', 12215, '1.2', rank12),
  build(16, 'Choose the answer.', rows(H12_6), mk, idOf, 'Word problems (challenge)', 12216, '1.2', rank12),
]
