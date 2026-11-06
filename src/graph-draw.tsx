// The plane the student draws a line on: click a point (it snaps to the grid), click a second point (until it is placed the line follows the pointer),
// then Submit. Right = both points are on the line y = m x + c of `spec`. Imported by: quiz.tsx. Plane drawing: plane.ts.
import { useRef, useState } from 'react'
import type { Draw } from './exercise'
import { H, ML, MT, PH, PW, W, labelPos, lineSvg, nf, planeBg, px, py, vLineSvg } from './plane'

type P = [number, number]

export function GraphDraw({ spec, disabled, onSubmit }: { spec: Draw; disabled: boolean; onSubmit: (ok: boolean) => void }) {
  const svg = useRef<SVGSVGElement>(null)
  const [pts, setPts] = useState<P[]>([])
  const [hover, setHover] = useState<P | null>(null)
  const [right, setRight] = useState(false)

  // the grid crossing nearest to the pointer, or null when the pointer is outside the plane
  const snap = (e: React.PointerEvent): P | null => {
    const r = svg.current!.getBoundingClientRect()
    const vx = ((e.clientX - r.left) / r.width) * W
    const vy = ((e.clientY - r.top) / r.height) * H
    const x = spec.xmin + ((vx - ML) / PW) * (spec.xmax - spec.xmin)
    const y = spec.ymax - ((vy - MT) / PH) * (spec.ymax - spec.ymin)
    const sx = spec.xmin + Math.round((x - spec.xmin) / spec.xs) * spec.xs
    const sy = spec.ymin + Math.round((y - spec.ymin) / spec.ys) * spec.ys
    if (sx < spec.xmin - 1e-9 || sx > spec.xmax + 1e-9 || sy < spec.ymin - 1e-9 || sy > spec.ymax + 1e-9) return null
    return [+sx.toFixed(6), +sy.toFixed(6)]
  }
  const same = (a: P, b: P) => Math.abs(a[0] - b[0]) < 1e-9 && Math.abs(a[1] - b[1]) < 1e-9
  const live: [P, P] | null = pts.length === 2 ? [pts[0], pts[1]] : pts.length === 1 && hover && !same(hover, pts[0]) ? [pts[0], hover] : null // the two points the line goes through now
  const vertical = !!live && Math.abs(live[1][0] - live[0][0]) < 1e-9
  const slope = live && !vertical ? (live[1][1] - live[0][1]) / (live[1][0] - live[0][0]) : 0
  const line = live ? (vertical ? vLineSvg(spec, live[0][0]) : lineSvg(spec, slope, live[0][1] - slope * live[0][0])) : ''
  const dot = (p: P, key: string, ghost = false) => (
    <g key={key} opacity={ghost ? 0.6 : 1}>
      <circle cx={px(spec, p[0])} cy={py(spec, p[1])} r={6.5} fill="#f97316" stroke="#fff" strokeWidth={1.5} />
      <text x={labelPos(spec, p[0], p[1]).x} y={labelPos(spec, p[0], p[1]).y} textAnchor={labelPos(spec, p[0], p[1]).anchor} fontSize={13} fill="#0f172a">({nf(p[0])}, {nf(p[1])})</text>
    </g>
  )
  const ok = () => pts.every(([x, y]) => (spec.vx !== undefined ? Math.abs(x - spec.vx) <= spec.xs * 0.01 : Math.abs(y - (spec.m * x + spec.c)) <= (spec.tol ?? spec.ys * 0.01) + 1e-9))

  return (
    <div className="space-y-3">
      <svg
        ref={svg}
        viewBox={`0 0 ${W} ${H}`}
        className="mx-auto block w-full max-w-[460px] rounded-xl border bg-white"
        style={{ touchAction: 'none', cursor: disabled || pts.length === 2 ? 'default' : 'crosshair' }}
        onPointerMove={(e) => setHover(snap(e))}
        onPointerLeave={() => setHover(null)}
        onPointerDown={(e) => {
          if (disabled || pts.length >= 2) return
          const p = snap(e)
          if (!p || (pts.length === 1 && same(p, pts[0]))) return
          setPts([...pts, p])
        }}
      >
        <g dangerouslySetInnerHTML={{ __html: planeBg(spec) }} />
        <g dangerouslySetInnerHTML={{ __html: line }} />
        {pts.map((p, i) => dot(p, `p${i}`))}
        {pts.length < 2 && !disabled && hover && dot(hover, 'hover', true)}
      </svg>
      <div className="flex items-center justify-center gap-3">
        <button className="rounded-lg border-2 border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 disabled:opacity-40" disabled={disabled || pts.length === 0} onClick={() => setPts([])}>
          Clear
        </button>
        <button className="rounded-lg bg-emerald-500 px-6 py-2 font-bold text-white disabled:opacity-40" disabled={disabled || pts.length < 2} onClick={() => { const r = ok(); setRight(r); onSubmit(r) }}>
          Submit
        </button>
        {right && <span className="text-3xl font-bold text-emerald-500">✓</span>}
      </div>
    </div>
  )
}
