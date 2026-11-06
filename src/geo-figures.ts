// The figures of Grade 9 5.2 exercises 8, 9 and 10 (perimeters and surface areas), drawn as inline SVG strings. Every figure takes the labels of its sides as TeX.
// The shapes follow the textbook pictures; the labels are the lengths of the question, so a new question is the same drawing with other labels.
// `active` = the number of the piece (side, curved part, face) the lesson asks about: it is lit in orange, and the face opposite to it is outlined with a dashed line.
// Imported by: geo-data.ts.
import katex from 'katex'

type Pt = [number, number]
const W = 360
const H = 240
const INK = '#334155'

const tx = (s: string) => katex.renderToString(s, { throwOnError: false })
// a label centred at (x, y)
const lab = (x: number, y: number, tex: string, w = 110) =>
  `<foreignObject x="${x - w / 2}" y="${y - 15}" width="${w}" height="30"><div xmlns="http://www.w3.org/1999/xhtml" style="display:flex;justify-content:center;align-items:center;height:100%;font-size:17px;color:#0f172a;white-space:nowrap">${tx(tex)}</div></foreignObject>`
const pts = (p: Pt[]) => p.map((q) => q.join(',')).join(' ')
const shape = (p: Pt[], fill = '#fef9c3') => `<polygon points="${pts(p)}" fill="${fill}"/>`
const ln = (a: Pt, b: Pt, extra = '') => `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" ${extra}/>`
const DASH = 'stroke-dasharray="5 4" stroke="#64748b" stroke-width="1.6"'
const dashed = (a: Pt, b: Pt) => ln(a, b, DASH)
// n small marks across the middle of a side (equal sides)
const tick = (a: Pt, b: Pt, n = 1) => {
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]]
  const len = Math.hypot(dx, dy)
  const [ux, uy] = [dx / len, dy / len]
  const [nx, ny] = [-uy, ux]
  const mid: Pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
  return Array.from({ length: n }, (_, i) => {
    const o = (i - (n - 1) / 2) * 5
    const c: Pt = [mid[0] + ux * o, mid[1] + uy * o]
    return ln([c[0] - nx * 6, c[1] - ny * 6], [c[0] + nx * 6, c[1] + ny * 6], 'stroke-width="1.8"')
  }).join('')
}
// a small square for a right angle at a corner, pointing along the unit directions d1 and d2
const right = (c: Pt, d1: Pt, d2: Pt, s = 12) => `<polyline points="${pts([[c[0] + d1[0] * s, c[1] + d1[1] * s], [c[0] + (d1[0] + d2[0]) * s, c[1] + (d1[1] + d2[1]) * s], [c[0] + d2[0] * s, c[1] + d2[1] * s]])}" stroke-width="1.6"/>`
type Dir = 'up' | 'down' | 'left' | 'right'
// a semicircle on a diameter whose middle is c, bulging up / down / left / right
const semiD = (c: Pt, r: number, dir: Dir) => {
  const [x, y] = c
  return {
    up: `M ${x - r} ${y} A ${r} ${r} 0 0 1 ${x + r} ${y}`,
    down: `M ${x + r} ${y} A ${r} ${r} 0 0 1 ${x - r} ${y}`,
    right: `M ${x} ${y - r} A ${r} ${r} 0 0 1 ${x} ${y + r}`,
    left: `M ${x} ${y + r} A ${r} ${r} 0 0 1 ${x} ${y - r}`,
  }[dir]
}
const semi = (c: Pt, r: number, dir: Dir) => `<path d="${semiD(c, r, dir)}" fill="#fef9c3"/>`
// the end of a radius from the centre c at an angle (degrees, counter-clockwise)
const radius = (c: Pt, r: number, deg: number): Pt => [c[0] + r * Math.cos((deg * Math.PI) / 180), c[1] - r * Math.sin((deg * Math.PI) / 180)]
const dot = (c: Pt) => `<circle cx="${c[0]}" cy="${c[1]}" r="2.5" fill="${INK}" stroke="none"/>`
const svg = (body: string, h = H) =>
  `<svg viewBox="-40 -30 ${W + 80} ${h + 30}" style="width:100%;max-width:480px;height:auto;display:block;margin:0 auto" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round">${body}</svg>`

