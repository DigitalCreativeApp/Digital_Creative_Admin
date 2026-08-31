import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/admin.service';
import type { Dashboard } from '../../types/admin.types';
import { ErrorState, LoadingState } from '../../components/AsyncState';
import { AdminPageHeader, KpiCard, StatusBadge } from '../../components/admin/AdminUi';
import { formatAdminDateTime, formatAdminId, formatAdminMoney, formatAdminNumber } from '../../utils/admin-presentation';
import { dashboardActionLabel, dashboardAttention } from './dashboard-presentation';

export function DashboardPage() {
  const [data, setData] = useState<Dashboard>();
  const [error, setError] = useState('');
  const load = () => { setError(''); adminService.dashboard().then(setData).catch(reason => setError(reason.message)); };
  useEffect(load, []);
  if (error) return <ErrorState message={error} retry={load} />;
  if (!data) return <LoadingState variant="dashboard" />;

  const attention = dashboardAttention(data);
  return <div className="ops-dashboard">
    <AdminPageHeader eyebrow="Trung tâm điều hành" title="Tổng quan vận hành" description="Theo dõi sức khỏe marketplace, xử lý hàng đợi rủi ro và đối soát dòng tiền từ dữ liệu trực tiếp." status={<StatusBadge label="Dữ liệu trực tiếp" tone="success"/>}/>

    <section aria-labelledby="marketplace-heading"><SectionHeading id="marketplace-heading" title="Marketplace" description="Quy mô hiện tại và các luồng đang hoạt động."/><div className="ops-kpi-grid">
      <KpiCard label="Tài khoản hoạt động" value={formatAdminNumber(data.activeAccounts)} helper={`${formatAdminNumber(data.users)} hồ sơ người dùng`} tone="success" to="/resources/accounts"/>
      <KpiCard label="Dự án đang mở" value={formatAdminNumber(data.openProjects)} helper={`${formatAdminNumber(data.projects)} dự án toàn hệ thống`} tone="info" to="/resources/projects"/>
      <KpiCard label="Dịch vụ đang hoạt động" value={formatAdminNumber(data.activeServices)} helper={`${formatAdminNumber(data.services)} dịch vụ toàn hệ thống`} tone="info" to="/resources/services"/>
      <KpiCard label="Work Order đang chạy" value={formatAdminNumber(data.activeWorkOrders)} helper={`${formatAdminNumber(data.workOrders)} Work Order tổng cộng`} tone="warning" to="/resources/workorders"/>
    </div></section>

    <div className="ops-dashboard-columns">
      <section className="ops-panel" aria-labelledby="attention-heading"><SectionHeading id="attention-heading" title="Cần xử lý" description="Hàng đợi được sắp theo số lượng hồ sơ hiện tại."/><div className="ops-attention-list">{attention.map(item => <Link to={item.to} key={item.label}><StatusBadge label={item.count ? `${formatAdminNumber(item.count)} hồ sơ` : 'Không có'} tone={item.count ? item.tone : 'neutral'}/><span><strong>{item.label}</strong><small>{item.count ? 'Mở hàng đợi và tiếp tục xử lý' : 'Không có hồ sơ tồn đọng'}</small></span><span aria-hidden="true">→</span></Link>)}</div></section>
      <section className="ops-panel" aria-labelledby="activity-heading"><SectionHeading id="activity-heading" title="Hoạt động gần đây" description="Các thay đổi quản trị được ghi nhận trong Audit Log."/>{data.recentActivity.length ? <ol className="ops-activity-list">{data.recentActivity.map(item => <li key={item.id}><span className="ops-activity-mark" aria-hidden="true"/><div><strong>{dashboardActionLabel(item.action)}</strong><span>{item.entityType}{item.entityId ? ` · ${formatAdminId(item.entityId)}` : ''}</span><small>{item.actor} · {formatAdminDateTime(item.createdAt)}</small></div></li>)}</ol> : <div className="ops-inline-empty">Chưa có hoạt động quản trị được ghi nhận.</div>}</section>
    </div>

    <section className="ops-panel ops-finance" aria-labelledby="finance-heading"><SectionHeading id="finance-heading" title="Dòng tiền nền tảng" description={`${formatAdminNumber(data.transactions)} giao dịch được ghi nhận.`}/><div className="ops-finance-grid"><FinanceValue label="Số dư khả dụng" value={data.availableUserBalance}/><FinanceValue label="Tiền đang giữ" value={data.escrowBalance}/><FinanceValue label="Chờ rút" value={data.pendingWithdrawal} helper={`${formatAdminNumber(data.pendingWithdrawalCount)} yêu cầu`}/><FinanceValue label="Đã rút" value={data.completedWithdrawal}/><FinanceValue label="Doanh thu nền tảng" value={data.platformRevenue}/></div><Link className="ops-panel-link" to="/resources/wallettransactions">Mở sổ giao dịch →</Link></section>
  </div>;
}

function SectionHeading({ id, title, description }: { id:string;title:string;description:string }) {
  return <header className="ops-section-heading"><div><h2 id={id}>{title}</h2><p>{description}</p></div></header>;
}

function FinanceValue({ label, value, helper }: { label:string;value:number;helper?:string }) {
  return <article><span>{label}</span><strong>{formatAdminMoney(value)}</strong>{helper ? <small>{helper}</small> : null}</article>;
}
