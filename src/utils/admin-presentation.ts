export type AdminStatusTone = 'neutral' | 'info' | 'warning' | 'success' | 'danger';

const labels: Record<string, string> = {
  ACTIVE: 'Đang hoạt động', INACTIVE: 'Ngừng hoạt động', PENDING: 'Chờ xử lý', PROCESSING: 'Đang xử lý',
  IN_PROGRESS: 'Đang thực hiện', COMPLETED: 'Hoàn tất', SUCCEEDED: 'Thành công', APPROVED: 'Đã duyệt',
  VERIFIED: 'Đã xác minh', PUBLISHED: 'Đã xuất bản', ACCEPTED: 'Đã chấp nhận', OPEN: 'Đang mở',
  DRAFT: 'Bản nháp', SCHEDULED: 'Đã lên lịch', AWAITING_RESPONSE: 'Chờ phản hồi',
  AWAITING_EVIDENCE: 'Chờ bằng chứng', NEGOTIATING: 'Đang thương lượng', ESCALATED: 'Đã chuyển cấp',
  RESOLVED: 'Đã giải quyết', REJECTED: 'Đã từ chối', FAILED: 'Thất bại', CANCELLED: 'Đã hủy',
  SUSPENDED: 'Tạm khóa', BLOCKED: 'Đã khóa', ARCHIVED: 'Lưu trữ', SUPERSEDED: 'Phiên bản cũ',
};

const tones: Record<string, AdminStatusTone> = {
  ACTIVE: 'success', COMPLETED: 'success', SUCCEEDED: 'success', APPROVED: 'success', VERIFIED: 'success',
  PUBLISHED: 'success', ACCEPTED: 'success', PROCESSING: 'info', IN_PROGRESS: 'info', OPEN: 'info',
  NEGOTIATING: 'info', PENDING: 'warning', SCHEDULED: 'warning', AWAITING_RESPONSE: 'warning',
  DRAFT: 'neutral', INACTIVE: 'neutral', ARCHIVED: 'neutral', SUPERSEDED: 'neutral', RESOLVED: 'neutral',
  AWAITING_EVIDENCE: 'danger', ESCALATED: 'danger', REJECTED: 'danger', FAILED: 'danger',
  CANCELLED: 'danger', SUSPENDED: 'danger', BLOCKED: 'danger',
};

export function statusPresentation(status: string | null | undefined) {
  const key = (status || '').trim().toUpperCase();
  if (!key) return { label: 'Chưa xác định', tone: 'neutral' as const };
  return {
    label: labels[key] ?? key.toLowerCase().replaceAll('_', ' ').replace(/^./, value => value.toUpperCase()),
    tone: tones[key] ?? 'neutral',
  };
}

export function formatAdminMoney(value: number | null | undefined) {
  return value == null ? '—' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);
}

export function formatAdminNumber(value: number | null | undefined) {
  return value == null ? '—' : new Intl.NumberFormat('vi-VN').format(value);
}

export function formatAdminDateTime(value: string | null | undefined) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
}

export function formatAdminId(value: string | null | undefined) {
  return value ? value.split('-')[0].toUpperCase() : '—';
}
