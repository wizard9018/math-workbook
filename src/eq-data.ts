// Grade 9 6.1 exercises 1-5 (bank/G9-ch6/s1/items.json): is a value a solution (1), and solving linear equations: one or two steps (2), a fraction coefficient (3),
// the variable divided or in a denominator (4), several terms on each side (5).
// Lesson: the working one line under the other, like the textbook: first what to do to BOTH sides (a question), then the new equation (a question).
// The 10 similar questions of every question are written by Gemini (gen-variants-61.py, variants61.json); the solutions and every step are computed here.
// Imported by: quiz.tsx, word61-data.ts. Shape: exercise.ts.
import katex from 'katex'
import type { Exercise, Practice, Question } from './exercise'
import type { Lesson, Step, Tok } from './lessons'
import V61 from './variants61.json'
import BOOK61 from './book61.json'
import { abs, add, classes, coefTex, GREEN, hintFor, mk, neg, parse, pick, polyTex, q, sum, termTex, topTen, varTex } from './simplify-data'
import type { Mono, Q } from './simplify-data'

export const qmul = (a: Q, b: Q): Q => q(a[0] * b[0], a[1] * b[1])
export const qinv = (a: Q): Q => (a[0] < 0 ? q(-a[1], -a[0]) : q(a[1], a[0]))
const qsub = (a: Q, b: Q) => add(a, neg(b))
const isZero = (c: Q) => c[0] === 0
const isOne = (c: Q) => c[0] === 1 && c[1] === 1
export const numTex = (c: Q) => termTex(c, '', false)
const parNum = (c: Q) => (c[0] < 0 ? `(${numTex(c)})` : numTex(c))

// ---- an equation  a1 v + b1 = a2 v + b2  (each side as written: a list of terms) ----
export interface Eq {
  v: string
  l: Mono[]
  r: Mono[]
}
const split = (ms: Mono[], v: string) => ({
  a: ms.filter((m) => m.raw === v).reduce((s, m) => add(s, m.c), q(0)),
  b: ms.filter((m) => m.raw === '').reduce((s, m) => add(s, m.c), q(0)),
})
const origTex = (ms: Mono[]) => polyTex(ms.map((m) => ({ c: m.c, v: m.raw })))
export const texEq = (e: Eq) => `${origTex(e.l)} = ${origTex(e.r)}`

export function parseEq(s: unknown, dec = false): Eq | null {
  if (typeof s !== 'string') return null
  const t = s.replace(/\s/g, '')
  if (!/^[-+0-9a-z/.]+=[-+0-9a-z/.]+$/.test(t)) return null
  const [ls, rs] = t.split('=')
  const l = parse(ls)
  const r = parse(rs)
  const letters = new Set([...l, ...r].map((m) => m.raw).filter(Boolean))
  if (letters.size !== 1) return null
  const v = [...letters][0]
  const ok = (ms: Mono[]) => ms.length > 0 && ms.length <= 6 && ms.every((m) => (m.raw === '' || m.raw === v) && (dec || !m.c[2]) && (m.c[0] !== 0 || m.raw === ''))
  if (v.length !== 1 || !ok(l) || !ok(r)) return null
  const L = split(l, v)
  const R = split(r, v)
  return isZero(qsub(L.a, R.a)) ? null : { v, l, r }
}
// the solution of an equation
export function solution(e: Eq): Q {
  const L = split(e.l, e.v)
  const R = split(e.r, e.v)
  return qmul(qsub(R.b, L.b), qinv(qsub(L.a, R.a)))
}


// the working as tokens, like the textbook: a term moves to the other side (an arrow to a blank: what goes there?), like terms are collected (an arrow from each to the sum)
interface It {
  id: string
  m: Mono
}
const itTok = (it: It, i: number): Tok => ({ id: it.id, tex: termTex(it.m.c, it.m.raw, i > 0) })
// the ids of the tokens that are on the line after these steps (so that the last step can work on all of them)
export function lineIds(start: Tok[], steps: Step[]): string[] {
  let line = start.map((t) => t.id)
  for (const S of steps) {
    const f = new Set(S.focus)
    const res = (S.results ?? [S.result]).map((t) => t.id)
    if (S.after || S.replace) {
      let keep = line.map((id) => (S.replace && id === S.focus[0] ? S.replace.id : id)).filter((id) => !f.has(id))
      if (S.after) {
        const where = typeof S.after === 'string' ? Object.fromEntries(res.map((id) => [id, S.after as string])) : S.after
        for (const id of res) {
          const at = keep.indexOf(where[id]) + 1
          keep = [...keep.slice(0, at), id, ...keep.slice(at)]
        }
      }
      line = keep
    } else {
      const at = line.findIndex((id) => f.has(id))
      line = [...line.slice(0, at), ...res, ...line.slice(at).filter((id) => !f.has(id))]
    }
  }
  return line
}

