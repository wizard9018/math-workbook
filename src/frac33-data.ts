// Grade 9 3.3 (bank/G9-ch3/s3/items.json): textbook exercises 11-18 (word problems with fractions and mixed numbers, and a missing side from the perimeter) are one exercise 11, parts a-h.
//   a perimeter of a rectangle, b a height in m and cm, c packages, d the rest of a whole, e a walk, f three sections of a trip, g a quadrilateral, h a pentagon.
// Exercises 17 and 18 come with a picture in the textbook; here the sides are given in the text. Every question is multiple choice; the lessons are blanks
// (ineq64-data.ts lessonWp, built with graph42-data.ts `build`). The numbers are exact fractions (n / d); the 10 similar questions of every part are made here from small tables.
// Imported by: quiz.tsx, check33.ts. Shape: exercise.ts.
import type { Wp, WpStep } from './ineq64-data'
import { build, rng, uniq } from './graph42-data'
import type { It } from './graph42-data'
import { blk, range, text } from './seq41-data'

// ---- exact fractions: n / d (d > 0) ----
export interface Q {
  n: number
  d: number
}
export const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a))
export const q = (n: number, d: number): Q => {
  const g = gcd(n, d) || 1
  return { n: n / g, d: d / g }
}
export const add = (a: Q, b: Q) => q(a.n * b.d + b.n * a.d, a.d * b.d)
export const sub = (a: Q, b: Q) => q(a.n * b.d - b.n * a.d, a.d * b.d)
export const mix = (w: number, n: number, d: number): Q => q(w * d + n, d)
export const val = (a: Q) => a.n / a.d
// 27 7/8 as TeX: a whole number, a fraction or a mixed number
export const fx = (a: Q): string => {
  if (a.d === 1) return String(a.n)
  const w = Math.floor(a.n / a.d)
  const r = a.n - w * a.d
  return w ? `${w}\\frac{${r}}{${a.d}}` : `\\frac{${r}}{${a.d}}`
}
// wrong answers: one more / one less, one small part more / less, and what the caller thinks of
const wrongQ = (v: Q, extra: Q[] = []): string[] => {
  const part: Q = q(1, v.d)
  return uniq([...extra, add(v, q(1, 1)), sub(v, q(1, 1)), add(v, part), sub(v, part)].filter((x) => val(x) > 0 && fx(x) !== fx(v)).map(fx), (s) => s)
}
export const between = (r: () => number, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1))
const DEN = [2, 3, 4, 5, 6, 8]
// a mixed number with a fractional part: whole part w0..w1, denominator from `dens`
export const rmix = (r: () => number, w0: number, w1: number, dens = DEN): Q => {
  const d = dens[between(r, 0, dens.length - 1)]
  return mix(between(r, w0, w1), between(r, 1, d - 1), d)
}

export const HINT_ADD = 'Write the fractions with the same denominator, add the fractions and add the whole numbers; if the fraction is more than 1, make it a whole number.'
export const HINT_SUB = 'Write the fractions with the same denominator. If you cannot subtract the fractions, take 1 from the whole number and add it to the fraction as a number of parts.'
const addStep = (id: string, label: string, a: Q, b: Q, from: string): WpStep => {
  const r = add(a, b)
  return { label, toks: [{ id: `${id}a`, tex: `${fx(a)} + ${fx(b)}` }, { id: `${id}g`, tex: '=' }, { id: `${id}b`, tex: fx(r) }], blanks: [blk(`${id}b`, from, `$${fx(a)} + ${fx(b)} = \\square$`, wrongQ(r, [q(a.n + b.n, a.d + b.d)]), HINT_ADD)] }
}
const subStep = (id: string, label: string, a: Q, b: Q, from: string, hint = HINT_SUB): WpStep => {
  const r = sub(a, b)
  return { label, toks: [{ id: `${id}a`, tex: `${fx(a)} - ${fx(b)}` }, { id: `${id}g`, tex: '=' }, { id: `${id}b`, tex: fx(r) }], blanks: [blk(`${id}b`, from, `$${fx(a)} - ${fx(b)} = \\square$`, wrongQ(r, [add(a, b)]), hint)] }
}

