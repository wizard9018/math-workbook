// Export the Crescent Beach question banks (G8, Math 10, Precal-11, Precal-12) for the quiz site: public/bank/g<grade>.json
//   node scripts/export-bank.mjs [bankRoot=C:/Users/wizar/Projects/k12-frontend-worktrees/pet-growth-system/.scratch/crescent-beach]
// Per textbook part (e.g. 6.1 exercise 7a): up to 5 normal (level 1) + 5 harder (level 2) questions. Exercises listed in removed.json are skipped.
// Formulas are written as \( ... \) (toApp is copied from the k12-frontend build script scripts/math-g8-12/build.mjs).
import fs from 'node:fs'
import path from 'node:path'
import { twoChoice, TWO } from './two-choice.mjs'
import { graphLineParts } from './graph-lines.mjs'
import { tableParts } from './value-tables.mjs'
import { markParts, orderParts } from './mark-line.mjs'
import { coordParts } from './coord-points.mjs'
import { graphLinearParts } from './graph-linear.mjs'
import { realLinearParts } from './real-linear.mjs'
import { functionRepParts } from './function-reps.mjs'
import { rateChartParts } from './rate-charts.mjs'
import { rateStoryParts } from './rate-stories.mjs'
import { domainRangeParts, vltParts } from './graph-kinds.mjs'
import { slopeLineParts } from './slope-lines.mjs'
import { interceptLineParts, interceptPlotParts } from './intercepts.mjs'
import { linearStoryParts } from './linear-stories.mjs'
import { graphFormParts } from './graph-forms.mjs'
import { noTiles, TILES } from './no-tiles.mjs'
import { approxRadicals } from './approx-radicals.mjs'
import { piQuestion, PI_FIX } from './pi-fix.mjs'
import { anglePairParts } from './angle-pairs.mjs'

let suspicious = 0
export function toApp(text) {
  // JSON from the generators sometimes swallowed the backslash of a LaTeX command ("\frac" -> form feed + "rac", "\text" -> tab + "ext",
  // "\beta" -> backspace, "\right" -> carriage return, "\neq" -> newline + "eq"): put the backslash back.
  const s = String(text)
    .replace(/\f/g, '\\f')
    .replace(/\x08/g, '\\b')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    .replace(/\n(?=(?:eq\b|abla|ot\b|u\b))/g, '\\n')
    .replace(/\\text\{\s*_+\s*\}/g, '\\underline{\\quad}') // a blank written as \text{___} does not parse in KaTeX
  let out = ''
  let i = 0
  while (i < s.length) {
    const c = s[i]
    if (c === '\\' && s[i + 1] === '$') {
      out += '$'
      i += 2
      continue
    }
    if (c === '$' && s[i + 1] === '$') {
      // $$ ... $$ (display math in the banks) -> an inline KaTeX segment in display style
      const close = s.indexOf('$$', i + 2)
      if (close > 0) {
        out += `\\(\\displaystyle ${s.slice(i + 2, close).trim()}\\)`
        i = close + 2
        continue
      }
    }
    if (c === '$') {
      let end = -1
      if (i + 1 < s.length && !/\s/.test(s[i + 1])) {
        for (let k = i + 1; k < s.length; k++) {
          if (s[k] === '\\') {
            k++
            continue
          }
          if (s[k] === '$' && !/\s/.test(s[k - 1])) {
            end = k
            break
          }
        }
      }
      if (end > 0) {
        const body = s.slice(i + 1, end)
        const bare = body.replace(/\\(?:begin|end)\{[a-z*]+\}/g, '').replace(/\\(?:text|mathrm|textbf|mathbf|operatorname)\{[^}]*\}/g, '').replace(/\\[a-zA-Z]+/g, '')
        // a "formula" containing ordinary words is really "$360,000 ... $" (money signs): leave this $ as a dollar sign
        // (letters with no space inside, $ABCD$ or $wxyz$, are a formula: vertex names or variables)
        if ((/[a-zA-Z]{4,}/.test(bare) && /\s/.test(body)) || /(^|[^\\])\$/.test(body)) {
          suspicious++
        } else {
          out += `\\(${body}\\)`
          i = end + 1
          continue
        }
      }
    }
    out += c
    i++
  }
  return out
}

// a blank written as ____ inside a formula is a subscript to KaTeX: draw it as a line
const T = (t) => toApp(t).replace(/\\\(([\s\S]+?)\\\)/g, (m, b) => '\\(' + b.replace(/_{2,}/g, '\\underline{\\quad}') + '\\)')

