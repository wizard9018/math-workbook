// Draft of the chapter-review map for every chapter (the ones not in REVIEW_MAP of export-bank.mjs): one review exercise per textbook review exercise.
// The textbook review (mineru .../Chapter N.md, after the "Chapter Review" heading) is split at "Section x.y" headings and "n. instruction" lines; each exercise is
// matched (similarity 0.15 or more, else left out) to the exercise of that section (public/bank/gN.json, as exported) whose name + questions are closest in words (tf-idf cosine), and takes its parts.
// Run:  node scripts/gen-review-map.mjs   (after export-bank.mjs; writes scripts/review-map.json, read by export-bank.mjs)
import fs from 'node:fs'
const MINERU = 'C:/Users/wizar/Projects/k12-frontend-worktrees/pet-growth-system/.scratch/crescent-beach/mineru'
const BOOKS = [{ dir: 'G8', grade: 8 }, { dir: 'Math 10', grade: 10 }, { dir: 'Precal-11', grade: 11 }, { dir: 'Precal-12', grade: 12 }]
const SKIP = new Set(['G8|2', 'G8|3']) // made by hand in export-bank.mjs
const words = (s) => (s.toLowerCase().replace(/\\[a-z]+/g, ' ').replace(/[^a-z0-9.+\-]+/g, ' ').match(/[a-z]{3,}|\d+/g) ?? [])
const out = {}
const report = []
for (const { dir, grade } of BOOKS) {
  const bank = JSON.parse(fs.readFileSync(`public/bank/g${grade}.json`, 'utf8'))
  for (const ch of bank.chapters) {
    const key = `${dir}|${ch.no}`
    if (SKIP.has(key)) continue
    const f = `${MINERU}/${dir}/Chapter ${ch.no}/auto/Chapter ${ch.no}.md`
    if (!fs.existsSync(f)) continue
    const lines = fs.readFileSync(f, 'utf8').split('\n')
    let at = -1
    lines.forEach((l, i) => { if (/^#+\s*(?:chapter review|review exercises)/i.test(l.trim())) at = i })
    if (at < 0) { report.push(`${key}: no review heading`); continue }
    // split into review exercises
    const exs = []
    let sec = null, cur = null
    for (const l of lines.slice(at + 1)) {
      const t = l.trim()
      const sm = /^(?:#+\s*)?Section\s+(\d+)\.(\d+)/i.exec(t)
      if (sm) { sec = Number(sm[2]); continue }
      if (/^#+\s*(?:chapter test|cumulative|answers?)/i.test(t)) break
      const em = /^(\d{1,2})\s*[.)]\s*(\S.*)$/.exec(t)
      if (em && Number(em[1]) === (cur ? cur.no + 1 : 1)) { cur = { no: Number(em[1]), sec, text: em[2], letters: new Set() }; exs.push(cur); continue }
      if (cur) {
        cur.text += ' ' + t
        for (const m of t.matchAll(/(?:^|\s)([a-j])\)/g)) cur.letters.add(m[1])
      }
    }
    const sections = ch.sections.filter((s) => s.title !== 'Chapter review')
    if (!exs.length || !sections.length) { report.push(`${key}: ${exs.length} review exercises`); continue }
    // documents: every exercise of the chapter
    const docs = []
    for (const s of sections) for (const e of s.exercises) docs.push({ sec: s.no, e, w: words(`${e.name} ${e.name} ${e.parts.slice(0, 12).map((p) => p.qs[0]?.q ?? '').join(' ')}`) })
    const df = new Map()
    for (const d of docs) for (const w of new Set(d.w)) df.set(w, (df.get(w) ?? 0) + 1)
    const idf = (w) => Math.log((docs.length + 1) / ((df.get(w) ?? 0) + 1)) + 1
    const vec = (ws) => { const m = new Map(); for (const w of ws) m.set(w, (m.get(w) ?? 0) + idf(w)); return m }
    const cos = (a, b) => { let dot = 0, na = 0, nb = 0; for (const [w, x] of a) { na += x * x; if (b.has(w)) dot += x * b.get(w) }; for (const x of b.values()) nb += x * x; return dot / (Math.sqrt(na * nb) || 1) }
    for (const d of docs) d.v = vec(d.w)
    const used = new Map() // "sec|no" -> next part index
    const map = []
    for (const r of exs) {
      const rv = vec(words(r.text))
      const cand = docs.filter((d) => (r.sec == null ? true : d.sec === r.sec))
      let best = null, bs = -1
      for (const d of (cand.length ? cand : docs)) {
        const s = cos(rv, d.v)
        if (s > bs) { bs = s; best = d }
      }
      if (!best) continue
      const n = Math.min(Math.max(r.letters.size, 2), 6)
      const k = `${best.sec}|${best.e.no}`
      // in a merged exercise (several kinds of question) start at the part that looks most like the review exercise
      let start = used.get(k) ?? 0
      if (start === 0 && best.e.parts.length > 1) {
        let bp = -1, bi = 0
        best.e.parts.forEach((p, i) => { const sc = cos(rv, vec(words(p.qs[0]?.q ?? ''))); if (sc > bp) { bp = sc; bi = i } })
        start = bi
      }
      let parts = best.e.parts.slice(start, start + n)
      if (!parts.length) parts = best.e.parts.slice(0, n) // all parts already used: start over
      used.set(k, start + parts.length)
      map.push([r.no, parts.map((p, i) => ['abcdefghij'[i], best.sec, best.e.no, p.p]), best.e.name, Number(bs.toFixed(2)), r.text.slice(0, 70)])
    }
    out[key] = map
    report.push(`${key}: ${map.length} of ${exs.length} review exercises`)
  }
}
fs.writeFileSync('scripts/review-map.json', JSON.stringify(Object.fromEntries(Object.entries(out).map(([k, v]) => [k, v.filter((x) => x[3] >= 0.15).map((x) => x.slice(0, 3))]))))
fs.writeFileSync('scripts/review-map.debug.txt', Object.entries(out).map(([k, v]) => `== ${k}\n` + v.map((x) => `${x[0]}  <- ${x[1][0][1]}.${x[1][0][2]} (${x[1].length} parts) "${x[2].slice(0, 40)}"  sim ${x[3]} | ${x[4]}`).join('\n')).join('\n'))
console.log(report.join('\n'))
