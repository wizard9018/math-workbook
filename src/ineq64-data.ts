// Grade 9 6.4 exercises 3, 4 and 5 (bank/G9-ch6/s4/items.json; exercises 1 and 2 are left out, the textbook's 5-10 are merged into 5):
//   3: solve a linear inequality with the addition principle (variable on one side, then the number) and graph it
//   4: the variable cancels: all real numbers or no solution
//   5: a, b = equivalent inequalities? (5, 6), c = average (7), d = rectangle (8), e, f = isosceles triangles with integer sides (9, 10)
// Answers and steps are computed here; the 10 similar questions of every question come from small tables. Lessons: blanks (see lessons.ts `blanks`).
// Imported by: quiz.tsx, check64.ts. Shape: exercise.ts.
import type { Exercise, Practice, Question } from './exercise'
import type { Calc, Lesson, Step, Tok } from './lessons'
import { numberLine, type Seg } from './numline-data'
import { pick } from './simplify-data'

type Sym = '<' | '>' | '<=' | '>='
const SYMS: Sym[] = ['>=', '<=', '>', '<']
const SYM_TEX: Record<Sym, string> = { '<': '<', '>': '>', '<=': '\\le', '>=': '\\ge' }
const FLIP: Record<Sym, Sym> = { '<': '>', '>': '<', '<=': '>=', '>=': '<=' }
const TOGGLE: Record<Sym, Sym> = { '<': '<=', '>': '>=', '<=': '<', '>=': '>' }
const up = (s: Sym) => s === '>' || s === '>='
const closed = (s: Sym) => s === '>=' || s === '<='

// ---- rationals [n, d] ----
type Q = [number, number]
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a))
const q = (n: number, d = 1): Q => {
  const g = gcd(n, d) || 1
  return d < 0 ? [-n / g, -d / g] : [n / g, d / g]
}
const add = (a: Q, b: Q): Q => q(a[0] * b[1] + b[0] * a[1], a[1] * b[1])
const neg = (a: Q): Q => [-a[0], a[1]]
const sub = (a: Q, b: Q) => add(a, neg(b))
const isZ = (a: Q) => a[0] === 0
const val = (a: Q) => a[0] / a[1]
const abs = (a: Q): Q => [Math.abs(a[0]), a[1]]
const qtex = (a: Q): string => (a[1] === 1 ? String(a[0]) : `${a[0] < 0 ? '-' : ''}\\frac{${Math.abs(a[0])}}{${a[1]}}`)
const shuffled = <T,>(a: T[], seed: number): T[] => {
  let s = seed
  const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32)
  return [...a].sort(() => r() - 0.5)
}
const calcOf = (prompt: string, right: string, wrongs: string[], hint: string, idx: number): Calc => {
  const [options, correct] = pick(right, wrongs, idx)
  return { q: prompt, options, correct, hints: options.map((_, j) => (j === correct ? '' : hint)), spell: hint }
}
type Blank = { id: string; from: string; calc: Calc }
const ray = (s: Sym, n: number): Seg => (up(s) ? { a: n, b: null, ac: closed(s), bc: false } : { a: null, b: n, ac: false, bc: closed(s) })
const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i)

// ================= exercise 3: v + k ? m, 2a <= a + 4, -6n + 5 > 5 - 5n, -4 < -p =================
interface Ln {
  v: string
  A: Q // A v + B  sg  C v + D
  B: Q
  C: Q
  D: Q
  sg: Sym
  lcf?: boolean // the number is written first on the left / right
  rcf?: boolean
}
interface State {
  Lc: Q
  Lk: Q
  Rc: Q
  Rk: Q
  sg: Sym
}
const ZERO = q(0)
const ONE = q(1)
const coefTex = (c: Q, v: string) => (abs(c)[0] === 1 && abs(c)[1] === 1 ? v : `${qtex(abs(c))}${v}`)
const sideToks = (side: 'L' | 'R', t: number, c: Q, k: Q, cf: boolean, v: string): Tok[] => {
  const vp = isZ(c) ? [] : [{ id: `${side}${t}v`, n: c[0] < 0, body: coefTex(c, v) }]
  const kp = isZ(k) ? [] : [{ id: `${side}${t}k`, n: k[0] < 0, body: qtex(abs(k)) }]
  const parts = cf ? [...kp, ...vp] : [...vp, ...kp]
  if (!parts.length) return [{ id: `${side}${t}k`, tex: '0' }]
  return parts.map((p, i) => ({ id: p.id, tex: i === 0 ? (p.n ? '-' : '') + p.body : `{} ${p.n ? '-' : '+'} ${p.body}` }))
}
const lineToks = (t: number, s: State, l: Ln): Tok[] => [...sideToks('L', t, s.Lc, s.Lk, !!l.lcf, l.v), { id: `g${t}`, tex: SYM_TEX[s.sg] }, ...sideToks('R', t, s.Rc, s.Rk, !!l.rcf, l.v)]
const lnState = (l: Ln): State => ({ Lc: l.A, Lk: l.B, Rc: l.C, Rk: l.D, sg: l.sg })
const lnTex = (l: Ln) => lineToks(0, lnState(l), l).map((t) => t.tex).join(' ')
// N = A - C is 1 or -1: the variable ends on the left (N = 1) or on the right (N = -1)
const solve3 = (l: Ln) => (sub(l.A, l.C)[0] > 0 ? { sg: l.sg, x: sub(l.D, l.B) } : { sg: FLIP[l.sg], x: sub(l.B, l.D) })

