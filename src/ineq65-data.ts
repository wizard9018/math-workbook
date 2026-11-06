// Grade 9 6.5 exercises 2-5 (bank/G9-ch6/s5/items.json; exercise 1 is left out, 4p with a parameter is left out, 4n, 4o and 5e (the variable cancels: no solution / all numbers) are left out, the textbook's 6-11 are merged into exercise 6):
//   2 one-step, 3 multi-step, 4 fractions and brackets, 5 decimals, 6 word problems (a = 6, b = 7, c = 8, d = 9, e = 10, f = 11)
// The lessons of the equations are reused: 6.1 lessonEq (move the terms, collect, divide) and 6.2 lesson62 (brackets, LCD / power of 10); here the "=" is the sign of the
// inequality and a division by a negative number gets one more question: the sign turns round. Answers are computed.
// The 10 similar questions of 2-5 are written by Gemini (gen-variants-65.py, variants65.json); the word problems are made from number tables.
// Imported by: quiz.tsx, check65.ts. Shape: exercise.ts.
import type { Exercise, Practice, Question } from './exercise'
import type { Lesson, Step, Tok } from './lessons'
import V65 from './variants65.json'
import BOOK65 from './book65.json'
import { lessonEq, numTex, parseEq, solution, texEq } from './eq-data'
import type { Eq } from './eq-data'
import { lesson62, parseEq62, solveEq62, texEq62 } from './eq62-data'
import type { Eq62 } from './eq62-data'
import { add, neg, pick, q, topTen } from './simplify-data'
import type { Q } from './simplify-data'
import { lessonWp, sgBlank } from './ineq64-data'
import type { Wp } from './ineq64-data'

type Sym = '<' | '>' | '<=' | '>='
const SYMS: Sym[] = ['>=', '<=', '>', '<']
const SYM_TEX: Record<Sym, string> = { '<': '<', '>': '>', '<=': '\\le', '>=': '\\ge' }
const FLIP: Record<Sym, Sym> = { '<': '>', '>': '<', '<=': '>=', '>=': '<=' }
const TOGGLE: Record<Sym, Sym> = { '<': '<=', '>': '>=', '<=': '<', '>=': '>' }
const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i)
const shuffled = <T,>(a: T[], seed: number): T[] => {
  let s = seed
  const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32)
  return [...a].sort(() => r() - 0.5)
}

// ---- an inequality: the equation (the same sides) and the sign ----
interface Iq {
  sg: Sym
  e62?: Eq62
  e61?: Eq
}
const eqOf = (i: Iq): Eq => (i.e62 ? solveEq62(i.e62) : i.e61!)
const letter = (i: Iq) => eqOf(i).v
// the number in front of the variable after everything is collected: a negative one turns the sign round
const varCoef = (e: Eq): Q => {
  const sum = (ms: Eq['l']) => ms.filter((m) => m.raw === e.v).reduce((s, m) => add(s, m.c), q(0))
  return add(sum(e.l), neg(sum(e.r)))
}
const flips = (i: Iq) => varCoef(eqOf(i))[0] < 0
const finalSym = (i: Iq): Sym => (flips(i) ? FLIP[i.sg] : i.sg)
const ansTex = (i: Iq) => `${letter(i)} ${SYM_TEX[finalSym(i)]} ${numTex(solution(eqOf(i)))}`
const texIq = (i: Iq) => (i.e62 ? texEq62(i.e62) : texEq(i.e61!)).replace(' = ', ` ${SYM_TEX[i.sg]} `)
function parseIq(src: unknown): Iq | null {
  if (typeof src !== 'string') return null
  const m = src.match(/^(.*?)(<=|>=|<|>)(.*)$/)
  if (!m || /[<>]/.test(m[3])) return null
  const eq = `${m[1]}=${m[3]}`
  const sg = m[2] as Sym
  const e62 = parseEq62(eq)
  if (e62) return { sg, e62 }
  const e61 = parseEq(eq, true)
  return e61 ? { sg, e61 } : null
}

