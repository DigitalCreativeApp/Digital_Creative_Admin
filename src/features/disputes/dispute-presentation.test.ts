import { beforeEach, describe, expect, it, vi } from 'vitest';
import { disputeResolutionLabel, disputeStatusLabel } from './dispute-presentation';
import detailPage from './DisputeDetailPage.tsx?raw';
import routes from '../../routes/AppRoutes.tsx?raw';
import layout from '../../layouts/AdminLayout.tsx?raw';
import flags from '../../config/feature-flags.ts?raw';

describe('quy trình quản trị tranh chấp', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('hiển thị trạng thái và quyết định bằng tiếng Việt', () => {
    expect(disputeStatusLabel.ESCALATED).toBe('Đã chuyển quản trị');
    expect(disputeStatusLabel.AWAITING_EVIDENCE).toBe('Chờ bổ sung bằng chứng');
    expect(disputeResolutionLabel.CONTINUE_WORK).toBe('Tiếp tục công việc');
    expect(disputeResolutionLabel.CANCEL_AND_PARTIAL_SETTLEMENT).toBe('Hủy và chia tiền');
  });

  it('gọi đúng API danh sách, yêu cầu bằng chứng và giải quyết', async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    vi.stubGlobal('fetch', vi.fn(async (url: string, init?: RequestInit) => {
      calls.push({ url, init });
      return new Response(JSON.stringify({}), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }));
    const { adminService } = await import('../../services/admin.service');
    await adminService.disputes({ page: 1, pageSize: 20, status: 'ESCALATED', search: 'DSP' });
    await adminService.requestDisputeEvidence('d1', 'Bổ sung ảnh bàn giao');
    await adminService.resolveDispute('d1', 'CANCEL_AND_PARTIAL_SETTLEMENT', 500000, 'Đối chiếu bằng chứng');
    expect(calls.some(x => x.url.includes('/api/admin/disputes?page=1&pageSize=20&status=ESCALATED&search=DSP'))).toBe(true);
    expect(calls.some(x => x.url.endsWith('/api/admin/disputes/d1/request-evidence'))).toBe(true);
    expect(calls.some(x => x.url.endsWith('/api/admin/disputes/d1/resolve'))).toBe(true);
  });

  it('tạm ẩn route và menu quản trị nhưng giữ nguyên implementation', () => {
    expect(flags).toMatch(/WORK_ORDER_DISPUTES_VISIBLE\s*=\s*false/);
    expect(routes).toContain('WORK_ORDER_DISPUTES_VISIBLE');
    expect(layout).toContain('WORK_ORDER_DISPUTES_VISIBLE');
    expect(detailPage).toContain('Yêu cầu bổ sung bằng chứng');
    expect(detailPage).toContain('Hoàn toàn bộ cho Người thuê');
    expect(detailPage).toContain('CONTINUE_WORK');
    expect(detailPage).toContain('Lý do xử lý');
    expect(detailPage).toContain('Lịch sử phương án');
    expect(detailPage).toContain('Lịch sử trạng thái');
  });
});