function lesson3(l: Ln, key: string, idx: number): Lesson {
  const N = sub(l.A, l.C)[0] > 0 ? 1 : -1
  const sol = solve3(l)
  const ct = (c: Q) => (isZ(c) ? '0' : (c[0] < 0 ? '-' : '') + coefTex(c, l.v))
  let S = lnState(l)
  let t = 0
  const start = lineToks(0, S, l)
  const steps: Step[] = []
  const lineIds = () => lineToks(t, S, l).map((x) => x.id)
  const push = (blanks: Blank[], results: Tok[], calcPrompt: string) => {
    steps.push({ focus: lineIds(), result: results[0], results, blanks, arrows: blanks.map((b) => ({ from: [b.from], to: [b.id] })), say: '', calcPrompt, calc: blanks[0].calc })
  }
  // 1: the variable on the other side goes away
  const other = N > 0 ? l.C : l.A
  if (!isZ(other)) {
    const own = N > 0 ? l.A : l.C
    const next: State = N > 0 ? { ...S, Lc: ONE, Rc: ZERO } : { ...S, Lc: ZERO, Rc: ONE }
    const id = N > 0 ? `L${t + 1}v` : `R${t + 1}v`
    const from = N > 0 ? `R${t}v` : `L${t}v`
    // a term that is not the first on its side is written with its sign: + n
    const first = lineToks(t + 1, next, l).find((x) => x.id === id)!.tex === l.v
    const fmt = (c: Q) => (first || isZ(c) ? ct(c) : `{} ${c[0] < 0 ? '-' : '+'} ${coefTex(c, l.v)}`)
    const wrongs = [add(l.A, l.C), neg(ONE), own, other].map(fmt)
    const prompt = `$${ct(own)} - (${ct(other)}) = \\square$`
    const hint = `Take $${ct(other)}$ away from both sides: $${ct(own)} - (${ct(other)}) = ${l.v}$`
    push([{ id, from, calc: calcOf(prompt, fmt(ONE), wrongs, hint, idx) }], lineToks(t + 1, next, l), 'The variable on one side only.')
    S = next
    t += 1
  }
  // 2: the number goes to the other side
  const own = N > 0 ? S.Lk : S.Rk
  const oth = N > 0 ? S.Rk : S.Lk
  if (!isZ(own)) {
    const r = sub(oth, own)
    const next: State = N > 0 ? { ...S, Lk: ZERO, Rk: r } : { ...S, Rk: ZERO, Lk: r }
    const id = N > 0 ? `R${t + 1}k` : `L${t + 1}k`
    const from = N > 0 ? `R${t}k` : `L${t}k`
    const op = own[0] < 0 ? '+' : '-'
    const hint = `${own[0] < 0 ? 'Add' : 'Take away'} $${qtex(abs(own))}$ on both sides: $${qtex(oth)} ${op} ${qtex(abs(own))} = ${qtex(r)}$`
    const wrongs = [add(oth, own), neg(r), add(r, ONE), sub(r, ONE)].map(qtex)
    push([{ id, from, calc: calcOf(`$${qtex(oth)} ${op} ${qtex(abs(own))} = \\square$`, qtex(r), wrongs, hint, idx + 1) }], lineToks(t + 1, next, l), 'The number to the other side.')
    S = next
    t += 1
  }
  // 3: the variable is on the right: turn the inequality round
  if (N < 0) {
    const f = FLIP[S.sg]
    const next: State = { Lc: ONE, Lk: ZERO, Rc: ZERO, Rk: S.Lk, sg: f }
    const hint = `$${qtex(S.Lk)} ${SYM_TEX[S.sg]} ${l.v}$ means $${l.v} ${SYM_TEX[f]} ${qtex(S.Lk)}$`
    push([{ id: `g${t + 1}`, from: `g${t}`, calc: calcOf(`$${qtex(S.Lk)} ${SYM_TEX[S.sg]} ${l.v} \\;\\to\\; ${l.v}\\ \\square\\ ${qtex(S.Lk)}$`, SYM_TEX[f], SYMS.filter((x) => x !== f).map((x) => SYM_TEX[x]), hint, idx + 2) }], lineToks(t + 1, next, l), 'The variable first.')
    S = next
    t += 1
  }
  // 4: the graph: a closed or open circle, the direction
  const s = sol.sg
  const dot = (c: boolean) => (c ? '\\bullet' : '\\circ')
  const dir = up(s) ? '\\longrightarrow' : '\\longleftarrow'
  const ci: Blank = { id: 'ci', from: `g${t}`, calc: calcOf(`$${SYM_TEX[s]} \\;\\to\\; \\square$`, dot(closed(s)), [dot(!closed(s))], '$\\le,\\ \\ge : \\bullet \\qquad <,\\ > : \\circ$', idx + 3) }
  const ar: Blank = { id: 'ar', from: `g${t}`, calc: calcOf(`$${l.v} ${SYM_TEX[s]} \\;\\to\\; \\square$`, dir, [up(s) ? '\\longleftarrow' : '\\longrightarrow'], '$>,\\ \\ge : \\longrightarrow \\qquad <,\\ \\le : \\longleftarrow$', idx + 4) }
  push([ci, ar], [...lineToks(t + 1, S, l), { id: 'ci', tex: dot(closed(s)) }, { id: 'ar', tex: dir }], 'Circle and direction.')
  const full = numberLine([ray(s, val(sol.x))])
  const bare = numberLine([])
  return { key: `ineq64-${key}`, label: key, source: `Grade 9, 6.4 exercise 3${key}`, title: 'Solve and graph', prompt: 'Solve:', figure: bare, figureAt: (k) => (k >= steps.length ? full : bare), answer: full, start, steps, review: { heading: 'Inequalities', rows: [] } }
}
function choices3(l: Ln, idx: number): [string[], number] {
  const s = solve3(l)
  const f = (sg: Sym, x: Q) => numberLine([ray(sg, val(x))])
  return pick(f(s.sg, s.x), [f(FLIP[s.sg], s.x), f(s.sg, neg(s.x)), f(TOGGLE[s.sg], s.x), f(FLIP[s.sg], neg(s.x)), f(s.sg, add(l.B, l.D))], idx)
}

