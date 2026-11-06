// Grade 9 6.1 exercise 9 (bank/G9-ch6/s1/items.json): translate a verbal sentence into an equation.
// Lesson: the sentence cut into phrases; every phrase is turned into its math, one question each; the equation is the pieces joined.
// The 10 similar sentences of every question are written by Gemini as pieces (phrase + math) (gen-variants-61t.py, variants61t.json); the wrong choices are computed here.
// Imported by: quiz.tsx. Shape: exercise.ts.
import type { Exercise, Practice, Question } from './exercise'
import type { Lesson, Step, Tok } from './lessons'
import V61T from './variants61t.json'
import { pick, topTen } from './simplify-data'

type Piece = [string, string] // [phrase, math in plain text: x+3, 2x-5, =, 12]
type Sentence = Piece[]

// plain math -> TeX: x/3 -> \frac{x}{3}, 2/3x -> \frac{2}{3}x, x+3 -> x + 3
const termTex = (t: string) => {
  const m = t.match(/^(\d+)\/(\d+)(.*)$/)
  if (m) return `\\frac{${m[1]}}{${m[2]}}${m[3]}`
  const d = t.match(/^(.*)\/(.*)$/)
  return d ? `\\frac{${d[1]}}{${d[2]}}` : t
}
const mathTex = (s: string) =>
  s
    .split('=')
    .map((side) => (side.match(/[+-]?[^+-]+/g) ?? []).map((t, i) => (i === 0 ? termTex(t) : ` ${t[0] === '-' ? '-' : '+'} ${termTex(t.replace(/^[+-]/, ''))}`)).join(''))
    .join(' = ')
const equation = (s: Sentence) => s.map((p) => p[1]).join('')
const texSentence = (s: Sentence) => `\\text{${s.map((p) => p[0]).join(' ')}.}`

// wrong versions of one piece of math: the sign changed, the terms swapped, the operation confused
function wrongs(m: string): string[] {
  const out: string[] = []
  const first = m.search(/[+-]/)
  if (first > 0) out.push(m.slice(0, first) + (m[first] === '+' ? '-' : '+') + m.slice(first + 1))
  const two = m.match(/^([^+-]+)-([^+-]+)$/)
  if (two) out.push(`${two[2]}-${two[1]}`)
  const mul = m.match(/^(\d+)x$/)
  if (mul) out.push(`x+${mul[1]}`, `x/${mul[1]}`)
  const dv = m.match(/^x\/(\d+)$/)
  if (dv) out.push(`${dv[1]}/x`, `${dv[1]}x`)
  const tw = m.match(/^(\d+)x([+-])(\d+)$/)
  if (tw) out.push(`${tw[1]}x${tw[2]}${tw[3]}x`, `x${tw[2]}${tw[3]}`)
  if (/^\d+$/.test(m)) out.push(String(Number(m) + 1), String(Math.max(Number(m) - 1, 1)), String(Number(m) * 2))
  if (m === '=') out.push('\\neq', '+', '-')
  return [...new Set(out)].filter((x) => x && x !== m)
}
const asTex = (s: string) => (s.startsWith('\\') || s === '+' || s === '-' ? s : mathTex(s))

function lessonTranslate(s: Sentence, key: string, idx: number): Lesson {
  const start: Tok[] = s.map((p, i) => ({ id: `s${i}`, tex: `\\text{${p[0]}}` }))
  const steps: Step[] = s.map((p, i) => {
    const w = wrongs(p[1]).slice(0, 3)
    while (w.length < 3) w.push(`${p[1]}+${w.length + 1}`)
    const [options, correct] = pick(asTex(p[1]), w.map(asTex), idx + i)
    const q1 = `What does "${p[0]}" mean in math?`
    const hint = p[1] === '=' ? '"is" and "the result is" mean equals.' : /x/.test(p[1]) ? 'A number is $x$; "sum" is $+$, "decreased by" is $-$, "twice" is $2x$, "quotient" is a fraction.' : 'Write the number in digits.'
    return { focus: [`s${i}`], result: { id: `m${i}`, tex: mathTex(p[1]) }, arrows: [], say: '', calcPrompt: q1, calc: { q: q1, options, correct, hints: options.map((_, j) => (j === correct ? '' : hint)), spell: hint } }
  })
  return { key: `trans9-${key}`, label: key, source: `Grade 9, 6.1 exercise 9${key}`, title: 'Translate', prompt: 'Equation:', answer: mathTex(equation(s)), start, steps, review: { heading: 'Words to math', rows: [] } }
}

function choices(s: Sentence, idx: number): [string[], number] {
  const eq = equation(s)
  const alt: string[] = []
  s.forEach((p, i) => {
    if (p[1] === '=') return
    const w = wrongs(p[1])[0]
    if (w) alt.push(mathTex(s.map((q, j) => (j === i ? w : q[1])).join('')))
  })
  return pick(mathTex(eq), [...alt, mathTex(eq.split('=').reverse().join('='))], idx)
}

const BOOK: [string, Sentence][] = [
  ['a', [['The sum of a number and three', 'x+3'], ['is', '='], ['twelve', '12']]],
  ['b', [['If twice a number is decreased by five', '2x-5'], ['the result is', '='], ['fifteen', '15']]],
  ['c', [['The product of a number and five', '5x'], ['is', '='], ['twice the number plus eight', '2x+8']]],
  ['d', [['The quotient of a number and three added to twice the number', 'x/3+2x'], ['is', '='], ['ten', '10']]],
  ['e', [['The quotient of a number and five', 'x/5'], ['is', '='], ['seven', '7']]],
  ['f', [['The sum of a number and three times the number', 'x+3x'], ['is', '='], ['twelve', '12']]],
]

// Gemini's sentences: pieces of plain text whose math joins into one equation in x
const valid = (v: unknown): Sentence | null => {
  if (!Array.isArray(v) || v.length < 3 || v.length > 6) return null
  if (!v.every((p) => Array.isArray(p) && p.length === 2 && typeof p[0] === 'string' && typeof p[1] === 'string' && p[0].length > 0 && p[0].length < 90 && /^[0-9x+\-/=]+$/.test(p[1]))) return null
  const s = v as Sentence
  const eq = equation(s)
  return eq.split('=').length === 2 && s.filter((p) => p[1] === '=').length === 1 && /x/.test(eq) ? s : null
}

function build(): Exercise {
  const questions: Question[] = BOOK.map(([part, book], idx): Question => {
    const bank = topTen(((V61T as Record<string, unknown[]>)[part] ?? []).map(valid).filter((x): x is Sentence => !!x), [], texSentence, book)
    const make = (s: Sentence, key: string, k: number): Practice => {
      const [ch, correct] = choices(s, idx + k)
      return { tex: texSentence(s), choices: ch, correct, why: '', lesson: () => lessonTranslate(s, key, idx + k) }
    }
    return { part, ...make(book, part, 0), practice: bank.map((s, k) => make(s, `${part}${k + 1}`, k + 1)) }
  })
  return { no: 9, sec: '6.1', prompt: 'Translate the verbal sentence into an equation.', mathChoices: true, questions }
}

export const EX_TRANS61 = [build()]
