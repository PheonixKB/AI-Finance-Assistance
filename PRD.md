# Product Requirements Document (PRD)

**Product:** FinanceAI — AI-Powered Personal Finance Assistant
**Date:** 2026-08-19
**Author:** Engineering Team
**Status:** Draft / In Development (MVP)

---

## 1. Overview

### 1.1 Problem Statement
Individuals struggle to make informed financial decisions because personal finance data is scattered across banks, investment platforms, and spreadsheets. Existing tools are either manual spreadsheets or generic budgeting apps that require significant user effort to categorize and analyze spending. There is a need for an AI-powered assistant that can automatically ingest financial data, categorize it, provide actionable insights, and engage users in a conversational interface.

### 1.2 Solution Summary
FinanceAI is a full-stack web application that provides users with an AI-powered personal finance assistant. Users can:
- Register and authenticate securely (JWT + bcrypt).
- Set up a financial profile (salary, expenses, risk tolerance, savings goals).
- Upload bank statements / investment portfolios via Excel files for automatic data ingestion and AI-driven categorization.
- Manage financial data: bank accounts, transactions, investments, goals, credit score, and EPF (Employees' Provident Fund) balance.
- Interact with an AI chat assistant that draws on their real financial data (subject to granular permissions) to answer questions and deliver personalized insights.
- Receive AI-generated recommendations for budgeting, investment planning, and goal tracking.

**Optional AI Integration:** If an OpenAI API key is configured, the assistant calls `gpt-4o-mini` / `gpt-3.5-turbo` for responses and insights; otherwise, it falls back to a safe mock response so the application remains fully functional.

---

## 2. Goals & Objectives

| # | Goal | Metric | Target |
|---|------|--------|--------|
| G1 | Enable secure, friction-free user onboarding | Registration completion rate | > 70% |
| G2 | Reduce time-to-insight for financial data | Time from upload to categorized view | < 5 seconds |
| G3 | Deliver personalized AI recommendations | AI recommendation satisfaction (survey) | 4.0 / 5.0 |
| G4 | Improve user retention | 7-day active user rate | > 30% |
| G5 | Safely handle sensitive financial data | No data leakage incidents | 0 |

---

## 3. User Personas

### Persona 1: The Young Professional
- **Name:** Alex, 28
- **Role:** Software Engineer
- **Income:** $95,000 / year
- **Goals:** Pay off student loans, build an emergency fund, start investing.
- **Pain Points:** Tracks expenses manually in a spreadsheet; wants automated categorization and investment recommendations.
- **Tech Comfort:** High.

### Persona 2: The Small Business Owner
- **Name:** Priya, 42
- **Role:** Boutique owner
- **Income:** Variable ($60k–$120k / year)
- **Goals:** Separate personal and business finances, set aside tax savings, plan for retirement.
- **Pain Points:** Juggling multiple bank accounts; lacks a unified view.
- **Tech Comfort:** Medium.

### Persona 3: The First-Time Investor
- **Name:** Jamie, 24
- **Role:** Recent graduate
- **Income:** $55,000 / year
- **Goals:** Start investing, set up a retirement fund, understand risk tolerance.
- **Pain Points:** Overwhelmed by investment jargon; wants beginner-friendly recommendations.
- **Tech Comfort:** High.

---

## 4. User Journeys / Use Cases

### UC-01: Register & Onboarding
1. User visits the landing page (`/` home).
2. Clicks "Get Started" → navigates to `/signup`.
3. Fills in name, email, password → backend creates account, returns JWT.
4. Token stored in `localStorage`; user redirected to `/finance-questionnaire`.
5. Completes financial profile (salary, risk tolerance, etc.) → POST `/api/finance_profile`.
6. Redirects to `/`.

### UC-02: Ask the AI Assistant
1. Authenticated user navigates to `/chat`.
2. System loads existing chat sessions or creates a "New Chat."
3. User types a finance question → message stored via `/api/chat/add_message`.
4. Backend calls `/api/ask` with user permissions + finance data.
5. If OpenAI is configured → real AI response; else → mock response.
6. AI answer + insights rendered in the chat UI.

### UC-03: Upload & Manage Financial Data
1. Authenticated user navigates to `/finance-data`.
2. Creates a bank account (POST `/api/accounts`).
3. Uploads an Excel bank statement (POST `/api/upload/transactions`) — file is parsed with pandas, columns auto-detected, transactions categorized via AI, and inserted.
4. Uploads investment portfolio (POST `/api/upload/investments`) — similar parsing.
5. Views categorized transactions, investments, budget summary (with pie chart), and AI budget suggestions.
6. Edits/deletes accounts, investments, and transactions inline.

### UC-04: Smart Budgeting
1. Authenticated user navigates to `/smart-budgeting`.
2. Backend calls `GET /api/budget-summary` → aggregates expenses by category, fetches salary from profile, calls OpenAI for budget suggestions.
3. UI renders a pie chart of spending and AI-generated budget advice.

### UC-05: Investment Insights
1. Authenticated user views `/finance-data` (investment insights section) or navigates via the Features page.
2. Backend calls `GET /api/investment-insights` → pulls profile + investments, sends to OpenAI for a 12-month plan.
3. Recommendations displayed in a card.

### UC-06: Goal Tracking
1. Authenticated user creates a goal (POST `/api/goals`) via the Finance Data page or a dedicated goal-tracking page.
2. User views goal progress including `months_needed` estimate and AI suggestions (GET `/api/goal-progress/{goal_id}`).
3. User can edit or delete goals.

### UC-07: Profile & Permissions
1. Authenticated user navigates to `/profile`.
2. Edits username (PUT `/api/me`) — JWT refreshed.
3. Views/edits financial profile (PUT `/api/finance_profile`).
4. Toggles data permissions (assets, liabilities, transactions, investments, EPF, credit score) — currently toggled locally; backend supports GET/POST `/api/permissions/`.

---

## 5. Features

### 5.1 In-Scope (MVP — Delivered)

| ID | Feature | Component / Endpoint | Notes |
|----|---------|----------------------|-------|
| F-01 | User Registration & Login | `/api/register`, `/api/login` | JWT + bcrypt; SendGrid welcome email (optional) |
| F-02 | JWT Authentication & AuthGuard | `AuthGuard.jsx`, `jwt-decode` | Token in `localStorage` |
| F-03 | Onboarding Questionnaire | `FinanceQuestionnaire.jsx` → POST `/api/finance_profile` | Salary, expenses, risk, experience, savings goal |
| F-04 | Finance Profile Management | `Profile.jsx` → GET/PUT `/api/finance_profile` | Edit profile from profile page |
| F-05 | Bank Accounts CRUD | `FinanceData.jsx` → CRUD `/api/accounts` | Account name, bank, type, balance |
| F-06 | Transactions Management | `FinanceData.jsx`, `AllTransactions.jsx` → CRUD `/api/transactions` | Upload via Excel or manage manually |
| F-07 | Excel Upload (Transactions) | `upload_routes.py` → POST `/api/upload/transactions` | Auto-detect columns; AI categorization |
| F-08 | Investments Management | `FinanceData.jsx`, `AllInvestments.jsx` → CRUD `/api/investments` | Type, name, quantity, purchase/current price |
| F-09 | Excel Upload (Investments) | `upload_routes.py` → POST `/api/upload/investments` | Column header auto-mapping (₹/$ supported) |
| F-10 | Financial Goals | `content_routes.py` → CRUD `/api/goals` + GET `/api/goal-progress/{id}` | Target amount, progress, deadline, AI suggestions |
| F-11 | Summary Finance | `FinanceData.jsx` → GET/PUT `/api/summary_finance` | Credit score, EPF balance |
| F-12 | AI Chat Assistant | `AIChat.jsx` → POST `/api/ask` | Permissions-gated data; OpenAI or mock fallback |
| F-13 | Chat Session Management | `chat_routes.py` → CRUD `/api/chat/*` | New chat, rename, delete, load session history |
| F-14 | Permission System | `permissions.py` → GET/POST `/api/permissions/` | Controls which finance data is shared with AI |
| F-15 | Smart Budgeting | `SmartBudgeting.jsx` → GET `/api/budget-summary` | Expense categorization + AI budget suggestions |
| F-16 | Investment Insights | `FinanceData.jsx` → GET `/api/investment-insights` | AI 12-month investment plan |
| F-17 | Budget Summary Analytics | `FinanceData.jsx` → GET `/api/budget-summary` | Pie chart via Chart.js |
| F-18 | Landing Page & Marketing | `Home.jsx` + components | Hero, Features, Stats, Testimonials, Footer |
| F-19 | Dark/Light Theme Ready | Tailwind + custom CSS | Gradient backgrounds, glassmorphism |
| F-20 | Free-Tier Rate Limiting | `ai.py` | 5 AI queries/day (anon), 50/day (auth) |
| F-21 | Static Content API | `content_routes.py` → GET `/api/stats`, `/api/testimonials` | Landing page stats & testimonials |

### 5.2 Out of Scope (Future Phases)
| ID | Feature | Rationale |
|----|---------|-----------|
| F-90 | Direct Bank API Integration (Plaid/TrueLayer) | Requires financial institution partnerships; current flow is file-based |
| F-91 | Automated Bill Payment Scheduling | High-risk feature needing PCI compliance |
| F-92 | Multi-Currency & International Banking | Currently assumes single domestic currency |
| F-93 | Portfolio Performance Benchmarking | Advanced analytics beyond MVP scope |
| F-94 | Tax Calculation / Filing Integration | Regulatory complexity; separate product |
| F-95 | Mobile App (React Native) | MVP is web-only; mobile is a future platform expansion |
| F-96 | Collaborative / Family Finance | Multi-user data sharing not in MVP |
| F-97 | Export to PDF/CSV | Nice-to-have reporting feature |
| F-98 | Real-time Net Worth Dashboard | Requires real-time data feeds |

---

## 6. Functional Requirements

### 6.1 Authentication & User Management
| FR-ID | Requirement |
|-------|-------------|
| FR-01 | User can register with email, username, and password. |
| FR-02 | Passwords are hashed with bcrypt before storage. |
| FR-03 | User receives a JWT token upon successful registration/login. |
| FR-04 | JWT tokens encode `sub` (email) and `username`; verified via `HS256` with a secret key. |
| FR-05 | Authenticated routes are protected by `AuthGuard` on the frontend and `get_current_user` on the backend. |
| FR-06 | User can update their username (PUT `/api/me`), receiving a refreshed JWT. |
| FR-07 | User can delete their account (DELETE `/api/me`), which cascades to all personal data. |
| FR-08 | Anonymous users (no token) can still use the AI chat with a reduced daily limit (5 queries). |

### 6.2 Finance Data Management
| FR-ID | Requirement |
|-------|-------------|
| FR-09 | User can create, read, update, and delete bank accounts. |
| FR-10 | User can upload Excel (.xlsx/.xls) bank statements; system auto-detects date, description, debit/credit, and account columns. |
| FR-11 | Uploaded transactions are stored with AI-assigned categories. |
| FR-12 | User can upload Excel investment portfolios; system auto-maps human-readable headers (e.g., "Amount invested (₹)" → `purchase_price`). |
| FR-13 | User can view all investments, edit details, or delete entries. |
| FR-14 | User can create financial goals with target amounts and deadlines; progress is auto-tracked. |
| FR-15 | User can view AI-powered budget summaries with category spending breakdowns and suggestions. |
| FR-16 | User can edit their credit score and EPF balance directly. |

### 6.3 AI Assistant
| FR-ID | Requirement |
|-------|-------------|
| FR-17 | Authenticated users can ask the AI assistant finance questions. |
| FR-18 | The AI receives only finance data for categories the user has explicitly permitted. |
| FR-19 | If OpenAI API key is configured, the assistant uses `gpt-4o-mini` for chat and `gpt-3.5-turbo` for specialized insights. |
| FR-20 | If OpenAI API key is not configured, the assistant returns safe mock responses and insights. |
| FR-21 | Chat messages are persisted per session in MySQL. |
| FR-22 | Users can create, rename, switch between, and delete chat sessions. |
| FR-23 | AI query rate limits: 5/day for anonymous users, 50/day for authenticated users. |

### 6.4 Permissions
| FR-24 | User can toggle granular permissions for: assets, liabilities, transactions, investments, EPF, credit score. |
| FR-25 | Permissions control what financial data is included in the AI system prompt. |
| FR-26 | Default permissions are all `TRUE` upon registration. |

### 6.5 Landing Page & UI
| FR-27 | Landing page displays marketing content: hero, features, stats, testimonials. |
| FR-28 | User can navigate to Sign In / Sign Up from the header. |
| FR-29 | Authenticated users see "Profile" and "Upload Finance Data" in the header nav. |
| FR-30 | All protected routes redirect unauthenticated users to `/signin`. |

---

## 7. Non-Functional Requirements

| NFR-ID | Category | Requirement |
|--------|----------|-------------|
| NFR-01 | Security | Passwords hashed with bcrypt; never stored in plaintext. |
| NFR-02 | Security | JWT tokens signed with a server-side secret key; never expose the key to the frontend. |
| NFR-03 | Security | CORS restricted to known origins (localhost:3000, 127.0.0.1:3000, localhost:5173). |
| NFR-04 | Security | Input sanitized with `bleach` on AI query endpoint. |
| NFR-05 | Security | Rate-limited AI access (free tier: 5/day; authenticated: 50/day). |
| NFR-06 | Performance | Database connections pooled (max 10) via `mysql.connector.pooling`. |
| NFR-07 | Scalability | FastAPI app supports uvicorn with hot-reload for development. |
| NFR-08 | Compatibility | Frontend built with React 18 + Vite (ESM); backend with Python 3.11+ + FastAPI. |
| NFR-09 | Data Storage | MySQL 8+ database persists all user, chat, and financial data. |
| NFR-10 | Observability | Application logs operations (registration, auth, uploads); errors surfaced via HTTP status codes. |
| NFR-11 | Maintainability | Backend is modular: separate routers for auth, chat, upload, content, permissions, AI. |
| NFR-12 | Maintainability | Frontend is component-based with clear separation of pages and components. |
| NFR-13 | Reliability | Excel upload validates file type and required columns before DB insertion; transactions wrapped in DB transactions with rollback. |

---

## 8. Success Metrics & KPIs

| Metric | Definition | Baseline / Target |
|--------|-----------|-------------------|
| DAU | Daily active authenticated users | TBD (post-launch) |
| WAU | Weekly active authenticated users | Target: 30% of registered users |
| Churn Rate (7-day) | % of users who sign up but don't return within 7 days | Target: < 50% |
| AI Query Volume | Avg. queries per active user per day | Target: 3+ |
| Upload Conversion | % of users who upload at least one file within 3 days of signup | Target: 60% |
| Feature Adoption | % of active users using 3+ features | Target: 40% |
| Error Rate | % of API requests returning 4xx/5xx | Target: < 2% |
| AI Response Satisfaction | In-app survey rating (1–5) | Target: 4.0+ |

---

## 9. Constraints & Assumptions

### Constraints
- The MVP targets individual (retail) users only; B2B/multi-user business logic is out of scope.
- OpenAI integration is optional; the application must function with the mock fallback.
- SendGrid email integration requires a configured API key; if absent, registration proceeds without sending an email.
- Excel upload requires at least a "date" column and an amount/debit/credit column and an account identifier.
- Permissions are toggled per-user (not per-chat-session) as of MVP.

### Assumptions
- Users have internet access and a modern browser (ES2020+ support).
- Users can export bank statements in Excel format from their financial institutions.
- The OpenAI API key, if used, is configured via `backend/.env`.
- The MySQL database is pre-initialized with `backend/data.sql`.
- Frontend development server runs on `localhost:5173`; backend on `localhost:8000`.

---

## 10. Dependencies

| Dependency | Type | Purpose |
|------------|------|---------|
| Python 3.11+ | Runtime | Backend execution |
| FastAPI | Framework | Backend API |
| Uvicorn | Server | ASGI server |
| MySQL 8+ | Database | Data persistence |
| Node.js 18+ | Runtime | Frontend build/dev |
| Vite 7 | Build Tool | Frontend bundling |
| React 18 | Library | Frontend UI framework |
| Tailwind CSS 3 | Styling | Utility-first CSS |
| Chart.js 4 + react-chartjs-2 | Library | Pie chart visualizations |
| lucide-react | Icons | UI icons |
| jwt-decode | Library | JWT decoding on frontend |
| OpenAI SDK | Library | AI model access (optional) |
| SendGrid | Service | Email (optional) |
| Pandas | Library | Excel file parsing |
| OpenPyXL | Library | Excel engine for pandas |

---

## 11. Open Questions

1. Should the AI chat assistant be connected to live bank data in Phase 2, or remain file-upload-based through Phase 3?
2. Should permissions be per-session or global? (Currently global.)
3. How should the free tier monetization be structured in Phase 2+ (subscription tiers)?
4. Should we add CSV import support alongside Excel?
5. Is EPF (Employees' Provident Fund) the only regional retirement account to support, or should we generalize to "retirement accounts"?

---

## 12. Revision History

| Date | Version | Author | Summary |
|------|---------|--------|---------|
| 2026-08-19 | 1.0 | Engineering Team | Initial PRD based on codebase analysis. |