// ---- hand-made exercises (instead of the Gemini bank) ----
const BS = String.fromCharCode(92)
const M = (x) => BS + '(' + x + BS + ')'
const isPrime = (n) => { if (n < 2) return false; for (let k = 2; k * k <= n; k++) if (n % k === 0) return false; return true }
// G8 1.1 exercise 4: one number at a time, "is it prime?" (the textbook gives 12 numbers: 0 1 18 19 29 49 59 87 89 97 103 105). 12 questions, each drawn from numbers near the textbook one (never the textbook number itself, except 0 and 1)
const primeQ = (n) => {
  const small = [2, 3, 5, 7, 11, 13].find((p) => n % p === 0 && p !== n)
  const q = `Is ${M(n)} a prime number?`
  if (n === 0) return { q, a: 'No', d: ['Yes'], s: `${M('0')} can be divided by every whole number (and it has no two factors that give a product to make a prime), so it is not prime.`, l: 1 }
  if (n === 1) return { q, a: 'No', d: ['Yes'], s: `${M('1')} has only one factor, itself. A prime number must have exactly two factors, so ${M('1')} is not prime.`, l: 1 }
  if (isPrime(n)) return { q, a: 'Yes', d: ['No'], s: `${M(n)} is not divisible by any whole number other than ${M('1')} and ${M(n)} (check the primes up to ${M(Math.floor(Math.sqrt(n)))}), so it is prime.`, l: 1 }
  return { q, a: 'No', d: ['Yes'], s: `${M(n)} = ${M(small)} ${M(BS + 'times')} ${M(n / small)}, so it has a factor other than ${M('1')} and itself. It is composite, not prime.`, l: 1 }
}
const TEXTBOOK_PRIME_NUMBERS = [0, 1, 18, 19, 29, 49, 59, 87, 89, 97, 103, 105]
const primeParts = () => TEXTBOOK_PRIME_NUMBERS.map((t, i) => {
  const pool = []
  for (let k = 1; pool.length < 6 && k < 60; k++) for (const n of [t + k, t - k]) if (n >= 2 && !TEXTBOOK_PRIME_NUMBERS.includes(n) && pool.length < 6) pool.push(n)
  if (t <= 1) pool.splice(0, 1, t) // 0 and 1 are the special cases: they stay in their own questions
  const withPrime = pool.some(isPrime) ? pool : [...pool.slice(0, 5), pool.find((n) => n > 10 && isPrime(n)) ?? 13]
  return { p: 'abcdefghijkl'[i], qs: withPrime.map(primeQ) }
})

// G8 2.1 exercises 4 and 5 (graph integers on a number line): "which number line shows ...?" with the number lines drawn as the choices.
const LO = -6, HI = 6
const nlX = (v) => 50 + (v - LO) * (360 / (HI - LO))
const nlSvg = (set, arrows = true) => {
  const col = '#0284c7'
  let t = ''
  for (let v = LO; v <= HI; v++) t += `<line x1="${nlX(v)}" y1="30" x2="${nlX(v)}" y2="42" stroke="#475569" stroke-width="2"/><text x="${nlX(v)}" y="60" text-anchor="middle" font-size="13" fill="#334155">${v}</text>`
  let d = ''
  for (const v of [...set].sort((a, b) => a - b)) d += `<circle cx="${nlX(v)}" cy="36" r="6" fill="${col}"/>`
  // an arrow (a thick ray and a big head) beyond the last tick, clear of the dot, when the dots go on for ever
  if (arrows && set.has(LO)) d += `<line x1="${nlX(LO)}" y1="36" x2="34" y2="36" stroke="${col}" stroke-width="5"/><polygon points="10,36 34,25 34,47" fill="${col}"/>`
  if (arrows && set.has(HI)) d += `<line x1="${nlX(HI)}" y1="36" x2="426" y2="36" stroke="${col}" stroke-width="5"/><polygon points="450,36 426,25 426,47" fill="${col}"/>`
  return `<svg viewBox="0 0 460 66" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:420px;height:auto"><line x1="8" y1="36" x2="452" y2="36" stroke="#475569" stroke-width="2"/>${t}${d}</svg>`
}
const range = (f) => new Set(Array.from({ length: HI - LO + 1 }, (_, i) => LO + i).filter(f))
const key = (st) => [...st].sort((a, b) => a - b).join(',')
// kinds: list (given numbers), gt, ge, lt, le, between (a < x < b), outside (x < a or x > b); lo/hi strictness chosen by the symbol
const nlQuestion = (k, sym) => {
  const word = { gt: 'greater than', ge: 'greater than or equal to', lt: 'less than', le: 'less than or equal to' }
  if (k.t === 'list') return { q: `Which number line shows the integers ${k.v.map((n) => M(n)).join(', ')}?`, set: new Set(k.v), s: `Put a dot on each of ${k.v.map((n) => M(n)).join(', ')}.` }
  const test = { gt: (x) => x > k.n, ge: (x) => x >= k.n, lt: (x) => x < k.n, le: (x) => x <= k.n }[k.t]
  if (k.t === 'between') return { q: sym ? `Which number line graphs the integers that satisfy ${M(`${k.a} ${k.ca ? BS + 'le' : '<'} x ${k.cb ? BS + 'le' : '<'} ${k.b}`)}?` : `Which number line shows the integers greater than ${k.a} and less than ${k.b}?`, set: range((x) => (k.ca ? x >= k.a : x > k.a) && (k.cb ? x <= k.b : x < k.b)), s: `The dots start ${k.ca ? 'at' : 'just after'} ${M(k.a)} and stop ${k.cb ? 'at' : 'just before'} ${M(k.b)}.`, k }
  if (k.t === 'outside') return { q: `Which number line shows the integers less than ${k.a} or greater than ${k.b}?`, set: range((x) => x < k.a || x > k.b), s: `Dots to the left of ${M(k.a)} (not on it) and to the right of ${M(k.b)} (not on it).`, k }
  const txt = { gt: '>', ge: BS + 'ge', lt: '<', le: BS + 'le' }[k.t]
  return { q: sym ? `Which number line graphs the integers that satisfy ${M(`x ${txt} ${k.n}`)}?` : `Which number line shows the integers ${word[k.t]} ${M(k.n)}?`, set: range(test), s: `${k.t === 'gt' || k.t === 'lt' ? 'The number' : 'The number'} ${M(k.n)} ${k.t === 'gt' || k.t === 'lt' ? 'is not' : 'is'} included; the dots go ${k.t[0] === 'g' ? 'to the right' : 'to the left'} from there.`, k }
}
const nlWrong = (q) => {
  const mirror = (st) => new Set([...st].map((x) => -x))
  const comp = (st) => range((x) => !st.has(x))
  const out = [mirror(q.set), comp(q.set)]
  const shiftEnds = (st, d) => range((x) => st.has(x - d))
  out.push(shiftEnds(q.set, 1), shiftEnds(q.set, -1), comp(mirror(q.set)))
  // one dot changed
  const first = [...q.set].filter((x) => x > LO && x < HI)
  if (first.length) { const c = new Set(q.set); c.delete(first[0]); out.push(c); const e = new Set(q.set); e.add(first[0] + 1 > HI ? first[0] - 1 : first[0] + 1); out.push(e) }
  const seen = new Set([key(q.set)])
  return out.filter((st) => st.size && !seen.has(key(st)) && seen.add(key(st))).slice(0, 3)
}
const nlPart = (p, ks, sym) => ({ p, qs: ks.map((k) => { const q = nlQuestion(k, sym); const wr = nlWrong(q); if (wr.length < 3) return null; return { q: q.q, a: nlSvg(q.set, k.t !== 'list'), d: wr.map((w) => nlSvg(w, k.t !== 'list')), s: q.s, l: 1 } }).filter(Boolean) })
const lists = [[-3, 0, 4], [-5, -1, 2], [-2, 1, 5], [0, 3, -4], [-4, -2, 3], [1, 4, -1], [-5, 2, 3], [-1, 0, 5]]
const nums = (a) => [2, -1, 0, 3, -3, 1, 4, -2].map((x, i) => (i + a) % 8).map((i) => [2, -1, 0, 3, -3, 1, 4, -2][i])
const exo4 = () => [
  nlPart('a', lists.map((v) => ({ t: 'list', v }))),
  nlPart('b', nums(0).map((n) => ({ t: 'gt', n }))),
  nlPart('c', nums(3).map((n) => ({ t: 'le', n }))),
  nlPart('d', [[-1, 3], [-3, 1], [0, 4], [-4, 0], [-2, 2], [1, 5], [-5, -1], [-3, 3]].map(([a, b]) => ({ t: 'between', a, b }))),
  nlPart('e', [[-3, 2], [-2, 3], [-4, 1], [0, 4], [-1, 2], [-2, 1], [-3, 0], [-4, 3]].map(([a, b]) => ({ t: 'outside', a, b }))),
]

