// Grade 9 4.3 (bank/G9-ch4/s3/items.json): graphing linear equations in standard form and the lines x = k, y = k.
//   1 is the ordered pair a solution (Yes / No), 2 graph a/b x + c y = d (click two points on the grid, Submit), 3 graph x = k or y = k (the same),
//   4 use the graph to complete the table (the graph is drawn here, the table is typed into), 5 draw a line parallel to the given one through the given point (click two points)
// The drawing questions use draw (graph-draw.tsx) and, in the lesson, the picture of plane.ts with arrows to the points (main.tsx figArrows).
// The 10 similar questions of every question are made here from small tables; every answer and step is computed.
// Imported by: quiz.tsx, check43.ts. Shape: exercise.ts. Helpers: graph42-data.ts, seq41-data.ts.
import type { Draw, Fill } from './exercise'
import type { Wp } from './ineq64-data'
import { build, ptTex, uniq } from './graph42-data'
import type { It } from './graph42-data'
import { planeSvg } from './plane'
import { blk, n4, num, par, plus, range, text } from './seq41-data'

type P = [number, number]
export const D = (extra: Partial<Draw>): Draw => ({ xmin: -6, xmax: 6, ymin: -6, ymax: 6, xs: 1, ys: 1, xlabel: 'x', ylabel: 'y', m: 0, c: 0, ...extra })
export const lattice = (m: number, c: number): P[] => range(-6, 6).flatMap((x): P[] => {
  const y = m * x + c
  return Math.abs(y - Math.round(y)) < 1e-9 && Math.abs(y) <= 6 ? [[x, Math.round(y)]] : []
})
// a x + b y = c as TeX (coefficients as decimals when dec)
const eqStd = (a: number, b: number, c: number, dec: boolean) => {
  const t = (k: number, v: string, first: boolean) => `${first ? (k < 0 ? '-' : '') : k < 0 ? ' - ' : ' + '}${Math.abs(k) === 1 ? '' : num(Math.abs(k), dec)}${v}`
  return `${t(a, 'x', true)}${t(b, 'y', false)} = ${num(c, dec)}`
}
const near = (v: number, ...more: number[]) => [...more, v + 1, v - 1, -v, v + 2].map((x) => num(x, false))
const slopeTex = (m: number, c: number) => `y = ${num(m, false)}x${c === 0 ? '' : ` ${plus(c, false)}`}`.replace('= 1x', '= x').replace('= -1x', '= -x')
// two of the grid points of a line to click: the two nearest to the origin that are at least 2 apart in x (the line is vertical: in y)
export const pickTwo = (pts: P[]): [P, P] => {
  const s = [...pts].sort((a, b) => a[0] ** 2 + a[1] ** 2 - (b[0] ** 2 + b[1] ** 2))
  const second = s.find((p) => Math.abs(p[0] - s[0][0]) >= 2) ?? s[1]
  return s[0][0] <= second[0] ? [s[0], second] : [second, s[0]]
}

