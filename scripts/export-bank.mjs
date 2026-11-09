// Export the Crescent Beach question banks (G8, Math 10, Precal-11, Precal-12) for the quiz site: public/bank/g<grade>.json
//   node scripts/export-bank.mjs [bankRoot=C:/Users/wizar/Projects/k12-frontend-worktrees/pet-growth-system/.scratch/crescent-beach]
// Per textbook part (e.g. 6.1 exercise 7a): up to 5 normal (level 1) + 5 harder (level 2) questions. Exercises listed in removed.json are skipped.
// Formulas are written as \( ... \) (toApp is copied from the k12-frontend build script scripts/math-g8-12/build.mjs).
import fs from 'node:fs'
import path from 'node:path'

let suspicious = 0
export function toApp(text) {
  // JSON from the generators sometimes swallowed the backslash of a LaTeX command ("\frac" -> form feed + "rac", "\text" -> tab + "ext",
  // "\beta" -> backspace, "\right" -> carriage return, "\neq" -> newline + "eq"): put the backslash back.
  const s = String(text)
    .replace(/\f/g, '\\f')
    .replace(/\x08/g, '\\b')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    .replace(/\n(?=(?:eq\b|abla|ot\b|u\b))/g, '\\n')
    .replace(/\\text\{\s*_+\s*\}/g, '\\underline{\\quad}') // a blank written as \text{___} does not parse in KaTeX
  let out = ''
  let i = 0
  while (i < s.length) {
    const c = s[i]
    if (c === '\\' && s[i + 1] === '$') {
      out += '$'
      i += 2
      continue
    }
    if (c === '$' && s[i + 1] === '$') {
      // $$ ... $$ (display math in the banks) -> an inline KaTeX segment in display style
      const close = s.indexOf('$$', i + 2)
      if (close > 0) {
        out += `\\(\\displaystyle ${s.slice(i + 2, close).trim()}\\)`
        i = close + 2
        continue
      }
    }
    if (c === '$') {
      let end = -1
      if (i + 1 < s.length && !/\s/.test(s[i + 1])) {
        for (let k = i + 1; k < s.length; k++) {
          if (s[k] === '\\') {
            k++
            continue
          }
          if (s[k] === '$' && !/\s/.test(s[k - 1])) {
            end = k
            break
          }
        }
      }
      if (end > 0) {
        const body = s.slice(i + 1, end)
        const bare = body.replace(/\\(?:begin|end)\{[a-z*]+\}/g, '').replace(/\\(?:text|mathrm|textbf|mathbf|operatorname)\{[^}]*\}/g, '').replace(/\\[a-zA-Z]+/g, '')
        // a "formula" containing ordinary words is really "$360,000 ... $" (money signs): leave this $ as a dollar sign
        if (/[a-zA-Z]{4,}/.test(bare) || /(^|[^\\])\$/.test(body)) {
          suspicious++
        } else {
          out += `\\(${body}\\)`
          i = end + 1
          continue
        }
      }
    }
    out += c
    i++
  }
  return out
}

// a blank written as ____ inside a formula is a subscript to KaTeX: draw it as a line
const T = (t) => toApp(t).replace(/\\\(([\s\S]+?)\\\)/g, (m, b) => '\\(' + b.replace(/_{2,}/g, '\\underline{\\quad}') + '\\)')