// a dimension arrow: a double-headed arrow parallel to the side a-b, pushed away from it by `off` in the direction n (a unit vector), with the length written beside it
const ARROW = '#059669'
// trim = how much each end of the arrow is pulled in along the side: at a corner that opens towards the arrow the arrows of the two sides would cross
const dim = (a: Pt, b: Pt, label: string, n: Pt, off = 16, w = 70, trim: [number, number] = [0, 0]) => {
  const [p0, q0]: Pt[] = [[a[0] + n[0] * off, a[1] + n[1] * off], [b[0] + n[0] * off, b[1] + n[1] * off]]
  const len0 = Math.hypot(q0[0] - p0[0], q0[1] - p0[1])
  const [ux, uy] = [(q0[0] - p0[0]) / len0, (q0[1] - p0[1]) / len0]
  const [p, q]: Pt[] = [[p0[0] + ux * trim[0], p0[1] + uy * trim[0]], [q0[0] - ux * trim[1], q0[1] - uy * trim[1]]]
  const len = Math.hypot(q[0] - p[0], q[1] - p[1])
  const s = Math.min(7, len / 4)
  const head = (t: Pt, d: number) => `<polygon points="${pts([t, [t[0] - d * ux * s * 1.6 + uy * s * 0.6, t[1] - d * uy * s * 1.6 - ux * s * 0.6], [t[0] - d * ux * s * 1.6 - uy * s * 0.6, t[1] - d * uy * s * 1.6 + ux * s * 0.6]])}" fill="${ARROW}" stroke="none"/>`
  const lo = (12 + Math.abs(n[0]) * 18 + Math.abs(n[1]) * 4) * Math.sign(off) // a label beside a vertical or slanted arrow needs more room than one above a horizontal arrow
  const mid: Pt = [(p[0] + q[0]) / 2 + n[0] * lo, (p[1] + q[1]) / 2 + n[1] * lo]
  const e = off + 4 * Math.sign(off)
  const ext = Math.abs(off) > 6 ? (trim[0] ? '' : ln(a, [a[0] + n[0] * e, a[1] + n[1] * e], 'stroke="#94a3b8" stroke-width="1"')) + (trim[1] ? '' : ln(b, [b[0] + n[0] * e, b[1] + n[1] * e], 'stroke="#94a3b8" stroke-width="1"')) : ''
  return ext + ln(p, q, `stroke="${ARROW}" stroke-width="1.8"`) + head(p, -1) + head(q, 1) + lab(mid[0], mid[1], label, w)
}
// the dimension arrow of every labelled side of a polygon, outside the shape (null = this side has no label); a negative offset puts it inside
const sideLabels = (poly: Pt[], labels: (string | null)[], offs: number | number[] = 16, w = 70) => {
  const area = poly.reduce((s, p, i) => s + (p[0] * poly[(i + 1) % poly.length][1] - poly[(i + 1) % poly.length][0] * p[1]), 0)
  const sign = area > 0 ? 1 : -1 // the outward normal of an edge (dx, dy) is (dy, -dx) when the outline runs clockwise on the screen
  return poly
    .map((a, i) => {
      const l = labels[i]
      if (l === null || l === undefined) return ''
      const b = poly[(i + 1) % poly.length]
      const [dx, dy] = [b[0] - a[0], b[1] - a[1]]
      const len = Math.hypot(dx, dy)
      const off = Array.isArray(offs) ? offs[i] : offs
      // an outside arrow is pulled in at a reflex corner, an inside arrow at a convex corner (otherwise it would run into the arrow of the next side)
      const n = poly.length
      const turn = (v: number) => {
        const [p, c, q] = [poly[(v + n - 1) % n], poly[v], poly[(v + 1) % n]]
        return sign * ((c[0] - p[0]) * (q[1] - c[1]) - (c[1] - p[1]) * (q[0] - c[0])) // > 0: convex corner
      }
      const pull = (v: number) => ((off > 0 ? turn(v) < 0 : turn(v) > 0) ? Math.abs(off) + 3 : 0)
      return dim(a, b, l, [(sign * dy) / len, (-sign * dx) / len], off, w, [pull(i), pull((i + 1) % n)])
    })
    .join('')
}