// ================= a: the perimeter of a rectangle =================
interface A {
  what: string
  l: Q
  w: Q
  unit: string
}
function mkA(e: A, key: string): It {
  const half = add(e.l, e.w)
  const per = q(half.n * 2, half.d)
  const w: Wp = {
    tex: `${text(`This ${e.what} is `)}${fx(e.l)}${text(` ${e.unit} by `)}${fx(e.w)}${text(` ${e.unit}. What is the total distance around each page of this ${e.what}?`)}`,
    short: `${fx(e.l)},\\ ${fx(e.w)}`,
    key,
    answer: fx(per),
    wrong: wrongQ(per, [half, q(per.n * 2, per.d)]),
    steps: [
      addStep('a1', 'Length plus width.', e.l, e.w, 's0'),
      { label: 'The distance around is twice as much.', toks: [{ id: 'a2a', tex: `2 \\cdot ${fx(half)}` }, { id: 'a2g', tex: '=' }, { id: 'a2b', tex: fx(per) }], blanks: [blk('a2b', 'a1b', `$2 \\cdot ${fx(half)} = \\square$`, wrongQ(per, [half]), 'A rectangle has two lengths and two widths: double the sum of the length and the width.')] },
    ],
  }
  return { w }
}
const THINGS: [string, string][] = [['workbook', 'cm'], ['poster', 'cm'], ['photo frame', 'cm'], ['notebook', 'cm'], ['garden', 'm'], ['table', 'm'], ['picture', 'cm'], ['banner', 'm']]
const poolA = (): A[] => {
  const r = rng(31)
  return THINGS.flatMap(([what, unit]) => [0, 1].map((): A => ({ what, unit, l: rmix(r, 18, 40), w: rmix(r, 12, 17) })))
}
const idA = (e: A) => `${e.what}${fx(e.l)}${fx(e.w)}`

// ================= b: a height in m and cm =================
interface B {
  who: string
  rel: string
  his: string
  diff: Q
  m: number // tenths of a metre (1.9 m -> 19)
}
function mkB(e: B, key: string): It {
  const cm = e.m * 10
  const other = sub(q(cm, 1), e.diff)
  const metres = (e.m / 10).toFixed(1)
  const w: Wp = {
    tex: `${text(`${e.who} is `)}${fx(e.diff)}${text(` cm taller than ${e.his} ${e.rel}. If ${e.who} is ${metres} m tall, how tall is ${e.his} ${e.rel} in centimetres?`)}`,
    short: `${metres}\\text{ m},\\ ${fx(e.diff)}`,
    key,
    answer: fx(other),
    wrong: wrongQ(other, [add(q(cm, 1), e.diff)]),
    steps: [
      { label: 'The height in centimetres.', toks: [{ id: 'b1a', tex: `${metres}\\text{ m} =` }, { id: 'b1b', tex: `${cm}\\text{ cm}` }], blanks: [blk('b1b', 's0', `$${metres}\\text{ m} = \\square$`, [`${e.m}\\text{ cm}`, `${cm * 10}\\text{ cm}`, `${cm + 10}\\text{ cm}`, `${cm - 10}\\text{ cm}`], '1 m is 100 cm.')] },
      subStep('b2', 'The smaller height.', q(cm, 1), e.diff, 'b1b'),
    ],
  }
  return { w }
}
const REL: [string, string, string][] = [['Paul', 'dad', 'his'], ['Ana', 'mother', 'her'], ['Liam', 'uncle', 'his'], ['Mei', 'aunt', 'her'], ['Omar', 'brother', 'his'], ['Lena', 'sister', 'her']]
const poolB = (): B[] => {
  const r = rng(32)
  return REL.flatMap(([who, rel, his]) => [0, 1].map((): B => ({ who, rel, his, diff: rmix(r, 2, 9, [2, 4, 5, 3, 8]), m: between(r, 16, 19) })))
}
const idB = (e: B) => `${e.who}${fx(e.diff)}${e.m}`

// ================= c: packages =================
interface C {
  p1: Q
  p2: Q
  p3: Q // the known package on the other side
  unit: string
}
function mkC(e: C, key: string): It {
  const total = add(e.p1, e.p2)
  const other = sub(total, e.p3)
  const w: Wp = {
    tex: `${text('Two packages that weigh ')}${fx(e.p1)}${text(` ${e.unit} and `)}${fx(e.p2)}${text(` ${e.unit} have the same total weight as a `)}${fx(e.p3)}${text(` ${e.unit} package plus another package of unknown weight. How much does the other package weigh?`)}`,
    short: `${fx(e.p1)},\\ ${fx(e.p2)},\\ ${fx(e.p3)}`,
    key,
    answer: fx(other),
    wrong: wrongQ(other, [add(e.p3, total)]),
    steps: [addStep('c1', 'The weight of the two packages.', e.p1, e.p2, 's0'), subStep('c2', 'The other package.', total, e.p3, 'c1b')],
  }
  return { w }
}
const poolC = (): C[] => {
  const r = rng(33)
  return range(0, 11).map((i): C => {
    const p1 = rmix(r, 1, 4)
    const p2 = rmix(r, 2, 5)
    const p3 = sub(add(p1, p2), add(rmix(r, 0, 1), q(1, 4)))
    return { p1, p2, p3: val(p3) > 0 ? p3 : q(1, 2), unit: i % 2 ? 'kg' : 'pounds' }
  })
}
const idC = (e: C) => `${fx(e.p1)}${fx(e.p2)}${fx(e.p3)}`

