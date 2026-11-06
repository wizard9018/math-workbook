// Options that can all be ticked (any number, also none): click an option to tick or untick it, then Submit. Right = exactly the right options are ticked.
// Imported by: quiz.tsx. Shape of `Multi`: exercise.ts.
import katex from 'katex'
import { useState } from 'react'
import type { Multi } from './exercise'

const tex = (s: string) => ({ __html: katex.renderToString(s, { throwOnError: false }) })

export function MultiPick({ spec, disabled, onSubmit }: { spec: Multi; disabled: boolean; onSubmit: (ok: boolean) => void }) {
  const [on, setOn] = useState<number[]>([])
  const toggle = (i: number) => !disabled && setOn((s) => (s.includes(i) ? s.filter((v) => v !== i) : [...s, i]))
  const ok = () => on.length === spec.right.length && spec.right.every((r) => on.includes(r))
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {spec.options.map((o, i) => (
          <button
            key={i}
            type="button"
            onClick={() => toggle(i)}
            className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-lg ${on.includes(i) ? 'border-sky-500 bg-sky-50' : 'border-slate-200 bg-white'}`}
          >
            <span className={`flex h-6 w-6 items-center justify-center rounded border-2 text-sm font-bold ${on.includes(i) ? 'border-sky-500 bg-sky-500 text-white' : 'border-slate-300'}`}>{on.includes(i) ? '✓' : ''}</span>
            <span dangerouslySetInnerHTML={tex(o)} />
          </button>
        ))}
      </div>
      <div className="flex justify-center">
        <button className="rounded-lg bg-emerald-500 px-6 py-2 font-bold text-white disabled:opacity-40" disabled={disabled} onClick={() => onSubmit(ok())}>
          Submit
        </button>
      </div>
    </div>
  )
}