// G8 2.1 exercise 4: drag numbers / dots onto the number line (place-line.tsx), from LO to HI
const placeQ = (k, sym = false) => {
  const q = nlQuestion(k, sym)
  const ticks = [...q.set].sort((a, b) => a - b)
  const a = ticks.map((n) => M(n)).join(', ')
  if (k.t === 'list') return { q: `Graph the integers ${k.v.map((n) => M(n)).join(', ')} on the number line: drag each number onto its place.`, a, d: [], s: q.s, l: 1, p: { lo: LO, hi: HI, chips: k.v.map(String), at: k.v } }
  return { q: q.q.replace('Which number line shows', 'Graph').replace('Which number line graphs', 'Graph').replace('?', ` on the number line from ${M(LO)} to ${M(HI)}: drag a dot onto each of these integers.`), a, d: [], s: q.s, l: 1, p: { lo: LO, hi: HI, chips: ticks.map(() => ''), at: ticks } }
}
const exo4p = () => {
  const ks = [
    lists.map((v) => ({ t: 'list', v })),
    nums(0).map((n) => ({ t: 'gt', n })),
    nums(3).map((n) => ({ t: 'le', n })),
    [[-1, 3], [-3, 1], [0, 4], [-4, 0], [-2, 2], [1, 5], [-5, -1], [-3, 3]].map(([a, b]) => ({ t: 'between', a, b })),
    [[-3, 2], [-2, 3], [-4, 1], [0, 4], [-1, 2], [-2, 1], [-3, 0], [-4, 3]].map(([a, b]) => ({ t: 'outside', a, b })),
  ]
  return ks.map((list, i) => ({ p: 'abcde'[i], qs: list.map(placeQ) }))
}
// G8 2.1 exercise 5 as a drawing: drag a dot onto every integer that satisfies the inequality
const exo5p = () => [
  ['a', nums(1), 'gt'], ['b', nums(4), 'ge'], ['c', nums(6), 'lt'], ['d', nums(2), 'le'],
].map(([p, ns, t]) => ({ p, qs: ns.map((n) => placeQ({ t, n }, true)) })).concat([{ p: 'e', qs: [[-3, 4, 1, 0], [-2, 3, 1, 0], [-4, 2, 1, 0], [-1, 5, 1, 0], [0, 4, 1, 0], [-5, 1, 1, 0], [-3, 1, 1, 0], [-2, 5, 1, 0]].map(([a, b, ca, cb]) => placeQ({ t: 'between', a, b, ca: !!ca, cb: !!cb }, true)) }])
const exo5 = () => [
  nlPart('a', nums(1).map((n) => ({ t: 'gt', n })), true),
  nlPart('b', nums(4).map((n) => ({ t: 'ge', n })), true),
  nlPart('c', nums(6).map((n) => ({ t: 'lt', n })), true),
  nlPart('d', nums(2).map((n) => ({ t: 'le', n })), true),
  nlPart('e', [[-3, 4, 1, 0], [-2, 3, 1, 0], [-4, 2, 1, 0], [-1, 5, 1, 0], [0, 4, 1, 0], [-5, 1, 1, 0], [-3, 1, 1, 0], [-2, 5, 1, 0]].map(([a, b, ca, cb]) => ({ t: 'between', a, b, ca: !!ca, cb: !!cb })), true),
]

