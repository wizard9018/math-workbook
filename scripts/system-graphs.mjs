// Math 10 6.1 exercise 6 (solve the system of equations by graphing): the student draws both lines and clicks the point where they meet (system-draw.tsx), like the textbook.
// Parts a-l take the textbook's kinds of system: two standard-form lines, a standard-form line with a function f(x) = mx + b, a fraction in front of y, a vertical line x = k,
// a horizontal line f(x) = k, two functions with fractional slopes. The crossing point is a grid point inside the plane -6..6 and each line has two grid points. Made here (no Gemini).
// Imported by: export-bank.mjs.
const BS = String.fromCharCode(92)
const M = (x) => BS + '(' + x + BS + ')'
const PLANE = { xmin: -6, xmax: 6, ymin: -6, ymax: 6, xs: 1, ys: 1, xlabel: 'x', ylabel: 'y' }
const fr = (p, q) => (q === 1 ? String(p) : `${p < 0 ? '-' : ''}${BS}frac{${Math.abs(p)}}{${q}}`)
const coef = (p, q) => (q === 1 ? (p === 1 ? '' : p === -1 ? '-' : String(p)) : fr(p, q))
const signed = (n) => `${n < 0 ? '- ' : '+ '}${Math.abs(n)}`

export function systemGraphParts(hash) {
  const r = (seed, lo, hi) => lo + ((hash(seed) >>> 9) % (hi - lo + 1))
  const pick = (seed, a) => a[r(seed, 0, a.length - 1)]
  // each line kind returns {eq, m, c, vx?} for a line through (ix, iy), or null
  const L = {
    std: (s, ix, iy) => {
      const A = pick(s + 'A', [1, 2, 3, -1, -2, 4]), B = pick(s + 'B', [1, 2, -1, -2, 3, -3]), C = A * ix + B * iy
      const ay = Math.abs(B) === 1 ? '' : Math.abs(B)
      return { eq: `${A === 1 ? '' : A === -1 ? '-' : A}x ${B < 0 ? '-' : '+'} ${ay}y = ${C}`, m: -A / B, c: C / B }
    },
    fn: (s, ix, iy, name = 'f') => {
      const [p, q] = pick(s + 'm', [[1, 1], [2, 1], [-1, 1], [-2, 1], [-1, 2], [1, 2], [3, 2], [-3, 2], [2, 3], [-2, 3], [4, 3], [-1, 3]])
      if ((p * ix) % q !== 0) return null
      const b = iy - (p * ix) / q
      return { eq: `${name}(x) = ${coef(p, q)}x ${b === 0 ? '' : signed(b)}`.trim(), m: p / q, c: b }
    },
    fracy: (s, ix, iy) => {
      const q = pick(s + 'q', [2, 3]), A = pick(s + 'A', [1, 2, 3]), C = A * ix - iy / q
      if (iy % q !== 0) return null
      return { eq: `${A === 1 ? '' : A}x - ${fr(1, q)}y = ${C}`, m: A * q, c: -C * q }
    },
    vert: (s, ix) => ({ eq: `x = ${ix}`, m: 0, c: 0, vx: ix }),
    horiz: (s, ix, iy, name = 'f') => ({ eq: name === 'y' ? `y = ${iy}` : `${name}(x) = ${iy}`, m: 0, c: iy }),
  }
  const same = (u, v) => u.vx === undefined && v.vx === undefined && Math.abs(u.m - v.m) < 1e-9
  const part = (p, k1, k2, names) => {
    const qs = []
    const seen = new Set()
    for (let i = 0; qs.length < 10 && i < 600; i++) {
      const s = `sg${p}${i}`
      const ix = r(s + 'x', -4, 4), iy = r(s + 'y', -4, 4)
      if (ix === 0 && iy === 0 && qs.length < 8) continue // the crossing is not always the origin
      const a = L[k1](s + '1', ix, iy, names?.[0]), b = L[k2](s + '2', ix, iy, names?.[1])
      if (!a || !b || same(a, b) || (a.vx !== undefined && b.vx !== undefined)) continue
      const pts = (ln) => { let n = 0; for (let x = -6; x <= 6; x++) for (let y = -6; y <= 6; y++) if (ln.vx !== undefined ? x === ln.vx : Math.abs(y - (ln.m * x + ln.c)) < 1e-9) n++; return n }
      if (pts(a) < 2 || pts(b) < 2) continue
      const key = `${a.eq}|${b.eq}`
      if (seen.has(key)) continue
      seen.add(key)
      qs.push({
        q: `Solve the system of equations by graphing:\n${M(a.eq)}\n${M(b.eq)}\nDraw both lines, then click the point where they meet.`,
        a: `The lines meet at ${M(`(${ix}, ${iy})`)}`,
        d: [],
        s: `Graph each line (two grid points each). The lines cross at ${M(`(${ix}, ${iy})`)}: check it in both equations. The solution is ${M(`x = ${ix},~y = ${iy}`)}.`,
        l: qs.length < 5 ? 1 : 2,
        dr: { ...PLANE, m: a.m, c: a.c, ...(a.vx !== undefined ? { vx: a.vx } : {}), tol: 1e-6, sys: { m2: b.m, c2: b.c, ...(b.vx !== undefined ? { vx2: b.vx } : {}), ix, iy } },
      })
    }
    return { p, qs }
  }
  return [
    part('a', 'std', 'std'), part('b', 'std', 'fn', [null, 'f']), part('c', 'fn', 'fracy', ['f']), part('d', 'std', 'std'), part('e', 'std', 'std'), part('f', 'fracy', 'fracy'),
    part('g', 'vert', 'std'), part('h', 'std', 'horiz', [null, 'f']), part('i', 'std', 'std'), part('j', 'std', 'std'), part('k', 'fn', 'fn', ['f', 'g']), part('l', 'horiz', 'fn', ['y', 'f']),
  ].filter((x) => x.qs.length)
}
