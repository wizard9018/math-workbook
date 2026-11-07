// Grade 9 5.5 Chapter Review (mineru G9 Chapter 5): exercises 1 (degree), 2 (simplify), 4 (add), 6 (subtract), 7 (product), 8 (quotient), 9 (combined operations); 3 and 5 (algebra tiles) are left out.
// Every question uses the lesson of the section it comes from (5.1 to 5.4); the 10 similar questions of a question are drawn from the Gemini banks of that section (variants*.json), the answers are computed here.
// Imported by: quiz.tsx. Shape: exercise.ts.
import type { Exercise, Practice, Question } from './exercise'
import type { Lesson } from './lessons'
import V53 from './variants53.json'
import V54 from './variants54.json'
import { build as addSub } from './bracket-data'
import { degreeItem, degreeReview, degreeTerm } from './degree-data'
import { choicesCombo, lessonCombo, parseCombo, texCombo } from './combo-data'
import { choicesDiv, lessonDiv, parseDiv, texDiv } from './div-data'
import { choicesDist, lessonDist, parseDist, texDist } from './mult-data'
import { build as simplify } from './simplify-data'
import { EX51H, EX53H, EX54H } from './hard5-data'
import { EX52H } from './bracket-data'

// a stable shuffle, so a question keeps the same bank on every page load
const shuffled = <T,>(a: T[], seed: number): T[] => {
  let s = seed
  const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32)
  return [...a].sort(() => r() - 0.5)
}
const pool = (v: unknown) => Object.values(v as Record<string, unknown[]>).flat()

// a review exercise whose questions are parsed from text; `pl` = the Gemini expressions of the section
function parsed<T>(no: number, prompt: string, book: [string, string][], pl: unknown[], parse: (s: unknown) => T | null, texOf: (x: T) => string, choicesOf: (x: T, idx: number) => [string[], number], lessonOf: (x: T, key: string, idx: number) => Lesson): Exercise {
  const all = pl.map(parse).filter((x): x is T => !!x)
  const questions: Question[] = book.map(([part, src], idx): Question => {
    const b = parse(src)!
    const seen = new Set([texOf(b)])
    const bank = shuffled(all, no * 100 + idx).filter((x) => !seen.has(texOf(x)) && !!seen.add(texOf(x))).slice(0, 10)
    const make = (x: T, key: string, k: number): Practice => {
      const [choices, correct] = choicesOf(x, idx + k)
      return { tex: texOf(x), choices, correct, why: '', lesson: () => lessonOf(x, key, idx + k) }
    }
    return { part, ...make(b, part, 0), practice: bank.map((x, k) => make(x, `${part}${k + 1}`, k + 1)) }
  })
  return { no, sec: '5.5', prompt, mathChoices: true, questions }
}

