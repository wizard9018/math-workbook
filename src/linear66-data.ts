// Grade 9 6.6 (bank/G9-ch6/s6/items.json): estimates with a linear relation from two data points (exercise 1, the graphs, is left out).
// Every question is multiple choice and shows its whole story (the sentence with the numbers and the question) at once.
//   2 pressure (a-d: a value, e-f: interpolation / extrapolation), 3 tea (a-d, e), 5 vegetables (a-d), 7 tuition (a-d, e), 10 medals (a, b; c needs a real fact, left out),
//   4 other trends (a voters = 4, b-c population = 6, d marathon = 8, e waste = 9d)
// Lesson of a value: the rate of change m, then the change from the first point (or the change wanted for an unknown x), then the answer, then a whole number for a year.
// Lesson of interpolation / extrapolation: is the value between the two given ones? One blank per value, then the answer.
// The 10 similar questions of every question are made here from small tables (same story, other numbers); every answer and step is computed.
// Imported by: quiz.tsx, check66.ts. Shape: exercise.ts.
import type { Exercise, Practice, Question } from './exercise'
import { pick } from './simplify-data'
import { lessonWp } from './ineq64-data'
import type { Wp } from './ineq64-data'

const n4 = (x: number) => String(+x.toFixed(4))
const text = (t: string) => `\\text{${t.replace(/[%&#_]/g, (c) => `\\${c}`)}}`
const range = (a: number, b: number, s = 1) => Array.from({ length: Math.floor((b - a) / s) + 1 }, (_, i) => a + i * s)
const shuffled = <T,>(a: T[], seed: number): T[] => {
  let s = seed
  const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32)
  return [...a].sort(() => r() - 0.5)
}
type Spec = Wp['steps'][number]
const blk = (id: string, from: string, prompt: string, wrongs: string[], hint: string) => ({ id, from, prompt, wrongs, hint })
const sg = (v: number) => (v < 0 ? `(${n4(v)})` : n4(v))

// ---- a value question: two points, an unknown y (ask 'y', at = x) or an unknown x (ask 'x', at = y), maybe rounded ----
type Mode = 'after' | 'before' | 'near0' | 'near1' | null
interface P {
  sent: string
  x1: number
  y1: number
  x2: number
  y2: number
  ask: 'y' | 'x'
  at: number
  mode: Mode
  step: number // the size of a slip (in x) in the wrong choices
}
const rate = (p: P) => (p.y2 - p.y1) / (p.x2 - p.x1)
const exact = (p: P) => (p.ask === 'y' ? p.y1 + rate(p) * (p.at - p.x1) : p.x1 + (p.at - p.y1) / rate(p))
const round = (v: number, mode: Mode) => (mode === 'after' ? Math.floor(v + 1e-9) + 1 : mode === 'before' ? Math.ceil(v - 1e-9) - 1 : mode === 'near0' ? Math.round(v) : mode === 'near1' ? +v.toFixed(1) : +v.toFixed(4))
const final = (p: P) => round(exact(p), p.mode)

