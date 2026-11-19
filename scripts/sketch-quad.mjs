// Precalculus 11 2.3 exercise 5 ("Sketch the graph of the function f(x) = ... Label the vertex plus four other points") and exercise 8 (the projectile word problems).
//   sketchQuadParts: the student plots the vertex and four other points of the parabola (plot-points.tsx; the chips say "vertex" and "x = ..", so the coordinates are worked out).
//     Parts a-l follow the textbook's functions (x^2 - 2x - 3, 2x^2 + 3x - 2, -3x^2 - 4x + 4, ...) with a whole-number vertex so that the points are on the grid.
//   projectileParts: ONE story per question number (the path s(x) = -(1/c)x(x - c) of a ball, a stream of water ...) and the parts a, b, c, d ask different things about it:
//     the maximum height, how far it travels horizontally, the height at a distance, the distances where it is at a given height.
// Made here (no Gemini). Imported by: export-bank.mjs.
const BS = String.fromCharCode(92)
const M = (x) => BS + '(' + x + BS + ')'
import { fitPlane } from './plane-fit.mjs'
const num = (v) => (Number.isInteger(+v.toFixed(6)) ? String(Math.round(v)) : String(+v.toFixed(3)))

export function sketchQuadParts(hash) {
  const r = (seed, lo, hi) => lo + ((hash(seed) >>> 9) % (hi - lo + 1))
  const pick = (seed, a) => a[r(seed, 0, a.length - 1)]
  const term = (p, v, first) => (p === 0 ? '' : `${first ? (p < 0 ? '-' : '') : p < 0 ? ' - ' : ' + '}${Math.abs(p) === 1 && v ? '' : Math.abs(p)}${v}`)
  const poly = (a, b, c) => `${term(a, 'x^2', true)}${term(b, 'x', false)}${c === 0 ? '' : c < 0 ? ` - ${Math.abs(c)}` : ` + ${c}`}`.replace(/^ \+ /, '')
  const SPEC = {
    a: [1, -1, 1], b: [2, -2], c: [-3, 3], d: [-4, 4], e: [1, -1], f: [-1, -2, 1], g: [-2, 2], h: [3, -3], i: [-4, 4], j: [2, -2], k: [3, -3], l: [2, -2],
  }
  return Object.keys(SPEC).map((p) => {
    const qs = []
    const seen = new Set()
    for (let i = 0; qs.length < 10 && i < 800; i++) {
      const s = `sk${p}${i}`
      const a = pick(s + 'a', SPEC[p]), h = r(s + 'h', -3, 3), k = a > 0 ? r(s + 'k', -9, 3) : r(s + 'k', -3, 9)
      const f = (x) => a * (x - h) ** 2 + k
      const b = -2 * a * h, c = k + a * h * h
      const tex = `f(x) = ${poly(a, b, c)}`
      if (seen.has(tex) || b === 0 && c === 0) continue
      const xs = [h - 2, h - 1, h + 1, h + 2]
      const plane = fitPlane([h, ...xs], [k, ...xs.map(f)]) // a larger scale (2, 3, 4 ...) when the values do not fit -6..6
      if (!plane) continue
      seen.add(tex)
      const items = [{ label: 'vertex', x: h, y: k }, ...xs.map((x) => ({ label: `x = ${x}`.replace('-', '−'), x, y: f(x) }))]
      qs.push({
        q: `Sketch the graph of the function ${M(tex)}. Label the vertex plus four other points: plot the vertex and the points for ${M(xs.join(', '))}.`,
        a: items.map((it) => M(`(${it.x}, ${it.y})`)).join(', '), d: [],
        s: `The vertex is at ${M(`x = ${BS}frac{-b}{2a} = ${h}`)}: ${M(`(${h}, ${k})`)}. Then ${xs.map((x) => M(`f(${x}) = ${f(x)}`)).join(', ')}.`,
        l: qs.length < 5 ? 1 : 2, pp: { ...plane, hide: true, items },
      })
    }
    return { p, qs }
  }).filter((x) => x.qs.length)
}

