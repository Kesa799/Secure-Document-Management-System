import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FolderOpen, FileText, ScrollText, ShieldCheck, ChevronRight, Activity, Eye, Fingerprint } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { ROLES } from '../data/roles'
import { Badge } from '../components/ui'
import DocumentViewer from '../components/DocumentViewer'

const classificationTone = { CLASSIFIED: 'crimson', 'RESTRICTED': 'amber', 'INTERNAL': 'blue', 'UNCLASSIFIED': 'slate' }

function fmt(iso) {
  return new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

const actionTone = {
  'Case Created': 'emerald', 'Document Upload': 'blue', 'Document Viewed': 'slate',
  'Document Shared': 'violet', 'Version Created': 'blue', 'Verification': 'emerald',
  'Document Signed': 'emerald', 'File Replaced': 'crimson', 'Case Deleted': 'crimson', 'Case Closed': 'amber',
}

export default function Dashboard() {
  const { currentUser, cases, documents, audit } = useApp()
  const [viewDoc, setViewDoc] = useState(null)
  const role = ROLES[currentUser.role]

  const stats = [
    { label: 'Active cases', value: cases.filter((c) => c.status === 'Active').length, icon: FolderOpen, color: 'text-ink', bg: 'bg-ink/5' },
    { label: 'Documents', value: documents.length, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-500/5' },
    { label: 'Versions', value: documents.reduce((s, d) => s + d.versions.length, 0), icon: Eye, color: 'text-violet-600', bg: 'bg-violet-500/5' },
    { label: 'Audit entries', value: audit.length, icon: ScrollText, color: 'text-emerald-600', bg: 'bg-emerald-500/5' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">Overview</p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-ink" style={{ letterSpacing: '-0.02em' }}>
          Welcome back, {currentUser.name.split(' ')[0]}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Operating as <span className="font-semibold" style={{ color: role.color }}>{role.label}</span>. Here is your workspace status.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-2xl bg-white p-5 shadow-float ring-1 ring-slate-100">
            <div className="flex items-center justify-between">
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.bg} ${s.color}`}><s.icon size={19} /></span>
              <span className="text-xs font-semibold text-slate-400">{s.label}</span>
            </div>
            <div className="mt-4 text-3xl font-extrabold tracking-tight text-ink">{s.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent cases */}
        <div className="lg:col-span-2 rounded-2xl bg-white p-6 shadow-float ring-1 ring-slate-100">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold tracking-tight text-ink">Recent cases</h2>
            {role.permissions.canViewCases && (
              <Link to="/app/cases" className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700">
                View all <ChevronRight size={13} />
              </Link>
            )}
          </div>
          {cases.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-8 text-center">
              <p className="text-sm font-semibold text-slate-500">No cases yet</p>
              <p className="mt-1 text-xs text-slate-400">Create your first case from the Cases workspace to begin.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cases.slice(0, 5).map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-xl px-3 py-2.5 transition hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink/5 font-mono text-[11px] font-bold text-ink">
                      {c.caseId.slice(0, 3)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-ink">{c.caseId}</div>
                      <div className="text-xs text-slate-400">{c.title}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={c.status === 'Active' ? 'emerald' : 'slate'} dot>{c.status}</Badge>
                    <Badge tone={classificationTone[c.classification] || 'slate'}>{c.classification}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent activity */}
        <div className="rounded-2xl bg-white p-6 shadow-float ring-1 ring-slate-100">
          <div className="mb-4 flex items-center gap-2">
            <Activity size={16} className="text-emerald-600" />
            <h2 className="text-sm font-bold tracking-tight text-ink">Recent activity</h2>
          </div>
          {audit.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-8 text-center">
              <p className="text-sm font-semibold text-slate-500">No activity logged</p>
              <p className="mt-1 text-xs text-slate-400">Actions you perform will be recorded here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {audit.slice(0, 6).map((a) => (
                <div key={a.id} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100">
                    <Fingerprint size={13} className="text-slate-400" />
                  </span>
                  <div className="min-w-0">
                    <Badge tone={actionTone[a.action] || 'slate'}>{a.action}</Badge>
                    <div className="mt-1 truncate text-xs text-slate-500">{a.target}</div>
                    <div className="text-[10px] text-slate-400">{a.actorName} · {fmt(a.ts)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent documents */}
      <div className="rounded-2xl bg-white p-6 shadow-float ring-1 ring-slate-100">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-tight text-ink">Documents across your cases</h2>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600"><ShieldCheck size={13} /> Fingerprinted</span>
        </div>
        {documents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-8 text-center">
            <p className="text-sm font-semibold text-slate-500">No documents uploaded</p>
            <p className="mt-1 text-xs text-slate-400">Upload documents within a case to begin fingerprinting.</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {documents.slice(0, 6).map((d) => (
              <button key={d.id} onClick={() => setViewDoc(d)}
                className="group rounded-xl border border-slate-100 p-4 text-left shadow-sm transition hover:border-emerald-500/40 hover:shadow-md">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-slate-400 group-hover:text-emerald-500" />
                  <span className="truncate text-sm font-bold text-ink">{d.title}</span>
                </div>
                <p className="mt-1.5 font-mono text-[11px] text-slate-400">{d.caseId}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-slate-400">v{d.versions.length} · {d.docType}</span>
                  <Eye size={14} className="text-slate-300 group-hover:text-emerald-500" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <DocumentViewer doc={viewDoc} open={!!viewDoc} onClose={() => setViewDoc(null)} />
    </div>
  )
}
