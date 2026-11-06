// Grade 9 3.2 (bank/G9-ch3/s2/items.json): exercises 1-9 (10-13 are in decimal32-data.ts).
//   1 add integers, 2 write the addition equation of a number diagram, 3 the number line of an addition, 4 subtract integers, 5 the number line of a subtraction,
//   6 add and subtract decimals, 7 solve with a box, 9 order decimals (8 is left out).
// Every question is multiple choice; the lessons are blanks (ineq64-data.ts lessonWp, built with graph42-data.ts `build`). All numbers are whole numbers or decimals kept as
// an integer and a number of decimal places, so every answer and step is exact; the 10 similar questions of every part are made here from small tables.
// Imported by: quiz.tsx, check32.ts. Shape: exercise.ts.
import type { Wp, WpStep } from './ineq64-data'
import { build, rng, uniq } from './graph42-data'
import type { It } from './graph42-data'
import { blk, range, text } from './seq41-data'

const between = (r: () => number, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1))
const par = (v: number) => (v < 0 ? `(${v})` : `${v}`)
const wrongInts = (v: number, extra: number[] = []) => uniq([...extra, -v, v + 2, v - 2, v + 10, v - 10, v + 1, v - 1].filter((x) => x !== v).map(String), (s) => s)

// ---- decimals: n / 10^d ----
interface Dc {
  n: number
  d: number
}
const fmt = ({ n, d }: Dc) => {
  const s = Math.abs(n)
  const f = 10 ** d
  return `${n < 0 ? '-' : ''}${Math.floor(s / f)}${d ? '.' + String(s % f).padStart(d, '0') : ''}`
}
const trim = (x: string) => (x.includes('.') ? x.replace(/0+$/, '').replace(/\.$/, '') : x)
const al = (a: Dc, b: Dc): [number, number, number] => {
  const d = Math.max(a.d, b.d)
  return [a.n * 10 ** (d - a.d), b.n * 10 ** (d - b.d), d]
}
const add = (a: Dc, b: Dc): Dc => {
  const [x, y, d] = al(a, b)
  return { n: x + y, d }
}
const neg = (a: Dc): Dc => ({ n: -a.n, d: a.d })
const dd = (s: string): Dc => {
  const [i, f = ''] = s.replace('-', '').split('.')
  return { n: (s.startsWith('-') ? -1 : 1) * Number(i + f), d: f.length }
}
const tx = (a: Dc) => trim(fmt(a))
const ptx = (a: Dc) => (a.n < 0 ? `(${tx(a)})` : tx(a))
const decWrongs = (v: Dc, extra: Dc[] = []) => {
  const f = 10 ** v.d
  return uniq([...extra, neg(v), { n: v.n + 1, d: v.d }, { n: v.n - 1, d: v.d }, { n: v.n + f, d: v.d }, { n: v.n - f, d: v.d }, { n: v.n * 10, d: v.d }].map(tx).filter((s) => s !== tx(v)), (s) => s)
}
// a random decimal with d places (last digit not 0), integer part 1..imax
const rdec = (r: () => number, d: number, imax: number): Dc => {
  let n = between(r, 1, imax) * 10 ** d + between(r, 0, 10 ** d - 1)
  if (d && n % 10 === 0) n += between(r, 1, 9)
  return { n, d }
}
const letterOf = (i: number) => String.fromCharCode(97 + i)

// ================= 1: add integers =================
interface E1 {
  ts: number[]
}
const exprTex = (ts: number[]) => ts.map((t, i) => (i ? `+ ${par(t)}` : String(t))).join(' ')
function mk1(e: E1, key: string): It {
  let acc = e.ts[0]
  let from = 's0'
  const steps: WpStep[] = []
  e.ts.slice(1).forEach((t, k) => {
    const nx = acc + t
    steps.push({ label: k === 0 ? 'Add the first two numbers.' : 'Add the next number.', toks: [{ id: `a${k}a`, tex: `${par(acc)} + ${par(t)}` }, { id: `a${k}g`, tex: '=' }, { id: `a${k}b`, tex: String(nx) }], blanks: [blk(`a${k}b`, from, `$${par(acc)} + ${par(t)} = \\square$`, wrongInts(nx, [Math.abs(acc) + Math.abs(t)]), acc * t < 0 ? 'The signs are different: subtract the smaller number from the bigger one and keep the sign of the bigger one.' : 'The signs are the same: add the numbers and keep the sign.')] })
    acc = nx
    from = `a${k}b`
  })
  const w: Wp = { tex: `${text('Determine the sum without a calculator: ')}${exprTex(e.ts)}`, short: exprTex(e.ts), key, answer: String(acc), wrong: wrongInts(acc, [e.ts.reduce((s, t) => s + Math.abs(t), 0)]), steps }
  return { w }
}
// signs of the textbook parts; similar questions get new numbers with the same signs
const P1: number[][] = [[1, 1], [1, -1], [-1, -1], [-1, 1], [1, 1, 1], [1, -1, 1], [1, 1, -1], [1, -1, -1], [-1, -1, -1], [-1, 1, -1]]
const BASE1: number[][] = [[4, 7], [4, -7], [-4, -7], [-4, 7], [4, 3, 6], [4, -3, 6], [4, 3, -6], [4, -3, -6], [-4, -3, -6], [-4, 3, -6]]
const idE1 = (e: E1) => e.ts.join(',')
const rows1: [string, E1, E1[]][] = P1.map((p, i) => {
  const r = rng(100 + i)
  return [letterOf(i), { ts: BASE1[i] }, range(0, 11).map(() => ({ ts: p.map((s) => s * between(r, 2, 19)) }))]
})

