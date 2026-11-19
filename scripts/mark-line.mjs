// Math 10 1.4 exercise 6 (estimate the position of an irrational number on the number line): the student marks the number on a number line from -6 to 6 (mark-line.tsx; field `mk`).
// Made here (no Gemini): the textbook's seven parts a-g, with other radicands: a square root, b minus a square root, c a square root, d minus the square root of a decimal,
// e a cube root, f minus a cube root, g a cube root. A mark within 0.3 of the true position is right.
// Imported by: export-bank.mjs.
const BS = String.fromCharCode(92)
const M = (x) => BS + '(' + x + BS + ')'
const isSquare = (n) => Number.isInteger(Math.sqrt(n))
const isCube = (n) => Number.isInteger(Math.round(Math.cbrt(n))) && Math.round(Math.cbrt(n)) ** 3 === n

export function markParts(hash) {
  const pick = (seed, lo, hi, step = 1) => lo + (hash(seed) % Math.round((hi - lo) / step + 1)) * step
  const make = (neg, cube, n, level) => {
    const v = (neg ? -1 : 1) * (cube ? Math.cbrt(n) : Math.sqrt(n))
    if (Math.abs(v) > 5.8 || Math.abs(v) < 0.5) return null
    const k = Math.floor(Math.abs(v))
    const root = `${BS}sqrt${cube ? '[3]' : ''}{${n}}`
    const lo = neg ? -(k + 1) : k, hi = neg ? -k : k + 1
    const pw = (t) => (cube ? t ** 3 : t ** 2)
    return {
      q: `Estimate the position of ${M(`${neg ? '-' : ''}${root}`)} on the number line: click where it goes.`,
      a: `Between ${M(String(lo))} and ${M(String(hi))}, at about ${M(v.toFixed(1))}`,
      d: [],
      s: `${M(`${k}${cube ? '^3' : '^2'} = ${pw(k)}`)} and ${M(`${k + 1}${cube ? '^3' : '^2'} = ${pw(k + 1)}`)}, so ${M(root)} is between ${M(String(k))} and ${M(String(k + 1))}${neg ? `; with the minus sign, ${M(`-${root}`)} is between ${M(String(lo))} and ${M(String(hi))}` : ''}. ${M(String(n))} is closer to ${M(String(n < (pw(k) + pw(k + 1)) / 2 ? pw(k) : pw(k + 1)))}, so the dot goes about ${M(v.toFixed(1))}.`,
      l: level,
      mk: { lo: -6, hi: 6, at: Math.round(v * 100) / 100, tol: 0.3 },
    }
  }
  const part = (p, neg, cube, gen, n = 10) => {
    const qs = []
    const seen = new Set()
    for (let i = 0; qs.length < n && i < n * 8; i++) {
      const val = gen(`${p}${i}`)
      if (seen.has(val) || (!cube && isSquare(val * 100) && Number.isInteger(Math.sqrt(val))) || (cube && isCube(val))) continue
      if (!cube && isSquare(val)) continue
      const q = make(neg, cube, val, qs.length < 6 ? 1 : 2)
      if (!q) continue
      seen.add(val)
      qs.push(q)
    }
    return { p, qs }
  }
  return [
    part('a', false, false, (s) => pick(s, 2, 35)),
    part('b', true, false, (s) => pick(s, 2, 35)),
    part('c', false, false, (s) => pick(s, 5, 35)),
    part('d', true, false, (s) => pick(s, 1.1, 8.9, 0.1)),
    part('e', false, true, (s) => pick(s, 2, 120)),
    part('f', true, true, (s) => pick(s, 2, 120)),
    part('g', false, true, (s) => pick(s, 20, 150)),
  ]
}

// Math 10 1.4 exercise 8 (order irrational numbers on the number line): several numbers to put on the line (mark-line.tsx, `items`).
// a: square roots and pi (5 numbers), b: cube roots and e (5), c: square roots and cube roots (6). Every two numbers are at least 0.5 apart.
export function orderParts(hash) {
  const tex = (neg, cube, n) => `${neg ? '-' : ''}${BS}sqrt${cube ? '[3]' : ''}{${n}}`
  const val = (neg, cube, n) => (neg ? -1 : 1) * (cube ? Math.cbrt(n) : Math.sqrt(n))
  const isPerfect = (cube, n) => (cube ? Math.round(Math.cbrt(n)) ** 3 === n : Math.round(Math.sqrt(n)) ** 2 === n)
  const build = (seed, count, mix, special) => {
    for (let attempt = 0; attempt < 60; attempt++) {
      const items = []
      if (special) items.push({ label: special.label, at: special.at })
      let j = 0
      while (items.length < count && j < 40) {
        j++
        const h = hash(`${seed}${attempt}${j}`)
        const cube = mix === 'cube' || (mix === 'both' && h % 2 === 1)
        const neg = (h >> 3) % 3 === 0
        const hiN = cube ? 150 : 35
        const n = 2 + ((h >> 5) % (hiN - 1))
        if (isPerfect(cube, n)) continue
        const v = val(neg, cube, n)
        if (Math.abs(v) > 5.8 || Math.abs(v) < 0.6) continue
        if (items.some((it) => Math.abs(it.at - v) < 0.5 || it.label === tex(neg, cube, n))) continue
        items.push({ label: tex(neg, cube, n), at: Math.round(v * 100) / 100 })
      }
      if (items.length === count) return items
    }
    return null
  }
  const part = (p, count, mix, special) => {
    const qs = []
    const seen = new Set()
    for (let i = 0; qs.length < 10 && i < 40; i++) {
      const items = build(`${p}${i}`, count, mix, special)
      if (!items) continue
      const key = items.map((x) => x.label).sort().join()
      if (seen.has(key)) continue
      seen.add(key)
      const sorted = [...items].sort((x, y) => x.at - y.at)
      const list = items.map((x) => M(x.label)).join(', ')
      qs.push({
        q: `Order the irrational numbers on the number line: ${list}. Select a number, then click its place on the line.`,
        a: `From least to greatest: ${sorted.map((x) => M(x.label)).join(', ')}`,
        d: [],
        s: `Estimate each number between two whole numbers: ${sorted.map((x) => `${M(x.label)} ${BS === '' ? '' : `${BS}(${BS}approx ${x.at.toFixed(1)}${BS})`}`).join(', ')}. Put them on the line in that order, from left to right.`,
        l: qs.length < 5 ? 1 : 2,
        mk: { lo: -6, hi: 6, at: 0, tol: 0.35, items },
      })
    }
    return { p, qs }
  }
  return [
    part('a', 5, 'sqrt', { label: BS + 'pi', at: Math.PI }),
    part('b', 5, 'cube', { label: 'e', at: Math.E }),
    part('c', 6, 'both'),
  ]
}
