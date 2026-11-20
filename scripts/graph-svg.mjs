// A small coordinate-plane picture (SVG string) for a multiple-choice OPTION that is itself a graph: grid, axes with numbers, one polyline, optional end dots.
// plot(pts, {x: [lo, hi], y: [lo, hi], dots: [[x, y, closed]], arrows: [start, end]}). The same window for the four options of a question makes them comparable.
// Imported by: graph-combos.mjs, graph-composite.mjs (export-bank.mjs).
// drop points that lie (within eps, in data units) on the straight line between their neighbours; null (a gap) is kept
export function simplify(pts, eps = 0.04) {
  const out = []
  let anchor = null
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i]
    if (!p) { if (anchor && out[out.length - 1] !== anchor) out.push(anchor); anchor = null; out.push(null); continue }
    if (!anchor) { out.push(p); anchor = p; continue }
    const nx = pts[i + 1]
    if (nx) {
      const dx = nx[0] - anchor[0], dy = nx[1] - anchor[1], l = Math.hypot(dx, dy) || 1
      const d = Math.abs((p[0] - anchor[0]) * dy - (p[1] - anchor[1]) * dx) / l
      if (d < eps) continue // p is (almost) on the line anchor -> next
    }
    out.push(p); anchor = p
  }
  return out
}
export function plot(pts, { x = [-6, 6], y = [-6, 6], dots = [], arrows = [false, false], S = 13 } = {}) {
  const W = (x[1] - x[0]) * S, H = (y[1] - y[0]) * S
  const X = (v) => +((v - x[0]) * S).toFixed(1), Y = (v) => +((y[1] - v) * S).toFixed(1)
  let grid = ''
  for (let v = x[0]; v <= x[1]; v++) grid += `M${X(v)} 0V${H}`
  for (let v = y[0]; v <= y[1]; v++) grid += `M0 ${Y(v)}H${W}`
  let nums = ''
  for (let v = Math.ceil(x[0] / 2) * 2; v <= x[1]; v += 2) if (v) nums += `<text x="${X(v)}" y="${Y(0) + 9}" font-size="7" text-anchor="middle" fill="#64748b">${v}</text>`
  for (let v = Math.ceil(y[0] / 2) * 2; v <= y[1]; v += 2) if (v) nums += `<text x="${X(0) - 3}" y="${Y(v) + 2.5}" font-size="7" text-anchor="end" fill="#64748b">${v}</text>`
  let pen = false // a null in the list lifts the pen (a graph in several pieces)
  const path = simplify(pts).map((p) => { if (!p) { pen = false; return '' } const r = `${pen ? 'L' : 'M'}${X(p[0])} ${Y(p[1])}`; pen = true; return r }).join('')
  const col = '#0284c7'
  const head = (a, b) => { // an arrow head at a, pointing away from b
    const dx = X(a[0]) - X(b[0]), dy = Y(a[1]) - Y(b[1]), l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l
    return `<polygon points="${X(a[0]) + ux * 4} ${Y(a[1]) + uy * 4},${X(a[0]) - ux * 4 - uy * 3.5} ${Y(a[1]) - uy * 4 + ux * 3.5},${X(a[0]) - ux * 4 + uy * 3.5} ${Y(a[1]) - uy * 4 - ux * 3.5}" fill="${col}"/>`
  }
  const arr = (arrows[0] ? head(pts[0], pts[1]) : '') + (arrows[1] ? head(pts[pts.length - 1], pts[pts.length - 2]) : '') // (arrows only for a graph in one piece)
  const dot = dots.map(([a, b, closed]) => `<circle cx="${X(a)}" cy="${Y(b)}" r="3.6" fill="${closed ? col : '#fff'}" stroke="${col}" stroke-width="1.8"/>`).join('')
  return `<svg viewBox="-12 -6 ${W + 20} ${H + 22}" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:${W + 40}px;height:auto"><path d="${grid}" stroke="#e2e8f0" stroke-width="0.8" fill="none"/><path d="M0 ${Y(0)}H${W}M${X(0)} 0V${H}" stroke="#475569" stroke-width="1.3" fill="none"/>${nums}<path d="${path}" stroke="${col}" stroke-width="2.2" fill="none" stroke-linejoin="round"/>${arr}${dot}</svg>`
}
