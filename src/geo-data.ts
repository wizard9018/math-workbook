// Grade 9 5.2 exercises 8, 9 and 10 (bank/G9-ch5/s2/items.json): the perimeter of a figure with polynomial sides, and the surface area of a solid.
// Every figure is a list of PIECES (a side, a curved part, a face) whose lengths / areas add up to the answer. Some pieces are given by the picture,
// the others are asked one by one in the lesson ("What is the length of the missing side?"); then the brackets come off and the like terms are collected.
// The question is the textbook figure with other lengths: Gemini writes the lengths (gen-variants-geo.py, variants-geo.json), this file computes every answer.
// The number pi is a factor (see simplify-data.ts), so 2πr + 8π is an ordinary polynomial.
// Imported by: quiz.tsx. Shape: exercise.ts, figures: geo-figures.ts.
import type { Exercise, Practice, Question } from './exercise'
import type { Lesson, Step, Tok } from './lessons'
import GEO from './variants-geo.json'
import GEO53 from './variants53geo.json'
import { drawFigure } from './geo-figures'
import { collectPart, finalChoices, mk, parseSafe, pick, polyTex, q, simplified, simpTex, termTex, topTen, varTex } from './simplify-data'
import type { Mono, Q } from './simplify-data'

// ---- a small polynomial algebra on lists of terms ----
type P = Mono[]
const qmul = (a: Q, b: Q): Q => q(a[0] * b[0], a[1] * b[1], !!(a[2] || b[2]))
const norm = (ms: P): P => simplified(ms).map((t) => mk(t.c, varTex(t.vs)))
const padd = (...ps: P[]): P => norm(ps.flat())
const pscale = (a: P, k: Q): P => a.map((m) => mk(qmul(m.c, k), m.raw))
const psub = (a: P, b: P): P => padd(a, pscale(b, q(-1)))
const pmul = (a: P, b: P): P => norm(a.flatMap((x) => b.map((y) => mk(qmul(x.c, y.c), x.raw + y.raw))))
const ppi = (a: P): P => norm(a.map((m) => mk(m.c, `π${m.raw}`)))
const pnum = (n: number): P => [mk(q(n), '')]
const half = (a: P) => pscale(a, q(1, 2))
const two = (a: P) => pscale(a, q(2))
const flipTerms = (ms: P): P => pscale(ms, q(-1))
const line = (v: P) => polyTex(v.map((m) => ({ c: m.c, v: m.raw })))
// a number: the value when the polynomial has no letters
const num = (a: P): number | null => (a.length === 1 && !/[a-zπ]/.test(a[0].raw) ? a[0].c[0] / a[0].c[1] : a.length === 0 ? 0 : null)
// numeric value with every letter = 10: used to check that a question makes sense (the lengths are positive)
const evalP = (a: P) => a.reduce((s, m) => s + (m.c[0] / m.c[1]) * m.vs.reduce((p, [l, e]) => p * (l === 'π' ? Math.PI : 10) ** e, 1), 0)
const PD = (s: string): P => {
  const ms = parseSafe(s)
  if (!ms) throw new Error(`bad length ${s}`)
  return ms
}

// ---- pieces ----
interface Ask {
  prompt: string
  hint: string
  example?: string
  expr?: string // the arithmetic of this very question (TeX): the wrong-answer hint starts with "What is <expr>?"
}
// TeX of the arithmetic of one question, so that the wrong-answer hint is about THIS question: "What is 4m × 4m?"
const par = (p: P) => (p.length > 1 ? `(${line(p)})` : line(p))
const prod = (...ps: P[]) => ps.map(par).join(' \\times ')
const pw2 = (p: P) => (/^([a-z]|\d+(\.\d+)?)$/.test(line(p)) ? `${line(p)}^2` : `(${line(p)})^2`)
const HALF_2PI = (r: P) => `\\tfrac{1}{2} \\times 2 \\times \\pi \\times ${par(r)}`
const E = (ask: Ask, expr: string): Ask => ({ ...ask, expr })
interface Piece {
  value: P
  copies: number
  sign: 1 | -1
  ask?: Ask
  wrongs?: P[] // tempting wrong values for the question about this piece
}
const given = (value: P, copies = 1): Piece => ({ value, copies, sign: 1 })
const asked = (value: P, copies: number, ask: Ask, wrongs: P[] = [], sign: 1 | -1 = 1): Piece => ({ value, copies, sign, ask, wrongs })

