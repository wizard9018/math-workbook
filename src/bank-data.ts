// Grades 8, 10, 11, 12 (Crescent Beach textbooks): the question banks written by Gemini / subagents and checked (public/bank/g<grade>.json, made by scripts/export-bank.mjs).
// One exercise = one textbook exercise number; one question (8a, 8b ...) = one textbook part; its variants (5 normal + 5 harder) are the practice list that quiz.tsx draws from.
// A wrong answer shows the written solution (no step-by-step lesson yet: Lesson.solution).
// Imported by: quiz.tsx. Shape: exercise.ts.
import katex from 'katex'
import { renderToStaticMarkup } from 'react-dom/server'
import { createElement } from 'react'
import type { Draw, Exercise, Fill, Ineq, Mark, Plot, Practice, Question } from './exercise'
import type { Lesson } from './lessons'
import { MathFigure } from './MathFigure'
import type { FigureSpec } from './MathFigure'

interface BankQ { q: string; a: string; d: string[]; s: string; l: number; f?: Record<string, unknown>; o?: { items: string[]; order: number[] }; p?: { lo: number; hi: number; chips: string[]; at: number[] }; dr?: Draw; iq?: number; fl?: Fill; mk?: Mark; pp?: Plot; sv?: string } // o: numbers to drag into order
interface BankPart { p: string; qs: BankQ[] }
interface BankEx { no: number; name?: string; parts: BankPart[] }
interface BankSec { no: number; title: string; exercises: BankEx[] }
interface BankCh { no: number; sections: BankSec[] }
export interface BankGrade { grade: number; chapters: BankCh[] }

// the key of an exercise on the quiz page: 8 -> 8 000 000 + chapter * 10 000 + section * 100 + exercise number (the Grade 9 exercises use keys below 4000)
export const bankKey = (grade: number, ch: number, sec: number, no: number) => grade * 1_000_000 + ch * 10_000 + sec * 100 + no
// the address of an exercise: #g8/1.1/4 (grade 8, section 1.1, exercise 4); a Grade 9 exercise is #<key>
export const hashOfKey = (k: number) => (k >= 1_000_000 ? `#g${Math.floor(k / 1_000_000)}/${Math.floor((k % 1_000_000) / 10_000)}.${Math.floor((k % 10_000) / 100)}/${k % 100}` : `#${k}`)
export const keyOfHash = (h: string): number | null => {
  const m = /^#g(\d+)\/(\d+)\.(\d+)\/(\d+)$/.exec(h)
  if (m) return bankKey(+m[1], +m[2], +m[3], +m[4])
  return /^#\d+$/.test(h) ? Number(h.slice(1)) : null
}
export const gradeOfKey = (key: number) => (key >= 1_000_000 ? Math.floor(key / 1_000_000) : 9)

