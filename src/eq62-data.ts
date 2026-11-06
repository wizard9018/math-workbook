// Grade 9 6.2 exercises 1-4 (bank/G9-ch6/s2/items.json): equations with fractions (1), fractions and brackets (2), decimals (3), decimals and brackets (4).
// Lesson: remove the brackets (a question: the new line), multiply every term by the LCD / a power of 10 (a question: by what), the line of products, the line without
// fractions or decimals (a question), then the solving steps of 6.1 (eq-data.ts lessonEq: move the terms with a blank, collect, divide).
// The 10 similar questions of every question are written by Gemini (gen-variants-62.py, variants62.json); the solutions and every step are computed here.
// Imported by: quiz.tsx, word62-data.ts, check62.ts. Shape: exercise.ts.
import type { Exercise, Practice, Question } from './exercise'
import type { Lesson, Step, Tok } from './lessons'
import V62 from './variants62.json'
import BOOK62 from './book62.json'
import { lessonEq, numTex, qmul, solution } from './eq-data'
import type { Eq } from './eq-data'
import { abs, add, coefTex, lcm, mk, neg, pick, q, termTex, topTen } from './simplify-data'
import type { Mono, Q } from './simplify-data'

// a term: a number times the variable (or alone); `over`: written x/6 (a fraction with the variable on top); `group`: a number times a bracket (c is the factor)
export interface Tm {
  c: Q
  v: string
  over?: boolean
  group?: Tm[]
}
export interface Eq62 {
  v: string
  l: Tm[]
  r: Tm[]
  dec: boolean // decimals (else fractions)
}

const rat = (s: string): Q => {
  const [i, f = ''] = s.split('.')
  return q(Number(i + f), 10 ** f.length)
}
const NUM = /^(\d+(?:\.\d+)?)?(?:\/(\d+))?([a-z])?(?:\/(\d+))?$/
function terms(s: string, nested: boolean): Tm[] | null {
  const parts: string[] = []
  let depth = 0
  let cur = ''
  for (const ch of s) {
    if (ch === '(') depth++
    if (ch === ')') depth--
    if (depth < 0) return null
    if ((ch === '+' || ch === '-') && depth === 0 && cur !== '') {
      parts.push(cur)
      cur = ''
    }
    cur += ch
  }
  if (depth !== 0 || cur === '') return null
  parts.push(cur)
  const out: Tm[] = []
  for (const p of parts) {
    const sign = p[0] === '-' ? -1 : 1
    const body = p.replace(/^[+-]/, '')
    const g = body.match(/^(\d+(?:\.\d+)?(?:\/\d+)?)?\((.*)\)$/)
    if (g) {
      if (nested) return null
      const [a, d = '1'] = (g[1] ?? '1').split('/')
      const inner = terms(g[2], true)
      if (!inner || Number(d) === 0) return null
      const f = rat(a)
      out.push({ c: q(sign * f[0], f[1] * Number(d)), v: '', group: inner })
      continue
    }
    const m = body.match(NUM)
    if (!m || (!m[1] && !m[3]) || (m[2] && m[4]) || (m[4] && !m[3])) return null
    const den = Number(m[2] ?? m[4] ?? 1)
    const num = m[1] ? rat(m[1]) : q(1)
    if (den === 0 || num[0] === 0) return null
    out.push({ c: q(sign * num[0], num[1] * den), v: m[3] ?? '', over: !!m[4] })
  }
  return out
}

const flat = (ts: Tm[]): Tm[] => ts.flatMap((t) => (t.group ? t.group.map((u) => ({ c: qmul(t.c, u.c), v: u.v })) : [t]))

// the number every term is multiplied by to make the coefficients whole (1: nothing to do); 0: not possible
function multiplier(dec: boolean, fl: Tm[]): number {
  const cs = fl.map((t) => t.c)
  if (!dec) return cs.reduce((L, c) => lcm(L, c[1]), 1)
  for (let k = 0; k <= 4; k++) if (cs.every((c) => (c[0] * 10 ** k) % c[1] === 0)) return 10 ** k
  return 0
}
const withL = (e: Eq62, f: (right: boolean, i: number, t: Tm, c: Q) => Q, L: number): Eq => {
  const side = (ts: Tm[], right: boolean) => flat(ts).map((t, i) => mk(f(right, i, t, qmul(t.c, q(L))), t.v))
  return { v: e.v, l: side(e.l, false), r: side(e.r, true) }
}
const safeSol = (eq: Eq): Q | null => {
  const s = solution(eq)
  return Number.isFinite(s[0]) && Number.isFinite(s[1]) && s[1] > 0 ? s : null
}