export function lessonEq(e: Eq, key: string, no: number, idx: number): Lesson {
  const { v } = e
  let k = 0
  const side: { l: It[]; r: It[] } = { l: e.l.map((m, i) => ({ id: `l${i}`, m })), r: e.r.map((m, i) => ({ id: `r${i}`, m })) }
  const start: Tok[] = [...side.l.map(itTok), { id: 'q', tex: '=' }, ...side.r.map(itTok)]
  const steps: Step[] = []
  const isVar = (it: It) => it.m.raw === v
  const mkIt = (id: string, c: Q, raw: string): It => ({ id, m: mk(c, raw) })

  // like terms of one side: an arrow from each to the sum (a question: what do they add up to?)
  const combine = (sd: 'l' | 'r') => {
    const ms = side[sd].map((i) => i.m)
    classes(ms).forEach((g) => {
      if (g.length < 2) return
      const items = side[sd]
      const fids = g.map((m) => items.find((i) => i.m === m)!.id)
      const at = items.findIndex((i) => fids.includes(i.id))
      const total = sum(g)
      const nz = (c: Q) => termTex(c, varTex(g[0].vs), at > 0)
      const expr = g.map((m, i) => (i === 0 ? (m.c[0] < 0 ? '-' : '') : m.c[0] < 0 ? ' - ' : ' + ') + coefTex(abs(m.c))).join('')
      const hint = hintFor(g.map((m) => m.c), expr)
      const [options, correct] = pick(nz(total), [nz(neg(total)), nz(add(total, q(1))), nz(add(total, q(-1))), nz(add(total, q(2))), nz(add(total, q(-2))), nz(g.reduce((t, m) => add(t, abs(m.c)), q(0)))], idx + k)
      const rid = `s${k++}`
      steps.push({ from: 'each', focus: fids, result: { id: rid, tex: GREEN(nz(total)) }, say: '', calcPrompt: 'What do these like terms add up to?', calc: { q: 'What do these like terms add up to?', options, correct, hints: options.map((_, j) => (j === correct ? '' : `What is $${expr}$? ${hint.text}`)), spell: hint.text, example: hint.example } })
      side[sd] = [...items.slice(0, at), mkIt(rid, total, g[0].raw), ...items.slice(at).filter((i) => !fids.includes(i.id))]
    })
  }
  // a term moves to the other side: the arrow goes to a blank, the question is what goes there (the opposite sign)
  const move = (from: 'l' | 'r', it: It) => {
    const to = from === 'l' ? 'r' : 'l'
    const c = it.m.c
    const raw = it.m.raw
    const right = termTex(neg(c), raw, true)
    const alts = raw ? [termTex(c, raw, true), termTex(add(neg(c), q(1)), raw, true), termTex(neg(c), '', true)] : [termTex(c, '', true), termTex(add(neg(c), q(1)), '', true), termTex(add(c, q(1)), '', true)]
    const [options, correct] = pick(right, alts, idx + k)
    const nid = `m${k++}`
    const target = side[to][side[to].length - 1].id
    const empty = side[from].length === 1 // the side would be empty: a 0 stays
    const zero: Tok = { id: `z${k++}`, tex: '0' }
    const prompt = `$${termTex(c, raw, true)} \\to \\square$`
    const hint = `$${termTex(c, raw, true)} ${termTex(neg(c), raw, true)} = 0$`
    steps.push({ focus: [it.id], ...(empty ? { replace: zero } : {}), after: target, result: { id: nid, tex: right }, say: '', calcPrompt: prompt, calc: { q: prompt, options, correct, hints: options.map((_, j) => (j === correct ? '' : hint)), spell: hint } })
    side[from] = empty ? [{ id: zero.id, m: mk(q(0), '') }] : side[from].filter((i) => i.id !== it.id)
    side[to] = [...side[to], mkIt(nid, neg(c), raw)]
  }

  // the variable term of the right side and the number of the left side move at the same time: two blanks, one question
  const movePair = (iv: It, ic: It) => {
    const tv = termTex(neg(iv.m.c), iv.m.raw, true)
    const tn = termTex(neg(ic.m.c), '', true)
    const sv = termTex(iv.m.c, iv.m.raw, true)
    const sn = termTex(ic.m.c, '', true)
    const [o1, c1] = pick(tv, [sv, termTex(neg(iv.m.c), '', true), termTex(add(neg(iv.m.c), q(1)), iv.m.raw, true)], idx + k)
    const [o2, c2] = pick(tn, [sn, termTex(add(neg(ic.m.c), q(1)), '', true), termTex(neg(ic.m.c), iv.m.raw, true)], idx + k + 1)
    const m1 = `m${k++}`
    const m2 = `m${k++}`
    const leftRest = side.l.filter((i) => i.id !== ic.id)
    const rightEmpty = side.r.length === 1
    const zero: Tok = { id: `z${k++}`, tex: '0' }
    const rightRest = side.r.filter((i) => i.id !== iv.id)
    const anchorR = rightEmpty ? zero.id : rightRest[rightRest.length - 1].id
    const p1 = `$${sv} \\to \\square_1$`
    const p2 = `$${sn} \\to \\square_2$`
    const h1 = `$${sv} ${tv} = 0$`
    const h2 = `$${sn} ${tn} = 0$`
    steps.push({
      focus: [iv.id, ic.id],
      ...(rightEmpty ? { replace: zero } : {}),
      after: { [m1]: leftRest[leftRest.length - 1].id, [m2]: anchorR },
      results: [{ id: m1, tex: tv }, { id: m2, tex: tn }],
      result: { id: m1, tex: tv },
      arrows: [{ from: [iv.id], to: [m1] }, { from: [ic.id], to: [m2] }],
      say: '',
      calcPrompt: p1,
      calc: { q: p1, options: o1, correct: c1, hints: o1.map((_, j) => (j === c1 ? '' : h1)), spell: h1 },
      second: { q: p2, options: o2, correct: c2, hints: o2.map((_, j) => (j === c2 ? '' : h2)), spell: h2 },
    })
    side.l = [...leftRest, mkIt(m1, neg(iv.m.c), iv.m.raw)]
    side.r = [...(rightEmpty ? [{ id: zero.id, m: mk(q(0), '') }] : rightRest), mkIt(m2, neg(ic.m.c), '')]
  }

  combine('l')
  combine('r')
  const rv = side.r.filter(isVar)
  const lc = side.l.filter((i) => !isVar(i) && !isZero(i.m.c))
  if (rv.length === 1 && lc.length === 1) movePair(rv[0], lc[0])
  else {
    // the variable terms of the right side move to the left
    for (const it of rv) move('r', it)
    combine('l')
    // the number of the left side moves to the right
    for (const it of lc) move('l', it)
  }
  combine('l')
  combine('r')

  // the number in front of the variable moves to the right: divided by it (a fraction: multiplied by its denominator first)
  const lv = side.l.find(isVar)
  if (lv && !isOne(lv.m.c)) {
    const A = lv.m.c
    interface Part {
      op: 'div' | 'cdot'
      n: Q
      leftTex: string
      leftC: Q
    }
    const parts: Part[] = []
    if (A[1] !== 1 && !A[2]) {
      parts.push({ op: 'cdot', n: q(A[1]), leftTex: A[0] === 1 ? v : `${A[0]}${v}`, leftC: q(A[0]) })
      if (A[0] !== 1) parts.push({ op: 'div', n: q(A[0]), leftTex: v, leftC: q(1) })
    } else parts.push({ op: 'div', n: A, leftTex: v, leftC: q(1) })
    const rightExpr: string[] = [numTex(side.r[0].m.c)]
    parts.forEach((p) => {
      const cur = side.l.find(isVar)!
      const nid = `c${k++}`
      const xTok: Tok = { id: `x${k++}`, tex: p.leftTex }
      const last = side.r[side.r.length - 1].id
      const tex = (op: string, n: Q) => `\\${op} ${parNum(n)}`
      const right = tex(p.op, p.n)
      const [options, correct] = pick(right, [tex(p.op === 'div' ? 'cdot' : 'div', p.n), `- ${numTex(abs(p.n))}`, tex(p.op, add(p.n, q(1)))], idx + k)
      const prompt = `$${parNum(p.n)} \\to \\square$`
      const hint = `$\\frac{${numTex(p.n)}${v}}{${numTex(p.n)}} = ${v}$`
      steps.push({ focus: [cur.id], replace: xTok, after: last, result: { id: nid, tex: right }, say: '', calcPrompt: prompt, calc: { q: prompt, options, correct, hints: options.map((_, j) => (j === correct ? '' : hint)), spell: hint } })
      side.l = side.l.map((it) => (it.id === cur.id ? { id: xTok.id, m: mk(p.leftC, v) } : it))
      side.r = [...side.r, { id: nid, m: mk(q(0), '') }]
      rightExpr.push(right)
    })
    // the right side is a number with divisions / multiplications: one question for its value
    const x = solution(e)
    const expr = rightExpr.join(' ')
    const [options, correct] = pick(numTex(x), [numTex(neg(x)), numTex(add(x, q(1))), numTex(add(x, q(-1))), numTex(qinv(x))], idx + k)
    const vid = `v${k++}`
    steps.push({ from: 'each', focus: side.r.map((i) => i.id), result: { id: vid, tex: numTex(x) }, say: '', calcPrompt: `What is $${expr}$?`, calc: { q: `What is $${expr}$?`, options, correct, hints: options.map(() => ''), spell: expr } })
    side.r = [mkIt(vid, x, '')]
  }
  return { key: `eq${no}-${key}`, label: key, source: `Grade 9, 6.1 exercise ${no}${key}`, title: 'Solve', prompt: 'Solve:', answer: `${v} = ${numTex(solution(e))}`, start, steps, review: { heading: 'Solving equations', rows: [] } }
}

