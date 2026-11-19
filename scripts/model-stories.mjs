// Math 10 5.4 exercises 13-16 (linear models and break-even): ONE story per question number, and the parts a, b, c (d) ask different things about the SAME story, as in the textbook.
// The 10 questions of a part are 10 stories with other numbers, the same stories in every part.
//   ex 13 computer with sales tax and a disposal fee (equation; total cost for a price; price for a total cost)
//   ex 14 start-up cost of a business (cost equation; how many for a total cost; how many to break even)
//   ex 15 widgets (fixed cost; equation; total cost for some widgets; how many widgets for a cost)
//   ex 16 shipping a package (cost equation; cost of a heavier package; weight for a cost)
// Made here (no Gemini). Imported by: export-bank.mjs.
const BS = String.fromCharCode(92)
const M = (x) => BS + '(' + x + BS + ')'
const fn = (n) => (Number.isInteger(n) ? String(n) : String(+n.toFixed(4)))
const money = (n) => `$${Number.isInteger(n) ? n.toLocaleString('en-US').replace(',', ' ') : n.toFixed(2)}`

export function modelStoryParts(hash, no) {
  const pick = (seed, arr) => arr[hash(seed) % arr.length]
  const wrongs = (v, extra, f, seed) => {
    const base = [...extra, v * 2, v / 2, v * 1.1, v * 0.9, v * 10, v / 10, ...(Math.abs(v) < 30 ? [v + 1, v - 1] : [])]
    return [...new Set(base.filter((x) => Number.isFinite(x) && x !== v && x * v > 0 && f(x) !== f(v)).map(f))].sort((a, b) => hash(seed + a) - hash(seed + b)).slice(0, 3)
  }
  const strs = (right, cands, seed) => [...new Set(cands.filter((c) => c !== right))].sort((a, b) => hash(seed + a) - hash(seed + b)).slice(0, 3)
  const stories = []
  for (let i = 0; stories.length < 10 && i < 400; i++) {
    const s = `${no}ms${i}`
    if (no === 13) {
      const t = pick(s + 't', [12, 8, 5, 15, 10, 7]), f = pick(s + 'f', [20, 15, 25, 30, 10]), p1 = pick(s + 'a', [1540, 800, 1200, 950, 600, 1000, 2000]), p2 = pick(s + 'b', [900, 1100, 1300, 700, 500, 1500]), thing = pick(s + 'i', ['computer', 'television', 'refrigerator', 'printer'])
      const k = 1 + t / 100, T2 = +(k * p2 + f).toFixed(2), T1 = +(k * p1 + f).toFixed(2)
      if (p1 === p2) continue
      const text = `The total cost of a ${thing} is the sum of the selling price, plus a sales tax of ${t}%, plus a ${money(f)} disposal fee.`
      const eq = (a, b, op = '+') => M(`T = ${fn(a)}p ${op} ${fn(b)}`)
      const right = eq(k, f)
      const fm = (x) => money(+x.toFixed(2))
      stories.push({ text, qs: [
        { ask: `Express the total cost of the ${thing} as a linear function of the selling price.`, a: right, d: strs(right, [eq(t / 100, f), eq(t, f), eq(k, f, '-'), eq(f, k), eq(1 + t / 100 + f / 100, 0)], s + 'a').map((x) => (x === eq(1 + t / 100 + f / 100, 0) ? eq(k + 0.2, f) : x)), s: `Price ${M('p')} plus tax ${M(`${fn(t / 100)}p`)} plus the fee: ${right}.` },
        { ask: `What is the total cost of a ${thing} that sells for ${money(p1)}?`, a: fm(T1), d: wrongs(T1, [p1 + f, p1 * (t / 100) + f, p1 * k], fm, s + 'b'), s: `${M(`T = ${fn(k)} ${BS}times ${p1} + ${f} = ${fn(T1)}`)}.` },
        { ask: `What is the selling price of a ${thing} whose total cost was ${money(T2)}?`, a: fm(p2), d: wrongs(p2, [T2 - f, (T2 - f) * k, T2 / k], fm, s + 'c'), s: `${M(`${fn(T2)} = ${fn(k)}p + ${f}`)} gives ${M(`p = ${fn(p2)}`)}.` },
      ] })
    }
    if (no === 14) {
      const S = pick(s + 'S', [1200, 900, 1500, 800, 2000, 1000]), c = pick(s + 'c', [0.4, 0.3, 0.35, 0.25, 0.2]), [kk, P] = pick(s + 'k', [[2, 1], [3, 2.1], [4, 3], [5, 3.5], [2, 1.2]]), n1 = pick(s + 'n', [1000, 1200, 1500, 2000, 1800, 2400])
      const price = P / kk
      if (price <= c) continue
      const nb = S / (price - c)
      if (!Number.isInteger(+nb.toFixed(6)) || nb > 100000) continue
      const X = +(S + c * n1).toFixed(2)
      const item = pick(s + 'i', [['hot dogs', 'hot dog', 'on the beach'], ['lemonades', 'lemonade', 'at the market'], ['cookies', 'cookie', 'at the fair'], ['T-shirts', 'T-shirt', 'at the stadium']])
      const cents = Math.round(c * 100)
      const text = `It costs ${money(S)} to start up a business selling ${item[0]} ${item[2]}. Each ${item[1]} costs ${cents}¢ to produce.`
      const eq = (a, b, op = '+') => M(`C = ${fn(a)}n ${op} ${fn(b)}`)
      const right = eq(c, S)
      const num = (x) => `${Math.round(x).toLocaleString('en-US').replace(',', ' ')} ${item[0]}`
      stories.push({ text, qs: [
        { ask: 'Find the cost equation.', a: right, d: strs(right, [eq(S, c), eq(cents, S), eq(c, S, '-'), eq(c * 10, S), eq(c, S * 10)], s + 'a'), s: `Fixed ${M(String(S))} plus ${M(fn(c))} for each: ${right}.` },
        { ask: `How many ${item[0]} are produced if the total cost is ${money(X)}?`, a: num(n1), d: wrongs(n1, [X / c, (X - S) * c, X - S], num, s + 'b'), s: `${M(`${fn(X)} = ${fn(c)}n + ${S}`)} gives ${M(`n = ${n1}`)}.` },
        { ask: `How many ${item[0]} must be sold at ${kk === 2 ? 'two' : kk === 3 ? 'three' : kk === 4 ? 'four' : 'five'} for ${money(P)} to break even?`, a: num(nb), d: wrongs(nb, [S / c, S / price, nb / 2], num, s + 'c'), s: `Each sells for ${M(fn(price))}. Break-even: ${M(`${fn(price)}n = ${fn(c)}n + ${S}`)} gives ${M(`n = ${fn(nb)}`)}.` },
      ] })
    }
    if (no === 15) {
      const F = pick(s + 'F', [1000, 800, 1200, 500, 1500, 640]), u = pick(s + 'u', [2.5, 3, 3.8, 4, 2, 1.5, 5]), n1 = pick(s + 'a', [500, 300, 400, 600]), n2 = n1 + pick(s + 'b', [400, 200, 300, 500]), n3 = pick(s + 'c', [200, 250, 350, 700, 1000]), n4 = pick(s + 'd', [1500, 1800, 2000, 2400, 1200])
      const cost = (n) => +(F + u * n).toFixed(2)
      if (n3 === n1 || n4 === n2) continue
      const item = pick(s + 'i', ['widgets', 'toys', 'bottles', 'chairs'])
      const text = `It costs a company ${money(cost(n1))} to produce ${n1} ${item} and ${money(cost(n2))} to produce ${n2} ${item}.`
      const eq = (a, b, op = '+') => M(`C = ${fn(a)}n ${op} ${fn(b)}`)
      const right = eq(u, F)
      const fm = (x) => money(+x.toFixed(2))
      const num = (x) => `${Math.round(x)} ${item}`
      stories.push({ text, qs: [
        { ask: `What is the fixed cost for producing ${item}?`, a: fm(F), d: wrongs(F, [cost(n1), u, cost(n2) - cost(n1)], fm, s + 'a'), s: `Rate ${M(`${BS}frac{${fn(cost(n2))} - ${fn(cost(n1))}}{${n2} - ${n1}} = ${fn(u)}`)}; fixed ${M(`${fn(cost(n1))} - ${fn(u)} ${BS}times ${n1} = ${F}`)}.` },
        { ask: `Find an equation relating the cost of producing ${item}.`, a: right, d: strs(right, [eq(F, u), eq(u, F, '-'), eq(cost(n1) / n1, F), eq(u * 2, F), eq(u, cost(n1))], s + 'b'), s: `${right}.` },
        { ask: `What is the total cost of producing ${n3} ${item}?`, a: fm(cost(n3)), d: wrongs(cost(n3), [u * n3, F + n3, cost(n3) - F + u], fm, s + 'c'), s: `${M(`${fn(u)} ${BS}times ${n3} + ${F} = ${fn(cost(n3))}`)}.` },
        { ask: `How many ${item} can be produced for ${money(cost(n4))}?`, a: num(n4), d: wrongs(n4, [cost(n4) / u, (cost(n4) - F) * u, cost(n4) - F], num, s + 'd'), s: `${M(`${fn(cost(n4))} = ${fn(u)}n + ${F}`)} gives ${M(`n = ${n4}`)}.` },
      ] })
    }
    if (no === 16) {
      const a = pick(s + 'a', [20, 15.8, 18.5, 22, 17.25, 24]), b = pick(s + 'b', [7.5, 5.75, 6.25, 5, 8.5, 4.5]), w1 = 1, w2 = 3, w3 = pick(s + 'c', [6.5, 5.5, 7.5, 4.5, 8]), w4 = pick(s + 'd', [5, 6, 8, 4, 7, 9])
      const cost = (w) => +(a + b * w).toFixed(2)
      if (w3 === w4) continue
      const dest = pick(s + 'i', [['Vancouver', 'Winnipeg'], ['Calgary', 'Toronto'], ['Victoria', 'Edmonton'], ['Halifax', 'Ottawa']])
      const text = `To ship a package from ${dest[0]} to ${dest[1]} overnight costs ${money(cost(w1))} for a one pound package, and ${money(cost(w2))} for a three pound package.`
      const eq = (x, y, op = '+') => M(`C = ${fn(x)}w ${op} ${fn(y)}`)
      const right = eq(b, a)
      const fm = (x) => money(+x.toFixed(2))
      const lb = (x) => `${fn(+x.toFixed(2))} pounds`
      stories.push({ text, qs: [
        { ask: 'Find the cost equation.', a: right, d: strs(right, [eq(a, b), eq(b, a, '-'), eq(cost(w1), b), eq(b * 2, a), eq(b, cost(w2))], s + 'a'), s: `Slope ${M(`${BS}frac{${fn(cost(w2))} - ${fn(cost(w1))}}{3 - 1} = ${fn(b)}`)}; ${M(`C = ${fn(b)}w + ${fn(a)}`)}.` },
        { ask: `Find the cost of shipping a ${fn(w3)} pound package.`, a: fm(cost(w3)), d: wrongs(cost(w3), [cost(w3) - a, b * w3, cost(w3) + b], fm, s + 'b'), s: `${M(`${fn(b)} ${BS}times ${fn(w3)} + ${fn(a)} = ${fn(cost(w3))}`)}.` },
        { ask: `If a package cost ${money(cost(w4))} to ship, how much does it weigh?`, a: lb(w4), d: wrongs(w4, [cost(w4) / b, (cost(w4) - a) * b, cost(w4) - a], lb, s + 'c'), s: `${M(`${fn(cost(w4))} = ${fn(b)}w + ${fn(a)}`)} gives ${M(`w = ${fn(w4)}`)} pounds.` },
      ] })
    }
  }
  const n = stories[0]?.qs.length ?? 0
  return Array.from({ length: n }, (_, k) => ({
    p: 'abcd'[k],
    qs: stories.map((st, i) => ({ q: `${st.text} ${st.qs[k].ask}`, a: st.qs[k].a, d: st.qs[k].d, s: st.qs[k].s, l: i < 5 ? 1 : 2 })).filter((q) => q.d.length === 3),
  }))
}
