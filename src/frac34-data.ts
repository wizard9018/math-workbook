// Grade 9 3.4 (bank/G9-ch3/s4/items.json): multiplying and dividing rational numbers. Exercises 9 (largest value from four digits) and 11 (a long product) are left out.
//   1 multiply, 2 multiply by simplifying first, 3 reciprocals, 4 divide, 5 divide and simplify, 6 multiply and divide mixed numbers, 7 combined operations, 8 and 10 word problems.
// Every question is multiple choice; the lessons are blanks (ineq64-data.ts lessonWp, built with graph42-data.ts `build`). The numbers are exact fractions (n / d); every answer and
// step is computed here, the 10 similar questions of every part are made here from the signs and kinds of the numbers of the textbook part.
// Imported by: quiz.tsx, check34.ts. Shape: exercise.ts.
import type { Wp, WpStep } from './ineq64-data'
import { build, rng, uniq } from './graph42-data'
import type { It } from './graph42-data'
import { blk, range, text } from './seq41-data'
import { q, add, sub, mix, val, fx, between, gcd } from './frac33-data'
import type { Q } from './frac33-data'

// ---- fractions and how they are written ----
const mul = (a: Q, b: Q) => q(a.n * b.n, a.d * b.d)
const neg = (a: Q): Q => ({ n: -a.n, d: a.d })
const recip = (a: Q): Q => (a.n < 0 ? q(-a.d, -a.n) : q(a.d, a.n))
const st = (a: Q) => `${a.n < 0 ? '-' : ''}${fx({ n: Math.abs(a.n), d: a.d })}` // a mixed number with its sign
const fi = (a: Q) => (a.d === 1 ? String(a.n) : `${a.n < 0 ? '-' : ''}\\frac{${Math.abs(a.n)}}{${a.d}}`) // an improper fraction (or a whole number)
const wrongsOf = (v: Q, f: (a: Q) => string, extra: Q[] = []) =>
  uniq([...extra, neg(v), v.n ? recip(v) : v, q(v.n + 1, v.d), q(v.n, v.d + 1), q(v.n - 1, v.d), q(v.n * 2, v.d)].filter((x) => x.n !== 0 && f(x) !== f(v)).map(f), (s) => s)

// a number of a question: its value and how it is written in the question ("1 1/2", "-3/4", "0.4", "5")
interface Fct {
  q: Q
  tex: string
}
const parseF = (s: string): Fct => {
  const isNeg = s.startsWith('-')
  const b = s.replace('-', '')
  let v: Q
  if (b.includes('.')) {
    const [i, f] = b.split('.')
    v = q(Number(i + f), 10 ** f.length)
  } else if (b.includes(' ')) {
    const [w, fr] = b.split(' ')
    const [n, d] = fr.split('/').map(Number)
    v = mix(Number(w), n, d)
  } else if (b.includes('/')) {
    const [n, d] = b.split('/').map(Number)
    v = q(n, d)
  } else v = q(Number(b), 1)
  const sv = isNeg ? neg(v) : v
  return { q: sv, tex: b.includes('.') ? s : st(sv) }
}
type Op = '×' | '÷'
interface T {
  f: Fct
  op: Op
}
interface E {
  ts: T[]
}
const mkTs = (strs: string[], ops: Op[]): T[] => strs.map((s, i) => ({ f: parseF(s), op: i ? ops[i - 1] : '×' }))
const opTex = (o: Op) => (o === '×' ? '\\times' : '\\div')
const exprOf = (ts: T[], show: (t: T) => string) => ts.map((t, i) => (i === 0 ? show(t) : `${opTex(t.op)} ${t.f.q.n < 0 ? `(${show(t)})` : show(t)}`)).join(' ')
const exOrig = (ts: T[]) => exprOf(ts, (t) => t.f.tex)
// a whole number is written over 1
const fw = (x: Q) => (x.d === 1 ? `${x.n < 0 ? '-' : ''}\\frac{${Math.abs(x.n)}}{1}` : fi(x))
const exImp = (ts: T[]) => exprOf(ts, (t) => fw(t.f.q))
const idE = (e: E) => exOrig(e.ts)
// one number of the expression changed: its sign, its reciprocal or its numerator
const alt = (ts: T[], i: number, kind: number): T[] => ts.map((t, k) => (k !== i ? t : { ...t, f: { ...t.f, q: kind === 0 ? neg(t.f.q) : kind === 1 ? recip(t.f.q) : q(t.f.q.n + (t.f.q.n < 0 ? -1 : 1), t.f.q.d) } }))

// cancel numerators against denominators; the factors left over
function cancel(fs: Q[]) {
  const nums = fs.map((f) => Math.abs(f.n))
  const dens = fs.map((f) => f.d)
  let did = false
  const divs: string[] = []
  for (let g = 0; g < 30; g++) {
    let hit = false
    for (let i = 0; i < nums.length && !hit; i++)
      for (let j = 0; j < dens.length && !hit; j++) {
        const c = gcd(nums[i], dens[j])
        if (c > 1) {
          divs.push(`${nums[i]} \\text{ and } ${dens[j]} \\text{ by } ${c}`)
          nums[i] /= c
          dens[j] /= c
          hit = did = true
        }
      }
    if (!hit) break
  }
  return { nums, dens, did, divs }
}
const frTex = (nums: number[], dens: number[]) => `\\frac{${nums.join('\\;\\cdot\\;')}}{${dens.join('\\;\\cdot\\;')}}`

