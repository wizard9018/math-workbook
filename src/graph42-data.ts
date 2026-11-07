// Grade 9 4.2 (bank/G9-ch4/s2/items.json): graphing linear equations. Exercises 1, 2, 3 are left out; 10-13 (word problems) are merged into exercise 10 here.
//   4 which letter marks a point, 5 the coordinates of a point (both with a coordinate grid drawn here), 6 is the ordered pair a solution, 7 complete the table,
//   8 the y-intercept (the book also asks for the graph), 9 the equation of a line drawn on a grid, 10 word problems (a, b stereo = 10; c, d soft drinks = 11; e, f spa = 12; g, h temperature = 13)
// Every question is multiple choice. The lessons are blanks (lessons.ts `blanks`, built with lessonWp of ineq64-data.ts); the grid is also shown above the lesson.
// The 10 similar questions of every question are made here from small tables (same kind, other numbers); every answer and step is computed.
// Imported by: quiz.tsx, check42.ts. Shape: exercise.ts.
import type { Draw, Exercise, Fill, Multi, Practice, Question, Sort } from './exercise'
import { planeSvg } from './plane'
import type { Lesson } from './lessons'
import { pick } from './simplify-data'
import { lessonWp } from './ineq64-data'
import type { Wp } from './ineq64-data'
import { blk, lin, n4, num, par, plus, range, shuffled, text } from './seq41-data'

// ---- the coordinate grid: -6 to 6, points (with a letter), a line, marked points on the line ----
const U = 22
const M = 20
const R = 6
const gx = (v: number) => M + (v + R) * U
const gy = (v: number) => M + (R - v) * U
interface Pt {
  x: number
  y: number
  label?: string
}
function grid(o: { pts?: Pt[]; click?: boolean; line?: { m: number; b: number }; marks?: [number, number][] }): string {
  const lines = range(-R, R).map((v) => `<line x1="${gx(v)}" y1="${gy(-R)}" x2="${gx(v)}" y2="${gy(R)}" stroke="#e2e8f0"/><line x1="${gx(-R)}" y1="${gy(v)}" x2="${gx(R)}" y2="${gy(v)}" stroke="#e2e8f0"/>`).join('')
  const nums = range(-R, R).filter((v) => v !== 0).map((v) => `<text x="${gx(v)}" y="${gy(0) + 14}" text-anchor="middle" font-size="10" fill="#64748b">${v}</text><text x="${gx(0) - 6}" y="${gy(v) + 3}" text-anchor="end" font-size="10" fill="#64748b">${v}</text>`).join('')
  const axes = `<line x1="${gx(-R) - 6}" y1="${gy(0)}" x2="${gx(R) + 6}" y2="${gy(0)}" stroke="#334155" stroke-width="2"/><line x1="${gx(0)}" y1="${gy(-R) + 6}" x2="${gx(0)}" y2="${gy(R) - 6}" stroke="#334155" stroke-width="2"/><text x="${gx(R) + 8}" y="${gy(0) + 16}" font-size="13" font-style="italic" fill="#334155">x</text><text x="${gx(0) + 8}" y="${gy(R) - 8}" font-size="13" font-style="italic" fill="#334155">y</text>`
  let line = ''
  if (o.line) {
    const { m, b } = o.line
    let lo = -R
    let hi = R
    if (m > 0) {
      lo = Math.max(lo, (-R - b) / m)
      hi = Math.min(hi, (R - b) / m)
    } else if (m < 0) {
      lo = Math.max(lo, (R - b) / m)
      hi = Math.min(hi, (-R - b) / m)
    }
    line = `<line x1="${gx(lo)}" y1="${gy(m * lo + b)}" x2="${gx(hi)}" y2="${gy(m * hi + b)}" stroke="#0284c7" stroke-width="3"/>`
  }
  const marks = (o.marks ?? []).map(([x, y]) => `<circle cx="${gx(x)}" cy="${gy(y)}" r="5.5" fill="#f97316" stroke="#fff" stroke-width="1.5"/>`).join('')
  const pts = (o.pts ?? []).map((p, i) => {
    const dot = `<circle cx="${gx(p.x)}" cy="${gy(p.y)}" r="5.5" fill="#0284c7" stroke="#fff" stroke-width="1.5"/>${p.label ? `<text x="${gx(p.x) + 8}" y="${gy(p.y) - 7}" font-size="15" font-weight="bold" fill="#0f172a">${p.label}</text>` : ''}`
    // a click on a point (a wide invisible circle around it) answers the question: data-choice is the index of the choice
    return o.click ? `<g data-choice="${i}" style="cursor:pointer"><circle cx="${gx(p.x)}" cy="${gy(p.y)}" r="15" fill="#fff" fill-opacity="0.01"/>${dot}</g>` : dot
  }).join('')
  const size = 2 * R * U + 2 * M
  return `<svg viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:320px;height:auto;margin:0 auto;display:block">${lines}${nums}${axes}${line}${marks}${pts}</svg>`
}

// ---- shared pieces ----
export interface It {
  w: Wp
  fig?: string // the grid (above the question and above the lesson)
  fixed?: string[] // the choices in this order (letters); the grid's points are then the choices: a click on one answers
  showTex?: boolean // the question text is shown above the grid
  plain?: string[] // the choices in this order (Yes / No)
  draw?: Draw // the answer is a line drawn on this plane (the choices are then only [right, wrong])
  figAt?: (n: number) => string // the lesson picture after n finished steps
  fill?: Fill // the answer is typed into the boxes of a table (the choices are then only [right, wrong])
  sort?: Sort // the answer is the order of numbers dragged onto a number line (the choices are then only [right, wrong])
  multi?: Multi // the answer is the ticked options (the choices are then only [right, wrong])
}
export const ptTex = (x: number, y: number) => `(${n4(x)},\\ ${n4(y)})`
export const rng = (seed: number) => {
  let s = seed
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32)
}
export const inGrid = (x: number, y: number) => Math.abs(x) <= 5 && Math.abs(y) <= 5
export const uniq = <T,>(a: T[], key: (t: T) => string) => a.filter((t, i) => a.findIndex((u) => key(u) === key(t)) === i)
const SLOPES: [number, number][] = [[1, 1], [2, 1], [3, 1], [4, 1], [-1, 1], [-2, 1], [-3, 1], [5, 1], [1, 2], [2, 3], [3, 4], [1, 3], [3, 2], [4, 3], [-1, 2], [-2, 3], [-3, 4], [-1, 3], [-3, 2], [-4, 3], [5, 3], [-5, 3]]
export const slopesWhere = (f: (p: number, q: number) => boolean) => SLOPES.filter(([p, q]) => f(p, q))
export const slopeEq = (m: number, b: number) => `y = ${lin(m, 'x', b, false)}`
const nums = (xs: number[]) => xs.map((v) => num(v, false)).join(',\\ ')

// at least three wrong options for every question and blank: a number gets its neighbours when too few were made
const fill = (ans: string, wrongs: string[]) => {
  const ws = uniq(wrongs.filter((x) => x !== ans), (x) => x)
  const v = Number(ans)
  for (let k = 1; ws.length < 3 && Number.isFinite(v) && k < 9; k++) for (const d of [k, -k]) if (ws.length < 3 && !ws.includes(n4(v + d)) && n4(v + d) !== ans) ws.push(n4(v + d))
  return ws
}
const padded = (it: It): It => ({ ...it, w: { ...it.w, wrong: fill(it.w.answer, it.w.wrong), steps: it.w.steps.map((s) => ({ ...s, blanks: s.blanks.map((b) => ({ ...b, wrongs: fill(s.toks.find((t) => t.id === b.id)!.tex, b.wrongs) })) })) } })