export function projectileParts(hash) {
  const pick = (seed, a) => a[hash(seed) % a.length]
  const wrongs = (v, extra, f, seed) => {
    const base = [...extra, v * 2, v / 2, v * 1.5, v * 0.75, v * 4, v / 4]
    return [...new Set(base.filter((x) => Number.isFinite(x) && x > 0 && x !== v && f(x) !== f(v)).map(f))].sort((x, y) => hash(seed + x) - hash(seed + y)).slice(0, 3)
  }
  const stories = []
  for (let i = 0; stories.length < 10 && i < 400; i++) {
    const s = `proj${i}`
    const c = pick(s + 'c', [400, 200, 160, 240, 320, 480, 32, 48, 64, 96])
    if (stories.some((t) => t.c === c && t.kind === pick(s + 'k', [0]))) continue
    const obj = pick(s + 'o', [['A baseball is projected upwards at an angle from ground level', 'ball', 'feet'], ['A golf ball is hit from the ground', 'golf ball', 'feet'], ['A stream of water shooting from a fountain at ground level follows a parabolic path', 'stream of water', 'feet'], ['A soccer ball is kicked from ground level', 'ball', 'metres']])
    const unit = obj[2]
    const f = (x) => -(x * (x - c)) / c
    const fe = c === 400 || c === 200 ? `-${BS}frac{1}{${c}} x^2 + x` : `-${BS}frac{1}{${c}} x^2 + x`
    const text = `${obj[0]}. Its height ${M('s(x)')} is given by the function ${M(`s(x) = ${fe}`)}, where ${M('x')} is the distance the ${obj[1]} has travelled horizontally in ${unit}.`
    const H = (3 * c) / 16
    if (!Number.isInteger(H) || stories.some((t) => t.text === text)) continue
    const fu = (x) => `${num(x)} ${unit}`
    stories.push({ c, kind: 0, text, qs: [
      { ask: `What is the maximum height reached by the ${obj[1]}?`, a: fu(c / 4), d: wrongs(c / 4, [c / 2, c, c / 8], fu, s + 'a'), s: `The vertex is at ${M(`x = ${BS}frac{-b}{2a} = ${num(c / 2)}`)}; ${M(`s(${num(c / 2)}) = ${num(c / 4)}`)} ${unit}.` },
      { ask: `How far did the ${obj[1]} travel horizontally?`, a: fu(c), d: wrongs(c, [c / 2, c / 4, c * 2], fu, s + 'b'), s: `It lands when ${M('s(x) = 0')}: ${M(`-${BS}frac{1}{${c}}x(x - ${c}) = 0`)}, so ${M(`x = ${c}`)} ${unit}.` },
      { ask: `What is the height of the ${obj[1]} when it has travelled ${num(c / 4)} ${unit} horizontally?`, a: fu(H), d: wrongs(H, [c / 4, c / 2, c / 4 - 1 + 1 + c / 16], fu, s + 'c'), s: `${M(`s(${num(c / 4)}) = -${BS}frac{${num(c / 4)}^2}{${c}} + ${num(c / 4)} = ${num(H)}`)} ${unit}.` },
      { ask: `At what horizontal distances is the ${obj[1]} ${num(H)} ${unit} high?`, a: `${num(c / 4)} ${unit} and ${num((3 * c) / 4)} ${unit}`, d: [`${num(c / 4)} ${unit} only`, `${num(c / 2)} ${unit} and ${num(c)} ${unit}`, `${num(H)} ${unit} and ${num(c - H)} ${unit}`], s: `Solve ${M(`s(x) = ${num(H)}`)}: the parabola is symmetric about ${M(`x = ${num(c / 2)}`)}, so both ${M(`x = ${num(c / 4)}`)} and ${M(`x = ${num((3 * c) / 4)}`)} give ${M(num(H))} ${unit}.` },
    ] })
  }
  return Array.from({ length: 4 }, (_, k) => ({
    p: 'abcd'[k],
    qs: stories.map((st, i) => ({ q: `${st.text} ${st.qs[k].ask}`, a: st.qs[k].a, d: st.qs[k].d, s: st.qs[k].s, l: i < 5 ? 1 : 2 })).filter((q) => q.d.length === 3),
  }))
}
