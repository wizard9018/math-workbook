// Grade 9, 5.2 exercises 1 to 7 (add, subtract and combine polynomials, bank/G9-ch5/s2/items.json), every question written horizontally with brackets:
// (2x - 3) + (-4x + 1), (5x + 2) - (-3x + 1), -(2 - x^2 + x) + (x - 3x^2 + 4) - (2x^2 - 1).
// Wrong answer -> the plus / minus before a bracket, then ONE step that removes the brackets (a minus changes every sign inside), then the collect-like-terms steps of simplify-data.ts.
// The 10 similar questions of every textbook question are written by Gemini (gen-variants-52.py, variants52.json); the answers are computed here.
// Imported by: quiz.tsx. Shape: exercise.ts.
import type { Exercise, Practice, Question } from './exercise'
import type { Lesson, Step, Tok } from './lessons'
import VARIANTS from './variants52.json'
import TEXTBOOK from './textbook52.json'
import { abs, add, byOrder, classes, coefTex, collectPart, finalChoices, hintFor, mk, neg, parseSafe, pick, polyTex, q, simpTex, sum, termTex, topTen, varTex } from './simplify-data'
import type { Mono, Q } from './simplify-data'

interface Group {
  sign: 1 | -1 // the sign in front of the bracket
  ms: Mono[]
}

// "(2x-3)+(-4x+1)" -> groups; null when it is not a sum of 2 or 3 brackets
const parseGroups = (s: unknown): Group[] | null => {
  if (typeof s !== 'string') return null
  const t = s.replace(/\s/g, '')
  if (!/^[-+]?\([^()]+\)(?:[-+]\([^()]+\))+$/.test(t)) return null
  const gs = [...t.matchAll(/([-+]?)\(([^()]+)\)/g)].map((m) => ({ sign: (m[1] === '-' ? -1 : 1) as 1 | -1, ms: parseSafe(m[2]) }))
  if (gs.length > 3 || gs.some((g) => !g.ms || g.ms.length > 5)) return null
  return gs as Group[]
}

const flipTerms = (ms: Mono[]) => ms.map((m) => mk(neg(m.c), m.raw))
const flatten = (gs: Group[]): Mono[] => gs.flatMap((g) => (g.sign === 1 ? g.ms : flipTerms(g.ms)))
const line = (ms: Mono[]) => polyTex(ms.map((m) => ({ c: m.c, v: m.raw })))
const bracket = (g: Group) => `(${line(g.ms)})`
const origTex = (gs: Group[]) => gs.map((g, i) => (i === 0 ? (g.sign < 0 ? '-' : '') : g.sign < 0 ? ' - ' : ' + ') + bracket(g)).join('')

const REFERENCE = [
  { label: 'Plus in front of a bracket', tex: '+(x - 2) = x - 2' },
  { label: 'Minus in front of a bracket', tex: '-(x - 2) = -x + 2' },
]

// a wrong answer forgets that a minus changes the signs, or changes only the first sign
const noFlip = (gs: Group[]) => gs.flatMap((g) => g.ms)
const firstOnly = (gs: Group[]) => gs.flatMap((g) => (g.sign === 1 ? g.ms : [mk(neg(g.ms[0].c), g.ms[0].raw), ...g.ms.slice(1)]))

function lessonFor(no: number, gs: Group[], part: string, idx: number): Lesson {
  const flat = flatten(gs)
  const { start: flatStart, steps: collect } = collectPart(flat, idx)

  const start: Tok[] = []
  gs.forEach((g, i) => {
    if (i > 0 || g.sign < 0) start.push({ id: `o${i}`, tex: g.sign < 0 ? '-' : '+' })
    start.push({ id: `g${i}`, tex: bracket(g) })
  })

  // the brackets come off: a minus in front changes every sign inside
  const [options, correct] = pick(
    line(flat),
    [line(noFlip(gs)), line(firstOnly(gs)), line(flipTerms(flat)), line([...flipTerms(gs[0].ms), ...gs.slice(1).flatMap((g) => g.ms)]), line([...flat].reverse())],
    idx,
  )
  const hasMinus = gs.some((g) => g.sign < 0)
  const text = hasMinus ? 'A minus in front of a bracket changes every sign inside.' : 'A plus in front of a bracket changes nothing inside.'
  // the result ids of each bracket, and for the terms of a bracket with a minus in front the text they had before their sign flipped
  const groups: string[][] = []
  const oldTexts: Record<string, string> = {}
  let at = 0
  for (const g of gs) {
    groups.push(g.ms.map((_, k) => `t${at + k}`))
    if (g.sign < 0) g.ms.forEach((m, k) => (oldTexts[`t${at + k}`] = termTex(m.c, m.raw, at + k > 0)))
    at += g.ms.length
  }
  const bracketStep: Step = {
    from: 'each',
    focus: start.map((t) => t.id),
    result: flatStart[0],
    results: flatStart,
    arrows: [], // no arrows: the brackets fade away, and the signs inside a bracket with a minus in front flip
    morph: { groups, from: oldTexts },
    say: '',
    calcPrompt: 'Which one is the same without the brackets?',
    calc: {
      q: 'Which one is the same without the brackets?',
      options,
      correct,
      hints: options.map((_, i) => (i === correct ? '' : text)),
      spell: text,
      example: hasMinus ? '-(2x - 3) = -2x + 3' : '+(2x - 3) = 2x - 3',
    },
  }

  return {
    key: `bracket${no}-${part}`,
    label: part,
    source: `Grade 9, 5.2 exercise ${no}${part}`,
    title: 'Simplify',
    prompt: 'Simplify:',
    answer: simpTex(flat),
    reference: REFERENCE,
    start,
    steps: [bracketStep, ...collect],
    review: { heading: 'Brackets', rows: [] },
  }
}

