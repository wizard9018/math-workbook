// Pure-SVG figures for math questions (number line, coordinate plane). The figure spec lives in
// math_questions.render_data.figure; render_data.alt is a plain-text description (also used for reports).

export interface NumberLineFigure {
  type: 'number_line'
  min: number
  max: number
  step: number
  points?: { value: number; label?: string; open?: boolean }[]
  // 射线：从 from 出发向 left/right 画到数轴尽头（不等式的解集）
  rays?: { from: number; dir: 'left' | 'right' }[]
}

export interface CoordinatePlaneFigure {
  type: 'coordinate_plane'
  xMin: number
  xMax: number
  yMin: number
  yMax: number
  xStep: number
  yStep: number
  xLabel?: string
  yLabel?: string
  points?: { x: number; y: number; label?: string }[]
  lines?: { x1: number; y1: number; x2: number; y2: number }[]
}

export interface TableFigure {
  type: 'table'
  headers: string[]
  rows: (string | number)[][]
}

export interface DotPlotFigure {
  type: 'dot_plot'
  min: number
  max: number
  step: number
  values: number[]
  label?: string
}

// 8-12年级教材题的图（scripts/math-g8-12）：一个通用的"画图数据"——点、线、多边形、圆、
// 椭圆、角、函数曲线、文字——bbox是[xmin, ymax, xmax, ymin]。axes!==false时画坐标轴和网格
// （坐标系题），axes:false是纯几何图（棱柱、三角形、图形规律）。
export type Pt = [number, number]
export type DrawingElement =
  | { t: 'point'; x: number; y: number; label?: string }
  | { t: 'segment'; p: Pt; q: Pt; label?: string; dashed?: boolean }
  | { t: 'line'; p: Pt; q: Pt }
  | { t: 'polygon'; pts: Pt[]; fill?: string | null; label?: string }
  | { t: 'circle'; c: Pt; r: number }
  | { t: 'ellipse'; c: Pt; rx: number; ry: number; a0?: number; a1?: number; dashed?: boolean }
  | { t: 'angle'; at: Pt; from: Pt; to: Pt; label?: string }
  | { t: 'function'; expr: string; from: number; to: number; dashed?: boolean }
  | { t: 'text'; x: number; y: number; s: string }
export interface DrawingFigure {
  type: 'drawing'
  bbox: [number, number, number, number]
  axes?: boolean
  elements: DrawingElement[]
}

export type FigureSpec = NumberLineFigure | CoordinatePlaneFigure | TableFigure | DotPlotFigure | DrawingFigure

const INK = 'currentColor'
const ACCENT = '#0ea5e9'

// tick positions from min to max (inclusive) in steps of `step`, tolerant of float error
function ticks(min: number, max: number, step: number): number[] {
  const out: number[] = []
  for (let v = min; v <= max + 1e-9; v += step) out.push(Math.round(v * 1000) / 1000)
  return out
}

function NumberLine({ f }: { f: NumberLineFigure }) {
  const W = 640, H = 96, padX = 28, y = 56
  const sx = (v: number) => padX + ((v - f.min) / (f.max - f.min)) * (W - 2 * padX)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" fontFamily="inherit">
      <line x1={padX - 14} y1={y} x2={W - padX + 14} y2={y} stroke={INK} strokeWidth={2} />
      <polygon points={`${padX - 20},${y} ${padX - 10},${y - 5} ${padX - 10},${y + 5}`} fill={INK} />
      <polygon points={`${W - padX + 20},${y} ${W - padX + 10},${y - 5} ${W - padX + 10},${y + 5}`} fill={INK} />
      {ticks(f.min, f.max, f.step).map((v) => (
        <g key={v}>
          <line x1={sx(v)} y1={y - 6} x2={sx(v)} y2={y + 6} stroke={INK} strokeWidth={v === 0 ? 2.5 : 1.5} />
          <text x={sx(v)} y={y + 24} textAnchor="middle" fontSize={14} fill={INK}>
            {v}
          </text>
        </g>
      ))}
      {(f.rays ?? []).map((r, i) => {
        const x1 = sx(r.from), x2 = r.dir === 'right' ? W - padX + 8 : padX - 8
        const tip = r.dir === 'right' ? x2 + 10 : x2 - 10
        return (
          <g key={`ray${i}`}>
            <line x1={x1} y1={y} x2={x2} y2={y} stroke={ACCENT} strokeWidth={6} strokeLinecap="round" />
            <polygon points={`${tip},${y} ${x2},${y - 9} ${x2},${y + 9}`} fill={ACCENT} />
          </g>
        )
      })}
      {(f.points ?? []).map((p) => (
        <g key={`${p.label}-${p.value}`}>
          <circle cx={sx(p.value)} cy={y} r={7} fill={p.open ? 'white' : ACCENT} stroke={ACCENT} strokeWidth={2.5} />
          {p.label && (
            <text x={sx(p.value)} y={y - 16} textAnchor="middle" fontSize={16} fontWeight={700} fill={ACCENT}>
              {p.label}
            </text>
          )}
        </g>
      ))}
    </svg>
  )
}

