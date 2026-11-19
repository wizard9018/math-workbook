// Curves drawn on a coordinate plane from -7 to 7 (for MathFigure: function / segment / ellipse / point elements), with the exact domain and range of each.
// Used by domain-range.mjs (Math 10 3.1 exercise 10: domain and range from a graph) and vlt.mjs (Math 10 3.2 exercise 6: vertical line test).
// A domain / range is a description: {t:'all'} | {t:'ints', ivs:[{lo,hi,loC,hiC}]} (lo / hi may be -Infinity / Infinity) | {t:'neq', v} | {t:'eq', v} | {t:'set', vals}.
// Imported by: domain-range.mjs, vlt.mjs.
const BS = String.fromCharCode(92)
const INF = Infinity
export const BBOX = [-7, 7, 7, -7]
const isPi = (n) => Number.isFinite(n) && Math.abs(Math.abs(n) - Math.PI) < 1e-6
const isHalfPi = (n) => Number.isFinite(n) && Math.abs(Math.abs(n) - Math.PI / 2) < 1e-6
const num = (n) => (isPi(n) ? `${n < 0 ? '-' : ''}${BS}pi` : isHalfPi(n) ? `${n < 0 ? '-' : ''}${BS}frac{${BS}pi}{2}` : String(+n.toFixed(3)).replace(/^-0$/, '0'))
const stepOf = (n) => (isPi(n) || isHalfPi(n) ? Math.PI / 2 : 1)