const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
// text with \( ... \) formulas -> HTML (KaTeX for the formulas)
// a table written in markdown (| x | 1 | 2 |, a separator line |---|---|, more rows) -> an html table; the rest of the text is written as before
const ROW = /^\s*\|.*\|\s*$/
const SEP = /^\s*\|[\s:|-]+\|\s*$/
function withTables(s: string): string | null {
  const lines = s.split('\n')
  if (!lines.some((l, i) => ROW.test(l) && i + 1 < lines.length && SEP.test(lines[i + 1]))) return null
  let out = ''
  let text: string[] = []
  const flush = () => {
    if (text.length) out += rich(text.join('\n').replace(/^\n+|\n+$/g, ''))
    text = []
  }
  for (let i = 0; i < lines.length; ) {
    if (ROW.test(lines[i]) && i + 1 < lines.length && SEP.test(lines[i + 1])) {
      flush()
      const rows: string[][] = []
      let j = i
      while (j < lines.length && ROW.test(lines[j])) {
        if (!SEP.test(lines[j])) rows.push(lines[j].trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim()))
        j++
      }
      const cell = (c: string, ri: number, ci: number) => {
        const tag = ci === 0 ? 'th' : 'td'
        return `<${tag} class="border border-slate-300 px-3 py-1 text-center ${ci === 0 || ri === 0 ? 'bg-slate-50 font-semibold' : ''}">${rich(c)}</${tag}>`
      }
      out += `<table class="mx-auto my-2 border-collapse text-lg"><tbody>${rows.map((r, ri) => `<tr>${r.map((c, ci) => cell(c, ri, ci)).join('')}</tr>`).join('')}</tbody></table>`
      i = j
    } else {
      text.push(lines[i])
      i++
    }
  }
  flush()
  return out
}
// text that has words and LaTeX written without \( \) ("... gives \frac{175}{100}, then 8 = 2^3 ..."): the LaTeX parts (a run of numbers, letters, \commands, powers and
// operators that contains a \command or a power) are wrapped as formulas, the words stay text
const GROUP = String.raw`\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\}`
const LR = String.raw`\\left[(\[|.][\s\S]*?\\right[)\]|.]`
const CMD = String.raw`\\[a-zA-Z]+(?:\[[^\]]*\])?(?:${GROUP})*`
const POW = String.raw`(?:\^(?:${GROUP}|\\[a-zA-Z]+|-?\d+|[a-zA-Z])|_(?:${GROUP}|\d|[a-zA-Z]))`
const ATOM = String.raw`(?:(?:${LR}|${CMD}|[A-Za-z0-9.]+|\([^()]*\))${POW}*)`
const OP = String.raw`\s*(?:[=+\-×÷·*/<>≤≥]|\\(?:times|div|cdot|le|ge|approx|neq|pm)\b)\s*`
const RUN = new RegExp(`${ATOM}(?:${OP}${ATOM})*`, 'g')
const hasLatex = (t: string) => /\\[a-zA-Z]+|\^/.test(t)
const wordCount = (t: string) => (t.replace(/\\[a-zA-Z]+/g, '').match(/[A-Za-z]{4,}/g) ?? []).length
function wrapBare(s: string): string {
  return s.replace(RUN, (m) => {
    if (!hasLatex(m)) return m // plain words and numbers stay text
    const body = m.replace(/[.,;:]+$/, '') // a full stop after the formula is not part of it
    if (/^[A-Za-z]{4,}$/.test(body)) return m
    return `\\(${body}\\)${m.slice(body.length)}`
  })
}