// the steps of a product / quotient of numbers: fractions, reciprocal, sign, cancel, multiply, (mixed number)
function chain(ts: T[], mixed: boolean): { steps: WpStep[]; ans: Q; ansTex: string } {
  const steps: WpStep[] = []
  let from = 's0'
  const plain = ts.every((t) => t.f.tex === fw(t.f.q))
  if (!plain) {
    const ex = exImp(ts)
    steps.push({ label: 'Write every number as a fraction.', onlyFrom: true, toks: [{ id: 'k1a', tex: '\\text{as fractions}' }, { id: 'k1b', tex: ex }], blanks: [blk('k1b', from, `$${exOrig(ts)}\\text{ as fractions}$`, uniq([exImp(alt(ts, 0, 2)), exImp(alt(ts, ts.length - 1, 0)), exImp(alt(ts, ts.length - 1, 2))].filter((s) => s !== ex), (s) => s), 'A mixed number: whole number times the denominator plus the numerator, over the denominator. A decimal: write it over 10, 100, ...')] })
    from = 'k1b'
  }
  const rc: T[] = ts.map((t) => (t.op === '÷' ? { f: { q: recip(t.f.q), tex: fi(recip(t.f.q)) }, op: '×' as Op } : t))
  if (ts.some((t) => t.op === '÷')) {
    const first = ts.findIndex((t) => t.op === '÷')
    // the numbers before the first ÷ stay as they are: only the rest is a blank
    const tail = (l: T[]) => l.slice(first).map((t) => `${opTex(t.op)} ${t.f.q.n < 0 ? `(${fw(t.f.q)})` : fw(t.f.q)}`).join(' ')
    const ex = tail(rc)
    steps.push({ label: 'Dividing is multiplying by the reciprocal.', onlyFrom: true, toks: [{ id: 'k2a', tex: exImp(rc.slice(0, first)) }, { id: 'k2b', tex: ex }], blanks: [blk('k2b', from, `$${exImp(ts)} = \\square$`, uniq([tail(ts.map((t, i) => (i === first ? { ...t, op: '×' as Op } : t))), tail(alt(rc, first, 2)), tail(alt(rc, first, 0))].filter((s) => s !== ex), (s) => s),'Change ÷ to × and flip the fraction that comes after it (the reciprocal). The first number stays.')] })
    from = 'k2b'
  }
  const c = cancel(rc.map((t) => t.f.q))
  const prod = rc.reduce((s, t) => mul(s, t.f.q), q(1, 1))
  if (c.did) {
    const ex = frTex(c.nums, c.dens)
    const rawN = rc.map((t) => Math.abs(t.f.q.n))
    const rawD = rc.map((t) => t.f.q.d)
    steps.push({ label: 'Cancel common factors.', onlyFrom: true, toks: [{ id: 'k4a', tex: `\\text{cancel: divide } ${c.divs.join('\\text{; divide } ')}` }, { id: 'k4b', tex: ex }], blanks: [blk('k4b', from, `$${frTex(rawN, rawD)}\\quad \\text{divide } ${c.divs.join('\\text{; divide } ')}$`, uniq([frTex(rawN, rawD), frTex(c.nums.map((x, i) => (i === 0 ? x + 1 : x)), c.dens), frTex(c.nums, c.dens.map((x, i) => (i === c.dens.length - 1 ? x + 1 : x)))].filter((s) => s !== ex), (s) => s), 'Divide a numerator and a denominator by the same number (they can be in different fractions) until no number divides both.')] })
    from = 'k4b'
  }
  steps.push({ label: 'Multiply.', onlyFrom: true, toks: [{ id: 'k5a', tex: '\\text{product}' }, { id: 'k5b', tex: fi(prod) }], blanks: [blk('k5b', from, '$\\text{Multiply the numerators and multiply the denominators}$', wrongsOf(prod, fi), 'Numerator times numerator over denominator times denominator; the sign is the one found before.')] })
  from = 'k5b'
  const needMixed = mixed && prod.d !== 1 && Math.abs(prod.n) > prod.d
  if (needMixed) steps.push({ label: 'As a mixed number.', onlyFrom: true, toks: [{ id: 'k6a', tex: `${fi(prod)} =` }, { id: 'k6b', tex: st(prod) }], blanks: [blk('k6b', from, `$${fi(prod)} = \\square$`, wrongsOf(prod, st), 'Divide the numerator by the denominator: the whole part is the quotient, the fraction part is the remainder over the denominator.')] })
  return { steps, ans: prod, ansTex: needMixed ? st(prod) : fi(prod) }
}
// the popup after a wrong pick shows the answer of that blank, not an explanation
const ans = <X,>(mk: (e: X, key: string) => It) => (e: X, key: string): It => {
  const it = mk(e, key)
  for (const s of it.w!.steps) for (const b of s.blanks) b.hint = `The answer is $${s.toks.find((t) => t.id === b.id)!.tex}$`
  return it
}
function mkChain(prompt: string, mixed: boolean) {
  return ans((e: E, key: string): It => {
    const { steps, ans, ansTex } = chain(e.ts, mixed)
    const f = mixed && ans.d !== 1 && Math.abs(ans.n) > ans.d ? st : fi
    const w: Wp = { tex: `${text(prompt)}${exOrig(e.ts)}`, short: exOrig(e.ts), key, answer: ansTex, wrong: wrongsOf(ans, f), steps }
    return { w }
  })
}

