import { beforeEach, describe, expect, it, vi } from 'vitest';
import { withdrawalStatusLabel, withdrawalStatusTone } from './withdrawal-status';

beforeEach(() => {
  vi.resetModules();
  vi.stubGlobal('sessionStorage', { getItem: () => 'token', setItem: vi.fn(), removeItem: vi.fn() });
});

describe('admin withdrawal workflow', () => {
  it('maps every shared backend status to Vietnamese presentation', () => {
    expect(withdrawalStatusLabel.PENDING).toBe('Chờ xử lý');
    expect(withdrawalStatusLabel.PROCESSING).toBe('Đang xử lý');
    expect(withdrawalStatusLabel.COMPLETED).toBe('Hoàn thành');
    expect(withdrawalStatusLabel.REJECTED).toBe('Từ chối');
    expect(withdrawalStatusLabel.FAILED).toBe('Thất bại');
    expect(withdrawalStatusLabel.CANCELLED).toBe('Đã hủy');
    expect(withdrawalStatusTone.FAILED).toBe('danger');
  });

  it('calls every dedicated withdrawal workflow endpoint', async () => {
    const fetchMock = vi.fn().mockImplementation(async () => Response.json({}));
    vi.stubGlobal('fetch', fetchMock);
    const { adminService } = await import('../../services/admin.service');

    await adminService.withdrawals({ page:1,pageSize:20,status:'PENDING' });
    await adminService.withdrawalStatistics();
    await adminService.withdrawal('withdrawal-id');
    await adminService.startWithdrawal('withdrawal-id');
    await adminService.rejectWithdrawal('withdrawal-id','reason');
    await adminService.failWithdrawal('withdrawal-id','reason',true);
    await adminService.completeWithdrawal('withdrawal-id','FT123','note');
    await adminService.uploadWithdrawalReceipt('withdrawal-id',new File(['receipt'],'receipt.pdf',{type:'application/pdf'}));

    const urls = fetchMock.mock.calls.map(([url])=>String(url));
    expect(urls.some(url=>url.includes('/api/admin/withdrawals?page=1&pageSize=20&status=PENDING'))).toBe(true);
    for (const path of ['statistics','withdrawal-id','start-processing','reject','fail','complete','receipt']) {
      expect(urls.some(url=>url.endsWith(path))).toBe(true);
    }
  });
});
