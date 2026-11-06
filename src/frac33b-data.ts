// Grade 9 3.3 Adding and Subtracting Using Fraction Notation (mineru G9 Chapter 3): exercises 1 to 10 (11 and up are in frac33-data.ts).
//   1 add (same denominators), 2 mixed number to improper fraction, 3 improper fraction to mixed number, 4 add (improper form), 5 subtract, 6 prime factors, 7 LCM,
//   8 add or subtract (different denominators, with the LCD), 9 add (mixed numbers), 10 subtract (mixed numbers)
// Every question is multiple choice; the lessons are blanks (lessonWp via sqrt12-data.ts `mk`). The similar questions are made from the book's question by new numbers of the same kind.
// Imported by: quiz.tsx, check33b.ts. Shape: exercise.ts.
import { build, rng, uniq } from './graph42-data'
import { text } from './seq41-data'
import { add, gcd, mix, q as Qn, sub } from './frac33-data'
import type { Q } from './frac33-data'
import { idOf, mk, rows } from './sqrt12-data'
import type { Item } from './sqrt12-data'

type St = Item['steps'][number]
const less = (xs: string[], a: string) => uniq(xs, (s) => s).filter((s) => s !== a)
const lcm = (a: number, b: number) => (a / gcd(a, b)) * b
const between = (r: () => number, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1))

// ---- fractions as TeX: improper (7/4) or mixed (1 3/4), with the sign in front ----
type Mode = 'imp' | 'mix'
const fmtAbs = (a: Q, mode: Mode): string => {
  if (a.d === 1) return String(a.n)
  if (mode === 'imp') return `\\frac{${a.n}}{${a.d}}`
  const w = Math.floor(a.n / a.d)
  const r = a.n - w * a.d
  return w ? `${w}\\frac{${r}}{${a.d}}` : `\\frac{${r}}{${a.d}}`
}
const sf = (a: Q, mode: Mode) => (a.n < 0 ? `-${fmtAbs({ n: -a.n, d: a.d }, mode)}` : fmtAbs(a, mode))
const wr = (r: Q, mode: Mode): string[] => less([sf(add(r, Qn(1, r.d)), mode), sf(sub(r, Qn(1, r.d)), mode), sf(Qn(-r.n, r.d), mode), sf(add(r, Qn(1, 1)), mode), sf(sub(r, Qn(1, 1)), mode)], sf(r, mode))

// ================= the expressions: "3/7 + -2/7", "-2_3/4 - 7/4", "15 + 2_3/4" =================
interface Term {
  op: '+' | '-'
  neg: boolean
  v: Q // the absolute value
  disp: string // as written (the fraction is not reduced)
}
const NUM = /^(-)?(?:(\d+)_)?(\d+)(?:\/(\d+))?$/
function parse(spec: string): Term[] {
  const out: Term[] = []
  let op: '+' | '-' = '+'
  for (const tok of spec.split(' ')) {
    if (tok === '+' || tok === '-') {
      op = tok
      continue
    }
    const m = NUM.exec(tok)!
    const neg = !!m[1]
    const a = +m[3]
    if (m[4]) {
      const b = +m[4]
      out.push(m[2] ? { op, neg, v: mix(+m[2], a, b), disp: `${m[2]}\\frac{${a}}{${b}}` } : { op, neg, v: Qn(a, b), disp: `\\frac{${a}}{${b}}` })
    } else out.push({ op, neg, v: Qn(a, 1), disp: String(a) })
    op = '+'
  }
  return out
}
const termTex = (t: Term, first: boolean) => (first ? `${t.neg ? '-' : ''}${t.disp}` : t.neg ? `\\left(-${t.disp}\\right)` : t.disp)
const exprTex = (ts: Term[]) => ts.map((t, i) => (i === 0 ? termTex(t, true) : ` ${t.op} ${termTex(t, false)}`)).join('')
const sq = (t: Term) => Qn(t.neg ? -t.v.n : t.v.n, t.v.d)
const dens = (ts: Term[]) => [...new Set(ts.map((t) => t.v.d).filter((d) => d > 1))]

