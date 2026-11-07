// Grade 9 4.1 (bank/G9-ch4/s1/items.json): linear equations and patterns. Exercises 7 (polygon pictures) and 12 (Fibonacci) are left out; 8-11 (word problems) are merged into exercise 7 here.
//   1 evaluate A = 3p, 2 evaluate S = 4n - 2 (the last part: the value is x + 2 / x - 1), 3 common difference, 4 the next three numbers, 5 an equation from a table,
//   6 the 50th term, 7 word problems (a, b yearbook = 8; c, d car = 9; e, f tournament = 10; g, h graduation = 11)
// Every question is multiple choice. The lessons are blanks (lessons.ts `blanks`, built with lessonWp of ineq64-data.ts): the substitution, the difference, the equation ...
// The 10 similar questions of every question are made here from small tables (same kind, other numbers); every answer and step is computed.
// Imported by: quiz.tsx, check41.ts. Shape: exercise.ts.
import type { Exercise, Practice, Question } from './exercise'
import { pick } from './simplify-data'
import { lessonWp } from './ineq64-data'
import type { Wp } from './ineq64-data'

export const n4 = (x: number) => String(+x.toFixed(4))
export const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i)
export const shuffled = <T,>(a: T[], seed: number): T[] => {
  let s = seed
  const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32)
  return [...a].sort(() => r() - 0.5)
}
type Spec = Wp['steps'][number]
export const blk = (id: string, from: string, prompt: string, wrongs: string[], hint: string) => ({ id, from, prompt, wrongs, hint })
// a number as TeX: a decimal (dec) or a fraction with a small denominator
export const num = (v: number, dec = true): string => {
  if (dec || Number.isInteger(v)) return n4(v)
  for (let d = 2; d <= 12; d++) if (Math.abs(v * d - Math.round(v * d)) < 1e-9) return `${v < 0 ? '-' : ''}\\frac{${Math.abs(Math.round(v * d))}}{${d}}`
  return n4(v)
}
export const par = (v: number, dec = true) => (v < 0 ? `(${num(v, dec)})` : num(v, dec))
export const plus = (v: number, dec = true) => (v < 0 ? `- ${num(-v, dec)}` : `+ ${num(v, dec)}`)
export const text = (t: string) => `\\text{${t.replace(/[%&#_]/g, (c) => `\\${c}`)}}`
export const nearby = (v: number, d: number, dec = true) => [v + d, v - d, v + 2 * d, v - 2 * d, -v, v + 1, v - 1].map((x) => num(x, dec))
// a x + b as TeX
export const lin = (a: number, v: string, b: number, dec = true) => `${a === 1 ? '' : a === -1 ? '-' : num(a, dec)}${v}${b === 0 ? '' : ` ${plus(b, dec)}`}`

// ================= exercises 1 and 2: evaluate L = a v + c =================
interface Ev {
  L: string
  v: string
  a: number
  c: number
  n?: number // the value of v
  k?: number // or the value is x + k
}
const evEq = (e: Ev) => `${e.L} = ${lin(e.a, e.v, e.c)}`
const evVal = (e: Ev) => (e.n !== undefined ? String(e.n) : `x ${plus(e.k!)}`)
const evTex = (e: Ev) => `${text('In the equation ')}${evEq(e)}${text(', determine ')}${e.L}${text(' when ')}${e.v}${text(' is ')}${evVal(e)}\\text{.}`
function wpEv(e: Ev, key: string): Wp {
  const cTex = e.c === 0 ? '' : ` ${plus(e.c)}`
  const steps: Spec[] = []
  const sub = e.n !== undefined ? `${e.a} \\cdot ${par(e.n)}${cTex}` : `${e.a}(x ${plus(e.k!)})${cTex}`
  const wrongSub = e.n !== undefined ? [`${e.a} + ${par(e.n)}${cTex}`, `${e.a} \\cdot ${par(-e.n)}${cTex}`, `${par(e.n)}${cTex}`] : [`${e.a}x ${plus(e.k!)}${cTex}`, `${e.a} + (x ${plus(e.k!)})${cTex}`]
  // a number: the coefficient is written on the line, the blank is the sign and the value (· 20, + 20, - 20, ÷ 20)
  const withA = e.n !== undefined && e.a !== 1
  const sign = (o: string) => `${o} ${par(e.n!)}${cTex}`
  steps.push({
    label: 'Substitute.',
    toks: [{ id: 'e1a', tex: e.L }, { id: 'e1g', tex: '=' }, ...(withA ? [{ id: 'e1p', tex: String(e.a) }] : []), { id: 'e1b', tex: withA ? sign('\\cdot') : sub }],
    blanks: [blk('e1b', 's0', withA ? `$${e.L} = ${e.a}\\,\\square\\,${par(e.n!)}${cTex}$` : `$${e.L} = ${e.a === 1 ? '' : e.a}\\,\\square${cTex}$`, withA ? [sign('+'), sign('-'), sign('\\div')] : wrongSub, withA ? `$${e.a}$ times $${par(e.n!)}$: which sign goes between them?` : `Write the value in the place of $${e.v}$.`)],
  })
  let answer: string
  let wrong: string[]
  if (e.n !== undefined) {
    const val = e.a * e.n + e.c
    answer = n4(val)
    wrong = nearby(val, e.a)
    steps.push({ label: 'Calculate.', toks: [{ id: 'e2a', tex: e.L }, { id: 'e2g', tex: '=' }, { id: 'e2b', tex: answer }], blanks: [blk('e2b', 'e1b', `$${sub}$`, wrong, 'Multiply first, then add or subtract.')] })
  } else {
    const k = e.k!
    const ak = e.a * k
    const tot = ak + e.c
    const expanded = `${e.a}x ${plus(ak)}${cTex}`
    answer = lin(e.a, 'x', tot)
    wrong = [lin(e.a, 'x', k + e.c), lin(e.a, 'x', e.c - ak), lin(e.a, 'x', ak - e.c), lin(e.a, 'x', e.c)]
    steps.push({ label: 'Remove the brackets.', toks: [{ id: 'e2a', tex: e.L }, { id: 'e2g', tex: '=' }, { id: 'e2b', tex: expanded }], blanks: [blk('e2b', 'e1b', `$${e.a}(x ${plus(k)}) = \\square$`, [`${e.a}x ${plus(k)}${cTex}`, `${e.a}x ${plus(-ak)}${cTex}`, `${e.a + k}x${cTex}`], `Multiply both terms in the bracket by $${e.a}$.`)] })
    if (e.c !== 0) steps.push({ label: 'Collect.', toks: [{ id: 'e3a', tex: e.L }, { id: 'e3g', tex: '=' }, { id: 'e3b', tex: answer }], blanks: [blk('e3b', 'e2b', `$${expanded}$`, wrong, 'Add the numbers.')] })
  }
  return { tex: evTex(e), short: evEq(e), key, answer, wrong, steps }
}
const LET: [string, string][] = [['A', 'p'], ['B', 'q'], ['T', 'n'], ['S', 'm'], ['C', 'x'], ['P', 'r']]
const evPool = (ns: number[], cs: number[], as: number[], ks: number[]): Ev[] =>
  LET.flatMap(([L, v], i) => as.filter((_, j) => (i + j) % 2 === 0 || as.length < 4).flatMap((a) => cs.flatMap((c) => (ks.length ? ks.map((k): Ev => ({ L, v, a, c, k })) : ns.map((n): Ev => ({ L, v, a, c, n }))))))
