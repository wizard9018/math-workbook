// Grade 9 3.1 (bank/G9-ch3/s1/items.json): rational numbers. Exercises 1, 3, 9, 10, 11 are left out.
//   2 click the point of a rational number on a number line, 4 the common denominator of two fractions, 5 order five rational numbers from least to greatest,
//   6 compare two rational numbers (< or >), 7 a decimal between two fractions, 8 a fraction between two decimals.
// Every question is multiple choice; the lessons are blanks (ineq64-data.ts lessonWp, built with graph42-data.ts `build`). The numbers are exact fractions (n / d),
// the decimals (also the repeating ones) are made by long division here; the 10 similar questions of every question are made here from small tables, every answer and step is computed.
// Imported by: quiz.tsx, check31.ts. Shape: exercise.ts.
import type { Wp, WpStep } from './ineq64-data'
import { build, rng, uniq } from './graph42-data'
import type { It } from './graph42-data'
import { blk, n4, range, shuffled, text } from './seq41-data'

// ---- exact rational numbers: n / d (d > 0) and how they are written ----
interface Q {
  n: number
  d: number
  tex: string
}
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a))
const lcm = (a: number, b: number) => (a / gcd(a, b)) * b
const cmp = (x: Q, y: Q) => Math.sign(x.n * y.d - y.n * x.d)
const val = (x: Q) => x.n / x.d
const fr = (n: number, d: number): Q => ({ n, d, tex: `${n < 0 ? '-' : ''}\\frac{${Math.abs(n)}}{${d}}` })
// a mixed number: sign, whole part, p / d
const mixed = (neg: boolean, w: number, p: number, d: number): Q => ({ n: (neg ? -1 : 1) * (w * d + p), d, tex: `${neg ? '-' : ''}${w}\\frac{${p}}{${d}}` })
// a terminating decimal from its text
const dc = (s: string): Q => {
  const k = (s.split('.')[1] ?? '').length
  return { n: Math.round(Number(s) * 10 ** k), d: 10 ** k, tex: s }
}
// a repeating decimal: sign, whole, the digits before the bar, the repeating digits
const rp = (neg: boolean, w: number, pre: string, rep: string): Q => {
  const a = pre.length
  const r = rep.length
  const den = 10 ** a * (10 ** r - 1)
  const num = (w * 10 ** a + Number(pre || '0')) * (10 ** r - 1) + Number(rep)
  return { n: (neg ? -1 : 1) * num, d: den, tex: `${neg ? '-' : ''}${w}.${pre}\\overline{${rep}}` }
}
// a decimal text such as -1.7 or -2.00\overline{1}: the repeating part is written with \overline
function parseDec(s: string): Q {
  const m = s.match(/^(-?)(\d+)\.(\d*)\\overline\{(\d+)\}$/)
  return m ? rp(m[1] === '-', Number(m[2]), m[3], m[4]) : dc(s)
}
// any n / d as a decimal by long division: -0.58\overline{3}, 1.625
const decTex = (n: number, d: number): string => {
  let r = Math.abs(n)
  const ip = Math.floor(r / d)
  r %= d
  const digs: number[] = []
  const seen = new Map<number, number>()
  while (r !== 0 && !seen.has(r)) {
    seen.set(r, digs.length)
    r *= 10
    digs.push(Math.floor(r / d))
    r %= d
  }
  const s = `${n < 0 ? '-' : ''}${ip}`
  if (digs.length === 0) return s
  if (r === 0) return `${s}.${digs.join('')}`
  const st = seen.get(r)!
  return `${s}.${digs.slice(0, st).join('')}\\overline{${digs.slice(st).join('')}}`
}
const dec = (x: Q) => decTex(x.n, x.d)
// n / d in lowest terms, as a mixed number when it is bigger than 1 in size
const asFrac = (n: number, d: number): Q => {
  const g = gcd(n, d) || 1
  const [a, b] = [n / g, d / g]
  return Math.abs(a) > b ? mixed(a < 0, Math.floor(Math.abs(a) / b), Math.abs(a) % b, b) : fr(a, b)
}
// a decimal with few digits strictly between lo and hi (lo < hi), nearest to the middle: n / 10^k
const between = (lo: Q, hi: Q): { n: number; k: number } => {
  for (let k = 1; k <= 6; k++) {
    const n = Math.round(((val(lo) + val(hi)) / 2) * 10 ** k)
    const c: Q = { n, d: 10 ** k, tex: '' }
    if (cmp(lo, c) < 0 && cmp(c, hi) < 0) return { n, k }
  }
  throw new Error('no decimal between')
}
const decStr = (n: number, k: number) => (n / 10 ** k).toFixed(k).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '')
const sortQ = (xs: Q[]) => [...xs].sort((a, b) => cmp(a, b))
const listTex = (xs: Q[]) => xs.map((x) => x.tex).join(',\\ ')
const distinct = (a: Q[]) => new Set(a.map((x) => `${x.n / gcd(x.n, x.d)}/${x.d / gcd(x.n, x.d)}`)).size === a.length

