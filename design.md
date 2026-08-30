# Technical Design Document

**Project:** FinanceAI — AI-Powered Personal Finance Assistant
**Date:** 2026-08-19
**Status:** MVP in development

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Browser (Client)                                 │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  Frontend (React 18 + Vite + Tailwind CSS + Chart.js)                │ │
│  │  Pages: Home, SignIn, SignUp, FinanceQuestionnaire,                 │ │
│  │         Dashboard, AIChat, FinanceData, SmartBudgeting,            │ │
│  │         AllInvestments, AllTransactions, Profile                   │ │
│  │  Components: Header, Hero, Features, Stats, Testimonials,           │ │
│  │              Footer, AuthGuard                                      │ │
│  └──────────────────────────┬─────────────────────────────────────────┘ │
└─────────────────────────────┼──────────────────────────────────────────┘
                              │ HTTPS (REST/JSON)
                              │ JWT Bearer Token in Authorization header
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          Backend (FastAPI 0.115+)                       │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  main.py — App entry · CORS middleware · Router mounting           │ │
│  │                                                                  │ │
│  │  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │ │
│  │  │ users.py    │  │ ai.py        │  │ permissions  │  │ finance_  │ │ │
│  │  │ (auth)      │  │ (chat)       │  │ .py          │  │ data.py   │ │ │
│  │  │ /register   │  │ /ask         │  │ /permissions │  │ /finance- │ │ │
│  │  │ /login      │  │              │  │              │  │ summary   │ │ │
│  │  │ /me (PUT,D) │  │              │  │              │  │          │ │ │
│  │  └─────────────┘  └──────────────┘  └──────────────┘  └──────────┘ │ │
│  │                                                                  │ │
│  │  routes/                                                        │ │
│  │  ┌────────────────┐  ┌────────────────┐  ┌─────────────────────┐ │ │
│  │  │ chat_routes    │  │ upload_routes  │  │ content_routes      │ │ │
│  │  │ /chat/*        │  │ /upload/*      │  │ /investments,       │ │ │
│  │  │ create_session │  │ transactions   │  │ /accounts,          │ │ │
│  │  │ add_message    │  │ investments    │  │ /transactions,      │ │ │
│  │  │ messages       │  │ (Excel parse)  │  │ /goals,             │ │ │
│  │  │ sessions       │  │                │  │ /budget-summary,    │ │ │
│  │  │ update title   │  │                │  │ /investment-insights│ │ │
│  │  │ delete         │  │                │  │ /finance_profile    │ │ │
│  │  └────────────────┘  └────────────────┘  │ /summary_finance  │ │ │
│  │                                            │ /goal-progress   │ │ │
│  │  models/                                   └─────────────────────┘ │ │
│  │  └─ models.py (Pydantic schemas)                                   │ │
│  └────────────────────────────┬───────────────────────────────────────┘ │
│                               │                                         │
│              ┌────────────────┼────────────────┐                         │
│              ▼                ▼                ▼                         │
│  ┌──────────────────┐ ┌──────────────┐ ┌─────────────────────┐            │
│  │ MySQL 8+         │ │ Connection   │ │ OpenAI API          │            │
│  │ (finance_       │ │ Pool (10)    │ │ (optional)           │            │
│  │  assistant)     │ │ (mysql.conn.)│ │ /v1/chat/completions│            │
│  │                  │ │              │ │                     │           │
│  │ Tables:          │ │              │ │                     │            │
│  │  users           │ └──────────────┘ └─────────────────────┘            │
│  │  chat_sessions   │                                                      │
│  │  chat_messages   │                                                      │
│  │  user_summary    │                                                      │
│  │  user_invest-    │                                                      │
│  │  ments           │                                                      │
│  │  user_accounts   │                                                      │
│  │  user_transactions│                                                     │
│  │  user_goals      │                                                      │
│  │  user_permissions│                                                      │
│  │  user_finance_   │                                                      │
│  │  profile         │                                                      │
│  │  user_finance_   │                                                      │
│  │  summary         │                                                      │
│  └──────────────────┘                                                     │
│                                                                             │
│  ┌──────────────────┐         (optional)                                    │
│  │ SendGrid API     │                                                      │
│  │ (email)          │                                                      │
│  └──────────────────┘                                                      │
└─────────────────────────────────────────────────────────────────────────┘
```

**Key Design Decisions:**
- **Monolithic backend** — Single FastAPI application with modular routers. Simple to deploy and maintain for the MVP.
- **JWT-based stateless auth** — Tokens stored in `localStorage`; `get_current_user` dependency decodes and validates on every protected request.
- **Database connection pooling** — `mysql.connector.pooling.MySQLConnectionPool` with `pool_size=10` to avoid connection overhead on each request.
- **OpenAI as optional dependency** — If `OPENAI_API_KEY` is unset, the AI endpoints return safe mock responses, making the app fully usable without OpenAI.
- **Excel processing on backend** — Pandas + OpenPyXL handle Excel parsing; column auto-detection maps varied bank statement formats to the internal schema.

---

## 2. Technology Stack

### Frontend
| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React | 18.2 |
| Build Tool | Vite | 7.x |
| Styling | Tailwind CSS | 3.3 |
| Icons | lucide-react | 0.548 |
| Routing | react-router-dom | 7.9 |
| Charts | Chart.js | 4.5 + react-chartjs-2 |
| Auth (JWT decode) | jwt-decode | 4.0 |
| CSS | PostCSS + Autoprefixer | — |

### Backend
| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | FastAPI | 0.115 |
| Server | Uvicorn | 0.30 |
| Database | MySQL | 8.0+ |
| ORM | Raw SQL via mysql-connector | — |
| Auth | python-jose (JWT) | 3.x |
| Password Hashing | passlib (bcrypt) | 1.7 |
| AI SDK | openai | 1.x |
| Excel Processing | pandas | 2.x |
| Excel Engine | openpyxl | 3.x |
| Input Sanitization | bleach | 6.x |
| Email | sendgrid | 6.x |
| Env Management | python-dotenv | 1.x |

### Infrastructure
| Component | Technology |
|-----------|-----------|
| Hosting (backend) | Any (Uvicorn/Gunicorn, Docker-ready) |
| Hosting (frontend) | Vercel / Netlify / any static host |
| Database | MySQL 8+ (or MariaDB 10.6+) |
| CI/CD | GitHub Actions (Phase 1+) |
| Containerization | Docker (Phase 1+) |

---

## 3. Data Model

### Entity-Relationship Diagram (MySQL Schema)

```
┌─────────────────────────────────────────────┐
│ users                                        │
├─────────────────────────────────────────────┤
│ id          BIGINT  PK AUTO_INCREMENT        │
│ username     VARCHAR(50)  UNIQUE NOT NULL    │
│ email        VARCHAR(255) UNIQUE NOT NULL    │
│ password_hash VARCHAR(255) NOT NULL          │
│ ai_query_count INT DEFAULT 0                │
│ last_query_date DATE                        │
│ created_at  DATETIME DEFAULT CURRENT_TIMESTAMP│
└────────────┬──────────────────────────┬─────┘
             │ (1:M)                  │ (1:1)
┌────────────▼────────────┐  ┌───────▼────────┐
│ chat_sessions            │  │ user_permissions│
├─────────────────────────┤  ├─────────────────┤
│ id         BIGINT PK     │  │ user_id BIGINT PK FK│
│ user_id   BIGINT FK     │  │ assets   BOOLEAN    │
│ title      VARCHAR(255)│  │ liabilities BOOLEAN │
│ created_at DATETIME    │  │ transactions BOOLEAN│
│                         │  │ investments  BOOLEAN│
└────────────┬───────────┘  │ epf         BOOLEAN │
             │ (1:M)        │ credit_score BOOLEAN│
┌────────────▼───────────┐  └───────────────────┘
│ chat_messages           │
├────────────────────────┤
│ id        BIGINT PK      │
│ session_id BIGINT FK     │
│ sender    ENUM('user','ai')│
│ text      TEXT           │
│ created_at DATETIME      │
└────────────────────────┘
```

```
┌──────────────────────────────────────────┐
│ user_accounts                            │
├──────────────────────────────────────────┤
│ id          BIGINT PK AUTO_INCREMENT     │
│ user_id      BIGINT FK                  │
│ account_name VARCHAR(255)               │
│ bank_name    VARCHAR(255)               │
│ ifsc_code    VARCHAR(20)                │
│ account_type VARCHAR(50)                │
│ balance      DECIMAL(15,2) DEFAULT 0    │
│ created_at   DATETIME                   │
└──────┬──────────────────────────────────┘
       │ (1:M)
┌──────▼──────────────────────────────────┐
│ user_transactions                      │
├────────────────────────────────────────┤
│ id          BIGINT PK AUTO_INCREMENT    │
│ user_id     BIGINT FK                   │
│ account_id  BIGINT FK                   │
│ date        DATE                        │
│ description VARCHAR(255)                │
│ category    VARCHAR(255)                │
│ amount      DECIMAL(15,2)               │
│ transaction_type ENUM('credit','debit')│
└────────────────────────────────────────┘
```

```
┌────────────────────────────────────────┐    ┌──────────────────────────────┐
│ user_investments                       │    │ user_goals                    │
├────────────────────────────────────────┤    ├──────────────────────────────┤
│ id             BIGINT PK AUTO_INCR      │    │ id          BIGINT PK AI     │
│ user_id        BIGINT FK                │    │ user_id      BIGINT FK       │
│ investment_type VARCHAR(50)             │    │ goal_name    VARCHAR(255)   │
│ name           VARCHAR(255)             │    │ target_amount DECIMAL(15,2) │
│ quantity       DECIMAL(15,4)            │    │ current_progress DECIMAL   │
│ purchase_price DECIMAL(15,2)            │    │ deadline     DATE          │
│ current_price  DECIMAL(15,2)            │    │ created_at   DATETIME       │
│ purchase_date  DATE                     │    └──────────────────────────────┘
│ created_at     DATETIME                 │
└────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────┐
│ user_summary          ┌──── user_finance_profile │
├─────────────────────────────────────────────────┤┌─────────────────────────────┐
│ user_id    BIGINT PK FK                          ││ user_id         BIGINT PK FK│
│ epf_balance  DECIMAL(15,2) DEFAULT 0            ││ salary          DECIMAL    │
│ credit_score INT DEFAULT NULL                    ││ monthly_debt_paymts DECIMAL│
│                                                ││ housing_cost   DECIMAL    │
│                                                ││ transportation_cost DEC. │
│                                                ││ food_cost       DECIMAL    │
│                                                ││ other_expenses  DECIMAL    │
│                                                ││ savings_goal    DECIMAL    │
│                                                ││ risk_tolerance  VARCHAR(50)│
│                                                ││ investment_experienceVARCH │
└─────────────────────────────────────────────────┘└─────────────────────────────┘
```

```
┌─────────────────────────────────────────────────┐
│ user_finance_summary                            │
├─────────────────────────────────────────────────┤
│ id        BIGINT PK AUTO_INCREMENT              │
│ user_id   BIGINT FK                             │
│ month_year CHAR(7)                             │
│ monthly_spending DECIMAL(15,2) DEFAULT 0        │
│ savings_current DECIMAL(15,2) DEFAULT 0         │
│ savings_goal DECIMAL(15,2) DEFAULT 0            │
│ ai_optimization DECIMAL(5,2) DEFAULT 0         │
│ last_updated DATETIME DEFAULT CURRENT_TIMESTAMP│
│ UNIQUE (user_id, month_year)                    │
└─────────────────────────────────────────────────┘
```

### Relationship Summary

| From | To | Cardinality | Cascade |
|------|----|-------------|---------|
| users | chat_sessions | 1:N | ON DELETE CASCADE |
| chat_sessions | chat_messages | 1:N | ON DELETE CASCADE |
| users | user_accounts | 1:N | ON DELETE CASCADE |
| user_accounts | user_transactions | 1:N | ON DELETE CASCADE |
| users | user_investments | 1:N | ON DELETE CASCADE |
| users | user_goals | 1:N | ON DELETE CASCADE |
| users | user_permissions | 1:1 | ON DELETE CASCADE |
| users | user_summary | 1:1 | ON DELETE CASCADE |
| users | user_finance_profile | 1:1 | ON DELETE CASCADE |
| users | user_finance_summary | 1:N | ON DELETE CASCADE |

---

## 4. API Design

All routes are mounted under the `/api` prefix. The backend is defined in `main.py:37-43`.

### Auth Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/register` | Public | Register a new user. Body: `{ email, username, password }`. Returns `{ access_token, token_type }`. |
| POST | `/api/login` | Public | Login with email/password (form-encoded). Returns `{ access_token, token_type }`. |
| PUT | `/api/me` | Protected | Update username. Returns updated user + refreshed JWT. |
| DELETE | `/api/me` | Protected | Delete the authenticated user's account. |

### AI Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/ask` | Optional | Ask the AI assistant. Body: `{ query: string }`. Returns `{ answer, insights }`. Falls back to mock response if no OpenAI key. Rate-limited (5/day anon, 50/day auth). |

### Chat Session Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/chat/create_session` | Protected | Create a new chat session. Body: `{ title }`. Returns `{ id, title }`. |
| POST | `/api/chat/add_message` | Public | Add a message to a session. Body: `{ session_id, sender, text }`. |
| GET | `/api/chat/messages/{session_id}` | Public | Fetch all messages for a session. Returns `[{ sender, text, created_at }]`. |
| GET | `/api/chat/sessions/{username}` | Public | Fetch all chat sessions for a user (by username). |
| PUT | `/api/chat/sessions/{session_id}/title` | Protected | Update a session title. Body: `{ title }`. |
| DELETE | `/api/chat/sessions/{session_id}` | Protected | Delete a session and its messages. |

### Permission Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/permissions/` | Protected | Get current user's permissions. Returns `{ assets, liabilities, transactions, investments, epf, creditScore }`. |
| POST | `/api/permissions/` | Protected | Update permissions. Body: `PermissionsModel`. |

### Upload Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/upload/transactions` | Protected | Upload transactions via Excel. `multipart/form-data` with `file` + optional `account_id`. |
| POST | `/api/upload/investments` | Protected | Upload investments via Excel. `multipart/form-data` with `file`. |

### Content Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/stats` | Public | Static stats for landing page. |
| GET | `/api/testimonials` | Public | Static testimonials for landing page. |
| GET | `/api/summary_finance` | Public | Get user's credit score & EPF balance. |
| PUT | `/api/summary_finance` | Protected | Update credit score & EPF balance. |
| GET | `/api/budget-summary` | Protected | Get categorized expenses, salary, AI budget suggestions. |
| GET | `/api/investment-insights` | Protected | Get AI-powered 12-month investment plan. |
| GET | `/api/goal-progress/{goal_id}` | Protected | Get goal details, months-needed estimate, AI suggestions. |
| GET | `/api/finance-summary` | Protected | Get `user_finance_summary` row (dashboard data). |

### Finance Profile Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/finance_profile` | Protected | Create finance profile. Body: `UserFinanceProfileCreate`. |
| PUT | `/api/finance_profile` | Protected | Update finance profile. Body: `UserFinanceProfileUpdate`. |
| GET | `/api/finance_profile` | Protected | Get finance profile. Returns profile dict. |

### Accounts Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/accounts` | Protected | Create account. Body: `AccountCreate`. |
| GET | `/api/accounts` | Protected | List all accounts. |
| PUT | `/api/accounts/{account_id}` | Protected | Update account. Body: `AccountUpdate`. |
| DELETE | `/api/accounts/{account_id}` | Protected | Delete account. |
| GET | `/api/accounts/{account_id}/transactions` | Protected | List transactions for a specific account. |

### Transactions Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/transactions` | Protected | Create transaction. Body: `TransactionCreate`. |
| GET | `/api/transactions` | Protected | List all transactions. |
| PUT | `/api/transactions/{transaction_id}` | Protected | Update transaction (with bank-column auto-mapping). Body: `TransactionUpdate`. |
| DELETE | `/api/transactions/{transaction_id}` | Protected | Delete transaction. |

### Investments Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/investments` | Protected | Create investment. Body: `InvestmentCreate`. |
| GET | `/api/investments` | Protected | List all investments. |
| PUT | `/api/investments/{investment_id}` | Protected | Update investment. Body: `InvestmentUpdate`. |
| DELETE | `/api/investments/{investment_id}` | Protected | Delete investment. |

### Goals Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/goals` | Protected | Create goal. Body: `GoalCreate`. |
| GET | `/api/goals` | Protected | List all goals. |
| PUT | `/api/goals/{goal_id}` | Protected | Update goal. Body: `GoalUpdate`. |
| DELETE | `/api/goals/{goal_id}` | Protected | Delete goal. |

---

## 5. Backend Design

### 5.1 Module Structure

```
backend/
├── main.py              # App entry, CORS, router mounting
├── ai.py                # /ask endpoint, OpenAI/mock fallback, rate limiting
├── db.py                # MySQL connection pool
├── users.py             # Auth: register, login, JWT, user update/delete
├── permissions.py       # Permission CRUD (assets, liabilities, etc.)
├── finance_data.py      # /finance-summary endpoint
├── requirements.txt     # Python dependencies
├── default.env          # Environment variable template
├── data.sql             # MySQL schema initialization
├── models/
│   ├── __init__.py
│   └── models.py        # Pydantic models
└── routes/
    ├── __init__.py
    ├── chat_routes.py   # Chat session/message CRUD
    ├── content_routes.py# Accounts, transactions, investments, goals, profile, AI insights
    └── upload_routes.py # Excel file parsing & ingestion
```

### 5.2 Authentication Flow

```
1.  User submits credentials → POST /api/register or /api/login
2.  Backend verifies (or hashes bcrypt for register) → queries MySQL
3.  JWT created: { sub: email, username: username } signed with HS256 + SECRET_KEY
4.  Token returned to frontend → stored in localStorage
5.  On protected requests → Authorization: Bearer <token> header
6.  get_current_user() dependency → decodes JWT → fetches user row from DB
7.  If invalid/expired → returns None → endpoint returns 401
```

### 5.3 AI Assistant Flow (`/api/ask`)

```
1.  Request: { query } → POST /api/ask
2.  Sanitize input with bleach.clean()
3.  Extract user from JWT (or None if anonymous)
4.  Rate limit check:
    - Anonymous: 5 requests/day per IP (in-memory dict)
    - Authenticated: 50 requests/day (DB-stored counter, reset daily)
5.  Fetch user permissions → get_user_permissions(user_id)
6.  Fetch finance data → get_user_finance_data(user_id, permissions)
    - Conditionally queries: assets, liabilities, transactions (LIMIT 10),
      investments, epf, credit_score
7.  If OpenAI API key configured:
    - Build system prompt with finance_data + permissions
    - Call gpt-4o-mini
    - Return { answer, insights: finance_data }
8.  Else (mock fallback):
    - Return { answer: "[MOCK RESPONSE]", insights: finance_data }
```

### 5.4 Excel Upload Flow (`/api/upload/transactions`)

```
1.  Validate file type (.xlsx/.xls)
2.  Read file into pandas DataFrame
3.  Normalize column names (lowercase, strip)
4.  Auto-detect columns using synonym maps:
    date → date, transaction date, txn date
    description → description, narration, merchant, details
    debit → debit, debit ($), withdrawal, dr amount
    credit → credit, credit ($), deposit, cr amount
    amount → amount, amount ($), transaction amount
    account → account_id, account number, account no, card number
5.  Build account number → ID mapping from user_accounts
6.  For each row:
    - Resolve account_id
    - Parse date
    - Call OpenAI to categorize the transaction description
    - Compute amount (from amount column, or credit - debit)
7.  Batch insert all transactions into user_transactions
8.  If category == 'savings' → increment goal progress
9.  Commit transaction → return count
```

### 5.5 Permission Enforcement in AI

The AI assistant respects user-set permissions. Only finance data categories that are explicitly permitted (`TRUE`) are included in the system prompt sent to the LLM or returned in the mock response:

| Permission | Data Included When Permitted |
|------------|------------------------------|
| `assets` | All user assets (from `user_summary`, `user_accounts`, `user_investments`) |
| `liabilities` | (Currently unused in `get_user_finance_data`; placeholder) |
| `transactions` | Last 10 transactions (from `user_transactions`) |
| `investments` | All investments (from `user_investments`) |
| `epf` | EPF data (from `user_summary.epf_balance`) |
| `creditScore` | Credit score (from `user_summary.credit_score`) |

Default: all `TRUE`.

---

## 6. Frontend Design

### 6.1 Component Structure

```
interface/src/
├── main.jsx                  # React entry point
├── App.jsx                   # Router configuration (all routes)
├── main.css                  # Tailwind + custom utility classes
├── components/
│   ├── AuthGuard.jsx         # Route protection (checks localStorage token)
│   ├── Header.jsx            # Nav bar with auth state + mobile menu
│   ├── Hero.jsx              # Landing hero section with finance data preview
│   ├── Features.jsx          # Feature cards (links to routes)
│   ├── Stats.jsx             # Key statistics display
│   ├── Testimonials.jsx      # User testimonials carousel
│   └── Footer.jsx            # App footer with links
└── pages/
    ├── Home.jsx              # Landing page (composition of components)
    ├── SignIn.jsx            # Login form
    ├── SignUp.jsx            # Registration form → redirects to questionnaire
    ├── FinanceQuestionnaire.jsx  # Onboarding financial profile form
    ├── Dashboard.jsx         # Placeholder authenticated page
    ├── AIChat.jsx          # Main chat interface with session sidebar
    ├── FinanceData.jsx     # Central finance data management hub
    ├── SmartBudgeting.jsx  # Budget analysis with pie chart + AI suggestions
    ├── AllInvestments.jsx  # Full investment list view
    ├── AllTransactions.jsx # Full transaction list view
    └── Profile.jsx         # User profile, finance profile, permissions
```

### 6.2 Routing Map

| Path | Component | Auth Required |
|------|-----------|---------------|
| `/` | Home | No |
| `/signin` | SignIn | No |
| `/signup` | SignUp | No |
| `/finance-questionnaire` | FinanceQuestionnaire | No |
| `/chat` | AIChat | Yes |
| `/dashboard` | Dashboard | Yes |
| `/finance-data` | FinanceData | Yes |
| `/smart-budgeting` | SmartBudgeting | Yes |
| `/all-investments` | AllInvestments | Yes |
| `/all-transactions` | AllTransactions | Yes |
| `/profile` | Profile | Yes |

> **Note (v1.0 gap):** `Features.jsx` links to `/investment-insights`, `/goal-tracking`, `/expense-optimization`, `/bill-management`, `/wealth-analytics` — these routes are NOT yet defined in `App.jsx`. These will be added in Phase 0 (stubs) or Phase 1.

### 6.3 Authentication Pattern

All pages follow a consistent auth pattern:

```javascript
useEffect(() => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const decoded = jwtDecode(token);
      const username = decoded.username || 'User';
      const email = decoded.sub || '';
      // fetch user-specific data with token
    } catch (err) {
      localStorage.removeItem('token');
      navigate('/signin');
    }
  } else {
    navigate('/signin');
  }
}, [navigate]);
```

Protected routes are wrapped in `AuthGuard`:

```jsx
<Route path="/profile" element={
  <AuthGuard><Profile /></AuthGuard>
} />
```

### 6.4 API Communication Pattern

The frontend uses the native `fetch` API directly (no centralized apiService despite the README mentioning one). Every request includes the JWT:

```javascript
const token = localStorage.getItem('token');
const response = await fetch(`http://localhost:8000/api/...`, {
  headers: { 'Authorization': `Bearer ${token}` },
  'Content-Type': 'application/json',
  body: JSON.stringify(data),
});
```

> **Gap:** API base URL is hardcoded to `http://localhost:8000`. Should use `import.meta.env.VITE_API_BASE_URL` or `REACT_APP_BASE_URL`.

---

## 7. Security Design

### 7.1 Authentication & Authorization
| Concern | Implementation |
|---------|----------------|
| Password storage | bcrypt via `passlib` (cost factor default) |
| Session management | Stateless JWT (HS256), stored in `localStorage` |
| Token expiry | Not currently implemented (tokens never expire) — TODO: add `exp` claim |
| Route protection | `AuthGuard.jsx` (frontend) + `get_current_user` (backend) |
| Account ownership | All data queries are scoped to `user_id` from JWT |

### 7.2 Data Protection
| Concern | Implementation |
|---------|----------------|
| Input sanitization | `bleach.clean()` on AI query (`ai.py:89`) |
| CORS | Restricted to `localhost:3000`, `127.0.0.1:3000`, `localhost:5173` (`main.py:19-23`) |
| SQL injection | Parameterized queries throughout (`%s` placeholders) |
| Secrets management | `.env` file (gitignored); `default.env` as template |
| OpenAI key exposure | Never sent to frontend; only used server-side |

### 7.3 Rate Limiting
| Tier | Limit | Mechanism |
|------|-------|-----------|
| Anonymous | 5 AI queries/day | In-memory dict keyed by IP |
| Authenticated | 50 AI queries/day | `ai_query_count` + `last_query_date` columns in `users` table |

### 7.4 Security Gaps (to address in Phase 1)
| Gap | Risk |
|-----|------|
| No JWT token expiration | Long-lived tokens if stolen |
| `localStorage` token storage (XSS vulnerability) | Token theft via XSS |
| Hardcoded API URLs | Information leakage of backend endpoint |
| No CSRF protection | Not applicable (JWT in header, not cookie — but worth noting) |
| Permissions toggled UI-only in Profile | Changes not persisted to backend |

---

## 8. Testing Strategy

### 8.1 Backend Testing (Planned Phase 1)
```
backend/tests/
├── conftest.py                  # pytest fixtures (test DB, test client)
├── test_auth.py                 # Register, login, token validation
├── test_chat.py                 # Session CRUD, message flow
├── test_permissions.py         # Permission get/update
├── test_upload_transactions.py  # Excel parsing, column mapping
├── test_upload_investments.py  # Investment upload + header mapping
├── test_content_routes.py       # Accounts, transactions, investments, goals CRUD
├── test_ai.py                   # /ask endpoint (mock + rate limit)
├── test_finance_profile.py     # Profile create/update/get
├── test_budget_summary.py      # Budget summary + AI suggestions
└── test_investment_insights.py # Investment insights endpoint
```

### 8.2 Frontend Testing (Planned Phase 1)
```
interface/tests/
├── auth.test.jsx               # Sign in, sign up, token persistence
├── ai_chat.test.jsx            # Message send/receive, session management
├── finance_data.test.jsx       # Upload, CRUD operations
└── profile.test.jsx            # Permission toggle, profile update
```

---

## 9. Deployment & Infrastructure

### 9.1 Development Environment

```
┌────────────────────┐  Proxy  ┌──────────────────────┐
│ Frontend (Vite)    │◄────────│ Backend (Uvicorn)    │
│ localhost:5173     │         │ localhost:8000        │
│                    │────────►│                      │
│ fetch() to:8000    │         │ MySQL:3306           │
└────────────────────┘         └──────────────────────┘
```

### 9.2 Environment Configuration

**Backend** (`.env` at `backend/.env`, copy from `default.env`):

| Variable | Purpose | Required |
|----------|---------|----------|
| `DB_USERNAME` | MySQL user | Yes |
| `DB_PASSWORD` | MySQL password | Yes |
| `DB_HOST` | MySQL host (default `localhost`) | Yes |
| `DB_PORT` | MySQL port (default `3306`) | Yes |
| `DB_NAME` | Database name (default `finance_assistant`) | Yes |
| `DB_USER` | MySQL user env var alias (used in `db.py`) | Yes |
| `SECRET_KEY` | JWT signing secret | Yes |
| `OPENAI_API_KEY` | OpenAI API key (optional) | No |
| `SENDGRID_API_KEY` | SendGrid for welcome emails (optional) | No |
| `SENDER_EMAIL` | Verified sender email (optional) | No |

> **Note:** `db.py` reads `DB_USER` (not `DB_USERNAME`), while `default.env` defines `DB_USERNAME`. This is a naming mismatch that needs resolution.

**Frontend** (`.env` at `interface/.env`):

| Variable | Purpose | Default |
|----------|---------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:8000` |

### 9.3 Production Environment (Phase 1+ target)

| Component | Recommendation |
|-----------|----------------|
| Frontend | Static build → Vercel / Netlify / S3 + CloudFront |
| Backend | Docker container → AWS ECS / Fly.io / Render |
| Database | AWS RDS (MySQL) / PlanetScale |
| API Gateway | Nginx / AWS ALB with HTTPS |
| Rate Limiting | Redis-backed or API Gateway limits |
| Monitoring | Prometheus + Grafana / Sentry for error tracking |
| Logging | Structured JSON logs → CloudWatch / Datadog |

### 9.4 Docker Setup (Phase 1)

Planned `Dockerfile` structure:

```dockerfile
# Backend
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```yaml
# docker-compose.yml (Phase 1)
services:
  backend:
    build: ./backend
    ports: ["8000:8000"]
    env_file: ./backend/.env
  frontend:
    build: ./interface
    ports: ["5173:80"]
  db:
    image: mysql:8.0
    ports: ["3306:3306"]
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_DATABASE: finance_assistant
```

---

## 10. API Client Design

### Current State
The frontend communicates with the backend using raw `fetch` calls scattered across each page/component. There is no centralized API client (despite the README mentioning `apiService.js`).

### Proposed API Client (Phase 1)
A centralized `apiService.js` that:
- Reads the base URL from environment variables
- Automatically attaches the JWT token from `localStorage`
- Provides typed helper methods per resource:

```javascript
// apiService.js (proposed)
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = {
  auth: { login, register, updateUser, deleteUser },
  chat: { createSession, addMessage, getMessages, getSessions, updateTitle, deleteSession },
  ask: { askQuestion },
  finance: { getProfile, updateProfile, createProfile },
  accounts: { getAll, create, update, delete, getTransactions },
  transactions: { getAll, create, update, delete },
  investments: { getAll, create, update, delete },
  goals: { getAll, create, update, delete, getProgress },
  upload: { uploadTransactions, uploadInvestments },
  budget: { getSummary },
  insights: { getInvestmentInsights },
  permissions: { get, update },
};
```

This would replace ~50 inline `fetch` calls across the frontend.

---

## 11. Design Decisions & Trade-offs

| Decision | Choice | Rationale | Alternatives Considered |
|----------|--------|-----------|------------------------|
| Monolith vs Microservices | Monolith (FastAPI single app) | Faster MVP, simpler deployment, fewer moving parts for a small team | Microservices (Phase 4) |
| ORM | Raw SQL via mysql-connector | Fine-grained control; the team is comfortable with SQL | SQLAlchemy (was in requirements but not used) |
| Frontend state | Local `useState` + `useEffect` | Minimal overhead for a small app | Redux / Zustand / Context API |
| Auth storage | `localStorage` + JWT | Simple; works with stateless backend | HttpOnly cookies (more secure but adds CSRF complexity) |
| Excel processing | Pandas (backend) | Handles varied column formats; powerful | Frontend parsing (limited by browser sandbox + performance) |
| OpenAI model | gpt-4o-mini (chat) + gpt-3.5-turbo (insights) | Cost-effective balance of quality | gpt-4o (higher cost), open-source models (lower quality) |
| Mock fallback | Hardcoded mock response | App works without API key; good for demos/PoC | More sophisticated rule-based engine |
| Rate limiting | DB counter (auth) + in-memory (anon) | Lightweight; no extra dependencies | Redis-backed rate limiter (scalable) |

---

## 12. Future Design Considerations

### Phase 2: Enhanced AI
- **Batch transaction categorization** — Process entire Excel file in one OpenAI call instead of per-row.
- **RAG (Retrieval-Augmented Generation)** — Store financial data embeddings in a vector DB (e.g., Chroma/Pinecone) for more contextual queries.
- **Fine-tuned models** — Fine-tune a small model on financial Q&A for cost efficiency.

### Phase 3: Engagement
- **Real-time notifications** — WebSocket connection for budget alerts and goal milestones.
- **Subscription billing** — Stripe integration for Pro/Premium tiers.

### Phase 4: Scale
- **Microservices** — Split into auth, AI, data, and billing services.
- **Event-driven architecture** — Kafka/RabbitMQ for async processing (uploads, AI generation).
- **Multi-region deployment** — Edge functions for low-latency AI responses.