// G8 2.1 exercise 3 (order integers): drag the numbers onto a number line (sort-line.tsx). Four integers per question, like the textbook parts:
// a: a mix with 0, b: negatives and 0, c: two opposite pairs, d: all negative.
const sortParts = () => {
  const mk = (gen) => {
    const seen = new Set()
    const qs = []
    for (let i = 0; qs.length < 10 && i < 400; i++) {
      const r = (k) => { const h = hash(`${gen.name}${i}${k}`); return h }
      const xs = gen(r)
      const key = [...xs].sort((a, b) => a - b).join(',')
      if (new Set(xs).size !== xs.length || seen.has(key)) continue
      const order = xs.map((_, j) => j).sort((a, b) => xs[a] - xs[b])
      if (order.every((v, j) => v === j)) continue // already in order: nothing to drag
      seen.add(key)
      const sorted = order.map((j) => xs[j])
      qs.push({ q: 'Put the integers in order from least to greatest: drag each one onto the number line.', a: sorted.map((n) => M(n)).join(', '), d: [], s: `The smaller a number is, the further left it is on the number line. From least to greatest: ${sorted.map((n) => M(n)).join(', ')}.`, l: 1, o: { items: xs.map(String), order } })
    }
    return qs
  }
  const pick = (r, k, lo, hi) => lo + (r(k) % (hi - lo + 1))
  const gens = {
    a: function a(r) { return [-pick(r, 1, 1, 9), 0, -pick(r, 2, 1, 9), pick(r, 3, 1, 9)].sort((x, y) => r(x + 50) - r(y + 50)) },
    b: function b(r) { return [-pick(r, 1, 1, 9), -pick(r, 2, 1, 9), -pick(r, 3, 1, 9), 0].sort((x, y) => r(x + 51) - r(y + 51)) },
    c: function c(r) { const x = pick(r, 1, 1, 9), y = pick(r, 2, 1, 9); return [-x, x, -y, y].sort((p, q) => r(p + 52) - r(q + 52)) },
    d: function d(r) { return [-pick(r, 1, 1, 9), -pick(r, 2, 1, 9), -pick(r, 3, 1, 9), -pick(r, 4, 1, 9)] },
  }
  return Object.entries(gens).map(([p, g]) => ({ p, qs: mk(g) }))
}
const WORD_PROBLEM = /word problem|application|real-world|real-life|scenario|in context|modell?ing/i // type names of word problems