// the choices of the question itself: the answer, the sign slip, the last step missing, the number of the second step added instead of subtracted
export function choicesEq(e: Eq, idx: number): [string[], number] {
  const x = solution(e)
  const L = split(e.l, e.v)
  const R = split(e.r, e.v)
  const tx = (c: Q) => `${e.v} = ${numTex(c)}`
  return pick(tx(x), [tx(neg(x)), tx(qsub(R.b, L.b)), tx(qmul(add(R.b, L.b), qinv(qsub(L.a, R.a)))), tx(add(x, q(1))), tx(add(x, q(-1)))], idx)
}

// ---- exercise 4: the variable divided, or in a denominator:  N / D = n  with N, D = a number or a number times x ----
export interface Frac {
  nc: number // numerator: nc or nc x
  nx: boolean
  dc: number
  dx: boolean
  n: number
}
export function parseFrac(s: unknown): Frac | null {
  if (typeof s !== 'string') return null
  const m = s.replace(/\s/g, '').match(/^(-?\d*)(x?)\/\(?(\d*)(x?)\)?=(-?\d+)$/)
  if (!m) return null
  const f: Frac = { nc: m[1] === '' ? 1 : m[1] === '-' ? -1 : Number(m[1]), nx: m[2] === 'x', dc: m[3] === '' ? 1 : Number(m[3]), dx: m[4] === 'x', n: Number(m[5]) }
  return f.nx !== f.dx && f.n !== 0 && f.dc > 0 ? f : null
}
const fx = (c: number, has: boolean) => (has ? (c === 1 ? 'x' : c === -1 ? '-x' : `${c}x`) : `${c}`)
export const texFrac = (f: Frac) => `\\frac{${fx(f.nc, f.nx)}}{${fx(f.dc, f.dx)}} = ${f.n}`
const sgn = (n: number, d: number): Q => (d < 0 ? q(-n, -d) : q(n, d))
const fracSolution = (f: Frac): Q => (f.nx ? sgn(f.n * f.dc, f.nc) : sgn(f.nc, f.n * f.dc))