const A = {
  missing: (what: string, example?: string): Ask => ({ prompt: `What is the length of ${what}?`, hint: 'The whole length is the sum of its parts: take away the part you know.', example: example ?? '10 - 7 = 3' }),
  arc: (what = 'this curved part'): Ask => ({ prompt: `What is the length of ${what}?`, hint: 'A semicircle is half of a circle (2πr): its length is πr.', example: '\\tfrac{1}{2}\\times 2\\pi r = \\pi r' }),
  circle: (which: string): Ask => ({ prompt: `What is the distance around ${which}?`, hint: 'The distance around a circle is 2πr.', example: 'C = 2\\pi r' }),
  diameter: { prompt: 'What is the length of each straight side?', hint: 'The straight side is as long as the diameter: 2 times the radius.', example: 'd = 2r' } as Ask,
  slant: { prompt: 'What is the length of the slanted side?', hint: 'In a right triangle: a² + b² = c².', example: '3^2 + 4^2 = 5^2' } as Ask,
  leg: { prompt: 'How much longer is the left side than the right side?', hint: 'The missing leg of the right triangle: c² − a² = b².', example: '13^2 - 12^2 = 5^2' } as Ask,
  rect: (face: string): Ask => ({ prompt: `What is the area of ${face}?`, hint: 'The area of a rectangle is length times width.', example: '5 \\times 2 = 10' }),
  tri: { prompt: 'What is the area of one triangle face?', hint: 'The area of a triangle is half of base times height.', example: '\\tfrac{1}{2}\\times 3\\times 4 = 6' } as Ask,
  disc: (which: string): Ask => ({ prompt: `What is the area of ${which}?`, hint: 'The area of a circle is πr².', example: 'A = \\pi r^2' }),
  curved: (which: string): Ask => ({ prompt: `What is the area of ${which}?`, hint: 'The curved side unrolls into a rectangle: 2πr times the height.', example: 'A = 2\\pi r \\times h' }),
  ring: { prompt: 'What is the area of one ring end?', hint: 'The ring is the big circle without the small circle: πR² − πr².', example: '\\pi R^2 - \\pi r^2' } as Ask,
}

// ---- the 24 questions ----
interface Slot {
  kind: string // the figure
  dims: string[] // the lengths of the textbook question, in the order of the labels of the figure
  pieces: (d: P[]) => Piece[]
  count?: 'sides' | 'faces' // the lesson starts with "How many sides / faces does it have?" (the number of its added pieces)
  ok?: (d: P[]) => boolean // the lengths fit the shape (a Pythagorean triple ...)
  ref?: { label: string; tex: string }[]
}
const hypotenuse = (a: P, b: P): number | null => {
  const [x, y] = [num(a), num(b)]
  if (x === null || y === null) return null
  const h = Math.sqrt(x * x + y * y)
  return Number.isInteger(h) ? h : null
}
const leg = (c: P, a: P): number | null => {
  const [x, y] = [num(c), num(a)]
  if (x === null || y === null || x <= y) return null
  const h = Math.sqrt(x * x - y * y)
  return Number.isInteger(h) ? h : null
}
const CIRCLE_REF = [{ label: 'Circle: distance around', tex: '2\\pi r' }, { label: 'Circle: area', tex: '\\pi r^2' }]

function cuboid([w, h, d]: P[]): Piece[] {
  return [
    asked(pmul(w, h), 2, E(A.rect('the front face'), prod(w, h)), [padd(w, h), two(pmul(w, h))]),
    asked(pmul(w, d), 2, E(A.rect('the top face'), prod(w, d)), [padd(w, d), two(pmul(w, d))]),
    asked(pmul(h, d), 2, E(A.rect('the side face'), prod(h, d)), [padd(h, d), two(pmul(h, d))]),
  ]
}
function cylinder(r: P, h: P): Piece[] {
  return [
    asked(ppi(pmul(r, r)), 2, E(A.disc('one round end'), `\\pi \\times ${pw2(r)}`), [two(ppi(r)), pmul(r, r)]),
    asked(two(ppi(pmul(r, h))), 1, E(A.curved('the curved side'), `2 \\times \\pi \\times ${par(r)} \\times ${par(h)}`), [ppi(pmul(r, h)), two(pmul(r, h))]),
  ]
}

