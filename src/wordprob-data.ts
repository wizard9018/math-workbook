// Grade 9 5.4 exercises 5 (the height of a rectangle, a triangle, a box, a pyramid), 6 (a square), 7 (a parallelogram), 8 (a swimming pool) and 9 (a pyramid): word problems that end in a division.
// Lesson: the formula first, the small steps before the division (double the area, multiply the two known sides), then the division lesson of 5.4 exercises 1-3 (div-data.ts).
// The pyramids (5d, 9) divide by a bracket: V = 1/3 base h gives a bracket on both sides, the volume is factored, then the bracket cancels.
// The 10 similar questions of every slot are made here from small number tables (not by Gemini): the same shape, other numbers; the answers are computed.
// Imported by: quiz.tsx. Shape: exercise.ts.
import katex from 'katex'
import type { Exercise, Practice, Question } from './exercise'
import type { Lesson, Step, Tok } from './lessons'
import { drawFigure } from './geo-figures'
import { ask } from './geo53-data'
import { choicesDiv, frac, lessonDiv, line, texDiv } from './div-data'
import type { Div, P } from './div-data'
import type { Pre } from './mult-data'
import { mk, parseSafe, pick, q, simplified, varTex } from './simplify-data'

const kx = (s: string) => katex.renderToString(s, { throwOnError: false })
// the statement of the problem: the figure (if any), then a sentence whose $...$ parts are TeX
const statement = (svg: string, sentence: string) =>
  `<div>${svg}<p class="px-2 py-1 text-center text-xl leading-relaxed">${sentence.split('$').map((p, i) => (i % 2 ? kx(p) : p)).join('')}</p></div>`
const poly = (s: string): P => parseSafe(s)!
const pmul = (a: P, b: P): P => simplified(a.flatMap((x) => b.map((y) => mk(q(x.c[0] * y.c[0], x.c[1] * y.c[1]), x.raw + y.raw)))).map((t) => mk(t.c, varTex(t.vs)))
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a)
const withX = (n: number) => (n === 1 ? 'x' : `${n}x`)

// what a variant is: the division it ends in, the statement and the steps before the division
interface Item {
  key: string // the identity of the variant (the bank never repeats one)
  figure: string
  choices: (idx: number) => [string[], number]
  lesson: (key: string, idx: number) => Lesson
}
const FORMULA = (unknown: string, right: string, wrongs: string[], derive: string) => ({ unknown, right, wrongs, derive }) // derive: the steps that lead to the formula, one under the other
type Formula = ReturnType<typeof FORMULA>

// divisions by a monomial: `before` = the steps between the formula and the fraction (each leaves the token g, then f)
function divItem(no: string, d: Div, fig: string, f: Formula, prompt: string, g?: { tex: string; step: (idx: number) => Step }): Item {
  return {
    key: texDiv(d),
    figure: fig,
    choices: (idx) => choicesDiv(d, idx),
    lesson: (key, idx) => {
      const fin: Tok = { id: 'f', tex: texDiv(d) }
      const formula = ask(['f0'], [g ? { id: 'g', tex: g.tex } : fin], prompt, `Solve for $${f.unknown}$:`, f.right, f.wrongs, idx, [], `\\begin{aligned} ${f.derive} \\end{aligned}`)
      const pre: Pre = { start: [{ id: 'f0', tex: '\\boxed{?}' }], steps: g ? [formula, g.step(idx + 1)] : [formula], extra: { figure: fig, prompt: `${f.unknown} =` } }
      return lessonDiv(d, key, Number(no), idx, pre)
    },
  }
}