// ================= exercise 1: is the ordered pair a solution =================
type E1 = { k: 'std' | 'rev'; a: number; b: number; c: number; x: number; y: number; dec?: boolean } | { k: 'vx' | 'hy'; v: number; x: number; y: number }
function mk1(e: E1, key: string): It {
  const pt = ptTex(e.x, e.y)
  const short = (eq: string) => `${pt},\\ ${eq}`
  // the starting line in pieces, so that the arrows of the first question leave from the letters x and y
  const coef = (k: number, dec: boolean) => (Math.abs(k) === 1 ? '' : num(Math.abs(k), dec))
  const piece = (id: string, tex: string) => (tex ? [{ id, tex }] : [])
  const startOf = (): { id: string; tex: string }[] => {
    const sp = { id: 'sp', tex: `${pt},\\ ` }
    if (e.k === 'vx' || e.k === 'hy') return [sp, { id: e.k === 'vx' ? 'sx' : 'sy', tex: e.k === 'vx' ? 'x' : 'y' }, { id: 'se', tex: `= ${num(e.v, false)}` }]
    const dec = !!e.dec
    return e.k === 'std'
      ? [sp, ...piece('sa', `${e.a < 0 ? '-' : ''}${coef(e.a, dec)}`), { id: 'sx', tex: 'x' }, ...piece('sc', `${e.b < 0 ? '-' : '+'}${coef(e.b, dec)}`), { id: 'sy', tex: 'y' }, { id: 'se', tex: `= ${num(e.c, dec)}` }]
      : [sp, ...piece('sb', coef(e.b, dec)), { id: 'sy', tex: 'y' }, { id: 'se', tex: `= ${num(e.c, dec)} ${e.a > 0 ? '-' : '+'} ${coef(e.a, dec)}` }, { id: 'sx', tex: 'x' }]
  }
  if (e.k === 'vx' || e.k === 'hy') {
    const letter = e.k === 'vx' ? 'x' : 'y'
    const val = e.k === 'vx' ? e.x : e.y
    const other = e.k === 'vx' ? e.y : e.x
    const yes = Math.abs(val - e.v) < 1e-9
    const eq = `${letter} = ${num(e.v, false)}`
    const ans = yes ? '\\text{Yes}' : '\\text{No}'
    return {
      plain: ['\\text{Yes}', '\\text{No}'],
      w: {
        tex: `${text('Is the ordered pair ')}${pt}${text(' a solution of ')}${eq}${text('?')}`,
        short: short(eq),
        startToks: startOf(),
        key,
        answer: ans,
        wrong: [yes ? '\\text{No}' : '\\text{Yes}'],
        steps: [
          { label: `Which number is ${letter}?`, toks: [{ id: 'r0a', tex: `${letter} =` }, { id: 'r0b', tex: n4(val) }], blanks: [blk('r0b', letter === 'x' ? 'sx' : 'sy', `$\\text{In } (x, y)\\text{, which number is } ${letter}\\text{?}$`, [n4(other), n4(-val), n4(val + 1)], 'In (x, y) the first number is x and the second is y.')] },
          { label: 'Put it in.', auto: true, landArrows: [], toks: [{ id: 'r1l', tex: n4(val) }, { id: 'r1e', tex: '=' }, { id: 'r1r', tex: num(e.v, false) }], blanks: [] },
          { label: 'Compare.', landArrows: [], toks: [{ id: 'r2a', tex: '\\text{solution?}' }, { id: 'r2b', tex: ans }], blanks: [blk('r2b', 'r1l', `$\\text{Is } ${n4(val)} = ${num(e.v, false)}\\text{?}$`, [yes ? '\\text{No}' : '\\text{Yes}'], `Every point of the line ${eq} has ${letter} = ${num(e.v, false)}.`)] },
        ],
      },
    }
  }
  const dec = !!e.dec
  const eq = e.k === 'std' ? eqStd(e.a, e.b, e.c, dec) : `${e.b === 1 ? '' : num(e.b, dec)}y = ${num(e.c, dec)} ${e.a > 0 ? '-' : '+'} ${Math.abs(e.a) === 1 ? '' : num(Math.abs(e.a), dec)}x`
  const L = e.a * e.x + e.b * e.y
  const yes = Math.abs(L - e.c) < 1e-9
  const ans = yes ? '\\text{Yes}' : '\\text{No}'
  const two = { label: 'Which number goes where?', toks: [{ id: 'p0a', tex: 'x =' }, { id: 'p0x', tex: n4(e.x) }, { id: 'p0b', tex: ',\\ y =' }, { id: 'p0y', tex: n4(e.y) }], blanks: [blk('p0x', 'sx', '$\\text{Which number is } x\\text{?}$', [n4(e.y), n4(-e.x), n4(-e.y)], 'In (x, y) the first number is x.'), blk('p0y', 'sy', '$\\text{Which number is } y\\text{?}$', [n4(e.x), n4(-e.y), n4(-e.x)], 'In (x, y) the second number is y.')] }
  const steps =
    e.k === 'std'
      ? [
          two,
          // x and y are put into the expression (arrows from the numbers chosen above); this line is only shown: -2·(-1) + 4·4 = 19
          { label: 'Put x and y in.', auto: true, landArrows: [{ from: ['p0x'], to: ['p1x'] }, { from: ['p0y'], to: ['p1y'] }], toks: [{ id: 'p1a', tex: `${num(e.a, dec)}\\cdot` }, { id: 'p1x', tex: par(e.x, dec) }, { id: 'p1c', tex: `${plus(e.b, dec)}\\cdot` }, { id: 'p1y', tex: par(e.y, dec) }, { id: 'p1g', tex: '=' }, { id: 'p1b', tex: num(e.c, dec) }], blanks: [] },
          // the value of the left side is asked: 18 = 19
          { label: 'Work out the left side.', landArrows: [], toks: [{ id: 'p2l', tex: num(L, false) }, { id: 'p2e', tex: '=' }, { id: 'p2r', tex: num(e.c, dec) }], blanks: [blk('p2l', 'p1b', `$${num(e.a, dec)}\\cdot ${par(e.x, dec)} ${plus(e.b, dec)}\\cdot ${par(e.y, dec)} = \\square$`, near(L, e.a * e.x - e.b * e.y), 'Multiply first, then add or subtract.')] },
          { label: 'Compare.', landArrows: [], toks: [{ id: 'p3a', tex: '\\text{solution?}' }, { id: 'p3b', tex: ans }], blanks: [blk('p3b', 'p2l', `$\\text{Is } ${num(L, false)} = ${num(e.c, dec)}\\text{?}$`, [yes ? '\\text{No}' : '\\text{Yes}'], 'If the two numbers are equal, the ordered pair is a solution.')] },
        ]
      : [
          two,
          // 3·2 = 10 − 2·0 (only shown), then both values are asked, then the question
          { label: 'Put x and y in.', auto: true, landArrows: [{ from: ['p0y'], to: ['p1y'] }, { from: ['p0x'], to: ['p1x'] }], toks: [{ id: 'p1a', tex: `${num(e.b, dec)}\\cdot` }, { id: 'p1y', tex: par(e.y, dec) }, { id: 'p1g', tex: '=' }, { id: 'p1c', tex: `${num(e.c, dec)} ${e.a > 0 ? '-' : '+'} ${num(Math.abs(e.a), dec)}\\cdot` }, { id: 'p1x', tex: par(e.x, dec) }], blanks: [] },
          { label: 'Work out both sides.', landArrows: [], toks: [{ id: 'p2l', tex: num(e.b * e.y, false) }, { id: 'p2e', tex: '=' }, { id: 'p2r', tex: num(e.c - e.a * e.x, false) }], blanks: [blk('p2l', 'p1a', `$${num(e.b, dec)}\\cdot ${par(e.y, dec)} = \\square$`, near(e.b * e.y), 'Multiply.'), blk('p2r', 'p1x', `$${num(e.c, dec)} ${e.a > 0 ? '-' : '+'} ${num(Math.abs(e.a), dec)}\\cdot ${par(e.x, dec)} = \\square$`, near(e.c - e.a * e.x, e.c + e.a * e.x), 'Multiply first, then add or subtract.')] },
          { label: 'Compare.', landArrows: [], toks: [{ id: 'p3a', tex: '\\text{solution?}' }, { id: 'p3b', tex: ans }], blanks: [blk('p3b', 'p2l', `$\\text{Is } ${num(e.b * e.y, false)} = ${num(e.c - e.a * e.x, false)}\\text{?}$`, [yes ? '\\text{No}' : '\\text{Yes}'], 'If the two sides are equal, the ordered pair is a solution.')] },
        ]
  return { plain: ['\\text{Yes}', '\\text{No}'], w: { tex: `${text('Is the ordered pair ')}${pt}${text(' a solution of ')}${eq}${text('?')}`, short: short(eq), startToks: startOf(), key, answer: ans, wrong: [yes ? '\\text{No}' : '\\text{Yes}'], steps } }
}
const g1 = (k: 'std' | 'rev', as: number[], bs: number[], xs: number[], ys: number[], ds: number[], dec = false): E1[] =>
  as.flatMap((a) => bs.flatMap((b) => xs.flatMap((x) => ys.flatMap((y) => ds.map((d): E1 => ({ k, a, b, c: a * x + b * y + d, x, y, dec }))))))