const EV1: [string, Ev, Ev[]][] = [
  ['a', { L: 'A', v: 'p', a: 3, c: 0, n: 3 }, evPool(range(2, 9), [0], [2, 3, 4, 5, 6, 7], [])],
  ['b', { L: 'A', v: 'p', a: 3, c: 0, n: 5 }, evPool(range(2, 9), [0], [2, 3, 4, 5, 6, 7], [])],
  ['c', { L: 'A', v: 'p', a: 3, c: 0, n: 11 }, evPool(range(10, 20), [0], [2, 3, 4, 5, 6], [])],
  ['d', { L: 'A', v: 'p', a: 3, c: 0, n: 17 }, evPool(range(10, 20), [0], [2, 3, 4, 5, 6], [])],
  ['e', { L: 'A', v: 'p', a: 3, c: 0, n: -6 }, evPool(range(-9, -2), [0], [2, 3, 4, 5, 6, 7], [])],
  ['f', { L: 'A', v: 'p', a: 3, c: 0, k: 2 }, evPool([], [0], [2, 3, 4, 5, 6, 7], [-5, -4, -3, -2, 1, 2, 3, 4, 5])],
]
const EV2: [string, Ev, Ev[]][] = [
  ['a', { L: 'S', v: 'n', a: 4, c: -2, n: 4 }, evPool(range(2, 9), [-1, -2, -3, 1, 2, 3, 5], [2, 3, 4, 5, 6], [])],
  ['b', { L: 'S', v: 'n', a: 4, c: -2, n: 9 }, evPool(range(8, 15), [-1, -2, -3, 1, 2, 3, 5], [2, 3, 4, 5, 6], [])],
  ['c', { L: 'S', v: 'n', a: 4, c: -2, n: 18 }, evPool(range(15, 25), [-1, -2, -3, 1, 2, 3], [2, 3, 4, 5, 6], [])],
  ['d', { L: 'S', v: 'n', a: 4, c: -2, n: 23 }, evPool(range(20, 30), [-1, -2, -3, 1, 2, 3], [2, 3, 4, 5, 6], [])],
  ['e', { L: 'S', v: 'n', a: 4, c: -2, n: 41 }, evPool(range(30, 50), [-1, -2, -3, 1, 2, 3], [2, 3, 4, 5, 6], [])],
  ['f', { L: 'S', v: 'n', a: 4, c: -2, k: -1 }, evPool([], [-1, -2, -3, 1, 2, 3], [2, 3, 4, 5, 6], [-4, -3, -2, -1, 1, 2, 3])],
]

// ================= exercises 3-6: arithmetic sequences =================
export interface Sq {
  a: number // the first term
  d: number
  dec: boolean
  nth?: number // exercise 6
  surd?: { terms: string[]; d: string; dPrompt: string; wrong: string[] } // exercise 3 g, h
}
const terms = (s: Sq, k: number) => range(0, k - 1).map((i) => s.a + i * s.d)
const seqTex = (s: Sq, k: number) => (s.surd ? s.surd.terms.join(',\\ ') : terms(s, k).map((v) => num(v, s.dec)).join(',\\ ')) + ',\\ \\dots'
const dPrompt = (s: Sq) => (s.surd ? s.surd.dPrompt : `${num(s.a + s.d, s.dec)} - ${par(s.a, s.dec)}`)
const dWrong = (s: Sq) => (s.surd ? s.surd.wrong : nearby(s.d, 1, s.dec).concat([num(s.a, s.dec)]))
const dStep = (s: Sq): Spec => ({ label: 'The common difference.', toks: [{ id: 'd1a', tex: 'd' }, { id: 'd1g', tex: '=' }, { id: 'd1c', tex: dPrompt(s) }, { id: 'd1h', tex: '=' }, { id: 'd1b', tex: s.surd ? s.surd.d : num(s.d, s.dec) }], blanks: [blk('d1b', 's0', `$${dPrompt(s)} = \\square$`, dWrong(s), 'The second term minus the first term.')] })

