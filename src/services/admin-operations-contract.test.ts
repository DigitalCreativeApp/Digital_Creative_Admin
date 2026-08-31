import { afterEach, describe, expect, it, vi } from 'vitest';
import { adminService } from './admin.service';

afterEach(() => vi.unstubAllGlobals());

describe('admin operations API contract', () => {
  it('sends user pagination and filters to the bounded operations endpoint', async () => {
    const calls:string[] = [];
    vi.stubGlobal('fetch', vi.fn(async (input:RequestInfo|URL) => {
      calls.push(String(input));
      return new Response(JSON.stringify({ items:[], page:1, pageSize:20, total:0 }), { status:200, headers:{ 'Content-Type':'application/json' } });
    }));

    await adminService.users({ page:1, pageSize:20, search:'lan', role:'CREATIVE', status:'ACTIVE' });
    await adminService.user('account-id');
    await adminService.projects({ page:1,pageSize:20,status:'OPEN' });
    await adminService.services({ page:1,pageSize:20,status:'ACTIVE' });
    await adminService.workOrders({ page:1,pageSize:20,status:'IN_PROGRESS' });

    expect(calls[0]).toContain('/api/admin/operations/users?page=1&pageSize=20&search=lan&role=CREATIVE&status=ACTIVE');
    expect(calls[1]).toContain('/api/admin/operations/users/account-id');
    expect(calls[2]).toContain('/api/admin/operations/projects?page=1&pageSize=20&status=OPEN');
    expect(calls[3]).toContain('/api/admin/operations/services?page=1&pageSize=20&status=ACTIVE');
    expect(calls[4]).toContain('/api/admin/operations/work-orders?page=1&pageSize=20&status=IN_PROGRESS');
  });
});
