import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import AuthLayout, { AuthFooterLink } from '../components/AuthLayout'
import { Button, Field, TextInput, useToasts, ToastHost } from '../components/ui'
import { useApp } from '../context/AppContext'
import { runValidation } from '../utils/validation'

export default function Login() {
  const { login } = useApp()
  const navigate = useNavigate()
  const { toasts, push, dismiss } = useToasts()
  const [values, setValues] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)

  const set = (k) => (e) => {
    setValues((v) => ({ ...v, [k]: e.target.value }))
    setErrors((er) => ({ ...er, [k]: undefined }))
  }

  const submit = async (e) => {
    e.preventDefault()
    const errs = runValidation(values, { email: (v) => (!v ? 'Email is required.' : null), password: (v) => (!v ? 'Password is required.' : null) })
    setErrors(errs)
    if (Object.keys(errs).length) return
    setBusy(true)
    try {
      const user = await login(values)
      push(`Welcome back, ${user.name.split(' ')[0]}.`)
      navigate('/app')
    } catch (err) {
      setErrors({ form: err.message })
      push(err.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthLayout
      title="Sign in to your workspace"
      subtitle="Authenticate to access case documents, verification tools and the audit ledger."
      footer={<AuthFooterLink to="/signup" noun="New to Cadence DMS?" action="Create an account" />}
    >
      <form onSubmit={submit} className="space-y-5 rounded-2xl bg-white p-7 shadow-float ring-1 ring-slate-100">
        {errors.form && (
          <div className="rounded-xl bg-crimson/5 px-4 py-3 text-sm font-medium text-crimson ring-1 ring-inset ring-crimson/20">
            {errors.form}
          </div>
        )}
        <Field label="Email address" required id="email" error={errors.email}>
          <TextInput
            id="email" type="email" autoComplete="email" placeholder="you@agency.gov" invalid={!!errors.email}
            value={values.email} onChange={set('email')}
          />
        </Field>
        <Field label="Password" required id="password" error={errors.password}>
          <TextInput
            id="password" type="password" autoComplete="current-password" placeholder="••••••••" invalid={!!errors.password}
            value={values.password} onChange={set('password')}
          />
        </Field>
        <Button type="submit" size="lg" className="w-full" loading={busy}>
          {!busy && <LogIn size={17} />} Sign in
        </Button>
      </form>
      <ToastHost toasts={toasts} dismiss={dismiss} />
    </AuthLayout>
  )
}
