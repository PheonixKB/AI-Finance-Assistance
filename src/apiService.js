// src/apiService.js

const BASE_URL = "http://localhost:8000";

export async function askFinanceAssistant(query, permissions) {
  const res = await fetch(`${BASE_URL}/api/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      permissions
    })
  });
  if (!res.ok) throw new Error("Failed to get answer");
  return res.json();
}

export async function pingBackend() {
  const res = await fetch(`${BASE_URL}/api/ping`);
  if (!res.ok) throw new Error("Backend unavailable");
  return res.json();
}
