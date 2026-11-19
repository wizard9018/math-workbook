// G8 3.6 exercise 1 (identify angle pairs): a figure of two parallel lines and a transversal with the eight angles numbered 1-8; two of them are
// marked, and the question is what kind of angle pair they are (vertically opposite, corresponding, alternate interior, co-interior ...).
// Made here from the geometry (no Gemini): the right answer is computed from the numbers of the two angles.
// Imported by: export-bank.mjs.
const BS = String.fromCharCode(92)
const M = (x) => BS + '(' + x + BS + ')'

// the angles at the top crossing: 1 upper-left, 2 upper-right, 3 lower-left, 4 lower-right; at the bottom crossing 5, 6, 7, 8 in the same places
// (between the two lines: 3, 4, 5, 6)
const KINDS = {
  vertical: { name: 'Vertically opposite angles', pairs: [[1, 4], [2, 3], [5, 8], [6, 7]], why: (a, b) => `${M(BS + 'angle ' + a)} and ${M(BS + 'angle ' + b)} are opposite each other where two lines cross, so they are vertically opposite angles (they are equal).` },
  corresponding: { name: 'Corresponding angles', pairs: [[1, 5], [2, 6], [3, 7], [4, 8]], why: (a, b) => `${M(BS + 'angle ' + a)} and ${M(BS + 'angle ' + b)} are in the same position at the two crossings (same side of the transversal, same side of their line), so they are corresponding angles (equal when the lines are parallel).` },
  alternateInterior: { name: 'Alternate interior angles', pairs: [[3, 6], [4, 5]], why: (a, b) => `${M(BS + 'angle ' + a)} and ${M(BS + 'angle ' + b)} are between the parallel lines on opposite sides of the transversal, so they are alternate interior angles (equal).` },
  coInterior: { name: 'Co-interior angles', pairs: [[3, 5], [4, 6]], why: (a, b) => `${M(BS + 'angle ' + a)} and ${M(BS + 'angle ' + b)} are between the parallel lines on the same side of the transversal, so they are co-interior angles (they add up to ${M('180^' + BS + 'circ')}).` },
  alternateExterior: { name: 'Alternate exterior angles', pairs: [[1, 8], [2, 7]], why: (a, b) => `${M(BS + 'angle ' + a)} and ${M(BS + 'angle ' + b)} are outside the parallel lines on opposite sides of the transversal, so they are alternate exterior angles (equal).` },
  coExterior: { name: 'Co-exterior angles', pairs: [[1, 7], [2, 8]], why: (a, b) => `${M(BS + 'angle ' + a)} and ${M(BS + 'angle ' + b)} are outside the parallel lines on the same side of the transversal, so they are co-exterior angles (they add up to ${M('180^' + BS + 'circ')}).` },
}
const LEVEL1 = ['vertical', 'corresponding', 'alternateInterior', 'coInterior']
const LEVEL2 = ['alternateExterior', 'coExterior', 'alternateInterior', 'coInterior', 'corresponding', 'vertical']

// the figure: lines l1 (y = 7) and l2 (y = 3), a transversal at angle theta (degrees, 0-180) through x = 5 +- 2 cot(theta); the two asked angles are marked
function figure(theta, marked) {
  const th = (theta * Math.PI) / 180
  const cot = Math.cos(th) / Math.sin(th)
  const top = [5 + 2 * cot, 7]
  const bot = [5 - 2 * cot, 3]
  const at = (n) => (n <= 4 ? top : bot)
  const xAt = (y) => top[0] + (y - 7) * cot
  const ray = (p, ang) => [p[0] + Math.cos(ang), p[1] + Math.sin(ang)]
  // region of each angle (counter-clockwise from -> to): 1 = theta..pi, 2 = 0..theta, 3 = pi..theta+pi, 4 = theta+pi..2pi
  const region = { 1: [th, Math.PI], 2: [0, th], 3: [Math.PI, th + Math.PI], 4: [th + Math.PI, 2 * Math.PI] }
  const reg = (n) => region[((n - 1) % 4) + 1]
  const els = [
    { t: 'segment', p: [0.4, 7], q: [9.6, 7] },
    { t: 'segment', p: [0.4, 3], q: [9.6, 3] },
    { t: 'segment', p: [xAt(9.4), 9.4], q: [xAt(0.6), 0.6] },
    { t: 'text', x: 9.3, y: 7.5, s: 'l1' },
    { t: 'text', x: 9.3, y: 3.5, s: 'l2' },
  ]
  for (let n = 1; n <= 8; n++) {
    const [a1, a2] = reg(n)
    const p = at(n)
    const mid = (a1 + a2) / 2
    if (marked.includes(n)) els.push({ t: 'angle', at: p, from: ray(p, a1), to: ray(p, a2) })
    // the number sits close to its angle (the marked sector has radius 1.2, the others 1.0 from the crossing)
    const dist = marked.includes(n) ? 0.75 : 1.0
    els.push({ t: 'text', x: p[0] + dist * Math.cos(mid), y: p[1] + dist * Math.sin(mid), s: String(n) })
  }
  return { bbox: [0, 10, 10, 0], axes: false, elements: els }
}

export function anglePairParts(hash) {
  const THETAS = [62, 118, 55, 125, 70, 110, 65, 115, 58, 122]
  const make = (part, level, i) => {
    const pool = level === 1 ? LEVEL1 : LEVEL2
    const kind = pool[hash(`${part}${level}${i}k`) % pool.length]
    const K = KINDS[kind]
    let [a, b] = K.pairs[hash(`${part}${level}${i}p`) % K.pairs.length]
    if (hash(`${part}${level}${i}s`) % 2) [a, b] = [b, a]
    const others = (level === 1 ? LEVEL1 : Object.keys(KINDS)).filter((k) => k !== kind)
    const wrong = others.sort((x, y) => hash(`${part}${i}${x}`) - hash(`${part}${i}${y}`)).slice(0, 3)
    const theta = THETAS[(hash(`${part}${level}${i}t`) + i) % THETAS.length]
    return {
      q: `In the diagram, ${M('l_1 ' + BS + 'parallel l_2')} and ${M('t')} is a transversal. What kind of angle pair are ${M(BS + 'angle ' + a)} and ${M(BS + 'angle ' + b)}?`,
      a: K.name,
      d: wrong.map((k) => KINDS[k].name),
      s: K.why(a, b),
      l: level,
      f: figure(theta, [a, b]),
    }
  }
  return 'abcd'.split('').map((p) => ({ p, qs: [...Array.from({ length: 6 }, (_, i) => make(p, 1, i)), ...Array.from({ length: 4 }, (_, i) => make(p, 2, i))] }))
}
