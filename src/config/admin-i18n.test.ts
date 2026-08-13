import { describe, expect, it } from 'vitest';
import { fieldHint, fieldLabel } from './admin-i18n';

describe('campaign field presentation', () => {
  it('uses clear Vietnamese labels for campaign fields', () => {
    expect(fieldLabel('CallToAction')).toBe('Nội dung nút kêu gọi');
    expect(fieldLabel('StartsAt')).toBe('Ngày bắt đầu');
    expect(fieldLabel('EndsAt')).toBe('Ngày kết thúc');
    expect(fieldLabel('TargetUrl')).toBe('Đường dẫn khi bấm nút');
    expect(fieldLabel('IsFeatured')).toBe('Hiển thị nổi bật');
  });

  it('explains campaign fields in plain language', () => {
    expect(fieldHint('CallToAction')).toContain('Tham gia ngay');
    expect(fieldHint('StartsAt')).toContain('nhập');
    expect(fieldHint('TargetUrl')).toContain('mở');
  });

  it('labels profession icon uploads clearly', () => {
    expect(fieldLabel('IconUrl')).toBe('Biểu tượng');
  });
});
