// Grade 9, 5.1 exercises 8 (a-t) and 10 (a-r) ("Simplify by collecting like terms", bank/G9-ch5/s1/items.json) with their lessons and practice questions.
// Wrong answer -> the textbook like / unlike terms, then one question per group of like terms (what do they add up to?), then the polynomial in descending order.
// The practice questions are the same question with other letters (and, for whole numbers, other numbers).
// Imported by: quiz.tsx. Shape: exercise.ts.
import type { Exercise, Practice, Question } from './exercise'
import type { Lesson, Step, Tok } from './lessons'
import VARIANTS from './variants.json'

export type Q = [number, number, boolean?] // a fraction n / d with d > 0; the third value says "write it as a decimal"
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a))
export const q = (n: number, d = 1, dec = false): Q => {
  const g = gcd(n, d) || 1
  return dec ? [n / g, d / g, true] : [n / g, d / g]
}
export const add = (a: Q, b: Q) => q(a[0] * b[1] + b[0] * a[1], a[1] * b[1], !!(a[2] || b[2]))
export const neg = (a: Q): Q => [-a[0], a[1], a[2]]
export const abs = (a: Q): Q => [Math.abs(a[0]), a[1], a[2]]

type Vars = [string, number][] // letters with exponents, in alphabetical order
export interface Mono {
  c: Q
  raw: string // the letters as written in the book (xy / yx)
  vs: Vars
  key: string // like terms have the same key
}
// letters (and the number pi, written π: a factor that is not a variable) with exponents; the same letter twice (x^2x) adds its exponents
export const mk = (c: Q, raw: string): Mono => {
  const exps = new Map<string, number>()
  for (const m of raw.matchAll(/([a-zπ])(?:\^(\d+))?/g)) exps.set(m[1], (exps.get(m[1]) ?? 0) + (m[2] ? Number(m[2]) : 1))
  const vs: Vars = [...exps].sort((a, b) => a[0].localeCompare(b[0]))
  return { c, raw, vs, key: vs.map(([l, e]) => l + e).join('') }
}
// "2x - 3 - x + 2" -> terms; "2/3x" is two thirds of x, "2.8x" a decimal coefficient
export const parse = (s: string): Mono[] =>
  (s.replace(/\s/g, '').match(/[+-]?[^+-]+/g) ?? []).map((p) => {
    const m = p.replace(/^[+-]/, '').match(/^(?:(\d+(?:\.\d+)?)(?:\/(\d+))?)?(.*)$/)!
    const sign = p[0] === '-' ? -1 : 1
    const c = m[1]?.includes('.') ? q(sign * Math.round(Number(m[1]) * 100), 100, true) : q(sign * (m[1] ? Number(m[1]) : 1), m[2] ? Number(m[2]) : 1)
    return mk(c, m[3])
  })

// an expression written by Gemini (gen-variants.py): plain text only, every term a number times letters with whole powers; null when it is not
export const parseSafe = (s: unknown): Mono[] | null => {
  if (typeof s !== 'string' || !/^[-+0-9a-z^/. ]+$/.test(s)) return null
  const ms = parse(s)
  const ok = ms.length > 0 && ms.length <= 8 && ms.every((m) => m.c[0] !== 0 && m.c[1] > 0 && /^(?:[a-z](?:\^\d+)?)*$/.test(m.raw))
  return ok ? ms : null
}
// the 10 similar questions of one slot: Gemini's first, then the hand-made ones, without repeats and without the textbook question itself
export const topTen = <T,>(gem: T[], own: T[], key: (x: T) => string, textbook: T): T[] => {
  const seen = new Set([key(textbook)])
  return [...gem, ...own].filter((x) => !seen.has(key(x)) && !!seen.add(key(x))).slice(0, 10)
}
// the expressions Gemini wrote for textbook question <no><part> (plain strings only)
export const generated = (no: number, part: string): string[] => ((VARIANTS as Record<string, Record<string, unknown[]>>)[String(no)]?.[part] ?? []).filter((x): x is string => typeof x === 'string')