// ---- vertical form (exercises 2 and 5): like terms in the same column, the answer built column by column ----
// every row must have only unlike terms; exercise 2 adds 2 or 3 rows, exercise 5 subtracts the lower row from the upper one
const verticalOk = (no: number, gs: Group[]) =>
  gs.every((g) => new Set(g.ms.map((m) => m.key)).size === g.ms.length) &&
  (no === 2 ? gs.every((g) => g.sign === 1) : gs.length === 2 && gs[0].sign === 1 && gs[1].sign === -1)

// the columns: the like-term classes of all rows in descending order
const columnKeys = (gs: Group[]) =>
  classes(gs.flatMap((g) => g.ms))
    .map((c) => c[0])
    .sort((a, b) => byOrder(a.vs, b.vs))

// the terms of one row spread over the columns (undefined where the row has nothing), and their text (the first term of the row has no plus sign)
type Slots = (Mono | undefined)[]
const rowSlots = (ms: Mono[], keys: Mono[]): Slots => keys.map((k) => ms.find((x) => x.key === k.key))
const cellsOf = (slots: Slots): string[] => {
  let seen = 0
  return slots.map((m) => (m ? termTex(m.c, m.raw, seen++ > 0) : ''))
}
const rowCells = (ms: Mono[], keys: Mono[]) => cellsOf(rowSlots(ms, keys))
const rot = <T,>(a: T[], by: number) => a.map((_, i) => a[(((i - by) % a.length) + a.length) % a.length])

// polynomials one under the other with a column for the sign of the operation, rows of cells in columns, a line under them
const arrayOf = (op: string, rows: string[][]) => `\\begin{array}{${'r'.repeat(rows[0].length + 1)}} ${rows.map((r, i) => [i === 0 ? '' : op, ...r].join(' & ')).join(' \\\\ ')} \\\\ \\hline \\end{array}`
const opOf = (gs: Group[]) => (gs[gs.length - 1].sign < 0 ? '-' : '+')

// the question as the textbook prints it: each polynomial on its own line, the lines ending at the same place, NOT lined up by like terms
const rawTex = (gs: Group[], align: 'r' | 'l' | 'c' = 'r') =>
  `\\begin{array}{c${align}} ${gs.map((g, r) => `${r === 0 ? '\\;' : opOf(gs)} & ${line(g.ms)}`).join(' \\\\ ')} \\\\ \\hline \\end{array}`

