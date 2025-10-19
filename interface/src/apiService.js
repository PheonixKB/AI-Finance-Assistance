// frontend/src/apiService.js
import {jwtDecode} from "jwt-decode"; // ✅ correct import

const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:8000";
const API_BASE = `${BASE_URL}/chat`;
const API_AUTH = `${BASE_URL}/api`;

// Decode JWT to get username
function getUserFromToken(token) {
  if (!token) return null;
  const decoded = jwtDecode(token);
  return { username: decoded.sub };
}

// ---------------------------
// Chat sessions
// ---------------------------

// Fetch all sessions for the logged-in user
export async function fetchSessions(token) {
  if (!token) throw new Error("No token provided");

  const user = getUserFromToken(token);
  const res = await fetch(`${API_BASE}/sessions/${user.username}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Failed to fetch sessions");
  return await res.json();
}

// Create a new session for the logged-in user
export async function createSession(token, title) {
  if (!token) throw new Error("No token provided");

  const res = await fetch(`${API_BASE}/create_session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to create session");
  }

  return await res.json();
}


// Fetch messages in a session
export async function fetchMessages(sessionId, token) {
  const res = await fetch(`${API_BASE}/messages/${sessionId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch messages");
  return await res.json();
}

// Add a message to a session
export async function addMessage(sessionId, sender, text, token) {
  const res = await fetch(`${API_BASE}/add_message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ session_id: sessionId, sender, text }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to send message");
  }

  return await res.json();
}

// ---------------------------
// Auth
// ---------------------------

export async function register(username, password) {
  const res = await fetch(`${API_AUTH}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export async function login(username, password) {
  const params = new URLSearchParams();
  params.append("username", username);
  params.append("password", password);

  const res = await fetch(`${API_AUTH}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json(); // { access_token, token_type }
}

// ---------------------------
// AI Assistant
// ---------------------------

export async function askFinanceAssistant(query, permissions, token) {
  const res = await fetch(`${API_AUTH}/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, permissions }),
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}
