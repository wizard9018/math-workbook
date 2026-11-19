// A number line to graph an inequality on: click a tick to put an endpoint there (click again: open circle, then closed, then none), and click the grey bar under a
// part of the line to shade it (an outer part gets an arrow). Submit. Right = the same endpoints (open / closed) and the same shaded parts as `spec.answer`.
// Imported by: quiz.tsx. Shape of `Ineq`: exercise.ts. Made from the answer text by bank-data.ts (ineqSpec).
import { useState } from 'react'
import type { Ineq } from './exercise'

const COL = '#0284c7'
const W = 440
const fmt = (v: number) => (Number.isInteger(v) ? String(v) : String(+v.toFixed(3)))

export function IneqLine({ spec, disabled, onSubmit }: { spec: Ineq; disabled: boolean; onSubmit: (ok: boolean) => void }) {
  const n = Math.round((spec.hi - spec.lo) / spec.unit)
  const ticks = Array.from({ length: n + 1 }, (_, k) => +(spec.lo + k * spec.unit).toFixed(9))
  const X = (v: number) => 26 + ((v - spec.lo) / (spec.hi - spec.lo)) * (W - 52)
  const [state, setState] = useState<Record<string, 'open' | 'closed'>>({}) // tick value (as text) -> its circle
  const [shade, setShade] = useState<Record<number, boolean>>({}) // region index -> shaded
  const key = (v: number) => fmt(v)
  const pts = ticks.filter((t) => state[key(t)]).map((t) => ({ v: t, closed: state[key(t)] === 'closed' }))
  // the parts of the line between the endpoints (and the two ends): region i lies between pts[i-1] and pts[i]
  const left = (i: number) => (i === 0 ? 8 : X(pts[i - 1].v))
  const right = (i: number) => (i === pts.length ? W - 8 : X(pts[i].v))
  const same = (a: number, b: number) => Math.abs(a - b) < 1e-9

  const click = (t: number) => {
    if (disabled) return
    const cur = state[key(t)]
    setState((s) => {
      const c = { ...s }
      if (!cur) c[key(t)] = 'open'
      else if (cur === 'open') c[key(t)] = 'closed'
      else delete c[key(t)]
      return c
    })
    setShade({}) // the parts change with the endpoints
  }
  const ok = () => {
    const a = spec.answer
    if (pts.length !== a.pts.length) return false
    if (!pts.every((p, i) => same(p.v, a.pts[i].v) && p.closed === a.pts[i].closed)) return false
    return a.shaded.every((s, i) => !!shade[i] === s)
  }
  const [done, setDone] = useState(false)
  const arrowL = (i: number) => i === 0
  const arrowR = (i: number) => i === pts.length

  return (
    <div className="space-y-2">
      <p className="text-center text-sm text-slate-500">Graph the answer on the number line: click a tick to put an endpoint on it (click again: open ○, closed ●, none), then click the grey bar under each part to shade it.</p>
      <svg viewBox={`0 0 ${W} 120`} className="mx-auto block w-full max-w-[460px] rounded-xl border bg-white" style={{ touchAction: 'none' }}>
        <line x1={8} y1={44} x2={W - 8} y2={44} stroke="#475569" strokeWidth={2} />
        <polygon points={`${W - 4},44 ${W - 14},39 ${W - 14},49`} fill="#475569" />
        <polygon points="4,44 14,39 14,49" fill="#475569" />
        {ticks.map((t) => (
          <g key={t}>
            <line x1={X(t)} y1={38} x2={X(t)} y2={50} stroke="#475569" strokeWidth={2} />
            <text x={X(t)} y={68} textAnchor="middle" fontSize={13} fill="#334155">{fmt(t)}</text>
          </g>
        ))}
        {/* the shaded parts of the line */}
        {Array.from({ length: pts.length + 1 }, (_, i) => i).map((i) => shade[i] && (
          <g key={`s${i}`}>
            <line x1={arrowL(i) ? 12 : left(i)} y1={44} x2={arrowR(i) ? W - 12 : right(i)} y2={44} stroke={COL} strokeWidth={6} />
            {arrowL(i) && <polygon points="6,44 20,36 20,52" fill={COL} />}
            {arrowR(i) && <polygon points={`${W - 6},44 ${W - 20},36 ${W - 20},52`} fill={COL} />}
          </g>
        ))}
        {/* the endpoints */}
        {pts.map((p) => <circle key={p.v} cx={X(p.v)} cy={44} r={7} fill={p.closed ? COL : '#fff'} stroke={COL} strokeWidth={3} />)}
        {/* clickable ticks */}
        {ticks.map((t) => <circle key={`h${t}`} cx={X(t)} cy={44} r={Math.min(14, (X(ticks[1] ?? ticks[0] + 1) - X(ticks[0])) / 2)} fill="transparent" style={{ cursor: disabled ? 'default' : 'pointer' }} onClick={() => click(t)} />)}
        {/* the bars to click for shading */}
        {Array.from({ length: pts.length + 1 }, (_, i) => i).map((i) => (
          <g key={`b${i}`} onClick={() => !disabled && setShade((s) => ({ ...s, [i]: !s[i] }))} style={{ cursor: disabled ? 'default' : 'pointer' }}>
            <rect x={left(i) + (i === 0 ? 0 : 5)} y={86} width={Math.max(6, right(i) - left(i) - (i === 0 ? 5 : i === pts.length ? 5 : 10))} height={22} rx={6} fill={shade[i] ? COL : '#e2e8f0'} fillOpacity={shade[i] ? 0.85 : 1} />
          </g>
        ))}
      </svg>
      <div className="flex items-center justify-center gap-3">
        <button className="rounded-lg border-2 border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 disabled:opacity-40" disabled={disabled || (!pts.length && !Object.values(shade).some(Boolean))} onClick={() => { setState({}); setShade({}) }}>
          Clear
        </button>
        <button className="rounded-lg bg-emerald-500 px-6 py-2 font-bold text-white disabled:opacity-40" disabled={disabled || !pts.length || !Object.values(shade).some(Boolean)} onClick={() => { const r = ok(); setDone(r); onSubmit(r) }}>
          Submit
        </button>
        {done && <span className="text-3xl font-bold text-emerald-500">✓</span>}
      </div>
    </div>
  )
}