const gl1 = (k: 'vx' | 'hy', vs: number[], pts: P[]): E1[] => vs.flatMap((v) => pts.map(([x, y]): E1 => ({ k, v, x, y })))
const PTS1: P[] = range(-6, 6).flatMap((x) => [-5, -3, -2, -1, 0, 1, 2, 3, 4, 6].map((y): P => [x, y]))
const E1_ROWS: [string, E1, E1[]][] = [
  ['a', { k: 'std', a: 3, b: -5, c: -9, x: 2, y: 3 }, g1('std', [1, 2, 3, 4, -2, -3], [-5, -4, -3, -2, 2, 3, 4, 5], [-3, -2, -1, 0, 1, 2, 3, 4], [-3, -2, -1, 0, 1, 2, 3, 4], [0, 0, 1, -2])],
  ['b', { k: 'std', a: 1 / 3, b: 1, c: 4, x: 0, y: 4 }, g1('std', [1 / 3, 1 / 2, 2 / 3, -1 / 3, -1 / 2, 3 / 4], [1, -1, 2], [-6, -3, 0, 3, 6, 12, 4, 8, -4, -8], [-3, -2, 0, 2, 4, 6], [0, 0, 1, -2])],
  ['c', { k: 'rev', a: 2, b: 3, c: 5, x: 1, y: -1 }, g1('rev', [1, 2, 3, 4, -2, -3], [2, 3, 4, 5, -2, -3], [-3, -2, -1, 0, 1, 2, 3, 4], [-3, -2, -1, 0, 1, 2, 3], [0, 0, 1, -2])],
  ['d', { k: 'std', a: 1 / 3, b: -1 / 4, c: 4, x: 6, y: 8 }, g1('std', [1 / 3, 1 / 2, -1 / 3, 2 / 3], [-1 / 4, 1 / 4, -1 / 2, 1 / 2, 1 / 3], [-12, -6, 0, 6, 12, 3, 9], [-8, -4, 0, 4, 8, 12, 6], [0, 0, 1, -2])],
  ['e', { k: 'vx', v: 4, x: 4, y: 2 }, gl1('vx', [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5], PTS1).filter((e) => e.k === 'vx' && Math.abs(e.x - e.v) < 2.5)],
  ['f', { k: 'hy', v: -1, x: -1, y: 3 }, gl1('hy', [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5], PTS1).filter((e) => e.k === 'hy' && Math.abs(e.y - e.v) < 2.5)],
]
const e1id = (e: E1) => JSON.stringify(e)

// ================= the drawing questions: the lesson picture (the line and the points found so far) and the answer =================
export function drawIt(d: Draw, p1: P, p2: P, story: string, w: Omit<Wp, 'tex'>, figAt?: (n: number) => string): It {
  return { w: { ...w, tex: text(story) }, fig: planeSvg(d, [p1, p2]), figAt: figAt ?? ((n: number) => planeSvg(d, [p1, p2].slice(0, Math.min(n, 2)), n >= 2)), draw: d }
}
export const pairTex = (p1: P, p2: P) => `${ptTex(p1[0], p1[1])},\\ ${ptTex(p2[0], p2[1])}`
export const pairWrong = (p1: P, p2: P) => uniq([pairTex([p1[1], p1[0]], [p2[1], p2[0]]), pairTex(p1, [p2[0], -p2[1]]), pairTex([-p1[0], p1[1]], p2), pairTex([p1[0], p1[1] + 1], p2)], (s) => s)

