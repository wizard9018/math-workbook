// G8 5.6 exercise 5 (complete a table of values for a linear equation): the student types the missing numbers into the table (fill-table.tsx; field `fl`).
// Made here from the equations (no Gemini): the table values are computed. The old questions had the table as a raw text table, which did not display.
// Parts: a x + y = k, b y = m x + c, c x - y = k, d a x + y = k, e y = m x + c with some y given (find x), f a x + b y = k with whole values (harder).
// Imported by: export-bank.mjs.
import { slopeForm } from './graph-lines.mjs'
const BS = String.fromCharCode(92)
const M = (x) => BS + '(' + x + BS + ')'
const std = (A, B, k) => `${A === 1 ? '' : A === -1 ? '-' : A}x ${B < 0 ? '- ' : '+ '}${Math.abs(B) === 1 ? '' : Math.abs(B)}y = ${k}`
const num = (n) => (n < 0 ? '-' : '') + Math.abs(n)

export function tableParts(hash) {
  const pick = (seed, arr) => arr[hash(seed) % arr.length]
  const uniq = (list) => { const seen = new Set(); return list.filter((x) => !seen.has(x.q) && seen.add(x.q)) }
  // cols: [x, y] pairs; `ask` is the list of 'x' | 'y': which value of each column is missing
  const make = (eq, cols, ask, l, why) => {
    const rows = [
      { label: 'x', cells: cols.map(([x], i) => (ask[i] === 'x' ? null : num(x))) },
      { label: 'y', cells: cols.map(([, y], i) => (ask[i] === 'y' ? null : num(y))) },
    ]
    const answers = [...cols.map(([x], i) => (ask[i] === 'x' ? x : null)), ...cols.map(([, y], i) => (ask[i] === 'y' ? y : null))].filter((v) => v !== null)
    return { q: `Complete the table of values for ${M(eq)}.`, a: answers.join(', '), d: [], s: why(cols, ask), l, fl: { rows, answers } }
  }
  const words = (t) => t.replace(/, so /g, BS + 'text{, so }').replace(/ and y = /g, BS + 'text{ and }y = ')
const subst = (f, text) => (cols, ask) => cols.map(([x, y], i) => (ask[i] === 'y' ? `When ${M('x = ' + x)}: ${M(words(text(x, y)))}.` : ask[i] === 'x' ? `When ${M('y = ' + y)}: ${M(words(text(x, y, true)))}.` : '')).filter(Boolean).join(' ') + (f ? '' : '')
  // x and y are asked crosswise: in every other column the x is missing instead of the y
  const cross = (arr, seed) => arr.map((_, j) => (j % 2 === hash(seed + 'o') % 2 ? 'x' : 'y'))
  const xs = (seed, n = 4) => { const base = pick(seed, [-2, -1, 0, 1]); return Array.from({ length: n }, (_, i) => base + i) }
  const part = (p, mk, n) => ({ p, qs: uniq(Array.from({ length: n * 3 }, (_, i) => mk(p + i, i)).filter(Boolean)).slice(0, n) })

  const a = part('a', (s, i) => {
    const k = pick(s + 'k', [3, 4, 5, 6, 7, 8, 9, 10]), x = xs(s + 'x')
    return make(`x + y = ${k}`, x.map((v) => [v, k - v]), cross(x, s), i < 6 ? 1 : 2, subst(0, (v, y, rev) => (rev ? `x + ${num(y)} = ${k}, so x = ${k - y}` : `${v} + y = ${k}, so y = ${k - v}`)))
  }, 10)
  const b = part('b', (s, i) => {
    const m = pick(s + 'm', [1, 2, 3, -1, -2, 2, 3]), c = pick(s + 'c', [-3, -2, -1, 0, 1, 2, 3, 4]), x = xs(s + 'x')
    return make(slopeForm(m, 1, c), x.map((v) => [v, m * v + c]), cross(x, s), i < 6 ? 1 : 2, subst(0, (v, y, rev) => (rev ? `${y} = ${m}x ${c < 0 ? '-' : '+'} ${Math.abs(c)}, so x = ${v}` : `y = ${m}(${v}) ${c < 0 ? '-' : '+'} ${Math.abs(c)} = ${y}`)))
  }, 10)
  const c = part('c', (s, i) => {
    const k = pick(s + 'k', [1, 2, 3, 4, 5, -1, -2, -3]), x = xs(s + 'x')
    return make(`x - y = ${k}`, x.map((v) => [v, v - k]), cross(x, s), i < 6 ? 1 : 2, subst(0, (v, y, rev) => (rev ? `x - ${num(y)} = ${k}, so x = ${k + y}` : `${v} - y = ${k}, so y = ${v - k}`)))
  }, 10)
  const d = part('d', (s, i) => {
    const A = pick(s + 'A', [2, 3, 2, 4, -1, -2]), k = pick(s + 'k', [4, 6, 8, 9, 10, 12, -4, 5]), x = xs(s + 'x')
    return make(`${A === -1 ? '-' : A}x + y = ${k}`, x.map((v) => [v, k - A * v]), cross(x, s), 2, subst(0, (v, y, rev) => (rev ? `${A}x + ${num(y)} = ${k}, so x = ${(k - y) / A}` : `${A}(${v}) + y = ${k}, so y = ${k - A * v}`)))
  }, 10)
  const e = part('e', (s, i) => {
    const m = pick(s + 'm', [1, 2, 3, -1, -2]), c = pick(s + 'c', [-3, -2, -1, 0, 1, 2, 3]), x = xs(s + 'x', 4)
    const cols = x.map((v) => [v, m * v + c])
    const ask = cross(cols, s)
    return make(slopeForm(m, 1, c), cols, ask, 2, subst(0, (v, y, rev) => (rev ? `${y} = ${m}x ${c < 0 ? '-' : '+'} ${Math.abs(c)}, so x = ${v}` : `y = ${m}(${v}) ${c < 0 ? '-' : '+'} ${Math.abs(c)} = ${y}`)))
  }, 10)
  const f = part('f', (s, i) => {
    const B = pick(s + 'B', [2, 3, 4, 5, -2, -3]), k = pick(s + 'k', [6, 8, 12, 4, 10, 9, 15, 5, 7])
    const step = Math.abs(B), r = ((k % step) + step) % step, x0 = r - step * (1 + (hash(s + 'x') % 2))
    const cols = Array.from({ length: 4 }, (_, j) => { const x = x0 + j * step; return [x, (k - x) / B] })
    return make(std(1, B, k), cols, cross(cols, s), 2, subst(0, (v, y, rev) => rev ? `${v} + ${B < 0 ? `(${B})` : B}(${y}) = ${k}, so x = ${v}` : `${v} + ${B < 0 ? `(${B})` : B}y = ${k}, so ${B}y = ${k - v} and y = ${y}`))
  }, 10)
  return [a, b, c, d, e, f].filter((x) => x.qs.length)
}
