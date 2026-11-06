// Grade 9 6.3 exercises 3 and 5 (bank/G9-ch6/s3/items.json): graph an inequality on a number line (3: choose the right picture) and write the inequality of a number line (5).
// The pictures (number lines with closed / open circles and a thick ray or segment) are drawn here as SVG strings; the choices of exercise 3 are the pictures themselves.
// Exercise 5 of the book has no pictures in the bank, so its five questions are drawn here (one inequality, or between two numbers); the similar questions are made from small tables.
// Lesson 3: write the letter first (a blank for the sign when the number came first), then a closed or open circle and the direction (two blanks), the picture is drawn in the end.
// Lesson 5: the picture is shown; blanks for the sign and the number (two numbers and two signs for "between").
// Imported by: quiz.tsx, check63.ts. Shape: exercise.ts.
import type { Exercise, Practice, Question } from './exercise'
import type { Calc, Lesson, Step, Tok } from './lessons'
import { pick } from './simplify-data'

// ---- the number line picture: from -5 to 5, a, b = the ends of the thick part (null: it goes on to the arrow), ac, bc = closed circle ----
export interface Seg {
  a: number | null
  b: number | null
  ac: boolean
  bc: boolean
}
const X = (v: number) => 20 + (v + 5) * 40
export function numberLine(segs: Seg[]): string {
  const col = '#0284c7'
  const ticks = Array.from({ length: 11 }, (_, i) => i - 5)
    .map((v) => `<line x1="${X(v)}" y1="30" x2="${X(v)}" y2="42" stroke="#475569" stroke-width="2"/><text x="${X(v)}" y="58" text-anchor="middle" font-size="14" fill="#334155">${v}</text>`)
    .join('')
  const parts = segs.map((s) => {
    const x1 = s.a === null ? 24 : X(s.a)
    const x2 = s.b === null ? 416 : X(s.b)
    const arrow = (x: number, dir: number) => `<polygon points="${x},36 ${x - 16 * dir},26 ${x - 16 * dir},46" fill="${col}"/>`
    const dot = (x: number, closed: boolean) => `<circle cx="${x}" cy="36" r="6.5" fill="${closed ? col : '#fff'}" stroke="${col}" stroke-width="3"/>`
    return `<line x1="${x1}" y1="36" x2="${x2}" y2="36" stroke="${col}" stroke-width="6"/>${s.a === null ? arrow(10, -1) : dot(x1, s.ac)}${s.b === null ? arrow(430, 1) : dot(x2, s.bc)}`
  })
  return `<svg viewBox="0 0 440 66" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:420px;height:auto"><line x1="8" y1="36" x2="432" y2="36" stroke="#475569" stroke-width="2"/>${ticks}${parts.join('')}</svg>`
}

type Sym = '<' | '>' | '<=' | '>='
const SYM_TEX: Record<Sym, string> = { '<': '<', '>': '>', '<=': '\\le', '>=': '\\ge' }
const FLIP: Record<Sym, Sym> = { '<': '>', '>': '<', '<=': '>=', '>=': '<=' }
const SYMS: Sym[] = ['>=', '<=', '>', '<']
const segOf = (s: Sym, n: number): Seg => (s === '>=' || s === '>' ? { a: n, b: null, ac: s === '>=', bc: false } : { a: null, b: n, ac: false, bc: s === '<=' })

// ---- exercise 3: x >= -2 (or the number first: 2 1/3 >= c) ----
interface Ln {
  v: string
  sym: Sym // as written
  rev: boolean // the number is written first
  val: number
  vtex: string
}
const lnTex = (l: Ln) => (l.rev ? `${l.vtex} ${SYM_TEX[l.sym]} ${l.v}` : `${l.v} ${SYM_TEX[l.sym]} ${l.vtex}`)
const norm = (l: Ln): Sym => (l.rev ? FLIP[l.sym] : l.sym)
const picOf = (s: Sym, n: number) => numberLine([segOf(s, n)])
const posRight = (s: Sym) => s === '>=' || s === '>'