// the variable only on the right side: the inequality is turned round first (the letter side first), then it is solved like the others
const swapIq = (i: Iq): Iq => ({ sg: FLIP[i.sg], ...(i.e62 ? { e62: { ...i.e62, l: i.e62.r, r: i.e62.l } } : { e61: { ...i.e61!, l: i.e61!.r, r: i.e61!.l } }) })
const needSwap = (i: Iq) => eqOf(i).l.every((m) => m.raw === '') && eqOf(i).r.some((m) => m.raw === letter(i))

function lessonIq(i: Iq, key: string, no: number, idx: number): Lesson {
  if (needSwap(i)) {
    const sw = swapIq(i)
    const inner = lessonIq(sw, key, no, idx)
    const [options, correct] = pick(texIq(sw), [texIq({ ...sw, sg: i.sg }), texIq(i), texIq({ ...sw, sg: TOGGLE[sw.sg] })], idx)
    const prompt = 'The same inequality with the variable on the left?'
    const hint = `$${texIq(i)}$ means $${texIq(sw)}$: the sides change places and the sign turns round.`
    const first: Step = { focus: ['o0'], result: inner.start[0], results: inner.start, arrows: [], say: '', calcPrompt: prompt, calc: { q: prompt, options, correct, hints: options.map((_, j) => (j === correct ? '' : hint)), spell: hint } }
    return { ...inner, answer: ansTex(i), start: [{ id: 'o0', tex: texIq(i) }], steps: [first, ...inner.steps] }
  }
  const base = i.e62 ? lesson62(i.e62, key, no, idx) : lessonEq(i.e61!, key, no, idx)
  const S = SYM_TEX[i.sg]
  const fix = (t: Tok): Tok => (t.tex === '=' ? { ...t, tex: S } : t)
  const steps: Step[] = base.steps.map((s) => ({ ...s, result: fix(s.result), ...(s.results ? { results: s.results.map(fix) } : {}) }))
  const start = base.start.map((t) => ({ ...t, tex: t.tex === '=' ? S : t.tex.replace(' = ', ` ${S} `) }))
  if (flips(i)) {
    const at = steps.findIndex((s) => s.result.tex.startsWith('\\div ('))
    const f = FLIP[i.sg]
    const hint = `Dividing by a negative number turns the sign round: $a ${S} b$ becomes $a ${SYM_TEX[f]} b$.`
    const [options, correct] = pick(SYM_TEX[f], SYMS.filter((x) => x !== f).map((x) => SYM_TEX[x]), idx)
    const prompt = 'The sign after dividing by a negative number?'
    steps.splice(at + 1, 0, { focus: ['q'], result: { id: 'qf', tex: SYM_TEX[f] }, arrows: [{ from: ['q'], to: ['qf'] }], say: '', calcPrompt: prompt, calc: { q: prompt, options, correct, hints: options.map((_, j) => (j === correct ? '' : hint)), spell: hint } })
  }
  return { ...base, key: `ineq65-${base.key}`, source: base.source.replace('6.1', '6.5').replace('6.2', '6.5'), answer: ansTex(i), start, steps, review: { heading: 'Inequalities', rows: [] } }
}
function choicesIq(i: Iq, idx: number): [string[], number] {
  const x = solution(eqOf(i))
  const v = letter(i)
  const fin = finalSym(i)
  const f = (sg: Sym, n: Q) => `${v} ${SYM_TEX[sg]} ${numTex(n)}`
  const other = flips(i) ? i.sg : FLIP[i.sg] // the sign turned round when it should not (or not turned round when it should)
  return pick(f(fin, x), [f(other, x), f(fin, neg(x)), f(TOGGLE[fin], x), f(other, neg(x)), f(fin, add(x, q(1)))], idx)
}

