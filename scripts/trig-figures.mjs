// Math 10 8.1 exercise 4 ("Find the length AB, to the nearest tenth."), the textbook's kinds of figure: right triangles chained together, with the given side and the angles written on the
// picture. a) two right triangles sharing AD (AC and two angles), b) two right triangles on a base (45 m + 30 m) with a right angle at D, c) three right triangles around B (BC and three
// angles at B), d) a triangle with its height and the two base angles, e) a right angle at A with the height to the base (one angle and the part of the base), f) two right triangles around B
// (BC and two angles). The answer is worked out from the figure; the wrong options are the usual slips (sin for cos, one step missing, a product for a quotient).
// Made here (no Gemini). Imported by: export-bank.mjs.
const BS = String.fromCharCode(92)
const M = (x) => BS + '(' + x + BS + ')'
const RAD = Math.PI / 180
const u = (deg) => [Math.cos(deg * RAD), Math.sin(deg * RAD)]
const add = (p, v, k = 1) => [p[0] + k * v[0], p[1] + k * v[1]]
const r1 = (x) => Math.round(x * 10) / 10
const f2 = (x) => +x.toFixed(2)

const pt = (p, label) => ({ t: 'point', x: f2(p[0]), y: f2(p[1]), ...(label ? { label } : {}) })
const seg = (p, q, label) => ({ t: 'segment', p: p.map(f2), q: q.map(f2), ...(label ? { label } : {}) })
// a small square for a right angle at v, between the directions a and b (unit vectors)
const square = (v, a, b, s) => ({ t: 'polygon', pts: [v, add(v, a, s), add(add(v, a, s), b, s), add(v, b, s)].map((p) => p.map(f2)), fill: null })
const ang = (at, from, to, label) => ({ t: 'angle', at: at.map(f2), from: from.map(f2), to: to.map(f2), label })
const fig = (els, scale) => {
  const xs = els.flatMap((e) => (e.pts ? e.pts.map((p) => p[0]) : e.p ? [e.p[0], e.q[0]] : e.x !== undefined ? [e.x] : []))
  const ys = els.flatMap((e) => (e.pts ? e.pts.map((p) => p[1]) : e.p ? [e.p[1], e.q[1]] : e.y !== undefined ? [e.y] : []))
  const pad = 0.12 * Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) + 0.5
  return { axes: false, bbox: [Math.min(...xs) - pad, Math.max(...ys) + pad, Math.max(...xs) + pad, Math.min(...ys) - pad], elements: els }
}

