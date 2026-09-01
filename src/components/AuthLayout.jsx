import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldCheck, Fingerprint, GitBranch, ScrollText } from 'lucide-react'
import { Logo } from './ui'

const highlights = [
  { icon: Fingerprint, text: 'Cryptographic SHA-256 integrity checks' },
  { icon: GitBranch, text: 'Versioned documents with per-version fingerprints' },
  { icon: ScrollText, text: 'Tamper-evident, read-only audit ledger' },
  { icon: ShieldCheck, text: 'Role-based access across six operational roles' },
]

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen bg-surface">
      {/* Left brand panel */}
      <div className="relative hidden w-[46%] overflow-hidden bg-ink lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-ink via-ink to-[#0b1220]" />
        <div className="pointer-events-none absolute -left-24 top-1/3 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          <div className="flex items-center gap-3">
            <Logo size={38} />
            <span className="text-lg font-extrabold tracking-tight text-white">
              CADENCE<span className="text-emerald-400">DMS</span>
            </span>
          </div>
          <div>
            <h2 className="text-4xl font-extrabold leading-tight tracking-tight text-white" style={{ letterSpacing: '-0.02em' }}>
              Evidence integrity,
              <br /> cryptographically guaranteed.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400">
              A secure document management platform for law enforcement, courts and investigative
              organizations — where every fingerprint is verifiable and every action is recorded.
            </p>
            <div className="mt-8 space-y-3">
              {highlights.map((h) => (
                <div key={h.text} className="flex items-center gap-3 text-sm text-slate-300">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-emerald-400 ring-1 ring-white/10">
                    <h.icon size={16} />
                  </div>
                  {h.text}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            System operational · Restricted access
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 lg:hidden">
            <Logo size={40} />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink" style={{ letterSpacing: '-0.02em' }}>{title}</h1>
          <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <div className="mt-8 text-center text-sm text-slate-500">{footer}</div>
        </motion.div>
      </div>
    </div>
  )
}

export function AuthFooterLink({ to, action, noun }) {
  return (
    <span>
      {noun}{' '}
      <Link to={to} className="font-semibold text-ink underline decoration-emerald-500/50 underline-offset-4 hover:text-emerald-600">
        {action}
      </Link>
    </span>
  )
}
