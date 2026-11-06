// Grade 9 1.3 Square Roots of Non-Perfect Squares (mineru G9 Chapter 1): exercises 1 to 5, 7 and 8 to 10 (the baseball diamond, merged into exercise 8).
//   Left out: 6 (right triangles drawn as pictures in the scan) and 11 (the book's wording does not say where the fielder stands).
//   1 rational or irrational, 2 between two integers, 3 the closest integer, 4 one decimal place, 5 two decimal places (Heron's method), 7 Pythagorean triples (Yes / No),
//   8 baseball: a = 8 (second base to home), b = 9 (shortstop to first base), c = 10 (second base player backs up)
// Every question is multiple choice; the lessons are blanks (lessonWp); every answer and step is computed. Imported by: quiz.tsx, check13.ts. Shape: exercise.ts.
import { build, uniq } from './graph42-data'
import { text } from './seq41-data'
import { N, bt as bt2, decStr, hardList, idOf, mk, numW, r6, rows } from './sqrt12-data'
import type { Item } from './sqrt12-data'

type S = Item['steps'][number]
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a)
const isSq = (n: number) => Number.isInteger(Math.sqrt(n))
const Q = text
const less = (xs: string[], ans: string) => uniq(xs, (s) => s).filter((s) => s !== ans)
const YES = '\\text{Yes}'
const NO = '\\text{No}'

// ================= exercise 1: is the square root rational or irrational? =================
interface R1 {
  tex: string
  a: number
  b: number
}
const R = (a: number, b = 1, tex?: string): R1 => ({ a, b, tex: tex ?? (b === 1 ? String(a) : `\\frac{${a}}{${b}}`) })
const D = (n: number, scale: number): R1 => R(n, 10 ** scale, decStr(n, scale))
function item1(r: R1): Item {
  const g = gcd(r.a, r.b)
  const a = r.a / g
  const b = r.b / g
  const red = `\\frac{${a}}{${b}}`
  const ok = isSq(a) && isSq(b)
  const ans = ok ? '\\text{Rational}' : '\\text{Irrational}'
  const other = ok ? '\\text{Irrational}' : '\\text{Rational}'
  return {
    q: `${Q('State if the square root of the number is rational or irrational: ')}${r.tex}`, short: r.tex, ans, wrong: [other], plain: ['\\text{Rational}', '\\text{Irrational}'],
    steps: [
      ['Write it as a fraction in lowest terms.', `${r.tex} =`, red, `$${r.tex} = \\square$`, less([`\\frac{${a}}{${b + 1}}`, `\\frac{${b}}{${a}}`, `\\frac{${a + 1}}{${b}}`], red), 'A whole number is over 1. A decimal is over 10, 100, ... Then divide the top and the bottom by their common factors.'],
      ['Are the top and the bottom perfect squares?', `\\sqrt{${red}} \\text{ is}`, ans, `$\\sqrt{${red}} = \\dfrac{\\sqrt{${a}}}{\\sqrt{${b}}}$`, [other], 'The root is rational only when both the top and the bottom are perfect squares (1, 4, 9, 16, 25, ...).'],
    ],
  }
}
const ints = (xs: number[]) => xs.map((n) => R(n))
const E1: Item[][] = [
  ints([121, 36, 49, 100, 144, 169, 225, 400, 625]),
  ints([60, 7, 12, 50, 72, 90, 150, 200, 33, 99, 18]),
  ints([729, 64, 81, 196, 256, 324, 484, 900, 1000]),
  ints([750, 48, 75, 300, 500, 98, 450, 3000, 20]),
  [R(81, 5), R(16, 3), R(9, 7), R(25, 2), R(49, 6), R(4, 11), R(36, 5), R(64, 3), R(100, 7)],
  [R(8, 18), R(2, 8), R(3, 27), R(12, 27), R(18, 50), R(5, 20), R(8, 50), R(7, 28), R(45, 80)],
  [D(16, 1), D(25, 1), D(36, 1), D(81, 1), D(49, 1), D(4, 1), D(64, 1), D(9, 1), D(2, 1)],
  [R(24, 54), R(12, 27), R(2, 8), R(8, 18), R(20, 45), R(18, 8), R(50, 18), R(5, 45), R(3, 12)],
  [D(9, 1), D(4, 1), D(1, 1), D(16, 1), D(25, 1), D(3, 1), D(36, 1), D(5, 1), D(49, 1)],
  [D(9, 2), D(4, 2), D(16, 2), D(81, 2), D(25, 2), D(3, 2), D(49, 2), D(64, 2), D(7, 2)],
].map((l) => l.map(item1))

