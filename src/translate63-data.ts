// Grade 9 6.3 exercise 2 (bank/G9-ch6/s3/items.json): translate a sentence into an inequality.
// Lesson: the sentence cut into phrases; every phrase is turned into its math, one question each (the sign phrase: at least / at most / more than / less than); the inequality is the pieces joined.
// The 10 similar sentences of every question are written by Gemini as pieces (phrase + math) (gen-variants-63t.py, variants63t.json); the wrong choices are computed here.
// Imported by: quiz.tsx, check63.ts. Shape: exercise.ts.
import type { Exercise, Practice, Question } from './exercise'
import type { Lesson, Step, Tok } from './lessons'
import V63T from './variants63t.json'
import { pick, topTen } from './simplify-data'

type Piece = [string, string] // [phrase, math in plain text: x, 3, >=, 1.6]
type Sentence = Piece[]

const SIGNS = ['>=', '<=', '>', '<']
const SIGN_TEX: Record<string, string> = { '>=': '\\ge', '<=': '\\le', '>': '>', '<': '<' }
const SIGN_HINT = '$\\ge \\text{ at least} \\quad \\le \\text{ at most} \\quad > \\text{ more than} \\quad < \\text{ less than}$'
const pieceTex = (m: string) => SIGN_TEX[m] ?? m
const inequality = (s: Sentence) => s.map((p) => pieceTex(p[1])).join(' ')
const text = (t: string) => t.replace(/[$%&#_]/g, (c) => `\\${c}`)
const texSentence = (s: Sentence) => `\\text{${text(s.map((p) => p[0]).join(' '))}.}`

// wrong versions of one piece of math: the other signs, other numbers, the letter changed
function wrongs(m: string): string[] {
  if (SIGNS.includes(m)) return SIGNS.filter((x) => x !== m).map(pieceTex)
  if (/^[a-z]$/.test(m)) return [`2${m}`, `${m}+1`, `${m}-1`]
  const n = Number(m)
  return [String(+(n + 1).toFixed(2)), String(+(n - 1).toFixed(2)), String(+(n * 2).toFixed(2)), String(-n)].filter((x) => x !== m)
}

function lessonTranslate(s: Sentence, key: string, idx: number): Lesson {
  const start: Tok[] = s.map((p, i) => ({ id: `s${i}`, tex: `\\text{${text(p[0])}}` }))
  // the number is not asked: it is written into the line together with the last asked piece
  const asked = s.map((_, i) => i).filter((i) => SIGNS.includes(s[i][1]) || /^[a-z]$/.test(s[i][1]))
  const steps: Step[] = asked.map((i, k) => {
    const p = s[i]
    const w = wrongs(p[1]).slice(0, 3)
    while (w.length < 3) w.push(`${p[1]}${w.length}`)
    const right = pieceTex(p[1])
    const [options, correct] = pick(right, w, idx + i)
    const q1 = `What does "${text(p[0])}" mean in math?`
    const hint = SIGNS.includes(p[1]) ? SIGN_HINT : /^[a-z]$/.test(p[1]) ? 'The letter stands for the quantity in the sentence.' : 'Write the number in digits.'
    const res: Tok = { id: `m${i}`, tex: right }
    const rest = k === asked.length - 1 ? s.map((_, j) => j).filter((j) => !asked.includes(j)) : []
    return { focus: [`s${i}`, ...rest.map((j) => `s${j}`)], result: res, ...(rest.length ? { results: [res, ...rest.map((j) => ({ id: `m${j}`, tex: pieceTex(s[j][1]) }))] } : {}), arrows: [], say: '', calcPrompt: q1, calc: { q: q1, options, correct, hints: options.map((_, j) => (j === correct ? '' : hint)), spell: hint } }
  })
  return { key: `trans63-${key}`, label: key, source: `Grade 9, 6.3 exercise 2${key}`, title: 'Translate', prompt: 'Inequality:', answer: inequality(s), start, steps, review: { heading: 'Words to math', rows: [] } }
}

// the choices of the question itself: the other signs, the two sides swapped
function choices(s: Sentence, idx: number): [string[], number] {
  const right = inequality(s)
  const at = s.findIndex((p) => SIGNS.includes(p[1]))
  const alt = SIGNS.filter((x) => x !== s[at][1]).map((x) => inequality(s.map((p, j) => (j === at ? [p[0], x] : p))))
  const swapped = inequality([...s.slice(at + 1), s[at], ...s.slice(0, at)])
  return pick(right, [...alt, swapped], idx)
}

const BOOK: [string, Sentence][] = [
  ['a', [['A number', 'x'], ['is at least', '>='], ['three', '3']]],
  ['b', [['A number', 'x'], ['is greater than or equal to', '>='], ['negative four', '-4']]],
  ['c', [['The book weighs', 'w'], ['less than', '<'], ['one kilogram', '1']]],
  ['d', [['The number of people at the concert', 'n'], ['was at least', '>='], ['18000', '18000']]],
  ['e', [['The cost of gas', 'c'], ['is less than', '<'], ['95 cents per litre', '95']]],
  ['f', [['The temperature', 't'], ['will top', '>'], ['25 degrees Celsius', '25']]],
  ['g', [["The baby's body temperature", 't'], ['will not exceed', '<='], ['100 degrees Celsius', '100']]],
  ['h', [['The cost', 'c'], ['is at most', '<='], ['$20.00', '20']]],
  ['i', [['You gain', 'w'], ['not more than', '<='], ['two kilograms', '2']]],
  ['j', [['Your height', 'h'], ['must be at least', '>='], ['1.6 meters', '1.6']]],
]

// Gemini's sentences: three pieces: the letter, the sign, the number
const valid = (v: unknown): Sentence | null => {
  if (!Array.isArray(v) || v.length !== 3) return null
  if (!v.every((p) => Array.isArray(p) && p.length === 2 && typeof p[0] === 'string' && typeof p[1] === 'string' && p[0].length > 0 && p[0].length < 90 && /^(?:>=|<=|>|<|[a-z]|-?\d+(?:\.\d+)?)$/.test(p[1]))) return null
  const s = v as Sentence
  return /^[a-z]$/.test(s[0][1]) && SIGNS.includes(s[1][1]) && /^-?\d/.test(s[2][1]) ? s : null
}

function build(): Exercise {
  const questions: Question[] = BOOK.map(([part, book], idx): Question => {
    const bank = topTen(((V63T as Record<string, unknown[]>)[part] ?? []).map(valid).filter((x): x is Sentence => !!x), [], texSentence, book)
    const make = (s: Sentence, key: string, k: number): Practice => {
      const [ch, correct] = choices(s, idx + k)
      return { tex: texSentence(s), choices: ch, correct, why: '', lesson: () => lessonTranslate(s, key, idx + k) }
    }
    return { part, ...make(book, part, 0), practice: bank.map((s, k) => make(s, `${part}${k + 1}`, k + 1)) }
  })
  return { no: 2, sec: '6.3', prompt: 'Translate to an inequality.', mathChoices: true, questions }
}

export const EX_TRANS63 = [build()]