export function lessonFrac(f: Frac, key: string, no: number, idx: number): Lesson {
  const D = fx(f.dc, f.dx) // the denominator: 5, x, 5x
  const N = fx(f.nc, f.nx) // the numerator
  const x = fracSolution(f)
  const start: Tok[] = [{ id: 'l0', tex: `\\frac{${N}}{${D}}` }, { id: 'q', tex: '=' }, { id: 'r0', tex: String(f.n) }]
  const steps: Step[] = []
  let k = 0
  const T = (id: string, tex: string): Tok => ({ id, tex })
  // one term moves: the arrow goes to a blank, the question is what goes there
  const mv = (o: { focus: string[]; replace?: Tok; after: string; id: string; tex: string; wrongs: string[]; prompt: string; hint: string }) => {
    const [options, correct] = pick(o.tex, o.wrongs, idx + k++)
    steps.push({ focus: o.focus, ...(o.replace ? { replace: o.replace } : {}), after: o.after, result: T(o.id, o.tex), say: '', calcPrompt: o.prompt, calc: { q: o.prompt, options, correct, hints: options.map((_, j) => (j === correct ? '' : o.hint)), spell: o.hint } })
  }
  // a question for the value of tokens (an arrow from each to the answer)
  const value = (focus: string[], id: string, expr: string, answer: string, wrongs: string[]) => {
    const [options, correct] = pick(answer, wrongs, idx + k++)
    steps.push({ from: 'each', focus, result: T(id, answer), say: '', calcPrompt: `What is $${expr}$?`, calc: { q: `What is $${expr}$?`, options, correct, hints: options.map(() => ''), spell: expr } })
  }
  const otherOps = (n: string) => [`\\div ${n}`, `\\cdot ${n}`, `+ ${n}`, `- ${n}`]
  // 1) the denominator moves to the right: multiplied
  mv({ focus: ['l0'], replace: T('x0', N), after: 'r0', id: 'c0', tex: `\\cdot ${D}`, wrongs: otherOps(D).filter((t) => !t.startsWith('\\cdot')), prompt: `$${D} \\to \\square$`, hint: `$\\frac{${N}}{${D}} \\cdot ${D} = ${N}$` })
  if (!f.dx) {
    // x / q, px / q: the number in front of x moves to the right: divided; then the right side is one number
    const expr = [String(f.n), `\\cdot ${D}`]
    const rightIds = ['r0', 'c0']
    if (f.nx && f.nc !== 1) {
      const c = f.nc < 0 ? `(${f.nc})` : String(f.nc)
      mv({ focus: ['x0'], replace: T('x1', 'x'), after: 'c0', id: 'c1', tex: `\\div ${c}`, wrongs: otherOps(c).filter((t) => !t.startsWith('\\div')), prompt: `$${c} \\to \\square$`, hint: `$\\frac{${N}}{${c}} = x$` })
      expr.push(`\\div ${c}`)
      rightIds.push('c1')
    }
    value(rightIds, 'v0', expr.join(' '), numTex(x), [numTex(neg(x)), numTex(add(x, q(1))), numTex(add(x, q(-1))), numTex(qinv(x))])
  } else {
    // p / x, p / qx: the right side is n times the denominator: n D = (n dc) x, then that number moves to the left: divided
    const coef = f.n * f.dc
    value(['r0', 'c0'], 'p0', `${f.n} \\cdot ${D}`, coef === 1 ? 'x' : `${coef}x`, [`${f.n + f.dc}x`, `${coef}`, `${-coef}x`])
    if (coef !== 1) {
      const c = coef < 0 ? `(${coef})` : String(coef)
      mv({ focus: ['p0'], replace: T('x1', 'x'), after: 'x0', id: 'c1', tex: `\\div ${c}`, wrongs: otherOps(c).filter((t) => !t.startsWith('\\div')), prompt: `$${c} \\to \\square$`, hint: `$\\frac{${coef}x}{${c}} = x$` })
      value(['x0', 'c1'], 'v0', `${N} \\div ${c}`, numTex(x), [numTex(neg(x)), numTex(add(x, q(1))), numTex(add(x, q(-1))), numTex(qinv(x))])
    }
  }
  return { key: `frac${no}-${key}`, label: key, source: `Grade 9, 6.1 exercise ${no}${key}`, title: 'Solve', prompt: 'Solve:', answer: `x = ${numTex(x)}`, start, steps, review: { heading: 'Solving equations', rows: [] } }
}
export function choicesFrac(f: Frac, idx: number): [string[], number] {
  const x = fracSolution(f)
  const tx = (c: Q) => `x = ${numTex(c)}`
  return pick(tx(x), [tx(neg(x)), tx(f.nx ? q(f.n) : q(f.nc)), tx(add(x, q(1))), tx(qinv(x)), tx(add(x, q(-1)))], idx)
}