const SIMPLIFY: [string, string][] = [
  ['a', '2x^2 - y^2 + 3x^2 + 2y^2'],
  ['b', '4x^2 - 3y + 2x - y'],
  ['c', '-2xy^2 - x^2y + xy^2 - x^2y'],
  ['d', '-2xy - 3yx + 4xy + 5yx'],
]
const ADD: [string, string][] = [
  ['a', '(3-2x^2+4x)+(-2x+x^2-5)'],
  ['b', '(2xy+x-y)+(-xy-2x-y)'],
  ['c', '(-5+3x^2+7x)+(-x^2+4-3x)'],
  ['d', '(-4xy-x+3y)+(-xy+7y-3x)'],
]
const SUB: [string, string][] = [
  ['a', '(-3x+2x^2+4)-(-2-x^2+4x)'],
  ['b', '(2xy-x+3y)-(y-x+xy)'],
  ['c', '(4x-5x^2-1)-(5-3x^2-2x)'],
  ['d', '(3x-2x^2+4)-(-2x^2+3x-4)'],
]
const PRODUCT: [string, string][] = [
  ['a', '3(x^2-2x+3)'],
  ['b', '-3x(-x^2+2x-3)'],
  ['c', '3x^2(2x^2-x+1)'],
  ['d', '-2xy(-x^2+2xy+y^2)'],
  ['e', '2xy^2(x^2-xy+y^2)'],
  ['f', '-2xyz(x-y+z)'],
  ['g', '3xy(2x-3y+2z)'],
  ['h', '-2xyz(-x^2+y^2-z^2)'],
  ['i', '-2xy(3x-y+z)'],
  ['j', '3xyz(-2x^2-3y^2+4z^2)'],
  ['k', '2x^2y(-x+2y-3z)'],
  ['l', '-3y^2z(-2x+y-3z)'],
]
const QUOTIENT: [string, string][] = [
  ['a', '(3x^2-9x+6)/3'],
  ['b', '(-4x^2+8x+6)/-2'],
  ['c', '(10x^2-5xy)/5x'],
  ['d', '(-7x^2+21xy)/-7x'],
  ['e', '(-4x^2+8xy-12x)/2x'],
  ['f', '(a^2bc-ab^2c+abc^2)/-abc'],
  ['g', '(-a^2b^2c+ab^2c^2-a^2b^2c^2)/ab^2c'],
  ['h', '(-a^2bc^2-a^2bc+abc^2)/-abc'],
]
const COMBO: [string, string][] = [
  ['a', '3x(2x-3)-(6x^2+4x-8)/2'],
  ['b', '(-8x^2(2-x))/4x+3x(2-x)'],
  ['c', '-2x(3x-2y+1)-(8x-4x^2+2xy)/2'],
  ['d', '(-6x^2(4-3x))/2x-2x(3-2x)'],
  ['e', '(-3x^2(2-5x))/-x+3x(4x-3)'],
  ['f', '(-4x^2(3x-3y+2))/2x-(6x^2(3-2x+y))/-x'],
]

const T = degreeTerm
export const EX55: Exercise[] = [
  degreeReview([
    degreeItem('a', [T('5^3', 0)]),
    degreeItem('b', [T('2^2y^2', 2)]),
    degreeItem('c', [T('3x^3', 3), T('2x^2y^2', 4)], ['+']),
    degreeItem('d', [T('\\sqrt{3}x^3', 3), T('3x^2', 2), T('5', 0)], ['-', '+']),
  ]),
  { ...simplify(8, SIMPLIFY, 8, '5.5'), no: 2 },
  addSub(1, ADD, '5.5', 4),
  addSub(4, SUB, '5.5', 6),
  parsed(7, 'Find the product.', PRODUCT, pool(V53['3' as keyof typeof V53]), parseDist, texDist, choicesDist, (d, key, idx) => lessonDist(d, key, 7, idx)),
  parsed(8, 'Find the quotient.', QUOTIENT, pool(V54['3' as keyof typeof V54]), parseDiv, texDiv, choicesDiv, (d, key, idx) => lessonDiv(d, key, 8, idx, undefined, '5.5')),
  parsed(9, 'Perform the combined operations.', COMBO, pool(V54['10' as keyof typeof V54]), parseCombo, texCombo, choicesCombo, (c, key, idx) => lessonCombo(c, key, idx)),
]

// challenge versions: the challenge exercises of 5.1 to 5.4 under the review (12 simplify, 14 add, 16 subtract, 17 product, 18 quotient, 19 combined operations); degree has none
const chal = (list: Exercise[], from: number, no: number, prompt: string): Exercise => {
  const ex = list.find((e) => e.no === from)!
  return { ...ex, no, sec: '5.5', prompt, questions: ex.questions.map((q): Question => ({ ...q })) }
}
export const EX55H: Exercise[] = [
  chal(EX51H, 18, 12, 'Simplify.'),
  chal(EX52H, 11, 14, 'Add.'),
  chal(EX52H, 14, 16, 'Subtract.'),
  chal(EX53H, 12, 17, 'Find the product.'),
  chal(EX54H, 13, 18, 'Find the quotient.'),
  chal(EX54H, 14, 19, 'Perform the combined operations.'),
]
