import { describe, expect, it } from 'vitest';
import { formatAdminDateTime, formatAdminId, formatAdminMoney, statusPresentation } from './admin-presentation';

describe('admin presentation', () => {
  it('formats Vietnamese operational values consistently', () => {
    expect(formatAdminMoney(1250000)).toContain('1.250.000');
    expect(formatAdminMoney(null)).toBe('—');
    expect(formatAdminId('dbe23374-a97a-4aa0-94d6-31ad37b8d202')).toBe('DBE23374');
    expect(formatAdminDateTime(null)).toBe('—');
  });

  it('maps domain statuses to one semantic tone', () => {
    expect(statusPresentation('COMPLETED')).toEqual({ label: 'Hoàn tất', tone: 'success' });
    expect(statusPresentation('AWAITING_EVIDENCE')).toEqual({ label: 'Chờ bằng chứng', tone: 'danger' });
    expect(statusPresentation('IN_PROGRESS')).toEqual({ label: 'Đang thực hiện', tone: 'info' });
    expect(statusPresentation('CUSTOM_STATE')).toEqual({ label: 'Custom state', tone: 'neutral' });
  });
});