function verticalLesson(no: number, gs: Group[], part: string, idx: number): Lesson {
  const keys = columnKeys(gs)
  const flat = flatten(gs)
  const sub = gs[gs.length - 1].sign < 0
  const last = gs.length - 1
  const cells = gs.map((g) => rowCells(g.ms, keys))

  // vertical subtraction is worked as it is written, column by column ("What is 4x - (-3x)?"): no step that changes the signs first
  const cols = keys.map((k, ci) => {
    const terms = flat.filter((m) => m.key === k.key) // the terms of this column (a subtracted term already has its sign changed)
    const total = sum(terms)
    const v = varTex(k.vs)
    const signed = (c: Q) => termTex(c, v, ci > 0)
    // the question writes the terms of the column with their letters: "What is 4x - (-3x)?"
    const mag = (m: Mono) => termTex(abs(m.c), v, false)
    const sc = (m: Mono) => (m.c[0] < 0 ? '-' : '') + mag(m)
    const par = (m: Mono) => (m.c[0] < 0 ? `(${sc(m)})` : mag(m))
    const orig = gs.map((g) => g.ms.find((m) => m.key === k.key))
    let ask: { expr: string; text: string; example?: string } | undefined
    if (sub) {
      const [top, low] = orig
      if (low) ask = { expr: top ? `${sc(top)} - ${par(low)}` : `-${par(low)}`, text: 'Subtracting a number is the same as adding its opposite.', example: '5 - (-2) = 5 + 2 \\qquad 5 - 2 = 3' }
    } else if (terms.length > 1) {
      const numbers = terms.map((m, i) => (i === 0 ? (m.c[0] < 0 ? '-' : '') : m.c[0] < 0 ? ' - ' : ' + ') + coefTex(abs(m.c))).join('') // the hint talks about the numbers
      ask = { expr: terms.map((m, i) => (i === 0 ? (m.c[0] < 0 ? '-' : '') : m.c[0] < 0 ? ' - ' : ' + ') + mag(m)).join(''), ...hintFor(terms.map((m) => m.c), numbers) }
    }
    let question
    if (ask) {
      const [options, correct] = pick(signed(total), [signed(neg(total)), signed(add(total, q(1))), signed(add(total, q(-1))), signed(add(total, q(2))), signed(add(total, q(-2))), signed(terms.reduce((s, m) => add(s, abs(m.c)), q(0)))], idx + ci)
      question = { prompt: `What is $${ask.expr}$?`, options, correct, hint: ask.text, example: ask.example } // the column is already marked, so the question is the arithmetic itself
    }
    return { cells: cells.map((r) => r[ci]), after: cells.map((r) => r[ci]), total: signed(total), question }
  })

  // step 1: the layout with the like terms in the same column (wrong ones: as printed, left or centred, or a row shifted / reversed so that unlike terms meet)
  const slots = gs.map((g) => rowSlots(g.ms, keys))
  const layout = (rows: Slots[]) => arrayOf(opOf(gs), rows.map(cellsOf))
  const [alignOptions, alignCorrect] = pick(
    layout(slots),
    [rawTex(gs), layout(slots.map((r, i) => (i === 1 ? rot(r, 1) : r))), layout(slots.map((r, i) => (i === 1 ? [...r].reverse() : r))), layout(slots.map((r, i) => (i === 0 ? rot(r, -1) : r))), layout(slots.map((r, i) => (i === last ? rot(r, 2) : r))), rawTex(gs, 'l'), rawTex(gs, 'c')],
    idx + 1,
  )
  const align = {
    prompt: 'Which one has the like terms lined up in columns?',
    options: alignOptions,
    correct: alignCorrect,
    hint: 'Like terms go in the same column: x squared under x squared, x under x, numbers under numbers.',
    example: '\\begin{array}{rrr} & 3x^2 & +x \\\\ + & x^2 & -4x \\\\ \\hline \\end{array}',
  }

  // the choice of the layout is only needed when the like terms are not already in the same order in every row
  const sequences = gs.map((g) => g.ms.map((m) => m.key).join(','))
  const needAlign = !sequences.every((s) => s === sequences[0])
  return {
    key: `vertical${no}-${part}`,
    label: part,
    source: `Grade 9, 5.2 exercise ${no}${part}`,
    title: no === 5 ? 'Subtract' : 'Add',
    prompt: '',
    answer: simpTex(flat),
    start: [],
    steps: [],
    review: { heading: 'Vertical', rows: [] },
    vertical: { raw: rawTex(gs), align: needAlign ? align : undefined, rows: gs.length, op: sub ? '-' : '+', cols },
  }
}

// the answer, and three wrong ones: the answer of "forgot to change the signs", of "changed only the first sign", and the usual slips of finalChoices
function choicesFor(gs: Group[], idx: number): [string[], number] {
  const [others] = finalChoices(flatten(gs), 0)
  return pick(simpTex(flatten(gs)), [simpTex(noFlip(gs)), simpTex(firstOnly(gs)), ...others], idx)
}

// the same question with the letters renamed, when Gemini has fewer than 10 for it
const LETTERS = ['pqr', 'mnk', 'stu', 'abc']
const renamed = (gs: Group[], k: number): Group[] => {
  const letters = [...new Set(gs.flatMap((g) => g.ms.flatMap((m) => m.vs.map(([l]) => l))))].sort()
  return gs.map((g) => ({ sign: g.sign, ms: g.ms.map((m) => mk(m.c, m.raw.replace(/[a-z]/g, (c) => LETTERS[k][letters.indexOf(c)] ?? c))) }))
}