export const ex3 = (s: Sq, key: string): Wp => ({ tex: `${text('Determine the common difference in the linear pattern: ')}${seqTex(s, 4)}`, short: seqTex(s, 4), key, answer: s.surd ? s.surd.d : num(s.d, s.dec), wrong: dWrong(s), steps: [dStep(s)] })
function ex4(s: Sq, key: string): Wp {
  const k = s.dec ? 3 : 4
  const nx = [0, 1, 2].map((i) => s.a + (k + i) * s.d)
  const last = s.a + (k - 1) * s.d
  const list = (v: number[]) => v.map((x) => num(x, s.dec)).join(',\\ ')
  const ans = list(nx)
  const wrong = [list(nx.map((_, i) => last - (i + 1) * s.d)), list(nx.map((_, i) => last + (i + 1) * (s.d + 1))), list(nx.map((_, i) => last + (i + 1) * (s.d - 1))), list(nx.map((_, i) => last + i * s.d))]
  // one line per new term: 19 + 5 = 24, then 19 + 5 + 5 = 29 ... (the blank asks for the step from the term before)
  const next = nx.map((v, i): Spec => ({
    label: 'The next term.',
    toks: [{ id: `e${i}`, tex: `${num(last, s.dec)}${` ${plus(s.d, s.dec)}`.repeat(i + 1)}` }, { id: `g${i}`, tex: '=' }, { id: `n${i}`, tex: num(v, s.dec) }],
    blanks: [blk(`n${i}`, i === 0 ? 'd1b' : `n${i - 1}`, `$${num(i === 0 ? last : nx[i - 1], s.dec)} ${plus(s.d, s.dec)} = \\square$`, nearby(v, s.d, s.dec), 'Add the common difference to the last term.')],
  }))
  return { tex: `${text('Determine the next three numbers in the linear pattern: ')}${seqTex(s, k)}`, short: seqTex(s, k), key, answer: ans, wrong, steps: [dStep(s), ...next] }
}
const eqT = (s: Sq) => `y = ${lin(s.d, 'x', s.a - s.d, s.dec)}`
const tableTex = (s: Sq) => `\\begin{array}{c|cccc} x & 1 & 2 & 3 & 4 \\\\ \\hline y & ${terms(s, 4).map((v) => num(v, s.dec)).join(' & ')} \\end{array}`
export function ex5(s: Sq, key: string): Wp {
  const c = s.a - s.d
  const d = s.d
  const wr = [`y = ${lin(c, 'x', d, s.dec)}`, `y = ${lin(d, 'x', -c, s.dec)}`, `y = ${lin(d, 'x', s.a, s.dec)}`, `y = ${lin(d + 1, 'x', c, s.dec)}`, `y = ${lin(-d, 'x', c, s.dec)}`]
  const steps: Spec[] = [
    { label: 'The common difference.', indent: -170, toks: [{ id: 'd1a', tex: 'm' }, { id: 'd1g', tex: '=' }, { id: 'd1f', tex: 'y_2 - y_1' }, { id: 'd1i', tex: '=' }, { id: 'd1c', tex: `${num(s.a + d, s.dec)} - ${par(s.a, s.dec)}` }, { id: 'd1h', tex: '=' }, { id: 'd1b', tex: num(d, s.dec) }], blanks: [blk('d1b', 'sm', `$${num(s.a + d, s.dec)} - ${par(s.a, s.dec)} = \\square$`, nearby(d, 1, s.dec), 'The second y minus the first y (x goes up by 1).')] },
    { label: 'The number that is added.', indent: 250, lift: 120, toks: [{ id: 'c1a', tex: 'b' }, { id: 'c1g', tex: '=' }, { id: 'c1c', tex: `${num(s.a, s.dec)} - ${par(d, s.dec)} \\cdot 1` }, { id: 'c1h', tex: '=' }, { id: 'c1b', tex: num(c, s.dec) }], blanks: [blk('c1b', 'sb', `$${num(s.a, s.dec)} - ${par(d, s.dec)} \\cdot 1 = \\square$`, nearby(c, 1, s.dec).concat([num(s.a, s.dec)]), 'The first y minus m times 1 (the first x).')] },
    { label: 'The equation.', landArrows: [{ from: ['d1b'], to: ['tm'] }, { from: ['c1b'], to: ['tb'] }], toks: [{ id: 'ty', tex: 'y' }, { id: 'te', tex: '=' }, { id: 'tm', tex: 'm' }, { id: 'tx', tex: 'x' }, { id: 'tp', tex: '+' }, { id: 'tb', tex: 'b' }, { id: 'q1h', tex: '=' }, { id: 'q1', tex: eqT(s) }], blanks: [blk('q1', 'c1b', '$y = m\\,x + b$', wr, 'Put m in front of x and add b.')] },
  ]
  return { tex: tableTex(s), short: 'y = m\\,x + b', startToks: [{ id: 'sy', tex: 'y' }, { id: 'se', tex: '=' }, { id: 'sm', tex: 'm' }, { id: 'sx', tex: 'x' }, { id: 'sp', tex: '+' }, { id: 'sb', tex: 'b' }], key, answer: eqT(s), wrong: wr, steps }
}
export function ex6(s: Sq, key: string): Wp {
  const N = s.nth ?? 50
  const part = (N - 1) * s.d
  const ans = s.a + part
  const wr = nearby(ans, s.d, s.dec).concat([num(s.a + N * s.d, s.dec)])
  const steps: Spec[] = [
    dStep(s),
    { label: `The change up to term ${N}.`, toks: [{ id: 'p1a', tex: `${N - 1}d` }, { id: 'p1g', tex: '=' }, { id: 'p1b', tex: num(part, s.dec) }], blanks: [blk('p1b', 'd1b', `$${N - 1} \\cdot ${par(s.d, s.dec)} = \\square$`, nearby(part, s.d, s.dec).concat([num(N * s.d, s.dec)]), `From term 1 to term ${N} the difference is added ${N - 1} times.`)] },
    { label: `Term ${N}.`, toks: [{ id: 't1a', tex: `t_{${N}}` }, { id: 't1g', tex: '=' }, { id: 't1b', tex: num(ans, s.dec) }], blanks: [blk('t1b', 'p1b', `$${num(s.a, s.dec)} + ${par(part, s.dec)} = \\square$`, wr, 'The first term plus the change.')] },
  ]
  return { tex: `${text(`Determine the ${N}th term of the following linear pattern: `)}${seqTex(s, 4)}`, short: seqTex(s, 4), key, answer: num(ans, s.dec), wrong: wr, steps }
}
export const grid = (as: number[], ds: number[], dec = false): Sq[] => as.flatMap((a) => ds.map((d) => ({ a, d, dec })))
export const sq = (a: number, d: number, dec = false, extra: Partial<Sq> = {}): Sq => ({ a, d, dec, ...extra })
export const withNth = (ss: Sq[]): Sq[] => ss.flatMap((s) => [20, 30, 40, 50].map((nth) => ({ ...s, nth })))
const surdA = (k: number, r: number): Sq => {
  const c = (j: number) => `${j === 1 ? '' : j}\\sqrt{${r}}`
  return { a: 0, d: 0, dec: false, surd: { terms: [1, 2, 3, 4].map((j) => c(j * k)), d: c(k), dPrompt: `${c(2 * k)} - ${c(k)}`, wrong: [c(k + 1), `${k}\\sqrt{${r + 1}}`, c(3 * k), String(k)] } }
}
const surdB = (a: number, b: number, up: boolean): Sq => {
  const sa = `\\sqrt{${a}}`
  const sb = `\\sqrt{${b}}`
  const first = up ? `${sa} - ${sb}` : `${sa} + ${sb}`
  return { a: 0, d: 0, dec: false, surd: { terms: [first, sa, up ? `${sa} + ${sb}` : `${sa} - ${sb}`], d: up ? sb : `-${sb}`, dPrompt: `${sa} - (${first})`, wrong: [up ? `-${sb}` : sb, sa, `${sa} ${up ? '+' : '-'} ${sb}`, `2${sb}`] } }
}
export const sqKey = (s: Sq) => (s.surd ? s.surd.terms.join() : `${s.a},${s.d},${s.nth ?? ''}`)