// ================= exercises 2 to 5: between two integers, the closest integer, decimals =================
const NS = (n: number) => Math.floor(Math.sqrt(n))
const sqOf = (n: number, neg: boolean) => `${neg ? '-' : ''}\\sqrt{${n}}`
const bt = (lo: number, hi: number, neg: boolean) => (neg ? `${-hi}\\text{ and }${-lo}` : `${lo}\\text{ and }${hi}`)
const around = (lo: number, hi: number) => less([`${lo - 1}\\text{ and }${lo}`, `${hi}\\text{ and }${hi + 1}`, `${lo * lo}\\text{ and }${hi * hi}`], `${lo}\\text{ and }${hi}`)
const MINUS = 'The minus sign stays in front.'
function item2(n: number, neg: boolean): Item {
  const lo = NS(n)
  const hi = lo + 1
  const tex = sqOf(n, neg)
  const ans = bt(lo, hi, neg)
  const steps: S[] = [
    ['The perfect squares on each side of the number.', `${n} \\text{ is between}`, `${lo * lo}\\text{ and }${hi * hi}`, `$\\square < ${n} < \\square$`, less([`${(lo - 1) ** 2}\\text{ and }${lo * lo}`, `${hi * hi}\\text{ and }${(hi + 1) ** 2}`, `${lo}\\text{ and }${hi}`], `${lo * lo}\\text{ and }${hi * hi}`), 'List the perfect squares: 1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, ... and find the two next to the number.'],
    ['Take the roots of the perfect squares.', `\\sqrt{${n}} \\text{ is between}`, `${lo}\\text{ and }${hi}`, `$\\sqrt{${lo * lo}} = \\square,\\ \\sqrt{${hi * hi}} = \\square$`, around(lo, hi), 'The root of a number between two perfect squares is between their roots.'],
  ]
  if (neg) steps.push(['The minus sign: the smaller number is the one farther from zero.', `${tex} \\text{ is between}`, ans, `$${tex}$`, less([`${lo}\\text{ and }${hi}`, `${-hi - 1}\\text{ and }${-hi}`, `${-lo}\\text{ and }${-lo + 1}`], ans), 'On the number line a negative number is smaller the farther it is from zero.'])
  return { q: `${Q('Between what two integers does the irrational number fall? ')}${tex}`, short: tex, ans, wrong: less([bt(lo - 1, lo, neg), bt(hi, hi + 1, neg), bt(lo, hi, !neg), bt(lo + 1, hi + 1, neg)], ans), steps }
}
function item3(n: number, neg: boolean): Item {
  const lo = NS(n)
  const hi = lo + 1
  const close = n - lo * lo < hi * hi - n ? lo : hi
  const tex = sqOf(n, neg)
  const v = neg ? -close : close
  const steps: S[] = [
    ['The integers around the root.', `\\sqrt{${n}} \\text{ is between}`, `${lo}\\text{ and }${hi}`, `$${lo * lo} < ${n} < ${hi * hi}$`, around(lo, hi), `${lo}² = ${lo * lo} and ${hi}² = ${hi * hi}.`],
    ['Which one is closer?', `\\sqrt{${n}} \\approx`, String(close), `$${n} - ${lo * lo} = ${n - lo * lo},\\ ${hi * hi} - ${n} = ${hi * hi - n}$`, less([String(lo === close ? hi : lo), String(close + 2), String(close - 1)], String(close)), `${n} is ${n - lo * lo} from ${lo * lo} and ${hi * hi - n} from ${hi * hi}: it is closer to ${close}.`],
  ]
  if (neg) steps.push(['Put the minus sign back.', `${tex} \\approx`, String(v), `$${tex} \\approx \\square$`, less([String(close), String(v - 1), String(v + 1)], String(v)), MINUS])
  return { q: `${Q('Determine the closest integer to the irrational number: ')}${tex}`, short: tex, ans: String(v), wrong: numW(v), steps }
}
const to1 = (x: number) => Math.round(x * 10) / 10
function item4(n: number, neg: boolean): Item {
  const lo = NS(n)
  const hi = lo + 1
  const r = to1(Math.sqrt(n))
  const v = neg ? -r : r
  const tex = sqOf(n, neg)
  const steps: S[] = [
    ['The integers around the root.', `\\sqrt{${n}} \\text{ is between}`, `${lo}\\text{ and }${hi}`, `$${lo * lo} < ${n} < ${hi * hi}$`, around(lo, hi), `${lo}² = ${lo * lo} and ${hi}² = ${hi * hi}.`],
    ['One decimal place.', `\\sqrt{${n}} \\approx`, N(r), `$${n} - ${lo * lo} = ${n - lo * lo},\\ ${hi * hi} - ${n} = ${hi * hi - n}$`, less([N(r + 0.1), N(r - 0.1), N(r + 0.2), N(r - 0.2)], N(r)), `${n} is ${n - lo * lo} above ${lo * lo} and ${hi * hi - n} below ${hi * hi}: the root is that far along the way from ${lo} to ${hi}. Check: ${N(r)}² = ${N(r * r)}.`],
  ]
  if (neg) steps.push(['Put the minus sign back.', `${tex} \\approx`, N(v), `$${tex} \\approx \\square$`, less([N(r), N(v - 0.1), N(v + 0.1)], N(v)), MINUS])
  return { q: `${Q('Without a calculator, determine the square root to one decimal place: ')}${tex}`, short: tex, ans: N(v), wrong: less([N(v + 0.1), N(v - 0.1), N(v + 0.2), N(v - 0.2)], N(v)), steps }
}
// Heron: a = the answer of exercise 4, then (a + x / a) / 2; null when this does not give the rounded root
function item5(n: number, neg: boolean): Item | null {
  const a = to1(Math.sqrt(n))
  const qv = r6(Math.round((n / a) * 1000) / 1000)
  const h = Math.round(((a + qv) / 2) * 100) / 100
  const r = Math.round(Math.sqrt(n) * 100) / 100
  if (Math.abs(h - r) > 1e-9) return null
  const v = neg ? -r : r
  const tex = sqOf(n, neg)
  const steps: S[] = [
    ['The answer of one decimal place: the first guess a.', 'a \\approx', N(a), `$\\sqrt{${n}} \\approx \\square$`, less([N(a + 0.1), N(a - 0.1), N(a + 0.2)], N(a)), `Find the two integers around the root and then the tenth. Check: ${N(a)}² = ${N(a * a)}.`],
    ['Divide the number by the guess.', `\\dfrac{${n}}{${N(a)}} =`, N(qv), `$${n} \\div ${N(a)} = \\square$`, less([N(qv + 0.1), N(qv - 0.1), N(qv + 1)], N(qv)), 'Heron: x divided by a. If a is too small, x ÷ a is too big (and the other way round): the root is between them.'],
    ["The average of the two: Heron's formula.", `\\dfrac{1}{2}\\left(${N(a)} + ${N(qv)}\\right) =`, N(h), `$\\dfrac{${N(a)} + ${N(qv)}}{2} = \\square$`, less([N(h + 0.01), N(h - 0.01), N(qv)], N(h)), 'Add the two numbers and divide by 2.'],
  ]
  if (neg) steps.push(['Put the minus sign back.', `${tex} \\approx`, N(v), `$${tex} \\approx \\square$`, less([N(r), N(v - 0.01), N(v + 0.01)], N(v)), MINUS])
  return { q: `${Q("Without a calculator, use Heron's method to find the square root to two decimal places: ")}${tex}`, short: tex, ans: N(v), wrong: less([N(v + 0.01), N(v - 0.01), N(qv), N(v + 0.1)], N(v)), steps }
}
// the book's numbers: 75, 110, 90, -300, -160, -125, 204, -470, 300, -500 (the same ten for 2, 4 and 5); 3 has its own
const BOOK2: [number, boolean][] = [[75, false], [110, false], [90, false], [300, true], [160, true], [125, true], [204, false], [470, true], [300, false], [500, true]]
const BOOK3: [number, boolean][] = [[5, false], [19, false], [180, false], [450, false], [590, false], [5, true], [19, true], [180, true], [450, true], [590, true]]
const POOL = [2, 3, 6, 7, 8, 10, 11, 12, 13, 14, 15, 17, 20, 21, 24, 28, 30, 35, 40, 45, 50, 55, 60, 65, 70, 80, 85, 95, 105, 115, 120, 130, 140, 150, 170, 190, 200, 210, 250, 260, 280, 320, 350, 407, 461, 503].filter((n) => !isSq(n))
// similar questions: the numbers nearest in size to the book's number, same sign
const near = (n: number, k: number) => POOL.filter((m) => m !== n).sort((a, b) => Math.abs(a - n) - Math.abs(b - n)).slice(0, k)
const part = (list: [number, boolean][], f: (n: number, neg: boolean) => Item | null): Item[][] => list.map(([n, neg]) => [n, ...near(n, 16)].map((m) => f(m, neg)).filter((x): x is Item => x !== null))

