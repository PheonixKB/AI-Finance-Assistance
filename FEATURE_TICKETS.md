# FEATURE_TICKETS

**Project:** AI Finance Assistance
**Date:** 2026-08-30
**Status:** Phase 0 gaps identified; Phase 1 in progress

---

## How to Use This File

Each ticket is a discrete, actionable task. When picking up work:
1. Find the next uncompleted ticket in priority order
2. Create a branch: `feat/FEA-<id>-<short-title>`
3. Implement acceptance criteria
4. Run relevant tests
5. Mark `[x]` in Done column and update `Updated` date

---

## Phase 0: Foundation — MVP Release Blockers

> **Goal:** Close all gaps that block a stable MVP release to early adopters.

| Ticket ID | Title | Priority | Dependencies | Acceptance Criteria | Files to Modify | Done | Updated |
|-----------|-------|----------|--------------|---------------------|-----------------|------|---------|
| FEA-0.1 | Connect AI Chat to Backend | P0 | apiService.js | User sends message → real `/api/ask` response → message persists after refresh | `interface/src/pages/AIChat.jsx`, `interface/src/apiService.js` | [ ] | |
| FEA-0.2 | Wire Up Permission Toggle | P0 | FEA-0.1 (apiService) | Toggle permission → refresh → state persists | `interface/src/pages/Profile.jsx`, `backend/permissions.py` | [ ] | |
| FEA-0.3 | Fix Chat Route Authorization Bypass | P0 | FEA-0.1 | User A cannot read/write/delete User B's chat sessions | `backend/routes/chat_routes.py` | [x] | 2026-08-30 |
| FEA-0.4 | Add JWT Expiration | P0 | — | Token expires after 15 min; client redirects to login | `backend/users.py`, `interface/src/apiService.js`, `interface/src/components/AuthGuard.jsx` | [ ] | |
| FEA-0.5 | Replace Hardcoded API URLs | P1 | apiService.js | No `http://localhost:8000` strings remain in frontend code | All `interface/src/pages/*.jsx`, `interface/src/components/*.jsx` | [ ] | |
| FEA-0.6 | Fix Duplicate Routes in App.jsx | P1 | — | Each route defined exactly once | `interface/src/App.jsx` | [ ] | |
| FEA-0.7 | Create Missing Feature Pages | P0 | FEA-0.1 | All 5 routes resolve to pages with real data | `interface/src/App.jsx`, `InvestmentInsights.jsx`, `GoalTracking.jsx`, `ExpenseOptimization.jsx`, `BillManagement.jsx`, `WealthAnalytics.jsx` | [ ] | |
| FEA-0.8 | Fix deleteInvestment Reference Error | P0 | — | Delete button works without console error | `interface/src/pages/FinanceData.jsx` | [ ] | |
| FEA-0.9 | Add Login Rate Limiting | P0 | — | 5 failed attempts → 60s cooldown | `backend/users.py` | [ ] | |
| FEA-0.10 | Add File Size Limits on Uploads | P0 | — | Files > 10MB rejected with 413 | `backend/routes/upload_routes.py` | [ ] | |

### FEA-0.1 Sub-tasks

| ID | Task | Description | Done |
|----|------|-------------|------|
| FEA-0.1.1 | Remove setTimeout mock | Delete mock response logic in `handleSendMessage` | [ ] |
| FEA-0.1.2 | Call `/api/ask` | Replace mock with real POST to `/api/ask` via `ai.ask()` | [ ] |
| FEA-0.1.3 | Persist user messages | Call `chat.addMessage(sessionId, 'user', text)` after user sends | [ ] |
| FEA-0.1.4 | Persist AI responses | Call `chat.addMessage(sessionId, 'ai', responseText)` after AI replies | [ ] |
| FEA-0.1.5 | Load session messages | On session click, fetch messages via `chat.getMessages(sessionId)` | [ ] |
| FEA-0.1.6 | Show loading indicator | Display typing dots while awaiting AI response | [ ] |
| FEA-0.1.7 | Handle errors gracefully | Show error message in chat UI if `/api/ask` fails | [ ] |

### FEA-0.3 Sub-tasks

| ID | Task | Description | Done |
|----|------|-------------|------|
| FEA-0.3.1 | Add ownership check to `get_session_messages` | Verify `session.user_id == current_user.id` | [ ] |
| FEA-0.3.2 | Add ownership check to `add_message` | Verify session belongs to current user | [ ] |
| FEA-0.3.3 | Add ownership check to `update_title` | Verify session belongs to current user | [ ] |
| FEA-0.3.4 | Add ownership check to `delete_session` | Verify session belongs to current user | [ ] |
| FEA-0.3.5 | Fix `get_user_sessions_by_username` | Ensure requesting user can only list their own sessions | [ ] |

