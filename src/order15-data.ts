// Grade 9 1.5 Order of Operations (bank/G9-ch1/final/s5, mineru G9 Chapter 1): exercises 1 to 4 (5 to 9 are left out).
//   1 calculate (no brackets), 2 simplify (brackets and division), 3 powers and fractions, 4 nested brackets
// plus one challenge exercise for each (longer expressions, nested brackets, bigger powers; optional extra practice with its own progress, shown as no 21 to 24).
// An expression is a list of tokens (numbers, operations, brackets, fractions) that is rewritten one operation at a time in the order of operations; every lesson step is one rewrite
// (the wrong answers are the same expression with another operation done first). Every answer and step is computed here.
// Imported by: quiz.tsx, check15.ts. Shape: exercise.ts.
import { build } from './graph42-data'
import { text } from './seq41-data'
import { N, hardList, idOf, mk, numW, rows } from './sqrt12-data'
import type { Item } from './sqrt12-data'

type St = Item['steps'][number]
const bt = (r: () => number, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1))
const step = (label: string, lhs: string, ans: string, wrongs: string[], hint: string): St => [label, lhs, ans, `$${lhs} \\square$`, wrongs.filter((w) => w !== ans), hint]

// ---------------- tokens ----------------
export type Op = '+' | '-' | '*' | '/' | '^' | 'neg'
type Nm = { t: 'n'; v: number }
type Tk = Nm | { t: 'o'; o: Op } | { t: 'g'; l: Tk[] } | { t: 'f'; n: Tk[]; d: Tk[] }
const isN = (x?: Tk): x is Nm => !!x && x.t === 'n'
const isO = (x: Tk | undefined, o: Op) => !!x && x.t === 'o' && x.o === o
const wrapG = (l: Tk[]): Tk => (l.length === 1 && l[0].t === 'n' ? l[0] : { t: 'g', l })

// "15-(2*6)", "{4+2*6|4+2*6}" (a fraction), "-4^2": digits, + - * / ^, brackets, a fraction {top|bottom}
export function parse(s: string): Tk[] {
  let i = 0
  const list = (stop: string): Tk[] => {
    const out: Tk[] = []
    while (i < s.length && !stop.includes(s[i])) {
      const c = s[i]
      if (/\d/.test(c)) {
        let j = i
        while (/\d/.test(s[j] ?? '')) j++
        out.push({ t: 'n', v: Number(s.slice(i, j)) })
        i = j
      } else if (c === '(') {
        i++
        const l = list(')')
        i++
        out.push(wrapG(l))
      } else if (c === '{') {
        i++
        const n = list('|')
        i++
        const d = list('}')
        i++
        out.push({ t: 'f', n, d })
      } else {
        const last = out[out.length - 1]
        out.push({ t: 'o', o: c === '-' && (!last || last.t === 'o') ? 'neg' : (c as Op) })
        i++
      }
    }
    // a minus sign in front of a number that has no power is part of the number
    for (let k = 0; k < out.length - 1; k++) {
      const nx = out[k + 1]
      if (isO(out[k], 'neg') && isN(nx) && !isO(out[k + 2], '^')) out.splice(k, 2, { t: 'n', v: -nx.v })
    }
    return out
  }
  return list('')
}
const height = (l: Tk[]): number => Math.max(0, ...l.map((x) => (x.t === 'g' ? 1 + height(x.l) : 0)))
const BR = [['(', ')'], ['[', ']'], ['\\{', '\\}']]
export function tex(l: Tk[]): string {
  let s = ''
  for (let i = 0; i < l.length; i++) {
    const x = l[i]
    if (x.t === 'n') {
      const wrap = x.v < 0 && ((i > 0 && l[i - 1].t === 'o') || isO(l[i + 1], '^'))
      s += wrap ? `(${x.v})` : String(x.v)
    } else if (x.t === 'o') {
      if (x.o === '^') {
        s += `^{${(l[i + 1] as Nm).v}}`
        i++
      } else s += x.o === '+' ? ' + ' : x.o === '-' ? ' - ' : x.o === '*' ? ' \\times ' : x.o === '/' ? ' \\div ' : '-'
    } else if (x.t === 'g') {
      const [a, b] = BR[Math.min(height(x.l), 2)]
      s += `${a}${tex(x.l)}${b}`
    } else s += `\\frac{${tex(x.n)}}{${tex(x.d)}}`
  }
  return s
}

