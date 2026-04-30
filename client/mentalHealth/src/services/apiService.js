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
  console.log(`📤 POST ${API_BASE_URL}${path}`);
  console.log('📦 Body:', body);
  
  try {
    const headers = await getAuthHeaders();
    console.log('🔑 Headers:', headers);
    
    const res = await fetch(`${API_BASE_URL}${path}`, { 
      method: 'POST', 
      headers, 
      body: JSON.stringify(body) 
    });
    
    console.log(`📥 Response status: ${res.status}`);
    const result = await handle(res);
    console.log('✅ Result:', result);
    return result;
  } catch (error) {
    console.error(`❌ POST ${path} failed:`, error.message);
    throw error;
  }
};

export const apiGet = async (path) => {
  console.log(`📤 GET ${API_BASE_URL}${path}`);
  
  try {
    const headers = await getAuthHeaders();
    console.log('🔑 Headers:', headers);
    
    const res = await fetch(`${API_BASE_URL}${path}`, { 
      method: 'GET', 
      headers 
    });
    
    console.log(`📥 Response status: ${res.status}`);
    const result = await handle(res);
    console.log('✅ Result:', result);
    return result;
  } catch (error) {
    console.error(`❌ GET ${path} failed:`, error.message);
    throw error;
  }
};

export const apiPut = async (path, body) => {
  console.log(`📤 PUT ${API_BASE_URL}${path}`);
  
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}${path}`, { 
      method: 'PUT', 
      headers, 
      body: JSON.stringify(body) 
    });
    
    console.log(`📥 Response status: ${res.status}`);
    return handle(res);
  } catch (error) {
    console.error(`❌ PUT ${path} failed:`, error.message);
    throw error;
  }
};

export const apiDelete = async (path) => {
  console.log(`📤 DELETE ${API_BASE_URL}${path}`);
  
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}${path}`, { 
      method: 'DELETE', 
      headers 
    });
    
    console.log(`📥 Response status: ${res.status}`);
    return handle(res);
  } catch (error) {
    console.error(`❌ DELETE ${path} failed:`, error.message);
    throw error;
  }
};