// ================= exercise 2: graph a x + b y = c (click two points on the line) =================
export interface E2 {
  a: number
  b: number
  c: number
  dec?: boolean
}
// isolate y one move at a time (b y = c - a x, divide by b, each term, work out, x term first): the steps and the start tokens; used by 4.3 exercise 2 and 4.4 exercise 1
export function isolateY(e: { a: number; b: number; c: number }, dec: boolean) {
  const m = -e.a / e.b
  const c0 = e.c / e.b
  const sgn = (t: number, x: string) => `${t < 0 ? '-' : '+'} ${Math.abs(t) === 1 ? '' : num(Math.abs(t), dec)}${x}`
  const mx = (v: number) => (v === 1 ? 'x' : v === -1 ? '-x' : `${num(v, dec)}x`)
  const sm = (v: number) => `${v < 0 ? '-' : '+'} ${mx(Math.abs(v))}`
  const sk = (v: number) => `${v < 0 ? '-' : '+'} ${num(Math.abs(v), dec)}`
  const noK = Math.abs(c0) < 1e-9
  const isolate = [
    {
      label: 'Move the x term to the right side.',
      toks: [...(e.b === 1 ? [] : [{ id: 'i1n', tex: e.b === -1 ? '-' : num(e.b, dec) }]), { id: 'i1y', tex: 'y' }, { id: 'i1g', tex: '=' }, { id: 'i1c', tex: num(e.c, dec) }, { id: 'i1t', tex: sgn(-e.a, 'x') }],
      blanks: [blk('i1t', 'sax', `$\\text{Move } ${mx(e.a)} \\text{ to the right side: } ${num(e.c, dec)} \\ \\square$`, uniq([sgn(e.a, 'x'), sgn(-e.b, 'y'), sgn(e.b, 'y')], (s) => s).filter((s) => s !== sgn(-e.a, 'x')), 'When a term moves to the other side of the equals sign, its sign changes.')],
    },
    {
      label: 'Divide the right side by the number in front of y.',
      onlyFrom: true,
      toks: [{ id: 'j1', tex: 'y' }, { id: 'j2', tex: '=' }, { id: 'j3', tex: `(${num(e.c, dec)}` }, { id: 'j4', tex: `${sgn(-e.a, 'x')})` }, { id: 'j6', tex: `\\div ${num(e.b, dec)}` }],
      blanks: [blk('j6', e.b === 1 ? 'i1y' : 'i1n', `$\\text{What do we divide by? } ${e.b === 1 ? '' : e.b === -1 ? '-' : num(e.b, dec)}y \\text{ must become } y$`, uniq([num(-e.b, dec), num(e.a, dec), num(-e.a, dec)].map((s) => `\\div ${s}`), (s) => s).filter((s) => s !== `\\div ${num(e.b, dec)}`), 'To leave y alone, divide both sides by the number in front of y.')],
    },
    {
      label: 'Divide each term by the same number.',
      auto: true,
      landArrows: [{ from: ['j3'], to: ['f1'] }, { from: ['j4'], to: ['f2'] }],
      toks: [{ id: 'f0', tex: 'y' }, { id: 'f0g', tex: '=' }, { id: 'f1', tex: `\\frac{${num(e.c, dec)}}{${num(e.b, dec)}}` }, { id: 'f2', tex: `+ \\frac{${mx(-e.a)}}{${num(e.b, dec)}}` }],
      blanks: [],
    },
    {
      label: `Work out each fraction.`,
      landArrows: [],
      toks: [{ id: 'i2a', tex: 'y' }, { id: 'i2g', tex: '=' }, { id: 'i2k', tex: num(c0, dec) }, { id: 'i2m', tex: sm(m) }],
      blanks: [
        blk('i2k', 'f1', `$${'\\frac{' + num(e.c, dec) + '}{' + num(e.b, dec) + '}'}$`, uniq([num(-c0, dec), num(e.c, dec), num(e.b, dec), num(c0 + 1, dec)], (s) => s).filter((s) => s !== num(c0, dec)), 'Divide the number on the top by the number on the bottom.'),
        blk('i2m', 'f2', `$${'\\frac{' + mx(-e.a) + '}{' + num(e.b, dec) + '}'}$`, uniq([sm(-m), sm(-e.a), sm(e.a), sm(m === -1 ? 2 : m + 1)], (s) => s).filter((s) => s !== sm(m)), 'Divide the number in front of x by the number in front of y.'),
      ],
    },
    {
      label: 'Write the x term first.',
      auto: true,
      landArrows: [],
      toks: [{ id: 'r0', tex: 'y' }, { id: 'r0g', tex: '=' }, { id: 'r1m', tex: mx(m) }, ...(noK ? [] : [{ id: 'r1k', tex: sk(c0) }])],
      blanks: [],
    },
  ]
  const startToks = [{ id: 'sax', tex: `${e.a < 0 ? '-' : ''}${mx(Math.abs(e.a))}` }, { id: 'srest', tex: `{}${e.b < 0 ? '-' : '+'} ${Math.abs(e.b) === 1 ? '' : num(Math.abs(e.b), dec)}y = ${num(e.c, dec)}` }]
  return { startToks, isolate, mx, sk, noK, m, c0 }
}