const L3 = (v: string, A: Q, B: Q, C: Q, D: Q, sg: Sym, lcf = false, rcf = false): Ln => ({ v, A, B, C, D, sg, lcf, rcf })
const I = (n: number) => q(n)
// v + k ? m with the answer m - k between -4 and 4
const k1 = (v: string, ks: number[]): Ln[] => ks.flatMap((k) => range(-4, 4).flatMap((x) => SYMS.map((sg) => L3(v, ONE, I(k), ZERO, I(x + k), sg))))
// (c + 1) v ? c v + d
const k2 = (v: string): Ln[] => range(1, 4).flatMap((c) => range(-4, 4).filter((d) => d !== 0).flatMap((d) => SYMS.map((sg) => L3(v, I(c + 1), ZERO, I(c), I(d), sg))))
// v + b ? d with fractions
const FR: [number, number][] = [[1, 2], [1, 3], [1, 4], [1, 6], [5, 6], [3, 4], [2, 3], [1, 12]]
const k3 = (v: string, sign: number): Ln[] =>
  FR.flatMap(([n1, d1]) => FR.filter((f) => f[1] !== d1 || f[0] !== n1).flatMap(([n2, d2]) => [1, -1].flatMap((s2) => (Math.abs(val(sub(q(s2 * n2, d2), q(sign * n1, d1)))) <= 4 ? SYMS.map((sg) => L3(v, ONE, q(sign * n1, d1), ZERO, q(s2 * n2, d2), sg)) : []))))
// -(c + 1) n + b ? b - c n
const k4 = (v: string): Ln[] => range(2, 7).flatMap((c) => range(2, 9).flatMap((b) => SYMS.map((sg) => L3(v, I(-(c + 1)), I(b), I(-c), I(b), sg, false, true))))
// m ? -p
const k5 = (v: string): Ln[] => range(-5, 5).filter((m) => m !== 0).flatMap((m) => SYMS.map((sg) => L3(v, ZERO, I(m), I(-1), ZERO, sg)))
const BOOK3: [string, Ln, Ln[]][] = [
  ['a', L3('y', ONE, I(5), ZERO, I(8), '>'), k1('y', [1, 2, 3, 4, 5, 6, 7])],
  ['b', L3('y', ONE, I(3), ZERO, I(7), '>'), k1('y', [1, 2, 3, 4, 5, 6, 7])],
  ['c', L3('x', ONE, I(2), ZERO, I(-3), '<='), k1('x', [1, 2, 3, 4, 5])],
  ['d', L3('x', ONE, I(1), ZERO, I(-2), '<='), k1('x', [1, 2, 3, 4, 5])],
  ['e', L3('z', ONE, I(-3), ZERO, I(-1), '<'), k1('z', [-1, -2, -3, -4, -5, -6])],
  ['f', L3('z', ONE, I(-2), ZERO, I(-3), '>'), k1('z', [-1, -2, -3, -4, -5, -6])],
  ['g', L3('a', I(2), ZERO, ONE, I(4), '<='), k2('a')],
  ['h', L3('a', I(3), ZERO, I(2), I(4), '<='), k2('a')],
  ['i', L3('b', ONE, q(1, 3), ZERO, q(5, 6), '<='), k3('b', 1)],
  ['j', L3('b', ONE, q(1, 2), ZERO, q(1, 4), '<='), k3('b', 1)],
  ['k', L3('t', ONE, q(-1, 4), ZERO, q(1, 2), '>'), k3('t', -1)],
  ['l', L3('t', ONE, q(-1, 3), ZERO, q(1, 4), '>'), k3('t', -1)],
  ['m', L3('n', I(-6), I(5), I(-5), I(5), '>', false, true), k4('n')],
  ['n', L3('n', I(-4), I(6), I(-3), I(6), '>', false, true), k4('n')],
  ['o', L3('p', ZERO, I(-4), I(-1), ZERO, '<'), k5('p')],
  ['p', L3('p', ZERO, I(3), I(-1), ZERO, '<'), k5('p')],
]
function build3(): Exercise {
  const questions: Question[] = BOOK3.map(([part, book, pool], idx): Question => {
    const seen = new Set([lnTex(book)])
    // answers that fit on the number line (-5 ... 5)
    const bank = shuffled(pool, 6400 + idx).filter((x) => Math.abs(val(solve3(x).x)) <= 5 && !seen.has(lnTex(x)) && !!seen.add(lnTex(x))).slice(0, 10)
    const make = (x: Ln, key: string, k: number): Practice => {
      const [choices, correct] = choices3(x, idx + k)
      return { tex: lnTex(x), choices, correct, why: '', lesson: () => lesson3(x, key, idx + k) }
    }
    return { part, ...make(book, part, 0), practice: bank.map((x, k) => make(x, `${part}${k + 1}`, k + 1)) }
  })
  return { no: 3, sec: '6.4', prompt: 'Solve the inequality.', mathChoices: true, questions }
}