// ================= exercise 2: click the point on the number line =================
interface E2 {
  x: Q
  den: number // the ticks are 1 / den apart
}
const LW = 440
const lx = (v: number, lo: number, hi: number) => 20 + ((v - lo) / (hi - lo)) * (LW - 40)
function numberLineSvg(lo: number, hi: number, den: number, pts: { v: number; letter: string }[]): string {
  const ticks = range(0, (hi - lo) * den).map((i) => {
    const v = lo + i / den
    const whole = i % den === 0
    return `<line x1="${lx(v, lo, hi)}" y1="${whole ? 34 : 38}" x2="${lx(v, lo, hi)}" y2="${whole ? 56 : 52}" stroke="#475569" stroke-width="${whole ? 2 : 1.2}"/>${whole ? `<text x="${lx(v, lo, hi)}" y="74" text-anchor="middle" font-size="14" fill="#334155">${v}</text>` : ''}`
  }).join('')
  const dots = pts.map((p, i) => {
    const x = lx(p.v, lo, hi)
    return `<g data-choice="${i}" style="cursor:pointer"><rect x="${x - 14}" y="12" width="28" height="48" fill="#fff" fill-opacity="0.01"/><circle cx="${x}" cy="45" r="6.5" fill="#f97316" stroke="#fff" stroke-width="1.5"/><text x="${x}" y="26" text-anchor="middle" font-size="15" font-weight="bold" fill="#0f172a">${p.letter}</text></g>`
  }).join('')
  return `<svg viewBox="0 0 ${LW} 86" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:520px;height:auto;margin:0 auto;display:block"><line x1="8" y1="45" x2="${LW - 8}" y2="45" stroke="#475569" stroke-width="2"/>${ticks}${dots}</svg>`
}
function mk2(e: E2, key: string): It {
  const v = val(e.x)
  const w0 = Math.floor(v + 1e-9)
  const lo = w0 - 1
  const hi = w0 + 2
  const k = Math.round((v - w0) * e.den)
  const step = 1 / e.den
  const cand = uniq([v + step, v - step, v + 1, v - 1, v + 2 * step, v - 2 * step].filter((t) => t >= lo + 0.2 && t <= hi - 0.2), (t) => t.toFixed(5))
  const four = [v, ...shuffled(cand, e.x.n * 31 + e.x.d * 7 + 3).slice(0, 3)].sort((a, b) => a - b)
  const letters = ['A', 'B', 'C', 'D'].slice(0, four.length)
  const ans = letters[four.findIndex((t) => Math.abs(t - v) < 1e-9)]
  const fig = numberLineSvg(lo, hi, e.den, four.map((t, i) => ({ v: t, letter: letters[i] })))
  const w: Wp = {
    tex: `${text('Click the point for ')}${e.x.tex}${text('.')}`,
    short: e.x.tex,
    key,
    answer: ans,
    wrong: letters.filter((l) => l !== ans),
    steps: [
      { label: 'Between which whole numbers?', toks: [{ id: 'n1a', tex: '\\text{between}' }, { id: 'n1b', tex: `${w0}\\ \\text{and}\\ ${w0 + 1}` }], blanks: [blk('n1b', 's0', `$${e.x.tex} = ${dec(e.x)}$`, [`${w0 - 1}\\ \\text{and}\\ ${w0}`, `${w0 + 1}\\ \\text{and}\\ ${w0 + 2}`, `${-w0 - 1}\\ \\text{and}\\ ${-w0}`], 'Write the number as a mixed number or a decimal: the whole part tells where it starts.')] },
      { label: 'How many small steps?', toks: [{ id: 'n2a', tex: `\\text{steps of } \\frac{1}{${e.den}}` }, { id: 'n2b', tex: n4(k) }], blanks: [blk('n2b', 'n1b', `$${dec(e.x)} = ${w0} + \\dfrac{\\square}{${e.den}}$`, [n4(e.den - k), n4(k + 1), n4(k - 1), n4(e.den)].filter((s) => s !== n4(k)), `Every small step on the line is 1 / ${e.den}. Count them from ${w0} to the right.`)] },
      { label: 'The letter.', toks: [{ id: 'n3a', tex: '\\text{the point is}' }, { id: 'n3b', tex: ans }], blanks: [blk('n3b', 'n2b', `$\\text{Which letter is } ${k}\\text{ steps to the right of } ${w0}\\text{?}$`, letters.filter((l) => l !== ans), 'Count the small steps from the whole number.')] },
    ],
  }
  return { w, fig, fixed: letters, showTex: true }
}
const pool2 = (kind: 'imp' | 'dec' | 'pdec' | 'nfr' | 'nmix'): E2[] => {
  const r = rng(kind.length * 977 + kind.charCodeAt(0))
  const out: E2[] = []
  const pick = (a: number, b: number) => a + Math.floor(r() * (b - a + 1))
  for (let t = 0; t < 600 && out.length < 12; t++) {
    let e: E2
    if (kind === 'imp') {
      const q = pick(3, 8)
      const n = pick(q + 1, 4 * q)
      if (gcd(n, q) !== 1) continue
      e = { x: fr(n, q), den: q }
    } else if (kind === 'dec' || kind === 'pdec') {
      e = { x: dc(`${kind === 'dec' ? '-' : ''}${pick(1, 4)}.${pick(1, 9)}`), den: 10 }
    } else if (kind === 'nfr') {
      const q = pick(3, 8)
      const n = pick(1, q - 1)
      if (gcd(n, q) !== 1) continue
      e = { x: fr(-n, q), den: q }
    } else {
      const q = pick(3, 8)
      const p = pick(1, q - 1)
      if (gcd(p, q) !== 1) continue
      e = { x: mixed(true, pick(1, 4), p, q), den: q }
    }
    if (!out.some((o) => o.x.tex === e.x.tex)) out.push(e)
  }
  return out
}
const E2_ROWS: [string, E2, E2[]][] = [
  ['a', { x: fr(13, 5), den: 5 }, pool2('imp')],
  ['b', { x: dc('-3.6'), den: 10 }, pool2('dec')],
  ['c', { x: dc('2.5'), den: 10 }, pool2('pdec')],
  ['d', { x: fr(-2, 3), den: 3 }, pool2('nfr')],
  ['e', { x: mixed(true, 4, 5, 6), den: 6 }, pool2('nmix')],
]
const e2id = (e: E2) => e.x.tex