export function build<T>(no: number, prompt: string, rows: [string, T, T[]][], mkRaw: (x: T, key: string) => It, id: (x: T) => string, title: string, seed: number, sec = '4.2', rank?: (x: T) => number): Exercise {
  const mk = (x: T, key: string) => padded(mkRaw(x, key))
  const questions: Question[] = rows.map(([part, bk, pool], idx): Question => {
    const seen = new Set([id(bk)])
    const all = shuffled(pool, seed + idx).filter((x) => !seen.has(id(x)) && !!seen.add(id(x)))
    // with `rank`: 10 items spread evenly from the easiest to the hardest (a stable sort keeps the shuffle among equals)
    const sorted = rank ? [...all].sort((a, b) => rank(a) - rank(b)) : all
    const n = Math.min(10, sorted.length)
    const bank = rank ? Array.from({ length: n }, (_, k) => sorted[Math.floor((k * sorted.length) / n)]) : sorted.slice(0, 10)
    const make = (x: T, k: string, j: number): Practice => {
      const key = `gr${sec.replace('.', '')}-${no}${k}`
      const it = mk(x, key)
      const [choices, correct] = it.draw || it.fill || it.sort || it.multi ? [[it.w.answer, it.w.wrong[0]], 0] : it.fixed || it.plain ? [(it.fixed || it.plain)!, (it.fixed || it.plain)!.indexOf(it.w.answer)] : pick(it.w.answer, it.w.wrong, idx + j)
      const lesson = (): Lesson => {
        const l = lessonWp(mk(x, key).w, `Grade 9, ${sec} exercise ${no}${k}`, title, idx + j)
        return it.fig ? { ...l, figure: it.fig.replace(/ style="cursor:pointer"/g, ''), figureAt: it.figAt } : l
      }
      return { figure: it.draw ? undefined : it.fig, draw: it.draw, fill: it.fill, sort: it.sort, multi: it.multi, onFigure: it.fixed ? true : undefined, showTex: it.showTex, tex: it.w.tex, choices, correct, why: '', lesson }
    }
    return { part, ...make(bk, part, 0), ladder: rank ? true : undefined, practice: bank.map((x, j) => make(x, `${part}${j + 1}`, j + 1)) }
  })
  return { no, sec, prompt, mathChoices: true, questions }
}

// ================= exercise 4: which letter marks the point (x, y) =================
interface P4 {
  x: number
  y: number
  s: number // where the four points are put
}
const move = (v: number, neg: string, pos: string) => (v === 0 ? '\\text{stay}' : `\\text{${v < 0 ? neg : pos} }${Math.abs(v)}`)
function mk4(p: P4, key: string): It {
  const { x, y } = p
  const cand = uniq([[x, y], [y, x], [-x, y], [x, -y], [-x, -y], [x + 1, y], [x, y + 1], [x - 1, y]].filter(([a, b]) => inGrid(a, b) && !(a === 0 && b === 0)), (c) => c.join(','))
  const four = shuffled(cand.slice(0, 4), p.s)
  const letters = ['P', 'Q', 'R', 'S']
  const pts = four.map(([a, b], i) => ({ x: a, y: b, label: letters[i] }))
  const at = four.findIndex(([a, b]) => a === x && b === y)
  const ans = letters[at]
  const fig = grid({ pts, click: true })
  const xs = x === 0 ? ['\\text{left } 1', '\\text{right } 1', '\\text{up } 1'] : [move(-x, 'left', 'right'), move(x, 'up', 'down'), move(-x, 'up', 'down')]
  const ys = y === 0 ? ['\\text{left } 1', '\\text{right } 1', '\\text{up } 1'] : [move(-y, 'down', 'up'), move(y, 'left', 'right'), move(-y, 'left', 'right')]
  const w: Wp = {
    tex: `${text('Click the point ')}${ptTex(x, y)}${text('.')}`,
    short: ptTex(x, y),
    key,
    answer: ans,
    wrong: letters.filter((l) => l !== ans),
    steps: [
      { label: 'Move along the x-axis.', toks: [{ id: 'h1a', tex: '\\text{first:}' }, { id: 'h1b', tex: move(x, 'left', 'right') }], blanks: [blk('h1b', 's0', `$x = ${x}$`, xs, 'Start at 0. A positive x goes right, a negative x goes left.')] },
      { label: 'Move along the y-axis.', toks: [{ id: 'h2a', tex: '\\text{then:}' }, { id: 'h2b', tex: move(y, 'down', 'up') }], blanks: [blk('h2b', 'h1b', `$y = ${y}$`, ys, 'A positive y goes up, a negative y goes down.')] },
      { label: 'The letter.', toks: [{ id: 'h3a', tex: '\\text{the point is}' }, { id: 'h3b', tex: ans }], blanks: [blk('h3b', 'h2b', '$\\text{Which letter is there?}$', letters.filter((l) => l !== ans), 'Find the dot on the grid.')] },
    ],
  }
  return { w, fig, fixed: letters }
}
const P4_BASE: [string, P4][] = [['a', { x: -3, y: 1, s: 1 }], ['b', { x: -4, y: -2, s: 2 }], ['c', { x: -5, y: 0, s: 3 }], ['d', { x: 0, y: 2, s: 4 }], ['e', { x: 3, y: -5, s: 5 }], ['f', { x: 4, y: 3, s: 6 }], ['g', { x: 4, y: 0, s: 7 }], ['h', { x: 0, y: -4, s: 8 }]]
const pool4 = (kind: 'a' | 'x' | 'y', seed: number): P4[] => {
  const r = rng(seed)
  const pick1 = () => Math.floor(r() * 11) - 5
  const out: P4[] = []
  while (out.length < 14) {
    let x = pick1()
    let y = pick1()
    if (kind === 'x') y = 0
    if (kind === 'y') x = 0
    if (kind === 'a' && (x === 0 || y === 0)) continue
    if (x === 0 && y === 0) continue
    out.push({ x, y, s: Math.floor(r() * 1000) })
  }
  return out
}
const E4: [string, P4, P4[]][] = P4_BASE.map(([part, b], i) => [part, b, pool4(b.x === 0 ? 'y' : b.y === 0 ? 'x' : 'a', 400 + i)])