// ================= exercise 4: the variable cancels =================
interface Sp4 {
  c: number
  sg: Sym
  k: number
}
const co4 = (c: number) => (c === 1 ? '' : c === -1 ? '-' : String(c))
const tex4 = (x: Sp4) => `${co4(x.c)}x ${SYM_TEX[x.sg]} ${co4(x.c)}x + ${x.k}`
const true4 = (x: Sp4) => (x.sg === '<' ? 0 < x.k : x.sg === '<=' ? 0 <= x.k : x.sg === '>' ? 0 > x.k : 0 >= x.k)
const ALL = '\\text{All real numbers}'
const NONE = '\\text{No solution}'
function lesson4(x: Sp4, key: string, idx: number): Lesson {
  const take = `${co4(x.c)}x`
  const start: Tok[] = [{ id: 'L0v', tex: take }, { id: 'g0', tex: SYM_TEX[x.sg] }, { id: 'R0v', tex: take }, { id: 'R0k', tex: `+ ${x.k}` }]
  const hint1 = `Take $${take}$ away from both sides.`
  const b0: Blank = { id: 'L1k', from: 'L0v', calc: calcOf(`$${take} - (${take}) = \\square$`, '0', [take, `${2 * x.c}x`, '1'], hint1, idx) }
  const b1: Blank = { id: 'R1k', from: 'R0k', calc: calcOf(`$${take} + ${x.k} - (${take}) = \\square$`, String(x.k), [`${take} + ${x.k}`, String(-x.k), String(x.k + 1)], hint1, idx + 1) }
  const l1: Tok[] = [{ id: 'L1k', tex: '0' }, { id: 'g1', tex: SYM_TEX[x.sg] }, { id: 'R1k', tex: String(x.k) }]
  const truth = true4(x)
  const o = ['\\text{True}', '\\text{False}']
  const l2: Tok[] = [{ id: 'L2k', tex: '0' }, { id: 'g2', tex: SYM_TEX[x.sg] }, { id: 'R2k', tex: String(x.k) }, { id: 't2', tex: o[truth ? 0 : 1] }]
  const b2: Blank = { id: 't2', from: 'g1', calc: calcOf(`$0 ${SYM_TEX[x.sg]} ${x.k}$`, o[truth ? 0 : 1], [o[truth ? 1 : 0]], `$0 ${SYM_TEX[x.sg]} ${x.k}$ is ${truth ? 'true' : 'not true'}.`, idx + 2) }
  const ans = truth ? ALL : NONE
  const b3: Blank = { id: 'f3', from: 't2', calc: calcOf('$\\text{True for every } x \\text{ or for no } x ?$', ans, [truth ? NONE : ALL, `x ${SYM_TEX[x.sg]} ${x.k}`, `x ${SYM_TEX[FLIP[x.sg]]} ${x.k}`], truth ? 'True: every $x$ is a solution.' : 'False: no $x$ is a solution.', idx + 3) }
  const steps: Step[] = [
    { focus: ['L0v', 'g0', 'R0v', 'R0k'], result: l1[0], results: l1, blanks: [b0, b1], arrows: [{ from: ['L0v'], to: ['L1k'] }, { from: ['R0k'], to: ['R1k'] }], say: '', calcPrompt: 'The variable on both sides.', calc: b0.calc },
    { focus: ['L1k', 'g1', 'R1k'], result: l2[0], results: l2, blanks: [b2], arrows: [{ from: ['g1'], to: ['t2'] }], say: '', calcPrompt: 'True or false?', calc: b2.calc },
    { focus: ['L2k', 'g2', 'R2k', 't2'], result: { id: 'f3', tex: ans }, results: [{ id: 'f3', tex: ans }], blanks: [b3], arrows: [{ from: ['t2'], to: ['f3'] }], say: '', calcPrompt: 'The solution.', calc: b3.calc },
  ]
  const bare = numberLine([])
  const full = pic4(truth)
  return { key: `ineq64-4${key}`, label: key, source: `Grade 9, 6.4 exercise 4${key}`, title: 'Special case', prompt: 'Solve:', figure: bare, figureAt: (k) => (k >= steps.length ? full : bare), answer: full, start, steps, review: { heading: 'Inequalities', rows: [] } }
}
// the pictures: the whole line (all real numbers), the bare line (no solution), a ray
const pic4 = (all: boolean) => numberLine(all ? [{ a: null, b: null, ac: false, bc: false }] : [])
function choices4(x: Sp4, idx: number): [string[], number] {
  const t = true4(x)
  return pick(pic4(t), [pic4(!t), numberLine([ray(x.sg, x.k)]), numberLine([ray(FLIP[x.sg], x.k)])], idx)
}
const k4s = (cs: number[]): Sp4[] => cs.flatMap((c) => range(1, 5).flatMap((k) => SYMS.map((sg) => ({ c, sg, k }))))
const BOOK4: [string, Sp4, Sp4[]][] = [
  ['a', { c: 1, sg: '>=', k: 2 }, k4s([1, 2, 3, 4])],
  ['b', { c: 1, sg: '<', k: 2 }, k4s([1, 2, 3, 4])],
  ['c', { c: -3, sg: '>', k: 1 }, k4s([-1, -2, -3, -4, -5])],
  ['d', { c: -3, sg: '<=', k: 1 }, k4s([-1, -2, -3, -4, -5])],
]
function build4(): Exercise {
  const questions: Question[] = BOOK4.map(([part, book, pool], idx): Question => {
    const seen = new Set([tex4(book)])
    const bank = shuffled(pool, 6440 + idx).filter((x) => !seen.has(tex4(x)) && !!seen.add(tex4(x))).slice(0, 10)
    const make = (x: Sp4, key: string, k: number): Practice => {
      const [choices, correct] = choices4(x, idx + k)
      return { tex: tex4(x), choices, correct, why: '', lesson: () => lesson4(x, key, idx + k) }
    }
    return { part, ...make(book, part, 0), practice: bank.map((x, k) => make(x, `${part}${k + 1}`, k + 1)) }
  })
  return { no: 4, sec: '6.4', prompt: 'Solve the inequality.', mathChoices: true, questions }
}