// ---------------- one rewrite in the order of operations ----------------
const calc = (a: number, o: Op, b: number): number | null =>
  o === '+' ? a + b : o === '-' ? a - b : o === '*' ? a * b : o === '/' ? (b !== 0 && a % b === 0 ? a / b : null) : o === '^' ? (b >= 0 && b <= 12 ? a ** b : null) : null
const reduceAt = (l: Tk[], i: number): Tk[] | null => {
  const [a, o, b] = [l[i - 1], l[i], l[i + 1]]
  if (!isN(a) || !isN(b) || o.t !== 'o') return null
  const v = calc(a.v, o.o, b.v)
  return v === null || Math.abs(v) > 20000 ? null : [...l.slice(0, i - 1), { t: 'n', v }, ...l.slice(i + 2)]
}
const sub = (l: Tk[], i: number, x: Tk) => [...l.slice(0, i), x, ...l.slice(i + 1)]
interface Res {
  list: Tk[]
  kinds: string[] // from the outside in: group, fpart, then power / neg / muldiv / addsub / frac
  alts: Tk[][] // the same expression with another operation done
}
function next(l: Tk[]): Res | null {
  for (let i = 0; i < l.length; i++) {
    const x = l[i]
    if (x.t === 'g') {
      const r = next(x.l)
      if (r) return { list: sub(l, i, wrapG(r.list)), kinds: ['group', ...r.kinds], alts: r.alts.map((a) => sub(l, i, wrapG(a))) }
    } else if (x.t === 'f') {
      if (x.n.length === 1 && x.d.length === 1 && isN(x.n[0]) && isN(x.d[0])) {
        const v = calc(x.n[0].v, '/', x.d[0].v)
        if (v === null) throw new Error('inexact')
        return { list: sub(l, i, { t: 'n', v }), kinds: ['frac'], alts: [] }
      }
      const rn = x.n.length > 1 ? next(x.n) : null
      if (rn) return { list: sub(l, i, { t: 'f', n: rn.list, d: x.d }), kinds: ['fpart', ...rn.kinds], alts: rn.alts.map((a) => sub(l, i, { t: 'f', n: a, d: x.d })) }
      const rd = x.d.length > 1 ? next(x.d) : null
      if (rd) return { list: sub(l, i, { t: 'f', n: x.n, d: rd.list }), kinds: ['fpart', ...rd.kinds], alts: rd.alts.map((a) => sub(l, i, { t: 'f', n: x.n, d: a })) }
    }
  }
  if (!l.every((x) => x.t === 'n' || x.t === 'o')) return null
  const at = (ops: Op[]) => l.map((x, i) => (x.t === 'o' && ops.includes(x.o) ? i : -1)).filter((i) => i >= 0)
  const negAt = at(['neg']).filter((i) => isN(l[i + 1]))
  let kind: string
  let idx: number
  if (at(['^']).length) [kind, idx] = ['power', at(['^'])[0]]
  else if (negAt.length) [kind, idx] = ['neg', negAt[0]]
  else if (at(['*', '/']).length) [kind, idx] = ['muldiv', at(['*', '/'])[0]]
  else if (at(['+', '-']).length) [kind, idx] = ['addsub', at(['+', '-'])[0]]
  else return null
  const list = kind === 'neg' ? [...l.slice(0, idx), { t: 'n', v: -(l[idx + 1] as Nm).v } as Tk, ...l.slice(idx + 2)] : reduceAt(l, idx)
  if (!list) throw new Error('inexact')
  const alts = at(['^', '*', '/', '+', '-'])
    .filter((i) => i !== idx)
    .map((i) => reduceAt(l, i))
    .filter((a): a is Tk[] => !!a && tex(a) !== tex(list))
  return { list, kinds: [kind], alts }
}
const LABEL: Record<string, string> = {
  power: 'Powers come first.',
  neg: 'Now the minus sign in front changes the sign.',
  muldiv: 'Multiply and divide from left to right, before adding and subtracting.',
  addsub: 'Add and subtract from left to right.',
  frac: 'Divide the top by the bottom.',
}
const HINT: Record<string, string> = {
  power: 'Work out the powers before anything else (after the brackets).',
  neg: 'The minus sign in front is not part of the base: the power is worked out first, then the sign changes.',
  muldiv: 'Multiplication and division come before addition and subtraction; at the same level go from left to right.',
  addsub: 'Only additions and subtractions are left: go from left to right.',
  frac: 'The fraction bar means divide: top divided by bottom.',
}
export function walk(l0: Tk[]): { steps: St[]; value: number; firstAlts: Tk[][] } {
  const steps: St[] = []
  let l = l0
  let firstAlts: Tk[][] = []
  while (!(l.length === 1 && l[0].t === 'n')) {
    const r = next(l)
    if (!r || steps.length > 14) throw new Error('stuck')
    if (!steps.length) firstAlts = r.alts
    const last = r.kinds[r.kinds.length - 1]
    const pre = (r.kinds.includes('group') ? 'Brackets first. ' : '') + (r.kinds.includes('fpart') ? 'Work out the top and the bottom first. ' : '')
    steps.push(step(pre + LABEL[last], `${tex(l)} =`, tex(r.list), r.alts.map(tex), HINT[last]))
    l = r.list
  }
  return { steps, value: (l[0] as Nm).v, firstAlts }
}