function wpVal(p: P, key: string): Wp {
  const m = rate(p)
  const v = exact(p)
  const ans = final(p)
  const X = p.ask === 'x'
  const slip = X ? p.step : Math.abs(m) * p.step
  const steps: Spec[] = [
    { label: 'The rate of change.', toks: [{ id: 'e1a', tex: 'm' }, { id: 'e1g', tex: '=' }, { id: 'e1b', tex: n4(m) }], blanks: [blk('e1b', 's0', `$\\dfrac{${n4(p.y2)} - ${sg(p.y1)}}{${n4(p.x2)} - ${sg(p.x1)}} = \\square$`, [n4(1 / m), n4(-m), n4(m * 10), n4(m / 10)], 'The change of the second quantity divided by the change of the first one.')] },
  ]
  if (X) {
    const d = p.at - p.y1
    const dx = d / m
    steps.push(
      { label: 'The change wanted.', toks: [{ id: 'e2a', tex: '\\Delta y' }, { id: 'e2g', tex: '=' }, { id: 'e2b', tex: n4(d) }], blanks: [blk('e2b', 'e1b', `$${n4(p.at)} - ${sg(p.y1)} = \\square$`, [n4(-d), n4(p.at + p.y1), n4(d + Math.abs(m) * p.step)], 'The wanted value minus the first value.')] },
      { label: 'The change of the other quantity.', toks: [{ id: 'e3a', tex: '\\Delta x' }, { id: 'e3g', tex: '=' }, { id: 'e3b', tex: n4(dx) }], blanks: [blk('e3b', 'e2b', `$${n4(d)} \\div ${sg(m)} = \\square$`, [n4(-dx), n4(d * m), n4(dx + slip)], 'Divide the change by the rate of change.')] },
      { label: 'The answer.', toks: [{ id: 'e4a', tex: 'x' }, { id: 'e4g', tex: '=' }, { id: 'e4b', tex: n4(v) }], blanks: [blk('e4b', 'e3b', `$${n4(p.x1)} + ${sg(dx)} = \\square$`, [n4(p.x1 - dx), n4(v + slip), n4(v - slip)], 'The first x plus the change.')] },
    )
  } else {
    const ch = m * (p.at - p.x1)
    steps.push(
      { label: 'The change from the first point.', toks: [{ id: 'e2a', tex: '\\Delta y' }, { id: 'e2g', tex: '=' }, { id: 'e2b', tex: n4(ch) }], blanks: [blk('e2b', 'e1b', `$${sg(m)} \\cdot (${n4(p.at)} - ${sg(p.x1)}) = \\square$`, [n4(-ch), n4(m * p.at), n4(ch + slip)], 'The rate of change times the distance from the first point.')] },
      { label: 'The answer.', toks: [{ id: 'e3a', tex: 'y' }, { id: 'e3g', tex: '=' }, { id: 'e3b', tex: n4(v) }], blanks: [blk('e3b', 'e2b', `$${n4(p.y1)} + ${sg(ch)} = \\square$`, [n4(p.y1 - ch), n4(v + slip), n4(v - slip)], 'The first value plus the change.')] },
    )
  }
  if (p.mode) {
    const last = steps[steps.length - 1].toks[2].id
    const how = p.mode === 'after' ? 'the first whole year after' : p.mode === 'before' ? 'the last whole year before' : p.mode === 'near0' ? 'rounded to a whole number:' : 'rounded to one decimal place:'
    const wr = p.mode === 'after' || p.mode === 'before' ? [ans + 1, ans - 1, Math.round(v), p.mode === 'after' ? Math.floor(v) : Math.ceil(v)] : [ans + (p.mode === 'near0' ? 1 : 0.1), ans - (p.mode === 'near0' ? 1 : 0.1), +v.toFixed(2)]
    steps.push({ label: p.ask === 'x' ? 'A whole number.' : 'Round.', toks: [{ id: 'e9', tex: n4(ans) }], blanks: [blk('e9', last, `$${n4(+v.toFixed(2))} \\;\\to\\; \\square$`, wr.map(n4), `The answer is ${how} ${n4(+v.toFixed(2))}.`)] })
  }
  const wr = [ans + slip, ans - slip, ans + 2 * slip, ans - 2 * slip, -ans].map((w) => n4(round(w, p.mode === 'after' || p.mode === 'before' ? 'near0' : p.mode)))
  return { tex: text(p.sent), short: `(${n4(p.x1)},\\, ${n4(p.y1)}),\\ (${n4(p.x2)},\\, ${n4(p.y2)})`, key, answer: n4(ans), wrong: wr, steps }
}