// ================= exercise 5: equivalent?, average, rectangle, isosceles triangles =================
interface Rs {
  up: boolean
  closed: boolean
  n: number
  rev?: boolean // written as 3 < x
}
const sgOf = (r: Rs): Sym => (r.up ? (r.closed ? '>=' : '>') : r.closed ? '<=' : '<')
const rsTex = (r: Rs, v: string) => (r.rev ? `${r.n} ${SYM_TEX[FLIP[sgOf(r)]]} ${v}` : `${v} ${SYM_TEX[sgOf(r)]} ${r.n}`)
const inSet = (r: Rs, x: number) => (r.up ? (r.closed ? x >= r.n : x > r.n) : r.closed ? x <= r.n : x < r.n)
interface Eq5 {
  v: string
  p: Rs
  q: Rs
}
const eqTex = (e: Eq5) => `\\text{Are } ${rsTex(e.p, e.v)} \\text{ and } ${rsTex(e.q, e.v)} \\text{ equivalent?}`
const same = (e: Eq5) => e.p.up === e.q.up && e.p.closed === e.q.closed && e.p.n === e.q.n
const YN = ['\\text{Yes}', '\\text{No}']
function lessonEq5(e: Eq5, key: string, idx: number): Lesson {
  const eq = same(e)
  const start: Tok[] = [{ id: 'p0', tex: rsTex(e.p, e.v) }, { id: 'a0', tex: '\\text{ and }' }, { id: 'q0', tex: rsTex(e.q, e.v) }]
  const steps: Step[] = []
  let from = 'p0'
  let focus = ['p0', 'a0', 'q0']
  const cand = [...new Set([e.p.n - 1, e.p.n, e.p.n + 1, e.q.n - 1, e.q.n, e.q.n + 1, (e.p.n + e.q.n) / 2])]
  const w = cand.find((x) => inSet(e.p, x) !== inSet(e.q, x))
  if (!eq && w !== undefined) {
    const rest = cand.filter((x) => x !== w && inSet(e.p, x) === inSet(e.q, x)).map(String)
    const hint = `$x = ${w}$ is a solution of ${inSet(e.p, w) ? 'the first' : 'the second'} one only.`
    const b: Blank = { id: 'w1', from: 'p0', calc: calcOf('$\\text{Which number is a solution of one of them only?}$', String(w), [...rest, String(w + 7), String(w - 7), String(w + 9)], hint, idx) }
    steps.push({ focus, result: { id: 'w1', tex: String(w) }, results: [{ id: 'w1', tex: String(w) }], blanks: [b], arrows: [{ from: ['p0'], to: ['w1'] }], say: '', calcPrompt: 'A number to try.', calc: b.calc })
    from = 'w1'
    focus = ['w1']
  }
  const hint = eq ? 'They have the same solutions.' : 'A number is a solution of one of them only.'
  const b: Blank = { id: 'r2', from, calc: calcOf(eqTex(e), YN[eq ? 0 : 1], [YN[eq ? 1 : 0]], hint, idx + 1) }
  steps.push({ focus, result: { id: 'r2', tex: YN[eq ? 0 : 1] }, results: [{ id: 'r2', tex: YN[eq ? 0 : 1] }], blanks: [b], arrows: [{ from: [from], to: ['r2'] }], say: '', calcPrompt: 'Equivalent?', calc: b.calc })
  return { key: `ineq64-5${key}`, label: key, source: `Grade 9, 6.4 exercise 5${key}`, title: 'Equivalent inequalities', prompt: 'Equivalent?', answer: YN[eq ? 0 : 1], start, steps, review: { heading: 'Inequalities', rows: [] } }
}
const eqPool = (v: string, ups: boolean[]): Eq5[] =>
  ups
    .flatMap((u) => range(-6, 4).flatMap((n) => [-1, 0, 1].flatMap((dn) => [true, false].flatMap((c1) => [true, false].flatMap((c2) => [false, true].map((rev): Eq5 => ({ v, p: { up: u, closed: c1, n }, q: { up: u, closed: c2, n: n + dn, rev } })))))))
    .filter((e) => !same(e) || e.q.rev)
const eqBook = (v: string, u: boolean, c1: boolean, n: number, c2: boolean, m: number): Eq5 => ({ v, p: { up: u, closed: c1, n }, q: { up: u, closed: c2, n: m } })