// ================= 4: subtract integers =================
interface E4 {
  x0: number // the first number as written
  neg0: boolean // written -( x0 )
  rest: [string, number][] // operator and the number
}
const exprTex4 = (e: E4) => `${e.neg0 ? `-(${e.x0})` : e.x0} ${e.rest.map(([op, v]) => `${op} ${par(v)}`).join(' ')}`
function mk4(e: E4, key: string): It {
  const steps: WpStep[] = []
  let acc = e.neg0 ? -e.x0 : e.x0
  let from = 's0'
  if (e.neg0) {
    steps.push({ label: 'The opposite of a negative number.', toks: [{ id: 'z0a', tex: `-(${e.x0})` }, { id: 'z0g', tex: '=' }, { id: 'z0b', tex: String(acc) }], blanks: [blk('z0b', 's0', `$-(${e.x0}) = \\square$`, wrongInts(acc), 'The opposite of a negative number is positive.')] })
    from = 'z0b'
  }
  e.rest.forEach(([op, v], k) => {
    const nx = op === '+' ? acc + v : acc - v
    if (op === '-' && v < 0) {
      steps.push({ label: 'Subtracting a negative number is adding.', toks: [{ id: `r${k}a`, tex: `${par(acc)} - ${par(v)} = ${par(acc)} +` }, { id: `r${k}b`, tex: String(-v) }], blanks: [blk(`r${k}b`, from, `$${par(acc)} - ${par(v)} = ${par(acc)} + \\square$`, [String(v), String(-v + 1), String(-v - 1)], 'Subtracting a number is the same as adding its opposite.')] })
      from = `r${k}b`
    }
    const ex = op === '-' && v < 0 ? `${par(acc)} + ${-v}` : `${par(acc)} ${op} ${par(v)}`
    steps.push({ label: op === '+' ? 'Add the next number.' : 'Subtract the next number.', toks: [{ id: `s${k}a`, tex: ex }, { id: `s${k}g`, tex: '=' }, { id: `s${k}b`, tex: String(nx) }], blanks: [blk(`s${k}b`, from, `$${ex} = \\square$`, wrongInts(nx, [acc + v, acc - v].filter((x) => x !== nx)), 'The signs are the same: add the numbers and keep the sign. The signs are different: subtract the smaller number from the bigger one and keep the sign of the bigger one.')] })
    acc = nx
    from = `s${k}b`
  })
  const w: Wp = { tex: `${text('Determine the difference without a calculator: ')}${exprTex4(e)}`, short: exprTex4(e), key, answer: String(acc), wrong: wrongInts(acc), steps }
  return { w }
}
// signs of the textbook parts: [sign of the first, written as -(...), [operator, sign of the number][]]
const P4: [number, boolean, [string, number][]][] = [
  [1, false, [['-', 1]]], [-1, false, [['-', 1]]], [1, false, [['-', 1], ['-', 1]]], [-1, false, [['-', 1], ['-', 1]]], [-1, false, [['-', 1], ['+', 1]]],
  [-1, false, [['+', 1], ['-', 1]]], [1, false, [['-', -1], ['-', 1]]], [-1, false, [['-', 1], ['-', -1]]], [-1, false, [['-', -1], ['-', -1]]], [-1, true, [['-', 1], ['-', -1]]],
]
const BASE4: E4[] = [
  { x0: 18, neg0: false, rest: [['-', 11]] }, { x0: -18, neg0: false, rest: [['-', 11]] }, { x0: 18, neg0: false, rest: [['-', 11], ['-', 10]] }, { x0: -18, neg0: false, rest: [['-', 11], ['-', 10]] },
  { x0: -18, neg0: false, rest: [['-', 11], ['+', 10]] }, { x0: -18, neg0: false, rest: [['+', 11], ['-', 10]] }, { x0: 18, neg0: false, rest: [['-', -11], ['-', 10]] }, { x0: -18, neg0: false, rest: [['-', 11], ['-', -10]] },
  { x0: -18, neg0: false, rest: [['-', -11], ['-', -10]] }, { x0: -18, neg0: true, rest: [['-', 11], ['-', -10]] },
]
const rows4: [string, E4, E4[]][] = P4.map(([s0, wrap, ops], i) => {
  const r = rng(400 + i)
  const pool = range(0, 11).map((): E4 => {
    const m = between(r, 6, 29)
    return { x0: wrap ? -m : s0 * m, neg0: wrap, rest: ops.map(([op, sg]): [string, number] => [op, sg * between(r, 3, 19)]) }
  })
  return [letterOf(i), BASE4[i], pool]
})

