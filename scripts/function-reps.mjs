// Math 10 3.2 exercises 8-18 (represent a function: table, ordered pairs, mapping diagram, graph, function / mapping notation), like the textbook:
//   ex 8, 9   given a table      -> a) mapping diagram, b) ordered pairs, c) graph the points
//   ex 10, 11 given a graph      -> a) mapping diagram, b) ordered pairs, c) table
//   ex 12, 13 given a mapping    -> a) table, b) ordered pairs, c) graph the points
//   ex 14, 15 given ordered pairs-> a) table, b) mapping diagram, c) graph the points
//   ex 16-18  a story, four values -> a) function notation, b) mapping notation, c) table, d) ordered pairs
// "Choose" parts are multiple choice (the options are ordered pair lists or little mapping diagrams); tables are typed in (fill-table.tsx, field `fl`);
// graphs are plotted (plot-points.tsx, field `pp`). Made here (no Gemini). Imported by: export-bank.mjs.
const BS = String.fromCharCode(92)
const M = (x) => BS + '(' + x + BS + ')'
const NAMES = 'ABCDEFGH'
const sg = (n) => (n < 0 ? `-${-n}` : `${n}`)
const PLANE = { xmin: -6, xmax: 6, ymin: -6, ymax: 6, xs: 1, ys: 1, xlabel: 'x', ylabel: 'y' }

// ---- representations of a set of pairs ----
const pairsText = (P) => M(`${BS}{${P.map(([x, y]) => `(${sg(x)}, ${sg(y)})`).join(', ')}${BS}}`)
const mdTable = (P) => `| ${M('x')} | ${P.map(([x]) => sg(x)).join(' | ')} |\n|---|${P.map(() => '---').join('|')}|\n| ${M('y')} | ${P.map(([, y]) => sg(y)).join(' | ')} |`
const mapSvg = (P) => {
  const xs = [...new Set(P.map((p) => p[0]))].sort((a, b) => a - b)
  const ys = [...new Set(P.map((p) => p[1]))].sort((a, b) => a - b)
  const rows = Math.max(xs.length, ys.length)
  const H = 34 * rows + 30
  const yAt = (n, i) => 15 + ((H - 30) * (i + 0.5)) / n
  const L = 70, R = 210
  let s = `<svg viewBox="0 0 280 ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:250px;height:auto"><ellipse cx="${L - 14}" cy="${H / 2}" rx="38" ry="${H / 2 - 3}" fill="none" stroke="#334155" stroke-width="2"/><ellipse cx="${R + 14}" cy="${H / 2}" rx="38" ry="${H / 2 - 3}" fill="none" stroke="#334155" stroke-width="2"/>`
  P.forEach(([x, y]) => {
    const y1 = yAt(xs.length, xs.indexOf(x)), y2 = yAt(ys.length, ys.indexOf(y))
    const a = Math.atan2(y2 - y1, R - 18 - (L + 8)), tx = R - 18, ty = y2
    s += `<line x1="${L + 8}" y1="${y1}" x2="${tx - 7 * Math.cos(a)}" y2="${ty - 7 * Math.sin(a)}" stroke="#0f172a" stroke-width="1.6"/><polygon points="${tx},${ty} ${tx - 9 * Math.cos(a) + 4 * Math.sin(a)},${ty - 9 * Math.sin(a) - 4 * Math.cos(a)} ${tx - 9 * Math.cos(a) - 4 * Math.sin(a)},${ty - 9 * Math.sin(a) + 4 * Math.cos(a)}" fill="#0f172a"/>`
  })
  xs.forEach((x, i) => { s += `<circle cx="${L + 8}" cy="${yAt(xs.length, i)}" r="3.5" fill="#0f172a"/><text x="${L - 6}" y="${yAt(xs.length, i) + 5}" text-anchor="end" font-size="15" fill="#0f172a">${sg(x).replace('-', '−')}</text>` })
  ys.forEach((y, i) => { s += `<circle cx="${R - 18}" cy="${yAt(ys.length, i)}" r="3.5" fill="#0f172a"/><text x="${R - 8}" y="${yAt(ys.length, i) + 5}" font-size="15" fill="#0f172a">${sg(y).replace('-', '−')}</text>` })
  return s + '</svg>'
}
const graphFig = (P) => ({ bbox: [-7, 7, 7, -7], elements: P.map(([x, y]) => ({ t: 'point', x, y })) })

