***


# AI-Finance-Assistance

A minimal demo of an **AI-powered Personal Finance Assistant**—full-stack project with:
- **FastAPI backend** including: sessions, JWT login/register, permission control, chat storage, and (optionally) OpenAI integration or safe mock fallback
- **React (MUI) frontend:** multi-session chat, Markdown messages, permission toggling, insights display, theme switch, proper JWT authentication

***

## What’s in This Project

- **Backend (Python/FastAPI)**
  - `/backend/main.py`  
    FastAPI app with modular routers for user and chat endpoints (CORS enabled for frontend).
  - `/backend/ai.py`  
    Handles `/ask` AI queries using OpenAI (if API key present), or returns safe mock answers and insights.
  - `/backend/db.py`  
    Efficient MySQL connection pooling.
  - `/backend/data.sql`  
    MySQL schema: user accounts (hashed passwords), sessions, and chat messages.
  - `/backend/users.py`  
    Secure registration, login, and session lookup; bcrypt hashing; JWT auth for protected routes.
  - `/backend/routes/chat_routes.py`  
    Endpoints for creating chat sessions, adding & fetching messages. **Supports "New Chat" from frontend.**
  - `/backend/models/models.py`  
    Pydantic models for sessions and chat messages.
  - `/backend/data/mock_financial_data.json`  
    Example data to test insights when OpenAI is not available.

- **Frontend (React + Material-UI)**
  - Full authentication: JWT session storage, login, registration, auto-token management
  - "New Chat" support with session creation in sidebar
  - Permission toggling for categories (Assets, Liabilities, Transactions, Investments, EPF, Credit Score); sent with every AI query
  - Markdown-formatted messages, insights display, dark/light theme toggle
  - Modular: `App.js`, `ChatComponent.js`, `InsightsDisplay.js`, `PermissionToggle.js`, `SideMenu.js`, `AuthContext.js`, `apiService.js`
  - Clean CSS for chat bubbles, markdown rendering, sidebar, etc.

***

## Setup Instructions

**Requirements:**  
- Python 3.11+, Node.js 18+, MySQL 8+  
- Recommended: [pipenv](https://pipenv.pypa.io/) or [venv], npm

**Backend Setup**
```bash
# 1. Create and activate a Python virtual environment
python3.11 -m venv my_venv
# Windows PowerShell
.\my_venv\Scripts\Activate.ps1

# 2. Install dependencies
pip install -r requirements.txt

# 3. Create MySQL database and tables
mysql -u root -p < data.sql      # (This creates database 'finance_assistant')

# 4. Set up .env file in /backend with at least:
# OPENAI_API_KEY=your_openai_key_here   (optional, for actual AI answer)
# SECRET_KEY=your_very_secret_key

# 5. Run the FastAPI server
python main.py
# By default, runs on http://localhost:8000
```

**Frontend Setup**
```bash
# 1. Go to interface folder and install dependencies
cd interface
npm install

# 2. Start the React dev server
npm start
# Runs on http://localhost:3000
```
If your FastAPI backend runs on another host/port, set `REACT_APP_BASE_URL` in your environment.

***

## Usage/Features

- **Register or login** (JWT-based; passwords securely hashed using bcrypt)
- **Start a New Chat**  
  - Use the 🛈 hamburger/side menu and hit "New Chat" (creates new backend chat session, visible in sidebar)
- **Switch Chat Sessions**  
  - From the sidebar, click existing chat titles to load prior messages
- **Send Queries to Finance Assistant**
  - Permissions (Assets, Liabilities, etc.) can be toggled per chat/session
- **AI Responses**  
  - If OpenAI API key is configured, actual AI-powered response; otherwise, safe canned answer + example insights
- **Dark/Light Theme** and responsive Material-UI styling
- **All chat data, messages, and sessions are persisted in MySQL (except when running with mock/demo setup)**

***

## Backend Structure

| File / Folder              | Purpose                                 |
|--------------------------- |-----------------------------------------|
| `main.py`                  | FastAPI app entry, CORS + router mount  |
| `ai.py`                    | /ask endpoint, OpenAI fallback          |
| `db.py`                    | MySQL connection pooling                |
| `users.py`                 | Auth (register/login/token/session)     |
| `routes/chat_routes.py`    | Session, message, chat logic            |
| `models/models.py`         | Pydantic models for chat/session        |
| `data.sql`                 | MySQL schema                            |
| `data/mock_financial_data.json` | Mock data for testing             |

***

## Frontend Structure

| File / Folder       | Purpose                                |
|-------------------- |----------------------------------------|
| `src/App.js`        | Main app: handles session state, UI     |
| `src/apiService.js` | REST API bridge for backend             |
| `src/AuthContext.js`| JWT token management hook/context       |
| `src/ChatComponent.js` | Chat window UI, Markdown, bubbles    |
| `src/InsightsDisplay.js`| Shows insights from backend         |
| `src/PermissionToggle.js`| Toggle finance data access         |
| `src/SideMenu.js`   | Hamburger + sidebar, session listing    |
| `src/Login.js`      | Login UI                               |
| `src/Register.js`   | Registration UI                        |

***

## Security and Next Steps

- For any **production** use:  
  - Lock down CORS origins
  - Use HTTPS and strong SECRET_KEY  
  - Never expose OpenAI/private API keys to frontend
  - Add further auth (OAuth2, SSO, etc.) if exposing actual user data
- **Tests and Type Checking**: Add pytest/unit tests (Python), ESLint/TypeScript (JS)
- **Expand AI Logic**: Swap mock for real insights, connect OpenAI, or extend to your financial logic/rules as desired

***

**Contributions, bug reports, or enhancement requests welcome!**

***