// ================= exercise 5: the coordinates of the one point on the grid =================
interface P5 {
  x: number
  y: number
}
function mk5(p: P5, key: string): It {
  const { x, y } = p
  const fig = grid({ pts: [{ x, y }] })
  const ans = ptTex(x, y)
  const wrong = uniq([[y, x], [-x, y], [x, -y], [-x, -y], [x + 1, y], [x, y + 1]].map(([a, b]) => ptTex(a, b)), (s) => s).filter((s) => s !== ans)
  const w: Wp = {
    tex: text('What are the coordinates of the point?'),
    short: '\\text{the point}',
    key,
    answer: ans,
    wrong,
    steps: [
      { label: 'Read x.', toks: [{ id: 'r1a', tex: 'x' }, { id: 'r1g', tex: '=' }, { id: 'r1b', tex: n4(x) }], blanks: [blk('r1b', 's0', '$\\text{How far right (+) or left (−) of the y-axis?}$', [n4(-x), n4(y), n4(-y), n4(x + 1)].filter((s) => s !== n4(x)), 'Count the steps along the x-axis from 0. Right is positive, left is negative.')] },
      { label: 'Read y.', toks: [{ id: 'r2a', tex: 'y' }, { id: 'r2g', tex: '=' }, { id: 'r2b', tex: n4(y) }], blanks: [blk('r2b', 'r1b', '$\\text{How far up (+) or down (−) from the x-axis?}$', [n4(-y), n4(x), n4(-x), n4(y + 1)].filter((s) => s !== n4(y)), 'Count the steps up or down. Up is positive, down is negative.')] },
      { label: 'The point.', toks: [{ id: 'r3a', tex: '\\text{point}' }, { id: 'r3g', tex: '=' }, { id: 'r3b', tex: ans }], blanks: [blk('r3b', 'r2b', '$(x,\\ y)$', wrong, 'Write x first, then y.')] },
    ],
  }
  return { w, fig, showTex: true }
}
// every part has its own kind of point: one in each quadrant, then on an axis
const pool5 = (quadrant: 1 | 2 | 3 | 4 | 0): P5[] => {
  const all = range(-5, 5).flatMap((x) => range(-5, 5).map((y): P5 => ({ x, y }))).filter(({ x, y }) => (x !== 0 || y !== 0) && (quadrant === 0 ? x === 0 || y === 0 : quadrant === 1 ? x > 0 && y > 0 : quadrant === 2 ? x < 0 && y > 0 : quadrant === 3 ? x < 0 && y < 0 : x > 0 && y < 0))
  return shuffled(all, 500 + quadrant).slice(0, 14)
}
const E5: [string, P5, P5[]][] = [
  ['a', { x: 2, y: 5 }, pool5(1)],
  ['b', { x: -4, y: 3 }, pool5(2)],
  ['c', { x: -5, y: -2 }, pool5(3)],
  ['d', { x: 5, y: -4 }, pool5(4)],
  ['e', { x: 0, y: 3 }, pool5(0)],
  ['f', { x: -4, y: 0 }, pool5(0)],
]

// ================= exercise 6: is the ordered pair a solution =================
type E6 = { k: 'sl'; p: number; q: number; b: number; x: number; y: number } | { k: 'st'; a: number; b: number; c: number; x: number; y: number }
const stTex = (a: number, b: number, c: number) => `${a === 1 ? '' : a}x ${b < 0 ? '-' : '+'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}y = ${c}`
function mk6(e: E6, key: string): It {
  const isSl = e.k === 'sl'
  const m = e.k === 'sl' ? e.p / e.q : 0
  const v = e.k === 'sl' ? m * e.x + e.b : e.a * e.x + e.b * e.y
  const target = e.k === 'sl' ? e.y : e.c
  const eqTex = e.k === 'sl' ? slopeEq(m, e.b) : stTex(e.a, e.b, e.c)
  const cand = e.k === 'sl' ? [-m * e.x + e.b, m * e.x - e.b, v + 1, v - 1, v + m, e.x + e.b, v + 2, v - 2] : [e.a * e.x - e.b * e.y, v + e.a, v - e.a, v + e.b, v - e.b, e.a * e.y + e.b * e.x, v + 1, v - 1, v + 2, v - 2, v + 3, v - 3]
  const yes = Math.abs(v - target) < 1e-9
  const right = yes ? '\\text{Yes}' : '\\text{No}'
  const wrong = [yes ? '\\text{No}' : '\\text{Yes}']
  const wrongV = uniq(cand.filter((c) => Math.abs(c - v) > 1e-9 && Math.abs(c - target) > 1e-9), (c) => num(c, false))
  const expr = e.k === 'sl' ? `${num(m, false)}\\cdot ${par(e.x)} ${plus(e.b)}` : `${e.a}\\cdot ${par(e.x)} ${e.b < 0 ? '-' : '+'} ${Math.abs(e.b)}\\cdot ${par(e.y)}`
  const w: Wp = {
    tex: `${text('Is the ordered pair ')}${ptTex(e.x, e.y)}${text(' a solution of ')}${eqTex}${text('?')}`,
    short: `${ptTex(e.x, e.y)},\\ ${eqTex}`,
    key,
    answer: right,
    wrong,
    steps: [
      { label: 'Which number goes where?', toks: [{ id: 'p0a', tex: 'x =' }, { id: 'p0x', tex: n4(e.x) }, { id: 'p0b', tex: ',\\ y =' }, { id: 'p0y', tex: n4(e.y) }], blanks: [blk('p0x', 's0', '$\\text{Which number is } x\\text{?}$', [n4(e.y), n4(-e.x), n4(-e.y)], 'In (x, y) the first number is x.'), blk('p0y', 's0', '$\\text{Which number is } y\\text{?}$', [n4(e.x), n4(-e.y), n4(-e.x)], 'In (x, y) the second number is y.')] },
      { label: isSl ? 'The right side.' : 'The left side.', toks: [{ id: 'p1a', tex: isSl ? '\\text{right side}' : '\\text{left side}' }, { id: 'p1g', tex: '=' }, { id: 'p1b', tex: num(v, false) }], blanks: [blk('p1b', 'p0x', `$${expr} = \\square$`, wrongV.map((c) => num(c, false)), isSl ? `Put x = ${e.x} in the right side and calculate.` : `Put x = ${e.x} and y = ${e.y} in the left side and calculate.`)] },
      { label: 'Compare.', toks: [{ id: 'p2a', tex: '\\text{solution?}' }, { id: 'p2b', tex: right }], blanks: [blk('p2b', 'p1b', `$\\text{Is } ${num(v, false)} = ${isSl ? num(e.y, false) : num(e.c, false)}\\text{?}$`, wrong, 'If the two numbers are equal, the ordered pair is a solution.')] },
    ],
  }
  return { w, plain: ['\\text{Yes}', '\\text{No}'] }
}
const e6id = (e: E6) => JSON.stringify(e)
const sl6 = (pq: [number, number][], bs: number[], xm: number[], d: number[]): E6[] =>
  pq.flatMap(([p, q]) => bs.flatMap((b) => xm.flatMap((k) => d.map((dy): E6 => ({ k: 'sl', p, q, b, x: k * q, y: (p / q) * (k * q) + b + dy })))))
const st6 = (as: number[], bs: number[], cs: number[], pts: [number, number][]): E6[] =>
  as.flatMap((a) => bs.flatMap((b) => cs.flatMap((c) => pts.map(([x, y]): E6 => ({ k: 'st', a, b, c, x, y })))))
const E6_ROWS: [string, E6, E6[]][] = [
  ['a', { k: 'sl', p: 3, q: 1, b: 1, x: 2, y: 7 }, sl6(slopesWhere((p, q) => p > 0 && q === 1), [-3, -2, -1, 1, 2, 4], [-3, -2, -1, 1, 2, 3], [0, 0, 1, -2])],
  ['b', { k: 'sl', p: -2, q: 1, b: 3, x: -2, y: -1 }, sl6(slopesWhere((p, q) => p < 0 && q === 1), [-4, -2, 1, 2, 3, 5], [-3, -2, -1, 1, 2, 3], [0, 1, -1, 3])],
  ['c', { k: 'sl', p: 2, q: 3, b: 1, x: 6, y: 5 }, sl6(slopesWhere((p, q) => p > 0 && q > 1), [-3, -1, 1, 2, 3], [-2, -1, 1, 2], [0, 0, 1, -2])],
  ['d', { k: 'sl', p: -3, q: 4, b: -5, x: -8, y: 1 }, sl6(slopesWhere((p, q) => p < 0 && q > 1), [-5, -3, -1, 2, 4], [-2, -1, 1, 2], [0, 1, -1, 2])],
  ['e', { k: 'st', a: 2, b: -3, c: 6, x: 3, y: 0 }, st6([1, 2, 3, 4, 5], [-1, -2, -3, -4], [6, 8, 12, 4, -6], [[3, 0], [0, -2], [2, 1], [4, 2], [-2, 3], [6, 2], [2, -2], [3, 1]])],
  ['f', { k: 'st', a: 2, b: 3, c: 6, x: 3, y: 0 }, st6([1, 2, 3, 4, 5], [1, 2, 3, 4], [6, 12, 10, 8, -4], [[3, 0], [0, 2], [2, 1], [1, 2], [-2, 4], [3, 1], [4, -1], [0, 3]])],
]