export function mk2(e: E2, key: string): It {
  const dec = !!e.dec
  const m = -e.a / e.b
  const c0 = e.c / e.b
  const pts = lattice(m, c0)
  if (pts.length < 2) throw new Error(`no points for ${JSON.stringify(e)}`)
  const [p1, p2] = pickTwo(pts)
  const eq = eqStd(e.a, e.b, e.c, dec)
  const d = D({ m, c: c0 })
  const ans = pairTex(p1, p2)
  const { startToks, isolate, mx, sk, noK } = isolateY(e, dec)
  const step = (id: string, p: P, route: 'left' | 'right') => ({
    label: `The point for x = ${p[0]}`,
    figArrows: [{ from: `${id}b`, pt: route === 'left' ? 0 : 1, route }],
    toks: [{ id: `${id}a`, tex: 'y' }, { id: `${id}g`, tex: '=' }, { id: `${id}b`, tex: n4(p[1]) }],
    blanks: [blk(`${id}b`, 'r1m', `$\\text{When } x = ${p[0]}\\text{: } y = ${num(m, dec)}\\cdot ${par(p[0], dec)}${noK ? '' : ` ${sk(c0)}`} = \\square$`, [n4(-p[1]), n4(p[1] + 1), n4(p[1] - 1), n4((e.c + e.a * p[0]) / e.b)], 'Put the x-value in y = mx + b and work it out.')],
  })
  return drawIt(d, p1, p2, `Graph the equation ${eq}. Click two points on the line, then press Submit.`, { short: eq, startToks, key, answer: ans, wrong: pairWrong(p1, p2).filter((s) => s !== ans), steps: [...isolate, step('u1', p1, 'left'), step('u2', p2, 'right')] })
}
// equations with a, b from the lists and a whole-number point on the line (so that two points can be clicked)
export const g2 = (as: number[], bs: number[], dec = false): E2[] =>
  as.flatMap((a) => bs.flatMap((b) => range(-3, 3).flatMap((x0) => range(-4, 4).map((y0): E2 => ({ a, b, c: a * x0 + b * y0, dec }))))).filter((e) => lattice(-e.a / e.b, e.c / e.b).length >= 2)
const E2_ROWS: [string, E2, E2[]][] = [
  ['a', { a: 2, b: 3, c: 6 }, g2([1, 2, 3, -1, -2], [2, 3, -2, -3])],
  ['b', { a: 2, b: 1, c: -4 }, g2([2, 3, -2, -3, 1, -1], [1])],
  ['c', { a: 2, b: -0.5, c: 2 }, g2([2, 1, 3, -2, 4], [-1 / 2, 1 / 2, -1 / 3, 1 / 3])],
  ['d', { a: 3, b: 2, c: 5 }, g2([3, 2, 4, 5, -3], [2])],
  ['e', { a: 1, b: -0.4, c: 2, dec: true }, g2([1, 2, 0.5], [-0.4, 0.4, -0.2, 0.5], true)],
  ['f', { a: 2, b: 1, c: -1 }, g2([2, 3, 1, -2], [1])],
  ['g', { a: 0.75, b: 1, c: 1 }, g2([3 / 4, 1 / 2, 1 / 3, 2 / 3, -1 / 2], [1])],
  ['h', { a: 1, b: -1, c: 2 }, g2([1, 2, -1], [-1, -2, 1])],
  ['i', { a: 0.4, b: -1, c: 2, dec: true }, g2([0.4, 0.5, 0.2, 0.25], [-1], true)],
  ['j', { a: 1, b: 1, c: 2 }, g2([1, 2, 3], [1, 2])],
]
export const e2id = (e: E2) => JSON.stringify(e)