// ================= number lines (2, 3, 5) =================
const LW = 520
const lxx = (v: number, lo: number, hi: number) => 14 + ((v - lo) / (hi - lo)) * (LW - 28)
const BLUE = '#2563eb'
const ORANGE = '#ea580c'
// one number line: a blue dot at a, an orange arrow from a that moves m (the move is written above the arrow)
function lineBody(a: number, m: number, lo: number, hi: number, y: number): string {
  const tick = range(lo, hi).map((v) => `<line x1="${lxx(v, lo, hi)}" y1="${y - 5}" x2="${lxx(v, lo, hi)}" y2="${y + 5}" stroke="#475569" stroke-width="${v === 0 ? 2 : 1.2}"/><text x="${lxx(v, lo, hi)}" y="${y + 19}" text-anchor="middle" font-size="${hi - lo > 20 ? 8 : 10}" fill="#334155">${v}</text>`).join('')
  const arrow = (from: number, to: number, color: string, h: number) => {
    const x1 = lxx(from, lo, hi)
    const x2 = lxx(to, lo, hi)
    const s = to > from ? -1 : 1
    return `<path d="M ${x1} ${y - 2} Q ${(x1 + x2) / 2} ${y - 2 - h} ${x2} ${y - 4}" fill="none" stroke="${color}" stroke-width="2.4"/><path d="M ${x2} ${y - 3} l ${s * 9} -7 M ${x2} ${y - 3} l ${s * 9} 4" stroke="${color}" stroke-width="2.4" stroke-linecap="round" fill="none"/>`
  }
  return `<line x1="8" y1="${y}" x2="${LW - 8}" y2="${y}" stroke="#475569" stroke-width="2"/>${tick}${arrow(a, a + m, ORANGE, 40)}<circle cx="${lxx(a, lo, hi)}" cy="${y}" r="5" fill="${BLUE}"/><text x="${(lxx(a, lo, hi) + lxx(a + m, lo, hi)) / 2}" y="${y - 28}" text-anchor="middle" font-size="14" font-weight="bold" fill="${ORANGE}">${m}</text>`
}
const addTex = (a: number, b: number, s = a + b) => `${a} + ${par(b)} = ${s}`
// ---- 2: write the addition equation of the diagram ----
interface E2 {
  a: number
  b: number
}
function mk2(e: E2, key: string): It {
  const s = e.a + e.b
  const R = Math.max(Math.abs(e.a), Math.abs(s), Math.abs(e.b)) + 2
  const fig = `<svg viewBox="0 0 ${LW} 90" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:520px;height:auto;margin:0 auto;display:block">${lineBody(e.a, e.b, -R, R, 62)}</svg>`
  const ans = addTex(e.a, e.b)
  const wrong = uniq([addTex(-e.a, e.b), addTex(e.a, -e.b), addTex(e.a, e.b, -s), addTex(e.a, e.b, Math.abs(e.a) + Math.abs(e.b))].filter((x) => x !== ans), (x) => x)
  const w: Wp = {
    tex: text('Write the addition equation for the number diagram.'),
    short: '\\text{the diagram}',
    key,
    answer: ans,
    wrong,
    steps: [
      { label: 'Where the arrow starts (blue dot).', toks: [{ id: 'p1a', tex: '\\text{it starts at}' }, { id: 'p1b', tex: String(e.a) }], blanks: [blk('p1b', 's0', '$\\text{Where is the blue dot?}$', wrongInts(e.a), 'Read the number under the blue dot.')] },
      { label: 'The arrow (orange).', toks: [{ id: 'p2a', tex: `\\text{it moves ${e.b < 0 ? 'left' : 'right'} by}` }, { id: 'p2b', tex: String(e.b) }], blanks: [blk('p2b', 'p1b', '$\\text{The number added: right is positive, left is negative}$', wrongInts(e.b), 'The number written above the orange arrow is the number added: to the right is positive, to the left negative.')] },
      { label: 'The equation.', toks: [{ id: 'p3a', tex: `${e.a} + ${par(e.b)} =` }, { id: 'p3b', tex: String(s) }], blanks: [blk('p3b', 'p2b', `$${e.a} + ${par(e.b)} = \\square$`, wrongInts(s), 'The orange arrow ends at the answer.')] },
    ],
  }
  return { w, fig, showTex: true }
}
const pairs = (xs: [number, number][]): E2[] => xs.map(([a, b]) => ({ a, b }))
const E2_ROWS: [string, E2, E2[]][] = [
  ['a', { a: 4, b: 3 }, pairs([[5, 2], [3, 6], [2, 5], [6, 3], [1, 7], [4, 4], [7, 2], [2, 6]])],
  ['b', { a: 6, b: -4 }, pairs([[7, -3], [5, -2], [4, -6], [8, -5], [3, -7], [6, -2], [2, -5], [5, -7]])],
  ['c', { a: -5, b: 8 }, pairs([[-3, 6], [-4, 7], [-2, 5], [-6, 3], [-5, 2], [-7, 4], [-3, 9], [-4, 4]])],
  ['d', { a: -3, b: -4 }, pairs([[-2, -5], [-4, -3], [-1, -6], [-5, -2], [-3, -3], [-6, -1], [-2, -7], [-5, -4]])],
  ['e', { a: 2, b: -6 }, pairs([[3, -7], [1, -5], [4, -8], [2, -4], [5, -9], [1, -7], [3, -5], [2, -8]])],
]
const idE2 = (e: E2) => `${e.a},${e.b}`

