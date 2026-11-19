// Precalculus 11 1.4 exercise 2 ("Graph each function y = a(x - h)^2 + k using at least 5 points. Determine the vertex, axis of symmetry, y-intercept, x-intercepts, domain, range, maximum /
// minimum value"). One question cannot do all of it, so the questions of a part take turns: plot 5 points of the parabola (plot-points.tsx, chips "x = ..."), then the vertex, the axis of
// symmetry, the y-intercept, the x-intercepts, the domain and range, the maximum or minimum value (multiple choice). Parts a-g follow the textbook's functions:
// a -(x-h)^2 + k, b a(x+2)^2 (fraction), c a x^2 + k, d -2(x+1)^2 + 3, e (3/2)(x+2)^2 - 6, f -(3/2)(x-1)^2 + 6, g (3/4)(x-2)^2 - 3. Made here (no Gemini). Imported by: export-bank.mjs.
const BS = String.fromCharCode(92)
const M = (x) => BS + '(' + x + BS + ')'
import { fitPlane } from './plane-fit.mjs'
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a))
const fr = (p, q) => (q === 1 ? String(p) : `${p < 0 ? '-' : ''}${BS}frac{${Math.abs(p)}}{${q}}`)
const num = (v) => (Number.isInteger(+v.toFixed(6)) ? String(Math.round(v)) : String(+v.toFixed(3)))
const pairTex = (x, y) => M(`(${num(x)}, ${num(y)})`)