// ================= exercise 3: graph x = k or y = k =================
interface E3 {
  kind: 'x' | 'y'
  v: number
}
function mk3(e: E3, key: string): It {
  const half = !Number.isInteger(e.v)
  const d = e.kind === 'x' ? D({ vx: e.v, ...(half ? { xs: 0.5, xl: 2 } : {}) }) : D({ m: 0, c: e.v })
  const p1: P = e.kind === 'x' ? [e.v, 2] : [-3, e.v]
  const p2: P = e.kind === 'x' ? [e.v, -3] : [2, e.v]
  const eq = `${e.kind} = ${num(e.v, false)}`
  const ans = pairTex(p1, p2)
  const own = e.kind === 'x' ? 'y' : 'x'
  const step = (id: string, p: P, route: 'left' | 'right', from: string) => ({
    label: `A point with ${own} = ${n4(e.kind === 'x' ? p[1] : p[0])}`,
    figArrows: [{ from: `${id}b`, pt: route === 'left' ? 0 : 1, route }],
    toks: [{ id: `${id}a`, tex: '\\text{the point is}' }, { id: `${id}b`, tex: ptTex(p[0], p[1]) }],
    blanks: [blk(`${id}b`, from, `$\\text{Write the point with } ${own} = ${n4(e.kind === 'x' ? p[1] : p[0])}\\text{ on the line } ${eq}$`, uniq([ptTex(p[1], p[0]), ptTex(p[0], -p[1]), ptTex(-p[0], p[1]), ptTex(p[0] + 1, p[1])], (s) => s).filter((s) => s !== ptTex(p[0], p[1])), `On the line ${eq} every point has ${e.kind} = ${num(e.v, false)}.`)],
  })
  const w: Omit<Wp, 'tex' | 'startToks'> = {
    short: eq,
    key,
    answer: ans,
    wrong: pairWrong(p1, p2).filter((s) => s !== ans),
    steps: [
      { label: 'The line.', toks: [{ id: 'v0a', tex: '\\text{every point has}' }, { id: 'v0b', tex: eq }], blanks: [blk('v0b', 's0', '$\\text{What is the same for every point of the line?}$', [e.kind === 'x' ? `y = ${num(e.v, false)}` : `x = ${num(e.v, false)}`, `${e.kind} = ${n4(-e.v)}`, 'x = y'], `The line ${eq} is ${e.kind === 'x' ? 'vertical' : 'horizontal'}.`)] },
      step('v1', p1, 'left', 'v0b'),
      step('v2', p2, 'right', 'v1b'),
    ],
  }
  return drawIt(d, p1, p2, `Graph: ${eq}. Click two points on the line, then press Submit.`, w, (n: number) => planeSvg(d, [p1, p2].slice(0, Math.max(0, Math.min(n - 1, 2))), n >= 3))
}
const E3_ROWS: [string, E3, E3[]][] = [
  ['a', { kind: 'x', v: 3 }, [-5, -4, -2, -1, 1, 2, 4, 5].map((v): E3 => ({ kind: 'x', v }))],
  ['b', { kind: 'y', v: 3 }, [-5, -4, -2, -1, 1, 2, 4, 5].map((v): E3 => ({ kind: 'y', v }))],
  ['c', { kind: 'x', v: -4 }, [-5, -3, -2, -1, 1, 2, 3, 4, 5].map((v): E3 => ({ kind: 'x', v }))],
  ['d', { kind: 'y', v: -4 }, [-5, -3, -2, -1, 1, 2, 3, 4, 5].map((v): E3 => ({ kind: 'y', v }))],
  ['e', { kind: 'x', v: 3.5 }, [-4.5, -3.5, -2.5, -1.5, -0.5, 0.5, 1.5, 2.5, 4.5, 5.5].map((v): E3 => ({ kind: 'x', v }))],
  ['f', { kind: 'x', v: 0 }, [0, 0.5, -0.5, 1, -1, 2, -2, 3, -3, 4].map((v): E3 => ({ kind: 'x', v }))],
  ['g', { kind: 'y', v: 0 }, [0, 0.5, -0.5, 1, -1, 2, -2, 3, -3, 4].map((v): E3 => ({ kind: 'y', v }))],
]
const e3id = (e: E3) => JSON.stringify(e)

// ================= exercise 4: use the graph to complete the table (the table is typed into) =================
interface E4 {
  p: number
  q: number // the slope p / q
  b: number
  given: 'x' | 'y'
  vals: number[] // the given x (multiples of q) or y values
}
function mk4(e: E4, key: string): It {
  const m = e.p / e.q
  const d = D({ m, c: e.b })
  const miss = e.vals.map((v) => (e.given === 'x' ? m * v + e.b : (v - e.b) / m))
  const lists = (f: (i: number, v: number) => number) => miss.map((v, i) => num(f(i, v), false)).join(',\\ ')
  const ans = lists((_, v) => v)
  const wrong = uniq([lists((i, v) => (i === 0 ? v + 1 : v)), lists((i, v) => (i === 1 ? -v : v)), lists((i, v) => (i === 2 ? v + 1 : v)), lists((_, v) => -v), lists((i, v) => (i === 1 ? v + 1 : v))], (s) => s).filter((s) => s !== ans)
  const fill: Fill = { rows: [{ label: 'x', cells: e.vals.map((v) => (e.given === 'x' ? num(v, false) : null)) }, { label: 'y', cells: e.vals.map((v) => (e.given === 'y' ? num(v, false) : null)) }], answers: miss }
  const steps = e.vals.map((v, i) => ({
    label: e.given === 'x' ? `x = ${num(v, false)}` : `y = ${num(v, false)}`,
    toks: [{ id: `t${i}a`, tex: e.given === 'x' ? 'y' : 'x' }, { id: `t${i}g`, tex: '=' }, { id: `t${i}b`, tex: num(miss[i], false) }],
    blanks: [blk(`t${i}b`, 's0', e.given === 'x' ? `$\\text{Go to } x = ${num(v, false)}\\text{ on the horizontal axis, up or down to the line. What is } y\\text{?}$` : `$\\text{Go to } y = ${num(v, false)}\\text{ on the vertical axis, across to the line. What is } x\\text{?}$`, [num(-miss[i], false), num(miss[i] + 1, false), num(miss[i] - 1, false), num(v, false)].filter((s) => s !== num(miss[i], false)), 'Read the coordinate of the point where the line is.')],
  }))
  return { w: { tex: text('Use the graph to complete the table.'), short: '\\text{the graph}', key, answer: ans, wrong, steps }, fig: planeSvg(d, []), showTex: true, fill }
}
const g4 = (pq: [number, number][], bs: number[], given: 'x' | 'y', valSets: number[][]): E4[] =>
  pq
    .flatMap(([p, q]) => bs.flatMap((b) => valSets.map((vs): E4 => ({ p, q, b, given, vals: given === 'x' ? vs.map((v) => v * q) : vs.map((v) => +((p / q) * v * q + b).toFixed(6)) }))))
    .filter((e) => lattice(e.p / e.q, e.b).length >= 3 && (e.given === 'x' ? e.vals.every((v) => Math.abs(v) <= 6 && Math.abs((e.p / e.q) * v + e.b) <= 6) : e.vals.every((v) => Math.abs(v) <= 6 && Math.abs((v - e.b) / (e.p / e.q)) <= 6)))