const G: [number, Sq, Sq[]][] = [
  [0, sq(2, 3), grid(range(1, 9), [2, 3, 4, 5])],
  [1, sq(6, 4), grid(range(3, 12), [2, 3, 4, 5, 6])],
  [2, sq(-4, 3), grid(range(-9, -2), [2, 3, 4, 5])],
  [3, sq(15, -5), grid(range(10, 30), [-2, -3, -4, -5])],
  [4, sq(-5, -6), grid(range(-10, -2), [-3, -4, -5, -6, -7])],
]
const letter = (i: number) => String.fromCharCode(97 + i)
const E3: [string, Sq, Sq[]][] = [
  ...G.map(([i, b, p]): [string, Sq, Sq[]] => [letter(i), b, p]),
  ['f', sq(-8, 5), grid(range(-12, -3), [2, 3, 4, 5, 6])],
  ['g', surdA(1, 2), [2, 3, 5, 6, 7].flatMap((r) => [1, 2, 3].map((k) => surdA(k, r)))],
  ['h', surdB(2, 3, false), [[2, 3], [2, 5], [3, 5], [5, 2], [3, 2], [7, 2], [6, 3]].flatMap(([a, b]) => [surdB(a, b, true), surdB(a, b, false)])],
]
const E4: [string, Sq, Sq[]][] = [
  ...E3.slice(0, 6),
  ['g', sq(11, -3), grid(range(8, 20), [-2, -3, -4, -5])],
  ['h', sq(-4.1, 0.4, true), [-4.1, -3.2, -2.6, -1.9, -5.3, -6.4, 1.2, 2.5].flatMap((a) => [0.2, 0.3, 0.4, 0.5, 0.6].map((d) => sq(a, d, true)))],
]
const E5: [string, Sq, Sq[]][] = [
  ...E3.slice(0, 5),
  ['f', sq(1, 0.5, true), [1, 2, 3, 0.5, 1.5, 2.5, 4].flatMap((a) => [0.5, 1.5, 0.25, 2.5].map((d) => sq(a, d, true)))],
]
const E6: [string, Sq, Sq[]][] = [
  ...E3.slice(0, 5).map(([p, b, pool]): [string, Sq, Sq[]] => [p, b, withNth(pool)]),
  ['f', sq(0, 0.5), [0, 1, 2, 3].flatMap((a) => [0.5, 1.5, 2.5].flatMap((d) => [20, 30, 40, 50].map((nth) => sq(a, d, false, { nth }))))],
]

