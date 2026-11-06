// Grade 9 4.4 (bank/G9-ch4/s4/items.json): equations and graphs. Exercise 12 (string) is left out; 8-11 (word problems) are merged into exercise 6 here.
//   1 which graph matches the equation (click one of three small graphs; the book's 1, 3 and 4), 2 which equation matches the graph (the book's 2),
//   3 the y-intercept of a graph (5), 4 the slope of a graph (6), 5 the equation of a graph (7), 6 word problems (a salary, b tournament, c telephone, d temperature scales)
// The graphs are drawn here (plane.ts); every question is multiple choice, the lessons are blanks (ineq64-data.ts lessonWp).
// The 10 similar questions of every question are made here from small tables; every answer and step is computed.
// Imported by: quiz.tsx, check44.ts. Shape: exercise.ts. Helpers: graph42-data.ts, seq41-data.ts.
import type { Draw } from './exercise'
import type { Wp } from './ineq64-data'
import { build, ptTex, uniq, slopeEq } from './graph42-data'
import type { It } from './graph42-data'
import { clipLine, planeSvg } from './plane'
import { isolateY } from './graph43-data'
import { blk, lin, n4, num, par, range, text } from './seq41-data'

type P = [number, number]
type Ln = { m: number; c: number } | { vx: number }
const D = (extra: Partial<Draw>): Draw => ({ xmin: -6, xmax: 6, ymin: -6, ymax: 6, xs: 1, ys: 1, xlabel: 'x', ylabel: 'y', m: 0, c: 0, ...extra })
const stTex = (a: number, b: number, c: number) => `${a === 1 ? '' : a === -1 ? '-' : a}x ${b < 0 ? '-' : '+'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}y = ${c}`
const lkey = (L: Ln) => ('vx' in L ? `v${L.vx}` : `${+L.m.toFixed(4)}:${+L.c.toFixed(4)}`)
const visible = (L: Ln) => ('vx' in L ? Math.abs(L.vx) <= 6 : !!clipLine(L.m, L.c, D({})))
// the grid points of y = m x + c inside the plane
const lattice = (m: number, c: number): P[] => range(-6, 6).flatMap((x): P[] => {
  const y = m * x + c
  return Math.abs(y - Math.round(y)) < 1e-9 && Math.abs(y) <= 6 ? [[x, Math.round(y)]] : []
})
const nearOrigin = (pts: P[]) => [...pts].sort((a, b) => a[0] ** 2 + a[1] ** 2 - (b[0] ** 2 + b[1] ** 2))
// two grid points at least 2 apart in x (nearest to the origin), left one first
const pickTwo = (pts: P[]): [P, P] => {
  const s = nearOrigin(pts)
  const second = s.find((p) => Math.abs(p[0] - s[0][0]) >= 2) ?? s[1]
  return s[0][0] <= second[0] ? [s[0], second] : [second, s[0]]
}
// the line y = m x + b in pieces, so that m and b can be lit and the arrows leave from them
const TEMPLATE = [{ id: 'ty', tex: 'y =' }, { id: 'tm', tex: 'm' }, { id: 'tx', tex: 'x +' }, { id: 'tb', tex: 'b' }]
const wrongNums =(v: number, ...more: number[]) => uniq([...more, -v, v + 1, v - 1, v + 2].map((x) => num(x, false)), (s) => s).filter((s) => s !== num(v, false))

// ---- three small graphs side by side, A B C (a click on one answers: data-choice) ----
const pane = (i: number, L: Ln) => {
  const u = 10
  const o = 12
  const X = (v: number) => o + (v + 6) * u
  const Y = (v: number) => o + (6 - v) * u
  const grid = range(-6, 6).map((v) => `<line x1="${X(v)}" y1="${Y(-6)}" x2="${X(v)}" y2="${Y(6)}" stroke="#e2e8f0"/><line x1="${X(-6)}" y1="${Y(v)}" x2="${X(6)}" y2="${Y(v)}" stroke="#e2e8f0"/>`).join('')
  const axes = `<line x1="${X(-6)}" y1="${Y(0)}" x2="${X(6)}" y2="${Y(0)}" stroke="#334155" stroke-width="1.5"/><line x1="${X(0)}" y1="${Y(-6)}" x2="${X(0)}" y2="${Y(6)}" stroke="#334155" stroke-width="1.5"/>`
  const c = 'vx' in L ? [L.vx, -6, L.vx, 6] : clipLine(L.m, L.c, D({}))
  const line = c ? `<line x1="${X(c[0])}" y1="${Y(c[1])}" x2="${X(c[2])}" y2="${Y(c[3])}" stroke="#0284c7" stroke-width="2.5"/>` : ''
  return `<g transform="translate(${i * 150},0)" data-choice="${i}" style="cursor:pointer"><rect x="1" y="1" width="144" height="144" rx="8" fill="#fff" stroke="#cbd5e1"/>${grid}${axes}${line}<text x="6" y="16" font-size="14" font-weight="bold" fill="#0f172a">${'ABC'[i]}</text></g>`
}
const threeGraphs = (lines: Ln[]) => `<svg viewBox="0 0 446 148" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:520px;height:auto;margin:0 auto;display:block">${lines.map((l, i) => pane(i, l)).join('')}</svg>`