### FEA-0.4 Sub-tasks

| ID | Task | Description | Done |
|----|------|-------------|------|
| FEA-0.4.1 | Add `exp` claim to token encoding | Set `exp = datetime.now(timezone.utc) + timedelta(minutes=15)` in `create_access_token` | [ ] |
| FEA-0.4.2 | Verify `exp` in `get_current_user` | Raise 401 if token expired | [ ] |
| FEA-0.4.3 | Handle 401 in frontend | Catch 401 in `apiService.js` → clear token → redirect to `/signin` | [ ] |
| FEA-0.4.4 | Update AuthGuard | Check token expiry before allowing access | [ ] |

---

## Phase 1: Stabilization & Polish

> **Goal:** Ship a tested, polished MVP. 80%+ backend test coverage. 0 critical bugs in staging.

| Ticket ID | Title | Priority | Dependencies | Acceptance Criteria | Files to Modify | Done | Updated |
|-----------|-------|----------|--------------|---------------------|-----------------|------|---------|
| FEA-1.1 | Add Backend Smoke Tests | P1 | — | `pytest tests/` passes with 20+ tests | `backend/tests/` | [ ] | |
| FEA-1.2 | Add Frontend Smoke Tests | P1 | — | `vitest run` passes with 10+ tests | `interface/src/__tests__/` | [ ] | |
| FEA-1.3 | Add Error Boundaries | P2 | — | Unhandled render error shows fallback UI | `interface/src/components/ErrorBoundary.jsx`, `interface/src/main.jsx` | [ ] | |
| FEA-1.4 | Add Loading Skeletons | P2 | — | Every async op shows skeleton, not text | `interface/src/components/Skeleton.jsx`, all pages | [ ] | |
| FEA-1.5 | Map Server Errors to Generic Messages | P2 | — | No stack traces or internal strings visible to users | `interface/src/apiService.js` | [ ] | |
| FEA-1.6 | Add CSV Upload Support | P2 | — | CSV uploads parse correctly | `backend/routes/upload_routes.py` | [ ] | |
| FEA-1.7 | Add Account Number Field | P2 | — | Account number stored; UI shows masked (last 4) | `backend/data.sql`, `backend/routes/content_routes.py`, `interface/src/pages/FinanceData.jsx` | [ ] | |
| FEA-1.8 | Replace Debug print() with Logging | P2 | — | No `print()` calls in backend | `backend/users.py`, `backend/content_routes.py`, `backend/ai.py` | [ ] | |
| FEA-1.9 | Add API Versioning | P2 | FEA-0.5 | All routes under `/api/v1/*` | `backend/main.py`, `interface/src/apiService.js` | [ ] | |
| FEA-1.10 | Add Correlation IDs | P3 | FEA-1.1 | Every log entry has `correlation_id` | `backend/main.py`, `backend/routes/*.py` | [ ] | |

### FEA-1.1 Sub-tasks (Backend Tests)

| ID | Task | Description | Done |
|----|------|-------------|------|
| FEA-1.1.1 | Test app structure | Verify app import, title, router count | [x] | 27 tests passing |
| FEA-1.1.2 | Test route registration | Verify all expected routes exist in OpenAPI schema | [x] | |
| FEA-1.1.3 | Test Pydantic models | Verify all request/response models validate correctly | [x] | |
| FEA-1.1.4 | Test JWT encode/decode | Verify token creation and validation | [x] | |
| FEA-1.1.5 | Test auth guard | Verify `get_current_user` with valid/invalid tokens | [x] | |
| FEA-1.1.6 | Test AI mock fallback | Verify `/api/ask` returns mock when no API key | [x] | |
| FEA-1.1.7 | Test chat session CRUD | Verify create/get/update/delete chat sessions | [x] | |
| FEA-1.1.8 | Test permissions logic | Verify default permissions, DB return, model fields | [x] | |
| FEA-1.1.9 | Test rate limit values | Verify `FREE_AI_LIMIT` and `AUTHENTICATED_AI_LIMIT` | [x] | |
| FEA-1.1.10 | Add endpoint integration tests | Test each CRUD endpoint with mocked DB (future) | [ ] | |

### FEA-1.2 Sub-tasks (Frontend Tests)