export function vertexFormParts(hash) {
  const r = (seed, lo, hi) => lo + ((hash(seed) >>> 9) % (hi - lo + 1))
  const pick = (seed, a) => a[r(seed, 0, a.length - 1)]
  const fnTex = (p, q, h, k) => {
    const co = q === 1 ? (p === 1 ? '' : p === -1 ? '-' : String(p)) : fr(p, q)
    const sq = h === 0 ? 'x^2' : `(x ${h < 0 ? '+' : '-'} ${Math.abs(h)})^2`
    return `y = ${co}${sq}${k === 0 ? '' : ` ${k < 0 ? '-' : '+'} ${Math.abs(k)}`}`
  }
  // [part, slopes [p,q], h list, k rule]: k 'any' | 'zero' | 'sq' (the x-intercepts are whole numbers: k = -a t^2)
  const SPEC = {
    a: { as: [[-1, 1], [1, 1], [-2, 1], [2, 1]], hs: [-3, -2, -1, 1, 2, 3], ks: [-5, -3, -2, -1, 1, 2, 3, 4, 5, 6] },
    b: { as: [[1, 4], [1, 2], [-1, 4], [-1, 2]], hs: [-3, -2, -1, 1, 2, 3], ks: [0] },
    c: { as: [[-1, 2], [1, 2], [-1, 1], [1, 1], [-2, 1], [2, 1], [-1, 4], [1, 4]], hs: [0], ks: [-5, -4, -3, -2, 2, 3, 4, 5, 6] },
    d: { as: [[-2, 1], [2, 1], [-3, 1], [3, 1]], hs: [-3, -2, -1, 1, 2, 3], ks: [-4, -3, -2, -1, 1, 2, 3, 4] },
    e: { as: [[3, 2], [-3, 2], [1, 2], [-1, 2], [2, 1], [-2, 1]], hs: [-3, -2, -1, 1, 2, 3], ks: [-6, -4, -2, 2, 4, 6] },
    f: { as: [[-3, 2], [3, 2], [-1, 2], [1, 2], [-2, 1], [2, 1]], hs: [-3, -2, -1, 1, 2, 3], ks: [-6, -4, -2, 2, 4, 6] },
    g: { as: [[3, 4], [-3, 4], [1, 4], [-1, 4], [1, 2], [-1, 2]], hs: [-3, -2, -1, 1, 2, 3], ks: [-4, -3, -2, -1, 1, 2, 3, 4] },
  }
  const strs = (right, cands, seed) => [...new Set(cands.filter((c) => c !== right))].sort((a, b) => hash(seed + a) - hash(seed + b)).slice(0, 3)
  return Object.keys(SPEC).map((p) => {
    const qs = []
    const seen = new Set()
    for (let i = 0; qs.length < 10 && i < 800; i++) {
      const s = `vf${p}${i}`
      const task = qs.length % 7
      const sp = SPEC[p]
      const [ap, aq] = pick(s + 'a', sp.as), h = pick(s + 'h', sp.hs), k = pick(s + 'k', sp.ks)
      const a = ap / aq
      const f = (x) => a * (x - h) ** 2 + k
      const tex = fnTex(ap, aq, h, k)
      if (seen.has(tex + task)) continue
      const level = qs.length < 5 ? 1 : 2
      const base = { l: level }
      const up = a > 0
      if (task === 0) {
        // five points: x = h + step * j, j = -2..2, with a step that makes the y-values whole numbers
        let step = 1
        while (!Number.isInteger(+(a * step * step).toFixed(9)) && step < 6) step++
        const xs = [-2, -1, 0, 1, 2].map((j) => h + step * j)
        if (xs.some((x) => !Number.isInteger(+f(x).toFixed(9)))) continue
        const plane = fitPlane(xs, xs.map(f))
        if (!plane) continue
        const items = xs.map((x) => ({ label: `x = ${x}`.replace('-', '−'), x, y: Math.round(f(x)) }))
        seen.add(tex + task)
        qs.push({ ...base, q: `Graph the function ${M(tex)} using at least 5 points. Plot the points for ${M(xs.join(', '))}.`, a: items.map((it) => pairTex(it.x, it.y)).join(', '), d: [], s: `Put each ${M('x')} into ${M('y')}: ${items.map((it) => M(`y(${it.x}) = ${it.y}`)).join(', ')}. The vertex is ${pairTex(h, k)}; the parabola opens ${up ? 'up' : 'down'}.`, pp: { ...plane, hide: true, items } })
        continue
      }
      let ask, right, cands, why
      if (task === 1) {
        ask = 'Determine the vertex.'; right = pairTex(h, k)
        cands = [pairTex(-h, k), pairTex(h, -k), pairTex(-h, -k), pairTex(k, h), pairTex(h + 1, k), pairTex(h, k + 1), pairTex(h - 1, k)]; why = `${M(tex)} is in the form ${M('y = a(x - h)^2 + k')}, so the vertex is ${right}.`
      } else if (task === 2) {
        ask = 'Determine the axis of symmetry.'; right = M(`x = ${h}`)
        cands = [M(`x = ${-h}`), M(`y = ${k}`), M(`y = ${-k}`), M(`x = ${k}`), M(`x = ${h + 1}`)]; why = `The axis of symmetry is the vertical line through the vertex: ${right}.`
      } else if (task === 3) {
        const yi = f(0)
        ask = 'Determine the y-intercept.'; right = pairTex(0, yi)
        cands = [pairTex(0, k), pairTex(0, -yi), pairTex(0, a * h * h), pairTex(0, f(-h) + 1), pairTex(0, a * (-h + 0) ** 2 - k), pairTex(0, yi + 1), pairTex(0, yi - 1), pairTex(0, yi + 2)]; why = `${M(`y(0) = ${num(yi)}`)}: the y-intercept is ${right}.`
      } else if (task === 4) {
        const disc = -k / a
        if (disc >= 0 && Math.abs(Math.sqrt(disc) - Math.round(Math.sqrt(disc))) > 1e-9) continue // whole x-intercepts only
        if (disc >= 0) {
          const t = Math.round(Math.sqrt(disc))
          const xs = t === 0 ? [h] : [h - t, h + t]
          ask = 'Determine the x-intercepts.'
          const show = (arr) => arr.map((x) => pairTex(x, 0)).join(' and ')
          right = show(xs)
          cands = [show(t === 0 ? [-h] : [-h - t, -h + t]), show(t === 0 ? [h + 1] : [h - t - 1, h + t + 1]), 'No x-intercepts', show(t === 0 ? [h - 1] : [h - 2 * t, h + 2 * t]), show([h])]
          why = `Solve ${M(`${num(a)}(x ${h < 0 ? '+' : '-'} ${Math.abs(h)})^2 ${k < 0 ? '-' : '+'} ${Math.abs(k)} = 0`)}: ${M(`(x - ${h})^2 = ${num(disc)}`)}, so ${M(`x = ${h} ${BS}pm ${t}`)}: ${right}.`
        } else {
          ask = 'Determine the x-intercepts.'; right = 'No x-intercepts'
          cands = [pairTex(h, 0), pairTex(-h, 0), pairTex(0, k), pairTex(0, f(0))]; why = `The vertex ${pairTex(h, k)} is ${up ? 'above' : 'below'} the x-axis and the parabola opens ${up ? 'up' : 'down'}, so it never reaches the x-axis.`
        }
      } else if (task === 5) {
        ask = 'State the domain and range of the function.'
        right = M(`${BS}text{Domain: all real numbers; Range: }y ${up ? BS + 'ge' : BS + 'le'} ${k}`)
        cands = [M(`${BS}text{Domain: all real numbers; Range: }y ${up ? BS + 'le' : BS + 'ge'} ${k}`), M(`${BS}text{Domain: }x ${up ? BS + 'ge' : BS + 'le'} ${h}${BS}text{; Range: all real numbers}`), M(`${BS}text{Domain: all real numbers; Range: }y ${up ? BS + 'ge' : BS + 'le'} ${h}`), M(`${BS}text{Domain: all real numbers; Range: all real numbers}`)]
        why = `Any ${M('x')} can be used. The parabola opens ${up ? 'up' : 'down'} from the vertex ${pairTex(h, k)}, so ${M(`y ${up ? BS + 'ge' : BS + 'le'} ${k}`)}.`
      } else {
        ask = 'Determine the maximum or minimum value of the function.'
        right = `${up ? 'Minimum' : 'Maximum'} value: ${k}`
        cands = [`${up ? 'Maximum' : 'Minimum'} value: ${k}`, `${up ? 'Minimum' : 'Maximum'} value: ${h}`, `${up ? 'Maximum' : 'Minimum'} value: ${h}`, `${up ? 'Minimum' : 'Maximum'} value: ${-k}`]
        why = `The parabola opens ${up ? 'up' : 'down'} (${M(`a = ${num(a)}`)}), so the vertex ${pairTex(h, k)} is the ${up ? 'lowest' : 'highest'} point: ${right}.`
      }
      const d = strs(right, cands, s)
      if (d.length < 3) continue
      seen.add(tex + task)
      qs.push({ ...base, q: `${ask} ${M(tex)}`, a: right, d, s: why })
    }
    return { p, qs }
  }).filter((x) => x.qs.length)
}
