import { useEffect, useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import { DataValue } from '../../components/DataValue';
import { ErrorState, LoadingState } from '../../components/AsyncState';
import { RecordEditor } from '../../components/RecordEditor';
import { fieldLabel, resourceLabel } from '../../config/admin-i18n';
import { adminRecordPath, adminResourcePath } from '../../routes/admin-navigation';
import { adminService } from '../../services/admin.service';
import type { AdminOverview, AdminRecord, AdminResource } from '../../types/admin.types';
import { fieldGroup, recordDisplayName, type FieldGroup } from '../../utils/field-presentation';

const groupPresentation: Record<FieldGroup, { title: string; description: string }> = {
  primary: { title: 'Thông tin chính', description: 'Các dữ liệu quan trọng để nhận biết và quản lý bản ghi.' },
  media: { title: 'Hình ảnh và tệp', description: 'Nội dung trực quan đang được liên kết với bản ghi.' },
  content: { title: 'Nội dung', description: 'Mô tả và nội dung chi tiết do người dùng cung cấp.' },
  status: { title: 'Trạng thái', description: 'Tình trạng hoạt động và các thuộc tính kiểm soát.' },
  system: { title: 'Thông tin hệ thống', description: 'Mã định danh và thời gian kỹ thuật, chỉ dùng khi cần đối soát.' },
};

export function RecordPage() {
  const { key = '', id = '' } = useParams();
  const { resources } = useOutletContext<{ resources: AdminResource[] }>();
  const resource = resources.find(item => item.key === key);
  const [record, setRecord] = useState<AdminRecord>();
  const [overview, setOverview] = useState<AdminOverview>();
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);

  const load = async () => {
    setError('');
    try {
      const [item, relations] = await Promise.all([adminService.record(key, id), adminService.overview(key, id)]);
      setRecord(item);
      setOverview(relations);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không tải được dữ liệu.');
    }
  };

  useEffect(() => { void load(); }, [key, id]);

  async function action(kind: 'delete' | 'restore') {
    const message = kind === 'restore' ? 'Khôi phục dữ liệu này?' : 'Xóa mềm dữ liệu này? Dữ liệu vẫn được giữ để có thể khôi phục.';
    if (!resource?.canSoftDelete || !confirm(message)) return;
    setBusy(true);
    try {
      kind === 'restore' ? await adminService.restore(key, id) : await adminService.softDelete(key, id);
      setNotice(kind === 'restore' ? 'Đã khôi phục dữ liệu.' : 'Đã xóa mềm dữ liệu.');
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể thực hiện thao tác.');
    } finally {
      setBusy(false);
    }
  }

  async function save(values: Record<string, unknown>) {
    if (!Object.keys(values).length) { setEditing(false); return; }
    setBusy(true);
    try {
      setRecord(await adminService.update(key, id, values));
      setEditing(false);
      setNotice('Đã cập nhật dữ liệu.');
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể cập nhật dữ liệu.');
    } finally {
      setBusy(false);
    }
  }

  if (error) return <ErrorState message={error} retry={() => void load()}/>;
  if (!record || !resource || !overview) return <LoadingState/>;

  const isDeleted = Boolean(record.data.DeletedAt);
  const title = resourceLabel(key, resource.name);
  const heading = recordDisplayName(record.data, title);
  const activityCount = overview.sections.reduce((sum, section) => sum + section.total, 0);

  return <div className="admin-page record-page">
    <Link className="record-back" to={adminResourcePath(key)}>← Quay lại danh sách {title.toLowerCase()}</Link>
    <header className="admin-page-header record-page-header">
      <div className="admin-page-intro"><span className="section-kicker">{title} / Chi tiết</span><h1>{heading}</h1><p>Kiểm tra thông tin, trạng thái và hoạt động liên quan của bản ghi.</p></div>
      <div className="admin-page-actions">{resource.canEdit && !isDeleted ? <button type="button" className={editing ? 'secondary-button' : 'primary-button'} onClick={() => setEditing(value => !value)}>{editing ? 'Đóng chỉnh sửa' : 'Chỉnh sửa'}</button> : null}{resource.canRestore && isDeleted ? <button disabled={busy} className="primary-button" onClick={() => void action('restore')}>Khôi phục</button> : resource.canSoftDelete ? <button className="danger-button" disabled={busy} onClick={() => void action('delete')}>Xóa mềm</button> : null}</div>
    </header>

    {notice ? <p className="notice" role="status">{notice}</p> : null}
    {editing ? <section className="edit-panel"><header><div><span className="section-kicker">Chỉnh sửa</span><h2>Cập nhật {title.toLowerCase()}</h2></div><p>Chỉ các trường được phép quản trị mới xuất hiện bên dưới.</p></header><RecordEditor resource={resource} data={record.data} busy={busy} onSave={save} onCancel={() => setEditing(false)}/></section> : <RecordDetails data={record.data}/>}

    <section className="related-area">
      <div className="section-heading"><div><span className="section-kicker">Dữ liệu liên quan</span><h2>Hoạt động và liên kết</h2><p>Mở từng nhóm để kiểm tra dữ liệu phát sinh từ bản ghi này.</p></div><span className="result-count"><strong>{activityCount.toLocaleString('vi-VN')}</strong> mục</span></div>
      {overview.sections.length === 0 ? <div className="related-empty"><strong>Chưa có hoạt động liên quan</strong><span>Dữ liệu mới sẽ xuất hiện tại đây khi có phát sinh.</span></div> : overview.sections.map(section => <RelatedSection key={section.resource} section={section} resources={resources}/>)}
    </section>
  </div>;
}

