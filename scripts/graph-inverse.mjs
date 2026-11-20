// Precalculus 12 2.5 exercise 6 (given the graph of f, draw the graph of its inverse) as a choice of four graphs. The inverse is the reflection in y = x: every point (a, b) of f becomes (b, a).
// Parts: a line with a positive slope, a line with a negative slope, a cubic, a cube root, a square root, a piecewise-linear one-to-one graph. The wrong options are the usual mistakes (f itself,
// the reflection in the x-axis, in the y-axis, in the origin, a quarter turn). Made here: the reflection is exact (no Gemini). Imported by: export-bank.mjs.
import { plot, simplify } from './graph-svg.mjs'
const BS = String.fromCharCode(92)
const M = (x) => BS + '(' + x + BS + ')'
const R = 6

// the sampled graph of a function inside the window |x|, |y| <= R (null between pieces)
const sample = (fn, x0 = -R, x1 = R) => {
  const out = []
  for (let x = x0; x <= x1 + 1e-9; x += 0.1) {
    const y = fn(x)
    if (Number.isFinite(y) && Math.abs(y) <= R) out.push([+x.toFixed(3), +y.toFixed(3)])
    else if (out.length && out[out.length - 1] !== null) out.push(null)
  }
  while (out.length && out[out.length - 1] === null) out.pop()
  return out
}
const polyline = (v) => { // a vertex list -> sampled points
  const out = []
  for (let i = 0; i + 1 < v.length; i++) for (let t = 0; t < 6; t++) out.push([v[i][0] + ((v[i + 1][0] - v[i][0]) * t) / 6, v[i][1] + ((v[i + 1][1] - v[i][1]) * t) / 6])
  out.push(v[v.length - 1])
  return out
}
const map = (pts, f) => pts.map((p) => (p ? f(p) : null))
const sig = (pts) => pts.filter(Boolean).filter((_, i) => i % 6 === 0).map((p) => `${Math.round(p[0] * 2)},${Math.round(p[1] * 2)}`).sort().join(' ')
const svg = (pts) => plot(pts, { x: [-R, R], y: [-R, R], S: 14 })
const frac = (m) => (Number.isInteger(m) ? String(m) : m === 0.5 ? BS + 'frac{1}{2}' : m === -0.5 ? BS + 'frac{1}{2}' : String(m))

export function inverseParts(hash) {
  const pick = (seed, a) => a[hash(seed) % a.length]
  const mk = (p, n, level) => {
    const seed = `iv${p}${n}`
    let pts
    if (p === 'a' || p === 'b') {
      const m = p === 'a' ? pick(seed + 'm', level === 1 ? [1, 2, 0.5, 3] : [1.5, 2.5, 0.5, 3]) : pick(seed + 'm', level === 1 ? [-1, -2, -0.5, -3] : [-1.5, -2.5, -0.5, -3])
      const b = pick(seed + 'b', [-3, -2, -1, 0, 1, 2, 3])
      pts = sample((x) => m * x + b)
    } else if (p === 'c') {
      const k = pick(seed + 'k', [-2, -1, 0, 1, 2]), a = level === 1 ? 1 : pick(seed + 'a', [0.5, 2])
      pts = sample((x) => a * x * x * x + k, -3, 3)
    } else if (p === 'd') {
      const k = pick(seed + 'k', [-2, -1, 0, 1, 2]), s = level === 1 ? 1 : 2
      pts = sample((x) => s * Math.cbrt(x) + k)
    } else if (p === 'e') {
      const k = pick(seed + 'k', [-2, -1, 0, 1, 2]), s = level === 1 ? pick(seed + 's', [1, -1]) : pick(seed + 's', [2, -2])
      pts = sample((x) => s * Math.sqrt(x) + k, 0, R)
    } else {
      const nv = level === 1 ? 3 : 4
      const xs = [], ys = []
      const all = [-4, -3, -2, -1, 0, 1, 2, 3, 4]
      const px = [...all].sort((a, b) => (hash(seed + 'x' + a) % 97) - (hash(seed + 'x' + b) % 97)).slice(0, nv).sort((a, b) => a - b)
      const py = [...all].sort((a, b) => (hash(seed + 'y' + a) % 97) - (hash(seed + 'y' + b) % 97)).slice(0, nv).sort((a, b) => a - b)
      if (hash(seed + 'd') % 2) py.reverse()
      px.forEach((x, i) => { xs.push(x); ys.push(py[i]) })
      pts = polyline(xs.map((x, i) => [x, ys[i]]))
    }
    const right = map(pts, ([x, y]) => [y, x])
    const wrong = [pts, map(pts, ([x, y]) => [x, -y]), map(pts, ([x, y]) => [-x, y]), map(pts, ([x, y]) => [-x, -y]), map(pts, ([x, y]) => [-y, x])]
    // two lattice points of f for the solution
    const lat = pts.filter((q) => q && Math.abs(q[0] - Math.round(q[0])) < 1e-6 && Math.abs(q[1] - Math.round(q[1])) < 1e-6 && Math.abs(q[0] - q[1]) > 0.5)
    const two = [lat[0], lat[lat.length - 1]].filter(Boolean)
    const s = `The graph of ${M('f^{-1}')} is the reflection of the graph of ${M('f')} in the line ${M('y = x')}: every point ${M('(a, b)')} of ${M('f')} becomes ${M('(b, a)')}.${two.length ? ' For example ' + two.map((q) => `${M(`(${Math.round(q[0])}, ${Math.round(q[1])})`)} becomes ${M(`(${Math.round(q[1])}, ${Math.round(q[0])})`)}`).join(' and ') + '.' : ''}`
    const segs = []
    let run = []
    const flush = () => { for (let i = 0; i + 1 < run.length; i += 2) segs.push({ t: 'segment', p: run[i], q: run[i + 1], color: '#2563eb' }); run = [] }
    const clean = simplify(pts, 0.06).filter(Boolean)
    for (let i = 0; i + 1 < clean.length; i++) segs.push({ t: 'segment', p: clean[i], q: clean[i + 1], color: '#2563eb' })
    void flush
    return { q: `The graph of ${M('y = f(x)')} is shown together with the dashed line ${M('y = x')}. Which graph is the graph of ${M('y = f^{-1}(x)')}?`, right, wrong, s, level,
      f: { bbox: [-6, 6, 6, -6], big: true, elements: [{ t: 'segment', p: [-6, -6], q: [6, 6], dashed: true }, ...segs, { t: 'text', x: 4.6, y: 5.2, s: 'y = x' }] } }
  }
  return ['a', 'b', 'c', 'd', 'e', 'f'].map((p) => {
    const qs = []
    const seen = new Set()
    for (let n = 0; qs.length < 10 && n < 80; n++) {
      const level = qs.length < 5 ? 1 : 2
      const q = mk(p, n, level)
      const keys = new Set([sig(q.right)])
      const d = []
      for (const w of q.wrong) if (w.filter(Boolean).length > 3 && !keys.has(sig(w))) { keys.add(sig(w)); d.push(w) }
      const id = sig(q.right)
      if (seen.has(id) || q.right.filter(Boolean).length < 4 || d.length < 3) continue
      seen.add(id)
      qs.push({ q: q.q, a: svg(q.right), d: d.slice(0, 3).map(svg), s: q.s, l: level, f: q.f })
    }
    return { p, qs }
  })
}