// ================= exercise 1: which graph matches the equation =================
export type E1 = { k: 'sl'; m: number; c: number; s: number } | { k: 'st'; a: number; b: number; c: number; s: number } | { k: 'v' | 'h'; v: number; s: number }
export function mk1(e: E1, key: string): It {
  let L: Ln
  let eq: string
  let cand: Ln[]
  if (e.k === 'sl') {
    L = { m: e.m, c: e.c }
    eq = slopeEq(e.m, e.c)
    cand = [{ m: -e.m, c: e.c }, { m: e.m, c: -e.c }, { m: -e.m, c: -e.c }, { m: e.m + 1, c: e.c }]
  } else if (e.k === 'st') {
    const m = -e.a / e.b
    const c0 = e.c / e.b
    L = { m, c: c0 }
    eq = stTex(e.a, e.b, e.c)
    cand = [{ m: -m, c: c0 }, { m, c: -c0 }, { m: -m, c: -c0 }, { m: -e.b / e.a, c: e.c / e.a }]
  } else if (e.k === 'v') {
    L = { vx: e.v }
    eq = `x = ${e.v}`
    cand = [{ vx: -e.v }, { m: 0, c: e.v }, { m: 0, c: -e.v }]
  } else {
    L = { m: 0, c: e.v }
    eq = `y = ${e.v}`
    cand = [{ m: 0, c: -e.v }, { vx: e.v }, { vx: -e.v }]
  }
  const alts = uniq(cand.filter(visible).filter((l) => lkey(l) !== lkey(L)), lkey).slice(0, 2)
  const at = e.s % 3
  const lines = [...alts]
  lines.splice(at, 0, L)
  const letters = ['A', 'B', 'C']
  const ans = letters[at]
  const wrongL = letters.filter((l) => l !== ans)
  const last = (why: string) => ({ label: 'The graph.', toks: [{ id: 'c1a', tex: '\\text{the graph is}' }, { id: 'c1b', tex: ans }], blanks: [blk('c1b', 'b1b', `$\\text{${why}}$`, wrongL, 'Look at the three graphs and keep the one that fits both facts.')] })
  let steps: Wp['steps']
  let iso: ReturnType<typeof isolateY> | null = null
  if (e.k === 'sl' || e.k === 'st') {
    const L2 = L as { m: number; c: number }
    const up = L2.m > 0
    const dir = up ? 'up' : 'down'
    // a x + b y = c: first y is isolated step by step (graph43-data.ts), then y = m x + b is read
    iso = e.k === 'st' ? isolateY(e, false) : null
    steps = [
      ...(iso ? iso.isolate : []),
      {
        label: 'What are b and m?',
        toks: [{ id: 'b1a', tex: 'm' }, { id: 'b1g', tex: '=' }, { id: 'b1b', tex: num(L2.m, false) }, { id: 'a1a', tex: 'b' }, { id: 'a1g', tex: '=' }, { id: 'a1b', tex: n4(L2.c) }],
        blanks: [
          blk('a1b', iso ? 'r1k' : e.c === 0 ? 'smx' : 'sk', '$y = m\\,x + b\\text{: what is } b\\text{?}$', wrongNums(L2.c, e.k === 'sl' ? e.m : e.c), 'b is the number added at the end.'),
          blk('b1b', iso ? 'r1m' : 'smx', '$y = m\\,x + b\\text{: what is } m\\text{?}$', [num(-L2.m, false), num(1 / L2.m, false), num(-1 / L2.m, false), num(L2.m + 1, false)].filter((s) => s !== num(L2.m, false)), 'm is the number in front of x.'),
        ],
      },
      last(`Which graph crosses the y-axis at ${n4(L2.c)} and goes ${dir}? (the slope is $${num(L2.m, false)}$)`),
    ]
  } else if (e.k === 'v') {
    steps = [
      { label: 'What is the y-intercept?', toks: [{ id: 'a1a', tex: '\\text{y-intercept}' }, { id: 'a1g', tex: '=' }, { id: 'a1b', tex: '\\text{none}' }], blanks: [blk('a1b', 's0', `$${eq}\\text{: does the line touch the y-axis?}$`, ['0', n4(e.v), n4(-e.v)], 'In x = k every point has the same x, so the line is straight up and down and never meets the y-axis.')] },
      { label: 'What is the slope?', toks: [{ id: 'b1a', tex: 'm' }, { id: 'b1g', tex: '=' }, { id: 'b1b', tex: '\\text{undefined}' }], blanks: [blk('b1b', 'a1b', '$\\text{A vertical line has run } 0\\text{, and we cannot divide by } 0$', ['0', '1', '-1'], 'The slope of a vertical line is undefined.')] },
      last(`Which graph is vertical, with no y-intercept, and crosses the x-axis at ${n4(e.v)}?`),
    ]
  } else {
    steps = [
      { label: 'What is the y-intercept?', toks: [{ id: 'a1a', tex: 'b' }, { id: 'a1g', tex: '=' }, { id: 'a1b', tex: n4(e.v) }], blanks: [blk('a1b', 's0', `$${eq}\\text{: where does the line cross the y-axis?}$`, wrongNums(e.v, 0), 'In y = k every point has y equal to k, so the line crosses the y-axis at k.')] },
      { label: 'What is the slope?', toks: [{ id: 'b1a', tex: 'm' }, { id: 'b1g', tex: '=' }, { id: 'b1b', tex: '0' }], blanks: [blk('b1b', 'a1b', '$\\text{A horizontal line does not rise}$', ['1', '-1', n4(e.v)], 'A flat line has rise 0, so the slope is 0.')] },
      last(`Which graph is horizontal, with slope 0, and crosses the y-axis at ${n4(e.v)}?`),
    ]
  }
  const w: Wp = { tex: `${text('Which graph matches ')}${eq}${text('? Click it.')}`, short: eq, ...(iso ? { startToks: iso.startToks } : e.k === 'sl' ? { startToks: [{ id: 'sy', tex: 'y =' }, { id: 'smx', tex: e.m === 1 ? 'x' : e.m === -1 ? '-x' : `${num(e.m, false)}x` }, ...(e.c === 0 ? [] : [{ id: 'sk', tex: `${e.c < 0 ? '-' : '+'} ${num(Math.abs(e.c), false)}` }])] } : {}), key, answer: ans, wrong: wrongL, steps }
  return { w, fig: threeGraphs(lines), fixed: letters, showTex: true }
}
const SL = (ms: number[], cs: number[]): E1[] => ms.flatMap((m) => cs.map((c, i): E1 => ({ k: 'sl', m, c, s: i + Math.round(m * 2) + 9 })))
const ST = (as: number[], bs: number[], c0s: number[]): E1[] => as.flatMap((a) => bs.flatMap((b) => c0s.map((c0, i): E1 => ({ k: 'st', a, b, c: b * c0, s: i + a + b + 9 }))))
export const E1_ROWS: [string, E1, E1[]][] = [
  ['a', { k: 'sl', m: 2, c: 0, s: 0 }, SL([1, 2, 3, -1, -2, -3], [0, 1, -1, 2, -2])],
  ['b', { k: 'sl', m: 1, c: 3, s: 1 }, SL([1, 2, -1, -2], [3, -3, 2, -2, 4, -4])],
  ['c', { k: 'sl', m: 1 / 3, c: 2, s: 2 }, SL([1 / 3, -1 / 3, 1 / 2, -1 / 2, 3, -3], [2, -2, 1, -1, 3, -3])],
  ['d', { k: 'st', a: 2, b: -3, c: 6, s: 1 }, ST([1, 2, 3, -1, -2], [2, 3, -2, -3, 1, -1], [-4, -3, -2, -1, 1, 2, 3, 4])],
  ['e', { k: 'st', a: 3, b: 2, c: -6, s: 2 }, ST([3, 2, 1, -3, -2], [2, 3, 1, -1, -2], [-3, -2, -1, 1, 2, 3])],
  ['f', { k: 'v', v: 4, s: 0 }, [-5, -4, -3, -2, 2, 3, 4, 5].flatMap((v, i): E1[] => [{ k: 'v', v, s: i }, { k: 'v', v, s: i + 1 }])],
  ['g', { k: 'h', v: -2, s: 1 }, [-5, -4, -3, -1, 1, 2, 3, 4, 5].flatMap((v, i): E1[] => [{ k: 'h', v, s: i }, { k: 'h', v, s: i + 2 }])],
]
export const e1id = (e: E1) => JSON.stringify(e)