// ---- describing and writing domains / ranges ----
export const all = { t: 'all' }
export const ints = (...ivs) => ({ t: 'ints', ivs })
export const iv = (lo, hi, loC = true, hiC = true) => ({ lo, hi, loC, hiC })
const mergeIvs = (list) => {
  const s = [...list].sort((a, b) => a.lo - b.lo || (b.loC ? 1 : 0) - (a.loC ? 1 : 0))
  const out = []
  for (const x of s) {
    const l = out[out.length - 1]
    if (l && (x.lo < l.hi || (x.lo === l.hi && (x.loC || l.hiC)))) {
      if (x.hi > l.hi || (x.hi === l.hi && x.hiC)) { l.hi = x.hi; l.hiC = x.hiC }
    } else out.push({ ...x })
  }
  return out
}
export const union = (...ivs) => {
  const m = mergeIvs(ivs)
  if (m.length === 1 && m[0].lo === -INF && m[0].hi === INF) return all
  if (m.length === 2 && m[0].lo === -INF && m[1].hi === INF && m[0].hi === m[1].lo && !m[0].hiC && !m[1].loC) return { t: 'neq', v: m[0].hi }
  return { t: 'ints', ivs: m }
}
const one = (v, sym, iv1) => {
  const lo = iv1.lo === -INF ? null : `${num(iv1.lo)} ${iv1.loC ? BS + 'le' : '<'} ${v}`
  const hi = iv1.hi === INF ? null : `${v} ${iv1.hiC ? BS + 'le' : '<'} ${num(iv1.hi)}`
  if (lo && hi) return `${num(iv1.lo)} ${iv1.loC ? BS + 'le' : '<'} ${v} ${iv1.hiC ? BS + 'le' : '<'} ${num(iv1.hi)}`
  if (hi) return `${v} ${iv1.hiC ? BS + 'le' : '<'} ${num(iv1.hi)}`
  if (lo) return `${v} ${iv1.loC ? BS + 'ge' : '>'} ${num(iv1.lo)}`
  return `${v} ${sym}`
}
export const fmt = (d, v) => {
  if (d.t === 'all') return 'all real numbers'
  if (d.t === 'neq') return `${BS}(${v} ${BS}ne ${num(d.v)}${BS})`
  if (d.t === 'eq') return `${BS}(${v} = ${num(d.v)}${BS})`
  if (d.t === 'set') return `${BS}(${BS}{${d.vals.map(num).join(', ')}${BS}}${BS})`
  return d.ivs.map((x) => `${BS}(${one(v, '', x)}${BS})`).join(' or ')
}
// wrong descriptions of a description: another closure on an end, an end moved by 1, everything, a point dropped or moved
export const mutations = (d) => {
  const out = []
  if (d.t === 'ints') {
    d.ivs.forEach((x, i) => {
      const set = (p) => d.ivs.map((y, j) => (j === i ? { ...y, ...p } : y))
      if (x.lo !== -INF) { out.push({ t: 'ints', ivs: set({ loC: !x.loC }) }); out.push({ t: 'ints', ivs: set({ lo: x.lo + stepOf(x.lo) }) }); out.push({ t: 'ints', ivs: set({ lo: x.lo - stepOf(x.lo) }) }) }
      if (x.hi !== INF) { out.push({ t: 'ints', ivs: set({ hiC: !x.hiC }) }); out.push({ t: 'ints', ivs: set({ hi: x.hi + stepOf(x.hi) }) }); out.push({ t: 'ints', ivs: set({ hi: x.hi - stepOf(x.hi) }) }) }
    })
    if (d.ivs.length > 1) out.push({ t: 'ints', ivs: [{ lo: d.ivs[0].lo, hi: d.ivs[d.ivs.length - 1].hi, loC: d.ivs[0].loC, hiC: d.ivs[d.ivs.length - 1].hiC }] })
    out.push(all)
  }
  if (d.t === 'neq') out.push({ t: 'neq', v: d.v + 1 }, { t: 'neq', v: -d.v || 1 }, all)
  if (d.t === 'eq') out.push({ t: 'eq', v: d.v + 1 }, { t: 'eq', v: -d.v || 2 }, all)
  if (d.t === 'set') {
    d.vals.forEach((_, i) => { const v = d.vals.map((x, j) => (j === i ? x + 1 : x)); if (new Set(v).size === v.length) out.push({ t: 'set', vals: [...v].sort((a, b) => a - b) }) })
    out.push({ t: 'set', vals: d.vals.slice(1) })
  }
  if (d.t === 'all') out.push(ints(iv(-5, 5)), ints(iv(0, INF, false, true)))
  return out
}
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)
export const answerText = (dom, rng) => `Domain: ${fmt(dom, 'x')}; Range: ${fmt(rng, 'y')}`
export const wrongOptions = (dom, rng, hash, seed) => {
  const cand = []
  mutations(dom).forEach((m) => cand.push([m, rng]))
  mutations(rng).forEach((m) => cand.push([dom, m]))
  if (!same(dom, rng)) cand.push([rng, dom]) // domain and range swapped
  const seen = new Set([answerText(dom, rng)])
  const out = []
  for (const [d, r] of cand.sort((a, b) => hash(seed + answerText(...a)) - hash(seed + answerText(...b)))) {
    const t = answerText(d, r)
    if (seen.has(t)) continue
    seen.add(t)
    out.push(t)
    if (out.length === 3) break
  }
  return out
}

// ---- drawing ----
const fn = (expr, from, to, extra = {}) => ({ t: 'function', expr, from, to, ...extra })
const seg = (p, q, extra = {}) => ({ t: 'segment', p, q, ...extra })
const pt = (x, y, open = false) => ({ t: 'point', x, y, ...(open ? { open: true } : {}) })
const arc = (c, r, a0, a1) => ({ t: 'ellipse', c, rx: r, ry: r, a0, a1 })
const f2 = (n) => String(+n.toFixed(3))
const term = (n, s) => (n === 0 ? '' : ` ${n < 0 ? '-' : '+'} ${f2(Math.abs(n))}${s}`)