// ---- the piece the lesson asks about: lit in orange; the opposite face is outlined with a dashed line ----
const ORANGE = '#ea580c'
const hiPoly = (p: Pt[]) => `<polygon points="${pts(p)}" fill="rgba(249,115,22,0.5)" stroke="${ORANGE}" stroke-width="2.5"/>`
const hiBack = (p: Pt[]) => `<polygon points="${pts(p)}" fill="rgba(249,115,22,0.14)" stroke="${ORANGE}" stroke-width="2.2" stroke-dasharray="5 4"/>`
const hiSeg = (a: Pt, b: Pt) => ln(a, b, `stroke="${ORANGE}" stroke-width="5"`)
const hiPath = (d: string, fill = 'none') => `<path d="${d}" fill="${fill}" stroke="${ORANGE}" stroke-width="5"/>`
const hiCircle = (c: Pt, r: number) => `<circle cx="${c[0]}" cy="${c[1]}" r="${r}" fill="rgba(249,115,22,0.35)" stroke="${ORANGE}" stroke-width="4"/>`
const hiEll = (c: Pt, rx: number, ry: number, dash = false) => `<ellipse cx="${c[0]}" cy="${c[1]}" rx="${rx}" ry="${ry}" fill="rgba(249,115,22,${dash ? 0.14 : 0.5})" stroke="${ORANGE}" stroke-width="2.4" ${dash ? 'stroke-dasharray="5 4"' : ''}/>`

// ---- 3-D helpers: a solid drawn in oblique projection (the depth goes up and to the right) ----
const DX = 70
const DY = -45
const back = (p: Pt): Pt => [p[0] + DX, p[1] + DY]