// ---- hand-made exercises (instead of the Gemini bank) ----
const BS = String.fromCharCode(92)
const M = (x) => BS + '(' + x + BS + ')'
const isPrime = (n) => { if (n < 2) return false; for (let k = 2; k * k <= n; k++) if (n % k === 0) return false; return true }
// G8 1.1 exercise 4: one number at a time, "is it prime?" (the textbook gives 12 numbers: 0 1 18 19 29 49 59 87 89 97 103 105). 12 questions, each drawn from numbers near the textbook one (never the textbook number itself, except 0 and 1)
const primeQ = (n) => {
  const small = [2, 3, 5, 7, 11, 13].find((p) => n % p === 0 && p !== n)
  const q = `Is ${M(n)} a prime number?`
  if (n === 0) return { q, a: 'No', d: ['Yes'], s: `${M('0')} can be divided by every whole number (and it has no two factors that give a product to make a prime), so it is not prime.`, l: 1 }
  if (n === 1) return { q, a: 'No', d: ['Yes'], s: `${M('1')} has only one factor, itself. A prime number must have exactly two factors, so ${M('1')} is not prime.`, l: 1 }
  if (isPrime(n)) return { q, a: 'Yes', d: ['No'], s: `${M(n)} is not divisible by any whole number other than ${M('1')} and ${M(n)} (check the primes up to ${M(Math.floor(Math.sqrt(n)))}), so it is prime.`, l: 1 }
  return { q, a: 'No', d: ['Yes'], s: `${M(n)} = ${M(small)} ${M(BS + 'times')} ${M(n / small)}, so it has a factor other than ${M('1')} and itself. It is composite, not prime.`, l: 1 }
}
const TEXTBOOK_PRIME_NUMBERS = [0, 1, 18, 19, 29, 49, 59, 87, 89, 97, 103, 105]
const primeParts = () => TEXTBOOK_PRIME_NUMBERS.map((t, i) => {
  const pool = []
  for (let k = 1; pool.length < 6 && k < 60; k++) for (const n of [t + k, t - k]) if (n >= 2 && !TEXTBOOK_PRIME_NUMBERS.includes(n) && pool.length < 6) pool.push(n)
  if (t <= 1) pool.splice(0, 1, t) // 0 and 1 are the special cases: they stay in their own questions
  const withPrime = pool.some(isPrime) ? pool : [...pool.slice(0, 5), pool.find((n) => n > 10 && isPrime(n)) ?? 13]
  return { p: 'abcdefghijkl'[i], qs: withPrime.map(primeQ) }
})
const MERGES = { 'G8|1|1': [[9, 10, 11, 12, 13, 14]] }
const OVERRIDES = { 'G8|1|1|4': { name: 'Is it a prime number?', parts: primeParts } }

const root = process.argv[2] ?? 'C:/Users/wizar/Projects/k12-frontend-worktrees/pet-growth-system/.scratch/crescent-beach'
const readJson = (f) => JSON.parse(fs.readFileSync(f, 'utf8'))
const removed = new Set(readJson(path.join(root, 'removed.json')))
const titles = readJson(path.join(root, 'agent-tasks/section-titles.json'))
const BOOKS = [
  { dir: 'G8', grade: 8, skip: [7, 8] },
  { dir: 'Math 10', grade: 10, skip: [7] },
  { dir: 'Precal-11', grade: 11, skip: [] },
  { dir: 'Precal-12', grade: 12, skip: [] },
]
const KINDS = ['final', 'figure-final', 'figure-geo-final']
const only = process.argv.slice(3)
const LIM = 5
// deterministic order (no Math.random): rebuilding gives the same file
const hash = (s) => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0; return h }

