// Precalculus 11 4.1 exercises 3 and 4 (solve a parabola-line / two-parabola system by graphing): the student plots 5 points of each parabola (2 points of a line), then clicks each point where
// the graphs meet (parab-system.tsx; nothing to click when they do not meet). Ex 3 parts a-h: parabola + line (y = x^2 - k, -x^2 + k, (x - h)^2, -(x - h)^2 + k, x^2 + bx + c, ... , a line y = mx + c or
// mx + y = c); ex 4 parts a-f: two parabolas (x^2 and (x - h)^2, 2x^2 - k and -x^2 + k, ...). The intersections are grid points; the plane scale comes from plane-fit.mjs.
// A curve is y = a(x - h)^2 + k (a = 0: the line y = m x + c, stored as b = m, c). Made here (no Gemini). Imported by: export-bank.mjs.
const BS = String.fromCharCode(92)
const M = (x) => BS + '(' + x + BS + ')'
import { fitPlane } from './plane-fit.mjs'

export function parabSystemParts(hash, ex) {
  const r = (seed, lo, hi) => lo + ((hash(seed) >>> 9) % (hi - lo + 1))
  const pick = (seed, a) => a[r(seed, 0, a.length - 1)]
  const lin = (c, v, first) => (c === 0 ? '' : `${first ? (c < 0 ? '-' : '') : c < 0 ? ' - ' : ' + '}${Math.abs(c) === 1 && v ? '' : Math.abs(c)}${v}`)
  const konst = (c) => (c === 0 ? '' : c < 0 ? ` - ${Math.abs(c)}` : ` + ${c}`)
  const tex = (form, a, h, k) => {
    if (form === 'sq') return `y = ${lin(a, 'x^2', true)}${konst(k)}`
    if (form === 'vert') return `y = ${lin(a, '', true) === '' ? '' : a === 1 ? '' : a === -1 ? '-' : a}(x ${h < 0 ? '+' : '-'} ${Math.abs(h)})^2${konst(k)}`
    return `y = ${lin(a, 'x^2', true)}${lin(-2 * a * h, 'x', false)}${konst(a * h * h + k)}`
  }
  const SPEC = ex === 3
    ? [['sq', 1], ['sq', -1], ['vert', 1], ['vert', -1], ['std', 1], ['std', -1], ['std', 2], ['std', -2]].map(([f, a]) => [[f, a], ['line']])
    : [[['sq', 1], ['vert', 1]], [['sq', 2], ['sq', -1]], [['std', 1], ['std', 1]], [['vert', 1], ['vert', -1]], [['std', 2], ['std', 2]], [['std', -1], ['std', 1]]]
  const coefs = (form, a, s) => {
    const aa = form === 'vert' || form === 'std' ? a : a
    return aa
  }
  return SPEC.map(([c1, c2], pi) => {
    const p = 'abcdefgh'[pi]
    const qs = []
    const seen = new Set()
    const kinds = { 2: 0, 1: 0, 0: 0 }
    for (let i = 0; qs.length < 10 && i < 20000; i++) {
      const s = `ps${ex}${p}${i}`
      const mk = (c, t) => {
        if (c[0] === 'line') {
          const m = r(s + t + 'm', -3, 3), cc = r(s + t + 'c', -6, 6)
          return { line: true, a: 0, h: 0, k: 0, b: m, c: cc, m, std: pi >= 5 && m !== 0 }
        }
        const [form, a0] = c
        const a = Math.abs(a0) === 2 && form !== 'std' ? a0 : a0
        const h = form === 'sq' ? 0 : r(s + t + 'h', -4, 4), k = r(s + t + 'k', -8, 8)
        if ((form === 'vert' && h === 0) || (form === 'sq' && k === 0 && ex === 3)) return null
        return { line: false, form, a, h, k, b: -2 * a * h, c: a * h * h + k }
      }
      const u = mk(c1, 'u'), v = mk(c2, 'v')
      if (!u || !v) continue
      const A = u.a - v.a, B = u.b - v.b, C = u.c - v.c
      let xs = []
      if (A === 0) {
        if (B === 0) continue
        const x1 = -C / B
        if (!Number.isInteger(x1)) continue
        xs = [x1]
      } else {
        const D = B * B - 4 * A * C
        if (D > 0) {
          const sq = Math.round(Math.sqrt(D))
          if (sq * sq !== D) continue
          const x1 = (-B - sq) / (2 * A), x2 = (-B + sq) / (2 * A)
          if (!Number.isInteger(x1) || !Number.isInteger(x2)) continue
          xs = [x1, x2].sort((p1, p2) => p1 - p2)
        } else if (D === 0) {
          const x1 = -B / (2 * A)
          if (!Number.isInteger(x1)) continue
          xs = [x1]
        }
      }
      if (ex === 4 && u.a === v.a && u.b === v.b) continue
      const val = (cv, x) => cv.a * x * x + cv.b * x + cv.c
      const ints = xs.map((x) => [x, val(u, x)])
      if (kinds[xs.length] >= (xs.length === 2 ? 7 : A === 0 ? 10 : 4)) continue
      const ax = [], ay = []
      for (const cv of [u, v]) if (!cv.line) for (let d = -2; d <= 2; d++) { ax.push(cv.h + d); ay.push(val(cv, cv.h + d)) }
      for (const t of ints) { ax.push(t[0]); ay.push(t[1]) }
      if (!ax.length) continue
      const plane = fitPlane(ax, ay)
      if (!plane) continue
      const gridPts = (cv) => { let n = 0; for (let x = plane.xmin; x <= plane.xmax + 1e-9; x += plane.xs) { const y = val(cv, x); if (y >= plane.ymin - 1e-9 && y <= plane.ymax + 1e-9 && Math.abs(y / plane.ys - Math.round(y / plane.ys)) < 1e-9) n++ } return n }
      if (gridPts(u) < (u.line ? 2 : 5) || gridPts(v) < (v.line ? 2 : 5)) continue
      const eq = (cv) => (cv.line ? (cv.std ? `${lin(-cv.m, 'x', true)} + y = ${cv.c}` : cv.m === 0 ? `y = ${cv.c}` : `y = ${lin(cv.m, 'x', true)}${konst(cv.c)}`) : tex(cv.form, cv.a, cv.h, cv.k))
      const e1 = eq(u), e2 = eq(v)
      const key = e1 + '|' + e2
      if (seen.has(key) || e1 === e2) continue
      seen.add(key)
      kinds[xs.length]++
      const meet = ints.map((t) => M(`(${t[0]}, ${t[1]})`))
      const curve = (cv) => (cv.line ? { m: cv.m, c: cv.c } : { a: cv.a, h: cv.h, k: cv.k })
      qs.push({
        q: `Solve the system by graphing:\n${M(e1)}\n${M(e2)}\nPlot ${u.line || v.line ? '5 points of the parabola and 2 points of the line' : '5 points of each parabola'}, then click each point where the graphs meet. If they do not meet, press Submit.`,
        a: ints.length ? `The graphs meet at ${meet.join(' and ')}` : 'The graphs do not meet (no real solution)',
        d: [],
        s: `Graph both curves. ${ints.length ? `They meet at ${meet.join(' and ')}: check each point in both equations.` : 'They never meet, so the system has no real solution.'}`,
        l: qs.length < 5 ? 1 : 2,
        dr: { ...plane, m: 0, c: 0, par: { c1: curve(u), c2: curve(v), ints } },
      })
    }
    return { p, qs }
  }).filter((x) => x.qs.length)
}