// ---- an interpolation / extrapolation question: values asked about, between the two given x or not ----
interface C {
  sent: string
  x1: number
  x2: number
  vals: number[]
}
const inside = (c: C, v: number) => v > Math.min(c.x1, c.x2) && v < Math.max(c.x1, c.x2)
const IN = '\\text{interpolation}'
const EX = '\\text{extrapolation}'
const one = (c: C) => c.vals.every((v) => inside(c, v)) || c.vals.every((v) => !inside(c, v)) // the answer is one word
const list = (vs: number[]) => (vs.length ? vs.join(',\\ ') : '\\text{none}')
const clsTex = (ins: number[], outs: number[]) => `\\text{Interpolation: } ${list(ins)} \\quad \\text{Extrapolation: } ${list(outs)}`
const clsAnswer = (c: C) => (one(c) ? (inside(c, c.vals[0]) ? '\\text{Interpolation}' : '\\text{Extrapolation}') : clsTex(c.vals.filter((v) => inside(c, v)), c.vals.filter((v) => !inside(c, v))))
const clsWrong = (c: C) => {
  const ins = c.vals.filter((v) => inside(c, v))
  const outs = c.vals.filter((v) => !inside(c, v))
  return one(c) ? [inside(c, c.vals[0]) ? '\\text{Extrapolation}' : '\\text{Interpolation}'] : [clsTex(outs, ins), clsTex(c.vals, []), clsTex([], c.vals)]
}
function wpCls(c: C, key: string): Wp {
  const lo = Math.min(c.x1, c.x2)
  const hi = Math.max(c.x1, c.x2)
  const toks = c.vals.map((v, i) => ({ id: `c${i}`, tex: inside(c, v) ? IN : EX }))
  const blanks = c.vals.map((v, i) => blk(`c${i}`, 's0', `$${n4(v)} \\text{ between } ${n4(lo)} \\text{ and } ${n4(hi)}\\,?$`, [inside(c, v) ? EX : IN], 'Between the two given numbers: interpolation. Outside them: extrapolation.'))
  const steps: Spec[] = [
    { label: 'Between the given numbers?', toks, blanks },
    { label: 'The answer.', toks: [{ id: 'f9', tex: clsAnswer(c) }], blanks: [blk('f9', 'c0', '$\\text{Which are interpolations, which extrapolations?}$', clsWrong(c), 'Look at your answers above.')] },
  ]
  return { tex: text(c.sent), short: `${n4(lo)} \\text{ and } ${n4(hi)}`, key, answer: clsAnswer(c), wrong: clsWrong(c), steps }
}

// ---- the stories (a family: its sentence, the lines y = y0 + k (x - xo) of the similar questions, the pairs of x, the values asked about) ----
type Line = [number, number] // y0 at xo, k
interface Fam {
  story: (p: P, q: string) => string
  lines: Line[]
  xo: number
  pairs: [number, number][]
  ats: number[]
  step: number
}
const yOf = (l: Line, xo: number) => (x: number) => +(l[0] + l[1] * (x - xo)).toFixed(4)
const mkP = (f: Fam, l: Line, x1: number, x2: number, ask: 'y' | 'x', t: number, mode: Mode, q: (p: P) => string, direct: boolean): P => {
  const y = yOf(l, f.xo)
  const p: P = { sent: '', x1, y1: y(x1), x2, y2: y(x2), ask, at: ask === 'x' && !direct ? y(t) : t, mode, step: f.step }
  p.sent = f.story(p, q(p))
  return p
}
const bookP = (f: Fam, x1: number, y1: number, x2: number, y2: number, ask: 'y' | 'x', at: number, mode: Mode, q: (p: P) => string): P => {
  const p: P = { sent: '', x1, y1, x2, y2, ask, at, mode, step: f.step }
  p.sent = f.story(p, q(p))
  return p
}
const nice = (p: P) => Number.isFinite(final(p)) && Math.abs(final(p)) < 1e9 && Math.abs(rate(p)) > 0

