// Grade 9 5.3 exercises 6 (the area of a triangle, parallelogram, trapezoid, rhombus) and 7 (the volume of a box) (bank/G9-ch5/s3/items.json).
// The lesson: the formula, the small steps before the multiplication (sum of the parallel sides, one half), then the same "multiply every term of the bracket" lesson as 5.3 exercises 2 and 3.
// The lengths of the 10 similar questions are written by Gemini (gen-variants-53geo.py, variants53geo.json); this file checks them and computes every answer.
// Imported by: quiz.tsx. Shape: exercise.ts, figures: geo-figures.ts, the multiplication lesson: mult-data.ts.
import type { Exercise, Practice, Question } from './exercise'
import type { Step, Tok } from './lessons'
import GEO from './variants53geo.json'
import { drawFigure } from './geo-figures'
import { lessonDist, splitSteps } from './mult-data'
import type { Dist, Pre } from './mult-data'
import { finalChoices, mk, parseSafe, pick, polyTex, q, simplified, simpTex, termTex, topTen, varTex } from './simplify-data'
import type { Mono, Q } from './simplify-data'

type P = Mono[]
const qmul = (a: Q, b: Q): Q => q(a[0] * b[0], a[1] * b[1], !!(a[2] || b[2]))
const norm = (ms: P): P => simplified(ms).map((t) => mk(t.c, varTex(t.vs)))
const padd = (a: P, b: P): P => norm([...a, ...b])
const pmul = (a: P, b: P): P => norm(a.flatMap((x) => b.map((y) => mk(qmul(x.c, y.c), x.raw + y.raw))))
const half = (a: P): P => a.map((m) => mk(qmul(m.c, q(1, 2)), m.raw))
const twice = (a: P): P => a.map((m) => mk(qmul(m.c, q(2)), m.raw))
const even = (a: P) => a.every((m) => m.c[1] === 1 && m.c[0] % 2 === 0)
const line = (v: P) => polyTex(v.map((m) => ({ c: m.c, v: m.raw })))
const par = (p: P) => (p.length > 1 ? `(${line(p)})` : line(p))
const PD = (s: string): P => {
  const ms = parseSafe(s)
  if (!ms) throw new Error(`bad length ${s}`)
  return ms
}
const evalP = (a: P) => a.reduce((s, m) => s + (m.c[0] / m.c[1]) * m.vs.reduce((p, [, e]) => p * 10 ** e, 1), 0)
const single = (p: P) => p.length === 1
const HALF = '\\tfrac{1}{2}'

// a step that asks one question; `arrows` go from the highlighted tokens to the new ones
export function ask(focus: string[], results: Tok[], prompt: string, hint: string, right: string, wrong: string[], idx: number, arrows?: Step['arrows'], example?: string): Step {
  const [options, correct] = pick(right, wrong, idx)
  return {
    from: 'each',
    focus,
    result: results[0],
    results,
    ...(arrows ? { arrows: arrows.flatMap((a) => a.from.map((f) => ({ from: [f], to: a.to }))) } : {}), // one arrow from each highlighted token
    say: '',
    calcPrompt: prompt,
    calc: { q: prompt, options, correct, hints: options.map((_, i) => (i === correct ? '' : hint)), spell: hint, ...(example ? { example } : {}) },
  }
}
// "What is 2x × x?": the product of two monomials; the usual slips are the sign, adding instead of multiplying, a wrong exponent
function productStep(focus: string[], x: P, y: P, id: string, idx: number): Step {
  const prod = pmul(x, y)
  const wrongs = [...finalChoices(prod, 0)[0], termTex(prod[0].c, prod[0].raw + (prod[0].vs[0]?.[0] ?? ''), false)]
  const st = ask(focus, [{ id, tex: line(prod) }], `What is $${par(x)} \\times ${par(y)}$?`, 'Multiply the numbers, then add the exponents of the letters.', line(prod), wrongs, idx, [{ from: focus, to: [id] }])
  return single(x) && single(y) && x[0].vs.length && y[0].vs.length ? { ...st, split: splitSteps(focus, x[0], y[0], { id, tex: line(prod) }, id, false, idx).map((s) => ({ ...s, from: 'each' as const })) } : st
}

// ---- exercise 6: areas ----
interface Area {
  name: string
  formula: string // the area formula as TeX, the right answer of the first question
  formulaWrong: string[]
  tokens: Tok[] // the line after the formula step
  steps: (idx: number) => Step[] // the steps that lead to the tokens a (monomial) and b (bracket)
  final: Dist
  halved: boolean // the area has a factor 1/2: the usual wrong answer is the unhalved product
}

