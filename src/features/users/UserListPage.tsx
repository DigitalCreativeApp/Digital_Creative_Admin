import { type FormEvent, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AdminDataTable, AdminPageHeader, AdminPagination, StatusBadge, type AdminColumn } from '../../components/admin/AdminUi';
import { ErrorState, LoadingState } from '../../components/AsyncState';
import { adminService } from '../../services/admin.service';
import type { AdminUserFilters, AdminUserListItem, OperationPage } from '../../types/admin.types';
import { formatAdminDateTime, formatAdminId } from '../../utils/admin-presentation';

type UserRow = AdminUserListItem & { id:string };
const roleLabels:Record<string,string> = { ADMIN:'Admin', CLIENT:'Client', CREATIVE:'Creative' };
const columns:AdminColumn<UserRow>[] = [
  { key:'identity', label:'Người dùng', render:item => <div className="ops-identity"><span className="ops-avatar">{initials(item.displayName)}</span><span><strong>{item.displayName}</strong><small>{item.email}</small></span>{item.isVerified ? <span className="ops-verified" title="Đã xác minh">✓</span> : null}</div> },
  { key:'role', label:'Vai trò', render:item => roleLabels[item.role] ?? item.role },
  { key:'status', label:'Trạng thái', render:item => <StatusBadge status={item.accountStatus}/> },
  { key:'lastLogin', label:'Đăng nhập gần nhất', render:item => formatAdminDateTime(item.lastLoginAt) },
  { key:'created', label:'Ngày tham gia', render:item => formatAdminDateTime(item.createdAt) },
  { key:'id', label:'Mã', render:item => <code>{formatAdminId(item.accountId)}</code> },
];

export function UserListPage() {
  const [params,setParams] = useSearchParams();
  const filters = readFilters(params);
  const [draft,setDraft] = useState(filters.search ?? '');
  const [data,setData] = useState<OperationPage<AdminUserListItem>>();
  const [error,setError] = useState('');
  useEffect(() => { setData(undefined);setError('');adminService.users(filters).then(setData).catch(cause => setError(cause.message)); }, [params.toString()]);
  const update = (key:string,value:string|number|undefined) => setParams(current => { const next=new URLSearchParams(current);if(value===undefined||value==='')next.delete(key);else next.set(key,String(value));if(key!=='page')next.set('page','1');return next; });
  const submit = (event:FormEvent) => { event.preventDefault();update('search',draft.trim()||undefined); };
  if (error) return <ErrorState message={error} retry={() => setParams(new URLSearchParams(params))}/>;
  return <div className="ops-list-page"><AdminPageHeader eyebrow="Marketplace / Danh tính" title="Người dùng" description="Tra cứu tài khoản cùng hồ sơ công khai, vai trò và trạng thái truy cập. Dữ liệu nhạy cảm và Notifications không được đưa vào contract này." status={<StatusBadge label={`${(data?.total ?? 0).toLocaleString('vi-VN')} tài khoản`} tone="neutral"/>}/>
    <form className="ops-filter-bar" onSubmit={submit}><label className="ops-search-field"><span>Tìm kiếm</span><input type="search" value={draft} onChange={event => setDraft(event.target.value)} placeholder="Tên, email hoặc số điện thoại…"/></label><label><span>Vai trò</span><select value={filters.role ?? ''} onChange={event => update('role',event.target.value||undefined)}><option value="">Tất cả</option><option value="CREATIVE">Creative</option><option value="CLIENT">Client</option><option value="ADMIN">Admin</option></select></label><label><span>Trạng thái</span><select value={filters.status ?? ''} onChange={event => update('status',event.target.value||undefined)}><option value="">Tất cả</option><option value="ACTIVE">Hoạt động</option><option value="INACTIVE">Chưa hoạt động</option><option value="SUSPENDED">Tạm khóa</option></select></label><button type="submit">Áp dụng</button><button className="ops-button-ghost" type="button" onClick={() => {setDraft('');setParams({});}}>Xóa lọc</button></form>
    {!data ? <LoadingState/> : <><AdminDataTable columns={columns} items={data.items.map(item => ({...item,id:item.accountId}))} rowLink={item => `/admin/users/${item.accountId}`} emptyTitle="Không tìm thấy người dùng" emptyMessage="Thử thay đổi từ khóa, vai trò hoặc trạng thái."/><AdminPagination page={data.page} pageSize={data.pageSize} total={data.total} onPage={page => update('page',page)}/></>}
  </div>;
}

function readFilters(params:URLSearchParams):AdminUserFilters { return { page:Math.max(1,Number(params.get('page'))||1),pageSize:20,search:params.get('search')||undefined,role:params.get('role')||undefined,status:params.get('status')||undefined }; }
function initials(name:string) { return name.split(' ').filter(Boolean).slice(-2).map(part => part[0]).join('').toUpperCase(); }