const SLOTS: Record<string, Record<string, Slot>> = {
  '8': {
    a: { kind: 'square', count: 'sides', dims: ['2x-1'], pieces: ([s]) => [given(s, 4)] },
    b: { kind: 'triangle', count: 'sides', dims: ['3x+2', '2x+1', '4x-3'], pieces: ([a, b, c]) => [given(a), given(b), given(c)] },
    c: { kind: 'rectangle', count: 'sides', dims: ['2x+4', 'x-3'], pieces: ([w, h]) => [given(w, 2), given(h, 2)] },
    d: { kind: 'trapezoid', count: 'sides', dims: ['2x-1', 'x', 'x-3', '4x+3'], pieces: ([t, l, r, b]) => [given(t), given(l), given(r), given(b)] },
    e: { kind: 'kite', count: 'sides', dims: ['x-2', '2x+3'], pieces: ([a, b]) => [given(a, 2), given(b, 2)] },
    f: { kind: 'semis4', dims: ['x+2'], ref: CIRCLE_REF, pieces: ([r]) => [asked(ppi(r), 4, E(A.arc('one curved part'), HALF_2PI(r)), [r, two(ppi(r))])] },
    g: { kind: 'semis22', dims: ['2x', 'x'], ref: CIRCLE_REF, pieces: ([big, small]) => [asked(ppi(big), 2, E(A.arc('a big curved part'), HALF_2PI(big)), [big, two(ppi(big))]), asked(ppi(small), 2, E(A.arc('a small curved part'), HALF_2PI(small)), [small, two(ppi(small))])] },
    h: { kind: 'arch', dims: ['r+1'], ref: CIRCLE_REF, pieces: ([r]) => [asked(two(r), 3, E(A.diameter, `2 \\times ${par(r)}`), [r, pscale(r, q(3))]), asked(ppi(r), 1, E(A.arc('the curved part'), HALF_2PI(r)), [r, two(ppi(r))])] },
  },
  '9': {
    a: { kind: 'chain', count: 'sides', dims: ['3x', 'x', '6', 'x', '4', '3'], pieces: ([w1, h1, w2, h2, w3, h3]) => [given(w1, 2), given(h1, 2), given(w2, 2), given(h2, 2), given(w3, 2), given(h3, 2)] },
    b: { kind: 'skew', count: 'sides', dims: ['5a', '3a', '2a', 'a', '4', '1/2a', 'a', '3'], pieces: (d) => d.map((v) => given(v)) },
    c: {
      kind: 'circles3',
      dims: ['r', '3', '1'],
      ref: CIRCLE_REF,
      pieces: ([r1, r2, r3]) => [
        asked(two(ppi(r1)), 1, E(A.circle('the first circle'), `2 \\times \\pi \\times ${par(r1)}`), [ppi(r1), two(r1)]),
        asked(two(ppi(r2)), 1, E(A.circle('the second circle'), `2 \\times \\pi \\times ${par(r2)}`), [ppi(r2), two(r2)]),
        asked(two(ppi(r3)), 1, E(A.circle('the third circle'), `2 \\times \\pi \\times ${par(r3)}`), [ppi(r3), two(r3)]),
      ],
    },
    d: {
      kind: 'rectSquare',
      count: 'sides',
      dims: ['12', 'x', '2'],
      ok: ([w, , s]) => evalP(w) > evalP(s),
      pieces: ([w, h, s]) => [given(w), given(h), asked(psub(w, s), 1, E(A.missing('the left part of the top', '12 - 2 = 10'), `${par(w)} - ${par(s)}`), [padd(w, s), w]), given(s, 2), asked(padd(h, s), 1, E(A.missing('the whole right side', 'x + 2'), `${par(h)} + ${par(s)}`), [h, psub(h, s)])],
    },
    e: {
      kind: 'lshape',
      count: 'sides',
      dims: ['x', '4', '6'],
      pieces: ([s, across, down]) => [given(s, 2), asked(psub(s, across), 1, E(A.missing('the bottom side', 'x - 4'), `${par(s)} - ${par(across)}`), [padd(s, across), s]), given(down), given(across), asked(psub(s, down), 1, E(A.missing('the upper right side', 'x - 6'), `${par(s)} - ${par(down)}`), [padd(s, down), s])],
    },
    f: { kind: 'stadium', dims: ['r', '6'], ref: CIRCLE_REF, pieces: ([r, len]) => [given(len, 2), asked(ppi(r), 2, E(A.arc('one curved end'), HALF_2PI(r)), [r, two(ppi(r))])] },
    g: {
      kind: 'pentagon',
      count: 'sides',
      dims: ['x', '4', '3'],
      ok: ([, w, h]) => hypotenuse(w, h) !== null,
      pieces: ([s, w, h]) => [
        given(s, 2),
        asked(psub(s, h), 1, E(A.missing('the right side', 'x - 3'), `${par(s)} - ${par(h)}`), [padd(s, h), s]),
        asked(pnum(hypotenuse(w, h) ?? 0), 1, E(A.slant, `\\sqrt{${line(w)}^2 + ${line(h)}^2}`), [padd(w, h), pnum((num(w) ?? 0) * (num(h) ?? 0))]),
        asked(psub(s, w), 1, E(A.missing('the bottom side', 'x - 4'), `${par(s)} - ${par(w)}`), [padd(s, w), s]),
      ],
    },
    h: {
      kind: 'rtrap',
      count: 'sides',
      dims: ['12', 'x', '13'],
      ok: ([top, , slant]) => leg(slant, top) !== null,
      pieces: ([top, x, slant]) => [given(top), given(x), given(slant), asked(padd(x, pnum(leg(slant, top) ?? 0)), 1, E(A.leg, `${par(x)} + \\sqrt{${line(slant)}^2 - ${line(top)}^2}`), [padd(x, slant), padd(x, pnum((num(slant) ?? 0) - (num(top) ?? 0)))])],
    },
  },
  '10': {
    a: { kind: 'cuboid', count: 'faces', dims: ['2', '5', 'x'], pieces: cuboid },
    b: { kind: 'cuboid', count: 'faces', dims: ['x', 'x', '3'], pieces: cuboid },
    c: { kind: 'cuboid', count: 'faces', dims: ['3x', '3', '2'], pieces: cuboid },
    d: {
      kind: 'prism',
      count: 'faces',
      dims: ['4', '3', 'x'],
      ok: ([a, b]) => hypotenuse(a, b) !== null,
      pieces: ([a, b, len]) => {
        const c = pnum(hypotenuse(a, b) ?? 0) // the slanted side of the triangle
        const slanted: Ask = { prompt: 'What is the area of the slanted rectangle face?', hint: 'Its width is the slanted side of the triangle: a² + b² = c². Then length times width.', example: '3^2 + 4^2 = 5^2' }
        return [
          asked(half(pmul(a, b)), 2, E(A.tri, `\\tfrac{1}{2} \\times ${par(a)} \\times ${par(b)}`), [pmul(a, b), padd(a, b)]),
          asked(pmul(a, len), 1, E(A.rect('the rectangle face on the tall side'), prod(a, len)), [padd(a, len)]),
          asked(pmul(b, len), 1, E(A.rect('the rectangle face on the bottom'), prod(b, len)), [padd(b, len)]),
          asked(pmul(c, len), 1, E(slanted, `\\sqrt{${line(a)}^2 + ${line(b)}^2} \\times ${par(len)}`), [padd(c, len), pmul(padd(a, b), len)]),
        ]
      },
    },
    e: { kind: 'cylinder', count: 'faces', dims: ['r', '4'], ref: CIRCLE_REF, pieces: ([r, h]) => cylinder(r, h) },
    f: { kind: 'cylinder', count: 'faces', dims: ['x', 'x'], ref: CIRCLE_REF, pieces: ([r, h]) => cylinder(r, h) },
    g: {
      kind: 'hollow',
      count: 'faces',
      dims: ['8', '4', 'x'],
      ref: CIRCLE_REF,
      pieces: ([outer, inner, h]) => {
        const [R, r] = [half(outer), half(inner)]
        return [
          asked(two(ppi(pmul(R, h))), 1, E(A.curved('the outside curved surface'), `2 \\times \\pi \\times ${par(R)} \\times ${par(h)}`), [ppi(pmul(R, h)), two(pmul(R, h))]),
          asked(two(ppi(pmul(r, h))), 1, E(A.curved('the inside curved surface'), `2 \\times \\pi \\times ${par(r)} \\times ${par(h)}`), [ppi(pmul(r, h)), two(pmul(r, h))]),
          asked(psub(ppi(pmul(R, R)), ppi(pmul(r, r))), 2, E(A.ring, `\\pi \\times ${pw2(R)} - \\pi \\times ${pw2(r)}`), [ppi(pmul(R, R)), psub(ppi(R), ppi(r))]),
        ]
      },
    },
    h: {
      kind: 'boxhole',
      count: 'faces',
      dims: ['6', '1.5', 'x'],
      ref: CIRCLE_REF,
      pieces: ([s, r, len]) => [
        asked(pmul(s, s), 2, E(A.rect('one square end of the box'), prod(s, s)), [two(s)]),
        asked(pmul(s, len), 4, E(A.rect('one side face of the box'), prod(s, len)), [padd(s, len)]),
        asked(two(ppi(pmul(r, len))), 1, E(A.curved('the curved surface of the hole'), `2 \\times \\pi \\times ${par(r)} \\times ${par(len)}`), [ppi(pmul(r, len)), two(pmul(r, len))]),
        asked(ppi(pmul(r, r)), 2, E(A.disc('one round hole'), `\\pi \\times ${pw2(r)}`), [two(ppi(r)), pmul(r, r)], -1),
      ],
    },
  },
}

