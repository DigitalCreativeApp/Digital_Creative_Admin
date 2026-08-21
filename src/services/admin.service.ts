import { apiRequest, uploadRequest } from './api-client';
import type { AdminOverview, AdminPage, AdminRecord, AdminResource, BulkResult, Dashboard, PlatformFeeSetting, WithdrawalDetail, WithdrawalFilters, WithdrawalPage, WithdrawalStatistics } from '../types/admin.types';
import { resourcePath } from './resource-path';
export const adminService = {
  dashboard: () => apiRequest<Dashboard>('/api/admin/dashboard'),
  platformFee: () => apiRequest<PlatformFeeSetting>('/api/admin/settings/platform-fee'),
  updatePlatformFee: (percentage: number) => apiRequest<PlatformFeeSetting>('/api/admin/settings/platform-fee', { method: 'PUT', body: JSON.stringify({ percentage }) }),
  withdrawals: (filters: WithdrawalFilters) => {
    const query = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => { if (value !== undefined && value !== '') query.set(key, String(value)); });
    return apiRequest<WithdrawalPage>(`/api/admin/withdrawals?${query}`);
  },
  withdrawalStatistics: () => apiRequest<WithdrawalStatistics>('/api/admin/withdrawals/statistics'),
  withdrawal: (id: string) => apiRequest<WithdrawalDetail>(`/api/admin/withdrawals/${id}`),
  startWithdrawal: (id: string) => apiRequest<WithdrawalDetail>(`/api/admin/withdrawals/${id}/start-processing`, { method: 'POST' }),
  rejectWithdrawal: (id: string, reason: string) => apiRequest<WithdrawalDetail>(`/api/admin/withdrawals/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) }),
  failWithdrawal: (id: string, reason: string, fundsMayHaveTransferred: boolean) => apiRequest<WithdrawalDetail>(`/api/admin/withdrawals/${id}/fail`, { method: 'POST', body: JSON.stringify({ reason, fundsMayHaveTransferred }) }),
  completeWithdrawal: (id: string, bankTransactionReference: string, adminNote: string) => apiRequest<WithdrawalDetail>(`/api/admin/withdrawals/${id}/complete`, { method: 'POST', body: JSON.stringify({ bankTransactionReference, adminNote }) }),
  uploadWithdrawalReceipt: (id: string, file: File) => { const form = new FormData(); form.append('file', file); return uploadRequest<WithdrawalDetail>(`/api/admin/withdrawals/${id}/receipt`, form); },
  resources: () => apiRequest<AdminResource[]>('/api/admin/resources'),
  page: (key: string, page: number, pageSize: number, search: string, deleted: string, sort: string, descending: boolean) => apiRequest<AdminPage>(`${resourcePath(key)}?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(search)}&deleted=${deleted}&sort=${encodeURIComponent(sort)}&descending=${descending}`),
  record: (key: string, id: string) => apiRequest<AdminRecord>(resourcePath(key, id)),
  overview: (key: string, id: string) => apiRequest<AdminOverview>(`${resourcePath(key, id)}/overview`),
  create: (key: string, values: Record<string, unknown>) => apiRequest<AdminRecord>(resourcePath(key), { method: 'POST', body: JSON.stringify({ values }) }),
  update: (key: string, id: string, values: Record<string, unknown>) => apiRequest<AdminRecord>(resourcePath(key, id), { method: 'PATCH', body: JSON.stringify({ values }) }),
  softDelete: (key: string, id: string) => apiRequest(`${resourcePath(key, id)}/soft-delete`, { method: 'PATCH' }),
  restore: (key: string, id: string) => apiRequest<AdminRecord>(`${resourcePath(key, id)}/restore`, { method: 'PATCH' }),
  bulk: (key: string, action: 'soft-delete' | 'restore', ids: string[]) => apiRequest<BulkResult>(`${resourcePath(key)}/bulk/${action}`, { method: 'POST', body: JSON.stringify({ ids }) }),
  uploadImage: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return uploadRequest<{ publicUrl: string }>('/api/admin/media/images', form);
  }
};
