import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ErrorState, LoadingState } from '../../components/AsyncState';
import { adminService } from '../../services/admin.service';
import type { DisputeCategory, DisputeFilters, DisputePage, DisputeStatus } from '../../types/admin.types';
import { activeDisputeStatuses, disputeCategoryLabel, disputeStatusLabel, disputeStatusTone, formatDate, formatVnd } from './dispute-presentation';

const statuses: DisputeStatus[] = ['AWAITING_RESPONSE','NEGOTIATING','ESCALATED','AWAITING_EVIDENCE','RESOLVED'];
const categories = Object.keys(disputeCategoryLabel) as DisputeCategory[];

export function DisputeListPage() {
  const [filters,setFilters] = useState<DisputeFilters>({page:1,pageSize:20,active:true});
  const [search,setSearch] = useState('');
  const [page,setPage] = useState<DisputePage|null>(null);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState('');
  const load = useCallback(() => {
    setLoading(true); setError('');
    adminService.disputes(filters).then(setPage).catch(cause => setError(cause.message)).finally(() => setLoading(false));
  },[filters]);
  useEffect(load,[load]);
  function update<K extends keyof DisputeFilters>(key:K,value:DisputeFilters[K]) { setFilters(current => ({...current,[key]:value,page:1})); }
  function submit(event:React.FormEvent) { event.preventDefault(); update('search',search.trim() || undefined); }
  if (loading && !page) return <LoadingState/>;
  if (error && !page) return <ErrorState message={error} retry={load}/>;
  return <div className="dispute-page">
    <header className="dispute-heading"><div><span className="eyebrow">Công việc / Kiểm soát rủi ro</span><h1>Tranh chấp công việc</h1><p>Khoản tiền đang tranh chấp được giữ nguyên đến khi hai bên thống nhất hoặc quản trị viên ra quyết định.</p></div><span className="dispute-count">{page?.total.toLocaleString('vi-VN') ?? 0} hồ sơ</span></header>
    <section className="dispute-filters" aria-label="Bộ lọc tranh chấp">
      <div className="dispute-tabs"><button className={filters.active === true ? 'active':''} onClick={() => update('active',true)}>Đang xử lý</button><button className={filters.active === undefined ? 'active':''} onClick={() => update('active',undefined)}>Tất cả</button>{statuses.map(status => <button className={filters.status === status ? 'active':''} key={status} onClick={() => { update('status',status); }}>{disputeStatusLabel[status]}</button>)}</div>
      <form className="dispute-filter-row" onSubmit={submit}><label><span>Tìm dự án, công việc hoặc người dùng</span><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tên công việc, người thuê, nhà sáng tạo…"/></label><label><span>Loại tranh chấp</span><select value={filters.category ?? ''} onChange={e => update('category',(e.target.value || undefined) as DisputeCategory|undefined)}><option value="">Tất cả loại</option>{categories.map(x => <option key={x} value={x}>{disputeCategoryLabel[x]}</option>)}</select></label><button type="submit">Áp dụng</button><button type="button" className="ghost" onClick={() => {setSearch('');setFilters({page:1,pageSize:20,active:true});}}>Xóa lọc</button></form>
    </section>
    {error ? <div className="dispute-alert" role="alert">{error}</div>:null}
    {page?.items.length ? <><div className="dispute-table-wrap"><table className="dispute-table"><thead><tr><th>Hồ sơ</th><th>Công việc</th><th>Hai bên</th><th>Tiền đang giữ</th><th>Loại</th><th>Trạng thái</th><th>Mở lúc</th><th/></tr></thead><tbody>{page.items.map(item => <tr key={item.id}><td><strong>{item.code}</strong>{activeDisputeStatuses.has(item.status) ? <small>Đang khóa tiền</small>:null}</td><td><strong>{item.workOrderTitle}</strong><small>{item.projectId ? `Dự án ${item.projectId.slice(0,8)}`:'Công việc trực tiếp'}</small></td><td><span>{item.buyerName}</span><small>↔ {item.creativeName}</small></td><td className="money">{formatVnd(item.heldAmount)}</td><td>{disputeCategoryLabel[item.category]}</td><td><span className={`dispute-badge ${disputeStatusTone(item.status)}`}>{disputeStatusLabel[item.status]}</span></td><td>{formatDate(item.openedAt)}</td><td><Link to={`/admin/disputes/${item.id}`}>Xem xét →</Link></td></tr>)}</tbody></table></div><div className="dispute-pagination"><span>Trang {page.page} · {page.total.toLocaleString('vi-VN')} kết quả</span><button disabled={page.page <= 1} onClick={() => setFilters(x => ({...x,page:x.page-1}))}>Trước</button><button disabled={page.page*page.pageSize >= page.total} onClick={() => setFilters(x => ({...x,page:x.page+1}))}>Sau</button></div></>:<div className="dispute-empty"><strong>Không có tranh chấp phù hợp</strong><span>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</span></div>}
  </div>;
}
