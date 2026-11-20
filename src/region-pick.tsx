// A system of inequalities: the boundary curves (lines, or parabolas y = a(x - h)^2 + k) are drawn, dashed or solid; the student clicks the region that is the solution of the system
// (the clicked region is shaded); Submit. Right = the clicked point satisfies every inequality. Imported by: quiz.tsx. Spec: `Draw` with `reg` (exercise.ts).
import { useRef, useState } from 'react'
import type { Draw } from './exercise'
import { H, ML, MT, PH, PW, W, clipLine, planeBg, px, py } from './plane'

type P = [number, number]
type Bound = NonNullable<Draw['reg']>[number]
const COLORS = ['#0284c7', '#ea580c']
const CELLS = 120

// > 0: above (right of) the boundary
const g = (ln: Bound, p: P) => (ln.vx !== undefined ? p[0] - ln.vx : ln.a !== undefined ? p[1] - (ln.a * (p[0] - ln.h!) ** 2 + ln.k!) : p[1] - (ln.m * p[0] + ln.c))
const inSide = (ln: Bound, p: P) => (ln.above ? g(ln, p) > 0 : g(ln, p) < 0)

export function RegionPick({ spec, disabled, onSubmit }: { spec: Draw; disabled: boolean; onSubmit: (ok: boolean) => void }) {
  const lines = spec.reg!
  const svg = useRef<SVGSVGElement>(null)
  const [pt, setPt] = useState<P | null>(null)
  const [right, setRight] = useState(false)
  const [done, setDone] = useState(false)
  const raw = (e: React.PointerEvent): P | null => {
    const r = svg.current!.getBoundingClientRect()
    const x = spec.xmin + ((((e.clientX - r.left) / r.width) * W - ML) / PW) * (spec.xmax - spec.xmin)
    const y = spec.ymax - ((((e.clientY - r.top) / r.height) * H - MT) / PH) * (spec.ymax - spec.ymin)
    return x < spec.xmin || x > spec.xmax || y < spec.ymin || y > spec.ymax ? null : [x, y]
  }
  const sig = (p: P) => lines.map((ln) => (g(ln, p) >= 0 ? 1 : 0)).join('')
  // the clicked region: every cell of a fine grid that is on the same side of every boundary as the clicked point (rows of equal cells become one rectangle)
  const region = (): string => {
    if (!pt) return ''
    const target = sig(pt)
    const dx = (spec.xmax - spec.xmin) / CELLS, dy = (spec.ymax - spec.ymin) / CELLS
    let out = ''
    for (let j = 0; j < CELLS; j++) {
      const y = spec.ymax - (j + 0.5) * dy
      let run = -1
      for (let i = 0; i <= CELLS; i++) {
        const hit = i < CELLS && sig([spec.xmin + (i + 0.5) * dx, y]) === target
        if (hit && run < 0) run = i
        if (!hit && run >= 0) {
          out += `<rect x="${px(spec, spec.xmin + run * dx)}" y="${py(spec, spec.ymax - j * dy)}" width="${((i - run) * dx * PW) / (spec.xmax - spec.xmin)}" height="${(dy * PH) / (spec.ymax - spec.ymin) + 0.6}" fill="#8ec0fa" fill-opacity="0.55"/>`
          run = -1
        }
      }
    }
    return out
  }
  const curveSvg = lines.map((ln, i) => {
    const dash = ln.dashed ? ' stroke-dasharray="9 6"' : ''
    if (ln.vx !== undefined) return `<line x1="${px(spec, ln.vx)}" y1="${MT}" x2="${px(spec, ln.vx)}" y2="${MT + PH}" stroke="${COLORS[i]}" stroke-width="3"${dash}/>`
    if (ln.a !== undefined) {
      let d = ''
      let pen = false
      for (let s = 0; s <= 300; s++) {
        const x = spec.xmin + ((spec.xmax - spec.xmin) * s) / 300, y = ln.a * (x - ln.h!) ** 2 + ln.k!
        if (y < spec.ymin || y > spec.ymax) { pen = false; continue }
        d += `${pen ? 'L' : 'M'}${px(spec, x).toFixed(1)} ${py(spec, y).toFixed(1)} `
        pen = true
      }
      return `<path d="${d}" fill="none" stroke="${COLORS[i]}" stroke-width="3"${dash}/>`
    }
    const cl = clipLine(ln.m, ln.c, spec)
    return cl ? `<line x1="${px(spec, cl[0])}" y1="${py(spec, cl[1])}" x2="${px(spec, cl[2])}" y2="${py(spec, cl[3])}" stroke="${COLORS[i]}" stroke-width="3"${dash}/>` : ''
  }).join('')
  return (
    <div className="space-y-3">
      <p className="text-center text-sm text-slate-500">{done ? 'Press Submit.' : pt ? 'Click another region to change, or press Submit.' : 'Click the region that is the solution of the system…'}</p>
      <svg
        ref={svg}
        viewBox={`0 0 ${W} ${H}`}
        className="mx-auto block w-full max-w-[460px] rounded-xl border bg-white"
        style={{ touchAction: 'none', cursor: disabled || done ? 'default' : 'crosshair' }}
        onPointerDown={(e) => {
          if (disabled || done) return
          const p = raw(e)
          if (p && lines.every((ln) => Math.abs(g(ln, p)) > 0.05 * Math.max(1, spec.ys))) setPt(p)
        }}
      >
        <g dangerouslySetInnerHTML={{ __html: planeBg(spec) }} />
        <g dangerouslySetInnerHTML={{ __html: region() }} />
        <g dangerouslySetInnerHTML={{ __html: curveSvg }} />
        {pt && <circle cx={px(spec, pt[0])} cy={py(spec, pt[1])} r={4} fill="#1d4ed8" />}
      </svg>
      <div className="flex items-center justify-center gap-3">
        <button className="rounded-lg bg-emerald-500 px-6 py-2 font-bold text-white disabled:opacity-40" disabled={disabled || done || !pt} onClick={() => { const r = lines.every((ln) => inSide(ln, pt!)); setRight(r); setDone(true); onSubmit(r) }}>
          Submit
        </button>
        {right && <span className="text-3xl font-bold text-emerald-500">✓</span>}
      </div>
    </div>
  )
}
