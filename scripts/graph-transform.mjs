// Precalculus 12 2.4 exercise 9 (given the graph of y = f(x), the graph of -f(x), f(-x), -f(-x), f(x + 1), f(x) - 2, f(1 - x)) as a choice of four graphs.
// Gemini draws f and the four options (gen-transform-graphs.py -> bank/Precal-12-ch2/graph-transform.json). The right graph is computed here from f; of Gemini's options only the
// ones that really differ from it (and from each other and from f) are kept as wrong options, a question without three of them is dropped. Imported by: export-bank.mjs.
import { plot } from './graph-svg.mjs'
const BS = String.fromCharCode(92)
const M = (x) => BS + '(' + x + BS + ')'

const P9 = {
  a: { tex: 'y = -f(x)', map: ([x, y]) => [x, -y], rule: 'reflects the graph in the x-axis: every point (x, y) becomes (x, -y)' },
  b: { tex: 'y = f(-x)', map: ([x, y]) => [-x, y], rule: 'reflects the graph in the y-axis: every point (x, y) becomes (-x, y)' },
  c: { tex: 'y = -f(-x)', map: ([x, y]) => [-x, -y], rule: 'reflects the graph in both axes: every point (x, y) becomes (-x, -y)' },
  d: { tex: 'y = f(x + 1)', map: ([x, y]) => [x - 1, y], rule: 'moves the graph 1 unit to the left: every point (x, y) becomes (x - 1, y)' },
  e: { tex: 'y = f(x) - 2', map: ([x, y]) => [x, y - 2], rule: 'moves the graph 2 units down: every point (x, y) becomes (x, y - 2)' },
  f: { tex: 'y = f(1 - x)', map: ([x, y]) => [1 - x, y], rule: 'reflects the graph in the y-axis and moves it 1 unit to the right: every point (x, y) becomes (1 - x, y)' },
}
const P18 = {
  a: { tex: 'y = 2f(x)', map: ([x, y]) => [x, 2 * y], rule: 'stretches the graph vertically by 2: every point (x, y) becomes (x, 2y)' },
  b: { tex: 'y = f(2x)', map: ([x, y]) => [x / 2, y], rule: 'compresses the graph horizontally by 2: every point (x, y) becomes (x/2, y)' },
  c: { tex: BS + 'ignore', map: ([x, y]) => [2 * x, -y], rule: 'stretches the graph horizontally by 2 and reflects it in the x-axis: every point (x, y) becomes (2x, -y)' },
  d: { tex: BS + 'ignore', map: ([x, y]) => [-x, -y / 2], rule: 'reflects the graph in both axes and compresses it vertically by 1/2: every point (x, y) becomes (-x, -y/2)' },
}
P18.c.tex = 'y = -f(' + BS + 'frac{x}{2})'
P18.d.tex = 'y = -' + BS + 'frac{1}{2}f(-x)'
const P19 = {
  a: { tex: 'y = -f(x - 2)', map: ([x, y]) => [x + 2, -y], rule: 'reflects the graph in the x-axis and moves it 2 units to the right: every point (x, y) becomes (x + 2, -y)' },
  b: { tex: 'y = f(x - 3) - 2', map: ([x, y]) => [x + 3, y - 2], rule: 'moves the graph 3 units to the right and 2 units down: every point (x, y) becomes (x + 3, y - 2)' },
  c: { tex: 'y = f(-x) + 1', map: ([x, y]) => [-x, y + 1], rule: 'reflects the graph in the y-axis and moves it 1 unit up: every point (x, y) becomes (-x, y + 1)' },
  d: { tex: 'y = f(x + 2) + 3', map: ([x, y]) => [x - 2, y + 3], rule: 'moves the graph 2 units to the left and 3 units up: every point (x, y) becomes (x - 2, y + 3)' },
  e: { tex: 'y = -f(x) + 2', map: ([x, y]) => [x, -y + 2], rule: 'reflects the graph in the x-axis and moves it 2 units up: every point (x, y) becomes (x, -y + 2)' },
  f: { tex: 'y = f(-x - 1)', map: ([x, y]) => [-x - 1, y], rule: 'reflects the graph in the y-axis and moves it 1 unit to the left: every point (x, y) becomes (-x - 1, y)' },
  g: { tex: 'y = ' + BS + 'frac{1}{2}f(x) + 1', map: ([x, y]) => [x, y / 2 + 1], rule: 'compresses the graph vertically by 1/2 and moves it 1 unit up: every point (x, y) becomes (x, y/2 + 1)' },
  h: { tex: 'y = f(2x) - 1', map: ([x, y]) => [x / 2, y - 1], rule: 'compresses the graph horizontally by 2 and moves it 1 unit down: every point (x, y) becomes (x/2, y - 1)' },
}
const TABLES = { 9: P9, 18: P18, 19: P19 }
const asc = (v) => [...v].sort((a, b) => a[0] - b[0])
const ints = (v, lim) => Array.isArray(v) && v.length >= 2 && v.every((p) => Array.isArray(p) && p.length === 2 && Number.isInteger(p[0]) && Number.isInteger(p[1]) && Math.abs(p[0]) <= lim && Math.abs(p[1]) <= lim) && v.every((p, i) => i === 0 || p[0] > v[i - 1][0])
const same = (a, b) => a.length === b.length && a.every((p, i) => p[0] === b[i][0] && p[1] === b[i][1])
const txt = (v) => v.map((p) => `(${p[0]}, ${p[1]})`).join(', ')
const svg = (v) => plot(v, { x: [-7, 7], y: [-7, 7], dots: [[v[0][0], v[0][1], true], [v[v.length - 1][0], v[v.length - 1][1], true]], S: 14 })

