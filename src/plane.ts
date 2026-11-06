// A coordinate plane with its own axes (min, max, step, labels): the background as an SVG string, a clipped line, and a static picture of a line with marked points.
// Used by graph-draw.tsx (the plane the student draws on) and graph42-data.ts (the picture shown in a lesson). Shape of `Draw`: exercise.ts.
import type { Draw } from './exercise'

export const W = 440
export const H = 380
export const ML = 64
export const MR = 18
export const MT = 16
export const MB = 52
export const PW = W - ML - MR
export const PH = H - MT - MB
export const px = (d: Draw, x: number) => ML + ((x - d.xmin) / (d.xmax - d.xmin)) * PW
export const py = (d: Draw, y: number) => MT + ((d.ymax - y) / (d.ymax - d.ymin)) * PH
export const nf = (v: number) => String(+v.toFixed(4))

// the part of the line y = m x + b inside the plane: [x1, y1, x2, y2], or null when it is outside
export function clipLine(m: number, b: number, d: Draw): [number, number, number, number] | null {
  let lo = d.xmin
  let hi = d.xmax
  if (m > 0) {
    lo = Math.max(lo, (d.ymin - b) / m)
    hi = Math.min(hi, (d.ymax - b) / m)
  } else if (m < 0) {
    lo = Math.max(lo, (d.ymax - b) / m)
    hi = Math.min(hi, (d.ymin - b) / m)
  } else if (b < d.ymin || b > d.ymax) return null
  return lo > hi ? null : [lo, m * lo + b, hi, m * hi + b]
}

export function planeBg(d: Draw): string {
  let s = ''
  for (let x = d.xmin, k = 0; x <= d.xmax + 1e-9; x += d.xs, k++) s += `<line x1="${px(d, x)}" y1="${MT}" x2="${px(d, x)}" y2="${MT + PH}" stroke="#e2e8f0"/>${!d.xl || k % d.xl === 0 ? `<text x="${px(d, x)}" y="${MT + PH + 16}" text-anchor="middle" font-size="12" fill="#64748b">${nf(x)}</text>` : ''}`
  for (let y = d.ymin; y <= d.ymax + 1e-9; y += d.ys) s += `<line x1="${ML}" y1="${py(d, y)}" x2="${ML + PW}" y2="${py(d, y)}" stroke="#e2e8f0"/><text x="${ML - 6}" y="${py(d, y) + 4}" text-anchor="end" font-size="12" fill="#64748b">${nf(y)}</text>`
  const frame = `<rect x="${ML}" y="${MT}" width="${PW}" height="${PH}" fill="none" stroke="#94a3b8"/>`
  const xAxis = d.ymin <= 0 && d.ymax >= 0 ? `<line x1="${ML}" y1="${py(d, 0)}" x2="${ML + PW}" y2="${py(d, 0)}" stroke="#334155" stroke-width="2"/>` : ''
  const yAxis = d.xmin <= 0 && d.xmax >= 0 ? `<line x1="${px(d, 0)}" y1="${MT}" x2="${px(d, 0)}" y2="${MT + PH}" stroke="#334155" stroke-width="2"/>` : ''
  const names = `<text x="${ML + PW / 2}" y="${H - 8}" text-anchor="middle" font-size="14" fill="#334155">${d.xlabel}</text><text transform="rotate(-90 16 ${MT + PH / 2})" x="16" y="${MT + PH / 2}" text-anchor="middle" font-size="14" fill="#334155">${d.ylabel}</text>`
  return s + frame + xAxis + yAxis + names
}

export const lineSvg = (d: Draw, m: number, b: number) => {
  const c = clipLine(m, b, d)
  return c ? `<line x1="${px(d, c[0])}" y1="${py(d, c[1])}" x2="${px(d, c[2])}" y2="${py(d, c[3])}" stroke="#0284c7" stroke-width="3"/>` : ''
}

export const vLineSvg = (d: Draw, x: number) => `<line x1="${px(d, x)}" y1="${MT}" x2="${px(d, x)}" y2="${MT + PH}" stroke="#0284c7" stroke-width="3"/>`
// the line of the question itself (y = m x + c, or the vertical line x = vx)
export const ownLine = (d: Draw) => (d.vx !== undefined ? vLineSvg(d, d.vx) : lineSvg(d, d.m, d.c))

// where the "(x, y)" label of a point goes: above and to the right, but inside the plane (left of the point near the right edge, below it near the top)
export function labelPos(d: Draw, x: number, y: number): { x: number; y: number; anchor: 'start' | 'end' } {
  const left = px(d, x) > ML + PW - 70
  return { x: px(d, x) + (left ? -9 : 9), y: py(d, y) < MT + 22 ? py(d, y) + 20 : py(d, y) - 9, anchor: left ? 'end' : 'start' }
}

// a picture: the plane, the line y = m x + c, orange dots (marks)
export function planeSvg(d: Draw, marks: [number, number][], withLine = true): string {
  const dots = marks.map(([x, y], i) => {
    const l = labelPos(d, x, y)
    return `<circle data-pt="${i}" cx="${px(d, x)}" cy="${py(d, y)}" r="6" fill="#f97316" stroke="#fff" stroke-width="1.5"/><text x="${l.x}" y="${l.y}" text-anchor="${l.anchor}" font-size="13" fill="#0f172a">(${nf(x)}, ${nf(y)})</text>`
  }).join('')
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:460px;height:auto;margin:0 auto;display:block">${planeBg(d)}${withLine ? ownLine(d) : ''}${dots}</svg>`
}
