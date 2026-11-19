// Math 10 3.1 exercises 2 and 3 (the textbook's coordinate plane exercises), drawn instead of multiple choice:
//   exercise 2, "Plot the points on the grid provided": the student plots named points on a plane from -6 to 6 (plot-points.tsx; field `pp`);
//   exercise 3, "Find the coordinates of each point": a plane with labelled points, the student types the x and y of every point (fill-table.tsx; field `fl`).
// Made here (no Gemini). Part a has points off the axes, b has points on the axes, c is the mix of the textbook (some on the axes), 8-9 points.
// Imported by: export-bank.mjs.
const BS = String.fromCharCode(92)
const M = (x) => BS + '(' + x + BS + ')'
const NAMES = 'ABCDEFGHI'

export function coordParts(hash, kind) {
  const range = (seed, lo, hi) => lo + (hash(seed) % (hi - lo + 1))
  // n distinct points: `axis` of them on an axis (never the origin), the others off the axes
  const points = (seed, n, axis) => {
    for (let a = 0; a < 40; a++) {
      const pts = []
      const seen = new Set()
      for (let j = 0; pts.length < n && j < 60; j++) {
        const s = `${seed}${a}${j}`
        const onAxis = pts.filter((p) => p[0] === 0 || p[1] === 0).length < axis && j % 2 === 1
        let x, y
        if (onAxis) {
          const v = range(s + 'v', -5, 5)
          ;[x, y] = hash(s + 'w') % 2 ? [v, 0] : [0, v]
        } else { x = range(s + 'x', -5, 5); y = range(s + 'y', -5, 5) }
        if ((x === 0 && y === 0) || (!onAxis && (x === 0 || y === 0)) || seen.has(`${x},${y}`)) continue
        seen.add(`${x},${y}`)
        pts.push([x, y])
      }
      if (pts.length === n && new Set(pts.map((p) => p[0] >= 0 ? (p[1] >= 0 ? 1 : 4) : p[1] >= 0 ? 2 : 3)).size >= (n >= 4 ? 3 : 1)) return pts
    }
    return null
  }
  const sh = (seed, arr) => [...arr].sort((u, v) => hash(seed + u.join()) - hash(seed + v.join()))
  const sign = (n) => (n < 0 ? `-${-n}` : `${n}`)
  const plane = { xmin: -6, xmax: 6, ymin: -6, ymax: 6, xs: 1, ys: 1, xlabel: 'x', ylabel: 'y' }

  const specs = [['a', 4, 0], ['b', 6, 3], ['c', 8, 3]]
  return specs.map(([p, n, axis]) => {
    const qs = []
    const seen = new Set()
    for (let i = 0; qs.length < 10 && i < 60; i++) {
      const pts = points(`${kind}${p}${i}`, n, axis)
      if (!pts) continue
      const key = sh('k', pts).join('|')
      if (seen.has(key)) continue
      seen.add(key)
      const items = sh(`${kind}${p}${i}o`, pts).map((pt, j) => ({ label: NAMES[j], x: pt[0], y: pt[1] }))
      const list = items.map((it) => `${it.label}(${sign(it.x)}, ${sign(it.y)})`).join(', ')
      const level = qs.length < 5 ? 1 : 2
      if (kind === 'plot') {
        qs.push({
          q: `Plot the points on the grid: ${M(list)}`,
          a: `Each point at its place: ${M(list)}`,
          d: [],
          s: `For ${M('(x, y)')}, start at the origin, move ${M('x')} units along the ${M('x')}-axis (right if it is positive, left if negative), then ${M('y')} units up (positive) or down (negative). ${items.map((it) => `${M(`${it.label}(${sign(it.x)}, ${sign(it.y)})`)}: ${it.x === 0 ? 'no move left or right' : `${Math.abs(it.x)} ${it.x > 0 ? 'right' : 'left'}`}${it.y === 0 ? ', none up or down' : `, ${Math.abs(it.y)} ${it.y > 0 ? 'up' : 'down'}`}`).join('; ')}.`,
          l: level,
          pp: { ...plane, items },
        })
      } else {
        const rows = [
          { label: 'point', cells: items.map((it) => it.label) },
          { label: 'x', cells: items.map(() => null) },
          { label: 'y', cells: items.map(() => null) },
        ]
        qs.push({
          q: `Find the coordinates of each point on the coordinate plane: type the ${M('x')} and ${M('y')} of every point.`,
          a: items.map((it) => `${it.label}${M(`(${sign(it.x)}, ${sign(it.y)})`)}`).join(', '),
          d: [],
          s: `Read each point: the ${M('x')}-coordinate is how far it is to the right (positive) or left (negative) of the ${M('y')}-axis, the ${M('y')}-coordinate how far up (positive) or down (negative) from the ${M('x')}-axis. ${items.map((it) => `${it.label}${M(`(${sign(it.x)}, ${sign(it.y)})`)}`).join(', ')}.`,
          l: level,
          f: { bbox: [-6, 6, 6, -6], elements: items.map((it) => ({ t: 'point', x: it.x, y: it.y, label: it.label })) },
          fl: { rows, answers: [...items.map((it) => it.x), ...items.map((it) => it.y)] },
        })
      }
    }
    return { p, qs }
  })
}
