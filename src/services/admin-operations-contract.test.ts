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

    expect(calls[0]).toContain('/api/admin/operations/users?page=1&pageSize=20&search=lan&role=CREATIVE&status=ACTIVE');
  });
});