// ---- 3 and 5: which number line shows the statement ----
function mk35(sub: boolean) {
  return (e: E2, key: string): It => {
    const m = sub ? -e.b : e.b // how far the second arrow moves
    const res = e.a + m
    const stmt = `${e.a} ${sub ? '-' : '+'} ${par(e.b)} = ${res}`
    const cand: [number, number][] = [[e.a, m], [-e.a, m], [e.a, -m], [m, e.a], [e.a, m > 0 ? m + 2 : m - 2]]
    const four = [cand[0], ...uniq(cand.slice(1).filter(([a, mm]) => !(a === e.a && mm === m)), ([a, mm]) => `${a},${mm}`).slice(0, 3)]
    const order = four.map((c, i) => ({ c, i, h: (Math.abs(c[0]) * 31 + Math.abs(c[1]) * 17 + i * 7 + Math.abs(e.a) * 3 + Math.abs(e.b) * 5) % 97 })).sort((p, q) => p.h - q.h)
    const letters = ['A', 'B', 'C', 'D']
    const ans = letters[order.findIndex((o) => o.i === 0)]
    const R = Math.max(...four.flatMap(([a, mm]) => [Math.abs(a), Math.abs(a + mm)])) + 1
    const rows = order.map((o, k) => {
      const y = 44 + k * 66
      return `<g data-choice="${k}" style="cursor:pointer"><rect x="0" y="${y - 38}" width="${LW}" height="62" fill="#fff" fill-opacity="0.01"/><text x="4" y="${y - 22}" font-size="16" font-weight="bold" fill="#0f172a">${letters[k]}</text>${lineBody(o.c[0], o.c[1], -R, R, y)}</g>`
    }).join('')
    const fig = `<svg viewBox="0 0 ${LW} ${44 + 66 * 3 + 28}" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:520px;height:auto;margin:0 auto;display:block">${rows}</svg>`
    const moveTex = (v: number) => `\\text{${v < 0 ? 'left' : 'right'} ${Math.abs(v)}}`
    const w: Wp = {
      tex: `${text('Which number line shows ')}${stmt}`,
      short: stmt,
      key,
      answer: ans,
      wrong: letters.filter((l) => l !== ans),
      steps: [
        { label: 'Where the arrow starts (blue dot).', toks: [{ id: 'q1a', tex: '\\text{it starts at}' }, { id: 'q1b', tex: String(e.a) }], blanks: [blk('q1b', 's0', '$\\text{The blue dot shows the first number}$', wrongInts(e.a), 'The first number of the statement is where the blue dot is.')] },
        { label: 'The arrow (orange).', toks: [{ id: 'q2a', tex: '\\text{it moves}' }, { id: 'q2b', tex: moveTex(m) }], blanks: [blk('q2b', 'q1b', sub ? `$\\text{Subtracting } ${par(e.b)}\\text{: the arrow moves the opposite way}$` : `$\\text{Adding } ${par(e.b)}\\text{: the arrow moves}$`, uniq([moveTex(-m), moveTex(m > 0 ? m + 1 : m - 1), moveTex(-m + 1)], (s) => s), sub ? 'Adding a positive number moves right. Subtracting is the opposite: subtracting a positive moves left, subtracting a negative moves right.' : 'A positive number moves the arrow to the right, a negative number to the left.')] },
        { label: 'The letter.', toks: [{ id: 'q3a', tex: '\\text{the number line is}' }, { id: 'q3b', tex: ans }], blanks: [blk('q3b', 'q2b', `$\\text{Which line has the blue dot at } ${e.a}\\text{ and the orange arrow ending at } ${res}\\text{?}$`, letters.filter((l) => l !== ans), 'Check where the blue dot is and where the orange arrow goes.')] },
      ],
    }
    return { w, fig, fixed: letters, showTex: true }
  }
}
const mk3 = mk35(false)
const mk5 = mk35(true)
const E3_ROWS: [string, E2, E2[]][] = [
  ['a', { a: 1, b: 3 }, pairs([[2, 4], [3, 2], [1, 5], [4, 3], [2, 6], [5, 2], [3, 4]])],
  ['b', { a: -3, b: 6 }, pairs([[-2, 5], [-4, 7], [-3, 4], [-5, 8], [-2, 6], [-4, 5], [-1, 4]])],
  ['c', { a: -3, b: -2 }, pairs([[-2, -4], [-4, -3], [-1, -5], [-3, -3], [-5, -2], [-2, -6], [-4, -1]])],
  ['d', { a: 4, b: -7 }, pairs([[3, -6], [5, -8], [2, -5], [4, -6], [6, -9], [3, -7], [5, -7]])],
]
const E5_ROWS: [string, E2, E2[]][] = [
  ['a', { a: -2, b: 3 }, pairs([[-1, 4], [-3, 2], [-2, 5], [-4, 3], [-1, 6], [-3, 4], [-2, 4]])],
  ['b', { a: 2, b: -4 }, pairs([[3, -5], [1, -6], [2, -5], [4, -3], [3, -4], [1, -4], [5, -2]])],
  ['c', { a: -6, b: -3 }, pairs([[-5, -2], [-7, -4], [-4, -3], [-6, -2], [-8, -5], [-5, -4], [-3, -2]])],
  ['d', { a: -6, b: -10 }, pairs([[-5, -9], [-7, -8], [-4, -9], [-6, -9], [-3, -8], [-5, -8], [-4, -7]])],
]

