// Grade 9 6.1 exercises 10 to 17 (bank/G9-ch6/s1/items.json), one exercise here (10a-h): word problems solved with an equation.
// Lesson: what x stands for, the equation, then the solving steps of 6.1 exercises 2-5 (eq-data.ts), then the answer of the question.
// The 10 similar questions of every problem are made here from small number tables (not by Gemini): the same story, other numbers; the solutions are computed.
// Imported by: quiz.tsx. Shape: exercise.ts.
import katex from 'katex'
import type { Exercise, Practice, Question } from './exercise'
import type { Lesson, Step } from './lessons'
import { lessonEq, lineIds, numTex, parseEq, solution, texEq } from './eq-data'
import { pick } from './simplify-data'

const kx = (s: string) => katex.renderToString(s, { throwOnError: false })
// the story as a card: $...$ parts are TeX
export const story = (sentence: string) => `<p class="px-2 py-3 text-center text-xl leading-relaxed">${sentence.split('$').map((p, i) => (i % 2 ? kx(p) : p)).join('')}</p>`
export const D = (n: number) => String(+n.toFixed(2)) // a number as a decimal without trailing zeros
export const money = (n: number) => n.toFixed(2)

export interface Word {
  key: string
  text: string // the story (HTML entities for the dollar sign)
  def: string // what x is: right, and three wrong
  defWrong: string[]
  eq: string // plain text: x+3x=36
  eqWrong: string[]
  answer: string // TeX of the answer, and three wrong
  answerWrong: string[]
}
export const xDef = (s: string) => `x = \\text{${s}}`