export function parseEq62(s: unknown): Eq62 | null {
  if (typeof s !== 'string') return null
  const t = s.replace(/\s/g, '')
  if (!/^[-+0-9a-z/.()]+=[-+0-9a-z/.()]+$/.test(t)) return null
  const [ls, rs] = t.split('=')
  const l = terms(ls, false)
  const r = terms(rs, false)
  if (!l || !r || l.length > 6 || r.length > 6) return null
  const letters = new Set([...flat(l), ...flat(r)].map((x) => x.v).filter(Boolean))
  if (letters.size !== 1) return null
  const e: Eq62 = { v: [...letters][0], l, r, dec: t.includes('.') }
  const L = multiplier(e.dec, [...flat(l), ...flat(r)])
  const hasGroup = [...l, ...r].some((x) => x.group)
  if (!L || (L === 1 && !hasGroup)) return null
  return safeSol(withL(e, (_, __, ___, c) => c, L)) ? e : null
}

// ---- TeX ----
const dstr = (c: Q) => String(+(Math.abs(c[0]) / c[1]).toFixed(6))
const absTex = (c: Q, dec: boolean) => (dec ? dstr(c) : coefTex([Math.abs(c[0]), c[1]]))
const sgnTex = (c: Q, dec: boolean) => (c[0] < 0 ? '-' : '') + absTex(c, dec)
const isOne = (c: Q) => Math.abs(c[0]) === c[1]
function bodyTex(t: Tm, dec: boolean): string {
  if (t.group) return `${isOne(t.c) ? '' : absTex(t.c, dec)}(${sideTex(t.group, dec)})`
  if (!t.v) return absTex(t.c, dec)
  if (t.over) return `\\frac{${Math.abs(t.c[0]) === 1 ? '' : Math.abs(t.c[0])}${t.v}}{${t.c[1]}}`
  return (isOne(t.c) ? '' : absTex(t.c, dec)) + t.v
}
function sideTex(ts: Tm[], dec: boolean): string {
  return ts.map((t, i) => (i === 0 ? (t.c[0] < 0 ? '-' : '') : t.c[0] < 0 ? ' - ' : ' + ') + bodyTex(t, dec)).join('')
}
export const texEq62 = (e: Eq62) => `${sideTex(e.l, e.dec)} = ${sideTex(e.r, e.dec)}`

// ---- the wrong equations a student gets: used for the wrong choices of the questions of the lesson ----
function wrongEqs(e: Eq62, L: number): Eq[] {
  const f = (g: (right: boolean, i: number, t: Tm, c: Q) => Q) => withL(e, g, L)
  const nl = flat(e.l).length
  const firstVarL = flat(e.l).findIndex((t) => t.v)
  return [
    f((_, __, t, c) => (t.v ? c : t.c)), // the numbers are not multiplied
    f((right, _, t, c) => (right ? t.c : c)), // the right side is not multiplied
    f((right, i, _, c) => (!right && i === nl - 1 ? neg(c) : c)), // the last term of the left side changes its sign
    f((right, i, _, c) => (right && i === 0 ? neg(c) : c)), // the first term of the right side changes its sign
    f((right, i, _, c) => (!right && i === firstVarL ? add(c, q(1)) : c)), // a slip in the first term with the variable
  ]
}

// the solving equation: every term multiplied by L, brackets removed
export const solveEq62 = (e: Eq62, L = multiplier(e.dec, [...flat(e.l), ...flat(e.r)])): Eq => withL(e, (_, __, ___, c) => c, L)