// ================= exercise 7: complete the table =================
export interface E7 {
  p: number
  q: number // the slope p / q
  b: number
  cols: ['x' | 'y', number][] // which value is given in each of the three columns
  flat?: boolean // y = b for every x
}
export function mk7(e: E7, key: string): It {
  const m = e.p / e.q
  const eq = e.flat ? `y = ${e.b}` : slopeEq(m, e.b)
  const miss = e.cols.map(([g, v]) => (g === 'x' ? (e.flat ? e.b : m * v + e.b) : (v - e.b) / m))
  const lists = (f: (i: number, v: number) => number) => nums(miss.map((v, i) => f(i, v)))
  const ans = nums(miss)
  const wrong = uniq([lists((i, v) => (i === 0 ? v + 1 : v)), lists((i, v) => (i === 1 ? -v : v)), lists((i, v) => (i === 2 ? v + 1 : v)), lists((_, v) => -v), lists((i, v) => (i === 1 ? v + 1 : v))], (s) => s).filter((s) => s !== ans)
  // the table is typed into: a box where a value is missing (the numbers go in left to right)
  const fill: Fill = { rows: [{ label: 'x', cells: e.cols.map(([g, v]) => (g === 'x' ? num(v, false) : null)) }, { label: 'y', cells: e.cols.map(([g, v]) => (g === 'y' ? num(v, false) : null)) }], answers: miss }
  const tex = `${text('Complete the table for ')}${eq}${text('.')}`
  const steps = e.cols.map(([g, v], i) => {
    const r = miss[i]
    const pr = g === 'x' ? `$${e.flat ? `y = ${e.b}` : `y = ${num(m, false)}\\cdot ${par(v)} ${plus(e.b)} = \\square`}$` : `$${num(v, false)} = ${lin(m, 'x', e.b, false)},\\ \\text{so } x = \\square$`
    const ws = [num(-r, false), num(r + 1, false), num(r - 1, false), num(r + 2, false)]
    return {
      label: g === 'x' ? `x = ${num(v, false)}` : `y = ${num(v, false)}`,
      toks: [{ id: `t${i}a`, tex: g === 'x' ? 'y' : 'x' }, { id: `t${i}g`, tex: '=' }, { id: `t${i}b`, tex: num(r, false) }],
      blanks: [blk(`t${i}b`, 's0', pr, uniq(ws, (s) => s).filter((s) => s !== num(r, false)), g === 'x' ? `Put x = ${num(v, false)} in the equation.` : 'Put the y-value in the equation and solve for x.')],
    }
  })
  return { w: { tex, short: eq, key, answer: ans, wrong, steps }, fill }
}
export const T7 = (pq: [number, number][], bs: number[], cols: ['x' | 'y', number][][]): E7[] => pq.flatMap(([p, q]) => bs.flatMap((b) => cols.map((c): E7 => ({ p, q, b, cols: c.map(([g, v]): ['x' | 'y', number] => [g, g === 'x' ? v * q : v]) }))))
const E7_ROWS: [string, E7, E7[]][] = [
  ['a', { p: -3, q: 4, b: 2, cols: [['x', 0], ['y', 0], ['x', 4]] }, T7(slopesWhere((p, q) => p < 0 && q > 1), [-3, -2, 1, 2, 4], [[['x', 0], ['y', 0], ['x', 1]], [['x', 0], ['y', 0], ['x', 2]], [['x', 0], ['y', 0], ['x', -1]]])],
  ['b', { p: 3, q: 1, b: -6, cols: [['x', 0], ['y', 0], ['y', 6]] }, T7(slopesWhere((p, q) => p > 0 && q === 1), [-6, -4, -3, -2, 2, 3], [[['x', 0], ['y', 0], ['y', 6]], [['x', 0], ['y', 0], ['y', 3]], [['x', 0], ['y', 0], ['y', -3]]])],
  ['c', { p: -3, q: 4, b: -3, cols: [['x', 0], ['y', 0], ['x', -4]] }, T7(slopesWhere((p, q) => p < 0 && q > 1), [-4, -3, -1, 1, 3], [[['x', 0], ['y', 0], ['x', -1]], [['x', 0], ['y', 0], ['x', -2]], [['x', 0], ['y', 0], ['x', 3]]])],
  ['d', { p: 2, q: 3, b: -4, cols: [['x', 0], ['y', 0], ['y', 2]] }, T7(slopesWhere((p, q) => p > 0 && q > 1), [-4, -2, -1, 1, 3], [[['x', 0], ['y', 0], ['y', 2]], [['x', 0], ['y', 0], ['y', 4]], [['x', 0], ['y', 0], ['y', -2]]])],
  ['e', { p: -2, q: 1, b: 0, cols: [['x', 0], ['y', 0], ['x', -3]] }, T7([[-2, 1], [-3, 1], [2, 1], [3, 1], [-1, 1], [4, 1], [5, 1], [-4, 1]], [0], [[['x', 0], ['y', 0], ['x', -3]], [['x', 0], ['y', 0], ['x', 2]], [['x', 0], ['y', 0], ['x', -2]], [['x', 0], ['y', 0], ['x', 5]]])],
  ['f', { p: 0, q: 1, b: -2, flat: true, cols: [['x', -3], ['x', 0], ['x', 4]] }, [-5, -4, -3, -1, 1, 2, 3, 4, 5, 6].flatMap((b) => [[-3, 0, 4], [-2, 1, 5], [-4, 2, 3], [-1, 0, 2]].map((xs): E7 => ({ p: 0, q: 1, b, flat: true, cols: xs.map((x): ['x', number] => ['x', x]) })))],
]
export const e7id = (e: E7) => JSON.stringify(e)

