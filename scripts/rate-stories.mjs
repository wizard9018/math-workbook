// Math 10 4.2 exercises 15-18 (unit rates and rates of change in context): ONE story per question number, and the parts a, b, c ... ask different things about the SAME story,
// like the textbook (the story of part a is the story of part b). The 10 questions of a part are 10 stories with other numbers, the same in every part.
//   ex 15 water tower (rate of change of the volume; litres left after 4 min; time to empty 3/4; time to empty)
//   ex 16 wedding (cost per person for two different numbers of guests and drinks)
//   ex 17 bicycle rental (average speed; $ per hour; $ per km)
//   ex 18 typing (pay per hour; pages per hour; pay per page)
// Made here (no Gemini). Imported by: export-bank.mjs.
const BS = String.fromCharCode(92)
const M = (x) => BS + '(' + x + BS + ')'
const fn = (n) => (Number.isInteger(n) ? String(n) : String(+n.toFixed(2)))
const money = (n) => `$${Number.isInteger(n) ? n : n.toFixed(2)}`
const clock = (h) => `${((Math.floor(h) + 11) % 12) + 1}:00 ${h >= 12 && h < 24 ? 'pm' : 'am'}`

export function rateStoryParts(hash, no) {
  const pick = (seed, arr) => arr[hash(seed) % arr.length]
  // a wrong option set around the right value
  const wrongs = (v, extra, f, seed) => {
    const base = [...extra, v * 2, v / 2, v * 1.5, v * 0.75, v * 10, v / 10, ...(Math.abs(v) < 20 ? [v + 1, v - 1] : [])]
    const c = base.filter((x) => Number.isFinite(x) && x !== v && f(x) !== f(v) && x * v > 0) // the same sign as the right answer
    return [...new Set(c.map(f))].sort((a, b) => hash(seed + a) - hash(seed + b)).slice(0, 3)
  }
  const stories = []
  for (let i = 0; stories.length < 10 && i < 200; i++) {
    const s = `${no}story${i}`
    if (no === 15) {
      const V = pick(s + 'V', [10000, 8000, 12000, 9000, 6000]), r = pick(s + 'r', [300, 200, 250, 400, 150, 500]), per = pick(s + 'p', [30, 20, 60])
      const rate = r / per
      const t4 = pick(s + 'm', [4, 3, 5]) * 60, afterT4 = V - rate * t4
      if (afterT4 <= 0 || !Number.isInteger(V / rate) || !Number.isInteger((0.75 * V) / rate) || !Number.isInteger(afterT4)) continue
      const text = `A water tower holds ${V.toLocaleString('en-US').replace(',', ' ')} litres of water. When a valve is opened, the tower has ${V - r} litres after ${per} seconds, and ${V - 2 * r} litres after ${2 * per} seconds. The water continues to drain at the same rate until the tower is empty.`
      const fL = (x) => `${fn(x)} litres`, fS = (x) => `${fn(x)} s`, fR = (x) => `${fn(x)} litres per second`
      const mins = (x) => `${fn(x / 60)} minutes`
      stories.push({
        text,
        qs: [
          { ask: 'Determine the rate of change of volume with respect to time.', a: fR(-rate), d: wrongs(-rate, [rate / 2, r], fR, s), s: `${M(`${BS}frac{${V - 2 * r} - ${V - r}}{${2 * per} - ${per}} = ${fn(-rate)}`)} litres per second (negative: the volume goes down).` },
          { ask: `How much water remains after ${t4 / 60} minutes?`, a: fL(afterT4), d: wrongs(afterT4, [V - rate * t4 / 60, V - r * 4], fL, s + 'b'), s: `${t4 / 60} minutes is ${t4} seconds: ${M(`${V} - ${fn(rate)} ${BS}times ${t4} = ${fn(afterT4)}`)} litres.` },
          { ask: 'How much time is needed to empty 3/4 of the water in the tower?', a: mins((0.75 * V) / rate), d: wrongs((0.75 * V) / rate, [V / rate, V / 4 / rate], mins, s + 'c'), s: `${M(`${BS}frac{3}{4} ${BS}times ${V} = ${fn(0.75 * V)}`)} litres at ${fn(rate)} litres per second: ${M(`${fn(0.75 * V)} ${BS}div ${fn(rate)} = ${fn((0.75 * V) / rate)}`)} seconds.` },
          { ask: 'How long does it take to empty the water tower?', a: mins(V / rate), d: wrongs(V / rate, [(0.75 * V) / rate, V / (rate * 2)], mins, s + 'd'), s: `${M(`${V} ${BS}div ${fn(rate)} = ${fn(V / rate)}`)} seconds.` },
        ],
      })
    }
    if (no === 16) {
      const B = pick(s + 'B', [900, 600, 1200, 800, 1000]), f = pick(s + 'f', [20, 25, 18, 30, 15]), d = pick(s + 'd', [2, 3, 1.5, 2.5]), g1 = pick(s + 'g', [120, 100, 150, 80]), g2 = pick(s + 'h', [200, 250, 180, 160]), k1 = pick(s + 'k', [2, 1, 3]), k2 = pick(s + 'l', [3, 4, 2])
      if (g1 === g2 || k1 === k2) continue
      const cost = (g, k) => (B + g * f + g * k * d) / g
      const text = `Lulu hires a band to play at a wedding. The cost for the wedding was ${money(B)} for the band, plus ${money(f)} per guest for food. Beverages cost ${money(d)} extra each.`
      const fP = (x) => `${money(+x.toFixed(2))}`
      const q = (g, k, sd) => ({ ask: `Determine the cost per person if ${g} guests attended the wedding, and averaged ${k} drinks per person.`, a: fP(cost(g, k)), d: wrongs(cost(g, k), [f + k * d, B / g + f, cost(g, k) + d], fP, sd), s: `Total ${M(`${B} + ${g} ${BS}times ${f} + ${g} ${BS}times ${k} ${BS}times ${fn(d)}`)} ${M(`= ${fn(cost(g, k) * g)}`)}; divide by ${g} guests: ${M(`${fn(cost(g, k))}`)} dollars per person.` })
      stories.push({ text, qs: [q(g1, k1, s + 'a'), q(g2, k2, s + 'b')] })
    }
    if (no === 17) {
      const h = pick(s + 'h', [3, 4, 5, 6]), sp = pick(s + 'v', [10, 12, 15, 8, 16]), rate = pick(s + 'r', [4, 5, 5.5, 6, 3.5, 2.5]), start = pick(s + 't', [9, 10, 11, 12]), thing = pick(s + 'i', [['bicycle', 'Stanley Park'], ['kayak', 'the coastline'], ['scooter', 'the harbour'], ['canoe', 'the lake']])
      const km = sp * h, cost = rate * h
      const text = `At ${clock(start)}, a student rented a ${thing[0]} to travel around ${thing[1]}. She returned it at ${clock(start + h)} the same day after travelling ${km} km. It cost ${money(cost)} to rent the ${thing[0]}.`
      const fSp = (x) => `${fn(x)} km/h`, fH = (x) => `${money(+x.toFixed(2))} per hour`, fK = (x) => `${money(+x.toFixed(2))} per km`
      stories.push({
        text,
        qs: [
          { ask: "Determine the student's average speed in km/hr.", a: fSp(sp), d: wrongs(sp, [km, h, km + h], fSp, s + 'a'), s: `Distance ${km} km in ${h} hours: ${M(`${km} ${BS}div ${h} = ${sp}`)} km/h.` },
          { ask: `Determine the rental rate in dollars per hour.`, a: fH(rate), d: wrongs(rate, [cost, cost / km, h / cost], fH, s + 'b'), s: `${M(`${fn(cost)} ${BS}div ${h} = ${fn(rate)}`)} dollars per hour.` },
          { ask: `Determine the rental rate in dollars per km.`, a: fK(cost / km), d: wrongs(cost / km, [rate, km / cost, cost / h / 10], fK, s + 'c'), s: `${M(`${fn(cost)} ${BS}div ${km} = ${fn(+(cost / km).toFixed(3))}`)} dollars per km.` },
        ],
      })
    }
    if (no === 18) {
      const start = pick(s + 's', [8, 9, 7]), lunch = pick(s + 'l', [1, 1, 0.5]), hours = pick(s + 'h', [6, 7, 8, 9].filter((x) => Number.isInteger(x - lunch) || true)), perHour = pick(s + 'k', [2, 3, 4, 5]), pay = pick(s + 'p', [10, 12, 15, 20, 25]) // $ per page
      const pages = perHour * (hours - lunch)
      if (!Number.isInteger(pages) || start + hours > 20) continue
      const p1 = pick(s + 'f', [25, 10, 30, 41]), p2 = p1 + pages - 1
      const total = pay * pages, wh = hours - lunch
      const text = `Pearl was hired by Crescent Beach Publishing to type the manuscript for a mathematics book. She started work at ${clock(start)}, took ${lunch === 1 ? 'an hour' : 'half an hour'} for lunch, and finished at ${clock(start + hours)}. Her pay for typing page ${p1} to the end of page ${p2} was ${money(total)}.`
      const fH = (x) => `${money(+x.toFixed(2))} per hour`, fPg = (x) => `${fn(x)} pages per hour`, fD = (x) => `${money(+x.toFixed(2))} per page`
      stories.push({
        text,
        qs: [
          { ask: "Determine Pearl's pay in dollars per hour.", a: fH(total / wh), d: wrongs(total / wh, [total / hours, total / pages, pay], fH, s + 'a'), s: `She worked ${M(`${hours} - ${fn(lunch)} = ${fn(wh)}`)} hours: ${M(`${total} ${BS}div ${fn(wh)} = ${fn(total / wh)}`)} dollars per hour.` },
          { ask: "Determine Pearl's typing rate in pages per hour.", a: fPg(pages / wh), d: wrongs(pages / wh, [pages / hours, wh / pages, (p2 - p1) / wh], fPg, s + 'b'), s: `Pages ${p1} to ${p2} is ${M(`${p2} - ${p1} + 1 = ${pages}`)} pages in ${fn(wh)} hours: ${M(`${fn(pages / wh)}`)} pages per hour.` },
          { ask: "Determine Pearl's rate of pay in dollars per page.", a: fD(pay), d: wrongs(pay, [total / (p2 - p1), total / wh, wh / pay], fD, s + 'c'), s: `${M(`${total} ${BS}div ${pages} = ${fn(pay)}`)} dollars per page (${pages} pages).` },
        ],
      })
    }
  }
  const nParts = stories[0]?.qs.length ?? 0
  return Array.from({ length: nParts }, (_, k) => ({
    p: 'abcd'[k],
    qs: stories.map((st, i) => {
      const q = st.qs[k]
      return { q: `${st.text} ${q.ask}`, a: q.a, d: q.d, s: q.s, l: i < 5 ? 1 : 2 }
    }).filter((q) => q.d.length === 3),
  }))
}