// the number pi is written first (2πx); termTex turns the character π into \pi
export const varTex = (vs: Vars) => [...vs.filter(([l]) => l === 'π'), ...vs.filter(([l]) => l !== 'π')].map(([l, e]) => (e === 1 ? l : `${l}^${e}`)).join('')
export const coefTex = (c: Q) => (c[2] ? String(+(c[0] / c[1]).toFixed(4)) : c[1] === 1 ? String(c[0]) : `\\frac{${c[0]}}{${c[1]}}`)
// one term; the sign is written when negative, or with signed = true; 0 has no sign
export const termTex = (c: Q, v: string, signed: boolean) => {
  if (c[0] === 0) return '0'
  const a = abs(c)
  const tv = v.replace(/π/g, '\\pi ')
  const body = !v ? coefTex(a) : (a[0] === a[1] ? '' : coefTex(a)) + tv
  return (c[0] < 0 ? '-' : signed ? '+' : '') + body
}
export const polyTex = (ts: { c: Q; v: string }[]) => {
  const nz = ts.filter((t) => t.c[0] !== 0)
  return nz.length ? nz.map((t, i) => (i === 0 ? termTex(t.c, t.v, false) : ` ${t.c[0] < 0 ? '-' : '+'} ${termTex(abs(t.c), t.v, false)}`)).join('') : '0'
}

// descending order: the higher the degree the earlier; the same degree goes alphabetically (x^2, xy, y^2)
// the number pi is a coefficient, not a variable: it does not count for the degree, and a term without it comes before the same term with it (6r + πr)
const pi = (vs: Vars) => vs.find(([l]) => l === 'π')?.[1] ?? 0
const letters = (vs: Vars) => vs.filter(([l]) => l !== 'π')
export const degree = (vs: Vars) => letters(vs).reduce((s, [, e]) => s + e, 0)
export const byOrder = (a0: Vars, b0: Vars) => {
  const [a, b] = [letters(a0), letters(b0)]
  if (degree(a) !== degree(b)) return degree(b) - degree(a)
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    if (a[i][0] !== b[i][0]) return a[i][0].localeCompare(b[i][0])
    if (a[i][1] !== b[i][1]) return b[i][1] - a[i][1]
  }
  return a.length - b.length || pi(a0) - pi(b0)
}

// groups of like terms, in order of first appearance
export const classes = (ms: Mono[]) => {
  const out: Mono[][] = []
  for (const m of ms) {
    const g = out.find((x) => x[0].key === m.key)
    if (g) g.push(m)
    else out.push([m])
  }
  return out
}
export const sum = (g: Mono[]) => g.reduce((s, m) => add(s, m.c), q(0))
export const simplified = (ms: Mono[]) =>
  classes(ms)
    .map((g) => ({ c: sum(g), vs: g[0].vs }))
    .filter((t) => t.c[0] !== 0)
    .sort((a, b) => byOrder(a.vs, b.vs))
export const simpTex = (ms: Mono[]) => polyTex(simplified(ms).map((t) => ({ c: t.c, v: varTex(t.vs) })))

