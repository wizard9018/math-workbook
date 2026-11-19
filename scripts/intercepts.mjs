// Math 10 4.3 exercises 4 and 5, drawn instead of multiple choice.
//   exercise 4, "Draw a line with the given slope and intercept": the student draws the line (graph-draw.tsx: click two points on the line, Submit); parts a-l like the textbook
//     (x-intercept, y-intercept, through the origin, undefined slope, slope 0).
//   exercise 5, "Determine (if they exist) the x- and y-intercepts of the line with the given slope, passing through the given point": the student plots the intercepts on the plane
//     (plot-points.tsx; the chips only say "x-intercept" / "y-intercept", so the coordinates are worked out); parts a-n like the textbook.
// Made here (no Gemini). Imported by: export-bank.mjs.
const BS = String.fromCharCode(92)
const M = (x) => BS + '(' + x + BS + ')'
const PLANE = { xmin: -6, xmax: 6, ymin: -6, ymax: 6, xs: 1, ys: 1, xlabel: 'x', ylabel: 'y' }
const inPlane = ([x, y]) => Math.abs(x) <= 6 && Math.abs(y) <= 6
const slopeTex = (p, q) => (q === 1 ? String(p) : `${p < 0 ? '-' : ''}${BS}frac{${Math.abs(p)}}{${q}}`)

export function interceptLineParts(hash) {
  const r = (seed, lo, hi) => lo + ((hash(seed) >>> 9) % (hi - lo + 1))
  const part = (p, kind, slopes, at0) => {
    const qs = []
    const seen = new Set()
    for (let i = 0; qs.length < 10 && i < 300; i++) {
      const s = `ic${p}${i}`
      const m = slopes[r(s + 'm', 0, slopes.length - 1)]
      const undef = m[1] === 0, flat = m[0] === 0
      const v = at0 ? 0 : r(s + 'v', -5, 5)
      const pt = kind === 'x' ? [v, 0] : [0, v]
      const steps = undef ? [[0, 1], [0, -1]] : [[m[1], m[0]], [-m[1], -m[0]]]
      const second = steps.map(([dx, dy]) => [pt[0] + dx, pt[1] + dy]).find(inPlane)
      if (!second) continue
      const eq = undef ? 'undefined' : slopeTex(m[0], m[1])
      const key = `${pt}|${eq}`
      if (seen.has(key)) continue
      seen.add(key)
      const mm = undef ? 0 : m[0] / m[1], c = undef ? 0 : pt[1] - mm * pt[0]
      qs.push({
        q: `Draw a line with the given slope and intercept: ${M(`m = ${eq}`)}; ${kind}-intercept: ${M(`(${pt[0]}, ${pt[1]})`)}. Click two points on the line, then press Submit.`,
        a: `The line through ${M(`(${pt[0]}, ${pt[1]})`)} and ${M(`(${second[0]}, ${second[1]})`)}`,
        d: [],
        s: undef ? `An undefined slope is a vertical line: every point has ${M(`x = ${pt[0]}`)}.` : flat ? `Slope 0 is a horizontal line: every point has ${M(`y = ${pt[1]}`)}.` : `Plot the intercept ${M(`(${pt[0]}, ${pt[1]})`)}. The slope ${M(eq)} means ${Math.abs(m[0])} unit${Math.abs(m[0]) > 1 ? 's' : ''} ${m[0] > 0 ? 'up' : 'down'} for every ${m[1]} to the right: ${M(`(${second[0]}, ${second[1]})`)}. Draw the line through both points.`,
        l: qs.length < 5 ? 1 : 2,
        dr: { ...PLANE, m: mm, c, ...(undef ? { vx: pt[0] } : {}), tol: 1e-6 },
      })
    }
    return { p, qs }
  }
  const ints = [[1, 1], [2, 1], [3, 1], [4, 1], [-1, 1], [-2, 1], [-3, 1]]
  const fracs = [[3, 4], [-3, 4], [3, 2], [-3, 2], [3, 5], [-2, 3], [2, 3], [-5, 3], [5, 3], [1, 2], [-1, 2]]
  return [
    part('a', 'x', ints), part('b', 'y', ints), part('c', 'x', fracs), part('d', 'y', fracs), part('e', 'x', fracs), part('f', 'y', fracs),
    part('g', 'x', fracs), part('h', 'y', fracs), part('i', 'x', ints, true), part('j', 'y', ints, true), part('k', 'x', [[1, 0]]), part('l', 'y', [[0, 1]]),
  ].filter((x) => x.qs.length)
}

