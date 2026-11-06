// Numbers to put in order on a number line: drag each number from the row below onto a place of the line (smallest on the left), let go to drop it,
// drag it off to take it back. Submit when every place holds a number. Right = every place holds the right number.
// Imported by: quiz.tsx. Shape of `Sort`: exercise.ts.
import katex from 'katex'
import { useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import type { Sort } from './exercise'

const tex = (s: string) => ({ __html: katex.renderToString(s, { throwOnError: false }) })

export function SortLine({ spec, disabled, onSubmit }: { spec: Sort; disabled: boolean; onSubmit: (ok: boolean) => void }) {
  const n = spec.items.length
  const [slots, setSlots] = useState<(number | null)[]>(() => Array(n).fill(null))
  const [drag, setDrag] = useState<{ i: number; x: number; y: number } | null>(null)
  const slotEls = useRef<(HTMLDivElement | null)[]>([])
  const inSlot = new Set(slots.filter((v): v is number => v !== null))

  const start = (i: number, e: PointerEvent) => {
    if (disabled) return
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    setDrag({ i, x: e.clientX, y: e.clientY })
  }
  const move = (e: PointerEvent) => drag && setDrag({ ...drag, x: e.clientX, y: e.clientY })
  const end = (e: PointerEvent) => {
    if (!drag) return
    // the place whose middle is nearest to the pointer, if the pointer is on (or close to) the line
    let hit = -1
    let best = Infinity
    slotEls.current.forEach((el, k) => {
      if (!el) return
      const r = el.getBoundingClientRect()
      const near = Math.abs(e.clientY - (r.top + r.bottom) / 2) < r.height * 1.2
      const dx = Math.abs(e.clientX - (r.left + r.right) / 2)
      if (near && dx < r.width * 0.75 && dx < best) {
        best = dx
        hit = k
      }
    })
    const i = drag.i
    setSlots((s) => {
      const t = s.map((v) => (v === i ? null : v))
      if (hit >= 0) t[hit] = i
      return t
    })
    setDrag(null)
  }
  const chip = (i: number, key: string) => (
    <div
      key={key}
      onPointerDown={(e) => start(i, e)}
      onPointerMove={move}
      onPointerUp={end}
      onPointerCancel={end}
      style={{ touchAction: 'none', opacity: drag?.i === i ? 0.3 : 1, cursor: disabled ? 'default' : 'grab' }}
      className="select-none whitespace-nowrap rounded-lg border-2 border-sky-300 bg-white px-2 py-1 text-lg shadow-sm"
      dangerouslySetInnerHTML={tex(spec.items[i])}
    />
  )
  return (
    <div className="space-y-4">
      <div className="mx-auto rounded-xl border bg-white px-3 pb-3 pt-2">
        <div className="mb-1 flex justify-between text-sm text-slate-500">
          <span>smallest</span>
          <span>largest</span>
        </div>
        <div className="relative">
          <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded bg-slate-500" />
          <div className="relative flex items-center justify-between gap-1">
            {slots.map((v, k) => (
              <div
                key={k}
                ref={(el) => {
                  slotEls.current[k] = el
                }}
                className="flex h-14 flex-1 items-center justify-center rounded-lg border-2 border-dashed border-sky-400 bg-sky-50"
                style={{ minWidth: 0 }}
              >
                {v !== null && chip(v, `s${k}`)}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex min-h-12 flex-wrap items-center justify-center gap-2">{spec.items.map((_, i) => !inSlot.has(i) && chip(i, `p${i}`))}</div>
      <div className="flex items-center justify-center gap-3">
        <button className="rounded-lg bg-emerald-500 px-6 py-2 font-bold text-white disabled:opacity-40" disabled={disabled || slots.some((v) => v === null)} onClick={() => onSubmit(slots.every((v, k) => v === spec.order[k]))}>
          Submit
        </button>
      </div>
      {drag && <div style={{ position: 'fixed', left: drag.x, top: drag.y, transform: 'translate(-50%, -50%)', pointerEvents: 'none', zIndex: 50 }} className="whitespace-nowrap rounded-lg border-2 border-sky-500 bg-white px-2 py-1 text-lg shadow-lg" dangerouslySetInnerHTML={tex(spec.items[drag.i])} />}
    </div>
  )
}
