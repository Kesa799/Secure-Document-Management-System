# Cadence DMS · Secure Document Management System

A premium frontend for a Secure Digital Document Management System (DMS) built for
law enforcement, courts, and investigative organizations. React + Vite + Tailwind CSS.

## Run it

```bash
npm install
npm run dev      # dev server on http://localhost:5173
npm run build    # production build
```

## Design system

- **Typography** — Inter (geometric sans) for UI, JetBrains Mono for hashes/IDs.
  Tight tracking on headings, generous line-height on metadata.
- **Palette** — off-white `#F8FAFC` → white surfaces; deep slate/navy `#0F172A`
  primary; Emerald `#10B981` for verified; Crimson `#EF4444` for tamper alerts.
- **Elevation** — floating cards (`shadow-[0_8px_30px_rgb(0,0,0,0.04)]`), hairline
  `border-slate-100`, glassmorphism modals with backdrop blur.
- **Layout** — minimal left-rail sidebar + spacious content constrained to 1200px.


- **Users & sessions** — signed up or provisioned by an administrator; credentials are
  stored as real SHA-256 hashes (Web Crypto), passwords never stored in plaintext.
- **Cases** — created via a validated form (ID, title, classification, notes).
- **Documents** — uploaded via drag-and-drop; a **real SHA-256 fingerprint** is computed
  from the actual file bytes and stored as the version's registered hash.
- **Versions** — each upload becomes v1; subsequent uploads create v2, v3…
- **Verification** — re-computes the live hash from current bytes and compares it to the
  registered fingerprint → glowing green **Verified** or pulsing red **Hash Mismatch**.
- **Audit trail** — every real action (Upload, View, Share, Version, Verification, Sign,
  Case ops, User ops) is recorded with precise timestamps, actor IDs, and outcomes.

## RBAC

Role selected at signup (or by admin) drives the navigation items and permissions:
Administrator, Investigator, Legal Officer, Forensic Officer, Auditor, Viewer.

| Nav item        | Routes                        |
|-----------------|-------------------------------|
| Welcome         | `/`                           |
| Sign in / up    | `/login`, `/signup`           |
| Overview        | `/app`                        |
| Cases & docs    | `/app/cases`                  |
| Upload          | `/app/upload`                 |
| Audit trail     | `/app/audit`                  |
| Administration  | `/app/settings`               |

## Architecture

```
src/
  components/   AppShell, AuthLayout, DocumentViewer, ui (primitives)
  context/      AppContext (global state, persistence to localStorage)
  data/         roles.js (RBAC config)
  pages/        Welcome, Login, Signup, Dashboard, Cases, Upload, Audit, Admin
  utils/        hash.js (Web Crypto SHA-256), validation.js
```

State persists to `localStorage` (metadata). File bytes live in memory (object URLs) so
large blobs aren't serialized; fingerprints are recomputed from bytes on each verification.