// ================= exercise 8: the y-intercept =================
type E8 = { k: 'sl'; p: number; q: number; b: number } | { k: 'fa'; m: number; h: number }
function mk8(e: E8, key: string): It {
  const b = e.k === 'sl' ? e.b : -e.m * e.h
  const eq = e.k === 'sl' ? slopeEq(e.p / e.q, e.b) : `y = ${e.m}(x ${e.h < 0 ? '+' : '-'} ${Math.abs(e.h)})`
  const expr = e.k === 'sl' ? `${num(e.p / e.q, false)}\\cdot 0 ${plus(e.b)}` : `${e.m}(0 ${e.h < 0 ? '+' : '-'} ${Math.abs(e.h)})`
  const pre = e.k === 'sl' ? (e.p === e.q ? '' : `${num(e.p / e.q, false)}\\cdot`) : `${e.m}(`
  const post = e.k === 'sl' ? plus(e.b) : `${e.h < 0 ? '+' : '-'} ${Math.abs(e.h)})`
  const ans = ptTex(0, b)
  const wrong = uniq([[b, 0], [0, -b], [-b, 0], [0, e.k === 'sl' ? e.p / e.q : e.m], [0, b + 1]].map(([x, y]) => ptTex(x, y)), (s) => s).filter((s) => s !== ans)
  const w: Wp = {
    tex: `${text('What is the y-intercept of ')}${eq}${text('?')}`,
    short: eq,
    key,
    answer: ans,
    wrong,
    steps: [
      { label: 'How do we find the y-intercept?', toks: [{ id: 'i0a', tex: '\\text{set}' }, { id: 'i0b', tex: 'x = 0' }], blanks: [blk('i0b', 's0', '$\\text{The graph crosses the y-axis. What is true there?}$', ['y = 0', 'x = 1', 'x = y'], 'On the y-axis the x-value is 0.')] },
      { label: 'Put x = 0.', toks: [{ id: 'i1a', tex: 'y' }, { id: 'i1g', tex: '=' }, ...(pre ? [{ id: 'i1p', tex: pre }] : []), { id: 'i1x', tex: '0' }, { id: 'i1r', tex: post }], blanks: [blk('i1x', 'i0b', '$\\text{What goes in the place of } x\\text{?}$', [n4(Math.abs(b)), n4(-b), '1', n4(e.k === 'sl' ? e.p : e.m), n4(e.k === 'sl' ? e.q : e.h)].filter((s) => s !== '0'), 'The y-intercept is where x = 0.')] },
      { label: 'Calculate.', toks: [{ id: 'i2a', tex: 'y' }, { id: 'i2g', tex: '=' }, { id: 'i2b', tex: num(b, false) }], blanks: [blk('i2b', 'i1x', `$${expr} = \\square$`, [num(-b, false), num(b + 1, false), num(b - 1, false), e.k === 'sl' ? num(e.p / e.q, false) : String(e.h)].filter((s) => s !== num(b, false)), 'Multiply first, then add or subtract.')] },
      { label: 'The point.', toks: [{ id: 'i3a', tex: '\\text{y-intercept}' }, { id: 'i3g', tex: '=' }, { id: 'i3b', tex: ans }], blanks: [blk('i3b', 'i2b', '$(x,\\ y)\\ \\text{with } x = 0$', wrong, 'The x-value is 0 and the y-value is what you found.')] },
    ],
  }
  return { w }
}
const sl8 = (pq: [number, number][], bs: number[]): E8[] => pq.flatMap(([p, q]) => bs.map((b): E8 => ({ k: 'sl', p, q, b })))
const BS = [-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]
const E8_ROWS: [string, E8, E8[]][] = [
  ['a', { k: 'sl', p: 1, q: 1, b: 1 }, sl8([[1, 1]], BS)],
  ['b', { k: 'sl', p: 3, q: 1, b: -2 }, sl8([[2, 1], [3, 1], [4, 1], [5, 1]], BS)],
  ['c', { k: 'sl', p: -2, q: 1, b: 1 }, sl8([[-1, 1], [-2, 1], [-3, 1], [-4, 1]], BS)],
  ['d', { k: 'sl', p: -5, q: 3, b: 2 }, sl8([[-5, 3], [-4, 3], [-3, 2], [-2, 3], [-3, 4]], BS)],
  ['e', { k: 'sl', p: 1, q: 3, b: 2 }, sl8([[1, 3], [1, 4], [2, 5], [1, 5]], BS)],
  ['f', { k: 'sl', p: 1, q: 2, b: -1 }, sl8([[1, 2], [3, 2], [1, 4], [3, 4]], BS)],
  ['g', { k: 'sl', p: 2, q: 3, b: 1 }, sl8([[2, 3], [3, 4], [3, 5], [4, 3]], BS)],
  ['h', { k: 'fa', m: -2, h: 4 }, [-3, -2, -1, 2, 3, 4, 5].flatMap((m) => [-7, -6, -5, -4, -3, -2, -1, 1, 2, 3, 5, 6].map((h): E8 => ({ k: 'fa', m, h })))],
]
const e8id = (e: E8) => JSON.stringify(e)

// ================= exercise 9: the equation of the line on the grid =================
interface E9 {
  p: number
  q: number
  b: number
}
function mk9(e: E9, key: string): It {
  const m = e.p / e.q
  const [x2, y2] = inGrid(e.q, e.b + e.p) ? [e.q, e.b + e.p] : [-e.q, e.b - e.p]
  const fig = grid({ line: { m, b: e.b }, marks: [[0, e.b], [x2, y2]] })
  const ans = slopeEq(m, e.b)
  const wrong = uniq([slopeEq(-m, e.b), slopeEq(m, -e.b), slopeEq(1 / m, e.b), `y = ${lin(e.b, 'x', m, false)}`, slopeEq(m, e.b + 1)], (s) => s).filter((s) => s !== ans)
  const w: Wp = {
    tex: text('Write an equation for the line.'),
    short: 'y = m\\,x + b',
    key,
    answer: ans,
    wrong,
    steps: [
      { label: 'The y-intercept.', toks: [{ id: 'g1a', tex: 'b' }, { id: 'g1g', tex: '=' }, { id: 'g1b', tex: n4(e.b) }], blanks: [blk('g1b', 's0', '$\\text{Where does the line cross the y-axis?}$', [n4(-e.b), num(m, false), n4(e.b + 1), num(-m, false)].filter((s) => s !== n4(e.b)), 'Look at the orange dot on the y-axis.')] },
      { label: 'The slope.', toks: [{ id: 'g2a', tex: 'm' }, { id: 'g2g', tex: '=' }, { id: 'g2b', tex: num(m, false) }], blanks: [blk('g2b', 's0', `$\\dfrac{${n4(y2)} - ${par(e.b)}}{${n4(x2)} - 0} = \\square$`, [num(-m, false), num(1 / m, false), num(-1 / m, false), num(m + 1, false)].filter((s) => s !== num(m, false)), `Use the two orange dots: (0, ${e.b}) and (${x2}, ${y2}). Rise over run.`)] },
      { label: 'The equation.', toks: [{ id: 'g3a', tex: ans }], blanks: [blk('g3a', 'g2b', '$y = m\\,x + b$', wrong, 'Put m in front of x and add b.')] },
    ],
  }
  return { w, fig }
}
const T9 = (pq: [number, number][], bs: number[]): E9[] => pq.flatMap(([p, q]) => bs.map((b): E9 => ({ p, q, b }))).filter((e) => inGrid(e.q, e.b + e.p) || inGrid(-e.q, e.b - e.p))
const B9 = [-4, -3, -2, -1, 1, 2, 3, 4]
const E9_ROWS: [string, E9, E9[]][] = [
  ['a', { p: 1, q: 1, b: 2 }, T9([[1, 1], [2, 1], [3, 1], [4, 1]], B9)],
  ['b', { p: -1, q: 1, b: 3 }, T9([[-1, 1], [-2, 1], [-3, 1], [-4, 1]], B9)],
  ['c', { p: 2, q: 1, b: -2 }, T9([[2, 1], [3, 1], [1, 1], [4, 1]], B9)],
  ['d', { p: 1, q: 2, b: 1 }, T9([[1, 2], [1, 3], [1, 4], [3, 2]], B9)],
  ['e', { p: -1, q: 2, b: -1 }, T9([[-1, 2], [-1, 3], [-3, 2], [-1, 4]], B9)],
  ['f', { p: 2, q: 3, b: -2 }, T9([[2, 3], [3, 4], [2, 5], [4, 3]], B9)],
  ['g', { p: -3, q: 2, b: 3 }, T9([[-3, 2], [-2, 3], [-3, 4], [-4, 3]], B9)],
  ['h', { p: -2, q: 3, b: 1 }, T9([[-2, 3], [-3, 4], [-4, 3], [-2, 5]], B9)],
]
const e9id = (e: E9) => JSON.stringify(e)

