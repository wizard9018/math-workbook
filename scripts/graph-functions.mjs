// Math 10 5.5 exercises 5 and 6 (graph a function), drawn like the textbook:
//   exercise 5, "Graph the function over the real numbers": parts a-d linear functions and e a constant function are drawn as a line (graph-draw.tsx: click two points on the line);
//     part f, a quadratic, is graphed by plotting the points for x = -4, -2, 0, 2, 4 (plot-points.tsx; the chips only say x = ..., the y-values are worked out).
//   exercise 6, "Graph the function if the domain is {-3, -2, -1, 0, 1, 2}": plot the point of every x of the domain (plot-points.tsx, chips "x = -3"); parts a-e linear and constant
//     functions, f a cubic over {-2, 0, 2}. The domain of a function with a fraction in it only has the x-values whose y is a whole number inside the plane -6..6.
// Made here (no Gemini). Imported by: export-bank.mjs.
const BS = String.fromCharCode(92)
const M = (x) => BS + '(' + x + BS + ')'
const PLANE = { xmin: -6, xmax: 6, ymin: -6, ymax: 6, xs: 1, ys: 1, xlabel: 'x', ylabel: 'y' }
const fr = (p, q) => (q === 1 ? String(p) : `${p < 0 ? '-' : ''}${BS}frac{${Math.abs(p)}}{${q}}`)
const coef = (p, q) => (q === 1 ? (p === 1 ? '' : p === -1 ? '-' : String(p)) : fr(p, q))
const signed = (n) => `${n < 0 ? '- ' : '+ '}${Math.abs(n)}`

export function graphFunctionParts(hash, no) {
  const r = (seed, lo, hi) => lo + ((hash(seed) >>> 9) % (hi - lo + 1))
  const pick = (seed, a) => a[r(seed, 0, a.length - 1)]
  // a function: tex of f(x) and its value
  const linear = (s, slopes) => {
    const [p, q] = pick(s + 'm', slopes), b = r(s + 'b', -4, 4)
    return { tex: `f(x) = ${coef(p, q)}x ${b === 0 ? '' : signed(b)}`.trim(), f: (x) => (p / q) * x + b, m: p / q, c: b, line: true }
  }
  const constant = (s) => { const b = r(s + 'b', -5, 5); return { tex: `f(x) = ${b}`, f: () => b, m: 0, c: b, line: true } }
  const quad = (s) => {
    const [p, q] = pick(s + 'a', [[-1, 4], [1, 4], [-1, 2], [1, 2], [-1, 1], [1, 1]]), c = r(s + 'c', -3, 4)
    return { tex: `f(x) = ${coef(p, q)}x^2 ${c === 0 ? '' : signed(c)}`.trim(), f: (x) => (p / q) * x * x + c }
  }
  const cubic = (s) => {
    const [p, q] = pick(s + 'a', [[1, 4], [1, 2], [-1, 4], [-1, 2]])
    return { tex: `f(x) = ${coef(p, q)}x^3`, f: (x) => (p / q) * x ** 3, cubic: true }
  }
  const ok = (v) => Number.isInteger(+v.toFixed(9)) && Math.abs(v) <= 6
  const part = (p, make, kind) => {
    const qs = []
    const seen = new Set()
    for (let i = 0; qs.length < 10 && i < 400; i++) {
      const s = `gfn${no}${p}${i}`
      const g = make(s)
      if (!g || seen.has(g.tex)) continue
      let items
      if (kind === 'draw') {
        let n = 0
        for (let x = -6; x <= 6; x++) if (ok(g.f(x))) n++
        if (n < 2) continue
      } else {
        const xs = kind === 'five' ? [-4, -2, 0, 2, 4] : g.cubic ? [-2, 0, 2] : null
        let dom = xs
        if (!dom) {
          const good = []
          for (let x = -6; x <= 6; x++) if (ok(g.f(x))) good.push(x)
          if (good.length < 4) continue
          // six consecutive grid values of x (like -3 .. 2 in the textbook), else the first six
          let run = null
          for (let a = 0; a + 5 < good.length; a++) { const w = good.slice(a, a + 6); if (w.every((v, k) => k === 0 || v - w[k - 1] === w[1] - w[0])) { run = w; break } }
          dom = run ?? good.slice(0, 6)
        }
        if (!dom.every((x) => ok(g.f(x)))) continue
        items = dom.map((x) => ({ label: `x = ${x}`.replace('-', '−'), x, y: +g.f(x).toFixed(6) }))
      }
      seen.add(g.tex)
      const lvl = qs.length < 5 ? 1 : 2
      if (kind === 'draw') {
        qs.push({ q: `Graph the function over the real numbers: ${M(g.tex)}. Click two points on the line, then press Submit.`, a: `The line of ${M(g.tex)}`, d: [], s: `${g.m === 0 ? `Every point has ${M(`y = ${g.c}`)}: a horizontal line.` : `The ${M('y')}-intercept is ${M(`(0, ${g.c})`)}; use the slope to find a second point.`} Draw the line through the points.`, l: lvl, dr: { ...PLANE, m: g.m, c: g.c, tol: 1e-6 } })
      } else {
        const dom = items.map((it) => it.x)
        qs.push({
          q: kind === 'five' ? `Graph the function over the real numbers: ${M(g.tex)}. Plot the points for ${M(dom.join(', '))}.` : `Graph the function if the domain is ${M(`${BS}{${dom.join(', ')}${BS}}`)}: ${M(g.tex)}. Plot the point of every value of ${M('x')}.`,
          a: items.map((it) => M(`(${it.x}, ${fnum(it.y)})`)).join(', '), d: [],
          s: `Work out ${M('f(x)')} for each ${M('x')}: ${items.map((it) => M(`f(${it.x}) = ${fnum(it.y)}`)).join(', ')}. Plot ${items.map((it) => M(`(${it.x}, ${fnum(it.y)})`)).join(', ')}.`,
          l: lvl, pp: { ...PLANE, hide: true, items },
        })
      }
    }
    return { p, qs }
  }
  const fnum = (y) => String(+y.toFixed(4))
  const four = [[1, 1], [2, 1], [-1, 2], [3, 4], [-2, 3], [-1, 1], [1, 2], [3, 2]]
  if (no === 5) {
    return [part('a', (s) => linear(s, four), 'draw'), part('b', (s) => linear(s, four), 'draw'), part('c', (s) => linear(s, four), 'draw'), part('d', (s) => linear(s, four), 'draw'), part('e', constant, 'draw'), part('f', quad, 'five')].filter((x) => x.qs.length)
  }
  return [part('a', (s) => linear(s, four), 'dom'), part('b', (s) => linear(s, four), 'dom'), part('c', (s) => linear(s, four), 'dom'), part('d', (s) => linear(s, four), 'dom'), part('e', constant, 'dom'), part('f', cubic, 'dom')].filter((x) => x.qs.length)
}