function chainItem(spec: string, prompt: string, mode: Mode, lcdSteps = false): Item {
  const ts = parse(spec)
  const expr = exprTex(ts)
  const accs: Q[] = [sq(ts[0])]
  for (let i = 1; i < ts.length; i++) accs.push(ts[i].op === '+' ? add(accs[i - 1], sq(ts[i])) : sub(accs[i - 1], sq(ts[i])))
  const final = accs[accs.length - 1]
  const ans = sf(final, mode)
  const ds = dens(ts)
  const hint = ds.length > 1 ? 'Write the fractions with the same denominator (the LCD), then add or subtract the numerators. Reduce at the end.' : 'The denominators are the same: add or subtract the numerators and keep the denominator. A mixed number is a whole number plus a fraction. Reduce at the end.'
  const steps: St[] = []
  if (lcdSteps) {
    const L = ds.reduce(lcm, 1)
    const rewrite = (bump: number) =>
      ts
        .map((t, i) => {
          const tx = `\\frac{${t.v.n * (L / t.v.d) + (i === 0 ? bump : 0)}}{${L}}`
          return i === 0 ? `${t.neg ? '-' : ''}${tx}` : ` ${t.op} ${t.neg ? `\\left(-${tx}\\right)` : tx}`
        })
        .join('')
    const rewTex = rewrite(0)
    steps.push(['The least common denominator (LCD).', '\\text{LCD} =', String(L), `$\\text{LCD of } ${ds.join(',\\ ')} = \\square$`, less([String(ds.reduce((a, b) => a * b, 1)), String(ds.reduce((a, b) => a + b, 0)), String(Math.max(...ds)), String(L * 2)], String(L)), 'The LCD is the smallest number that all the denominators go into: the LCM of the denominators.'])
    steps.push(['Write every fraction with the LCD.', `${expr} =`, rewTex, `$${expr} = \\square$`, less([rewrite(1), rewrite(-1), rewrite(2)], rewTex), 'Multiply the numerator and the denominator of each fraction by the same number so that the denominator is the LCD.'])
    steps.push(['Add or subtract the numerators.', `${rewTex} =`, ans, `$${rewTex} = \\square$`, wr(final, mode), 'Add or subtract the numerators and keep the denominator. Reduce at the end.'])
  } else {
    for (let i = 1; i < ts.length; i++) {
      const left = i === 1 ? termTex(ts[0], true) : sf(accs[i - 1], mode)
      const lhs = `${left} ${ts[i].op} ${termTex(ts[i], false)}`
      steps.push([i === 1 ? 'The first two numbers.' : 'The next number.', `${lhs} =`, sf(accs[i], mode), `$${lhs} = \\square$`, wr(accs[i], mode), hint])
    }
  }
  return { q: `${text(prompt)}${expr}`, short: expr, ans, wrong: wr(final, mode), steps }
}

// similar questions: the same shape (signs, kinds of numbers) with new denominators and numerators
const cop = (r: () => number, lo: number, hi: number, d: number) => {
  for (let k = 0; k < 40; k++) {
    const n = between(r, lo, hi)
    if (gcd(n, d) === 1) return n
  }
  return lo
}
function mutate(spec: string, r: () => number, same: boolean): string {
  const map = new Map<number, number>()
  const used = new Set<number>()
  const pickDen = (): number => {
    const list = same ? [5, 6, 7, 8, 9, 11] : [2, 3, 4, 5, 6, 8, 9, 10, 12]
    for (let k = 0; k < 40; k++) {
      const d = list[between(r, 0, list.length - 1)]
      if (!same && used.has(d)) continue
      used.add(d)
      return d
    }
    return 7
  }
  return spec
    .split(' ')
    .map((tok) => {
      if (tok === '+' || tok === '-') return tok
      const m = NUM.exec(tok)!
      const sign = m[1] ?? ''
      if (!m[4]) return `${sign}${between(r, 2, 20)}`
      const b = +m[4]
      if (!map.has(b)) map.set(b, same && map.size ? [...map.values()][0] : pickDen())
      const D = map.get(b)!
      if (m[2]) return `${sign}${between(r, 1, 9)}_${cop(r, 1, D - 1, D)}/${D}`
      return +m[3] > b ? `${sign}${cop(r, D + 1, 2 * D - 1, D)}/${D}` : `${sign}${cop(r, 1, D - 1, D)}/${D}`
    })
    .join(' ')
}
const pool = (specs: string[], seed: number, same: boolean, prompt: string, mode: Mode, lcd = false): Item[][] =>
  specs.map((s, i) => {
    const r = rng(seed + i * 7)
    const list = [s]
    for (let k = 0; k < 60 && list.length < 15; k++) {
      let m = mutate(s, r, same)
      // a harder end for the ladder: one more term over the same denominator (not for the parts that are already long)
      if (same && k % 3 === 2 && m.split(' ').length < 6) {
        const D = +/\/(\d+)\s*$/.exec(m)![1]
        m += ` ${r() < 0.5 ? '+' : '-'} ${cop(r, 1, D - 1, D)}/${D}`
      }
      if (!list.includes(m)) list.push(m)
    }
    return list.map((x) => chainItem(x, prompt, mode, lcd))
  })

