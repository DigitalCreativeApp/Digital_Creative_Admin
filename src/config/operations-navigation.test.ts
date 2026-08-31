import { describe, expect, it } from 'vitest';
import { operationsNavigation, operationsRouteLabel } from './operations-navigation';

describe('operations navigation', () => {
  it('exposes business modules instead of database groups', () => {
    const labels = operationsNavigation.flatMap(group => group.items.map(item => item.label));
    expect(labels).toEqual(expect.arrayContaining(['Người dùng', 'Dự án', 'Dịch vụ', 'Work Orders', 'Tài chính', 'Rút tiền', 'Báo cáo', 'Nhật ký']));
    expect(labels).not.toContain('Cơ sở dữ liệu');
  });

  it('resolves the most specific route label', () => {
    expect(operationsRouteLabel('/admin/withdrawals/123')).toBe('Rút tiền');
    expect(operationsRouteLabel('/admin/users')).toBe('Người dùng');
    expect(operationsRouteLabel('/')).toBe('Tổng quan');
  });
});