// ---- the 8 stories: params -> Word ----
const STORIES: ((p: number[]) => Word)[] = [
  // a: a stick of T cm broken in two pieces, one k times as long as the other: the shortest piece
  ([T, k]) => {
    const x = T / (k + 1)
    return { key: `${T},${k}`, text: `A ${T} cm long stick is broken into two pieces. One piece is ${k} times as long as the other. How long is the shortest piece?`, def: xDef('the length of the shortest piece'), defWrong: [xDef('the length of the longest piece'), xDef('the length of the whole stick'), xDef('the difference between the two pieces')], eq: `x+${k}x=${T}`, eqWrong: [`${k}x=${T}`, `x+${k}=${T}`, `x=${k}x+${T}`], answer: `${x} \\text{ cm}`, answerWrong: [`${k * x} \\text{ cm}`, `${T} \\text{ cm}`, `${x + k} \\text{ cm}`] }
  },
  // b: a triangle: second angle k times the first, third angle d degrees more than the first: the three angles
  ([k, d]) => {
    const x = (180 - d) / (k + 2)
    const t = (a: number, b: number, c: number) => `${a}^\\circ,\\; ${b}^\\circ,\\; ${c}^\\circ`
    return { key: `${k},${d}`, text: `The second angle of a triangle is ${k} times as large as the first angle. The third angle is ${d}&deg; greater than the first angle. How large are the three angles?`, def: xDef('the first angle'), defWrong: [xDef('the second angle'), xDef('the third angle'), xDef('the sum of the three angles')], eq: `x+${k}x+x+${d}=180`, eqWrong: [`x+${k}x+${d}=180`, `x+${k}x+x+${d}=90`, `x+${k}x+x-${d}=180`], answer: t(x, k * x, x + d), answerWrong: [t(x, k * x, x - d), t(x, x + k, x + d), t(x + d, k * x, x)] }
  },
  // c: the sum of the two page numbers is S: the page numbers
  ([S]) => {
    const x = (S - 1) / 2
    return { key: `${S}`, text: `A book is opened. The sum of the page numbers on the two pages is ${S}. Find the page numbers.`, def: xDef('the smaller page number'), defWrong: [xDef('the larger page number'), xDef('the sum of the page numbers'), xDef('the number of pages in the book')], eq: `x+x+1=${S}`, eqWrong: [`x+x=${S}`, `x+x+2=${S}`, `x+1=${S}`], answer: `${x} \\text{ and } ${x + 1}`, answerWrong: [`${x} \\text{ and } ${x + 2}`, `${x - 1} \\text{ and } ${x}`, `${x + 1} \\text{ and } ${x + 2}`] }
  },
  // d: double a number, add c: k times the number
  ([c, k]) => {
    const x = c / (k - 2)
    return { key: `${c},${k}`, text: `If you double a number and then add ${c} you get ${k === 5 ? 'five' : k} times the original number. What is the original number?`, def: xDef('the original number'), defWrong: [xDef('the doubled number'), xDef('the new number'), xDef(`the number plus ${c}`)], eq: `2x+${c}=${k}x`, eqWrong: [`2x+${c}=${k}`, `2x=${k}x+${c}`, `x+${c}=${k}x`], answer: `${x}`, answerWrong: [`${2 * x}`, `${x + c}`, `${k * x}`] }
  },
  // e: a taxi charges f dollars plus r cents per km: how far for T dollars
  ([f, r, d]) => {
    const T = f + (r / 100) * d
    return { key: `${f},${r},${d}`, text: `In Victoria, BC taxis charge &#36;${money(f)} plus ${r}&cent; per km for a ride. How far can you travel for &#36;${money(T)}?`, def: xDef('the distance in km'), defWrong: [xDef('the cost of the ride'), xDef('the cost of one km'), xDef('the starting charge')], eq: `${f}+${D(r / 100)}x=${D(T)}`, eqWrong: [`${f}+${r}x=${D(T)}`, `${f}x+${D(r / 100)}=${D(T)}`, `${f}+${D(r / 100)}=${D(T)}x`], answer: `${d} \\text{ km}`, answerWrong: [`${D(T - f)} \\text{ km}`, `${d + 1} \\text{ km}`, `${D(T / (r / 100))} \\text{ km}`] }
  },
  // f: the perimeter of a rectangle is P, the length is d less than k times the width: the length and the width
  ([P, k, d]) => {
    const x = (P / 2 + d) / (k + 1)
    return { key: `${P},${k},${d}`, text: `The perimeter of a rectangle is ${P} cm. The length is ${d} cm less than ${k === 3 ? 'three' : k} times the width. Determine the length and width.`, def: xDef('the width'), defWrong: [xDef('the length'), xDef('the perimeter'), xDef('the area')], eq: `x+${k}x-${d}=${P / 2}`, eqWrong: [`x+${k}x-${d}=${P}`, `${k}x-${d}=${P / 2}`, `x+${k}x+${d}=${P / 2}`], answer: `\\text{width } ${x} \\text{ cm, length } ${k * x - d} \\text{ cm}`, answerWrong: [`\\text{width } ${k * x - d} \\text{ cm, length } ${x} \\text{ cm}`, `\\text{width } ${x} \\text{ cm, length } ${k * x + d} \\text{ cm}`, `\\text{width } ${x} \\text{ cm, length } ${k * x} \\text{ cm}`] }
  },
  // g: paid T including r% tax: the cost before tax
  ([x, r]) => {
    const T = x * (1 + r / 100)
    return { key: `${x},${r}`, text: `Mel paid &#36;${money(T)}, including ${r}% tax, for a camera. How much did the camera cost before taxes?`, def: xDef('the cost before tax'), defWrong: [xDef('the tax'), xDef('the total paid'), xDef('the cost after tax')], eq: `x+${D(r / 100)}x=${D(T)}`, eqWrong: [`x-${D(r / 100)}x=${D(T)}`, `${D(r / 100)}x=${D(T)}`, `x+${r}x=${D(T)}`], answer: `\\$${money(x)}`, answerWrong: [`\\$${money(T * (r / 100))}`, `\\$${money(T - r)}`, `\\$${money(T * (1 + r / 100))}`] }
  },
  // h: three consecutive integers: the first plus m times the second, plus c less than the third, is S
  ([m, c, x]) => {
    const S = (m + 2) * x + m + 2 - c
    return { key: `${m},${c},${x}`, text: `Three consecutive integers are such that the first plus ${m === 2 ? 'twice' : m === 3 ? 'three times' : `${m} times`} the second, plus ${c === 5 ? 'five' : c} less than the third, is ${S}. What are the integers?`, def: xDef('the first integer'), defWrong: [xDef('the second integer'), xDef('the third integer'), xDef('the sum of the integers')], eq: `x+${m}x+${m}+x+2-${c}=${S}`, eqWrong: [`x+${m}x+x-${c}=${S}`, `x+${m}x+${m}+x+2+${c}=${S}`, `x+${m}x+x+2=${S}`], answer: `${x},\\; ${x + 1},\\; ${x + 2}`, answerWrong: [`${x - 1},\\; ${x},\\; ${x + 1}`, `${x},\\; ${x + 2},\\; ${x + 4}`, `${x + 1},\\; ${x + 2},\\; ${x + 3}`] }
  },
]
const BOOKP: number[][] = [[36, 3], [4, 30], [111], [36, 5], [3, 60, 27], [28, 3, 2], [75, 12], [2, 5, 7]]
export const range = (a: number, b: number, step = 1) => Array.from({ length: Math.floor((b - a) / step) + 1 }, (_, i) => a + i * step)
export const cross = (...lists: number[][]): number[][] => lists.reduce<number[][]>((acc, l) => acc.flatMap((p) => l.map((x) => [...p, x])), [[]])
const CAND: number[][][] = [
  cross(range(2, 5), range(4, 16)).map(([k, m]) => [(k + 1) * m, k]), // T, k
  cross(range(2, 5), range(10, 60, 5)).filter(([k, d]) => (180 - d) % (k + 2) === 0).map(([k, d]) => [k, d]),
  range(41, 201, 2).map((S) => [S]),
  cross(range(4, 7), range(2, 12)).map(([k, m]) => [m * (k - 2), k]), // c, k
  cross(range(2, 5), [40, 50, 60, 80], range(10, 40)).map(([f, r, d]) => [f, r, d]),
  cross([14, 20, 24, 30, 36, 40], range(2, 5), range(1, 5)).filter(([P, k, d]) => (P / 2 + d) % (k + 1) === 0).map(([P, k, d]) => [P, k, d]),
  cross(range(20, 200, 10), [5, 8, 10, 12, 15, 20]).map(([x, r]) => [x, r]),
  cross([2, 3, 4], range(1, 6), range(3, 12)).map(([m, c, x]) => [m, c, x]),
]
export const shuffled = <T,>(a: T[], seed: number): T[] => {
  let s = seed
  const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32)
  return [...a].sort(() => r() - 0.5)
}