export function lesson62(e: Eq62, key: string, no: number, idx: number): Lesson {
  const dec = e.dec
  const fl = { l: flat(e.l), r: flat(e.r) }
  const all = [...fl.l, ...fl.r]
  const L = multiplier(dec, all)
  const groups = [...e.l, ...e.r].filter((t) => t.group)
  const solveEq = solveEq62(e, L)
  const solve = lessonEq(solveEq, key, no, idx + 3)
  const steps: Step[] = []
  let prev = 'e0'
  let n = 1
  const ask = (prompt: string, right: string, wrong: string[], hint: string, resultTex: string, last: boolean) => {
    const [options, correct] = pick(right, wrong, idx + n)
    const id = `e${n++}`
    steps.push({
      focus: [prev],
      result: last ? solve.start[0] : { id, tex: resultTex },
      ...(last ? { results: solve.start } : {}),
      arrows: [],
      say: '',
      calcPrompt: prompt,
      calc: { q: prompt, options, correct, hints: options.map((_, j) => (j === correct ? '' : hint)), spell: hint },
    })
    prev = id
  }

  // 1) the brackets: every term inside is multiplied by the number in front
  if (groups.length && L === 1) {
    const expandWith = (f: (g: number, j: number, len: number, p: Q, u: Tm) => Q) => {
      let g = 0
      const ex = (ts: Tm[]) => ts.flatMap((t) => (t.group ? ((gi) => t.group!.map((u, j) => ({ c: f(gi, j, t.group!.length, qmul(t.c, u.c), u), v: u.v })))(g++) : [t]))
      return `${sideTex(ex(e.l), dec)} = ${sideTex(ex(e.r), dec)}`
    }
    const right = expandWith((_, __, ___, p) => p)
    const wrong: string[] = []
    groups.forEach((_, gi) => {
      wrong.push(expandWith((g, j, len, p) => (g === gi && j === len - 1 ? neg(p) : p))) // the sign of the last product
      wrong.push(expandWith((g, j, _l, p, u) => (g === gi && j > 0 ? u.c : p))) // only the first term is multiplied
      wrong.push(expandWith((g, j, _l, p) => (g === gi && j === 0 ? neg(p) : p))) // the sign of the first product
    })
    wrong.push(expandWith((g, _j, _l, p) => (g === 0 ? neg(p) : p)))
    const g0 = groups[0]
    const par = (c: Q) => (c[0] < 0 ? `(${sgnTex(c, dec)})` : sgnTex(c, dec))
    const term = (u: Tm) => (u.c[0] < 0 ? `(-${bodyTex(u, dec)})` : bodyTex(u, dec))
    const hint = `$${(g0.c[0] < 0 ? '-' : '') + bodyTex(g0, dec)} = ${g0.group!.map((u) => `${par(g0.c)} \\cdot ${term(u)}`).join(' + ')}$`
    ask('Remove the brackets.', right, wrong, hint, right, L === 1)
  }

  // 2) every term is multiplied by L (the LCD, or a power of 10)
  if (L > 1) {
    const dens = [...new Set(all.map((t) => t.c[1]).filter((d) => d > 1))].sort((a, b) => a - b)
    const prompt = dec ? '$\\times\\,\\square\\;\\to\\;\\text{whole numbers}$' : `$\\mathrm{LCD}(${dens.join(',\\,')})=\\square$`
    const mHint = dec ? `$${all.slice(0, 2).map((t) => bodyTex(t, true)).join(',\\; ')} \\;\\to\\; \\text{whole numbers}$` : `$\\mathrm{LCD} = \\text{the smallest number that } ${dens.join(',\\,')} \\text{ all divide}$`
    const pool = dec ? [L / 10, L * 10, L * 100, L / 100].filter((x) => x >= 1) : [Math.max(...dens), dens.reduce((a, b) => a * b, 1), 2 * L, L + 1, L - 1, dens.reduce((a, b) => a + b, 0)]
    const wrongs = pool.filter((x) => x !== L && x > 0).map(String)
    // the line of products, one token per term (so that each term can send an arrow to its blank in the next step)
    // a bracket is two tokens: the number part (L times the factor, where the arrow starts) and the bracket
    const part = (t: Tm, i: number, sd: string): Tok[] => {
      const sign = i === 0 ? (t.c[0] < 0 ? '-' : '') : t.c[0] < 0 ? '-' : '+'
      if (!t.group) return [{ id: `p${sd}${i}`, tex: sign + `${L}\\cdot ${bodyTex(t, dec)}` }]
      return [
        { id: `p${sd}${i}`, tex: sign + `${L}\\cdot ${absTex(t.c, dec)}` },
        { id: `p${sd}${i}b`, tex: `(${sideTex(t.group, dec)})` },
      ]
    }
    const ptoks: Tok[] = [...e.l.flatMap((t, i) => part(t, i, 'l')), { id: 'pq', tex: '=' }, ...e.r.flatMap((t, i) => part(t, i, 'r'))]
    const [mo, mc] = pick(String(L), wrongs, idx + n)
    steps.push({ focus: [prev], result: ptoks[0], results: ptoks, arrows: [], say: '', calcPrompt: prompt, calc: { q: prompt, options: mo, correct: mc, hints: mo.map((_, j) => (j === mc ? '' : mHint)), spell: mHint } })
    // 3) the blanks: a plain term becomes its whole number; a bracket only gets its number in front (L times the factor), the brackets are removed in the next step
    const blank = (id: string, from: string, prompt: string, right: string, wr: string[], hint: string, salt: number, extra: { after?: string; hide?: string[] } = {}) => {
      const [options, correct] = pick(right, wr.filter((w) => !/^[+-]?0$/.test(w)), idx + n + salt)
      return { id, from, ...extra, calc: { q: prompt, options, correct, hints: options.map((_, j) => (j === correct ? '' : hint)), spell: hint } }
    }
    const flatOf = (sd: 'l' | 'r', kk: number) => ({ m: (sd === 'l' ? solveEq.l : solveEq.r)[kk], o: (sd === 'l' ? fl.l : fl.r)[kk], tex: solve.start.find((s) => s.id === `${sd}${kk}`)!.tex })
    const slipsOf = (m: Mono, o: Q, sg: boolean) => [termTex(neg(m.c), m.raw, sg), termTex(o, m.raw, sg), termTex(add(m.c, q(1)), m.raw, sg), termTex(add(m.c, q(-1)), m.raw, sg)]
    const arrowsOf = (bs: { id: string; from: string }[]) => bs.map((b) => ({ from: [b.from], to: [b.id] }))
    if (!groups.length) {
      const blanks = (['l', 'r'] as const).flatMap((sd) =>
        (sd === 'l' ? fl.l : fl.r).map((_, kk) => {
          const { m, o, tex } = flatOf(sd, kk)
          return blank(`${sd}${kk}`, `p${sd}${kk}`, `$${L}\\cdot ${bodyTex(o, dec)}$`, tex, slipsOf(m, o.c, kk > 0), `$${L}\\cdot ${bodyTex(o, dec)} = ${termTex(abs(m.c), m.raw, false)}$`, kk)
        }),
      )
      steps.push({ focus: ptoks.map((p) => p.id), result: solve.start[0], results: solve.start, blanks, arrows: arrowsOf(blanks), say: '', calcPrompt: 'What does the line become?', calc: blanks[0].calc })
    } else {
      const cTok: Record<'l' | 'r', Tok[]> = { l: [], r: [] }
      const cBlanks: ReturnType<typeof blank>[] = []
      const dBlanks: ReturnType<typeof blank>[] = []
      for (const sd of ['l', 'r'] as const) {
        let kk = 0
        ;(sd === 'l' ? e.l : e.r).forEach((t, i) => {
          const id = `c${sd}${i}`
          const src = `p${sd}${i}`
          const sg = i > 0
          if (!t.group) {
            const { m, o, tex } = flatOf(sd, kk)
            cTok[sd].push({ id: `${sd}${kk}`, tex })
            cBlanks.push(blank(`${sd}${kk}`, src, `$${L}\\cdot ${bodyTex(o, dec)}$`, tex, slipsOf(m, o.c, kk > 0), `$${L}\\cdot ${bodyTex(o, dec)} = ${termTex(abs(m.c), m.raw, false)}$`, i))
            kk++
            return
          }
          const f = qmul(t.c, q(L)) // the number in front of the bracket after the multiplication
          const fa = Math.abs(f[0])
          const sign = (c: Q) => (c[0] < 0 ? '-' : sg ? '+' : '')
          const inner = `(${sideTex(t.group, dec)})`
          const opt = (c: Q) => sign(c) + absTex(c, dec)
          const wr = [opt(neg(f)), opt(t.c), opt(add(f, q(1))), opt(add(f, q(-1)))]
          const prompt = `$${L}\\cdot ${absTex(t.c, dec)}$`
          const hint = `$${L}\\cdot ${absTex(t.c, dec)} = ${fa}$`
          if (fa === 1 && f[0] > 0) {
            // a bracket with 1 in front just drops its brackets: the new line is already the terms inside, no extra step
            const ids = t.group.map(() => `${sd}${kk++}`)
            cTok[sd].push(...ids.map((x) => ({ id: x, tex: solve.start.find((s) => s.id === x)!.tex })))
            cBlanks.push(blank(ids[0], src, prompt, opt(f), wr, hint, i, { after: inner, hide: ids.slice(1) }))
            return
          }
          cTok[sd].push({ id, tex: sign(f) + (fa === 1 ? '' : String(fa)) + inner })
          cBlanks.push(blank(id, src, prompt, opt(f), wr, hint, i, { after: inner }))
          // the brackets are removed: every term inside is multiplied by that number
          const fTex = f[0] < 0 ? `(-${fa})` : String(fa)
          for (const u of t.group) {
            const { m, o, tex } = flatOf(sd, kk)
            const uTex = u.c[0] < 0 ? `(-${bodyTex(u, dec)})` : bodyTex(u, dec)
            dBlanks.push(blank(`${sd}${kk}`, id, `$${fTex}\\cdot ${uTex}$`, tex, slipsOf(m, o.c, kk > 0), `$${fTex}\\cdot ${uTex} = ${termTex(abs(m.c), m.raw, false)}$`, kk))
            kk++
          }
        })
      }
      const ctoks: Tok[] = dBlanks.length ? [...cTok.l, { id: 'q', tex: '=' }, ...cTok.r] : solve.start
      steps.push({ focus: ptoks.map((p) => p.id), result: ctoks[0], results: ctoks, blanks: cBlanks, arrows: arrowsOf(cBlanks), say: '', calcPrompt: 'What does the line become?', calc: cBlanks[0].calc })
      // a bracket with another number in front: its terms are multiplied by that number in a second step
      if (dBlanks.length) steps.push({ focus: ctoks.map((c) => c.id), result: solve.start[0], results: solve.start, blanks: dBlanks, arrows: arrowsOf(dBlanks), say: '', calcPrompt: 'What does the line become?', calc: dBlanks[0].calc })
    }
  }
  return {
    key: `eq62-${no}-${key}`,
    label: key,
    source: `Grade 9, 6.2 exercise ${no}${key}`,
    title: 'Solve',
    prompt: 'Solve:',
    answer: solve.answer,
    start: [{ id: 'e0', tex: texEq62(e) }],
    steps: [...steps, ...solve.steps],
    review: { heading: 'Solving equations', rows: [] },
  }
}

