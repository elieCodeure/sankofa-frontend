// src/api-services/apiClient.ts
// Client HTTP central — fetch natif, refresh automatique, queue.
// Adapté pour Django REST Framework SimpleJWT

import Cookies from 'js-cookie';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api';
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const COOKIE_OPTIONS = { secure: true, sameSite: 'strict' as const };

let isRefreshing = false;
let waitQueue: Array<(token: string | null) => void> = [];

function getToken(): string | null {
  return Cookies.get(ACCESS_TOKEN_KEY) || null;
}
function getRefreshToken(): string | null {
  return Cookies.get(REFRESH_TOKEN_KEY) || null;
}
function setTokens(access: string, refresh?: string): void {
  Cookies.set(ACCESS_TOKEN_KEY, access, COOKIE_OPTIONS);
  if (refresh) {
    Cookies.set(REFRESH_TOKEN_KEY, refresh, COOKIE_OPTIONS);
  }
}
function removeTokens(): void {
  Cookies.remove(ACCESS_TOKEN_KEY, COOKIE_OPTIONS);
  Cookies.remove(REFRESH_TOKEN_KEY, COOKIE_OPTIONS);
  Cookies.remove('user', COOKIE_OPTIONS);
}
function flushQueue(token: string | null): void {
  waitQueue.forEach((cb) => cb(token));
  waitQueue = [];
}
function buildHeaders(token?: string | null): HeadersInit {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const t = token !== undefined ? token : getToken();
  if (t) headers['Authorization'] = `Bearer ${t}`;
  return headers;
}

async function tryRefresh(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  try {
    const res = await fetch(`${BASE_URL}/accounts/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    setTokens(data.access);
    return data.access;
  } catch { 
    return null; 
  }
}

async function request<T>(method: string, path: string, body?: unknown, retry = true, customHeaders?: HeadersInit): Promise<T> {
  const url = `${BASE_URL}${path}`;
  
  // Handling FormData for file uploads
  const isFormData = body instanceof FormData;
  const headers = buildHeaders();
  
  if (isFormData) {
    // Let the browser set the Content-Type for FormData (with the correct boundary)
    delete (headers as any)['Content-Type'];
  }
  
  // Merge custom headers if any
  const finalHeaders = { ...headers, ...customHeaders };

  const res = await fetch(url, {
    method,
    headers: finalHeaders,
    body: isFormData ? (body as FormData) : (body !== undefined ? JSON.stringify(body) : undefined),
  });

  if (res.ok) {
    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
  }

  if (res.status === 401 && retry) {
    if (isRefreshing) {
      return new Promise<T>((resolve, reject) => {
        waitQueue.push(async (token) => {
          if (!token) { reject(new Error('Session expirée')); return; }
          try {
            const retryHeaders = buildHeaders(token);
            if (isFormData) delete (retryHeaders as any)['Content-Type'];
            const r = await fetch(url, { 
              method, 
              headers: { ...retryHeaders, ...customHeaders }, 
              body: isFormData ? (body as FormData) : (body !== undefined ? JSON.stringify(body) : undefined) 
            });
            if (!r.ok) reject(new Error(`HTTP ${r.status}`));
            else resolve(r.json() as Promise<T>);
          } catch (e) { reject(e); }
        });
      });
    }
    isRefreshing = true;
    const newToken = await tryRefresh();
    isRefreshing = false;
    
    if (!newToken) { 
      flushQueue(null); 
      removeTokens(); 
      window.location.href = '/auth'; 
      throw new Error('Session expirée'); 
    }
    
    flushQueue(newToken);
    return request<T>(method, path, body, false, customHeaders);
  }

  let msg = `HTTP ${res.status}`;
  try { 
    const e = await res.json(); 
    msg = e.detail ?? e.message ?? e.error ?? JSON.stringify(e) ?? msg; 
  } catch { /* no json */ }
  throw new Error(msg);
}

const apiClient = {
  get<T>(path: string): Promise<T> { return request<T>('GET', path); },
  post<T>(path: string, body?: unknown, headers?: HeadersInit): Promise<T> { return request<T>('POST', path, body, true, headers); },
  put<T>(path: string, body?: unknown, headers?: HeadersInit): Promise<T> { return request<T>('PUT', path, body, true, headers); },
  patch<T>(path: string, body?: unknown, headers?: HeadersInit): Promise<T> { return request<T>('PATCH', path, body, true, headers); },
  delete<T>(path: string): Promise<T> { return request<T>('DELETE', path); },
  setTokens, removeTokens, getToken,
};
export default apiClient;