// ================= exercise 7: word problems =================
interface Wd {
  kind: 'bookEq' | 'bookVal' | 'carEq' | 'carVal' | 'rate' | 'fee' | 'gradEq' | 'gradVal'
  F: number // fixed cost / base
  r: number // per unit
  N?: number // the value asked about
  y1?: number
  y2?: number
  p1?: number
  p2?: number
  n1?: number
  n2?: number
}
function wpWd(w: Wd, key: string): Wp {
  const blank = blk
  switch (w.kind) {
    case 'bookEq': {
      const per = w.r
      const ans = `C = ${lin(per, 'n', w.F)}`
      const wr = [`C = ${lin(w.F, 'n', per)}`, `C = ${lin(per, 'n', -w.F)}`, `C = ${lin(per * 100, 'n', w.F)}`, `C = ${lin(per + 1, 'n', w.F)}`]
      const tb = `\\begin{array}{c|cccc} n & 0 & 100 & 200 & 300 \\\\ \\hline C & ${[0, 1, 2, 3].map((i) => w.F + per * 100 * i).join(' & ')} \\end{array}`
      return { tex: `${text('The total cost of publishing a school yearbook is a fixed price, plus a cost for each yearbook printed. Using the data provided, write an equation relating the total cost (C) to the number of yearbooks printed (n).')}\\ ${tb}`, short: `(0,\\, ${w.F}),\\ (100,\\, ${w.F + per * 100})`, key, answer: ans, wrong: wr, steps: [
        { label: 'The cost of one yearbook.', toks: [{ id: 'a1a', tex: 'r' }, { id: 'a1g', tex: '=' }, { id: 'a1b', tex: n4(per) }], blanks: [blank('a1b', 's0', `$\\dfrac{${w.F + per * 100} - ${w.F}}{100 - 0} = \\square$`, nearby(per, 1).concat([n4(per * 100)]), 'The change of C divided by the change of n.')] },
        { label: 'The fixed price.', toks: [{ id: 'a2a', tex: 'F' }, { id: 'a2g', tex: '=' }, { id: 'a2b', tex: String(w.F) }], blanks: [blank('a2b', 's0', '$C \\text{ when } n = 0$', nearby(w.F, 100).concat([n4(per)]), 'With no yearbooks printed only the fixed price is paid.')] },
        { label: 'The equation.', toks: [{ id: 'a3', tex: ans }], blanks: [blank('a3', 'a2b', '$C = r\\,n + F$', wr, 'The cost of one yearbook times n, plus the fixed price.')] },
      ] }
    }
    case 'bookVal': {
      const val = w.F + w.r * w.N!
      const wr = nearby(val, w.r).concat([n4(w.r * (w.N! + w.F))])
      return { tex: text(`The total cost of publishing a school yearbook is ${w.F} dollars plus ${w.r} dollars for each yearbook printed. Calculate the cost of printing ${w.N} yearbooks.`), short: `C = ${lin(w.r, 'n', w.F)}`, key, answer: n4(val), wrong: wr, steps: [
        { label: 'Substitute.', toks: [{ id: 'b1a', tex: 'C' }, { id: 'b1g', tex: '=' }, { id: 'b1b', tex: `${w.r} \\cdot ${w.N} + ${w.F}` }], blanks: [blank('b1b', 's0', `$C = ${lin(w.r, 'n', w.F)},\\ n = ${w.N}$`, [`${w.r} + ${w.N} + ${w.F}`, `${w.F} \\cdot ${w.N} + ${w.r}`, `${w.r} \\cdot ${w.N} - ${w.F}`], `Write n = ${w.N} in the equation.`)] },
        { label: 'Calculate.', toks: [{ id: 'b2a', tex: 'C' }, { id: 'b2g', tex: '=' }, { id: 'b2b', tex: n4(val) }], blanks: [blank('b2b', 'b1b', `$${w.r} \\cdot ${w.N} + ${w.F}$`, wr, 'Multiply first, then add.')] },
      ] }
    }
    case 'carEq': {
      const per = w.r / 100
      const ans = `C = ${lin(per, 'n', w.F)}`
      const wr = [`C = ${lin(w.r, 'n', w.F)}`, `C = ${lin(w.F, 'n', per)}`, `C = ${lin(per, 'n', -w.F)}`, `C = ${lin(per * 10, 'n', w.F)}`]
      return { tex: text(`The cost of renting a car is ${w.F} dollars, plus ${w.r} cents per kilometer travelled. Write an equation relating cost (C) to the number (n) of kilometers travelled.`), short: `${w.r}\\text{ cents}`, key, answer: ans, wrong: wr, steps: [
        { label: 'Cents to dollars.', toks: [{ id: 'a1a', tex: 'r' }, { id: 'a1g', tex: '=' }, { id: 'a1b', tex: n4(per) }], blanks: [blank('a1b', 's0', `$${w.r} \\text{ cents} = \\square \\text{ dollars}$`, [n4(per * 10), n4(per / 10), String(w.r)], '100 cents are 1 dollar.')] },
        { label: 'The equation.', toks: [{ id: 'a2', tex: ans }], blanks: [blank('a2', 'a1b', `$C = ${w.F} + r\\,n$`, wr, 'The base price plus the price per kilometer times n.')] },
      ] }
    }
    case 'carVal': {
      const per = w.r / 100
      const prod = per * w.N!
      const val = w.F + prod
      const wr = nearby(val, 1).concat([n4(w.F + w.r * w.N!)])
      return { tex: text(`The cost of renting a car is ${w.F} dollars, plus ${w.r} cents per kilometer travelled. Calculate the cost of travelling ${w.N} kilometers.`), short: `C = ${lin(per, 'n', w.F)}`, key, answer: n4(val), wrong: wr, steps: [
        { label: 'The distance part.', toks: [{ id: 'b1a', tex: `${n4(per)} \\cdot ${w.N}` }, { id: 'b1g', tex: '=' }, { id: 'b1b', tex: n4(prod) }], blanks: [blank('b1b', 's0', `$${n4(per)} \\cdot ${w.N} = \\square$`, nearby(prod, 1).concat([n4(w.r * w.N!)]), 'The price per kilometer times the kilometers.')] },
        { label: 'The cost.', toks: [{ id: 'b2a', tex: 'C' }, { id: 'b2g', tex: '=' }, { id: 'b2b', tex: n4(val) }], blanks: [blank('b2b', 'b1b', `$${w.F} + ${n4(prod)} = \\square$`, wr, 'The base price plus the distance part.')] },
      ] }
    }
    case 'rate': {
      const rate = (w.p2! - w.p1!) / (w.n2! - w.n1!)
      return { tex: text(`The cost of sending the school's basketball team to a tournament is a fixed entrance fee, plus a cost per student. If ${w.n1} players cost ${w.p1} dollars, and ${w.n2} players cost ${w.p2} dollars, what is the cost per student?`), short: `(${w.n1},\\, ${w.p1}),\\ (${w.n2},\\, ${w.p2})`, key, answer: n4(rate), wrong: nearby(rate, 1).concat([n4((w.p2! - w.p1!) / w.n2!)]), steps: [
        { label: 'The extra players.', toks: [{ id: 'c1a', tex: '\\Delta n' }, { id: 'c1g', tex: '=' }, { id: 'c1b', tex: String(w.n2! - w.n1!) }], blanks: [blank('c1b', 's0', `$${w.n2} - ${w.n1} = \\square$`, [String(w.n2! + w.n1!), String(w.n2! - w.n1! + 1), String(w.n2! - w.n1! - 1)], 'The difference of the two numbers of players.')] },
        { label: 'The extra cost.', toks: [{ id: 'c2a', tex: '\\Delta C' }, { id: 'c2g', tex: '=' }, { id: 'c2b', tex: String(w.p2! - w.p1!) }], blanks: [blank('c2b', 's0', `$${w.p2} - ${w.p1} = \\square$`, [String(w.p2! + w.p1!), String(w.p2! - w.p1! + 10), String(w.p2! - w.p1! - 10)], 'The difference of the two costs.')] },
        { label: 'The cost per student.', toks: [{ id: 'c3a', tex: 'r' }, { id: 'c3g', tex: '=' }, { id: 'c3b', tex: n4(rate) }], blanks: [blank('c3b', 'c2b', `$${w.p2! - w.p1!} \\div ${w.n2! - w.n1!} = \\square$`, nearby(rate, 1).concat([n4((w.n2! - w.n1!) / (w.p2! - w.p1!))]), 'The extra cost divided by the extra players.')] },
      ] }
    }
    case 'fee': {
      const rate = (w.p2! - w.p1!) / (w.n2! - w.n1!)
      const part = rate * w.n1!
      const fee = w.p1! - part
      const wr = nearby(fee, 10).concat([n4(w.p1! + part)])
      return { tex: text(`The cost of sending the school's basketball team to a tournament is a fixed entrance fee, plus a cost per student. If ${w.n1} players cost ${w.p1} dollars, and ${w.n2} players cost ${w.p2} dollars, what is the entrance fee to the tournament?`), short: `(${w.n1},\\, ${w.p1}),\\ (${w.n2},\\, ${w.p2})`, key, answer: n4(fee), wrong: wr, steps: [
        { label: 'The cost per student.', toks: [{ id: 'c1a', tex: 'r' }, { id: 'c1g', tex: '=' }, { id: 'c1b', tex: n4(rate) }], blanks: [blank('c1b', 's0', `$\\dfrac{${w.p2} - ${w.p1}}{${w.n2} - ${w.n1}} = \\square$`, nearby(rate, 1), 'The extra cost divided by the extra players.')] },
        { label: `The cost of ${w.n1} students.`, toks: [{ id: 'c2a', tex: `${n4(rate)} \\cdot ${w.n1}` }, { id: 'c2g', tex: '=' }, { id: 'c2b', tex: n4(part) }], blanks: [blank('c2b', 'c1b', `$${n4(rate)} \\cdot ${w.n1} = \\square$`, nearby(part, 10), 'The cost per student times the number of players.')] },
        { label: 'The entrance fee.', toks: [{ id: 'c3a', tex: 'F' }, { id: 'c3g', tex: '=' }, { id: 'c3b', tex: n4(fee) }], blanks: [blank('c3b', 'c2b', `$${w.p1} - ${n4(part)} = \\square$`, wr, 'The total cost minus the cost of the students.')] },
      ] }
    }
    case 'gradEq': {
      const m = (w.p2! - w.p1!) / (w.y2! - w.y1!)
      const eq = (mm: number, y: number, p: number) => `P = ${p} ${mm < 0 ? '-' : '+'} ${Math.abs(mm) === 1 ? '' : num(Math.abs(mm), false)}(y - ${y})`
      const ans = eq(m, w.y1!, w.p1!)
      const wr = [eq(-m, w.y1!, w.p1!), eq(m, w.y2!, w.p1!), eq(1 / m, w.y1!, w.p1!), `P = ${w.p1} ${m < 0 ? '-' : '+'} ${num(Math.abs(m), false)}y`]
      return { tex: text(`In ${w.y1}, ${w.p1}% of students graduated from university in less than 5 years. In ${w.y2}, ${w.p2}% of students graduated from university in less than 5 years. Write an equation relating the year of graduation (y) to the percent of students (P) graduating in less than 5 years.`), short: `(${w.y1},\\, ${w.p1}),\\ (${w.y2},\\, ${w.p2})`, key, answer: ans, wrong: wr, steps: [
        { label: 'The change per year.', toks: [{ id: 'g1a', tex: 'm' }, { id: 'g1g', tex: '=' }, { id: 'g1b', tex: num(m, false) }], blanks: [blank('g1b', 's0', `$\\dfrac{${w.p2} - ${w.p1}}{${w.y2} - ${w.y1}} = \\square$`, [num(-m, false), num(1 / m, false), num(m * 2, false)], 'The change of P divided by the change of the year.')] },
        { label: 'The equation.', toks: [{ id: 'g2', tex: ans }], blanks: [blank('g2', 'g1b', '$P = P_1 + m\\,(y - y_1)$', wr, `Start at the first point (${w.y1}, ${w.p1}) and add m times the years since ${w.y1}.`)] },
      ] }
    }
    case 'gradVal': {
      const m = (w.p2! - w.p1!) / (w.y2! - w.y1!)
      const dy = w.N! - w.y1!
      const ch = m * dy
      const val = w.p1! + ch
      const wr = nearby(val, 1).concat([n4(w.p1! - ch)])
      return { tex: text(`In ${w.y1}, ${w.p1}% of students graduated from university in less than 5 years. In ${w.y2}, ${w.p2}% of students graduated from university in less than 5 years. If this linear trend continues, what percent of university students will graduate in less than 5 years at the end of ${w.N}?`), short: `(${w.y1},\\, ${w.p1}),\\ (${w.y2},\\, ${w.p2})`, key, answer: n4(val), wrong: wr, steps: [
        { label: 'The change per year.', toks: [{ id: 'g1a', tex: 'm' }, { id: 'g1g', tex: '=' }, { id: 'g1b', tex: num(m, false) }], blanks: [blank('g1b', 's0', `$\\dfrac{${w.p2} - ${w.p1}}{${w.y2} - ${w.y1}} = \\square$`, [num(-m, false), num(1 / m, false), num(m * 2, false)], 'The change of P divided by the change of the year.')] },
        { label: 'The change since the first year.', toks: [{ id: 'g2a', tex: '\\Delta P' }, { id: 'g2g', tex: '=' }, { id: 'g2b', tex: n4(ch) }], blanks: [blank('g2b', 'g1b', `$${par(m, false)} \\cdot (${w.N} - ${w.y1}) = \\square$`, nearby(ch, 1).concat([n4(-ch)]), `The change per year times the ${dy} years since ${w.y1}.`)] },
        { label: 'The percent.', toks: [{ id: 'g3a', tex: 'P' }, { id: 'g3g', tex: '=' }, { id: 'g3b', tex: n4(val) }], blanks: [blank('g3b', 'g2b', `$${w.p1} + ${par(ch)} = \\square$`, wr, 'The first percent plus the change.')] },
      ] }
    }
  }
}
const wdKey = (w: Wd) => JSON.stringify(w)
const T = <A extends unknown[]>(rows: A[], f: (r: A) => Wd): Wd[] => rows.map(f)
const E7: [string, Wd, Wd[]][] = [
  ['a', { kind: 'bookEq', F: 300, r: 2 }, T([[250, 2], [300, 3], [200, 4], [400, 2], [150, 5], [500, 3], [350, 4], [100, 6], [450, 5], [600, 2]], ([F, r]) => ({ kind: 'bookEq', F, r }))],
  ['b', { kind: 'bookVal', F: 300, r: 2, N: 650 }, T([[250, 2, 450], [300, 3, 250], [200, 4, 350], [400, 2, 750], [150, 5, 220], [500, 3, 640], [350, 4, 180], [100, 6, 320], [450, 5, 520], [600, 2, 850]], ([F, r, N]) => ({ kind: 'bookVal', F, r, N }))],
  ['c', { kind: 'carEq', F: 50, r: 20 }, T([[40, 15], [60, 25], [45, 30], [55, 10], [35, 20], [70, 12], [30, 40], [65, 18], [50, 35], [80, 22]], ([F, r]) => ({ kind: 'carEq', F, r }))],
  ['d', { kind: 'carVal', F: 50, r: 20, N: 480 }, T([[40, 15, 200], [60, 25, 320], [45, 30, 150], [55, 10, 450], [35, 20, 260], [70, 12, 500], [30, 40, 120], [65, 18, 350], [50, 35, 240], [80, 22, 400]], ([F, r, N]) => ({ kind: 'carVal', F, r, N }))],
  ['e', { kind: 'rate', F: 0, r: 0, n1: 10, p1: 260, n2: 15, p2: 300 }, T([[10, 260, 15, 300], [8, 150, 12, 190], [12, 300, 20, 460], [6, 110, 10, 170], [15, 400, 25, 600], [10, 200, 20, 360], [5, 120, 9, 168], [8, 210, 14, 300], [20, 500, 30, 700], [12, 240, 16, 296]], ([n1, p1, n2, p2]) => ({ kind: 'rate', F: 0, r: 0, n1, p1, n2, p2 }))],
  ['f', { kind: 'fee', F: 0, r: 0, n1: 10, p1: 260, n2: 15, p2: 300 }, T([[8, 150, 12, 190], [12, 300, 20, 460], [6, 110, 10, 170], [15, 400, 25, 600], [10, 200, 20, 360], [5, 120, 9, 168], [8, 210, 14, 300], [20, 500, 30, 700], [12, 240, 16, 296], [9, 180, 14, 255]], ([n1, p1, n2, p2]) => ({ kind: 'fee', F: 0, r: 0, n1, p1, n2, p2 }))],
  ['g', { kind: 'gradEq', F: 0, r: 0, y1: 1994, p1: 45, y2: 2000, p2: 41 }, T([[1990, 52, 1996, 46], [1995, 38, 2001, 44], [1992, 60, 1998, 54], [1994, 40, 2000, 52], [1996, 55, 2002, 49], [1990, 30, 1995, 40], [1998, 47, 2004, 41], [1993, 35, 1999, 41], [1991, 58, 1997, 55], [1995, 42, 2000, 37]], ([y1, p1, y2, p2]) => ({ kind: 'gradEq', F: 0, r: 0, y1, p1, y2, p2 }))],
  ['h', { kind: 'gradVal', F: 0, r: 0, y1: 1994, p1: 45, y2: 2000, p2: 41, N: 2012 }, T([[1990, 52, 1996, 46, 2008], [1995, 38, 2001, 44, 2013], [1992, 60, 1998, 54, 2010], [1994, 40, 2000, 52, 2010], [1996, 55, 2002, 49, 2014], [1990, 30, 1995, 40, 2005], [1998, 47, 2004, 41, 2016], [1993, 35, 1999, 41, 2011], [1991, 58, 1997, 55, 2009], [1995, 42, 2000, 37, 2010]], ([y1, p1, y2, p2, N]) => ({ kind: 'gradVal', F: 0, r: 0, y1, p1, y2, p2, N }))],
]