// ---------------- items ----------------
function itemOf(src: string, verb: string): Item {
  const l = parse(src)
  const { steps, value, firstAlts } = walk(l)
  if (Math.abs(value) > 5000) throw new Error('big')
  const extra = firstAlts.map((a) => {
    try {
      return walk(a).value
    } catch {
      return value
    }
  })
  return { q: `${text(verb)}${tex(l)}`, short: tex(l), ans: N(value), wrong: numW(value, extra.filter((v) => v !== value)), steps }
}
// tries other numbers until the expression is valid (every division exact)
export const make = (verb: string, f: () => string): Item => {
  for (let k = 0; k < 3000; k++) {
    try {
      return itemOf(f(), verb)
    } catch {
      /* try other numbers */
    }
  }
  throw new Error('no item')
}
const SIM = 'Simplify: '

// exercise 1: a pattern of operations between numbers; the left number of a division is a multiple of the divisor
const pattern = (r: () => number, ops: Op[], lo: number, hi: number): string => {
  const nums = Array.from({ length: ops.length + 1 }, () => bt(r, lo, hi))
  ops.forEach((o, i) => {
    if (o === '/') nums[i] = nums[i + 1] * bt(r, 2, 9)
  })
  return nums.map((v, i) => `${v}${ops[i] ?? ''}`).join('')
}
const P1: Op[][] = [['+', '*'], ['*', '+', '*'], ['*', '-', '*'], ['-', '/', '-'], ['/', '-', '/'], ['-', '/', '-'], ['-', '-', '/'], ['*', '-', '-'], ['-', '*', '-'], ['/', '-', '-']]
const E1: Item[][] = P1.map((ops, i) => hardList(10 + i, 15, (r) => make('Calculate: ', () => pattern(r, ops, 2, 12))))
const P1H: Op[][] = [['+', '*', '-', '/'], ['*', '+', '/', '-', '*'], ['-', '/', '+', '*', '-'], ['/', '*', '-', '+', '/']]
const H1: Item[][] = P1H.map((ops, i) => hardList(110 + i, 15, (r) => make('Calculate: ', () => pattern(r, ops, 3, 15))))

