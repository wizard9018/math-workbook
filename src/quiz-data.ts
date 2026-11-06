// Grade 9, 5.1 exercise 2 a-j ("Determine if the expression is a polynomial"): the question, the one-question lesson shown after a wrong answer,
// and three similar practice questions. Lessons are built from the term list (see makeLesson); the bank texts come from bank/G9-ch5/s1/items.json.
// Lesson = the textbook examples (monomials / non-monomials) and ONE question: is there something like one of the non-monomials here? (it decides the answer)
import type { Exercise } from './exercise'
import type { Lesson, ReviewRow, Step, Tok } from './lessons'
import VARIANTS from './variants.json'
import { topTen } from './simplify-data'

type Rule = 'denominator' | 'exponent' | 'root'
interface Term {
  tex: string
  bad?: Rule // denominator: variable under a fraction bar (also a negative exponent: x^-2 = 1/x^2); root: variable inside a radical; exponent: fractional exponent
}
interface Practice {
  tex: string
  yes: boolean
  why: string
  bad?: Rule // what makes it not a polynomial (same meaning as Term.bad)
}
export interface QuizItem {
  part: string // a ... j
  tex: string // the whole expression
  yes: boolean
  why: string // one-sentence explanation of the right answer
  terms: Term[]
  ops: string[] // the signs between terms ('+' / '-')
  practice: Practice[]
}

const REVIEW: ReviewRow[] = [
  { rule: 'denominator', letters: 'D', name: 'A variable under a fraction bar', note: 'Not a polynomial. A negative exponent counts too: x to the power -2 is 1 over x squared.' },
  { rule: 'root', letters: 'R', name: 'A variable inside a radical', note: 'Not a polynomial. A radical of x is a fractional exponent. A radical on a plain number, like the square root of 3, is fine.' },
  { rule: 'exponent', letters: 'E', name: 'A fractional exponent', note: 'Not a polynomial. Exponents on variables must be whole numbers: 0, 1, 2, 3 ...' },
  { rule: 'coef', letters: 'C', name: 'Any real coefficient is fine', note: 'Fractions, radicals and negative powers of a NUMBER are allowed in the coefficient, like 1/2, the square root of 3, or 2 to the power -3.' },
]
const RED = (t: string) => `\\textcolor{#dc2626}{${t}}`
const GREEN = (t: string) => `\\textcolor{#16a34a}{${t}}`
const T = (id: string, tex: string): Tok => ({ id, tex })

// the right answer sits in a different slot for different items
const place = <X,>(right: X, wrong: X[], slot: number): [X[], number] => {
  const at = slot % (wrong.length + 1)
  const out = [...wrong]
  out.splice(at, 0, right)
  return [out, at]
}

// a practice question gets the same one-question lesson
export const practiceLesson = (p: Practice, key: string, idx: number): Lesson =>
  makeLesson({ part: key, tex: p.tex, yes: p.yes, why: p.why, terms: [{ tex: p.tex, bad: p.bad }], ops: [], practice: [] }, idx)

// the textbook examples shown when the first answer is wrong
const REFERENCE = [
  { label: 'Examples of monomials:', tex: '\\tfrac{3}{4}y^2,\\ \\ -4,\\ \\ 2x' },
  { label: 'Examples of non-monomials:', tex: '\\dfrac{1}{x},\\ \\ \\sqrt{x},\\ \\ x^{\\frac{2}{3}}' },
]
// the non-monomial examples a student can match with, and "none of them"
const LIKE = {
  denominator: '\\dfrac{1}{x}',
  root: '\\sqrt{x}',
  exponent: 'x^{\\frac{2}{3}}',
}
const NONE = '\\text{none of them}'

// ONE question: is there something in the expression like one of the non-monomial examples?
export function makeLesson(item: QuizItem, idx: number): Lesson {
  const { terms, ops } = item
  const start: Tok[] = []
  terms.forEach((t, i) => {
    if (i > 0) start.push(T(`o${i}`, ops[i - 1] === '-' ? '-' : '+'))
    start.push(T(`t${i}`, t.tex))
  })

  const bad = terms.find((t) => t.bad)?.bad // a negative exponent is stored as 'denominator' (x^-2 = 1/x^2)
  const right = bad ? LIKE[bad] : NONE
  const wrong = [...Object.values(LIKE), NONE].filter((o) => o !== right)
  const [options, correct] = place(right, wrong, idx)

  const step: Step = {
    focus: start.map((tk) => tk.id),
    result: T('r1', item.yes ? GREEN('\\text{Yes, a polynomial}') : RED('\\text{No, not a polynomial}')),
    say: '',
    calcPrompt: 'Is there something here like one of the non-monomials? Which one?',
    calc: {
      q: 'Is there something here like one of the non-monomials? Which one?',
      options,
      correct,
      hints: options.map((o, i) => (i === correct ? '' : o === NONE ? 'Look again: there is a variable under a fraction bar, inside a radical, or with a fractional exponent.' : 'Look again: nothing in the expression looks like that.')),
      spell: bad ? 'a variable under a fraction bar, inside a radical, or with a fractional exponent is not a monomial' : 'it looks like the monomial examples',
    },
  }

  return {
    key: `quiz-${item.part}`,
    label: item.part,
    source: `Grade 9, 5.1 exercise 2${item.part}`,
    title: 'Is it a polynomial?',
    prompt: 'Decide:',
    answer: item.yes ? 'a polynomial' : 'not a polynomial',
    reference: REFERENCE,
    start,
    steps: [step],
    review: { heading: 'Polynomial rules', rows: REVIEW },
  }
}