const SHAPES: Record<string, (no: string, p: number[]) => Item> = {
  // area of a rectangle: A = base x height; params m, a, b: base mx, height ax - b
  rect: (no, [m, a, b]) => {
    const base = withX(m)
    const A = pmul(poly(base), poly(`${a}x-${b}`))
    const fig = statement(drawFigure('rectangle', [base, 'h']), `$\\text{Area} = ${line(A)}$. Determine the height.`)
    return divItem(no, { num: A, den: poly(base)[0] }, fig, FORMULA('h', 'h = \\frac{A}{b}', ['h = A \\times b', 'h = A + b', 'h = \\frac{b}{A}'], 'A &= b \\times h \\\\ h &= \\frac{A}{b}'), 'The area of a rectangle is base × height. How do you find the height?')
  },
  // area of a triangle: A = 1/2 base h, so h = 2A / base; params m (even), a, b: base mx, height ax - b
  tri: (no, [m, a, b]) => {
    const base = withX(m)
    const A = pmul(poly(withX(m / 2)), poly(`${a}x-${b}`))
    const twoA = pmul(poly('2'), A)
    const d: Div = { num: twoA, den: poly(base)[0] }
    const fig = statement(drawFigure('triH', [base, 'h']), `$\\text{Area} = ${line(A)}$. Determine the height.`)
    return divItem(no, d, fig, FORMULA('h', 'h = \\frac{2A}{b}', ['h = \\frac{A}{b}', 'h = \\frac{A}{2b}', 'h = 2Ab'], 'A &= \\tfrac{1}{2} \\times b \\times h \\\\ 2A &= b \\times h \\\\ h &= \\frac{2A}{b}'), 'The area of a triangle is half of base × height. How do you find the height?', {
      tex: frac(`2(${line(A)})`, base),
      step: (idx) => ask(['g'], [{ id: 'f', tex: texDiv(d) }], `What is $2(${line(A)})$?`, 'Double every term.', line(twoA), [line(A), line(pmul(poly('4'), A)), line(pmul(poly('-2'), A))], idx, [{ from: ['g'], to: ['f'] }]),
    })
  },
  // volume of a box: V = l w h; params l (x or 2x), w, a, b: length lx, width w, height ax - b
  box: (no, [l, w, a, b]) => {
    const V = pmul(pmul(poly(withX(l)), poly(`${w}`)), poly(`${a}x-${b}`))
    const fig = statement(drawFigure('cuboid', [withX(l), 'h', `${w}`]), `$\\text{Volume} = ${line(V)}$. Determine the height.`)
    return sidesItem(no, V, withX(l), `${w}`, fig, FORMULA('h', 'h = \\frac{V}{l \\times w}', ['h = V \\times l \\times w', 'h = V - l - w', 'h = \\frac{l \\times w}{V}'], 'V &= l \\times w \\times h \\\\ h &= \\frac{V}{l \\times w}'))
  },
  // 6: the perimeter of a square is 4 sides; params a, b, c: side ax^2 + bx + c
  sq: (no, [a, b, c]) => {
    const side = `${a}x^2${b < 0 ? '-' : '+'}${Math.abs(b)}x${c < 0 ? '-' : '+'}${Math.abs(c)}`
    const per = pmul(poly('4'), poly(side))
    const fig = statement('', `The perimeter of a square is $(${line(per)})$ meters. Find the length of each side.`)
    return divItem(no, { num: per, den: poly('4')[0] }, fig, FORMULA('s', 's = \\frac{P}{4}', ['s = 4P', 's = P - 4', 's = \\frac{4}{P}'], 'P &= 4 \\times s \\\\ s &= \\frac{P}{4}'), 'A square has 4 equal sides. How do you find one side from the perimeter P?')
  },
  // 7: the area of a parallelogram; params m, a, b: base mx, height ax - b
  par: (no, [m, a, b]) => {
    const base = withX(m)
    const A = pmul(poly(base), poly(`${a}x-${b}`))
    const fig = statement(drawFigure('parH', [base, 'h']), `The area of a parallelogram is $(${line(A)})$ square metres. If its base is $${base}$ meters, what is its height?`)
    return divItem(no, { num: A, den: poly(base)[0] }, fig, FORMULA('h', 'h = \\frac{A}{b}', ['h = A \\times b', 'h = A - b', 'h = \\frac{b}{A}'], 'A &= b \\times h \\\\ h &= \\frac{A}{b}'), 'The area of a parallelogram is base × height. How do you find the height?')
  },
  // 8: the volume of a pool; params w, n, a, b: width wx, height n, length ax - b
  pool: (no, [w, n, a, b]) => {
    const V = pmul(pmul(poly(withX(w)), poly(`${n}`)), poly(`${a}x-${b}`))
    const fig = statement(drawFigure('cuboid', [withX(w), `${n}`, 'l']), `The volume of a rectangular solid shaped swimming pool is $(${line(V)})$ cubic metres. If its width is $${withX(w)}$ m, and its height is $${n}$ m, determine its length.`)
    return sidesItem(no, V, withX(w), `${n}`, fig, FORMULA('l', 'l = \\frac{V}{w \\times h}', ['l = V \\times w \\times h', 'l = V - w - h', 'l = \\frac{w \\times h}{V}'], 'V &= l \\times w \\times h \\\\ l &= \\frac{V}{w \\times h}'))
  },
}
// the two known sides are multiplied first: "x · 3" becomes 3x
function sidesItem(no: string, V: P, s1: string, s2: string, fig: string, f: Formula): Item {
  const prod = pmul(poly(s1), poly(s2))[0]
  const d: Div = { num: V, den: prod }
  const [m1, m2] = [poly(s1)[0], poly(s2)[0]]
  return divItem(no, d, fig, f, 'How do you find the unknown side from the volume V?', {
    tex: frac(line(V), `${s1} \\cdot ${s2}`),
    step: (idx) => ask(['g'], [{ id: 'f', tex: texDiv(d) }], `What is $${s1} \\times ${s2}$?`, 'Multiply the numbers, then the letters.', line([prod]), [line([m1]), line([m2]), line([mk(q(m1.c[0] + m2.c[0], 1), prod.raw)])], idx, [{ from: ['g'], to: ['f'] }]),
  })
}