function CoordinatePlane({ f }: { f: CoordinatePlaneFigure }) {
  const W = 380, H = 380, left = 52, right = 18, top = 16, bottom = 50
  const pw = W - left - right, ph = H - top - bottom
  const sx = (x: number) => left + ((x - f.xMin) / (f.xMax - f.xMin)) * pw
  const sy = (y: number) => top + ph - ((y - f.yMin) / (f.yMax - f.yMin)) * ph
  const xs = ticks(f.xMin, f.xMax, f.xStep), ys = ticks(f.yMin, f.yMax, f.yStep)
  const clipId = `clip-${f.xMin}-${f.xMax}-${f.yMin}-${f.yMax}`
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" fontFamily="inherit">
      <defs>
        <clipPath id={clipId}>
          <rect x={left} y={top} width={pw} height={ph} />
        </clipPath>
      </defs>
      {xs.map((x) => (
        <line key={`gx${x}`} x1={sx(x)} y1={top} x2={sx(x)} y2={top + ph} stroke={INK} strokeOpacity={x === 0 ? 0.9 : 0.15} strokeWidth={x === 0 ? 2 : 1} />
      ))}
      {ys.map((y) => (
        <line key={`gy${y}`} x1={left} y1={sy(y)} x2={left + pw} y2={sy(y)} stroke={INK} strokeOpacity={y === 0 ? 0.9 : 0.15} strokeWidth={y === 0 ? 2 : 1} />
      ))}
      <rect x={left} y={top} width={pw} height={ph} fill="none" stroke={INK} strokeOpacity={0.4} />
      {xs.map((x) => (
        <text key={`tx${x}`} x={sx(x)} y={top + ph + 18} textAnchor="middle" fontSize={13} fill={INK}>
          {x}
        </text>
      ))}
      {ys.map((y) => (
        <text key={`ty${y}`} x={left - 8} y={sy(y) + 4} textAnchor="end" fontSize={13} fill={INK}>
          {y}
        </text>
      ))}
      {f.xLabel && (
        <text x={left + pw / 2} y={H - 8} textAnchor="middle" fontSize={14} fontWeight={600} fill={INK}>
          {f.xLabel}
        </text>
      )}
      {f.yLabel && (
        <text transform={`translate(14 ${top + ph / 2}) rotate(-90)`} textAnchor="middle" fontSize={14} fontWeight={600} fill={INK}>
          {f.yLabel}
        </text>
      )}
      <g clipPath={`url(#${clipId})`}>
        {(f.lines ?? []).map((l, i) => (
          <line key={i} x1={sx(l.x1)} y1={sy(l.y1)} x2={sx(l.x2)} y2={sy(l.y2)} stroke={ACCENT} strokeWidth={3} strokeLinecap="round" />
        ))}
      </g>
      {(f.points ?? []).map((p, i) => (
        <g key={i}>
          <circle cx={sx(p.x)} cy={sy(p.y)} r={6} fill={ACCENT} stroke="white" strokeWidth={1.5} />
          {p.label && (
            // 标签放在点的右下方：上升的直线在点的左上/右上，放右下不会压住线
            <text x={sx(p.x) + 10} y={sy(p.y) + 18} fontSize={13} fontWeight={600} fill={INK}>
              {p.label}
            </text>
          )}
        </g>
      ))}
    </svg>
  )
}