// ================= the exercises =================
export function build<T>(no: number, prompt: string, rows: [string, T, T[]][], wp: (x: T, key: string) => Wp, id: (x: T) => string, title: string, seed: number): Exercise {
  const questions: Question[] = rows.map(([part, bk, pool], idx): Question => {
    const seen = new Set([id(bk)])
    const bank = shuffled(pool, seed + idx).filter((x) => !seen.has(id(x)) && !!seen.add(id(x))).slice(0, 10)
    const make = (x: T, k: string, j: number): Practice => {
      const key = `seq41-${no}${k}`
      const w = wp(x, key)
      const [choices, correct] = pick(w.answer, w.wrong, idx + j)
      return { tex: w.tex, choices, correct, why: '', lesson: () => lessonWp(wp(x, key), `Grade 9, 4.1 exercise ${no}${k}`, title, idx + j) }
    }
    return { part, ...make(bk, part, 0), practice: bank.map((x, j) => make(x, `${part}${j + 1}`, j + 1)) }
  })
  return { no, sec: '4.1', prompt, mathChoices: true, questions }
}

export const EX_SEQ41 = [
  build(1, 'Choose the value.', EV1, wpEv, evTex, 'Evaluate', 4100),
  build(2, 'Choose the value.', EV2, wpEv, evTex, 'Evaluate', 4200),
  build(3, 'Choose the common difference.', E3, ex3, sqKey, 'Common difference', 4300),
  build(4, 'Choose the next three numbers.', E4, ex4, sqKey, 'Next terms', 4400),
  build(5, 'Choose the equation relating y to x.', E5, ex5, sqKey, 'Equation from a table', 4500),
  build(6, 'Choose the term.', E6, ex6, sqKey, 'The nth term', 4600),
  build(7, 'Choose the answer.', E7, wpWd, wdKey, 'Linear model', 4700),
]

