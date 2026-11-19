// Math 10 4.5 exercises 1-5 (linear relation applications): ONE story per question number, and the parts a, b, c, d ask different things about the SAME story, as in the textbook.
// The 10 questions of a part are 10 stories with other numbers, the same stories in every part.
//   ex 1 appliance repair shop (hourly rate; equation; fixed cost; domain and range)   ex 2 a car losing value (yearly depreciation; equation; new price; domain and range)
//   ex 3 a spring (linear relation; length for a force; force for a length)            ex 4 an apartment building (yearly increase; value some years ago; domain and range)
//   ex 5 a taxi (cost per km; equation; distance for a fare; domain and range)
// Made here (no Gemini). Imported by: export-bank.mjs.
const BS = String.fromCharCode(92)
const M = (x) => BS + '(' + x + BS + ')'
const fn = (n) => (Number.isInteger(n) ? String(n) : String(+n.toFixed(2)))
const big = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
const money = (n) => `$${Number.isInteger(n) ? big(n) : n.toFixed(2)}`

export function linearStoryParts(hash, no) {
  const pick = (seed, arr) => arr[hash(seed) % arr.length]
  // wrong numbers around the right one (same sign)
  const wrongs = (v, extra, f, seed) => {
    const base = [...extra, v * 2, v / 2, v * 1.5, v * 0.75, v * 10, v / 10, ...(Math.abs(v) < 30 ? [v + 1, v - 1] : [])]
    return [...new Set(base.filter((x) => Number.isFinite(x) && x !== v && x * v > 0 && f(x) !== f(v)).map(f))].sort((a, b) => hash(seed + a) - hash(seed + b)).slice(0, 3)
  }
  const pickStrings = (right, cands, seed) => [...new Set(cands.filter((c) => c !== right))].sort((a, b) => hash(seed + a) - hash(seed + b)).slice(0, 3)
  const stories = []
  for (let i = 0; stories.length < 10 && i < 300; i++) {
    const s = `${no}ls${i}`
    if (no === 1) {
      const r = pick(s + 'r', [30, 40, 50, 35, 45, 25, 60]), F = pick(s + 'f', [10, 20, 30, 15, 25, 40]), [h1, h2] = pick(s + 'h', [[1, 3], [2, 5], [2, 6], [1, 4], [3, 5]])
      const shop = pick(s + 's', [['An appliance repair shop', 'repair'], ['A plumber', 'plumbing'], ['A computer repair shop', 'repair'], ['An electrician', 'electrical']])
      const c1 = F + r * h1, c2 = F + r * h2
      const text = `${shop[0]} charges an hourly rate plus a fixed amount. ${h1 === 1 ? 'One hour' : `${h1} hours`} costs ${money(c1)}, and ${h2} hours costs ${money(c2)}.`
      const eq = (a, b, op = '+') => M(`C = ${a}H ${op} ${b}`)
      const rightEq = eq(r, F)
      const fm = (x) => `${money(x)} per hour`
      stories.push({ text, qs: [
        { ask: 'Determine the hourly rate.', a: fm(r), d: wrongs(r, [F, c2 - c1, c1 / h1], fm, s + 'a'), s: `${M(`${BS}frac{${c2} - ${c1}}{${h2} - ${h1}} = ${r}`)} dollars per hour.` },
        { ask: 'Write the equation that shows how the total cost, C, depends on the number of hours, H, and the fixed cost, F.', a: rightEq, d: pickStrings(rightEq, [eq(F, r), eq(r, F, '-'), M(`C = ${r + F}H`), M(`C = ${r}H`), eq(r * 2, F)], s + 'b'), s: `Rate ${M(String(r))} and fixed cost ${M(String(F))}: ${rightEq}.` },
        { ask: 'Determine the fixed amount cost.', a: money(F), d: wrongs(F, [r, c1, c2 - r], money, s + 'c'), s: `${M(`${c1} - ${r} ${BS}times ${h1} = ${F}`)} dollars.` },
        { ask: 'Determine the domain and range.', a: M(`H ${BS}ge 0;~C ${BS}ge ${F}`), d: pickStrings(M(`H ${BS}ge 0;~C ${BS}ge ${F}`), [M(`C ${BS}ge 0;~H ${BS}ge ${F}`), M(`H ${BS}ge ${F};~C ${BS}ge 0`), M(`H ${BS}ge 0;~C ${BS}ge ${r}`), M(`H > 0;~C ${BS}ge ${c1}`), M(`H ${BS}le ${F};~C ${BS}le 0`)], s + 'd'), s: `The hours cannot be negative, so ${M(`H ${BS}ge 0`)}. At ${M('H = 0')} the cost is the fixed amount ${M(String(F))} and it grows from there: ${M(`C ${BS}ge ${F}`)}.` },
      ] })
    }
    if (no === 2) {
      const d = pick(s + 'd', [2000, 2400, 2200, 1800, 2500, 3000]), y1 = pick(s + 'y', [3, 4, 5]), span = pick(s + 'p', [10, 8, 6]), N = pick(s + 'n', [30000, 36000, 40000, 35000, 45000, 50000])
      const v1 = N - d * y1, v2 = N - d * (y1 + span)
      if (v2 <= 0) continue
      const text = `A ${y1} year old car is worth ${money(v1)}, and will be worth ${money(v2)} ${span} years from now.`
      const eq = (a, b) => M(`V = ${a} - ${b}Y`)
      const right = eq(String(N), String(d))
      const fm = (x) => money(x)
      stories.push({ text, qs: [
        { ask: 'Find the yearly depreciation of the car.', a: `${money(d)} per year`, d: wrongs(d, [v1 / y1, v1 - v2, d * span], (x) => `${money(Math.round(x))} per year`, s + 'a'), s: `${M(`${BS}frac{${v1} - ${v2}}{${span}} = ${d}`)} dollars per year.` },
        { ask: 'Write the equation that shows how the value of the car, V, depends on the new cost of the car, N, and how many years old it is, Y.', a: right, d: pickStrings(right, [eq(String(d), String(N)), M(`V = ${String(N)} + ${String(d)}Y`), eq(String(v1), String(d)), M(`V = ${String(d)}Y`), eq(String(N), String(v1 / y1))], s + 'b'), s: `New price ${M(String(N))} minus ${M(String(d))} for every year: ${right}.` },
        { ask: 'Find the new price of the car.', a: fm(N), d: wrongs(N, [v1 + d, v1 + d * span, v1], fm, s + 'c'), s: `${M(`${v1} + ${d} ${BS}times ${y1} = ${N}`)} dollars.` },
        { ask: 'Determine the domain and range.', a: M(`0 ${BS}le Y ${BS}le ${fn(N / d)};~0 ${BS}le V ${BS}le ${N}`), d: pickStrings(M(`0 ${BS}le Y ${BS}le ${fn(N / d)};~0 ${BS}le V ${BS}le ${N}`), [M(`0 ${BS}le Y ${BS}le ${N};~0 ${BS}le V ${BS}le ${fn(N / d)}`), M(`0 ${BS}le Y ${BS}le ${span};~${v2} ${BS}le V ${BS}le ${v1}`), M(`Y ${BS}ge 0;~V ${BS}ge 0`), M(`0 ${BS}le Y ${BS}le ${fn(N / d)};~0 ${BS}le V ${BS}le ${v1}`)], s + 'd'), s: `The car is worth ${M(String(N))} when new (${M('Y = 0')}) and nothing after ${M(`${N} ${BS}div ${d} = ${fn(N / d)}`)} years.` },
      ] })
    }
    if (no === 3) {
      const [k, den] = pick(s + 'k', [[1, 4], [1, 5], [1, 2], [1, 3]]), L0 = pick(s + 'l', [24, 20, 30, 28, 36]), f1 = den * pick(s + 'a', [4, 3, 5]), f2 = f1 + den * pick(s + 'b', [5, 4, 6])
      const kk = k / den, L1 = L0 - kk * f1, L2 = L0 - kk * f2, f3 = den * pick(s + 'c', [7, 9, 8, 10]) + den, L3 = L0 - kk * f3, Lt = L0 - kk * (f3 + den * 3), ft = (L0 - Lt) / kk
      if (L2 <= 3 || Lt <= 2 || !Number.isInteger(L1) || !Number.isInteger(L2) || !Number.isInteger(L3) || !Number.isInteger(Lt) || f3 === f1 || f3 === f2) continue
      const text = `A spring that is ${L0} inches long is compressed to ${L1} inches by a force of ${f1} pounds, and to ${L2} inches by a force of ${f2} pounds.`
      const eq = (a, b, op = '-') => M(`L = ${a} ${op} ${b}F`)
      const right = eq(L0, fn(kk))
      const fl = (x) => `${fn(x)} inches`, ff = (x) => `${fn(x)} pounds`
      stories.push({ text, qs: [
        { ask: 'Determine the linear relation between the length of the spring, L, and the force, F.', a: right, d: pickStrings(right, [eq(L0, fn(kk), '+'), eq(fn(kk), L0), eq(L0, fn(1 / kk)), M(`L = ${L0}F`), eq(L1, fn(kk))], s + 'a'), s: `Slope ${M(`${BS}frac{${L2} - ${L1}}{${f2} - ${f1}} = ${fn(-kk)}`)}, length ${M(String(L0))} with no force: ${right}.` },
        { ask: `What is the length of the spring if a force of ${f3} pounds is applied?`, a: fl(L3), d: wrongs(L3, [L0 - f3, L0 + kk * f3, L0 - L3], fl, s + 'b'), s: `${M(`L = ${L0} - ${fn(kk)} ${BS}times ${f3} = ${fn(L3)}`)} inches.` },
        { ask: `How much force is needed to compress the spring to ${fn(Lt)} inches?`, a: ff(ft), d: wrongs(ft, [L0 - Lt, (L0 - Lt) * kk, Lt / kk], ff, s + 'c'), s: `${M(`${fn(Lt)} = ${L0} - ${fn(kk)}F`)} gives ${M(`F = ${fn(ft)}`)} pounds.` },
      ] })
    }
    if (no === 4) {
      const V0 = pick(s + 'v', [860000, 640000, 500000, 720000, 900000, 480000]), n = pick(s + 'n', [5, 4, 6, 10]), mult = pick(s + 'm', [2, 3]), ago = pick(s + 'a', [3, 2, 1])
      const inc = (V0 * (mult - 1)) / n
      if (!Number.isInteger(inc) || V0 - ago * inc <= 0) continue
      const word = mult === 2 ? 'double' : 'triple'
      const text = `An apartment building is worth ${money(V0)}. The owner expects the property to ${word} its value over the next ${n} years.`
      const fm = (x) => money(Math.round(x))
      const dom = M(`0 ${BS}le t ${BS}le ${n};~${V0} ${BS}le V ${BS}le ${V0 * mult}`)
      stories.push({ text, qs: [
        { ask: 'Find the yearly increase of the apartment.', a: `${money(inc)} per year`, d: wrongs(inc, [V0 / n, V0 * mult / n, V0], (x) => `${money(Math.round(x))} per year`, s + 'a'), s: `The increase is ${M(`${V0 * mult} - ${V0} = ${V0 * (mult - 1)}`)} over ${n} years: ${M(`${V0 * (mult - 1)} ${BS}div ${n} = ${inc}`)} dollars per year.` },
        { ask: `What was the value of the apartment building ${ago} year${ago > 1 ? 's' : ''} ago, if the rate of increase is constant?`, a: fm(V0 - ago * inc), d: wrongs(V0 - ago * inc, [V0 + ago * inc, V0 - inc, V0 - ago * V0 / n], fm, s + 'b'), s: `${M(`${V0} - ${ago} ${BS}times ${inc} = ${V0 - ago * inc}`)} dollars.` },
        { ask: 'Find the domain and range.', a: dom, d: pickStrings(dom, [M(`${V0} ${BS}le t ${BS}le ${V0 * mult};~0 ${BS}le V ${BS}le ${n}`), M(`0 ${BS}le t ${BS}le ${n};~0 ${BS}le V ${BS}le ${V0}`), M(`t ${BS}ge 0;~V ${BS}ge ${V0}`), M(`0 ${BS}le t ${BS}le ${n + 1};~${V0} ${BS}le V ${BS}le ${V0 * mult}`)], s + 'c'), s: `Time runs from ${M('0')} to ${M(String(n))} years; the value from ${M(String(V0))} to ${M(String(V0 * mult))}.` },
      ] })
    }
    if (no === 5) {
      const r = pick(s + 'r', [1.2, 1.5, 1.8, 2, 1.25, 1.6]), f = pick(s + 'f', [3.5, 4, 5, 2.5, 3, 6]), k1 = pick(s + 'k', [10, 15, 12, 20]), k2 = k1 + pick(s + 'j', [10, 13, 15, 20, 8]), k3 = pick(s + 'm', [25, 30, 35, 40, 45, 50]) + (hash(s + 'z') % 4)
      const cost = (k) => +(f + r * k).toFixed(2)
      if (k3 === k1 || k3 === k2) continue
      const text = `A taxi driver charged a passenger ${money(cost(k1))} to travel ${k1} km, and charged another passenger ${money(cost(k2))} to travel ${k2} km.`
      const eq = (a, b, op = '+') => M(`T = ${fn(a)}K ${op} ${fn(b)}`)
      const right = eq(r, f)
      const fk = (x) => `${money(+x.toFixed(2))} per km`, fd = (x) => `${fn(+x.toFixed(2))} km`
      const dom = M(`K ${BS}ge 0;~T ${BS}ge ${fn(f)}`)
      stories.push({ text, qs: [
        { ask: 'Find the cost per km.', a: fk(r), d: wrongs(r, [f, cost(k1) / k1, cost(k2) - cost(k1)], fk, s + 'a'), s: `${M(`${BS}frac{${fn(cost(k2))} - ${fn(cost(k1))}}{${k2} - ${k1}} = ${fn(r)}`)} dollars per km.` },
        { ask: 'Write the equation that shows how the total cost, T, depends on the number of kilometres, K, plus a fixed amount.', a: right, d: pickStrings(right, [eq(f, r), eq(r, f, '-'), M(`T = ${fn(r + f)}K`), eq(r, cost(k1)), eq(cost(k1) / k1, f)], s + 'b'), s: `Rate ${M(fn(r))} per km and fixed ${M(fn(f))}: ${right}.` },
        { ask: `How far can a person travel for ${money(cost(k3))}?`, a: fd(k3), d: wrongs(k3, [cost(k3) / r, (cost(k3) - f) / r + f, cost(k3)], fd, s + 'c'), s: `${M(`${fn(cost(k3))} = ${fn(r)}K + ${fn(f)}`)} gives ${M(`K = ${k3}`)} km.` },
        { ask: 'Determine the domain and range.', a: dom, d: pickStrings(dom, [M(`T ${BS}ge 0;~K ${BS}ge ${fn(f)}`), M(`K ${BS}ge ${fn(f)};~T ${BS}ge 0`), M(`K ${BS}ge 0;~T ${BS}ge ${fn(r)}`), M(`K > 0;~T ${BS}ge ${fn(cost(k1))}`)], s + 'd'), s: `The distance is ${M(`K ${BS}ge 0`)}; at ${M('K = 0')} the cost is the fixed amount ${M(fn(f))}, so ${M(`T ${BS}ge ${fn(f)}`)}.` },
      ] })
    }
  }
  const n = stories[0]?.qs.length ?? 0
  return Array.from({ length: n }, (_, k) => ({
    p: 'abcd'[k],
    qs: stories.map((st, i) => ({ q: `${st.text} ${st.qs[k].ask}`, a: st.qs[k].a, d: st.qs[k].d, s: st.qs[k].s, l: i < 5 ? 1 : 2 })).filter((q) => q.d.length === 3),
  }))
}