interface Def {
  ask: 'y' | 'x'
  mode?: Mode
  q: (p: P) => string
  book: [number, number, number, number, number] // x1, y1, x2, y2, at
  pairs?: [number, number][]
  ats?: number[]
  direct?: boolean // at (of the similar questions) is the value of y itself (a threshold)
}
type Item = P | C
type Q6 = [string, Item, Item[]]
const isC = (x: Item): x is C => 'vals' in x
const valueParts = (f: Fam, defs: Def[]): Item[][] =>
  defs.map((d) => [
    bookP(f, ...(d.book.slice(0, 4) as [number, number, number, number]), d.ask, d.book[4], d.mode ?? null, d.q),
    ...f.lines.flatMap((l) => (d.pairs ?? f.pairs).flatMap(([a, b]) => (d.ats ?? f.ats).filter((t) => d.direct || (t !== a && t !== b)).map((t) => mkP(f, l, a, b, d.ask, t, d.mode ?? null, d.q, !!d.direct)))),
  ])
// a classification: the values are all inside, all outside (two values), or two inside and two outside (four values)
const clsParts = (f: Fam, q: (vals: number[]) => string, book: C['vals'], kind: 'in' | 'out' | 'mixed', seed: number): Item[] => {
  const mk = (x1: number, x2: number, vals: number[]): C => ({ sent: f.story(mkP(f, f.lines[0], x1, x2, 'y', x1, null, () => '', false), q(vals)), x1, x2, vals })
  const bp = f.pairs[0]
  const pool = f.pairs.flatMap(([a, b], i) => {
    const c0: C = { sent: '', x1: a, x2: b, vals: [] }
    const ins = shuffled(f.ats.filter((t) => inside(c0, t)), seed + i)
    const outs = shuffled(f.ats.filter((t) => !inside(c0, t)), seed + i + 50)
    const sets = kind === 'in' ? [ins.slice(0, 2), ins.slice(2, 4)] : kind === 'out' ? [outs.slice(0, 2), outs.slice(2, 4)] : [[...ins.slice(0, 2), ...outs.slice(0, 2)], [...ins.slice(2, 4), ...outs.slice(2, 4)]]
    return sets.filter((s) => s.length === (kind === 'mixed' ? 4 : 2)).map((s) => mk(a, b, kind === 'mixed' ? s.sort((u, v) => u - v) : s))
  })
  return [mk(bp[0], bp[1], book), ...pool]
}

