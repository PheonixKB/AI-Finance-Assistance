# Development Phases & Roadmap

**Project:** FinanceAI — AI-Powered Personal Finance Assistant
**Date:** 2026-08-19
**Status:** MVP in development

---

## Roadmap Overview

```
Phase 0: Foundation (MVP)        ████████████ 100% complete  [current]
Phase 1: Stabilization & Polish   ░░░░░░░░░░░░  0% planned
Phase 2: AI Enhancement           ░░░░░░░░░░░░  0% planned  (future)
Phase 3: Engagement & Growth      ░░░░░░░░░░░░  0% planned  (future)
Phase 4: Production & Scale       ░░░░░░░░░░░░  0% planned  (future)
```

---

## Phase 0: Foundation (MVP)

**Status:** Mostly complete. Codebase has all core features implemented but contains gaps and code quality issues that need addressing before a stable release.

### 0.1 Completed Features
| Feature | Component(s) | Endpoint(s) | Status |
|---------|-------------|-------------|--------|
| User authentication (register/login) | `SignIn.jsx`, `SignUp.jsx`, `users.py` | `/api/register`, `/api/login` | Done |
| JWT token management | `AuthGuard.jsx`, all pages | — | Done |
| Finance questionnaire (onboarding) | `FinanceQuestionnaire.jsx` | POST `/api/finance_profile` | Done |
| Finance profile CRUD | `Profile.jsx`, `finance_questionnaire` | GET/PUT `/api/finance_profile` | Done |
| Bank accounts CRUD | `FinanceData.jsx` | CRUD `/api/accounts` | Done |
| Transactions CRUD + Excel upload | `FinanceData.jsx`, `AllTransactions.jsx` | CRUD `/api/transactions`, POST `/api/upload/transactions` | Done |
| Investments CRUD + Excel upload | `FinanceData.jsx`, `AllInvestments.jsx` | CRUD `/api/investments`, POST `/api/upload/investments` | Done |
| Financial goals CRUD + progress | `FinanceData.jsx` | CRUD `/api/goals`, GET `/api/goal-progress/{id}` | Done |
| Summary finance (credit score, EPF) | `FinanceData.jsx` | GET/PUT `/api/summary_finance` | Done |
| AI chat assistant + session management | `AIChat.jsx` | POST `/api/ask`, CRUD `/api/chat/*` | Done |
| Permission system | `permissions.py` | GET/POST `/api/permissions/` | Done |
| Smart budgeting (AI suggestions + chart) | `SmartBudgeting.jsx` | GET `/api/budget-summary` | Done |
| Investment insights (AI) | `FinanceData.jsx` | GET `/api/investment-insights` | Done |
| Landing page (home, features, stats) | `Home.jsx` + components | GET `/api/stats`, `/api/testimonials` | Done |
| Rate limiting (free & authenticated) | `ai.py` | — | Done |

### 0.2 Gaps & Issues (to close before MVP release)
| # | Issue | Impact | Priority |
|---|-------|--------|----------|
| 0-I1 | **AI chat not connected to backend** | `AIChat.jsx` `handleSendMessage` uses a `setTimeout` mock instead of calling `/api/ask`. Chat history is not persisted via `/api/chat/add_message`. | High |
| 0-I2 | **Permissions not saved from frontend** | `Profile.jsx` toggles permissions but has a `TODO: Send update to backend`. Changes are lost on refresh. | High |
| 0-I3 | **Hardcoded API URLs** | All frontend pages hardcode `http://localhost:8000/api/...`. Should use a configurable base URL (`REACT_APP_BASE_URL`). | Medium |
| 0-I4 | **Duplicate route definitions** | `App.jsx` defines `/all-investments` and `/all-transactions` routes twice (duplicates). | Low |
| 0-I5 | **Missing pages referenced in Features** | `Features.jsx` links to `/investment-insights`, `/goal-tracking`, `/expense-optimization`, `/bill-management`, `/wealth-analytics` — none exist as routes in `App.jsx`. | High |
| 0-I6 | **No tests** | No unit/integration tests exist for backend or frontend. | Medium |
| 0-I7 | **No lint/typecheck** | Frontend lacks ESLint/TypeScript; backend has no type checking. | Medium |
| 0-I8 | **`user_finance_summary` table used in `finance_data.py` but columns don't match** | The schema has `monthly_spending, savings_current, savings_goal, ai_optimization` but the endpoint returns raw rows; `spending_chart` is hardcoded dummy data. | Low |
| 0-I9 | **`deleteInvestment` function referenced but not defined** in `FinanceData.jsx` (line 463). | Crash risk if user tries to delete an investment. | Medium |
| 0-I10 | **Inconsistent user identification** | Chat sessions are fetched by `username` (path param), while everything else uses `user_id` (from JWT). Username changes break session lookup. | Medium |