// Chapter review built from the section banks, one exercise per textbook review exercise (review exercise -> [out part letter, section, exercise, part]).
// The review exercises are the same types as the section exercises, so their questions are reused. G8 chapter 2 (the pattern exercise, review 3, was removed).
const REVIEW_MAP = {
  // G8 chapter 3 (review 1-4, the nets and counting squares, and 9, the nets: not in the bank)
  'G8|3': [
    [5, [['a', 2, 1, 'a'], ['b', 2, 1, 'b'], ['c', 2, 2, 'a'], ['d', 2, 2, 'c']]],
    [6, [['a', 3, 5, 'a'], ['b', 3, 5, 'b'], ['c', 3, 5, 'c'], ['d', 3, 5, 'd']]],
    [7, [['a', 2, 3, 'f'], ['b', 2, 3, 'g'], ['c', 2, 3, 'h']], 'Effect of scaling dimensions on surface area'],
    [8, [['a', 3, 9, 'g'], ['b', 3, 9, 'h'], ['c', 3, 9, 'i'], ['d', 3, 9, 'j']], 'Effect of scaling dimensions on volume'],
    [10, [['a', 4, 3, 'a'], ['b', 4, 3, 'b']]],
    [11, [['a', 4, 6, 'a'], ['b', 4, 6, 'b']]],
    [12, [['a', 6, 2, 'a'], ['b', 6, 2, 'b']]],
    [13, [['a', 6, 3, 'a'], ['b', 6, 3, 'b']]],
    [14, [['a', 7, 1, 'a'], ['b', 7, 1, 'b'], ['c', 7, 1, 'c'], ['d', 7, 1, 'd']]],
    [15, [['a', 7, 3, 'a']]],
  ],
  'G8|2': [
    [1, [['a', 1, 1, 'a'], ['b', 1, 1, 'b']]],
    [2, [['a', 1, 4, 'c'], ['b', 1, 4, 'b'], ['c', 1, 4, 'd'], ['d', 1, 5, 'b']]],
    [4, [['a', 1, 8, 'a'], ['b', 1, 8, 'b']]],
    [5, [['a', 2, 1, 'a'], ['b', 2, 1, 'b'], ['c', 2, 1, 'c'], ['d', 2, 1, 'd'], ['e', 2, 1, 'e'], ['f', 2, 1, 'g']]],
    [6, [['a', 2, 3, 'a'], ['c', 2, 3, 'b'], ['e', 2, 3, 'c'], ['g', 2, 3, 'e']]],
    [7, [['a', 2, 5, 'a'], ['c', 2, 5, 'c']]],
    [8, [['a', 2, 6, 'a'], ['c', 2, 6, 'c']]],
    [9, [['a', 3, 3, 'a'], ['b', 3, 3, 'b'], ['c', 3, 3, 'c'], ['d', 3, 3, 'd']]],
    [10, [['a', 3, 2, 'a'], ['b', 3, 2, 'b'], ['c', 3, 4, 'a'], ['d', 3, 4, 'b'], ['e', 3, 4, 'c'], ['f', 3, 4, 'd'], ['g', 3, 5, 'a'], ['h', 3, 5, 'b'], ['i', 3, 5, 'c'], ['j', 3, 5, 'd']]],
    [11, [['a', 4, 1, 'a'], ['b', 4, 1, 'b'], ['c', 4, 1, 'c'], ['d', 4, 1, 'd'], ['e', 4, 1, 'e'], ['f', 4, 1, 'f']]],
    [12, 'abcdefghij'.split('').map((l) => [l, 4, 2, l])],
    [13, [['a', 4, 8, 'a'], ['b', 4, 8, 'b'], ['c', 4, 8, 'c'], ['d', 4, 8, 'd']]],
    [14, 'abcdef'.split('').map((l) => [l, 4, 10, l])],
  ],
}
const GEN_MAP = fs.existsSync(new URL('./review-map.json', import.meta.url)) ? JSON.parse(fs.readFileSync(new URL('./review-map.json', import.meta.url), 'utf8')) : {} // gen-review-map.mjs
// exercises whose answers are inequalities in one letter: the student graphs the answer on a number line (ineq-line.tsx) when it can be drawn (bank-data.ts ineqSpec)
const GRAPH_IQ = new Set(['11|4.4|3', '11|4.4|2', '11|5.5|2', '11|3.4|4', '11|3.4|5', '12|2.3|1', '12|2.4|11', '12|2.4|13', '12|2.5|3', '12|4.1|6', '12|4.5|10', '12|5.6|17', '12|4.2|5', '12|3.2|4', '12|3.5|8', '12|1.5|7', '12|1.5|10', '10|4.3|8'])
// a figure of "the part outside the circle is shaded" (a square with a circle in it, a hole, a part cut out): Gemini drew the whole polygon filled and the circle only as a
// line, so the circle is not a hole. The circles of such a figure are filled white (drawn after the polygon).
const HOLE_WORDS = /outside the circle|outside the circles|outside the (?:circular )?hole|circular hole|circle(?:s)? (?:is|are) (?:cut|removed|taken)|cut out of|circle(?:s)? (?:is|are) removed|holes?/i
const HOLES = { fixed: 0 }
const fixHoles = (q) => {
  const els = q.f?.elements
  if (!Array.isArray(els) || !HOLE_WORDS.test(q.q)) return
  if (!els.some((e) => e.t === 'polygon' && e.fill && e.fill !== '#ffffff')) return
  let any = false
  for (const e of els) if (e.t === 'circle' && !e.fill) { e.fill = '#ffffff'; any = true }
  if (any) HOLES.fixed++
}
// "The shaded figure is a rectangle with a semicircle on top": only the rectangle was filled; the arcs (semicircle, quarter circle, sector) of such a figure get the same fill
const ARC_WORDS = /semi-?circle|half.?circle|quarter.?circle|sector|arc/i
const ARCS = { fixed: 0 }
const fixArcs = (q) => {
  const els = q.f?.elements
  if (!Array.isArray(els) || !/shaded/i.test(q.q) || !ARC_WORDS.test(q.q)) return
  const poly = els.find((e) => e.t === 'polygon' && e.fill && e.fill !== '#ffffff')
  const arcs = els.filter((e) => e.t === 'ellipse' && e.a0 !== undefined && e.a1 !== undefined && !e.fill && !e.dashed)
  if (!poly || !arcs.length) return
  for (const e of arcs) e.fill = poly.fill
  ARCS.fixed++
}
const reviewFromSections = (map, sections) => map.map(([no, parts, label]) => {
  let name = label ?? ''
  const out = parts.map(([lt, sec, exNo, pl]) => {
    const e = sections.find((x) => x.no === sec)?.exercises.find((x) => x.no === exNo)
    if (e && !name) name = e.name
    const part = e?.parts.find((x) => x.p === pl)
    return part ? { ...part, p: lt } : null
  }).filter(Boolean)
  return { no, name, parts: out }
}).filter((e) => e.parts.length)
// wording the user asked to change, per exercise: text between parentheses taken out of the question
const QUESTION_FIXES = { 'G8|3|3|6': (q) => q.replace(/\s*\(with columns\s*\\\([\s\S]*?\\\)\)/g, '') }

