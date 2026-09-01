import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  FolderOpen, Plus, UploadCloud, FileText, Trash2, Eye, Lock, FolderPlus, Power, ShieldCheck,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { ROLES } from '../data/roles'
import { Button, Badge, Field, TextInput, Textarea, Select, Modal, ModalHeader, useToasts, ToastHost } from '../components/ui'
import { runValidation } from '../utils/validation'
import DocumentViewer from '../components/DocumentViewer'

const classificationTone = { CLASSIFIED: 'crimson', RESTRICTED: 'amber', INTERNAL: 'blue', UNCLASSIFIED: 'slate' }
const emptyCaseForm = { caseId: '', title: '', classification: '', notes: '' }
const emptyUploadForm = { title: '', docType: '', category: 'Evidence', description: '', notes: '' }

export default function Cases() {
  const { currentUser, cases, documents, createCase, closeCase, deleteCase, addDocument } = useApp()
  const role = ROLES[currentUser.role]
  const { toasts, push, dismiss } = useToasts()

  const [selectedId, setSelectedId] = useState(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [caseForm, setCaseForm] = useState(emptyCaseForm)
  const [caseErr, setCaseErr] = useState({})

  const [uploadOpen, setUploadOpen] = useState(false)
  const [upForm, setUpForm] = useState(emptyUploadForm)
  const [upErr, setUpErr] = useState({})
  const [file, setFile] = useState(null)
  const [fileErr, setFileErr] = useState(null)
  const [processing, setProcessing] = useState(false)

  const [viewDoc, setViewDoc] = useState(null)

  const selected = cases.find((c) => c.id === selectedId) || cases[0] || null
  const caseDocs = useMemo(() => documents.filter((d) => d.caseId === selected?.id), [documents, selected])

  // ---------- Case create ----------
  const openCreate = () => { setCaseForm(emptyCaseForm); setCaseErr({}); setCreateOpen(true) }
  const setCase = (k) => (e) => { setCaseForm((f) => ({ ...f, [k]: e.target.value })); setCaseErr((er) => ({ ...er, [k]: undefined })) }
  const submitCase = (e) => {
    e.preventDefault()
    const errs = runValidation(caseForm, {
      caseId: (v) => (!v ? 'Case identifier is required.' : null),
      title: (v) => (!v ? 'Case title is required.' : null),
      classification: (v) => (!v ? 'Select a classification.' : null),
    })
    setCaseErr(errs)
    if (Object.keys(errs).length) return
    const c = createCase(currentUser, caseForm)
    setSelectedId(c.id)
    setCreateOpen(false)
    push(`Case ${c.caseId} created.`)
  }

  // ---------- Upload ----------
  const openUpload = () => {
    if (!selected) return push('Create a case before uploading documents.', 'error')
    setUpForm(emptyUploadForm); setUpErr({}); setFile(null); setFileErr(null); setUploadOpen(true)
  }
  const setUp = (k) => (e) => { setUpForm((f) => ({ ...f, [k]: e.target.value })); setUpErr((er) => ({ ...er, [k]: undefined })) }
  const onFileDrop = (f) => {
    if (!f) return
    if (!['application/pdf', 'image/png', 'image/jpeg', 'image/webp'].includes(f.type)) { setFileErr('Only PDF, PNG, JPEG or WEBP files are allowed.'); setFile(null); return }
    if (f.size > 25 * 1024 * 1024) { setFileErr('File exceeds the 25 MB limit.'); setFile(null); return }
    setFile(f); setFileErr(null)
  }
  const submitUpload = async (e) => {
    e.preventDefault()
    const errs = runValidation(upForm, {
      title: (v) => (!v ? 'Document title is required.' : null),
      docType: (v) => (!v ? 'Select a document type.' : null),
    })
    if (!file) { setFileErr('Attach a document to proceed.') } else setFileErr(null)
    setUpErr(errs)
    if (Object.keys(errs).length || !file) return
    setProcessing(true)
    try {
      const doc = await addDocument(currentUser, { ...upForm, caseId: selected.id, file })
      setUploadOpen(false)
      push(`Document uploaded · ${doc.title}`)
    } catch (err) {
      push(err.message, 'error')
    } finally { setProcessing(false) }
  }

  const handleCloseCase = (c) => { closeCase(currentUser, c.id); push(`Case ${c.caseId} ${c.status === 'Active' ? 'closed' : 'reopened'}.`) }
  const handleDeleteCase = (c) => {
    if (!window.confirm(`Permanently delete case ${c.caseId} and its documents?`)) return
    deleteCase(currentUser, c.id)
    if (selectedId === c.id) setSelectedId(null)
    push(`Case ${c.caseId} deleted.`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">Workspace</p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-ink" style={{ letterSpacing: '-0.02em' }}>Cases & documents</h1>
          <p className="mt-1 text-sm text-slate-500">Documents are strictly scoped to their case.</p>
        </div>
        <div className="flex items-center gap-2">
          {role.permissions.canCreateCase && (
            <Button variant="secondary" onClick={openCreate}><FolderPlus size={16} /> New case</Button>
          )}
          <Button onClick={openUpload}><UploadCloud size={16} /> Upload Document</Button>
        </div>
      </div>

      {cases.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-12 text-center shadow-float">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-ink/5 text-ink"><FolderOpen size={26} /></div>
          <h3 className="mt-4 text-lg font-bold text-ink">No cases yet</h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
            {role.permissions.canCreateCase ? 'Create your first case to begin organizing evidence documents.' : 'No cases have been assigned to your access yet.'}
          </p>
          {role.permissions.canCreateCase && (
            <Button className="mt-5" onClick={openCreate}><Plus size={16} /> Create a case</Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
          {/* Case list */}
          <div className="rounded-2xl bg-white p-3 shadow-float ring-1 ring-slate-100">
            <div className="flex items-center gap-2 px-2 pb-2 pt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
              <FolderOpen size={13} /> Active cases
            </div>
            <div className="max-h-[560px] space-y-1 overflow-y-auto pr-1">
              {cases.map((c) => {
                const active = selected?.id === c.id
                return (
                  <button key={c.id} onClick={() => setSelectedId(c.id)}
                    className={`w-full rounded-xl px-3 py-3 text-left transition ${active ? 'bg-ink text-white shadow-md' : 'hover:bg-slate-50'}`}>
                    <div className="flex items-center justify-between">
                      <span className={`font-mono text-[13px] font-bold ${active ? 'text-white' : 'text-ink'}`}>{c.caseId}</span>
                      <Badge tone={c.status === 'Active' ? 'emerald' : 'slate'} dot>{c.status}</Badge>
                    </div>
                    <div className={`mt-1 line-clamp-1 text-xs ${active ? 'text-slate-300' : 'text-slate-500'}`}>{c.title}</div>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <Badge tone={classificationTone[c.classification] || 'slate'}>{c.classification}</Badge>
                      <span className={`text-[10px] font-semibold ${active ? 'text-slate-400' : 'text-slate-400'}`}>{c.docCount} docs</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Case detail */}
          <div className="rounded-2xl bg-white p-6 shadow-float ring-1 ring-slate-100">
            {selected ? (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-extrabold tracking-tight text-ink">{selected.caseId}</h2>
                      <Badge tone={selected.status === 'Active' ? 'emerald' : 'slate'} dot>{selected.status}</Badge>
                      <Badge tone={classificationTone[selected.classification] || 'slate'}><Lock size={11} /> {selected.classification}</Badge>
                    </div>
                    <p className="mt-1 text-sm font-medium text-slate-600">{selected.title}</p>
                    {selected.notes && <p className="mt-1 max-w-lg text-xs leading-relaxed text-slate-400">{selected.notes}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    {role.permissions.canCreateCase && (
                      <>
                        <Button size="sm" variant="secondary" onClick={() => handleCloseCase(selected)}><Power size={13} /> {selected.status === 'Active' ? 'Close' : 'Reopen'}</Button>
                        {role.permissions.canDeleteCase && (
                          <Button size="sm" variant="danger" onClick={() => handleDeleteCase(selected)}><Trash2 size={13} /></Button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-5">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-bold tracking-tight text-ink">Documents in this case ({caseDocs.length})</h3>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                      <ShieldCheck size={12} className="text-emerald-500" /> Case-scoped
                    </span>
                  </div>

                  {caseDocs.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-10 text-center">
                      <UploadCloud size={26} className="mx-auto text-slate-300" />
                      <p className="mt-3 text-sm font-semibold text-slate-500">No documents in this case</p>
                      <p className="mt-1 text-xs text-slate-400">Upload the first piece of evidence to fingerprint it.</p>
                      <Button size="sm" className="mt-4" onClick={openUpload}><Plus size={14} /> Upload document</Button>
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {caseDocs.map((d) => {
                        const latest = d.versions[d.versions.length - 1]
                        return (
                          <div key={d.id}
                            className="group flex cursor-pointer flex-col rounded-xl border border-slate-100 p-4 shadow-sm transition hover:border-emerald-500/40 hover:shadow-md"
                            onClick={() => setViewDoc(d)}>
                            <div className="flex items-center gap-2">
                              <FileText size={17} className="text-slate-400 group-hover:text-emerald-500" />
                              <span className="truncate text-sm font-bold text-ink">{d.title}</span>
                            </div>
                            <p className="mt-1 truncate text-xs text-slate-400">{d.docType}{d.category ? ` · ${d.category}` : ''}</p>
                            <div className="mt-3 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge tone="slate">v{d.versions.length}</Badge>
                                {latest.signed && <Badge tone="emerald"><ShieldCheck size={10} /> Signed</Badge>}
                              </div>
                              <span className="font-mono text-[10px] text-slate-400">{latest.registeredHash.slice(0, 10)}…</span>
                            </div>
                            <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 opacity-0 transition group-hover:opacity-100">
                              <Eye size={12} /> Open inspector
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </>
            ) : <p className="p-6 text-center text-sm text-slate-400">Select a case.</p>}
          </div>
        </div>
      )}

      {/* Create case modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} maxW="max-w-lg">
        <ModalHeader title="Create new case" subtitle="Register a case to scope its documents" onClose={() => setCreateOpen(false)} icon={<FolderPlus size={18} />} />
        <form onSubmit={submitCase} className="space-y-4 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Case ID" required id="caseId" error={caseErr.caseId}>
              <TextInput id="caseId" placeholder="C-102" invalid={!!caseErr.caseId} value={caseForm.caseId} onChange={setCase('caseId')} />
            </Field>
            <Field label="Classification" required id="cl" error={caseErr.classification}>
              <Select id="cl" value={caseForm.classification} onChange={setCase('classification')} invalid={!!caseErr.classification}>
                <option value="">Select…</option>
                {['UNCLASSIFIED', 'INTERNAL', 'RESTRICTED', 'CLASSIFIED'].map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </Field>
          </div>
          <Field label="Case title" required id="ct" error={caseErr.title}>
            <TextInput id="ct" placeholder="e.g. Financial fraud investigation" invalid={!!caseErr.title} value={caseForm.title} onChange={setCase('title')} />
          </Field>
          <Field label="Notes" error={caseErr.notes} hint="Optional context (max 600 chars)">
            <Textarea rows={3} id="cn" placeholder="Add operational context…" value={caseForm.notes} onChange={setCase('notes')} />
          </Field>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button type="submit">Create case</Button>
          </div>
        </form>
      </Modal>

      {/* Upload modal with dropzone */}
      <Modal open={uploadOpen} onClose={() => setUploadOpen(false)} maxW="max-w-lg">
        <ModalHeader title="Upload document" subtitle={selected ? `Scoped to case ${selected.caseId}` : 'No case selected'} onClose={() => setUploadOpen(false)} icon={<UploadCloud size={18} />} />
        <form onSubmit={submitUpload} className="space-y-4 p-6">
          <Field label="Document title" required id="dt" error={upErr.title}>
            <TextInput id="dt" placeholder="e.g. Forensic report · Exhibit A" invalid={!!upErr.title} value={upForm.title} onChange={setUp('title')} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Document type" required id="dty" error={upErr.docType}>
              <Select id="dty" value={upForm.docType} onChange={setUp('docType')} invalid={!!upErr.docType}>
                <option value="">Select…</option>
                {['Forensic Report', 'Statement', 'Evidence Photo', 'Court Filing', 'Legal Memo', 'Medical Record', 'Financial Record', 'Correspondence', 'Other'].map((t) => <option key={t} value={t}>{t}</option>)}
              </Select>
            </Field>
            <Field label="Category" id="dc">
              <Select id="dc" value={upForm.category} onChange={setUp('category')}>
                <option>Evidence</option><option>Correspondence</option><option>Report</option><option>Reference</option>
              </Select>
            </Field>
          </div>

          {/* Dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); onFileDrop(e.dataTransfer.files[0]) }}
            onClick={() => document.getElementById('file-input').click()}
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-all ${file ? 'border-emerald-500/60 bg-emerald-500/5' : fileErr ? 'border-crimson/60 bg-crimson/5 hover:border-crimson' : 'border-slate-300 bg-slate-50/60 hover:border-emerald-500/60 hover:bg-emerald-500/5'}`}
          >
            <input id="file-input" type="file" className="hidden"
              accept="application/pdf,image/png,image/jpeg,image/webp"
              onChange={(e) => onFileDrop(e.target.files[0])} />
            {file ? (
              <div className="flex items-center gap-3">
                <FileText size={24} className="text-emerald-500" />
                <div className="text-left">
                  <div className="text-sm font-bold text-ink">{file.name}</div>
                  <div className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB · {file.type}</div>
                </div>
              </div>
            ) : (
              <>
                <UploadCloud size={26} className={fileErr ? 'text-crimson' : 'text-slate-300'} />
                <p className="text-sm font-semibold text-slate-600">Drag & drop a document here</p>
                <p className="text-xs text-slate-400">or click to browse · PDF, PNG, JPEG, WEBP · max 25 MB</p>
              </>
            )}
          </div>
          {fileErr && <p className="text-xs font-medium text-crimson">{fileErr}</p>}

          <Field label="Description" error={upErr.description}>
            <Textarea rows={2} placeholder="Brief description of this evidence…" value={upForm.description} onChange={setUp('description')} />
          </Field>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={() => setUploadOpen(false)}>Cancel</Button>
            <Button type="submit" loading={processing}>
              {!processing && <UploadCloud size={16} />} Upload & fingerprint
            </Button>
          </div>
        </form>
      </Modal>

      <DocumentViewer doc={viewDoc} open={!!viewDoc} onClose={() => setViewDoc(null)} />
      <ToastHost toasts={toasts} dismiss={dismiss} />
    </div>
  )
}
