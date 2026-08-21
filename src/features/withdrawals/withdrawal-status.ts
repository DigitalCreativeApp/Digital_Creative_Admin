import type { WithdrawalStatus } from '../../types/admin.types';

export const withdrawalStatusLabel: Record<WithdrawalStatus, string> = {
  PENDING: 'Chờ xử lý',
  PROCESSING: 'Đang xử lý',
  COMPLETED: 'Hoàn thành',
  REJECTED: 'Từ chối',
  FAILED: 'Thất bại',
  CANCELLED: 'Đã hủy',
};

export const withdrawalStatusTone: Record<WithdrawalStatus, string> = {
  PENDING: 'warning',
  PROCESSING: 'info',
  COMPLETED: 'success',
  REJECTED: 'danger',
  FAILED: 'danger',
  CANCELLED: 'neutral',
};

export const withdrawalAuditLabel: Record<string, string> = {
  'withdrawal.created': 'Creative gửi yêu cầu rút tiền',
  'withdrawal.processing_started': 'Admin bắt đầu xử lý',
  'withdrawal.receipt_uploaded': 'Admin tải biên lai',
  'withdrawal.completed': 'Admin xác nhận đã chuyển tiền',
  'withdrawal.rejected': 'Admin từ chối yêu cầu',
  'withdrawal.failed': 'Admin đánh dấu xử lý thất bại',
};
