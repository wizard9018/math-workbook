// Grade 9 6.2 exercises 5 to 12 (bank/G9-ch6/s2/items.json), one exercise here (5a-h): word problems solved with an equation (brackets, decimals, fractions).
// Lesson: what x stands for, the equation, then the solving steps (eq62-data.ts, or eq-data.ts when there is nothing to clear), then the answer of the question.
// The 10 similar questions of every problem are made here from small number tables (not by Gemini): the same story, other numbers; the solutions are computed.
// Imported by: quiz.tsx, check62.ts. Shape: exercise.ts.
import type { Exercise, Practice, Question } from './exercise'
import type { Lesson, Step } from './lessons'
import { lessonEq, lineIds, parseEq, texEq } from './eq-data'
import { lesson62, parseEq62, texEq62 } from './eq62-data'
import { pick } from './simplify-data'
import { cross, D, money, range, shuffled, story, xDef } from './word61-data'
import type { Word } from './word61-data'

const nDef = (s: string) => `n = \\text{${s}}`
const t = (a: number, b: number) => `${a} \\text{ and } ${b}`

const STORIES: ((p: number[]) => Word)[] = [
  // a (5): a child is c and the dad is d: how many years until the dad is twice as old
  ([c, x]) => {
    const d = 2 * c + x
    return { key: `${c},${x}`, text: `Ellie is ${c} and her dad is ${d}. How long will it be before her dad is twice as old as she is?`, def: xDef('the number of years from now'), defWrong: [xDef("Ellie's age"), xDef("her dad's age"), xDef('the difference between the ages')], eq: `${d}+x=2(${c}+x)`, eqWrong: [`${d}=2(${c}+x)`, `${d}+x=${c}+x`, `${d}-x=2(${c}-x)`], answer: `${x} \\text{ years}`, answerWrong: [`${d - c} \\text{ years}`, `${2 * c} \\text{ years}`, `${x + c} \\text{ years}`] }
  },
  // b (6): one number is k greater than another: twice the larger minus the smaller is S
  ([k, x]) => {
    const S = x + 2 * k
    return { key: `${k},${x}`, text: `One number is ${k} greater than another number. When the smaller number is subtracted from twice the larger number, the difference is ${S}. Find each number.`, def: xDef('the smaller number'), defWrong: [xDef('the larger number'), xDef('the difference of the numbers'), xDef(`the larger number minus ${k}`)], eq: `2(x+${k})-x=${S}`, eqWrong: [`2x+${k}-x=${S}`, `2(x-${k})-x=${S}`, `2(x+${k})+x=${S}`], answer: t(x, x + k), answerWrong: [t(x + k, x + 2 * k), t(x - k, x), t(x, x + 2 * k)] }
  },
  // c (7): two numbers differ by d: three less than four times the smaller minus three times the greater is S
  ([d, S]) => {
    const x = S + 3 * d + 3
    return { key: `${d},${S}`, text: `Two numbers differ by ${d}. Three less than four times the smaller number minus three times the greater number is ${S}. Find the numbers.`, def: xDef('the smaller number'), defWrong: [xDef('the greater number'), xDef('the difference of the numbers'), xDef(`the smaller number minus ${d}`)], eq: `4x-3(x+${d})-3=${S}`, eqWrong: [`4x-3(x+${d})+3=${S}`, `4x-3x+${d}-3=${S}`, `4x-3(x-${d})-3=${S}`], answer: t(x, x + d), answerWrong: [t(x - d, x), t(x + d, x + 2 * d), t(x, x + d + 1)] }
  },
  // d (8): a triangle: the second angle k times the first, the third d degrees more than the first
  ([k, d]) => {
    const x = (180 - d) / (k + 2)
    const a = (p: number, q: number, r: number) => `${p}^\\circ,\\; ${q}^\\circ,\\; ${r}^\\circ`
    return { key: `${k},${d}`, text: `The second angle of a triangle is ${k === 2 ? 'twice' : `${k} times`} the measure of the first angle. The third angle is ${d}&deg; more than the measure of the first angle. Find the three angles.`, def: xDef('the first angle'), defWrong: [xDef('the second angle'), xDef('the third angle'), xDef('the sum of the three angles')], eq: `x+${k}x+x+${d}=180`, eqWrong: [`x+${k}x+${d}=180`, `x+${k}x+x+${d}=90`, `x+${k}x+x-${d}=180`], answer: a(x, k * x, x + d), answerWrong: [a(x, k * x, x - d), a(x, x + k, x + d), a(x + d, k * x, x)] }
  },
  // e (9): p% of a number added to c is k times the number
  ([p, k, x]) => {
    const c = k * x - (p * x) / 100
    return { key: `${p},${k},${x}`, text: `When ${p}% of a number is added to ${D(c)}, the result is ${k === 2 ? 'twice' : `${k} times`} the number. Find the number.`, def: xDef('the number'), defWrong: [xDef(`${p}% of the number`), xDef('the result'), xDef(`the number plus ${D(c)}`)], eq: `${D(p / 100)}x+${D(c)}=${k}x`, eqWrong: [`${p}x+${D(c)}=${k}x`, `${D(p / 100)}x=${D(c)}+${k}x`, `${D(p / 100)}x+${D(c)}=${k}`], answer: `${x}`, answerWrong: [`${x + 1}`, `${D(c)}`, `${k * x}`] }
  },
  // f (10): a/b of a number subtracted from A is R
  ([a, b, x, A]) => {
    const R = A - (a * x) / b
    return { key: `${a},${b},${x},${A}`, text: `When $\\frac{${a}}{${b}}$ of a number is subtracted from ${A}, the result is ${R}. Find the number.`, def: xDef('the number'), defWrong: [xDef(`$\\frac{${a}}{${b}}$ of the number`), xDef('the result'), xDef(`${A} minus the number`)], eq: `${A}-${a}/${b}x=${R}`, eqWrong: [`${a}/${b}x-${A}=${R}`, `${A}-${a}/${b}x=${R}x`, `${A}-${a}/${b}=${R}`], answer: `${x}`, answerWrong: [`${x + b}`, `${(a * x) / b}`, `${A - R}`] }
  },
  // g (11): the quotient of a number and d added to twice the number is c less than the number
  ([d, m]) => {
    const c = m * (d + 1)
    const x = -m * d
    return { key: `${d},${m}`, text: `If the quotient of a number and ${d} is added to twice the number, the result is ${c} less than the number. Find the number.`, def: xDef('the number'), defWrong: [xDef(`the quotient of the number and ${d}`), xDef('the result'), xDef(`the number minus ${c}`)], eq: `x/${d}+2x=x-${c}`, eqWrong: [`x/${d}+2x=x+${c}`, `${d}/x+2x=x-${c}`, `x/${d}+2x=${c}-x`], answer: `${x}`, answerWrong: [`${-x}`, `${x + 1}`, `${-m}`] }
  },
  // h (12): N coins, nickels and dimes, total T: how many nickels (n)
  ([N, n]) => {
    const T = 0.1 * N - 0.05 * n
    return { key: `${N},${n}`, text: `Jill has ${N} coins, consisting of nickels and dimes totalling &#36;${money(T)}. How many nickels does Jill have? Hint: Let the number of nickels be n, and the number of dimes be ${N} &ndash; n.`, def: nDef('the number of nickels'), defWrong: [nDef('the number of dimes'), nDef('the value of the nickels'), nDef('the number of coins')], eq: `0.05n+0.1(${N}-n)=${D(T)}`, eqWrong: [`0.05n+0.1n=${D(T)}`, `0.1n+0.05(${N}-n)=${D(T)}`, `0.05n+0.1(${N}+n)=${D(T)}`], answer: `${n}`, answerWrong: [`${N - n}`, `${n + 1}`, `${N}`] }
  },
]
const BOOKP: number[][] = [[6, 25], [14, 69], [5, 11], [2, 12], [25, 2, 2], [3, 4, 12, 16], [4, 1], [20, 12]]
const FRACS = [[3, 4], [2, 3], [1, 2], [3, 5], [2, 5], [5, 6]]
const CAND: number[][][] = [
  cross(range(4, 12), range(5, 30)), // c, x
  cross(range(3, 20), range(10, 80)), // k, x
  cross(range(2, 9), range(5, 30)), // d, S
  cross(range(2, 5), range(10, 60, 5)).filter(([k, d]) => (180 - d) % (k + 2) === 0), // k, d
  cross([10, 20, 25, 30, 40, 50, 60, 75], [2, 3], range(2, 40)), // p, k, x
  FRACS.flatMap(([a, b]) => cross(range(1, 6), range(12, 40, 2)).filter(([m, A]) => A - a * m > 0).map(([m, A]) => [a, b, b * m, A])), // a, b, x, A
  cross(range(3, 9), range(1, 5)), // d, m
  cross(range(10, 30), range(3, 20)).filter(([N, n]) => n < N - 2), // N, n
]

