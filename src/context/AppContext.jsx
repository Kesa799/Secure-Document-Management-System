import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { sha256Hex, sha256HexString, uid } from '../utils/hash'

const STORE_KEY = 'cadence-dms-v1'

const AppCtx = createContext(null)
export const useApp = () => useContext(AppCtx)

// Files live in memory (object URLs) because browsers can't persist large
// blobs in localStorage. All *metadata* persists across reloads.
const memoryFiles = new Map() // fileId -> { blob, url, name, mime, size }

export function AppProvider({ children }) {
  const [store, setStore] = useState(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY)
      return raw ? JSON.parse(raw) : { users: [], session: null, cases: [], audit: [] }
    } catch {
      return { users: [], session: null, cases: [], audit: [] }
    }
  })
  const storeRef = useRef(store)
  storeRef.current = store

  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(store))
    } catch (e) {
      console.warn('Could not persist state', e)
    }
  }, [store])

  const pushAudit = (actor, action, target, outcome, detail = '') => {
    const entry = {
      id: uid('AU-'),
      ts: new Date().toISOString(),
      actorId: actor?.id || '—',
      actorName: actor?.name || 'System',
      role: actor?.role || '—',
      action,
      target,
      outcome,
      detail,
    }
    setStore((s) => ({ ...s, audit: [entry, ...s.audit] }))
    return entry
  }

  // ---------- AUTH ----------
  const register = async ({ name, username, email, password, role }) => {
    const exists = storeRef.current.users.find(
      (u) => u.email === email.toLowerCase() || u.username === username.toLowerCase()
    )
    if (exists) {
      const field = exists.email === email.toLowerCase() ? 'email' : 'username'
      throw new Error(`An account with this ${field} already exists.`)
    }
    const user = {
      id: uid('U-'),
      name: name.trim(),
      username: username.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      passwordHash: await sha256HexString(`${email.trim().toLowerCase()}::${password}`),
      role,
      createdAt: new Date().toISOString(),
    }
    setStore((s) => ({ ...s, users: [...s.users, user], session: user.id }))
    return user
  }

  const login = async ({ email, password }) => {
    const user = storeRef.current.users.find(
      (u) => u.email === email.trim().toLowerCase()
    )
    if (!user) throw new Error('No account found for this email. Please sign up first.')
    const hash = await sha256HexString(`${user.email}::${password}`)
    if (hash !== user.passwordHash) throw new Error('Incorrect password. Please try again.')
    setStore((s) => ({ ...s, session: user.id }))
    return user
  }

  const logout = () => setStore((s) => ({ ...s, session: null }))

  // ---------- CASES ----------
  const createCase = (actor, { caseId, title, classification, notes }) => {
    const caseObj = {
      id: uid('C-'),
      caseId: caseId.trim().toUpperCase(),
      title: title.trim(),
      classification,
      notes: (notes || '').trim(),
      status: 'Active',
      ownerId: actor.id,
      ownerName: actor.name,
      createdAt: new Date().toISOString(),
      docCount: 0,
    }
    setStore((s) => ({ ...s, cases: [caseObj, ...s.cases] }))
    pushAudit(actor, 'Case Created', `${caseObj.caseId} · ${caseObj.title}`, 'Success', `Classification: ${classification}`)
    return caseObj
  }

  const closeCase = (actor, caseId) => {
    setStore((s) => ({
      ...s,
      cases: s.cases.map((c) => (c.id === caseId ? { ...c, status: c.status === 'Active' ? 'Closed' : 'Active' } : c)),
    }))
    const c = storeRef.current.cases.find((x) => x.id === caseId)
    pushAudit(actor, c.status === 'Active' ? 'Case Closed' : 'Case Reopened', c?.caseId, 'Success')
  }

  const deleteCase = (actor, caseId) => {
    setStore((s) => ({ ...s, cases: s.cases.filter((c) => c.id !== caseId) }))
    const c = storeRef.current.cases.find((x) => x.id === caseId)
    pushAudit(actor, 'Case Deleted', c?.caseId, 'Success')
  }

  // ---------- DOCUMENTS ----------
  const addDocument = async (actor, { caseId, title, docType, category, description, file, notes }) => {
    const hash = await sha256Hex(file)
    const fileId = uid('F-')
    memoryFiles.set(fileId, {
      blob: file, url: URL.createObjectURL(file), name: file.name, mime: file.type, size: file.size,
    })
    const doc = {
      id: uid('D-'),
      caseId,
      title: title.trim(),
      docType,
      category,
      description: (description || '').trim(),
      notes: (notes || '').trim(),
      ownerId: actor.id,
      ownerName: actor.name,
      createdAt: new Date().toISOString(),
      versions: [
        {
          vid: uid('V-'),
          versionNo: 1,
          fileName: file.name,
          mime: file.type,
          size: file.size,
          fileId,
          registeredHash: hash,
          liveHash: hash,
          signed: false,
          signer: null,
          signedAt: null,
          createdById: actor.id,
          createdByName: actor.name,
          createdAt: new Date().toISOString(),
        },
      ],
    }
    setStore((s) => ({
      ...s,
      cases: s.cases.map((c) => (c.id === caseId ? { ...c, docCount: c.docCount + 1 } : c)),
      documents: [...(s.documents || []), doc],
    }))
    pushAudit(actor, 'Document Upload', `${doc.title} (v1)`, 'Success', `${file.name} · ${hash.slice(0, 16)}…`)
    return doc
  }

  const addVersion = async (actor, docId, { file, note }) => {
    const doc = storeRef.current.documents.find((d) => d.id === docId)
    const hash = await sha256Hex(file)
    const fileId = uid('F-')
    memoryFiles.set(fileId, {
      blob: file, url: URL.createObjectURL(file), name: file.name, mime: file.type, size: file.size,
    })
    const versionNo = doc.versions.length + 1
    const ver = {
      vid: uid('V-'),
      versionNo,
      fileName: file.name,
      mime: file.type,
      size: file.size,
      fileId,
      registeredHash: hash,
      liveHash: hash,
      signed: false,
      signer: null,
      signedAt: null,
      note: (note || '').trim(),
      createdById: actor.id,
      createdByName: actor.name,
      createdAt: new Date().toISOString(),
    }
    setStore((s) => ({
      ...s,
      documents: s.documents.map((d) => (d.id === docId ? { ...d, versions: [...d.versions, ver] } : d)),
    }))
    pushAudit(actor, 'Version Created', `${doc.title} · v${versionNo}`, 'Success', `SHA-256 ${hash.slice(0, 16)}…`)
    return ver
  }

  // Replace the file of an existing version (this changes liveHash -> verification can detect mismatch)
  const replaceVersionFile = async (actor, docId, vid, file) => {
    const doc = storeRef.current.documents.find((d) => d.id === docId)
    const ver = doc.versions.find((v) => v.vid === vid)
    const hash = await sha256Hex(file)
    const fileId = uid('F-')
    memoryFiles.set(fileId, {
      blob: file, url: URL.createObjectURL(file), name: file.name, mime: file.type, size: file.size,
    })
    // revoke old url if the file was in memory only
    const old = memoryFiles.get(ver.fileId)
    if (old) try { URL.revokeObjectURL(old.url) } catch {}

    setStore((s) => ({
      ...s,
      documents: s.documents.map((d) =>
        d.id === docId
          ? {
              ...d,
              versions: d.versions.map((v) =>
                v.vid === vid ? { ...v, fileName: file.name, mime: file.type, size: file.size, fileId, liveHash: hash } : v
              ),
            }
          : d
      ),
    }))
    const match = hash === ver.registeredHash
    pushAudit(actor, 'File Replaced', `${doc.title} · v${ver.versionNo}`, match ? 'Success' : 'Integrity Alert', `New SHA-256 ${hash.slice(0, 16)}…`)
    return { match }
  }

  const verifyVersion = async (actor, docId, vid) => {
    const doc = storeRef.current.documents.find((d) => d.id === docId)
    const ver = doc.versions.find((v) => v.vid === vid)
    // recompute from live bytes if present, else use stored liveHash
    let live = ver.liveHash
    const mem = memoryFiles.get(ver.fileId)
    if (mem) {
      const recomputed = await sha256Hex(mem.blob || (await fetch(mem.url).then((r) => r.blob())))
      live = recomputed
    }
    const match = live === ver.registeredHash
    const outcome = match ? 'Verified' : 'Hash Mismatch'
    const ver2 = storeRef.current.documents.find((d) => d.id === docId).versions.find((v) => v.vid === vid)
    pushAudit(actor, 'Verification', `${doc.title} · v${ver.versionNo}`, outcome, `live ${live.slice(0, 16)}… vs registry ${ver.registeredHash.slice(0, 16)}…`)
    return { match, liveHash: live, registeredHash: ver.registeredHash, versionNo: ver2.versionNo, title: doc.title }
  }

  const signVersion = (actor, docId, vid) => {
    const doc = storeRef.current.documents.find((d) => d.id === docId)
    const ver = doc.versions.find((v) => v.vid === vid)
    setStore((s) => ({
      ...s,
      documents: s.documents.map((d) =>
        d.id === docId
          ? {
              ...d,
              versions: d.versions.map((v) =>
                v.vid === vid ? { ...v, signed: true, signer: actor.name, signerId: actor.id, signedAt: new Date().toISOString() } : v
              ),
            }
          : d
      ),
    }))
    pushAudit(actor, 'Document Signed', `${doc.title} · v${ver.versionNo}`, 'Success', `Signed by ${actor.name}`)
    return { versionNo: ver.versionNo }
  }

  const shareDocument = (actor, docId, { recipient, purpose }) => {
    const doc = storeRef.current.documents.find((d) => d.id === docId)
    const { title } = doc
    pushAudit(actor, 'Document Shared', title, 'Success', `To ${recipient}${purpose ? ` · ${purpose}` : ''}`)
    return title
  }

  const registerDocumentView = (actor, docId, title, versionNo) => {
    pushAudit(actor, 'Document Viewed', `${title} · v${versionNo}`, 'Success')
  }

  // ---------- USERS ----------
  const addUserByAdmin = async (actor, { name, username, email, password, role }) => {
    const exists = storeRef.current.users.find(
      (u) => u.email === email.toLowerCase() || u.username === username.toLowerCase()
    )
    if (exists) throw new Error('A user with that email or username already exists.')
    const user = {
      id: uid('U-'),
      name: name.trim(),
      username: username.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      passwordHash: await sha256HexString(`${email.trim().toLowerCase()}::${password}`),
      role,
      createdAt: new Date().toISOString(),
    }
    setStore((s) => ({ ...s, users: [...s.users, user] }))
    pushAudit(actor, 'User Created', `${user.name} · ${ROLE_LABEL(user.role)}`, 'Success')
    return user
  }

  const value = useMemo(
    () => ({
      store,
      users: store.users,
      cases: store.cases || [],
      documents: store.documents || [],
      audit: store.audit || [],
      sessionUserId: store.session,
      currentUser: store.users.find((u) => u.id === store.session) || null,
      getFile: (fileId) => memoryFiles.get(fileId),
      register, login, logout,
      createCase, closeCase, deleteCase,
      addDocument, addVersion, replaceVersionFile, verifyVersion, signVersion, shareDocument, registerDocumentView,
      addUserByAdmin,
    }),
    [store]
  )

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}

export const ROLE_LABEL = (r) => ({ administrator: 'Administrator', investigator: 'Investigator', legal_officer: 'Legal Officer', forensic_officer: 'Forensic Officer', auditor: 'Auditor', viewer: 'Viewer' }[r] || r)