// wrong versions of a set of pairs (a function stays a function: the x values do not change)
const wrongSets = (P, hash, seed) => {
  const c = []
  c.push(P.map(([x, y]) => [y, x]))
  c.push(P.map(([x, y]) => [x, -y]))
  P.forEach((_, i) => c.push(P.map(([x, y], j) => [x, j === i ? y + 1 : y])))
  P.forEach((_, i) => c.push(P.map(([x, y], j) => [x, j === i ? -y : y])))
  c.push(P.map(([x, y]) => [x, y + 1]))
  c.push(P.map(([x], j) => [x, P[P.length - 1 - j][1]]))
  const key = (S) => JSON.stringify(S)
  const seen = new Set([key(P)])
  return c.filter((S) => !seen.has(key(S)) && seen.add(key(S)) && S.every(([x, y]) => Math.abs(x) <= 9 && Math.abs(y) <= 9)).sort((a, b) => hash(seed + key(a)) - hash(seed + key(b)))
}

// ---- data: the pairs of a function ----
const makeData = (hash, kind, seed) => {
  const r = (k, lo, hi) => lo + (hash(seed + k) % (hi - lo + 1))
  if (kind === 'linear') {
    for (let a = 0; a < 40; a++) {
      const x0 = [-6, -4, -2][r('x' + a, 0, 2)], n = 6 - (x0 === -2 ? 1 : 0)
      const m = [[-1, 1], [1, 1], [1, 2], [-1, 2], [2, 1], [-2, 1], [3, 2], [-3, 2]][r('m' + a, 0, 7)], c = r('c' + a, -3, 3)
      const P = Array.from({ length: n }, (_, i) => { const x = x0 + 2 * i; return [x, (m[0] / m[1]) * x + c] })
      if (P.every(([, y]) => Number.isInteger(y) && Math.abs(y) <= 6) && new Set(P.map((p) => p[1])).size > 1) return P
    }
  }
  if (kind === 'constant') {
    const k = [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5][r('k', 0, 9)], x0 = [-6, -4, -3][r('x', 0, 2)], st = x0 === -3 ? 2 : 2
    return Array.from({ length: 6 }, (_, i) => [x0 + st * i, k]).filter(([x]) => x <= 6)
  }
  if (kind === 'points') {
    const n = 4 + r('n', 0, 2)
    const xs = new Set()
    for (let i = 0; xs.size < n && i < 60; i++) xs.add(r('x' + i, -5, 5))
    const X = [...xs].sort((a, b) => a - b)
    const Y = X.map((_, i) => r('y' + i, -5, 5))
    if (new Set(Y).size < 2) Y[0] = Y[0] === 4 ? 3 : 4
    return X.map((x, i) => [x, Y[i]])
  }
  if (kind === 'mapping') {
    const n = 3 + r('n', 0, 1)
    const xs = new Set()
    for (let i = 0; xs.size < n && i < 60; i++) xs.add(r('x' + i, -5, 5))
    const X = [...xs].sort((a, b) => a - b)
    const pool = [-4, -3, -2, 1, 2, 3, 4, 5].sort((a, b) => hash(seed + a) - hash(seed + b)).slice(0, Math.max(2, n - 1))
    return X.map((x, i) => [x, pool[i % pool.length]])
  }
  if (kind === 'constpoints') {
    const k = r('k', -3, 4), n = 4, x0 = r('x', -5, -2), st = 1 + r('s', 0, 1)
    return Array.from({ length: n }, (_, i) => [x0 + st * i, k])
  }
  return null
}