// the choices of the question itself: the answer, the sign slip, the numbers not multiplied, one more or less
export function choices62(e: Eq62, idx: number): [string[], number] {
  const L = multiplier(e.dec, [...flat(e.l), ...flat(e.r)])
  const x = solution(solveEq62(e, L))
  const tx = (c: Q) => `${e.v} = ${numTex(c)}`
  const slips = wrongEqs(e, L).map(safeSol).filter((s): s is Q => !!s)
  return pick(tx(x), [tx(neg(x)), ...slips.map(tx), tx(add(x, q(1))), tx(add(x, q(-1)))], idx)
}

// ---- the exercises ----
const BOOK = BOOK62 as Record<string, Record<string, string>>
const VARS = V62 as Record<string, Record<string, unknown[]>>
export type Custom62 = { shown: number; book: [string, string][]; gen: Record<string, string[]> }
function build(no: string, custom?: Custom62): Exercise {
  const dec = no === '3' || no === '4'
  const brackets = no === '2' || no === '4'
  const fits = (x: Eq62 | null): x is Eq62 => {
    if (!x || x.dec !== dec || [...x.l, ...x.r].some((t) => t.group) !== brackets) return false
    const s = solution(solveEq62(x))
    return Math.abs(s[0]) <= 5000 && (dec ? s[1] <= 1000 : s[1] === 1)
  }
  const questions: Question[] = (custom?.book ?? Object.entries(BOOK[no])).map(([part, src], idx): Question => {
    const book = parseEq62(src)!
    const bank = topTen((custom?.gen[part] ?? VARS[no]?.[part] ?? []).map(parseEq62).filter(fits), [], texEq62, book)
    const make = (x: Eq62, key: string, k: number): Practice => {
      const [choices, correct] = choices62(x, idx + k)
      return { tex: texEq62(x), choices, correct, why: '', lesson: () => lesson62(x, key, Number(no), idx + k) }
    }
    return { part, ...make(book, part, 0), practice: bank.map((x, k) => make(x, `${part}${k + 1}`, k + 1)) }
  })
  return { no: custom?.shown ?? Number(no), sec: '6.2', prompt: 'Determine the solution of each equation.', mathChoices: true, questions }
}

export const buildEq62 = build
export const EX62 = ['1', '2', '3', '4'].map((n) => build(n))