function RecordDetails({ data }: { data: Record<string, unknown> }) {
  const groups = Object.entries(data).reduce((result, [name, value]) => {
    const group = fieldGroup(name);
    (result[group] ??= []).push([name, value]);
    return result;
  }, {} as Partial<Record<FieldGroup, [string, unknown][]>>);

  const mainGroups = (['primary', 'status', 'media', 'content'] as FieldGroup[]).filter(group => groups[group]?.length);
  return <div className="record-detail-layout">
    <div className="record-sections">{mainGroups.map(group => <RecordSection group={group} items={groups[group]!} key={group}/>)}</div>
    {groups.system?.length ? <details className="system-metadata"><summary><div><strong>Thông tin kỹ thuật</strong><span>Mã định danh và dấu thời gian hệ thống</span></div><small>{groups.system.length} trường</small></summary><dl className="record">{groups.system.map(([name, value]) => <div key={name}><dt>{fieldLabel(name)}</dt><dd><DataValue value={value} fieldName={name}/></dd></div>)}</dl></details> : null}
  </div>;
}

function RecordSection({ group, items }: { group: FieldGroup; items: [string, unknown][] }) {
  const presentation = groupPresentation[group];
  return <section className={`record-section ${group}`}><header><div><h2>{presentation.title}</h2><p>{presentation.description}</p></div><span>{items.length} trường</span></header><dl className="record">{items.map(([name, value]) => <div key={name}><dt>{fieldLabel(name)}</dt><dd><DataValue value={value} fieldName={name} expanded={group === 'media'}/></dd></div>)}</dl></section>;
}

function RelatedSection({ section, resources }: { section: AdminOverview['sections'][number]; resources: AdminResource[] }) {
  const meta = resources.find(item => item.key === section.resource);
  const columns = meta?.fields.filter(field => section.items.some(row => row[field.name] !== null && row[field.name] !== undefined)).slice(0, 6).map(field => field.name) || Object.keys(section.items[0] || {}).slice(0, 6);
  return <details className="related-section" open={section.resource === 'conversationmembers' || section.resource === 'messages'}><summary><div><strong>{resourceLabel(section.resource, meta?.name)}</strong><small>{section.total.toLocaleString('vi-VN')} mục liên quan</small></div><span>Mở xem</span></summary><div className="table-wrap"><table><thead><tr>{columns.map(name => <th key={name}>{fieldLabel(name)}</th>)}<th/></tr></thead><tbody>{section.items.map((row, index) => {
    const rowId = String(row[meta?.keyField || 'Id'] ?? '');
    return <tr key={rowId || index}>{columns.map(name => <td key={name}><DataValue value={row[name]}/></td>)}<td>{meta && rowId ? <Link className="row-link" to={adminRecordPath(section.resource, rowId)}>Xem →</Link> : null}</td></tr>;
  })}</tbody></table></div>{section.total > section.items.length ? <Link className="related-more" to={adminResourcePath(section.resource)}>Xem tất cả {section.total.toLocaleString('vi-VN')} mục →</Link> : null}</details>;
}
