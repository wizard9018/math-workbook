// Math 10 4.2 exercise 4 (determine the rate of change from a graph): four straight-line graphs with titles, axis names and different scales, like the textbook:
//   a) reading a novel (pages vs hours, through the origin), b) highway travel (km vs clock time), c) taxi fare (cost vs km, starting above 0), d) computer value (falling).
// Each part has 10 questions with other numbers. The graph is an SVG (field `sv`); the two marked points are on grid crossings. Made here (no Gemini).
// Imported by: export-bank.mjs.
const BS = String.fromCharCode(92)
const M = (x) => BS + '(' + x + BS + ')'
const fx = (n) => String(+n.toFixed(2))

// x / y: {min, max, step, label?: (v) => text}; line: from (x0, y0) with slope m over the whole plane; dots: the marked points
function chart({ title, xname, yname, x, y, m, c, dots, rotate }) {
  const W = 400, H = 300, L = 62, R = 14, T = 34, B = 62
  const px = (v) => L + ((v - x.min) / (x.max - x.min)) * (W - L - R)
  const py = (v) => T + ((y.max - v) / (y.max - y.min)) * (H - T - B)
  let s = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:400px;height:auto"><rect x="${L}" y="${T}" width="${W - L - R}" height="${H - T - B}" fill="#fff" stroke="#475569" stroke-width="1.5"/>`
  for (let v = x.min; v <= x.max + 1e-9; v += x.step / (x.sub ?? 1)) s += `<line x1="${px(v)}" y1="${T}" x2="${px(v)}" y2="${H - B}" stroke="#cbd5e1"/>`
  for (let v = y.min; v <= y.max + 1e-9; v += y.step / (y.sub ?? 1)) s += `<line x1="${L}" y1="${py(v)}" x2="${W - R}" y2="${py(v)}" stroke="#cbd5e1"/>`
  for (let v = x.min; v <= x.max + 1e-9; v += x.step) {
    const t = x.label ? x.label(v) : fx(v)
    s += rotate ? `<text transform="translate(${px(v) + 4} ${H - B + 14}) rotate(30)" font-size="12" fill="#0f172a">${t}</text>` : `<text x="${px(v)}" y="${H - B + 16}" text-anchor="middle" font-size="13" fill="#0f172a">${t}</text>`
  }
  for (let v = y.min; v <= y.max + 1e-9; v += y.step) s += `<text x="${L - 6}" y="${py(v) + 4}" text-anchor="end" font-size="13" fill="#0f172a">${fx(v)}</text>`
  // the line across the plane
  const xa = x.min, xb = x.max
  let ya = m * xa + c, yb = m * xb + c
  let xA = xa, xB = xb
  if (ya > y.max || ya < y.min) { const yy = ya > y.max ? y.max : y.min; xA = (yy - c) / m; ya = yy }
  if (yb > y.max || yb < y.min) { const yy = yb > y.max ? y.max : y.min; xB = (yy - c) / m; yb = yy }
  s += `<line x1="${px(xA)}" y1="${py(ya)}" x2="${px(xB)}" y2="${py(yb)}" stroke="#0f172a" stroke-width="2"/>`
  for (const [dx, dy] of dots) s += `<circle cx="${px(dx)}" cy="${py(dy)}" r="4.5" fill="#0f172a"/>`
  s += `<text x="${(L + W - R) / 2}" y="20" text-anchor="middle" font-size="16" font-weight="700" fill="#0f172a">${title}</text>`
  s += `<text x="${(L + W - R) / 2}" y="${H - 8}" text-anchor="middle" font-size="14" fill="#0f172a">${xname}</text>`
  s += `<text transform="translate(14 ${(T + H - B) / 2}) rotate(-90)" text-anchor="middle" font-size="14" fill="#0f172a">${yname}</text>`
  return s + '</svg>'
}

