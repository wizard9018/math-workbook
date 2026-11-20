// Graph a linear inequality in two variables: click two points of the boundary line, choose solid or dashed, click the side (the region) to shade; Submit.
// Right = both points are on the boundary line, the line style matches (> and < dashed, >= and <= solid) and the clicked side is the solution side. Imported by: quiz.tsx. Spec: `Draw` with `ineq` (exercise.ts).
import { useRef, useState } from 'react'
import type { Draw } from './exercise'
import { H, ML, MT, PH, PW, W, clipLine, labelPos, nf, planeBg, px, py } from './plane'

type P = [number, number]
const BLUE = '#0284c7'

export function IneqDraw({ spec, disabled, onSubmit }: { spec: Draw; disabled: boolean; onSubmit: (ok: boolean) => void }) {
  const ineq = spec.ineq!
  const svg = useRef<SVGSVGElement>(null)
  const [pts, setPts] = useState<P[]>([])
  const [hover, setHover] = useState<P | null>(null)
  const [dashed, setDashed] = useState<boolean | null>(null)
  const [side, setSide] = useState<P | null>(null) // a point in the region the student shades
  const [right, setRight] = useState(false)
  const [done, setDone] = useState(false)
  const raw = (e: React.PointerEvent): P | null => {
    const r = svg.current!.getBoundingClientRect()
    const x = spec.xmin + ((((e.clientX - r.left) / r.width) * W - ML) / PW) * (spec.xmax - spec.xmin)
    const y = spec.ymax - ((((e.clientY - r.top) / r.height) * H - MT) / PH) * (spec.ymax - spec.ymin)
    return x < spec.xmin || x > spec.xmax || y < spec.ymin || y > spec.ymax ? null : [x, y]
  }
  const snap = (p: P): P => [+(spec.xmin + Math.round((p[0] - spec.xmin) / spec.xs) * spec.xs).toFixed(6), +(spec.ymin + Math.round((p[1] - spec.ymin) / spec.ys) * spec.ys).toFixed(6)]
  const same = (a: P, b: P) => Math.abs(a[0] - b[0]) < 1e-9 && Math.abs(a[1] - b[1]) < 1e-9
  const onTrue = (p: P) => (spec.vx !== undefined ? Math.abs(p[0] - spec.vx) < 1e-9 : Math.abs(p[1] - (spec.m * p[0] + spec.c)) < 1e-6)
  const two = pts.length === 2
  const live: [P, P] | null = two ? [pts[0], pts[1]] : pts.length === 1 && hover && !same(hover, pts[0]) ? [pts[0], hover] : null
  // the line through the two points: g(x, y) > 0 is its "above" (right) side
  const vertical = !!live && Math.abs(live[1][0] - live[0][0]) < 1e-9
  const m = live && !vertical ? (live[1][1] - live[0][1]) / (live[1][0] - live[0][0]) : 0
  const c = live && !vertical ? live[0][1] - m * live[0][0] : 0
  const g = (p: P) => (vertical ? p[0] - live![0][0] : p[1] - (m * p[0] + c))
  const poly = (): string => {
    if (!live || !two || !side) return ''
    const sign = g(side) >= 0 ? 1 : -1
    const ring: P[] = [[spec.xmin, spec.ymin], [spec.xmax, spec.ymin], [spec.xmax, spec.ymax], [spec.xmin, spec.ymax]]
    const out: P[] = []
    for (let i = 0; i < ring.length; i++) {
      const a = ring[i], b = ring[(i + 1) % ring.length]
      const ga = sign * g(a), gb = sign * g(b)
      if (ga >= 0) out.push(a)
      if ((ga >= 0) !== (gb >= 0)) { const t = ga / (ga - gb); out.push([a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])]) }
    }
    return out.length < 3 ? '' : `<polygon points="${out.map((q) => `${px(spec, q[0])},${py(spec, q[1])}`).join(' ')}" fill="#8ec0fa" fill-opacity="0.5"/>`
  }
  const lineSvg = (): string => {
    if (!live) return ''
    const dash = dashed ? ' stroke-dasharray="9 6"' : ''
    if (vertical) return `<line x1="${px(spec, live[0][0])}" y1="${MT}" x2="${px(spec, live[0][0])}" y2="${MT + PH}" stroke="${BLUE}" stroke-width="3"${dash}/>`
    const cl = clipLine(m, c, spec)
    return cl ? `<line x1="${px(spec, cl[0])}" y1="${py(spec, cl[1])}" x2="${px(spec, cl[2])}" y2="${py(spec, cl[3])}" stroke="${BLUE}" stroke-width="3"${dash}/>` : ''
  }
  const ok = () => {
    if (!two || dashed === null || !side || same(pts[0], pts[1]) || !pts.every(onTrue)) return false
    if (dashed !== ineq.dashed) return false
    const gt = spec.vx !== undefined ? side[0] - spec.vx : side[1] - (spec.m * side[0] + spec.c)
    return ineq.above ? gt > 0 : gt < 0
  }
  const say = done ? 'Press Submit.' : !two ? 'Click two points of the boundary line…' : dashed === null ? 'Choose a solid or a dashed line…' : !side ? 'Click the region to shade…' : 'Press Submit.'
  const dot = (p: P, key: string, ghost = false) => (
    <g key={key} opacity={ghost ? 0.6 : 1}>
      <circle cx={px(spec, p[0])} cy={py(spec, p[1])} r={6.5} fill={BLUE} stroke="#fff" strokeWidth={1.5} />
      {!ghost && <text x={labelPos(spec, p[0], p[1]).x} y={labelPos(spec, p[0], p[1]).y} textAnchor={labelPos(spec, p[0], p[1]).anchor} fontSize={13} fill="#0f172a">({nf(p[0])}, {nf(p[1])})</text>}
    </g>
  )
  const btn = 'rounded-lg border-2 px-4 py-2 font-semibold disabled:opacity-40'
  const pick = (on: boolean) => (on ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-slate-300 bg-white text-slate-700')

  return (
    <div className="space-y-3">
      <p className="text-center text-sm text-slate-500">{say}</p>
      <svg
        ref={svg}
        viewBox={`0 0 ${W} ${H}`}
        className="mx-auto block w-full max-w-[460px] rounded-xl border bg-white"
        style={{ touchAction: 'none', cursor: disabled || done ? 'default' : 'crosshair' }}
        onPointerMove={(e) => { const p = raw(e); setHover(p && !two ? snap(p) : null) }}
        onPointerLeave={() => setHover(null)}
        onPointerDown={(e) => {
          if (disabled || done) return
          const p = raw(e)
          if (!p) return
          if (!two) {
            const q = snap(p)
            if (pts.length === 1 && same(q, pts[0])) return
            setPts([...pts, q])
          } else setSide(p)
        }}
      >
        <g dangerouslySetInnerHTML={{ __html: planeBg(spec) }} />
        <g dangerouslySetInnerHTML={{ __html: poly() }} />
        <g dangerouslySetInnerHTML={{ __html: lineSvg() }} />
        {pts.map((p, i) => dot(p, `p${i}`))}
        {!two && !disabled && !done && hover && !pts.some((p) => same(p, hover)) && dot(hover, 'hover', true)}
        {side && <circle cx={px(spec, side[0])} cy={py(spec, side[1])} r={4} fill="#1d4ed8" />}
      </svg>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button className={`${btn} ${pick(dashed === false)}`} disabled={disabled || done || !two} onClick={() => setDashed(false)}>Solid line</button>
        <button className={`${btn} ${pick(dashed === true)}`} disabled={disabled || done || !two} onClick={() => setDashed(true)}>Dashed line</button>
        <button className={`${btn} border-slate-300 bg-white text-slate-700`} disabled={disabled || done || pts.length === 0} onClick={() => { setPts([]); setDashed(null); setSide(null) }}>Clear</button>
        <button className="rounded-lg bg-emerald-500 px-6 py-2 font-bold text-white disabled:opacity-40" disabled={disabled || done || !two || dashed === null || !side} onClick={() => { const r = ok(); setRight(r); setDone(true); onSubmit(r) }}>Submit</button>
        {right && <span className="text-3xl font-bold text-emerald-500">✓</span>}
      </div>
    </div>
  )
}
