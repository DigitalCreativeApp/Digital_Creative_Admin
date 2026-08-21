import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/admin.service';
import type { Dashboard } from '../../types/admin.types';
import { ErrorState, LoadingState } from '../../components/AsyncState';
import { AppIcon } from '../../components/AppIcon';

const metrics: { key: keyof Dashboard; label: string; hint: string; icon: string; tone: string }[] = [
  { key: 'activeAccounts', label: 'Tài khoản hoạt động', hint: 'Đang có quyền truy cập', icon: 'users', tone: 'purple' },
  { key: 'projects', label: 'Tổng dự án', hint: 'Mọi trạng thái dự án', icon: 'projects', tone: 'orange' },
  { key: 'services', label: 'Dịch vụ sáng tạo', hint: 'Dịch vụ trong hệ thống', icon: 'content', tone: 'blue' },
  { key: 'transactions', label: 'Giao dịch', hint: 'Bản ghi tài chính', icon: 'finance', tone: 'green' },
];

export function DashboardPage() {
  const [data, setData] = useState<Dashboard>(); const [error, setError] = useState('');
  const load = () => { setError(''); adminService.dashboard().then(setData).catch(reason => setError(reason.message)); };
  useEffect(load, []);
  if (error) return <ErrorState message={error} retry={load} />;
  if (!data) return <LoadingState variant="dashboard" />;
  return <>
    <section className="dashboard-hero"><div><span className="eyebrow">Trung tâm điều hành</span><h1>Tổng quan hệ thống</h1><p>Theo dõi dữ liệu và xử lý các hoạt động quan trọng trên Digital Creative.</p></div><div className="live-badge"><span/><div><strong>Dữ liệu trực tiếp</strong><small>Cập nhật từ PostgreSQL</small></div></div></section>
    <section className="metric-grid" aria-label="Chỉ số tổng quan">{metrics.map(item => <article className="metric-card" key={item.key}><div className={`metric-icon ${item.tone}`}><AppIcon name={item.icon}/></div><div className="metric-copy"><span>{item.label}</span><strong>{data[item.key].toLocaleString('vi-VN')}</strong><small>{item.hint}</small></div><span className="metric-line"/></article>)}</section>
    <section className="finance-overview" aria-label="Tổng quan tài chính"><header><div><span className="section-kicker">Tài chính</span><h2>Dòng tiền nền tảng</h2></div><Link to="/admin/withdrawals?status=pending">Xem yêu cầu rút tiền →</Link></header><div>{[['Số dư khả dụng',data.availableUserBalance],['Ký quỹ',data.escrowBalance],['Chờ rút',data.pendingWithdrawal],['Đã rút',data.completedWithdrawal],['Doanh thu nền tảng',data.platformRevenue]].map(([label,value])=><article key={String(label)}><span>{label}</span><strong>{formatVnd(Number(value))}</strong>{label==='Chờ rút'?<small>{data.pendingWithdrawalCount.toLocaleString('vi-VN')} yêu cầu</small>:null}</article>)}</div></section>
    <section className="dashboard-grid"><article className="overview-panel"><header><div><span className="section-kicker">Cơ sở dữ liệu</span><h2>Quy mô nền tảng</h2></div><span className="panel-badge">{data.resourceCount} nhóm dữ liệu</span></header><div className="database-visual"><div className="database-ring"><AppIcon name="database"/><strong>{compactNumber(data.totalRecords)}</strong><span>Tổng bản ghi</span></div><div className="database-breakdown"><DataRow label="Người dùng" value={data.users}/><DataRow label="Portfolio" value={data.portfolios}/><DataRow label="Báo cáo cần quản lý" value={data.reports}/></div></div></article><article className="quick-panel"><header><span className="section-kicker">Truy cập nhanh</span><h2>Khu vực thường dùng</h2></header><div className="quick-links"><QuickLink to="/resources/accounts" icon="users" title="Tài khoản" text="Khóa, xác minh và quản lý truy cập"/><QuickLink to="/resources/reports" icon="operations" title="Báo cáo" text="Kiểm duyệt nội dung bị báo cáo"/><QuickLink to="/admin/withdrawals" icon="finance" title="Yêu cầu rút tiền" text="Theo dõi quy trình thanh toán"/><QuickLink to="/resources/auditlogs" icon="system" title="Nhật ký hệ thống" text="Kiểm tra hoạt động quản trị"/></div></article></section>
  </>;
}

function DataRow({ label, value }: { label: string; value: number }) { return <div><span>{label}</span><strong>{value.toLocaleString('vi-VN')}</strong></div>; }
function QuickLink({ to, icon, title, text }: { to: string; icon: string; title: string; text: string }) { return <Link to={to}><span className="quick-icon"><AppIcon name={icon}/></span><span><strong>{title}</strong><small>{text}</small></span><AppIcon name="chevron" className="quick-arrow"/></Link>; }
function compactNumber(value: number) { return new Intl.NumberFormat('vi-VN', { notation: 'compact', maximumFractionDigits: 1 }).format(value); }
function formatVnd(value:number){return new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND',maximumFractionDigits:0}).format(value)}