const PRESS: Fam = {
  story: (p, q) => `The pressure at ${n4(p.x1)} meters below sea level in the ocean is ${n4(p.y1)} atmospheres. With the depth at ${n4(p.x2)} meters, the pressure is ${n4(p.y2)} atmospheres. ${q}`,
  lines: [[4, 0.1], [3, 0.1], [2, 0.05], [5, 0.2], [4, 0.05]], xo: 30, pairs: [[30, 120], [20, 100], [40, 140], [50, 150], [30, 90], [20, 60], [10, 90]], ats: range(10, 180, 10), step: 10,
}
const TEA: Fam = {
  story: (p, q) => `Suppose that a tea wholesaler will sell ${n4(p.x1)} kg of tea at ${n4(p.y1)} dollars per kg and ${n4(p.x2)} kg of tea at ${n4(p.y2)} dollars per kg. ${q}`,
  lines: [[25, -0.15], [24, -0.2], [30, -0.25], [28, -0.1], [22, -0.1]], xo: 20, pairs: [[20, 70], [10, 60], [20, 80], [30, 70], [10, 50], [20, 60], [40, 90]], ats: range(10, 150, 10), step: 10,
}
const VEG: Fam = {
  story: (p, q) => `The average Canadian ate ${n4(p.y2)} kg of vegetables in ${p.x2}. In ${p.x1} the average Canadian ate ${n4(p.y1)} kg of vegetables. If this trend continues: ${q}`,
  lines: [[106, 0.4], [100, 0.5], [110, 0.3], [95, 0.6], [105, 0.2]], xo: 1992, pairs: [[1992, 2002], [1990, 2000], [1995, 2005], [1985, 2000], [1992, 2007]], ats: range(1975, 2035), step: 1,
}
const TUIT: Fam = {
  story: (p, q) => `Canadian university tuition fees averaged ${n4(p.y1)} dollars in ${p.x1} and ${n4(p.y2)} dollars in ${p.x2}. If there is a linear relation in fee increases: ${q}`,
  lines: [[1964, 200], [2000, 150], [1800, 250], [2200, 180], [1500, 300]], xo: 1990, pairs: [[1990, 2004], [1990, 2000], [1995, 2005], [1985, 2000], [1990, 2010]], ats: range(1975, 2035), step: 1,
}
const MEDAL: Fam = {
  story: (p, q) => `Canada's Winter Olympic medal count was ${n4(p.y1)} in ${p.x1} and ${n4(p.y2)} in ${p.x2}. ${q}`,
  lines: [[17, 0.5], [15, 1], [20, 1.5], [12, 0.75], [10, 2]], xo: 2002, pairs: [[1994, 2002], [1998, 2006], [2002, 2006], [1994, 1998], [1998, 2002]], ats: range(1990, 2030, 4), step: 4,
}
const VOTE: Fam = {
  story: (p, q) => `The number of registered voters in Canada compared to the number of people eligible to vote was ${n4(p.y1)}% in ${p.x1} and ${n4(p.y2)}% in ${p.x2}. If this trend continues, ${q}`,
  lines: [[64.7, -2.8], [70, -2.5], [66.4, -1.6], [72, -3], [60.5, -1.5]], xo: 2006, pairs: [[2006, 2008], [2006, 2010], [2005, 2009]], ats: [50, 45, 40, 55], step: 1,
}
const POP: Fam = {
  story: (p, q) => `World population was estimated as ${n4(p.y1)} billion people in ${p.x1} and ${n4(p.y2)} billion people in ${p.x2}. ${q}`,
  lines: [[4, 0.08], [5, 0.075], [3, 0.1], [6, 0.06], [2, 0.09]], xo: 1975, pairs: [[1975, 2012], [1975, 1999], [1987, 2012], [1975, 1987]], ats: [2030, 2040, 2050, 2060, 2025], step: 5,
}
const POPYEAR: Fam = { ...POP, ats: [8, 9, 10, 11] }
const MARA: Fam = {
  story: (p, q) => `World record times for the men's marathon were ${n4(p.y1)} seconds in ${p.x1} and ${n4(p.y2)} seconds in ${p.x2}. These times approximate a linear function. If this trend continues, ${q}`,
  lines: [[7542, -12], [7500, -10], [7600, -15], [7560, -8], [7520, -9]], xo: 1999, pairs: [[1999, 2008], [1999, 2003], [2003, 2008]], ats: [7200], step: 1,
}
const WASTE: Fam = {
  story: (p, q) => `The total amount of non-hazardous waste disposed of in Canada was ${n4(p.y1)} tons in ${p.x1}, and ${n4(p.y2)} tons in ${p.x2}. If Canadians do not recycle more and this trend continues, ${q}`,
  lines: [[15000000, 750000], [10000000, 1000000], [20000000, 800000], [12000000, 500000], [18000000, 600000]], xo: 1990, pairs: [[1990, 2006], [1990, 2000], [1995, 2005]], ats: [40000000, 50000000, 60000000], step: 1,
}

