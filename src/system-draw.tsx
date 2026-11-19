// Solve a system by graphing: click two points of the first line, then two points of the second line, then click the point where the lines meet (the solution); Submit.
// Right = each pair of points is on a different line of the system, and the last point is the crossing. Imported by: quiz.tsx. Spec: `Draw` with `sys` (exercise.ts). Plane drawing: plane.ts.
import { useRef, useState } from 'react'
import type { Draw } from './exercise'
import { H, ML, MT, PH, PW, W, labelPos, lineSvg, nf, planeBg, px, py, vLineSvg } from './plane'

type P = [number, number]
const BLUE = '#0284c7'
const ORANGE = '#ea580c'
const recolor = (s: string, c: string) => s.replace(BLUE, c)

export function SystemDraw({ spec, disabled, onSubmit }: { spec: Draw; disabled: boolean; onSubmit: (ok: boolean) => void }) {
  const sys = spec.sys!
  const svg = useRef<SVGSVGElement>(null)
  const [pts, setPts] = useState<P[]>([])
  const [hover, setHover] = useState<P | null>(null)
  const [right, setRight] = useState(false)
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
  const lineThrough = (a: P, b: P, color: string) => {
    const vertical = Math.abs(b[0] - a[0]) < 1e-9
    const m = vertical ? 0 : (b[1] - a[1]) / (b[0] - a[0])
    return recolor(vertical ? vLineSvg(spec, a[0]) : lineSvg(spec, m, a[1] - m * a[0]), color)
  }
  // the lines drawn so far (the second point of the pair that is being drawn follows the pointer)
  let lines = ''
  const pair = (i: number, color: string) => {
    const a = pts[i], b = pts[i + 1] ?? (pts.length === i + 1 && hover && !same(hover, a) ? hover : undefined)
    if (a && b) lines += lineThrough(a, b, color)
  }
  pair(0, BLUE)
  if (pts.length >= 2) pair(2, ORANGE)
  const onLine = (p: P, k: 0 | 1) => {
    const L = k === 0 ? { m: spec.m, c: spec.c, vx: spec.vx } : { m: sys.m2, c: sys.c2, vx: sys.vx2 }
    return L.vx !== undefined ? Math.abs(p[0] - L.vx) < 1e-6 : Math.abs(p[1] - (L.m * p[0] + L.c)) < 1e-6
  }
  const ok = () => {
    if (pts.length < 5) return false
    const which = (a: P, b: P): 0 | 1 | null => (onLine(a, 0) && onLine(b, 0) ? 0 : onLine(a, 1) && onLine(b, 1) ? 1 : null)
    const w1 = which(pts[0], pts[1]), w2 = which(pts[2], pts[3])
    return w1 !== null && w2 !== null && w1 !== w2 && same(pts[4], [sys.ix, sys.iy])
  }
  const dot = (p: P, key: string, color: string, ghost = false) => (
    <g key={key} opacity={ghost ? 0.6 : 1}>
      <circle cx={px(spec, p[0])} cy={py(spec, p[1])} r={6.5} fill={color} stroke="#fff" strokeWidth={1.5} />
      <text x={labelPos(spec, p[0], p[1]).x} y={labelPos(spec, p[0], p[1]).y} textAnchor={labelPos(spec, p[0], p[1]).anchor} fontSize={13} fill="#0f172a">({nf(p[0])}, {nf(p[1])})</text>
    </g>
  )
  const step = pts.length < 2 ? 'first line' : pts.length < 4 ? 'second line' : pts.length < 5 ? 'the point where the lines meet' : ''
  const full = pts.length >= 5

  return (
    <div className="space-y-3">
      <p className="text-center text-sm text-slate-500">
        {full ? 'Press Submit.' : <>Click two points of the <b>{pts.length < 2 ? 'first' : pts.length < 4 ? 'second' : ''}</b> {pts.length < 4 ? 'line' : 'then click the point where the lines meet'}…</>}
        {!full && pts.length < 4 && <span className="sr-only"> {step}</span>}
      </p>
      <svg
        ref={svg}
        viewBox={`0 0 ${W} ${H}`}
        className="mx-auto block w-full max-w-[460px] rounded-xl border bg-white"
        style={{ touchAction: 'none', cursor: disabled || full ? 'default' : 'crosshair' }}
        onPointerMove={(e) => setHover(snap(e))}
        onPointerLeave={() => setHover(null)}
        onPointerDown={(e) => {
          if (disabled || full) return
          const p = snap(e)
          if (!p) return
          if ((pts.length === 1 || pts.length === 3) && same(p, pts[pts.length - 1])) return
          setPts([...pts, p])
        }}
      >
        <g dangerouslySetInnerHTML={{ __html: planeBg(spec) }} />
        <g dangerouslySetInnerHTML={{ __html: lines }} />
        {pts.map((p, i) => dot(p, `p${i}`, i < 2 ? BLUE : i < 4 ? ORANGE : '#16a34a'))}
        {!full && !disabled && hover && dot(hover, 'hover', pts.length < 2 ? BLUE : pts.length < 4 ? ORANGE : '#16a34a', true)}
      </svg>
      <div className="flex items-center justify-center gap-3">
        <button className="rounded-lg border-2 border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 disabled:opacity-40" disabled={disabled || pts.length === 0} onClick={() => setPts([])}>
          Clear
        </button>
        <button className="rounded-lg bg-emerald-500 px-6 py-2 font-bold text-white disabled:opacity-40" disabled={disabled || !full} onClick={() => { const r = ok(); setRight(r); onSubmit(r) }}>
          Submit
        </button>
        {right && <span className="text-3xl font-bold text-emerald-500">✓</span>}
      </div>
    </div>
  )
}