// ================= exercise 2: which equation matches the graph =================
interface E2 {
  a: number
  b: number
  c: number // a x + b y = c with c / b a whole number
}
function mk2(e: E2, key: string): It {
  const m = -e.a / e.b
  const c0 = e.c / e.b
  const d = D({ m, c: c0 })
  const other = nearOrigin(lattice(m, c0).filter((p) => p[0] !== 0))[0]
  const ans = stTex(e.a, e.b, e.c)
  const wrong = uniq([stTex(e.a, -e.b, e.c), stTex(-e.a, e.b, e.c), stTex(e.a, e.b, -e.c)], (s) => s).filter((s) => s !== ans)
  const w: Wp = {
    tex: text('Which equation matches the graph?'),
    short: 'y = m\\,x + b',
    startToks: TEMPLATE,
    key,
    answer: ans,
    wrong,
    steps: [
      {
        label: 'What are b and m?',
        toks: [{ id: 'g2a', tex: 'm' }, { id: 'g2g', tex: '=' }, { id: 'g2b', tex: num(m, false) }, { id: 'g1a', tex: 'b' }, { id: 'g1g', tex: '=' }, { id: 'g1b', tex: n4(c0) }],
        blanks: [
          blk('g1b', 'tb', '$\\text{Where does the line cross the y-axis?}$', wrongNums(c0, m), 'Look at the first orange dot, on the y-axis.'),
          blk('g2b', 'tm', `$\\dfrac{${n4(other[1])} - ${par(c0)}}{${n4(other[0])} - 0} = \\square$`, [num(-m, false), num(1 / m, false), num(-1 / m, false), num(m + 1, false)].filter((s) => s !== num(m, false)), `Use the two orange dots: (0, ${n4(c0)}) and (${other[0]}, ${other[1]}). Rise over run.`),
        ],
      },
      { label: 'The equation.', toks: [{ id: 'g3a', tex: ans }], blanks: [blk('g3a', 'g2b', `$\\text{Which equation has } m = ${num(m, false)} \\text{ and } b = ${n4(c0)}\\text{?}$`, wrong, 'Solve each equation for y, then compare m and b.')] },
    ],
  }
  return { w, fig: planeSvg(d, [[0, c0], other]) }
}
const T2 = (as: number[], bs: number[], c0s: number[]): E2[] => as.flatMap((a) => bs.flatMap((b) => c0s.map((c0): E2 => ({ a, b, c: b * c0 })))).filter((e) => lattice(-e.a / e.b, e.c / e.b).some((p) => p[0] !== 0))
const E2_ROWS: [string, E2, E2[]][] = [
  ['a', { a: 2, b: 3, c: 6 }, T2([1, 2, 3, -1, -2], [2, 3, -2, -3], [2, 3, 4, -2, -3, -4, 1, -1])],
  ['b', { a: 2, b: 1, c: 4 }, T2([2, 3, -2, -3, 1, -1], [1], [4, 3, 2, -2, -3, -4])],
  ['c', { a: 1, b: 1, c: 3 }, T2([1, 2, -1, -2], [1, -1, 2], [3, -3, 2, -2, 4, -4])],
  ['d', { a: 3, b: -2, c: -6 }, T2([3, 1, 2, -3], [-2, 2, 3, -3], [3, 2, 4, -2, -3, -4, 1, -1])],
  ['e', { a: 1, b: 2, c: 4 }, T2([1, 3, 5, -1, -3], [2, -2, 4], [-2, 2, -1, 1, 3, -3])],
  ['f', { a: 5, b: 2, c: 4 }, T2([5, 3, -5, 1], [2, -2, 4, 3], [-2, 2, 1, -1, 3, -3])],
]
const e2id = (e: E2) => JSON.stringify(e)