export const GREEN = (t: string) => `\\textcolor{#16a34a}{${t}}`
export const lcm = (a: number, b: number) => (a / gcd(a, b)) * b
// the wrong-answer hint of a collect step: it depends on the arithmetic of THIS group of numbers (the example is its own next line, not the answer)
export function hintFor(cs: Q[], expr: string): { text: string; example?: string } {
  const join = (parts: string[]) => parts.map((p, i) => (i === 0 ? (cs[i][0] < 0 ? '-' : '') : cs[i][0] < 0 ? ' - ' : ' + ') + p).join('')
  if (cs.some((c) => !c[2] && c[1] > 1)) {
    const ds = cs.map((c) => c[1])
    const bottom = ds.reduce(lcm)
    if (ds.every((d) => d === ds[0])) return { text: 'Same bottom: add the tops. Keep the bottom.', example: `${expr} = \\frac{${join(cs.map((c) => String(Math.abs(c[0]))))}}{${bottom}}` }
    return { text: 'Make the bottoms the same first.', example: `${expr} = ${join(cs.map((c) => `\\frac{${Math.abs(c[0]) * (bottom / c[1])}}{${bottom}}`))}` }
  }
  const pos = cs.filter((c) => c[0] > 0)
  const negs = cs.filter((c) => c[0] < 0)
  const list = (xs: Q[]) => (xs.length > 1 ? `(${xs.map((c) => coefTex(abs(c))).join(' + ')})` : coefTex(abs(xs[0])))
  if (!negs.length) return { text: 'All plus: just add the numbers.' }
  if (!pos.length) return { text: 'All minus: add the numbers. Keep the minus.', example: `${expr} = -${list(negs)}` }
  return { text: 'Different signs: subtract. The bigger number gives the sign.', example: '5 - 2 = 3 \\qquad 2 - 5 = -3' }
}
const ORDER_SENTENCE = 'Big power first. The number goes last.'
const ORDER_EXAMPLE = '2 + 3x + x^2 = x^2 + 3x + 2'
export const REFERENCE = [
  { label: 'Like terms', cells: ['5x,\\ 3x', '2x^2,\\ -x^2', '2xy,\\ -4yx'] },
  { label: 'Unlike terms', cells: ['5x^2,\\ 3x', '3x^2,\\ 3y^2', '2xy,\\ -3yz'] },
]

// the right answer plus three tempting wrong ones, the right one in a slot that depends on idx
export function pick(right: string, cand: string[], idx: number): [string[], number] {
  const wrong: string[] = []
  for (const c of cand) if (c !== right && !wrong.includes(c) && wrong.length < 3) wrong.push(c)
  const at = Math.min(idx % 4, wrong.length)
  const all = [...wrong]
  all.splice(at, 0, right)
  return [all, at]
}

export function finalChoices(ms: Mono[], idx: number): [string[], number] {
  const ts = simplified(ms).map((t) => ({ c: t.c, v: varTex(t.vs) }))
  const flips = ts.map((_, i) => polyTex(ts.map((t, j) => (i === j ? { ...t, c: neg(t.c) } : t))))
  const swapped = ts.length > 1 ? polyTex([ts[1], ts[0], ...ts.slice(2)]) : ''
  const vary = (d: number) => (ts.length ? polyTex(ts.map((t, j) => (j === 0 ? { ...t, c: add(t.c, q(d)) } : t))) : '')
  const v0 = classes(ms)[0][0].vs // everything cancels: the like terms that vanished are the tempting answers
  const gone = ts.length ? [] : [1, -1, 2].map((c) => polyTex([{ c: q(c), v: varTex(v0) }]))
  return pick(polyTex(ts), [...flips, swapped, vary(1), vary(-1), vary(2), vary(-2), polyTex([...ts].reverse()), ...gone].filter(Boolean), idx)
}