const S1 = ['3/7 + 2/7', '-3/7 + 2/7', '-3/7 + -2/7', '-5/8 + 7/8', '5/8 + -7/8', '-5/8 + -7/8', '0/6 + 5/6', '0/6 + -5/6', '3/5 + 4/5 + 2/5', '-3/5 + -4/5 + -2/5', '3/5 + -4/5 + 2/5', '-3/5 + 4/5 + -2/5']
const S4 = ['2_3/4 + 7/4', '2_3/4 + -7/4', '-2_3/4 + -7/4', '1_2/3 + 8/3 + 4_1/3', '-1_2/3 + 8/3 + -4_1/3', '-1_2/3 + -8/3 + 4_1/3', '-1_2/9 + 7/9 + -3_4/9', '-1_2/9 + -7/9 + 3_4/9', '1_2/9 + -7/9 + -3_4/9', '1_2/9 + 7/9 + -3_4/9']
const S5 = ['5/6 - 1/6', '-5/6 - 1/6', '3_2/5 - 4_4/5', '-3_2/5 - 4_4/5', '-3_2/5 - -4_4/5', '-1/7 + 3_2/7 - 9/7', '-1/7 - -3_2/7 - -9/7', '-3_5/8 - 4_3/8 - 11/8', '-3_5/8 - -4_3/8 - 11/8', '3_5/8 - 4_3/8 - -11/8']
const S8 = ['1/2 + 1/4', '1/2 + 1/3', '1/2 - 1/3', '5/6 + 3/8', '5/6 - 3/8', '5/12 + 7/8', '5/12 - 7/8', '1/2 - 3/8 + 1/4', '3/8 - 7/12 + 11/15', '-3/8 + 7/36 + -17/48']
const S9 = ['15 + 2_3/4', '2_1/4 + 3_1/8', '2_1/2 + -3_1/4', '-2_1/2 + -3_1/4', '4_2/3 + 3_3/4', '4_2/3 + -3_3/4', '2_1/2 + 3_1/4 + 4_3/8', '3_1/8 + -9_2/3 + 4_3/4', '-6_2/3 + 7_3/5 + -3_1/4', '-3_7/15 + 2_4/9 + -4_3/10']
const S10 = ['3_1/2 - 3_1/3', '3_1/3 - 3_1/2', '7 - 8_2/3', '4_3/8 - 3/4', '-3_1/6 - -2_4/9', '-3_5/18 - 2_4/15', '-2_2/3 - -3_3/4 - 4_5/6', '2_2/3 - 3_3/4 - -4_5/6', '-5_7/8 - 3_5/12 - -9_4/15', '-5_7/8 - -3_5/12 - -9_4/15']
const E1 = pool(S1, 3100, true, 'Add: ', 'imp')
const E4 = pool(S4, 3400, true, 'Add and simplify. Leave in improper form: ', 'imp')
const E5 = pool(S5, 3500, true, 'Subtract and simplify: ', 'mix')
const E8 = pool(S8, 3800, false, 'Add or subtract. Simplify if possible: ', 'imp', true)
const E9 = pool(S9, 3900, false, 'Add and simplify. Leave the answer in mixed fraction form: ', 'mix')
const E10 = pool(S10, 3950, false, 'Subtract and simplify. Leave the answer in mixed fraction form: ', 'mix')

