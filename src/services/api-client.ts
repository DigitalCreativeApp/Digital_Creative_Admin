import { env } from '../config/env';

const storage = typeof sessionStorage === 'undefined' ? null : sessionStorage;
let token: string | null = storage?.getItem('admin_access_token') ?? null;
let refreshPromise: Promise<boolean> | null = null;
export const setAccessToken = (value: string | null) => {
  token = value;
  if (value) storage?.setItem('admin_access_token', value);
  else storage?.removeItem('admin_access_token');
};

async function performTokenRefresh() {
  const response = await fetch(`${env.apiUrl}/api/accounts/refresh-token`, { method: 'POST', credentials: 'include' });
  if (!response.ok) {
    setAccessToken(null);
    return false;
  }
  const body = await response.json() as { accessToken: string };
  if (!body.accessToken) {
    setAccessToken(null);
    return false;
  }
  setAccessToken(body.accessToken);
  return true;
}

function refreshToken() {
  if (!refreshPromise) {
    refreshPromise = performTokenRefresh().finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

export async function apiRequest<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const headers = new Headers(init.headers);
  const requestToken = token;
  if (requestToken) headers.set('Authorization', `Bearer ${requestToken}`);
  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const response = await fetch(`${env.apiUrl}${path}`, { ...init, headers, credentials: 'include' });
  if (response.status === 401 && retry) {
    const recovered = requestToken !== token || await refreshToken();
    if (recovered) return apiRequest<T>(path, init, false);
  }
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Yêu cầu thất bại.' })) as { message?: string };
    throw new Error(error.message || `Yêu cầu thất bại (${response.status}).`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function uploadRequest<T>(path: string, form: FormData) {
  return apiRequest<T>(path, { method: 'POST', body: form });
}

export async function downloadRequest(path: string, retry = true): Promise<Blob> {
  const headers = new Headers();
  const requestToken = token;
  if (requestToken) headers.set('Authorization', `Bearer ${requestToken}`);
  const response = await fetch(`${env.apiUrl}${path}`, { headers, credentials: 'include' });
  if (response.status === 401 && retry) {
    const recovered = requestToken !== token || await refreshToken();
    if (recovered) return downloadRequest(path, false);
  }
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Không thể tải tài liệu.' })) as { message?: string };
    throw new Error(error.message || `Không thể tải tài liệu (${response.status}).`);
  }
  return response.blob();
}