// the equation as a Lesson: with brackets / fractions / decimals to clear (6.2) or plain (6.1)
const solveLesson = (src: string, key: string, idx: number): Lesson => {
  const e = parseEq62(src)
  return e ? lesson62(e, key, 5, idx) : lessonEq(parseEq(src, true)!, key, 5, idx)
}
const eqTex = (src: string) => {
  const e = parseEq62(src)
  if (e) return texEq62(e)
  const p = parseEq(src, true)
  return p ? texEq(p) : src
}

function lessonWord(w: Word, key: string, idx: number): Lesson {
  const solve = solveLesson(w.eq, key, idx + 2)
  const [defs, dc] = pick(w.def, w.defWrong, idx)
  const [eqs, ec] = pick(eqTex(w.eq), w.eqWrong.map(eqTex), idx + 1)
  const lastIds = lineIds(solve.start, solve.steps) // the tokens left on the line after the solving steps
  const [ans, ac] = pick(w.answer, w.answerWrong, idx + 3)
  const q1 = 'Let $x$ stand for the unknown. What should $x$ be?'
  const q2 = 'Which equation matches the story?'
  const q3 = 'Use the solution to answer the question. What is the answer?'
  const steps: Step[] = [
    { focus: ['d0'], result: { id: 'd1', tex: w.def }, arrows: [], say: '', calcPrompt: q1, calc: { q: q1, options: defs, correct: dc, hints: defs.map((_, j) => (j === dc ? '' : 'Let the letter be the thing the question asks for, or the thing the others are compared with.')), spell: 'let' } },
    { focus: ['d1'], result: solve.start[0], results: solve.start, arrows: [], say: '', calcPrompt: q2, calc: { q: q2, options: eqs, correct: ec, hints: eqs.map((_, j) => (j === ec ? '' : 'Write every part of the story with the letter, then join the parts with an equals sign.')), spell: 'equation' } },
    ...solve.steps,
    { focus: lastIds, result: { id: 'fin', tex: w.answer }, arrows: [], say: '', calcPrompt: q3, calc: { q: q3, options: ans, correct: ac, hints: ans.map((_, j) => (j === ac ? '' : `$${solve.answer}$. Check what the question asks for.`)), spell: 'answer' } },
  ]
  return { key: `word62-${key}`, label: key, source: `Grade 9, 6.2 exercise 5${key}`, title: 'Word problem', prompt: 'Answer:', figure: story(w.text), answer: w.answer, start: [{ id: 'd0', tex: '\\boxed{?}' }], steps, review: { heading: 'Word problems', rows: [] } }
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
    const bank = shuffled(CAND[i], 6200 + i).map((p) => make1(p)).filter((w) => !seen.has(w.key) && !!seen.add(w.key)).slice(0, 10)
    return { part, ...make(book, part, 0), practice: bank.map((w, k) => make(w, `${part}${k + 1}`, k + 1)) }
  })
  return { no: 5, sec: '6.2', prompt: 'Solve the problem.', mathChoices: true, questions }
}

export const EX_WORD62 = [build()]