const PROMPT: Record<number, string> = { 1: 'Add', 2: 'Add', 3: 'Add', 4: 'Subtract', 5: 'Subtract', 6: 'Subtract', 7: 'Simplify the combined operations' }

export function build(no: number, book?: [string, string][], sec = '5.2', shownNo = no, extra?: Record<string, string[]>): Exercise {
  const vertical = no === 2 || no === 5 // these two are written (and worked) one polynomial under the other
  const generatedFor = (part: string) =>
    (extra?.[part] ?? (VARIANTS as Record<string, Record<string, unknown[]>>)[String(no)]?.[part] ?? []).map(parseGroups).filter((g): g is Group[] => !!g && (!vertical || verticalOk(no, g)))
  const texOf = vertical ? (gs: Group[]) => rawTex(gs) : origTex
  const lessonOf = vertical ? verticalLesson : lessonFor
  const questions: Question[] = (book ?? (TEXTBOOK as unknown as Record<string, [string, string][]>)[String(no)]).map(([part, src], idx) => {
    const book = parseGroups(src)!
    const bank = topTen(generatedFor(part), [0, 1, 2, 3].map((k) => renamed(book, k)), origTex, book)
    const make = (gs: Group[], k: number): Practice => {
      const [choices, correct] = choicesFor(gs, idx + k)
      return { tex: texOf(gs), choices, correct, why: '', lesson: () => lessonOf(no, gs, `${part}${k + 1}`, idx + k) }
    }
    const [choices, correct] = choicesFor(book, idx)
    return { part, tex: texOf(book), choices, correct, why: '', lesson: () => lessonOf(no, book, part, idx), practice: bank.map(make) }
  })
  return { no: shownNo, sec, prompt: PROMPT[no], mathChoices: true, questions }
}

// exercises 3 and 6 (algebra tiles) are left out
export const EX52 = [1, 2, 4, 5, 7].map((n) => build(n))

// ================= challenge exercises (5.2 exercises 1, 4 and 7, harder): three brackets of four or five terms, higher powers, two or three letters; optional extra practice, own progress (no 11, 14, 17) =================
const hrng = (seed: number) => {
  let s = seed
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32)
}
const MONOS: string[][] = [
  ['x^3', 'x^2', 'x', ''],
  ['y^3', 'y^2', 'y', ''],
  ['x^2', 'xy', 'y^2', 'x', 'y', ''],
  ['x^2', 'xy', 'y^2', 'z', 'x', 'y'],
]
function hpoly(r: () => number, monos: string[]): string {
  const k = 4 + Math.floor(r() * 2) // four or five terms
  const pool = [...monos]
  const chosen: string[] = []
  while (chosen.length < Math.min(k, pool.length)) chosen.push(pool.splice(Math.floor(r() * pool.length), 1)[0])
  chosen.sort((a, b) => monos.indexOf(a) - monos.indexOf(b))
  return chosen
    .map((m, i) => {
      const c = (1 + Math.floor(r() * 9)) * (r() < 0.5 ? -1 : 1)
      const mag = Math.abs(c) === 1 && m ? '' : String(Math.abs(c))
      return `${c < 0 ? '-' : i === 0 ? '' : '+'}${mag}${m}`
    })
    .join('')
}
// one question: three brackets; `ops` the signs between them ('+' or '-'), a leading '-' when `lead`
function hexpr(r: () => number, monos: string[], ops: string, lead: boolean): string {
  const gs = [0, 1, 2].map(() => `(${hpoly(r, monos)})`)
  return (lead ? '-' : '') + gs[0] + ops[0] + gs[1] + ops[1] + gs[2]
}
function hset(seed: number, mode: 'add' | 'sub' | 'mix'): { book: [string, string][]; extra: Record<string, string[]> } {
  const r = hrng(seed)
  const book: [string, string][] = []
  const extra: Record<string, string[]> = {}
  MONOS.forEach((monos, i) => {
    const part = String.fromCharCode(97 + i)
    const make = () => {
      const ops = mode === 'add' ? '++' : mode === 'sub' ? '--' : ['+-', '-+', '--', '++'][Math.floor(r() * 4)]
      return hexpr(r, monos, ops, mode === 'mix' && r() < 0.3)
    }
    book.push([part, make()])
    extra[part] = Array.from({ length: 14 }, make)
  })
  return { book, extra }
}
const H52 = { add: hset(5201, 'add'), sub: hset(5204, 'sub'), mix: hset(5207, 'mix') }
export const EX52H = [
  build(1, H52.add.book, '5.2', 11, H52.add.extra),
  build(4, H52.sub.book, '5.2', 14, H52.sub.extra),
  build(7, H52.mix.book, '5.2', 17, H52.mix.extra),
]
