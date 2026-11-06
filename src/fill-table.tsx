// A table the student fills in by typing: boxes for the missing cells, Submit. Right = every box holds the right number (a whole number, a decimal or a fraction like 8/3).
// Imported by: quiz.tsx. Shape of `Fill`: exercise.ts.
import katex from 'katex'
import { useState } from 'react'
import type { Fill } from './exercise'

// "8/3", "-1.5", "−3", " 2 " -> number (NaN when it is not one)
const parse = (s: string) => {
  const t = s.replace(/\s+/g, '').replace(/[−–]/g, '-')
  const f = /^(-?\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/.exec(t)
  return f ? Number(f[1]) / Number(f[2]) : /^-?\d+(?:\.\d+)?$/.test(t) ? Number(t) : NaN
}
const tex = (s: string) => ({ __html: katex.renderToString(s, { throwOnError: false }) })

export function FillTable({ spec, disabled, onSubmit }: { spec: Fill; disabled: boolean; onSubmit: (ok: boolean) => void }) {
  const [vals, setVals] = useState<string[]>(() => spec.answers.map(() => ''))
  let k = -1
  const submit = () => onSubmit(spec.answers.every((a, i) => Math.abs(parse(vals[i]) - a) < 1e-6))
  return (
    <div className="space-y-3">
      <div className="mx-auto w-fit rounded-xl border bg-white p-4">
        <table className="border-collapse text-xl">
          <tbody>
            {spec.rows.map((r, ri) => (
              <tr key={ri} className={ri === 0 ? 'border-b-2 border-slate-400' : ''}>
                <th className="border-r-2 border-slate-400 px-4 py-2 text-left font-serif italic" dangerouslySetInnerHTML={tex(r.label)} />
                {r.cells.map((c, ci) => {
                  if (c !== null) return <td key={ci} className="px-5 py-2 text-center" dangerouslySetInnerHTML={tex(c)} />
                  const i = ++k
                  return (
                    <td key={ci} className="px-2 py-2 text-center">
                      <input
                        value={vals[i]}
                        disabled={disabled}
                        inputMode="text"
                        autoComplete="off"
                        onChange={(e) => setVals((v) => v.map((x, j) => (j === i ? e.target.value : x)))}
                        onKeyDown={(e) => e.key === 'Enter' && vals.every((v) => v.trim()) && !disabled && submit()}
                        className="w-20 rounded-md border-2 border-sky-400 bg-sky-50 px-2 py-1 text-center text-xl outline-none focus:border-sky-600"
                      />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-center gap-3">
        <button className="rounded-lg bg-emerald-500 px-6 py-2 font-bold text-white disabled:opacity-40" disabled={disabled || vals.some((v) => !v.trim())} onClick={submit}>
          Submit
        </button>
      </div>
    </div>
  )
}