// ================= d: the rest of a whole =================
interface D {
  f1: Q
  f2: Q
  what: string
}
function mkD(e: D, key: string): It {
  const part = add(e.f1, e.f2)
  const rest = sub(q(1, 1), part)
  const w: Wp = {
    tex: `${text('A survey of students in a school showed that ')}${fx(e.f1)}${text(` of the students ${e.what} regularly, `)}${fx(e.f2)}${text(` of the students ${e.what} occasionally, and the rest of the students do not ${e.what} at all. What fraction of the students do not ${e.what}?`)}`,
    short: `${fx(e.f1)},\\ ${fx(e.f2)}`,
    key,
    answer: fx(rest),
    wrong: wrongQ(rest, [part]),
    steps: [
      addStep('d1', 'The students who do.', e.f1, e.f2, 's0'),
      { label: 'The rest of the students (the whole is 1).', toks: [{ id: 'd2a', tex: `1 - ${fx(part)}` }, { id: 'd2g', tex: '=' }, { id: 'd2b', tex: fx(rest) }], blanks: [blk('d2b', 'd1b', `$1 - ${fx(part)} = \\square$`, wrongQ(rest, [part]), 'All the students make 1 whole. Write 1 as a fraction with the same denominator and subtract.')] },
    ],
  }
  return { w }
}
const DPAIRS: [Q, Q][] = [[q(1, 2), q(2, 5)], [q(1, 3), q(1, 4)], [q(1, 4), q(3, 8)], [q(2, 5), q(1, 4)], [q(1, 2), q(1, 3)], [q(3, 5), q(1, 4)], [q(1, 6), q(1, 4)], [q(2, 3), q(1, 5)], [q(3, 8), q(1, 4)], [q(1, 2), q(1, 6)], [q(3, 10), q(1, 4)], [q(1, 3), q(2, 5)]]
const WHATS = ['exercise', 'read', 'walk', 'swim']
const poolD = (): D[] => DPAIRS.map(([f1, f2], i) => ({ f1, f2, what: WHATS[i % 4] }))
const idD = (e: D) => `${fx(e.f1)}${fx(e.f2)}${e.what}`

// ================= e: a walk =================
interface E {
  who: string
  a: Q
  b: Q
  total: Q
  unit: string
}
function mkE(e: E, key: string): It {
  const two = add(e.a, e.b)
  const back = sub(e.total, two)
  const w: Wp = {
    tex: `${text(`${e.who} walks `)}${fx(e.a)}${text(` ${e.unit} to a friend's house, then walks `)}${fx(e.b)}${text(` ${e.unit} to a second friend's house. The total distance ${e.who} walked when ${e.who} came home was `)}${fx(e.total)}${text(` ${e.unit}. How far is it from the second friend's house to ${e.who}'s house?`)}`,
    short: `${fx(e.a)},\\ ${fx(e.b)},\\ ${fx(e.total)}`,
    key,
    answer: fx(back),
    wrong: wrongQ(back, [add(e.total, two)]),
    steps: [addStep('e1', 'The way to the second friend.', e.a, e.b, 's0'), subStep('e2', 'The way home.', e.total, two, 'e1b')],
  }
  return { w }
}
const WALKERS = ['Anna', 'Ben', 'Chen', 'Dara', 'Eli', 'Farah']
const poolE = (): E[] => {
  const r = rng(35)
  return WALKERS.flatMap((who) => [0, 1].map((j): E => {
    const a = rmix(r, 1, 2, [3, 4, 5, 6])
    const b0 = q(between(r, 1, 3), [4, 5, 8, 6][between(r, 0, 3)])
    const b = val(b0) < 1 ? b0 : q(3, 4)
    return { who, a, b, total: add(add(a, b), rmix(r, 1, 2, [4, 6, 3])), unit: j ? 'miles' : 'km' }
  }))
}
const idE = (e: E) => `${e.who}${fx(e.a)}${fx(e.b)}${fx(e.total)}`

