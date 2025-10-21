import {jwtDecode} from "jwt-decode"; // ✅ correct import

const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:8000";
const API_BASE = `${BASE_URL}/api`;

const getToken = () => localStorage.getItem("token");

const request = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }

  return res.json();
};

// Decode JWT to get user email
function getUserFromToken(token) {
  if (!token) return null;
  const decoded = jwtDecode(token);
  return { email: decoded.sub };
}

// ---------------------------
// Chat sessions
// ---------------------------

// Fetch all sessions for the logged-in user
export async function fetchSessions(token) {
  if (!token) throw new Error("No token provided");

  const res = await fetch(`${API_BASE}/chat/sessions/user`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Failed to fetch sessions");
  return await res.json();
}

// Create a new session for the logged-in user
export async function createSession(token, title) {
  if (!token) throw new Error("No token provided");

  const res = await fetch(`${API_BASE}/chat/create_session`, {
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
  const res = await fetch(`${API_BASE}/chat/messages/${sessionId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch messages");
  return await res.json();
}

// Add a message to a session
export async function addMessage(sessionId, sender, text, token) {
  const res = await fetch(`${API_BASE}/chat/add_message`, {
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

export async function register(email, username, password) {
  const res = await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, username, password }),
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export async function login(email, password) {
  const params = new URLSearchParams();
  params.append("username", email);
  params.append("password", password);

  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  if (data.access_token) {
    localStorage.setItem("token", data.access_token);
  }
  return data;
}

// ---------------------------
// AI Assistant
// ---------------------------

export async function askFinanceAssistant(query, token) {
  const res = await fetch(`${API_BASE}/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}


// Update session title
export async function updateChatTitle(sessionId, title, token) {
  const res = await fetch(`${API_BASE}/chat/sessions/${sessionId}/title`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to update title");
  }
  return await res.json();
}

// Delete session
export async function deleteChatSession(sessionId, token) {
  const res = await fetch(`${API_BASE}/chat/sessions/${sessionId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to delete session");
  }
  return { success: true };
}

export default {}; // Export an empty object for now, as apiService is not used directly. Functions are exported individually.