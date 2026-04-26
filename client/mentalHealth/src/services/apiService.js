import { API_BASE_URL, getAuthHeaders } from '../config/api';

const handle = async (res) => {
  const text = await res.text();
  let body;
  try { body = text ? JSON.parse(text) : {}; } catch { body = { raw: text }; }

  if (!res.ok || body.success === false) {
    const msg = body?.error || body?.message || `Request failed (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  // Backend wraps everything as { success, data }
  return body.data !== undefined ? body.data : body;
};

export const apiPost = async (path, body) => {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}${path}`, { method: 'POST', headers, body: JSON.stringify(body) });
  return handle(res);
};

export const apiGet = async (path) => {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}${path}`, { method: 'GET', headers });
  return handle(res);
};

export const apiPut = async (path, body) => {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}${path}`, { method: 'PUT', headers, body: JSON.stringify(body) });
  return handle(res);
};

export const apiDelete = async (path) => {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}${path}`, { method: 'DELETE', headers });
  return handle(res);
};