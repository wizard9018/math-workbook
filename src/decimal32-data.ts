// Grade 9 3.2 (bank/G9-ch3/s2/items.json): add and subtract decimals. Textbook exercises 10, 11, 12 and 13 (word problems with decimals) are one exercise here, parts a-d.
//   a savings goal (multiply, add, subtract), b odometer (add, subtract), c money left over (add the three, subtract), d three prices against a budget (add, subtract, answer).
// Every question is multiple choice; the lessons are blanks (ineq64-data.ts lessonWp, built with graph42-data.ts `build`). The numbers are whole cents / tenths of a kilometre,
// so every answer and step is exact; the 10 similar questions of every part are made here from small tables.
// The textbook's first problem (stereo 637.95, saved 347.21, six weekends of 162.80) has more money than it needs, so the price here is 1637.95.
// Imported by: quiz.tsx, check32.ts. Shape: exercise.ts.
import type { Wp } from './ineq64-data'
import { build, rng, uniq } from './graph42-data'
import type { It } from './graph42-data'
import { blk, text } from './seq41-data'

// ---- numbers: money in cents, distances in tenths of a kilometre ----
const dp = (v: number, k: number) => {
  const s = Math.abs(v)
  const f = 10 ** k
  return `${v < 0 ? '-' : ''}${Math.floor(s / f)}.${String(s % f).padStart(k, '0')}`
}
const money = (c: number) => dp(c, 2)
const km = (t: number) => dp(t, 1)
// plausible wrong answers: a slip of one unit, of ten units, a decimal point in the wrong place
const near = (v: number, k: number, extra: number[] = []) =>
  uniq([...extra, v + 1, v - 1, v + 10, v - 10, v + 100, v - 100, v * 10, Math.round(v / 10)].filter((x) => x !== v && x > 0).map((x) => dp(x, k)), (s) => s)
const between = (r: () => number, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1))

// ================= a: saving for something =================
interface A {
  who: string
  what: string
  cost: number
  saved: number
  wk: number
  n: number
}
function mkA(e: A, key: string): It {
  const earn = e.n * e.wk
  const have = e.saved + earn
  const need = e.cost - have
  const w: Wp = {
    tex: text(`${e.who} is saving to buy ${e.what} for ${money(e.cost)} dollars. ${e.who} has saved ${money(e.saved)} dollars and will earn ${money(e.wk)} dollars on each of the next ${e.n} weekends. How much more does ${e.who} have to earn to buy it?`),
    short: `${money(e.cost)},\\ ${money(e.saved)},\\ ${e.n}\\cdot ${money(e.wk)}`,
    key,
    answer: money(need),
    wrong: near(need, 2, [e.cost - e.saved]),
    steps: [
      { label: 'The money earned on the weekends.', toks: [{ id: 'a1a', tex: `${e.n}\\cdot ${money(e.wk)}` }, { id: 'a1g', tex: '=' }, { id: 'a1b', tex: money(earn) }], blanks: [blk('a1b', 's0', `$${e.n}\\cdot ${money(e.wk)} = \\square$`, near(earn, 2, [e.wk + e.n]), 'Multiply the money of one weekend by the number of weekends.')] },
      { label: 'All the money.', toks: [{ id: 'a2a', tex: `${money(e.saved)} + ${money(earn)}` }, { id: 'a2g', tex: '=' }, { id: 'a2b', tex: money(have) }], blanks: [blk('a2b', 'a1b', `$${money(e.saved)} + ${money(earn)} = \\square$`, near(have, 2, [Math.abs(earn - e.saved)]), 'Add the saved money and the money earned. Line up the decimal points.')] },
      { label: 'The money still needed.', toks: [{ id: 'a3a', tex: `${money(e.cost)} - ${money(have)}` }, { id: 'a3g', tex: '=' }, { id: 'a3b', tex: money(need) }], blanks: [blk('a3b', 'a2b', `$${money(e.cost)} - ${money(have)} = \\square$`, near(need, 2, [e.cost + have]), 'Subtract all the money from the price. Line up the decimal points.')] },
    ],
  }
  return { w }
}
const NAMES: [string, string][] = [['Marcus', 'a bicycle'], ['Priya', 'a laptop'], ['Tomas', 'a guitar'], ['Aiko', 'a camera'], ['Liam', 'a drone'], ['Sofia', 'a tablet'], ['Noah', 'a game console'], ['Lena', 'a keyboard']]
function poolA(): A[] {
  const r = rng(321)
  return NAMES.flatMap(([who, what], i) =>
    [0, 1].map((j): A => {
      const wk = between(r, 400, 1200) * 5 + 5 * (i + j)
      const n = between(r, 3, 8)
      const saved = between(r, 18000, 60000) + (i + j) * 7
      const cost = saved + n * wk + between(r, 15000, 90000) + 95
      return { who, what, cost, saved, wk, n }
    }),
  )
}
const idA = (e: A) => `${e.who}${e.cost}${e.n}`

