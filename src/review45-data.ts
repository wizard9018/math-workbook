// Grade 9 4.5 Chapter Review (mineru G9 Chapter 4): exercises 1 (common difference), 2 (100th term), 3 (equation of a pattern), 6 (complete the table),
//   7 (graph y = m x + b), 8 (equation of a graph), 9 (lawn mower: graph, cost of some days, days for a value), 10 (graph a x + b y = c with fractions), 11 (match equations and graphs).
//   4 and 5 (printing cost, depreciation) are left out.
// Every question uses the builders and lessons of the section it comes from (4.1 to 4.4) with the numbers of the review; the 10 similar questions are made the same way.
// Exercise 9a is drawn on a coarse grid (a step of 20 dollars): a point within 10 dollars of the line counts.
// Imported by: quiz.tsx, check45.ts. Shape: exercise.ts.
import type { Draw, Exercise, Question } from './exercise'
import { EX_SEQ41H } from './seq41-data'
import { EX_GRAPH42H2 } from './graph42-data'
import { EX_GRAPH43H2 } from './graph43-data'
import { EX_GRAPH44H } from './graph44-data'
import type { Wp } from './ineq64-data'
import { build as buildSeq, ex3, ex5, ex6, grid, sq, sqKey } from './seq41-data'
import type { Sq } from './seq41-data'
import { build, ptTex, slopeEq, uniq } from './graph42-data'
import type { It } from './graph42-data'
import { T7, e7id, mk7, slopesWhere } from './graph42-data'
import type { E7 } from './graph42-data'
import { D, drawIt, e2id, g2, mk2, pairTex, pairWrong } from './graph43-data'
import type { E2 } from './graph43-data'
import { E1_ROWS, E5_ROWS, e1id, e5id, mk1, mk5 } from './graph44-data'
import type { E1, E5 } from './graph44-data'
import { blk, n4, num, range } from './seq41-data'

// the exercises of 4.1 are numbered by the builder (its `no` makes the keys); the review gives them its own number and section
const asReview = (ex: Exercise, no: number): Exercise => ({ ...ex, no, sec: '4.5' })
const withNth = (ss: Sq[], nth: number): Sq[] => ss.map((s) => ({ ...s, nth }))

// ---- 1 the common difference ----
const E1S: [string, Sq, Sq[]][] = [
  ['a', sq(-7, 3), grid(range(-12, -2), [2, 3, 4, 5])],
  ['b', sq(-1, -3), grid(range(-6, 4), [-2, -3, -4, -5])],
  ['c', sq(2.5, 0.25, true), grid([1.5, 2.5, 3.5, 0.5, 4.5, 5.5], [0.25, 0.5, 0.75, 1.25], true)],
  ['d', sq(6.5, -1.2, true), grid([6.5, 5.5, 7.5, 8.5, 4.5, 9.5], [-1.2, -0.8, -1.5, -0.6, -1.4, -0.4], true)],
]
// ---- 2 the 100th term, 3 the equation of the pattern ----
const E2S: [string, Sq, Sq[]][] = [
  ['a', sq(12, -3, false, { nth: 100 }), withNth(grid([12, 15, 9, 18, 21, 24, 20, 30], [-2, -3, -4, -5]), 100)],
  ['b', sq(-7, 4, false, { nth: 100 }), withNth(grid([-7, -9, -5, -11, -3, -12, -4, -8], [2, 3, 4, 5]), 100)],
]
const E3S: [string, Sq, Sq[]][] = [
  ['a', sq(12, -3), grid([12, 15, 9, 18, 21, 24, 20, 30], [-2, -3, -4, -5])],
  ['b', sq(-7, 4), grid([-7, -9, -5, -11, -3, -12, -4, -8], [2, 3, 4, 5])],
]
// ---- 6 complete the table (the missing y and x) ----
const COLS: ['x' | 'y', number][][] = [[['x', 0], ['y', 0], ['x', 3]], [['x', 0], ['y', 0], ['x', 6]], [['x', 0], ['y', 0], ['x', -3]]]
const E6S: [string, E7, E7[]][] = [
  ['a', { p: 2, q: 3, b: -4, cols: [['x', 0], ['y', 0], ['x', 9]] }, T7(slopesWhere((p, q) => p > 0 && q > 1), [-4, -2, -1, 1, 3], COLS)],
  ['b', { p: -4, q: 3, b: 2, cols: [['x', 0], ['y', 0], ['x', 9]] }, T7(slopesWhere((p, q) => p < 0 && q > 1), [2, 3, 4, -2, -1, 1], COLS)],
]

