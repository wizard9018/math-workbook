// Math 10 5.5 exercise 12, back to the textbook's type: "Complete the table, graph the function, and state the domain and range of the function" with g(x) and a table of four values.
// A multiple-choice question cannot do all three things, so the questions of a part take turns: complete the table (typed in: fill-table.tsx), graph the function (draw the line:
// graph-draw.tsx), state the domain and range (four options). Parts a, b: the x values are given, find g(x); parts c, d: the g(x) values are given, find x (like the textbook).
// Made here (no Gemini). Imported by: export-bank.mjs.
const BS = String.fromCharCode(92)
const M = (x) => BS + '(' + x + BS + ')'
const PLANE = { xmin: -6, xmax: 6, ymin: -6, ymax: 6, xs: 1, ys: 1, xlabel: 'x', ylabel: 'y' }
const fr = (p, q) => (q === 1 ? String(p) : `${p < 0 ? '-' : ''}${BS}frac{${Math.abs(p)}}{${q}}`)
const coef = (p, q) => (q === 1 ? (p === 1 ? '' : p === -1 ? '-' : String(p)) : fr(p, q))
const signed = (n) => `${n < 0 ? '- ' : '+ '}${Math.abs(n)}`
const sgn = (n) => String(n).replace('-', '-')

export function tableGraphParts(hash) {
  const r = (seed, lo, hi) => lo + ((hash(seed) >>> 9) % (hi - lo + 1))
  const pick = (seed, a) => a[r(seed, 0, a.length - 1)]
  // [slope p/q, intercept b]
  const funcs = {
    a: (s) => ({ m: [pick(s + 'm', [-3, -2, -1, 2, 3, 4, -4, 1]), 1], b: r(s + 'b', -4, 4), given: 'x' }),
    b: (s) => ({ m: [pick(s + 'm', [-1, 1, -3, 3, -1]) , 2], b: r(s + 'b', -4, 4), given: 'x' }),
    c: (s) => ({ m: [pick(s + 'm', [1, -1, 2, -2, 3]), 1], b: r(s + 'b', -5, 5), given: 'y' }),
    d: (s) => ({ m: [pick(s + 'm', [1, -1, 3, -3]), 2], b: r(s + 'b', -4, 4), given: 'y' }),
  }
  return 'abcd'.split('').map((p) => {
    const qs = []
    const seen = new Set()
    for (let i = 0; qs.length < 10 && i < 400; i++) {
      const s = `tg${p}${i}`
      const f = funcs[p](s)
      const [mp, mq] = f.m
      if (mp === 0) continue
      const slope = mp / mq
      const g = (x) => slope * x + f.b
      const tex = `g(x) = ${coef(mp, mq)}x ${f.b === 0 ? '' : signed(f.b)}`.trim().replace('g(x) = ', mq === 1 || true ? 'g(x) = ' : '')
      if (seen.has(tex)) continue
      // four x values: spaced so that g(x) is a whole number inside the plane
      const good = []
      for (let x = -6; x <= 6; x++) if (Number.isInteger(+g(x).toFixed(9)) && Math.abs(g(x)) <= 6) good.push(x)
      if (good.length < 5) continue
      const xs = [good[r(s + 'x0', 0, 1)], good[2], good[3], good[good.length - 1 - r(s + 'x1', 0, 1)]].filter((v, k, a) => a.indexOf(v) === k)
      if (xs.length < 4) continue
      const order = [...xs].sort((a, b) => hash(s + a) - hash(s + b))
      const task = qs.length % 3 // 0: complete the table, 1: graph the function, 2: domain and range
      const ask = task === 0 ? 'Complete the table.' : task === 1 ? 'Graph the function.' : 'State the domain and range of the function.'
      const base = { l: qs.length < 5 ? 1 : 2 }
      seen.add(tex)
      if (task === 0) {
        const vals = order.map((x) => ({ x, y: g(x) }))
        const rows = f.given === 'x'
          ? [{ label: 'x', cells: vals.map((v) => String(v.x)) }, { label: 'g(x)', cells: vals.map(() => null) }]
          : [{ label: 'x', cells: vals.map(() => null) }, { label: 'g(x)', cells: vals.map((v) => String(v.y)) }]
        qs.push({ ...base, q: `Complete the table, graph the function, and state the domain and range of the function: ${M(tex)}. ${ask}`, a: vals.map((v) => `(${v.x}, ${v.y})`).join(', '), d: [], s: `${f.given === 'x' ? `Put each ${M('x')} into ${M('g(x)')}` : `Solve ${M('g(x) = ')} the given value for ${M('x')}`}: ${vals.map((v) => M(`g(${v.x}) = ${v.y}`)).join(', ')}.`, fl: { rows, answers: f.given === 'x' ? vals.map((v) => v.y) : vals.map((v) => v.x) } })
      } else if (task === 1) {
        qs.push({ ...base, q: `Complete the table, graph the function, and state the domain and range of the function: ${M(tex)}. ${ask} Click two points on the line, then press Submit.`, a: `The line of ${M(tex)}`, d: [], s: `The ${M('y')}-intercept is ${M(`(0, ${f.b})`)}; the slope ${M(fr(mp, mq))} gives a second point. Draw the line through them.`, dr: { ...PLANE, m: slope, c: f.b, tol: 1e-6 } })
      } else {
        const right = M(`${BS}text{Domain: all real numbers; Range: all real numbers}`)
        const xmin = Math.min(...xs), xmax = Math.max(...xs), ymin = Math.min(...xs.map(g)), ymax = Math.max(...xs.map(g))
        const wrong = [
          M(`${BS}text{Domain: }${xmin} ${BS}le x ${BS}le ${xmax}${BS}text{; Range: }${ymin} ${BS}le y ${BS}le ${ymax}`),
          M(`${BS}text{Domain: all real numbers; Range: }y ${BS}ge ${f.b}`),
          M(`${BS}text{Domain: }x ${BS}ge 0${BS}text{; Range: all real numbers}`),
          M(`${BS}text{Domain: all real numbers; Range: }y ${BS}ne ${f.b}`),
          M(`${BS}text{Domain: }x ${BS}ne 0${BS}text{; Range: }y ${BS}ne 0`),
        ].sort((a, b) => hash(s + a) - hash(s + b)).slice(0, 3)
        qs.push({ ...base, q: `Complete the table, graph the function, and state the domain and range of the function: ${M(tex)}. ${ask}`, a: right, d: wrong, s: `A line goes on for ever in both directions, so every ${M('x')} can be used and every ${M('y')} is reached: all real numbers for both.` })
      }
    }
    return { p, qs }
  })
}
