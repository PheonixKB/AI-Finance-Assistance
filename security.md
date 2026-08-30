# Security Policy & Architecture

**Project:** AI Finance Assistance
**Owner:** Development Team
**Last Updated:** 2026-08-30
**Classification:** Internal — Sensitive (financial PII)

## 1. Overview

This document defines the security posture, threat model, controls, and operational policies for the AI Finance Assistance platform. It applies to both the FastAPI backend and the React/Vite frontend.

The platform handles financial account data, PII, sensitive financial metrics, AI-generated advice, and file uploads.

## 2. Threat Model

| Threat Actor | Capability | Target | Likelihood |
|---|---|---|---|
| External attacker | Steal tokens, brute-force login, upload malicious files, exfiltrate DB | Auth endpoints, upload endpoints, DB | High |
| Malicious insider | Access other users financial data via chat session enumeration | Chat routes | Medium |
| XSS attacker | Steal JWT from localStorage | Frontend auth storage | Medium |
| Compromised dependency | Code execution, data exfiltration | Node/npm, Python packages | Low-Medium |
| Accidental exposure | Committed secrets, misconfigured CORS, leaked logs | .env files, error messages, logs | Medium |

## 3. Authentication

### Current Implementation
- JWT-based auth using python-jose (HS256)
- Tokens stored in frontend localStorage
- Transmitted via Authorization: Bearer header

### Critical Gaps
- JWT tokens NEVER expire (no exp claim)
- No refresh token mechanism
- No server-side token revocation
- SECRET_KEY fallback generates transient key
- No password complexity enforcement
- No account lockout on failed login
- JWT in localStorage vulnerable to XSS

### Policy
- Production JWTs MUST include exp claim (max 15 min)
- Phase 2: Migrate to httpOnly Secure SameSite cookies with refresh tokens

## 4. Authorization

### Critical Gap — Chat Route Authorization Bypass
The following endpoints do NOT verify session ownership:
- GET /api/chat/sessions/{username} — enumerate any user sessions
- GET /api/chat/messages/{session_id} — read any session messages
- POST /api/chat/add_message — inject messages into any session
- PUT /api/chat/sessions/{session_id}/title — rename any session
- DELETE /api/chat/sessions/{session_id} — delete any session

Fix required: Add get_current_user dependency and verify session.user_id == current_user.id

## 5. Data Protection

### Encryption at Rest
- Passwords: encrypted (bcrypt) — COMPLIANT
- All other financial/PII data: PLAINTEXT in MySQL — MUST encrypt

### Encryption in Transit
- Frontend to Backend: HTTP locally — MUST use HTTPS in production
- Backend to MySQL: depends on deployment
- Backend to OpenAI/SendGrid: HTTPS — COMPLIANT

## 6. API Security

### Current Controls
- JWT Bearer auth — Implemented
- Pydantic input validation — Implemented
- Parameterized SQL queries — Implemented
- bleach sanitization on AI input — Implemented

### Gaps
- No rate limiting on login — HIGH
- No rate limiting on uploads — HIGH
- In-memory rate limiting (fragile) — MEDIUM
- No file size limits — MEDIUM
- No API versioning — MEDIUM

## 7. Frontend Security

### Current Controls
- No dangerouslySetInnerHTML — COMPLIANT
- React auto-escaping — COMPLIANT
- Account number masking (last 4) — COMPLIANT

### Gaps
- JWT in localStorage (XSS risk) — HIGH
- No Content-Security-Policy — MEDIUM
- No React error boundary — LOW
- Raw server errors shown to users — MEDIUM

## 8. Infrastructure Security

Required before production:
- Reverse proxy with TLS termination — CRITICAL
- MySQL binary logging + automated backups — HIGH
- Secrets manager (no .env on servers) — HIGH
- Structured logging — MEDIUM
- Security headers (HSTS, X-Content-Type-Options) — MEDIUM

## 9. Secrets Management

- default.env is tracked in Git — RISK
- .gitignore must include .env
- Production secrets via environment variables or secrets manager ONLY

## 10. Dependency Security

- Scan with pip audit and npm audit before each release
- Pin to specific versions in production
- Audit transitive dependencies

## 11. File Upload Security

- Auth required — Implemented
- MIME type whitelist — Implemented
- No file size limit — HIGH
- No malware scanning — MEDIUM
- No client-side validation — LOW

## 12. Logging & Monitoring

- Replace all print() with structured logging
- Never log passwords, tokens, API keys, full financial data
- Include correlation ID on all requests
- Log auth events with timestamp, user_id, IP, user-agent

## 13. Incident Response

| Severity | Response Time | Example |
|---|---|---|
| P0 Critical | < 1 hour | Active data breach |
| P1 High | < 4 hours | Auth bypass exploited |
| P2 Medium | < 24 hours | Single account compromise |
| P3 Low | < 1 week | Dependency vulnerability |

## 14. Compliance

- GDPR: No features implemented yet
- SOC 2: Planned for Phase 4
- India DPDP: Not assessed

## 15. Security Checklist

- [x] Centralized API client
- [x] Documented JWT non-expiry gap
- [x] Documented chat auth bypass gap
- [x] Fixed db.py env var mismatch
- [x] Fixed credit_score column name
- [x] 27 backend tests passing
- [x] 12 frontend tests passing
- [ ] Rate limiting on login
- [ ] File size limits on uploads
- [ ] Chat routes verify session ownership
- [ ] AuthGuard validates token expiry
- [ ] .env in .gitignore

## 16. Security Roadmap

| Phase | Item | Target |
|---|---|---|
| Phase 1 | Document security posture | Done |
| Phase 1 | Fix chat auth bypass | Immediate |
| Phase 2 | JWT expiration + refresh tokens | Phase 2 |
| Phase 2 | Migrate to httpOnly cookies | Phase 2 |
| Phase 2 | Add CSP headers, error boundaries | Phase 2 |
| Phase 3 | Password reset, account lockout | Phase 3 |
| Phase 4 | SOC 2, WAF, secrets manager | Phase 4 |
| Ongoing | Dependency scanning in CI | Every PR |