// ---- random numbers by kind: i whole number, f fraction, g any fraction (also more than 1), m mixed number, d decimal; a leading - makes it negative ----
const DECS = ['0.4', '1.5', '2.1', '2.5', '0.6', '0.8', '1.2', '3.75', '0.25', '1.6']
function rnum(r: () => number, kind: string, big: boolean): string {
  const sg = kind.startsWith('-') ? '-' : ''
  const k = kind.replace('-', '')
  if (k === 'i') return `${sg}${between(r, 2, big ? 12 : 9)}`
  if (k === 'd') return `${sg}${DECS[between(r, 0, DECS.length - 1)]}`
  if (k === 'm') {
    const d = between(r, 2, 9)
    return `${sg}${between(r, 1, 9)} ${between(r, 1, d - 1)}/${d}`
  }
  for (;;) {
    const d = between(r, 2, big ? 30 : 12)
    const n = between(r, 1, k === 'g' ? 2 * d : d - 1)
    if (gcd(n, d) === 1 && n !== d) return `${sg}${n}/${d}`
  }
}
// a part: the kinds and operators of its numbers, the textbook numbers; the similar questions are random numbers of the same kinds
interface Part {
  kinds: string[]
  ops: Op[]
  base: string[]
  need?: boolean // the product has to have common factors to cancel
}
function rowsOf(parts: Part[], seed: number, big = false): [string, E, E[]][] {
  return parts.map((p, i) => {
    const r = rng(seed + i)
    const pool: E[] = []
    for (let tries = 0; pool.length < 14 && tries < 500; tries++) {
      const ts = mkTs(p.kinds.map((k) => rnum(r, k, big)), p.ops)
      const rc = ts.map((t) => (t.op === '÷' ? recip(t.f.q) : t.f.q))
      if (p.need && !cancel(rc).did) continue
      const prod = rc.reduce((s, x) => mul(s, x), q(1, 1))
      if (prod.d > 400 || Math.abs(prod.n) > 4000) continue
      pool.push({ ts })
    }
    return [String.fromCharCode(97 + i), { ts: mkTs(p.base, p.ops) }, pool]
  })
}
const P = (kinds: string, base: string, ops = '', need = false): Part => ({ kinds: kinds.split(' '), base: base.includes('|') ? base.split('|') : base.split(' '), ops: ops.split('').map((c) => (c === '/' ? '÷' : '×') as Op), need })

// ================= 1 multiply, 2 multiply by simplifying first =================
const PARTS1: Part[] = [
  P('i f', '5 3/4', '*'), P('-f i', '-2/3 4', '*'), P('i -f', '5 -1/5', '*'), P('-i -f', '-3 -1/3', '*'), P('-f f', '-3/5 1/4', '*'),
  P('-f -f f', '-2/5 -4/7 1/3', '**'), P('i -i f', '2 -3 5/7', '**'), P('-f f f', '-3/4 5/11 5/7', '**'), P('f -f f', '1/2 -1/3 5/7', '**'), P('-f i -f', '-1/3 5 -7/12', '**'),
]
const PARTS2: Part[] = [
  P('f d', '3/2 0.4', '*', true), P('f f', '2/3 9/5', '*', true), P('f f', '2/3 9/4', '*', true), P('-g f', '-14/3 4/21', '*', true), P('-f -f', '-8/15 -5/6', '*', true),
  P('f f', '6/35 25/33', '*', true), P('f f f', '3/7 14/3 1/2', '**', true), P('-f -f f', '-4/5 -3/8 5/9', '**', true), P('g -f f', '21/5 -25/14 2/15', '**', true), P('f -f -f', '9/14 -28/15 -3/7', '**', true),
]
// ================= 4 divide, 5 divide and simplify =================
const PARTS4: Part[] = [
  P('f f', '2/3 5/7', '/'), P('-f f', '-3/4 2/11', '/'), P('f d', '4/9 1.5', '/'), P('-f -f', '-8/15 -3/4', '/'), P('-f f', '-3/4 8/15', '/'),
  P('i f', '9 2/3', '/'), P('f -i', '2/3 -9', '/'), P('i f', '5 1/5', '/'),
]
const PARTS5: Part[] = [
  P('f f', '2/3 5/6', '/', true), P('f g', '3/14 7/6', '/', true), P('g i', '9/4 3', '/', true), P('i g', '3 9/4', '/', true), P('f -f', '1/5 -2/25', '/', true),
  P('-f f', '-13/17 39/34', '/', true), P('-f -f', '-15/28 -5/7', '/', true), P('-f -f', '-38/9 -19/63', '/', true), P('f -f', '26/121 -13/22', '/', true), P('-g f', '-343/125 49/25', '/', true),
]
// ================= 6 mixed numbers =================
const PARTS6: Part[] = [
  P('m m', '2 1/2|3 1/3', '*'), P('m m', '4 2/3|3 1/9', '/'), P('m m', '7 1/3|1 4/11', '*'), P('d m', '3.75|3 3/8', '/'), P('-m m', '-5 4/7|1 8/13', '*'),
  P('-m -m', '-6 3/5|-5 7/25', '/'), P('-m -d', '-8 4/7|-2.1', '*'), P('-m m', '-3 3/11|2 2/11', '/'), P('m -m', '12 4/5|-15 5/8', '*'), P('-m -f', '-13 5/7|-32/49', '/'),
  P('m m m', '3 1/3|1 4/5|1 1/6', '**'), P('m m i', '4 2/3|2 1/7|10', '*/'), P('m m m', '5 4/7|3 1/4|10 1/2', '/*'), P('m -m -m', '5 5/6|-2 1/3|-6 1/4', '//'),
]

