import React, { useState } from 'react'
import { UserPlus, Users, ShieldCheck } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { ROLES, ROLE_LIST } from '../data/roles'
import { Button, Field, TextInput, Select, Badge, Modal, ModalHeader, Avatar, useToasts, ToastHost } from '../components/ui'

const empty = { name: '', username: '', email: '', password: '', role: '' }

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function Admin() {
  const { currentUser, users, addUserByAdmin, cases } = useApp()
  const { toasts, push, dismiss } = useToasts()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)

  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setErrors((er) => ({ ...er, [k]: undefined })) }

  const openModal = () => { setForm(empty); setErrors({}); setOpen(true) }

  const submit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (form.name.trim().length < 3) errs.name = 'Enter a full name (min 3 chars).'
    if (form.username.trim().length < 3) errs.username = 'Username must be at least 3 characters.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) errs.email = 'Enter a valid email.'
    if (form.password.length < 8) errs.password = 'Password must be at least 8 characters.'
    if (!form.role) errs.role = 'Select a role.'
    setErrors(errs)
    if (Object.keys(errs).length) return
    setBusy(true)
    try {
      await addUserByAdmin(currentUser, form)
      setOpen(false)
      push(`User ${form.name} created.`)
    } catch (err) {
      push(err.message, 'error')
    } finally { setBusy(false) }
  }

  const perCase = new Map()
  cases.forEach((c) => perCase.set(c.id, c))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">Administration</p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-ink" style={{ letterSpacing: '-0.02em' }}>User administration</h1>
          <p className="mt-1 text-sm text-slate-500">Provision operational accounts and manage roles.</p>
        </div>
        <Button onClick={openModal}><UserPlus size={16} /> Add user</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={<Users size={18} />} label="Total users" value={users.length} />
        <StatCard icon={<ShieldCheck size={18} />} label="Roles" value={ROLE_LIST.length} />
        <StatCard icon={<Users size={18} />} label="Active cases" value={cases.filter((c) => c.status === 'Active').length} />
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-float ring-1 ring-slate-100">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-bold tracking-tight text-ink">Registered accounts</h2>
        </div>
        <div className="divide-y divide-slate-50">
          {users.length === 0 && (
            <div className="px-5 py-10 text-center text-sm text-slate-400">No users registered yet.</div>
          )}
          {users.map((u) => {
            const role = ROLES[u.role]
            const isMe = u.id === currentUser?.id
            return (
              <div key={u.id} className="flex items-center gap-4 px-5 py-4">
                <Avatar name={u.name} color={role.color} size={40} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-ink">{u.name}</span>
                    {isMe && <Badge tone="emerald">You</Badge>}
                  </div>
                  <div className="text-xs text-slate-400">{u.email} · @{u.username}</div>
                </div>
                <div className="hidden sm:block"><Badge tone="slate" className="font-mono">{u.id}</Badge></div>
                <Badge style={{ color: role.color }} className="!bg-transparent ring-0">{role.label}</Badge>
              </div>
            )
          })}
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} maxW="max-w-lg">
        <ModalHeader title="Add user" subtitle="Create an operational account" onClose={() => setOpen(false)} icon={<UserPlus size={18} />} />
        <form onSubmit={submit} className="space-y-4 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" required error={errors.name}>
              <TextInput placeholder="Full name" invalid={!!errors.name} value={form.name} onChange={set('name')} />
            </Field>
            <Field label="Username" required error={errors.username}>
              <TextInput placeholder="username" invalid={!!errors.username} value={form.username} onChange={set('username')} />
            </Field>
          </div>
          <Field label="Work email" required error={errors.email}>
            <TextInput type="email" placeholder="user@agency.gov" invalid={!!errors.email} value={form.email} onChange={set('email')} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Temporary password" required error={errors.password} hint="Min 8 chars.">
              <TextInput type="password" placeholder="••••••••" invalid={!!errors.password} value={form.password} onChange={set('password')} />
            </Field>
            <Field label="Role" required error={errors.role}>
              <Select value={form.role} onChange={set('role')} invalid={!!errors.role}>
                <option value="">Select…</option>
                {ROLE_LIST.map((r) => <option key={r} value={r}>{ROLES[r].label}</option>)}
              </Select>
            </Field>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" loading={busy}><UserPlus size={16} /> Create user</Button>
          </div>
        </form>
      </Modal>
      <ToastHost toasts={toasts} dismiss={dismiss} />
    </div>
  )
}

function StatCard({ icon, label, value }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-float ring-1 ring-slate-100">
      <div className="flex items-center justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink/5 text-ink">{icon}</span>
        <span className="text-xs font-semibold text-slate-400">{label}</span>
      </div>
      <div className="mt-3 text-2xl font-extrabold text-ink">{value}</div>
    </div>
  )
}