// ---- exercise 1: is the value a solution?  "3x+5=14;x=3" ----
export interface Sub {
  e: Eq
  value: Q
}
export function parseSub(s: unknown): Sub | null {
  if (typeof s !== 'string') return null
  const [es, vs] = s.replace(/\s/g, '').split(';')
  const e = parseEq(es)
  const m = vs?.match(/^([a-z])=(-?\d+)(?:\/(\d+))?$/)
  return e && m && m[1] === e.v ? { e, value: q(Number(m[2]), m[3] ? Number(m[3]) : 1) } : null
}
export const texSub = ({ e, value }: Sub) => `${texEq(e)} ;\\; ${e.v} = ${numTex(value)}`
const sidesOf = ({ e, value }: Sub): [Q, Q] => {
  const f = (ms: Mono[]) => ms.reduce((s, m) => add(s, m.raw === e.v ? qmul(m.c, value) : m.c), q(0))
  return [f(e.l), f(e.r)]
}
// one side with the value put in, as arithmetic: 3x + 5 with x = 2 -> 3 \\times 2 + 5
const arith = (ms: Mono[], v: string, value: Q) =>
  ms
    .map((m, i) => {
      const body = m.raw === v ? (isOne(abs(m.c)) ? parNum(value) : `${termTex(abs(m.c), '', false)} \\times ${parNum(value)}`) : termTex(abs(m.c), '', false)
      return i === 0 ? `${m.c[0] < 0 ? '-' : ''}${body}` : ` ${m.c[0] < 0 ? '-' : '+'} ${body}`
    })
    .join('')