// ---- 5.3 exercises 9, 10 and 11: surface areas whose lengths are binomials (bank/G9-ch5/s3/items.json) ----
// the slanted side of a right triangle whose legs are whole-number multiples of one letter (4x, 3x -> 5x)
const hypP = (a: P, b: P): P | null => {
  if (a.length !== 1 || b.length !== 1 || a[0].raw !== b[0].raw) return null
  const h = Math.sqrt((a[0].c[0] / a[0].c[1]) ** 2 + (b[0].c[0] / b[0].c[1]) ** 2)
  return Number.isInteger(h) ? [mk(q(h), a[0].raw)] : null
}
const sq = (p: P) => (p.length === 1 && /^\d*[a-z]?$/.test(line(p)) && !/^\d+[a-z]$/.test(line(p)) ? `${line(p)}^2` : `(${line(p)})^2`)
const SEMI: Ask = { prompt: 'What is the area of one semicircle end?', hint: 'A semicircle is half a circle: half of πr².', example: '\tfrac{1}{2}\times \pi r^2' }
const HALF_SIDE = (what: string): Ask => ({ prompt: `What is the area of ${what}?`, hint: 'The curved side is half of the side of a whole cylinder: half of 2πr times the length.', example: '\tfrac{1}{2}\times 2\pi r \times h' })
const SLOTS53: Record<string, Record<string, Slot>> = {
  '9': {
    a: { kind: 'openbox', count: 'faces', dims: ['x', 'x-2', 'x'], pieces: ([w, h, d]) => openbox(w, h, d) },
    b: { kind: 'openbox', count: 'faces', dims: ['x', '2x-3', 'x'], pieces: ([w, h, d]) => openbox(w, h, d) },
  },
  '10': {
    a: { kind: 'prism', count: 'faces', dims: ['4x', '3x', 'x'], ok: ([a, b]) => hypP(a, b) !== null, pieces: prism53 },
    b: { kind: 'prism', count: 'faces', dims: ['5x', '12x', '2x-1'], ok: ([a, b]) => hypP(a, b) !== null, pieces: prism53 },
  },
  '11': {
    a: { kind: 'cylinder', count: 'faces', dims: ['x', '2x+1'], ref: CIRCLE_REF, pieces: ([r, h]) => cylinder(r, h) },
    b: {
      kind: 'halfcyl',
      count: 'faces',
      dims: ['2x', '2x+3'],
      ref: CIRCLE_REF,
      pieces: ([w, len]) => {
        const R = half(w)
        return [
          asked(half(ppi(pmul(R, R))), 2, E(SEMI, `\tfrac{1}{2} \times \pi \times ${pw2(R)}`), [ppi(pmul(R, R)), two(ppi(R))]),
          asked(ppi(pmul(R, len)), 1, E(HALF_SIDE('the curved side'), `\tfrac{1}{2} \times 2 \times \pi \times ${par(R)} \times ${par(len)}`), [two(ppi(pmul(R, len))), ppi(R)]),
          asked(pmul(w, len), 1, E(A.rect('the flat bottom'), prod(w, len)), [padd(w, len)]),
        ]
      },
    },
  },
}
function openbox(w: P, h: P, d: P): Piece[] {
  return [
    asked(pmul(w, d), 1, E(A.rect('the bottom'), prod(w, d)), [padd(w, d), two(pmul(w, d))]),
    asked(pmul(w, h), 2, E(A.rect('the front face'), prod(w, h)), [padd(w, h), two(pmul(w, h))]),
    asked(pmul(h, d), 2, E(A.rect('the side face'), prod(h, d)), [padd(h, d), two(pmul(h, d))]),
  ]
}
function prism53([a, b, len]: P[]): Piece[] {
  const c = hypP(a, b) ?? pnum(0) // the slanted side of the triangle
  const slanted: Ask = { prompt: 'What is the area of the slanted rectangle face?', hint: 'Its width is the slanted side of the triangle: a² + b² = c². Then length times width.', example: '3^2 + 4^2 = 5^2' }
  return [
    asked(half(pmul(a, b)), 2, E(A.tri, `\tfrac{1}{2} \times ${par(a)} \times ${par(b)}`), [pmul(a, b), padd(a, b)]),
    asked(pmul(a, len), 1, E(A.rect('the rectangle face on the tall side'), prod(a, len)), [padd(a, len)]),
    asked(pmul(b, len), 1, E(A.rect('the rectangle face on the bottom'), prod(b, len)), [padd(b, len)]),
    asked(pmul(c, len), 1, E(slanted, `\sqrt{${sq(a)} + ${sq(b)}} \times ${par(len)}`), [padd(c, len), pmul(padd(a, b), len)]),
  ]
}

