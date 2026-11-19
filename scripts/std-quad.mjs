// Precalculus 11 2.2 exercise 6 ("Graph each quadratic function. Find the vertex, axis of symmetry, x-intercept(s) and y-intercept"), functions in standard form f(x) = ax^2 + bx + c.
// One question cannot do all of it, so the questions of a part take turns: plot 5 points (plot-points.tsx, chips "x = ..."), the vertex, the axis of symmetry, the y-intercept, the
// x-intercepts (whole numbers, or none), the domain and range, the maximum / minimum value (multiple choice). Parts a-h are standard-form functions like the textbook's (-x^2 - 4x,
// -x^2 + 4x - 3, x^2 - 4x + 5, -2x^2 - 4x + 3, 3x - x^2, ...), parts i and j are absolute values |x^2 - k| and |-x^2 + bx + c| (no vertex tasks: plot, y-intercept, x-intercepts,
// range, minimum). Made here (no Gemini). Imported by: export-bank.mjs.
const BS = String.fromCharCode(92)
const M = (x) => BS + '(' + x + BS + ')'
import { fitPlane } from './plane-fit.mjs'
const fr = (p, q) => (q === 1 ? String(p) : `${p < 0 ? '-' : ''}${BS}frac{${Math.abs(p)}}{${q}}`)
const num = (v) => (Number.isInteger(+v.toFixed(6)) ? String(Math.round(v)) : String(+v.toFixed(3)))
const pairTex = (x, y) => M(`(${num(x)}, ${num(y)})`)