// ---- the pyramids (5d, 9): the divisor is a bracket ----
// params: a, b (the bracket ax - b), k1 (1/3 of the number side is k1), hNum (the height's number); in 5d the base is (ax - b) by 3k1 x and h is a number, in 9 it is 3k1 by (ax - b) and h = hNum x
function pyramid(no: string, [a, b, k1, hNum]: number[]): Item {
  const five = no === '5'
  const br = `${a}x-${b}`
  const [s1, s2] = five ? [br, withX(3 * k1)] : [`${3 * k1}`, br]
  const K = k1 * hNum
  const Vt = line(pmul(poly(withX(K)), poly(br)))
  const k1Tex = five ? withX(k1) : `${k1}`
  const ansTex = five ? `${hNum}` : withX(hNum)
  const fig = statement(drawFigure('pyramid', [s1, s2]), five ? `$\\text{Volume} = ${Vt}$. Determine the height.` : `The volume of a pyramid with a rectangular base is $(${Vt})$ cubic metres. If the width of the base is $${3 * k1}$ m and the length is $(${br})$ m, determine the height.`)
  const wrongAns = five ? [withX(hNum), withX(K), `${K}`, `${hNum + 1}`] : [`${hNum}`, withX(K), `${K}`, withX(hNum + 1)]
  return {
    key: `${Vt}|${s1}|${s2}`,
    figure: fig,
    choices: (idx) => pick(ansTex, wrongAns, idx),
    lesson: (key, idx) => {
      const fac = `${withX(K)}(${br})`
      const known = five ? s2 : s1 // the number or monomial that 1/3 multiplies
      const steps: Step[] = [
        ask(['t0'], [{ id: 't1', tex: `${Vt} = \\frac{1}{3}(${s1})(${s2})\\,h` }], 'What is the volume of a pyramid?', 'A pyramid fills one third of the box with the same base and height.', 'V = \\frac{1}{3} \\times \\text{base area} \\times h', ['V = \\text{base area} \\times h', 'V = \\frac{1}{2} \\times \\text{base area} \\times h', 'V = \\frac{1}{3} \\times \\text{base area} + h'], idx, []),
        ask(['t1'], [{ id: 't2', tex: `${Vt} = ${k1Tex}(${br})\\,h` }], `What is $\\frac{1}{3} \\times ${known}$?`, 'One third of a number: divide it by 3.', k1Tex, [five ? withX(3 * k1) : `${3 * k1}`, five ? withX(k1 + 3) : `${k1 + 3}`, five ? `\\frac{1}{${3 * k1}}x` : `\\frac{1}{${3 * k1}}`], idx + 1, [{ from: ['t1'], to: ['t2'] }]),
        ask(['t2'], [{ id: 't3', tex: `${fac} = ${k1Tex}(${br})\\,h` }], `Take the common factor out of $${Vt}$. What is it?`, 'Take out the biggest number and the letter that are in both terms: what is left is the bracket.', fac, [`${K}(${a}x^2-${b}x)`, `x(${K * a}x-${K * b})`, `${withX(K)}(${a}x+${b})`], idx + 2, [{ from: ['t2'], to: ['t3'] }]),
        ask(['t3'], [{ id: 't4', tex: `h = ${ansTex}` }], 'The same bracket is on both sides. What is $h$?', `The same bracket on both sides cancels; then divide the rest: $\\frac{${withX(K)}}{${k1Tex}}$.`, `h = ${ansTex}`, wrongAns.map((t) => `h = ${t}`).slice(0, 3), idx + 3, [{ from: ['t3'], to: ['t4'] }]),
      ]
      return { key: `pyr${no}-${key}`, label: key, source: `Grade 9, 5.4 exercise ${no}`, title: 'Height', prompt: 'Height =', figure: fig, answer: ansTex, start: [{ id: 't0', tex: '\\boxed{?}' }], steps, review: { heading: 'Dividing by a bracket', rows: [] } }
    },
  }
}