// ex: 9, 18 or 19; data: the Gemini file (exercise 9: keys a-f; exercises 18 and 19: keys 18a, 19h ...)
export function graphTransformParts(data, ex = 9) {
  return Object.entries(TABLES[ex]).map(([p, def]) => {
    const qs = []
    const seen = new Set()
    for (const it of data?.[ex === 9 ? p : `${ex}${p}`] ?? []) {
      const f = it.f
      if (!ints(f, 6) || f.length < 3 || f.length > 5 || f.some((q) => Math.abs(q[1]) > 4)) continue
      const right = asc(f.map(def.map))
      if (right.some((q) => !Number.isInteger(q[0]) || !Number.isInteger(q[1]) || Math.abs(q[0]) > 7 || Math.abs(q[1]) > 7)) continue
      const wrong = []
      for (const o of it.options ?? []) {
        if (!ints(o, 7)) continue
        if (same(o, right) || wrong.some((w) => same(w, o))) continue
        wrong.push(o)
      }
      if (wrong.length < 3) continue
      const key = JSON.stringify(f)
      if (seen.has(key)) continue
      seen.add(key)
      const top = f.reduce((m, q) => (q[1] > m[1] ? q : m), f[0])
      qs.push({
        q: `The graph of ${M('y = f(x)')} is shown. Which graph is the graph of ${M(def.tex)}?`,
        a: svg(right),
        d: wrong.slice(0, 3).map(svg),
        s: `The transformation ${M(def.tex)} ${def.rule}. The vertices ${txt(asc(f))} of the graph of ${M('f')} become ${txt(right)}.`,
        l: it.l === 2 ? 2 : 1,
        f: {
          bbox: [-7, 7, 7, -7],
          big: true,
          elements: [
            ...f.slice(1).map((q, i) => ({ t: 'segment', p: f[i], q, color: '#2563eb' })),
            { t: 'point', x: f[0][0], y: f[0][1] },
            { t: 'point', x: f[f.length - 1][0], y: f[f.length - 1][1] },
            { t: 'text', x: Math.max(-5.5, Math.min(5.5, top[0])), y: Math.min(6.3, top[1] + 0.9), s: 'y = f(x)', color: '#2563eb' },
          ],
        },
      })
    }
    // 5 easier then 5 harder, at most 10
    const ord = [...qs.filter((q) => q.l === 1).slice(0, 5), ...qs.filter((q) => q.l === 2).slice(0, 5)]
    return { p, qs: ord }
  })
}
