// Two exercises built from the curves in curves.mjs, with the same kinds of graph as the textbook:
//   domainRangeParts: Math 10 3.1 exercise 10 (determine the domain and range from a graph), parts a-p = the 16 graphs of the textbook (line, discrete points, parabola, hyperbola,
//     circle, exponential, bell curve, 1/x^2 with an arch, flat-ended line, horizontal line, broken line with open / closed ends, sine, open semicircle, half parabola with flat ends,
//     closed / open semicircle, two quarter circles); the options are four "Domain: ...; Range: ..." answers.
//   vltParts: Math 10 3.2 exercise 6 (vertical line test), parts a-f = the 6 graphs of the textbook; the options are only Yes and No.
// Imported by: export-bank.mjs.
import { BBOX, MAKERS, answerText, wrongOptions } from './curves.mjs'
const BS = String.fromCharCode(92)
const M = (x) => BS + '(' + x + BS + ')'

const rng = (hash, seed) => {
  let n = 0
  return (lo, hi) => lo + ((hash(`${seed}#${n++}`) >>> 9) % (hi - lo + 1)) // the high bits of the hash: the low ones hardly change between seeds
}
const fig = (els) => ({ bbox: BBOX, elements: els })

export function domainRangeParts(hash) {
  const KINDS = [
    ['a', 'line'], ['b', 'discrete'], ['c', 'parabola'], ['d', 'hyperbola'], ['e', 'circle'], ['f', 'exp'], ['g', 'bell'], ['h', 'recip2'],
    ['i', 'flat'], ['j', 'hline'], ['k', 'poly'], ['l', 'sine'], ['m', 'halfcircle'], ['n', 'parabolaflat'], ['o', 'semicircle'], ['p', 'quarters'],
  ]
  return KINDS.map(([p, kind]) => {
    const qs = []
    const seen = new Set()
    for (let i = 0; qs.length < 10 && i < 200; i++) {
      const seed = `dr${p}${i}`
      const r = rng(hash, seed)
      const o = kind === 'parabola' ? { down: r(0, 3) === 0 } : {}
      const g = MAKERS[kind](r, o)
      if (!g) continue
      const key = JSON.stringify(g.els)
      if (seen.has(key)) continue
      seen.add(key)
      const opts = wrongOptions(g.dom, g.rng, hash, seed)
      if (opts.length < 3) continue
      qs.push({
        q: 'Use the graph to determine the domain and range.',
        a: answerText(g.dom, g.rng), d: opts,
        s: `The domain is every ${M('x')}-value the graph covers (left to right), the range every ${M('y')}-value (bottom to top). A filled dot is included, an open dot is not, an arrow means the graph goes on. ${answerText(g.dom, g.rng)}.`,
        l: qs.length < 5 ? 1 : 2,
        f: fig(g.els),
      })
    }
    return { p, qs }
  })
}

export function vltParts(hash) {
  // [part, [[maker, options] ...]]: the graphs of the part; every other question uses the next kind
  const PLAN = [
    ['a', [['parabola', {}], ['parabola', { down: true }], ['parabola', { side: true }], ['parabola', {}], ['parabola', { side: true, down: true }]]],
    ['b', [['hyperbola', {}], ['recip2', { side: true }], ['hyperbola', {}], ['recip2', { side: true }]]],
    ['c', [['circle', {}], ['ellipse', {}], ['semicircle', {}], ['circle', {}], ['ellipse', {}]]],
    ['d', [['exp', {}], ['ellipse', {}], ['exp', {}], ['circle', {}]]],
    ['e', [['bell', {}], ['bell', { side: true }], ['bell', {}], ['bell', { side: true }]]],
    ['f', [['recip2', {}], ['recip2', { side: true }], ['recip2', {}], ['recip2', { side: true }]]],
  ]
  return PLAN.map(([p, plan]) => {
    const qs = []
    const seen = new Set()
    for (let i = 0; qs.length < 10 && i < 200; i++) {
      const seed = `vlt${p}${i}`
      const [kind, o] = plan[i % plan.length]
      const g = MAKERS[kind](rng(hash, seed), o)
      if (!g) continue
      const key = JSON.stringify(g.els)
      if (seen.has(key)) continue
      seen.add(key)
      const yes = g.fnOk
      qs.push({
        q: 'Apply the vertical line test to the relation shown in the graph. Is the relation a function?',
        a: yes ? 'Yes' : 'No', d: [yes ? 'No' : 'Yes'],
        s: yes ? 'Every vertical line crosses the graph at most once, so each input has exactly one output: the relation is a function.' : 'A vertical line can cross the graph at two points (one input, two outputs), so the relation is not a function.',
        l: qs.length < 5 ? 1 : 2,
        f: fig(g.els),
      })
    }
    return { p, qs }
  })
}
