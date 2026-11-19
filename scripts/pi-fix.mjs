// Answers that are a decimal approximation of (a whole number or a simple fraction) x pi (226.19 cm^2 = 72 pi cm^2; or 314.00 = 100 x 3.14 when the
// question says "use pi = 3.14") are written with pi: in the answer, in the wrong options and in the solution. In the question, "rounded to two
// decimal places" / "use pi = 3.14" becomes "Leave your answer in terms of pi". A question whose wrong options are not multiples of pi stays as it is.
// Imported by: export-bank.mjs.
const BS = String.fromCharCode(92)
const M = (x) => BS + '(' + x + BS + ')'
export const PI_FIX = { converted: 0, notNice: 0, stillAsks314: 0 }

// v / base as k/den (den 1, 2, 3, 4, 6; the error of a number rounded to 2 decimals), else null
const niceMul = (v, base, dec = 2) => {
  const c = v / base
  const tol = (0.5 * 10 ** -Math.min(dec, 2) + 1e-9) / base // a number rounded to `dec` decimals
  for (const den of [1, 2, 3, 4, 6]) {
    const k = Math.round(c * den)
    if (k !== 0 && Math.abs(c * den - k) < tol * den * 1.05 && Math.abs(v) > 0.5) return [k, den]
  }
  return null
}
const piTex = ([k, den]) => {
  const sign = k < 0 ? '-' : ''
  const a = Math.abs(k)
  const coef = a === 1 ? '' : String(a)
  return den === 1 ? `${sign}${coef}${BS}pi` : `${sign}${BS}frac{${coef}${BS}pi}{${den}}`
}
const DEC = /(\d{1,3}(?:,\d{3})+|\d+)\.(\d{1,4})/g
const value = (i, f) => Number(`${i.replace(/,/g, '')}.${f}`)

// a plain decimal answer: a number with a unit (cm^2, m^3 ...) or none; money stays a decimal
const parseAnswer = (x) => {
  const t = x.trim().replace(new RegExp('^' + BS + BS + '\\(\\s*'), '').replace(new RegExp('\\s*' + BS + BS + '\\)$'), '')
  const m = /^(-?)(\$?)((?:\d{1,3}(?:,\d{3})+|\d+)\.\d+)\s*(.*)$/.exec(t)
  if (!m || m[2]) return null
  return { neg: m[1], v: Number(m[3].replace(/,/g, '')), dec: m[3].split('.')[1].length, unit: m[4].trim() }
}

// the sentence / clause of the question that asks for pi = 3.14 is taken out
const dropAsk314 = (q) => {
  let t = q
  const sentence = new RegExp('(^|[.?!]\\s+)(?:Use|Using|Take|Taking|Assume|Assuming|Let|Approximate|Approximating)\\b[^.?!]*3\\.14[^.?!]*[.]\\s*', 'g')
  t = t.replace(sentence, '$1')
  // "Using pi = 3.14, find ..." at the start
  t = t.replace(new RegExp('^(?:Use|Using|Take|Taking|Assume|Assuming)\\b[^,?.]*3\\.14[^,?.]*,\\s*(\\w)'), (m, c) => c.toUpperCase())
  // "(use pi = 3.14)"
  t = t.replace(new RegExp('\\s*\\((?:use|using|take)[^)]*3\\.14[^)]*\\)', 'gi'), '')
  return t.trim()
}