export function lessonSub(sb: Sub, key: string, no: number, idx: number): Lesson {
  const { e, value } = sb
  const [ls, rs] = sidesOf(sb)
  const yes = isZero(qsub(ls, rs))
  const slip = (c: Q) => [add(c, q(1)), add(c, q(-1)), neg(c)].map(numTex)
  const lonely = (ms: Mono[]) => ms.length === 1 && ms[0].raw === ''
  const aL = arith(e.l, e.v, value)
  const aR = arith(e.r, e.v, value)
  const steps: Step[] = []
  let prev = 'e0'
  let left = aL // what the left side shows now
  // the working, as written by hand: the equation with the value put in, then each side worked out
  if (!lonely(e.l)) {
    const [o1, c1] = pick(numTex(ls), slip(ls), idx)
    const q1 = `What is $${aL}$?`
    left = numTex(ls)
    steps.push({ focus: [prev], result: { id: 'e1', tex: `${left} = ${aR}` }, arrows: [], say: '', calcPrompt: q1, calc: { q: q1, options: o1, correct: c1, hints: o1.map(() => ''), spell: 'left' } })
    prev = 'e1'
  }
  if (!lonely(e.r)) {
    const [o2, c2] = pick(numTex(rs), slip(rs), idx + 1)
    const q2 = `What is $${aR}$?`
    steps.push({ focus: [prev], result: { id: 'e2', tex: `${left} = ${numTex(rs)}` }, arrows: [], say: '', calcPrompt: q2, calc: { q: q2, options: o2, correct: c2, hints: o2.map(() => ''), spell: 'right' } })
    prev = 'e2'
  }
  // the last question: the two sides are written, is the value a solution?
  const q4 = `$${numTex(ls)}$ and $${numTex(rs)}$: is $${e.v} = ${numTex(value)}$ a solution?`
  const o4 = ['\\text{Yes}', '\\text{No}']
  steps.push({ focus: [prev], result: { id: 'e4', tex: `${yes ? `${numTex(ls)} = ${numTex(rs)}` : `${numTex(ls)} \\neq ${numTex(rs)}`} \\;\\text{so}\\; ${e.v} = ${numTex(value)} \\text{ is ${yes ? 'a' : 'not a'} solution}` }, arrows: [], say: '', calcPrompt: q4, calc: { q: q4, options: o4, correct: yes ? 0 : 1, hints: o4.map(() => ''), spell: 'solution' } })
  return {
    key: `sub${no}-${key}`,
    label: key,
    source: `Grade 9, 6.1 exercise ${no}${key}`,
    title: 'Is it a solution?',
    prompt: `Test ${e.v} = ${numTex(value)}:`,
    answer: yes ? '\\text{Yes}' : '\\text{No}',
    figure: `<p class="px-2 py-3 text-center text-2xl">${katex.renderToString(`${texEq(e)} ;\\; ${e.v} = ${numTex(value)}`, { throwOnError: false })}</p>`,
    start: [{ id: 'e0', tex: `${aL} = ${aR}` }],
    steps,
    review: { heading: 'Solutions', rows: [] },
  }
}
export function choicesSub(sb: Sub): [string[], number] {
  const [ls, rs] = sidesOf(sb)
  return [['\\text{Yes}', '\\text{No}'], isZero(qsub(ls, rs)) ? 0 : 1]
}