// ================= exercise 7: Pythagorean triples =================
// a number is a whole number k or a root of m; its square is k^2 or m
interface Nm {
  tex: string
  sq: number
  pw: string
}
const K = (k: number): Nm => ({ tex: String(k), sq: k * k, pw: `${k}^2` })
const Rt = (m: number): Nm => ({ tex: `\\sqrt{${m}}`, sq: m, pw: `\\left(\\sqrt{${m}}\\right)^2` })
function item7(a: Nm, b: Nm, c: Nm): Item {
  const lhs = a.sq + b.sq
  const yes = lhs === c.sq
  const t = `${a.tex},\\ ${b.tex},\\ ${c.tex}`
  const ans = yes ? YES : NO
  const wrongAns = yes ? NO : YES
  const sum = `${a.pw} + ${b.pw}`
  return {
    q: `${Q('Is this a Pythagorean triple? ')}${t}`, short: t, ans, wrong: [wrongAns], plain: [YES, NO],
    steps: [
      ['The two smaller numbers squared and added.', `${sum} =`, String(lhs), `$${sum} = \\square$`, less([String((a.sq ** 0.5 + b.sq ** 0.5) ** 2), String(a.sq + b.sq + 2), String(a.sq + b.sq - 1), String(a.sq * b.sq)].map((s) => N(+s)), String(lhs)), 'Square each number, then add.'],
      ['The largest number squared.', `${c.pw} =`, String(c.sq), `$${c.pw} = \\square$`, less([N(c.sq + 1), N(c.sq - 1), N(c.sq * 2)], String(c.sq)), 'Square the largest number.'],
      ['Do they match?', `${lhs}\\ \\text{and}\\ ${c.sq}:`, ans, `$${lhs}\\ \\square\\ ${c.sq}$`, [wrongAns], 'It is a Pythagorean triple when the two squares add up to the square of the largest number: a² + b² = c².'],
    ],
  }
}
const ks = (a: number, b: number, c: number) => item7(K(a), K(b), K(c))
const TRIP: [number, number, number][] = [[3, 4, 5], [5, 12, 13], [6, 8, 10], [7, 24, 25], [8, 15, 17], [9, 12, 15], [9, 40, 41], [12, 16, 20], [15, 20, 25], [15, 36, 39], [20, 21, 29], [12, 35, 37], [10, 24, 26], [16, 30, 34]]
const MISS: [number, number, number][] = [[9, 14, 16], [5, 6, 8], [7, 12, 14], [8, 14, 16], [6, 7, 10], [10, 15, 19], [9, 16, 20], [4, 5, 7], [12, 14, 19], [11, 20, 24], [13, 15, 20], [8, 9, 13]]
const without = (xs: [number, number, number][], t: [number, number, number]) => xs.filter((x) => x.join() !== t.join())
const trip = (t: [number, number, number], pool: [number, number, number][]): Item[] => [ks(...t), ...without(pool, t).map((x) => ks(...x))]
const rts = (xs: [number, number, number][]) => xs.map(([x, y, z]) => item7(Rt(x), Rt(y), Rt(z)))
const E7: Item[][] = [
  trip([7, 24, 25], TRIP), trip([8, 15, 17], TRIP), trip([9, 14, 16], MISS), trip([9, 40, 41], TRIP), trip([15, 36, 39], TRIP),
  [...rts([[2, 3, 5]]), ...rts([[1, 2, 3], [2, 5, 7], [2, 3, 6], [3, 6, 9], [1, 2, 4], [5, 7, 12], [3, 5, 9], [2, 6, 8], [4, 5, 9], [2, 5, 8]])],
  [item7(Rt(10), K(4), K(5)), ...[[7, 3, 4], [5, 2, 3], [11, 5, 6], [8, 3, 4], [6, 4, 5], [13, 6, 7], [12, 4, 5], [17, 8, 9], [15, 1, 4], [19, 6, 7]].map(([m, k, c]) => item7(Rt(m), K(k), K(c)))],
]