// ================= exercise 4: the common denominator of two fractions =================
interface E4 {
  p1: number
  q1: number
  p2: number
  q2: number
}
const fracTex = (p: number, q: number) => (p > q ? `${Math.floor(p / q)}\\frac{${p % q}}{${q}}` : `\\frac{${p}}{${q}}`)
// the greatest common factor is asked first; after a wrong answer it is found by the division ladder: divide both denominators by the smallest prime they share
// until they share none, the greatest common factor is the product of the primes
const smallestPrime = (n: number) => { for (let p = 2; p <= n; p++) if (n % p === 0) return p; return n }
function lcmSteps(q1: number, q2: number, wrong: string[], from0 = 's0'): WpStep[] {
  const ladder: WpStep[] = []
  const fs: number[] = []
  let a = q1
  let b = q2
  let from = from0
  while (gcd(a, b) > 1) {
    const f = smallestPrime(gcd(a, b))
    const k = fs.length + 1
    const others = uniq([2, 3, 5, 7, 4, 6, 9, 10].filter((p) => p !== f && !(a % p === 0 && b % p === 0 && p === smallestPrime(p))).map(String), (s) => s)
    ladder.push({ label: 'Divide by a common prime.', toks: [{ id: `v${k}b`, tex: String(f) }, { id: `v${k}a`, tex: `\\Big|\\ \\underline{\\ ${a}\\quad ${b}\\ }` }], blanks: [blk(`v${k}b`, from, `$\\text{The smallest prime number that divides both } ${a}\\text{ and } ${b}$`, others, 'Divide both numbers by a prime number again and again, until they have no common factor.')] })
    fs.push(f)
    a /= f
    b /= f
    from = `v${k}b`
  }
  const L = lcm(q1, q2)
  const prod = [...fs, a, b].join('\\cdot ')
  if (fs.length) ladder.push({ label: 'The least common multiple.', toks: [{ id: 'c1a', tex: `\\Big|\\ ${a}\\quad ${b}` }, { id: 'c1g', tex: `\\text{LCM} = ${prod} =` }, { id: 'c1b', tex: String(L) }], blanks: [blk('c1b', from, `$${prod} = \\square$`, wrong, 'Multiply the primes you divided by and the two numbers left at the bottom.')] })
  return [
    { label: 'The least common multiple.', toks: [{ id: 'c1a', tex: `\\text{LCM}(${q1},\\ ${q2})` }, { id: 'c1g', tex: '=' }, { id: 'c1b', tex: String(L) }], blanks: [blk('c1b', from0, `$\\text{The smallest number that both } ${q1}\\text{ and } ${q2}\\text{ divide into}$`, wrong, 'Look at the denominators only.')], split: fs.length ? ladder : undefined, noArrow: true },
  ]
}
function mk4(e: E4, key: string): It {
  const L = lcm(e.q1, e.q2)
  const pair = `${fracTex(e.p1, e.q1)},\\ ${fracTex(e.p2, e.q2)}`
  const ans = String(L)
  const wrong = uniq([e.q1 * e.q2, e.q1 + e.q2, Math.max(e.q1, e.q2), L * 2, L / 2].filter((v) => v !== L && Number.isInteger(v)).map(String), (s) => s)
  const w: Wp = {
    tex: `${text('Determine the common denominator for the pair of fractions: ')}${pair}`,
    short: pair,
    key,
    answer: ans,
    wrong,
    steps: lcmSteps(e.q1, e.q2, wrong),
  }
  return { w }
}
const nums4 = (q: number) => range(1, q + Math.floor(q / 2)).filter((p) => gcd(p, q) === 1 && p !== q)
const P4 = (qs: [number, number][], _ps?: number[]): E4[] =>
  qs.flatMap(([q1, q2], i) => range(0, 2).map((j): E4 => ({ p1: nums4(q1)[(i * 3 + j * 2) % nums4(q1).length], q1, p2: nums4(q2)[(i * 5 + j * 3 + 1) % nums4(q2).length], q2 })))
const E4_ROWS: [string, E4, E4[]][] = [
  ['a', { p1: 2, q1: 3, p2: 7, q2: 12 }, P4([[3, 12], [4, 8], [5, 10], [6, 12], [2, 8], [3, 9], [4, 12], [5, 15]], [1, 2, 3, 4, 5, 7])],
  ['b', { p1: 7, q1: 6, p2: 7, q2: 4 }, P4([[6, 4], [4, 6], [6, 9], [8, 12], [10, 15], [9, 6], [12, 8]], [1, 5, 7, 11])],
  ['c', { p1: 3, q1: 8, p2: 5, q2: 12 }, P4([[8, 12], [10, 15], [6, 8], [12, 18], [9, 12], [8, 20], [6, 10]], [1, 3, 5, 7, 11])],
  ['d', { p1: 8, q1: 15, p2: 11, q2: 20 }, P4([[15, 20], [12, 18], [14, 21], [10, 25], [16, 24], [18, 24], [20, 30]], [1, 3, 7, 11, 13])],
  ['e', { p1: 5, q1: 14, p2: 7, q2: 21 }, P4([[14, 21], [15, 25], [12, 18], [10, 14], [22, 33], [16, 20], [18, 27]], [1, 3, 5, 11, 13])],
  ['f', { p1: 5, q1: 21, p2: 3, q2: 49 }, P4([[21, 49], [14, 35], [15, 35], [22, 55], [26, 39], [27, 45], [24, 40]], [1, 2, 4, 5, 11])],
  ['g', { p1: 4, q1: 9, p2: 5, q2: 16 }, P4([[9, 16], [8, 15], [7, 12], [9, 10], [11, 8], [5, 18], [7, 20]], [1, 2, 3, 4, 5, 7])],
  ['h', { p1: 7, q1: 24, p2: 5, q2: 36 }, P4([[24, 36], [18, 30], [20, 45], [28, 42], [30, 45], [32, 48], [36, 60]], [1, 5, 7, 11, 13])],
  ['i', { p1: 7, q1: 180, p2: 11, q2: 150 }, P4([[180, 150], [120, 90], [140, 100], [90, 75], [84, 120], [72, 108], [160, 120]], [1, 7, 11, 13])],
  ['j', { p1: 5, q1: 84, p2: 7, q2: 54 }, P4([[84, 54], [90, 126], [66, 84], [78, 104], [105, 90], [48, 72], [60, 84]], [1, 5, 7, 11, 13])],
]
const e4id = (e: E4) => JSON.stringify(e)

