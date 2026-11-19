// A number line to mark numbers on. One number (spec without `items`): click or drag on the line where it lies, Submit; right = within `spec.tol` of `spec.at`.
// Several numbers (`spec.items`): select a number below the line, then click its place (drag to adjust); Submit when all are on the line;
// right = every one within `tol` of its true position and in the right order. The dot snaps to tenths. Imported by: quiz.tsx. Shape of `Mark`: exercise.ts.
import katex from 'katex'
import { useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import type { Mark } from './exercise'

const W = 440
const COL = '#0284c7'
const fmt = (v: number) => (Number.isInteger(v) ? String(v) : String(+v.toFixed(2))).replace('-', '−')
const tex = (s: string) => ({ __html: katex.renderToString(s, { throwOnError: false }) })

export function MarkLine({ spec, disabled, onSubmit }: { spec: Mark; disabled: boolean; onSubmit: (ok: boolean) => void }) {
  const svg = useRef<SVGSVGElement>(null)
  const items = spec.items
  const [pos, setPos] = useState<Record<number, number>>({}) // item index (0 for the single number) -> where it was put
  const [sel, setSel] = useState<number>(0) // the number being put on the line
  const [done, setDone] = useState(false)
  const [down, setDown] = useState(false)
  const count = items ? items.length : 1
  const ticks = Array.from({ length: spec.hi - spec.lo + 1 }, (_, k) => spec.lo + k)
  const X = (v: number) => 26 + ((v - spec.lo) / (spec.hi - spec.lo)) * (W - 52)
  const at = (e: PointerEvent) => {
    const r = svg.current!.getBoundingClientRect()
    const vx = ((e.clientX - r.left) / r.width) * W
    const v = spec.lo + ((vx - 26) / (W - 52)) * (spec.hi - spec.lo)
    return Math.min(spec.hi, Math.max(spec.lo, Math.round(v * 10) / 10))
  }
  const put = (e: PointerEvent) => {
    const v = at(e)
    setPos((p) => ({ ...p, [sel]: v }))
  }
  const placed = Object.keys(pos).length
  const ok = () => {
    if (!items) return Math.abs(pos[0] - spec.at) <= spec.tol
    if (!items.every((it, i) => Math.abs(pos[i] - it.at) <= spec.tol)) return false
    const byTrue = items.map((_, i) => i).sort((a, b) => items[a].at - items[b].at)
    return byTrue.every((i, k) => k === 0 || pos[byTrue[k - 1]] <= pos[i])
  }
  const choose = (i: number) => !disabled && setSel(i)
  const next = (from: number) => {
    for (let k = 1; k <= count; k++) { const j = (from + k) % count; if (pos[j] === undefined && j !== from) return j }
    return from
  }
  // the order on the line decides how high a label sits (so that neighbours do not cover each other)
  const order = Object.keys(pos).map(Number).sort((a, b) => pos[a] - pos[b])
  return (
    <div className="space-y-2">
      <p className="text-center text-sm text-slate-500">
        {items ? 'Select a number below, then click its place on the number line (you can drag it). Put every number on the line, then press Submit.' : 'Click on the number line where the number lies (you can drag the dot), then press Submit.'}
      </p>
      <div className="relative mx-auto w-full max-w-[460px]">
        <svg
          ref={svg}
          viewBox={`0 0 ${W} ${items ? 120 : 90}`}
          className="block w-full rounded-xl border bg-white"
          style={{ touchAction: 'none', cursor: disabled ? 'default' : 'crosshair' }}
          onPointerDown={(e) => { if (disabled) return; (e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId); setDown(true); put(e) }}
          onPointerMove={(e) => { if (!disabled && down) put(e) }}
          onPointerUp={() => { setDown(false); if (items && pos[sel] !== undefined) setSel(next(sel)) }}
          onPointerCancel={() => setDown(false)}
        >
          <line x1={8} y1={items ? 74 : 46} x2={W - 8} y2={items ? 74 : 46} stroke="#475569" strokeWidth={2} />
          <polygon points={`${W - 4},${items ? 74 : 46} ${W - 14},${items ? 69 : 41} ${W - 14},${items ? 79 : 51}`} fill="#475569" />
          <polygon points={`4,${items ? 74 : 46} 14,${items ? 69 : 41} 14,${items ? 79 : 51}`} fill="#475569" />
          {ticks.map((t) => (
            <g key={t}>
              <line x1={X(t)} y1={items ? 67 : 39} x2={X(t)} y2={items ? 81 : 53} stroke="#475569" strokeWidth={2} />
              <text x={X(t)} y={items ? 100 : 72} textAnchor="middle" fontSize={13} fill="#334155">{fmt(t)}</text>
            </g>
          ))}
          {Object.entries(pos).map(([i, v]) => <circle key={i} cx={X(v)} cy={items ? 74 : 46} r={7} fill={Number(i) === sel && items ? '#f97316' : COL} stroke="#fff" strokeWidth={2} />)}
        </svg>
        {items && order.map((i, k) => (
          <span
            key={i}
            className="pointer-events-none absolute -translate-x-1/2 whitespace-nowrap rounded bg-white/90 px-0.5 text-sm"
            style={{ left: `${(X(pos[i]) / W) * 100}%`, top: k % 2 ? '4%' : '22%' }}
            dangerouslySetInnerHTML={tex(items[i].label)}
          />
        ))}
      </div>
      {items && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {items.map((it, i) => (
            <button
              key={i}
              onClick={() => choose(i)}
              className={'rounded-lg border-2 px-3 py-1 text-lg ' + (i === sel ? 'border-orange-400 bg-orange-50' : pos[i] !== undefined ? 'border-sky-300 bg-sky-50' : 'border-slate-300 bg-white')}
              dangerouslySetInnerHTML={tex(it.label)}
            />
          ))}
        </div>
      )}
      <div className="flex items-center justify-center gap-3">
        <button className="rounded-lg border-2 border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 disabled:opacity-40" disabled={disabled || !placed} onClick={() => { setPos({}); setSel(0) }}>
          Clear
        </button>
        <button className="rounded-lg bg-emerald-500 px-6 py-2 font-bold text-white disabled:opacity-40" disabled={disabled || placed < count} onClick={() => { const r = ok(); setDone(r); onSubmit(r) }}>
          Submit
        </button>
        {done && <span className="text-3xl font-bold text-emerald-500">✓</span>}
      </div>
    </div>
  )
}