// ================= challenge exercises (4.1 exercises 3, 4, 5 and 6, harder): bigger and negative differences, decimal differences, the 75th to 200th term; optional extra practice, own progress (no 13 to 16) =================
const hgrid = (as: number[], ds: number[], dec: boolean, nths?: number[]): Sq[] => as.flatMap((a) => ds.flatMap((d) => (nths ? nths.map((nth) => sq(a, d, dec, { nth })) : [sq(a, d, dec)])))
const HA = range(10, 40).filter((x) => x % 3 !== 0)
const HB = range(-60, -20).filter((x) => x % 4 !== 0)
const HC = [-3.5, -1.5, 1.5, 2.5, 3.5, 4.5, 6.5, 7.5, 8.5, 9.5]
const HD = [-9.5, -8.5, -7.5, -6.5, -5.5, -4.5, -3.5, -2.5, 3.5, 5.5]
const hrows = (nths?: number[]): [string, Sq, Sq[]][] => {
  const nb = nths ? { nth: 100 } : {}
  const specs: [Sq, number[], number[], boolean][] = [
    [sq(12, 7, false, nb), HA, [6, 7, 8, 9, 11, 12, 13], false],
    [sq(-30, -9, false, nb), HB, [-6, -7, -8, -9, -11, -12, -13], false],
    [sq(2.5, 0.75, true, nb), HC, [0.25, 0.75, 1.25, 1.75, 2.25], true],
    [sq(-1.5, -0.75, true, nb), HD, [-0.25, -0.75, -1.25, -1.75, -2.25], true],
  ]
  return specs.map(([b, as, ds, dec], i) => [letter(i), b, hgrid(as, ds, dec, nths)])
}
export const EX_SEQ41H = [
  build(13, 'Choose the common difference.', hrows(), ex3, sqKey, 'Common difference (challenge)', 4313),
  build(14, 'Choose the next three numbers.', hrows(), ex4, sqKey, 'Next terms (challenge)', 4414),
  build(15, 'Choose the equation relating y to x.', hrows(), ex5, sqKey, 'Equation from a table (challenge)', 4515),
  build(16, 'Choose the term.', hrows([75, 100, 150, 200]), ex6, sqKey, 'The nth term (challenge)', 4616),
]

