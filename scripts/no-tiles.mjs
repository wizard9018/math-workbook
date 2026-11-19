// The G8 equation exercises were written for algebra tiles, but there is no picture: "Solve using algebra tiles" becomes "Solve", and a solution written with tiles
// ("Add 3 positive unit tiles to both sides to form zero pairs ...") is worded as plain algebra ("Add 3 to both sides ...").
// Imported by: export-bank.mjs.
export const TILES = { q: 0, s: 0, left: 0 }
const ALG = /^(?:Solve|Find|Determine)\b/

export function noTiles(q) {
  if (q.f || !/algebra tile/i.test(q.q)) return
  q.q = q.q.replace(/\b(Solve|Find the solution)\s+(?:by\s+)?using\s+(?:the\s+)?algebra\s+tiles?\b/gi, '$1').replace(/\s*(?:with|using)\s+algebra\s+tiles?\b/gi, '')
  TILES.q++
  let s = q.s ?? ''
  s = s
    .replace(/\b(Add|Remove)\s+(\d+)\s+(positive|negative)\s+(?:unit\s+)?tiles?\b/gi, (m, v, n, sign) => {
      const adds = (v.toLowerCase() === 'add') === (sign.toLowerCase() === 'positive')
      return `${adds ? 'Add' : 'Subtract'} ${n}`
    })
    .replace(/\s*to form (?:a )?zero pairs?(?: on (?:the|each) (?:left|right)(?: side)?)?/gi, '')
    .replace(/\b(\d+)\s+(positive|negative)\s+(?:unit\s+)?tiles?\b/gi, (m, n, sign) => `${sign.toLowerCase() === 'negative' ? '-' : ''}${n}`)
    .replace(/\s*(?:using|with)\s+(?:the\s+)?(?:algebra\s+)?tiles?\b/gi, '')
    .replace(/\bx-tiles?\b|\b[a-z]-tiles?\b/gi, 'terms')
    .replace(/\s{2,}/g, ' ')
  // a sentence that is still about tiles is dropped; with nothing left the solution just states the result
  if (/tile/i.test(s)) {
    const keep = s.split(/(?<=[.!?])s+/).filter((t) => !/tile/i.test(t))
    s = keep.join(' ').trim() || `Solving the equation gives ${q.a}.`
    TILES.left++
  } else TILES.s++
  q.s = s
}
