// Grade 9 1.1 The Real Number System (mineru G9 Chapter 1): exercise 1 (true / false) is left out.
//   2 state all the sets a number belongs to (Natural, Whole, Integer, Rational, Irrational, Real): every set is an option, tick any number of them, then Submit
//   3 tick the numbers of a given set that belong to one kind of number (the book's set was lost in the scan: the numbers are made here), then Submit
// The 10 similar questions of every question are other numbers of the same kind; every answer is computed from the kind of the number.
// Lessons are blanks (built with lessonWp). Imported by: quiz.tsx, check11.ts. Shape: exercise.ts.
import type { Wp } from './ineq64-data'
import { build, rng, uniq } from './graph42-data'
import type { It } from './graph42-data'
import { blk, shuffled, text } from './seq41-data'

type Kind = 'int' | 'frac' | 'irr' | 'nonreal'
interface Num {
  tex: string
  kind: Kind
  v?: number // the value of an integer (also when it is written as a root)
}
const N = (tex: string, kind: Kind, v?: number): Num => ({ tex, kind, v })
const SETS = ['Natural', 'Whole', 'Integer', 'Rational', 'Irrational', 'Real']
// the indices of SETS a number belongs to
const membership = (n: Num): number[] => {
  if (n.kind === 'nonreal') return []
  if (n.kind === 'irr') return [4, 5]
  if (n.kind === 'frac') return [3, 5]
  const v = n.v!
  return [...(v >= 1 ? [0] : []), ...(v >= 0 ? [1] : []), 2, 3, 5]
}
// the examples of every kind of number (the lesson shows them above the working; the questions ask which examples a number looks like)
const EXAMPLES = [
  '1,\\ 2,\\ 3,\\ \\ldots',
  '0,\\ 1,\\ 2,\\ 3,\\ \\ldots',
  '\\ldots,\\ -3,\\ -2,\\ -1,\\ 0,\\ 1,\\ 2,\\ 3,\\ \\ldots',
  '-3,\\ 0,\\ 5,\\ -\\frac{2}{3},\\ \\frac{10}{7},\\ 2.35,\\ -2.\\overline{35},\\ \\sqrt{4},\\ -\\sqrt{9},\\ \\sqrt{\\frac{9}{16}}',
  '\\sqrt{2},\\ \\pi,\\ 1.62789\\ldots',
]
const REFERENCE = [
  { label: 'Natural numbers', tex: `\\{${EXAMPLES[0]}\\}` },
  { label: 'Whole numbers', tex: `\\{${EXAMPLES[1]}\\}` },
  { label: 'Integers', tex: `\\{${EXAMPLES[2]}\\}` },
  { label: 'Rational numbers', tex: EXAMPLES[3] },
  { label: 'Irrational numbers', tex: EXAMPLES[4] },
  { label: 'Real numbers', tex: '\\text{Rational} + \\text{Irrational}' },
]
// the list of examples a number looks like: the shortest list that holds a number of its kind
const setTex = (idx: number[]) => (idx.length ? `\\text{${idx.map((i) => SETS[i]).join(', ')}}` : '\\text{none}')