function area(kind: string, d: P[]): Area | null {
  const tok = (id: string, p: P): Tok => ({ id, tex: id === 'a' ? line(p) : `(${line(p)})` })
  if (kind === 'parH') {
    const [base, height] = d
    const [m, b] = single(base) ? [base, height] : [height, base]
    if (!single(m) || single(b)) return null
    return { name: 'parallelogram', formula: 'bh', formulaWrong: [`${HALF}bh`, 'b+h', '2(b+h)'], tokens: [tok(single(base) ? 'a' : 'b', base), tok(single(base) ? 'b' : 'a', height)], steps: () => [], final: { a: m[0], b }, halved: false }
  }
  if (kind === 'triH' || kind === 'rhombus') {
    const [x, y] = d
    const [m, b] = single(x) ? [x, y] : [y, x]
    if (!single(m) || single(b)) return null
    const target: 'a' | 'b' | null = even(m) ? 'a' : even(b) ? 'b' : null
    if (!target) return null
    const [ma, bb] = target === 'a' ? [half(m), b] : [m, half(b)]
    const src = target === 'a' ? m : b
    const out = target === 'a' ? ma : bb
    return {
      name: kind === 'triH' ? 'triangle' : 'rhombus',
      formula: kind === 'triH' ? `${HALF}bh` : `${HALF}d_1 d_2`,
      formulaWrong: kind === 'triH' ? ['bh', `${HALF}(b+h)`, 'b+h'] : ['d_1 d_2', `${HALF}(d_1+d_2)`, 'd_1+d_2'],
      tokens: [{ id: 'h1', tex: HALF }, tok(single(x) ? 'a' : 'b', x), tok(single(x) ? 'b' : 'a', y)],
      steps: (i) => [ask(['h1', target], [{ id: target, tex: target === 'a' ? line(out) : `(${line(out)})` }], `What is $${HALF} \\times ${par(src)}$?`, 'Half of a polynomial: halve every term.', line(out), [line(src), line(twice(src)), line(half(half(src)))], i, [{ from: ['h1', target], to: [target] }])],
      final: { a: ma[0], b: bb },
      halved: true,
    }
  }
  // trapezoid: top, bottom, height
  const [top, bottom, height] = d
  if (!single(height)) return null
  const sum = padd(top, bottom)
  const target: 'a' | 'b' | null = even(height) ? 'a' : even(sum) ? 'b' : null
  if (!target) return null
  const [ma, sb] = target === 'a' ? [half(height), sum] : [height, half(sum)]
  if (sb.length < 2) return null
  const src = target === 'a' ? height : sum
  const res = target === 'a' ? ma : sb
  return {
    name: 'trapezoid',
    formula: `${HALF}(a+b)h`,
    formulaWrong: ['(a+b)h', `${HALF}ah+bh`, `${HALF}abh`],
    tokens: [{ id: 'h1', tex: HALF }, { id: 's', tex: `(${line(top)} + ${par(bottom)})` }, { id: 'a', tex: line(height) }],
    steps: (i) => [
      ask(['s'], [{ id: 'b', tex: `(${line(sum)})` }], `What is $${par(top)} + ${par(bottom)}$?`, 'Add the like terms of the two parallel sides.', line(sum), [line(padd(top, [mk(q(-1), '')])), line(pmul(top, bottom)), line(top)], i, [{ from: ['s'], to: ['b'] }]),
      ask(['h1', target], [{ id: target, tex: target === 'a' ? line(res) : `(${line(res)})` }], `What is $${HALF} \\times ${par(src)}$?`, 'Half of a polynomial: halve every term.', line(res), [line(src), line(twice(src)), line(half(half(src)))], i + 1, [{ from: ['h1', target], to: [target] }]),
    ],
    final: { a: ma[0], b: sb },
    halved: true,
  }
}

function areaLesson(kind: string, labels: string[], d: P[], key: string, idx: number) {
  const ar = area(kind, d)!
  const pre: Pre = {
    start: [{ id: 'f', tex: '\\boxed{\\,?\\,}' }],
    steps: [ask(['f'], ar.tokens, `What is the formula for the area of a ${ar.name}?`, 'Think of the figure: the area formula of this shape.', ar.formula, ar.formulaWrong, idx, []), ...ar.steps(idx + 1)],
    extra: { source: `Grade 9, 5.3 exercise 6${key}`, title: 'Area', prompt: 'Area =', figure: drawFigure(kind, labels), review: { heading: 'Areas', rows: [] } },
  }
  return lessonDist(ar.final, key, 6, idx, pre)
}
function areaChoices(kind: string, d: P[], idx: number): [string[], number] {
  const ar = area(kind, d)!
  const product = pmul([ar.final.a], ar.final.b)
  const alt = ar.halved ? twice(product) : half(product)
  return pick(simpTex(product), [simpTex(alt), ...finalChoices(product, 0)[0]], idx)
}
const okArea = (kind: string, d: P[]) => {
  try {
    return !!area(kind, d) && d.every((p) => evalP(p) > 0)
  } catch {
    return false
  }
}

