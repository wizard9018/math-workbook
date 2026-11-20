// Precalculus 12 2.2 exercises 5-8: "use the graphs of y = f(x) and y = g(x) to graph (f + g)(x), (f - g)(x), (g - f)(x), (-f - g)(x), (2f + g/2)(x)" as a choice of four graphs.
// The pairs of piecewise-linear graphs f and g (vertex lists) are designed by Gemini (gen-graph-combos.py -> bank/Precal-12-ch2/graph-combos.json); this file only computes the five
// combinations of a pair, draws them as the four options and drops a pair that is not usable (checked: vertices, range, all combinations different). Imported by: export-bank.mjs.
import { plot } from './graph-svg.mjs'
const BS = String.fromCharCode(92)
const M = (x) => BS + '(' + x + BS + ')'

const OPS = [
  { p: 'a', tex: 'f + g', k: (f, g) => f + g },
  { p: 'b', tex: 'f - g', k: (f, g) => f - g },
  { p: 'c', tex: 'g - f', k: (f, g) => g - f },
  { p: 'd', tex: '-f - g', k: (f, g) => -f - g },
  { p: 'e', tex: `2f + ${BS}frac{1}{2}g`, k: (f, g) => 2 * f + g / 2 },
]

const evalAt = (v, x) => {
  for (let i = 0; i + 1 < v.length; i++) if (x >= v[i][0] && x <= v[i + 1][0]) return v[i][1] + ((v[i + 1][1] - v[i][1]) * (x - v[i][0])) / (v[i + 1][0] - v[i][0])
  return NaN
}
// the vertices of the combination of two piecewise-linear graphs, collinear vertices removed
const combine = (f, g, k) => {
  const xs = [...new Set([...f.map((p) => p[0]), ...g.map((p) => p[0])])].sort((a, b) => a - b)
  const pts = xs.map((x) => [x, k(evalAt(f, x), evalAt(g, x))])
  return pts.filter((p, i) => i === 0 || i === pts.length - 1 || (pts[i][1] - pts[i - 1][1]) * (pts[i + 1][0] - pts[i][0]) !== (pts[i + 1][1] - pts[i][1]) * (pts[i][0] - pts[i - 1][0]))
}
const same = (a, b) => a.length === b.length && a.every((p, i) => p[0] === b[i][0] && Math.abs(p[1] - b[i][1]) < 1e-9)
const valid = (v) => Array.isArray(v) && v.length >= 3 && v.length <= 6 && v.every((p) => Array.isArray(p) && Number.isInteger(p[0]) && Number.isInteger(p[1]) && Math.abs(p[1]) <= 3) && v[0][0] === -5 && v[v.length - 1][0] === 5 && v.every((p, i) => i === 0 || p[0] > v[i - 1][0])
const num = (y) => (Number.isInteger(y) ? String(y) : String(+y.toFixed(2)))

const svgGraph = (pts, ym) => plot(pts, { x: [-5, 5], y: [-ym, ym], arrows: [true, true], S: Math.min(16, Math.floor(190 / (2 * ym))) })