export function interceptPlotParts(hash) {
  const r = (seed, lo, hi) => lo + ((hash(seed) >>> 9) % (hi - lo + 1))
  const part = (p, slopes) => {
    const qs = []
    const seen = new Set()
    for (let i = 0; qs.length < 10 && i < 600; i++) {
      const s = `ip${p}${i}`
      const m = slopes[r(s + 'm', 0, slopes.length - 1)]
      const undef = m[1] === 0, flat = m[0] === 0
      const pt = [r(s + 'x', -6, 6), r(s + 'y', -6, 6)]
      let xi = null, yi = null
      if (undef) xi = [pt[0], 0]
      else if (flat) yi = [0, pt[1]]
      else {
        const a = pt[0] - (pt[1] * m[1]) / m[0], b = pt[1] - (m[0] * pt[0]) / m[1] // x-intercept, y-intercept
        if (!Number.isInteger(a) || !Number.isInteger(b)) continue
        xi = [a, 0]
        yi = [0, b]
      }
      const items = []
      if (xi && yi && xi[0] === 0 && yi[1] === 0) items.push({ label: 'x- and y-intercept', x: 0, y: 0 })
      else {
        if (xi) items.push({ label: 'x-intercept', x: xi[0], y: 0 })
        if (yi) items.push({ label: 'y-intercept', x: 0, y: yi[1] })
      }
      if (!items.length || items.some((it) => Math.abs(it.x) > 6 || Math.abs(it.y) > 6)) continue
      const eq = undef ? 'undefined' : slopeTex(m[0], m[1])
      const key = `${pt}|${eq}`
      if (seen.has(key)) continue
      seen.add(key)
      const none = undef ? 'The line is vertical, so it has no y-intercept. ' : flat ? 'The line is horizontal, so it has no x-intercept. ' : `From ${M(`(${pt[0]}, ${pt[1]})`)} follow the slope ${M(eq)} until ${M('y = 0')} (the x-intercept) and until ${M('x = 0')} (the y-intercept). `
      qs.push({
        q: `Determine (if they exist) the x- and y-intercepts of the line with the given slope, passing through the given point: ${M(`m = ${eq};~(${pt[0]}, ${pt[1]})`)}. Plot the intercepts on the grid.`,
        a: items.map((it) => `${it.label} ${M(`(${it.x}, ${it.y})`)}`).join(', '),
        d: [],
        s: `${none}The intercepts are ${items.map((it) => M(`(${it.x}, ${it.y})`)).join(' and ')}.`,
        l: qs.length < 5 ? 1 : 2,
        pp: { ...PLANE, hide: true, items },
      })
    }
    return { p, qs }
  }
  const pos = [[1, 1], [2, 1], [3, 4], [3, 5], [2, 3], [5, 2], [7, 4], [1, 2], [3, 1]]
  const neg = [[-1, 1], [-2, 3], [-1, 2], [-7, 3], [-3, 2], [-3, 1]]
  const out = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'].map((p, k) => part(p, k % 2 ? neg : pos))
  out.push(part('k', [[0, 1]]), part('l', [[1, 0]]), part('m', [[1, 0]]), part('n', [[0, 1]]))
  return out.filter((x) => x.qs.length)
}
