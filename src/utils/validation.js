// Centralized validation rules — every user input passes through here.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PASSWORD_RE = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/

export const validators = {
  required: (v) => (v && String(v).trim().length > 0) || 'This field is required.',

  name: (v) => {
    if (!v || String(v).trim().length < 3) return 'Enter your full name (at least 3 characters).'
    if (!/^[a-zA-Z][a-zA-Z\s.'-]*$/.test(v.trim())) return 'Name may only contain letters, spaces, dots and hyphens.'
    return null
  },

  username: (v) => {
    if (!v || String(v).trim().length < 3) return 'Username must be at least 3 characters.'
    if (!/^[a-zA-Z0-9_.-]+$/.test(v.trim())) return 'Only letters, numbers, and . _ - allowed.'
    return null
  },

  email: (v) => {
    if (!v) return 'Email is required.'
    if (!EMAIL_RE.test(String(v).trim())) return 'Enter a valid email address.'
    return null
  },

  password: (v) => {
    if (!v) return 'Password is required.'
    if (String(v).length < 8) return 'Password must be at least 8 characters.'
    if (!PASSWORD_RE.test(String(v))) return 'Password needs letters, a number, and a special character.'
    return null
  },

  confirmPassword: (v, all) => {
    if (!v) return 'Please confirm your password.'
    if (v !== all.password) return 'Passwords do not match.'
    return null
  },

  caseId: (v) => {
    const s = String(v || '').trim()
    if (!s) return 'Case identifier is required.'
    if (!/^[A-Za-z0-9][A-Za-z0-9-/._]*$/.test(s)) return 'Use only letters, numbers, - / and .'
    return null
  },

  caseTitle: (v) => {
    const s = String(v || '').trim()
    if (s.length < 5) return 'Case title must be at least 5 characters.'
    if (s.length > 140) return 'Case title must be under 140 characters.'
    return null
  },

  classification: (v) => {
    const s = String(v || '').trim()
    if (!s) return 'Select a classification level.'
    return null
  },

  documentTitle: (v) => {
    const s = String(v || '').trim()
    if (s.length < 3) return 'Document title must be at least 3 characters.'
    if (s.length > 160) return 'Document title must be under 160 characters.'
    return null
  },

  documentType: (v) => (String(v || '').trim() ? null : 'Select a document type.'),
  file: (file) => {
    if (!file) return 'Attach a document to proceed.'
    const ok = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'].includes(file.type)
    if (!ok) return 'Only PDF, PNG, JPEG or WEBP files are allowed.'
    if (file.size > 25 * 1024 * 1024) return 'File exceeds the 25 MB limit.'
    return null
  },

  notes: (v) => {
    if (String(v || '').trim().length > 600) return 'Notes must be under 600 characters.'
    return null
  },

  recipient: (v) => {
    const s = String(v || '').trim()
    if (!s) return 'Recipient is required.'
    if (!EMAIL_RE.test(s)) return 'Enter a valid recipient email address.'
    return null
  },
}

// Run a map of { field: value } against a rules map; returns { errors } object.
export function runValidation(values, rules) {
  const errors = {}
  for (const field of Object.keys(rules)) {
    const rule = rules[field]
    const msg = typeof rule === 'function' ? rule(values[field], values) : null
    if (msg) errors[field] = msg
  }
  return errors
}

export function hasErrors(errors) {
  return Object.keys(errors).length > 0
}

export function fmtBytes(bytes) {
  if (!bytes && bytes !== 0) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}