for (const book of BOOKS) {
  if (only.length && !only.includes(String(book.grade))) continue
  const chapters = []
  let nq = 0
  const chs = fs.readdirSync(path.join(root, 'bank')).filter((d) => d.startsWith(`${book.dir}-ch`) && /-ch\d+$/.test(d)).map((d) => Number(d.split('-ch')[1])).sort((a, b) => a - b)
  for (const ch of chs) {
    if (book.skip.includes(ch)) continue
    const base = path.join(root, 'bank', `${book.dir}-ch${ch}`)
    const pool = new Map() // "sec|no|part" -> {1:[],2:[]}
    for (const kind of KINDS) {
      const kd = path.join(base, kind)
      if (!fs.existsSync(kd)) continue
      for (const sd of fs.readdirSync(kd)) for (const f of fs.readdirSync(path.join(kd, sd))) {
        if (!/^type-\d+\.json$/.test(f)) continue
        for (const it of readJson(path.join(kd, sd, f))) {
          const m = /^(\d+)\.(\d+) exercise (\d+)([a-z]*)/.exec(it.source ?? '')
          if (!m || !it.a || !Array.isArray(it.d) || it.d.length !== 3 || (it.level !== 1 && it.level !== 2)) continue
          const k = `${m[2]}|${m[3]}|${m[4]}`
          const slot = pool.get(k) ?? { 1: [], 2: [] }
          slot[it.level].push(it)
          pool.set(k, slot)
        }
      }
    }
    const sections = []
    for (const sd of fs.readdirSync(base).filter((d) => /^s\d+$/.test(d)).sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)))) {
      const sec = Number(sd.slice(1))
      const ip = path.join(base, sd, 'items.json')
      if (!fs.existsSync(ip)) continue
      const ij = readJson(ip)
      const items = ij.items
      const typeName = new Map((ij.types ?? []).map((t) => [t.id, t.name]))
      const nos = [...new Set(items.map((i) => String(i.no)))].sort((a, b) => parseInt(a) - parseInt(b))
      const exercises = []
      for (const no of nos) {
        if (removed.has(`${book.dir}|${ch}|${sec}|${no}`)) continue
        const ov = OVERRIDES[`${book.dir}|${ch}|${sec}|${no}`]
        if (ov) { exercises.push({ no: Number(no), name: ov.name, parts: ov.parts() }); continue }
        const parts = []
        for (const part of [...new Set(items.filter((i) => String(i.no) === no).map((i) => i.part ?? ''))].sort()) {
          const slot = pool.get(`${sec}|${no}|${part}`)
          if (!slot) continue
          const seen = new Set()
          const qs = []
          for (const lv of [1, 2]) {
            const cand = [...slot[lv]].sort((a, b) => hash(a.q) - hash(b.q))
            let n = 0
            for (const it of cand) {
              if (n >= LIM || seen.has(it.q)) continue
              seen.add(it.q)
              n++
              const d = it.d.map(T)
              const a = T(it.a)
              if (new Set([a, ...d]).size !== 4) continue
              qs.push({ q: T(it.q), a, d, s: it.solution ? T(it.solution) : '', l: lv, ...(it.figure ? { f: it.figure } : {}) })
            }
          }
          if (qs.length) parts.push({ p: part, qs })
        }
        if (parts.length) exercises.push({ no: Number(no), name: typeName.get(items.find((i) => String(i.no) === no)?.type_id) ?? '', parts })
      }
      // exercises the user asked to merge into one (the parts of the later ones follow the first one's, lettered a, b, c ...)
      for (const group of MERGES[`${book.dir}|${ch}|${sec}`] ?? []) {
        const hit = exercises.filter((e) => group.includes(e.no))
        if (hit.length < 2) continue
        const parts = hit.flatMap((e) => e.parts).map((p, i) => ({ ...p, p: 'abcdefghijklmnopqrstuvwxyz'[i] }))
        const at = exercises.indexOf(hit[0])
        exercises.splice(at, 1, { ...hit[0], parts })
        for (const e of hit.slice(1)) exercises.splice(exercises.indexOf(e), 1)
      }
      if (exercises.length) sections.push({ no: sec, title: titles[`${book.dir}|${ch}|${sec}`] ?? `Section ${ch}.${sec}`, exercises })
    }
    if (sections.length) chapters.push({ no: ch, sections })
    nq += sections.reduce((s, x) => s + x.exercises.reduce((t, e) => t + e.parts.reduce((u, p) => u + p.qs.length, 0), 0), 0)
  }
  const out = path.join('public', 'bank', `g${book.grade}.json`)
  fs.writeFileSync(out, JSON.stringify({ grade: book.grade, book: book.dir, chapters }))
  console.log(`${out}: ${chapters.length} chapters, ${chapters.reduce((s, c) => s + c.sections.length, 0)} sections, ${nq} questions, ${Math.round(fs.statSync(out).size / 1024)} KB`)
}
console.log(`plain dollar signs left: ${suspicious}`)