export const rich = (s: string): string => {
  if (s.startsWith('<svg')) return s // a picture (number line) written by the exporter
  const tab = withTables(s)
  if (tab !== null) return tab
  // an answer written as bare LaTeX (\frac{3}{5}) without \( \): the whole text is a formula
  if (!s.includes('\\(') && /\\[a-zA-Z]+|\^/.test(s)) {
    if (wordCount(s) < 2) return katex.renderToString(s, { throwOnError: false })
    s = wrapBare(s) // words and LaTeX without \( \) mixed: the LaTeX parts become formulas, the words stay text
  }
  let out = ''
  let last = 0
  for (const m of s.matchAll(/\\\(([\s\S]+?)\\\)/g)) {
    out += esc(s.slice(last, m.index)).replace(/\n/g, '<br>')
    out += katex.renderToString(m[1].replace(/\\text\{\s*(?:\\_)+\s*\}/g, '\\underline{\\quad}'), { throwOnError: false }) // a blank written \text{\_\_\_}: a visible line
    last = m.index! + m[0].length
  }
  return out + esc(s.slice(last)).replace(/\n/g, '<br>')
}
// a figure that is only labelled points on the x axis (compare integers on a number line): a number line, not a coordinate grid
function pointLine(f: Record<string, unknown>): string {
  const els = (f.elements as { t: string; x: number; y: number; label?: string }[] | undefined) ?? []
  const bbox = f.bbox as number[] | undefined
  if (!bbox || !els.length || !els.every((e) => e.t === 'point' && e.y === 0)) return ''
  const lo = Math.floor(Math.min(bbox[0], ...els.map((e) => e.x))), hi = Math.ceil(Math.max(bbox[2], ...els.map((e) => e.x)))
  const X = (v: number) => 20 + ((v - lo) / (hi - lo)) * 400
  let t = ''
  for (let v = lo; v <= hi; v++) t += `<line x1="${X(v)}" y1="50" x2="${X(v)}" y2="62" stroke="#475569" stroke-width="2"/><text x="${X(v)}" y="80" text-anchor="middle" font-size="13" fill="#334155">${v}</text>`
  const pts = els.map((e) => `<circle cx="${X(e.x)}" cy="56" r="6" fill="#0284c7"/>${e.label ? `<text x="${X(e.x)}" y="38" text-anchor="middle" font-size="17" font-style="italic" fill="#0284c7">${esc(e.label)}</text>` : ''}`).join('')
  return `<svg viewBox="0 0 440 88" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:440px;height:auto"><line x1="8" y1="56" x2="432" y2="56" stroke="#475569" stroke-width="2"/><polygon points="436,56 426,51 426,61" fill="#475569"/><polygon points="4,56 14,51 14,61" fill="#475569"/>${t}${pts}</svg>`
}
const figureHtml = (f: Record<string, unknown>) => pointLine(f) ||renderToStaticMarkup(createElement(MathFigure, { figure: { type: 'drawing', ...f } as unknown as FigureSpec }))
// "Evaluate for a = -4, b = -6: ab" -> the instruction, then the expression alone on its own line (same size)
// "Determine the linear function \(f(x) = mx + b\) if \(f(0) = -1\) and \(f(3) = 8\).": what comes after "if" (only formulas, joined by and / or / commas) goes on its own line
const ifSplit = (q: string): string | null => {
  const m = /^([\s\S]*?\sif)\s+(\\\([\s\S]+\\\)[.?]?)$/.exec(q)
  if (!m) return null
  const [, head, rest] = m
  if (rest.replace(/\\\([\s\S]*?\\\)/g, '').replace(/\b(?:and|or)\b|[,.;?\s]/g, '') !== '') return null
  if ((head.match(/\\\(/g) ?? []).length !== (head.match(/\\\)/g) ?? []).length) return null
  return `<div>${rich(head)}</div><div class="mt-2 max-w-full overflow-x-auto overflow-y-hidden py-1">${rich(rest.replace(/[.?]$/, ''))}</div>`
}
// a question that ends with a formula (an equation or inequality) after a sentence, "Which line represents the linear equation \(2x - 3y = -6\)?": the formula goes on its own line
const endFormula = (q: string): string | null => {
  const m = /^([\s\S]*[^\s(])\s+\\\(((?:(?!\\\()[\s\S])+?)\\\)\s*([.?!]?)$/.exec(q)
  if (!m) return null
  const [, head, f, end] = m
  if (head.length < 25 || !/[=<>]|\\le|\\ge|\\neq/.test(f)) return null
  if ((head.match(/\\\(/g) ?? []).length !== (head.match(/\\\)/g) ?? []).length) return null
  return `<div>${rich(head)}</div><div class="mt-2 max-w-full overflow-x-auto overflow-y-hidden py-1">${rich(`\\(${f}${end === '?' ? '\\ \\text{?}' : ''}\\)`)}</div>`
}
const stem = (q: string) => {
  // the last "colon + space" that is not the colon of a "Note:" (a note stays inside its line)
  let at = -1
  // (a colon after a short label at the start of a later line, "Option 2: 6 notebooks for $7.50", is a list item, not the end of the instruction)
  for (const m of q.matchAll(/:[ \n]/g)) if (!/note$/i.test(q.slice(0, m.index)) && !/\n[^\n:]{1,20}$/.test(q.slice(0, m.index))) at = m.index!
  if (at < 0) return ifSplit(q) ?? endFormula(q) ?? rich(q)
  const head = q.slice(0, at + 1)
  let tail = q.slice(at + 1).trim().replace(/[.?]$/, '')
  if ((head.match(/\\\(/g) ?? []).length !== (head.match(/\\\)/g) ?? []).length) return rich(q) // the colon is inside a formula
  if (/^\\\((?:(?!\\\()[\s\S])+?\\\)$/.test(tail)) tail = tail.slice(2, -2)
  else if (!tail.includes('\\(') && tail && !/[a-zA-Z]{3,}/.test(tail) && !/\b(?:to|or|and|of|is|in)\b/i.test(tail)) tail = tail.replace(/_+/g, '\\underline{\\hspace{2.2em}}').replace(/·/g, '\\cdot ') // plain "-9 · _ = 72": a formula with a visible blank
  else return `<div>${rich(head)}</div><div class="mt-1">${rich(q.slice(at + 1).trim())}</div>` // words after the colon: the same, as text
  return `<div>${rich(head)}</div><div class="mt-2 max-w-full overflow-x-auto overflow-y-hidden py-1">${rich(`\\(${tail}\\)`)}</div>`
}
// the question; a question with a picture shows the picture on the left and the text on the right (one above the other on a narrow screen), so nothing needs scrolling
const card = (b: BankQ) => {
  const text = `<div class="px-2 py-3 text-center text-xl leading-relaxed">${stem(b.q)}</div>`
  const pic = b.sv ? `<div class="w-full max-w-xs">${b.sv}</div>` : b.f ? `<div class="w-full max-w-[15.5rem]">${figureHtml(b.f)}</div>` : ''
  if (!pic) return text
  return `<div class="flex flex-col items-center gap-3 md:flex-row md:items-center md:gap-6"><div class="flex shrink-0 justify-center md:w-[16rem]">${pic}</div><div class="min-w-0 flex-1">${text}</div></div>`
}
const span = (s: string) => `<span>${rich(s)}</span>`

// deterministic shuffle of the four options (the right one is not always first)
const place = (b: BankQ, seed: number): [string[], number] => {
  let h = seed
  for (const c of b.q) h = (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0
  const at = h % (b.d.length + 1)
  const all = [...b.d]
  all.splice(at, 0, b.a)
  return [all.map(span), at]
}

// ---- an answer that is an inequality in one letter (x < 1 or x > 6, -2 <= x <= 4, 0 ft < w <= 10 ft) -> a number line picture ----
interface Piece { lo: number | null; hi: number | null; loC: boolean; hiC: boolean; loS: string; hiS: string }
const numStr = (v: number) => (Number.isInteger(v) ? String(v) : String(+v.toFixed(3)))
function parseAnswer(a: string): Piece[] | null {
  const s = a.replace(/\\text\{\s*(?:or|OR)\s*\}|\s+or\s+/g, '|').replace(/\\\(|\\\)|\\displaystyle|\\[;,!:]|~/g, ' ').replace(/\\text\{[^}]*\}|\\mathrm\{[^}]*\}/g, ' ')
  const out: Piece[] = []
  let v = ''
  for (const part of s.split('|')) {
    const toks: (number | string)[] = []
    const re = /\s*(?:(-)?\s*\\frac\{(\d+)\}\{(\d+)\}|(-?\d+(?:\.\d+)?)|(\\leq?|\\geq?|<=|>=|<|>|≤|≥)|([a-zA-Z]))/y
    let at = 0
    for (;;) {
      if (/^\s*$/.test(part.slice(at))) break
      re.lastIndex = at
      const m = re.exec(part)
      if (!m) return null
      at = re.lastIndex
      if (m[2] !== undefined) toks.push((m[1] ? -1 : 1) * (Number(m[2]) / Number(m[3])))
      else if (m[4] !== undefined) toks.push(Number(m[4]))
      else if (m[5] !== undefined) toks.push(/le|<=|≤/.test(m[5]) ? '<=' : /ge|>=|≥/.test(m[5]) ? '>=' : m[5])
      else { if (v && v !== m[6]) return null; v = m[6]; toks.push('x') }
    }
    const rel = (t: number | string) => t === '<' || t === '<=' || t === '>' || t === '>='
    const closed = (t: string) => t === '<=' || t === '>='
    const N = (n: number) => numStr(n)
    if (toks.length === 3 && toks[0] === 'x' && rel(toks[1]) && typeof toks[2] === 'number') {
      const r = toks[1] as string, n = toks[2]
      out.push(r[0] === '>' ? { lo: n, hi: null, loC: closed(r), hiC: false, loS: N(n), hiS: '' } : { lo: null, hi: n, loC: false, hiC: closed(r), loS: '', hiS: N(n) })
    } else if (toks.length === 3 && typeof toks[0] === 'number' && rel(toks[1]) && toks[2] === 'x') {
      const r = toks[1] as string, n = toks[0]
      out.push(r[0] === '<' ? { lo: n, hi: null, loC: closed(r), hiC: false, loS: N(n), hiS: '' } : { lo: null, hi: n, loC: false, hiC: closed(r), loS: '', hiS: N(n) })
    } else if (toks.length === 5 && typeof toks[0] === 'number' && typeof toks[4] === 'number' && toks[2] === 'x' && rel(toks[1]) && rel(toks[3]) && (toks[1] as string)[0] === '<' && (toks[3] as string)[0] === '<' && toks[0] < toks[4]) {
      out.push({ lo: toks[0], hi: toks[4], loC: closed(toks[1] as string), hiC: closed(toks[3] as string), loS: N(toks[0]), hiS: N(toks[4]) })
    } else return null
  }
  return out.length && out.length <= 3 ? out : null
}
// the answer as something to graph: a number line with a tick every `unit` (all the endpoints are on ticks), the endpoints and the shaded parts; null when it cannot be drawn
const UNITS = [100000, 50000, 10000, 5000, 1000, 500, 100, 50, 25, 20, 10, 5, 2, 1, 0.5, 0.25, 0.2, 0.1]
function ineqSpec(a: string): Ineq | null {
  const ps = parseAnswer(a)
  if (!ps) return null
  const bounds = [...new Set(ps.flatMap((p) => [p.lo, p.hi]).filter((n): n is number => n !== null))].sort((x, y) => x - y)
  if (!bounds.length) return null
  const fits = (u: number) => bounds.every((b) => Math.abs(b / u - Math.round(b / u)) < 1e-9)
  const span = bounds[bounds.length - 1] - bounds[0]
  const unit = UNITS.find((u) => fits(u) && (bounds.length === 1 ? Math.abs(bounds[0]) / u <= 5 : span / u <= 8 && span / u >= 1))
  if (!unit) return null
  const lo = Math.floor(bounds[0] / unit) * unit - 2 * unit, hi = Math.ceil(bounds[bounds.length - 1] / unit) * unit + 2 * unit
  const pts = bounds.map((v) => ({ v, closed: ps.some((p) => (p.lo === v && p.loC) || (p.hi === v && p.hiC)) }))
  const covers = (t: number) => ps.some((p) => (p.lo === null || t > p.lo) && (p.hi === null || t < p.hi))
  const shaded = Array.from({ length: bounds.length + 1 }, (_, i) => covers(i === 0 ? bounds[0] - 1 : i === bounds.length ? bounds[i - 1] + 1 : (bounds[i - 1] + bounds[i]) / 2))
  return { lo, hi, unit, answer: { pts, shaded } }
}
function inequalityLine(a: string): string {
  const ps = parseAnswer(a)
  if (!ps) return ''
  const bounds = [0, ...ps.flatMap((p) => [p.lo, p.hi]).filter((n): n is number => n !== null)]
  const lo = Math.min(...bounds), hi = Math.max(...bounds)
  const step = [0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 5000, 10000, 100000].find((s) => (hi - lo) / s <= 8) ?? 1
  const from = (Math.floor(lo / step) - 1) * step, to = (Math.ceil(hi / step) + 1) * step
  const W = 400, X = (n: number) => 20 + ((n - from) / (to - from)) * W
  const col = '#0284c7'
  let svg = `<svg viewBox="0 0 440 70" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:420px;height:auto"><line x1="8" y1="40" x2="432" y2="40" stroke="#475569" stroke-width="2"/><polygon points="436,40 426,35 426,45" fill="#475569"/><polygon points="4,40 14,35 14,45" fill="#475569"/>`
  for (let t = from; t <= to + 1e-9; t += step) svg += `<line x1="${X(t)}" y1="34" x2="${X(t)}" y2="46" stroke="#475569" stroke-width="2"/><text x="${X(t)}" y="62" text-anchor="middle" font-size="13" fill="#334155">${numStr(t)}</text>`
  for (const p of ps) {
    const x1 = p.lo === null ? 12 : X(p.lo), x2 = p.hi === null ? 428 : X(p.hi)
    svg += `<line x1="${x1}" y1="40" x2="${x2}" y2="40" stroke="${col}" stroke-width="6"/>`
    if (p.lo === null) svg += `<polygon points="8,40 22,32 22,48" fill="${col}"/>`
    if (p.hi === null) svg += `<polygon points="432,40 418,32 418,48" fill="${col}"/>`
    for (const [n, c, s] of [[p.lo, p.loC, p.loS], [p.hi, p.hiC, p.hiS]] as const) if (n !== null) svg += `<circle cx="${X(n)}" cy="40" r="6.5" fill="${c ? col : '#fff'}" stroke="${col}" stroke-width="3"/>${Number.isInteger(n / step) ? '' : `<text x="${X(n)}" y="22" text-anchor="middle" font-size="13" fill="${col}">${s}</text>`}`
  }
  return `<div class="mx-auto mt-3 max-w-md">${svg}</svg></div>`
}

const solutionLesson = (b: BankQ, key: string): Lesson => ({
  key: `bank-${key}`,
  label: key,
  source: key,
  title: 'Solution',
  prompt: '',
  answer: b.a,
  start: [],
  steps: [],
  review: { heading: '', rows: [] },
  solution: `${card(b)}<div class="mt-4 rounded-xl bg-emerald-50 p-4 text-lg"><p class="mb-1 font-semibold text-emerald-800">Answer: ${rich(b.a)}</p>${inequalityLine(b.a)}<p>${rich(b.s || '')}</p></div>`,
})

// like { ...a, ...b } but getters stay getters (nothing is rendered until it is read)
export const mix = (...parts: object[]) => Object.defineProperties({}, Object.assign({}, ...parts.map((x) => Object.getOwnPropertyDescriptors(x))))

export function buildBankExercises(data: BankGrade): { exercises: Record<number, Exercise>; chapters: { title: string; sections: { title: string; nodes: { no: number; name: string; show: number; parts: number; how: string; state: 'ready' }[] }[] }[] } {
  const exercises: Record<number, Exercise> = {}
  const chapters = data.chapters.map((ch) => ({
    title: `Chapter ${ch.no}`,
    sections: ch.sections.map((sec) => ({
      title: `${ch.no}.${sec.no} ${sec.title}`,
      nodes: sec.exercises.map((e) => {
        const no = bankKey(data.grade, ch.no, sec.no, e.no)
        const questions = e.parts.map((p, pi): Question => {
          // the KaTeX / SVG html of a question is made when it is first shown (figure, choices, correct are getters): a grade has ~15000 questions
          const make = (b: BankQ, k: number): Practice => {
            let placed: [string[], number] | undefined
            let fig: string | undefined
            const at = () => (placed ??= place(b, no + pi + k))
            const iq = b.iq ? ineqSpec(b.a) : null
            if (iq) return { figure: card(b), tex: b.q, choices: ['', ''], correct: 0, why: '', ineq: iq, lesson: () => solutionLesson(b, `${ch.no}.${sec.no} exercise ${e.no}${p.p}`) }
            if (b.pp) return { figure: card(b), tex: b.q, choices: ['', ''], correct: 0, why: '', plot: b.pp, lesson: () => solutionLesson(b, `${ch.no}.${sec.no} exercise ${e.no}${p.p}`) }
            if (b.mk) return { figure: card(b), tex: b.q, choices: ['', ''], correct: 0, why: '', mark: b.mk, lesson: () => solutionLesson(b, `${ch.no}.${sec.no} exercise ${e.no}${p.p}`) }
            if (b.fl) return { figure: card(b), tex: b.q, choices: ['', ''], correct: 0, why: '', fill: b.fl, lesson: () => solutionLesson(b, `${ch.no}.${sec.no} exercise ${e.no}${p.p}`) }
            if (b.dr) return { figure: card(b), tex: b.q, choices: ['', ''], correct: 0, why: '', draw: b.dr, lesson: () => solutionLesson(b, `${ch.no}.${sec.no} exercise ${e.no}${p.p}`) }
            if (b.p) return { figure: card(b), tex: b.q, choices: ['', ''], correct: 0, why: '', place: b.p, lesson: () => solutionLesson(b, `${ch.no}.${sec.no} exercise ${e.no}${p.p}`) }
            if (b.o) return { figure: card(b), tex: b.q, choices: ['', ''], correct: 0, why: '', sort: b.o, lesson: () => solutionLesson(b, `${ch.no}.${sec.no} exercise ${e.no}${p.p}`) }
            return Object.defineProperties({ tex: b.q, why: '', lesson: () => solutionLesson(b, `${ch.no}.${sec.no} exercise ${e.no}${p.p}`) }, {
              figure: { get: () => (fig ??= card(b)), enumerable: true },
              choices: { get: () => at()[0], enumerable: true },
              correct: { get: () => at()[1], enumerable: true },
            }) as Practice
          }
          const all = p.qs.map((b, k) => make(b, k))
          return mix({ part: p.p || '1' }, all[0], { practice: all }) as Question
        })
        exercises[no] = { no: e.no, sec: `${ch.no}.${sec.no}`, prompt: 'Choose the answer.', questions }
        return { no, name: e.name || `Exercise ${e.no}`, show: e.no, parts: e.parts.length, how: '', state: 'ready' as const }
      }),
    })),
  }))
  return { exercises, chapters }
}

export async function loadBank(grade: number): Promise<BankGrade> {
  const r = await fetch(`${import.meta.env.BASE_URL}bank/g${grade}.json`)
  if (!r.ok) throw new Error(`bank g${grade}: ${r.status}`)
  return r.json()
}
