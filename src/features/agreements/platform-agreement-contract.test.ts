import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => {
  vi.resetModules();
  vi.stubGlobal('sessionStorage', { getItem: () => 'token', setItem: vi.fn(), removeItem: vi.fn() });
});

describe('platform agreement admin API contract', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('uses dedicated lifecycle and acceptance endpoints', async () => {
    const calls: Array<{ url: string; method: string; body?: string }> = [];
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      calls.push({ url: String(input), method: init?.method ?? 'GET', body: init?.body as string | undefined });
      return new Response(JSON.stringify({}), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }));
    const { adminService } = await import('../../services/admin.service');

    await adminService.platformAgreements();
    await adminService.createAgreementVersion('agreement-id', {
      version: '1.1', summaryContent: 'Tóm tắt', fullContent: 'Điều 1',
      effectiveFrom: '2026-10-01T00:00:00Z', requiresReAcceptance: true,
    });
    await adminService.updateAgreementVersion('version-id', {
      summaryContent: 'Tóm tắt mới', fullContent: 'Điều 1 mới',
      effectiveFrom: '2026-10-01T00:00:00Z', requiresReAcceptance: true,
    });
    await adminService.publishAgreementVersion('version-id');
    await adminService.cloneAgreementVersion('version-id', '1.2');
    await adminService.agreementAcceptances('version-id', 2, 20, 'nguyen');

    expect(calls.map(call => [new URL(call.url).pathname + new URL(call.url).search, call.method])).toEqual([
      ['/api/admin/platform-agreements', 'GET'],
      ['/api/admin/platform-agreements/agreement-id/versions', 'POST'],
      ['/api/admin/platform-agreement-versions/version-id', 'PATCH'],
      ['/api/admin/platform-agreement-versions/version-id/publish', 'POST'],
      ['/api/admin/platform-agreement-versions/version-id/clone', 'POST'],
      ['/api/admin/platform-agreement-versions/version-id/acceptances?page=2&pageSize=20&search=nguyen', 'GET'],
    ]);
  });
});