// ================= f: three sections of a trip =================
interface F {
  place: string
  total: Q
  s1: Q
  s2: Q
  unit: string
}
function mkF(e: F, key: string): It {
  const two = add(e.s1, e.s2)
  const third = sub(e.total, two)
  const w: Wp = {
    tex: `${text(`${e.place} has three sections. The total distance of the three sections is `)}${fx(e.total)}${text(` ${e.unit}. The first section is `)}${fx(e.s1)}${text(` ${e.unit} and the second section is `)}${fx(e.s2)}${text(` ${e.unit}. How long is the third section?`)}`,
    short: `${fx(e.total)},\\ ${fx(e.s1)},\\ ${fx(e.s2)}`,
    key,
    answer: fx(third),
    wrong: wrongQ(third, [add(e.total, two)]),
    steps: [addStep('f1', 'The first two sections.', e.s1, e.s2, 's0'), subStep('f2', 'The third section.', e.total, two, 'f1b')],
  }
  return { w }
}
const PLACES: [string, string][] = [['The Triple Crown', 'miles'], ['The hiking trail', 'km'], ['The bike tour', 'km'], ['The relay race', 'km'], ['The canal walk', 'miles'], ['The ski run', 'km']]
const poolF = (): F[] => {
  const r = rng(36)
  return PLACES.flatMap(([place, unit]) => [0, 1].map((): F => {
    const s1 = rmix(r, 1, 2, [2, 4, 3])
    const s2 = rmix(r, 1, 2, [4, 2, 6])
    return { place, unit, s1, s2, total: add(add(s1, s2), q(between(r, 3, 15), 16)) }
  }))
}
const idF = (e: F) => `${e.place}${fx(e.s1)}${fx(e.s2)}${fx(e.total)}`

// ================= g, h: the missing side from the perimeter =================
interface G {
  shape: string
  perimeter: number
  sides: Q[]
}
function mkG(e: G, key: string): It {
  const steps: WpStep[] = []
  let acc = e.sides[0]
  let from = 's0'
  e.sides.slice(1).forEach((x, k) => {
    steps.push(addStep(`g${k}`, k === 0 ? 'The first two sides.' : 'Add the next side.', acc, x, from))
    acc = add(acc, x)
    from = `g${k}b`
  })
  const missing = sub(q(e.perimeter, 1), acc)
  steps.push(subStep('gz', 'The missing side.', q(e.perimeter, 1), acc, from, `The perimeter is the sum of all the sides: subtract the sides you know from the perimeter. ${HINT_SUB}`))
  const w: Wp = {
    tex: `${text(`The perimeter of a ${e.shape} is ${e.perimeter} cm. The sides we know are `)}${e.sides.map(fx).join(`${text(' cm, ')} `)}${text(' cm. How long is the missing side?')}`,
    short: `${e.perimeter},\\ ${e.sides.map(fx).join(',\\ ')}`,
    key,
    answer: fx(missing),
    wrong: wrongQ(missing, [acc]),
    steps,
  }
  return { w }
}
const poolG = (shape: string, k: number, perimeter: number, seed: number): G[] => {
  const r = rng(seed)
  return range(0, 11).map((): G => {
    const sides = range(1, k).map(() => rmix(r, 2, Math.floor(perimeter / (k + 1)) - 1, [2, 4, 3, 5, 8]))
    const tot = sides.reduce((s, x) => add(s, x), q(0, 1))
    return { shape, perimeter: val(tot) < perimeter - 1 ? perimeter : Math.ceil(val(tot)) + 3, sides }
  })
}
const idG = (e: G) => `${e.perimeter}${e.sides.map(fx).join('')}`

