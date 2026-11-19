// A plane that fits a set of points whose coordinates are whole numbers: if they do not fit the plane -6..6, the scale changes (grid step 2, 3, 4, 5, 6, 8 or 10) so that every point is
// a grid crossing and the plane is 12 grid steps wide. Returns null when no such scale exists. Imported by: sketch-quad.mjs, quad-points.mjs, vertex-form.mjs, std-quad.mjs.
const STEPS = [1, 2, 3, 4, 5, 6, 8, 10]
const stepFor = (vals) => {
  for (const s of STEPS) {
    if (vals.every((v) => Math.abs(v / s - Math.round(v / s)) < 1e-9 && Math.abs(v) / s <= 6 + 1e-9)) return s
  }
  return null
}
export function fitPlane(xs, ys) {
  const sx = stepFor(xs), sy = stepFor(ys)
  if (sx === null || sy === null) return null
  return { xmin: -6 * sx, xmax: 6 * sx, ymin: -6 * sy, ymax: 6 * sy, xs: sx, ys: sy, xlabel: 'x', ylabel: 'y', ...(sx > 1 || sy > 1 ? { xl: 1 } : {}) }
}