// ---- 7 graph y = m x + b: click the y-intercept and the next point ----
interface E7r {
  p: number
  q: number
  b: number
}
function mk7r(e: E7r, key: string): It {
  const m = e.p / e.q
  const ok = (x: number, y: number) => Math.abs(x) <= 6 && Math.abs(y) <= 6
  const g: [number, number] = [0, e.b]
  const second: [number, number] = ok(e.q, e.b + e.p) ? [e.q, e.b + e.p] : [-e.q, e.b - e.p]
  const d = D({ m, c: e.b })
  const eq = slopeEq(m, e.b)
  const dx = second[0]
  const dy = second[1] - e.b
  const move = (v: number, pos: string, neg: string) => `${v < 0 ? neg : pos} ${Math.abs(v)}`
  const ans = pairTex(g, second)
  const wrong = pairWrong(g, second).filter((s) => s !== ans)
  const secondWrong = uniq([[dx, e.b - dy], [dy, e.b + dx], [-dx, e.b + dy], [dx, e.b + dy + 1]].map(([x, y]) => ptTex(x, y)), (s) => s).filter((s) => s !== ptTex(second[0], second[1]))
  const w: Omit<Wp, 'tex'> = {
    short: eq,
    key,
    answer: ans,
    wrong,
    steps: [
      { label: 'The y-intercept.', toks: [{ id: 'z1a', tex: '\\text{y-intercept}' }, { id: 'z1g', tex: '=' }, { id: 'z1b', tex: ptTex(0, e.b) }], blanks: [blk('z1b', 's0', '$y = m\\,x + b\\text{: the point on the y-axis}$', [ptTex(e.b, 0), ptTex(0, -e.b), ptTex(0, e.b + 1)], 'b is the number added at the end; on the y-axis x is 0.')] },
      {
        label: 'Use the slope.',
        figArrows: [{ from: 'z2b', pt: 1, route: 'right' as const }],
        toks: [{ id: 'z2a', tex: '\\text{next point}' }, { id: 'z2b', tex: ptTex(second[0], second[1]) }],
        blanks: [blk('z2b', 'z1b', `$\\text{Start at } ${ptTex(0, e.b)}\\text{ with slope } ${num(m, false)}\\text{: ${move(dx, 'right', 'left')}, ${move(dy, 'up', 'down')}}$`, secondWrong, 'The slope is the change in y for each change in x. Start at the y-intercept and move.')],
      },
    ],
  }
  return drawIt(d, g, second, `Graph the equation §${eq}§. Click two points, then press Submit.`, w)
}
const T7r = (pq: [number, number][], bs: number[]): E7r[] => pq.flatMap(([p, q]) => bs.map((b): E7r => ({ p, q, b }))).filter((e) => Math.abs(e.q) <= 6 && Math.abs(e.b) <= 6 && (Math.abs(e.b + e.p) <= 6 || Math.abs(e.b - e.p) <= 6))
const E7R: [string, E7r, E7r[]][] = [
  ['a', { p: -3, q: 4, b: 2 }, T7r([[-3, 4], [-2, 3], [-1, 3], [-3, 2], [-1, 2], [-4, 3]], [-3, -2, -1, 1, 2, 3, 4])],
  ['b', { p: -5, q: 2, b: 1 }, T7r([[-5, 2], [-3, 2], [-5, 3], [5, 2], [3, 2], [-1, 2]], [-3, -2, -1, 1, 2, 3])],
]
const e7rid = (e: E7r) => JSON.stringify(e)

// ---- 8 the equation of a graph (4.4 exercise 3): the review's own lines ----
const E8S: [string, E5, E5[]][] = [
  ['a', { p: -1, q: 1, b: 2 }, E5_ROWS[1][2]],
  ['b', { p: 5, q: 3, b: -1 }, E5_ROWS[4][2]],
  ['c', { p: 1, q: 2, b: -2 }, E5_ROWS[2][2]],
  ['d', { p: 1, q: 3, b: 1 }, E5_ROWS[5][2]],
]

