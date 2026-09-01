import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, FolderOpen, UploadCloud, ScrollText, Settings, LogOut, ShieldCheck,
  ChevronsLeft, ChevronsRight, Search, Menu, X,
} from 'lucide-react'
import { ROLES } from '../data/roles'
import { useApp } from '../context/AppContext'
import { Avatar } from './ui'
import { ROLE_LABEL } from '../context/AppContext'

const NAV = [
  { key: 'dashboard', label: 'Overview', path: '/app', icon: LayoutDashboard },
  { key: 'cases', label: 'Cases', path: '/app/cases', icon: FolderOpen },
  { key: 'upload', label: 'Upload', path: '/app/upload', icon: UploadCloud },
  { key: 'audit', label: 'Audit Trail', path: '/app/audit', icon: ScrollText },
  { key: 'settings', label: 'Administration', path: '/app/settings', icon: Settings },
]

export default function AppShell({ children }) {
  const { currentUser, logout } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  if (!currentUser) return null
  const role = ROLES[currentUser.role]
  const allowed = new Set(role.nav)
  const navItems = NAV.filter((n) => allowed.has(n.key))

  const NavList = (
    <nav className="space-y-1 px-3">
      {navItems.map((n) => {
        const active = n.key === 'cases' ? location.pathname.startsWith('/app/cases') : location.pathname === n.path
        return (
          <button
            key={n.key}
            onClick={() => { navigate(n.path); setMobileOpen(false) }}
            className={`group flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
              active ? 'bg-ink text-white shadow-md' : 'text-slate-500 hover:bg-slate-100 hover:text-ink'
            }`}
            title={collapsed ? n.label : undefined}
          >
            <n.icon size={19} className={active ? 'text-emerald-400' : 'text-slate-400 group-hover:text-ink'} />
            {!collapsed && <span>{n.label}</span>}
            {active && !collapsed && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400" />}
          </button>
        )
      })}
    </nav>
  )

  const SidebarInner = (
    <div className="flex h-full flex-col">
      <div className={`flex items-center gap-3 px-5 py-6 ${collapsed ? 'justify-center' : ''}`}>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink">
          <ShieldCheck size={20} className="text-emerald-400" />
        </div>
        {!collapsed && (
          <div className="leading-none">
            <div className="text-sm font-extrabold tracking-tight text-ink">CADENCE<span className="text-emerald-500">DMS</span></div>
            <div className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-slate-400">Secure Vault</div>
          </div>
        )}
      </div>
      <div className="flex-1">{NavList}</div>
      <div className="border-t border-slate-100 p-3">
        {!collapsed && (
          <div className="mb-3 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
            <div className="flex items-center gap-3">
              <Avatar name={currentUser.name} color={role.color} size={36} />
              <div className="min-w-0">
                <div className="truncate text-[13px] font-bold text-ink">{currentUser.name}</div>
                <div className="truncate text-[11px] font-semibold" style={{ color: role.color }}>{role.label}</div>
              </div>
            </div>
          </div>
        )}
        <button
          onClick={() => { logout(); navigate('/login') }}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-crimson/5 hover:text-crimson"
        >
          <LogOut size={18} /> {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-surface text-ink">
      {/* Desktop sidebar */}
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 flex-col bg-white/80 ring-1 ring-slate-100 backdrop-blur transition-all duration-300 md:flex ${collapsed ? 'w-[76px]' : 'w-[248px]'}`}
      >
        {SidebarInner}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm hover:text-ink"
        >
          {collapsed ? <ChevronsRight size={13} /> : <ChevronsLeft size={13} />}
        </button>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <motion.div
            initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
            className="absolute left-0 top-0 h-full w-[248px] bg-white shadow-floatlg"
          >
            <button onClick={() => setMobileOpen(false)} className="absolute right-3 top-4 text-slate-400 hover:text-ink"><X size={18} /></button>
            {SidebarInner}
          </motion.div>
        </div>
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-slate-100 bg-white/70 px-6 py-3.5 backdrop-blur-lg">
          <button onClick={() => setMobileOpen(true)} className="text-slate-500 md:hidden"><Menu size={20} /></button>
          <div className="relative hidden max-w-sm flex-1 sm:block">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Search cases, documents, hash…"
              className="h-9 w-full rounded-lg bg-slate-50 pl-9 pr-3 text-sm text-ink ring-1 ring-transparent placeholder:text-slate-400 focus:outline-none focus:ring-emerald-500/30"
            />
          </div>
          <div className="ml-auto flex items-center gap-2 text-xs font-semibold text-slate-400">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-emerald-600 ring-1 ring-inset ring-emerald-500/20">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> Secure
            </span>
            <span className="hidden sm:inline">Session · {ROLE_LABEL(currentUser.role)}</span>
          </div>
        </header>
        <main className="flex-1 px-6 py-8">
          <div className="mx-auto w-full max-w-[1200px]">{children}</div>
        </main>
      </div>
    </div>
  )
}