// ================= 6: add and subtract decimals =================
interface E6 {
  a: Dc
  op: string
  b: Dc
}
const exprTex6 = (e: E6) => `${tx(e.a)} ${e.op} ${ptx(e.b)}`
function mk6(e: E6, key: string): It {
  const t = e.op === '+' ? e.b : neg(e.b) // what is really added
  const res = add(e.a, t)
  const same = e.a.n < 0 === t.n < 0
  const [ma, mb, d] = al({ n: Math.abs(e.a.n), d: e.a.d }, { n: Math.abs(t.n), d: t.d })
  const A: Dc = { n: Math.abs(e.a.n), d: e.a.d }
  const B: Dc = { n: Math.abs(t.n), d: t.d }
  const magExpr = same ? `${tx(A)} + ${tx(B)}` : `${tx(ma >= mb ? A : B)} - ${tx(ma >= mb ? B : A)}`
  const mag: Dc = { n: same ? ma + mb : Math.abs(ma - mb), d }
  const magWrong = uniq([`${tx(A)} ${same ? '-' : '+'} ${tx(B)}`, `${tx(B)} ${same ? '-' : '+'} ${tx(A)}`, `${tx(A)} + ${tx(B)}`, `${tx(B)} - ${tx(A)}`].filter((x) => x !== magExpr), (s) => s)
  const w: Wp = {
    tex: `${text('Add or subtract as indicated: ')}${exprTex6(e)}`,
    short: exprTex6(e),
    key,
    answer: tx(res),
    wrong: decWrongs(res, [mag]),
    steps: [
      { label: 'Same signs: add. Different signs: subtract.', toks: [{ id: 'm1a', tex: `\\text{the signs are ${same ? 'the same' : 'different'}}` }, { id: 'm1b', tex: magExpr }], blanks: [blk('m1b', 's0', `$\\text{The numbers without their signs: } ${exprTex6(e)}$`, magWrong, e.op === '-' ? 'Subtracting a number is the same as adding its opposite. Then: the signs are the same, add; the signs are different, subtract the smaller from the bigger.' : 'The signs are the same: add the numbers. The signs are different: subtract the smaller from the bigger.')] },
      { label: 'Line up the decimal points.', toks: [{ id: 'm2a', tex: `${magExpr} =` }, { id: 'm2b', tex: tx(mag) }], blanks: [blk('m2b', 'm1b', `$${magExpr} = \\square$`, decWrongs(mag), 'Write the numbers under each other with the decimal points lined up (fill the gaps with zeros).')] },
      { label: 'The sign of the answer.', toks: [{ id: 'm3a', tex: same ? `\\text{both numbers are ${e.a.n < 0 ? 'negative' : 'positive'}, answer}` : `\\text{since } ${tx(ma >= mb ? A : B)} \\text{ is larger, answer}` }, { id: 'm3b', tex: tx(res) }], blanks: [blk('m3b', 'm2b', `$\\text{The answer has the sign of the ${same ? 'numbers' : 'bigger number (without signs)'}}$`, decWrongs(res, [mag]), 'The answer has the sign of the bigger number (without signs).')] },
    ],
  }
  return { w }
}
// [part, sign of a, operator, sign of b, digits of a, digits of b]
const SPEC6: [number, string, number, number, number][] = [
  [-1, '+', 1, 2, 2], [-1, '-', 1, 2, 2], [1, '-', 1, 2, 2], [-1, '+', -1, 3, 2], [1, '-', -1, 3, 2],
  [-1, '-', -1, 3, 2], [1, '-', 1, 3, 2], [-1, '+', -1, 3, 1], [1, '-', -1, 3, 1], [-1, '-', -1, 3, 1],
]
const BASE6 = ['-4.06 + 1.83', '-4.06 - 1.83', '4.06 - 1.83', '-5.637 + (-3.71)', '5.637 - (-3.71)', '-5.637 - (-3.71)', '5.637 - 3.71', '-7.204 + (-1.8)', '7.204 - (-1.8)', '-7.204 - (-1.8)']
const parse6 = (s: string): E6 => {
  const m = s.match(/^(-?[\d.]+) ([+-]) \(?(-?[\d.]+)\)?$/)!
  return { a: dd(m[1]), op: m[2], b: dd(m[3]) }
}
const idE6 = (e: E6) => exprTex6(e)
const rows6: [string, E6, E6[]][] = SPEC6.map(([sa, op, sb, da, db], i) => {
  const r = rng(600 + i)
  const pool = range(0, 11).map((): E6 => {
    const a = rdec(r, da, 9)
    const b = rdec(r, db, 9)
    return { a: { n: sa * a.n, d: a.d }, op, b: { n: sb * b.n, d: b.d } }
  })
  return [letterOf(i), parse6(BASE6[i]), pool]
})

