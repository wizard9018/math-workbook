// Math 10 3.3 exercise 4 (graph the linear equation): the student draws the line on a coordinate plane (graph-draw.tsx: click two points on the line, Submit), like the textbook.
// Parts follow the textbook's parts a, c-j, l: a Ax + By = C, c a fraction in front of y, d an odd right side, e fractions and decimals, f y = mx + b, g y = -(p/q)x + b,
// h y = (p/q)x - b, i fraction and decimal, j decimal and fraction, l a horizontal / vertical line. The equations have two grid points inside the plane -6..6.
// Made here (no Gemini). Imported by: export-bank.mjs.
const BS = String.fromCharCode(92)
const M = (x) => BS + '(' + x + BS + ')'
const PLANE = { xmin: -6, xmax: 6, ymin: -6, ymax: 6, xs: 1, ys: 1, xlabel: 'x', ylabel: 'y' }
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a))
// a rational number as [p, q] (q > 0); written as an integer, \frac{p}{q} or a decimal
const R = (p, q = 1) => { const g = gcd(p, q) || 1; return [(q < 0 ? -p : p) / g, Math.abs(q) / g] }
const val = ([p, q]) => p / q
const dec = (d) => (d === 'dec')
// coefficient text: kind 'frac' -> \frac{p}{q}, 'dec' -> decimal (the fraction must have a finite decimal)
const coefText = ([p, q], kind, withSign = false) => {
  const neg = p < 0
  const a = Math.abs(p)
  const body = q === 1 ? String(a) : kind === 'dec' ? String(+(a / q).toFixed(4)) : `${BS}frac{${a}}{${q}}`
  return (withSign ? (neg ? '- ' : '+ ') : neg ? '-' : '') + body
}
const termX = (c, kind, first) => {
  const [p, q] = c
  if (p === 0) return ''
  if (q === 1 && Math.abs(p) === 1) return (first ? (p < 0 ? '-' : '') : p < 0 ? ' - ' : ' + ') + 'x'
  return (first ? '' : ' ') + coefText(c, kind, !first) + 'x'
}
const termY = (c, kind, first) => {
  const [p, q] = c
  if (p === 0) return ''
  if (q === 1 && Math.abs(p) === 1) return (first ? (p < 0 ? '-' : '') : p < 0 ? ' - ' : ' + ') + 'y'
  return (first ? '' : ' ') + coefText(c, kind, !first) + 'y'
}

// the grid points of A x + B y = C (A, B, C rational) inside the plane
const gridPoints = (A, B, C) => {
  const out = []
  for (let x = -6; x <= 6; x++) for (let y = -6; y <= 6; y++) {
    // A x + B y - C = 0 with exact fractions: multiply by the common denominator
    const den = A[1] * B[1] * C[1]
    if (A[0] * (den / A[1]) * x + B[0] * (den / B[1]) * y - C[0] * (den / C[1]) === 0) out.push([x, y])
  }
  return out
}