// ================= exercise 5: order from least to greatest =================
interface E5 {
  xs: Q[]
}
function mk5(e: E5, key: string): It {
  const decs = e.xs.map(dec)
  const sorted = sortQ(e.xs)
  const ans = listTex(sorted)
  const flip = (i: number) => e.xs.map((x, j) => (j === i ? dec({ ...x, n: -x.n }) : dec(x))).join(',\\ ')
  const wrongDec = uniq([flip(0), flip(e.xs.length - 1), e.xs.map((x, j) => (j === 1 ? dec({ ...x, n: x.n + x.d }) : dec(x))).join(',\\ ')], (s) => s).filter((s) => s !== decs.join(',\\ '))
  const byAbs = listTex([...e.xs].sort((a, b) => Math.abs(val(a)) - Math.abs(val(b)) || cmp(a, b)))
  const swapped = sorted.map((x, i, a) => (i === 1 ? a[2] : i === 2 ? a[1] : x))
  const wrong = uniq([listTex([...sorted].reverse()), byAbs, listTex(swapped), listTex(e.xs)], (s) => s).filter((s) => s !== ans)
  const w: Wp = {
    tex: `${text('List in order from least to greatest: ')}${listTex(e.xs)}`,
    short: listTex(e.xs),
    key,
    answer: ans,
    wrong,
    steps: [
      { label: 'As decimals.', toks: [{ id: 'o1a', tex: '\\text{decimals}' }, { id: 'o1b', tex: decs.join(',\\ ') }], blanks: [blk('o1b', 's0', `$${listTex(e.xs)} = \\square$`, wrongDec, 'Divide the numerator by the denominator; a mixed number keeps its whole part.')] },
      { label: 'From least to greatest.', toks: [{ id: 'o2a', tex: '\\text{in order}' }, { id: 'o2b', tex: ans }], blanks: [blk('o2b', 'o1b', '$\\text{Negative numbers are the smallest. Of two negative numbers, the one with the bigger number is smaller.}$', wrong, 'Compare the decimals, then write the original numbers in that order.')] },
    ],
  }
  return { w }
}
const gen5 = (kind: 'a' | 'b' | 'c' | 'd', seed: number): E5[] => {
  const r = rng(seed)
  const pick = (a: number, b: number) => a + Math.floor(r() * (b - a + 1))
  const neg = () => r() < 0.5
  const out: E5[] = []
  for (let t = 0; t < 800 && out.length < 12; t++) {
    let xs: Q[]
    if (kind === 'a') {
      const f = () => { const d = pick(3, 9); return fr((neg() ? -1 : 1) * pick(1, d - 1), d) }
      xs = [f(), f(), f(), f(), dc(`${neg() ? '-' : ''}0.${pick(1, 9)}`)]
    } else if (kind === 'b') {
      const d1 = () => dc(`${neg() ? '-' : ''}${pick(1, 5)}.${pick(1, 9)}`)
      const d = pick(2, 5)
      xs = [d1(), d1(), d1(), d1(), fr((neg() ? -1 : 1) * pick(2 * d, 6 * d), d)]
    } else if (kind === 'c') {
      const m = () => mixed(neg(), pick(1, 4), 1, pick(3, 7))
      xs = [m(), m(), m(), dc(`${neg() ? '-' : ''}0.${pick(1, 9)}`), rp(neg(), pick(0, 3), '', String(pick(1, 9)))]
    } else {
      const a = pick(1, 9)
      const s = t % 2 === 0
      xs = shuffled([dc(`${s ? '-' : ''}0.${a}`), rp(s, 0, '', String(a)), rp(s, 0, '', `${a}0`), rp(s, 0, '', `${a}00`), rp(s, 0, '', `${a}0${a}`)], seed + t)
    }
    if (!distinct(xs) || out.some((o) => listTex(o.xs) === listTex(xs))) continue
    out.push({ xs })
  }
  return out
}
const E5_ROWS: [string, E5, E5[]][] = [
  ['a', { xs: [fr(-1, 3), fr(7, 8), fr(-3, 4), fr(5, 6), dc('-0.6')] }, gen5('a', 51)],
  ['b', { xs: [dc('5.2'), dc('-4.8'), fr(21, 5), dc('-3.9'), dc('2.1')] }, gen5('b', 52)],
  ['c', { xs: [mixed(true, 3, 1, 7), mixed(false, 4, 1, 6), rp(true, 2, '', '4'), dc('0.8'), mixed(true, 4, 1, 3)] }, gen5('c', 53)],
  ['d', { xs: [dc('-0.4'), rp(true, 0, '', '4'), rp(true, 0, '', '40'), rp(true, 0, '', '400'), rp(true, 0, '', '404')] }, gen5('d', 54)],
]
const e5id = (e: E5) => listTex(e.xs)

// ================= exercise 6: compare with < or > =================
interface E6 {
  x: Q
  y: Q
}
function mk6(e: E6, key: string): It {
  const ans = cmp(e.x, e.y) < 0 ? '<' : '>'
  const other = ans === '<' ? '>' : '<'
  const w: Wp = {
    tex: `${text('Use either < or > to write a true statement: ')}${e.x.tex}\\ \\square\\ ${e.y.tex}`,
    short: `${e.x.tex},\\ ${e.y.tex}`,
    key,
    answer: ans,
    wrong: [other],
    steps: [
      { label: 'As decimals.', toks: [{ id: 'k1a', tex: '\\text{decimals}' }, { id: 'k1b', tex: `${dec(e.x)},\\ ${dec(e.y)}` }], blanks: [blk('k1b', 's0', `$${e.x.tex},\\ ${e.y.tex} = \\square$`, [`${dec(e.y)},\\ ${dec(e.x)}`, `${dec({ ...e.x, n: -e.x.n })},\\ ${dec(e.y)}`, `${dec(e.x)},\\ ${dec({ ...e.y, n: -e.y.n })}`], 'Write both numbers as decimals (a repeating decimal keeps its bar).')] },
      { label: 'Compare.', toks: [{ id: 'k2a', tex: dec(e.x) }, { id: 'k2b', tex: ans }, { id: 'k2c', tex: dec(e.y) }], blanks: [blk('k2b', 'k1b', `$${dec(e.x)}\\ \\square\\ ${dec(e.y)}$`, [other], 'Compare digit by digit from the left. Of two negative numbers the one with the bigger digits is smaller.')] },
    ],
  }
  return { w, plain: ['<', '>'] }
}
type K6 = 'rep1' | 'frac' | 'dec2' | 'mixed' | 'rep2' | 'rep3'
const gen6 = (kind: K6, s: boolean): E6[] => {
  const out: E6[] = []
  const sg = s ? '-' : ''
  if (kind === 'rep1') for (const d of range(1, 9)) out.push({ x: rp(s, 0, '', String(d)), y: dc(`${sg}0.${d}`) })
  if (kind === 'dec2') for (const w of [3, 4, 5, 7]) for (const [b, c] of [[2, 1], [3, 4], [5, 6], [1, 7], [8, 3]]) out.push({ x: dc(`${sg}${w}.${b}${c}`), y: dc(`${sg}${w}.${b}`) })
  if (kind === 'frac') for (const [p1, q1, p2, q2] of [[5, 8, 4, 7], [3, 5, 5, 8], [2, 3, 3, 5], [4, 9, 3, 7], [5, 6, 7, 9], [7, 12, 5, 9], [3, 4, 5, 7], [2, 7, 3, 11], [7, 10, 5, 8], [4, 5, 7, 9]]) out.push({ x: fr(s ? -p1 : p1, q1), y: fr(s ? -p2 : p2, q2) })
  if (kind === 'mixed') for (const [w, p1, q1, p2, q2] of [[3, 5, 6, 5, 7], [2, 3, 4, 3, 5], [4, 2, 3, 3, 5], [1, 5, 8, 4, 7], [5, 1, 2, 2, 5], [6, 3, 4, 5, 7], [2, 4, 5, 3, 4], [3, 2, 7, 1, 4], [4, 7, 8, 5, 6], [7, 1, 3, 2, 7]]) out.push({ x: mixed(s, w, p1, q1), y: mixed(s, w, p2, q2) })
  if (kind === 'rep2') for (const w of [3, 4, 2, 6]) for (const [b, c] of [[5, 2], [3, 4], [6, 1], [7, 8], [2, 9]]) out.push({ x: rp(s, w, String(b), String(c)), y: rp(s, w, '', `${b}${c}`) })
  if (kind === 'rep3') for (const w of [1, 2, 3, 4]) for (const b of [5, 3, 7, 2, 6]) out.push({ x: dc(`${sg}${w}.${b}${b}`), y: rp(s, w, '', `${b}${b}`) })
  return out.filter((e) => cmp(e.x, e.y) !== 0)
}
const E6_ROWS: [string, E6, E6[]][] = [
  ['a', { x: rp(false, 0, '', '6'), y: dc('0.6') }, gen6('rep1', false)],
  ['b', { x: rp(true, 0, '', '6'), y: dc('-0.6') }, gen6('rep1', true)],
  ['c', { x: fr(5, 8), y: fr(4, 7) }, gen6('frac', false)],
  ['d', { x: fr(-5, 8), y: fr(-4, 7) }, gen6('frac', true)],
  ['e', { x: dc('4.21'), y: dc('4.2') }, gen6('dec2', false)],
  ['f', { x: dc('-4.21'), y: dc('-4.2') }, gen6('dec2', true)],
  ['g', { x: mixed(false, 3, 5, 6), y: mixed(false, 3, 5, 7) }, gen6('mixed', false)],
  ['h', { x: mixed(true, 3, 5, 6), y: mixed(true, 3, 5, 7) }, gen6('mixed', true)],
  ['i', { x: rp(false, 3, '5', '2'), y: rp(false, 3, '', '52') }, gen6('rep2', false)],
  ['j', { x: rp(true, 3, '5', '2'), y: rp(true, 3, '', '52') }, gen6('rep2', true)],
  ['k', { x: dc('1.55'), y: rp(false, 1, '', '55') }, gen6('rep3', false)],
  ['l', { x: dc('-1.55'), y: rp(true, 1, '', '55') }, gen6('rep3', true)],
]
const e6id = (e: E6) => `${e.x.tex}|${e.y.tex}`