| ID | Task | Description | Done |
|----|------|-------------|------|
| FEA-1.2.1 | Test apiService auth | Test `isAuthenticated`, `decodeToken`, `logout` | [x] | 12 tests passing |
| FEA-1.2.2 | Test apiService BASE_URL | Verify default and env-configured URL | [x] | |
| FEA-1.2.3 | Test permissions model | Verify `credit_score` key in permission responses | [x] | |
| FEA-1.2.4 | Test page rendering | Verify all 5 new pages render without crashing | [x] | |
| FEA-1.2.5 | Add component unit tests | Test Header, Hero, Footer components (future) | [ ] | |
| FEA-1.2.6 | Add E2E tests | Test full login → chat → upload flow (future) | [ ] | |

---

## Phase 2: AI Enhancement

> **Goal:** Deepen AI capabilities. JWT migration to httpOnly cookies. CSP headers.

| Ticket ID | Title | Priority | Dependencies | Acceptance Criteria | Files to Modify | Done | Updated |
|-----------|-------|----------|--------------|---------------------|-----------------|------|---------|
| FEA-2.1 | Batch Transaction Categorization | P1 | — | 1000-row upload categorizes in < 30s; rule-based fallback | `backend/routes/upload_routes.py`, `backend/ai.py` | [ ] | |
| FEA-2.2 | Add Refresh Token Mechanism | P0 | FEA-0.4 | Access token 15 min; refresh rotates; logout invalidates all | `backend/users.py`, `backend/main.py`, `interface/src/apiService.js` | [ ] | |
| FEA-2.3 | Add Content Security Policy | P1 | — | CSP headers on all responses; XSS payloads blocked | `backend/main.py`, `interface/vite.config.js` | [ ] | |
| FEA-2.4 | Add Password Reset Flow | P1 | — | User resets password via email link; old tokens invalidated | `backend/users.py`, `interface/src/pages/ForgotPassword.jsx`, `ResetPassword.jsx` | [ ] | |
| FEA-2.5 | Add Password Policy | P2 | — | Min 8 chars, 1 upper, 1 number, 1 special char enforced | `backend/users.py`, `interface/src/pages/SignUp.jsx` | [ ] | |
| FEA-2.6 | Add Account Lockout | P2 | — | 5 failed attempts → 15 min lockout | `backend/users.py`, `backend/data.sql` | [ ] | |
| FEA-2.7 | AI Portfolio Rebalancing | P1 | — | User sees rebalancing suggestions with % allocation changes | `backend/routes/content_routes.py`, `interface/src/pages/InvestmentInsights.jsx` | [ ] | |
| FEA-2.8 | Predictive Cash Flow Forecasting | P2 | — | 30/60/90-day projection on Dashboard | `backend/ai.py`, `interface/src/pages/Dashboard.jsx` | [ ] | |
| FEA-2.9 | Credit Score Simulator | P2 | — | User adjusts params → projected score updates | `backend/ai.py`, `interface/src/pages/Profile.jsx` | [ ] | |
| FEA-2.10 | Multi-LLM Support | P3 | — | User selects provider in Profile → AI uses selected model | `backend/ai.py`, `interface/src/pages/Profile.jsx` | [ ] | |

---

## Phase 3: Engagement & Growth

> **Goal:** Drive retention. Subscription model. Mobile-first.

| Ticket ID | Title | Priority | Dependencies | Acceptance Criteria | Files to Modify | Done | Updated |
|-----------|-------|----------|--------------|---------------------|-----------------|------|---------|
| FEA-3.1 | Subscription Tiers | P1 | — | Free/Pro/Premium gating; Stripe billing page | `backend/users.py`, `interface/src/pages/Billing.jsx` | [ ] | |
| FEA-3.2 | Email Reminders | P1 | — | Bill reminders 3 days before due; toggle in Profile | `backend/routes/notification_routes.py`, `backend/users.py` | [ ] | |
| FEA-3.3 | Mobile-First Redesign | P1 | — | Lighthouse mobile > 90; PWA installable | All `interface/src/**/*.jsx`, `interface/vite.config.js` | [ ] | |
| FEA-3.4 | Data Export | P2 | — | Export to CSV/PDF works for all user data | `backend/routes/content_routes.py`, `interface/src/pages/FinanceData.jsx` | [ ] | |
| FEA-3.5 | Multi-Currency Support | P2 | — | User selects currency → all amounts convert | `backend/data.sql`, `backend/routes/content_routes.py` | [ ] | |
| FEA-3.6 | Internationalization (i18n) | P3 | — | 5 languages; user switches in Profile | `interface/src/i18n/`, all pages | [ ] | |
| FEA-3.7 | Achievements & Gamification | P3 | — | Badges for milestones; displayed in Profile | `backend/data.sql`, `backend/routes/content_routes.py` | [ ] | |