const pressVals = valueParts(PRESS, [
  { ask: 'y', q: (p) => `Determine the pressure at ${n4(p.at)} meters.`, book: [30, 4, 120, 13, 90] },
  { ask: 'y', q: (p) => `Determine the pressure at ${n4(p.at)} meters.`, book: [30, 4, 120, 13, 135] },
  { ask: 'x', q: (p) => `At what depth is the pressure ${n4(p.at)} atmospheres?`, book: [30, 4, 120, 13, 9] },
  { ask: 'x', q: (p) => `At what depth is the pressure ${n4(p.at)} atmospheres?`, book: [30, 4, 120, 13, 17] },
])
const letters = (rows: Item[][], first = 0): Q6[] => rows.map((r, i) => [String.fromCharCode(97 + first + i), r[0], r.slice(1)])
const EX2 = [
  ...letters(pressVals),
  ...(['in', 'out'] as const).map((kind, i): Q6 => {
    const r = clsParts(PRESS, (v) => `The pressures asked for at ${v.map(n4).join(' meters and at ')} meters are estimated from these two. Are these estimates examples of interpolation or extrapolation? (choose one)`, kind === 'in' ? [90, 80] : [135, 160], kind, 6720)
    return [String.fromCharCode(101 + i), r[0], r.slice(1)]
  }),
]

const teaVals = valueParts(TEA, [
  { ask: 'y', q: (p) => `What should the wholesaler's price be for ${n4(p.at)} kg of tea?`, book: [20, 25, 70, 17.5, 50] },
  { ask: 'y', q: (p) => `What should the wholesaler's price be for ${n4(p.at)} kg of tea?`, book: [20, 25, 70, 17.5, 100] },
  { ask: 'x', mode: 'near1', q: (p) => `How much tea must be purchased to get a price of ${n4(p.at)} dollars per kg?`, book: [20, 25, 70, 17.5, 22.5] },
  { ask: 'x', mode: 'near1', q: (p) => `How much tea must be purchased to get a price of ${n4(p.at)} dollars per kg?`, book: [20, 25, 70, 17.5, 15] },
])
const EX3: Q6[] = [
  ...letters(teaVals),
  (() => {
    const r = clsParts(TEA, (v) => `The amounts bought are ${v.map(n4).join(' kg, ')} kg. Which are examples of interpolation? Extrapolation?`, [50, 100, 36.7, 86.7], 'mixed', 6730)
    return ['e', r[0], r.slice(1)] as Q6
  })(),
]

const vegVals = valueParts(VEG, [
  { ask: 'x', mode: 'after', q: (p) => `What year will we average ${n4(p.at)} kg of vegetables eaten?`, book: [1992, 106, 2002, 110, 120], direct: true, ats: [118, 120, 122, 125, 130] },
  { ask: 'x', mode: 'near0', q: (p) => `What year did we average only ${n4(p.at)} kg of vegetables eaten?`, book: [1992, 106, 2002, 110, 102], direct: true, ats: [98, 100, 102, 104] },
  { ask: 'y', mode: 'near1', q: (p) => `What was the average amount of vegetables eaten in ${n4(p.at)}?`, book: [1992, 106, 2002, 110, 1998], ats: range(1993, 2001) },
  { ask: 'y', mode: 'near1', q: (p) => `How many kilograms of vegetables will likely be eaten in ${n4(p.at)}?`, book: [1992, 106, 2002, 110, 2015], ats: range(2008, 2025) },
])

const tuitVals = valueParts(TUIT, [
  { ask: 'x', mode: 'before', q: (p) => `In what year was the fee last below ${n4(p.at)} dollars?`, book: [1990, 1964, 2004, 4572, 1000], direct: true, ats: [1000, 1500, 1200, 800] },
  { ask: 'x', mode: 'after', q: (p) => `In what year will tuition fees first exceed ${n4(p.at)} dollars?`, book: [1990, 1964, 2004, 4572, 9000], direct: true, ats: [8000, 9000, 10000, 7000] },
  { ask: 'y', mode: 'near0', q: (p) => `What was the tuition charged in the year ${n4(p.at)}?`, book: [1990, 1964, 2004, 4572, 2000], ats: range(1992, 2003) },
  { ask: 'y', mode: 'near0', q: (p) => `What will be the tuition charged in the year ${n4(p.at)}?`, book: [1990, 1964, 2004, 4572, 2015], ats: range(2008, 2020) },
])
const EX7: Q6[] = [
  ...letters(tuitVals),
  (() => {
    const r = clsParts(TUIT, (v) => `The estimates are for the years ${v.map(n4).join(', ')}. Which are examples of interpolation? Extrapolation?`, [1984, 2028, 2000, 2015], 'mixed', 6770)
    return ['e', r[0], r.slice(1)] as Q6
  })(),
]