// questions Gemini wrote from the textbook pictures (gen-angles.py): one part per textbook part letter
const figureFileParts = (rel) => {
  const items = JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'))
  const byPart = new Map()
  for (const it of items) {
    if (!it.a || !Array.isArray(it.d) || it.d.length !== 3) continue
    const d = it.d.map(T)
    const a = T(it.a)
    if (new Set([a, ...d]).size !== 4) continue
    const list = byPart.get(it.part) ?? []
    list.push({ q: T(it.q), a, d, s: it.solution ? T(it.solution) : '', l: it.level, ...(it.figure ? { f: it.figure } : {}) })
    byPart.set(it.part, list)
  }
  return [...byPart].sort((x, y) => x[0].localeCompare(y[0])).map(([p, qs]) => ({ p, qs }))
}
const MERGES = { 'Math 10|5|3': [[6, 7, 8, 9, 10, 11, 12, 13]], 'Math 10|5|2': [[9, 10, 11, 12, 13, 14, 15, 16, 17, 18]], 'Math 10|4|3': [[7, 8, 9, 10, 11, 12, 13, 14]], 'Math 10|4|4': [[4, 5, 6, 7, 8, 9, 10, 11, 12, 13]], 'Math 10|4|2': [[9, 10, 11, 12, 13, 14]], 'Math 10|2|4': [[12, 13, 14, 15, 16, 17, 18]], 'Math 10|2|3': [[7, 8, 9, 10]], 'Math 10|1|3': [[5, 6, 7, 8, 9, 10]], 'Math 10|1|6': [[11, 12, 13, 14, 15, 16, 17, 18, 19, 20]], 'G8|1|1': [[9, 10, 11, 12, 13, 14]], 'G8|1|2': [[5, 6, 7, 8, 9, 10, 11, 12, 13]], 'G8|1|6': [[7, 8, 9, 10, 11, 12, 13, 14]], 'G8|2|2': [[10, 11, 12, 13, 14, 15]], 'G8|3|2': [[3, 4, 5, 6, 7, 8, 9, 10]], 'G8|3|3': [[9, 10, 11, 12, 13, 14, 15]], 'G8|3|4': [[7, 8, 9, 10, 11, 12, 13, 14]], 'G8|3|5': [[7, 8, 9, 10, 11, 12, 13, 14]], 'G8|6|5': [Array.from({ length: 20 }, (_, i) => i + 1)], 'G8|4|2': [[4, 5, 6, 7, 8, 9]], 'G8|4|6': [[1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11, 12, 13, 14, 15, 16]] }
const OVERRIDES = { 'G8|1|1|4': { name: 'Is it a prime number?', parts: primeParts }, 'G8|3|7|1': { name: 'Determine triangle congruence', parts: () => figureFileParts('bank/G8-ch3/cong7_1/final.json') }, 'G8|3|7|2': { name: 'Complete congruence statement', parts: () => figureFileParts('bank/G8-ch3/cong7_2/final.json') }, 'G8|3|6|3': { name: 'Find missing angles with geometric reasons', parts: () => figureFileParts('bank/G8-ch3/angles3/final.json') }, 'G8|3|6|1': { name: 'Identify angle pairs', parts: () => anglePairParts(hash) }, 'G8|2|1|3': { name: 'Order integers', parts: sortParts }, 'G8|2|1|4': { name: 'Graph integers on a number line', parts: exo4p }, 'G8|2|1|5': { name: 'Graph integer inequalities', parts: exo5p }, ...Object.fromEntries([8, 9, 10, 11, 14, 15, 16, 17, 18].map((n) => [`Math 10|3|2|${n}`, { name: ({ 8: 'Represent a function given by a table', 9: 'Represent a constant function given by a table', 10: 'Represent a function given by a graph', 11: 'Represent a function given by a graph', 14: 'Represent a function given by ordered pairs', 15: 'Represent a constant function given by ordered pairs', 16: 'Function notation: trading in cars', 17: 'Function notation: land values', 18: 'Function notation: diet plan' })[n], parts: () => functionRepParts(hash, n) }])), ...Object.fromEntries([5, 6, 7, 8, 9, 10, 11, 12].map((n) => [`Math 10|3|3|${n}`, { name: ({ 5: 'Graph and estimate: value of a computer', 6: 'Graph and estimate: coffee consumption', 7: 'Graph and estimate: value of a car', 8: 'Graph and estimate: temperature', 9: 'Graph: nickels and dimes', 10: 'Fourth vertex of a parallelogram', 11: 'Graph and estimate: Sudoku time', 12: 'Graph: gears' })[n], parts: () => realLinearParts(hash, n) }])), 'Math 10|3|3|4': { name: 'Graph linear equations', parts: () => graphLinearParts(hash) }, ...Object.fromEntries([[15, 'Water tower'], [16, 'Wedding costs'], [17, 'Rental rates'], [18, 'Typing rates']].map(([n, t]) => [`Math 10|4|2|${n}`, { name: `Rates of change: ${t}`, parts: () => rateStoryParts(hash, n) }])), 'Math 10|4|3|1': { name: 'Graph a line given a point and the slope', parts: () => slopeLineParts(hash) }, 'Math 10|5|1|10': { name: 'Graph linear equations in any form', parts: () => graphFormParts(hash) }, 'Math 10|4|3|4': { name: 'Draw a line given the slope and an intercept', parts: () => interceptLineParts(hash) }, 'Math 10|4|3|5': { name: 'Plot the intercepts of a line', parts: () => interceptPlotParts(hash) }, ...Object.fromEntries([[1, 'repair shop'], [2, 'car depreciation'], [3, 'spring'], [4, 'apartment building'], [5, 'taxi fare']].map(([n, t]) => [`Math 10|4|5|${n}`, { name: `Linear relation: ${t}`, parts: () => linearStoryParts(hash, n) }])), 'Math 10|3|1|10': { name: 'Domain and range from a graph', parts: () => domainRangeParts(hash) }, 'Math 10|3|2|6': { name: 'Vertical line test', parts: () => vltParts(hash) }, 'Math 10|4|2|4': { name: 'Rate of change from a graph', parts: () => rateChartParts(hash) }, 'Math 10|3|1|2': { name: 'Plot points on a coordinate grid', parts: () => coordParts(hash, 'plot') }, 'Math 10|3|1|3': { name: 'Identify coordinates of points', parts: () => coordParts(hash, 'coord') }, 'Math 10|1|4|8': { name: 'Order irrational numbers on a number line', parts: () => orderParts(hash) }, 'Math 10|1|4|6': { name: 'Estimate irrational numbers on a number line', parts: () => markParts(hash) }, 'G8|5|6|5': { name: 'Complete a table of values', parts: () => tableParts(hash) }, 'G8|5|6|6': { name: 'Graph a linear equation', parts: () => graphLineParts(hash) } }
const RESTORE = [...Array.from({ length: 20 }, (_, i) => `G8|6|5|${i + 1}`), 'G8|4|3|2', 'G8|3|6|1', 'G8|2|1|2', 'G8|2|1|4', 'G8|2|1|5'] // taken back out of removed.json: the number line exercises