// ---- the questions: a slot = one shape with the textbook numbers and a table of other numbers ----
const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i)
const cross = (...lists: number[][]): number[][] => lists.reduce<number[][]>((acc, l) => acc.flatMap((p) => l.map((x) => [...p, x])), [[]])
const SIGNED = [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]
interface Slot {
  part: string
  shape: string
  book: number[]
  cand: number[][]
}
const SLOTS: Record<string, Slot[]> = {
  '5': [
    { part: 'a', shape: 'rect', book: [5, 2, 3], cand: cross(range(2, 9), range(1, 6), range(1, 9)) },
    { part: 'b', shape: 'tri', book: [4, 6, 3], cand: cross([2, 4, 6, 8], range(1, 7), range(1, 9)) },
    { part: 'c', shape: 'box', book: [1, 3, 6, 9], cand: cross([1, 2], range(2, 9), range(1, 7), range(1, 9)) },
    { part: 'd', shape: 'pyr', book: [6, 5, 1, 4], cand: cross(range(2, 7), range(1, 6), [1, 2, 3], range(2, 6)).filter(([a, b]) => gcd(a, b) === 1) },
  ],
  '6': [{ part: 'a', shape: 'sq', book: [2, 1, -4], cand: cross(range(1, 5), SIGNED, [...SIGNED, ...range(6, 9), ...range(-9, -6)]) }],
  '7': [{ part: 'a', shape: 'par', book: [3, 4, 2], cand: cross(range(2, 9), range(1, 6), range(1, 9)) }],
  '8': [{ part: 'a', shape: 'pool', book: [3, 2, 16, 4], cand: cross(range(2, 5), range(2, 4), range(2, 16), range(1, 9)) }],
  '9': [{ part: 'a', shape: 'pyr', book: [3, 1, 2, 2], cand: cross(range(2, 7), range(1, 6), [1, 2, 3, 4], range(2, 6)).filter(([a, b]) => gcd(a, b) === 1) }],
}
// a stable shuffle (the same table every page load; the quiz then draws one at random from the bank)
const shuffled = <T,>(a: T[], seed: number): T[] => {
  let s = seed
  const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32)
  return [...a].sort(() => r() - 0.5)
}

function build(no: string): Exercise {
  const questions: Question[] = SLOTS[no].map((slot, idx): Question => {
    const item = (p: number[]) => (slot.shape === 'pyr' ? pyramid(no, p) : SHAPES[slot.shape](no, p))
    const make = (p: number[], key: string, k: number): Practice => {
      const it = item(p)
      const [choices, correct] = it.choices(idx + k)
      return { figure: it.figure, tex: it.key, choices, correct, why: '', lesson: () => it.lesson(key, idx + k) }
    }
    const seen = new Set([item(slot.book).key])
    const bank = shuffled(slot.cand, Number(no) * 10 + idx).filter((p) => !seen.has(item(p).key) && !!seen.add(item(p).key)).slice(0, 10)
    return { part: slot.part, ...make(slot.book, slot.part, 0), practice: bank.map((p, k) => make(p, `${slot.part}${k + 1}`, k + 1)) }
  })
  return { no: Number(no), sec: '5.4', prompt: no === '5' ? 'Determine the height.' : 'Solve the problem.', mathChoices: true, questions }
}

// textbook 6, 7, 8 and 9 are one exercise here: the square (a), the parallelogram (b), the swimming pool (c) and the pyramid (d)
const PROBLEMS = ['6', '7', '8', '9'].map(build)
export const EX_WORD54 = [build('5'), { ...PROBLEMS[0], questions: PROBLEMS.flatMap((e) => e.questions).map((q, i) => ({ ...q, part: 'abcd'[i] })) }]
