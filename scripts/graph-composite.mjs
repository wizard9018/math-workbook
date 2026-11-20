// Precalculus 12 2.3 exercise 6 (sketch the graph of (f o g)(x) and state the domain) as a choice of four graphs. Parts a-c: f(x) = s x^2 + k and g(x) = sqrt(m x + c) give a RAY
// (f o g)(x) = s (m x + c) + k that starts at the end of the domain; part d: g(x) = sqrt(r^2 - x^2) gives an ARC of a parabola on [-r, r]. The wrong options are the typical mistakes
// (the whole line / parabola, the wrong end point, the wrong direction, ...). Made here (no Gemini). Imported by: export-bank.mjs.
import { plot } from './graph-svg.mjs'
const BS = String.fromCharCode(92)
const M = (x) => BS + '(' + x + BS + ')'
const R = 8 // the window of every option: -8 .. 8

// a ray from (x0, y0) with slope m, to the right (dir 1) or to the left (dir -1), cut at the window
const ray = (x0, y0, m, dir) => {
  const pts = [[x0, y0]]
  for (let t = 1; t <= 4 * R; t++) {
    const x = x0 + (dir * t) / 4, y = y0 + m * (dir * t) / 4
    if (Math.abs(x) > R || Math.abs(y) > R) break
    pts.push([x, y])
  }
  return pts
}
const line = (m, b) => { const pts = []; for (let x = -R; x <= R; x += 0.25) if (Math.abs(m * x + b) <= R) pts.push([x, m * x + b]); return pts }
const parab = (a, k, lo, hi) => { const pts = []; for (let x = lo; x <= hi + 1e-9; x += 0.125) if (Math.abs(a * x * x + k) <= R) pts.push([x, a * x * x + k]); return pts }
const key = (o) => JSON.stringify(o.pts.map((p) => [p[0], +p[1].toFixed(2)])) + JSON.stringify(o.dots ?? [])
const svg = (o) => plot(o.pts, { x: [-R, R], y: [-R, R], dots: o.dots ?? [], arrows: o.arrows ?? [false, false], S: 15 })

const sgn = (v) => (v < 0 ? ' - ' : ' + ')
const lin = (m, c) => `${m < 0 ? '-' : ''}${Math.abs(m) === 1 ? '' : Math.abs(m)}x${c === 0 ? '' : sgn(c) + Math.abs(c)}`.replace(/^-?x/, (t) => t)

