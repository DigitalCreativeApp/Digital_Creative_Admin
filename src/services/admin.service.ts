import { apiRequest } from './api-client';
import type { AdminPage, AdminRecord, AdminResource, BulkResult, Dashboard } from '../types/admin.types';
import { resourcePath } from './resource-path';
export const adminService = {
  dashboard: () => apiRequest<Dashboard>('/api/admin/dashboard'),
  resources: () => apiRequest<AdminResource[]>('/api/admin/resources'),
  page: (key: string, page: number, pageSize: number, search: string, deleted: string, sort: string, descending: boolean) => apiRequest<AdminPage>(`${resourcePath(key)}?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(search)}&deleted=${deleted}&sort=${encodeURIComponent(sort)}&descending=${descending}`),
  record: (key: string, id: string) => apiRequest<AdminRecord>(resourcePath(key, id)),
  create: (key: string, values: Record<string, unknown>) => apiRequest<AdminRecord>(resourcePath(key), { method: 'POST', body: JSON.stringify({ values }) }),
  update: (key: string, id: string, values: Record<string, unknown>) => apiRequest<AdminRecord>(resourcePath(key, id), { method: 'PATCH', body: JSON.stringify({ values }) }),
  softDelete: (key: string, id: string) => apiRequest(`${resourcePath(key, id)}/soft-delete`, { method: 'PATCH' }),
  restore: (key: string, id: string) => apiRequest<AdminRecord>(`${resourcePath(key, id)}/restore`, { method: 'PATCH' }),
  bulk: (key: string, action: 'soft-delete' | 'restore', ids: string[]) => apiRequest<BulkResult>(`${resourcePath(key)}/bulk/${action}`, { method: 'POST', body: JSON.stringify({ ids }) })
};