function wrongPics(l: Ln): string[] {
  const s = norm(l)
  const toggled: Sym = s === '>=' ? '>' : s === '>' ? '>=' : s === '<=' ? '<' : '<='
  return [picOf(FLIP[s], l.val), picOf(toggled, l.val), picOf(s, -l.val), picOf(FLIP[s], -l.val), picOf(s, l.val + (l.val >= 4 ? -1 : 1))]
}
function choices3(l: Ln, idx: number): [string[], number] {
  return pick(picOf(norm(l), l.val), wrongPics(l), idx)
}

function lesson3(l: Ln, key: string, idx: number): Lesson {
  const s = norm(l)
  const steps: Step[] = []
  const blank = (id: string, from: string, prompt: string, right: string, wr: string[], hint: string, salt: number) => {
    const [options, correct] = pick(right, wr.filter((w) => w !== right), idx + salt)
    return { id, from, calc: { q: prompt, options, correct, hints: options.map((_, j) => (j === correct ? '' : hint)), spell: hint } as Calc }
  }
  const start: Tok[] = l.rev ? [{ id: 'n0', tex: l.vtex }, { id: 's0', tex: SYM_TEX[l.sym] }, { id: 'v0', tex: l.v }] : [{ id: 'v0', tex: l.v }, { id: 's0', tex: SYM_TEX[l.sym] }, { id: 'n0', tex: l.vtex }]
  let line = start.map((t) => t.id)
  let sign = 's0'
  if (l.rev) {
    // the letter goes first: the sign turns round
    const b = blank('s1', 's0', `$${l.vtex} ${SYM_TEX[l.sym]} ${l.v} \\;\\to\\; ${l.v}\\ \\square\\ ${l.vtex}$`, SYM_TEX[s], SYMS.filter((x) => x !== s).map((x) => SYM_TEX[x]), `$${l.vtex} ${SYM_TEX[l.sym]} ${l.v} \\;\\text{means}\\; ${l.v} ${SYM_TEX[s]} ${l.vtex}$`, 0)
    const res: Tok[] = [{ id: 'v1', tex: l.v }, { id: 's1', tex: SYM_TEX[s] }, { id: 'n1', tex: l.vtex }]
    steps.push({ focus: line, result: res[0], results: res, blanks: [b], arrows: [{ from: ['s0'], to: ['s1'] }], say: '', calcPrompt: 'The letter first.', calc: b.calc })
    line = res.map((t) => t.id)
    sign = 's1'
  }
  // a closed or open circle, and the direction
  const closed = s === '>=' || s === '<='
  const ci = blank('ci', sign, `$${SYM_TEX[s]} \\;\\to\\; \\square$`, closed ? '\\bullet' : '\\circ', [closed ? '\\circ' : '\\bullet'], '$\\le,\\ \\ge : \\bullet \\qquad <,\\ > : \\circ$', 1)
  const ar = blank('ar', sign, `$${l.v} ${SYM_TEX[s]} \\;\\to\\; \\square$`, posRight(s) ? '\\longrightarrow' : '\\longleftarrow', [posRight(s) ? '\\longleftarrow' : '\\longrightarrow'], '$>,\\ \\ge : \\longrightarrow \\qquad <,\\ \\le : \\longleftarrow$', 2)
  const res2: Tok[] = [{ id: 'v2', tex: l.v }, { id: 's2', tex: SYM_TEX[s] }, { id: 'n2', tex: l.vtex }, { id: 'ci', tex: closed ? '\\bullet' : '\\circ' }, { id: 'ar', tex: posRight(s) ? '\\longrightarrow' : '\\longleftarrow' }]
  steps.push({ focus: line, result: res2[0], results: res2, blanks: [ci, ar], arrows: [{ from: [sign], to: ['ci'] }, { from: [sign], to: ['ar'] }], say: '', calcPrompt: 'Circle and direction.', calc: ci.calc })
  const full = picOf(s, l.val)
  const bare = numberLine([])
  return {
    key: `line3-${key}`,
    label: key,
    source: `Grade 9, 6.3 exercise 3${key}`,
    title: 'Graph',
    prompt: 'Graph:',
    figure: bare,
    figureAt: (k) => (k >= steps.length ? full : bare),
    answer: full,
    start,
    steps,
    review: { heading: 'Number line', rows: [] },
  }
}

