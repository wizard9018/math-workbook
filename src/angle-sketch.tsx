// Sketch an angle in standard position: click the terminal side (the ray snaps to every 5 degrees), choose counterclockwise or clockwise, Submit.
// Right = the signed measure (counterclockwise 0..360, clockwise -360..0) is the angle of the question. Imported by: quiz.tsx. Spec: `Draw` with `ang` (exercise.ts).
import { useRef, useState } from 'react'
import type { Draw } from './exercise'

const S = 340, C = S / 2, R = 128
const rad = (d: number) => (d * Math.PI) / 180
const pt = (d: number, r: number): [number, number] => [C + r * Math.cos(rad(d)), C - r * Math.sin(rad(d))]

export function AngleSketch({ spec, disabled, onSubmit }: { spec: Draw; disabled: boolean; onSubmit: (ok: boolean) => void }) {
  const svg = useRef<SVGSVGElement>(null)
  const [phi, setPhi] = useState<number | null>(null) // the terminal side, 0..355 counterclockwise from the positive x-axis
  const [hover, setHover] = useState<number | null>(null)
  const [ccw, setCcw] = useState<boolean | null>(null)
  const [right, setRight] = useState(false)
  const [done, setDone] = useState(false)
  const angleAt = (e: React.PointerEvent): number => {
    const r = svg.current!.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width) * S - C, y = C - ((e.clientY - r.top) / r.height) * S
    return (Math.round((((Math.atan2(y, x) * 180) / Math.PI) + 360) % 360 / 5) * 5) % 360
  }
  const shown = phi ?? (disabled || done ? null : hover)
  const signed = phi === null || ccw === null ? null : ccw ? phi : phi === 0 ? 0 : phi - 360
  // the arc from the initial side to the terminal side, in the chosen direction
  const arc = () => {
    if (shown === null) return null
    const turn = ccw === false ? (shown === 0 ? 0 : shown - 360) : shown
    const [x0, y0] = pt(0, 34), [x1, y1] = pt(shown, 34)
    return <path d={`M${x0} ${y0} A34 34 0 ${Math.abs(turn) > 180 ? 1 : 0} ${turn >= 0 ? 0 : 1} ${x1} ${y1}`} fill="none" stroke="#ea580c" strokeWidth={3} markerEnd="url(#ah)" />
  }
  const ticks = []
  for (let d = 0; d < 360; d += 5) {
    const major = d % 30 === 0
    const [a, b] = pt(d, R), [c, e] = pt(d, R + (major ? 9 : 4))
    ticks.push(<line key={d} x1={a} y1={b} x2={c} y2={e} stroke={major ? '#64748b' : '#cbd5e1'} strokeWidth={major ? 1.5 : 1} />)
  }
  const say = done ? 'Press Submit.' : phi === null ? 'Click the terminal side of the angle…' : ccw === null ? 'Choose the direction of rotation…' : 'Press Submit.'
  const btn = 'rounded-lg border-2 px-4 py-2 font-semibold disabled:opacity-40'
  const pick = (on: boolean) => (on ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-slate-300 bg-white text-slate-700')
  return (
    <div className="space-y-3">
      <p className="text-center text-sm text-slate-500">{say}</p>
      <svg
        ref={svg}
        viewBox={`0 0 ${S} ${S}`}
        className="mx-auto block w-full max-w-[340px] rounded-xl border bg-white"
        style={{ touchAction: 'none', cursor: disabled || done ? 'default' : 'crosshair' }}
        onPointerMove={(e) => setHover(angleAt(e))}
        onPointerLeave={() => setHover(null)}
        onPointerDown={(e) => { if (!disabled && !done) setPhi(angleAt(e)) }}
      >
        <defs><marker id="ah" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="#ea580c" /></marker></defs>
        <circle cx={C} cy={C} r={R} fill="none" stroke="#e2e8f0" />
        {ticks}
        <line x1={C - R - 14} y1={C} x2={C + R + 14} y2={C} stroke="#334155" strokeWidth={2} />
        <line x1={C} y1={C - R - 14} x2={C} y2={C + R + 14} stroke="#334155" strokeWidth={2} />
        <text x={C + R + 18} y={C + 16} fontSize={13} fill="#334155">x</text>
        <text x={C + 8} y={C - R - 16} fontSize={13} fill="#334155">y</text>
        <line x1={C} y1={C} x2={C + R} y2={C} stroke="#94a3b8" strokeWidth={3} />
        {shown !== null && <line x1={C} y1={C} x2={pt(shown, R)[0]} y2={pt(shown, R)[1]} stroke="#0284c7" strokeWidth={3} opacity={phi === null ? 0.5 : 1} />}
        {arc()}
        {signed !== null && <text x={C} y={S - 8} textAnchor="middle" fontSize={15} fill="#0f172a">{signed}°</text>}
      </svg>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button className={`${btn} ${pick(ccw === true)}`} disabled={disabled || done || phi === null} onClick={() => setCcw(true)}>Counterclockwise</button>
        <button className={`${btn} ${pick(ccw === false)}`} disabled={disabled || done || phi === null} onClick={() => setCcw(false)}>Clockwise</button>
        <button className="rounded-lg bg-emerald-500 px-6 py-2 font-bold text-white disabled:opacity-40" disabled={disabled || done || signed === null} onClick={() => { const r = signed === spec.ang; setRight(r); setDone(true); onSubmit(r) }}>Submit</button>
        {right && <span className="text-3xl font-bold text-emerald-500">✓</span>}
      </div>
    </div>
  )
}