const root = process.argv[2] ?? 'C:/Users/wizar/Projects/k12-frontend-worktrees/pet-growth-system/.scratch/crescent-beach'
const readJson = (f) => JSON.parse(fs.readFileSync(f, 'utf8'))
const removed = new Set(readJson(path.join(root, 'removed.json')))
for (const r of RESTORE) removed.delete(r)
for (const r of ['G8|2|2|8', 'G8|2|2|9', 'G8|5|4|5', 'Math 10|1|2|16', 'Math 10|1|2|17', 'Math 10|1|2|18', 'Math 10|1|2|19', 'Math 10|2|2|7', 'Math 10|2|4|19', 'Math 10|3|1|4', 'Math 10|3|1|5', 'Math 10|3|1|6', 'Math 10|3|1|9', 'Math 10|4|2|3']) removed.add(r) // taken out by the user, on top of removed.json
const titles = readJson(path.join(root, 'agent-tasks/section-titles.json'))
const BOOKS = [
  { dir: 'G8', grade: 8, skip: [7, 8] },
  { dir: 'Math 10', grade: 10, skip: [7] },
  { dir: 'Precal-11', grade: 11, skip: [] },
  { dir: 'Precal-12', grade: 12, skip: [] },
]
const KINDS = ['final', 'figure-final', 'figure-geo-final']
const only = process.argv.slice(3)
const LIM = 5
// deterministic order (no Math.random): rebuilding gives the same file
const hash = (s) => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0; return h }