// ---- exercise 7: volumes ----
function volumeLesson(labels: string[], d: P[], key: string, idx: number) {
  const bi = d.findIndex((p) => !single(p))
  const mi = d.map((_, i) => i).filter((i) => i !== bi)
  const ids = d.map((_, i) => (i === bi ? 'b' : `m${i}`))
  const tokens: Tok[] = d.map((p, i) => ({ id: ids[i], tex: i === bi ? `(${line(p)})` : line(p) }))
  const formula = ask(['f'], tokens, 'What is the volume of a box?', 'Volume is how much space the box fills: length times width times height.', 'l \\times w \\times h', ['l + w + h', '2(lw + lh + wh)', 'l \\times w'], idx, [])
  const extra = { source: `Grade 9, 5.3 exercise 7${key}`, title: 'Volume', prompt: 'Volume =', figure: drawFigure('cuboid', labels), review: { heading: 'Volumes', rows: [] } }
  const start: Tok[] = [{ id: 'f', tex: '\\boxed{\\,?\\,}' }]
  const [x, y] = [d[mi[0]], d[mi[1]]]
  if (bi >= 0) {
    const pre: Pre = { start, steps: [formula, productStep([ids[mi[0]], ids[mi[1]]], x, y, 'a', idx + 1)], extra }
    return lessonDist({ a: pmul(x, y)[0], b: d[bi] }, key, 7, idx, pre)
  }
  // three monomials: two products, no bracket
  const xy = pmul(x, y)
  const all = pmul(xy, d[mi[2]])
  return { key: `vol-${key}`, label: key, answer: simpTex(all), start, steps: [formula, productStep([ids[0], ids[1]], x, y, 'p1', idx + 1), productStep(['p1', ids[2]], xy, d[mi[2]], 'r', idx + 2)], review: extra.review, source: extra.source, title: extra.title, prompt: extra.prompt, figure: extra.figure }
}
function volumeChoices(d: P[], idx: number): [string[], number] {
  const all = pmul(pmul(d[0], d[1]), d[2])
  const bad = padd(padd(pmul(d[0], d[1]), pmul(d[0], d[2])), pmul(d[1], d[2]))
  return pick(simpTex(all), [simpTex(bad), ...finalChoices(all, 0)[0]], idx)
}
const okVolume = (d: P[]) => d.filter((p) => !single(p)).length <= 1 && d.every((p) => evalP(p) > 0)

// ---- the questions ----
interface Slot {
  kind: string
  dims: string[] // the lengths of the textbook question, in the order of the labels of the figure
}
const SLOTS: Record<string, Record<string, Slot>> = {
  '6': { a: { kind: 'triH', dims: ['4x-2', '3x'] }, b: { kind: 'parH', dims: ['5x', '2x-1'] }, c: { kind: 'trapH', dims: ['3x', '5x+2', '2x'] }, d: { kind: 'rhombus', dims: ['12x', '8x-2'] } },
  '7': { a: { kind: 'cuboid', dims: ['2x', '2x', '2x'] }, b: { kind: 'cuboid', dims: ['x', 'x', '2x-1'] }, c: { kind: 'cuboid', dims: ['2x', 'x', '3x-1'] }, d: { kind: 'cuboid', dims: ['4x', 'x', '4x-1'] } },
}
function build(no: string): Exercise {
  const questions: Question[] = Object.entries(SLOTS[no]).map(([part, slot], idx): Question => {
    const ok = (d: P[]) => (no === '6' ? okArea(slot.kind, d) : okVolume(d))
    const make = (d: P[], key: string, k: number): Practice => {
      const labels = d.map(line)
      const [choices, correct] = no === '6' ? areaChoices(slot.kind, d, idx + k) : volumeChoices(d, idx + k)
      return {
        tex: labels.join(' ; '),
        figure: drawFigure(slot.kind, labels),
        choices,
        correct,
        why: '',
        lesson: () => (no === '6' ? areaLesson(slot.kind, labels, d, key, idx + k) : volumeLesson(labels, d, key, idx + k)),
      }
    }
    const rows = ((GEO as Record<string, Record<string, unknown[]>>)[no]?.[part] ?? [])
      .map((r) => (Array.isArray(r) && r.length === slot.dims.length ? r.map((s) => parseSafe(s)) : null))
      .filter((r): r is P[] => !!r && r.every(Boolean))
      .filter(ok)
    const book = slot.dims.map(PD)
    const bank = topTen(rows, [], (d) => d.map(line).join(' ; '), book)
    return { ...make(book, part, 0), part, practice: bank.map((d, k) => make(d, `${part}${k + 1}`, k + 1)) }
  })
  return { no: Number(no), sec: '5.3', prompt: no === '6' ? 'Find the area. Simplify.' : 'Find the volume. Simplify.', mathChoices: true, questions }
}

export const EX_GEO53B = ['6', '7'].map(build)