const SL4: [number, number][] = [[1, 1], [2, 1], [-1, 1], [-2, 1], [3, 1], [1, 2], [-1, 2], [3, 2], [-3, 2], [2, 3]]
const V4 = [[-2, 0, 2], [-1, 0, 1], [-2, -1, 1], [0, 1, 2], [-1, 1, 2], [-2, 1, 2]]
const E4_ROWS: [string, E4, E4[]][] = [
  ['a', { p: 2, q: 1, b: -1, given: 'x', vals: [-2, 0, 2] }, g4(SL4, [-2, -1, 0, 1, 2, 3], 'x', V4)],
  ['b', { p: -1, q: 1, b: 2, given: 'x', vals: [-1, 0, 3] }, g4(SL4, [-3, -2, -1, 0, 1, 2, 3], 'x', V4)],
  ['c', { p: 1, q: 1, b: -2, given: 'y', vals: [-3, -1, 1] }, g4(SL4, [-2, -1, 0, 1, 2], 'y', V4)],
  ['d', { p: -2, q: 1, b: 1, given: 'y', vals: [3, 1, -1] }, g4(SL4, [-2, -1, 0, 1, 2, 3], 'y', V4)],
]
const e4id = (e: E4) => JSON.stringify(e)

// ================= exercise 5: draw a line parallel to the given one through the given point =================
interface E5 {
  std: boolean // the given line is a x + b y = c, else y = m x + k
  m: number
  k: number
  a: number
  b: number
  c: number
  x0: number
  y0: number
}
function mk5(e: E5, key: string): It {
  const m = e.std ? -e.a / e.b : e.m
  const c0 = e.y0 - m * e.x0
  const pts = lattice(m, c0)
  if (pts.length < 2) throw new Error(`no points for ${JSON.stringify(e)}`)
  const eq = e.std ? eqStd(e.a, e.b, e.c, false) : slopeTex(e.m, e.k)
  const d = D({ m, c: c0 })
  // the second point: the grid point of the line next to the given one (one run and one rise away)
  const g: P = [e.x0, e.y0]
  const second = pts.filter((p) => p[0] !== g[0]).sort((a, b) => Math.abs(a[0] - g[0]) - Math.abs(b[0] - g[0]) || b[0] - a[0])[0]
  const ans = pairTex(g, second)
  const dx = second[0] - g[0]
  const dy = second[1] - g[1]
  const move = (v: number, pos: string, neg: string) => `${v < 0 ? neg : pos} ${Math.abs(v)}`
  const secondWrong = uniq([[g[0] + dx, g[1] - dy], [g[0] + dy, g[1] + dx], [g[0] - dx, g[1] + dy], [g[0] + dx, g[1] + dy + 1]].map(([x, y]) => ptTex(x, y)), (s) => s).filter((s) => s !== ptTex(second[0], second[1]))
  const mWrong = [num(-m, false), num(1 / m, false), num(-1 / m, false), n4(e.std ? e.a : e.k)]
  const wrong = uniq([pairTex(g, [second[0], -second[1]]), pairTex(g, [g[0] + dy, g[1] + dx]), pairTex(g, [g[0] + dx, g[1] - dy])], (s) => s).filter((s) => s !== ans)
  const steps = [
    { label: 'The slope.', toks: [{ id: 'z1a', tex: 'm' }, { id: 'z1g', tex: '=' }, { id: 'z1b', tex: num(m, false) }], blanks: [blk('z1b', 's0', e.std ? `$\\text{The slope of } ${eq}\\text{: } -\\dfrac{${num(e.a, false)}}{${num(e.b, false)}} = \\square$` : `$\\text{The slope of } ${eq}\\text{ is the number in front of } x$`, mWrong.filter((s) => s !== num(m, false)), 'Parallel lines have the same slope.')] },
    {
      label: 'Use the point and the slope.',
      figArrows: [{ from: 'z2b', pt: 1, route: 'right' as const }],
      toks: [{ id: 'z2a', tex: '\\text{next point}' }, { id: 'z2b', tex: ptTex(second[0], second[1]) }],
      blanks: [blk('z2b', 'z1b', `$\\text{Start at } ${ptTex(g[0], g[1])}\\text{ with slope } ${num(m, false)}\\text{: ${move(dx, 'right', 'left')}, ${move(dy, 'up', 'down')}}$`, secondWrong, 'The slope is the change in y for each change in x. Start at the given point and move.')],
    },
  ]
  const w: Omit<Wp, 'tex' | 'startToks'> = { short: eq, key, answer: ans, wrong, steps }
  return drawIt(d, g, second, `Sketch a graph of a linear equation parallel to ${eq} that passes through the point (${e.x0}, ${e.y0}). Click two points, then press Submit.`, w, (n: number) => planeSvg(d, n >= 2 ? [g, second] : [g], n >= 2))
}
const slopeForm = (m: number, k: number): E5 => ({ std: false, m, k, a: 0, b: 0, c: 0, x0: 0, y0: 0 })
const g5 = (ms: number[], ks: number[], pts: P[]): E5[] => ms.flatMap((m) => ks.flatMap((k) => pts.map(([x0, y0]): E5 => ({ ...slopeForm(m, k), x0, y0 })))).filter((e) => lattice(e.m, e.y0 - e.m * e.x0).length >= 2)
const g5s = (as: number[], bs: number[], cs: number[], pts: P[]): E5[] => as.flatMap((a) => bs.flatMap((b) => cs.flatMap((c) => pts.map(([x0, y0]): E5 => ({ std: true, m: 0, k: 0, a, b, c, x0, y0 }))))).filter((e) => lattice(-e.a / e.b, e.y0 + (e.a / e.b) * e.x0).length >= 2)
const PTS5: P[] = range(-3, 3).flatMap((x) => range(-3, 3).map((y): P => [x, y]))
const E5_ROWS: [string, E5, E5[]][] = [
  ['a', { ...slopeForm(3, 4), x0: 0, y0: 0 }, g5([1, 2, 3, -1, -2, 4], [-4, -2, 1, 3, 4], PTS5)],
  ['b', { ...slopeForm(-3, -4), x0: 0, y0: 2 }, g5([-3, -2, -1, -4, 2, 1], [-4, -2, 1, 3, 4], PTS5)],
  ['c', { std: true, m: 0, k: 0, a: 2, b: -3, c: 0, x0: 1, y0: -2 }, g5s([2, 1, 3, -2], [-3, 3, 2, -2], [0, 6, 3, -3], PTS5)],
  ['d', { std: true, m: 0, k: 0, a: 1, b: 2, c: 6, x0: -1, y0: -2 }, g5s([1, 2, -1, 3], [2, -2, 4, 3], [6, 4, 2, 8], PTS5)],
]
const e5id = (e: E5) => JSON.stringify(e)

