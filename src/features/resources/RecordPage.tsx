import { useEffect, useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import { adminService } from '../../services/admin.service';
import type { AdminRecord, AdminResource } from '../../types/admin.types';
import { DataValue } from '../../components/DataValue';
import { ErrorState, LoadingState } from '../../components/AsyncState';
import { RecordEditor } from '../../components/RecordEditor';

export function RecordPage() {
  const { key = '', id = '' } = useParams();
  const { resources } = useOutletContext<{ resources: AdminResource[] }>();
  const resource = resources.find(x => x.key === key);
  const [record, setRecord] = useState<AdminRecord>(); const [error, setError] = useState(''); const [notice, setNotice] = useState(''); const [busy, setBusy] = useState(false); const [editing, setEditing] = useState(false);
  const load = async () => { setError(''); try { setRecord(await adminService.record(key, id)); } catch (e) { setError(e instanceof Error ? e.message : 'Không tải được dữ liệu.'); } };
  useEffect(() => { void load(); }, [key, id]);
  async function action(kind: 'delete' | 'restore') { if (!resource?.canSoftDelete || !confirm(kind === 'restore' ? 'Khôi phục bản ghi này?' : 'Xóa mềm bản ghi này? Dữ liệu vẫn được giữ trong DB.')) return; setBusy(true); try { kind === 'restore' ? await adminService.restore(key, id) : await adminService.softDelete(key, id); setNotice(kind === 'restore' ? 'Đã khôi phục bản ghi.' : 'Đã xóa mềm bản ghi.'); await load(); } catch (e) { setError(e instanceof Error ? e.message : 'Thao tác thất bại.'); } finally { setBusy(false); } }
  async function save(values: Record<string, unknown>) { if (!Object.keys(values).length) { setEditing(false); return; } setBusy(true); try { setRecord(await adminService.update(key, id, values)); setEditing(false); setNotice('Đã cập nhật dữ liệu.'); } catch (e) { setError(e instanceof Error ? e.message : 'Không thể cập nhật.'); } finally { setBusy(false); } }
  if (error) return <ErrorState message={error} retry={() => void load()} />; if (!record || !resource) return <LoadingState />;
  const isDeleted = Boolean(record.data.DeletedAt);
  return <><div className="page-title"><div><p><Link to={`/resources/${key}`}>← {resource.name}</Link></p><h1>Chi tiết bản ghi</h1></div><div className="actions">{resource.canEdit && !isDeleted && <button onClick={() => setEditing(x => !x)}>{editing ? 'Đóng biểu mẫu' : 'Chỉnh sửa'}</button>}{resource.canRestore && isDeleted ? <button disabled={busy} onClick={() => void action('restore')}>Khôi phục</button> : resource.canSoftDelete && <button className="danger" disabled={busy} onClick={() => void action('delete')}>Xóa mềm</button>}</div></div>{notice && <p className="notice" role="status">{notice}</p>}{editing ? <RecordEditor resource={resource} data={record.data} busy={busy} onSave={save} onCancel={() => setEditing(false)}/> : <dl className="record">{Object.entries(record.data).map(([name, value]) => <div key={name}><dt>{name}</dt><dd><DataValue value={value}/></dd></div>)}</dl>}</>;
}
