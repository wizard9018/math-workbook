// Challenge exercises for 6.5 (optional extra practice for fast students, own progress): several steps, fractions and brackets, decimals.
// The inequalities are the challenge equations of 6.1 and 6.2 (hard6-data, hard62-data) with the "=" replaced by a sign; because the variable ends up with a positive or a negative
// number in front, some of them turn the sign round. They are given to the existing builder, where every step is computed.
// Imported by: quiz.tsx, check65h.ts. Shape: exercise.ts.
import type { Exercise } from './exercise'
import { buildIq65 } from './ineq65-data'
import { SETS6 } from './hard6-data'
import { SETS62 } from './hard62-data'

type PartSet = { book: [string, string][]; gen: Record<string, string[]> }
const SIGNS = ['<', '>', '<=', '>=']
const withSign = (eq: string, k: number) => eq.replace('=', SIGNS[k % 4])
// the parts picked from the equation sets, in order, as a, b, c, d
const fromSets = (picks: [PartSet, string][]): { book: [string, string][]; gen: Record<string, string[]> } => {
  const book: [string, string][] = []
  const gen: Record<string, string[]> = {}
  picks.forEach(([set, part], i) => {
    const eqs = [set.book.find(([p]) => p === part)![1], ...set.gen[part]]
    const key = String.fromCharCode(97 + i)
    const list = eqs.map((e, k) => withSign(e, k + i))
    book.push([key, list[0]])
    gen[key] = list.slice(1)
  })
  return { book, gen }
}

const H13 = fromSets([[SETS6.H2, 'c'], [SETS6.H2, 'd'], [SETS6.H5, 'a'], [SETS6.H5, 'b']])
const H14 = fromSets([[SETS62.H1, 'a'], [SETS62.H1, 'b'], [SETS62.H2, 'a'], [SETS62.H2, 'c']])
const H15 = fromSets([[SETS62.H3, 'a'], [SETS62.H3, 'b'], [SETS62.H3, 'c'], [SETS62.H3, 'd']])

export const EX65H: Exercise[] = [
  buildIq65('4', { shown: 13, ...H13 }),
  buildIq65('4', { shown: 14, ...H14 }),
  buildIq65('4', { shown: 15, ...H15 }),
]