// ---- word problems: the setup (blanks), then the steps to the answer ----
export interface WpStep {
  toks: Tok[]
  blanks: { id: string; from: string; prompt: string; wrongs: string[]; hint: string }[]
  label: string
  auto?: boolean
  onlyFrom?: boolean
  indent?: number
  lift?: number
  noArrow?: boolean // no arrow stays on the page once the step is answered
  figArrows?: { from: string; pt: number; route?: 'left' | 'right' }[]
  landArrows?: { from: string[]; to: string[] }[]
  split?: WpStep[] // after a wrong answer to this step it is replaced by these smaller steps (they end with the same token ids)
}
export interface Wp {
  tex: string // the sentence
  short: string // what the lesson starts from (the sentence is too long for one line)
  answer: string
  wrong: string[]
  steps: WpStep[]
  key: string
  startToks?: Tok[] // the starting line in several tokens (so arrows can leave from single ones); default: one token `s0` showing `short`
  reference?: { label: string; tex?: string }[] // a "look at these examples" panel above the lesson
}
export function lessonWp(w: Wp, src: string, title: string, idx: number): Lesson {
  const start: Tok[] = w.startToks ?? [{ id: 's0', tex: w.short }]
  // the starting line in several tokens: only the ones the first step's arrows leave from are highlighted (x and y in the equation), not the whole line (the whole line is still the one that changes)
  const lit = [...new Set((w.steps[0]?.blanks ?? []).map((b) => b.from))].filter((id) => start.some((t) => t.id === id))
  const make = (sts: WpStep[], f0: string[], top: boolean): Step[] => {
    let focus = f0
    return sts.map((st, i) => {
      const blanks: Blank[] = st.blanks.map((b, j) => ({ id: b.id, from: b.from, calc: calcOf(b.prompt, st.toks.find((t) => t.id === b.id)!.tex, b.wrongs, b.hint, idx + i + j) }))
      const s: Step = { focus, result: st.toks[0], results: st.toks, blanks, arrows: st.noArrow ? [] : st.landArrows ?? blanks.map((b) => ({ from: [b.from], to: [b.id] })), landArrows: st.landArrows, lit: st.noArrow ? [] : top && i === 0 && w.startToks && lit.length ? lit : st.onlyFrom ? [...new Set(blanks.map((b) => b.from))].filter((id) => focus.includes(id)) : undefined, say: '', calcPrompt: st.label, calc: blanks[0]?.calc ?? { q: '', options: [''], correct: 0, hints: [''], spell: '' }, auto: st.auto, indent: st.indent, lift: st.lift, figArrows: st.figArrows, split: st.split ? make(st.split, focus, false) : undefined }
      focus = st.toks.map((t) => t.id)
      return s
    })
  }
  const steps: Step[] = make(w.steps, start.map((t) => t.id), true)
  return { key: `ineq64-${w.key}`, label: w.key, source: src, title, prompt: 'Answer:', answer: w.answer, start, steps, ...(w.reference ? { reference: w.reference } : {}), review: { heading: 'Inequalities', rows: [] } }
}
export const sgBlank = (id: string, from: string, right: Sym, hint: string) => ({ id, from, prompt: '$\\text{Which sign?}$', wrongs: SYMS.filter((x) => x !== right).map((x) => SYM_TEX[x]), hint })

