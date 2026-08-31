import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AdminPageHeader, KpiCard, StatusBadge } from '../../components/admin/AdminUi';
import { ErrorState, LoadingState } from '../../components/AsyncState';
import { adminService } from '../../services/admin.service';
import type { AdminUserDetail } from '../../types/admin.types';
import { formatAdminDateTime, formatAdminId, formatAdminMoney } from '../../utils/admin-presentation';

export function UserDetailPage() {
  const { accountId = '' } = useParams();
  const [data,setData] = useState<AdminUserDetail>();
  const [error,setError] = useState('');
  const load = () => { setError('');adminService.user(accountId).then(setData).catch(cause => setError(cause.message)); };
  useEffect(load,[accountId]);
  if(error) return <ErrorState message={error} retry={load}/>;
  if(!data) return <LoadingState/>;
  return <div className="ops-detail-page"><Link className="detail-back" to="/admin/users">← Danh sách người dùng</Link><AdminPageHeader eyebrow={`Tài khoản ${formatAdminId(data.accountId)}`} title={data.displayName} description={`${data.email}${data.phone ? ` · ${data.phone}` : ''}`} status={<StatusBadge status={data.accountStatus}/>}/>
    <div className="ops-kpi-grid"><KpiCard label="Dự án đã tạo" value={data.projectCount}/><KpiCard label="Dịch vụ" value={data.serviceCount}/><KpiCard label="Work Orders" value={data.workOrderCount}/><KpiCard label="Số dư khả dụng" value={formatAdminMoney(data.availableBalance)} tone="success"/></div>
    <div className="ops-detail-columns"><section className="ops-panel"><h2>Hồ sơ & quyền truy cập</h2><dl className="ops-detail-list"><Detail label="Họ tên" value={data.fullName || data.displayName}/><Detail label="Vai trò" value={data.role}/><Detail label="Nghề nghiệp" value={data.jobTitle || '—'}/><Detail label="Khu vực" value={[data.province,data.country].filter(Boolean).join(', ') || '—'}/><Detail label="Xác minh" value={data.isVerified ? 'Đã xác minh' : 'Chưa xác minh'}/><Detail label="Sẵn sàng làm việc" value={data.isAvailableForWork ? 'Có' : 'Không'}/></dl></section><section className="ops-panel"><h2>Tài chính & hoạt động</h2><dl className="ops-detail-list"><Detail label="Tiền đang giữ" value={formatAdminMoney(data.lockedBalance)}/><Detail label="Chờ rút" value={formatAdminMoney(data.pendingWithdrawalBalance)}/><Detail label="Đăng nhập gần nhất" value={formatAdminDateTime(data.lastLoginAt)}/><Detail label="Ngày tham gia" value={formatAdminDateTime(data.createdAt)}/><Detail label="Account ID" value={data.accountId}/><Detail label="User ID" value={data.userId || '—'}/></dl></section></div>
    <details className="ops-technical"><summary>Thông tin kỹ thuật</summary><p>Trang này chỉ sử dụng DTO nghiệp vụ giới hạn; Notifications, token, mật khẩu và dữ liệu thiết bị không được tải.</p></details>
  </div>;
}
function Detail({label,value}:{label:string;value:string}) { return <div><dt>{label}</dt><dd>{value}</dd></div>; }
