// Grade 9 3.5 Chapter Review (mineru G9 Chapter 3): the review repeats question types of 3.1 to 3.4, so every review exercise is made of parts of those exercises
//   (same questions, lessons and practice), numbered as in the review:
//   3 compare, 4 a number between, 5 addition/subtraction on a number line, 6 decimals, 9 multiply, 10 divide, 11 mixed numbers.
//   Left out: 1 and 2 (true/false, which numbers are rational), 7 and 8 (add/subtract fractions: 3.3 has only word problems).
// Imported by: quiz.tsx, check35.ts. Shape: exercise.ts.
import type { Exercise, Question } from './exercise'
import { EX_RATIONAL31 } from './rational31-data'
import { EX_INT32 } from './int32-data'
import { EX_FRAC34 } from './frac34-data'

const ex = (list: Exercise[], no: number) => list.find((e) => e.no === no)!
const part = (list: Exercise[], no: number, p: string) => ex(list, no).questions.find((q) => q.part === p)!

// one review exercise: the chosen parts [exercise no, part] of one list, lettered a, b, c ...
function review(list: Exercise[], no: number, prompt: string, picks: [number, string][]): Exercise {
  const questions: Question[] = picks.map(([n, p], i): Question => ({ ...part(list, n, p), part: String.fromCharCode(97 + i) }))
  return { ...ex(list, picks[0][0]), no, sec: '3.5', prompt, questions }
}
const of = (n: number, s: string): [number, string][] => s.split('').map((p): [number, string] => [n, p])

export const EX_REVIEW35: Exercise[] = [
  review(EX_RATIONAL31, 3, 'Choose < or >.', of(6, 'abcdefgh')),
  review(EX_RATIONAL31, 4, 'Choose the number between.', [[8, 'f'], [7, 'f'], [7, 'd'], [7, 'c']]),
  review(EX_INT32, 5, 'Choose the number line.', [[3, 'a'], [3, 'b'], [3, 'd'], [5, 'b'], [5, 'c']]),
  review(EX_INT32, 6, 'Choose the answer.', of(6, 'abcdefghij')),
  review(EX_FRAC34, 9, 'Choose the product.', of(2, 'abcdef')),
  review(EX_FRAC34, 10, 'Choose the quotient.', of(5, 'abcdef')),
  review(EX_FRAC34, 11, 'Choose the answer.', of(6, 'abcdef')),
]