const BK = BOOK65 as Record<string, Record<string, string>>
const VR = V65 as Record<string, Record<string, unknown[]>>
export type Custom65 = { shown: number; book: [string, string][]; gen: Record<string, string[]> }
function buildIq(no: string, custom?: Custom65): Exercise {
  const questions: Question[] = (custom?.book ?? Object.entries(BK[no])).filter(([, src]) => parseIq(src)).map(([part, src], idx): Question => {
    const book = parseIq(src)!
    const brackets = (x: Iq) => !!x.e62 && [...x.e62.l, ...x.e62.r].some((t) => t.group)
    const fits = (x: Iq | null): x is Iq => {
      if (!x) return false
      const s = solution(eqOf(x))
      if (!(Math.abs(s[0] / s[1]) <= 5000) || s[1] > 1000) return false
      return no !== '3' || brackets(x) === brackets(book)
    }
    const bank = topTen((custom?.gen[part] ?? VR[no]?.[part] ?? []).map(parseIq).filter(fits), [], texIq, book)
    const make = (x: Iq, key: string, k: number): Practice => {
      const [choices, correct] = choicesIq(x, idx + k)
      return { tex: texIq(x), choices, correct, why: '', lesson: () => lessonIq(x, key, Number(no), idx + k) }
    }
    return { part, ...make(book, part, 0), practice: bank.map((x, k) => make(x, `${part}${k + 1}`, k + 1)) }
  })
  return { no: custom?.shown ?? Number(no), sec: '6.5', prompt: 'Solve the inequality.', mathChoices: true, questions }
}

// ================= exercise 6: word problems (the textbook's 6-11) =================
const text = (t: string) => `\\text{${t.replace(/[%&#_]/g, (c) => `\\${c}`)}}`
const n4 = (x: number) => String(+x.toFixed(4))
type Spec = Wp['steps'][number]
const blk = (id: string, from: string, prompt: string, wrongs: string[], hint: string) => ({ id, from, prompt, wrongs, hint })
const numWrongs = (x: number, more: number[] = []) => [x + 1, x - 1, -x, ...more].map(n4)

