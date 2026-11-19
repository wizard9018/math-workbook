// G8 5.6 exercise 6 (graph a linear equation): the student draws the line on a coordinate plane (graph-draw.tsx: click two points on the line, Submit).
// Made here from the equations (no Gemini): the right answer is "both points are on the line", checked from the spec in the question (field `dr`).
// Parts: a slope-intercept form, b standard form with whole intercepts, c horizontal / vertical lines, d fractional slope (harder).
// Imported by: export-bank.mjs.
const BS = String.fromCharCode(92)
const M = (x) => BS + '(' + x + BS + ')'
const PLANE = { xmin: -6, xmax: 6, ymin: -6, ymax: 6, xs: 1, ys: 1, xlabel: 'x', ylabel: 'y' }
const sgn = (n) => (n < 0 ? '- ' + -n : '+ ' + n)

// y = m x + c as text (m may be a fraction p/q)
export const slopeForm = (p, q, c) => {
  const coef = q === 1 ? (p === 1 ? '' : p === -1 ? '-' : String(p)) : `${p < 0 ? '-' : ''}${BS}frac{${Math.abs(p)}}{${q}}`
  const x = p === 0 ? '' : `${coef}x`
  const cc = c === 0 ? '' : p === 0 ? String(c) : ` ${sgn(c)}`
  return `y = ${x}${cc}` || 'y = 0'
}
const pointsOn = (m, c) => {
  const out = []
  for (let x = -6; x <= 6; x++) { const y = m * x + c; if (Number.isInteger(+y.toFixed(9)) && Math.abs(y) <= 6) out.push([x, Math.round(y)]) }
  return out
}
const finish = (q, l, line) => {
  const m = line.m ?? 0, c = line.c ?? 0
  const pts = line.vx !== undefined ? [[line.vx, -2], [line.vx, 3]] : pointsOn(m, c).slice(0, 2)
  const pa = pts.map(([x, y]) => `(${x}, ${y})`).join(' ' + BS + 'text{ and } ')
  return { q, a: `The line through ${M(pa)}`, d: [], s: line.s(pts), l, dr: { ...PLANE, m, c, ...(line.vx !== undefined ? { vx: line.vx } : {}) } }
}
const ask = (eq) => `Graph the line ${M(eq)} on the coordinate plane: click two points on the line, then press Submit.`

export function graphLineParts(hash) {
  const pick = (seed, arr) => arr[hash(seed) % arr.length]
  const uniq = (list) => { const seen = new Set(); return list.filter((x) => !seen.has(x.q) && seen.add(x.q)) }
  const part = (p, make, n) => ({ p, qs: uniq(Array.from({ length: n * 3 }, (_, i) => make(p + i, i)).filter(Boolean)).slice(0, n) })
  const a = part('a', (s, i) => {
    const m = pick(s + 'm', [1, 2, -1, -2, 3, -3, 1, -1, 2]), c = pick(s + 'c', [-4, -3, -2, -1, 0, 1, 2, 3, 4])
    if (pointsOn(m, c).length < 3) return null
    return finish(ask(slopeForm(m, 1, c)), i < 6 ? 1 : 2, { m, c, s: (pts) => `Find two points: when ${M('x = ' + pts[0][0])}, ${M('y = ' + pts[0][1])}; when ${M('x = ' + pts[1][0])}, ${M('y = ' + pts[1][1])}. Plot ${M(`(${pts[0]})`)} and ${M(`(${pts[1]})`)}, then draw the line through them.` })
  }, 10)
  const b = part('b', (s, i) => {
    const A = pick(s + 'A', [1, 1, 2, 3, 1]), B = pick(s + 'B', [1, 2, 1, 3, -1, -2]), k = pick(s + 'k', [2, 3, 4, 5, 6, -2, -3, -4])
    const m = -A / B, c = k / B
    if (pointsOn(m, c).length < 2) return null
    const eq = `${A === 1 ? '' : A}x ${B < 0 ? '- ' + (-B === 1 ? '' : -B) : '+ ' + (B === 1 ? '' : B)}y = ${k}`
    return finish(ask(eq), i < 6 ? 1 : 2, { m, c, s: (pts) => `Find two integer points on the line by choosing values of ${M('x')} and solving for ${M('y')}. For example ${M(`(${pts[0]})`)} and ${M(`(${pts[1]})`)}: both satisfy ${M(eq)}. Plot them and draw the line.` })
  }, 10)
  const cpart = part('c', (s, i) => {
    const v = pick(s + 'v', [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5])
    return i % 2 === 0
      ? finish(ask(`y = ${v}`), 1, { m: 0, c: v, s: () => `Every point on the line has ${M('y = ' + v)}: a horizontal line through ${M(`(0, ${v})`)}.` })
      : finish(ask(`x = ${v}`), 1, { vx: v, s: () => `Every point on the line has ${M('x = ' + v)}: a vertical line through ${M(`(${v}, 0)`)}.` })
  }, 10)
  const d = part('d', (s, i) => {
    const q = pick(s + 'q', [2, 3, 2, 4]), p = pick(s + 'p', [1, -1, 3, -3, 1, -1])
    const c = pick(s + 'c', [-3, -2, -1, 0, 1, 2, 3])
    if (Math.abs(p) === q || (p % q === 0)) return null
    const m = p / q
    if (pointsOn(m, c).length < 2) return null
    return finish(ask(slopeForm(p, q, c)), 2, { m, c, s: (pts) => `The slope is ${M(`${BS}frac{${p}}{${q}}`)}: start at the ${M('y')}-intercept ${M(`(0, ${c})`)} and go ${Math.abs(p)} unit${Math.abs(p) > 1 ? 's' : ''} ${p > 0 ? 'up' : 'down'} for every ${q} to the right. A second point is ${M(`(${pts.find(([x]) => x !== 0) ?? pts[1]})`)}. Draw the line through them.` })
  }, 10)
  return [a, b, cpart, d].filter((x) => x.qs.length)
}