export function functionRepParts(hash, no) {
  const mk = (p, make, n = 10) => {
    const qs = []
    const seen = new Set()
    for (let i = 0; qs.length < n && i < n * 40; i++) {
      const g = make(`${no}${p}${i}`, qs.length)
      if (!g || seen.has(JSON.stringify([g.q, g.f, g.sv, g.a]))) continue
      seen.add(JSON.stringify([g.q, g.f, g.sv, g.a]))
      qs.push({ ...g, l: qs.length < 5 ? 1 : 2 })
    }
    return { p, qs }
  }
  const kinds = { 8: 'linear', 9: 'constant', 10: 'points', 11: 'points', 12: 'mapping', 13: 'mapping', 14: 'points', 15: 'constpoints' }
  const stems = {
    // how the function is given: the text and the figure / svg
    table: (P) => ({ q: `Use the function defined by the table to answer the question.\n\n${mdTable(P)}\n\n` }),
    graph: (P) => ({ q: 'The graph shows a function. ', f: graphFig(P) }),
    mapping: (P) => ({ q: 'The mapping diagram shows a function. ', sv: mapSvg(P) }),
    pairs: (P) => ({ q: `The function is given by the ordered pairs ${pairsText(P)}. ` }),
  }
  const givenOf = { 8: 'table', 9: 'table', 10: 'graph', 11: 'graph', 12: 'mapping', 13: 'mapping', 14: 'pairs', 15: 'pairs' }
  // the target representations
  const choosePairs = (P, seed) => ({ a: pairsText(P), d: wrongSets(P, hash, seed).slice(0, 3).map(pairsText) })
  const chooseMapping = (P, seed) => ({ a: mapSvg(P), d: wrongSets(P, hash, seed).slice(0, 3).map(mapSvg) })
  const targets = {
    mapping: { ask: 'Express this function using mapping notation (a mapping diagram).', ...{ make: chooseMapping }, why: (P) => `Draw an arrow from every ${M('x')} to its ${M('y')}: ${P.map(([x, y]) => M(`${sg(x)} ${BS}to ${sg(y)}`)).join(', ')}.` },
    pairs: { ask: 'Express this function using ordered pair notation.', make: choosePairs, why: (P) => `Write each pair as ${M('(x, y)')}: ${pairsText(P)}.` },
    table: { ask: 'Express this function using a table format: type the x-values from least to greatest, then the y-value of each.' },
    graph: { ask: 'Graph this function: plot every ordered pair.' },
  }
  const partsOf = { 8: ['mapping', 'pairs', 'graph'], 9: ['mapping', 'pairs', 'graph'], 10: ['mapping', 'pairs', 'table'], 11: ['mapping', 'pairs', 'table'], 12: ['table', 'pairs', 'graph'], 13: ['table', 'pairs', 'graph'], 14: ['table', 'mapping', 'graph'], 15: ['table', 'mapping', 'graph'] }
  if (kinds[no]) {
    return partsOf[no].map((target, pi) => mk('abc'[pi], (s) => {
      const P = makeData(hash, kinds[no], s)
      if (!P || P.length < 3) return null
      const st = stems[givenOf[no]](P)
      const base = { q: st.q + targets[target].ask, ...(st.f ? { f: st.f } : {}), ...(st.sv ? { sv: st.sv } : {}) }
      if (target === 'table') {
        return { ...base, a: pairsText(P), d: [], s: `Put the ${M('x')}-values in the top row and the ${M('y')}-value of each below it: ${pairsText(P)}.`, fl: { rows: [{ label: 'x', cells: P.map(() => null) }, { label: 'y', cells: P.map(() => null) }], answers: [...P.map((p) => p[0]), ...P.map((p) => p[1])] } }
      }
      if (target === 'graph') {
        return { ...base, a: pairsText(P), d: [], s: `Plot every ordered pair: ${pairsText(P)}. The graph of a function with these pairs is just these points.`, pp: { ...PLANE, items: P.map(([x, y], i) => ({ label: NAMES[i], x, y })) } }
      }
      const t = targets[target].make(P, s)
      if (t.d.length < 3) return null
      return { ...base, a: t.a, d: t.d, s: targets[target].why(P) }
    }))
  }

  // ---- 16-18: a story with four (or five) values ----
  const fmtN = (v) => (Number.isInteger(v) ? String(v) : String(+v.toFixed(2)))
  const money = (v) => `\\$${Math.round(v).toLocaleString('en-US').replace(',', ' ')}`
  const stories = {
    16: (s) => {
      const k = [0.5, 0.4, 0.6, 0.25, 0.75, 0.8][hash(s + 'k') % 6]
      const xs = [20000, 25000, 30000, 35000, 40000, 45000, 50000].sort((a, b) => hash(s + a) - hash(s + a + 'z')).slice(0, 4).sort((a, b) => a - b)
      const how = { 0.5: 'half', 0.4: '40%', 0.6: '60%', 0.25: 'a quarter', 0.75: '75%', 0.8: '80%' }[k]
      const item = ['cars', 'trucks', 'boats'][hash(s + 'i') % 3]
      return { xs, k, text: `A person bought four ${item} over an eight year period for: ${xs.map((v, i) => `${money(v)}${i === 2 ? ' and' : i === 3 ? '' : ','}`).join(' ').replace(' and ', ' and ')}. When trading them in for a new one, he only received ${how} of the original value.`, f: (x) => k * x, form: `${fmtN(k)}x`, kind: 'scale', k }
    },
    17: (s) => {
      const k = [2, 3, 1.5, 4][hash(s + 'k') % 4]
      const xs = [100000, 140000, 180000, 250000, 120000, 160000, 200000].sort((a, b) => hash(s + a) - hash(s + a + 'z')).slice(0, 4).sort((a, b) => a - b)
      const how = { 2: 'doubled', 3: 'tripled', 1.5: 'increased by 50%', 4: 'quadrupled' }[k]
      return { xs, k, text: `A land speculator bought four properties for ${xs.map((v, i) => `${money(v)}${i === 2 ? ', and' : i === 3 ? '' : ','}`).join(' ')}. Over the next five years the value of each property ${how}.`, f: (x) => k * x, form: `${fmtN(k)}x`, kind: 'scale', k }
    },
    18: (s) => {
      const pct = [5, 10, 4, 8][hash(s + 'k') % 4]
      const xs = [180, 200, 220, 240, 260, 280, 300, 320].sort((a, b) => hash(s + a) - hash(s + a + 'z')).slice(0, 5).sort((a, b) => a - b)
      const k = (100 - pct) / 100
      return { xs, k, text: `A diet plan promised ${pct}% weight loss in the first month. Five customers signed up weighing ${xs.slice(0, 4).join(', ')}, and ${xs[4]} pounds.`, f: (x) => k * x, form: `${fmtN(k)}x`, kind: 'scale', k }
    },
  }[no]
  const nota = (t, mapping) => {
    const k = t.k
    const right = mapping ? `f: x ${BS}to ${t.form}` : `f(x) = ${t.form}`
    const alts = [`${fmtN(+(1 / k).toFixed(3))}x`, `x ${k < 1 ? '-' : '+'} ${fmtN(+Math.abs(k < 1 ? k : k - 1).toFixed(3))}`, `${fmtN(+(1 - k + (k < 1 ? 0 : 2)).toFixed(3))}x`, `${fmtN(+(k < 1 ? 1 + (1 - k) : k / 2).toFixed(3))}x`, `x ${k < 1 ? '+' : '-'} ${fmtN(k)}`].filter((a) => a !== t.form && `${a}` !== `${t.form}`)
    const wr = [...new Set(alts)].filter((a) => a !== t.form).slice(0, 3)
    return { a: M(right), d: wr.map((a) => M(mapping ? `f: x ${BS}to ${a}` : `f(x) = ${a}`)) }
  }
  const all = (kind) => mk(kind, (s) => {
    const t = stories(s)
    const P = t.xs.map((x) => [x, t.f(x)])
    if (!P.every(([, y]) => Math.abs(y * 100 - Math.round(y * 100)) < 1e-6)) return null
    const ask = { a: 'Represent this function using function notation.', b: 'Represent this function using mapping notation.', c: 'Represent this function using a table.', d: 'Represent this function using ordered pairs.' }[kind]
    if (kind === 'a' || kind === 'b') {
      const n = nota(t, kind === 'b')
      if (n.d.length < 3) return null
      return { q: `${t.text} ${ask}`, a: n.a, d: n.d, s: `Each output is ${M(fmtN(t.k))} times the input, so the rule is ${n.a}.` }
    }
    if (kind === 'c') {
      return { q: `${t.text} ${ask} Fill in the ${M('y')}-values (the table lists the original values ${M('x')}).`, a: pairsText(P), d: [], s: `Multiply each ${M('x')} by ${M(fmtN(t.k))}: ${pairsText(P)}.`, fl: { rows: [{ label: 'x', cells: P.map(([x]) => String(x)) }, { label: 'y', cells: P.map(() => null) }], answers: P.map(([, y]) => +y.toFixed(2)) } }
    }
    const w = wrongSets(P.map(([x, y]) => [x / 1000, y / 1000]), hash, s)
    void w
    const wrongs = [
      P.map(([x, y]) => [y, x]), P.map(([x, y], i) => [x, i === 1 ? y + (y >= 1000 ? 1000 : 10) : y]), P.map(([x, y]) => [x, x - (y - x) * -1 === 0 ? y : x + (x - y)]), P.map(([x, y]) => [x, +(y * 2).toFixed(2)]), P.map(([x]) => [x, +(x * (2 - t.k)).toFixed(2)]),
    ]
    const key = (S) => JSON.stringify(S)
    const seen = new Set([key(P)])
    const d = wrongs.filter((S) => !seen.has(key(S)) && seen.add(key(S))).sort((a, b) => hash(s + key(a)) - hash(s + key(b))).slice(0, 3).map(pairsText)
    if (d.length < 3) return null
    return { q: `${t.text} ${ask}`, a: pairsText(P), d, s: `Pair each original value ${M('x')} with its new value ${M('y')}: ${pairsText(P)}.` }
  })
  return ['a', 'b', 'c', 'd'].map((k) => all(k)).filter((x) => x.qs.length)
}
