// Precalculus 11 1.3 exercise 4 (graph the quadratic function by completing a table of values): the student plots five points of the parabola (plot-points.tsx; the chips only say
// "x = -2", so the y-values are worked out first), like the textbook's table of values. Parts a-f: x^2 - k, -x^2 + k, x^2 - mx, -x^2 + mx, 2x^2 - k, -2x^2 + k (functions named f g h j k l).
// The five x-values are consecutive whole numbers around the vertex, all y-values inside the plane -6..6. Made here (no Gemini). Imported by: export-bank.mjs.
const BS = String.fromCharCode(92)
const M = (x) => BS + '(' + x + BS + ')'
import { fitPlane } from './plane-fit.mjs'

export function quadPointParts(hash) {
  const r = (seed, lo, hi) => lo + ((hash(seed) >>> 9) % (hi - lo + 1))
  // kinds: a: coefficient, form 'c' (constant) or 'x' (linear term); sign
  const SPEC = [['a', 'f', 1, 1, 'c'], ['b', 'g', 1, -1, 'c'], ['c', 'h', 1, 1, 'x'], ['d', 'j', 1, -1, 'x'], ['e', 'k', 2, 1, 'c'], ['f', 'l', 2, -1, 'c']]
  return SPEC.map(([p, name, a, sign, form]) => {
    const qs = []
    const seen = new Set()
    for (let i = 0; qs.length < 10 && i < 300; i++) {
      const s = `qp${p}${i}`
      const aa = a === 2 ? r(s + 'a', 2, 3) : 1
      let k = form === 'c' ? r(s + 'k', -5, 6) : r(s + 'k', -5, 5) // the constant (c) or the coefficient of x (x); never 0
      if (k === 0) continue
      const f = form === 'c' ? (x) => sign * aa * x * x + k : (x) => sign * (x * x + k * x)
      const vertex = form === 'c' ? 0 : -k / 2
      const start = Math.round(vertex) - 2 // (rounding at .5 goes up)
      const xs = [0, 1, 2, 3, 4].map((d) => start + d)
      const plane = fitPlane(xs, xs.map(f))
      if (!plane) continue
      const coef = aa === 1 ? '' : String(aa)
      const kk = Math.abs(k)
      const tex = form === 'c' ? `${name}(x) = ${sign < 0 ? '-' : ''}${coef}x^2 ${k < 0 ? '-' : '+'} ${kk}` : `${name}(x) = ${sign < 0 ? '-' : ''}x^2 ${sign < 0 ? (k > 0 ? '-' : '+') : k < 0 ? '-' : '+'} ${kk === 1 ? '' : kk}x`
      if (seen.has(tex)) continue
      seen.add(tex)
      const items = xs.map((x) => ({ label: `x = ${x}`.replace('-', '−'), x, y: f(x) }))
      qs.push({
        q: `Graph the quadratic function by completing a table of values: ${M(tex)}. Plot the points for ${M(xs.join(', '))}.`,
        a: items.map((it) => M(`(${it.x}, ${it.y})`)).join(', '), d: [],
        s: `Work out ${M(`${name}(x)`)} for each ${M('x')}: ${items.map((it) => M(`${name}(${it.x}) = ${it.y}`)).join(', ')}. Plot the points ${items.map((it) => M(`(${it.x}, ${it.y})`)).join(', ')}; they lie on a parabola${form === 'c' ? ` with vertex ${M(`(0, ${f(0)})`)}` : ''}.`,
        l: qs.length < 5 ? 1 : 2,
        pp: { ...plane, hide: true, items },
      })
    }
    return { p, qs }
  }).filter((x) => x.qs.length)
}
