// Math 10 3.3 exercises 5-12 (real-world linear relations): the student graphs the equation (draws the line: graph-draw.tsx) and then reads a value off the graph
// (a multiple-choice question that shows the line). The stories are the textbook's, with other numbers. Made here (no Gemini).
//   ex 5 value of a computer, ex 6 litres of coffee since 2000, ex 7 value of a car, ex 8 temperature at noon + H hours (two readings), ex 9 nickels and dimes,
//   ex 10 the fourth vertex of a parallelogram, ex 11 Sudoku time (graph, then the 30th try), ex 12 gears.
// Imported by: export-bank.mjs.
const BS = String.fromCharCode(92)
const M = (x) => BS + '(' + x + BS + ')'
const fx = (n) => String(+n.toFixed(4))
const sgn = (n) => (n < 0 ? `- ${fx(-n)}` : `+ ${fx(n)}`)
const frac = (p, q) => (q === 1 ? String(p) : `${p < 0 ? '-' : ''}${BS}frac{${Math.abs(p)}}{${q}}`)
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a))

// the drawing plane for y = m x + c on x in [0, xMax] (or [xLo, xMax]): a grid step ys so that the line goes through grid crossings
function plane(m, c, xLo, xMax, xl) {
  const ys0 = [m, c, xMax].map(Math.abs)
  void ys0
  const vals = []
  for (let x = xLo; x <= xMax; x++) vals.push(m * x + c)
  const lo = Math.min(0, ...vals), hi = Math.max(0, ...vals)
  for (const ys of [1, 2, 3, 4, 5, 10, 20, 25, 50]) {
    const ymin = Math.floor(lo / ys) * ys, ymax = Math.ceil(hi / ys) * ys
    if ((ymax - ymin) / ys > 12) continue
    let pts = 0
    for (let x = Math.ceil(xLo); x <= xMax; x++) { const y = m * x + c; if (Math.abs(y / ys - Math.round(y / ys)) < 1e-9 && y >= ymin && y <= ymax) pts++ }
    if (pts >= 2) return { xmin: xLo, xmax: xMax, ymin, ymax, xs: 1, ys, ...(xl ? { xl } : {}) }
  }
  return null
}
const lineFig = (m, c, pl) => ({ bbox: [pl.xmin, pl.ymax, pl.xmax, pl.ymin], elements: [{ t: 'function', expr: `${fx(m)}*x${c < 0 ? '-' : '+'}${fx(Math.abs(c))}`, from: pl.xmin, to: pl.xmax }] })
const drawSpec = (pl, m, c, xlabel, ylabel) => ({ ...pl, xlabel, ylabel, m, c, tol: 1e-6 })

