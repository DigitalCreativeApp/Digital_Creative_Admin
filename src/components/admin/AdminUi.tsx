import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AppIcon } from '../AppIcon';
import { statusPresentation, type AdminStatusTone } from '../../utils/admin-presentation';

export function AdminPageHeader({ eyebrow, title, description, actions, status }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode; status?: ReactNode }) {
  return <header className="ops-page-header"><div className="ops-page-heading">{eyebrow ? <span className="ops-eyebrow">{eyebrow}</span> : null}<div className="ops-title-line"><h1>{title}</h1>{status}</div>{description ? <p>{description}</p> : null}</div>{actions ? <div className="ops-page-actions">{actions}</div> : null}</header>;
}

export function StatusBadge({ status, label, tone }: { status?: string | null; label?: string; tone?: AdminStatusTone }) {
  const presentation = statusPresentation(status);
  return <span className={`ops-status ops-status--${tone ?? presentation.tone}`}><span aria-hidden="true"/>{label ?? presentation.label}</span>;
}

export function KpiCard({ label, value, helper, tone = 'neutral', to }: { label: string; value: ReactNode; helper?: string; tone?: AdminStatusTone; to?: string }) {
  const body = <><span className="ops-kpi-label">{label}</span><strong>{value}</strong>{helper ? <small>{helper}</small> : null}{to ? <span className="ops-kpi-link">Mở danh sách <AppIcon name="arrowRight"/></span> : null}</>;
  return to ? <Link className={`ops-kpi ops-kpi--${tone}`} to={to}>{body}</Link> : <article className={`ops-kpi ops-kpi--${tone}`}>{body}</article>;
}

export type AdminColumn<T> = { key: string; label: string; className?: string; render: (item: T) => ReactNode };

export function AdminDataTable<T extends { id: string }>({ columns, items, emptyTitle = 'Chưa có dữ liệu', emptyMessage = 'Không có bản ghi phù hợp với bộ lọc hiện tại.', rowLink }: { columns: AdminColumn<T>[]; items: T[]; emptyTitle?: string; emptyMessage?: string; rowLink?: (item: T) => string }) {
  if (!items.length) return <div className="ops-empty" role="status"><span aria-hidden="true">—</span><h2>{emptyTitle}</h2><p>{emptyMessage}</p></div>;
  return <div className="ops-table-wrap"><table className="ops-table"><thead><tr>{columns.map(column => <th key={column.key} scope="col">{column.label}</th>)}{rowLink ? <th><span className="sr-only">Thao tác</span></th> : null}</tr></thead><tbody>{items.map(item => <tr key={item.id}>{columns.map(column => <td className={column.className} data-label={column.label} key={column.key}>{column.render(item)}</td>)}{rowLink ? <td className="ops-row-action" data-label="Thao tác"><Link aria-label={`Mở chi tiết ${item.id}`} to={rowLink(item)}>Chi tiết <AppIcon name="arrowRight"/></Link></td> : null}</tr>)}</tbody></table></div>;
}

export function AdminPagination({ page, pageSize, total, onPage }: { page: number; pageSize: number; total: number; onPage: (page: number) => void }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return <nav className="ops-pagination" aria-label="Phân trang"><span>Trang {page}/{totalPages} · {total.toLocaleString('vi-VN')} kết quả</span><div><button type="button" disabled={page <= 1} onClick={() => onPage(page - 1)}>Trước</button><button type="button" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>Sau</button></div></nav>;
}