// exercise 2: brackets and division
export type Tpl = (r: () => number) => string
export const R = (r: () => number) => (lo: number, hi: number) => bt(r, lo, hi)
const divNest: Tpl = (r) => { const b = R(r); const q = b(2, 5); const m = b(2, 6); const t = b(2, 9); return `${m * t}/(${q * m}/${q})` }
const divNest2: Tpl = (r) => { const b = R(r); const x = b(2, 9); const c = b(2, 5); const k = b(2, 6); return `(${x * c * k}/${x})/${c}` }
const T2: Tpl[] = [
  (r) => { const b = R(r); return `${b(10, 40)}-(${b(2, 9)}*${b(2, 9)})` },
  (r) => { const b = R(r); return `(${b(5, 20)}-${b(2, 9)})+${b(2, 12)}` },
  (r) => { const b = R(r); return `-${b(2, 12)}-(${b(5, 15)}-${b(2, 9)})` },
  (r) => { const b = R(r); return `(-${b(2, 12)}-${b(2, 12)})-${b(2, 9)}` },
  (r) => { const b = R(r); return `-(${b(5, 15)}-${b(2, 9)})+(${b(2, 9)}-${b(5, 15)})` },
  divNest,
  divNest2,
  divNest,
  divNest2,
  (r) => { const b = R(r); const w = b(2, 6); const y = w * b(1, 4); const z = w * b(1, 3); return `${b(10, 30)}-(${y}+${z})/${w}-${b(5, 25)}` },
]
const E2: Item[][] = T2.map((t, i) => hardList(20 + i, 15, (r) => make(SIM, () => t(r))))
const T2H: Tpl[] = [
  (r) => { const b = R(r); return `${b(40, 90)}-(${b(10, 30)}-${b(2, 9)})-(${b(2, 20)}+${b(2, 20)})` },
  (r) => { const b = R(r); return `(${b(20, 60)}-${b(2, 30)})-(${b(2, 30)}-${b(2, 30)})+(${b(2, 30)}-${b(2, 30)})` },
  (r) => { const b = R(r); const q = b(2, 5); const m = b(2, 6); const t = b(2, 6); const z = b(2, 4); return `${m * t * z * 2}/(${q * m}/${q})/${z}` },
  (r) => { const b = R(r); return `-(${b(5, 30)}-${b(2, 9)})*${b(2, 9)}+(${b(2, 30)}-${b(5, 40)})` },
]
const H2: Item[][] = T2H.map((t, i) => hardList(120 + i, 15, (r) => make(SIM, () => t(r))))

// exercise 3: powers and fractions
const pw = (r: () => number): [number, number, number, number, number] => { const b = bt(r, 2, 3); const p = bt(r, 3, 6); const q = bt(r, 1, p); const rr = bt(r, 2, 4); const s = bt(r, 1, p - q + rr); return [b, p, q, rr, s] }
const T3: Tpl[] = [
  (r) => { const b = R(r); return `${b(2, 9)}*${b(2, 4)}^${b(2, 3)}` },
  (r) => { const b = R(r); return `(${b(2, 5)}*${b(2, 5)})^2` },
  (r) => { const b = R(r); return `-${b(2, 12)}-${b(2, 5)}^2` },
  (r) => { const b = R(r); return `(-${b(2, 9)}-${b(2, 9)})^2` },
  (r) => { const [b, p, q, rr, s] = pw(r); return `${b}^${p}/${b}^${q}*${b}^${rr}/${b}^${s}` },
  (r) => { const [b, p, q, rr, s] = pw(r); return `(${b}^${p}/${b}^${q})*(${b}^${rr}/${b}^${s})` },
  (r) => { const b = R(r); const a = b(2, 9); const m = b(2, 9); const c = b(2, 9); return `{${a}+${m}*${c}|${a}+${m}*${c}}` },
  (r) => { const b = R(r); return `{(${b(2, 9)}+${b(1, 9)})*${b(2, 6)}|${b(2, 9)}+${b(1, 9)}*${b(2, 6)}}` },
  (r) => { const b = R(r); return `{${b(10, 30)}+${b(2, 6)}*${b(2, 6)}|${b(10, 30)}-${b(2, 6)}*${b(2, 6)}}` },
  (r) => { const b = R(r); return `{(${b(5, 20)}+${b(2, 9)})*${b(2, 6)}|${b(8, 20)}-${b(2, 6)}*${b(2, 4)}}` },
]
const E3: Item[][] = T3.map((t, i) => hardList(30 + i, 15, (r) => make(SIM, () => t(r))))
const T3H: Tpl[] = [
  (r) => { const b = R(r); const a = b(6, 20); return `{${a}^2-${b(2, a - 1)}^2|${a}-${b(2, a - 1)}}` },
  (r) => { const b = R(r); const a = b(2, 9); const c = b(2, 9); return `{${a}^3+${c}^3|${a}+${c}}` },
  (r) => { const b = R(r); return `${b(20, 60)}-(${b(2, 9)}-${b(2, 9)})^3*${b(2, 5)}` },
  (r) => { const [b, p, q, rr, s] = pw(r); return `${b}^${p + 2}/${b}^${q}*${b}^${rr}/${b}^${s}/${b}` },
]
const H3: Item[][] = T3H.map((t, i) => hardList(130 + i, 15, (r) => make(SIM, () => t(r))))

