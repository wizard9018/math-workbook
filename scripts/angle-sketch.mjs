// Precalculus 11 7.1 exercise 2 (sketch an angle in standard position): the student clicks the terminal side (the ray snaps to 5 degrees) and chooses the direction of rotation (angle-sketch.tsx).
// Parts a-h: positive angles in quadrants I-II, III-IV, negative angles in quadrants IV-III, II-I, then mixed sets. Every angle is a multiple of 5 degrees and between -360 and 360.
// Made here (no Gemini). Imported by: export-bank.mjs.
const BS = String.fromCharCode(92)
const M = (x) => BS + '(' + x + BS + ')'

export function angleSketchParts(hash) {
  const r = (seed, lo, hi) => lo + ((hash(seed) >>> 9) % (hi - lo + 1))
  const RANGES = { a: [10, 170], b: [190, 350], c: [-170, -10], d: [-350, -190], e: [10, 350], f: [-350, -10], g: [-350, 350], h: [-350, 350] }
  const quad = (d) => { const t = ((d % 360) + 360) % 360; return t < 90 ? 'I' : t < 180 ? 'II' : t < 270 ? 'III' : 'IV' }
  return Object.keys(RANGES).map((p) => {
    const qs = []
    const seen = new Set()
    const [lo, hi] = RANGES[p]
    for (let i = 0; qs.length < 10 && i < 500; i++) {
      const deg = 5 * r(`as${p}${i}`, lo / 5, hi / 5)
      if (deg === 0 || deg % 90 === 0 || seen.has(deg)) continue // not on an axis (the quadrant is clear)
      seen.add(deg)
      const q = quad(deg)
      qs.push({
        q: `Sketch the angle ${M(`${deg}^${BS}circ`)} in standard position. Click the terminal side, then choose the direction of rotation.`,
        a: `The terminal side is in quadrant ${q}, reached by turning ${deg > 0 ? 'counterclockwise' : 'clockwise'}`,
        d: [],
        s: `Start on the positive ${M('x')}-axis (the initial side). A ${deg > 0 ? 'positive' : 'negative'} angle turns ${deg > 0 ? 'counterclockwise' : 'clockwise'}: ${M(`${deg}^${BS}circ`)} ends in quadrant ${q}.`,
        l: qs.length < 5 ? 1 : 2,
        dr: { xmin: -1, xmax: 1, ymin: -1, ymax: 1, xs: 1, ys: 1, xlabel: 'x', ylabel: 'y', m: 0, c: 0, ang: deg },
      })
    }
    return { p, qs }
  }).filter((x) => x.qs.length)
}
