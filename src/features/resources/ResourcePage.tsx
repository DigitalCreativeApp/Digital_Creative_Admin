import { useEffect, useState, type FormEvent } from 'react';
import { Link, useOutletContext, useParams, useSearchParams } from 'react-router-dom';
import { adminService } from '../../services/admin.service';
import type { AdminPage, AdminResource } from '../../types/admin.types';
import { DataValue } from '../../components/DataValue';
import { EmptyState, ErrorState, LoadingState } from '../../components/AsyncState';
import { downloadCsv, toCsv } from '../../utils/csv';
import { RecordEditor } from '../../components/RecordEditor';
import { fieldLabel, resourceLabel } from '../../config/admin-i18n';

export function ResourcePage() {
  const { key = '' } = useParams();
  const { resources } = useOutletContext<{ resources: AdminResource[] }>();
  const resource = resources.find(x => x.key === key);
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number(params.get('page')) || 1);
  const pageSize = [10, 25, 50, 100].includes(Number(params.get('pageSize'))) ? Number(params.get('pageSize')) : 25;
  const search = params.get('search') || '';
  const deleted = params.get('deleted') || 'all';
  const sort = params.get('sort') || '';
  const descending = params.get('descending') !== 'false';
  const [draft, setDraft] = useState(search);
  const [data, setData] = useState<AdminPage>();
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [creating, setCreating] = useState(false);

  const updateParams = (values: Record<string, string>) => setParams(Object.fromEntries(Object.entries({ search, deleted, sort, descending: String(descending), pageSize: String(pageSize), ...values }).filter(([, value]) => value && value !== 'all')));
  const load = () => { setData(undefined); setError(''); setSelected([]); adminService.page(key, page, pageSize, search, deleted, sort, descending).then(setData).catch(e => setError(e.message)); };
  useEffect(load, [key, page, pageSize, search, deleted, sort, descending]);
  useEffect(() => setDraft(search), [search]);
  const columns = resource?.fields.slice(0, 8) || [];
  const ids = data?.items.map(row => String(row[resource?.keyField || 'Id'])) || [];
  const submit = (event: FormEvent) => { event.preventDefault(); updateParams({ search: draft, page: '1' }); };
  async function bulk(action: 'soft-delete' | 'restore') { if (!selected.length || !confirm(`${action === 'restore' ? 'Khôi phục' : 'Xóa mềm'} ${selected.length} bản ghi?`)) return; setBusy(true); setNotice(''); try { const result = await adminService.bulk(key, action, selected); setNotice(`Thành công ${result.succeeded}/${result.requested} bản ghi.`); load(); } catch (e) { setError(e instanceof Error ? e.message : 'Thao tác thất bại.'); } finally { setBusy(false); } }
  function exportPage() { if (!data || !resource) return; const names = resource.fields.map(x => x.name); downloadCsv(`${key}-page-${page}.csv`, toCsv(data.items, names)); }
  async function create(values: Record<string, unknown>) { setBusy(true); setError(''); try { const payload=key==='campaigns'?{Title:`Campaign-${Date.now()}`,...values}:values;await adminService.create(key, payload); setCreating(false); setNotice('Đã tạo bản ghi mới.'); load(); } catch (e) { setError(e instanceof Error ? e.message : 'Không thể tạo bản ghi.'); } finally { setBusy(false); } }

  return <>
    <div className="page-title"><div><p>QUẢN LÝ</p><h1>{resourceLabel(key, resource?.name)}</h1></div><div className="actions">{resource?.canCreate && <button onClick={() => setCreating(x => !x)}>{creating ? 'Đóng biểu mẫu' : '+ Tạo mới'}</button>}<span>{data ? `${data.total.toLocaleString('vi-VN')} mục` : resource?.table}</span></div></div>
    {creating && resource && <div className="create-panel"><h2>Tạo {resourceLabel(key, resource.name).toLowerCase()}</h2><RecordEditor resource={resource} data={{}} busy={busy} onSave={create} onCancel={() => setCreating(false)}/></div>}
    <form className="toolbar" onSubmit={submit}><input type="search" value={draft} onChange={e => setDraft(e.target.value)} placeholder="Tìm trong các trường văn bản…"/><button>Tìm kiếm</button><select aria-label="Lọc dữ liệu đã xóa" value={deleted} onChange={e => updateParams({ deleted: e.target.value, page: '1' })}><option value="all">Tất cả</option><option value="active">Đang hoạt động</option><option value="deleted">Đã xóa mềm</option></select><select aria-label="Số dòng" value={pageSize} onChange={e => updateParams({ pageSize: e.target.value, page: '1' })}>{[10,25,50,100].map(x => <option key={x} value={x}>{x} dòng</option>)}</select><button type="button" className="quiet" onClick={exportPage}>Xuất CSV</button></form>
    {selected.length > 0 && resource?.canSoftDelete && <div className="bulk"><strong>Đã chọn {selected.length}</strong><button disabled={busy} className="danger" onClick={() => void bulk('soft-delete')}>Xóa mềm</button><button disabled={busy} onClick={() => void bulk('restore')}>Khôi phục</button><button className="quiet" onClick={() => setSelected([])}>Bỏ chọn</button></div>}
    {notice && <p className="notice" role="status">{notice}</p>}
    {error ? <ErrorState message={error} retry={load} /> : !data ? <LoadingState /> : data.items.length === 0 ? <EmptyState message="Không có dữ liệu phù hợp." /> : <div className="table-wrap"><table><thead><tr><th><input type="checkbox" aria-label="Chọn tất cả" checked={ids.length > 0 && ids.every(x => selected.includes(x))} onChange={e => setSelected(e.target.checked ? ids : [])}/></th>{columns.map(field => <th key={field.name}><button className="sort" onClick={() => updateParams({ sort: field.name, descending: sort === field.name ? String(!descending) : 'true' })}>{fieldLabel(field.name)}{sort === field.name ? descending ? ' ↓' : ' ↑' : ''}</button></th>)}<th /></tr></thead><tbody>{data.items.map((row, index) => { const id = String(row[resource?.keyField || 'Id'] ?? index); return <tr key={id}><td><input type="checkbox" aria-label={`Chọn ${id}`} checked={selected.includes(id)} onChange={e => setSelected(values => e.target.checked ? [...values, id] : values.filter(x => x !== id))}/></td>{columns.map(field => <td key={field.name}><DataValue value={row[field.name]} /></td>)}<td><Link className="row-link" to={`/resources/${key}/${id}`}>Chi tiết →</Link></td></tr>; })}</tbody></table></div>}
    {data && <div className="pagination"><button disabled={page <= 1} onClick={() => updateParams({ page: String(page - 1) })}>← Trước</button><span>Trang {page} / {Math.max(1, Math.ceil(data.total / data.pageSize))}</span><button disabled={page * data.pageSize >= data.total} onClick={() => updateParams({ page: String(page + 1) })}>Sau →</button></div>}
  </>;
}