function lessonWord(w: Word, key: string, idx: number): Lesson {
  const eq = parseEq(w.eq, true)!
  const solve = lessonEq(eq, key, 10, idx + 2)
  const [defs, dc] = pick(w.def, w.defWrong, idx)
  const [eqs, ec] = pick(texEq(eq), w.eqWrong.map((x) => { const e = parseEq(x, true); return e ? texEq(e) : x }), idx + 1)
  const lastIds = lineIds(solve.start, solve.steps) // the tokens left on the line after the solving steps
  const [ans, ac] = pick(w.answer, w.answerWrong, idx + 3)
  const q1 = 'Let $x$ stand for the unknown. What should $x$ be?'
  const q2 = 'Which equation matches the story?'
  const q3 = 'Use the solution to answer the question. What is the answer?'
  const steps: Step[] = [
    { focus: ['d0'], result: { id: 'd1', tex: w.def }, arrows: [], say: '', calcPrompt: q1, calc: { q: q1, options: defs, correct: dc, hints: defs.map((_, j) => (j === dc ? '' : 'Let $x$ be the thing the question asks for, or the thing the others are compared with.')), spell: 'let' } },
    { focus: ['d1'], result: solve.start[0], results: solve.start, arrows: [], say: '', calcPrompt: q2, calc: { q: q2, options: eqs, correct: ec, hints: eqs.map((_, j) => (j === ec ? '' : 'Write every part of the story with $x$, then join the parts with an equals sign.')), spell: 'equation' } },
    ...solve.steps,
    { focus: lastIds, result: { id: 'fin', tex: w.answer }, arrows: [], say: '', calcPrompt: q3, calc: { q: q3, options: ans, correct: ac, hints: ans.map((_, j) => (j === ac ? '' : `$x = ${numTex(solution(eq))}$. Check what the question asks for.`)), spell: 'answer' } },
  ]
  return { key: `word10-${key}`, label: key, source: `Grade 9, 6.1 exercise 10${key}`, title: 'Word problem', prompt: 'Answer:', figure: story(w.text), answer: w.answer, start: [{ id: 'd0', tex: '\\boxed{?}' }], steps, review: { heading: 'Word problems', rows: [] } }
}

function build(): Exercise {
  const questions: Question[] = STORIES.map((make1, i): Question => {
    const part = 'abcdefgh'[i]
    const book = make1(BOOKP[i])
    const make = (w: Word, key: string, k: number): Practice => {
      const [choices, correct] = pick(w.answer, w.answerWrong, i + k)
      return { figure: story(w.text), tex: w.key, choices, correct, why: '', lesson: () => lessonWord(w, key, i + k) }
    }
    const seen = new Set([book.key])
    const bank = shuffled(CAND[i], 6100 + i).map((p) => make1(p)).filter((w) => !seen.has(w.key) && !!seen.add(w.key)).slice(0, 10)
    return { part, ...make(book, part, 0), practice: bank.map((w, k) => make(w, `${part}${k + 1}`, k + 1)) }
  })
  return { no: 10, sec: '6.1', prompt: 'Solve the problem.', mathChoices: true, questions }
}

export const EX_WORD61 = [build()]