// ================= exercise 10: word problems (10-13) =================
interface E10 {
  f: 0 | 1 | 2 | 3
  r: number
  c: number
  xs: number[] // the values asked (for the temperature: the clock hour, pm)
  single: boolean // the "graph, then estimate" part: one value
}
const FAM = [
  { sym: 'V', v: 't', unit: ' years', story: (eq: string) => `The value (V) in dollars of a stereo is given by the equation ${eq}, where t is the number of years since it was bought.`, list: 'Find the value of the stereo after', one: 'Estimate the value of the stereo after', means: ['the value of the stereo', 'the years since it was bought', 'the loss in value each year', 'the value when it was bought'] },
  { sym: 'N', v: 't', unit: '', story: (eq: string) => `The number of liters (N) of soft drinks drunk each year by the average teenager is about ${eq}, where t is the age.`, list: 'Find the number of liters at age', one: 'Estimate the number of liters for a teenager at age', means: ['the liters of soft drinks each year', 'the age', 'the liters more each year of age', 'the liters at age 0'] },
  { sym: 'T', v: 'h', unit: ' hours', story: (eq: string) => `The cost (T) in dollars of dues and fees at a health spa is ${eq}, where h is the number of hours spent with a personal trainer.`, list: 'Find the cost for', one: 'Estimate the cost for', means: ['the cost in dollars', 'the hours with the trainer', 'the cost of one hour', 'the fixed fee'] },
  { sym: 'T', v: 'h', unit: '', story: (eq: string) => `The temperature (T) in degrees Celsius on one day could be approximated by ${eq}, where h is the number of hours since 5:00 pm.`, list: 'Find the temperature at', one: 'Estimate the temperature at', means: ['the temperature in degrees Celsius', 'the hours since 5:00 pm', 'the change in temperature each hour', 'the temperature at 5:00 pm'] },
]
const clock = (x: number) => `${x}:00 pm`
function mk10(e: E10, key: string): It {
  const F = FAM[e.f]
  const hs = e.xs.map((x) => (e.f === 3 ? x - 5 : x))
  const eq = `${F.sym} = ${lin(e.r, F.v, e.c)}`
  const vals = hs.map((h) => e.r * h + e.c)
  const L = (f: (h: number, x: number) => number) => e.xs.map((x, i) => n4(f(hs[i], x))).join(',\\ ')
  const ans = L((h) => e.r * h + e.c)
  const wrong = uniq([L((h) => e.c - e.r * h), L((h) => e.r * h), L((h) => e.r * h - e.c), L((h) => e.r * h + e.c + e.r), L((_, x) => e.r * x + e.c), L((h) => e.c + e.r * h - 1)], (s) => s).filter((s) => s !== ans)
  const when = e.f === 3 ? e.xs.map(clock) : e.xs.map((x) => `${x}`)
  const join = (a: string[]) => (a.length === 1 ? a[0] : `${a.slice(0, -1).join(', ')} and ${a[a.length - 1]}`)
  const unit = e.f === 0 || e.f === 2 ? F.unit : ''
  const ask = e.single ? `${F.one} ${when[0]}${unit}.` : `${F.list} ${join(when)}${unit}.`
  // first what the letters stand for, then for every asked value: which number is t (or h), then the calculation
  const M = F.means
  const meaning = (id: string, from: string, letter: string, right: string, others: string[], label: string) => ({
    label,
    toks: [{ id: `${id}a`, tex: letter }, { id: `${id}g`, tex: '=' }, { id: `${id}b`, tex: `\\text{${right}}` }],
    blanks: [blk(`${id}b`, from, `$\\text{What does } ${letter} \\text{ stand for?}$`, others.map((o) => `\\text{${o}}`), 'Read the story: the letter is written in brackets or after "where".')],
  })
  const steps = [
    meaning('m1', 'sV', F.sym, M[0], [M[1], M[2], M[3]], `What is ${F.sym}?`),
    meaning('m2', 'st', F.v, M[1], [M[0], M[2], M[3]], `What is ${F.v}?`),
    ...e.xs.flatMap((x, i) => {
      const h = hs[i]
      const v = vals[i]
      const prev = i === 0 ? 'st' : `w${i - 1}b`
      return [
        {
          label: e.f === 3 ? `${clock(x)}` : `${F.v} for ${n4(x)}`,
          toks: [{ id: `u${i}a`, tex: F.v }, { id: `u${i}g`, tex: '=' }, { id: `u${i}b`, tex: n4(h) }],
          blanks: [blk(`u${i}b`, prev, e.f === 3 ? `$\\text{At } ${clock(x)}\\text{, what is } h\\text{?}$` : `$\\text{Which number is } ${F.v}\\text{?}$`, e.f === 3 ? [n4(x), n4(-h), n4(h + 1), n4(h - 1)] : [n4(x + 1), n4(x - 1), n4(-x), n4(x * 2)], e.f === 3 ? `${clock(x)} is ${Math.abs(h)} hours ${h < 0 ? 'before' : 'after'} 5:00 pm, so h = ${h}.` : `The question asks for ${F.v} = ${n4(x)}.`)],
        },
        {
          label: `Calculate ${F.sym}.`,
          toks: [{ id: `w${i}a`, tex: F.sym }, { id: `w${i}g`, tex: '=' }, { id: `w${i}b`, tex: n4(v) }],
          blanks: [blk(`w${i}b`, `u${i}b`, `$${F.sym} = ${n4(e.r)}\\cdot ${par(h)} ${plus(e.c)} = \\square$`, [n4(v + Math.abs(e.r)), n4(v - Math.abs(e.r)), n4(e.c - e.r * h), n4(e.r * h), n4(v + 1)].filter((s) => s !== n4(v)), `Write ${F.v} = ${n4(h)} in the equation.`)],
        },
      ]
    }),
  ]
  // the equation is cut into tokens so that the arrows of the first two questions leave from the letter they ask about
  const startToks = [{ id: 'sV', tex: F.sym }, { id: 'se', tex: '=' }, { id: 'sr', tex: n4(e.r) }, { id: 'st', tex: F.v }, { id: 'sc', tex: plus(e.c) }]
  return { w: { tex: text(`${F.story(eq)} ${ask}`), short: eq, key, answer: ans, wrong, steps, startToks } }
}
const r10 = (e: E10) => JSON.stringify(e)
const P10 = (f: 0 | 1 | 2 | 3, rs: number[], cs: number[], xl: number[][], single: boolean): E10[] => rs.flatMap((r) => cs.flatMap((c) => xl.map((xs): E10 => ({ f, r, c, xs, single }))))
const E10_ROWS: [string, E10, E10[]][] = [
  ['a', { f: 0, r: -100, c: 600, xs: [0, 2, 4], single: false }, P10(0, [-100, -150, -200, -80, -120, -250], [600, 900, 1200, 800, 1500, 1000], [[0, 2, 4], [0, 1, 3], [1, 3, 5], [2, 4, 6]], false)],
  ['b', { f: 0, r: -100, c: 600, xs: [3.5], single: true }, P10(0, [-100, -150, -200, -80, -120, -250], [600, 900, 1200, 800, 1500, 1000], [[3.5], [2.5], [4.5], [1.5]], true)],
  ['c', { f: 1, r: 0.4, c: 20, xs: [13, 14, 15], single: false }, P10(1, [0.4, 0.3, 0.5, 0.6, 0.2], [20, 25, 15, 18, 22], [[13, 14, 15], [12, 13, 14], [14, 15, 16], [15, 16, 17]], false)],
  ['d', { f: 1, r: 0.4, c: 20, xs: [19], single: true }, P10(1, [0.4, 0.3, 0.5, 0.6, 0.2], [20, 25, 15, 18, 22], [[19], [18], [20], [17]], true)],
  ['e', { f: 2, r: 80, c: 100, xs: [2, 4, 8], single: false }, P10(2, [80, 60, 90, 70, 50], [100, 150, 120, 200, 90], [[2, 4, 8], [1, 3, 5], [2, 5, 10], [3, 6, 9]], false)],
  ['f', { f: 2, r: 80, c: 100, xs: [6], single: true }, P10(2, [80, 60, 90, 70, 50], [100, 150, 120, 200, 90], [[6], [7], [10], [12]], true)],
  ['g', { f: 3, r: -1.2, c: 20, xs: [3, 7, 9], single: false }, P10(3, [-1.2, -0.8, -1.5, -2, -0.5], [20, 24, 18, 22, 16], [[3, 7, 9], [2, 6, 8], [4, 8, 10], [1, 6, 11]], false)],
  ['h', { f: 3, r: -1.2, c: 20, xs: [1], single: true }, P10(3, [-1.2, -0.8, -1.5, -2, -0.5], [20, 24, 18, 22, 16], [[1], [2], [11], [12]], true)],
]

