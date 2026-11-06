// Grade 9 6.3 exercise 6 (bank/G9-ch6/s3/items.json): graph a sentence on the number line (between / at least / not exceed / not between / cannot vary by more than ...).
// The question is the sentence, the choices are number line pictures (numline-data.ts). The 10 similar sentences of every question are made here from a few templates and number tables.
// Lesson: step 1 the sentence in math (one blank, choose the inequality); step 2 the closed / open circles (and the direction of a ray); the picture is drawn in the end.
// Imported by: quiz.tsx, check63.ts. Shape: exercise.ts.
import type { Exercise, Practice, Question } from './exercise'
import type { Calc, Lesson, Step, Tok } from './lessons'
import { numberLine, type Seg } from './numline-data'
import { pick } from './simplify-data'

// a ray (up: goes right), the part between two numbers, or the two rays outside them
type Sp = { k: 'ray'; up: boolean; closed: boolean; n: number } | { k: 'between' | 'outside'; a: number; b: number; ac: boolean; bc: boolean }
interface Item {
  sent: string
  sp: Sp
}
const num = (n: number) => String(n)
const spTex = (s: Sp): string => {
  if (s.k === 'ray') return `x ${s.up ? (s.closed ? '\\ge' : '>') : s.closed ? '\\le' : '<'} ${num(s.n)}`
  if (s.k === 'between') return `${num(s.a)} ${s.ac ? '\\le' : '<'} x ${s.bc ? '\\le' : '<'} ${num(s.b)}`
  return `x ${s.ac ? '\\le' : '<'} ${num(s.a)} \\text{ or } x ${s.bc ? '\\ge' : '>'} ${num(s.b)}`
}
const spSegs = (s: Sp): Seg[] =>
  s.k === 'ray' ? [s.up ? { a: s.n, b: null, ac: s.closed, bc: false } : { a: null, b: s.n, ac: false, bc: s.closed }] : s.k === 'between' ? [{ a: s.a, b: s.b, ac: s.ac, bc: s.bc }] : [{ a: null, b: s.a, ac: false, bc: s.ac }, { a: s.b, b: null, ac: s.bc, bc: false }]