const t = (tex: string, bad?: Rule): Term => ({ tex, bad })
const p = (tex: string, yes: boolean, why: string, bad?: Rule): Practice => ({ tex, yes, why, bad })

export const QUIZ: QuizItem[] = [
  {
    part: 'a', tex: 'x^0', yes: true,
    why: 'x to the power 0 equals 1, a constant, and 0 is a whole-number exponent.',
    terms: [t('x^0')], ops: [],
    practice: [p('y^0', true, 'The exponent 0 is a whole number.'), p('-9', true, 'A constant is a polynomial (exponent 0).'), p('t^0 - 6', true, 'Both terms have the whole-number exponent 0.')],
  },
  {
    part: 'b', tex: '\\frac{1}{x}', yes: false,
    why: 'The variable x is in the denominator.',
    terms: [t('\\frac{1}{x}', 'denominator')], ops: [],
    practice: [p('\\frac{2}{y}', false, 'The variable y is in the denominator.', 'denominator'), p('\\frac{y}{2}', true, 'The denominator is the number 2. y/2 is one half times y.'), p('\\frac{5}{x+1}', false, 'A variable is in the denominator.', 'denominator')],
  },
  {
    part: 'c', tex: '2x^2 + 3', yes: true,
    why: 'The exponents 2 and 0 are whole numbers, so every term is allowed.',
    terms: [t('2x^2'), t('3')], ops: ['+'],
    practice: [p('3y^2 - 5', true, 'Whole-number exponents only (2 and 0).'), p('x^3 + x + 1', true, 'The exponents 3, 1 and 0 are whole numbers.'), p('x^{0.5} + 3', false, 'The exponent 0.5 is not a whole number.', 'exponent')],
  },
  {
    part: 'd', tex: '2xy + y - 3', yes: true,
    why: 'Two variables in one term are allowed; every exponent is a whole number.',
    terms: [t('2xy'), t('y'), t('3')], ops: ['+', '-'],
    practice: [p('3ab + b - 7', true, 'Every exponent is a whole number.'), p('xy^2 + y', true, 'The exponents 1, 2 and 1 are whole numbers.'), p('\\frac{x}{y} + 2', false, 'The variable y is in the denominator.', 'denominator')],
  },
  {
    part: 'e', tex: '\\sqrt{x} + 2x', yes: false,
    why: 'The term root x has a variable under a root.',
    terms: [t('\\sqrt{x}', 'root'), t('2x')], ops: ['+'],
    practice: [p('\\sqrt{y} + 3', false, 'The variable y is under a root.', 'root'), p('2\\sqrt{3}\\,y + 1', true, 'The root is only in the coefficient.'), p('5 + \\sqrt{m}', false, 'The variable m is under a root.', 'root')],
  },
  {
    part: 'f', tex: '\\frac{1}{3}', yes: true,
    why: 'One third is just a number (a constant), so it is a polynomial.',
    terms: [t('\\frac{1}{3}')], ops: [],
    practice: [p('\\frac{2}{5}', true, 'A fraction of numbers is a constant.'), p('0.75', true, 'A constant is a polynomial.'), p('\\frac{4}{a}', false, 'The variable a is in the denominator.', 'denominator')],
  },
  {
    part: 'g', tex: '\\sqrt{2}x^2 + 3x - 1', yes: true,
    why: 'The root is only in the coefficient; all exponents are whole numbers.',
    terms: [t('\\sqrt{2}x^2'), t('3x'), t('1')], ops: ['+', '-'],
    practice: [p('\\sqrt{5}x^2 - x', true, 'The root is in the coefficient only.'), p('\\frac{1}{2}y^3 + 4', true, 'A fraction coefficient is allowed.'), p('\\pi x^2 + 2', true, 'Pi is a real number, so it is a fine coefficient.')],
  },
  {
    part: 'h', tex: 'x^2 + x + x^0', yes: true,
    why: 'The exponents 2, 1 and 0 are all whole numbers.',
    terms: [t('x^2'), t('x'), t('x^0')], ops: ['+', '+'],
    practice: [p('y^3 + y^0', true, 'The exponents 3 and 0 are whole numbers.'), p('m^2 + m + 1', true, 'The exponents 2, 1 and 0 are whole numbers.'), p('a^2 + a^{-1}', false, 'The exponent -1 is negative.', 'denominator')],
  },
  {
    part: 'i', tex: 'x^{-2} + x^{-1} + x', yes: false,
    why: 'The exponents -2 and -1 are negative.',
    terms: [t('x^{-2}', 'denominator'), t('x^{-1}', 'denominator'), t('x')], ops: ['+', '+'],
    practice: [p('y^{-3} + y', false, 'The exponent -3 is negative.', 'denominator'), p('a^{-1}b', false, 'The exponent -1 is negative.', 'denominator'), p('p^3 + p^{-2}', false, 'The exponent -2 is negative.', 'denominator')],
  },
  {
    part: 'j', tex: '2^{-3}x^2', yes: true,
    why: 'The exponent -3 is on the number 2, so the coefficient is 1/8. The exponent of x is 2.',
    terms: [t('2^{-3}x^2')], ops: [],
    practice: [p('3^{-2}y^4', true, 'The negative power is on the number 3, so the coefficient is 1/9.'), p('5^{-1}x + 2', true, 'The coefficient 5 to the power -1 is 1/5, a real number.'), p('y^{-2}', false, 'The negative exponent is on the variable.', 'denominator')],
  },
]

