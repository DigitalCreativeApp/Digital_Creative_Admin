import type { DisputeCategory, DisputeResolution, DisputeStatus } from '../../types/admin.types';

export const disputeStatusLabel: Record<DisputeStatus,string> = {
  OPEN:'Đang mở',UNDER_REVIEW:'Đang xem xét',NEEDS_INFORMATION:'Cần thêm thông tin',RESOLVED_CLIENT:'Đã xử lý cho người thuê',
  RESOLVED_CREATIVE:'Đã xử lý cho nhà sáng tạo',PARTIAL_REFUND:'Đã hoàn một phần',CLOSED:'Đã đóng',AWAITING_RESPONSE:'Chờ phản hồi',
  NEGOTIATING:'Đang thương lượng',ESCALATED:'Đã chuyển quản trị',AWAITING_EVIDENCE:'Chờ bổ sung bằng chứng',RESOLVED:'Đã giải quyết',CANCELLED:'Đã hủy',
};
export const disputeCategoryLabel: Record<DisputeCategory,string> = {
  NOT_DELIVERED:'Không bàn giao',NOT_AS_DESCRIBED:'Không đúng mô tả',PAYMENT:'Thanh toán',BEHAVIOR:'Hành vi',OTHER:'Khác',
  SCOPE:'Phạm vi công việc',DELAYED:'Chậm tiến độ',QUALITY:'Chất lượng',COMPLETION:'Hoàn thành',CANCELLATION:'Hủy công việc',
};
export const disputeResolutionLabel: Record<DisputeResolution,string> = {
  CONTINUE_WORK:'Tiếp tục công việc',CANCEL_AND_REFUND:'Hủy và hoàn toàn bộ',CANCEL_AND_PARTIAL_SETTLEMENT:'Hủy và chia tiền',PAY_CREATOR_AND_CLOSE:'Thanh toán nhà sáng tạo và đóng',
};
export const activeDisputeStatuses = new Set<DisputeStatus>(['OPEN','UNDER_REVIEW','NEEDS_INFORMATION','AWAITING_RESPONSE','NEGOTIATING','ESCALATED','AWAITING_EVIDENCE']);
export const disputeStatusTone = (status: DisputeStatus) => status === 'RESOLVED' ? 'success' : status === 'ESCALATED' || status === 'AWAITING_EVIDENCE' ? 'danger' : activeDisputeStatuses.has(status) ? 'warning' : 'neutral';
export const formatVnd = (value: number) => `${Math.round(value).toLocaleString('vi-VN')} ₫`;
export const formatDate = (value: string | null) => value ? new Intl.DateTimeFormat('vi-VN',{dateStyle:'short',timeStyle:'short'}).format(new Date(value)) : '—';