// ================= exercise 8: baseball (a diamond is a square) =================
const DIAMOND = (s: number) => `${Q(`A baseball diamond is a square, ${s} feet on each side: home plate and the first, second and third base are its corners. `)}`
const f1 = (x: number) => N(Math.round(x * 10) / 10)
function base(kind: 'a' | 'b' | 'c', s: number, k = 0): Item {
  if (kind === 'a') {
    const d2 = 2 * s * s
    const d = Math.sqrt(d2)
    return { q: `${DIAMOND(s)}${Q('How far is it from second base to home plate?')}`, short: `${s}\\text{ ft}`, ans: f1(d), wrong: less([f1(d + 1), f1(d - 1), f1(2 * s), f1(d2), f1(s * 1.5)], f1(d)), steps: [
      ['The diagonal is the hypotenuse of a right triangle.', 'd^2 =', String(d2), `$${s}^2 + ${s}^2 = \\square$`, less([String(2 * s), String(s * s), String((2 * s) ** 2)], String(d2)), 'Pythagorean theorem: the two sides of the square are the legs.'],
      ['Take the square root.', 'd \\approx', f1(d), `$\\sqrt{${d2}} \\approx \\square$`, less([f1(d + 1), f1(d - 1), f1(2 * s)], f1(d)), 'Find the square root to one decimal place.'],
    ] }
  }
  if (kind === 'b') {
    const h = s / 2
    const d2 = h * h + s * s
    const d = Math.sqrt(d2)
    return { q: `${DIAMOND(s)}${Q('The short stop plays exactly halfway between second base and third base. How far is the throw to first base from the short stop?')}`, short: `${s}\\text{ ft}`, ans: f1(d), wrong: less([f1(d + 1), f1(d - 1), f1(Math.sqrt(2) * s), f1(h + s), f1(d2)], f1(d)), steps: [
      ['The short stop is halfway along a side: the first leg.', 'a =', N(h), `$${s} \\div 2 = \\square$`, less([N(s), N(s * 2), N(h + 1)], N(h)), 'Halfway means half of the side. The other leg is a whole side.'],
      ['The distance squared.', 'd^2 =', N(d2), `$${N(h)}^2 + ${s}^2 = \\square$`, less([N(d2 + 1), N((h + s) ** 2), N(h * h)], N(d2)), 'Pythagorean theorem: a² + b² = d².'],
      ['Take the square root.', 'd \\approx', f1(d), `$\\sqrt{${N(d2)}} \\approx \\square$`, less([f1(d + 1), f1(d - 1), f1(h + s)], f1(d)), 'Find the square root to one decimal place.'],
    ] }
  }
  const L = s + k
  const d2 = L * L + s * s
  const d = Math.sqrt(d2)
  return { q: `${DIAMOND(s)}${Q(`The second base player backs up ${k} ft behind second base, on the line from third base through second base. How far is a throw to home plate?`)}`, short: `${s}\\text{ ft},\\ ${k}\\text{ ft}`, ans: f1(d), wrong: less([f1(d + 1), f1(d - 1), f1(Math.sqrt(2) * s + k), f1(d2)], f1(d)), steps: [
    ['One leg: from third base to the player.', 'a =', String(L), `$${s} + ${k} = \\square$`, less([String(s), String(L + k), String(L - 2 * k)], String(L)), 'The player is a side plus the extra distance away from third base. The other leg is a whole side.'],
    ['The distance squared.', 'd^2 =', String(d2), `$${L}^2 + ${s}^2 = \\square$`, less([String(d2 + 1), String((L + s) ** 2), String(L * L)], String(d2)), 'Pythagorean theorem: a² + b² = d².'],
    ['Take the square root.', 'd \\approx', f1(d), `$\\sqrt{${d2}} \\approx \\square$`, less([f1(d + 1), f1(d - 1), f1(L + s)], f1(d)), 'Find the square root to one decimal place.'],
  ] }
}
const SS = [60, 80, 100, 70, 120, 50, 75, 65, 110]
const E8: Item[][] = [
  [base('a', 90), ...SS.map((s) => base('a', s))],
  [base('b', 90), ...SS.map((s) => base('b', s))],
  [base('c', 90, 30), ...[[60, 20], [80, 40], [100, 30], [70, 10], [120, 50], [50, 30], [75, 25], [65, 35], [110, 20]].map(([s, k]) => base('c', s, k))],
]

