import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useApp } from './context/AppContext'
import { ROLES } from './data/roles'
import AppShell from './components/AppShell'
import Welcome from './pages/Welcome'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Cases from './pages/Cases'
import Upload from './pages/Upload'
import Audit from './pages/Audit'
import Admin from './pages/Admin'

function Protected({ children }) {
  const { currentUser } = useApp()
  if (!currentUser) return <Navigate to="/login" replace />
  return <AppShell>{children}</AppShell>
}

function RoleGate({ permission, children, fallback }) {
  const { currentUser } = useApp()
  const role = ROLES[currentUser?.role]
  if (role && role.permissions[permission]) return children
  return fallback || <Navigate to="/app" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/app" element={<Protected><Dashboard /></Protected>} />
      <Route path="/app/cases" element={
        <Protected>
          <RoleGate permission="canViewCases"><Cases /></RoleGate>
        </Protected>
      } />
      <Route path="/app/upload" element={
        <Protected>
          <RoleGate permission="canUpload"><Upload /></RoleGate>
        </Protected>
      } />
      <Route path="/app/audit" element={
        <Protected>
          <RoleGate permission="canViewAudit"><Audit /></RoleGate>
        </Protected>
      } />
      <Route path="/app/settings" element={
        <Protected>
          <RoleGate permission="canAdminister"><Admin /></RoleGate>
        </Protected>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