export const EX_GRAPH43 = [
  build(1, 'Choose the answer.', E1_ROWS, mk1, e1id, 'Is it a solution?', 1000, '4.3'),
  build(2, 'Graph the equation.', E2_ROWS, mk2, e2id, 'Graph the equation', 2000, '4.3'),
  build(3, 'Graph the line.', E3_ROWS, mk3, e3id, 'Horizontal and vertical lines', 3000, '4.3'),
  build(4, 'Fill in the table.', E4_ROWS, mk4, e4id, 'Read the graph', 4000, '4.3'),
  build(5, 'Draw the parallel line.', E5_ROWS, mk5, e5id, 'Parallel line', 5000, '4.3'),
]

// ================= challenge exercise (4.3 exercise 1, harder): bigger coefficients and coordinates, fractional coefficients; optional extra practice, own progress (no 11) =================
const H1_ROWS: [string, E1, E1[]][] = [
  ['a', { k: 'std', a: 7, b: -9, c: -61, x: 4, y: 5 }, g1('std', [5, 6, 7, 9, -5, -7], [-9, -8, -7, 7, 8, 9], [-8, -5, 4, 7, 9], [-7, -4, 3, 6, 8], [0, 0, 1, -3])],
  ['b', { k: 'std', a: 3 / 4, b: -1 / 2, c: 4, x: 8, y: 4 }, g1('std', [3 / 4, 1 / 4, -3 / 4, 5 / 4, -1 / 4], [-1 / 2, 1 / 2, 3 / 2, -3 / 2], [-8, -4, 4, 8, 12], [-6, -2, 2, 6, 10], [0, 0, 1, -2])],
  ['c', { k: 'rev', a: 6, b: 7, c: 5, x: 2, y: -1 }, g1('rev', [5, 6, 7, 8, -5, -6], [5, 6, 7, 9, -7, -8], [-7, -4, 3, 5, 8], [-8, -5, 2, 4, 7], [0, 0, 1, -2])],
  ['d', { k: 'std', a: 2 / 3, b: 3 / 5, c: 12, x: 9, y: 10 }, g1('std', [2 / 3, 4 / 3, -2 / 3, 5 / 3], [3 / 5, -3 / 5, 2 / 5, -4 / 5], [-9, -6, 6, 9, 12], [-10, -5, 5, 10, 15], [0, 0, 1, -2])],
]
export const EX_GRAPH43H = [
  build(11, 'Choose the answer.', H1_ROWS, mk1, e1id, 'Is it a solution? (challenge)', 1011, '4.3'),
]