const L = (v: string, sym: Sym, val: number, vtex: string, rev = false): Ln => ({ v, sym, rev, val, vtex })
const HALF = [0.5, 1.5, 2.5, 3.5]
const mixedTex = (w: number, n: number, d: number) => `${w}\\frac{${n}}{${d}}`
const LET = ['x', 'y', 'z', 'a', 'b', 'c']
const cross3 = <T,>(syms: Sym[], vals: T[], f: (v: string, s: Sym, x: T) => Ln): Ln[] => LET.flatMap((v) => syms.flatMap((s) => vals.map((x) => f(v, s, x))))
const INTS = [-4, -3, -2, -1, 1, 2, 3, 4]
const BOOK3: [string, Ln, Ln[]][] = [
  ['a', L('x', '>=', -2, '-2'), cross3(SYMS, INTS, (v, s, n) => L(v, s, n, String(n)))],
  ['b', L('y', '<', 4, '4'), cross3(SYMS, INTS, (v, s, n) => L(v, s, n, String(n)))],
  ['c', L('z', '>', 0, '0'), cross3(SYMS, [0, 1, -1, 2, -2, 3], (v, s, n) => L(v, s, n, String(n)))],
  ['d', L('a', '<=', 3, '3'), cross3(SYMS, INTS, (v, s, n) => L(v, s, n, String(n)))],
  ['e', L('b', '>', -0.5, '-\\frac{1}{2}'), cross3(SYMS, [...HALF, ...HALF.map((h) => -h)], (v, s, h) => L(v, s, h, `${h < 0 ? '-' : ''}\\frac{${Math.abs(h) * 2}}{2}`))],
  ['f', L('c', '>=', 7 / 3, mixedTex(2, 1, 3), true), cross3(SYMS, [[1, 1, 3], [1, 2, 3], [2, 1, 3], [2, 2, 3], [3, 1, 3], [1, 1, 2], [2, 1, 2], [3, 1, 4]], (v, s, m) => L(v, s, m[0] + m[1] / m[2], mixedTex(m[0], m[1], m[2]), true))],
  ['g', L('d', '>', -10 / 3, '-\\frac{10}{3}', true), cross3(SYMS, [4, 5, 7, 8, 10, 11, 13], (v, s, n) => L(v, s, -n / 3, `-\\frac{${n}}{3}`, true))],
  ['h', L('e', '<=', 14 / 3, '\\frac{14}{3}', true), cross3(SYMS, [4, 5, 7, 8, 10, 11, 13], (v, s, n) => L(v, s, n / 3, `\\frac{${n}}{3}`, true))],
  ['i', L('f', '>=', -10 / 3, '-3.\\overline{3}', true), cross3(SYMS, [['-3.\\overline{3}', -10 / 3], ['-2.\\overline{6}', -8 / 3], ['1.\\overline{3}', 4 / 3], ['-1.\\overline{6}', -5 / 3], ['2.\\overline{3}', 7 / 3], ['3.\\overline{6}', 11 / 3]] as [string, number][], (v, s, p) => L(v, s, p[1], p[0], true))],
  ['j', L('g', '<', 2.9, '2.9', true), cross3(SYMS, [0.5, 1.5, 2.5, 3.5, 4.5, 2.9, 1.2, 3.7], (v, s, x) => L(v, s, x, String(x), true))],
]
const shuffled = <T,>(a: T[], seed: number): T[] => {
  let s = seed
  const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32)
  return [...a].sort(() => r() - 0.5)
}
function build3(): Exercise {
  const questions: Question[] = BOOK3.map(([part, book, pool], idx): Question => {
    const seen = new Set([lnTex(book)])
    const bank = shuffled(pool, 6330 + idx).filter((x) => !seen.has(lnTex(x)) && !!seen.add(lnTex(x))).slice(0, 10)
    const make = (x: Ln, key: string, k: number): Practice => {
      const [choices, correct] = choices3(x, idx + k)
      return { tex: lnTex(x), choices, correct, why: '', lesson: () => lesson3(x, key, idx + k) }
    }
    return { part, ...make(book, part, 0), practice: bank.map((x, k) => make(x, `${part}${k + 1}`, k + 1)) }
  })
  return { no: 3, sec: '6.3', prompt: 'Graph on the number line.', mathChoices: true, questions }
}

