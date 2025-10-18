# AI-Finance-Assistance (updated demo)

This is an updated, minimal demo fork of the project you uploaded. Changes made:
- Backend: `main.py` rewritten to include a clearer FastAPI structure, permission filtering, input validation, and a simple builtin insights generator. Reads mock data from `data/mock_financial_data.json`.
- Frontend: React components fully implemented (`src/App.js`, `ChatComponent.js`, `InsightsDisplay.js`, `PermissionToggle.js`, `apiService.js`, `index.js`) using MUI composition. These components are minimal but runnable after installing dependencies.

How to run locally (backend):
```bash
python3 -m venv .venv
. .venv/bin/activate
pip install fastapi uvicorn
python main.py
```

How to run frontend (create-react-app / Vite):
- Place the `src/` folder into a React project (or run `npx create-react-app`) and start the dev server.
- Set `REACT_APP_API_BASE` if your backend runs on a different host than the dev server proxy.

Notes & next steps (recommended):
- Replace the demo insights with an actual AI integration (OpenAI, etc.) and implement secure server-side API key handling.
- Add unit tests and type checking (mypy / eslint).
- Lock down CORS to known origins in production.
- Add authentication before exposing potentially sensitive data.