// ================= exercises 7 and 8: a number between two numbers =================
interface E78 {
  a: Q
  b: Q
}
// two fractions (or two decimals, written as fractions first): same denominator, a numerator in between
function fracBetween(e: E78, key: string, isDec: boolean): It {
  const pair = `${e.a.tex},\\ ${e.b.tex}`
  const L = lcm(e.a.d, e.b.d)
  const na = e.a.n * (L / e.a.d)
  const nb = e.b.n * (L / e.b.d)
  const frT = (n: number, d: number) => `${n < 0 ? '-' : ''}\\frac{${Math.abs(n)}}{${d}}`
  const hlDen = (q: Q) => q.tex.replace(/\\frac\{(\d+)\}\{(\d+)\}/, (_m, a, b) => `\\frac{${a}}{\\colorbox{#fde68a}{$\\scriptstyle ${b}$}}`)
  // decimals that stop: both are written at once over 10^k (the number of their decimal places), no LCM needed
  const direct = isDec && [e.a.d, e.b.d].every((d) => /^10*$/.test(String(d)))
  const shown = (q: Q) => (isDec && !direct ? frT(q.n, q.d) : q.tex) // how a number of the pair is written on the line of fractions
  const [f1, f2] = isDec && !direct ? ['p1', 'p2'] : ['s1', 's2']
  const asFracWrong = (q: Q) => uniq([frT(q.n, q.d + 1), frT(-q.n, q.d), frT(q.n + 1, q.d), frT(q.d, q.n)], (s) => s).filter((s) => s !== shown(q))
  const hintDec = 'Write the decimal as a fraction. For a repeating decimal, multiply by 10 to the power of the number of repeating digits.'
  const wrongOf = (n0: number, n: number) => uniq([frT(n0, L), frT(-n, L), frT(n + 1, L), frT(n - 1, L)], (s) => s).filter((s) => s !== frT(n, L))
  const hint7 = direct ? `Both decimals have at most ${String(L).length - 1} decimal places: write the digits over ${L}.` : `Multiply the numerator and the denominator by the same number to get the denominator ${L}.`
  const lcdWrong = uniq([e.a.d * e.b.d, e.a.d + e.b.d, Math.max(e.a.d, e.b.d), L * 2, L / 2].filter((v) => v !== L && Number.isInteger(v)).map(String), (s) => s)
  // consecutive numerators: multiply the top and the bottom by 2 first, so a numerator fits between them
  const twice = Math.abs(na - nb) < 2
  const D = twice ? 2 * L : L
  const [ma, mb] = twice ? [2 * na, 2 * nb] : [na, nb]
  const [minN, maxN] = ma < mb ? [ma, mb] : [mb, ma]
  const mid = minN + Math.floor((maxN - minN) / 2)
  const ans = frT(mid, D)
  const wrong = uniq([frT(minN - 1, D), frT(maxN + 1, D), frT(minN, D), frT(maxN, D), frT(minN - 2, D)], (s) => s).filter((s) => s !== ans)
  const dbl = (n: number) => uniq([frT(n, D), frT(-2 * n, D), frT(2 * n + 2, D), frT(2 * n - 2, D)], (s) => s).filter((s) => s !== frT(2 * n, D))
  const hint2 = 'The numerators are next to each other: multiply the numerator and the denominator by 2.'
  const w: Wp = {
    tex: `${text(isDec ? 'Determine a fractional number between the decimals: ' : 'Determine a fractional number between the fractions: ')}${pair}`,
    short: pair,
    // the denominators are highlighted: they are what the LCM is taken of
    startToks: [{ id: 's1', tex: e.a.tex, hl: isDec ? undefined : hlDen(e.a) }, { id: 's0', tex: ',' }, { id: 's2', tex: e.b.tex, hl: isDec ? undefined : hlDen(e.b) }],
    key,
    answer: ans,
    wrong,
    steps: [
      ...(isDec && !direct ? [{ label: 'As fractions.', toks: [{ id: 'p1', tex: shown(e.a) }, { id: 'pc', tex: ',' }, { id: 'p2', tex: shown(e.b) }], blanks: [blk('p1', 's1', `$${e.a.tex} = \\square$`, asFracWrong(e.a), hintDec), blk('p2', 's2', `$${e.b.tex} = \\square$`, asFracWrong(e.b), hintDec)] }] : []),
      ...(direct ? [] : lcmSteps(e.a.d, e.b.d, lcdWrong, f2).map((s) => ({ ...s, indent: -225 }))), // the LCM line sits left of the arrows that come down from the fractions
      { label: 'The same denominator.', toks: [{ id: 'b1a', tex: frT(na, L) }, { id: 'b1c', tex: ',' }, { id: 'b1b', tex: frT(nb, L) }], blanks: [blk('b1a', f1, `$${shown(e.a)} = \\square$`, wrongOf(e.a.n, na), hint7), blk('b1b', f2, `$${shown(e.b)} = \\square$`, wrongOf(e.b.n, nb), hint7)] },
      ...(twice ? [{ label: 'The numerators are next to each other: multiply the top and the bottom by 2.', toks: [{ id: 'b2m', tex: '\\frac{\\times 2}{\\times 2}' }, { id: 'b2a', tex: frT(2 * na, D) }, { id: 'b2c', tex: ',' }, { id: 'b2b', tex: frT(2 * nb, D) }], blanks: [blk('b2a', 'b1a', `$${frT(na, L)} \\times \\frac{2}{2} = \\square$`, dbl(na), hint2), blk('b2b', 'b1b', `$${frT(nb, L)} \\times \\frac{2}{2} = \\square$`, dbl(nb), hint2)] }] : []),
      { label: 'A fraction between them.', toks: [{ id: 'b4a', tex: '\\text{between}' }, { id: 'b4b', tex: ans }], blanks: [blk('b4b', twice ? 'b2b' : 'b1b', `$${frT(minN, D)} < \\square < ${frT(maxN, D)}$`, wrong, 'Keep the denominator and choose a numerator that is between the two numerators.')] },
    ],
  }
  return { w }
}
const mk7 = (e: E78, key: string): It => fracBetween(e, key, false)
const mk8 = (e: E78, key: string): It => fracBetween(e, key, true)
const gen7 = (qs: [number, number, number, number][], neg: boolean): E78[] => qs.map(([p1, q1, p2, q2]) => ({ a: fr(neg ? -p1 : p1, q1), b: fr(neg ? -p2 : p2, q2) }))
const mx7 = (w: number, neg: boolean, qs: [number, number, number, number][]): E78[] => qs.map(([p1, q1, p2, q2]): E78 => ({ a: mixed(neg, w, p1, q1), b: mixed(neg, w, p2, q2) }))
const E7_ROWS: [string, E78, E78[]][] = [
  ['a', { a: fr(-4, 5), b: fr(-5, 6) }, gen7([[4, 5, 5, 6], [3, 4, 4, 5], [5, 7, 6, 8], [2, 3, 5, 7], [7, 9, 3, 4], [5, 8, 7, 11], [3, 5, 7, 11], [8, 9, 7, 8]], true)],
  ['b', { a: fr(21, 5), b: mixed(false, 4, 2, 5) }, mx7(2, false, [[3, 7, 1, 2], [4, 5, 1, 4], [3, 8, 2, 5], [5, 9, 6, 11], [1, 6, 2, 9], [3, 10, 1, 3], [4, 9, 3, 7], [5, 12, 3, 7]])],
  ['c', { a: mixed(true, 2, 1, 3), b: mixed(true, 2, 1, 4) }, mx7(3, true, [[1, 3, 1, 4], [2, 5, 1, 3], [3, 7, 2, 5], [1, 6, 1, 7], [2, 7, 3, 10], [5, 8, 4, 7]])],
  ['d', { a: mixed(false, 4, 1, 4), b: mixed(false, 4, 1, 3) }, mx7(5, false, [[1, 4, 1, 3], [1, 5, 1, 4], [2, 7, 1, 3], [1, 6, 1, 5], [3, 8, 2, 5], [1, 7, 1, 6]])],
  ['e', { a: mixed(true, 6, 3, 8), b: mixed(true, 6, 4, 9) }, mx7(5, true, [[3, 8, 4, 9], [2, 5, 3, 7], [4, 7, 5, 8], [1, 3, 3, 8], [5, 6, 6, 7], [2, 9, 3, 10]])],
  ['f', { a: fr(12, 13), b: fr(13, 14) }, gen7([[12, 13, 13, 14], [7, 8, 8, 9], [9, 10, 10, 11], [4, 5, 5, 6], [6, 7, 7, 8], [10, 11, 11, 12]], false)],
  ['g', { a: fr(-7, 9), b: fr(-7, 8) }, gen7([[7, 9, 7, 8], [5, 7, 5, 6], [3, 5, 3, 4], [4, 9, 4, 7], [5, 8, 5, 7], [2, 3, 2, 5]], true)],
  ['h', { a: fr(23, 24), b: fr(24, 25) }, gen7([[23, 24, 24, 25], [15, 16, 16, 17], [19, 20, 20, 21], [11, 12, 12, 13], [29, 30, 30, 31], [8, 9, 9, 10]], false)],
  ['i', { a: fr(13, 12), b: fr(12, 11) }, gen7([[13, 12, 12, 11], [11, 10, 10, 9], [9, 8, 8, 7], [16, 15, 15, 14], [8, 7, 7, 6], [14, 13, 13, 12]], false)],
  ['j', { a: fr(11, 7), b: fr(3, 2) }, gen7([[11, 7, 3, 2], [9, 7, 4, 3], [13, 8, 5, 3], [8, 5, 7, 4], [11, 6, 9, 5], [10, 7, 7, 5]], false)],
]
const e78id = (e: E78) => `${e.a.tex}|${e.b.tex}`
const gen8 = (xs: [string, string][]): E78[] => xs.map(([a, b]) => ({ a: parseDec(a), b: parseDec(b) }))
const E8_ROWS: [string, E78, E78[]][] = [
  ['a', { a: dc('3.5'), b: dc('3.6') }, gen8([['2.5', '2.6'], ['4.1', '4.2'], ['6.7', '6.8'], ['1.2', '1.3'], ['8.4', '8.5'], ['5.9', '6.0']])],
  ['b', { a: dc('-2.5'), b: dc('-2.55') }, gen8([['-3.5', '-3.55'], ['-1.2', '-1.25'], ['-4.7', '-4.75'], ['-6.1', '-6.15'], ['-2.3', '-2.35'], ['-5.8', '-5.85']])],
  ['c', { a: dc('5.3'), b: dc('5.4') }, gen8([['7.3', '7.4'], ['2.8', '2.9'], ['9.1', '9.2'], ['3.6', '3.7'], ['4.4', '4.5'], ['6.2', '6.3']])],
  ['d', { a: dc('-1.7'), b: parseDec('-1.\\overline{7}') }, gen8([['-2.3', '-2.\\overline{3}'], ['-3.4', '-3.\\overline{4}'], ['-4.5', '-4.\\overline{5}'], ['-1.2', '-1.\\overline{2}'], ['-5.6', '-5.\\overline{6}'], ['-2.8', '-2.\\overline{8}']])],
  ['e', { a: dc('4.23'), b: parseDec('4.\\overline{23}') }, gen8([['3.12', '3.\\overline{12}'], ['5.34', '5.\\overline{34}'], ['2.45', '2.\\overline{45}'], ['6.78', '6.\\overline{78}'], ['1.56', '1.\\overline{56}'], ['7.21', '7.\\overline{21}']])],
  ['f', { a: dc('5.2'), b: parseDec('5.\\overline{2}') }, gen8([['4.3', '4.\\overline{3}'], ['6.5', '6.\\overline{5}'], ['2.7', '2.\\overline{7}'], ['3.1', '3.\\overline{1}'], ['7.4', '7.\\overline{4}'], ['1.6', '1.\\overline{6}']])],
  ['g', { a: dc('1.71'), b: parseDec('1.\\overline{71}') }, gen8([['2.34', '2.\\overline{34}'], ['3.45', '3.\\overline{45}'], ['4.56', '4.\\overline{56}'], ['5.67', '5.\\overline{67}'], ['6.89', '6.\\overline{89}'], ['1.23', '1.\\overline{23}']])],
  ['i', { a: dc('5.123'), b: dc('5.1234') }, gen8([['4.213', '4.2134'], ['3.451', '3.4512'], ['6.782', '6.7823'], ['2.345', '2.3456'], ['7.891', '7.8912'], ['1.567', '1.5678']])],
  ['j', { a: parseDec('-2.00\\overline{1}'), b: dc('-2.001') }, gen8([['-3.00\\overline{2}', '-3.002'], ['-1.00\\overline{3}', '-1.003'], ['-4.00\\overline{5}', '-4.005'], ['-5.00\\overline{4}', '-5.004'], ['-6.00\\overline{7}', '-6.007'], ['-2.00\\overline{8}', '-2.008']])],
]

