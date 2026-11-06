// Grade 9 1.8 Chapter Review (mineru G9 Chapter 1): the review repeats question types of 1.1 to 1.7, so every review exercise is made of parts of those exercises
//   (same questions, lessons and practice), numbered as in the review:
//   2 irrational, 3 simplify roots, 4-5 word problems, 6 between integers, 7 one decimal place, 10 order powers, 11 zero exponent, 12 compare powers,
//   13 order of operations, 15 exponent rules, 16 simplify and evaluate, 17 power of a power, 18 evaluate.
//   Left out: 1 (always / sometimes / never), 8 (figures), 9 (missing exponents), 14 (insert parentheses): no matching exercise built yet.
// Imported by: quiz.tsx, check18.ts. Shape: exercise.ts.
import type { Exercise, Question } from './exercise'
import { EX_REAL11 } from './real11-data'
import { EX_SQRT12 } from './sqrt12-data'
import { EX_SQRT13 } from './sqrt13-data'
import { EX_EXP14 } from './exp14-data'
import { EX_ORDER15 } from './order15-data'
import { EX_EXP16, EX_EXP17 } from './exp67-data'

const ex = (list: Exercise[], no: number) => list.find((e) => e.no === no)!
const part = (list: Exercise[], no: number, p: string) => ex(list, no).questions.find((q) => q.part === p)!

// one review exercise: the chosen parts [exercise no, part] of one list, lettered a, b, c ...
function review(list: Exercise[], no: number, prompt: string, picks: [number, string][]): Exercise {
  const questions: Question[] = picks.map(([n, p], i): Question => ({ ...part(list, n, p), part: String.fromCharCode(97 + i) }))
  return { ...ex(list, picks[0][0]), no, sec: '1.8', prompt, questions }
}
const of = (n: number, s: string): [number, string][] => s.split('').map((p): [number, string] => [n, p])

export const EX_REVIEW18: Exercise[] = [
  review(EX_REAL11, 2, 'Tick the irrational numbers.', of(3, 'e')),
  review(EX_SQRT12, 3, 'Choose the answer.', of(3, 'abcf')),
  review(EX_SQRT12, 4, 'Choose the answer.', of(6, 'd')),
  review(EX_SQRT12, 5, 'Choose the answer.', of(6, 'f')),
  review(EX_SQRT13, 6, 'Choose the integers.', of(2, 'ac')),
  review(EX_SQRT13, 7, 'Choose the square root.', of(4, 'ad')),
  review(EX_EXP14, 10, 'Choose the order.', of(4, 'ab')),
  review(EX_EXP14, 11, 'Choose the answer.', of(9, 'abcdef')),
  review(EX_EXP14, 12, 'Choose <, > or =.', of(11, 'abcdef')),
  review(EX_ORDER15, 13, 'Choose the answer.', of(3, 'abcdefghij')),
  review(EX_EXP16, 15, 'Choose the answer.', [[5, 'a'], [5, 'c'], [6, 'a'], [6, 'b'], [7, 'a'], [7, 'b'], [7, 'c'], [7, 'd']]),
  review(EX_EXP16, 16, 'Simplify, then evaluate.', of(8, 'abcdef')),
  review(EX_EXP17, 17, 'Write in exponential form.', of(3, 'abcd')),
  review(EX_EXP17, 18, 'Evaluate.', of(8, 'abcde')),
]