// the working of "collect like terms" on the terms ms (token ids t0, t1 ...): one step per group of like terms, then the descending order when the line is not in order yet
export function collectPart(ms: Mono[], idx: number): { start: Tok[]; steps: Step[] } {
  const start: Tok[] = ms.map((m, i) => ({ id: `t${i}`, tex: termTex(m.c, m.raw, i > 0) }))
  let line = start.map((t) => t.id)
  let cur = ms.map((m) => ({ c: m.c, vs: m.vs })) // the terms of `line`, to see whether the last step (put in order) is needed
  const steps: Step[] = []
  classes(ms).forEach((g, k) => {
    if (g.length < 2) return
    const focus = g.map((m) => `t${ms.indexOf(m)}`)
    const at = line.findIndex((id) => focus.includes(id))
    const total = sum(g)
    const v = varTex(g[0].vs)
    const nz = (c: Q) => termTex(c, v, at > 0)
    // the question is the arithmetic on the numbers in front of the letters of THIS group, e.g. "What is 3/8 - 2/8?"
    const expr = g.map((m, i) => (i === 0 ? (m.c[0] < 0 ? '-' : '') : m.c[0] < 0 ? ' - ' : ' + ') + coefTex(abs(m.c))).join('')
    const sumQ = `What is $${expr}$?`
    const hint = hintFor(g.map((m) => m.c), expr)
    const [options, correct] = pick(nz(total), [nz(neg(total)), nz(add(total, q(1))), nz(add(total, q(-1))), nz(add(total, q(2))), nz(add(total, q(-2))), nz(g.reduce((s, m) => add(s, abs(m.c)), q(0)))], idx + k)
    steps.push({
      from: 'each', // one arrow from every highlighted term
      focus,
      result: { id: `r${k}`, tex: GREEN(nz(total)) },
      say: '',
      calcPrompt: 'What do these like terms add up to?', // the arithmetic (sumQ) is only shown after a wrong answer
      calc: { q: 'What do these like terms add up to?', options, correct, hints: options.map((_, i) => (i === correct ? '' : `${sumQ} ${hint.text}`)), spell: hint.text, example: hint.example },
    })
    const keep = line.map((id, i) => ({ id, t: cur[i] })).filter((x, i) => i < at || !focus.includes(x.id))
    line = [...line.slice(0, at), `r${k}`, ...line.slice(at).filter((id) => !focus.includes(id))]
    cur = [...cur.slice(0, at), { c: total, vs: g[0].vs }, ...keep.slice(at).map((x) => x.t)]
  })
  // after collecting, the line is the answer already when it is in descending order and nothing cancelled to 0
  const done = steps.length > 0 && cur.every((t, i) => t.c[0] !== 0 && (i === 0 || byOrder(cur[i - 1].vs, t.vs) <= 0))
  const [options, correct] = finalChoices(ms, idx + 1)
  if (!done) steps.push({
    focus: line,
    result: { id: 'r', tex: GREEN(simpTex(ms)) },
    say: '',
    calcPrompt: 'Which one is the simplified polynomial in descending order?',
    calc: { q: 'Which one is the simplified polynomial in descending order?', options, correct, hints: options.map((_, i) => (i === correct ? '' : ORDER_SENTENCE)), spell: ORDER_SENTENCE, example: ORDER_EXAMPLE },
  })
  return { start, steps }
}

function lessonFor(no: number, ms: Mono[], key: string, idx: number): Lesson {
  const { start, steps } = collectPart(ms, idx)
  return {
    key: `simplify${no}-${key}`,
    label: key,
    source: `Grade 9, 5.1 exercise ${no}${key}`,
    title: 'Simplify',
    prompt: 'Simplify:',
    answer: simpTex(ms),
    reference: REFERENCE,
    start,
    steps,
    review: { heading: 'Like terms', rows: [] },
  }
}

// the same question with the letters renamed (p q / m n / s t); the 2nd and 3rd also change whole numbers (when nothing turns into 0 that was not 0 before)
const LETTERS = ['pq', 'mn', 'st', 'uv']
function variant(ms: Mono[], k: number): Mono[] {
  const letters = [...new Set(ms.flatMap((m) => m.vs.map(([l]) => l)))].sort()
  const rename = (raw: string) => raw.replace(/[a-z]/g, (c) => LETTERS[k][letters.indexOf(c)])
  const shift = k === 0 || ms.some((m) => m.c[1] !== 1 || m.c[2]) ? 0 : k
  const out = ms.map((m) => mk(m.c[0] === 0 ? m.c : q(m.c[0] + (m.c[0] > 0 ? shift : -shift)), rename(m.raw)))
  return simplified(out).length === simplified(ms).length ? out : ms.map((m) => mk(m.c, rename(m.raw)))
}

const origTex = (ms: Mono[]) => polyTex(ms.map((m) => ({ c: m.c, v: m.raw })))