// ================= exercise 2: all the sets of one number =================
const HINT2: Record<string, string> = {
  pos: 'A counting number is natural, whole, an integer, rational and real.',
  zero: 'Zero is whole, an integer, rational and real, but not natural.',
  neg: 'A negative integer is an integer, rational and real, but not whole or natural.',
  frac: 'A fraction or a decimal that stops or repeats is rational and real, but not an integer.',
  irr: 'A decimal that never stops or repeats is irrational and real, and not rational.',
  nonreal: 'The square root of a negative number is not a real number: it belongs to none of the sets.',
}
function mk2(n: Num, key: string): It {
  const idx = membership(n)
  const ans = setTex(idx)
  const wrong = uniq(
    [...SETS.keys()].map((i) => setTex(idx.includes(i) ? idx.filter((j) => j !== i) : [...idx, i].sort((a, b) => a - b))).filter((s) => s !== ans),
    (s) => s,
  )
  const pre = n.tex.includes('\\sqrt') && n.kind === 'int' ? `${n.tex} = ${n.v}\\text{: }` : ''
  const hint = n.kind === 'int' ? (n.v! >= 1 ? HINT2.pos : n.v === 0 ? HINT2.zero : HINT2.neg) : HINT2[n.kind]
  const w: Wp = {
    tex: `${text('State all the sets the number belongs to: ')}${n.tex}`,
    short: n.tex,
    key,
    answer: ans,
    wrong,
    steps: [
      ...SETS.map((s, i) => {
        const yes = idx.includes(i)
        return { label: `Is it ${s.toLowerCase()}?`, noArrow: true, toks: [{ id: `q${i}a`, tex: `${pre}\\text{is it ${s.toLowerCase()}?}` }, { id: `q${i}b`, tex: yes ? '\\text{Yes}' : '\\text{No}' }], blanks: [blk(`q${i}b`, 's0', `$\\text{Is } ${n.tex} \\text{ ${s.toLowerCase()}?}$`, [yes ? '\\text{No}' : '\\text{Yes}'], `Look at the examples above. ${hint}`)] }
      }),
      { label: 'All its sets.', noArrow: true, toks: [{ id: 'k2a', tex: `${pre}\\text{it belongs to}` }, { id: 'k2b', tex: ans }], blanks: [blk('k2b', 's0', `$\\text{Which sets contain } ${n.tex}\\text{?}$`, wrong, hint)] },
    ],
    reference: REFERENCE,
  }
  return { w, multi: { options: SETS.map((s) => `\\text{${s}}`), right: idx } }
}
const id2 = (n: Num) => n.tex
const P2: [string, Num, Num[]][] = [
  ['a', N('5', 'int', 5), [N('3', 'int', 3), N('12', 'int', 12), N('9', 'int', 9), N('20', 'int', 20), N('\\sqrt{16}', 'int', 4), N('\\sqrt{25}', 'int', 5), N('8', 'int', 8), N('15', 'int', 15), N('\\sqrt{36}', 'int', 6), N('7', 'int', 7), N('42', 'int', 42)]],
  ['b', N('-5', 'int', -5), [N('-3', 'int', -3), N('-8', 'int', -8), N('-12', 'int', -12), N('-\\sqrt{9}', 'int', -3), N('-\\sqrt{25}', 'int', -5), N('-15', 'int', -15), N('-1', 'int', -1), N('-20', 'int', -20), N('-7', 'int', -7), N('0', 'int', 0), N('-\\sqrt{16}', 'int', -4)]],
  ['c', N('-\\frac{2}{3}', 'frac'), [N('\\frac{3}{4}', 'frac'), N('-\\frac{5}{7}', 'frac'), N('\\frac{1}{2}', 'frac'), N('-\\frac{4}{9}', 'frac'), N('\\frac{7}{3}', 'frac'), N('2.35', 'frac'), N('-0.6', 'frac'), N('\\frac{10}{7}', 'frac'), N('-3.8', 'frac'), N('\\sqrt{\\frac{9}{16}}', 'frac'), N('\\frac{5}{8}', 'frac')]],
  ['d', N('\\sqrt{10}', 'irr'), [N('\\sqrt{5}', 'irr'), N('\\sqrt{7}', 'irr'), N('\\sqrt{11}', 'irr'), N('\\sqrt{13}', 'irr'), N('\\sqrt{2}', 'irr'), N('\\sqrt{3}', 'irr'), N('\\sqrt{17}', 'irr'), N('\\sqrt{20}', 'irr'), N('-\\sqrt{6}', 'irr'), N('\\sqrt{15}', 'irr'), N('\\sqrt{30}', 'irr')]],
  ['e', N('\\sqrt{-2}', 'nonreal'), [N('\\sqrt{-3}', 'nonreal'), N('\\sqrt{-5}', 'nonreal'), N('\\sqrt{-7}', 'nonreal'), N('\\sqrt{-10}', 'nonreal'), N('\\sqrt{-4}', 'nonreal'), N('\\sqrt{-9}', 'nonreal'), N('\\sqrt{-1}', 'nonreal'), N('\\sqrt{-11}', 'nonreal'), N('\\sqrt{-6}', 'nonreal'), N('\\sqrt{-13}', 'nonreal'), N('\\sqrt{-15}', 'nonreal')]],
  ['f', N('\\pi', 'irr'), [N('2\\pi', 'irr'), N('-\\pi', 'irr'), N('\\frac{\\pi}{2}', 'irr'), N('3\\pi', 'irr'), N('\\pi + 1', 'irr'), N('1.62789\\ldots', 'irr'), N('2.71828\\ldots', 'irr'), N('0.1010010001\\ldots', 'irr'), N('4\\pi', 'irr'), N('-2\\pi', 'irr'), N('5.2718\\ldots', 'irr')]],
  ['g', N('0.\\overline{1738}', 'frac'), [N('0.\\overline{27}', 'frac'), N('0.\\overline{5}', 'frac'), N('1.\\overline{34}', 'frac'), N('0.\\overline{416}', 'frac'), N('2.\\overline{3}', 'frac'), N('-0.\\overline{7}', 'frac'), N('3.\\overline{18}', 'frac'), N('0.\\overline{06}', 'frac'), N('-1.\\overline{25}', 'frac'), N('4.\\overline{9}', 'frac'), N('0.\\overline{142857}', 'frac')]],
]