export function piQuestion(q, a, d, sol0) {
  let sol = sol0
  if (!/cylinder|cone|sphere|circle|circular|radius|diameter|circumference|revolution|wheel|tart|pizza/i.test(q + ' ' + sol)) return null
  const pa = parseAnswer(a)
  if (!pa) return null
  const asks314 = /3\.14/.test(q)
  const base = asks314 ? 3.14 : Math.PI
  const conv = (p) => {
    if (!p) return null
    const n = niceMul(p.v, base, p.dec)
    if (!n) return null
    return M(`${p.neg}${piTex(n)}${p.unit ? ' ' + p.unit : ''}`)
  }
  // an answer that is not a simple multiple of pi is still written with pi: the smallest denominator that reproduces the rounded number
  const pairFinal = (p) => {
    const strict = niceMul(p.v, base, p.dec)
    if (strict) return strict
    const tol = 0.5 * 10 ** -Math.min(p.dec, 2) + 1e-9
    for (const den of [1, 2, 3, 4, 5, 6, 8, 9, 10, 12, 16, 18, 24, 25, 32, 36, 48, 50, 64, 100]) {
      const k = Math.round((p.v / base) * den)
      if (k !== 0 && Math.abs((k / den) * base - p.v) <= tol) return [k, den]
    }
    return null
  }
  const pairA = pairFinal(pa)
  const na = pairA ? M(`${pa.neg}${piTex(pairA)}${pa.unit ? ' ' + pa.unit : ''}`) : null
  const convLoose = (p) => {
    if (!p) return null
    const strict = conv(p)
    if (strict) return strict
    const c = p.v / base
    for (const den of [1, 2, 3, 4, 5, 6, 8, 10, 12]) {
      const k = Math.round(c * den)
      if (k !== 0 && Math.abs(c * den - k) < 0.02 * den) return M(`${p.neg}${piTex([k, den])}${p.unit ? ' ' + p.unit : ''}`)
    }
    const r = Math.round(c * 10) / 10
    return M(`${p.neg}${r}${BS}pi${p.unit ? ' ' + p.unit : ''}`)
  }
  const nd = d.map((x) => convLoose(parseAnswer(x)))
  if (!na || nd.some((x) => !x)) {
    PI_FIX.notNice++
    return null
  }
  let nq = q
  if (asks314) {
    nq = dropAsk314(nq)
    if (/3\.14/.test(nq)) {
      PI_FIX.stillAsks314++
      return null
    }
  }
  nq = nq
    .replace(/,?\s*(?:and\s+)?(?:rounded|round)(?: your answer| the answer)?\s+(?:off\s+)?to\s+(?:the nearest\s+)?(?:\w+\s+)?(?:decimal places?|tenths?|hundredths?|whole numbers?|integers?)\s*\.?/gi, '')
    .replace(/\s+([.?:])/g, '$1')
    .trim()
  if (!/in terms of|exact/i.test(nq)) nq = nq.replace(/[.?]?$/, nq.endsWith('?') ? '?' : '.') + ` Leave your answer in terms of ${M(BS + 'pi')}.`
  // the solution: each decimal that is a multiple of pi (of 3.14) is written with pi; outside a formula it is wrapped as a formula
  const cut = sol.search(/\s(?:Using a calculator|With a calculator|Use a calculator|Rounding|Rounded|To two decimal|To the nearest|Approximating)/i)
  if (cut > 0) sol = sol.slice(0, cut)
  let ns = ''
  let last = 0
  const sub = (text, inFormula) => text.replace(DEC, (m0, i, f) => {
    if (m0 === '3.14' || m0 === '3.1416' || m0 === '3.142') return m0
    const n = value(i, f) === pa.v ? pairA : niceMul(value(i, f), base)
    if (!n) return m0
    return inFormula ? piTex(n) : M(piTex(n))
  })
  for (const m of sol.matchAll(new RegExp(BS + BS + '\\(([\\s\\S]+?)' + BS + BS + '\\)', 'g'))) {
    ns += sub(sol.slice(last, m.index), false) + BS + '(' + sub(m[1], true) + BS + ')'
    last = m.index + m[0].length
  }
  ns += sub(sol.slice(last), false)
  ns = ns.replace(/\s*\\approx\s*(?:\\frac\{\d*\\pi\}\{\d+\}|-?\d*\\pi)/g, '') // "140 pi approx 140 pi": the second part is the same number
  PI_FIX.converted++
  return { q: nq, a: na, d: nd, s: ns }
}