export function build(no: number, bank: [string, string][], variantsOf = no, sec?: string, extra?: Record<string, string[]>): Exercise {
  const questions: Question[] = bank.map(([part, src], idx) => {
    const ms = parse(src)
    const [choices, correct] = finalChoices(ms, idx)
    return {
      part,
      tex: origTex(ms),
      choices,
      correct,
      why: '',
      lesson: () => lessonFor(no, ms, part, idx),
      practice: topTen(
        // Gemini's own expressions: something to collect
        (extra?.[part] ?? generated(variantsOf, part))
          .map(parseSafe)
          .filter((v): v is Mono[] => !!v && classes(v).some((g) => g.length > 1) && simplified(v).length > 0),
        [0, 1, 2, 3].map((k) => variant(ms, k)),
        origTex,
        ms,
      ).map((v, k): Practice => {
        const [pc, pa] = finalChoices(v, idx + k + 1)
        return { tex: origTex(v), choices: pc, correct: pa, why: '', lesson: () => lessonFor(no, v, `${part}${k + 1}`, idx + k + 1) }
      }),
    }
  })
  return { no, ...(sec ? { sec } : {}), prompt: 'Simplify', mathChoices: true, questions }
}

export const buildCollect = build // used by hard5-data.ts (challenge exercises with their own questions)
export const EX8 = build(8, [
  ['a', '2x - 3 - x + 2'],
  ['b', '-3 + 3x - 2 - x'],
  ['c', '2x^2 + x - x^2 - x'],
  ['d', '3x^2 - y^2 + 3y^2 - x^2'],
  ['e', '-4x^2 - 3x + 4 + 2x'],
  ['f', '-5x + 2y + 4y - x'],
  ['g', '4x - 3y + 6x - 5x'],
  ['h', '-2x^2 - 5 + 2x + x^2 - 3 - x'],
  ['i', '3xy - 4yx + 2xy - yx'],
  ['j', '-5xy - 2yx - y + 2x - 6yx'],
  ['k', '13x - 7 - 4x + 2'],
  ['l', '22 + 5x + 7y - x + y - 28'],
  ['m', '2/3x + 1/3x'],
  ['n', '2y + 3/4y + y'],
  ['o', '1/2x + x - 5x'],
  ['p', '-8 + 11x - 5y + 7x - 7y + 6'],
  ['q', '8x - 5x + 4 + 3y - 2x - 7'],
  ['r', '-3x^2 - 4x + x^2 - 2x + 4'],
  ['s', '-2xy + 3x + 5xy - 2y - x - y'],
  ['t', '4xy - 2x - 5xy + 4x - 7'],
])

export const EX10 = build(10, [
  ['a', '-a + 3/4 + 15a^2 - a - 1/2 - 3a^2'],
  ['b', '3 + 2b^2 - 5b - 2b + 4b^2'],
  ['c', '-6c^2 + c - 5c + 7c^2 + 1'],
  ['d', '-2d - 2d - 2d + d^2 - 5d^2'],
  ['e', '2e - 5/6 + 4e^2 + e + 1/3 - 2e'],
  ['f', '-3fg + 4gf - 4f^2 + g^2'],
  ['g', '1/4h^2 - 5 + 1/2h^2 - 2h - 9'],
  ['h', '1/3i^2 + 2i - 1/6i^2 + 4 - 9'],
  ['i', '1/4j^2 - j - 1/6j + 3/8j^2 + 5/16j^2'],
  ['j', '1/5k^2 + 1/5 - 2k + 1/10 - 3/15k^2 + 2k - 3/10'],
  ['k', '1/4x^2 + 3/4x + 1/6x^2 - 5/6x'],
  ['l', '2/5x^2 - 1/3x + 4/3x^2 + 1/5x'],
  ['m', '2.8x^2 - x + 1.4x^2 - 3.2x + 1'],
  ['n', '-4.9x - 3.2y - 1.3x + 4.2y + 1'],
  ['o', '-3.2x + 1.7y - 1.2x - 2.8y - 5'],
  ['p', '2.9x + 2.3y - 1.9x - 1.8y'],
  ['q', '11/4x + 2/3y - 3/5x - 1/3y + 10'],
  ['r', '11/2x + 9/5y - 2/3x - 3/10y - 37'],
])