// ================= exercise 11: graph the equation of a word problem (click two points, then Submit) =================
// The plane: one grid line for every x step, and the y lines are the values of the line there (600, 520, 440 ... for -80t + 600), so every x gives a grid crossing.
type E11 = { f: 0 | 1 | 2 | 3; r: number; c: number }
const XS11: [number[], number[]][] = [[[4, 5, 6, 8, 10], [1]], [[6, 8, 10], [1]], [[6, 8, 10], [1]], [[3, 4, 5], [1]]] // the x steps are 1, 2, 3 ...
const LAB11 = [['Years', 'Value ($)'], ['Age (years)', 'Liters'], ['Hours', 'Cost ($)'], ['Hours since 5 pm', 'Temperature (°C)']]
function plane11(e: E11): { d: Draw; a: [number, number]; b: [number, number] } | null {
  for (const X of [...XS11[e.f][0]].sort((p, q) => q - p)) {
    for (const xs of XS11[e.f][1]) {
      const xmin = e.f === 3 ? -X : 0
      if (X % xs !== 0 || (X - xmin) / xs < 4 || (X - xmin) / xs > 10) continue
      const ends = [e.r * xmin + e.c, e.r * X + e.c]
      const ys = +(Math.abs(e.r * xs) / 2).toFixed(6) // half of the change per step (20 or 40 for 80): the student has to work out the value, it is not just the next line
      const ymin = +(Math.min(...ends) - ys).toFixed(6) // one more grid line below and above, so that no value of the line is on the edge of the plane
      const ymax = +(Math.max(...ends) + ys).toFixed(6)
      if (e.f !== 3 && ymin < 0) continue // a value, a number of liters or a cost is not negative
      if ((ymax - ymin) / ys > 14.01) continue // not too many grid lines
      const d: Draw = { xmin, xmax: X, ymin, ymax, xs, ys, xlabel: LAB11[e.f][0], ylabel: LAB11[e.f][1], m: e.r, c: e.c }
      const at = (x: number): [number, number] => [x, +(e.r * x + e.c).toFixed(6)]
      return { d, a: at(0), b: at(1) } // a = the y-intercept, b = the point for 1 (the lesson asks for both)
    }
  }
  return null
}
function mk11(e: E11, key: string): It {
  const F = FAM[e.f]
  const p = plane11(e)
  if (!p) throw new Error(`no plane for ${JSON.stringify(e)}`)
  const eq = `${F.sym} = ${lin(e.r, F.v, e.c)}`
  const yint = ptTex(p.a[0], p.a[1]) // the y-intercept
  const yintWrong = uniq([ptTex(p.a[1], p.a[0]), ptTex(p.a[0], -p.a[1]), ptTex(p.a[0] + 1, p.a[1]), ptTex(p.a[0], p.a[1] + Math.abs(e.r))], (s) => s).filter((s) => s !== yint)
  const ans = `${yint},\\ ${ptTex(p.b[0], p.b[1])}` // the two points to click
  const wrong = uniq([`${ptTex(p.a[1], p.a[0])},\\ ${ptTex(p.b[1], p.b[0])}`, `${yint},\\ ${ptTex(p.b[0], p.a[1] - p.b[1] + p.a[1])}`, `${ptTex(p.a[0], p.a[1] + Math.abs(e.r))},\\ ${ptTex(p.b[0], p.b[1])}`, `${yint},\\ ${ptTex(p.b[0], p.b[1] + Math.abs(e.r))}`], (s) => s).filter((s) => s !== ans)
  // the equation with t replaced by the number (an arrow from t when `fromT`), then the value
  const step = (id: string, from: string, pt: [number, number], fromT: boolean, pointNo?: number) => ({
    label: `The point for ${F.v} = ${n4(pt[0])}`,
    landArrows: fromT ? [{ from: ['st'], to: [`${id}x`] }] : [], // an arrow from t in the equation to the number that takes its place; none for the second point
    figArrows: pointNo === undefined ? undefined : [{ from: `${id}b`, pt: pointNo, route: 'right' as const }], // when the value is worked out: an arrow to the point on the graph
    toks: [{ id: `${id}a`, tex: F.sym }, { id: `${id}g`, tex: '=' }, { id: `${id}e`, tex: `${n4(e.r)}\\cdot` }, { id: `${id}x`, tex: par(pt[0]) }, { id: `${id}f`, tex: plus(e.c) }, { id: `${id}h`, tex: '=' }, { id: `${id}b`, tex: n4(pt[1]) }],
    blanks: [blk(`${id}b`, from, `$${F.sym} = ${n4(e.r)}\\cdot ${par(pt[0])} ${plus(e.c)} = \\square$`, [n4(pt[1] + Math.abs(e.r)), n4(pt[1] - Math.abs(e.r)), n4(e.c - e.r * pt[0]), n4(e.r * pt[0]), n4(pt[1] + 1)].filter((s) => s !== n4(pt[1])), `Write ${F.v} = ${n4(pt[0])} in the equation. Then mark (${n4(pt[0])}, ${n4(pt[1])}).`)],
  })
  const w: Wp = {
    tex: text(`${F.story(eq)} Graph the equation: click two points on the line, then press Submit.`),
    short: eq,
    startToks: [{ id: 'sV', tex: F.sym }, { id: 'se', tex: '=' }, { id: 'sr', tex: n4(e.r) }, { id: 'st', tex: F.v }, { id: 'sc', tex: plus(e.c) }],
    key,
    answer: ans,
    wrong,
    steps: [
      step('k1', 'st', p.a, true),
      { label: 'The y-intercept.', figArrows: [{ from: 'k3b', pt: 0 }], toks: [{ id: 'k3a', tex: '\\text{y-intercept}' }, { id: 'k3b', tex: yint }], blanks: [blk('k3b', 'k1b', `$\\text{Which point is it? (${F.v} = 0)}$`, yintWrong, 'It is the point where the line meets the vertical axis. Mark it on the grid.')] },
      step('k4', 'k3b', p.b, false, 1),
    ],
  }
  // the picture above the lesson: the line, and a point is put on it when the step that finds it is done (data-pt = the number of the point: arrows point to it)
  return { w, fig: planeSvg(p.d, [p.a, p.b]), figAt: (n: number) => planeSvg(p.d, [p.a, p.b].slice(0, Math.max(0, n - 1)), n >= 3), draw: p.d }
}
const P11 = (f: 0 | 1 | 2 | 3, rs: number[], cs: number[]): E11[] => rs.flatMap((r) => cs.map((c): E11 => ({ f, r, c }))).filter((e) => plane11(e) !== null)
const E11_ROWS: [string, E11, E11[]][] = [
  ['a', { f: 0, r: -100, c: 600 }, P11(0, [-100, -150, -200, -80, -120, -250, -50], [600, 900, 1200, 800, 1500, 1000])],
  ['b', { f: 1, r: 0.4, c: 20 }, P11(1, [0.4, 0.3, 0.5, 0.6, 0.2], [20, 25, 15, 18, 22])],
  ['c', { f: 2, r: 80, c: 100 }, P11(2, [80, 60, 90, 70, 50], [100, 150, 120, 200, 90])],
  ['d', { f: 3, r: -1.2, c: 20 }, P11(3, [-1.2, -0.8, -1.5, -2, -0.5], [20, 24, 18, 22, 16])],
]