// ================= b: the odometer =================
interface B {
  who: string
  reading: number
  trip: number
  service: number
}
function mkB(e: B, key: string): It {
  const after = e.reading + e.trip
  const left = e.service - after
  const w: Wp = {
    tex: text(`The odometer on ${e.who}'s car reads ${km(e.reading)} km. ${e.who} plans a camping trip that is ${km(e.trip)} km there and back. The car must be serviced at ${km(e.service)} km. How many kilometres can ${e.who} drive after coming back from the trip before the car is serviced?`),
    short: `${km(e.reading)},\\ ${km(e.trip)},\\ ${km(e.service)}`,
    key,
    answer: km(left),
    wrong: near(left, 1, [e.service - e.trip, e.service - e.reading]),
    steps: [
      { label: 'The odometer after the trip.', toks: [{ id: 'b1a', tex: `${km(e.reading)} + ${km(e.trip)}` }, { id: 'b1g', tex: '=' }, { id: 'b1b', tex: km(after) }], blanks: [blk('b1b', 's0', `$${km(e.reading)} + ${km(e.trip)} = \\square$`, near(after, 1, [Math.abs(e.reading - e.trip)]), 'Add the distance of the trip to the reading. Line up the decimal points.')] },
      { label: 'The distance until the service.', toks: [{ id: 'b2a', tex: `${km(e.service)} - ${km(after)}` }, { id: 'b2g', tex: '=' }, { id: 'b2b', tex: km(left) }], blanks: [blk('b2b', 'b1b', `$${km(e.service)} - ${km(after)} = \\square$`, near(left, 1, [e.service + after]), 'Subtract the new reading from the service reading. Line up the decimal points.')] },
    ],
  }
  return { w }
}
const WHO_B = ['Daniel', 'Mei', 'Omar', 'Ingrid', 'Kofi', 'Lucia', 'Arjun', 'Hanna']
function poolB(): B[] {
  const r = rng(654)
  return WHO_B.flatMap((who, i) =>
    [0, 1].map((j): B => {
      const service = (40 + (i % 3) * 10) * 10000 // 40 000, 50 000 or 60 000 km
      const trip = between(r, 3000, 9000) * 10 + 3 + j * 2
      const left = between(r, 8000, 40000)
      return { who, reading: service - trip - left - 7 - i, trip, service }
    }),
  )
}
const idB = (e: B) => `${e.who}${e.reading}${e.trip}`

// ================= c: money left over =================
interface C {
  who: string
  money: number
  items: [string, number][]
}
function mkC(e: C, key: string): It {
  const spent = e.items.reduce((s, [, c]) => s + c, 0)
  const left = e.money - spent
  const sum = e.items.map(([, c]) => money(c)).join(' + ')
  const w: Wp = {
    tex: text(`${e.who} has ${money(e.money)} dollars to spend on school clothes. ${e.who} spends ${money(e.items[0][1])} dollars on ${e.items[0][0]}, ${money(e.items[1][1])} dollars on ${e.items[1][0]} and ${money(e.items[2][1])} dollars on ${e.items[2][0]}. How much is left over?`),
    short: `${money(e.money)},\\ ${e.items.map(([, c]) => money(c)).join(',\\ ')}`,
    key,
    answer: money(left),
    wrong: near(left, 2, [e.money - e.items[0][1] - e.items[1][1], e.money - e.items[2][1]]),
    steps: [
      { label: 'All the money spent.', toks: [{ id: 'c1a', tex: sum }, { id: 'c1g', tex: '=' }, { id: 'c1b', tex: money(spent) }], blanks: [blk('c1b', 's0', `$${sum} = \\square$`, near(spent, 2, [spent - e.items[0][1]]), 'Add the three prices. Line up the decimal points.')] },
      { label: 'The money left over.', toks: [{ id: 'c2a', tex: `${money(e.money)} - ${money(spent)}` }, { id: 'c2g', tex: '=' }, { id: 'c2b', tex: money(left) }], blanks: [blk('c2b', 'c1b', `$${money(e.money)} - ${money(spent)} = \\square$`, near(left, 2, [e.money + spent]), 'Subtract the money spent from the money she started with.')] },
    ],
  }
  return { w }
}
const WHO_C = ['Jonas', 'Hana', 'Pedro', 'Maya', 'Ravi', 'Chloe', 'Samir', 'Elsa']
const GEAR: [string, string, string][] = [['shoes', 'a jacket', 'pants'], ['a backpack', 'a sweater', 'jeans'], ['boots', 'a coat', 'a shirt'], ['sneakers', 'a hoodie', 'shorts']]
function poolC(): C[] {
  const r = rng(987)
  return WHO_C.flatMap((who, i) =>
    [0, 1].map((j): C => {
      const items = GEAR[(i + j) % GEAR.length].map((n): [string, number] => [n, between(r, 2800, 9500) + 3 + j * 4])
      const left = between(r, 1500, 9000) + 2 * i + 1
      return { who, money: items.reduce((s, [, c]) => s + c, 0) + left, items }
    }),
  )
}
const idC = (e: C) => `${e.who}${e.money}`