// ---- the lesson of one question ----
const PH = '\\boxed{\\,?\\,}'

function lessonFor(no: string, part: string, kind: string, labels: string[], pieces: Piece[], idx: number, ref?: Slot['ref'], count?: Slot['count'], sec = '5.2'): Lesson {
  // every copy of every piece, in order; the terms of the whole sum (a subtracted piece has its signs changed)
  const copies = pieces.flatMap((p, pi) => Array.from({ length: p.copies }, () => ({ p, pi })))
  const terms = copies.map(({ p }) => (p.sign === 1 ? p.value : flipTerms(p.value)).map((m) => ({ ...m }))) // every copy has its own terms (the collect steps find a term by its identity)
  const flat: P = terms.flat()
  const { start: flatStart, steps: collect } = collectPart(flat, idx)
  const firstTerm: number[] = [] // the index of the first term of each copy among all the terms
  let n = 0
  terms.forEach((t, k) => {
    firstTerm[k] = n
    n += t.length
  })
  const tokensOf = (k: number) => flatStart.slice(firstTerm[k], firstTerm[k] + terms[k].length)

  const bracketed = pieces.some((p) => p.sign < 0) // only a subtracted piece (the hole of 10h) needs its brackets taken off; a plain sum goes straight to collecting like terms
  const opOf = (k: number): Tok[] => (k > 0 || copies[k].p.sign < 0 ? [{ id: `o${k}`, tex: copies[k].p.sign < 0 ? '-' : '+' }] : [])
  const groupTok = (k: number): Tok => ({ id: `g${k}`, tex: copies[k].p.value.length > 1 || copies[k].p.sign < 0 ? `(${line(copies[k].p.value)})` : line(copies[k].p.value) })

  // start line: the pieces the picture gives, and a box for each piece that has to be worked out
  const start: Tok[] = copies.flatMap(({ p }, k) => {
    if (!bracketed) return p.ask ? [{ id: `q${k}`, tex: PH }] : tokensOf(k)
    return [...opOf(k), p.ask ? { id: `q${k}`, tex: PH } : groupTok(k)]
  })

  const steps: Step[] = []
  const stepPiece: (number | undefined)[] = [] // the piece each step asks about (it is lit up in the figure)
  // the lesson starts with how many sides (a polygon) or faces (a solid) there are to add; the answer opens the line of all of them
  let startLine = start
  if (count) {
    const n = copies.filter((c) => c.p.sign > 0).length // the pieces that are added (a hole that is taken away is not a face)
    const word = count === 'sides' ? 'sides' : 'faces'
    const [options, correct] = pick(String(n), [n - 1, n + 1, n + 2, n - 2, n + 3].filter((x) => x > 1).map(String), idx)
    const hint = count === 'sides' ? 'Count every side of the outline, one by one.' : 'Count every flat face and every curved surface, also the ones you cannot see.'
    const prompt = `How many ${word} does the ${count === 'sides' ? 'shape' : 'solid'} have?`
    startLine = [{ id: 'n0', tex: `\\boxed{\\,?\\,}\\text{ ${word}}` }]
    steps.push({
      focus: ['n0'],
      result: start[0],
      results: start,
      arrows: [],
      say: '',
      calcPrompt: prompt,
      calc: { q: prompt, options, correct, hints: options.map((_, i) => (i === correct ? '' : hint)), spell: hint },
    })
    stepPiece.push(undefined)
  }
  pieces.forEach((p, pi) => {
    if (!p.ask) return
    const ks = copies.map((c, k) => (c.pi === pi ? k : -1)).filter((k) => k >= 0)
    const focus = ks.flatMap((k) => (bracketed ? [...opOf(k).map((o) => o.id), `q${k}`] : [`q${k}`]))
    const results: Tok[] = ks.flatMap((k) => (bracketed ? [...opOf(k), groupTok(k)] : tokensOf(k)))
    const cand = [...(p.wrongs ?? []).map(line), ...finalChoices(p.value, 0)[0]]
    const [options, correct] = pick(line(p.value), cand, idx + pi)
    steps.push({
      from: 'each',
      focus,
      result: bracketed ? groupTok(ks[0]) : tokensOf(ks[0])[0],
      results,
      // one arrow for each box: it points at the term(s) of its own copy
      arrows: ks.map((k) => ({ from: [`q${k}`], to: bracketed ? [`g${k}`] : tokensOf(k).map((t) => t.id) })),
      say: '',
      calcPrompt: p.ask.prompt,
      calc: { q: p.ask.prompt, options, correct, hints: options.map((_, i) => (i === correct ? '' : p.ask!.expr ? `What is $${p.ask!.expr}$? ${p.ask!.hint}` : p.ask!.hint)), spell: p.ask.hint, example: p.ask.expr ? undefined : p.ask.example }, // a question with its own arithmetic needs no fixed example
    })
    stepPiece.push(pi)
  })

  // the brackets come off (a subtracted piece changes its signs)
  if (bracketed) {
    const oldTexts: Record<string, string> = {}
    copies.forEach((c, k) => {
      if (c.p.sign < 0) c.p.value.forEach((m, j) => (oldTexts[tokensOf(k)[j].id] = termTex(m.c, m.raw, firstTerm[k] + j > 0)))
    })
    const [options, correct] = pick(line(flat), [line(copies.flatMap((c) => c.p.value)), line(flipTerms(flat)), line([...flat].reverse()), line(flat.slice(1))], idx + 3)
    const minus = copies.some((c) => c.p.sign < 0)
    const text = minus ? 'A minus in front of a bracket changes every sign inside.' : 'A plus in front of a bracket changes nothing inside.'
    steps.push({
      from: 'each',
      focus: copies.flatMap((_, k) => [...opOf(k).map((o) => o.id), `g${k}`]),
      result: flatStart[0],
      results: flatStart,
      arrows: [],
      morph: { groups: copies.map((_, k) => tokensOf(k).map((t) => t.id)), from: oldTexts },
      say: '',
      calcPrompt: 'Which one is the same without the brackets?',
      calc: { q: 'Which one is the same without the brackets?', options, correct, hints: options.map((_, i) => (i === correct ? '' : text)), spell: text, example: minus ? '-(2x - 3) = -2x + 3' : '+(2x - 3) = 2x - 3' },
    })
  }
  steps.push(...collect)

  return {
    key: `geo${sec}-${no}-${part}`,
    label: part,
    source: `Grade 9, ${sec} exercise ${no}${part}`,
    title: sec === '5.3' || no === '10' ? 'Surface area' : 'Perimeter',
    prompt: sec === '5.3' || no === '10' ? 'Surface area =' : 'Perimeter =',
    answer: simpTex(flat),
    reference: ref,
    figure: drawFigure(kind, labels),
    figureAt: (step) => drawFigure(kind, labels, stepPiece[step]),
    start: startLine,
    steps,
    review: { heading: 'Figures', rows: [] },
  }
}

