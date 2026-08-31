# Project Context & Running Tasks

**Project:** AI Finance Assistance  
**Last Updated:** 2026-08-31  
**Current Phase:** Phase 0 (MVP Release Blockers) + Phase 1 (Stabilization & Polish)

---

## Completed Tasks

### Phase 0
| Ticket | Task | Status |
|--------|------|--------|
| FEA-0.1 | Connect AI Chat to Backend | Done |
| FEA-0.2 | Wire Up Permission Toggle | Done |
| FEA-0.3 | Fix Chat Route Authorization Bypass | Done |
| FEA-0.4 | Add JWT Expiration | Done |
| FEA-0.5 | Replace Hardcoded API URLs | Done |
| FEA-0.6 | Fix Duplicate Routes in App.jsx | Done |
| FEA-0.7 | Create Missing Feature Pages | Done |
| FEA-0.8 | Fix deleteInvestment Reference Error | Done |
| FEA-0.9 | Add Login Rate Limiting | Done |
| FEA-0.10 | Add File Size Limits on Uploads | Done |

### Phase 1
| Ticket | Task | Status |
|--------|------|--------|
| FEA-1.1 | Add Backend Smoke Tests | Done (38 passing) |
| FEA-1.2 | Add Frontend Smoke Tests | Done (14 passing) |
| FEA-1.3 | Add Error Boundaries | Done |
| FEA-1.4 | Add Loading Skeletons | Done |
| FEA-1.5 | Map Server Errors to Generic Messages | Done |
| FEA-1.6 | Add CSV Upload Support | Done |
| FEA-1.7 | Add Account Number Field | Done |
| FEA-1.8 | Replace Debug print() with Logging | Done |
| FEA-1.9 | Add API Versioning | Done (`/api/v1/*`) |
| FEA-1.10 | Add Correlation IDs | Done |

---

## In Progress / Next Tasks

### Security Hardening (Recent Commits)
| Ticket | Task | Commit |
|--------|------|--------|
| SEC-1 | Fix JWT SECRET_KEY transient generation | `f31c7bd` |
| SEC-2 | Add refresh token mechanism with HttpOnly cookies | `f31c7bd` |
| SEC-3 | Add password complexity enforcement | `f31c7bd` |
| SEC-4 | Fix chat route authorization bypass (username enum) | `e2aa857` |
| SEC-5 | Add upload rate limiting per IP | `f31c7bd` |
| SEC-6 | Add CSP and security headers | `f31c7bd` |
| SEC-7 | Migrate frontend from localStorage JWT to cookies | `c4004ab` |
| SEC-8 | Update all pages to use cookie-based auth | `4b8bcd8` |

### Remaining Issues from Audit
| # | Issue | Priority | Status |
|---|-------|----------|--------|
| 1 | Migrate to Redis for persistent rate limiting | Medium | Done |
| 2 | Add file malware scanning for uploads | Medium | Pending |
| 3 | Add finance profile required field validation | Medium | Done |
| 4 | Fix transaction amount normalization edge cases | Medium | Done |
| 5 | Add password reset flow | P1 | Pending |
| 6 | Add account lockout after failed login attempts | P2 | Pending |
| 7 | Dockerize application | P0 | Pending |
| 8 | SOC 2 / GDPR compliance | P1 | Pending |

---

## Current Branch Status

**Branch:** `main`  
**Ahead of origin:** 19 commits  
**Last commit:** `70b12c6` - feat: migrate rate limiting to Redis with in-memory fallback

### Recent Commits
```
70b12c6 feat: migrate rate limiting to Redis with in-memory fallback
5c5d185 refactor: update Header/Hero auth checks and fix frontend tests
4b8bcd8 refactor: replace localStorage token checks with auth.isAuthenticated() in all pages
c4004ab feat: migrate frontend auth from localStorage JWT to HttpOnly cookies
e2aa857 fix: chat auth bypass, content route errors, upload request param, tests
f31c7bd security: harden JWT, add refresh tokens, password complexity, CSP, upload rate limit
...
```

---

## Test Status

| Suite | Result |
|-------|--------|
| Backend (pytest) | 46 passed ✅ |
| Frontend (vitest) | 14 passed ✅ |
| Frontend build | Succeeds ✅ |

---

## Environment

- **Python:** 3.14.4
- **Node.js:** v22.20.0
- **Backend deps:** fastapi, uvicorn, python-jose, openai, pandas, mysql-connector-python
- **Frontend deps:** react, react-router-dom, vite, vitest, @testing-library/react, chart.js, react-chartjs-2
- **Database:** MySQL (finance_assistant)
- **AI:** OpenAI GPT-3.5-turbo (with mock fallback)

---

## Quick Start

```bash
# Backend
cd backend
pip install -r requirements.txt
python -m pytest tests/ -v

# Frontend
cd interface
npm install
npm test -- --run
npm run build
```