// 6: banquet: F + c n <= B
interface Bq {
  B: number
  F: number
  c: number
}
const bqTex = (b: Bq) => text(`The school athletic banquet can spend at most ${b.B} dollars for the awards dinner. If the restaurant charges a ${b.F} dollar set up fee plus ${b.c} dollars per person, at most how many athletes can attend the dinner?`)
function wpBq(b: Bq, key: string): Wp {
  const bound = (b.B - b.F) / b.c
  const ans = Math.floor(bound)
  const steps: Spec[] = [
    { label: 'Write the cost.', toks: [{ id: 'e1a', tex: `${b.F} + ${b.c}n` }, { id: 'e1g', tex: '\\le' }, { id: 'e1b', tex: String(b.B) }], blanks: [blk('e1a', 's0', '$\\text{The cost for } n \\text{ persons}$', [`${b.F}n + ${b.c}`, `${b.F + b.c}n`, `${b.c}n`], 'A set up fee plus a price for every person.'), sgBlank('e1g', 's0', '<=', '$\\text{at most} : \\le$')] },
    { label: 'Take the fee away.', toks: [{ id: 'e2a', tex: `${b.c}n` }, { id: 'e2g', tex: '\\le' }, { id: 'e2b', tex: String(b.B - b.F) }], blanks: [blk('e2b', 'e1b', `$${b.B} - ${b.F} = \\square$`, numWrongs(b.B - b.F, [b.B + b.F]), `Take $${b.F}$ away from both sides.`)] },
    { label: 'Divide.', toks: [{ id: 'e3a', tex: 'n' }, { id: 'e3g', tex: '\\le' }, { id: 'e3b', tex: n4(bound) }], blanks: [blk('e3b', 'e2b', `$${b.B - b.F} \\div ${b.c} = \\square$`, [n4((b.B - b.F) * b.c), n4(bound + 1), n4(bound - 1)], `Divide both sides by $${b.c}$.`)] },
    { label: 'Whole persons.', toks: [{ id: 'e4', tex: String(ans) }], blanks: [blk('e4', 'e3b', `$n \\le ${n4(bound)},\\ n \\text{ a whole number}$`, numWrongs(ans, [Math.ceil(bound) + (Number.isInteger(bound) ? 1 : 0)]), 'Persons are counted in whole numbers: round down.')] },
  ]
  return { tex: bqTex(b), short: `\\text{at most } ${b.B} \\text{ dollars}`, key, answer: String(ans), wrong: numWrongs(ans, [Math.ceil(bound) + 1]), steps }
}
// 7: two consecutive odd integers, the sum less than S
const cnTex = (S: number) => text(`The sum of two consecutive odd integers is less than ${S}. What is the largest pair of these integers?`)
function wpCn(S: number, key: string): Wp {
  const b = (S - 2) / 2
  const n = b % 2 === 0 ? b - 1 : b - 2
  const pair = (m: number) => `${m}, ${m + 2}`
  const steps: Spec[] = [
    { label: 'Write the sum.', toks: [{ id: 'e1a', tex: 'n + (n + 2)' }, { id: 'e1g', tex: '<' }, { id: 'e1b', tex: String(S) }], blanks: [blk('e1a', 's0', '$\\text{Two consecutive odd integers}$', ['n + n', 'n + (n + 1)', 'n + 2n'], 'The next odd integer is $n + 2$.'), sgBlank('e1g', 's0', '<', '$\\text{less than} : <$')] },
    { label: 'Collect.', toks: [{ id: 'e2a', tex: '2n' }, { id: 'e2g', tex: '<' }, { id: 'e2b', tex: String(S - 2) }], blanks: [blk('e2b', 'e1b', `$${S} - 2 = \\square$`, numWrongs(S - 2, [S + 2]), 'Take $2$ away from both sides.')] },
    { label: 'Divide.', toks: [{ id: 'e3a', tex: 'n' }, { id: 'e3g', tex: '<' }, { id: 'e3b', tex: String(b) }], blanks: [blk('e3b', 'e2b', `$${S - 2} \\div 2 = \\square$`, numWrongs(b, [S - 2]), 'Divide both sides by $2$.')] },
    { label: 'The largest pair.', toks: [{ id: 'e4', tex: pair(n) }], blanks: [blk('e4', 'e3b', `$n < ${b},\\ n \\text{ odd}$`, [pair(n + 2), pair(n - 2), pair(b)], `The largest odd integer less than $${b}$ is $${n}$.`)] },
  ]
  return { tex: cnTex(S), short: `\\text{the sum is less than } ${S}`, key, answer: pair(n), wrong: [pair(n + 2), pair(n - 2), pair(b), pair(b - 1)], steps }
}
// 8: reduced fat: f <= (num/den) r
interface Gr {
  f: number
  num: number
  den: number
}
const WORDS: Record<string, string> = { '3/4': 'three quarters', '2/3': 'two thirds', '4/5': 'four fifths', '1/2': 'one half', '3/5': 'three fifths' }
const grTex = (g: Gr) => text(`A low calorie granola bar contains ${g.f} grams of fat. To be advertised as 'reduced fat' it must contain no more than ${WORDS[`${g.num}/${g.den}`]} of the fat in the regular granola bar. How many grams of fat are contained in the regular granola bar?`)
function wpGr(g: Gr, key: string): Wp {
  const R = (g.f * g.den) / g.num
  const fr = `\\frac{${g.num}}{${g.den}}`
  const steps: Spec[] = [
    { label: 'Write the fat.', toks: [{ id: 'e1a', tex: String(g.f) }, { id: 'e1g', tex: '\\le' }, { id: 'e1b', tex: `${fr}r` }], blanks: [blk('e1b', 's0', '$\\text{the fat allowed, } r \\text{ grams in the regular bar}$', [`\\frac{${g.den}}{${g.num}}r`, `${g.num}r`, `r + ${fr}`], `No more than ${WORDS[`${g.num}/${g.den}`]} of $r$.`), sgBlank('e1g', 's0', '<=', '$\\text{no more than} : \\le$')] },
    { label: 'Solve for r.', toks: [{ id: 'e2a', tex: 'r' }, { id: 'e2g', tex: '\\ge' }, { id: 'e2b', tex: String(R) }], blanks: [blk('e2b', 'e1a', `$${g.f} \\cdot \\frac{${g.den}}{${g.num}} = \\square$`, numWrongs(R, [(g.f * g.num) / g.den]), `Multiply both sides by $\\frac{${g.den}}{${g.num}}$.`), blk('e2g', 'e1g', `$${g.f} \\le ${fr}r \\;\\to\\; r\\ \\square\\ ${R}$`, SYMS.filter((x) => x !== '>=').map((x) => SYM_TEX[x]), `The letter first: $${g.f} \\le ${fr}r$ means $r \\ge ${R}$.`)] },
  ]
  return { tex: grTex(g), short: `\\text{reduced fat: } ${g.f} \\text{ grams}`, key, answer: `r \\ge ${R}`, wrong: [`r \\le ${R}`, `r \\ge ${(g.f * g.num) / g.den}`, `r \\ge ${g.f}`, `r \\ge ${R + g.den}`], steps }
}
// 9: calories
interface Cl {
  C: number
  p: number
  qq: number
}
const clTex = (c: Cl) => text(`Kate's diet cannot exceed ${c.C} calories per day, consisting of fats, proteins and carbohydrates. She is restricted to ${c.p}% of her daily intake in fat, and ${c.qq}% in protein. How many calories can she eat in carbohydrates, and not exceed her daily maximum calories.`)
function wpCl(c: Cl, key: string): Wp {
  const rest = (100 - c.p - c.qq) / 100
  const V = c.C * rest
  const d = (x: number) => n4(x / 100)
  const steps: Spec[] = [
    { label: 'Write the carbohydrates.', toks: [{ id: 'e1a', tex: 'c' }, { id: 'e1g', tex: '\\le' }, { id: 'e1b', tex: `${c.C} - ${d(c.p)} \\cdot ${c.C} - ${d(c.qq)} \\cdot ${c.C}` }], blanks: [blk('e1b', 's0', '$\\text{All calories, without fat and protein}$', [`${c.C} + ${d(c.p)} \\cdot ${c.C} + ${d(c.qq)} \\cdot ${c.C}`, `${d(c.p)} \\cdot ${c.C} - ${d(c.qq)} \\cdot ${c.C}`, `${c.C} - ${d(c.p + c.qq)}`], 'The carbohydrates are what is left of the daily maximum.'), sgBlank('e1g', 's0', '<=', '$\\text{cannot exceed} : \\le$')] },
    { label: 'The part that is left.', toks: [{ id: 'e2a', tex: 'c' }, { id: 'e2g', tex: '\\le' }, { id: 'e2b', tex: `${n4(rest)} \\cdot ${c.C}` }], blanks: [blk('e2b', 'e1b', `$1 - ${d(c.p)} - ${d(c.qq)} = \\square$`, [`${d(c.p + c.qq)} \\cdot ${c.C}`, `${n4(rest + 0.1)} \\cdot ${c.C}`, `${n4(rest - 0.1)} \\cdot ${c.C}`], `$1 - ${d(c.p)} - ${d(c.qq)} = ${n4(rest)}$`)] },
    { label: 'Multiply.', toks: [{ id: 'e3a', tex: 'c' }, { id: 'e3g', tex: '\\le' }, { id: 'e3b', tex: String(V) }], blanks: [blk('e3b', 'e2b', `$${n4(rest)} \\cdot ${c.C} = \\square$`, numWrongs(V, [(c.C * (c.p + c.qq)) / 100]), `$${n4(rest)} \\cdot ${c.C}$`)] },
  ]
  return { tex: clTex(c), short: `\\text{at most } ${c.C} \\text{ calories}`, key, answer: `c \\le ${V}`, wrong: [`c \\ge ${V}`, `c \\le ${(c.C * (c.p + c.qq)) / 100}`, `c \\le ${V + 100}`, `c \\le ${c.C}`], steps }
}
// 10: pond: D - d w < T
interface Pd {
  D: number
  d: number
  W: number
}
const pdT = (p: Pd) => n4(p.D - p.d * p.W)
const pdTex = (p: Pd) => text(`A local pond has a depth of ${p.D} metres on June 1. Due to the hot weather, the pond level drops ${p.d} metres per week. What week will the water level be below ${pdT(p)} metres?`)
function wpPd(p: Pd, key: string): Wp {
  const T = p.D - p.d * p.W
  const ans = p.W + 1
  const steps: Spec[] = [
    { label: 'Write the depth.', toks: [{ id: 'e1a', tex: `${p.D} - ${p.d}w` }, { id: 'e1g', tex: '<' }, { id: 'e1b', tex: n4(T) }], blanks: [blk('e1a', 's0', '$\\text{The depth after } w \\text{ weeks}$', [`${p.D} + ${p.d}w`, `${p.d}w`, `${p.D}w - ${p.d}`], 'It starts at the first depth and drops every week.'), sgBlank('e1g', 's0', '<', '$\\text{below} : <$')] },
    { label: 'Take the depth away.', toks: [{ id: 'e2a', tex: `-${p.d}w` }, { id: 'e2g', tex: '<' }, { id: 'e2b', tex: n4(T - p.D) }], blanks: [blk('e2b', 'e1b', `$${n4(T)} - ${p.D} = \\square$`, [n4(T + p.D), n4(p.D - T), n4(T - p.D + 1)], `Take $${p.D}$ away from both sides.`)] },
    { label: 'Divide by the negative number.', toks: [{ id: 'e3a', tex: 'w' }, { id: 'e3g', tex: '>' }, { id: 'e3b', tex: String(p.W) }], blanks: [blk('e3b', 'e2b', `$${n4(T - p.D)} \\div (-${p.d}) = \\square$`, numWrongs(p.W, [(T - p.D) * p.d]), `Divide both sides by $-${p.d}$.`), blk('e3g', 'e2g', '$\\text{Divided by a negative number: the sign?}$', ['<', '\\le', '\\ge'], 'Dividing by a negative number turns the sign round.')] },
    { label: 'The week.', toks: [{ id: 'e4', tex: String(ans) }], blanks: [blk('e4', 'e3b', `$w > ${p.W},\\ w \\text{ a whole number}$`, numWrongs(ans, [p.W]), `The first whole number above $${p.W}$ is $${ans}$.`)] },
  ]
  return { tex: pdTex(p), short: `\\text{below } ${n4(T)} \\text{ metres}`, key, answer: String(ans), wrong: numWrongs(ans, [p.W]), steps }
}
// 11: car rental: A (unlimited) < B + r/100 m
interface Cr {
  A: number
  B: number
  r: number
}
const crTex = (c: Cr) => text(`Jessica can rent a car for either ${c.A} dollars with unlimited mileage, or ${c.B} dollars plus ${c.r} cents per mile driven. For what amount of driving would the unlimited mileage option save money?`)
function wpCr(c: Cr, key: string): Wp {
  const rate = n4(c.r / 100)
  const M = ((c.A - c.B) * 100) / c.r
  const steps: Spec[] = [
    { label: 'Compare the costs.', toks: [{ id: 'e1a', tex: String(c.A) }, { id: 'e1g', tex: '<' }, { id: 'e1b', tex: `${c.B} + ${rate}m` }], blanks: [blk('e1b', 's0', '$\\text{The other plan for } m \\text{ miles}$', [`${c.B}m + ${rate}`, `${c.B} + ${c.r}m`, `${c.B} - ${rate}m`], `${c.r} cents is $${rate}$ dollars.`), sgBlank('e1g', 's0', '<', '$\\text{unlimited is cheaper} : <$')] },
    { label: 'Take the other fee away.', toks: [{ id: 'e2a', tex: n4(c.A - c.B) }, { id: 'e2g', tex: '<' }, { id: 'e2b', tex: `${rate}m` }], blanks: [blk('e2a', 'e1a', `$${c.A} - ${c.B} = \\square$`, numWrongs(c.A - c.B, [c.A + c.B]), `Take $${c.B}$ away from both sides.`)] },
    { label: 'Divide.', toks: [{ id: 'e3a', tex: 'm' }, { id: 'e3g', tex: '>' }, { id: 'e3b', tex: n4(M) }], blanks: [blk('e3b', 'e2a', `$${n4(c.A - c.B)} \\div ${rate} = \\square$`, [n4(M / 10), n4(M * 10), n4((c.A - c.B) * c.r)], `Divide both sides by $${rate}$.`), blk('e3g', 'e2g', `$${n4(c.A - c.B)} < ${rate}m \\;\\to\\; m\\ \\square\\ ${n4(M)}$`, ['<', '\\le', '\\ge'], `The letter first: $${n4(c.A - c.B)} < ${rate}m$ means $m > ${n4(M)}$.`)] },
  ]
  return { tex: crTex(c), short: `\\text{unlimited mileage: } ${c.A} \\text{ dollars}`, key, answer: `m > ${n4(M)}`, wrong: [`m < ${n4(M)}`, `m \\ge ${n4(M)}`, `m > ${n4(M / 10)}`, `m > ${n4(M * 10)}`], steps }
}