function Table({ f }: { f: TableFigure }) {
  const cw = 150, ch = 38, W = cw * f.headers.length, H = ch * (f.rows.length + 1)
  const cell = (text: string | number, col: number, row: number, head: boolean) => (
    <text key={`${row}-${col}`} x={col * cw + cw / 2} y={row * ch + ch / 2 + 5} textAnchor="middle" fontSize={15} fontWeight={head ? 700 : 500} fill={INK}>
      {text}
    </text>
  )
  return (
    <svg viewBox={`-1 -1 ${W + 2} ${H + 2}`} className="h-auto w-full" fontFamily="inherit">
      <rect x={0} y={0} width={W} height={ch} fill={INK} fillOpacity={0.08} />
      {Array.from({ length: f.rows.length + 2 }, (_, i) => (
        <line key={`h${i}`} x1={0} y1={i * ch} x2={W} y2={i * ch} stroke={INK} strokeOpacity={0.5} />
      ))}
      {Array.from({ length: f.headers.length + 1 }, (_, i) => (
        <line key={`v${i}`} x1={i * cw} y1={0} x2={i * cw} y2={H} stroke={INK} strokeOpacity={0.5} />
      ))}
      {f.headers.map((h, c) => cell(h, c, 0, true))}
      {f.rows.map((r, ri) => r.map((v, c) => cell(v, c, ri + 1, false)))}
    </svg>
  )
}

function DotPlot({ f }: { f: DotPlotFigure }) {
  const W = 640, padX = 28
  const counts = new Map<number, number>()
  for (const v of f.values) counts.set(v, (counts.get(v) ?? 0) + 1)
  const maxCount = Math.max(1, ...counts.values())
  const y = 30 + maxCount * 22
  const H = y + 52
  const sx = (v: number) => padX + ((v - f.min) / (f.max - f.min)) * (W - 2 * padX)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" fontFamily="inherit">
      <line x1={padX - 14} y1={y} x2={W - padX + 14} y2={y} stroke={INK} strokeWidth={2} />
      {ticks(f.min, f.max, f.step).map((v) => (
        <g key={v}>
          <line x1={sx(v)} y1={y - 5} x2={sx(v)} y2={y + 5} stroke={INK} strokeWidth={1.5} />
          <text x={sx(v)} y={y + 22} textAnchor="middle" fontSize={14} fill={INK}>
            {v}
          </text>
        </g>
      ))}
      {[...counts.entries()].flatMap(([v, n]) =>
        Array.from({ length: n }, (_, k) => <circle key={`${v}-${k}`} cx={sx(v)} cy={y - 14 - k * 22} r={9} fill={ACCENT} />),
      )}
      {f.label && (
        <text x={W / 2} y={H - 4} textAnchor="middle" fontSize={14} fontWeight={600} fill={INK}>
          {f.label}
        </text>
      )}
    </svg>
  )
}

const FN_NAMES = ['sqrt', 'abs', 'sin', 'cos', 'tan', 'exp', 'log', 'ln', 'pi', 'e'] as const

