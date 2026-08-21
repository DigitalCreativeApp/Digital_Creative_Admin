import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ErrorState, LoadingState } from '../../components/AsyncState';
import { adminService } from '../../services/admin.service';
import type { WithdrawalFilters, WithdrawalPage, WithdrawalStatistics, WithdrawalStatus } from '../../types/admin.types';
import { formatAdminDate, formatVnd } from './withdrawal-format';
import { withdrawalStatusLabel, withdrawalStatusTone } from './withdrawal-status';

const statuses: WithdrawalStatus[] = ['PENDING','PROCESSING','COMPLETED','REJECTED','FAILED'];

export function WithdrawalListPage() {
  const [params] = useSearchParams();
  const [filters,setFilters] = useState<WithdrawalFilters>({ status: parseStatus(params.get('status')), page:1, pageSize:20 });
  const [search,setSearch] = useState('');
  const [debouncedSearch,setDebouncedSearch] = useState('');
  const [page,setPage] = useState<WithdrawalPage>();
  const [statistics,setStatistics] = useState<WithdrawalStatistics>();
  const [error,setError] = useState('');
  const [loading,setLoading] = useState(true);

  useEffect(() => { const debounce = window.setTimeout(() => setDebouncedSearch(search.trim()), 350); return () => window.clearTimeout(debounce); }, [search]);
  useEffect(() => { setFilters(current => ({ ...current, search:debouncedSearch || undefined, page:1 })); }, [debouncedSearch]);
  useEffect(() => { let active=true; setLoading(true);setError(''); Promise.all([adminService.withdrawals(filters),adminService.withdrawalStatistics()]).then(([items,stats])=>{if(active){setPage(items);setStatistics(stats)}}).catch(reason=>active&&setError(reason.message)).finally(()=>active&&setLoading(false));return()=>{active=false}}, [filters]);

  const setFilter = <K extends keyof WithdrawalFilters>(key:K,value:WithdrawalFilters[K]) => setFilters(current=>({...current,[key]:value,page:key==='page'?Number(value):1}));
  if (loading && !page) return <LoadingState variant="dashboard"/>;
  if (error && !page) return <ErrorState message={error} retry={()=>setFilters(current=>({...current}))}/>;
  return <div className="withdrawals-page">
    <header className="withdrawal-heading"><div><span className="eyebrow">Tài chính / Đối soát</span><h1>Yêu cầu rút tiền</h1><p>Kiểm soát các khoản chờ rút, tiếp nhận xử lý và đối soát chuyển khoản.</p></div><span className="withdrawal-live">{page?.total.toLocaleString('vi-VN') ?? 0} yêu cầu</span></header>
    {statistics?<Statistics data={statistics}/>:null}
    <section className="withdrawal-filters" aria-label="Bộ lọc yêu cầu rút tiền">
      <div className="withdrawal-tabs"><button className={!filters.status?'active':''} onClick={()=>setFilter('status',undefined)}>Tất cả</button>{statuses.map(status=><button className={filters.status===status?'active':''} key={status} onClick={()=>setFilter('status',status)}>{withdrawalStatusLabel[status]}</button>)}</div>
      <div className="withdrawal-filter-grid"><label className="wide"><span>Tìm kiếm</span><input placeholder="Mã yêu cầu, Creative, email, STK, mã giao dịch…" value={search} onChange={event=>setSearch(event.target.value)}/></label><Field label="Từ ngày" type="date" value={filters.fromDate??''} onChange={value=>setFilter('fromDate',value||undefined)}/><Field label="Đến ngày" type="date" value={filters.toDate??''} onChange={value=>setFilter('toDate',value||undefined)}/><Field label="Số tiền từ" type="number" value={filters.minAmount??''} onChange={value=>setFilter('minAmount',value||undefined)}/><Field label="Số tiền đến" type="number" value={filters.maxAmount??''} onChange={value=>setFilter('maxAmount',value||undefined)}/><Field label="Mã ngân hàng" value={filters.bankCode??''} onChange={value=>setFilter('bankCode',value||undefined)}/><button className="clear-filter" onClick={()=>{setSearch('');setFilters({page:1,pageSize:20})}}>Xóa bộ lọc</button></div>
    </section>
    {error?<div className="withdrawal-toast error" role="alert">{error}</div>:null}
    {page?.items.length?<><div className="withdrawal-table-wrap"><table className="withdrawal-table"><thead><tr><th>Mã yêu cầu</th><th>Creative</th><th>Số tiền</th><th>Phí</th><th>Thực nhận</th><th>Ngân hàng</th><th>STK</th><th>Trạng thái</th><th>Ngày yêu cầu</th><th>Người xử lý</th><th/></tr></thead><tbody>{page.items.map(item=><tr key={item.id}><td><strong>{item.withdrawalCode}</strong>{item.requiresManualReview?<small className="review-flag">Cần đối soát</small>:null}</td><td><span>{item.creativeName}</span><small>{item.email}</small></td><td>{formatVnd(item.amount)}</td><td>{formatVnd(item.fee)}</td><td><strong>{formatVnd(item.netAmount)}</strong></td><td>{item.bankName}<small>{item.bankCode}</small></td><td>{item.maskedAccountNumber}</td><td><span className={`withdrawal-badge ${withdrawalStatusTone[item.status]}`}>{withdrawalStatusLabel[item.status]}</span></td><td>{formatAdminDate(item.requestedAt)}</td><td>{item.processor??'—'}</td><td><Link className="view-withdrawal" to={`/admin/withdrawals/${item.id}`}>Xem</Link></td></tr>)}</tbody></table></div><div className="withdrawal-pagination"><span>Trang {page.page} · {page.total.toLocaleString('vi-VN')} kết quả</span><button disabled={page.page<=1} onClick={()=>setFilter('page',page.page-1)}>Trước</button><button disabled={page.page*page.pageSize>=page.total} onClick={()=>setFilter('page',page.page+1)}>Sau</button></div></>:<div className="withdrawal-empty"><strong>Chưa có yêu cầu phù hợp</strong><span>Thử thay đổi trạng thái hoặc bộ lọc tìm kiếm.</span></div>}
  </div>;
}

function Statistics({data}:{data:WithdrawalStatistics}){const items=[['Chờ xử lý',data.pending],['Đang xử lý',data.processing],['Hoàn thành',data.completed],['Bị từ chối',data.rejected],['Thất bại',data.failed],['Tổng tiền đang chờ rút',formatVnd(data.pendingAmount)],['Tổng tiền đã rút',formatVnd(data.completedAmount)]];return <section className="withdrawal-statistics">{items.map(([label,value],index)=><article className={index>4?'money':''} key={String(label)}><span>{label}</span><strong>{typeof value==='number'?value.toLocaleString('vi-VN'):value}</strong></article>)}</section>}
function Field({label,onChange,type='text',value}:{label:string;onChange(value:string):void;type?:string;value:string}){return <label><span>{label}</span><input type={type} value={value} onChange={event=>onChange(event.target.value)}/></label>}
function parseStatus(value:string|null):WithdrawalStatus|undefined{return statuses.includes(value?.toUpperCase() as WithdrawalStatus)?value!.toUpperCase() as WithdrawalStatus:undefined}