// ================= 3 reciprocals =================
interface E3 {
  f: Fct
}
function mk3(e: E3, key: string): It {
  const v = e.f.q
  const r = recip(v)
  const steps: WpStep[] = []
  let from = 's0'
  if (e.f.tex !== fi(v) || v.d === 1) {
    const over1 = `${v.n < 0 ? '-' : ''}\\frac{${Math.abs(v.n)}}{1}`
    steps.push({ label: 'Write it as a fraction.', onlyFrom: true, toks: [{ id: 'r1a', tex: `${e.f.tex} =` }, { id: 'r1b', tex: v.d === 1 ? over1 : fi(v) }], blanks: [blk('r1b', from, `$${e.f.tex} = \\square$`, v.d === 1 ? [`${v.n < 0 ? '-' : ''}\\frac{1}{${Math.abs(v.n)}}`, `${v.n < 0 ? '' : '-'}\\frac{${Math.abs(v.n)}}{1}`, `\\frac{${Math.abs(v.n)}}{${Math.abs(v.n) + 1}}`] : wrongsOf(v, fi), 'A whole number is the number over 1. A mixed number: whole number times the denominator plus the numerator, over the denominator.')] })
    from = 'r1b'
  }
  steps.push({ label: 'Flip the fraction: the numerator and the denominator swap places.', onlyFrom: true, toks: [{ id: 'r2a', tex: `\\text{flip } ${v.d === 1 ? `${v.n < 0 ? '-' : ''}\\frac{${Math.abs(v.n)}}{1}` : fi(v)} \\to` }, { id: 'r2b', tex: fi(r) }], blanks: [blk('r2b', from, `$\\text{The reciprocal of } ${e.f.tex}$`, wrongsOf(r, fi, [v]), 'The reciprocal flips the fraction and keeps the sign: the product of a number and its reciprocal is 1.')] })
  const w: Wp = { tex: `${text('Determine the reciprocal of the following: ')}${e.f.tex}`, short: e.f.tex, key, answer: fi(r), wrong: wrongsOf(r, fi, [v]), steps }
  return { w }
}
const KINDS3: [string, string][] = [['i', '3'], ['-f', '-1/3'], ['f', '2/3'], ['-f', '-4/7'], ['m', '1 1/2'], ['-m', '-3 2/3']]
const rows3: [string, E3, E3[]][] = KINDS3.map(([k, b], i) => {
  const r = rng(300 + i)
  return [String.fromCharCode(97 + i), { f: parseF(b) }, range(0, 13).map(() => ({ f: parseF(rnum(r, k, false)) }))]
})
const idE3 = (e: E3) => e.f.tex

