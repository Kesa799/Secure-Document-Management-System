// Real SHA-256 hashing of file bytes using the Web Crypto API.
// No mock fingerprints — the digest is computed from the actual file content.

export async function sha256Hex(data) {
  const bytes = data instanceof Blob ? await data.arrayBuffer() : data
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function sha256HexString(str) {
  const enc = new TextEncoder().encode(str)
  const digest = await crypto.subtle.digest('SHA-256', enc)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function shortHash(hash, len = 16) {
  if (!hash) return '—'
  return `${hash.slice(0, len)}…${hash.slice(-6)}`
}

export function uid(prefix = '') {
  const t = Date.now().toString(16)
  const r = Math.random().toString(16).slice(2, 8)
  return `${prefix}${t}${r}`.toUpperCase()
}