// ---- the exercises ----
const BOOK = BOOK61 as Record<string, Record<string, string>>
const VARS = V61 as Record<string, Record<string, unknown[]>>
export function buildEq(no: string, prompt: string, custom?: { shown: number; book: [string, string][]; gen: Record<string, string[]> }): Exercise {
  const questions: Question[] = (custom?.book ?? Object.entries(BOOK[no])).map(([part, src], idx): Question => {
    const book = parseEq(src)!
    const bank = topTen((custom?.gen[part] ?? VARS[no]?.[part] ?? []).map((x) => parseEq(x)).filter((x): x is Eq => !!x && solution(x)[1] === 1), [], texEq, book)
    const make = (x: Eq, key: string, k: number): Practice => {
      const [choices, correct] = choicesEq(x, idx + k)
      return { tex: texEq(x), choices, correct, why: '', lesson: () => lessonEq(x, key, Number(no), idx + k) }
    }
    return { part, ...make(book, part, 0), practice: bank.map((x, k) => make(x, `${part}${k + 1}`, k + 1)) }
  })
  return { no: custom?.shown ?? Number(no), sec: '6.1', prompt, mathChoices: true, questions }
}
function buildFrac(): Exercise {
  const questions: Question[] = Object.entries(BOOK['4']).map(([part, src], idx): Question => {
    const book = parseFrac(src)!
    const bank = topTen((VARS['4']?.[part] ?? []).map(parseFrac).filter((x): x is Frac => !!x), [], texFrac, book)
    const make = (x: Frac, key: string, k: number): Practice => {
      const [choices, correct] = choicesFrac(x, idx + k)
      return { tex: texFrac(x), choices, correct, why: '', lesson: () => lessonFrac(x, key, 4, idx + k) }
    }
    return { part, ...make(book, part, 0), practice: bank.map((x, k) => make(x, `${part}${k + 1}`, k + 1)) }
  })
  return { no: 4, sec: '6.1', prompt: 'Determine the solution of each equation.', mathChoices: true, questions }
}
function buildSub(): Exercise {
  const questions: Question[] = Object.entries(BOOK['1']).map(([part, src], idx): Question => {
    const book = parseSub(src)!
    const bank = topTen((VARS['1']?.[part] ?? []).map(parseSub).filter((x): x is Sub => !!x), [], texSub, book)
    const make = (x: Sub, key: string, k: number): Practice => {
      const [choices, correct] = choicesSub(x)
      return { tex: texSub(x), choices, correct, why: '', lesson: () => lessonSub(x, key, 1, idx + k) }
    }
    return { part, ...make(book, part, 0), practice: bank.map((x, k) => make(x, `${part}${k + 1}`, k + 1)) }
  })
  return { no: 1, sec: '6.1', prompt: 'Is the given value a solution of the equation?', mathChoices: true, questions }
}

export const EX61 = [buildSub(), buildEq('2', 'Determine the solution of each equation.'), buildEq('3', 'Determine the solution of each equation.'), buildFrac(), buildEq('5', 'Determine the solution of each equation.')]
