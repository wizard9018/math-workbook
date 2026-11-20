// Precalculus 12 2.4 exercise 15 (given the graph of y = f(x), graph y = 1/f(x)) as a choice of four graphs. Part a: f(x) = (x - h)^2 + k with k > 0 (no zeros), 1/f is a bell with its
// maximum 1/k at x = h; part b: f(x) = m(x - p), 1/f is a hyperbola with the vertical asymptote x = p. The wrong options are the usual mistakes (the sign, the peak, the centre, the asymptote,
// the graph of f itself). Made here: the curves need exact asymptotes (no Gemini). Imported by: export-bank.mjs.
import { plot } from './graph-svg.mjs'
const BS = String.fromCharCode(92)
const M = (x) => BS + '(' + x + BS + ')'
const WX = [-6, 6]
let WY = [-4, 4] // the window of the options: part a (a bell of height <= 1) uses a flatter one

// sample a curve, pieces apart where it leaves the window or jumps (null between the pieces)
const curve = (fn, x0 = WX[0], x1 = WX[1]) => {
  const out = []
  let prev = null
  for (let x = x0; x <= x1 + 1e-9; x += 0.1) {
    const y = fn(x)
    const ok = Number.isFinite(y) && y >= WY[0] && y <= WY[1] && (prev === null || Math.abs(y - prev) < 1.2)
    if (ok) out.push([+x.toFixed(3), +y.toFixed(3)])
    else if (out.length && out[out.length - 1] !== null) out.push(null)
    prev = Number.isFinite(y) ? y : null
  }
  while (out.length && out[out.length - 1] === null) out.pop()
  return out
}
const sig = (pts) => pts.map((p) => (p ? `${Math.round(p[0] * 2)},${Math.round(p[1] * 4)}` : '|')).join(' ')
const svg = (pts) => plot(pts, { x: WX, y: WY, S: WY[1] === 3 ? 24 : 20 })
const tex = (m, p) => `${m === 1 ? '' : m === -1 ? '-' : m}(x${p === 0 ? '' : p < 0 ? ' + ' + -p : ' - ' + p})`.replace('(x)', 'x').replace(/^-x$/, '-x')

export function reciprocalParts(hash) {
  const pick = (seed, a) => a[hash(seed) % a.length]
  const mk = (p, n, level) => {
    const seed = `rc${p}${n}`
    WY = p === 'a' ? [-2, 3] : [-4, 4]
    if (p === 'a') {
      const h = pick(seed + 'h', [-2, -1, 0, 1, 2]), k = pick(seed + 'k', level === 1 ? [1, 2] : [3, 4]), a = 1
      const f = (x) => a * (x - h) * (x - h) + k
      const right = curve((x) => 1 / f(x))
      const wrong = [curve((x) => -1 / f(x)), curve(f), curve((x) => 1 / ((x - h) * (x - h) + 1) * (k === 1 ? 1 : 1)), curve((x) => 1 / ((x - (h === 0 ? 1 : -h)) * (x - (h === 0 ? 1 : -h)) + k))]
      if (k === 1) wrong[2] = curve((x) => 1 / (2 * (x - h) * (x - h) + 1))
      return { q: `The graph of ${M('y = f(x)')} is shown. Which graph is the graph of ${M(`y = ${BS}frac{1}{f(x)}`)}?`, right, wrong, level,
        f: { bbox: [-6, 8, 6, -2], big: true, elements: [{ t: 'function', expr: `(x-${h})^2+${k}`.replace('-0)', ')').replace('x--', 'x+').replace('-(-', '+('), from: Math.max(-6, h - 4), to: Math.min(6, h + 4) }, { t: 'point', x: h, y: k }, { t: 'text', x: h + 2.6, y: k + 3, s: 'y = f(x)' }] },
        s: `${M(`f(x) = (x ${h < 0 ? '+ ' + -h : h > 0 ? '- ' + h : ''})^2 + ${k}`.replace('(x )', 'x'))} never equals 0, so ${M(`y = ${BS}frac{1}{f(x)}`)} has no vertical asymptote. At the vertex ${M(`(${h}, ${k})`)} the value of f is smallest, so the reciprocal has its maximum ${M(`${BS}frac{1}{${k}}`)} there, and it approaches 0 as x gets far from ${h}: a bell-shaped graph above the x-axis.` }
    }
    const pp = pick(seed + 'p', [-3, -2, -1, 1, 2, 3])
    const m = level === 1 ? pick(seed + 'm', [1, -1]) : pick(seed + 'm', [2, -2])
    const f = (x) => m * (x - pp)
    const right = curve((x) => 1 / f(x))
    const q0 = pp === 0 ? 1 : 0
    const wrong = [curve((x) => -1 / f(x)), curve(f), curve((x) => 1 / (m * (x - q0 - (pp === 0 ? 0 : 0)))), curve((x) => 1 / f(x) + 1)]
    return { q: `The graph of ${M('y = f(x)')} is shown. Which graph is the graph of ${M(`y = ${BS}frac{1}{f(x)}`)}?`, right, wrong, level,
      f: { bbox: [-6, 6, 6, -6], big: true, elements: [{ t: 'function', expr: `${m}*(x-${pp})`.replace('-(-', '+(').replace('--', '+'), from: -6, to: 6 }, { t: 'point', x: pp, y: 0 }, { t: 'text', x: 4.2, y: m > 0 ? 2.4 : -2.4, s: 'y = f(x)' }] },
      s: `${M(`f(x) = ${tex(m, pp)}`)} is 0 at ${M(`x = ${pp}`)}, so the reciprocal has a vertical asymptote there. Where f is positive, ${M(`${BS}frac{1}{f(x)}`)} is positive and where f is negative it is negative, and it gets closer to 0 as ${M('|f(x)|')} grows: a hyperbola with two branches.` }
  }
  return ['a', 'b'].map((p) => {
    const qs = []
    const seen = new Set()
    for (let n = 0; qs.length < 10 && n < 80; n++) {
      const level = qs.length < 5 ? 1 : 2
      const q = mk(p, n, level)
      const keys = new Set([sig(q.right)])
      const d = []
      for (const w of q.wrong) if (w.length > 3 && !keys.has(sig(w))) { keys.add(sig(w)); d.push(w) }
      if (seen.has(q.q + JSON.stringify(q.f)) || q.right.length < 4 || d.length < 3) continue
      seen.add(q.q + JSON.stringify(q.f))
      qs.push({ q: q.q, a: svg(q.right), d: d.slice(0, 3).map(svg), s: q.s, l: level, f: q.f })
    }
    return { p, qs }
  })
}