// ================= 2 mixed number to improper fraction, 3 improper fraction to mixed number =================
const SIG = (neg: boolean) => (neg ? '-' : '')
function item2(neg: boolean, w: number, n: number, d: number): Item {
  const N1 = w * d + n
  const ans = `${SIG(neg)}\\frac{${N1}}{${d}}`
  const wrong = less([`${SIG(neg)}\\frac{${w + n}}{${d}}`, `${SIG(neg)}\\frac{${w * n + d}}{${d}}`, `${SIG(neg)}\\frac{${N1}}{${n}}`, `${SIG(neg)}\\frac{${N1 + 1}}{${d}}`], ans)
  return {
    q: `${text('Change from a mixed fraction to an improper fraction: ')}${SIG(neg)}${w}\\frac{${n}}{${d}}`, short: `${SIG(neg)}${w}\\frac{${n}}{${d}}`, ans, wrong,
    steps: [
      ['The whole number times the denominator.', `${w} \\times ${d} =`, String(w * d), `$${w} \\times ${d} = \\square$`, less([String(w + d), String(w * n), String(w * d + d)], String(w * d)), 'The whole number is w wholes; each whole has d parts.'],
      ['Add the numerator.', `${w * d} + ${n} =`, String(N1), `$${w * d} + ${n} = \\square$`, less([String(w * d - n), String(N1 + 1), String(N1 - 1)], String(N1)), 'The parts of the wholes and the parts of the fraction together.'],
      ['Write it over the denominator.', '\\text{improper fraction} =', ans, `$${SIG(neg)}${w}\\frac{${n}}{${d}} = \\square$`, wrong, 'Keep the denominator and keep the sign.'],
    ],
  }
}
function item3(neg: boolean, n: number, d: number): Item {
  const w = Math.floor(n / d)
  const r = n - w * d
  const ans = `${SIG(neg)}${w}\\frac{${r}}{${d}}`
  const wrong = less([`${SIG(neg)}${w + 1}\\frac{${r}}{${d}}`, `${SIG(neg)}${w}\\frac{${d - r}}{${d}}`, `${SIG(neg)}${r}\\frac{${w}}{${d}}`, `${SIG(neg)}${w}\\frac{${r}}{${n}}`], ans)
  const f = `${SIG(neg)}\\frac{${n}}{${d}}`
  return {
    q: `${text('Change from an improper fraction to a mixed fraction: ')}${f}`, short: f, ans, wrong,
    steps: [
      ['Divide the numerator by the denominator.', `${n} \\div ${d} =`, `${w}\\text{ R }${r}`, `$${n} \\div ${d} = \\square$`, less([`${w + 1}\\text{ R }${r}`, `${w}\\text{ R }${d - r}`, `${r}\\text{ R }${w}`], `${w}\\text{ R }${r}`), 'The quotient is the whole number and the remainder is the new numerator.'],
      ['Write the mixed number.', `${f} =`, ans, `$${f} = \\square$`, wrong, 'Whole number, then remainder over the same denominator. Keep the sign.'],
    ],
  }
}
const B2: [boolean, number, number, number][] = [[false, 3, 2, 7], [true, 4, 1, 4], [false, 6, 3, 5], [true, 5, 3, 11], [false, 2, 5, 6], [true, 4, 3, 10]]
const E2: Item[][] = B2.map(([neg, w, n, d], i) => {
  const r = rng(200 + i)
  const out = [item2(neg, w, n, d)]
  for (let k = 0; k < 60 && out.length < 15; k++) {
    const D = between(r, 3, 12)
    const it = item2(neg, between(r, 2, 9), cop(r, 1, D - 1, D), D)
    if (!out.some((o) => o.q === it.q)) out.push(it)
  }
  return out
})
const B3: [boolean, number, number][] = [[false, 17, 3], [true, 23, 5], [false, 18, 7], [true, 23, 6], [false, 19, 4], [true, 33, 10]]
const E3: Item[][] = B3.map(([neg, n, d], i) => {
  const r = rng(300 + i)
  const out = [item3(neg, n, d)]
  for (let k = 0; k < 60 && out.length < 15; k++) {
    const D = between(r, 3, 12)
    const it = item3(neg, D * between(r, 2, 6) + cop(r, 1, D - 1, D), D)
    if (!out.some((o) => o.q === it.q)) out.push(it)
  }
  return out
})