// ================= exercise 3: the numbers of a set that belong to one kind of number =================
const KINDS3: [string, number, string, string][] = [
  ['Natural numbers', 0, '\\{1,\\ 2,\\ 3,\\ \\ldots\\}', 'The natural numbers are the counting numbers: 1, 2, 3, ...'],
  ['Whole numbers', 1, '\\{0,\\ 1,\\ 2,\\ 3,\\ \\ldots\\}', 'The whole numbers are the counting numbers and 0.'],
  ['Integers', 2, '\\{\\ldots,\\ -2,\\ -1,\\ 0,\\ 1,\\ 2,\\ \\ldots\\}', 'The integers are the whole numbers and their negatives.'],
  ['Rational numbers', 3, '\\text{can be written as a fraction}', 'A rational number can be written as a fraction: integers, fractions, decimals that stop or repeat.'],
  ['Irrational numbers', 4, '\\text{never stops, never repeats}', 'An irrational number cannot be written as a fraction: its decimal never stops and never repeats.'],
]
interface S3 {
  k: number // the index in KINDS3
  nums: Num[]
}
const BANK3: Num[] = [
  N('-9', 'int', -9), N('-5', 'int', -5), N('-4', 'int', -4), N('-3', 'int', -3), N('-1', 'int', -1), N('0', 'int', 0), N('1', 'int', 1), N('2', 'int', 2), N('3', 'int', 3), N('4', 'int', 4), N('6', 'int', 6), N('7', 'int', 7), N('10', 'int', 10),
  N('\\frac{1}{2}', 'frac'), N('-\\frac{3}{4}', 'frac'), N('\\frac{5}{3}', 'frac'), N('-\\frac{2}{7}', 'frac'), N('2.5', 'frac'), N('-0.75', 'frac'), N('3.\\overline{3}', 'frac'),
  N('\\sqrt{4}', 'int', 2), N('\\sqrt{9}', 'int', 3), N('\\sqrt{16}', 'int', 4), N('-\\sqrt{25}', 'int', -5), N('\\sqrt{2}', 'irr'), N('\\sqrt{3}', 'irr'), N('\\sqrt{5}', 'irr'), N('\\sqrt{7}', 'irr'), N('\\sqrt{10}', 'irr'), N('\\pi', 'irr'), N('-\\sqrt{6}', 'irr'),
]
const inKind = (n: Num, k: number) => membership(n).includes(k)
function mk3(s: S3, key: string): It {
  const [name, k, , hint] = KINDS3[s.k]
  const right = s.nums.map((n, i) => (inKind(n, k) ? i : -1)).filter((i) => i >= 0)
  const list = (idx: number[]) => (idx.length ? idx.map((i) => s.nums[i].tex).join(',\\ ') : '\\text{none}')
  const ans = list(right)
  const wrong = uniq(
    s.nums.map((_, i) => list(right.includes(i) ? right.filter((j) => j !== i) : [...right, i].sort((a, b) => a - b))).filter((t) => t !== ans),
    (t) => t,
  )
  const setT = `\\left\\{${s.nums.map((n) => n.tex).join(',\\ ')}\\right\\}`
  const w: Wp = {
    tex: `${text(`List the numbers in the set that are ${name.toLowerCase()}: `)}${setT}`,
    short: setT,
    key,
    answer: ans,
    wrong,
    steps: [
      ...s.nums.map((n, i) => {
        const yes = right.includes(i)
        const one = name.toLowerCase().replace(/ numbers$/, '').replace(/s$/, '')
        const shown = n.tex.includes('\\sqrt') && n.kind === 'int' ? `${n.tex} = ${n.v}` : n.tex
        return { label: `Is ${n.tex} ${one}?`, noArrow: true, toks: [{ id: `n${i}a`, tex: `${shown}\\text{: is it ${one}?}` }, { id: `n${i}b`, tex: yes ? '\\text{Yes}' : '\\text{No}' }], blanks: [blk(`n${i}b`, 's0', `$\\text{Is } ${n.tex} \\text{ ${one}?}$`, [yes ? '\\text{No}' : '\\text{Yes}'], `Look at the examples above. ${hint}`)] }
      }),
      { label: 'The numbers of the set.', noArrow: true, toks: [{ id: 'd2a', tex: `\\text{${name}:}` }, { id: 'd2b', tex: ans }], blanks: [blk('d2b', 's0', `$\\text{Which numbers of the set are ${name.toLowerCase()}?}$`, wrong, hint)] },
    ],
    reference: REFERENCE,
  }
  return { w, multi: { options: s.nums.map((n) => n.tex), right } }
}
const BASE3: Num[] = [N('-4', 'int', -4), N('0', 'int', 0), N('3', 'int', 3), N('2.5', 'frac'), N('\\sqrt{16}', 'int', 4), N('\\sqrt{7}', 'irr'), N('-\\frac{2}{3}', 'frac'), N('\\pi', 'irr')]
const id3 = (s: S3) => `${s.k}|${s.nums.map((n) => n.tex).join(',')}`
// other sets of 8 numbers: at least one and at most five of them belong to the kind
const pool3 = (k: number, seed: number): S3[] => {
  const r = rng(seed)
  const out: S3[] = []
  for (let tries = 0; out.length < 14 && tries < 400; tries++) {
    const nums = shuffled(BANK3, Math.floor(r() * 1e6)).slice(0, 8)
    const c = nums.filter((n) => inKind(n, k)).length
    if (c >= 1 && c <= 5) out.push({ k, nums })
  }
  return out
}
const P3: [string, S3, S3[]][] = KINDS3.map(([, k], i) => [String.fromCharCode(97 + i), { k, nums: BASE3 }, pool3(k, 1100 + i)])