### 0.3 Release Criteria (MVP "v1.0")
- [ ] Connect AI chat to `/api/ask` and persist messages via `/api/chat/add_message`
- [ ] Wire up permission toggle to POST `/api/permissions/`
- [ ] Replace hardcoded API URLs with environment-configured `BASE_URL`
- [ ] Fix duplicate routes in `App.jsx`
- [ ] Create stub pages for all 6 features referenced in `Features.jsx` (investment insights, goal tracking, expense optimization, bill management, wealth analytics) — at minimum, redirect or show a "coming soon" placeholder
- [ ] Fix the `deleteInvestment` reference error in `FinanceData.jsx`
- [ ] Add basic smoke tests (backend API test + frontend build verification)

---

## Phase 1: Stabilization & Polish

**Target Duration:** 4–6 weeks
**Goal:** Ship a polished, tested, and reliable MVP to early adopters.

### Features
| Feature | Description |
|---------|-------------|
| **P1-01** | **Test Coverage** — Add pytest unit tests for all backend endpoints; add Playwright or Jest tests for critical frontend flows (login → chat → upload). |
| **P1-02** | **Type Safety (Frontend)** — Migrate critical frontend components from JSX to TSX; add ESLint + Prettier. |
| **P1-03** | **Error Boundaries** — Add React error boundaries and consistent backend error responses. |
| **P1-04** | **Loading States** — Add skeleton loaders and progress indicators for all async operations. |
| **P1-05** | **CSV Import Support** — Extend upload routes to accept CSV in addition to Excel. |
| **P1-06** | **Improved AI Chat UI** — Markdown rendering for AI responses, insights display, copy-to-clipboard per message, suggested quick prompts. |
| **P1-07** | **Permission Persistence** — Connect Profile permission toggles to backend; fetch current permissions on load. |
| **P1-08** | **Account Number Field** — Add `account_number` to the account model (upload routes reference it but it's not in schema). |
| **P1-09** | **Dark Mode Toggle** — Implement a persistent dark/light theme toggle with `localStorage`. |
| **P1-10** | **Deployment Pipeline** — Add CI/CD (GitHub Actions) for backend tests, frontend lint/build, and Docker image builds. |

### Success Criteria
- 80%+ backend test coverage
- 0 critical bugs in staging
- First 50 early-access users onboarded
- Frontend builds with zero lint errors

---

## Phase 2: AI Enhancement

**Target Duration:** 6–8 weeks
**Goal:** Deepen AI capabilities and provide richer, more personalized financial insights.

### Features
| Feature | Description |
|---------|-------------|
| **P2-01** | **AI-Powered Transaction Categorization Engine** — Replace per-row OpenAI categorization in upload with batch processing; add rule-based fallback and custom category management. |
| **P2-02** | **AI Portfolio Rebalancing Suggestions** — Analyze current investments vs. target allocation; recommend rebalancing trades. |
| **P2-03** | **Predictive Cash Flow Forecasting** — Use historical transactions to forecast future cash flows and alert users about potential shortfalls. |
| **P2-04** | **Credit Score Simulator** — Show how changes (e.g., paying down debt) would impact credit score. |
| **P2-05** | **AI Debt Repayment Planner** — Snowball/avalanche recommendation with payoff timeline. |
| **P2-06** | **Multi-LLM Support** — Allow users to choose between OpenAI, Anthropic Claude, or open-source models. |
| **P2-07** | **AI-Generated Monthly Reports** — Auto-generated PDF/email reports summarizing spending, savings progress, and recommendations. |
| **P2-08** | **Voice Input for Chat** — Speech-to-text for asking finance questions. |

### Success Criteria
- AI recommendation satisfaction > 4.2/5
- Average session length in chat increases by 50%
- 70%+ of users use at least one AI-powered insight feature

---

## Phase 3: Engagement & Growth

**Target Duration:** 4–6 weeks
**Goal:** Drive user retention, expand to new markets, and add subscription model.

### Features
| Feature | Description |
|---------|-------------|
| **P3-01** | **Subscription Tiers** — Free (5 AI queries/day, 1 upload), Pro ($9.99/month: 50 AI queries/day, unlimited uploads, priority AI), Premium ($19.99/month: all Pro + dedicated insights). |
| **P3-02** | **Email Reminders** — Bill due date reminders, budget threshold alerts, goal milestone notifications. |
| **P3-03** | **Referral Program** — Users earn Pro credits for referring friends. |
| **P3-04** | **Mobile-First Redesign** — Responsive redesign optimized for mobile; Progressive Web App (PWA) support. |
| **P3-05** | **Data Export** — Export transactions, investments, and reports to CSV/PDF. |
| **P3-06** | **Multi-Currency Support** — Support for USD, EUR, INR, GBP, etc. with real-time FX rates. |
| **P3-07** | **Internationalization (i18n)** — Localize UI to 5 major languages. |
| **P3-08** | **Achievements & Gamification** — Milestone badges, savings streaks, goal completion rewards. |
| **P3-09** | **Community Features** — Public leaderboard (anonymized), community Q&A. |
| **P3-10** | **API for Developers** — Public REST API for third-party integrations. |

### Success Criteria
- 500 active subscribers
- Monthly churn < 5%
- Net Promoter Score (NPS) > 50

---

## Phase 4: Production & Scale

**Target Duration:** Ongoing
**Goal:** Enterprise-grade reliability, compliance, and global scale.

### Features
| Feature | Description |
|---------|-------------|
| **P4-01** | **SOC 2 Type II Compliance** — Security audit and compliance certification. |
| **P4-02** | **GDPR / CCPA Compliance** — Data export and deletion APIs; cookie consent management. |
| **P4-03** | **Microservices Architecture** — Split backend into auth, AI, data, and billing microservices. |
| **P4-04** | **Message Queue** — Offload AI processing and email sending to background workers (Celery + Redis/RabbitMQ). |
| **P4-05** | **CDN & Edge Caching** — Serve static assets via CDN; cache AI responses for common queries. |
| **P4-06** | **Advanced Analytics Dashboard** — Admin dashboard for monitoring user engagement, AI usage, and revenue. |
| **P4-07** | **Multi-Region Deployment** — Deploy backend in multiple AWS/GCP regions for latency optimization. |
| **P4-08** | **A/B Testing Framework** — Experimentation platform for UI and AI prompt variations. |
| **P4-09** | **Native Mobile Apps** — iOS and Android apps built with React Native. |
| **P4-10** | **Partnership Integrations** — Integrate with major banks and investment platforms (Plaid, TrueLayer, etc.). |

### Success Criteria
- 99.9% uptime
- < 100ms p99 latency for API requests
- 50K+ active users
- 3+ financial institution partnerships live

---

## Phase Transition Criteria

| From → To | Criteria |
|-----------|----------|
| Phase 0 → 1 | MVP released to early adopters; all 0.3 release criteria met; baseline test coverage established. |
| Phase 1 → 2 | 80%+ test coverage; < 1% crash rate in production; early user feedback collected. |
| Phase 2 → 3 | AI insights feature adoption > 50%; NPS > 40; subscription model ready. |
| Phase 3 → 4 | 1K+ paying subscribers; revenue positive; compliance framework started. |

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| OpenAI rate limits / cost overruns | Medium | High | Implement caching; set per-user rate limits; fallback to cheaper models. |
| User data privacy breach | Low | Critical | Encrypt sensitive fields; implement RBAC; conduct security audits. |
| Excel parsing failures (varied bank formats) | High | Medium | Maintain a library of known bank format templates; provide upload feedback. |
| AI providing incorrect financial advice | Medium | High | Include disclaimers; never position AI as a licensed advisor; add human review option. |
| Churn from free-tier limitations | Medium | Medium | A/B test conversion; optimize upgrade UX; add value in free tier. |

---

## Resource Allocation (Estimated)

| Phase | Engineers | Designer | Product | QA | DevOps |
|-------|-----------|----------|---------|-----|-------|
| 0 | 2 | 0.5 | 0.5 | 0.5 | 0.25 |
| 1 | 3 | 1 | 1 | 1 | 0.5 |
| 2 | 4 | 1 | 1 | 1 | 0.5 |
| 3 | 4 | 1.5 | 1 | 1 | 1 |
| 4 | 6 | 2 | 2 | 2 | 3 |
