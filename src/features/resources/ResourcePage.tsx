import { useEffect, useState, type FormEvent } from 'react';
import { Link, useOutletContext, useParams, useSearchParams } from 'react-router-dom';
import { AppIcon } from '../../components/AppIcon';
import { DataValue } from '../../components/DataValue';
import { EmptyState, ErrorState, LoadingState } from '../../components/AsyncState';
import { RecordEditor } from '../../components/RecordEditor';
import { fieldLabel, resourceLabel } from '../../config/admin-i18n';
import { adminRecordPath } from '../../routes/admin-navigation';
import { adminService } from '../../services/admin.service';
import type { AdminPage, AdminResource } from '../../types/admin.types';
import { downloadCsv, toCsv } from '../../utils/csv';

export function ResourcePage() {
  const { key = '' } = useParams();
  const { resources } = useOutletContext<{ resources: AdminResource[] }>();
  const resource = resources.find(item => item.key === key);
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

  const updateParams = (values: Record<string, string>) => setParams(Object.fromEntries(
    Object.entries({ search, deleted, sort, descending: String(descending), pageSize: String(pageSize), ...values })
      .filter(([, value]) => value && value !== 'all'),
  ));
  const load = () => {
    setData(undefined);
    setError('');
    setSelected([]);
    adminService.page(key, page, pageSize, search, deleted, sort, descending).then(setData).catch(cause => setError(cause.message));
  };

  useEffect(load, [key, page, pageSize, search, deleted, sort, descending]);
  useEffect(() => setDraft(search), [search]);

  const columns = resource?.fields.slice(0, 8) || [];
  const ids = data?.items.map(row => String(row[resource?.keyField || 'Id'])) || [];
  const title = resourceLabel(key, resource?.name);
  const submit = (event: FormEvent) => { event.preventDefault(); updateParams({ search: draft, page: '1' }); };

  async function bulk(action: 'soft-delete' | 'restore') {
    if (!selected.length || !confirm(`${action === 'restore' ? 'Khôi phục' : 'Xóa mềm'} ${selected.length} bản ghi?`)) return;
    setBusy(true);
    setNotice('');
    try {
      const result = await adminService.bulk(key, action, selected);
      setNotice(`Đã xử lý thành công ${result.succeeded}/${result.requested} bản ghi.`);
      load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể thực hiện thao tác.');
    } finally {
      setBusy(false);
    }
  }

  function exportPage() {
    if (!data || !resource) return;
    downloadCsv(`${key}-page-${page}.csv`, toCsv(data.items, resource.fields.map(field => field.name)));
  }

  async function create(values: Record<string, unknown>) {
    setBusy(true);
    setError('');
    try {
      await adminService.create(key, values);
      setCreating(false);
      setNotice('Đã tạo bản ghi mới.');
      load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể tạo bản ghi.');
    } finally {
      setBusy(false);
    }
  }

  return <div className="admin-page resource-page">
    <header className="admin-page-header">
      <div className="admin-page-intro"><span className="section-kicker">Quản lý dữ liệu</span><h1>{title}</h1><p>Tìm kiếm, kiểm tra và cập nhật {title.toLowerCase()} trong hệ thống.</p></div>
      <div className="admin-page-actions"><span className="result-count"><strong>{data?.total.toLocaleString('vi-VN') ?? '—'}</strong> bản ghi</span>{resource?.canCreate ? <button type="button" className="primary-button" onClick={() => setCreating(value => !value)}><AppIcon name={creating ? 'collapse' : 'plus'}/>{creating ? 'Đóng biểu mẫu' : 'Tạo mới'}</button> : null}</div>
    </header>

    {creating && resource ? <section className="create-panel"><header><div><span className="section-kicker">Bản ghi mới</span><h2>Tạo {title.toLowerCase()}</h2></div><p>Điền các trường bắt buộc rồi lưu để thêm vào hệ thống.</p></header><RecordEditor resource={resource} data={{}} busy={busy} onSave={create} onCancel={() => setCreating(false)}/></section> : null}

    <form className="resource-toolbar" onSubmit={submit}>
      <label className="resource-search"><span>Tìm kiếm</span><div><AppIcon name="search"/><input type="search" value={draft} onChange={event => setDraft(event.target.value)} placeholder="Nhập từ khóa cần tìm…"/><button type="submit">Tìm</button></div></label>
      <label><span>Trạng thái dữ liệu</span><select value={deleted} onChange={event => updateParams({ deleted: event.target.value, page: '1' })}><option value="all">Tất cả</option><option value="active">Đang hoạt động</option><option value="deleted">Đã xóa mềm</option></select></label>
      <label><span>Hiển thị</span><select value={pageSize} onChange={event => updateParams({ pageSize: event.target.value, page: '1' })}>{[10, 25, 50, 100].map(size => <option key={size} value={size}>{size} dòng</option>)}</select></label>
      <button type="button" className="secondary-button export-button" onClick={exportPage}>Xuất CSV</button>
    </form>

    {selected.length > 0 && resource?.canSoftDelete ? <div className="bulk" role="status"><strong>Đã chọn {selected.length} bản ghi</strong><div><button disabled={busy} className="danger" onClick={() => void bulk('soft-delete')}>Xóa mềm</button><button disabled={busy} onClick={() => void bulk('restore')}>Khôi phục</button><button className="quiet" onClick={() => setSelected([])}>Bỏ chọn</button></div></div> : null}
    {notice ? <p className="notice" role="status">{notice}</p> : null}

    {error ? <ErrorState message={error} retry={load}/> : !data ? <LoadingState/> : data.items.length === 0 ? <EmptyState title="Không tìm thấy dữ liệu" message="Thử thay đổi từ khóa hoặc bộ lọc rồi tìm lại."/> : <div className="resource-table-card">
      <div className="table-summary"><div><strong>{title}</strong><span>Trang {page} · {data.items.length} trên {data.total.toLocaleString('vi-VN')} bản ghi</span></div><span>Chọn một dòng để xem đầy đủ thông tin</span></div>
      <div className="table-wrap"><table className="resource-table"><thead><tr><th className="select-column"><input type="checkbox" aria-label="Chọn tất cả" checked={ids.length > 0 && ids.every(id => selected.includes(id))} onChange={event => setSelected(event.target.checked ? ids : [])}/></th>{columns.map(field => <th key={field.name}><button type="button" className="sort" onClick={() => updateParams({ sort: field.name, descending: sort === field.name ? String(!descending) : 'true' })}>{fieldLabel(field.name)}{sort === field.name ? descending ? ' ↓' : ' ↑' : ''}</button></th>)}<th className="row-action-column"/></tr></thead><tbody>{data.items.map((row, index) => {
        const id = String(row[resource?.keyField || 'Id'] ?? index);
        return <tr key={id}><td className="select-column"><input type="checkbox" aria-label={`Chọn ${id}`} checked={selected.includes(id)} onChange={event => setSelected(values => event.target.checked ? [...values, id] : values.filter(value => value !== id))}/></td>{columns.map(field => <td key={field.name}><DataValue value={row[field.name]}/></td>)}<td className="row-action-column"><Link className="row-link" to={adminRecordPath(key, id)}>Xem chi tiết →</Link></td></tr>;
      })}</tbody></table></div>
    </div>}

    {data ? <nav className="pagination" aria-label="Phân trang"><button disabled={page <= 1} onClick={() => updateParams({ page: String(page - 1) })}>← Trước</button><span>Trang <strong>{page}</strong> / {Math.max(1, Math.ceil(data.total / data.pageSize))}</span><button disabled={page * data.pageSize >= data.total} onClick={() => updateParams({ page: String(page + 1) })}>Sau →</button></nav> : null}
  </div>;
}