export const EX_SQRT13 = [
  build(1, 'Rational or irrational?', rows(E1), mk, idOf, 'Rational or irrational', 13100, '1.3'),
  build(2, 'Choose the integers.', rows(part(BOOK2, item2)), mk, idOf, 'Between two integers', 13200, '1.3'),
  build(3, 'Choose the closest integer.', rows(part(BOOK3, item3)), mk, idOf, 'The closest integer', 13300, '1.3'),
  build(4, 'Choose the square root.', rows(part(BOOK2, item4)), mk, idOf, 'One decimal place', 13400, '1.3'),
  build(5, 'Choose the square root.', rows(part(BOOK2, item5)), mk, idOf, 'Heron\'s method', 13500, '1.3'),
  build(7, 'Is it a Pythagorean triple?', rows(E7), mk, idOf, 'Pythagorean triples', 13700, '1.3'),
  build(8, 'Choose the distance.', rows(E8), mk, idOf, 'Baseball', 13800, '1.3'),
]

// ================= challenge exercises (1.3 exercises 1, 2, 3, 4, 5 and 7, harder): bigger numbers, fractions that must be reduced first; optional extra practice with its own progress (no 11 to 15, 17) =================
const BIGN = (r: () => number, lo: number, hi: number) => {
  for (;;) {
    const n = bt2(r, lo, hi)
    if (!isSq(n)) return n
  }
}
const H13_1: Item[][] = [
  hardList(31, 15, (r) => item1(R(r() < 0.5 ? bt2(r, 12, 70) ** 2 : bt2(r, 300, 4500)))),
  hardList(32, 15, (r) => { const p = bt2(r, 1, 12); const q = bt2(r, 2, 12); const g = bt2(r, 2, 9); return item1(R(g * (r() < 0.5 ? p * p : p * p + 1), g * (r() < 0.6 ? q * q : q * q + 2))) }),
  hardList(33, 15, (r) => item1(D(r() < 0.5 ? bt2(r, 11, 99) ** 2 : bt2(r, 100, 9999), 2))),
  hardList(34, 15, (r) => item1(D(r() < 0.5 ? 10 * bt2(r, 4, 30) ** 2 : bt2(r, 100, 9999), 3))),
]
const part2 = (seed: number, f: (n: number, neg: boolean) => Item | null, lo: number, hi: number, neg: boolean) => hardList(seed, 15, (r) => { for (;;) { const it = f(BIGN(r, lo, hi), neg); if (it) return it } })
const H13_2: Item[][] = [part2(41, item2, 300, 3000, false), part2(42, item2, 300, 3000, true), part2(43, item2, 1000, 9000, false), part2(44, item2, 1000, 9000, true)]
const H13_3: Item[][] = [part2(51, item3, 300, 3000, false), part2(52, item3, 300, 3000, true), part2(53, item3, 1000, 9000, false), part2(54, item3, 1000, 9000, true)]
const H13_4: Item[][] = [part2(61, item4, 300, 3000, false), part2(62, item4, 300, 3000, true), part2(63, item4, 1000, 9000, false), part2(64, item4, 1000, 9000, true)]
const H13_5: Item[][] = [part2(71, item5, 100, 999, false), part2(72, item5, 100, 999, true), part2(73, item5, 1000, 4000, false), part2(74, item5, 1000, 4000, true)]
const BIGT: [number, number, number][] = [[20, 21, 29], [28, 45, 53], [33, 56, 65], [16, 63, 65], [48, 55, 73], [36, 77, 85], [13, 84, 85], [39, 80, 89], [60, 91, 109], [65, 72, 97]]
const H13_7: Item[][] = [
  hardList(81, 15, (r) => { const [a, b, c] = BIGT[bt2(r, 0, BIGT.length - 1)]; const g = bt2(r, 1, 3); return ks(a * g, b * g, c * g) }),
  hardList(82, 15, (r) => { const [a, b, c] = BIGT[bt2(r, 0, BIGT.length - 1)]; const g = bt2(r, 1, 3); return ks(a * g + bt2(r, 0, 1), b * g, c * g + bt2(r, 1, 2)) }),
  hardList(83, 15, (r) => { const a = bt2(r, 3, 12); const b = bt2(r, 3, 12); return item7(Rt(a * a + (r() < 0.5 ? 0 : 1)), Rt(b * b), Rt(a * a + b * b + (r() < 0.5 ? 0 : 3))) }),
  hardList(84, 15, (r) => { const m = bt2(r, 3, 30); const k = bt2(r, 2, 9); const c = Math.round(Math.sqrt(m + k * k)); return item7(Rt(m), K(k), K(bt2(r, 0, 2) ? c : c + 1)) }),
]
const H13_8: Item[][] = [
  hardList(91, 15, (r) => base('a', 10 * bt2(r, 14, 48))),
  hardList(92, 15, (r) => base('b', 20 * bt2(r, 7, 24))),
  hardList(93, 15, (r) => base('c', 10 * bt2(r, 14, 48), 10 * bt2(r, 3, 20))),
]
const rank13 = (it: Item) => it.steps.length
export const EX_SQRT13H = [
  build(11, 'Rational or irrational?', rows(H13_1), mk, idOf, 'Rational or irrational (challenge)', 13111, '1.3', rank13),
  build(12, 'Choose the integers.', rows(H13_2), mk, idOf, 'Between two integers (challenge)', 13112, '1.3', rank13),
  build(13, 'Choose the closest integer.', rows(H13_3), mk, idOf, 'The closest integer (challenge)', 13113, '1.3', rank13),
  build(14, 'Choose the square root.', rows(H13_4), mk, idOf, 'One decimal place (challenge)', 13114, '1.3', rank13),
  build(15, 'Choose the square root.', rows(H13_5), mk, idOf, 'Heron\'s method (challenge)', 13115, '1.3', rank13),
  build(17, 'Is it a Pythagorean triple?', rows(H13_7), mk, idOf, 'Pythagorean triples (challenge)', 13117, '1.3', rank13),
  build(18, 'Choose the distance.', rows(H13_8), mk, idOf, 'Baseball (challenge)', 13118, '1.3', rank13),
]