export function compositeParts(hash) {
  const pick = (seed, a) => a[hash(seed) % a.length]
  const mk = (p, n, level) => {
    const seed = `gc${p}${n}`
    let f, g, right, wrong, why
    if (p === 'd') {
      const r = level === 1 ? pick(seed + 'r', [1, 2]) : pick(seed + 'r', [2, 3])
      const k = pick(seed + 'k', [-5, -4, -3, -2, -1, 0, 1, 2, 3].filter((v) => v + r * r <= 7 && v + r * r >= -R + 1))
      const s = 1
      f = `f(x) = x^2 ${k < 0 ? '- ' + -k : k > 0 ? '+ ' + k : ''}`.trim()
      g = `g(x) = ${BS}sqrt{${r * r} - x^2}`
      const top = k + r * r // (f o g)(x) = k + r^2 - x^2
      right = { pts: parab(-1, top, -r, r), dots: [[-r, k, true], [r, k, true]] }
      wrong = [
        { pts: parab(-1, top, -R, R) }, // the whole parabola: the domain is forgotten
        { pts: parab(1, k, -r, r), dots: [[-r, k + r * r, true], [r, k + r * r, true]] }, // opening up
        { pts: parab(-1, top, -r - 1, r + 1), dots: [[-r - 1, k + r * r - (r + 1) * (r + 1) + r * r, true], [r + 1, k + r * r - (r + 1) * (r + 1) + r * r, true]] }, // a wider domain
        { pts: parab(-1, k, -r, r), dots: [[-r, k - r * r, true], [r, k - r * r, true]] }, // the shift lost
      ]
      void s
      why = `Substitute: ${M(`(f ${BS}circ g)(x) = ${top} - x^2`)}. The square root needs ${M(`${r * r} - x^2 ${BS}ge 0`)}, so the domain is ${M(`-${r} ${BS}le x ${BS}le ${r}`)}: an arc of a parabola opening downward with vertex ${M(`(0, ${top})`)} and closed end points ${M(`(-${r}, ${k})`)} and ${M(`(${r}, ${k})`)}.`
    } else {
      // f(x) = s a x^2 + k ; g(x) = sqrt(m (x - h)), m = +1 (domain x >= h) or -1 (domain x <= h)
      const s = p === 'c' ? -1 : 1
      const a = level === 1 ? 1 : pick(seed + 'a', [1, 2])
      const m = p === 'c' ? -1 : 1
      const h = p === 'a' ? 0 : pick(seed + 'h', [-3, -2, -1, 1, 2, 3])
      const k = pick(seed + 'k', [-4, -3, -2, -1, 1, 2, 3, 4])
      f = `f(x) = ${s * a === 1 ? '' : s * a === -1 ? '-' : s * a}x^2 ${k < 0 ? '- ' + -k : '+ ' + k}`
      if (s * a < 0) f = `f(x) = ${k} ${a === 1 ? '- x^2' : '- ' + a + 'x^2'}`
      g = `g(x) = ${BS}sqrt{${m === 1 ? (h === 0 ? 'x' : h < 0 ? 'x + ' + -h : 'x - ' + h) : h === 0 ? '-x' : h < 0 ? '-x - ' + -h : h + ' - x'}}`
      const slope = s * a * m // (f o g)(x) = s a (m (x - h)) + k  ->  s a m x - s a m h + k
      const y0 = k // at x = h the value is k
      const dir = m
      right = { pts: ray(h, y0, slope, dir), dots: [[h, y0, true]], arrows: [false, true] }
      wrong = [
        { pts: line(slope, y0 - slope * h) }, // the whole line: the domain is forgotten
        { pts: ray(h, y0, -slope, dir), dots: [[h, y0, true]], arrows: [false, true] }, // the wrong slope
        { pts: ray(h, y0, slope, -dir), dots: [[h, y0, true]], arrows: [false, true] }, // the wrong direction
        { pts: ray(0, y0, slope, dir), dots: [[0, y0, true]], arrows: [false, true] }, // the shift of g ignored (the end point on the y-axis)
      ]
      if (h === 0) wrong[3] = { pts: ray(0, 0, slope, dir), dots: [[0, 0, true]], arrows: [false, true] } // the constant of f ignored
      const b0 = y0 - slope * h
      const expr = `${slope === 1 ? '' : slope === -1 ? '-' : slope}x${b0 < 0 ? ' - ' + -b0 : b0 > 0 ? ' + ' + b0 : ''}`
      why = `Substitute: ${M(`(f ${BS}circ g)(x) = ${expr}`)}. The square root needs ${M(m === 1 ? `x ${BS}ge ${h}` : `x ${BS}le ${h}`)}, so the graph is a ray with slope ${slope} that starts at the closed point ${M(`(${h}, ${k})`)} and goes ${dir === 1 ? 'right' : 'left'}.`
    }
    // distinct options only
    const seen = new Set([key(right)])
    const d = []
    for (const w of wrong) if (!seen.has(key(w)) && w.pts.length > 1) { seen.add(key(w)); d.push(w) }
    return { q: `Which graph is the graph of ${M(`y = (f ${BS}circ g)(x)`)} for ${M(f)} and ${M(g)}?`, right, d, s: why.replace(/\(-/g, '(-'), l: level }
  }
  const out = []
  for (const p of ['a', 'b', 'c', 'd']) {
    const qs = []
    const seen = new Set()
    for (let n = 0; qs.length < 10 && n < 60; n++) {
      const q = mk(p, n, qs.length < 5 ? 1 : 2)
      if (seen.has(q.q) || q.d.length < 3) continue
      seen.add(q.q)
      qs.push({ q: q.q, a: svg(q.right), d: q.d.slice(0, 3).map(svg), s: q.s, l: q.l })
    }
    out.push({ p, qs })
  }
  return out
}