---

## Phase 4: Production & Scale

> **Goal:** Enterprise reliability. Compliance. Global scale.

| Ticket ID | Title | Priority | Dependencies | Acceptance Criteria | Files to Modify | Done | Updated |
|-----------|-------|----------|--------------|---------------------|-----------------|------|---------|
| FEA-4.1 | Dockerize Application | P0 | — | `docker-compose up` starts full stack | `backend/Dockerfile`, `docker-compose.yml`, `interface/Dockerfile` | [ ] | |
| FEA-4.2 | SOC 2 Type II Compliance | P1 | — | SOC 2 report generated; controls documented | `security.md`, `backend/audit_log.py` | [ ] | |
| FEA-4.3 | GDPR/CCPA Compliance | P1 | — | Data export + deletion APIs; cookie consent | `backend/routes/compliance_routes.py`, `interface/src/pages/PrivacySettings.jsx` | [ ] | |
| FEA-4.4 | Add Health Check Endpoints | P1 | — | `/health` returns 200; `/health/ready` checks DB | `backend/main.py` | [ ] | |
| FEA-4.5 | Add Security Headers | P1 | — | SecurityHeaders.com gives A+ | `backend/main.py` | [ ] | |
| FEA-4.6 | Migrate to Secrets Manager | P2 | — | No secrets in env vars; fetched from manager | `backend/db.py`, `backend/users.py`, `backend/ai.py` | [ ] | |
| FEA-4.7 | Add Structured Logging | P2 | — | All logs JSON with timestamp, level, correlation_id | `backend/utils/logger.py`, all `backend/*.py` | [ ] | |
| FEA-4.8 | Add WAF Integration | P3 | — | WAF blocks common attacks; legitimate traffic OK | `infrastructure/terraform/`, `docs/deployment.md` | [ ] | |
| FEA-4.9 | Microservices Split | P3 | — | Each service independently deployable | `infrastructure/k8s/`, `backend/microservices/` | [ ] | |
| FEA-4.10 | Native Mobile Apps | P3 | — | iOS + Android on stores; feature parity with web | `mobile/` | [ ] | |

---

## Cross-Cutting Concerns

These tickets span multiple phases and should be addressed as they intersect with other work:

| Ticket ID | Title | Priority | Phase(s) | Description | Done |
|-----------|-------|----------|----------|-------------|------|
| FEA-X.1 | Add `.env` to `.gitignore` | P0 | 0 | Prevent accidental secret commits | [ ] |
| FEA-X.2 | Audit Git History for Secrets | P0 | 0 | `git log --diff-filter=D` + `git secrets` scan | [ ] |
| FEA-X.3 | Set Up CI/CD Pipeline | P1 | 1 | GitHub Actions: backend tests, frontend lint/build, Docker | [ ] |
| FEA-X.4 | Add ESLint + Prettier | P1 | 1 | Frontend linting in CI; fix all existing violations | [ ] |
| FEA-X.5 | Add TypeScript Migration | P2 | 1-2 | Migrate critical components from JSX to TSX | [ ] |
| FEA-X.6 | Add Dependency Scanning | P1 | Ongoing | `pip audit` + `npm audit` in every PR | [ ] |
| FEA-X.7 | Add Dark Mode Toggle | P2 | 1 | Persistent theme toggle with localStorage | [ ] |
| FEA-X.8 | Add React Error Boundary | P2 | 1 | Generic fallback UI for unhandled render errors | [ ] |

---

## Priority Legend

| Priority | Meaning | Example |
|----------|---------|---------|
| **P0** | Critical — blocks release or causes data loss | Auth bypass, JWT expiry, file DoS |
| **P1** | High — major feature or security gap | Tests, CSP, password reset |
| **P2** | Medium — polish or nice-to-have | Skeletons, CSV support, password policy |
| **P3** | Low — future enhancement | Gamification, microservices, WAF |

---

## Phase Completion Criteria

| Phase | Criteria |
|-------|----------|
| **Phase 0** | All P0 tickets (FEA-0.1 through FEA-0.10) completed. 27 backend + 12 frontend tests passing. |
| **Phase 1** | All P0/P1 tickets done. 80%+ backend coverage. 0 critical bugs in staging. |
| **Phase 2** | JWT migrated to httpOnly cookies. CSP active. Password reset live. AI features adopted > 50%. |
| **Phase 3** | 500 active subscribers. Churn < 5%. NPS > 50. |
| **Phase 4** | 99.9% uptime. SOC 2 certified. 50K+ active users. |