// Gemini's expressions (gen-variants.py) as practice questions. Only the text is used: this code decides itself whether the expression is a polynomial and why not,
// and drops anything it cannot classify for sure.
const texOf = (s: string) =>
  s
    .replace(/sqrt\(([^()]*)\)/g, '\\sqrt{$1}')
    .replace(/\^\((-?\d+)\/(\d+)\)/g, '^{\\frac{$1}{$2}}')
    .replace(/\^(-?\d+(?:\.\d+)?)/g, '^{$1}')
    .replace(/(\d+)\/(\d+)/g, '\\frac{$1}{$2}')
    .replace(/(\d+)\/([a-z](?:\^\{[^}]*\})?)/g, '\\frac{$1}{$2}')
// a power on a NUMBER (4^-1 = 1/4) is only part of the coefficient; only powers on letters decide
const POLY_TERM = /^-?(?:\d+(?:\.\d+)?(?:\/\d+)?(?:\^-?\d+)?|sqrt\(\d+\))?(?:[a-z](?:\^\d+)?)*$/
const badOf = (t: string): Rule | undefined => (/\/[a-z]|[a-z]\^-\d/.test(t) ? 'denominator' : /sqrt\([^)]*[a-z]/.test(t) ? 'root' : /[a-z]\^\(\d+\/\d+\)|[a-z]\^\d+\.\d+/.test(t) ? 'exponent' : undefined)
const WHY = {
  yes: 'Every exponent is a whole number, and no variable is under a fraction bar or a root.',
  denominator: 'A variable is in the denominator (or has a negative exponent).',
  root: 'A variable is under a root.',
  exponent: 'An exponent on a variable is not a whole number.',
}
const fromGemini = (g: unknown): Practice[] => {
  const expr = typeof g === 'string' ? g : (g as { expr?: unknown } | null)?.expr
  if (typeof expr !== 'string' || !/^[-0-9a-z^/().]+(?: [-+] [-0-9a-z^/().]+)*$/.test(expr)) return []
  const terms = expr.split(/ [+-] /)
  const bads = terms.map(badOf)
  if (terms.some((t, i) => !bads[i] && (!POLY_TERM.test(t) || !t.replace(/^-/, '')))) return []
  const bad = bads.find(Boolean)
  return [{ tex: texOf(expr), yes: !bad, why: WHY[bad ?? 'yes'], bad }]
}
const generatedFor = (part: string): Practice[] => ((VARIANTS as Record<string, Record<string, unknown[]>>)['2']?.[part] ?? []).flatMap(fromGemini)

// the quiz page's view of exercise 2: answer Yes / No, wrong -> the one-question lesson
const YESNO = ['Yes, a polynomial', 'No, not a polynomial']
export const EX2: Exercise = {
  no: 2,
  prompt: 'Is it a polynomial?',
  questions: QUIZ.map((q, i) => ({
    part: q.part,
    tex: q.tex,
    choices: YESNO,
    correct: q.yes ? 0 : 1,
    why: q.why,
    lesson: () => makeLesson(q, i),
    practice: topTen(generatedFor(q.part), q.practice, (p) => p.tex, { tex: q.tex } as Practice).map((p, k) => ({ tex: p.tex, choices: YESNO, correct: p.yes ? 0 : 1, why: p.why, lesson: () => practiceLesson(p, `${q.part}${k + 1}`, i + k) })),
  })),
}