// ================= 7 combined operations =================
type N = { k: 'n'; f: Fct } | { k: 'b'; op: '+' | '-' | '×' | '÷'; a: N; b: N; p: boolean } | { k: 's'; a: N }
const ln = (s: string): N => ({ k: 'n', f: parseF(s) })
const B = (op: '+' | '-' | '×' | '÷', a: N, b: N, p = false): N => ({ k: 'b', op, a, b, p })
const S = (a: N): N => ({ k: 's', a })
const bop = (o: string) => (o === '×' ? '\\times' : o === '÷' ? '\\div' : o)
const nt = (n: N): string => {
  if (n.k === 'n') return n.f.tex
  if (n.k === 's') return `\\left(${nt(n.a)}\\right)^2`
  const imp = n.op === '×' && ((n.a.k === 'b' && n.a.p) || (n.b.k === 'b' && n.b.p))
  const side = (m: N) => (m.k === 'n' ? `\\left(${nt(m)}\\right)` : nt(m))
  const s = imp ? `${side(n.a)}${side(n.b)}` : `${nt(n.a)} ${bop(n.op)} ${nt(n.b)}`
  return n.p ? `\\left(${s}\\right)` : s
}
const LABEL: Record<string, string> = { '+': 'Add.', '-': 'Subtract.', '×': 'Multiply.', '÷': 'Divide.' }
const HINT7: Record<string, string> = {
  '+': 'Write the fractions with the same denominator and add.',
  '-': 'Write the fractions with the same denominator and subtract.',
  '×': 'Write the mixed numbers as fractions and multiply the numerators and the denominators.',
  '÷': 'Write the mixed numbers as fractions and multiply by the reciprocal of the second one.',
}
// the starting line in tokens: the first step to run (two numbers and the sign between) is one token, so only it is lit; the rest of the line is plain
const ntM = (n: N): string => {
  if (n.k === 'n') return n.f.tex
  const leafy = n.k === 's' ? n.a.k === 'n' : n.a.k === 'n' && n.b.k === 'n'
  let s: string
  if (n.k === 's') s = `\\left(${ntM(n.a)}\\right)^2`
  else {
    const imp = n.op === '×' && ((n.a.k === 'b' && n.a.p) || (n.b.k === 'b' && n.b.p))
    const side = (m: N) => (m.k === 'n' ? `\\left(${ntM(m)}\\right)` : ntM(m))
    s = imp ? `${side(n.a)}${side(n.b)}` : `${ntM(n.a)} ${bop(n.op)} ${ntM(n.b)}`
  }
  if (leafy) s = `\u0001${s}\u0002`
  return n.k === 'b' && n.p ? `\\left(${s}\\right)` : s
}
function startOf7(tree: N): Tok[] {
  const parts = ntM(tree).split(/[\u0001\u0002]/)
  const toks = parts.map((tex, i) => ({ id: i === 1 ? 'sn' : `sp${i}`, tex: tex.trim() })).filter((t) => t.tex)
  return toks.some((t) => t.id === 'sn') ? toks : [{ id: 'sn', tex: nt(tree) }]
}
function evalN(n: N, steps: WpStep[], c: { from: string; k: number }): Q {
  if (n.k === 'n') return n.f.q
  if (n.k === 's') {
    const v = evalN(n.a, steps, c)
    const r = mul(v, v)
    const id = `t${c.k++}`
    steps.push({ label: 'The square.', onlyFrom: true, toks: [{ id: `${id}a`, tex: `\\left(${st(v)}\\right)^2` }, { id: `${id}g`, tex: '=' }, { id: `${id}b`, tex: st(r) }], blanks: [blk(`${id}b`, c.from,`$\\left(${st(v)}\\right)^2 = \\square$`, wrongsOf(r, st, [mul(v, q(2, 1))]), 'Multiply the number by itself: write it as a fraction first.')] })
    c.from = `${id}b`
    return r
  }
  const l = evalN(n.a, steps, c)
  const rr = evalN(n.b, steps, c)
  const res = n.op === '+' ? add(l, rr) : n.op === '-' ? sub(l, rr) : n.op === '×' ? mul(l, rr) : mul(l, recip(rr))
  const id = `t${c.k++}`
  let ex = `${st(l)} ${bop(n.op)} ${st(rr)}`
  let from = c.from
  // a product / quotient of mixed numbers: write them as fractions first
  if ((n.op === '×' || n.op === '÷') && (st(l) !== fi(l) || st(rr) !== fi(rr))) {
    const fx2 = `${fi(l)} ${bop(n.op)} ${fi(rr)}`
    const wr = uniq([`${fi(q(l.n + 1, l.d))} ${bop(n.op)} ${fi(rr)}`, `${fi(l)} ${bop(n.op)} ${fi(recip(rr))}`, `${fi(l)} ${bop(n.op)} ${fi(q(rr.n + 1, rr.d))}`].filter((s) => s !== fx2), (s) => s)
    steps.push({ label: 'Write the mixed numbers as fractions.', onlyFrom: true, toks: [{ id: `${id}f`, tex: `${ex} =` }, { id: `${id}h`, tex: fx2 }], blanks: [blk(`${id}h`, c.from, `$${ex} = \\square$`, wr, 'A mixed number: whole number times the denominator plus the numerator, over the denominator.')] })
    ex = fx2
    from = `${id}h`
  }
  const label = n.p ? `Brackets first. ${LABEL[n.op]}` : LABEL[n.op]
  const wr = [n.op === '+' ? q(l.n + rr.n, l.d + rr.d) : n.op === '×' ? add(l, rr) : mul(l, rr)]
  if ((n.op === '×' || n.op === '÷') && st(res) !== fi(res)) {
    // the product / quotient first as one fraction, then as a mixed number
    steps.push({ label, onlyFrom: true, toks: [{ id: `${id}a`, tex: ex }, { id: `${id}g`, tex: '=' }, { id: `${id}p`, tex: fi(res) }], blanks: [blk(`${id}p`, from, `$${ex} = \\square$`, wrongsOf(res, fi, wr), HINT7[n.op])] })
    steps.push({ label: 'As a mixed number.', onlyFrom: true, toks: [{ id: `${id}m`, tex: `${fi(res)} =` }, { id: `${id}b`, tex: st(res) }], blanks: [blk(`${id}b`, `${id}p`, `$${fi(res)} = \\square$`, wrongsOf(res, st, wr), 'Divide the numerator by the denominator: the whole part is the quotient, the fraction part is the remainder over the denominator.')] })
  } else steps.push({ label, onlyFrom: true, toks: [{ id: `${id}a`, tex: ex }, { id: `${id}g`, tex: '=' }, { id: `${id}b`, tex: st(res) }], blanks: [blk(`${id}b`, from, `$${ex} = \\square$`, wrongsOf(res, st, wr), HINT7[n.op])] })
  c.from = `${id}b`
  return res
}
interface E7 {
  tree: N
}
function mk7(e: E7, key: string): It {
  const steps: WpStep[] = []
  const v = evalN(e.tree, steps, { from: 'sn', k: 1 })
  const w: Wp = { tex: `${text('Solve the combined operations: ')}${nt(e.tree)}`, short: nt(e.tree), startToks: startOf7(e.tree), key, answer: st(v), wrong: wrongsOf(v, st), steps }
  return { w }
}
// [leaf kinds, the tree from its leaves, the textbook leaves]
const T7: [string, (l: N[]) => N, string][] = [
  ['m m m', (l) => B('+', l[0], B('×', l[1], l[2])), '2 1/2|3 1/3|1 4/5'],
  ['m m d', (l) => B('×', B('+', l[0], l[1], true), l[2]), '2 1/2|3 1/3|1.8'],
  ['m m m', (l) => B('-', l[0], B('×', l[1], l[2])), '3 1/2|1 1/3|2 3/5'],
  ['m m m', (l) => B('×', B('-', l[0], l[1], true), l[2]), '3 1/2|1 1/3|2 3/5'],
  ['m m m', (l) => B('-', l[0], B('÷', l[1], l[2])), '3 3/4|3 2/3|5 1/2'],
  ['m m d', (l) => B('÷', B('-', l[0], l[1], true), l[2]), '3 3/4|3 2/3|5.5'],
  ['m m m', (l) => B('-', l[0], B('÷', l[1], l[2])), '5 2/5|3 2/3|2 3/4'],
  ['m m m', (l) => B('÷', B('-', l[0], l[1], true), l[2]), '5 2/5|3 2/3|2 3/4'],
  ['m m m m', (l) => B('×', B('-', l[0], l[1], true), B('-', l[2], l[3], true)), '3 3/10|2 2/5|4 2/5|4 1/10'],
  ['m m m', (l) => B('-', S(l[0]), B('÷', l[1], l[2])), '1 2/3|3 3/4|7 1/2'],
]
const treeVal = (n: N): { v: Q; ok: boolean } => {
  if (n.k === 'n') return { v: n.f.q, ok: true }
  if (n.k === 's') {
    const a = treeVal(n.a)
    return { v: mul(a.v, a.v), ok: a.ok }
  }
  const a = treeVal(n.a)
  const b = treeVal(n.b)
  const v = n.op === '+' ? add(a.v, b.v) : n.op === '-' ? sub(a.v, b.v) : n.op === '×' ? mul(a.v, b.v) : mul(a.v, recip(b.v))
  return { v, ok: a.ok && b.ok && val(v) > 0 && v.d <= 3000 }
}
const rows7: [string, E7, E7[]][] = T7.map(([kinds, f, base], i) => {
  const r = rng(700 + i)
  const pool: E7[] = []
  for (let tries = 0; pool.length < 14 && tries < 500; tries++) {
    const tree = f(kinds.split(' ').map((k) => ln(rnum(r, k, false))))
    if (treeVal(tree).ok) pool.push({ tree })
  }
  return [String.fromCharCode(97 + i), { tree: f(base.split('|').map(ln)) }, pool]
})
const idE7 = (e: E7) => nt(e.tree)