// ================= 7: solve with a box =================
interface E7 {
  form: string // 'x+a', 'x-a', 'a+x', 'a-x'
  a: Dc
  b: Dc
}
const eqTex = (e: E7) => {
  const a = tx(e.a)
  const left = e.form === 'x+a' ? `\\square + ${a}` : e.form === 'x-a' ? `\\square - ${a}` : e.form === 'a+x' ? `${a} + \\square` : `${a} - \\square`
  return `${left} = ${tx(e.b)}`
}
function mk7(e: E7, key: string): It {
  const x = e.form === 'x+a' || e.form === 'a+x' ? add(e.b, neg(e.a)) : e.form === 'x-a' ? add(e.b, e.a) : add(e.a, neg(e.b))
  const ex = e.form === 'x+a' || e.form === 'a+x' ? `${tx(e.b)} - ${ptx(e.a)}` : e.form === 'x-a' ? `${tx(e.b)} + ${ptx(e.a)}` : `${tx(e.a)} - ${ptx(e.b)}`
  const exWrong = uniq([`${tx(e.b)} + ${ptx(e.a)}`, `${tx(e.b)} - ${ptx(e.a)}`, `${tx(e.a)} - ${ptx(e.b)}`, `${tx(e.a)} + ${ptx(e.b)}`].filter((s) => s !== ex), (s) => s)
  const w: Wp = {
    tex: `${text('Solve: ')}${eqTex(e)}`,
    short: eqTex(e),
    key,
    answer: tx(x),
    wrong: decWrongs(x, [add(e.b, e.a), add(e.b, neg(e.a))]),
    steps: [
      { label: 'Undo the operation.', toks: [{ id: 'u1a', tex: '\\square =' }, { id: 'u1b', tex: ex }], blanks: [blk('u1b', 's0', `$${eqTex(e)}\\text{: what is the box?}$`, exWrong, 'Use the opposite operation. If the box is subtracted from a number, the box is that number minus the result.')] },
      { label: 'Calculate.', toks: [{ id: 'u2a', tex: `${ex} =` }, { id: 'u2b', tex: tx(x) }], blanks: [blk('u2b', 'u1b', `$${ex} = \\square$`, decWrongs(x, [add(e.b, e.a)]), 'Line up the decimal points. Same signs: add. Different signs: subtract the smaller from the bigger.')] },
    ],
  }
  return { w }
}
const BASE7: E7[] = [
  { form: 'x+a', a: dd('18.2'), b: dd('27.35') }, { form: 'x-a', a: dd('18.2'), b: dd('27.35') }, { form: 'x+a', a: dd('18.2'), b: dd('-27.35') }, { form: 'x-a', a: dd('18.2'), b: dd('-27.35') },
  { form: 'a+x', a: dd('16.93'), b: dd('8.71') }, { form: 'a-x', a: dd('16.93'), b: dd('8.71') }, { form: 'a+x', a: dd('-16.93'), b: dd('8.71') }, { form: 'a-x', a: dd('-16.93'), b: dd('8.71') },
  { form: 'a+x', a: dd('-16.93'), b: dd('-8.71') }, { form: 'a-x', a: dd('16.93'), b: dd('-8.71') },
]
const idE7 = (e: E7) => eqTex(e)
const rows7: [string, E7, E7[]][] = BASE7.map((b0, i) => {
  const r = rng(700 + i)
  const pool = range(0, 11).map((): E7 => {
    const a = rdec(r, b0.a.d, 29)
    const b = rdec(r, b0.b.d, 29)
    return { form: b0.form, a: { n: Math.sign(b0.a.n) * a.n, d: a.d }, b: { n: Math.sign(b0.b.n) * b.n, d: b.d } }
  })
  return [letterOf(i), b0, pool]
})

