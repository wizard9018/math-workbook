// Precalculus 11 4.4 exercise 1 (graph a system of non-linear inequalities): the boundary curves (parabola and line, or two parabolas) are drawn, dashed or solid, and the student clicks the
// region that is the solution of the system (region-pick.tsx). Parts a-h: y >= x^2 - k with a line, two shifted parabolas, y > x^2 - 1 with y < 3 - x^2 ... The curves meet at grid points
// (so the regions are easy to see); the plane scale comes from plane-fit.mjs. Made here (no Gemini). Imported by: export-bank.mjs.
const BS = String.fromCharCode(92)
const M = (x) => BS + '(' + x + BS + ')'
import { fitPlane } from './plane-fit.mjs'
const OPS = { '>': [BS + 'gt', true, false], '<': ['<', false, false], '>=': [BS + 'ge', true, true], '<=': [BS + 'le', false, true] }

export function ineqNonlinearParts(hash) {
  const r = (seed, lo, hi) => lo + ((hash(seed) >>> 9) % (hi - lo + 1))
  const pick = (seed, a) => a[r(seed, 0, a.length - 1)]
  const lin = (c, v, first) => (c === 0 ? '' : `${first ? (c < 0 ? '-' : '') : c < 0 ? ' - ' : ' + '}${Math.abs(c) === 1 ? '' : Math.abs(c)}${v}`)
  const konst = (c) => (c === 0 ? '' : c < 0 ? ` - ${Math.abs(c)}` : ` + ${c}`)
  // curve y = a(x - h)^2 + k (a = 0: the line y = m x + c, stored as b = m); kind 'sq' x^2 + k, 'std' expanded, 'line'
  const mk = (kind, a0, s) => {
    if (kind === 'line') { const m = pick(s + 'm', [1, 2, -1, -2, 3, -3]), c = r(s + 'c', -5, 5); return { a: 0, b: m, c, line: true, tex: (op) => `y ${op} ${lin(m, 'x', true)}${konst(c)}` } }
    const h = kind === 'sq' ? 0 : r(s + 'h', -3, 3), k = r(s + 'k', -5, 5)
    const a = a0
    const B = -2 * a * h, C = a * h * h + k
    return { a, b: B, c: C, h, k, tex: (op) => `y ${op} ${lin(a, 'x^2', true)}${kind === 'sq' ? '' : lin(B, 'x', false)}${konst(kind === 'sq' ? k : C)}` }
  }
  const KINDS = { a: [['sq', 1], ['line']], b: [['std', 1], ['std', 1]], c: [['sq', 1], ['line']], d: [['std', 1], ['line']], e: [['std', 1], ['line']], f: [['std', 1], ['std', -1]], g: [['sq', 1], ['sq', -1]], h: [['sq', 1], ['line']] }
  return Object.keys(KINDS).map((p) => {
    const qs = []
    const seen = new Set()
    for (let i = 0; qs.length < 10 && i < 6000; i++) {
      const s = `in${p}${i}`
      const u = mk(KINDS[p][0][0], KINDS[p][0][1], s + 'u'), v = mk(KINDS[p][1][0], KINDS[p][1][1], s + 'v')
      const A = u.a - v.a, B = u.b - v.b, C = u.c - v.c
      let xs = []
      if (A === 0) { if (B === 0) continue; const x1 = -C / B; if (!Number.isInteger(x1)) continue; xs = [x1] } else {
        const D = B * B - 4 * A * C
        if (D <= 0) continue
        const sq = Math.round(Math.sqrt(D))
        if (sq * sq !== D) continue
        const x1 = (-B - sq) / (2 * A), x2 = (-B + sq) / (2 * A)
        if (!Number.isInteger(x1) || !Number.isInteger(x2)) continue
        xs = [x1, x2]
      }
      const val = (cv, x) => cv.a * x * x + cv.b * x + cv.c
      const ax = [], ay = []
      for (const cv of [u, v]) if (!cv.line) for (let d = -2; d <= 2; d++) { ax.push(cv.h + d); ay.push(val(cv, cv.h + d)) }
      for (const x of xs) { ax.push(x); ay.push(val(u, x)) }
      const plane = fitPlane(ax, ay)
      if (!plane) continue
      const ou = pick(s + 'ou', ['>', '<', '>=', '<=']), ov = pick(s + 'ov', ['>', '<', '>=', '<='])
      if (p === 'g' && !(OPS[ou][1] && !OPS[ov][1])) continue // y > x^2 - k and y < k - x^2
      if (p === 'f' && !(OPS[ou][1] && !OPS[ov][1])) continue
      const tu = u.tex(OPS[ou][0]), tv = v.tex(OPS[ov][0])
      if (seen.has(tu + '|' + tv) || tu.slice(5) === tv.slice(5)) continue
      seen.add(tu + '|' + tv)
      const bound = (cv, op) => ({ ...(cv.line ? { m: cv.b, c: cv.c } : { m: 0, c: 0, a: cv.a, h: cv.h, k: cv.k }), dashed: !OPS[op][2], above: OPS[op][1] })
      const word = (cv, op) => `${OPS[op][1] ? 'above' : 'below'} the ${cv.line ? 'line' : 'parabola'}`
      qs.push({
        q: `The boundary curves of the system of inequalities are drawn.\n${M(tu)}\n${M(tv)}\nClick the region that is the solution of the system.`,
        a: `The region ${word(u, ou)} ${BS === '' ? '' : 'and'} ${word(v, ov)}`,
        d: [],
        s: `Each inequality is true on one side of its boundary (${M(OPS[ou][0])} ${OPS[ou][2] ? 'solid' : 'dashed'}, ${M(OPS[ov][0])} ${OPS[ov][2] ? 'solid' : 'dashed'}). The solution is the region where both are true: ${word(u, ou)} and ${word(v, ov)}.`,
        l: qs.length < 5 ? 1 : 2,
        dr: { ...plane, m: 0, c: 0, reg: [bound(u, ou), bound(v, ov)] },
      })
    }
    return { p, qs }
  }).filter((x) => x.qs.length)
}