// ================= 8 and 10 word problems =================
interface E8 {
  what: string
  f: Q
  batches: number
}
function mk8(e: E8, key: string): It {
  const half = mul(e.f, q(1, 2))
  const all = mul(half, q(e.batches, 1))
  const needMixed = all.d !== 1 && all.n > all.d
  const steps: WpStep[] = [
    { label: 'The amount for one batch after cutting it in half.', toks: [{ id: 'w1a', tex: `${fi(e.f)} \\cdot \\frac{1}{2}` }, { id: 'w1g', tex: '=' }, { id: 'w1b', tex: fi(half) }], blanks: [blk('w1b', 's0', `$${fi(e.f)} \\cdot \\frac{1}{2} = \\square$`, wrongsOf(half, fi, [mul(e.f, q(2, 1))]), 'Half of a number is the number times 1/2: multiply the numerators and the denominators.')] },
    { label: `The amount for ${e.batches} batches.`, toks: [{ id: 'w2a', tex: `${fi(half)} \\cdot ${e.batches}` }, { id: 'w2g', tex: '=' }, { id: 'w2b', tex: fi(all) }], blanks: [blk('w2b', 'w1b', `$${fi(half)} \\cdot ${e.batches} = \\square$`, wrongsOf(all, fi, [mul(e.f, q(e.batches, 1))]), 'Multiply by the number of batches; reduce the fraction.')] },
  ]
  if (needMixed) steps.push({ label: 'As a mixed number.', onlyFrom: true, toks: [{ id: 'w3a', tex: `${fi(all)} =` }, { id: 'w3b', tex: st(all) }], blanks: [blk('w3b', 'w2b', `$${fi(all)} = \\square$`, wrongsOf(all, st), 'Divide the numerator by the denominator: the whole part is the quotient, the fraction part is the remainder over the denominator.')] })
  const w: Wp = {
    tex: `${text('A recipe for cookies requires ')}${fi(e.f)}${text(` of a teaspoon of ${e.what}. Mari plans to cut the amount of ${e.what} in half. How much ${e.what} is needed for ${e.batches} batches of cookies?`)}`,
    short: `${fi(e.f)},\\ ${e.batches}`,
    key,
    answer: needMixed ? st(all) : fi(all),
    wrong: wrongsOf(all, needMixed ? st : fi, [mul(e.f, q(e.batches, 1))]),
    steps,
  }
  return { w }
}
const FR8 = [q(3, 8), q(2, 3), q(3, 4), q(5, 6), q(1, 2), q(5, 8), q(7, 8), q(4, 5), q(3, 5), q(2, 5), q(7, 10), q(5, 12)]
const WHAT8 = ['salt', 'sugar', 'vanilla', 'baking soda', 'cinnamon', 'cocoa']
const pool8 = (): E8[] => {
  const r = rng(808)
  return FR8.map((f, i) => ({ what: WHAT8[i % WHAT8.length], f, batches: between(r, 4, 9) }))
}
const id8 = (e: E8) => `${fi(e.f)}${e.what}${e.batches}`