const medalVals = valueParts(MEDAL, [
  { ask: 'y', mode: 'near0', q: (p) => `Predict the number of medals Canada should win in ${n4(p.at)}.`, book: [1994, 13, 2002, 17, 2006], pairs: [[1994, 2002], [1994, 1998], [1998, 2002], [1998, 2006]], ats: [2006, 2010, 2014] },
  { ask: 'y', mode: 'near0', q: (p) => `Using these figures, how many medals should Canada win in ${n4(p.at)}?`, book: [2002, 17, 2006, 24, 2010], pairs: [[2002, 2006], [1998, 2002], [1998, 2006], [1994, 2002]], ats: [2010, 2014, 2018] },
])

const trends = [
  ...valueParts(VOTE, [{ ask: 'x', mode: 'after', q: (p) => `in what year will there be less than ${n4(p.at)}% of the eligible voters registered to vote?`, book: [2006, 64.7, 2008, 59.1, 50], direct: true }]),
  ...valueParts(POP, [{ ask: 'y', mode: 'near1', q: (p) => `Estimate the world population in ${n4(p.at)}.`, book: [1975, 4, 2012, 7, 2050] }]),
  ...valueParts(POPYEAR, [{ ask: 'x', mode: 'after', q: (p) => `Estimate the year the population reaches ${n4(p.at)} billion people.`, book: [1975, 4, 2012, 7, 9], direct: true }]),
  ...valueParts(MARA, [{ ask: 'x', mode: 'after', q: () => 'what year will the world record break the two hour barrier (7200 seconds)?', book: [1999, 7542, 2008, 7439, 7200], direct: true }]),
  ...valueParts(WASTE, [{ ask: 'x', mode: 'after', q: (p) => `what year will we have over ${n4(p.at)} tons of disposable waste?`, book: [1990, 15226766, 2006, 27249178, 50000000], direct: true }]),
]

function build(no: number, qs: Q6[], prompt: string): Exercise {
  const questions: Question[] = qs.map(([part, bk, pool], idx): Question => {
    const seen = new Set([bk.sent])
    const bank = shuffled(pool, 6700 + no * 10 + idx).filter((x) => (isC(x) || nice(x)) && !seen.has(x.sent) && !!seen.add(x.sent)).slice(0, 10)
    const make = (x: Item, k: string, j: number): Practice => {
      const id = `lin${no}${k}`
      const w = isC(x) ? wpCls(x, id) : wpVal(x, id)
      const [choices, correct] = pick(w.answer, w.wrong, idx + j)
      return { tex: w.tex, choices, correct, why: '', lesson: () => lessonWp(isC(x) ? wpCls(x, id) : wpVal(x, id), `Grade 9, 6.6 exercise ${no}${k}`, 'Linear estimate', idx + j) }
    }
    return { part, ...make(bk, part, 0), practice: bank.map((x, j) => make(x, `${part}${j + 1}`, j + 1)) }
  })
  return { no, sec: '6.6', prompt, mathChoices: true, questions }
}

export const EX_LINEAR66 = [
  build(2, EX2, 'Choose the answer.'),
  build(3, EX3, 'Choose the answer.'),
  build(4, letters(trends), 'Choose the answer.'),
  build(5, letters(vegVals), 'Choose the answer.'),
  build(7, [...letters(tuitVals), EX7[4]], 'Choose the answer.'),
  build(10, letters(medalVals), 'Choose the answer.'),
]
