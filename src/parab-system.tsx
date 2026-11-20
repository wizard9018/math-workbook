// Solve a parabola-line or two-parabola system by graphing: plot 5 points of each parabola (2 points of a line), then click each point where the graphs meet; Submit (nothing to click when
// they do not meet). Right = the points of each curve are on it (distinct) and the clicked points are exactly the intersections. Imported by: quiz.tsx. Spec: `Draw` with `par` (exercise.ts).
import { useRef, useState } from 'react'
import type { Draw } from './exercise'
import { H, ML, MT, PH, PW, W, labelPos, lineSvg, nf, planeBg, px, py } from './plane'

type P = [number, number]
type Curve = { m?: number; c?: number; a?: number; h?: number; k?: number }
const BLUE = '#0284c7'
const ORANGE = '#ea580c'
const need = (cv: Curve) => (cv.a === undefined ? 2 : 5)
const val = (cv: Curve, x: number) => (cv.a === undefined ? cv.m! * x + cv.c! : cv.a * (x - cv.h!) ** 2 + cv.k!)

export function ParabSystem({ spec, disabled, onSubmit }: { spec: Draw; disabled: boolean; onSubmit: (ok: boolean) => void }) {
  const { c1, c2, ints } = spec.par!
  const n1 = need(c1), n2 = need(c2), total = n1 + n2
  const svg = useRef<SVGSVGElement>(null)
  const [pts, setPts] = useState<P[]>([])
  const [hover, setHover] = useState<P | null>(null)
  const [right, setRight] = useState(false)
  const [done, setDone] = useState(false)
  const snap = (e: React.PointerEvent): P | null => {
    const r = svg.current!.getBoundingClientRect()
    const x = spec.xmin + ((((e.clientX - r.left) / r.width) * W - ML) / PW) * (spec.xmax - spec.xmin)
    const y = spec.ymax - ((((e.clientY - r.top) / r.height) * H - MT) / PH) * (spec.ymax - spec.ymin)
    const sx = spec.xmin + Math.round((x - spec.xmin) / spec.xs) * spec.xs
    const sy = spec.ymin + Math.round((y - spec.ymin) / spec.ys) * spec.ys
    if (sx < spec.xmin - 1e-9 || sx > spec.xmax + 1e-9 || sy < spec.ymin - 1e-9 || sy > spec.ymax + 1e-9) return null
    return [+sx.toFixed(6), +sy.toFixed(6)]
  }
  const grp = (i: number) => (i < n1 ? 0 : i < total ? 1 : 2) // the curve a point belongs to (a point where the curves meet can be used for both)
  const dup = (p: P) => pts.some((q, i) => grp(i) === grp(pts.length) && same(p, q))
  const same = (a: P, b: P) => Math.abs(a[0] - b[0]) < 1e-9 && Math.abs(a[1] - b[1]) < 1e-9
  const on = (cv: Curve, p: P) => Math.abs(p[1] - val(cv, p[0])) < 1e-6
  const path = (cv: Curve, color: string) => {
    if (cv.a === undefined) return lineSvg(spec, cv.m!, cv.c!).replace(BLUE, color)
    let d = ''
    for (let i = 0; i <= 240; i++) {
      const x = spec.xmin + ((spec.xmax - spec.xmin) * i) / 240, y = val(cv, x)
      if (y < spec.ymin - 1e-9 || y > spec.ymax + 1e-9) { d += ' M'; continue }
      d += `${d === '' || d.endsWith('M') ? 'M' : 'L'}${px(spec, x)} ${py(spec, y)} `
    }
    return `<path d="${d.replace(/ M\s*(?= M|$)/g, '')}" fill="none" stroke="${color}" stroke-width="3"/>`
  }
  const first = pts.slice(0, n1), second = pts.slice(n1, total), meets = pts.slice(total)
  let curves = ''
  if (first.length >= n1 && first.every((p) => on(c1, p))) curves += path(c1, BLUE)
  if (second.length >= n2 && second.every((p) => on(c2, p))) curves += path(c2, ORANGE)
  const ok = () => {
    const good = (arr: P[], cv: Curve) => arr.length === need(cv) && arr.every((p) => on(cv, p)) && arr.every((p, i) => arr.findIndex((q) => same(p, q)) === i)
    if (!good(first, c1) || !good(second, c2)) return false
    return meets.length === ints.length && ints.every((t) => meets.some((p) => same(p, t as P)))
  }
  const dot = (p: P, key: string, color: string, ghost = false) => (
    <g key={key} opacity={ghost ? 0.6 : 1}>
      <circle cx={px(spec, p[0])} cy={py(spec, p[1])} r={6.5} fill={color} stroke="#fff" strokeWidth={1.5} />
      {color === '#16a34a' && <text x={labelPos(spec, p[0], p[1]).x} y={labelPos(spec, p[0], p[1]).y} textAnchor={labelPos(spec, p[0], p[1]).anchor} fontSize={13} fill="#0f172a">({nf(p[0])}, {nf(p[1])})</text>}
    </g>
  )
  const stage = pts.length < n1 ? 0 : pts.length < total ? 1 : 2
  const name = (cv: Curve) => (cv.a === undefined ? `${n1 === 2 || cv.a === undefined ? '2 points of the line' : ''}` : '5 points of the parabola')
  const say = done ? 'Press Submit.' : stage === 0 ? `Plot ${name(c1)} (blue)…` : stage === 1 ? `Plot ${name(c2)} (orange)…` : `Click each point where the graphs meet (none if they do not meet), then press Submit.`
  const color = (i: number) => (i < n1 ? BLUE : i < total ? ORANGE : '#16a34a')
  const canSubmit = pts.length >= total

  return (
    <div className="space-y-3">
      <p className="text-center text-sm text-slate-500">{say}</p>
      <svg
        ref={svg}
        viewBox={`0 0 ${W} ${H}`}
        className="mx-auto block w-full max-w-[460px] rounded-xl border bg-white"
        style={{ touchAction: 'none', cursor: disabled || done ? 'default' : 'crosshair' }}
        onPointerMove={(e) => setHover(snap(e))}
        onPointerLeave={() => setHover(null)}
        onPointerDown={(e) => {
          if (disabled || done) return
          const p = snap(e)
          if (!p || dup(p) || pts.length >= total + 2) return
          setPts([...pts, p])
        }}
      >
        <g dangerouslySetInnerHTML={{ __html: planeBg(spec) }} />
        <g dangerouslySetInnerHTML={{ __html: curves }} />
        {pts.map((p, i) => dot(p, `p${i}`, color(i)))}
        {!done && !disabled && hover && pts.length < total + 2 && !dup(hover) && dot(hover, 'hover', color(pts.length), true)}
      </svg>
      <div className="flex items-center justify-center gap-3">
        <button className="rounded-lg border-2 border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 disabled:opacity-40" disabled={disabled || pts.length === 0 || done} onClick={() => setPts([])}>
          Clear
        </button>
        <button className="rounded-lg bg-emerald-500 px-6 py-2 font-bold text-white disabled:opacity-40" disabled={disabled || !canSubmit || done} onClick={() => { const r = ok(); setRight(r); setDone(true); onSubmit(r) }}>
          Submit
        </button>
        {right && <span className="text-3xl font-bold text-emerald-500">✓</span>}
      </div>
    </div>
  )
}
