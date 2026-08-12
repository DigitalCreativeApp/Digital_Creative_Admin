import { apiRequest, setAccessToken } from './api-client';
import type { LoginResponse } from '../types/admin.types';

export async function login(identifier: string, password: string) {
  const result = await apiRequest<LoginResponse>('/api/accounts/login', { method: 'POST', body: JSON.stringify({ identifier, password }) });
  if (!result.user || result.user.role.toLowerCase() !== 'admin') {
    setAccessToken(null);
    throw new Error('Tài khoản này không có quyền quản trị.');
  }
  setAccessToken(result.accessToken);
  return result.user;
}
export async function currentUser() {
  const user = await apiRequest<LoginResponse['user']>('/api/accounts/me');
  if (!user || user.role.toLowerCase() !== 'admin') throw new Error('Không có quyền quản trị.');
  return user;
}
export async function logout() { try { await apiRequest<void>('/api/accounts/logout', { method: 'POST' }); } finally { setAccessToken(null); } }