// each maker: (r) => { els, dom, rng, fnOk } where r(lo, hi) gives a seeded integer in [lo, hi]
export const MAKERS = {
  line: (r) => {
    let m = 0
    while (m === 0) m = r(-3, 3)
    const c = r(-3, 3)
    const y = (x) => m * x + c
    // the ends of the drawn line are on the border of the plane (6.4)
    const xe = Math.min(6.4, (6.4 - c) / Math.abs(m)), xs = Math.min(6.4, (6.4 + c) / Math.abs(m))
    const p = m > 0 ? [-xs, y(-xs)] : [-xe, y(-xe)], q = m > 0 ? [xe, y(xe)] : [xs, y(xs)]
    return { els: [seg(p, q, { arrow: 'both' })], dom: all, rng: all, fnOk: true }
  },
  parabola: (r, o = {}) => {
    const s = o.down ? -1 : 1, a = [0.5, 1, 1, 0.25][r(0, 3)], h = r(-2, 2), k = s > 0 ? r(-4, 1) : r(-1, 4)
    const w = Math.min(6.2, Math.sqrt(Math.abs(6.4 - Math.abs(k) * (s > 0 ? (k > 0 ? -1 : 1) : (k < 0 ? -1 : 1)) - (s > 0 ? k : -k) * 0) / a))
    const top = s > 0 ? 6.4 - k : 6.4 + k
    const ww = Math.min(6.2, Math.sqrt(Math.max(1, top) / a))
    void w
    const expr = `${s < 0 ? '-' : ''}${f2(a)}*(x${term(-h, '')})^2${term(k, '')}`.replace(/\(x\)/, 'x')
    const el = o.side ? fn(`${s < 0 ? '-' : ''}${f2(a)}*(x${term(-k, '')})^2${term(h, '')}`, -ww + k, ww + k, { arrow: 'both', swap: true }) : fn(expr, h - ww, h + ww, { arrow: 'both' })
    if (o.side) return { els: [el], dom: s > 0 ? ints(iv(h, INF)) : ints(iv(-INF, h)), rng: all, fnOk: false }
    return { els: [el], dom: all, rng: s > 0 ? ints(iv(k, INF)) : ints(iv(-INF, k)), fnOk: true }
  },
  hyperbola: (r) => {
    let a = 0
    while (a === 0) a = r(-3, 3)
    const h = r(-2, 2), k = r(-2, 2)
    const e = (x) => `${f2(a)}/(x${term(-h, '')})${term(k, '')}`.replace('(x)', 'x')
    const ex = e()
    void ex
    const expr = `${f2(a)}/(x${term(-h, '')})${term(k, '')}`.replace('/(x)', '/x')
    return { els: [fn(expr, -6.9, h - 0.12, { arrow: 'start' }), fn(expr, h + 0.12, 6.9, { arrow: 'end' })], dom: union(iv(-INF, h, true, false), iv(h, INF, false, true)), rng: union(iv(-INF, k, true, false), iv(k, INF, false, true)), fnOk: true }
  },
  circle: (r) => {
    const rad = [2, 2.5, 3, 3.5][r(0, 3)], h = r(-2, 2), k = r(-2, 2)
    return { els: [{ t: 'circle', c: [h, k], r: rad }], dom: ints(iv(h - rad, h + rad)), rng: ints(iv(k - rad, k + rad)), fnOk: false }
  },
  ellipse: (r) => {
    const rx = [2, 3, 4][r(0, 2)], ry = rx === 2 ? 4 : rx === 3 ? [2, 4][r(0, 1)] : [2, 3][r(0, 1)], h = r(-1, 1), k = r(-1, 1)
    return { els: [{ t: 'ellipse', c: [h, k], rx, ry }], dom: ints(iv(h - rx, h + rx)), rng: ints(iv(k - ry, k + ry)), fnOk: false }
  },
  semicircle: (r) => {
    const rad = [2, 3, 4][r(0, 2)], h = r(-2, 2), k = r(-1, 1)
    return { els: [arc([h, k], rad, 0, 180), pt(h - rad, k), pt(h + rad, k)], dom: ints(iv(h - rad, h + rad)), rng: ints(iv(k, k + rad)), fnOk: true }
  },
  exp: (r) => {
    const b = [2, 1.5, 3][r(0, 2)], k = r(-2, 2), dec = r(0, 1) === 1
    const yv = (x) => Math.pow(b, dec ? -x : x) + k
    let hiX = 6.4
    while (Math.abs(yv(dec ? -hiX : hiX)) > 6.4 && hiX > 0) hiX -= 0.1
    const expr = `${f2(b)}^${dec ? '(-x)' : 'x'}${term(k, '')}`
    return { els: [fn(expr, dec ? -hiX : -6.8, dec ? 6.8 : hiX, { arrow: 'both' })], dom: all, rng: ints(iv(k, INF, false, true)), fnOk: true }
  },
  bell: (r, o = {}) => {
    const a = [-5, -4, -3, -2, 2, 3, 4, 5][r(0, 7)], k = r(-1, 1)
    const expr = `${f2(a)}/(x^2+1)${term(k, '')}`
    const el = fn(expr, -6.8, 6.8, { arrow: 'both', ...(o.side ? { swap: true } : {}) })
    const rng = a > 0 ? ints(iv(k, a + k, false, true)) : ints(iv(a + k, k, true, false))
    return o.side ? { els: [el], dom: rng, rng: all, fnOk: false } : { els: [el], dom: all, rng, fnOk: true }
  },
  recip2: (r, o = {}) => {
    const a = [1, 2][r(0, 1)], k = r(-1, 1), neg = r(0, 1) === 1
    const sg = neg ? -1 : 1
    const upper = (x0, x1, ar) => fn(`${sg * a}/x^2${term(k, '')}`, x0, x1, { arrow: ar, ...(o.side ? { swap: true } : {}) })
    // the two outer branches and an arch between them (like the textbook picture): outer x = 0.5..6.8, arch -a2 x^2 - 0.5 between -0.45 and 0.45
    const els = [upper(-6.8, -0.4, 'start'), upper(0.4, 6.8, 'end'), fn(`${-sg * 4}*x^2${term(-sg * 0.5 + k, '')}`, -0.35, 0.35, { arrow: undefined, ...(o.side ? { swap: true } : {}) })]
    void neg
    return o.side ? { els, dom: all, rng: all, fnOk: false } : { els, dom: all, rng: all, fnOk: true }
  },
  hline: (r) => {
    const c = r(-4, 4)
    return { els: [seg([-6.4, c], [6.4, c], { arrow: 'both' })], dom: all, rng: { t: 'eq', v: c }, fnOk: true }
  },
  flat: (r) => {
    const x1 = r(-3, 0), x2 = r(1, 3), y1 = r(-4, 0), y2 = r(1, 4)
    const up = r(0, 1) === 1
    const [ya, yb] = up ? [y1, y2] : [y2, y1]
    return { els: [seg([-6.4, ya], [x1, ya], { arrow: 'start' }), seg([x1, ya], [x2, yb]), seg([x2, yb], [6.4, yb], { arrow: 'end' })], dom: all, rng: ints(iv(Math.min(y1, y2), Math.max(y1, y2))), fnOk: true }
  },
  poly: (r) => {
    const n = 4 + r(0, 1)
    const xs = []
    let x = r(-5, -3)
    for (let i = 0; i < n; i++) { xs.push(x); x += 1 + r(0, 1) + (i === 0 ? r(0, 1) : 0) }
    if (xs[n - 1] > 6) return null
    const ys = []
    for (let i = 0; i < n; i++) { let y = r(-5, 5); while (i && y === ys[i - 1]) y = r(-5, 5); ys.push(y) }
    const lastOpen = r(0, 1) === 1
    const els = []
    for (let i = 0; i < n - 1; i++) els.push(seg([xs[i], ys[i]], [xs[i + 1], ys[i + 1]]))
    els.push(pt(xs[0], ys[0], !lastOpen), pt(xs[n - 1], ys[n - 1], lastOpen))
    const mn = Math.min(...ys), mx = Math.max(...ys)
    const openIdx = lastOpen ? n - 1 : 0
    const attained = (v) => ys.some((y, i) => y === v && i !== openIdx)
    return { els, dom: ints(iv(xs[0], xs[n - 1], !(openIdx === 0), !(openIdx === n - 1))), rng: ints(iv(mn, mx, attained(mn), attained(mx))), fnOk: true }
  },
  sine: (r) => {
    const a = r(1, 4), cos = r(0, 1) === 1, k = r(-1, 1)
    const lbl = (x, s) => ({ t: 'text', x, y: -0.8, s })
    const y0 = (x) => (cos ? a * Math.cos(x) : a * Math.sin(x)) + k
    const kk = k === 0 ? '' : ` ${k < 0 ? '-' : '+'} ${Math.abs(k)}`
    return { els: [fn(`${a}*${cos ? 'cos' : 'sin'}(x)${kk}`, -Math.PI, Math.PI), pt(-Math.PI, y0(-Math.PI)), pt(Math.PI, y0(Math.PI)), lbl(-Math.PI, '-π'), lbl(Math.PI, 'π')], dom: ints(iv(-Math.PI, Math.PI)), rng: ints(iv(k - a, k + a)), fnOk: true, pi: true }
  },
  halfcircle: (r) => {
    const rad = [2, 3, 4, 5][r(0, 3)], dir = r(0, 3)
    const [a0, a1] = [[-90, 90], [90, 270], [0, 180], [180, 360]][dir]
    const ends = [[[0, rad], [0, -rad]], [[0, rad], [0, -rad]], [[-rad, 0], [rad, 0]], [[-rad, 0], [rad, 0]]][dir]
    const els = [arc([0, 0], rad, a0, a1), pt(...ends[0], true), pt(...ends[1], true)]
    const dom = dir === 0 ? ints(iv(0, rad)) : dir === 1 ? ints(iv(-rad, 0)) : ints(iv(-rad, rad, false, false))
    const rng = dir < 2 ? ints(iv(-rad, rad, false, false)) : dir === 2 ? ints(iv(0, rad)) : ints(iv(-rad, 0))
    return { els, dom, rng, fnOk: dir >= 2 }
  },
  parabolaflat: (r) => {
    const a = [1, 0.5][r(0, 1)], p = a === 1 ? [1, 2][r(0, 1)] : [2, 3, 4][r(0, 2)], down = r(0, 1) === 1, k = r(-2, 2)
    const v = (down ? -1 : 1) * a * p * p + k
    const e = `${down ? '-' : ''}${f2(a)}*x^2${term(k, '')}`
    return { els: [fn(e, -p, p), seg([-6.4, v], [-p, v], { arrow: 'start' }), seg([p, v], [6.4, v], { arrow: 'end' })], dom: all, rng: down ? ints(iv(v, k)) : ints(iv(k, v)), fnOk: true }
  },
  quarters: (r) => {
    const rad = [2, 3, 4, 5][r(0, 3)]
    const c = [r(0, 1) === 1, r(0, 1) === 1, r(0, 1) === 1, r(0, 1) === 1] // closed: (0,r) (r,0) (-r,0) (0,-r)
    const els = [arc([0, 0], rad, 0, 90), arc([0, 0], rad, 180, 270), pt(0, rad, !c[0]), pt(rad, 0, !c[1]), pt(-rad, 0, !c[2]), pt(0, -rad, !c[3])]
    const dom = union(iv(0, rad, c[0], c[1]), iv(-rad, 0, c[2], c[3]))
    const rng = union(iv(0, rad, c[1], c[0]), iv(-rad, 0, c[3], c[2]))
    return { els, dom, rng, fnOk: false }
  },
  discrete: (r) => {
    const n = 5
    const xs = new Set()
    while (xs.size < n) xs.add(r(-5, 5))
    const X = [...xs].sort((a, b) => a - b)
    const Y = X.map(() => r(-5, 5))
    return { els: X.map((x, i) => pt(x, Y[i])), dom: { t: 'set', vals: X }, rng: { t: 'set', vals: [...new Set(Y)].sort((a, b) => a - b) }, fnOk: new Set(X).size === X.length }
  },
}