// ---- exercise 5: write the inequality of a number line: x >= -1, or -2 < x <= 3 ----
interface Rg {
  lo: number | null
  hi: number | null
  loc: boolean
  hic: boolean
}
const rgSeg = (r: Rg): Seg => ({ a: r.lo, b: r.hi, ac: r.loc, bc: r.hic })
const rgTex = (r: Rg): string => {
  if (r.lo !== null && r.hi !== null) return `${r.lo} ${r.loc ? '\\le' : '<'} x ${r.hic ? '\\le' : '<'} ${r.hi}`
  if (r.lo !== null) return `x ${r.loc ? '\\ge' : '>'} ${r.lo}`
  return `x ${r.hic ? '\\le' : '<'} ${r.hi}`
}
function choices5(r: Rg, idx: number): [string[], number] {
  const w: string[] = []
  if (r.lo !== null && r.hi !== null) {
    w.push(rgTex({ ...r, loc: !r.loc }), rgTex({ ...r, hic: !r.hic }), rgTex({ ...r, lo: -r.hi, hi: -r.lo, loc: r.hic, hic: r.loc }), `x \\le ${r.lo} \\text{ or } x \\ge ${r.hi}`)
  } else if (r.lo !== null) {
    w.push(`x ${r.loc ? '>' : '\\ge'} ${r.lo}`, `x ${r.loc ? '\\le' : '<'} ${r.lo}`, `x ${r.loc ? '\\ge' : '>'} ${-r.lo}`, `x ${r.loc ? '<' : '\\le'} ${-r.lo}`)
  } else {
    w.push(`x ${r.hic ? '<' : '\\le'} ${r.hi}`, `x ${r.hic ? '\\ge' : '>'} ${r.hi}`, `x ${r.hic ? '\\le' : '<'} ${-r.hi!}`, `x ${r.hic ? '\\ge' : '>'} ${-r.hi!}`)
  }
  return pick(rgTex(r), w, idx)
}
function lesson5(r: Rg, key: string, idx: number): Lesson {
  const both = r.lo !== null && r.hi !== null
  const blank = (id: string, prompt: string, right: string, wr: string[], hint: string, salt: number) => {
    const [options, correct] = pick(right, wr.filter((w) => w !== right), idx + salt)
    return { id, from: 'x0', calc: { q: prompt, options, correct, hints: options.map((_, j) => (j === correct ? '' : hint)), spell: hint } as Calc }
  }
  const nums = (n: number) => [String(-n), String(n + 1), String(n - 1)]
  const hint = (closed: boolean) => (closed ? '$\\bullet \\;\\to\\; \\le,\\ \\ge$' : '$\\circ \\;\\to\\; <,\\ >$')
  const dot = (c: boolean) => (c ? '\\bullet' : '\\circ')
  const blanks: ReturnType<typeof blank>[] = []
  const toks: Tok[] = []
  if (both) {
    const [lo, hi] = [r.lo!, r.hi!]
    blanks.push(blank('n1', `${'$'}${dot(r.loc)} \\text{ at } \\square$`, String(lo), nums(lo), hint(r.loc), 0))
    blanks.push(blank('s1', `$${dot(r.loc)} \\;\\to\\; \\square$`, r.loc ? '\\le' : '<', [r.loc ? '<' : '\\le', r.loc ? '\\ge' : '>'], hint(r.loc), 1))
    blanks.push(blank('s2', `$${dot(r.hic)} \\;\\to\\; \\square$`, r.hic ? '\\le' : '<', [r.hic ? '<' : '\\le', r.hic ? '\\ge' : '>'], hint(r.hic), 2))
    blanks.push(blank('n2', `$${dot(r.hic)} \\text{ at } \\square$`, String(hi), nums(hi), hint(r.hic), 3))
    toks.push({ id: 'n1', tex: String(lo) }, { id: 's1', tex: r.loc ? '\\le' : '<' }, { id: 'x1', tex: 'x' }, { id: 's2', tex: r.hic ? '\\le' : '<' }, { id: 'n2', tex: String(hi) })
  } else {
    const up = r.lo !== null
    const n = (up ? r.lo : r.hi)!
    const closed = up ? r.loc : r.hic
    const right = up ? (closed ? '\\ge' : '>') : closed ? '\\le' : '<'
    blanks.push(blank('s1', `$${dot(closed)}\\ ${up ? '\\longrightarrow' : '\\longleftarrow'} \\;\\to\\; x\\ \\square$`, right, ['\\le', '\\ge', '<', '>'], hint(closed), 0))
    blanks.push(blank('n2', `$${dot(closed)} \\text{ at } \\square$`, String(n), nums(n), hint(closed), 1))
    toks.push({ id: 'x1', tex: 'x' }, { id: 's1', tex: right }, { id: 'n2', tex: String(n) })
  }
  const steps: Step[] = [{ focus: ['x0'], result: toks[0], results: toks, blanks, arrows: blanks.map((b) => ({ from: [b.from], to: [b.id] })), say: '', calcPrompt: 'Read the number line.', calc: blanks[0].calc }]
  return { key: `line5-${key}`, label: key, source: `Grade 9, 6.3 exercise 5${key}`, title: 'Write the inequality', prompt: 'Inequality:', figure: numberLine([rgSeg(r)]), answer: rgTex(r), start: [{ id: 'x0', tex: 'x' }], steps, review: { heading: 'Number line', rows: [] } }
}
const R = (lo: number | null, hi: number | null, loc: boolean, hic: boolean): Rg => ({ lo, hi, loc, hic })
const ints = [-4, -3, -2, -1, 0, 1, 2, 3, 4]
const ray = (up: boolean, closed: boolean): Rg[] => ints.map((n) => (up ? R(n, null, closed, false) : R(null, n, false, closed)))
const between: Rg[] = ints.flatMap((a) => ints.filter((b) => b - a >= 2).flatMap((b) => [R(a, b, true, true), R(a, b, true, false), R(a, b, false, true), R(a, b, false, false)]))
const BOOK5: [string, Rg, Rg[]][] = [
  ['a', R(-1, null, true, false), ray(true, true)],
  ['b', R(null, 3, false, false), ray(false, false)],
  ['c', R(-2, null, false, false), ray(true, false)],
  ['d', R(null, 2, false, true), ray(false, true)],
  ['e', R(-2, 3, false, true), between],
]
function build5(): Exercise {
  const questions: Question[] = BOOK5.map(([part, book, pool], idx): Question => {
    const seen = new Set([rgTex(book)])
    const bank = shuffled(pool, 6350 + idx).filter((x) => !seen.has(rgTex(x)) && !!seen.add(rgTex(x))).slice(0, 10)
    const make = (x: Rg, key: string, k: number): Practice => {
      const [choices, correct] = choices5(x, idx + k)
      return { figure: numberLine([rgSeg(x)]), tex: rgTex(x), choices, correct, why: '', lesson: () => lesson5(x, key, idx + k) }
    }
    return { part, ...make(book, part, 0), practice: bank.map((x, k) => make(x, `${part}${k + 1}`, k + 1)) }
  })
  return { no: 5, sec: '6.3', prompt: 'Write an inequality for the number line.', mathChoices: true, questions }
}

export const EX_LINE63 = [build3(), build5()]