const pic = (s: Sp) => numberLine(spSegs(s))
const text = (t: string) => t.replace(/[%&#_]/g, (c) => `\\${c}`)
const itemTex = (it: Item) => `\\text{${text(it.sent)}}`

// wrong versions: a circle changed, the direction turned, the numbers negated, between <-> outside
function wrongs(s: Sp): Sp[] {
  if (s.k === 'ray') return [{ ...s, closed: !s.closed }, { ...s, up: !s.up }, { ...s, n: -s.n }, { ...s, up: !s.up, n: -s.n }, { ...s, n: s.n + (s.n >= 4 ? -1 : 1) }]
  const o: Sp = { ...s, k: s.k === 'between' ? 'outside' : 'between' }
  return [{ ...s, ac: !s.ac }, { ...s, bc: !s.bc }, { ...s, a: -s.b, b: -s.a, ac: s.bc, bc: s.ac }, o, { ...s, ac: !s.ac, bc: !s.bc }]
}

function lesson6(it: Item, key: string, idx: number): Lesson {
  const s = it.sp
  const blank = (id: string, from: string, prompt: string, right: string, wr: string[], hint: string, salt: number) => {
    const [options, correct] = pick(right, wr.filter((w) => w !== right), idx + salt)
    return { id, from, calc: { q: prompt, options, correct, hints: options.map((_, j) => (j === correct ? '' : hint)), spell: hint } as Calc }
  }
  const right = spTex(s)
  const seen = new Set([right])
  const wt = wrongs(s).map(spTex).filter((t) => !seen.has(t) && !!seen.add(t)).slice(0, 4)
  const b1 = blank('q', 's0', itemTex(it), right, wt, '$\\text{at least, at most} : \\ge,\\ \\le \\qquad \\text{more than, less than} : >,\\ <$', 0)
  const start: Tok[] = [{ id: 's0', tex: itemTex(it) }]
  const steps: Step[] = [{ focus: ['s0'], result: { id: 'q', tex: right }, results: [{ id: 'q', tex: right }], blanks: [b1], arrows: [{ from: ['s0'], to: ['q'] }], say: '', calcPrompt: 'Write it in math.', calc: b1.calc }]
  // circles (one per end) and the direction of a ray
  const dot = (c: boolean) => (c ? '\\bullet' : '\\circ')
  const dotHint = '$\\le,\\ \\ge : \\bullet \\qquad <,\\ > : \\circ$'
  const blanks: ReturnType<typeof blank>[] = []
  const toks: Tok[] = [{ id: 'q2', tex: right }]
  const addDot = (id: string, closed: boolean, at: number) => {
    blanks.push(blank(id, 'q', `$${num(at)} \\;\\to\\; \\square$`, dot(closed), [dot(!closed)], dotHint, blanks.length + 1))
    toks.push({ id, tex: dot(closed) })
  }
  if (s.k === 'ray') {
    addDot('c1', s.closed, s.n)
    const dir = s.up ? '\\longrightarrow' : '\\longleftarrow'
    blanks.push(blank('ar', 'q', `$${right} \\;\\to\\; \\square$`, dir, [s.up ? '\\longleftarrow' : '\\longrightarrow'], '$>,\\ \\ge : \\longrightarrow \\qquad <,\\ \\le : \\longleftarrow$', 5))
    toks.push({ id: 'ar', tex: dir })
  } else {
    addDot('c1', s.ac, s.a)
    addDot('c2', s.bc, s.b)
  }
  steps.push({ focus: ['q'], result: toks[0], results: toks, blanks, arrows: blanks.map((b) => ({ from: ['q'], to: [b.id] })), say: '', calcPrompt: 'Circles and direction.', calc: blanks[0].calc })
  const full = pic(s)
  const bare = numberLine([])
  return { key: `sent63-${key}`, label: key, source: `Grade 9, 6.3 exercise 6${key}`, title: 'Graph the sentence', prompt: 'Graph:', figure: bare, figureAt: (k) => (k >= steps.length ? full : bare), answer: full, start, steps, review: { heading: 'Number line', rows: [] } }
}

// ---- the 8 textbook sentences and the pools of the similar ones ----
const R = (n: number, up: boolean, closed: boolean): Sp => ({ k: 'ray', up, closed, n })
const B = (a: number, b: number, ac: boolean, bc: boolean): Sp => ({ k: 'between', a, b, ac, bc })
const O = (a: number, b: number): Sp => ({ k: 'outside', a, b, ac: true, bc: true })
const pairs = (lo: number, hi: number, gap: number): [number, number][] => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i).flatMap((a) => Array.from({ length: hi - lo + 1 }, (_, j) => lo + j).filter((b) => b - a >= gap).map((b): [number, number] => [a, b]))
const WORD = ['one', 'two', 'three', 'four', 'five']
const upTo = (n: number) => (n >= 1 && n <= 5 ? WORD[n - 1] : String(n))
const ctx = (i: number, a: string[]) => a[i % a.length]
const fill = (t: string, v: Record<string, string>) => t.replace(/\{(\w)\}/g, (_, k) => v[k])
const each = (ns: number[], ts: string[], f: (t: string, n: number) => Item): Item[] => ns.flatMap((n) => ts.map((t) => f(t, n)))
const BOOK: [string, Item, Item[]][] = [
  ['a', { sent: 'Bill will lose between one and four kilograms after each hockey game.', sp: B(1, 4, false, false) },
    pairs(0, 5, 1).map(([a, b], i): Item => ({ sent: fill(ctx(i, ['A runner will lose between {a} and {b} kilograms after each race.', 'The tank holds between {a} and {b} litres of water.', 'Maria studies between {a} and {b} hours each day.', 'The trip takes between {a} and {b} hours.']), { a: upTo(a), b: upTo(b) }), sp: B(a, b, false, false) }))],
  ['b', { sent: 'The temperature today will be at least $2^\\circ$ Celsius, but less than $5^\\circ$ Celsius.', sp: B(2, 5, true, false) },
    pairs(-3, 5, 2).map(([a, b], i): Item => ({ sent: fill(ctx(i, ['The temperature tomorrow will be at least ${a}^\\circ$ Celsius, but less than ${b}^\\circ$ Celsius.', 'The water must be at least ${a}^\\circ$ Celsius, but less than ${b}^\\circ$ Celsius.', 'The night temperature will be at least ${a}^\\circ$ Celsius, but less than ${b}^\\circ$ Celsius.']), { a: num(a), b: num(b) }), sp: B(a, b, true, false) }))],
  ['c', { sent: 'The amount of sunlight will not exceed four hours today.', sp: B(0, 4, true, true) },
    each([1, 2, 3, 4, 5], ['The amount of sunlight will not exceed {n} hours today.', 'The bus ride will not exceed {n} hours.', 'The test will not exceed {n} hours.'], (t, n) => ({ sent: fill(t, { n: upTo(n) }), sp: B(0, n, true, true) }))],
  ['d', { sent: 'The amount of sunlight will be less than four hours today.', sp: B(0, 4, true, false) },
    each([1, 2, 3, 4, 5], ['The amount of sunlight will be less than {n} hours today.', 'The film is less than {n} hours long.', 'The walk takes less than {n} hours.'], (t, n) => ({ sent: fill(t, { n: upTo(n) }), sp: B(0, n, true, false) }))],
  ['e', { sent: 'A number is not between $-1$ and $3$.', sp: O(-1, 3) },
    pairs(-4, 4, 2).map(([a, b], i): Item => ({ sent: fill(ctx(i, ['A number is not between ${a}$ and ${b}$.', 'A whole number is not between ${a}$ and ${b}$.']), { a: num(a), b: num(b) }), sp: O(a, b) }))],
  ['f', { sent: 'The temperature is at most $-2^\\circ$ Celsius.', sp: R(-2, false, true) },
    each([-4, -3, -2, -1, 0, 1, 2], ['The temperature is at most ${n}^\\circ$ Celsius.', 'The freezer stays at most ${n}^\\circ$ Celsius.', 'The night temperature is at most ${n}^\\circ$ Celsius.'], (t, n) => ({ sent: fill(t, { n: num(n) }), sp: R(n, false, true) }))],
  ['g', { sent: 'The baby weighs more than 3 kilograms.', sp: R(3, true, false) },
    each([1, 2, 3, 4], ['The baby weighs more than {n} kilograms.', 'The parcel weighs more than {n} kilograms.', 'The dog weighs more than {n} kilograms.'], (t, n) => ({ sent: fill(t, { n: num(n) }), sp: R(n, true, false) }))],
  ['h', { sent: 'Its weight cannot vary by more than 1.5 kilograms.', sp: B(-1.5, 1.5, true, true) },
    each([1, 1.5, 2, 2.5, 3, 4], ['Its weight cannot vary by more than {n} kilograms.', 'Its length cannot vary by more than {n} centimetres.', 'The temperature cannot vary by more than {n} degrees.'], (t, n) => ({ sent: fill(t, { n: num(n) }), sp: B(-n, n, true, true) }))],
]
const shuffled = <T,>(a: T[], seed: number): T[] => {
  let s = seed
  const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32)
  return [...a].sort(() => r() - 0.5)
}

function build(): Exercise {
  const questions: Question[] = BOOK.map(([part, book, pool], idx): Question => {
    const seen = new Set([book.sent])
    const bank = shuffled(pool, 6360 + idx).filter((x) => !seen.has(x.sent) && !!seen.add(x.sent)).slice(0, 10)
    const make = (x: Item, key: string, k: number): Practice => {
      const [choices, correct] = pick(pic(x.sp), wrongs(x.sp).map(pic).filter((p) => p !== pic(x.sp)), idx + k)
      return { tex: itemTex(x), choices, correct, why: '', lesson: () => lesson6(x, key, idx + k) }
    }
    return { part, ...make(book, part, 0), practice: bank.map((x, k) => make(x, `${part}${k + 1}`, k + 1)) }
  })
  return { no: 6, sec: '6.3', prompt: 'Graph the sentence on the number line.', mathChoices: true, questions }
}

export const EX_SENT63 = [build()]
