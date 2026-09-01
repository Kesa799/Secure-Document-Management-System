import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react'

/* ---------- Logo mark ---------- */
export function Logo({ size = 36, className = '' }) {
  return (
    <div className={`relative inline-flex items-center justify-center rounded-xl bg-ink ${className}`}
      style={{ width: size, height: size }}>
      <ShieldCheck size={size * 0.58} className="text-emerald-400" strokeWidth={2} />
      <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-white" />
    </div>
  )
}

export function BrandMark({ size = 40 }) {
  return (
    <div className="flex items-center gap-3">
      <Logo size={size} />
      <div className="leading-none">
        <div className="text-[17px] font-extrabold tracking-tight text-ink" style={{ letterSpacing: '-0.02em' }}>
          CADENCE<span className="text-emerald-500">DMS</span>
        </div>
        <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          Secure Document Vault
        </div>
      </div>
    </div>
  )
}

/* ---------- Buttons ---------- */
export function Button({ children, variant = 'primary', size = 'md', className = '', loading, ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50'
  const sizes = { sm: 'h-8 px-3 text-xs', md: 'h-10 px-4 text-sm', lg: 'h-12 px-6 text-sm' }
  const variants = {
    primary: 'bg-ink text-white hover:bg-ink-light shadow-sm hover:shadow-md',
    secondary: 'bg-white text-ink border border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm',
    emerald: 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm shadow-emerald-500/20',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-ink',
    danger: 'bg-crimson/10 text-crimson hover:bg-crimson/15',
  }
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {loading && <Spinner className="h-4 w-4" />}
      {children}
    </button>
  )
}

export function Spinner({ className = 'h-4 w-4' }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  )
}

/* ---------- Form field primitives ---------- */
export function Field({ label, required, error, hint, children, id }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-[13px] font-semibold text-slate-700">
        {label} {required && <span className="text-crimson">*</span>}
      </label>
      {children}
      {error ? (
        <p className="flex items-center gap-1.5 text-xs font-medium text-crimson">
          <AlertCircle size={13} /> {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-slate-400">{hint}</p>
      ) : null}
    </div>
  )
}

export function TextInput({ invalid, className = '', ...props }) {
  return (
    <input
      {...props}
      className={`w-full h-11 px-3.5 rounded-xl bg-slate-50 border text-sm text-ink placeholder:text-slate-400 transition-all focus:outline-none focus:ring-4 ${
        invalid
          ? 'border-crimson/50 focus:ring-crimson/10 focus:border-crimson'
          : 'border-slate-200 focus:border-emerald-500/60 focus:ring-emerald-500/10'
      } ${className}`}
    />
  )
}

export function Select({ invalid, className = '', children, ...props }) {
  return (
    <select
      {...props}
      className={`w-full h-11 px-3.5 rounded-xl bg-slate-50 border text-sm text-ink transition-all focus:outline-none focus:ring-4 ${
        invalid
          ? 'border-crimson/50 focus:ring-crimson/10 focus:border-crimson'
          : 'border-slate-200 focus:border-emerald-500/60 focus:ring-emerald-500/10'
      } ${className}`}
    >
      {children}
    </select>
  )
}

export function Textarea({ invalid, className = '', ...props }) {
  return (
    <textarea
      {...props}
      className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border text-sm text-ink placeholder:text-slate-400 transition-all focus:outline-none focus:ring-4 ${
        invalid
          ? 'border-crimson/50 focus:ring-crimson/10 focus:border-crimson'
          : 'border-slate-200 focus:border-emerald-500/60 focus:ring-emerald-500/10'
      } ${className}`}
    />
  )
}

/* ---------- Badges ---------- */
const badgeTones = {
  emerald: 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20',
  crimson: 'bg-crimson/10 text-crimson ring-crimson/25',
  slate: 'bg-slate-500/10 text-slate-600 ring-slate-500/20',
  amber: 'bg-amber-500/10 text-amber-600 ring-amber-500/25',
  blue: 'bg-blue-500/10 text-blue-600 ring-blue-500/25',
  violet: 'bg-violet-500/10 text-violet-600 ring-violet-500/25',
}
export function Badge({ tone = 'slate', children, dot, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${badgeTones[tone]} ${className}`}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  )
}

export function VerifiedBadge() {
  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-lg shadow-emerald-500/30 animate-glowPulse"
    >
      <CheckCircle2 size={15} /> VERIFIED · HASH MATCH
    </motion.span>
  )
}

export function MismatchBadge() {
  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="inline-flex items-center gap-2 rounded-full bg-crimson px-3.5 py-1.5 text-xs font-bold text-white shadow-lg shadow-crimson/30 animate-pulseRing"
    >
      <AlertCircle size={15} /> HASH MISMATCH · INTEGRITY ALERT
    </motion.span>
  )
}

/* ---------- Modal with glassmorphism ---------- */
export function Modal({ open, onClose, children, maxW = 'max-w-2xl' }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-8"
        >
          <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className={`relative z-10 w-full ${maxW} rounded-2xl bg-white/95 backdrop-blur-xl shadow-floatlg ring-1 ring-slate-200/60`}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function ModalHeader({ title, subtitle, onClose, icon }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
      <div className="flex items-center gap-3">
        {icon && <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink/5 text-ink">{icon}</div>}
        <div>
          <h2 className="text-base font-bold tracking-tight text-ink">{title}</h2>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-ink transition">
        <X size={18} />
      </button>
    </div>
  )
}

/* ---------- Toast ---------- */
let toastId = 0
export function ToastHost({ toasts, dismiss }) {
  return (
    <div className="fixed bottom-6 right-6 z-[70] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium shadow-floatlg ring-1 ring-slate-200/60 backdrop-blur-md ${
              t.kind === 'error' ? 'bg-crimson text-white' : t.kind === 'warn' ? 'bg-amber-500 text-white' : 'bg-ink text-white'
            }`}
          >
            {t.kind === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            {t.message}
            <button onClick={() => dismiss(t.id)} className="opacity-60 hover:opacity-100"><X size={14} /></button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export function useToasts() {
  const [toasts, setToasts] = useState([])
  const push = (message, kind = 'success') => {
    const id = ++toastId
    setToasts((t) => [...t, { id, message, kind }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200)
  }
  const dismiss = (id) => setToasts((t) => t.filter((x) => x.id !== id))
  return { toasts, push, dismiss }
}

/* ---------- Misc helpers ---------- */
export function Avatar({ name, color = '#0F172A', size = 34 }) {
  const initials = name
    ? name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?'
  return (
    <div className="flex items-center justify-center rounded-full font-bold text-white"
      style={{ width: size, height: size, background: color, fontSize: size * 0.36 }}>
      {initials}
    </div>
  )
}

export function useLockBody(lock) {
  useEffect(() => {
    if (!lock) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [lock])
}