// ---- 9 the lawn mower: C = F + r d ----
interface E9 {
  k: 'a' | 'b' | 'c'
  F: number
  r: number
  N: number // the days (b), or the days for which the cost equals the value (c)
}
function mk9(e: E9, key: string): It {
  const eq = `C = ${e.F} + ${e.r}d`
  const story = `The cost, C, in dollars for renting a riding lawn mower is ${eq}, where d is the number of days renting.`
  if (e.k === 'a') {
    const ymax = Math.ceil((e.F + 6 * e.r) / 20) * 20
    const d: Draw = { xmin: 0, xmax: 6, ymin: 0, ymax, xs: 1, ys: 20, xlabel: 'd (days)', ylabel: 'C (dollars)', m: e.r, c: e.F, tol: 10 }
    const p1: [number, number] = [0, e.F]
    const p2: [number, number] = [1, e.F + e.r]
    const ans = pairTex(p1, p2)
    const wrong = pairWrong(p1, p2).filter((s) => s !== ans)
    return drawIt(d, p1, p2, `${story} Graph this equation for 0 to 6 days: click two points on the line (the grid has a step of 20 dollars, click the nearest crossing), then press Submit.`, {
      short: eq,
      key,
      answer: ans,
      wrong,
      steps: [
        { label: 'The cost for 0 days.', toks: [{ id: 'm1a', tex: '\\text{0 days}' }, { id: 'm1g', tex: '=' }, { id: 'm1b', tex: n4(e.F) }], blanks: [blk('m1b', 's0', `$C = ${e.F} + ${e.r}\\cdot 0 = \\square$`, [n4(e.r), n4(e.F + e.r), '0'], 'Put d = 0 in the equation.')] },
        { label: 'The cost for 1 day.', toks: [{ id: 'm2a', tex: '\\text{1 day}' }, { id: 'm2g', tex: '=' }, { id: 'm2b', tex: n4(e.F + e.r) }], blanks: [blk('m2b', 'm1b', `$C = ${e.F} + ${e.r}\\cdot 1 = \\square$`, [n4(e.F * e.r), n4(e.r), n4(e.F - e.r)], 'Put d = 1 in the equation.')] },
      ],
    })
  }
  if (e.k === 'b') {
    const part = e.r * e.N
    const ans = n4(e.F + part)
    const wrong = [n4(part), n4(e.F + e.r + e.N), n4(e.F * e.N + e.r), n4(e.F + part + e.r)]
    const w: Wp = {
      tex: `\\text{${story.replace(/[%&#_]/g, '')} Find the cost of renting the lawn mower for ${e.N} days.}`,
      short: eq,
      key,
      answer: ans,
      wrong,
      steps: [
        { label: 'The cost of the days.', toks: [{ id: 'm1a', tex: `${e.r}\\cdot ${e.N}` }, { id: 'm1g', tex: '=' }, { id: 'm1b', tex: n4(part) }], blanks: [blk('m1b', 's0', `$${e.r}\\cdot ${e.N} = \\square$`, [n4(part + e.r), n4(part - e.r), n4(e.F * e.N)], 'The cost for each day times the number of days.')] },
        { label: 'Add the fixed charge.', toks: [{ id: 'm2a', tex: 'C' }, { id: 'm2g', tex: '=' }, { id: 'm2b', tex: ans }], blanks: [blk('m2b', 'm1b', `$${e.F} + ${n4(part)} = \\square$`, wrong, 'The fixed charge plus the cost of the days.')] },
      ],
    }
    return { w }
  }
  const V = e.F + e.r * e.N
  const left = V - e.F
  const ans = n4(e.N)
  const wrong = [n4(V / e.r), n4(left / e.F), n4(e.N + 1), n4(V - e.r)]
  const w: Wp = {
    tex: `\\text{${story} If the lawn mower is worth ${V} dollars, in how many days would the rental charge equal the value of the lawn mower?}`,
    short: eq,
    key,
    answer: ans,
    wrong,
    steps: [
      { label: 'Take away the fixed charge.', toks: [{ id: 'm1a', tex: `${e.r}d` }, { id: 'm1g', tex: '=' }, { id: 'm1b', tex: n4(left) }], blanks: [blk('m1b', 's0', `$${V} - ${e.F} = \\square$`, [n4(V + e.F), n4(V), n4(left - e.r)], `Put C = ${V} in the equation and take ${e.F} from both sides.`)] },
      { label: 'Divide by the cost of a day.', toks: [{ id: 'm2a', tex: 'd' }, { id: 'm2g', tex: '=' }, { id: 'm2b', tex: ans }], blanks: [blk('m2b', 'm1b', `$${n4(left)} \\div ${e.r} = \\square$`, wrong, 'Divide by the number in front of d.')] },
    ],
  }
  return { w }
}
const RATES: [number, number][] = [[45, 40], [55, 30], [75, 35], [85, 25], [35, 45], [95, 20], [25, 50], [65, 30], [85, 40], [55, 45]]
const E9: [string, E9, E9[]][] = [
  ['a', { k: 'a', F: 65, r: 40, N: 0 }, RATES.map(([F, r]): E9 => ({ k: 'a', F, r, N: 0 }))],
  ['b', { k: 'b', F: 65, r: 40, N: 16 }, RATES.map(([F, r], i): E9 => ({ k: 'b', F, r, N: [12, 14, 15, 16, 18, 20][i % 6] }))],
  ['c', { k: 'c', F: 65, r: 40, N: 55 }, RATES.map(([F, r], i): E9 => ({ k: 'c', F, r, N: [20, 25, 30, 35, 40, 45, 50, 55, 60, 28][i] }))],
]
const e9id = (e: E9) => JSON.stringify(e)

