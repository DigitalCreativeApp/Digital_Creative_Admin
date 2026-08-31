import { apiRequest, downloadRequest, uploadRequest } from './api-client';
import type { AdminOverview, AdminPage, AdminRecord, AdminResource, AdminUserDetail, AdminUserFilters, AdminUserListItem, AgreementAcceptancePage, AgreementVersionInput, AgreementVersionUpdate, BulkResult, Dashboard, DisputeDetail, DisputeFilters, DisputePage, DisputeResolution, OperationPage, PlatformAgreement, PlatformAgreementVersion, PlatformFeeSetting, WithdrawalDetail, WithdrawalFilters, WithdrawalPage, WithdrawalStatistics } from '../types/admin.types';
import { resourcePath } from './resource-path';
export const adminService = {
  dashboard: () => apiRequest<Dashboard>('/api/admin/dashboard'),
  users: (filters: AdminUserFilters) => {
    const query = new URLSearchParams();
    Object.entries(filters).forEach(([key,value]) => { if (value !== undefined && value !== '') query.set(key,String(value)); });
    return apiRequest<OperationPage<AdminUserListItem>>(`/api/admin/operations/users?${query}`);
  },
  user: (accountId:string) => apiRequest<AdminUserDetail>(`/api/admin/operations/users/${accountId}`),
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
  disputes: (filters: DisputeFilters) => {
    const query = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => { if (value !== undefined && value !== '') query.set(key, String(value)); });
    return apiRequest<DisputePage>(`/api/admin/disputes?${query}`);
  },
  dispute: (id: string) => apiRequest<DisputeDetail>(`/api/admin/disputes/${id}`),
  requestDisputeEvidence: (id: string, reason: string) => apiRequest(`/api/admin/disputes/${id}/request-evidence`, { method: 'POST', body: JSON.stringify({ reason }) }),
  resolveDispute: (id: string, resolution: DisputeResolution, proposedCreatorAmount: number | null, reason: string) => apiRequest(`/api/admin/disputes/${id}/resolve`, { method: 'POST', body: JSON.stringify({ resolution, proposedCreatorAmount, reason }) }),
  platformAgreements: () => apiRequest<PlatformAgreement[]>('/api/admin/platform-agreements'),
  agreementVersion: (id: string) => apiRequest<PlatformAgreementVersion>(`/api/admin/platform-agreement-versions/${id}`),
  createAgreementVersion: (agreementId: string, input: AgreementVersionInput) => apiRequest<PlatformAgreementVersion>(`/api/admin/platform-agreements/${agreementId}/versions`, { method: 'POST', body: JSON.stringify(input) }),
  updateAgreementVersion: (id: string, input: AgreementVersionUpdate) => apiRequest<PlatformAgreementVersion>(`/api/admin/platform-agreement-versions/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
  publishAgreementVersion: (id: string) => apiRequest<PlatformAgreementVersion>(`/api/admin/platform-agreement-versions/${id}/publish`, { method: 'POST' }),
  cloneAgreementVersion: (id: string, version: string) => apiRequest<PlatformAgreementVersion>(`/api/admin/platform-agreement-versions/${id}/clone`, { method: 'POST', body: JSON.stringify({ version }) }),
  agreementAcceptances: (id: string, page: number, pageSize: number, search = '') => {
    const query = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (search.trim()) query.set('search', search.trim());
    return apiRequest<AgreementAcceptancePage>(`/api/admin/platform-agreement-versions/${id}/acceptances?${query}`);
  },
  agreementDocument: (acceptanceId: string) => downloadRequest(`/api/admin/platform-agreement-acceptances/${acceptanceId}/document`),
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