// ================= d: three prices against the money =================
interface D {
  who: string
  prices: number[]
  money: number
}
function mkD(e: D, key: string): It {
  const total = e.prices.reduce((s, c) => s + c, 0)
  const diff = e.money - total
  const sum = e.prices.map(money).join(' + ')
  const verdict = (d: number) => text(d >= 0 ? `Yes, ${money(d)} dollars are left` : `No, ${money(-d)} dollars are missing`)
  const ans = verdict(diff)
  const bad = uniq([verdict(-diff), verdict(diff + 100), verdict(diff - 10)], (s) => s).filter((s) => s !== ans)
  const w: Wp = {
    tex: text(`${e.who} wants to buy three items that cost ${e.prices.map(money).join(' dollars, ')} dollars. ${e.who} has ${money(e.money)} dollars. Will ${e.who} have enough money to pay for all three items?`),
    short: `${e.prices.map(money).join(',\\ ')},\\ ${money(e.money)}`,
    key,
    answer: ans,
    wrong: bad,
    steps: [
      { label: 'The cost of all three items.', toks: [{ id: 'd1a', tex: sum }, { id: 'd1g', tex: '=' }, { id: 'd1b', tex: money(total) }], blanks: [blk('d1b', 's0', `$${sum} = \\square$`, near(total, 2, [total - e.prices[0]]), 'Add the three prices. Line up the decimal points.')] },
      { label: 'The money she has minus the cost.', toks: [{ id: 'd2a', tex: `${money(e.money)} - ${money(total)}` }, { id: 'd2g', tex: '=' }, { id: 'd2b', tex: money(diff) }], blanks: [blk('d2b', 'd1b', `$${money(e.money)} - ${money(total)} = \\square$`, uniq([money(-diff), ...near(Math.abs(diff), 2, [Math.abs(diff) + 100])], (s) => s).filter((s) => s !== money(diff)), 'Subtract the cost from the money she has. A negative number means the money is not enough.')] },
      { label: 'Is it enough?', toks: [{ id: 'd3a', tex: '\\text{enough?}' }, { id: 'd3b', tex: ans }], blanks: [blk('d3b', 'd2b', `$${money(diff)}$`, bad, 'If the difference is 0 or more she has enough money; if it is negative she does not, and the number tells how much is missing.')] },
    ],
  }
  return { w }
}
const WHO_D = ['Ben', 'Nora', 'Eli', 'Zoe', 'Hugo', 'Ana', 'Theo', 'Ida']
function poolD(): D[] {
  const r = rng(135)
  return WHO_D.flatMap((who, i) =>
    [0, 1].map((j): D => {
      const prices = [0, 1, 2].map(() => between(r, 2, 19) * 100 + [99, 49, 79][between(r, 0, 2)])
      const total = prices.reduce((s, c) => s + c, 0)
      // j = 0: a budget just above the cost (enough), j = 1: just below it (not enough)
      const budget = j === 0 ? Math.ceil((total + 1) / 500) * 500 : Math.floor((total - 1) / 500) * 500
      return { who, prices, money: budget }
    }),
  ).filter((e) => e.money > 0)
}
const idD = (e: D) => `${e.who}${e.prices.join('-')}${e.money}`

const A_ROWS: [string, A, A[]][] = [['a', { who: 'Deborah', what: 'a stereo', cost: 163795, saved: 34721, wk: 16280, n: 6 }, poolA()]]
const B_ROWS: [string, B, B[]][] = [['b', { who: 'Rubina', reading: 360263, trip: 67252, service: 500000 }, poolB()]]
const C_ROWS: [string, C, C[]][] = [['c', { who: 'Ellie', money: 23000, items: [['shoes', 6318], ['a jacket', 7235], ['pants', 4725]] }, poolC()]]
const D_ROWS: [string, D, D[]][] = [['d', { who: 'Kate', prices: [699, 999, 399], money: 2000 }, poolD()]]

// one exercise, four kinds of question: each part is built with its own maker and the parts are joined
const parts = [
  build(10, 'Choose the answer.', A_ROWS, mkA, idA, 'Word problems with decimals', 4010, '3.2'),
  build(10, 'Choose the answer.', B_ROWS, mkB, idB, 'Word problems with decimals', 4011, '3.2'),
  build(10, 'Choose the answer.', C_ROWS, mkC, idC, 'Word problems with decimals', 4012, '3.2'),
  build(10, 'Choose the answer.', D_ROWS, mkD, idD, 'Word problems with decimals', 4013, '3.2'),
]
export const EX_DEC32 = [{ ...parts[0], questions: parts.flatMap((p) => p.questions) }]