// the answer, and three wrong ones: a sum that forgets a piece, and the usual slips with the signs
function choicesFor(pieces: Piece[], idx: number): [string[], number] {
  const copies = pieces.flatMap((p) => Array.from({ length: p.copies }, () => p))
  const terms = copies.map((p) => (p.sign === 1 ? p.value : flipTerms(p.value)))
  const flat = terms.flat()
  const forgets = terms.map((_, k) => simpTex(terms.filter((__, j) => j !== k).flat())).filter((s, k, all) => all.indexOf(s) === k)
  return pick(simpTex(flat), [...forgets, simpTex(copies.flatMap((p) => p.value)), ...finalChoices(flat, 0)[0]], idx)
}

// ---- the exercises ----
const PROMPT: Record<string, string> = { '8': 'Find the perimeter of the figure. Simplify.', '9': 'Find the perimeter. Simplify.', '10': 'Find the surface area of the figure. Simplify.' }

// does a set of lengths make a real figure? the lengths and the worked-out pieces are positive, the shape's own rules hold
function sensible(slot: Slot, d: P[], no: string, sec = '5.2'): boolean {
  if (sec === '5.2' && no === '10' && d.some((v) => v.length !== 1)) return false // in the surface area questions every length is a single term (3x, 5, r), never a sum
  if (slot.ok && !slot.ok(d)) return false
  if (d.some((v) => evalP(v) <= 0)) return false
  return slot.pieces(d).every((p) => evalP(p.value) > 0)
}