// ================= exercise 3: the y-intercept of a graph (none for a vertical line) =================
type E3 = { k: 'sl'; m: number; c: number } | { k: 'v'; v: number }
function mk3(e: E3, key: string): It {
  const q = text('What is the y-intercept of the graph? If there is none, choose none.')
  if (e.k === 'v') {
    const ans = '\\text{none}'
    const wrong = [ptTex(0, e.v), ptTex(e.v, 0), ptTex(0, 0)]
    const w: Wp = {
      tex: q,
      short: '\\text{the graph}',
      key,
      answer: ans,
      wrong,
      steps: [{ label: 'Does it cross the y-axis?', toks: [{ id: 'y1a', tex: '\\text{y-intercept}' }, { id: 'y1g', tex: '=' }, { id: 'y1b', tex: ans }], blanks: [blk('y1b', 's0', '$\\text{The line is vertical, parallel to the y-axis. Does it ever touch it?}$', wrong, 'A vertical line never meets the y-axis, so there is no y-intercept.')] }],
    }
    return { w, fig: planeSvg(D({ vx: e.v }), []) }
  }
  const d = D({ m: e.m, c: e.c })
  const ans = ptTex(0, e.c)
  const wrong = uniq([ptTex(e.c, 0), ptTex(0, -e.c), '\\text{none}', ptTex(0, e.c + 1), ptTex(e.c + 1, 0)], (s) => s).filter((s) => s !== ans)
  const w: Wp = {
    tex: q,
    short: '\\text{the graph}',
    key,
    answer: ans,
    wrong,
    steps: [
      { label: 'Find the y-axis.', toks: [{ id: 'y1a', tex: 'y' }, { id: 'y1g', tex: '=' }, { id: 'y1b', tex: n4(e.c) }], blanks: [blk('y1b', 's0', '$\\text{Where does the line touch the y-axis? Read y}$', wrongNums(e.c), 'Up is positive and down is negative.')] },
      { label: 'The point.', toks: [{ id: 'y2a', tex: '\\text{y-intercept}' }, { id: 'y2g', tex: '=' }, { id: 'y2b', tex: ans }], blanks: [blk('y2b', 'y1b', '$(x,\\ y)\\ \\text{with } x = 0$', wrong, 'On the y-axis x is 0.')] },
    ],
  }
  return { w, fig: planeSvg(d, []), figAt: (n: number) => planeSvg(d, n >= 1 ? [[0, e.c]] : []) }
}
const S3 = (ms: number[], cs: number[]): E3[] => ms.flatMap((m) => cs.map((c): E3 => ({ k: 'sl', m, c }))).filter((e) => e.k === 'sl' && lattice(e.m, e.c).length >= 2)
const E3_ROWS: [string, E3, E3[]][] = [
  ['a', { k: 'sl', m: 1, c: 2 }, S3([1, 2, -1, -2, 3, -3], [-4, -3, -2, -1, 1, 2, 3, 4])],
  ['b', { k: 'sl', m: -2, c: -3 }, S3([-1, -2, -3, 1, 2], [-5, -4, -3, -2, -1, 1, 2, 3])],
  ['c', { k: 'sl', m: 1 / 2, c: 1 }, S3([1 / 2, -1 / 2, 1 / 3, -1 / 3, 2 / 3, -2 / 3], [-4, -3, -2, -1, 1, 2, 3, 4])],
  ['d', { k: 'sl', m: 0, c: 3 }, [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5].map((c): E3 => ({ k: 'sl', m: 0, c }))],
  ['e', { k: 'v', v: -3 }, [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5].map((v): E3 => ({ k: 'v', v }))],
]
const e3id = (e: E3) => JSON.stringify(e)

