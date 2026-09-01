import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  ShieldCheck, FileSearch, Fingerprint, GitBranch, ScrollText, Lock, ArrowRight,
  Activity, FileText, UserCheck, Eye,
} from 'lucide-react'
import { BrandMark } from '../components/ui'

const capabilities = [
  { icon: FileSearch, title: 'Evidence Management', text: 'Organize case documents with strict case-scoped access.' },
  { icon: Fingerprint, title: 'Cryptographic Integrity', text: 'Real SHA-256 fingerprints computed from file bytes.' },
  { icon: GitBranch, title: 'Version Control', text: 'Chronological versioning with per-version fingerprints.' },
  { icon: ScrollText, title: 'Immutable Audit Trail', text: 'Every action recorded with precise timestamps.' },
  { icon: UserCheck, title: 'Role-Based Access', text: 'Six operational roles with scoped navigation & permissions.' },
  { icon: Lock, title: 'Secure Access', text: 'Validated authentication with hashed credentials.' },
]

const steps = [
  { n: '01', title: 'Create your account', text: 'Choose your role — Administrator, Investigator, Legal Officer, Forensic Officer, Auditor, or Viewer.' },
  { n: '02', title: 'Build your workspace', text: 'Create cases, upload documents, and manage version fingerprints.' },
  { n: '03', title: 'Verify & audit', text: 'Run integrity verification and review the audit ledger.' },
]

export default function Welcome() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-br from-white via-surface to-emerald-50/40" />

      {/* Nav */}
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <BrandMark />
        <div className="flex items-center gap-3">
          <Link to="/login">
            <button className="inline-flex h-10 items-center rounded-xl px-4 text-sm font-semibold text-ink transition hover:bg-slate-100">
              Sign in
            </button>
          </Link>
          <Link to="/signup">
            <button className="inline-flex h-10 items-center rounded-xl bg-ink px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-ink-light">
              Get started <ArrowRight size={15} className="ml-1.5" />
            </button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-16 pt-10 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3.5 py-1.5 text-xs font-bold text-emerald-600 ring-1 ring-inset ring-emerald-500/20">
              <Activity size={14} /> Federal-Grade Document Integrity
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-6xl" style={{ letterSpacing: '-0.03em' }}>
              Secure digital vault for
              <span className="block bg-gradient-to-r from-ink via-ink to-emerald-600 bg-clip-text text-transparent">
                law enforcement & courts
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-500 sm:text-lg">
              A role-based document management system purpose-built for investigative and judicial
              operations — with cryptographic integrity verification and a tamper-evident audit ledger.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link to="/signup">
                <button className="inline-flex h-12 items-center gap-2 rounded-xl bg-ink px-6 text-sm font-bold text-white shadow-lg shadow-ink/20 transition hover:bg-ink-light">
                  <ShieldCheck size={17} /> Create secure account
                </button>
              </Link>
              <Link to="/login">
                <button className="inline-flex h-12 items-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-6 text-sm font-bold text-ink shadow-sm backdrop-blur transition hover:border-slate-300">
                  Sign in to workspace
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="rounded-2xl bg-white/80 p-6 shadow-float ring-1 ring-slate-100 backdrop-blur"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink/5 text-ink">
                <c.icon size={21} />
              </div>
              <h3 className="mt-4 text-[15px] font-bold tracking-tight text-ink">{c.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{c.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 border-t border-slate-200/60 bg-white/60 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid items-start gap-10 lg:grid-cols-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">Workflow</span>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink" style={{ letterSpacing: '-0.02em' }}>
                From signup to verified evidence in three steps
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-500">
                Every piece of data in Cadence DMS is entered by you with full validation — no seeded
                or mock records. Cases, documents, versions and users are all created through validated forms.
              </p>
            </div>
            <div className="space-y-4">
              {steps.map((s) => (
                <div key={s.n} className="flex gap-4 rounded-2xl bg-white p-5 shadow-float ring-1 ring-slate-100">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ink text-sm font-extrabold text-white">
                    {s.n}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-ink">{s.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-500">{s.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-slate-200/60 py-8 text-center text-xs text-slate-400">
        <span className="inline-flex items-center gap-1.5"><Lock size={12} /> Cadence DMS · Restricted access · Authorized personnel only</span>
      </footer>
    </div>
  )
}
