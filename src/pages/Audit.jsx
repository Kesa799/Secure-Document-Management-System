import React, { useMemo, useState } from 'react'
import { ScrollText, Filter, Download, Search, Lock } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Badge, Select } from '../components/ui'
import { useToasts, ToastHost } from '../components/ui'

const actionTone = {
  'Case Created': 'emerald', 'Case Closed': 'amber', 'Case Reopened': 'amber', 'Case Deleted': 'crimson',
  'Document Upload': 'blue', 'Document Viewed': 'slate', 'Document Shared': 'violet', 'Document Signed': 'emerald',
  'Version Created': 'blue', 'Verification': 'emerald', 'File Replaced': 'crimson', 'User Created': 'slate',
}

function fmtFull(iso) {
  return new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

const ACTION_TYPES = [
  'Document Upload', 'Document Viewed', 'Document Shared', 'Document Signed', 'Version Created', 'Verification',
  'File Replaced', 'Case Created', 'Case Closed', 'Case Reopened', 'Case Deleted', 'User Created',
]

export default function Audit() {
  const { currentUser, audit } = useApp()
  const { toasts, push, dismiss } = useToasts()
  const [action, setAction] = useState('')
  const [outcome, setOutcome] = useState('')
  const [q, setQ] = useState('')

  const rows = useMemo(() => {
    let list = audit.slice()
    if (action) list = list.filter((a) => a.action === action)
    if (outcome) list = list.filter((a) => a.outcome === outcome)
    if (q.trim()) {
      const needle = q.trim().toLowerCase()
      list = list.filter((a) =>
        (a.actorName || '').toLowerCase().includes(needle) ||
        (a.target || '').toLowerCase().includes(needle) ||
        (a.actorId || '').toLowerCase().includes(needle) ||
        (a.id || '').toLowerCase().includes(needle) ||
        (a.detail || '').toLowerCase().includes(needle)
      )
    }
    return list
  }, [audit, action, outcome, q])

  const exportCsv = () => {
    if (rows.length === 0) { push('Nothing to export yet.', 'warn'); return }
    const head = ['Entry ID', 'Timestamp', 'Actor ID', 'Actor', 'Role', 'Action', 'Target', 'Outcome', 'Detail']
    const lines = rows.map((r) => [r.id, r.ts, r.actorId, r.actorName, r.role, r.action, r.target, r.outcome, (r.detail || '').replace(/"/g, '""')])
    const csv = '\uFEFF' + [head, ...lines].map((row) => row.map((c) => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'audit-trail.csv'; a.click()
    URL.revokeObjectURL(url)
    push(`Exported ${rows.length} audit entries.`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">Oversight</p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-ink" style={{ letterSpacing: '-0.02em' }}>Audit trail ledger</h1>
          <p className="mt-1 text-sm text-slate-500">Read-only record of every action across the system.</p>
        </div>
        <Button variant="secondary" onClick={exportCsv}><Download size={16} /> Export CSV</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4 shadow-float ring-1 ring-slate-100">
        <Filter size={16} className="text-slate-400" />
        <div className="relative min-w-[200px] flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by actor, target, hash, entry ID…"
            className="h-9 w-full rounded-lg bg-slate-50 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
        </div>
        <Select value={action} onChange={(e) => setAction(e.target.value)} className="w-44">
          <option value="">All actions</option>
          {ACTION_TYPES.map((a) => <option key={a} value={a}>{a}</option>)}
        </Select>
        <Select value={outcome} onChange={(e) => setOutcome(e.target.value)} className="w-40">
          <option value="">All outcomes</option>
          <option>Success</option><option>Verified</option><option>Hash Mismatch</option><option>Integrity Alert</option>
        </Select>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-float ring-1 ring-slate-100">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
            <Lock size={12} /> Read-only ledger
          </span>
          <span className="text-xs text-slate-400">{rows.length} entries</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-5 py-3">Entry</th>
                <th className="px-5 py-3">Timestamp</th>
                <th className="px-5 py-3">Actor</th>
                <th className="px-5 py-3">Action</th>
                <th className="px-5 py-3">Target</th>
                <th className="px-5 py-3">Outcome</th>
                <th className="px-5 py-3">Detail</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-slate-400">
                  {audit.length === 0 ? 'No audit entries yet — perform actions to populate the ledger.' : 'No entries match the current filters.'}
                </td></tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="border-b border-slate-50 transition hover:bg-slate-50/70">
                    <td className="px-5 py-3 font-mono text-[11px] text-slate-500">{r.id}</td>
                    <td className="px-5 py-3 font-mono text-[11px] text-slate-500">{fmtFull(r.ts)}</td>
                    <td className="px-5 py-3">
                      <div className="text-[13px] font-semibold text-ink">{r.actorName}</div>
                      <div className="font-mono text-[10px] text-slate-400">{r.actorId} · {r.role}</div>
                    </td>
                    <td className="px-5 py-3"><Badge tone={actionTone[r.action] || 'slate'}>{r.action}</Badge></td>
                    <td className="max-w-[180px] truncate px-5 py-3 text-[13px] text-slate-600">{r.target}</td>
                    <td className="px-5 py-3">
                      <span className={`font-mono text-[11px] font-bold ${r.outcome === 'Hash Mismatch' || r.outcome === 'Integrity Alert' ? 'text-crimson' : r.outcome === 'Verified' ? 'text-emerald-600' : 'text-slate-500'}`}>
                        {r.outcome}
                      </span>
                    </td>
                    <td className="max-w-[220px] truncate px-5 py-3 font-mono text-[11px] text-slate-400">{r.detail || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <ToastHost toasts={toasts} dismiss={dismiss} />
    </div>
  )
}
