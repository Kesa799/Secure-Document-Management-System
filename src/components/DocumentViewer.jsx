import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Fingerprint, Share2, PenLine, FileText, ShieldCheck, Hash, FileType2,
  CalendarClock, User, HardDrive, CircleDot, CheckCircle2, AlertTriangle, BadgeCheck,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { ROLES } from '../data/roles'
import { shortHash } from '../utils/hash'
import { fmtBytes as fb } from '../utils/validation'
import { ModalHeader, VerifiedBadge, MismatchBadge, Button, Badge, Spinner, Modal } from './ui'

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

export default function DocumentViewer({ doc, open, onClose }) {
  const { currentUser, getFile, verifyVersion, signVersion, shareDocument, registerDocumentView } = useApp()
  const role = ROLES[currentUser?.role]
  const [versionIndex, setVersionIndex] = useState(0)
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState(null) // { match, liveHash, registeredHash }
  const [signing, setSigning] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [share, setShare] = useState({ recipient: '', purpose: '' })
  const [shareErr, setShareErr] = useState({})

  useEffect(() => {
    if (open && doc) {
      setVersionIndex(doc.versions.length - 1)
      setResult(null)
      setScanning(false)
      registerDocumentView(currentUser, doc.id, doc.title, doc.versions[doc.versions.length - 1].versionNo)
    }
  }, [open, doc && doc.id])

  if (!doc) return null
  const versions = doc.versions.slice().sort((a, b) => b.versionNo - a.versionNo) // newest first
  const current = versions[versionIndex]
  const file = getFile(current.fileId)

  const runVerification = async () => {
    setScanning(true)
    setResult(null)
    await new Promise((r) => setTimeout(r, 1900))
    const res = await verifyVersion(currentUser, doc.id, current.vid)
    setResult(res)
    setScanning(false)
  }

  const doSign = async () => {
    setSigning(true)
    await new Promise((r) => setTimeout(r, 700))
    await signVersion(currentUser, doc.id, current.vid)
    setSigning(false)
  }

  const submitShare = (e) => {
    e.preventDefault()
    const errs = {}
    if (!share.recipient.trim()) errs.recipient = 'Recipient is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(share.recipient.trim())) errs.recipient = 'Enter a valid email.'
    setShareErr(errs)
    if (Object.keys(errs).length) return
    shareDocument(currentUser, doc.id, share)
    setShareOpen(false)
    setShare({ recipient: '', purpose: '' })
  }

  const isImage = current.mime?.startsWith('image/')

  return (
    <Modal open={open} onClose={onClose} maxW="max-w-6xl">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink/5 text-ink"><FileText size={19} /></div>
          <div>
            <h2 className="text-base font-bold tracking-tight text-ink">{doc.title}</h2>
            <p className="text-xs text-slate-400">v{current.versionNo} · {current.fileName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {role?.permissions?.canShare && (
            <Button size="sm" variant="secondary" onClick={() => setShareOpen(true)}><Share2 size={14} /> Share</Button>
          )}
          <Button size="sm" variant="ghost" onClick={onClose}><X size={16} /> Close</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px]">
        {/* Left: preview + timeline */}
        <div className="flex flex-col border-r border-slate-100">
          <div className="relative flex-1 overflow-hidden bg-slate-50 p-6" style={{ minHeight: 480 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={current.vid}
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.99 }}
                transition={{ duration: 0.25 }}
                className="mx-auto h-full max-h-[560px] w-full max-w-[600px] overflow-auto rounded-lg bg-white shadow-floatlg ring-1 ring-slate-200"
              >
                {file?.url ? (
                  isImage ? (
                    <img src={file.url} alt={current.fileName} className="w-full object-contain" />
                  ) : (
                    <iframe src={file.url} title={current.fileName} className="h-[560px] w-full" />
                  )
                ) : (
                  <div className="flex h-[560px] flex-col items-center justify-center gap-3 text-slate-400">
                    <FileText size={40} />
                    <p className="text-sm">Live preview unavailable after reload.<br />Fingerprint data is preserved.</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Scanning overlay */}
            {scanning && (
              <div className="pointer-events-none absolute inset-0 z-20">
                <div className="absolute inset-0 bg-ink/30" />
                <motion.div className="absolute left-0 right-0 h-24 bg-gradient-to-b from-transparent via-emerald-400/50 to-transparent animate-scan" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3 rounded-2xl bg-white/90 px-6 py-5 backdrop-blur">
                    <Spinner className="h-8 w-8 text-emerald-500" />
                    <p className="text-sm font-bold text-ink">Scanning fingerprint…</p>
                    <p className="font-mono text-[11px] text-slate-400">{shortHash(current.registeredHash, 24)}</p>
                  </div>
                </div>
              </div>
            )}

            {result && (
              <div className="absolute inset-x-0 top-4 z-30 flex justify-center">
                {result.match ? <VerifiedBadge /> : <MismatchBadge />}
              </div>
            )}
          </div>

          {/* Version timeline */}
          <div className="border-t border-slate-100 bg-white/60 px-6 py-4">
            <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
              <CircleDot size={13} /> Version timeline
            </div>
            <div className="relative flex items-start gap-0 overflow-x-auto pb-2">
              <div className="absolute left-6 right-6 top-4 border-t-2 border-dotted border-slate-200" />
              {versions.map((v, i) => {
                const active = i === versionIndex
                return (
                  <button
                    key={v.vid}
                    onClick={() => { setVersionIndex(i); setResult(null); setScanning(false) }}
                    className="relative z-10 flex w-16 shrink-0 flex-col items-center gap-1.5"
                  >
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-[11px] font-extrabold transition-all ${
                        active ? 'border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'border-white bg-white text-slate-400 ring-1 ring-slate-200 hover:ring-emerald-500/50'
                      }`}
                    >
                      v{v.versionNo}
                    </span>
                    <span className={`text-[10px] font-semibold ${active ? 'text-ink' : 'text-slate-400'}`}>
                      {fmtDate(v.createdAt).split(',')[0]}
                    </span>
                    {v.signed && <BadgeCheck size={13} className="-mt-0.5 text-emerald-500" />}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right: forensic inspector */}
        <div className="flex flex-col gap-4 p-6">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
              <Fingerprint size={13} /> Forensic metadata inspector
            </div>

            <div className="mt-3 space-y-3 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
              <MetaRow icon={<Hash size={14} />} label="SHA-256 (current)" mono>{shortHash(current.liveHash, 20)}</MetaRow>
              <MetaRow icon={<ShieldCheck size={14} />} label="SHA-256 (registered)" mono>{shortHash(current.registeredHash, 20)}</MetaRow>
              <MetaRow icon={<FileType2 size={14} />} label="Format">{current.mime || '—'}</MetaRow>
              <MetaRow icon={<HardDrive size={14} />} label="Size">{fb(current.size)}</MetaRow>
              <MetaRow icon={<CalendarClock size={14} />} label="Version created">{fmtDate(current.createdAt)}</MetaRow>
              <MetaRow icon={<User size={14} />} label="Uploaded by">{current.createdByName}</MetaRow>
            </div>
          </div>

          {/* Signature status */}
          <div className="rounded-xl bg-emerald-500/5 p-4 ring-1 ring-inset ring-emerald-500/15">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-600">
              <BadgeCheck size={14} /> Digital signature
            </div>
            {current.signed ? (
              <div className="mt-2 flex items-center gap-2">
                <Badge tone="emerald"><CheckCircle2 size={12} /> Signed</Badge>
                <span className="text-xs text-slate-600">by <b>{current.signer}</b></span>
              </div>
            ) : (
              <p className="mt-1 text-xs text-slate-500">This version is not yet signed.</p>
            )}
            {role?.permissions?.canSign && (
              <Button size="sm" variant="secondary" className="mt-3 w-full" loading={signing} onClick={doSign} disabled={current.signed}>
                {!signing && <PenLine size={14} />} {current.signed ? 'Signed' : 'Sign Document'}
              </Button>
            )}
          </div>

          {/* Verification */}
          {role?.permissions?.canVerify && (
            <Button
              variant="emerald" size="lg" className="w-full"
              onClick={runVerification} disabled={scanning}
            >
              {scanning ? <><Spinner className="h-4 w-4" /> Scanning…</> : <><Fingerprint size={17} /> Initiate Verification</>}
            </Button>
          )}

          {result && !result.match && (
            <div className="flex items-start gap-2.5 rounded-xl bg-crimson/5 px-4 py-3 ring-1 ring-inset ring-crimson/20">
              <AlertTriangle size={16} className="mt-0.5 shrink-0 text-crimson" />
              <p className="text-xs leading-relaxed text-crimson">
                Live hash differs from the registered fingerprint. The file content may have been altered after registration. Re-register the version to accept its current fingerprint.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Share modal */}
      <Modal open={shareOpen} onClose={() => setShareOpen(false)} maxW="max-w-md">
        <ModalHeader title="Share document" subtitle={`${doc.title} · v${current.versionNo}`} onClose={() => setShareOpen(false)} icon={<Share2 size={18} />} />
        <form onSubmit={submitShare} className="space-y-4 p-6">
          <div>
            <label className="block text-[13px] font-semibold text-slate-700">Recipient email <span className="text-crimson">*</span></label>
            <input
              type="email" value={share.recipient} onChange={(e) => setShare({ ...share, recipient: e.target.value })}
              placeholder="recipient@agency.gov"
              className={`mt-1.5 h-11 w-full rounded-xl border bg-slate-50 px-3.5 text-sm focus:outline-none focus:ring-4 ${shareErr.recipient ? 'border-crimson/50 focus:ring-crimson/10' : 'border-slate-200 focus:border-emerald-500/60 focus:ring-emerald-500/10'}`}
            />
            {shareErr.recipient && <p className="mt-1 text-xs font-medium text-crimson">{shareErr.recipient}</p>}
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-slate-700">Purpose</label>
            <input
              type="text" value={share.purpose} onChange={(e) => setShare({ ...share, purpose: e.target.value })}
              placeholder="e.g. Referral to legal officer"
              className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm focus:border-emerald-500/60 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={() => setShareOpen(false)}>Cancel</Button>
            <Button type="submit">Send share link</Button>
          </div>
        </form>
      </Modal>
    </Modal>
  )
}

function MetaRow({ icon, label, children, mono }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {icon} {label}
      </div>
      <div className={`mt-0.5 truncate text-[13px] font-semibold text-ink ${mono ? 'font-mono text-[12px]' : ''}`}>{children}</div>
    </div>
  )
}