// ================= 6 prime factors, 7 LCM =================
const primes = (n: number): number[] => {
  const out: number[] = []
  for (let p = 2; p * p <= n; p++) while (n % p === 0) { out.push(p); n /= p }
  if (n > 1) out.push(n)
  return out
}
const isPrime = (n: number) => primes(n).length === 1
function item6(n: number): Item {
  const m = Math.abs(n)
  const ps = primes(m)
  const sg = n < 0 ? '-' : ''
  const prod = `${sg}${ps.join(' \\times ')}`
  const wrong = less([`${sg}${[ps[0] * ps[1], ...ps.slice(2)].join(' \\times ')}`, `${sg}${ps.slice(0, -1).join(' \\times ')}`, `${sg}${[...ps, 2].join(' \\times ')}`, `${sg}${ps.map((p, i) => (i === 0 ? p + 1 : p)).join(' \\times ')}`], prod)
  const steps: St[] = []
  let cur = m
  for (let i = 0; i < ps.length - 1; i++) {
    const nx = cur / ps[i]
    steps.push(['Divide by a prime that goes in.', `${cur} \\div ${ps[i]} =`, String(nx), `$${cur} \\div ${ps[i]} = \\square$`, less([String(nx + 1), String(nx - 1), String(cur - ps[i]), String(nx * 2)], String(nx)), 'Divide by the smallest prime that goes in. Stop when the quotient is a prime number.'])
    cur = nx
  }
  steps.push(['Write the product of the primes.', `${n} =`, prod, `$${n} = \\square$`, wrong, 'The primes you divided by, and the last quotient. Keep the sign.'])
  return { q: `${text('Make the number a product of prime numbers: ')}${n}`, short: String(n), ans: prod, wrong, steps }
}
const B6 = [12, -18, 72, -144, 120, -48, 78, -100, 54, -60]
const E6: Item[][] = B6.map((n) => {
  const near = Array.from({ length: 160 }, (_, i) => i + 6).filter((m) => !isPrime(m) && m !== Math.abs(n)).sort((a, b) => Math.abs(a - Math.abs(n)) - Math.abs(b - Math.abs(n))).slice(0, 14)
  return [item6(n), ...near.map((m) => item6(n < 0 ? -m : m))]
})
const expTex = (p: number, e: number) => (e === 1 ? `${p}` : `${p}^{${e}}`)
const factorMap = (n: number) => {
  const m = new Map<number, number>()
  for (const p of primes(n)) m.set(p, (m.get(p) ?? 0) + 1)
  return m
}
const facTex = (n: number) => `${n} = ${[...factorMap(n)].map(([p, e]) => expTex(p, e)).join(' \\cdot ')}`
function item7(ns: number[]): Item {
  const maps = ns.map(factorMap)
  const all = [...new Set(maps.flatMap((m) => [...m.keys()]))].sort((a, b) => a - b)
  const hi = all.map((p) => [p, Math.max(...maps.map((m) => m.get(p) ?? 0))] as [number, number])
  const lo = all.map((p) => [p, Math.min(...maps.map((m) => m.get(p) ?? 0))] as [number, number]).filter(([, e]) => e > 0)
  const L = hi.reduce((a, [p, e]) => a * p ** e, 1)
  const hiTex = hi.map(([p, e]) => expTex(p, e)).join(' \\cdot ')
  const listTex = ns.map(facTex).join(',\\ ')
  const wrongList = uniq(ns.map((n, i) => ns.map((x, j) => facTex(i === j ? n + 1 : x)).join(',\\ ')), (s) => s).filter((s) => s !== listTex)
  const wrongHi = less([lo.map(([p, e]) => expTex(p, e)).join(' \\cdot ') || '1', all.join(' \\cdot '), hi.map(([p, e]) => expTex(p, e + 1)).join(' \\cdot ')], hiTex)
  const set = ns.join(',\\ ')
  const wrongL = less([String(ns.reduce((a, b) => a * b, 1)), String(Math.max(...ns)), String(ns.reduce((a, b) => a + b, 0)), String(L * 2), String(L / 2)].filter((s) => Number.isInteger(+s)), String(L))
  return {
    q: `${text('Determine the LCM of the set of numbers: ')}${set}`, short: set, ans: String(L), wrong: wrongL,
    steps: [
      ['Write each number as a product of primes.', '\\text{primes}', listTex, `$${set} = \\square$`, wrongList, 'Divide by primes until the quotient is a prime. Write repeated primes as powers.'],
      ['The highest power of every prime.', '\\text{LCM} =', hiTex, '$\\text{the highest power of each prime} = \\square$', wrongHi, 'Take every prime that appears, with the highest power it has in any of the numbers.'],
      ['Multiply.', `${hiTex} =`, String(L), `$${hiTex} = \\square$`, wrongL, 'Multiply the highest powers together.'],
    ],
  }
}
const B7 = [[3, 6], [2, 3], [18, 27], [8, 12], [16, 36], [3, 5, 7], [5, 12, 15], [8, 12, 18], [12, 24, 36], [3, 5, 18]]
const E7: Item[][] = B7.map((ns, i) => {
  const r = rng(700 + i)
  const out = [item7(ns)]
  for (let k = 0; k < 200 && out.length < 15; k++) {
    const xs = ns.map(() => between(r, 2, ns.length === 3 ? 24 : 40))
    if (new Set(xs).size < xs.length) continue
    const it = item7(xs.sort((a, b) => a - b))
    if (!out.some((o) => o.q === it.q) && +it.ans < 1500) out.push(it)
  }
  return out
})