interface E10 {
  names: [string, string, string]
  f1: Q
  acres: Q
  f2: Q
}
function mk10(e: E10, key: string): It {
  const share = mul(e.f1, e.acres)
  const sue = mul(e.f2, share)
  const [a, b, c] = e.names
  const w: Wp = {
    tex: `${text(`${a} gave `)}${fi(e.f1)}${text(' of the ')}${st(e.acres)}${text(` acre vegetable farm to ${b}. ${b} then gave `)}${fi(e.f2)}${text(` of ${b}'s share of the farm to ${c}. How many acres did ${c} receive?`)}`,
    short: `${fi(e.f1)},\\ ${st(e.acres)},\\ ${fi(e.f2)}`,
    key,
    answer: st(sue),
    wrong: wrongsOf(sue, st, [mul(e.f1, e.f2)]),
    steps: [
      { label: `${b}'s share.`, toks: [{ id: 'x1a', tex: `${fi(e.f1)} \\times ${st(e.acres)}` }, { id: 'x1g', tex: '=' }, { id: 'x1b', tex: st(share) }], blanks: [blk('x1b', 's0', `$${fi(e.f1)} \\times ${st(e.acres)} = \\square$`, wrongsOf(share, st, [add(e.acres, e.f1)]), 'Write the mixed number as a fraction, cancel and multiply, then write the answer as a mixed number.')] },
      { label: `${c}'s share.`, toks: [{ id: 'x2a', tex: `${fi(e.f2)} \\times ${st(share)}` }, { id: 'x2g', tex: '=' }, { id: 'x2b', tex: st(sue) }], blanks: [blk('x2b', 'x1b', `$${fi(e.f2)} \\times ${st(share)} = \\square$`, wrongsOf(sue, st, [mul(e.f2, e.acres)]), 'Write the mixed number as a fraction, cancel and multiply, then write the answer as a mixed number.')] },
    ],
  }
  return { w }
}
const NAMES10: [string, string, string][] = [['Bill', 'Phil', 'Sue'], ['Ana', 'Ben', 'Cy'], ['Dara', 'Eli', 'Fay'], ['Gus', 'Hana', 'Ivo'], ['Jo', 'Kim', 'Lee'], ['Max', 'Nia', 'Ola']]
const rmixAcres = (r: () => number): Q => {
  const d = [2, 3, 4, 5][between(r, 0, 3)]
  return mix(between(r, 2, 9), between(r, 1, d - 1), d)
}
const pool10 = (): E10[] => {
  const r = rng(1010)
  return NAMES10.flatMap((names) => [0, 1].map((): E10 => ({ names, f1: q(between(r, 1, 4), 5 + between(r, 0, 3)), acres: rmixAcres(r), f2: q(1, between(r, 2, 5)) }))).map((e) => ({ ...e, f1: val(e.f1) < 1 ? e.f1 : q(3, 4) }))
}
const id10 = (e: E10) => `${e.names[0]}${fi(e.f1)}${st(e.acres)}${fi(e.f2)}`