// ================= challenge exercises 17, 18 (evaluate, harder: bigger numbers, negative values, brackets) and 19 (word problems with bigger numbers); own progress =================
const ks12 = [-12, -11, -10, -9, -8, -7, -6, 6, 7, 8, 9, 10, 11, 12]
const evRows = (cs: number[], as: number[], L: number): [string, Ev, Ev[]][] =>
  [[range(25, 90), []], [range(-60, -12), []], [[], ks12], [range(100, 300), []]].map(([ns, ks], i): [string, Ev, Ev[]] => {
    const pool = evPool(ns as number[], cs, as, ks as number[])
    return [letter(i), pool[L % pool.length], pool]
  })
const EVH1 = evRows([0], [7, 8, 9, 11, 12, 13, 14, 15, 17, 19], 0)
const EVH2 = evRows([-9, -8, -7, -6, -5, 5, 6, 7, 8, 9], [7, 8, 9, 11, 12, 13, 14, 15, 17, 19], 0)
const cross = <A, B>(as: A[], bs: B[]): [A, B][] => as.flatMap((a) => bs.map((b): [A, B] => [a, b]))
const WH: [string, Wd, Wd[]][] = [
  ['a', null as unknown as Wd, T(cross(cross([750, 900, 1200, 1500, 1800, 2400], [7, 9, 12, 14, 17, 19]), [480, 750, 1250, 1800, 2400]), ([[F, r], N]) => ({ kind: 'bookVal', F, r, N }))],
  ['b', null as unknown as Wd, T(cross(cross([85, 120, 150, 175, 240, 310], [35, 45, 65, 85, 95]), [650, 900, 1250, 1600, 2400]), ([[F, r], N]) => ({ kind: 'carVal', F, r, N }))],
  ['c', null as unknown as Wd, T(cross(cross([75, 120, 180, 250, 400], [9, 13, 17, 23, 35]), [[12, 7], [16, 9], [20, 11], [25, 12]]), ([[F, r], [n1, dn]]) => ({ kind: 'fee', F: 0, r: 0, n1, p1: F + r * n1, n2: n1 + dn, p2: F + r * (n1 + dn) }))],
  ['d', null as unknown as Wd, T(cross(cross([1985, 1990, 1992, 1994, 1996], [32, 41, 55, 62, 70]), [[-6, 3], [-4, 4], [-2, 5], [5, 3], [3, 4]]), ([[y1, p1], [diff, k]]) => ({ kind: 'gradVal', F: 0, r: 0, y1, p1, y2: y1 + 6, p2: p1 + diff, N: y1 + 6 + 6 * k })).filter((w) => w.p1! + ((w.p2! - w.p1!) * (w.N! - w.y1!)) / 6 > 5 && w.p1! + ((w.p2! - w.p1!) * (w.N! - w.y1!)) / 6 < 100)],
].map(([p, , pool]) => [p, (pool as Wd[])[0], pool as Wd[]] as [string, Wd, Wd[]])
export const EX_SEQ41H2 = [
  build(17, 'Choose the value.', EVH1, wpEv, evTex, 'Evaluate (challenge)', 4117),
  build(18, 'Choose the value.', EVH2, wpEv, evTex, 'Evaluate (challenge)', 4218),
  build(19, 'Choose the answer.', WH, wpWd, wdKey, 'Linear model (challenge)', 4719),
]