export function stdQuadParts(hash) {
  const r = (seed, lo, hi) => lo + ((hash(seed) >>> 9) % (hi - lo + 1))
  const pick = (seed, a) => a[r(seed, 0, a.length - 1)]
  const strs = (right, cands, seed) => [...new Set(cands.filter((c) => c !== right))].sort((a, b) => hash(seed + a) - hash(seed + b)).slice(0, 3)
  // ax^2 + bx + c as TeX (a, b, c may be fractions given as [p, q])
  const term = (p, q, v, first) => {
    if (p === 0) return ''
    const abs = Math.abs(p)
    const body = q === 1 ? (abs === 1 && v ? '' : String(abs)) : `${BS}frac{${abs}}{${q}}`
    return `${first ? (p < 0 ? '-' : '') : p < 0 ? ' - ' : ' + '}${body}${v}`
  }
  const polyTex = (a, b, c) => {
    const first = a[0] !== 0 ? 'a' : 'b'
    return `${term(a[0], a[1], 'x^2', true)}${term(b[0], b[1], 'x', first === 'b')}${c === 0 ? '' : `${a[0] === 0 && b[0] === 0 ? '' : c < 0 ? ' - ' : ' + '}${a[0] === 0 && b[0] === 0 && c < 0 ? '-' : ''}${Math.abs(c)}`}`
  }
  const NAMES = { a: 'f', b: 'g', c: 'h', d: 'i', e: 'j', f: 'k', g: 'l', h: 'm', i: 'n', j: 'p' }
  const SPEC = {
    a: { as: [-1, 1, 2, -2], hs: [-3, -2, -1, 1, 2, 3], ks: [0] },
    b: { as: [-1, 1, -2, 2], hs: [-3, -2, -1, 1, 2, 3], ks: [-3, -2, -1, 1, 2, 3, 4] },
    c: { as: [1, -1, 2, -2], hs: [-3, -2, -1, 1, 2, 3], ks: [1, 2, 3, 4, 5, -1] },
    d: { as: [-2, 2, -3, 3], hs: [-3, -2, -1, 1, 2, 3], ks: [-3, -2, -1, 1, 2, 3, 5] },
    e: { as: [-1, 1], hs: [1, 2, 3, -1, -2, -3], ks: [0] }, // 3x - x^2 style: vertex at the half-integer, written with whole coefficients
    f: { as: [-2, 2, -3, 3], hs: [-3, -2, -1, 1, 2], ks: [0, 1, 2, -2, 2] },
    g: { as: [-3, 3, -2, 2], hs: [-1, 1, 2, -2], ks: [3, 4, 5, 6] },
    h: { as: [-1, 1], hs: [-3, -2, -1, 1, 2, 3], ks: [1, 2, 3, -1, -2, 4] },
  }
  return Object.keys(NAMES).map((p) => {
    const qs = []
    const seen = new Set()
    const isAbs = p === 'i' || p === 'j'
    const taskCount = isAbs ? 5 : 7
    for (let i = 0; qs.length < 10 && i < 1200; i++) {
      const s = `sq${p}${i}`
      const task = qs.length % taskCount
      let a, h, k, tex, f, shape
      if (!isAbs) {
        const sp = SPEC[p]
        a = pick(s + 'a', sp.as); h = pick(s + 'h', sp.hs); k = pick(s + 'k', sp.ks)
        if (p === 'e') { // j(x) = 3x - x^2: a = -1 or 1, vertex x = b/2 with b odd
          const b = pick(s + 'b', [1, 3, 5, -1, -3]); a = pick(s + 'a2', [-1, 1])
          h = -b / (2 * a); k = a * h * h + b * h
          f = (x) => a * x * x + b * x
          tex = `${NAMES[p]}(x) = ${b < 0 ? '-' : ''}${Math.abs(b) === 1 ? '' : Math.abs(b)}x ${a < 0 ? '-' : '+'} x^2`.replace('= -', '= -')
          shape = { a, h, k }
        }
        else {
          const b = -2 * a * h, c = k + a * h * h
          f = (x) => a * x * x + b * x + c
          tex = `${NAMES[p]}(x) = ${polyTex([a, 1], [b, 1], c)}`
          shape = { a, h, k }
        }
      } else {
        // |x^2 - m| or |-x^2 + bx + c|: g(x) = |q(x)|
        let q, qa, qb, qc
        if (p === 'i') { qa = 1; qb = 0; qc = -pick(s + 'c', [1, 4, 9, 2, 3]); }
        else { qa = -1; qb = pick(s + 'b', [2, 4, -2, -4, 1, 3]); qc = pick(s + 'c', [3, 5, 8, 4, 2, 1]) }
        q = (x) => qa * x * x + qb * x + qc
        f = (x) => Math.abs(q(x))
        tex = `${NAMES[p]}(x) = ${BS}left| ${polyTex([qa, 1], [qb, 1], qc)} ${BS}right|`
        h = -qb / (2 * qa); k = q(h); shape = { a: qa, h, k, abs: true, q, qa, qb, qc }
      }
      if (seen.has(tex + task)) continue
      const level = qs.length < 5 ? 1 : 2
      const base = { l: level }
      const up = isAbs ? true : a > 0
      if (task === 0) {
        // five x values around the vertex (whole numbers), y-values whole numbers inside the plane
        const c0 = Math.round(h)
        const xs = [-2, -1, 0, 1, 2].map((d) => c0 + d)
        if (xs.some((x) => !Number.isInteger(+f(x).toFixed(9)))) continue
        const plane = fitPlane(xs, xs.map(f))
        if (!plane) continue
        const items = xs.map((x) => ({ label: `x = ${x}`.replace('-', '−'), x, y: Math.round(f(x)) }))
        seen.add(tex + task)
        qs.push({ ...base, q: `Graph the quadratic function ${M(tex)} using at least 5 points. Plot the points for ${M(xs.join(', '))}.`, a: items.map((it) => pairTex(it.x, it.y)).join(', '), d: [], s: `Put each ${M('x')} into the function: ${items.map((it) => M(`${NAMES[p]}(${it.x}) = ${it.y}`)).join(', ')}. Plot the points and join them with a smooth curve.`, pp: { ...plane, hide: true, items } })
        continue
      }
      let ask, right, cands, why
      const yi = f(0)
      const intercepts = () => {
        // whole-number x-intercepts of the function (roots of the quadratic part)
        if (isAbs) { const { qa, qb, qc } = shape; const d = qb * qb - 4 * qa * qc; if (d < 0) return []; const sq = Math.sqrt(d); if (Math.abs(sq - Math.round(sq)) > 1e-9) return null; const rs = [(-qb - sq) / (2 * qa), (-qb + sq) / (2 * qa)].sort((x, y) => x - y); return rs[0] === rs[1] ? [rs[0]] : rs }
        const disc = -k / a
        if (disc < 0) return []
        const t = Math.sqrt(disc)
        if (Math.abs(t - Math.round(t)) > 1e-9) return null
        const tt = Math.round(t)
        return tt === 0 ? [h] : [h - tt, h + tt]
      }
      const taskId = isAbs ? ['plot', 'yint', 'xint', 'range', 'min'][task] : ['plot', 'vertex', 'axis', 'yint', 'xint', 'range', 'minmax'][task]
      if (taskId === 'vertex') {
        ask = 'Find the vertex of the graph.'; right = pairTex(h, k)
        cands = [pairTex(-h, k), pairTex(h, -k), pairTex(-h, -k), pairTex(k, h), pairTex(h + 1, k), pairTex(h, k + 1)]; why = `${M('x = -b/(2a)')} gives ${M(`x = ${num(h)}`)}; ${M(`f(${num(h)}) = ${num(k)}`)}. The vertex is ${right}.`
      } else if (taskId === 'axis') {
        ask = 'Find the axis of symmetry of the graph.'; right = M(`x = ${num(h)}`)
        cands = [M(`x = ${num(-h)}`), M(`y = ${num(k)}`), M(`x = ${num(k)}`), M(`x = ${num(h + 1)}`), M(`y = ${num(h)}`)]; why = `The axis of symmetry is the vertical line through the vertex: ${right}.`
      } else if (taskId === 'yint') {
        ask = 'Find the y-intercept of the graph.'; right = pairTex(0, yi)
        cands = [pairTex(0, -yi), pairTex(0, yi + 1), pairTex(0, yi - 1), pairTex(0, k), pairTex(yi, 0), pairTex(0, yi + 2)]; why = `${M(`f(0) = ${num(yi)}`)}: the y-intercept is ${right}.`
      } else if (taskId === 'xint') {
        const xs = intercepts()
        if (xs === null) continue
        ask = 'Find the x-intercept(s) of the graph.'
        if (xs.length === 0) { right = 'No x-intercepts'; cands = [pairTex(h, 0), pairTex(-h, 0), pairTex(0, yi), pairTex(k, 0)]; why = `${M('f(x) = 0')} has no real solution, so the graph never reaches the x-axis.` }
        else {
          const show = (arr) => arr.map((x) => pairTex(x, 0)).join(' and ')
          right = show(xs)
          cands = [show(xs.map((x) => -x).sort((u, v) => u - v)), show(xs.map((x) => x + 1)), 'No x-intercepts', show(xs.map((x) => x - 1)), show([...xs, xs[xs.length - 1] + 2])]
          why = `Set ${M('f(x) = 0')} and solve: ${xs.map((x) => M(`x = ${num(x)}`)).join(' or ')}. The x-intercepts are ${right}.`
        }
      } else if (taskId === 'range') {
        ask = 'State the domain and range of the function.'
        const lo = isAbs ? 0 : k
        right = M(`${BS}text{Domain: all real numbers; Range: }y ${up ? BS + 'ge' : BS + 'le'} ${num(lo)}`)
        cands = [M(`${BS}text{Domain: all real numbers; Range: }y ${up ? BS + 'le' : BS + 'ge'} ${num(lo)}`), M(`${BS}text{Domain: }x ${up ? BS + 'ge' : BS + 'le'} ${num(h)}${BS}text{; Range: all real numbers}`), M(`${BS}text{Domain: all real numbers; Range: all real numbers}`), M(`${BS}text{Domain: all real numbers; Range: }y ${up ? BS + 'ge' : BS + 'le'} ${num(h)}`)]
        why = `Any ${M('x')} can be used. ${isAbs ? 'The absolute value is never negative, so ' : `The parabola opens ${up ? 'up' : 'down'} from the vertex ${pairTex(h, k)}, so `}${M(`y ${up ? BS + 'ge' : BS + 'le'} ${num(lo)}`)}.`
      } else {
        ask = isAbs ? 'Find the minimum value of the function.' : 'Find the maximum or minimum value of the function.'
        const v = isAbs ? 0 : k
        right = `${up ? 'Minimum' : 'Maximum'} value: ${num(v)}`
        cands = [`${up ? 'Maximum' : 'Minimum'} value: ${num(v)}`, `${up ? 'Minimum' : 'Maximum'} value: ${num(h)}`, `${up ? 'Maximum' : 'Minimum'} value: ${num(h)}`, `${up ? 'Minimum' : 'Maximum'} value: ${num(-v - 1)}`, `${up ? 'Minimum' : 'Maximum'} value: ${num(yi)}`]
        why = isAbs ? `An absolute value is never negative and it reaches 0 at the x-intercepts: ${right}.` : `The parabola opens ${up ? 'up' : 'down'} (${M(`a = ${num(a)}`)}), so the vertex ${pairTex(h, k)} is the ${up ? 'lowest' : 'highest'} point: ${right}.`
      }
      const d = strs(right, cands, s)
      if (d.length < 3) continue
      seen.add(tex + task)
      qs.push({ ...base, q: `${ask} ${M(tex)}`, a: right, d, s: why })
    }
    return { p, qs }
  }).filter((x) => x.qs.length)
}