// exercise 4: nested brackets, powers and fractions
const T4: Tpl[] = [
  (r) => { const b = R(r); return `${b(5, 20)}+${b(2, 5)}*((${b(10, 30)}-${b(2, 9)})-(${b(2, 9)}+${b(2, 3)}^${b(2, 3)}))` },
  (r) => { const b = R(r); return `{${b(2, 3)}^${b(3, 5)}-(${b(1, 3)}^2+${b(2, 4)}^2)|${b(2, 6)}}` },
  (r) => { const b = R(r); return `${b(2, 9)}+${b(2, 5)}*(${b(2, 5)}^2-${b(2, 9)})^2` },
  (r) => { const b = R(r); return `${b(2, 5)}^2*((${b(8, 30)}-${b(2, 6)})/${b(2, 6)})` },
  (r) => { const b = R(r); return `{(-${b(2, 6)})^2-${b(2, 6)}*${b(2, 6)}|${b(2, 3)}^3-${b(2, 4)}*(-1)^4}` },
  (r) => { const b = R(r); return `${b(6, 30)}/${b(2, 6)}+(${b(2, 5)}*${b(2, 3)}^3-(${b(2, 9)}+(${b(5, 12)}-${b(2, 4)})))` },
]
const E4: Item[][] = T4.map((t, i) => hardList(40 + i, 15, (r) => make(SIM, () => t(r))))
const T4H: Tpl[] = [
  (r) => { const b = R(r); return `${b(5, 30)}-${b(2, 4)}*((${b(2, 9)}^2-${b(2, 30)})-(${b(2, 9)}+${b(2, 3)}^${b(2, 4)}))/${b(2, 4)}` },
  (r) => { const b = R(r); return `{(${b(2, 9)}-${b(10, 20)})^2-${b(2, 5)}^3|${b(2, 9)}-(${b(2, 5)}-${b(2, 9)})}*${b(2, 5)}` },
  (r) => { const b = R(r); return `-${b(2, 5)}^2+((${b(10, 40)}-${b(2, 9)})/${b(2, 9)}-(${b(2, 9)}-${b(2, 6)})^2)*${b(2, 6)}` },
  (r) => { const b = R(r); return `${b(20, 90)}/${b(2, 5)}+{${b(2, 5)}*(${b(2, 5)}^3-${b(2, 9)})-(${b(2, 9)}+(${b(10, 20)}-${b(2, 9)}))|${b(2, 6)}}` },
]
const H4: Item[][] = T4H.map((t, i) => hardList(140 + i, 15, (r) => make(SIM, () => t(r))))

// ================= the exercises =================
export const EX_ORDER15 = [
  build(1, 'Choose the answer.', rows(E1), mk, idOf, 'Calculate', 15100, '1.5'),
  build(2, 'Choose the answer.', rows(E2), mk, idOf, 'Brackets and division', 15200, '1.5'),
  build(3, 'Choose the answer.', rows(E3), mk, idOf, 'Powers and fractions', 15300, '1.5'),
  build(4, 'Choose the answer.', rows(E4), mk, idOf, 'Nested brackets', 15400, '1.5'),
]
export const EX_ORDER15H = [
  build(21, 'Choose the answer.', rows(H1), mk, idOf, 'Calculate', 15121, '1.5'),
  build(22, 'Choose the answer.', rows(H2), mk, idOf, 'Brackets and division', 15222, '1.5'),
  build(23, 'Choose the answer.', rows(H3), mk, idOf, 'Powers and fractions', 15323, '1.5'),
  build(24, 'Choose the answer.', rows(H4), mk, idOf, 'Nested brackets', 15424, '1.5'),
]