export function graphLinearParts(hash) {
  const pick = (seed, arr) => arr[hash(seed) % arr.length]
  const part = (p, make, n = 10) => {
    const qs = []
    const seen = new Set()
    for (let i = 0; qs.length < n && i < n * 30; i++) {
      const g = make(`${p}${i}`)
      if (!g || seen.has(g.eq)) continue
      seen.add(g.eq)
      const pts = g.pts ?? gridPoints(g.A, g.B, g.C)
      if (pts.length < 2) continue
      const [p1, p2] = pts.length > 2 ? [pts[0], pts[pts.length - 1]] : pts
      const m = g.vx !== undefined ? 0 : -val(g.A) / val(g.B), c = g.vx !== undefined ? 0 : val(g.C) / val(g.B)
      const level = qs.length < 5 ? 1 : 2
      qs.push({
        q: `Graph the linear equation ${M(g.eq)}: click two points on the line, then press Submit.`,
        a: `The line through ${M(`(${p1[0]}, ${p1[1]})`)} and ${M(`(${p2[0]}, ${p2[1]})`)}`,
        d: [],
        s: g.why(p1, p2),
        l: level,
        dr: { ...PLANE, m, c, ...(g.vx !== undefined ? { vx: g.vx } : {}) },
      })
    }
    return { p, qs }
  }
  const why = (eq) => (p1, p2) => `Find two points on the line ${M(eq)} by choosing a value of ${M('x')} and solving for ${M('y')}: for example ${M(`(${p1[0]}, ${p1[1]})`)} and ${M(`(${p2[0]}, ${p2[1]})`)}. Plot them and draw the line through them.`
  // Ax + By = C from coefficient pools (x term, y term, right side); kinds 'frac' / 'dec' decide how a fractional coefficient is written
  const std = (seed, As, Bs, Cs, ka, kb) => {
    const A = pick(seed + 'A', As), B = pick(seed + 'B', Bs), C = pick(seed + 'C', Cs)
    if (val(A) === 0 || val(B) === 0) return null
    const eq = `${termX(A, ka, true)}${termY(B, kb, false)} = ${coefText(C, 'frac')}`
    return { A, B, C, eq, why: why(eq) }
  }
  // y = m x + b
  const slope = (seed, Ms, Bs, kind) => {
    const m = pick(seed + 'm', Ms), b = pick(seed + 'b', Bs)
    if (val(m) === 0) return null
    const eq = `y = ${termX(m, kind, true)}${val(b) === 0 ? '' : ` ${coefText(b, 'frac', true)}`}`
    return { A: R(-m[0], m[1]), B: R(1), C: b, eq, why: why(eq) }
  }
  const ints = (...a) => a.map((v) => R(v))
  const Cint = ints(-4, -3, -2, -1, 1, 2, 3, 4, 6, 8, 9)
  const parts = [
    part('a', (s) => std(s, ints(1, 2, 3, 4), ints(1, 2, 3, 4), ints(2, 3, 4, 6, 8, 12), 'frac', 'frac')),
    part('c', (s) => std(s, ints(1, 2, 3, 4), [R(-1, 2), R(-1, 3), R(-1, 4), R(1, 2), R(1, 3)], ints(-2, -1, 1, 2, 3), 'frac', 'frac')),
    part('d', (s) => std(s, ints(2, 3, 4, 5, -3), ints(2, 3, 1, -2, -1), ints(3, 5, 7, 1, -3, -5, 9), 'frac', 'frac')),
    part('e', (s) => std(s, [R(2, 3), R(3, 4), R(1, 2), R(3, 5), R(1, 3), R(-1, 2)], [R(-2, 5), R(3, 5), R(-1, 4), R(1, 2), R(-3, 10), R(2, 5)], ints(-2, -1, 1, 2, 3, 4), 'frac', 'dec')),
    part('f', (s) => slope(s, ints(-3, -2, -1, 1, 2, 3), ints(-4, -3, -2, -1, 1, 2, 3, 4), 'frac')),
    part('g', (s) => slope(s, [R(-3, 4), R(-1, 2), R(-2, 3), R(-1, 3), R(-3, 2), R(-1, 4)], ints(-3, -2, -1, 1, 2, 3), 'frac')),
    part('h', (s) => slope(s, [R(2, 3), R(1, 2), R(3, 4), R(1, 3), R(3, 2), R(1, 4)], ints(-3, -2, -1, 1, 2, 3), 'frac')),
    part('i', (s) => std(s, [R(1, 2), R(1, 4), R(3, 4), R(-1, 2), R(1, 5)], [R(3, 5), R(-3, 5), R(2, 5), R(-1, 4), R(1, 2)], ints(1, 2, 3, -1, -2, 4), 'frac', 'dec')),
    part('j', (s) => std(s, [R(-2, 5), R(2, 5), R(-3, 10), R(3, 5), R(-1, 5)], [R(1, 3), R(1, 2), R(-1, 3), R(2, 3), R(1, 4)], ints(1, 2, 3, -1, -2), 'dec', 'frac')),
    {
      p: 'l',
      qs: Array.from({ length: 10 }, (_, i) => {
        const v = [-2, -3, -1, 2, 3, 4, -4, 1, 5, -5][i]
        const horizontal = i % 3 !== 2
        const eq = horizontal ? `y = ${v}` : `x = ${v}`
        const pts = horizontal ? [[-3, v], [3, v]] : [[v, -3], [v, 3]]
        return {
          q: `Graph the linear equation ${M(eq)}: click two points on the line, then press Submit.`,
          a: `The line through ${M(`(${pts[0][0]}, ${pts[0][1]})`)} and ${M(`(${pts[1][0]}, ${pts[1][1]})`)}`,
          d: [],
          s: horizontal ? `Every point has ${M('y = ' + v)}: a horizontal line through ${M(`(0, ${v})`)}.` : `Every point has ${M('x = ' + v)}: a vertical line through ${M(`(${v}, 0)`)}.`,
          l: i < 5 ? 1 : 2,
          dr: { ...PLANE, m: 0, c: horizontal ? v : 0, ...(horizontal ? {} : { vx: v }) },
        }
      }),
    },
  ]
  void Cint
  void dec
  return parts.filter((x) => x.qs.length)
}
