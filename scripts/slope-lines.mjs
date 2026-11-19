// Math 10 4.3 exercise 1 (graph the line through a given point with a given slope): the student draws the line (graph-draw.tsx: click two points on the line, Submit), like the textbook.
// Parts follow the textbook: a, b whole-number slope from a point (a on the y-axis), c-f fractional slopes, g, h through the origin, i, j larger fractions, k whole-number negative slope,
// l fraction, m and p slope 0 (horizontal), n and o undefined slope (vertical). The given point and a second grid point are inside the plane -6..6. Made here (no Gemini).
// Imported by: export-bank.mjs.
const BS = String.fromCharCode(92)
const M = (x) => BS + '(' + x + BS + ')'
const PLANE = { xmin: -6, xmax: 6, ymin: -6, ymax: 6, xs: 1, ys: 1, xlabel: 'x', ylabel: 'y' }
const inPlane = ([x, y]) => Math.abs(x) <= 6 && Math.abs(y) <= 6
const slopeTex = (p, q) => (q === 1 ? String(p) : `${p < 0 ? '-' : ''}${BS}frac{${Math.abs(p)}}{${q}}`)

export function slopeLineParts(hash) {
  const r = (seed, lo, hi) => lo + ((hash(seed) >>> 9) % (hi - lo + 1))
  // kinds: [slope list, point rule]
  const SL = (list) => (s) => list[r(s + 'm', 0, list.length - 1)]
  const part = (p, slopeOf, pointOf) => {
    const qs = []
    const seen = new Set()
    for (let i = 0; qs.length < 10 && i < 300; i++) {
      const s = `sl${p}${i}`
      const m = slopeOf(s) // [rise, run] ; [0, 1] horizontal ; [1, 0] undefined
      const pt = pointOf(s)
      const undef = m[1] === 0, flat = m[0] === 0
      // a second point of the line (one step of the slope, either way)
      const steps = undef ? [[0, 1], [0, -1]] : [[m[1], m[0]], [-m[1], -m[0]]]
      const second = steps.map(([dx, dy]) => [pt[0] + dx, pt[1] + dy]).find(inPlane)
      if (!inPlane(pt) || !second) continue
      const eq = undef ? 'undefined' : slopeTex(m[0], m[1])
      const key = `${pt}|${eq}`
      if (seen.has(key)) continue
      seen.add(key)
      const mm = undef ? 0 : m[0] / m[1], c = undef ? 0 : pt[1] - mm * pt[0]
      qs.push({
        q: `Graph the line that passes through the given point and has the given slope: ${M(`(${pt[0]}, ${pt[1]}); m = ${eq}`)}. Click two points on the line, then press Submit.`,
        a: `The line through ${M(`(${pt[0]}, ${pt[1]})`)} and ${M(`(${second[0]}, ${second[1]})`)}`,
        d: [],
        s: undef ? `An undefined slope is a vertical line: every point has ${M(`x = ${pt[0]}`)}.` : flat ? `Slope 0 is a horizontal line: every point has ${M(`y = ${pt[1]}`)}.` : `Plot ${M(`(${pt[0]}, ${pt[1]})`)}. The slope ${M(`${eq} = ${BS}frac{${m[0]}}{${m[1]}}`)} means: ${Math.abs(m[0])} unit${Math.abs(m[0]) > 1 ? 's' : ''} ${m[0] > 0 ? 'up' : 'down'} for every ${m[1]} to the right. That gives ${M(`(${second[0]}, ${second[1]})`)}. Draw the line through both points.`,
        l: qs.length < 5 ? 1 : 2,
        dr: { ...PLANE, m: mm, c, ...(undef ? { vx: pt[0] } : {}), tol: 1e-6 },
      })
    }
    return { p, qs }
  }
  const anyPt = (s) => [r(s + 'x', -5, 5), r(s + 'y', -5, 5)]
  const onY = (s) => [0, r(s + 'y', -5, 5)]
  const origin = () => [0, 0]
  const frac = SL([[3, 4], [3, 2], [2, 3], [3, 5], [1, 2], [5, 2], [1, 3], [2, 5], [4, 3]])
  const big = SL([[7, 2], [5, 2], [5, 3], [7, 3], [4, 3], [5, 4]])
  const negBig = SL([[-5, 2], [-3, 2], [-5, 3], [-7, 2], [-2, 3], [-4, 3], [-3, 4]])
  return [
    part('a', SL([[1, 1], [2, 1], [-1, 1], [3, 1], [-2, 1], [1, 2]]), onY),
    part('b', SL([[2, 1], [1, 1], [3, 1], [-2, 1], [-1, 1], [-3, 1]]), anyPt),
    part('c', frac, anyPt),
    part('d', frac, anyPt),
    part('e', frac, anyPt),
    part('f', frac, anyPt),
    part('g', SL([[-3, 1], [-2, 1], [-1, 1], [-1, 2], [-2, 3], [-3, 2]]), origin),
    part('h', SL([[4, 1], [2, 1], [3, 1], [1, 2], [3, 2], [5, 1], [1, 1]]), origin),
    part('i', big, anyPt),
    part('j', negBig, anyPt),
    part('k', SL([[-3, 1], [-2, 1], [-1, 1], [-4, 1], [-5, 1]]), anyPt),
    part('l', frac, anyPt),
    part('m', () => [0, 1], anyPt),
    part('n', () => [1, 0], onY),
    part('o', () => [1, 0], anyPt),
    part('p', () => [0, 1], anyPt),
  ].filter((x) => x.qs.length)
}
