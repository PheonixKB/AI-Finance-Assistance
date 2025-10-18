// src/apiService.js
const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:8000";

export async function register(username, password) {
  const res = await fetch(`${BASE_URL}/api/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Registration failed");
  }
  return res.json();
}

export async function login(username, password) {
  // OAuth2PasswordRequestForm expects application/x-www-form-urlencoded
  const params = new URLSearchParams();
  params.append("username", username);
  params.append("password", password);

  const res = await fetch(`${BASE_URL}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString()
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Login failed");
  }
  const data = await res.json();
  console.log("JWT:", data.access_token);
  return data;
}

export async function askFinanceAssistant(query, permissions, token) {
  if (!token) throw new Error("No token provided");
  const res = await fetch(`${BASE_URL}/api/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ query, permissions })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to get answer");
  }
  return res.json();
}
