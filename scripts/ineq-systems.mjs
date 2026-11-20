// Precalculus 11 4.3 exercise 5 (graph a system of linear inequalities): both boundary lines are drawn (dashed or solid) and the student clicks the region that is the solution of the system
// (region-pick.tsx). Parts a-h: two inequalities solved for y, one in standard form, vertical / horizontal boundaries, two in standard form. The lines meet inside the plane -6..6 (not parallel).
// Made here (no Gemini). Imported by: export-bank.mjs.
const BS = String.fromCharCode(92)
const M = (x) => BS + '(' + x + BS + ')'
const PLANE = { xmin: -6, xmax: 6, ymin: -6, ymax: 6, xs: 1, ys: 1, xlabel: 'x', ylabel: 'y' }
const OPS = { '>': [BS + 'gt', true, false], '<': ['<', false, false], '>=': [BS + 'ge', true, true], '<=': [BS + 'le', false, true] }
const fr = (p, q) => (q === 1 ? String(p) : `${p < 0 ? '-' : ''}${BS}frac{${Math.abs(p)}}{${q}}`)
const lin = (c, v, first) => (c === 0 ? '' : `${first ? (c < 0 ? '-' : '') : c < 0 ? ' - ' : ' + '}${Math.abs(c) === 1 ? '' : Math.abs(c)}${v}`)

export function ineqSystemParts(hash) {
  const r = (seed, lo, hi) => lo + ((hash(seed) >>> 9) % (hi - lo + 1))
  const pick = (seed, a) => a[r(seed, 0, a.length - 1)]
  // one inequality: {tex, m, c, vx?, dashed, above}; kind 'y' (y op mx + c), 'std' (Ax + By op n), 'v' (x op k), 'h' (y op k)
  const one = (kind, s) => {
    const op = pick(s + 'o', ['>', '<', '>=', '<='])
    const dashed = !OPS[op][2]
    if (kind === 'y') {
      const [p, q] = pick(s + 'm', [[1, 1], [2, 1], [-1, 1], [-2, 1], [1, 2], [-1, 2], [3, 2], [-3, 2], [1, 3], [-2, 3]]), c = r(s + 'c', -4, 4)
      return { tex: `y ${OPS[op][0]} ${fr(p, q)}x${c === 0 ? '' : c < 0 ? ` - ${-c}` : ` + ${c}`}`, m: p / q, c, dashed, above: OPS[op][1] }
    }
    if (kind === 'std') {
      const A = pick(s + 'A', [1, 2, 3, -1, -2, -3]), B = pick(s + 'B', [1, 2, 3, -1, -2, -3]), n = r(s + 'n', -8, 8)
      return { tex: `${lin(A, 'x', true)}${lin(B, 'y', false)} ${OPS[op][0]} ${n}`, m: -A / B, c: n / B, dashed, above: OPS[op][1] === (B > 0) }
    }
    if (kind === 'v') { const k = r(s + 'k', -4, 4); return { tex: `x ${OPS[op][0]} ${k}`, m: 0, c: 0, vx: k, dashed, above: OPS[op][1] } }
    const k = r(s + 'k', -4, 4)
    return { tex: `y ${OPS[op][0]} ${k}`, m: 0, c: k, dashed, above: OPS[op][1] }
  }
  const KINDS = { a: ['y', 'y'], b: ['std', 'y'], c: ['v', 'h'], d: ['std', 'std'], e: ['v', 'std'], f: ['h', 'y'], g: ['std', 'std'], h: ['y', 'std'] }
  // the point where the lines meet, or null (parallel)
  const meet = (u, v) => {
    if (u.vx !== undefined && v.vx !== undefined) return null
    if (u.vx !== undefined) return [u.vx, v.m * u.vx + v.c]
    if (v.vx !== undefined) return [v.vx, u.m * v.vx + u.c]
    if (Math.abs(u.m - v.m) < 1e-9) return null
    const x = (v.c - u.c) / (u.m - v.m)
    return [x, u.m * x + u.c]
  }
  const inPlane = (ln) => { if (ln.vx !== undefined) return true; let n = 0; for (let x = -6; x <= 6; x += 0.5) { const y = ln.m * x + ln.c; if (Math.abs(y) <= 6) n++ } return n >= 6 }
  return Object.keys(KINDS).map((p) => {
    const qs = []
    const seen = new Set()
    for (let i = 0; qs.length < 10 && i < 800; i++) {
      const s = `is${p}${i}`
      const u = one(KINDS[p][0], s + '1'), v = one(KINDS[p][1], s + '2')
      const pt = meet(u, v)
      if (!pt || Math.abs(pt[0]) > 5 || Math.abs(pt[1]) > 5 || !inPlane(u) || !inPlane(v)) continue
      if (Math.abs(u.m - v.m) < 1e-9 && u.vx === v.vx) continue
      const key = u.tex + '|' + v.tex
      if (seen.has(key)) continue
      seen.add(key)
      const side = (ln) => (ln.vx !== undefined ? (ln.above ? 'to the right of' : 'to the left of') : ln.above ? 'above' : 'below')
      qs.push({
        q: `The boundary lines of the system of inequalities are drawn.\n${M(u.tex)}\n${M(v.tex)}\nClick the region that is the solution of the system.`,
        a: `The region ${side(u)} the first line and ${side(v)} the second line`,
        d: [],
        s: `The solution is where both inequalities are true: ${side(u)} the first line (${u.dashed ? 'dashed' : 'solid'}) and ${side(v)} the second line (${v.dashed ? 'dashed' : 'solid'}). Test a point (for example one in the region) in both inequalities.`,
        l: qs.length < 5 ? 1 : 2,
        dr: { ...PLANE, m: 0, c: 0, reg: [u, v].map(({ m, c, vx, dashed, above }) => ({ m, c, ...(vx !== undefined ? { vx } : {}), dashed, above })) },
      })
    }
    return { p, qs }
  }).filter((x) => x.qs.length)
}
