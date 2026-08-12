import { env } from '../config/env';

let token: string | null = sessionStorage.getItem('admin_access_token');
export const setAccessToken = (value: string | null) => {
  token = value;
  value ? sessionStorage.setItem('admin_access_token', value) : sessionStorage.removeItem('admin_access_token');
};

async function refreshToken() {
  const response = await fetch(`${env.apiUrl}/api/accounts/refresh-token`, { method: 'POST', credentials: 'include' });
  if (!response.ok) return false;
  const body = await response.json() as { accessToken: string };
  setAccessToken(body.accessToken);
  return true;
}

export async function apiRequest<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const headers = new Headers(init.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const response = await fetch(`${env.apiUrl}${path}`, { ...init, headers, credentials: 'include' });
  if (response.status === 401 && retry && await refreshToken()) return apiRequest<T>(path, init, false);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Yêu cầu thất bại.' })) as { message?: string };
    throw new Error(error.message || `Yêu cầu thất bại (${response.status}).`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