const rank = (it: Item) => it.steps.length
export const EX_FRAC33A = [
  build(1, 'Choose the sum.', rows(E1), mk, idOf, 'Add fractions', 33100, '3.3', rank),
  build(2, 'Choose the improper fraction.', rows(E2), mk, idOf, 'Mixed number to improper fraction', 33200, '3.3', rank),
  build(3, 'Choose the mixed number.', rows(E3), mk, idOf, 'Improper fraction to mixed number', 33300, '3.3', rank),
  build(4, 'Choose the sum.', rows(E4), mk, idOf, 'Add (improper form)', 33400, '3.3', rank),
  build(5, 'Choose the difference.', rows(E5), mk, idOf, 'Subtract', 33500, '3.3', rank),
  build(6, 'Choose the product of primes.', rows(E6), mk, idOf, 'Prime factors', 33600, '3.3', rank),
  build(7, 'Choose the LCM.', rows(E7), mk, idOf, 'LCM', 33700, '3.3', rank),
  build(8, 'Choose the answer.', rows(E8), mk, idOf, 'Different denominators', 33800, '3.3', rank),
  build(9, 'Choose the sum.', rows(E9), mk, idOf, 'Add mixed numbers', 33900, '3.3', rank),
  build(10, 'Choose the difference.', rows(E10), mk, idOf, 'Subtract mixed numbers', 331000, '3.3', rank),
]

// ================= challenge exercises (3.3 exercises 1 to 10, harder): the same kinds of question with more terms, bigger numbers, more different denominators =================
// Optional extra practice for fast students: separate exercises (no 12 to 21) with their own progress. Everything is made by code, so the answers and the blanks are computed like in the exercises above.
const pk = <T,>(r: () => number, xs: T[]) => xs[between(r, 0, xs.length - 1)]
// k terms. same: one denominator for all; otherwise distinct denominators from a list. mixedNums: mixed numbers instead of proper fractions. subtract: some terms are subtracted
function hardSpec(r: () => number, k: number, same: boolean, mixedNums: boolean, subtract: boolean): string {
  const sameD = pk(r, [7, 8, 9, 11, 12, 13])
  const pool = [4, 6, 8, 9, 10, 12, 14, 15]
  const dens = Array.from({ length: k }, () => (same ? sameD : pool.splice(between(r, 0, pool.length - 1), 1)[0]))
  return dens
    .map((D, i) => {
      const fr = `${cop(r, 1, D - 1, D)}/${D}`
      const t = mixedNums ? `${between(r, 1, 9)}_${fr}` : fr
      const neg = r() < 0.5 ? '-' : ''
      return i === 0 ? `${neg}${t}` : `${subtract && r() < 0.6 ? '-' : '+'} ${neg}${t}`
    })
    .join(' ')
}
type Gen = (r: () => number) => Item
const hardPool = (seed: number, parts: number, gen: (i: number) => Gen): Item[][] =>
  Array.from({ length: parts }, (_, i) => {
    const r = rng(seed + i * 13)
    const g = gen(i)
    const list: Item[] = []
    for (let n = 0; n < 200 && list.length < 15; n++) {
      const it = g(r)
      if (!list.some((x) => x.q === it.q)) list.push(it)
    }
    return list
  })