for (const book of BOOKS) {
  if (only.length && !only.includes(String(book.grade))) continue
  const chapters = []
  let nq = 0
  const chs = fs.readdirSync(path.join(root, 'bank')).filter((d) => d.startsWith(`${book.dir}-ch`) && /-ch\d+$/.test(d)).map((d) => Number(d.split('-ch')[1])).sort((a, b) => a - b)
  for (const ch of chs) {
    if (book.skip.includes(ch)) continue
    const base = path.join(root, 'bank', `${book.dir}-ch${ch}`)
    const pool = new Map() // "sec|no|part" -> {1:[],2:[]}
    for (const kind of KINDS) {
      const kd = path.join(base, kind)
      if (!fs.existsSync(kd)) continue
      for (const sd of fs.readdirSync(kd)) for (const f of fs.readdirSync(path.join(kd, sd))) {
        if (!/^type-\d+\.json$/.test(f)) continue
        for (const it of readJson(path.join(kd, sd, f))) {
          const m = /^(\d+)\.(\d+) exercise (\d+)([a-z]*)/.exec(it.source ?? '')
          if (!m || !it.a || !Array.isArray(it.d) || it.d.length !== 3 || (it.level !== 1 && it.level !== 2)) continue
          const k = `${m[2]}|${m[3]}|${m[4]}`
          const slot = pool.get(k) ?? { 1: [], 2: [] }
          slot[it.level].push(it)
          pool.set(k, slot)
        }
      }
    }
    const sections = []
    for (const sd of fs.readdirSync(base).filter((d) => /^s\d+$/.test(d)).sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)))) {
      const sec = Number(sd.slice(1))
      const ip = path.join(base, sd, 'items.json')
      if (!fs.existsSync(ip)) continue
      const ij = readJson(ip)
      const items = ij.items
      const typeName = new Map((ij.types ?? []).map((t) => [t.id, t.name]))
      const nos = [...new Set(items.map((i) => String(i.no)))].sort((a, b) => parseInt(a) - parseInt(b))
      const exercises = []
      for (const no of nos) {
        if (removed.has(`${book.dir}|${ch}|${sec}|${no}`)) continue
        const ov = OVERRIDES[`${book.dir}|${ch}|${sec}|${no}`]
        if (ov) { exercises.push({ no: Number(no), name: ov.name, parts: ov.parts() }); continue }
        const parts = []
        for (const part of [...new Set(items.filter((i) => String(i.no) === no).map((i) => i.part ?? ''))].sort()) {
          const slot = pool.get(`${sec}|${no}|${part}`)
          if (!slot) continue
          const seen = new Set()
          const qs = []
          for (const lv of [1, 2]) {
            const cand = [...slot[lv]].sort((a, b) => hash(a.q) - hash(b.q))
            let n = 0
            for (const it of cand) {
              if (n >= LIM || seen.has(it.q)) continue
              seen.add(it.q)
              n++
              const d = it.d.map(T)
              const a = T(it.a)
              if (new Set([a, ...d]).size !== 4) continue
              const pf = piQuestion(T(it.q), a, d, it.solution ? T(it.solution) : '')
              if (pf) { qs.push({ ...pf, l: lv, ...(it.figure ? { f: it.figure } : {}) }); continue }
              qs.push({ q: (QUESTION_FIXES[`${book.dir}|${ch}|${sec}|${no}`] ?? ((x) => x))(T(it.q)), a, d, s: it.solution ? T(it.solution) : '', l: lv, ...(it.figure ? { f: it.figure } : {}) })
            }
          }
          if (qs.length) parts.push({ p: part, qs })
        }
        if (parts.length) exercises.push({ no: Number(no), name: typeName.get(items.find((i) => String(i.no) === no)?.type_id) ?? '', parts })
      }
      // exercises the user asked to merge into one (the parts of the later ones follow the first one's, lettered a, b, c ...)
      const mergeInto = (hit) => {
        if (hit.length < 2) return
        const label = (i) => (i < 26 ? 'abcdefghijklmnopqrstuvwxyz'[i] : String(i + 1))
        const parts = hit.flatMap((e) => e.parts).map((p, i) => ({ ...p, p: label(i) }))
        const at = exercises.indexOf(hit[0])
        exercises.splice(at, 1, { ...hit[0], parts })
        for (const e of hit.slice(1)) exercises.splice(exercises.indexOf(e), 1)
      }
      for (const group of MERGES[`${book.dir}|${ch}|${sec}`] ?? []) mergeInto(exercises.filter((e) => group.includes(e.no)))
      // every section: the word problems at its end (consecutive exercises whose type name says "word problem") become one exercise
      // (also the ones in the middle of the section: all of them become one, at the place of the first)
      // (Grade 8 only: in the other grades a name like "... in context" also names ordinary exercises, so they are merged only where MERGES says so)
      if (book.grade === 8) mergeInto(exercises.filter((e) => WORD_PROBLEM.test(e.name ?? '')))
      if (exercises.length) sections.push({ no: sec, title: titles[`${book.dir}|${ch}|${sec}`] ?? `Section ${ch}.${sec}`, exercises })
    }
    // chapter review: the chapter test questions (one part per textbook section), as the last section of the chapter
    const ctp = path.join(base, 'chapter-test-final.json')
    const rmap = REVIEW_MAP[`${book.dir}|${ch}`] ?? GEN_MAP[`${book.dir}|${ch}`]
    if (sections.length && rmap) {
      const exs = reviewFromSections(rmap, sections)
      sections.push({ no: Math.max(...sections.map((x) => x.no)) + 1, title: 'Chapter review', exercises: exs })
    } else if (sections.length && fs.existsSync(ctp)) {
      const bySec = new Map()
      for (const it of readJson(ctp)) {
        if (!it.a || !Array.isArray(it.d) || it.d.length !== 3) continue
        const d = it.d.map(T)
        const a = T(it.a)
        if (new Set([a, ...d]).size !== 4) continue
        const list = bySec.get(it.section) ?? []
        list.push({ q: T(it.q), a, d, s: it.solution ? T(it.solution) : '', l: it.difficulty === 'easy' ? 1 : 2 })
        bySec.set(it.section, list)
      }
      const parts = [...bySec].sort((x, y) => parseFloat(x[0].split('.')[1]) - parseFloat(y[0].split('.')[1])).map(([, qs], i) => ({ p: 'abcdefghijklmnopqrstuvwxyz'[i], qs }))
      if (parts.length) sections.push({ no: Math.max(...sections.map((x) => x.no)) + 1, title: 'Chapter review', exercises: [{ no: 1, name: 'Chapter review', parts }] })
    }
    if (sections.length) chapters.push({ no: ch, sections })
    nq += sections.reduce((s, x) => s + x.exercises.reduce((t, e) => t + e.parts.reduce((u, p) => u + p.qs.length, 0), 0), 0)
  }
  // Math 10 1.4 exercise 3: without a calculator, to 1 decimal place (approx-radicals.mjs)
  for (const c of chapters) for (const sc of c.sections) for (const e of sc.exercises) if (book.grade === 10 && c.no === 1 && sc.no === 4 && e.no === 3) { e.parts = approxRadicals(e.parts); e.name = 'Approximating Radicals Without a Calculator' }
  for (const c of chapters) for (const sc of c.sections) for (const e of sc.exercises) for (const p of e.parts) for (const q of p.qs) { noTiles(q); fixHoles(q); fixArcs(q); twoChoice(q); if (GRAPH_IQ.has(`${book.grade}|${c.no}.${sc.no}|${e.no}`)) q.iq = 1 }
  const out = path.join('public', 'bank', `g${book.grade}.json`)
  fs.writeFileSync(out, JSON.stringify({ grade: book.grade, book: book.dir, chapters }))
  console.log(`${out}: ${chapters.length} chapters, ${chapters.reduce((s, c) => s + c.sections.length, 0)} sections, ${nq} questions, ${Math.round(fs.statSync(out).size / 1024)} KB`)
}
console.log(`plain dollar signs left: ${suspicious}`)
console.log('pi answers:', JSON.stringify(PI_FIX))
console.log('two-choice questions:', TWO.converted)
console.log('tile questions:', JSON.stringify(TILES))
console.log('hole figures filled white:', HOLES.fixed, '| arcs filled:', ARCS.fixed)