// ================= 9: order decimals =================
interface E9 {
  xs: string[]
}
function mk9(e: E9, key: string): It {
  const ds = e.xs.map(dd)
  const dmax = Math.max(...ds.map((x) => x.d))
  const scaled = (s: string) => dd(s).n * 10 ** (dmax - dd(s).d)
  const pad = (s: string) => fmt({ n: scaled(s), d: dmax })
  const sorted = [...e.xs].sort((p, q) => scaled(p) - scaled(q))
  const list = (xs: string[]) => xs.join(',\\ ')
  const ans = list(sorted)
  const padList = list(e.xs.map(pad))
  const padWrong = uniq([list(e.xs.map((s) => fmt({ n: Math.trunc(scaled(s) / 10), d: Math.max(dmax - 1, 0) }))), list(e.xs.map((s) => pad(s).replace('-', ''))), list(e.xs.map((s) => fmt({ n: scaled(s) + (scaled(s) < 0 ? -1 : 1), d: dmax })))].filter((s) => s !== padList), (s) => s)
  const rev = list([...sorted].reverse())
  const byAbs = list([...e.xs].sort((p, q) => Math.abs(scaled(p)) - Math.abs(scaled(q))))
  const swapped = list(sorted.map((x, i, a) => (i === 2 ? a[3] : i === 3 ? a[2] : x)))
  const wrong = uniq([byAbs, rev, swapped, list(e.xs)], (s) => s).filter((s) => s !== ans)
  const w: Wp = {
    tex: `${text('Arrange the numbers from smallest to largest: ')}${list(e.xs)}`,
    short: list(e.xs),
    key,
    answer: ans,
    wrong,
    steps: [
      { label: 'The same number of decimal places.', toks: [{ id: 'g1a', tex: `\\text{${dmax} decimal places}` }, { id: 'g1b', tex: padList }], blanks: [blk('g1b', 's0', `$\\text{Write every number with ${dmax} decimal places (add zeros)}$`, padWrong, 'Adding zeros at the end of a decimal does not change its value.')] },
      { label: 'From smallest to largest.', toks: [{ id: 'g2a', tex: '\\text{in order}' }, { id: 'g2b', tex: ans }], blanks: [blk('g2b', 'g1b', '$\\text{Negative numbers: the bigger the digits, the smaller the number.}$', wrong, 'Compare the digits without the decimal points. For negative numbers the order is reversed.')] },
    ],
  }
  // the answer is given by dragging the numbers onto a number line, smallest on the left
  return { w, sort: { items: e.xs, order: e.xs.map((_, i) => i).sort((p, q) => scaled(e.xs[p]) - scaled(e.xs[q])) } }
}
const idE9 = (e: E9) => e.xs.join(',')
const shiftDigits = (s: string, k: number, iAdd: number) => {
  if (!s.includes('.')) return `-${Number(s.replace('-', '')) + iAdd}`
  const [i, f] = s.replace('-', '').split('.')
  return `-${Number(i) + iAdd}.${f.replace(/\d/g, (c) => String((Number(c) + k) % 10))}`
}
const BASE9: [string, string[]][] = [
  ['a', ['-1.99', '-1.999', '-2', '-1.9999', '-2.00009', '-1.9909', '-1.9889']],
  ['b', ['-4.1', '-4.109', '-4.108', '-4.018', '-4.0119', '-4.0302', '-4.00001']],
]
const rows9: [string, E9, E9[]][] = BASE9.map(([p, xs]) => {
  const pool = range(1, 9)
    .map((k): E9 => ({ xs: xs.map((s) => shiftDigits(s, k, k % 3)) }))
    .filter((e) => new Set(e.xs.map((s) => dd(s).n * 10 ** (5 - dd(s).d))).size === e.xs.length)
  return [p, { xs }, pool]
})

export const EX_INT32 = [
  build(1, 'Choose the sum.', rows1, mk1, idE1, 'Add integers', 5001, '3.2'),
  build(2, 'Choose the equation.', E2_ROWS, mk2, idE2, 'Equation of a number diagram', 5002, '3.2'),
  build(3, 'Choose the number line.', E3_ROWS, mk3, idE2, 'Addition on a number line', 5003, '3.2'),
  build(4, 'Choose the difference.', rows4, mk4, exprTex4, 'Subtract integers', 5004, '3.2'),
  build(5, 'Choose the number line.', E5_ROWS, mk5, idE2, 'Subtraction on a number line', 5005, '3.2'),
  build(6, 'Choose the answer.', rows6, mk6, idE6, 'Add and subtract decimals', 5006, '3.2'),
  build(7, 'Choose the number in the box.', rows7, mk7, idE7, 'Solve with a box', 5007, '3.2'),
  build(9, 'Choose the order.', rows9, mk9, idE9, 'Order decimals', 5009, '3.2'),
]

