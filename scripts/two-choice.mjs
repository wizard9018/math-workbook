// A question whose four options are only yes / no (true / false, rational / irrational) with a reason each is a two-choice question: the options are just the two
// words, the right option's full text (with its reason) goes to the front of the solution. Options that carry a value ("Rational; it equals 0.3") stay as they are.
// Imported by: export-bank.mjs.
const PAIRS = [['True', 'False'], ['Yes', 'No'], ['Rational', 'Irrational']]
export const TWO = { converted: 0 }
const SPLIT = /^\s*(?:\\\(\s*)?(true|false|yes|no|rational|irrational)\b(.*)$/is
const EMPTY = /^\s*[.]?\s*$/
const REASON = /^\s*[,.]\s*(because|since|as|so|it|the|there|each|every|only|but|when|if|this|a|an|its|they)\b/i
const SEMI = /^\s*;/
const OPEN = /^\s*\\\(\s*/

export function twoChoice(q) {
  if (!Array.isArray(q.d) || q.d.length !== 3) return
  const parts = [q.a, ...q.d].map((t) => { const m = SPLIT.exec(t); return m ? [m[1].toLowerCase(), m[2]] : null })
  if (parts.some((p) => !p)) return
  const pair = PAIRS.find((pr) => parts.every((p) => pr.some((w) => w.toLowerCase() === p[0])))
  if (!pair || !pair.every((w) => parts.some((p) => p[0] === w.toLowerCase()))) return
  // after the word: nothing, or a reason ("because ..."); true / false may also be followed by a counterexample after ";"
  const reasonOk = (p) => EMPTY.test(p[1]) || REASON.test(p[1]) || ((p[0] === 'true' || p[0] === 'false') && SEMI.test(p[1]))
  if (!parts.every(reasonOk)) return
  const word = pair.find((w) => w.toLowerCase() === parts[0][0])
  const other = pair.find((w) => w !== word)
  const full = q.a.replace(OPEN, '')
  q.s = `${full}${/[.)]$/.test(full) ? '' : '.'} ${q.s ?? ''}`.trim()
  q.a = word
  q.d = [other]
  TWO.converted++
}
