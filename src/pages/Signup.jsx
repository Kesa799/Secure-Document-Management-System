import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserPlus, Check } from 'lucide-react'
import AuthLayout, { AuthFooterLink } from '../components/AuthLayout'
import { Button, Field, TextInput, Select, useToasts, ToastHost } from '../components/ui'
import { useApp } from '../context/AppContext'
import { ROLES, ROLE_LIST } from '../data/roles'
import { runValidation } from '../utils/validation'

export default function Signup() {
  const { register } = useApp()
  const navigate = useNavigate()
  const { toasts, push, dismiss } = useToasts()
  const [values, setValues] = useState({ name: '', username: '', email: '', password: '', confirm: '', role: '' })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)

  const set = (k) => (e) => {
    setValues((v) => ({ ...v, [k]: e.target.value }))
    setErrors((er) => ({ ...er, [k]: undefined }))
  }

  const submit = async (e) => {
    e.preventDefault()
    const errs = runValidation(values, {
      name: (v) => (!v ? 'Name is required.' : null),
      username: (v) => (!v ? 'Username is required.' : null),
      email: (v) => (!v ? 'Email is required.' : null),
      password: (v) => (!v ? 'Password is required.' : null),
      confirm: (v, all) => (v !== all.password ? 'Passwords do not match.' : null),
      role: (v) => (!v ? 'Select your role.' : null),
    })
    setErrors(errs)
    if (Object.keys(errs).length) return
    setBusy(true)
    try {
      const user = await register(values)
      push(`Account created. Welcome, ${user.name.split(' ')[0]}!`)
      navigate('/app')
    } catch (err) {
      setErrors({ form: err.message })
      push(err.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  const role = ROLES[values.role]

  return (
    <AuthLayout
      title="Create your secure account"
      subtitle="Register with your operational role — this determines your access across the system."
      footer={<AuthFooterLink to="/login" noun="Already have an account?" action="Sign in" />}
    >
      <form onSubmit={submit} className="space-y-5 rounded-2xl bg-white p-7 shadow-float ring-1 ring-slate-100">
        {errors.form && (
          <div className="rounded-xl bg-crimson/5 px-4 py-3 text-sm font-medium text-crimson ring-1 ring-inset ring-crimson/20">
            {errors.form}
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Full name" required id="name" error={errors.name}>
            <TextInput id="name" placeholder="Jordan Reyes" invalid={!!errors.name} value={values.name} onChange={set('name')} />
          </Field>
          <Field label="Username" required id="username" error={errors.username}>
            <TextInput id="username" placeholder="jreyes" invalid={!!errors.username} value={values.username} onChange={set('username')} />
          </Field>
        </div>

        <Field label="Work email" required id="email" error={errors.email}>
          <TextInput id="email" type="email" placeholder="you@agency.gov" invalid={!!errors.email} value={values.email} onChange={set('email')} />
        </Field>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Password" required id="password" error={errors.password}
            hint="8+ chars with a letter, number & symbol.">
            <TextInput id="password" type="password" placeholder="••••••••" invalid={!!errors.password} value={values.password} onChange={set('password')} />
          </Field>
          <Field label="Confirm password" required id="confirm" error={errors.confirm}>
            <TextInput id="confirm" type="password" placeholder="••••••••" invalid={!!errors.confirm} value={values.confirm} onChange={set('confirm')} />
          </Field>
        </div>

        <Field label="Operational role" required id="role" error={errors.role}>
          <Select id="role" value={values.role} onChange={set('role')} invalid={!!errors.role}>
            <option value="">Select a role…</option>
            {ROLE_LIST.map((r) => (
              <option key={r} value={r}>{ROLES[r].label} — {ROLES[r].description}</option>
            ))}
          </Select>
        </Field>

        {role && (
          <div className="flex items-start gap-2.5 rounded-xl bg-emerald-500/5 px-4 py-3 ring-1 ring-inset ring-emerald-500/15">
            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full" style={{ background: role.color }}>
              <Check size={12} className="text-white" />
            </div>
            <p className="text-xs leading-relaxed text-slate-600">
              <span className="font-bold" style={{ color: role.color }}>{role.label}</span> — {role.description}.
              Access to navigation and actions will be scoped accordingly.
            </p>
          </div>
        )}

        <Button type="submit" size="lg" className="w-full" loading={busy}>
          {!busy && <UserPlus size={17} />} Create account
        </Button>
      </form>
      <ToastHost toasts={toasts} dismiss={dismiss} />
    </AuthLayout>
  )
}