// ================= exercise 4: the slope of a graph (undefined for a vertical line) =================
type E4 = { k: 'sl'; m: number; c: number } | { k: 'v'; v: number; y1: number; y2: number }
function mk4(e: E4, key: string): It {
  const q = text('What is the slope of the graph? Use the two orange dots.')
  if (e.k === 'v') {
    const ans = '\\text{undefined}'
    const wrong = ['0', '1', '-1']
    const w: Wp = {
      tex: q,
      short: '\\text{the two dots}',
      key,
      answer: ans,
      wrong,
      steps: [
        { label: 'The run.', toks: [{ id: 'r1a', tex: '\\text{run}' }, { id: 'r1g', tex: '=' }, { id: 'r1b', tex: '0' }], blanks: [blk('r1b', 's0', `$${e.v} - ${par(e.v)} = \\square$`, ['1', '-1', n4(e.v)], 'Both dots have the same x, so the line does not move to the right.')] },
        { label: 'The slope.', toks: [{ id: 'r2a', tex: 'm' }, { id: 'r2g', tex: '=' }, { id: 'r2b', tex: ans }], blanks: [blk('r2b', 'r1b', '$\\dfrac{\\text{rise}}{0}$', wrong, 'We cannot divide by 0, so the slope of a vertical line is undefined.')] },
      ],
    }
    return { w, fig: planeSvg(D({ vx: e.v }), [[e.v, e.y1], [e.v, e.y2]]) }
  }
  const [p1, p2] = pickTwo(lattice(e.m, e.c))
  const rise = p2[1] - p1[1]
  const run = p2[0] - p1[0]
  const m = e.m
  const ans = num(m, false)
  const wrong = uniq([num(-m, false), ...(m === 0 ? [] : [num(1 / m, false), num(-1 / m, false)]), num(m + 1, false), num(m - 1, false)], (s) => s).filter((s) => s !== ans)
  const w: Wp = {
    tex: q,
    short: '\\text{the two dots}',
    key,
    answer: ans,
    wrong,
    steps: [
      { label: 'The rise.', toks: [{ id: 'r1a', tex: '\\text{rise}' }, { id: 'r1g', tex: '=' }, { id: 'r1b', tex: n4(rise) }], blanks: [blk('r1b', 's0', `$${p2[1]} - ${par(p1[1])} = \\square$`, wrongNums(rise, run), `The dots are (${p1[0]}, ${p1[1]}) and (${p2[0]}, ${p2[1]}). Rise is the change in y.`)] },
      { label: 'The run.', toks: [{ id: 'r2a', tex: '\\text{run}' }, { id: 'r2g', tex: '=' }, { id: 'r2b', tex: n4(run) }], blanks: [blk('r2b', 'r1b', `$${p2[0]} - ${par(p1[0])} = \\square$`, wrongNums(run, rise), 'Run is the change in x.')] },
      { label: 'The slope.', toks: [{ id: 'r3a', tex: 'm' }, { id: 'r3g', tex: '=' }, { id: 'r3b', tex: ans }], blanks: [blk('r3b', 'r2b', `$\\dfrac{\\text{rise}}{\\text{run}} = \\dfrac{${n4(rise)}}{${n4(run)}} = \\square$`, wrong, 'Rise divided by run.')] },
    ],
  }
  return { w, fig: planeSvg(D({ m, c: e.c }), [p1, p2]) }
}
const twoApart = (m: number, c: number) => {
  const pts = lattice(m, c)
  return pts.length >= 2 && (m === 0 || pts.some((p) => Math.abs(p[0] - pts[0][0]) >= 2))
}
const S4 = (ms: number[], cs: number[]): E4[] => ms.flatMap((m) => cs.map((c): E4 => ({ k: 'sl', m, c }))).filter((e) => e.k === 'sl' && twoApart(e.m, e.c))
const E4_ROWS: [string, E4, E4[]][] = [
  ['a', { k: 'sl', m: 2, c: 1 }, S4([1, 2, 3, 4], [-3, -2, -1, 0, 1, 2, 3])],
  ['b', { k: 'sl', m: -2, c: 3 }, S4([-1, -2, -3, -4], [-3, -2, -1, 0, 1, 2, 3])],
  ['c', { k: 'sl', m: 1 / 2, c: -1 }, S4([1 / 2, 1 / 3, 2 / 3, 3 / 2], [-3, -2, -1, 0, 1, 2, 3])],
  ['d', { k: 'sl', m: -2 / 3, c: 2 }, S4([-1 / 2, -1 / 3, -2 / 3, -3 / 2], [-3, -2, -1, 0, 1, 2, 3])],
  ['e', { k: 'sl', m: 0, c: -2 }, [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5].map((c): E4 => ({ k: 'sl', m: 0, c }))],
  ['f', { k: 'v', v: 3, y1: -2, y2: 3 }, [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5].map((v, i): E4 => ({ k: 'v', v, y1: -3 + (i % 3), y2: 2 + (i % 3) }))],
]
const e4id = (e: E4) => JSON.stringify(e)