const FIG: Record<string, (l: string[], a?: number) => string> = {
  // 8a: a square, one side labelled, equal sides ticked
  square: ([s]) => {
    const p: Pt[] = [[110, 40], [230, 40], [230, 160], [110, 160]]
    return svg(shape(p) + p.map((a, i) => tick(a, p[(i + 1) % 4])).join('') + sideLabels(p, [null, null, s, null]))
  },
  // 8b: a triangle, three labelled sides
  triangle: ([ab, bc, ca]) => {
    const p: Pt[] = [[40, 205], [140, 45], [320, 150]]
    return svg(shape(p) + sideLabels(p, [ab, bc, ca]))
  },
  // 8c: a rectangle, two labelled sides, right angles
  rectangle: ([w, h]) =>
    svg(shape([[60, 50], [280, 50], [280, 170], [60, 170]]) + right([60, 50], [1, 0], [0, 1]) + right([280, 50], [-1, 0], [0, 1]) + right([60, 170], [1, 0], [0, -1]) + right([280, 170], [-1, 0], [0, -1]) + sideLabels([[60, 50], [280, 50], [280, 170], [60, 170]], [null, h, w, null])),
  // 8d: a trapezoid, four labelled sides
  trapezoid: ([top, left, rightS, bottom]) => {
    const p: Pt[] = [[40, 175], [110, 60], [250, 60], [320, 175]]
    return svg(shape(p) + sideLabels(p, [left, top, rightS, bottom]))
  },
  // 8e: a kite, equal sides ticked, two labelled sides
  kite: ([a, b]) => {
    const [T, R, B, L]: Pt[] = [[170, 18], [265, 95], [170, 218], [75, 95]]
    return svg(shape([T, R, B, L]) + tick(T, R) + tick(L, T) + tick(R, B, 2) + tick(B, L, 2) + sideLabels([T, R, B, L], [a, b, null, null]))
  },
  // 8f: a square (dashed) with a semicircle on each side; piece 0 = the four curved parts
  semis4: ([r], a) => {
    const [x0, y0, x1, y1] = [125, 75, 235, 185]
    const c = (x0 + x1) / 2
    const m = (y0 + y1) / 2
    const t = radius([c, y0], 55, 50)
    return svg(
      semi([c, y0], 55, 'up') + semi([c, y1], 55, 'down') + semi([x0, m], 55, 'left') + semi([x1, m], 55, 'right') +
        dashed([x0, y0], [x1, y0]) + dashed([x1, y0], [x1, y1]) + dashed([x1, y1], [x0, y1]) + dashed([x0, y1], [x0, y0]) +
        tick([x0, y0], [x1, y0]) + tick([x1, y0], [x1, y1]) + tick([x1, y1], [x0, y1]) + tick([x0, y1], [x0, y0]) +
        ln([c, y0], t) + dot([c, y0]) + lab(t[0] + 42, t[1] - 4, r, 70) +
        (a === 0 ? hiPath(semiD([c, y0], 55, 'up')) + hiPath(semiD([c, y1], 55, 'down')) + hiPath(semiD([x0, m], 55, 'left')) + hiPath(semiD([x1, m], 55, 'right')) : ''),
    )
  },
  // 8g: a dashed rectangle with a big semicircle on the top and bottom and a small one on each side; piece 0 = the big arcs, piece 1 = the small arcs
  semis22: ([big, small], a) => {
    const [x0, y0, x1, y1] = [116, 88, 244, 152]
    const c = 180
    const m = 120
    const t1 = radius([c, y0], 64, 50)
    const t2 = radius([x1, m], 32, 20)
    return svg(
      semi([c, y0], 64, 'up') + semi([c, y1], 64, 'down') + semi([x0, m], 32, 'left') + semi([x1, m], 32, 'right') +
        dashed([x0, y0], [x1, y0]) + dashed([x1, y0], [x1, y1]) + dashed([x1, y1], [x0, y1]) + dashed([x0, y1], [x0, y0]) +
        ln([c, y0], t1) + dot([c, y0]) + lab(t1[0] + 36, t1[1] - 4, big, 70) +
        ln([x1, m], t2) + dot([x1, m]) + lab(t2[0] + 38, t2[1] + 12, small, 70) +
        (a === 0 ? hiPath(semiD([c, y0], 64, 'up')) + hiPath(semiD([c, y1], 64, 'down')) : '') +
        (a === 1 ? hiPath(semiD([x0, m], 32, 'left')) + hiPath(semiD([x1, m], 32, 'right')) : ''),
    )
  },
  // 8h: a square with a semicircle on top (the three sides of the square are equal); piece 0 = the three straight sides, piece 1 = the curve
  arch: ([r], a) => {
    const [x0, y0, x1, y1] = [125, 100, 235, 210]
    const t = radius([180, y0], 55, 55)
    return svg(
      `<path d="M ${x0} ${y0} A 55 55 0 0 1 ${x1} ${y0} L ${x1} ${y1} L ${x0} ${y1} Z" fill="#fef9c3"/>` +
        dashed([x0, y0], [x1, y0]) + tick([x0, y0], [x0, y1]) + tick([x1, y0], [x1, y1]) + tick([x0, y1], [x1, y1]) +
        ln([180, y0], t) + dot([180, y0]) + lab(t[0] + 40, t[1] - 2, r, 70) +
        (a === 0 ? hiSeg([x0, y0], [x0, y1]) + hiSeg([x0, y1], [x1, y1]) + hiSeg([x1, y1], [x1, y0]) : '') +
        (a === 1 ? hiPath(`M ${x0} ${y0} A 55 55 0 0 1 ${x1} ${y0}`) : ''),
    )
  },
  // 9a: three rectangles that touch at their corners
  chain: ([w1, h1, w2, h2, w3, h3]) =>
    {
      const [r1, r2, r3]: Pt[][] = [[[30, 120], [160, 120], [160, 170], [30, 170]], [[160, 70], [240, 70], [240, 120], [160, 120]], [[240, 120], [290, 120], [290, 155], [240, 155]]]
      // the sides of each rectangle in the order top, right, bottom, left
      return svg(shape(r1) + shape(r2) + shape(r3) + sideLabels(r1, [null, null, w1, h1]) + sideLabels(r2, [w2, null, null, h2]) + sideLabels(r3, [null, h3, w3, null]))
    },
  // 9b: a sheared staircase outline, eight labelled pieces
  skew: ([top, left, bottomL, step, mid, half, small, rightS]) => {
    const p: Pt[] = [[100, 30], [330, 30], [310, 80], [255, 80], [238, 130], [165, 130], [145, 180], [40, 180]]
    // the sides in the order of the outline: top, right, small top step (its label is inside the shape), half step, middle, step, bottom left, left
    return svg(shape(p) + sideLabels(p, [top, rightS, small, half, mid, step, bottomL, left], [16, 16, -16, 16, 16, 16, 16, 16], 60))
  },
  // 9c: three circles, each with its radius; piece i = circle i
  circles3: ([r1, r2, r3], a) => {
    const cs: [Pt, number, string][] = [[[75, 120], 55, r1], [[200, 120], 40, r2], [[295, 120], 27, r3]]
    return svg(
      cs.map(([c, r, l]) => `<circle cx="${c[0]}" cy="${c[1]}" r="${r}" fill="#fef9c3"/>` + ln(c, radius(c, r, 40)) + dot(c) + lab(c[0] + r * 0.3 - 12, c[1] - r * 0.33 - 14, l, 40)).join('') + lab(137, 120, '+', 30) + lab(248, 120, '+', 30) +
        cs.map(([c, r], i) => (a === i ? hiCircle(c, r) : '')).join(''),
    )
  },
  // 9d: a rectangle with a small square on its top right corner (the square shares a side with the rectangle); piece 2 = the left part of the top, piece 4 = the whole right side
  rectSquare: ([w, h, s], a) => {
    const outline: Pt[] = [[60, 200], [60, 90], [222, 90], [222, 52], [260, 52], [260, 200]]
    // the sides: left, top left part (asked), square left, square top, right (asked), bottom
    return svg(
      shape(outline) + dashed([222, 90], [260, 90]) + sideLabels(outline, [h, null, s, s, null, w], 16) +
        (a === 2 ? hiSeg([60, 90], [222, 90]) : '') + (a === 4 ? hiSeg([260, 200], [260, 52]) : ''),
    )
  },
  // 9e: a square-like outline with a corner cut out (4 across, 6 down); piece 1 = the bottom, piece 4 = the upper right side
  lshape: ([side, across, down], a) => {
    const p: Pt[] = [[70, 30], [260, 30], [260, 130], [190, 130], [190, 220], [70, 220]]
    // the sides: top, upper right (asked), the cut across, the cut down, bottom (asked), left
    return svg(shape(p) + sideLabels(p, [side, null, across, down, null, side], [16, 16, 16, 16, 16, 16], 50) + (a === 1 ? hiSeg([70, 220], [190, 220]) : '') + (a === 4 ? hiSeg([260, 30], [260, 130]) : ''))
  },
  // 9f: a rectangle with a semicircle on each end; piece 1 = the two curved ends
  stadium: ([r, len], a) => {
    const t = radius([100, 120], 40, 140)
    const t2 = radius([260, 120], 40, 40)
    return svg(
      `<path d="M 100 80 L 260 80 A 40 40 0 0 1 260 160 L 100 160 A 40 40 0 0 1 100 80 Z" fill="#fef9c3"/>` + dashed([100, 80], [100, 160]) + dashed([260, 80], [260, 160]) +
        ln([100, 120], t) + dot([100, 120]) + lab(t[0] - 16, t[1] - 10, r, 40) + ln([260, 120], t2) + dot([260, 120]) + lab(t2[0] + 18, t2[1] - 10, r, 40) + lab(180, 188, len) +
        (a === 1 ? hiPath('M 100 80 A 40 40 0 0 0 100 160') + hiPath('M 260 80 A 40 40 0 0 1 260 160') : ''),
    )
  },
  // 9g: a square with a corner cut off by a slanted side; piece 1 = the right side, piece 2 = the slanted side, piece 3 = the bottom
  pentagon: ([side, cutW, cutH], a) => {
    const p: Pt[] = [[60, 30], [240, 30], [240, 155], [180, 200], [60, 200]]
    // the sides: top, right (asked), slanted (asked), bottom (asked), left; the legs of the cut are labelled next to their dashed lines
    return svg(
      shape(p) + right([60, 30], [1, 0], [0, 1]) + dashed([240, 155], [240, 200]) + dashed([180, 200], [240, 200]) + sideLabels(p, [side, null, null, null, side], 16) + dim([240, 155], [240, 200], cutH, [1, 0], 16, 60) + dim([180, 200], [240, 200], cutW, [0, 1], 16, 40) +
        (a === 1 ? hiSeg([240, 30], [240, 155]) : '') + (a === 2 ? hiSeg([240, 155], [180, 200]) : '') + (a === 3 ? hiSeg([180, 200], [60, 200]) : ''),
    )
  },
  // 9h: a trapezoid with two right angles; piece 3 = the left side
  rtrap: ([top, x, slant], a) => {
    const p: Pt[] = [[60, 30], [250, 30], [250, 95], [60, 205]]
    // the sides: top, right, slanted, left (asked)
    return svg(shape(p) + right([60, 30], [1, 0], [0, 1]) + right([250, 30], [-1, 0], [0, 1]) + sideLabels(p, [top, x, slant, null], 16) + (a === 3 ? hiSeg([60, 30], [60, 205]) : ''))
  },
  // 10a-c: a box (width, height, depth); piece 0 = front and back, 1 = top and bottom, 2 = the two sides
  cuboid: ([w, h, d], a) => {
    const [x0, y0, x1, y1] = [60, 80, 200, 200]
    const F: Pt[] = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]]
    const [t, r, l] = [[F[0], F[1], back(F[1]), back(F[0])], [F[1], F[2], back(F[2]), back(F[1])], [F[0], F[3], back(F[3]), back(F[0])]]
    return svg(
      shape(t, '#e2e8f0') + shape(r, '#cbd5e1') + shape(F, '#f1f5f9') + dim(F[3], F[2], w, [0, 1]) + dim(F[0], F[3], h, [-1, 0], 16, 60) + dim(F[2], back(F[2]), d, [0.5, 0.86], 16, 80) +
        (a === 0 ? hiBack(F.map(back)) + hiPoly(F) : '') +
        (a === 1 ? hiBack([F[3], F[2], back(F[2]), back(F[3])]) + hiPoly(t) : '') +
        (a === 2 ? hiBack(l) + hiPoly(r) : ''),
    )
  },
  // 10d: a prism with a right triangle for its face; piece 0 = the two triangles, 1 = the face on the tall side, 2 = the face on the bottom, 3 = the slanted face
  prism: ([a1, b, len], a) => {
    const [A, B, C]: Pt[] = [[50, 75], [50, 200], [170, 200]]
    return svg(
      shape([A, C, back(C), back(A)], '#cbd5e1') + shape([A, B, C], '#f1f5f9') + right(B, [1, 0], [0, -1]) +
        dashed(back(A), back(B)) + dashed(back(B), B) + dashed(back(B), back(C)) + dim(A, B, a1, [-1, 0], 16, 50) + dim(B, C, b, [0, 1]) + dim(C, back(C), len, [0.5, 0.86], 16, 60) +
        (a === 0 ? hiBack([back(A), back(B), back(C)]) + hiPoly([A, B, C]) : '') +
        (a === 1 ? hiPoly([A, B, back(B), back(A)]) : '') +
        (a === 2 ? hiPoly([B, C, back(C), back(B)]) : '') +
        (a === 3 ? hiPoly([A, C, back(C), back(A)]) : ''),
    )
  },
  // 10e-f: a cylinder (radius, height); piece 0 = the two round ends, piece 1 = the curved side
  cylinder: ([r, h], a) => {
    const [cx, top, bot, rx, ry] = [170, 65, 195, 62, 22]
    const sideD = `M ${cx - rx} ${top} L ${cx - rx} ${bot} A ${rx} ${ry} 0 0 0 ${cx + rx} ${bot} L ${cx + rx} ${top}`
    return svg(
      `<path d="${sideD}" fill="#f1f5f9"/>` + `<ellipse cx="${cx}" cy="${top}" rx="${rx}" ry="${ry}" fill="#e2e8f0"/>` + ln([cx, top], [cx + rx, top]) + dot([cx, top]) + lab(cx + rx / 2, top + 14, r, 40) + dim([cx + rx, top], [cx + rx, bot], h, [1, 0], 16, 60) +
        (a === 0 ? hiEll([cx, top], rx, ry) + hiEll([cx, bot], rx, ry, true) : '') +
        (a === 1 ? hiPath(sideD + ` L ${cx - rx} ${top}`, 'rgba(249,115,22,0.4)') : ''),
    )
  },
  // 10g: a hollow cylinder (outer diameter, inner diameter, height); piece 0 = the outside curved surface, 1 = the inside one, 2 = the two ring ends
  hollow: ([outer, inner, h], a) => {
    const [cx, top, bot, rx, ry] = [170, 70, 195, 80, 26]
    const [ix, iy] = [40, 13]
    const outerD = `M ${cx - rx} ${top} L ${cx - rx} ${bot} A ${rx} ${ry} 0 0 0 ${cx + rx} ${bot} L ${cx + rx} ${top}`
    return svg(
      `<path d="${outerD}" fill="#f1f5f9"/>` +
        `<ellipse cx="${cx}" cy="${top}" rx="${rx}" ry="${ry}" fill="#e2e8f0"/><ellipse cx="${cx}" cy="${top}" rx="${ix}" ry="${iy}" fill="#fff"/>` +
        dashed([cx - ix, top], [cx - ix, bot - 4]) + dashed([cx + ix, top], [cx + ix, bot - 4]) +
        `<path d="M ${cx - ix} ${bot - 4} A ${ix} ${iy} 0 0 0 ${cx + ix} ${bot - 4}" ${DASH}/>` +
        ln([cx - ix, 34], [cx + ix, 34]) + lab(cx, 16, inner, 40) + ln([cx - rx, 232], [cx - 14, 232]) + ln([cx + 14, 232], [cx + rx, 232]) + lab(cx, 232, outer, 28) + dim([cx + rx, top], [cx + rx, bot], h, [1, 0], 16, 50) +
        (a === 0 ? hiPath(outerD + ` L ${cx - rx} ${top}`, 'rgba(249,115,22,0.35)') : '') +
        (a === 1 ? hiPath(`M ${cx - ix} ${top} L ${cx - ix} ${bot - 4} A ${ix} ${iy} 0 0 0 ${cx + ix} ${bot - 4} L ${cx + ix} ${top}`, 'rgba(249,115,22,0.35)') : '') +
        (a === 2 ? hiEll([cx, top], rx, ry) + `<ellipse cx="${cx}" cy="${top}" rx="${ix}" ry="${iy}" fill="#fff" stroke="${ORANGE}" stroke-width="2.4"/>` + hiEll([cx, bot], rx, ry, true) : ''),
    )
  },
  // 10h: a box with a round hole through its length; piece 0 = the two square ends, 1 = the four side faces, 2 = the curved surface of the hole, 3 = the two round holes
  boxhole: ([side, r, len], a) => {
    const [x0, y0, x1, y1] = [60, 70, 180, 190]
    const F: Pt[] = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]]
    const c: Pt = [120, 130]
    const t = radius(c, 24, 20)
    const [top, rt, lf] = [[F[0], F[1], back(F[1]), back(F[0])], [F[1], F[2], back(F[2]), back(F[1])], [F[0], F[3], back(F[3]), back(F[0])]]
    return svg(
      shape(top, '#e2e8f0') + shape(rt, '#cbd5e1') + shape(F, '#f1f5f9') +
        `<circle cx="${c[0]}" cy="${c[1]}" r="24" fill="#fff"/>` + dashed([c[0] + 24, c[1]], back([c[0] + 24, c[1]])) + dashed([c[0] - 24, c[1]], back([c[0] - 24, c[1]])) + `<ellipse cx="${c[0] + DX}" cy="${c[1] + DY}" rx="24" ry="24" ${DASH}/>` +
        ln(c, t) + dot(c) + lab(24, 168, r, 40) + ln([46, 160], [c[0] - 18, c[1] + 12], 'stroke-width="1.4"') + dim(F[3], F[2], side, [0, 1]) + dim(F[2], back(F[2]), len, [0.5, 0.86], 16, 80) +
        (a === 0 ? hiBack(F.map(back)) + hiPoly(F) + `<circle cx="${c[0]}" cy="${c[1]}" r="24" fill="#fff" stroke="${ORANGE}" stroke-width="2"/>` : '') +
        (a === 1 ? hiPoly(top) + hiPoly(rt) + hiBack(lf) + hiBack([F[3], F[2], back(F[2]), back(F[3])]) : '') +
        (a === 2 ? hiCircle(c, 24) + `<ellipse cx="${c[0] + DX}" cy="${c[1] + DY}" rx="24" ry="24" fill="none" stroke="${ORANGE}" stroke-width="3" stroke-dasharray="5 4"/>` + ln([c[0] + 24, c[1]], back([c[0] + 24, c[1]]), `stroke="${ORANGE}" stroke-width="3"`) + ln([c[0] - 24, c[1]], back([c[0] - 24, c[1]]), `stroke="${ORANGE}" stroke-width="3"`) : '') +
        (a === 3 ? hiCircle(c, 24) + hiEll([c[0] + DX, c[1] + DY], 24, 24, true) : ''),
    )
  },
  // 5.3 ex 6a: a triangle with its height; 6b: a parallelogram; 6c: a trapezoid; 6d: a rhombus with its diagonals
  triH: ([base, height]) => {
    const [A, B, C]: Pt[] = [[40, 200], [320, 200], [130, 50]]
    const foot: Pt = [130, 200]
    return svg(shape([A, B, C]) + right(foot, [-1, 0], [0, -1]) + dim(A, B, base, [0, 1]) + dim(foot, C, height, [1, 0], 0.01, 60))
  },
  parH: ([base, height]) => {
    const p: Pt[] = [[100, 50], [330, 50], [250, 200], [20, 200]]
    const foot: Pt = [100, 200]
    return svg(shape(p) + right(foot, [1, 0], [0, -1]) + dim(p[3], p[2], base, [0, 1]) + dim(foot, p[0], height, [1, 0], 0.01, 80))
  },
  trapH: ([top, bottom, height]) => {
    const p: Pt[] = [[110, 50], [250, 50], [330, 200], [30, 200]]
    const foot: Pt = [110, 200]
    return svg(shape(p) + right(foot, [1, 0], [0, -1]) + dim(p[0], p[1], top, [0, -1]) + dim(p[3], p[2], bottom, [0, 1]) + dim(foot, p[0], height, [1, 0], 0.01, 60))
  },
  rhombus: ([ac, bd]) => {
    const [A, B, C, D]: Pt[] = [[40, 195], [100, 55], [260, 55], [200, 195]]
    return svg(
      shape([A, B, C, D]) + dashed(A, C) + dashed(B, D) + tick(A, B) + tick(B, C) + tick(C, D) + tick(D, A) +
        lab(24, 205, 'A', 30) + lab(86, 40, 'B', 30) + lab(276, 40, 'C', 30) + lab(216, 205, 'D', 30) +
        lab(205, 105, `AC = ${ac}`, 110) + lab(105, 165, `BD = ${bd}`, 110),
    )
  },
  // 5.4 ex 5d / 9: a pyramid with a rectangular base (the front edge, the side edge)
  pyramid: ([front, side]) => {
    const B: Pt[] = [[40, 200], [230, 200], [290, 160], [100, 160]]
    const A: Pt = [165, 40]
    return svg(shape([B[0], B[1], B[2], A], '#f1f5f9') + shape([B[0], B[1], A], '#fef9c3') + dashed(B[0], B[3]) + dashed(B[3], B[2]) + dashed(A, B[3]) + dim(B[0], B[1], front, [0, 1]) + dim(B[1], B[2], side, [0.6, 0.8], 16, 60))
  },
  // 5.3 ex 9: an open-top box (width, height, depth); piece 0 = the bottom, 1 = the front and the back, 2 = the two sides
  openbox: ([w, h, d], a) => {
    const [x0, y0, x1, y1] = [60, 80, 200, 200]
    const F: Pt[] = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]]
    const [t, r] = [[F[0], F[1], back(F[1]), back(F[0])], [F[1], F[2], back(F[2]), back(F[1])]]
    return svg(
      shape(t, '#ffffff') + shape([F[0], back(F[0]), back(F[3]), F[3]], '#e2e8f0') + shape([back(F[0]), back(F[1]), back(F[2]), back(F[3])], '#cbd5e1') + shape(r, '#cbd5e1') + shape(F, '#f1f5f9') +
        dim(F[3], F[2], w, [0, 1]) + dim(F[0], F[3], h, [-1, 0], 16, 60) + dim(F[2], back(F[2]), d, [0.5, 0.86], 16, 80) +
        (a === 0 ? hiBack([F[3], F[2], back(F[2]), back(F[3])]) : '') +
        (a === 1 ? hiPoly(F) + hiBack([back(F[0]), back(F[1]), back(F[2]), back(F[3])]) : '') +
        (a === 2 ? hiPoly(r) + hiBack([F[0], back(F[0]), back(F[3]), F[3]]) : ''),
    )
  },
  // 5.3 ex 11b: a half cylinder (diameter, length); piece 0 = the two semicircle ends, 1 = the curved side, 2 = the flat bottom
  halfcyl: ([w, len], a) => {
    const [A, B]: Pt[] = [[50, 190], [170, 190]]
    const [A2, B2] = [back(A), back(B)]
    const front = `M ${A[0]} ${A[1]} A 60 60 0 0 1 ${B[0]} ${B[1]} Z`
    // the outline of the solid: the front arc up to the point where the side of the tube touches it, along the tube, over the back arc, down to the right end
    const [ux, uy] = [DX / Math.hypot(DX, DY), DY / Math.hypot(DX, DY)]
    const T: Pt = [110 + 60 * uy, 190 - 60 * ux]
    const T2 = back(T)
    const curved = `M ${A[0]} ${A[1]} A 60 60 0 0 1 ${T[0]} ${T[1]} L ${T2[0]} ${T2[1]} A 60 60 0 0 1 ${B2[0]} ${B2[1]} L ${B[0]} ${B[1]} Z`
    return svg(
      `<path d="${curved}" fill="#e2e8f0"/>` + `<path d="${front}" fill="#f1f5f9"/>` + dim(A, B, w, [0, 1]) + dim(B, B2, len, [0.5, 0.86], 16, 80) +
        (a === 0 ? hiPath(front, 'rgba(249,115,22,0.5)') + hiPath(`M ${A2[0]} ${A2[1]} A 60 60 0 0 1 ${B2[0]} ${B2[1]} Z`, 'rgba(249,115,22,0.14)') : '') +
        (a === 1 ? hiPath(curved, 'rgba(249,115,22,0.4)') : '') +
        (a === 2 ? hiPoly([A, B, B2, A2]) : ''),
    )
  },
}

export const drawFigure = (kind: string, labels: string[], active?: number): string => `<div class="geo-figure">${FIG[kind](labels, active)}</div>`
export const FIGURE_KINDS = Object.keys(FIG)