export function trigFigureParts(hash) {
  const r = (seed, lo, hi) => lo + ((hash(seed) >>> 9) % (hi - lo + 1))
  const pick = (seed, a) => a[r(seed, 0, a.length - 1)]
  const unit = (s) => pick(s + 'u', ['mm', 'cm', 'm', 'ft', 'yd'])
  const tan = (d) => Math.tan(d * RAD), sin = (d) => Math.sin(d * RAD), cos = (d) => Math.cos(d * RAD)

  const MAKERS = {
    // a) C(0,0) bottom-left, A above C; D on the base with angle ADC = a; B so that AD ⊥ DB and angle DAB = b
    a: (s) => {
      const h = r(s + 'h', 4, 12), al = r(s + 'a', 25, 55), be = r(s + 'b', 25, 60), un = unit(s)
      const A = [0, h], C = [0, 0], D = [h / tan(al), 0]
      const AD = h / sin(al), dir = [(D[0] - A[0]) / AD, (D[1] - A[1]) / AD], perp = [-dir[1], dir[0]]
      const sgn = perp[1] > 0 ? 1 : -1 // B above the base
      const B = add(D, perp, sgn * AD * tan(be))
      const ab = AD / cos(be)
      const s0 = 0.5
      const els = [seg(A, C, `${h} ${un}`), seg(C, D), seg(A, D), seg(D, B), seg(A, B), pt(A, 'A'), pt(B, 'B'), pt(C, 'C'), pt(D, 'D'), square(C, [1, 0], [0, 1], s0), square(D, u(Math.atan2(A[1] - D[1], A[0] - D[0]) / RAD), u(Math.atan2(sgn * perp[1], sgn * perp[0]) / RAD), s0), ang(D, C, A, `${al}°`), ang(A, D, B, `${be}°`)]
      return { els, ab, wrong: [h / sin(al) * cos(be), h / sin(al), h / sin(al) / sin(be), h / tan(al) / cos(be)], how: `${M(`AD = ${BS}frac{${h}}{${BS}sin ${al}^${BS}circ} = ${r1(AD)}`)}, then ${M(`AB = ${BS}frac{AD}{${BS}cos ${be}^${BS}circ} = ${r1(ab)}`)}.` }
    },
    // b) C(0,0), A above C; D on the base with angle ADC = a, CD = d1; DE = d2; BD ⊥ AD, B above E
    b: (s) => {
      const d1 = r(s + 'd', 20, 60), d2 = r(s + 'e', 15, 50), al = r(s + 'a', 25, 55), un = unit(s)
      const A = [0, d1 * tan(al)], C = [0, 0], D = [d1, 0], E = [d1 + d2, 0], be = 90 - al
      const BE = d2 * tan(be), B = [d1 + d2, BE]
      const ab = Math.hypot(d1 + d2, BE - A[1])
      const s0 = Math.max(d1, d2) / 12
      const els = [seg(A, C), seg(C, E), seg(A, B), seg(A, D), seg(D, B), pt(A, 'A'), pt(B, 'B'), pt(C, 'C'), pt(D, 'D'), pt(E, 'E'), square(C, [1, 0], [0, 1], s0), square(E, [-1, 0], [0, 1], s0), ang(D, C, A, `${al}°`), { t: 'text', x: f2(d1 / 2), y: f2(-s0 * 2.2), s: `${d1} ${un}` }, { t: 'text', x: f2(d1 + d2 / 2), y: f2(-s0 * 2.2), s: `${d2} ${un}` }]
      return { els, ab, wrong: [d1 + d2, Math.hypot(d1 + d2, A[1]), Math.hypot(d1 + d2, BE), Math.hypot(d1 + d2, BE + A[1])], how: `${M(`AC = ${d1} ${BS}tan ${al}^${BS}circ = ${r1(A[1])}`)}; angle ${M('BDE')} is ${M(`90^${BS}circ - ${al}^${BS}circ = ${be}^${BS}circ`)}, so ${M(`BE = ${d2} ${BS}tan ${be}^${BS}circ = ${r1(BE)}`)}. Then ${M(`AB`)} is the hypotenuse of a right triangle with legs ${M(String(d1 + d2))} and ${M(`|${r1(BE)} - ${r1(A[1])}|`)}.` }
    },
    // c) three right triangles around B: BC given, angles at B
    c: (s) => {
      const bc = r(s + 'c', 5, 12), a1 = r(s + 'a', 30, 45), a2 = r(s + 'b', 30, 45), a3 = r(s + 'd', 20, 35), un = unit(s)
      const B = [0, 0], t0 = 100
      const BD = bc / cos(a1), BE = BD / cos(a2), AB = BE / cos(a3)
      const C = add(B, u(t0), bc), D = add(B, u(t0 + a1), BD), E = add(B, u(t0 + a1 + a2), BE), A = add(B, u(t0 + a1 + a2 + a3), AB)
      const s0 = 0.45
      const els = [seg(B, C, `${bc} ${un}`), seg(C, D), seg(D, B), seg(D, E), seg(E, B), seg(E, A), seg(A, B), pt(A, 'A'), pt(B, 'B'), pt(C, 'C'), pt(D, 'D'), pt(E, 'E'),
        square(C, u(Math.atan2(B[1] - C[1], B[0] - C[0]) / RAD), u(Math.atan2(D[1] - C[1], D[0] - C[0]) / RAD), s0), square(D, u(Math.atan2(B[1] - D[1], B[0] - D[0]) / RAD), u(Math.atan2(E[1] - D[1], E[0] - D[0]) / RAD), s0), square(E, u(Math.atan2(B[1] - E[1], B[0] - E[0]) / RAD), u(Math.atan2(A[1] - E[1], A[0] - E[0]) / RAD), s0),
        ang(B, C, D, `${a1}°`), ang(B, D, E, `${a2}°`), ang(B, E, A, `${a3}°`)]
      return { els, ab: AB, wrong: [bc / (cos(a1) * cos(a2)), bc * cos(a1) * cos(a2) * cos(a3), bc / (sin(a1) * sin(a2) * sin(a3)), bc / (cos(a1) + cos(a2) + cos(a3))], how: `${M(`BD = ${BS}frac{${bc}}{${BS}cos ${a1}^${BS}circ}`)}, ${M(`BE = ${BS}frac{BD}{${BS}cos ${a2}^${BS}circ}`)}, ${M(`AB = ${BS}frac{BE}{${BS}cos ${a3}^${BS}circ} = ${r1(AB)}`)}.` }
    },
    // d) a triangle with its height h and the base angles a, b
    d: (s) => {
      const h = r(s + 'h', 4, 12), al = r(s + 'a', 40, 70), be = r(s + 'b', 35, 65), un = unit(s)
      const A = [0, 0], F = [h / tan(al), 0], B = [h / tan(al) + h / tan(be), 0], C = [F[0], h]
      const ab = h / tan(al) + h / tan(be)
      const s0 = h / 12 + 0.2
      const els = [seg(A, B), seg(A, C), seg(C, B), seg(C, F, `${h} ${un}`), pt(A, 'A'), pt(B, 'B'), pt(C, 'C'), square(F, [1, 0], [0, 1], s0), ang(A, B, C, `${al}°`), ang(B, C, A, `${be}°`)]
      return { els, ab, wrong: [h / sin(al) + h / sin(be), h * tan(al) + h * tan(be), h / (tan(al) + tan(be)), h * (1 / tan(al) - 1 / tan(be))], how: `${M(`AF = ${BS}frac{${h}}{${BS}tan ${al}^${BS}circ}`)} and ${M(`FB = ${BS}frac{${h}}{${BS}tan ${be}^${BS}circ}`)}; ${M(`AB = AF + FB = ${r1(ab)}`)}.` }
    },
    // e) right angle at A, height AD to the base CB: angle C = th, DB = x
    e: (s) => {
      const th = r(s + 't', 30, 60), x = r(s + 'x', 12, 40), un = unit(s)
      const AB = x / sin(th) // angle B = 90 - th, cos(90 - th) = sin(th)
      const BD = x, DA = AB * sin(90 - th), CD = DA / tan(th)
      const C = [0, 0], D = [CD, 0], B = [CD + x, 0], A = [CD, DA]
      const s0 = DA / 14
      const els = [seg(C, B), seg(C, A), seg(A, B), seg(A, D), pt(A, 'A'), pt(B, 'B'), pt(C, 'C'), pt(D, 'D'), square(D, [1, 0], [0, 1], s0), square(A, u(Math.atan2(C[1] - A[1], C[0] - A[0]) / RAD), u(Math.atan2(B[1] - A[1], B[0] - A[0]) / RAD), s0), ang(C, B, A, `${th}°`), { t: 'text', x: f2(CD + x / 2), y: f2(-s0 * 2.2), s: `${x} ${un}` }]
      return { els, ab: AB, wrong: [x / cos(th), x * sin(th), x / tan(th), x / sin(90 - th)], how: `Angle ${M('B')} is ${M(`90^${BS}circ - ${th}^${BS}circ = ${90 - th}^${BS}circ`)} (the angle at ${M('A')} is a right angle). In triangle ${M('ADB')}: ${M(`AB = ${BS}frac{${x}}{${BS}cos ${90 - th}^${BS}circ} = ${r1(AB)}`)}.` }
    },
    // f) two right triangles around B
    f: (s) => {
      const bc = r(s + 'c', 6, 14), a1 = r(s + 'a', 30, 55), a2 = r(s + 'b', 25, 50), un = unit(s)
      const B = [0, 0], t0 = 110
      const BD = bc / cos(a1), AB = BD / cos(a2)
      const C = add(B, u(t0), bc), D = add(B, u(t0 + a1), BD), A = add(B, u(t0 + a1 + a2), AB)
      const s0 = 0.5
      const els = [seg(B, C, `${bc} ${un}`), seg(C, D), seg(D, B), seg(D, A), seg(A, B), pt(A, 'A'), pt(B, 'B'), pt(C, 'C'), pt(D, 'D'),
        square(C, u(Math.atan2(B[1] - C[1], B[0] - C[0]) / RAD), u(Math.atan2(D[1] - C[1], D[0] - C[0]) / RAD), s0), square(D, u(Math.atan2(B[1] - D[1], B[0] - D[0]) / RAD), u(Math.atan2(A[1] - D[1], A[0] - D[0]) / RAD), s0), ang(B, C, D, `${a1}°`), ang(B, D, A, `${a2}°`)]
      return { els, ab: AB, wrong: [bc / cos(a1), bc / (cos(a1) + cos(a2)), bc * cos(a1) * cos(a2), bc / (sin(a1) * sin(a2))], how: `${M(`BD = ${BS}frac{${bc}}{${BS}cos ${a1}^${BS}circ} = ${r1(BD)}`)}, then ${M(`AB = ${BS}frac{BD}{${BS}cos ${a2}^${BS}circ} = ${r1(AB)}`)}.` }
    },
  }
  return 'abcdef'.split('').map((p) => {
    const qs = []
    const seen = new Set()
    for (let i = 0; qs.length < 10 && i < 300; i++) {
      const s = `tf${p}${i}`
      const g = MAKERS[p](s)
      if (!g || !Number.isFinite(g.ab) || g.ab > 400) continue
      const ans = r1(g.ab)
      const key = String(ans)
      if (seen.has(key)) continue
      const wr = [...new Set(g.wrong.map(r1).filter((v) => Number.isFinite(v) && v > 0 && v !== ans))].sort((a, b) => hash(s + a) - hash(s + b)).slice(0, 3)
      if (wr.length < 3) continue
      seen.add(key)
      qs.push({ q: 'Find the length AB, to the nearest tenth.', a: ans.toFixed(1), d: wr.map((v) => v.toFixed(1)), s: g.how, l: qs.length < 5 ? 1 : 2, f: fig(g.els) })
    }
    return { p, qs }
  })
}