// 函数表达式只允许 x、数字、+ - * / ^ ( ) 和上面这几个函数名/常数——先把所有字母串
// 逐个核对白名单，再编译；任何别的字符串（包括标识符）一律不画这条曲线。
function compileFunction(expr: string): ((x: number) => number) | null {
  let src = expr.toLowerCase().replace(/\^/g, '**')
  const words = src.match(/[a-z]+/g) ?? []
  if (!words.every((w) => w === 'x' || (FN_NAMES as readonly string[]).includes(w))) return null
  if (!/^[0-9a-z+\-*/().\s,]*$/.test(src)) return null
  // 隐含的乘号："2x"、"3(x+1)"、")(x"、"x(" -> 显式乘号
  src = src.replace(/(\d|\))\s*(x|\(|[a-z])/g, '$1*$2').replace(/\bx\s*\(/g, 'x*(')
  try {
    const fn = new Function('x', ...FN_NAMES, `return (${src})`) as (...a: unknown[]) => number
    return (x) => fn(x, Math.sqrt, Math.abs, Math.sin, Math.cos, Math.tan, Math.exp, Math.log, Math.log, Math.PI, Math.E)
  } catch {
    return null
  }
}

function niceStep(span: number): number {
  const raw = span / 8
  const pow = Math.pow(10, Math.floor(Math.log10(raw)))
  const f = raw / pow
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * pow
}

function Drawing({ f }: { f: DrawingFigure }) {
  const [xmin, ymax, xmax, ymin] = f.bbox
  const dx = xmax - xmin
  const dy = ymax - ymin
  const MAXW = 420
  const MAXH = 420
  const scale = Math.min(MAXW / dx, MAXH / dy)
  const pad = 24
  const W = dx * scale + 2 * pad
  const H = dy * scale + 2 * pad
  const sx = (x: number) => pad + (x - xmin) * scale
  const sy = (y: number) => pad + (ymax - y) * scale
  const axes = f.axes !== false
  const stepX = niceStep(dx)
  const stepY = niceStep(dy)
  const xTicks: number[] = []
  const yTicks: number[] = []
  if (axes) {
    for (let v = Math.ceil(xmin / stepX) * stepX; v <= xmax + 1e-9; v += stepX) xTicks.push(Math.round(v * 1000) / 1000)
    for (let v = Math.ceil(ymin / stepY) * stepY; v <= ymax + 1e-9; v += stepY) yTicks.push(Math.round(v * 1000) / 1000)
  }
  const axisY = ymin <= 0 && 0 <= ymax ? 0 : ymin
  const axisX = xmin <= 0 && 0 <= xmax ? 0 : xmin
  const clipId = `clip-${xmin}-${xmax}-${ymin}-${ymax}`
  const dash = '5 4'
  const label = (x: number, y: number, text: string, key: string, anchor: 'start' | 'middle' | 'end' = 'middle') => (
    <text key={key} x={sx(x)} y={sy(y)} textAnchor={anchor} fontSize={13} fontWeight={600} fill={INK} dominantBaseline="middle">
      {text}
    </text>
  )
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" fontFamily="inherit">
      <defs>
        <clipPath id={clipId}>
          <rect x={pad} y={pad} width={dx * scale} height={dy * scale} />
        </clipPath>
      </defs>
      {axes && (
        <g>
          {xTicks.map((x) => (
            <g key={`x${x}`}>
              <line x1={sx(x)} y1={pad} x2={sx(x)} y2={pad + dy * scale} stroke={INK} strokeOpacity={0.12} />
              <text x={sx(x)} y={sy(axisY) + 15} textAnchor="middle" fontSize={11} fill={INK}>
                {x}
              </text>
            </g>
          ))}
          {yTicks.map((y) => (
            <g key={`y${y}`}>
              <line x1={pad} y1={sy(y)} x2={pad + dx * scale} y2={sy(y)} stroke={INK} strokeOpacity={0.12} />
              <text x={sx(axisX) - 6} y={sy(y) + 4} textAnchor="end" fontSize={11} fill={INK}>
                {y}
              </text>
            </g>
          ))}
          <line x1={pad} y1={sy(axisY)} x2={pad + dx * scale} y2={sy(axisY)} stroke={INK} strokeWidth={1.8} />
          <line x1={sx(axisX)} y1={pad} x2={sx(axisX)} y2={pad + dy * scale} stroke={INK} strokeWidth={1.8} />
        </g>
      )}
      <g clipPath={axes ? `url(#${clipId})` : undefined}>
        {f.elements.map((e, i) => {
          const k = `e${i}`
          if (e.t === 'segment')
            return (
              <g key={k}>
                <line x1={sx(e.p[0])} y1={sy(e.p[1])} x2={sx(e.q[0])} y2={sy(e.q[1])} stroke={INK} strokeWidth={2} strokeDasharray={e.dashed ? dash : undefined} />
                {e.label && label((e.p[0] + e.q[0]) / 2, (e.p[1] + e.q[1]) / 2, e.label, `${k}l`)}
              </g>
            )
          if (e.t === 'line') {
            // 无限长直线：延长到比bbox大得多的位置，由clipPath裁掉
            const ddx = e.q[0] - e.p[0]
            const ddy = e.q[1] - e.p[1]
            const L = (dx + dy) * 3
            const len = Math.hypot(ddx, ddy) || 1
            return <line key={k} x1={sx(e.p[0] - (ddx / len) * L)} y1={sy(e.p[1] - (ddy / len) * L)} x2={sx(e.p[0] + (ddx / len) * L)} y2={sy(e.p[1] + (ddy / len) * L)} stroke={ACCENT} strokeWidth={2.5} />
          }
          if (e.t === 'polygon') {
            const cx = e.pts.reduce((a, p) => a + p[0], 0) / e.pts.length
            const cy = e.pts.reduce((a, p) => a + p[1], 0) / e.pts.length
            return (
              <g key={k}>
                <polygon points={e.pts.map((p) => `${sx(p[0])},${sy(p[1])}`).join(' ')} fill={e.fill ?? 'none'} fillOpacity={e.fill ? 0.65 : 0} stroke={INK} strokeWidth={2} strokeLinejoin="round" />
                {e.label && label(cx, cy, e.label, `${k}l`)}
              </g>
            )
          }
          if (e.t === 'circle') return <circle key={k} cx={sx(e.c[0])} cy={sy(e.c[1])} r={e.r * scale} fill="none" stroke={INK} strokeWidth={2} />
          if (e.t === 'ellipse') {
            const a0 = ((e.a0 ?? 0) * Math.PI) / 180
            const a1 = ((e.a1 ?? 360) * Math.PI) / 180
            const pts: string[] = []
            for (let s = 0; s <= 60; s++) {
              const a = a0 + ((a1 - a0) * s) / 60
              pts.push(`${sx(e.c[0] + e.rx * Math.cos(a))},${sy(e.c[1] + e.ry * Math.sin(a))}`)
            }
            return <polyline key={k} points={pts.join(' ')} fill="none" stroke={INK} strokeWidth={2} strokeDasharray={e.dashed ? dash : undefined} />
          }
          if (e.t === 'angle') {
            const r = 0.12 * Math.min(dx, dy)
            const a1 = Math.atan2(e.from[1] - e.at[1], e.from[0] - e.at[0])
            let a2 = Math.atan2(e.to[1] - e.at[1], e.to[0] - e.at[0])
            while (a2 <= a1) a2 += 2 * Math.PI // 从from射线逆时针转到to射线
            const p1: Pt = [e.at[0] + r * Math.cos(a1), e.at[1] + r * Math.sin(a1)]
            const p2: Pt = [e.at[0] + r * Math.cos(a2), e.at[1] + r * Math.sin(a2)]
            const mid = (a1 + a2) / 2
            return (
              <g key={k}>
                <path d={`M ${sx(e.at[0])} ${sy(e.at[1])} L ${sx(p1[0])} ${sy(p1[1])} A ${r * scale} ${r * scale} 0 ${a2 - a1 > Math.PI ? 1 : 0} 0 ${sx(p2[0])} ${sy(p2[1])} Z`} fill="#fbbf24" fillOpacity={0.45} stroke={INK} strokeWidth={1.2} />
                {e.label && label(e.at[0] + 1.9 * r * Math.cos(mid), e.at[1] + 1.9 * r * Math.sin(mid), e.label, `${k}l`)}
              </g>
            )
          }
          if (e.t === 'function') {
            const fn = compileFunction(e.expr)
            if (!fn) return null
            const segs: string[][] = [[]]
            const lim = (dy + Math.abs(ymax) + Math.abs(ymin)) * 4
            for (let s = 0; s <= 240; s++) {
              const x = e.from + ((e.to - e.from) * s) / 240
              let y = NaN
              try {
                y = fn(x)
              } catch {
                y = NaN
              }
              if (!Number.isFinite(y) || Math.abs(y) > lim) {
                if (segs[segs.length - 1].length) segs.push([])
              } else segs[segs.length - 1].push(`${sx(x)},${sy(y)}`)
            }
            return (
              <g key={k}>
                {segs.filter((p) => p.length > 1).map((p, j) => (
                  <polyline key={j} points={p.join(' ')} fill="none" stroke={ACCENT} strokeWidth={2.5} strokeDasharray={e.dashed ? dash : undefined} />
                ))}
              </g>
            )
          }
          if (e.t === 'point')
            return (
              <g key={k}>
                <circle cx={sx(e.x)} cy={sy(e.y)} r={4.5} fill={ACCENT} stroke="white" strokeWidth={1.2} />
                {e.label && (
                  <text x={sx(e.x) + 8} y={sy(e.y) - 8} fontSize={13} fontWeight={700} fill={INK}>
                    {e.label}
                  </text>
                )}
              </g>
            )
          if (e.t === 'text') return label(e.x, e.y, e.s, k)
          return null
        })}
      </g>
    </svg>
  )
}

export function MathFigure({ figure, alt }: { figure: FigureSpec; alt?: string }) {
  return (
    // span (not div): the figure is rendered inside the question <p>
    <span role="img" aria-label={alt} className={`my-3 block ${figure.type === 'coordinate_plane' ? 'max-w-sm' : figure.type === 'table' ? 'max-w-md' : figure.type === 'drawing' ? 'max-w-md' : 'max-w-xl'} text-foreground`}>
      {figure.type === 'number_line' && <NumberLine f={figure} />}
      {figure.type === 'coordinate_plane' && <CoordinatePlane f={figure} />}
      {figure.type === 'table' && <Table f={figure} />}
      {figure.type === 'dot_plot' && <DotPlot f={figure} />}
      {figure.type === 'drawing' && <Drawing f={figure} />}
    </span>
  )
}
