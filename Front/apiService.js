const BASE_URL = "http://localhost:8000";

export async function register(username, password) {
  const res = await fetch(`${BASE_URL}/api/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function login(username, password) {
  const res = await fetch(`${BASE_URL}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  console.log("JWT:", data.access_token);
  return data;
}

export async function askFinanceAssistant(query, permissions, token) {
  if (!token) throw new Error("No token provided");
  const res = await fetch(`${BASE_URL}/api/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ query, permissions })
  });
  if (!res.ok) throw new Error("Failed to get answer");
  return res.json();
}
