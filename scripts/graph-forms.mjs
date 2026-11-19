// Math 10 5.1 exercise 10 (graph the linear equation given in standard, slope-intercept or point-slope form): the student draws the line (graph-draw.tsx: click two points on the line,
// Submit). Parts a-h like the textbook: a Ax - By = C, b y = -(p/q)x + b, c y - y1 = (p/q)(x - x1), d Ax + By = C, e y + k = m(x + h) with a whole slope, f through the origin,
// g point-slope with half-numbers, h slope-intercept with a half-number intercept (the grid of g and h has half steps). The line has two grid points inside the plane -6..6.
// Made here (no Gemini). Imported by: export-bank.mjs.
const BS = String.fromCharCode(92)
const M = (x) => BS + '(' + x + BS + ')'
const fx = (n) => String(+n.toFixed(4))
const fr = (p, q) => (q === 1 ? String(p) : `${p < 0 ? '-' : ''}${BS}frac{${Math.abs(p)}}{${q}}`)
const half = (n) => (Number.isInteger(n) ? String(n) : `${n < 0 ? '-' : ''}${BS}frac{${Math.abs(n * 2)}}{2}`)
const signed = (n, tex) => `${n < 0 ? '- ' : '+ '}${tex(Math.abs(n))}`

export function graphFormParts(hash) {
  const r = (seed, lo, hi) => lo + ((hash(seed) >>> 9) % (hi - lo + 1))
  const pick = (seed, a) => a[r(seed, 0, a.length - 1)]
  const part = (p, make, step = 1) => {
    const qs = []
    const seen = new Set()
    for (let i = 0; qs.length < 10 && i < 400; i++) {
      const g = make(`gf${p}${i}`)
      if (!g || seen.has(g.eq)) continue
      const pl = { xmin: -6, xmax: 6, ymin: -6, ymax: 6, xs: step, ys: step, ...(step < 1 ? { xl: 2 } : {}), xlabel: 'x', ylabel: 'y' }
      const pts = []
      for (let x = -6; x <= 6 + 1e-9; x += step) { const y = g.m * x + g.c; if (Math.abs(y) <= 6 + 1e-9 && Math.abs(y / step - Math.round(y / step)) < 1e-9) pts.push([x, +y.toFixed(4)]) }
      if (pts.length < 2) continue
      seen.add(g.eq)
      const [p1, p2] = [pts[0], pts[pts.length - 1]]
      qs.push({
        q: `Graph the linear equation ${M(g.eq)}: click two points on the line, then press Submit.`,
        a: `The line through ${M(`(${fx(p1[0])}, ${fx(p1[1])})`)} and ${M(`(${fx(p2[0])}, ${fx(p2[1])})`)}`,
        d: [],
        s: `${g.how ? g.how + ' ' : ''}Two points of the line: ${M(`(${fx(p1[0])}, ${fx(p1[1])})`)} and ${M(`(${fx(p2[0])}, ${fx(p2[1])})`)}. Plot them and draw the line through them.`,
        l: qs.length < 5 ? 1 : 2,
        dr: { ...pl, m: g.m, c: g.c, tol: 1e-6 },
      })
    }
    return { p, qs }
  }
  // Ax + By = C from a lattice point
  const std = (s, sgnB) => {
    const A = pick(s + 'A', [1, 2, 3, 4, 5]), B = pick(s + 'B', [1, 2, 3]) * sgnB, x0 = r(s + 'x', -3, 3), y0 = r(s + 'y', -3, 3), C = A * x0 + B * y0
    return { m: -A / B, c: C / B, eq: `${A === 1 ? '' : A}x ${B < 0 ? '-' : '+'} ${Math.abs(B) === 1 ? '' : Math.abs(B)}y = ${C}`, how: `Solve for ${M('y')}: ${M(`y = ${fx(-A / B)}x ${signed(C / B, fx)}`)}.` }
  }
  const slopeInt = (s) => {
    const [p, q] = pick(s + 'm', [[-2, 3], [3, 4], [-3, 2], [2, 3], [-1, 2], [4, 3]]), b = r(s + 'b', -5, 5)
    return { m: p / q, c: b, eq: `y = ${fr(p, q)}x ${b === 0 ? '' : signed(b, String)}`.trim() }
  }
  const pointSlope = (s, slopes, halves) => {
    const [p, q] = pick(s + 'm', slopes), x1 = halves ? r(s + 'x', -9, 9) / 2 : r(s + 'x', -5, 5), y1 = halves ? r(s + 'y', -9, 9) / 2 : r(s + 'y', -5, 5), m = p / q
    const lhs = `y ${y1 === 0 ? '' : signed(-y1, half)}`.trim()
    return { m, c: y1 - m * x1, eq: `${lhs} = ${fr(p, q)}(x ${x1 === 0 ? '' : signed(-x1, half)})`.replace('(x )', '(x)'), how: `The line has slope ${M(fr(p, q))} and passes through ${M(`(${half(x1)}, ${half(y1)})`)}.` }
  }
  return [
    part('a', (s) => std(s, -1)),
    part('b', slopeInt),
    part('c', (s) => pointSlope(s, [[1, 2], [2, 3], [-1, 2], [3, 4], [-2, 3], [1, 3]], false)),
    part('d', (s) => std(s, 1)),
    part('e', (s) => pointSlope(s, [[-3, 1], [2, 1], [-2, 1], [3, 1], [-1, 1], [1, 1]], false)),
    part('f', (s) => { const A = pick(s + 'A', [5, 3, 2, 4, 1]), B = pick(s + 'B', [2, 3, 1, 4]); return { m: A / B, c: 0, eq: `${A}x - ${B === 1 ? '' : B}y = 0` } }),
    part('g', (s) => pointSlope(s, [[-1, 2], [1, 2], [-2, 1], [1, 1], [-1, 1], [3, 2]], true), 0.5),
    part('h', (s) => { const [p, q] = pick(s + 'm', [[5, 3], [2, 3], [3, 2], [1, 2], [4, 3], [-5, 3]]), b = r(s + 'b', -9, 9) / 2; return { m: p / q, c: b, eq: `y = ${fr(p, q)}x ${b === 0 ? '' : signed(b, half)}`.trim() } }, 0.5),
  ].filter((x) => x.qs.length)
}
