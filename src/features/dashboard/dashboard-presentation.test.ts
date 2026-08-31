import { describe, expect, it } from 'vitest';
import { dashboardAttention } from './dashboard-presentation';

describe('dashboard attention queue', () => {
  it('prioritizes the largest real queue and preserves action routes', () => {
    const result = dashboardAttention({ overdueWorkOrders: 2, pendingReports: 7, activeDisputes: 3, pendingWithdrawalCount: 5 });
    expect(result.map(item => item.label)).toEqual(['Báo cáo chờ xử lý', 'Rút tiền chờ xử lý', 'Tranh chấp đang mở', 'Work Order quá hạn']);
    expect(result[0].to).toBe('/resources/reports');
  });
});