function buildWords(): Exercise {
  const mk = <T,>(book: T, pool: T[], seed: number, tex: (x: T) => string, f: (x: T, key: string) => Wp, part: string, title: string): Question => {
    const seen = new Set([tex(book)])
    const bank = shuffled(pool, seed).filter((x) => !seen.has(tex(x)) && !!seen.add(tex(x))).slice(0, 10)
    const one = (x: T, key: string, k: number): Practice => {
      const w = f(x, key)
      const [choices, correct] = pick(w.answer, w.wrong, seed + k)
      return { tex: w.tex, choices, correct, why: '', lesson: () => lessonWp(f(x, key), `Grade 9, 6.5 exercise 6${key}`, title, seed + k) }
    }
    return { part, ...one(book, part, 0), practice: bank.map((x, k) => one(x, `${part}${k + 1}`, k + 1)) }
  }
  const bqs: Bq[] = [300, 400, 500, 600, 800].flatMap((B) => [30, 40, 50, 60, 80].flatMap((F) => [12, 15, 20, 25, 30].map((c) => ({ B, F, c })))).filter((b) => b.B > b.F + 5 * b.c)
  const cns = range(8, 40).map((h) => 2 * h + 2).filter((S) => S !== 50)
  const grs: Gr[] = [[3, 4], [2, 3], [4, 5], [1, 2], [3, 5]].flatMap(([num, den]) => range(2, 9).map((k) => ({ f: num * k, num, den })))
  const cls: Cl[] = [1500, 1600, 1800, 2000, 2200, 2400].flatMap((C) => [[25, 40], [20, 40], [30, 40], [25, 35], [30, 35], [20, 45]].map(([p, qq]) => ({ C, p, qq }))).filter((c) => (c.C * (100 - c.p - c.qq)) % 100 === 0)
  const pds: Pd[] = [0.5, 0.75, 0.25, 1.5, 2].flatMap((d) => range(24, 40).flatMap((D) => range(5, 12).map((W) => ({ D, d, W })))).filter((p) => p.D - p.d * p.W > 5)
  const crs: Cr[] = [20, 25, 40, 50].flatMap((r) => range(40, 80).flatMap((A) => range(20, 50).map((B) => ({ A, B, r })))).filter((c) => c.A > c.B + 5 && (((c.A - c.B) * 100) / c.r) % 1 === 0 && ((c.A - c.B) * 100) / c.r <= 200)
  const questions: Question[] = [
    mk<Bq>({ B: 500, F: 50, c: 20 }, bqs, 6600, bqTex, wpBq, 'a', 'Banquet'),
    mk<number>(50, cns, 6601, cnTex, wpCn, 'b', 'Consecutive odd integers'),
    mk<Gr>({ f: 15, num: 3, den: 4 }, grs, 6602, grTex, wpGr, 'c', 'Reduced fat'),
    mk<Cl>({ C: 1800, p: 25, qq: 40 }, cls, 6603, clTex, wpCl, 'd', 'Calories'),
    mk<Pd>({ D: 30, d: 0.75, W: 8 }, pds, 6604, pdTex, wpPd, 'e', 'Pond'),
    mk<Cr>({ A: 58, B: 32, r: 40 }, crs, 6605, crTex, wpCr, 'f', 'Car rental'),
  ]
  return { no: 6, sec: '6.5', prompt: 'Answer the question.', mathChoices: true, questions }
}

export const buildIq65 = buildIq
export const EX_INEQ65 = [buildIq('2'), buildIq('3'), buildIq('4'), buildIq('5'), buildWords()]