export function rateChartParts(hash) {
  const pick = (seed, arr) => arr[hash(seed) % arr.length]
  const mk = (p, make, n = 10) => {
    const qs = []
    const seen = new Set()
    for (let i = 0; qs.length < n && i < n * 30; i++) {
      const g = make(`${p}${i}`)
      if (!g || seen.has(g.sv)) continue
      seen.add(g.sv)
      qs.push({ ...g, l: qs.length < 5 ? 1 : 2 })
    }
    return { p, qs }
  }
  // the right rate and three wrong ones (the other way round, one point's value, the difference only)
  const opts = (rate, unit, dx, dy, x1, y1, seed, fmtv) => {
    const c = [dx / dy, y1 / x1, dy, -rate, rate * 2, rate / 2, dy / (dx + 1)].map((v) => fmtv(+v.toFixed(2))).filter((t, i, a) => t !== fmtv(rate) && a.indexOf(t) === i)
    return { a: `${fmtv(rate)} ${unit}`, d: c.sort((a, b) => hash(seed + a) - hash(seed + b)).slice(0, 3).map((t) => `${t} ${unit}`) }
  }
  const fmt = (v) => (Number.isInteger(v) ? String(v) : String(+v.toFixed(2)))
  const ask = 'Determine the rate of change.'
  const parts = []
  // a) pages read: through the origin, points at 1 h and 3 h
  parts.push(mk('a', (s) => {
    const r = pick(s + 'r', [20, 25, 30, 40, 50, 60]), noun = pick(s + 'n', [['Reading a Novel', 'Pages Read', 'pages per hour'], ['Walking', 'Steps Taken (hundreds)', 'hundred steps per hour'], ['Painting a Fence', 'Metres Painted', 'metres per hour']])
    const x1 = pick(s + 'x', [1, 1, 2]), x2 = x1 + pick(s + 'd', [2, 2, 1])
    const xmax = x2 + 1, ymax = r * xmax
    const sv = chart({ title: noun[0], xname: 'Time (h)', yname: noun[1], x: { min: 0, max: xmax, step: 1 }, y: { min: 0, max: ymax, step: r }, m: r, c: 0, dots: [[x1, r * x1], [x2, r * x2]] })
    const o = opts(r, noun[2], x2 - x1, r * (x2 - x1), x1, r * x1, s, fmt)
    return { q: ask, sv, ...o, s: `Take the two marked points ${M(`(${x1}, ${r * x1})`)} and ${M(`(${x2}, ${r * x2})`)}: rate ${M(`= ${BS}frac{${r * x2} - ${r * x1}}{${x2} - ${x1}} = ${r}`)} ${noun[2]}.` }
  }))
  // b) highway travel: clock times, starting after 0 distance
  parts.push(mk('b', (s) => {
    const r = pick(s + 'r', [60, 75, 80, 90, 100, 50]), t0 = pick(s + 't', [11, 12, 1, 2]), d0 = pick(s + 'd', [0, 50, 100, 25])
    const clock = (h) => `${((t0 - 1 + Math.round(h)) % 12) + 1}:00`
    const ymax = Math.ceil((d0 + r * 3 + 20) / 50) * 50
    const sv = chart({ title: pick(s + 'ti', ['Highway Travel', 'Train Journey', 'Bus Trip']), xname: 'Time', yname: 'Distance Travelled (km)', x: { min: 0, max: 3, step: 1, label: clock }, y: { min: 0, max: ymax, step: 50 }, m: r, c: d0, dots: [[1, d0 + r], [3, d0 + 3 * r]], rotate: true })
    if (d0 + 3 * r > ymax) return null
    const o = opts(r, 'km per hour', 2, 2 * r, 1, d0 + r, s, fmt)
    return { q: ask, sv, ...o, s: `Between ${clock(1)} and ${clock(3)} the distance goes from ${d0 + r} to ${d0 + 3 * r} km in 2 hours: ${M(`${BS}frac{${d0 + 3 * r} - ${d0 + r}}{2} = ${r}`)} km per hour.` }
  }))
  // c) taxi fare: starts at a flat fee, points at 10 and 30 km
  parts.push(mk('c', (s) => {
    const rate = pick(s + 'r', [0.5, 0.4, 0.6, 0.25, 0.75, 1]), flat = pick(s + 'f', [5, 4, 6, 3, 8, 10]), x1 = pick(s + 'x', [10, 10, 20]), x2 = x1 + pick(s + 'd', [20, 10, 20])
    const y1 = flat + rate * x1, y2 = flat + rate * x2
    if (!Number.isInteger(y1) && !Number.isInteger(y2 * 2)) return null
    const ymax = Math.ceil((y2 + 3) / 5) * 5
    const sv = chart({ title: pick(s + 'ti', ['Taxi Fare', 'Parking Fee', 'Delivery Cost']), xname: 'Distance (km)', yname: 'Cost ($)', x: { min: 0, max: Math.max(x2 + 10, 40) > 40 ? 40 : Math.max(x2 + 10, 40), step: 10, sub: 2 }, y: { min: 0, max: ymax, step: 5 }, m: rate, c: flat, dots: [[x1, y1], [x2, y2]] })
    const o = opts(rate, 'dollars per km', x2 - x1, y2 - y1, x1, y1, s, (v) => `$${fmt(v)}`.replace('$', '$'))
    return { q: ask, sv, a: o.a.replace(' dollars per km', ' per km'), d: o.d.map((t) => t.replace(' dollars per km', ' per km')), s: `The marked points are ${M(`(${x1}, ${fmt(y1)})`)} and ${M(`(${x2}, ${fmt(y2)})`)}: ${M(`${BS}frac{${fmt(y2)} - ${fmt(y1)}}{${x2} - ${x1}} = ${fmt(rate)}`)} dollars per km.` }
  }))
  // d) computer value: falling, points at 1 and 4 years
  parts.push(mk('d', (s) => {
    const r = pick(s + 'r', [300, 250, 200, 400, 350, 150]), top = pick(s + 'f', [1800, 2000, 1500, 2200, 2400]), x1 = pick(s + 'x', [1, 1, 2]), x2 = x1 + 3
    const y1 = top - r * x1, y2 = top - r * x2
    if (y2 <= 0) return null
    const ymax = Math.ceil((top + 100) / 500) * 500
    const sv = chart({ title: pick(s + 'ti', ['Computer Value', 'Car Value', 'Tractor Value']), xname: 'Years', yname: 'Cost ($)', x: { min: 0, max: 5, step: 1 }, y: { min: 0, max: ymax, step: 500 }, m: -r, c: top, dots: [[x1, y1], [x2, y2]] })
    const o = opts(-r, 'dollars per year', x2 - x1, y2 - y1, x1, y1, s, (v) => `$${fmt(v)}`)
    return { q: ask, sv, a: o.a.replace(' dollars per year', ' per year'), d: o.d.map((t) => t.replace(' dollars per year', ' per year')), s: `The value falls from ${M(String(y1))} to ${M(String(y2))} in 3 years: ${M(`${BS}frac{${y2} - ${y1}}{3} = ${-r}`)} dollars per year (negative: the value goes down).` }
  }))
  return parts.filter((x) => x.qs.length)
}
