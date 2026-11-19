// A number line to put dots (or numbers) on: drag each chip from the row below onto a tick, let go to drop it, drag it off to take it back.
// Submit when every chip is on the line. Right = each numbered chip on its own tick, or (plain dots) the covered ticks are exactly the answer.
// Imported by: quiz.tsx. Shape of `Place`: exercise.ts.
import katex from 'katex'
import { useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import type { Place } from './exercise'

const tex = (s: string) => ({ __html: katex.renderToString(s, { throwOnError: false }) })

export function PlaceLine({ spec, disabled, onSubmit }: { spec: Place; disabled: boolean; onSubmit: (ok: boolean) => void }) {
  const ticks = Array.from({ length: spec.hi - spec.lo + 1 }, (_, k) => spec.lo + k)
  const [onTick, setOnTick] = useState<Record<number, number>>({}) // tick value -> chip index
  const [drag, setDrag] = useState<{ i: number; x: number; y: number } | null>(null)
  const cells = useRef<Record<number, HTMLDivElement | null>>({})
  const placed = new Set(Object.values(onTick))
  const label = (i: number) => spec.chips[i]

  const start = (i: number, e: PointerEvent) => {
    if (disabled) return
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    setDrag({ i, x: e.clientX, y: e.clientY })
  }
  const move = (e: PointerEvent) => drag && setDrag({ ...drag, x: e.clientX, y: e.clientY })
  const end = (e: PointerEvent) => {
    if (!drag) return
    let hit: number | null = null
    let best = Infinity
    for (const t of ticks) {
      const el = cells.current[t]
      if (!el) continue
      const r = el.getBoundingClientRect()
      const near = Math.abs(e.clientY - (r.top + r.bottom) / 2) < r.height * 1.1
      const dx = Math.abs(e.clientX - (r.left + r.right) / 2)
      if (near && dx < r.width * 0.9 && dx < best) {
        best = dx
        hit = t
      }
    }
    const i = drag.i
    setOnTick((s) => {
      const t: Record<number, number> = {}
      for (const [k, v] of Object.entries(s)) if (v !== i) t[Number(k)] = v
      if (hit !== null) t[hit] = i
      return t
    })
    setDrag(null)
  }
  const chip = (i: number, key: string) => {
    const plain = label(i) === ''
    return (
      <div
        key={key}
        onPointerDown={(e) => start(i, e)}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
        style={{ touchAction: 'none', opacity: drag?.i === i ? 0.3 : 1, cursor: disabled ? 'default' : 'grab' }}
        className={plain ? 'h-5 w-5 select-none rounded-full border-2 border-sky-700 bg-sky-500' : 'select-none whitespace-nowrap rounded-lg border-2 border-sky-300 bg-white px-1.5 py-0.5 text-base shadow-sm'}
        dangerouslySetInnerHTML={plain ? undefined : tex(label(i))}
      />
    )
  }
  const submit = () => {
    const labelled = spec.chips.every((c) => c !== '')
    const ok = labelled
      ? Object.entries(onTick).every(([t, i]) => spec.at[i] === Number(t))
      : Object.keys(onTick).map(Number).sort((a, b) => a - b).join(',') === [...spec.at].sort((a, b) => a - b).join(',')
    onSubmit(ok)
  }
  const ghost = { position: 'fixed', transform: 'translate(-50%, -50%)', pointerEvents: 'none', zIndex: 50 } as const
  return (
    <div className="space-y-4">
      <div className="mx-auto rounded-xl border bg-white px-2 pb-2 pt-3">
        <div className="relative">
          <div className="absolute left-0 right-0 top-[34px] h-1 -translate-y-1/2 rounded bg-slate-500" />
          <div className="relative flex justify-between">
            {ticks.map((t) => (
              <div key={t} className="flex flex-1 flex-col items-center" style={{ minWidth: 0 }}>
                <div
                  ref={(el) => {
                    cells.current[t] = el
                  }}
                  className="flex h-[68px] w-full items-center justify-center"
                >
                  {onTick[t] !== undefined ? chip(onTick[t], `t${t}`) : <div className="h-4 w-0.5 bg-slate-500" />}
                </div>
                <div className="text-sm text-slate-700">{t}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex min-h-12 flex-wrap items-center justify-center gap-2">{spec.chips.map((_, i) => !placed.has(i) && chip(i, `p${i}`))}</div>
      <div className="flex items-center justify-center gap-3">
        <button className="rounded-lg bg-emerald-500 px-6 py-2 font-bold text-white disabled:opacity-40" disabled={disabled || placed.size !== spec.chips.length} onClick={submit}>
          Submit
        </button>
      </div>
      {drag &&
        (label(drag.i) === '' ? (
          <div style={{ ...ghost, left: drag.x, top: drag.y }} className="h-6 w-6 rounded-full border-2 border-sky-700 bg-sky-500 shadow-lg" />
        ) : (
          <div style={{ ...ghost, left: drag.x, top: drag.y }} className="whitespace-nowrap rounded-lg border-2 border-sky-500 bg-white px-2 py-1 text-lg shadow-lg" dangerouslySetInnerHTML={tex(label(drag.i))} />
        ))}
    </div>
  )
}