// ================= exercise 5: the equation of a graph in slope-intercept form =================
export interface E5 {
  p: number
  q: number
  b: number
}
export function mk5(e: E5, key: string): It {
  const m = e.p / e.q
  const ok = (x: number, y: number) => Math.abs(x) <= 6 && Math.abs(y) <= 6
  const [x2, y2] = ok(e.q, e.b + e.p) ? [e.q, e.b + e.p] : [-e.q, e.b - e.p]
  const ans = slopeEq(m, e.b)
  const wrong = uniq([slopeEq(-m, e.b), slopeEq(m, -e.b), slopeEq(1 / m, e.b), `y = ${lin(e.b, 'x', m, false)}`, slopeEq(m, e.b + 1)], (s) => s).filter((s) => s !== ans)
  const w: Wp = {
    tex: text('Write an equation for the line in slope-intercept form.'),
    short: 'y = m\\,x + b',
    startToks: TEMPLATE,
    key,
    answer: ans,
    wrong,
    steps: [
      {
        label: 'What are b and m?',
        toks: [{ id: 'q2a', tex: 'm' }, { id: 'q2g', tex: '=' }, { id: 'q2b', tex: num(m, false) }, { id: 'q1a', tex: 'b' }, { id: 'q1g', tex: '=' }, { id: 'q1b', tex: n4(e.b) }],
        blanks: [
          blk('q1b', 'tb', '$\\text{Where does the line cross the y-axis?}$', wrongNums(e.b, m), 'Look at the first orange dot, on the y-axis.'),
          blk('q2b', 'tm', `$\\dfrac{${n4(y2)} - ${par(e.b)}}{${n4(x2)} - 0} = \\square$`, [num(-m, false), num(1 / m, false), num(-1 / m, false), num(m + 1, false)].filter((s) => s !== num(m, false)), `Use the two orange dots: (0, ${e.b}) and (${x2}, ${y2}). Rise over run.`),
        ],
      },
      { label: 'The equation.', toks: [{ id: 'q3a', tex: ans }], blanks: [blk('q3a', 'q2b', '$y = m\\,x + b$', wrong, 'Put m in front of x and add b.')] },
    ],
  }
  return { w, fig: planeSvg(D({ m, c: e.b }), [[0, e.b], [x2, y2]]) }
}
export const T5 = (pq: [number, number][], bs: number[]): E5[] => pq.flatMap(([p, q]) => bs.map((b): E5 => ({ p, q, b }))).filter((e) => Math.abs(e.q) <= 6 && (Math.abs(e.b + e.p) <= 6 || Math.abs(e.b - e.p) <= 6))
const B5 = [-4, -3, -2, -1, 1, 2, 3, 4]
export const E5_ROWS: [string, E5, E5[]][] = [
  ['a', { p: 1, q: 1, b: 2 }, T5([[1, 1], [2, 1], [3, 1], [4, 1]], B5)],
  ['b', { p: -2, q: 1, b: 3 }, T5([[-1, 1], [-2, 1], [-3, 1], [-4, 1]], B5)],
  ['c', { p: 1, q: 2, b: -1 }, T5([[1, 2], [1, 3], [3, 2], [1, 4]], B5)],
  ['d', { p: -2, q: 3, b: 1 }, T5([[-2, 3], [-3, 4], [-3, 2], [-1, 3]], B5)],
  ['e', { p: 3, q: 2, b: -2 }, T5([[3, 2], [2, 3], [3, 4], [4, 3]], B5)],
  ['f', { p: -1, q: 3, b: 2 }, T5([[-1, 3], [-1, 4], [-2, 3], [-3, 4]], B5)],
]
export const e5id = (e: E5) => JSON.stringify(e)

