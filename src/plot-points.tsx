// A coordinate plane to plot named points on: select a point (A, B ...) below the plane, then click the grid crossing where it goes (it snaps to the grid; click
// somewhere else to move it). Submit when every point is on the plane. Right = every point on its own crossing. Imported by: quiz.tsx. Shape of `Plot`: exercise.ts.
import { useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import type { Draw, Plot } from './exercise'
import { H, ML, MT, PH, PW, W, planeBg, px, py } from './plane'

export function PlotPoints({ spec, disabled, onSubmit }: { spec: Plot; disabled: boolean; onSubmit: (ok: boolean) => void }) {
  const svg = useRef<SVGSVGElement>(null)
  const d: Draw = { ...spec, m: 0, c: 0 }
  const [pos, setPos] = useState<Record<number, [number, number]>>({})
  const [sel, setSel] = useState(0)
  const [done, setDone] = useState(false)
  const n = spec.items.length
  const snap = (e: PointerEvent): [number, number] | null => {
    const r = svg.current!.getBoundingClientRect()
    const vx = ((e.clientX - r.left) / r.width) * W
    const vy = ((e.clientY - r.top) / r.height) * H
    const x = spec.xmin + ((vx - ML) / PW) * (spec.xmax - spec.xmin)
    const y = spec.ymax - ((vy - MT) / PH) * (spec.ymax - spec.ymin)
    const sx = Math.round(x / spec.xs) * spec.xs, sy = Math.round(y / spec.ys) * spec.ys
    if (sx < spec.xmin || sx > spec.xmax || sy < spec.ymin || sy > spec.ymax) return null
    return [sx, sy]
  }
  const nextFree = (from: number, p: Record<number, [number, number]>) => {
    for (let k = 1; k <= n; k++) { const j = (from + k) % n; if (!p[j]) return j }
    return from
  }
  const placed = Object.keys(pos).length
  return (
    <div className="space-y-3">
      <p className="text-center text-sm text-slate-500">Select a point below, then click the place on the grid where it goes. Put every point on the grid, then press Submit.</p>
      <svg
        ref={svg}
        viewBox={`0 0 ${W} ${H}`}
        className="mx-auto block w-full max-w-[460px] rounded-xl border bg-white"
        style={{ touchAction: 'none', cursor: disabled ? 'default' : 'crosshair' }}
        onPointerDown={(e) => {
          if (disabled) return
          const p = snap(e)
          if (!p) return
          const next = { ...pos, [sel]: p }
          setPos(next)
          setSel(nextFree(sel, next))
        }}
      >
        <g dangerouslySetInnerHTML={{ __html: planeBg(d) }} />
        {Object.entries(pos).map(([i, p]) => (
          <g key={i}>
            <circle cx={px(d, p[0])} cy={py(d, p[1])} r={6} fill="#f97316" stroke="#fff" strokeWidth={1.5} />
            <text x={px(d, p[0]) + 9} y={py(d, p[1]) - 8} fontSize={15} fontWeight={700} fill="#0f172a" stroke="#fff" strokeWidth={4} paintOrder="stroke">{spec.items[Number(i)].label}</text>
          </g>
        ))}
      </svg>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {spec.items.map((it, i) => (
          <button
            key={i}
            disabled={disabled}
            onClick={() => setSel(i)}
            className={'rounded-lg border-2 px-3 py-1 text-base font-semibold ' + (i === sel ? 'border-orange-400 bg-orange-50' : pos[i] ? 'border-sky-300 bg-sky-50' : 'border-slate-300 bg-white')}
          >
            {spec.hide ? it.label : `${it.label}(${it.x}, ${it.y})`}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-center gap-3">
        <button className="rounded-lg border-2 border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 disabled:opacity-40" disabled={disabled || !placed} onClick={() => { setPos({}); setSel(0) }}>
          Clear
        </button>
        <button className="rounded-lg bg-emerald-500 px-6 py-2 font-bold text-white disabled:opacity-40" disabled={disabled || placed < n} onClick={() => { const r = spec.items.every((it, i) => pos[i] && pos[i][0] === it.x && pos[i][1] === it.y); setDone(r); onSubmit(r) }}>
          Submit
        </button>
        {done && <span className="text-3xl font-bold text-emerald-500">✓</span>}
      </div>
    </div>
  )
}
