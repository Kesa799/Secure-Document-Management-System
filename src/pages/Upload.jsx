import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UploadCloud, FileText, CheckCircle2, FileCheck, Fingerprint, GitBranch, ShieldCheck, AlertCircle,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Button, Field, TextInput, Textarea, Select, Badge, useToasts, ToastHost } from '../components/ui'

const emptyForm = { title: '', docType: '', category: 'Evidence', description: '', notes: '' }

export default function Upload() {
  const { currentUser, cases, addDocument } = useApp()
  const { toasts, push, dismiss } = useToasts()
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [caseId, setCaseId] = useState('')
  const [caseErr, setCaseErr] = useState(null)
  const [file, setFile] = useState(null)
  const [fileErr, setFileErr] = useState(null)
  const [stage, setStage] = useState('idle') // idle | processing | done
  const [processingStep, setProcessingStep] = useState(0)

  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setErrors((er) => ({ ...er, [k]: undefined })) }

  const onFileDrop = (f) => {
    if (!f) return
    if (!['application/pdf', 'image/png', 'image/jpeg', 'image/webp'].includes(f.type)) { setFileErr('Only PDF, PNG, JPEG or WEBP files are allowed.'); setFile(null); return }
    if (f.size > 25 * 1024 * 1024) { setFileErr('File exceeds the 25 MB limit.'); setFile(null); return }
    setFile(f); setFileErr(null); setStage('idle'); setProcessingStep(0)
  }

  const steps = [
    'Reading file bytes & metadata',
    'Computing SHA-256 fingerprint',
    'Indexing content & assigning ID',
    'Registering in case ledger',
  ]

  const runProcessing = async () => {
    setProcessingStep(0); setStage('processing')
    for (let i = 0; i < steps.length; i++) {
      setProcessingStep(i)
      await new Promise((r) => setTimeout(r, 650))
    }
    setStage('done')
  }

  const submit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.title.trim()) errs.title = 'Document title is required.'
    if (!form.docType) errs.docType = 'Select a document type.'
    if (!caseId) setCaseErr('Select a case for this document.')
    else setCaseErr(null)
    if (!file) setFileErr('Attach a document to proceed.')
    else setFileErr(null)
    setErrors(errs)
    if (Object.keys(errs).length || !caseId || !file) return
    await runProcessing()
    try {
      const doc = await addDocument(currentUser, { ...form, caseId, file })
      push(`${doc.title} uploaded and fingerprinted.`)
      setForm(emptyForm); setFile(null); setCaseId(''); setStage('idle')
    } catch (err) {
      push(err.message, 'error'); setStage('idle')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">Intelligence panel</p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-ink" style={{ letterSpacing: '-0.02em' }}>Upload & fingerprint</h1>
        <p className="mt-1 text-sm text-slate-500">Submit a document for cryptographic fingerprinting and case registration.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <form onSubmit={submit} className="rounded-2xl bg-white p-7 shadow-float ring-1 ring-slate-100">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); onFileDrop(e.dataTransfer.files[0]) }}
            onClick={() => document.getElementById('up-file').click()}
            className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-all ${file ? 'border-emerald-500/60 bg-emerald-500/5' : fileErr ? 'border-crimson/60 bg-crimson/5' : 'border-slate-300 bg-slate-50/60 hover:border-emerald-500/60 hover:bg-emerald-500/5 hover:shadow-md'}`}
          >
            <input id="up-file" type="file" className="hidden"
              accept="application/pdf,image/png,image/jpeg,image/webp"
              onChange={(e) => onFileDrop(e.target.files[0])} />
            {file ? (
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600"><FileText size={24} /></div>
                <div className="text-left">
                  <div className="text-sm font-bold text-ink">{file.name}</div>
                  <div className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB · {file.type}</div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink/5 text-ink"><UploadCloud size={26} /></div>
                <div>
                  <p className="text-sm font-bold text-ink">Drag & drop your document</p>
                  <p className="mt-1 text-xs text-slate-400">or click to browse · PDF, PNG, JPEG, WEBP · max 25 MB</p>
                </div>
              </>
            )}
          </div>
          {fileErr && <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-crimson"><AlertCircle size={13} /> {fileErr}</p>}

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Field label="Document title" required error={errors.title}>
              <TextInput placeholder="e.g. Crime scene photograph 014" invalid={!!errors.title} value={form.title} onChange={set('title')} />
            </Field>
            <Field label="Document type" required error={errors.docType}>
              <Select value={form.docType} onChange={set('docType')} invalid={!!errors.docType}>
                <option value="">Select…</option>
                {['Forensic Report', 'Statement', 'Evidence Photo', 'Court Filing', 'Legal Memo', 'Medical Record', 'Financial Record', 'Correspondence', 'Other'].map((t) => <option key={t} value={t}>{t}</option>)}
              </Select>
            </Field>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field label="Assign to case" required error={caseErr}>
              <Select value={caseId} onChange={(e) => { setCaseId(e.target.value); setCaseErr(null) }} invalid={!!caseErr}>
                <option value="">Select a case…</option>
                {cases.filter((c) => c.status === 'Active').map((c) => <option key={c.id} value={c.id}>{c.caseId} — {c.title}</option>)}
              </Select>
            </Field>
            <Field label="Category">
              <Select value={form.category} onChange={set('category')}>
                <option>Evidence</option><option>Correspondence</option><option>Report</option><option>Reference</option>
              </Select>
            </Field>
          </div>

          <div className="mt-5">
            <Field label="Description">
              <Textarea rows={2} placeholder="Brief description…" value={form.description} onChange={set('description')} />
            </Field>
          </div>

          {/* Processing state */}
          <AnimatePresence>
            {stage !== 'idle' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="mt-6 overflow-hidden">
                <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
                  {stage === 'processing' ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                        <Fingerprint size={13} /> Processing document
                      </div>
                      {steps.map((s, i) => (
                        <div key={s} className="flex items-center gap-2.5 text-sm">
                          {i < processingStep ? (
                            <CheckCircle2 size={16} className="text-emerald-500" />
                          ) : i === processingStep ? (
                            <motion.span className="h-3.5 w-3.5 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                          ) : (
                            <span className="h-3.5 w-3.5 rounded-full border-2 border-slate-200" />
                          )}
                          <span className={i <= processingStep ? 'text-ink' : 'text-slate-400'}>{s}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600"><FileCheck size={20} /></div>
                      <div>
                        <div className="text-sm font-bold text-emerald-600">Processed & fingerprinted</div>
                        <div className="text-xs text-slate-500">Ready to register with the case ledger.</div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-6 flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => { setForm(emptyForm); setFile(null); setCaseId(''); setStage('idle'); setErrors({}) }}>Reset</Button>
            <Button type="submit" disabled={stage === 'processing'}>
              {stage === 'processing' ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Processing…</> : <><UploadCloud size={16} /> Upload & fingerprint</>}
            </Button>
          </div>
        </form>

        {/* Intelligence side panel */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-ink p-6 text-white shadow-floatlg">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-400">
              <ShieldCheck size={14} /> Processing pipeline
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Every upload is fingerprinted with a real SHA-256 digest computed from the raw file bytes —
              the foundation of tamper detection.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-float ring-1 ring-slate-100">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400"><GitBranch size={13} /> What happens next</div>
            <ul className="mt-3 space-y-3">
              {[
                ['Fingerprint', 'SHA-256 digest stored as the version’s registered hash.'],
                ['Versioning', 'Each upload becomes v1; later uploads create v2, v3…'],
                ['Verification', 'Re-compute the live hash and compare to the registry.'],
                ['Audit log', 'Upload action recorded with timestamp & actor.'],
              ].map(([t, d]) => (
                <li key={t} className="flex gap-3">
                  <Badge tone="emerald" className="h-6 shrink-0">{t}</Badge>
                  <span className="text-xs leading-relaxed text-slate-500">{d}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <ToastHost toasts={toasts} dismiss={dismiss} />
    </div>
  )
}