// ================= challenge exercises (3.2 exercises 1, 4 and 6, harder): more numbers, bigger numbers, more decimal places; optional extra practice with its own progress (no 11, 14, 16) =================
const H1 = (n: number, signs: number[][]): [string, E1, E1[]][] =>
  signs.map((p, i) => {
    const r = rng(1100 + n * 10 + i)
    const mk = () => ({ ts: p.map((s) => s * between(r, 12, 99)) })
    return [letterOf(i), mk(), range(0, 14).map(mk)]
  })
const H4 = (n: number, specs: [number, boolean, [string, number][]][]): [string, E4, E4[]][] =>
  specs.map(([s0, wrap, ops], i) => {
    const r = rng(1400 + n * 10 + i)
    const mk = (): E4 => { const m = between(r, 20, 99); return { x0: wrap ? -m : s0 * m, neg0: wrap, rest: ops.map(([op, sg]): [string, number] => [op, sg * between(r, 11, 79)]) } }
    return [letterOf(i), mk(), range(0, 14).map(mk)]
  })
const H6 = (specs: [number, string, number, number, number][]): [string, E6, E6[]][] =>
  specs.map(([sa, op, sb, da, db], i) => {
    const r = rng(1600 + i)
    const mk = (): E6 => { const a = rdec(r, da, 99); const b = rdec(r, db, 99); return { a: { n: sa * a.n, d: a.d }, op, b: { n: sb * b.n, d: b.d } } }
    return [letterOf(i), mk(), range(0, 14).map(mk)]
  })
const H7 = (specs: [string, number, number, number, number][]): [string, E7, E7[]][] =>
  specs.map(([form, sa, sb, da, db], i) => {
    const r = rng(1700 + i)
    const mk = (): E7 => { const a = rdec(r, da, 99); const b = rdec(r, db, 99); return { form, a: { n: sa * a.n, d: a.d }, b: { n: sb * b.n, d: b.d } } }
    return [letterOf(i), mk(), range(0, 14).map(mk)]
  })
// exercise 9 harder: 8 numbers with the same whole part that differ only far to the right; the other 9 questions move the whole part
const bump = (s: string, k: number) => s.replace(/^(-?)(\d+)/, (_m, sg, w) => sg + (Number(w) + k))
const BASE9H: [string, string[]][] = [
  ['a', ['-0.5', '-0.55', '-0.505', '-0.5005', '-0.5055', '-0.55005', '-0.4999', '-0.05']],
  ['b', ['3.07', '3.7', '3.07007', '3.007', '3.0707', '3.077', '3.0077', '3.70001']],
  ['c', ['-12.3', '-12.03', '-12.303', '-12.0303', '-12.33', '-12.3003', '-12.0033', '-12.003']],
  ['d', ['0.1', '0.09999', '0.10001', '0.0999', '0.101', '0.1001', '0.0101', '0.01']],
]
const rows9H: [string, E9, E9[]][] = BASE9H.map(([p, xs]) => [p, { xs }, range(1, 9).map((k): E9 => ({ xs: xs.map((s) => bump(s, k)) }))])
export const EX_INT32H = [
  build(11, 'Choose the sum.', H1(1, [[1, -1, 1, -1], [-1, -1, 1, -1, 1], [1, 1, -1, -1, 1], [-1, 1, -1, -1, 1, 1]]), mk1, idE1, 'Add integers (challenge)', 5011, '3.2', (e: E1) => e.ts.length),
  build(14, 'Choose the difference.', H4(4, [[1, false, [['-', 1], ['-', -1], ['-', 1]]], [-1, false, [['-', -1], ['-', 1], ['+', -1]]], [-1, true, [['-', 1], ['-', -1], ['-', -1]]], [-1, false, [['-', -1], ['-', 1], ['-', -1], ['+', 1]]]]), mk4, exprTex4, 'Subtract integers (challenge)', 5014, '3.2', (e: E4) => e.rest.length + (e.neg0 ? 1 : 0)),
  build(16, 'Choose the answer.', H6([[-1, '+', 1, 4, 3], [1, '-', -1, 4, 3], [-1, '-', -1, 5, 3], [-1, '+', -1, 4, 5]]), mk6, idE6, 'Add and subtract decimals (challenge)', 5016, '3.2', (e: E6) => e.a.d + e.b.d),
  build(17, 'Choose the number in the box.', H7([['x+a', -1, 1, 3, 3], ['x-a', 1, -1, 3, 2], ['a+x', -1, -1, 3, 3], ['a-x', 1, -1, 2, 3]]), mk7, idE7, 'Solve with a box (challenge)', 5017, '3.2', (e: E7) => e.a.d + e.b.d),
  build(19, 'Choose the order.', rows9H, mk9, idE9, 'Order decimals (challenge)', 5019, '3.2'),
]