// ================= exercise 6: word problems (8-11): write the equation =================
type E6 =
  | { f: 0; fixed: number; pct: number }
  | { f: 1; n: number }
  | { f: 2; t1: number; t2: number; r: number; fee: number }
  | { f: 3; sym: string; fz: number; bl: number }
function mk6(e: E6, key: string): It {
  const mkEq = (sym: string, v: string, m: number, b: number, dec: boolean) => `${sym} = ${lin(m, v, b, dec)}`
  const wrongs = (sym: string, v: string, m: number, b: number, dec: boolean) => uniq([mkEq(sym, v, b, m, dec), mkEq(sym, v, m, -b, dec), mkEq(sym, v, -m, b, dec), mkEq(sym, v, m, b + 1, dec), mkEq(sym, v, m + 1, b, dec)], (s) => s)
  const last = (id: string, from: string, ans: string, wr: string[], prompt: string, hint: string) => ({ label: 'The equation.', toks: [{ id, tex: ans }], blanks: [blk(id, from, prompt, wr, hint)] })
  if (e.f === 0) {
    const r = e.pct / 100
    const ans = mkEq('y', 'x', r, e.fixed, true)
    const wrong = wrongs('y', 'x', r, e.fixed, true).filter((s) => s !== ans)
    const w: Wp = {
      tex: text(`Tony earns a weekly salary of ${e.fixed} dollars plus ${e.pct} percent of his sales volume. Write a linear equation for his weekly earnings y, for x dollars in sales.`),
      short: '\\text{the story}',
      key,
      answer: ans,
      wrong,
      steps: [
        { label: 'The fixed part.', toks: [{ id: 'k1a', tex: '\\text{every week}' }, { id: 'k1b', tex: n4(e.fixed) }], blanks: [blk('k1b', 's0', '$\\text{How much is paid whatever the sales are?}$', [n4(e.pct), n4(r), n4(e.fixed * 10)], 'Read the story: the salary is paid every week.')] },
        { label: 'The rate.', toks: [{ id: 'k2a', tex: '\\text{for each dollar}' }, { id: 'k2b', tex: n4(r) }], blanks: [blk('k2b', 'k1b', `$${e.pct}\\% = \\dfrac{${e.pct}}{100} = \\square$`, [n4(e.pct), n4(r * 10), n4(r / 10)], 'Divide the percent by 100.')] },
        last('k3a', 'k2b', ans, wrong, '$y = \\text{rate}\\cdot x + \\text{fixed part}$', 'The rate goes with x, the fixed part is added.'),
      ],
    }
    return { w }
  }
  if (e.f === 1) {
    const ans = mkEq('y', 'x', -1, e.n + 1, false)
    const wrong = uniq([mkEq('y', 'x', 1, e.n + 1, false), mkEq('y', 'x', -1, e.n, false), mkEq('y', 'x', 1, -(e.n + 1), false), mkEq('y', 'x', -1, e.n - 1, false)], (s) => s).filter((s) => s !== ans)
    const w: Wp = {
      tex: text(`In a ${e.n} team volleyball tournament, the number 1 ranked team plays the number ${e.n} ranked team, and the number 2 ranked team plays the number ${e.n - 1} ranked team. If x is the ranking of the higher ranked team and y is the ranking of the lower ranked team, what is the linear equation that describes the match up?`),
      short: '\\text{the story}',
      key,
      answer: ans,
      wrong,
      steps: [
        { label: 'Add the two rankings.', toks: [{ id: 'k1a', tex: 'x + y' }, { id: 'k1g', tex: '=' }, { id: 'k1b', tex: n4(e.n + 1) }], blanks: [blk('k1b', 's0', `$1 + ${e.n} = \\square$`, [n4(e.n), n4(e.n - 1), n4(e.n + 2)], 'The first match is 1 against the last team. 2 against the next to last gives the same total.')] },
        last('k2a', 'k1b', ans, wrong, `$x + y = ${e.n + 1}\\text{: solve for } y$`, 'Subtract x from both sides.'),
      ],
    }
    return { w }
  }
  if (e.f === 2) {
    const c1 = +(e.r * e.t1 + e.fee).toFixed(4)
    const c2 = +(e.r * e.t2 + e.fee).toFixed(4)
    const ans = mkEq('y', 'x', e.r, e.fee, true)
    const wrong = wrongs('y', 'x', e.r, e.fee, true).filter((s) => s !== ans)
    const w: Wp = {
      tex: text(`On a certain evening a ${e.t1} minute telephone call costs ${n4(c1)} dollars. The next evening a ${e.t2} minute telephone call costs ${n4(c2)} dollars. If the cost y of an evening phone call is linear in the number of minutes x, find an equation for it.`),
      short: '\\text{the story}',
      key,
      answer: ans,
      wrong,
      steps: [
        { label: 'The slope.', toks: [{ id: 'k1a', tex: 'm' }, { id: 'k1g', tex: '=' }, { id: 'k1b', tex: n4(e.r) }], blanks: [blk('k1b', 's0', `$\\dfrac{${n4(c2)} - ${par(c1)}}{${e.t2} - ${e.t1}} = \\square$`, [n4(-e.r), n4(e.r * 10), n4(e.r / 10), n4(c1 / e.t2)], 'Cost change divided by minutes change.')] },
        { label: 'The fixed fee.', toks: [{ id: 'k2a', tex: 'b' }, { id: 'k2g', tex: '=' }, { id: 'k2b', tex: n4(e.fee) }], blanks: [blk('k2b', 'k1b', `$${n4(c1)} - ${n4(e.r)}\\cdot ${e.t1} = \\square$`, [n4(-e.fee), n4(e.fee + 1), n4(c1), n4(e.r * e.t1)], 'Put one point in y = m x + b and solve for b.')] },
        last('k3a', 'k2b', ans, wrong, '$y = m\\,x + b$', 'Put m in front of x and add b.'),
      ],
    }
    return { w }
  }
  const m = (e.bl - e.fz) / 100
  const ans = mkEq(e.sym, 'C', m, e.fz, false)
  const wrong = wrongs(e.sym, 'C', m, e.fz, false).filter((s) => s !== ans)
  const w: Wp = {
    tex: text(`Water freezes at 0 degrees C and boils at 100 degrees C. On the ${e.sym} scale water freezes at ${e.fz} degrees and boils at ${e.bl} degrees. Find a linear equation relating ${e.sym} to C.`),
    short: '\\text{the story}',
    key,
    answer: ans,
    wrong,
    steps: [
      { label: 'The number added.', toks: [{ id: 'k1a', tex: 'b' }, { id: 'k1g', tex: '=' }, { id: 'k1b', tex: n4(e.fz) }], blanks: [blk('k1b', 's0', `$\\text{What is } ${e.sym} \\text{ when } C = 0\\text{?}$`, [n4(e.bl), n4(-e.fz), n4(e.bl - e.fz)], 'Water freezes at 0 degrees C.')] },
      { label: 'The slope.', toks: [{ id: 'k2a', tex: 'm' }, { id: 'k2g', tex: '=' }, { id: 'k2b', tex: num(m, false) }], blanks: [blk('k2b', 'k1b', `$\\dfrac{${e.bl} - ${par(e.fz)}}{100 - 0} = \\square$`, [num(1 / m, false), num(-m, false), num(m + 1, false)].filter((s) => s !== num(m, false)), 'Change of the new scale divided by the change of C (100).')] },
      last('k3a', 'k2b', ans, wrong, `$${e.sym} = m\\,C + b$`, 'Put m in front of C and add b.'),
    ],
  }
  return { w }
}
const E6_ROWS: [string, E6, E6[]][] = [
  ['a', { f: 0, fixed: 750, pct: 10 }, [[500, 5], [600, 8], [400, 12], [800, 6], [350, 15], [700, 4], [450, 20], [900, 3], [300, 25], [550, 7]].map(([fixed, pct]): E6 => ({ f: 0, fixed, pct }))],
  ['b', { f: 1, n: 16 }, [8, 10, 12, 14, 18, 20, 24, 32, 6, 22].map((n): E6 => ({ f: 1, n }))],
  ['c', { f: 2, t1: 30, t2: 8, r: 0.05, fee: 0 }, [[20, 10, 0.05, 0.5], [15, 5, 0.04, 0], [40, 10, 0.06, 1], [25, 5, 0.08, 0], [12, 4, 0.1, 0.5], [30, 10, 0.25, 0], [20, 4, 0.05, 1], [18, 6, 0.04, 0.5], [35, 15, 0.06, 0], [24, 8, 0.05, 2]].map(([t1, t2, r, fee]): E6 => ({ f: 2, t1, t2, r, fee }))],
  ['d', { f: 3, sym: 'F', fz: 32, bl: 212 }, [['K', 273, 373], ['R', 0, 80], ['Z', 10, 60], ['Y', 20, 120], ['W', -10, 90], ['V', 5, 105], ['U', 0, 50], ['T', 30, 80], ['S', 40, 140], ['Q', -20, 80]].map(([sym, fz, bl]): E6 => ({ f: 3, sym: sym as string, fz: fz as number, bl: bl as number }))],
]
const e6id = (e: E6) => JSON.stringify(e)

export const EX_GRAPH44 = [
  build(1, 'Find the y-intercept.', E3_ROWS, mk3, e3id, 'The y-intercept', 3000, '4.4'),
  build(2, 'Find the slope.', E4_ROWS, mk4, e4id, 'The slope', 4000, '4.4'),
  build(3, 'Write the equation.', E5_ROWS, mk5, e5id, 'Equation of a line', 5000, '4.4'),
  build(4, 'Which graph?', E1_ROWS, mk1, e1id, 'Graph from the equation', 1000, '4.4'),
  build(5, 'Which equation?', E2_ROWS, mk2, e2id, 'Equation from the graph', 2000, '4.4'),
  build(6, 'Write the equation.', E6_ROWS, mk6, e6id, 'Word problems', 6000, '4.4'),
]