export const EX_RATIONAL31 = [
  build(2, 'Click the point.', E2_ROWS, mk2, e2id, 'Graph rational numbers', 3200, '3.1'),
  build(4, 'Choose the common denominator.', E4_ROWS, mk4, e4id, 'Common denominator', 3400, '3.1'),
  build(5, 'Order the numbers.', E5_ROWS, mk5, e5id, 'Order from least to greatest', 3500, '3.1'),
  build(6, 'Choose < or >.', E6_ROWS, mk6, e6id, 'Compare', 3600, '3.1'),
  build(7, 'Choose the fraction between.', E7_ROWS, mk7, e78id, 'A fraction between', 3700, '3.1'),
  build(8, 'Choose the fraction between.', E8_ROWS, mk8, e78id, 'A fraction between', 3800, '3.1'),
]

// ================= challenge exercises (3.1 exercises 5 and 6, harder): 7 numbers to order, pairs that are very close; optional extra practice, own progress (no 15, 16) =================
const gen5h = (kind: 'a' | 'b' | 'c' | 'd', seed: number): E5[] => {
  const r = rng(seed)
  const pick = (a: number, b: number) => a + Math.floor(r() * (b - a + 1))
  const sg = () => (r() < 0.5 ? '-' : '')
  const out: E5[] = []
  for (let t = 0; t < 1500 && out.length < 12; t++) {
    let xs: Q[]
    if (kind === 'a') {
      const f = () => { const d = pick(3, 12); return fr((r() < 0.5 ? -1 : 1) * pick(1, d - 1), d) }
      xs = [f(), f(), f(), f(), f(), dc(`${sg()}0.${pick(1, 9)}${pick(1, 9)}`), dc(`${sg()}0.${pick(1, 9)}`)]
    } else if (kind === 'b') {
      const f = () => { const d = [4, 5, 8, 20, 25][pick(0, 4)]; return fr((r() < 0.5 ? -1 : 1) * pick(d, 3 * d), d) }
      xs = [dc(`${sg()}${pick(1, 3)}.${pick(1, 9)}${pick(1, 9)}`), dc(`${sg()}${pick(1, 3)}.${pick(1, 9)}${pick(1, 9)}`), dc(`${sg()}${pick(1, 3)}.${pick(1, 9)}`), dc(`${sg()}${pick(1, 3)}.${pick(1, 9)}`), f(), f(), f()]
    } else if (kind === 'c') {
      const m = () => mixed(r() < 0.5, pick(1, 3), 1, pick(3, 7))
      xs = [m(), m(), m(), dc(`${sg()}${pick(1, 3)}.${pick(1, 9)}`), dc(`${sg()}${pick(1, 3)}.${pick(1, 9)}${pick(1, 9)}`), rp(r() < 0.5, pick(0, 3), '', String(pick(1, 9))), rp(r() < 0.5, pick(0, 3), '', String(pick(1, 9)))]
    } else {
      const s = r() < 0.5
      const a = pick(1, 9)
      const b = pick(1, 9)
      xs = shuffled([dc(`${s ? '-' : ''}0.${a}`), rp(s, 0, '', String(a)), rp(s, 0, '', `${a}${b}`), rp(s, 0, '', `${a}${b}${a}`), dc(`${s ? '-' : ''}0.${a}${b}`), rp(s, 0, String(a), String(b)), rp(s, 0, '', `${a}0`)], seed + t)
    }
    if (!distinct(xs) || out.some((o) => listTex(o.xs) === listTex(xs))) continue
    out.push({ xs })
  }
  return out
}
const H5_ROWS: [string, E5, E5[]][] = ['a', 'b', 'c', 'd'].map((k, i) => {
  const l = gen5h(k as 'a' | 'b' | 'c' | 'd', 1500 + i)
  return [k, l[0], l.slice(1)]
})
// two fractions with denominators 11 to 19 that are very close: the cross products differ by 1 to 3
const close6 = (seed: number, neg: boolean, mixedNums: boolean): E6[] => {
  const r = rng(seed)
  const pick = (a: number, b: number) => a + Math.floor(r() * (b - a + 1))
  const out: E6[] = []
  for (let t = 0; t < 1500 && out.length < 12; t++) {
    const q1 = pick(11, 19)
    const q2 = pick(11, 19)
    if (q1 === q2) continue
    const p1 = pick(Math.ceil(q1 / 4), q1 - 1)
    const p2 = Math.round((p1 * q2) / q1) + pick(-1, 1)
    if (p2 < 1 || p2 >= q2 || gcd(p1, q1) !== 1 || gcd(p2, q2) !== 1 || Math.abs(p1 * q2 - p2 * q1) > 3 || p1 * q2 === p2 * q1) continue
    const w = pick(1, 6)
    const x = mixedNums ? mixed(neg, w, p1, q1) : fr(neg ? -p1 : p1, q1)
    const y = mixedNums ? mixed(neg, w, p2, q2) : fr(neg ? -p2 : p2, q2)
    if (out.some((o) => o.x.tex === x.tex && o.y.tex === y.tex)) continue
    out.push({ x, y })
  }
  return out
}
const H6_ROWS: [string, E6, E6[]][] = [[false, false], [true, false], [false, true], [true, true]].map(([neg, mx], i) => {
  const l = close6(1600 + i, neg, mx)
  return [String.fromCharCode(97 + i), l[0], l.slice(1)]
})
// exercises 2, 4, 7, 8 harder: tenths-free tick marks of 7 to 12 per unit, denominators up to 252, fractions that are almost equal, decimals with 3 to 4 places or repeating
const rows31 = <T,>(lists: T[][]): [string, T, T[]][] => lists.map((l, i) => [String.fromCharCode(97 + i), l[0], l.slice(1)])
const hardQ = (seed: number, f: (r: () => number) => E2): E2[] => {
  const r = rng(seed)
  const out: E2[] = []
  for (let t = 0; t < 600 && out.length < 12; t++) { const e = f(r); if (!out.some((o) => o.x.tex === e.x.tex)) out.push(e) }
  return out
}
const hp = (r: () => number, a: number, b: number) => a + Math.floor(r() * (b - a + 1))
const cop = (r: () => number, lo: number, hi: number, f: (q: number, n: number) => E2): E2 => { for (;;) { const q = hp(r, 7, 12); const n = hp(r, lo * q + 1, hi * q - 1); if (gcd(n, q) === 1) return f(q, n) } }
const H2_ROWS = rows31<E2>([
  hardQ(1201, (r) => cop(r, 1, 4, (q, n) => ({ x: fr(n, q), den: q }))),
  hardQ(1202, (r) => cop(r, 0, 1, (q, n) => ({ x: fr(-n, q), den: q }))),
  hardQ(1203, (r) => cop(r, 1, 4, (q, n) => ({ x: mixed(true, Math.floor(n / q), n % q, q), den: q }))).filter((e) => e.x.n % e.x.d !== 0),
  hardQ(1204, (r) => cop(r, 1, 4, (q, n) => ({ x: mixed(false, Math.floor(n / q), n % q, q), den: q }))),
])
const H4_ROWS = rows31<E4>([
  [[36, 48], [45, 60], [24, 40], [42, 63]],
  [[56, 84], [72, 90], [63, 105], [48, 72]],
  [[120, 150], [168, 210], [96, 144], [110, 176]],
  [[84, 126], [132, 198], [180, 252], [140, 210]],
].map((qs) => P4(qs as [number, number][])))
const toE78 = (l: E6[]): E78[] => l.map((e) => ({ a: e.x, b: e.y }))
const H7_ROWS = rows31<E78>([toE78(close6(1701, false, false)), toE78(close6(1702, true, false)), toE78(close6(1703, false, true)), toE78(close6(1704, true, true))])
const H8_ROWS = rows31<E78>([
  gen8([['12.345', '12.346'], ['3.4567', '3.4568'], ['5.678', '5.679'], ['9.012', '9.013'], ['7.8901', '7.8902'], ['1.2345', '1.2346'], ['4.567', '4.568'], ['6.789', '6.790'], ['8.9012', '8.9013'], ['2.3456', '2.3457'], ['10.101', '10.102'], ['3.0456', '3.0457']]),
  gen8([['-12.345', '-12.346'], ['-3.4567', '-3.4568'], ['-5.678', '-5.679'], ['-9.012', '-9.013'], ['-7.8901', '-7.8902'], ['-1.2345', '-1.2346'], ['-4.567', '-4.568'], ['-6.789', '-6.790'], ['-8.9012', '-8.9013'], ['-2.3456', '-2.3457'], ['-10.101', '-10.102'], ['-3.0456', '-3.0457']]),
  gen8([['3.\\overline{4}', '3.45'], ['2.\\overline{7}', '2.78'], ['5.\\overline{3}', '5.34'], ['1.\\overline{2}', '1.23'], ['6.\\overline{8}', '6.89'], ['4.\\overline{1}', '4.12'], ['7.\\overline{5}', '7.56'], ['9.\\overline{6}', '9.67'], ['8.\\overline{2}', '8.23'], ['3.\\overline{9}', '3.99'], ['1.\\overline{8}', '1.89'], ['5.\\overline{7}', '5.78']]),
  gen8([['-2.\\overline{3}', '-2.34'], ['-4.\\overline{6}', '-4.67'], ['-1.\\overline{5}', '-1.56'], ['-6.\\overline{2}', '-6.23'], ['-3.\\overline{8}', '-3.89'], ['-5.\\overline{1}', '-5.12'], ['-7.\\overline{4}', '-7.45'], ['-8.\\overline{9}', '-8.99'], ['-2.\\overline{7}', '-2.78'], ['-9.\\overline{3}', '-9.34'], ['-1.\\overline{2}', '-1.23'], ['-4.\\overline{8}', '-4.89']]),
])
export const EX_RATIONAL31H = [
  build(15, 'Order the numbers.', H5_ROWS, mk5, e5id, 'Order from least to greatest (challenge)', 3515, '3.1'),
  build(16, 'Choose < or >.', H6_ROWS, mk6, e6id, 'Compare (challenge)', 3616, '3.1'),
  build(12, 'Click the point.', H2_ROWS, mk2, e2id, 'Graph rational numbers (challenge)', 3212, '3.1'),
  build(14, 'Choose the common denominator.', H4_ROWS, mk4, e4id, 'Common denominator (challenge)', 3414, '3.1'),
  build(17, 'Choose the fraction between.', H7_ROWS, mk7, e78id, 'A fraction between (challenge)', 3717, '3.1'),
  build(18, 'Choose the fraction between.', H8_ROWS, mk8, e78id, 'A fraction between (challenge)', 3818, '3.1'),
]