// ---- 10 graph a x + b y = c with fractions ----
const E10S: [string, E2, E2[]][] = [
  ['a', { a: 2, b: 2 / 3, c: 2 }, g2([2, 3, 1, -2, 4], [2 / 3, -2 / 3, 1 / 2, -1 / 2, 1 / 3, -1 / 3])],
  ['b', { a: 1 / 3, b: -1 / 5, c: 1 }, g2([1 / 3, -1 / 3, 1 / 2, -1 / 2, 2 / 3], [-1 / 5, 1 / 5, -1 / 4, 1 / 4, -1 / 2])],
]

// ---- 11 match equations and graphs (4.4 exercise 4) ----
const E11S: [string, E1, E1[]][] = [
  ['a', { k: 'sl', m: -1, c: 2, s: 0 }, E1_ROWS[1][2]],
  ['b', { k: 'sl', m: 1 / 2, c: 0, s: 1 }, E1_ROWS[2][2]],
  ['c', { k: 'h', v: 2, s: 2 }, E1_ROWS[6][2]],
  ['d', { k: 'v', v: -3, s: 0 }, E1_ROWS[5][2]],
  ['e', { k: 'sl', m: -2, c: 0, s: 1 }, E1_ROWS[0][2]],
  ['f', { k: 'st', a: 3, b: -2, c: 6, s: 2 }, E1_ROWS[3][2]],
  ['g', { k: 'st', a: 2, b: 3, c: 6, s: 0 }, E1_ROWS[4][2]],
  ['h', { k: 'st', a: 1, b: -2, c: 6, s: 1 }, E1_ROWS[3][2]],
  ['i', { k: 'st', a: 3, b: 2, c: -6, s: 2 }, E1_ROWS[4][2]],
]

export const EX_REVIEW45: Exercise[] = [
  asReview(buildSeq(4501, 'Choose the common difference.', E1S, ex3, sqKey, 'Common difference', 4510), 1),
  asReview(buildSeq(4502, 'Choose the term.', E2S, ex6, sqKey, 'The 100th term', 4520), 2),
  asReview(buildSeq(4503, 'Choose the equation relating y to x.', E3S, ex5, sqKey, 'Equation of the pattern', 4530), 3),
  build(6, 'Complete the table.', E6S, mk7, e7id, 'Complete the table', 4560, '4.5'),
  build(7, 'Graph the equation.', E7R, mk7r, e7rid, 'Graph the equation', 4570, '4.5'),
  build(8, 'Write the equation.', E8S, mk5, e5id, 'Equation of a line', 4580, '4.5'),
  build(9, 'The lawn mower.', E9, mk9, e9id, 'Lawn mower rental', 4590, '4.5'),
  build(10, 'Graph the equation.', E10S, mk2, e2id, 'Graph the equation', 45100, '4.5'),
  build(11, 'Which graph?', E11S, mk1, e1id, 'Match the graph', 45110, '4.5'),
]

// challenge versions: the parts of the challenge exercises of 4.1 to 4.4 (12 common difference, 13 the 100th term, 14 equation of the pattern, 15 complete the table, 16 equation of a graph, 17 graph with fractions, 18 match); 7 and 9 have none
const chal = (list: Exercise[], from: number, no: number, prompt: string): Exercise => {
  const ex = list.find((e) => e.no === from)!
  return { ...ex, no, sec: '4.5', prompt, questions: ex.questions.map((q): Question => ({ ...q })) }
}
export const EX_REVIEW45H: Exercise[] = [
  chal(EX_SEQ41H, 13, 12, 'Choose the common difference.'),
  chal(EX_SEQ41H, 16, 13, 'Choose the term.'),
  chal(EX_SEQ41H, 15, 14, 'Choose the equation relating y to x.'),
  chal(EX_GRAPH42H2, 17, 15, 'Complete the table.'),
  chal(EX_GRAPH44H, 15, 16, 'Write the equation.'),
  chal(EX_GRAPH43H2, 12, 17, 'Graph the equation.'),
  chal(EX_GRAPH44H, 11, 18, 'Which graph?'),
]
