// Tiny fetch-based client for the YazhSey Books API. Every call is prefixed
// with the API base URL and parses JSON, throwing a readable Error on a
// non-2xx response so callers can just try/catch.
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function handle(res) {
  if (res.status === 204) return null;
  let data = null;
  try { data = await res.json(); } catch { /* no/invalid JSON body */ }
  if (!res.ok) {
    throw new Error((data && data.message) || `Request failed (${res.status})`);
  }
  return data;
}

async function request(method, path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return handle(res);
}

// Income/Expense create & update send multipart form data so the optional
// attachment file can ride along with the other fields in one request.
async function requestForm(method, path, fields) {
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    formData.append(key, value);
  });
  const res = await fetch(`${BASE_URL}${path}`, { method, body: formData });
  return handle(res);
}

const api = {
  get: (path) => request("GET", path),
  post: (path, body) => request("POST", path, body),
  del: (path) => request("DELETE", path),
  postForm: (path, fields) => requestForm("POST", path, fields),
  putForm: (path, fields) => requestForm("PUT", path, fields),
};

export default api;