// ================= exercise 10 as it is asked: four problems, each with an a (the values) and a b (draw the graph) =================
type W10 = { k: 'v'; e: E10 } | { k: 'g'; e: E11 }
const mkWord = (w: W10, key: string) => (w.k === 'v' ? mk10(w.e, key) : mk11(w.e, key))
const E10_ROWS_MERGED: [string, W10, W10[]][] = [0, 1, 2, 3].flatMap((i): [string, W10, W10[]][] => {
  const [, bv, pv] = E10_ROWS[2 * i] // the a parts of the old list
  const [, bg, pg] = E11_ROWS[i]
  return [
    [`${i + 1}a`, { k: 'v', e: bv }, pv.map((e): W10 => ({ k: 'v', e }))],
    [`${i + 1}b`, { k: 'g', e: bg }, pg.map((e): W10 => ({ k: 'g', e }))],
  ]
})

export const EX_GRAPH42 = [
  build(4, 'Click the point on the grid.', E4, mk4, (p) => JSON.stringify(p), 'Locate a point', 4000),
  build(5, 'Choose the coordinates of the point.', E5, mk5, (p) => JSON.stringify(p), 'Read a point', 5000),
  build(6, 'Choose the answer.', E6_ROWS, mk6, e6id, 'Is it a solution?', 6000),
  build(7, 'Choose the missing values.', E7_ROWS, mk7, e7id, 'Complete the table', 7000),
  build(8, 'Choose the y-intercept.', E8_ROWS, mk8, e8id, 'The y-intercept', 8000),
  build(9, 'Choose the equation of the line.', E9_ROWS, mk9, e9id, 'Equation from a graph', 9000),
  build(10, 'Answer the question.', E10_ROWS_MERGED, mkWord, (w) => (w.k === 'v' ? r10(w.e) : JSON.stringify(w.e)), 'Linear model', 10000),
]

// ================= challenge exercises (4.2 exercises 6 and 8, harder): bigger slopes and intercepts, fractional slopes; optional extra practice, own progress (no 16, 18) =================
const BSH = [-12, -11, -9, -8, -7, 7, 8, 9, 11, 12]
const H6_ROWS: [string, E6, E6[]][] = [
  ['a', { k: 'sl', p: 5, q: 2, b: 7, x: 4, y: 17 }, sl6([[5, 2], [7, 2], [7, 3], [9, 4], [5, 3], [8, 3]], [-9, -7, -5, 5, 7, 9], [-3, -2, 2, 3], [0, 0, 1, -2])],
  ['b', { k: 'sl', p: -7, q: 3, b: -8, x: 6, y: -22 }, sl6([[-5, 2], [-7, 2], [-7, 3], [-9, 4], [-5, 3], [-8, 3]], [-9, -7, -5, 5, 7, 9], [-3, -2, 2, 3], [0, 1, -1, 3])],
  ['c', { k: 'st', a: 5, b: -3, c: 15, x: 3, y: 0 }, st6([3, 5, 7, 9], [-3, -5, -7, -9], [15, 21, 30, 35, -21], [[3, 0], [0, -3], [7, 2], [4, 5], [-2, 3], [6, 3], [5, -2], [2, -3]])],
  ['d', { k: 'st', a: 4, b: 7, c: 28, x: 7, y: 0 }, st6([2, 4, 6, 8], [3, 5, 7, 9], [28, 36, 24, -30], [[7, 0], [0, 4], [3, 2], [-3, 5], [6, -2], [2, 4], [5, 1], [-4, 6]])],
]
const sl8h = (pq: [number, number][]): E8[] => pq.flatMap(([p, q]) => BSH.map((b): E8 => ({ k: 'sl', p, q, b })))
const H8_ROWS: [string, E8, E8[]][] = [
  ['a', { k: 'sl', p: 7, q: 2, b: -9 }, sl8h([[7, 2], [9, 2], [11, 3], [13, 4], [5, 7]])],
  ['b', { k: 'sl', p: -9, q: 4, b: 11 }, sl8h([[-7, 2], [-9, 4], [-11, 3], [-13, 5], [-5, 7]])],
  ['c', { k: 'fa', m: -7, h: 9 }, [-9, -8, -7, -6, 5, 6, 7, 8, 9].flatMap((m) => [-12, -11, -9, -8, 7, 8, 9, 11, 12].map((h): E8 => ({ k: 'fa', m, h })))],
]
export const EX_GRAPH42H = [
  build(16, 'Choose the answer.', H6_ROWS, mk6, e6id, 'Is it a solution? (challenge)', 6016),
  build(18, 'Choose the y-intercept.', H8_ROWS, mk8, e8id, 'The y-intercept (challenge)', 8018),
]

// ---- more challenge exercises (4.2): 17 complete the table with big slopes, 19 the equation of a steep or fractional line; own progress ----
// the given y is b + p k so that the x it belongs to (q k) is a whole number
const T7H = (pq: [number, number][], bs: number[], ks: number[]): E7[] => pq.flatMap(([p, q]) => bs.flatMap((b) => ks.map((k): E7 => ({ p, q, b, cols: [['x', 0], ['y', b + p * k], ['x', q * (k + 2 > 0 ? k + 2 : k - 2)]] }))))
const BH = [-19, -17, -14, -13, -11, 11, 13, 14, 17, 19]
const KH = [-4, -3, -2, 2, 3, 4]
const H7_ROWS: [string, E7, E7[]][] = [
  ['a', { p: 7, q: 1, b: 11, cols: [['x', 0], ['y', 32], ['x', 5]] }, T7H([[7, 1], [8, 1], [9, 1], [11, 1], [12, 1]], BH, KH)],
  ['b', { p: -9, q: 1, b: -13, cols: [['x', 0], ['y', -40], ['x', 4]] }, T7H([[-7, 1], [-8, 1], [-9, 1], [-11, 1], [-12, 1]], BH, KH)],
  ['c', { p: 7, q: 3, b: -11, cols: [['x', 0], ['y', -4], ['x', 9]] }, T7H([[5, 2], [7, 3], [9, 4], [7, 2], [8, 3]], BH, KH)],
  ['d', { p: -9, q: 4, b: 13, cols: [['x', 0], ['y', 4], ['x', 12]] }, T7H([[-5, 2], [-7, 3], [-9, 4], [-7, 2], [-8, 3]], BH, KH)],
]
const B9H = [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]
const H9_ROWS: [string, E9, E9[]][] = [
  ['a', { p: 5, q: 2, b: -4 }, T9([[5, 2], [3, 2], [5, 3], [4, 3]], B9H)],
  ['b', { p: -5, q: 2, b: 4 }, T9([[-5, 2], [-3, 2], [-5, 3], [-4, 3]], B9H)],
  ['c', { p: 3, q: 4, b: 2 }, T9([[3, 4], [4, 5], [5, 4], [2, 5], [3, 5]], B9H)],
  ['d', { p: -4, q: 5, b: -1 }, T9([[-3, 4], [-4, 5], [-5, 4], [-2, 5], [-3, 5]], B9H)],
]
export const EX_GRAPH42H2 = [
  build(17, 'Choose the missing values.', H7_ROWS, mk7, e7id, 'Complete the table (challenge)', 7017),
  build(19, 'Choose the equation of the line.', H9_ROWS, mk9, e9id, 'Equation from a graph (challenge)', 9019),
]
