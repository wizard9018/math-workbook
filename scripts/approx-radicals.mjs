// Math 10 1.4 exercise 3 (approximate an irrational number): "Using a calculator ... to 2 decimal places" becomes "Without using a calculator ... to 1 decimal place".
// Only the questions that are a single radical (a square or cube root of a number, with or without a minus sign) are kept: they can be done by squeezing the number between
// two perfect squares / cubes and then between two tenths. The answers, wrong options and solutions are computed here. The questions with several radicals are dropped.
// Imported by: export-bank.mjs.
const BS = String.fromCharCode(92)
const M = (x) => BS + '(' + x + BS + ')'
const SINGLE = /^(.*?:\s*|.*?value of\s+)\\\((-?)\\sqrt(\[3\])?\{([\d.]+)\}\\\)\.?\s*$/s

const fmt = (v, d = 1) => {
  const t = (Math.round(v * 10 ** d) / 10 ** d).toFixed(d)
  return t === '-0.0' ? '0.0' : t
}
const sq = (t, cube) => (cube ? t ** 3 : t ** 2)
const tex = (n) => (+n.toFixed(4)).toString()

export function approxRadicals(parts) {
  const out = []
  for (const p of parts) {
    const qs = []
    const seen = new Set()
    for (const q of p.qs) {
      const m = SINGLE.exec(q.q)
      if (!m) continue
      const neg = m[2] === '-', cube = !!m[3], n = Number(m[4])
      if (!(n > 0) || seen.has(`${neg}${cube}${n}`)) continue
      seen.add(`${neg}${cube}${n}`)
      const v = cube ? Math.cbrt(n) : Math.sqrt(n)
      const lo = Math.floor(v * 10 + 1e-9) / 10, hi = Math.round((lo + 0.1) * 10) / 10
      const mid = lo + 0.05
      const ans = fmt(v)
      if (Math.abs(v - mid) < 0.004) continue // too close to a rounding boundary to decide by hand
      const sgn = neg ? -1 : 1
      const show = (x) => (neg ? '-' : '') + fmt(x)
      const root = (x) => `${BS}sqrt${cube ? '[3]' : ''}{${x}}`
      // the wrong options: a tenth too small / too big, the number divided by the index
      const naive = fmt(n / (cube ? 3 : 2))
      const cand = [fmt(v - 0.1), fmt(v + 0.1), naive, fmt(v + 0.2), fmt(v - 0.2)].filter((x, i, a) => x !== ans && a.indexOf(x) === i)
      const d = cand.slice(0, 3).map((x) => (neg ? '-' : '') + x)
      if (d.length < 3) continue
      const k0 = Math.floor(v + 1e-9)
      const s1 = `${M(`${k0}${cube ? '^3' : '^2'} = ${sq(k0, cube)}`)} and ${M(`${k0 + 1}${cube ? '^3' : '^2'} = ${sq(k0 + 1, cube)}`)}, so ${M(root(tex(n)))} is between ${M(String(k0))} and ${M(String(k0 + 1))}.`
      const s2 = `Try tenths: ${M(`${fmt(lo)}${cube ? '^3' : '^2'} = ${tex(sq(lo, cube))}`)} and ${M(`${fmt(hi)}${cube ? '^3' : '^2'} = ${tex(sq(hi, cube))}`)}, so it is between ${M(fmt(lo))} and ${M(fmt(hi))}.`
      const s3 = `The middle is ${M(`${fmt(mid, 2)}${cube ? '^3' : '^2'} = ${tex(sq(mid, cube))}`)}; ${M(tex(n))} is ${n < sq(mid, cube) ? 'less' : 'greater'} than that, so ${M(root(tex(n)))} is closer to ${M(fmt(n < sq(mid, cube) ? lo : hi))}.`
      void sgn
      qs.push({
        q: `Without using a calculator, approximate the irrational number to 1 decimal place: ${M(`${neg ? '-' : ''}${root(tex(n))}`)}.`,
        a: show(v), d, s: `${s1} ${s2} ${s3}${neg ? ' With the minus sign the answer is negative.' : ''}`, l: q.l,
      })
    }
    if (qs.length) out.push({ p: p.p, qs })
  }
  return out
}