export const EX_REAL11 = [
  build(2, 'Tick all the sets.', P2, mk2, id2, 'Sets of numbers', 11200, '1.1'),
  build(3, 'Tick the numbers.', P3, mk3, id3, 'Numbers of a set', 11300, '1.1'),
]

// ================= challenge exercises (1.1 exercises 2 and 3, harder): numbers in disguise (a fraction that is an integer, a root of a fraction), bigger sets of 12 numbers; optional extra practice, own progress (no 12, 13) =================
const ni = (tex: string, v: number) => N(tex, 'int', v)
const fi = (a: number, b: number) => ni(`${a < 0 ? '-' : ''}\\frac{${Math.abs(a) * b}}{${b}}`, a)
const cps = (n: number, d: number) => N(`\\sqrt{\\frac{${n}}{${d}}}`, Number.isInteger(Math.sqrt(n)) && Number.isInteger(Math.sqrt(d)) ? 'frac' : 'irr')
const H2: [string, Num, Num[]][] = [
  ['a', fi(4, 3), [fi(5, 2), fi(-6, 3), fi(7, 4), fi(-3, 5), fi(8, 7), fi(9, 2), fi(-2, 9), fi(12, 3), fi(-10, 4), fi(11, 5), fi(6, 8), fi(-9, 6), fi(15, 3), fi(20, 4)]],
  ['b', ni('\\sqrt{144}', 12), [ni('\\sqrt{81}', 9), ni('-\\sqrt{100}', -10), ni('\\sqrt{169}', 13), ni('-\\sqrt{49}', -7), ni('\\sqrt{225}', 15), ni('-\\sqrt{196}', -14), ni('\\sqrt{121}', 11), ni('-\\sqrt{64}', -8), ni('\\sqrt{256}', 16), ni('\\sqrt{400}', 20), ni('-\\sqrt{289}', -17), ni('\\sqrt{324}', 18), ni('\\sqrt{361}', 19), ni('-\\sqrt{36}', -6)]],
  ['c', cps(4, 9), [cps(9, 16), cps(1, 4), cps(1, 2), cps(2, 9), cps(25, 36), cps(3, 4), cps(16, 25), cps(5, 9), cps(1, 9), cps(49, 64), cps(7, 16), cps(81, 100), cps(1, 3), cps(36, 49)]],
  ['d', N('0.\\overline{7}', 'frac'), [N('3.14', 'frac'), N('\\pi - 1', 'irr'), N('0.12122122212\\ldots', 'irr'), N('-0.\\overline{45}', 'frac'), N('2\\sqrt{3}', 'irr'), N('\\frac{\\pi}{3}', 'irr'), N('1.\\overline{09}', 'frac'), N('-3\\sqrt{2}', 'irr'), N('0.875', 'frac'), N('5.020020002\\ldots', 'irr'), N('-\\sqrt{2} + 1', 'irr'), N('0.\\overline{123}', 'frac'), N('4\\pi', 'irr'), N('-1.5', 'frac')]],
]
const BANK3H: Num[] = [
  ...[-12, -8, -6, -2, 0, 5, 9, 11, 14].map((v) => ni(String(v), v)), fi(4, 2), fi(-9, 3), fi(10, 5), ni('\\sqrt{49}', 7), ni('\\sqrt{100}', 10), ni('-\\sqrt{81}', -9), ni('\\sqrt{0}', 0),
  N('\\frac{7}{3}', 'frac'), N('-\\frac{5}{8}', 'frac'), N('0.\\overline{6}', 'frac'), N('-1.25', 'frac'), N('\\frac{11}{4}', 'frac'), N('3.\\overline{18}', 'frac'),
  N('\\sqrt{6}', 'irr'), N('\\sqrt{15}', 'irr'), N('-\\sqrt{8}', 'irr'), N('\\pi', 'irr'), N('2\\pi', 'irr'), N('1.01001000100001\\ldots', 'irr'), N('\\sqrt{\\frac{1}{2}}', 'irr'),
]
const pool3h = (k: number, seed: number): S3[] => {
  const r = rng(seed)
  const out: S3[] = []
  for (let tries = 0; out.length < 14 && tries < 600; tries++) {
    const nums = shuffled(BANK3H, Math.floor(r() * 1e6)).slice(0, 12)
    const c = nums.filter((n) => inKind(n, k)).length
    if (c >= 2 && c <= 8) out.push({ k, nums })
  }
  return out
}
const P3H: [string, S3, S3[]][] = KINDS3.map(([, k], i) => [String.fromCharCode(97 + i), pool3h(k, 2600 + i)[0], pool3h(k, 2100 + i)])
export const EX_REAL11H = [
  build(12, 'Tick all the sets.', H2, mk2, id2, 'Sets of numbers (challenge)', 11212, '1.1'),
  build(13, 'Tick the numbers.', P3H, mk3, id3, 'Numbers of a set (challenge)', 11313, '1.1'),
]