const A_ROWS: [string, A, A[]][] = [['a', { what: 'workbook', unit: 'cm', l: mix(27, 7, 8), w: mix(21, 1, 2) }, poolA()]]
const B_ROWS: [string, B, B[]][] = [['b', { who: 'Paul', rel: 'dad', his: 'his', diff: mix(7, 3, 4), m: 19 }, poolB()]]
const C_ROWS: [string, C, C[]][] = [['c', { p1: mix(1, 1, 2), p2: mix(3, 3, 4), p3: mix(4, 1, 4), unit: 'pounds' }, poolC()]]
const D_ROWS: [string, D, D[]][] = [['d', { f1: q(1, 2), f2: q(2, 5), what: 'exercise' }, poolD()]]
const E_ROWS: [string, E, E[]][] = [['e', { who: 'Anna', a: mix(1, 1, 3), b: q(3, 4), total: mix(3, 1, 6), unit: 'km' }, poolE()]]
const F_ROWS: [string, F, F[]][] = [['f', { place: 'The Triple Crown', total: mix(3, 15, 16), s1: mix(1, 1, 2), s2: mix(1, 1, 4), unit: 'miles' }, poolF()]]
const G_ROWS: [string, G, G[]][] = [['g', { shape: 'quadrilateral', perimeter: 22, sides: [mix(4, 1, 2), mix(6, 3, 4), mix(5, 1, 4)] }, poolG('quadrilateral', 3, 22, 37)]]
const H_ROWS: [string, G, G[]][] = [['h', { shape: 'pentagon', perimeter: 30, sides: [mix(5, 1, 2), mix(4, 3, 4), mix(6, 1, 4), mix(5, 2, 3)] }, poolG('pentagon', 4, 30, 38)]]

// one exercise, eight kinds of question: each part is built with its own maker and the parts are joined
const parts = [
  build(11, 'Choose the answer.', A_ROWS, mkA, idA, 'Fraction word problems', 6011, '3.3'),
  build(11, 'Choose the answer.', B_ROWS, mkB, idB, 'Fraction word problems', 6012, '3.3'),
  build(11, 'Choose the answer.', C_ROWS, mkC, idC, 'Fraction word problems', 6013, '3.3'),
  build(11, 'Choose the answer.', D_ROWS, mkD, idD, 'Fraction word problems', 6014, '3.3'),
  build(11, 'Choose the answer.', E_ROWS, mkE, idE, 'Fraction word problems', 6015, '3.3'),
  build(11, 'Choose the answer.', F_ROWS, mkF, idF, 'Fraction word problems', 6016, '3.3'),
  build(11, 'Choose the answer.', G_ROWS, mkG, idG, 'Fraction word problems', 6017, '3.3'),
  build(11, 'Choose the answer.', H_ROWS, mkG, idG, 'Fraction word problems', 6018, '3.3'),
]
export const EX_FRAC33 = [{ ...parts[0], questions: parts.flatMap((p) => p.questions) }]

// ---- challenge (exercise 22): the same word problems with bigger numbers: a rectangle, packages, a walk and a hexagon (5 sides known) ----
const HD = [3, 5, 6, 8, 12]
const hA = (): A[] => { const r = rng(131); return THINGS.flatMap(([what, unit]) => [0, 1].map((): A => ({ what, unit, l: rmix(r, 25, 60, HD), w: rmix(r, 15, 24, HD) }))) }
const hC = (): C[] => { const r = rng(133); return range(0, 11).map((i): C => { const p1 = rmix(r, 3, 8, HD); const p2 = rmix(r, 4, 9, HD); return { p1, p2, p3: sub(add(p1, p2), add(rmix(r, 1, 3, HD), q(1, 4))), unit: i % 2 ? 'kg' : 'pounds' } }) }
const hE = (): E[] => { const r = rng(135); return WALKERS.flatMap((who) => [0, 1].map((j): E => { const a = rmix(r, 2, 6, HD); const b = rmix(r, 1, 4, HD); return { who, a, b, total: add(add(a, b), rmix(r, 2, 5, HD)), unit: j ? 'miles' : 'km' } })) }
const hG = (): G[] => { const r = rng(138); return range(0, 11).map((): G => { const sides = range(1, 5).map(() => rmix(r, 4, 12, HD)); const tot = sides.reduce((s, x) => add(s, x), q(0, 1)); return { shape: 'hexagon', perimeter: Math.ceil(val(tot)) + between(r, 3, 9), sides } }) }
const wh = [
  build(22, 'Choose the answer.', [['a', hA()[0], hA()] as [string, A, A[]]], mkA, idA, 'Fraction word problems (challenge)', 6021, '3.3'),
  build(22, 'Choose the answer.', [['b', hC()[0], hC()] as [string, C, C[]]], mkC, idC, 'Fraction word problems (challenge)', 6022, '3.3'),
  build(22, 'Choose the answer.', [['c', hE()[0], hE()] as [string, E, E[]]], mkE, idE, 'Fraction word problems (challenge)', 6023, '3.3'),
  build(22, 'Choose the answer.', [['d', hG()[0], hG()] as [string, G, G[]]], mkG, idG, 'Fraction word problems (challenge)', 6024, '3.3'),
]
export const EX_FRAC33WH = [{ ...wh[0], questions: wh.flatMap((p) => p.questions) }]