// Gemini's lengths for one question, each row a list of strings in the order of the labels of the figure
const generatedFor = (no: string, part: string, slot: Slot, sec = '5.2'): P[][] =>
  (((sec === '5.3' ? GEO53 : GEO) as Record<string, Record<string, unknown[]>>)[no]?.[part] ?? [])
    .map((row) => (Array.isArray(row) && row.length === slot.dims.length ? row.map((s) => parseSafe(s)) : null))
    .filter((row): row is P[] => !!row && row.every(Boolean))
    .filter((d) => {
      try {
        return sensible(slot, d, no, sec)
      } catch {
        return false
      }
    })

function build(no: string, sec = '5.2'): Exercise {
  const slots = sec === '5.3' ? SLOTS53 : SLOTS
  const questions: Question[] = Object.entries(slots[no]).map(([part, slot], idx) => {
    const book = slot.dims.map(PD)
    const make = (d: P[], key: string, k: number): Practice => {
      const pieces = slot.pieces(d)
      const labels = d.map(line)
      const [choices, correct] = choicesFor(pieces, idx + k)
      return { tex: labels.join(' ; '), figure: drawFigure(slot.kind, labels), choices, correct, why: '', lesson: () => lessonFor(no, key, slot.kind, labels, slot.pieces(d), idx + k, slot.ref, slot.count, sec) }
    }
    const bank = topTen(generatedFor(no, part, slot, sec), [], (d) => d.map(line).join(' ; '), book)
    return { ...make(book, part, 0), part, practice: bank.map((d, k) => make(d, `${part}${k + 1}`, k + 1)) }
  })
  return { no: Number(no), sec, prompt: sec === '5.3' ? 'Find the surface area of the figure. Simplify.' : PROMPT[no], mathChoices: true, questions }
}

export const EX_GEO = ['8', '9', '10'].map((n) => build(n))
// textbook 9, 10 and 11 are one exercise here: the open box (a, b), the prism (c, d) and the cylinders (e, f)
const [BOX, PRISM, CYL] = [build('9', '5.3'), build('10', '5.3'), build('11', '5.3')]
export const EX_GEO53 = [{ ...BOX, questions: [...BOX.questions, ...PRISM.questions, ...CYL.questions].map((q, i) => ({ ...q, part: 'abcdef'[i] })) }]
