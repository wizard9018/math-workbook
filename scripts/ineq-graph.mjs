// Precalculus 11 4.3 exercise 3 (graph a linear inequality in two variables): the student draws the boundary line (two points), chooses solid or dashed and clicks the side to shade
// (ineq-draw.tsx). Parts a-h: Ax + y, Ax + By, fractions / decimals in front of x and y, y compared with mx + c (positive / negative slope), x compared with a number (vertical line),
// y compared with a number (horizontal line). The line has at least two grid points inside the plane -6..6. Made here (no Gemini). Imported by: export-bank.mjs.
const BS = String.fromCharCode(92)
const M = (x) => BS + '(' + x + BS + ')'
const PLANE = { xmin: -6, xmax: 6, ymin: -6, ymax: 6, xs: 1, ys: 1, xlabel: 'x', ylabel: 'y' }
const OPS = { '>': [BS + 'gt', true, false], '<': ['<', false, false], '>=': [BS + 'ge', true, true], '<=': [BS + 'le', false, true] }
const fr = (p, q) => (q === 1 ? String(p) : `${p < 0 ? '-' : ''}${BS}frac{${Math.abs(p)}}{${q}}`)
const lin = (c, v, first) => (c === 0 ? '' : `${first ? (c < 0 ? '-' : '') : c < 0 ? ' - ' : ' + '}${Math.abs(c) === 1 ? '' : Math.abs(c)}${v}`)

export function ineqGraphParts(hash, salt = '', letters = 'abcdefgh') {
  const r = (seed, lo, hi) => lo + ((hash(seed) >>> 9) % (hi - lo + 1))
  const pick = (seed, a) => a[r(seed, 0, a.length - 1)]
  const gridPts = (m, c, vx) => { let n = 0; if (vx !== undefined) return 13; for (let x = -6; x <= 6; x++) { const y = m * x + c; if (Math.abs(y - Math.round(y)) < 1e-9 && Math.abs(y) <= 6) n++ } return n }
  return letters.split('').map((pl) => {
    const p = pl === 'i' ? 'b' : pl // (part i: like b)
    const qs = []
    const seen = new Set()
    for (let i = 0; qs.length < 10 && i < 600; i++) {
      const s = `ig${salt}${pl}${i}`
      const op = pick(s + 'o', ['>', '<', '>=', '<='])
      let m = 0, c = 0, vx, up, lhs
      if (p === 'a' || p === 'b') {
        const A = pick(s + 'A', [1, 2, 3, 4, -1, -2, -3]), B = p === 'a' ? 1 : pick(s + 'B', [2, 3, -1, -2, -3]), n = r(s + 'n', -8, 8)
        m = -A / B; c = n / B; up = (OPS[op][1]) === (B > 0)
        lhs = `${lin(A, 'x', true)}${lin(B, 'y', false)} ${OPS[op][0]} ${n}`
      } else if (p === 'c' || p === 'd') {
        const A = pick(s + 'A', [1, 2, 3, -1, -2]), B = pick(s + 'B', [1, 2, 3, -1, -2, -3]), n = r(s + 'n', -6, 6), q = pick(s + 'q', [2, 3, 4])
        m = -A / B; c = n / B; up = (OPS[op][1]) === (B > 0)
        const co = (k, v, first) => `${first ? (k < 0 ? '-' : '') : k < 0 ? ' - ' : ' + '}${Math.abs(k) === 1 ? `${BS}frac{1}{${q}}` : `${BS}frac{${Math.abs(k)}}{${q}}`}${v}`
        lhs = `${co(A, 'x', true)}${co(B, 'y', false)} ${OPS[op][0]} ${fr(n, q)}`.replace(/\frac\{(\d+)\}\{1\}/g, '$1')
        if (n !== 0 && Math.abs(n) % q === 0) lhs = lhs.replace(fr(n, q), String(n / q))
        else { const un = n; lhs = lhs.replace(fr(n, q), fr(un, q)) }
      } else if (p === 'e' || p === 'f') {
        const [pp, qq] = pick(s + 'm', p === 'e' ? [[1, 2], [3, 2], [1, 3], [2, 3], [5, 2], [3, 1], [2, 1], [1, 1]] : [[-1, 2], [-3, 2], [-1, 3], [-2, 3], [-1, 1], [-2, 1], [-3, 1], [-3, 4]])
        c = r(s + 'c', -5, 5); m = pp / qq; up = OPS[op][1]
        lhs = `y ${OPS[op][0]} ${fr(pp, qq)}x${c === 0 ? '' : c < 0 ? ` - ${-c}` : ` + ${c}`}`
      } else if (p === 'g') {
        vx = r(s + 'k', -5, 5); up = OPS[op][1]
        lhs = `x ${OPS[op][0]} ${vx}`
      } else {
        c = r(s + 'k', -5, 5); up = OPS[op][1]
        lhs = `y ${OPS[op][0]} ${c}`
      }
      if (gridPts(m, c, vx) < 2 || seen.has(lhs)) continue
      seen.add(lhs)
      const dashed = !OPS[op][2]
      const side = vx !== undefined ? (up ? 'right' : 'left') : up ? 'above' : 'below'
      qs.push({
        q: `Graph the linear inequality ${M(lhs)}. Draw the boundary line (click two points), choose solid or dashed, then click the side to shade.`,
        a: `${dashed ? 'Dashed' : 'Solid'} boundary line, shaded ${vx !== undefined ? 'to the ' + side : side + ' the line'}`,
        d: [],
        s: `The boundary line is the graph of the equation. It is ${dashed ? `dashed because ${M(OPS[op][0])} does not include the line` : `solid because ${M(OPS[op][0])} includes the line`}. Test a point not on the line (for example ${M('(0, 0)')}, or a point next to it) to find the side that is shaded: ${vx !== undefined ? `the points to the ${side} of the line` : `the points ${side} the line`}.`,
        l: qs.length < 5 ? 1 : 2,
        dr: { ...PLANE, m, c, ...(vx !== undefined ? { vx } : {}), ineq: { dashed, above: up } },
      })
    }
    return { p: pl, qs }
  }).filter((x) => x.qs.length)
}