// 7: average
interface Av {
  S: number[]
  T: number
}
const avSum = (a: Av) => a.S.reduce((x, y) => x + y, 0)
const avTex = (a: Av) => `\\text{A student's test grades are ${a.S.slice(0, -1).join(', ')} and ${a.S[a.S.length - 1]}. What score of the fifth exam will make the average at least ${a.T}?}`
const avNeed = (a: Av) => a.T * 5 - avSum(a)
function wpAv(a: Av, key: string): Wp {
  const sum = a.S.join(' + ')
  const need = avNeed(a)
  return {
    tex: avTex(a), short: `\\text{the average is at least } ${a.T}`, key, answer: `s \\ge ${need}`, wrong: [`s \\le ${need}`, `s \\ge ${a.T}`, `s \\ge ${a.T * 5}`, `s \\ge ${need + 5}`],
    steps: [
      { label: 'Write the average.', toks: [{ id: 'e1a', tex: `\\frac{${sum} + s}{5}` }, { id: 'e1g', tex: '\\ge' }, { id: 'e1b', tex: String(a.T) }], blanks: [{ id: 'e1a', from: 's0', prompt: '$\\text{The average of the five grades}$', wrongs: [`\\frac{${sum} + s}{4}`, `${sum} + s`, `\\frac{${sum}}{5}`], hint: 'Add the five grades and divide by 5.' }, sgBlank('e1g', 's0', '>=', '$\\text{at least} : \\ge$')] },
      { label: 'Multiply by 5.', toks: [{ id: 'e2a', tex: `${sum} + s` }, { id: 'e2g', tex: '\\ge' }, { id: 'e2b', tex: String(a.T * 5) }], blanks: [{ id: 'e2b', from: 'e1b', prompt: `$${a.T} \\cdot 5 = \\square$`, wrongs: [String(a.T * 4), String(a.T + 5), String(a.T / 5)], hint: 'Multiply both sides by 5.' }] },
      { label: 'Take the grades away.', toks: [{ id: 'e3a', tex: 's' }, { id: 'e3g', tex: '\\ge' }, { id: 'e3b', tex: String(need) }], blanks: [{ id: 'e3b', from: 'e2b', prompt: `$${a.T * 5} - ${avSum(a)} = \\square$`, wrongs: [String(a.T * 5 + avSum(a)), String(-need), String(need + 1), String(need - 1)], hint: `Take $${sum}$ away from both sides.` }] },
    ],
  }
}
// 8: rectangle
interface Rc {
  w: number
  P: number
}
const rcTex = (r: Rc) => `\\text{The width of a rectangle is ${r.w} centimeters. What length will make the perimeter at least ${r.P} centimeters?}`
function wpRc(r: Rc, key: string): Wp {
  const half = r.P / 2
  const l = half - r.w
  return {
    tex: rcTex(r), short: `\\text{the perimeter is at least } ${r.P}`, key, answer: `l \\ge ${l}`, wrong: [`l \\le ${l}`, `l \\ge ${half}`, `l \\ge ${r.P - r.w}`, `l \\ge ${l + r.w}`],
    steps: [
      { label: 'Write the perimeter.', toks: [{ id: 'e1a', tex: `2(l + ${r.w})` }, { id: 'e1g', tex: '\\ge' }, { id: 'e1b', tex: String(r.P) }], blanks: [{ id: 'e1a', from: 's0', prompt: '$\\text{The perimeter of the rectangle}$', wrongs: [`l + ${r.w}`, `2l + ${r.w}`, `${r.w}l`], hint: 'Perimeter = 2 (length + width).' }, sgBlank('e1g', 's0', '>=', '$\\text{at least} : \\ge$')] },
      { label: 'Divide by 2.', toks: [{ id: 'e2a', tex: `l + ${r.w}` }, { id: 'e2g', tex: '\\ge' }, { id: 'e2b', tex: String(half) }], blanks: [{ id: 'e2b', from: 'e1b', prompt: `$${r.P} \\div 2 = \\square$`, wrongs: [String(r.P * 2), String(r.P - 2), String(half + r.w)], hint: 'Divide both sides by 2.' }] },
      { label: 'Take the width away.', toks: [{ id: 'e3a', tex: 'l' }, { id: 'e3g', tex: '\\ge' }, { id: 'e3b', tex: String(l) }], blanks: [{ id: 'e3b', from: 'e2b', prompt: `$${half} - ${r.w} = \\square$`, wrongs: [String(half + r.w), String(-l), String(l + 1)], hint: `Take $${r.w}$ away from both sides.` }] },
    ],
  }
}
// 9: isosceles, equal sides s, perimeter at least P
interface Is {
  s: number
  P: number
}
const setTex = (a: number, b: number) => `\\{${range(a, b).join(', ')}\\}`
const isTex = (t: Is) => `\\text{The equal sides of an isosceles triangle are ${t.s} centimeters. What are the possible lengths of the base, if the base is an integer, and the perimeter must be greater than or equal to ${t.P} centimeters?}`
function wpIs(t: Is, key: string): Wp {
  const lo = t.P - 2 * t.s
  const hi = 2 * t.s - 1
  const wr = [setTex(lo + 1, hi), setTex(lo, hi + 1), setTex(lo - 1, hi), setTex(lo, hi - 1)]
  return {
    tex: isTex(t), short: `\\text{the perimeter is at least } ${t.P}`, key, answer: setTex(lo, hi), wrong: wr,
    steps: [
      { label: 'Write the perimeter.', toks: [{ id: 'e1a', tex: `${t.s} + ${t.s} + b` }, { id: 'e1g', tex: '\\ge' }, { id: 'e1b', tex: String(t.P) }], blanks: [{ id: 'e1a', from: 's0', prompt: '$\\text{The perimeter}$', wrongs: [`${t.s} + b`, `${2 * t.s}b`, `${t.s} \\cdot ${t.s} + b`], hint: 'Two equal sides and the base.' }, sgBlank('e1g', 's0', '>=', '$\\text{greater than or equal to} : \\ge$')] },
      { label: 'Take the equal sides away.', toks: [{ id: 'e2a', tex: 'b' }, { id: 'e2g', tex: '\\ge' }, { id: 'e2b', tex: String(lo) }], blanks: [{ id: 'e2b', from: 'e1b', prompt: `$${t.P} - ${t.s} - ${t.s} = \\square$`, wrongs: [String(t.P - t.s), String(t.P + 2 * t.s), String(lo + 1)], hint: `Take $${t.s} + ${t.s}$ away from both sides.` }] },
      { label: 'The sides of a triangle.', toks: [{ id: 'e3a', tex: String(lo) }, { id: 'e3g', tex: '\\le' }, { id: 'e3b', tex: 'b' }, { id: 'e3h', tex: '<' }, { id: 'e3c', tex: String(2 * t.s) }], blanks: [{ id: 'e3c', from: 'e2a', prompt: `$b < ${t.s} + ${t.s} = \\square$`, wrongs: [String(t.s), String(2 * t.s + 1), String(2 * t.s - 1)], hint: 'The base is shorter than the other two sides together.' }] },
      { label: 'The integers.', toks: [{ id: 'e4', tex: setTex(lo, hi) }], blanks: [{ id: 'e4', from: 'e3b', prompt: `$${lo} \\le b < ${2 * t.s},\\ b \\text{ an integer}$`, wrongs: wr, hint: `The integers from $${lo}$ up to $${hi}$.` }] },
    ],
  }
}
// 10: equal sides x, base k - x, perimeter at most Pm
interface Tr {
  k: number
  Pm: number
}
const trTex = (t: Tr) => `\\text{An isosceles triangle with equal sides } x \\text{ and base side } ${t.k} - x \\text{ has a perimeter less than or equal to ${t.Pm}. If the sides are integers, determine the possible solutions.}`
const trFrac = (k: number) => (k % 3 === 0 ? String(k / 3) : `\\frac{${k}}{3}`)
function wpTr(t: Tr, key: string): Wp {
  const lo = Math.floor(t.k / 3) + 1
  const hi = t.Pm - t.k
  const wr = [setTex(lo - 1, hi), setTex(lo, hi + 1), setTex(lo + 1, hi), setTex(lo, hi - 1)]
  return {
    tex: trTex(t), short: `\\text{the perimeter is at most } ${t.Pm}`, key, answer: setTex(lo, hi), wrong: wr,
    steps: [
      { label: 'Write the perimeter.', toks: [{ id: 'e1a', tex: `x + x + (${t.k} - x)` }, { id: 'e1g', tex: '\\le' }, { id: 'e1b', tex: String(t.Pm) }], blanks: [{ id: 'e1a', from: 's0', prompt: '$\\text{The perimeter}$', wrongs: [`x + (${t.k} - x)`, `x + x + ${t.k} + x`, `x \\cdot x (${t.k} - x)`], hint: `Two equal sides $x$ and the base $${t.k} - x$.` }, sgBlank('e1g', 's0', '<=', '$\\text{less than or equal to} : \\le$')] },
      { label: 'Collect.', toks: [{ id: 'e2a', tex: 'x' }, { id: 'e2g', tex: '\\le' }, { id: 'e2b', tex: String(hi) }], blanks: [{ id: 'e2b', from: 'e1b', prompt: `$x + ${t.k} \\le ${t.Pm} \\;\\to\\; x \\le \\square$`, wrongs: [String(t.Pm + t.k), String(t.k - t.Pm), String(hi + 1)], hint: `Take $${t.k}$ away from both sides.` }] },
      { label: 'The sides of a triangle.', toks: [{ id: 'e3a', tex: trFrac(t.k) }, { id: 'e3g', tex: '<' }, { id: 'e3b', tex: 'x' }, { id: 'e3h', tex: '\\le' }, { id: 'e3c', tex: String(hi) }], blanks: [{ id: 'e3a', from: 'e2a', prompt: `$x + x > ${t.k} - x \\;\\to\\; x > \\square$`, wrongs: [t.k % 2 === 0 ? String(t.k / 2) : `\\frac{${t.k}}{2}`, String(t.k), trFrac(t.k + 3)], hint: `Two sides together are longer than the third: $2x > ${t.k} - x$.` }] },
      { label: 'The integers.', toks: [{ id: 'e4', tex: setTex(lo, hi) }], blanks: [{ id: 'e4', from: 'e3b', prompt: `$${trFrac(t.k)} < x \\le ${hi},\\ x \\text{ an integer}$`, wrongs: wr, hint: `The integers from $${lo}$ up to $${hi}$.` }] },
    ],
  }
}