// the figure of the question: f blue and g red, arrows at the ends, the names "y = f(x)" / "y = g(x)" where they run into no graph (like exercise 7 of 2.3), a bigger picture
const figureOf = (f, g, Y) => {
  const cols = ['#2563eb', '#dc2626']
  const segs = [f, g].flatMap((v, gi) => v.slice(1).map((p, k) => ({ t: 'segment', p: v[k], q: p, color: cols[gi], ...(k === 0 ? { arrow: 'start' } : {}), ...(k === v.length - 2 ? { arrow: k === 0 ? 'both' : 'end' } : {}) })))
  const dist = (px, py, s) => { const [x1, y1] = s.p, [x2, y2] = s.q, dx = x2 - x1, dy = y2 - y1, u = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy || 1))); return Math.hypot(px - (x1 + u * dx), py - (y1 + u * dy)) }
  const texts = [f, g].map((v, gi) => {
    let best = null
    for (const [end, side] of [[v[v.length - 1], 'end'], [v[0], 'start']]) for (const dy of [0.7, -0.7, 1.2, -1.2]) {
      const w = 3.4, cx = side === 'end' ? Math.min(end[0] + 0.15, 5.8) : Math.max(end[0] - 0.15, -5.8), cy = end[1] + dy
      const x0 = side === 'end' ? cx - w : cx
      if (x0 < -6 || x0 + w > 6 || cy > Y - 0.3 || cy < -Y + 0.3) continue
      let m = 9
      for (let k = 0; k <= 6; k++) for (const yy of [cy - 0.3, cy, cy + 0.3]) for (const sg of segs) m = Math.min(m, dist(x0 + (w * k) / 6, yy, sg))
      if (!best || m > best.m) best = { m, x: cx, y: cy, anchor: side }
    }
    return { t: 'text', x: best?.x ?? 0, y: best?.y ?? 0, s: 'y = ' + (gi ? 'g' : 'f') + '(x)', color: cols[gi], anchor: best?.anchor ?? 'middle' }
  })
  return { bbox: [-6, Y, 6, -Y], big: true, elements: [...segs, ...texts] }
}

export function graphComboParts(hash, ex, pairs) {
  const ok = (pairs ?? []).filter((q) => valid(q.f) && valid(q.g) && OPS.every((o, i) => OPS.every((o2, j) => i >= j || !same(combine(q.f, q.g, o.k), combine(q.f, q.g, o2.k)))) && OPS.every((o) => combine(q.f, q.g, o.k).every((p) => Math.abs(p[1]) <= 7.5)))
  return OPS.map((op) => {
    const qs = ok.map((q, n) => {
      const all = OPS.map((o) => combine(q.f, q.g, o.k))
      const ym = Math.max(4, Math.ceil(Math.max(...all.flat().map((p) => Math.abs(p[1])))) + 1)
      const right = combine(q.f, q.g, op.k)
      const others = OPS.filter((o) => o.p !== op.p).map((o) => combine(q.f, q.g, o.k))
      const drop = hash(`gc${ex}${op.p}${n}`) % others.length // the three distractors: three of the other four combinations
      const wrong = others.filter((_, i) => i !== drop)
      const ys = [...q.f, ...q.g].map((p) => Math.abs(p[1]))
      const Y = Math.max(4, Math.max(...ys) + 2)
      const label = (v, name) => ({ t: 'text', x: v[1][0] < 0 ? v[1][0] - 0.3 : -4.5, y: v[1][1] + 0.9, s: name })
      const at = (v, x) => evalAt(v, x)
      const x0 = right.find((p) => p[0] !== 0)?.[0] ?? 1
      const s = `Add or subtract the y-values of f and g at each x. For example at x = 0: f(0) = ${num(at(q.f, 0))} and g(0) = ${num(at(q.g, 0))}, so ${op.tex.replace(BS + 'frac{1}{2}', '1/2 ')}${'' } at 0 is ${num(right.find((p) => p[0] === 0)?.[1] ?? evalAt(right, 0))}; at x = ${x0}: f = ${num(at(q.f, x0))}, g = ${num(at(q.g, x0))}, so the value is ${num(right.find((p) => p[0] === x0)[1])}. Plot these points and join them: this is the graph shown in the answer.`
      return {
        q: `The graphs of ${M('y = f(x)')} and ${M('y = g(x)')} are shown. Which graph is the graph of ${M(`y = (${op.tex})(x)`)}?`,
        a: svgGraph(right, ym),
        d: wrong.map((v) => svgGraph(v, ym)),
        s,
        l: q.l === 2 ? 2 : 1,
        f: figureOf(q.f, q.g, Y),
      }
    })
    return { p: op.p, qs }
  })
}