export function realLinearParts(hash, no) {
  const pick = (seed, arr) => arr[hash(seed) % arr.length]
  const mk = (p, make, n = 10) => {
    const qs = []
    const seen = new Set()
    for (let i = 0; qs.length < n && i < n * 30; i++) {
      const g = make(`${no}${p}${i}`, qs.length)
      if (!g || seen.has(g.q)) continue
      seen.add(g.q)
      qs.push({ ...g, l: qs.length < 5 ? 1 : 2 })
    }
    return { p, qs }
  }
  // wrong readings: the other coordinate, one step along, a sign slip
  const wrongs = (y, x0, step, fmtv, seed) => {
    const c = [x0, y + step, y - step, -y, y + 2 * step, y * 2].map((v) => fmtv(v)).filter((t, i, a) => t !== fmtv(y) && a.indexOf(t) === i)
    return c.sort((a, b) => hash(seed + a) - hash(seed + b)).slice(0, 3)
  }
  // a story with an equation y = m x + c (m = mp/mq): part a graphs it, parts b... read a value
  const story = (cfg) => {
    const graph = mk('a', (s) => {
      const t = cfg.make(s)
      if (!t) return null
      return { q: `${t.text} Graph the equation: click two points on the line, then press Submit.`, a: `The line of ${M(t.eq)}`, d: [], s: `Two points of the line (for example ${t.pts.map((p) => M(`(${p[0]}, ${p[1]})`)).join(' and ')}) give the line. Join them and extend it across the plane.`, dr: drawSpec(t.pl, t.m, t.c, cfg.xl, cfg.yl) }
    })
    const reads = cfg.asks.map((ask, k) => mk('bcd'[k], (s) => {
      const t = cfg.make(s)
      if (!t) return null
      const a = ask(t)
      const y = t.m * a.x + t.c
      if (!Number.isFinite(y) || a.x > t.pl.xmax || y < t.pl.ymin || y > t.pl.ymax) return null
      return { q: `${t.text} Use the graph of ${M(t.eq)} to estimate ${a.what}`, a: cfg.fmtv(y), d: wrongs(y, a.x, t.step ?? 1, cfg.fmtv, s), s: `On the graph go to ${M(`${cfg.xl} = ${a.x}`)} and read the height of the line: ${M(`${cfg.yl} = ${fx(y)}`)}.`, f: lineFig(t.m, t.c, t.pl) }
    }))
    return [graph, ...reads].filter((x) => x.qs.length)
  }
  const ITEMS = ['computer', 'laptop', 'tablet', 'camera', 'sound system']
  if (no === 5) {
    return story({
      xl: 't', yl: 'V', fmtv: (v) => `$${Math.round(v * 100).toLocaleString('en-US')}`,
      make: (s) => {
        const [p, q] = pick(s + 'm', [[3, 4], [1, 2], [2, 3], [3, 2], [1, 3], [3, 5]]), a = pick(s + 'a', [2, 3, 4]), item = pick(s + 'i', ITEMS)
        const c = p * a, m = -p / q, xMax = q * a, k = q * pick(s + 'k', [1, 1, 2].slice(0, a >= 2 ? 3 : 1))
        const pl = plane(m, c, 0, xMax)
        if (!pl || k > xMax) return null
        return { m, c, pl, eq: `V = ${frac(-p, q)}t ${sgn(c)}`.replace('+ ', '+ '), text: `The value ${M('V')} of a ${item} in hundreds of dollars is given by ${M(`V = ${frac(-p, q)}t ${sgn(c)}`)}, where ${M('t')} is the number of years since the ${item} was bought.`, pts: [[0, c], [q, c - p]], k }
      },
      asks: [(t) => ({ x: t.k, what: `what it is worth after ${t.k} years.` })],
    })
  }
  if (no === 6) {
    return story({
      xl: 't', yl: 'N', fmtv: (v) => `${fx(v)} litres`,
      make: (s) => {
        const [sp, sq] = pick(s + 'm', [[3, 5], [2, 5], [4, 5], [1, 2], [3, 2]]), c0 = pick(s + 'c', [20, 24, 18, 30, 15]), drink = pick(s + 'd', ['coffee', 'milk', 'bottled water', 'juice'])
        const m = sp / sq, k = sq * pick(s + 'k', [1, 2]), pl = plane(m, c0, 0, 10)
        if (!pl || k > 10) return null
        return { m, c: c0, pl, eq: `N = ${fx(m)}t ${sgn(c0)}`, text: `The number of litres, ${M('N')}, of ${drink} consumed each year by the average person can be approximated by ${M(`N = ${fx(m)}t ${sgn(c0)}`)}, where ${M('t')} is the number of years since 2000.`, pts: [[0, c0], [sq, c0 + sp]], k }
      },
      asks: [(t) => ({ x: t.k, what: `the average consumption in ${2000 + t.k}.` })],
    })
  }
  if (no === 7) {
    return story({
      xl: 't', yl: 'V', fmtv: (v) => `$${Math.round(v * 100).toLocaleString('en-US')}`,
      make: (s) => {
        const a = pick(s + 'a', [25, 20, 30, 15, 40, 50]), b = pick(s + 'b', [300, 240, 200, 360, 400]), item = pick(s + 'i', ['car', 'truck', 'motorcycle', 'delivery van']), age = pick(s + 'g', [2, 3, 4]), ahead = pick(s + 'h', [3, 4, 5])
        const xMax = Math.min(10, Math.floor(b / a)), k = age + ahead
        const pl = plane(-a, b, 0, xMax)
        if (!pl || k > xMax) return null
        return { m: -a, c: b, pl, eq: `V + ${a}t = ${b}`, text: `The value ${M('V')} of a ${item}, in hundreds of dollars, is given by ${M(`V + ${a}t = ${b}`)}, where ${M('t')} is the age of the ${item} in years. The ${item} was bought new ${age} years ago.`, pts: [[0, b], [1, b - a]], k, ahead }
      },
      asks: [(t) => ({ x: t.k, what: `the value of the ${'vehicle'} ${t.ahead} years from now.` })],
    })
  }
  if (no === 8) {
    return story({
      xl: 'H', yl: 'T', fmtv: (v) => `${fx(v)}°C`,
      make: (s) => {
        const a = pick(s + 'a', [2, 1, 3, 4]), b = pick(s + 'b', [2, 4, 6, 3, 8]), city = pick(s + 'c', ['Moose Jaw', 'Regina', 'Brandon', 'Whitehorse', 'Thunder Bay'])
        const pl = plane(-a, -b, 0, 6)
        if (!pl) return null
        return { m: -a, c: -b, pl, eq: `T + ${a}H = -${b}`, text: `On a winter day the temperature at noon in ${city} was approximated by ${M(`T + ${a}H = -${b}`)}, where ${M('T')} is the temperature in °C and ${M('H')} the hours after noon.`, pts: [[0, -b], [1, -b - a]] }
      },
      asks: [() => ({ x: 2, what: 'the temperature at 2:00 pm that day.' }), () => ({ x: 5, what: 'the temperature at 5:00 pm that day.' })],
    })
  }
  if (no === 9) {
    const coins = [['nickels', 'dimes', 5, 10], ['dimes', 'quarters', 10, 25], ['nickels', 'quarters', 5, 25]]
    const g = (s) => {
      const [c1, c2, v1, v2] = pick(s + 'k', coins), total = pick(s + 't', [45, 55, 65, 35, 75, 85, 60, 90, 100, 70, 120])
      const sols = []
      for (let n = 0; n * v1 <= total; n++) { const rest = total - n * v1; if (rest % v2 === 0) sols.push([n, rest / v2]) }
      if (sols.length < 3) return null
      return { c1, c2, v1, v2, total, sols }
    }
    const graph = mk('a', (s) => {
      const t = g(s)
      if (!t) return null
      const m = -t.v1 / t.v2, c = t.total / t.v2
      const xMax = Math.floor(t.total / t.v1), yMax = Math.ceil(c)
      const pl = { xmin: 0, xmax: xMax, ymin: 0, ymax: yMax, xs: 1, ys: 1, ...(xMax > 12 ? { xl: 2 } : {}) }
      if (xMax > 24 || yMax > 14) return null
      return { q: `A handful of ${t.c1} and ${t.c2} total ${t.total}¢. Let ${M('x')} be the number of ${t.c1} and ${M('y')} the number of ${t.c2}. Graph the equation ${M(`${t.v1}x + ${t.v2}y = ${t.total}`)}: click two points on the line (where it crosses the grid), then press Submit.`, a: 'The line', d: [], s: `The points of the line with whole numbers are ${t.sols.slice(0, 3).map((p) => M(`(${p[0]}, ${p[1]})`)).join(', ')}. Draw the line through two of them.`, dr: { ...pl, xlabel: t.c1, ylabel: t.c2, m, c, tol: 1e-6 }, _ok: t.sols.length >= 2 }
    })
    graph.qs = graph.qs.filter((q) => q._ok).map(({ _ok, ...q }) => q)
    const pickQ = mk('b', (s) => {
      const t = g(s)
      if (!t || t.sols.length < 3) return null
      const right = pick(s + 'r', t.sols)
      const bad = []
      for (const d of [[1, 0], [0, 1], [-1, 0], [1, 1], [2, 1], [1, -1], [-1, 1]]) {
        const w = [right[0] + d[0], right[1] + d[1]]
        if (w[0] >= 0 && w[1] >= 0 && w[0] * t.v1 + w[1] * t.v2 !== t.total && !bad.some((b) => b[0] === w[0] && b[1] === w[1])) bad.push(w)
      }
      if (bad.length < 3) return null
      const f = (w) => `${w[0]} ${t.c1} and ${w[1]} ${t.c2}`
      return { q: `A handful of ${t.c1} and ${t.c2} total ${t.total}¢. Which combination is possible?`, a: f(right), d: bad.sort((a, b) => hash(s + a) - hash(s + b)).slice(0, 3).map(f), s: `${M(`${right[0]} ${BS}times ${t.v1} + ${right[1]} ${BS}times ${t.v2} = ${t.total}`)}.` }
    })
    return [graph, pickQ].filter((x) => x.qs.length)
  }
  if (no === 10) {
    const mkv = (which, s) => {
      const P = []
      while (P.length < 3) { const q = [hash(s + 'x' + P.length) % 11 - 5, hash(s + 'y' + P.length) % 11 - 5]; if (!P.some((r) => r[0] === q[0] && r[1] === q[1])) P.push(q) }
      const [A, B, C] = P
      if ((B[0] - A[0]) * (C[1] - A[1]) - (B[1] - A[1]) * (C[0] - A[0]) === 0) return null
      const opp = [[A, B, C], [B, C, A], [C, A, B]][which] // the fourth vertex is opposite opp[0]: D = opp[1] + opp[2] - opp[0]
      const D = [opp[1][0] + opp[2][0] - opp[0][0], opp[1][1] + opp[2][1] - opp[0][1]]
      if (Math.abs(D[0]) > 6 || Math.abs(D[1]) > 6) return null
      const names = ['A', 'B', 'C']
      const others = [[A, B, C], [B, C, A], [C, A, B]].filter((_, i) => i !== which).map((o) => [o[1][0] + o[2][0] - o[0][0], o[1][1] + o[2][1] - o[0][1]])
      const wrong = [...others, [A[0] + B[0] + C[0], A[1] + B[1] + C[1]], [D[0], -D[1]], [-D[0], D[1]]].filter((w) => Math.abs(w[0]) <= 8 && Math.abs(w[1]) <= 8 && !(w[0] === D[0] && w[1] === D[1])).filter((w, i, arr) => arr.findIndex((z) => z[0] === w[0] && z[1] === w[1]) === i)
      if (wrong.length < 3) return null
      const f = (p) => `(${p[0]}, ${p[1]})`
      const label = names[which]
      return {
        q: `The points ${M(`A${f(A)}, B${f(B)}, C${f(C)}`)} are three vertices of a parallelogram ABCD. Use the graph to find the fourth vertex ${M('D')} so that ${M('D')} is opposite ${M(label)}.`.replace(/ABCD/, 'with a fourth vertex D'),
        a: M(f(D)), d: wrong.sort((x, y) => hash(s + x) - hash(s + y)).slice(0, 3).map((w) => M(f(w))),
        s: `Opposite sides are parallel and equal: from ${M(label)}, the other two vertices are joined to ${M('D')} by the vectors that go from ${M(label)} to them. D is ${M(f(D))}.`,
        f: { bbox: [-7, 7, 7, -7], elements: [{ t: 'point', x: A[0], y: A[1], label: 'A' }, { t: 'point', x: B[0], y: B[1], label: 'B' }, { t: 'point', x: C[0], y: C[1], label: 'C' }] },
      }
    }
    return [mk('a', (s) => mkv(0, s)), mk('b', (s) => mkv(1, s)), mk('c', (s) => mkv(2, s))].filter((x) => x.qs.length)
  }
  if (no === 11) {
    return story({
      xl: 'n', yl: 't', fmtv: (v) => `${fx(v)} minutes`,
      make: (s) => {
        const [p, q] = pick(s + 'm', [[2, 3], [1, 2], [3, 4], [3, 5], [2, 5]]), b = pick(s + 'b', [40, 30, 36, 24, 45]), game = pick(s + 'g', ['Sudoku puzzle', 'crossword', 'jigsaw puzzle', 'maze'])
        const m = -p / q, pl = plane(m, b, 0, 30, 5)
        if (!pl) return null
        return { m, c: b, pl, eq: `t = ${b} - ${frac(p, q)}n`, text: `A student found that the time ${M('t')} (in minutes) it took to complete a ${game} was related to the number of times ${M('n')} she did the ${game}: ${M(`t = ${b} - ${frac(p, q)}n`)}.`, pts: [[0, b], [q, b - p]], k: 30 }
      },
      asks: [() => ({ x: 30, what: 'the time it takes on her 30th try.' })],
    })
  }
  if (no === 12) {
    const g = mk('a', (s) => {
      const T = pick(s + 't', [18, 16, 20, 14, 22]), top = pick(s + 'u', [12, 14, 15])
      if (T - top > top) return null
      const pl = { xmin: 0, xmax: T, ymin: 0, ymax: T, xs: 1, ys: 1, xl: 2 }
      return { q: `A cyclist has ${top} gears on a racing bike. The total of the gear going uphill (${M('x')}) and the gear going downhill (${M('y')}) is always ${T}. The equation is ${M(`x + y = ${T}`)}. Graph it: click two points on the line, then press Submit.`, a: 'The line', d: [], s: `${M(`x + y = ${T}`)} goes through ${M(`(0, ${T})`)} and ${M(`(${T}, 0)`)}; only the points with ${M(`1 ${BS}le x ${BS}le ${top}`)} and ${M(`1 ${BS}le y ${BS}le ${top}`)} are real gear pairs.`, dr: { ...pl, xlabel: 'uphill gear', ylabel: 'downhill gear', m: -1, c: T, tol: 1e-6 } }
    })
    const c = mk('b', (s) => {
      const T = pick(s + 't', [18, 16, 20, 14, 22]), top = pick(s + 'u', [12, 14, 15])
      const right = [T - top + (hash(s + 'r') % Math.max(1, 2 * top - T - 1)) + 1]
      right.push(T - right[0])
      if (right[0] < 1 || right[1] < 1 || right[0] > top || right[1] > top) return null
      const wrong = [[right[0] + 1, right[1] + 1], [right[0], right[1] + 2], [right[1] + 1, right[0] + 2], [top + 1, T - top - 1], [right[0] - 1, right[1] - 1]].filter((w) => w[0] + w[1] !== T)
      if (wrong.length < 3) return null
      const f = (w) => `${w[0]} uphill and ${w[1]} downhill`
      return { q: `A cyclist has ${top} gears. The gear used uphill and the gear used downhill always total ${T}. Which pair of gears is possible?`, a: f(right), d: wrong.sort((x, y) => hash(s + x) - hash(s + y)).slice(0, 3).map(f), s: `${M(`${right[0]} + ${right[1]} = ${T}`)}.` }
    })
    return [g, c].filter((x) => x.qs.length)
  }
  return []
}