const chainGen = (prompt: string, mode: Mode, same: boolean, mixedNums: boolean, subtract: boolean, lcd = false, ks = [4, 5]): ((i: number) => Gen) => (i) => (r) => chainItem(hardSpec(r, ks[i % ks.length], same, mixedNums, subtract), prompt, mode, lcd)
const C1 = hardPool(1100, 4, chainGen('Add: ', 'imp', true, false, false))
const C2 = hardPool(1200, 4, (i) => (r) => { const D = between(r, 7, 19); return item2(i % 2 === 1, between(r, 11, 49), cop(r, 1, D - 1, D), D) })
const C3 = hardPool(1300, 4, (i) => (r) => { const D = between(r, 7, 19); return item3(i % 2 === 1, D * between(r, 8, 30) + cop(r, 1, D - 1, D), D) })
const C4 = hardPool(1400, 4, chainGen('Add and simplify. Leave in improper form: ', 'imp', true, true, false))
const C5 = hardPool(1500, 4, chainGen('Subtract and simplify: ', 'mix', true, true, true))
const many = Array.from({ length: 900 }, (_, i) => i + 120).filter((n) => !isPrime(n) && primes(n).length >= 5)
const C6 = hardPool(1600, 4, (i) => (r) => item6(i % 2 === 1 ? -pk(r, many) : pk(r, many)))
const C7 = hardPool(1700, 4, (i) => (r) => {
  for (;;) {
    const xs = [...new Set(Array.from({ length: i < 2 ? 3 : 4 }, () => between(r, 6, 60)))].sort((a, b) => a - b)
    const it = item7(xs)
    if (xs.length > 2 && +it.ans < 5000) return it
  }
})
const C8 = hardPool(1800, 4, chainGen('Add or subtract. Simplify if possible: ', 'imp', false, false, true, true, [3, 4]))
const C9 = hardPool(1900, 4, chainGen('Add and simplify. Leave the answer in mixed fraction form: ', 'mix', false, true, false, false, [3, 4]))
const C10 = hardPool(2000, 4, chainGen('Subtract and simplify. Leave the answer in mixed fraction form: ', 'mix', false, true, true, false, [3, 4]))
export const EX_FRAC33H = [
  build(12, 'Choose the sum.', rows(C1), mk, idOf, 'Add fractions (challenge)', 33120, '3.3', rank),
  build(13, 'Choose the improper fraction.', rows(C2), mk, idOf, 'Mixed to improper (challenge)', 33130, '3.3', rank),
  build(14, 'Choose the mixed number.', rows(C3), mk, idOf, 'Improper to mixed (challenge)', 33140, '3.3', rank),
  build(15, 'Choose the sum.', rows(C4), mk, idOf, 'Add, improper form (challenge)', 33150, '3.3', rank),
  build(16, 'Choose the difference.', rows(C5), mk, idOf, 'Subtract (challenge)', 33160, '3.3', rank),
  build(17, 'Choose the product of primes.', rows(C6), mk, idOf, 'Prime factors (challenge)', 33170, '3.3', rank),
  build(18, 'Choose the LCM.', rows(C7), mk, idOf, 'LCM (challenge)', 33180, '3.3', rank),
  build(19, 'Choose the answer.', rows(C8), mk, idOf, 'Different denominators (challenge)', 33190, '3.3', rank),
  build(20, 'Choose the sum.', rows(C9), mk, idOf, 'Add mixed numbers (challenge)', 33200, '3.3', rank),
  build(21, 'Choose the difference.', rows(C10), mk, idOf, 'Subtract mixed numbers (challenge)', 33210, '3.3', rank),
]