// exercises 8 (the recipe) and 10 (the farm) are one exercise: a = recipe, b = farm
type W = { k: 8; e: E8 } | { k: 10; e: E10 }
const mkWord = (w: W, key: string) => (w.k === 8 ? mk8(w.e, key) : mk10(w.e, key))
const idWord = (w: W) => (w.k === 8 ? id8(w.e) : id10(w.e))
const WORD_ROWS: [string, W, W[]][] = [
  ['a', { k: 8, e: { what: 'salt', f: q(3, 8), batches: 6 } }, pool8().map((e): W => ({ k: 8, e }))],
  ['b', { k: 10, e: { names: ['Bill', 'Phil', 'Sue'], f1: q(3, 4), acres: mix(4, 4, 5), f2: q(1, 3) } }, pool10().map((e): W => ({ k: 10, e }))],
]

export const EX_FRAC34 = [
  build(1, 'Choose the product.', rowsOf(PARTS1, 1100), mkChain('Multiply: ', false), idE, 'Multiply', 7001, '3.4'),
  build(2, 'Choose the product.', rowsOf(PARTS2, 1200, true), mkChain('Multiply by simplifying first: ', false), idE, 'Multiply by simplifying first', 7002, '3.4'),
  build(3, 'Choose the reciprocal.', rows3, ans(mk3), idE3, 'Reciprocals', 7003, '3.4'),
  build(4, 'Choose the quotient.', rowsOf(PARTS4, 1400), mkChain('Divide: ', false), idE, 'Divide', 7004, '3.4'),
  build(5, 'Choose the quotient.', rowsOf(PARTS5, 1500, true), mkChain('Divide and simplify: ', false), idE, 'Divide and simplify', 7005, '3.4'),
  build(6, 'Choose the answer.', rowsOf(PARTS6, 1600), mkChain('Multiply and/or divide and simplify. Leave the answer in mixed fraction form: ', true), idE, 'Mixed numbers', 7006, '3.4'),
  build(7, 'Choose the answer.', rows7, ans(mk7), idE7, 'Combined operations', 7007, '3.4'),
  build(8, 'Choose the answer.', WORD_ROWS, ans(mkWord), idWord, 'Word problems', 7008, '3.4'),
]

// ================= challenge exercises (3.4 exercises 1, 2, 4, 5, 6, harder): more factors and bigger numbers; optional extra practice, own progress (no 9 to 13) =================
const rank34 = (e: E) => e.ts.length
const H1: Part[] = [P('f -f i f', '2/3 -3/5 4 5/7', '***'), P('-f -f f f', '-2/5 -4/7 1/3 5/6', '***'), P('i f -f f', '3 2/9 -3/4 5/8', '***'), P('-f f f -f f', '-1/2 3/4 5/7 -2/3 4/5', '****')]
const H2: Part[] = [P('f f f f', '3/7 14/9 5/2 6/5', '***', true), P('-f f -f f', '-4/5 15/8 -7/9 6/7', '***', true), P('g -f f -f', '21/5 -25/14 2/15 -9/10', '***', true), P('f -f f f f', '9/14 -28/15 -3/7 5/6 4/9', '****', true)]
const H4: Part[] = [P('f f f', '2/3 5/7 3/4', '//'), P('-f f -f', '-3/4 2/11 -5/6', '//'), P('i f f', '9 2/3 3/5', '//'), P('-f -f f f', '-8/15 -3/4 2/5 7/9', '///')]
const H5: Part[] = [P('f f f', '2/3 5/6 4/9', '//', true), P('g f -f', '9/4 3/14 -5/8', '//', true), P('-f f g', '-13/17 39/34 7/6', '//', true), P('-f -f f f', '-15/28 -5/7 3/4 9/10', '///', true)]
const H6: Part[] = [P('m m m', '2 1/2|3 1/3|1 3/5', '**'), P('m -m m', '4 2/3|-3 1/9|2 1/4', '*/'), P('-m m -m', '-5 4/7|1 8/13|-2 1/6', '//'), P('m m m m', '3 1/3|1 4/5|1 1/6|2 2/5', '*/*')]
export const EX_FRAC34H = [
  build(9, 'Choose the product.', rowsOf(H1, 1900, true), mkChain('Multiply: ', false), idE, 'Multiply (challenge)', 7009, '3.4', rank34),
  build(10, 'Choose the product.', rowsOf(H2, 1910, true), mkChain('Multiply by simplifying first: ', false), idE, 'Multiply by simplifying first (challenge)', 7010, '3.4', rank34),
  build(11, 'Choose the quotient.', rowsOf(H4, 1920, true), mkChain('Divide: ', false), idE, 'Divide (challenge)', 7011, '3.4', rank34),
  build(12, 'Choose the quotient.', rowsOf(H5, 1930, true), mkChain('Divide and simplify: ', false), idE, 'Divide and simplify (challenge)', 7012, '3.4', rank34),
  build(13, 'Choose the answer.', rowsOf(H6, 1940, true), mkChain('Multiply and/or divide and simplify. Leave the answer in mixed fraction form: ', true), idE, 'Mixed numbers (challenge)', 7013, '3.4', rank34),
]