function build5(): Exercise {
  const mk = <T,>(book: T, pool: T[], seed: number, tex: (x: T) => string, one: (x: T, key: string, k: number) => Practice, part: string): Question => {
    const seen = new Set([tex(book)])
    const bank = shuffled(pool, seed).filter((x) => !seen.has(tex(x)) && !!seen.add(tex(x))).slice(0, 10)
    return { part, ...one(book, part, 0), practice: bank.map((x, k) => one(x, `${part}${k + 1}`, k + 1)) }
  }
  const eqOne = (e: Eq5, key: string, k: number): Practice => ({ tex: eqTex(e), choices: YN, correct: same(e) ? 0 : 1, why: '', lesson: () => lessonEq5(e, key, k) })
  const wpOne = <T,>(f: (x: T, key: string) => Wp, title: string, seed: number) => (x: T, key: string, k: number): Practice => {
    const w = f(x, key)
    const [choices, correct] = pick(w.answer, w.wrong, seed + k)
    return { tex: w.tex, choices, correct, why: '', lesson: () => lessonWp(f(x, key), `Grade 9, 6.4 exercise 5${key}`, title, seed + k) }
  }
  const avs: Av[] = range(0, 80)
    .map((i) => ({ S: [0, 1, 2, 3].map((j) => 70 + ((i * 7 + j * 13 + (i % 5) * 3) % 26)), T: 80 + (i % 9) }))
    .filter((a) => avNeed(a) > 60 && avNeed(a) <= 100)
  const rcs: Rc[] = range(3, 9).flatMap((w) => [20, 24, 28, 30, 32, 36, 40].filter((P) => P / 2 - w > 0).map((P) => ({ w, P })))
  const iss: Is[] = range(5, 10).flatMap((s) => range(4 * s - 3, 4 * s).map((P) => ({ s, P })))
  const trs: Tr[] = range(5, 9).flatMap((k) => range(k + 2, k + 4).map((Pm) => ({ k, Pm })))
  const questions: Question[] = [
    mk(eqBook('x', true, false, -2, true, -1), eqPool('x', [true, false]), 6500, eqTex, eqOne, 'a'),
    mk(eqBook('y', false, false, -5, true, -6), eqPool('y', [false, true]), 6501, eqTex, eqOne, 'b'),
    mk<Av>({ S: [75, 79, 88, 94], T: 85 }, avs, 6502, avTex, wpOne(wpAv, 'Average', 6502), 'c'),
    mk<Rc>({ w: 5, P: 30 }, rcs, 6503, rcTex, wpOne(wpRc, 'Rectangle', 6503), 'd'),
    mk<Is>({ s: 8, P: 30 }, iss, 6504, isTex, wpOne(wpIs, 'Isosceles triangle', 6504), 'e'),
    mk<Tr>({ k: 5, Pm: 9 }, trs, 6505, trTex, wpOne(wpTr, 'Isosceles triangle', 6505), 'f'),
  ]
  return { no: 5, sec: '6.4', prompt: 'Answer the question.', mathChoices: true, questions }
}

export const EX_INEQ64 = [build3(), build4(), build5()]
